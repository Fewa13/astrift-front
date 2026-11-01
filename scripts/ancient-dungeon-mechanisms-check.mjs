// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
import {build} from 'esbuild';
import {mirrorYaw,reflectMirror} from '../public/ancient-optics.js';
import {DUNGEON_CONTROLS,DUNGEON_MIRRORS,newDungeonMechanisms,dungeonLight,useDungeonMechanism,weightPosition,dungeonPuzzleGate} from '../public/ancient-dungeon-mechanisms.js';
import {dungeonBlocked,dungeonLineClear,dungeonControlClear,setDungeonGeometry} from '../public/ancient-dungeon.js';
for(let angle=0;angle<4;angle++)for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const yaw=mirrorYaw(angle),nx=-Math.sin(yaw),nz=-Math.cos(yaw),dot=dx*nx+dz*nz,r=reflectMirror(dx,dz,angle);if(dot<0){assert(r);assert(Math.abs(r.dx-(dx-2*dot*nx))<1e-9);assert(Math.abs(r.dz-(dz-2*dot*nz))<1e-9)}else assert.equal(r,undefined)}
for(let seed=0;seed<512;seed++){
 const s=newDungeonMechanisms(seed);assert(!dungeonLight(s).solved);let now=1000;
 for(const [i,m]of DUNGEON_MIRRORS.entries()){const want=[1,3,1][i];while(s.angles[m.id]!==want){assert(useDungeonMechanism(s,0,m.id,{x:m.x+2.8,y:1.7,z:m.z},now+=400))}}
 assert(s.solved[0]);assert.equal(dungeonLight(s).segments.length,4);
 for(const index of s.order){const c=DUNGEON_CONTROLS.find(c=>c.id==='rune-'+index);assert(useDungeonMechanism(s,1,c.id,{x:c.x+2.8,y:1.7,z:c.z},now+=400))}assert(s.solved[1]);
 for(let i=0;i<2;i++){const c=DUNGEON_CONTROLS.find(c=>c.id==='weight-'+i);while(s.weights[i]!==s.targets[i])assert(useDungeonMechanism(s,2,c.id,{x:c.x+2.8,y:1.7,z:c.z},now+=400))}assert(s.solved[2]);
}
const s=newDungeonMechanisms(0);assert(!useDungeonMechanism(s,0,'lens-a',{x:20,y:1.7,z:10},1000));assert(!useDungeonMechanism(s,1,'lens-a',{x:-4,y:1.7,z:25},1000));assert(!useDungeonMechanism(s,2,'weight-0',{x:-17,y:1.7,z:135},1000,()=>true));
setDungeonGeometry('dungeon:998',[],62,s);assert(dungeonControlClear(-1.2,1.7,25,-4,2.7,25,'dungeon:998'),'mirror collision must not block its own F interaction');assert(!dungeonControlClear(0,1.7,60,0,2.7,96,'dungeon:998'),'closed gate still blocks interacting through it');
setDungeonGeometry('dungeon:999',[],162,s);assert(dungeonBlocked(0,164,.6,'dungeon:999'));assert(!dungeonLineClear(0,1.7,150,0,1.7,174,'dungeon:999'));for(const i of [0,1]){const p=weightPosition(i,s.weights[i]);assert(dungeonBlocked(p.x,p.z,.6,'dungeon:999'))}
const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows,one:()=>rows[0]}}};let now=Date.now();class Clock extends Date{static now(){return now}}
const compiled=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']}),module={exports:{}},sockets=[];
const ctx={storage:{sql,setAlarm:async()=>{},transactionSync:f=>f()},getWebSockets:()=>sockets};vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,Date:Clock,crypto,Math,structuredClone,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});const server=new module.exports.AncientWorld(ctx,{});
const p=server.read('tester');p.level=80;server.save('tester',p);let actor={name:'tester',map:'tribe',tribeLayout:2,x:0,z:10,y:1.7,hp:1e8,maxHp:1e8,seen:now,weapon:p.weapons[0],lastShot:0,deadAt:0};const ws={deserializeAttachment:()=>structuredClone(actor),serializeAttachment:a=>actor=structuredClone(a),send(){},close(){}};sockets.push(ws);
await server.command('tester','dungeonCreate',{tier:'burrow'});await server.command('tester','dungeonReady',{});let run=server.dungeons().get('tester');assert(run.mechanisms);run.joined=['tester'];actor.map=run.map;server.dungeons().save(run);
async function press(id){const before=run.mechanisms.revision,c=DUNGEON_CONTROLS.find(c=>c.id===id);Object.assign(actor,{x:c.x+2.8,z:c.z,seen:now+=400});await server.webSocketMessage(ws,JSON.stringify({type:'dungeonMechanism',id}));run=server.dungeons().get('tester');assert(run.mechanisms.revision>before,'F interaction must succeed: '+id)}
for(const [i,m]of DUNGEON_MIRRORS.entries())while(run.mechanisms.angles[m.id]!==[1,3,1][i])await press(m.id);assert.equal(run.gateZ,62,'puzzle alone does not bypass living enemies');
let world=server.world(run.map);for(const m of world.monsters)m.hp=0;server.persist(world);actor.z=50;server.dungeonTick(run,world,[{ws,p:actor}],now);assert.equal(run.gateZ,189);actor.z=70;server.dungeonTick(run,world,[{ws,p:actor}],now);server.persist(world);assert.equal(run.stage,1);
const wrong=(run.mechanisms.order[0]+1)%3;await press('rune-'+wrong);assert.equal(run.mechanisms.runes,0);assert(run.mechanisms.wrongAt);
await press('trap-lever');assert(run.mechanisms.trapUntil>now);world=server.world(run.map);run.trapAt=0;server.dungeonTick(run,world,[{ws,p:actor}],now);assert.equal(run.traps.length,0);for(const i of [...run.mechanisms.order])await press('rune-'+i);assert(run.mechanisms.solved[1]);
world=server.world(run.map);for(const m of world.monsters)m.hp=0;actor.z=132;server.dungeonTick(run,world,[{ws,p:actor}],now);server.persist(world);assert.equal(run.stage,2);assert.equal(run.gateZ,162);assert(world.monsters.filter(m=>m.kind!=='lord').every(m=>m.z<162),'no regular monsters trapped behind sealed boss gate');
for(let i=0;i<2;i++)while(run.mechanisms.weights[i]!==run.mechanisms.targets[i])await press('weight-'+i);assert.equal(run.gateZ,189);assert(run.mechanisms.solved.every(Boolean));
const restored=new module.exports.AncientWorld(ctx,{}).dungeons().get('tester');assert.deepEqual(restored.mechanisms.solved,run.mechanisms.solved,'checkpoint survives reconstruction');
world=server.world(run.map);for(const m of world.monsters)m.hp=0;const xp=server.read('tester').xp;server.dungeonTick(run,world,[{ws,p:actor}],now);assert.equal(run.status,'complete');assert.equal(server.read('tester').xp,xp,'no completion XP added');
server.dungeons().createAscension('ascend','lightning');assert.equal(server.dungeons().get('ascend').mechanisms,undefined);assert.equal(dungeonPuzzleGate({stage:0,ascensionJob:'lightning'},false),189);
db.close();console.log('PASS: physically matching front-face reflections; 512 solo-solvable seeds; server-authoritative interactions, range/stage/crush checks, all three gates, trap lever, persistent progress, unchanged rewards and ascension.');
