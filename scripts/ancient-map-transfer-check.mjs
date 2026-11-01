// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {exportCommunityMap,importCommunityMap} from '../public/ancient-community-transfer.js';
import {setCommunityMap,communityBlocked,communityPlayerHeight} from '../public/ancient-community.js';
const text=readFileSync('/Users/jingfeng/Documents/Astrift Maps/青石小镇-300x300.astrift-map.json','utf8'),target={...JSON.parse(text).map,id:77,owner:'recipient',tier:3,name:'Keep my name',revision:9};
const imported=importCommunityMap(text,target);assert.equal(imported.owner,'recipient');assert.equal(imported.id,77);assert.equal(imported.name,target.name);assert.equal(imported.revision,9);assert.deepEqual(imported.boundary,target.boundary);assert(imported.objects.length>30);assert.equal(imported.spawns.length,0);
assert(!('owner' in JSON.parse(exportCommunityMap(imported)).map));assert.throws(()=>importCommunityMap(text,{...target,tier:1}));assert.throws(()=>importCommunityMap('{"format":"other"}',target));assert.throws(()=>importCommunityMap('x'.repeat(1000001),target));
setCommunityMap(imported);for(const x of [-3,0,3])for(let z=-34;z<=-8;z+=.5){const y=communityPlayerHeight(imported,x,z,0);assert(!communityBlocked('community:77',x,z,.6,y),'Entrance street must remain walkable')}
console.log('PASS portable map validation, destination identity/tier preservation, malformed file rejection and town entrance collision walk.');
const code=`item coin "铜币" "Coin"
item key "钥匙" "Key"
when join
 let run 0
 if started == 0
  give coin 5
  save started 1
 end
end
when npc npc_host
 add run 1
end`;
const npc={id:'npc_host',name:['小镇商人','Town merchant'],x:0,y:.025,z:-22,rotation:Math.PI/2,lines:[{npc:['你需要钥匙吗？','Do you need a key?'],player:['用铜币交换。','Trade my coins.'],take:[{item:'coin',quantity:3}],give:[{item:'key',quantity:1}]},{npc:['旅途平安。','Safe travels.'],player:['谢谢！','Thank you!'],take:[],give:[]}]};
const withAuthoring={...imported,code,npcs:[npc]},archive=exportCommunityMap(withAuthoring),restored=importCommunityMap(archive,{...target,id:88,owner:'another-owner'});
assert.equal(restored.code,code,'MapScript must round-trip byte for byte, including variable commands and NPC event IDs');assert.deepEqual(restored.npcs,[npc],'NPC identity, both languages, all rounds and both sides of trades must survive');assert.deepEqual(restored.objects,imported.objects);assert.deepEqual(restored.spawns,imported.spawns);assert.deepEqual(restored.spawn,imported.spawn);assert.deepEqual(restored.skyArt,imported.skyArt);assert.equal(restored.sky,imported.sky);
const again=importCommunityMap(exportCommunityMap(restored),{...target,id:99});assert.equal(again.code,code);assert.deepEqual(again.npcs,[npc]);assert.throws(()=>importCommunityMap(archive,{...target,tier:1}),'An unsupported destination rejects the whole import instead of silently dropping NPCs');
const stored=JSON.parse(archive);assert(!('vars' in stored.map)&&!('items' in stored.map),'Player variable values and inventories are not copied into a map template');console.log('PASS repeated export/import preserves Code, NPCs, bilingual dialogue, trades, stable IDs, geometry, spawn and sky; incompatible tiers reject atomically.');
