// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {newAncientProfile} from '../public/ancient-rules.js';
import {ANCIENT_SUPPLIES,buyAncientSupply,ancientSkillBooksRemaining} from '../public/ancient-commerce.js';
const now=Date.parse('2026-10-12T06:59:00Z'),p=newAncientProfile();p.coins=100000;
p.shopSkillBooks={day:'2026-10-11',count:4};
for(const [id,d]of Object.entries(ANCIENT_SUPPLIES).filter(([,d])=>d.kind==='book')){
 assert.equal(d.price,300);assert.equal(ancientSkillBooksRemaining(p,id,now),8);
 assert.equal(buyAncientSupply(p,id,2,now),null);assert.equal(ancientSkillBooksRemaining(p,id,now),6);
 const before=JSON.stringify(p);assert(buyAncientSupply(p,id,7,now));assert.equal(JSON.stringify(p),before);
 assert.equal(buyAncientSupply(p,id,6,now),null);assert.equal(ancientSkillBooksRemaining(p,id,now),0);
 const saved=JSON.parse(JSON.stringify(p));assert(buyAncientSupply(saved,id,1,now));
 assert.equal(ancientSkillBooksRemaining(saved,id,now+60000),8);assert.equal(buyAncientSupply(saved,id,8,now+60000),null);
}
console.log('PASS: all profession books independently allow eight per day at 300 gold; persistence, excess rejection and Irvine midnight rollover.');
