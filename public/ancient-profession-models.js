// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as THREE from './three.module.js';
const templates=new Map(),unit={box:new THREE.BoxGeometry(1,1,1),orb:new THREE.SphereGeometry(1,12,8),cone:new THREE.ConeGeometry(1,1,8),crystal:new THREE.OctahedronGeometry(1),tube:new THREE.CylinderGeometry(1,1,1,8),ring:new THREE.TorusGeometry(1,.06,5,24)};
export const PROFESSION_LOOKS={
 shadowblade:{cloth:0x201e38,metal:0x3d405d,trim:0xb4a2d9,glow:0xa490ff,skin:0xb4a4a2},
 stonewright:{cloth:0x52412c,metal:0x737367,trim:0xe3b979,glow:0xffc96c,skin:0xba9a78},
 warrior:{cloth:0x5d2731,metal:0x586676,trim:0xd6a66a,glow:0xffa74b,skin:0xc9a888},
 summoner:{cloth:0x24564d,metal:0x4b6663,trim:0xd8cfab,glow:0x51ffd0,skin:0xb49d86},
 ice:{cloth:0x244b79,metal:0x77acbe,trim:0xc0eaff,glow:0x70e9ff,skin:0xc2cadd},
 lightning:{cloth:0x272d61,metal:0x475579,trim:0xf1d189,glow:0xffe67b,skin:0xbcb4a0},
 curse:{cloth:0x38214d,metal:0x463950,trim:0xa083b1,glow:0xc579ff,skin:0xa995aa},
 swordsman:{cloth:0x194f3e,metal:0x547a69,trim:0xd0c69b,glow:0x67ff9c,skin:0xc2aa88},
 adventurer:{cloth:0x3c5547,metal:0x596962,trim:0xbb9e71,glow:0x8bd0a7,skin:0xc3a887}
};
function makeTemplate(job){
 const palette=PROFESSION_LOOKS[job],root=new THREE.Group(),body=new THREE.Group();body.name='body';root.add(body);
 const solid=new THREE.MeshStandardMaterial({vertexColors:true,metalness:.48,roughness:.52}),glow=new THREE.MeshStandardMaterial({color:palette.glow,emissive:palette.glow,emissiveIntensity:.7,roughness:.35});
 const add=(parent,shape,tone,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0)=>{const mesh=new THREE.Mesh(unit[shape],tone==='glow'?glow:solid);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.set(rx,ry,rz);mesh.userData.tint=tone==='ink'?0x101823:palette[tone]||palette.trim;parent.add(mesh);return mesh};
 const box=(p,t,x,y,z,sx,sy,sz,rz=0)=>add(p,'box',t,x,y,z,sx,sy,sz,0,0,rz);
 // Closed chest surfaces, proud head silhouette and articulated limbs.
 add(body,'orb','cloth',0,1.17,0,.29,.4,.2);add(body,'orb','skin',0,1.76,-.015,.18,.22,.17);box(body,'metal',0,1.1,-.19,.52,.52,.07);box(body,'cloth',0,1.04,.2,.54,.55,.05);
 for(const side of [-1,1]){add(body,'orb','ink',side*.065,1.795,-.172,.027,.018,.014);box(body,'trim',side*.062,1.828,-.166,.065,.011,.017,side*.13)}add(body,'crystal','skin',0,1.762,-.19,.025,.045,.025);box(body,'ink',0,1.692,-.176,.064,.009,.012);
 for(const side of [-1,1]){
  const leg=new THREE.Group();leg.name='leg'+(side===-1?0:1);leg.position.set(side*.16,.79,0);body.add(leg);add(leg,'tube','cloth',0,-.23,0,.1,.46,.105);box(leg,'metal',0,-.39,-.085,.15,.27,.06);box(leg,'metal',0,-.61,-.065,.21,.17,.31);for(let i=0;i<3;i++)box(leg,'trim',0,-.3-i*.075,-.124,.12,.015,.018);
  const arm=new THREE.Group();arm.name='arm'+(side===-1?0:1);arm.position.set(side*.34,1.45,0);body.add(arm);add(arm,'orb','cloth',side*.025,-.18,0,.105,.22,.12);box(arm,'metal',0,-.39,-.02,.155,.23,.16);add(arm,'orb','skin',0,-.55,-.025,.075,.09,.075);for(let i=0;i<3;i++)box(arm,'trim',0,-.31-i*.062,-.105,.14,.014,.02);
  box(body,'trim',side*.11,1.12,-.239,.024,.38,.014,side*.14);box(body,'trim',side*.16,1.72,-.167,.034,.18,.03,side*-.1);
 }
 box(body,'trim',0,.91,-.224,.59,.065,.025);add(body,'crystal','glow',0,.92,-.26,.055,.068,.025);
 for(let i=0;i<7;i++)add(body,'orb','trim',(i-3)*.067,.935,-.245,.018,.018,.012);
 const robe=['summoner','ice','curse'].includes(job);
 for(const side of [-1,1])for(let i=0;i<4;i++){const x=side*(.11+i*.057);box(body,'cloth',x,.6,.03,.053,.62,.32,side*-.06);box(body,'trim',x,.32,-.137,.038,.02,.019);if(i%2===0)box(body,'metal',x,robe?.59:.72,-.153,.047,robe?.28:.13,.02)}
 const cape=robe?1.3:.65;for(let i=0;i<5;i++)box(body,'cloth',(i-2)*.105,robe?.94:1.02,.245,.102,cape,.06,(i-2)*.02);
 if(job==='shadowblade'){
  add(body,'orb','cloth',0,1.87,.025,.24,.27,.22);box(body,'metal',0,1.73,-.205,.3,.16,.045);
  for(const side of [-1,1]){
   box(body,'glow',side*.065,1.795,-.237,.08,.019,.01,side*.17);
   for(let i=0;i<3;i++){box(body,'metal',side*(.32+i*.035),1.49-i*.065,0,.2,.05,.3,side*.28);add(body,'cone','trim',side*(.35+i*.05),1.57-i*.045,.08,.026,.18,.035,0,0,-side*.9);}
   for(let i=0;i<4;i++){box(body,'metal',side*.17,1.3-i*.09,-.226,.17,.067,.045,side*.26);box(body,'glow',side*.19,1.3-i*.09,-.253,.055,.012,.014,side*.26);}
   // Paired back blades, wrapped grips and independent asymmetric coattails.
   box(body,'metal',side*.24,1.25,.31,.075,.9,.065,-side*.48);add(body,'cone','trim',side*.44,1.64,.31,.06,.2,.055,0,0,-side*.48);
   box(body,'trim',side*.06,.87,.31,.28,.035,.07,-side*.48);box(body,'cloth',side*.02,.76,.31,.05,.24,.05,-side*.48);
   box(body,'cloth',side*.25,.61,.22,.15,.66,.055,side*.2);box(body,'glow',side*.28,.4,.255,.025,.17,.012,side*.2);
   const arm=body.getObjectByName('arm'+(side<0?0:1));for(let i=0;i<4;i++)box(arm,'cloth',0,-.3-i*.055,-.113,.16,.035,.025,side*.12);
  }
  add(body,'crystal','glow',0,1.4,-.24,.055,.09,.025);
 }else if(job==='stonewright'){
  add(body,'crystal','metal',0,1.86,.015,.245,.22,.22);box(body,'metal',0,1.73,-.2,.34,.15,.075);box(body,'glow',0,1.8,-.25,.24,.02,.012);
  for(const side of [-1,1]){
   for(let i=0;i<3;i++){add(body,'crystal','metal',side*(.38+i*.05),1.51+i*.065,.04,.2,.2,.22,0,0,-side*.4);box(body,'glow',side*(.38+i*.045),1.5+i*.06,-.16,.025,.13,.014,side*.45);}
   const arm=body.getObjectByName('arm'+(side<0?0:1));add(arm,'crystal','metal',side*.02,-.4,0,.17,.21,.18);for(let i=0;i<3;i++)box(arm,'glow',side*.025,-.36-i*.045,-.175,.14,.012,.015);
   add(body,'crystal','metal',side*.18,.6,.04,.15,.22,.17);box(body,'glow',side*.16,.66,-.12,.035,.12,.013);
  }
  for(let i=0;i<4;i++){add(body,'crystal','metal',(i%2?1:-1)*.11,1.37-Math.floor(i/2)*.19,-.23,.125,.13,.055);box(body,'glow',0,1.36-i*.08,-.28,.022,.05,.013);}
  for(let i=0;i<3;i++){add(body,'crystal','metal',(i-1)*.23,1.42+Math.abs(i-1)*.09,.4,.16,.4,.13,0,0,(i-1)*.22);box(body,'glow',(i-1)*.23,1.42,.54,.025,.2,.014);}
 }else if(job==='warrior'){
  add(body,'orb','metal',0,1.84,0,.235,.22,.215);box(body,'metal',0,1.72,-.183,.35,.14,.08);box(body,'glow',0,1.755,-.228,.24,.021,.012);box(body,'trim',0,1.9,-.199,.038,.28,.027);
  for(const side of [-1,1]){add(body,'cone','trim',side*.23,2.04,0,.06,.33,.065,0,0,side*-.48);for(let i=0;i<3;i++){add(body,'orb','metal',side*(.36+i*.05),1.48-i*.055,0,.19,.08,.22);box(body,'trim',side*(.37+i*.05),1.495-i*.055,-.17,.19,.02,.025)}for(let i=0;i<3;i++)add(body,'cone','metal',side*(.34+i*.065),1.66,0,.04,.19+i*.025,.04,0,0,side*-.3)}
  box(body,'trim',0,1.3,-.238,.18,.13,.025);for(const side of [-1,1])box(body,'trim',side*.055,1.39,-.23,.036,.15,.02,side*.6);
 }else if(job==='summoner'){
  add(body,'orb','cloth',0,1.84,.015,.245,.27,.22);box(body,'trim',0,1.78,-.202,.28,.15,.035);for(const side of [-1,1]){add(body,'orb','metal',side*.07,1.81,-.226,.045,.047,.02);add(body,'orb','glow',side*.07,1.81,-.246,.024,.025,.007);add(body,'cone','trim',side*.21,2.06,.03,.055,.34,.05,0,0,side*-.35);add(body,'crystal','trim',side*.36,1.48,0,.19,.14,.21);for(let i=0;i<4;i++)add(body,'cone','trim',side*(.26+i*.056),1.52,-.16,.022,.17,.023,.4);box(body,'metal',side*.3,.91,.16,.16,.24,.1);for(let i=0;i<4;i++)add(body,'orb','trim',side*.12,1.2+i*.045,-.245,.027,.026,.015)}
  add(body,'ring','trim',0,1.36,-.244,.11,.11,.11);add(body,'crystal','glow',0,1.36,-.264,.066,.066,.025);box(body,'metal',0,1.3,.29,.26,.36,.075);box(body,'trim',0,1.3,.334,.21,.31,.02);box(body,'glow',0,1.3,.352,.05,.12,.008);
 }else if(job==='ice'){
  for(let i=0;i<7;i++){const a=(i-3)*.36;add(body,'crystal','metal',Math.sin(a)*.22,1.98+(.15-Math.abs(i-3)*.025),-Math.cos(a)*.06,.047,.25-Math.abs(i-3)*.025,.065,0,0,-a*.4)}
  for(const side of [-1,1]){for(let i=0;i<3;i++)add(body,'crystal','metal',side*(.34+i*.06),1.51+i*.055,.025,.1,.18,.11,0,0,-side*.5);box(body,'glow',side*.13,1.24,-.247,.017,.32,.014,side*.2);add(body,'crystal','glow',side*.22,.57,-.185,.023,.1,.012)}
  add(body,'crystal','glow',0,1.46,-.22,.08,.13,.04);for(let i=0;i<6;i++)add(body,'crystal','metal',Math.sin(i*Math.PI/3)*.27,1.3+Math.cos(i*Math.PI/3)*.27,.3,.045,.11,.04,0,0,-i*Math.PI/3);
 }else if(job==='lightning'){
  add(body,'orb','metal',0,1.84,.015,.218,.24,.21);box(body,'trim',0,1.78,-.203,.32,.07,.035);box(body,'glow',0,1.805,-.227,.25,.018,.009);
  for(const side of [-1,1]){add(body,'cone','trim',side*.17,2.13,.03,.035,.32,.04,0,0,-side*.25);add(body,'crystal','metal',side*.4,1.53,.04,.21,.13,.18,0,0,side*.35);for(let i=0;i<4;i++)box(body,'glow',side*(.045+(i%2)*.045),1.36-i*.065,-.242,.02,.095,.014,side*(i%2?.65:-.65));}
  add(body,'ring','trim',0,1.53,.35,.52,.52,.52);for(let i=0;i<8;i++){const a=i*Math.PI/4;add(body,'crystal','glow',Math.sin(a)*.52,1.53+Math.cos(a)*.52,.355,.045,.11,.022,0,0,-a)}
 }else if(job==='curse'){
  add(body,'orb','cloth',0,1.87,.025,.25,.3,.23);add(body,'crystal','metal',0,1.77,-.21,.155,.2,.065);for(const side of [-1,1]){box(body,'glow',side*.057,1.805,-.27,.056,.02,.009,side*.25);add(body,'cone','metal',side*.24,2.055,.02,.07,.3,.065,0,0,side*-.7);add(body,'cone','metal',side*.4,1.53,.07,.19,.27,.2,0,0,side*-.7);for(let i=0;i<5;i++)add(body,'ring','trim',side*(.06+i*.04),1.32-i*.07,-.23,.035,.035,.035);box(body,'metal',side*.22,.86,-.12,.17,.23,.06)}
  add(body,'crystal','glow',0,1.24,-.25,.055,.11,.03);box(body,'metal',-.32,1.15,.29,.26,.36,.09,.18);box(body,'glow',-.32,1.15,.34,.11,.025,.012,.18);
 }else if(job==='swordsman'){
  add(body,'orb','metal',0,1.86,.015,.21,.18,.2);box(body,'trim',0,1.77,-.18,.34,.046,.026);for(const side of [-1,1]){add(body,'cone','metal',side*.23,1.94,.03,.047,.28,.05,0,0,-side*1.1);for(let i=0;i<4;i++){box(body,'metal',side*.29,1.51-i*.055,-.01,.25,.055,.34,side*.12);box(body,'trim',side*.29,1.54-i*.055,-.19,.23,.009,.013,side*.12)}}
  for(let i=0;i<5;i++){box(body,'metal',0,1.38-i*.075,-.226,.37,.065,.03);for(const side of [-1,1])box(body,'trim',side*.12,1.39-i*.075,-.247,.018,.026,.013)}
  for(const side of [-1,1]){box(body,'metal',side*.18,1.17,.32,.052,.92,.07,side*.3);box(body,'trim',side*.34,1.63,.34,.21,.035,.075,side*.3);box(body,'cloth',side*.37,1.73,.34,.04,.18,.055,side*.3);box(body,'glow',side*.13,1.53,-.237,.015,.18,.01,side*-.4)}
 }
 // Bake every rigid joint into two shared draw calls, keeping articulation intact.
 function bake(group){for(const child of [...group.children])if(child.isGroup)bake(child);for(const material of [solid,glow]){const parts=group.children.filter(n=>n.isMesh&&n.material===material);if(!parts.length)continue;const arrays={position:[],normal:[],color:[]};for(const mesh of parts){mesh.updateMatrix();const geo=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();geo.applyMatrix4(mesh.matrix);const p=geo.attributes.position,n=geo.attributes.normal,color=new THREE.Color(mesh.userData.tint);arrays.position.push(...p.array);arrays.normal.push(...n.array);for(let i=0;i<p.count;i++)arrays.color.push(color.r,color.g,color.b);geo.dispose();group.remove(mesh)}const merged=new THREE.BufferGeometry();for(const [key,values]of Object.entries(arrays))merged.setAttribute(key,new THREE.Float32BufferAttribute(values,3));merged.computeBoundingSphere();const result=new THREE.Mesh(merged,material);result.name='baked-'+(material===glow?'runes':'armor');group.add(result)}}
 bake(root);body.scale.x=job==='stonewright'?1.17:job==='shadowblade'?.96:job==='warrior'?1.14:job==='summoner'?1.06:job==='ice'||job==='curse'?.96:1;root.userData={profession:job,height:2.45,sharedProfessionModel:true};return root;
}
export function createProfessionPlayer(profession){const job=Object.hasOwn(PROFESSION_LOOKS,profession)?profession:'adventurer';if(!templates.has(job))templates.set(job,makeTemplate(job));const root=templates.get(job).clone(true);root.userData={...root.userData,body:root.getObjectByName('body'),legs:[root.getObjectByName('leg0'),root.getObjectByName('leg1')],arms:[root.getObjectByName('arm0'),root.getObjectByName('arm1')]};return root}
