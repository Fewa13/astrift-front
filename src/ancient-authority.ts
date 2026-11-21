// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {AncientProfile} from './ancient-rules';
export const AUTHORITY_MAPS=['tribe','forest','city','blight','sanctum','starfall','frostcourt','skyreach','dunes'] as const;
export const AUTHORITY_MAP_NAMES:Record<string,[string,string]>={tribe:['部落','Tribe'],forest:['森林','Forest'],city:['失落王城','Lost Royal City'],blight:['蚀影荒原','Shadowblight Wastes'],sanctum:['净界圣域','Sanctum of the Veil'],starfall:['沉星遗境','Sunken Star Ruins'],frostcourt:['霜烬王庭','Frostfire Court'],skyreach:['寂雷天穹','Silent Storm Skyreach'],dunes:['暮沙迷城','Duskglass Labyrinth']};
export const AUTHORITY_JOBS={timelord:{name:'时间之主',en:'Lord of Time',source:'chrono',icon:'◷'},spacelord:{name:'空间之主',en:'Lord of Space',source:'voidsword',icon:'⟐'}} as const;
export type AuthorityJob=keyof typeof AUTHORITY_JOBS;
export const isAuthorityJob=(id:string):id is AuthorityJob=>Object.hasOwn(AUTHORITY_JOBS,id);
export type AuthorityProgress={tokens:string[];submitted?:boolean;unlocked?:boolean;day?:string;attempts?:number;wraiths?:number;essence?:number;timeRevision?:number;retiredArmy?:{wraiths:number;essence:number}};
export const AUTHORITY_SKILLS={
 timelord:[['timecurse','岁月侵蚀','Age Acceleration','X',5],['timedominion','时间领域','Time Dominion','Q',26],['timeflow','时间回流','Temporal Reflow','Z',35],['timeresurrection','万象重演','Temporal Reprise','C',40]],
 spacelord:[['spacefracture','空间断层','Spatial Fracture','X',4],['spacefold','折叠领域','Folded Dominion','Q',22],['spaceswap','空间置换','Spatial Exchange','Z',12],['spacecollapse','空间坍缩','Spatial Collapse','C',36]],
} as const;
export const AUTHORITY_BALANCE={damage:60,fractureHit:8,fractureExplosion:12,fractureSplash:3,history:120000,domainRadius:22,domainDuration:18000,deprivationDuration:8000,deprivation:.2,curseDuration:18000,curseTick:1000,cursePower:1.3,reflowBonus:.2,reflowDuration:10000,trialOffsets:[0,5,10,20],trialAttempts:2,trialMinutes:30,trialReaction:1000,trialBaseSpeed:6,safeRadius:2.2} as const;
export const TIME_LORD={revision:2,recordInterval:500,maxHistory:512,maxQueue:1024,
 acceleration:(level:number)=>Math.min(8,3+.08*(level-1)),cursePower:1.3,agingSpread:(level:number)=>Math.min(9,5+.04*(level-1)),
 stopDuration:(level:number)=>Math.min(12000,5000+100*(level-1)),stopRadius:(level:number)=>Math.min(30,22+.12*(level-1)),bossSlow:.8,
 rewindShield:(level:number)=>Math.min(.35,.15+.002*(level-1)),shieldDuration:6500,
 echoWindow:(level:number)=>Math.min(14000,8000+100*(level-1)),echoDuration:(level:number)=>Math.min(14000,8000+80*(level-1)),
 echoCopies:(level:number)=>Math.min(4,2+Math.floor((level-1)/15)),echoRatio:(level:number)=>Math.min(.6,.3+.003*(level-1)),echoDelay:400,echoSpacing:800,echoGrace:14000,
};
export function migrateTimeLord(p:AncientProfile){const progress=p.authority?.timelord;if(!progress||progress.timeRevision===TIME_LORD.revision)return false;if(progress.wraiths!==undefined||progress.essence!==undefined)progress.retiredArmy={wraiths:progress.wraiths||0,essence:progress.essence||0};delete progress.wraiths;delete progress.essence;progress.timeRevision=TIME_LORD.revision;return true;}

