// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {createPuzzleMap} from './ancient-puzzle-map.js?v=20261110-puzzle-difficulty-1';
import {PROFESSIONS,SKILLS} from './ancient-skills.js';
export function createAncientPuzzleUI({en,name,request,onProfile,onEnter,onExit}){
 let room=null,state=null,map=null,poll=0,working=false,polling=false,generation=0,signature='',feedback='',queuedPlates=[];
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
 function apply(r,started=Date.now()){
  onProfile(r.profile);const next=roomState(r);
  if(!next||state&&(next.revision<state.revision||next.revision===state.revision&&next.serverTime<state.serverTime))return;
  if(state&&state.floor!==next.floor){
   queuedPlates=[];
   room.querySelector('.ancientPuzzlePanel').close();
  }
  state=next;map?.sync(next,started);draw();
  const panel=room.querySelector('.ancientPuzzlePanel');
  panel.querySelector('header button').hidden=!!next.pendingBooksFloor;
  panel.querySelector('header strong').textContent=next.pendingBooksFloor?L('通关奖励','Clear rewards'):L('解谜聊天','Puzzle chat');
  panel.querySelector('.ancientPuzzleChat').hidden=!!next.pendingBooksFloor;
  if(next.pendingBooksFloor&&!panel.open){
   if(document.pointerLockElement)document.exitPointerLock();
   panel.showModal();
  }

  room.querySelector('.ancientPuzzleFeedback').textContent=feedback;
  room.querySelector('.ancientPuzzleFloorLabel').textContent=next.complete?L('已通关','All floors cleared'):L('第 ','Floor ')+next.floor+' / '+next.total+' · '+L('难度 ','Difficulty ')+next.difficulty+'/5 · '+L('房间 ','Room ')+(next.banks.findIndex(bank=>!bank.done)+1)+' / '+next.banks.length+' · '+next.banks.find(bank=>!bank.done)?.name[en()?1:0];
  const history=room?.querySelector('.ancientPuzzleChatHistory');
  if(history&&history.dataset.last!==String(next.chat.at(-1)?.id||0)){
   history.dataset.last=String(next.chat.at(-1)?.id||0);history.replaceChildren();
   for(const line of next.chat)make(history,'p',line.name+' · '+line.text);
   history.scrollTop=history.scrollHeight;
  }
 }
 async function update(action,body={}){
  const passive=action==='puzzleState';
  if(!room||(passive?polling||working:working))return;
  const id=generation,started=Date.now();if(passive)polling=true;else working=true;
  try{
   const r=await request(action,body);if(id!==generation||(passive&&working))return;
   if(action==='puzzleOperate'&&r.puzzle?.notice==='clear'){
    map?.finishFloor();
    await new Promise(resolve=>setTimeout(resolve,700));
    if(id!==generation)return;
   }
   const messages={clear:L('本层已通关！','Floor cleared!'),blocked:L('只能滑动空格旁的砖。','Only a tile beside the gap can slide.'),wrongPair:L('图案不同，第二枚石印保持翻开。','No match. The second seal stays revealed.'),open:L('石门已打开。','The gate is open.'),wrong:L('这个石印对不上。','That seal does not match.'),reset:L('顺序错了，重新开始。','Wrong order. Start again.'),stale:L('机关已更新。','Controls updated.')};
   if(action!=='puzzleState')feedback=action==='puzzleClaim'?L('奖励已入账。','Rewards credited.'):[messages[r.puzzle?.notice],r.puzzle?.gold?'+'+r.puzzle.gold+L(' 金币',' gold'):''].filter(Boolean).join(' · ');
   apply(r,started);
  }catch(error){if(id===generation){feedback=error.message;room.querySelector('.ancientPuzzleFeedback').textContent=feedback;draw();}}
  finally{if(id===generation){if(passive)polling=false;else{working=false;while(queuedPlates.length&&!working){const pending=queuedPlates.shift();if(pending.floor===state?.floor)operate(pending.index,true);}}}}
 }
 function operate(index,step=false){
  if(!state||state.complete||state.pendingBooksFloor)return;
  const active=state.banks.find(bank=>!bank.done);
  if(!active||index<active.start||index>=active.start+active.count)return;
  if(working){if(step&&queuedPlates.length<8)queuedPlates.push({floor:state.floor,index});return;}
  void update('puzzleOperate',{floor:state.floor,revision:state.revision,control:'activate',index});
 }
 function draw(){
  if(!room||!state)return;
  const view=room.querySelector('main'),key=JSON.stringify([state.revision,state.floor,state.pendingBooksFloor,en()]);
  if(key===signature)return;signature=key;view.replaceChildren();
  const status=make(view,'p',feedback);status.dataset.puzzleRewardStatus='';status.setAttribute('role','status');
  if(!state.pendingBooksFloor){
   if(state.complete)make(view,'h2',L('已解开全部 '+state.total+' 层','All '+state.total+' floors cleared'));
   return;
  }
  const floor=state.pendingBooksFloor;
  make(view,'h2',L('第 '+floor+' 层奖励','Floor '+floor+' reward'));
  make(view,'p',L('选满三本技能书后继续。','Choose all three skill books to continue.'));
  const choices=Array.from({length:3},(_,index)=>{
   const label=make(view,'label',L('技能书 ','Skill book ')+(index+1));label.className='ancientPuzzleBookChoice';
   const select=make(label,'select');
   const placeholder=make(select,'option',L('请选择','Choose a book'));placeholder.value='';
   for(const profession of Object.values(PROFESSIONS)){
    const group=make(select,'optgroup');group.label=en()?profession.en:profession.name;
    for(const skill of profession.skills){const option=make(group,'option',en()?SKILLS[skill].en:SKILLS[skill].name);option.value=skill;}
   }
   return select;
  });
  const claim=button(view,L('领取三本技能书','Claim three skill books'),async()=>{
   claim.disabled=true;
   const counts=new Map();
   for(const choice of choices)counts.set(choice.value,(counts.get(choice.value)||0)+1);
   await update('puzzleClaim',{floor,selection:[...counts].map(([id,quantity])=>({id,quantity}))});
   if(claim.isConnected){status.textContent=feedback;claim.disabled=false;}
   if(!state?.pendingBooksFloor)room?.querySelector('.ancientPuzzlePanel')?.close();
  });
  claim.disabled=true;
  for(const choice of choices)choice.onchange=()=>{claim.disabled=choices.some(select=>!select.value)};
  button(view,L('离开解谜地图','Leave puzzle map'),close);

 }
 function close(){
  if(!room)return;generation++;clearInterval(poll);map?.dispose();map=null;room.querySelector('.ancientPuzzlePanel')?.close();room.close();room.remove();room=null;state=null;queuedPlates=[];working=polling=false;
  void request('puzzleLeave').catch(()=>{});onExit();
 }
 async function open(){
  if(room||working)return;
  working=true;let r;const started=Date.now();
  try{r=await request('puzzleEnter');roomState(r)}finally{working=false;}
  generation++;signature='';feedback='';
  room=make(document.body,'dialog');room.className='ancientPuzzleRoom';
  const top=make(room,'header');make(top,'strong').className='ancientPuzzleFloorLabel';
  button(top,L('解谜聊天','Puzzle chat'),()=>focusControls(-1));
  button(top,L('离开解谜地图','Leave puzzle map'),close);
  const notice=make(top,'small');notice.className='ancientPuzzleFeedback';notice.setAttribute('role','status');
  const viewport=make(room,'section');viewport.className='ancientPuzzleViewport';
  const canvas=make(viewport,'canvas');canvas.tabIndex=0;canvas.className='ancientPuzzleMap';
  canvas.setAttribute('aria-label',L('第一人称机关室','First-person chamber'));
  make(viewport,'span','+').className='ancientPuzzleReticle';
  const panel=make(room,'dialog');panel.className='ancientPuzzlePanel';
  const panelTop=make(panel,'header');make(panelTop,'strong',L('机关','Mechanism')).className='ancientPuzzleFloorLabel';
  button(panelTop,L('关闭','Close'),()=>{if(!state?.pendingBooksFloor)panel.close()});
  panel.addEventListener('close',()=>{if(room?.isConnected)canvas.focus({preventScroll:true});});
  panel.addEventListener('cancel',event=>{event.preventDefault();event.stopPropagation();if(!state?.pendingBooksFloor)panel.close();});
  function focusControls(index,step=false){
   if(panel.open)return;
   if(index>=0){operate(index,step);return;}
   if(document.pointerLockElement===canvas)document.exitPointerLock();
   feedback='';draw();panel.showModal();
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
  room.addEventListener('keydown',event=>event.stopPropagation());try{room.showModal();apply(r,started);canvas.focus({preventScroll:true});}
  catch(error){close();throw error;}
  poll=setInterval(()=>void update('puzzleState',{floor:state.floor,position:map.position()}),1300);
 }
 return {open,close};
}
