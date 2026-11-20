// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
type Localized = readonly [zh: string, en: string];
type Route = {id: string; name: Localized; skills: readonly [Localized, Localized, Localized, Localized]};

const route = (id: string, name: Localized, ...skills: Route['skills']): Route => ({id, name, skills});

// Skills are ordered by X, Q, Z, C for inheritance from the original profession.
export const ADVANCED_PROFESSIONS: Readonly<Record<string, readonly [Route, Route]>> = {
 warrior: [
  route('berserker',['狂战士','Berserker'],['嗜血飞弹','Bloodseeker Bolt'],['献祭','Sacrifice'],['冲锋','Charge'],['浴血重生','Blood Rebirth']),
  route('paladin',['圣战士','Paladin'],['净化','Purify'],['圣光恢复','Radiant Recovery'],['圣光领域','Sanctuary'],['审判','Judgment']),
 ],
 summoner: [
  route('spiritcaller',['圣灵召唤师','Spiritcaller'],['召唤','Call Guardian'],['灵域','Spirit Domain'],['变身','Spirit Ascendant'],['新生','Rebirth']),
  route('beastlord',['契兽领主','Beastlord'],['缔约','Bind Beast'],['协猎','Coordinated Hunt'],['护主','Guard Master'],['裂地扑击','Rending Pounce']),
 ],
 lightning: [
  route('stormcaller',['天雷使','Stormcaller'],['雷印','Thunder Seal'],['引雷柱','Lightning Rod'],['雷云囚笼','Thundercloud Prison'],['万雷天诛','Heavenly Thunder']),
  route('voltstalker',['雷影行者','Voltstalker'],['瞬雷刺','Volt Spike'],['雷影穿行','Volt Dash'],['逆雷护身','Countercharge'],['疾雷断界','Thunder Break']),
 ],
 ice: [
  route('crystalist',['霜晶术士','Frost Crystalist'],['冰晶弹','Crystal Bolt'],['晶棱折射','Prismatic Ice'],['冻裂带','Shatterfield'],['万晶崩落','Crystal Collapse']),
  route('winterwarden',['极寒守望者','Winter Warden'],['寒枪','Glacial Spear'],['冰垒','Ice Rampart'],['雪幕庇护','Snow Veil'],['冰河封界','Glacial Lock']),
 ],
 fire: [
  route('wildfire',['燎原使','Wildfire Herald'],['火种','Ember Seed'],['推焰','Flamefront'],['合焰','Confluence'],['焚天陨星','Solar Cataclysm']),
  route('hellfire',['冥焰术士','Hellfire Warlock'],['冥烬','Nether Ember'],['入骨之火','Bonefire'],['引烬','Ember Threads'],['不灭冥火','Undying Flame']),
 ],
 curse: [
  route('hexweaver',['灾咒编织者','Hexweaver'],['衰败咒','Decay Hex'],['咒线','Hex Tether'],['灾疫迁移','Plague Transfer'],['灾咒坍缩','Hex Collapse']),
  route('pactbinder',['命契术士','Pactbinder'],['刻命','Life Brand'],['索债','Reckoning'],['逆契','Inverted Pact'],['末日契约','Doom Pact']),
 ],
 swordsman: [
  route('blademaster',['万剑宗师','Myriad Blademaster'],['御剑','Flying Blade'],['剑网','Blade Net'],['化剑','Sword Form'],['强化','Empower']),
  route('linebreaker',['破阵剑士','Linebreaker'],['裂甲斩','Sunder Armor'],['进步连斩','Advancing Slashes'],['架剑反斩','Guard Counter'],['开阵巨剑','Formation Breaker']),
 ],
 shadowblade: [
  route('shadowhunter',['影狩者','Shadow Hunter'],['追影刃','Stalking Blade'],['换影','Shadow Swap'],['双影夹击','Twin Ambush'],['群影追猎','Shadow Hunt']),
  route('boundarycutter',['断界客','Boundary Cutter'],['断界刃','Boundary Blade'],['穿界突袭','Boundary Assault'],['裂界回斩','Rift Reprise'],['断界杀阵','Boundary Execution']),
 ],
 stonewright: [
  route('mountainguard',['山岳守卫','Mountain Guard'],['震岩拳','Quake Fist'],['岩甲','Stone Armor'],['山门','Mountain Gate'],['群山合拢','Closing Peaks']),
  route('veinforger',['地脉铸师','Veinforger'],['大地布阵','Earth Formation'],['飞刺','Piercing Spike'],['爆破','Detonation'],['连阵','Linked Formation']),
 ],
 elementalist: [
  route('elemental-god',['万象战神','God of Elements'],['元素烙印','Elemental Brand'],['天象神罚','Skyfall Judgment'],['万象侵蚀','Prismatic Erosion'],['元素夺权','Elemental Dominion']),
  route('elemental-ward',['四极镇守者','Quarter Warden'],['换极','Attunement Shift'],['逆流','Countercurrent'],['四极结界','Fourfold Ward'],['天地归衡','Equilibrium']),
 ],
 voidsword: [
  route('riftlord',['裂界剑尊','Rift Sovereign'],['两界斩','Twin-Realm Cut'],['双界突袭','Twin Rifts'],['破界领域','Broken Boundary'],['万界终结','Realm End']),
  route('riftduelist',['无间剑客','Rift Duelist'],['断影','Shadow Sever'],['错位','Displace'],['空刃反击','Void Riposte'],['孤界决斗','Isolated Duel']),
 ],
 abyssal: [
  route('abyss-king',['深渊君王','Abyssal King'],['深渊血印','Abyssal Bloodmark'],['噬魂偿血','Soul Reclamation'],['深渊王座','Abyssal Throne'],['深渊真身','True Abyss']),
  route('abyss-herald',['蚀界先知','Abyssal Prophet'],['寄蚀','Parasite'],['离魂','Soul Fracture'],['蚀潮','Corruption Tide'],['万蚀归潮','Abyssal Convergence']),
 ],
 chrono: [
  route('time-sovereign',['时序主宰','Time Sovereign'],['双刻裂隙','Double Rift'],['时间分身','Temporal Double'],['生命锚点','Life Anchor'],['时序裁决','Temporal Verdict']),
  route('time-weaver',['因果织者','Causality Weaver'],['延时印记','Delayed Mark'],['因果连线','Causal Link'],['未来借位','Borrowed Position'],['因果倒置','Causal Inversion']),
 ],
};

