// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
(()=>{
 let frame=null,loadingTimer;
 const cover=document.getElementById('astriftAncientCover'),retry=document.getElementById('astriftAncientRetry');
 window.__ASTRIFT_SHELL__.ancientReady=source=>{
  if(source!==frame?.contentWindow)return;
  cover.hidden=true;clearTimeout(loadingTimer);
 };
 retry.onclick=()=>switchWorld('ancient');
 function switchWorld(world,options={}){
  if(world!=='main'&&world!=='ancient')return;
  clearTimeout(loadingTimer);
  cover.hidden=world!=='ancient';retry.hidden=true;
  if(world==='ancient')loadingTimer=setTimeout(()=>{retry.hidden=false},25000);
  document.cookie=`astrift_world=${world}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol==='https:'?'; Secure':''}`;
  // Removing the browsing context tears down its renderer, input handlers and sockets.
  frame?.remove();frame=document.createElement('iframe');frame.id='astriftWorldFrame';frame.title=world==='ancient'?'Astrift Ancient Age':'Astrift Front';
  frame.allow='fullscreen; autoplay; gamepad';frame.allowFullscreen=true;
  const search=new URLSearchParams(location.search);search.delete('astriftAuth');
  if(world==='main'&&['register','login'].includes(options.auth))search.set('astriftAuth',options.auth);
  frame.src='/_world/'+world+(search.size?'?'+search.toString():'');document.body.append(frame);
 }
 window.__ASTRIFT_SHELL__.switchWorld=switchWorld;
 // A fresh page entry always starts at the existing bilingual world chooser.
 // Previous-world cookies must not bypass the choice, online or offline.
 switchWorld('main');
 if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).catch(()=>{});
})();
