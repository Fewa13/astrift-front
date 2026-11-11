// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as THREE from './three.module.js';
// Small, deterministic, shared procedural textures. No downloads or per-frame canvases.
const textures=new Map();
const mineralSurfaces={
 stone:['#777b72','#c6c5ae','#46483f',.22],
 ash:['#393832','#8e7971','#1f2024',.30],
 marble:['#deded2','#f8f3e3','#829d96',.20],
 froststone:['#798a96','#c9e0e8','#475b70',.24],
 stormstone:['#676c83','#a0aacc','#333d60',.26],
 abyssstone:['#65868b','#a3c3b3','#354f61',.25],
 soil:['#8d8062','#a29476','#746951',.13],
 forestsoil:['#8b8969','#999974','#757258',.13],
 sand:['#ad946e','#ebcf97','#6d5743',.20],
};
export function paintMineral(c,kind,rnd){
 const palette=mineralSurfaces[kind];
 const [base,light,dark,opacity]=palette;
 c.fillStyle=base;
 c.fillRect(0,0,512,512);
 // Wrap broad mottling at the edges so existing repeated UVs stay seamless.
 for(let i=0;i<145;i++){
  const x=rnd()*512,y=rnd()*512,r=8+rnd()*66;
  const color=i%3?light:dark;
  for(const dx of [-512,0,512])for(const dy of [-512,0,512]){
   const px=x+dx,py=y+dy;
   if(px+r<0||px-r>512||py+r<0||py-r>512)continue;
   const gradient=c.createRadialGradient(px,py,0,px,py,r);
   gradient.addColorStop(0,color);
   gradient.addColorStop(1,color+'00');
   c.globalAlpha=opacity;
   c.fillStyle=gradient;
   c.fillRect(px-r,py-r,r*2,r*2);
  }
 }
 for(let i=0;i<28;i++){
  let x=26+rnd()*460,y=26+rnd()*460;
  const steps=2+Math.floor(rnd()*4);
  c.beginPath();
  c.moveTo(x,y);
  for(let j=0;j<steps;j++){
   x=Math.max(3,Math.min(509,x+4+rnd()*22));
   y=Math.max(3,Math.min(509,y+(rnd()-.44)*35));
   c.lineTo(x,y);
  }
  c.strokeStyle=dark;
  c.globalAlpha=opacity*.9;
  c.lineWidth=.4+rnd()*1.8;
  c.stroke();
 }
 c.globalAlpha=1;
}
function paintWall(c,kind,rnd){
 const paving=kind==='paving',masonry=kind==='masonry'||paving;
 paintMineral(c,kind==='sandcliff'?'sand':'stone',rnd);
 if(masonry){
  const row=kind==='paving'?128:64,width=kind==='paving'?256:128;
  for(let y=0;y<512;y+=row)for(let x=-width;x<512;x+=width){
   const left=x+(y/row%2)*width/2;
   c.fillStyle=rnd()<.45?'#d7d1b2':'#363c3c';
   c.globalAlpha=(.08+rnd()*.13)*(paving?.35:1);
   c.fillRect(left+2,y+2,width-4,row-4);
   c.globalAlpha=paving?.15:.4;
   c.fillStyle='#252a2b';
   c.fillRect(left,y,3,row);
   c.fillRect(left,y,width,3);
   c.fillStyle='#d6d6bf';
   c.fillRect(left+3,y+3,width-5,2);
  }
 }else{
  for(let i=0;i<13;i++){
   const y=i*512/13,width=2+rnd()*7;
   for(let layer=0;layer<2;layer++){
    c.beginPath();
    for(let x=0;x<=512;x+=8){
     const a=x*Math.PI/256,h=y+Math.sin(a+i)*9+Math.sin(a*3+i*.5)*3+layer*width*.55;
     if(x)c.lineTo(x,h);else c.moveTo(x,h);
    }
    c.strokeStyle=layer?'#ded3ac':'#35362f';
    c.globalAlpha=layer?.12:.24;
    c.lineWidth=layer?width*.55:width;
    c.stroke();
   }
  }
 }
 c.globalAlpha=1;
}
export function environmentTexture(kind){if(textures.has(kind))return textures.get(kind);const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d');let seed=82111+kind.length*613;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296},base={wood:'#8c7250',stone:'#92968a',thatch:'#a28c58',wicker:'#a58c62',cut:'#b59a70',pelt:'#c2b291',ash:'#393832'}[kind]||'#8d896c';if(['cliff','sandcliff','masonry','paving'].includes(kind))paintWall(c,kind,rnd);else if(mineralSurfaces[kind])paintMineral(c,kind,rnd);else{c.fillStyle=base;c.fillRect(0,0,512,512)}for(let i=0;i<4200;i++){c.fillStyle=i%2?'#fff8de':'#302d21';c.globalAlpha=.035+rnd()*.055;c.fillRect(rnd()*512,rnd()*512,1+rnd()*4,1+rnd()*4)}c.globalAlpha=1;
 if(kind==='shadow'){c.clearRect(0,0,512,512);c.fillStyle='#000000';c.globalAlpha=.045;for(let r=230;r>15;r-=12){c.beginPath();c.ellipse(256,256,r,r,0,0,Math.PI*2);c.fill()}}
 if(kind==='soil'){for(let i=0;i<100;i++){c.globalAlpha=.04;c.fillStyle=i%2?'#c0a273':'#493f2b';c.beginPath();c.ellipse(rnd()*512,rnd()*512,15+rnd()*45,8+rnd()*30,rnd()*6,0,Math.PI*2);c.fill()}}
 if(kind==='wood'){for(let i=0;i<85;i++){const x=i*6;c.strokeStyle=i%3?'#4e382538':'#e8c78b38';c.lineWidth=.5+rnd()*1.3;c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+10+rnd()*16,160,x-10-rnd()*10,350,x,512);c.stroke()}for(let i=0;i<5;i++){const x=40+rnd()*430,y=40+rnd()*430;for(let j=0;j<4;j++){c.strokeStyle='#362a2450';c.beginPath();c.ellipse(x,y,3+j*2,8+j*5,.08,0,Math.PI*2);c.stroke()}}}
 if(kind==='stone'){for(let i=0;i<13;i++){const x=rnd()*512,y=rnd()*512;c.strokeStyle='#343a3440';c.lineWidth=.8;c.beginPath();c.moveTo(x,y);c.lineTo(x+15,y+14);c.lineTo(x+9,y+30);c.lineTo(x+26,y+41);c.stroke()}for(let i=0;i<60;i++){c.fillStyle='#59724b';c.globalAlpha=.08;c.beginPath();c.ellipse(rnd()*512,rnd()*512,8+rnd()*16,4+rnd()*10,rnd()*6,0,Math.PI*2);c.fill()}}
 if(kind==='thatch'||kind==='wicker'){for(let y=0;y<512;y+=kind==='thatch'?22:12)for(let x=-24;x<512;x+=kind==='thatch'?8:16){c.globalAlpha=1;c.strokeStyle=(x/8+y)%3?'#e0c48988':'#59462e88';c.lineWidth=kind==='thatch'?2:4;c.beginPath();c.moveTo(x+(y%44?4:0),y);c.lineTo(x+3,y+(kind==='thatch'?28:10));c.stroke()}if(kind==='thatch')for(let y=21;y<512;y+=22){c.strokeStyle='#58462944';c.lineWidth=1;c.beginPath();c.moveTo(0,y);c.lineTo(512,y);c.stroke()}}
 if(kind==='cut'){for(let r=8;r<350;r+=8+rnd()*8){c.globalAlpha=.55;c.strokeStyle=r%3>1?'#61482f':'#d0b887';c.lineWidth=1;c.beginPath();c.ellipse(256,256,r,r*.92,.07,0,Math.PI*2);c.stroke()}for(let i=0;i<3;i++){const a=i*2.1;c.strokeStyle='#49372088';c.beginPath();c.moveTo(256+Math.sin(a)*140,256+Math.cos(a)*140);c.lineTo(256+Math.sin(a)*280,256+Math.cos(a)*280);c.stroke()}}
 if(kind==='pelt'){for(let i=0;i<1300;i++){c.globalAlpha=.1;c.strokeStyle=i%2?'#615644':'#fff1cc';const x=rnd()*512,y=rnd()*512;c.beginPath();c.moveTo(x,y);c.lineTo(x+2,y+8+rnd()*10);c.stroke()}}
 c.globalAlpha=1;const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=2;textures.set(kind,map);return map}
