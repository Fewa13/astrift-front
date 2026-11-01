// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import * as THREE from '../public/three.module.js';
import {createAncientMagicFX} from '../public/ancient-spell-fx.js';
for(const holy of [false,true]){
 const scene=new THREE.Scene(),fx=createAncientMagicFX(scene,()=>undefined);
 fx.effect({id:'phantomblade',holy,x:0,z:0,radius:6},()=>0);
 fx.update(2000,2);assert.equal(fx.count,1,'phantom must still exist at two seconds');
 for(const m of scene.children[0].children)if(m.isInstancedMesh)assert(Array.from(m.instanceMatrix.array).every(Number.isFinite));
 fx.update(3700,1.7);assert.equal(fx.count,0);assert.equal(scene.children.length,0,'expired composition removed');
 fx.clear();
}
console.log('PASS: normal/holy phantom remain visible past two seconds and expire cleanly at 3.6 seconds.');
