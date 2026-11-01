// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import * as THREE from '../public/three.module.js';
import {createAncientBossFX} from '../public/ancient-boss-fx.js';
const out=await build({entryPoints:['src/ancient-boss.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {tickAncientBoss,bossAreaHit}=await import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'));
const chief={id:'chief',kind:'chief',x:0,z:0,hp:100,attackAt:0,action:'idle',actionAt:0};let chiefHits=0;
tickAncientBoss(chief,{x:0,z:5},1000,()=>{},()=>chiefHits++);assert.equal(chief.action,'windup');assert.equal(chief.bossCast.hitAt,1900);assert.equal(chief.bossCast.areas[0].radius,7);
tickAncientBoss(chief,{x:0,z:5},1899,()=>{},()=>chiefHits++);assert.equal(chiefHits,0);
tickAncientBoss(chief,{x:0,z:5},1900,()=>{},()=>chiefHits++);assert.equal(chiefHits,1);assert.equal(chief.action,'attack');
const scene=new THREE.Scene(),fx=createAncientBossFX(scene),all=[];
for(const kind of ['lord','rootwarden','crystal_metal','crystal_wood','crystal_water','crystal_fire','crystal_earth']){
 const m={id:kind,kind,x:0,z:0,hp:100,attackAt:0,action:'idle',actionAt:0},events=[];let hits=0;
 const emit=(stage,c)=>events.push({stage,boss:m.id,...c}),hit=()=>hits++;
 assert(tickAncientBoss(m,{x:5,z:10},10000,emit,hit));assert.equal(m.action,'windup');assert.equal(hits,0);const first=structuredClone(m.bossCast);
 tickAncientBoss(m,{x:100,z:100},first.hitAt-1,emit,hit);assert.deepEqual(m.bossCast,first);assert.equal(hits,0);
 tickAncientBoss(m,{x:100,z:100},first.hitAt,emit,hit);assert.equal(hits,1);assert(!m.bossCast);
 tickAncientBoss(m,{x:5,z:10},first.hitAt+1,emit,hit);assert.equal(hits,1);
 tickAncientBoss(m,{x:5,z:10},m.attackAt,emit,hit);assert.notEqual(first.id,m.bossCast.id);all.push(...events);
 m.hp=0;tickAncientBoss(m,{x:5,z:10},50000,emit,hit);assert.equal(hits,1);assert(!m.bossCast);
}
assert(bossAreaHit({x:0,z:0,radius:18,inner:6},0,10));assert(!bossAreaHit({x:0,z:0,radius:18,inner:6},0,2));
assert(bossAreaHit({x:0,z:0,radius:0,length:20,width:4,angle:Math.PI/2},10,0));assert(!bossAreaHit({x:0,z:0,radius:0,length:20,width:4,angle:Math.PI/2},-10,0));
for(const e of all){e.started=Date.now();e.hitAt=e.started+1400;fx.effect(e,()=>0);fx.update(performance.now()+300);scene.traverse(o=>{assert(o.position.toArray().every(Number.isFinite));if(o.isInstancedMesh)assert([...o.instanceMatrix.array].every(Number.isFinite))})}
assert(fx.count<=16);fx.clear();assert.equal(scene.children.length,0);
const warning={stage:'warning',boss:'dead',kind:'lord',id:'quake',started:Date.now(),hitAt:Date.now()+1000,areas:[{x:0,z:0,radius:9}]};fx.effect(warning,()=>0);fx.sync([],()=>0);assert.equal(fx.count,0);
console.log('PASS: seven bosses × two skills, fixed warnings, delayed once-only hits, cooldown, death cancellation, safe center/lane geometry, bounded finite FX and cleanup.');
