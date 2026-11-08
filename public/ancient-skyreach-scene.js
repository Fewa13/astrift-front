// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
import {buildDistinctSkyreach} from './ancient-chapter-worlds.js?v=20261107-chapter-ground-1';
import {SKYREACH_SOLIDS,SKYREACH_KINDS,skyreachHeight,skyreachSurface} from './ancient-skyreach.js?v=20261021-skyreach-market-1';
import {mergeEnvironment,environmentTexture} from './ancient-environment-detail.js?v=20261012-new-player-flow-1';
const G={box:new T.BoxGeometry(1,1,1),orb:new T.IcosahedronGeometry(1,1),crystal:new T.OctahedronGeometry(1),column:new T.CylinderGeometry(1,1,1,10),ring:new T.TorusGeometry(1,.045,6,32),cone:new T.ConeGeometry(1,1,8)};
const M={stone:new T.MeshStandardMaterial({color:0x394659,map:environmentTexture('stone'),roughness:.8}),dark:new T.MeshStandardMaterial({color:0x171e32,roughness:.68}),gold:new T.MeshStandardMaterial({color:0xc7a766,metalness:.65,roughness:.35}),glass:new T.MeshStandardMaterial({color:0x568caf,metalness:.3,roughness:.24}),cloth:new T.MeshStandardMaterial({color:0x263d72,roughness:.9,side:T.DoubleSide}),light:new T.MeshBasicMaterial({color:0x8ce6ff}),violet:new T.MeshBasicMaterial({color:0xb7a2ff})};
function add(g,shape,material,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const m=new T.Mesh(G[shape],M[material]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx,ry,rz);g.add(m);return m;}
export function buildSkyreachScene(scene){return buildDistinctSkyreach(scene);}
const templates=new Map();
export function createSkyreachCreature(kind,level){
 if(!templates.has(kind)){const root=new T.Group(),body=new T.Group(),d=SKYREACH_KINDS[kind],boss=d.boss,heavy=kind==='prism_golem';body.name='body';root.add(body);root.scale.setScalar(d.size);
  add(body,heavy?'crystal':'box','dark',0,1.2,0,.6,.65,.34);add(body,'crystal','glass',0,1.26,-.22,.24,.34,.15);add(body,'box','gold',0,.94,-.2,.65,.08,.1);add(body,'orb','stone',0,1.83,0,.20,.25,.19);add(body,'box','dark',0,1.82,-.18,.34,.23,.08);add(body,'box','light',0,1.84,-.23,.25,.035,.02);
  for(const s of [-1,1]){const arm=new T.Group(),leg=new T.Group();arm.name='arm'+(s<0?0:1);leg.name='leg'+(s<0?0:1);arm.position.set(s*.37,1.5,0);leg.position.set(s*.17,.85,0);body.add(arm,leg);add(arm,'box','stone',0,-.24,0,.18,.42,.20);add(arm,'box','gold',0,-.46,-.02,.20,.16,.20);add(arm,'orb','dark',0,-.59,-.02,.10,.11,.10);add(leg,'box','dark',0,-.28,0,.17,.48,.18);add(leg,'box','gold',0,-.48,-.04,.19,.08,.22);add(leg,'box','stone',0,-.65,-.08,.21,.19,.32);add(body,'crystal','glass',s*.43,1.57,0,.18,.3,.22);if(s>0){add(arm,'column','gold',0,-.55,-.13,.04,1.9,.04);add(arm,'crystal','light',0,.53,-.13,.10,.36,.10);}}
  if(kind==='storm_weaver'||boss){for(let i=0;i<3;i++)add(body,'ring',i===1?'light':'gold',0,1.55,.33,.55+i*.12,.55+i*.12,.55+i*.12,0,0,i*.6);for(const s of [-1,1])for(let i=0;i<4;i++)add(body,'crystal','glass',s*(.5+i*.15),1.5+i*.18,.28,.09,.42,.12,0,0,-s*.6);}
  if(heavy){add(body,'crystal','glass',0,1.32,.1,.8,.9,.5);for(const s of [-1,1])add(body,'box','gold',s*.48,1.63,0,.5,.25,.4);}
  if(boss){for(let i=0;i<7;i++){const a=i*Math.PI*2/7;add(body,'crystal','gold',Math.sin(a)*.26,2.16,Math.cos(a)*.26,.055,.35,.055,0,0,Math.sin(a)*.3);}add(body,'crystal','violet',0,1.3,-.35,.16,.23,.10);}
  const bake=g=>{for(const c of g.children)if(c.isGroup)bake(c);mergeEnvironment(g)};bake(root);templates.set(kind,root);
 }const root=templates.get(kind).clone(true);root.userData={kind,level,height:SKYREACH_KINDS[kind].size*2.4,body:root.getObjectByName('body'),arms:[root.getObjectByName('arm0'),root.getObjectByName('arm1')],legs:[root.getObjectByName('leg0'),root.getObjectByName('leg1')]};return root;
}
