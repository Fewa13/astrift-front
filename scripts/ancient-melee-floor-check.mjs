// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import {build} from 'esbuild';
const built=await build({stdin:{contents:`export * from './src/ancient-gear';export * from './src/ancient-melee-balance';export {PROFESSIONS,SKILLS,isFusionJob} from './src/ancient-skills';export {ADVANCED_PROFESSIONS} from './src/ancient-advanced-professions';export {chooseAdvancement} from './src/ancient-advancement-progress';export {castAncientSkill,tickAncientSkills} from './src/ancient-skill-combat';export {newAncientProfile} from './src/ancient-rules';`,resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node'});
const M=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));let cases=0;
function fixture(job,level,rank,holy=true,route){const p=M.newAncientProfile();Object.assign(p,{level,profession:job,gear:[{id:'blade',key:level>=200?'blade8':'stoneRough',affixBonusVersion:1,affixes:[],hiddenAffixes:[]}],gearEquipped:{weapon:'blade'},skills:Object.fromEntries(M.PROFESSIONS[job].skills.map(id=>[id,rank])),ascension:{jobs:{[job]:{holy}},day:'',attempts:0}});if(M.isFusionJob(job)){p.fusedJobs={[job]:true};p.mastery=Object.fromEntries(M.PROFESSIONS[job].skills.map(id=>[id,{level:rank,points:0}]))}if(route)assert(M.chooseAdvancement(p,route));return p;}
for(const level of [1,80,150,260,300])for(const rank of [1,5,12,50,100])for(const holy of [false,true])for(const job of Object.keys(M.PROFESSIONS)){
 const p=fixture(job,level,rank,holy),reference=M.meleeBasicSkillReference(p);if(!reference)continue;
 const reduction=M.isFusionJob(job)?.85:1,damage=M.ancientMeleeDamage(p)*reduction,skill=M.ancientSkillDamage(p)*reference.multiplier;
 assert(Math.floor(damage)>=Math.ceil(Math.floor(skill)/5),`${job} Lv${level} rank ${rank}`);const base=M.ancientSkillDamage(p),before=M.ancientMeleeDamage(p);p.gear[0].affixes=[{key:'weaponDamage',value:.08}];assert.equal(M.ancientSkillDamage(p),base);assert(M.ancientMeleeDamage(p)>=before);cases++;
}
// Skill-only boss and low-health gear bonuses must not break the floor against those targets.
for(const job of ['swordsman','voidsword','elementalist']){const p=fixture(job,300,100);p.gear[0].affixes=[{key:'starHunter',value:.12},{key:'primalVerdict',value:.16}];const stats=M.ancientGearStats(p),ref=M.meleeBasicSkillReference(p);assert(M.ancientMeleeDamage(p)*(M.isFusionJob(job)?.85:1)>=M.ancientSkillDamage(p)*ref.multiplier*(1+stats.bossSkill)*(1+stats.finisherSkill)/5);}
for(const job of ['warrior','swordsman','shadowblade','stonewright','summoner','ice','fire','lightning','curse'])for(const rank of [5,50,100]){
 const p=fixture(job,300,rank),ref=M.meleeBasicSkillReference(p),a={name:'test',profession:job,holy:true,x:0,y:1.7,z:10,hp:10000,maxHp:10000,weapon:p.weapons[0]},m={id:'target',kind:'grox',x:0,y:0,z:14,hp:1e15,maxHp:1e15},hits=[],c={map:'tribe',monsters:[m],fx(){},damage(_m,n){hits.push(n);return n}};
 assert.equal(M.castAncientSkill(a,p,ref.id,[0,0,1],c,100000),null);hits.push(...(m.strikes||[]).map(v=>v.damage));assert(hits.length,job);assert(M.ancientMeleeDamage(p)>=Math.max(...hits)/5);cases++;
}
// Compare to real direct skill damage, rather than testing only the reference helper itself.
for(const [job,routes] of Object.entries(M.ADVANCED_PROFESSIONS))for(const route of routes){
 const rule=M.ADVANCEMENT_BASIC_REFERENCES[route.id];if(!rule){assert.equal(job,'summoner');continue;}
 for(const rank of [5,50,100]){
  const p=fixture(job,300,rank,true,route.id),a={name:'test',profession:job,holy:true,x:0,y:1.7,z:10,hp:10000,maxHp:10000,weapon:p.weapons[0]},m={id:'target',kind:'grox',x:0,y:0,z:14,hp:1e15,maxHp:1e15},hits=[],context={map:'tribe',monsters:[m],fx(){},damage(_m,n){hits.push(n);return n}};
  assert.equal(M.castAncientSkill(a,p,'advanced:'+rule.key,[0,-.1,Math.sqrt(.99)],context,100000),null,route.id);
  M.tickAncientSkills(a,p,context,.1,100300);
  assert(hits.length,route.id+' deals a real hit');assert(M.ancientMeleeDamage(p)+1e-6>=Math.max(...hits)/5,route.id+' authoritative basic skill');cases++;
 }
}
for(const job of ['elementalist','voidsword','abyssal','chrono'])for(const rank of [1,12,100]){
 const p=fixture(job,300,rank),a={name:'test',profession:job,holy:true,x:0,y:1.7,z:10,hp:10000,maxHp:10000,weapon:p.weapons[0]},m={id:'target',kind:'grox',x:0,y:0,z:14,hp:1e15,maxHp:1e15},hits=[],context={map:'tribe',monsters:[m],fx(){},damage(_m,n){hits.push(n);return n}},ref=M.meleeBasicSkillReference(p);
 assert.equal(M.castAncientSkill(a,p,ref.id,[0,0,1],context,100000),null);assert(hits.length);assert(M.ancientMeleeDamage(p)*.85+1e-6>=Math.max(...hits)/5);cases++;
}
console.log('PASS: '+cases+' melee floors across professions, Holy/fusion routes, Lv1–300, rank1–100, authoritative skill hits, weapon affixes and unchanged skill strength.');
