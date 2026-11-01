// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {skills,combat,quests} from './ancient-test-modules.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {transform} from 'esbuild';
import * as rules from '../public/ancient-rules.js';
import {ancientAttackReady,ancientAttackCooldown,ancientSpread,ancientSpreadOffset} from '../public/ancient-rules.js';
assert(ancientAttackReady(0,100),'First attack has no waiting period');
for(const kind of ['grox','hunter','chief','lord']){const next=100+ancientAttackCooldown(kind);assert(!ancientAttackReady(next,next-1));assert(ancientAttackReady(next,next))}
assert.equal(ancientAttackCooldown('grox'),1000);
for(const gun of ['R6','V6','MP9','H8','A8','KX','M9']){const hip=ancientSpread(gun,false),ads=ancientSpread(gun,true);assert(hip>ads*30);assert(ancientSpread(gun,false,true)>hip);assert(ancientSpread(gun,false,false,true)>hip);let square=0,meanX=0,meanY=0;for(let i=0;i<4096;i++){const o=ancientSpreadOffset(hip,(i+.5)/4096,((i*0.61803398875)%1));assert(Math.hypot(o.x,o.y)<=hip+1e-10);square+=o.x**2+o.y**2;meanX+=o.x;meanY+=o.y}assert(Math.abs(square/4096-hip**2/2)<1e-9);assert(Math.abs(meanX/4096)<hip*.002);assert(Math.abs(meanY/4096)<hip*.002)}
const client=fs.readFileSync(new URL('../public/ancient-client.js',import.meta.url),'utf8'),html=fs.readFileSync(new URL('../public/ancient.html',import.meta.url),'utf8');assert(!html.includes('ancientRegion'));assert(!client.includes("$('ancientRegion')"));assert(client.includes('ancientSpreadOffset(currentSpread())'));assert(client.includes('addScaledVector(shotRight,offset.x)'));assert(client.includes('updateSpreadCrosshair();'));
console.log('PASS: immediate first attack; post-hit cooldowns; uniform circular hip dispersion; ADS distinction; movement/air penalties; matching reticle; removed region/count HUD');
// Exercise the actual alarm handler: damage first, then exactly one cooldown.
const compiled=await transform(fs.readFileSync(new URL('../src/ancient-world.ts',import.meta.url),'utf8'),{loader:'ts',format:'cjs'});
let now=10000,attachment={name:'Alice',x:0,z:61,y:1.7,hp:100,seen:now,reloadAt:0,deadAt:0};
const socket={deserializeAttachment:()=>structuredClone(attachment),serializeAttachment:p=>attachment=structuredClone(p),send:()=>{},close:()=>{}};
const ctx={getWebSockets:()=>[socket],storage:{sql:{exec:()=>({toArray:()=>[]})},setAlarm:async()=>{}}};
const module={exports:{}};vm.runInNewContext(compiled.code,{module,exports:module.exports,require:name=>name==='cloudflare:workers'?{DurableObject:class{constructor(ctx,env){this.ctx=ctx;this.env=env}}}:name.includes('ancient-quests')?quests:name.includes('ancient-skill-combat')?combat:name.includes('ancient-skills')?skills:rules,Date:{now:()=>now},crypto,WebSocketPair:class{}});
const server=new module.exports.AncientWorld(ctx,{}),monster={id:'test',kind:'grox',level:1,hp:100,maxHp:100,x:0,z:60,homeX:0,homeZ:60,region:0,action:'walk',actionAt:0,attackAt:0,respawnAt:0,target:'Alice'};
server.world=()=>({monsters:[monster],tick:now-200});server.persist=()=>{};
await server.alarm();assert.equal(attachment.hp,80,'First in-range tick deals damage immediately');assert.equal(monster.attackAt,now+1000);
now+=999;attachment.seen=now;await server.alarm();assert.equal(attachment.hp,80,'No second hit during cooldown');
now++;attachment.seen=now;await server.alarm();assert.equal(attachment.hp,60,'Next hit at cooldown expiry');
console.log('PASS: real server alarm immediately attacks, respects cooldown and attacks again on expiry');
