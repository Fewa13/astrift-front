// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
import {CHAPTER_ROUTES,CHAPTER_PROPS,CHAPTER_SCENERY,CHAPTER_EXTRAS,chapterDistance,chapterHeight,chapterPoint,chapterProjection,DUNES_OASIS,dunesOasisRadius} from './ancient-geography.js';
import {mergeEnvironment,environmentTexture,paintMineral} from './ancient-environment-detail.js?v=20261012-new-player-flow-1';
const geom={box:new T.BoxGeometry(1,1,1),rock:new T.IcosahedronGeometry(1,1),ball:new T.SphereGeometry(1,12,8),cyl:new T.CylinderGeometry(1,1,1,10),cone:new T.ConeGeometry(1,1,8),crystal:new T.OctahedronGeometry(1),ring:new T.TorusGeometry(1,.07,5,40),arch:new T.TorusGeometry(1,.10,5,24,Math.PI)};
const palettes={starfall:{floor:0x6b908b,wall:0x193f48,stone:0x537f7e,metal:0xa99869,glow:0x82e4ca,accent:0xb57b98,dark:0x112f3c},frostcourt:{floor:0x9a9e9f,wall:0x4c555e,stone:0x8b8d8b,metal:0x9f7755,glow:0xf2b26c,accent:0x9dd8e4,dark:0x293840},skyreach:{floor:0xc2bea5,wall:0x272d48,stone:0x69738e,metal:0xc0a562,glow:0x91e8ff,accent:0x648ec5,dark:0x17243c},dunes:{floor:0xcaaa72,wall:0x886541,stone:0xb58b5d,metal:0x9c6f3f,glow:0xffd481,accent:0x367d82,dark:0x453f43}};
const chapterTextures=new Map();
const chapterStone={dunes:'sand',skyreach:'stormstone',frostcourt:'froststone',starfall:'abyssstone'};
function chapterTexture(map){if(chapterTextures.has(map))return chapterTextures.get(map);const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');let seed=91231;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};paintMineral(g,map==='skyreach'?'marble':chapterStone[map],rnd);for(let i=0;i<2500;i++){g.globalAlpha=.04+rnd()*.06;g.fillStyle=i%2?'#fff6dd':'#383c42';g.fillRect(rnd()*512,rnd()*512,rnd()*5+1,rnd()*4+1)}g.globalAlpha=1;if(map==='dunes'){for(let y=-40;y<560;y+=14){g.strokeStyle='#89673c27';g.lineWidth=2;g.beginPath();for(let x=0;x<=512;x+=8){const yy=y+Math.sin(x*.019+y*.013)*12;x?g.lineTo(x,yy):g.moveTo(x,yy)}g.stroke()}}else{const step=map==='starfall'?64:128;for(let y=0;y<512;y+=step)for(let x=-step;x<512;x+=step){g.strokeStyle=map==='starfall'?'#3b68665a':'#454c4a44';g.lineWidth=2;g.strokeRect(x+(y/step%2)*step/2+2,y+2,step-4,step-4);if(map==='starfall'){g.strokeStyle='#cde0bc77';g.beginPath();g.arc(x+step/2,y+step/2,step*.23,0,6.3);g.stroke()}}}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=2;chapterTextures.set(map,t);return t;}
// Sample the whole footprint because slopes and island edges can cross a model.
function lowestGround(map,x,z,w,d){
 let y=chapterHeight(map,x,z);
 const nx=Math.ceil(w),nz=Math.ceil(d);
 for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){
  const px=x+w*(i/nx-.5),pz=z+d*(j/nz-.5);
  if(chapterDistance(map,px,pz)>=-1)y=Math.min(y,chapterHeight(map,px,pz));
 }
 return y;
}
function chapterSurroundings(map,add,rod){
 const route=CHAPTER_ROUTES[map],x0=Math.min(...route.map(p=>p[1]-p[3]))-30,x1=Math.max(...route.map(p=>p[1]+p[3]))+30,z0=Math.min(...route.map(p=>p[2]-p[3]))-30,z1=Math.max(...route.map(p=>p[2]+p[3]))+30;
 // Open-air maps keep detached scenery. Canyon and fortress walls are built from the terrain contour.
 if(map==='starfall'||map==='skyreach')for(let x=x0;x<x1;x+=9)for(let z=z0;z<z1;z+=9){const d=chapterDistance(map,x,z);if(d> (map==='skyreach'?-8:-6)||d< -19||map==='skyreach'&&chapterProjection(map,x,z).width<22)continue;const noise=(Math.sin(x*7.1+z*13.3)+1)/2,h=chapterHeight(map,x,z),angle=Math.atan2(chapterDistance(map,x+1,z)-chapterDistance(map,x-1,z),chapterDistance(map,x,z+1)-chapterDistance(map,x,z-1));
 if(map==='starfall'){add('rock','stone',x,h+2,z,5,5+noise*4,5,0,angle,.1);if(noise>.45){for(let i=0;i<3;i++){const a=angle+i*2;rod([x,h+3,z],[x+Math.sin(a)*3,h+7+i*2,z+Math.cos(a)*3],.35,'accent');add('ball','accent',x+Math.sin(a)*3,h+7+i*2,z+Math.cos(a)*3,.8,1.3,.8)}}if(noise>.85){add('cyl','stone',x,h+8,z,1.6,16,1.6);add('box','metal',x,h+16,z,5,.6,5)}}
 else{add('rock','stone',x,h-10,z,5.7,9,5.7,0,angle,.15);add('crystal','accent',x,h-15-noise*7,z,1.8,6+noise*4,1.8,.2,angle,.3);if(noise>.8)add('cone','dark',x,h-22,z,5,22,5,Math.PI)}}
 // Every outlying landmark has a substantial terrain foundation, not a floating box.
 for(const o of CHAPTER_PROPS[map]){
  const top=chapterHeight(map,o.x,o.z),bottom=lowestGround(map,o.x,o.z,o.w,o.d)-1.6;
  add('box','stone',o.x,(top+bottom)/2,o.z,o.w,top-bottom,o.d);
 }
 if(map==='starfall'){
  for(let i=0;i<36;i++){const a=i*Math.PI*2/36,x=Math.sin(a)*35,z=88+Math.cos(a)*35,y=chapterHeight(map,x,z);if(chapterDistance(map,x,z)<4)continue;add('box','metal',x,y+.03,z,1,.04,5,0,-a);if(i%3===0){add('cyl','stone',x,y+1.2,z,1.2,2.4,1.2);add('ball','glow',x,y+2.5,z,.4,.4,.4)}}
  for(const p of CHAPTER_SCENERY[map].filter(p=>p.kind==='path-plinth')){const y=chapterHeight(map,p.x,p.z);add('cyl','stone',p.x,y+.5,p.z,1.4,1,1.4);add('ring','metal',p.x,y+1.02,p.z,1.4,1.4,1.4,Math.PI/2);}
 }else if(map==='frostcourt'){
  for(const {x,z} of CHAPTER_SCENERY[map].filter(p=>p.kind==='court-plinth')){const y=chapterHeight(map,x,z);add('box','stone',x,y+1,z,2,2,5);add('box','metal',x,y+2.2,z,2.5,.3,5.5);add('cone','accent',x,y+3,z,1,2,1)}
  for(let z=275;z<340;z+=9)for(const x of [-20,20]){const y=chapterHeight(map,x,z);add('box','dark',x,y+.025,z,4,.04,6);add('box','metal',x,y+.055,z,3.5,.015,.15)}
  for(const x of [119,126,133]){const y=chapterHeight(map,x,165);rod([x,y+3,140],[x,y+3,192],.6,'metal');for(let z=140;z<193;z+=13)add('ring','dark',x,y+3,z,1,1,1,0,Math.PI/2)}
 }else if(map==='skyreach'){
  for(let u=8;u<380;u+=12){const center=chapterPoint(map,0,u);if(chapterProjection(map,center.x,center.z).width<20)continue;const p=chapterPoint(map,36,u),y=chapterHeight(map,p.x,p.z);add('cyl','metal',p.x,y+.6,p.z,.35,1.2,.35);add('crystal','glow',p.x,y+1.5,p.z,.25,.6,.25);}
  for(const u of [30,115,215,340]){const p=chapterPoint(map,0,u);for(let i=0;i<16;i++){const a=i*Math.PI/8,x=p.x+Math.sin(a)*17,z=p.z+Math.cos(a)*17;add('box','metal',x,chapterHeight(map,x,z)+.045,z,2,.04,.45,0,a)}}for(const {x,z,w,d} of CHAPTER_SCENERY[map].filter(p=>p.kind==='island-rock'))add('rock','accent',x,chapterHeight(map,x,z)+.35,z,w/2,.6,d/2);
 }else{
  for(let i=0;i<13;i++){const a=i*2.399,x=15+Math.sin(a)*(18+i%3*2),z=180+Math.cos(a)*(12+i%3*3),y=chapterHeight(map,x,z);rod([x,y,z],[x+1,y+9,z],.35,'metal');for(let j=0;j<7;j++){const b=j*Math.PI*2/7;rod([x+1,y+9,z],[x+1+Math.sin(b)*5,y+8,z+Math.cos(b)*5],.14,'accent');add('cloth','accent',x+1+Math.sin(b)*3,y+8.6,z+Math.cos(b)*3,1,.16,5,0,b,.12)}}
  for(let z=300;z<385;z+=7){const y=chapterHeight(map,0,z);add('box','metal',0,y+.03,z,12,.04,.3);for(const x of [-18,18]){add('cyl','metal',x,chapterHeight(map,x,z)+.5,z,.6,1,.6);add('ball','glow',x,chapterHeight(map,x,z)+1.1,z,.4,.4,.4)}}
 }
}

