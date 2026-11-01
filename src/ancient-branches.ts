// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {AncientProfile} from './ancient-rules';
export type Branch={id:string;name:string;en:string;description:[string,string]};
const extensions:Record<string,[string,string]>={
 bloodrage:['体质强化同时释放近身血气冲击，命中也能吸血。','Vitality also releases a close-range blood pulse that can trigger life steal.'],
 earthshaker:['体质强化也释放近身冲击，并触发震波。','Vitality also releases a close-range impact that triggers the shockwave.'],
 beastlord:['所有技能都会唤出兽魂追击；有铁甲兽时同时指挥它优先攻击目标。变身爪击和削弱印记命中也生效。','Every skill calls a beast-soul follow-up and commands your active beast to prioritize the target. Transformation claws and Weakening Sigil hits also trigger it.'],
 spiritpack:['所有技能都会唤出两只灵兽虚影追击，变身爪击和削弱印记命中也生效。','Every skill calls two spirit echoes; transformation claws and Weakening Sigil hits also trigger them.'],
 iceedge:['所有冰雪技能的首次命中均可向目标身后传递冰锋。','The first hit of every frost skill can send ice blades through enemies behind the target.'],
 heavenwrath:['雷行与雷暴也会额外引下两次落雷回响，每次施法各触发一次。','Thunder Stride and Thunderstorm also call two lightning echoes, once per cast.'],
 thunderfield:['雷行首次命中也会向附近最多3个敌人传递电弧。','Thunder Stride’s first hit also sends arcs to up to 3 nearby enemies.'],
 swiftshade:['现在所有剑术技能都会自动追加两次剑痕追击，每次施法只触发一次。','All sword skills now add two automatic sword echoes, only once per cast.'],
 heavenblade:['现在所有剑术技能都会留下剑印，延迟落下一把天剑，每次施法只触发一次。','All sword skills now leave a sword seal followed by a delayed celestial blade, only once per cast.'],
 pursuer:['所有影刃技能的首次命中都会追加残影斩。','The first hit of every shadow skill adds an afterimage slash.'],
 nightreaper:['所有影刃技能的首次命中都会向附近敌人扩散影刃。','The first hit of every shadow skill spreads shadow blades to nearby enemies.'],
 rockbreaker:['所有岩系技能的首次命中都会追加一次延迟碎岩冲击。','The first hit of every earth skill adds a delayed shattering impact.'],
 earthwarden:['所有岩系技能的首次命中都会触发附近余震。','The first hit of every earth skill triggers nearby aftershocks.']
};
const route=(id:string,name:string,en:string,zh:string,eng:string):Branch=>({id,name,en,description:[zh+(extensions[id]?' '+extensions[id][0]:''),eng+(extensions[id]?' '+extensions[id][1]:'')]});
export const PROFESSION_BRANCHES:Record<string,Branch[]>={
 warrior:[route('bloodrage','血怒','Bloodrage','技能伤害+15%，并回复实际伤害的4%生命；每次回复不超过生命上限的3%。','Skills deal 15% more damage  and heal 4% of actual damage, capped at 3% max HP per hit.'),route('earthshaker','震岳','Earthshaker','技能伤害-10%，但第一次命中会向5米内最多4个敌人传递35%震波伤害。','Skills deal 10% less damage; the first hit sends a 35% shockwave to up to 4 other enemies within 5m.')],
 summoner:[route('beastlord','御兽','Beastlord','铁甲兽生命+30%，攻击+25%；灵魂弹命中会指挥铁甲兽攻击。','Your beast gains 30% HP and 25% attack. Soul Bolt commands it to attack.'),route('spiritpack','兽群','Spirit Pack','铁甲兽单次攻击降为80%，每次攻击自动唤出两次灵兽虚影追击，各造成原攻击的25%伤害。','Beast hits deal 80% damage and automatically trigger two spirit echoes, each dealing 25% of its original attack.')],
 ice:[route('frostprison','霜狱','Frost Prison','技能命中累积寒意：第3次短暂冻结，第4次自动碎冰，造成60%本次伤害的范围爆发；同一目标每6秒触发一次。头目只受减速，碎冰伤害不变。','Skill hits build Chill: hit 3 briefly freezes, hit 4 automatically shatters for a 60% area burst. 6s per-target cooldown. Bosses are slowed instead; shatter damage is unchanged.'),route('iceedge','冰锋','Ice Edge','寒冰箭与霜棱迸射对首个目标伤害+25%，并向身后直线最多2个可见敌人传递40%伤害。','Ice Lance and Frost Shard Volley deal 25% more damage and pierce up to 2 visible enemies behind it for 40% damage.')],
 lightning:[route('heavenwrath','天罚','Heaven’s Wrath','连锁闪电最多攻击2个目标，主目标额外承受2次各35%的落雷回响；雷暴范围缩小为70%，伤害+25%。','Chain Lightning hits at most 2 targets; two delayed lightning echoes hit the primary target for 35% each. Thunderstorm has 70% radius and 25% more damage.'),route('thunderfield','雷域','Thunderfield','连锁闪电多传导3个目标，连锁距离+35%，单次伤害-10%；雷暴范围+35%，单次伤害-10%。','Chain Lightning gains 3 targets and 35% link reach, with 10% less damage per hit. Thunderstorm gains 35% radius with 10% less damage.')],
 curse:[route('souleater','蚀魂','Soul Eater','技能命中叠加魂蚀，第3次自动引爆60%本次伤害；同一目标每5秒一次。','Skills build Soul Erosion; every third hit automatically detonates for 60% of that hit’s damage. 5s per-target cooldown.'),route('calamity','灾厄','Calamity','技能伤害-10%；每次施法的首次命中向6米内最多4个敌人传播30%咒爆。','Skills deal 10% less damage; the first hit of each cast spreads a 30% curse burst to up to 4 other enemies within 6m.')],
 swordsman:[route('swiftshade','疾影','Swiftshade','三连斩命中后自动追加2次各20%剑痕追击；三连斩与翠锋剑气冷却缩短20%。','Triple Slash automatically adds two sword echoes at 20% damage each. Triple Slash and Jade Sword Wave cooldowns are reduced by 20%.'),route('heavenblade','天剑','Heavenblade','剑雨与天剑范围+35%；剑雨最后自动追加一次35%终结斩，天剑伤害+15%。','Sword Rain and Celestial Phantom Blade gain 35% radius. Sword Rain ends with a 35% finishing strike; Phantom Blade deals 15% more damage.')],
 shadowblade:[route('pursuer','追影','Pursuer','穿影与裂影刃冷却缩短20%，首次命中追加一次25%残影斩。','Shadowstep and Rift Blades have 20% shorter cooldowns and add a delayed 25% afterimage strike on the first hit.'),route('nightreaper','夜刈','Night Reaper','夜幕追猎和裂影刃范围+35%；夜幕追猎首次命中向附近最多4个敌人追加35%影刃。','Nightfall Hunt and Rift Blades gain 35% radius. Nightfall’s first hit sends 35% shadow blades to up to 4 nearby enemies.')],
 stonewright:[route('rockbreaker','裂岳','Mountainbreaker','碎岩拳和山岳坠伤害+20%，范围缩小为80%。','Shatter Fist and Mountainfall deal 20% more damage with 80% radius.'),route('earthwarden','地脉','Earth Warden','地脉震与岩牢范围+35%；首次命中自动追加30%余震，作用于附近最多4个敌人。','Faultline and Stone Prison gain 35% radius; their first hit sends a 30% aftershock to up to 4 nearby enemies.')]
};
export function activeBranch(p:AncientProfile){const id=p.profession&&p.branches?.[p.profession];return id&&PROFESSION_BRANCHES[p.profession!]?.some(b=>b.id===id)?id:'';}
export function chooseBranch(p:AncientProfile,job:string,id:string){
 if(p.level<30)return 'Requires player level 30.';
 if(job!==p.profession||!Object.hasOwn(PROFESSION_BRANCHES,job)||!PROFESSION_BRANCHES[job].some(b=>b.id===id))return 'Invalid profession branch.';
 if(p.branches?.[job])return 'This profession already has a permanent branch.';
 if(!p.branchGuides?.[job])return 'Speak to Gruk in the Tribe first.';
 (p.branches??={})[job]=id;return null;
}
export function branchRadius(p:AncientProfile,id:string){const b=activeBranch(p);return b==='heavenwrath'&&id==='storm'?.7:b==='thunderfield'&&id==='storm'||b==='heavenblade'&&['swordrain','phantomblade'].includes(id)||b==='nightreaper'&&['nightfall','riftblade'].includes(id)||b==='earthwarden'&&['faultline','stoneprison'].includes(id)?1.35:b==='rockbreaker'&&['stonefist','mountainfall'].includes(id)?.8:1;}
export function branchCooldown(p:AncientProfile,id:string){const b=activeBranch(p);return b==='swiftshade'&&['triplecut','swordwave'].includes(id)||b==='pursuer'&&['shadowstep','riftblade'].includes(id)?.8:1;}
