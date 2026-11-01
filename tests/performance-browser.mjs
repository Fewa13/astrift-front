import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';

// Uses a separate disposable Chrome profile, never the user's browser session.
const root=path.resolve(import.meta.dirname,'..');
const source=process.argv[2]||path.join(root,'public/game.js');
const baseline=source.includes('before-performance');
const three=process.env.ASTRIFT_THREE_TEST||'/tmp/astrift-three-test.mjs';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'astrift-render-test-'));
const server=http.createServer((req,res)=>{
  let url=new URL(req.url,'http://localhost').pathname;
  try{
    let body;
    if(url==='/game.js'){
      body=fs.readFileSync(source,'utf8').replace('https://esm.sh/three@0.180.0','/three.mjs');
      // Test-only instrumentation is appended in memory; never deployed.
      body+=`\nglobalThis.gameTest={THREE,scene,camera,renderer,obstacles,MODS,builds,buildWeapon,currentOpticId,selectWeapon,renderArmory,updateHud,shoot,damage,clearActors,spawnBots,tracer,impactFX,fireRocket,updateRockets,showDamageNumber,start,endMatch,remotes,bots,get ammo(){return ammo},get hp(){return hp},get key(){return weaponKey},setPosition(){camera.position.set(0,1.7,38);yaw=0;pitch=0;camera.rotation.set(0,0,0)},init(){canvas.requestPointerLock=()=>Promise.resolve();start(false);this.setPosition();spawnShieldUntil=Infinity;for(const b of bots)b.userData.reactionUntil=Infinity;},stopAI(){updateBots=()=>{}},freeze(){paused=true},getInfo(){return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,pixelRatio:renderer.getPixelRatio(),shadows:renderer.shadowMap.enabled}},${baseline?'':'effects,sceneryBatchStats,applyQuality,'} };`;
    }else if(url==='/three.mjs')body=fs.readFileSync(three);
    else body=fs.readFileSync(path.join(root,'public',url==='/'?'index.html':url.slice(1)));
    res.setHeader('Content-Type',/\.(js|mjs)$/.test(url)?'text/javascript':url.endsWith('.css')?'text/css':'text/html');res.end(body);
  }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--no-first-run','--no-default-browser-check','--enable-unsafe-swiftshader','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1280,800','about:blank'],{stdio:['ignore','ignore','pipe']});
let ws;
try{
  const debug=await new Promise((resolve,reject)=>{let log='';const timer=setTimeout(()=>reject(Error('Chrome startup timeout')),15000);chrome.stderr.on('data',b=>{log+=b;const m=log.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(timer);resolve(m[1]);}});chrome.on('exit',code=>reject(Error('Chrome exit '+code)));});
  ws=new WebSocket(debug);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  let id=0,session;const pending=new Map(),errors=[];
  ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(Error(m.error.message));else p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);});
  function call(method,params={}){return new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params,...(session?{sessionId:session}:{})}));});}
  const target=await call('Target.createTarget',{url:'about:blank'});
  session=(await call('Target.attachToTarget',{targetId:target.targetId,flatten:true})).sessionId;
  await call('Runtime.enable');await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:2,mobile:false});
  await call('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/`});
  async function evaluate(expression){const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value;}
  let ready=false;for(let i=0;i<100;i++){ready=await evaluate('Boolean(globalThis.gameTest)');if(ready)break;if(errors.length)throw Error(errors.join('\n'));await new Promise(r=>setTimeout(r,100));}
  assert.ok(ready,'game must initialize');
  await evaluate('gameTest.init();gameTest.stopAI();');
  const result=await evaluate(`new Promise(resolve=>{let frames=0,start=performance.now();function tick(){frames++;if(performance.now()-start<1800)requestAnimationFrame(tick);else resolve({fps:Math.round(frames*1000/(performance.now()-start)),...gameTest.getInfo()})}requestAnimationFrame(tick)})`);
  const checks=await evaluate(`(()=>{
    const g=gameTest,ray=new g.THREE.Raycaster(new g.THREE.Vector3(0,1.7,10),new g.THREE.Vector3(0,0,-1),0,30);
    const wall=ray.intersectObjects(g.obstacles,false)[0];
    let mutations=0;const el=document.getElementById('weaponSlotsHud'),observer=new MutationObserver(records=>mutations+=records.length);observer.observe(el,{childList:true,subtree:true});
    for(let i=0;i<100;i++)g.updateHud();mutations+=observer.takeRecords().length;observer.disconnect();
    const parts=Object.values(g.MODS).flatMap(slots=>Object.values(slots).flatMap(choices=>Object.keys(choices))).length;
    return {wallDistance:wall?.distance,wallHeight:wall?.object.userData.bounds?.maxY,hudMutations:mutations,parts,...(g.sceneryBatchStats||{})};
  })()`);
  assert.equal(checks.wallDistance,8);assert.equal(checks.wallHeight,3.2);
  if(!baseline){
    assert.equal(checks.hudMutations,0);
    await evaluate(`for(const [key,slots] of Object.entries(gameTest.MODS)){gameTest.selectWeapon(key,{equip:false});for(const id of Object.keys(slots.瞄具)){gameTest.builds[key].瞄具=id;gameTest.selectWeapon(key,{equip:false});if(gameTest.currentOpticId()!==id)throw Error('wrong optic '+id)}delete gameTest.builds[key].瞄具;}gameTest.selectWeapon('redline',{equip:false});gameTest.renderArmory();`);
    await evaluate(`gameTest.freeze();for(let i=0;i<120;i++){gameTest.tracer(new gameTest.THREE.Vector3(0,1,30),new gameTest.THREE.Vector3(0,1,10));gameTest.impactFX(new gameTest.THREE.Vector3(0,1,15));}if(gameTest.effects.count>64)throw Error('unbounded effects');`);
    await evaluate(`new Promise(r=>setTimeout(r,600))`);
    const resources=await evaluate(`(()=>{gameTest.clearActors();gameTest.renderer.render(gameTest.scene,gameTest.camera);return gameTest.getInfo()})()`);
    console.log('POST-CLEANUP',resources);
    const screenshot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('/tmp/astrift-performance.png',Buffer.from(screenshot.data,'base64'));
  }
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({source,baseline,result,checks,errors},null,2));
}finally{ws?.close();chrome.kill();server.close();}
