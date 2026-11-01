// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {build} from 'esbuild';
import {newAncientProfile} from '../public/ancient-rules.js';
const compiled=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']});
let now=10000;const sockets=[],messages=[[],[]],ctx={getWebSockets:()=>sockets,storage:{sql:{exec:()=>({toArray:()=>[]})}}},module={exports:{}};
vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,crypto,Date:{now:()=>now},Math,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
const server=new module.exports.AncientWorld(ctx,{}),profile=newAncientProfile();profile.level=50;
for(let i=0;i<2;i++){let player={name:'p'+i,map:'tribe',x:i?100:0,z:55,y:1.7,yaw:0,hp:100000,maxHp:250000,seen:now,weapon:profile.weapons[0],ammo:10,reloadAt:0};sockets.push({deserializeAttachment:()=>player,serializeAttachment:p=>player=p,send:s=>messages[i].push(JSON.parse(s)),close(){}})}
const monster={id:'boss',kind:'lord',level:1,x:0,z:50,homeX:0,homeZ:50,hp:100,maxHp:100,attackAt:0,action:'idle',actionAt:0,target:'p0',region:2},world={map:'tribe',monsters:[monster],tick:now};let saved;
server.world=()=>world;server.read=()=>profile;server.persist=w=>saved=JSON.parse(JSON.stringify(w));server.persistHealth=()=>{};server.persistAbilities=()=>{};server.syncQuestHealth=()=>{};
await server.tickMap('tribe');assert(monster.bossCast);assert(saved.monsters[0].bossCast);assert.equal(sockets[0].deserializeAttachment().hp,100000);
assert.equal(messages[0].filter(m=>m.type==='bossFx'&&m.stage==='warning').length,1);assert.equal(messages[1].filter(m=>m.type==='bossFx'&&m.stage==='warning').length,1);
now=monster.bossCast.hitAt;await server.tickMap('tribe');assert(sockets[0].deserializeAttachment().hp<100000);assert.equal(sockets[1].deserializeAttachment().hp,100000);const hp=sockets[0].deserializeAttachment().hp;
now+=100;await server.tickMap('tribe');assert.equal(sockets[0].deserializeAttachment().hp,hp);
now=monster.attackAt;await server.tickMap('tribe');assert(monster.bossCast);monster.hp=0;monster.respawnAt=now+120000;now+=2000;await server.tickMap('tribe');assert(!monster.bossCast);assert.equal(sockets[0].deserializeAttachment().hp,hp);
monster.hp=100;monster.x=-17;monster.z=45;monster.target='p0';monster.attackAt=now;monster.bossStep=1;sockets[0].deserializeAttachment().x=-37;sockets[0].deserializeAttachment().z=45;
await server.tickMap('tribe');assert(monster.bossCast);now=monster.bossCast.hitAt;await server.tickMap('tribe');assert.equal(sockets[0].deserializeAttachment().hp,hp,'Hut blocks a boss lane even when player lies inside the warning');
console.log('PASS: server warning before damage; identical same-map broadcasts; persistent cast; range dodge; once-only damage; death cancellation; wall blocks warned lane.');
