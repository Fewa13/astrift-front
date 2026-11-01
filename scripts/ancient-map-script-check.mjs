// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import {build} from 'esbuild';
const bundled=await build({stdin:{contents:"export * from './src/ancient-map-runtime.ts';export * from './src/ancient-map-script.ts';export * from './src/ancient-community.ts';",resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node'}),api=await import('data:text/javascript;base64,'+Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const {compileMapScript,runMapScript,CommunityMapRuntime,cleanCommunityMap,setCommunityMap}=api;
const source=`item coin "铜币" "Coin"
item key "钥匙" "Key"
when join
 if visited == 0
  give coin 5
  set visited 1
 end
end
when kill any
 give coin 1
 add kills 1
end
when timer 5
 add timer 1
end
when zone 10 10 3
 give coin 2
end`;
assert.throws(()=>compileMapScript('fetch("https://evil")'));assert.throws(()=>compileMapScript('when join\n repeat 999999\n end\nend'));assert.throws(()=>compileMapScript('when join\n give fake 1\nend'));assert.throws(()=>compileMapScript('when join\n give coin 1'));
const budget=compileMapScript('when join\nrepeat 16\nrepeat 16\nheal 1\nend\nend\nend');assert.throws(()=>runMapScript(budget,'join',()=>true,{items:{},vars:{},heal(){}}),/limit/);
const raw={id:1,owner:'creator',tier:2,name:'Test',boundary:[{x:-40,z:-40},{x:40,z:-40},{x:40,z:40},{x:-40,z:40}],spawn:{x:0,z:-30},objects:[],spawns:[],sky:'#829eba',skyArt:[],revision:1,code:source,npcs:[{id:'npc_trader',name:['商人','Merchant'],x:0,y:0,z:0,rotation:0,lines:[{npc:['换一把钥匙？','Trade for a key?'],player:['交换','Trade'],take:[{item:'coin',quantity:3}],give:[{item:'key',quantity:1}]}]}]};
const map=cleanCommunityMap(raw,2,1,'creator');setCommunityMap(map);assert.equal(map.npcs.length,1);assert.throws(()=>cleanCommunityMap(raw,1,1,'creator'));assert.throws(()=>cleanCommunityMap({...raw,npcs:[{...raw.npcs[0],lines:Array(11).fill(raw.npcs[0].lines[0])}]},2,1,'creator'));assert.throws(()=>cleanCommunityMap({...raw,npcs:[{...raw.npcs[0],name:['中文','']}]},2,1,'creator'));
const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows,one:()=>rows[0]}}},runtime=new CommunityMapRuntime(sql),player={name:'alice',map:'community:1',connectionId:'one',x:0,y:1.7,z:0,hp:100,maxHp:100},spawn=()=>{};
runtime.heartbeat(map,player,spawn);assert.equal(runtime.bag(map,'alice').items[0].quantity,5);player.connectionId='two';runtime.heartbeat(map,player,spawn);assert.equal(runtime.bag(map,'alice').items[0].quantity,5,'starter example cannot be farmed by reconnecting');
let r=runtime.npc(map,player,{npc:'npc_trader'}),nonce=r.dialogue.nonce;assert.equal(r.bag.items[0].quantity,5);r=runtime.npc(map,player,{npc:'npc_trader',reply:true,nonce});assert.equal(r.dialogue,null);assert.equal(r.bag.items.find(i=>i.id==='coin').quantity,2);assert.equal(r.bag.items.find(i=>i.id==='key').quantity,1);assert.throws(()=>runtime.npc(map,player,{npc:'npc_trader',reply:true,nonce}),/expired/);
r=runtime.npc(map,player,{npc:'npc_trader'});assert.throws(()=>runtime.npc(map,player,{npc:'npc_trader',reply:true,nonce:r.dialogue.nonce}),/Not enough/);assert.equal(runtime.bag(map,'alice').items.find(i=>i.id==='key').quantity,1,'failed trade grants nothing');assert.equal(runtime.bag({...map,id:2},'alice').items.length,0);assert.equal(runtime.bag(map,'bob').items.length,0);assert.throws(()=>runtime.npc(map,{...player,x:20},{npc:'npc_trader'}),/closer/);
const restart=new CommunityMapRuntime(sql);assert.equal(restart.bag(map,'alice').items.find(i=>i.id==='key').quantity,1);restart.execute(map,player,'kill','grox',spawn);assert.equal(restart.bag(map,'alice').items.find(i=>i.id==='coin').quantity,3);
console.log('PASS bilingual NPC validation, map/user inventory isolation, persistent trades, replay rejection, insufficient balance, distance, safe language and execution budget.');