export const authorityDay=(now=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
export function authorityProgress(p:AncientProfile,job:AuthorityJob){return (p.authority??={})[job]??={tokens:[],...(job==='timelord'?{timeRevision:2}:{})};}
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
 timecurse:['让目标经历加速的岁月，18次侵蚀伤害以3倍起的时间速度结算；同时加快目标已有的持续伤害，不复制伤害总量。升级提升侵蚀伤害与加速倍率。','Accelerate the target through 18 aging ticks at 3× time speed or faster. Existing damage-over-time ticks also occur sooner without duplicating their total damage. Levels increase aging damage and acceleration.'],
 timedominion:['展开大型时停领域：普通敌人暂停行动，受到的攻击暂存并在时间恢复时结算；BOSS大幅减速。领域内命中的岁月侵蚀会同步影响附近敌人。升级延长时停并扩大范围。','Create a large time-stop field: ordinary enemies stop acting, and incoming damage waits until time resumes. Bosses are heavily slowed. Age Acceleration spreads to nearby enemies when it hits inside this field. Levels increase duration and radius.'],
 timeflow:['恢复过去2分钟内最高的生命状态，并返回当时位置；清除负面状态并短暂增伤。生命已满时获得时间护盾。不会重置技能冷却、消耗品或敌人生命。','Restore your highest health from the past two minutes and return to that position. Cleanse debuffs and briefly increase damage; if already at peak health, gain a temporal shield. Never resets cooldowns, consumables or enemy health.'],
 timeresurrection:['过去与未来的自身残影重演近期有效攻击；持续期间的新攻击也会在短暂延迟后重演一次。残影不复制治疗、消耗品、奖励或冷却刷新，不能再次生成回响。升级增强重演比例、次数与可操纵的时间长度。','Past and future silhouettes replay recent successful attacks. New attacks during the effect also replay once after a short delay. Echoes never copy healing, consumables, rewards or cooldown resets, and cannot create more echoes. Levels improve replay power, count and temporal reach.'],
 spacefracture:['发出空间断层，命中留下裂痕，再次命中引爆并波及附近敌人。','Launch a spatial fracture. Hits leave a mark; another hit detonates it and damages nearby enemies.'],
 spacefold:['展开折叠领域与双向星门，走入星门即可穿越至另一端。领域持续切割，并将部分伤害传导至其他目标。','Fold the battlefield into a cutting domain with two linked gates. Walk through either to emerge at the other. Part of its damage is relayed between enemies.'],
 spaceswap:['向瞄准位置传送并留下坐标，再次释放返回；出发与抵达位置同时震荡。','Teleport toward your aim and leave a coordinate. Recast to return; both departure and arrival release shockwaves.'],
 spacecollapse:['压缩目标区域，普通敌人被牵引，BOSS受到强力减速。多层切面连续伤害后引爆全部空间印记。','Compress an area, pulling ordinary enemies and heavily slowing bosses. Layered cuts culminate in a detonation of spatial marks.'],
};

export const AUTHORITY_TYPES:Record<string,[string,string]>={timecurse:['单体 / 持续伤害 / 加速','Single target / Damage over time / Acceleration'],timedominion:['群体 / 停滞 / 延迟结算','Area / Stasis / Delayed damage'],timeflow:['恢复 / 位移 / 增益','Healing / Movement / Buff'],timeresurrection:['重演 / 爆发','Replay / Burst'],spacefracture:['单体 / 爆发','Single target / Burst'],spacefold:['群体 / 位移 / 持续伤害','Area / Movement / Damage over time'],spaceswap:['位移 / 群体','Movement / Area'],spacecollapse:['群体 / 控制 / 爆发','Area / Control / Burst']};
export function authorityDamageCoefficients(id:string){const b=AUTHORITY_BALANCE;return id==='timecurse'?{tick:b.cursePower}:id==='timedominion'?{}:id==='spacefracture'?{hit:b.fractureHit,detonation:b.fractureExplosion}:id==='spacefold'?{tick:1.6}:id==='spaceswap'?{hit:3}:id==='spacecollapse'?{tick:3,detonation:7}:id==='timeresurrection'?{}:{};}
