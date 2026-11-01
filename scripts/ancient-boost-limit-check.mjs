// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {newAncientProfile} from '../public/ancient-rules.js';
import {buyAncientSupply,ancientBoostsRemaining} from '../public/ancient-commerce.js';
const now=Date.parse('2026-10-12T06:59:00Z'),p=newAncientProfile();p.coins=100000;
for(const id of ['damage','defense','experience']){
 assert.equal(buyAncientSupply(p,id,3,now),null);
 assert.equal(ancientBoostsRemaining(p,id,now),2);
 const snapshot=JSON.stringify(p);assert(buyAncientSupply(p,id,3,now));assert.equal(JSON.stringify(p),snapshot);
 assert.equal(buyAncientSupply(p,id,2,now),null);assert.equal(ancientBoostsRemaining(p,id,now),0);
 const restored=JSON.parse(JSON.stringify(p));assert(buyAncientSupply(restored,id,1,now));
 assert.equal(ancientBoostsRemaining(restored,id,now+60000),5);assert.equal(buyAncientSupply(restored,id,5,now+60000),null);
}
assert.equal(buyAncientSupply(p,'transfer',2,now),null);assert(buyAncientSupply(p,'transfer',1,now));
const poor=newAncientProfile();assert(buyAncientSupply(poor,'damage',5,now));assert.equal(ancientBoostsRemaining(poor,'damage',now),5);
assert.equal(ancientBoostsRemaining(newAncientProfile(),'damage',now),5);
console.log('PASS: per-account/per-kind potion quota, partial purchases, atomic rejection, persistence, Irvine rollover, transfer quota remains two.');
