// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as THREE from './three.module.js';
export function objectActionKind(id){return /timber|barricade|repair|trail/.test(id)?'hammer':/supplies/.test(id)?'pack':/tracks|record|signal0/.test(id)?'inspect':'channel'}
export function createObjectActionFX(scene,camera){
 const hand=new THREE.Group(),fx=new THREE.Group();hand.visible=fx.visible=false;scene.add(hand,fx);
 const wood=new THREE.MeshStandardMaterial({color:0x745238,roughness:.85}),metal=new THREE.MeshStandardMaterial({color:0x9bafac,metalness:.7,roughness:.3}),glove=new THREE.MeshStandardMaterial({color:0x344e43,roughness:.85}),light=new THREE.MeshBasicMaterial({color:0x72ffcf,transparent:true,opacity:.85,depthWrite:false});
 const mesh=(geo,mat,parent,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.renderOrder=100;parent.add(m);return m};
 const arm=mesh(new THREE.CylinderGeometry(.085,.12,.42,7),glove,hand,.05,-.28,.03);arm.rotation.z=-.3;
 const palm=mesh(new THREE.BoxGeometry(.17,.14,.17),glove,hand,0,-.05,0);
 const hammer=new THREE.Group();hand.add(hammer);mesh(new THREE.CylinderGeometry(.035,.045,.55,8),wood,hammer,0,.18,0);mesh(new THREE.BoxGeometry(.35,.15,.15),metal,hammer,0,.47,0);mesh(new THREE.BoxGeometry(.09,.17,.17),metal,hammer,.2,.47,0);
 const orb=mesh(new THREE.IcosahedronGeometry(.13,1),light,hand,0,.22,-.24),paper=mesh(new THREE.BoxGeometry(.36,.025,.27),wood,hand,0,.08,-.24);
 const ring=mesh(new THREE.TorusGeometry(.7,.025,6,40),light,fx);ring.rotation.x=-Math.PI/2;
 const beam=mesh(new THREE.CylinderGeometry(.012,.012,1,6),light,fx);const sparks=Array.from({length:12},()=>mesh(new THREE.OctahedronGeometry(.035,0),light,fx));
 let state=null;const local=new THREE.Vector3(),end=new THREE.Vector3(),direction=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),rotation=new THREE.Quaternion(),euler=new THREE.Euler();
 function reset(){hand.visible=fx.visible=false;if(state){state.actor.mesh.userData.body.position.x=0;state.actor.mesh.userData.body.rotation.z=0}state=null}
 return {start(kind,actor){reset();state={kind,actor};hand.visible=fx.visible=true;hammer.visible=kind==='hammer';paper.visible=kind==='pack'||kind==='inspect';orb.visible=kind==='channel';beam.visible=kind==='channel';},reset,update(progress,time){if(!state)return;const {kind,actor}=state,t=progress,cycle=(t*3)%1,impact=Math.max(0,1-Math.abs(cycle-.65)*12),pulse=Math.sin(time*.012);
 local.set(.38,-.28,-.8).applyQuaternion(camera.quaternion).add(camera.position);hand.position.copy(local);hand.quaternion.copy(camera.quaternion);euler.set(kind==='hammer'?-.7+Math.sin(cycle*Math.PI)*1.3:.15+Math.sin(t*Math.PI*4)*.15,0,kind==='pack'?Math.sin(t*Math.PI*6)*.18:0);rotation.setFromEuler(euler);hand.quaternion.multiply(rotation);
 fx.position.copy(actor.mesh.position);direction.copy(camera.position).sub(fx.position);direction.y=0;if(direction.lengthSq()>.001)fx.position.addScaledVector(direction.normalize(),.8);fx.position.y+=kind==='hammer'?.7:1.1;ring.scale.setScalar(kind==='inspect'?.65+t*.5:1+.06*pulse);ring.position.y=kind==='inspect'?Math.sin(t*Math.PI*4)*.65:0;ring.material.opacity=.35+.35*Math.abs(pulse);
 if(kind==='channel'){end.copy(hand.position).sub(fx.position);beam.position.copy(end).multiplyScalar(.5);beam.scale.y=end.length();direction.copy(end).normalize();beam.quaternion.setFromUnitVectors(up,direction)}
 for(let i=0;i<sparks.length;i++){const m=sparks[i],a=i*Math.PI*2/sparks.length,r=kind==='hammer'?impact*.7:.25+t*.6;m.visible=kind==='hammer'?impact>0:kind!=='pack';m.position.set(Math.cos(a)*r,(kind==='hammer'?impact:.2+Math.sin(time*.004+i)*.35),Math.sin(a)*r);m.scale.setScalar(kind==='hammer'?impact:1)}
 actor.mesh.userData.body.position.x=kind==='hammer'?impact*.035:0;actor.mesh.userData.body.rotation.z=kind==='hammer'?impact*.025:0;
 }};
}
