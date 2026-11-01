// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import {build} from 'esbuild';import vm from 'node:vm';
const b=await build({entryPoints:['src/ancient-joinlog.ts'],bundle:true,write:false,format:'esm',platform:'node'}),api=await import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));
const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows,one:()=>rows[0]}}};
sql.exec('CREATE TABLE ancient_joinlog(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,map TEXT NOT NULL,joined INTEGER NOT NULL)');sql.exec("INSERT INTO ancient_joinlog(name,map,joined) VALUES('old','tribe',1)");api.initJoinLog(sql);assert.equal(sql.exec('SELECT COUNT(*) n FROM ancient_joinlog').one().n,0);
const t=Date.parse('2026-10-20T20:00:00Z'),login=api.joinLogCommand(sql,'login',{},t),token=login.token;
assert.equal(api.joinLogCommand(sql,'stats',{name:'Tester'},t).ok,false);
api.recordMapJoin(sql,'Tester','tribe',t,'a');
for(let i=1;i<=6;i++)api.recordPlayHeartbeat(sql,'Tester','tribe','a',t+i*5000);
assert.equal(api.joinLogCommand(sql,'stats',{token,name:'tester'},t+30000).milliseconds,30000);
// Frequent real transport replacement must not duplicate visits or time.
for(let i=0;i<20;i++){const now=t+31000+i*2000;api.endPlaySession(sql,'Tester',i?'r'+(i-1):'a',false,now);api.recordMapJoin(sql,'Tester','tribe',now+100,'r'+i);}
assert.equal(api.joinLogCommand(sql,'list',{token},t+75000).total,1);
const before=api.joinLogCommand(sql,'stats',{token,name:'Tester'},t+75000).milliseconds;
api.recordPlayHeartbeat(sql,'Tester','tribe','a',t+75000);api.endPlaySession(sql,'Tester','a',true,t+75000);assert.equal(api.joinLogCommand(sql,'stats',{token,name:'Tester'},t+75000).milliseconds,before,'Replaced socket cannot count or close current session');
api.recordPlayHeartbeat(sql,'Tester','tribe','r19',t+75000);api.endPlaySession(sql,'Tester','r19',true,t+76000);
api.recordMapJoin(sql,'Tester','tribe',t+77000,'next');assert.equal(api.joinLogCommand(sql,'list',{token},t+77000).total,2,'Explicit exit and re-entry creates one new visit');
api.recordPlayHeartbeat(sql,'Tester','tribe','next',t+82000);api.recordMapJoin(sql,'Tester','forest',t+83000,'forest');assert.equal(api.joinLogCommand(sql,'list',{token,name:'TESTER'},t+83000).total,3);
const preGap=api.joinLogCommand(sql,'stats',{token,name:'Tester'},t+83000).milliseconds;api.recordPlayHeartbeat(sql,'Tester','forest','forest',t+360000);assert.equal(api.joinLogCommand(sql,'stats',{token,name:'Tester'},t+360000).milliseconds,preGap,'Unobserved five-minute gap is excluded');
api.endPlaySession(sql,'Tester','forest',false,t+360000);api.recordMapJoin(sql,'Tester','forest',t+500000,'long');assert.equal(api.joinLogCommand(sql,'list',{token},t+500000).total,4,'Long disconnect creates a new visit');
api.initJoinLog(sql);assert.equal(api.joinLogCommand(sql,'list',{token},t+500000).total,4,'Restart cannot clear history or admin sessions');
// Irvine midnight, including DST transition days (23h and 25h).
for(const [name,midnight]of [['Summer','2026-07-02T07:00:00Z'],['Winter','2026-12-02T08:00:00Z'],['Spring','2026-03-09T07:00:00Z'],['Fall','2026-11-02T08:00:00Z']]){
 const m=Date.parse(midnight);api.recordMapJoin(sql,name,'forest',m-5000,name);api.recordPlayHeartbeat(sql,name,'forest',name,m+5000);
 const rows=sql.exec('SELECT * FROM ancient_play_daily WHERE name=? ORDER BY day',name).toArray();assert.equal(rows.length,2);assert.deepEqual(rows.map(r=>r.milliseconds),[5000,5000]);assert.notEqual(rows[0].day,rows[1].day);
}
// DST fallback repeats local 1 AM but must not double or lose the real hour.
const fall=Date.parse('2026-11-01T08:59:55Z');api.recordMapJoin(sql,'DST','tribe',fall,'dst');for(let i=1;i<=722;i++)api.recordPlayHeartbeat(sql,'DST','tribe','dst',fall+i*5000);assert.equal(sql.exec("SELECT milliseconds FROM ancient_play_daily WHERE name='DST'").one().milliseconds,3610000);
assert.equal(api.joinLogCommand(sql,'stats',{token,name:"' OR 1=1 --"},t).milliseconds,0);assert.equal(api.joinLogCommand(sql,'stats',{token,name:'missing'},t).rows.length,0);
assert.equal(api.joinLogCommand(sql,'stats',{token,name:'Tester'},t+1800001).ok,false);
assert.equal(sql.exec('SELECT COUNT(*) n FROM ancient_play_sessions WHERE name=?','Tester').one().n,4);db.close();console.log('PASS joinlog v2: one-time old-log reset, repeated reconnect dedup, stale socket exclusion, explicit exits/map changes, heartbeat-only timing, offline gaps excluded, persistent daily totals, Irvine midnight/summer/winter/DST, authentication and SQL-safe exact search.');
// Exercise the real ticket -> WebSocket -> heartbeat -> leave hooks too.
const liveDB=new DatabaseSync(':memory:'),liveSQL={exec(q,...a){const rows=liveDB.prepare(q).all(...a);return {toArray:()=>rows,one:()=>rows[0]}}},sockets=[],ctx={storage:{sql:liveSQL,setAlarm:async()=>{}},getWebSockets:()=>sockets,acceptWebSocket:ws=>sockets.push(ws)};let clock=t;
class TestSocket{readyState=1;data=null;serializeAttachment(a){this.data=structuredClone(a)}deserializeAttachment(){return structuredClone(this.data)}send(){}close(){this.readyState=3}}
class Pair{constructor(){this[0]=new TestSocket();this[1]=new TestSocket()}}
class TestResponse{constructor(body,init){this.status=init.status}static json(body,init){return {body,...init}}}
const compiled=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']}),module={exports:{}};
vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,Date:class extends Date{static now(){return clock}},Math,crypto,structuredClone,URL,AbortController,WebSocketPair:Pair,Response:TestResponse,require:()=>({DurableObject:class{constructor(ctx,env){this.ctx=ctx;this.env=env}}})});
const world=new module.exports.AncientWorld(ctx,{ACCOUNT_SESSIONS:{getByName:()=>({banState:async()=>null})}}),connect=async()=>{const ticket=await world.command('Live','ticket',{map:'tribe'});assert(ticket.ok);assert.equal((await world.fetch(new Request('https://test/connect?map=tribe&ticket='+ticket.ticket,{headers:{Upgrade:'websocket'}}))).status,101);return sockets.at(-1);};
let ws=await connect();for(let i=0;i<6;i++){clock+=5000;await world.webSocketMessage(ws,JSON.stringify({type:'heartbeat'}));}let admin=await world.joinLog('login',{}),sessionData={token:admin.token,name:'Live'};assert.equal((await world.joinLog('stats',sessionData)).milliseconds,30000);
for(let i=0;i<10;i++){clock+=200;ws=await connect();}assert.equal((await world.joinLog('list',sessionData)).total,1,'Actual reconnect hook is deduplicated');clock+=5000;await world.webSocketMessage(ws,JSON.stringify({type:'heartbeat'}));await world.webSocketMessage(ws,JSON.stringify({type:'leave'}));clock+=100;ws=await connect();assert.equal((await world.joinLog('list',sessionData)).total,2,'Actual explicit leave hook ends visit');clock+=5000;await world.webSocketMessage(ws,JSON.stringify({type:'heartbeat'}));world.webSocketClose(ws);assert.equal((await world.joinLog('stats',sessionData)).milliseconds,40000);liveDB.close();console.log('PASS real AncientWorld ticket/connect/reconnect/heartbeat/leave/close hooks; correct time and visit counts without live player accounts.');
