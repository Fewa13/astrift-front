// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
import {build} from 'esbuild';
const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows}}};
const output=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']}),module={exports:{}},sockets=[];
function socket(actor){let state=actor;return {readyState:1,messages:[],deserializeAttachment:()=>structuredClone(state),serializeAttachment:a=>state=structuredClone(a),send(s){this.messages.push(JSON.parse(s))},close(){this.readyState=2}}}
const ctx={storage:{sql,setAlarm:async()=>{},transactionSync:f=>f()},getWebSockets:()=>sockets,acceptWebSocket:ws=>sockets.push(ws)};
vm.runInNewContext(output.outputFiles[0].text,{module,exports:module.exports,Date,crypto,Math,URL,structuredClone,WebSocketPair:class{constructor(){return {0:socket(null),1:socket(null)}}},Response:class{constructor(body,options){Object.assign(this,options)}},require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
const server=new module.exports.AncientWorld(ctx,{});
for(const name of ['caster','friend']){const p=server.read(name);p.level=80;p.profession='swordsman';p.skills={swordrain:3,phantomblade:3};server.save(name,p);sockets.push(socket({name,map:'tribe',tribeLayout:2,x:0,z:50,y:1.7,yaw:0,hp:100000,maxHp:100000,seen:Date.now(),weapon:p.weapons[0],lastShot:0,reloadAt:0,ammo:10,deadAt:0}));}
const stale=socket({...sockets[0].deserializeAttachment(),hp:0,seen:Date.now()-5000});sockets.unshift(stale);const live=sockets[1],friend=sockets[2];
assert(!server.connections().includes(stale));const previous=stale.deserializeAttachment().seen;await server.webSocketMessage(stale,JSON.stringify({type:'heartbeat'}));assert.equal(stale.deserializeAttachment().seen,previous,'superseded connection cannot regain authority');
for(const id of ['swordrain','phantomblade']){
 for(const peer of [live,friend]){const a=peer.deserializeAttachment();delete a.skillRuntime;peer.serializeAttachment(a);peer.messages=[];}
 const w=server.world('tribe');for(const m of w.monsters)m.hp=0;const target=w.monsters[0];Object.assign(target,{kind:'grox',level:150,x:0,z:55,hp:19129500,maxHp:19129500});server.persist(w);
 for(const peer of [live,friend])await server.webSocketMessage(peer,JSON.stringify({type:'skill',id,direction:[0,-.15,Math.sqrt(1-.15**2)]}));
 const saved=server.world('tribe'),locked=saved.monsters.find(m=>m.id===target.id),count=id==='swordrain'?6:1;
 assert.equal(locked.strikes.length,count*2);for(const strike of locked.strikes)strike.at=Date.now()-9000;server.persist(saved);
 await server.tickMap('tribe');
 for(const peer of [live,friend])assert.equal(peer.messages.filter(m=>m.type==='hit'&&m.id===target.id).length,count,'every delayed hit survives the stall for each player');
 await server.tickMap('tribe');for(const peer of [live,friend])assert.equal(peer.messages.filter(m=>m.type==='hit'&&m.id===target.id).length,count,'no duplicate damage on next tick');
 assert.equal(server.world('tribe').monsters.find(m=>m.id===target.id).strikes.length,0);
}
// Real connection replacement must null the old attachment before asynchronous close.
const result=await server.command('caster','ticket',{map:'tribe'});const response=await server.fetch(new Request('https://play.astrift.com/api/ancient/connect?map=tribe&ticket='+result.ticket,{headers:{Upgrade:'websocket'}}));
assert.equal(response.status,101);assert.equal(live.deserializeAttachment(),null);assert.equal(stale.deserializeAttachment(),null);
assert.equal(server.connections().filter(ws=>ws.deserializeAttachment().name==='caster').length,1);
const authoritative=server.connections().find(ws=>ws.deserializeAttachment().name==='caster');const hp=authoritative.deserializeAttachment().hp;
server.webSocketClose(live);assert.equal(authoritative.deserializeAttachment().hp,hp,'old close cannot overwrite new character health');
let alarms=0;ctx.storage.setAlarm=async()=>alarms++;const ticks=[];server.tickMap=async map=>{ticks.push(map);throw Error('simulated map failure')};await server.alarm();assert.equal(alarms,1,'failed tick must still schedule the next alarm');assert(ticks.includes('tribe'));
db.close();console.log('PASS: two players, stale dead attachment, nine-second tick delay, exactly-once rain/giant hits, real WebSocket replacement, late old-close safety and alarm recovery.');
