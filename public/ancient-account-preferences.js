import {ancientControlPreferences,applyAncientControlPreferences} from './ancient-input-settings.js';
const prefix='astrift.ancient.screenLayout.v1:';
export function createAccountPreferences({account,request,onApplied=()=>{}}){
 let owner='',revision=0,dirty=false,saving=false,applying=false,timer=0,status='';
 const read=()=>{const layouts={};for(const mode of ['desktop','touch']){try{layouts[mode]=JSON.parse(localStorage.getItem(prefix+mode)||'{}')}catch{layouts[mode]={}}}return {controls:ancientControlPreferences(),layouts,language:localStorage.getItem('astrift.language.v1')==='zh'?'zh':'en',quality:localStorage.getItem('astrift.ancient.quality')||'balanced'};};
 const schedule=(ms=600)=>{clearTimeout(timer);timer=setTimeout(flush,ms);};
 const pendingKey=name=>'astrift.ancient.preferences.pending:'+name;
 function apply(p){applying=true;try{applyAncientControlPreferences(p.controls);for(const mode of ['desktop','touch'])localStorage.setItem(prefix+mode,JSON.stringify(p.layouts?.[mode]||{}));localStorage.setItem('astrift.language.v1',p.language);localStorage.setItem('astrift.ancient.quality',p.quality||'balanced');document.documentElement.lang=p.language;window.dispatchEvent(new Event('astrift:ancient-layout-loaded'));window.dispatchEvent(new Event('astrift:ancient-quality-loaded'));onApplied();}finally{applying=false;}}
 async function flush(){timer=0;if(!owner||!dirty||saving)return;const name=owner,snapshot=read(),key=JSON.stringify(snapshot);saving=true;status='saving';try{const r=await request(snapshot,name);if(owner!==name)return;if(!r?.ok)throw Error('Save failed');revision=r.version;dirty=JSON.stringify(read())!==key;if(!dirty)localStorage.removeItem(pendingKey(name));status=dirty?'saving':'saved';}catch{if(owner===name){status='retry';schedule(4000);}}finally{saving=false;if(dirty&&!timer)schedule();}}
 function changed(){if(applying||!owner)return;dirty=true;status='saving';try{localStorage.setItem(pendingKey(owner),JSON.stringify(read()))}catch{}schedule();}
 for(const event of ['astrift:ancient-controls-changed','astrift:ancient-layout-changed','astrift:language-changed','astrift:ancient-quality-changed'])window.addEventListener(event,changed);
 window.addEventListener('online',()=>{if(dirty)schedule(0)});
 function sync(profile){const name=account()?.toLowerCase()||'';if(!name){owner='';dirty=false;revision=0;clearTimeout(timer);return}if(name!==owner){owner=name;dirty=false;revision=-1;clearTimeout(timer);status='';try{const queued=JSON.parse(localStorage.getItem(pendingKey(name))||'null');if(queued){apply(queued);dirty=true;schedule(0);}}catch{}}
  if(dirty||saving)return;const version=profile.preferencesVersion||0;if(version<=revision)return;revision=version;
  if(!profile.preferences){changed();return;}apply(profile.preferences);status='saved';}
 return {sync,flush,get status(){return status}};
}
