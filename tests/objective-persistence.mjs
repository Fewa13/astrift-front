import assert from 'node:assert/strict';
import {build} from 'esbuild';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
const bundle=await build({entryPoints:['src/objective-room.ts'],bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'workers-context',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'workers',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export class DurableObject {constructor(ctx,env){this.ctx=ctx;this.env=env}}',loader:'js'}));}}]});
let now=100000,alarmAt=0;const sockets=[],db=new DatabaseSync(':memory:');
const ctx={storage:{sql:{exec(q,...args){const st=db.prepare(q),rows=st.columns().length?st.all(...args):(st.run(...args),[]);return {one(){assert.equal(rows.length,1);return rows[0]},toArray(){return rows}};}},setAlarm:async t=>{alarmAt=t},deleteAlarm:async()=>{alarmAt=0}},getWebSockets:()=>sockets,waitUntil(p){p.catch(e=>{throw e})}};
const sandbox={module:{exports:{}},crypto,Date:class extends Date{static now(){return now}},console};vm.runInNewContext(bundle.outputFiles[0].text,sandbox);const Room=sandbox.module.exports.ObjectiveRoom;
// Seed a waiting match through the public shared rules; fetch itself is covered by the network test.
const {createMatch}=await import('../public/objective-rules.js');let engine=new Room(ctx,{});ctx.storage.sql.exec('INSERT INTO objective_match VALUES(1,?)',JSON.stringify(createMatch('ctf',now,0,true)));engine=new Room(ctx,{});
function send(s,d){engine.webSocketMessage(s,JSON.stringify({round:board(s)?.round??0,...d}));}
function join(id){const s={a:null,messages:[],deserializeAttachment(){return this.a},serializeAttachment(a){this.a=structuredClone(a)},send(m){this.messages.push(JSON.parse(m))},close(){this.closed=true}};sockets.push(s);send(s,{type:'join',id,name:id});return s;}
const board=s=>s.messages.filter(m=>m.type==='objective').at(-1);
const a=join('a'),b=join('b');for(let i=2;i<12;i++)join('seat-'+i);
assert.equal(board(a).players.filter(p=>p.team===0).length,6);assert.equal(board(a).players.filter(p=>p.team===1).length,6);const extra=join('extra');assert.ok(extra.messages.some(m=>m.type==='full'));
function state(s,pos,hold=false){send(s,{type:'state',position:pos,hp:100,interacting:hold});}
state(a,[0,1.7,-43],true);now+=300;state(a,[0,1.7,-43],true);now+=650;state(a,[0,1.7,-43],true);assert.equal(board(a).flags[1].carrier,'a');
engine=new Room(ctx,{});send(b,{type:'ping'});assert.equal(board(b).flags[1].carrier,'a','carrier survives reconstruction');
state(a,[0,1.7,43]);now+=300;state(a,[0,1.7,43]);assert.equal(board(a).scores[0],1);
const deadline=board(a).endsAt,round=board(a).round;engine=new Room(ctx,{});send(b,{type:'ping'});assert.equal(board(b).scores[0],1);assert.equal(board(b).endsAt,deadline);
engine.webSocketClose(a);engine=new Room(ctx,{});const again=join('a');assert.equal(board(again).players.find(p=>p.id==='a').team,0);assert.equal(board(again).scores[0],1);
// Timer/continuation across reconstruction; keep live connections fresh at the deadline.
now=deadline;for(const s of sockets)if(s.a)send(s,{type:'ping'});engine.alarm();assert.equal(board(again).phase,'finished');assert.equal(board(again).scores[0],1);
engine=new Room(ctx,{});now+=5000;engine.alarm();assert.equal(board(again).round,round+1);assert.equal(board(again).phase,'running');assert.deepEqual(board(again).scores,[0,0]);assert.equal(board(again).players.length,12);assert.ok(alarmAt>now);
console.log('PASS objective persistence: 12 players / 6 per team, full rejection, flag/score/deadline restore, reconnect, timed finish and same-roster auto continuation across reconstruction.');
