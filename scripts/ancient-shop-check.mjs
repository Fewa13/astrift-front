// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {skills,combat,quests} from './ancient-test-modules.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {transform} from 'esbuild';
import * as rules from '../public/ancient-rules.js';
assert.deepEqual(Object.values(rules.ANCIENT_POTIONS).map(p=>[p.price,p.heal]),[[50,1000],[500,10000],[5000,100000],[50000,1000000],[500000,10000000]]);
assert.deepEqual(rules.ancientStacks(2000),[999,999,2]);assert.equal(rules.ancientCoinReward(10),.2);
let balance=0;for(let i=0;i<1000;i++)balance=rules.ancientAddCoins(balance,10);assert.equal(balance,200);
let now=10000,saved={...rules.newAncientProfile(),level:20,coins:1000000},attachment={name:'Alice',x:0,z:10,y:1.7,hp:10,maxHp:40000,weapon:saved.weapons[0],ammo:10,lastShot:0,reloadAt:0,seen:now,deadAt:0},connected=true,messages=[];
const socket={deserializeAttachment:()=>structuredClone(attachment),serializeAttachment:p=>attachment=structuredClone(p),send:s=>messages.push(JSON.parse(s)),close:()=>{}};
const ctx={getWebSockets:()=>connected?[socket]:[],storage:{sql:{exec:()=>({toArray:()=>[]})},setAlarm:async()=>{}}};
const compiled=await transform(fs.readFileSync(new URL('../src/ancient-world.ts',import.meta.url),'utf8'),{loader:'ts',format:'cjs'}),module={exports:{}};
vm.runInNewContext(compiled.code,{module,exports:module.exports,require:name=>name==='cloudflare:workers'?{DurableObject:class{constructor(ctx,env){this.ctx=ctx;this.env=env}}}:name.includes('ancient-quests')?quests:name.includes('ancient-skill-combat')?combat:name.includes('ancient-skills')?skills:rules,Date:{now:()=>now},crypto,WebSocketPair:class{}});
const server=new module.exports.AncientWorld(ctx,{});server.read=()=>structuredClone(saved);server.save=(_name,p)=>saved=structuredClone(p);server.persist=()=>{};server.world=()=>({monsters:[],tick:now-200});
for(const id of Object.keys(rules.ANCIENT_POTIONS)){assert((await server.command('Alice','buyPotion',{id})).ok);assert.equal(saved.potions[id],1)}assert.equal(saved.coins,444450);
for(const quantity of [0,-1,1.5,1000,NaN,Infinity])assert.equal((await server.command('Alice','buyPotion',{id:'minor',quantity})).ok,false);
assert.equal((await server.command('Alice','buyPotion',{id:'__proto__'})).ok,false);assert.equal(saved.coins,444450);
await server.alarm();assert.equal(attachment.hp,10,'Camp no longer heals');
attachment.hp=39950;assert((await server.command('Alice','usePotion',{id:'minor'})).ok);assert.equal(attachment.hp,40000);assert.equal(saved.potions.minor,0);assert.equal(messages.find(m=>m.type==='healed').amount,50);
assert.equal((await server.command('Alice','usePotion',{id:'medium'})).ok,false);assert.equal(saved.potions.medium,1,'Full health cannot waste potion');
attachment.hp=0;assert.equal((await server.command('Alice','usePotion',{id:'medium'})).ok,false);connected=false;attachment.hp=10;assert.equal((await server.command('Alice','usePotion',{id:'medium'})).ok,false);connected=true;
saved.coins=50;const results=await Promise.all([server.command('Alice','buyPotion',{id:'minor'}),server.command('Alice','buyPotion',{id:'minor'})]);assert.equal(results.filter(r=>r.ok).length,1);assert.equal(saved.coins,0);
let expectedCoins=0,expectedCore=0;
for(const [kind,level]of [['grox',1],['hunter',6],['chief',20],['lord',30]]){const monster={id:kind,kind,level,hp:1,maxHp:1,x:0,z:50,homeX:0,homeZ:50,region:0,action:'idle',actionAt:0,attackAt:0,respawnAt:0,target:''};server.world=()=>({monsters:[monster],tick:now});attachment.x=0;attachment.z=49;attachment.hp=100;attachment.ammo=10;now+=1000;const height=kind==='grox'?1.65:kind==='hunter'?2.1:(kind==='chief'?2.7:3.4)*1.65,dy=height*.5-1.7,length=Math.hypot(dy,1);await server.webSocketMessage(socket,JSON.stringify({type:'shot',direction:[0,dy/length,1/length]}));const kill=messages.filter(m=>m.type==='kill').at(-1);assert.equal(kill.id,kind);expectedCoins=rules.ancientAddCoins(expectedCoins,kill.xp);expectedCore+=kind==='chief'?30:kind==='lord'?120:0;assert.equal(saved.coins,expectedCoins);assert.equal(saved.materials.core,expectedCore)}
// Exercise the actual input listeners: a deliberate unlock must not overwrite TAB's bag.
const client=fs.readFileSync(new URL('../public/ancient-client.js',import.meta.url),'utf8'),listeners={};
const input={questUI:{isOpen:()=>false},active:true,mobile:false,paused:false,view:'pause',me:{hp:100},keys:new Set(),vy:0,camera:{position:{y:1.7}},aim:false,canvas:{addEventListener(){},requestPointerLock(){}},document:{pointerLockElement:null,hidden:false,addEventListener:(name,fn)=>listeners[name]=fn},window:{addEventListener(){}},renderPanel(){},unlock(){},lock(){},send(){},shoot(){},localStorage:{getItem:()=>null}};
vm.runInNewContext(client.split('\n').filter(l=>l.startsWith("document.addEventListener('keydown'")||l.startsWith("canvas.addEventListener('click'")).join('\n'),input);
listeners.keydown({code:'Tab',preventDefault(){}});assert.equal(input.view,'bag');listeners.pointerlockchange();assert.equal(input.view,'bag');assert(input.paused);listeners.keydown({code:'Tab',preventDefault(){}});assert.equal(input.paused,false);
console.log('PASS: five exact potion prices/heals; decimal 2% coins without drift; 999 stacks; purchases/overspend/concurrent requests; prototype rejection; capped healing; no consumption when full/dead/offline; no camp regen; every monster reward; boss-only cores; TAB survives pointer unlock');