function terrain(map,materials){const route=CHAPTER_ROUTES[map],extra=CHAPTER_EXTRAS[map]||[],xmin=Math.floor(Math.min(...route.map(p=>p[1]-p[3]),...extra.map(p=>p.x-p.w/2))/3)*3,xmax=Math.max(...route.map(p=>p[1]+p[3]),...extra.map(p=>p.x+p.w/2)),zmin=Math.floor(Math.min(...route.map(p=>p[2]-p[3]),...extra.map(p=>p.z-p.d/2))/3)*3,zmax=Math.max(...route.map(p=>p[2]+p[3]),...extra.map(p=>p.z+p.d/2));const pos=[],uv=[],colors=[],walls=[],wallColors=[];const enclosed=map==='dunes'||map==='frostcourt';const base=new T.Color(palettes[map].floor);
 const emit=(p)=>{pos.push(p.x,chapterHeight(map,p.x,p.z),p.z);uv.push(p.x/8,p.z/8);let c=map==='skyreach'&&chapterProjection(map,p.x,p.z).width<22?new T.Color(0x26374c):base.clone(),shade=.9+.09*Math.sin(p.x*.1)*Math.cos(p.z*.07);if(map==='frostcourt')c.lerp(new T.Color(p.x<-40?0xc6ecf0:p.x>55?0x746052:palettes[map].floor),.5);c.multiplyScalar(shade);colors.push(c.r,c.g,c.b)};
 function tri(points){const clipped=[];for(let i=0;i<3;i++){const a=points[i],b=points[(i+1)%3],inside=a.d>=0;if(inside)clipped.push(a);if(a.d*b.d<0){const t=a.d/(a.d-b.d);clipped.push({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,d:0})}}if(clipped.length<3)return;for(let i=1;i<clipped.length-1;i++)for(const p of [clipped[0],clipped[i+1],clipped[i]])emit(p);const edges=clipped.filter(p=>p.d===0);if(edges.length===2){const [a,b]=edges,ay=chapterHeight(map,a.x,a.z),by=chapterHeight(map,b.x,b.z),drop=map==='skyreach'?(chapterProjection(map,(a.x+b.x)/2,(a.z+b.z)/2).width<22?.45:23):map==='starfall'?18:12;const crest=p=>chapterHeight(map,p.x,p.z)+(map==='dunes'?17+3*Math.sin(p.x*.18)+2*Math.cos(p.z*.15):13);
  const quad=(a,b,c,d,shade=1)=>{for(const p of [a,b,c,b,d,c]){walls.push(...p);wallColors.push(shade,shade,shade);}};
  if(!enclosed){quad([a.x,ay,a.z],[b.x,by,b.z],[a.x,ay-drop,a.z],[b.x,by-drop,b.z]);return;}
  const profile=p=>{
   const dx=chapterDistance(map,p.x-.3,p.z)-chapterDistance(map,p.x+.3,p.z);
   const dz=chapterDistance(map,p.x,p.z-.3)-chapterDistance(map,p.x,p.z+.3),n=Math.hypot(dx,dz)||1;
   const h=chapterHeight(map,p.x,p.z),top=crest(p),point=(y,r)=>[p.x+dx/n*r,y,p.z+dz/n*r];
   return map==='dunes'?[point(-18,0),point(h+2,0),point(h+5,.65),point(h+9,1.2),point(top,2.8),point(top+.12,5)]:
    [point(-18,0),point(h+.6,0),point(h+.9,.22),point(top-.45,.22),point(top,0),point(top,2.2)];
  };
  const left=profile(a),right=profile(b),shades=map==='dunes'?[.87,1,.83,1,.93]:[.79,.96,1,.72,.9];
  for(let i=1;i<left.length;i++)quad(left[i-1],right[i-1],left[i],right[i],shades[i-1]);
 }}
 const step=map==='dunes'?1.5:3,visibleDistance=(x,z)=>chapterDistance(map,x,z);
 for(let x=xmin-step;x<xmax+step;x+=step)for(let z=zmin-step;z<zmax+step;z+=step){const a={x,z,d:visibleDistance(x,z)},b={x:x+step,z,d:visibleDistance(x+step,z)},c={x:x+step,z:z+step,d:visibleDistance(x+step,z+step)},d={x,z:z+step,d:visibleDistance(x,z+step)};tri([a,b,c]);tri([a,c,d]);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();const m=new T.Mesh(g,materials.floor);const sides=new T.BufferGeometry();sides.setAttribute('position',new T.Float32BufferAttribute(walls,3));const wallUV=[];
 for(let i=0;i<walls.length;i+=18){const dx=walls[i+3]-walls[i],dz=walls[i+5]-walls[i+2],length=Math.hypot(dx,dz)||1;for(let j=i;j<i+18;j+=3){const u=(walls[j]*dx+walls[j+2]*dz)/length;wallUV.push(u/7,walls[j+1]/7);}}
 sides.setAttribute('uv',new T.Float32BufferAttribute(wallUV,2));sides.setAttribute('color',new T.Float32BufferAttribute(wallColors,3));sides.computeVertexNormals();
 const edgeMesh=new T.Mesh(sides,materials.wall);edgeMesh.name='terrain-boundary';
 return [m,edgeMesh];}
function kit(scene,map){const world=new T.Group();world.name='distinct-'+map;scene.add(world);const p=palettes[map],materials={};for(const [k,c]of Object.entries(p))materials[k]=new T.MeshStandardMaterial({color:c,roughness:k==='metal'?.4:.85,metalness:k==='metal'?.7:.12});materials.floor=new T.MeshStandardMaterial({vertexColors:true,map:chapterTexture(map),roughness:.9});materials.glow=new T.MeshBasicMaterial({color:p.glow});materials.cloth=new T.MeshStandardMaterial({color:p.accent,side:T.DoubleSide,roughness:.9});materials.wall.side=T.DoubleSide;
 materials.stone.map=environmentTexture(chapterStone[map]);
 if(map==='dunes'||map==='frostcourt'){materials.wall.map=materials.stone.map;materials.wall.vertexColors=true;materials.wall.color.multiplyScalar(1.3);}const staticRoot=new T.Group();world.add(staticRoot);
 function add(shape,mat,x,y,z,w,h,d,rx=0,ry=0,rz=0,parent=staticRoot){const groundDetail=shape==='box'&&h<=.08&&rx===0&&rz===0&&y>=chapterHeight(map,x,z)&&y-chapterHeight(map,x,z)<.1;
 if(groundDetail){
  const g=new T.PlaneGeometry(w,d,Math.ceil(w),Math.ceil(d)),p=g.attributes.position,offset=y-chapterHeight(map,x,z),c=Math.cos(ry),s=Math.sin(ry);
  for(let i=0;i<p.count;i++){const u=p.getX(i),v=-p.getY(i),px=x+c*u+s*v,pz=z-s*u+c*v;p.setXYZ(i,px,chapterHeight(map,px,pz)+Math.max(.08,offset),pz);}
  g.computeVertexNormals();const mesh=new T.Mesh(g,materials[mat]);parent.add(mesh);return mesh;
 }
 const m=new T.Mesh(geom[shape],materials[mat]);m.position.set(x,y,z);m.scale.set(w,h,d);m.rotation.set(rx,ry,rz);parent.add(m);return m}
 const rod=(a,b,r=.15,mat='metal',parent=staticRoot)=>{const delta=new T.Vector3(...b).sub(new T.Vector3(...a)),m=add('cyl',mat,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,r,delta.length(),r,0,0,0,parent);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m};
 for(const mesh of terrain(map,materials))world.add(mesh);
 chapterSurroundings(map,add,rod);
 const finish=(update=()=>{},syncFeatures=()=>{})=>{mergeEnvironment(staticRoot);world.userData.layoutVersion=2;world.userData.map=map;return {world,fires:[],height:(x,z)=>chapterHeight(map,x,z),update,syncFeatures}};
 return {world,materials,add,rod,finish};}
export function buildDistinctStarfall(scene){const b=kit(scene,'starfall'),{add,rod}=b;
 // A single broken ship lies on its side outside the spiral, not repeated houses.
 const hull=CHAPTER_PROPS.starfall[0],y=chapterHeight('starfall',hull.x,hull.z);add('box','dark',hull.x,y+6,hull.z,18,12,70,0,0,.22);for(let i=0;i<10;i++){const z=hull.z-32+i*7;add('arch','metal',hull.x,y+12,z,10,13,.6,0,0,.22);add('box','stone',hull.x+9,y+6,z,.7,13,1,0,0,.22)}rod([hull.x-12,y+10,35],[hull.x+8,y+34,95],.6);add('cloth','cloth',hull.x+4,y+23,68,1,18,24,0,0,.3);
 for(const o of CHAPTER_PROPS.starfall.slice(1)){const h=chapterHeight('starfall',o.x,o.z);if(o.kind==='sunken-arch'){for(const side of [-1,1])add('cyl','stone',o.x+side*8,h+8,o.z,2.5,16,2.5);add('arch','stone',o.x,h+16,o.z,9,7,3)}else if(o.kind==='coral-tower'){for(let i=0;i<7;i++){const a=i*2.4;rod([o.x,h,o.z],[o.x+Math.sin(a)*5,h+6+i*1.5,o.z+Math.cos(a)*4],.6,'accent');add('ball','accent',o.x+Math.sin(a)*5,h+6+i*1.5,o.z+Math.cos(a)*4,1.2,2,1.2)}}else add('cyl','stone',o.x,h+o.h/2,o.z,o.w/2,o.h,o.d/2)}
 for(let i=0;i<38;i++){const u=i*10+20,p=chapterPoint('starfall',(i%2?1:-1)*53,u),h=chapterHeight('starfall',p.x,p.z);rod([p.x,h-5,p.z],[p.x+Math.sin(i)*2,h+5+i%6,p.z+2],.18,'accent');for(let j=0;j<3;j++)add('crystal','accent',p.x+Math.sin(i)*2,h+3+j*2,p.z+2,.8,1.3,.3,0,i,j*.4)}
 const core=new T.Group();core.position.set(0,-7,88);b.world.add(core);for(let i=0;i<3;i++)add('ring',i%2?'metal':'glow',0,3+i*.6,0,10+i*2,10+i*2,10+i*2,Math.PI/2+i*.3,0,0,core);add('crystal','glow',0,3,0,2,4,2,0,0,0,core);
 const waterMaterial=new T.MeshStandardMaterial({color:0x17616b,transparent:true,opacity:.23,roughness:.25,metalness:.25,side:T.DoubleSide,depthWrite:false}),water=new T.Mesh(new T.PlaneGeometry(550,480),waterMaterial);water.rotation.x=-Math.PI/2;water.position.set(0,-2,90);b.world.add(water);let drained=false;
 return b.finish(t=>{core.rotation.y=Math.sin(t*.00008)*.25;water.position.y+=( (drained?-15:-2)-water.position.y)*.04},state=>drained=!!state.drained);}
export function buildDistinctFrostcourt(scene){const b=kit(scene,'frostcourt'),{add,rod}=b;
 // The central court branches west into frozen ramparts and east into furnaces.
 for(const o of CHAPTER_PROPS.frostcourt){if(o.kind==='nave-column')continue;const h=chapterHeight('frostcourt',o.x,o.z);if(o.kind==='ice-bastion'||o.kind==='throne-wing'){add('box','stone',o.x,h+o.h/2,o.z,o.w,o.h,o.d);for(const x of [-1,1]){add('cyl','stone',o.x+x*o.w/2,h+o.h*.6,o.z,3,o.h*1.3,3);add('cone','accent',o.x+x*o.w/2,h+o.h*1.3,o.z,4,9,4)}for(let i=0;i<5;i++)add('box','dark',o.x,h+3+i*3,o.z-o.d/2-.04,o.w*.55,1,.08);}
 else if(o.kind==='blast-furnace'){add('cyl','dark',o.x,h+5,o.z,6,10,6);for(let i=0;i<3;i++)add('ring','metal',o.x,h+2+i*3,o.z,6.1,6.1,6.1,Math.PI/2);add('cyl','metal',o.x,h+16,o.z,2.8,20,2.8);add('cone','glow',o.x,h+27,o.z,2,6,2);rod([o.x-6,h+5,o.z],[o.x-15,h+5,o.z+14],.8);}
 else if(o.kind==='fountain'){add('cyl','stone',o.x,h+.5,o.z,6,1,6);add('cyl','accent',o.x,h+1.2,o.z,4,.2,4);add('cone','stone',o.x,h+5,o.z,2.5,8,2.5)}else{add('box','stone',o.x,h+5,o.z,8,10,8);add('arch','metal',o.x,h+10,o.z,4,5,2);add('ring','metal',o.x,h+13,o.z,2,2,2,0,Math.PI/2)}}
 for(let z=270;z<340;z+=14){for(const x of [-28,28])add('cyl','stone',x,chapterHeight('frostcourt',x,z)+10,z,1.5,20,1.5);add('arch','stone',0,chapterHeight('frostcourt',0,z)+20,z,29,12,1.4)}
 for(let i=0;i<24;i++){const a=i*Math.PI/12;add('crystal','accent',-115+Math.sin(a)*30,3+i%6,160+Math.cos(a)*30,1,6+i%4,1.5,0,a,.2)}
 for(const x of [-35,35])for(let z=95;z<=205;z+=14){const y=chapterHeight('frostcourt',x,z);add('box','metal',x,y+.05,z,.2,.07,10);if(x>0)add('cone','glow',x,y+1,z,.4,2,.4)}
 let phase=0;return b.finish(t=>{for(const m of b.world.children)if(m.name==='thermal-gates')m.visible=phase===0},s=>{phase=s.phase||0;b.materials.accent.color.setHex(phase?0xe79b62:0x9dd8e4)});}
export function buildDistinctSkyreach(scene){const b=kit(scene,'skyreach'),{add,rod}=b;
 // Separated floating landmasses, rock undersides and long diagonal air bridges.
 for(const u of [20,115,215,340]){const p=chapterPoint('skyreach',0,u),h=lowestGround('skyreach',p.x,p.z,66,66);add('rock','stone',p.x,h-15.5,p.z,31,14,28,0,u,.2);add('cone','dark',p.x,h-32,p.z,24,38,23,Math.PI,0,.12);for(let i=0;i<9;i++){const a=i*Math.PI*2/9;add('crystal','accent',p.x+Math.sin(a)*23,h-12,p.z+Math.cos(a)*22,2,9+i%3*2,2,Math.PI,i,.3)}}
 for(const o of CHAPTER_PROPS.skyreach){const y=chapterHeight('skyreach',o.x,o.z);if(o.kind==='wind-harp'){for(let i=0;i<7;i++){const h=9+Math.sin(i*.5)*8;add('cyl','metal',o.x+i*1.7-5,y+h/2,o.z,.25,h,.25);rod([o.x+i*1.7-5,y+1,o.z],[o.x+i*1.7-5,y+h,o.z+5],.05,'glow')}}else if(o.kind==='broken-orbit'){for(let i=0;i<3;i++)add('arch','metal',o.x,y+9,o.z,9,9,9,0,i,.3*i)}else{add('cyl','stone',o.x,y+o.h/2,o.z,3,o.h,3);add('crystal','glow',o.x,y+o.h,o.z,2.5,4,2.5);for(let i=0;i<3;i++)add('ring','metal',o.x,y+4+i*4,o.z,4,4,4,0,i*.8)}}
 // Sample each bridge rail against the actual edge and ground, including bends.
 for(const side of [-1,1]){
  let previous;
  for(let u=0;u<=390;u+=2){
   const center=chapterPoint('skyreach',0,u),projection=chapterProjection('skyreach',center.x,center.z);
   if(projection.width>16){previous=null;continue;}
   const a=chapterPoint('skyreach',0,u-3),b=chapterPoint('skyreach',0,u+3);
   const dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);
   const offset=side*(projection.width-1.6),x=center.x+dz/length*offset,z=center.z-dx/length*offset;
   if(chapterDistance('skyreach',x,z)<.8){previous=null;continue;}
   const y=chapterHeight('skyreach',x,z),point=[x,y+1,z];
   if(previous)rod(previous,point,.12,'metal');
   add('cyl','metal',x,y+.5,z,.12,1,.12);
   previous=point;
  }
 }
 const cloudMaterial=new T.MeshBasicMaterial({color:0x8ca8bd,transparent:true,opacity:.8}),cloud=new T.Mesh(new T.PlaneGeometry(1000,1000),cloudMaterial);cloud.rotation.x=-Math.PI/2;cloud.position.set(0,-50,120);b.world.add(cloud);
 return b.finish();}
