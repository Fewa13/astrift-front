// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
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
    if(url==='/game.js')body=body.toString()+`\nglobalThis.mobileQA={station(){camera.position.set(0,1.7,30)},lookTest(){adsBlend=0;const previous=yaw;mobileLook(10,0);return yaw-previous},stop(){endMatch()},rocket(){selectWeapon("meteor",{equip:false});weaponDef.remoteFuse=true;ammo=1;lastShot=-100000},start(){startTraining()},join(room){$("room").value=room;pendingRoomMode="normal";$("roomDialog").dataset.mode="join";start(true)},state(){return {id:playerId,hp,sensitivity:lookSensitivity,targetHp:trainingTargets[3]?.userData.trainingMaxHp,settingsOpen:$("trainingSettings").open,remotes:[...remotes].map(([id,r])=>({id,position:r.target.toArray()})),enabled:MOBILE_ENABLED,yaw,pitch,firing,ads:adsMouse,manual:mobileManualAim,auto:mobileFireAutoAim,ammo,slide:!!slideStartedAt,keys:{sprint:keys.ShiftLeft,forward:keys.KeyW},move:{...mobileMove},position:camera.position.toArray(),layout:JSON.parse(localStorage.getItem('astrift.touchLayout.v1')||'null'),visible:Object.fromEntries([...document.querySelectorAll('.touchButton')].map(b=>[b.dataset.action,!b.hidden])),rootHidden:document.getElementById('mobileControls')?.hidden}},editor(){openKeybindSettings()},flash(){weaponDef.phaseFlashlight=true;phaseFlashReadyAt=0},pause(){togglePause(true)},unpause(){togglePause(false)}};`;
    res.setHeader('Content-Type',/\.js$/.test(url)?'text/javascript':url.endsWith('.css')?'text/css':'text/html');res.end(body);
  }catch{res.writeHead(404).end()}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--no-first-run','--enable-unsafe-swiftshader','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1200,900','about:blank'],{stdio:['ignore','ignore','pipe']});
let ws,peer;
try{
  const debug=await new Promise((resolve,reject)=>{let log='';const timer=setTimeout(()=>reject(Error('Chrome timeout')),15000);chrome.stderr.on('data',b=>{log+=b;const match=log.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match){clearTimeout(timer);resolve(match[1])}})});
  ws=new WebSocket(debug);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  let id=0,session;const pending=new Map(),errors=[];
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(Error(m.error.message));else p.resolve(m.result)}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text)});
  const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params,...(session?{sessionId:session}:{})}))});
  const target=await call('Target.createTarget',{url:'about:blank'});session=(await call('Target.attachToTarget',{targetId:target.targetId,flatten:true})).sessionId;
  await call('Runtime.enable');await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});
  await call('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await call('Emulation.setUserAgentOverride',{userAgent:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',platform:'Android'});
  await call('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('astrift.accountSession.v1',JSON.stringify({name:'mobileqa',token:'a'.repeat(64)}));localStorage.setItem('astrift.tutorial.device.v1',JSON.stringify({done:true,owner:'mobileqa'}));localStorage.setItem('astrift.tutorial.account.v1',JSON.stringify({accounts:{mobileqa:{done:true,owner:'mobileqa'}}}));localStorage.setItem('astrift.touchLayout.v1',JSON.stringify({aim:[78,43,64]}));localStorage.setItem('astrift.knifeSkins.v1',JSON.stringify({kills:40,claimed:[null,null,'phasebreak'],active:'phasebreak'}))`});
  if(process.env.MOBILE_TEST_BACKEND)await call('Page.addScriptToEvaluateOnNewDocument',{source:`const Native=window.WebSocket;window.WebSocket=class extends Native{constructor(url,protocols){const original=new URL(url);super(original.pathname.startsWith('/api/')?${JSON.stringify(process.env.MOBILE_TEST_BACKEND)}+original.pathname:url,protocols)}}`});
  await call('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/`});
  const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value};
  let ready=false;
  for(let i=0;i<150;i++){ready=await evaluate('Boolean(globalThis.mobileQA)');if(ready)break;if(errors.length)throw Error(errors.join('\n'));await new Promise(r=>setTimeout(r,100))}
  assert(ready,'whole game must initialize');
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const point=async id=>evaluate(`(()=>{const r=document.querySelector('[data-action="${id}"]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  const touch=async(type,points)=>{await call('Input.dispatchTouchEvent',{type,touchPoints:points.map((p,i)=>({x:p.x,y:p.y,id:p.id??i,radiusX:4,radiusY:4,force:1}))});await sleep(100)};
  await evaluate('document.getElementById("enterMainWorld").click();mobileQA.start()');await sleep(500);let state=await evaluate('mobileQA.state()');assert(state.enabled&&!state.rootHidden,JSON.stringify(state));
  let fire=await point('fire');await touch('touchStart',[{...fire,id:1}]);state=await evaluate('mobileQA.state()');assert(state.firing&&!state.ads,'Default remains hip fire '+JSON.stringify(state));await touch('touchEnd',[]);
  await evaluate('mobileQA.editor()');await sleep(100);assert.equal(await evaluate('document.getElementById("touchFireAutoAim").checked'),false);await evaluate('document.getElementById("touchFireAutoAim").click();document.getElementById("touchDone").click()');await sleep(200);
  assert.equal(await evaluate('localStorage.getItem("astrift.touchFireAutoAim.v1")'),'true');fire=await point('fire');
  await touch('touchStart',[{...fire,id:2}]);state=await evaluate('mobileQA.state()');assert(state.firing&&state.ads,'Fire enables ADS');await touch('touchMove',[{x:fire.x-25,y:fire.y-10,id:2}]);const moved=await evaluate('mobileQA.state()');assert(moved.yaw!==state.yaw,'Fire drag still turns camera');await touch('touchEnd',[]);state=await evaluate('mobileQA.state()');assert(!state.firing&&!state.ads,'Release clears ADS');
  const aim=await point('aim');await touch('touchStart',[{...aim,id:3}]);assert((await evaluate('mobileQA.state()')).ads,'Manual aim touch');await touch('touchStart',[{...aim,id:3},{...fire,id:4}]);await touch('touchEnd',[{...fire,id:4}]);state=await evaluate('mobileQA.state()');assert(!state.firing&&state.ads,'Fire release preserves manual ADS '+JSON.stringify(state));await touch('touchEnd',[]);assert(!(await evaluate('mobileQA.state()')).ads);
  await touch('touchStart',[{...fire,id:5}]);await touch('touchCancel',[]);assert(!(await evaluate('mobileQA.state()')).ads,'Cancel clears ADS');
  await touch('touchStart',[{...fire,id:6}]);await evaluate('mobileQA.pause()');await sleep(200);state=await evaluate('mobileQA.state()');assert(!state.firing&&!state.ads,'Pause clears ADS');await touch('touchEnd',[]);await evaluate('mobileQA.unpause()');await sleep(200);
  await evaluate('mobileQA.editor()');assert(await evaluate('document.getElementById("touchFireAutoAim").checked'));await evaluate('document.getElementById("touchDone").click()');await sleep(150);
  console.log('PASS actual mobile touch: default hip fire; auto ADS on fire/release; firing drag; separate manual ADS; cancel/pause cleanup; saved preference.');
  assert.equal(errors.length,0);
  const screenshot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(root,'mobile-controls-preview.png'),Buffer.from(screenshot.data,'base64'));
  console.log('PASS: whole FPS client, emulated touch input, settings persistence, no browser exceptions.');
}finally{peer?.close();ws?.close();chrome.kill();server.close()}
