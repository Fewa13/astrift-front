import {potionCooldownMultiplier,potionRangeMultiplier} from './ancient-potion-effects';
// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {isAncientBoss} from './ancient-boss';
import {AUTHORITY_BALANCE as B,TIME_LORD as T,migrateTimeLord,isAuthorityJob} from './ancient-authority';
import {runtime,SKILLS,skillDamageMultiplier,type SkillActor} from './ancient-skills';
import {ancientSkillDamage} from './ancient-gear';
import {masteryLevel,masteryPower} from './ancient-mastery';
import {selectSkillTarget,type SkillContext,type SkillMonster} from './ancient-skill-combat';
import {ancientMapHeight,blocked,lineClear,type AncientProfile} from './ancient-rules';
export type TemporalHit={at:number;target:string;life:number;x:number;z:number;fromX:number;fromZ:number;amount:number;attack:string};
type Echo=TemporalHit&{due:number;ratio:number};
export type AuthorityRuntime={version:number;map:string;history:{at:number;hp:number;x?:number;y?:number;z?:number}[];lastHistory:number;attacks:TemporalHit[];echoQueue:Echo[];echoUntil?:number;echoRatio?:number;echoVisual?:number;shield?:{until:number;amount:number;maximum:number;credited?:boolean};domain?:{x:number;z:number;until:number;next:number;id:string;power:number;radius?:number;gates?:{x:number;z:number}[];portalAt?:number};anchor?:{x:number;y:number;z:number;until:number};bonusUntil?:number;bonus?:number};
function state(a:SkillActor,map:string){
 const r=runtime(a);
 if(!r.authority||r.authority.map!==map)r.authority={version:T.revision,map,history:[],lastHistory:0,attacks:[],echoQueue:[]};
 const s=r.authority;
 if(s.version!==T.revision){const old=s as AuthorityRuntime&{dead?:unknown;wraiths?:unknown;raised?:unknown};delete old.dead;delete old.wraiths;delete old.raised;if(a.profession==='timelord'){delete s.domain;delete s.bonusUntil;delete s.bonus;r.freeProjectiles=r.freeProjectiles?.filter(v=>!['timeflow','timecurse'].includes(v.id));}s.attacks=[];s.echoQueue=[];s.version=T.revision;}
 s.attacks??=[];s.echoQueue??=[];return s;
}
const power=(a:SkillActor,p:AncientProfile,id:string,now:number)=>ancientSkillDamage(p)*B.damage*masteryPower(p,id)*skillDamageMultiplier(a,now);
const living=(c:SkillContext)=>c.monsters.filter(m=>m.hp>0&&!(m as SkillMonster&{dormant?:boolean}).dormant);
// Remove the retired all-attribute debuff safely, including an old saved maximum-health change.
export function restoreAuthorityAttributes(m:SkillMonster,now:number){if(m.authorityOriginalHp){const scale=m.authorityOriginalHp/m.maxHp;m.hp=m.hp>0?Math.min(m.authorityOriginalHp,m.hp*scale):0;m.maxHp=m.authorityOriginalHp;delete m.authorityOriginalHp;}delete m.authorityDeprivedUntil;}
function strike(a:SkillActor,c:SkillContext,m:SkillMonster,n:number,id:string,now:number){const actual=c.damage(m,n,undefined,id);if(actual>0)(m.masteryMarks??={})[a.name+':'+id]={owner:a.name,id,until:now+15000};return actual;}
function enqueue(s:AuthorityRuntime,hit:TemporalHit,due:number,ratio:number){
 const bucket=Math.floor(due/120),existing=s.echoQueue.find(v=>v.target===hit.target&&v.life===hit.life&&Math.floor(v.due/120)===bucket);
 if(existing){existing.amount+=hit.amount*ratio/existing.ratio;return;}
 if(s.echoQueue.length<T.maxQueue)s.echoQueue.push({...hit,due,ratio});
}
export function recordAuthorityHit(a:SkillActor,m:SkillMonster,amount:number,attack:string|undefined,now:number){
 if(a.profession!=='timelord'||amount<=0||attack==='timeresurrection'||attack?.startsWith('artifact:')||m.id.startsWith('@player:'))return;
 const s=state(a,(a as SkillActor&{map?:string}).map||'tribe');
 const hit:TemporalHit={at:now,target:m.id,life:(m as SkillMonster&{respawnAt?:number}).respawnAt||0,x:m.x,z:m.z,fromX:a.x,fromZ:a.z,amount,attack:attack||'melee'};
 const previous=s.attacks[s.attacks.length-1];
 if(previous&&previous.target===hit.target&&previous.life===hit.life&&previous.attack===hit.attack&&Math.floor(previous.at/120)===Math.floor(now/120))previous.amount+=amount;
 else s.attacks.push(hit);
 s.attacks=s.attacks.filter(v=>now-v.at<=14000).slice(-T.maxHistory);
 if((s.echoUntil||0)>now)enqueue(s,hit,now+T.echoDelay,s.echoRatio||.3);
}
export function authorityClientRuntime(a:SkillActor){const r=a.skillRuntime;if(!r?.authority)return r;const {attacks,echoQueue,...publicState}=r.authority;return {...r,authority:{...publicState,history:publicState.history.slice(-12)}};}
export function absorbTimeShield(a:SkillActor,amount:number,now:number){const shield=a.skillRuntime?.authority?.shield;if(!shield||shield.until<=now||!Number.isFinite(amount)||amount<=0)return amount;const absorbed=Math.min(amount,shield.amount);shield.amount-=absorbed;if(shield.amount<=0)delete a.skillRuntime!.authority!.shield;return amount-absorbed;}
export function castAuthority(a:SkillActor,p:AncientProfile,id:string,direction:unknown,c:SkillContext,now:number):string|null|undefined{
 if(!isAuthorityJob(p.profession||''))return;
 if(a.hp<=0||!p.authority?.[p.profession as 'timelord'|'spacelord']?.unlocked||SKILLS[id]?.job!==p.profession)return '权柄技能不可用 / Authority skill unavailable';
 migrateTimeLord(p);
 const r=runtime(a),s=state(a,c.map),level=masteryLevel(p,id),n=power(a,p,id,now),returning=id==='spaceswap'&&s.anchor&&s.anchor.until>now;
 if((r.cooldowns[id]||0)>now&&!returning)return '技能冷却中 / Cooling down';
 const target=c.aimTarget||selectSkillTarget(a,direction,Math.min(100,50+(level-1)*2),c);
 const aim=Array.isArray(direction)&&direction.length===3&&direction.every(Number.isFinite)?direction as number[]:[0,0,1];
 let point={x:a.x,z:a.z};for(let distance=1;distance<=50;distance++){const next={x:a.x+aim[0]*distance,z:a.z+aim[2]*distance};if(blocked(next.x,next.z,.8,c.map))break;point=next;}
 const at=target||point;
 if(id==='timecurse'||id==='spacefracture'){
  if(!target)return '未命中目标 / No target hit';
  if(id==='timecurse'){const acceleration=T.acceleration(level),field=s.domain,linked=field?.id==='timedominion'&&field.until>now&&Math.hypot(target.x-field.x,target.z-field.z)<=(field.radius||B.domainRadius);const victims=linked?living(c).filter(m=>Math.hypot(m.x-target.x,m.z-target.z)<=T.agingSpread(level)&&Math.hypot(m.x-field!.x,m.z-field!.z)<=field!.radius!&&lineClear(target.x,ancientMapHeight(c.map,target.x,target.z)+1,target.z,m.x,ancientMapHeight(c.map,m.x,m.z)+1,m.z,c.map)):[target];for(const m of victims)m.authorityCurse={owner:a.name,id,next:now+1000/acceleration,until:now+B.curseDuration/acceleration,interval:1000/acceleration,power:n*T.cursePower};}
  else{const mark=target.authorityFracture?.owner===a.name&&target.authorityFracture.until>now;strike(a,c,target,n*(mark?B.fractureExplosion:B.fractureHit),id,now);if(mark){for(const m of living(c))if(m!==target&&Math.hypot(m.x-target.x,m.z-target.z)<6)strike(a,c,m,n*B.fractureSplash,id,now);delete target.authorityFracture;}else target.authorityFracture={owner:a.name,until:now+12000};}
  c.fx(id,target.x,target.z,3,{target:target.id,level});
 }else if(id==='timedominion'||id==='spacefold'||id==='spacecollapse'){
  const x=id==='timedominion'?a.x:at.x,z=id==='timedominion'?a.z:at.z;
  s.domain={x,z,until:now+(id==='timedominion'?T.stopDuration(level):id==='spacecollapse'?6000:B.domainDuration),next:now,id,power:n,radius:id==='timedominion'?T.stopRadius(level):B.domainRadius};
  if(id==='timedominion')for(const m of living(c).filter(m=>Math.hypot(m.x-x,m.z-z)<=s.domain!.radius!)){if(!isAncientBoss(m.kind)&&m.kind!=='player')m.frozenUntil=Math.max(m.frozenUntil||0,now+400);else{m.slow=T.bossSlow;m.slowUntil=now+400;}}
  if(id==='spacefold'){const gates=[{x:x-10,z},{x:x+10,z}];if(gates.every(v=>!blocked(v.x,v.z,1,c.map)))s.domain.gates=gates;}
  c.fx(id,x,z,s.domain.radius!,{target:'',level});
 }else if(id==='timeflow'){
  const origin={x:a.x,y:a.y,z:a.z};const past=s.history.filter(v=>now-v.at<=B.history).reduce<AuthorityRuntime['history'][number]|undefined>((best,v)=>!best||v.hp>=best.hp?v:best,undefined),already=!past||a.hp>=past.hp;
  if(!already&&past){a.hp=Math.min(a.maxHp||past.hp,past.hp);if(past.x!==undefined&&past.y!==undefined&&past.z!==undefined&&!blocked(past.x,past.z,.8,c.map,past.y-1.7)&&(!c.canMove||c.canMove(a.x,a.z,past.x,past.z))){a.x=past.x;a.y=Math.max(past.y,ancientMapHeight(c.map,past.x,past.z)+1.7);a.z=past.z;}}
  else{const amount=(a.maxHp||100)*T.rewindShield(level);s.shield={until:now+T.shieldDuration,amount,maximum:amount};}
  const debuffs=a as SkillActor&{hinderedUntil?:number;pvpEffects?:Partial<SkillMonster>};delete debuffs.pvpEffects;delete debuffs.hinderedUntil;
  s.bonusUntil=now+B.reflowDuration;s.bonus=B.reflowBonus+Math.min(.2,(level-1)*.002);
  c.fx(id,a.x,a.z,7,{target:'',level,source:origin});
 }else if(id==='timeresurrection'){
  const window=T.echoWindow(level),ratio=T.echoRatio(level),history=s.attacks.filter(v=>now-v.at<=window),start=history[0]?.at||now;
  for(let copy=0;copy<T.echoCopies(level);copy++)for(const hit of history)enqueue(s,hit,now+T.echoDelay+copy*T.echoSpacing+(hit.at-start)*.22,ratio);
  s.echoUntil=now+T.echoDuration(level);s.echoRatio=ratio;s.echoVisual=now;c.fx(id,a.x,a.z,12,{target:'',level});
 }else if(id==='spaceswap'){
  const origin={x:a.x,y:a.y,z:a.z};let to=returning?s.anchor!:{...origin};
  if(!returning){for(let d=1;d<=50*potionRangeMultiplier(p,now);d++){const x=origin.x+aim[0]*d,z=origin.z+aim[2]*d;if(blocked(x,z,.8,c.map)||c.canMove&&!c.canMove(to.x,to.z,x,z))break;to={x,y:ancientMapHeight(c.map,x,z)+1.7,z};}s.anchor={...origin,until:now+9000};}else delete s.anchor;
  a.x=to.x;a.y=to.y;a.z=to.z;
  for(const center of [origin,to]){for(const m of living(c))if(Math.hypot(m.x-center.x,m.z-center.z)<7)strike(a,c,m,n*3,id,now);c.fx(id,center.x,center.z,7);}
 }
 r.cooldowns[id]=now+SKILLS[id].cooldown*1000*potionCooldownMultiplier(p,now);return null;
}
export function tickAuthority(a:SkillActor,p:AncientProfile,c:SkillContext,dt:number,now:number){
 if(!isAuthorityJob(p.profession||'')||!p.authority?.[p.profession as 'timelord'|'spacelord']?.unlocked){delete runtime(a).authority;return;}
 const s=state(a,c.map);if(a.hp<=0){delete s.domain;s.echoQueue=[];delete s.echoUntil;delete s.shield;return;}
 if(p.profession==='timelord'&&now-s.lastHistory>=T.recordInterval){s.lastHistory=now;s.history.push({at:now,hp:a.hp,x:a.x,y:a.y,z:a.z});s.history=s.history.filter(v=>now-v.at<=B.history);}
 if(s.shield&&s.shield.until<=now)delete s.shield;
 s.attacks=s.attacks.filter(v=>now-v.at<=14000);
 for(const m of living(c)){
  const curse=m.authorityCurse;if(curse?.owner!==a.name)continue;
  if(now>=curse.next){const ticks=Math.min(18,Math.max(0,Math.floor((Math.min(now,curse.until)-curse.next)/curse.interval)+1));if(ticks){curse.next+=ticks*curse.interval;strike(a,c,m,curse.power*ticks,curse.id,now);}if(now>=curse.until)delete m.authorityCurse;}
  // Move existing DoT schedules forward; existing authoritative DoT processing consumes each tick once.
  if(curse.until>now)for(const dot of m.dots||[]){if(dot.timeRate||dot.skillId==='timecurse'||dot.until<=now)continue;const acceleration=T.acceleration(masteryLevel(p,'timecurse')),remaining=Math.max(0,Math.ceil((dot.until-Math.max(now,dot.next))/1000));dot.timeRate={interval:1000/acceleration,remaining};dot.next=now+Math.max(0,dot.next-now)/acceleration;dot.until=dot.next+Math.max(0,remaining-1)*dot.timeRate.interval+1;}
 }
 const d=s.domain;
 if(d&&d.until>now){
  if(d.gates&&now>=(d.portalAt||0)){const index=d.gates.findIndex(v=>Math.hypot(a.x-v.x,a.z-v.z)<1.6);if(index>=0){const to=d.gates[1-index];a.x=to.x;a.z=to.z;a.y=ancientMapHeight(c.map,to.x,to.z)+1.7;d.portalAt=now+2000;c.fx('spaceswap',to.x,to.z,4);}}
  const targets=living(c).filter(m=>Math.hypot(m.x-d.x,m.z-d.z)<=(d.radius||B.domainRadius));
  if(d.id==='timedominion')for(const m of targets){(m.masteryMarks??={})[a.name+':timedominion']={owner:a.name,id:'timedominion',until:d.until+6000};if(!isAncientBoss(m.kind)&&m.kind!=='player')m.frozenUntil=Math.max(m.frozenUntil||0,now+400);else{m.slow=Math.max(m.slow||0,T.bossSlow);m.slowUntil=Math.max(m.slowUntil||0,now+400);}}
  else if(now>=d.next){d.next=now+1000;for(const m of targets){m.slow=.75;m.slowUntil=now+1200;if(d.id==='spacecollapse'&&!isAncientBoss(m.kind)){const dx=d.x-m.x,dz=d.z-m.z,len=Math.hypot(dx,dz)||1,x=m.x+dx/len*1.5,z=m.z+dz/len*1.5;if(!blocked(x,z,1,c.map)){m.x=x;m.z=z;}}strike(a,c,m,d.power*(d.id==='spacecollapse'?3:1.2),d.id,now);}if(d.id==='spacefold'&&targets.length>1)for(const m of targets)strike(a,c,m,d.power*.4,d.id,now);}
 }else if(d){if(d.id==='spacecollapse')for(const m of living(c))if(Math.hypot(m.x-d.x,m.z-d.z)<=(d.radius||B.domainRadius)){strike(a,c,m,d.power*(m.authorityFracture?.owner===a.name?12:7),d.id,now);delete m.authorityFracture;}c.fx(d.id,d.x,d.z,d.radius||B.domainRadius,{target:'',phase:'time-resume'});delete s.domain;}
 const due=s.echoQueue.filter(v=>v.due<=now&&now-v.due<=T.echoGrace);s.echoQueue=s.echoQueue.filter(v=>v.due>now);
 for(const hit of due){const target=living(c).find(m=>m.id===hit.target&&((m as SkillMonster&{respawnAt?:number}).respawnAt||0)===hit.life);if(!target||Math.hypot(target.x-a.x,target.z-a.z)>120||!lineClear(hit.fromX,ancientMapHeight(c.map,hit.fromX,hit.fromZ)+1.5,hit.fromZ,target.x,ancientMapHeight(c.map,target.x,target.z)+1,target.z,c.map))continue;strike(a,c,target,hit.amount*hit.ratio,'timeresurrection',now);c.fx('timeresurrection',target.x,target.z,2,{target:target.id,phase:'time-echo',source:{x:hit.fromX,y:ancientMapHeight(c.map,hit.fromX,hit.fromZ)+1.5,z:hit.fromZ}});}
}
