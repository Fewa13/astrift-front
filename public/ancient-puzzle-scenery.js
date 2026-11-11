// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';

const BRASS=0xb59057, DARK=0x343b42, STONE=0x596777, WATER=0x45c5d4;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export function dressPuzzleStation(station,kind,part){
 if(![9,10,11].includes(kind))return;
 part(0,.25,0,1.2,.3,.9,DARK);
 part(0,.85,0,.8,.85,.64,STONE);
 const pivot=new T.Group();pivot.position.y=1.32;station.add(pivot);
 station.mechanism={pivot,angle:0};
 if(kind===9){
  pivot.add(part(0,0,0,1.14,.9,.19,BRASS),part(0,0,-.11,.94,.7,.05,0xa6d5e7));
 }else if(kind===10){
  pivot.add(part(0,0,0,.82,.22,.65,BRASS),part(0,.26,0,.12,.52,.12,BRASS));
  station.mechanism.streams=[-1,1].map(side=>part(side*.45,1.13,.05,.58,.055,.2,WATER));
 }else{
  pivot.add(part(0,0,0,.7,.8,.26,DARK),part(0,.13,.16,.4,.36,.12,BRASS));
  part(0,1.12,-.35,.6,.11,.22,BRASS);
 }
}

export function dressPuzzleChamber({bank,z,parent,box,glow}){
 if(![9,10,11].includes(bank?.kind))return;
 const {kind,count}=bank;
 const part=(x,y,d,w,h,l,c)=>box(parent,x,y,z+d,w,h,l,c);
 const room={kind,beams:[],basins:[],shadows:[]};
 if(kind===9){
  for(const x of [2.6,22.4]){
   part(x,.15,6,.36,.3,11,DARK);
   part(x,3.7,6,.6,.24,11,DARK);
  }
  part(12.5,2.83,.62,.46,.46,.46,BRASS).material=glow;
  part(2.58,1.32,8,.85,.58,.66,DARK);
  part(2.9,1.32,8,.25,.36,.36,BRASS).material=glow;
  room.emitter=new T.Vector3(3.03,1.32,z+8);
  room.beams=Array.from({length:count+1},()=>{const mesh=part(0,0,0,.055,.055,1,BRASS);mesh.material=glow;mesh.visible=false;return mesh;});
 }else if(kind===10){
  for(const x of [4.15,20.85]){
   part(x,.06,6,2.2,.12,9.7,DARK);
   for(const offset of [-1.06,1.06])part(x+offset,.23,6,.14,.46,9.8,STONE);
   for(const d of [1.2,10.8])part(x,.23,d,2.2,.46,.14,STONE);
   const water=part(x,.13,6,1.95,.12,9.4,WATER);
   const ripples=[-1,0,1].map((lane,i)=>part(x+lane*.48,.2,3+i*2.5,.055,.015,1.6,0x80dbe0));
   room.basins.push({water,ripples,z,height:.13,target:.13});
  }
 }else{
  part(5.8,2.17,.54,7.6,2.62,.12,BRASS);
  part(5.8,2.17,.62,7.3,2.36,.07,0xc9ad79);
  for(let i=0;i<count;i++){
   const x=5.8+(i-(count-1)/2)*.79;
   if(bank.target[i]){
    for(const dx of [-.24,.24])part(x+dx,2.17,.69,.025,1,.025,0x735539);
    for(const dy of [-.49,.49])part(x,2.17+dy,.69,.48,.025,.025,0x735539);
   }
   const shadow=part(x,2.17,.71,.42,.8,.04,0x3b2d32);
   shadow.rotation.z=(i%3-1)*.32;
   shadow.visible=false;room.shadows.push(shadow);
  }
 }
 return room;
}

function placeBeam(beam,ax,ay,az,bx,by,bz){
 const delta=new T.Vector3(bx-ax,by-ay,bz-az);
 beam.position.set((ax+bx)/2,(ay+by)/2,(az+bz)/2);
 beam.scale.z=delta.length();
 beam.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),delta.normalize());
 beam.visible=true;
}
export function syncPuzzleScenery(room,bank,values,stations,gate){
 if(!room)return;
 const local=values.slice(bank.start,bank.start+bank.count);
 local.forEach((value,i)=>{
  const station=stations[bank.start+i],motion=station.mechanism;
  motion.angle=value*Math.PI/3;
  if(motion.streams)motion.streams.forEach((stream,side)=>{stream.visible=value===1||value===side*2;stream.scale.x=value===1?.32:.58;});
 });
 if(room.kind===9){
  for(const beam of room.beams)beam.visible=false;
  const first=stations[bank.start].position;
  const source=room.emitter;
  placeBeam(room.beams[0],source.x,source.y,source.z,first.x,1.32,first.z);
  const visited=new Set();
  for(let i=0,segment=1;i<bank.count&&local[i]&&!visited.has(i);segment++){
   visited.add(i);
   const next=(i+local[i])%(bank.count+1);
   const from=stations[bank.start+i].position;
   const to=next===bank.count?{x:12.5,z:gate+.62}:stations[bank.start+next].position;
   placeBeam(room.beams[segment],from.x,1.32,from.z,to.x,next===bank.count?2.83:1.32,to.z);
   i=next;
  }
 }else if(room.kind===10){
  const total=bank.target.reduce((sum,v)=>sum+v,0);
  const left=local.reduce((sum,v,i)=>sum+(v===0?bank.target[i]:v===1?bank.target[i]/2:0),0);
  for(const [i,amount] of [left,total-left].entries()){
   room.basins[i].water.visible=amount>0;
   for(const ripple of room.basins[i].ripples)ripple.visible=amount>0;
   room.basins[i].target=.12+.23*amount/total;
  }
 }else{
  const shadow=new Set(local.flatMap((value,i)=>value?[(i+value-1)%bank.count]:[]));
  room.shadows.forEach((mesh,i)=>{mesh.visible=shadow.has(i);});
 }
}
export function animatePuzzleScenery(room,dt,time){
 for(const basin of room.basins){
  basin.height+=(basin.target-basin.height)*Math.min(1,dt*5);
  basin.water.position.y=basin.height;
  basin.water.scale.y=clamp((basin.height-.08)*1.8,.06,.26);
  basin.ripples.forEach((ripple,i)=>{
   ripple.position.y=basin.height+basin.water.scale.y/2+.012;
   ripple.position.z=basin.z+2.1+(time*.0012+i*2.6)%7.7;
  });
 }
 for(const beam of room.beams)if(beam.visible)beam.scale.x=beam.scale.y=.042+.012*Math.sin(time*.009);
}
