// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';

export function createPuzzleMap(canvas,name,en,interact){
 const renderer=new T.WebGLRenderer({canvas,antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(70,1,.06,70);
 scene.background=new T.Color(0x142633);
 scene.add(new T.HemisphereLight(0xbde9eb,0x3b3041,2));
 const light=new T.DirectionalLight(0xffe5b9,2);light.position.set(4,8,6);scene.add(light);
 const geometry=new T.BoxGeometry(),materials=new Map(),stations=[],players=new Map(),keys=new Set();
 const material=color=>{if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color}));return materials.get(color)};
 function box(parent,x,y,z,w,h,d,color){const mesh=new T.Mesh(geometry,material(color));mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh);return mesh}
 const scale=.25;
 box(scene,12.5,-.3,13.75,22,.6,20,0x304855);
 box(scene,12.5,5,13.75,22,.2,20,0x293d47);
 for(const x of [1.5,23.5])box(scene,x,2.4,13.75,.3,5,20,0x27404c);
 for(const z of [3.75,23.75])box(scene,12.5,2.4,z,22,5,.3,0x294550);
 for(let x=2;x<=23;x+=1.5)box(scene,x,.012,13.75,.026,.022,20,0x47727b);
 for(let z=4;z<=23;z+=1.5)box(scene,12.5,.012,z,22,.022,.026,0x47727b);
 box(scene,12.5,2,3.93,3.7,4,.2,0x142532);
 box(scene,12.5,4.08,4.04,3.9,.19,.28,0x73d2b5);
 let state=null,pos={x:50,z:80},yaw=0,pitch=0,frame=0,last=0,drag=null;
 const moveKeys={w:'w',arrowup:'w',s:'s',arrowdown:'s',a:'a',arrowleft:'a',d:'d',arrowright:'d'};
 function turn(dx,dy){yaw-=dx*.003;pitch=T.MathUtils.clamp(pitch-dy*.003,-1.35,1.35)}
 const locked=()=>document.pointerLockElement===canvas;
 function mouseMove(event){if(locked())turn(event.movementX,event.movementY)}
 function release(){keys.clear();drag=null}
 document.addEventListener('mousemove',mouseMove);
 window.addEventListener('blur',release);
 canvas.addEventListener('keydown',event=>{
  const key=event.key.toLowerCase();
  if(key==='e'){event.preventDefault();interact();return}
  if(moveKeys[key]){event.preventDefault();keys.add(moveKeys[key]);}
 });
 canvas.addEventListener('keyup',event=>keys.delete(moveKeys[event.key.toLowerCase()]));
 canvas.addEventListener('blur',release);
 canvas.addEventListener('pointerdown',event=>{
  canvas.focus();drag={id:event.pointerId,x:event.clientX,y:event.clientY};
  canvas.setPointerCapture?.(event.pointerId);
  if(event.pointerType==='mouse'&&!locked()){try{canvas.requestPointerLock?.()?.catch?.(()=>{});}catch{}}
 });
 canvas.addEventListener('pointermove',event=>{
  if(locked()||drag?.id!==event.pointerId)return;
  turn(event.clientX-drag.x,event.clientY-drag.y);drag.x=event.clientX;drag.y=event.clientY;
 });
 for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>drag=null);
 function badge(name){
  const label=document.createElement('canvas');label.width=256;label.height=48;
  const ctx=label.getContext('2d');ctx.fillStyle='#122433';ctx.fillRect(0,0,256,48);ctx.fillStyle='#edfff5';ctx.font='bold 21px system-ui';ctx.textAlign='center';ctx.fillText(name,128,31,244);
  const texture=new T.CanvasTexture(label),sprite=new T.Sprite(new T.SpriteMaterial({map:texture}));sprite.position.y=2.2;sprite.scale.set(2.3,.43,1);return sprite;
 }
 function clearPlayer(actor){actor.removeFromParent();actor.label.material.map.dispose();actor.label.material.dispose()}
 function sync(next){
  if(state?.floor!==next.floor){
   pos={x:50,z:80};yaw=pitch=0;keys.clear();
   for(const station of stations)clearPlayer(station);
   stations.length=0;
   for(let i=0;i<(next.dials?.length||0);i++){
    const station=new T.Group();station.position.set((14+72*(i+.5)/next.dials.length)*scale,0,5.4);
    box(station,0,.6,0,1.35,1.2,.85,0x466976);
    station.gauge=box(station,0,1.29,.08,.86,.16,.5,0x6adcc1);
    const label=badge(String(i+1));label.position.y=1.65;label.scale.set(.72,.28,1);station.add(label);station.label=label;
    stations.push(station);scene.add(station);
   }
  }
  state=next;
  for(let i=0;i<stations.length;i++)stations[i].gauge.scale.x=.14+.72*(next.timed?Number(i<next.sequence):next.values[i]/next.dials[i].max);
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
  const side=Number(keys.has('d'))-Number(keys.has('a')),forward=Number(keys.has('w'))-Number(keys.has('s'));
  const step=18*dt/Math.max(1,Math.hypot(side,forward));
  pos.x=T.MathUtils.clamp(pos.x+(side*Math.cos(yaw)-forward*Math.sin(yaw))*step,8,92);
  pos.z=T.MathUtils.clamp(pos.z+(-side*Math.sin(yaw)-forward*Math.cos(yaw))*step,20,90);
  camera.position.set(pos.x*scale,1.65,pos.z*scale);camera.rotation.set(pitch,yaw,0,'YXZ');
  for(const actor of players.values())actor.position.lerp(actor.target,Math.min(1,dt*6));
  const width=canvas.clientWidth,height=canvas.clientHeight;
  if(width&&height&&(camera.aspect!==width/height||canvas.width!==Math.floor(width*renderer.getPixelRatio())||canvas.height!==Math.floor(height*renderer.getPixelRatio()))){
   renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
  }
  renderer.render(scene,camera);
 }
 frame=requestAnimationFrame(draw);
 return {position:()=>({...pos}),sync,move(key,down){if(down)keys.add(key);else keys.delete(key)},dispose(){
  cancelAnimationFrame(frame);if(locked())document.exitPointerLock();document.removeEventListener('mousemove',mouseMove);window.removeEventListener('blur',release);
  for(const actor of [...players.values(),...stations])clearPlayer(actor);
  geometry.dispose();for(const mat of materials.values())mat.dispose();renderer.dispose();
 }};
}
