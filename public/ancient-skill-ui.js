import {FUSION_PASSIVES,FUSION_SCROLLS,FUSION_PASSIVE_REQUIREMENTS,ignitionEligible,passiveCost} from './ancient-fusion-passives.js';
import {advancementDescription} from './ancient-advancement-descriptions.js';
import {ADVANCED_PROFESSIONS,ADVANCEMENT_KEYS,advancementCastKey} from './ancient-advanced-professions.js';
import {FUSION_DAMAGE_MULTIPLIER,masteryLevel,masteryCost,masteryPower,releasableSkeletons} from './ancient-mastery.js';
// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {ancientKeyLabel,ancientBindingVersion} from './ancient-input-settings.js';
import {renderBranchPanel} from './ancient-branch-ui.js?v=20261017-guide-position-1';
import {PROFESSIONS,PROFESSION_FUSIONS,FUSION_SKILL_REQUIREMENT,isFusionJob,isFusionSkill,SKILLS,skillBook,skillTrainingCost,skillDescription,skillDamagePreview,activeSkill} from './ancient-skills.js?v=20261109-cast-range-60';
import {renderAscensionPanel} from './ancient-ascension-ui.js?v=ascension-entry';
import {openSkillPreview} from './ancient-skill-preview.js?v=advancement';
import {isHoly,holyPower,holyName,holySkillDetails,ascensionEligible,ascensionProgress} from './ancient-ascension.js?v=20261014-new-professions-1';
import {ancientGearStats,ancientSkillDamage} from './ancient-gear.js';
import {equippedAncientSkin} from './ancient-skins.js';
export function createAncientSkillUI({getProfile,getPlayer,en,action,cast,slot,request,join,open}){
 const L=(zh,english)=>en()?english:zh,el=(tag,text,parent)=>{const n=document.createElement(tag);n.textContent=text;parent?.append(n);return n},btn=(text,fn,parent)=>{const n=el('button',text,parent);n.type='button';n.onclick=fn;return n};
 const hud=el('div','',document.getElementById('ancientHud'));hud.id='ancientSkillHud';const bar=el('div','',hud);bar.className='ancientSkillBar';const buttons=new Map();const tools=el('div','',hud);tools.className='ancientSkillTools';const hint=el('small','',hud);let lastJob='',lastTools='',lastDraw=0;
 const descriptions={
  shadowblade:['位移多，能打完撤回。','需要瞄准和把握返回时机。','Dash in and retreat quickly.','Requires aim and well-timed returns.'],
  stonewright:['范围控制强，适合成群敌人。','重击有蓄力，移动目标容易躲开。','Controls groups with wide attacks.','Heavy attacks take time to land.'],
  swordsman:['连斩和巨剑能快速打出爆发。','缺少回复，打空后要等冷却。','Combines rapid cuts with heavy burst.','Little healing and costly misses.'],
  warrior:['回血和增伤适合近身作战。','狂暴时受到的伤害也会增加。','Healing and buffs support close combat.','Rage also increases damage taken.'],
  summoner:['铁甲兽能帮你打怪和吸引火力。','要管理召唤兽和技能印记。','Your beast fights alongside you.','Requires managing the beast and its marks.'],
  ice:['减速和护甲能缓解被围攻的压力。','持续范围技能需要敌人留在原地。','Slows enemies and reduces incoming damage.','Persistent attacks need enemies to stay in range.'],
  fire:['持续火焰能覆盖一片区域。','敌人离开火焰后，持续伤害会落空。','Keeps an area burning for sustained damage.','Mobile enemies can leave the flames.'],
  lightning:['连锁攻击适合成群敌人，也能快速位移。','敌人分得太开时，连锁效果会变弱。','Chains through groups and moves quickly.','Chains lose value against scattered foes.'],
  curse:['能削弱敌人，也能靠汲取回血。','先挂诅咒再输出才能发挥强度。','Weakens enemies and steals health.','Works best after setting up a curse.'],
 };
 const types={
  shadowstep:[1,3],shadowreturn:[1,3],nightfall:[1,2],riftblade:[0],
  faultline:[1],stoneprison:[1],mountainfall:[1],stonefist:[1],
  triplecut:[0],swordrain:[1],phantomblade:[0],swordwave:[0],
  vitality:[2,4],power:[1,2],rage:[1,2],slash:[1],
  summon:[2],weaken:[0],transform:[2],soulbolt:[0],
  icebolt:[0],icearmor:[1,2],blizzard:[1],frostburst:[1],
  firewave:[1],firestorm:[1],inferno:[1],firebolt:[0],
  chain:[1],haste:[1,2,3],storm:[1],tempest:[1],hex:[0],drain:[0,4],doom:[1],
 };
 const fusionDescriptions={
  raiseSkeleton:['储备一只骷髅战士并获得3点精通。储备上限为技能等级²。','Raise one reserve skeleton and gain 3 mastery. Reserve capacity is skill level².'],
  unleashLegion:['出战上限为召唤等级² + 2，超出的骷髅继续待命。','Deploy up to the active limit of Raise Skeleton level² + 2. Extras remain in reserve.'],
  consumeSoul:['持续期间击杀符合等级条件的敌人，永久强化骷髅，并按吞噬强度获得精通。','Qualifying kills permanently strengthen your skeletons and grant mastery based on the strength gained.'],
  necropolis:['强化领域内骷髅并削弱敌人。','Empower skeletons in the field and weaken enemies.'],
  prism:['单体 420% 攻击，概率触发多种元素，连锁余震造成75%伤害。立即回复实伤15%，减伤20%持续4秒。','420% single-target damage with elemental procs and a 75% Arc Echo. Heal 15% of damage and gain 20% reduction for 4s.'],
  judgment:['目标周围12米造成510%攻击，概率触发元素，回复实伤20%，减伤35%持续4秒。','510% damage within 12m of the target, elemental procs, 20% healing and 35% reduction for 4s.'],
  erosion:['7秒内目标受伤+20%、攻击和移速−15%，每秒造成28%攻击。','For 7s: target takes 20% more damage, loses 15% attack and speed, and takes 28% attack per second.'],
  siphon:['持续6秒，主目标每秒受到55%攻击伤害，距离自己最近的另外两只怪物各承受主目标25%的窃取伤害。实际伤害的75%回复生命。','For 6s, deal 55% attack per second to the selected target and 25% of that damage to each of the two nearest other monsters. Heal for 75% of damage dealt.'],
  voidslash:['440%攻击，标记目标。再斩引爆，造成720%攻击。','440% damage and a mark. The next slash detonates for 720%.'],
  riftassault:['突袭至目标身后，沿途420%攻击。6秒内再按返回。','Dash behind the target for 420% path damage. Recast within 6s to return.'],
  voiddomain:['持续8秒，减速敌人，强化攻击与移动，允许突袭越过部分障碍。','Slows enemies, boosts attack and movement, and lets Rift Assault cross some barriers for 8s.'],
  execution:['连续五斩，每斩165%，期间短暂无敌。引爆印记并波及周围。','Five cuts for 165% each with brief invulnerability. Detonates the mark and damages nearby enemies.'],
  abysstouch:['360%攻击，侵蚀最多叠5层，每层每秒26%。','360% damage and up to five corruption stacks, each dealing 26% per second.'],
  devour:['吞噬侵蚀，300%攻击加每层90%，回血35%；击杀传播。','Consume corruption for 300% plus 90% per stack. Heal 35% and spread on kill.'],
  descent:['消耗12%最大生命，生成8秒领域，压低敌方攻击并汲取生命。','Spend 12% max HP for an 8s field that weakens enemies and drains life.'],
  avatar:['消耗30深渊能量。化身持续10秒，持续失血并强化侵蚀与吸血。','Spend 30 Abyssal Energy. Transform for 10s, losing health while empowering corruption and lifesteal.'],
  temporalrift:['440%攻击，扰乱时间，重复攻击引爆为720%。','440% damage and time disruption. Repeated hits detonate for 720%.'],
  chronoshift:['向前跃迁12米，落点周围造成260%攻击；6秒内再按返回，瞄中敌人会引爆残影。','Shift forward 12m and deal 260% damage around the landing point. Recast within 6s to return, or aim at an enemy to detonate the anchor.'],
  rewind:['8秒内可回到原生命与位置并恢复其他技能冷却。','Recast within 8s to restore health, position and other cooldowns.'],
  stasis:['冻结12米内普通怪物4秒并延后结算伤害，每秒造成105%攻击。首领大幅减速。','Freeze regular enemies within 12m for 4s and bank damage, dealing 105% attack per second. Bosses are heavily slowed.'],
 };
 const fusionTypes={
  raiseSkeleton:['召唤','Summon'],unleashLegion:['召唤','Summon'],consumeSoul:['增益','Buff'],necropolis:['群体 / 增益','Area / Buff'],
  prism:['单体 / 恢复 / 增益','Single target / Healing / Buff'],judgment:['群体 / 恢复 / 增益','Area / Healing / Buff'],erosion:['单体','Single target'],siphon:['群体 / 恢复','Area / Healing'],
  voidslash:['单体','Single target'],riftassault:['群体 / 位移','Area / Movement'],voiddomain:['群体 / 增益','Area / Buff'],execution:['群体 / 增益','Area / Buff'],
  abysstouch:['单体 / 恢复','Single target / Healing'],devour:['单体 / 恢复','Single target / Healing'],descent:['群体 / 恢复','Area / Healing'],avatar:['增益 / 恢复','Buff / Healing'],
  temporalrift:['单体','Single target'],chronoshift:['群体 / 位移','Area / Movement'],rewind:['恢复 / 位移','Healing / Movement'],stasis:['群体','Area'],
 };
 const selectedRoute=p=>ADVANCED_PROFESSIONS[p?.profession]?.find(route=>route.id===p.advancements?.[p.profession]?.route);
 const masteryGoal=level=>Math.ceil((25+level*level*12)*1.2);
 const fusionText=id=>L(...fusionDescriptions[id]);
 let ignitionOpen=false;
 function renderIgnition(card,p){
  const entries=FUSION_PASSIVES[p.profession];
  if(!entries)return;
  const toggle=btn(L('被动点亮','Passive ignition'),()=>{
   ignitionOpen=!ignitionOpen;panel.hidden=!ignitionOpen;
   toggle.setAttribute('aria-expanded',String(ignitionOpen));
  },card);
  toggle.setAttribute('aria-expanded',String(ignitionOpen));
  const panel=el('section','',card);
  panel.hidden=!ignitionOpen;
  panel.className='ancientAscensionEntry';
  const art=el('div','',panel);art.className='ancientIgnitionArt';art.setAttribute('aria-hidden','true');
  const progressByStage=p.fusionPassives?.[p.profession]||{};
  const nextStage=entries.findIndex((_,index)=>!progressByStage[index]?.level);
  const grid=el('div','',panel);grid.className='ancientProfessionList';
  entries.forEach(([zh,eng,detail,detailEn],index)=>{
   const item=el('article','',grid);item.className='weaponCard';
   el('strong',L('第 '+(index+2)+' 次点亮','Ignition '+(index+2))+' · '+L(zh,eng),item);
   el('p',L(detail,detailEn),item);
   const progress=p.fusionPassives?.[p.profession]?.[index];
   if(progress){
    el('small',L('等级','Level')+' '+progress.level,item);
    if(progress.level<100){
     const bar=el('progress','',item);bar.max=passiveCost(progress.level);bar.value=progress.points;
     el('small',progress.points+' / '+bar.max,item);
    }
    return;
   }
   const level=FUSION_PASSIVE_REQUIREMENTS[index];
   el('small',L('所有有等级的技能及此前点亮被动达到 '+level+' 级','All leveled skills and earlier passives must reach level '+level),item);
   if(index!==nextStage){
    el('p',L('未解锁 · 请先完成第 '+(index+1)+' 次点亮','Locked · Complete Ignition '+(index+1)+' first'),item);
    return;
   }
   const previous=FUSION_PASSIVE_REQUIREMENTS.slice(0,index).map((_,i)=>({
    name:entries[i][en()?1:0],rank:progressByStage[i]?.level||0,
   }));
   const skills=PROFESSIONS[p.profession].skills.filter(id=>id!=='unleashLegion').map(id=>({
    name:L(SKILLS[id].name,SKILLS[id].en),
    rank:p.advancements?.[p.profession]?.skills?.[SKILLS[id].key]?.level??masteryLevel(p,id),
   }));
   for(const {name,rank} of [...skills,...previous])if(rank<level)el('small',name+' · '+rank+' / '+level,item);
   const options=el('div','',item);options.className='ancientIgnitionScrolls';
   const eligible=ignitionEligible(p,index);
   for(const [id,scroll] of Object.entries(FUSION_SCROLLS)){
    const count=p.materials['supply:'+id]||0;
    const button=btn(L(scroll.name,scroll.en)+' · '+Math.round(scroll.odds[index]*100)+'% · ×'+count,async()=>{
     if(!window.confirm(L('消耗一张'+scroll.name+'尝试点亮？','Use one '+scroll.en+' to attempt ignition?')))return;
     for(const option of options.children)option.disabled=true;
     await action('igniteFusionPassive',{index,scroll:id});
    },options);
    button.disabled=!eligible||!count;
   }
  });
 }
 function renderProfessions(card){
  const p=getProfile(), refresh=()=>{if(card.isConnected)open('professions')};
  el('h2',L('职业','Professions'),card);
  const currentJob=PROFESSIONS[p.profession],currentRoute=selectedRoute(p);
  if(currentJob){
   el('h3',currentJob.icon+' '+L(currentJob.name,currentJob.en)+(currentRoute?' · '+L(...currentRoute.name):''),card);
   if(!currentRoute&&ADVANCED_PROFESSIONS[p.profession]?.length){
    el('h3',L('升华分支','Advancement paths'),card);
    const routes=el('div','',card);
    routes.className='ancientProfessionList';
    for(const route of ADVANCED_PROFESSIONS[p.profession]){
     const item=el('article','',routes);
     item.className='weaponCard';
     el('strong',L(...route.name),item);
     route.skills.forEach((name,index)=>{
      el('strong',ADVANCEMENT_KEYS[index]+' · '+L(...name),item);
      el('span',advancementDescription(route.id,index,en()),item);
     });
     el('small',advancementDescription(route.id,4,en()),item);
     btn(L('3D 技能与外观','3D skills and appearance'),()=>openSkillPreview(p.profession,{en,advancement:route}),item);
     if(isHoly(p))btn(L('选择此路线','Choose this path'),async()=>{
      if(window.confirm(L('升华路线只能选择一次。确定选择 '+L(...route.name)+'？','This choice is permanent. Choose '+L(...route.name)+'?')))await action('chooseAdvancement',{route:route.id});
     },item);
    }
   }
  }
  if(p.profession){
   renderIgnition(card,p);
   render(card);
   btn(L('职业试炼','Profession Trials'),()=>open('trials'),card);
   if(!ascensionProgress(p)?.holy){
    const trial=el('details','',card);trial.className='ancientAscensionEntry';trial.open=ascensionEligible(p)||!!ascensionProgress(p)?.permit;
    el('summary',L('圣级试炼','Holy Ascension Trial'),trial);
    renderAscensionPanel(trial,{getProfile,en,job:p.profession,request,join,refresh});
   }
   renderBranchPanel(card,{p,job:p.profession,en,action,refresh});
  }
  const toggle=currentJob?btn(L('其他职业','Other professions'),()=>{
   change.hidden=!change.hidden;
   toggle.setAttribute('aria-expanded',String(!change.hidden));
  },card):null;
  const change=el('section','',card);
  change.className='ancientAscensionEntry';
  change.hidden=!!currentJob;
  if(toggle){
   toggle.setAttribute('aria-expanded','false');
   el('h3',L('转职','Change profession'),change);
   el('p',L('15级开放转职，每次消耗一本转职书。','Changing profession unlocks at level 15 and costs one change book.'),change);
  }
  const list=el('div','',change);list.className='ancientProfessionList';
  for(const [id,job] of Object.entries(PROFESSIONS)){
   if(id===p.profession||p.consumedJobs?.[id]||isFusionJob(id)&&!p.fusedJobs?.[id])continue;
   const item=el('article','',list);item.className='weaponCard';
   el('strong',job.icon+' '+L(job.name,job.en),item);
   const [good,bad,goodEn,badEn]=descriptions[id]||['自带圣级技能','融合会永久消耗配方职业','Holy skills unlocked','Fusion permanently consumes its source professions'];
   el('span',L('优点','Strength')+' · '+L(good,goodEn),item);
   el('small',L('缺点','Trade-off')+' · '+L(bad,badEn),item);
   const controls=el('div','',item);controls.className='ancientWorkspaceLinks';
   btn(L('3D 技能预览','3D skill preview'),()=>openSkillPreview(id,{en,level:3,skin:id===p.profession?equippedAncientSkin(p):undefined}),controls);
   const choose=btn(p.profession?L('转职','Change profession'):L('选择职业','Choose profession'),async()=>{
    choose.disabled=true;
    await action('chooseProfession',{job:id});
    if(choose.isConnected)choose.disabled=false;
   },controls);
   choose.disabled=!!p.profession&&(p.level<15||(p.materials['supply:transfer']||0)<1);
  }
  const fusion=el('details','',change);
  fusion.className='ancientAscensionEntry';
  el('summary',L('职业融合','Profession fusion'),fusion);
  const roles={
   elementalist:['多元素联动，能回血和减伤，缺少主动位移。','Combines elemental effects, healing and defense. No active dash.'],
   voidsword:['印记、突进和回撤组成爆发连招，恢复能力较弱。','Marks and dashes set up burst combos. Limited healing.'],
   necromancer:['积攒并派出骷髅军团，击杀可以永久强化骷髅。','Build a skeleton army and strengthen it permanently through kills.'],
   abyssal:['用生命换取持续输出，再从敌人身上汲取生命。','Trades health for sustained damage and steals it back.'],
   chrono:['靠时间锚点、回溯和静止改变战斗节奏，依赖释放时机。','Uses anchors, rewinds and stasis to control combat timing.'],
  };
  for(const [id, recipe] of Object.entries(PROFESSION_FUSIONS)){
   const item=el('article','',fusion);
   item.className='weaponCard';
   el('strong',L(recipe.name,recipe.en),item);
   el('span',L(...roles[id]),item);
   for(const source of recipe.sources){
    const job=PROFESSIONS[source];
    const trained=job.skills.filter(skill=>(p.skills?.[skill]||0)>=FUSION_SKILL_REQUIREMENT).length;
    el('small',L(job.name,job.en)+' · '+trained+'/'+job.skills.length+' '+L('个技能达到5级','skills at level 5'),item);
   }
   const ready=recipe.sources.every(source=>!p.consumedJobs?.[source]&&PROFESSIONS[source].skills.every(skill=>(p.skills?.[skill]||0)>=5));
   for(const skill of PROFESSIONS[id].skills)el('small',L(SKILLS[skill].name,SKILLS[skill].en)+' · '+fusionText(skill),item);
   const fuse=btn(p.fusedJobs?.[id]?L('已解锁','Unlocked'):L('融合并转职','Fuse and equip'),()=>{
    const sources=recipe.sources.map(source=>L(PROFESSIONS[source].name,PROFESSIONS[source].en)).join(' / ');
    const blocked=Object.entries(PROFESSION_FUSIONS).filter(([other,entry])=>other!==id&&!p.fusedJobs?.[other]&&entry.sources.every(source=>!p.consumedJobs?.[source])&&entry.sources.some(source=>recipe.sources.includes(source))).map(([,entry])=>L(entry.name,entry.en));
    const consequence=blocked.length?'\n'+L('将无法再融合 ','This will lock out ')+blocked.join(' / '):'';
    if(window.confirm(L('将永久消耗 ','Permanently consume ')+sources+consequence+'\n'+L('确认融合？','Continue?')))void action('fuseProfession',{job:id});
   },item);
   fuse.disabled=p.level<15||!ready||!!p.fusedJobs?.[id];
  }
 }
 function render(card){
  const p=getProfile(),job=PROFESSIONS[p.profession];
  el('h2',L('技能','Skills'),card);
  if(!job){btn(L('选择职业','Choose profession'),()=>open('professions'),card);return}
  const list=el('div','',card);list.className='ancientSkillList';
  const route=selectedRoute(p);
  if(route){
   for(const [index,key] of ADVANCEMENT_KEYS.entries()){
    const skill=p.advancements[p.profession].skills[key],goal=masteryGoal(skill.level);
    const item=el('section','',list);item.className='weaponCard ancientSkillCard';
    el('strong',ancientKeyLabel('Key'+key,en())+' · '+L(...route.skills[index]),item);
    el('small',L('技能等级','Skill level')+' · '+skill.level,item);
    el('p',advancementDescription(route.id,index,en()),item);
    if(skill.level<100){
     const progress=el('progress','',item);progress.max=goal;progress.value=skill.points;
     progress.setAttribute('aria-label',L('技能精通进度','Mastery progress'));
     el('small',skill.points+' / '+goal,item);
    }
   }
   return;
  }

  for(const id of (isFusionJob(p.profession)?[...job.skills].sort((a,b)=>'XQZC'.indexOf(SKILLS[a].key)-'XQZC'.indexOf(SKILLS[b].key)):job.skills)){
   const skill=SKILLS[id], level=p.skills?.[id]||0, cost=skillTrainingCost(level), books=p.materials[skillBook(id)]||0;
   const item=el('section','',list);item.className='weaponCard ancientSkillCard';
   el('strong',ancientKeyLabel('Key'+skill.key,en())+' · '+holyName(L(skill.name,skill.en),en(),isHoly(p)),item);
   el('small',level?L('技能当前等级','Current skill level')+' · '+level:L('技能解锁等级','Required player level')+' · '+skill.unlock,item);
   if(isFusionSkill(id)){
    if(id==='unleashLegion'){
     item.querySelector('small').remove();
     el('span',L('技能类型','Skill type')+' · '+L(...fusionTypes[id]),item);
     el('p',fusionText(id),item);
     el('small',L('冷却','Cooldown')+' · '+skill.cooldown+'s',item);
     continue;
    }
    const rank=masteryLevel(p,id),points=p.mastery?.[id]?.points||0,cost=masteryCost(id,rank);
    item.querySelector('small').textContent=L('技能等级','Skill level')+' · '+rank;
    el('span',L('技能类型','Skill type')+' · '+L(...fusionTypes[id]),item);
    if(id==='necropolis')el('small',L('领域半径','Field radius')+' · '+(8+rank*.22).toFixed(1)+' m',item);
    if(id==='raiseSkeleton')el('small',L('当前储备上限','Current reserve capacity')+' · '+(rank**2),item);
    if(rank<100){
     const bar=el('progress','',item);bar.max=cost;bar.value=points;bar.setAttribute('aria-label',L('技能精通进度','Mastery progress'));
     el('small',L('技能点','Skill points')+' · '+points+' / '+cost,item);
    }
    if(rank>=20){
     const evolutions={prism:['余震额外连锁一个目标','Arc Echo jumps to an additional target'],judgment:['余震额外连锁一个目标','Arc Echo jumps to an additional target'],voidslash:['印记爆炸波及附近敌人','Mark detonation hits nearby enemies'],abysstouch:['侵蚀可叠至7层','Corruption stacks up to seven'],stasis:['静止领域半径增加2米','Stasis radius increases by 2m']};
     if(evolutions[id])el('strong',L('机制进化','Skill evolution')+' · '+L(...evolutions[id]),item);
    }
    el('small',L('融合伤害倍率','Fusion damage multiplier')+' ×'+FUSION_DAMAGE_MULTIPLIER,item);
    el('small',L('精通强度倍率','Mastery power multiplier')+' ×'+masteryPower(p,id).toFixed(2),item);
    el('p',fusionText(id),item);
    el('small',L('冷却','Cooldown')+' · '+skill.cooldown+'s',item);
    continue;
   }
   const labels=L(['单体','群体','增益','位移','恢复'],['Single target','Area','Buff','Movement','Healing']);
   el('span',L('技能类型','Skill type')+' · '+types[id].map(index=>labels[index]).join(' / '),item);
   el('p',skillDescription(id,level,en()),item);
   const {direct,tick,conditional}=skillDamagePreview(id,level);
   if(level){
    const base=ancientSkillDamage(p)*holyPower(p);
    const amount=value=>Math.floor(base*value).toLocaleString();
    const parts=[];
    if(direct)parts.push(L('每次命中','Per hit')+' '+amount(direct));
    if(tick)parts.push(L('每秒','Per second')+' '+amount(tick));
    if(conditional)parts.push((id==='drain'?L('目标带印记','Marked target'):L('回撤斩击','Return strike'))+' '+amount(conditional));
    if(id==='summon')parts.push(L('召唤兽每次攻击','Beast attack')+' '+amount((.75+.05*level)*(1+ancientGearStats(p).pet)));
    if(parts.length)el('span',L('无药水伤害','Unbuffed damage')+' · '+parts.join(' · '),item);
   }
   if(isHoly(p))el('small',holySkillDetails(id,level,en()),item);
   else el('small',L('圣级要求 · 玩家80级，当前职业全部技能5级，通过升华试炼。','Holy requirements · Level 80, every skill at level 5, and completion of the ascension trial.'),item);
   el('small',L('技能书','Skill books')+' '+books+'/'+cost.books+(level?' · '+L('相位核心','Phase Cores')+' '+cost.cores+' · '+L('金币','Gold')+' '+cost.coins:''),item);
   const upgrade=btn(level?L('升级技能','Upgrade skill'):L('解锁技能','Unlock skill'),()=>void action('trainSkill',{id}),item);
   upgrade.disabled=p.level<skill.unlock||books<cost.books||(p.materials.core||0)<cost.cores||(p.coins||0)<cost.coins||!Number.isSafeInteger(cost.books);
  }
 }
 function update(time,paused=false){if(time-lastDraw<100)return;lastDraw=time;const p=getProfile(),a=getPlayer(),job=PROFESSIONS[p?.profession];hud.hidden=paused||!job||!a||a.hp<=0;if(!job||paused)return;const route=selectedRoute(p),key=p.profession+':'+(route?.id||'')+':'+en();if(route){
  if(key!==lastJob){lastJob=key;bar.replaceChildren();buttons.clear();tools.replaceChildren();hint.textContent='';for(const key of ADVANCEMENT_KEYS){
   const id='advanced:'+key,b=btn('',()=>cast(id),bar);b.dataset.layoutKey='skill-'+key;buttons.set(id,b);
  }}
  for(const [id,b] of buttons){
   const key=advancementCastKey(id),index=ADVANCEMENT_KEYS.indexOf(key),now=Date.now(),runtime=a.skillRuntime;
   const cd=Math.max(0,Math.ceil(((runtime?.cooldowns[id]||0)-now)/1000));
   const ready=route.id==='time-sovereign'&&(key==='Z'&&(runtime?.advancedTime?.rewind?.until||0)>now||key==='Q'&&(runtime?.advancedTime?.anchor?.until||0)>now)||key==='Q'&&(route.id==='shadowhunter'&&runtime?.advancedShadow?.anchor||route.id==='riftlord'&&(runtime?.advancedRift?.anchor?.until||0)>now||route.id==='voltstalker'&&(runtime?.volt?.followupUntil||0)>now);
   b.textContent=ancientKeyLabel('Key'+key,en())+' · '+L(...route.skills[index])+(cd&&!ready?' · '+cd+'s':'');
   b.disabled=cd>0&&!ready;
   b.classList.toggle('selected',!!ready);
  }
  return;
 }if(key!==lastJob){lastJob=key;bar.replaceChildren();buttons.clear();for(const id of job.skills){const b=btn('',()=>cast(id),bar);b.dataset.layoutKey='skill-'+SKILLS[id].key;buttons.set(id,b)}}for(const [id,b]of buttons){const s=SKILLS[id],n=p.skills?.[id]||0,cd=Math.max(0,Math.ceil(((a.skillRuntime?.cooldowns?.[id]||0)-Date.now())/1000)),duration=Math.max(0,Math.ceil(((id==='summon'?a.skillRuntime?.summon?.until||0:id==='consumeSoul'?a.skillRuntime?.advancedSummon?.consumeUntil||0:a.skillRuntime?.effects?.[id]?.until||0)-Date.now())/1000));const available=id==='unleashLegion'?releasableSkeletons(p,a.skillRuntime?.advancedSummon):null;const label=`${ancientKeyLabel('Key'+s.key,en())} · ${holyName(en()?s.en:s.name,en(),!!a.holy)}${available===null?'':' ('+available.toLocaleString()+')'}${duration?' · '+duration+'s':cd?' · '+cd+'s':n?'':' · Lv.0'}`;if(b.textContent!==label)b.textContent=label;b.disabled=n===0||(cd>0&&!((id==='shadowreturn'&&(a.skillRuntime?.shadowAnchor?.until||0)>Date.now()||['riftassault','chronoshift'].includes(id)&&(a.skillRuntime?.fusion?.anchor?.until||0)>Date.now()||id==='rewind'&&(a.skillRuntime?.fusion?.rewind?.until||0)>Date.now())))||!!activeSkill(a,'transform')||id==='summon'&&!!a.skillRuntime?.summon;b.classList.toggle('selected',duration>0||id==='summon'&&!!a.skillRuntime?.summon)}const pet=a.skillRuntime?.summon,form=activeSkill(a,'transform'),weaken=(p.skills?.weaken||0)>0;const toolKey=[p.profession,!!pet,form>0,weaken,en(),ancientBindingVersion()].join(':');if(lastTools!==toolKey){lastTools=toolKey;tools.replaceChildren();if(form)btn(L('1 · 爪子','1 · Claws'),()=>slot(1),tools);else if(p.profession==='summoner'){btn(L('1 · 主手','1 · Melee'),()=>slot(1),tools);if(pet)btn(L('2 · 锁定印记','2 · Command sigil'),()=>slot(2),tools);if(weaken)btn((pet?'3':'2')+' · '+L('削弱印记','Weakening sigil'),()=>slot(pet?3:2),tools)}}for(const [index,b]of [...tools.children].entries()){b.dataset.layoutKey='tool-'+index;b.dataset.toolSlot=String(index+1);const label=ancientKeyLabel('Digit'+(index+1),en())+' · '+b.textContent.split(' · ').slice(1).join(' · ');if(b.textContent!==label)b.textContent=label;}const text=form?L('变身中 · 左键爪击','BEAST FORM · LMB claw attack'):pet?`${L('铁甲兽','Armored Beast')} ${Math.ceil(pet.hp)}/${pet.maxHp} · ${Math.max(0,Math.ceil((pet.until-Date.now())/1000))}s · ${L('2锁定印记命中怪物指挥攻击','2 command sigil: hit a monster to mark it')}`:p.profession==='summoner'&&weaken?L('1主手 · 2削弱印记 · 左键命中生效','1 melee · 2 weakening sigil · LMB hit to apply'):'';const mappedText=text.replace(/LMB|左键/g,ancientKeyLabel('Mouse0',en())).replace(/([123])(?=锁定|主手|削弱| command| melee| weakening)/g,(_,n)=>ancientKeyLabel('Digit'+n,en()));if(hint.textContent!==mappedText)hint.textContent=mappedText;for(const b of tools.children){const chosen=Number(b.dataset.toolSlot)===(a.skillRuntime?.mode||1);b.classList.toggle('selected',chosen)}}
 return {render,renderProfessions,update};
}
