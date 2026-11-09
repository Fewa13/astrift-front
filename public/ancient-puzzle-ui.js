// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {createPuzzleMap} from './ancient-puzzle-map.js?v=20261108-room-8';
export function createAncientPuzzleUI({en,name,request,onProfile,onEnter,onExit}){
 let room=null,state=null,map=null,poll=0,working=false,polling=false,generation=0,signature='',feedback='',selected=-1;
 const L=(a,b)=>en()?b:a;
 const make=(parent,tag,text='')=>{const node=document.createElement(tag);node.textContent=text;parent.append(node);return node};
 function button(parent,text,run){const node=make(parent,'button',text);node.type='button';node.onclick=run;return node;}
 function roomState(r){
  const next=r?.puzzle;
  if(!next||!Array.isArray(next.players)||!Array.isArray(next.chat)||(!next.complete&&(!Array.isArray(next.banks)||!next.banks.every(bank=>Array.isArray(bank.symbols))||!Array.isArray(next.values)))){
   throw new Error(L('解谜房间数据未加载，请刷新页面重试。','Puzzle room could not load. Refresh and try again.'));
  }
  return next;
 }
 function apply(r){
  onProfile(r.profile);const next=roomState(r);
  if(!next||state&&(next.revision<state.revision||next.revision===state.revision&&next.serverTime<state.serverTime))return;
  if(state&&state.floor!==next.floor){
   selected=-1;
   room.querySelector('.ancientPuzzlePanel').close();
  }
  state=next;map?.sync(next);draw();

  room.querySelector('.ancientPuzzleFeedback').textContent=feedback;
  room.querySelector('.ancientPuzzleFloorLabel').textContent=next.complete?L('全服已通关','All floors cleared'):L('第 ','Floor ')+next.floor+' / '+next.total+' · '+L('难度 ','Difficulty ')+next.difficulty+'/5 · '+L('房间 ','Room ')+(next.banks.findIndex(bank=>!bank.done)+1)+' / '+next.banks.length+' · '+L('打开出口','Open the exit');
  const active=next.banks?.find(bank=>!bank.done);
  room.querySelector('.ancientPuzzleClue').textContent=active?.clue[en()?1:0]||'';
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
   const messages={clear:L('全服已通关本层！','Floor cleared for everyone!'),open:L('石门已打开。','The gate is open.'),wrong:L('这个石印对不上。','That seal does not match.'),reset:L('顺序错了，重新开始。','Wrong order. Start again.'),stale:L('机关已更新。','Controls updated.')};
   if(action!=='puzzleState')feedback=action==='puzzleClaim'?L('奖励已入账。','Rewards credited.'):messages[r.puzzle?.notice]||'';
   apply(r);
  }catch(error){if(id===generation){feedback=error.message;draw();}}
  finally{if(id===generation){if(passive)polling=false;else working=false;}}
 }
 function operate(control,data={}){void update('puzzleOperate',{floor:state.floor,revision:state.revision,control,...data});}
 function draw(){
  if(!room||!state)return;
  const view=room.querySelector('main'),key=JSON.stringify([state.revision,state.floor,state.claimed,selected,state.players.map(p=>p.name),feedback,en()]);
  if(key===signature)return;signature=key;view.replaceChildren();
  const active=make(view,'section');active.className='ancientPuzzleMachine';
  if(state.complete)make(active,'h2',L('全服已解开全部 '+state.total+' 层','All '+state.total+' floors cleared'));
  const status=make(view,'p',feedback);status.setAttribute('role','status');
  const count=Math.min(state.total,state.floor-1)-state.claimed;
  button(view,L('领取已通关楼层奖励','Claim cleared-floor rewards')+' · '+Math.max(0,count),()=>void update('puzzleClaim')).disabled=count<=0;
  make(view,'p',L('正在解谜 ','In the archive ')+state.players.length+' · '+state.players.map(p=>p.name).join(' · '));
 }
 function close(){
  if(!room)return;generation++;clearInterval(poll);map?.dispose();map=null;room.querySelector('.ancientPuzzlePanel')?.close();room.close();room.remove();room=null;state=null;working=polling=false;
  void request('puzzleLeave').catch(()=>{});onExit();
 }
 async function open(){
  if(room||working)return;
  working=true;let r;
  try{r=await request('puzzleEnter');roomState(r)}finally{working=false;}
  generation++;signature='';feedback='';
  room=make(document.body,'dialog');room.className='ancientPuzzleRoom';
  const top=make(room,'header');make(top,'strong').className='ancientPuzzleFloorLabel';
  button(top,L('奖励','Rewards'),()=>focusControls(-1));
  button(top,L('离开解谜地图','Leave puzzle map'),close);
  const notice=make(top,'small');notice.className='ancientPuzzleFeedback';notice.setAttribute('role','status');
  const viewport=make(room,'section');viewport.className='ancientPuzzleViewport';
  const clue=make(viewport,'p');clue.className='ancientPuzzleClue';
  const canvas=make(viewport,'canvas');canvas.tabIndex=0;canvas.className='ancientPuzzleMap';
  canvas.setAttribute('aria-label',L('第一人称机关室','First-person chamber'));
  make(viewport,'span','+').className='ancientPuzzleReticle';
  const panel=make(room,'dialog');panel.className='ancientPuzzlePanel';
  const panelTop=make(panel,'header');make(panelTop,'strong',L('机关','Mechanism')).className='ancientPuzzleFloorLabel';
  button(panelTop,L('关闭','Close'),()=>panel.close());
  panel.addEventListener('close',()=>{if(room?.isConnected)canvas.focus({preventScroll:true});});
  panel.addEventListener('cancel',event=>{event.preventDefault();event.stopPropagation();panel.close();});
  function focusControls(index){
   if(panel.open)return;
   if(index>=0){operate('activate',{index});return;}
   if(document.pointerLockElement===canvas)document.exitPointerLock();
   selected=index;feedback='';draw();panel.showModal();
  }
  try{map=createPuzzleMap(canvas,()=>name().toLowerCase(),en,focusControls);}
  catch(error){close();throw error;}
  onEnter();
  const pad=make(viewport,'div');pad.className='ancientPuzzleMovePad';
  const joystick=button(pad,'◉',()=>{});joystick.setAttribute('aria-label',L('移动摇杆','Movement joystick'));
  const move=event=>{const r=joystick.getBoundingClientRect();map?.stick(Math.max(-1,Math.min(1,(event.clientX-r.left-r.width/2)/(r.width/2))),Math.max(-1,Math.min(1,(event.clientY-r.top-r.height/2)/(r.height/2))));};
  joystick.onpointerdown=event=>{joystick.setPointerCapture(event.pointerId);move(event)};
  joystick.onpointermove=event=>{if(joystick.hasPointerCapture(event.pointerId))move(event)};
  joystick.onpointerup=joystick.onpointercancel=joystick.onlostpointercapture=()=>map?.stick(0,0);
  button(pad,L('跳','Jump'),()=>map?.jump());
  button(pad,L('交互','Interact'),()=>map?.interact());
  make(panel,'main');
  const chat=make(panel,'aside');chat.className='ancientPuzzleChat';make(chat,'h2',L('解谜频道','Puzzle chat'));
  make(chat,'div').className='ancientPuzzleChatHistory';
  const form=make(chat,'form'),input=make(form,'input');input.maxLength=120;input.placeholder=L('消息','Message');
  input.setAttribute('aria-label',input.placeholder);
  const submit=make(form,'button',L('发送','Send'));submit.type='submit';
  form.onsubmit=async event=>{event.preventDefault();if(!input.value.trim()||working)return;const value=input.value;await update('puzzleChat',{text:value});if(!feedback&&input.value===value)input.value='';};
  room.addEventListener('cancel',event=>event.preventDefault());
  room.addEventListener('keydown',event=>event.stopPropagation());try{room.showModal();apply(r);canvas.focus({preventScroll:true});}
  catch(error){close();throw error;}
  poll=setInterval(()=>void update('puzzleState',{floor:state.floor,position:map.position()}),1300);
 }
 return {open,close};
}
