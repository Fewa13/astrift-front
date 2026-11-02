// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import{DatabaseSync}from'node:sqlite';import{build}from'esbuild';import{parseHTML}from'linkedom';import{CODE_HELP_SECTIONS}from'../public/codehelp-data.js';import{createCommunityScriptUI}from'../public/ancient-community-script-ui.js';
const bundle=await build({stdin:{contents:"export * from './src/ancient-map-runtime.ts';export * from './src/ancient-map-script.ts';export * from './src/ancient-community.ts';",resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node'}),api=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const {CommunityMapRuntime,compileMapScript,setCommunityMap}=api,db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return{toArray:()=>rows,one:()=>rows[0]}}},runtime=new CommunityMapRuntime(sql),map={id:91,tier:3,revision:1,name:'Gameplay',boundary:[{x:-40,z:-40},{x:40,z:-40},{x:40,z:40},{x:-40,z:40}],spawn:{x:0,z:0},objects:[],spawns:[],npcs:[],sky:'#829eba',skyArt:[],code:`item ore "矿石" "Ore"
item key "钥匙" "Key"
recipe forge key 1 ore 3
loot chest ore 2 1
when join
 give ore 10
 checkpoint 0 0 0
 deathitems keep
 deathloss ore 2
 stat speed 1.5
 stat jump 1.4
 stat health 1000
 stat damage 2
 panel form 5 20 35 50 "控制" "Controls"
 input nickname form text "名字" "Name" "Guest"
 input mode form select "模式" "Mode" "easy"
 option mode "easy" "简单" "Easy"
 option mode "hard" "困难" "Hard"
 input ready form check "准备" "Ready" false
 input quantity form number "数量" "Quantity" 1
 progress hp form "{player.hp}" "{player.maxhp}" "生命" "Health"
 button make form "制作" "Craft"
 effect beam beam 0 0 0 3
 sound bell bell 0 0 0 0.5 1 2
 sky "#223344"
 fog "#334455" 0.01
 round countdown 1
end
when button make
 craft forge 1
 roll chest 1
 give ore 1
 save greeting input.nickname
end
when input ready
 save ready input.ready
end
when key KeyG
 nextstage
end
when phase active
 save started 1
end
when leavezone 0 0 5
 save left 1
end
when hurt
 save damage event.amount
end
when death
 save deaths deaths + 1
end
when respawn
 save respawns respawns + 1
end`};setCommunityMap(map);const a={name:'alice',map:'community:91',connectionId:'a',x:0,y:1.7,z:0,hp:50,maxHp:100};runtime.enter(map.id,a.name,'a',false);runtime.heartbeat(map,a,()=>{});assert.equal(a.hp,500);assert.equal(a.maxHp,1000);assert.equal(a.mapModifiers.speed,1.5);assert.deepEqual(runtime.checkpoint(map,a),{x:0,y:0,z:0});assert.equal(runtime.gameplay(map,a).effects.length,1);assert.equal(runtime.gameplay(map,a).environment.sky,'#223344');
runtime.submitInputs(map,a,'make',{nickname:'Alice',mode:'hard',ready:true,quantity:2});runtime.execute(map,a,'button','make',()=>{});let bag=runtime.bag(map,a.name);assert.equal(bag.items.find(i=>i.id==='key').quantity,1);assert.equal(bag.items.find(i=>i.id==='ore').quantity,10,'craft/roll/give share the same inventory');assert.throws(()=>runtime.submitInputs(map,a,'make',{mode:'evil'}),/Invalid/);assert.throws(()=>runtime.submitInputs(map,a,'make',{undeclared:1}),/Unknown/);runtime.submitInputs(map,a,'ready',{ready:true},'input');runtime.execute(map,a,'input','ready',()=>{});assert.equal(runtime.ui(map,a).elements.find(e=>e.id==='hp').value,500);runtime.validateAction(map,a,'key','KeyG');assert.throws(()=>runtime.validateAction(map,a,'key','KeyQ'));runtime.execute(map,a,'key','KeyG',()=>{});assert.equal(runtime.gameplay(map,a).round.stage,2);
// Expiry and phase event once; reconnect preserves inputs, stats and checkpoint.
const time=Date.now,clock=time()+1500;Date.now=()=>clock;runtime.heartbeat(map,a,()=>{});assert.equal(runtime.gameplay(map,a).round.phase,'active');runtime.enter(map.id,a.name,'b',true);a.connectionId='b';runtime.heartbeat(map,a,()=>{});assert.equal(runtime.modifiers(map,a).damage,2);a.x=10;runtime.heartbeat(map,a,()=>{});Date.now=time;
runtime.execute(map,a,'hurt','',()=>{},[],{amount:17,source:'monster'});a.hp=0;runtime.execute(map,a,'death','',()=>{});runtime.execute(map,a,'death','',()=>{});assert.equal(runtime.bag(map,a.name).items.find(i=>i.id==='ore').quantity,8,'death deduction once');a.hp=1000;runtime.execute(map,a,'respawn','',()=>{});const data=JSON.parse(db.prepare('SELECT data FROM community_player_items WHERE map=? AND name=?').get(map.id,a.name).data);assert.equal(data.vars.deaths,1);assert.equal(data.vars.respawns,1);assert.equal(data.vars.damage,17);assert.equal(data.vars.left,1);assert.equal(data.vars.started,1);assert.equal(data.vars.greeting,'Alice');assert.equal(data.vars.ready,true);
const bad={...map,revision:2,code:'item ore "矿石" "Ore"\nitem key "钥匙" "Key"\nrecipe expensive key 1 ore 999\nwhen key KeyG\n craft expensive 1\nend'};const before=runtime.bag(map,a.name);assert.throws(()=>runtime.execute(bad,a,'key','KeyG',()=>{}),/Not enough/);assert.deepEqual(runtime.bag(map,a.name),before,'craft rollback');const unsafe={...map,revision:3,code:'when key KeyG\n checkpoint 100 0 0\nend'};assert.throws(()=>runtime.execute(unsafe,a,'key','KeyG',()=>{}),/Unsafe/);
for(const section of CODE_HELP_SECTIONS.filter(s=>['game-events','checkpoints','scene-feedback','rounds','map-stats','input-controls','craft-loot'].includes(s.id)))for(const e of section.entries)if(e.example.includes('when'))compileMapScript(e.example);
// Real UI controls keep their node/draft across live HP updates.
const {document,window}=parseHTML('<html><body></body></html>');globalThis.document=document;globalThis.window=window;let sent=[];const client=createCommunityScriptUI({en:()=>true,getMap:()=>a.map,active:()=>true,paused:()=>false,unlock(){},clearInput(){},send:d=>sent.push(d)});client.handle(runtime.ui(map,a));const field=document.querySelector('[data-map-input="nickname"]');field.value='Typed';field.dispatchEvent(new window.Event('input'));a.hp=600;client.handle(runtime.ui(map,a));assert.equal(document.querySelector('[data-map-input="nickname"]'),field);assert.equal(field.value,'Typed');document.querySelector('[data-map-ui-id="make"]').onclick();assert.equal(sent.at(-1).values.nickname,'Typed');assert.equal(document.querySelector('header button'),null);client.dispose();runtime.leave(a.name,'b');assert.deepEqual(runtime.modifiers(map,a),{});assert.equal(runtime.gameplay(map,{...a,name:'bob'}).stats.damage,undefined);db.close();console.log('PASS: all seven gameplay categories, safe checkpoint, damage/death events and idempotent penalty, shared phase transition, reconnect/map isolation, craft atomicity, weighted map loot, input tamper rejection, stable live controls, all new Help examples compile.');
// Actual Three scene: shared effects replace by ID, expire and dispose on map exit.
const THREE=await import('../public/three.module.js'),{createCommunityGameplay}=await import('../public/ancient-community-gameplay.js');let currentMap='community:91',currentActive=true;const scene=new THREE.Scene();scene.background=new THREE.Color('#123456');scene.fog=new THREE.FogExp2('#234567',.005);const camera=new THREE.PerspectiveCamera(),player={hp:100};camera.position.set(0,1.7,3);const game=createCommunityGameplay({scene,camera,getMap:()=>currentMap,getDefinition:()=>map,getPlayer:()=>player,active:()=>currentActive,paused:()=>false,en:()=>true,send:d=>sent.push(d)}),stamp=Date.now();game.handle({type:'communityGame',map:91,stats:{speed:2},environment:{sky:'#334455'},effects:[{id:'ring',kind:'ring',x:0,y:0,z:0,started:stamp,until:stamp+1000}],sounds:[],keys:['KeyG'],round:{number:1,stage:2,phase:'active',until:0}});game.update();assert.equal(scene.children.length,1);assert.equal(scene.background.getHexString(),'334455');assert.equal(player.mapModifiers.speed,2);assert.equal(game.key('KeyG'),true);assert.equal(sent.at(-1).action,'key');assert.equal(game.key('KeyQ'),false);game.handle({type:'communityGame',map:91,environment:{},effects:[],sounds:[],keys:[]});game.update();assert.equal(scene.children.length,0);assert.equal(scene.background.getHexString(),'123456');currentMap='tribe';game.update();assert.equal(document.querySelector('.communityRoundHUD').hidden,true);game.dispose();console.log('PASS: real Three scene effect lifecycle, map-only environment restore, stat delivery, key dispatch and map-exit cleanup.');
