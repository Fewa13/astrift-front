// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import catalog from './language-catalog.js?v=20261006-touch-editor-3';
import overrides from './language-overrides.js?v=20261015-fps-world-name-1';
Object.assign(catalog,overrides);

const STORAGE='astrift.language.v1';
let language='en';try{const saved=localStorage.getItem(STORAGE);if(saved==='zh'||saved==='en')language=saved}catch{}
const HAN=/[\p{Script=Han}]+/gu;
const phrases=Object.keys(catalog).sort((a,b)=>b.length-a.length);
const matcher=new RegExp(phrases.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'gu');
const cache=new Map(),originals=new WeakMap(),attributes=new WeakMap();
const names=new Set();let nameProvider=()=>[],providerAt=0,initialized=false;
export const getLanguage=()=>language;
export function protectName(name){if(typeof name==='string'&&name&&!names.has(name)){names.add(name);cache.clear()}}
export function setNameProvider(provider){nameProvider=provider;providerAt=-Infinity}
function refreshNames(){const now=performance.now();if(now-providerAt<500)return;providerAt=now;for(const name of nameProvider())if(name&&!names.has(name)){names.add(name);cache.clear()}}
function translateRun(run){if(catalog[run])return catalog[run];return run.replace(matcher,phrase=>' '+catalog[phrase]+' ').replace(/\s+/g,' ').trim()}
export function t(value){
 const text=String(value??'');if(language!=='en'||!/[\p{Script=Han}]/u.test(text))return text;
 refreshNames();if(cache.has(text))return cache.get(text);
 if(catalog[text]&&!names.has(text)){cache.set(text,catalog[text]);return catalog[text]}
 // Account names, bot callsigns and player content are never translated.
 const preserved=[];let source=text;
 for(const name of [...names].sort((a,b)=>b.length-a.length))if(/[\p{Script=Han}]/u.test(name)&&source.includes(name)){const token=`\uE000${preserved.length}\uE001`;source=source.split(name).join(token);preserved.push(name)}
 let translated=source.replace(HAN,(run,offset)=>{const before=source[offset-1]||'',after=source[offset+run.length]||'';return (/[A-Za-z0-9]/.test(before)?' ':'')+translateRun(run)+(/[A-Za-z0-9]/.test(after)?' ':'')}).replace(/[「」]/g,'"').replace(/（/g,' (').replace(/）/g,')').replace(/，/g,', ').replace(/。/g,'. ').replace(/：/g,': ').replace(/；/g,'; ').replace(/！/g,'!').replace(/？/g,'?').replace(/、/g,', ');
 translated=translated.replace(/\uE000(\d+)\uE001/g,(_,index)=>preserved[Number(index)]);
 if(cache.size>6000)cache.clear();cache.set(text,translated);return translated;
}
const SKIP='script,style,textarea,[data-no-translate],#playerIdentityName,#friendMessages,.gameChatMessage,.forumPostHeader b,.forumPost>p,.friendRow>span,.tournamentRosterRow>span:first-child,.tournamentRank>span:first-of-type,#duelWatchSelect,#bombWatchSelect,#survivalWatchSelect,#towerRankRows td:nth-child(2)';
export function setLocalizedText(element,value){if(!element)return;const source=String(value),output=t(source);if(element.textContent!==output)element.textContent=output;if(element.firstChild?.nodeType===Node.TEXT_NODE)originals.set(element.firstChild,{source,output})}
function translateNode(node){
 if(node.nodeType===Node.TEXT_NODE){
  if(!node.parentElement||node.parentElement.closest(SKIP))return;
  const prior=originals.get(node),source=prior&&node.data===prior.output?prior.source:node.data,output=t(source);
  const localized=language==='en'&&node.parentElement.closest('#skinsScreen')?output.replace(/\bNormal\b/g,'Common'):output;
  originals.set(node,{source,output:localized});if(node.data!==localized)node.data=localized;return;
 }
 if(node.nodeType!==Node.ELEMENT_NODE||node.matches(SKIP.replace('textarea,','')))return;
 for(const key of ['placeholder','title','aria-label'])if(node.hasAttribute(key)){
  const stored=attributes.get(node)||{},current=node.getAttribute(key),prior=stored[key],source=prior&&current===prior.output?prior.source:current,output=t(source);
  stored[key]={source,output};attributes.set(node,stored);if(current!==output)node.setAttribute(key,output);
 }
 for(const child of node.childNodes)translateNode(child);
}
export function refreshLanguage(root=document.body){if(root)translateNode(root)}
export function setLanguage(next){
 language=next==='en'?'en':'zh';cache.clear();try{localStorage.setItem(STORAGE,language)}catch{}
 document.documentElement.lang=language==='en'?'en':'zh-CN';
 document.documentElement.dataset.language=language;
 refreshLanguage();document.title=language==='en'?'ASTRIFT // FRONT':'星隙前线 | ASTRIFT FRONT';
 const description=document.querySelector('meta[name=description]');if(description)description.content=language==='en'?'ASTRIFT FRONT — A browser-based 3D phase FPS with multiplayer and tactical AI.':'星隙前线 — 可联机、可对战 AI 的浏览器 3D 相位枪战游戏。';
 const button=document.getElementById('toggleLanguage');if(button){button.setAttribute('aria-pressed',String(language==='en'));button.setAttribute('aria-label',language==='en'?'Switch language to Chinese':'切换为英文')}
 window.dispatchEvent(new CustomEvent('astrift:language-changed',{detail:{language}}));
 navigator.serviceWorker?.controller?.postMessage({type:'astrift:language',language});
}
export function initLanguage(){
 if(initialized)return;initialized=true;
 const button=document.getElementById('toggleLanguage');if(button)button.onclick=()=>setLanguage(language==='zh'?'en':'zh');
 for(const method of ['alert','confirm','prompt']){const native=window[method].bind(window);window[method]=(message,...args)=>native(t(message),...args)}
 // Observe only changed text/branches, not the whole page each frame. Chinese
 // mode is untouched; numeric HUD ticks short-circuit in t(). No render loop work.
 const observer=new MutationObserver(records=>{for(const record of records){if(record.type==='childList'){for(const node of record.addedNodes)translateNode(node)}else translateNode(record.target)}});
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']});
 setLanguage(language);
 window.addEventListener('storage',event=>{if(event.key===STORAGE)setLanguage(event.newValue)});
 navigator.serviceWorker?.ready.then(registration=>(registration.active)?.postMessage({type:'astrift:language',language})).catch(()=>{});
 navigator.serviceWorker?.addEventListener('controllerchange',()=>navigator.serviceWorker.controller?.postMessage({type:'astrift:language',language}));
}
