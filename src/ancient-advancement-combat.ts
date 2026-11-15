// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {isAncientBoss} from './ancient-boss';
import {advancementCastKey} from './ancient-advanced-professions';
import {advancementRoute} from './ancient-advancement-progress';
import {ancientSkillDamage, ancientGearStats} from './ancient-gear';
import {ancientMapHeight, blocked, lineClear, type AncientProfile} from './ancient-rules';
import {activeSkill, runtime, skillDamageMultiplier, SKILLS, type SkillActor} from './ancient-skills';
import {selectSkillTarget, skillAreaTargets, skillAreaHits, type SkillContext, type SkillMonster} from './ancient-skill-combat';

const berserkerCooldowns: Record<string, number> = {X:5, Q:24, Z:10, C:55};

type CastRoute = (actor:SkillActor, profile:AncientProfile, key:string, id:string, direction:unknown, context:SkillContext, now:number, level:number)=>string|null;
const castRoutes: Readonly<Record<string,CastRoute>> = {
 'time-sovereign':(a,p,k,i,d,c,n,l)=>castTimeAdvancement(a,p,'time-sovereign',k,i,d,c,n,l),
 'time-weaver':(a,p,k,i,d,c,n,l)=>castTimeAdvancement(a,p,'time-weaver',k,i,d,c,n,l),
 'abyss-king':(a,p,k,i,d,c,n,l)=>castAbyssAdvancement(a,p,'abyss-king',k,i,d,c,n,l),
 'abyss-herald':(a,p,k,i,d,c,n,l)=>castAbyssAdvancement(a,p,'abyss-herald',k,i,d,c,n,l),
 riftlord:(a,p,k,i,d,c,n,l)=>castRiftAdvancement(a,p,'riftlord',k,i,d,c,n,l),
 riftduelist:(a,p,k,i,d,c,n,l)=>castRiftAdvancement(a,p,'riftduelist',k,i,d,c,n,l),
 'elemental-god':(a,p,k,i,d,c,n,l)=>castElementalAdvancement(a,p,'elemental-god',k,i,d,c,n,l),
 'elemental-ward':(a,p,k,i,d,c,n,l)=>castElementalAdvancement(a,p,'elemental-ward',k,i,d,c,n,l),
 spiritcaller:(a,p,k,i,d,c,n,l)=>castSummonAdvancement(a,p,'spiritcaller',k,i,d,c,n,l),
 necromancer:(a,p,k,i,d,c,n,l)=>castSummonAdvancement(a,p,'necromancer',k,i,d,c,n,l),
 mountainguard:(a,p,k,i,d,c,n,l)=>castStoneAdvancement(a,p,'mountainguard',k,i,d,c,n,l),
 veinforger:(a,p,k,i,d,c,n,l)=>castStoneAdvancement(a,p,'veinforger',k,i,d,c,n,l),
 shadowhunter:(a,p,k,i,d,c,n,l)=>castShadowAdvancement(a,p,'shadowhunter',k,i,d,c,n,l),
 boundarycutter:(a,p,k,i,d,c,n,l)=>castShadowAdvancement(a,p,'boundarycutter',k,i,d,c,n,l),
 blademaster:(a,p,k,i,d,c,n,l)=>castSwordAdvancement(a,p,'blademaster',k,i,d,c,n,l),
 linebreaker:(a,p,k,i,d,c,n,l)=>castSwordAdvancement(a,p,'linebreaker',k,i,d,c,n,l),
 hexweaver:(a,p,k,i,d,c,n,l)=>castCurseAdvancement(a,p,'hexweaver',k,i,d,c,n,l),
 pactbinder:(a,p,k,i,d,c,n,l)=>castCurseAdvancement(a,p,'pactbinder',k,i,d,c,n,l),
 berserker:castBerserker,paladin:castPaladin,stormcaller:castStormcaller,voltstalker:castVoltstalker,
 crystalist:castCrystalist,winterwarden:castWinterwarden,
 wildfire:(a,p,k,i,d,c,n,l)=>castFireAdvancement(a,p,'wildfire',k,i,d,c,n,l),
 hellfire:(a,p,k,i,d,c,n,l)=>castFireAdvancement(a,p,'hellfire',k,i,d,c,n,l),
};
export const ADVANCEMENT_COMBAT_ROUTES = Object.freeze(Object.keys(castRoutes));

export function castAdvancement(actor: SkillActor, profile: AncientProfile, id: string, direction: unknown, context: SkillContext, now: number) {
 reconcileAdvancementRuntime(actor,profile,context.map);
 const route = advancementRoute(profile);
 if (!route) return undefined;
 const key = advancementCastKey(id);
 const progress = profile.advancements?.[profile.profession || ''];
 if (!key || !progress?.skills[key]) return '技能不属于当前职业';
 const cast=Object.hasOwn(castRoutes,route.id)?castRoutes[route.id]:undefined;
 return cast?cast(actor,profile,key,id,direction,context,now,progress.skills[key].level):'该升华技能不可用';
}

function castBerserker(actor:SkillActor,profile:AncientProfile,key:string,id:string,direction:unknown,context:SkillContext,now:number,inheritedLevel:number){
 if (actor.hp <= 0) return '请在存活时使用技能';

 const state = runtime(actor);
 if ((state.cooldowns[id] || 0) > now) return '技能冷却中';
 const level = Math.min(100, inheritedLevel);
 const power = ancientSkillDamage(profile) * skillDamageMultiplier(actor, now) * (1 + (level - 1) * .055);
 const maxHp = actor.maxHp || 100;
 const missing = Math.max(0, 1 - actor.hp / maxHp);
 const target = key === 'X' || key === 'Z' ? selectSkillTarget(actor, direction, key === 'Z' ? 32 : 60, context) : undefined;
 if ((key === 'X' || key === 'Z') && !target) return '请瞄准可见的敌人';

 const attack = 'advancement:berserker:' + key;
 const start = {x:actor.x,y:actor.y,z:actor.z};
 if (key === 'X' && target) {
  context.damage(target, power * 4.5 * (1 + missing), undefined, attack);
  context.fx('berserker-bolt', target.x, target.z, 2, {target:target.id,source:start});
 }
 if (key === 'Q') {
  state.effects.bloodSacrifice = {until:now+12000,level};
  actor.maxHp = maxHp * .7;
  actor.hp = Math.min(actor.hp, actor.maxHp);
  context.fx('berserker-sacrifice', actor.x, actor.z, 5);
 }
 if (key === 'Z' && target) {
  const distance = Math.hypot(target.x-actor.x,target.z-actor.z) || 1;
  const x = target.x+(actor.x-target.x)/distance*1.4;
  const z = target.z+(actor.z-target.z)/distance*1.4;
  const floor = ancientMapHeight(context.map,x,z,actor.y-1.7);
  if (blocked(x,z,.65,context.map,floor) || !lineClear(actor.x,actor.y,actor.z,x,floor+1.7,z,context.map) ||
      (context.canMove && !context.canMove(actor.x,actor.z,x,z))) return '冲锋路径被阻挡';
  if (context.motion) context.motion({x,y:floor+1.7,z},3);
  else Object.assign(actor,{x,y:floor+1.7,z});
  const victims = skillAreaTargets(target,6,context);
  context.damage(target,power*7.5,undefined,attack);
  for (const victim of victims) if(victim!==target)context.damage(victim,power*3,undefined,attack);
  context.fx('berserker-charge',target.x,target.z,6,{target:target.id,source:start});
 }
 if (key === 'C') {
  state.effects.bloodRebirth = {until:now+10000,level};
  context.fx('berserker-rebirth',actor.x,actor.z,5);
 }
 state.cooldowns[id] = now + berserkerCooldowns[key] * 1000 * (1-ancientGearStats(profile).cooldown);
 return null;
}

export function consumeBloodRebirth(actor: SkillActor, now: number, attacker?:string) {
 if (!activeSkill(actor,'bloodRebirth',now)) return false;
 const state=runtime(actor);
 delete state.effects.bloodRebirth;
 if(attacker)state.bloodRevenge={attacker,until:now+10000};
 actor.hp = Math.max(1,(actor.maxHp||100)*.4);
 return true;
}

export type PaladinRuntime = {
 map:string;
 field?:{x:number;y:number;z:number;until:number;radius:number};
};

function castPaladin(a:SkillActor,p:AncientProfile,key:string,id:string,direction:unknown,c:SkillContext,now:number,level:number){
 if(a.hp<=0)return '请在存活时使用技能';
 const r=runtime(a);
 if((r.cooldowns[id]||0)>now)return '技能冷却中';
 const point={x:a.x,y:a.y,z:a.z} as SkillMonster;
 const power=ancientSkillDamage(p)*skillDamageMultiplier(a,now)*(1+Math.min(99,level-1)*.055);
 const radius=Math.min(12,6+level*.15);
 if(key==='X'){
  const candidates=skillAreaTargets(point,radius,c).filter(m=>m.kind!=='player'&&!isAncientBoss(m.kind)&&!m.judgment&&(!m.charm||m.charm.until<=now));
  if(!candidates.length)return '附近没有可净化的怪物';
  for(const m of candidates.slice(0,Math.min(5,1+Math.ceil(level/5))))m.charm={owner:a.name,until:now+8000,next:now};
  c.fx('paladin-purify',a.x,a.z,radius);
 }else if(key==='Q'){
  let total=0;
  for(const m of skillAreaTargets(point,radius,c))if(m.charm?.owner!==a.name||m.charm.until<=now)total+=c.damage(m,power*3.6,undefined,'advancement:paladin:Q');
  a.hp=Math.min(a.maxHp||100,a.hp+total*.2);
  r.effects.radiantRecovery={until:now+8000,level:1};
  c.fx('paladin-recovery',a.x,a.z,radius);
 }else if(key==='Z'){
  r.paladin={map:c.map,field:{x:a.x,y:a.y,z:a.z,radius:radius+3,until:now+12000}};
  c.fx('paladin-sanctuary',a.x,a.z,radius+3);
 }else{
  const target=selectSkillTarget(a,direction,60,c);
  if(!target||target.kind==='player'||target.judgment||target.charm?.owner===a.name&&target.charm.until>now)return '请瞄准可审判的敌人';
  target.judgment={owner:a.name,until:now+10000,maxHp:target.maxHp};
  target.maxHp=Math.max(1,Math.floor(target.maxHp*.7));
  target.hp=Math.min(target.hp,target.maxHp);
  target.weak=.3;target.weakUntil=now+10000;
  target.slow=.3;target.slowUntil=now+10000;
  (target.masteryMarks??={})[a.name+':judgment']={owner:a.name,id:'advancement:paladin:C',until:now+10000};
  c.fx('paladin-judgment',target.x,target.z,4);
 }
 const cooldown=key==='X'?16:key==='Q'?14:key==='Z'?28:35;
 r.cooldowns[id]=now+cooldown*1000*(1-ancientGearStats(p).cooldown);
 return null;
}

export function tickPaladin(a:SkillActor,p:AncientProfile,c:SkillContext,now:number){
 if(advancementRoute(p)?.id!=='paladin'||a.hp<=0)return;
 const field=a.skillRuntime?.paladin?.map===c.map?a.skillRuntime.paladin.field:undefined;
 const inside=field&&field.until>now?new Set(c.monsters.filter(m=>skillAreaHits(field,m,field.radius,c.map))):undefined;
 for(const m of c.monsters){
  if(m.hp<=0)continue;
  if(m.charm?.owner===a.name&&m.charm.until>now){
   if(m.charm.next>now)continue;
   const victim=skillAreaTargets(m,8,c).filter(v=>v!==m&&v.charm?.owner!==a.name).sort((x,y)=>Math.hypot(x.x-m.x,x.z-m.z)-Math.hypot(y.x-m.x,y.z-m.z))[0];
   if(!victim)continue;
   m.charm.next=now+1100;
   c.damage(victim,ancientSkillDamage(p)*1.5*(inside?.has(m)?1.2:1),undefined,'advancement:paladin:X');
   c.fx('paladin-purify',victim.x,victim.z,2);
  }else if(inside?.has(m)){
   m.sanctuaryUntil=now+350;
   if(m.contributionsForMastery?.[a.name])(m.masteryMarks??={})[a.name+':sanctuary']={owner:a.name,id:'advancement:paladin:Z',until:now+350};
  }
 }
}

type StormPoint = {x:number;y:number;z:number};
export type StormRuntime = {
 map:string;
 seals:Record<string,number>;
 heavenfall?:StormPoint & {radius:number;power:number;round:number;next:number;struck:string[]};
 resonance?:Record<string,{mask:number;until:number}>;
 rod?:StormPoint & {until:number;next:number;radius:number;damage:number};
 prison?:StormPoint & {until:number;radius:number;damage:number;seen:Record<string,boolean>;struck:Record<string,boolean>};
};

function stormState(a:SkillActor,map:string){
 const r=runtime(a);
 if(r.stormcaller?.map!==map)r.stormcaller={map,seals:{}};
 return r.stormcaller;
}

function stormTargets(c:SkillContext,point:StormPoint,radius:number){
 return c.monsters.filter(m=>m.hp>0&&skillAreaHits(point,m,radius,c.map));
}

function stormDamage(a:SkillActor,c:SkillContext,m:SkillMonster,key:string,power:number,now:number){
 const state=stormState(a,c.map), records=state.resonance??={};
 const previous=records[m.id];
 const mask=(previous&&previous.until>now?previous.mask:0)|(1<<'XQZC'.indexOf(key));
 records[m.id]={mask,until:now+8000};
 const stacks=Math.min(3,[1,2,4,8].filter(bit=>mask&bit).length);
 return c.damage(m,power*(1+stacks*.05),undefined,'advancement:stormcaller:'+key);
}

function castStormcaller(a:SkillActor,p:AncientProfile,key:string,id:string,direction:unknown,c:SkillContext,now:number,level:number){
 if(a.hp<=0)return '请在存活时使用技能';
 const r=runtime(a);
 if((r.cooldowns[id]||0)>now)return '技能冷却中';
 const target=selectSkillTarget(a,direction,60,c);
 if(!target)return '请瞄准可见的敌人';
 const point={x:target.x,y:target.y??ancientMapHeight(c.map,target.x,target.z),z:target.z};
 const state=stormState(a,c.map),power=ancientSkillDamage(p)*skillDamageMultiplier(a,now)*(1+Math.min(99,level-1)*.055);
 const attack='advancement:stormcaller:'+key;
 if(key==='X'){
  const marked=(state.seals[target.id]||0)>now;
  stormDamage(a,c,target,'X',power*(marked?6.8:4),now);
  if(marked){
   delete state.seals[target.id];
   for(const near of stormTargets(c,point,9).filter(m=>m!==target).slice(0,2)){
    state.seals[near.id]=now+10000;
    stormDamage(a,c,near,'X',power*2.4,now);
    c.fx('stormcaller-arc',near.x,near.z,2,{source:point,target:near.id});
   }
  }else if(target.hp>0)state.seals[target.id]=now+10000;
  c.fx('stormcaller-seal',point.x,point.z,3);
 }else if(key==='Q'){
  state.rod={...point,until:now+7000,next:now,radius:Math.min(18,8+level*.16),damage:power*1.25};
  c.fx('stormcaller-rod',point.x,point.z,state.rod.radius);
 }else if(key==='Z'){
  state.prison={...point,until:now+6500+Math.min(3500,level*100),radius:11,damage:power*3.5,seen:{},struck:{}};
  c.fx('stormcaller-prison',point.x,point.z,11);
 }else{
  const radius=Math.min(20,12+level*.15);
  state.heavenfall={...point,radius,power,round:0,next:now+300,struck:[]};
  c.fx('stormcaller-heavenfall',point.x,point.z,radius);
 }
 r.cooldowns[id]=now+({X:5,Q:15,Z:19,C:36}[key as 'X'|'Q'|'Z'|'C'])*1000*(1-ancientGearStats(p).cooldown);
 return null;
}

