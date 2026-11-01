import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..'),profile=fs.mkdtempSync(path.join(os.tmpdir(),'astrift-knife-qa-'));
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost').pathname;
  try{
    let body=fs.readFileSync(path.join(root,'public',url==='/'?'index.html':url.slice(1)));
    if(url==='/game.js')body=body.toString()+`\nglobalThis.trainingQA={controls(){openKeybindSettings()},station(){paused=false;camera.position.set(0,1.7,30)},rebind(){keyBindings.interact="KeyH"},settings(){return {open:$("trainingSettings").open,paused,hp:trainingTargets[3].userData.trainingMaxHp,sensitivity:lookSensitivity}},start(){canvas.requestPointerLock=()=>Promise.resolve();startTraining();return {map:activeMapId,targets:trainingTargets.map(t=>({distance:t.userData.trainingDistance,hp:t.userData.hp,x:t.position.x,z:t.position.z})),normalHidden:!mapWorlds.get('crossroads').group.visible}},async check(){const target=trainingTargets[3];camera.position.set(target.userData.stationX,1.7,30);document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyF',bubbles:true}));const opened=$('trainingSettings').open;$('trainingHealth').value='1000';$('trainingArmor').value='heavy';$('trainingHelmet').value='fortress';$('trainingSettingsForm').requestSubmit();const body=applyBotDamage(target,51,'body'),head=applyBotDamage(target,100,'head');target.userData.hp=0;botDown(target);await new Promise(r=>setTimeout(r,1100));const reset=target.userData.hp;paused=true;return {opened,body,head,reset,visible:target.visible,closed:!$('trainingSettings').open,others:trainingTargets.filter(t=>t!==target).every(t=>t.userData.hp===100)}},view(){paused=false;camera.position.set(0,1.7,39);yaw=0;pitch=-.02}};`;
    res.setHeader('Content-Type',/\.js$/.test(url)?'text/javascript':url.endsWith('.css')?'text/css':'text/html');res.end(body);
  }catch{res.writeHead(404).end()}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--no-first-run','--enable-unsafe-swiftshader','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1200,900','about:blank'],{stdio:['ignore','ignore','pipe']});
let ws;
try{
  const debug=await new Promise((resolve,reject)=>{let log='';const timer=setTimeout(()=>reject(Error('Chrome timeout')),15000);chrome.stderr.on('data',b=>{log+=b;const match=log.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match){clearTimeout(timer);resolve(match[1])}})});
  ws=new WebSocket(debug);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  let id=0,session;const pending=new Map(),errors=[];
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(Error(m.error.message));else p.resolve(m.result)}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text)});
  const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params,...(session?{sessionId:session}:{})}))});
  const target=await call('Target.createTarget',{url:'about:blank'});session=(await call('Target.attachToTarget',{targetId:target.targetId,flatten:true})).sessionId;
  await call('Runtime.enable');await call('Page.enable');
  await call('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('astrift.knifeSkins.v1',JSON.stringify({kills:40,claimed:[null,null,'phasebreak'],active:'phasebreak'}))`});
  await call('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/`});
  const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value};
  let ready=false;
  for(let i=0;i<150;i++){ready=await evaluate('Boolean(globalThis.trainingQA)');if(ready)break;if(errors.length)throw Error(errors.join('\n'));await new Promise(r=>setTimeout(r,100))}
  assert(ready,'whole game must initialize');
  const layout=await evaluate('trainingQA.start()');assert.equal(layout.map,'training');assert(layout.normalHidden);assert.deepEqual(layout.targets.map(t=>t.distance),[1,5,10,20,30,50,100]);assert(layout.targets.every(t=>t.hp===100&&Math.abs(30-t.z-t.distance)<.001));
  const key=async(code,key=code)=>{await call('Input.dispatchKeyEvent',{type:'keyDown',code,key});await call('Input.dispatchKeyEvent',{type:'keyUp',code,key})};
  const click=async id=>{const p=await evaluate(`(()=>{const r=document.getElementById('${id}').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);await call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p})};
  await evaluate('trainingQA.station()');await key('KeyF','f');assert((await evaluate('trainingQA.settings()')).open);
  await click('trainingHealth');assert(await evaluate('document.activeElement.id==="trainingHealth"'));await call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:3,...await evaluate('(()=>{const r=document.getElementById("trainingHealth").getBoundingClientRect();return {x:r.x+r.width*.3,y:r.y+r.height/2}})()')});await call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:3,...await evaluate('(()=>{const r=document.getElementById("trainingHealth").getBoundingClientRect();return {x:r.x+r.width*.3,y:r.y+r.height/2}})()')});await call('Input.insertText',{text:'450'});assert.equal(await evaluate('document.getElementById("trainingHealth").value'),'450');
  const apply=await evaluate('(()=>{const r=document.querySelector("#trainingSettingsForm button[type=submit]").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()');await call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...apply});await call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...apply});assert.equal((await evaluate('trainingQA.settings()')).hp,450);assert(!(await evaluate('trainingQA.settings()')).open);
  await key('KeyF','f');await click('trainingSettingsClose');assert(!(await evaluate('trainingQA.settings()')).paused);
  await key('KeyF','f');await key('Escape','Escape');assert(!(await evaluate('trainingQA.settings()')).open);assert(!(await evaluate('trainingQA.settings()')).paused);
  const result=await evaluate('trainingQA.check()');assert.deepEqual(result,{opened:true,body:35,head:64,reset:1000,visible:true,closed:true,others:true});assert.equal(errors.length,0);
  await evaluate('trainingQA.station();trainingQA.rebind()');await key('KeyF','f');assert(!(await evaluate('trainingQA.settings()')).open);await key('KeyH','h');assert((await evaluate('trainingQA.settings()')).open);await click('trainingSettingsClose');
  assert.equal((await evaluate('trainingQA.settings()')).sensitivity,1);await evaluate('trainingQA.controls()');await click('lookSensitivity');assert((await evaluate('trainingQA.settings()')).sensitivity>1);assert(await evaluate('Number(localStorage.getItem("astrift.lookSensitivity.v1"))>1'));await click('closeKeybinds');
  await evaluate('trainingQA.view()');await new Promise(r=>setTimeout(r,500));
  const screenshot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(root,'training-map-preview.png'),Buffer.from(screenshot.data,'base64'));
  console.log('PASS: seven exact-distance lanes, isolated training map, F station settings, 1000HP/reset, armor/helmet computed damage, independent targets, no browser exceptions.',result);
}finally{ws?.close();chrome.kill();server.close()}
