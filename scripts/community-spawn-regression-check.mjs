import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {emailHarness} from './account-email-check.mjs';
import {setCommunityMap,communityBlocked,communityClear,communityLineWalk} from '../public/ancient-community.js';
const h=await emailHarness(),db=new DatabaseSync(':memory:'),sockets=[],pending=[];
const wallMap={id:919191,tier:3,boundary:[{x:-30,z:-30},{x:30,z:-30},{x:30,z:30},{x:-30,z:30}],spawn:{x:-10,z:0},spawns:[],objects:[{id:'wall',model:'box',x:0,y:0,z:0,w:1,h:5,d:20,rotation:0,solid:true,components:{collision:{mode:'static',layers:['monster']}}}]};
setCommunityMap(wallMap);assert(communityBlocked('community:919191',0,0,.65,0,'monster'));assert(!communityLineWalk('community:919191',-3,0,3,0,.65,0,'monster'));assert(!communityBlocked('community:919191',0,0,.6,0));assert(communityClear('community:919191',-3,1,0,3,1,0),'Projectile crosses monster-only wall');
const sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows,one:()=>rows[0]}}};
const ctx={waitUntil:p=>pending.push(p),storage:{sql,getAlarm:async()=>1,setAlarm:async()=>{},transactionSync:fn=>fn()},getWebSockets:()=>sockets};
const w=new h.classes.AncientWorld(ctx,h.env);
await w.command('arenaqa','profile',{});w.community().saveWallet('arenaqa',{blank:0,blank3:1,medium:0,advanced:0,redraw:0,wins:0});
let r=await w.command('arenaqa','communityCreate',{tier:3});assert(r.ok,JSON.stringify(r));
const fixture=JSON.parse(fs.readFileSync('scripts/fixtures/skill-recording-arena.json','utf8')).map;
r=await w.command('arenaqa','communitySave',{id:r.map.id,revision:r.map.revision,map:{...r.map,...fixture,id:r.map.id,tier:3}});assert(r.ok,JSON.stringify(r));
const map=r.map;assert.equal(map.spawns.length,18);assert(map.spawns.every(s=>s.respawn===3600));
assert((await w.command('arenaqa','communitySubmit',{id:map.id,revision:map.revision})).ok);w.adminCommunityReview(map.id,map.revision,true,'');
const key='community:'+map.id,definition=w.community().load(map.id);
const actor={name:'arenaqa',map:key,x:0,y:1.7,z:0,hp:100,maxHp:100,connectionId:'qa',seen:Date.now()};
const ws={deserializeAttachment:()=>actor,serializeAttachment:p=>Object.assign(actor,p),send(){},close(){}};sockets.push(ws);
function ready(id){w.community().load(id);const saved=JSON.parse(sql.exec('SELECT data FROM ancient_abilities WHERE name=?','componentState:'+id).one().data);sql.exec('INSERT INTO ancient_abilities VALUES(?,?) ON CONFLICT(name) DO UPDATE SET data=excluded.data','componentState:'+id,JSON.stringify({...saved,started:Date.now()-10000,vars:{},fired:{},timers:{},queue:[],disabled:{},inside:{}}));}
ready(map.id);let world=w.world(key);assert.equal(world.monsters.length,18,'All authored arena targets spawn');w.persist(world);
// Durable deaths survive unload/rebuild, including the boss's configured hour.
const until=Date.now()+3600000;
for(const m of world.monsters){m.hp=0;m.action='dead';m.respawnAt=until;sql.exec('INSERT INTO community_mob_cooldowns VALUES(?,?,?)',key,m.id,until)}w.persist(world);
sql.exec('INSERT INTO community_mob_cooldowns VALUES(?,?,?)','community:999999','other',until);
world=w.world(key);assert.equal(world.monsters.length,18);assert(world.monsters.every(m=>m.hp===0&&m.respawnAt===until));
// Exercise the actual shipped pedal, including its 18 spawn actions and kill condition.
const pedal=definition.v2.areas.find(a=>a.id==='reset_area');assert(pedal);
ready(map.id);const state=JSON.parse(sql.exec('SELECT data FROM ancient_abilities WHERE name=?','componentState:'+map.id).one().data);state.vars.__kills=18;sql.exec('UPDATE ancient_abilities SET data=? WHERE name=?',JSON.stringify(state),'componentState:'+map.id);
actor.x=pedal.x;actor.z=pedal.z;actor.y=(pedal.y||0)+1.7;
w.componentEvent(ws,actor,definition,'heartbeat','');world=w.world(key);
assert.equal(world.monsters.length,18,'Pedal restores authored identities, no temporary duplicates');assert(world.monsters.every(m=>m.hp===m.maxHp&&m.hp>0));assert.equal(sql.exec('SELECT * FROM community_mob_cooldowns WHERE map=?',key).toArray().length,0);assert.equal(sql.exec('SELECT * FROM community_mob_cooldowns WHERE map=?','community:999999').toArray().length,1);
actor.x=0;actor.z=-1000;assert.equal(w.world(key).monsters.length,18,'Far pedal/player does not discard this small encounter');
const preview=await w.command('arenaqa','communityPreview',{id:map.id});assert(preview.ok,JSON.stringify(preview));ready(preview.map.id);actor.map='community:'+preview.map.id;const testWorld=w.world(actor.map);assert.equal(testWorld.monsters.length,18,'Preview also contains all 18 targets');
actor.x=0;actor.z=0;
for(const mob of [testWorld.monsters[0],testWorld.monsters[1]]){const start=Date.now();w.damageMonster(ws,actor,mob,mob.maxHp*100);assert.equal(mob.hp,0);assert(mob.respawnAt>=start+3600000&&mob.respawnAt<=Date.now()+3600000,'Boss and normal monster use authored 3600 seconds');}
const fresh=w.world(key).monsters.find(m=>m.kind==='grox');assert(w.findMobRespawn(fresh,key,[]),'Authored respawn position remains valid');
const stale=w.world(actor.map),wave={...w.community().load(preview.map.id),v2:{...preview.map.v2,triggers:[{id:'waveqa',event:'interact',max:1,actions:Array.from({length:24},(_,i)=>({type:'spawn',kind:'grox',level:200,x:-20+i,y:0,z:-25}))}]}};
w.componentEvent(ws,actor,wave,'interact','waveqa');assert.equal(w.world(actor.map).monsters.filter(m=>m.id.startsWith('script-')).length,24,'More than 16 scripted monsters spawn and survive world reconstruction');
w.persist(stale);assert.equal(w.world(actor.map).monsters.filter(m=>m.id.startsWith('script-')).length,24,'Persisting an older snapshot preserves all concurrently spawned monsters');
await Promise.all(pending);console.log('PASS real Advanced arena: 18 published/preview targets, durable deaths, shipped pedal restores 18 identities, scoped cooldown reset and distant player');