export function tickStormcaller(a:SkillActor,p:AncientProfile,c:SkillContext,now:number){
 if(advancementRoute(p)?.id!=='stormcaller'||a.hp<=0)return;
 const state=a.skillRuntime?.stormcaller;
 if(!state||state.map!==c.map)return;
 for(const [id,record] of Object.entries(state.resonance||{}))if(record.until<=now)delete state.resonance![id];
 for(const [id,until] of Object.entries(state.seals))if(until<=now)delete state.seals[id];
 const storm=state.heavenfall;
 if(storm&&storm.next<=now){
  const enemies=stormTargets(c,storm,storm.radius);
  if(storm.round<2){
   const limit=Math.min(5,Math.max(1,Math.ceil(enemies.length/2)));
   const selected=enemies.filter(m=>!storm.struck.includes(m.id)).slice(0,limit);
   for(const m of (selected.length?selected:enemies.slice(0,3))){
    storm.struck.push(m.id);
    state.seals[m.id]=now+10000;
    stormDamage(a,c,m,'C',storm.power*3.1,now);
    c.fx('stormcaller-seal',m.x,m.z,3);
   }
   storm.round++;storm.next=now+550;
  }else{
   delete state.heavenfall;
   const hits=new Map<SkillMonster,number>();
   for(const marked of enemies.filter(m=>(state.seals[m.id]||0)>now)){
    delete state.seals[marked.id];
    for(const m of skillAreaTargets(marked,Math.min(6,storm.radius*.36),c))hits.set(m,Math.min(2,(hits.get(m)||0)+1));
    c.fx('stormcaller-heavenfall',marked.x,marked.z,Math.min(6,storm.radius*.36));
   }
   for(const [m,count] of hits)stormDamage(a,c,m,'C',storm.power*2.8*count,now);
  }
 }
 const rod=state.rod;
 if(rod&&rod.until>now&&rod.next<=now){
  rod.next=now+1000;
  const nearby=stormTargets(c,rod,rod.radius);
  const target=nearby.find(m=>state.seals[m.id])??nearby[0];
  if(target){
   stormDamage(a,c,target,'Q',rod.damage,now);
   c.fx('stormcaller-arc',target.x,target.z,2,{source:rod,target:target.id});
   const linked=state.seals[target.id]&&nearby.find(m=>m!==target);
   if(linked){stormDamage(a,c,linked,'Q',rod.damage*.65,now);c.fx('stormcaller-arc',linked.x,linked.z,2,{source:{x:target.x,y:(target.y||0)+1,z:target.z},target:linked.id});}
  }
 }
 const prison=state.prison;
 if(!prison||prison.until<=now)return;
 for(const m of c.monsters){
  if(m.hp<=0)continue;
  const inside=skillAreaHits(prison,m,prison.radius,c.map);
  if(inside){
   prison.seen[m.id]=true;
   if((m.slowUntil||0)<=now||(m.slow||0)<=.25){m.slow=.25;m.slowUntil=now+350;}
   if(m.contributionsForMastery?.[a.name]){
    (m.masteryMarks??={})[a.name+':storm-prison']={owner:a.name,id:'advancement:stormcaller:Z',until:now+350};
   }
  }else if(prison.seen[m.id]&&!prison.struck[m.id]){
   prison.struck[m.id]=true;
   if(!isAncientBoss(m.kind)){m.slow=.95;m.slowUntil=now+650;}
   stormDamage(a,c,m,'Z',prison.damage,now);
   c.fx('stormcaller-seal',m.x,m.z,3);
  }
 }
}

export type VoltRuntime = {
 map:string;
 marks:Record<string,number>;
 followupUntil?:number;
 pursuitUntil?:number;
 guardPower?:number;
 counter?:string;
};

function voltState(a:SkillActor,map:string){
 const r=runtime(a);
 if(r.volt?.map!==map)r.volt={map,marks:{}};
 return r.volt;
}

function voltHit(a:SkillActor,c:SkillContext,m:SkillMonster,key:string,damage:number,now:number){
 const volt=voltState(a,c.map),marked=(volt.marks[m.id]||0)>now;
 if(marked){
  delete volt.marks[m.id];
  damage*=1.5;
  if((volt.pursuitUntil||0)>now){damage*=1.3;delete volt.pursuitUntil;}
 }
 return c.damage(m,damage,undefined,'advancement:voltstalker:'+key);
}

function castVoltstalker(a:SkillActor,p:AncientProfile,key:string,id:string,direction:unknown,c:SkillContext,now:number,level:number){
 if(a.hp<=0)return '请在存活时使用技能';
 const r=runtime(a),volt=voltState(a,c.map),followup=key==='Q'&&(volt.followupUntil||0)>now;
 if(!followup&&(r.cooldowns[id]||0)>now)return '技能冷却中';
 const power=ancientSkillDamage(p)*skillDamageMultiplier(a,now)*(1+Math.min(99,level-1)*.055);
 const origin={x:a.x,y:a.y,z:a.z};
 if(key==='X'||key==='C'){
  const m=selectSkillTarget(a,direction,60,c);
  if(!m)return '请瞄准可见的敌人';
  const marked=(volt.marks[m.id]||0)>now;
  if(key==='X'){
   voltHit(a,c,m,'X',power*3.9,now);
   if(m.hp>0)volt.marks[m.id]=now+8000;
   c.fx('voltstalker-spike',m.x,m.z,2,{source:origin,target:m.id});
  }else{
   r.effects.voltGuard={until:now+900,level:1};
   const strikes=m.strikes??=[];
   const count=Math.min(3,Math.max(0,64-strikes.length));
   for(let i=0;i<count;i++)strikes.push({owner:a.name,skillId:'advancement:voltstalker:C',at:now+i*275,damage:power*(i===2?(marked?5:3.5):2.5)});
   delete volt.marks[m.id];
   if(marked){
    const linked=skillAreaTargets(m,8,c).find(v=>v!==m);
    if(linked)c.damage(linked,power*2.6,undefined,'advancement:voltstalker:C');
   }
   c.fx('voltstalker-break',m.x,m.z,7,{source:origin,target:m.id});
  }
 }else if(key==='Q'){
  if(!Array.isArray(direction)||direction.length!==3||!direction.every(Number.isFinite))return '请先瞄准冲刺方向';
  const length=Math.hypot(direction[0],direction[2]);
  if(length<.01)return '请先瞄准冲刺方向';
  const dx=direction[0]/length,dz=direction[2]/length;
  const limit=Math.min(26,11+level*.3);
  let distance=0,y=a.y;
  const pathHeights=[origin.y-1.7];
  for(let d=.5;d<=limit;d+=.5){
   const x=a.x+dx*d,z=a.z+dz*d,feet=ancientMapHeight(c.map,x,z,y-1.7);
   if(blocked(x,z,.65,c.map,feet)||Math.abs(feet+1.7-y)>1.2||c.canMove&&!c.canMove(a.x,a.z,x,z))break;
   distance=d;y=feet+1.7;
   pathHeights.push(feet);
  }
  if(!distance)return '冲刺路径被阻挡';
  const end={x:a.x+dx*distance,y,z:a.z+dz*distance};
  delete volt.followupUntil;
  volt.pursuitUntil=now+4500;
  for(const m of c.monsters){
   if(m.hp<=0)continue;
   const mx=m.x-origin.x,mz=m.z-origin.z,along=mx*dx+mz*dz;
   if(along<0||along>distance||Math.abs(mx*dz-mz*dx)>2)continue;
   const pathFeet=pathHeights[Math.round(along*2)];
   if(Math.abs((m.y??ancientMapHeight(c.map,m.x,m.z,pathFeet))-pathFeet)>3)continue;
   if(!followup&&(volt.marks[m.id]||0)>now)volt.followupUntil=now+3000;
   voltHit(a,c,m,'Q',power*3.2,now);
  }
  if(c.motion)c.motion(end,3);else Object.assign(a,end);
  c.fx('voltstalker-dash',end.x,end.z,distance,{source:origin,target:''});
 }else{
  volt.guardPower=power*3;
  delete volt.counter;
  r.effects.voltGuard={until:now+Math.min(7000,3000+level*100),level:1};
  c.fx('voltstalker-guard',a.x,a.z,4);
 }
 if(!followup)r.cooldowns[id]=now+({X:5,Q:9,Z:18,C:34}[key as 'X'|'Q'|'Z'|'C'])*1000*(1-ancientGearStats(p).cooldown);
 return null;
}

export function queueVoltCounter(a:SkillActor,attacker:string,now:number){
 const volt=a.skillRuntime?.volt;
 if(!volt?.guardPower||volt.counter||!activeSkill(a,'voltGuard',now))return;
 volt.counter=attacker;
}

export function tickVoltstalker(a:SkillActor,p:AncientProfile,c:SkillContext,now:number){
 const volt=a.skillRuntime?.volt;
 if(!volt||volt.map!==c.map||advancementRoute(p)?.id!=='voltstalker'||a.hp<=0)return;
 for(const [id,until] of Object.entries(volt.marks))if(until<=now)delete volt.marks[id];
 if(!volt.counter)return;
 const target=c.monsters.find(m=>m.id===volt.counter&&m.hp>0),power=volt.guardPower||0;
 delete volt.counter;delete volt.guardPower;
 if(!target||!power)return;
 voltHit(a,c,target,'Z',power,now);
 if(target.hp>0)volt.marks[target.id]=now+8000;
 c.fx('voltstalker-counter',target.x,target.z,3,{target:target.id,source:{x:a.x,y:a.y,z:a.z}});
}

export type CrystalRuntime = {
 map:string;
 marks:Record<string,{until:number;count:number}>;
 fractures:Record<string,{until:number;count:number}>;
 field?:StormPoint & {until:number;next:number;radius:number};
};

function crystalState(a:SkillActor,map:string){
 const r=runtime(a);
 if(r.crystal?.map!==map)r.crystal={map,marks:{},fractures:{}};
 return r.crystal;
}

function addCrystal(state:CrystalRuntime,m:SkillMonster,now:number){
 if(m.hp<=0)return;
 const old=state.marks[m.id];
 state.marks[m.id]={until:now+8000,count:Math.min(3,1+(old&&old.until>now?old.count:0))};
}

function fracture(a:SkillActor,c:SkillContext,m:SkillMonster,key:string,damage:number,now:number){
 const state=crystalState(a,c.map),mark=state.marks[m.id];
 if(!mark||mark.until<=now)return;
 delete state.marks[m.id];
 for(const other of skillAreaTargets(m,5,c)){
  const old=state.fractures[other.id];
  state.fractures[other.id]={until:now+6000,count:Math.min(2,1+(old&&old.until>now?old.count:0))};
  c.damage(other,damage*mark.count,undefined,'advancement:crystalist:'+key);
 }
 c.fx('crystalist-fracture',m.x,m.z,5);
}

function castCrystalist(a:SkillActor,p:AncientProfile,key:string,id:string,direction:unknown,c:SkillContext,now:number,level:number){
 if(a.hp<=0)return '请在存活时使用技能';
 const r=runtime(a);
 if((r.cooldowns[id]||0)>now)return '技能冷却中';
 const target=selectSkillTarget(a,direction,60,c);
 if(!target)return '请瞄准可见的敌人';
 const state=crystalState(a,c.map),power=ancientSkillDamage(p)*skillDamageMultiplier(a,now)*(1+Math.min(99,level-1)*.055);
 const attack='advancement:crystalist:'+key;
 const origin={x:a.x,y:a.y,z:a.z};
 const direct=(m:SkillMonster,n:number)=>{
  const brittle=state.fractures[m.id];
  c.damage(m,power*n*(brittle&&brittle.until>now&&brittle.count===2?1.15:1),undefined,attack);
 };
 const marked=(state.marks[target.id]?.until||0)>now;
 if(key==='X'){
  fracture(a,c,target,key,power*1.3,now);
  direct(target,3.7);
  addCrystal(state,target,now);
  c.fx('crystalist-bolt',target.x,target.z,2,{source:origin,target:target.id});
 }else if(key==='Q'){
  fracture(a,c,target,key,power*1.5,now);
  direct(target,4.5);
  if(marked)for(const m of skillAreaTargets(target,11,c).filter(m=>m!==target).slice(0,2)){
   fracture(a,c,m,key,power,now);
   direct(m,2.7);
   c.fx('crystalist-refraction',m.x,m.z,3,{source:{x:target.x,y:(target.y||0)+1,z:target.z},target:m.id});
  }
  c.fx('crystalist-refraction',target.x,target.z,3,{source:origin,target:target.id});
 }else if(key==='Z'){
  const radius=Math.min(16,7+.16*level);
  state.field={x:target.x,y:target.y??ancientMapHeight(c.map,target.x,target.z),z:target.z,next:now,until:now+7000,radius};
  c.fx('crystalist-field',target.x,target.z,radius);
 }else{
  const radius=Math.min(20,10+.18*level);
  const victims=skillAreaTargets(target,radius,c).sort((a,b)=>Number(!!state.marks[b.id])-Number(!!state.marks[a.id]));
  const pending=victims.map(m=>({m,marked:(state.marks[m.id]?.until||0)>now}));
  for(const {m,marked} of pending){
   if(marked)fracture(a,c,m,key,power*1.4,now);
   const strikes=m.strikes??=[];
   if(m.hp>0&&strikes.length<64)strikes.push({owner:a.name,skillId:attack,at:now+(marked?350:700),damage:power*5.6});
  }
  c.fx('crystalist-collapse',target.x,target.z,radius);
 }
 r.cooldowns[id]=now+({X:5,Q:11,Z:18,C:32}[key as 'X'|'Q'|'Z'|'C'])*1000*(1-ancientGearStats(p).cooldown);
 return null;
}

export function tickCrystalist(a:SkillActor,p:AncientProfile,c:SkillContext,now:number){
 const state=a.skillRuntime?.crystal;
 if(!state||state.map!==c.map||advancementRoute(p)?.id!=='crystalist'||a.hp<=0)return;
 for(const records of [state.marks,state.fractures])for(const [id,record] of Object.entries(records))if(record.until<=now)delete records[id];
 const field=state.field;
 if(!field||field.until<=now||field.next>now)return;
 field.next=now+1000;
 for(const m of stormTargets(c,field,field.radius)){
  addCrystal(state,m,now);
  if(m.contributionsForMastery?.[a.name])(m.masteryMarks??={})[a.name+':crystal-field']={owner:a.name,id:'advancement:crystalist:Z',until:now+1500};
 }
}

export type WinterRuntime = {
 map:string;
 wall?:StormPoint & {angle:number;halfWidth:number;hp:number;until:number;power:number};
};

