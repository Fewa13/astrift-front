// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {newAncientProfile} from '../public/ancient-rules.js';
import {PROFESSIONS,skillBook,trainSkill,skillTrainingCost} from '../public/ancient-skills.js';
import {ancientShopDay,buyAncientSupply,ancientSkillBooksRemaining,ancientBoostsRemaining} from '../public/ancient-commerce.js';
for(const job of Object.keys(PROFESSIONS))for(const id of PROFESSIONS[job].skills){
 const p=newAncientProfile();p.level=150;p.profession=job;p.skills={};p.coins=0;p.materials[skillBook(id)]=1;assert.equal(trainSkill(p,id),null,'first activation remains accessible');assert.equal(p.skills[id],1);assert.equal(p.coins,0);
 p.materials[skillBook(id)]=64;p.materials.core=0;p.coins=10000;let before=JSON.stringify(p);assert.equal(trainSkill(p,id),'相位核心不足');assert.equal(JSON.stringify(p),before);
 p.materials.core=100;p.coins=199;before=JSON.stringify(p);assert.equal(trainSkill(p,id),'远古金币不足');assert.equal(JSON.stringify(p),before);
 p.coins=10000;assert.equal(trainSkill(p,id),null);assert.equal(p.skills[id],2);assert.equal(p.coins,9800);assert.equal(p.materials.core,98);assert.equal(p.materials[skillBook(id)],62);
 assert.equal(trainSkill(p,id),null);assert.equal(p.skills[id],3);assert.equal(p.coins,9350);assert.equal(p.materials.core,95);assert.equal(p.materials[skillBook(id)],58);
}
assert.deepEqual(skillTrainingCost(5),{books:32,cores:6,coins:1800});
for(const [utc,day] of [['2026-07-02T06:59:59Z','2026-07-01'],['2026-07-02T07:00:00Z','2026-07-02'],['2026-01-02T07:59:59Z','2026-01-01'],['2026-01-02T08:00:00Z','2026-01-02'],['2026-03-08T09:59:59Z','2026-03-08'],['2026-03-08T10:00:00Z','2026-03-08'],['2026-11-01T08:59:59Z','2026-11-01'],['2026-11-01T09:00:00Z','2026-11-01']])assert.equal(ancientShopDay(Date.parse(utc)),day);
const p=newAncientProfile();p.coins=10000;const t=Date.parse('2026-07-01T23:59:00Z');assert.equal(buyAncientSupply(p,'book:warrior',8,t),null);assert.equal(buyAncientSupply(p,'damage',5,t),null);assert.equal(buyAncientSupply(p,'transfer',2,t),null);assert.equal(ancientSkillBooksRemaining(p,'book:warrior',t+60000),0,'UTC midnight must not reset');assert.equal(ancientBoostsRemaining(p,'damage',t+60000),0);assert.equal(ancientSkillBooksRemaining(p,'transfer',t+60000),0);
const midnight=Date.parse('2026-07-02T07:00:00Z');assert.equal(ancientSkillBooksRemaining(p,'book:warrior',midnight),8);assert.equal(ancientBoostsRemaining(p,'damage',midnight),5);assert.equal(ancientSkillBooksRemaining(p,'transfer',midnight),2);
console.log('PASS: all professions atomic book/core/gold training, accessible first activation, next-level costs, eight 300-gold books per kind, all shop quotas reset at Irvine midnight, winter/summer and DST transitions, no UTC-midnight reset.');
