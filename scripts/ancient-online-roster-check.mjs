// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
import {build} from 'esbuild';
const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows}}};
const bundle=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']}),module={exports:{}},sockets=[];
const ctx={storage:{sql,setAlarm:async()=>{},transactionSync:fn=>fn()},getWebSockets:()=>sockets};
vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,Date,crypto,Math,structuredClone,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
const world=new module.exports.AncientWorld(ctx,{}),actors=[],messages=[];
for(const name of ['a','b']){const p=world.read(name),actor={name,map:'tribe',x:0,y:1.7,z:50,hp:100,maxHp:100,seen:Date.now(),weapon:p.weapons[0],lastShot:0,deadAt:0};actors.push(actor);messages.push([]);const i=actors.length-1;sockets.push({deserializeAttachment:()=>actors[i],serializeAttachment:a=>actors[i]=a,send:s=>messages[i].push(JSON.parse(s))})}

actors[1].x=999;const p=world.read('b');p.level=80;world.save('b',p);let r=await world.command('a','onlinePlayers',{});assert.equal(r.players.length,2,'same map includes distant players');assert.equal(r.players.find(p=>p.name==='b').level,80);actors[1].map='forest';r=await world.command('a','onlinePlayers',{});assert.equal(r.players.length,1,'other map excluded');actors[1].map='tribe';actors[1].seen=Date.now()-16000;r=await world.command('a','onlinePlayers',{});assert.equal(r.players.length,1,'stale socket excluded');db.close();console.log('PASS: authenticated same-map roster includes self and distant players, correct levels, excludes other maps and stale sockets.');