function castWinterwarden(a:SkillActor,p:AncientProfile,key:string,id:string,direction:unknown,c:SkillContext,now:number,level:number){
 if(a.hp<=0)return '请在存活时使用技能';
 const r=runtime(a);
 if((r.cooldowns[id]||0)>now)return '技能冷却中';
 const power=ancientSkillDamage(p)*skillDamageMultiplier(a,now)*(1+Math.min(99,level-1)*.055);
 const attack='advancement:winterwarden:'+key;
 const dir=Array.isArray(direction)&&direction.length===3&&direction.every(Number.isFinite)?direction:undefined;
 const length=Math.hypot(dir?.[0]||0,dir?.[2]||0);
 if(key!=='Z'&&(!dir||length<.01))return '请先瞄准';
 const dx=(dir?.[0]||0)/(length||1),dz=(dir?.[2]||0)/(length||1);
 const range=key==='C'?Math.min(45,25+level*.35):28;
 if(key==='Z'){
  r.effects.snowVeil={until:now+10000,level};
  c.fx('winterwarden-veil',a.x,a.z,9);
 }else if(key==='Q'){
  const x=a.x+dx*5,z=a.z+dz*5,y=ancientMapHeight(c.map,x,z,a.y-1.7);
  if(blocked(x,z,.65,c.map,y)||!lineClear(a.x,a.y,a.z,x,y+1.7,z,c.map))return '冰墙位置被阻挡';
  const halfWidth=Math.min(8,3+level*.15);
  r.winter={map:c.map,wall:{x,y,z,angle:Math.atan2(dx,dz),halfWidth,hp:2+Math.min(8,Math.floor(level/2)),until:now+11000,power}};
  c.fx('winterwarden-rampart',x,z,halfWidth,{source:{x:a.x,y:a.y,z:a.z},target:''});
 }else{
  const width=key==='C'?4:1.7;
  for(const m of c.monsters){
   if(m.hp<=0)continue;
   const mx=m.x-a.x,mz=m.z-a.z,along=mx*dx+mz*dz;
   if(along<0||along>range||Math.abs(mx*dz-mz*dx)>width)continue;
   if(!lineClear(a.x,a.y,a.z,m.x,(m.y??ancientMapHeight(c.map,m.x,m.z))+1,m.z,c.map))continue;
   const boss=isAncientBoss(m.kind);
   m.slow=key==='C'?(boss?.55:.95):.35;
   m.slowUntil=now+(key==='C'?1800:3500);
   c.damage(m,power*(key==='C'?5.2:4.1),undefined,attack);
   if(key==='C'&&m.hp>0){
    const strikes=m.strikes??=[];
    if(strikes.length<64)strikes.push({owner:a.name,skillId:attack,at:now+1800,damage:power*3.6});
   }
  }
  c.fx(key==='C'?'winterwarden-lock':'winterwarden-spear',a.x+dx*range,a.z+dz*range,width,{source:{x:a.x,y:a.y,z:a.z},target:''});
 }
 r.cooldowns[id]=now+({X:5,Q:18,Z:22,C:35}[key as 'X'|'Q'|'Z'|'C'])*1000*(1-ancientGearStats(p).cooldown);
 return null;
}

export function winterProjectileBlocked(a:SkillActor,map:string,from:{x:number;z:number},to:{x:number;z:number},now:number){
 const winter=a.skillRuntime?.winter,wall=winter?.wall;
 if(winter?.map!==map||!wall||wall.until<=now||wall.hp<=0)return false;
 const nx=Math.sin(wall.angle),nz=Math.cos(wall.angle);
 const before=(from.x-wall.x)*nx+(from.z-wall.z)*nz;
 const after=(to.x-wall.x)*nx+(to.z-wall.z)*nz;
 if(before===after||before*after>0)return false;
 const t=before/(before-after);
 const side=(from.x+(to.x-from.x)*t-wall.x)*nz-(from.z+(to.z-from.z)*t-wall.z)*nx;
 if(Math.abs(side)>wall.halfWidth)return false;
 wall.hp--;
 return true;
}

export function tickWinterwarden(a:SkillActor,p:AncientProfile,c:SkillContext,now:number){
 if(advancementRoute(p)?.id!=='winterwarden'||a.hp<=0)return;
 const r=runtime(a),winter=r.winter,wall=winter?.wall;
 if(winter?.map===c.map&&wall&&(wall.hp<=0||wall.until<=now)){
  delete winter.wall;
  for(const m of stormTargets(c,wall,wall.halfWidth+2))c.damage(m,wall.power*2.6,undefined,'advancement:winterwarden:Q');
  c.fx('winterwarden-shatter',wall.x,wall.z,wall.halfWidth+2);
 }
 const close=stormTargets(c,a,7);
 if(close.length>=3&&(r.cooldowns.winterShield||0)<=now){
  r.cooldowns.winterShield=now+22000;
  r.effects.winterShield={until:now+5000,level:1};
  c.fx('winterwarden-veil',a.x,a.z,4);
 }
 if(activeSkill(a,'snowVeil',now))for(const m of stormTargets(c,a,9)){
  if((m.slowUntil||0)<=now||(m.slow||0)<=.3){m.slow=.3;m.slowUntil=now+350;}
  if(m.contributionsForMastery?.[a.name])(m.masteryMarks??={})[a.name+':snow-veil']={owner:a.name,id:'advancement:winterwarden:Z',until:now+350};
 }
}

type FirePatch=StormPoint & {radius:number;until:number;damage:number};
type Ember={id:string;until:number;next:number;damage:number;hops:number;since:number;kind:'seed'|'burn'|'undying'};
export type AdvancedFireRuntime={map:string;route:string;patches:FirePatch[];embers:Record<string,Ember>;next:number};

function fireState(a:SkillActor,map:string,route:string){
 const r=runtime(a);
 if(r.advancedFire?.map!==map||r.advancedFire.route!==route)r.advancedFire={map,route,patches:[],embers:{},next:0};
 return r.advancedFire;
}

function firePoint(c:SkillContext,m:{x:number;z:number;y?:number}):StormPoint{
 return {x:m.x,y:m.y??ancientMapHeight(c.map,m.x,m.z),z:m.z};
}

function emberRecord(id:string,kind:Ember['kind'],damage:number,now:number,duration:number):Ember{
 return {id,kind,damage,since:now,until:now+duration,next:now+1000,hops:0};
}

function castFireAdvancement(a:SkillActor,p:AncientProfile,route:string,key:string,id:string,direction:unknown,c:SkillContext,now:number,level:number){
 if(a.hp<=0)return '请在存活时使用技能';
 const r=runtime(a);
 if((r.cooldowns[id]||0)>now)return '技能冷却中';
 const target=selectSkillTarget(a,direction,60,c);
 if(!target)return '请瞄准可见的敌人';
 const f=fireState(a,c.map,route),point=firePoint(c,target);
 const power=ancientSkillDamage(p)*skillDamageMultiplier(a,now)*(1+Math.min(99,level-1)*.055);
 const tag='advancement:'+route+':'+key;
 const source={x:a.x,y:a.y,z:a.z};
 const hit=(m:SkillMonster,n:number)=>c.damage(m,n,undefined,tag);
 const patch=(center:StormPoint,radius:number,damage:number)=>{f.patches.push({...center,radius,damage,until:now+6500});f.patches=f.patches.slice(-12);};
 if(route==='wildfire'){
  if(key==='X'){
   f.embers[target.id]=emberRecord(tag,'seed',power*.75,now,9000);
   hit(target,power*3.8);
   c.fx('wildfire-seed',point.x,point.z,2,{source,target:target.id});
  }else if(key==='Q'){
   const dx=point.x-a.x,dz=point.z-a.z,distance=Math.hypot(dx,dz)||1;
   const travel=Math.min(24,distance),victims=c.monsters.filter(m=>{
    const mx=m.x-a.x,mz=m.z-a.z,projection=(mx*dx+mz*dz)/distance;
    return m.hp>0&&projection>=0&&projection<=travel&&Math.abs(mx*dz-mz*dx)/distance<=4&&lineClear(a.x,a.y,a.z,m.x,firePoint(c,m).y+1,m.z,c.map);
   });
   for(const m of victims)hit(m,power*3.4);
   for(const field of f.patches)if(field.until>now&&Math.hypot(field.x-point.x,field.z-point.z)<=field.radius+4){
    field.radius=Math.min(16,field.radius+2);
    for(const m of stormTargets(c,field,field.radius))if(!victims.includes(m)){victims.push(m);hit(m,power*1.25);}
   }
   c.fx('wildfire-front',point.x,point.z,4,{source,target:target.id});
  }else if(key==='Z'){
   const radius=Math.min(13,6+level*.16);
   patch(point,radius,power*1.3);
   c.fx('wildfire-confluence',point.x,point.z,radius);
  }else{
   const radius=Math.min(18,9+level*.19);
   for(const m of stormTargets(c,point,radius)){
    const seed=f.embers[m.id];
    const ignited=seed?.kind==='seed'&&seed.until>now&&f.patches.some(field=>field.until>now&&skillAreaHits(field,m,field.radius,c.map));
    if(ignited)delete f.embers[m.id];
    hit(m,power*(ignited?10.5:8));
   }
   c.fx('wildfire-meteor',point.x,point.z,radius,{source,target:target.id});
  }
 }else{
  const burn=f.embers[target.id];
  if(key==='X'){
   if(burn?.kind!=='undying'||burn.until<=now)f.embers[target.id]=emberRecord(tag,'burn',power*.95,now,11000);
   hit(target,power*3.25);
   c.fx('hellfire-brand',point.x,point.z,3,{source,target:target.id});
  }else if(key==='Q'){
   if(!burn||burn.until<=now)return '目标还没有燃烧';
   const ticks=Math.min(4,Math.ceil((burn.until-now)/1000));
   burn.until-=ticks*1000;
   hit(target,power*2.4+burn.damage*ticks);
   c.fx('hellfire-bone',point.x,point.z,4);
  }else if(key==='Z'){
   if(!burn||burn.until<=now)return '目标还没有燃烧';
   for(const m of stormTargets(c,point,12).filter(m=>m!==target).slice(0,3)){
    if(f.embers[m.id]?.kind!=='undying')f.embers[m.id]=emberRecord(tag,'burn',burn.damage*.62,now,6500);
    hit(m,power*2.2);
    c.fx('hellfire-threads',m.x,m.z,3,{source:point,target:m.id});
   }
  }else{
   f.embers[target.id]=emberRecord(tag,'undying',power*1.7,now,14000);
   hit(target,power*4.5);
   c.fx('hellfire-undying',point.x,point.z,5);
  }
 }
 r.cooldowns[id]=now+({X:5,Q:11,Z:17,C:36}[key as 'X'|'Q'|'Z'|'C'])*1000*(1-ancientGearStats(p).cooldown);
 return null;
}

export function tickAdvancedFire(a:SkillActor,p:AncientProfile,c:SkillContext,now:number){
 const f=a.skillRuntime?.advancedFire;
 if(!f||f.map!==c.map||a.hp<=0||advancementRoute(p)?.id!==f.route)return;
 f.patches=f.patches.filter(field=>field.until>now);
 if(f.next<=now){
  f.next=now+1000;
  for(const m of c.monsters){
   const damage=f.patches.reduce((max,field)=>m.hp>0&&skillAreaHits(field,m,field.radius,c.map)?Math.max(max,field.damage):max,0);
   if(!damage)continue;
   const seed=f.embers[m.id];
   if(seed?.kind==='seed'&&seed.until>now&&f.patches.length<12&&!f.patches.some(field=>Math.hypot(field.x-m.x,field.z-m.z)<2.5)){
    f.patches.push({...firePoint(c,m),radius:3,damage:seed.damage,until:Math.min(seed.until,now+3500)});
    c.fx('wildfire-confluence',m.x,m.z,3);
   }
   c.damage(m,damage,undefined,'advancement:wildfire:Z');
  }
 }
 for(const [id,burn] of Object.entries(f.embers)){
  const m=c.monsters.find(v=>v.id===id);
  if(!m||burn.until<=now){delete f.embers[id];continue;}
  if(m.hp<=0){
   delete f.embers[id];
   if(burn.kind==='burn'||burn.hops>=2)continue;
   const next=stormTargets(c,firePoint(c,m),12).filter(v=>!f.embers[v.id]).sort((x,y)=>burn.kind==='undying'?y.hp-x.hp:Math.hypot(x.x-m.x,x.z-m.z)-Math.hypot(y.x-m.x,y.z-m.z))[0];
   if(next){f.embers[next.id]={...burn,hops:burn.hops+1};c.fx(f.route==='wildfire'?'wildfire-seed':'hellfire-undying',next.x,next.z,3,{source:firePoint(c,m),target:next.id});}
  }else if(burn.kind!=='seed'&&burn.next<=now){
   burn.next=now+1000;
   c.damage(m,burn.damage*(now-burn.since>=5000?1.2:1),undefined,burn.id);
  }
 }
}

type OathDebt={until:number;damage:number;incoming:number;cap:number;watchUntil:number;hits:number;settle?:number};
export type CurseAdvancementRuntime={
 map:string;
 hexes:Record<string,{until:number;next:number;damage:number;spread:boolean}>;
 tether?:{main:string;linked:string[];until:number};
 debts:Record<string,OathDebt>;
};

function curseState(a:SkillActor,map:string){
 const r=runtime(a);
 if(r.advancedCurse?.map!==map)r.advancedCurse={map,hexes:{},debts:{}};
 return r.advancedCurse;
}

function castCurseAdvancement(a:SkillActor,p:AncientProfile,route:string,key:string,id:string,direction:unknown,c:SkillContext,now:number,level:number){
 if(a.hp<=0)return '请在存活时使用技能';
 const r=runtime(a);
 if((r.cooldowns[id]||0)>now)return '技能冷却中';
 const target=selectSkillTarget(a,direction,60,c);
 if(!target)return '请瞄准可见的敌人';
 const state=curseState(a,c.map);
 const power=ancientSkillDamage(p)*skillDamageMultiplier(a,now)*(1+Math.min(99,level-1)*.055);
 const tag='advancement:'+route+':'+key;
 const area=(m:SkillMonster,radius:number)=>skillAreaTargets(m,radius,c).filter(v=>v!==m);
 const fx=(name:string,m:SkillMonster,radius:number)=>c.fx(route+'-'+name,m.x,m.z,radius);
 if(route==='hexweaver'){
  if(key==='X'){
   state.hexes[target.id]={until:now+8500,next:now+1000,damage:power*.9,spread:true};
   target.weak=Math.max(target.weak||0,.18);target.weakUntil=Math.max(target.weakUntil||0,now+8500);
   c.damage(target,power*3.6,undefined,tag);
   fx('decay',target,3);
  }else if(key==='Q'){
   const linked=area(target,12).slice(0,3);
   state.tether={main:target.id,linked:linked.map(m=>m.id),until:now+9000};
   c.damage(target,power*2.9,undefined,tag);
   c.fx('hexweaver-tether',target.x,target.z,12,{target:target.id,links:linked.map(m=>({...firePoint(c,m),height:(m.y||0)+1,target:m.id}))});
  }else if(key==='Z'){
   for(const source of [target,...area(target,12)]){
    const hex=state.hexes[source.id];
    if(!hex||hex.until<=now)continue;
    const next=area(source,8).find(m=>!state.hexes[m.id]);
    if(next){state.hexes[next.id]={...hex,next:now+1000,spread:false};fx('plague',next,3);}
   }
   for(const m of [target,...area(target,9)])if(state.hexes[m.id])c.damage(m,power*2.2,undefined,tag);
  }else{
   const tether=state.tether,hit=new Map<SkillMonster,number>();
   delete state.tether;
   const main=tether&&tether.until>now?c.monsters.find(m=>m.id===tether.main&&m.hp>0)??target:target;
   for(const endpoint of c.monsters.filter(m=>tether?.linked.includes(m.id)&&m.hp>0)){
    const dx=endpoint.x-main.x,dz=endpoint.z-main.z,length=Math.hypot(dx,dz)||1;
    for(const m of c.monsters){
     const x=m.x-main.x,z=m.z-main.z,t=(x*dx+z*dz)/length**2;
     if(m.hp>0&&m!==main&&t>=0&&t<=1&&Math.abs(x*dz-z*dx)/length<=2)hit.set(m,Math.min(2,(hit.get(m)||0)+1));
    }
    c.fx('hexweaver-collapse',endpoint.x,endpoint.z,3,{target:endpoint.id,source:firePoint(c,main)});
   }
   for(const [m,count] of hit)c.damage(m,power*2.8*count,undefined,tag);
   c.damage(main,power*(5.5+(tether?.linked.length||0)*.65),undefined,tag);
   fx('collapse',main,6);
  }
 }else{
  let debt=state.debts[target.id];
  if(!debt||debt.until<=now)debt=state.debts[target.id]={until:now+12000,damage:0,incoming:0,cap:power*10,watchUntil:0,hits:0};
  if(key==='X'){
   debt.until=Math.max(debt.until,now+12000);
   c.damage(target,power*(3.8+.35*debt.hits),undefined,tag);
   debt.hits=0;
   fx('brand',target,3);
  }else if(key==='Q'){
   const due=debt.damage+debt.incoming;
   debt.damage=debt.incoming=0;
   const actual=c.damage(target,power*2.2+due,undefined,tag);
   a.hp=Math.min(a.maxHp||100,a.hp+actual*.15);
   fx('reckoning',target,4);
  }else if(key==='Z'){
   debt.watchUntil=now+8000;
   target.weak=Math.max(target.weak||0,.1);target.weakUntil=Math.max(target.weakUntil||0,now+8000);
   fx('inverse',target,4);
  }else{
   debt.settle=now+6500;
   debt.watchUntil=debt.settle;
   debt.until=Math.max(debt.until,debt.settle+1000);
   fx('doom',target,7);
  }
 }
 r.cooldowns[id]=now+({X:5,Q:11,Z:17,C:34}[key as 'X'|'Q'|'Z'|'C'])*1000*(1-ancientGearStats(p).cooldown);
 return null;
}

