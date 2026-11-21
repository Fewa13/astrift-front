// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as THREE from './three.module.js';
import {flyingSwordGeometry,flyingSwordMaterial} from './ancient-flying-sword.js';

const effects={
 thermal:[0xff7b4d,0xa0eaff,{clash:'shatter'}],
 berserker:[0xf74552,0xffc171,{bolt:'bolt',charge:'trail',impact:'shatter',rebirth:'wings',revival:'halo',sacrifice:'bind'}],
 paladin:[0xffdc82,0xffffff,{judgment:'pillar',purify:'slash',recovery:'wings',sanctuary:'ward'}],
 spiritcaller:[0x80ffe0,0xd3fff3,{ascendant:'wings',domain:'ward',guardian:'portal',rebirth:'halo'}],
 beastlord:[0xc7a46c,0xf6f0b0,{bind:'portal',hunt:'slash',guard:'ward',pounce:'heavy'}],
 necromancer:[0x97fd8b,0xcdb2ff,{fusion:'heavy',consume:'bind',domain:'ward',raise:'spires',release:'portal',strike:'slash'}],
 stormcaller:[0xa1d9ff,0xf1f8ff,{arc:'arc',heavenfall:'storm',prison:'lightningfield',rain:'lightningfield',critical:'arc',rod:'spires',seal:'pillar'}],
 voltstalker:[0x7658ff,0xb0e8ff,{break:'cross',counter:'arc',dash:'trail',guard:'halo',spike:'bolt'}],
 crystalist:[0x75f1ff,0xd1a6ff,{bolt:'bolt',collapse:'shatter',field:'spires',fracture:'shatter',refraction:'ray'}],
 winterwarden:[0x94dfff,0xedfcff,{lock:'trail',rampart:'wall',shatter:'shatter',spear:'bolt',veil:'ward'}],
 wildfire:[0xff6a25,0xffde72,{confluence:'fire',front:'trail',meteor:'meteor',seed:'bolt'}],
 hellfire:[0xeb395c,0xffad62,{bone:'pillar',brand:'bolt',threads:'ray',eruption:'shatter',undying:'orbital'}],
 hexweaver:[0xb46cff,0xff9be7,{collapse:'cross',decay:'bind',plague:'spires',tether:'threads'}],
 pactbinder:[0x9e386e,0xe9c1ff,{brand:'bind',reckoning:'pillar',inverse:'orbital',doom:'ward'}],
 blademaster:[0x58ed9d,0xd4ffe0,{formation:'trail',launch:'bolt',recall:'trail',resonance:'halo',union:'heavy'}],
 linebreaker:[0xebf8a4,0xffca77,{break:'heavy',counter:'slash',fork:'slash',guard:'ward',sunder:'slash',triple:'cross'}],
 shadowhunter:[0x8747d8,0xe9bcff,{flank:'slash',hunt:'cross',mark:'bolt',recall:'trail',swap:'trail',twin:'portal'}],
 boundarycutter:[0xff729e,0xd4b4ff,{grid:'threads',intercept:'trail',return:'slash',throw:'bolt',trigger:'shatter',wire:'ray',blade:'slash',assault:'trail',reprise:'cross',execution:'bladefield',pulse:'bladefield',collapse:'bladefield'}],
 mountainguard:[0xdd9851,0xffd4a3,{armor:'orbital',fist:'trail',gate:'wall',peaks:'spires',shatter:'shatter'}],
 veinforger:[0xd5a86b,0xfdb977,{core:'shatter',current:'trail',fracture:'cross',shift:'pillar',spike:'spires',plant:'groundspike',flying:'earthbolt',pierce:'earthburst',link:'groundspike',detonate:'earthburst'}],
 'elemental-god':[0xff9d58,0xa8f3ff,{arc:'arc',brand:'bolt',dominion:'threads',erosion:'bind',eruption:'spires',judgment:'storm',thermal:'shatter'}],
 'elemental-ward':[0x4af2db,0xffe69c,{counter:'trail',equilibrium:'clock',field:'ward',shift:'orbital'}],
 riftlord:[0x8863ff,0xf5d4ff,{cut:'slash',domain:'ward',edge:'cross',finale:'heavy',rear:'slash',return:'portal',twin:'threads',strangle:'cross'}],
 riftduelist:[0x6178ff,0xc9deff,{arena:'ward',displace:'trail',guard:'halo',riposte:'slash',sever:'cross'}],
 'abyss-king':[0xc73762,0xffa99c,{brand:'bind',consume:'portal',field:'ward',form:'wings'}],
 'abyss-herald':[0xa14dd2,0x84ffee,{brand:'bind',consume:'orbital',converge:'threads',field:'spires',fracture:'ray'}],
 'time-sovereign':[0xffda76,0xb6edff,{anchor:'lifeanchor',double:'trail',echo:'portal',rewind:'liferecall',rift:'ray',settle:'shatter',verdict:'timefield',warp:'timefield',strangle:'cross'}],
 'time-weaver':[0x6cf6dd,0xb39dff,{borrow:'trail',invert:'clock',link:'threads',mark:'bind',return:'portal',settle:'shatter'}],
};

