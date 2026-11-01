// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {ancientBaseHealth,ancientBaseAttack} from '../public/ancient-gear.js';
import {ancientMonsterXP,ancientKillExperience,xpNeeded} from '../public/ancient-rules.js';
for(let l=101;l<=300;l++){
 assert(ancientBaseHealth(l)>ancientBaseHealth(l-1));assert(ancientBaseAttack(l)>ancientBaseAttack(l-1));
 const base=Math.floor(200*l*l/(36+.48*(l-30)));
 assert.equal(ancientMonsterXP('seal_warden',l),Math.floor(base*(l/100)**3));
 assert.equal(ancientMonsterXP('immaculate_judge',l),Math.floor(Math.floor(80*l*l)*(l/100)**3));
}
assert.equal(ancientBaseAttack(150),438750);assert.equal(ancientBaseHealth(100),650000);
assert(ancientBaseAttack(300)/ancientBaseAttack(150)>22);
for(const l of [140,150,160,200,300,10000])for(const n of [ancientBaseHealth(l),ancientBaseAttack(l),ancientMonsterXP('seal_warden',l),xpNeeded(l)])assert(Number.isFinite(n)&&n>0);
console.table([140,150,160,200,300].map(level=>({level,hp:ancientBaseHealth(level),attack:ancientBaseAttack(level),mobXP:ancientKillExperience(ancientMonsterXP('seal_warden',level))})));
console.log('PASS: late growth, finite AdminTest values, preserved anchors, XP applied once.');
