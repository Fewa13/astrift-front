import {createTimeLordProjectile} from './ancient-time-lord-fx.js';
// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as THREE from './three.module.js';
export function createSkillProjectileFX(scene,camera){
 const active=[],up=new THREE.Vector3(0,1,0),forward=new THREE.Vector3(0,0,1);
 const ball=new THREE.IcosahedronGeometry(1,1),shard=new THREE.OctahedronGeometry(1,0),cone=new THREE.ConeGeometry(1,1,5),bar=new THREE.BoxGeometry(1,1,1);
 const ring=new THREE.TorusGeometry(1,.035,5,32),crescent=new THREE.TorusGeometry(1,.035,5,40,Math.PI*1.35);
 function release(v){v.presentation?.dispose();scene.remove(v.group);v.materials.forEach(m=>m.dispose());}
 function remove(id){let matched=false;for(let i=active.length-1;i>=0;i--)if(active[i].id===id){release(active[i]);active.splice(i,1);matched=true;}return matched;}
 function effect(d){
  if(d.phase==='flight-impact')return remove(d.projectile);
  if(d.phase!=='skill-flight'||!d.flight)return false;
  if(!d.source||!Array.isArray(d.direction)||d.direction.length!==3||![...d.direction,d.source.x,d.source.y,d.source.z].every(Number.isFinite))return true;
  const f=d.flight,group=new THREE.Group(),low=!!camera.userData.renderPressure;
  group.name='skill-flight-'+f.shape;group.userData.shape=f.shape;
  const materials=[f.color,f.trim].map((color,i)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity:i?.65:.85,depthWrite:false,side:THREE.DoubleSide}));
  const put=(geometry,index,x,y,z,sx,sy,sz)=>{const mesh=new THREE.Mesh(geometry,materials[index]);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);group.add(mesh);return mesh};
  const halo=(radius,z=0,index=0)=>put(ring,index,0,0,z,radius,radius,radius);
  const name=f.shape,radius=f.radius||.7;let presentation;
  const temporal=name.startsWith('time'),crystal=name.startsWith('crystal'),lightning=/thunder|lightning|storm/.test(name),earth=name.startsWith('stone')||name.startsWith('bone');
  if(name==='sovereign-time-needle'){presentation=createTimeLordProjectile(group,f,low);}else if((name.includes('crescent')||name.includes('double'))&&!temporal&&!crystal){
   const count=name.includes('double')?2:1;
   for(let i=0;i<count;i++){
    const blade=put(crescent,0,0,0,-i*.35,radius,radius,.3);blade.rotation.z=-.6+i*Math.PI;
    const edge=put(crescent,1,0,0,-.1-i*.35,radius*.94,radius*.94,.2);edge.rotation.z=blade.rotation.z;
   }
  }else if(crystal||name.includes('shard')||name.includes('lance')){
   const count=name.includes('double')?2:1;
   for(let i=0;i<count;i++){
    const tip=put(earth?cone:shard,0,(i-(count-1)/2)*.45,0,0,.3,.3,1.3+f.slot*.12);
    if(earth)tip.rotation.x=Math.PI/2;
    put(shard,1,(i-(count-1)/2)*.45,0,.18,.13,.13,.7);
   }
   if(lightning)for(let i=0;i<(low?3:6);i++){
    const stroke=put(bar,i%2,(i%2?1:-1)*.15,0,(i-2)*.23,.035,.035,.32);stroke.rotation.y=(i%2?1:-1)*.65;
   }
  }else if(name.includes('ring')||name.includes('sigil')||temporal||lightning){
   halo(radius);const inner=halo(radius*.72,.08,1);inner.rotation.z=.35;
   const count=name.includes('sigil')?8:4;
   for(let i=0;i<count;i++){
    const angle=i*Math.PI*2/count,node=put(bar,i%2,Math.cos(angle)*radius*.85,Math.sin(angle)*radius*.85,.02,.035,radius*.2,.025);node.rotation.z=angle-Math.PI/2;
   }
   if(temporal){const hand=put(bar,1,.15,0,.04,.45,.025,.025);hand.rotation.z=.5;put(bar,0,0,.2,.04,.025,.5,.025);}
   else put(ball,0,0,0,0,.2,.2,.2);
  }else{
   put(ball,0,0,0,0,radius*.65,radius*.65,radius*.9);
   const orbit=halo(radius,.02,1);orbit.rotation.y=.55;
   if(/flame|meteor|nether/.test(name))for(let i=0;i<(low?2:4);i++){
    const angle=i*2.4,flame=put(cone,i%2,Math.sin(angle)*.24,Math.cos(angle)*.24,-.5,.16,.75,.16);flame.rotation.x=-Math.PI/2;
   }
  }
  // Tapered echoes keep each projectile readable without broad opaque beams.
  for(let i=0;i<(low?1:2+f.slot%2);i++){
   const trail=put(shard,0,0,0,-.65-i*.35,.10-i*.02,.10-i*.02,.6);trail.userData.trail=true;
  }
  const direction=new THREE.Vector3().fromArray(d.direction).normalize();
  if(direction.lengthSq()<.5){materials.forEach(m=>m.dispose());return true;}
  group.quaternion.setFromUnitVectors(forward,direction);group.position.set(d.source.x,d.source.y,d.source.z);scene.add(group);
  const range=Math.max(1,Math.min(100,d.level||60)),speed=f.speed||40;
  active.push({id:d.projectile,group,materials,start:group.position.clone(),direction,range,speed,at:performance.now(),life:range/speed*1000,presentation,spin:!presentation&&!name.includes('crescent')&&!name.includes('lance')&&!earth});
  while(active.length>(low?14:32))release(active.shift());return true;
 }
 function update(now){for(let i=active.length-1;i>=0;i--){const v=active[i],age=now-v.at;if(age>=v.life){release(v);active.splice(i,1);continue;}v.presentation?.update(now);v.group.position.copy(v.start).addScaledVector(v.direction,Math.min(v.range,Math.max(0,age)*v.speed/1000));if(v.spin)v.group.rotateZ(.012);v.materials.forEach((m,i)=>m.opacity=(i?.65:.85)*Math.min(1,(v.life-age)/140));}}
 return {effect,update,clear(){active.splice(0).forEach(release)},dispose(){active.splice(0).forEach(release);for(const g of [ball,shard,cone,bar,ring,crescent])g.dispose()}};
}
