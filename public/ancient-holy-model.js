// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as THREE from './three.module.js';
const cache=new Map();
const palettes={fire:[0xb72113,0xffca58],lightning:[0x0036c7,0x008cff],ice:[0x159bc7,0x5fe3ed],curse:[0x5915bb,0xc334f3],summoner:[0x078f77,0x35e8a1],swordsman:[0x068442,0x39f36c],warrior:[0xce4912,0xffb522],shadowblade:[0x392184,0xa56aff],stonewright:[0x9f531a,0xf0ac42]};
// Cached, merged geometry per animated joint; no particles, timers or per-player lights.
function build(job){const [deep,bright]=palettes[job]||palettes.warrior,groups=new Map(),box=new THREE.BoxGeometry(1,1,1),cone=new THREE.ConeGeometry(1,1,5),ring=new THREE.TorusGeometry(1,.018,4,40),dummy=new THREE.Object3D();
 const add=(joint,geo,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0,color=bright)=>{dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();const g=geo.index?geo.toNonIndexed():geo.clone();g.applyMatrix4(dummy.matrix);const c=new THREE.Color(color),values=new Float32Array(g.attributes.position.count*3);for(let i=0;i<values.length;i+=3){values[i]=c.r;values[i+1]=c.g;values[i+2]=c.b}g.setAttribute('color',new THREE.BufferAttribute(values,3));if(!groups.has(joint))groups.set(joint,[]);groups.get(joint).push(g)};
 const line=(joint,points,width=.018,color=bright)=>{for(let i=1;i<points.length;i++){const a=new THREE.Vector3(...points[i-1]),b=new THREE.Vector3(...points[i]),d=b.clone().sub(a),mid=a.clone().add(b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());const e=new THREE.Euler().setFromQuaternion(dummy.quaternion);add(joint,box,...mid.toArray(),width,d.length(),width,e.x,e.y,e.z,color)}};
 const bolt=(joint,x,y,z,length,width=.018)=>line(joint,[[x,y,z],[x+.065,y-length*.23,z-.015],[x-.04,y-length*.48,z+.01],[x+.045,y-length*.55,z],[x-.03,y-length,z]],width);
 if(job==='lightning'){
  // Lightning is worn across the body, rather than a pale crown floating above it.
  for(const s of [-1,1]){bolt('body',s*.18,1.73,-.245,.79,.025);bolt('body',s*.24,1.65,.245,.73,.022);line('body',[[s*.12,1.5,-.27],[s*.3,1.59,-.24],[s*.46,1.53,-.15],[s*.57,1.65,-.04]],.024);for(let i=0;i<3;i++)bolt('body',s*(.39+i*.09),1.76+i*.1,.03,.29,.018);bolt('body',s*.11,2.07,-.19,.27,.016);}
  for(const joint of ['arm0','arm1']){bolt(joint,-.06,.02,-.145,.53,.023);bolt(joint,.07,-.05,.12,.45,.016);add(joint,ring,0,-.4,0,.16,.16,.16,Math.PI/2);}
  for(const joint of ['leg0','leg1']){bolt(joint,.055,-.08,-.14,.55,.019);bolt(joint,-.07,-.16,.12,.42,.014);}
  for(const s of [-1,1])line('body',[[s*.5,1.85,.22],[s*.73,2.03,.23],[s*.61,2.04,.23],[s*.91,2.3,.24],[s*.79,2.23,.24],[s*1.02,2.52,.25]],.024);
  add('body',ring,0,1.61,.34,.48,.48,.48,0,0,.25,deep);
 }else if(job==='curse'||job==='summoner'){
  const curse=job==='curse';for(let k=0;k<2;k++)add('body',ring,0,1.53,.34,.57+k*.13,.57+k*.13,.57+k*.13,0,0,k*.28,k?deep:bright);
  for(let i=0;i<(curse?18:12);i++){const a=i/(curse?18:12)*Math.PI*2,x=Math.cos(a)*.66,y=1.53+Math.sin(a)*.66;line('body',[[x-.035,y-.06,.37],[x+.035,y,.37],[x-.025,y+.07,.37]],.014);if(curse)line('body',[[x,y,.37],[x+Math.cos(a)*.13,y+Math.sin(a)*.13,.37]],.012)}
  for(const s of [-1,1]){for(let k=0;k<3;k++)add('body',cone,s*(.4+k*.065),1.72+k*.12,.12,.045,.32,.045,0,0,-s*.55);line('body',[[s*.19,1.67,-.24],[s*.13,1.42,-.29],[s*.22,1.17,-.25],[s*.09,.9,-.25]],.024);}
 }else if(job==='ice'){
  for(const s of [-1,1]){for(let i=0;i<4;i++)add('body',cone,s*(.36+i*.075),1.72+i*.09,.13,.065,.42+i*.08,.07,0,0,-s*(.2+i*.14),i%2?deep:bright);line('body',[[s*.1,1.68,-.25],[s*.27,1.48,-.28],[s*.12,1.32,-.27],[s*.2,.94,-.24]],.022);}
  for(let i=0;i<6;i++){const a=i*Math.PI/3;line('body',[[0,1.55,.4],[Math.sin(a)*.46,1.55+Math.cos(a)*.46,.4]],.02);}
 }else if(job==='swordsman'||job==='shadowblade'){
  for(const s of [-1,1])for(let i=0;i<3;i++){const x=s*(.35+i*.17),y=1.65+i*.16,a=-s*(.18+i*.2);add('body',box,x,y,.32,.035,.59,.025,0,0,a);add('body',cone,x+Math.sin(-a)*.32,y+Math.cos(a)*.32,.32,.045,.17,.03,0,0,a);add('body',box,x-Math.sin(-a)*.18,y-Math.cos(a)*.18,.32,.17,.025,.035,0,0,a)}
  for(const s of [-1,1])line('body',[[s*.23,1.68,-.26],[s*.08,1.4,-.29],[s*.2,1.04,-.25]],.022);
 }else{
  for(const s of [-1,1])for(let i=0;i<4;i++)add('body',cone,s*(.37+i*.065),1.68+i*.06,.04,.07,.35+i*.05,.08,0,0,-s*.6,i%2?deep:bright);
  for(let i=0;i<5;i++){const y=1.58-i*.12;line('body',[[-.2,y+.06,-.27],[0,y,-.31],[.2,y+.06,-.27]],.025);}
  if(job==='stonewright')for(let i=0;i<5;i++)add('body',box,(i-2)*.15,1.6+Math.abs(i-2)*.08,.33,.1,.5,.12,0,0,(i-2)*.15);
 }
 // Every profession carries its element down the arms and legs; geometry follows joints.
 if(job!=='lightning')for(const joint of ['arm0','arm1','leg0','leg1']){const arm=joint.startsWith('arm');line(joint,[[-.065,-.08,-.14],[.06,-.23,-.155],[-.04,-.4,-.155],[.04,arm?-.52:-.62,-.14]],.02);if(arm)add(joint,ring,0,-.33,0,.145,.145,.145,Math.PI/2,0,0,deep);}
 const material=new THREE.MeshBasicMaterial({color:0xffffff,vertexColors:true,toneMapped:false}),result=[];
 for(const[joint,parts]of groups){const g=new THREE.BufferGeometry();for(const attr of ['position','normal','color']){const arrays=parts.map(p=>p.attributes[attr].array),data=new Float32Array(arrays.reduce((n,a)=>n+a.length,0));let offset=0;for(const a of arrays){data.set(a,offset);offset+=a.length}g.setAttribute(attr,new THREE.BufferAttribute(data,3))}g.computeBoundingSphere();const mesh=new THREE.Mesh(g,material);mesh.name=joint==='body'?'holy-regalia':'holy-regalia-'+joint;result.push({joint,mesh});parts.forEach(p=>p.dispose())}box.dispose();cone.dispose();ring.dispose();return result;
}
export function attachHolyRegalia(root,job){if(root.getObjectByName('holy-regalia'))return;if(!cache.has(job))cache.set(job,build(job));for(const{joint,mesh}of cache.get(job)){const parent=root.getObjectByName(joint)||root;parent.add(mesh.clone())}}
