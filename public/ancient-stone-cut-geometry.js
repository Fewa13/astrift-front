// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
// Clip the existing triangles and cap the actual intersection ring, in rock-local space.
export function splitStoneGeometry(source,plane){
 const input=source.index?source.toNonIndexed():source,a=input.attributes.position,points=new Map(),sides=[];
 for(const side of [-1,1]){const vertices=[];for(let i=0;i<a.count;i+=3){const polygon=[];for(let j=0;j<3;j++){const p=new T.Vector3().fromBufferAttribute(a,i+j),q=new T.Vector3().fromBufferAttribute(a,i+(j+1)%3),d=plane.distanceToPoint(p)*side,e=plane.distanceToPoint(q)*side;if(d>=0)polygon.push(p);if((d>=0)!==(e>=0)){const edge=p.clone().lerp(q,d/(d-e));polygon.push(edge);points.set(edge.toArray().map(v=>Math.round(v*1e5)).join(','),edge);}}for(let j=1;j<polygon.length-1;j++)vertices.push(...polygon[0].toArray(),...polygon[j].toArray(),...polygon[j+1].toArray());}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.computeVertexNormals();sides.push(g);}
 if(input!==source)input.dispose();const ring=[...points.values()],center=new T.Vector3();for(const p of ring)center.add(p);center.divideScalar(Math.max(1,ring.length));const u=new T.Vector3().crossVectors(plane.normal,Math.abs(plane.normal.y)<.9?new T.Vector3(0,1,0):new T.Vector3(1,0,0)).normalize(),v=new T.Vector3().crossVectors(plane.normal,u);ring.sort((a,b)=>Math.atan2(a.clone().sub(center).dot(v),a.clone().sub(center).dot(u))-Math.atan2(b.clone().sub(center).dot(v),b.clone().sub(center).dot(u)));
 const vertices=[];for(let i=0;i<ring.length;i++)vertices.push(...center.toArray(),...ring[i].toArray(),...ring[(i+1)%ring.length].toArray());const cap=new T.BufferGeometry();cap.setAttribute('position',new T.Float32BufferAttribute(vertices,3));cap.computeVertexNormals();return {sides,cap,ring,center,u,v};
}
export function stonePlaneFromStroke(start,end,camera,root,mesh,width,height){
 if(Math.hypot(end.x-start.x,end.y-start.y)<Math.max(28,Math.min(width,height)*.09))throw Error('short');
 const raycaster=new T.Raycaster(),ndc=p=>new T.Vector2(p.x/width*2-1,1-p.y/height*2);root.updateMatrixWorld(true);camera.updateMatrixWorld(true);let hits=0;
 for(let i=0;i<=24;i++){raycaster.setFromCamera(ndc({x:start.x+(end.x-start.x)*i/24,y:start.y+(end.y-start.y)*i/24}),camera);if(raycaster.intersectObject(mesh,false).length)hits++;}if(hits<3)throw Error('miss');
 raycaster.setFromCamera(ndc(start),camera);const origin=raycaster.ray.origin.clone(),a=raycaster.ray.direction.clone();raycaster.setFromCamera(ndc(end),camera);const normal=new T.Vector3().crossVectors(a,raycaster.ray.direction).normalize();const plane=new T.Plane().setFromNormalAndCoplanarPoint(normal,origin).applyMatrix4(root.matrixWorld.clone().invert()).normalize();return {normal:plane.normal.toArray(),constant:plane.constant};
}