const durations={groundspike:600,earthbolt:900,earthburst:800,lifeanchor:1100,liferecall:650,timefield:1100,lightningfield:1000,bladefield:950,bolt:520,ray:520,arc:420,slash:530,trail:640,cross:850,heavy:1050,shatter:1050,meteor:1250,storm:1550,
 pillar:1040,orbital:1700,halo:1200,wings:1550,bind:1750,portal:1400,threads:1550,spires:1700,wall:3000,ward:3200,clock:3000,fire:3200};
const elementalColors={fire:0xff672a,ice:0xa5f0ff,storm:0x9d84ff,earth:0xf4bb71};
const routes=Object.keys(effects).sort((a,b)=>b.length-a.length);
export const advancementEffectIds=Object.freeze(routes.flatMap(route=>Object.keys(effects[route][2]).map(id=>route+'-'+id)));
const up=new THREE.Vector3(0,1,0);

export function createAdvancementFX(scene,camera,milliseconds=()=>performance.now()){
 const live=[],swordTangent=new THREE.Vector3();
 const bar=new THREE.BoxGeometry(1,1,1);
 const crystal=new THREE.OctahedronGeometry(1,0);
 const stone=new THREE.IcosahedronGeometry(1,1);
 const ring=new THREE.TorusGeometry(1,.025,6,48);
 const wedge=new THREE.ConeGeometry(1,1,5);
 const segment=new THREE.PlaneGeometry(1,1);

 function dispose(entry){
  scene.remove(entry.group);
  for(const m of entry.materials)m.dispose();
 }
 function effect(data,ground){
  const id=String(data.id||''),route=routes.find(key=>id.startsWith(key+'-'));
  if(!route)return false;
  const [main,trim,patterns]=effects[route],style=patterns[id.slice(route.length+1)];
  if(!style)return false;
  if(!Number.isFinite(data.x)||!Number.isFinite(data.z))return true;
  const low=!!camera?.userData?.renderPressure;
  const cap=low?12:26;
  if(live.length>=cap)dispose(live.shift());
  const group=new THREE.Group();
  // Beam cores and surface glyphs use depth testing so terrain still occludes them.
  const makeMaterial=(color,additive)=>new THREE.MeshBasicMaterial({
   color,transparent:true,opacity:1,depthWrite:false,side:THREE.DoubleSide,
   blending:additive?THREE.AdditiveBlending:THREE.NormalBlending,
  });
  const materials=[makeMaterial(elementalColors[data.phase]||main,true),makeMaterial(trim,true),makeMaterial(main,false)];
  const target=new THREE.Vector3(data.x,ground(data.x,data.z)+.23,data.z);
  const source=data.source&&[data.source.x,data.source.y,data.source.z].every(Number.isFinite)
   ?new THREE.Vector3(data.source.x,data.source.y,data.source.z):target.clone().add(new THREE.Vector3(0,2,-3));
  if(source.distanceToSquared(target)<.05)source.z-=3;
  const high=target.clone().addScaledVector(up,1.2);
  const radius=Math.max(1,Math.min(22,Number(data.radius)||3));
  const movers=[];
  const put=(geometry,shade,point,x,y,z)=>{
   const node=new THREE.Mesh(geometry,materials[shade]);
   node.position.copy(point);node.scale.set(x,y,z);group.add(node);return node;
  };
  const beam=(from,to,width,shade=0,shape=bar)=>{
   const axis=to.clone().sub(from);
   const mesh=put(shape,shade,from.clone().lerp(to,.5),width,Math.max(.04,axis.length()),width);
   mesh.quaternion.setFromUnitVectors(up,axis.normalize());
   return mesh;
  };
  const loop=(size,y,shade=0)=>{
   const shape=put(ring,shade,target.clone().addScaledVector(up,y),size,size,size);
   shape.rotation.x=-Math.PI/2;return shape;
  };
  const burst=(count,height,spread=radius)=>{
   for(let i=0;i<count;i++){
    const angle=i*2.399963,dist=spread*(.25+(i%5)*.16),end=target.clone().add(new THREE.Vector3(Math.cos(angle)*dist,height*(.4+(i%4)*.2),Math.sin(angle)*dist));
    const mesh=put(crystal,i%3===0?1:0,high,.17,.42,.16);
    movers.push({mesh,from:high,to:end,spin:.7+i*.09,arc:height*.35});
   }
  };
  const lightning=(from,to,width)=>{
   const cross=to.clone().sub(from).cross(up).normalize();
   let previous=from;
   for(let i=1;i<=7;i++){
    const next=from.clone().lerp(to,i/7);
    if(i<7)next.addScaledVector(cross,(i%2?1:-1)*width*2.7).y+=Math.sin(i*2.1)*width*2.5;
    beam(previous,next,width,i%3?1:0);previous=next;
   }
  };

  if(style==='groundspike'){
   // A grounded physical spike with a restrained edge glow, not a screen-filling pillar.
   const physical=new THREE.MeshBasicMaterial({color:0x886346,transparent:true,opacity:1,depthWrite:true});materials.push(physical);
   const tip=new THREE.Mesh(wedge,physical);tip.position.copy(target).addScaledVector(up,.65);tip.scale.set(.35,1.4,.35);group.add(tip);
   loop(.65,.02,0);loop(.38,.04,1);
  }else if(style==='earthbolt'){
   const tip=put(wedge,2,source,.3,1.6,.3);tip.quaternion.setFromUnitVectors(up,high.clone().sub(source).normalize());
   movers.push({mesh:tip,from:source,to:high,spin:0,arc:0});beam(source,high,.025,0);
  }else if(style==='earthburst'){
   loop(radius,.05,0);loop(radius*.45,.08,1);
   for(let i=0;i<(low?7:14);i++){
    const angle=i*2.399,from=target.clone(),to=target.clone().add(new THREE.Vector3(Math.cos(angle)*radius*.8,1.2+(i%3)*.4,Math.sin(angle)*radius*.8));
    const rock=put(stone,2,from,.23,.32,.24);movers.push({mesh:rock,from,to,spin:.7,arc:1.2});
   }
  }else if(style==='lifeanchor'||style==='liferecall'){
   loop(style==='lifeanchor'?1.6:2.2,.03,0);loop(1.1,.08,1);
   for(let i=0;i<12;i++){
    const angle=i*Math.PI/6,from=target.clone().add(new THREE.Vector3(Math.sin(angle)*1.25,.08,Math.cos(angle)*1.25));
    const to=target.clone().add(new THREE.Vector3(Math.sin(angle)*1.52,.08,Math.cos(angle)*1.52));beam(from,to,.025,i%3?0:1);
   }
   beam(target.clone().add(new THREE.Vector3(0,.12,0)),target.clone().add(new THREE.Vector3(0,1.9,0)),.035,0);
  }else if(style==='lightningfield'){
   loop(radius,.02,0);
   for(let i=0;i<(low?4:8);i++){
    const angle=i*2.399+milliseconds()*.001,dist=radius*(.25+(i%4)*.19),to=target.clone().add(new THREE.Vector3(Math.cos(angle)*dist,.15,Math.sin(angle)*dist));
    lightning(to.clone().add(new THREE.Vector3(.4,7+(i%3),.3)),to,.035);
   }
  }else if(style==='timefield'||style==='bladefield'){
   loop(radius,.03,0);loop(radius*.94,.08,1);
   for(let i=0;i<(low?8:16);i++){
    const angle=i*Math.PI/(low?4:8)+milliseconds()*.0003,from=target.clone().add(new THREE.Vector3(Math.sin(angle)*radius,.15,Math.cos(angle)*radius));
    const to=target.clone().add(new THREE.Vector3(Math.sin(angle+.12)*radius*.8,style==='timefield'?.18:1.4,Math.cos(angle+.12)*radius*.8));beam(from,to,.025,i%2);
   }
   if(style==='bladefield')for(let i=0;i<3;i++){
    const angle=i*Math.PI/3+milliseconds()*.001,from=target.clone().add(new THREE.Vector3(Math.sin(angle)*radius,.5,Math.cos(angle)*radius));
    const to=target.clone().add(new THREE.Vector3(-Math.sin(angle)*radius,.55,-Math.cos(angle)*radius));beam(from,to,.035,0);
   }
  }

  const swordFlight=route==='blademaster'&&id!=='blademaster-resonance'||
   id==='boundarycutter-throw'||id==='riftlord-finale'||id==='riftduelist-sever'||
   false;
  const custom=['groundspike','earthbolt','earthburst','lifeanchor','liferecall','lightningfield','timefield','bladefield'].includes(style);
  if(custom){
   // Geometry above shares the same bounded lifetime and disposal path.
  }else if(swordFlight){
   const count=id==='blademaster-union'?1:id==='riftlord-finale'||id==='linebreaker-triple'?3:1;
   const direction=high.clone().sub(source).normalize(),across=direction.clone().cross(up).normalize();
   for(let i=0;i<count;i++){
    const offset=(i-(count-1)/2)*1.1;
    const from=source.clone().addScaledVector(across,offset);
    const through=high.clone().addScaledVector(direction,1.4).addScaledVector(across,-offset);
    const mesh=new THREE.Mesh(flyingSwordGeometry,flyingSwordMaterial);
    mesh.position.copy(from);
    mesh.scale.setScalar(id==='blademaster-union'?Math.min(5,1.8+radius*.12):1.15);
    group.add(mesh);
    movers.push({mesh,from,to:through,arc:id==='blademaster-union'?2.6:.45,blade:true,delay:i*.1});
   }
   burst(low?4:9,1.8,Math.min(radius,4));
  }else if(style==='bolt'){
   beam(source,high,.055);
   const head=put(crystal,1,source,.24,.74,.25);
   head.quaternion.setFromUnitVectors(up,high.clone().sub(source).normalize());
   movers.push({mesh:head,from:source,to:high,spin:0,arc:.35});
   burst(low?4:8,1.9,3);
  }else if(style==='arc'||style==='ray'||style==='threads'){
   if(style==='arc')lightning(source,high,.09);
   else{
    beam(source,high,.14,1);beam(source,high,.3);
    if(style==='threads')for(const sign of [-1,1]){
     const side=new THREE.Vector3(sign*.45,.22,0);
     beam(source.clone().add(side),high.clone().sub(side),.055);
    }
   }
   for(const link of (data.links||[]).slice(0,4))if(Number.isFinite(link.x)&&Number.isFinite(link.z)){
    beam(high,new THREE.Vector3(link.x,ground(link.x,link.z)+1.1,link.z),.075,1);
   }
   burst(low?3:6,1.4,2);
  }else if(['slash','trail','cross','heavy'].includes(style)){
   const count=style==='cross'?4:style==='heavy'?3:style==='slash'?2:3;
   for(let i=0;i<count;i++){
    const angle=i*Math.PI/count+(Number(data.phase)||0)*.35;
    const span=style==='heavy'?Math.min(radius,9):style==='cross'?Math.min(radius,5):1+(i%2);
    const from=style==='cross'?high.clone().add(new THREE.Vector3(Math.cos(angle)*span,1.5,Math.sin(angle)*span)):source.clone().add(new THREE.Vector3((i-1)*.35,i*.19,0));
    const to=style==='cross'?high.clone().add(new THREE.Vector3(-Math.cos(angle)*span,-.4,-Math.sin(angle)*span)):high.clone().add(new THREE.Vector3((i-1)*.37,.4,0));
    const mesh=beam(from,to,style==='heavy'?.75:.17,i===1?1:0);
    mesh.scale.z*=style==='heavy'?.14:.34;
   }
   if(style==='heavy')loop(Math.min(radius,9),.02,1);
   burst(low?5:12,style==='heavy'?4:2);
  }else if(style==='meteor'){
   const from=target.clone().add(new THREE.Vector3(-5,14,2));
   const rock=put(stone,2,from,1.7,2.1,1.7);
   movers.push({mesh:rock,from,to:high,spin:2,arc:0});
   beam(from,high,.48,0);loop(radius,.02,1);burst(low?7:15,4);
  }else if(style==='pillar'||style==='storm'){
   const count=style==='pillar'?1:low?4:8;
   for(let i=0;i<count;i++){
    const angle=i*2.4,size=i===0?0:radius*(.38+i/count*.55);
    const base=target.clone().add(new THREE.Vector3(Math.cos(angle)*size,0,Math.sin(angle)*size));
    base.y=ground(base.x,base.z)+.24;
    lightning(base.clone().addScaledVector(up,11),base,.14);
    put(wedge,0,base.clone().addScaledVector(up,1.1),.55,2.2,.55);
   }
   loop(radius,.06);burst(low?5:12,3.1);
  }else if(style==='wall'||style==='spires'||style==='fire'){
   const count=low?7:14;
   const bottom=style==='wall'?source:target;
   for(let i=0;i<count;i++){
    const angle=i*2.39996,distance=radius*(.2+(i%7)*.12);
    const point=style==='wall'?bottom.clone().lerp(target,i/(count-1)):target.clone().add(new THREE.Vector3(Math.cos(angle)*distance,0,Math.sin(angle)*distance));
    const tall=style==='wall'?2.8+(i%3)*.45:style==='fire'?1.2+(i%5)*.24:1.4+(i%4)*.72;
    point.y=ground(point.x,point.z)+tall*.48;
    const shard=put(style==='fire'?wedge:crystal,i%4===0?1:0,point,style==='wall'?.64:.42,tall,style==='wall'?.52:.42);
    shard.rotation.z=(i%3-1)*.13;
   }
   if(style!=='wall')loop(radius,.02,style==='fire'?0:1);
  }else{
   if(style==='ward'||style==='clock'||style==='portal'||style==='bind'){
    loop(radius,.025);loop(radius*.78,.095,1);
    const count=low?8:16;
    for(let i=0;i<count;i++){
     const angle=i*Math.PI*2/count;
     const point=target.clone().add(new THREE.Vector3(Math.cos(angle)*radius*.88,.025,Math.sin(angle)*radius*.88));
     const tick=put(segment,i%3===0?1:0,point,.12,i%3===0?1.05:.42,1);
     tick.rotation.set(-Math.PI/2,0,angle);
    }
   }
   if(style==='clock'){
    beam(high,high.clone().add(new THREE.Vector3(radius*.65,0,0)),.12,1);
    beam(high,high.clone().add(new THREE.Vector3(0,0,radius*.47)),.17);
   }
   if(style==='wings')for(const side of [-1,1])for(let i=0;i<(low?4:7);i++){
    const end=high.clone().add(new THREE.Vector3(side*(.8+i*.35),1.85-i*.24,.45+i*.09));
    beam(high,end,.14,i%3===0?1:0,wedge);
   }
   if(style==='orbital'||style==='halo'||style==='bind')for(let i=0;i<(low?5:9);i++){
    const angle=i*Math.PI*2/(low?5:9),dist=Math.min(radius,.95+(i%3)*.42);
    const end=high.clone().add(new THREE.Vector3(Math.cos(angle)*dist,.7+(i%3)*.46,Math.sin(angle)*dist));
    const mesh=put(crystal,i%2,high,.25,.58,.25);
    movers.push({mesh,from:high,to:end,spin:1.1,arc:.6});
   }
   if(style==='shatter'||style==='portal'||style==='wings')burst(low?6:13,style==='shatter'?3.6:2.5);
  }
  scene.add(group);
  live.push({group,materials,movers,start:milliseconds(),duration:durations[style],style});
  return true;
 }
 function update(time){
  for(let i=live.length-1;i>=0;i--){
   const entry=live[i],t=Math.max(0,(time-entry.start)/entry.duration);
   if(t>=1){dispose(entry);live.splice(i,1);continue;}
   const alpha=Math.min(1,.48+t*6)*Math.min(1,(1-t)*2.8);
   entry.materials[0].opacity=alpha*.69;entry.materials[1].opacity=alpha*.88;entry.materials[2].opacity=alpha;for(const material of entry.materials.slice(3))material.opacity=alpha;
   for(const part of entry.movers){
    const progress=part.blade?Math.max(0,Math.min(1,(t-part.delay)*1.65)):Math.min(1,t*(entry.style==='meteor'?2.5:1.5));
    if(part.blade){
     part.mesh.visible=t>=part.delay&&progress<1;
     const tangent=swordTangent.subVectors(part.to,part.from);
     tangent.y+=Math.cos(progress*Math.PI)*part.arc*Math.PI;
     if(tangent.lengthSq()>.0001)part.mesh.quaternion.setFromUnitVectors(up,tangent.normalize());
    }
    part.mesh.position.lerpVectors(part.from,part.to,progress);
    part.mesh.position.y+=Math.sin(progress*Math.PI)*part.arc;
    if(part.spin)part.mesh.rotation.z=progress*part.spin;
   }
  }
 }
 return {effect,update,clear(){for(const entry of live)dispose(entry);live.length=0;}};
}

