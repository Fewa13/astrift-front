import {SKILL_CONTACT} from './ancient-skill-flight';
import {ancientHitbox} from './ancient-hitboxes';
import {passiveLevel} from './ancient-fusion-passives';
import {isAncientBoss} from './ancient-boss';
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
 resonance?:number; resonanceAt?:number;
 elementalSigns?:Record<string,{fire?:number;ice?:number;reacted?:number}>;
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
function gatherResonance(f:FusionRuntime,level:number,now:number){
 if(!level)return 0;
 const since=f.resonanceAt??now;
 const stored=Math.min(4+level*.8,(f.resonance||0)+Math.max(0,now-since)/2000);
 f.resonanceAt=now;
 f.resonance=stored;
 return stored;
}
function restoreTimeAnchor(a:Actor,p:AncientProfile,c:SkillContext,now:number){
 const r=runtime(a),f=state(a,c.map),saved=f.rewind;
 if(!saved||!move(a,c,saved.x,saved.z,true))return false;
 c.motion?.({x:a.x,y:a.y,z:a.z},25);
 const cooldown=r.cooldowns.rewind;
 if(passiveLevel(p,0)){
  for(const skill of Object.keys(r.cooldowns))if(skill!=='rewind'&&SKILLS[skill]?.job===p.profession)delete r.cooldowns[skill];
 }else{
  for(const skill of Object.keys(SKILLS).filter(id=>SKILLS[id].job===p.profession&&id!=='rewind')){
   if(saved.cooldowns[skill])r.cooldowns[skill]=Math.min(r.cooldowns[skill]||0,saved.cooldowns[skill]);
   else delete r.cooldowns[skill];
  }
 }
 r.cooldowns.rewind=cooldown;
 const before=a.hp;
 a.hp=Math.min(a.maxHp||100,Math.max(a.hp,saved.hp));
 if(a.hp>before)for(const m of skillAreaTargets(a as unknown as SkillMonster,12,c)){
  if(m.contributionsForMastery?.[a.name])(m.masteryMarks??={})[a.name+':rewind']={owner:a.name,id:'rewind',until:now+8000};
 }
 delete f.rewind;
 c.fx('rewind',a.x,a.z,5,{target:''});
 return true;
}
function fusionTarget(a:Actor,direction:unknown,c:SkillContext){
 const selected=selectSkillTarget(a,direction,60,c);
 if(selected||!['voidsword','chrono'].includes(a.profession||''))return selected;
 return skillAreaTargets(a as unknown as SkillMonster,12,c)
  .filter(m=>lineClear(a.x,a.y,a.z,m.x,(m.y||0)+1.4,m.z,c.map))
  .sort((left,right)=>Math.hypot(left.x-a.x,left.z-a.z)-Math.hypot(right.x-a.x,right.z-a.z))[0];
}
function shiftToward(a:Actor,c:SkillContext,x:number,z:number){
 const origin={x:a.x,z:a.z},distance=Math.hypot(x-a.x,z-a.z);
 for(let step=distance;step>=.5;step-=.5)if(move(a,c,origin.x+(x-origin.x)*step/distance,origin.z+(z-origin.z)*step/distance))return true;
 return false;
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
 if(id==='rewind'&&f.rewind&&f.rewind.until>now){
  return restoreTimeAnchor(a,p,c,now)?null:'回溯位置被阻挡';
 }
 if((r.cooldowns[id]||0)>now)return '技能冷却中';
 const target=fusionTarget(a,direction,c);
 const free=['rewind','stasis','voiddomain','descent','avatar','chronoshift','riftassault'].includes(id);
 if(!free&&!target)return '请瞄准可见的敌人';
 if(id==='avatar'&&f.energy<30)return '需要30点深渊能量';
 if(id==='chronoshift'){
  const dir=Array.isArray(direction)?direction:[];
  if(dir.length!==3||!dir.every(Number.isFinite)||!shiftToward(a,c,a.x+dir[0]*12,a.z+dir[2]*12))return '跃迁位置被阻挡';
  delete f.anchor;
  for(const m of area(origin,7))c.damage(m,body*3.4*(hourglass?ARTIFACT_COMBAT.chronoEchoMultiplier:1));
  fx(origin,7);
  for(const m of area(a,8))c.damage(m,body*2.6);
  fx(a,4);
 }
 if(id==='riftassault'&&!target){
  const dir=Array.isArray(direction)?direction:[];
  if(dir.length!==3||!dir.every(Number.isFinite)||!shiftToward(a,c,a.x+dir[0]*12,a.z+dir[2]*12))return '突袭位置被阻挡';
  fx(a,4);
 }
 if(id==='riftassault'&&target){
  const dx=target.x-a.x,dz=target.z-a.z,length=Math.hypot(dx,dz)||1;
  const behind=move(a,c,target.x+dx/length*2,target.z+dz/length*2,f.zone?.id==='voiddomain'&&f.zone.until>now);
  if(!behind&&!shiftToward(a,c,target.x-dx/length*2,target.z-dz/length*2))return '突袭位置被阻挡';
  delete f.anchor;
  f.marks[target.id]={stacks:1,until:now+10000};
  for(const m of c.monsters){const t=Math.max(0,Math.min(1,((m.x-origin.x)*dx+(m.z-origin.z)*dz)/length**2));if(Math.hypot(m.x-origin.x-t*dx,m.z-origin.z-t*dz)<3+ancientHitbox(m.kind).radius+SKILL_CONTACT.lanePadding)c.damage(m,body*5.5);}
  fx(a,4);
 }
 r.cooldowns[id]=now+SKILLS[id].cooldown*1000*(1-ancientGearStats(p).cooldown);
 if(id==='rewind'){a.hp=Math.min(a.maxHp||100,a.hp+(a.maxHp||100)*.20);for(const m of area(a,8))c.damage(m,body*2.8);f.rewind={...origin,hp:a.hp,cooldowns:{...r.cooldowns},until:now+8000+Math.min(4000,level*40)};fx(a,5);}
 if(['stasis','voiddomain','descent'].includes(id)){
  if(id==='voiddomain')r.effects.voiddomain={level:1,until:now+8000};
  if(id==='descent')a.hp=Math.max(1,a.hp-(a.maxHp||100)*.12);
  const radius=id==='stasis'?14+(evolved?2:0)+(divine?3:0):id==='voiddomain'?12:10;
  if(id==='stasis')for(const m of area(origin,radius))if(m.kind!=='player'&&!isAncientBoss(m.kind)){m.frozenUntil=Math.max(m.frozenUntil||0,now+4000);(m.masteryMarks??={})[a.name]={owner:a.name,id,until:now+6000};}
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
  const victims=id==='judgment'?area(target,12):[target];let total=0;
  const direct=new Set(victims.map(m=>m.id)),echoed=new Set<string>();
  const resonanceLevel=passiveLevel(p,0),clashLevel=passiveLevel(p,1);
  const resonance=id==='judgment'&&resonanceLevel?gatherResonance(f,resonanceLevel,now):0;
  const charged=id==='judgment'&&resonanceLevel>0;
  if(charged){
   f.resonance=0;
   f.resonanceAt=now;
  }
  const debuff=(m:SkillMonster,amount:number)=>{
   if(m.hp<=0)return;
   const force=Math.min(1,resonance/12),duration=3000+Math.round(force*4000);
   const fire=charged?resonance>=3:Math.random()<.35;
   const ice=charged||Math.random()<.35;
   const weak=charged?resonance>=1.5:Math.random()<.25;
   if(fire)dot(m,a,id,amount*(.12+force*.12),now,4);
   if(ice){m.slow=.3+force*.35;m.slowUntil=now+duration;}
   if(weak){m.weak=.15+force*.2;m.weakUntil=now+duration;}
   if(charged&&resonance>=5){m.vulnerable=.16+force*.24;m.vulnerableUntil=now+duration;}
   if(!charged&&Math.random()<.18){m.slow=.95;m.slowUntil=now+700;}
   if(!clashLevel)return;
   const signs=(f.elementalSigns??={})[m.id]??={};
   if(fire)signs.fire=now+4000;
   if(ice)signs.ice=now+duration;
   const burning=(signs.fire||0)>now||m.dots?.some(d=>d.until>now&&['firebolt','firewave','firestorm','inferno'].includes(d.skillId||''));
   if(burning&&((signs.ice||0)>now||(m.frozenUntil||0)>now)&&(signs.reacted||0)<=now){
    signs.reacted=now+2500;
    delete signs.fire;delete signs.ice;
    for(const enemy of area(m,5))total+=c.damage(enemy,body*(14+clashLevel*.36),undefined,id);
    c.fx('thermal-clash',m.x,m.z,5,{target:''});
   }
  };
  for(const m of victims){
   const amount=body*(id==='judgment'?5.1:4.2);
   total+=c.damage(m,amount);
   debuff(m,amount);
   const next=area(m,evolved?12:10).filter(v=>!direct.has(v.id)&&!echoed.has(v.id)).slice(0,evolved?2:1);
   for(const linked of next){
    echoed.add(linked.id);total+=c.damage(linked,amount*.75);
    if(charged)debuff(linked,amount*.75);
    c.fx(id,linked.x,linked.z,2,{target:linked.id,source:{x:m.x,y:(m.y||0)+1,z:m.z}});
   }
  }
  healing(total*(id==='judgment'?.10:.075),victims);r.effects.prism={until:now+4000,level:id==='judgment'?35:20};fx(target,id==='judgment'?12:2);
 }
 if(id==='erosion'){c.damage(target,body*2.4);(target.masteryMarks??={})[a.name]={owner:a.name,id,until:now+7000};Object.assign(target,{vulnerable:.2,vulnerableUntil:now+7000,weak:.15,weakUntil:now+7000,slow:.15,slowUntil:now+7000});dot(target,a,id,body*.28,now,7);fx(target,3);}
 if(id==='siphon'){
  const primaryDamage=body*1.1;
  dot(target,a,id,primaryDamage,now,6);
  const nearby=area(origin,60).filter(m=>m!==target&&m.kind!=='player')
   .sort((left,right)=>Math.hypot(left.x-a.x,left.z-a.z)-Math.hypot(right.x-a.x,right.z-a.z))
   .slice(0,2);
  for(const m of nearby){dot(m,a,id,primaryDamage*.25,now,6);fx(m,2);}
  if(divine){
   for(const m of area(target,7).filter(m=>m!==target&&!nearby.includes(m)).slice(0,3))dot(m,a,id,body*.2,now,6);
   c.fx('artifact-divinity',target.x,target.z,7);
  }
  fx(target,4);
 }
 if(id==='voidslash'||id==='temporalrift'){
  const edge=id==='voidslash'?passiveLevel(p,0):0;
  const detonated=!!stacks||edge>0&&Math.random()<Math.min(.75,.2+edge*.008);
  const slashDamage=body*(id==='voidslash'?(detonated?10:6):(detonated?8:4.8));
  c.damage(target,slashDamage);
  for(const nearby of area(target,id==='voidslash'?4:6))if(nearby!==target)c.damage(nearby,slashDamage*.65);if(detonated)delete f.marks[target.id];else f.marks[target.id]={stacks:1,until:now+7000};
  if(id==='temporalrift')Object.assign(target,{slow:.45,slowUntil:now+4000,weak:.2,weakUntil:now+4000});
  if(id==='voidslash'&&detonated&&p.artifactEquipped==='void'&&artifact>=3){
   const rules=ARTIFACT_COMBAT;
   for(const m of area(target,rules.voidRiftRadius)){
    m.strikes??=[];
    for(let i=0;i<rules.voidRiftTicks&&m.strikes.length<64;i++)m.strikes.push({owner:a.name,skillId:'artifact:void',at:now+(i+1)*rules.voidRiftInterval,damage:body*rules.voidRiftDamage});
   }
   c.fx('artifact-void',target.x,target.z,rules.voidRiftRadius);
  }
  if(id==='voidslash'&&detonated&&evolved)for(const m of area(target,4))if(m!==target)c.damage(m,body*.85);
  if(id==='voidslash'&&detonated&&target.hp<=0)delete r.cooldowns.riftassault;
  fx(target,3);
 }
 if(id==='execution'){
  r.effects.execution={level:1,until:now+1100};
  target.strikes??=[];
  for(let i=0;i<(divine?8:5)&&target.strikes.length<64;i++)target.strikes.push({skillId:id,owner:a.name,at:now+i*180,damage:body*2.2});
  delete f.marks[target.id];
  for(const m of area(target,8))c.damage(m,body*(4+stacks*2));
  fx(target,6);
  if(divine)c.fx('artifact-divinity',target.x,target.z,9);
 }
 if(id==='abysstouch'){
  const next=Math.min(evolved?7:5,stacks+((f.avatar||0)>now?0:1));f.marks[target.id]={stacks:next,until:now+7000};
  f.energy=Math.min(100,f.energy+8);c.damage(target,body*3.6);dot(target,a,id,body*.26*next,now,6);fx(target,3);
 }
 if(id==='devour'){
  delete f.marks[target.id];target.dots=target.dots?.filter(d=>d.owner!==a.name||d.skillId!=='abysstouch');
  const damage=c.damage(target,body*(3+stacks*.9));healing(damage*.35,[target]);f.energy=Math.min(100,f.energy+stacks*8);
  if(target.hp<=0&&stacks)for(const m of area(target,7)){f.marks[m.id]={stacks:1,until:now+6000};dot(m,a,'abysstouch',body*.26,now,5);}
  fx(target,5);
 }
 if(p.profession==='elementalist'){gatherResonance(f,passiveLevel(p,0),now);f.resonanceAt=now+1500;}
 return null;
}
export function tickFusion(a:Actor,p:AncientProfile,c:SkillContext,now:number,dt:number){
 const r=runtime(a);
 if(p.profession==='elementalist'&&a.hp>0&&passiveLevel(p,0)){
  const charge=state(a,c.map);
  if((charge.resonanceAt||0)<=now)gatherResonance(charge,passiveLevel(p,0),now);
 }
 const f=r.fusion;if(!f||f.map!==c.map||a.hp<=0){delete r.fusion;return;}
 if(f.elementalSigns)for(const [id,sign] of Object.entries(f.elementalSigns))
  if(Math.max(sign.fire||0,sign.ice||0,sign.reacted||0)<=now)delete f.elementalSigns[id];
 for(const [id,mark] of Object.entries(f.marks))if(mark.until<=now)delete f.marks[id];
 if(f.rewind&&(now>=f.rewind.until||a.hp<=(a.maxHp||100)*.35)){
  if(!restoreTimeAnchor(a,p,c,now)&&now>f.rewind.until+2000)delete f.rewind;
 }
 if((f.avatar||0)>now)a.hp=Math.max(1,a.hp-(a.maxHp||100)*.012*dt);
 const zone=f.zone;if(!zone)return;
 if(zone.until<=now){delete f.zone;return;}
 if(zone.id==='voiddomain')zone.point={x:a.x,y:a.y,z:a.z};
 if(zone.next>now)return;zone.next=now+1000;
 for(const m of skillAreaTargets(zone.point as SkillMonster,zone.radius,c)){
  if(zone.id==='stasis'){
   if(!m.frozenUntil&&m.kind!=='player'&&!isAncientBoss(m.kind))m.frozenUntil=zone.until;
   c.damage(m,zone.body*2.1,undefined,'stasis');
  }
  if(zone.id==='voiddomain')c.damage(m,zone.body*1.25,undefined,'voiddomain');
  m.slow=zone.id==='stasis'?.85:.35;m.slowUntil=now+1100;
  if(zone.id==='descent'){
   m.weak=Math.min(.5,.12+.05*Math.floor((8000-zone.until+now)/1000));m.weakUntil=now+1100;
   const actual=c.damage(m,zone.body*(1.95-a.hp/(a.maxHp||100)),undefined,'descent');heal(a,actual*.3);
   if(m.hp<=0)f.energy=Math.min(100,f.energy+10);
  }
 }
}