export function recordPactHit(a:SkillActor,map:string,id:string,amount:number,now:number){
 const state=a.skillRuntime?.advancedCurse,debt=state?.map===map?state.debts[id]:undefined;
 if(!debt||debt.until<=now)return;
 debt.hits=Math.min(3,debt.hits+1);
 if(debt.watchUntil>now)debt.incoming=Math.min(debt.cap,(a.maxHp||100)*.3,debt.incoming+amount*.55);
}

export function recordPactDamage(a:SkillActor,map:string,id:string,amount:number,attack:string|undefined,now:number){
 const state=a.skillRuntime?.advancedCurse,debt=state?.map===map?state.debts[id]:undefined;
 if(debt&&debt.until>now&&attack!=='advancement:pactbinder:Q'&&attack!=='advancement:pactbinder:C')debt.damage=Math.min(debt.cap,debt.damage+amount*.28);
}

export function tickAdvancedCurse(a:SkillActor,p:AncientProfile,c:SkillContext,now:number){
 const state=a.skillRuntime?.advancedCurse,route=advancementRoute(p)?.id;
 if(!state||state.map!==c.map||a.hp<=0||!['hexweaver','pactbinder'].includes(route||''))return;
 for(const [id,hex] of Object.entries(state.hexes)){
  const m=c.monsters.find(v=>v.id===id);
  if(!m||hex.until<=now){delete state.hexes[id];continue;}
  if(m.hp<=0){
   delete state.hexes[id];
   const next=hex.spread&&skillAreaTargets(m,9,c).find(v=>!state.hexes[v.id]);
   if(next){state.hexes[next.id]={...hex,next:now+1000,spread:false};c.fx('hexweaver-plague',next.x,next.z,3);}
  }else if(hex.next<=now){
   hex.next=now+1000;
   c.damage(m,hex.damage,undefined,'advancement:hexweaver:X');
  }
 }
 for(const [id,debt] of Object.entries(state.debts)){
  const m=c.monsters.find(v=>v.id===id);
  if(!m||debt.until<=now){delete state.debts[id];continue;}
  if(debt.settle&&(m.hp<=0||now>=debt.settle)){
   delete state.debts[id];
   const damage=debt.damage+debt.incoming+debt.cap*.25;
   if(m.hp>0)c.damage(m,damage,undefined,'advancement:pactbinder:C');
   else for(const v of skillAreaTargets(m,8,c))c.damage(v,damage*.55,undefined,'advancement:pactbinder:C');
   c.fx('pactbinder-doom',m.x,m.z,8);
  }
 }
}

export function hexTetherTargets(a:SkillActor,map:string,id:string,attack:string|undefined,now:number){
 const state=a.skillRuntime?.advancedCurse,tether=state?.map===map?state.tether:undefined;
 return tether&&tether.until>now&&tether.main===id&&attack&&['advancement:hexweaver:Q','advancement:hexweaver:Z'].includes(attack)?tether.linked:[];
}

type StoredBlade=StormPoint & {until:number};
export type SwordAdvancementRuntime={
 map:string;
 blades:StoredBlade[];
 angles:Record<string,{values:number[];until:number}>;
 armor:Record<string,number>;
 openings:Record<string,number>;
 readyUntil?:number;
 guard?:{until:number;power:number;counter?:string};
};

function swordState(a:SkillActor,map:string){
 const r=runtime(a);
 if(r.advancedSword?.map!==map)r.advancedSword={map,blades:[],angles:{},armor:{},openings:{}};
 return r.advancedSword;
}

function bladeLane(c:SkillContext,start:StormPoint,end:StormPoint,width:number){
 const dx=end.x-start.x,dz=end.z-start.z,distance=Math.hypot(dx,dz);
 if(distance<.1)return stormTargets(c,start,width);
 return c.monsters.filter(m=>{
  if(m.hp<=0)return false;
  const x=m.x-start.x,z=m.z-start.z,t=(x*dx+z*dz)/distance**2;
  return t>=0&&t<=1&&Math.abs(x*dz-z*dx)/distance<=width
   &&lineClear(start.x,start.y+1,start.z,m.x,firePoint(c,m).y+1,m.z,c.map);
 });
}

function flyingBladeHit(a:SkillActor,c:SkillContext,state:SwordAdvancementRuntime,m:SkillMonster,from:StormPoint,power:number,key:string,now:number){
 const tag='advancement:blademaster:'+key;
 const targetAngle=Math.atan2(from.x-m.x,from.z-m.z),old=state.angles[m.id];
 const values=old&&old.until>now?old.values:[];
 const distinct=values.every(angle=>Math.abs(Math.atan2(Math.sin(angle-targetAngle),Math.cos(angle-targetAngle)))>.5);
 if(distinct)values.push(targetAngle);
 if(values.length>=3){
  delete state.angles[m.id];
  c.damage(m,power*1.6,undefined,tag);
  c.fx('blademaster-resonance',m.x,m.z,3);
 }else state.angles[m.id]={values,until:now+6500};
 c.damage(m,power,undefined,tag);
}

function castSwordAdvancement(a:SkillActor,p:AncientProfile,route:string,key:string,id:string,direction:unknown,c:SkillContext,now:number,level:number){
 if(a.hp<=0)return '请在存活时使用技能';
 const r=runtime(a);
 if((r.cooldowns[id]||0)>now)return '技能冷却中';
 const state=swordState(a,c.map);
 const power=ancientSkillDamage(p)*skillDamageMultiplier(a,now)*(1+Math.min(99,level-1)*.055);
 const tag='advancement:'+route+':'+key;
 const origin={x:a.x,y:a.y-1.7,z:a.z};
 const target=selectSkillTarget(a,direction,key==='X'&&route==='linebreaker'?10:60,c);
 if(route==='blademaster'){
  state.blades=state.blades.filter(blade=>blade.until>now);
  if(key==='X'){
   if(!target)return '请瞄准可见的敌人';
   const point=firePoint(c,target);
   flyingBladeHit(a,c,state,target,origin,power*4.2,key,now);
   const phase=state.blades.length*2.094;
   state.blades.push({...point,x:point.x+Math.sin(phase)*2,z:point.z+Math.cos(phase)*2,until:now+15000});
   if(state.blades.length>3)state.blades.shift();
   c.fx('blademaster-launch',point.x,point.z,3,{target:target.id,source:origin});
  }else{
   if(!state.blades.length)return '先用御剑留下飞剑';
   if(key!=='Z'&&!target)return '请瞄准可见的敌人';
   const endpoint=target?firePoint(c,target):origin;
   if(key==='Q'){
    const center=endpoint;
    for(const [index,blade] of state.blades.entries()){
     const angle=index*2.094;
     const start={...center,x:center.x+Math.sin(angle)*8,z:center.z+Math.cos(angle)*8};
     const finish={...center,x:center.x-Math.sin(angle)*8,z:center.z-Math.cos(angle)*8};
     for(const m of bladeLane(c,start,finish,2))flyingBladeHit(a,c,state,m,start,power*2.3,key,now);
     Object.assign(blade,finish);
     c.fx('blademaster-formation',finish.x,finish.z,2,{target:'',source:start});
    }
   }else if(key==='Z'){
    for(const blade of state.blades){
     for(const m of bladeLane(c,blade,origin,1.8))flyingBladeHit(a,c,state,m,blade,power*2.6,key,now);
     c.fx('blademaster-recall',a.x,a.z,2,{target:'',source:blade});
    }
    state.blades=[];
   }else{
    const count=state.blades.length;
    state.blades=[];
    for(const m of bladeLane(c,origin,endpoint,2+count*.9))c.damage(m,power*(5.8+count*1.55),undefined,tag);
    c.fx('blademaster-union',endpoint.x,endpoint.z,3+count*2,{target:target!.id,source:origin,level:count});
   }
  }
 }else{
  const hit=(m:SkillMonster,n:number)=>c.damage(m,power*n,undefined,tag);
  if(key==='X'){
   if(!target)return '请在近处瞄准敌人';
   state.armor[target.id]=now+8000;
   hit(target,4);
   c.fx('linebreaker-sunder',target.x,target.z,3,{source:origin,target:target.id});
  }else if(key==='Q'){
   if(!target||Math.hypot(target.x-a.x,target.z-a.z)>12)return '请在近处瞄准敌人';
   hit(target,4.6);
   const strikes=target.strikes??=[];
   for(const [index,damage] of [2.3,1.15].entries())if(strikes.length<64)strikes.push({owner:a.name,skillId:tag,at:now+220*(index+1),damage:power*damage});
   c.fx('linebreaker-triple',target.x,target.z,5,{source:origin,target:target.id});
  }else if(key==='Z'){
   state.guard={until:now+2400,power};
   r.effects.lineGuard={until:state.guard.until,level:1};
   c.fx('linebreaker-guard',a.x,a.z,4);
  }else{
   if(!target)return '请瞄准可见的敌人';
   const center=firePoint(c,target),ready=(state.readyUntil||0)>now;
   delete state.readyUntil;
   const struck=new Set<SkillMonster>();
   for(const m of bladeLane(c,origin,center,4)){
    const cracked=(state.armor[m.id]||0)>now;delete state.armor[m.id];
    struck.add(m);hit(m,(cracked?9:6.7)*(ready?1.25:1));
    if(!cracked)continue;
    const dx=m.x-a.x,dz=m.z-a.z,length=Math.hypot(dx,dz)||1,start=firePoint(c,m);
    for(const side of [-1,1]){
     const end={...start,x:start.x+dz/length*8*side,z:start.z-dx/length*8*side};
     for(const other of bladeLane(c,start,end,2))if(!struck.has(other)){struck.add(other);hit(other,3);}
     c.fx('linebreaker-fork',end.x,end.z,2,{source:start,target:''});
    }
   }
   c.fx('linebreaker-break',center.x,center.z,6,{source:origin,target:target.id});
  }
 }
 r.cooldowns[id]=now+({X:5,Q:10,Z:16,C:30}[key as 'X'|'Q'|'Z'|'C'])*1000*(1-ancientGearStats(p).cooldown);
 return null;
}

export function queueLineCounter(a:SkillActor,map:string,id:string,now:number){
 const state=a.skillRuntime?.advancedSword,guard=state?.map===map?state.guard:undefined;
 if(guard&&guard.until>now&&!guard.counter)guard.counter=id;
}

export function noteLineOpening(a:SkillActor,map:string,m:SkillMonster,now:number){
 const enemy=m as SkillMonster & {action?:string;actionAt?:number};
 if(a.advancement!=='linebreaker'||enemy.action!=='windup')return;
 const state=swordState(a,map),action=enemy.actionAt||0;
 if(state.openings[m.id]===action)return;
 state.openings[m.id]=action;state.readyUntil=now+7000;
}

export function tickAdvancedSword(a:SkillActor,p:AncientProfile,c:SkillContext,now:number){
 const state=a.skillRuntime?.advancedSword,guard=state?.guard;
 if(!state||state.map!==c.map||a.hp<=0||!advancementRoute(p))return;
 for(const [id,angle] of Object.entries(state.angles))if(angle.until<=now)delete state.angles[id];
 for(const [id,until] of Object.entries(state.armor))if(until<=now)delete state.armor[id];
 for(const [id,at] of Object.entries(state.openings))if(at+20000<=now)delete state.openings[id];
 if(!guard)return;
 if(!guard.counter){if(guard.until<=now)delete state.guard;return;}
 const victim=c.monsters.find(m=>m.id===guard.counter&&m.hp>0);
 delete state.guard;delete runtime(a).effects.lineGuard;
 if(!victim)return;
 c.damage(victim,guard.power*5,undefined,'advancement:linebreaker:Z');
 c.fx('linebreaker-counter',victim.x,victim.z,4,{source:{x:a.x,y:a.y,z:a.z},target:victim.id});
}

type ShadowLine={start:StormPoint;end:StormPoint};
export type AdvancedShadowRuntime={
 map:string;
 marks:Record<string,{until:number;angle:number;flanks:number}>;
 anchor?:StormPoint & {until:number;power:number};
 twin?:{point:StormPoint;until:number};
 wire?:ShadowLine & {until:number;power:number;side:Record<string,number>};
 returning?:{from:StormPoint;at:number;power:number};
 cuts?:{line:ShadowLine;at:number;power:number}[];
};

function shadowState(a:SkillActor,map:string){
 const r=runtime(a);
 if(r.advancedShadow?.map!==map)r.advancedShadow={map,marks:{}};
 return r.advancedShadow;
}

function groundDash(a:SkillActor,c:SkillContext,dx:number,dz:number,range:number){
 const start=firePoint(c,a);
 let end={...start,y:a.y-1.7};
 for(let d=.45;d<=range;d+=.45){
  const x=a.x+dx*d,z=a.z+dz*d,y=ancientMapHeight(c.map,x,z,end.y);
  if(blocked(x,z,.65,c.map,y)||Math.abs(y-end.y)>1.25||c.canMove&&!c.canMove(end.x,end.z,x,z))break;
  end={x,y,z};
 }
 return end;
}

function shadowMotion(a:SkillActor,c:SkillContext,end:StormPoint){
 const point={...end,y:end.y+1.7};
 if(c.motion)c.motion(point,3);
 else Object.assign(a,point);
}

function shadowHit(a:SkillActor,c:SkillContext,m:SkillMonster,route:string,key:string,power:number,now:number){
 const state=shadowState(a,c.map),tag='advancement:'+route+':'+key;
 const mark=state.marks[m.id];
 let extra=0;
 if(route==='shadowhunter'&&mark&&mark.until>now){
  const angle=Math.atan2(a.x-m.x,a.z-m.z);
  if(Math.abs(Math.atan2(Math.sin(angle-mark.angle),Math.cos(angle-mark.angle)))>=1.05){
   mark.angle=angle;
   mark.flanks++;
   extra=power*(mark.flanks%3===0?.85:.45);
   const back={x:m.x+(m.x-a.x)*.3,y:a.y,z:m.z+(m.z-a.z)*.3};
   c.fx('shadowhunter-flank',m.x,m.z,3,{target:m.id,source:back});
  }
 }
 c.damage(m,power+extra,undefined,tag);
 const twin=state.twin;
 if(route==='shadowhunter'&&twin&&twin.until>now&&m.hp>0){
  delete state.twin;
  if(lineClear(twin.point.x,twin.point.y+1,twin.point.z,m.x,firePoint(c,m).y+1,m.z,c.map)){
   c.damage(m,power*.65,undefined,'advancement:shadowhunter:Z');
   c.fx('shadowhunter-twin',m.x,m.z,3,{target:m.id,source:twin.point});
  }
 }
}

function recallAdvancedShadow(a:SkillActor,c:SkillContext,state:AdvancedShadowRuntime,now:number){
 const anchor=state.anchor;
 if(!anchor)return false;
 delete state.anchor;
 const start={x:a.x,y:a.y-1.7,z:a.z};
 const dx=anchor.x-start.x,dz=anchor.z-start.z,distance=Math.hypot(dx,dz);
 if(distance<.4)return true;
 const end=groundDash(a,c,dx/distance,dz/distance,distance+.01);
 for(const m of bladeLane(c,start,end,2.2))shadowHit(a,c,m,'shadowhunter','Q',anchor.power,now);
 shadowMotion(a,c,end);
 c.fx('shadowhunter-recall',end.x,end.z,2.2,{target:'',source:start});
 return true;
}

