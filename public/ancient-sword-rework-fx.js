// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as THREE from './three.module.js';
import {flyingSwordGeometry,flyingSwordMaterial} from './ancient-flying-sword.js';
const groundNetVertices=[];
for(let i=-8;i<=8;i++){
 const z=i/8,extent=Math.sqrt(Math.max(0,1-z*z));
 groundNetVertices.push(-extent,.015,z,extent,.015,z,z,.015,-extent,z,.015,extent);
}
const groundNetGeometry=new THREE.BufferGeometry();groundNetGeometry.setAttribute('position',new THREE.Float32BufferAttribute(groundNetVertices,3));
const groundNetRing=new THREE.TorusGeometry(1,.008,4,64);
export function createGroundBladeNet(radius=5){
 const group=new THREE.Group();group.name='ground-blade-net';group.userData.radius=radius;
 const lines=new THREE.LineSegments(groundNetGeometry,new THREE.LineBasicMaterial({color:0x45d995,transparent:true,opacity:.6,depthWrite:false}));group.add(lines);
 const rim=new THREE.Mesh(groundNetRing,new THREE.MeshBasicMaterial({color:0x8feab8,transparent:true,opacity:.8,depthWrite:false}));rim.rotation.x=-Math.PI/2;rim.position.y=.03;group.add(rim);
 const inner=rim.clone();inner.material=rim.material.clone();inner.material.opacity=.35;inner.scale.setScalar(.94);group.add(inner);
 group.scale.setScalar(radius);return group;
}
export function releaseGroundBladeNet(group){group.removeFromParent();group.traverse(n=>n.material?.dispose());}
export function createSwordForm(){
 const group=new THREE.Group(),sword=new THREE.Mesh(flyingSwordGeometry,flyingSwordMaterial);
 sword.scale.setScalar(1.65);sword.rotation.x=Math.PI/2;sword.position.y=1;group.add(sword);group.userData.height=2;
 return group;
}
export function createSwordReworkFX(scene,camera){
 const active=[],points=[];
 for(let i=-3;i<=3;i++){points.push(-3,i,0,3,i,0,i,-3,0,i,3,0);}
 const net=new THREE.BufferGeometry();net.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
 // Same crescent geometry and emerald palette as Swordmaster's swordwave.
 const wave=new THREE.TorusGeometry(1,.075,5,40,Math.PI*1.35);
 function release(v){scene.remove(v.group);v.group.traverse(n=>{if(n.material)n.material.dispose()});}
 function effect(d){
  if(d.projectile&&['blade-cut','blade-field','flight-impact'].includes(d.phase)){for(let i=active.length-1;i>=0;i--)if(active[i].projectile===d.projectile){release(active[i]);active.splice(i,1);}}
  if(d.phase==='flight-impact')return true;
  if(d.phase==='blade-field'){const group=createGroundBladeNet(d.radius||5);group.position.set(d.x,d.source?.y??.1,d.z);scene.add(group);active.push({projectile:d.projectile,group,at:performance.now(),cut:true,ground:true,life:(d.level||4)*1000});while(active.length>(camera.userData.renderPressure?12:28))release(active.shift());return true;}
  if(!['blade-net','blade-wave','blade-cut'].includes(d.phase))return false;
  const start=d.source||{x:d.x,y:1,z:d.z},cut=d.phase==='blade-cut',isNet=d.phase==='blade-net'||cut;
  const group=new THREE.Group(),material=new THREE.LineBasicMaterial({color:isNet?0x65ffae:0xc2ffe9,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending});
  const shape=isNet?new THREE.LineSegments(net,material):new THREE.Mesh(wave,new THREE.MeshBasicMaterial({color:0x68ff9b,transparent:true,opacity:.95,depthWrite:false,blending:THREE.AdditiveBlending}));if(!isNet){material.dispose();shape.scale.set(2.8,2.8,.6);shape.rotation.z=-.6;}group.add(shape);
  if(isNet){const inner=new THREE.LineSegments(net,material.clone());inner.scale.setScalar(.96);inner.rotation.z=Math.PI/4;group.add(inner);group.scale.setScalar((d.radius||3)/3);}
  else{for(let i=0;i<3;i++){const echo=new THREE.Mesh(wave,shape.material.clone());echo.material.color.set(i?0x22ed70:0xe5ffed);echo.position.z=-i*.32;echo.rotation.z=-.6+i*.035;echo.scale.set(2.8-i*.18,2.8-i*.18,i?.32:.16);group.add(echo);}}
  const range=d.level||60,dx=d.x-start.x,dz=d.z-start.z,length=Math.hypot(dx,dz),direction=new THREE.Vector3(dx,0,dz).normalize();
  // Horizontal range determines elevation from the actual camera pitch for local casts.
  const owner=camera.userData.localName,local=d.owner===owner;
  if(!cut&&Array.isArray(d.direction)){direction.fromArray(d.direction).normalize();}else if(!cut&&local){camera.getWorldDirection(direction);}else if(!cut){direction.y=Math.sqrt(Math.max(0,1-(length/range)**2))*(d.y>start.y?1:0);direction.normalize();}
  group.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),direction.lengthSq()?direction:new THREE.Vector3(0,0,1));
  group.position.set(start.x,start.y,start.z);scene.add(group);
  const speed=d.phase==='blade-wave'?72:d.phase==='free-flight'?40:36;
  const now=performance.now();active.push({projectile:d.projectile,group,start:new THREE.Vector3(start.x,start.y,start.z),direction,range,speed,at:now,cut,life:cut?(d.level||4)*1000:range/speed*1000});
  while(active.length>(camera.userData.renderPressure?12:28))release(active.shift());return true;
 }
 function update(now){for(let i=active.length-1;i>=0;i--){const v=active[i],age=now-v.at;if(age>=v.life){release(v);active.splice(i,1);continue;}if(!v.cut)v.group.position.copy(v.start).addScaledVector(v.direction,Math.min(v.range,age*v.speed/1000));else if(!v.ground)v.group.rotation.z+=.035;v.group.children.forEach(n=>n.material.opacity=(v.cut?.65+.3*Math.sin(age*.035):.95)*Math.min(1,(v.life-age)/180));}}
 return {effect,update,clear(){active.splice(0).forEach(release)},dispose(){active.splice(0).forEach(release);net.dispose();wave.dispose()}};
}
