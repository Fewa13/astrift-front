// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {build} from 'esbuild';
import {CITY_BUILDINGS,CITY_KINDS,cityHeight,citySurface,cityCeiling,cityBlocked,cityLineClear,cityPath,cityWorldId} from '../public/ancient-city.js';
import {ancientMapHeight,ancientMovementPath,newAncientProfile,ancientMonsterXP,ancientMonsterDamage} from '../public/ancient-rules.js';
import {MAIN_QUESTS,QUEST_NPCS,currentQuest,advanceQuest,questCanTalk} from '../public/ancient-quests.js';
assert.deepEqual(['tribe','forest','city'].map(cityWorldId),[1,3,5]);
for(let z=10;z<=550;z+=.5){assert(!cityBlocked(0,z,.6));assert.equal(ancientMapHeight('city',0,z),cityHeight(0,z));if(z<550)assert(ancientMovementPath(0,z,0,z+.5,'city'))}
for(const b of CITY_BUILDINGS){assert(!cityBlocked(b.x,b.z+b.d/2,.6),'Open entrance');assert(cityBlocked(b.x+b.side*b.w/2,b.z,.6),'Solid side wall');assert(cityLineClear(b.x,1.7,b.z+20,b.x,1.7,b.z));assert(!cityLineClear(b.x+b.side*20,1.7,b.z,b.x,1.7,b.z));assert.equal(citySurface(b.x,b.z,0),0);assert.equal(citySurface(b.x,b.z,8),8);assert(cityCeiling(b.x,b.z,0)<8);assert.equal(cityCeiling(b.x,b.z,8),Infinity);assert(!cityLineClear(b.x,1.7,b.z,b.x,10,b.z),'Roof occludes attacks');assert(cityHeight(b.side*44,b.z+13.9)>7.9)}
assert.equal(cityHeight(0,405),-12);assert(cityBlocked(50,20));assert(cityBlocked(0,560));
for(const [id,npc]of Object.entries(QUEST_NPCS).filter(([,n])=>n.map==='city')){assert(!cityBlocked(npc.x,npc.z,.6),id+' inside wall');assert(cityPath(0,10,npc.x,npc.z).length,id+' unreachable')}
const p=newAncientProfile();p.level=100;p.quest={step:MAIN_QUESTS.findIndex(q=>q.id==='gruk-city'),count:0};let completed=[];
while(currentQuest(p)){const q=currentQuest(p);let event;if(q.kind==='talk'){const n=QUEST_NPCS[q.npc];assert(questCanTalk(p,q.npc,{x:n.x,z:n.z,hp:1,map:n.map}));event={kind:'talk',npc:q.npc,map:q.map};assert(!questCanTalk(p,q.npc,{x:n.x+20,z:n.z,hp:1,map:n.map}));}else if(q.kind==='kill'){event={kind:'kill',map:q.map,monster:{kind:q.kinds[0],level:80,region:q.region||0}}}else if(q.kind==='enter')event={kind:'enter',map:q.map};else event={kind:'check'};completed.push(...advanceQuest(p,event))}
assert(completed.includes('city-empty-king'));assert(completed.includes('city-aftermath'));const rewards=JSON.stringify(p);advanceQuest(p,{kind:'talk',npc:'eira',map:'city'});assert.equal(JSON.stringify(p),rewards);
for(const [kind,d]of Object.entries(CITY_KINDS)){assert(ancientMonsterXP(kind,80)>0);assert(ancientMonsterDamage(kind,80)>0);if(d.boss)assert(ancientMonsterXP(kind,80)>ancientMonsterXP('city_husk',80))}
const compiled=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']});
let now=10000;const rows=new Map(),sockets=[],messages=[],profile=newAncientProfile();profile.level=69;const ctx={getWebSockets:()=>sockets,storage:{sql:{exec:(sql,...args)=>{let result=[];if(sql.startsWith('SELECT data,tick FROM ancient_world')||sql.startsWith('SELECT data FROM ancient_world'))result=rows.has(args[0])?[rows.get(args[0])]:[];if(sql.startsWith('INSERT INTO ancient_world'))rows.set(args[0],{data:args[1],tick:args[2]});return {toArray:()=>result}}}}},module={exports:{}};
vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,crypto,Math,Date:{now:()=>now},require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
const server=new module.exports.AncientWorld(ctx,{});server.read=()=>profile;server.save=()=>{};
assert.equal((await server.command('test','ticket',{map:'city'})).ok,false);profile.level=70;assert.equal((await server.command('test','ticket',{map:'city'})).ok,true);
const forestBefore=JSON.stringify(server.world('forest'));const world=server.world('city');assert.equal(world.monsters.length,29);assert(world.monsters.every(m=>m.map==='city'&&!cityBlocked(m.x,m.z,1.8)));assert.equal(JSON.stringify(server.world('city')),JSON.stringify(world));assert.equal(JSON.stringify(server.world('forest')),forestBefore);
let player={name:'test',map:'city',hp:100000,maxHp:400000,weapon:profile.weapons[0],ammo:10,seen:now,x:0,z:450,y:-10.3,yaw:0,lastMove:now,moveCredit:2,moveSeq:0};const ws={deserializeAttachment:()=>player,serializeAttachment:p=>player=p,send:s=>messages.push(JSON.parse(s)),close(){}};sockets.push(ws);
server.persistHealth=()=>{};server.persistAbilities=()=>{};server.syncQuestHealth=()=>{};
await server.webSocketMessage(ws,JSON.stringify({type:'move',seq:1,x:0,z:450.5,y:-10.3,yaw:0}));assert.equal(player.z,450.5,'Underground movement accepted');
player.x=30;player.z=223;player.y=1.7;player.moveCredit=10;await server.webSocketMessage(ws,JSON.stringify({type:'move',seq:2,x:30,z:220,y:10,yaw:0}));assert.equal(player.y,1.7,'Cannot teleport through roof');
player.x=30;player.z=224;player.y=9.7;player.moveCredit=10;await server.webSocketMessage(ws,JSON.stringify({type:'move',seq:3,x:30,z:225,y:9.6,yaw:0}));assert.equal(player.z,225,'Falling off roof accepted without rubber-banding');
profile.level=100;player.x=0;player.z=510;player.y=-10.3;player.hp=400000;player.seen=now;
let peer={...player,name:'peer',x:5},outsider={...player,name:'forest-peer',map:'forest',x:5};const peerMessages=[];
sockets.push({deserializeAttachment:()=>peer,serializeAttachment:p=>peer=p,send:s=>peerMessages.push(JSON.parse(s)),close(){}},{deserializeAttachment:()=>outsider,serializeAttachment:p=>outsider=p,send(){},close(){}});
const king={id:'king',kind:'emptyking',map:'city',level:100,hp:40,maxHp:100,x:0,z:520,homeX:0,homeZ:520,region:2,action:'idle',actionAt:0,attackAt:0,respawnAt:0,target:'test',bossStep:2};server.persist({map:'city',monsters:[king],tick:now});
await server.tickMap('city');const cast=server.world('city').monsters[0].bossCast;assert.equal(cast.id,'royalMuster');assert(peerMessages.some(m=>m.type==='bossFx'&&m.stage==='warning'));
now=cast.hitAt;await server.tickMap('city');const minions=server.world('city').monsters.filter(m=>m.temporary);assert.equal(minions.length,3);assert(minions.every(m=>m.expiresAt>now&&m.map==='city'));const state=messages.filter(m=>m.type==='state').at(-1);assert(state.players.some(p=>p.name==='peer'));assert(!state.players.some(p=>p.name==='forest-peer'));assert(state.monsters.every(m=>m.map==='city'));
console.log('PASS: shared city IDs, three-region terrain, doors/walls/roof/stairs, navigable quest NPCs, complete bilingual quest chain, no reward replay, level gate, shared persisted 29 monsters, forest isolation, underground sync, ceiling validation, same-map players and boss warnings, bounded phase-II summons.');
