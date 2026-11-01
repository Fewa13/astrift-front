// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import * as T from '../public/three.module.js';
import {communityModelParts} from '../public/ancient-community-models.js';
import {buildCommunityScene} from '../public/ancient-community-scene.js';
const parts=communityModelParts('kit-greenhouse'),boxes=parts.filter(p=>p.shape==='box'),bedIndices=boxes.flatMap((p,i)=>Math.abs(p.w-.23)<1e-5?[i]:[]);assert.equal(bedIndices.length,14);
for(const rotation of [0,.37,Math.PI/2,2.3,-1.1]){const map={id:919,sky:'#93b4c2',skyArt:[],boundary:[{x:-90,z:-90},{x:90,z:-90},{x:90,z:90},{x:-90,z:90}],spawn:{x:0,z:0},spawns:[],objects:[{id:'greenhouse',model:'kit-greenhouse',x:12,y:0,z:-7,w:14,h:6,d:20,rotation,color:'#849a83',solid:true}]},built=buildCommunityScene(new T.Scene(),map),mesh=built.world.children.find(m=>m.isInstancedMesh&&m.geometry.type==='BoxGeometry'),floor=new T.Matrix4();mesh.getMatrixAt(0,floor);const inverse=floor.clone().invert();for(const i of bedIndices){const bed=new T.Matrix4();mesh.getMatrixAt(i,bed);const relative=inverse.clone().multiply(bed);for(const x of [-.5,.5])for(const z of [-.5,.5]){const v=new T.Vector3(x,0,z).applyMatrix4(relative);assert(Math.abs(v.x)<=.5+1e-5&&Math.abs(v.z)<=.5+1e-5,`bed outside floor at rotation ${rotation}`)}}built.dispose()}
console.log('PASS real Three matrices: all 14 greenhouse beds remain within the floor at five rotations.');
