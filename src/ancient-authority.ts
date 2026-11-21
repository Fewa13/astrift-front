// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {AncientProfile} from './ancient-rules';
export const AUTHORITY_MAPS=['tribe','forest','city','blight','sanctum','starfall','frostcourt','skyreach','dunes'] as const;
export const AUTHORITY_MAP_NAMES:Record<string,[string,string]>={tribe:['部落','Tribe'],forest:['森林','Forest'],city:['失落王城','Lost Royal City'],blight:['蚀影荒原','Shadowblight Wastes'],sanctum:['净界圣域','Sanctum of the Veil'],starfall:['沉星遗境','Sunken Star Ruins'],frostcourt:['霜烬王庭','Frostfire Court'],skyreach:['寂雷天穹','Silent Storm Skyreach'],dunes:['暮沙迷城','Duskglass Labyrinth']};
export const AUTHORITY_JOBS={timelord:{name:'时间之主',en:'Lord of Time',source:'chrono',icon:'◷'},spacelord:{name:'空间之主',en:'Lord of Space',source:'voidsword',icon:'⟐'}} as const;
export type AuthorityJob=keyof typeof AUTHORITY_JOBS;
export const isAuthorityJob=(id:string):id is AuthorityJob=>Object.hasOwn(AUTHORITY_JOBS,id);
export type AuthorityProgress={tokens:string[];submitted?:boolean;unlocked?:boolean;day?:string;attempts?:number;wraiths?:number;essence?:number};
export const AUTHORITY_SKILLS={
 timelord:[['timecurse','时间诅咒','Temporal Curse','X',5],['timedominion','时间领域','Time Dominion','Q',26],['timeflow','时间回流','Temporal Reflow','Z',35],['timeresurrection','时间倒流','Time Resurrection','C',50]],
 spacelord:[['spacefracture','空间断层','Spatial Fracture','X',4],['spacefold','折叠领域','Folded Dominion','Q',22],['spaceswap','空间置换','Spatial Exchange','Z',12],['spacecollapse','空间坍缩','Spatial Collapse','C',36]],
} as const;
export const AUTHORITY_BALANCE={damage:60,fractureHit:8,fractureExplosion:12,fractureSplash:3,history:120000,wraithStart:5,wraithEssence:(count:number)=>Math.ceil(120*(1+Math.max(0,count-5)*.35)**1.45),domainRadius:22,domainDuration:18000,wraithRevive:8000,wraithAttack:1500,wraithPower:1.5,deprivationDuration:8000,deprivation:.2,curseDuration:18000,curseTick:1000,cursePower:1.3,curseChance:.25,reflowBonus:.5,reflowDuration:12000,resurrectionDuration:22000,resurrectionPower:.7,trialOffsets:[0,5,10,20],trialAttempts:2,trialMinutes:30,trialReaction:1000,trialBaseSpeed:6,safeRadius:2.2} as const;
export const authorityDay=(now=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
export function authorityProgress(p:AncientProfile,job:AuthorityJob){return (p.authority??={})[job]??=((job==='timelord')?{tokens:[],wraiths:5,essence:0}:{tokens:[]});}
export function authorityRequirements(p:AncientProfile,job:AuthorityJob,skills:Record<string,{skills:string[]}>){
 const source=AUTHORITY_JOBS[job].source,r=p.authority?.[job];
 const trained=!!p.fusedJobs?.[source]&&skills[source].skills.every(id=>(p.mastery?.[id]?.level||1)>=12)&&[0,1,2].every(i=>(p.fusionPassives?.[source]?.[i]?.level||0)>=12);
 const ordinary=Object.keys(skills).filter(id=>!['elementalist','voidsword','abyssal','chrono','necromancer','timelord','spacelord'].includes(id));
 const holy=ordinary.every(id=>!!p.consumedJobs?.[id]||!!p.ascension?.jobs?.[id]?.holy);
 return {tokens:AUTHORITY_MAPS.every(map=>r?.tokens.includes(map)),trained,holy,submitted:!!r?.submitted,unlocked:!!r?.unlocked};
}
export function authorityTrialError(p:AncientProfile,job:AuthorityJob,now=Date.now()){
 const r=p.authority?.[job];if(!r?.submitted||r.unlocked)return '尚未提交全部信物，或已获得权柄 / Submit your tokens first, or authority already earned';
 if(p.profession!==AUTHORITY_JOBS[job].source)return '请使用对应的预备融合职业 / Equip the prerequisite fusion profession';
 if(r.day===authorityDay(now)&&(r.attempts||0)>=2)return '今日挑战次数已用完（每天2次） / Daily limit: two attempts';return null;
}
export function authoritySafePattern(x:number,z:number,round:number,now:number){
 // Empty arena: every straight route is navigable. Warning uses the farthest permitted walk speed floor.
 const points=Array.from({length:25},(_,i)=>({x:-48+(i%5)*24,z:14+Math.floor(i/5)*28}));
 const ordered=points.sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z));
 const safe=[ordered[Math.min(round%2,1)],ordered[ordered.length-1]];
 const distance=Math.min(...safe.map(p=>Math.max(0,Math.hypot(p.x-x,p.z-z)-AUTHORITY_BALANCE.safeRadius+.7)));
 return {safe,started:now,hitAt:now+AUTHORITY_BALANCE.trialReaction+Math.ceil(distance/AUTHORITY_BALANCE.trialBaseSpeed*1000),radius:Number(AUTHORITY_BALANCE.safeRadius)};
}
export const AUTHORITY_DESCRIPTIONS:Record<string,[string,string]>={
 timecurse:['诅咒持续18秒，时间加速3倍起，持续时间缩短且跳伤加快；每跳有25%概率附加8秒时间剥夺（全部战斗属性−20%，不叠加）。','18 seconds of curse compressed by 3× time acceleration. Each tick has a 25% chance of 8-second non-stacking Time Deprivation: all combat attributes −20%.'],
 timedominion:['展开18秒时间领域，裂缝持续切割并强力减速。自带5名怨灵；击杀积攒怨灵之气，永久增加怨灵，数量无上限且获取逐渐变难。怨灵消散后孕育，下次领域重现。','An 18-second domain cuts and hinders enemies. Begin with five wraiths; kills earn essence for permanent, uncapped wraith growth at increasing cost. Fallen wraiths incubate until the next domain.'],
 timeflow:['回到过去2分钟最高生命值，获得时间附加I；当前已是最高则获得增幅双倍的II。命中敌人时额外施加时间剥夺。','Restore your highest health in the last two minutes and gain Time Infusion I. If already at that health, gain II with twice the bonus. A hit also inflicts Time Deprivation.'],
 timeresurrection:['复活过去2分钟亲自击败的怪物，帮助战斗22秒；复活者攻击概率施加时间剥夺或时间诅咒。','Raise enemies you defeated in the last two minutes as allies for 22 seconds. Their attacks may inflict Time Deprivation or Temporal Curse.'],
 spacefracture:['发出空间断层，命中留下裂痕，再次命中引爆并波及附近敌人。','Launch a spatial fracture. Hits leave a mark; another hit detonates it and damages nearby enemies.'],
 spacefold:['展开折叠领域与双向星门，走入星门即可穿越至另一端。领域持续切割，并将部分伤害传导至其他目标。','Fold the battlefield into a cutting domain with two linked gates. Walk through either to emerge at the other. Part of its damage is relayed between enemies.'],
 spaceswap:['向瞄准位置传送并留下坐标，再次释放返回；出发与抵达位置同时震荡。','Teleport toward your aim and leave a coordinate. Recast to return; both departure and arrival release shockwaves.'],
 spacecollapse:['压缩目标区域，普通敌人被牵引，BOSS受到强力减速。多层切面连续伤害后引爆全部空间印记。','Compress an area, pulling ordinary enemies and heavily slowing bosses. Layered cuts culminate in a detonation of spatial marks.'],
};

export const AUTHORITY_TYPES:Record<string,[string,string]>={timecurse:['单体 / 持续伤害 / 削弱','Single target / Damage over time / Debuff'],timedominion:['群体 / 召唤 / 控制','Area / Summon / Control'],timeflow:['恢复 / 增益 / 削弱','Healing / Buff / Debuff'],timeresurrection:['召唤 / 增益','Summon / Buff'],spacefracture:['单体 / 爆发','Single target / Burst'],spacefold:['群体 / 位移 / 持续伤害','Area / Movement / Damage over time'],spaceswap:['位移 / 群体','Movement / Area'],spacecollapse:['群体 / 控制 / 爆发','Area / Control / Burst']};
export function authorityDamageCoefficients(id:string){const b=AUTHORITY_BALANCE;return id==='timecurse'?{tick:b.cursePower}:id==='timedominion'?{tick:1.2,summon:b.wraithPower}:id==='spacefracture'?{hit:b.fractureHit,detonation:b.fractureExplosion}:id==='spacefold'?{tick:1.6}:id==='spaceswap'?{hit:3}:id==='spacecollapse'?{tick:3,detonation:7}:id==='timeresurrection'?{summon:b.resurrectionPower}:{};}
