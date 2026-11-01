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
      body+=`
globalThis.objectiveTest={
        start(mode){canvas.requestPointerLock=()=>Promise.resolve();start(false,mode)},
        snapshot(){return {mode:roomMode,phase:objectiveState?.phase,bots:bots.length,blue:bots.filter(b=>b.userData.team===0).length,red:bots.filter(b=>b.userData.team===1).length,score,redScore,finished:matchFinished,blocked:duelBlocked(),panel:$('objectivePanel').hidden}},
        capture(){camera.position.set(0,1.7,-43);keys.KeyF=true;const now=Date.now();tickMatch(objectiveState,objectiveFighters(),now);tickMatch(objectiveState,objectiveFighters(),now+700);keys.KeyF=false;return carryingObjectiveFlag()},
        kill(){awardKill(0,$('name').value,'enemy')},
        ai(){let now=Date.now();let movement=0;const before=bots.map(b=>b.position.clone());for(let i=0;i<2000;i++){now+=40;objectiveActors=objectiveFighters();tickMatch(objectiveState,objectiveActors,now);updateBots(.04);for(const b of bots)if(b.visible&&blocked(b.position.x,b.position.z))throw Error('AI walked into wall');if(objectiveState.phase==='finished')break;}movement=bots.reduce((n,b,i)=>n+b.position.distanceTo(before[i]),0);return {movement,scores:objectiveState.scores}},
        hill(){for(const b of bots)b.visible=false;camera.position.set(0,1.7,6);const now=Date.now();objectiveState=createMatch('hardpoint',now-1000);tickMatch(objectiveState,objectiveFighters(),now);updateObjectiveMode(.016);return objectiveState.scores},
        finish(){objectiveState.endsAt=Date.now()-1;tickMatch(objectiveState,objectiveFighters(),Date.now());updateObjectiveMode(.016);return !$('objectiveResult').hidden&&matchFinished},
        continue(){document.getElementById('objectiveContinue').click()},
        normal(){endMatch();start(false);for(let i=0;i<35;i++)awardKill(0,'blue','red');return this.snapshot()},
        practice(){endMatch();startTraining();return {trainingMode,panel:$('objectivePanel').hidden,mode:roomMode}},
        view(){endMatch();start(false,'ctf');camera.position.set(0,7,50);camera.lookAt(0,1,36);paused=true;objectiveWorld.update(objectiveState,()=>null,performance.now());renderer.render(scene,camera)}
      };`;
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
  let ready=false;for(let i=0;i<100;i++){ready=await evaluate('Boolean(globalThis.objectiveTest)');if(ready)break;if(errors.length)throw Error(errors.join('\n'));await new Promise(r=>setTimeout(r,100));}
  assert.ok(ready,'game must initialize');
  assert.equal(await evaluate("document.querySelectorAll('.objectiveEntry button').length"),6);
  await evaluate("document.getElementById('createCtf').click()");
  assert.ok((await evaluate("document.getElementById('roomDialogTitle').textContent")).includes('夺旗'));
  await evaluate("document.getElementById('cancelRoom').click();objectiveTest.start('ctf')");
  let state=await evaluate('objectiveTest.snapshot()');assert.equal(state.phase,'running');assert.equal(state.bots,11);assert.equal(state.blue,5);assert.equal(state.red,6);
  await evaluate('objectiveTest.kill()');assert.equal((await evaluate('objectiveTest.snapshot()')).score,0);
  assert.equal(await evaluate('objectiveTest.capture()'),true);
  await evaluate("objectiveTest.start('ctf')");const ai=await evaluate('objectiveTest.ai()');assert.ok(ai.movement>50);console.log('AI navigation',ai);
  await evaluate("objectiveTest.start('hardpoint')");assert.deepEqual(await evaluate('objectiveTest.hill()'),[1,0]);
  assert.equal(await evaluate('objectiveTest.finish()'),true);await evaluate('objectiveTest.continue()');assert.equal((await evaluate('objectiveTest.snapshot()')).phase,'running');
  state=await evaluate('objectiveTest.normal()');assert.equal(state.mode,'normal');assert.equal(state.score,35);assert.equal(state.finished,false);assert.equal(state.blocked,false);assert.equal(state.panel,true);
  assert.deepEqual(await evaluate('objectiveTest.practice()'),{trainingMode:true,panel:true,mode:'normal'});
  await evaluate('objectiveTest.view()');const screenshot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('/tmp/astrift-objective.png',Buffer.from(screenshot.data,'base64'));
  assert.deepEqual(errors,[]);console.log('PASS browser: mode menus, 6v6 AI, F pickup, AI route collision, non-scoring kills, hill scoring, continue UI, normal 35 kills, practice isolation, no runtime errors.');
}finally{ws?.close();chrome.kill();server.closeAllConnections();server.close();}
