// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {CLIENT_RELEASE} from '../src/client-release.ts';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
import {build} from 'esbuild';
import {DUNGEON_TIERS,dungeonBlocked,dungeonPath,setDungeonGeometry,dungeonHealthScale,dungeonDamageScale} from '../public/ancient-dungeon.js';
import {cityWorldId} from '../public/ancient-city.js';
import {ANCIENT_FORGE,GEAR} from '../public/ancient-gear.js';
import {ancientMonsterXP,ancientKillExperience,lineClear} from '../public/ancient-rules.js';
const compiled=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']});
let now=100000;const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows,one:()=>{assert.equal(rows.length,1);return rows[0]}}}},sockets=[],messages=new Map(),module={exports:{}};
const ctx={getWebSockets:()=>sockets.filter(ws=>!ws.closed),storage:{sql,setAlarm:async()=>{},transactionSync(fn){db.exec('BEGIN');try{const result=fn();db.exec('COMMIT');return result}catch(e){db.exec('ROLLBACK');throw e}}}};
class TestResponse{constructor(body,options){this.status=options.status;this.webSocket=options.webSocket}static json(body,options){return Response.json(body,options)}}
class TestPair{constructor(){this[0]={};let actor;this[1]={deserializeAttachment:()=>structuredClone(actor),serializeAttachment:a=>actor=structuredClone(a),send:s=>messages.get(actor.name).push(JSON.parse(s)),close(){this.closed=true}}}}
ctx.acceptWebSocket=ws=>sockets.push(ws);
vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,Date:class extends Date{constructor(...args){super(...(args.length?args:[now]))}static now(){return now}},AbortController,structuredClone,crypto,Math,Response:TestResponse,WebSocketPair:TestPair,URL,require:()=>({DurableObject:class{constructor(ctx,env){this.ctx=ctx;this.env=env}}})});
const server=new module.exports.AncientWorld(ctx,{ACCOUNT_SESSIONS:{getByName:()=>({banState:async()=>null})}}),cmd=(n,a,d={})=>server.command(n,a,d);
function add(name,level=20){const p=server.read(name);p.level=level;server.save(name,p);let actor={clientVersion:CLIENT_RELEASE,name,map:'tribe',tribeLayout:2,x:0,y:1.7,z:50,hp:50000,maxHp:50000,seen:now,weapon:p.weapons[0],skills:{},lastShot:0,lastMove:now,moveCredit:2,deadAt:0};messages.set(name,[]);const ws={deserializeAttachment:()=>structuredClone(actor),serializeAttachment:a=>actor=structuredClone(a),send:s=>messages.get(name).push(JSON.parse(s)),close(){this.closed=true}};sockets.push(ws);return ws}

const map={id:91,tier:3,owner:'qa',revision:1,name:'QA',boundary:[{x:-40,z:-40},{x:40,z:-40},{x:40,z:40},{x:-40,z:40}],spawn:{x:0,z:0},objects:[],spawns:[],npcs:[],sky:'#829eba',skyArt:[],code:`when join
 checkpoint 0 0 0
 stat health 1000
 stat damage 2
 stat speed 1.5
 panel control 5 5 30 30 "地图" "Map"
 button add control "加速" "Speed up"
end
when button add
 stat speed 2
end
when hurt
 save lastHit event.amount
end
when death
 save dead 1
end
when respawn
 save revived 1
end
when key KeyG
 stage 3
end`};
server.community();sql.exec("INSERT INTO community_maps(id,owner,data,published,status) VALUES(?,?,?,?,?)",91,'qa',JSON.stringify(map),JSON.stringify(map),'published');server.community().load(91);
const ws=add('qa'),actor=ws.deserializeAttachment();Object.assign(actor,{map:'community:91',x:0,y:1.7,z:0,hp:50,maxHp:100,connectionId:'qa'});ws.serializeAttachment(actor);await server.webSocketMessage(ws,JSON.stringify({type:'heartbeat'}));let a=ws.deserializeAttachment();assert.equal(a.maxHp,1000);assert.equal(a.hp,500);assert.equal(a.mapModifiers.speed,1.5);server.syncQuestHealth(a,server.read('qa'));assert.equal(a.hp,500,'health stat must not heal twice on profile synchronization');ws.serializeAttachment(a);
await server.webSocketMessage(ws,JSON.stringify({type:'communityUI',action:'click',id:'add',values:{}}));assert.equal(ws.deserializeAttachment().mapModifiers.speed,2);now+=400;await server.webSocketMessage(ws,JSON.stringify({type:'communityAction',action:'key',id:'KeyG'}));assert(messages.get('qa').some(m=>m.type==='communityGame'&&m.round?.stage===3));
a=ws.deserializeAttachment();server.applyMapDamage(a,9999,{type:'monster',attack:'test'});assert.equal(a.hp,0);a.deadAt=now;ws.serializeAttachment(a);let state=JSON.parse(sql.exec('SELECT data FROM community_player_items WHERE map=? AND name=?',91,'qa').toArray()[0].data);assert.equal(state.vars.dead,1);assert.equal(state.vars.lastHit,500);now+=4000;await server.webSocketMessage(ws,JSON.stringify({type:'respawn'}));a=ws.deserializeAttachment();assert.equal(a.x,0);assert.equal(a.y,1.7);assert.equal(a.hp,1000);state=JSON.parse(sql.exec('SELECT data FROM community_player_items WHERE map=? AND name=?',91,'qa').toArray()[0].data);assert.equal(state.vars.revived,1);
const target={id:'qa-mob',kind:'grox',x:2,z:0,y:0,hp:10000,maxHp:10000,level:1,contributions:[]};const dmg=server.damageMonster(ws,a,target,100);const baseline={...a,map:'tribe',mapModifiers:{damage:2}};const normal=server.damageMonster(ws,baseline,{...target,contributions:[]},100);assert.equal(dmg,normal*2,'map damage applied once; official maps ignore map modifiers');const moved=ws.deserializeAttachment();Object.assign(moved,{x:17,y:1.7,z:19,yaw:1.2});ws.serializeAttachment(moved);server.persistPosition(moved);const ticket=await cmd('qa','ticket',{map:'community:91'});await server.fetch(new Request('https://test/api/ancient/connect?map=community:91&resume=1&ticket='+ticket.ticket,{headers:{Upgrade:'websocket'}}));let joined=messages.get('qa').filter(m=>m.type==='welcome').at(-1).you;assert.equal(joined.x,17,'community reconnect preserves x');assert.equal(joined.z,19,'community reconnect preserves z');assert.equal(joined.yaw,1.2);const fresh=await cmd('qa','ticket',{map:'community:91'});await server.fetch(new Request('https://test/api/ancient/connect?map=community:91&resume=0&ticket='+fresh.ticket,{headers:{Upgrade:'websocket'}}));joined=messages.get('qa').filter(m=>m.type==='welcome').at(-1).you;assert.equal(joined.x,0,'fresh community entry uses spawn');assert.equal(joined.z,0);db.close();console.log('PASS: actual AncientWorld WebSocket inputs/buttons/keys, health synchronization without double heal, authoritative hurt/death/respawn hooks, safe checkpoint respawn and damage isolation.');
