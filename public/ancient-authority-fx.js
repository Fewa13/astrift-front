import {createTimeLordFX} from './ancient-time-lord-fx.js';
import {ancientMapHeight} from './ancient-rules.js';
import * as T from './three.module.js';
export function createAuthorityFX(scene,camera){
 const timeFX=createTimeLordFX(scene,camera);
 const world=new T.Group();scene.add(world);const ring=new T.TorusGeometry(1,.025,5,64),cut=new T.BoxGeometry(1,1,1),teal=new T.MeshBasicMaterial({color:0x8affdf}),violet=new T.MeshBasicMaterial({color:0xbbadff}),gold=new T.MeshBasicMaterial({color:0xf5cf7b});const dummy=new T.Object3D(),bursts=[];
 const fields=Array.from({length:12},(_,i)=>{const m=new T.Mesh(ring,i%2?gold:teal);world.add(m);m.visible=false;return m;});
 function effect(d,ground=()=>0){if(timeFX.effect(d,ground))return true;
  if(!['spacefracture','spacefold','spaceswap','spacecollapse'].includes(d.id))return false;
  const g=new T.Group(),time=d.id.startsWith('time'),low=camera.userData.renderPressure,groups=new Map();g.position.set(d.x,ground(d.x,d.z)+.5,d.z);
  const put=(geometry,material,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0)=>{const key=geometry.uuid+material.uuid;let batch=groups.get(key);if(!batch)groups.set(key,batch={geometry,material,list:[]});dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();batch.list.push(dummy.matrix.clone());};
  const circle=(x,y,z,r,rx=0,ry=0,rz=0)=>put(ring,time?gold:violet,x,y,z,r,r,r,rx,ry,rz);
  const blade=(x,y,z,length,rx=0,ry=0,rz=0)=>put(cut,time?teal:violet,x,y,z,.025,length,.06,rx,ry,rz);
  if(d.id==='spacefracture'){for(let i=0;i<7;i++)blade((i-3)*.2,1+(i-3)*.35,0,2.5,0,0,-.55);circle(0,1,0,1.8,0,Math.PI/2);}
  if(d.id==='spacefold'){for(const side of [-1,1]){for(let i=0;i<3;i++)circle(side*2,1,0,1+i*.15,0,side*.4,i*.2);for(let i=0;i<6;i++)blade(side*2,1,0,2.5,0,0,i*Math.PI/3);}blade(0,.2,0,4,0,0,Math.PI/2);}
  if(d.id==='spaceswap'){for(let i=0;i<12;i++){const a=i*Math.PI/6;blade(Math.sin(a)*1.2,.2,Math.cos(a)*1.2,2.2,Math.PI/2,a);}circle(0,.2,0,2,Math.PI/2);}
  if(d.id==='spacecollapse'){for(let i=0;i<3;i++)circle(0,1.5,0,2.2,i*Math.PI/3,i*Math.PI/3);for(const x of [-1.5,1.5])for(const z of [-1.5,1.5])blade(x,1.5,z,3);for(let i=0;i<12;i++){const a=i*Math.PI/6;blade(Math.cos(a)*2,1.5,Math.sin(a)*2,3,0,i*.3,.6);}}
  for(const b of groups.values()){const mesh=new T.InstancedMesh(b.geometry,b.material,b.list.length);b.list.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));mesh.computeBoundingSphere();g.add(mesh);}
  world.add(g);bursts.push({g,start:performance.now(),radius:d.radius||3,collapse:d.id==='spacecollapse'});while(bursts.length>(low?6:16)){const old=bursts.shift();world.remove(old.g);for(const mesh of old.g.children)mesh.dispose?.();}return true;
 }
 function updateFields(actors){timeFX.updateFields(actors);let index=0;for(const a of actors.filter(Boolean)){const r=a.skillRuntime?.authority,d=r?.domain;if(d&&d.id!=='timedominion'&&d.until>Date.now()){for(let i=0;i<3&&index<fields.length;i++){const m=fields[index++];m.visible=true;m.material=d.id.startsWith('time')?(i%2?gold:teal):violet;m.position.set(d.x,ancientMapHeight(r.map,d.x,d.z)+.15+i*.12,d.z);m.scale.setScalar(22-i*.7);m.rotation.set(Math.PI/2,0,Date.now()*.0001*(i%2?1:-1));}if(d.gates)for(const gate of d.gates)if(index<fields.length){const m=fields[index++];m.visible=true;m.material=violet;m.position.set(gate.x,ancientMapHeight(r.map,gate.x,gate.z)+2.2,gate.z);m.rotation.set(0,Date.now()*.0003,0);m.scale.setScalar(2.2);}}}for(;index<fields.length;index++)fields[index].visible=false;
 }
 return {effect,updateFields,update(time){timeFX.update(time);for(let i=bursts.length-1;i>=0;i--){const b=bursts[i],t=(time-b.start)/1000;if(t>1.1){world.remove(b.g);for(const mesh of b.g.children)mesh.dispose?.();bursts.splice(i,1);continue;}b.g.scale.setScalar(b.collapse?Math.max(.1,1-t*.8):.6+t*Math.min(4,b.radius)*.25);b.g.rotation.y=t;for(const m of b.g.children)m.rotation.z+=.02;}},clear(){timeFX.clear();for(const b of bursts){world.remove(b.g);for(const mesh of b.g.children)mesh.dispose?.();}bursts.length=0;fields.forEach(m=>m.visible=false);}};
}
