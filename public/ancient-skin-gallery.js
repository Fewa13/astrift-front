// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {createAncientSkinUI} from './ancient-skin-ui.js';
import {SKIN_PROFESSIONS} from './ancient-skins.js';
const panel=createAncientSkinUI(),gallery=document.getElementById('gallery');
let english=true,profession='warrior';
function render(){
 gallery.replaceChildren();document.documentElement.lang=english?'en':'zh';
 const select=document.createElement('select');select.setAttribute('aria-label',english?'Profession':'职业');
 for(const [key,labels] of Object.entries(SKIN_PROFESSIONS))select.append(new Option(english?labels.en:labels.zh,key));
 select.value=profession;select.onchange=()=>{profession=select.value;render();};gallery.append(select);
 panel.render(gallery,{gallery:true,english,profession});
}
document.getElementById('language').onclick=()=>{english=!english;render();};
window.addEventListener('pagehide',event=>{if(!event.persisted)panel.dispose();});
render();
