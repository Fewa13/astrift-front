// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {emailHarness} from './account-email-check.mjs';
const h=await emailHarness(),db=new DatabaseSync(':memory:');
const sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows,one:()=>rows[0]}}};
let actor={name:'healthqa',map:'city',seen:Date.now(),hp:100,maxHp:100,moveSeq:42},alarm=null,writes=0;
const messages=[],ws={readyState:1,deserializeAttachment:()=>structuredClone(actor),serializeAttachment:p=>actor=structuredClone(p),send:s=>messages.push(JSON.parse(s)),close(){}};
const ctx={storage:{sql,getAlarm:async()=>alarm,setAlarm:async n=>{alarm=n;writes++},transactionSync:fn=>fn()},getWebSockets:()=>[ws]};
const world=new h.classes.AncientWorld(ctx,h.env);
await world.webSocketMessage(ws,JSON.stringify({type:'heartbeat'}));assert(alarm>Date.now());assert(messages.some(m=>m.type==='heartbeatAck'&&m.moveSeq===42));
const before=writes;await world.webSocketMessage(ws,JSON.stringify({type:'heartbeat'}));assert.equal(writes,before,'healthy timer is not reset by heartbeat');
alarm=Date.now()-5000;await world.webSocketMessage(ws,JSON.stringify({type:'heartbeat'}));assert.equal(writes,before+1,'overdue world timer is restarted');
let ticks=0;world.community=()=>({settle(){throw Error('injected settlement failure')}});world.tickMap=async()=>{ticks++};await world.alarm();assert.equal(ticks,1,'settlement failures cannot stop world updates');assert(alarm>Date.now());
world.tickMap=async()=>{throw Error('injected tick failure')};const saved=writes;await world.alarm();assert.equal(writes,saved+1,'failed tick still schedules recovery');
console.log('PASS real AncientWorld watchdog: missing/overdue timer recovery, healthy timer preservation, heartbeat acknowledgment, settlement isolation and rescheduling after failures.');
