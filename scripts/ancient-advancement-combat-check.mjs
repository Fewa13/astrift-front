// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {build} from 'esbuild';

const module=await build({stdin:{contents:`
 export {ADVANCED_PROFESSIONS,ADVANCEMENT_KEYS} from './src/ancient-advanced-professions';
 export {reconcileAdvancementRuntime,summonTarget,recordNecromancerKill,tickAdvancedSummon} from './src/ancient-advancement-combat';
 export {chooseAdvancement} from './src/ancient-advancement-progress';
 export {castAncientSkill,tickAncientSkills} from './src/ancient-skill-combat';
 export {newAncientProfile} from './src/ancient-rules';
 export {PROFESSIONS,isFusionJob} from './src/ancient-skills';
 `,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const {summonTarget,recordNecromancerKill,tickAdvancedSummon,reconcileAdvancementRuntime,ADVANCED_PROFESSIONS,ADVANCEMENT_KEYS,chooseAdvancement,castAncientSkill,tickAncientSkills,newAncientProfile,PROFESSIONS,isFusionJob}=await import(
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
 const events=[],damageEvents=[];
 const context={
  map:'tribe',monsters,
  damage(target,amount,source,id){damageEvents.push({target:target.id,id,amount});assert(Number.isFinite(amount)&&amount>=0,id);if(target.hp<=0)return 0;const actual=Math.min(target.hp,amount);target.hp-=actual;return actual;},
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
 if(route.id==='stormcaller'){
  const start=103600;
  const first=damageEvents.length;
  tickAncientSkills(actor,profile,context,.2,start+300);
  const a=damageEvents.slice(first).filter(event=>event.id==='advancement:stormcaller:C');
  const second=damageEvents.length;
  tickAncientSkills(actor,profile,context,.2,start+850);
  const b=damageEvents.slice(second).filter(event=>event.id==='advancement:stormcaller:C');
  assert(a.length>0&&b.length>0);
  assert(b.every(event=>!a.some(prior=>prior.target===event.target)),'different enemies are struck on round two');
  const third=damageEvents.length;
  tickAncientSkills(actor,profile,context,.2,start+1400);
  const c=damageEvents.slice(third).filter(event=>event.id==='advancement:stormcaller:C');
  assert(c.length>0&&new Set(c.map(event=>event.target)).size===c.length);
  assert.equal(actor.skillRuntime.stormcaller.heavenfall,undefined);
  tickAncientSkills(actor,profile,context,.2,start+1950);
  assert.equal(damageEvents.slice(third).filter(event=>event.id==='advancement:stormcaller:C').length,c.length);
 }
 if(route.id==='voltstalker'){
  resetPosition();
  monsters.push(
   {id:'dash-ground',kind:'grox',x:0,y:0,z:14,hp:9e12,maxHp:9e12},
   {id:'dash-upper',kind:'grox',x:0,y:4,z:14,hp:9e12,maxHp:9e12},
  );
  const first=damageEvents.length;
  assert.equal(castAncientSkill(actor,profile,'advanced:Q',aim,context,130000),null);
  const hits=damageEvents.slice(first).filter(event=>event.id==='advancement:voltstalker:Q');
  assert(hits.some(event=>event.target==='dash-ground'));
  assert(!hits.some(event=>event.target==='dash-upper'),'dash must not hit an enemy on the floor above');
 }
 if(route.id==='spiritcaller'||route.id==='necromancer'){
  const dormant={...monsters[0],id:'dormant',z:12,dormant:true,target:actor.name};
  const attacker={...monsters[0],id:'attacker',z:22,target:actor.name};
  const preferred={...monsters[0],id:'preferred',z:26};
  const selection={...context,monsters:[dormant,monsters[0],attacker,preferred]};
  actor.skillRuntime.advancedPriority=dormant.id;
  assert.equal(summonTarget(actor,selection,0,10)?.id,attacker.id);
  actor.skillRuntime.advancedPriority=preferred.id;
  assert.equal(summonTarget(actor,selection,0,10)?.id,preferred.id);
 }
 if(route.id==='necromancer'){
  const now=103800;
  assert.equal(recordNecromancerKill(actor,profile,{level:20,kind:'grox'},now),false);
  assert.equal(recordNecromancerKill(actor,profile,{level:150,kind:'grox'},now),true);
  assert.equal(profile.necromancerStrength,7.5);
  assert.equal(recordNecromancerKill(actor,profile,{level:150,kind:'grox'},now+12000),false);
  assert.equal(profile.necromancerStrength,7.5);
 }
 if(route.id==='necromancer'){
  const state=actor.skillRuntime.advancedSummon,now=200000;
  state.legion=Array.from({length:18},(_,slot)=>({slot,x:0,z:10,until:now,next:now,scale:1}));
  state.reserve=[1];
  assert.equal(castAncientSkill(actor,profile,'advanced:Q',aim,context,now),null);
  assert.equal(state.legion.length,1);
  assert.equal(state.legion[0].slot,0);
  assert.equal(state.reserve.length,0);
  const pet=state.legion[0];
  const target={...monsters[0],x:pet.x,z:pet.z+2};
  const duel={...context,monsters:[target]};
  const hit=field=>{
   state.field=field;
   pet.next=now;
   tickAdvancedSummon(actor,profile,duel,.2,now);
   assert.equal(damageEvents.at(-1).id,'advancement:necromancer:Q');
   return damageEvents.at(-1).amount;
  };
  const normal=hit(undefined);
  const field={x:pet.x,y:0,z:pet.z,until:now+1000,radius:4};
  assert.equal(hit(field),normal*1.2);
  assert.equal(target.weak,.2);
  const advance=field=>{
   state.field=field;
   pet.z=fieldOrigin;
   tickAdvancedSummon(actor,profile,{...context,monsters:[{...target,z:fieldOrigin+8}]},.2,now);
   return pet.z-fieldOrigin;
  };
  const fieldOrigin=pet.z;
  assert(Math.abs(advance(field)-advance(undefined)*1.2)<1e-9);

 }
 if(route.id==='spiritcaller'){
  const now=200000;
  actor.skillRuntime.summon.until=now;
  actor.skillRuntime.advancedSummon.revivalUntil=now+1000;
  assert.equal(castAncientSkill(actor,profile,'advanced:C',aim,context,now),'需要一个在场的圣灵护卫');
  assert.equal(castAncientSkill(actor,profile,'advanced:X',aim,context,now),null);
  assert.equal(actor.skillRuntime.advancedSummon.revivalUntil,undefined);
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

{
 const profile=newAncientProfile();
 profile.profession='swordsman';
 profile.level=150;
 profile.skills={triplecut:8,swordrain:8};
 const actor={name:'sword-test',profession:'swordsman',x:0,y:1.7,z:10,hp:100000,maxHp:100000};
 const target={id:'sword-target',kind:'grox',x:0,y:0,z:16,hp:9e12,maxHp:9e12};
 const hits=[];
 const context={map:'tribe',monsters:[target],fx(){},damage(_target,amount,_source,id){hits.push(id);return amount;}};
 const aim=[0,-.09,Math.sqrt(1-.09**2)];
 assert.equal(castAncientSkill(actor,profile,'swordrain',aim,context,100000),null);
 assert.equal(castAncientSkill(actor,profile,'triplecut',aim,context,100250),null);
 assert.deepEqual(hits,['triplecut']);
 tickAncientSkills(actor,profile,context,.2,100250);
 assert.deepEqual(hits,['triplecut','swordrain']);
 tickAncientSkills(actor,profile,context,.2,100550);
 assert.deepEqual(hits,['triplecut','swordrain','triplecut']);
}
