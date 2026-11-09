// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {GEAR,GEAR_LEVELS,GEAR_QUALITIES,GEAR_AFFIXES,GEAR_HUNT_SOURCES,FORGE_MATERIAL_NAMES,gearName,gearHuntEligible,gearHuntCounts,gearHuntQuota,gearRerollQuote,gearAffixDescription} from './ancient-gear.js';
import {ANCIENT_KINDS} from './ancient-rules.js';
const el=(parent,tag,value)=>{const node=document.createElement(tag);node.textContent=value;parent.append(node);return node};
const button=(parent,value,handler)=>{const b=el(parent,'button',value);b.type='button';b.onclick=handler;return b};
export function renderGearHunt(parent,p,en,action){
 const L=(zh,eng)=>en?eng:zh;
 el(parent,'h2',L('定向狩猎','Targeted Hunt'));
 const box=el(parent,'section','');box.className='ancientTargetHunt';
 const hunt=p.gearHunt;
 if(hunt){
  const quota=gearHuntQuota(hunt.key),ready=hunt.count>=quota;
  const progress=el(box,'article','');progress.className='ancientHuntProgress';
  el(progress,'small',ready?L('可领取','Ready to claim'):L('当前目标','Current target'));
  el(progress,'strong',gearName(hunt.key,en));
  const meter=el(progress,'progress','');meter.max=quota;meter.value=hunt.count;meter.setAttribute('aria-label',L('狩猎进度','Hunt progress'));
  el(progress,'span',Math.min(hunt.count,quota)+' / '+quota);
  if(ready)button(progress,L('领取装备','Claim gear'),()=>void action('gearHuntClaim'));
 }
 const keys=Object.keys(GEAR).filter(key=>gearHuntEligible(key)&&p.level>=GEAR_LEVELS[GEAR[key].quality-1])
  .sort((a,b)=>GEAR[b].quality-GEAR[a].quality||gearName(a,en).localeCompare(gearName(b,en),en?'en':'zh'));
 if(!keys.length){el(box,'p',L('当前等级暂无可追踪装备','No targets at your level'));return;}
 const picker=el(box,'article','');picker.className='ancientHuntPicker';
 const label=el(picker,'label',L('狩猎目标','Hunt target'));
 const search=el(picker,'input','');search.type='search';search.placeholder=L('搜索装备','Search gear');search.setAttribute('aria-label',search.placeholder);
 const select=el(label,'select','');
 function fill(){
  const previous=select.value||hunt?.key;
  select.replaceChildren();
  for(const key of keys.filter(key=>gearName(key,en).toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase())))
   el(select,'option',gearName(key,en)).value=key;
  if([...select.options].some(option=>option.value===previous))select.value=previous;
 }
 fill();
 const sources=el(picker,'ul',''),hint=el(picker,'small','');
 let confirmKey='';
 const set=button(picker,L('追踪','Track'),()=>{
  if(hunt?.count>0&&confirmKey!==select.value){
   confirmKey=select.value;set.textContent=L('确认更换并清空进度','Confirm switch and reset progress');return;
  }
  void action('gearHuntSet',{key:select.value});
 });
 const maps={tribe:L('部落','Tribe'),forest:L('森林','Forest'),city:L('失落王城','Lost Royal City'),blight:L('蚀影荒原','Shadowblight Wastes'),sanctum:L('净界圣域','Sanctum'),starfall:L('沉星遗迹','Sunken Star Ruins'),frostcourt:L('霜焰王庭','Frostfire Court'),skyreach:L('寂雷天境','Silent Storm Skyreach'),dunes:L('暮沙迷城','Duskglass Labyrinth')};
 const names={chief:L('碎骨酋长','Bonebreaker Chief'),lord:L('远古大酋长·戈拉什','Gorash')};
 function change(){
  const key=select.value;
  confirmKey='';sources.replaceChildren();
  set.disabled=!key||hunt?.key===key;
  set.textContent=hunt?.key===key?L('追踪中','Tracking'):hunt?L('更换目标','Switch target'):L('追踪','Track');
  hint.textContent=key?L('对下列首领取得最高伤害贡献计入进度。','Earn top damage contribution against these bosses.'):'';
  if(!key){el(sources,'li',L('无匹配装备','No matching gear'));return;}
  const minimum=Math.max(1,GEAR_LEVELS[GEAR[key].quality-1]-10);
  for(const [kind,map] of Object.entries(GEAR_HUNT_SOURCES)){
   if(!gearHuntCounts(key,kind,map,minimum))continue;
   const row=el(sources,'li','');
   el(row,'strong',names[kind]||ANCIENT_KINDS[kind]?.[en?'en':'name']||kind);
   el(row,'small',(maps[map]||map)+' · '+L('最低 ','Min. Lv. ')+minimum+L(' 级',''));
  }
 }
 search.oninput=()=>{fill();change();};select.onchange=change;change();

}
export function renderGearReroll(parent,p,item,en,action){
 const L=(zh,eng)=>en?eng:zh,box=el(parent,'section',''),pending=p.gearReroll;
 box.className='ancientRefineWorkshop';
 const quality=GEAR[item.key].quality;
 el(box,'h4',L('隐藏词条','Hidden Affixes'));
 const hidden=el(box,'div','');hidden.className='ancientRefineSeals';
 for(const [index,line] of (item.hiddenAffixes||[]).entries()){
  const unlocked=quality>=index+6,affix=GEAR_AFFIXES[line.key];
  const tile=el(hidden,'article','');tile.dataset.rarity=line.rarity;
  el(tile,'small',GEAR_QUALITIES[index+5][en?1:0]+' · '+(unlocked?L('已解锁','Unlocked'):L('未解锁','Locked')));
  el(tile,'strong',unlocked?gearAffixDescription({affixes:[line]},en):en?affix.en:affix.name);
  el(tile,'span',GEAR_QUALITIES[line.rarity-1][en?1:0]);
 }
 if(pending){
  if(pending.promoted)el(box,'strong',L('升阶成功 · ','Promoted · ')+gearName(pending.promoted,en));
  el(box,'p',gearName(p.gear?.find(v=>v.id===pending.id)?.key||'',en));
  const line=v=>gearAffixDescription({affixes:[v]},en);
  el(box,'p',L('原词条 · ','Original · ')+line(pending.original));el(box,'p',L('新词条 · ','Candidate · ')+line(pending.candidate));
  button(box,L('保留原词条','Keep original'),()=>void action('gearRerollChoose',{id:pending.id,replace:false}));
  button(box,L('换成新词条','Use candidate'),()=>void action('gearRerollChoose',{id:pending.id,replace:true})).disabled=!p.gear?.some(v=>v.id===pending.id&&!v.locked);
  return;
 }
 el(box,'h4',L('洗炼词条','Refine affix'));
 if(quality===6||quality===7)el(box,'small',L('升阶概率 ','Promotion chance ')+(quality===6?'1%':'0.5%'));
 for(const [index,affix] of (item.affixes||[]).entries()){
  const quote=gearRerollQuote(item,index,()=>0);if(!quote)continue;
  const label=gearAffixDescription({affixes:[affix]},en)||GEAR_AFFIXES[affix.key]?.[en?'en':'name'];
  const material=FORGE_MATERIAL_NAMES[quote.material]?.[en?1:0]||quote.material;
  button(box,label+' · '+material+' '+(p.materials[quote.material]||0)+'/'+quote.cost,()=>void action('gearRerollStart',{id:item.id,index})).disabled=!!item.locked||(p.materials[quote.material]||0)<quote.cost;
 }
}
