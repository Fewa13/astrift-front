// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {accountSession,refreshAccountProfile} from './account.js?v=20261027-auth-recovery-1';
import {protectName,getLanguage} from './i18n.js?v=20261008-onboarding-1';
export function towerTime(milliseconds){const total=Math.max(0,Math.floor(milliseconds/1000)),hours=Math.floor(total/3600),minutes=Math.floor(total/60)%60,seconds=total%60;return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(Math.floor(milliseconds%1000/10)).padStart(2,'0')}`}
const namesLabel=names=>{names.forEach(protectName);return names.filter(Boolean).join('  ')};
export function initSurvivalLeaderboardUI(api){
 const $=id=>document.getElementById(id),dialog=$('survivalLeaderboard');let loading=false,requestVersion=0;
 async function load(){
  if(loading)return;loading=true;const version=++requestVersion;
  try{
   const response=await fetch('/api/survival/leaderboard',{cache:'no-store'});if(!response.ok)throw Error();const data=await response.json();if(!data.ok||!Array.isArray(data.entries))throw Error();if(dialog.hidden||version!==requestVersion)return;
   const rows=$('towerRankRows');rows.replaceChildren();
   for(const entry of data.entries){const tr=document.createElement('tr');for(const value of [entry.rank,namesLabel(entry.names),towerTime(entry.elapsedMs)]){const td=document.createElement('td');td.textContent=String(value);tr.append(td)}rows.append(tr)}
   $('towerRankEmpty').hidden=data.entries.length>0;$('towerRankEmpty').textContent='本周还没有成绩';
   const date=new Intl.DateTimeFormat(getLanguage()==='en'?'en-US':'zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(data.settlesAt);
   $('towerRankPeriod').textContent=`下次结算：${date}（北京时间）`;
   $('towerRankChampion').hidden=!data.champion;if(data.champion)$('towerRankChampion').textContent=`上周冠军　${namesLabel(data.champion.names)}　${towerTime(data.champion.elapsedMs)}`;
  }catch{if(!dialog.hidden){$('towerRankEmpty').hidden=false;$('towerRankEmpty').textContent=navigator.onLine?'排行榜加载失败，请重试':'联网后可查看排行榜'}}finally{loading=false}
 }
 const open=()=>{api.unlock();dialog.hidden=false;$('towerRankEmpty').hidden=false;$('towerRankEmpty').textContent='正在读取…';void load();if(accountSession())void refreshAccountProfile().catch(()=>{})};
 for(const id of ['openTowerLeaderboard','survivalRankOpen']){const button=$(id);button.onmousedown=e=>e.stopPropagation();button.onclick=open}
 const close=()=>{dialog.hidden=true;api.resume()};$('closeTowerLeaderboard').onclick=close;$('refreshTowerLeaderboard').onclick=()=>void load();
 dialog.addEventListener('mousedown',e=>e.stopPropagation());
 window.addEventListener('keydown',e=>{if(dialog.hidden)return;if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}},true);
 setInterval(()=>{if(!dialog.hidden&&!document.hidden)void load()},15000);
}
