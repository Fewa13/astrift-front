// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export function createAnnouncementPoll({session,request,openInbox}){
 let banner=null,loading=false,current='',owner='',stopped=false,initialized=false;
 const observed=new Set(),pending=new Set();
 const key=(account,id)=>'astrift.announcement.seen:'+account+':'+id;
 function clear(){banner?.remove();banner=null;current=''}
 function acknowledge(account,id){observed.add(id);pending.add(id);try{localStorage.setItem(key(account,id),'1')}catch{/* Account persistence still works when storage is unavailable. */}}
 async function flush(account,credentials){for(const id of [...pending]){try{await request('account/email/read',{...credentials,id});if(owner!==account)return;pending.delete(id)}catch{return}}}
 async function poll(){
  if(stopped)return;const credentials=session(),account=credentials?.name?.toLowerCase()||'';
  if(account!==owner){clear();owner=account;initialized=false;observed.clear();pending.clear()}
  if(loading||document.hidden||!account)return;loading=true;
  try{
   await flush(account,credentials);const result=await request('account/email/inbox',credentials);
   if(stopped||session()?.name?.toLowerCase()!==account||owner!==account)return;
   const announcements=(result.messages||[]).filter(m=>m.announcement);
   // Opening the game never drains historical announcements into gameplay.
   const fresh=initialized?announcements.filter(m=>!observed.has(m.id)&&!m.readAt&&!m.claimedAt&&Number(m.createdAt)>Date.now()-86400000):[];
   initialized=true;for(const mail of announcements)observed.add(mail.id);
   const mail=fresh.sort((a,b)=>b.createdAt-a.createdAt).find(m=>{try{return !localStorage.getItem(key(account,m.id))}catch{return true}});
   if(!mail)return;
   clear();current=mail.id;acknowledge(account,mail.id);void flush(account,credentials);
   banner=document.createElement('aside');banner.setAttribute('data-no-translate','');banner.style.cssText='position:fixed;z-index:950;top:20px;left:50%;transform:translateX(-50%);width:min(440px,90vw);padding:12px 16px;background:#102b35ed;color:#e4f9fc;border:1px solid #588995;border-radius:8px;font:14px system-ui;box-sizing:border-box;pointer-events:auto';
   const title=document.createElement('p');title.textContent='公告 / Announcement · '+mail.title;title.style.margin='0 0 10px';banner.append(title);
   for(const [text,action]of [['查看公告 / Read',()=>{clear();void openInbox()}],['关闭 / Close',clear]]){const b=document.createElement('button');b.textContent=text;b.type='button';b.style.cssText='font:inherit;margin-right:8px;padding:7px 10px;background:#0b1d27;color:#dff7ff;border:1px solid #477080;border-radius:4px;cursor:pointer';b.onclick=action;banner.append(b)}document.body.append(banner);
  }catch{/* Retry next poll; all mail remains in the inbox. */}finally{loading=false}
 }
 function changed(){clear();void poll()}
 function read(event){if(event.detail?.id===current)clear()}
 const timer=setInterval(()=>void poll(),60000),initial=setTimeout(()=>void poll(),1000);
 window.addEventListener('astrift:account-changed',changed);window.addEventListener('astrift:mail-read',read);
 return {poll,stop(){stopped=true;clearInterval(timer);clearTimeout(initial);window.removeEventListener('astrift:account-changed',changed);window.removeEventListener('astrift:mail-read',read);clear()}};
}
