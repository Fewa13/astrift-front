// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
import {FISH_SPECIES} from './ancient-leisure.js?v=20261021-skyreach-market-1';
// One reusable catch model; no per-catch geometry, textures or retained models.
export function createFishingCatch(scene){
 const group=new T.Group(),body=new T.Group(),tail=new T.Group(),sphere=new T.SphereGeometry(1,14,8),tri=new T.BufferGeometry();tri.setAttribute('position',new T.Float32BufferAttribute([0,0,0,-.5,.45,0,-.5,-.45,0],3));tri.computeVertexNormals();const skin=new T.MeshStandardMaterial({color:0x9ab9b1,metalness:.25,roughness:.45}),fin=new T.MeshStandardMaterial({color:0x657f77,side:T.DoubleSide,roughness:.6}),dark=new T.MeshBasicMaterial({color:0x142222});
 const mesh=(g,m,parent,x,y,z,sx,sy,sz)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o};
 mesh(sphere,skin,body,0,0,0,.48,.2,.13);mesh(sphere,skin,body,.38,.015,0,.16,.13,.115);for(const s of [-1,1]){mesh(sphere,dark,body,.4,.045,s*.105,.025,.025,.012);const p=mesh(tri,fin,body,.02,-.08,s*.1,.35,.35,.35);p.rotation.x=s*.9;}
 const dorsal=mesh(tri,fin,body,.1,.13,0,.6,.6,.6);dorsal.rotation.z=-Math.PI/2;tail.position.x=-.4;mesh(tri,fin,tail,0,0,0,.65,.65,.65);body.add(tail);group.add(body);scene.add(group);group.visible=false;let at=-10000,origin={x:0,z:0,y:0};
 return {show(key,weight,x,z,y=0){const f=FISH_SPECIES[key];if(!f)return;at=performance.now();origin={x,z,y};skin.color.setHex(f.color);fin.color.copy(skin.color).multiplyScalar(.65);const long=['eel','pike','sturgeon'].includes(f.shape);body.scale.set(long?1.5:1,long?.65:f.shape==='carp'?1.25:1,1);dorsal.scale.setScalar(f.shape==='perch'?.9:f.shape==='eel'?.2:.6);group.scale.setScalar(Math.min(1.1,.12+Math.cbrt(weight||1)*.2));},update(time,active){const t=(time-at)/1800;group.visible=active&&t>=0&&t<1;if(!group.visible)return;group.position.set(origin.x,origin.y+.25+Math.sin(t*Math.PI)*1.4,origin.z);group.rotation.set(.2*Math.sin(t*20),t*3,Math.sin(t*25)*.22);tail.rotation.y=Math.sin(t*45)*.55;}};
}
