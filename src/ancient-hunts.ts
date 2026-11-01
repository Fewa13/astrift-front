// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {AncientProfile} from './ancient-rules';
export type HuntSlot='weapon'|'helmet'|'armor'|'wings';
export type HuntRun={id:string;rank:number;round:number;quality:number;choices:Record<string,HuntSlot>;device?:{x:number;z:number;hp:number;maxHp:number};adds?:boolean};
export const HUNTS=[
 {id:'quarry',name:'追猎凶兽',en:'Track the Ravager',level:10,kind:'contract',description:['清除斥候，迎战追来的裂骨凶兽。','Defeat the scouts, then face the pursuing ravager.']},
 {id:'encircle',name:'精英围猎',en:'Elite Encirclement',level:15,kind:'contract',description:['突破远近混合的两波围猎，再击败猎队首领。','Break two mixed melee/ranged packs, then defeat their huntmaster.']},
 {id:'beacon',name:'守卫营地',en:'Hold the Beacon',level:15,kind:'contract',description:['守住营地信标，击退三波袭击；突袭者会直接攻击信标。','Protect the camp beacon through three waves. Raiders attack the beacon itself.']},
 {id:'karok',name:'裂骨·卡洛克',en:'Karok, Bonebreaker',level:20,kind:'nemesis',description:['图腾重击与扇形横扫；进阶加入落点追击，大师召来援军。','Totem slams and sweeping blows. Higher ranks add marked strikes, then reinforcements.']},
 {id:'serahn',name:'荆冠·瑟拉恩',en:'Serahn, Thorncrown',level:40,kind:'nemesis',description:['根脉重击与荆棘领域；进阶加入落点追击，大师召来援军。','Root slams and thorn fields. Higher ranks add marked strikes, then reinforcements.']}
] as const;
export const HUNT_RANKS=[['初遇','First Encounter'],['追击','Pursuit'],['决战','Final Confrontation']];
export const HUNT_SLOTS:Record<HuntSlot,[string,string]>={weapon:['武器','Weapon'],helmet:['头盔','Helmet'],armor:['护甲','Armor'],wings:['羽翼','Wings']};
export function huntDefinition(id:unknown){return HUNTS.find(h=>h.id===id)}
export function huntLevel(id:string,rank=0){const h=huntDefinition(id);return h?(h.level+(h.kind==='nemesis'?[0,10,25][rank]||0:0)):0}
export function huntQuality(level:number){return level<30?2:3}
export function huntTokens(h:HuntRun){return huntDefinition(h.id)?.kind==='nemesis'?3+h.rank:2}
// Each completed nemesis run rolls once; seal rewards remain first-clear only.
export function nemesisGearQuality(rank:number,level:number,random=Math.random){const roll=random();return roll<.30?1:roll<.42?2:rank>=1&&level>=30&&roll<.45?3:0}
export const RELICS=[
 {id:'warrior',name:'战吼余锋',en:'Warcry Echo',effect:['裂地斩命中后，原落点在0.6秒后产生一次35%威力的回响。','Ground Slash leaves a 35%-power echo at its impact after 0.6s.']},
 {id:'summoner',name:'奔猎兽契',en:'Pursuer Pact',effect:['灵魂弹命中后，召唤兽获得4秒追猎加速，并在命中点产生一次35%威力的兽魂冲击。','Soul Bolt grants your summon 4s of pursuit speed and a 35%-power spirit impact at the target.']},
 {id:'ice',name:'留霜之眼',en:'Eye of Lingering Frost',effect:['冰霜弹在命中点留下3秒霜域，每秒造成普攻技能基础威力的15%伤害并减速。','Ice Bolt leaves a 3s frost field, dealing 15% of skill attack power each second and slowing enemies.']},
 {id:'lightning',name:'蓄雷棱晶',en:'Stormcharge Prism',effect:['连锁雷电留下8秒雷印；下一个其他伤害技能命中后引爆雷印，造成该次伤害35%的小范围冲击。','Chain Lightning marks enemies for 8s. Your next different damaging skill detonates each hit mark for a small 35%-power blast.']},
 {id:'curse',name:'蔓咒之页',en:'Page of Contagion',effect:['汲取命中被诅咒削弱的敌人时，将35%伤害与削弱传播给附近最多2名敌人。','Drain spreads 35% damage and weakness from a hexed enemy to up to 2 nearby foes.']},
 {id:'swordsman',name:'逐影剑匣',en:'Pursuing Sword Casket',effect:['剑雨改为跟随锁定目标，六轮剑雨逐轮重新判定目标附近敌人；目标死亡后落在最后位置。','Sword Rain follows its target and checks nearby foes on each of its six strikes; on death it stays at the last location.']},
 {id:'shadowblade',name:'残影裂片',en:'Afterimage Shard',effect:['暗影突袭在起点留下残影，0.8秒后爆发一次50%技能攻击力的裂隙伤害。','Shadow Step leaves an afterimage at its origin, bursting after 0.8s for 50% of skill attack power.']},
 {id:'stonewright',name:'复震岩心',en:'Aftershock Heart',effect:['岩牢落点在1.5秒后再次震荡，造成60%技能攻击力的范围伤害。','Stone Prison creates a second area shock after 1.5s for 60% of skill attack power.']}
] as const;
export const RELIC_COST=8;
export function activeRelic(p:AncientProfile){return p.relic&&p.relic===p.profession&&p.relics?.includes(p.relic)?p.relic:undefined}
