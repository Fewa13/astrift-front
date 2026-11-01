// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import * as THREE from 'three';
import {attachAncientRemoteGear,createAncientMeleeVisuals} from '../public/ancient-melee-visuals.js';
import {createObjectActionFX} from '../public/ancient-object-action.js';
import {newAncientProfile} from '../public/ancient-rules.js';
const player=new THREE.Group(),body=new THREE.Group();player.add(body);player.userData.body=body;const torso=new THREE.Mesh(new THREE.BoxGeometry(.55,.65,.32));torso.position.y=1.1;body.add(torso);
const gear=attachAncientRemoteGear(player,{armor:'wovenArmor1'});assert.equal(gear.parent,body);body.position.y=.1;const armor=gear.children[0];body.updateWorldMatrix(true,true);const shell=new THREE.Box3().setFromObject(armor),inner=new THREE.Box3().setFromObject(torso);assert(shell.min.x<inner.min.x&&shell.max.x>inner.max.x);assert(shell.min.z<inner.min.z&&shell.max.z>inner.max.z);assert(shell.min.y<inner.min.y&&shell.max.y>inner.max.y);
attachAncientRemoteGear(player,{armor:'newArmor2'});assert.equal(gear.parent,null,'Replaced armor is removed, not left as overlapping geometry');assert.equal(body.children.length,2);
const camera=new THREE.PerspectiveCamera(),melee=createAncientMeleeVisuals(camera),p=newAncientProfile();melee.update(p,{hp:100},0,.016);assert.equal(camera.children[0].visible,true);melee.update(p,{hp:100},1,.016,true);assert.equal(camera.children[0].visible,false,'Weapon hidden during interaction');melee.update(p,{hp:100},2,.016);assert.equal(camera.children[0].visible,true,'Weapon restored');
const scene=new THREE.Scene(),actor={mesh:new THREE.Group()};actor.mesh.userData.body=new THREE.Group();camera.position.set(0,1.7,2);const fx=createObjectActionFX(scene,camera);fx.start('hammer',actor);fx.update(.5,1000);scene.traverse(o=>{if(o.isMesh)assert.equal(o.material.depthTest,true,'Tools/effects must not render through surfaces')});fx.reset();assert(scene.children.every(o=>!o.visible));
console.log('PASS: non-coplanar armor shell, animated-body attachment, old gear removed, held weapon suppression/recovery, effect depth testing and cleanup.');
