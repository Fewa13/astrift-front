// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {MAIN_QUESTS,advanceQuest,currentQuest} from '../public/ancient-quests.js';
import {newAncientProfile} from '../public/ancient-rules.js';
const hunts=MAIN_QUESTS.filter(q=>q.id.startsWith('bestiary-')&&q.kind==='kill');
for(const q of hunts)for(const region of [0,1,2]){
 const p=newAncientProfile();p.level=15;p.quest={step:MAIN_QUESTS.indexOf(q),count:7,revision:7};
 const event={kind:'kill',map:q.map,monster:{kind:q.kinds[0],level:15,region}};
 advanceQuest(p,{...event,map:'wrong-map'});assert.equal(p.quest.count,7,'other map excluded');
 advanceQuest(p,{...event,monster:{...event.monster,kind:'wrong-species'}});assert.equal(p.quest.count,7,'other species excluded');
 advanceQuest(p,event);assert.equal(p.quest.count,8,'existing count retained and every region counts');
 for(let i=8;i<20;i++)advanceQuest(p,event);
 assert.notEqual(currentQuest(p)?.id,q.id,'hunt finishes at 20');
}
assert(hunts.some(q=>q.id==='bestiary-totem_priest-hunt'));
console.log(`PASS: ${hunts.length} species hunts count every map region, retain existing progress, reject wrong map/species, and complete at 20.`);
