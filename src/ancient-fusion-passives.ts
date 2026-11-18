// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {AncientProfile} from './ancient-rules';
import {isFusionJob,PROFESSIONS,SKILLS} from './ancient-skills.js';
import {masteryLevel} from './ancient-mastery.js';

export const FUSION_SCROLLS={
 ignitionBasic:{name:'初级技能卷轴',en:'Basic Skill Scroll',price:5000,odds:[.5,.2,.05]},
 ignitionIntermediate:{name:'中级技能卷轴',en:'Intermediate Skill Scroll',price:30000,odds:[.8,.5,.3]},
 ignitionAdvanced:{name:'高级技能卷轴',en:'Advanced Skill Scroll',price:200000,odds:[1,.9,.7]},
} as const;
export const FUSION_PASSIVE_REQUIREMENTS=[5,8,12] as const;
export const FUSION_PASSIVES:Record<string,[string,string,string,string][]> = {
 necromancer:[
  ['自动填充','Auto-Raise','缓慢补充骷髅储备，升级加快补充速度。','Refills the reserve over time. Levels shorten the interval.'],
  ['伤害转移','Damage Transfer','伤害除以被动等级，剩余伤害的80%由存活骷髅分担。','Divides damage by passive level and shares 80% of the remainder with living skeletons.'],
  ['不死之身','Deathless','骷髅可复活一次。玩家致命伤时复活，触发期间骷髅复活暂停。','Skeletons revive once. A lethal hit revives you, and skeleton revivals pause during your cooldown.'],
 ],
 elementalist:[
  ['元素共振','Elemental Resonance','停止施法后蓄积元素之力。下一次神罚消耗储能，为所有命中目标必定附加减益，储能越多越强。','Build elemental power between casts. The next Divine Judgment spends it to apply guaranteed debuffs to all enemies hit.'],
  ['元素对冲','Elemental Clash','火与冰在同一目标相遇时引发范围爆炸。','Fire and ice together trigger a powerful area explosion.'],
  ['万象共鸣','Prismatic Convergence','大幅强化攻击，对削弱目标额外增伤。','Greatly amplifies attacks, with an extra bonus against weakened enemies.'],
 ],
 voidsword:[
  ['虚空锋刃','Void Edge','虚空斩有概率直接引爆，升级提高概率。','Void Slash can detonate immediately. Levels raise the chance.'],
  ['裂隙护体','Rift Guard','降低受到的伤害。在虚空领域内每级额外减伤 1%，额外减伤最多 30%。','Reduces damage taken. Inside your void domain, gain another 1% reduction per level, up to 30%.'],
  ['界外绝斩','Beyond the Rift','大幅强化攻击，终结技获得更高增幅。','Greatly amplifies attacks, with a larger bonus on finishers.'],
 ],
 abyssal:[
  ['血蚀','Blood Corrosion','血量越低，技能伤害越高。','Skill damage rises as health falls.'],
  ['深渊血甲','Abyssal Carapace','降低受到的伤害，生命越低效果越强。','Reduces incoming damage more as your health falls.'],
  ['深渊饥渴','Abyssal Hunger','大幅强化全部攻击，低血时效果更强。','Greatly amplifies all attacks, especially at low health.'],
 ],
 chrono:[
  ['时序加速','Temporal Acceleration','成功回溯后刷新其他时空技能。攻击概率附加 4 秒时间混乱，使目标受伤 +15%、攻击 −15%。再次触发会额外造成 250% 本次伤害，并减速 45% 持续 3 秒。','Rewind refreshes your other Chrono Walker skills. Hits may inflict 4 seconds of Temporal Disorder: 15% more damage taken and 15% less attack. A second proc deals 250% bonus hit damage and slows by 45% for 3 seconds.'],
  ['时间缓冲','Time Buffer','降低受到的伤害，跃迁或回溯后短暂加强。','Reduces damage taken, with stronger protection briefly after shifting or rewinding.'],
  ['时间叠层','Temporal Overlap','大幅强化攻击，对减速目标额外增伤。','Greatly amplifies attacks, with an extra bonus against slowed foes.'],
 ],
};
export const TEMPORAL_DISORDER={
 duration:4000, vulnerability:.15, weakness:.15,
 explosion:2.5, slow:.45, slowDuration:3000,
 chance:(level:number)=>Math.min(.5,.18+.005*(level-1)),
};
export const voidDomainExtraReduction=(level:number)=>Math.min(.30,level*.01);
export type FusionPassiveProgress={level:number;points:number};
export const passiveCost=(level:number,job?:string,index?:number)=>(12+level*level*6)*(job==='necromancer'&&index===0?2:1);
export const passiveLevel=(p:AncientProfile,index:number)=>p.fusionPassives?.[p.profession||'']?.[index]?.level||0;
export function ignitionEligible(p:AncientProfile,index:number){
 const job=p.profession||'',required=FUSION_PASSIVE_REQUIREMENTS[index];
 if(!required||!isFusionJob(job)||!p.fusedJobs?.[job]||passiveLevel(p,index))return false;
 const advanced=p.advancements?.[job];
 return PROFESSIONS[job].skills.every(id=>id==='unleashLegion'||(advanced?.skills[SKILLS[id].key]?.level??masteryLevel(p,id))>=required)&&
  FUSION_PASSIVE_REQUIREMENTS.slice(0,index).every((_,i)=>passiveLevel(p,i)>=required);
}
export function igniteFusionPassive(p:AncientProfile,index:number,scroll:string,random=Math.random){
 if(!ignitionEligible(p,index)||!Object.hasOwn(FUSION_SCROLLS,scroll))return {error:'尚未满足点亮条件 / Ignition requirements not met'};
 const key='supply:'+scroll;
 if(!(p.materials[key]>0))return {error:'技能卷轴不足 / Skill scroll required'};
 p.materials[key]--;
 const ignited=random()<FUSION_SCROLLS[scroll as keyof typeof FUSION_SCROLLS].odds[index];
 if(ignited){
  const slots=((p.fusionPassives??={})[p.profession!]??={});
  slots[index]={level:1,points:0};
 }
 return {ignited};
}
export function trainFusionPassive(p:AncientProfile,index:number,points:number){
 const progress=p.fusionPassives?.[p.profession||'']?.[index];
 if(!progress||points<=0||progress.level>=100)return false;
 const before=progress.level;
 progress.points+=points;
 while(progress.level<100&&progress.points>=passiveCost(progress.level,p.profession,index))progress.points-=passiveCost(progress.level++);
 if(progress.level===100)progress.points=0;
 return progress.level>before;
}
