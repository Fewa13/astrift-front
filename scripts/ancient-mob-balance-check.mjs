// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {ancientMobHP,ancientMobDamage} from '../public/ancient-mob-stats.js';
import {ancientBaseAttack,ancientBaseHealth} from '../public/ancient-gear.js';
import {ancientMonsterDamage} from '../public/ancient-rules.js';
import {forestMonsterHP} from '../public/ancient-forest.js';
import {cityMonsterHP} from '../public/ancient-city.js';
for(const kind of ['grox','hunter','mossling','thorn','sentinel','city_husk','city_guard','city_acolyte'])for(let l=1;l<=150;l++){
 const hp=ancientMobHP(kind,l),damage=ancientMobDamage(kind,l);assert(hp>=ancientBaseAttack(l)*7.59);assert(hp<=ancientBaseAttack(l)*16.81);
 if(l>1){assert(hp>ancientMobHP(kind,l-1));assert(damage>=ancientMobDamage(kind,l-1))}
 if(l>=10){assert(damage>=ancientBaseHealth(l)*.039);assert(damage<=ancientBaseHealth(l)*.0751)}
 assert.equal(ancientMonsterDamage(kind,l),damage);
 if(['mossling','thorn','sentinel'].includes(kind))assert.equal(forestMonsterHP(kind,l),hp);
 if(kind.startsWith('city'))assert.equal(cityMonsterHP(kind,l),hp);
}
for(const [kind,l] of [['grox',14],['mossling',35],['sentinel',55],['city_husk',75]])console.log(kind,l,'HP',ancientMobHP(kind,l),'attack',ancientMobDamage(kind,l));
console.log('PASS: eight mob types, levels 1–150, continuous monotonic growth, consistent server/map formulas.');
