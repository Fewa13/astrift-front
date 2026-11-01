// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Shared building tools only. Each chapter below owns a different composition.
import * as T from './three.module.js';
import {mergeEnvironment,environmentTexture} from './ancient-environment-detail.js';
import {STARFALL_SOLIDS,starfallHeight,starfallSurface} from './ancient-starfall.js';
import {FROSTCOURT_SOLIDS,frostcourtHeight,frostcourtSurface} from './ancient-frostcourt.js';
import {SKYREACH_SOLIDS,skyreachHeight,skyreachSurface} from './ancient-skyreach.js';
import {starfallWidth,frostcourtWidth,skyreachWidth} from './ancient-chapter-layouts.js';
const shapes={box:new T.BoxGeometry(1,1,1),rock:new T.IcosahedronGeometry(1,1),cyl:new T.CylinderGeometry(1,1,1,12),cone:new T.ConeGeometry(1,1,10),crystal:new T.OctahedronGeometry(1),ring:new T.TorusGeometry(1,.045,6,48),arch:new T.TorusGeometry(1,.065,6,40,Math.PI),dome:new T.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI/2)};
function workshop(scene,name,height,width,palette){
 const world=new T.Group();world.name=name;scene.add(world);const chunks=new Map(),materials={};
 for(const [key,color]of Object.entries(palette))materials[key]=new T.MeshStandardMaterial({color,map:['stone','floor','cliff'].includes(key)?environmentTexture('stone'):null,roughness:key==='metal'?.4:.87,metalness:key==='metal'?.65:.05});
 materials.glow=new T.MeshBasicMaterial({color:palette.glow});materials.water=new T.MeshStandardMaterial({color:palette.water,roughness:.23,metalness:.45});
 for(let i=0;i<3;i++){materials['tile'+i]=materials.floor.clone();materials['tile'+i].color.multiplyScalar(.82+i*.12);}
 materials.glass=new T.MeshStandardMaterial({color:palette.glass,transparent:true,opacity:.2,roughness:.2,metalness:.2,depthWrite:false,side:T.DoubleSide});
 const chunk=z=>{const k=Math.floor(z/48);if(!chunks.has(k)){const g=new T.Group();g.name='environment-chunk-'+k;world.add(g);chunks.set(k,g);}return chunks.get(k);};
 const put=(shape,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0)=>{const mesh=new T.Mesh(shapes[shape],materials[mat]);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.set(rx,ry,rz);chunk(z).add(mesh);return mesh;};
 const rod=(mat,a,b,r=.15)=>{const v=new T.Vector3().fromArray(b).sub(new T.Vector3().fromArray(a)),m=put('cyl',mat,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,r,v.length(),r);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return m;};
 function floor(end,mat='floor'){
  for(let z=0;z<end;z+=4){const g=new T.PlaneGeometry(1,4,2,1),p=g.attributes.position;for(let i=0;i<p.count;i++){const wz=z+2-p.getY(i),x=p.getX(i)*width(wz)*2;p.setXYZ(i,x,height(x,wz),wz);g.attributes.uv.setXY(i,x/6,wz/6);}g.computeVertexNormals();chunk(z).add(new T.Mesh(g,materials[mat]));
   const slope=-Math.atan((height(0,z+4)-height(0,z))/4),limit=Math.min(width(z),width(z+4))-3;
   for(let x=-Math.floor(limit/5)*5+2.5;x<limit;x+=5){const hash=Math.abs(Math.round(x*3+z*7));if(hash%19===0)continue;const y=height(x,z+2),type=name.includes('fortress')?(x<-10?'ice':x>10?'stone':'tile'+hash%3):'tile'+hash%3;put('box',type,x,y+.025,z+2,4.85,.025,3.85,slope);if(name.includes('astrolabe')&&hash%4===0)put('box','metal',x-2.35,y+.045,z+2,.045,.015,3.4,slope);}
  }
 }
 function outsideRim(mesh,side){mesh.updateMatrix();const p=mesh.geometry.attributes.position,v=new T.Vector3();let minX=Infinity,minZ=Infinity,maxZ=-Infinity,maxWidth=0;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(mesh.matrix);minX=Math.min(minX,side*v.x);minZ=Math.min(minZ,v.z);maxZ=Math.max(maxZ,v.z);}for(let z=minZ;z<maxZ;z+=.25)maxWidth=Math.max(maxWidth,width(z));maxWidth=Math.max(maxWidth,width(maxZ));mesh.position.x+=side*Math.max(0,maxWidth+.08-minX);return mesh;}
 function rim(end,style){
  for(let z=2;z<end;z+=8){const y=height(0,z),wa=width(z-4),wb=width(z+4),w=(wa+wb)/2,length=Math.hypot(8,wb-wa);for(const s of [-1,1]){const angle=Math.atan2(s*(wb-wa),8),pitch=-Math.atan2(height(0,z+4)-height(0,z-4),length),tilt=m=>{m.rotation.order='YXZ';m.rotation.set(pitch,angle,0);return m;};
   if(style==='sea'){tilt(put('box','metal',s*(w+.1),y+.6,z,.4,1.2,length+.05));tilt(put('box','glass',s*(w+.3),y+6,z,.12,10,length+.05));if(z%16===2){put('cyl','metal',s*(w+.2),y+6,z,.25,12,.25);put('box','glow',s*(w-.18),y+1.5,z,.05,.16,1.4);}}
   if(style==='court'){for(let dz=-3.5;dz<4;dz++){const zz=z+dz,a=width(zz-.5),b=width(zz+.5),slope=b-a;put('box','cliff',s*((a+b)/2+1.5*Math.sqrt(1+slope*slope)+.02),height(0,zz)+4,zz,3,10,Math.hypot(1,slope)+.01,0,Math.atan2(s*slope,1));}outsideRim(put('rock','cliff',s*(w+4),y+6,z,5,8+(z%5),6,0,z*.03,s*.18),s);if(z%24===2)outsideRim(put('crystal',s<0?'ice':'coal',s*(w+1),y+6,z,2,8,3,0,z*.08,s*.2),s);}
   if(style==='sky'){tilt(put('box','metal',s*(w-.1),y+.3,z,.4,.6,length+.05));put('rock','cliff',s*(w-2),y-6,z,4,5,6,0,z*.03,s*.25);tilt(put('box','glow',s*(w+.12),y-.15,z,.08,.14,length-.1));}
  }}
  for(const z of [4,style==='sea'?416:style==='court'?386:384])put('box','metal',0,height(0,z)+.55,z,width(z)*2,1.1,.4);
 }
 function finish(surface){for(const g of chunks.values())mergeEnvironment(g);world.userData.rebuilt=true;return {world,fires:[],height:surface,update(_t,camera){if(!world.visible||!camera)return;for(const [k,g]of chunks)g.visible=Math.abs(k*48+24-camera.position.z)<160;}};}
 return {world,put,rod,floor,rim,finish,chunk};
}

