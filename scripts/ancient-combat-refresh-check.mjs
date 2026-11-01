// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
import {build} from 'esbuild';
import {combat,skills} from './ancient-test-modules.mjs';
import {newAncientProfile} from '../public/ancient-rules.js';
const direction=[0,-.15,Math.sqrt(1-.15**2)];
for(const holy of [false,true])for(const [job,definition]of Object.entries(skills.PROFESSIONS))for(const id of definition.skills){
 const p=newAncientProfile();p.level=80;p.profession=job;p.skills={[id]:3};if(holy)p.ascension={jobs:{[job]:{holy:true}}};
 const a={name:'tester',x:0,y:1.7,z:50,hp:1e6,maxHp:1e6,weapon:p.weapons[0]},m={id:'target',kind:'grox',x:0,z:55,hp:1e12,maxHp:1e12};let damage=0;
 const c={map:'tribe',monsters:[m],damage(target,n){assert(Number.isFinite(n)&&n>0);target.hp-=n;damage+=n;return n},fx(){}};
 assert.equal(combat.castAncientSkill(a,p,id,direction,c),null,id);
 if(id==='summon'){a.skillRuntime.summon.x=0;a.skillRuntime.summon.z=54;}
 if(id==='weaken')combat.ancientAuxShot(a,p,direction,c,Date.now()+500);
 if(id==='transform'){m.z=53;combat.ancientAuxShot(a,p,direction,c,Date.now()+500);}
 for(let t=200;t<=4000;t+=200)combat.tickAncientSkills(a,p,c,.2,Date.now()+t);
 if(id!=='vitality')assert(damage>0,id+' actual damage');
}
const primary={id:'inside-obstacle',kind:'grox',x:27,z:70,hp:100,maxHp:100};
assert(combat.skillAreaTargets(primary,4,{map:'tribe',monsters:[primary]}).includes(primary),'locked primary not lost to second foot-level ray');
const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows}}};
const output=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']}),module={exports:{}},actors=[],messages=[],sockets=[];
const ctx={storage:{sql,setAlarm:async()=>{},transactionSync:f=>f()},getWebSockets:()=>sockets};
vm.runInNewContext(output.outputFiles[0].text,{module,exports:module.exports,Date,crypto,Math,structuredClone,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
const server=new module.exports.AncientWorld(ctx,{});
for(const [name,z]of [['near',50],['far',250]]){const p=server.read(name);actors.push({name,map:'tribe',tribeLayout:2,x:0,z,y:1.7,yaw:0,hp:100,maxHp:100,seen:Date.now(),weapon:p.weapons[0],ammo:10,lastShot:0,reloadAt:0,deadAt:0});messages.push([]);const i=actors.length-1;sockets.push({deserializeAttachment:()=>structuredClone(actors[i]),serializeAttachment:a=>actors[i]=structuredClone(a),send:s=>messages[i].push(JSON.parse(s)),close(){}});}
await server.tickMap('tribe');
for(let i=0;i<2;i++){const state=messages[i].findLast(m=>m.type==='state');assert(state);assert(state.players.some(p=>p.name===actors[1-i].name),'remote player retained beyond 150m');}
for(const id of ['swordrain','phantomblade']){
 const p=server.read('near');p.level=80;p.profession='swordsman';p.skills={[id]:3};server.save('near',p);
 actors[0].hp=1e6;actors[0].maxHp=1e6;actors[0].x=0;actors[0].z=50;delete actors[0].skillRuntime;
 const w=server.world('tribe');for(const m of w.monsters)m.hp=0;
 const target=w.monsters.find(m=>m.kind==='grox')||w.monsters[0];Object.assign(target,{kind:'grox',x:0,z:55,hp:1e12,maxHp:1e12});server.persist(w);
 await server.webSocketMessage(sockets[0],JSON.stringify({type:'skill',id,direction}));
 const saved=server.world('tribe'),locked=saved.monsters.find(m=>m.id===target.id);
 assert.equal(locked.strikes.length,id==='swordrain'?6:1,'delayed hits stored in authoritative world');
 for(const strike of locked.strikes)strike.at=Date.now()-1;server.persist(saved);
 await server.tickMap('tribe');assert(server.world('tribe').monsters.find(m=>m.id===target.id).hp<1e12,'scheduled skill really damages after reload');
}
db.close();console.log('PASS: all professions normal/holy actual damage, locked-primary AoE, distant same-map player snapshots.');
