// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
import {build} from 'esbuild';
import {xpNeeded,ancientMonsterXP,gainXP,newAncientProfile} from '../public/ancient-rules.js';
import {questRewardInfo} from '../public/ancient-quests.js';
for(let l=1;l<150;l++)assert.equal(xpNeeded(l),200*l*l);
assert.equal(xpNeeded(150),9000000);assert.equal(xpNeeded(160),16000000);assert.equal(xpNeeded(200),81000000);
for(let l=150;l<250;l++){assert(xpNeeded(l+1)>xpNeeded(l));assert.equal(ancientMonsterXP('grox',l),Math.floor(Math.floor(200*l*l/(36+.48*(l-30)))*(l/100)**3));assert.equal(ancientMonsterXP('immaculate_judge',l),Math.floor(Math.floor(200*l*l*.4)*(l/100)**3));}
const test=newAncientProfile();test.level=150;gainXP(test,4500000);assert.equal(test.level,150);gainXP(test,4500007);assert.equal(test.level,151);assert.equal(test.xp,7);
test.level=200;assert.equal(questRewardInfo(test,{kind:'kill',reward:{xpFraction:.03}}).xp,240000);
const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows}}};
const output=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']}),module={exports:{}},messages=[],actors=[];
const sockets=[{deserializeAttachment:()=>structuredClone(actors[0]),serializeAttachment:a=>actors[0]=structuredClone(a),send:s=>messages.push(JSON.parse(s))}];
const ctx={storage:{sql,setAlarm:async()=>{},transactionSync:f=>f()},getWebSockets:()=>actors.length?sockets:[]};
vm.runInNewContext(output.outputFiles[0].text,{module,exports:module.exports,Date,crypto,Math,structuredClone,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
const server=new module.exports.AncientWorld(ctx,{});
for(const name of ['regular','admintest2','AdminTest'])assert.equal((await server.command(name,'testSkillLevels',{levels:{chain:6}})).ok,false);
const p=server.read('admintest');p.profession='lightning';p.skills={chain:6,haste:6,storm:6};server.save('admintest',p);
actors.push({name:'admintest',map:'tribe',weapon:p.weapons[0],hp:50,maxHp:100,skillRuntime:{cooldowns:{chain:999999},effects:{},mode:1,lastAux:0}});
for(const levels of [{},[],{chain:0},{chain:201},{chain:2.5},{chain:'3'},{unknown:1},{chain:3,storm:NaN}]){assert.equal((await server.command('admintest','testSkillLevels',{levels})).ok,false);assert.equal(server.read('admintest').skills.chain,6);}
assert.equal((await server.command('admintest','testSkillLevels',{levels:{chain:3,haste:4,storm:5}})).ok,true);
assert.equal(server.read('admintest').skills.chain,3);assert.equal(actors[0].skills.storm,5);assert.equal(Object.keys(actors[0].skillRuntime.cooldowns).length,0);assert(messages.some(m=>m.type==='skillState'&&m.skills.chain===3));
const next=new module.exports.AncientWorld(ctx,{});assert.equal(next.read('admintest').skills.haste,4);
const allSkills=Object.fromEntries(Object.keys((await import('../public/ancient-skills.js')).SKILLS).map(id=>[id,200]));
assert.equal((await server.command('admintest','testSkillLevels',{levels:allSkills})).ok,true);
for(const value of Object.values(server.read('admintest').skills))assert.equal(value,200);
assert.equal((await server.command('admintest','testPlayerLevel',{level:10000})).ok,true);
assert.equal(server.read('admintest').level,10000);
const {ancientBaseAttack,ancientProfileHealth,ancientSkillDamage}=await import('../public/ancient-gear.js');
const high=server.read('admintest');
for(const value of [xpNeeded(high.level),ancientBaseAttack(high.level),ancientProfileHealth(high),ancientSkillDamage(high)*126*305])assert(Number.isFinite(value)&&value>0);
const restored=new module.exports.AncientWorld(ctx,{});assert.equal(restored.read('admintest').skills.chain,200);assert.equal(restored.read('admintest').level,10000);
db.close();console.log('PASS: progression-only XP increase, old rewards preserved, authenticated-name restriction, atomic validation, live synchronization and persistent skill levels.');
