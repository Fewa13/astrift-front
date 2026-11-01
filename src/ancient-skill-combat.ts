// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {activeBranch,branchRadius,branchCooldown} from './ancient-branches';
import {branchContext,tickBranch,queueBranchFinisher} from './ancient-branch-combat';
import {EXPANSION_SKILLS,castExpansionSkill,shadowRecallReady} from './ancient-expansion-combat';
import {activeRelic} from './ancient-hunts';
import {queueRelic,relicCastContext,tickRelic} from './ancient-relic-combat';
import {activeBossForm} from './ancient-boss-cards';
import {rayAncientHitbox,ancientHitbox} from './ancient-hitboxes';
import {bossBodyPathBlocked} from './ancient-boss-collision';
import {isHoly,holyPower} from './ancient-ascension';
import {ancientSkillDamage,ancientProfileHealth,ancientGearStats,equippedGear,GROWTH_COMBOS} from './ancient-gear';
import {SKILLS,skillRadius,runtime,activeSkill,skillCooldown,skillDamageMultiplier,skillHealth,type SkillActor} from './ancient-skills';
import {ancientMaxHealth,weaponDamage,blocked,lineClear,ancientMapHeight,type AncientProfile} from './ancient-rules';
import {ANCIENT_KINDS as FOREST_KINDS} from './ancient-rules';
import {forestPath} from './ancient-forest';
import {skyreachPath} from './ancient-skyreach';
import {frostcourtPath} from './ancient-frostcourt';
import {starfallPath} from './ancient-starfall';
import {sanctumPath} from './ancient-sanctum';
import {blightPath} from './ancient-blight';
import {cityPath} from './ancient-city';
export type SkillMonster={buffUntil?:number;buffPower?:number;id:string;kind:string;hp:number;maxHp:number;x:number;y?:number;z:number;slow?:number;slowUntil?:number;weak?:number;weakUntil?:number;vulnerable?:number;vulnerableUntil?:number;strikes?:{skillId?:string;owner:string;at:number;damage:number}[];dots?:{skillId?:string;owner:string;until:number;next:number;damage:number}[]};
export type SkillFXDetails={target:string;phase?:string;source?:{x:number;y:number;z:number};links?:{x:number;y:number;z:number;target:string;height:number}[]};
export function clearPendingSkillDamage(owner:string,targets:Iterable<Partial<Pick<SkillMonster,'strikes'|'dots'>>>){for(const m of targets){m.strikes=(m.strikes||[]).filter(v=>v.owner!==owner);m.dots=(m.dots||[]).filter(v=>v.owner!==owner);}}
export type SkillContext={canMove?:(x:number,z:number,nx:number,nz:number)=>boolean;map:string;monsters:SkillMonster[];damage:(m:SkillMonster,n:number,source?:'summon')=>number;fx:(id:string,x:number,z:number,radius:number,details?:SkillFXDetails)=>void};
// The primary target already passed the caster's visibility test. Do not raycast
// from inside its feet again: an altar/tree can falsely occlude a zero-length ray.
export function skillAreaTargets(target:SkillMonster,radius:number,c:SkillContext){return c.monsters.filter(m=>m.hp>0&&(m.id===target.id||Math.hypot(m.x-target.x,m.z-target.z)<=radius&&lineClear(target.x,ancientMapHeight(c.map,target.x,target.z,target.y)+1,target.z,m.x,ancientMapHeight(c.map,m.x,m.z,m.y)+1,m.z,c.map)));}
export function monsterIncoming(m:SkillMonster,now:number){return (m.kind==='oathknight'&&(m as SkillMonster & {bossCast?:{id:string}}).bossCast?.id==='oathGuard'?.35:1)*(m.vulnerableUntil&&m.vulnerableUntil>now?1+(m.vulnerable||0):1)}
export function monsterOutgoing(m:SkillMonster,now:number){return (m.weakUntil&&m.weakUntil>now?1-(m.weak||0):1)*((m.buffUntil||0)>now?m.buffPower||1:1)}
export function monsterSpeed(m:SkillMonster,now:number){return m.slowUntil&&m.slowUntil>now?1-(m.slow||0):1}
function slow(m:SkillMonster,n:number,until:number){const amount=FOREST_KINDS[m.kind]?.boss||m.kind==='chief'||m.kind==='lord'?n/2:n;if(!m.slowUntil||m.slowUntil<=Date.now()||amount>=(m.slow||0)){m.slow=amount;m.slowUntil=until}}
function weaken(m:SkillMonster,n:number,until:number){if(!m.weakUntil||m.weakUntil<=Date.now()||n>=(m.weak||0)){m.weak=n;m.weakUntil=until}}
export function selectSkillTarget(a:SkillActor,dir:unknown,range:number,c:SkillContext){
 if(!Array.isArray(dir)||dir.length!==3||!dir.every(Number.isFinite)||Math.abs(Math.hypot(...dir)-1)>.05)return;
 const hits=c.monsters.filter(m=>m.hp>0).map(m=>{const floor=ancientMapHeight(c.map,m.x,m.z,m.y),exact=rayAncientHitbox(a,dir,m,floor,range),hit=exact||rayAncientHitbox(a,dir,m,floor,range,.2);if(!hit)return;const bounds=ancientHitbox(m.kind),dx=hit.x-m.x,dz=hit.z-m.z,n=Math.hypot(dx,dz),scale=n>bounds.radius?bounds.radius/n:1;const px=m.x+dx*scale,py=Math.max(floor+.02,Math.min(floor+bounds.height-.02,hit.y)),pz=m.z+dz*scale;const visible=Math.hypot(px-a.x,py-a.y,pz-a.z)<=range+.00001&&lineClear(a.x,a.y,a.z,px,py,pz,c.map);return visible?{m,hit,exact:!!exact}:undefined;}).filter((v):v is NonNullable<typeof v>=>!!v);
 hits.sort((x,y)=>Number(y.exact)-Number(x.exact)||x.hit.t-y.hit.t);return hits[0]?.m;
}
export function skillTargetError(a:SkillActor,dir:unknown,range:number,c:SkillContext){if(!Array.isArray(dir)||dir.length!==3||!dir.every(Number.isFinite))return '请瞄准可见的敌人';const hits=c.monsters.filter(m=>m.hp>0).map(m=>({m,hit:rayAncientHitbox(a,dir,m,ancientMapHeight(c.map,m.x,m.z,m.y),Math.max(60,range),.2)})).filter(v=>v.hit).sort((x,y)=>x.hit!.t-y.hit!.t);if(!hits.length)return '请瞄准可见的敌人';return hits[0].hit!.t>range?'目标超出技能范围':'目标被障碍物遮挡';}

