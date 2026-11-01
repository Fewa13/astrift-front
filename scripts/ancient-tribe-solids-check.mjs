// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {TRIBE_SOLIDS,TRIBE_COLLIDERS,TRIBE_TREES,blocked,lineClear,ancientMovementPath,tribeSafePosition,ANCIENT_POTIONS,ancientMapHeight,tribeAltarHeight} from '../public/ancient-rules.js';
assert.deepEqual(Object.values(ANCIENT_POTIONS).map(p=>p.price),[5,50,500,5000,50000]);
assert.deepEqual(Object.values(ANCIENT_POTIONS).map(p=>p.heal),[1000,10000,100000,1000000,10000000]);
assert.equal(TRIBE_TREES.length,127);
for(const o of TRIBE_SOLIDS.filter(o=>['firepit','basket','shrine','post','rack','pillar','altar'].includes(o.kind))){assert.equal(ancientMapHeight('tribe',o.x,o.z,o.h),o.h);const overlaps=TRIBE_COLLIDERS.some(v=>v!==o&&v.h>o.h+.05&&Math.abs(o.x-v.x)<v.w/2+.6&&Math.abs(o.z-v.z)<v.d/2+.6);if(!overlaps)assert(!blocked(o.x,o.z,.6,'tribe',o.h));assert.equal(blocked(o.x,o.z,.6,'tribe',0),!o.bottom);assert.equal(ancientMapHeight('tribe',o.x,o.z,0),tribeAltarHeight(o.x,o.z));}
for(const o of TRIBE_SOLIDS){if(!o.bottom){assert(blocked(o.x,o.z,.6));assert(blocked(o.x,o.z,1));assert(!lineClear(o.x-2,.2,o.z,o.x+2,.2,o.z));}const safe=tribeSafePosition(o.x,o.z,1);assert(!blocked(safe.x,safe.z,1));}
for(const t of TRIBE_TREES){assert(!ancientMovementPath(t.x-2,t.z,t.x+2,t.z));assert(!lineClear(t.x-2,1.7,t.z,t.x+2,1.7,t.z))}
for(const z of [10,20,100,210,300,510,600,800,945])assert(!blocked(0,z,.6),'Main route remains open');
console.log('PASS: all five potion prices/healing; shared solid footprints; all 127 trees; movement and LOS; safe relocation; main route open.');
