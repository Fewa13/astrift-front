// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {cleanCommunityMap} from './ancient-community.js';
export function exportCommunityMap(map){return JSON.stringify({format:'astrift-map',version:1,map:{name:map.name,boundary:map.boundary,spawn:map.spawn,sky:map.sky,skyArt:map.skyArt,objects:map.objects,spawns:map.spawns,npcs:map.npcs,code:map.code,visibility:map.visibility,rules:map.rules}},null,2)}
export function importCommunityMap(text,target){
 if(typeof text!=='string'||text.length>1000000)throw Error('Map file is too large');
 const file=JSON.parse(text);if(file?.format!=='astrift-map'||file.version!==1||!file.map||typeof file.map!=='object')throw Error('Invalid Astrift map file');
 // Import content into the destination boundary; never copy access, ownership or tier.
 const raw={...file.map,name:target.name,boundary:target.boundary};
 return {...cleanCommunityMap(raw,target.tier,target.id,target.owner),revision:target.revision};
}
