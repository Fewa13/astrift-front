// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {skills,combat} from './ancient-test-modules.mjs';
import {newAncientProfile} from '../public/ancient-rules.js';
import {ancientSkillDamage} from '../public/ancient-gear.js';
const p=newAncientProfile();p.profession='swordsman';p.level=30;
assert(skills.ensureBasicSkills(p));assert.equal(p.skills.swordwave,1);
const dir=[0,-.15,Math.sqrt(1-.15**2)],now=Date.now(),base=ancientSkillDamage(p);
for(const id of skills.PROFESSIONS.swordsman.skills){
 p.skills[id]=1;
 const a={name:'sword',x:0,z:50,y:1.7,hp:100,weapon:p.weapons[0]},m={id:'target',kind:'grox',x:0,z:55,hp:1e9,maxHp:1e9},other={...m,id:'other',x:1};
 const hits=[],effects=[],c={map:'tribe',monsters:[m,other],damage(target,n){hits.push({target:target.id,n});target.hp-=n;return n},fx(...v){effects.push(v)}};
 assert.equal(combat.castAncientSkill(a,p,id,dir,c,now),null);
 assert.equal(effects[0][4].target,'target');
 m.z=57; // Scheduled strikes follow the locked monster, not the old position.
 for(let t=100;t<=3200;t+=100)combat.tickAncientSkills(a,p,c,.1,now+t);
 const primaryHits=hits.filter(v=>v.target==='target');
 assert(primaryHits.length>0);if(skills.skillRadius(id,1)>0)assert(hits.some(v=>v.target==='other'),'nearby target also receives area damage');else assert(hits.every(v=>v.target==='target'));
 assert.equal(m.strikes.length,0);
 if(id==='triplecut'){assert.equal(primaryHits.length,3);assert.equal(primaryHits[1].n,primaryHits[0].n*.5);assert.equal(primaryHits[2].n,primaryHits[0].n*.25)}
 if(id==='swordrain'){assert.equal(primaryHits.length,6);assert(hits.every(v=>Math.abs(v.n-base*1.56)<.001))}
 if(id==='phantomblade'){assert.equal(primaryHits.length,1);assert(Math.abs(primaryHits[0].n-base*7.1)<.001)}
 assert.equal(combat.castAncientSkill(a,p,id,dir,c,now+3200),'技能冷却中');
 const count=hits.length;combat.tickAncientSkills(a,p,c,.1,now+3300);assert.equal(hits.length,count);
 assert(skills.skillDescription(id,1,true));assert(skills.skillBookName(skills.skillBook(id),true));
}
p.skills.triplecut=0;for(const cost of [1,2,4,8]){p.materials['skillbook:triplecut']=cost;assert.equal(skills.trainSkill(p,'triplecut'),null);assert.equal(p.materials['skillbook:triplecut'],0)}
const a={name:'sword',x:0,z:50,y:1.7,hp:100,weapon:p.weapons[0]},c={map:'tribe',monsters:[],damage(){throw Error('No target')},fx(){}};
assert.equal(combat.castAncientSkill(a,p,'triplecut',dir,c,now),'请瞄准可见的敌人');assert(!a.skillRuntime.cooldowns.triplecut);
console.log('PASS: Swordmaster four skills, 100/50/25 triple hits, six rain strikes, delayed giant sword, moving target lock, no duplicate hits, cooldowns, books, translations, no-target guard.');
