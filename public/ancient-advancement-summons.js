// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as THREE from './three.module.js';

const box=new THREE.BoxGeometry(1,1,1),orb=new THREE.IcosahedronGeometry(1,0);
const bone=new THREE.MeshStandardMaterial({color:0xc7c2a3,roughness:.8});
const armor=new THREE.MeshStandardMaterial({color:0x323b3e,roughness:.65,metalness:.35});
const ghost=new THREE.MeshStandardMaterial({color:0x66c8c6,metalness:.6,roughness:.34,emissive:0x207868});
const light=new THREE.MeshBasicMaterial({color:0xb6ffe8});
const emerald=new THREE.MeshBasicMaterial({color:0x93ff66});

export function createAdvancementSummon(kind){
 const spirit=kind==='spirit',root=new THREE.Group(),left=new THREE.Group(),right=new THREE.Group();
 const body=new THREE.Group();root.add(body,left,right);left.position.set(-.26,1.23,0);right.position.set(.26,1.23,0);
 const mesh=(group,geometry,material,x,y,z,w,h,d)=>{
  const part=new THREE.Mesh(geometry,material);part.position.set(x,y,z);part.scale.set(w,h,d);group.add(part);return part;
 };
 mesh(body,orb,spirit?ghost:bone,0,1.54,0,.16,.19,.15);
 mesh(body,box,spirit?ghost:bone,0,1.11,0,.1,.49,.095);
 for(const sign of [-1,1]){
  mesh(body,box,spirit?light:emerald,sign*.065,1.56,-.134,.056,.036,.018);
  for(let i=0;i<3;i++){
   const rib=mesh(body,box,spirit?ghost:bone,sign*.125,1.06+i*.095,-.06,.24,.043,.085);
   rib.rotation.z=-sign*.18;
  }
 }
 mesh(body,box,armor,0,.83,0,.34,.13,.2);
 const feet=[];
 for(const sign of [-1,1]){
  const leg=new THREE.Group();leg.position.set(sign*.117,.8,0);root.add(leg);feet.push(leg);
  mesh(leg,box,spirit?ghost:bone,0,-.31,0,.082,.64,.09);
  mesh(leg,box,armor,0,-.66,-.05,.13,.14,.23);
 }
 for(const arm of [left,right]){
  mesh(arm,orb,spirit?ghost:armor,0,-.03,0,.12,.14,.12);
  mesh(arm,box,bone,0,-.23,0,.069,.45,.075);
 }
 mesh(right,box,spirit?light:armor,0,-.41,-.29,.058,.06,.55);
 mesh(right,box,armor,0,-.41,-.1,.22,.05,.055);
 if(spirit){
  mesh(left,orb,ghost,-.06,-.18,-.1,.22,.26,.1);
  mesh(body,orb,light,0,1.18,-.11,.09,.1,.055);
  for(const sign of [-1,1])for(let i=0;i<3;i++){
   const plume=mesh(body,orb,ghost,sign*(.32+i*.09),1.36-i*.07,.19,.1,.33,.06);
   plume.rotation.z=sign*.74;
  }
 }
 root.userData.advancementSummon={arms:[left,right],feet,body};
 return root;
}

export function animateAdvancementSummon(mesh,moving,attacking,time){
 const state=mesh.userData.advancementSummon;
 if(!state)return false;
 const phase=time*.01;
 for(const [index,foot] of state.feet.entries())foot.rotation.x=moving?Math.sin(phase+index*Math.PI)*.55:0;
 state.arms[0].rotation.x=attacking?-.45:moving?Math.sin(phase+Math.PI)*.45:0;
 state.arms[1].rotation.x=attacking?-1.3-Math.sin(phase)*.28:moving?Math.sin(phase)*.45:0;
 state.body.position.y=moving?Math.abs(Math.sin(phase))*.05:Math.sin(phase*.3)*.015;
 return true;
}
