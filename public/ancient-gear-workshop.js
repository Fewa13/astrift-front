// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {GEAR,GEAR_LEVELS,GEAR_AFFIXES,GEAR_HUNT_SOURCES,FORGE_MATERIAL_NAMES,gearName,gearHuntEligible,gearHuntCounts,gearHuntQuota,gearRerollQuote,gearAffixDescription} from './ancient-gear.js';
import {ANCIENT_KINDS} from './ancient-rules.js';
const el=(parent,tag,value)=>{const node=document.createElement(tag);node.textContent=value;parent.append(node);return node};
const button=(parent,value,handler)=>{const b=el(parent,'button',value);b.type='button';b.onclick=handler;return b};
export function renderGearHunt(parent,p,en,action){
 const L=(zh,eng)=>en?eng:zh,box=el(parent,'details','');box.className='ancientGrowthGoal';
 el(box,'summary',L('定向狩猎','Targeted hunt')+(p.gearHunt?' · '+p.gearHunt.count+'/'+gearHuntQuota(p.gearHunt.key):''));
 el(box,'p',L('选择一件套装装备。在下列官方地图对符合条件的头目打出最高贡献，攒满后兑换该装备，词条随机。更换目标会重置进度。','Choose a set piece. Earn top damage contribution against eligible official bosses. Redeem the piece with random affixes. Switching targets resets progress.'));
 const select=el(box,'select','');select.setAttribute('aria-label',L('选择狩猎目标','Choose hunt target'));
 const keys=Object.keys(GEAR).filter(key=>gearHuntEligible(key)&&p.level>=GEAR_LEVELS[GEAR[key].quality-1]);
 if(!keys.length){el(box,'p',L('暂无符合等级的套装装备。','No eligible set pieces at your level.'));select.remove();return;}
 for(const key of keys)el(select,'option',gearName(key,en)).value=key;
 if(keys.includes(p.gearHunt?.key))select.value=p.gearHunt.key;
 const sources=el(box,'p',''),set=button(box,L('设为狩猎目标','Track this hunt'),()=>void action('gearHuntSet',{key:select.value}));
 const maps={tribe:L('部落','Tribe'),forest:L('森林','Forest'),city:L('失落王城','Lost Royal City'),blight:L('蚀影荒原','Shadowblight Wastes'),sanctum:L('净界圣域','Sanctum'),starfall:L('沉星遗迹','Sunken Star Ruins'),frostcourt:L('霜焰王庭','Frostfire Court'),skyreach:L('寂雷天境','Silent Storm Skyreach'),dunes:L('暮沙迷城','Duskglass Labyrinth')};
 const names={chief:L('碎骨酋长','Bonebreaker Chief'),lord:L('远古大酋长·戈拉什','Gorash')};
 function change(){
  const key=select.value,minimum=Math.max(1,GEAR_LEVELS[GEAR[key].quality-1]-10);
  const bosses=Object.entries(GEAR_HUNT_SOURCES).filter(([kind,map])=>gearHuntCounts(key,kind,map,minimum)).map(([kind,map])=>maps[map]+' · '+(names[kind]||ANCIENT_KINDS[kind]?.[en?'en':'name']||kind));
  sources.textContent=L('目标首领（至少 ', 'Eligible bosses (minimum Lv. ')+minimum+L(' 级） · ',') · ')+bosses.join('、');
  set.disabled=p.gearHunt?.key===key;
 }
 select.onchange=change;change();
 if(p.gearHunt){el(box,'p',gearName(p.gearHunt.key,en)+' · '+p.gearHunt.count+'/'+gearHuntQuota(p.gearHunt.key));button(box,L('兑换装备','Redeem gear'),()=>void action('gearHuntClaim')).disabled=p.gearHunt.count<gearHuntQuota(p.gearHunt.key);}
}
export function renderGearReroll(parent,p,item,en,action){
 const L=(zh,eng)=>en?eng:zh,box=el(parent,'details',''),pending=p.gearReroll;
 box.className='ancientGrowthGoal';el(box,'summary',L('词条改造台','Affix workshop'));box.open=!!pending;
 if(pending){
  el(box,'p',gearName(p.gear?.find(v=>v.id===pending.id)?.key||'',en));
  const line=v=>gearAffixDescription({affixes:[v]},en);
  el(box,'p',L('原词条 · ','Original · ')+line(pending.original));el(box,'p',L('新词条 · ','Candidate · ')+line(pending.candidate));
  button(box,L('保留原词条','Keep original'),()=>void action('gearRerollChoose',{id:pending.id,replace:false}));
  button(box,L('换成新词条','Use candidate'),()=>void action('gearRerollChoose',{id:pending.id,replace:true})).disabled=!p.gear?.some(v=>v.id===pending.id&&!v.locked);
  return;
 }
 el(box,'p',L('选择一条词条改造。生成候选时扣除残材，可以保留旧词条。','Choose one affix. Salvage is spent when the candidate is rolled. You may keep the original.'));
 for(const [index,affix] of (item.affixes||[]).entries()){
  const quote=gearRerollQuote(item,index,()=>0);if(!quote)continue;
  const label=gearAffixDescription({affixes:[affix]},en)||GEAR_AFFIXES[affix.key]?.[en?'en':'name'];
  const material=FORGE_MATERIAL_NAMES[quote.material]?.[en?1:0]||quote.material;
  button(box,label+' · '+material+' '+(p.materials[quote.material]||0)+'/'+quote.cost,()=>void action('gearRerollStart',{id:item.id,index})).disabled=!!item.locked||(p.materials[quote.material]||0)<quote.cost;
 }
}
