// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {ancientInputCode,ancientKeyLabel} from './ancient-input-settings.js';
export function createAncientChat({en,active,connected,send,suspend,resume}){
 const root=document.createElement('aside');root.id='ancientChat';root.hidden=true;
 const log=document.createElement('div');log.className='ancientChatLog';log.setAttribute('aria-live','polite');
 const toggle=document.createElement('button');toggle.type='button';toggle.dataset.layoutKey='chat';
 const form=document.createElement('form');form.hidden=true;
 const input=document.createElement('input');input.maxLength=240;input.autocomplete='off';
 const submit=document.createElement('button');submit.type='submit';
 const cancel=document.createElement('button');cancel.type='button';cancel.textContent='×';cancel.setAttribute('aria-label','Close / 关闭');
 form.append(input,submit,cancel);root.append(log,toggle,form);document.body.append(root);
 let opened=false;
 function close(){if(!opened)return;opened=false;form.hidden=true;input.value='';resume()}
 function open(){if(!active())return;update();if(opened)return;opened=true;suspend();form.hidden=false;input.focus()}
 function line(name,text,error=false){const row=document.createElement('div');row.className=error?'ancientChatError':'ancientChatMessage';const author=document.createElement('b');author.textContent=name;const body=document.createElement('span');body.textContent=text;row.append(author,body);log.append(row);while(log.children.length>6)log.firstElementChild.remove();setTimeout(()=>row.remove(),14000)}
 function update(){root.hidden=!active();toggle.textContent=ancientKeyLabel('KeyY',en())+(en()?' · Map chat':' · 地图聊天');submit.textContent=en()?'Send':'发送';input.placeholder=en()?'Message · max 120 characters':'消息 · 最多120字符';input.setAttribute('aria-label',input.placeholder)}
 toggle.onclick=open;cancel.onclick=close;
 form.onsubmit=e=>{e.preventDefault();const text=input.value.trim();if(!text)return;if(Array.from(text).length>120){line('',en()?'Maximum 120 characters':'最多120个字符',true);return}if(!connected()){line('',en()?'Reconnecting — message not sent':'正在重连，消息未发送',true);return}send({type:'chat',text});close()};
 document.addEventListener('keydown',e=>{if(opened){e.stopImmediatePropagation();if(e.isComposing)return;if(e.code==='Escape'){e.preventDefault();close()}else if(e.code==='Enter'||e.code==='NumpadEnter'){e.preventDefault();form.requestSubmit()}return}if(active()&&!document.body.classList.contains('ancientLayoutEditing')&&!e.repeat&&ancientInputCode(e.code)==='KeyY'&&!e.target?.closest?.('input,textarea,select,button')){e.preventDefault();e.stopImmediatePropagation();open()}},true);
 window.addEventListener('astrift:language-changed',update);
 return {open,update,reset(){close();log.replaceChildren();root.hidden=true},handle(data){if(data.type==='chat'){if(typeof data.name==='string'&&typeof data.text==='string')line(data.name.slice(0,32),data.text.slice(0,240));return true}if(data.type==='chatError'){line('',en()?({'发送太快，请稍后再试':'Too fast — try again shortly','内容包含违规信息，请修改后重试':'Message rejected — please revise it','请勿重复刷屏':'Please do not spam','消息需要 1–120 个字符':'Use 1–120 characters'}[data.message]||'Message could not be sent'):data.message,true);return true}return false}};
}
