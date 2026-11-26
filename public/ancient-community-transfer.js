// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {cleanCommunityMap} from './ancient-community.js';
const componentObject=o=>({...o,name:o.name||o.model||'Group',type:o.model||'group',transform:{position:{x:o.x,y:o.y,z:o.z},rotation:{x:o.rx||0,y:o.rotation||0,z:o.rz||0},scale:{x:o.w,y:o.h,z:o.d}}});
export function exportCommunityMap(map){return JSON.stringify({format:'astrift-map',version:2,map:{v2:map.v2?{...map.v2,groups:map.v2.groups.map(componentObject)}:undefined,name:map.name,boundary:map.boundary,spawn:map.spawn,sky:map.sky,skyArt:map.skyArt,objects:map.objects.map(componentObject),spawns:map.spawns,npcs:map.npcs,code:map.code,visibility:map.visibility,rules:map.rules}},null,2)}
export function importCommunityMap(text,target){
 if(typeof text!=='string'||text.length>3000000)throw Error('Map file is too large');
 const file=JSON.parse(text);if(file?.format!=='astrift-map'||![1,2].includes(file.version)||!file.map||typeof file.map!=='object')throw Error('Invalid Astrift map file');
 // Import content into the destination boundary; never copy access, ownership or tier.
 let raw={...file.map,name:target.name,boundary:target.boundary};
 return {...cleanCommunityMap(raw,target.tier,target.id,target.owner),revision:target.revision};
}
