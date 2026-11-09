// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {jadeBonuses} from './ancient-jade-wear.js';
import type {AncientProfile} from './ancient-rules';
export type GearSlot='weapon'|'helmet'|'armor'|'wings';
type HiddenAffix={key:string;value:number;rarity:number};
export type AncientGear={id:string;key:string;affixBonusVersion?:number;affixes?:{key:string;value:number}[];locked?:boolean;hiddenAffixes?:HiddenAffix[]};
export type GearDefinition={name:string;en:string;slot:GearSlot;quality:number;set?:string;damage?:number;health?:number;reduction?:number;speed?:number;bonus?:number;lifesteal?:number;slow?:number;execute?:number;interval?:number;skillPower?:number;hpPercent?:number;cooldown?:number;combo?:string};
export const GEAR_SETS:Record<string,{name:string;en:string;two:[string,string];three:[string,string]}>={
 thunder:{name:'雷鸣',en:'Thunder',two:['技能伤害+5%','Skill damage +5%'],three:['连锁闪电目标+1，技能伤害再+3%','Chain Lightning +1 target; another +3% skill damage']},
 frost:{name:'霜痕',en:'Frost',two:['减速强度+8%，头目减半','Slow strength +8%; halved on bosses'],three:['对减速中的敌人伤害+12%','Damage against slowed enemies +12%']},
 blood:{name:'血刃',en:'Blood',two:['近战攻击间隔-8%','Melee attack interval −8%'],three:['武器命中吸血+3%','Weapon-hit lifesteal +3%']},
 beast:{name:'兽契',en:'Beast',two:['召唤兽伤害+12%','Summon damage +12%'],three:['召唤兽生命+20%，伤害再+8%','Summon HP +20%; another +8% damage']},
 arcane:{name:'灵术',en:'Arcane',two:['技能冷却-4.8%','Skill cooldown −4.8%'],three:['技能冷却再-3.2%，生命上限+5%','Another −3.2% skill cooldown; max HP +5%']}
};
export const GEAR_AFFIXES:Record<string,{name:string;en:string;min:number;max:number;slots:GearSlot[];quality?:number}>={
 astralTempo:{name:'星律流转·技能冷却缩减',en:'Astral Tempo · cooldown reduction',min:.075,max:.1125,quality:7,slots:['weapon','helmet','armor','wings']},
 primalTempo:{name:'太初时序·技能冷却缩减',en:'Primordial Tempo · cooldown reduction',min:.085,max:.125,quality:8,slots:['weapon','helmet','armor','wings']},
 starHunter:{name:'星猎·对头目/BOSS技能伤害',en:'Skill damage against bosses',min:.08,max:.12,quality:7,slots:['weapon','helmet','armor','wings']},
 primalVerdict:{name:'太初裁决·对低于30%生命敌人技能伤害',en:'Skill damage below 30% enemy HP',min:.1,max:.16,quality:8,slots:['weapon','helmet','armor','wings']},
 health:{name:'生命增幅',en:'Vitality',min:.01,max:.025,slots:['helmet','armor','wings']},
 reduction:{name:'坚韧',en:'Resilience',min:.005,max:.015,slots:['helmet','armor']},
 speed:{name:'轻盈',en:'Agility',min:.01,max:.025,slots:['wings']},
 haste:{name:'挥击加速',en:'Melee haste',min:.02,max:.04,slots:['weapon','wings']},
 lifesteal:{name:'武器吸血',en:'Weapon lifesteal',min:.005,max:.015,slots:['weapon']},
 cooldown:{name:'技能冷却缩减',en:'Skill cooldown reduction',min:.01,max:.025,slots:['helmet','armor','wings']},
 pet:{name:'召唤兽伤害',en:'Summon damage',min:.03,max:.06,slots:['weapon','helmet','armor','wings']},
 slow:{name:'减速强化',en:'Slow strength',min:.02,max:.04,slots:['weapon','helmet','armor','wings']}
};
export function rollGearItem(key:string,random=Math.random):AncientGear {const item:AncientGear={id:crypto.randomUUID(),key};rollGearAffixes(item,random);grantGearBonusAffix(item,random);item.hiddenAffixes=rollHiddenAffixes(item);return item}
function rollGearAffixes(item:AncientGear,random=Math.random){const d=gearDefinition(item.key);item.affixes=[];if(!d)return;const pool=Object.entries(GEAR_AFFIXES).filter(([key,a])=>a.slots.includes(d.slot)&&!a.quality&&(d.quality<7||key!=='cooldown'));if(d.quality>=7){const exclusive=d.quality===7?['astralTempo','starHunter']:['primalTempo','starHunter','primalVerdict'],key=exclusive[Math.min(exclusive.length-1,Math.floor(random()*exclusive.length))],a=GEAR_AFFIXES[key];item.affixes.push({key,value:Math.round((a.min+(a.max-a.min)*Math.max(0,Math.min(1,random())))*10000)/10000});}const count=d.quality===1?0:Math.min(3,d.quality-1);for(let i=0;i<count-(d.quality>=7?1:0)&&pool.length;i++){const index=Math.max(0,Math.min(pool.length-1,Math.floor(random()*pool.length))),[key,a]=pool.splice(index,1)[0];item.affixes.push({key,value:Math.round((a.min+(a.max-a.min)*Math.max(0,Math.min(1,random())))*10000)/10000})}}
// The item marker travels through trades/market, so the one-time bonus cannot be farmed.
export function grantGearBonusAffix(item:AncientGear,random=Math.random){
 if(item.affixBonusVersion===1)return false;const d=gearDefinition(item.key);if(!d)return false;
 if(item.affixes===undefined)rollGearAffixes(item,random);
 const pool=Object.entries(GEAR_AFFIXES).filter(([key,a])=>a.slots.includes(d.slot)&&!a.quality&&(d.quality<7||key!=='cooldown')&&!item.affixes!.some(v=>v.key===key));
 if(!pool.length)return false;
 const [key,a]=pool[Math.max(0,Math.min(pool.length-1,Math.floor(random()*pool.length)))];
 item.affixes!.push({key,value:Math.round((a.min+(a.max-a.min)*Math.max(0,Math.min(1,random())))*10000)/10000});item.affixBonusVersion=1;return true;
}
export function gearAffixDescription(item:AncientGear,en=false){return (item.affixes||[]).map(v=>{const a=GEAR_AFFIXES[v.key];return a?`${en?a.en:a.name} +${+(v.value*(v.key==='cooldown'?.8:1)*100).toFixed(2)}%`:''}).filter(Boolean).join(' · ')}
export const GEAR_QUALITIES=[['普通','Common'],['稀有','Rare'],['史诗','Epic'],['传说','Legendary'],['神话','Mythic'],['超圣','Transcendent'],['天穹','Celestial'],['太初','Primordial']];
export const GEAR_LEVELS=[0,10,30,50,80,100,140,200];
export const GEAR_SLOTS:Record<GearSlot,[string,string]>={weapon:['武器','Weapon'],helmet:['头盔','Helmet'],armor:['护甲','Armor'],wings:['羽翼','Wings']};
export const GEAR:Record<string,GearDefinition>={
 stoneRough:{name:'粗制石剑',en:'Rough Stone Sword',slot:'weapon',quality:1,damage:10},
 stoneSharp:{name:'锋利石剑',en:'Sharp Stone Sword',slot:'weapon',quality:1,damage:15},
 ironClub:{name:'铁棍',en:'Iron Cudgel',slot:'weapon',quality:1,damage:8},
 ironBroken:{name:'破损铁剑',en:'Broken Iron Sword',slot:'weapon',quality:1,damage:30},
 ironSharp:{name:'锋利铁剑',en:'Sharp Iron Sword',slot:'weapon',quality:2,damage:700},
 purifyBroken:{name:'破损净化神剑',en:'Broken Purification Blade',slot:'weapon',quality:2,damage:600,lifesteal:.03},
 fangBlade:{name:'碎牙猎刃',en:'Shardfang Hunting Blade',slot:'weapon',quality:2,damage:850},
 frostKnife:{name:'寒纹短刀',en:'Frost-Etched Dagger',slot:'weapon',quality:2,damage:650,slow:.1},
 windBlade:{name:'疾风铁刃',en:'Gale Iron Blade',slot:'weapon',quality:2,damage:600,interval:500},
 purifyHoly:{name:'净化圣剑',en:'Holy Purification Sword',slot:'weapon',quality:3,damage:5000,lifesteal:.05},
 emberBlade:{name:'熔焰战刃',en:'Ember Warblade',slot:'weapon',quality:3,damage:6500},
 rootBlade:{name:'古根裁决',en:'Elderroot Verdict',slot:'weapon',quality:3,damage:5500,slow:.15},
 stormKnife:{name:'风暴短刃',en:'Storm Dagger',slot:'weapon',quality:3,damage:4500,interval:480},
 emperor:{name:'帝王圣剑',en:'Imperial Holy Sword',slot:'weapon',quality:4,damage:8000,lifesteal:.06,execute:.2},
 thunderVerdict:{name:'雷霆裁决',en:'Thunder Verdict',slot:'weapon',quality:4,damage:10000,slow:.2},
 duskFang:{name:'暮影獠牙',en:'Duskfang',slot:'weapon',quality:4,damage:7000,interval:450,lifesteal:.04},
 starRuin:{name:'星陨神刃',en:'Starfall Divine Blade',slot:'weapon',quality:5,damage:28000,lifesteal:.08,execute:.25},
 abyssJudge:{name:'深渊审判',en:'Abyssal Judgment',slot:'weapon',quality:5,damage:35000,slow:.25},
 dawnGod:{name:'黎明神剑',en:'Dawn Divine Sword',slot:'weapon',quality:5,damage:24000,interval:420,lifesteal:.1},
 genesis:{name:'创世圣裁',en:'Genesis Holy Verdict',slot:'weapon',quality:6,damage:80000,lifesteal:.12,execute:.3},
 eclipse:{name:'永夜天刃',en:'Eternal Eclipse Blade',slot:'weapon',quality:6,damage:65000,interval:400,slow:.3}
};
const prefixes=[['兽骨','Bone'],['钢纹','Steel-Etched'],['圣纹','Hallowed'],['帝王','Imperial'],['星穹','Celestial'],['创世','Genesis']],health=[100,3000,20000,45000,100000,180000];
for(let q=1;q<=6;q++){
 const [zh,en]=prefixes[q-1],h=health[q-1];
 GEAR['helmet'+q]={name:zh+'头盔',en:en+' Helmet',slot:'helmet',quality:q,health:Math.floor(h*.5),reduction:[.02,.04,.06,.08,.1,.12][q-1]};
 GEAR['armor'+q]={name:zh+'护甲',en:en+' Armor',slot:'armor',quality:q,health:h,reduction:[.04,.08,.12,.18,.24,.3][q-1]};
 GEAR['wings'+q]={name:zh+'羽翼',en:en+' Wings',slot:'wings',quality:q,speed:[.03,.05,.07,.1,.13,.16][q-1],bonus:[.02,.04,.06,.09,.12,.16][q-1]};
}
// High tiers have no innate cooldown. Specialized rolls provide the cooldown route.
for(const q of [7,8]){const primal=q===8,zh=primal?'太初':'天穹',en=primal?'Primordial':'Celestial';
 GEAR['blade'+q]={name:zh+'裁决剑',en:en+' Verdict',slot:'weapon',quality:q,damage:primal?260000:140000,skillPower:primal?.58:.5};
 GEAR['helmet'+q]={name:zh+'冠冕',en:en+' Crown',slot:'helmet',quality:q,health:primal?200000:130000,reduction:.13};
 GEAR['armor'+q]={name:zh+'战甲',en:en+' Plate',slot:'armor',quality:q,health:primal?400000:260000,hpPercent:primal?.38:.34,reduction:.31};
 GEAR['wings'+q]={name:zh+'羽翼',en:en+' Wings',slot:'wings',quality:q,speed:.17,bonus:primal?.22:.19};
}
export function gearDefinition(key:string){return Object.hasOwn(GEAR,key)?GEAR[key]:undefined}
export const ANCIENT_FORGE:Record<string,Record<string,number>>={};
Object.assign(GEAR,{
 copperTrailBlade:{name:'赤铜行旅剑',en:'Copper Trailblade',slot:'weapon',quality:1,damage:25},
 ironTrailBlade:{name:'乌铁探路刃',en:'Iron Pathfinder',slot:'weapon',quality:2,damage:650},
 moonTrailBlade:{name:'月辉寻径剑',en:'Moonstone Wayfinder',slot:'weapon',quality:3,damage:4500}
});
Object.assign(ANCIENT_FORGE,{copperTrailBlade:{oreCopper:12,stone:8},ironTrailBlade:{oreIron:20,core:12},moonTrailBlade:{oreMoon:24,core:35}});
export const ANCIENT_FORGE_LEGACY:Record<string,Record<string,number>>={};
for(const [key,source]of [['copperTrailBlade','roughStone'],['ironTrailBlade','roughDark'],['moonTrailBlade','roughMoon']]){ANCIENT_FORGE_LEGACY[key]={...ANCIENT_FORGE[key]};const oldKey=Object.keys(ANCIENT_FORGE[key]).find(k=>k.startsWith('ore'))!;ANCIENT_FORGE[key]={[source]:ANCIENT_FORGE[key][oldKey],...Object.fromEntries(Object.entries(ANCIENT_FORGE[key]).filter(([k])=>k!==oldKey))};}
// A pre-boss route: field salvage, not boss-only cores. No random reroll cost.
export const GROWTH_COMBOS:Record<string,{name:[string,string];from:string;to:string;bonus:number}>={
 warrior:{name:['战意回响','Battle Echo'],from:'power',to:'slash',bonus:.35},
 summoner:{name:['灵契追击','Soul Pursuit'],from:'soulbolt',to:'soulbolt',bonus:.3},
 ice:{name:['霜痕聚合','Frost Convergence'],from:'icebolt',to:'blizzard',bonus:.3},
 lightning:{name:['引雷回路','Thunder Circuit'],from:'chain',to:'storm',bonus:.3},
 curse:{name:['咒印收割','Hex Harvest'],from:'hex',to:'drain',bonus:.35},
 swordsman:{name:['剑痕落雨','Blademark Rain'],from:'triplecut',to:'swordrain',bonus:.3},
 shadowblade:{name:['裂影连袭','Rift Pursuit'],from:'shadowstep',to:'riftblade',bonus:.35},
 stonewright:{name:['岩牢崩解','Prison Collapse'],from:'stoneprison',to:'mountainfall',bonus:.3}
};
export const GROWTH_MATERIALS=['fieldSalvage1','fieldSalvage2','fieldSalvage3'];
export const GROWTH_SKILL_NAMES:Record<string,[string,string]>={power:['伤害强化','Power Surge'],slash:['裂地斩','Earthsplit Slash'],soulbolt:['灵魂弹','Soul Bolt'],icebolt:['寒冰箭','Ice Lance'],blizzard:['暴风雪','Blizzard'],chain:['连锁雷电','Chain Lightning'],storm:['雷暴','Thunderstorm'],hex:['诅咒','Hex'],drain:['生命汲取','Life Drain'],triplecut:['三段斩','Triple Cut'],swordrain:['剑雨','Sword Rain'],shadowstep:['穿影','Shadowstep'],riftblade:['裂影双刃','Rift Blades'],stoneprison:['岩牢','Stone Prison'],mountainfall:['山崩','Mountainfall']};
export function growthComboText(job:string,en=false){const c=GROWTH_COMBOS[job];if(!c)return '';const a=GROWTH_SKILL_NAMES[c.from][en?1:0],b=GROWTH_SKILL_NAMES[c.to][en?1:0];return en?`${a} → next ${b} within 10s: +${Math.round(c.bonus*100)}% damage`:`${a} → 10秒内下一次${b}伤害+${Math.round(c.bonus*100)}%`;}
export function growthTier(level:number){return level<10?1:level<30?2:3}
for(let q=1;q<=3;q++)for(const slot of Object.keys(GEAR_SLOTS) as GearSlot[]){
 const key=`field_${slot}${q}`,base=GEAR[slot==='weapon'?['ironBroken','ironSharp','purifyHoly'][q-1]:slot+q];
 GEAR[key]={...base,name:['行旅','猎途','森誓'][q-1]+({weapon:'剑',helmet:'头盔',armor:'护甲',wings:'羽翼'}[slot]),en:['Trail','Hunt','Forest Oath'][q-1]+' '+({weapon:'Blade',helmet:'Helm',armor:'Armor',wings:'Wings'}[slot])};
 ANCIENT_FORGE[key]={[GROWTH_MATERIALS[q-1]]:slot==='weapon'?12:slot==='armor'?10:8};
}
for(const [job,c]of Object.entries(GROWTH_COMBOS))for(const q of [2,3]){
 const key=`path_${job}${q}`;GEAR[key]={...GEAR[`field_weapon${q}`],name:c.name[0]+(q===3?'·森誓':''),en:c.name[1]+(q===3?' · Forest Oath':''),combo:job};
 ANCIENT_FORGE[key]={[GROWTH_MATERIALS[q-1]]:q===2?24:32};
}
for(const [set,s]of Object.entries(GEAR_SETS))for(let q=2;q<=6;q++)for(const slot of ['helmet','armor','wings'] as const){const key=`set_${set}_${slot}${q}`;GEAR[key]={...GEAR[slot+q],set,name:s.name+GEAR_SLOTS[slot][0],en:s.en+' '+GEAR_SLOTS[slot][1]};ANCIENT_FORGE[key]={[['','crown','rootHeart','crystalShard','royalSeal','emptyCrown'][q-1]]:2,core:[0,60,100,180,250,400][q-1]}}
export const FORGE_MATERIAL_NAMES:Record<string,[string,string]>={roughStone:['山纹原石','Striated Rough'],roughDark:['乌皮原石','Darkskin Rough'],roughMoon:['月纹原石','Moonvein Rough'],oreCopper:['赤铜矿','Copper Ore'],oreIron:['乌铁矿','Iron Ore'],oreMoon:['月辉矿','Moonstone Ore'],royalSeal:['王城誓印','Royal Oath Seal'],emptyCrown:['空冠碎片','Empty Crown Fragment'],bone:['兽骨','Bone'],wood:['古木','Ancient Wood'],stone:['石料','Stone'],fang:['穴居兽獠牙','Grox Fang'],spear:['猎手矛尖','Hunter Spearhead'],totem:['图腾碎片','Totem Fragment'],crown:['酋长冠饰','Chieftain Crown'],rootHeart:['古根之心','Root Heart'],mossHide:['苔兽皮','Moss Hide'],thornSeed:['荆棘种子','Thorn Seed'],crystalShard:['水晶碎片','Crystal Shard'],metalCrystal:['金晶','Metal Crystal'],woodCrystal:['木晶','Wood Crystal'],waterCrystal:['水晶核','Water Crystal'],fireCrystal:['火晶','Fire Crystal'],earthCrystal:['土晶','Earth Crystal']};
Object.assign(FORGE_MATERIAL_NAMES,{huntToken:['狩猎印记','Hunt Seal'],fieldSalvage1:['行旅残材','Trail Salvage'],fieldSalvage2:['猎途残材','Hunt Salvage'],fieldSalvage3:['森誓残材','Forest Salvage']});
for(const [theme,q,special,zh,en]of [['tribal',2,'crown','戈拉什','Gorash'],['root',3,'rootHeart','古根','Elderroot'],['crystal',4,'crystalShard','五曜','Fivefold']] as const){
 for(const slot of ['weapon','helmet','armor','wings'] as GearSlot[]){
  const key='forge_'+theme+'_'+slot,base=GEAR[slot==='weapon'?q===2?'fangBlade':q===3?'rootBlade':'emperor':slot+q];
  GEAR[key]={...base,name:zh+({weapon:'祭刃',helmet:'冠盔',armor:'守御甲',wings:'灵翼'}[slot]),en:en+' '+({weapon:'Ritual Blade',helmet:'Crown Helm',armor:'Wardplate',wings:'Spirit Wings'}[slot])};
  if(slot==='weapon'){GEAR[key].damage=Math.floor(base.damage!*.95);GEAR[key].lifesteal=.02*q;delete GEAR[key].execute}
  if(slot==='helmet'||slot==='armor'){GEAR[key].health=Math.floor(base.health!*.9);GEAR[key].reduction=(base.reduction||0)+.01}
  if(slot==='wings'){GEAR[key].speed=(base.speed||0)+.01;GEAR[key].bonus=Math.max(0,(base.bonus||0)-.01)}
  ANCIENT_FORGE[key]={[special]:slot==='weapon'?3:2,bone:q*10,wood:q*10,stone:q*10};
  if(theme==='tribal')Object.assign(ANCIENT_FORGE[key],{totem:1,...(slot==='weapon'?{fang:2}:{spear:2})});
  if(theme==='root')Object.assign(ANCIENT_FORGE[key],slot==='weapon'||slot==='wings'?{thornSeed:2}:{mossHide:2});
  if(theme==='crystal')Object.assign(ANCIENT_FORGE[key],{[({weapon:'metalCrystal',helmet:'waterCrystal',armor:'earthCrystal',wings:'fireCrystal'} as const)[slot]]:1,woodCrystal:1});
  ANCIENT_FORGE_LEGACY[key]={...ANCIENT_FORGE[key]};
  ANCIENT_FORGE[key]={[special]:slot==='weapon'?3:2,core:({tribal:60,root:100,crystal:180}[theme])*(slot==='weapon'?1.5:1)};
 }
}
Object.assign(GEAR,{courtVerdict:{...GEAR.genesis,name:'霜烬断令刃',en:'Frostfire Edictbreaker',damage:78000,skillPower:.1,lifesteal:.07,execute:.2},courtOathArmor:{...GEAR.armor6,name:'双相守誓甲',en:'Twinphase Oathplate',hpPercent:.08,skillPower:.06,cooldown:.015},courtMantle:{...GEAR.wings6,name:'霜烬誓翼',en:'Frostfire Oathwings',hpPercent:.05,skillPower:.06,cooldown:.02}});
Object.assign(ANCIENT_FORGE,{courtVerdict:{edictCore:3,forgeSigil:2,core:600},courtOathArmor:{edictCore:2,forgeSigil:2,core:450},courtMantle:{edictCore:2,forgeSigil:3,core:400}});
Object.assign(GEAR,{skyVerdict:{...GEAR.genesis,name:'寂雷裁星剑',en:'Silent Storm Starblade',damage:90000,skillPower:.46},skyArmor:{...GEAR.armor6,name:'天穹星铠',en:'Skyreach Starplate',hpPercent:.32},skyHelmet:{...GEAR.helmet6,name:'引星冠冕',en:'Starcaller Circlet',cooldown:.1}});
Object.assign(ANCIENT_FORGE,{skyVerdict:{skyCore:3,stormSigil:2,core:750},skyArmor:{skyCore:2,stormSigil:3,core:650},skyHelmet:{skyCore:2,stormSigil:2,core:550}});
Object.assign(FORGE_MATERIAL_NAMES,{skyCore:['寂雷星核','Silent Storm Core'],stormSigil:['雷枢印记','Thunder Relay Sigil']});
export function craftAncientGear(p:AncientProfile,key:string){let recipe=Object.hasOwn(ANCIENT_FORGE,key)?ANCIENT_FORGE[key]:undefined;if(!recipe)return '配方不存在';if((p.gear?.length||0)>=1000)return '装备数量已达上限';const has=(cost:Record<string,number>)=>Object.entries(cost).every(([k,n])=>Number.isSafeInteger(p.materials[k])&&p.materials[k]>=n);if(!has(recipe)){const legacy=ANCIENT_FORGE_LEGACY[key];if(!legacy||!has(legacy))return '合成材料不足';recipe=legacy;}const item=rollGearItem(key);for(const [k,n]of Object.entries(recipe))p.materials[k]-=n;(p.gear??=[]).push(item);return null}
// Dungeon items match their tier's normal equipment rather than replacing skill damage.
for(const [q,blade,zh,en,seal]of [[2,'fangBlade','兽骨','Bonebound','hollowSeal2'],[3,'rootBlade','碎骨','Bonebreaker','hollowSeal3'],[4,'emperor','酋长','Chieftain','hollowSeal4']] as const){
 GEAR['hollow_'+q+'_weapon']={...GEAR[blade],name:zh+'裂刃',en:en+' Cleaver',damage:Math.floor(GEAR[blade].damage!*.95),lifesteal:.02,execute:.1};
 GEAR['hollow_'+q+'_armor']={...GEAR['armor'+q],name:zh+'地穴胸甲',en:en+' Hollowplate',health:Math.floor(GEAR['armor'+q].health!*.95),reduction:GEAR['armor'+q].reduction!+.01};
 ANCIENT_FORGE['hollow_'+q+'_weapon']={[seal]:8};ANCIENT_FORGE['hollow_'+q+'_armor']={[seal]:6};
 FORGE_MATERIAL_NAMES[seal]=[zh+'地穴印记',en+' Hollow Seal'];
}
export function ancientCraftMaterials(kind:string,random=Math.random){if(kind==='hourglass_regent')return {core:700};if(kind==='buried_marshal')return {core:330};if(kind==='sky_sovereign')return {skyCore:1,core:650};if(kind==='thunder_warden')return {stormSigil:1,core:450};if(kind==='frost_crowned')return {edictCore:1,core:550};if(kind==='furnace_regent')return {forgeSigil:1,core:350};if(kind==='starbound_heart')return {starCore:1,core:550};if(kind==='immaculate_judge')return {verdictShard:1,core:550};if(kind==='blight_lord')return {blightHeart:1,core:500};if(kind==='oathknight'||kind==='emptyking'){const drops:Record<string,number>={};if(random()<.8)drops[kind==='oathknight'?'royalSeal':'emptyCrown']=1;if(random()<.35)drops.core=kind==='emptyking'?400:250;return drops}const boss=kind==='lord'||kind==='rootwarden'||['metal','wood','water','fire','earth'].some(e=>kind==='crystal_'+e);const drops:Record<string,number>={};if(!boss)return drops;const scale=kind==='lord'?1:kind==='rootwarden'?2:3;for(const k of ['bone','wood','stone'])if(random()<.6)drops[k]=10*scale;if(random()<.8){if(kind==='lord')Object.assign(drops,{crown:1,totem:1,fang:2,spear:2});else if(kind==='rootwarden')Object.assign(drops,{rootHeart:1,mossHide:2,thornSeed:2});else{drops[kind.slice(8)+'Crystal']=1;drops.crystalShard=1}}if(random()<.35)drops.core=kind==='lord'?120:kind==='rootwarden'?100:250;return drops}
function rollHiddenAffixes(item:AncientGear):HiddenAffix[]{
 const slot=gearDefinition(item.key)?.slot;
 const pool=Object.entries(GEAR_AFFIXES).filter(([key,def])=>slot&&def.slots.includes(slot)&&!def.quality&&key!=='cooldown');
 let seed=2166136261;
 for(const ch of item.id)seed=Math.imul(seed^ch.charCodeAt(0),16777619);
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 return Array.from({length:Math.min(3,pool.length)},()=>{
  const [key,def]=pool.splice(Math.floor(random()*pool.length),1)[0];
  const roll=random(),rarity=[.44,.68,.82,.91,.96,.985,.997,1].findIndex(cut=>roll<cut)+1;
  return {key,rarity,value:Math.round((def.min+(def.max-def.min)*(rarity-1+random())/8)*10000)/10000};
 });
}
export function gearPromotion(item:AncientGear,random=Math.random){
 const def=gearDefinition(item.key);
 if(!def||def.quality<6||def.quality>=8||random()>=(def.quality===6?.01:.005))return;
 const quality=def.quality+1;
 return (def.slot==='weapon'?'blade':def.slot)+quality;
}
export function ensureAncientGear(p:AncientProfile){
 if(p.gear!==undefined&&p.gearAffixVersion===2&&p.gear.every(i=>i.affixBonusVersion===1&&i.hiddenAffixes!==undefined))return false;
 let changed=p.gearAffixVersion!==2;
 if(p.gear===undefined){const starter=rollGearItem('stoneRough');p.gear=[starter];p.gearEquipped={weapon:starter.id};changed=true}
 for(const item of p.gear){
  changed=grantGearBonusAffix(item)||changed;
  if(!item.hiddenAffixes){item.hiddenAffixes=rollHiddenAffixes(item);changed=true;}
 }
 p.gearAffixVersion=2;return changed;
}
export function equippedGear(p:AncientProfile,slot:GearSlot){const item=p.gear?.find(i=>i.id===p.gearEquipped?.[slot]),d=item&&gearDefinition(item.key);return d?.slot===slot&&p.level>=GEAR_LEVELS[d.quality-1]?d:undefined}
export function gearKeys(p:AncientProfile){return Object.fromEntries(Object.keys(GEAR_SLOTS).map(slot=>{const id=p.gearEquipped?.[slot as GearSlot],item=p.gear?.find(i=>i.id===id);return [slot,item&&equippedGear(p,slot as GearSlot)?item.key:'']}))}
export function ancientGearStats(p:AncientProfile){let health=0,reduction=0,speed=0,bonus=0,hpPercent=0,haste=0,lifesteal=0,cooldown=0,pet=0,slow=0,skillBonus=0,chainTargets=0,slowedBonus=0,petHealth=0,tempo=0,tempoCapacity=0,bossSkill=0,finisherSkill=0;const sets:Record<string,number>={};for(const slot of Object.keys(GEAR_SLOTS) as GearSlot[]){const d=equippedGear(p,slot);if(!d)continue;if(d.quality>=7)tempoCapacity+=(d.quality===8?.5:.45)/4;skillBonus+=d.skillPower||0;hpPercent+=d.hpPercent||0;cooldown+=d.cooldown||0;if(slot!=='weapon'){health+=d.health||0;reduction+=d.reduction||0;speed+=d.speed||0;bonus+=d.bonus||0;if(d.set)sets[d.set]=(sets[d.set]||0)+1}const item=p.gear?.find(i=>i.id===p.gearEquipped?.[slot]);for(const v of [...(item?.affixes||[]),...(item?.hiddenAffixes||[]).slice(0,Math.max(0,d.quality-5))]){const def=GEAR_AFFIXES[v.key];if(!def?.slots.includes(slot)||!Number.isFinite(v.value)||(def.quality||0)>d.quality)continue;const n=Math.max(0,Math.min(def.max,v.value));switch(v.key){case 'astralTempo':case 'primalTempo':tempo+=n;break;case 'starHunter':bossSkill+=n;break;case 'primalVerdict':finisherSkill+=n;break;case 'health':hpPercent+=n;break;case 'reduction':reduction+=n;break;case 'speed':speed+=n;break;case 'haste':haste+=n;break;case 'lifesteal':lifesteal+=n;break;case 'cooldown':cooldown+=n;break;case 'pet':pet+=n;break;case 'slow':slow+=n;break}}}if(sets.thunder>=2)skillBonus+=.05;if(sets.thunder>=3){skillBonus+=.03;chainTargets=1}if(sets.frost>=2)slow+=.08;if(sets.frost>=3)slowedBonus=.12;if(sets.blood>=2)haste+=.08;if(sets.blood>=3)lifesteal+=.03;if(sets.beast>=2)pet+=.12;if(sets.beast>=3){pet+=.08;petHealth=.2}if(sets.arcane>=2)cooldown+=.06;if(sets.arcane>=3){cooldown+=.04;hpPercent+=.05}health+=Math.floor(ancientBaseHealth(p.level)*Math.min(.6,hpPercent));const jade=jadeBonuses(p);health+=Math.floor((ancientBaseHealth(p.level)+health)*jade.health);return {health,jadeAttack:jade.attack,reduction:Math.min(.6,reduction)+(1-Math.min(.6,reduction))*jade.reduction,speed:Math.min(.3,speed),bonus,haste:Math.min(.2,haste),lifesteal:Math.min(.05,lifesteal),cooldown:Math.min(.5,Math.min(.16,cooldown*.8)+Math.min(tempoCapacity,tempo)),bossSkill,finisherSkill,pet:Math.min(.4,pet),slow:Math.min(.2,slow),skillBonus,chainTargets,slowedBonus,petHealth,sets}}
export function ancientBaseHealth(level:number){
 const l=Math.max(1,Number.isFinite(level)?level:1),anchors=[[1,100],[5,3000],[10,12000],[30,90000],[50,250000],[60,320000],[80,470000],[100,650000]];
 for(let i=1;i<anchors.length;i++){const [a,h]=anchors[i-1],[b,k]=anchors[i];if(l<=b)return Math.round(h*(l/a)**(Math.log(k/h)/Math.log(b/a)))}
 // Preserve the early-game anchors; late levels must grant visible durability.
 return Math.round(650000*(l/100)**3);
}
export function ancientProfileHealth(p:AncientProfile){return ancientBaseHealth(p.level)+ancientGearStats(p).health}
export function ancientLevelDamage(level:number){return 1.25**Math.min(300,Math.max(0,level-1))}
export function ancientBaseAttack(level:number){
 const l=Math.max(1,Number.isFinite(level)?level:1),anchors=[[1,25],[5,125],[10,400],[20,800],[30,2500],[40,6000],[50,10000],[60,20000],[70,40000],[80,60000],[90,90000],[100,130000]];
 // Continuous growth: viable starter skills and increasing forest/city durability,
 // without any target-level penalty or the weapon's fixed attack bonus.
 for(let i=1;i<anchors.length;i++){const [a,h]=anchors[i-1],[b,k]=anchors[i];if(l<=b)return Math.round(h*(l/a)**(Math.log(k/h)/Math.log(b/a)))}
 // Keep existing encounters through Lv150 unchanged, then widen level gaps.
 return Math.round(l<=150?130000*(l/100)**3:438750*(l/150)**4.5);
}
export function ancientSkillDamage(p:AncientProfile){const s=ancientGearStats(p);return Math.floor(ancientBaseAttack(p.level)*(1+s.bonus)*(1+s.skillBonus)*(1+s.jadeAttack))}
// Upgrade legacy copies in place through definitions, without replacing IDs,
// affixes, locks, skins, or inventory ownership. Fixed melee bonuses stay separate.
for(const d of Object.values(GEAR)){
 if(d.quality>=7)continue;
 if(d.slot==='weapon')d.skillPower=[.06,.22,.38,.4,.42,.45][d.quality-1];
 if(d.slot==='armor')d.hpPercent=[.1,.18,.24,.26,.28,.3][d.quality-1];
 if(d.slot==='helmet')d.cooldown=[.02,.05,.08,.08,.09,.1][d.quality-1];
}
export function ancientFieldReward(level:number,map:string,random=Math.random,kind=''){
 if(!['tribe','forest'].includes(map)||!Number.isInteger(level)||level<1||level>60)return {drops:{} as Record<string,number>,gear:[] as AncientGear[]};
 const q=map==='tribe'?Math.min(2,growthTier(level)):3,key=GROWTH_MATERIALS[q-1],slot=(['weapon','helmet','armor','wings'] as const)[Math.min(3,Math.floor(random()*4))];
 const chance=kind.startsWith('crystal_wisp_')?.005:.02;
 return {drops:{[key]:1},gear:random()<chance?[rollGearItem(`field_${slot}${q}`,random)]:[]};
}
export function salvageAncientGear(p:AncientProfile,id:string){
 const item=p.gear?.find(i=>i.id===id),d=item&&gearDefinition(item.key);if(!item||!d)return '装备不存在';
 if(item.locked||Object.values(p.gearEquipped||{}).includes(id))return '请先卸下并解锁装备';
 if(d.quality>3)return '此装备暂不可分解';const key=GROWTH_MATERIALS[d.quality-1],amount=[2,3,4][d.quality-1];
 if(!Number.isSafeInteger((p.materials[key]||0)+amount))return '数量已达上限';
 p.gear=p.gear!.filter(i=>i.id!==id);p.materials[key]=(p.materials[key]||0)+amount;return null;
}
export function ancientMeleeDamage(p:AncientProfile){const d=equippedGear(p,'weapon');if(!d)return 0;const s=ancientGearStats(p);return Math.floor((ancientBaseAttack(p.level)+(d.damage||0))*(1+s.bonus)*(1+s.jadeAttack))}
export function ancientMeleeInterval(p:AncientProfile){return (equippedGear(p,'weapon')?.interval||600)*(1-ancientGearStats(p).haste)}
export function equipAncientGear(p:AncientProfile,slot:string,id:string){if(!Object.hasOwn(GEAR_SLOTS,slot))return '装备槽不存在';if(!id){p.gearEquipped??={};delete p.gearEquipped[slot as GearSlot];return null}const item=p.gear?.find(i=>i.id===id),d=item&&gearDefinition(item.key);if(!d||d.slot!==slot)return '装备不存在';if(p.level<GEAR_LEVELS[d.quality-1])return '玩家等级不足';p.gearEquipped??={};p.gearEquipped[slot as GearSlot]=id;return null}
// Weights are conditional on an equipment drop; map progression, never player level, sets the tier.
export function ancientBossGearWeights(map:string):number[]{
 const center=({tribe:2,forest:4,city:5,blight:6,sanctum:6,starfall:6,frostcourt:6,skyreach:6,dunes:6} as Record<string,number>)[map]||2;
 const weights=Array(8).fill(0) as number[];
 if(center===2){weights[0]=30;weights[1]=65;weights[2]=4.5;weights[3]=.5}
 else if(center===6){weights[3]=5;weights[4]=30;weights[5]=65}
 else{weights[center-3]=5;weights[center-2]=30;weights[center-1]=60;weights[center]=center===5?5:4.5;if(center<5)weights[center+1]=.5}
 if(map==='frostcourt'||map==='skyreach'||map==='dunes'){weights[5]-=.35;weights[6]=.3;weights[7]=.05}
 return weights;
}
const gearBossMaps:Record<string,string>={buried_marshal:'dunes',hourglass_regent:'dunes',chief:'tribe',lord:'tribe',rootwarden:'forest',oathknight:'city',emptyking:'city',blight_lord:'blight',immaculate_judge:'sanctum',starbound_heart:'starfall',frost_crowned:'frostcourt',furnace_regent:'frostcourt',sky_sovereign:'skyreach',thunder_warden:'skyreach'};
export function ancientGearLoot(kind:string,random=Math.random,level=0,map?:string){
 if(map?.startsWith('community:'))return [];
 const home=gearBossMaps[kind]||(['metal','wood','water','fire','earth'].some(e=>kind==='crystal_'+e)?'forest':'');if(!home)return [];
 const weights=ancientBossGearWeights(map||home),result:AncientGear[]=[];
 const quality=()=>{let r=Math.max(0,Math.min(.999999999,random()))*100;for(let i=0;i<weights.length;i++){r-=weights[i];if(r<0)return i+1}return 6};
 for(const slot of ['weapon','equipment'])if(random()<.5){const q=quality(),pool=Object.entries(GEAR).filter(([key,d])=>!Object.hasOwn(ANCIENT_FORGE,key)&&d.quality===q&&(slot==='weapon'?d.slot==='weapon':d.slot!=='weapon'));const setPool=Object.entries(GEAR).filter(([key,d])=>!Object.hasOwn(ANCIENT_FORGE,key)&&d.set&&d.quality===q);const choices=slot==='equipment'&&setPool.length>0&&q>=2&&random()<.35?setPool:pool;if(choices.length)result.push(rollGearItem(choices[Math.min(choices.length-1,Math.floor(random()*choices.length))][0],random))}
 return result;
}
export const GEAR_HUNT_SOURCES:Record<string,string>=Object.fromEntries([...Object.entries(gearBossMaps),...['metal','wood','water','fire','earth'].map(e=>['crystal_'+e,'forest'])]);
export const gearHuntQuota=(key:string)=>8+4*(gearDefinition(key)?.quality||1);
export function gearHuntEligible(key:string){
 const d=gearDefinition(key);
 return !!d?.set&&d.slot!=='weapon'&&Object.values(GEAR_HUNT_SOURCES).some(map=>ancientBossGearWeights(map)[d.quality-1]>0);
}
export function gearHuntCounts(key:string,kind:string,map:string,level:number){
 const d=gearDefinition(key);
 return gearHuntEligible(key)&&GEAR_HUNT_SOURCES[kind]===map&&level>=GEAR_LEVELS[d!.quality-1]-10&&ancientBossGearWeights(map)[d!.quality-1]>0;
}
export function gearRerollQuote(item:AncientGear,index:number,random=Math.random){
 const d=gearDefinition(item.key),old=item.affixes?.[index],rule=old&&GEAR_AFFIXES[old.key];
 if(!d||!old||!rule)return;
 const pool=Object.entries(GEAR_AFFIXES).filter(([key,a])=>a.slots.includes(d.slot)&&!!a.quality===!!rule.quality
  &&(!a.quality||a.quality===d.quality||key==='starHunter'&&d.quality>=7)
  &&(d.quality<7||key!=='cooldown')&&!item.affixes!.some((line,i)=>i!==index&&line.key===key));
 if(!pool.length)return;
 const [key,a]=pool[Math.floor(random()*pool.length)];
 return {candidate:{key,value:Math.round((a.min+(a.max-a.min)*random())*10000)/10000},material:GROWTH_MATERIALS[Math.min(d.quality,3)-1],cost:3+d.quality*2};
}
export function gearName(key:string,en=false){const d=gearDefinition(key);return d?`[${GEAR_QUALITIES[d.quality-1][en?1:0]}] ${en?d.en:d.name}`:key}
export function gearDescription(key:string,en=false){const d=gearDefinition(key);if(!d)return '';const parts=[`${en?'Required level':'穿戴等级'} ${GEAR_LEVELS[d.quality-1]}`];for(const [k,zh,eng]of [['damage','普攻伤害','Melee damage'],['skillPower','技能强度','Skill power'],['hpPercent','最大生命','Max HP'],['cooldown','技能冷却缩减','Skill cooldown reduction'],['health','生命','HP'],['reduction','减伤','Damage reduction'],['speed','移速','Speed'],['bonus','所有伤害','All damage'],['lifesteal','吸血','Lifesteal']] as const){const n=(d[k]||0)*(k==='cooldown'?.8:1);if(n)parts.push(`${en?eng:zh} +${k==='damage'||k==='health'?n.toLocaleString():+(n*100).toFixed(2)+'%'}`)}if(d.combo){const c=GROWTH_COMBOS[d.combo];parts.push(growthComboText(d.combo,en))}if(d.slow)parts.push(en?`Hits slow ${Math.round(d.slow*100)}% for 2s (half on bosses)`:`命中减速${Math.round(d.slow*100)}%，2秒（头目减半）`);if(d.execute)parts.push(en?`+${Math.round(d.execute*100)}% damage below 30% enemy HP`:`敌人血量低于30%时伤害+${Math.round(d.execute*100)}%`);if(d.interval)parts.push(`${en?'Attack interval':'攻击间隔'} ${d.interval/1000}s`);return parts.join(' · ')}
