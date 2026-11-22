import {ELEMENT_POTIONS,POTION_EFFECTS,potionActive} from './ancient-potion-effects';
import type {SkillActor,SkillRuntime} from './ancient-skills';
import type {SkillMonster} from './ancient-skill-combat';
type Target=SkillMonster&{potionProcAt?:Record<string,number>;recoverUntil?:number};
export function applyElementPotionHit(a:SkillActor,m:Target,amount:number,attack:string|undefined,source:string,monsters:SkillMonster[],now:number,clear:(a:SkillMonster,b:SkillMonster)=>boolean,random=Math.random){
 const result={bonus:0,chains:[] as {target:SkillMonster;damage:number}[],fx:[] as string[]};
 if(!['skill','summon'].includes(source)||!attack||attack==='melee'||/^(potion:|artifact:)/.test(attack)||attack==='timeresurrection'||!(amount>0)||m.hp<=0)return result;
 const r=POTION_EFFECTS.element;
 for(const id of ELEMENT_POTIONS){if(!potionActive(a,id,now))continue;const key=a.name+':'+id;if((m.potionProcAt?.[key]||0)>now||random()>=r.chance)continue;
  const timers=m.potionProcAt??={};if(Object.keys(timers).length>=128)for(const key of Object.keys(timers))if(timers[key]<=now)delete timers[key];if(Object.keys(timers).length>=128)continue;timers[key]=now+r.interval;
  const fusion=a.skillRuntime?.fusion,sign=fusion&&a.profession==='elementalist'?((fusion.elementalSigns??={})[m.id]??={}):undefined;
  if(id==='elementFire'){m.dots??=[];m.dots=m.dots.filter(d=>d.owner!==a.name||d.skillId!=='potion:fire');m.dots.push({owner:a.name,skillId:'potion:fire',damage:amount*r.fireTotal/3,next:now+1000,until:now+3500});if(sign)sign.fire=now+4000;result.fx.push('firebolt');}
  else{result.bonus+=r.damage;
   if(id==='elementLightning'){const target=monsters.filter(v=>v!==m&&v.hp>0&&Math.hypot(v.x-m.x,v.z-m.z)<=r.chainRadius&&clear(m,v)).sort((x,y)=>Math.hypot(x.x-m.x,x.z-m.z)-Math.hypot(y.x-m.x,y.z-m.z))[0];if(target)result.chains.push({target,damage:amount*r.chain});result.fx.push('chain');}
   if(id==='elementCurse'){m.weak=Math.max((m.weakUntil||0)>now?m.weak||0:0,.1);m.weakUntil=Math.max(m.weakUntil||0,now+r.duration);m.vulnerable=Math.max((m.vulnerableUntil||0)>now?m.vulnerable||0:0,.1);m.vulnerableUntil=Math.max(m.vulnerableUntil||0,now+r.duration);result.fx.push('hex');}
   if(id==='elementEarth'){m.slow=Math.max((m.slowUntil||0)>now?m.slow||0:0,.15);m.slowUntil=Math.max(m.slowUntil||0,now+3000);m.recoverUntil=Math.max(m.recoverUntil||0,now+400);result.fx.push('faultline');}
   if(id==='elementIce'){m.slow=Math.max((m.slowUntil||0)>now?m.slow||0:0,.3);m.slowUntil=Math.max(m.slowUntil||0,now+r.duration);if(sign)sign.ice=now+r.duration;result.fx.push('frostburst');}
  }
 }
 return result;
}
