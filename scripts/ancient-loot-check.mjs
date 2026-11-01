// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {skills,combat,quests} from './ancient-test-modules.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {transform} from 'esbuild';
import * as rules from '../public/ancient-rules.js';import * as forest from '../public/ancient-forest.js';
assert.deepEqual(rules.ancientWeaponLoot('grox',()=>.5),{});
assert.deepEqual(rules.ancientWeaponLoot('grox',()=>0),{'fragment:R6':1});
for(const kind of ['chief','rootwarden'])for(const v of [0,.9])assert.equal(rules.weaponLootInfo(Object.keys(rules.ancientWeaponLoot(kind,()=>v))[0]).kind,'blueprint');
for(const kind of ['lord','crystal_metal','crystal_wood','crystal_water','crystal_fire','crystal_earth'])for(const v of [0,.9])assert.equal(rules.weaponLootInfo(Object.keys(rules.ancientWeaponLoot(kind,()=>v))[0]).kind,'ascend');
assert.equal(rules.weaponLootInfo('blueprint:3:__proto__'),null);assert.equal(rules.weaponLootName('blueprint:2:R6'),'[稀有图纸]R6');assert.equal(rules.weaponLootName('blueprint:3:R6',true),'[Epic Blueprint] R6');
for(const [gun,recipe] of Object.entries(rules.RECIPES))assert.deepEqual(Object.keys(recipe),['fragment:'+gun]);
const compiled=await transform(fs.readFileSync(new URL('../src/ancient-world.ts',import.meta.url),'utf8'),{loader:'ts',format:'cjs'}),module={exports:{}};
const ctx={getWebSockets:()=>[],storage:{sql:{exec:()=>({toArray:()=>[]})}}};vm.runInNewContext(compiled.code,{module,exports:module.exports,require:n=>n==='cloudflare:workers'?{DurableObject:class{constructor(ctx){this.ctx=ctx}}}:n.includes('ancient-quests')?quests:n.includes('ancient-skill-combat')?combat:n.includes('ancient-skills')?skills:n.includes('ancient-forest')?forest:rules,crypto,Date});
const server=new module.exports.AncientWorld(ctx,{});let p=rules.newAncientProfile();server.read=()=>structuredClone(p);server.save=(_,value)=>p=structuredClone(value);
assert.equal((await server.command('a','craft',{gun:'R6'})).ok,false,'Wood and stone cannot make guns');p.materials['fragment:R6']=6;
assert((await server.command('a','craft',{gun:'R6'})).ok);assert.equal(p.materials['fragment:R6'],0);assert.equal(p.weapons.at(-1).quality,1);
const w=p.weapons[0];w.level=23;w.stars=4;const id=w.id;
p.materials['blueprint:2:R6']=1;assert.equal((await server.command('a','ascend',{id})).ok,false);assert.equal(p.materials['blueprint:2:R6'],1,'No partial consumption');p.materials['ascend:2:V6']=1;assert.equal((await server.command('a','ascend',{id})).ok,false,'Wrong weapon material rejected');
p.materials['ascend:3:R6']=1;p.materials['blueprint:3:R6']=1;assert.equal((await server.command('a','ascend',{id})).ok,false,'Cannot skip a quality');
p.materials['ascend:2:R6']=1;const results=await Promise.all([server.command('a','ascend',{id}),server.command('a','ascend',{id})]);
// Both successive qualities are legal here because both separate sets of materials exist.
assert(results.every(r=>r.ok));const upgraded=p.weapons.find(w=>w.id===id);assert.equal(upgraded.quality,3);assert.equal(upgraded.level,23);assert.equal(upgraded.stars,4);assert.equal(p.materials['ascend:2:R6'],0);assert.equal(p.materials['blueprint:2:R6'],0);assert.equal(p.materials['ascend:3:R6'],0);assert.equal(p.materials['blueprint:3:R6'],0);assert.equal(p.materials['ascend:2:V6'],1);
assert.equal((await server.command('a','ascend',{id})).ok,false);assert.equal((await server.command('a','useBlueprint',{key:'blueprint:2:R6'})).ok,false,'No independent level-cap unlock action');
p.materials.core=100000;assert((await server.command('a','upgrade',{id})).ok,'Star upgrades above level 10 remain legal');assert.equal(p.weapons.find(w=>w.id===id).stars,5);
p=rules.newAncientProfile();p.materials['ascend:2:R6']=1;p.materials['blueprint:2:R6']=1;const repeated=await Promise.all([server.command('a','ascend',{id:p.equipped}),server.command('a','ascend',{id:p.equipped})]);assert.equal(repeated.filter(r=>r.ok).length,1);assert.equal(p.weapons[0].quality,2);
assert.equal((await server.command('a','craft',{gun:'__proto__'})).ok,false);
console.log('PASS: small-monster fragment probability; head blueprints; boss ascension materials; fragment-only recipes; matching gun and sequential quality; atomic materials; repeat requests; preserved level/stars; no level-cap gating; Chinese/English loot names');
