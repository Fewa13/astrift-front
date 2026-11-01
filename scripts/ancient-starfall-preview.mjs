// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import os from 'node:os';import {spawn} from 'node:child_process';import assert from 'node:assert/strict';
const html=`<style>body{margin:0}</style><script type="module">
import * as T from '/three.module.js';import {buildStarfallScene,createStarfallCreature} from '/ancient-starfall-scene.js';import {starfallHeight} from '/ancient-starfall.js';
const scene=new T.Scene();scene.background=new T.Color(0x123949);scene.fog=new T.FogExp2(0x235665,.006);
const camera=new T.PerspectiveCamera(70,1400/900,.05,220),renderer=new T.WebGLRenderer({antialias:true});renderer.setSize(1400,900);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;document.body.append(renderer.domElement);
scene.add(new T.HemisphereLight(0xc7e8ff,0x203f48,2));const sun=new T.DirectionalLight(0xffe9ce,2.3);sun.position.set(-30,65,-20);scene.add(sun);
const world=buildStarfallScene(scene);for(const [kind,x,z]of [['tide_carapace',-6,57],['drowned_scribe',6,190],['anchor_revenant',-5,323],['starbound_heart',0,378]]){const m=createStarfallCreature(kind,180);m.position.set(x,starfallHeight(x,z)+(kind==='starbound_heart'?.3:0),z);m.rotation.y=0;scene.add(m)}
window.view=(z)=>{camera.position.set(0,starfallHeight(0,z)+4,z);camera.lookAt(0,starfallHeight(0,z)+3,z+65);world.update(2000);renderer.render(scene,camera);return {draws:renderer.info.render.calls,triangles:renderer.info.render.triangles}};window.view(15);window.ready=true;
</script>`;
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'astrift-starfall-'));
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost');if(u.pathname==='/'){res.setHeader('Content-Type','text/html');res.end(html);return}try{res.setHeader('Content-Type','text/javascript');res.end(fs.readFileSync(path.join(process.cwd(),'public',u.pathname)))}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--no-first-run','--enable-unsafe-swiftshader','--remote-debugging-port=0','--user-data-dir='+tmp,'--window-size=1400,1000','about:blank'],{stdio:['ignore','ignore','pipe']});let ws;
try{
 const debug=await new Promise((resolve,reject)=>{let log='';const timer=setTimeout(()=>reject(Error('Chrome timeout')),15000);chrome.stderr.on('data',d=>{log+=d;const m=log.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(timer);resolve(m[1])}})});
 ws=new WebSocket(debug);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let id=0,session;const pending=new Map(),errors=[];
 const call=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params,...(session?{sessionId:session}:{})}))});
 ws.addEventListener('message',e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(d.error.message)):p.resolve(d.result)}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.text)});
 const target=await call('Target.createTarget',{url:'about:blank'});session=(await call('Target.attachToTarget',{targetId:target.targetId,flatten:true})).sessionId;await call('Runtime.enable');await call('Page.enable');await call('Page.navigate',{url:'http://127.0.0.1:'+server.address().port});
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 for(let n=0;n<100&&!await evaluate('!!window.ready');n++)await new Promise(r=>setTimeout(r,100));assert(await evaluate('!!window.ready'),errors.join(','));
 for(const z of [15,150,295,345]){
  const info=await evaluate('view('+z+')');assert(info.draws<170);assert(info.triangles<300000);console.log({z,...info});
  const shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(tmp,'zone-'+z+'.png'),Buffer.from(shot.data,'base64'));
 }
 assert.equal(errors.length,0);console.log('PASS: four real WebGL map views within render budgets; previews:',tmp);
}finally{ws?.close();chrome.kill();server.close()}
