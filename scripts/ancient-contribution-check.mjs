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
const monster={id:'test',kind:'grox',level:1,hp:100,maxHp:100,x:0,z:55,region:0,homeX:0,homeZ:55,action:'idle',attackAt:0,respawnAt:0,target:''};
world.damageMonster(sockets[0],actors[0],monster,70,'body','@pet:a');assert.equal(world.read('a').xp,0);world.damageMonster(sockets[1],actors[1],monster,9000);
assert.equal(world.read('a').xp,34);assert.equal(world.read('b').xp,14);assert.equal(messages[0].find(m=>m.type==='kill').contribution,.7);assert.equal(messages[1].find(m=>m.type==='kill').contribution,.3);assert.deepEqual(Array.from(monster.contributions),[]);
world.damageMonster(sockets[1],actors[1],monster,100);assert.equal(world.read('b').xp,14);
monster.hp=100;world.damageMonster(sockets[1],actors[1],monster,100);assert.equal(world.read('a').xp,34);assert.equal(world.read('b').xp,62);
assert.equal((await world.command('a','tradeInvite',{target:'b'})).ok,true);assert.ok((await world.command('b','tradeState')).tradeState.deal);
db.close();console.log('PASS: real server actual-damage split, overkill excluded, pet credited to owner, no last-hit monopoly, no double payment, clean next-life ledger, integrated trade commands.');