function castShadowAdvancement(a:SkillActor,p:AncientProfile,route:string,key:string,id:string,direction:unknown,c:SkillContext,now:number,level:number){
 if(a.hp<=0)return '请在存活时使用技能';
 const r=runtime(a),state=shadowState(a,c.map);
 if(route==='shadowhunter'&&key==='Q'&&state.anchor)return recallAdvancedShadow(a,c,state,now)?null:'返回点失效';
 if((r.cooldowns[id]||0)>now)return '技能冷却中';
 const power=ancientSkillDamage(p)*skillDamageMultiplier(a,now)*(1+Math.min(99,level-1)*.055);
 const start={x:a.x,y:a.y-1.7,z:a.z};
 const target=selectSkillTarget(a,direction,60,c);
 const dir=Array.isArray(direction)&&direction.length===3&&direction.every(Number.isFinite)?direction:undefined;
 const length=Math.hypot(dir?.[0]||0,dir?.[2]||0),dx=(dir?.[0]||0)/(length||1),dz=(dir?.[2]||0)/(length||1);
 const hit=(m:SkillMonster,n:number)=>shadowHit(a,c,m,route,key,power*n,now);
 if(route==='shadowhunter'){
  if(key==='X'){
   if(!target)return '请瞄准可见的敌人';
   hit(target,4);
   if(target.hp>0)state.marks[target.id]={until:now+10000,angle:Math.atan2(a.x-target.x,a.z-target.z),flanks:0};
   c.fx('shadowhunter-mark',target.x,target.z,3,{target:target.id,source:start});
  }else if(key==='Q'){
   if(length<.01)return '请先瞄准冲刺方向';
   const end=groundDash(a,c,dx,dz,Math.min(23,10+level*.24));
   if(Math.hypot(end.x-start.x,end.z-start.z)<.4)return '冲刺路径被阻挡';
   state.anchor={...start,until:now+5500,power:power*3.6};
   shadowMotion(a,c,end);
   c.fx('shadowhunter-swap',end.x,end.z,3,{target:'',source:start});
  }else if(key==='Z'){
   state.twin={point:state.anchor??start,until:now+6500};
   c.fx('shadowhunter-twin',state.twin.point.x,state.twin.point.z,3);
  }else{
   let victim=target&&state.marks[target.id]?.until>now?target:stormTargets(c,start,22).find(m=>state.marks[m.id]?.until>now);
   if(!victim)return '需要一个带追影印记的目标';
   for(let i=0;i<4&&victim;i++){
    const center=firePoint(c,victim),angle=i*Math.PI/2;
    const source={...center,x:center.x+Math.sin(angle)*5,z:center.z+Math.cos(angle)*5};
    hit(victim,2.7);
    c.fx('shadowhunter-hunt',center.x,center.z,3,{source,target:victim.id,phase:String(i)});
    if(victim.hp<=0)victim=stormTargets(c,center,10).find(m=>state.marks[m.id]?.until>now);
   }
  }
 }else{
  if(length<.01)return '请先瞄准';
  const end=groundDash(a,c,dx,dz,key==='Q'?Math.min(25,11+level*.27):23);
  if(key==='X'){
   state.wire={start,end,until:now+8500,power:power*4.5,side:{}};
   c.fx('boundarycutter-wire',end.x,end.z,1,{target:'',source:start});
  }else if(key==='Q'){
   if(Math.hypot(end.x-start.x,end.z-start.z)<.4)return '冲刺路径被阻挡';
   for(const m of bladeLane(c,start,end,2.8)){
    const mob=m as SkillMonster&{action?:string;attackWindup?:unknown;special?:unknown};
    if(mob.action!=='windup')continue;
    if(!isAncientBoss(m.kind)){delete mob.attackWindup;delete mob.special;mob.action='idle';}
    hit(m,isAncientBoss(m.kind)?5.1:4.1);
    r.effects.shadowStride={until:now+3500,level:1};
   }
   shadowMotion(a,c,end);
   c.fx('boundarycutter-intercept',end.x,end.z,3,{target:'',source:start});
  }else if(key==='Z'){
   for(const m of bladeLane(c,start,end,2))hit(m,3.4);
   state.returning={from:end,at:now+850,power:power*3.9};
   c.fx('boundarycutter-throw',end.x,end.z,2,{target:'',source:start});
  }else{
   const center=target?firePoint(c,target):end;
   state.cuts=[];
   for(const angle of [0,Math.PI/3,Math.PI*2/3]){
    const x=Math.sin(angle)*12,z=Math.cos(angle)*12;
    const from={...center,x:center.x-x,z:center.z-z},to={...center,x:center.x+x,z:center.z+z};
    state.cuts.push({line:{start:from,end:to},at:now+450+state.cuts.length*270,power:power*3.6});
    c.fx('boundarycutter-grid',to.x,to.z,2,{source:from,target:''});
   }
  }
 }
 r.cooldowns[id]=now+({X:5,Q:11,Z:16,C:34}[key as 'X'|'Q'|'Z'|'C'])*1000*(1-ancientGearStats(p).cooldown);
 return null;
}

export function tickAdvancedShadow(a:SkillActor,p:AncientProfile,c:SkillContext,now:number){
 const state=a.skillRuntime?.advancedShadow,route=advancementRoute(p)?.id;
 if(!state||state.map!==c.map||a.hp<=0||(route!=='shadowhunter'&&route!=='boundarycutter'))return;
 for(const [id,mark] of Object.entries(state.marks))if(mark.until<=now)delete state.marks[id];
 if(state.anchor&&state.anchor.until<=now)recallAdvancedShadow(a,c,state,now);
 const returning=state.returning;
 if(returning&&returning.at<=now){
  delete state.returning;
  const end={x:a.x,y:a.y-1.7,z:a.z};
  for(const m of bladeLane(c,returning.from,end,2.1))shadowHit(a,c,m,route,'Z',returning.power,now);
  c.fx('boundarycutter-return',end.x,end.z,2,{target:'',source:returning.from});
 }
 if(state.cuts?.length){
  const active=state.cuts.filter(cut=>cut.at<=now);
  state.cuts=state.cuts.filter(cut=>cut.at>now);
  for(const {line,power} of active)for(const m of bladeLane(c,line.start,line.end,2.2)){
   const x=(line.start.x+line.end.x)*.5,z=(line.start.z+line.end.z)*.5;
   shadowHit(a,c,m,route,'C',power*(Math.hypot(m.x-x,m.z-z)<=2?1.33:1),now);
  }
 }
 const wire=state.wire;
 if(!wire)return;
 if(wire.until<=now){delete state.wire;return;}
 const dx=wire.end.x-wire.start.x,dz=wire.end.z-wire.start.z,length=Math.hypot(dx,dz)||1;
 for(const m of c.monsters){
  if(m.hp<=0)continue;
  const x=m.x-wire.start.x,z=m.z-wire.start.z,along=(x*dx+z*dz)/length,side=(x*dz-z*dx)/length;
  const previous=wire.side[m.id];wire.side[m.id]=side;
  if(previous===undefined||previous*side>0||Math.abs(side)>5||along<0||along>length)continue;
  delete state.wire;
  m.slow=.3;m.slowUntil=now+2500;
  shadowHit(a,c,m,route,'X',wire.power,now);
  c.fx('boundarycutter-trigger',m.x,m.z,3);
  break;
 }
}

type StoneWall={start:StormPoint;end:StormPoint;until:number};
export type StoneAdvancementRuntime={
 map:string;
 spikes:(StormPoint & {until:number})[];
 cracks:(StormPoint & {until:number})[];
 walls:StoneWall[];
 armor?:{left:number;absorbed:number;until:number;power:number};
 aftershock?:number;
};

function stoneState(a:SkillActor,map:string){
 const r=runtime(a);
 if(r.advancedStone?.map!==map)r.advancedStone={map,spikes:[],cracks:[],walls:[]};
 return r.advancedStone;
}

function crossStoneWall(wall:StoneWall,from:{x:number;z:number},to:{x:number;z:number}){
 const dx=wall.end.x-wall.start.x,dz=wall.end.z-wall.start.z;
 const dxMove=to.x-from.x,dzMove=to.z-from.z;
 const det=dxMove*dz-dzMove*dx;
 if(Math.abs(det)<.00001)return false;
 const x=wall.start.x-from.x,z=wall.start.z-from.z;
 const along=(x*dz-z*dx)/det,across=(x*dzMove-z*dxMove)/det;
 return along>=0&&along<=1&&across>=0&&across<=1;
}

export function stoneWallsBlock(a:SkillActor,map:string,from:{x:number;z:number},to:{x:number;z:number},now:number){
 const state=a.skillRuntime?.advancedStone;
 return state?.map===map&&state.walls.some(wall=>wall.until>now&&crossStoneWall(wall,from,to));
}

export function absorbStoneArmor(a:SkillActor,map:string,amount:number,now:number){
 const state=a.skillRuntime?.advancedStone,armor=state?.map===map?state.armor:undefined;
 if(!armor||armor.until<=now||armor.left<=0||amount<=0||!Number.isFinite(amount))return amount;
 const absorbed=Math.min(amount,armor.left);
 armor.left-=absorbed;armor.absorbed+=absorbed;
 return amount-absorbed;
}

function triangleContains(point:{x:number;z:number},a:StormPoint,b:StormPoint,c:StormPoint){
 const sign=(from:StormPoint,to:StormPoint)=>(to.x-from.x)*(point.z-from.z)-(to.z-from.z)*(point.x-from.x);
 if(Math.abs((b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x))<.5)return false;
 const values=[sign(a,b),sign(b,c),sign(c,a)];
 return values.every(v=>v>=0)||values.every(v=>v<=0);
}

function castStoneAdvancement(a:SkillActor,p:AncientProfile,route:string,key:string,id:string,direction:unknown,c:SkillContext,now:number,level:number){
 if(a.hp<=0)return '请在存活时使用技能';
 const r=runtime(a);
 if((r.cooldowns[id]||0)>now)return '技能冷却中';
 const state=stoneState(a,c.map),start={x:a.x,y:a.y-1.7,z:a.z};
 const target=selectSkillTarget(a,direction,60,c);
 const power=ancientSkillDamage(p)*skillDamageMultiplier(a,now)*(1+Math.min(99,level-1)*.055);
 const tag='advancement:'+route+':'+key;
 const hit=(m:SkillMonster,n:number)=>c.damage(m,power*n,undefined,tag);
 if(route==='mountainguard'){
  if(key==='Q'){
   state.armor={left:(a.maxHp||100)*Math.min(.38,.2+level*.006),absorbed:0,until:now+9500,power};
   c.fx('mountainguard-armor',a.x,a.z,4);
  }else{
   const dir=Array.isArray(direction)&&direction.length===3&&direction.every(Number.isFinite)?direction:undefined;
   const length=Math.hypot(dir?.[0]||0,dir?.[2]||0);
   if(length<.01)return '请先瞄准';
   const dx=dir![0]/length,dz=dir![2]/length;
   const point=(forward:number,side:number):StormPoint=>{
    const x=start.x+dx*forward+dz*side,z=start.z+dz*forward-dx*side;
    return {x,y:ancientMapHeight(c.map,x,z,start.y),z};
   };
   if(key==='X'){
    const boost=(state.aftershock||0)>now;
    delete state.aftershock;
    const end=point(boost?16:10,0);
    for(const m of bladeLane(c,start,end,3))hit(m,Math.hypot(m.x-a.x,m.z-a.z)<=4?4.8:boost?3.9:2.6);
    c.fx('mountainguard-fist',end.x,end.z,3,{source:start,target:''});
   }else if(key==='Z'){
    state.walls=[];
    for(const sign of [-1,1]){
     const from=point(6,sign*2.75),end=point(6,sign*10);
     state.walls.push({start:from,end,until:now+10000});
     c.fx('mountainguard-gate',end.x,end.z,2,{source:from,target:''});
    }
   }else{
    const center=target?firePoint(c,target):point(14,0);
    const victims=stormTargets(c,center,12);
    for(const m of victims){
     const side=(m.x-center.x)*dz-(m.z-center.z)*dx;
     const x=m.x-dz*side*.8,z=m.z+dx*side*.8,candidate=firePoint(c,m);
     if(!isAncientBoss(m.kind)&&m.kind!=='player'&&!blocked(x,z,.65,c.map,candidate.y)&&lineClear(m.x,candidate.y+1,m.z,x,candidate.y+1,z,c.map)){
      m.x=x;m.z=z;
     }
     const finalSide=(m.x-center.x)*dz-(m.z-center.z)*dx;
     hit(m,Math.abs(finalSide)<=3?8.8:4.5);
    }
    c.fx('mountainguard-peaks',center.x,center.z,12,{source:start,target:target?.id||''});
   }
  }
 }else{
  state.spikes=state.spikes.filter(point=>point.until>now);
  state.cracks=state.cracks.filter(point=>point.until>now);
  if(key==='X'){
   if(!target)return '请瞄准可见的敌人';
   const point=firePoint(c,target);
   state.spikes.push({...point,until:now+22000});
   if(state.spikes.length>4)state.spikes.shift();
   hit(target,4.1);
   c.fx('veinforger-spike',point.x,point.z,3);
  }else{
   if(!state.spikes.length)return '先用钉脉放下岩钉';
   if(key==='Q'){
    const route=[start,...state.spikes],hits=new Set<SkillMonster>();
    for(let i=1;i<route.length;i++){
     const from=route[i-1],to=route[i];
     const nearCrack=state.cracks.some(crack=>Math.hypot(crack.x-to.x,crack.z-to.z)<5);
     for(const m of bladeLane(c,from,to,nearCrack?4.5:2.6))if(!hits.has(m)){hits.add(m);hit(m,nearCrack?5.1:4.1);}
     c.fx('veinforger-current',to.x,to.z,nearCrack?5:3,{source:from,target:''});
    }
   }else if(key==='Z'){
    const aim=target?firePoint(c,target):start;
    const point=[...state.spikes].sort((a,b)=>Math.hypot(a.x-aim.x,a.z-aim.z)-Math.hypot(b.x-aim.x,b.z-aim.z))[0];
    for(const m of stormTargets(c,point,7)){
     const dx=m.x-point.x,dz=m.z-point.z,distance=Math.hypot(dx,dz)||1;
     const x=m.x+dx/distance*2.8,z=m.z+dz/distance*2.8;
     const y=firePoint(c,m).y;
     if(!isAncientBoss(m.kind)&&m.kind!=='player'&&!blocked(x,z,.65,c.map,y)&&lineClear(m.x,y+1,m.z,x,y+1,z,c.map)){m.x=x;m.z=z;}
     m.slow=.35;m.slowUntil=now+2400;
     hit(m,4.6);
    }
    c.fx('veinforger-shift',point.x,point.z,7);
   }else{
    const points=state.spikes;
    state.spikes=[];
    for(const point of points){
     state.cracks.push({...point,until:now+15000});
     for(const m of stormTargets(c,point,5))hit(m,3.9);
     c.fx('veinforger-core',point.x,point.z,5);
    }
    state.cracks=state.cracks.slice(-8);
    if(points.length>=3)for(const m of c.monsters){
     if(m.hp<=0)continue;
     const inside=points.some((a,i)=>points.slice(i+1).some((b,j)=>points.slice(i+j+2).some(crack=>triangleContains(m,a,b,crack)&&skillAreaHits(a,m,35,c.map))));
     if(inside){hit(m,5.6);c.fx('veinforger-fracture',m.x,m.z,4);}
    }
   }
  }
 }
 r.cooldowns[id]=now+({X:5,Q:11,Z:18,C:34}[key as 'X'|'Q'|'Z'|'C'])*1000*(1-ancientGearStats(p).cooldown);
 return null;
}

