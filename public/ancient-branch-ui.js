// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {ancientKeyLabel} from './ancient-input-settings.js';
import {PROFESSION_BRANCHES} from './ancient-branches.js?v=20261017-branches-1';
const el=(tag,text,parent)=>{const n=document.createElement(tag);n.textContent=text;parent?.append(n);return n;};
export function renderBranchPanel(card,{p,job,en,action,refresh}){
 const L=(a,b)=>en()?b:a,options=PROFESSION_BRANCHES[job];if(!options)return;
 const box=el('section','',card);box.className='ancientBranchPanel';
 el('h3',L('职业分支 · 30级','Profession Branch · Level 30'),box);
 const chosen=options.find(b=>b.id===p.branches?.[job]);
 if(chosen){el('strong',L('已永久选择：','Permanently chosen: ')+(en()?chosen.en:chosen.name),box);el('p',chosen.description[en()?1:0],box);return;}
 if(p.level<30){el('p',L('达到30级后，前往部落出生点找格鲁克。他将指导你选择这门职业的永久分支。','At level 30, visit Gruk near the Tribe spawn. He will guide your permanent profession branch choice.'),box);return;}
 const guided=p.branchGuides?.[job],current=p.profession===job;
 el('p',guided?L('格鲁克：力量有不同的道路。先比较两条路线，再做决定。不增加按键，所有联动自动触发。','Gruk: Power follows different paths. Compare both before deciding. No extra keys: all branch interactions trigger automatically.'):L('格鲁克正在部落出生点等你。使用当前职业，走到他身边按 F 接受指引。','Gruk awaits near the Tribe spawn. Use this profession, approach him and press F for guidance.'),box);
 el('p',L('每个职业单独保存。选择不可更改，转职、重连或圣级升华都不会重置。','Saved separately per profession. Choices are permanent and survive profession changes, reconnects and Holy Ascension.'),box);
 const grid=el('div','',box);grid.className='ancientGrid';
 for(const b of options){const item=el('section','',grid);item.className='weaponCard';el('h4',en()?b.en:b.name,item);el('p',b.description[en()?1:0],item);
  const btn=el('button',L('查看并选择','Review & choose'),item);btn.type='button';btn.disabled=!guided||!current;
  btn.onclick=()=>{for(const n of box.querySelectorAll('.ancientBranchConfirm'))n.remove();const confirm=el('section','',box);confirm.className='ancientBranchConfirm';el('strong',L('永久选择「','Permanently choose “')+(en()?b.en:b.name)+(en()?'”?':'」？'),confirm);el('p',b.description[en()?1:0],confirm);const label=el('label','',confirm),check=el('input','',label);check.type='checkbox';label.append(document.createTextNode(L('我了解选定后不能更改','I understand this choice cannot be changed')));const commit=el('button',L('确认永久选择','Confirm permanent choice'),confirm);commit.type='button';commit.disabled=true;check.onchange=()=>commit.disabled=!check.checked;commit.onclick=async()=>{commit.disabled=true;btn.disabled=true;try{await action('chooseBranch',{job,id:b.id});}finally{refresh();}};const cancel=el('button',L('再考虑一下','Keep thinking'),confirm);cancel.type='button';cancel.onclick=()=>confirm.remove();confirm.scrollIntoView({block:'nearest',behavior:'smooth'});};
 }
}
export function createBranchGuide({getProfile,getPlayer,getMap,camera,en,send,clear}){
 const hud=document.getElementById('ancientHud'),hint=el('button','',hud);hint.type='button';hint.className='ancientBranchGuide';hint.hidden=true;let near=false,last=0,pending=0;
 // Follow the real quest panel height, including long text and mobile wrapping.
 let tracker=null;function place(){const rect=tracker?.getBoundingClientRect();hint.style.top=Math.ceil(Math.max(220,rect&&rect.height?rect.bottom+14:220))+'px';}
 const observer=new ResizeObserver(place);window.addEventListener('resize',place);
 queueMicrotask(()=>{tracker=document.getElementById('ancientQuestTracker');if(tracker)observer.observe(tracker);place();});
 function interact(){if(!near||Date.now()<pending)return false;pending=Date.now()+1500;send({type:'branchMentor'});return true;}hint.onclick=interact;
 return {interact,update(time,active,paused){if(time-last<150)return;last=time;const p=getProfile(),a=getPlayer();near=false;hint.hidden=true;if(!active||paused||!p||!a||a.hp<=0||p.level<30||!p.profession||p.branches?.[p.profession])return;near=getMap()==='tribe'&&Math.hypot(camera.position.x+10,camera.position.z-14)<=7&&Math.hypot(a.x+10,a.z-14)<=7&&clear(camera.position.x,camera.position.y,camera.position.z,-10,1.5,14);hint.hidden=false;hint.disabled=!near;hint.textContent=near?(ancientKeyLabel('KeyF',en())+(en()?' · Gruk: choose your path':' · 格鲁克：职业分支指引')):(en()?'Level 30 · Visit Gruk in the Tribe for your branch':'30级职业分支 · 前往部落找格鲁克');}};
}
