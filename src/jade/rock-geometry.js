// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Ported from Felix’s jade-night-market; market and account systems excluded.
import * as T from 'three';
import {inJadeBlank} from './craft.ts';
import {phase3D,volumeSample3D} from './stone-core.js';
import {mergeVertices,mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
export const phaseOf=phase3D;
export function createRockGeometry(a){
 const g=new T.IcosahedronGeometry(1,14),p=g.getAttribute('position'),phase=phaseOf(a);
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
  const d=1+.065*Math.sin(x*4+y*3+phase)*Math.cos(z*4-phase)+.045*Math.cos(y*6-z*3+phase)+.025*Math.sin(z*9+x*5);
  p.setXYZ(i,x*d*1.42,y*d*1.04,z*d*.96);
 }
 g.deleteAttribute('normal');g.deleteAttribute('uv');const smooth=mergeVertices(g,1e-5);g.dispose();smooth.computeVertexNormals();smooth.setAttribute('jade',new T.Float32BufferAttribute(new Float32Array(smooth.getAttribute('position').count),1));return smooth;
}
function polygonClip(vertices,plane,sign){
 const result=[];
 for(let i=0;i<vertices.length;i++){
  const a=vertices[i],b=vertices[(i+1)%vertices.length],da=plane.distanceToPoint(a.p)*sign,db=plane.distanceToPoint(b.p)*sign;
  if(da>=-1e-7)result.push(a);
  if((da>0&&db<0)||(da<0&&db>0)){
   const t=da/(da-db);result.push({p:a.p.clone().lerp(b.p,t),n:a.n.clone().lerp(b.n,t).normalize(),face:a.face+(b.face-a.face)*t,edge:true});
  }
 }
 return result;
}
function buffer(positions,normals,jade=null){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('jade',new T.Float32BufferAttribute(jade??new Float32Array(positions.length/3),1));g.computeBoundingSphere();return g;}
export function splitRockGeometry(source,plane){
 const g=source.index?source.toNonIndexed():source,p=g.getAttribute('position'),n=g.getAttribute('normal'),j=g.getAttribute('jade');
 const sides=[{positions:[],normals:[],jade:[]},{positions:[],normals:[],jade:[]}],points=new Map();
 for(let i=0;i<p.count;i+=3){
  const tri=[0,1,2].map(j=>({p:new T.Vector3().fromBufferAttribute(p,i+j),n:new T.Vector3().fromBufferAttribute(n,i+j),face:g.getAttribute('jade')?.getX(i+j)??0}));
  [1,-1].forEach((sign,k)=>{
   const polygon=polygonClip(tri,plane,sign);
   for(const v of polygon)if(v.edge||Math.abs(plane.distanceToPoint(v.p))<1e-6)points.set(v.p.toArray().map(x=>Math.round(x*1e5)).join(','),v.p);
   for(let j=1;j<polygon.length-1;j++)for(const v of [polygon[0],polygon[j],polygon[j+1]]){sides[k].positions.push(...v.p.toArray());sides[k].normals.push(...v.n.toArray());sides[k].jade.push(v.face);}
  });
 }
 if(g!==source)g.dispose();
 const ring=[...points.values()],center=new T.Vector3();for(const v of ring)center.add(v);if(ring.length)center.divideScalar(ring.length);
 const u=new T.Vector3().crossVectors(plane.normal,Math.abs(plane.normal.y)<.9?new T.Vector3(0,1,0):new T.Vector3(1,0,0)).normalize(),v=new T.Vector3().crossVectors(plane.normal,u);
 ring.sort((a,b)=>Math.atan2(a.clone().sub(center).dot(v),a.clone().sub(center).dot(u))-Math.atan2(b.clone().sub(center).dot(v),b.clone().sub(center).dot(u)));
 const caps=[[],[]],capNormals=[[],[]];
 for(let i=0;i<ring.length;i++){
  const a=ring[i],b=ring[(i+1)%ring.length];
  [[center,b,a],[center,a,b]].forEach((tri,k)=>{for(const p of tri){caps[k].push(...p.toArray());capNormals[k].push(...plane.normal.clone().multiplyScalar(k===0?-1:1).toArray());}});
 }
 return {positive:buffer(sides[0].positions,sides[0].normals,sides[0].jade),negative:buffer(sides[1].positions,sides[1].normals,sides[1].jade),capPositive:buffer(caps[0],capNormals[0],new Float32Array(caps[0].length/3).fill(1)),capNegative:buffer(caps[1],capNormals[1],new Float32Array(caps[1].length/3).fill(1)),ring,center};
}
export function planeFromStroke(start,end,quaternion,halfWidth=2.15,halfHeight=2.15/1.5){
 const a=new T.Vector3((start.x-.5)*halfWidth*2,(.5-start.y)*halfHeight*2,0),b=new T.Vector3((end.x-.5)*halfWidth*2,(.5-end.y)*halfHeight*2,0);
 const direction=b.clone().sub(a).normalize();if(a.distanceTo(b)<.16)throw Error('切线太短，请划过石头画一条长一点的线。');
 const normal=new T.Vector3(-direction.y,direction.x,0),inverse=quaternion.clone().invert();
 normal.applyQuaternion(inverse);a.applyQuaternion(inverse);
 return new T.Plane().setFromNormalAndCoplanarPoint(normal,a);
}
export const volumeAt=volumeSample3D;

