// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {ANCIENT_FORGE,ANCIENT_FORGE_LEGACY,craftAncientGear,ancientCraftMaterials,ancientGearLoot,gearDefinition,equipAncientGear,ancientSkillDamage} from '../public/ancient-gear.js';
import {newAncientProfile} from '../public/ancient-rules.js';
assert.equal(Object.keys(ANCIENT_FORGE).length,18);
for(const kind of ['grox','hunter','chief','mossling','thorn','sentinel'])assert.deepEqual(ancientCraftMaterials(kind,()=>0),{});
for(const kind of ['lord','rootwarden','crystal_metal','crystal_wood','crystal_water','crystal_fire','crystal_earth']){
 assert.deepEqual(ancientCraftMaterials(kind,()=>.99),{});assert(ancientCraftMaterials(kind,()=>0).core>0);
 for(let i=0;i<100;i++)for(const item of ancientGearLoot(kind))assert(!Object.hasOwn(ANCIENT_FORGE,item.key));
}
for(const [key,recipe]of Object.entries(ANCIENT_FORGE).filter(([key])=>!key.startsWith('hollow_'))){
 assert.equal(Object.keys(recipe).length,2);assert(recipe.core>0);
 const legacy=newAncientProfile();legacy.materials={...ANCIENT_FORGE_LEGACY[key]};assert.equal(craftAncientGear(legacy,key),null);for(const k of Object.keys(ANCIENT_FORGE_LEGACY[key]))assert.equal(legacy.materials[k],0);
 const sources=['lord','rootwarden','crystal_metal'];const available=new Set(sources.flatMap(kind=>Object.keys(ancientCraftMaterials(kind,()=>0))));for(const k of Object.keys(recipe))assert(available.has(k),'Every ingredient has an active boss drop source');
 const p=newAncientProfile(),before=JSON.stringify(p);assert.equal(craftAncientGear(p,key),'合成材料不足');assert.equal(JSON.stringify(p),before);
 p.materials={...recipe};const n=p.gear.length;assert.equal(craftAncientGear(p,key),null);assert.equal(p.gear.length,n+1);for(const k of Object.keys(recipe))assert.equal(p.materials[k],0);
 assert.equal(craftAncientGear(p,key),'合成材料不足');const item=p.gear.at(-1),d=gearDefinition(key);assert.equal(equipAncientGear(p,d.slot,item.id),'玩家等级不足');p.level=100;const skill=ancientSkillDamage(p);assert.equal(equipAncientGear(p,d.slot,item.id),null);if(d.slot==='weapon')assert.equal(ancientSkillDamage(p),skill);
 assert.equal(craftAncientGear(p,'__proto__'),'配方不存在');assert.equal(JSON.parse(JSON.stringify(p)).gear.at(-1).key,key);
}
console.log('PASS: 12 original craft-only items; boss-only probabilistic materials; drop-pool exclusion; exact atomic costs; insufficient/invalid input; equip levels; weapon-independent skills; serialization.');
