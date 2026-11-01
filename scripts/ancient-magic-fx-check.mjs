// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import * as THREE from '../public/three.module.js';
import {createAncientMagicFX,ANCIENT_FX_IDS} from '../public/ancient-magic-fx.js';
const scene=new THREE.Scene(),fx=createAncientMagicFX(scene);
const compositions=new Set();
for(const id of ANCIENT_FX_IDS){
 fx.effect({id,x:1,z:2,radius:6},()=>3);assert(fx.count<=12);
 const latest=scene.children.at(-1);compositions.add(JSON.stringify(latest.children.map(m=>[m.geometry.uuid,m.count||0,m.userData.motion,m.position.toArray(),m.scale.toArray()])));
 for(const f of scene.children){assert.equal(f.position.y,3.08);assert(f.children.length<=10);for(const m of f.children)if(m.isInstancedMesh){assert(m.count<=50);assert([...m.instanceMatrix.array].every(Number.isFinite))}}
}
assert.equal(compositions.size,ANCIENT_FX_IDS.length,'Every spell needs a distinct composition, not just a different color');
for(const id of ANCIENT_FX_IDS){const s=new THREE.Scene(),f=createAncientMagicFX(s);f.effect({id,x:0,z:0,radius:5,source:{x:-20,y:3,z:10}},()=>0);for(let tick=0;tick<12;tick++){f.update(tick*16,1/60);for(const g of s.children)for(const m of g.children){assert(m.position.toArray().every(Number.isFinite));assert(m.scale.toArray().every(Number.isFinite));if(m.isInstancedMesh)assert([...m.instanceMatrix.array].every(Number.isFinite))}}f.clear();assert.equal(s.children.length,0)}
const count=fx.count;fx.effect({id:'doom',x:NaN,z:0},()=>0);assert.equal(fx.count,count);
const geometry=scene.children[0].children[0].geometry;
let sharedDisposed=false;geometry.addEventListener('dispose',()=>sharedDisposed=true);
for(let frame=0;frame<600;frame++)fx.update(frame*16.67,1/60);
assert.equal(fx.count,0);assert.equal(scene.children.length,0);assert.equal(sharedDisposed,false);
fx.effect({id:'storm',x:0,z:0,radius:5},()=>0);let released=0;scene.children[0].children[0].material.addEventListener('dispose',()=>released++);fx.clear();assert.equal(released,1);assert.equal(scene.children.length,0);
for(let cast=0;cast<40;cast++){fx.effect({id:'chain',x:0,z:0,radius:1,links:Array.from({length:32},(_,i)=>({x:i,y:1,z:i,height:1,target:String(i)}))},()=>0);assert(fx.count<=12);assert(scene.children.reduce((n,g)=>n+g.children.reduce((a,m)=>a+(m.isInstancedMesh?m.count:0),0),0)<=2400)}fx.clear();assert.equal(scene.children.length,0);
console.log('PASS: all unique spell compositions; 10 draws per spell; 2400-instance/12-effect caps; finite transforms; shared geometry and material cleanup; chain stress test.');
