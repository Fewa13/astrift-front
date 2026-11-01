// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from '../public/three.module.js';
import {dressFpsActor} from '../public/fps-actor-model.js';
const source=fs.readFileSync('public/game.js','utf8');
const factory=source.slice(source.indexOf('function actorMesh('),source.indexOf('function setActorLabel('));
const create=new Function('THREE','dressFpsActor',factory+';return actorMesh;')(THREE,dressFpsActor);
for(const color of [0x5ff5ff,0xff496c,0xa569ff,0x62db8b]){
 const base=new Function('THREE','dressFpsActor',factory+';return actorMesh;')(THREE,()=>{})(color),actor=create(color);
 const combat=a=>{const data=[];a.traverse(o=>{if(o.isMesh&&o.name!=='fps-armour-detail')data.push([o.geometry.type,o.position.toArray(),o.userData.hitZone])});return data};
 assert.deepEqual(combat(actor),combat(base));
 actor.updateMatrixWorld(true);base.updateMatrixWorld(true);
 for(let y=.1;y<2.3;y+=.12)for(let x=-.65;x<.7;x+=.13){
  const ray=new THREE.Raycaster(new THREE.Vector3(x,y,-5),new THREE.Vector3(0,0,1));
  const a=ray.intersectObject(actor,true)[0],b=ray.intersectObject(base,true)[0];
  assert.equal(a?.object.userData.hitZone,b?.object.userData.hitZone);
  assert.equal(a?.distance,b?.distance,'Visual trim must not change hit distance');
 }
 const detail=[];actor.traverse(o=>{if(o.name==='fps-armour-detail'){detail.push(o);const hits=[];o.raycast(null,hits);assert.equal(hits.length,0);assert(o.geometry.attributes.position.array.every(Number.isFinite))}});
 assert.equal(detail.length,9);assert(detail.reduce((n,o)=>n+o.geometry.attributes.position.count/3,0)<5000);
 const {pose,leftArm,leftLeg,helmetShell,armorPlate}=actor.userData;
 assert(leftArm.children.length&&leftLeg.children.length&&helmetShell.children.length&&armorPlate.children.length);
 pose.rotation.x=Math.PI/2;pose.scale.y=.48;actor.updateMatrixWorld(true);
 assert(detail.every(o=>o.matrixWorld.elements.every(Number.isFinite)));
}
assert.equal(create(0x6ca65d).userData.fpsArmour,undefined,'Tower zombies must remain unchanged');
console.log('PASS: 4 team colours, unchanged combat meshes, cosmetic raycast exclusion, 9 merged detail draws, pose parenting, unchanged zombies.');
