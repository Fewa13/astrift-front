// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {MAIN_QUESTS,questRewardInfo,advanceQuest} from '../public/ancient-quests.js';
import {newAncientProfile,xpNeeded} from '../public/ancient-rules.js';
for(const q of MAIN_QUESTS.filter(q=>q.patrol)){
 const p=newAncientProfile();p.level=q.patrol.target-1;p.quest={step:MAIN_QUESTS.indexOf(q),count:q.kind==='kill'?q.count-1:0,revision:7};
 const expected=Math.max(1,Math.floor(xpNeeded(p.level)*.03));assert.equal(questRewardInfo(p,q).xp,expected);
 const event=q.kind==='talk'?{kind:'talk',map:q.map,npc:q.npc}:{kind:'kill',map:q.map,monster:{kind:q.kinds[0],region:q.region,level:p.level}};
 assert(advanceQuest(p,event).includes(q.id));assert.equal(p.xp,expected,q.id);
}
const q=MAIN_QUESTS.find(q=>q.id==='tribe-outer-reach21-patrol-hunt'),p=newAncientProfile();p.level=21;p.quest={step:MAIN_QUESTS.indexOf(q),count:19,revision:7};
assert(advanceQuest(p,{kind:'kill',map:q.map,monster:{kind:'hunter',region:1,level:15}}).includes(q.id));assert.equal(p.xp,Math.floor(xpNeeded(21)*.03));
console.log('PASS: every patrol step across all 19 level gaps pays 3%; finishing at target level still pays.');
