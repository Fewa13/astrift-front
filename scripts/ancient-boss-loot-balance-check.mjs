// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import {ancientBossGearWeights,ancientFieldReward,ancientGearLoot,gearDefinition,ANCIENT_FORGE} from '../public/ancient-gear.js';
const centers={tribe:2,forest:4,city:5,blight:6,sanctum:6,starfall:6,frostcourt:6,skyreach:6};let seed=1463;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
for(const [map,center]of Object.entries(centers)){
 const weights=ancientBossGearWeights(map);assert(Math.abs(weights.reduce((a,b)=>a+b)-100)<1e-9);assert.equal(weights.indexOf(Math.max(...weights))+1,center);assert(weights[center-2]>weights[center]||center===6);if(!['frostcourt','skyreach'].includes(map))assert.equal(weights[6]+weights[7],0);
 const counts=Array(8).fill(0);let total=0,kills=0;for(let i=0;i<20000;i++){const loot=ancientGearLoot('lord',random,999,map);if(loot.length)kills++;for(const item of loot){const d=gearDefinition(item.key);assert(d);assert(!Object.hasOwn(ANCIENT_FORGE,item.key));counts[d.quality-1]++;total++;}}
 assert(Math.abs(kills/20000-.75)<.02,'overall equipment chance preserved');for(let q=0;q<8;q++){assert(Math.abs(counts[q]/total-weights[q]/100)<.02);if(weights[q]===0)assert.equal(counts[q],0)}console.log(map,counts.map(n=>(100*n/total).toFixed(2)).join('% / ')+'%');
}
for(const map of ['frostcourt','skyreach'])for(const [roll,q]of [[.9999,8],[.998,7]]){const values=[0,roll];const loot=ancientGearLoot('frost_crowned',()=>values.shift()??.8,1,map);assert.equal(gearDefinition(loot[0].key).quality,q)}
assert.equal(ancientGearLoot('grox',random,999,'frostcourt').length,0);
for(const kind of ['chief','lord','rootwarden','crystal_fire','emptyking','blight_lord','immaculate_judge','starbound_heart'])for(let i=0;i<200;i++)assert(ancientGearLoot(kind,random,999).every(item=>gearDefinition(item.key).quality<=6));
console.log('PASS: map-centered quality, scarce upper tiers, Frostfire+ high-tier gate, no player/monster-level bypass, valid non-forge gear and unchanged overall drop chance.');

for(const kind of ['grox','hunter','chief','lord','rootwarden','crystal_fire','emptyking','blight_lord','immaculate_judge','starbound_heart','frost_crowned','sky_sovereign']){assert.deepEqual(ancientGearLoot(kind,()=>0,300,'community:1'),[]);assert.deepEqual(ancientFieldReward(25,'community:1',()=>0,kind).gear,[])}
console.log('PASS community maps: no weapons or equipment from normal, elite or boss kills, even with guaranteed lucky rolls.');
