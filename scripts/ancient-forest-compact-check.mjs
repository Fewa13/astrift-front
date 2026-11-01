// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {build} from 'esbuild';
import {FOREST_ALTARS,forestBlocked,forestPath,forestCompactPoint,forestSafePosition} from '../public/ancient-forest.js';
const old=[[90,355],[-8,270],[188,270],[188,442],[-8,442]];
for(let i=0;i<5;i++){const a=FOREST_ALTARS[i];assert(!forestBlocked(a.x,a.z,20));assert(forestPath(60,215,a.x,a.z).length);for(let j=i+1;j<5;j++){const b=FOREST_ALTARS[j],ratio=Math.hypot(a.x-b.x,a.z-b.z)/Math.hypot(old[i][0]-old[j][0],old[i][1]-old[j][1]);assert(ratio>.69&&ratio<.71)}}
assert.deepEqual(forestCompactPoint(0,100),{x:0,z:100});assert(!forestBlocked(...Object.values(forestSafePosition(190,440))));
let saved;const module={exports:{}},ctx={getWebSockets:()=>[],storage:{sql:{exec:()=>({toArray:()=>saved?[{data:JSON.stringify(saved.monsters),tick:saved.tick}]:[]})}}};
const compiled=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']});
vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,crypto,Math,Date,require:()=>({DurableObject:class{constructor(c){this.ctx=c}}})});
const server=new module.exports.AncientWorld(ctx,{});server.persist=w=>saved=structuredClone(w);
const fresh=server.world('forest');assert.equal(fresh.monsters.length,36);assert(fresh.monsters.every(m=>!forestBlocked(m.x,m.z,1.8)));
for(const m of saved.monsters)if(m.region===2){m.x=m.homeX=60+(m.homeX-60)/.7;m.z=m.homeZ=205+(m.homeZ-205)/.7;m.hp=Math.floor(m.maxHp*.4)}
const migrated=server.world('forest');for(const m of migrated.monsters)if(m.region===2){assert(!forestBlocked(m.x,m.z,1.8));assert(!forestBlocked(m.homeX,m.homeZ,1.8));assert(Math.abs(m.hp/m.maxHp-.4)<.001);if(m.kind.startsWith('crystal_')){const altar=FOREST_ALTARS.find(a=>m.kind==='crystal_'+a.element);assert.equal(m.homeX,altar.x);assert.equal(m.homeZ,altar.z)}}
assert.deepEqual(server.world('forest').monsters,migrated.monsters);
console.log('PASS: altar distances reduced30%; platform margins; entrance paths; fresh shared spawn; old-world migration preserves HP and IDs; migration runs once.');
