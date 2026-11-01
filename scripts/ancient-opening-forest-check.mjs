// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {MAIN_QUESTS,advanceQuest,currentQuest} from '../public/ancient-quests.js';
import {ancientMonsterXP,xpNeeded} from '../public/ancient-rules.js';
const index=id=>MAIN_QUESTS.findIndex(q=>q.id===id);
const profile=id=>({level:1,xp:0,coins:0,potions:{},materials:{},weapons:[],equipped:'',quest:{step:index(id),count:0,revision:7}});
const fresh=profile('gruk-help');
advanceQuest(fresh,{kind:'talk',npc:'gruk',map:'tribe'});
assert.equal(currentQuest(fresh).id,'choose-job');
assert.equal(fresh.materials['supply:transfer'],1);
for(const id of ['grox-five','gruk-reward']){
 const old=profile(id);advanceQuest(old,{kind:'enter',map:'tribe'});
 assert.equal(currentQuest(old).id,'choose-job');
}
const progressed=profile('tok-trail');advanceQuest(progressed,{kind:'check'});
assert.equal(currentQuest(progressed).id,'tok-trail');
for(const level of [30,40,50,60,70]){
 assert.equal(ancientMonsterXP('rootwarden',level),Math.floor(xpNeeded(level)*.18));
 assert.equal(ancientMonsterXP('crystal_fire',level),Math.floor(xpNeeded(level)*.25));
 assert(ancientMonsterXP('mossling',level)<xpNeeded(level)/(30+.4*(level-30)));
}
assert.equal(ancientMonsterXP('grox',5),200);
assert.equal(ancientMonsterXP('emptyking',100),700000);
console.log('PASS: opening skips combat gate, old progress preserved, forest XP moderated.');
