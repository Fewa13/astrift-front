// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import * as THREE from '../public/three.module.js';
import {createAncientDeathUI} from '../public/ancient-death-ui.js';
import {releaseAncientInstances} from '../public/ancient-model-cleanup.js';
import {combat} from './ancient-test-modules.mjs';
import {newAncientProfile} from '../public/ancient-rules.js';
const container={hidden:true,children:[],replaceChildren(){this.children=[]}},node=(tag,text,p)=>{const n={tag,text};p.children.push(n);return n},button=(text,click,p)=>{const b=node('button',text,p);b.click=click;return b};let clicked=0;
const ui=createAncientDeathUI({container,en:()=>true,node,button,respawn:()=>clicked++,watch(){},leave(){}}),you={hp:0,deadAt:1000};
ui.update({you},1500);const first=container.children.at(-1);assert(first.disabled);for(let now=1700;now<5000;now+=200){ui.update({you},now);assert.equal(container.children.at(-1),first,'button identity remains stable');}assert(!first.disabled);first.click();assert.equal(clicked,1);ui.update({you:{hp:100}},5000);assert(container.hidden);assert.equal(container.children.length,0);
ui.update({you,players:[{name:'friend',hp:100}],dungeon:{id:'run'}},6000);const watch=container.children[2];ui.update({you,players:[{name:'friend',hp:50}],dungeon:{id:'run'}},6200);assert.equal(container.children[2],watch);ui.clear();
for(const id of ['triplecut','swordrain','phantomblade','storm']){
 const p=newAncientProfile();p.level=80;p.profession=id==='storm'?'lightning':'swordsman';p.skills={[id]:3};const a={name:'p',x:0,y:1.7,z:50,hp:100,weapon:p.weapons[0]},m={id:'m',kind:'grox',x:0,z:55,hp:1e9,maxHp:1e9},hits=[],c={map:'tribe',monsters:[m],damage:(m,n)=>{hits.push(n);m.hp-=n;return n},fx(){}};const now=Date.now();assert.equal(combat.castAncientSkill(a,p,id,[0,-.15,Math.sqrt(1-.15**2)],c,now),null);
 a.hp=0;combat.tickAncientSkills(a,p,c,.2,now+100);assert.equal(m.strikes?.length||0,0);assert.equal(m.dots?.length||0,0);const before=hits.length;a.hp=100;combat.tickAncientSkills(a,p,c,.2,now+3300);assert.equal(hits.length,before,id+' no stale damage after revival');
}
const geometry=new THREE.BoxGeometry(),material=new THREE.MeshBasicMaterial();let released=0,sharedDisposed=0;geometry.addEventListener('dispose',()=>sharedDisposed++);material.addEventListener('dispose',()=>sharedDisposed++);const scene=new THREE.Scene();
const pending={strikes:[{owner:'dead',at:100,damage:20},{owner:'alive',at:100,damage:30}],dots:[{owner:'dead',next:0,until:100,damage:10},{owner:'alive',next:0,until:100,damage:15}]};combat.clearPendingSkillDamage('dead',[pending]);assert.deepEqual(pending.strikes.map(v=>v.owner),['alive']);assert.deepEqual(pending.dots.map(v=>v.owner),['alive']);
for(let i=0;i<100;i++){const group=new THREE.Group(),mesh=new THREE.InstancedMesh(geometry,material,4);mesh.addEventListener('dispose',()=>released++);group.add(mesh);scene.add(group);releaseAncientInstances(group);assert.equal(scene.children.length,0);}assert.equal(released,100);assert.equal(sharedDisposed,0);geometry.dispose();material.dispose();
console.log('PASS: stable respawn/spectator buttons; four delayed skills cancelled on death; 100 instance cleanups with shared geometry/material preserved.');
