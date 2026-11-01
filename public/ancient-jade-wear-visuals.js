// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
import {createJadeWearModel} from './ancient-collection-model.js?v=20261025-quality-lustre-1';
import {equippedJade} from './ancient-collections.js?v=20261021-jade-wear-1';
export function createJadeWearVisuals(camera){
 const snapshots=new Map(),records=new Map(),ownBody=new T.Group();ownBody.name='worn-jade-body';camera.parent.add(ownBody);
 const cordMaterial=new T.LineBasicMaterial({color:0x927b50}),viewDirection=new T.Vector3();let own={};
 function receive(d){if(!d?.name||!d.items)return;snapshots.set(d.name,d.items);}
 function disposeRecord(r){if(!r)return;r.model.userData.dispose();r.cord?.geometry.dispose();r.cord?.removeFromParent();}
 function create(parent,item,slot,local=false){
  const model=createJadeWearModel(item),r=model.userData.radius;model.name='worn-jade-'+slot;model.userData.wearId=item.id;
  model.scale.setScalar((slot==='chest'?.045:local?(item.kind==='bracelet'?.070:.085):(item.kind==='bracelet'?.100:.105))/Math.max(.001,r));
  let cord=null;if(slot==='wrist'){model.rotation.x=Math.PI/2;model.position.set(local?0:0,local?-.17:-.47,local?.04:-.025);}
  else{model.rotation.y=Math.PI;model.position.set(0,1.25,-.34);const geometry=new T.BufferGeometry().setFromPoints([new T.Vector3(-.12,1.63,-.20),new T.Vector3(0,1.29,-.34),new T.Vector3(.12,1.63,-.20)]);cord=new T.Line(geometry,cordMaterial);cord.name='jade-necklace-cord';parent.add(cord);}
  parent.add(model);return {id:item.id,key:item.id+':'+item.parts.map(p=>p.product.quality||item.quality||1).join(','),parent,model,cord};
 }
 function sync(record,items,parents,local=false){for(const slot of ['wrist','chest']){const item=items[slot],parent=parents[slot],old=record[slot],key=item&&item.id+':'+item.parts.map(p=>p.product.quality||item.quality||1).join(',');if(old&&(old.key!==key||old.parent!==parent)){disposeRecord(old);delete record[slot];}if(item&&parent&&!record[slot])record[slot]=create(parent,item,slot,local);}}
 function local(profile,player){const visible=!!profile&&player?.hp>0&&!player.skillRuntime?.bossForm&&!(player.skillRuntime?.effects?.transform?.until>Date.now());camera.getWorldDirection(viewDirection);ownBody.visible=false;const wrist=camera.getObjectByName('melee-wrist');sync(own,visible?equippedJade(profile):{},{wrist,chest:null},true);camera.getWorldPosition(ownBody.position);ownBody.position.y-=1.7;ownBody.rotation.set(0,player?.yaw||0,0);}
 function removeRemote(name){const r=records.get(name);if(r){for(const slot of ['wrist','chest'])disposeRecord(r[slot]);records.delete(name);}}
 function remote(actors){for(const name of records.keys())if(!actors.has(name))removeRemote(name);for(const [name,a]of actors){let record=records.get(name);if(record?.mesh!==a.mesh){removeRemote(name);record={mesh:a.mesh};records.set(name,record);}const snapshot=snapshots.get(name)||{},items={};if(a.data.hp>0&&!a.form)for(const slot of ['wrist','chest'])if(snapshot[slot]?.id===a.data.jadeWear?.[slot])items[slot]=snapshot[slot];sync(record,items,{wrist:a.mesh.userData.arms?.[1],chest:a.mesh.userData.body||a.mesh});}}
 function clear(){for(const name of [...records.keys()])removeRemote(name);for(const slot of ['wrist','chest']){disposeRecord(own[slot]);delete own[slot];}snapshots.clear();ownBody.visible=false;}
 return {receive,local,remote,removeRemote,clear,stats(){return {remote:records.size,local:Object.keys(own).length}},dispose(){clear();ownBody.removeFromParent();cordMaterial.dispose();}};
}