export function buildSunkenRuins(scene){
 const b=workshop(scene,'rebuilt-sunken-expedition',starfallHeight,starfallWidth,{stone:0x557b7d,floor:0x7c9690,cliff:0x183f49,metal:0x958363,dark:0x102c38,coral:0xb97f8f,water:0x0d394b,glass:0x85d6dd,glow:0x9ef3db}),{put,rod}=b;
 b.floor(420);b.rim(420,'sea');
 // Sea bed, broken aqueducts and kelp forests beyond the pressure enclosure.
 for(let z=0;z<420;z+=24){const y=starfallHeight(0,z);put('box','water',0,y-22,z,210,1,24);for(const s of [-1,1]){
  const x=s*(starfallWidth(z)+18);put('rock','cliff',x,y-14,z,13,10,13,0,z*.05);
  for(let i=0;i<4;i++){const h=7+(i*5+z)%12;rod('dark',[x+i*2,y-17,z],[x+i*2+Math.sin(i+z)*3,y-17+h,z+3],.28);put('crystal','coral',x+i*2,y-15+h,z+3,.5,2,.7,0,i,.3);}
  if(z%48===0){put('cyl','stone',s*67,y-2,z,3,40,3);put('box','stone',s*67,y+19,z,18,2,11,0,0,s*.13);}
 }}
 for(const o of STARFALL_SOLIDS){if(o.kind==='vault-column')continue;const y=starfallHeight(o.x,o.z);
  if(o.kind==='engine-support'){put('cyl','stone',o.x,y+4.5,o.z,1.45,9,1.45);for(const h of [1,4,8])put('ring','metal',o.x,y+h,o.z,1.55,1.55,1.55,Math.PI/2);put('dome','dark',o.x,y+9,o.z,2,1,2);continue;}
  put('box','stone',o.x,y+o.h/2,o.z,o.w,o.h,o.d);
  if(o.kind==='wreck'){
   put('box','metal',o.x,y+o.h+.3,o.z,o.w+.2,.6,o.d+.3,0,0,.07);for(let i=0;i<5;i++){const z=o.z-o.d*.4+i*o.d*.2;put('arch','metal',o.x,y+o.h,z,o.w*.5,3,.8,0,0,.12);put('box','dark',o.x,y+o.h*.6,z,o.w+.06,1.4,.16);}
   rod('metal',[o.x-o.w/2,y+o.h,o.z-o.d/2],[o.x+o.w/2,y+o.h+5,o.z+o.d/2],.3);
  }else if(o.kind==='archive'){
   for(const s of [-1,1])for(let j=0;j<5;j++){put('box','metal',o.x+s*(o.w/2+.08),y+1+j*1.5,o.z,.15,.12,o.d-1);for(let i=0;i<8;i++)put('box',i%3?'dark':'coral',o.x+s*(o.w/2+.2),y+1.65+j*1.5,o.z-o.d*.42+i*o.d*.12,.2,1.1,o.d*.08);}
   put('dome','stone',o.x,y+o.h,o.z,o.w*.5,3,o.d*.5);
  }else{
   for(const s of [-1,1]){const front=o.z+s*(o.d/2+.08);put('cyl','metal',o.x,y+o.h*.5,front,2.8,.16,2.8,Math.PI/2);put('cyl','dark',o.x,y+o.h*.5,front+s*.1,2.4,.16,2.4,Math.PI/2);put('ring','glow',o.x,y+o.h*.5,front+s*.2,2,2,.2);for(let i=0;i<6;i++){const a=i*Math.PI/3;put('box','metal',o.x+Math.cos(a)*2.2,y+o.h*.5+Math.sin(a)*2.2,front+s*.28,.5,.3,.12,0,0,a);}}
   for(const s of [-1,1]){rod('metal',[o.x+s*3.8,y+.5,o.z-o.d/2],[o.x+s*3.8,y+o.h,o.z+o.d/2],.22);for(let i=0;i<3;i++)put('box','metal',o.x+s*(o.w/2+.05),y+1+i*2,o.z,.12,.16,o.d);}
   for(let i=0;i<3;i++)put('ring','metal',o.x,y+o.h+1,o.z,5+i,5+i,5+i,i*.65,.35);
   put('crystal','glow',o.x,y+o.h+1,o.z,1.3,2,1.3);
  }
 }
 for(const z of [190,256]){const y=starfallHeight(0,z);for(const s of [-1,1])for(const dz of [-5,5])rod('metal',[s*9,y+9,z+dz],[s*3,y+15,z],.25);for(let i=0;i<3;i++)put('ring',i===1?'glow':'metal',0,y+16,z,6+i,6+i,6+i,.3+i*.7,.2+i*.4);put('crystal','glass',0,y+16,z,2.5,4,2.5);}
 // An asymmetric wreck yard, enclosed circular archive, then a deep core vault.
 for(const [z,r]of [[28,20],[178,35],[378,36]]){const y=starfallHeight(0,z);put('ring','metal',0,y+.025,z,r,r,.08,Math.PI/2);for(let i=0;i<10;i++){const a=i*Math.PI/5;put('box','dark',Math.sin(a)*r,y+.03,z+Math.cos(a)*r,1,.04,4,0,a);}}
 for(const z of [112,266]){const y=starfallHeight(0,z);put('arch','stone',0,y+3,z,starfallWidth(z)+.8,13,2);put('arch','metal',0,y+3,z-.4,starfallWidth(z),12.7,1);}
 for(let i=0;i<14;i++){const a=i*Math.PI/7,x=Math.sin(a)*34,z=378+Math.cos(a)*30,y=starfallHeight(x,z);put('cyl','stone',x,y+7,z,1.1,14,1.1);rod('metal',[x,y+14,z],[0,starfallHeight(0,378)+29,378],.14);}
 put('crystal','dark',0,starfallHeight(0,378)+24,378,5,8,5);for(let i=0;i<3;i++)put('ring','glow',0,starfallHeight(0,378)+24,378,8+i,8+i,8+i,i*.7,.2+i*.6);
 put('cyl','stone',0,starfallHeight(0,378)+.14,378,17,.28,17);
 return b.finish(starfallSurface);
}

