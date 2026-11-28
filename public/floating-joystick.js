import {fixedMovement} from './mobile-movement-settings.js';
import {uiCoord} from './mobile-ui.js';
// Capture only empty game space; menus and other touch controls retain their gestures.
export function floatingJoystick(stick,{enabled,start,reset=()=>{}}){
 let active=null,saved=null;
 function restore(){if(!saved)return;for(const [key,value]of Object.entries(saved))stick.style[key]=value;saved=null;active=null;}
 document.addEventListener('pointerdown',e=>{
  if(fixedMovement()||e.pointerType!=='touch'||active!==null||e.clientX>=innerWidth/2||!enabled()||!stick.getClientRects().length)return;
  const onStick=stick.contains(e.target);if(!onStick&&e.target.tagName!=='CANVAS')return;
  const r=stick.getBoundingClientRect();saved=Object.fromEntries(['left','top','right','bottom'].map(k=>[k,stick.style[k]]));active=e.pointerId;
  stick.style.left=(stick.offsetLeft+uiCoord(e.clientX-r.left-r.width/2))+'px';stick.style.top=(stick.offsetTop+uiCoord(e.clientY-r.top-r.height/2))+'px';stick.style.right='auto';stick.style.bottom='auto';
  if(!onStick){e.preventDefault();e.stopImmediatePropagation();start(e);}
 },true);
 for(const name of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(name,e=>{if(e.pointerId===active)queueMicrotask(restore)},true);
 window.addEventListener('astrift:movement-mode-changed',()=>{restore();reset()});window.addEventListener('blur',restore);window.addEventListener('astrift:orientation-blocked',e=>{if(e.detail.blocked)restore()});document.addEventListener('visibilitychange',()=>{if(document.hidden)restore()});
 return restore;
}
