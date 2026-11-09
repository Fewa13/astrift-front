// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {createAncientSkinUI} from './ancient-skin-ui.js';
const panel=createAncientSkinUI(),gallery=document.getElementById('gallery');
let english=true;
function render(){gallery.replaceChildren();document.documentElement.lang=english?'en':'zh';panel.render(gallery,{gallery:true,english});}
document.getElementById('language').onclick=()=>{english=!english;render();};
window.addEventListener('pagehide',event=>{if(!event.persisted)panel.dispose();});
render();
