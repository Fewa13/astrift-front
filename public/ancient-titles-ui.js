// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {drawPuzzleTitleFrame,puzzleTitleName,puzzleTitleColor} from './ancient-player-label.js?v=20261109-title-gallery-1';

export async function renderAncientTitles(host,{en,request,onProfile}){
 const L=(zh,english)=>en()?english:zh;
 const add=(parent,tag,text='')=>{const node=document.createElement(tag);node.textContent=text;parent.append(node);return node;};
 host.className='ancientTitles';
 add(host,'h2',L('称号','Titles'));
 const status=add(host,'p',L('正在加载称号…','Loading titles…'));
 status.setAttribute('role','status');
 const list=add(host,'div');list.className='ancientTitleList';
 let title;
 function draw(){
  list.replaceChildren();
  for(const [index,percent] of [15,10,5].entries()){
   const rank=index+1,owned=title?.rank===rank&&title.expires>Date.now(),worn=owned&&title.worn;
   const label=puzzleTitleName(rank,en());
   const accent=puzzleTitleColor({rank,worn:true,expires:Infinity});
   const card=add(list,'article');card.style.setProperty('--title-accent',accent);card.classList.toggle('equipped',worn);
   const header=add(card,'header');
   add(header,'strong',label);
   add(header,'span',worn?L('已佩戴','Equipped'):owned?L('已获得','Owned'):L('未获得','Locked'));
   const preview=add(card,'canvas');preview.width=512;preview.height=96;
   preview.setAttribute('aria-hidden','true');
   const ctx=preview.getContext('2d');
   drawPuzzleTitleFrame(ctx,rank);
   ctx.fillStyle=accent;ctx.font='bold 29px system-ui';ctx.textAlign='center';ctx.fillText(label,256,60,420);
   const perks=add(card,'div');perks.className='ancientTitlePerks';
   for(const stat of [L('攻击','Attack'),L('经验','XP'),L('最大血量','Max HP')])add(perks,'span',stat+' +'+percent+'%');
   const foot=add(card,'footer');
   if(!owned){add(foot,'small',L('解密榜第 '+rank+' 名','Puzzle leaderboard rank '+rank));continue;}
   const expiry=new Intl.DateTimeFormat(en()?'en-US':'zh-CN',{timeZone:'America/Los_Angeles',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(title.expires);
   add(foot,'small',L('到期 ','Expires ')+expiry+' (Irvine)');
   const button=add(foot,'button',worn?L('卸下','Unequip'):L('佩戴','Equip'));
   button.type='button';
   button.onclick=async()=>{
    button.disabled=true;
    try{
     const result=await request('equipPuzzleTitle',{worn:!worn});
     title=result.title;onProfile(result.profile);status.textContent='';draw();
    }catch(error){status.textContent=error.message;draw();}
   };
  }
 }
 try{const result=await request('puzzleTitle');if(host.isConnected){title=result.title;status.textContent='';draw();}}
 catch(error){status.textContent=error.message;}
}
