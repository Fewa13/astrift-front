// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import vm from 'node:vm';import {build} from 'esbuild';
const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows}}};const module={exports:{}},ctx={storage:{sql,setAlarm:async()=>{}},getWebSockets:()=>[]};
const b=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']});vm.runInNewContext(b.outputFiles[0].text,{module,exports:module.exports,Date,crypto,Math,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});const server=new module.exports.AncientWorld(ctx,{});
const first=server.world('tribe'),inside=first.monsters.filter(m=>m.region===0&&!m.temporary);assert.equal(inside.length,18);const total=first.monsters.length;for(let i=0;i<100;i++)assert.equal(server.world('tribe').monsters.length,total,'no unbounded spawning');
const m=inside.find(m=>m.homeZ>50),p={x:m.homeX,z:m.homeZ,hp:100};const point=server.findMobRespawn(m,'tribe',[p]);assert(point);assert.equal(point.x,p.x);assert.equal(point.z,p.z,'player proximity no longer blocks spawn');
assert(first.monsters.filter(m=>m.region===1).length>=12);assert(first.monsters.filter(m=>m.region===2).length>=12);
for(const m of first.monsters){m.hp=0;m.respawnAt=Date.now()+3600000;}server.persist(first);
for(let i=0;i<3;i++)await server.tickMap('tribe');
const replenished=server.world('tribe');
for(const region of [0,1,2])assert(replenished.monsters.filter(m=>m.region===region&&m.hp>0).length>=6,'six live mobs per region even with zero players');
assert.equal(replenished.monsters.length,total,'floor reuses bounded slots');
db.close();console.log('PASS: bounded tribe slots, player-proximity spawns allowed, all three regions replenish six alive mobs without players.');
