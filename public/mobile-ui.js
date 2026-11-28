// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Uniform UI density. Screen-space coordinates stay separate from CSS UI units.
export const mobileDevice=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
export const uiScale=()=>mobileDevice ? 0.8 : 1;
export const uiCoord=value=>value/uiScale();
export const uiWidth=()=>uiCoord(innerWidth);
export const uiHeight=()=>uiCoord(innerHeight);
if(mobileDevice&&!window.__ASTRIFT_MOBILE_UI__){
 window.__ASTRIFT_MOBILE_UI__=true;
 const html=document.documentElement;html.dataset.mobileUi='true';html.style.setProperty('--mobile-ui-scale',String(uiScale()));html.style.setProperty('--mobile-ui-inverse',String(1/uiScale()));
 const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('./mobile-ui.css',import.meta.url).href;document.head.append(style);
 const visibleViewport=()=>{
  let height=window.visualViewport?.height||innerHeight,top=window.visualViewport?.offsetTop||0;
  try{if(window.parent!==window&&window.parent.visualViewport){const parent=window.parent.visualViewport,frame=window.frameElement?.getBoundingClientRect();if(frame){const start=Math.max(parent.offsetTop,frame.top),end=Math.min(parent.offsetTop+parent.height,frame.bottom);top=Math.max(0,start-frame.top);height=Math.min(height,Math.max(1,end-start),Math.max(1,innerHeight-top));}}}catch{}
  html.style.setProperty('--mobile-visible-height',uiCoord(height)+'px');html.style.setProperty('--mobile-visible-top',uiCoord(top)+'px');
 };
 for(const event of ['resize','scroll'])window.visualViewport?.addEventListener(event,visibleViewport,{passive:true});
 try{if(window.parent!==window)for(const event of ['resize','scroll'])window.parent.visualViewport?.addEventListener(event,visibleViewport,{passive:true});}catch{}
 window.addEventListener('resize',visibleViewport,{passive:true});visibleViewport();
 const setup=()=>{
  const guard=document.createElement('section');guard.id='astriftOrientationGuard';guard.setAttribute('data-no-translate','');guard.hidden=true;guard.setAttribute('role','dialog');guard.setAttribute('aria-modal','true');guard.setAttribute('aria-label','横屏继续 / Landscape required');guard.innerHTML='<div class="orientationPhone" aria-hidden="true">↻</div><h2>请旋转至横屏继续</h2><p>Rotate your device to landscape to continue.</p><button type="button">切换横屏 / Use landscape</button>';document.body.append(guard);
  let blocked=false;
  const sync=()=>{const portrait=innerHeight>innerWidth;guard.hidden=!portrait;html.dataset.mobilePortrait=String(portrait);if(portrait!==blocked){blocked=portrait;window.dispatchEvent(new CustomEvent('astrift:orientation-blocked',{detail:{blocked}}));if(blocked)window.dispatchEvent(new Event('blur'))}};
  guard.querySelector('button').onclick=async()=>{try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();await screen.orientation?.lock?.('landscape')}catch{}sync()};
  const stop=e=>{if(blocked&&!guard.contains(e.target)){e.preventDefault();e.stopImmediatePropagation()}};
  for(const type of ['pointerdown','pointermove','pointerup','touchstart','touchmove','touchend','keydown','keyup'])document.addEventListener(type,stop,{capture:true,passive:false});
  window.addEventListener('resize',sync);window.addEventListener('orientationchange',sync);sync();
 };
 if(document.body)setup();else document.addEventListener('DOMContentLoaded',setup,{once:true});
}