export const ADVANCEMENT_KEYS = ['X','Q','Z','C'] as const;
export function advancementCastKey(id:string){
 return /^advanced:[XQZC]$/.test(id)?id.slice(-1):undefined;
}

// Shared authoritative tuning and client descriptions. Durations are milliseconds.
export const ADVANCEMENT_REWORK = {
 storm:{duration:9000,tick:1000,radius:18,markDuration:10000,chance:.3,critical:2.8,splash:.8,splashRadius:7,tickPower:1.6},
 ember:{radius:12,power:6.5,transfer:.8,duration:8000},
 rift:{duration:11000,bonus:1.0,followup:2.4,delay:1000,attackBuff:.35,speedBuff:.2},
 life:{range:50,duration:15000,buffDuration:8000,buff:.2},
 verdict:{duration:7000,tick:1000,vulnerability:.4,min:(level:number)=>2.5+level*.08,max:(level:number)=>5+level*.16},
 earth:{range:50,duration:45000,limit:(level:number)=>level*2+5,radius:2,tick:1000,tickPower:.85,linkDuration:10000,spacing:2.5,innerRadius:3,outerRadius:7,innerPower:8,outerPower:3.5,pierce:3,projectileSpeed:55},
 boundary:{markDuration:8000,markBonus:.3,fieldDuration:6500,fieldTick:1000},
} as const;
