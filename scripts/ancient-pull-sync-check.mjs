// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import {emailHarness} from './account-email-check.mjs';
import {beginForcedMotion,tickForcedMotion} from '../public/ancient-forced-motion.js';
const source=await fs.readFile('public/ancient-client.js','utf8');
const reset=source.slice(source.indexOf('function resetMoves('),source.indexOf('// Pending positions'));
const client={moveSeq:12000,lastAck:11998,pendingMoves:new Map([[12000,{}]]),moveCorrection:{set(){}},meleeBuffer:{clear(){}}};
vm.createContext(client);vm.runInContext(reset,client);
client.resetMoves();assert.equal(client.moveSeq,12000);assert.equal(client.pendingMoves.size,0);
client.moveSeq+=4;client.resetMoves();assert.equal(client.moveSeq,12004,'pull end cannot rewind sequence');
client.resetMoves(13000);assert.equal(client.moveSeq,13000,'welcome adopts a newer server sequence');
client.resetMoves(0);assert.equal(client.moveSeq,13000,'reconnection cannot rewind an existing client');
assert(source.includes('resetMoves(d.you.moveSeq);me=d.you;'));
const h=await emailHarness(),db=new DatabaseSync(':memory:');
const sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows,one:()=>rows[0]}}};
let actor={name:'pullsync',map:'city',x:0,y:1.7,z:10,yaw:0,hp:100,maxHp:100,moveSeq:13000,moveCredit:2,lastMove:Date.now(),seen:Date.now(),weapon:{gun:'R6'},ammo:30,lastShot:0,reloadAt:0,deadAt:0};
const peerMessages=[];
const socket={readyState:1,deserializeAttachment:()=>structuredClone(actor),serializeAttachment:p=>actor=structuredClone(p),send(){},close(){}};
const observer={readyState:1,deserializeAttachment:()=>({...actor,name:'observer'}),send:data=>peerMessages.push(JSON.parse(data))};
const ctx={storage:{sql,setAlarm:async()=>{},transactionSync:fn=>fn()},getWebSockets:()=>[socket,observer]};
const world=new h.classes.AncientWorld(ctx,h.env);world.world=()=>({map:'city',monsters:[],tick:Date.now()});
// A real pull advances the authoritative position while client movement is ignored.
const motion=beginForcedMotion(actor,{x:0,y:1.7,z:12},Date.now());
await world.webSocketMessage(socket,JSON.stringify({type:'move',seq:13001,x:0,y:1.7,z:30,yaw:0}));assert.equal(actor.z,10);
tickForcedMotion(actor,motion.started+motion.duration,()=>false);assert.equal(actor.z,12);assert(!actor.forcedMotion);
// Demonstrate why the old reset was broken: the server correctly rejects seq=1.
await world.webSocketMessage(socket,JSON.stringify({type:'move',seq:1,x:0,y:1.7,z:12.5,yaw:0}));assert.equal(actor.z,12);
client.resetMoves();
await world.webSocketMessage(socket,JSON.stringify({type:'move',seq:++client.moveSeq,x:0,y:1.7,z:12.5,yaw:0}));
assert.equal(actor.z,12.5,'the very first packet after the pull must move the server player');
assert.equal(actor.moveSeq,13001);assert(peerMessages.some(m=>m.type==='playerMove'&&m.z===12.5),'other players receive the same accepted position');
for(let i=0;i<3;i++){client.resetMoves();client.resetMoves();await world.webSocketMessage(socket,JSON.stringify({type:'move',seq:++client.moveSeq,x:0,y:1.7,z:actor.z+.1,yaw:0}));assert.equal(actor.moveSeq,client.moveSeq)}
console.log('PASS real AncientWorld movement: pull completion, immediate movement acceptance, repeated resets, reconnect sequence floor and remote position broadcast; old seq reset reproduces the stuck server position.');
