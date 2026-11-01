// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {build} from 'esbuild';
import {BLIGHT_CRYSTALS,BLIGHT_SOLIDS,blightBlocked,blightHeight,blightLineClear,blightCanFight,blightCrystalXP} from '../public/ancient-blight.js';
import {cityMap,cityWorldId} from '../public/ancient-city.js';
import {newAncientProfile,blocked,ancientMapHeight,xpNeeded} from '../public/ancient-rules.js';
import {MAIN_QUESTS,advanceQuest,currentQuest} from '../public/ancient-quests.js';
import {skillDamageMultiplier} from '../public/ancient-skills.js';
assert.equal(cityMap('blight'),'blight');assert.equal(cityWorldId('blight'),7);assert.equal(cityWorldId('city'),5);
assert.equal(ancientMapHeight('blight',0,500),-12);assert(!blocked(0,500,.6,'blight'));
assert(!blightBlocked(-30,290),'House interior open');assert(!blightBlocked(-21,290),'House front has a door');assert(blightBlocked(-39,290),'Back wall solid');assert(!blightLineClear(-30,1.7,290,-42,1.7,290),'No damage through house walls');
for(const c of BLIGHT_CRYSTALS)assert(!blightBlocked(c.x,c.z));
const oldEnd=MAIN_QUESTS.findIndex(q=>q.id==='city-aftermath');assert.equal(MAIN_QUESTS[oldEnd+1].id,'blight-summons');
const descriptions=MAIN_QUESTS.filter(q=>q.id.startsWith('blight-')).flatMap(q=>[...(q.dialogue||[]),...q.goal]).join(' ');assert(!/20%|20％/.test(descriptions));assert(descriptions.includes('有概率魔化'));
const progress=newAncientProfile();progress.level=100;progress.quest={revision:7,step:MAIN_QUESTS.findIndex(q=>q.id==='blight-crystals'),count:0};for(let i=0;i<3;i++)advanceQuest(progress,{kind:'absorb',map:'blight'});assert.equal(currentQuest(progress).id,'blight-crystal-report');
for(const level of [1,30,90,100,150,999])assert.equal(blightCrystalXP(level),10000);
assert.equal(skillDamageMultiplier({corrupted:true}),1.3);assert.equal(blightCrystalXP(100),10000);
assert(!blightCanFight({name:'a',hp:100},{name:'b',hp:100}));assert(blightCanFight({name:'a',hp:100,corrupted:true},{name:'b',hp:100}));assert(!blightCanFight({name:'a',hp:0,corrupted:true},{name:'b',hp:100}));
const bundle=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']});
let now=100000,random=.1;const records=new Map(),profiles=new Map(),messages=[];
const exec=(sql,...args)=>{let rows=[];if(sql.startsWith('SELECT')){const table=/FROM (\w+)/.exec(sql)?.[1],value=records.get(table+':'+args[0]);if(value)rows=[value]}else if(sql.startsWith('INSERT INTO ancient_abilities'))records.set('ancient_abilities:'+args[0],{data:args[1]});else if(sql.startsWith('INSERT INTO ancient_world'))records.set('ancient_world:'+args[0],{data:args[1],tick:args[2]});else if(sql.startsWith('INSERT INTO ancient_health'))records.set('ancient_health:'+args[0],{hp:args[1],maxHp:args[2],deadAt:args[3]});return {toArray:()=>rows}};
const c=BLIGHT_CRYSTALS[0];
const actor=name=>({name,map:'blight',x:c.x,z:c.z-2,y:blightHeight(c.x,c.z-2)+1.7,yaw:Math.PI,hp:100000,maxHp:100000,deadAt:0,weapon:newAncientProfile().weapons[0],ammo:10,lastShot:0,lastMove:now,seen:now});
const peers=['a','b'].map(name=>{let p=actor(name);const profile=newAncientProfile();profile.level=name==='a'?100:150;profile.boosts={experience:now+3600000};profile.quest={revision:7,step:MAIN_QUESTS.findIndex(q=>q.id==='blight-crystals'),count:0};profiles.set(name,profile);return {deserializeAttachment:()=>structuredClone(p),serializeAttachment:a=>{p=structuredClone(a)},send:s=>messages.push({name,...JSON.parse(s)}),close(){}}});
const ctx={getWebSockets:()=>peers,storage:{sql:{exec},setAlarm:async()=>{},transactionSync:fn=>fn()}},module={exports:{}};
vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,crypto,Date:{now:()=>now},Math:Object.assign(Object.create(Math),{random:()=>random}),require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
const server=new module.exports.AncientWorld(ctx,{});server.read=name=>structuredClone(profiles.get(name));server.save=(name,p)=>profiles.set(name,structuredClone(p));server.parties=()=>({recipients:()=>[],online:()=>new Map()});
const a=peers[0].deserializeAttachment(),dy=blightHeight(c.x,c.z)+1.3-a.y,length=Math.hypot(dy,2),packet=JSON.stringify({type:'absorbCrystal',id:c.id,direction:[0,dy/length,2/length]});
await server.webSocketMessage(peers[0],packet);assert.equal(messages.find(m=>m.name==='a'&&m.type==='blightAbsorbed')?.xp,10000);assert(profiles.get('a').corrupted);assert.equal(profiles.get('a').xp,10000);assert.equal(profiles.get('a').quest.count,1);
await server.webSocketMessage(peers[0],packet);await server.webSocketMessage(peers[1],packet);assert.equal(profiles.get('a').xp,10000);assert.equal(profiles.get('b').xp,0,'Shared crystal can only be absorbed once');
const corrupted=peers[0].deserializeAttachment(),normal=peers[1].deserializeAttachment();normal.x=corrupted.x;normal.z=corrupted.z-1;peers[1].serializeAttachment(normal);
const combat=server.skillContext(peers[1],normal,[],'blight');assert.equal(combat.monsters.length,1);combat.damage(combat.monsters[0],1e9);combat.flush();assert.equal(peers[0].deserializeAttachment().hp,0);assert.equal(profiles.get('a').corrupted,false,'PvP death restores normal');
const dead=peers[0].deserializeAttachment();dead.corrupted=true;profiles.get('a').corrupted=true;server.persistHealth(dead);assert.equal(profiles.get('a').corrupted,false,'Any death, including monsters, clears corruption');
const world=server.world('blight');assert.equal(world.monsters.length,28);assert(world.monsters.some(m=>m.kind==='blight_lord'));assert(world.monsters.every(m=>!blightBlocked(m.x,m.z,1)));
now+=180001;random=.9;const other=peers[1].deserializeAttachment();Object.assign(other,actor('b'));peers[1].serializeAttachment(other);await server.webSocketMessage(peers[1],packet);assert.equal(profiles.get('b').xp,10000,'Level 150 with Double XP still receives exactly 10000');assert.equal(profiles.get('b').corrupted,false,'Random roll above threshold does not corrupt');
// Authoritative defense: start only beside the device, no restart-spawn spam, cancel on leaving.
const guardProfile=profiles.get('b');guardProfile.quest={revision:7,step:MAIN_QUESTS.findIndex(q=>q.id==='blight-defend'),count:0};profiles.set('b',guardProfile);
const guardActor=peers[1].deserializeAttachment();Object.assign(guardActor,{x:0,z:275,y:1.7,hp:100000,deadAt:0});peers[1].serializeAttachment(guardActor);
await server.webSocketMessage(peers[1],JSON.stringify({type:'blightDefend'}));const defense=peers[1].deserializeAttachment();assert.equal(defense.defenseUntil,now+30000);const spawned=server.world('blight').monsters.length;await server.webSocketMessage(peers[1],JSON.stringify({type:'blightDefend'}));assert.equal(server.world('blight').monsters.length,spawned);
const afterDefense=server.world('blight');afterDefense.monsters=[];server.persist(afterDefense);const absent=peers[0].deserializeAttachment();absent.seen=now;peers[0].serializeAttachment(absent);now+=30000;defense.seen=now;peers[1].serializeAttachment(defense);await server.tickMap('blight');assert.equal(currentQuest(profiles.get('b')).id,'blight-rescue');
// Direct attacks: normal players cannot hurt each other, corruption enables real melee.
for(const [i,peer]of peers.entries()){const p=profiles.get(i?'b':'a');p.corrupted=false;server.save(i?'b':'a',p);const v=actor(i?'b':'a');Object.assign(v,{x:0,z:260+i*2,y:1.7,hp:10000000,maxHp:10000000,corrupted:false,skillRuntime:{cooldowns:{},effects:{},mode:1,lastAux:0}});peer.serializeAttachment(v)}
const hitPacket=JSON.stringify({type:'melee',direction:[0,-.15,Math.sqrt(1-.15**2)]});await server.webSocketMessage(peers[0],hitPacket);assert.equal(peers[1].deserializeAttachment().hp,10000000);
const attacker=peers[0].deserializeAttachment();attacker.corrupted=true;profiles.get('a').corrupted=true;peers[0].serializeAttachment(attacker);now+=1000;await server.webSocketMessage(peers[0],hitPacket);assert(peers[1].deserializeAttachment().hp<10000000,'Real melee hits eligible players');assert.equal(server.read('a').corrupted,true,'Corruption persists in saved profile');
// Walls reject PvP damage even if a target proxy is supplied.
const behind=peers[1].deserializeAttachment();Object.assign(behind,{x:-42,z:290,y:1.7});peers[1].serializeAttachment(behind);const inside=peers[0].deserializeAttachment();Object.assign(inside,{x:-30,z:290,y:1.7});const walled=server.skillContext(peers[0],inside,[],'blight');const hp=behind.hp;assert.equal(walled.damage(walled.monsters[0],1000),0);walled.flush();assert.equal(peers[1].deserializeAttachment().hp,hp);
console.log('PASS: map routing/collision/LOS, old-story continuity, bilingual risk-only text, crystal XP/task progress/shared cooldown, corruption bonus, PvP and monster-death recovery, capped shared monster spawn.');
