// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
import {ancientProfessionSkins} from './ancient-skins.js';
const templates=new Map();
const skinTone=0xc08d69;
const shapes={box:new T.BoxGeometry(),head:new T.SphereGeometry(.5,9,6),gem:new T.OctahedronGeometry(.5),ring:new T.TorusGeometry(.5,.055,5,20)};
const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.86});
const luminousMaterial=new T.MeshBasicMaterial({vertexColors:true,toneMapped:false});
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
 const profession=skin.profession,crest=skin.rarity>=3;
 const silhouette={warrior:1.15,summoner:1.03,ice:.93,lightning:.98,curse:.91,swordsman:1,shadowblade:.89,stonewright:1.22};
 body.scale.x=silhouette[profession]||1;
 if(skin.rarity&&['summoner','ice','lightning','curse'].includes(profession)){
  b('box',cloth,0,.88,.11,.48,.48,.31);
  b('box',accent,0,.67,.26,.48,.067,.033);
 }
 if(profession==='warrior'){
  b('box',accent,0,1.34,-.188,.48,.22,.09);
  if(crest)b('gem',accent,0,1.37,-.27,.22,.24,.13);
 }else if(profession==='summoner'){
  b('gem',accent,0,1.28,-.23,.14,.24,.13);
  if(crest)for(const x of [-.49,.49])b('gem',accent,x,1.64,.1,.16,.29,.16);
 }else if(profession==='ice'){
  for(const x of [-.16,.16])b('gem',accent,x,1.42,-.2,.12,.22,.11);
  if(crest)b('gem',accent,0,2.04,.055,.19,.34,.16);
 }else if(profession==='lightning'){
  for(const [x,y,angle]of [[-.07,1.35,-.45],[.04,1.2,.7],[-.01,1.06,-.5]])b('box',accent,x,y,-.2,.053,.21,.035,angle);
  if(crest)for(const x of [-.45,.45])b('gem',accent,x,1.8,.13,.11,.34,.13,x);
 }else if(profession==='curse'){
  b('ring',accent,0,1.28,-.21,.26,.26,.15);
  if(crest)b('gem',accent,0,1.3,-.23,.11,.22,.13);
 }else if(profession==='swordsman'){
  b('box',accent,.16,1.17,.23,.085,.82,.08,-.47);
  if(crest)b('box',accent,-.16,1.17,.25,.085,.82,.08,.47);
 }else if(profession==='shadowblade'){
  b('box',cloth,0,1.68,-.177,.31,.115,.09);
  if(crest)for(const x of [-.19,.19])b('gem',accent,x,1.02,.24,.12,.59,.12,x);
 }else if(profession==='stonewright'){
  b('box',accent,0,1.1,-.195,.36,.23,.085);
  if(crest)for(const x of [-.31,.31])b('box',accent,x,1.5,.11,.23,.25,.39,x);
 }
 if(skin.rarity>=2&&skin.rarity<=4){
  const tier=skin.rarity;
  const trim=new T.Color(accent).lerp(new T.Color(cloth),.35).getHex();
  for(const [i,side] of [-1,1].entries()){
   const arm=root.getObjectByName('arm'+i),knee=root.getObjectByName('knee'+i);
   for(let layer=0;layer<tier-1;layer++){
    part(arm,'box',layer===0?accent:trim,0,-.32+layer*.055,-.019,.195,.045,.205,side*.09);
    part(knee,'box',trim,0,-.08-layer*.073,-.111,.171,.053,.054);
   }
  }
  if(style==='thorn'){
   for(const side of [-1,1])for(let i=0;i<3;i++)
    b('gem',i%2?trim:accent,side*(.13+i*.056),1.18+i*.087,.22,.095,.31,.083,side*.49);
  }else if(style==='coat'){
   for(const side of [-1,1]){
    b('box',trim,side*.17,.83,.235,.24,.57,.075,side*.16);
    b('box',accent,side*.27,.82,.272,.028,.55,.025,side*.16);
    for(let i=0;i<3;i++)b('gem',accent,side*.095,1.39-i*.095,-.184,.045,.059,.033);
   }
  }else if(style==='smith'){
   b('box',trim,0,.85,-.225,.37,.095,.08);
   for(const [i,x]of [-.12,.015,.13].entries()){
    b('box',boots,x,.78,-.24,.036,.26,.043,i*.17-.16);
    b('box',accent,x,.91,-.265,.072,.05,.062,i*.17-.16);
   }
  }else if(style==='sun'){
   for(let i=0;i<8;i++){
    const angle=i*Math.PI/4;
    b('gem',accent,Math.cos(angle)*.42,1.84+Math.sin(angle)*.42,.38,.09,.23,.082,angle-Math.PI/2);
   }
   b('ring',trim,0,1.84,.375,.63,.63,.7);
   b('gem',accent,0,1.31,-.215,.24,.28,.093);
  }else if(style==='crystal'){
   for(const side of [-1,1])for(let i=0;i<4;i++){
    b('gem',i%2?trim:accent,side*(.14+.103*i),1.1+.17*i,.26,.126,.53,.11,side*(.21+.12*i));
   }
   b('gem',accent,0,1.92,.034,.17,.25,.12);
  }else if(style==='jackal'){
   for(const side of [-1,1]){
    b('box',trim,side*.202,1.78,0,.12,.28,.43,side*.2);
    for(let i=0;i<4;i++)b('box',i%2?accent:trim,side*.16,1.46-i*.09,.19,.19,.058,.26,side*.2);
    b('gem',accent,side*.095,1.8,-.255,.047,.065,.033);
   }
  }else if(style==='moon'){
   b('ring',trim,0,1.87,.38,1.16,1.16,1.15);
   b('ring',accent,0,1.87,.414,.97,.97,.72);
   for(let i=0;i<9;i++){
    const angle=Math.PI*.22+i*Math.PI*.17;
    b('gem',i%2?accent:trim,Math.cos(angle)*.49,1.87+Math.sin(angle)*.49,.44,.08,.19,.09,angle-Math.PI/2);
   }
   for(const side of [-1,1])b('gem',accent,side*.27,.94,.31,.11,.82,.1,side*.2);
  }else if(style==='feather'){
   for(const side of [-1,1])for(let i=0;i<5;i++){
    const x=side*(.31+i*.085),y=1.15+.17*i;
    b('gem',trim,x,y,.31,.17,.68,.13,side*(.36+i*.13));
    b('gem',accent,x,y+.045,.366,.08,.55,.077,side*(.36+i*.13));
   }
   b('gem',accent,0,2.05,.057,.127,.39,.11);
  }else if(style==='crown'){
   for(const side of [-1,1]){
    for(let i=0;i<5;i++){
     b('gem',i%2?accent:trim,side*(.27+i*.071),1.24+.103*i,.24,.13,.49,.118,side*(.44+i*.16));
     b('box',i%2?trim:cloth,side*.156,1.12-i*.10,.29,.24,.085,.062,side*.17);
    }
    b('gem',accent,side*.22,2.04,.037,.113,.32,.14,side*.37);
   }
   b('gem',accent,0,2.09,-.061,.135,.33,.115);
  }
 }
 if(skin.rarity===5){
  const light=new T.Group();
  light.name='skin-inlay';body.add(light);
  const glint=(shape,x,y,z,w,h,d,angle=0)=>part(light,shape,accent,x,y,z,w,h,d,angle);
  const pale=style==='ivory'?0xf0e0bc:style==='void'?0x534266:0x73869e;
  const dark=style==='ivory'?0x62565d:style==='void'?0x251a37:0x253448;
  // Layered chest, segmented cuffs and boots remain attached to their animated joints.
  for(let i=0;i<5;i++){
   const y=1.44-i*.102,width=.47-i*.036;
   b('box',dark,0,y,-.186,width+.035,.112,.093);
   b('box',pale,0,y+.012,-.23,width,.058,.045);
   for(const side of [-1,1])glint('box',side*(width/2-.025),y+.01,-.256,.03,.049,.014,side*.26);
  }
  glint('gem',0,1.31,-.293,.165,.23,.085);
  for(const [i,side] of [-1,1].entries()){
   const arm=root.getObjectByName('arm'+i),knee=root.getObjectByName('knee'+i);
   for(let layer=0;layer<3;layer++){
    part(arm,'box',layer===1?accent:pale,side*layer*.025,.025-layer*.065,.015,.29-layer*.025,.092,.37-layer*.026,side*.24);
    part(knee,'box',layer===1?accent:pale,0,-.08-layer*.086,-.109,.176-layer*.012,.07,.064);
   }
   part(arm,'box',pale,0,-.27,-.05,.212,.18,.23);
   part(arm,'box',accent,0,-.285,-.172,.14,.035,.016,side*.25);
   part(knee,'gem',accent,0,.035,-.159,.18,.19,.09);
  }
  if(style==='orbit'){
   b('ring',dark,0,1.85,.405,1.65,1.65,1.4);
   b('ring',pale,0,1.85,.42,1.44,1.44,.87);
   b('ring',pale,0,1.85,.45,1.21,1.21,.66);
   for(let i=0;i<12;i++){
    const angle=i*Math.PI/6,x=Math.cos(angle)*.72,y=1.85+Math.sin(angle)*.72;
    b('gem',dark,x,y,.415,.16,.27,.13,angle-Math.PI/2);
    glint('gem',x,y,.49,.079,.13,.065,angle-Math.PI/2);
   }
   for(const side of [-1,1]){
    b('gem',pale,side*.45,1.37,.18,.17,.52,.17,side*.64);
    b('gem',dark,side*.35,.93,.3,.19,.65,.11,side*.19);
    glint('box',side*.26,1.07,.304,.036,.65,.032,side*.19);
   }
   glint('gem',0,2.25,.48,.13,.23,.12);
  }else if(style==='ivory'){
   for(const side of [-1,1]){
    b('box',pale,side*.24,1.73,.19,.1,.66,.25,side*.48);
    for(let layer=0;layer<5;layer++){
     const x=side*(.32+.105*layer),y=1.39+.115*layer;
     b('gem',dark,x,y,.32,.16,.92-layer*.045,.13,side*(.42+.14*layer));
     b('gem',pale,x,y+.026,.34,.105,.83-layer*.045,.13,side*(.42+.14*layer));
     glint('gem',x,y+.03,.405,.042,.52-layer*.035,.032,side*(.42+.14*layer));
    }
    b('gem',accent,side*.23,2.08,.04,.116,.36,.18,side*.4);
    b('box',pale,side*.18,.94,.24,.25,1.05,.08,side*.08);
    b('box',accent,side*.3,.94,.294,.038,1.05,.025,side*.08);
   }
   glint('gem',0,2.16,-.09,.12,.33,.12);
  }else{
   for(const side of [-1,1]){
    for(let i=0;i<5;i++){
     const x=side*(.32+i*.105),y=1.26+i*.185;
     b('gem',dark,x,y,.33,.2,.82-i*.07,.2,side*(.43+i*.14));
     b('gem',pale,x+side*.055,y+.07,.39,.105,.55-i*.03,.135,side*(.43+i*.14));
     glint('gem',x+side*.055,y+.07,.457,.04,.34-i*.018,.035,side*(.43+i*.14));
    }
    b('gem',pale,side*.19,2.04,.12,.16,.49,.16,side*.45);
    b('gem',dark,side*.21,.77,.31,.26,.94,.11,side*.23);
    glint('box',side*.25,.83,.37,.028,.55,.016,side*.23);
   }
   glint('ring',0,1.67,.453,.46,.46,.44);
  }
  const insignia={
   warrior:['gem',.3,.19,0],summoner:['ring',.32,.32,0],ice:['gem',.2,.41,0],lightning:['box',.066,.42,.53],
   curse:['ring',.38,.25,.22],swordsman:['box',.062,.44,-.7],shadowblade:['gem',.28,.16,.45],stonewright:['box',.21,.21,.78],
  }[profession];
  if(insignia){
   const [shape,width,height,angle]=insignia;
   b(shape,dark,0,1.58,.33,width+.06,height+.06,.12,angle);
   glint(shape,0,1.58,.408,width,height,.075,angle);
  }
 }
 if(skin.rarity){
  const edging=new T.Color(accent).lerp(new T.Color(boots),.42).getHex();
  for(const [i,side] of [-1,1].entries()){
   const arm=root.getObjectByName('arm'+i),leg=root.getObjectByName('leg'+i);
   part(arm,'box',edging,0,-.24,-.102,.14,.15,.024);
   part(arm,'gem',accent,0,-.24,-.121,.058,.09,.028,side*.16);
   part(leg,'box',edging,side*.069,-.18,-.123,.032,.26,.024,side*.08);
   if(skin.rarity>=3){
    for(let row=0;row<skin.rarity-1;row++){
     const y=1.4-row*.105,x=side*(.195-row*.014);
     b('gem',edging,x,y,-.204,.128,.092,.06,side*.27);
     b('box',accent,x,y+.025,-.236,.076,.014,.018,side*.27);
    }
   }
  }
  if(skin.rarity>=2){
   b('gem',edging,0,.856,-.222,.174,.127,.075);
   b('gem',accent,0,.858,-.271,.09,.073,.042);
  }
  if(skin.rarity>=4)for(let i=0;i<5;i++){
   const angle=Math.PI*(.18+i*.16);
   b('gem',accent,Math.cos(angle)*.22,1.56+Math.sin(angle)*.1,-.217,.035,.05,.04,angle-.5);
  }
 }
 for(const [joint,data]of batch){
  const geometry=new T.BufferGeometry();
  for(const [key,values]of Object.entries(data))geometry.setAttribute(key,new T.Float32BufferAttribute(values,3));
  geometry.computeBoundingSphere();joint.add(new T.Mesh(geometry,joint.name==='skin-inlay'?luminousMaterial:material));
 }
 return root;
}
export function createAncientSkinModel(id,profession){
 const choices=ancientProfessionSkins(profession);
 const skin=choices.find(item=>item.id===id)||choices[0];
 const key=skin.profession+':'+skin.id;
 if(!templates.has(key))templates.set(key,makeModel(skin));
 const root=templates.get(key).clone(true);
 const joints=prefix=>[0,1].map(i=>root.getObjectByName(prefix+i));
 root.userData={height:skin.rarity===5?2.67:skin.rarity===4?2.46:skin.rarity===3?2.28:2.06,body:root.getObjectByName('body'),arms:joints('arm'),legs:joints('leg'),knees:joints('knee')};
 return root;
}
