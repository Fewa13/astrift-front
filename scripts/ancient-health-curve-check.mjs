// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {ancientBaseHealth,ancientProfileHealth} from '../public/ancient-gear.js';
import {ancientMaxHealth,newAncientProfile} from '../public/ancient-rules.js';
import {skillHealth} from '../public/ancient-skills.js';
for(const [level,hp] of [[1,100],[5,3000],[10,12000],[30,90000],[50,250000],[60,320000],[80,470000],[100,650000]])assert.equal(ancientBaseHealth(level),hp);
for(let l=2;l<=500;l++){assert(ancientBaseHealth(l)>ancientBaseHealth(l-1));assert.equal(ancientMaxHealth(l),ancientBaseHealth(l))}
for(const l of [5,10,30,50,60,80,100])assert(Math.abs(ancientBaseHealth(l-.001)-ancientBaseHealth(l+.001))/ancientBaseHealth(l)<.001);
const p=newAncientProfile();p.level=50;assert.equal(ancientProfileHealth(p),250000);
const now=Date.now(),a={hp:10000,skillRuntime:{cooldowns:{},effects:{transform:{level:3,until:now+60000}},mode:1,lastAux:0}};
skillHealth(a,ancientProfileHealth(p),now);assert.equal(a.maxHp,330000);assert.equal(a.hp,10000);
a.hp=0;skillHealth(a,ancientProfileHealth(p),now);assert.equal(a.hp,0);
console.log('PASS: exact anchors, continuous monotonic growth, shared HP formula, 3-level transformation, no healing or revival.');
