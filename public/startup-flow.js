import './mobile-ui.js';
import {openEntryAnnouncements} from './official-announcements.js';
// One actual-work driven entry sequence, shared by online and portable shells.
export async function preloadStartupAssets(report,{fetchImpl=fetch,manifestURL='/startup-manifest.json'}={}){
 const response=await fetchImpl(manifestURL,{cache:'no-cache'});if(!response.ok)throw Error('Unable to load resource manifest');const manifest=await response.json(),files=manifest.files;if(!Array.isArray(files)||!files.length)throw Error('Resource manifest is empty');const total=files.reduce((n,f)=>n+f.bytes,0),received=new Map();let index=0,done=0,failed=false;
 const update=(file,n,complete=false)=>{if(failed)return;received.set(file.url,complete?file.bytes:Math.min(file.bytes,n));const bytes=[...received.values()].reduce((a,b)=>a+b,0);report(bytes/total,file.url.endsWith('.css')?'界面样式 / Interface styles':file.url.includes('ancient')?'远古世纪资源 / Ancient Age resources':'战斗与界面资源 / Combat & interface resources',done,files.length)};
 await Promise.all(Array.from({length:Math.min(8,files.length)},async()=>{try{while(index<files.length&&!failed){const file=files[index++],res=await fetchImpl(file.url,{cache:'no-cache'});if(!res.ok)throw Error('Resource failed: '+file.url);let bytes=0;if(res.body?.getReader){const reader=res.body.getReader();for(;;){const {value,done}=await reader.read();if(done)break;bytes+=value.byteLength;update(file,bytes)}}else bytes=(await res.arrayBuffer()).byteLength;done++;update(file,bytes,true)}}catch(e){failed=true;throw e}}));report(1,'资源加载完成 / Resources loaded',files.length,files.length);
}
export function createStartupFlow({shell,mount,prepareAssets,musicURL='/ASTRIFT_UNBOUND_Full_Theme_V1.mp3'}){
 shell.managesAnnouncements=true;shell.managesEntry=true;let selected=false,finished=false,running=false,optedOut=false;const audio=new Audio(musicURL);audio.loop=true;audio.volume=.55;audio.preload='auto';
 const cover=document.createElement('section');cover.id='astriftBoot';cover.innerHTML='<div class="bootStars"></div><main><div class="bootEyebrow">ASTRIFT // FRONT</div><h1>UNBOUND</h1><p class="bootSubtitle">跨越边界，进入星隙 / Beyond the boundary</p><div class="bootProgressHead"><span role="status"></span><b>0%</b></div><progress value="0" max="100" aria-label="加载进度 / Loading progress"></progress><p class="bootDetails"></p><button class="bootRetry" type="button" hidden>重试 / Retry</button></main></section>';document.body.append(cover);
 const label=cover.querySelector('[role=status]'),percent=cover.querySelector('b'),bar=cover.querySelector('progress'),details=cover.querySelector('.bootDetails'),retry=cover.querySelector('.bootRetry');const music=document.createElement('button');music.type='button';music.className='bootMusic';music.textContent='开启主题曲 / Enable music';document.body.append(music);
 async function play(){if(selected||optedOut)return;try{await audio.play();if(selected||optedOut){audio.pause();return}music.textContent='主题曲播放中 · 点击静音 / Theme on · Mute';music.dataset.playing='true'}catch{music.textContent='开启主题曲 / Enable music';delete music.dataset.playing}}
 music.onclick=()=>{if(!audio.paused){optedOut=true;audio.pause();music.textContent='开启主题曲 / Enable music';delete music.dataset.playing}else{optedOut=false;void play()}};void play();
 function update(fraction,text,extra=''){cover.hidden=false;label.textContent=text;const n=Math.max(0,Math.min(100,Math.floor(fraction*100)));bar.value=n;percent.textContent=n+'%';details.textContent=extra}
 shell.entrySelected=()=>{selected=true;audio.pause();audio.currentTime=0;audio.removeAttribute('src');audio.load();music.remove();cover.hidden=true};
 shell.entryInteraction=()=>{if(!selected&&!optedOut&&!music.dataset.playing)void play()};
 async function run(){if(running)return;running=true;retry.hidden=true;selected=false;finished=false;try{
  update(0,'正在读取游戏资源 / Reading game resources');await prepareAssets((fraction,text,done,total)=>update(fraction*.9,text,done!==undefined?`${done} / ${total}`:''));
  update(.9,'正在初始化游戏引擎 / Initializing game engine');const bridge=await mount('main');update(1,'资源准备完成 / Resources ready');await new Promise(requestAnimationFrame);
  await bridge.authenticate(()=>{cover.hidden=true});update(0,'正在读取账户存档 / Reading account save');const messages=await bridge.prepare((fraction,text)=>update(fraction*.6,text));
  update(.6,'正在准备远古世纪场景 / Preparing Ancient Age scene');shell.entryAncientProgress=(value,text)=>update(.6+.3*Math.max(0,Math.min(100,value))/100,text);try{await mount('ancient',true)}finally{shell.entryAncientProgress=null};update(.9,'正在准备模式选择 / Preparing mode selection');await bridge.prepareChoices();update(1,'准备完成 / Ready');await new Promise(requestAnimationFrame);finished=true;cover.hidden=true;bridge.showChoices();
  if(messages.length)openEntryAnnouncements({messages,onRead:id=>bridge.readAnnouncement(id)});
 }catch(e){cover.hidden=false;label.textContent='启动未完成 / Startup incomplete';details.textContent=e.message;retry.hidden=false}finally{running=false}}
 retry.onclick=()=>void run();shell.retryEntry=()=>void run();shell.entryFinished=()=>finished;void run();return {audio,run,stop:()=>shell.entrySelected()};
}
