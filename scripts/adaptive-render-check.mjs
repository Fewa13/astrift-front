// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import * as THREE from '../public/three.module.js';
import {createFrameBudget,updateFpsDetail} from '../public/adaptive-render.js';
import {dressFpsActor} from '../public/fps-actor-model.js';
import {createAncientMagicFX} from '../public/ancient-spell-fx.js';
const changes=[],b=createFrameBudget({maxRatio:1.25,onChange:(...a)=>changes.push(a)});let now=100;
const run=(frames,ms,active=true)=>{for(let i=0;i<frames;i++)b.sample(now+=ms,active)};
run(150,34);assert(b.ratio<1.25);run(1000,40);assert(b.ratio>=.65);const low=b.ratio;
run(100,16);assert.equal(b.ratio,low,'No rapid resolution oscillation');run(1400,16);assert(b.ratio>low);
b.reset(1);run(300,40,false);assert.equal(b.ratio,1);b.sample(now+=5000);assert.equal(b.ratio,1,'Background tab gap must not reduce quality');
const source=(await import('node:fs')).readFileSync('public/game.js','utf8'),factory=source.slice(source.indexOf('function actorMesh('),source.indexOf('function setActorLabel('));
const actor=new Function('THREE','dressFpsActor',factory+';return actorMesh();')(THREE,dressFpsActor),camera=new THREE.PerspectiveCamera(70,1,.1,200);
camera.position.set(0,1.7,-60);updateFpsDetail(actor,camera,false);const trim=[];actor.traverse(o=>{if(o.name==='fps-armour-detail')trim.push(o)});assert(trim.some(o=>!o.visible));assert(actor.userData.helmetShell.children[0].visible);assert(actor.userData.armorPlate.children[0].visible);camera.position.z=-5;updateFpsDetail(actor,camera,true);assert(trim.every(o=>o.visible));
const scene=new THREE.Scene(),fx=createAncientMagicFX(scene,()=>null,camera);camera.position.set(0,1.7,0);camera.lookAt(0,1.7,-1);camera.updateMatrixWorld();
fx.effect({id:'storm',x:0,z:100,radius:4,holy:true},()=>0);fx.update(100,.1);assert.equal(scene.children[0].visible,false,'Behind-camera spell should not draw');
camera.lookAt(0,1.7,100);camera.updateMatrixWorld();fx.update(200,.1);assert.equal(scene.children[0].visible,true,'Turning back must restore spell');
for(let i=0;i<100;i++)fx.update(i*100,.1);assert.equal(fx.count,0);assert.equal(scene.children.length,0);
console.log('PASS: adaptive reduction/recovery, resolution floor, no hidden-tab penalty, FPS trim LOD preserves core armour, spell visibility restoration and expiry.');
