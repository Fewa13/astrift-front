// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {gainXP,newAncientProfile,xpNeeded} from '../public/ancient-rules.js';
import {ANCIENT_SUPPLIES,supplyDescription,useAncientSupply} from '../public/ancient-commerce.js';
const now=Date.now(),old=JSON.parse(JSON.stringify({...newAncientProfile(),level:50,xp:0,materials:{'supply:experience':8},boosts:{experience:now+300000}}));
assert.equal(gainXP(old,1000),1500);assert.equal(old.xp,1500);assert.equal(old.materials['supply:experience'],8);assert.equal(gainXP(old,101),151);assert.equal(old.xp,1651);
assert.equal(gainXP(old,1000,false),1000);assert.equal(old.xp,2651);old.boosts.experience=now-1;assert.equal(gainXP(old,1000),1000);
assert.equal(useAncientSupply(old,'experience',now),null);assert.equal(old.materials['supply:experience'],7);assert.equal(old.boosts.experience,now+600000);assert.equal(useAncientSupply(old,'experience',now+1000),null);assert.equal(old.boosts.experience,now+601000);assert.equal(old.materials['supply:experience'],6);assert.equal(gainXP(old,1000),1500);
const level=old.level;old.xp=xpNeeded(level)-100;gainXP(old,100);assert.equal(old.level,level+1);assert.equal(old.xp,50);
assert.equal(ANCIENT_SUPPLIES.experience.price,300);assert.equal(ANCIENT_SUPPLIES.experience.duration,600000);for(const en of [false,true])assert(supplyDescription('experience',en).includes('+50%'));assert(!ANCIENT_SUPPLIES.experience.en.includes('Double'));
console.log('PASS existing stock/active effects use +50%, exact integer XP/level carry, excluded rewards/expiry, refresh without stacking, retained price/duration and bilingual description.');