function buildOasis(world){
 const o=DUNES_OASIS,canvas=document.createElement('canvas');canvas.width=canvas.height=128;
 const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(128,128);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){
  const a=x*Math.PI/64,b=y*Math.PI/64,i=(y*128+x)*4;
  const ripple=Math.sin(a*4+b*7+Math.sin(b*3)*1.2);
  pixels.data.set([140+40*ripple,140+40*ripple,140+40*ripple,255],i);
 }
 ctx.putImageData(pixels,0,0);
 const ripples=new T.CanvasTexture(canvas);ripples.wrapS=ripples.wrapT=T.RepeatWrapping;ripples.repeat.set(3,2);
 const shape=new T.Shape();shape.absellipse(0,0,o.rx*1.18,o.rz*1.18,0,Math.PI*2,false,0);
 const geometry=new T.ShapeGeometry(shape,48),uv=geometry.attributes.uv;
 for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/(2*o.rx)+.5,uv.getY(i)/(2*o.rz)+.5);
 const mesh=new T.Mesh(geometry,new T.MeshStandardMaterial({color:0x489f90,bumpMap:ripples,bumpScale:.27,roughness:.26,emissive:0x2f8478,emissiveMap:ripples,emissiveIntensity:.3,transparent:true,opacity:.84,polygonOffset:true,polygonOffsetFactor:-1}));
 mesh.rotation.x=-Math.PI/2;mesh.position.set(o.x,o.water,o.z);mesh.name='oasis-water';world.add(mesh);
 return time=>ripples.offset.set(time*.00005,time*.00008);
}
export function buildDunesScene(scene){const b=kit(scene,'dunes'),{add,rod}=b,updateWater=buildOasis(b.world);
 for(const o of CHAPTER_PROPS.dunes){if(o.kind==='temple-wing')continue;const y=chapterHeight('dunes',o.x,o.z);if(o.kind==='sand-house'){add('box','stone',o.x,y+o.h/2,o.z,o.w,o.h,o.d);add('box','dark',o.x,y+3,o.z-o.d/2-.05,3,6,.1);add('cone','stone',o.x,y+o.h+2,o.z,o.w*.75,4,o.d*.75,0,Math.PI/4);for(let i=0;i<3;i++)add('box','dark',o.x-4+i*4,y+o.h*.7,o.z-o.d/2-.06,1.2,1.5,.08);add('cloth','cloth',o.x,y+4,o.z-o.d/2-3,o.w+1,.1,6,0,0,-.1)}else if(o.kind==='sun-obelisk'){add('box','stone',o.x,y+o.h/2,o.z,o.w,o.h,o.d);add('cone','metal',o.x,y+o.h+3,o.z,o.w*.6,6,o.d*.6);add('box','glow',o.x,y+o.h*.5,o.z-o.d/2-.1,.3,o.h*.7,.1)}else{for(let i=0;i<6;i++)add('rock','stone',o.x+Math.sin(i)*2,y+i*o.h/6,o.z,Math.max(2,o.w*.6-i*.7),o.h/6+2,Math.max(2,o.d*.6-i*.8),0,i,.06*i)}}
 // A stepped temple with an open axial nave, not a painted mountain corridor.
 for(const side of [-1,1])for(let i=0;i<7;i++)add('box','stone',side*(45-i*2),chapterHeight('dunes',side*(45-i*2),350)+i*2.5,350,30-i*2,5,90-i*8);for(let z=320;z<390;z+=14)for(const x of [-24,24]){const y=chapterHeight('dunes',x,z);add('cyl','stone',x,y+11,z,2,22,2);add('box','metal',x,y+22,z,7,1,7)}add('box','stone',0,34,390,65,7,7);
 for(let i=0;i<12;i++){const x=-20+(i%4)*15,z=145+Math.floor(i/4)*16;if(dunesOasisRadius(x,z)<1.55)continue;const y=chapterHeight('dunes',x,z);add('box','metal',x,y+.7,z,3,1.4,2);if(i%2)for(const s of [-1,1])rod([x+s*3,y,z],[x+s*3,y+4,z],.1);if(i%2)add('cloth','cloth',x,y+4,z,7,.05,5,0,0,.08)}
 for(let i=0;i<22;i++){const x=Math.sin(i*2.399)*120,z=30+i*16;if(chapterDistance('dunes',x,z)>1)continue;add('cone','accent',x,chapterHeight('dunes',x,z)+.6,z,.5,1.2,.5,0,i,.1)}
 const dial=new T.Group();dial.position.set(0,17,350);b.world.add(dial);for(let i=0;i<3;i++)add('ring','metal',0,3,0,8+i*2,8+i*2,8+i*2,0,i*.5,0,dial);add('crystal','glow',0,3,0,2,4,2,0,0,0,dial);let solved=false;
 return b.finish(t=>{updateWater(t);dial.rotation.y=t*.00006*(solved?.15:1)},s=>solved=!!s.solved);}