export function buildTwinphaseCourt(scene){
 const b=workshop(scene,'rebuilt-twinphase-fortress',frostcourtHeight,frostcourtWidth,{stone:0x6a7076,floor:0x8d918c,cliff:0x303b49,metal:0x8b7864,dark:0x292d32,ice:0xb1dce3,coal:0x45372f,ember:0xef6c32,snow:0xdce9e5,water:0x294750,glass:0x9bbbc9,glow:0xffbd69}),{put,rod}=b;
 b.floor(394);b.rim(394,'court');
 for(const o of FROSTCOURT_SOLIDS){if(o.kind==='gallery')continue;const y=frostcourtHeight(o.x,o.z),icy=o.kind==='icekeep';put('box',icy?'stone':o.kind==='furnace'?'coal':'dark',o.x,y+o.h/2,o.z,o.w,o.h,o.d);
  if(icy){
   put('box','snow',o.x,y+o.h+.15,o.z,o.w+.3,.3,o.d+.3);for(let i=0;i<5;i++){const z=o.z-o.d*.4+i*o.d*.2;put('box','ice',o.x,y+o.h*.5,z,o.w+.1,o.h*.5,.3);for(const s of [-1,1]){put('cone','ice',o.x+s*o.w*.4,y+o.h+2,z,1,5,1);put('box','metal',o.x+s*(o.w/2+.1),y+o.h*.5,z,.3,o.h,.5);}}
   for(let i=0;i<5;i++)put('crystal','ice',o.x+(i-2)*o.w*.17,y+o.h+3,o.z,1,5+i%3,1.5,0,i,(i-2)*.13);
  }else if(o.kind==='furnace'){
   for(const s of [-1,1]){const z=o.z+s*(o.d/2+.08);put('arch','metal',o.x,y+o.h*.35,z,o.w*.4,o.h*.55,.5);put('box','ember',o.x,y+o.h*.4,z,o.w*.64,o.h*.62,.08);for(let i=0;i<5;i++)put('box','metal',o.x+(i-2)*o.w*.14,y+o.h*.4,z+s*.12,.18,o.h*.68,.18);put('box','metal',o.x,y+.5,z,o.w,.6,.5);}
   for(const s of [-1,1]){put('arch','metal',o.x+s*(o.w/2+.1),y+o.h*.45,o.z,o.d*.35,o.h*.4,1,0,Math.PI/2);put('box','ember',o.x+s*(o.w/2+.06),y+o.h*.4,o.z,.08,o.h*.45,o.d*.5);for(let i=0;i<6;i++)put('box','metal',o.x+s*(o.w/2+.18),y+o.h*.4,o.z-o.d*.23+i*o.d*.09,.2,o.h*.5,.25);}
   for(const dz of [-o.d*.25,o.d*.25]){put('cyl','metal',o.x,y+o.h+5,o.z+dz,1.3,10,1.3);put('ring','metal',o.x,y+o.h+9.8,o.z+dz,1.6,1.6,1.6,Math.PI/2);put('rock','coal',o.x+1,y+o.h+13,o.z+dz,2,4,2);}
  }else if(o.kind==='archive'){
   for(const s of [-1,1])for(let j=0;j<5;j++){put('box','metal',o.x+s*(o.w/2+.08),y+1+j*1.7,o.z,.12,.13,o.d);for(let i=0;i<8;i++)put('box','stone',o.x+s*(o.w/2+.15),y+1.6+j*1.7,o.z-o.d*.43+i*o.d*.12,.12,1,o.d*.08);}
  }else{for(let i=0;i<5;i++)put('box','metal',o.x-o.w*.4+i*o.w*.2,y+o.h+.7,o.z,1.4,1.4,o.d);put('cone','dark',o.x,y+o.h+3,o.z,o.w*.7,5,o.d*.65,0,Math.PI/4);}
 }
 // Open split courtyard: cold ceremonial route left, industrial route right.
 for(let z=96;z<164;z+=6){const y=frostcourtHeight(0,z);for(const s of [-1,1]){put('box',s<0?'ice':'metal',s*17,y+.018,z,12,.025,5.8);put('box',s<0?'snow':'ember',s*25,y+.025,z,.25,.03,5.8);}}
 for(const z of [80,180,280]){const y=frostcourtHeight(0,z);put('arch','stone',0,y+7,z,30,9,2.5);for(const s of [-1,1]){put('box','metal',s*28,y+8,z,2,16,4);put('crystal',s<0?'ice':'ember',s*28,y+17,z,1.2,3,1.2);}}
 for(const z of [110,145,215,250,320,375]){const y=frostcourtHeight(0,z);for(const s of [-1,1]){const x=s*27;rod('metal',[x,y+5,z],[x,y+12,z],.16);put('box','metal',x,y+12,z,5,.4,1);put('box',s<0?'ice':'ember',x,y+9,z,.1,5,3);}}
 // Final court is a horseshoe of tiered galleries, not another column corridor.
 const z=360,y=frostcourtHeight(0,z);for(let i=0;i<15;i++){const a=(i/14)*Math.PI,x=Math.cos(a)*39,wz=z+Math.sin(a)*28;put('box','stone',x,y+3,wz,6,6,7);put('box','metal',x,y+6.2,wz,6.3,.4,7.2);put('cone',x<0?'ice':'ember',x,y+9,wz,1,5,1);}
 put('cyl','stone',0,y+.15,z,16,.3,16);put('ring','metal',0,y+.32,z,15.8,15.8,.08,Math.PI/2);put('box','dark',0,y+12,391,24,24,5);put('ring','metal',0,y+16,387.9,7,7,1);put('crystal','ice',-5,y+16,387.8,2,5,1);put('crystal','ember',5,y+16,387.8,2,5,1);
 return b.finish(frostcourtSurface);
}

