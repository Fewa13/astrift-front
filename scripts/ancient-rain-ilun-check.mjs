// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {combat} from './ancient-test-modules.mjs';
import {newAncientProfile} from '../public/ancient-rules.js';
import {ancientSkillDamage} from '../public/ancient-gear.js';
import {skillDescription} from '../public/ancient-skills.js';
import {holySkillDetails} from '../public/ancient-ascension.js';
import {QUEST_NPCS,MAIN_QUESTS,questCanTalk} from '../public/ancient-quests.js';
import {forestHeight,forestBlocked,forestLineClear} from '../public/ancient-forest.js';
for(const holy of [false,true])for(const n of [1,3,10]){
 const p=newAncientProfile();p.level=50;p.profession='swordsman';p.skills={swordrain:n};if(holy)p.ascension={jobs:{swordsman:{holy:true}}};
 const a={name:'p',x:0,z:50,y:1.7,hp:1e6,weapon:p.weapons[0]},m={id:'m',kind:'grox',x:0,z:55,hp:1e12,maxHp:1e12},hits=[];
 const c={map:'tribe',monsters:[m],damage(m,v){hits.push(v);return v},fx(){}};const now=Date.now();
 assert.equal(combat.castAncientSkill(a,p,'swordrain',[0,-.15,Math.sqrt(1-.15**2)],c,now),null);
 for(let t=200;t<=3000;t+=200)combat.tickAncientSkills(a,p,c,.2,now+t);
 assert.equal(hits.length,6);for(const h of hits)assert(Math.abs(h-ancientSkillDamage(p)*(1.4+.16*n)*(holy?2.5:1))<1e-6);
 assert(skillDescription('swordrain',n,true).includes(`${140+16*n}%`));
 assert(holySkillDetails('swordrain',n,true).includes(`${(140+16*n)*2.5}%`));
}
const npc=QUEST_NPCS.ilun;assert.equal(forestHeight(npc.x,npc.z),10);assert(!forestBlocked(npc.x,npc.z,1));
for(const q of MAIN_QUESTS.filter(q=>q.npc==='ilun')){
 const p=newAncientProfile();p.quest={step:MAIN_QUESTS.indexOf(q),count:0,revision:7};
 assert(questCanTalk(p,'ilun',{x:npc.x,z:npc.z-2,hp:100,map:'forest'},(ax,az,bx,bz)=>forestLineClear(ax,11.7,az,bx,11.7,bz)));
 assert(!questCanTalk(p,'ilun',{x:12,z:168,hp:100,map:'forest'}),'old NPC position no longer interacts');
}
console.log('PASS: six rain hits at doubled damage, normal/holy descriptions agree; Ilun on unobstructed height-10 connecting platform, all linked dialogue reachable.');
