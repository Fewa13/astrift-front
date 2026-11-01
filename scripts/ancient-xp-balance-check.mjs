// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {QUEST_XP_BUDGETS,MAIN_QUESTS} from '../public/ancient-quests.js';
import {ancientMonsterXP,xpNeeded} from '../public/ancient-rules.js';
import {ancientMobHP,ancientMobDamage} from '../public/ancient-mob-stats.js';
import {ancientBaseAttack,ancientBaseHealth} from '../public/ancient-gear.js';
for(const stage of QUEST_XP_BUDGETS){assert(stage.awarded<=stage.budget);let total=0;for(let l=stage.from;l<stage.to;l++)total+=xpNeeded(l);assert(stage.awarded<=total*.2)}
assert.equal(ancientMonsterXP('city_husk',75),19531);assert.equal(ancientMonsterXP('city_guard',85),23157);assert.equal(ancientMonsterXP('emptyking',100),700000);
for(let level=70;level<=100;level++){for(const kind of ['city_husk','city_guard','city_acolyte'])assert(ancientMonsterXP(kind,level)<=xpNeeded(level)*.05);assert(ancientMobHP('city_husk',level)>=ancientBaseAttack(level)*12*1.3);assert(ancientMobDamage('city_husk',level)>=ancientBaseHealth(level)*.065*1.14)}
assert.equal(ancientMonsterXP('grox',25),2500);assert.equal(ancientMonsterXP('lord',30),30000);assert.equal(MAIN_QUESTS.filter(q=>q.id.startsWith('tribe-recovery-')&&q.kind==='kill').reduce((n,q)=>n+q.count,0),75);
console.log('PASS: all chapter story rewards <=20% of level XP, city mob/boss rewards, city combat scaling, tribe XP and quest counts unchanged.');
