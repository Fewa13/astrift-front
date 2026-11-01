// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
import {build} from 'esbuild';
import {ancientBossHP,ancientBossDamage} from '../public/ancient-boss-stats.js';
import {ancientBaseHealth,ancientBaseAttack} from '../public/ancient-gear.js';
import {ancientMobHealth} from '../public/ancient-mob-stats.js';
import {sanctumMonsterHP} from '../public/ancient-sanctum.js';
import {blightMonsterHP} from '../public/ancient-blight.js';
for(const [kind,level,factor,damage]of [['chief',23,3,.12],['lord',30,5,.16],['rootwarden',45,4,.14],['crystal_metal',65,6,.17],['crystal_earth',65,7,.19],['oathknight',88,5,.17],['emptyking',100,8,.2]]){
 assert(ancientBossHP(kind,level)>=ancientBaseHealth(level)*factor*1.49);
 assert.equal(ancientBossDamage(kind,level),Math.round(ancientBaseHealth(level)*damage),'damage unchanged');
 console.log(kind,level,ancientBossHP(kind,level));
}
assert.equal(sanctumMonsterHP('immaculate_judge',150),105212250);
assert.equal(sanctumMonsterHP('seal_warden',150),ancientMobHealth(150,ancientBaseAttack(150)*18));
assert.equal(blightMonsterHP('rift_maw',120),ancientMobHealth(120,ancientBaseAttack(120)*18));
const giant=Math.floor(ancientBaseAttack(150)*10.1*2.5),fraction=giant/sanctumMonsterHP('immaculate_judge',150);assert(fraction>.1&&fraction<.12);
const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows}}};
const bundle=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']}),module={exports:{}},ctx={storage:{sql,setAlarm:async()=>{}},getWebSockets:()=>[]};
vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,Date,crypto,Math,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
const server=new module.exports.AncientWorld(ctx,{});
for(const [map,kind,oldHP]of [['sanctum','immaculate_judge',9350000],['blight','blight_lord',6640000],['city','emptyking',5200000]]){
 const w=server.world(map),boss=w.monsters.find(m=>m.kind===kind);boss.maxHp=oldHP;boss.hp=oldHP*.5;server.persist(w);
 const migrated=server.world(map).monsters.find(m=>m.kind===kind);assert(migrated.maxHp>oldHP);assert(Math.abs(migrated.hp/migrated.maxHp-.5)<1e-6,'remaining HP ratio retained');
 migrated.hp=0;server.persist(server.world(map)); // Check dead boss separately.
 const deadWorld=server.world(map);deadWorld.monsters.find(m=>m.kind===kind).hp=0;server.persist(deadWorld);assert.equal(server.world(map).monsters.find(m=>m.kind===kind).hp,0);
}
db.close();console.log('PASS: boss HP scaled with new mob HP, damage unchanged; saved worlds preserve remaining HP ratio and do not revive dead bosses.');