export function castAncientSkill(a:SkillActor,p:AncientProfile,id:string,direction:unknown,c:SkillContext,now=Date.now()){
 const d=equippedGear(p,'weapon'),combo=d?.combo&&d.combo===p.profession?GROWTH_COMBOS[d.combo]:undefined,r=runtime(a),ready=!!combo&&!!r.gearChain&&r.gearChain.key===d!.combo&&r.gearChain.until>now&&id===combo.to;
 const start={x:a.x,z:a.z},relic=activeRelic(p),target=['icebolt','stoneprison','storm'].includes(id)?selectSkillTarget(a,direction,30,c):undefined;
 const error=castSkillImpl(a,p,id,direction,relicCastContext(a,p,id,branchContext(a,p,id,c,now),now),now,ready?1+combo!.bonus:1);
 if(!error){if(r.cooldowns[id]>now)r.cooldowns[id]=now+(r.cooldowns[id]-now)*branchCooldown(p,id);if(id!=='weaken')queueBranchFinisher(a,p,id,target??selectSkillTarget(a,direction,30,c)??c.monsters.find(m=>m.hp>0&&Math.hypot(m.x-a.x,m.z-a.z)<=6&&lineClear(a.x,a.y,a.z,m.x,ancientMapHeight(c.map,m.x,m.z,m.y)+1,m.z,c.map)),now);const body=ancientSkillDamage(p)*skillDamageMultiplier(a,now)*holyPower(p);
  if(relic==='ice'&&id==='icebolt'&&target)for(let i=0;i<3;i++)queueRelic(a,p,{at:now+1000+i*1000,x:target.x,z:target.z,radius:4,damage:body*.15,fx:'icebolt',slow:true});
  if(relic==='shadowblade'&&id==='shadowstep')queueRelic(a,p,{at:now+800,...start,radius:4,damage:body*.5,fx:'riftblade'});
  if(relic==='stonewright'&&id==='stoneprison'&&target)queueRelic(a,p,{at:now+1500,x:target.x,z:target.z,radius:5,damage:body*.6,fx:'faultline'});
  if(relic==='lightning'&&id==='storm'&&target){const marks=r.relic?.marks||[];for(const m of skillAreaTargets(target,skillRadius(id,p.skills?.[id]||1,isHoly(p)),c))if(marks.some(v=>v.id===m.id&&v.until>now)){queueRelic(a,p,{at:now+100,x:m.x,z:m.z,radius:3.5,damage:body*(1.6+.15*(p.skills?.[id]||1))*.35,fx:'haste'});r.relic!.marks=r.relic!.marks.filter(v=>v.id!==m.id);}}
 }
 if(!error&&combo){if(ready)delete r.gearChain;if(id===combo.from)r.gearChain={key:d!.combo!,until:now+10000};}
 return error;
}
function castSkillImpl(a:SkillActor,p:AncientProfile,id:string,direction:unknown,c:SkillContext,now:number,gearPower:number){
 const s=Object.hasOwn(SKILLS,id)?SKILLS[id]:undefined,n=p.skills?.[id]||0,r=runtime(a);if(a.hp<=0)return '请在存活时使用技能';if(!s||s.job!==p.profession||n<=0||p.level<s.unlock)return '技能尚未修炼';if(id==='transform'&&activeBossForm(a,now))return '变身期间不能使用变身卡';if((r.cooldowns[id]||0)>now&&!(id==='shadowreturn'&&shadowRecallReady(a,now)))return '技能冷却中';if(activeSkill(a,'transform',now))return '变身期间只能使用爪子';
 if(id==='weaken'){r.mode=r.summon?3:2;return null}
 const gear=ancientGearStats(p),body=gearPower*ancientSkillDamage(p)*skillDamageMultiplier(a,now)*holyPower(p),target=['riftblade','stonefist','faultline','stoneprison','mountainfall','frostburst','swordwave','triplecut','swordrain','phantomblade','slash','soulbolt','icebolt','blizzard','chain','storm','hex','drain','doom'].includes(id)?selectSkillTarget(a,direction,id==='triplecut'?15:id==='slash'?12:['drain','riftblade','stonefist'].includes(id)?20:['faultline','stoneprison','mountainfall'].includes(id)?25:30,c):undefined;if(['riftblade','stonefist','faultline','stoneprison','mountainfall','frostburst','swordwave','triplecut','swordrain','phantomblade','slash','soulbolt','icebolt','blizzard','chain','storm','hex','drain','doom'].includes(id)&&!target)return skillTargetError(a,direction,id==='triplecut'?15:id==='slash'?12:['drain','riftblade','stonefist'].includes(id)?20:['faultline','stoneprison','mountainfall'].includes(id)?25:30,c);
 if(EXPANSION_SKILLS.includes(id)){return castExpansionSkill(a,p,id,direction,c,now,body,target);}
 if(id==='summon'){if(r.summon)return '召唤兽已经在场';let point:{x:number;z:number}|undefined;for(const [dx,dz]of [[2,0],[-2,0],[0,2],[0,-2],[0,0]])if(!blocked(a.x+dx,a.z+dz,.8,c.map)){point={x:a.x+dx,z:a.z+dz};break}if(!point)return '没有召唤空间';const scale=.75+.05*n,hp=Math.floor(ancientProfileHealth(p)*scale*(1+gear.petHealth)*(isHoly(p)?1.5:1));r.summon={...point,hp:Math.floor(hp*(activeBranch(p)==='beastlord'?1.3:1)),maxHp:Math.floor(hp*(activeBranch(p)==='beastlord'?1.3:1)),damage:Math.max(1,Math.floor(ancientSkillDamage(p)*scale*(1+gear.pet)*holyPower(p))),until:now+100000,attackAt:0,target:'',level:n};r.mode=1;c.fx(id,point.x,point.z,2);return null}
 if(id==='haste'&&(!Array.isArray(direction)||direction.length!==3||!direction.every(Number.isFinite)||Math.hypot(direction[0],direction[2])<.001))return '请朝前方使用技能';
 r.cooldowns[id]=now+skillCooldown(id,n)*1000*(1-gear.cooldown);
 if(id==='haste'){
  const dir=direction as number[],length=Math.hypot(dir[0],dir[2]),dx=dir[0]/length,dz=dir[2]/length,startX=a.x,startZ=a.z,startY=a.y,hit=new Set<string>();
  r.effects.haste={until:now+s.duration*1000,level:n};
  for(let step=0;step<=60;step++){
   const x=startX+dx*step*.25,z=startZ+dz*step*.25,floor=ancientMapHeight(c.map,x,z,a.y-1.7),y=floor+1.7;
   if(step&&(blocked(x,z,.6,c.map,floor)||Math.abs(y-a.y)>1.2||bossBodyPathBlocked(a.x,a.z,x,z,floor,c.monsters,(bx,bz)=>ancientMapHeight(c.map,bx,bz))))break;
   a.x=x;a.z=z;a.y=y;
   for(const m of c.monsters)if(m.hp>0&&!hit.has(m.id)&&Math.hypot(m.x-x,m.z-z)<=skillRadius(id,n,isHoly(p))*branchRadius(p,id)&&lineClear(x,y,z,m.x,ancientMapHeight(c.map,m.x,m.z,m.y)+1,m.z,c.map)){hit.add(m.id);c.damage(m,body*(3+.3*n))}
   if(step%8===0)c.fx(id,x,z,1,{target:'',source:{x:startX,y:startY-.25,z:startZ}});
  }
  c.fx(id,a.x,a.z,skillRadius(id,n,isHoly(p))*branchRadius(p,id),{target:'',source:{x:startX,y:startY-.25,z:startZ}});return null;
 }
 if(['vitality','power','rage','transform','icearmor'].includes(id)){r.effects[id]={until:now+s.duration*1000,level:n};if(id==='transform')r.mode=1;skillHealth(a,ancientProfileHealth(p),now);if(['power','rage','icearmor','haste'].includes(id)||id==='vitality'&&!!activeBranch(p)){const radius=(skillRadius(id,n,isHoly(p))||(id==='vitality'?4:0))*branchRadius(p,id);for(const m of c.monsters)if(m.hp>0&&Math.hypot(m.x-a.x,m.z-a.z)<=radius&&lineClear(a.x,a.y,a.z,m.x,(ancientMapHeight(c.map,m.x,m.z,m.y))+1,m.z,c.map)){c.damage(m,body*(id==='rage'?4+.4*n:3+.3*n));if(id==='icearmor')slow(m,Math.min(.7,.35+gear.slow),now+4000)}c.fx(id,a.x,a.z,radius)}else c.fx(id,a.x,a.z,2);return null}
 if(!target)return null;
 if(id==='frostburst'){const radius=skillRadius(id,n,isHoly(p))*branchRadius(p,id);for(const m of skillAreaTargets(target!,radius,c))c.damage(m,body*(2.6+.25*n));c.fx(id,target!.x,target!.z,radius,{target:target!.id});return null;}
 if(['swordwave','triplecut','swordrain','phantomblade'].includes(id)){
  if(id==='swordrain'&&activeRelic(p)==='swordsman'){const radius=skillRadius(id,n,isHoly(p))*branchRadius(p,id);for(let i=0;i<6;i++)queueRelic(a,p,{at:now+250+i*500,x:target.x,z:target.z,target:target.id,radius,damage:body*(1.4+.16*n),fx:''});c.fx(id,target.x,target.z,radius,{target:target.id});return null;}
  const strikes=id==='triplecut'?[0,300,600].map((delay,i)=>({skillId:id,owner:a.name,at:now+delay,damage:body*(3.3+.3*n)*.5**i})):id==='swordrain'?Array.from({length:6},(_,i)=>({owner:a.name,at:now+250+i*500,damage:body*(1.4+.16*n)})):[{skillId:id,owner:a.name,at:now+(id==='phantomblade'?500:0),damage:body*(id==='phantomblade'?(6.5+.6*n)*1.3:3+.25*n)}];
  target.strikes=(target.strikes||[]);if(target.strikes.length+strikes.length>64){delete r.cooldowns[id];return '目标正在承受过多技能'}
  const radius=skillRadius(id,n,isHoly(p))*branchRadius(p,id);const victims=radius?skillAreaTargets(target,radius,c):[target];
  for(const m of victims){m.strikes=(m.strikes||[]);if(m.strikes.length+strikes.length>64)continue;m.strikes.push(...strikes.map(v=>({...v})));const due=m.strikes.filter(v=>v.owner===a.name&&v.at<=now);m.strikes=m.strikes.filter(v=>!(v.owner===a.name&&v.at<=now));for(const hit of due)if(m.hp>0)c.damage(m,hit.damage)}c.fx(id,target.x,target.z,radius||2,{target:target.id});return null;
 }
 if(id==='slash'){for(const m of c.monsters)if(m.hp>0&&Math.hypot(m.x-target.x,m.z-target.z)<=skillRadius(id,n,isHoly(p))*branchRadius(p,id)&&(m.id===target.id||lineClear(a.x,a.y,a.z,m.x,(ancientMapHeight(c.map,m.x,m.z,m.y))+1,m.z,c.map)))c.damage(m,body*((320+30*n)/100))}
 if(id==='soulbolt'){c.damage(target,body*((330+30*n)/100));if(r.summon)r.summon.target=target.id}
 if(id==='icebolt'){c.damage(target,body*((300+30*n)/100));slow(target,Math.min(.7,.2+.02*n+gear.slow),now+6000)}
 if(id==='hex'){c.damage(target,body*((320+30*n)/100));weaken(target,Math.min(.4,.1+.02*n),now+10000);target.vulnerable=Math.min(.3,.08+.01*n);target.vulnerableUntil=now+10000}
 if(id==='drain'){const actual=c.damage(target,body*(4+.4*n));a.hp=Math.min(a.maxHp||100,a.hp+Math.min(actual*.3,(a.maxHp||100)*.2))}
 if(id==='chain'){let current=target;const seen=new Set<string>(),links:{x:number;y:number;z:number;target:string;height:number}[]=[];for(let i=0;i<Math.min(c.monsters.length,activeBranch(p)==='heavenwrath'?2:n+2+gear.chainTargets+(isHoly(p)?2:0)+(activeBranch(p)==='thunderfield'?3:0));i++){seen.add(current.id);const size=FOREST_KINDS[current.kind]?.size??(current.kind==='lord'?3.4:current.kind==='chief'?2.7:1),height=(current.kind==='hunter'?2.1:1.65)*size*.5;links.push({x:current.x,y:ancientMapHeight(c.map,current.x,current.z)+height,z:current.z,target:current.id,height});c.damage(current,body*((300+30*n)/100)*.75**i);const next=c.monsters.filter(m=>m.hp>0&&!seen.has(m.id)&&Math.hypot(m.x-current.x,m.z-current.z)<=(16+n-1)/2*(isHoly(p)?1.5:1)*(activeBranch(p)==='thunderfield'?1.35:1)&&lineClear(current.x,(ancientMapHeight(c.map,current.x,current.z))+1,current.z,m.x,(ancientMapHeight(c.map,m.x,m.z,m.y))+1,m.z,c.map)).sort((x,y)=>Math.hypot(x.x-current.x,x.z-current.z)-Math.hypot(y.x-current.x,y.z-current.z))[0];if(!next)break;current=next}c.fx(id,target.x,target.z,1,{target:target.id,source:{x:a.x,y:a.y-.25,z:a.z},links});return null}
 if(['blizzard','storm','doom'].includes(id)){const radius=skillRadius(id,n,isHoly(p))*branchRadius(p,id);for(const m of skillAreaTargets(target,radius,c)){const amount=id==='blizzard'?1.25+.1*n:id==='storm'?1.6+.15*n:.8+.08*n;m.dots=(m.dots||[]).filter(d=>d.until>now&&d.owner!==a.name);if(m.dots.length>=8)m.dots.shift();m.dots.push({skillId:id,owner:a.name,until:now+s.duration*1000,next:now,damage:body*amount});if(id==='blizzard')slow(m,Math.min(.7,.25+.01*n+gear.slow),now+6000);if(id==='doom')weaken(m,Math.min(.4,.1+.01*n),now+8000)}}
 c.fx(id,target.x,target.z,skillRadius(id,n,isHoly(p))*branchRadius(p,id)||1);return null;
}
export function ancientAuxShot(a:SkillActor,p:AncientProfile,direction:unknown,c:SkillContext,now=Date.now()){
 const r=runtime(a),form=activeSkill(a,'transform',now);if(form){if(now-r.lastAux<600)return;r.lastAux=now;const target=selectSkillTarget(a,direction,4.5,c);c.fx('claw',a.x,a.z,1);if(target){c.damage(target,ancientSkillDamage(p)*((125+10*form)/100)*skillDamageMultiplier(a,now)*holyPower(p));queueBranchFinisher(a,p,'claw',target,now);}return}
 if(r.mode===1)return;if(now-r.lastAux<350)return;r.lastAux=now;const target=selectSkillTarget(a,direction,60,c);if(!target)return '请瞄准可见的敌人';
 if(r.mode===2&&r.summon){r.summon.target=target.id;c.fx('mark',target.x,target.z,1);return}
 const n=p.skills?.weaken||0;if(p.profession!=='summoner'||n<=0)return '技能尚未修炼';if((r.cooldowns.weaken||0)>now)return '技能冷却中';r.cooldowns.weaken=now+12000*(1-ancientGearStats(p).cooldown);c.damage(target,ancientSkillDamage(p)*(2.8+.3*n)*skillDamageMultiplier(a,now)*holyPower(p));weaken(target,Math.min(.8,.05*n),now+n*8000);queueBranchFinisher(a,p,'weaken',target,now);c.fx('weaken',target.x,target.z,1);
}
export function tickAncientSkills(a:SkillActor,p:AncientProfile,c:SkillContext,dt:number,now=Date.now()){
 if(a.hp<=0)clearPendingSkillDamage(a.name,c.monsters);
 const r=runtime(a);if(r.shadowAnchor&&r.shadowAnchor.until<=now)delete r.shadowAnchor;if(r.bossForm&&r.bossForm.until<=now)delete r.bossForm;skillHealth(a,ancientProfileHealth(p),now);for(const [id,e]of Object.entries(r.effects))if(e.until<=now)delete r.effects[id];if(a.hp<=0){delete r.relic;delete r.shadowAnchor;delete r.bossForm;r.effects={};if(r.summon){delete r.summon;r.cooldowns.summon=now+100000*(1-ancientGearStats(p).cooldown)}r.mode=1;skillHealth(a,ancientProfileHealth(p),now);return}
 const vitality=activeSkill(a,'vitality',now);if(vitality)a.hp=Math.min(a.maxHp||100,a.hp+(a.maxHp||100)*vitality*.01*dt);
 tickRelic(a,p,c,now);tickBranch(a,p,c,now);
 const branchTicks=new Map<string,SkillContext>();const tickContext=(id:string)=>{if(!branchTicks.has(id))branchTicks.set(id,branchContext(a,p,id,c,now));return branchTicks.get(id)!;};
 for(const m of c.monsters){const due=(m.strikes||[]).filter(v=>v.owner===a.name&&v.at<=now);m.strikes=(m.strikes||[]).filter(v=>!(v.owner===a.name&&v.at<=now));for(const hit of due)if(m.hp>0)tickContext(hit.skillId||'periodic').damage(m,hit.damage);for(const d of m.dots||[])if(d.owner===a.name&&d.next<=now&&d.until>now&&m.hp>0){d.next=now+1000;tickContext(d.skillId||'periodic').damage(m,d.damage)}m.dots=(m.dots||[]).filter(d=>d.until>now)}
 const pet=r.summon;if(pet){if(pet.hp<=0||pet.until<=now){delete r.summon;r.cooldowns.summon=(pet.hp<=0?now:pet.until)+100000*(1-ancientGearStats(p).cooldown);r.mode=1}else{let target=c.monsters.find(m=>m.id===pet.target&&m.hp>0);const visible=(m:SkillMonster)=>lineClear(pet.x,(ancientMapHeight(c.map,pet.x,pet.z))+1,pet.z,m.x,(ancientMapHeight(c.map,m.x,m.z,m.y))+1,m.z,c.map);if(!target)target=c.monsters.filter(m=>m.hp>0&&Math.hypot(m.x-pet.x,m.z-pet.z)<20&&visible(m)).sort((x,y)=>Math.hypot(x.x-pet.x,x.z-pet.z)-Math.hypot(y.x-pet.x,y.z-pet.z))[0];const tx=target?.x??a.x,tz=target?.z??a.z,distance=Math.hypot(tx-pet.x,tz-pet.z);if(target&&distance<2.8&&visible(target)){if(now>=pet.attackAt){pet.attackAt=now+1000;pet.damage=Math.max(1,Math.floor(ancientSkillDamage(p)*(.75+.05*pet.level)*(1+ancientGearStats(p).pet)*skillDamageMultiplier(a,now)*holyPower(p)));const key=activeBranch(p);c.damage(target,pet.damage*(key==='beastlord'?1.25:key==='spiritpack'?.8:1),'summon');if(key==='spiritpack')queueBranchFinisher(a,p,'petEcho',target,now,pet.damage);c.fx('petHit',target.x,target.z,1)}}else if(distance>2||target&&!visible(target)){if(c.map==='forest'||c.map==='city'||c.map==='blight'||c.map==='skyreach'||c.map==='frostcourt'||c.map==='starfall'||c.map==='sanctum'){if(now>=(pet.pathAt||0)||Math.hypot(tx-(pet.pathX??tx),tz-(pet.pathZ??tz))>5){pet.path=(c.map==='skyreach'?skyreachPath:c.map==='frostcourt'?frostcourtPath:c.map==='starfall'?starfallPath:c.map==='sanctum'?sanctumPath:c.map==='blight'?blightPath:c.map==='city'?cityPath:forestPath)(pet.x,pet.z,tx,tz);pet.pathAt=now+2000;pet.pathX=tx;pet.pathZ=tz}while(pet.path?.length&&Math.hypot(pet.path[0].x-pet.x,pet.path[0].z-pet.z)<.7)pet.path.shift()}const waypoint=pet.path?.[0],dx=(waypoint?.x??tx)-pet.x,dz=(waypoint?.z??tz)-pet.z,d=Math.hypot(dx,dz)||1,step=Math.min(d,dt*((r.relic?.petRushUntil||0)>now?11:7)),x=pet.x+dx/d*step,z=pet.z+dz/d*step;if(!blocked(x,z,.8,c.map)){pet.x=x;pet.z=z}else if(!blocked(x,pet.z,.8,c.map))pet.x=x;else if(!blocked(pet.x,z,.8,c.map))pet.z=z}}}
}
