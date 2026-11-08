// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {createPuzzleMap} from './ancient-puzzle-map.js';
export function createAncientPuzzleUI({en,name,request,onProfile,onEnter,onExit}){
 let room=null,state=null,map=null,poll=0,timer=0,working=false,polling=false,generation=0,signature='',offset=0,feedback='';
 const L=(a,b)=>en()?b:a;
 const make=(parent,tag,text='')=>{const node=document.createElement(tag);node.textContent=text;parent.append(node);return node};
 function button(parent,text,run){const node=make(parent,'button',text);node.type='button';node.onclick=run;return node;}
 function apply(r){
  onProfile(r.profile);const next=r.puzzle;
  if(!next||state&&(next.revision<state.revision||next.revision===state.revision&&next.serverTime<state.serverTime))return;
  offset=next.serverTime-Date.now();
  state=next;map?.sync(next);draw();
  const history=room?.querySelector('.ancientPuzzleChatHistory');
  if(history&&history.dataset.last!==String(next.chat.at(-1)?.id||0)){
   history.dataset.last=String(next.chat.at(-1)?.id||0);history.replaceChildren();
   for(const line of next.chat)make(history,'p',line.name+' · '+line.text);
   history.scrollTop=history.scrollHeight;
  }
 }
 async function update(action,body={}){
  const passive=action==='puzzleState';
  if(!room||(passive?polling:working))return;
  const id=generation;if(passive)polling=true;else working=true;
  try{
   const r=await request(action,body);if(id!==generation)return;
   const messages={clear:L('全服已通关本层！','Floor cleared for everyone!'),wrong:L('读数不符，请继续调节。','The reading does not match yet.'),reset:L('顺序或节奏不符，接力已重置。','Wrong order or timing. Relay reset.'),stale:L('队友已更新机关，请按当前状态继续。','Another player updated the controls. Continue from the current state.')};
   if(action!=='puzzleState')feedback=action==='puzzleClaim'?L('奖励已入账。','Rewards credited.'):messages[r.puzzle?.notice]||'';
   apply(r);
  }catch(error){if(id===generation){feedback=error.message;draw();}}
  finally{if(id===generation){if(passive)polling=false;else working=false;}}
 }
 function operate(control,data={}){void update('puzzleOperate',{floor:state.floor,revision:state.revision,control,...data});}
 function draw(){
  if(!room||!state)return;
  const view=room.querySelector('main'),key=JSON.stringify([state.revision,state.floor,state.claimed,state.players.map(p=>p.name),feedback,en()]);
  if(key===signature)return;signature=key;view.replaceChildren();
  make(view,'p',L('全服共享机关 · 你和其他玩家正在操作同一层','Shared chamber · Every player operates the same floor')).className='ancientPuzzleEyebrow';
  make(view,'h1',L('万象机关廊','The Mechanism Archive'));
  const levels=make(view,'div');levels.className='ancientPuzzleLevels';
  for(let i=0;i<5;i++){
   const tier=make(levels,'span',L('难度 ','Tier ')+(i+1)+' · '+(i*24+1)+'–'+((i+1)*24));
   tier.classList.toggle('current',state.difficulty===i+1);
  }
  const active=make(view,'section');active.className='ancientPuzzleMachine';
  if(state.complete)make(active,'h2',L('全服已解开全部 '+state.total+' 层','All '+state.total+' floors cleared'));
  else {
   make(active,'small',L('第 ','Floor ')+state.floor+' / '+state.total+' · '+L('难度 ','Difficulty ')+state.difficulty+'/5');
   make(active,'h2',state.name[en()?1:0]);make(active,'p',state.hint[en()?1:0]);
   if(state.formula)make(active,'small',state.formula[en()?1:0]);
   const read=make(active,'div',state.timed?L('已触发 ','Contacts ')+state.sequence+' / '+state.dials.length:
    L('读数 ','Reading ')+Number(state.reading.toFixed(3))+' → '+L('目标 ','Target ')+Number(state.target.toFixed(3))+' '+state.unit);
   read.className='ancientPuzzleReading';
   if(state.calibration){const c=state.calibration;make(active,'p',c.label[en()?1:0]+' · '+Number(c.reading.toFixed(3))+' → '+Number(c.target.toFixed(3))+' '+c.unit).className='ancientPuzzleReading';}

   if(state.timed){const bar=make(active,'progress');bar.max=state.window[1];bar.value=0;bar.setAttribute('aria-label',L('距上一次触发的时间','Time since last contact'));}
   const controls=make(active,'div');controls.className='ancientPuzzleControls';
   for(const [index,dial] of state.dials.entries()){
    const label=dial.label[en()?1:0];
    if(state.timed){button(controls,label,()=>operate('pulse',{index}));continue;}
    const cell=make(controls,'section');make(cell,'strong',label);
    const meter=make(cell,'meter');meter.max=dial.max;meter.value=state.values[index];meter.setAttribute('aria-label',label);
    make(cell,'output',state.values[index]+' / '+dial.max);
    const dials=make(cell,'div');
    button(dials,'−',()=>operate('dial',{index,delta:-1})).disabled=state.values[index]===0;
    button(dials,'+',()=>operate('dial',{index,delta:1})).disabled=state.values[index]===dial.max;
   }
   if(!state.timed)button(active,L('检验机关','Test mechanism'),()=>operate('check'));
   make(active,'p',L('本层奖励 ','Floor reward ')+state.reward.coins+L(' 金币',' gold')+(state.reward.cores?' · '+state.reward.cores+L(' 相位核心',' Phase Cores'):''));
  }
  const status=make(view,'p',feedback);status.setAttribute('role','status');
  const count=Math.min(state.total,state.floor-1)-state.claimed;
  button(view,L('领取已通关楼层奖励','Claim cleared-floor rewards')+' · '+Math.max(0,count),()=>void update('puzzleClaim')).disabled=count<=0;
  make(view,'p',L('正在解谜 ','In the archive ')+state.players.length+' · '+state.players.map(p=>p.name).join(' · '));
 }
 function close(){
  if(!room)return;generation++;clearInterval(poll);clearInterval(timer);map?.dispose();map=null;room.close();room.remove();room=null;state=null;working=polling=false;
  void request('puzzleLeave').catch(()=>{});onExit();
 }
 async function open(){
  if(room||working)return;
  working=true;let r;
  try{r=await request('puzzleEnter')}finally{working=false;}
  onEnter();generation++;signature='';feedback='';
  room=make(document.body,'dialog');room.className='ancientPuzzleRoom';
  const top=make(room,'header');button(top,L('离开解谜地图','Leave puzzle map'),close);
  const canvas=make(room,'canvas');canvas.width=720;canvas.height=210;canvas.tabIndex=0;canvas.className='ancientPuzzleMap';
  canvas.setAttribute('aria-label',L('机关室平面图，点击或用方向键移动','Chamber map. Click or use arrow keys to move.'));
  map=createPuzzleMap(canvas,()=>name().toLowerCase(),en);
  make(room,'main');
  const chat=make(room,'aside');chat.className='ancientPuzzleChat';make(chat,'h2',L('解谜频道','Puzzle chat'));
  make(chat,'div').className='ancientPuzzleChatHistory';
  const form=make(chat,'form'),input=make(form,'input');input.maxLength=120;input.placeholder=L('和大家讨论机关','Discuss the mechanism');
  input.setAttribute('aria-label',input.placeholder);
  const submit=make(form,'button',L('发送','Send'));submit.type='submit';
  form.onsubmit=async event=>{event.preventDefault();if(!input.value.trim()||working)return;const value=input.value;await update('puzzleChat',{text:value});if(!feedback&&input.value===value)input.value='';};
  room.addEventListener('cancel',event=>{event.preventDefault();close();});
  room.addEventListener('keydown',event=>event.stopPropagation());room.showModal();apply(r);
  poll=setInterval(()=>void update('puzzleState',{floor:state.floor,position:map.position()}),1300);
  timer=setInterval(()=>{const bar=room?.querySelector('progress');if(bar){const elapsed=state.lastPulse?Date.now()+offset-state.lastPulse:0;bar.value=Math.min(bar.max,elapsed);bar.style.accentColor=elapsed>=state.window[0]&&elapsed<=state.window[1]?'#7de9c7':'#edab69'}},60);
 }
 return {open,close};
}
