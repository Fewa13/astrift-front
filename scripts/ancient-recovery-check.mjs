// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {MAIN_QUESTS,currentQuest,advanceQuest} from '../public/ancient-quests.js';
import {newAncientProfile} from '../public/ancient-rules.js';
const old=MAIN_QUESTS.filter(q=>!q.patrol&&!q.id.startsWith('tribe-recovery-')&&!q.id.startsWith('tribe-outer-'));
const p=newAncientProfile();p.level=15;p.xp=0;p.quest={revision:2,step:old.findIndex(q=>q.id==='reach-twenty'),count:0};
assert.equal(currentQuest(p).id,'tribe-recovery-brief');assert.equal(p.quest.revision,6);
const start=p.coins;let steps=0;
let kills=0;
while(currentQuest(p)?.id.startsWith('tribe-recovery-')){const q=currentQuest(p);if(q.kind==='kill'){advanceQuest(p,{kind:'talk',map:'tribe',npc:'tok'});assert.equal(currentQuest(p).id,q.id);advanceQuest(p,{kind:'kill',map:'tribe',monster:{kind:'hunter',region:0,level:10}});assert.equal(p.quest.count,0);for(let i=0;i<q.count;i++){advanceQuest(p,{kind:'kill',map:'tribe',monster:{kind:q.kinds[0],region:1,level:10}});kills++}}else{advanceQuest(p,{kind:'talk',map:'forest',npc:q.npc});assert.equal(currentQuest(p).id,q.id);advanceQuest(p,{kind:'talk',map:'tribe',npc:q.npc});const saved=structuredClone(p);advanceQuest(p,{kind:'talk',map:'tribe',npc:q.npc});assert.deepEqual({...p,quest:undefined},{...saved,quest:undefined})}steps++;}
assert.equal(steps,13);assert.equal(kills,75);assert(p.level<19);assert.equal(p.potions.minor,5);assert.equal(p.coins-start,370);assert(currentQuest(p).id.startsWith('reach-twenty-patrol-'));
for(const id of ['train-c','gorash','city-relay-east']){const later=newAncientProfile();later.quest={revision:2,step:old.findIndex(q=>q.id===id),count:0};assert.equal(currentQuest(later).id,id);}
const veteran=newAncientProfile();veteran.level=20;veteran.quest={revision:2,step:old.findIndex(q=>q.id==='reach-twenty'),count:0};assert.equal(currentQuest(veteran).id,'reach-twenty');
const revisionThreeIds=MAIN_QUESTS.filter(q=>!q.patrol&&!q.id.startsWith('tribe-outer-')&&!['tribe-recovery-trackers','tribe-recovery-defense','tribe-recovery-muster'].includes(q.id)).map(q=>q.id);for(const id of ['tribe-recovery-suppliesseal','train-c','gorash']){const saved=newAncientProfile();saved.quest={revision:3,step:revisionThreeIds.indexOf(id),count:0};assert.equal(currentQuest(saved).id,id);assert.equal(saved.quest.revision,6)}
console.log('PASS: 13 stages with 75 required kills, reduced interaction XP, revision-2/3 migration, later progress preserved, wrong-map/region rejection, once-only rewards.');