export function buildBrokenSkyreach(scene){
 const b=workshop(scene,'rebuilt-floating-astrolabe-islands',skyreachHeight,skyreachWidth,{stone:0x747d8a,floor:0x9ca4a8,cliff:0x333d58,metal:0xc8ae77,dark:0x242d48,glass:0x88b5d2,water:0x354d69,glow:0x9de6ff,cloud:0xc8d8de}),{put,rod}=b;
 b.floor(390);b.rim(390,'sky');
 // There is no endless outer wall: broken islands hang visibly over the clouds.
 for(const [z,r]of [[30,34],[125,44],[225,40],[350,44]]){const y=skyreachHeight(0,z);put('rock','cliff',0,y-18,z,r,15,r*.85);put('cone','cliff',0,y-31,z,r*.55,27,r*.5,0,0,Math.PI);for(const s of [-1,1]){put('rock','cloud',s*80,y-30,z,35,5,30);for(let i=0;i<4;i++)put('rock','cloud',s*(60+i*17),y-33-i,z+20-i*13,23,5,20);}}
 for(const o of SKYREACH_SOLIDS){if(o.kind==='cable-anchor')continue;const y=skyreachHeight(o.x,o.z);put('box',o.kind==='relay'?'dark':'stone',o.x,y+o.h/2,o.z,o.w,o.h,o.d);
  if(o.kind==='observatory'){
   for(let i=0;i<4;i++){put('box','glass',o.x,y+o.h*.5,o.z-o.d*.35+i*o.d*.23,o.w+.08,o.h*.6,2.5);put('box','metal',o.x,y+o.h*.5,o.z-o.d*.35+i*o.d*.23,o.w+.2,o.h*.65,.2);}
   put('dome','dark',o.x,y+o.h,o.z,o.w*.65,6,o.d*.58);rod('metal',[o.x,y+o.h+5,o.z],[o.x-Math.sign(o.x)*9,y+o.h+10,o.z-5],.8);put('ring','metal',o.x-Math.sign(o.x)*9,y+o.h+10,o.z-5,2,2,2,.8,0,.6);
  }else if(o.kind==='orrery'||o.kind==='relay'){
   for(let i=0;i<3;i++)put('ring',i===1?'glow':'metal',o.x,y+o.h+4,o.z,5+i,5+i,5+i,.4+i*.7,.3+i*.65);put('crystal','glow',o.x,y+o.h+4,o.z,1.2,2,1.2);
  }else{
   for(let i=0;i<3;i++)put('ring','metal',o.x,y+2+i*4,o.z,o.w*.55,o.w*.55,o.w*.55,Math.PI/2);put('crystal','glow',o.x,y+o.h+2,o.z,1,3,1);for(const s of [-1,1])rod('metal',[o.x,y+o.h,o.z],[o.x+s*4,y+o.h+7,o.z+3],.22);
  }
 }
 // Three narrow elevated causeways, with hanging cable pylons outside the path.
 for(const [start,end]of [[65,85],[165,185],[265,285]]){
  for(let z=start;z<=end;z+=2){const y=skyreachHeight(0,z);put('box','metal',0,y-.4,z,44,.6,.3);put('box','dark',0,y-.1,z,12,.15,1.75);}
  for(const s of [-1,1]){const x=s*21,y=skyreachHeight(0,start);put('cyl','metal',x,y+9,start,.45,18,.45);put('cyl','metal',x,y+15,end,.45,18,.45);rod('metal',[x,y+17,start],[x,y+23,end],.15);for(let z=start;z<=end;z+=4)rod('metal',[x,skyreachHeight(0,z)+1,z],[x,y+17+(z-start)*.3,z],.07);}
 }
 // Off-axis, ruined giant rings make each approach read as a separate island.
 for(const [x,z,r]of [[-15,115,18],[17,216,17],[-8,350,25]]){const y=skyreachHeight(0,z);put('ring','stone',x,y+35,z,r,r,r,.25,.25,.2);put('ring','metal',x,y+35,z,r-.6,r-.6,r-.6,.25,.25,.2);for(let i=0;i<9;i++){const a=i*Math.PI*2/9;put('crystal','glow',x+Math.sin(a)*r,y+35+Math.cos(a)*r,z,1,1.8,.5,0,0,-a);}}
 const y=skyreachHeight(0,352);put('cyl','stone',0,y+.15,352,15,.3,15);for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.sin(a)*30,z=352+Math.cos(a)*26;put('cyl','metal',x,y+8,z,.35,16,.35);put('crystal','glow',x,y+17,z,.7,2,.7);rod('metal',[x,y+16,z],[0,y+35,352],.07);}
 put('crystal','glow',0,y+35,352,2,4,2);
 return b.finish(skyreachSurface);
}
