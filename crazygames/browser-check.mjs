// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
const directory=import.meta.dirname,latest=JSON.parse(fs.readFileSync(path.join(directory,'latest.json'),'utf8'));
const root=path.resolve(directory,latest.game),prefix='/games/astrift/',profile=fs.mkdtempSync(path.join(os.tmpdir(),'astrift-crazygames-qa-'));
const missing=[];
const server=http.createServer((request,response)=>{
 const url=new URL(request.url,'http://localhost');if(!url.pathname.startsWith(prefix)){response.writeHead(404).end();return}
 const file=url.pathname.slice(prefix.length)||'index.html';try{
  let bytes=fs.readFileSync(path.join(root,file));if(file==='game.js')bytes=bytes.toString()+`\nwindow.crazyQA={start(){canvas.requestPointerLock=()=>Promise.resolve();startTraining();return {playing,map:activeMapId,targets:trainingTargets.length}},pause(){togglePause(true)},resume(){togglePause(false)},exit(){endMatch()}};`;
  response.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');response.end(bytes);
 }catch{missing.push(file);response.writeHead(404).end()}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--no-first-run','--enable-unsafe-swiftshader','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=1200,900','about:blank'],{stdio:['ignore','ignore','pipe']});let ws;
try{
 const debug=await new Promise((resolve,reject)=>{let log='';const timer=setTimeout(()=>reject(Error('Chrome timeout')),15000);chrome.stderr.on('data',data=>{log+=data;const match=log.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match){clearTimeout(timer);resolve(match[1])}})});
 ws=new WebSocket(debug);await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));let id=0,session;const pending=new Map(),errors=[];
 const call=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params,...(session?{sessionId:session}:{})}))});
 ws.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id){const handler=pending.get(message.id);pending.delete(message.id);if(message.error)handler.reject(Error(message.error.message));else handler.resolve(message.result)}else if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);else if(message.method==='Fetch.requestPaused')void call('Fetch.fulfillRequest',{requestId:message.params.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/javascript'}],body:Buffer.from(`window.cgEvents=[];window.CrazyGames={SDK:{environment:'local',init:async()=>window.cgEvents.push('init'),game:Object.fromEntries(['loadingStart','loadingStop','gameplayStart','gameplayStop'].map(key=>[key,()=>window.cgEvents.push(key)]))}};`).toString('base64')})});
 const target=await call('Target.createTarget',{url:'about:blank'});session=(await call('Target.attachToTarget',{targetId:target.targetId,flatten:true})).sessionId;await call('Runtime.enable');await call('Page.enable');await call('Fetch.enable',{patterns:[{urlPattern:'https://sdk.crazygames.com/*'}]});
 await call('Page.navigate',{url:`http://127.0.0.1:${server.address().port}${prefix}`});
 const evaluate=async expression=>{const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value};
 const wait=()=>new Promise(resolve=>setTimeout(resolve,300));
 for(let i=0;i<80;i++){if(await evaluate('Boolean(window.crazyQA)'))break;if(errors.length)throw Error(errors.join('\n'));await wait()}
 assert(await evaluate('Boolean(window.crazyQA)'));assert.deepEqual(missing,[],'no missing assets at nested platform path');assert(await evaluate('document.getElementById("menu").classList.contains("active")'));assert.deepEqual(await evaluate('crazyQA.start()'),{playing:true,map:'training',targets:7});await wait();await wait();assert((await evaluate('window.cgEvents')).includes('gameplayStart'));
 await evaluate('crazyQA.pause()');await wait();assert.equal((await evaluate('window.cgEvents')).at(-1),'gameplayStop');await evaluate('crazyQA.resume()');await wait();assert.equal((await evaluate('window.cgEvents')).at(-1),'gameplayStart');await evaluate('crazyQA.exit()');await wait();assert.equal((await evaluate('window.cgEvents')).at(-1),'gameplayStop');assert.equal(errors.length,0);assert.deepEqual(missing,[]);
 console.log('PASS: nested-path build loads all game assets, menu and seven-target firing range initialize, SDK mock reports start/pause/resume/exit without browser exceptions. Official SDK/portal/network verification is still pending.');
}finally{ws?.close();chrome.kill();server.close()}
