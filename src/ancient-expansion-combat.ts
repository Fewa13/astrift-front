// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {branchRadius} from './ancient-branches';
import {isHoly} from './ancient-ascension';
import {ancientGearStats} from './ancient-gear';
import {ancientMapHeight,blocked,lineClear,type AncientProfile} from './ancient-rules';
import {runtime,skillRadius,skillCooldown,activeSkill,type SkillActor} from './ancient-skills';
import {skillAreaHits,skillAreaTargets,type SkillContext,type SkillMonster} from './ancient-skill-combat';
export const EXPANSION_SKILLS=['riftblade','shadowstep','shadowreturn','nightfall','stonefist','faultline','stoneprison','mountainfall'];
export function shadowRecallReady(a:SkillActor,now:number){return (runtime(a).shadowAnchor?.until||0)>now;}
function moveAlong(a:SkillActor,dx:number,dz:number,distance:number,c:SkillContext){
 const length=Math.hypot(dx,dz),points=[{x:a.x,y:a.y,z:a.z}];if(length<.001)return points;
 const start={x:a.x,z:a.z};
 for(let travelled=.25;travelled<=distance+.001;travelled+=.25){
  const x=start.x+dx/length*travelled,z=start.z+dz/length*travelled,floor=ancientMapHeight(c.map,x,z,a.y-1.7),y=floor+1.7;
  if(!Number.isFinite(floor)||blocked(x,z,.6,c.map,floor)||Math.abs(y-a.y)>1.2||c.canMove&&!c.canMove(a.x,a.z,x,z))break;
  a.x=x;a.z=z;a.y=y;points.push({x,y,z});
 }
 return points;
}
export function castExpansionSkill(a:SkillActor,p:AncientProfile,id:string,direction:unknown,c:SkillContext,now:number,body:number,target?:SkillMonster,autoRecall=false){
 const n=p.skills?.[id]||0,r=runtime(a),holy=isHoly(p),radius=skillRadius(id,n,holy)*branchRadius(p,id),source={x:a.x,y:a.y-.25,z:a.z};
 const visible=(m:SkillMonster,x=a.x,z=a.z,y=a.y)=>m.hp>0&&lineClear(x,y,z,m.x,ancientMapHeight(c.map,m.x,m.z,m.y)+1,m.z,c.map);
 const area=(x:number,z:number,amount:number)=>{for(const m of c.monsters)if(skillAreaHits({x,z},m,radius,c.map))c.damage(m,body*amount);};
 const fx=(x:number,z:number,follow=false)=>c.fx(id,x,z,radius,{target:follow?target?.id||'':'',source,phase:id==='shadowreturn'?(recall?'return':'anchor'):undefined});
 const recall=id==='shadowreturn'&&(autoRecall||shadowRecallReady(a,now));
 if(recall&&r.shadowAnchor?.map!==c.map)return '残影已消失';
 if(id==='shadowstep'||id==='shadowreturn'&&!recall){
  if(!Array.isArray(direction)||direction.length!==3||!direction.every(Number.isFinite)||Math.abs(Math.hypot(...direction)-1)>.05||Math.hypot(direction[0],direction[2])<.001)return '请朝前方使用技能';
 }
 if(['riftblade','stonefist','faultline','stoneprison','mountainfall'].includes(id)&&!target)return '请瞄准可见的敌人';
 if(!recall)r.cooldowns[id]=now+skillCooldown(id,n)*1000*(1-ancientGearStats(p).cooldown);
 if(id==='shadowstep'){
  const dir=direction as number[],points=moveAlong(a,dir[0],dir[2],10,c),hit=new Set<string>();
  for(const point of points)for(const m of c.monsters)if(!hit.has(m.id)&&Math.hypot(m.x-point.x,m.z-point.z)<=radius&&visible(m,point.x,point.z,point.y)){hit.add(m.id);c.damage(m,body*(2.6+.22*n));}
  if(activeSkill(a,'nightfall',now))r.cooldowns[id]=now+3000*(1-ancientGearStats(p).cooldown);
  fx(a.x,a.z);return null;
 }
 if(id==='shadowreturn'){
  const start={x:a.x,y:a.y,z:a.z};
  if(recall){const anchor=r.shadowAnchor!;moveAlong(a,anchor.x-a.x,anchor.z-a.z,Math.min(20,Math.hypot(anchor.x-a.x,anchor.z-a.z)),c);delete r.shadowAnchor;delete r.effects.shadowreturn;}
  else {r.shadowAnchor={map:c.map,x:a.x,y:a.y,z:a.z,until:now+6000};r.effects.shadowreturn={until:now+6000,level:n};const dir=direction as number[];moveAlong(a,-dir[0],-dir[2],9,c);}
  area(a.x,a.z,(2.2+.2*n)*(recall?1.1:1));fx(a.x,a.z);
  const end={x:a.x,y:a.y,z:a.z};if(c.motion&&Math.hypot(end.x-start.x,end.z-start.z)>.01){Object.assign(a,start);c.motion(end,recall?2:1);}return null;
 }
 if(id==='nightfall'){r.effects.nightfall={until:now+8000,level:n};area(a.x,a.z,4+.35*n);fx(a.x,a.z);return null;}
 if(!target)return null;
 const victims=skillAreaTargets(target,radius,c);
 const hits=id==='riftblade'?[{delay:0,multiplier:(3+.25*n)*.5},{delay:120,multiplier:(3+.25*n)*.5}]
  :id==='stonefist'?[{delay:180,multiplier:3.2+.3*n}]
  :id==='faultline'?[0,350,700].map(delay=>({delay,multiplier:1.8+.15*n}))
  :id==='stoneprison'?[{delay:0,multiplier:3+.3*n},{delay:3000,multiplier:2+.2*n}]
  :[{delay:650,multiplier:7+.6*n},...[1000,1500,2000].map(delay=>({delay,multiplier:.8+.06*n}))];
 if((target.strikes?.length||0)+hits.length>64){delete r.cooldowns[id];return '目标正在承受过多技能';}
 for(const m of victims){
  m.strikes??=[];if(m.strikes.length+hits.length>64)continue;
  for(const hit of hits)if(hit.delay===0)c.damage(m,body*hit.multiplier);else m.strikes.push({skillId:id,owner:a.name,at:now+hit.delay,damage:body*hit.multiplier});
  if(id==='stoneprison'){const boss=m.kind==='chief'||m.kind==='lord'||m.kind==='rootwarden'||m.kind.startsWith('crystal_')||['oathknight','emptyking','blight_lord','immaculate_judge'].includes(m.kind),amount=boss?.3:.6;if(!m.slowUntil||m.slowUntil<=now||amount>=(m.slow||0)){m.slow=amount;m.slowUntil=now+3000;}}
 }
 fx(target.x,target.z,true);return null;
}
