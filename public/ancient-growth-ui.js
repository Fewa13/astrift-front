// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {formatAncientNumber} from './ancient-number-format.js';
import {ANCIENT_FORGE,GEAR_LEVELS,GEAR_SLOTS,FORGE_MATERIAL_NAMES,gearDefinition,gearName,gearDescription,growthTier,ancientSkillDamage,ancientGearStats,ancientProfileHealth} from './ancient-gear.js?v=20261021-skyreach-market-1';
export function growthSuggestion(p){
 if(p.gearGoal&&ANCIENT_FORGE[p.gearGoal])return p.gearGoal;
 if(p.level>60)return '';
 const q=growthTier(p.level),equipped=slot=>gearDefinition(p.gear?.find(i=>i.id===p.gearEquipped?.[slot])?.key||'');
 for(const slot of ['weapon','armor','helmet','wings'])if((equipped(slot)?.quality||0)<q)return `field_${slot}${q}`;
 const key=`path_${p.profession}${Math.max(2,q)}`;if(q>=2&&ANCIENT_FORGE[key]&&equipped('weapon')?.combo!==p.profession)return key;
 return '';
}
export function gearDelta(p,item,en=false){
 const d=gearDefinition(item.key);if(!d||p.level<GEAR_LEVELS[d.quality-1])return '';
 const next={...p,gearEquipped:{...p.gearEquipped,[d.slot]:item.id}},a=ancientGearStats(p),b=ancientGearStats(next);
 const rows=[[en?'Skill power':'技能强度',ancientSkillDamage(next)-ancientSkillDamage(p),''],[en?'HP':'生命',ancientProfileHealth(next)-ancientProfileHealth(p),''],[en?'Reduction':'减伤',(b.reduction-a.reduction)*100,'%'],[en?'Cooldown reduction':'冷却缩减',(b.cooldown-a.cooldown)*100,'%']];
 return rows.filter(([,n])=>Math.abs(n)>.001).map(([label,n,suffix])=>label+' '+(n>0?'+':'')+(suffix?+n.toFixed(1):formatAncientNumber(n))+suffix).join(' · ');
}
export function renderGrowthGoal(parent,{profile:p,en,action}){
 if(p.level>60&&!p.gearGoal)return;
 const L=(a,b)=>en?b:a,el=(tag,text,host)=>{const n=document.createElement(tag);n.textContent=text;host.append(n);return n},key=growthSuggestion(p),goal=el('details','',parent);goal.className='ancientGrowthGoal';
 const head=el('summary',key?L('下一件装备 · ','Next equipment · ')+gearName(key,en):L('已备齐本阶段装备','Stage equipment ready'),goal);
 if(!key){el('p',L(p.level<30?'可以尝试碎骨酋长或戈拉什；打不过时先调整技能与药品。':'可以尝试古根守卫，再挑战水晶巨人。',p.level<30?'Try the Bonebreaker Chief or Gorash; adjust skills and supplies if needed.':'Try the Elderroot Warden, then the Crystal Giants.'),goal);return;}
 const recipe=ANCIENT_FORGE[key],d=gearDefinition(key),preview={id:'growth-preview',key},virtual={...p,gear:[...(p.gear||[]),preview]};el('p',gearDescription(key,en),goal);el('p',gearDelta(virtual,preview,en),goal).className='ancientGearCompare';
 el('small',L(d.quality===3?'来源：森林30–60级普通怪。每次击败获得1份残材，另有机会直接掉装备。':'来源：部落对应等级普通怪（行旅1–9级，猎途10–25级）。每次击败获得1份残材，另有机会直接掉装备。',d.quality===3?'Source: ordinary Lv.30–60 Forest enemies. Each defeat grants 1 salvage, with a chance of equipment.':'Source: ordinary Tribe enemies (Trail Lv.1–9, Hunt Lv.10–25). Each defeat grants 1 salvage, with a chance of equipment.'),goal);
 for(const [material,n]of Object.entries(recipe))el('p',(FORGE_MATERIAL_NAMES[material]?.[en?1:0]||material)+' '+(p.materials[material]||0)+' / '+n,goal);
 const craft=el('button',L('打造这件装备','Craft this equipment'),goal);craft.type='button';craft.disabled=Object.entries(recipe).some(([k,n])=>(p.materials[k]||0)<n);craft.onclick=()=>void action('craftGear',{key});
 if(p.gearGoal){const clear=el('button',L('取消追踪','Stop tracking'),goal);clear.type='button';clear.onclick=()=>void action('gearGoal',{key:''});}
 const next=el('p',L('打造后到装备列表穿戴；多余装备可分解为同品质残材。','Equip crafted gear from the list. Unneeded gear can be salvaged into matching-quality materials.'),goal);next.className='ancientGrowthNote';
}
