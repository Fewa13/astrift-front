// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
import {buildSunkenRuins} from './ancient-chapter-environments.js?v=20261023-rebuild-1';
import {STARFALL_SOLIDS,STARFALL_KINDS,starfallHeight,starfallSurface} from './ancient-starfall.js?v=20261015-starfall-1';
import {mergeEnvironment,environmentTexture} from './ancient-environment-detail.js?v=20261012-new-player-flow-1';
const G={box:new T.BoxGeometry(1,1,1),column:new T.CylinderGeometry(1,1,1,10),cone:new T.ConeGeometry(1,1,8),orb:new T.IcosahedronGeometry(1,1),crystal:new T.OctahedronGeometry(1),ring:new T.TorusGeometry(1,.065,5,32),wireArch:new T.TorusGeometry(1,.006,5,32,Math.PI),arch:new T.TorusGeometry(1,.03,6,32,Math.PI)};
const M={stone:new T.MeshStandardMaterial({color:0x466e78,map:environmentTexture('stone'),roughness:.78}),trim:new T.MeshStandardMaterial({color:0xc7b58c,metalness:.6,roughness:.38}),dark:new T.MeshStandardMaterial({color:0x172c40,roughness:.65}),coral:new T.MeshStandardMaterial({color:0xa96f9d,roughness:.8}),light:new T.MeshBasicMaterial({color:0x8ceee1}),blue:new T.MeshStandardMaterial({color:0x3b8faa,metalness:.4,roughness:.38}),glass:new T.MeshStandardMaterial({color:0x144559,metalness:.6,roughness:.3})};
const add=(g,geo,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0)=>{const m=new T.Mesh(G[geo],M[mat]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx,ry,rz);g.add(m);return m};
M.glass.transparent=true;M.glass.opacity=.38;M.glass.depthWrite=false;
export function buildStarfallScene(scene){return buildSunkenRuins(scene);}
const templates=new Map();
export function createStarfallCreature(kind,level){
 if(!templates.has(kind)){
  const root=new T.Group(),body=new T.Group();body.name='body';root.add(body);const boss=kind==='starbound_heart',scribe=kind==='drowned_scribe',heavy=kind==='anchor_revenant',scale=STARFALL_KINDS[kind].size;root.scale.setScalar(scale);
  add(body,'orb',heavy?'stone':'blue',0,1.15,0,.4,.55,.29);add(body,'crystal','dark',0,1.85,0,.3,.33,.24);add(body,'box','light',0,1.88,-.23,.31,.035,.04);add(body,'crystal','light',0,1.25,-.3,.15,.23,.1);
  for(const side of [-1,1]){
   const arm=new T.Group();arm.name='arm'+(side<0?0:1);arm.position.set(side*.48,1.5,0);body.add(arm);add(arm,'column','dark',0,-.28,0,.12,.6,.12);add(arm,'crystal',heavy?'stone':'blue',0,-.2,0,.2,.36,.22);add(arm,'box','trim',0,-.54,0,.21,.14,.24);
   const leg=new T.Group();leg.name='leg'+(side<0?0:1);leg.position.set(side*.2,.7,0);body.add(leg);add(leg,'column','dark',0,-.23,0,.12,.46,.12);add(leg,'box','stone',0,-.53,-.06,.25,.2,.38);
   for(let i=0;i<4;i++){add(body,'crystal','blue',side*(.34+i*.07),1.46-i*.08,.07,.16,.1,.3,0,0,side*.35);add(body,'cone','trim',side*(.25+i*.04),1.96+i*.07,.08,.035,.25,.04,0,0,-side*.3)}
   if(scribe){for(let i=0;i<5;i++)add(body,'box','blue',side*(.15+i*.08),.55,.1,.06,.8,.12,0,0,side*.1);add(body,'box','trim',side*.72,1.25,-.2,.22,.32,.08,0,side*.5)}
   if(heavy){add(body,'column','trim',side*.56,.83,.02,.04,.65,.04);add(body,'box','dark',side*.56,.51,.02,.45,.09,.09);add(body,'cone','stone',side*.74,.51,.02,.12,.25,.1,0,0,-side*Math.PI/2)}
  }
  for(let i=0;i<5;i++)add(body,'box','trim',0,1.5-i*.14,-.28,.4-i*.04,.025,.035);
  if(boss){for(let i=0;i<3;i++)add(body,'ring','trim',0,1.6,.45,.68+i*.14,.68+i*.14,.68+i*.14,0,i*.4);for(let i=0;i<8;i++){const a=i*Math.PI/4;add(body,'crystal','light',Math.sin(a)*.95,1.6+Math.cos(a)*.95,.45,.09,.22,.08,0,0,-a)}add(body,'cone','blue',0,2.35,0,.22,.8,.22);add(body,'column','trim',.58,1.1,-.15,.055,1.9,.055);add(body,'crystal','light',.58,2.15,-.15,.18,.35,.18)}
  function bake(g){for(const n of g.children)if(n.isGroup)bake(n);mergeEnvironment(g)}bake(root);templates.set(kind,root);
 }
 const root=templates.get(kind).clone(true);root.userData={kind,level,height:STARFALL_KINDS[kind].size*2.75,body:root.getObjectByName('body'),arms:[root.getObjectByName('arm0'),root.getObjectByName('arm1')],legs:[root.getObjectByName('leg0'),root.getObjectByName('leg1')]};return root;
}
