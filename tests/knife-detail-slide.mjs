import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as THREE from 'three';
import {phaseKnifeDetails,knifeSkinDetails,mergeKnifeParts} from '../public/knife-detail.js';
import {KNIFE_FORMS} from '../public/knife-forms.js';
const materials=Array.from({length:5},()=>new THREE.MeshStandardMaterial());
const details=phaseKnifeDetails(THREE,materials),merged=mergeKnifeParts(THREE,details.children);
assert(details.children.length>150,'real geometry, not a painted stripe');
assert.equal(merged.children.length,5,'all details must be five material batches');
let triangles=0;
assert(Math.min(...merged.children.map(m=>m.geometry.boundingBox.min.z))<-.7);
for(const m of merged.children){assert([...m.geometry.attributes.position.array].every(Number.isFinite));triangles+=m.geometry.attributes.position.count/3;m.geometry.dispose()}
assert(triangles<9000,'bounded triangle budget');
for(const m of details.children)m.geometry.dispose();
for(const [id,form] of Object.entries(KNIFE_FORMS)){
  const pieces=knifeSkinDetails(THREE,materials,form,id),batch=mergeKnifeParts(THREE,pieces.children);
  assert(pieces.children.length>40,id);assert(batch.children.length<=5,id);
  for(const m of batch.children){assert([...m.geometry.attributes.position.array].every(Number.isFinite),id);m.geometry.dispose()}
  for(const m of pieces.children)m.geometry.dispose();
}
for(const m of materials)m.dispose();
const game=await readFile('public/game.js','utf8');
const actorSource=game.slice(game.indexOf('function actorMesh('),game.indexOf('function setActorLabel('));
const attackSource=game.slice(game.indexOf('function knifeAttack('),game.indexOf('function applyKnifeHit('));
const camera=new THREE.PerspectiveCamera(75,1,.1,100);camera.position.set(0,1.7,0);
const ctx={THREE,camera,bots:[],remotes:new Map(),obstacles:[],weaponDef:{range:1.9},playerTeam:0,knifeCombo:0,knifeCombat:()=>({range:1.9}),activeKnifeSkin:()=>null,performance:{now:()=>1000},applyKnifeHit:chosen=>ctx.hit=chosen};
vm.runInNewContext(actorSource+attackSource,ctx);
const actor=ctx.actorMesh();actor.position.z=-1.6;actor.userData.team=1;actor.updateMatrixWorld(true);ctx.bots.push(actor);
const attackAt=y=>{ctx.hit=null;camera.lookAt(0,y,-1.6);camera.updateMatrixWorld(true);ctx.knifeAttack();return ctx.hit};
assert.equal(attackAt(1.94)?.hit.object.userData.hitZone,'head','grounded head aim must hit head');
assert.equal(attackAt(1.25)?.hit.object.userData.hitZone,'body','body aim must remain body');
const wall=new THREE.Mesh(new THREE.BoxGeometry(3,4,.15),new THREE.MeshBasicMaterial());wall.position.set(0,1.5,-.6);wall.updateMatrixWorld(true);ctx.obstacles.push(wall);
assert.equal(attackAt(1.94),null,'no stabbing through cover');ctx.obstacles.length=0;
actor.position.z=-3;actor.updateMatrixWorld(true);assert.equal(attackAt(1.94),null,'range must not be inflated');
const slide=game.split('\n').find(l=>l.startsWith('function updateSlide('));
assert(slide.includes('1125'));assert(slide.includes('*1.5625*'));
const slideCtx={slideStartedAt:1000,playing:true,hp:100,grounded:true,slideDirectionX:0,slideDirectionZ:-1,camera:{position:{x:0,y:.48,z:0}},playerEyeHeight:.48,woundActive:()=>false,blockedForPlayer:()=>false,stopSlide:()=>slideCtx.stopped=true};
vm.runInNewContext(slide,slideCtx);slideCtx.updateSlide(.1,1000);
assert(Math.abs(slideCtx.camera.position.z+12.6*1.5625*.1)<1e-9);slideCtx.updateSlide(.01,2124);assert(!slideCtx.stopped);slideCtx.updateSlide(.01,2125);assert(slideCtx.stopped);
console.log(`PASS: ${details.children.length} phase ornaments → 5 batches, ${triangles} triangles; grounded head/body, cover/range, slide 1125 ms and +25% speed.`);
