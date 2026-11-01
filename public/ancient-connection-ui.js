// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export function createAncientConnectionUI({parent=document.body,en,retry,login,exit,now=Date.now,setTimer=setTimeout,clearTimer=clearTimeout}){
 const root=document.createElement('section');root.id='ancientConnection';root.hidden=true;root.dataset.noTranslate='';root.setAttribute('role','status');root.setAttribute('aria-live','polite');const icon=document.createElement('span'),text=document.createElement('span'),action=document.createElement('button');icon.className='connectionIndicator';icon.setAttribute('aria-hidden','true');action.type='button';root.append(icon,text,action);parent.append(root);
 let phase='idle',details={},error='',timer=0,hadProblem=false;const L=(a,b)=>en()?b:a;
 function clear(){clearTimer(timer);timer=0;phase='idle';hadProblem=false;root.hidden=true}
 function render(){clearTimer(timer);root.dataset.state=phase;root.hidden=phase==='idle';action.hidden=true;action.disabled=false;
  if(phase==='idle')return;
  if(phase==='ready'){if(!hadProblem){clear();return}text.textContent=L('连接已恢复，位置已同步','Connection restored; position synchronized');timer=setTimer(clear,2200);return}
  if(phase==='auth'){text.textContent=L('登录已失效，请重新登录','Your session expired. Please log in again');action.textContent=L('重新登录','Log in');action.hidden=false;action.onclick=login;return}
  if(phase==='error'){text.textContent=error||L('无法连接此地图','Cannot connect to this map');action.textContent=L('选择地图','Choose map');action.hidden=false;action.onclick=exit;return}
  if(phase==='connecting'){text.textContent=L('正在连接世界…','Connecting to the world…');return}
  const remaining=Math.max(0,Math.ceil(((details.retryAt||0)-now())/1000));
  text.textContent=phase==='offline'?L('网络已断开，恢复联网后自动重连','Offline. Reconnection resumes when your network returns'):phase==='syncing'?L('同步暂停，正在恢复连接…','Synchronization paused. Recovering connection…'):details.busy?L('正在重新连接…','Reconnecting…'):L('连接中断，','Connection lost. ')+(remaining?L(`${remaining}秒后重试`, `Retrying in ${remaining}s`):L('正在重试…','Retrying…'));
  action.hidden=false;action.disabled=!!details.busy||phase==='offline';action.textContent=phase==='offline'?L('等待网络','Waiting for network'):L('立即重连','Reconnect now');action.onclick=()=>retry();
  if(phase==='retrying'&&remaining)timer=setTimer(render,1000);
 }
 function update(state,message='',info={}){phase=state;error=message;details=info;if(['retrying','syncing','offline'].includes(state))hadProblem=true;render()}
 const language=()=>render();window.addEventListener('astrift:language-changed',language);
 return {update,clear,destroy(){clear();window.removeEventListener('astrift:language-changed',language);root.remove()}};
}
