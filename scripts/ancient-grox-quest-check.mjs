// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {MAIN_QUESTS,advanceQuest,currentQuest} from '../public/ancient-quests.js';
import {newAncientProfile} from '../public/ancient-rules.js';
const profile=id=>{const p=newAncientProfile();p.quest={step:MAIN_QUESTS.findIndex(q=>q.id===id),count:0,revision:2};return p};
const kill=(p,level,region=2,kind='grox',map='tribe')=>advanceQuest(p,{kind:'kill',map,monster:{kind,level,region}});
const p=profile('outer-grox');kill(p,14,1);kill(p,14,2,'hunter');kill(p,14,2,'grox','forest');assert.equal(p.quest.count,0);
for(const lv of [1,5,10,15,30,70,100]){kill(p,lv);assert.equal(p.quest.count,[1,5,10,15,30,70,100].indexOf(lv)+1)}assert(kill(p,12).includes('outer-grox'));assert.notEqual(currentQuest(p).id,'outer-grox');
const first=profile('grox-five');kill(first,14,0);kill(first,0,0);assert.equal(first.quest.count,0);for(let i=0;i<4;i++)kill(first,5,0);assert.equal(first.quest.count,4);assert(kill(first,1,0).includes('grox-five'));
console.log('PASS: Thin the Beasts accepts all outer Grox levels, rejects wrong region/species/map, completes at eight; introductory task retains levels 1–5.');
