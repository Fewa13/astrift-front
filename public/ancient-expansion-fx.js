// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Both live network effects and the preview call this same bounded, instanced builder.
export const EXPANSION_FX={
 riftblade:[0x9e88ff,.8],shadowstep:[0x8671ff,1.1],shadowreturn:[0xba9dff,6],nightfall:[0x8279ff,8],
 stonefist:[0xf2bd75,1],faultline:[0xf5b862,1.7],stoneprison:[0xd7ac71,3.7],mountainfall:[0xffcc7b,3.3]
};
export function buildExpansionSpell(f,{mesh,ring,batch,set,beam}){
 if(!Object.hasOwn(EXPANSION_FX,f.id))return false;
 const TAU=Math.PI*2,r=f.r,h=f.holy,ease=t=>1-(1-Math.max(0,Math.min(1,t)))**3,fade=(t,start,end)=>t<start?0:Math.max(0,1-(t-start)/(end-start));
 const stoneBatch=(geo,count,pose)=>{const m=batch(f,geo,count,pose);m.material=f.dark;f.dark.color.setHex(h?0x9c8057:0x746653);f.dark.transparent=false;f.dark.depthWrite=true;return m;};
 const rockParts=(parts,pose)=>{for(const geo of ['bar','crystal']){const group=parts.filter(p=>p[0]===geo);if(!group.length)continue;stoneBatch(geo,group.length,(i,t)=>{const [,offset,scale]=group[i],[x,y,z,s,angle]=pose(t),c=Math.cos(angle),sn=Math.sin(angle);set(x+(offset[0]*c-offset[1]*sn)*s,y+(offset[0]*sn+offset[1]*c)*s,z+offset[2]*s,scale[0]*s,scale[1]*s,scale[2]*s,0,0,angle)})}};
 const shards=(count,start,size)=>batch(f,'crystal',count,(i,t)=>{const u=t-start,a=i*2.399,p=ease(u*3),s=fade(t,start,start+1.3);set(Math.cos(a)*size*p,.15+Math.sin(Math.min(1,Math.max(0,u))*Math.PI)*(1+i%4*.4),Math.sin(a)*size*p,.14*s,.32*s,.14*s,u*3,a)},true);
 const cracks=(start,size)=>batch(f,'beam',h?54:24,(i,t)=>{const a=Math.floor(i/3)/(h?18:8)*TAU,j=i%3,p=ease((t-start)*6),s=fade(t,start,start+1.8),rr=size*p;beam(Math.cos(a)*rr*j/3,.08,Math.sin(a)*rr*j/3,Math.cos(a+.07*(j%2?1:-1))*rr*(j+1)/3,.08,Math.sin(a+.07*(j%2?1:-1))*rr*(j+1)/3,.045*s)});
 const figures=(count,position)=>{for(const [geo,part,scale]of [['bar',[0,1.1,0],[.48,.7,.24]],['orb',[0,1.78,0],[.2,.23,.2]],['bar',[-.18,.4,0],[.16,.75,.2]],['bar',[.18,.4,0],[.16,.75,.2]],['bar',[-.43,1.05,-.12],[.12,.8,.12]],['bar',[.43,1.05,-.12],[.12,.8,.12]]])batch(f,geo,count,(i,t)=>{const [x,y,z,s,turn]=position(i,t);set(x+part[0]*s,y+part[1]*s,z+part[2]*s,scale[0]*s,scale[1]*s,scale[2]*s,0,turn||0,part[0]>.3?-.75:part[0]<-.3?.75:0)},true)};
 const blade=(count,pose)=>{for(const [geo,y,scale]of [['bar',0,[.1,1.1,.06]],['cone',.68,[.15,.3,.08]],['bar',-.5,[.38,.07,.1]]])batch(f,geo,count,(i,t)=>{const [x,yy,z,s,angle]=pose(i,t);set(x-Math.sin(angle)*y*s,yy+Math.cos(angle)*y*s,z,scale[0]*s,scale[1]*s,scale[2]*s,0,0,angle)})};
 if(f.id==='riftblade'){
  batch(f,'arc',h?6:2,(i,t)=>{const delay=Math.floor(i/2)*.09,u=t-delay,on=u>=0&&u<.32,side=i%2?1:-1,s=on?(h?2.8:1.8)*(1-u/.45):0;set(side*.25,1.2,0,s,s,.45,0,0,side*(.7+ease(u/.32)*2.6))});
  if(h){figures(2,(i,t)=>{const p=ease(t/.3),side=i?1:-1;return [side*3*(1-p),0,side*.5,fade(t,0,.55),side*.8]});blade(4,(i,t)=>[Math.sin(i*1.7)*2,1.8,Math.cos(i*1.7),fade(t,.04,.7)*1.2,i*1.7+t*5]);}
 }else if(f.id==='shadowstep'){
  const length=Math.hypot(f.source.x,f.source.z),count=h?8:5;
  figures(count,(i,t)=>{const u=(i+1)/(count+1),s=fade(t,i*.035,.8);return [f.source.x*(1-u),f.source.y-1.4,f.source.z*(1-u),s,h?u*1.2:0]});
  batch(f,'beam',h?24:12,(i,t)=>{const lane=i%2?1:-1,j=Math.floor(i/2),count=h?12:6,p=j/count,q=(j+1)/count,w=fade(t,0,1)*.06;beam(f.source.x*(1-p)+lane*.45,.5+Math.sin(j)*.15,f.source.z*(1-p),f.source.x*(1-q)+lane*.45,.5+Math.sin(j+1)*.15,f.source.z*(1-q),w)});
  if(h)blade(8,(i,t)=>{const u=i/8;return [f.source.x*(1-u),1.2,f.source.z*(1-u),fade(t,i*.03,1.1)*1.3,(i%2?1:-1)*(1.2+t*4)]});
  ring(f,Math.min(2,r),.15,'shock',true);
 }else if(f.id==='shadowreturn'){
  const back=f.phase!=='return';figures(h?3:1,(i,t)=>[back?f.source.x+(i-1)*(h?.7:0):Math.sin(i*2)*ease(t*5)*2,back?f.source.y-1.4:0,back?f.source.z:Math.cos(i*2)*ease(t*5)*2,back?.68+.12*Math.sin(t*5+i):fade(t,0,1.1),t*.2]);
  batch(f,'arc',h?4:2,(i,t)=>{const u=t-i*.04,s=fade(u,0,.55)*r*.7;set(0,1.2,0,s,s,.3,0,0,i*1.4+ease(u*4)*3)});
  if(h)batch(f,'ring',3,(i,t)=>{const s=back?1+.12*Math.sin(t*3+i):ease(t*5)*2;set(back?f.source.x:0,.15+i*.06,back?f.source.z:0,s,s,s,Math.PI/2,0,t*(i%2?1:-1))},true);
 }else if(f.id==='nightfall'){
  blade(h?12:6,(i,t)=>{const count=h?12:6,a=i/count*TAU+t*(h?1.6:.9),rr=h?2.3:1.6;return [Math.cos(a)*rr,1.6+Math.sin(a*2+t)*.4,Math.sin(a)*rr,1,Math.sin(a)*1.2]});
  batch(f,'arc',h?6:3,(i,t)=>{const beat=t%(h?.5:.85),s=fade(beat,i*.025,.4);set(0,.3+i*.45,0,(1+ease(beat*6)*r*.7)*s,(1+ease(beat*6)*r*.7)*s,.25,Math.PI/2,i*.3,t*2+i)});
  if(h)figures(3,(i,t)=>{const a=i/3*TAU+t*1.6;return [Math.cos(a)*2.8,0,Math.sin(a)*2.8,.7,-a]});
 }else if(f.id==='stonefist'){
  // Knuckles and wrist travel from caster to target; not another particle projectile.
  rockParts([['bar',[0,0,0],[.9,.8,.8]],['bar',[0,-.1,.65],[.65,.65,.7]],...Array.from({length:4},(_,i)=>['crystal',[(i-1.5)*.25,.3,-.35],[.19,.28,.23]])],t=>{const p=ease(t/.18),s=fade(t,0,.65)*(h?1.9:1);return [f.source.x*(1-p),1.3+(f.source.y-1.3)*(1-p),f.source.z*(1-p),s,-.15]});
  cracks(.18,r);shards(h?24:12,.18,r);
  if(h)batch(f,'ring',3,(i,t)=>{const u=t-.1-i*.07,s=u>=0?ease(u*7)*r:0;set(0,1.3,0,s,s,s,0,0,t*.3)},true);
 }else if(f.id==='faultline'){
  stoneBatch('cone',(h?16:8)*3,(i,t)=>{const count=h?16:8,wave=Math.floor(i/count),j=i%count,u=t-wave*.35,a=j/count*TAU,rr=r*(.35+wave*.25),s=u>=0?fade(u,0,.65):0;set(Math.cos(a)*rr,-.2+ease(u*9)*s*(h?1.5:.8),Math.sin(a)*rr,.3*s,(h?2.6:1.4)*s,.3*s,0,a,.25)});
  for(let i=0;i<3;i++)cracks(i*.35,r*(.4+i*.3));
  if(h)batch(f,'bar',24,(i,t)=>{const a=i/24*TAU,s=fade(t,.12,1.6);set(Math.cos(a)*r*.85,2.7*s,Math.sin(a)*r*.85,.2*s,1.3*s,.15*s,0,-a,Math.PI/4)});
 }else if(f.id==='stoneprison'){
  stoneBatch('crystal',h?16:8,(i,t)=>{const a=i/(h?16:8)*TAU,s=t<3?ease(t*6):fade(t,3,3.65),rr=r*.8*(t<3?1:1-ease((t-3)*5));set(Math.cos(a)*rr,(h?2.1:1.3)*s,Math.sin(a)*rr,.4*s,(h?3.8:2.5)*s,.35*s,0,a,Math.sin(a)*.2)});
  batch(f,'beam',h?32:8,(i,t)=>{const j=i%8,layer=Math.floor(i/8),a=j/8*TAU,b=(j+1)/8*TAU,s=t<3?ease(t*6):fade(t,3,3.6);beam(Math.cos(a)*r*.8,(.7+layer*.65)*s,Math.sin(a)*r*.8,Math.cos(b)*r*.8,(.7+layer*.65)*s,Math.sin(b)*r*.8,.045*s)},true);
  cracks(3,r);shards(h?32:16,3,r);
  if(h){ring(f,r,.12,'counter');batch(f,'bar',24,(i,t)=>{const a=i/24*TAU+t*.15,s=fade(t,0,3.7);set(Math.cos(a)*r,.2,Math.sin(a)*r,.06,.5*s,.06,Math.PI/2,0,-a)})}
 }else if(f.id==='mountainfall'){
  // A jointed forearm descends, then an articulated fist strikes at the actual 650ms hit.
  rockParts([['bar',[0,2.9,0],[1.7,5.2,1.5]],['crystal',[0,.9,0],[1.5,1.6,1.5]],['bar',[0,0,-.3],[2.7,1.6,2]],
   ...Array.from({length:4},(_,i)=>['crystal',[(i-1.5)*.7,-.45,-1.2],[.45,.6,.5]]),
   ...Array.from({length:6},(_,i)=>['bar',[(i%2?1:-1)*.9,1.7+Math.floor(i/2)*1.2,0],[.3,.9,1.65]])],
   t=>{const charge=ease(t/.5),slam=ease((t-.5)/.15),s=ease(t*6)*(t<.65?1:fade(t,.65,2.3))*(h?1.6:1);return [(1-slam)*-2,1+7*charge*(1-slam),0,s,(1-slam)*-.65]});
  batch(f,'bar',12,(i,t)=>{const side=i%2?1:-1,j=Math.floor(i/2),slam=ease((t-.5)/.15),s=ease(t*6)*(t<.65?1:fade(t,.65,2.3))*(h?1.6:1);set(side*.55*s+(1-slam)*-2,1+7*ease(t/.5)*(1-slam)+(j*.72+.5)*s,-.82*s,.055*s,.36*s,.035*s,0,0,side*.6)});
  cracks(.65,r);shards(h?40:20,.65,r);
  batch(f,'ring',3,(i,t)=>{const u=t-1-i*.5,s=u>=0&&u<.65?ease(u*6)*r:0;set(0,.14+i*.025,0,s,s,s,Math.PI/2)},true);
  if(h){batch(f,'crystal',12,(i,t)=>{const a=i/12*TAU,s=fade(t,.2,2.5),rr=r*.75;set(Math.cos(a)*rr,5+Math.sin(t*3+i)*.3,Math.sin(a)*rr,.45*s,1.4*s,.45*s,0,a,t*.3)});batch(f,'beam',24,(i,t)=>{const a=i/24*TAU,u=t-.65,s=fade(t,.65,2.6);beam(Math.cos(a)*r*.7,.1,Math.sin(a)*r*.7,Math.cos(a)*r*.7,6*ease(u*8),Math.sin(a)*r*.7,.06*s)})}
 }
 return true;
}
