// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from 'three';
import {jadeBlankPoint,JADE_BUDDHA_PARTS,JADE_BUDDHA_OUTLINE} from './craft.ts';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
// Vertices remain in the original stone's coordinates: the shader cannot reroll its texture.
export function jadeProductGeometry(blank,world=false){
 const b=blank;
 if(b.kind==='buddha'){
  const parts=JADE_BUDDHA_PARTS.map(([x,y,z,rx,ry,rz])=>{const g=new T.SphereGeometry(1,world?16:24,world?12:18),p=g.getAttribute('position');for(let i=0;i<p.count;i++){const px=(x+p.getX(i)*rx)*b.radius,py=(y+p.getY(i)*ry)*b.radius,t=(z-p.getZ(i)*rz)*b.depth;p.setXYZ(i,...b.point.map((c,k)=>c+b.u[k]*px+b.v[k]*py-b.normal[k]*t));}g.computeVertexNormals();return g;});
  const g=mergeGeometries(parts);for(const p of parts)p.dispose();g.setAttribute('jade',new T.Float32BufferAttribute(new Float32Array(g.getAttribute('position').count).fill(1),1));return g;
 }
 if(b.kind==='bead'){
  const g=new T.SphereGeometry(b.radius*.97,world?24:64,world?16:40),p=g.getAttribute('position'),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...b.normal));
  for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyQuaternion(q);v.add(new T.Vector3(...b.point)).addScaledVector(new T.Vector3(...b.normal),-b.depth/2);p.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();g.setAttribute('jade',new T.Float32BufferAttribute(new Float32Array(p.count).fill(1),1));return g;
 }
 const positions=[],indices=[],segments=world?64:96,profile=world?16:32,mid=(b.radius+b.inner)/2,half=(b.radius-b.inner)/2;
 for(let i=0;i<=segments;i++)for(let j=0;j<=profile;j++){
  const t=j/profile*Math.PI*2,c=Math.cos(t),s=Math.sin(t),r=mid+Math.sign(c)*Math.pow(Math.abs(c),.38)*half*.97,depth=b.depth/2+Math.sign(s)*Math.pow(Math.abs(s),.38)*b.depth*.47;
  positions.push(...jadeBlankPoint(b,r,depth,i/segments*Math.PI*2));
 }
 for(let i=0;i<segments;i++)for(let j=0;j<profile;j++){const a=i*(profile+1)+j,d=a+profile+1;indices.push(a,d,a+1,d,d+1,a+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();g.setAttribute('jade',new T.Float32BufferAttribute(new Float32Array(positions.length/3).fill(1),1));return g;
}
export function jadeCavityGeometry(b,openBottom=false){
 const p=[],segments=64,quad=(a,c,d,e)=>p.push(...a,...c,...d,...a,...d,...e);
 if(b.kind==='buddha'){
  const pt=(x,y,t)=>b.point.map((v,k)=>v+b.u[k]*x*b.radius+b.v[k]*y*b.radius-b.normal[k]*t);
  for(const [x,y,u,v]of JADE_BUDDHA_OUTLINE)quad(pt(x,y,0),pt(x,y,b.depth),pt(u,v,b.depth),pt(u,v,0));
  if(!openBottom)for(const [x,y,,rx,ry]of JADE_BUDDHA_PARTS)for(let i=0;i<64;i++){const a=i/64*Math.PI*2,c=(i+1)/64*Math.PI*2;p.push(...pt(x,y,b.depth),...pt(x+rx*Math.cos(a),y+ry*Math.sin(a),b.depth),...pt(x+rx*Math.cos(c),y+ry*Math.sin(c),b.depth));}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.computeVertexNormals();g.setAttribute('jade',new T.Float32BufferAttribute(new Float32Array(p.length/3).fill(1),1));return g;
 }
 for(let i=0;i<segments;i++){
  const x=i/segments*Math.PI*2,y=(i+1)/segments*Math.PI*2,pt=(r,t,a)=>jadeBlankPoint(b,r,t,a);
  quad(pt(b.radius,0,x),pt(b.radius,b.depth,x),pt(b.radius,b.depth,y),pt(b.radius,0,y));
  if(b.inner)quad(pt(b.inner,0,y),pt(b.inner,b.depth,y),pt(b.inner,b.depth,x),pt(b.inner,0,x));
  if(!openBottom)quad(pt(b.inner,b.depth,x),pt(b.radius,b.depth,x),pt(b.radius,b.depth,y),pt(b.inner,b.depth,y));
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.computeVertexNormals();g.setAttribute('jade',new T.Float32BufferAttribute(new Float32Array(p.length/3).fill(1),1));return g;
}
