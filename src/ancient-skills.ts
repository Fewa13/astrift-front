// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {bossFormStats} from './ancient-boss-cards.js';
import type {AncientProfile,AncientWeapon} from './ancient-rules';

export const PROFESSIONS:Record<string,{name:string;en:string;icon:string;skills:string[]}>= {
 shadowblade:{name:'影刃行者',en:'Shadowblade',icon:'◈',skills:['shadowstep','shadowreturn','nightfall','riftblade']},
 stonewright:{name:'岩铸师',en:'Stonewright',icon:'⬟',skills:['faultline','stoneprison','mountainfall','stonefist']},
 swordsman:{name:'剑术师',en:'Swordmaster',icon:'⚔',skills:['triplecut','swordrain','phantomblade','swordwave']},
 warrior:{name:'战士',en:'Warrior',icon:'⚔',skills:['vitality','power','rage','slash']},
 summoner:{name:'召唤师',en:'Summoner',icon:'♜',skills:['summon','weaken','transform','soulbolt']},
 ice:{name:'冰雪法师',en:'Frost Mage',icon:'❄',skills:['icebolt','icearmor','blizzard','frostburst']},
 lightning:{name:'雷电法师',en:'Lightning Mage',icon:'ϟ',skills:['chain','haste','storm']},
 curse:{name:'诅咒法师',en:'Curse Mage',icon:'☽',skills:['hex','drain','doom']}
};
export const SKILLS:Record<string,{job:string;name:string;en:string;unlock:number;key:string;duration:number;cooldown:number}>={
 riftblade:{job:'shadowblade',name:'裂影刃',en:'Rift Blades',unlock:0,key:'X',duration:0,cooldown:4},
 shadowstep:{job:'shadowblade',name:'穿影',en:'Shadowstep',unlock:0,key:'Q',duration:0,cooldown:7},
 shadowreturn:{job:'shadowblade',name:'影返',en:'Shadow Recall',unlock:5,key:'Z',duration:6,cooldown:18},
 nightfall:{job:'shadowblade',name:'夜幕追猎',en:'Nightfall Hunt',unlock:20,key:'C',duration:8,cooldown:30},
 stonefist:{job:'stonewright',name:'碎岩拳',en:'Shatter Fist',unlock:0,key:'X',duration:0,cooldown:5},
 faultline:{job:'stonewright',name:'地脉震',en:'Faultline',unlock:0,key:'Q',duration:0,cooldown:10},
 stoneprison:{job:'stonewright',name:'岩牢',en:'Stone Prison',unlock:5,key:'Z',duration:3,cooldown:18},
 mountainfall:{job:'stonewright',name:'山岳坠',en:'Mountainfall',unlock:20,key:'C',duration:0,cooldown:26},
 frostburst:{job:'ice',name:'霜棱迸射',en:'Frost Shard Volley',unlock:0,key:'X',duration:0,cooldown:5},
 swordwave:{job:'swordsman',name:'翠锋剑气',en:'Jade Sword Wave',unlock:0,key:'X',duration:0,cooldown:5},
 triplecut:{job:'swordsman',name:'碧影三连斩',en:'Emerald Triple Slash',unlock:0,key:'Q',duration:0,cooldown:9},
 swordrain:{job:'swordsman',name:'青穹剑雨',en:'Verdant Sword Rain',unlock:5,key:'Z',duration:3,cooldown:18},
 phantomblade:{job:'swordsman',name:'苍翠天剑',en:'Celestial Phantom Blade',unlock:20,key:'C',duration:0,cooldown:24},
 slash:{job:'warrior',name:'裂地斩',en:'Sundering Slash',unlock:0,key:'X',duration:0,cooldown:6},
 soulbolt:{job:'summoner',name:'灵魂弹',en:'Soul Bolt',unlock:0,key:'X',duration:0,cooldown:6},
 vitality:{job:'warrior',name:'体质强化',en:'Vitality',unlock:0,key:'Q',duration:20,cooldown:100},
 power:{job:'warrior',name:'伤害强化',en:'Power',unlock:5,key:'Z',duration:20,cooldown:100},
 rage:{job:'warrior',name:'狂暴',en:'Berserk',unlock:20,key:'C',duration:20,cooldown:80},
 summon:{job:'summoner',name:'召唤',en:'Summon',unlock:0,key:'Q',duration:100,cooldown:100},
 weaken:{job:'summoner',name:'削弱',en:'Weaken',unlock:5,key:'Z',duration:0,cooldown:12},
 transform:{job:'summoner',name:'变身',en:'Beast Form',unlock:20,key:'C',duration:60,cooldown:120},
 icebolt:{job:'ice',name:'寒冰箭',en:'Ice Lance',unlock:0,key:'Q',duration:6,cooldown:6},
 icearmor:{job:'ice',name:'冰晶护体',en:'Ice Ward',unlock:5,key:'Z',duration:15,cooldown:50},
 blizzard:{job:'ice',name:'暴风雪',en:'Blizzard',unlock:20,key:'C',duration:6,cooldown:24},
 chain:{job:'lightning',name:'连锁闪电',en:'Chain Lightning',unlock:0,key:'Q',duration:0,cooldown:7},
 haste:{job:'lightning',name:'雷霆疾行',en:'Thunderstride',unlock:5,key:'Z',duration:10,cooldown:45},
 storm:{job:'lightning',name:'雷暴',en:'Thunderstorm',unlock:20,key:'C',duration:4,cooldown:24},
 hex:{job:'curse',name:'衰弱印记',en:'Frailty Hex',unlock:0,key:'Q',duration:10,cooldown:8},
 drain:{job:'curse',name:'生命汲取',en:'Life Drain',unlock:5,key:'Z',duration:0,cooldown:10},
 doom:{job:'curse',name:'灾厄领域',en:'Doom Field',unlock:20,key:'C',duration:8,cooldown:28}
};
export type SkillRuntime={branch?:import('./ancient-branch-combat').BranchRuntime;relic?:import('./ancient-relic-combat').RelicRuntime;gearChain?:{key:string;until:number};shadowAnchor?:{map:string;x:number;y:number;z:number;until:number};bossForm?:import('./ancient-boss-cards').BossForm;cooldowns:Record<string,number>;effects:Record<string,{until:number;level:number}>;mode:number;lastAux:number;baseHp?:number;summon?:{x:number;z:number;hp:number;maxHp:number;damage:number;until:number;attackAt:number;target:string;level:number;path?:{x:number;z:number}[];pathAt?:number;pathX?:number;pathZ?:number};lastRegen?:number};
export type SkillActor={holy?:boolean;corrupted?:boolean;name:string;x:number;y:number;z:number;hp:number;maxHp?:number;weapon:AncientWeapon;profession?:string;skills?:Record<string,number>;skillRuntime?:SkillRuntime;gearReduction?:number;boosts?:Record<string,number>;skillBaseHp?:number};
export function runtime(a:SkillActor){return a.skillRuntime??={cooldowns:{},effects:{},mode:1,lastAux:0}}
export function skillBook(id:string){return 'skillbook:'+id}
export function skillBookName(key:string,english=false){const id=key.slice(10);if(!key.startsWith('skillbook:')||!Object.hasOwn(SKILLS,id))return null;const s=SKILLS[id];return (english?PROFESSIONS[s.job].en:PROFESSIONS[s.job].name)+'-'+(english?s.en:s.name)+(english?' Skill Book':'技能书')}
export function skillRadius(id:string,level:number,holy=false){const base:Record<string,number>={riftblade:2,shadowstep:2,shadowreturn:3,nightfall:5,stonefist:2,faultline:4,stoneprison:4,mountainfall:6,frostburst:2,slash:4,power:7,rage:7,icearmor:6,blizzard:6,haste:6,storm:5,doom:6,swordwave:2,swordrain:3,phantomblade:5};return base[id]===undefined?0:(base[id]+Math.max(0,level-1)*.5)*(holy?1.5:1)}
export function skillCooldown(id:string,level:number){return id==='vitality'||id==='power'?Math.max(50,100-level*2):SKILLS[id]?.cooldown||0}
export function ensureBasicSkills(p:AncientProfile){const id=p.profession==='shadowblade'?'riftblade':p.profession==='stonewright'?'stonefist':p.profession==='swordsman'?'swordwave':p.profession==='warrior'?'slash':p.profession==='summoner'?'soulbolt':p.profession==='ice'?'frostburst':null;if(!id||p.skills?.[id]!==undefined)return false;(p.skills??={})[id]=1;return true}
export function skillTrainingCost(current:number){const next=current+1;return {books:2**current,cores:current>0?next:0,coins:current>0?50*next**2:0}}
export function trainSkill(p:AncientProfile,id:string){const s=Object.hasOwn(SKILLS,id)?SKILLS[id]:undefined;if(!s||p.profession!==s.job)return '职业不匹配';if(p.level<s.unlock)return '玩家等级不足';const next=(p.skills?.[id]||0)+1,cost=skillTrainingCost(next-1);if(!Object.values(cost).every(Number.isSafeInteger))return '技能等级已达上限';const key=skillBook(id);if((p.materials[key]||0)<cost.books)return '技能书不足';if((p.materials.core||0)<cost.cores)return '相位核心不足';if((p.coins||0)<cost.coins)return '远古金币不足';p.materials[key]-=cost.books;if(cost.cores)p.materials.core-=cost.cores;if(cost.coins)p.coins=Math.round((p.coins-cost.coins)*100)/100;(p.skills??={})[id]=next;return null}
export function skillDescription(id:string,n:number,en=false){const level=Math.max(1,n),cd=skillCooldown(id,level);const texts:Record<string,[string,string]>={
 riftblade:[`20米裂影双刃，总计${300+25*level}%基础攻击伤害；冷却4秒。自带1级，按X使用。`,`20m twin rift blades: ${300+25*level}% base attack damage in total. Cooldown 4s. Starts at level 1; press X.`],
 shadowstep:[`沿朝向突进最多10米，沿途敌人各受一次${260+22*level}%基础攻击伤害；不能穿墙，冷却7秒。`,`Dash up to 10m forward; each enemy along the path takes ${260+22*level}% base attack damage once. Cannot cross walls. Cooldown 7s.`],
 shadowreturn:[`留下6秒残影并向后闪避最多6米，周围造成${220+20*level}%基础攻击伤害；6秒内再次按Z沿直线返回，终点再次斩击。墙体会阻挡返回；冷却18秒。`,`Leave a 6s afterimage and retreat up to 6m, dealing ${220+20*level}% base attack damage nearby. Recast Z within 6s to return along a straight path and slash again. Walls stop the return. Cooldown 18s.`],
 nightfall:[`周围斩击造成${400+35*level}%基础攻击伤害；8秒内伤害+25%、移速+30%，使用穿影后冷却降为3秒；冷却30秒。`,`Nearby slashes deal ${400+35*level}% base attack damage. For 8s: +25% damage, +30% speed, Shadowstep cooldown becomes 3s. Cooldown 30s.`],
 stonefist:[`20米碎岩重拳，造成${320+30*level}%基础攻击范围伤害；冷却5秒。自带1级，按X使用。`,`20m stone fist: ${320+30*level}% base attack area damage. Cooldown 5s. Starts at level 1; press X.`],
 faultline:[`锁定25米内敌人，地脉连续爆发3次，每次${180+15*level}%基础攻击伤害；冷却10秒。`,`Lock an enemy within 25m: three ground eruptions, each ${180+15*level}% base attack damage. Cooldown 10s.`],
 stoneprison:[`25米岩牢造成${300+30*level}%基础攻击伤害，减速60%持续3秒（头目减半）；3秒后坍塌再造成${200+20*level}%伤害。岩柱不阻挡玩家；冷却18秒。`,`25m stone prison: ${300+30*level}% base attack damage and 60% slow for 3s (half on bosses), then collapses for ${200+20*level}%. Pillars do not block players. Cooldown 18s.`],
 mountainfall:[`锁定25米内敌人，巨岩手臂蓄势0.65秒后砸下，造成${700+60*level}%基础攻击伤害，随后3次裂地震荡各${80+6*level}%；冷却26秒。`,`Lock an enemy within 25m: a colossal stone arm slams after 0.65s for ${700+60*level}% base attack damage, followed by three fractures at ${80+6*level}% each. Cooldown 26s.`],
 swordwave:[`30米剑气，造成${300+25*level}%基础攻击伤害；冷却5秒。转职后自带1级，按X使用`,`30m sword wave: ${300+25*level}% base attack damage. Cooldown 5s. Starts at level 1; press X.`],
 triplecut:[`锁定15米内敌人连斩3次，首刀${330+30*level}%基础攻击伤害，第二刀50%、第三刀25%首刀伤害；冷却9秒`,`Lock an enemy within 15m: three slashes. First: ${330+30*level}% base attack damage; second: 50%, third: 25% of the first. Cooldown 9s.`],
 swordrain:[`锁定30米内敌人，3秒内落下6轮剑雨，每轮${140+16*level}%基础攻击伤害；冷却18秒`,`Lock an enemy within 30m: six sword-rain strikes over 3s, each ${140+16*level}% base attack damage. Cooldown 18s.`],
 phantomblade:[`锁定30米内敌人，巨剑投影蓄势0.5秒后斩下，造成${845+78*level}%基础攻击伤害；冷却24秒`,`Lock an enemy within 30m: a giant spectral sword strikes after 0.5s for ${845+78*level}% base attack damage. Cooldown 24s.`],
 slash:[`12米裂地斩，目标周围${skillRadius('slash',level)}米造成${320+30*level}%基础攻击伤害；冷却6秒。转职后自带1级，按X使用`,`12m slash: ${320+30*level}% base attack damage in a ${skillRadius('slash',level)}m area. Cooldown 6s. Starts at level 1; press X.`],
 soulbolt:[`30米灵魂弹，造成${330+30*level}%基础攻击伤害，同时指挥召唤兽追击；冷却6秒。转职后自带1级，按X使用`,`30m soul bolt: ${330+30*level}% base attack damage; marks the target for your beast. Cooldown 6s. Starts at level 1; press X.`],
 frostburst:[`30米霜棱迸射，造成${260+25*level}%基础攻击伤害，半径${skillRadius('frostburst',level)}米；冷却5秒。自带1级，按X使用。`,`30m shard volley: ${260+25*level}% base attack damage in a ${skillRadius('frostburst',level)}m radius. Cooldown 5s. Starts at level 1; press X.`],
 vitality:[`20秒内血量上限 +${3*level}%，每秒恢复最大血量 ${level}%；冷却 ${cd}秒`,`20s: +${3*level}% max HP, heal ${level}% max HP/s. Cooldown ${cd}s.`],
 power:[`释放时${skillRadius('power',level)}米震荡，造成${300+30*level}%基础攻击伤害；20秒内伤害 +${2*level}%；冷却 ${cd}秒`,`${skillRadius('power',level)}m shockwave: ${300+30*level}% base attack damage. 20s: +${2*level}% damage. Cooldown ${cd}s.`],
 rage:[`释放时${skillRadius('rage',level)}米震荡，造成${400+40*level}%基础攻击伤害；20秒内受伤 +100%，伤害 +${30*level}%，速度 +${20*level}%；冷却80秒`,`${skillRadius('rage',level)}m shockwave: ${400+40*level}% base attack damage. 20s: +100% incoming damage, +${30*level}% damage, +${20*level}% speed. Cooldown 80s.`],
 summon:[`铁甲兽血量和攻击为玩家基础值 ${75+5*level}%，在场100秒。按1主手/2锁定印记，射中怪物指挥铁甲兽攻击。消失后冷却100秒`,`Armored Beast: ${75+5*level}% base player HP and base attack damage, lasts 100s. 1 melee / 2 command sigil; hit a monster to mark it. Cooldown 100s after it disappears.`],
 weaken:[`削弱印记命中：造成${280+30*level}%基础攻击伤害，攻击 -${Math.min(80,5*level)}%，持续${level*8}秒，冷却12秒。按1主手/2削弱印记；有召唤兽时削弱印记为3`,`Weakening sigil: ${280+30*level}% base attack damage, -${Math.min(80,5*level)}% enemy damage for ${level*8}s. Cooldown 12s. 1 melee / 2 weakening sigil (3 while beast is active).`],
 transform:[`60秒兽形态，血量上限 +${Math.min(100,20+4*level)}%，爪伤为基础攻击伤害 ${125+10*level}%，速度 +${Math.min(40,10+2*level)}%，受伤 -${Math.min(35,10+level)}%。禁用枪械，1为爪子；冷却120秒`,`60s beast form: +${Math.min(100,20+4*level)}% max HP, claws ${125+10*level}% base attack damage, +${Math.min(40,10+2*level)}% speed, -${Math.min(35,10+level)}% incoming damage. No firearms; 1 claws. Cooldown 120s.`],
 icebolt:[`30米寒冰箭，造成${300+30*level}%基础攻击伤害，减速${Math.min(60,20+2*level)}%持续6秒，冷却6秒`,`30m ice lance: ${300+30*level}% base attack damage, ${Math.min(60,20+2*level)}% slow for 6s. Cooldown 6s.`],
 icearmor:[`释放时${skillRadius('icearmor',level)}米冰霜新星，造成${300+30*level}%基础攻击伤害，减速35%持续4秒（头目减半）；15秒内受伤 -${Math.min(50,15+2*level)}%，冷却50秒`,`${skillRadius('icearmor',level)}m frost nova: ${300+30*level}% base attack damage, 35% slow for 4s (half on bosses). 15s: -${Math.min(50,15+2*level)}% incoming damage. Cooldown 50s.`],
 blizzard:[`30米目标周围${skillRadius('blizzard',level)}米暴风雪6秒，每秒${125+10*level}%基础攻击伤害，减速${Math.min(60,25+level)}%（头目减半）；冷却24秒`,`30m target: ${skillRadius('blizzard',level)}m blizzard for 6s, ${125+10*level}% base attack damage/s, ${Math.min(60,25+level)}% slow (half on bosses). Cooldown 24s.`],
 chain:[`30米首目标，连锁最多${level+2}个目标、连锁直径${16+level-1}米，首个${300+30*level}%基础攻击伤害，后续跳跃各减25%；冷却7秒`,`30m first target: up to ${level+2} enemies, ${16+level-1}m chain diameter, ${300+30*level}% base attack damage on the first, -25% each jump. Cooldown 7s.`],
 haste:[`向前突进最多15米，沿途半径${skillRadius('haste',level)}米内每个怪物受击一次，造成${300+30*level}%基础攻击伤害；10秒速度 +${Math.min(40,15+2*level)}%，攻击间隔 -${Math.min(25,8+level)}%；冷却45秒`,`Dash forward up to 15m; hit each enemy within ${skillRadius('haste',level)}m of the path once: ${300+30*level}% base attack damage. 10s: +${Math.min(40,15+2*level)}% speed, -${Math.min(25,8+level)}% attack interval. Cooldown 45s.`],
 storm:[`30米目标周围${skillRadius('storm',level)}米雷暴4秒，每秒${160+15*level}%基础攻击伤害；冷却24秒`,`30m target: ${skillRadius('storm',level)}m storm for 4s, ${160+15*level}% base attack damage/s. Cooldown 24s.`],
 hex:[`30米目标受到${320+30*level}%基础攻击伤害；10秒攻击 -${Math.min(40,10+2*level)}%，受伤 +${Math.min(30,8+level)}%；冷却8秒`,`30m hex: ${320+30*level}% base attack damage; -${Math.min(40,10+2*level)}% enemy damage, +${Math.min(30,8+level)}% damage taken for 10s. Cooldown 8s.`],
 drain:[`20米汲取，造成${400+40*level}%基础攻击伤害，回复实际伤害30%（最多最大血量20%）；冷却10秒`,`20m drain: ${400+40*level}% base attack damage, heal 30% actual damage (max 20% max HP). Cooldown 10s.`],
 doom:[`30米目标周围${skillRadius('doom',level)}米领域8秒，每秒${80+8*level}%基础攻击伤害，攻击 -${Math.min(40,10+level)}%；冷却28秒`,`30m target: ${skillRadius('doom',level)}m field for 8s, ${80+8*level}% base attack damage/s, -${Math.min(40,10+level)}% enemy damage. Cooldown 28s.`]
 };const text=texts[id]?.[en?1:0]||'',radius=skillRadius(id,level);return text+(radius?(en?` Area radius: ${radius}m (+0.5m per skill level).`:` 作用半径：${radius}米（每升一级+0.5米）。`):'')}
