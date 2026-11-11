// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import * as T from '../public/three.module.js';
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>new Proxy({},{get:(o,k)=>o[k]??(k==='createRadialGradient'?()=>({addColorStop(){}}):()=>{}),set:(o,k,v)=>(o[k]=v,true)})})};
const {buildSanctumScene,createSanctumCreature}=await import('../public/ancient-sanctum-scene.js');
const scene=new T.Scene(),map=buildSanctumScene(scene);scene.updateMatrixWorld(true);
for(const [z,y]of [[10,1.7],[190,3.1],[245,9.7],[480,13.7]]){const cam=new T.PerspectiveCamera(75,16/9,.05,190);cam.position.set(0,y,z);cam.lookAt(0,y+1,z+60);cam.updateMatrixWorld();const f=new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));let draws=0,triangles=0;scene.traverse(m=>{if(!m.isMesh)return;assert(m.geometry.attributes.position.array.every(Number.isFinite));if(f.intersectsObject(m)){draws++;triangles+=(m.geometry.index?.count||m.geometry.attributes.position.count)/3}});console.log({z,draws,triangles});assert(draws<220);assert(triangles<350000)}
const a=createSanctumCreature('immaculate_judge',150),b=createSanctumCreature('immaculate_judge',150);assert.notEqual(a.userData.arms[0],b.userData.arms[0]);a.userData.arms[0].rotation.x=1;assert(Math.abs(b.userData.arms[0].rotation.x)<1e-8);map.update(1000);console.log('PASS: chunked finite geometry, four-view draw/triangle budgets, independent cached creature joints.');
