// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {noticeTheme} from './ancient-notice-themes.js';
const QUALITY_COLORS=['#f0f2f5','#91cae0','#bc9df6','#f1ca68','#68e6e4','#ffdfa3','#8ebeff','#e9a0ff'];
export function createCombatNotices(root=document.body){
 const feed=document.createElement('div');feed.className='ancientCombatFeed';feed.setAttribute('role','log');feed.setAttribute('aria-live','polite');root.append(feed);
 const pending=[],visible=[];
 function push(text,duration=4000,options={}){const item={text,duration:Math.max(4200,duration),...options};if(item.boss)pending.splice(pending.findLastIndex(entry=>entry.boss&&!entry.resumed)+1,0,item);else pending.push(item);}
 function kill(d,{boss,name,en,material,gearName,gearDefinition,kind,map}){push(`${boss?(en?'BOSS VANQUISHED':'首领已击败'):(en?'Defeated':'击败')} · ${name}\n+${d.xp.toLocaleString()} XP · +${(d.coins||0).toLocaleString(undefined,{maximumFractionDigits:2})} ${en?'Ancient Gold':'远古金币'}`,boss?8500:4600,{boss,theme:noticeTheme(kind,map,boss),drops:Object.entries(d.drops||{}).map(([key,n])=>({text:`${material(key)} ×${n}`})).concat((d.gearDrops||[]).map(i=>({text:gearName(i.key,en),color:QUALITY_COLORS[(gearDefinition(i.key)?.quality||1)-1]})))});}
 function update(now){for(let i=visible.length-1;i>=0;i--)if(now>=visible[i].until){visible[i].node.remove();visible.splice(i,1);}const limit=innerHeight<500?2:4;while(pending.length&&(visible.length<limit||pending[0].boss&&!pending[0].resumed)){
  const item=pending.shift();
  if(visible.length>=limit){
   const ordinary=visible.findIndex(entry=>!entry.item.boss);
   const [displaced]=visible.splice(ordinary<0?0:ordinary,1);
   displaced.node.remove();
   const resumed={...displaced.item,duration:displaced.until-now,resumed:true};
   if(resumed.boss)pending.splice(pending.findLastIndex(entry=>entry.boss)+1,0,resumed);
   else pending.push(resumed);
  }
  const node=document.createElement('div');node.className='ancientCombatMessage'+(item.boss?' ancientBossVictory':'');if(item.theme){const [accent,tint,motif,sigil]=item.theme;node.style.setProperty('--notice-accent',accent);node.style.setProperty('--notice-tint',tint);node.dataset.motif=motif;if(item.boss&&sigil){const seal=document.createElement('span');seal.className='ancientNoticeSigil';seal.textContent=sigil;seal.setAttribute('aria-hidden','true');node.append(seal);}}const title=document.createElement('div');title.className='ancientNoticeTitle';title.textContent=item.text;node.append(title);if(item.drops?.length){const drops=document.createElement('div');drops.className='ancientCombatDrops';for(const drop of item.drops){const tag=document.createElement('span');tag.textContent=drop.text;if(drop.color)tag.style.color=drop.color;drops.append(tag)}node.append(drops);}const firstBoss=item.boss?-1:visible.findIndex(entry=>entry.item.boss);
  const entry={node,item,until:now+item.duration};
  if(firstBoss<0){feed.append(node);visible.push(entry);}
  else{feed.insertBefore(node,visible[firstBoss].node);visible.splice(firstBoss,0,entry);}}}
 function clear(){pending.length=0;visible.length=0;feed.replaceChildren();}
 return {push,kill,update,clear};
}