export function tickAdvancedStone(a:SkillActor,p:AncientProfile,c:SkillContext,now:number){
 const state=a.skillRuntime?.advancedStone;
 if(!state||state.map!==c.map||a.hp<=0||advancementRoute(p)?.id!=='mountainguard')return;
 state.walls=state.walls.filter(wall=>wall.until>now);
 const armor=state.armor;
 if(!armor||armor.left>0&&armor.until>now)return;
 delete state.armor;
 if(armor.absorbed>0)state.aftershock=now+8500;
 const damage=armor.power*(2.1+4*Math.min(.65,armor.absorbed/(a.maxHp||100)));
 for(const m of stormTargets(c,{x:a.x,y:a.y-1.7,z:a.z},7))c.damage(m,damage,undefined,'advancement:mountainguard:Q');
 c.fx('mountainguard-shatter',a.x,a.z,7);
}

type LegionMinion={x:number;z:number;until:number;next:number;scale:number;slot:number};
export type SummonAdvancementRuntime={
 map:string;
 reserve:number[];
 legion:LegionMinion[];
 field?:StormPoint & {until:number;radius:number};
 transformUntil?:number;
 revivalUntil?:number;
 consumeUntil?:number;
};

function summonState(a:SkillActor,map:string){
 const r=runtime(a);
 if(r.advancedSummon?.map!==map)r.advancedSummon={map,reserve:[],legion:[]};
 return r.advancedSummon;
}

function castSummonAdvancement(a:SkillActor,p:AncientProfile,route:string,key:string,id:string,_direction:unknown,c:SkillContext,now:number,level:number){
 if(a.hp<=0)return '请在存活时使用技能';
 const r=runtime(a);
 if((r.cooldowns[id]||0)>now)return '技能冷却中';
 const state=summonState(a,c.map),gear=ancientGearStats(p);
 const point={x:a.x,y:a.y-1.7,z:a.z};
 const field=()=>({...point,until:now+11500,radius:Math.min(16,8+level*.18)});
 if(route==='spiritcaller'){
  if(key==='X'){
   if(r.summon?.hp&&r.summon.until>now)return '圣灵护卫已经在场';
   const position=[[2,0],[-2,0],[0,2],[0,-2]].find(([x,z])=>!blocked(a.x+x,a.z+z,.65,c.map));
   if(!position)return '没有召唤空间';
   const hp=Math.max(1,Math.floor((a.maxHp||100)*(.85+level*.035)*(1+gear.petHealth)));
   delete state.revivalUntil;
   r.summon={x:a.x+position[0],z:a.z+position[1],hp,maxHp:hp,damage:0,until:now+65000,attackAt:now,target:'',level};
   c.fx('spiritcaller-guardian',r.summon.x,r.summon.z,4);
  }else if(key==='Q'){
   state.field=field();c.fx('spiritcaller-domain',a.x,a.z,state.field.radius);
  }else if(key==='Z'){
   state.transformUntil=now+12500;
   r.effects.spiritAscendant={until:state.transformUntil,level:1};
   c.fx('spiritcaller-ascendant',a.x,a.z,6);
  }else{
   if(!r.summon||r.summon.hp<=0||r.summon.until<=now)return '需要一个在场的圣灵护卫';
   state.revivalUntil=now+26000;
   c.fx('spiritcaller-rebirth',r.summon.x,r.summon.z,4);
  }
 }else{
  if(key==='X'){
   if(state.reserve.length>=18)return '待命骷髅已满';
   state.reserve.push(1+Math.min(99,level-1)*.055);
   c.fx('necromancer-raise',a.x,a.z,4);
  }else if(key==='Q'){
   state.legion=state.legion.filter(pet=>pet.until>now);
   const count=Math.min(18-state.legion.length,state.reserve.length,Math.min(12,2+Math.floor(level/2)));
   if(!count)return '没有可释放的骷髅';
   for(let i=0;i<count;i++){
    const slot=Array.from({length:18},(_,slot)=>slot).find(slot=>!state.legion.some(pet=>pet.slot===slot))!;
    const angle=slot*Math.PI*2/18,x=a.x+Math.sin(angle)*2.5,z=a.z+Math.cos(angle)*2.5;
    const spawn=blocked(x,z,.45,c.map)?{x:a.x,z:a.z}:{x,z};
    state.legion.push({...spawn,until:now+38000,next:now+750,scale:state.reserve.shift()!,slot});
    c.fx('necromancer-release',spawn.x,spawn.z,2.5,{target:'',phase:String(slot)});
   }
  }else if(key==='Z'){
   state.consumeUntil=now+12000;
   c.fx('necromancer-consume',a.x,a.z,5);
  }else{
   state.field=field();
   c.fx('necromancer-domain',a.x,a.z,state.field.radius);
  }
 }
 const cooldown=route==='spiritcaller'?{X:36,Q:22,Z:42,C:55}:{X:3,Q:10,Z:18,C:32};
 r.cooldowns[id]=now+cooldown[key as keyof typeof cooldown]*1000*(1-gear.cooldown);
 return null;
}

export function summonTarget(a:SkillActor,c:SkillContext,x:number,z:number){
 const eyeY=ancientMapHeight(c.map,x,z)+1;
 let best:SkillMonster|undefined,bestScore=-Infinity;
 for(const m of c.monsters){
  const monster=m as SkillMonster&{target?:string;dormant?:boolean};
  if(m.hp<=0||m.kind==='player'||monster.dormant)continue;
  const distance=Math.hypot(m.x-x,m.z-z);
  if(distance>24)continue;
  const score=(a.skillRuntime?.advancedPriority===m.id?100:0)+(monster.target===a.name?30:0)-distance;
  if(score<=bestScore||!lineClear(x,eyeY,z,m.x,firePoint(c,m).y+1,m.z,c.map))continue;
  best=m;
  bestScore=score;
 }
 return best;
}

function legionMove(c:SkillContext,pet:LegionMinion,x:number,z:number,speed:number,dt:number){
 const dx=x-pet.x,dz=z-pet.z,distance=Math.hypot(dx,dz);
 if(distance<1.8)return;
 const step=Math.min(speed*dt,distance-1.8);
 const tx=pet.x+dx/distance*step,tz=pet.z+dz/distance*step;
 if(!blocked(tx,tz,.45,c.map)){pet.x=tx;pet.z=tz;}
}

export function tickAdvancedSummon(a:SkillActor,p:AncientProfile,c:SkillContext,dt:number,now:number){
 const r=a.skillRuntime,state=r?.advancedSummon,route=advancementRoute(p)?.id;
 if(!state||state.map!==c.map||a.hp<=0||!r)return;
 const field=state.field&&state.field.until>now?state.field:undefined;
 if(field)for(const m of stormTargets(c,field,field.radius)){
  if((m.weakUntil||0)<=now||(m.weak||0)<.2){m.weak=.2;m.weakUntil=now+350;}
  if(route==='spiritcaller'&&((m.slowUntil||0)<=now||(m.slow||0)<.2)){m.slow=.2;m.slowUntil=now+350;}
  if(m.contributionsForMastery?.[a.name])(m.masteryMarks??={})[a.name+':summon-domain']={owner:a.name,id:'advancement:'+route+':'+(route==='spiritcaller'?'Q':'C'),until:now+350};
 }
 if(route==='spiritcaller'){
  const pet=r.summon;
  if(!pet)return;
  if(pet.hp<=0&&(state.revivalUntil||0)>now&&pet.until>now){
   delete state.revivalUntil;
   pet.hp=Math.max(1,Math.floor(pet.maxHp*.3));
   c.fx('spiritcaller-rebirth',pet.x,pet.z,4);
  }
  if(field&&pet.hp>0&&Math.hypot(pet.x-field.x,pet.z-field.z)<=field.radius)pet.hp=Math.min(pet.maxHp,pet.hp+pet.maxHp*.03*dt);
  pet.target=summonTarget(a,c,pet.x,pet.z)?.id||'';
  return;
 }
 if(route!=='necromancer')return;
 state.legion=state.legion.filter(pet=>pet.until>now);
 const bonus=1+Math.min(2,Math.log1p(p.necromancerStrength||0)*.18);
 for(const pet of state.legion){
  const target=summonTarget(a,c,pet.x,pet.z);
  const enhanced=!!field&&Math.hypot(pet.x-field.x,pet.z-field.z)<=field.radius;
  if(target&&Math.hypot(target.x-pet.x,target.z-pet.z)<2.7&&pet.next<=now){
   pet.next=now+1100;
   c.damage(target,ancientSkillDamage(p)*.1*pet.scale*bonus*(enhanced?1.2:1),undefined,'advancement:necromancer:Q');
   c.fx('necromancer-strike',target.x,target.z,2,{source:{x:pet.x,y:ancientMapHeight(c.map,pet.x,pet.z)+1,z:pet.z},target:target.id});
  }else legionMove(c,pet,target?.x??a.x,target?.z??a.z,enhanced?6:5,dt);
 }
}

export function recordNecromancerKill(a:SkillActor,p:AncientProfile,m:{level:number;kind:string},now:number){
 if(advancementRoute(p)?.id!=='necromancer'||(a.skillRuntime?.advancedSummon?.consumeUntil||0)<=now)return false;
 if(m.level<p.level-Math.max(8,Math.ceil(p.level*.15)))return false;
 const gain=(isAncientBoss(m.kind)?12:1)*Math.max(1,m.level/20);
 p.necromancerStrength=Math.min(1_000_000,(p.necromancerStrength||0)+gain);
 return true;
}

const elements=['fire','ice','storm','earth'] as const;
type Element=typeof elements[number];
type ElementalMarks=Partial<Record<Element,number>>;
export type ElementalAdvancementRuntime={
 map:string;attunement:number;marks:Record<string,ElementalMarks>;ward?:StormPoint&{until:number;radius:number};
 siphon?:{id:string;until:number;next:number;power:number};
 reactions:Record<string,{at:number;mask:number}>;
};

function elementalState(a:SkillActor,map:string){
 const r=runtime(a);
 if(r.advancedElements?.map!==map)r.advancedElements={map,attunement:-1,marks:{},reactions:{}};
 return r.advancedElements;
}

function elementMark(state:ElementalAdvancementRuntime,target:SkillMonster,element:Element,now:number){
 const marks=state.marks[target.id]??={};
 const old=marks[element]||0;
 marks[element]=now+10500;
 if(element==='ice'){target.slow=Math.max(target.slow||0,.28);target.slowUntil=Math.max(target.slowUntil||0,now+2400);}
 if(element==='earth'){target.weak=Math.max(target.weak||0,.18);target.weakUntil=Math.max(target.weakUntil||0,now+2600);}
 return old<=now;
}

function elementalReaction(a:SkillActor,c:SkillContext,state:ElementalAdvancementRuntime,m:SkillMonster,key:string,power:number,now:number){
 const marks=state.marks[m.id]||{};
 const active=elements.filter(element=>(marks[element]||0)>now);
 const mask=active.reduce((sum,element)=>sum|(1<<elements.indexOf(element)),0);
 const previous=state.reactions[m.id];
 if(active.length<2||previous?.mask===mask&&now-previous.at<2000)return;
 state.reactions[m.id]={at:now,mask};
 const tag='advancement:elemental-god:'+key;
 const point=firePoint(c,m);
 if(active.includes('fire')&&active.includes('ice')){
  c.damage(m,power*1.35,undefined,tag);
  m.vulnerable=Math.max(m.vulnerable||0,.15);m.vulnerableUntil=Math.max(m.vulnerableUntil||0,now+3000);
  c.fx('elemental-god-thermal',m.x,m.z,4);
 }
 if(active.includes('storm')){
  const linked=stormTargets(c,point,8).find(other=>other!==m);
  if(linked){c.damage(linked,power*.85,undefined,tag);c.fx('elemental-god-arc',linked.x,linked.z,3,{target:linked.id,source:point});}
 }
 if(active.includes('earth')&&active.includes('fire')){
  for(const other of stormTargets(c,point,3.5))c.damage(other,power*.75,undefined,tag);
  c.fx('elemental-god-eruption',m.x,m.z,4);
 }
 if(active.length===4)runtime(a).effects.elementCycle={until:now+4500,level:1};
}

function castElementalAdvancement(a:SkillActor,p:AncientProfile,route:string,key:string,id:string,direction:unknown,c:SkillContext,now:number,level:number){
 if(a.hp<=0)return '请在存活时使用技能';
 const r=runtime(a),state=elementalState(a,c.map);
 if((r.cooldowns[id]||0)>now)return '技能冷却中';
 const target=selectSkillTarget(a,direction,60,c);
 if(!target&&(route==='elemental-god'||key==='Q'))return '请瞄准可见的敌人';
 const origin={x:a.x,y:a.y-1.7,z:a.z},point=target?firePoint(c,target):origin;
 const power=ancientSkillDamage(p)*skillDamageMultiplier(a,now)*(1+Math.min(99,level-1)*.055);
 const tag='advancement:'+route+':'+key;
 const hit=(m:SkillMonster,n:number)=>c.damage(m,power*n,undefined,tag);
 if(route==='elemental-god'&&target){
  if(key==='X'){
   const missing=elements.find(element=>(state.marks[target.id]?.[element]||0)<=now)??elements[0];
   elementMark(state,target,missing,now);
   hit(target,4.5);
   elementalReaction(a,c,state,target,key,power,now);
   c.fx('elemental-god-brand',point.x,point.z,3,{target:target.id,source:origin,phase:missing});
  }else if(key==='Q'){
   const enemies=[target,...stormTargets(c,point,12).filter(m=>m!==target)];
   const marks=elements.filter(element=>(state.marks[target.id]?.[element]||0)>now);
   for(const m of enemies){
    if(m!==target&&marks.length)elementMark(state,m,marks[0],now);
    elementMark(state,m,'storm',now);
    hit(m,4.5);
    elementalReaction(a,c,state,m,key,power,now);
   }
   c.fx('elemental-god-judgment',point.x,point.z,12);
  }else if(key==='Z'){
   const marks=elements.filter(element=>(state.marks[target.id]?.[element]||0)>now);
   const strikes=target.strikes??=[];
   const sequence=marks.length?marks:['earth'];
   for(const [index,element] of sequence.entries()){
    if(strikes.length<64)strikes.push({owner:a.name,skillId:tag,at:now+2700+index*240,damage:power*(element==='fire'?2.3:1.75)});
    c.fx('elemental-god-erosion',point.x,point.z,4,{target:target.id,phase:element});
   }
   target.vulnerable=Math.max(target.vulnerable||0,.2);target.vulnerableUntil=Math.max(target.vulnerableUntil||0,now+6000);
   (target.masteryMarks??={})[a.name+':elemental-erosion']={owner:a.name,id:tag,until:now+6000};
  }else{
   state.siphon={id:target.id,until:now+6500,next:now,power};
   c.fx('elemental-god-dominion',point.x,point.z,5,{target:target.id,source:origin});
  }
 }else if(route==='elemental-ward'){
  if(key==='X'){
   state.attunement=(state.attunement+1)%elements.length;
   const element=elements[state.attunement];
   for(const effect of ['elementFire','elementIce','elementStorm','elementEarth'])delete r.effects[effect];
   const effect=['elementFire','elementIce','elementStorm','elementEarth'][state.attunement];
   r.effects[effect]={until:now+18000,level:1};
   if(target){elementMark(state,target,element,now);hit(target,3.4);}
   c.fx('elemental-ward-shift',a.x,a.z,5,{target:'',phase:element});
  }else if(key==='Q'&&target){
   const element=elements[Math.max(0,state.attunement)];
   for(const m of [target,...stormTargets(c,point,element==='storm'?11:6).filter(m=>m!==target)]){
    hit(m,element==='fire'?5.3:3.7);
    elementMark(state,m,element,now);
    if(element==='ice'){m.slow=.5;m.slowUntil=now+3000;}
   }
   if(element==='earth')r.effects.elementEarth={until:now+6500,level:1};
   c.fx('elemental-ward-counter',point.x,point.z,element==='storm'?11:6,{target:target.id,source:origin,phase:element});
  }else if(key==='Z'){
   state.ward={...origin,until:now+11000,radius:Math.min(17,10+level*.12)};
   c.fx('elemental-ward-field',origin.x,origin.z,state.ward.radius);
  }else{
   const radius=Math.min(22,13+level*.14),center=state.ward&&state.ward.until>now?state.ward:origin;
   let damage=0;
   for(const m of stormTargets(c,center,radius)){
    const marks=elements.filter(element=>(state.marks[m.id]?.[element]||0)>now);
    damage+=hit(m,4+1.25*marks.length);
    delete state.marks[m.id];
   }
   a.hp=Math.min(a.maxHp||100,a.hp+damage*.12);
   r.effects.elementEarth={until:now+6500,level:1};
   c.fx('elemental-ward-equilibrium',center.x,center.z,radius);
  }
 }
 r.cooldowns[id]=now+({X:5,Q:12,Z:20,C:33}[key as 'X'|'Q'|'Z'|'C'])*1000*(1-ancientGearStats(p).cooldown);
 return null;
}

