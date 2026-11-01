// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import vm from 'node:vm';import {build} from 'esbuild';
import {newAncientProfile} from '../public/ancient-rules.js';
const db=new DatabaseSync(':memory:'),peers=[],ctx={storage:{sql:{exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows,one:()=>rows[0]}}},setAlarm:async()=>{},transactionSync(fn){db.exec('BEGIN');try{const r=fn();db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}}},getWebSockets:()=>peers};
const result=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']}),module={exports:{}};
vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}}),Date,crypto,Math,structuredClone,AbortController,Response,console});
let world=new module.exports.AncientWorld(ctx,{}),p=newAncientProfile();p.profession='ice';p.level=30;p.quest={step:9999,count:0};world.save('branchtest',p);
assert.equal((await world.command('branchtest','chooseBranch',{job:'ice',id:'frostprison'})).ok,false);
let a={name:'branchtest',profession:'ice',map:'tribe',x:0,z:90,y:1.7,hp:100,maxHp:100,weapon:p.weapons[0],seen:Date.now(),skills:{},deadAt:0},messages=[];
const ws={readyState:1,deserializeAttachment:()=>structuredClone(a),serializeAttachment:v=>a=structuredClone(v),send:s=>messages.push(JSON.parse(s))};peers.push(ws);
await world.webSocketMessage(ws,JSON.stringify({type:'branchMentor'}));assert.equal(world.read('branchtest').branchGuides,undefined,'Distant players cannot unlock guidance');
a.x=-10;a.z=17;await world.webSocketMessage(ws,JSON.stringify({type:'branchMentor'}));assert.equal(world.read('branchtest').branchGuides.ice,true);assert(messages.some(m=>m.type==='branchGuided'));
assert.equal((await world.command('branchtest','chooseBranch',{job:'ice',id:'frostprison'})).ok,true);
assert.equal((await world.command('branchtest','chooseBranch',{job:'ice',id:'iceedge'})).ok,false);
world=new module.exports.AncientWorld(ctx,{});assert.equal(world.read('branchtest').branches.ice,'frostprison','New instance restores permanent choice');
p=world.read('branchtest');p.profession='lightning';world.save('branchtest',p);await world.webSocketMessage(ws,JSON.stringify({type:'branchMentor'}));assert.equal((await world.command('branchtest','chooseBranch',{job:'lightning',id:'heavenwrath'})).ok,true);assert.equal(world.read('branchtest').branches.ice,'frostprison');
assert(messages.some(m=>m.type==='profile'&&m.profile.branches?.lightning==='heavenwrath'));
db.close();console.log('PASS real bundled server + SQLite: proximity gate, mentor message, atomic permanent choice, duplicate refusal, new-instance persistence, independent professions and live profile sync.');
