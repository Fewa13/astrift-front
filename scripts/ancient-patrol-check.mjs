// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {MAIN_QUESTS,currentQuest,advanceQuest,QUEST_XP_BUDGETS} from '../public/ancient-quests.js';
import {newAncientProfile,xpNeeded} from '../public/ancient-rules.js';
const old=MAIN_QUESTS.filter(q=>!q.patrol&&!q.id.startsWith('blight-')).map(q=>q.id);
const p=newAncientProfile();p.level=26;p.quest={revision:5,step:old.indexOf('reach-thirty'),count:0};assert.equal(currentQuest(p).id,'reach-thirty-patrol-brief');assert.equal(p.quest.revision,6);
const before=structuredClone(p),counts=[];let rounds=0;
while(rounds<2){const q=currentQuest(p);assert(q.patrol);if(q.kind==='talk')advanceQuest(p,{kind:'talk',map:q.map,npc:q.npc});else{counts.push(q.count);advanceQuest(p,{kind:'kill',map:'city',monster:{kind:'hunter',level:23,region:2}});assert.equal(p.quest.count,0);for(let n=0;n<q.count;n++)advanceQuest(p,{kind:'kill',map:q.map,monster:{kind:q.kinds[0],level:23,region:q.region}})}if(q.patrol.last)rounds++}
assert.deepEqual(counts,[20,25,20,25]);assert(p.xp>before.xp);assert.equal(p.coins,before.coins);assert.deepEqual(p.materials,before.materials);assert.equal(currentQuest(p).id,'reach-thirty-patrol-brief');
p.level=30;advanceQuest(p);assert.equal(currentQuest(p).id,'raka-final');
const partial=newAncientProfile();partial.level=29;partial.quest={revision:7,step:MAIN_QUESTS.findIndex(q=>q.id==='reach-thirty-patrol-hunt'),count:12};assert.equal(currentQuest(structuredClone(partial)).id,'reach-thirty-patrol-hunt');partial.level=30;advanceQuest(partial);assert.equal(currentQuest(partial).id,'raka-final');
for(const q of MAIN_QUESTS.filter(q=>q.patrol)){assert.equal(q.reward?.xpFraction,.03);if(q.kind==='kill')assert(q.count>=20)}for(const budget of QUEST_XP_BUDGETS)assert(budget.awarded<=budget.budget);
for(const suffix of ['report','finish']){const paid=newAncientProfile();paid.level=20;paid.quest={revision:7,step:MAIN_QUESTS.findIndex(q=>q.id==='tribe-outer-reach21-patrol-'+suffix),count:0};const q=currentQuest(paid);advanceQuest(paid,{kind:'talk',map:q.map,npc:q.npc});assert.equal(paid.xp,Math.floor(xpNeeded(20)*.03));if(suffix==='report'){advanceQuest(paid,{kind:'talk',map:q.map,npc:q.npc});assert.equal(paid.xp,Math.floor(xpNeeded(20)*.03),'Repeated accept cannot grant twice')}}
const complete=newAncientProfile();complete.quest={revision:5,step:old.length,count:0};assert.equal(currentQuest(complete).id,'blight-summons');const boss=newAncientProfile();boss.quest={revision:5,step:old.indexOf('gorash'),count:0};assert.equal(currentQuest(boss).id,'gorash');
console.log('PASS: 19 dense patrol chains; 3% XP at every patrol step and level without duplicate grants; all patrol rewards present; map constraints; immediate level exit; saved quest preservation.');
