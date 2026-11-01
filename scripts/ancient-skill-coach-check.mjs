// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {newAncientProfile} from '../public/ancient-rules.js';
import {MAIN_QUESTS} from '../public/ancient-quests.js';
import {PROFESSIONS} from '../public/ancient-skills.js';
class Element{
 constructor(){this.children=[];this.style={};this.classList={toggle(){},add(){}};this.isConnected=true}
 append(n){this.children.push(n)}replaceChildren(){this.children=[]}setAttribute(){}scrollIntoView(){this.scrolled=true}focus(){this.focused=true}
}
globalThis.document={createElement:()=>new Element(),getElementById:()=>new Element()};
const {createAncientSkillUI}=await import('../public/ancient-skill-ui.js');
const flatten=e=>[e,...e.children.flatMap(flatten)];
for(const english of [false,true])for(const job of Object.keys(PROFESSIONS)){
 const p=newAncientProfile();p.materials['supply:transfer']=1;p.quest={step:MAIN_QUESTS.findIndex(q=>q.kind==='profession'),count:0};let calls=[];
 const ui=createAncientSkillUI({getProfile:()=>p,getPlayer:()=>null,en:()=>english,action:async(...args)=>calls.push(args)}),card=new Element();ui.render(card);
 let elements=flatten(card);assert(elements.some(e=>e.className==='ancientSkillCoach'));
 await elements.find(e=>e.textContent===PROFESSIONS[job].icon+' '+(english?PROFESSIONS[job].en:PROFESSIONS[job].name)).onclick();assert.equal(calls.length,0,'Preview must not choose profession');
 elements=flatten(card);await elements.find(e=>e.className==='ancientProfessionConfirm').onclick();assert.equal(calls[0][0],'chooseProfession');assert.equal(calls[0][1].job,job);
 p.profession=job;p.quest.step=MAIN_QUESTS.findIndex(q=>q.kind==='trainQ');p.materials['skillbook:'+PROFESSIONS[job].skills[0]]=1;
 card.replaceChildren();ui.render(card);elements=flatten(card);const locator=elements.find(e=>e.textContent===(english?'Find the Q activation button ↓':'定位 Q 技能激活按钮 ↓'));assert(locator);locator.onclick();
 const target=elements.find(e=>e.focused);assert(target&&!target.disabled);await target.onclick();assert.equal(calls.at(-1)[0],'trainSkill');assert.equal(calls.at(-1)[1].id,PROFESSIONS[job].skills[0]);
}
console.log('PASS: all professions, both languages, preview/confirmation separation and exact Q activation targeting.');
