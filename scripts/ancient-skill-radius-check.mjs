// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {skills,combat} from './ancient-test-modules.mjs';
import {newAncientProfile} from '../public/ancient-rules.js';
for(const id of ['slash','power','rage','icearmor','blizzard','haste','storm','doom','swordwave','swordrain','phantomblade']){
 assert.equal(skills.skillRadius(id,3)-skills.skillRadius(id,1),1);
 const run=level=>{const p=newAncientProfile();p.level=50;p.profession=skills.SKILLS[id].job;p.skills={[id]:level};const a={name:'tester',x:0,y:1.7,z:50,hp:100,maxHp:100,weapon:p.weapons[0]},base=skills.skillRadius(id,1),self=['power','rage','icearmor','haste'].includes(id),m={id:'target',kind:'grox',x:0,z:self?50:55,hp:1e9,maxHp:1e9},edge={...m,id:'edge',x:base+.4};const hits=[],effects=[],c={map:'tribe',monsters:[m,edge],damage:(v,n)=>{hits.push(v.id);return n},fx:(id,x,z,r)=>effects.push(r)};assert.equal(combat.castAncientSkill(a,p,id,[0,-.15,Math.sqrt(1-.15**2)],c),null);if(['swordrain','phantomblade'].includes(id))combat.tickAncientSkills(a,p,c,.2,Date.now()+1000);return {edgeHit:hits.includes('edge')||!!edge.dots?.length,effects};};
 const one=run(1),three=run(3);assert.equal(one.edgeHit,false,id+' excludes level 1 edge');assert.equal(three.edgeHit,true,id+' reaches expanded edge');assert(three.effects.includes(skills.skillRadius(id,3)),id+' FX matches');
}
assert(skills.skillDescription('chain',3,true).includes('18m chain diameter'));
console.log('PASS: all area skills grow, damage edges and FX agree, chain growth preserved.');
