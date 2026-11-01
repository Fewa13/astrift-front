// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import {emailHarness} from './account-email-check.mjs';
const h=await emailHarness(),db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows,one:()=>rows[0]}}},sockets=[],ctx={waitUntil(){},getWebSockets:()=>sockets,storage:{sql,transactionSync:fn=>fn(),setAlarm:async()=>{},getAlarm:async()=>null}},w=new h.classes.AncientWorld(ctx,h.env),store=w.community();store.saveWallet('owner',{blank:1,blank2:0,blank3:0,medium:1,advanced:0,redraw:0,wins:0});let map=store.create('owner',2);map={...map,objects:[{id:'door',model:'box',x:20,y:0,z:20,w:3,h:3,d:1,color:'#777777',rotation:0,solid:true}],code:`when join
 addshared visits 1
 task hello "访客 {shared.visits}" "Visitors {shared.visits}"
end
when kill grox
 open door
end
when kill hunter
 heal (1 / 0)
end`};map=store.save('owner',map.id,map,map.revision,()=>true);store.submit('owner',map.id,map.revision);store.review(map.id,map.revision,true,'');
function peer(name){const a={name,map:'community:'+map.id,x:0,y:1.7,z:0,hp:100,maxHp:100,connectionId:name,seen:Date.now()},events=[],ws={deserializeAttachment:()=>a,serializeAttachment:v=>Object.assign(a,v),send:s=>events.push(JSON.parse(s))};sockets.push(ws);return {a,ws,events}}
const alice=peer('alice'),bob=peer('bob');w.scriptEvent(alice.ws,alice.a);w.scriptEvent(bob.ws,bob.a);w.scriptEvent(alice.ws,alice.a,'kill','grox');assert(alice.events.some(e=>e.type==='communityObjects'&&e.objects[0].scriptOpen));assert(bob.events.some(e=>e.type==='communityObjects'&&e.objects[0].scriptOpen),'all players receive changed objects');assert.equal(store.load(map.id).objects[0].scriptOpen,true);assert(alice.events.some(e=>e.type==='communityTasks'&&e.tasks[0].title[1]==='Visitors 2'));
w.scriptEvent(alice.ws,alice.a,'kill','hunter');assert(alice.events.some(e=>e.type==='communityMessages'&&e.messages[0][1].includes('Division by zero')));assert(!(await w.command('alice','communityCodeLogs',{id:map.id})).ok);let result=await w.command('owner','communityCodeLogs',{id:map.id});assert(result.ok);assert(result.logs[0].message.includes('line 9'));store.share('owner',map.id,'viewer','view');assert((await w.command('viewer','communityCodeLogs',{id:map.id})).ok);assert(!(await w.command('viewer','communityCodeLogs',{id:map.id,clear:true})).ok);assert((await w.command('owner','communityCodeLogs',{id:map.id,clear:true})).ok);
console.log('PASS real World multiplayer object broadcast, persistent door collision state, live shared task values, line errors and role-protected runtime logs.');
