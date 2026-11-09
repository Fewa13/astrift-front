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
  if(bank.kind===14)return [8,12.5,17,8,12.5,17].map((x,i)=>({x,z:gateAt(room)+(i<3?4:8)}));
  if(bank.kind===16)return [0,1,2,3,4,5,6,7].slice(0,bank.count).map((_,i)=>({x:i===0?9:i===bank.count-1?16:6+(i%3)*5,z:gateAt(room)+(i===0?10:i===bank.count-1?2:4+Math.floor(i/3)*3)}));
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
 let doors=[],signs=[],plaques=[],readouts=[];
 function buildRooms(banks){
  for(const sign of [...signs,...plaques,...readouts.filter(Boolean)]){sign.material.map.dispose();sign.material.dispose();}
  stonework.clear();doors=[];signs=[];plaques=[];readouts=[];
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
    const glyph=value=>bank.symbols[value];
    let pattern;
    if(bank.kind===1)pattern=bank.target.map(value=>['○','△','◇','✦'][value]).join('   ');
    else if(bank.kind===5)pattern=glyph(bank.target[0]);
    else if(bank.kind===14||bank.kind===17)pattern=bank.target.map(value=>value?glyph(value-1):'＿').join(' ');
    else if(bank.kind===15||[2,3,8].includes(bank.kind))pattern=bank.target.map(glyph).join(' › ');
    else if(bank.kind===13)pattern=['━',...bank.target.slice(1).map(value=>value?'╳':'═')].join(' ');
    else if(bank.kind===11)pattern=bank.symbols.map((glyph,i)=>bank.target[i]?glyph:'·').join(' ');
    else if(bank.kind===10||bank.kind===12){
     const total=bank.target.reduce((a,b)=>a+b,0),left=(total+(bank.kind===10?bank.target[0]:0))/2;
     pattern=left+'  ║  '+(total-left);
    }
    else if(bank.kind===9)pattern='☀  '+bank.target.map(i=>i+1).join(' · ')+'  ◇';
    else pattern=({0:'↑',4:'✦',6:'⌛',7:'◇ ◇',9:'☀ → ◇',16:'Ⅰ → Ⅱ'})[bank.kind]||'';
    const sign=badge(pattern,true);
    sign.position.set(12.5,3.35,z+1.1);sign.scale.set(4.5,.72,1);
    const plaque=badge(bank.clue[en()?1:0],true,true);
    plaque.position.set(12.5,2.38,z+1.05);plaque.scale.set(4.2,.68,1);
    plaques.push(plaque);stonework.add(plaque);
    if(bank.kind===5&&bank.target.length===2){
     const side=badge(glyph(bank.target[1]),true);
     side.position.set(5.5,2,z+.55);side.scale.set(1.1,.6,1);
     plaques.push(side);stonework.add(side);
    }
    signs.push(sign);stonework.add(sign);
    if([6,9,10,11,12,15,16].includes(bank.kind)){
     const readout=badge('',true);
     readout.position.set(12.5,1.64,z+1.04);readout.scale.set(4.2,.65,1);
     readouts[i]=readout;stonework.add(readout);
    }
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
 let nearby=-1,lastPlate=-1,clockOffset=0;
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
 function badge(name,fixed=false,wrap=false){
  const label=document.createElement('canvas');label.width=256;label.height=48;
  const ctx=label.getContext('2d');ctx.fillStyle='#302719';ctx.fillRect(0,0,256,48);ctx.fillStyle='#fff0ce';ctx.font=(wrap?'12':'21')+'px system-ui';ctx.textAlign='center';
  if(wrap){
   const tokens=name.includes(' ')?name.split(/(?<= )/):Array.from(name);
   const lines=[''];
   for(const token of tokens){
    const i=lines.length-1;
    if(ctx.measureText(lines[i]+token).width>240)lines.push(token);
    else lines[i]+=token;
   }
   lines.slice(0,3).forEach((line,i)=>ctx.fillText(line,128,15+i*13,244));
  }else ctx.fillText(name,128,31,244);
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
     if(kind>=9){
      const colors=[0xb3d6d9,0x508ca5,0x564767,0x927048,0x8a7663,0xc4a073,0xd4aa5f,0x837052,0xa58e65];
      const tint=colors[kind-9];
      if([10,12,14].includes(kind))part(0,1.08,0,1.1,.19,.78,tint);
      station.mark=part(0,1.27,0,kind===9?1:.58,kind===16?.75:.45,kind===9?.1:.43,tint);
      station.tint=tint;
     }else if(kind===6){
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
  state=next;clockOffset=next.serverTime-Date.now();
  doors.forEach((door,i)=>{
   const bank=next.banks?.[i];
   door.visible=!bank?.done;
   if(readouts[i])readouts[i].visible=door.visible;
   if(signs[i])signs[i].visible=bank?.kind!==8||!next.values[bank.start]||bank.done;
  });
  for(let i=0;i<stations.length;i++){
   const station=stations[i],bank=next.banks[station.bank];
   const local=i-bank.start,value=next.values[i],kind=bank.kind;
   const progress=next.values[bank.start]||0;
   const lit=bank.done||(kind===1?value===bank.target[local]:[4,6,7].includes(kind)?value===1:
    [2,3,8].includes(kind)&&bank.target.slice(0,progress).includes(local));
   station.mark.material=lit?jade:material(station.tint??(kind===2?0x57402f:0x96754e));
   if(kind>=9&&kind<=13)station.mark.rotation.y=value*Math.PI/3;
   if(kind===14||kind===17)station.mark.visible=!!value;
   if(kind===0)station.mark.rotation.x=lit?.55:-.55;
   let label=kind===0?(en()?'Lever':'拉杆'):kind===4?String(local+1):
    kind===1?['○','△','◇','✦'][value]:kind===7?(bank.symbols[bank.target[local]]||'?'):bank.symbols[local];
   let reading=kind===1?'#'+(local+1)+' · '+(en()?'Match':'对准')+' '+['○','△','◇','✦'][bank.target[local]]:
    lit?'✓':kind===3?(en()?'Step here':'踩上石板'):'F';
   if(kind>=9){
    if(kind===9){label=String(local+1);reading=value?'→ '+(local+value>=bank.count?local+value===bank.count?'◇':'1':local+value+1):'☀ ×';}
    if(kind===10||kind===12){label=String(bank.target[local]);reading=(kind===10?['←','↔','→']:['—','←','→'])[value];}
    if(kind===11){label=bank.symbols[local];reading=value?bank.symbols[(local+value-1)%bank.count]:'—';}
    if(kind===13){label=String(local+1);reading=['·','━','┃'][value];}
    if(kind===14||kind===17){label=value?bank.symbols[value-1]:'＿';reading=kind===17&&next.held?(en()?'Held ':'手持 ')+bank.symbols[next.held-1]:'F';}
    if(kind===15){label=bank.symbols[local];reading='F';}
    if(kind===16){label=local===0?'Ⅰ':local===bank.count-1?'Ⅱ':'·';reading=local===0||local===bank.count-1?'F':'';}
   }
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
  const currentBank=state.banks?.[active],readout=readouts[active];
  if(readout&&currentBank){
   const {start,count,kind,target,symbols}=currentBank;
   const values=state.values.slice(start,start+count);
   const seconds=Math.max(0,Math.ceil(((state.deadline||0)-Date.now()-clockOffset)/1000));
   let message='';
   if(kind===6||kind===16)message=state.deadline?seconds+' s':'⌛';
   if(kind===9){
    const path=[0];
    while(path.at(-1)<count&&values[path.at(-1)]){
     const next=(path.at(-1)+values[path.at(-1)])%(count+1);
     if(path.includes(next)){message='↻';break;}
     path.push(next);
    }
    message=path.map(i=>i===count?'◇':i+1).join(' → ')+(message?' '+message:'');
   }
   if(kind===10||kind===12){
    const left=values.reduce((sum,v,i)=>sum+(kind===10?v===0?target[i]:v===1?target[i]/2:0:v===1?target[i]:0),0);
    const right=kind===10?target.reduce((a,b)=>a+b,0)-left:values.reduce((sum,v,i)=>sum+(v===2?target[i]:0),0);
    message=left+'  ║  '+right;
   }
   if(kind===11){
    const shadow=new Set(values.flatMap((v,i)=>v?[(i+v-1)%count]:[]));
    message=symbols.map((symbol,i)=>shadow.has(i)?symbol:'·').join(' ');
   }
   if(kind===15)message=target.map((i,j)=>j<values[0]?'✓':symbols[i]).join(' ');
   if(readout.caption!==message){
    readout.caption=message;
    const texture=readout.material.map,ctx=texture.image.getContext('2d');
    ctx.fillStyle='#302719';ctx.fillRect(0,0,256,48);ctx.fillStyle='#fff0ce';ctx.font='bold 19px system-ui';ctx.textAlign='center';
    ctx.fillText(message,128,31,244);texture.needsUpdate=true;
   }
  }
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
  const bank=state.banks?.[active];
  if(bank?.kind===15){
   const phase=Math.floor((Date.now()+clockOffset)/950)%bank.count;
   for(let i=0;i<bank.count;i++)stations[bank.start+i].mark.material=i===phase?jade:material(stations[bank.start+i].tint);
  }
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
  for(const sign of [...signs,...plaques,...readouts.filter(Boolean)]){sign.material.map.dispose();sign.material.dispose();}
  signGeometry.dispose();geometry.dispose();jade.dispose();for(const mat of materials.values())mat.dispose();renderer.dispose();
 }};
}
