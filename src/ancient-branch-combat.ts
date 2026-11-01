// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {activeBranch} from './ancient-branches';
import {runtime,type SkillActor} from './ancient-skills';
import {lineClear,ancientMapHeight,type AncientProfile} from './ancient-rules';
import {isAncientBoss} from './ancient-boss';
import {ancientSkillDamage} from './ancient-gear';
import {holyPower} from './ancient-ascension';
import {skillDamageMultiplier} from './ancient-skills';
import type {SkillContext,SkillMonster} from './ancient-skill-combat';
type Pulse={at:number;target:string;damage:number;fx:string;source?:'summon'};
export type BranchRuntime={key:string;pulses:Pulse[];marks:Record<string,{hits:number;until:number;readyAt:number}>};
function state(a:SkillActor,p:AncientProfile){const key=activeBranch(p),r=runtime(a);if(!r.branch||r.branch.key!==key)r.branch={key,pulses:[],marks:{}};return r.branch;}
function queue(s:BranchRuntime,at:number,target:string,damage:number,fx:string){if(s.pulses.length<12)s.pulses.push({at,target,damage,fx});}
function near(c:SkillContext,m:SkillMonster,radius:number){return c.monsters.filter(v=>v.hp>0&&v.id!==m.id&&Math.hypot(v.x-m.x,v.z-m.z)<=radius&&lineClear(m.x,ancientMapHeight(c.map,m.x,m.z,m.y)+1,m.z,v.x,ancientMapHeight(c.map,v.x,v.z,v.y)+1,v.z,c.map)).sort((x,y)=>Math.hypot(x.x-m.x,x.z-m.z)-Math.hypot(y.x-m.x,y.z-m.z)).slice(0,4);}
// Each wrapper owns its first-hit budget. Secondary damage bypasses this wrapper,
// so echoes never recursively proc themselves or another echo chain.
export function branchContext(a:SkillActor,p:AncientProfile,id:string,c:SkillContext,now:number):SkillContext{
 const key=activeBranch(p);if(!key)return c;const s=state(a,p);let first=true;
 return {...c,damage(m,n,source){const primary=first;first=false;
  const factor=key==='bloodrage'?1.15:['earthshaker','calamity'].includes(key)?.9:key==='iceedge'&&['icebolt','frostburst'].includes(id)?1.25:key==='heavenwrath'&&id==='storm'?1.25:key==='thunderfield'&&['chain','storm'].includes(id)?.9:key==='heavenblade'&&id==='phantomblade'?1.15:key==='rockbreaker'&&['stonefist','mountainfall'].includes(id)?1.2:1;
  const actual=c.damage(m,n*factor,source);if(actual<=0)return actual;
  if(key==='bloodrage')a.hp=Math.min(a.maxHp||100,a.hp+Math.min(actual*.04,(a.maxHp||100)*.03));
  if(primary&&((key==='earthshaker')||(key==='calamity')||(key==='earthwarden')||(key==='nightreaper'))){for(const v of near(c,m,key==='earthshaker'?5:6))c.damage(v,n*(key==='calamity'||key==='earthwarden'?.3:.35));c.fx(key==='calamity'?'doom':key==='nightreaper'?'riftblade':'faultline',m.x,m.z,5,{target:m.id});}
  if(primary&&key==='iceedge'){const dx=m.x-a.x,dz=m.z-a.z,length=Math.hypot(dx,dz)||1;let count=0;for(const v of near(c,m,10)){const vx=v.x-m.x,vz=v.z-m.z;if((vx*dx+vz*dz)/length>0&&Math.abs(vx*dz-vz*dx)/length<2&&count++<2){c.damage(v,n*.4);c.fx('icebolt',v.x,v.z,1,{target:v.id});}}}
  if(primary&&key==='heavenwrath'&&id==='chain'){queue(s,now+250,m.id,n*.35,'haste');queue(s,now+550,m.id,n*.35,'haste');}
  if(primary&&key==='pursuer')queue(s,now+350,m.id,n*.25,'riftblade');
  if(primary&&key==='rockbreaker'){queue(s,now+400,m.id,n*.25,'stonefist');}
  if(primary&&key==='thunderfield'&&id==='haste'){for(const v of near(c,m,8).slice(0,3)){queue(s,now+250,v.id,n*.25,'chain');}}
  if(key==='frostprison'||key==='souleater'){
   if(!s.marks[m.id]){if(Object.keys(s.marks).length>=32)delete s.marks[Object.keys(s.marks)[0]];s.marks[m.id]={hits:0,until:now+12000,readyAt:0};}
   const mark=s.marks[m.id];if(now>=mark.readyAt){if(mark.until<now)mark.hits=0;mark.hits++;mark.until=now+12000;
    if(key==='frostprison'&&mark.hits===3){m.slow=isAncientBoss(m.kind)?.3:1;m.slowUntil=now+900;c.fx('icearmor',m.x,m.z,2,{target:m.id});}
    if(mark.hits>=(key==='frostprison'?4:3)){mark.hits=0;mark.readyAt=now+(key==='frostprison'?6000:5000);if(m.hp>0)c.damage(m,n*.6);if(key==='frostprison')for(const v of near(c,m,4))c.damage(v,n*.6);c.fx(key==='frostprison'?'frostburst':'hex',m.x,m.z,4,{target:m.id});}
   }
  }
  return actual;
 }};
}
export function queueBranchFinisher(a:SkillActor,p:AncientProfile,id:string,target:SkillMonster|undefined,now:number,petDamage=0){
 if(!target)return;const key=activeBranch(p),s=state(a,p);
 const body=ancientSkillDamage(p)*skillDamageMultiplier(a,now)*holyPower(p),n=p.skills?.[id]||1;
 // Once per successful cast, not per victim, sword-rain tick or triple-slash hit.
 if(key==='swiftshade'){const hit=body*(id==='phantomblade'?(6.5+.6*n)*1.3:id==='swordrain'?1.4+.16*n:id==='triplecut'?3.3+.3*n:3+.25*n);queue(s,now+850,target.id,hit*.2,'triplecut');queue(s,now+1100,target.id,hit*.2,'triplecut');}
 if(key==='heavenblade'){const hit=body*(id==='phantomblade'?(6.5+.6*n)*1.3:id==='swordrain'?1.4+.16*n:id==='triplecut'?3.3+.3*n:3+.25*n);queue(s,now+(id==='swordrain'?3250:900),target.id,hit*.35,'phantomblade');}
 if(key==='heavenwrath'&&['haste','storm'].includes(id)){const hit=body*(id==='storm'?1.6+.15*n:3+.3*n);queue(s,now+250,target.id,hit*.35,'haste');queue(s,now+550,target.id,hit*.35,'haste');}
 if(key==='beastlord'&&id!=='petEcho'){const pet=runtime(a).summon;if(pet){pet.target=target.id;pet.attackAt=Math.min(pet.attackAt,now);}queue(s,now+350,target.id,body*.75,'petHit');}
 if(key==='spiritpack'&&id!=='petEcho'){queue(s,now+200,target.id,body*.4,'petHit');queue(s,now+450,target.id,body*.4,'petHit');}
 if(key==='spiritpack'&&id==='petEcho'){for(const delay of [180,380])if(s.pulses.length<12)s.pulses.push({at:now+delay,target:target.id,damage:petDamage*.25,fx:'petHit',source:'summon'});}
}
export function tickBranch(a:SkillActor,p:AncientProfile,c:SkillContext,now:number){const s=runtime(a).branch;if(!s)return;if(a.hp<=0||s.key!==activeBranch(p)){delete runtime(a).branch;return;}const due=s.pulses.filter(v=>v.at<=now);s.pulses=s.pulses.filter(v=>v.at>now);for(const [id,m]of Object.entries(s.marks))if(m.until<=now||!c.monsters.some(v=>v.id===id&&v.hp>0))delete s.marks[id];for(const hit of due){const m=c.monsters.find(v=>v.id===hit.target&&v.hp>0);if(!m)continue;c.damage(m,hit.damage,hit.source);c.fx(hit.fx,m.x,m.z,2,{target:m.id});}}
