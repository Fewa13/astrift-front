import {isAncientBoss} from './ancient-boss';
import {skillFlight} from './ancient-skill-flight';
// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {AUTHORITY_BALANCE as B,authorityProgress,isAuthorityJob} from './ancient-authority';
import {runtime,SKILLS,skillDamageMultiplier,type SkillActor} from './ancient-skills';
import {ancientSkillDamage} from './ancient-gear';
import {awardMastery,masteryLevel,masteryPower} from './ancient-mastery';
import {selectSkillTarget,type SkillContext,type SkillMonster} from './ancient-skill-combat';
import {ancientMapHeight,blocked,type AncientProfile} from './ancient-rules';
export type AuthorityRuntime={map:string;history:{at:number;hp:number}[];lastHistory:number;domain?:{x:number;z:number;until:number;next:number;id:string;power:number;gates?:{x:number;z:number}[];portalAt?:number};dead:{id:string;kind:string;at:number;x:number;z:number;maxHp:number}[];wraiths:{x:number;z:number;hp:number;maxHp:number;next:number;incubating:boolean}[];raised:{id:string;kind:string;x:number;z:number;until:number;next:number;power:number}[];anchor?:{x:number;y:number;z:number;until:number};bonusUntil?:number;bonus?:number};
const state=(a:SkillActor,map:string)=>{const r=runtime(a);if(!r.authority||r.authority.map!==map)r.authority={map,history:[],lastHistory:0,dead:[],wraiths:[],raised:[]};return r.authority;};
const power=(a:SkillActor,p:AncientProfile,id:string,now:number)=>ancientSkillDamage(p)*B.damage*masteryPower(p,id)*skillDamageMultiplier(a,now);
const living=(c:SkillContext)=>c.monsters.filter(m=>m.hp>0&&!(m as SkillMonster&{dormant?:boolean}).dormant);
function deprivation(m:SkillMonster,now:number){if(!m.authorityOriginalHp){m.authorityOriginalHp=m.maxHp;m.maxHp*=.8;m.hp*=.8;}m.authorityDeprivedUntil=now+B.deprivationDuration;}
export function restoreAuthorityAttributes(m:SkillMonster,now:number){if(m.authorityOriginalHp&&(m.authorityDeprivedUntil||0)<=now){const scale=m.authorityOriginalHp/m.maxHp;m.hp=m.hp>0?Math.min(m.authorityOriginalHp,m.hp*scale):0;m.maxHp=m.authorityOriginalHp;delete m.authorityOriginalHp;delete m.authorityDeprivedUntil;}}
function curse(m:SkillMonster,a:SkillActor,id:string,n:number,level:number,now:number){const acceleration=3+.1*(level-1);m.authorityCurse={owner:a.name,id,next:now+1000/acceleration,until:now+B.curseDuration/acceleration,interval:1000/acceleration,power:n*B.cursePower};}
function strike(a:SkillActor,c:SkillContext,m:SkillMonster,n:number,id:string,now:number){const actual=c.damage(m,n,undefined,id);if(actual>0)(m.masteryMarks??={})[a.name+':'+id]={owner:a.name,id,until:now+15000};return actual;}
export function castAuthority(a:SkillActor,p:AncientProfile,id:string,direction:unknown,c:SkillContext,now:number):string|null|undefined{
 if(!isAuthorityJob(p.profession||''))return;
 if(a.hp<=0||!p.authority?.[p.profession as 'timelord'|'spacelord']?.unlocked||SKILLS[id]?.job!==p.profession)return '权柄技能不可用 / Authority skill unavailable';
 if(id==='timeflow'&&c.projectileImpact){if(c.aimTarget){deprivation(c.aimTarget,now);c.fx(id,c.aimTarget.x,c.aimTarget.z,3);}return null;}
 const r=runtime(a),s=state(a,c.map),level=masteryLevel(p,id),n=power(a,p,id,now),returning=id==='spaceswap'&&s.anchor&&s.anchor.until>now;
 if((r.cooldowns[id]||0)>now&&!returning)return '技能冷却中 / Cooling down';
 const target=c.aimTarget||selectSkillTarget(a,direction,Math.min(100,50+(level-1)*2),c);
 const aim=Array.isArray(direction)&&direction.length===3&&direction.every(Number.isFinite)?direction as number[]:[0,0,1];
 let point={x:a.x,z:a.z};for(let distance=1;distance<=50;distance++){const next={x:a.x+aim[0]*distance,z:a.z+aim[2]*distance};if(blocked(next.x,next.z,.8,c.map))break;point=next;}
 const at=target||point;
 if(id==='timecurse'||id==='spacefracture'){
  if(!target)return '未命中目标 / No target hit';
  if(id==='timecurse')curse(target,a,id,n,level,now);
  else{const mark=target.authorityFracture?.owner===a.name&&target.authorityFracture.until>now;strike(a,c,target,n*(mark?B.fractureExplosion:B.fractureHit),id,now);if(mark){for(const m of living(c))if(m!==target&&Math.hypot(m.x-target.x,m.z-target.z)<6)strike(a,c,m,n*B.fractureSplash,id,now);delete target.authorityFracture;}else target.authorityFracture={owner:a.name,until:now+12000};}
  c.fx(id,target.x,target.z,3);
 }else if(id==='timedominion'||id==='spacefold'||id==='spacecollapse'){
  const x=id==='timedominion'?a.x:at.x,z=id==='timedominion'?a.z:at.z;
  s.domain={x,z,until:now+(id==='spacecollapse'?6000:B.domainDuration),next:now,id,power:n};
  if(id==='spacefold'){const gates=[{x:x-10,z},{x:x+10,z}];if(gates.every(v=>!blocked(v.x,v.z,1,c.map)))s.domain.gates=gates;}
  if(id==='timedominion'){const count=authorityProgress(p,'timelord').wraiths||5;while(s.wraiths.length<count)s.wraiths.push({x:a.x,z:a.z,hp:(a.maxHp||100)*.4,maxHp:(a.maxHp||100)*.4,next:now,incubating:false});for(const w of s.wraiths){w.incubating=false;w.hp=w.maxHp;w.x=a.x;w.z=a.z;}}
  c.fx(id,x,z,B.domainRadius);
 }else if(id==='timeflow'){
  const max=Math.max(a.hp,...s.history.filter(v=>now-v.at<=B.history).map(v=>v.hp)),already=a.hp>=max;
  a.hp=Math.min(a.maxHp||max,max);s.bonusUntil=now+B.reflowDuration;s.bonus=B.reflowBonus*(already?2:1);
  c.fx(id,a.x,a.z,7);
  if(Array.isArray(direction)&&direction.length===3&&direction.every(Number.isFinite)&&Math.abs(Math.hypot(...direction)-1)<.05&&(r.freeProjectiles?.length||0)<12){const vector=direction.map(v=>v/Math.hypot(...direction)),range=Math.min(100,50+(level-1)*2),flight=skillFlight('timelord','Z'),visualId=a.name+':'+now+':'+id;(r.freeProjectiles??=[]).push({visualId,id,job:p.profession||'',route:'',map:c.map,x:a.x,y:a.y,z:a.z,direction:vector,remaining:range,last:now,until:now+range/flight.speed*1000+500,cooldown:now+35000,flight});c.fx(id,a.x,a.z,1,{target:'',phase:'skill-flight',flight,projectile:visualId,direction:vector,source:{x:a.x,y:a.y,z:a.z}});}

 }else if(id==='timeresurrection'){
  s.raised=s.dead.filter(v=>now-v.at<=B.history).map(v=>({id:v.id,kind:v.kind,x:v.x,z:v.z,until:now+B.resurrectionDuration,next:now,power:n*B.resurrectionPower}));c.fx(id,a.x,a.z,12);
 }else if(id==='spaceswap'){
  const origin={x:a.x,y:a.y,z:a.z};let to=returning?s.anchor!:{...origin};
  if(!returning){for(let d=1;d<=50;d++){const x=origin.x+aim[0]*d,z=origin.z+aim[2]*d;if(blocked(x,z,.8,c.map)||c.canMove&&!c.canMove(to.x,to.z,x,z))break;to={x,y:ancientMapHeight(c.map,x,z)+1.7,z};}s.anchor={...origin,until:now+9000};}else delete s.anchor;
  a.x=to.x;a.y=to.y;a.z=to.z;
  for(const center of [origin,to]){for(const m of living(c))if(Math.hypot(m.x-center.x,m.z-center.z)<7)strike(a,c,m,n*3,id,now);c.fx(id,center.x,center.z,7);}
 }
 r.cooldowns[id]=now+SKILLS[id].cooldown*1000;return null;
}
export function tickAuthority(a:SkillActor,p:AncientProfile,c:SkillContext,dt:number,now:number){
 if(!isAuthorityJob(p.profession||'')||!p.authority?.[p.profession as 'timelord'|'spacelord']?.unlocked){delete runtime(a).authority;return;}
 const s=state(a,c.map);if(a.hp<=0){delete s.domain;s.raised=[];return;}
 if(now-s.lastHistory>=500){s.lastHistory=now;s.history.push({at:now,hp:a.hp});s.history=s.history.filter(v=>now-v.at<=B.history);}
 s.dead=s.dead.filter(v=>now-v.at<=B.history);s.raised=s.raised.filter(v=>v.until>now);
 for(const m of living(c)){const curse=m.authorityCurse;if(curse?.owner===a.name&&now>=curse.next){const ticks=Math.min(18,Math.max(0,Math.floor((Math.min(now,curse.until)-curse.next)/curse.interval)+1));if(ticks){curse.next+=ticks*curse.interval;strike(a,c,m,curse.power*ticks,curse.id,now);if(Math.random()<1-(1-B.curseChance)**ticks)deprivation(m,now);}if(now>=curse.until)delete m.authorityCurse;}}
 const d=s.domain;if(d&&d.until>now){
  if(d.gates&&now>=(d.portalAt||0)){const index=d.gates.findIndex(v=>Math.hypot(a.x-v.x,a.z-v.z)<1.6);if(index>=0){const to=d.gates[1-index];a.x=to.x;a.z=to.z;a.y=ancientMapHeight(c.map,to.x,to.z)+1.7;d.portalAt=now+2000;c.fx('spaceswap',to.x,to.z,4);}}
  const targets=living(c).filter(m=>Math.hypot(m.x-d.x,m.z-d.z)<=B.domainRadius);
  if(now>=d.next){d.next=now+1000;for(const m of targets){m.slow=.75;m.slowUntil=now+1200;if(d.id==='spacecollapse'&&!isAncientBoss(m.kind)){const dx=d.x-m.x,dz=d.z-m.z,len=Math.hypot(dx,dz)||1,x=m.x+dx/len*1.5,z=m.z+dz/len*1.5;if(!blocked(x,z,1,c.map)){m.x=x;m.z=z;}}strike(a,c,m,d.power*(d.id==='spacecollapse'?3:1.2),d.id,now);}if(d.id==='spacefold'&&targets.length>1)for(const m of targets)strike(a,c,m,d.power*.4,d.id,now);}
  if(d.id==='timedominion')for(const [i,w]of s.wraiths.entries()){if(w.incubating)continue;const m=targets[i%Math.max(1,targets.length)];if(!m)continue;const dx=m.x-w.x,dz=m.z-w.z,len=Math.hypot(dx,dz)||1,step=Math.min(len,dt*9);const nx=w.x+dx/len*step,nz=w.z+dz/len*step;if(!blocked(nx,nz,.5,c.map)){w.x=nx;w.z=nz;}if(len<4&&now>=w.next){w.next=now+B.wraithAttack;strike(a,c,m,d.power*B.wraithPower,d.id,now);}}
 }else if(d){if(d.id==='spacecollapse')for(const m of living(c))if(Math.hypot(m.x-d.x,m.z-d.z)<=B.domainRadius){strike(a,c,m,d.power*(m.authorityFracture?.owner===a.name?12:7),d.id,now);delete m.authorityFracture;}delete s.domain;}
 for(const pet of s.raised){const target=living(c).sort((m,n)=>Math.hypot(m.x-pet.x,m.z-pet.z)-Math.hypot(n.x-pet.x,n.z-pet.z))[0];if(!target)continue;const dx=target.x-pet.x,dz=target.z-pet.z,len=Math.hypot(dx,dz)||1,step=Math.min(len,dt*6),x=pet.x+dx/len*step,z=pet.z+dz/len*step;if(!blocked(x,z,.6,c.map)){pet.x=x;pet.z=z;}if(len<4&&now>=pet.next){pet.next=now+1500;strike(a,c,target,pet.power,'timeresurrection',now);if(Math.random()<.25)deprivation(target,now);else if(Math.random()<.25)curse(target,a,'timeresurrection',pet.power,1,now);}}
}
export function recordAuthorityKill(a:SkillActor,p:AncientProfile,m:SkillMonster&{level:number;temporary?:boolean;scripted?:boolean;respawnAt?:number},now:number){
 if(p.profession!=='timelord'||!p.authority?.timelord?.unlocked||m.temporary||m.scripted)return;
 const s=state(a,(a as SkillActor&{map?:string}).map||'tribe'),deathId=m.id+':'+(m.respawnAt||0);if(s.dead.some(v=>v.id===deathId))return;
 s.dead.push({id:deathId,kind:m.kind,at:now,x:m.x,z:m.z,maxHp:m.maxHp});
 const r=authorityProgress(p,'timelord');const difference=m.level-p.level;if(difference<-Math.max(8,p.level*.15))return;
 r.essence=(r.essence||0)+Math.max(1,4+Math.floor(difference/4));r.wraiths??=5;
 while(r.essence>=B.wraithEssence(r.wraiths)){r.essence-=B.wraithEssence(r.wraiths);r.wraiths++;}
}
