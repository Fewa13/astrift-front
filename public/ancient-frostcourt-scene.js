// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
import {buildDistinctFrostcourt} from './ancient-chapter-worlds.js?v=20261107-chapter-ground-2';
import {FROSTCOURT_SOLIDS,FROSTCOURT_KINDS,frostcourtHeight,frostcourtSurface} from './ancient-frostcourt.js?v=20261020-frostcourt-1';
import {mergeEnvironment,environmentTexture} from './ancient-environment-detail.js?v=20261012-new-player-flow-1';
const G={box:new T.BoxGeometry(1,1,1),column:new T.CylinderGeometry(1,1,1,10),cone:new T.ConeGeometry(1,1,8),orb:new T.IcosahedronGeometry(1,1),crystal:new T.OctahedronGeometry(1),ring:new T.TorusGeometry(1,.055,6,28),arch:new T.TorusGeometry(1,.045,6,32,Math.PI)};
const M={stone:new T.MeshStandardMaterial({color:0x596c7c,map:environmentTexture('stone'),roughness:.87}),ice:new T.MeshStandardMaterial({color:0xa7c8d7,metalness:.3,roughness:.38}),dark:new T.MeshStandardMaterial({color:0x26323e,roughness:.82}),iron:new T.MeshStandardMaterial({color:0x394a58,metalness:.7,roughness:.43}),gold:new T.MeshStandardMaterial({color:0xb8985b,metalness:.65,roughness:.35}),ember:new T.MeshStandardMaterial({color:0x624034,roughness:.75}),cold:new T.MeshBasicMaterial({color:0x88d9fa}),fire:new T.MeshBasicMaterial({color:0xffb15e}),snow:new T.MeshStandardMaterial({color:0xd9e5e8,roughness:.96}),cloth:new T.MeshStandardMaterial({color:0x344c68,roughness:.9,side:T.DoubleSide})};
const add=(parent,geo,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0)=>{const m=new T.Mesh(G[geo],M[mat]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx,ry,rz);parent.add(m);return m;};
function crown(g,x,y,z,r,material){add(g,'ring','gold',x,y,z,r,r,r,Math.PI/2);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;add(g,'crystal',material,x+Math.cos(a)*r,y+.8,z+Math.sin(a)*r,.3,1.2,.3,0,0,Math.cos(a)*.15);}}
export function buildFrostcourtScene(scene){return buildDistinctFrostcourt(scene);}
const templates=new Map();
export function createFrostcourtCreature(kind,level){
 if(!templates.has(kind)){
  const root=new T.Group(),body=new T.Group();body.name='body';root.add(body);root.scale.setScalar(FROSTCOURT_KINDS[kind].size);const boss=kind==='frost_crowned',forge=kind==='ember_mason'||kind==='furnace_regent',heavy=kind==='chain_executor'||kind==='furnace_regent',primary=forge?'iron':'ice',glow=forge?'fire':'cold';
  add(body,'orb','dark',0,1.13,0,.36,.52,.27);add(body,'box',primary,0,1.32,-.13,.67,.48,.3);add(body,'crystal','gold',0,1.28,-.31,.11,.2,.08);add(body,'box','iron',0,.84,0,.56,.18,.38);
  add(body,'orb','dark',0,1.92,0,.23,.25,.22);add(body,'box',primary,0,1.97,.02,.45,.28,.34);add(body,'box',glow,0,1.92,-.22,.29,.045,.04);for(const s of [-1,1]){add(body,'cone','gold',s*.2,2.14,.01,.07,.35,.08,0,0,-s*.35);for(let j=0;j<3;j++)add(body,'box',primary,s*(.19+j*.07),.76-j*.09,.02,.12,.3,.27,0,0,s*.13);}
  for(const s of [-1,1]){const arm=new T.Group();arm.name='arm'+(s<0?0:1);arm.position.set(s*.46,1.52,0);body.add(arm);add(arm,'orb',primary,0,-.04,0,.27,.22,.27);add(arm,'column','iron',0,-.29,0,.1,.5,.1);add(arm,'box',primary,0,-.38,-.02,.22,.28,.23);add(arm,'box','gold',0,-.56,0,.2,.12,.2);for(let j=0;j<3;j++)add(arm,'cone',primary,s*.12,-.02+j*.06,.02,.07,.22,.08,0,0,-s*.6);
   const leg=new T.Group();leg.name='leg'+(s<0?0:1);leg.position.set(s*.18,.7,0);body.add(leg);add(leg,'column','iron',0,-.25,0,.12,.5,.12);add(leg,'box',primary,0,-.26,-.08,.23,.36,.18);add(leg,'box','dark',0,-.58,-.09,.28,.17,.4);
   if(kind==='frost_oathguard'&&s<0){add(arm,'box','iron',0,-.65,-.2,.57,.9,.14);add(arm,'crystal','ice',0,-.65,-.3,.28,.43,.1);add(arm,'box',glow,0,-.66,-.42,.045,.55,.03);}
   if((kind==='frost_oathguard'||boss)&&s>0){add(arm,'column','gold',0,-.6,0,.045,2,.045);add(arm,'crystal',glow,0,.55,0,.11,.45,.1);}
   if(heavy&&s>0){add(arm,'column','iron',0,-.8,0,.06,1.3,.06);add(arm,'box','iron',0,-1.25,0,.7,.4,.3);for(let j=0;j<4;j++)add(arm,'crystal','gold',(j-1.5)*.15,-1.44,0,.09,.18,.1);}
  }
  if(forge){for(const s of [-1,1]){add(body,'column','iron',s*.28,1.3,.34,.13,.7,.13);for(const h of [.98,1.35,1.62])add(body,'ring','gold',s*.28,h,.34,.15,.15,.15,Math.PI/2);}add(body,'orb','fire',0,1.32,.38,.19,.24,.15);for(let i=0;i<4;i++)add(body,'box','gold',0,1.1+i*.12,-.3,.48,.035,.05);}
  if(kind==='chain_executor'){for(const s of [-1,1])for(let i=0;i<7;i++)add(body,'ring','gold',s*(.34+Math.sin(i*.5)*.05),1.35-i*.13,.24,.065,.065,.065,0,i%2*Math.PI/2);add(body,'box','cloth',0,1.1,.32,.72,.95,.06);}
  if(boss){for(const s of [-1,1]){add(body,'box',s<0?'ice':'gold',s*.57,1.62,.1,.42,.25,.4,0,0,s*.2);for(let i=0;i<4;i++)add(body,'crystal',s<0?'cold':'fire',s*(.38+i*.12),1.75+i*.09,.15,.08,.35,.1,0,0,-s*.25);add(body,'box','cloth',s*.25,1.13,.4,.46,1.5,.06,0,0,s*.1);}crown(body,0,2.18,0,.23,'gold');add(body,'ring','gold',0,1.65,.46,.74,.74,.74);for(let i=0;i<8;i++){const a=i*Math.PI/4;add(body,'crystal',i<4?'cold':'fire',Math.sin(a)*.73,1.65+Math.cos(a)*.73,.46,.07,.18,.06,0,0,-a);}}
  const bake=g=>{for(const n of g.children)if(n.isGroup)bake(n);mergeEnvironment(g);};bake(root);templates.set(kind,root);
 }
 const root=templates.get(kind).clone(true);root.userData={kind,level,height:FROSTCOURT_KINDS[kind].size*2.7,body:root.getObjectByName('body'),arms:[root.getObjectByName('arm0'),root.getObjectByName('arm1')],legs:[root.getObjectByName('leg0'),root.getObjectByName('leg1')]};return root;
}