export function closeHalf(split,side){return mergeGeometries(side===1?[split.positive,split.capPositive]:[split.negative,split.capNegative]);}
export function disposeSplit(split){for(const key of ['positive','negative','capPositive','capNegative'])split[key].dispose();}
export function fragmentGeometry(original,path){
 let current=original.clone();
 for(const p of path){const split=splitRockGeometry(current,new T.Plane(new T.Vector3().fromArray(p.normal),p.constant)),next=closeHalf(split,p.side);current.dispose();disposeSplit(split);current=next;}
 return current;
}
// Clip cavity walls without capping them: the cut face must keep the void open.
export function fragmentSurfaceGeometry(original,path){let current=original.clone();for(const p of path){const split=splitRockGeometry(current,new T.Plane(new T.Vector3().fromArray(p.normal),p.constant)),next=(p.side===1?split.positive:split.negative).clone();current.dispose();disposeSplit(split);current=next;}return current;}
// Subdivide each tetrahedron once, then apply the degree-two four-point rule.
const tetraVertices=[[0,0,0],[1,0,0],[0,1,0],[0,0,1],[.5,0,0],[0,.5,0],[0,0,.5],[.5,.5,0],[.5,0,.5],[0,.5,.5]];
const tetraCells=[[0,4,5,6],[4,1,7,8],[5,7,2,9],[6,8,9,3],[4,5,6,9],[4,5,7,9],[4,7,8,9],[4,6,8,9]];
const volumeQuadrature=tetraCells.flatMap(cell=>[0,1,2,3].map(k=>{const w=[0,0,0];for(let j=0;j<4;j++)for(let axis=0;axis<3;axis++)w[axis]+=tetraVertices[cell[j]][axis]*(k===j?.5854101966249685:.1381966011250105);return w;}));
export function measureGeometry(geometry,a,holes=[]){
 const g=geometry.index?geometry.toNonIndexed():geometry,position=g.getAttribute('position');
 geometry.computeBoundingBox();const center=geometry.boundingBox.getCenter(new T.Vector3());let volume=0,jade=0;
 const A=new T.Vector3(),B=new T.Vector3(),C=new T.Vector3(),cross=new T.Vector3(),point=new T.Vector3();
 // Four-point tetrahedron quadrature samples the same coverage field as the shader.
 // One centroid sample systematically over-counted jade concentrated at the centre.
 for(let i=0;i<position.count;i+=3){
  A.fromBufferAttribute(position,i).sub(center);B.fromBufferAttribute(position,i+1).sub(center);C.fromBufferAttribute(position,i+2).sub(center);
  const weight=Math.abs(A.dot(cross.crossVectors(B,C)))/6;
  let coverage=0,available=holes.length?0:volumeQuadrature.length;
  if(a.grade===0&&!holes.length)coverage=volumeQuadrature.length;
  else for(const q of volumeQuadrature){point.copy(A).multiplyScalar(q[0]).addScaledVector(B,q[1]).addScaledVector(C,q[2]).add(center);if(holes.length){if(holes.some(h=>inJadeBlank(h,[point.x,point.y,point.z])))continue;available++;}coverage+=a.grade===0?1:volumeAt(a,point).coverage;}
  volume+=weight*available/volumeQuadrature.length;jade+=weight*coverage/volumeQuadrature.length;
 }
 if(g!==geometry)g.dispose();return {volume,jade};
}
export function splitShares(split,a,holes=[]){
 const geos=[closeHalf(split,1),closeHalf(split,-1)],m=geos.map(g=>measureGeometry(g,a,holes));geos.forEach(g=>g.dispose());
 const share=key=>{const total=m[0][key]+m[1][key];const p=total>1e-8?Math.min(.998,Math.max(.002,m[0][key]/total)):.5;return [p,1-p];};
 return {massShares:share('volume'),jadeShares:share('jade')};
}
