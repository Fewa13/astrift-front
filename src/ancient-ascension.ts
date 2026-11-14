// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {AncientProfile} from './ancient-rules';
import {PROFESSIONS,skillRadius} from './ancient-skills.js';
export const ASCENSION_SKILLS = Object.fromEntries(Object.entries(PROFESSIONS).map(([job, definition]) => [job, definition.skills]));
export type AscensionProgress={permit:boolean;step:number;count:number;holy:boolean};
export type AscensionState={day:string;attempts:number;jobs:Record<string,AscensionProgress>};
export function ascensionProgress(p:AncientProfile,job=p.profession||''){return p.ascension?.jobs?.[job]}
export function isHoly(p:Pick<AncientProfile,'profession'|'ascension'>){return !!p.profession&&!!p.ascension?.jobs?.[p.profession]?.holy}
export const holyPower=(p:Pick<AncientProfile,'profession'|'ascension'>)=>isHoly(p)?2.5:1;
export const holyName=(name:string,en=false,holy=false)=>holy?(en?'Holy '+name:'圣·'+name):name;
export function holySkillDetails(id:string,n:number,en=false){const level=Math.max(1,n),damage:Record<string,number>={firebolt:75+7*level,firewave:100+9*level,firestorm:90+8*level,inferno:180+15*level,tempest:800+65*level,riftblade:300+25*level,shadowstep:260+22*level,shadowreturn:220+20*level,nightfall:400+35*level,stonefist:320+30*level,faultline:180+15*level,stoneprison:300+30*level,mountainfall:700+60*level,frostburst:260+25*level,swordwave:300+25*level,triplecut:330+30*level,swordrain:140+16*level,phantomblade:845+78*level,slash:320+30*level,soulbolt:330+30*level,power:300+30*level,rage:400+40*level,icebolt:300+30*level,icearmor:300+30*level,blizzard:125+10*level,chain:300+30*level,haste:300+30*level,storm:160+15*level,hex:320+30*level,drain:400+40*level,doom:80+8*level,weaken:280+30*level,transform:125+10*level,summon:75+5*level};const radius=skillRadius(id,level,true),tick=['blizzard','storm','doom'].includes(id),parts=[];if(damage[id])parts.push(en?`${damage[id]*2.5}% base attack ${tick?'per second':id==='swordrain'?'per strike':id==='triplecut'?'on the first strike':'damage'}`:`${damage[id]*2.5}%基础攻击${tick?'每秒伤害':id==='swordrain'?'每轮伤害':id==='triplecut'?'首刀伤害':'伤害'}`);if(id==='shadowreturn')parts.push(en?`Recall slash: ${Math.round(damage[id]*2.75)}% base attack`:`回拉斩击：${Math.round(damage[id]*2.75)}%基础攻击`);if(radius)parts.push(en?`Radius ${radius}m`:`半径${radius}米`);if(id==='chain')parts.push(en?`${level+4} targets · ${(16+level-1)*1.5}m chain diameter`:`最多${level+4}个目标 · 连锁直径${(16+level-1)*1.5}米`);if(id==='summon')parts.push(en?'Beast HP ×1.5':'召唤兽血量×1.5');return (en?'Holy result: ':'圣级实际：')+(parts.join(' · ')||(en?'Sacred appearance; original recovery and cooldown retained.':'圣级外观，原回复效果和冷却保留。'))}
export function ascensionDay(now=Date.now()){return new Date(now).toISOString().slice(0,10)}
export function ascensionAttempts(p:AncientProfile,now=Date.now()){return p.ascension?.day===ascensionDay(now)?p.ascension.attempts:0}
export function ascensionEligible(p:AncientProfile){return p.level>=80&&!!p.profession&&!!ASCENSION_SKILLS[p.profession]&&ASCENSION_SKILLS[p.profession].every(id=>(p.skills?.[id]||0)>=5)}
export function ascensionStartError(p:AncientProfile,final=false,now=Date.now()){
 if(!ascensionEligible(p))return 'Requires level 80 and all profession skills at level 5.';
 const progress=ascensionProgress(p);if(progress?.holy)return 'This profession is already ascended.';
 if(final)return progress?.permit&&progress.step===2?null:'Complete the ascension side quest first.';
 if(progress?.permit)return 'Ascension permit already earned.';
 return ascensionAttempts(p,now)>=2?'Daily limit: 2 trial attempts.':null;
}
export function consumeAscensionAttempt(p:AncientProfile,now=Date.now()){
 const day=ascensionDay(now);p.ascension??={day,attempts:0,jobs:{}};if(p.ascension.day!==day){p.ascension.day=day;p.ascension.attempts=0}p.ascension.attempts++;
}
export function grantAscension(p:AncientProfile,job:string,final=false){
 if(p.profession!==job||!ASCENSION_SKILLS[job])return false;p.ascension??={day:ascensionDay(),attempts:0,jobs:{}};
 const s=p.ascension.jobs[job]??={permit:false,step:0,count:0,holy:false};
 if(final){if(!s.permit||s.step!==2||s.holy)return false;s.holy=true;s.step=3;return true}
 if(s.permit)return false;s.permit=true;return true;
}
export function ascensionKill(p:AncientProfile,map:string,kind:string,level:number){
 const s=ascensionProgress(p);if(!s?.permit||s.holy)return;
 if((s.step===0&&map==='city'&&level>=70&&!['oathknight','emptyking','noble_echo'].includes(kind))||(s.step===1&&map==='forest'&&kind.startsWith('crystal_'))){s.count++;if(s.count>=(s.step===0?20:2)){s.step++;s.count=0}}
}
export const ASCENSION_STEPS=[['掌握源力：击败20个王城普通怪物','Master the source: defeat 20 ordinary city enemies'],['淬炼力量：击败2个森林水晶巨人','Temper your power: defeat 2 forest Crystal Titans'],['圣职仪式：完成最终单人试炼','Sacred rite: complete the final solo trial']];
export const HOLY_DESCRIPTIONS:Record<string,[string,string]>={
 fire:['金色日冕与熔火陨星，火焰覆盖更广，燃烧伤害获得圣级增幅。','A golden corona and molten meteors widen the blaze and amplify its burn.'],
 shadowblade:['双刃影冠、实体残影交叉追击与夜幕刀阵，突进留下撕裂空间的刃痕。','A twin-blade crown, solid shadow cross-slashes and a nightfall blade formation leave rifts along each dash.'],
 stonewright:['悬浮巨岩重铠、地脉符印与山岳巨臂，岩牢化为层叠的圣岩尖塔。','Floating monolith armor, tectonic seals and a mountain-sized arm transform the prison into layered sacred spires.'],
 warrior:['圣铠与巨型裂地圣刃，震荡化为金色断层。','Sacred armor and colossal blades turn shockwaves into golden fractures.'],
 summoner:['虚空召唤阵显现，铁甲兽化为圣兽，魂弹与爪击获得圣力。','A dimensional gate calls a sacred beast; soul bolts and claws gain holy power.'],
 ice:['冰冠展开，冰矛化为巨晶，风雪形成多层冰晶风暴。','A frost crown manifests; lances become giant crystals and blizzards become glacial storms.'],
 lightning:['从苍穹引下雷柱，从虚空聚集雷霆，电弧贯穿受击区域。','Call thunder pillars from the sky and gather lightning from the void.'],
 curse:['多层虚空法阵、复杂符文与咒印实体化，灾厄在阵心降临。','Layered void circles and intricate runes materialize as doom descends at their center.'],
 swordsman:['翡翠剑冠、悬浮剑阵与巨型圣剑投影，剑雨笼罩更大范围。','An emerald blade crown, hovering swords and a colossal sacred sword cover a wider battlefield.']
};
