// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
import {gearDefinition} from './ancient-gear.js?v=20261021-skyreach-market-1';
// Immutable, bounded by the weapon catalogue. Both perspectives share these batches.
const templates=new Map(),tones=[0x929d92,0x71c3d9,0xab87ed,0xffcf74,0xff83b0,0xb9faff,0x8ebeff,0xe9a0ff];
function makeWeapon(key,d){
 const root=new T.Group(),parts=[],q=d.quality,tone=tones[q-1],hash=[...key].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7);
 const stone=key.startsWith('stone'),club=key==='ironClub',broken=/Broken|破损/.test(d.en+d.name),short=/Dagger|Knife|短刀|短刃/.test(d.en+d.name),fang=/fang|Fang|ember|eclipse/.test(key),holy=q>=4;
 const length=club?.67:short?.63:stone?.76:1.02+(hash%4)*.045+(holy?.08:0),width=club?.07:short?.07:stone?.085:.065+(hash%3)*.012;
 const materials={metal:new T.MeshStandardMaterial({vertexColors:true,metalness:stone?.16:.82,roughness:stone?.88:.3}),grip:new T.MeshStandardMaterial({vertexColors:true,roughness:.83,metalness:.08}),light:new T.MeshStandardMaterial({color:tone,emissive:tone,emissiveIntensity:q>=4?.85:.35,roughness:.3})};
 function add(g,tone,x,y,z,bucket='metal',rx=0,ry=0,rz=0){const m=new T.Mesh(g,materials[bucket]);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.userData.tone=tone;root.add(m);parts.push(m);return m;}
 const box=(tone,x,y,z,w,h,depth,bucket='metal',rz=0)=>add(new T.BoxGeometry(w,h,depth),tone,x,y,z,bucket,0,0,rz);
 function facet(points,depth,color,z=0,bucket='metal',bevel=.004){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return add(new T.ExtrudeGeometry(s,{depth,steps:1,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:1}),color,0,.07,z-depth/2,bucket);}
 if(club){
  add(new T.CylinderGeometry(.045,.034,.1,8),0x899792,0,.035,0);
  add(new T.CylinderGeometry(.065,.045,length,8),0x5b6768,0,.07+length/2,0);for(let i=0;i<5;i++)add(new T.TorusGeometry(.067,.009,4,10),0xa4b3af,0,.22+i*.1,0,'metal',Math.PI/2);
  for(const side of [-1,1])for(let i=0;i<3;i++)box(0x9daaa2,side*.06,.35+i*.12,0,.028,.055,.09,'metal',side*.2);
 }else{
  const tip=broken?length*.73:length;
  const special=key==='thunderVerdict'?[[-width,0],[-width,.35],[-width*1.7,.45],[-width*.35,.44],[-width*.8,.66],[-width*1.35,.78],[0,tip],[width*.7,.72],[width*.3,.61],[width*1.4,.47],[width*.7,.32],[width,0]]:
   key==='genesis'?[[-width,0],[-width*1.3,tip*.55],[-width*1.65,tip*.82],[-width*.6,tip],[0,tip*.82],[width*.6,tip],[width*1.65,tip*.82],[width*1.3,tip*.55],[width,0]]:
   key==='abyssJudge'?[[-width,0],[-width*1.65,tip*.75],[-width*1.65,tip],[width*.4,tip],[width*1.6,tip*.78],[width*.7,tip*.55],[width,0]]:
   key==='eclipse'?[[-width,0],[-width*.6,tip*.4],[0,tip*.72],[width*2.3,tip],[width*.8,tip*.62],[width*.6,tip*.3],[width,0]]:
   key==='starRuin'?[[-width,0],[-width*.7,tip*.4],[-width*1.7,tip*.61],[-width*.65,tip*.63],[-width*1.15,tip*.81],[0,tip],[width*1.15,tip*.81],[width*.65,tip*.63],[width*1.7,tip*.61],[width*.7,tip*.4],[width,0]]:
   key==='emperor'?[[-width,0],[-width*.8,tip*.3],[-width*1.55,tip*.63],[-width*.9,tip*.84],[0,tip],[width*.9,tip*.84],[width*1.55,tip*.63],[width*.8,tip*.3],[width,0]]:null;
  const outline=special|| (stone?[[-width,0],[-width*1.15,tip*.24],[-width*.85,tip*.58],[-width*.4,tip*.83],[.012,tip],[width*.6,tip*.7],[width*1.15,tip*.32],[width,0]]:
   broken?[[-width,0],[-width,tip*.82],[-width*.5,tip*.78],[0,tip],[width*.35,tip*.86],[width,tip*.91],[width,0]]:
   fang?[[-width,0],[-width*.82,tip*.35],[-width*1.35,tip*.46],[-width*.7,tip*.49],[-width,tip*.65],[0,tip],[width,tip*.65],[width*.7,tip*.49],[width*1.35,tip*.46],[width*.82,tip*.35],[width,0]]:
   [[-width,0],[-width*.8,tip*.23],[-width*(holy?1.25:.95),tip*.72],[0,tip],[width*(holy?1.25:.95),tip*.72],[width*.8,tip*.23],[width,0]]);
  facet(outline,.045,stone?0x818a79:0xc8d6d7);
  // Proud central ridge and darker recessed fuller leave bright cutting edges visible.
  const ridgeTip=key==='genesis'?tip*.79:key==='eclipse'?tip*.65:tip*.9;
  facet([[-width*.52,.025],[-width*.46,tip*.60],[0,ridgeTip],[width*.46,tip*.60],[width*.52,.025]],.053,stone?0xa5ad98:0x536c79);
  if(!stone)for(const side of [-1,1]){
   box(0x1f333c,0,.12+tip*.30,side*.032,.021,tip*.48,.004);
   if(q>=2)box(tone,0,.12+tip*.30,side*.036,.007,tip*.44,.003,'light');
   const n=q>=4?7:q>=2?4:2;for(let i=0;i<n;i++){const y=.2+i*tip*.065,x=(i%2?1:-1)*width*.29;box(q>=3?tone:0x9baeb1,x,y,side*.032,.022,.005,.004,q>=3?'light':'metal',i%2?.65:-.65);}
  }
  if(stone)for(let i=0;i<4;i++)box(0x596052,(i%2?1:-1)*.028,.16+i*.115,.033,.037,.007,.003,'grip',i*.8);
 }
 const trim=stone?0x8f7851:q>=3?0xcfaf71:0x9caeb0;
 if(stone){box(0x59422e,0,.025,0,.22,.045,.085,'grip');for(let i=0;i<3;i++)box(0xc3ad7e,0,.005+i*.017,.048,.13,.009,.009,'grip');}
 else if(!club){
  facet([[-.22,-.008],[-.20,.07],[-.12,.025],[-.065,.065],[.065,.065],[.12,.025],[.20,.07],[.22,-.008],[.09,-.02],[-.09,-.02]],.073,trim,-.002);
  for(const side of [-1,1]){add(new T.OctahedronGeometry(.028,0),q>=3?tone:0xc1d0cc,side*.195,.095,0,q>=3?'light':'metal');box(0x293d45,side*.12,.074,.043,.055,.009,.006,'metal',side*.3);}
 }
 add(new T.CylinderGeometry(.032,.038,.25,10),0x26302e,0,-.12,0,'grip');
 for(let i=0;i<8;i++){add(new T.TorusGeometry(.034,.006,4,10),stone?0xb8a77c:0x786552,0,-.225+i*.029,0,'grip',Math.PI/2,0,i*.15);if(i%2===0)box(trim,0,-.225+i*.029,.034,.009,.008,.008);}
 for(const y of [-.25,-.004])add(new T.CylinderGeometry(.043,.043,.025,10),trim,0,y,0);
 add(new T.OctahedronGeometry(stone?.046:.058,0),trim,0,-.29,0);
 if(q>=2){add(new T.OctahedronGeometry(.035,0),tone,0,.055,.055,'light');add(new T.OctahedronGeometry(.026,0),tone,0,-.29,.039,'light');}
 if(holy){
  for(const side of [-1,1]){facet([[side*.07,.08],[side*.18,.18],[side*(.15+(hash%3)*.025),.36],[side*.075,.24]],.032,trim,-.009);box(tone,side*.107,.235,.023,.007,.1,.008,'light',side*-.22);}
  // Crowned socket and split ornamental collar, not oversized opaque particles.
  for(let i=-1;i<=1;i++)box(trim,i*.045,.115,.052,.012,.06-Math.abs(i)*.016,.012,'metal',-i*.25);
 }
 if(q>=5)for(const side of [-1,1])for(let i=0;i<3;i++)facet([[side*.09,.4+i*.13],[side*.14,.44+i*.13],[side*.08,.5+i*.13]],.016,trim,-.012);
 // Bake dozens of details to at most three draw calls; discard construction geometry.
 for(const [bucket,material]of Object.entries(materials)){
  const selected=parts.filter(m=>m.material===material);if(!selected.length){material.dispose();continue;}
  const arrays={position:[],normal:[],color:[]};for(const m of selected){m.updateMatrix();const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrix);arrays.position.push(...g.attributes.position.array);arrays.normal.push(...g.attributes.normal.array);const c=new T.Color(m.userData.tone);for(let i=0;i<g.attributes.position.count;i++)arrays.color.push(c.r,c.g,c.b);g.dispose();m.geometry.dispose();root.remove(m);}
  const geo=new T.BufferGeometry();for(const [name,values]of Object.entries(arrays))geo.setAttribute(name,new T.Float32BufferAttribute(values,3));geo.computeBoundingSphere();geo.computeBoundingBox();const mesh=new T.Mesh(geo,material);mesh.name='weapon-'+bucket;mesh.userData.sharedWeaponResource=true;root.add(mesh);
 }
 root.name='ancient-weapon-'+key;root.userData.weaponKey=key;root.userData.weaponLength=length;return root;
}
export function createAncientWeaponModel(key){const d=gearDefinition(key);if(!d||d.slot!=='weapon')return null;if(!templates.has(key))templates.set(key,makeWeapon(key,d));return templates.get(key).clone(true);}
export function releaseAncientWeaponModel(root){if(!root)return;root.removeFromParent();root.traverse(o=>{if(o.userData.corruptMaterial){o.userData.corruptMaterial.dispose();delete o.userData.corruptMaterial;}});}
