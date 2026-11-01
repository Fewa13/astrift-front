// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
let sendMessage=()=>{},isPlaying=()=>false,isOnline=()=>false,isConnected=()=>false,localName=()=> '玩家',chatKey=()=> 'KeyY',resume=()=>{},suspend=()=>{};
let open=false;
let lastLocalMessage=0;
const $=id=>document.getElementById(id);
function notice(message){const row=document.createElement('div');row.className='gameChatNotice';row.textContent=message;$('gameChatMessages').append(row);trim();setTimeout(()=>row.remove(),9500)}
function trim(){const box=$('gameChatMessages');while(box.children.length>6)box.firstElementChild.remove()}
function close(){if(!open)return;open=false;$('gameChatForm').hidden=true;$('gameChatInput').value='';if(isPlaying())resume()}
export function resetGameChat(){open=false;$('gameChatForm').hidden=true;$('gameChatInput').value='';$('gameChatMessages').replaceChildren()}
export function handleGameChat(data){
  if(data?.type==='chatError'){notice(data.message||'消息发送失败');return true}
  if(data?.type!=='chat')return false;
  if(typeof data.name!=='string'||typeof data.text!=='string')return true;
  const row=document.createElement('div');row.className='gameChatMessage';
  const name=document.createElement('b');name.textContent=data.name.slice(0,14);
  const text=document.createElement('span');text.textContent=data.text.slice(0,120);
  row.append(name,text);$('gameChatMessages').append(row);trim();setTimeout(()=>row.remove(),11000);
  return true;
}
export function initGameChat(options){({send:sendMessage,isPlaying,isOnline,isConnected,localName,chatKey,resume,suspend}=options);
  $('gameChatForm').addEventListener('submit',event=>{event.preventDefault();const text=$('gameChatInput').value.trim();if(text){if(Array.from(text).length>120)notice('消息最多 120 个字符');else if(isOnline()){if(isConnected())sendMessage({type:'chat',text});else notice('正在重连，消息未发送')}else if(Date.now()-lastLocalMessage<1500)notice('发送太快，请稍后再试');else{lastLocalMessage=Date.now();handleGameChat({type:'chat',name:localName(),text})}}close()});
  $('gameChatHint').textContent=`${chatKey().replace(/^Key/,'')} 聊天`;
  document.addEventListener('keydown',event=>{
    if(open){if(event.isComposing){event.stopImmediatePropagation();return}if(event.code==='Escape'){event.preventDefault();event.stopImmediatePropagation();close()}else if(event.code==='Enter'||event.code==='NumpadEnter'){event.preventDefault();event.stopImmediatePropagation();$('gameChatForm').requestSubmit()}else event.stopImmediatePropagation();return}
    $('gameChatHint').textContent=`${chatKey().replace(/^Key/,'')} 聊天`;
    if(!isPlaying()||event.repeat||event.code!==chatKey()||event.target.closest?.('input,textarea,select,button')||!$('keybindSettings').hidden)return;
    event.preventDefault();event.stopImmediatePropagation();open=true;suspend();$('gameChatForm').hidden=false;$('gameChatInput').focus();
  },true);
  document.addEventListener('pointerdown',event=>{if(open&&event.target!==$('gameChatInput')&&!$('gameChatForm').contains(event.target))close()},true);
}
