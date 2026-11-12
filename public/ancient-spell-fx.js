// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {remoteSpellPolicy} from './ancient-control-feel.js';
import {EXPANSION_FX,buildExpansionSpell} from './ancient-expansion-fx.js?v=20261014-new-professions-1';
import * as THREE from './three.module.js';
import {buildHolySpell} from './ancient-holy-spells.js?v=20261014-new-professions-1';
// Reuse geometry, not spell designs. Every skill has its own composition.
const G={ring:new THREE.TorusGeometry(1,.035,5,48),arc:new THREE.TorusGeometry(1,.075,5,40,Math.PI*1.35),crystal:new THREE.OctahedronGeometry(1,0),orb:new THREE.IcosahedronGeometry(1,2),bar:new THREE.BoxGeometry(1,1,1),beam:new THREE.CylinderGeometry(1,1,1,5),cone:new THREE.ConeGeometry(1,1,6)};
const flame=new THREE.SphereGeometry(1,9,8);
const flameVertices=flame.attributes.position;
for(let i=0;i<flameVertices.count;i++){
 const y=(flameVertices.getY(i)+1)/2,taper=1-.83*y;
 flameVertices.setXYZ(i,flameVertices.getX(i)*taper+.38*y*y,y,flameVertices.getZ(i)*taper);
}
flame.computeVertexNormals();G.flame=flame;
const meteorRock=new THREE.IcosahedronGeometry(1,2),rockVertices=meteorRock.attributes.position,rockColors=[];
const basalt=new THREE.Color(0x3f221e),lava=new THREE.Color(0xff711b);
for(let i=0;i<rockVertices.count;i++){
 const x=rockVertices.getX(i),y=rockVertices.getY(i),z=rockVertices.getZ(i);
 const scale=1+.13*Math.sin(x*9+y*4)*Math.cos(z*8-y*5);
 rockVertices.setXYZ(i,x*scale,y*scale,z*scale);
 const vein=Math.abs(Math.sin(x*7+y*8+Math.sin(z*7)*1.6));
 const color=basalt.clone().lerp(lava,Math.max(0,1-vein*6)**2);
 rockColors.push(color.r,color.g,color.b);
}
meteorRock.setAttribute('color',new THREE.Float32BufferAttribute(rockColors,3));
meteorRock.computeVertexNormals();G.meteor=meteorRock;
const meteorMaterial=new THREE.MeshBasicMaterial({vertexColors:true});
const TAU=Math.PI*2,ease=t=>1-(1-Math.max(0,Math.min(1,t)))**3;
const spells={...EXPANSION_FX,frostburst:[0x88ddff,1.8],swordwave:[0x68ff9b,.8],triplecut:[0x22ed70,1.1],swordrain:[0x83ffb2,3.4],phantomblade:[0x4bff88,3.6],vitality:[0x58ee92,2.8],power:[0xffc342,1.3],rage:[0xff4825,1.6],slash:[0xffdda0,.65],summon:[0x38ffb8,2],weaken:[0xaaff42,1.4],transform:[0xff9e36,2.1],soulbolt:[0x29f2d4,.85],icebolt:[0x65ddff,1],icearmor:[0x94eaff,1.8],blizzard:[0x86bbff,6],chain:[0xffe568,.65],haste:[0x55aaff,1.4],storm:[0xb6a4ff,4],hex:[0xb94aff,1.6],drain:[0xff387a,1.25],doom:[0x9c37ff,8],mark:[0xffd367,.8],claw:[0xffb767,.4],petHit:[0x58ffcf,.45]};
export const ANCIENT_FX_IDS=Object.keys(spells);
export function createAncientMagicFX(scene,resolveOwner,camera=null){
 const effects=[],dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),dir=new THREE.Vector3();
 const viewDirection=new THREE.Vector3(),viewDelta=new THREE.Vector3();
 function animateVisibleEffect(f,t){
  if(camera){
   camera.getWorldDirection(viewDirection);viewDelta.copy(f.group.position).sub(camera.position);
   // A generous bound includes sky bolts, sword projections and source-to-target beams.
   const bound=Math.max(35,f.r*3,f.source.length()+12,...f.nodes.map(n=>n.length()+12));
   const distance=viewDelta.length(),visible=distance<190+bound&&viewDelta.dot(viewDirection)>-bound;
   f.group.visible=visible;if(!visible)return;
   // Position sync is untouched; only distant spell decoration updates less often.
   const interval=remoteSpellPolicy({local:f.local,distance,pressure:camera.userData.renderPressure}).interval;
   if(f.lastVisual!==undefined&&t-f.lastVisual<interval)return;f.lastVisual=t;
  }
  updateEffect(f,t);
 }
 function mesh(f,geo,pos,scale,rot=[0,0,0],motion='still',soft=false){const m=new THREE.Mesh(G[geo],soft?f.soft:f.core);m.position.fromArray(pos);m.scale.fromArray(scale);m.rotation.fromArray(rot);m.userData={motion,pos,scale,rot};f.group.add(m);return m}
 function ring(f,r,y,motion='spin',soft=false){return mesh(f,'ring',[0,y,0],[r,r,r],[-Math.PI/2,0,0],motion,soft)}
 function batch(f,geo,count,pose,soft=false){const original=count;count=geo==='beam'?count:Math.max(1,Math.ceil(count*(f.particles??1)));const sample=pose;pose=(i,t)=>sample(Math.min(original-1,Math.floor(i*original/count)),t);const m=new THREE.InstancedMesh(G[geo],geo==='meteor'?meteorMaterial:soft?f.soft:f.core,count);m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;f.group.add(m);f.batches.push({m,pose});return m}
 function set(x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz)}
 function beam(ax,ay,az,bx,by,bz,width){dummy.position.set((ax+bx)/2,(ay+by)/2,(az+bz)/2);dir.set(bx-ax,by-ay,bz-az);dummy.scale.set(width,dir.length(),width);dummy.quaternion.setFromUnitVectors(up,dir.normalize())}
 function burst(f,n,speed){n=Math.min(96,Math.ceil(n*Math.sqrt(Math.max(1,f.r/5))));speed=Math.max(speed,Math.min(24,f.r*.8));batch(f,'crystal',n,(i,t)=>{const a=i/n*TAU,r=ease(t*3)*speed*(.5+i%4*.15);set(Math.cos(a)*r,.7+Math.sin(i*2)*r*.4,Math.sin(a)*r,.04,.15,.04,t*5,a)})}
 function missile(f,ice){mesh(f,ice?'crystal':'orb',[0,1.2,0],ice?[.22,.75,.22]:[.25,.25,.25],[0,0,Math.PI/2],'missile');batch(f,ice?'crystal':'orb',12,(i,t)=>{const p=ease(t/.22-i*.025),s=Math.max(.015,(1-i/14)*.08);set(f.source.x*(1-p),1.2+(f.source.y-1.2)*(1-p),f.source.z*(1-p),s,ice?s*2:s,s,0,t*5)},true);burst(f,ice?22:16,ice?2:1.5)}
 function swords(f,count,position){for(const [geo,offset,scale]of [['bar',0,[.12,1.3,.05]],['cone',-.78,[.15,.3,.06]],['bar',.7,[.5,.08,.09]],['bar',.95,[.08,.4,.08]]])batch(f,geo,count,(i,t)=>{const p=position(i,t);set(p[0],p[1]+offset*p[3],p[2],scale[0]*p[3],scale[1]*p[3],scale[2]*p[3],Math.PI,0,p[4]||0)})}
 function build(f){const r=f.r;
  switch(f.id){
   case 'frostburst':missile(f,true);batch(f,'crystal',12,(i,t)=>{const u=Math.max(0,t-.2),a=i/12*TAU,s=Math.max(0,1-u),rr=f.r*ease(u*6);set(Math.cos(a)*rr,.6+Math.sin(u*5)*.5,Math.sin(a)*rr,.12*s,.5*s,.12*s,u*4,a)});ring(f,r,.12,'shock');break;
   case 'swordwave':
    mesh(f,'arc',[0,1.2,0],[r*.9,r*.9,.6],[0,0,-.6],'swordWave');burst(f,18,r);break;
   case 'triplecut':
    for(let i=0;i<3;i++){const m=mesh(f,'arc',[0,1.3,i*.1],[2.8-i*.4,2.8-i*.4,.6],[i%2?.7:-.4,0,i%2?1.1:-.8],'tripleSlash');m.userData.delay=i*.3}burst(f,20,2);break;
   case 'swordrain':
    const count=Math.min(64,Math.ceil(18*Math.sqrt(Math.max(1,r/3))));swords(f,count,(i,t)=>{const a=i*2.399,rr=f.r*.8*Math.sqrt((i+.5)/count),phase=(t+i%3*.12)% .5;return [Math.cos(a)*rr,9-phase*18,Math.sin(a)*rr,1.2,0]});ring(f,r,.08,'pulse');ring(f,r*.83,.12,'counter',true);break;
   case 'phantomblade':
    // Four instanced components form an actual blade, tip, guard and grip.
    for(const [geo,offset,scale]of [['bar',0,[.65,10,.22]],['cone',-6,[.8,2,.24]],['bar',5,[4,.35,.6]],['bar',6.5,[.45,2.6,.45]]])batch(f,geo,1,(i,t)=>{const size=1+Math.log2(Math.max(1,f.r/5))*.48,angle=-1.15+ease(Math.max(0,t-.32)/.23)*2.25,y=offset*size,s=size*ease(t*7)*Math.max(0,1-Math.max(0,t-1.5)/1.4);set(-Math.sin(angle)*y,7*size+Math.cos(angle)*y,0,scale[0]*s,scale[1]*s,scale[2]*s,0,0,angle)});
    batch(f,'beam',18,(i,t)=>{const a=i/18*TAU,u=Math.max(0,t-.5),rr=ease(u*4)*f.r*1.5,w=t>=.5?.055*Math.max(0,1-u/2.5):0;beam(Math.cos(a)*rr*.25,.12,Math.sin(a)*rr*.25,Math.cos(a)*rr,.12,Math.sin(a)*rr,w)});
    batch(f,'ring',2,(i,t)=>{const u=t-.5-i*.12,s=u>=0&&u<1.5?ease(u*5)*(f.r+i)*Math.max(0,1-u/1.5):0;set(0,.12+i*.08,0,s,s,s,Math.PI/2)});
    mesh(f,'arc',[0,2,0],[7,7,.7],[0,0,-1.2],'greatCut',true);burst(f,30,5);break;
   case 'vitality':
    batch(f,'bar',24,(i,t)=>{const j=Math.floor(i/2),a=j/12*TAU+t*.9,h=(j/12+t*.45)%1;set(Math.cos(a)*1.1,h*3,Math.sin(a)*1.1,i%2?.25:.07,i%2?.07:.25,.06,0,-a)});
    batch(f,'orb',16,(i,t)=>{const a=i/16*TAU+t*1.8;set(Math.cos(a),.3+i*.12,Math.sin(a),.06,.06,.06)},true);break;
   case 'power':
    batch(f,'bar',12,(i,t)=>{const j=Math.floor(i/3),piece=i%3,a=j*TAU/4,rr=.7+ease(t*2)*r*.7;set(Math.cos(a)*rr,piece===0?1.6:piece===1?.8:.5,Math.sin(a)*rr,piece===1?.6:.12,piece===0?1.3:.15,.12,0,-a,t*.12)});
    ring(f,r,.12,'shock');burst(f,24,r*.7);break;
   case 'rage':
    batch(f,'cone',20,(i,t)=>{const a=i/20*TAU,rr=.6+ease(t*3)*r*.65;set(Math.cos(a)*rr,.4+Math.sin(t*11+i)*.25,Math.sin(a)*rr,.16,.7+.35*Math.sin(i*3+t*7),.16,.35*Math.cos(a),0,.35*Math.sin(a))});
    mesh(f,'orb',[0,.6,0],[1,.6,1],[0,0,0],'detonate',true);ring(f,r,.05,'shock');break;
   case 'slash':
    mesh(f,'arc',[0,1.2,0],[r*.65,r*.65,.6],[.5,0,-.6],'cut');mesh(f,'arc',[0,1.2,.15],[r*.5,r*.5,.5],[-.6,0,1.2],'cutReverse',true);
    mesh(f,'bar',[0,1.2,0],[r*1.6,.06,.06],[0,0,-.45],'flash');burst(f,18,r*.55);break;
   case 'summon':
    mesh(f,'ring',[0,1.8,0],[1.45,1.8,1],[0,0,0],'gate');
    batch(f,'bar',12,(i,t)=>{const a=i/12*TAU;set(Math.cos(a)*1.7,1.8+Math.sin(a)*2,0,.16,.35,.15,0,0,a+t*.2)});
    batch(f,'beam',6,(i,t)=>{const a=i/6*TAU;beam(Math.cos(a),.1,Math.sin(a),Math.cos(a),3*ease(t*4),Math.sin(a),.04)});ring(f,2,.08,'shock',true);break;
   case 'weaken':
    for(let i=0;i<3;i++)mesh(f,'ring',[0,.65+i*.55,0],[1,1,1],[.35,0,i*.8],'bind');
    batch(f,'cone',8,(i,t)=>{const a=i/8*TAU;set(Math.cos(a)*1.3,2.8-ease(t*2)*1.5,Math.sin(a)*1.3,.12,.4,.12,Math.PI)});break;
   case 'transform':
    for(const side of [-1,1]){mesh(f,'cone',[side*.55,2.7,0],[.28,.9,.28],[0,0,side*-.5],'rise');mesh(f,'bar',[side*.5,1.9,-.2],[.6,.15,.2],[0,0,side*.2],'flash')}
    mesh(f,'cone',[0,1.3,.2],[.7,.7,.6],[Math.PI,0,0],'rise',true);
    batch(f,'crystal',14,(i,t)=>{const a=i/14*TAU,rr=.5+ease(t*2)*2;set(Math.cos(a)*rr,1.4+Math.sin(i*3)*.7,Math.sin(a)*rr,.18,.5,.14,t*.5,a)});break;
   case 'soulbolt':missile(f,false);mesh(f,'ring',[0,1.2,0],[.8,.8,.8],[0,0,0],'impact');break;
   case 'icebolt':missile(f,true);batch(f,'cone',7,(i,t)=>{const a=i/7*TAU;set(Math.cos(a)*.65,.3,Math.sin(a)*.65,.15,.8*ease(t*5),.15,.3*Math.cos(a),a,.3*Math.sin(a))});break;
   case 'icearmor':
    batch(f,'crystal',18,(i,t)=>{const a=i/6*TAU,h=Math.floor(i/6),rr=1.3+ease(t*2)*.5;set(Math.cos(a)*rr,.4+h*.75,Math.sin(a)*rr,.35,.6,.18,0,a,.2*Math.sin(t*4+i))});
    ring(f,r,.06,'shock');mesh(f,'orb',[0,1,0],[1.6,1.6,1.6],[0,0,0],'shield',true);break;
   case 'blizzard':
    batch(f,'crystal',36,(i,t)=>{const a=i*2.399+t*.6,rr=r*Math.sqrt((i+.5)/36),h=5-(t*2.4+i*.41)%5;set(Math.cos(a)*rr,h,Math.sin(a)*rr,.08,.22,.08,.3,a)});
    for(let i=0;i<2;i++)mesh(f,'arc',[0,1+i*1.3,0],[r*.75,r*.75,.5],[-Math.PI/2,.2,0],'snow',true);
    batch(f,'cone',12,(i,t)=>{const a=i/12*TAU;set(Math.cos(a)*r*.8,.12,Math.sin(a)*r*.8,.15,.6,.15,0,a)});break;
   case 'chain':
    // One pooled composition per cast, including every hop. No owner-to-all beams.
    batch(f,'beam',f.links.length*10,(i,t)=>{const hop=Math.floor(i/10),j=i%10,local=t-hop*.13,from=hop?f.nodes[hop-1]:f.source,to=f.nodes[hop];if(local<0||local>.55){set(0,0,0,0,0,0);return}const reach=Math.min(1,local/.1),p=Math.min(j/10,reach),q=Math.min((j+1)/10,reach),n=Math.floor(local*22),jitter=k=>k===0||k===10?0:Math.sin(k*4+hop*2+n)*.28;beam(from.x+(to.x-from.x)*p+jitter(j),from.y+(to.y-from.y)*p,from.z+(to.z-from.z)*p,from.x+(to.x-from.x)*q+jitter(j+1),from.y+(to.y-from.y)*q,from.z+(to.z-from.z)*q,.06*Math.min(1,(.55-local)*5))});
    batch(f,'beam',f.links.length*18,(i,t)=>{const hop=Math.floor(i/18),j=i%3,a=Math.floor(i%18/3)/6*TAU,local=t-hop*.13-.1,node=f.nodes[hop];if(local<0||local>.4){set(0,0,0,0,0,0);return}const growth=ease(local*8),rr=(.12+j*.32)*growth;beam(node.x+Math.cos(a)*rr,node.y+Math.sin(j*4+local*25)*.12,node.z+Math.sin(a)*rr,node.x+Math.cos(a)*(rr+.32*growth),node.y+Math.sin((j+1)*4+local*25)*.12,node.z+Math.sin(a)*(rr+.32*growth),.03*(1-local/.4))},true);
    batch(f,'orb',f.links.length,(i,t)=>{const local=t-i*.13-.1,node=f.nodes[i],s=local>=0&&local<.3?.22*(1-local/.3):0;set(node.x,node.y,node.z,s,s,s)});break;
   case 'haste':
    batch(f,'bar',16,(i,t)=>{const a=Math.floor(i/2)/8*TAU+t*2;set(Math.cos(a)*1.35,.35+i%4*.3,Math.sin(a)*1.35,.07,.55,.07,0,-a,i%2?.65:-.65)});
    ring(f,1.6,.25,'spin');ring(f,1.3,.7,'counter',true);burst(f,12,r*.6);break;
   case 'storm':
    ring(f,r*.75,5,'counter',true);batch(f,'beam',50,(i,t)=>{const j=i%10,a=Math.floor(i/10)/5*TAU,bx=Math.cos(a)*r*.55,bz=Math.sin(a)*r*.55,n=Math.floor(t*16)*.9;beam(bx+Math.sin(j*4+n)*.3,5-j*.5,bz+Math.cos(j*3+n)*.2,bx+Math.sin((j+1)*4+n)*.3,5-(j+1)*.5,bz+Math.cos((j+1)*3+n)*.2,.04)});
    batch(f,'orb',12,(i,t)=>{const a=i/12*TAU+t*.3;set(Math.cos(a)*r*.65,5+Math.sin(i+t)*.2,Math.sin(a)*r*.65,.5,.15,.5)},true);ring(f,r,.05,'pulse');break;
   case 'hex':
    batch(f,'bar',6,(i,t)=>{const a=i/6*TAU;set(Math.cos(a)*.9,1.6+Math.sin(a)*.9,0,.07,1,.07,0,0,a+Math.PI/6)});
    mesh(f,'cone',[0,2.2,0],[.22,1.6,.22],[Math.PI,0,0],'curseDrop');mesh(f,'ring',[0,1.6,0],[1.15,1.15,1.15],[0,0,0],'counter',true);break;
   case 'drain':
    batch(f,'orb',24,(i,t)=>{const p=(t*.9+i/24)%1,a=i*2.4;set(f.source.x*p+Math.sin(a)*Math.sin(p*Math.PI)*.7,1.2+(f.source.y-1.2)*p+Math.sin(p*Math.PI)*.8,f.source.z*p+Math.cos(a)*Math.sin(p*Math.PI)*.7,.065,.065,.065)});
    mesh(f,'arc',[0,1.1,0],[.9,.9,.9],[0,0,.5],'spin');break;
   case 'doom':{
    const eclipse=new THREE.Mesh(G.orb,f.dark);eclipse.position.y=2.2;eclipse.scale.setScalar(.9);f.group.add(eclipse);
    mesh(f,'ring',[0,2.2,0],[1.1,1.1,1.1],[.25,0,0],'counter');
    batch(f,'bar',32,(i,t)=>{const a=i/32*TAU-t*.7;set(Math.cos(a)*r*.65,2.2+Math.sin(a*2+t)*.5,Math.sin(a)*r*.65,.16,.1,.1,0,-a)});
    batch(f,'orb',24,(i,t)=>{const a=i*2.4+t*1.4,rr=r*(1-(t*.18+i/24)%1);set(Math.cos(a)*rr,.4+(1-rr/r)*1.8,Math.sin(a)*rr,.07,.07,.07)},true);break;}
   case 'mark':batch(f,'bar',8,(i,t)=>{const a=Math.floor(i/2)/4*TAU+.785,rr=1.15-ease(t*3)*.35;set(Math.cos(a)*rr,1.4+Math.sin(a)*rr,0,i%2?.35:.06,i%2?.06:.35,.06)});break;
   case 'claw':for(let i=0;i<3;i++)mesh(f,'arc',[(i-1)*.3,1.3,-.5],[.7,.9,.6],[0,.3,-.8],'cut');break;
   case 'petHit':ring(f,1,.08,'shock');burst(f,10,1.1);mesh(f,'cone',[0,.3,0],[.3,.7,.3],[0,0,0],'flash');break;
  }
 }
 function flourish(f){
  if(['claw','petHit','mark'].includes(f.id))return;
  const r=f.r,n=f.detail,seed=ANCIENT_FX_IDS.indexOf(f.id),warrior=['slash','power','rage','vitality'].includes(f.id),summoner=['summon','weaken','transform','soulbolt'].includes(f.id),ice=['icebolt','icearmor','blizzard'].includes(f.id),thunder=['chain','haste','storm'].includes(f.id),curse=['hex','drain','doom'].includes(f.id);
  if(warrior){
   // Jagged ground fractures, followed by solid stone chips rather than a white flash.
   batch(f,'bar',n,(i,t)=>{const a=i/n*TAU,rr=r*(.18+.72*ease(t*4)),s=Math.max(.01,1-t/f.duration);set(Math.cos(a)*rr,.06,Math.sin(a)*rr,.045,r*.32*s,.025,Math.PI/2,0,-a)});
   batch(f,'crystal',n,(i,t)=>{const a=i*2.399,flight=Math.min(1,t/1.1),rr=r*(.2+flight*.55),h=Math.max(0,Math.sin(flight*Math.PI)*(.7+i%3*.3));set(Math.cos(a)*rr,.12+h,Math.sin(a)*rr,.1*(1-flight),.23*(1-flight),.1*(1-flight),t*4,a)},true);
  }else if(summoner){
   ring(f,Math.min(r,2.4),.05,'counter',true);ring(f,Math.min(r*.75,1.9),.09,'spin');
   batch(f,'bar',n,(i,t)=>{const a=i/n*TAU+t*.22,rr=Math.min(r,2.4),h=f.id==='summon'?ease(t*3)*2.8:.12+Math.sin(t*3+i)*.06;set(Math.cos(a)*rr,h,Math.sin(a)*rr,.07,.32,.07,0,-a,Math.PI/4)});
   batch(f,'beam',n,(i,t)=>{const a=i/n*TAU+t*2,h=(t*.8+i/n)%1*3,rr=.7+.25*Math.sin(h*3+seed);beam(Math.cos(a)*rr,h,Math.sin(a)*rr,Math.cos(a+.32)*rr,h+.25,Math.sin(a+.32)*rr,.025)},true);
  }else if(ice){
   batch(f,'crystal',n,(i,t)=>{const a=i*2.399,rr=r*(.3+.65*(i+1)/n),h=(.8+i%4*.32)*ease(t*4)*Math.min(1,(1-t/f.duration)*4);set(Math.cos(a)*rr,h*.45,Math.sin(a)*rr,.14,h,.14,.12*Math.cos(a),a,.12*Math.sin(a))});
   batch(f,'crystal',n*2,(i,t)=>{const a=i*2.399+t*(f.id==='blizzard'?1.4:.7),rr=r*Math.sqrt((i+.5)/(n*2)),h=3.5-(t*1.5+i*.3)%3.5;set(Math.cos(a)*rr,h,Math.sin(a)*rr,.025,.08,.025,t*2,a)},true);
  }else if(thunder){
   // Secondary forked bolts use instancing and never add dynamic scene lights.
   batch(f,'beam',n*2,(i,t)=>{const a=Math.floor(i/2)/n*TAU,beat=Math.floor(t*18),rr=r*(.2+.6*((i%5+1)/5)),h=f.id==='storm'?3.8-i%2*1.7:.5;const on=Math.sin(beat*3+i*2)>.15;beam(Math.cos(a)*rr,h,Math.sin(a)*rr,Math.cos(a+.18)*(rr+.4),h-.4,Math.sin(a+.18)*(rr+.4),on?.04:0)},true);
   if(f.id!=='chain')ring(f,r,.09,'pulse',true);
  }else if(curse){
   batch(f,'beam',n*2,(i,t)=>{const a=Math.floor(i/2)/n*TAU+t*.5,h=i%2*.55,rr=r*(.3+.55*ease(t*2));beam(Math.cos(a)*rr,h+.1,Math.sin(a)*rr,Math.cos(a+.3)*rr,h+.5+Math.sin(t*4+i)*.18,Math.sin(a+.3)*rr,.035)},true);
   batch(f,'bar',n,(i,t)=>{const a=i/n*TAU-t*.2;set(Math.cos(a)*r*.88,.08,Math.sin(a)*r*.88,.055,.35,.04,Math.PI/2,0,-a+Math.PI/4)});
  }else{
   // Swordmaster: layered luminous edges and a rotating emerald inscription.
   ring(f,r,.06,'counter',true);
   batch(f,'bar',n,(i,t)=>{const a=i/n*TAU+t*.25;set(Math.cos(a)*r*.9,.09,Math.sin(a)*r*.9,.035,.35,.025,Math.PI/2,0,-a)});
   burst(f,n,r*.8);
  }
 }
 function holyFlourish(f){buildHolySpell(f,{mesh,ring,batch,set,beam,swords})}
 function fireSea(f,start,end){
  const r=f.r,segments=Math.min(48,Math.max(12,Math.ceil(r*2)));
  const geometry=new THREE.PlaneGeometry(r*2,r*2,segments,segments).rotateX(-Math.PI/2);
  const positions=geometry.attributes.position;
  for(let i=0;i<positions.count;i++){
   const x=positions.getX(i),z=positions.getZ(i);
   positions.setY(i,f.ground(f.group.position.x+x,f.group.position.z+z)-f.group.position.y+.14);
  }
  const material=new THREE.ShaderMaterial({
   transparent:true,depthWrite:false,side:THREE.DoubleSide,
   uniforms:{age:{value:0},strength:{value:0},radius:{value:r},holy:{value:f.holy?1:0},pattern:{value:f.id==='firewave'?0:f.id==='firestorm'?1:2}},
   vertexShader:`
    varying vec2 groundUV;
    void main(){groundUV=uv*2.0-1.0;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}
   `,
   fragmentShader:`
    uniform float age,strength,radius,holy,pattern;
    varying vec2 groundUV;
    void main(){
     float dist=length(groundUV);
     float edge=1.0-smoothstep(.88,1.0,dist);
     if(edge<=0.0)discard;
     vec2 p=groundUV*radius;
     float angle=atan(p.y,p.x+.0001);
     float grain=sin(p.x*4.1+sin(p.y*3.2+age*2.4))*sin(p.y*3.6-age*2.8);
     float shape;
     if(pattern<.5){
      float wave=length(p)*2.8-age*5.0+.85*sin(angle*5.0+dist*7.0)+.64*grain;
      shape=.55+.31*sin(wave)+.14*grain;
     }else if(pattern<1.5){
      float spiral=angle*3.0-length(p)*1.9+age*3.0;
      shape=.52+.36*sin(spiral)+.12*grain;
     }else{
      float fissure=sin(angle*7.0+.8*sin(length(p)*2.0));
      float impact=sin(length(p)*3.1-age*4.4);
      shape=.48+.27*impact+.17*fissure+.08*grain;
     }
     float flame=smoothstep(.22,.85,shape);
     float front=1.0-smoothstep(max(0.0,age*2.9-.1),age*2.9+.1,dist);
     vec3 color=mix(vec3(.58,.044,.008),vec3(1.0,.46,.095),flame);
     float opacity=(.12+.75*pow(flame,1.5))*edge*front;
     if(holy>.5){
      float crack=1.0-smoothstep(.03,.17,abs(sin(p.x*1.55+sin(p.y*1.8)*1.35)+.44*sin(p.y*2.5)));
      float molten=max(crack*.88,flame*.7);
      color=mix(vec3(.16,.018,.009),vec3(1.0,.49,.065),molten);
      color=mix(color,vec3(1.0,.82,.38),pow(flame,5.0)*.72);
      opacity=(.72+.23*molten)*edge*front;
     }
     gl_FragColor=vec4(color,opacity*strength);
     #include <colorspace_fragment>
    }
   `,
  });
  const surface=new THREE.Mesh(geometry,material);
  f.group.add(surface);f.fireSea={surface,start,end};
 }
 function remove(f){scene.remove(f.group);if(f.fireSea){f.fireSea.surface.geometry.dispose();f.fireSea.surface.material.dispose();}for(const m of [f.core,f.soft,f.dark])m.dispose();for(const b of f.batches)b.m.dispose()}
 function effect(d,ground){if(!Object.hasOwn(spells,d.id)||!Number.isFinite(d.x)||!Number.isFinite(d.z))return;
  const local=!camera?.userData.localName||!d.owner||d.owner===camera.userData.localName,distance=camera?Math.hypot(d.x-camera.position.x,d.z-camera.position.z):0,policy=remoteSpellPolicy({local,distance,pressure:camera?.userData.renderPressure,remoteCount:effects.filter(f=>!f.local).length});
  if(!local&&distance>130&&camera?.userData.renderPressure)return;
  if(d.id==='shadowreturn'&&d.phase==='return')for(let i=effects.length-1;i>=0;i--)if(effects[i].id==='shadowreturn'&&effects[i].owner===d.owner){remove(effects[i]);effects.splice(i,1)}
  while(effects.length>=12){let victim=effects.findIndex(f=>!f.local);if(victim<0){if(!local)return;victim=0}remove(effects.splice(victim,1)[0])}const [color,duration]=spells[d.id],group=new THREE.Group(),y=ground(d.x,d.z)+.08;group.position.set(d.x,y,d.z);group.userData.skill=d.id;
  const core=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}),soft=core.clone();soft.opacity=.25;
  const dark=new THREE.MeshBasicMaterial({color:0x17051f,transparent:true,opacity:.65,depthWrite:false}),owner=d.source||resolveOwner?.(d.owner),source=new THREE.Vector3(Number.isFinite(owner?.x)?owner.x-d.x:0,Number.isFinite(owner?.y)?owner.y-y:1.3,Number.isFinite(owner?.z)?owner.z-d.z:-4);if(source.length()>65)source.set(0,1.3,-4);
  const links=d.id==='chain'?(Array.isArray(d.links)?d.links.filter(p=>[p.x,p.y,p.z,p.height].every(Number.isFinite)).slice(0,32):[{x:d.x,y:y+1.2,z:d.z,height:1.2,target:d.target}]):[];
  const life=(d.id==='shadowreturn'&&d.phase==='return'?1.2:d.holy?Math.max(1.6,duration):duration)+Math.max(0,links.length-1)*.13,f={local,particles:policy.particles,id:d.id,owner:d.owner,phase:d.phase,holy:!!d.holy,group,core,soft,dark,batches:[],source,links,nodes:links.map(p=>new THREE.Vector3(p.x-d.x,p.y-y,p.z-d.z)),r:Math.max(.7,Number(d.radius)||1),detail:policy.detail,duration:life,life,target:d.id==='chain'?undefined:d.target,ground};if(d.id==='chain'){core.color.set(0xc9edff);soft.color.set(0x79afff);core.side=soft.side=THREE.FrontSide}if(!buildExpansionSpell(f,{mesh,ring,batch,set,beam,fireSea})){if(f.holy)holyFlourish(f);else{build(f);flourish(f);}}const instances=f.batches.reduce((n,b)=>n+b.m.count,0);while(effects.length&&effects.reduce((n,e)=>n+e.batches.reduce((v,b)=>v+b.m.count,0),0)+instances>2400){let victim=effects.findIndex(e=>!e.local);if(victim<0){if(!local){remove(f);return;}victim=0;}remove(effects.splice(victim,1)[0]);}scene.add(group);effects.push(f);updateEffect(f,0);
 }
 function updateEffect(f,t){const p=t/f.duration,fade=Math.min(1,(1-p)*4),r=f.r;f.core.opacity=.82*fade;f.soft.opacity=.24*fade;f.dark.opacity=.7*fade;
  if(f.fireSea){
   const {surface,start,end}=f.fireSea,age=t-start;
   surface.visible=age>=0&&t<end;
   surface.material.uniforms.age.value=Math.max(0,age);
   surface.material.uniforms.strength.value=Math.max(0,Math.min(1,age*6,(end-t)*1.5));
  }
  if(f.id==='chain')for(let i=0;i<f.links.length;i++){const link=f.links[i],actor=resolveOwner?.('@monster:'+link.target);if(actor&&[actor.x,actor.z].every(Number.isFinite))f.nodes[i].set(actor.x-f.group.position.x,f.ground(actor.x,actor.z)+link.height-f.group.position.y,actor.z-f.group.position.z)}
  for(const m of f.group.children){if(m.isInstancedMesh||!m.userData.motion)continue;const {motion,pos,scale,rot}=m.userData;m.position.fromArray(pos);m.scale.fromArray(scale);m.rotation.fromArray(rot);
   if(motion==='swordWave'){const u=1-ease(t/.22);m.position.set(f.source.x*u,1.2+(f.source.y-1.2)*u,f.source.z*u);m.rotation.z+=t*2;m.scale.multiplyScalar(.5+ease(t*4))}
   if(motion==='tripleSlash'){const phase=t-(m.userData.delay||0);m.visible=phase>=0&&phase<.3;m.rotation.z+=(m.userData.delay===.3?-1:1)*ease(phase/.3)*2.2;m.scale.multiplyScalar(.6+ease(phase/.3)*.4)}
   if(motion==='greatCut'){m.visible=t>.35;m.rotation.z+=ease(Math.max(0,t-.35)*3)*2;m.scale.multiplyScalar(ease(Math.max(0,t-.35)*5))}
   if(motion==='shock')m.scale.multiplyScalar(.08+ease(t*2.8));
   if(motion==='spin'||motion==='counter')m.rotation.z+=(motion==='spin'?1:-1)*t*1.8;
   if(motion==='cut'||motion==='cutReverse'){m.rotation.z+=(motion==='cut'?1:-1)*ease(t*5)*1.5;m.scale.multiplyScalar(.5+ease(t*5)*.5)}
   if(motion==='flash')m.scale.multiplyScalar(Math.max(.02,1-p));
   if(motion==='detonate')m.scale.multiplyScalar(.2+ease(t*3)*r*.7);
   if(motion==='gate'){m.scale.multiplyScalar(ease(t*4));m.rotation.z=t*.3}
   if(motion==='bind')m.scale.multiplyScalar(1.6-ease(t*3)*.8);
   if(motion==='rise')m.position.y+=ease(t*3)*.5;
   if(motion==='shield'){m.rotation.y=t*.5;m.scale.multiplyScalar(.5+ease(t*4)*.5)}
   if(motion==='snow'){m.rotation.z=t*(pos[1]>2?-1:1);m.position.y+=Math.sin(t*3)*.25}
   if(motion==='pulse')m.scale.multiplyScalar(.85+.15*Math.sin(t*7));
   if(motion==='curseDrop')m.position.y+=2*(1-ease(t*5));
   if(motion==='impact')m.scale.multiplyScalar(.15+ease(Math.max(0,t-.15)*5));
   if(motion==='missile'){const u=1-ease(t/.22);m.position.set(f.source.x*u,1.2+(f.source.y-1.2)*u,f.source.z*u);m.visible=t<.28;m.rotation.y=t*8}
  }
  for(const {m,pose}of f.batches){for(let i=0;i<m.count;i++){pose(i,t);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix)}m.instanceMatrix.needsUpdate=true;if(f.id==='storm'&&!f.holy)m.visible=m.geometry!==G.beam||Math.sin(t*9)>-.25}
 }
return {effect,update(time,dt){const step=Number.isFinite(dt)?Math.max(0,dt):0;for(let i=effects.length-1;i>=0;i--){const f=effects[i];f.life-=step;if(f.life<=0){remove(f);effects.splice(i,1)}else {if(f.id==='nightfall'){const owner=resolveOwner?.(f.owner);if(owner&&[owner.x,owner.z].every(Number.isFinite))f.group.position.set(owner.x,f.ground(owner.x,owner.z)+.08,owner.z)}if(f.target){const target=resolveOwner?.('@monster:'+f.target);if(target&&target.hp>0)f.group.position.set(target.x,f.ground(target.x,target.z)+.08,target.z)}animateVisibleEffect(f,f.duration-f.life)}}},clear(){for(const f of effects)remove(f);effects.length=0},get count(){return effects.length}};
}
