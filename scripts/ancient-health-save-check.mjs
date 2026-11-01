// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {skills,combat,quests} from './ancient-test-modules.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {transform} from 'esbuild';
import * as rules from '../public/ancient-rules.js';
const compiled=await transform(fs.readFileSync(new URL('../src/ancient-world.ts',import.meta.url),'utf8'),{loader:'ts',format:'cjs'});
let now=10000,profile={...rules.newAncientProfile(),level:2,potions:{minor:2}},sockets=[],rows=new Map(),writes=0;
const ctx={getWebSockets:()=>sockets.filter(s=>!s.closed),acceptWebSocket:s=>sockets.push(s),storage:{sql:{exec(query,...args){if(query.startsWith('SELECT name,expires'))return {toArray:()=>[{name:'Alice',expires:now+30000}]};if(query.startsWith('SELECT hp,maxHp'))return {toArray:()=>rows.has(args[0])?[structuredClone(rows.get(args[0]))]:[]};if(query.startsWith('INSERT INTO ancient_health')){rows.set(args[0],{hp:args[1],maxHp:args[2],deadAt:args[3]});writes++}return {toArray:()=>[]}}},setAlarm:async()=>{}}};
const module={exports:{}};
class Pair{constructor(){this[0]={};this[1]={closed:false,attachment:null,deserializeAttachment(){return structuredClone(this.attachment)},serializeAttachment(p){this.attachment=structuredClone(p)},send(){},close(){this.closed=true}}}}
vm.runInNewContext(compiled.code,{module,exports:module.exports,require:name=>name==='cloudflare:workers'?{DurableObject:class{constructor(ctx,env){this.ctx=ctx;this.env=env}}}:name.includes('ancient-quests')?quests:name.includes('ancient-skill-combat')?combat:name.includes('ancient-skills')?skills:rules,Date:{now:()=>now},crypto,WebSocketPair:Pair,URL,Response:class{constructor(body,options){this.status=options.status}static json(){throw Error('Unexpected invalid auth')}}});
const create=()=>{const server=new module.exports.AncientWorld(ctx,{});server.read=()=>structuredClone(profile);server.save=(_name,p)=>profile=structuredClone(p);server.world=()=>({monsters:[],tick:now-200});server.persist=()=>{};return server};
const request={url:'https://example.test/api/ancient/connect?ticket=test',headers:{get:()=> 'websocket'}};
let server=create();assert.equal((await server.fetch(request)).status,101);let socket=sockets.at(-1);assert.equal(socket.attachment.hp,400);
socket.attachment.hp=237;await server.alarm();assert.equal(rows.get('Alice').hp,237);const savedWrites=writes;await server.alarm();assert.equal(writes,savedWrites,'Unchanged HP does not trigger repeated database writes');
socket.close();server=create();await server.fetch(request);socket=sockets.at(-1);assert.equal(socket.attachment.hp,237,'Fresh DO instance and rejoin preserve injury');
assert((await server.command('Alice','usePotion',{id:'minor'})).ok);assert.equal(rows.get('Alice').hp,400);socket.close();server=create();await server.fetch(request);socket=sockets.at(-1);assert.equal(socket.attachment.hp,400,'Potion healing persisted');
socket.attachment.hp=0;await server.alarm();const deathTime=rows.get('Alice').deadAt;socket.close();now+=1000;server=create();await server.fetch(request);socket=sockets.at(-1);assert.equal(socket.attachment.hp,0);assert.equal(socket.attachment.deadAt,deathTime,'Rejoin must not revive or restart the death cooldown');
await server.webSocketMessage(socket,JSON.stringify({type:'respawn'}));assert.equal(socket.attachment.hp,0);now+=2000;await server.webSocketMessage(socket,JSON.stringify({type:'respawn'}));assert.equal(socket.attachment.hp,400);assert.equal(rows.get('Alice').hp,400);assert.equal(rows.get('Alice').deadAt,0);
socket.attachment.hp=301;await server.alarm();await server.fetch(request);socket=sockets.at(-1);assert.equal(socket.attachment.hp,301,'Replacing a still-connected socket also preserves HP');
rows.set('Bob',{hp:300,maxHp:400,deadAt:0});const grown=server.restoreHealth('Bob',3);assert.equal(grown.hp,800);assert.equal(grown.maxHp,900);assert.equal(server.restoreHealth('NewPlayer',1).hp,100);
console.log('PASS: persistent injured HP; fresh server instance; potion health; dead rejoin; original respawn cooldown; explicit respawn; replacing connection; new accounts; max-health progression; no redundant unchanged-health writes');
