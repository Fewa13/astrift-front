// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
import {gearDefinition} from './ancient-gear.js?v=20261021-skyreach-market-1';
import {WEAPON_DESIGNS,buildWeaponDesign} from './ancient-weapon-designs.js';
const templates=new Map();
function makeWeapon(key){
 const design=WEAPON_DESIGNS[key];if(!design)throw new Error('Missing weapon design: '+key);
 const root=new T.Group(),parts=[],style=design[4];
 const finish={stone:[.05,.92],glass:[.42,.16],iron:[.67,.56],steel:[.86,.28],ceramic:[.22,.24],bone:[.06,.68],wood:[.04,.84],gold:[.87,.26],dark:[.66,.37],copper:[.8,.4]}[style];
 const materials={metal:new T.MeshStandardMaterial({vertexColors:true,metalness:finish[0],roughness:finish[1]}),grip:new T.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:.07}),light:new T.MeshStandardMaterial({vertexColors:true,emissive:design[3],emissiveIntensity:.45,roughness:.27,metalness:.3})};
 function add(g,c,x,y,z,bucket='metal',rx=0,ry=0,rz=0){const m=new T.Mesh(g,materials[bucket]);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.userData.tone=c;parts.push(m);return m;}
 const box=(c,x,y,z,w,h,d,b='metal',rz=0)=>add(new T.BoxGeometry(w,h,d),c,x,y,z,b,0,0,rz);
 const tube=(c,x,y,z,r,h,b='metal')=>add(new T.CylinderGeometry(r,r,h,8),c,x,y,z,b);
 const ring=(c,x,y,z,r,t,rx=0,ry=0,b='metal',n=16)=>add(new T.TorusGeometry(r,t,4,n),c,x,y,z,b,rx,ry);
 const orb=(c,x,y,z,r,b='metal')=>add(new T.IcosahedronGeometry(r,0),c,x,y,z,b);
 const spike=(c,x,y,z,r,h,rz=0,b='metal')=>add(new T.ConeGeometry(r,h,5),c,x,y,z,b,0,0,rz);
 function shape(points){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;}
 function plate(points,d,c,z=0,b='metal',holes=[]){const s=shape(points);for(const h of holes)s.holes.push(shape(h));return add(new T.ExtrudeGeometry(s,{depth:d,steps:1,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:1}),c,0,0,z-d/2,b);}
 const blade=(p,c,d=.045,holes=[])=>plate(p.map(([x,y])=>[x,y+.07]),d,c,0,'metal',holes.map(h=>h.map(([x,y])=>[x,y+.07])));
 function vein(c,p,r,b='metal'){for(let i=1;i<p.length;i++){const a=new T.Vector3(...p[i-1]),v=new T.Vector3(...p[i]).sub(a),m=add(new T.CylinderGeometry(r,r,v.length(),5),c,...a.addScaledVector(v,.5).toArray(),b);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());}}
 const studs=(x,y,z,n,c)=>{for(let i=0;i<n;i++)orb(c,x,y+i*.06,z,.009)};
 const chain=(x,y,h,n,c)=>{for(let i=0;i<n;i++)ring(c,x,y-i*h/n,0,.017,.004,0,i%2?Math.PI/2:0,'metal',8)};
 const leaf=(c,x,y,z,s,rz)=>{const m=plate([[0,0],[-s*.35,s*.45],[0,s],[s*.35,s*.45]],.012,c,z);m.position.x=x;m.position.y=y;m.rotation.z=rz;};
 function grip(s,c,t){tube(c,0,-.12,0,.032,.25,'grip');tube(t,0,-.255,0,.04,.022);tube(t,0,-.005,0,.04,.018);
  if(['hemp','leather','patched','prayer','braid','regal'].includes(s)){for(let i=0;i<6;i++){ring(s==='prayer'?0xd8d5b4:t,0,-.225+i*.039,0,.033,.004,Math.PI/2,0,'grip',8);if(s==='braid'||s==='hemp')vein(t,[[-.025,-.24+i*.039,.025],[.025,-.21+i*.039,.025]],.004,'grip');}if(s==='patched')box(t,.015,-.13,.035,.04,.09,.009,'metal',.2);}
  else if(s==='bone'){for(let i=0;i<4;i++)orb(c,0,-.22+i*.06,0,.039,'grip');}
  else if(s==='coil'){for(let i=0;i<8;i++)ring(t,0,-.23+i*.03,0,.038,.005,Math.PI/2);}
  else if(s==='chain')chain(0,-.01,.25,8,t);
  else if(s==='root')for(const side of [-1,1])vein(t,[[side*.03,-.25,0],[-side*.025,-.15,.026],[side*.03,-.03,0]],.011,'grip');
  else if(s==='scales')for(let i=0;i<5;i++)plate([[-.033,-.23+i*.045],[0,-.20+i*.045],[.033,-.23+i*.045],[0,-.25+i*.045]],.012,t,.03,'grip');
  else {box(t,0,-.12,.033,.012,.20,.008);for(const y of [-.2,-.05])ring(t,0,y,0,.036,.005,Math.PI/2);}
  if(s==='jade'||s==='obsidian')orb(c,0,-.29,0,.045);else if(s==='regal')spike(t,0,-.29,0,.046,.07,Math.PI);else tube(t,0,-.29,0,.033,.04);
 }
 function guard(s,c,w){if(s==='knuckle'){ring(c,w*.6,-.075,0,w*.65,.012);box(c,0,.025,0,w*1.6,.025,.07);return;}
  if(s==='crescent'){for(const side of [-1,1])vein(c,[[0,.01,0],[side*w*.7,.04,0],[side*w,.14,0]],.018);return;}
  if(s==='shield'){plate([[-w,.09],[w,.09],[w*.7,-.03],[0,-.12],[-w*.7,-.03]],.04,c);return;}
  const heights={bar:0,cross:0,swept:.07,hook:.13,wing:.12,clamp:.09,crown:.13,branch:.11,fork:.15,talon:.14,star:.13,jaw:.12,temple:.09};const h=heights[s]??.05;
  for(const side of [-1,1]){plate([[0,-.012],[side*w,-.005],[side*w,h],[side*w*.65,.025],[0,.025]],.05,c);if(['wing','branch','talon','crown','star','jaw','fork'].includes(s))for(let i=0;i<3;i++)spike(c,side*w*(.45+i*.23),h*.6+i*.018,0,.015,.07+i*.018,-side*(s==='jaw'?1.8:.5));if(s==='temple')box(c,side*w,.075,0,.035,.13,.065);}
 }
 buildWeaponDesign(key,{blade,plate,box,tube,ring,orb,grip,guard,studs,vein,chain,leaf,spike});
 for(const [bucket,material]of Object.entries(materials)){const selected=parts.filter(m=>m.material===material);if(!selected.length){material.dispose();continue;}const a={position:[],normal:[],color:[]};for(const m of selected){m.updateMatrix();const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrix);a.position.push(...g.attributes.position.array);a.normal.push(...g.attributes.normal.array);const c=new T.Color(m.userData.tone);for(let i=0;i<g.attributes.position.count;i++)a.color.push(c.r,c.g,c.b);g.dispose();m.geometry.dispose();}const geo=new T.BufferGeometry();for(const [n,v]of Object.entries(a))geo.setAttribute(n,new T.Float32BufferAttribute(v,3));geo.computeBoundingSphere();geo.computeBoundingBox();const mesh=new T.Mesh(geo,material);mesh.name='weapon-'+bucket;mesh.userData.sharedWeaponResource=true;root.add(mesh);}
 const bounds=new T.Box3().setFromObject(root);root.name='ancient-weapon-'+key;Object.assign(root.userData,{weaponKey:key,weaponLength:bounds.max.y,designId:design[0],designFeatures:design[1],materialStyle:style});return root;
}
export function createAncientWeaponModel(key){const d=gearDefinition(key);if(!d||d.slot!=='weapon')return null;if(!templates.has(key))templates.set(key,makeWeapon(key));return templates.get(key).clone(true);}
export function releaseAncientWeaponModel(root){if(!root)return;root.removeFromParent();root.traverse(o=>{if(o.userData.corruptMaterial){o.userData.corruptMaterial.dispose();delete o.userData.corruptMaterial;}});}
