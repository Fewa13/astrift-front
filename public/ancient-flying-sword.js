// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as THREE from './three.module.js';

const positions=[],colors=[];
function piece(geometry,color,y){
 geometry.translate(0,y,0);
 const vertices=geometry.index?geometry.toNonIndexed():geometry;
 const tint=new THREE.Color(color);
 for(const value of vertices.attributes.position.array)positions.push(value);
 for(let i=0;i<vertices.attributes.position.count;i++)colors.push(tint.r,tint.g,tint.b);
 if(vertices!==geometry)vertices.dispose();
 geometry.dispose();
}

piece(new THREE.BoxGeometry(.31,1.25,.075),0xb5dfca,.49);
piece(new THREE.BoxGeometry(.09,1.16,.09),0xf0fff6,.49);
piece(new THREE.ConeGeometry(.16,.35,4).scale(1,1,.27).rotateY(Math.PI/4),0xe1ffed,1.27);
piece(new THREE.BoxGeometry(.68,.115,.17),0xbf9852,-.17);
piece(new THREE.CylinderGeometry(.074,.078,.36,8),0x283f38,-.36);
piece(new THREE.OctahedronGeometry(.12),0xbf9852,-.57);

export const flyingSwordGeometry=new THREE.BufferGeometry();
flyingSwordGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
flyingSwordGeometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
flyingSwordGeometry.computeVertexNormals();
export const flyingSwordMaterial=new THREE.MeshStandardMaterial({vertexColors:true,metalness:.38,roughness:.32,emissive:0x507d69,emissiveIntensity:.45});

function swordVariant({width,length,curve,guard,edge}){
 const geometry=flyingSwordGeometry.clone();
 const points=geometry.attributes.position,color=geometry.attributes.color,tint=new THREE.Color(edge);
 for(let i=0;i<points.count;i++){
  const y=points.getY(i),blade=y>.01;
  const bow=blade?Math.max(0,y)**2*curve:0;
  points.setXYZ(i,points.getX(i)*(blade?width:guard)+bow,y*(blade?length:1),points.getZ(i)*(blade?width:1));
  if(blade)color.setXYZ(i,tint.r,tint.g,tint.b);
 }
 geometry.computeVertexNormals();
 return geometry;
}

export const swordWaveGeometry=swordVariant({width:.73,length:1.13,curve:.18,guard:.72,edge:0xe6ffee});
export const swordRainGeometry=swordVariant({width:.53,length:1.45,curve:0,guard:.6,edge:0x99d2b6});
export const tripleCutGeometry=swordVariant({width:1.38,length:1.17,curve:.025,guard:1.32,edge:0xe6edf0});
export const phantomBladeGeometry=swordVariant({width:1.95,length:1.56,curve:-.035,guard:1.65,edge:0xcaff9f});
