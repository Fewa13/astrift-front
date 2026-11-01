// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {activeRelic} from './ancient-hunts';
import {runtime,type SkillActor} from './ancient-skills';
import type {AncientProfile} from './ancient-rules';
import {lineClear,ancientMapHeight} from './ancient-rules';
import {isAncientBoss} from './ancient-boss';
import type {SkillContext,SkillMonster} from './ancient-skill-combat';
export type RelicPulse={at:number;x:number;z:number;radius:number;damage:number;fx:string;target?:string;slow?:boolean};
export type RelicRuntime={key:string;pulses:RelicPulse[];marks:{id:string;until:number}[];petRushUntil?:number};
function state(a:SkillActor,key:string){const r=runtime(a);if(r.relic?.key!==key)r.relic={key,pulses:[],marks:[]};return r.relic!;}
export function queueRelic(a:SkillActor,p:AncientProfile,pulse:RelicPulse){const key=activeRelic(p);if(!key)return;const s=state(a,key);if(s.pulses.length<8)s.pulses.push(pulse);}
// Wrap only this cast: normal melee, other players and summon ticks never inherit it.
export function relicCastContext(a:SkillActor,p:AncientProfile,id:string,c:SkillContext,now:number){
 const key=activeRelic(p);if(!key)return c;const s=state(a,key),echoed=new Set<string>();let primary=false;
 return {...c,damage(m:SkillMonster,n:number,source?:'summon'){
  const wasWeak=(m.weakUntil||0)>now,mark=s.marks.find(v=>v.id===m.id&&v.until>now),actual=c.damage(m,n,source);
  if(actual<=0)return actual;
  if(key==='lightning'&&id==='chain'){s.marks=s.marks.filter(v=>v.id!==m.id&&v.until>now).slice(-7);s.marks.push({id:m.id,until:now+8000});c.fx('mark',m.x,m.z,1,{target:m.id});}
  else if(key==='lightning'&&mark&&!echoed.has(m.id)){echoed.add(m.id);s.marks=s.marks.filter(v=>v.id!==m.id);queueRelic(a,p,{at:now+100,x:m.x,z:m.z,radius:3.5,damage:n*.35,fx:'haste'});}
  if(!primary&&key==='warrior'&&id==='slash'){primary=true;queueRelic(a,p,{at:now+600,x:m.x,z:m.z,radius:4,damage:n*.35,fx:'slash'});}
  if(!primary&&key==='summoner'&&id==='soulbolt'&&runtime(a).summon){primary=true;s.petRushUntil=now+4000;queueRelic(a,p,{at:now+350,x:m.x,z:m.z,radius:3,damage:n*.35,fx:'petHit'});}
  if(!primary&&key==='curse'&&id==='drain'&&wasWeak){primary=true;const near=c.monsters.filter(v=>v.hp>0&&v.id!==m.id&&Math.hypot(v.x-m.x,v.z-m.z)<=6&&lineClear(m.x,ancientMapHeight(c.map,m.x,m.z,m.y)+1,m.z,v.x,ancientMapHeight(c.map,v.x,v.z,v.y)+1,v.z,c.map)).sort((x,y)=>Math.hypot(x.x-m.x,x.z-m.z)-Math.hypot(y.x-m.x,y.z-m.z)).slice(0,2);for(const v of near){c.damage(v,n*.35);if((v.weakUntil||0)<=now||(v.weak||0)<.15){v.weak=.15;v.weakUntil=now+5000;}c.fx('hex',v.x,v.z,1,{target:v.id});}}
  return actual;
 }};
}
export function tickRelic(a:SkillActor,p:AncientProfile,c:SkillContext,now:number){
 const r=runtime(a),s=r.relic;if(!s)return;if(a.hp<=0||s.key!==activeRelic(p)){delete r.relic;return;}
 const due=s.pulses.filter(v=>v.at<=now);s.pulses=s.pulses.filter(v=>v.at>now);s.marks=s.marks.filter(v=>v.until>now&&c.monsters.some(m=>m.id===v.id&&m.hp>0));
 for(const pulse of due){const target=pulse.target&&c.monsters.find(m=>m.id===pulse.target&&m.hp>0);if(target){pulse.x=target.x;pulse.z=target.z;for(const next of s.pulses)if(next.target===pulse.target){next.x=target.x;next.z=target.z;}}
  for(const m of c.monsters)if(m.hp>0&&Math.hypot(m.x-pulse.x,m.z-pulse.z)<=pulse.radius&&(m===target||lineClear(pulse.x,ancientMapHeight(c.map,pulse.x,pulse.z)+1,pulse.z,m.x,ancientMapHeight(c.map,m.x,m.z,m.y)+1,m.z,c.map))){c.damage(m,pulse.damage);if(pulse.slow){const amount=isAncientBoss(m.kind)?.15:.3;if((m.slowUntil||0)<=now||(m.slow||0)<=amount){m.slow=amount;m.slowUntil=now+1500;}}}
  if(pulse.fx)c.fx(pulse.fx,pulse.x,pulse.z,pulse.radius,{target:target?target.id:''});
 }
}
