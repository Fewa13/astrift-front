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
    if(url==='/game.js')body=body.toString()+`\nglobalThis.knifeQA={preview(){const view=new THREE.Scene();view.background=new THREE.Color(0x080e1c);const model=knifeModel.clone();model.visible=true;model.position.set(0,0,0);model.rotation.set(-.14,.25,-.38);view.add(model);view.add(new THREE.HemisphereLight(0xe6eaff,0x20345b,3));for(const [color,pos] of [[0xbbeeff,[1,2,1]],[0xb99eff,[-1,1,-1]]]){const l=new THREE.DirectionalLight(color,4);l.position.set(...pos);view.add(l)}const c=new THREE.PerspectiveCamera(32,1200/900,.01,10);c.position.set(.4,1.5,1.65);c.lookAt(0,0,-.27);const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(1200,900);r.setPixelRatio(1);r.toneMapping=THREE.ACESFilmicToneMapping;document.body.appendChild(r.domElement);Object.assign(r.domElement.style,{position:'fixed',inset:'0',zIndex:'999999',width:'100vw',height:'100vh'});r.render(view,c);const before=r.info.memory.geometries;for(let i=0;i<100;i++)applyKnifeAppearance();r.render(view,c);return {batches:knifeMerged.children.length,parts:knifeMerged.userData.sourceParts,geometries:r.info.memory.geometries,stable:before===r.info.memory.geometries,calls:r.info.render.calls,triangles:r.info.render.triangles}}};`;
    if(url==='/game.js')body+=`\nglobalThis.knifeQA.hold=async()=>{canvas.requestPointerLock=()=>Promise.resolve();startTraining();selectWeapon('knife',{equip:false});const before=knifeCombo;firing=true;await new Promise(r=>setTimeout(r,1250));firing=false;const attacks=knifeCombo-before;const damage=weaponDef.damage.body,range=weaponDef.range;paused=true;return {attacks,damage,range}};`;
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
  for(let i=0;i<150;i++){ready=await evaluate('Boolean(globalThis.knifeQA)');if(ready)break;if(errors.length)throw Error(errors.join('\n'));await new Promise(r=>setTimeout(r,100))}
  assert(ready,'whole game must initialize');
  const held=await evaluate('knifeQA.hold()');assert(held.attacks>=2);assert.equal(held.damage,57);assert.equal(held.range,3.22);
  const stats=await evaluate('knifeQA.preview()');assert(stats.parts>180);assert(stats.batches<=6);assert(stats.calls<=8);assert(stats.stable);assert.equal(errors.length,0);
  const screenshot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(root,'phase-knife-detail-preview.png'),Buffer.from(screenshot.data,'base64'));
  console.log('PASS: actual game initialization, detailed phase skin rendered, bounded calls, 100 appearance refreshes without allocations.',stats);
}finally{ws?.close();chrome.kill();server.close()}