// X/Q/Z/C demonstration events shared with combat rendering.
export const advancementPreviewEvents=Object.freeze({
 berserker:['bolt','sacrifice','charge','rebirth'],
 paladin:['purify','recovery','sanctuary','judgment'],
 spiritcaller:['guardian','domain','ascendant','rebirth'],
 beastlord:[0xc7a46c,0xf6f0b0,{bind:'portal',hunt:'slash',guard:'ward',pounce:'heavy'}],
 beastlord:['bind','hunt','guard','pounce'],
 stormcaller:['seal','rod','prison','heavenfall'],
 voltstalker:['spike','dash','counter','break'],
 crystalist:['bolt','refraction','field','collapse'],
 winterwarden:['spear','rampart','veil','lock'],
 wildfire:['seed','front','confluence','meteor'],
 hellfire:['brand','bone','eruption','undying'],
 hexweaver:['decay','tether','plague','collapse'],
 pactbinder:['brand','reckoning','inverse','doom'],
 blademaster:['launch','formation','recall','union'],
 linebreaker:['sunder','triple','counter','break'],
 shadowhunter:['mark','swap','twin','hunt'],
 boundarycutter:['blade','assault','reprise','execution'],
 mountainguard:['fist','armor','gate','peaks'],
 veinforger:['plant','flying','detonate','link'],
 'elemental-god':['brand','judgment','erosion','dominion'],
 'elemental-ward':['shift','counter','field','equilibrium'],
 riftlord:['cut','twin','domain','finale'],
 riftduelist:['sever','displace','riposte','arena'],
 'abyss-king':['brand','consume','field','form'],
 'abyss-herald':['brand','fracture','field','converge'],
 'time-sovereign':['rift','double','anchor','verdict'],
 'time-weaver':['mark','link','borrow','invert'],
});

const selfEffects=new Set(['sacrifice','rebirth','recovery','sanctuary','guardian','ascendant','raise','release','consume','veil','armor','gate','shift','guard','form','rewind']);
export function advancementPreviewEvent(route,slot){
 const key=advancementPreviewEvents[route]?.[slot];
 if(!key)return undefined;
 const style=effects[route][2][key],self=selfEffects.has(key)&&!(route.startsWith('abyss')&&key==='consume');
 return {
  id:route+'-'+key,x:self?-2:2,z:0,source:{x:-2,y:1.45,z:0},
  radius:style==='ward'||style==='clock'||style==='storm'?9:style==='meteor'?8:style==='wall'?5:3.5,
  links:style==='threads'?[{x:4,z:-3},{x:-1,z:-5}]:undefined,
 };
}
