// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
import {createJadeCollectionModel} from './ancient-collection-model.js?v=20261025-quality-lustre-1';
export function createCollectionDisplay(camera){
 const snapshots=new Map(),remotes=new Map(),hand=new T.Group(),palm=new T.Group();hand.name='collection-right-hand';hand.visible=false;hand.add(palm);camera.add(hand);
 const glove=new T.MeshStandardMaterial({color:0x435249,roughness:.75}),cuff=new T.MeshStandardMaterial({color:0x65766b,roughness:.6,metalness:.15}),handResources=[glove,cuff];
 function makePalm(parent){
  const group=new T.Group();parent.add(group);const add=(geo,x,y,z,rx=0,rz=0,mat=glove)=>{const key=JSON.stringify([geo.type,geo.parameters,x,y,z,rx,rz]);const shared=handResources.find(r=>r.userData?.palmKey===key);if(shared){geo.dispose();geo=shared;}else{geo.userData.palmKey=key;handResources.push(geo);}const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,0,rz);group.add(m);return m;};
  const skin=new T.SphereGeometry(1,16,12);skin.scale(.043,.015,.050);add(skin,0,-.014,0);
  add(new T.CylinderGeometry(.026,.031,.16,12),0,-.025,.115,Math.PI/2,0,cuff);
  for(let i=0;i<4;i++){const x=-.030+i*.020,len=[.031,.044,.041,.029][i];add(new T.CapsuleGeometry(.008,len,4,8),x,-.007,-.045-len/2,Math.PI/2);add(new T.SphereGeometry(.0085,8,6),x,.001,-.049-len);}
  add(new T.CapsuleGeometry(.010,.029,4,8),.047,-.005,-.009,1.0,-.6);return group;
 }
 makePalm(palm);
 const trimmedHands=new WeakMap();
 function replaceClosedHand(arm){const changed=[];for(const mesh of arm?.children||[]){if(!mesh.isMesh||!mesh.name.startsWith('baked-'))continue;const original=mesh.geometry;original.computeBoundingBox();if(original.boundingBox.min.y>-.48)continue;let trimmed=trimmedHands.get(original);if(!trimmed){const source=original.index?original.toNonIndexed():original,p=source.attributes.position,keep=[];for(let i=0;i<p.count;i+=3)if((p.getY(i)+p.getY(i+1)+p.getY(i+2))/3>=-.475)keep.push(i,i+1,i+2);trimmed=new T.BufferGeometry();for(const [name,attr]of Object.entries(source.attributes)){const values=new attr.array.constructor(keep.length*attr.itemSize);for(let i=0;i<keep.length;i++)for(let j=0;j<attr.itemSize;j++)values[i*attr.itemSize+j]=attr.array[keep[i]*attr.itemSize+j];trimmed.setAttribute(name,new T.BufferAttribute(values,attr.itemSize,attr.normalized));}if(source!==original)source.dispose();trimmed.computeBoundingSphere();trimmedHands.set(original,trimmed);handResources.push(trimmed);}mesh.geometry=trimmed;changed.push({mesh,original});}return changed;}
 let own=null,ownId='';
 function receive(d){if(!d?.name||!d.item||!Array.isArray(d.item.parts)||d.item.parts.length>32)return;snapshots.set(d.name,{item:d.item,until:d.until});}
 function held(parent,item,scale){const model=createJadeCollectionModel(item);scale=Math.min(scale,.048/model.userData.radius);model.scale.setScalar(scale);if(['bangle','bracelet','peace'].includes(item.kind))model.rotation.x=-1.18;const box=new T.Box3().setFromObject(model);model.position.set(0,.012-box.min.y,-.012);model.userData.palmSupported=true;parent.add(model);return model;}
 function removeRemote(name){const old=remotes.get(name);if(!old)return;old.model.userData.dispose();old.group.removeFromParent();for(const {mesh,original}of old.closedHands||[])mesh.geometry=original;if(old.weapon)old.weapon.visible=true;if(old.arm)old.arm.rotation.copy(old.rotation);remotes.delete(name);}
 function local(p,name,suppressed=false){const now=Date.now(),entry=snapshots.get(name),valid=!suppressed&&p?.hp>0&&entry&&entry.until>now&&p.jadeDisplay?.id===entry.item.id;
  hand.visible=!!valid;if(!valid){if(own){own.userData.dispose();own=null;ownId=''}return false;}
  const key=entry.item.id+':'+entry.until;if(ownId!==key){own?.userData.dispose();own=held(palm,entry.item,1.5);ownId=key;}
  const elapsed=(6000-(entry.until-now))/1000,remaining=(entry.until-now)/1000,raise=Math.min(1,Math.max(0,elapsed/.35),Math.max(0,remaining/.35));hand.position.set(.16,-.12-(1-raise)*.22,-.38);hand.rotation.set(.03,-.10,-.025);return true;
 }
 function remote(actors){const now=Date.now();for(const [name,old]of remotes)if(!actors.has(name)||actors.get(name).mesh!==old.mesh)removeRemote(name);
  for(const [name,a]of actors){const entry=snapshots.get(name),valid=a.data.hp>0&&!a.form&&entry&&entry.until>now&&a.data.jadeDisplay?.id===entry.item.id;if(!valid){removeRemote(name);continue;}
   let record=remotes.get(name);if(record?.id!==entry.item.id||record?.until!==entry.until){removeRemote(name);const arm=a.mesh.userData.arms?.[1],group=new T.Group();(arm||a.mesh.userData.body||a.mesh).add(group);group.position.set(arm?0:.35,arm?-.55:1.2,0);const palm=makePalm(group);palm.scale.setScalar(1.35);const model=held(group,entry.item,1.3);record={id:entry.item.id,until:entry.until,mesh:a.mesh,group,model,arm,closedHands:replaceClosedHand(arm),rotation:arm?.rotation.clone(),weapon:a.mesh.userData.remoteWeapon};remotes.set(name,record);}
   record.weapon=a.mesh.userData.remoteWeapon;if(record.weapon)record.weapon.visible=false;const elapsed=(6000-(entry.until-now))/1000,remaining=(entry.until-now)/1000,raise=Math.min(1,Math.max(0,elapsed/.35),Math.max(0,remaining/.35));if(record.arm){record.arm.rotation.x=.15+.95*raise;record.arm.rotation.z=-.10*raise;}record.group.rotation.set(record.arm?-record.arm.rotation.x:0,0,record.arm?-record.arm.rotation.z:0);
  }
  for(const [name,entry]of snapshots)if(entry.until<=now)snapshots.delete(name);
 }
 function clear(){for(const name of [...remotes.keys()])removeRemote(name);snapshots.clear();own?.userData.dispose();own=null;ownId='';hand.visible=false;}
 return {receive,local,remote,removeRemote,clear,current(name){const d=snapshots.get(name);return d&&d.until>Date.now()?d.item:null;},cancel(name){snapshots.delete(name);},stats(){return {remote:remotes.size,local:!!own}},dispose(){clear();hand.removeFromParent();for(const r of handResources)r.dispose();}};
}
