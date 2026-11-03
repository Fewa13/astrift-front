// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {communityModelParts} from './ancient-community-models.js';
import type {CommunityMap,MapObject} from './ancient-community';
import type {AmenityKind} from './ancient-amenity-defs';
export type AmenityAnchor={id:string;object:string;model:string;kind:AmenityKind;x:number;y:number;z:number;yaw:number;w:number;d:number};
const byMap=new WeakMap<CommunityMap,Map<string,MapObject>>();
const cache=new WeakMap<MapObject,AmenityAnchor[]>();
export function objectAmenities(o:MapObject){let anchors=cache.get(o);if(anchors)return anchors;anchors=[];const c=Math.cos(o.rotation),s=Math.sin(o.rotation);communityModelParts(o.model).forEach((p,index)=>{for(const [slot,use]of (p.uses||[]).entries()){const ry=p.ry||0,ox=(use.x||0)*p.w*o.w,oz=(use.z||0)*p.d*o.d,lx=p.x*o.w+Math.cos(ry)*ox-Math.sin(ry)*oz,lz=p.z*o.d+Math.sin(ry)*ox+Math.cos(ry)*oz;anchors!.push({id:o.id+':'+o.model+':'+index+':'+slot,object:o.id,model:o.model,kind:use.kind,x:o.x+c*lx-s*lz,y:o.y+(p.y+p.h/2+(use.y||0)*p.h)*o.h,z:o.z+s*lx+c*lz,yaw:Math.PI-o.rotation-ry,w:p.w*o.w,d:p.d*o.d*(use.depth||1)})}});cache.set(o,anchors);return anchors}
export function amenitiesNear(map:CommunityMap,p:{x:number;z:number},radius=5,limit=128){const found:AmenityAnchor[]=[];for(const o of map.objects){if(o.scriptHidden||Math.hypot(o.x-p.x,o.z-p.z)>radius+Math.hypot(o.w,o.d))continue;for(const a of objectAmenities(o))if(Math.hypot(a.x-p.x,a.z-p.z)<=radius)found.push(a)}return found.sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z)).slice(0,limit)}
export function findAmenity(map:CommunityMap,id:string){let index=byMap.get(map);if(!index){index=new Map(map.objects.map(o=>[o.id,o]));byMap.set(map,index)}const objId=id.split(':')[0],o=index.get(objId);return o&&!o.scriptHidden?objectAmenities(o).find(a=>a.id===id):undefined}
