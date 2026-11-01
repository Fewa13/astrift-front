// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import {build} from 'esbuild';
import {blocked,lineClear,ancientMapHeight} from '../public/ancient-rules.js';
assert(!blocked(-5,30,.6,'tribe',0),'Walk through rack opening');assert(!lineClear(-5,2.8,28,-5,2.8,32),'Beam blocks at its real height');assert(lineClear(-5,1.5,28,-5,1.5,32),'Rack opening does not block shots');assert(blocked(-7,30,.6),'Rack pillar is solid');
assert.equal(ancientMapHeight('tribe',-9.5,30,6),6,'Feet support matches body radius on narrow post');assert.equal(ancientMapHeight('tribe',-14.45,34,.5),.5,'Firepit edge remains supported');
const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows}}},sockets=[],ctx={storage:{sql,setAlarm:async()=>{}},getWebSockets:()=>sockets},module={exports:{}};
const bundle=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']});vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,Date,crypto,Math,structuredClone,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
const world=new module.exports.AncientWorld(ctx,{}),p=world.read('test');let a={name:'test',map:'tribe',x:-14.6,y:2.1,z:34,yaw:0,hp:100,maxHp:100,weapon:p.weapons[0],ammo:10,lastShot:0,reloadAt:0,lastMove:Date.now(),seen:Date.now(),deadAt:0,moveCredit:2,moveSeq:0};const ws={deserializeAttachment:()=>structuredClone(a),serializeAttachment:v=>a=structuredClone(v),send(){}};sockets.push(ws);
await world.webSocketMessage(ws,JSON.stringify({type:'move',x:-14.4,y:2.25,z:34,yaw:0,seq:1}));assert.equal(a.x,-14.4,'Server accepts jump above firepit instead of rejecting on old height');assert.equal(a.y,2.25);
await world.webSocketMessage(ws,JSON.stringify({type:'move',x:-14.45,y:2.2,z:34,yaw:0,seq:2}));assert.equal(a.x,-14.45);assert.equal(a.y,2.2,'Stable edge landing');
await world.webSocketMessage(ws,JSON.stringify({type:'move',x:-12,y:1.7,z:34,yaw:0,seq:3}));assert.equal(a.y,2.2,'Cannot sink through firepit');
db.close();console.log('PASS: open rack center, solid pillars/beam, correct LOS, narrow-post and firepit edge support, real WebSocket jump/landing and anti-sinking validation.');
