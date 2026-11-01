// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {build} from 'esbuild';
import {ancientBaseHealth} from '../public/ancient-gear.js';
import {ancientBossHP,ancientBossDamage} from '../public/ancient-boss-stats.js';
import {ancientMobHP} from '../public/ancient-mob-stats.js';
import {ancientMonsterDamage} from '../public/ancient-rules.js';
const bands={chief:[20,25],lord:[30,30],rootwarden:[40,50],crystal_metal:[60,70],crystal_wood:[60,70],crystal_water:[60,70],crystal_fire:[60,70],crystal_earth:[60,70],oathknight:[88,88],emptyking:[100,100]};
for(const [kind,[min,max]] of Object.entries(bands))for(let level=min;level<=max;level++){
 const hp=ancientBaseHealth(level);assert(ancientBossHP(kind,level)>=hp*3);assert(ancientBossHP(kind,level)<=hp*8);
 assert(ancientBossDamage(kind,level)>=hp*.119);assert(ancientBossDamage(kind,level)<=hp*.201);
 assert.equal(ancientMonsterDamage(kind,level),ancientBossDamage(kind,level));
}
const built=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']});
const module={exports:{}};vm.runInNewContext(built.outputFiles[0].text,{module,exports:module.exports,crypto,Date,Math,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
for(const [map,kind,level] of [['tribe','chief',20],['forest','crystal_fire',70],['city','emptyking',100]]){
 const old={kind,level,hp:250,maxHp:1000},dead={...old,hp:0,respawnAt:99999},normal={kind:'grox',level:3,hp:123,maxHp:300,region:0};let saved;
 const ctx={storage:{sql:{exec(query){return {toArray:()=>query.startsWith('SELECT')?[{data:JSON.stringify([old,dead,normal]),tick:0}]:[]}}}}};
 const server=new module.exports.AncientWorld(ctx,{});server.persist=w=>saved=w;
 const world=server.world(map),hp=ancientBossHP(kind,level);
 assert.equal(world.monsters[0].maxHp,hp);assert.equal(world.monsters[0].hp,Math.round(hp*.25));
 assert.equal(world.monsters[1].hp,0);assert.equal(world.monsters[1].respawnAt,99999);assert.equal(world.monsters[2].hp,Math.round(ancientMobHP('grox',3)*123/300));assert(saved);
 assert.equal(server.makeMonster(kind,level,0,0,0).maxHp,hp);
}
for(const [kind,[level]] of Object.entries(bands))console.log(kind,level,'HP',ancientBossHP(kind,level),'base attack',ancientBossDamage(kind,level));
console.log('PASS: all boss bands, shared damage, new spawns, three-map persisted boss/mob HP-ratio migration, no revival.');
