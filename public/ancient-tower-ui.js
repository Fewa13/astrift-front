// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export function renderTowerCard(parent,{en,profile,request,onProfile,join}){
 const L=(a,b)=>en()?b:a,el=(tag,text,p=parent)=>{const e=document.createElement(tag);e.textContent=text;p.append(e);return e},card=el('section','');card.className='weaponCard ancientTowerCard';
 el('h3',L('试炼之塔','Trial Tower'),card);el('p',L('进入等级：1','Entry level: 1'),card);
 const detail=el('p',L('最高通关：','Best cleared: ')+(profile.tower?.best||0)+' / 100',card),error=el('p','',card),start=el('button',L('开始 / 继续爬塔','Start / Resume Tower'),card);start.disabled=(profile.tower?.best||0)>=100;if(start.disabled)start.textContent=L('已登顶','Completed');start.onclick=async()=>{start.disabled=true;try{const r=await request('towerStart');onProfile(r.profile);await join(r.dungeonState.run.map)}catch(e){error.textContent=e.message}finally{start.disabled=false}};
 const count=profile.tower?.books||0;if(count){const section=el('section','',card);el('strong',L('待领自选技能书：','Unclaimed selectable books: ')+count,section);const claim=el('button',L('领取到消耗品背包','Claim to Consumables'),section);claim.onclick=async()=>{claim.disabled=true;try{const r=await request('towerClaimBooks');onProfile(r.profile);section.remove()}catch(e){error.textContent=e.message;claim.disabled=false}};}
}
