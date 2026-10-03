const STORAGE='astrift.knifeSkins.v1';
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
let state={kills:0,claimed:[null,null,null],active:null};
try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(saved&&Number.isSafeInteger(saved.kills)&&saved.kills>=0){state.kills=saved.kills;state.claimed=KNIFE_TIERS.map((tier,i)=>tier.styles.some(s=>s.id===saved.claimed?.[i])?saved.claimed[i]:null);state.active=state.claimed.includes(saved.active)?saved.active:null}}catch{}
const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch{}};
export function knifeSkinById(id){return KNIFE_TIERS.flatMap(t=>t.styles).find(s=>s.id===id)||null}
export function activeKnifeSkin(){return knifeSkinById(state.active)}
let render=()=>{};
export function recordKnifeKill(){state.kills++;save();render()}
export function initKnifeSkinScreen(apply,renderGun){
  const gunTab=document.getElementById('gunSkinTab'),knifeTab=document.getElementById('knifeSkinTab'),gunTiers=document.getElementById('skinTiers'),knifeTiers=document.getElementById('knifeSkinTiers'),progress=document.getElementById('skinProgress'),title=document.getElementById('skinsTitle');
  const show=kind=>{const knife=kind==='knife';gunTab.classList.toggle('selected',!knife);knifeTab.classList.toggle('selected',knife);gunTiers.hidden=knife;knifeTiers.hidden=!knife;title.textContent=knife?'相位刃皮肤':'武器皮肤';if(knife)render();else renderGun()};
  gunTab.onclick=()=>show('gun');knifeTab.onclick=()=>show('knife');
  document.getElementById('openSkins').addEventListener('click',()=>show('gun'));
  render=()=>{
    if(!knifeTiers.hidden)progress.textContent=`近战击杀 ${state.kills} 次 · 每档任选一款，最多领取 3 款刀皮`;
    knifeTiers.replaceChildren();
    KNIFE_TIERS.forEach((tier,index)=>{
      const section=document.createElement('section');section.className='skinsTier';
      const heading=document.createElement('h3');heading.textContent=`${tier.name} · ${tier.kills} 次近战击杀`;
      const note=document.createElement('small');note.textContent=state.claimed[index]?'本档已领取，已选款式可随时装备':state.kills>=tier.kills?'任务完成：从两款中选一款':'还需 '+(tier.kills-state.kills)+' 次近战击杀';
      const cards=document.createElement('div');cards.className='skinCards knifeSkinCards';
      for(const skin of tier.styles){
        const button=document.createElement('button');button.type='button';button.className='skinCard knifeSkinCard';button.dataset.rarity=index===2?'legendary':index===1?'rare':'common';button.dataset.skin=skin.id;button.classList.toggle('selected',state.active===skin.id);button.disabled=state.kills<tier.kills||Boolean(state.claimed[index]&&state.claimed[index]!==skin.id);
        for(const slot of ['shell','dark','edge','accent'])button.style.setProperty('--'+slot,'#'+skin[slot].toString(16).padStart(6,'0'));
        const preview=document.createElement('i');preview.className='knifeSkinPreview';preview.innerHTML='<em class="knifePreviewBlade"></em><em class="knifePreviewCore"></em><em class="knifePreviewGuard"></em><em class="knifePreviewGrip"></em><em class="knifePreviewPommel"></em>';
        const name=document.createElement('b');name.textContent=skin.name;const desc=document.createElement('small');desc.textContent=state.active===skin.id?'使用中':state.claimed[index]===skin.id?'点击装备':skin.desc;
        button.append(preview,name,desc);button.onclick=()=>{if(state.kills<tier.kills||state.claimed[index]&&state.claimed[index]!==skin.id)return;if(!state.claimed[index]){if(!confirm(`确定领取「${skin.name}」？${tier.name}档只能领取这一款。`))return;state.claimed[index]=skin.id}state.active=skin.id;save();apply();render()};cards.append(button);
      }
      section.append(heading,note,cards);knifeTiers.append(section);
    });
  };
  apply();render();
}
