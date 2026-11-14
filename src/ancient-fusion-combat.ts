import {ARTIFACT_COMBAT,artifactStage} from './ancient-artifacts';
import {masteryLevel} from './ancient-mastery';
// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {ancientMapHeight,blocked,lineClear,type AncientProfile} from './ancient-rules';
import {ancientGearStats} from './ancient-gear';
import {runtime,SKILLS} from './ancient-skills';
import {selectSkillTarget,skillAreaTargets,type SkillContext,type SkillMonster} from './ancient-skill-combat';

type Point={x:number;y:number;z:number};
type Anchor=Point & {until:number};
export type FusionRuntime={
 map:string; marks:Record<string,{until:number;stacks:number}>; energy:number;
 anchor?:Anchor; rewind?:Anchor & {hp:number;cooldowns:Record<string,number>};
 zone?:{id:string;point:Point;until:number;next:number;body:number;radius:number};
 avatar?:number;
};
type Actor=Parameters<typeof runtime>[0];
function state(a:Actor,map:string){
 const r=runtime(a);
 if(r.fusion?.map!==map)r.fusion={map,marks:{},energy:0};
 return r.fusion;
}
function heal(a:Actor,amount:number){a.hp=Math.min(a.maxHp||100,a.hp+amount)}
function dot(m:SkillMonster,a:Actor,id:string,amount:number,now:number,seconds:number){
 m.dots=(m.dots||[]).filter(d=>d.until>now&&(d.owner!==a.name||d.skillId!==id)).slice(-7);
 m.dots.push({owner:a.name,skillId:id,damage:amount,next:now+1000,until:now+(seconds+1)*1000});
}
function move(a:Actor,c:SkillContext,x:number,z:number,through=false){
 const floor=ancientMapHeight(c.map,x,z,a.y-1.7);
 if(c.canMove&&!c.canMove(a.x,a.z,x,z)||blocked(x,z,.65,c.map,floor)||!through&&!lineClear(a.x,a.y,a.z,x,floor+1.7,z,c.map))return false;
 Object.assign(a,{x,y:floor+1.7,z});
 return true;
}
export function castFusion(a:Actor,p:AncientProfile,id:string,direction:unknown,c:SkillContext,now:number,body:number){
 const level=masteryLevel(p,id),evolved=level>=20;
 const artifact=artifactStage(p),hourglass=p.artifactEquipped==='hourglass'&&artifact>=3,divine=p.artifactEquipped==='divinity'&&artifact>=2&&SKILLS[id].key==='C';
 const abyssForm=id==='avatar'&&p.artifactEquipped==='abyss'&&artifact>=3;

 const healing=(amount:number,victims:SkillMonster[])=>{
  const before=a.hp;heal(a,amount);
  if(a.hp>before&&p.artifactEquipped==='abyss'&&artifactStage(p)>=2){
   runtime(a).effects.abyssHealing={until:now+ARTIFACT_COMBAT.abyssHealingDuration,level:1};
   a.hp-= (a.hp-before)*.15;
  }
  if(a.hp>before)for(const victim of victims)(victim.masteryMarks??={})[a.name+':'+id]={owner:a.name,id,until:now+8000};
 };
 const r=runtime(a),f=state(a,c.map),origin={x:a.x,y:a.y,z:a.z};
 const area=(point:Point|SkillMonster,radius:number)=>skillAreaTargets(point as SkillMonster,radius,c);
 const fx=(point:Point|SkillMonster,radius:number)=>c.fx(id,point.x,point.z,radius,{target:'',source:origin});
 const anchor=f.anchor;
 if((id==='riftassault'||id==='chronoshift')&&anchor&&anchor.until>now){
  if(id==='chronoshift'&&selectSkillTarget(a,direction,60,c)){for(const m of area(anchor,7))c.damage(m,body*2*(hourglass?ARTIFACT_COMBAT.chronoEchoMultiplier:1));fx(anchor,7);}
  else if(!move(a,c,anchor.x,anchor.z,true))return '返回位置被阻挡';
  delete f.anchor;return null;
 }
 if(id==='rewind'&&f.rewind&&f.rewind.until>now){
  const saved=f.rewind;if(!move(a,c,saved.x,saved.z,true))return '回溯位置被阻挡';
  const cooldown=r.cooldowns[id];r.cooldowns={...saved.cooldowns,[id]:cooldown};
  const restored=saved.hp>a.hp;
  a.hp=Math.min(a.maxHp||100,saved.hp);
  if(restored)for(const m of area(a,12)){
   if(m.hp>0&&m.contributionsForMastery?.[a.name])(m.masteryMarks??={})[a.name+':rewind']={owner:a.name,id,until:now+8000};
  }
  delete f.rewind;fx(a,5);return null;
 }
 if((r.cooldowns[id]||0)>now)return '技能冷却中';
 const target=selectSkillTarget(a,direction,60,c);
 const free=['rewind','stasis','voiddomain','descent','avatar','chronoshift'].includes(id);
 if(!free&&!target)return '请瞄准可见的敌人';
 if(id==='avatar'&&f.energy<30)return '需要30点深渊能量';
 if(id==='chronoshift'){
  const dir=Array.isArray(direction)?direction:[];
  if(dir.length!==3||!dir.every(Number.isFinite)||!move(a,c,a.x+dir[0]*12,a.z+dir[2]*12))return '跃迁位置被阻挡';
  f.anchor={...origin,until:now+6000+(hourglass?ARTIFACT_COMBAT.chronoAnchorExtension:0)};
  for(const m of area(a,8))if(m.contributionsForMastery?.[a.name])(m.masteryMarks??={})[a.name+':chronoshift']={owner:a.name,id,until:now+8000};
  fx(a,4);
 }
 if(id==='riftassault'&&target){
  const dx=target.x-a.x,dz=target.z-a.z,length=Math.hypot(dx,dz)||1;
  if(!move(a,c,target.x+dx/length*2,target.z+dz/length*2,f.zone?.id==='voiddomain'&&f.zone.until>now))return '突袭位置被阻挡';
  f.anchor={...origin,until:now+6000};
  for(const m of c.monsters){const t=Math.max(0,Math.min(1,((m.x-origin.x)*dx+(m.z-origin.z)*dz)/length**2));if(Math.hypot(m.x-origin.x-t*dx,m.z-origin.z-t*dz)<2)c.damage(m,body*2.8);}
  fx(a,4);
 }
 r.cooldowns[id]=now+SKILLS[id].cooldown*1000*(1-ancientGearStats(p).cooldown);
 if(id==='rewind'){f.rewind={...origin,hp:a.hp,cooldowns:{...r.cooldowns},until:now+8000+Math.min(4000,level*40)};fx(a,5);}
 if(['stasis','voiddomain','descent'].includes(id)){
  if(id==='voiddomain')r.effects.voiddomain={level:1,until:now+8000};
  if(id==='descent')a.hp=Math.max(1,a.hp-(a.maxHp||100)*.12);
  const radius=id==='stasis'?12+(evolved?2:0)+(divine?3:0):10;
  if(id==='stasis')for(const m of area(origin,radius))if(m.kind!=='player'){m.frozenUntil=Math.max(m.frozenUntil||0,now+4000);(m.masteryMarks??={})[a.name]={owner:a.name,id,until:now+6000};}
  f.zone={id,point:origin,until:now+(id==='stasis'?4000:8000),next:now,body,radius};
  fx(a,radius);
  if(divine)c.fx('artifact-divinity',a.x,a.z,radius);
 }
 if(id==='avatar'){f.energy-=30;f.avatar=now+(abyssForm?14000:10000);r.effects.avatar={level:abyssForm?2:1,until:f.avatar};fx(a,8);
  if(abyssForm)c.fx('artifact-abyss',a.x,a.z,6);
  if(divine){for(const m of area(origin,8))dot(m,a,'abysstouch',body*.32,now,6);c.fx('artifact-divinity',a.x,a.z,8);}}
 if(!target)return null;
 if((f.avatar||0)>now&&id!=='devour'){
  const stacks=Math.min(5,(f.marks[target.id]?.stacks||0)+1);
  f.marks[target.id]={stacks,until:now+7000};
  dot(target,a,'abysstouch',body*.20*stacks,now,6);
 }
 const mark=f.marks[target.id],stacks=mark&&mark.until>now?mark.stacks:0;
 if(id==='prism'||id==='judgment'){
  const victims=id==='judgment'?area(target,10):[target];let total=0;
  for(const m of victims){
   const amount=body*(id==='judgment'?3.4:2.8);
   total+=c.damage(m,amount);
   if(Math.random()<.35&&m.hp>0)dot(m,a,id,amount*.12,now,4);
   if(Math.random()<.35){m.slow=.3;m.slowUntil=now+3000;}
   if(Math.random()<.25){m.weak=.15;m.weakUntil=now+4000;}
   if(Math.random()<.18){m.slow=.95;m.slowUntil=now+700;}
   if(Math.random()<.30){const next=area(m,evolved?10:8).filter(v=>v.id!==m.id).slice(0,evolved?2:1);for(const linked of next){total+=c.damage(linked,amount*.75);c.fx(id,linked.x,linked.z,2,{target:linked.id,source:{x:m.x,y:(m.y||0)+1,z:m.z}});}}
  }
  healing(total*(id==='judgment'?.20:.15),victims);r.effects.prism={until:now+4000,level:id==='judgment'?35:20};fx(target,id==='judgment'?10:2);
 }
 if(id==='erosion'){(target.masteryMarks??={})[a.name]={owner:a.name,id,until:now+7000};Object.assign(target,{vulnerable:.2,vulnerableUntil:now+7000,weak:.15,weakUntil:now+7000,slow:.15,slowUntil:now+7000});dot(target,a,id,body*.1,now,7);fx(target,3);}
 if(id==='siphon'){
  dot(target,a,id,body*.2,now,6);
  if(divine){for(const m of area(target,7).filter(m=>m!==target).slice(0,3))dot(m,a,id,body*.1,now,6);c.fx('artifact-divinity',target.x,target.z,7);}
  fx(target,4);
 }
 if(id==='voidslash'||id==='temporalrift'){
  c.damage(target,body*(stacks?4.8:3));if(stacks)delete f.marks[target.id];else f.marks[target.id]={stacks:1,until:now+7000};
  if(id==='temporalrift')Object.assign(target,{slow:.45,slowUntil:now+4000,weak:.2,weakUntil:now+4000});
  if(id==='voidslash'&&stacks&&p.artifactEquipped==='void'&&artifact>=3){
   const rules=ARTIFACT_COMBAT;
   for(const m of area(target,rules.voidRiftRadius)){
    m.strikes??=[];
    for(let i=0;i<rules.voidRiftTicks&&m.strikes.length<64;i++)m.strikes.push({owner:a.name,skillId:'artifact:void',at:now+(i+1)*rules.voidRiftInterval,damage:body*rules.voidRiftDamage});
   }
   c.fx('artifact-void',target.x,target.z,rules.voidRiftRadius);
  }
  if(id==='voidslash'&&stacks&&evolved)for(const m of area(target,4))if(m!==target)c.damage(m,body*.85);
  if(id==='voidslash'&&stacks&&target.hp<=0)delete r.cooldowns.riftassault;
  fx(target,3);
 }
 if(id==='execution'){
  r.effects.execution={level:1,until:now+1100};
  target.strikes??=[];
  for(let i=0;i<(divine?8:5)&&target.strikes.length<64;i++)target.strikes.push({skillId:id,owner:a.name,at:now+i*180,damage:body*1.15});
  delete f.marks[target.id];
  for(const m of area(target,6))c.damage(m,body*(1.5+stacks));
  fx(target,6);
  if(divine)c.fx('artifact-divinity',target.x,target.z,9);
 }
 if(id==='abysstouch'){
  const next=Math.min(evolved?7:5,stacks+((f.avatar||0)>now?0:1));f.marks[target.id]={stacks:next,until:now+7000};
  f.energy=Math.min(100,f.energy+8);c.damage(target,body*2.4);dot(target,a,id,body*.16*next,now,6);fx(target,3);
 }
 if(id==='devour'){
  delete f.marks[target.id];target.dots=target.dots?.filter(d=>d.owner!==a.name||d.skillId!=='abysstouch');
  const damage=c.damage(target,body*(1.8+stacks*.6));healing(damage*.35,[target]);f.energy=Math.min(100,f.energy+stacks*8);
  if(target.hp<=0&&stacks)for(const m of area(target,7)){f.marks[m.id]={stacks:1,until:now+6000};dot(m,a,'abysstouch',body*.16,now,5);}
  fx(target,5);
 }
 return null;
}
export function tickFusion(a:Actor,c:SkillContext,now:number,dt:number){
 const r=runtime(a),f=r.fusion;if(!f||f.map!==c.map||a.hp<=0){delete r.fusion;return;}
 for(const [id,mark] of Object.entries(f.marks))if(mark.until<=now)delete f.marks[id];
 if((f.avatar||0)>now)a.hp=Math.max(1,a.hp-(a.maxHp||100)*.012*dt);
 const zone=f.zone;if(!zone)return;
 if(zone.until<=now){delete f.zone;return;}
 if(zone.next>now)return;zone.next=now+1000;
 for(const m of skillAreaTargets(zone.point as SkillMonster,zone.radius,c)){
  if(zone.id==='stasis'&&!m.frozenUntil&&m.kind!=='player'){m.frozenUntil=zone.until;}
  m.slow=zone.id==='stasis'?.85:.35;m.slowUntil=now+1100;
  if(zone.id==='descent'){
   m.weak=Math.min(.5,.12+.05*Math.floor((8000-zone.until+now)/1000));m.weakUntil=now+1100;
   const actual=c.damage(m,zone.body*(1.5-a.hp/(a.maxHp||100)),undefined,'descent');heal(a,actual*.3);
   if(m.hp<=0)f.energy=Math.min(100,f.energy+10);
  }
 }
}
