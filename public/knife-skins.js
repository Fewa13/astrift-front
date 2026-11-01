// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const STORAGE='astrift.knifeSkins.v1';
import {knifeCombat} from './knife-combat.js?v=20261006-damage-result-3';
import {accountSession,accountApi} from './account.js?v=20261027-auth-recovery-1';
import {knifePreviewSVG} from './knife-forms.js?v=20261006-damage-result-3';
export const KNIFE_TIERS=[
  {name:'常规',kills:3,styles:[
    {id:'froststeel',name:'霜钢',desc:'冷锻银刃 · 冰蓝切线',shell:0xb7d7df,edge:0xeaffff,grip:0x223a45,accent:0x65dfff,dark:0x284b58},
    {id:'rustcopper',name:'锈铜',desc:'旧铜护手 · 炽橙铭纹',shell:0x8d5d42,edge:0xf8b677,grip:0x312522,accent:0xff904e,dark:0x503626}]},
  {name:'精良',kills:15,styles:[
    {id:'aurorablade',name:'极光',desc:'深海蓝刃 · 青紫渐变光脊',shell:0x316d83,edge:0xc4fff4,grip:0x142f47,accent:0x5cffdc,dark:0x594e9b},
    {id:'redobsidian',name:'赤曜',desc:'曜石黑刃 · 熔红裂纹',shell:0x262631,edge:0xff8b85,grip:0x210f1b,accent:0xff405c,dark:0x6b2237}]},
  {name:'传奇',kills:40,styles:[
    {id:'starfall',name:'星蚀',desc:'黑曜星刃 · 金色星轨 · 挥刀流光',shell:0x151c35,edge:0xffedb8,grip:0x111529,accent:0xffd36f,dark:0x655390},
    {id:'phasebreak',name:'相位裂隙',desc:'半透相位刃 · 紫青脉冲 · 裂隙残影',shell:0x465a91,edge:0xe8deff,grip:0x191936,accent:0x9f8cff,dark:0x2acbda}]}
];
export const KNIFE_DRAW_SKINS=[
  {id:'knife-draw-comet',name:'彗星·追光',desc:'流星尖刃 · 青蓝尾焰',rarity:'common',shell:0x587b9f,edge:0xdffaff,grip:0x1b2e42,accent:0x65dfff,dark:0x304966},
  {id:'knife-draw-tide',name:'潮汐·回澜',desc:'弯月水刃 · 浪纹护手',rarity:'common',shell:0x286a80,edge:0xc8fbff,grip:0x133341,accent:0x59dad7,dark:0x1b4c64},
  {id:'knife-draw-ember',name:'余烬·断火',desc:'短重火刃 · 熔线切口',rarity:'rare',shell:0x74382f,edge:0xffcc8a,grip:0x2c1b1d,accent:0xff713f,dark:0x4b2631},
  {id:'knife-draw-ghost',name:'幽影·潜行',desc:'细长黑刃 · 隐紫刃脊',rarity:'rare',shell:0x293449,edge:0xc6b5ff,grip:0x141627,accent:0x9d7bff,dark:0x222039},
  {id:'knife-draw-thunder',name:'雷霆·裂空',desc:'锯齿电刃 · 高压导轨',rarity:'epic',shell:0x4f588b,edge:0xf3f6ff,grip:0x1e244b,accent:0x8eaaff,dark:0x38416d},
  {id:'knife-draw-verdant',name:'森域·新生',desc:'叶脉弧刃 · 翡翠核心',rarity:'epic',shell:0x2d6e59,edge:0xd5ffda,grip:0x173628,accent:0x66fbb0,dark:0x285345},
  {id:'knife-draw-eclipse',name:'日蚀·夜冠',desc:'黑金双脊 · 环蚀刃尖',rarity:'legendary',shell:0x272631,edge:0xffdc9b,grip:0x17131d,accent:0xffbb55,dark:0x5d3c47},
  {id:'knife-draw-crown',name:'星冕·裁决',desc:'棱晶长刃 · 虹色星冠',rarity:'legendary',shell:0x8d9ec2,edge:0xffffff,grip:0x292948,accent:0xd3a6ff,dark:0x575285}
];
export const KNIFE_EVENT_SKINS=[
  {id:'knife-event-warrior-gold',name:'武者大赛·冠军',desc:'冠军金锋 · 赤曜冠护手',rarity:'legendary',shell:0xa9722b,edge:0xffe9ad,grip:0x482721,accent:0xff5d52,dark:0x59372d},
  {id:'knife-event-warrior-silver',name:'武者大赛·亚军',desc:'银蓝长刃 · 冷光翼护手',rarity:'epic',shell:0x8ba9ba,edge:0xf3ffff,grip:0x2c4559,accent:0x68d9ff,dark:0x3d6279},
  {id:'knife-event-warrior-bronze',name:'武者大赛·季军',desc:'古铜阔刃 · 琥珀战纹',rarity:'rare',shell:0x98613d,edge:0xf0bf7b,grip:0x48332a,accent:0xffa34e,dark:0x65402f},
  {id:'knife-event-ranked-apex',name:'最强排位·巅峰王座',desc:'紫晶王刃 · 巅峰星环',rarity:'legendary',shell:0x47306f,edge:0xf0d9ff,grip:0x221738,accent:0xad75ff,dark:0x332052},
  {id:'knife-event-breach-apex',name:'最强爆破·裂点终局',desc:'裂点赤刃 · 核心倒计时',rarity:'legendary',shell:0x5c2732,edge:0xffc098,grip:0x261521,accent:0xff6154,dark:0x42202c}
];
let state={kills:0,claimed:[null,null,null],active:null};
let draw={used:0,shards:0,owned:[],tickets:0},trial=null,busy=false,resultText='';
let eventRewards=new Set();
let timedRewards=new Map(),permanentRewards=new Set(),clockOffset=0;
const remaining=id=>Math.max(0,(timedRewards.get(id)||0)-Date.now()-clockOffset);
const ownsEvent=id=>eventRewards.has(id)&&(!timedRewards.has(id)||permanentRewards.has(id)||remaining(id)>0);
function acceptRewards(profile){eventRewards=new Set(profile?.eventRewards||[]);permanentRewards=new Set(profile?.permanentEventRewards||profile?.eventRewards||[]);timedRewards=new Map((profile?.timedSkins||[]).filter(s=>Number.isFinite(s.expiresAt)).map(s=>[s.skinId,s.expiresAt]));clockOffset=Number.isFinite(profile?.serverNow)?profile.serverNow-Date.now():0}
const trialClicks=new Map();
function readKnifeState(){state={kills:0,claimed:[null,null,null],active:null};try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(saved&&Number.isSafeInteger(saved.kills)&&saved.kills>=0){state.kills=saved.kills;state.claimed=KNIFE_TIERS.map((tier,i)=>tier.styles.some(s=>s.id===saved.claimed?.[i])?saved.claimed[i]:null);state.active=state.claimed.includes(saved.active)||KNIFE_DRAW_SKINS.some(s=>s.id===saved.active)||KNIFE_EVENT_SKINS.some(s=>s.id===saved.active)?saved.active:null}}catch{}}
readKnifeState();
const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch{}};
export function knifeSkinById(id){return [...KNIFE_TIERS.flatMap(t=>t.styles),...KNIFE_DRAW_SKINS,...KNIFE_EVENT_SKINS].find(s=>s.id===id)||null}
export function activeKnifeSkin(){const skin=knifeSkinById(trial||state.active);return skin&&(trial===skin.id||state.claimed.includes(skin.id)||draw.owned.includes(skin.id)||ownsEvent(skin.id))?skin:null}
let render=()=>{};
export function recordKnifeKill(){state.kills++;save();render()}
export function initKnifeSkinScreen(apply,renderGun){
  setInterval(()=>{for(const node of document.querySelectorAll('[data-knife-expiry]')){const seconds=Math.ceil(remaining(node.dataset.knifeExpiry)/1000);node.textContent=`剩余 ${Math.floor(seconds/86400)}天 ${Math.floor(seconds%86400/3600)}时 ${Math.floor(seconds%3600/60)}分 ${seconds%60}秒`}if(!trial&&state.active&&timedRewards.has(state.active)&&!permanentRewards.has(state.active)&&!remaining(state.active)){state.active=null;save();apply();render()}},1000);
  const gunTab=document.getElementById('gunSkinTab'),knifeTab=document.getElementById('knifeSkinTab'),gunTiers=document.getElementById('skinTiers'),knifeTiers=document.getElementById('knifeSkinTiers'),progress=document.getElementById('skinProgress'),title=document.getElementById('skinsTitle');
  const show=kind=>{const knife=kind==='knife';gunTab.classList.toggle('selected',!knife);knifeTab.classList.toggle('selected',knife);gunTiers.hidden=knife;document.getElementById('skinDrawSection').hidden=knife;knifeTiers.hidden=!knife;title.textContent=knife?'相位刃皮肤':'武器皮肤';if(knife)render();else renderGun()};
  gunTab.onclick=()=>show('gun');knifeTab.onclick=()=>show('knife');
  document.getElementById('openSkins').addEventListener('click',()=>show('gun'));
  render=()=>{
    if(!knifeTiers.hidden)progress.textContent=`近战击杀 ${state.kills} 次 · 任务刀皮、抽奖刀皮共用一个装备位`;
    knifeTiers.replaceChildren();
    KNIFE_TIERS.forEach((tier,index)=>{
      const section=document.createElement('section');section.className='skinsTier';
      const heading=document.createElement('h3');heading.textContent=`${tier.name} · ${tier.kills} 次近战击杀`;
      const note=document.createElement('small');note.textContent=state.claimed[index]?'本档已领取，已选款式可随时装备':state.kills>=tier.kills?'任务完成：从两款中选一款':'还需 '+(tier.kills-state.kills)+' 次近战击杀';
      const cards=document.createElement('div');cards.className='skinCards knifeSkinCards';
      for(const skin of tier.styles){
        const button=makeCard(skin,state.active===skin.id?'使用中':state.claimed[index]===skin.id?'点击装备':skin.desc);button.disabled=state.kills<tier.kills||Boolean(state.claimed[index]&&state.claimed[index]!==skin.id);
        button.onclick=()=>{if(state.kills<tier.kills||state.claimed[index]&&state.claimed[index]!==skin.id)return;if(!state.claimed[index]){if(!confirm(`确定领取「${skin.name}」？${tier.name}档只能领取这一款。`))return;state.claimed[index]=skin.id}trial=null;state.active=skin.id;save();apply();render()};cards.append(button);
      }
      section.append(heading,note,cards);knifeTiers.append(section);
    });
    const section=document.createElement('section');section.className='skinsTier knifeDrawSection';
    const head=document.createElement('div');head.className='skinDrawHead';const info=document.createElement('div');const h=document.createElement('h3');h.textContent='星隙刃匣 · 赛季抽奖';const stat=document.createElement('small');stat.textContent=accountSession()?`每升 1 级得 1 抽 · 可抽 ${draw.tickets} 次 · 已收藏 ${draw.owned.length}/8 · 刀皮碎片 ${draw.shards}`:'登录账号后参与赛季刀皮抽奖';info.append(h,stat);
    const button=document.createElement('button');button.type='button';button.textContent=busy?'处理中…':'抽取 1 次';button.disabled=busy||!accountSession()||draw.tickets<1;button.onclick=async()=>{if(busy||!accountSession())return;busy=true;render();try{const response=await accountApi('account/knife-draw',accountSession());draw=response.profile.knifeDraw;const skin=knifeSkinById(response.skinId);resultText=response.duplicate?`重复抽到「${skin.name}」，转为 2 刀皮碎片`:`抽到「${skin.name}」！点击下方卡片装备。`;dispatchEvent(new CustomEvent('astrift:account-profile',{detail:response.profile}))}catch(error){resultText=error.message||'抽奖失败'}finally{busy=false;render()}};head.append(info,button);section.append(head);
    const note=document.createElement('p');note.className='skinDrawResult';note.textContent=resultText||'8 款刀皮等概率抽取；重复获得 2 碎片，6 碎片可指定兑换一款。';section.append(note);
    const cards=document.createElement('div');cards.className='skinCards knifeSkinCards';for(const skin of KNIFE_DRAW_SKINS){const owned=draw.owned.includes(skin.id),slot=document.createElement('div');slot.className='skinCardSlot';const card=makeCard(skin,owned?(state.active===skin.id?'使用中':'点击装备'):`未拥有 · 需要 6 刀皮碎片`);card.classList.toggle('locked',!owned);card.onclick=()=>{if(!owned){tapTrial(skin);return}trial=null;state.active=skin.id;save();apply();render()};slot.append(card);if(!owned){const redeem=document.createElement('button');redeem.type='button';redeem.className='skinRedeem';redeem.textContent='兑换 · 6 碎片';redeem.disabled=busy||!accountSession()||draw.shards<6;redeem.onclick=async()=>{if(busy||!confirm(`使用 6 刀皮碎片兑换「${skin.name}」？`))return;busy=true;render();try{const response=await accountApi('account/knife-redeem',{...accountSession(),skinId:skin.id});draw=response.profile.knifeDraw;trial=null;state.active=skin.id;save();apply();dispatchEvent(new CustomEvent('astrift:account-profile',{detail:response.profile}));resultText=`已兑换「${skin.name}」`}catch(error){resultText=error.message||'兑换失败'}finally{busy=false;render()}};slot.append(redeem)}cards.append(slot)}section.append(cards);knifeTiers.append(section);
    const eventSection=document.createElement('section');eventSection.className='skinsTier knifeEventSection';const eventHeading=document.createElement('h3');eventHeading.textContent='活动刀皮 · 荣誉专栏';const eventNote=document.createElement('small');eventNote.textContent='与活动枪皮一一对应 · 获奖后在赛事页面领取';const eventCards=document.createElement('div');eventCards.className='skinCards knifeSkinCards';for(const skin of KNIFE_EVENT_SKINS){const owned=ownsEvent(skin.id),card=makeCard(skin,owned?(state.active===skin.id?'使用中':'点击装备'):trial===skin.id?'试用中 · 刷新失效':skin.desc);card.classList.toggle('locked',!owned);card.onclick=()=>{if(!owned){tapTrial(skin);return}trial=null;state.active=skin.id;save();apply();render()};if(owned&&timedRewards.has(skin.id)&&!permanentRewards.has(skin.id)){const expiry=document.createElement('small');expiry.dataset.knifeExpiry=skin.id;card.append(expiry)}eventCards.append(card)}eventSection.append(eventHeading,eventNote,eventCards);knifeTiers.append(eventSection);
  };
  function makeCard(skin,description){const card=document.createElement('button');card.type='button';card.className='skinCard knifeSkinCard';card.dataset.rarity=skin.rarity||'common';card.dataset.skin=skin.id;card.classList.toggle('selected',trial===skin.id||!trial&&state.active===skin.id);for(const slot of ['shell','dark','edge','accent','grip'])card.style.setProperty('--'+slot,'#'+skin[slot].toString(16).padStart(6,'0'));const preview=document.createElement('i');preview.className='knifeSkinPreview';preview.innerHTML=knifePreviewSVG(skin);const name=document.createElement('b');name.textContent=skin.name;const desc=document.createElement('small');desc.textContent=description;const stats=knifeCombat(skin.id),numbers=document.createElement("small");numbers.textContent=`${stats.range.toFixed(2)} m · 头 ${stats.damage.head} / 身 ${stats.damage.body} / 手 ${stats.damage.arm}`;card.append(preview,name,desc,numbers);return card}
  function tapTrial(skin){const count=(trialClicks.get(skin.id)||0)+1;if(count<10){trialClicks.set(skin.id,count);return}trialClicks.delete(skin.id);if(prompt('输入验证码')?.trim()!=='131421')return;trial=skin.id;apply();render()}
  apply();render();
  addEventListener('astrift:account-changed',event=>{if(event.detail?.action==='login'){readKnifeState();trial=null}draw=event.detail?.profile?.knifeDraw||{used:0,shards:0,owned:[],tickets:0};acceptRewards(event.detail?.profile);apply();render()});
  addEventListener('astrift:account-profile',event=>{draw=event.detail?.knifeDraw||{used:0,shards:0,owned:[],tickets:0};acceptRewards(event.detail);apply();render()});
}
