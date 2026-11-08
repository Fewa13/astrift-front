// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const clientVersion=globalThis.document?.querySelector('meta[name="astrift-build"]')?.content||'';
let locked=false;
export function clientUpdateRequired(){return locked}
export function requireClientUpdate(result,background=false){
 if(result?.code!=='CLIENT_UPDATE_REQUIRED')return;
 if(background||locked)return;
 locked=true;
 document.exitPointerLock?.();
 const dialog=document.createElement('dialog');
 dialog.setAttribute('aria-labelledby','astriftUpdateTitle');
 dialog.style.cssText='max-width:min(420px,85vw);padding:26px;background:#102330;color:#e8f6f6;border:1px solid #67cbd1;border-radius:12px;font:16px system-ui;z-index:2147483647';
 const english=document.documentElement.lang.startsWith('en'),title=document.createElement('h2'),copy=document.createElement('p'),reload=document.createElement('button');
 title.id='astriftUpdateTitle';title.textContent=english?'Update required':'游戏需要更新';
 copy.textContent=english?'The server has a newer version. Refresh to continue. If you opened a downloaded HTML file, replace it with the latest copy.':'服务器版本已更新。刷新页面后继续。若打开的是下载的 HTML 文件，请换成最新版。';
 reload.textContent=english?'Refresh page':'刷新页面';reload.onclick=()=>{try{if(window.parent!==window&&window.parent.__ASTRIFT_SHELL__){window.parent.location.reload();return}}catch{}location.reload()};
 dialog.append(title,copy,reload);document.body.append(dialog);dialog.addEventListener('cancel',event=>event.preventDefault());
 for(const type of ['keydown','keyup','keypress'])window.addEventListener(type,event=>{event.stopImmediatePropagation();if(event.key==='Escape')event.preventDefault()},{capture:true});
 dialog.showModal();reload.focus();window.dispatchEvent(new Event('astrift:client-outdated'));
}
export function assertClientAvailable(){
 if(locked)throw Error('游戏版本已更新，请刷新页面。 / Refresh to update the game.');
}
export async function verifyClientVersion(){
 assertClientAvailable();
 const response=await fetch('/api/client-version',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clientVersion}),cache:'no-store',signal:AbortSignal.timeout(8000)});
 const result=await response.json();
 requireClientUpdate(result);
 if(!response.ok||!result?.ok)throw Error(result?.error||'无法验证游戏版本 / Could not verify the game version.');
 assertClientAvailable();
}
