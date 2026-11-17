// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as THREE from './three.module.js';

const looks={
 berserker:[0x4a1823,0xf4605b,'horns','tusks'],
 paladin:[0x406070,0xffdfa3,'sun','shield'],
 spiritcaller:[0x1b5965,0xa0ffe7,'ribbons','wings'],
 beastlord:[0x554738,0xe9c573,'bone','spines'],
 stormcaller:[0x2d3c69,0xa9daff,'thunder','towers'],
 voltstalker:[0x2a205f,0xa584ff,'visor','fins'],
 crystalist:[0x33587a,0xb1f4ff,'crystals','prisms'],
 winterwarden:[0x2a4a66,0xe6f8ff,'fur','fortress'],
 wildfire:[0x763428,0xffb14b,'flames','embers'],
 hellfire:[0x482338,0xff6b79,'crescent','lanterns'],
 hexweaver:[0x4c285e,0xd695ff,'web','needles'],
 pactbinder:[0x522039,0xf088c5,'mask','scales'],
 blademaster:[0x265c46,0x9fffd5,'swords','scabbards'],
 linebreaker:[0x536248,0xf7e694,'crest','plates'],
 shadowhunter:[0x312344,0xac78f2,'hood','talons'],
 boundarycutter:[0x40223d,0xfb81bd,'split','shears'],
 mountainguard:[0x594f44,0xe5bb82,'boulders','ramparts'],
 veinforger:[0x503e32,0xffbd71,'geode','spikes'],
 'elemental-god':[0x565273,0xffd58d,'elements','comets'],
 'elemental-ward':[0x314f62,0x84e9df,'compass','stones'],
 riftlord:[0x30234d,0xca9cff,'fracture','gates'],
 riftduelist:[0x2c3b65,0xaeafff,'duel','rapiers'],
 'abyss-king':[0x461827,0xff7685,'crown','ribcage'],
 'abyss-herald':[0x3c254b,0xa4ffd8,'eye','tentacles'],
 'time-sovereign':[0x594656,0xffe297,'clock','hands'],
 'time-weaver':[0x254c59,0xacffec,'loom','threads'],
};
export const advancementLookIds=Object.freeze(Object.keys(looks));
const shapes={
 cube:new THREE.BoxGeometry(1,1,1),
 cone:new THREE.ConeGeometry(1,1,6),
 crystal:new THREE.OctahedronGeometry(1),
 rock:new THREE.IcosahedronGeometry(1,1),
 ring:new THREE.TorusGeometry(1,.05,6,28),
 sphere:new THREE.SphereGeometry(1,10,8),
};
const templates=new Map();
const colors=[0xfe8750,0xafefff,0xb88aff,0xf9cb79];

