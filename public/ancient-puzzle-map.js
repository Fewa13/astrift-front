// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
import {ancientInputCode,ancientSensitivity} from './ancient-input-settings.js';
import {slideAncientMove} from './ancient-control-feel.js';

function stationPositions(floor,count){
 let seed=floor*2654435761|0;
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296};
 // Leave a clear central route from the entrance and keep every station reachable.
 const columns=[3.7,7.5,10.1,15,17.6,21.3];
 const rows=Array.from({length:9},(_,row)=>columns.map(x=>({x,z:6+row*1.48})));
 const slots=rows.flat();
 for(let i=slots.length-1;i>0;i--){
  const j=Math.floor(random()*(i+1));
  [slots[i],slots[j]]=[slots[j],slots[i]];
 }
 return slots.slice(0,count).map(({x,z})=>({x:x+(random()-.5)*.24,z:z+(random()-.5)*.16}));
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
 box(scene,12.5,-.3,13.75,22,.6,20,0x304855);
 box(scene,12.5,5,13.75,22,.2,20,0x293d47);
 for(const x of [1.5,23.5])box(scene,x,2.4,13.75,.3,5,20,0x27404c);
 for(const z of [3.75,23.75])box(scene,12.5,2.4,z,22,5,.3,0x294550);
 for(let x=2;x<=23;x+=1.5)box(scene,x,.012,13.75,.026,.022,20,0x47727b);
 for(let z=4;z<=23;z+=1.5)box(scene,12.5,.012,z,22,.022,.026,0x47727b);
 box(scene,12.5,2,3.93,3.7,4,.2,0x142532);
 box(scene,12.5,4.08,4.04,3.9,.19,.28,0x73d2b5);
 for(const x of [2,23])for(const z of [5,10,15,20]){
  box(scene,x,2.4,z,.55,4.8,.7,0x1d3038);
  box(scene,x,2.8,z,.6,.24,.75,0xc59a60).material=jade;
 }
 for(const x of [10.8,14.2])box(scene,x,.025,13.75,.06,.04,19,0xb18a52);
 for(let i=0;i<10;i++){
  const z=5+i*1.9;
  for(const x of [2.1,22.9]){
   box(scene,x,.38,z,.55,.76,1.75,0x1d2d36);
   box(scene,x,3.5,z,.24,1.05,1.56,0x45616b);
   box(scene,x,3.5,z+.55,.29,.83,.06,0xa77f4e);
  }
  box(scene,12.5,4.77,z,21,.3,.38,0x263640);
  box(scene,12.5,4.58,z,4.6,.07,.1,0x81eacf).material=jade;
  box(scene,12.5,.027,z,.58,.025,.13,0x81eacf).material=jade;
 }
 for(const x of [10.45,14.55]){
  box(scene,x,2.15,4.05,.32,4.3,.36,0xa37a4d);
  box(scene,x,1.85,4.26,.11,2.7,.12,0x81eacf).material=jade;
 }
 const stick={x:0,y:0};
 let nearby=-1;
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
 function badge(name){
  const label=document.createElement('canvas');label.width=256;label.height=48;
  const ctx=label.getContext('2d');ctx.fillStyle='#122433';ctx.fillRect(0,0,256,48);ctx.fillStyle='#edfff5';ctx.font='bold 21px system-ui';ctx.textAlign='center';ctx.fillText(name,128,31,244);
  const texture=new T.CanvasTexture(label),sprite=new T.Sprite(new T.SpriteMaterial({map:texture}));sprite.position.y=2.2;sprite.scale.set(2.3,.43,1);return sprite;
 }
 function clearPlayer(actor){actor.removeFromParent();actor.label.material.map.dispose();actor.label.material.dispose()}
 function sync(next){
  if(state?.floor!==next.floor){
   pos={x:50,z:80};nearby=-1;yaw=pitch=vy=0;height=eyeHeight;keys.clear();
   for(const station of stations)clearPlayer(station);
   stations.length=0;
   const positions=stationPositions(next.floor,next.dials?.length||0);
   for(const [i,{x,z}] of positions.entries()){
    const station=new T.Group();station.position.set(x,0,z);
    const bankIndex=next.banks.findIndex(b=>i>=b.start&&i<b.start+b.count);
    const bank=next.banks[bankIndex],color=[0x61b6e0,0xcdb45c,0x85cc88,0xb48bdd,0xe89a72][bankIndex%5];
    station.bank=bankIndex;
    const kind=bank.kind;
    const base=[0x544530,0x253f4c,0x574032,0x203e51,0x253b32,0x54404a][kind];
    const part=(x,y,z,w,h,d,paint=base)=>box(station,x,y,z,w,h,d,paint);
    if(kind===0){
     part(0,.16,0,1.5,.32,.92);part(0,.62,0,.23,.93,.35);
     station.motion=new T.Group();station.motion.position.y=1.03;station.add(station.motion);
     box(station.motion,0,0,0,1.62,.12,.24,0xb39661);
     for(const x of [-.62,.62]){
      box(station.motion,x,-.18,0,.05,.35,.05,color);
      box(station.motion,x,-.35,0,.53,.08,.49,0x95815d);
     }
    }else if(kind===1){
     part(0,.66,0,1.35,1.32,.47);part(0,.84,.26,1.19,.79,.08,0x152327);
     station.lamps=[];
     for(let bit=0;bit<5;bit++)station.lamps.push(part((bit-2)*.21,.91,.34,.1,.34,.07,color));
     part(0,.64,.34,1.08,.055,.06,0xb3884d);
    }else if(kind===2){
     part(0,.21,0,1.57,.42,.93);part(0,.67,0,.24,.78,.45);
     station.motion=new T.Group();station.motion.position.set(0,1.01,.24);station.add(station.motion);
     for(let tooth=0;tooth<8;tooth++){
      const arm=new T.Group();arm.rotation.z=tooth*Math.PI/4;station.motion.add(arm);
      box(arm,0,.36,0,.18,.55,.24,tooth===0?color:0xa4875c);
     }
     part(0,1.01,.35,.29,.29,.22,0x4a392b);
    }else if(kind===3){
     part(0,.21,0,1.55,.42,.89);part(-.43,.74,0,.34,1.2,.48);part(.45,.58,0,.31,.82,.45);
     part(0,.58,.08,.92,.12,.24,0x57728b);
     station.motion=part(-.43,1.27,0,.62,.22,.6,color);
     part(.48,1.04,0,.52,.13,.39,0xa88555);
    }else if(kind===4){
     part(0,.21,0,1.34,.42,.9);
     for(const x of [-.59,.59])part(x,.82,0,.15,1.32,.29);
     part(0,1.47,0,1.35,.13,.3,0x657f64);
     station.motion=part(0,.92,0,1.06,.095,.12,0x9adfb2);
    }else{
     part(0,.56,0,.49,1.12,.49);part(0,.16,0,1.16,.32,.9);
     station.motion=part(0,1.22,0,.44,.44,.44,color);station.motion.rotation.z=Math.PI/4;
    }
    const label=badge('');label.position.y=1.88;label.scale.set(1.95,.37,1);station.add(label);station.label=label;
    stations.push(station);scene.add(station);
   }
  }
  state=next;
  for(let i=0;i<stations.length;i++){
   const station=stations[i],bank=next.banks[station.bank];
   const value=next.values[i],kind=bank.kind,dial=next.dials[i];
   if(kind===0)station.motion.rotation.z=(value/dial.max-.5)*.48;
   if(kind===1)station.lamps.forEach((lamp,bit)=>lamp.visible=!!(value&(1<<bit)));
   if(kind===2)station.motion.rotation.z=value*Math.PI/6;
   if(kind===3)station.motion.position.y=1.05+.57*value/dial.max;
   if(kind===4)station.motion.position.y=.67+.53*value/dial.max;
   if(kind===5)station.motion.scale.setScalar(bank.done?.65:.44);
   const label=(bank.done?'✓ ':'')+(i+1)+' · '+dial.label[en()?1:0];
   const reading=kind===5?bank.cables[i-bank.start]+' m · '+bank.reading+'/'+bank.count:
    value+' · '+Number(bank.reading.toFixed(3))+' / '+Number(bank.target.toFixed(3))+' '+bank.unit;
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
  const blocked=(x,z)=>x<2||x>23||z<5||z>22.5||stations.some(o=>Math.abs(x-o.position.x)<1.05&&Math.abs(z-o.position.z)<.8);
  const next=slideAncientMove({x:pos.x*scale,y:height,z:pos.z*scale},
   (side*Math.cos(yaw)-forward*Math.sin(yaw))*step,(-side*Math.sin(yaw)-forward*Math.cos(yaw))*step,blocked,()=>0);
  pos.x=next.x/scale;pos.z=next.z/scale;
  let distance=2;nearby=-1;
  for(let i=0;i<stations.length;i++){
   const station=stations[i],gap=Math.hypot(next.x-station.position.x,next.z-station.position.z);
   if(gap<distance){distance=gap;nearby=i;}
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
  geometry.dispose();jade.dispose();for(const mat of materials.values())mat.dispose();renderer.dispose();
 }};
}
