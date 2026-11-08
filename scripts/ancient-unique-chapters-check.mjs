// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {CLIENT_RELEASE} from '../src/client-release.ts';
import assert from 'node:assert/strict';import{DatabaseSync}from'node:sqlite';import vm from'node:vm';import{build}from'esbuild';import{createHash}from'node:crypto';
import{CHAPTER_ROUTES,CHAPTER_SCENERY,chapterPoint,chapterSafe,chapterBlocked,chapterPath,chapterHeight,chapterDistance,setChapterState,chapterMovementScale}from'../public/ancient-geography.js';
import{CHAPTER_FEATURES,useChapterFeature,DIAL_TARGETS}from'../public/ancient-chapter-features.js';
import{DUNES_SPAWNS,DUNES_BOSSES,DUNES_KINDS,dunesMonsterHP,dunesMonsterDamage}from'../public/ancient-dunes.js';
import{SKYREACH_SPAWNS,skyreachMonsterHP,skyreachMonsterDamage}from'../public/ancient-skyreach.js';
import{STARFALL_SPAWNS}from'../public/ancient-starfall.js';import{FROSTCOURT_SPAWNS}from'../public/ancient-frostcourt.js';
import{QUEST_NPCS,MAIN_QUESTS,advanceQuest,currentQuest}from'../public/ancient-quests.js';import{ancientMovementPath,newAncientProfile,ancientMonsterXP,xpNeeded,ancientMonsterDamage,ANCIENT_KINDS}from'../public/ancient-rules.js';import{ancientBossGearWeights}from'../public/ancient-gear.js';import{motionPoint,tickForcedMotion}from'../public/ancient-forced-motion.js';
const oldMaps={starfall:STARFALL_SPAWNS,frostcourt:FROSTCOURT_SPAWNS,skyreach:SKYREACH_SPAWNS,dunes:DUNES_SPAWNS},hashes=new Set();
for(const[map,spawns]of Object.entries(oldMaps)){
 const start=chapterPoint(map,0,10),route=CHAPTER_ROUTES[map];assert(Math.max(...route.map(p=>p[1]))-Math.min(...route.map(p=>p[1]))>100,'not a long narrow corridor');hashes.add(createHash('sha256').update(JSON.stringify(route.map(p=>p.slice(1)))).digest('hex'));
 for(const n of [...Object.values(QUEST_NPCS).filter(n=>n.map===map),...spawns,...(map==='dunes'?DUNES_BOSSES:[])]){assert(!chapterBlocked(map,n.x,n.z,.8),`${map}: blocked ${n.name||n.kind}`);assert(chapterPath(map,start.x,start.z,n.x,n.z).length,`${map}: unreachable ${n.name||n.kind}`)}
 for(let u=1;u<380;u++){const p=chapterPoint(map,0,u),q=chapterPoint(map,0,u+.1),slope=Math.abs(chapterHeight(map,p.x,p.z)-chapterHeight(map,q.x,q.z))/Math.max(.001,Math.hypot(p.x-q.x,p.z-q.z));assert(slope<.5,`${map}: unsafe ramp ${u}`)}
}
for(const [map,props] of Object.entries(CHAPTER_SCENERY)){
 assert(props.length>0);
 for(const o of props)assert(chapterBlocked(map,o.x,o.z,.25,chapterHeight(map,o.x,o.z)),map+': missing '+o.kind+' collision');
}
for(const [map,x,z,feet] of [['blight',19,230,0],['sanctum',20,380,8],['starfall',0,0,0],['frostcourt',31,106,0],['skyreach',0,0,0],['dunes',-20,145,chapterHeight('dunes',-20,145)]]){
 const prop=CHAPTER_SCENERY[map]?.[0];
 const [px,pz,py]=prop?[prop.x,prop.z,chapterHeight(map,prop.x,prop.z)]:[x,z,feet];
 assert(!ancientMovementPath(px-4,pz,px+4,pz,map,py),map+': movement crosses solid scenery');
}
assert.equal(hashes.size,4);assert.equal(STARFALL_SPAWNS.length,24);assert.equal(FROSTCOURT_SPAWNS.length,28);assert.equal(SKYREACH_SPAWNS.length,28);
let water={};useChapterFeature(water,CHAPTER_FEATURES.find(f=>f.kind==='drain'));setChapterState('starfall',water);assert.equal(chapterMovementScale('starfall',...Object.values(chapterPoint('starfall',0,300))),1);
let dial={};for(const f of CHAPTER_FEATURES.filter(f=>f.kind==='dial'))for(let i=0;i<DIAL_TARGETS[f.index];i++)useChapterFeature(dial,f);assert(dial.solved);setChapterState('dunes',{});assert(chapterBlocked('dunes',5,275));setChapterState('dunes',dial);assert(!chapterBlocked('dunes',5,275));
for(const level of [260,280,300]){assert.equal(dunesMonsterHP('hourglass_regent',level),skyreachMonsterHP('sky_sovereign',level));assert.equal(dunesMonsterDamage('hourglass_regent',level),skyreachMonsterDamage('sky_sovereign',level));assert.equal(ancientMonsterDamage('hourglass_regent',level),dunesMonsterDamage('hourglass_regent',level));assert.equal(ancientMonsterXP('hourglass_regent',level),ancientMonsterXP('sky_sovereign',level));assert.equal(ancientMonsterXP('dune_scarab',level),ancientMonsterXP('sky_lancer',level));}
assert.deepEqual(ancientBossGearWeights('dunes'),ancientBossGearWeights('skyreach'));assert(xpNeeded(300)>xpNeeded(260));
const p=newAncientProfile(),startQuest=MAIN_QUESTS.findIndex(q=>q.id==='dunes-signal');p.level=300;p.quest={revision:7,step:startQuest,count:0};let count=0;while(currentQuest(p)){const q=currentQuest(p);assert(q.id.startsWith('dunes-'));if(q.kind==='kill'){const wrong=p.quest.count;advanceQuest(p,{kind:'kill',map:q.map,monster:{kind:q.kinds[0],region:99}});assert.equal(p.quest.count,wrong);for(let i=0;i<q.count;i++)advanceQuest(p,{kind:'kill',map:q.map,monster:{kind:q.kinds[0],region:q.region}});}else if(q.kind==='talk')advanceQuest(p,{kind:'talk',npc:q.npc,map:q.map});else if(q.kind==='enter')advanceQuest(p,{kind:'enter',map:q.map});else throw Error(q.kind);if(++count>50)throw Error('Quest loop');}assert(count>=18);
const compiled=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']}),db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return{toArray:()=>rows,one:()=>{assert.equal(rows.length,1);return rows[0]}}}},sockets=[],ctx={getWebSockets:()=>sockets,storage:{sql,setAlarm:async()=>{},transactionSync(fn){db.exec('BEGIN');try{const r=fn();db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}}}},module={exports:{}};
vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,Date,Math,structuredClone,crypto,Response,URL,AbortController,require:()=>({DurableObject:class{constructor(ctx,env){this.ctx=ctx;this.env=env}}})});const server=new module.exports.AncientWorld(ctx,{});
for(const[map,id]of [['starfall',11],['frostcourt',13],['skyreach',15]]){const legacy={id:'legacy-'+map,kind:map==='starfall'?'tide_carapace':map==='frostcourt'?'frost_oathguard':'sky_lancer',level:260,hp:100,maxHp:100,x:9,z:52,homeX:9,homeZ:52,region:0,action:'idle',actionAt:0,attackAt:0,respawnAt:0,target:''};sql.exec('INSERT INTO ancient_world VALUES(?,?,?)',id,JSON.stringify([legacy]),Date.now());const migrated=server.world(map).monsters[0],expected=chapterPoint(map,9,52);assert.equal(migrated.id,legacy.id);assert(Math.hypot(migrated.x-expected.x,migrated.z-expected.z)<.001);assert.equal(migrated.level,260);const again=server.world(map).monsters[0];assert.equal(again.x,migrated.x);assert.equal(again.z,migrated.z);let a={name:map,map,x:0,z:10,y:1.7,yaw:0,hp:100};sql.exec('INSERT INTO ancient_positions VALUES(?,?,?)',map,map,JSON.stringify({x:9,z:52,y:1.7,yaw:1}));server.restorePosition(a);assert.equal(a.chapterLayout,2);assert(!chapterBlocked(map,a.x,a.z));server.persistPosition(a);const x=a.x,z=a.z;server.restorePosition(a);assert.equal(a.x,x);assert.equal(a.z,z);}
const world=server.world('dunes');assert.equal(world.monsters.length,30);assert(world.monsters.every(m=>DUNES_KINDS[m.kind]&&Number.isFinite(m.hp)&&m.hp>0));assert.equal(server.world('dunes').monsters.length,30);
console.log('PASS: 4 distinct wide layouts, every NPC/spawn reachable, slopes <0.5, old populations retained, drain/thermal/dial data, preserved quest continuation, level-normalized balance, and idempotent monster/player migrations.');
// Feature commands use authored destinations and require proximity on the correct map.
let actor={clientVersion:CLIENT_RELEASE,name:'feature-qa',connectionId:'qa',map:'skyreach',x:0,y:1.7,z:0,hp:100,maxHp:100,lastMove:Date.now(),seen:Date.now(),yaw:0,chapterLayout:2},packets=[];
const ws={readyState:1,deserializeAttachment:()=>structuredClone(actor),serializeAttachment:a=>actor=structuredClone(a),send:raw=>packets.push(JSON.parse(raw))};sockets.push(ws);
const wind=CHAPTER_FEATURES.find(f=>f.kind==='wind');await server.webSocketMessage(ws,JSON.stringify({type:'chapterFeature',id:wind.id}));assert(!actor.forcedMotion,'distant use denied');
actor.x=wind.x;actor.z=wind.z;actor.y=chapterHeight('skyreach',wind.x,wind.z)+1.7;await server.webSocketMessage(ws,JSON.stringify({type:'chapterFeature',id:'tide-drain'}));assert(!actor.forcedMotion,'different-map feature denied');
actor.clientVersion='old';
await server.webSocketMessage(ws,JSON.stringify({type:'chapterFeature',id:wind.id}));
assert(!actor.forcedMotion,'A socket from the previous release cannot use a map mechanism');
assert(packets.some(p=>p.code==='CLIENT_UPDATE_REQUIRED'));
actor.clientVersion=CLIENT_RELEASE;
await server.webSocketMessage(ws,JSON.stringify({type:'chapterFeature',id:wind.id,to:{x:999,z:999}}));assert(actor.forcedMotion?.aerial);assert.equal(actor.forcedMotion.to.x,wind.to.x);assert.equal(actor.forcedMotion.to.z,wind.to.z);const motion=actor.forcedMotion;assert(motionPoint(motion,motion.started+1100).y>Math.max(motion.from.y,motion.to.y)+8);server.persistPosition(actor);const saved=JSON.parse(sql.exec('SELECT data FROM ancient_positions WHERE name=? AND map=?',actor.name,actor.map).one().data);assert.equal(saved.x,motion.from.x,'reconnect resumes from safe launch point');tickForcedMotion(actor,motion.started+2200,()=>true);assert(!actor.forcedMotion);assert.equal(actor.x,wind.to.x);assert.equal(actor.z,wind.to.z);assert(!chapterBlocked('skyreach',actor.x,actor.z));
const {skillDrops}=await import('../public/ancient-skills.js');for(const k of ['buried_marshal','hourglass_regent'])assert.equal(Object.values(skillDrops(k,()=>.5))[0],1);
console.log('PASS: distant/spoofed feature commands rejected, wind follows server-authored smooth arc, reconnect saves safe landing source, new bosses drop a skill book.');
