import {createGroundBladeNet,releaseGroundBladeNet} from './ancient-sword-rework-fx.js';
// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as THREE from './three.module.js';
// Persistent objects come from authoritative runtime, so reconnects rebuild the same formation.
export function createAdvancementFields(scene,camera){
 const geometry=new THREE.ConeGeometry(.42,2,5),material=new THREE.MeshStandardMaterial({color:0x926846,emissive:0xd08b35,emissiveIntensity:.24,roughness:.85});
 const spikes=new THREE.InstancedMesh(geometry,material,1600);spikes.count=0;spikes.frustumCulled=false;scene.add(spikes);
 const rings=new THREE.InstancedMesh(new THREE.TorusGeometry(1,.045,5,48),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7,depthWrite:false}),24);rings.count=0;rings.frustumCulled=false;scene.add(rings);
 const ringColor=new THREE.Color(),pose=new THREE.Object3D(),nets=new Map();let next=0;
 function update(actors,time){
  if(time<next)return;next=time+100;
  const now=Date.now(),cap=camera.userData.renderPressure?700:1600;let count=0,ringCount=0;const seenNets=new Set();
  const ring=(point,radius,tint=0xa8dfff)=>{if(ringCount>=24)return;pose.position.set(point.x,(point.y||0)+.15,point.z);pose.rotation.set(Math.PI/2,0,0);pose.scale.setScalar(radius);pose.updateMatrix();rings.setMatrixAt(ringCount,pose.matrix);ringColor.setHex(tint);rings.setColorAt(ringCount++,ringColor);};
  for(const a of actors){
   if(!a||a.hp<=0)continue;
   for(const net of a.skillRuntime?.advancedSword?.nets||[]){
    if(net.until<=now||seenNets.size>=32||Math.hypot(net.x-camera.position.x,net.z-camera.position.z)>130)continue;
    seenNets.add(net.visualId);let model=nets.get(net.visualId);
    if(!model){model=createGroundBladeNet(net.radius);nets.set(net.visualId,model);scene.add(model);}
    model.position.set(net.x,net.y+.09,net.z);
    const pulse=.8+.2*Math.sin((now-net.next)*.012);model.children[0].material.opacity=.55*pulse;
   }
   const state=a.skillRuntime?.advancedStone;
   if(a.advancement==='veinforger'&&state){
    const points=[...(state.spikes||[]).filter(p=>p.until>now),...((state.formation?.until||0)>now?state.formation.points:[])];
    for(const point of points){
     if(count>=cap)break;
     if(Math.hypot(point.x-camera.position.x,point.z-camera.position.z)>130)continue;
     pose.position.set(point.x,(point.y||0)+.72,point.z);pose.rotation.set(0,count*2.399,0);pose.scale.set(.8,point.serial?1.2:.75,.8);pose.updateMatrix();spikes.setMatrixAt(count++,pose.matrix);
    }
   }
   const sanctuary=a.skillRuntime?.paladin?.field;if(a.advancement==='paladin'&&sanctuary?.until>now){ring(sanctuary,sanctuary.radius,0xffdc82);ring({...sanctuary,y:(sanctuary.y||0)+.04},sanctuary.radius*.94,0xffedba);}
   const timeState=a.skillRuntime?.advancedTime;
   if(a.advancement==='time-sovereign'&&(timeState?.rewind?.until||0)>now){ring(timeState.rewind,1.8);ring({...timeState.rewind,y:timeState.rewind.y+.2},1.2);}
   if((timeState?.field?.until||0)>now)ring(timeState.field,timeState.field.radius);
   const domain=a.skillRuntime?.advancedRift?.domain;
   if(domain?.until>now)ring(domain,domain.radius);
  }
  for(const [id,model] of nets)if(!seenNets.has(id)){releaseGroundBladeNet(model);nets.delete(id);}
  spikes.count=count;rings.count=ringCount;spikes.instanceMatrix.needsUpdate=rings.instanceMatrix.needsUpdate=true;if(rings.instanceColor)rings.instanceColor.needsUpdate=true;
 }
 return {update,clear(){for(const model of nets.values())releaseGroundBladeNet(model);nets.clear();spikes.count=rings.count=0;next=0}};
}
