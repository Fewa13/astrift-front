// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as THREE from './three.module.js';
import {flyingSwordGeometry,flyingSwordMaterial} from './ancient-flying-sword.js';
export function createSwordForm(){
 const group=new THREE.Group(),sword=new THREE.Mesh(flyingSwordGeometry,flyingSwordMaterial);
 sword.scale.setScalar(1.65);sword.rotation.x=Math.PI/2;sword.position.y=1;group.add(sword);group.userData.height=2;
 return group;
}
export function createSwordReworkFX(scene,camera){
 const active=[],points=[];
 for(let i=-3;i<=3;i++){points.push(-3,i,0,3,i,0,i,-3,0,i,3,0);}
 const net=new THREE.BufferGeometry();net.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
 const wave=new THREE.BufferGeometry().setFromPoints(Array.from({length:33},(_,i)=>{const t=(i/32-.5)*2;return new THREE.Vector3(t*2.8,Math.sqrt(Math.max(0,1-t*t))*.65,0)}));
 function release(v){scene.remove(v.group);v.group.traverse(n=>{if(n.material)n.material.dispose()});}
 function effect(d){
  if(d.projectile&&['blade-cut','flight-impact'].includes(d.phase)){for(let i=active.length-1;i>=0;i--)if(active[i].projectile===d.projectile){release(active[i]);active.splice(i,1);}}
  if(d.phase==='flight-impact')return true;
  if(!['blade-net','blade-wave','blade-cut','free-flight'].includes(d.phase))return false;
  const start=d.source||{x:d.x,y:1,z:d.z},cut=d.phase==='blade-cut',isNet=d.phase==='blade-net'||cut;
  const group=new THREE.Group(),material=new THREE.LineBasicMaterial({color:isNet?0x65ffae:0xc2ffe9,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending});
  const shape=isNet?new THREE.LineSegments(net,material):new THREE.Line(wave,material);group.add(shape);
  if(isNet){const inner=new THREE.LineSegments(net,material.clone());inner.scale.setScalar(.96);inner.rotation.z=Math.PI/4;group.add(inner);group.scale.setScalar((d.radius||3)/3);}
  else{const echo=new THREE.Line(wave,material.clone());echo.position.z=.18;echo.scale.set(.94,.8,1);group.add(echo);}
  const range=d.level||60,dx=d.x-start.x,dz=d.z-start.z,length=Math.hypot(dx,dz),direction=new THREE.Vector3(dx,0,dz).normalize();
  // Horizontal range determines elevation from the actual camera pitch for local casts.
  const owner=camera.userData.localName,local=d.owner===owner;
  if(!cut&&Array.isArray(d.direction)){direction.fromArray(d.direction).normalize();}else if(!cut&&local){camera.getWorldDirection(direction);}else if(!cut){direction.y=Math.sqrt(Math.max(0,1-(length/range)**2))*(d.y>start.y?1:0);direction.normalize();}
  group.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),direction.lengthSq()?direction:new THREE.Vector3(0,0,1));
  group.position.set(start.x,start.y,start.z);scene.add(group);
  const now=performance.now();active.push({projectile:d.projectile,group,start:new THREE.Vector3(start.x,start.y,start.z),direction,range,at:now,cut,life:cut?(d.level||4)*1000:range/36*1000});
  while(active.length>(camera.userData.renderPressure?12:28))release(active.shift());return true;
 }
 function update(now){for(let i=active.length-1;i>=0;i--){const v=active[i],age=now-v.at;if(age>=v.life){release(v);active.splice(i,1);continue;}if(!v.cut)v.group.position.copy(v.start).addScaledVector(v.direction,Math.min(v.range,age*.036));else v.group.rotation.z+=.035;v.group.children.forEach(n=>n.material.opacity=(v.cut?.65+.3*Math.sin(age*.035):.95)*Math.min(1,(v.life-age)/180));}}
 return {effect,update,clear(){active.splice(0).forEach(release)},dispose(){active.splice(0).forEach(release);net.dispose();wave.dispose()}};
}
