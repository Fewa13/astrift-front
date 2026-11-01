// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {combat,skills} from './ancient-test-modules.mjs';
import {newAncientProfile} from '../public/ancient-rules.js';
import {ancientSkillDamage} from '../public/ancient-gear.js';
for(const level of [20,50,80,150])for(const n of [1,3,6])for(const holy of [false,true]){
 const p=newAncientProfile();p.level=level;p.profession='curse';p.skills={hex:n,drain:n,doom:n};if(holy)p.ascension={jobs:{curse:{permit:true,step:3,count:0,holy:true}}};
 const now=Date.now(),a={name:'curse-qa',x:0,y:1.7,z:50,hp:100,maxHp:100000,weapon:p.weapons[0]},m={id:'target',kind:'grox',x:0,z:55,hp:1e15,maxHp:1e15},hits=[];
 const c={map:'tribe',monsters:[m],damage:(v,d)=>{hits.push(d);return d},fx(){}},dir=[0,-.15,Math.sqrt(1-.15**2)],body=ancientSkillDamage(p)*(holy?2.5:1);
 const near=(x,y)=>assert(Math.abs(x-y)<Math.max(1,Math.abs(y))*1e-9,`${level}/${n}/${holy}: ${x} != ${y}`);
 assert.equal(combat.castAncientSkill(a,p,'drain',dir,c,now),null);near(hits.pop(),body*(4+.4*n));
 assert.equal(combat.castAncientSkill(a,p,'hex',dir,c,now+11000),null);near(hits.pop(),body*(3.2+.3*n)*1.2);
 const hp=a.hp;assert.equal(combat.castAncientSkill(a,p,'drain',dir,c,now+11001),null);near(hits.pop(),body*(4+.4*n)*1.5);assert(a.hp-hp<=a.maxHp*.2+1e-8,'healing cap unchanged');
 assert(combat.castAncientSkill(a,p,'drain',dir,c,now+11002),'cooldown enforced');
 assert.equal(combat.castAncientSkill(a,p,'drain',dir,c,now+30000),null);near(hits.pop(),body*(4+.4*n));
 assert.equal(combat.castAncientSkill(a,p,'doom',dir,c,now+30001),null);near(m.dots[0].damage,body*(.8+.08*n));
 assert(skills.skillDescription('drain',n).includes('50%'));assert(skills.skillDescription('drain',n,true).includes('50%'));
}
console.log('PASS: 24 level/skill/holy cases; Hex +20%, active-Hex Drain +50%, expired/unmarked targets unchanged, healing cap and cooldown enforced, Doom unchanged.');
