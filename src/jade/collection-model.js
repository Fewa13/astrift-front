// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from 'three';
import {jadeQuality} from '../ancient-jade-quality.ts';
import {jadeProductGeometry,jadeCavityGeometry} from './craft-geometry.js';
import {jadeMillimeters,jadeCoverageAt,jadeFractures,fractureDistance} from './craft.ts';
import {jadePigment} from './varieties.ts';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createJadeProductMaterial} from './workshop3d.js';
export function createJadeCollectionModel(item){
 const root=new T.Group(),resources=[];root.name='jade-'+item.kind;root.userData.collectionId=item.id;root.userData.beadCount=item.kind==='bracelet'?item.parts.length:item.kind==='bead'?1:0;
 const radius=item.kind==='bracelet'?Math.max(.022,item.size*item.parts.length*1.04/(Math.PI*2*1000)):item.kind==='bangle'?(item.size/2+8)/1000:item.size/2000;
 for(let i=0;i<item.parts.length;i++){
  const part=item.parts[i],b=part.product.blank,center=new T.Vector3(...b.point).addScaledVector(new T.Vector3(...b.normal),-b.depth/2),holder=new T.Group(),mat=createJadeProductMaterial(part.jade,b,jadeQuality(part.product.quality??item.quality)),geo=jadeProductGeometry(b,true),mesh=new T.Mesh(geo,mat);
  mesh.position.copy(center).negate();holder.add(mesh);resources.push(geo,mat);
  if(b.kind==='bead'){const bore={...b,radius:b.radius*.11,inner:0},g=jadeCavityGeometry(bore,true),inner=new T.Mesh(g,mat);inner.position.copy(mesh.position);holder.add(inner);resources.push(g);}
  const angle=i/Math.max(1,item.parts.length)*Math.PI*2,target=item.kind==='bracelet'?new T.Vector3(-Math.sin(angle),Math.cos(angle),0):new T.Vector3(0,0,1);
  holder.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(...b.u),new T.Vector3(...b.v),new T.Vector3(...b.normal)).invert());holder.quaternion.premultiply(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),target));holder.scale.setScalar(jadeMillimeters(part.jade.weight)/1000);
  if(item.kind==='bracelet')holder.position.set(Math.cos(angle)*radius,Math.sin(angle)*radius,0);
  holder.userData.sourceProduct=part.product.id;root.add(holder);
 }
 if(item.kind==='bracelet'){const geo=new T.TorusGeometry(radius,.00065,6,Math.max(48,item.parts.length*4)),mat=new T.MeshStandardMaterial({color:0x826747,roughness:.85}),cord=new T.Mesh(geo,mat);root.add(cord);resources.push(geo,mat);}
 root.userData.radius=radius;root.userData.dispose=()=>{root.removeFromParent();for(const r of new Set(resources))r.dispose();};return root;
}
// Persistent equipment uses one draw call, including a twenty-bead bracelet.
// Bake source-space jade patterns once; do not run twenty procedural materials per player.
export function createJadeWearModel(item){
 const root=new T.Group(),geometries=[],radius=item.kind==='bracelet'?Math.max(.022,item.size*item.parts.length*1.04/(Math.PI*2*1000)):item.kind==='bangle'?(item.size/2+8)/1000:item.size/2000;
 for(let i=0;i<item.parts.length;i++){
  const part=item.parts[i],b=part.product.blank,jade=part.jade,fractures=jadeFractures(jade),phase=(jade.seed%997)/997*Math.PI*2,source=jadeProductGeometry(b,true),center=new T.Vector3(...b.point).addScaledVector(new T.Vector3(...b.normal),-b.depth/2),angle=i/Math.max(1,item.parts.length)*Math.PI*2,target=item.kind==='bracelet'?new T.Vector3(-Math.sin(angle),Math.cos(angle),0):new T.Vector3(0,0,1),q=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(...b.u),new T.Vector3(...b.v),new T.Vector3(...b.normal)).invert());
  q.premultiply(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),target));const scale=jadeMillimeters(jade.weight)/1000,position=item.kind==='bracelet'?new T.Vector3(Math.cos(angle)*radius,Math.sin(angle)*radius,0):new T.Vector3();
  const bake=g=>{const p=g.attributes.position,colors=[];for(let n=0;n<p.count;n++){const v=[p.getX(n),p.getY(n),p.getZ(n)],pigment=jadePigment(jade.variety,v,phase)||[.20,.42,.26],coverage=jade.grade>0?jadeCoverageAt(jade,v):0,fissure=fractures.some(f=>Math.abs(fractureDistance(f,v))<.005);for(let k=0;k<3;k++)colors.push(fissure?[.018,.027,.022][k]:[.43,.46,.38][k]*(1-coverage)+pigment[k]*(.75+(jade.color||0)*.25)*coverage);}g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setAttribute('jadeLustre',new T.Float32BufferAttribute(new Float32Array(p.count).fill((jadeQuality(part.product.quality??item.quality)-1)/7),1));g.translate(-center.x,-center.y,-center.z);g.applyQuaternion(q);g.scale(scale,scale,scale);g.translate(position.x,position.y,position.z);g.deleteAttribute('jade');g.deleteAttribute('uv');const flat=g.index?g.toNonIndexed():g;if(flat!==g)g.dispose();geometries.push(flat);};
  if(b.kind==='bead'){const p=source.attributes.position,index=source.index,indices=[];for(let n=0;n<index.count;n+=3){const ids=[index.getX(n),index.getX(n+1),index.getX(n+2)];if(ids.some(k=>{const v=new T.Vector3().fromBufferAttribute(p,k).sub(new T.Vector3(...b.point)),t=v.dot(new T.Vector3(...b.normal));return Math.sqrt(Math.max(0,v.lengthSq()-t*t))<b.radius*.11;}))continue;indices.push(...ids);}source.setIndex(indices);bake(jadeCavityGeometry({...b,radius:b.radius*.11,inner:0},true));}bake(source);
 }
 if(item.kind==='bracelet'){const cord=new T.TorusGeometry(radius,.00065,5,Math.max(48,item.parts.length*4)).toNonIndexed(),colors=new Float32Array(cord.attributes.position.count*3);for(let i=0;i<colors.length;i+=3)colors.set([.22,.14,.07],i);cord.deleteAttribute('uv');cord.setAttribute('color',new T.Float32BufferAttribute(colors,3));cord.setAttribute('jadeLustre',new T.Float32BufferAttribute(new Float32Array(cord.attributes.position.count),1));geometries.push(cord);}
 const geometry=mergeGeometries(geometries);for(const g of geometries)g.dispose();const grade=item.parts.reduce((n,p)=>n+p.jade.grade,0)/Math.max(1,item.parts.length),material=new T.MeshStandardMaterial({vertexColors:true,roughness:Math.max(.13,.46-grade*.055),metalness:.035,side:T.DoubleSide}),mesh=new T.Mesh(geometry,material);material.onBeforeCompile=shader=>{
  shader.vertexShader='attribute float jadeLustre;varying float vJadeLustre;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvJadeLustre=jadeLustre;');
  shader.fragmentShader='varying float vJadeLustre;\n'+shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.055,vJadeLustre);').replace('#include <opaque_fragment>',`vec3 jadeView=normalize(vViewPosition);float jadeRim=pow(1.-max(dot(normal,jadeView),0.),3.);vec3 jadeReflection=reflect(-jadeView,normal);float jadeRibbon=pow(max(0.,dot(jadeReflection,normalize(vec3(-.7,.6,1.)))),mix(24.,55.,vJadeLustre));float jadeFill=pow(max(0.,dot(jadeReflection,normalize(vec3(.65,.35,.9)))),48.);float jadeBand=exp(-pow((jadeReflection.x+.20)/.105,2.))*smoothstep(-.20,.65,jadeReflection.y);outgoingLight+=vJadeLustre*((jadeRibbon*1.4+jadeFill*.5+jadeBand*1.25)*vec3(.87,.96,1.)+diffuseColor.rgb*(jadeRim*.75+.22));\n#include <opaque_fragment>`);
 };material.customProgramCacheKey=()=> 'jade-quality-lustre-v1';mesh.userData.sourceProduct=item.parts[0]?.product.id;root.add(mesh);root.name='jade-'+item.kind;root.userData={collectionId:item.id,radius,beadCount:item.kind==='bracelet'?item.parts.length:item.kind==='bead'?1:0,sourceProducts:item.parts.map(p=>p.product.id),dispose(){root.removeFromParent();geometry.dispose();material.dispose();}};return root;
}
export function mountJadeCollectionPreview(host,item){
 const canvas=document.createElement('canvas');canvas.style.cssText='display:block;width:100%;height:230px;touch-action:none';canvas.setAttribute('aria-label','藏品预览 / Collection preview');host.append(canvas);
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(1);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,1,.001,10),model=createJadeCollectionModel(item);scene.add(model);const r=model.userData.radius+(item.kind==='bracelet'?item.size/2000:0);scene.add(new T.AmbientLight(0xffffff,2));let disposed=false,last=null,zoom=1;
 const draw=()=>{if(!disposed)renderer.render(scene,camera)},resize=()=>{if(disposed)return;const w=host.clientWidth||500;renderer.setSize(Math.min(700,w),230,false);camera.aspect=w/230;camera.position.z=Math.max(.012,r*3.8)*Math.max(1,230/w)*zoom;camera.updateProjectionMatrix();draw()};
 canvas.onpointerdown=e=>{last=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)};canvas.onpointermove=e=>{if(!last||!canvas.hasPointerCapture(e.pointerId))return;model.rotation.y+=(e.clientX-last[0])*.012;model.rotation.x+=(e.clientY-last[1])*.012;last=[e.clientX,e.clientY];draw()};canvas.onpointerup=canvas.onpointercancel=()=>last=null;
 const wheel=e=>{e.preventDefault();zoom=Math.max(.62,Math.min(2.5,zoom*Math.exp(e.deltaY*.001)));resize()};canvas.addEventListener('wheel',wheel,{passive:false});const observer=new ResizeObserver(resize);observer.observe(host);resize();
 return ()=>{disposed=true;observer.disconnect();canvas.removeEventListener('wheel',wheel);canvas.onpointerdown=canvas.onpointermove=canvas.onpointerup=canvas.onpointercancel=null;model.userData.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove()};
}