export function tickAdvancedElements(a:SkillActor,p:AncientProfile,c:SkillContext,now:number){
 const state=a.skillRuntime?.advancedElements,route=advancementRoute(p)?.id;
 if(!state||state.map!==c.map||a.hp<=0||!['elemental-god','elemental-ward'].includes(route||''))return;
 for(const [id,marks] of Object.entries(state.marks))if(elements.every(element=>(marks[element]||0)<=now))delete state.marks[id];
 for(const [id,reaction] of Object.entries(state.reactions))if(now-reaction.at>12000)delete state.reactions[id];
 const siphon=state.siphon;
 if(siphon){
  const target=c.monsters.find(m=>m.id===siphon.id&&m.hp>0);
  if(!target||siphon.until<=now)delete state.siphon;
  else if(siphon.next<=now){
   siphon.next=now+1000;
   const damage=c.damage(target,siphon.power*.85,undefined,'advancement:elemental-god:C');
   a.hp=Math.min(a.maxHp||100,a.hp+damage*.6);
   elementalReaction(a,c,state,target,'C',siphon.power*.65,now);
  }
 }
 const ward=state.ward;
 if(ward&&ward.until>now){
  const selected=elements[Math.max(0,state.attunement)];
  for(const m of stormTargets(c,ward,ward.radius)){
   elementMark(state,m,selected,now);
   if((m.weakUntil||0)<=now||(m.weak||0)<.18){m.weak=.18;m.weakUntil=now+350;}
   if(m.contributionsForMastery?.[a.name])(m.masteryMarks??={})[a.name+':fourfold']={owner:a.name,id:'advancement:elemental-ward:Z',until:now+400};
  }
 }
}

export type RiftRuntime={
 map:string; marks:Record<string,number>;
 anchor?:{from:StormPoint;to:StormPoint;until:number;power:number};
 domain?:StormPoint&{until:number;radius:number;power:number;previous:Record<string,boolean>;next:Record<string,number>};
 duel?:{target:string;until:number};
 guard?:{until:number;power:number;source?:string};
};
function riftState(a:SkillActor,map:string){
 const r=runtime(a);
 if(r.advancedRift?.map!==map)r.advancedRift={map,marks:{}};
 return r.advancedRift;
}
function riftMovement(a:SkillActor,c:SkillContext,to:StormPoint){
 if(blocked(to.x,to.z,.65,c.map,to.y)||c.canMove&&!c.canMove(a.x,a.z,to.x,to.z))return false;
 shadowMotion(a,c,to);
 return true;
}
function castRiftAdvancement(a:SkillActor,p:AncientProfile,route:string,key:string,id:string,direction:unknown,c:SkillContext,now:number,level:number){
 if(a.hp<=0)return '请在存活时使用技能';
 const r=runtime(a),state=riftState(a,c.map);
 const tag='advancement:'+route+':'+key;
 const origin={x:a.x,y:a.y-1.7,z:a.z};
 const power=ancientSkillDamage(p)*skillDamageMultiplier(a,now)*(1+Math.min(99,level-1)*.055);
 const hit=(m:SkillMonster,n:number)=>c.damage(m,power*n,undefined,tag);
 const anchor=state.anchor;
 if(route==='riftlord'&&key==='Q'&&anchor&&anchor.until>now){
  if(!riftMovement(a,c,anchor.from))return '返回位置被阻挡';
  delete state.anchor;
  for(const point of [anchor.from,anchor.to]){
   for(const m of stormTargets(c,point,5))c.damage(m,anchor.power*3.1,undefined,tag);
   c.fx('riftlord-return',point.x,point.z,5,{source:origin,target:''});
  }
  return null;
 }
 if((r.cooldowns[id]||0)>now)return '技能冷却中';
 const target=selectSkillTarget(a,direction,60,c);
 if(!target&&(key==='X'||key==='C'||route==='riftlord'&&key==='Q'))return '请瞄准可见的敌人';
 const center=target?firePoint(c,target):origin;
 if(route==='riftlord'){
  if(key==='X'&&target){
   const marked=(state.marks[target.id]||0)>now;
   hit(target,marked?6.8:4.1);
   if(marked){
    delete state.marks[target.id];
    if(target.hp>0){
     const angle=Math.atan2(target.x-a.x,target.z-a.z);
     const back={...center,x:center.x+Math.sin(angle)*4,z:center.z+Math.cos(angle)*4};
     const queued=target.strikes??=[];
     if(queued.length<64)queued.push({owner:a.name,skillId:tag,at:now+240,damage:power*3});
     c.fx('riftlord-rear',center.x,center.z,4,{target:target.id,source:back});
    }else delete r.cooldowns['advanced:Q'];
   }else if(target.hp>0)state.marks[target.id]=now+9500;
   c.fx('riftlord-cut',center.x,center.z,3,{target:target.id,source:origin});
  }else if(key==='Q'&&target){
   const dx=center.x-a.x,dz=center.z-a.z,distance=Math.hypot(dx,dz)||1;
   const x=center.x+dx/distance*2,z=center.z+dz/distance*2;
   const end={x,y:ancientMapHeight(c.map,x,z,center.y),z};
   if(!riftMovement(a,c,end))return '突袭位置被阻挡';
   state.anchor={from:origin,to:end,until:now+6800,power};
   for(const m of bladeLane(c,origin,end,2.7))hit(m,3.8);
   c.fx('riftlord-twin',end.x,end.z,4,{target:target.id,source:origin});
  }else if(key==='Z'){
   state.domain={...origin,until:now+9500,radius:Math.min(17,9+level*.15),power,previous:{},next:{}};
   r.effects.riftDomain={until:state.domain.until,level:1};
   c.fx('riftlord-domain',origin.x,origin.z,state.domain.radius);
  }else if(target){
   const queue=target.strikes??=[];
   const marked=(state.marks[target.id]||0)>now;
   delete state.marks[target.id];
   for(let i=0;i<5;i++){
    const angle=i*Math.PI*2/5,from={...center,x:center.x+Math.sin(angle)*7,z:center.z+Math.cos(angle)*7};
    if(queue.length<64)queue.push({owner:a.name,skillId:tag,at:now+i*210,damage:power*1.7});
    c.fx('riftlord-finale',center.x,center.z,4,{target:target.id,source:from,phase:String(i)});
   }
   const rifts=anchor&&anchor.until>now?[anchor.from,anchor.to]:[];
   for(const point of rifts)for(const m of bladeLane(c,point,center,3.5))if(m!==target)hit(m,2.8);
   if(queue.length<64)queue.push({owner:a.name,skillId:tag,at:now+1100,damage:power*(4+rifts.length*1.5+(marked?2:0))});
   delete state.anchor;
   r.effects.riftGuard={until:now+1250,level:1};
  }
 }else{
  if(key==='X'&&target){
   const marked=(state.marks[target.id]||0)>now;
   hit(target,marked?6.4:4.5);
   state.marks[target.id]=now+8000;
   c.fx('riftduelist-sever',target.x,target.z,4,{target:target.id,source:origin});
  }else if(key==='Q'){
   const directionVector=Array.isArray(direction)&&direction.length===3&&direction.every(Number.isFinite)?direction:undefined;
   const length=Math.hypot(directionVector?.[0]||0,directionVector?.[2]||0);
   if(!directionVector||length<.01)return '请先瞄准冲刺方向';
   const end=groundDash(a,c,directionVector[0]/length,directionVector[2]/length,Math.min(20,9+level*.2));
   if(Math.hypot(end.x-origin.x,end.z-origin.z)<.45||!riftMovement(a,c,end))return '位移路径被阻挡';
   for(const m of bladeLane(c,origin,end,2.5)){hit(m,3.4);if(m.hp>0)state.marks[m.id]=now+8000;}
   c.fx('riftduelist-displace',end.x,end.z,3,{target:'',source:origin});
  }else if(key==='Z'){
   state.guard={until:now+2300,power};
   r.effects.riftGuard={until:state.guard.until,level:1};
   c.fx('riftduelist-guard',origin.x,origin.z,4);
  }else if(target){
   state.duel={target:target.id,until:now+9500};
   hit(target,6.1);
   const queue=target.strikes??=[];
   if(queue.length<64)queue.push({owner:a.name,skillId:tag,at:now+600,damage:power*4.3});
   c.fx('riftduelist-arena',center.x,center.z,9,{target:target.id,source:origin});
  }
 }
 r.cooldowns[id]=now+({X:5,Q:12,Z:20,C:35}[key as 'X'|'Q'|'Z'|'C'])*1000*(1-ancientGearStats(p).cooldown);
 return null;
}
export function riftDuelModifiers(a:SkillActor,map:string,enemy:string|undefined,now:number){
 const state=a.skillRuntime?.advancedRift,duel=state?.map===map?state.duel:undefined;
 if(a.advancement!=='riftduelist'||!duel||duel.until<=now||!enemy)return {out:1,incoming:1};
 return {out:enemy===duel.target?1.3:.8,incoming:enemy===duel.target?1:.65};
}
export function queueRiftRiposte(a:SkillActor,map:string,id:string,now:number){
 const state=a.skillRuntime?.advancedRift,guard=state?.map===map?state.guard:undefined;
 if(guard&&guard.until>now&&!guard.source)guard.source=id;
}
export function tickAdvancedRift(a:SkillActor,p:AncientProfile,c:SkillContext,now:number){
 const state=a.skillRuntime?.advancedRift,route=advancementRoute(p)?.id;
 if(!state||state.map!==c.map||a.hp<=0||(route!=='riftlord'&&route!=='riftduelist'))return;
 for(const [id,until] of Object.entries(state.marks))if(until<=now)delete state.marks[id];
 const guard=state.guard;
 if(guard&&(guard.source||guard.until<=now)){
  const m=c.monsters.find(m=>m.id===guard.source&&m.hp>0);
  delete state.guard;delete runtime(a).effects.riftGuard;
  if(m){
   const marked=(state.marks[m.id]||0)>now;
   c.damage(m,guard.power*(marked?6.8:5),undefined,'advancement:riftduelist:Z');
   delete state.marks[m.id];
   c.fx('riftduelist-riposte',m.x,m.z,4,{target:m.id,source:{x:a.x,y:a.y,z:a.z}});
  }
 }
 const domain=state.domain;
 if(!domain)return;
 if(domain.until<=now){delete state.domain;return;}
 for(const m of c.monsters){
  if(m.hp<=0)continue;
  const inside=skillAreaHits(domain,m,domain.radius,c.map);
  const prior=domain.previous[m.id];domain.previous[m.id]=inside;
  if(inside&&((m.slowUntil||0)<=now||(m.slow||0)<.32)){m.slow=.32;m.slowUntil=now+350;}
  if(prior!==undefined&&prior!==inside&&(domain.next[m.id]||0)<=now){
   domain.next[m.id]=now+1600;
   c.damage(m,domain.power*3.7,undefined,'advancement:riftlord:Z');
   c.fx('riftlord-edge',m.x,m.z,3);
  }
 }
}

type BloodMark={count:number;until:number;next:number;power:number;key:string;spread:number};
export type AbyssAdvancementRuntime={
 map:string; blood:number; energy:number; marks:Record<string,BloodMark>;
 throne?:StormPoint&{until:number;next:number;radius:number;power:number};
 form?:{until:number;next:number;extended:boolean;power:number};
 tide?:{target:string;until:number;next:number;power:number};
};

function abyssState(a:SkillActor,map:string){
 const r=runtime(a);
 if(r.advancedAbyss?.map!==map)r.advancedAbyss={map,blood:0,energy:0,marks:{}};
 return r.advancedAbyss;
}

function applyBloodMark(state:AbyssAdvancementRuntime,m:SkillMonster,power:number,key:string,now:number,stacks=1,spread=0){
 if(m.hp<=0)return;
 const prior=state.marks[m.id],current=prior&&prior.until>now?prior:undefined;
 state.marks[m.id]={count:Math.min(5,(current?.count||0)+stacks),until:now+8500,next:current?.next||now+1000,power:Math.max(power,current?.power||0),key,spread};
}

function castAbyssAdvancement(a:SkillActor,p:AncientProfile,route:string,key:string,id:string,direction:unknown,c:SkillContext,now:number,level:number){
 if(a.hp<=0)return '请在存活时使用技能';
 const r=runtime(a),state=abyssState(a,c.map);
 if((r.cooldowns[id]||0)>now)return '技能冷却中';
 const target=selectSkillTarget(a,direction,60,c);
 if(!target&&(key==='X'||key==='Q'||route==='abyss-herald'&&key==='C'))return '请瞄准可见的敌人';
 const origin={x:a.x,y:a.y-1.7,z:a.z},point=target?firePoint(c,target):origin;
 const power=ancientSkillDamage(p)*skillDamageMultiplier(a,now)*(1+Math.min(99,level-1)*.055);
 const tag='advancement:'+route+':'+key;
 const hit=(m:SkillMonster,n:number)=>c.damage(m,power*n,undefined,tag);
 if(key==='X'&&target){
  applyBloodMark(state,target,power*.31,key,now,route==='abyss-king'?2:1);
  hit(target,route==='abyss-king'?4.4:3.6);
  c.fx(route+'-brand',point.x,point.z,4,{target:target.id,source:origin});
 }else if(key==='Q'&&target){
  const mark=state.marks[target.id];
  if(route==='abyss-king'){
   delete state.marks[target.id];
   const count=mark&&mark.until>now?mark.count:0;
   const damage=hit(target,3.8+count*1.15),healing=damage*.32+state.blood;
   state.blood=0;
   a.hp=Math.min(a.maxHp||100,a.hp+healing);
   state.energy=Math.min(100,state.energy+count*6);
  }else{
   if(!mark||mark.until<=now)return '目标尚未寄蚀';
   const others=stormTargets(c,point,11).filter(m=>m!==target).slice(0,Math.min(4,mark.count+1));
   for(const m of others){
    applyBloodMark(state,m,mark.power*.8,key,now,Math.max(1,mark.count-1),1);
    hit(m,2.9);
    c.fx('abyss-herald-fracture',m.x,m.z,3,{source:point,target:m.id});
   }
   hit(target,4.8);
  }
  c.fx(route+'-consume',point.x,point.z,5);
 }else if(key==='Z'){
  if(route==='abyss-king')a.hp=Math.max(1,a.hp-(a.maxHp||100)*.13);
  state.throne={...(route==='abyss-king'?origin:point),until:now+9000,next:now,radius:Math.min(18,10+level*.14),power};
  c.fx(route+'-field',state.throne.x,state.throne.z,state.throne.radius);
 }else if(route==='abyss-king'){
  if(state.energy<30)return '需要30点深渊能量';
  state.energy-=30;
  state.form={until:now+12000,next:now+1000,extended:false,power};
  r.effects.abyssKingForm={until:state.form.until,level:1};
  for(const m of stormTargets(c,origin,9)){applyBloodMark(state,m,power*.38,key,now,2);hit(m,3.8);}
  c.fx('abyss-king-form',origin.x,origin.z,9);
 }else if(target){
  state.tide={target:target.id,until:now+6500,next:now+1000,power};
  applyBloodMark(state,target,power*.38,key,now,2);
  hit(target,4.8);
  c.fx('abyss-herald-converge',point.x,point.z,13,{target:target.id,source:origin});
 }
 r.cooldowns[id]=now+({X:5,Q:12,Z:22,C:39}[key as 'X'|'Q'|'Z'|'C'])*1000*(1-ancientGearStats(p).cooldown);
 return null;
}