const roofShape=new THREE.Shape();roofShape.moveTo(-.5,-.5);roofShape.lineTo(0,.5);roofShape.lineTo(.5,-.5);roofShape.closePath();const roof=new THREE.ExtrudeGeometry(roofShape,{depth:1,bevelEnabled:false});roof.translate(0,0,-.5);
const peltShape=new THREE.Shape();peltShape.moveTo(-.4,.5);peltShape.lineTo(.4,.5);peltShape.lineTo(.5,.28);peltShape.lineTo(.3,.04);peltShape.lineTo(.33,-.32);peltShape.lineTo(.1,-.5);peltShape.lineTo(-.12,-.4);peltShape.lineTo(-.37,-.48);peltShape.lineTo(-.32,.06);peltShape.lineTo(-.5,.3);peltShape.closePath();const pelt=new THREE.ShapeGeometry(peltShape);
const crown=new THREE.IcosahedronGeometry(1,2),positions=crown.attributes.position;for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i),r=1+.10*Math.sin(x*9+y*5)+.07*Math.cos(z*11-x*3);positions.setXYZ(i,x*r,y*r,z*r)}crown.computeVertexNormals();crown.computeBoundingSphere();
const flame=new THREE.SphereGeometry(1,10,7),flamePos=flame.attributes.position;for(let i=0;i<flamePos.count;i++){const y=flamePos.getY(i),t=(y+1)/2;flamePos.setXYZ(i,flamePos.getX(i)*(1-t*.72)+Math.sin(t*7)*t*.18,t,flamePos.getZ(i)*(1-t*.72))}flame.computeVertexNormals();flame.computeBoundingSphere();
const grass=new THREE.BufferGeometry();grass.setAttribute('position',new THREE.Float32BufferAttribute([-.5,-.5,0,.5,-.5,0,.25,0,.06,-.2,0,.06,.2,.5,.14],3));grass.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.7,.5,.2,.5,.75,1],2));grass.setIndex([0,1,2,0,2,3,3,2,4]);grass.computeVertexNormals();grass.computeBoundingSphere();
export const ENV_GEOMETRIES={eRoot:new THREE.CylinderGeometry(1,.05,1,8),eBranch:new THREE.CylinderGeometry(.2,1,1,8),eGrass:grass,eShadowDisk:new THREE.CircleGeometry(1,24),eRoof:roof,ePelt:pelt,eCrown:crown,eDais:new THREE.CylinderGeometry(1,1,1,32),eRope:new THREE.TorusGeometry(1,.08,4,16),eInlay:new THREE.RingGeometry(.975,1,48),eFlame:flame};
export const ENV_MATERIALS={eShadow:new THREE.MeshBasicMaterial({color:0x000000,map:environmentTexture('shadow'),transparent:true,opacity:.5,depthWrite:false}),eThatch:new THREE.MeshStandardMaterial({map:environmentTexture('thatch'),color:0xc4ab75,roughness:1}),eRope:new THREE.MeshStandardMaterial({color:0xbaa984,roughness:1}),eCut:new THREE.MeshStandardMaterial({map:environmentTexture('cut'),roughness:1}),eWicker:new THREE.MeshStandardMaterial({map:environmentTexture('wicker'),roughness:1}),ePelt:new THREE.MeshStandardMaterial({map:environmentTexture('pelt'),roughness:1,side:THREE.DoubleSide}),eAsh:new THREE.MeshStandardMaterial({map:environmentTexture('ash'),roughness:1}),eBand:new THREE.MeshStandardMaterial({color:0x443e35,metalness:.3,roughness:.8}),eStoneEdge:new THREE.MeshStandardMaterial({map:environmentTexture('stone'),color:0xc8c0a5,roughness:.85}),eLeafLight:new THREE.MeshStandardMaterial({color:0x697f44,roughness:1}),eLeafDark:new THREE.MeshStandardMaterial({color:0x344e39,roughness:1})};
function rope(p,x,y,z,r,rx=Math.PI/2,rz=0){for(let i=0;i<3;i++)p('eRope','eRope',x,y+(rx?i*.045:0),z,r,r,r,rx,0,rz)}
export function hutDetails(p,o){const {x,z,w,d}=o;
 for(const side of [-1,1]){for(let i=0;i<11;i++){const dx=(i-5)*w/11;p('box','wood',x+dx,2.5,z+side*(d/2+.025),w/11-.045,4.9,.04);p('box','eBand',x+dx,1.0,z+side*(d/2+.055),.07,.07,.025);p('box','eBand',x+dx,4.1,z+side*(d/2+.055),.07,.07,.025)}for(const s of [-1,1]){p('log','wood',x+side*(w/2-.14),2.5,z+s*(d/2-.14),.22,5,.22);rope(p,x+side*(w/2-.14),4.25,z+s*(d/2-.14),.235)}p('box','eBand',x,4.8,z+side*(d/2+.1),w,.13,.13);p('log','wood',x+side*w*.46,5.1,z,.12,d+1.1,.12,Math.PI/2);p('box','wood',x+side*(w/2+.03),3,z, .08,1.9,2.5);for(let j=0;j<4;j++)p('box','eBand',x+side*(w/2+.08),2.4+j*.39,z,.02,.07,2.2)}
 p('log','wood',x,7.4,z,.14,d+1.2,.14,Math.PI/2);
 for(let i=0;i<6;i++)p('box','wood',x+(i-2.5)*.38,1.8,z-d/2-.22,.35,3.55,.05);
 for(const side of [-1,1]){p('box','wood',x+side*1.26,1.9,z-d/2-.20,.15,3.9,.16);p('box','eBand',x+side*1.02,1.2,z-d/2-.28,.26,.10,.02);p('box','eBand',x+side*1.02,2.55,z-d/2-.28,.26,.10,.02)}p('box','wood',x,3.9,z-d/2-.20,2.8,.19,.16);p('eRope','eBand',x+.55,1.9,z-d/2-.30,.12,.15,.12,0);p('box','wood',x,1.8,z-d/2-.29,2.2,.13,.06,0,0,-.58);
 for(let i=0;i<7;i++)p('rock','rock',x+(i-3)*1.65,.23,z+d/2-.15,.65,.23,.22);
}
export function treeDetails(p,t,y=0){const {x,z,r=.5,h=10}=t;p('eShadowDisk','eShadow',x,y+.035,z,r*1.6,r*1.6,1,-Math.PI/2);for(let i=0;i<5;i++){const a=i*Math.PI*2/5,px=x+Math.cos(a)*r*.98,pz=z+Math.sin(a)*r*.98;p('log','wood',px,y+h*.32,pz,r*.035,h*.62,r*.035,0,0,.012*Math.sin(i));p('rock','rock',x+Math.cos(a)*r*.5,y+.18,z+Math.sin(a)*r*.5,r*.35,.2,r*.35)}p('eDais','wood',x,y+h-.025,z,r*.82,.03,r*.82)}
export function rootDetails(p,t,y=0){const {x,z,r}=t,up=new THREE.Vector3(0,1,0),direction=new THREE.Vector3(),rotation=new THREE.Euler(),quaternion=new THREE.Quaternion();for(let i=0;i<7;i++){const a=i*Math.PI*2/7,dx=Math.cos(a),dz=Math.sin(a),height=r*(1.4+(i%3)*.15),reach=r*.04+.08;direction.set(-dx*reach,height,-dz*reach);const length=direction.length();quaternion.setFromUnitVectors(up,direction.normalize());rotation.setFromQuaternion(quaternion);p('eRoot','wood',x+dx*(r*.98+.04),y+.05+height/2,z+dz*(r*.98+.04),Math.min(.16,r*.14),length,Math.min(.16,r*.14),rotation.x,rotation.y,rotation.z)}}
export function campDetails(p,x,z){p('eShadowDisk','eShadow',x,.018,z,2,2,1,-Math.PI/2);for(let j=0;j<3;j++)for(const dx of [4+j,-4+j*1.2])p('eShadowDisk','eShadow',x+dx,.019,z+3,.7,.7,1,-Math.PI/2);p('disk','eAsh',x,.026,z,1.32,1.32,1,-Math.PI/2);for(let i=0;i<8;i++){const a=i*Math.PI/4;p('rock','eAsh',x+Math.cos(a)*.7,.26,z+Math.sin(a)*.7,.15,.1,.12)}
 for(let j=0;j<3;j++){const px=x+4+j;rope(p,px,1.5,z+3,.315);p('disk','eCut',px,2.015,z+3,.29,.29,1,-Math.PI/2);for(let k=0;k<5;k++)p('cone','bone',px+(k-2)*.09,1.85,z+2.62,.035,.20,.04,Math.PI);p('box','bone',px,1.91,z+2.62,.44,.08,.14);p('cone','coal',px,2.1,z+2.49,.05,.11,.015,Math.PI);for(const side of [-1,1])p('cone','bone',px+side*.37,2.49,z+3,.06,.37,.06,0,0,-side*.55)}
 for(const dx of [5,9]){rope(p,x+dx,2.55,z-4,.17);p('disk','eCut',x+dx,2.905,z-4,.145,.145,1,-Math.PI/2);p('log','wood',x+dx+(dx===5?.22:-.22),2.46,z-4,.055,.75,.055,0,0,dx===5?-.7:.7)}
 for(const dx of [6.4,7.6]){p('log','eRope',x+dx,2.65,z-4,.022,.25,.022);p('ePelt','ePelt',x+dx,2.31,z-4,.8,.70,1,0,(dx-7)*.15)}
 for(let j=0;j<3;j++){const px=x-4+j*1.2;for(const y of [.12,.48,.84])p('eRope','eBand',px,y,z+3,.51,.51,.51,Math.PI/2);p('disk','eCut',px,.905,z+3,.49,.49,1,-Math.PI/2)}
}
export function altarDetails(p,x,z,r,y=0,glow='rune'){p('eInlay','eStoneEdge',x,y+.014,z,r*.88,r*.88,1,-Math.PI/2);p('eInlay',glow,x,y+.025,z,r*.56,r*.56,1,-Math.PI/2);for(let i=0;i<16;i++){const a=i*Math.PI/8,px=x+Math.sin(a)*r*.74,pz=z+Math.cos(a)*r*.74;p('box','eBand',px,y+.014,pz,.035,.012,r*.19,0,a);p('box',glow,px,y+.03,pz,.045,.012,.34,0,a);p('rock','eStoneEdge',x+Math.sin(a)*(r+.1),y-.12,z+Math.cos(a)*(r+.1),.40,.12,.4,0,a)}
}
export function pillarDetails(p,x,y,z){for(const side of [-1,1])p('box','eStoneEdge',x+side*.53,y+2.2,z-.645,.065,3.3,.04);for(const h of [.25,3.75])p('box','eStoneEdge',x,y+h,z,1.24,.08,1.24);p('box','eBand',x,y+2,z-.608,.36,2.6,.04);for(const side of [-1,1])p('box','eStoneEdge',x+side*.14,y+3.5,z-.66,.045,.3,.025,0,0,side*.65)}
// Chunked instances retain frustum culling; a far-away hut cannot force the whole map to draw.
export function batchEnvironment(group,size=64){const buckets=new Map();for(const mesh of [...group.children]){if(!mesh.isMesh||mesh.isInstancedMesh)continue;const key=Math.floor(mesh.position.z/size)+':'+mesh.geometry.uuid+':'+mesh.material.uuid;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(mesh)}for(const meshes of buckets.values()){const batch=new THREE.InstancedMesh(meshes[0].geometry,meshes[0].material,meshes.length);for(let i=0;i<meshes.length;i++){meshes[i].updateMatrix();batch.setMatrixAt(i,meshes[i].matrix);group.remove(meshes[i])}batch.computeBoundingSphere();batch.computeBoundingBox();group.add(batch)}return buckets.size}
export function mergeEnvironment(group){const buckets=new Map();for(const mesh of [...group.children])if(mesh.isMesh&&!mesh.isInstancedMesh){if(!buckets.has(mesh.material))buckets.set(mesh.material,[]);buckets.get(mesh.material).push(mesh)}for(const [material,parts]of buckets){const temporary=parts.map(mesh=>{mesh.updateMatrix();const g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();g.applyMatrix4(mesh.matrix);return g}),result=new THREE.BufferGeometry();for(const name of ['position','normal','uv']){if(!temporary.every(g=>g.attributes[name]))continue;const size=temporary[0].attributes[name].itemSize,values=new Float32Array(temporary.reduce((sum,g)=>sum+g.attributes[name].array.length,0));let at=0;for(const g of temporary){values.set(g.attributes[name].array,at);at+=g.attributes[name].array.length}result.setAttribute(name,new THREE.BufferAttribute(values,size))}result.computeBoundingSphere();result.computeBoundingBox();for(const p of parts)group.remove(p);group.add(new THREE.Mesh(result,material));for(const g of temporary)g.dispose()}}
export function createCampFlames(world,points){const dummy=new THREE.Object3D(),batches=[];for(const [color,scale,y,layers]of [[0xff962f,.36,.47,3],[0xffe8a0,.20,.51,1]]){const material=new THREE.MeshBasicMaterial({color,transparent:layers===3,opacity:layers===3?.64:1,depthWrite:layers!==3}),mesh=new THREE.InstancedMesh(flame,material,points.length*layers);mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);world.add(mesh);batches.push({mesh,scale,y,layers})}function update(time){for(const {mesh,scale,y,layers}of batches){for(let i=0;i<points.length*layers;i++){const p=points[Math.floor(i/layers)],j=i%layers,pulse=1+.1*Math.sin(time*.009+i*2.1),a=i*2.3;dummy.position.set(p.x+(layers>1?Math.cos(a)*.14:0),y,p.z+(layers>1?Math.sin(a)*.14:0));dummy.rotation.set(0,a,.08*Math.sin(time*.005+i));dummy.scale.set(scale,1.15*pulse*(1-j*.14),scale);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)}mesh.instanceMatrix.needsUpdate=true}}update(0);for(const b of batches)b.mesh.computeBoundingSphere();return update}
