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
