// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
import {ancientInputCode,ancientSensitivity} from './ancient-input-settings.js';
import {slideAncientMove} from './ancient-control-feel.js';

const ROOM_DEPTH=12;
const gateAt=index=>16-(index+1)*ROOM_DEPTH;

function stationPositions(floor,banks){
 return banks.flatMap((bank,room)=>{
  const slots=[6,10,15,19].flatMap(x=>[4,8].map(depth=>({x,z:gateAt(room)+depth})));
  let seed=Math.imul(floor*31+room+1,2654435761);
  for(let i=slots.length-1;i>0;i--){
   seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
   const j=(seed>>>0)%(i+1);
   [slots[i],slots[j]]=[slots[j],slots[i]];
  }
  return bank.kind===0?[{x:12.5,z:13}]:slots.slice(0,bank.count);
 });
}

export function createPuzzleMap(canvas,name,en,interact){
 const renderer=new T.WebGLRenderer({canvas,antialias:true});
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(75,1,.06,70);
 scene.background=new T.Color(0x142633);
 scene.add(new T.HemisphereLight(0xbde9eb,0x3b3041,2));
 const light=new T.DirectionalLight(0xffe5b9,2);light.position.set(4,8,6);scene.add(light);
 const geometry=new T.BoxGeometry(),materials=new Map(),stations=[],players=new Map(),keys=new Set();
 const material=color=>{if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color}));return materials.get(color)};
 function box(parent,x,y,z,w,h,d,color){const mesh=new T.Mesh(geometry,material(color));mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh);return mesh}
 const scale=.25,eyeHeight=1.7;
 const jade=new T.MeshStandardMaterial({color:0x81eacf,emissive:0x218e78,emissiveIntensity:.65});
 const signGeometry=new T.PlaneGeometry(1,1);
 const stonework=new T.Group();scene.add(stonework);
 let doors=[],signs=[];
 function buildRooms(banks){
  for(const sign of signs){sign.material.map.dispose();sign.material.dispose();}
  stonework.clear();doors=[];signs=[];
  const count=Math.max(1,banks.length),end=gateAt(count-1),length=24-end;
  const stone=0x554638,trim=0x8e7350;
  box(stonework,12.5,-.32,24-length/2,22,.64,length,0x534737);
  box(stonework,12.5,5,24-length/2,22,.3,length,0x3c342b);
  for(const x of [1.5,23.5])box(stonework,x,2.45,24-length/2,.4,5,length,stone);
  box(stonework,12.5,2.45,24,22,5,.5,stone);
  for(let i=0;i<count;i++){
   const z=gateAt(i),tint=i%2?stone:0x615240;
   for(const x of [6,19])box(stonework,x,2.45,z,9,5,.65,tint);
   box(stonework,12.5,4.3,z,4.2,1.4,.85,trim);
   const bank=banks[i];
   if(bank){
    const pattern=bank.kind===1?bank.target.map(value=>['○','△','◇','✦'][value]):
     bank.kind===0?['↑']:[4,6,7].includes(bank.kind)?[{4:'✦',6:'⌛',7:'◇ ◇'}[bank.kind]]:bank.target.map(index=>bank.symbols[index]);
    const sign=badge(pattern.join([2,3,8].includes(bank.kind)?' › ':'   '),true);
    sign.position.set(12.5,3.35,z+1.1);sign.scale.set(4.5,.72,1);
    signs.push(sign);stonework.add(sign);
   }
   doors.push(box(stonework,12.5,1.85,z,4.1,3.7,.64,0x70604a));
   for(const x of [10.45,14.55]){
    box(stonework,x,1.9,z+.38,.45,3.8,.44,trim);
    box(stonework,x,2.6,z+.65,.26,.52,.19,trim).material=jade;
   }
   for(let k=1;k<6;k++)box(stonework,12.5,.018,z+k*1.75,2.6,.036,.08,trim);
  }
 }
 const stick={x:0,y:0};
 let nearby=-1,lastPlate=-1;
 let state=null,pos={x:50,z:80},yaw=0,pitch=0,height=eyeHeight,vy=0,frame=0,last=0,drag=null;
 const moveKeys={KeyW:'w',ArrowUp:'w',KeyS:'s',ArrowDown:'s',KeyA:'a',ArrowLeft:'a',KeyD:'d',ArrowRight:'d',ShiftLeft:'sprint',ShiftRight:'sprint'};
 function jump(){if(height<=eyeHeight+.01)vy=6.5}
 function turn(dx,dy,sensitivity){yaw-=dx*sensitivity;pitch=T.MathUtils.clamp(pitch-dy*sensitivity,-1.5,1.5)}
 const locked=()=>document.pointerLockElement===canvas;
 function mouseMove(event){if(locked())turn(event.movementX,event.movementY,.002*ancientSensitivity(false))}
 function release(){keys.clear();stick.x=stick.y=0;drag=null}
 document.addEventListener('mousemove',mouseMove);
 window.addEventListener('blur',release);
 canvas.addEventListener('keydown',event=>{
  const key=ancientInputCode(event.code);
  if(key==='KeyF'||key==='Space'){event.preventDefault();if(!event.repeat)(key==='KeyF'?tryInteract:jump)();return}
  if(moveKeys[key]){event.preventDefault();keys.add(moveKeys[key]);}
 });
 canvas.addEventListener('keyup',event=>keys.delete(moveKeys[ancientInputCode(event.code)]));
 canvas.addEventListener('blur',release);
 canvas.addEventListener('pointerdown',event=>{
  canvas.focus();drag={id:event.pointerId,x:event.clientX,y:event.clientY};
  canvas.setPointerCapture?.(event.pointerId);
  if(event.pointerType==='mouse'&&!locked()){try{canvas.requestPointerLock?.()?.catch?.(()=>{});}catch{}}
 });
 canvas.addEventListener('pointermove',event=>{
  if(locked()||drag?.id!==event.pointerId)return;
  turn(event.clientX-drag.x,event.clientY-drag.y,(event.pointerType==='touch'?.004*ancientSensitivity(true):.002*ancientSensitivity(false)));drag.x=event.clientX;drag.y=event.clientY;
 });
 for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>drag=null);
 function tryInteract(){if(nearby>=0||state?.complete)interact(nearby);}
 function badge(name,fixed=false){
  const label=document.createElement('canvas');label.width=256;label.height=48;
  const ctx=label.getContext('2d');ctx.fillStyle='#122433';ctx.fillRect(0,0,256,48);ctx.fillStyle='#edfff5';ctx.font='bold 21px system-ui';ctx.textAlign='center';ctx.fillText(name,128,31,244);
  const texture=new T.CanvasTexture(label);
  if(fixed)return new T.Mesh(signGeometry,new T.MeshBasicMaterial({map:texture}));
  const sprite=new T.Sprite(new T.SpriteMaterial({map:texture}));
  sprite.position.y=2.2;sprite.scale.set(2.3,.43,1);return sprite;
 }
 function clearPlayer(actor){actor.removeFromParent();actor.label.material.map.dispose();actor.label.material.dispose()}
 function sync(next){
  if(state?.floor!==next.floor){
   const room=Math.max(0,(next.banks||[]).findIndex(bank=>!bank.done));
   pos={x:50,z:room===0?80:(gateAt(room-1)-2)/scale};nearby=-1;lastPlate=-1;yaw=pitch=vy=0;height=eyeHeight;keys.clear();
   for(const station of stations)clearPlayer(station);
   stations.length=0;
   buildRooms(next.banks||[]);
   const positions=stationPositions(next.floor,next.banks||[]);
   for(const [i,{x,z}] of positions.entries()){
    const station=new T.Group();station.position.set(x,0,z);
    const bankIndex=next.banks.findIndex(b=>i>=b.start&&i<b.start+b.count);
    const bank=next.banks[bankIndex],color=[0x61b6e0,0xcdb45c,0x85cc88,0xb48bdd,0xe89a72][bankIndex%5];
    station.bank=bankIndex;
    const kind=bank.kind;
    const part=(x,y,z,w,h,d,paint=0x635342)=>box(station,x,y,z,w,h,d,paint);
    if(kind===3){
     part(0,.045,0,1.8,.09,1.8);
     station.mark=part(0,.1,0,1.4,.06,1.4,color);
    }else{
     part(0,.14,0,1.5,.28,1.1);
     part(0,.62,0,kind===2?.35:.75,.88,.62);
     if(kind===6){
      part(0,1.12,0,.75,.16,.75);
      station.mark=part(0,1.41,0,.34,.42,.34,0xffa248);
     }else if(kind===7){
      station.mark=part(0,1.2,0,.82,.16,.66,0xa48563);
      station.mark.rotation.x=.35;
     }else if(kind===8){
      station.mark=part(0,1.23,0,.35,.7,.35,0x806d99);
     }else if(kind===0){
      station.mark=part(0,1.26,0,.17,.64,.18,0xbd8845);
      station.mark.rotation.x=-.55;
      part(0,1.55,-.15,.33,.2,.32,0xd6a568);
     }else if(kind===2){
      part(0,1.14,0,1.18,.25,.91);
      station.mark=part(0,1.44,0,.25,.58,.25,0xffa248);
      station.mark.rotation.z=.25;
     }else{
      station.mark=part(0,1.21,0,kind===4?.45:.73,.48,.36,color);
      if(kind===5)station.mark.rotation.z=Math.PI/4;
     }
    }
    const label=badge('');label.position.y=1.88;label.scale.set(1.95,.37,1);station.add(label);station.label=label;
    stations.push(station);scene.add(station);
   }
  }
  state=next;
  doors.forEach((door,i)=>{
   const bank=next.banks?.[i];
   door.visible=!bank?.done;
   if(signs[i])signs[i].visible=bank?.kind!==8||!next.values[bank.start]||bank.done;
  });
  for(let i=0;i<stations.length;i++){
   const station=stations[i],bank=next.banks[station.bank];
   const local=i-bank.start,value=next.values[i],kind=bank.kind;
   const progress=next.values[bank.start]||0;
   const lit=bank.done||(kind===1?value===bank.target[local]:[4,6,7].includes(kind)?value===1:
    [2,3,8].includes(kind)&&bank.target.slice(0,progress).includes(local));
   station.mark.material=lit?jade:material(kind===2?0x57402f:0x96754e);
   if(kind===0)station.mark.rotation.x=lit?.55:-.55;
   const label=kind===0?(en()?'Lever':'拉杆'):kind===4?String(local+1):
    kind===1?['○','△','◇','✦'][value]:kind===7?(bank.symbols[bank.target[local]]||'?'):bank.symbols[local];
   const reading=kind===1?'#'+(local+1)+' · '+(en()?'Match':'对准')+' '+['○','△','◇','✦'][bank.target[local]]:
    lit?'✓':kind===3?(en()?'Step here':'踩上石板'):'F';
   const caption=label+'\n'+reading;
   if(station.caption!==caption){
    station.caption=caption;
    const texture=station.label.material.map,ctx=texture.image.getContext('2d');
    ctx.fillStyle='#122433';ctx.fillRect(0,0,256,48);ctx.fillStyle='#edfff5';ctx.textAlign='center';ctx.font='bold 16px system-ui';
    ctx.fillText(label,128,19,244);ctx.fillText(reading,128,39,244);texture.needsUpdate=true;
   }
  }
  const remote=new Set();
  for(const p of next.players){
   if(p.name===name())continue;remote.add(p.name);
   let actor=players.get(p.name);
   if(!actor){actor=new T.Group();box(actor,0,.65,0,.55,1.3,.38,0xcb915b);box(actor,0,1.5,0,.4,.4,.4,0xe4c7a0);actor.label=badge(p.name);actor.add(actor.label);actor.position.set(p.x*scale,0,p.z*scale);scene.add(actor);players.set(p.name,actor);}
   actor.target=new T.Vector3(p.x*scale,0,p.z*scale);
  }
  for(const [key,actor] of players)if(!remote.has(key)){clearPlayer(actor);players.delete(key)}
 }
 function draw(time){
  frame=requestAnimationFrame(draw);
  const dt=Math.min(.05,last?(time-last)/1000:0);last=time;if(!state)return;
  const side=Number(keys.has('d'))-Number(keys.has('a'))+stick.x,forward=Number(keys.has('w'))-Number(keys.has('s'))-stick.y;
  const step=(keys.has('sprint')?9:6)*dt/Math.max(1,Math.hypot(side,forward));
  const blocked=(x,z)=>x<2||x>23||z<gateAt(doors.length-1)+.2||z>22.5||doors.some((door,i)=>Math.abs(z-gateAt(i))<.62&&(door.visible||Math.abs(x-12.5)>1.65))||stations.some(o=>state.banks[o.bank].kind!==3&&Math.abs(x-o.position.x)<1.05&&Math.abs(z-o.position.z)<.8);
  const next=slideAncientMove({x:pos.x*scale,y:height,z:pos.z*scale},
   (side*Math.cos(yaw)-forward*Math.sin(yaw))*step,(-side*Math.sin(yaw)-forward*Math.cos(yaw))*step,blocked,()=>0);
  pos.x=next.x/scale;pos.z=next.z/scale;
  const active=state.banks?.findIndex(bank=>!bank.done);
  let distance=2,plate=-1;nearby=-1;
  for(let i=0;i<stations.length;i++){
   const station=stations[i],gap=Math.hypot(next.x-station.position.x,next.z-station.position.z);
   if(station.bank!==active)continue;
   if(state.banks[active].kind===3){
    if(gap<.82&&height<eyeHeight+.16)plate=i;
   }else if(gap<distance){distance=gap;nearby=i;}
  }
  if(plate>=0&&plate!==lastPlate)interact(plate);
  lastPlate=plate;
  vy-=19*dt;height=Math.max(eyeHeight,height+vy*dt);if(height===eyeHeight)vy=0;
  camera.position.set(pos.x*scale,height,pos.z*scale);camera.rotation.set(pitch,yaw,0,'YXZ');
  for(const actor of players.values())actor.position.lerp(actor.target,Math.min(1,dt*6));
  const width=canvas.clientWidth,viewHeight=canvas.clientHeight;
  if(width&&viewHeight&&(camera.aspect!==width/viewHeight||canvas.width!==Math.floor(width*renderer.getPixelRatio())||canvas.height!==Math.floor(viewHeight*renderer.getPixelRatio()))){
   renderer.setSize(width,viewHeight,false);camera.aspect=width/viewHeight;camera.updateProjectionMatrix();
  }
  renderer.render(scene,camera);
 }
 frame=requestAnimationFrame(draw);
 return {position:()=>({...pos}),sync,jump,interact:tryInteract,stick(x,y){stick.x=x;stick.y=y},dispose(){
  cancelAnimationFrame(frame);if(locked())document.exitPointerLock();document.removeEventListener('mousemove',mouseMove);window.removeEventListener('blur',release);
  for(const actor of [...players.values(),...stations])clearPlayer(actor);
  for(const sign of signs){sign.material.map.dispose();sign.material.dispose();}
  signGeometry.dispose();geometry.dispose();jade.dispose();for(const mat of materials.values())mat.dispose();renderer.dispose();
 }};
}
