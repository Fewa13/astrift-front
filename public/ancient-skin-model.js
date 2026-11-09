// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
import {ANCIENT_SKINS} from './ancient-skins.js';
const templates=new Map();
const skinTone=0xc08d69;
const shapes={box:new T.BoxGeometry(),head:new T.SphereGeometry(.5,9,6),gem:new T.OctahedronGeometry(.5),ring:new T.TorusGeometry(.5,.055,5,20)};
const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.86});
function makeModel(skin){
 const root=new T.Group(),body=new T.Group();body.name='body';root.add(body);
 const batch=new Map(),matrix=new T.Object3D();
 function part(parent,shape,color,x,y,z,w,h,d,rz=0){
  const geometry=shapes[shape],source=geometry.index?geometry.toNonIndexed():geometry.clone();
  matrix.position.set(x,y,z);matrix.scale.set(w,h,d);matrix.rotation.set(0,0,rz);matrix.updateMatrix();source.applyMatrix4(matrix.matrix);
  if(!batch.has(parent))batch.set(parent,{position:[],normal:[],color:[]});
  const data=batch.get(parent),tint=new T.Color(color),positions=source.attributes.position;
  data.position.push(...positions.array);data.normal.push(...source.attributes.normal.array);
  for(let i=0;i<positions.count;i++)data.color.push(tint.r,tint.g,tint.b);
  source.dispose();
 }
 const {cloth,accent,boots,style}=skin;
 const b=(shape,color,x,y,z,w,h,d,roll)=>part(body,shape,color,x,y,z,w,h,d,roll);
 b('box',cloth,0,1.19,0,.53,.62,.32);
 b('box',boots,0,.86,0,.47,.13,.34);
 b('box',accent,0,.86,-.18,.11,.09,.034);
 b('box',skinTone,0,1.52,0,.14,.15,.15);
 b('head',skinTone,0,1.76,0,.38,.45,.37);
 b('head',boots,0,1.89,.034,.4,.23,.4);
 for(const x of [-.079,.079])b('box',0x322823,x,1.79,-.173,.04,.035,.016);
 b('box',0x9b624d,0,1.68,-.17,.07,.02,.02);
 b('box',accent,-.12,1.19,-.174,.065,.56,.04,-.42);
 for(const [i,side]of [-1,1].entries()){
  const leg=new T.Group(),knee=new T.Group(),arm=new T.Group();
  leg.name='leg'+i;leg.position.set(side*.145,.82,0);body.add(leg);
  knee.name='knee'+i;knee.position.y=-.37;leg.add(knee);
  arm.name='arm'+i;arm.position.set(side*.33,1.41,0);body.add(arm);
  part(leg,'box',boots,0,-.17,0,.21,.37,.23);
  part(knee,'box',boots,0,-.17,0,.18,.34,.2);
  part(knee,'box',boots,0,-.38,-.047,.21,.13,.32);
  part(arm,'box',cloth,0,-.15,0,.17,.35,.2);
  part(arm,'box',accent,0,-.35,0,.155,.09,.17);
  part(arm,'head',skinTone,0,-.44,0,.14,.18,.15);
  if(['guard','thorn','smith','sun','crystal','feather','crown','ivory','void'].includes(style))
   part(arm,['thorn','crystal','feather','void'].includes(style)?'gem':'box',accent,0,-.02,.015,.26,.24,.34,side*.27);
 }
 if(['hood','moon','void'].includes(style)){
  b('head',cloth,0,1.88,.09,.48,.45,.48);
  for(const side of [-1,1])b('box',cloth,side*.2,1.72,-.035,.1,.32,.36);
 }
 if(['scarf','coat','sun','moon','crown','orbit','void'].includes(style)){
  b('box',accent,0,1.51,0,.44,.11,.37);
  b('box',cloth,0,1.02,.23,.52,.93,.085);
  for(const side of [-1,1])b('box',accent,side*.23,1.02,.28,.036,.93,.03,side*.06);
 }
 if(style==='smith')b('box',accent,0,1.02,-.19,.34,.5,.055);
 if(style==='guard'||style==='ivory')b('box',accent,0,1.31,-.18,.47,.27,.10);
 if(style==='jackal'){
  b('gem',accent,0,1.74,-.19,.34,.31,.18);
  for(const side of [-1,1])b('gem',accent,side*.14,2.02,.01,.14,.43,.12,side*.13);
 }
 if(['crown','ivory'].includes(style))for(let i=-2;i<=2;i++)b('gem',accent,i*.07,1.99,.008,.09,.24,.1);
 if(['sun','moon','orbit'].includes(style))b('ring',accent,0,1.84,.32,style==='orbit'?1.1:.73,style==='orbit'?1.1:.73,.85);
 if(['crystal','thorn','feather','void'].includes(style))for(const side of [-1,1])for(let i=0;i<3;i++){
  b('gem',accent,side*(.32+i*.12),1.38+i*.13,.26,.12,.39+i*.08,.14,side*(.39+i*.16));
 }
 if(style==='scarf')b('box',accent,.33,1.39,.2,.15,.5,.065,.72);
 if(style==='orbit')for(const side of [-1,1])b('gem',accent,side*.51,1.93,.22,.16,.29,.16);
 for(const [joint,data]of batch){
  const geometry=new T.BufferGeometry();
  for(const [key,values]of Object.entries(data))geometry.setAttribute(key,new T.Float32BufferAttribute(values,3));
  geometry.computeBoundingSphere();joint.add(new T.Mesh(geometry,material));
 }
 return root;
}
export function createAncientSkinModel(id){
 const skin=ANCIENT_SKINS.find(item=>item.id===id)||ANCIENT_SKINS[0];
 if(!templates.has(skin.id))templates.set(skin.id,makeModel(skin));
 const root=templates.get(skin.id).clone(true);
 const joints=prefix=>[0,1].map(i=>root.getObjectByName(prefix+i));
 root.userData={height:2.06,body:root.getObjectByName('body'),arms:joints('arm'),legs:joints('leg'),knees:joints('knee')};
 return root;
}