export function recordAdvancedAbyssHit(a:SkillActor,m:SkillMonster,actual:number,attack:string|undefined,map:string,now:number){
 const state=a.skillRuntime?.advancedAbyss;
 if(a.advancement!=='abyss-king'||!state||state.map!==map||actual<=0||a.hp<=0)return;
 state.energy=Math.min(100,state.energy+2);
 if((state.form?.until||0)>now){
  if(!attack?.startsWith('advancement:abyss-king:'))applyBloodMark(state,m,state.form!.power*.3,'C',now);
  a.hp=Math.min(a.maxHp||100,a.hp+actual*.08);
  if(m.hp<=0&&!state.form!.extended){
   state.form!.extended=true;state.form!.until+=4400;
   runtime(a).effects.abyssKingForm.until=state.form!.until;
  }
 }
}

export function tickAdvancedAbyss(a:SkillActor,p:AncientProfile,c:SkillContext,now:number){
 const state=a.skillRuntime?.advancedAbyss,route=advancementRoute(p)?.id;
 if(!state||state.map!==c.map||a.hp<=0||(route!=='abyss-king'&&route!=='abyss-herald'))return;
 const form=state.form;
 if(form){
  if(form.until<=now)delete state.form;
  else if(form.next<=now){
   form.next=now+1000;
   const cost=(a.maxHp||100)*.025,paid=Math.min(cost,state.blood);
   state.blood-=paid;
   a.hp=Math.max(1,a.hp-(cost-paid));
  }
 }
 const field=state.throne;
 if(field&&field.until>now&&field.next<=now){
  field.next=now+1000;
  for(const m of stormTargets(c,field,field.radius)){
   if((m.weakUntil||0)<=now||(m.weak||0)<.25){m.weak=.25;m.weakUntil=now+1100;}
   applyBloodMark(state,m,field.power*.26,'Z',now);
   const missing=1-a.hp/(a.maxHp||100);
   const actual=c.damage(m,field.power*(route==='abyss-king'?1+missing*1.35:.85),undefined,'advancement:'+route+':Z');
   if(route==='abyss-king')a.hp=Math.min(a.maxHp||100,a.hp+actual*.16);
  }
 }
 for(const [id,mark] of Object.entries(state.marks)){
  const m=c.monsters.find(m=>m.id===id);
  if(!m||mark.until<=now){delete state.marks[id];continue;}
  if(m.hp<=0){
   delete state.marks[id];
   if(route==='abyss-king')state.energy=Math.min(100,state.energy+7);
   else if(mark.spread<2){
    const next=stormTargets(c,firePoint(c,m),9).find(v=>!state.marks[v.id]);
    if(next){applyBloodMark(state,next,mark.power*.8,mark.key,now,Math.max(1,mark.count-1),mark.spread+1);c.fx('abyss-herald-fracture',next.x,next.z,3,{source:firePoint(c,m),target:next.id});}
   }
   continue;
  }
  if(mark.next>now)continue;
  mark.next=now+1000;
  const actual=c.damage(m,mark.power*mark.count*(form&&form.until>now?1.3:1),undefined,'advancement:'+route+':'+mark.key);
  if(route==='abyss-king'){
   const healing=actual*.12,banked=mark.count===5?healing*.65:0;
   state.blood=Math.min((a.maxHp||100)*.55,state.blood+banked);
   a.hp=Math.min(a.maxHp||100,a.hp+healing-banked);
  }
 }
 const tide=state.tide;
 if(tide&&tide.next<=now){
  tide.next=now+1000;
  const center=c.monsters.find(m=>m.id===tide.target);
  if(tide.until<=now||!center){delete state.tide;return;}
  const candidates=stormTargets(c,firePoint(c,center),13);
  for(const m of candidates){
   const mark=state.marks[m.id];
   if(mark&&m!==center){
    delete state.marks[m.id];
    applyBloodMark(state,center,mark.power,'C',now,mark.count);
    c.damage(m,tide.power*(1.2+mark.count*.65),undefined,'advancement:abyss-herald:C');
    c.fx('abyss-herald-converge',center.x,center.z,4,{target:center.id,source:firePoint(c,m)});
   }
  }
  if(center.hp>0)c.damage(center,tide.power*(1.1+.4*(state.marks[center.id]?.count||0)),undefined,'advancement:abyss-herald:C');
 }
}

type TimeSnapshot=StormPoint&{hp:number;cooldowns:Record<string,number>;until:number;updated:boolean;castId:string};
type TimeDebt={until:number;power:number;stored:number};
export type TimeAdvancementRuntime={
 map:string;
 marks:Record<string,TimeDebt>;
 anchor?:StormPoint&{until:number;power:number};
 rewind?:TimeSnapshot;
 linked?:{first:string;second:string;until:number};
 field?:StormPoint&{until:number;radius:number;targets:string[]};
};

function timeState(a:SkillActor,map:string){
 const r=runtime(a);
 if(r.advancedTime?.map!==map)r.advancedTime={map,marks:{}};
 return r.advancedTime;
}

function castTimeAdvancement(a:SkillActor,p:AncientProfile,route:string,key:string,id:string,direction:unknown,c:SkillContext,now:number,level:number){
 if(a.hp<=0)return '请在存活时使用技能';
 const r=runtime(a),state=timeState(a,c.map),tag='advancement:'+route+':'+key;
 const origin={x:a.x,y:a.y-1.7,z:a.z};
 const target=selectSkillTarget(a,direction,60,c);
 const power=ancientSkillDamage(p)*skillDamageMultiplier(a,now)*(1+Math.min(99,level-1)*.055);
 const hit=(m:SkillMonster,multiplier:number)=>c.damage(m,power*multiplier,undefined,tag);
 const anchor=state.anchor,snapshot=state.rewind;
 if(route==='time-sovereign'&&key==='Q'&&anchor&&anchor.until>now){
  if(target){for(const m of stormTargets(c,anchor,8))c.damage(m,anchor.power*4,undefined,tag);}
  else if(!riftMovement(a,c,anchor))return '返回位置被阻挡';
  delete state.anchor;
  c.fx('time-sovereign-echo',anchor.x,anchor.z,8,{source:origin,target:''});
  return null;
 }
 if(route==='time-sovereign'&&key==='Z'&&snapshot&&snapshot.until>now){
  if(!snapshot.updated&&target){
   state.rewind={...origin,hp:a.hp,cooldowns:{...r.cooldowns},until:snapshot.until,updated:true,castId:id};
   c.fx('time-sovereign-anchor',origin.x,origin.z,5);
   return null;
  }
  if(!riftMovement(a,c,snapshot))return '回溯位置被阻挡';
  for(const [skill,until] of Object.entries(snapshot.cooldowns))if(skill!==id)r.cooldowns[skill]=Math.min(r.cooldowns[skill]||0,until);
  for(const skill of ['advanced:X','advanced:Q','advanced:C'])if(!Object.hasOwn(snapshot.cooldowns,skill))delete r.cooldowns[skill];
  if(snapshot.hp>a.hp){
   a.hp=Math.min(a.maxHp||100,snapshot.hp);
   for(const m of stormTargets(c,origin,13))if(m.contributionsForMastery?.[a.name]){
    (m.masteryMarks??={})[a.name+':double-anchor']={owner:a.name,id:tag,until:now+5000};
   }
  }
  delete state.rewind;
  c.fx('time-sovereign-rewind',snapshot.x,snapshot.z,6,{source:origin,target:''});
  return null;
 }
 if((r.cooldowns[id]||0)>now)return '技能冷却中';
 if(!target&&(key==='X'||route==='time-weaver'&&(key==='Q'||key==='C')))return '请瞄准可见的敌人';
 const center=target?firePoint(c,target):origin;
 if(route==='time-sovereign'){
  if(key==='X'&&target){
   const prior=state.marks[target.id];
   if(prior&&prior.until>now){
    delete state.marks[target.id];
    c.damage(target,power*4.5+prior.power+prior.stored,undefined,tag);
   }else{
    hit(target,3.8);
    if(target.hp>0)state.marks[target.id]={until:now+6500,power:power*2.4,stored:0};
   }
   target.slow=.35;target.slowUntil=now+3300;
   c.fx('time-sovereign-rift',center.x,center.z,4,{source:origin,target:target.id});
  }else if(key==='Q'){
   const d=Array.isArray(direction)&&direction.length===3&&direction.every(Number.isFinite)?direction:undefined;
   const length=Math.hypot(d?.[0]||0,d?.[2]||0);
   if(!d||length<.01)return '请先瞄准跃迁方向';
   const end=groundDash(a,c,d[0]/length,d[2]/length,Math.min(25,12+level*.22));
   if(Math.hypot(end.x-origin.x,end.z-origin.z)<.45||!riftMovement(a,c,end))return '跃迁位置被阻挡';
   state.anchor={...origin,until:now+7000,power};
   for(const m of stormTargets(c,end,6))hit(m,3.2);
   c.fx('time-sovereign-double',end.x,end.z,5,{source:origin,target:''});
  }else if(key==='Z'){
   state.rewind={...origin,hp:a.hp,cooldowns:{...r.cooldowns},until:now+10000,updated:false,castId:id};
   c.fx('time-sovereign-anchor',origin.x,origin.z,5);
  }else{
   const radius=Math.min(18,11+level*.16),until=now+4000;
   const targets=stormTargets(c,center,radius).filter(m=>m.kind!=='player');
   state.field={...center,until,radius,targets:targets.map(m=>m.id)};
   for(const m of targets){
    if(isAncientBoss(m.kind)){m.slow=.68;m.slowUntil=until;hit(m,4.8);}
    else{m.frozenUntil=Math.max(m.frozenUntil||0,until);hit(m,6);}
   }
   c.fx('time-sovereign-verdict',center.x,center.z,radius);
  }
 }else if(key==='X'&&target){
  state.marks[target.id]={until:now+4300,power:power*2.5,stored:0};
  hit(target,3.1);
  c.fx('time-weaver-mark',center.x,center.z,3,{source:origin,target:target.id});
 }else if(key==='Q'&&target){
  const partner=stormTargets(c,center,13).find(m=>m!==target);
  if(!partner)return '因果连线需要第二个敌人';
  state.linked={first:target.id,second:partner.id,until:now+9000};
  hit(target,3.4);
  c.fx('time-weaver-link',partner.x,partner.z,4,{source:center,target:partner.id});
 }else if(key==='Z'){
  const past=snapshot&&snapshot.until>now?snapshot:undefined;
  if(past){
   if(!riftMovement(a,c,past))return '借位位置被阻挡';
   delete state.rewind;
   for(const m of stormTargets(c,past,6))hit(m,4);
   c.fx('time-weaver-return',past.x,past.z,6,{source:origin,target:''});
  }else{
   const d=Array.isArray(direction)&&direction.length===3&&direction.every(Number.isFinite)?direction:undefined;
   const length=Math.hypot(d?.[0]||0,d?.[2]||0);
   if(!d||length<.01)return '请先瞄准跃迁方向';
   const end=groundDash(a,c,d[0]/length,d[2]/length,Math.min(21,10+level*.2));
   if(Math.hypot(end.x-origin.x,end.z-origin.z)<.45||!riftMovement(a,c,end))return '跃迁位置被阻挡';
   state.rewind={...origin,hp:a.hp,cooldowns:{},until:now+8500,updated:false,castId:id};
   c.fx('time-weaver-borrow',end.x,end.z,5,{source:origin,target:''});
   return null;
  }
 }else if(target){
  const radius=Math.min(19,12+level*.16);
  for(const m of stormTargets(c,center,radius)){
   const debt=state.marks[m.id];delete state.marks[m.id];
   c.damage(m,power*5.5+(debt&&debt.until>now?debt.power+debt.stored:0),undefined,tag);
   m.weak=.25;m.weakUntil=now+5000;
  }
  c.fx('time-weaver-invert',center.x,center.z,radius);
 }
 r.cooldowns[id]=now+({X:5,Q:13,Z:23,C:38}[key as 'X'|'Q'|'Z'|'C'])*1000*(1-ancientGearStats(p).cooldown);
 return null;
}

export function noteAdvancedTimeDamage(a:SkillActor,map:string,id:string,actual:number,attack:string|undefined,now:number){
 const state=a.skillRuntime?.advancedTime,mark=state?.map===map?state.marks[id]:undefined;
 if(mark&&mark.until>now&&attack!=='advancement:time-weaver:X')mark.stored=Math.min(mark.power*2,mark.stored+actual*.22);
 const linked=state?.map===map?state.linked:undefined;
 if(a.advancement!=='time-weaver'||!linked||linked.until<=now||attack==='advancement:time-weaver:link')return;
 if(linked.first===id)return linked.second;
 if(linked.second===id)return linked.first;
}

export function tickAdvancedTime(a:SkillActor,p:AncientProfile,c:SkillContext,now:number){
 const state=a.skillRuntime?.advancedTime,route=advancementRoute(p)?.id;
 if(!state||state.map!==c.map||a.hp<=0||(route!=='time-sovereign'&&route!=='time-weaver'))return;
 if(state.anchor&&state.anchor.until<=now)delete state.anchor;
 if(state.rewind&&state.rewind.until<=now){
  if(route==='time-weaver')runtime(a).cooldowns[state.rewind.castId]=now+16000*(1-ancientGearStats(p).cooldown);
  delete state.rewind;
 }
 if(state.field&&state.field.until<=now)delete state.field;
 for(const [id,mark] of Object.entries(state.marks)){
  if(mark.until>now)continue;
  delete state.marks[id];
  const target=c.monsters.find(m=>m.id===id&&m.hp>0);
  if(!target)continue;
  c.damage(target,mark.power+mark.stored,undefined,'advancement:'+route+':X');
  c.fx(route+'-settle',target.x,target.z,4);
 }
}

const advancementTransientKeys=[
 'paladin','stormcaller','volt','crystal','winter','advancedFire','advancedCurse','advancedSword',
 'advancedShadow','advancedStone','advancedSummon','advancedElements','advancedRift','advancedAbyss','advancedTime','advancedPriority','bloodRevenge',
] as const;
const advancementEffects=[
 'bloodSacrifice','bloodRebirth','radiantRecovery','voltGuard','winterShield','snowVeil','lineGuard','shadowStride',
 'spiritAscendant','elementCycle','elementFire','elementIce','elementStorm','elementEarth','riftDomain','riftGuard','abyssKingForm',
];

export function reconcileAdvancementRuntime(a:SkillActor,p:AncientProfile,map:string,reset=false){
 const route=advancementRoute(p)?.id,r=route?runtime(a):a.skillRuntime;
 a.advancement=route;
 if(!r)return;
 const identity=route?map+'|'+route:undefined;
 if(!reset&&identity===r.advancementIdentity)return;
 if(r.advancedSummon&&r.summon)delete r.summon;
 for(const key of advancementTransientKeys)delete r[key];
 for(const key of advancementEffects)delete r.effects[key];
 if(identity)r.advancementIdentity=identity;
 else delete r.advancementIdentity;
}
