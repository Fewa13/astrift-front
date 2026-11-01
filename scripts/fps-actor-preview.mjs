// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import os from 'node:os';import {spawn} from 'node:child_process';import assert from 'node:assert/strict';
const source=fs.readFileSync('public/game.js','utf8'),factory=source.slice(source.indexOf('function actorMesh('),source.indexOf('function setActorLabel('));
const html=`<style>body{margin:0;background:#0a1524}</style><script type="module">
import * as THREE from '/three.module.js?v=0.180.0';import {dressFpsActor} from '/fps-actor-model.js';${factory}
const scene=new THREE.Scene();scene.background=new THREE.Color(0x0a1524);const camera=new THREE.PerspectiveCamera(35,1400/900,.1,100);camera.position.set(3.7,2.7,-7);camera.lookAt(0,1.05,0);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(1400,900);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;document.body.append(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xc9efff,0x26354a,3));for(const [x,z,c] of [[-3,-3,0xc4f3ff],[3,2,0x588dff]]){const l=new THREE.DirectionalLight(c,3);l.position.set(x,4,z);scene.add(l)}
const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshStandardMaterial({color:0x172537,roughness:.7}));floor.rotation.x=-Math.PI/2;floor.position.y=-.12;scene.add(floor);
const actors=[actorMesh(0x5ff5ff),actorMesh(0xff496c)];actors.forEach((a,i)=>{a.position.x=i?1:-1;a.rotation.y=i?-.65:.15;scene.add(a)});
window.preview={actors,renderer,scene,camera};renderer.render(scene,camera);window.ready=true;
</script>`;
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'astrift-armour-'));
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
 for(const pose of ['standing','prone','slide']){
  if(pose!=='standing')await evaluate(`preview.actors.forEach(a=>{a.userData.pose.rotation.x=${pose==='prone'?'Math.PI/2':'.72'};a.userData.pose.position.set(0,${pose==='prone'?'.38':'.08'},${pose==='prone'?'-1.2':'.16'});a.userData.pose.scale.y=${pose==='prone'?1:.48}});preview.renderer.render(preview.scene,preview.camera)`);
  const shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(tmp,pose+'.png'),Buffer.from(shot.data,'base64'));
 }
 assert.equal(errors.length,0);console.log('PASS: real WebGL standing/prone/slide; previews:',tmp);
}finally{ws?.close();chrome.kill();server.close()}
