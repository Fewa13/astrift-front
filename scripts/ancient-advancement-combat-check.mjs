// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {build} from 'esbuild';

const module=await build({stdin:{contents:`
 export {ADVANCED_PROFESSIONS,ADVANCEMENT_KEYS} from './src/ancient-advanced-professions';
 export {reconcileAdvancementRuntime,summonTarget,recordNecromancerKill,tickAdvancedSummon,tickPaladin} from './src/ancient-advancement-combat';
 export {chooseAdvancement,advancementCost,awardAdvancementMastery} from './src/ancient-advancement-progress';
 export {castAncientSkill,tickAncientSkills,monsterOutgoing,monsterSpeed} from './src/ancient-skill-combat';
 export {newAncientProfile} from './src/ancient-rules';
 export {fuseAncientProfession,chooseAncientProfession} from './src/ancient-commerce';
 export {PROFESSION_FUSIONS,PROFESSIONS,SKILLS,isFusionJob,skillHealth} from './src/ancient-skills';
 `,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const {fuseAncientProfession,chooseAncientProfession,PROFESSION_FUSIONS,summonTarget,recordNecromancerKill,tickAdvancedSummon,tickPaladin,reconcileAdvancementRuntime,ADVANCED_PROFESSIONS,ADVANCEMENT_KEYS,chooseAdvancement,advancementCost,awardAdvancementMastery,castAncientSkill,tickAncientSkills,monsterOutgoing,monsterSpeed,newAncientProfile,PROFESSIONS,SKILLS,isFusionJob,skillHealth}=await import(
 'data:text/javascript;base64,'+Buffer.from(module.outputFiles[0].text).toString('base64')
);
const {advancementEffectIds}=await import('../public/ancient-advancement-fx.js');
const fxIds=new Set(advancementEffectIds);

export const castVisuals=[];
let verified=0;
for(const [profession,routes] of Object.entries(ADVANCED_PROFESSIONS))for(const route of routes){
 const profile=newAncientProfile(),name='tester';
 profile.profession=profession;profile.level=150;
 profile.ascension={jobs:{[profession]:{holy:true}},attempts:0,day:''};
 profile.skills=Object.fromEntries(PROFESSIONS[profession].skills.map(id=>[id,8]));
 if(isFusionJob(profession)){
  profile.fusedJobs={[profession]:true};
  profile.mastery=Object.fromEntries(PROFESSIONS[profession].skills.map((id,index)=>[id,{level:5+index,points:9+index}]));
 }
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
  fx(id,x,z,radius,details){assert(fxIds.has(id)||id==='petHit',id);assert([x,z,radius].every(Number.isFinite),id);events.push(id);castVisuals.push({id,x,z,radius,details});},
  motion(point){Object.assign(actor,point);},
 };
 const aim=[0,-.09,Math.sqrt(1-.09**2)];
 const bossAim=[6,-.55,11].map(v=>v/Math.hypot(6,.55,11));
 const resetPosition=()=>Object.assign(actor,{x:0,y:1.7,z:10});
 for(const [index,key] of ADVANCEMENT_KEYS.entries()){
  let now=100000+index*1200+(route.id==='paladin'&&key==='C'?8000:0);const tag='advanced:'+key;
  resetPosition();
  if(route.id==='blademaster'&&key==='C'){
   const ride=actor.skillRuntime.advancedSword;
   assert(ride.flightUntil>now);
   assert.equal(castAncientSkill(actor,profile,'advanced:C',aim,context,now),null);
   assert(ride.descending);
   const recastAt=ride.flightUntil+1;
   assert.equal(castAncientSkill(actor,profile,'advanced:X',aim,context,recastAt),null);
   now=ride.flightUntil+1;
  }
  if(route.id==='abyss-king'&&key==='C')actor.skillRuntime.advancedAbyss.energy=40;
  const before=events.length;
  const result=castAncientSkill(actor,profile,tag,route.id==='paladin'&&key==='C'?bossAim:aim,context,now);
  assert.equal(result,null,route.id+' '+key+': '+result);
  assert(events.length>before,route.id+' '+key+' emitted no effect');
  const rank=profile.advancements[profession].skills[key].level;
  const previous=PROFESSIONS[profession].skills.find(id=>SKILLS[id].key===key);
  const inherited=profile.mastery?.[previous];
  assert.equal(rank,inherited?.level??(previous?8:1));
  assert.equal(profile.advancements[profession].skills[key].points,inherited?.points??0);
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
  const lone={...monsters[0],hp:9e12};
  const duel={...context,monsters:[lone]};
  const recast=180000;
  assert.equal(castAncientSkill(actor,profile,'advanced:C',aim,duel,recast),null);
  for(const delay of [300,850,1400]){
   const before=damageEvents.length;
   tickAncientSkills(actor,profile,duel,.2,recast+delay);
   assert.equal(damageEvents.slice(before).filter(event=>event.id==='advancement:stormcaller:C').length,1);
  }

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
 if(route.id==='spiritcaller'||route.id==='beastlord'){
  const dormant={...monsters[0],id:'dormant',z:12,dormant:true,target:actor.name};
  const attacker={...monsters[0],id:'attacker',z:22,target:actor.name};
  const preferred={...monsters[0],id:'preferred',z:26};
  const selection={...context,monsters:[dormant,monsters[0],attacker,preferred]};
  actor.skillRuntime.advancedPriority=dormant.id;
  assert.equal(summonTarget(actor,selection,0,10)?.id,attacker.id);
  actor.skillRuntime.advancedPriority=preferred.id;
  assert.equal(summonTarget(actor,selection,0,10)?.id,preferred.id);
 }
 if(route.id==='spiritcaller'){
  const state=actor.skillRuntime.advancedSummon,pet=actor.skillRuntime.summon;
  const rebirthAt=112000;
  assert(state.revivalUntil>rebirthAt);
  pet.hp=0;
  tickAdvancedSummon(actor,profile,{...context,monsters:[]},0,rebirthAt);
  assert.equal(pet.hp,Math.floor(pet.maxHp*.3));
  assert.equal(state.revivalUntil,undefined);
  pet.hp=0;
  tickAdvancedSummon(actor,profile,{...context,monsters:[]},0,rebirthAt+500);
  assert.equal(pet.hp,0);
  pet.hp=1;
  state.field={x:pet.x,y:0,z:pet.z,until:rebirthAt+1500,radius:4};
  tickAdvancedSummon(actor,profile,{...context,monsters:[]},1,rebirthAt+1000);
  assert.equal(pet.hp,1+pet.maxHp*.03);
  const now=200000;
  pet.until=now;
  actor.skillRuntime.advancedSummon.revivalUntil=now+1000;
  assert.equal(castAncientSkill(actor,profile,'advanced:C',aim,context,now),'需要一个在场的圣灵护卫');
  assert.equal(castAncientSkill(actor,profile,'advanced:X',aim,context,now),null);
  assert.equal(actor.skillRuntime.advancedSummon.revivalUntil,undefined);
 }
 const record=profile.advancements[profession],level=record.skills.X.level;
 const initialQ=structuredClone(record.skills.Q);
 const cost=advancementCost(level)-record.skills.X.points;
 assert.equal(awardAdvancementMastery(profile,route.id,'X',cost-1),false);
 assert.equal(record.skills.X.points,advancementCost(level)-1);
 assert.equal(awardAdvancementMastery(profile,route.id,'X',2),true);
 assert.deepEqual(record.skills.X,{level:level+1,points:1});
 assert.deepEqual(record.skills.Q,initialQ);
 assert.equal(awardAdvancementMastery(profile,'unknown','X',cost),false);
 assert(chooseAdvancement(profile,route.id));
 assert.equal(chooseAdvancement(profile,routes.find(other=>other.id!==route.id).id),false);
 assert.deepEqual(record.skills.X,{level:level+1,points:1});
 if(route.id==='paladin'){
  const now=150000;
  const ally={...monsters[0],id:'ally',charm:{owner:name,until:now+1000,next:now}};
  const dormant={...ally,id:'dormant',charm:undefined,dormant:true,z:17};
  const player={...dormant,id:'player',kind:'player',dormant:false};
  const expired={...ally,id:'expired',z:18,charm:{owner:name,until:now,next:now}};
  const before=damageEvents.length;
  tickPaladin(actor,profile,{...context,monsters:[ally,dormant,player,expired]},now);
  assert.deepEqual(damageEvents.slice(before).map(hit=>hit.target),['expired']);
  resetPosition();
  actor.hp=50000;
  const victim={...monsters[0],id:'recovery-target',z:13,hp:100,maxHp:100};
  const friendly={...victim,id:'still-purified',z:14,charm:{owner:name,until:now+1000,next:now}};
  assert.equal(castAncientSkill(actor,profile,'advanced:Q',aim,{...context,monsters:[victim,friendly]},now),null);
  assert.equal(victim.hp,0);
  assert.equal(friendly.hp,100);
  assert.equal(actor.hp,50020,'recovery heals from actual damage rather than overkill');
  assert.equal(actor.skillRuntime.effects.radiantRecovery.until,now+8000);

 }
 if(route.id==='berserker'){
  resetPosition();
  const bolt=(hp,now)=>{
   actor.hp=hp;
   const before=damageEvents.length;
   assert.equal(castAncientSkill(actor,profile,'advanced:X',aim,context,now),null);
   const [hit]=damageEvents.slice(before);
   assert.equal(hit.id,'advancement:berserker:X');
   return hit.amount;
  };
  skillHealth(actor,100000,132000);

  const full=bolt(100000,132000);
  const low=bolt(25000,142000);
  assert(Math.abs(low/full-(1+.35*.75)*(1+.75))<1e-9);
  actor.hp=90000;
  skillHealth(actor,100000,149999);
  assert.equal(castAncientSkill(actor,profile,'advanced:Q',aim,context,150000),null);
  assert.equal(actor.maxHp,70000);
  assert.equal(actor.hp,70000);
  actor.skillRuntime.cooldowns['advanced:Q']=0;
  assert.equal(castAncientSkill(actor,profile,'advanced:Q',aim,context,151000),null);
  assert.equal(actor.maxHp,70000,'refreshing Sacrifice must not reduce the cap twice');
  skillHealth(actor,100000,163000);
  assert.equal(actor.maxHp,100000);
  assert.equal(actor.hp,70000);
  resetPosition();
  let destination;
  const chargeContext={...context,motion(point){destination=point;}};
  const start=180000,before=damageEvents.length,firstEffect=events.length;
  assert.equal(castAncientSkill(actor,profile,'advanced:Z',aim,chargeContext,start),null);
  tickAncientSkills(actor,profile,chargeContext,.1,start+100);
  assert.equal(damageEvents.length,before);
  assert.deepEqual(events.slice(firstEffect),['berserker-charge']);
  Object.assign(actor,destination);
  tickAncientSkills(actor,profile,chargeContext,.1,start+250);
  assert(damageEvents.slice(before).some(hit=>hit.target==='main'&&hit.id==='advancement:berserker:Z'));
  assert.deepEqual(events.slice(firstEffect),['berserker-charge','berserker-impact']);
  const after=damageEvents.length;
  tickAncientSkills(actor,profile,chargeContext,.1,start+350);
  assert.equal(damageEvents.length,after);
  resetPosition();
  assert.equal(castAncientSkill(actor,profile,'advanced:Z',aim,chargeContext,start+60000),null);
  tickAncientSkills(actor,profile,chargeContext,.1,start+61000);
  assert.equal(damageEvents.length,after,'interrupted charge cannot deal damage');
  resetPosition();
  const next=start+120000;
  assert.equal(castAncientSkill(actor,profile,'advanced:Z',aim,chargeContext,next),null);
  Object.assign(actor,destination);
  tickAncientSkills(actor,profile,{...chargeContext,canMove:()=>false},.1,next+250);
  assert.equal(damageEvents.length,after,'a newly closed gate prevents charge impact');
  resetPosition();
  const last=start+180000;
  const splashContext={...chargeContext,canMove:(_x,z,nx)=>z!==16||nx>=0};
  assert.equal(castAncientSkill(actor,profile,'advanced:Z',aim,splashContext,last),null);
  Object.assign(actor,destination);
  tickAncientSkills(actor,profile,splashContext,.1,last+250);
  const hits=damageEvents.slice(after);
  const main=hits.find(hit=>hit.target==='main');
  const splash=hits.find(hit=>hit.target==='right');
  assert(main&&splash);
  assert(Math.abs(splash.amount/main.amount-.4)<1e-9);
  assert(!hits.some(hit=>hit.target==='left'),'gate blocks charge splash');


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

for(const [job,{sources}] of Object.entries(PROFESSION_FUSIONS)){
 const profile=newAncientProfile();
 profile.level=150;
 profile.ascension={jobs:{},attempts:0,day:''};
 for(const source of sources){
  profile.profession=source;
  profile.ascension.jobs[source]={holy:true};
  for(const id of PROFESSIONS[source].skills)(profile.skills??={})[id]=5;
  assert(chooseAdvancement(profile,ADVANCED_PROFESSIONS[source][0].id),source);
 }
 assert.equal(fuseAncientProfession(profile,job),null,job);
 assert.equal(profile.profession,job);
 const saved=JSON.parse(JSON.stringify(profile));
 for(const source of sources)assert.equal(chooseAncientProfession(saved,source),'职业不可用');
 if(!ADVANCED_PROFESSIONS[job])continue;
 assert(chooseAdvancement(saved,ADVANCED_PROFESSIONS[job][1].id),job);
 for(const key of ADVANCEMENT_KEYS)assert.deepEqual(saved.advancements[job].skills[key],{level:1,points:0});
}

{
 const monster={
  judgment:{owner:'paladin',until:11000,maxHp:1000},
  weak:.55,weakUntil:6000,slow:.15,slowUntil:16000,
 };
 const expect=(now,damage,speed)=>{
  assert(Math.abs(monsterOutgoing(monster,now)-damage)<1e-9);
  assert(Math.abs(monsterSpeed(monster,now)-speed)<1e-9);
 };
 expect(5000,.45,.7);
 expect(6000,.7,.7);
 expect(11000,1,.85);
 expect(16000,1,1);
}

{
 const profile=newAncientProfile(),name='necromancer-check';
 profile.level=150;profile.profession='summoner';
 profile.skills=Object.fromEntries(['summoner','curse'].flatMap(job=>PROFESSIONS[job].skills.map(id=>[id,5])));
 assert.equal(fuseAncientProfession(profile,'necromancer'),null);
 assert(profile.consumedJobs.summoner&&profile.consumedJobs.curse);
 assert(fuseAncientProfession(profile,'abyssal'));
 const actor={name,profession:'necromancer',x:0,y:1.7,z:10,hp:500,maxHp:1000,weapon:profile.weapons[0]};
 const monster={id:'target',kind:'grox',x:0,z:12,hp:1e9};
 const hits=[],fx=[];
 const context={map:'tribe',monsters:[monster],damage(target,amount,source,id){hits.push(id);return amount;},fx(id){fx.push(id);}};
 const aim=[0,-.09,Math.sqrt(1-.09**2)],now=100000;
 for(const id of ['raiseSkeleton','unleashLegion','consumeSoul'])assert.equal(castAncientSkill(actor,profile,id,aim,context,now),null);
 assert.equal(actor.skillRuntime.advancedSummon.legion.length,1);
 assert(recordNecromancerKill(actor,profile,{level:150,kind:'grox'},now));
 assert(!recordNecromancerKill(actor,profile,{level:1,kind:'grox'},now));
 tickAdvancedSummon(actor,profile,context,.2,now+1000);
 assert(hits.includes('unleashLegion'));
 assert.match(castAncientSkill(actor,profile,'necropolis',aim,context,now),/至少需要3只/);
 assert(fx.includes('necromancer-release'));
 const state=actor.skillRuntime.advancedSummon;
 assert.equal(castAncientSkill(actor,profile,'raiseSkeleton',aim,context,now+1000),null);
 assert.equal(castAncientSkill(actor,profile,'raiseSkeleton',aim,context,now+2000),'待命骷髅已满');
 state.reserveCount=20000;
 state.reservePower=40000;
 assert.equal(castAncientSkill(actor,profile,'unleashLegion',aim,context,now+10001),null);
 assert.equal(state.reserveCount,19998);
 assert.equal(state.legion.reduce((n,pet)=>n+pet.count,0),3);
 assert.equal(state.legion.reduce((n,pet)=>n+pet.scale,0),5);
 assert.equal(castAncientSkill(actor,profile,'necropolis',aim,context,now+10002),null);
 assert.equal(state.legion.length,1);
 assert.equal(state.legion[0].merged,3);
 assert.equal(state.legion[0].hp,375);
 assert.equal(state.legion[0].scale,4.5);
 assert.equal(state.reserveCount,19998);
 assert(fx.includes('necromancer-fusion'));

}

{
 const now=100000,aim=[0,-.09,Math.sqrt(1-.09**2)];
 const fixture=(profession,passives)=>{
  const profile=newAncientProfile();
  Object.assign(profile,{profession,level:150,fusedJobs:{[profession]:true},fusionPassives:{[profession]:passives}});
  const actor={name:'fusion-qa',profession,x:0,y:1.7,z:10,hp:500,maxHp:1000,weapon:profile.weapons[0]};
  const monsters=[{id:'primary',kind:'grox',x:0,z:16,hp:1e12},{id:'secondary',kind:'grox',x:3,z:17,hp:1e12}];
  const damages=[],effects=[];
  const context={map:'tribe',monsters,damage(target,amount){damages.push(amount);target.hp-=amount;return amount;},fx(id){effects.push(id);}};
  return {profile,actor,monsters,damages,effects,cast:(id,at)=>castAncientSkill(actor,profile,id,aim,context,at)};
 };
 const passive={level:8,points:0};
 const element=fixture('elementalist',{0:passive,1:passive});
 element.actor.skillRuntime={fusion:{map:'tribe',marks:{},energy:0,resonance:8,resonanceAt:now},cooldowns:{},effects:{}};
 assert.equal(element.cast('judgment',now),null);
 assert(element.monsters.every(monster=>monster.slow>0&&monster.weak>0&&monster.dots?.length));
 assert(element.effects.includes('thermal-clash'));
 assert.equal(element.actor.skillRuntime.fusion.resonance,0);

 const voidsword=fixture('voidsword',{0:passive});
 const unlit=fixture('voidsword',{});
 const random=Math.random;
 try{Math.random=()=>0;assert.equal(voidsword.cast('voidslash',now),null);assert.equal(unlit.cast('voidslash',now),null);}
 finally{Math.random=random;}
 assert(voidsword.damages[0]>unlit.damages[0]);
 assert(!voidsword.actor.skillRuntime.fusion.marks.primary);

 const chrono=fixture('chrono',{0:passive});
 assert.equal(chrono.cast('rewind',now),null);
 const cooldowns=chrono.actor.skillRuntime.cooldowns,ends=cooldowns.rewind;
 Object.assign(cooldowns,{stasis:now+40000,temporalrift:now+5000,'artifact:origin':now+15000});
 assert.equal(chrono.cast('rewind',now+1000),null);
 assert.equal(cooldowns.stasis,undefined);
 assert.equal(cooldowns.temporalrift,undefined);
 assert.equal(cooldowns.rewind,ends);
 assert.equal(cooldowns['artifact:origin'],now+15000);
}

export {advancementCost};
