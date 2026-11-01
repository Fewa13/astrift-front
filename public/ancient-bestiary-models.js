// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {combatNow} from './ancient-combat-clock.js';
import * as T from './three.module.js';
import {BESTIARY} from './ancient-bestiary.js?v=20261012-new-player-flow-1';
import {mergeEnvironment,environmentTexture} from './ancient-environment-detail.js?v=20261012-new-player-flow-1';
const geo={box:new T.BoxGeometry(1,1,1),orb:new T.SphereGeometry(1,12,8),rock:new T.IcosahedronGeometry(1,1),cone:new T.ConeGeometry(1,1,8),cyl:new T.CylinderGeometry(1,1,1,10),ring:new T.TorusGeometry(1,.045,5,24),crystal:new T.OctahedronGeometry(1,0)};
const mats={bone:new T.MeshStandardMaterial({color:0xdfc9a3,roughness:.9}),fur:new T.MeshStandardMaterial({map:environmentTexture('wood'),color:0x8c7250,roughness:1}),dark:new T.MeshStandardMaterial({color:0x252b32,roughness:.7}),metal:new T.MeshStandardMaterial({color:0x68676c,metalness:.55,roughness:.4}),leaf:new T.MeshStandardMaterial({color:0x477351,roughness:.8}),white:new T.MeshStandardMaterial({color:0xdde6df,metalness:.3,roughness:.5}),gold:new T.MeshStandardMaterial({color:0xcda95b,metalness:.6,roughness:.3}),robe:new T.MeshStandardMaterial({color:0x77789f,roughness:.8})};
const templates=new Map();
function part(parent,key,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const mesh=new T.Mesh(geo[key],mat);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.set(rx,ry,rz);parent.add(mesh);return mesh}
function limb(parent,name,x,y,z){const group=new T.Group();group.name=name;group.position.set(x,y,z);parent.add(group);return group}
export function createBestiaryCreature(kind,level){const def=BESTIARY[kind];if(!templates.has(kind)){const root=new T.Group(),body=limb(root,'body',0,0,0),glow=new T.MeshStandardMaterial({color:def.color,emissive:def.color,emissiveIntensity:.8,roughness:.4}),skin=new T.MeshStandardMaterial({color:def.color,roughness:.8});root.scale.setScalar(def.size);let height=2.1;const beast=['charge','pounce','dive','shadow'].includes(def.behavior)&&kind!=='oath_cavalry';
 if(beast||kind==='oath_cavalry'){
  const bird=kind==='brokenwing',cat=kind==='branch_panther',shadow=kind==='shade_prowler';height=bird?1.9:1.65;
  part(body,'orb',shadow||bird?mats.dark:cat?mats.leaf:mats.fur,0,.85,0,.52,.5,.95);part(body,'orb',shadow||bird?mats.dark:mats.fur,0,1.04,-.86,.4,.36,.46);part(body,'box',mats.dark,0,.9,-1.22,.35,.08,.12);
  for(const s of [-1,1]){part(body,'orb',glow,s*.21,1.13,-1.2,.065,.045,.04);if(!bird)part(body,'cone',mats.bone,s*.26,.9,-1.2,.07,.42,.065,.5,0,s*.35);part(body,'cone',skin,s*.3,1.37,-.78,.17,.34,.13,0,0,s*.2);for(let j=0;j<5;j++)part(body,'cone',shadow?glow:mats.bone,s*.37,1.15,.55-j*.24,.06,.24,.06,0,0,s*.7)}
  if(bird)part(body,'cone',mats.bone,0,.97,-1.3,.24,.65,.2,-Math.PI/2);
  for(let i=0;i<(bird?2:4);i++){const leg=limb(body,'leg'+i,(i%2?1:-1)*.4,.68,bird?.1:i<2?-.52:.55);part(leg,'cyl',mats.dark,0,-.28,0,.12,.58,.12);part(leg,'orb',skin,0,-.51,-.1,.19,.15,.27);for(let j=0;j<3;j++)part(leg,'cone',mats.bone,-.1+j*.1,-.52,-.33,.03,.14,.03,Math.PI/2)}
  part(body,'cone',shadow?glow:skin,0,.8,1.32,.13,1.2,.13,1.15,0,0);
  for(let i=0;i<2;i++){const wing=limb(body,'arm'+i,(i?1:-1)*.4,1.05,0);if(bird){for(let j=0;j<8;j++){const s=i?1:-1;part(wing,'cone',j%3===0?glow:mats.dark,s*(.3+j*.13),.05-j*.03,.2+j*.06,.12,1.15+j*.06,.09,0,0,-s*1.1)}part(wing,'cyl',skin,(i?1:-1)*.7,0,0,.06,1.5,.06,0,0,Math.PI/2)}}
  if(kind==='oath_cavalry'){height=2.7;part(body,'cone',mats.robe,0,1.5,.1,.4,.9,.35);part(body,'orb',mats.metal,0,2.12,0,.24,.3,.23);part(body,'box',mats.dark,0,2.12,-.25,.34,.05,.02);for(let j=0;j<3;j++)part(body,'cone',mats.gold,-.15+j*.15,2.42,0,.04,.24,.04);part(body,'cyl',mats.gold,.5,1.85,-.5,.045,2.5,.045,.7);part(body,'cone',mats.bone,.5,2.8,-1.27,.11,.5,.11,.7);for(const s of [-1,1])part(body,'box',mats.metal,s*.52,1.05,0,.09,.7,1.25)}
 }else if(def.behavior==='bloom'){
  height=2.1;part(body,'cyl',mats.leaf,0,.8,0,.18,1.55,.18);part(body,'orb',mats.dark,0,1.65,0,.4,.4,.4);for(let i=0;i<9;i++){const a=i/9*Math.PI*2;part(body,'cone',skin,Math.cos(a)*.5,1.65,Math.sin(a)*.5,.25,.9,.25,Math.sin(a)*.7,0,Math.cos(a)*.7);part(body,'cyl',mats.leaf,Math.cos(a)*.36,.2,Math.sin(a)*.36,.09,.85,.09,Math.sin(a)*1.2,0,Math.cos(a)*1.2)}part(body,'orb',glow,0,1.64,-.39,.17,.17,.07);for(let i=0;i<2;i++){limb(body,'arm'+i,(i?1:-1)*.5,1,0);limb(body,'leg'+i,(i?1:-1)*.25,.2,0)}
 }else if(def.behavior==='wisp'){
  height=1.6;part(body,'crystal',glow,0,.95,0,.42,.6,.42);for(let j=0;j<3;j++)part(body,'ring',mats.gold,0,.95,0,.72+j*.08,.72+j*.08,.72+j*.08,j*.9,j);for(let j=0;j<5;j++){const a=j/5*Math.PI*2;part(body,'crystal',skin,Math.sin(a)*.58,.5,Math.cos(a)*.58,.13,.2,.13)}for(let i=0;i<2;i++){limb(body,'arm'+i,0,0,0);limb(body,'leg'+i,0,0,0)}
 }else{
  part(body,'cone',def.behavior==='totem'?mats.fur:def.behavior==='shield'?mats.bone:mats.robe,0,.85,0,.45,1.5,.36);part(body,'box',kind==='noble_echo'?skin:mats.metal,0,1.22,-.06,.6,.44,.35);part(body,'orb',mats.bone,0,1.78,0,.25,.29,.24);part(body,'box',mats.dark,0,1.8,-.24,.32,.065,.04);for(const s of [-1,1]){part(body,'orb',glow,s*.09,1.82,-.28,.045,.025,.02);part(body,'orb',mats.bone,s*.39,1.4,0,.24,.2,.25)}
  for(let j=0;j<4;j++)part(body,'box',mats.gold,0,.93+j*.09,-.31,.4-j*.04,.025,.04);if(kind==='hollow_noble')part(body,'crystal',mats.gold,0,1.25,-.3,.14,.2,.08);if(kind==='noble_echo')part(body,'crystal',skin,0,1.25,-.3,.07,.08,.04);
  for(let i=0;i<2;i++){const s=i?1:-1,arm=limb(body,'arm'+i,s*.46,1.36,0);part(arm,'cyl',mats.dark,0,-.3,0,.1,.65,.1);part(arm,'orb',mats.bone,0,-.65,-.03,.1,.13,.1);const leg=limb(body,'leg'+i,s*.22,.6,0);part(leg,'cyl',mats.dark,0,-.25,0,.1,.6,.1);part(leg,'box',mats.metal,0,-.5,-.1,.23,.15,.35);
   if(def.behavior==='shield'&&i===0){part(arm,'box',mats.fur,0,-.25,-.29,.72,.95,.12);for(let j=0;j<5;j++)part(arm,'cyl',mats.bone,-.28+j*.14,-.25,-.38,.035,.9,.035);part(arm,'orb',mats.bone,0,-.2,-.4,.2,.17,.08)}
   if(i===1){if(def.behavior==='hook'){for(let j=0;j<9;j++)part(arm,'ring',mats.metal,0,-.7-j*.075,-.06,.08,.08,.08,0,j%2*Math.PI/2);part(arm,'ring',mats.gold,0,-1.4,-.06,.17,.17,.17);part(arm,'cone',mats.bone,.14,-1.27,-.06,.04,.27,.04,0,0,.3)}else if(def.behavior==='totem'){part(arm,'cyl',mats.fur,0,-.2,-.15,.05,2,.05);for(let j=0;j<3;j++){part(arm,'orb',mats.bone,0,.5+j*.26,-.15,.21,.18,.16);part(arm,'box',glow,0,.5+j*.26,-.32,.12,.035,.025)}}else if(def.behavior==='javelin'){for(let j=0;j<3;j++){part(arm,'cyl',mats.fur,j*.08,-.2,-.15,.03,2,.03);part(arm,'cone',mats.bone,j*.08,.9,-.15,.07,.32,.07)}}else{part(arm,'cyl',mats.gold,0,-.2,-.15,.025,1.5,.025);part(arm,'crystal',glow,0,.65,-.15,.15,.35,.15)}}
  }
  for(let j=0;j<5;j++)part(body,'cone',def.map==='sanctum'?mats.gold:mats.bone,-.24+j*.12,2.02,0,.045,.25+Math.abs(2-j)*.03,.045);if(def.behavior==='ring'||def.behavior==='twin')for(let j=0;j<2;j++)part(body,'ring',glow,0,1.3+j*.5,.1,.7,.7,.7,Math.PI/2,0,j);
 }
 const shapeNodes=[];root.traverse(o=>{if(o.isGroup)shapeNodes.push(o)});for(const g of shapeNodes.reverse())mergeEnvironment(g);root.userData.height=height*def.size;templates.set(kind,root)}const root=templates.get(kind).clone();root.userData={kind,level,height:templates.get(kind).userData.height,body:root.getObjectByName('body'),arms:[root.getObjectByName('arm0'),root.getObjectByName('arm1')],legs:[0,1,2,3].map(i=>root.getObjectByName('leg'+i)).filter(Boolean)};return root;
}
export function animateBestiary(mesh,m,time,dt){
 const u=mesh.userData,behavior=BESTIARY[m.kind]?.behavior,now=combatNow(),phase=time*.009+mesh.id,travel=['walk','charge','dive','shadow'].includes(m.action),wind=m.action==='windup'||m.action==='shadow',s=m.special||m.attackWindup||m.bossCast;
 const duration=Math.max(1,s?s.hitAt-s.started:600),progress=Math.max(0,Math.min(1,(now-(s?.started??m.actionAt??now))/duration)),ready=wind?Math.min(1,progress*4)*(.65+.35*progress):0;
 for(let i=0;i<u.legs.length;i++){u.legs[i].rotation.set(travel?Math.sin(phase+(i%2)*Math.PI)*.5:0,0,0)}
 for(let i=0;i<2;i++)u.arms[i].rotation.set(wind?-(progress<.75?ready*1.9:1.9-(progress-.75)/.25*2.5):m.action==='attack'?.6:travel?Math.sin(phase+i*Math.PI)*.25:0,0,0);
 u.body.rotation.set(0,0,0);u.body.position.set(0,(m.air||0)+(travel?Math.abs(Math.sin(phase))*.035:Math.sin(time*.002)*.025),0);u.body.scale.set(1,m.action==='shadow'?.25:1,1);
 if(behavior==='shield')u.arms[0].rotation.x=m.action==='guard'||m.action==='idle'||m.action==='walk'?-.9:wind?.7*ready:0;
 if(wind&&['charge','pounce','shadow'].includes(behavior)){
  u.body.position.y-=ready*.22;u.body.position.z+=ready*.32;u.body.rotation.x=-ready*.35;u.body.scale.y=m.action==='shadow'?.25:1-ready*.18;
  for(let i=0;i<u.legs.length;i++)u.legs[i].rotation.x=ready*(i<2?-.85:1.1);
  if(behavior==='charge')u.body.rotation.x=ready*.48;
 }
 if(behavior==='dive')for(let i=0;i<2;i++){u.arms[i].rotation.z=(i?1:-1)*(wind?-.95*ready:m.action==='recover'?-.2:.15+Math.sin(time*.012)*.3);if(wind)u.arms[i].rotation.x=-.5*ready}
 if(wind&&behavior==='dive'){u.body.position.y+=ready*.3;u.body.rotation.x=-.4*ready;for(const leg of u.legs)leg.rotation.x=.85*ready}
 if(wind&&['hook','javelin','totem','ring','illusion','twin'].includes(behavior)){u.body.rotation.y=-.4*ready;u.body.rotation.x=-.15*ready;u.arms[1].rotation.x=-2.5*ready;u.arms[1].rotation.z=-.45*ready;u.arms[0].rotation.x=-.7*ready}
 if(wind&&behavior==='bloom'){u.body.scale.set(1+ready*.2,1-ready*.15,1+ready*.2);u.body.rotation.x=-.25*ready}
 if(wind&&behavior==='wisp'){u.body.position.y+=ready*.35;u.body.scale.setScalar(1+ready*.2);u.body.rotation.y=ready*.65}
 if(!wind&&m.action==='charge')u.body.rotation.x=.15;
 if(m.facing!==undefined)mesh.rotation.y=m.facing+Math.PI;mesh.visible=m.hp>0;
}
