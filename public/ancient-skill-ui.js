// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {formatAncientNumber} from './ancient-number-format.js';
import {ancientKeyLabel,ancientBindingVersion} from './ancient-input-settings.js';
import {renderBranchPanel} from './ancient-branch-ui.js?v=20261017-guide-position-1';
import {PROFESSIONS,SKILLS,skillBook,skillTrainingCost,skillDescription,activeSkill} from './ancient-skills.js?v=20261109-cast-range-60';
import {renderAscensionPanel} from './ancient-ascension-ui.js?v=20261012-ascension-1';
import {openSkillPreview} from './ancient-skill-preview.js?v=20261109-cast-range-60';
import {isHoly,holyName,holySkillDetails,ascensionEligible,ascensionProgress,ASCENSION_STEPS} from './ancient-ascension.js?v=20261014-new-professions-1';
import {equippedAncientSkin} from './ancient-skins.js';
import {currentQuest} from './ancient-quests.js';
export function createAncientSkillUI({getProfile,getPlayer,en,action,cast,slot,request,join}){
 const L=(zh,english)=>en()?english:zh,el=(tag,text,parent)=>{const n=document.createElement(tag);n.textContent=text;parent?.append(n);return n},btn=(text,fn,parent)=>{const n=el('button',text,parent);n.type='button';n.onclick=fn;return n};
 const hud=el('div','',document.getElementById('ancientHud'));hud.id='ancientSkillHud';const bar=el('div','',hud);bar.className='ancientSkillBar';const buttons=new Map();const tools=el('div','',hud);tools.className='ancientSkillTools';const hint=el('small','',hud);let lastJob='',lastTools='',lastDraw=0;
 let previewJob='',observedProfession,submitting=false,holyView=false,refreshPreview=()=>{};
 function render(card){const host=el('div','',card);refreshPreview=()=>{if(host.isConnected!==false){host.replaceChildren();paint(host)}};paint(host)}
 function paint(card){
  const p=getProfile(),signature=(p.profession||'')+':'+isHoly(p);if(observedProfession!==signature){observedProfession=signature;previewJob=p.profession||'';holyView=isHoly(p)}
  const quest=currentQuest(p),choosing=quest?.kind==='profession',trainingFirst=quest?.kind==='trainQ',guided=choosing||trainingFirst;
  if(trainingFirst){previewJob=p.profession;holyView=false}
  const coach=guided?el('aside','',card):null;
  if(coach){coach.className='ancientSkillCoach';coach.setAttribute('aria-live','polite');el('strong',choosing?L('选择职业 · 第 1 / 2 步','Choose your profession · Step 1 / 2'):L('激活技能 · 第 2 / 2 步','Activate your skill · Step 2 / 2'),coach);el('p',choosing?(previewJob?L('已选中预览。查看下面的技能，满意后点击发光的「选择职业」按钮才会正式选择。','Preview selected. Review the abilities below, then click the highlighted “Choose profession” button to confirm.'):L('① 点击下方一个职业按钮查看技能。② 再点击「选择职业」确认；仅点击职业名字不会消耗转职书。','① Click a profession below to view its abilities. ② Click “Choose profession” to confirm. Previewing a name does not spend your change book.')):L('格鲁克赠送的技能书已经放入背包，无需手动使用。点击下方 Q 技能的「修炼至 1」，消耗 1 本对应技能书即可激活，不需要金币或相位核心。','Gruk’s gift is already in your inventory; do not use the book manually. Click “Train to 1” on the Q ability below. Activation costs one matching skill book, with no Gold or Phase Cores.'),coach);}
  el('h2',L('技能 · 职业','Skills · Profession'),card);
  if(p.profession){
   const progress=ascensionProgress(p),ready=ascensionEligible(p),entry=el('details','',card);
   entry.className='ancientAscensionEntry';entry.style.cssText='margin:12px 0 20px;padding:16px;border:1px solid #d7bb70;border-radius:10px;background:linear-gradient(120deg,#27332e,#152334);';
   const summary=el('summary',L('✦ 职业升华 · 成为圣级职业','✦ Profession Ascension · Become Holy'),entry);summary.style.cssText='cursor:pointer;font-size:18px;font-weight:700;color:#f3d68c;';
   el('p',progress?.holy?L('当前职业已升华','Current profession is Holy'):progress?.permit?L('下一步：','Next: ')+ASCENSION_STEPS[progress.step]?.[en()?1:0]:ready?L('条件已满足 · 展开这里，开始升华考验','Requirements met · Open here to begin your ascension trial'):L('解锁条件：80级，当前职业全部技能达到5级','Requires level 80 and every current profession skill at level 5'),summary);
   renderAscensionPanel(entry,{getProfile,en,job:p.profession,request,join,refresh:refreshPreview});
  }
  const jobs=el('div','',card);jobs.className='ancientProfessionGrid';
  for(const [id,j]of Object.entries(PROFESSIONS)){
   const b=btn(j.icon+' '+(en()?j.en:j.name),()=>{previewJob=id;refreshPreview()},jobs);
   b.classList.toggle('selected',previewJob===id);b.setAttribute('aria-pressed',String(previewJob===id));b.disabled=submitting;
   if(choosing)b.classList.add('ancientGuideTarget');
  }
  el('p',L('转职书：','Profession Change Books: ')+(p.materials['supply:transfer']||0),card);
  el('p',L('选择或切换职业消耗一本转职书，可在商店购买。','Choosing or changing profession consumes one change book, available in the shop.'),card);
  el('p',L('已修炼等级永久保留，头目与 BOSS 必定掉落一本技能书。','Trained levels are retained. Each boss drops one skill book.'),card);
  if(!previewJob){el('p',L('选择一个职业','Choose a profession'),card);return}
  const selected=previewJob,job=PROFESSIONS[selected],current=p.profession===selected;
  el('h3',job.icon+' '+holyName(en()?job.en:job.name,en(),holyView),card);
  btn(holyView?L('普通级详情','Normal Details'):L('圣级详情','Holy Details'),()=>{holyView=!holyView;refreshPreview()},card);
  btn(L('3D技能预览','3D Skill Preview'),()=>openSkillPreview(selected,{en,level:3,skin:current?equippedAncientSkin(p):undefined}),card);
  if(holyView&&!current)renderAscensionPanel(card,{getProfile,en,job:selected,request,join,refresh:refreshPreview});
  const confirm=btn(current?L('当前职业','Current profession'):p.profession?L('更改职业','Change profession'):L('选择职业','Choose profession'),async()=>{
   const latest=getProfile();if(submitting||latest.profession===selected||(latest.materials['supply:transfer']||0)<1)return;
   submitting=true;refreshPreview();
   try{await action('chooseProfession',{job:selected})}finally{submitting=false;refreshPreview()}
  },card);confirm.className='ancientProfessionConfirm';confirm.disabled=current||submitting||(p.materials['supply:transfer']||0)<1;
  if(choosing){confirm.classList.add('ancientGuideTarget');btn(L('下一步：定位确认按钮 ↓','Next: find the confirm button ↓'),()=>{confirm.scrollIntoView({block:'center',behavior:'smooth'});confirm.focus({preventScroll:true})},coach);}
  renderBranchPanel(card,{p,job:selected,en,action,refresh:refreshPreview});
  const grid=el('div','',card);grid.className='ancientGrid';
  for(const id of job.skills){
   const s=SKILLS[id],n=p.skills?.[id]||0,training=skillTrainingCost(n),cost=training.books,count=p.materials[skillBook(id)]||0,item=el('section','',grid);item.className='weaponCard ancientSkillCard';
   el('strong',`${ancientKeyLabel('Key'+s.key,en())} · ${holyName(en()?s.en:s.name,en(),holyView)} · ${L('等级','Lv.')} ${n}`,item);
   el('small',`${L('玩家等级','Player level')} ${s.unlock}`,item);el('p',skillDescription(id,n,en()),item);if(holyView)el('strong',holySkillDetails(id,n,en()),item);
   if(!n)el('small',L('等级0不可使用；下方显示1级效果','Level 0 is inactive; showing level 1 effects'),item);
   el('small',`${en()?job.en:job.name}-${en()?s.en:s.name}${L('技能书',' Skill Book')} · ${count} / ${cost}`,item);
   if(n)el('small',L('相位核心：','Phase Cores: ')+(p.materials.core||0)+' / '+training.cores+' · '+L('金币：','Gold: ')+formatAncientNumber((p.coins||0))+' / '+formatAncientNumber(training.coins),item);
   if(n)el('p',L('下一级：','Next level: ')+skillDescription(id,n+1,en()),item);
   if(current){const b=btn(L('修炼至','Train to')+' '+(n+1),()=>void action('trainSkill',{id}),item);b.disabled=submitting||p.level<s.unlock||count<cost||(p.materials.core||0)<training.cores||(p.coins||0)<training.coins||!Number.isSafeInteger(cost);if(trainingFirst&&id===job.skills[0]){item.classList.add('ancientGuided');b.classList.add('ancientGuideTarget');btn(L('定位 Q 技能激活按钮 ↓','Find the Q activation button ↓'),()=>{b.scrollIntoView({block:'center',behavior:'smooth'});b.focus({preventScroll:true})},coach);el('p',L('激活成功后关闭技能面板，在战斗中按 Q（或点击下方 Q 技能按钮）使用。','After activation, close Skills and press Q in combat (or click the Q ability on the HUD).'),item);if(b.disabled)el('p',count<cost?L('尚未收到技能书：关闭面板，回到格鲁克身边按 F 领取赠书。','Book not received yet: close this panel, return to Gruk and press F to collect his gift.'):L('等待操作完成后再点击。','Wait for the current operation to finish.'),item);}}
  }
 }
 function update(time,paused=false){if(time-lastDraw<100)return;lastDraw=time;const p=getProfile(),a=getPlayer(),job=PROFESSIONS[p?.profession];hud.hidden=paused||!job||!a||a.hp<=0;if(!job||paused)return;const key=p.profession+':'+en();if(key!==lastJob){lastJob=key;bar.replaceChildren();buttons.clear();for(const id of job.skills){const b=btn('',()=>cast(id),bar);b.dataset.layoutKey='skill-'+SKILLS[id].key;buttons.set(id,b)}}for(const [id,b]of buttons){const s=SKILLS[id],n=p.skills?.[id]||0,cd=Math.max(0,Math.ceil(((a.skillRuntime?.cooldowns?.[id]||0)-Date.now())/1000)),duration=Math.max(0,Math.ceil(((id==='summon'?a.skillRuntime?.summon?.until||0:a.skillRuntime?.effects?.[id]?.until||0)-Date.now())/1000));const label=`${ancientKeyLabel('Key'+s.key,en())} · ${holyName(en()?s.en:s.name,en(),!!a.holy)}${duration?' · '+duration+'s':cd?' · '+cd+'s':n?'':' · Lv.0'}`;if(b.textContent!==label)b.textContent=label;b.disabled=n===0||(cd>0&&!(id==='shadowreturn'&&(a.skillRuntime?.shadowAnchor?.until||0)>Date.now()))||!!activeSkill(a,'transform')||id==='summon'&&!!a.skillRuntime?.summon;b.classList.toggle('selected',duration>0||id==='summon'&&!!a.skillRuntime?.summon)}const pet=a.skillRuntime?.summon,form=activeSkill(a,'transform'),weaken=(p.skills?.weaken||0)>0;const toolKey=[p.profession,!!pet,form>0,weaken,en(),ancientBindingVersion()].join(':');if(lastTools!==toolKey){lastTools=toolKey;tools.replaceChildren();if(form)btn(L('1 · 爪子','1 · Claws'),()=>slot(1),tools);else if(p.profession==='summoner'){btn(L('1 · 主手','1 · Melee'),()=>slot(1),tools);if(pet)btn(L('2 · 锁定印记','2 · Command sigil'),()=>slot(2),tools);if(weaken)btn((pet?'3':'2')+' · '+L('削弱印记','Weakening sigil'),()=>slot(pet?3:2),tools)}}for(const [index,b]of [...tools.children].entries()){b.dataset.layoutKey='tool-'+index;b.dataset.toolSlot=String(index+1);const label=ancientKeyLabel('Digit'+(index+1),en())+' · '+b.textContent.split(' · ').slice(1).join(' · ');if(b.textContent!==label)b.textContent=label;}const text=form?L('变身中 · 左键爪击','BEAST FORM · LMB claw attack'):pet?`${L('铁甲兽','Armored Beast')} ${Math.ceil(pet.hp)}/${pet.maxHp} · ${Math.max(0,Math.ceil((pet.until-Date.now())/1000))}s · ${L('2锁定印记命中怪物指挥攻击','2 command sigil: hit a monster to mark it')}`:p.profession==='summoner'&&weaken?L('1主手 · 2削弱印记 · 左键命中生效','1 melee · 2 weakening sigil · LMB hit to apply'):'';const mappedText=text.replace(/LMB|左键/g,ancientKeyLabel('Mouse0',en())).replace(/([123])(?=锁定|主手|削弱| command| melee| weakening)/g,(_,n)=>ancientKeyLabel('Digit'+n,en()));if(hint.textContent!==mappedText)hint.textContent=mappedText;for(const b of tools.children){const chosen=Number(b.dataset.toolSlot)===(a.skillRuntime?.mode||1);b.classList.toggle('selected',chosen)}}
 return {render,update};
}
