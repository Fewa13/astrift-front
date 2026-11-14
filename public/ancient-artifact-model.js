// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as THREE from './three.module.js';

export function createArtifactModel(id,color,stage){
 const group=new THREE.Group();
 const metal=new THREE.MeshStandardMaterial({color,metalness:.7,roughness:.25,emissive:color,emissiveIntensity:.12+stage*.08});
 const core=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.18,emissive:color,emissiveIntensity:.55});
 function add(geometry,x,y,z,sx=1,sy=1,sz=1,material=metal){
  const mesh=new THREE.Mesh(geometry,material);
  mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);group.add(mesh);return mesh;
 }
 if(id==='void'){
  for(let i=0;i<5;i++)add(new THREE.OctahedronGeometry(.31),i%2*.14,i*.31-.62,0,.62,1.55,.28).rotation.z=-.28;
  add(new THREE.BoxGeometry(.85,.09,.18),0,-.77,0);
 }else if(id==='hourglass'){
  for(const side of [-1,1]){
   add(new THREE.ConeGeometry(.45,.72,20),0,side*.36,0,1,1,1,core).rotation.z=side>0?Math.PI:0;
   add(new THREE.CylinderGeometry(.54,.54,.12,24),0,side*.77,0);
  }
 }else if(id==='crown'){
  add(new THREE.TorusGeometry(.62,.12,8,36),0,-.2,0).rotation.x=Math.PI/2;
  for(let i=0;i<8;i++){const a=i*Math.PI/4;add(new THREE.ConeGeometry(.13,.68,5),Math.cos(a)*.58,.19,Math.sin(a)*.58);}
 }else{
  const geometry=id==='abyss'?new THREE.IcosahedronGeometry(.64,1):new THREE.OctahedronGeometry(.7,0);
  add(geometry,0,0,0,1,id==='abyss'?1:1.2,1,core);
  const count=id==='elements'?5:id==='divinity'?9:7;
  for(let i=0;i<count;i++){
   const a=i/count*Math.PI*2;
   add(new THREE.OctahedronGeometry(.15),Math.cos(a)*.83,.3*Math.sin(a*2),Math.sin(a)*.83,1,2,1);
  }
 }
 for(let i=0;i<stage-1;i++){
  const halo=add(new THREE.TorusGeometry(.86+i*.15,.021,6,44),0,0,0);
  halo.rotation.set(.5+i*.67,i*.85,.3);
 }
 return group;
}

export function previewArtifact(id,color,stage,host){
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1.6,.1,20);
 camera.position.set(2.5,1.55,4);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight(0xe4f3ff,0x53404d,2.4));
 const model=createArtifactModel(id,color,stage);scene.add(model);
 renderer.setSize(320,200);renderer.domElement.className='ancientArtifactCanvas';
 host.replaceChildren(renderer.domElement);
 let start=0;
 renderer.domElement.onpointerdown=e=>{start=e.clientX;renderer.domElement.setPointerCapture(e.pointerId);};
 renderer.domElement.onpointermove=e=>{if(renderer.domElement.hasPointerCapture(e.pointerId)){model.rotation.y+=(e.clientX-start)*.012;start=e.clientX;renderer.render(scene,camera);}};
 renderer.render(scene,camera);
 return ()=>{model.traverse(mesh=>{mesh.geometry?.dispose();mesh.material?.dispose();});renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
}
