// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {openSkillPreview} from '/ancient-skill-preview.js';
const open=document.querySelector('#open');
function show(){
 try{openSkillPreview('elementalist',{en:()=>false,level:1,gallery:true});}
 catch(error){document.querySelector('#status').textContent='无法启动 3D 预览。请确认浏览器支持 WebGL。';console.error(error);}
}
open.addEventListener('click',show);
show();
