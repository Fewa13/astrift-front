// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {PROFESSIONS} from './ancient-skills.js';
import {puzzleTitleName,puzzleTitleColor} from './ancient-player-label.js?v=20261109-title-gallery-1';
export function createAncientLeaderboard({en,request,name}){
 const L=(a,b)=>en()?b:a,el=(tag,text,parent)=>{const n=document.createElement(tag);n.textContent=text;parent?.append(n);return n;};let data=null,loading=false,error='',host=null,generation=0,mode='level';
 async function load(page=1){const token=++generation;loading=true;error='';draw();try{const r=await request({daily:'dailyLeaderboard',puzzle:'puzzleLeaderboard',level:'levelLeaderboard'}[mode],{page});if(token===generation){data=r.leaderboard;}}catch(e){if(token===generation)error=e.message||L('加载失败','Failed to load');}finally{if(token===generation){loading=false;draw();}}}
 function drawPuzzleTitle(){
  el('p',L('按累计通关房间数排名，同分先到者优先。Irvine 每日零点结算。','Ranked by total rooms cleared, with ties broken by who reached the score first. Awards at midnight Irvine time.'),host);
  const rewards=el('div','',host);
  for(const [index,percent] of [15,10,5].entries()){
   const rank=index+1,line=el('p',rank+'. '+puzzleTitleName(rank,en())+L(' · 攻击、经验、血量各 +',' · Attack, XP and max HP +')+percent+'%',rewards);
   line.style.color=puzzleTitleColor({rank,worn:true,expires:Infinity});
  }

 }
 function draw(){if(!host?.isConnected)return;host.replaceChildren();el('h2',L('排行榜','Leaderboard'),host);const tabs=el('nav','',host);tabs.className='communityActions';for(const [id,zh,eng]of [['level','等级榜','Level'],['daily','日榜 · 游玩时长','Daily · Playtime'],['puzzle','解密榜','Puzzle']]){const b=el('button',L(zh,eng),tabs);b.type='button';b.classList.toggle('selected',mode===id);b.onclick=()=>{mode=id;data=null;void load(1)}}if(mode==='daily')el('p',L('Irvine时间每日00:00结算；第一名获得1个中级地图升级道具。','Resets at 00:00 Irvine time. Daily winner: one intermediate map upgrade.')+(data?.day?' · '+data.day:''),host);if(mode==='puzzle')drawPuzzleTitle();if(error)el('p',error,host).setAttribute('role','alert');if(!data)el('p',loading?L('加载中…','Loading…'):L('暂无玩家','No players yet'),host);
  if(data){const grid=el('div','',host);grid.className='ancientLeaderboardGrid';for(let side=0;side<2;side++){const list=el('ol','',grid);list.className='ancientLeaderboardColumn';list.start=(data.page-1)*20+side*10+1;for(const p of data.players.slice(side*10,side*10+10)){const row=el('li','',list);row.className='ancientLeaderboardRow';row.classList.toggle('self',p.name.toLowerCase()===name().toLowerCase());el('b',String(p.rank),row).className='ancientLeaderboardRank';const identity=el('div','',row);el('strong',p.name,identity);const job=mode==='level'?PROFESSIONS[p.profession]:null;el('small',mode==='daily'?L('今日游玩时长','Time played today'):mode==='puzzle'?L('累计通关房间','Total rooms cleared'):job?(en()?job.en:job.name):L('冒险者','Adventurer'),identity);el('span',mode==='daily'?`${Math.floor(p.milliseconds/3600000)}h ${Math.floor(p.milliseconds/60000)%60}m`:mode==='puzzle'?String(p.rooms):L('等级 ','Lv. ')+p.level,row).className='ancientLeaderboardLevel';}}if(!data.total)el('p',L('暂无玩家','No players yet'),host);
   const footer=el('div','',host);footer.className='ancientLeaderboardPages';const prev=el('button',L('上一页','Previous'),footer);prev.type='button';prev.disabled=loading||data.page<=1;prev.onclick=()=>load(data.page-1);el('span',`${data.page} / ${data.pages}`,footer);const next=el('button',L('下一页','Next'),footer);next.type='button';next.disabled=loading||data.page>=data.pages;next.onclick=()=>load(data.page+1);el('small',L('共 ','Total: ')+data.total+L(' 人',' players'),footer);
  }const refresh=el('button',loading?L('加载中…','Loading…'):L('刷新','Refresh'),host);refresh.type='button';refresh.disabled=loading;refresh.onclick=()=>load(data?.page||1);
 }
 return {render(card){host=el('section','',card);host.className='ancientLeaderboard';draw();},open:()=>load(1)};
}
