// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export function navigateWorld(world,options={}){
 const mode=world==='ancient'?'ancient':'main';
 let shell;try{shell=window.parent!==window?window.parent.__ASTRIFT_SHELL__:null}catch{/* Cross-origin standalone mirrors. */}
 if(shell?.switchWorld){shell.switchWorld(mode,options);return}
 document.cookie=`astrift_world=${mode}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol==='https:'?'; Secure':''}`;
 window.__ASTRIFT_NAVIGATING__=true;
 const reset=setTimeout(()=>{window.__ASTRIFT_NAVIGATING__=false},3000);
 // Static mirrors retain their existing entry path; the two Worker-backed hosts use root.
 const workerHost=location.hostname==='play.astrift.com'||location.hostname==='astrift-front.fewa3729.workers.dev'||location.hostname==='localhost'||location.hostname==='127.0.0.1';
 const auth=mode==='main'&&['register','login'].includes(options.auth)?'?astriftAuth='+options.auth:'';
 try{location.assign((mode==='ancient'&&!workerHost?'/ancient.html':'/')+auth)}catch(error){clearTimeout(reset);window.__ASTRIFT_NAVIGATING__=false;throw error}
}
