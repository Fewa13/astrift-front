// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {DISTRICTS,EXIT_SPECS,districtAt} from './extraction-design.js?v=20261014-raid-1';
export const EXTRACTION_LIMIT=172;
export const EXTRACTION_SPAWN=[-154,146];
export const EXTRACTION_EXITS=EXIT_SPECS.map(e=>[e.x,e.z]);
export const EXTRACTION_AI_EXIT=[-146,154];
export const EXTRACTION_GUARDS=[[-88,80],[-32,136],[80,136],[136,24],[-144,-32],[-88,-88],[-32,-144],[24,-88],[80,-32],[136,-88],[80,-144],[24,24]];
export const EXTRACTION_HOUSES=[];
export const EXTRACTION_LOOT_POINTS=[];
for(let row=0;row<5;row++)for(let col=0;col<5;col++){
  const x=-116+col*56,z=-116+row*56;
  if(row===4&&col===0||row===0&&col===4)continue;
  EXTRACTION_HOUSES.push({x,z,w:22+(col%2)*4,d:21+(row%2)*3,color:(row+col)%3});
  EXTRACTION_LOOT_POINTS.push([x-3,z+7],[x+3,z+7],[x,z-4]);
}
EXTRACTION_LOOT_POINTS.push([-146,101],[-150,34],[-146,-32],[146,52],[145,-28],[35,147],[-33,146],[0,0]);
export function buildExtractionWorld(THREE){
  const group=new THREE.Group(),colliders=[],materials=new Map();
  const material=(c,lit=false)=>{const key=c+':'+lit;if(!materials.has(key))materials.set(key,lit?new THREE.MeshBasicMaterial({color:c}):new THREE.MeshStandardMaterial({color:c,roughness:.82,metalness:.13}));return materials.get(key)};
  function box(x,y,z,w,h,d,c,solid=true,lit=false){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(c,lit));m.position.set(x,y,z);m.receiveShadow=true;if(solid){m.userData.bounds={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,maxY:y+h/2,minY:y-h/2};colliders.push(m)}group.add(m);return m}
  const terrain=box(0,-.2,0,350,.35,350,0x253541,false);colliders.push(terrain);
  for(let i=-144;i<=144;i+=56){box(i,.006,0,12,.035,340,0x101923,false);box(0,.008,i,340,.035,12,0x101923,false);for(let s=-160;s<160;s+=14){box(i,.03,s,.16,.025,5,0x587274,false);box(s,.03,i,5,.025,.16,0x587274,false)}}
  for(let i=-144;i<=144;i+=56)for(const side of [-1,1]){box(i+side*9,.025,0,5,.05,340,0x354652,false);box(0,.027,i+side*9,340,.05,5,0x354652,false);box(i+side*6.5,.08,0,.18,.16,340,0x829096,false);box(0,.082,i+side*6.5,340,.16,.18,0x829096,false)}
  for(const h of EXTRACTION_HOUSES){const {x,z,w,d,color}=h,zone=districtAt(x,z),c=zone.color,n=zone.id==='lab'?0xa9a0ff:zone.id==='works'?0xffbd60:zone.id==='depot'?0x7adeac:0x6bd5df,height=zone.id==='depot'?7:zone.id==='lab'?6:4.8;
    box(x-w/2,height/2,z,.65,height,d,c);box(x+w/2,height/2,z,.65,height,d,c);
    // Two real doorways per building; exits and loot routes never depend on fake windows.
    const rear=(w-4)/2;box(x-(rear+4)/2,height/2,z-d/2,rear,height,.65,c);box(x+(rear+4)/2,height/2,z-d/2,rear,height,.65,c);box(x,height-.65,z-d/2,4,1.3,.65,c);
    const side=(w-4)/2;box(x-(side+4)/2,height/2,z+d/2,side,height,.65,c);box(x+(side+4)/2,height/2,z+d/2,side,height,.65,c);box(x,height-.7,z+d/2,4,1.4,.65,c);
    box(x,height+.18,z,w+1,.36,d+1,0x233643);box(x,height-.2,z+d/2+.36,w,.13,.12,n,false,true);box(x,2.8,z+d/2+.5,3.8,.55,.15,n,false,true);
    for(const side of [-1,1]){box(x+side*2.12,1.65,z+d/2+.4,.18,3.3,.22,0x1a2834,false);box(x+side*2.12,1.65,z-d/2-.4,.18,3.3,.22,0x1a2834,false)}
    for(let k=-1;k<=1;k++){box(x-w/2-.37,1.7,z+k*5,.08,.08,4,0x203441,false);box(x+w/2+.37,1.7,z+k*5,.08,.08,4,0x203441,false)}
    for(const side of [-1,1]){box(x+side*(w/2+.37),height/2,z-d/2+.4,.12,height,.2,0x263c4a,false);box(x+side*(w/2+.37),height/2,z+d/2-.4,.12,height,.2,0x263c4a,false)}
    for(const side of [-1,1]){const front=z+d/2+.37,center=x+side*(w/4+1);box(center,2.5,front,w/2-4,1.3,.12,0x1a303d,false);box(center,2.5,front+.075,w/2-4.3,1.05,.05,zone.id==='homes'?0x77a7b5:0x587e93,false);box(center,2.5,front+.12,.1,1.3,.06,0x233b4a,false);box(center,1.8,front+.17,w/2-3.6,.15,.5,0x253b47,false)}
    box(x-5,.65,z-3,4,1.3,1.6,0x40576a);box(x+5,1,z-5,4,2,1,0x40576a);box(x+3,.65,z+4,3,1.3,2,0x554b3d);
    box(x-4,1.4,z-d/2+.37,3,.85,.08,0x4a8d9d,false,true);box(x+4,1.4,z-d/2+.37,3,.85,.08,0x4a8d9d,false,true);
    box(x,height-.5,z+d/2+1.5,w*.6,.16,3.2,0x273d51,false);for(const side of [-1,1])box(x+side*(w*.3),1.7,z+d/2+2.8,.16,3.4,.16,0x456b75);
    for(const side of [-1,1])for(const offset of [-5,3]){box(x+side*(w/2+.37),2.4,z+offset,.08,1.5,3.4,0x82b4c0,false);box(x+side*(w/2+.43),2.4,z+offset,.1,1.6,.09,0x152636,false)}
    box(x+4,height+.7,z-2,5,.7,5,0x2a4154);for(let k=0;k<4;k++)box(x-6+k*1.3,height+.45,z-4,1,.12,5,0x24466f,false);
    box(x,.018,z,w-.6,.035,d-.6,zone.id==='lab'?0x526375:0x38464f,false);
    for(const edge of [-1,1]){box(x+edge*(w/2-.08),.35,z,.16,.7,d,0x1e2b36,false);box(x+edge*(w/2+.45),height/2,z-d/2+.5,.4,height,.4,0x233744)}
    if(zone.id==='works'){
      for(let k=0;k<3;k++){box(x-7+k*5,1.1,z-6,3.4,2.2,1.1,0x39404b);box(x-7+k*5,1.7,z-5.35,2.9,.08,.2,0xe7ad54,false)}
      box(x,1.1,z+1,5,2.2,2.5,0x775b36);box(x,1.8,z+1,4.7,.18,2.7,0xa68453,false);
      box(x-6,height+1.8,z-2,2,3.2,2,0x3c454e);box(x-6,height+3.5,z-2,2.6,.25,2.6,0x202c35,false);
    }else if(zone.id==='depot'){
      for(const side of [-1,1])for(let k=0;k<3;k++){box(x+side*7,1.2+k*1.3,z-5,3.4,.12,5,0x7a8e8a);box(x+side*7,.8+k*1.3,z-5,2.6,.9,3.8,k%2?0x657863:0x92754f)}
      for(let k=0;k<3;k++)box(x-5+k*4,.35,z+d/2+5,3,.7,2.5,0x685841);
    }else if(zone.id==='lab'){
      for(const side of [-1,1]){box(x+side*7,1.1,z-6,3,2.2,2,0x778da1);box(x+side*7,1.8,z-4.94,2.5,.65,.06,0x91dce6,false,true)}
      box(x-6,.6,z+2,3,1.2,4,0x7b8e9e);box(x-6,1.23,z+2,3.1,.1,4.1,0xacc3ce,false);box(x,height+.9,z-5,7,1.3,6,0x6b7894);
    }else{
      box(x-6,.45,z-5,4,.9,2,0x6a6257);box(x+6,.8,z,3,1.6,1.2,0x53686c);box(x+6,1.95,z,3.2,.7,1.3,0x34585e);
      for(let k=0;k<3;k++){box(x-7+k*6,.7,z+d/2+4,2.2,1.4,1.4,0x4c6355);box(x-7+k*6,1.6,z+d/2+4,2,.4,1.2,0x699070,false)}
    }
  }
  for(let i=0;i<48;i++){const x=-140+(i%8)*39,z=-138+Math.floor(i/8)*53;if(EXTRACTION_HOUSES.some(h=>Math.abs(h.x-x)<h.w/2+2&&Math.abs(h.z-z)<h.d/2+2))continue;box(x,.75,z,3.8,1.5,2.2,0x455164);box(x+1.8,1.7,z,.35,3.4,.35,0x577482)}
  box(-157,2.2,133,19,4.4,.8,0x36536b);box(-142,2.2,148,.8,4.4,21,0x36536b);
  // Staggered street furniture breaks cross-map firing lanes without sealing roads.
  for(const z of [-60,-4,52,108])for(const x of [-88,24,136]){box(x-3,1.05,z,4.8,2.1,2.3,0x3b5661);box(x-3,2.2,z,3,.2,1.8,0x6e939d,false);box(x-3,2.45,z,2.7,.45,1.9,0x293e4a,false);for(const side of [-1,1]){box(x-3,1.7,z+side*1.17,2.8,.6,.06,0x89b4c0,false);for(const offset of [-1.5,1.5])box(x-3+offset,.4,z+side*1.22,.9,.8,.25,0x18232b,false)}box(x-.55,1.2,z,.05,.22,1.8,0xd0d5bd,false);box(x-5.45,1.2,z,.05,.22,1.8,0xb25d56,false);box(x+4,.6,z+10,3,1.2,1.3,0x7e8576);for(let k=0;k<4;k++)box(x+3+k*.7,1.22,z+10,.35,.04,1.35,k%2?0x253945:0xc8af6f,false)}
  for(const exit of EXIT_SPECS){box(exit.x-4,1.2,exit.z,1.2,2.4,3,0x405e62);box(exit.x+4,1.2,exit.z,1.2,2.4,3,0x405e62);box(exit.x,4,exit.z,9,.4,.6,exit.signal?0xe5a658:0x7affd9,false,true)}
  for(const d of DISTRICTS){const gx=d.x<0?-88:80,gz=d.z<0?-32:80;box(gx-8,2.8,gz,.5,5.6,.5,0x334b59);box(gx+8,2.8,gz,.5,5.6,.5,0x334b59);box(gx,5.7,gz,16.6,1.2,.6,d.color,false);box(gx,5.05,gz,16,.08,.7,d.color,false,true);
    if(typeof document!=='undefined'){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#15232d';ctx.fillRect(0,0,1024,128);ctx.fillStyle='#e5f7ff';ctx.font='600 40px system-ui';ctx.textAlign='center';ctx.fillText(d.en.toUpperCase()+' / '+d.name,512,80);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Mesh(new THREE.PlaneGeometry(15.8,1.05),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));sign.position.set(gx,5.7,gz+.32);group.add(sign)}
  }
  for(const edge of [-174,174]){box(edge,3,0,1,6,350,0x223b4a);box(0,3,edge,350,6,1,0x223b4a)}
  group.visible=false;return {group,colliders};
}
