// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {build} from 'esbuild';

const module=await build({stdin:{contents:`
 export {ADVANCED_PROFESSIONS,ADVANCEMENT_KEYS} from './src/ancient-advanced-professions';
 export {reconcileAdvancementRuntime} from './src/ancient-advancement-combat';
 export {chooseAdvancement} from './src/ancient-advancement-progress';
 export {castAncientSkill,tickAncientSkills} from './src/ancient-skill-combat';
 export {newAncientProfile} from './src/ancient-rules';
 export {PROFESSIONS,isFusionJob} from './src/ancient-skills';
 `,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const {reconcileAdvancementRuntime,ADVANCED_PROFESSIONS,ADVANCEMENT_KEYS,chooseAdvancement,castAncientSkill,tickAncientSkills,newAncientProfile,PROFESSIONS,isFusionJob}=await import(
 'data:text/javascript;base64,'+Buffer.from(module.outputFiles[0].text).toString('base64')
);
const {advancementEffectIds}=await import('../public/ancient-advancement-fx.js');
const fxIds=new Set(advancementEffectIds);

let verified=0;
for(const [profession,routes] of Object.entries(ADVANCED_PROFESSIONS))for(const route of routes){
 const profile=newAncientProfile(),name='tester';
 profile.profession=profession;profile.level=150;
 profile.ascension={jobs:{[profession]:{holy:true}},attempts:0,day:''};
 profile.skills=Object.fromEntries(PROFESSIONS[profession].skills.map(id=>[id,8]));
 if(isFusionJob(profession))profile.fusedJobs={[profession]:true};
 assert(chooseAdvancement(profile,route.id),route.id);
 const actor={name,profession,advancement:route.id,holy:true,x:0,y:1.7,z:10,hp:50000,maxHp:100000,weapon:profile.weapons[0]};
 const monsters=[
  {id:'main',kind:'grox',x:0,y:0,z:16,hp:9e12,maxHp:9e12},
  {id:'left',kind:'grox',x:-4,y:0,z:20,hp:9e12,maxHp:9e12},
  {id:'right',kind:'grox',x:4,y:0,z:20,hp:9e12,maxHp:9e12},
  {id:'boss',kind:'chief',x:6,y:0,z:21,hp:9e12,maxHp:9e12},
 ];
 const events=[];
 const context={
  map:'tribe',monsters,
  damage(target,amount,source,id){assert(Number.isFinite(amount)&&amount>=0,id);if(target.hp<=0)return 0;const actual=Math.min(target.hp,amount);target.hp-=actual;return actual;},
  fx(id,x,z,radius){assert(fxIds.has(id)||id==='petHit',id);assert([x,z,radius].every(Number.isFinite),id);events.push(id);},
  motion(point){Object.assign(actor,point);},
 };
 const aim=[0,-.09,Math.sqrt(1-.09**2)];
 const bossAim=[6,-.55,11].map(v=>v/Math.hypot(6,.55,11));
 const resetPosition=()=>Object.assign(actor,{x:0,y:1.7,z:10});
 for(const [index,key] of ADVANCEMENT_KEYS.entries()){
  const now=100000+index*1200+(route.id==='paladin'&&key==='C'?8000:0),tag='advanced:'+key;
  resetPosition();
  if(route.id==='blademaster'&&key==='C')assert.equal(castAncientSkill(actor,profile,'advanced:X',aim,context,now+6000),null);
  if(route.id==='abyss-king'&&key==='C')actor.skillRuntime.advancedAbyss.energy=40;
  const before=events.length;
  const result=castAncientSkill(actor,profile,tag,route.id==='paladin'&&key==='C'?bossAim:aim,context,now);
  assert.equal(result,null,route.id+' '+key+': '+result);
  assert(events.length>before,route.id+' '+key+' emitted no effect');
  const rank=profile.advancements[profession].skills[key].level;
  assert.equal(rank,isFusionJob(profession)?1:PROFESSIONS[profession].skills.length===3&&key==='X'?1:8);
  tickAncientSkills(actor,profile,context,.2,now+200);
  assert(Number.isFinite(actor.hp)&&[actor.x,actor.y,actor.z].every(Number.isFinite),route.id+' '+key);
  verified++;
 }
 const saved=structuredClone(actor.skillRuntime);
 const returning={...actor,skillRuntime:structuredClone(saved)};
 reconcileAdvancementRuntime(returning,profile,'tribe');
 assert.deepEqual(returning.skillRuntime,saved,route.id+' same-map reconnect');
 const switched={...actor,skillRuntime:structuredClone(saved)};
 reconcileAdvancementRuntime(switched,profile,'forest');
 assert.equal(switched.skillRuntime.advancementIdentity,'forest|'+route.id);
 assert.deepEqual(switched.skillRuntime.cooldowns,saved.cooldowns);
 for(const k of Object.keys(saved).filter(k=>k.startsWith('advanced')))assert.equal(switched.skillRuntime[k],undefined);
 const defeated={...actor,hp:0,skillRuntime:structuredClone(saved)};
 reconcileAdvancementRuntime(defeated,profile,'tribe',true);
 assert.equal(defeated.skillRuntime.summon,undefined);
 assert.deepEqual(defeated.skillRuntime.cooldowns,saved.cooldowns);

}
assert.equal(verified,104);
console.log('PASS: all 104 skill slots cast through the authoritative combat entry and emit registered visuals.');
