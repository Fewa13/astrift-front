// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
export function buildAuthorityScene(scene,job){
 const world=new T.Group();scene.add(world);const time=job==='timelord',stone=new T.MeshStandardMaterial({color:time?0x233e50:0x302c4a,metalness:.65,roughness:.48}),gold=new T.MeshStandardMaterial({color:time?0xcba860:0x9c99ce,metalness:.85,roughness:.3}),light=new T.MeshBasicMaterial({color:time?0x8bf4ec:0xc9b2ff}),dark=new T.MeshStandardMaterial({color:0x0c1426,metalness:.5,roughness:.7}),red=new T.MeshBasicMaterial({color:0xb72d67,transparent:true,opacity:.17,depthWrite:false});
 const box=new T.BoxGeometry(1,1,1),cylinder=new T.CylinderGeometry(1,1,1,12),torus=new T.TorusGeometry(1,.015,6,96),oct=new T.OctahedronGeometry(1);
 const matrices=new Map(),dummy=new T.Object3D();
 function instance(geo,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const key=geo.uuid+mat.uuid;let b=matrices.get(key);if(!b)matrices.set(key,b={geo,mat,list:[]});dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();b.list.push(dummy.matrix.clone());}
 instance(box,stone,0,-2,74,138,4,150);instance(box,dark,0,-.08,74,128,.15,140);
 for(let x=-60;x<=60;x+=8)for(let z=6;z<145;z+=8){instance(box,stone,x,-.01,z,7.8,.1,7.8);instance(box,gold,x,.055,z,.055,.03,7.5);}
 for(const side of [-1,1])for(let i=0;i<12;i++){const x=side*79,z=-5+i*15,h=30+(i%3)*9;instance(cylinder,stone,x,h/2,z,3,h,3);for(let y=3;y<h;y+=6)instance(cylinder,gold,x,y,z,3.3,.35,3.3);instance(box,gold,x,h,z,8,2,8);instance(oct,light,x,h+5,z,2,4,2);for(let j=0;j<4;j++)instance(box,stone,x+side*12+j*side*4,h*.6+j*3,z,4,3,10);}
 for(let i=0;i<96;i++){const angle=i*Math.PI/48;const r=28+(i%3)*13,x=Math.sin(angle)*r,z=74+Math.cos(angle)*r;instance(box,i%4?gold:light,x,.075,z,.16,.025,i%4?1.5:3,0,-angle,0);}
 for(let i=0;i<3;i++){const r=24+i*15;instance(torus,i===1?light:gold,0,.06+i*.005,74,r,r,r,Math.PI/2);}
 const rotors=[];
 if(time){
  for(let i=0;i<4;i++){const ring=new T.Mesh(torus,i%2?gold:light);ring.scale.setScalar(45+i*12);ring.position.set(0,62,161);ring.rotation.set(i*.32,0,0);world.add(ring);rotors.push(ring);}
  for(let i=0;i<60;i++){const a=i*Math.PI/30;instance(box,i%5?gold:light,Math.sin(a)*48,62+Math.cos(a)*48,161,i%5?.5:1.1,i%5?2:5,1,0,0,-a);}
  for(let i=0;i<16;i++){const a=i*Math.PI/8,x=Math.sin(a)*130,z=74+Math.cos(a)*160;instance(box,stone,x,25+i%4*12,z,18,5,24,0,a,.1);for(let j=0;j<5;j++)instance(cylinder,gold,x+(j-2)*3,36+i%4*12,z,1,18,1);}
  instance(oct,light,0,62,161,9,20,6);
 }else{
  for(let i=0;i<7;i++){const ring=new T.Mesh(new T.TorusGeometry(1,.025,4,4),i%2?gold:light);ring.scale.setScalar(36+i*9);ring.rotation.z=Math.PI/4+i*.11;ring.position.set(0,45+i*3,158+i*15);world.add(ring);rotors.push(ring);}
  for(let i=0;i<50;i++){const a=i*2.39996,r=110+i*2,x=Math.cos(a)*r,z=74+Math.sin(a)*r;instance(box,i%3?stone:gold,x,15+i%9*8,z,9+i%4*2,3,14,0,a,i*.1);instance(oct,light,x,24+i%9*8,z,.5,7,.5);}
 }
 for(let i=0;i<120;i++){const a=i*2.39996,r=155+i%12*10;instance(oct,light,Math.cos(a)*r,30+i%13*8,74+Math.sin(a)*r,.12,.12,.12);}
 // Distant sky monuments create parallax without adding collision or obscuring the arena.
 const skyMaterial=new T.MeshBasicMaterial({color:time?0x6ceacb:0x9c7fff,transparent:true,opacity:.28,depthWrite:false});
 if(time){
  for(let lane=0;lane<2;lane++){const points=Array.from({length:13},(_,i)=>new T.Vector3(-380+i*65,130+Math.sin(i*.6+lane)*35+lane*18,-100+i*22));const river=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),128,lane?1.2:3.5,5,false),skyMaterial);world.add(river);}
  for(let i=0;i<7;i++){const x=-260+i*83,y=115+(i%3)*40,z=210+(i%2)*70,r=12+i%3*4;instance(torus,i%2?gold:light,x,y,z,r,r,r,0,i*.25);for(let tick=0;tick<12;tick++){const a=tick*Math.PI/6;instance(box,gold,x+Math.sin(a)*r,y+Math.cos(a)*r,z,.5,2,.5,0,0,-a);}instance(box,light,x,y+r*.25,z,.25,r*.6,.25,0,0,i*.4);}
  for(let i=0;i<28;i++){const a=i*2.399,r=230+i%4*25;instance(box,stone,Math.cos(a)*r,90+i%8*14,74+Math.sin(a)*r,12,2,18,0,a,.2);}
 }else{
  for(let i=0;i<12;i++){const a=i*Math.PI/6,r=240,x=Math.cos(a)*r,y=100+(i%4)*26,z=74+Math.sin(a)*r;instance(torus,i%2?light:gold,x,y,z,15+i%3*5,15+i%3*5,15+i%3*5,.25,a,Math.PI/4);for(let j=0;j<5;j++)instance(box,light,x+j*3,y+j*5,z-j*2,.4,7,.3,0,a,-.4);}
  const fracture=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(-250,160,150),new T.Vector3(-110,210,200),new T.Vector3(-40,170,240),new T.Vector3(40,240,260),new T.Vector3(220,200,210)]),64,1.4,4,false),skyMaterial);world.add(fracture);
 }
 for(const {geo,mat,list}of matrices.values()){const m=new T.InstancedMesh(geo,mat,list.length);list.forEach((matrix,i)=>m.setMatrixAt(i,matrix));m.computeBoundingSphere();world.add(m);}
 // Safety markers remain solid, legible and above every floor ornament.
 const danger=new T.Mesh(new T.PlaneGeometry(128,140),red);danger.rotation.x=-Math.PI/2;danger.position.set(0,.09,74);danger.visible=false;world.add(danger);
 const safe=Array.from({length:2},()=>{const g=new T.Group();const disk=new T.Mesh(new T.CircleGeometry(1,48),new T.MeshBasicMaterial({color:0x45ffd5,transparent:true,opacity:.8,depthWrite:false}));disk.rotation.x=-Math.PI/2;g.add(disk);const boundary=new T.Mesh(new T.TorusGeometry(1,.09,5,48),light);boundary.rotation.x=-Math.PI/2;g.add(boundary);world.add(g);g.visible=false;return g;});
 let run,syncedAt=0;
 return {world,sync(r){run=r;syncedAt=performance.now();},update(now){now=run?.serverNow?run.serverNow+performance.now()-syncedAt:now;rotors.forEach((v,i)=>{v.rotation.z=(time?0:Math.PI/4+i*.11)+(i%2?1:-1)*now*.000018;});const p=run?.authority?.pattern;danger.visible=!!p&&run.status==='active'&&p.hitAt>now;safe.forEach((g,i)=>{g.visible=danger.visible&&!!p.safe[i];if(g.visible){g.position.set(p.safe[i].x,.16,p.safe[i].z);g.scale.setScalar(p.radius);}});}};
}