export function activeSkill(a:SkillActor,id:string,now=Date.now()){const e=a.skillRuntime?.effects[id];return e&&e.until>now?e.level:0}
export function skillDamageMultiplier(a:SkillActor,now=Date.now()){return (a.corrupted?1.3:1)*((a.boosts?.damage||0)>now?2:1)*(activeSkill(a,'nightfall',now)?1.25:1)*(1+activeSkill(a,'power',now)*.02)*(1+activeSkill(a,'rage',now)*.3)*(1+(bossFormStats(a,now)?.damage||0))}
export function skillSpeedMultiplier(a:SkillActor,now=Date.now()){const t=activeSkill(a,'transform',now),h=activeSkill(a,'haste',now);return (activeSkill(a,'nightfall',now)?1.3:1)*(1+activeSkill(a,'rage',now)*.2)*(t?1+Math.min(.4,.1+.02*t):1)*(h?1+Math.min(.4,.15+.02*h):1)*(1+(bossFormStats(a,now)?.speed||0))}
export function skillFireMultiplier(a:SkillActor,now=Date.now()){const h=activeSkill(a,'haste',now);return h?1-Math.min(.25,.08+.01*h):1}
export function skillIncoming(a:SkillActor,now=Date.now()){const t=activeSkill(a,'transform',now),i=activeSkill(a,'icearmor',now);return ((a.boosts?.defense||0)>now?.5:1)*(1-(a.gearReduction||0))*(activeSkill(a,'rage',now)?2:1)*(t?1-Math.min(.35,.1+.01*t):1)*(i?1-Math.min(.5,.15+.02*i):1)*(1-(bossFormStats(a,now)?.reduction||0))}
export function skillHealth(a:SkillActor,base:number,now:number){const t=activeSkill(a,'transform',now);a.skillBaseHp=base;runtime(a).baseHp=base;a.maxHp=Math.floor(base*(1+activeSkill(a,'vitality',now)*.03+(t?Math.min(1,.2+.04*t):0))*(1+(bossFormStats(a,now)?.health||0)));a.hp=Math.min(a.hp,a.maxHp)}
export function skillDrops(kind:string,random=Math.random){const boss=kind==='sky_sovereign'||kind==='thunder_warden'||kind==='frost_crowned'||kind==='furnace_regent'||kind==='starbound_heart'||kind==='immaculate_judge'||kind==='blight_lord'||kind==='oathknight'||kind==='emptyking'||kind==='chief'||kind==='lord'||kind==='rootwarden'||['metal','wood','water','fire','earth'].some(e=>kind==='crystal_'+e);if(!boss)return {};const ids=Object.keys(SKILLS),id=ids[Math.min(ids.length-1,Math.floor(random()*ids.length))];return {[skillBook(id)]:1}}