function template(id){
 const [metal,glow,head,back]=looks[id],pieces=[];
 const solid=new THREE.MeshStandardMaterial({color:metal,metalness:.58,roughness:.45});
 const trim=new THREE.MeshStandardMaterial({color:glow,metalness:.42,roughness:.38,emissive:glow,emissiveIntensity:.19});
 const jewels=colors.map(color=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.45,roughness:.3}));
 const add=(shape,tone,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0)=>pieces.push({shape,tone,position:[x,y,z],scale:[sx,sy,sz],rotation:[rx,ry,rz]});
 const gem=(x,y,z,scale=.075,tone=1)=>add('crystal',tone,x,y,z,scale,scale*1.7,scale*.72);
 const plate=(x,y,z,w,h,d,rz=0)=>add('cube',0,x,y,z,w,h,d,0,0,rz);
 const halo=(x,y,z,r,ry=0)=>add('ring',1,x,y,z,r,r,r,0,ry);
 // Belt seal and chest inlay sit outside the base skin.
 gem(0,1.15,-.28,.095);plate(0,.98,-.25,.31,.058,.055);
 for(const side of [-1,1])for(let i=0;i<3;i++)gem(side*(.08+i*.045),1.3-i*.045,-.255,.023);

 switch(head){
  case 'horns': for(const s of [-1,1])add('cone',1,s*.23,2.05,-.04,.09,.49,.10,-.25,0,-s*.58);break;
  case 'sun': halo(0,2.15,.19,.34);for(let i=0;i<10;i++){const a=i*Math.PI/5;gem(Math.cos(a)*.39,2.15+Math.sin(a)*.39,.2,.044);}break;
  case 'ribbons': for(const s of [-1,1])for(let i=0;i<4;i++)add('crystal',1,s*(.17+i*.074),2.08+i*.11,.13,.05,.19,.04,0,0,-s*.52);break;
  case 'bone': for(let i=0;i<5;i++)add('cone',0,(i-2)*.1,2.12+(i===2?.16:0),.02,.057,.37,.06,0,0,(i-2)*.15);gem(0,1.92,-.21);break;
  case 'thunder': for(const s of [-1,1]){add('cone',1,s*.22,2.20,.03,.07,.55,.08,0,0,-s*.35);plate(s*.19,2.04,.04,.1,.22,.09,s*.5);}break;
  case 'visor': plate(0,1.83,-.182,.39,.13,.13);for(const s of [-1,1])add('crystal',1,s*.13,1.84,-.265,.105,.026,.022,0,0,s*.18);break;
  case 'crystals': for(let i=0;i<6;i++)gem((i-2.5)*.081,2.04+.13*Math.sin(i*.7),0,.067);break;
  case 'fur': for(let i=0;i<10;i++)add('cone',1,(i-4.5)*.061,1.62,.1,.065,.18,.07,0,0,(i-4.5)*.16);break;
  case 'flames': for(let i=0;i<7;i++)add('cone',1,(i-3)*.067,2.04+.15*Math.cos(i*.85),0,.054,.39,.06,.15,0,(i-3)*.1);break;
  case 'crescent': halo(0,2.11,.05,.3);plate(0,2.13,-.065,.14,.31,.14);gem(.33,2.19,.05,.05);break;
  case 'web': for(let i=0;i<5;i++)plate((i-2)*.075,2.05,.01,.026,.34,.034,(i-2)*.33);halo(0,2.12,.1,.24);break;
  case 'mask': add('crystal',0,0,1.79,-.205,.18,.22,.09);gem(0,1.78,-.29,.058);break;
  case 'swords': for(let i=0;i<3;i++)add('crystal',1,(i-1)*.2,2.21+.06*(i%2),.17,.045,.39,.038,0,0,(i-1)*.41);break;
  case 'crest': add('crystal',1,0,2.11,.02,.085,.33,.22,-.42);plate(0,1.91,.035,.13,.14,.29);break;
  case 'hood': add('cone',0,0,1.95,.04,.24,.3,.24,.18);for(const s of [-1,1])gem(s*.11,1.78,-.218,.035);break;
  case 'split': for(const s of [-1,1])add('crystal',1,s*.18,2.11,-.035,.075,.28,.07,0,0,s*.65);break;
  case 'boulders': for(const s of [-1,1])add('rock',0,s*.22,2.04,.018,.16,.18,.15,0,.3,s*.45);gem(0,2.18,0,.072);break;
  case 'geode': for(let i=0;i<4;i++)gem((i-1.5)*.11,2.11,.02,.089,2+i);break;
  case 'elements': for(let i=0;i<4;i++){const angle=i*Math.PI/2;gem(Math.cos(angle)*.33,2.17+Math.sin(angle)*.33,.12,.09,2+i);}break;
  case 'compass': halo(0,2.16,.17,.29);for(let i=0;i<4;i++)add('crystal',2+i,Math.sin(i*Math.PI/2)*.32,2.16+Math.cos(i*Math.PI/2)*.32,.17,.064,.11,.044,0,0,-i*Math.PI/2);break;
  case 'fracture': for(let i=0;i<5;i++)plate((i-2)*.11,2.22+Math.cos(i)*.13,.12,.045,.39,.035,(i-2)*.36);break;
  case 'duel': for(const s of [-1,1]){plate(s*.14,1.85,-.2,.095,.13,.09,s*.22);add('crystal',1,s*.24,2.13,.06,.045,.27,.04,0,0,-s*.8);}break;
  case 'crown': halo(0,2.03,.05,.28);for(let i=0;i<7;i++)add('cone',1,(i-3)*.09,2.19+.08*(i%2),.03,.065,.33,.07,0,0,(i-3)*.13);break;
  case 'eye': add('sphere',0,0,2.12,-.06,.26,.125,.09);gem(0,2.12,-.155,.12);break;
  case 'clock': halo(0,2.28,.12,.33);plate(0,2.33,.115,.035,.26,.045,.13);plate(.068,2.25,.12,.175,.032,.04,-.32);break;
  case 'loom': for(const s of [-1,1])halo(s*.15,2.14,.08,.23,s*.49);gem(0,2.41,.095,.054);break;
 }

 for(const s of [-1,1]){
  if(back==='shield'||back==='fortress'||back==='plates'||back==='ramparts'){
   const size=back==='fortress'?.28:back==='ramparts'?.34:.23;
   for(let i=0;i<3;i++){plate(s*(.36+i*.067),1.49-i*.075,.03,size,.14,.31,-s*.22);gem(s*(.34+i*.08),1.53-i*.07,-.144,.028);}
  }else if(back==='wings'||back==='fins'||back==='prisms'||back==='tusks'||back==='tentacles'){
   const length=back==='wings'?.86:back==='tentacles'?.75:back==='tusks'?.42:.62;
   for(let i=0;i<4;i++)add(back==='prisms'?'crystal':'cone',i%2,s*(.27+i*.15),1.53-i*.065,.23,.075,length-i*.077,.08,.24,0,-s*(.65+i*.21));
  }else if(back==='lanterns'||back==='embers'||back==='comets'||back==='stones'||back==='scales'){
   for(let i=0;i<3;i++){const x=s*(.43+i*.17),y=1.45-i*.14;add(back==='stones'?'rock':'crystal',back==='comets'?2+(i+2*(s>0))%4:i%2,x,y,.23,.105,.16,.11);halo(x,y,.26,.11);}
  }else if(back==='gates'||back==='hands'||back==='threads'||back==='ribcage'){
   for(let i=0;i<4;i++){
    if(back==='gates'||back==='ribcage')halo(s*(.24+i*.055),1.44-i*.15,.25,.15+i*.05,s*.42);
    else plate(s*(.32+i*.13),1.44-i*.09,.22,.033,.51-i*.053,.051,s*(.48+i*.15));
   }
  }else{
   const height=back==='scabbards'?.78:back==='rapiers'?.82:back==='towers'?.65:.47;
   for(let i=0;i<3;i++)add(back==='towers'?'cube':'crystal',i%2,s*(.23+i*.15),1.34+i*.12,.23,.064,height,.069,.24,0,-s*(.27+i*.19));
  }
 }
 const dummy=new THREE.Object3D(),items=[];
 for(const shape of Object.keys(shapes))for(const [tone,material] of [solid,trim,...jewels].entries()){
  const matches=pieces.filter(piece=>piece.shape===shape&&piece.tone===tone);
  if(!matches.length){continue;}
  const matrices=matches.map(piece=>{
   dummy.position.set(...piece.position);dummy.scale.set(...piece.scale);dummy.rotation.set(...piece.rotation);dummy.updateMatrix();return dummy.matrix.clone();
  });
  items.push({geometry:shapes[shape],material,matrices});
 }
 return items;
}

export function attachAdvancementRegalia(model,id){
 if(!Object.hasOwn(looks,id))return false;
 if(!templates.has(id))templates.set(id,template(id));
 const group=new THREE.Group();
 group.name='advancement-'+id;
 for(const {geometry,material,matrices} of templates.get(id)){
  const part=new THREE.InstancedMesh(geometry,material,matrices.length);
  matrices.forEach((matrix,index)=>part.setMatrixAt(index,matrix));
  part.instanceMatrix.needsUpdate=true;
  part.computeBoundingSphere();
  group.add(part);
 }
 (model.getObjectByName('body')||model).add(group);
 return true;
}
