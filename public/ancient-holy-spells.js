// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Independent holy compositions. No normal spell is drawn underneath these.
export function buildHolySpell(f,{mesh,ring,batch,set,beam,swords}){
 const TAU=Math.PI*2,r=Math.max(1.2,f.r),ease=t=>1-(1-Math.max(0,Math.min(1,t)))**3,fade=(t,start=0,end=.7)=>t<start?0:Math.max(0,1-(t-start)/(end-start));
 const portal=(height,size,vertical=false)=>{for(let i=0;i<3;i++)mesh(f,'ring',[0,height+i*.06,0],[size*(1-i*.18),size*(1-i*.18),1],vertical?[0,0,i*.4]:[-Math.PI/2,0,i*.4],i%2?'spin':'counter',i===2);};
 const runes=(height,size,count=24,vertical=false)=>batch(f,'bar',count*6,(i,t)=>{const symbol=Math.floor(i/6),stroke=i%6,a=symbol/count*TAU+t*(symbol%2?.12:-.12),rr=size+(stroke%3-1)*.12,off=Math.floor(stroke/3)*.14,activate=ease(t*5-symbol/count*.8);if(vertical)set(Math.cos(a)*rr,height+Math.sin(a)*rr,off,.035*activate,.16*activate,.04,0,0,a+(stroke%2?.65:-.65));else set(Math.cos(a)*rr,height+off,Math.sin(a)*rr,.035*activate,.19*activate,.045,Math.PI/2,a,stroke%2?.6:-.6)});
 const cracks=(size,height=.08)=>batch(f,'beam',36,(i,t)=>{const ray=Math.floor(i/3),j=i%3,a=ray/12*TAU,rr=size*ease(t*7),p=j/3,q=(j+1)/3;beam(Math.cos(a)*rr*p,height,Math.sin(a)*rr*p,Math.cos(a+.07*(j%2?1:-1))*rr*q,height,Math.sin(a+.07*(j%2?1:-1))*rr*q,.025*fade(t,0,1.3))});
 const crystalExplosion=(count,size,start=.1)=>batch(f,'crystal',count,(i,t)=>{const phase=Math.max(0,t-start),a=i*2.399,rr=size*ease(phase*3),s=.22*fade(t,start,start+1);set(Math.cos(a)*rr,1+Math.sin(phase*3)*2+i%3*.3,Math.sin(a)*rr,s,s*(2+i%3),s,phase*2,a)});
 const haloBlades=(count,size,height,travel)=>swords(f,count,(i,t)=>{const a=i/count*TAU+t*.3,phase=Math.max(0,t-i*.025);return [Math.cos(a)*size,height-travel*ease(phase*3),Math.sin(a)*size,1.8+Math.sin(i)*.3,a]});
 switch(f.id){
  case 'frostburst':
   portal(7,r*.75);runes(7,r*.72,12);batch(f,'crystal',7,(i,t)=>{const u=ease(t*5),a=i/7*TAU;set(f.source.x*(1-u)+Math.cos(a)*.8,1.4+(f.source.y-1.4)*(1-u),f.source.z*(1-u)+Math.sin(a)*.8,.24,.9,.24,Math.PI/2,0,a)});
   batch(f,'crystal',18,(i,t)=>{const u=Math.max(0,t-.2),a=i/18*TAU,s=fade(t,.2,1.5);set(Math.cos(a)*r*.7,u>=0?1.8*ease(u*7)*s:0,Math.sin(a)*r*.7,.22*s,3.5*ease(u*7)*s,.22*s,0,a,.3)});crystalExplosion(24,r,.25);cracks(r);break;
  case 'chain':{
   f.core.color.set(0xd4f4ff);f.soft.color.set(0x428cff);
   // A thunder lance from the heavens per actual chain node, then node-to-node arcs.
   batch(f,'beam',f.nodes.length*12,(i,t)=>{const hop=Math.floor(i/12),j=i%12,node=f.nodes[hop],local=t-hop*.13;const flash=local>=0&&local<.3?1-local/.3:0,tip=12*(1-ease(local*18));beam(node.x+Math.sin(j*2+t*48)*.16,node.y+Math.max(tip,12-j),node.z,node.x+Math.sin((j+1)*2+t*48)*.16,node.y+Math.max(tip,11-j),node.z,.11*flash)});
   batch(f,'beam',f.nodes.length*8,(i,t)=>{const hop=Math.floor(i/8),j=i%8,node=f.nodes[hop],from=hop?f.nodes[hop-1]:f.source,local=t-hop*.13,p=j/8,q=(j+1)/8,flash=local>=0&&local<.35?1-local/.35:0;beam(from.x+(node.x-from.x)*p+Math.sin(j*4+t*36)*.2,from.y+(node.y-from.y)*p,from.z+(node.z-from.z)*p,node.x+(from.x-node.x)*(1-q)+Math.sin((j+1)*4+t*36)*.2,from.y+(node.y-from.y)*q,from.z+(node.z-from.z)*q,.065*flash)});
   batch(f,'ring',f.nodes.length,(i,t)=>{const node=f.nodes[i],local=t-i*.13,s=local>=0&&local<.6?.2+ease(local*5)*1.4:0;set(node.x,node.y,node.z,s,s,s,Math.PI/2)});mesh(f,'crystal',[0,11,0],[.75,1.8,.75],[0,0,.3],'pulse');batch(f,'crystal',12,(i,t)=>{const a=i/12*TAU+t*2;set(Math.cos(a)*1.8,11+Math.sin(a*2)*.5,Math.sin(a)*1.8,.13,.65,.13,0,a,.5)});break;
  }
  case 'storm':
   // A fractured storm heart, not a bigger version of the normal ground ring.
   mesh(f,'crystal',[0,10,0],[1.1,2.2,1.1],[0,0,.15],'pulse');mesh(f,'crystal',[0,10,0],[1.5,2.6,1.5],[0,0,.15],'counter',true);
   batch(f,'crystal',18,(i,t)=>{const a=i/18*TAU+t*.55,rr=r*.47;set(Math.cos(a)*rr,10+Math.sin(a*3+t*2)*.45,Math.sin(a)*rr,.18,1.35,.35,.7*Math.cos(a),-a,.7*Math.sin(a))});runes(10,r*.6,16);
   batch(f,'beam',70,(i,t)=>{const column=Math.floor(i/10),j=i%10,a=column*2.399,rr=column?r*.72:0,cycle=(t+column*.047)% .32,flash=cycle<.2?1-cycle/.2:0;beam(Math.cos(a)*rr+Math.sin(j*3+t*43)*.2,10-j,Math.sin(a)*rr,Math.cos(a)*rr+Math.sin((j+1)*3+t*43)*.2,9-j,Math.sin(a)*rr,.16*flash)});cracks(r);break;
  case 'haste':
   batch(f,'beam',48,(i,t)=>{const lane=Math.floor(i/12)-1,j=i%12,p=j/12,q=(j+1)/12,w=.075*fade(t,0,1.2);beam(f.source.x*(1-p)+lane*.7,.15+Math.sin(j*3+t*40)*.1,f.source.z*(1-p),f.source.x*(1-q)+lane*.7,.15+Math.sin((j+1)*3+t*40)*.1,f.source.z*(1-q),w)});portal(1.3,1.7,true);batch(f,'cone',12,(i,t)=>{const a=i/12*TAU,rr=1.2+ease(t*6)*r*.7;set(Math.cos(a)*rr,.8,Math.sin(a)*rr,.1,1.2*fade(t,0,.8),.1,0,0,a)});break;
  case 'hex':
   portal(2.2,2.2,true);runes(2.2,2.15,18,true);mesh(f,'crystal',[0,2.2,0],[.55,.8,.15],[0,0,0],'curseDrop');
   batch(f,'beam',24,(i,t)=>{const a=i/24*TAU,rr=2.1*(1-ease(Math.max(0,t-.12)*6));beam(Math.cos(a)*2.1,2.2+Math.sin(a)*2.1,0,Math.cos(a)*rr,2.2+Math.sin(a)*rr,.3,.04*fade(t,0,1.4))});break;
  case 'drain':
   portal(1.5,1.7,true);runes(1.5,1.65,12,true);
   batch(f,'beam',48,(i,t)=>{const strand=Math.floor(i/12),j=i%12,a=strand/4*TAU+t*9,p=j/12,q=(j+1)/12;beam(f.source.x*p+Math.cos(a+p*9)*.45,1.5+(f.source.y-1.5)*p+Math.sin(a+p*9)*.45,f.source.z*p,f.source.x*q+Math.cos(a+q*9)*.45,1.5+(f.source.y-1.5)*q+Math.sin(a+q*9)*.45,f.source.z*q,.045*fade(t,0,1.4))});break;
  case 'doom':
   // A descending void obelisk in a three-dimensional prison of linked sigils.
   portal(5,r*.75);portal(.15,r);runes(5,r*.7,24);runes(.15,r*.92,24);
   const obelisk=mesh(f,'crystal',[0,4.2,0],[1.2,2.8,1.2],[0,0,0],'curseDrop');obelisk.material=f.dark;
   mesh(f,'crystal',[0,4.2,0],[1.3,2.9,1.3],[0,0,0],'curseDrop',true);
   batch(f,'beam',24,(i,t)=>{const a=i/12*TAU,j=Math.floor(i/12),rr=r*.85;beam(Math.cos(a)*rr,.2,Math.sin(a)*rr,Math.cos(a+j*.52)*rr,5,Math.sin(a+j*.52)*rr,.04*(.6+.4*Math.sin(t*3+i)))});break;
  case 'weaken':portal(1.5,1.5,true);runes(1.5,1.5,12,true);batch(f,'bar',8,(i,t)=>{const a=i/8*TAU,rr=1.9-ease(t*6);set(Math.cos(a)*rr,1.5+Math.sin(a)*rr,0,.08,.55,.09,0,0,a)});break;
  case 'icebolt':
   mesh(f,'crystal',[0,1.5,0],[.5,2.7,.5],[0,0,Math.PI/2],'missile');batch(f,'crystal',9,(i,t)=>{const a=i/9*TAU,s=ease(t*8)*fade(t,0,1.3);set(Math.cos(a)*1.1,.3,Math.sin(a)*1.1,.22*s,2.5*s,.22*s,Math.cos(a)*.5,0,Math.sin(a)*.5)});crystalExplosion(24,3);break;
  case 'icearmor':
   batch(f,'crystal',16,(i,t)=>{const a=i/16*TAU,rr=1.7;set(Math.cos(a)*rr,1.4,Math.sin(a)*rr,.28,2.8*ease(t*6),.2,0,a,.16*Math.sin(t*2+i))});portal(3.5,2.3);crystalExplosion(24,r);break;
  case 'blizzard':
   portal(8,r*.8);batch(f,'crystal',32,(i,t)=>{const a=i*2.399+t*.35,rr=r*Math.sqrt((i+.5)/32),phase=(t*.75+i*.11)%1;set(Math.cos(a)*rr,8-phase*8,Math.sin(a)*rr,.18,.85,.18,t*.5,a)});
   batch(f,'arc',6,(i,t)=>{const a=i/6*TAU+t*.7;set(Math.cos(a)*r*.15,1+i*.5,Math.sin(a)*r*.15,r*.8,r*.8,.3,Math.PI/2,.25*Math.sin(t+i),a)});break;
  case 'swordwave':
   // A three-part blade front advances from the caster, followed by a ground split.
   batch(f,'arc',3,(i,t)=>{const u=1-ease(t*5),s=(2.1-i*.4)*fade(t,0,.9);set(f.source.x*u,1.3+i*.18,f.source.z*u,s,s,.45,.2,0,-.6+t*3+i*.15)});cracks(r*1.4);break;
  case 'triplecut':
   // Three separate sword strokes: diagonal, reverse diagonal, vertical finisher.
   batch(f,'arc',9,(i,t)=>{const hit=Math.floor(i/3),trail=i%3,u=t-hit*.3-trail*.035,show=u>=0&&u<.28?fade(u,0,.28):0,s=(4.2+hit*.25-trail*.12)*show;set(0,1.7,trail*.08,s,s,.8,hit===2?0:hit===1?.65:-.65,0,(hit===1?1:-1)*(-1.4+ease(u/.22)*3.3))});
   for(const [geo,offset,sx,sy,sz]of [['bar',0,.28,4,.12],['cone',-2.3,.35,.7,.14],['bar',2,1.4,.18,.25],['bar',2.5,.18,.8,.18]])batch(f,geo,3,(i,t)=>{const u=t-i*.3,show=u>=0&&u<.28?1:0,a=(i===1?1:-1)*(-1.3+ease(u/.22)*2.6);set(-Math.sin(a)*offset,2.7+Math.cos(a)*offset,0,sx*show,sy*show,sz*show,0,0,a)});
   batch(f,'beam',36,(i,t)=>{const hit=Math.floor(i/12),a=i%12/12*TAU,u=t-hit*.3-.16,s=u>=0&&u<.22?1-u/.22:0,rr=ease(u*12)*(1.8+hit*.45);beam(Math.cos(a)*rr*.3,1.5,Math.sin(a)*rr*.3,Math.cos(a)*rr,1.5+Math.sin(a*3)*.5,Math.sin(a)*rr,.075*s)});
   batch(f,'ring',3,(i,t)=>{const u=t-i*.3-.16,s=u>=0&&u<.3?(1+ease(u*8)*2.3)*(1-u/.3):0;set(0,1.6,0,s,s,s,0,0,i*.7)});break;
  case 'swordrain':portal(10,r*.75);haloBlades(24,r*.78,9,0);swords(f,24,(i,t)=>{const a=i*2.399,rr=r*Math.sqrt((i+.5)/24),phase=(t+i*.07)% .5;return [Math.cos(a)*rr,10-phase*20,Math.sin(a)*rr,2.2,a]});break;
  case 'phantomblade':
   // An actual colossal sword: bevel, edge, fuller, guard, grip and pommel.
   for(const [geo,y,sx,sy,sz]of [['bar',0,.85,10,.3],['bar',0,.12,10,.34],['cone',-6,.85,2,.3],['bar',5,4.5,.4,.65],['bar',6.2,.45,2,.45],['crystal',7.4,.6,.6,.6]])batch(f,geo,1,(i,t)=>{const size=1+Math.log2(Math.max(1,f.r/7.5))*.48,a=-1.4+ease(Math.max(0,t-.32)/.23)*2.8,s=size*ease(t*6)*Math.max(0,1-Math.max(0,t-2)/1.3);set(-Math.sin(a)*y*size,(7+Math.cos(a)*y)*size,0,sx*s,sy*s,sz*s,0,0,a)});
   portal(11,r*.7);runes(11,r*.68,16);
   batch(f,'arc',4,(i,t)=>{const u=t-.34-i*.04,s=u>=0&&u<.8?(6-i*.3)*Math.max(0,1-u/.8):0;set(0,3,.08*i,s,s,.65,0,0,-1.4+ease(u/.25)*2.8)});
   batch(f,'beam',48,(i,t)=>{const a=Math.floor(i/3)/16*TAU,j=i%3,u=t-.5,rr=r*ease(u*5),w=u>=0?.065*Math.max(0,1-u/2.7):0;beam(Math.cos(a)*rr*j/3,.15,Math.sin(a)*rr*j/3,Math.cos(a+.08)*rr*(j+1)/3,.15,Math.sin(a+.08)*rr*(j+1)/3,w)});
   batch(f,'crystal',24,(i,t)=>{const u=t-.5,a=i*2.399,s=u>=0?.18*Math.max(0,1-u/2.2):0,rr=r*.8*ease(u*3);set(Math.cos(a)*rr,Math.max(.15,u*6-u*u*3),Math.sin(a)*rr,s,s*3,s,u*3,a)});break;
  case 'summon':
   portal(3,3.1,true);runes(3,3.05,24,true);batch(f,'cone',12,(i,t)=>{const a=i/12*TAU;set(Math.cos(a)*2.7,3+Math.sin(a)*2.7,-.2,.13,.7,.15,0,0,a+t*.2)});haloBlades(6,2.5,4,1.6);break;
  case 'soulbolt':
   mesh(f,'crystal',[0,1.5,0],[.45,.75,.45],[0,0,0],'missile');portal(1.5,1.8,true);batch(f,'beam',24,(i,t)=>{const a=i/8*TAU,j=Math.floor(i/8),rr=1.5*(1-ease(t*5));beam(Math.cos(a)*rr,1.5+Math.sin(a)*rr,j*.2,Math.cos(a+.5)*rr,1.5+Math.sin(a+.5)*rr,(j+1)*.2,.06*fade(t,0,1))});break;
  case 'transform':portal(1.8,2.3,true);batch(f,'cone',10,(i,t)=>{const side=i%2?1:-1,j=Math.floor(i/2);set(side*(.35+j*.18),2.8-j*.25,0,.18,.9*ease(t*5),.15,0,0,-side*.5)});runes(.1,2.1,16);break;
  case 'claw':batch(f,'arc',5,(i,t)=>{const s=fade(t,0,.4);set((i-2)*.3,1.5,0,1.5*s,2*s,.6,0,.3,-1+ease(t*8)*2)});break;
  case 'petHit':batch(f,'cone',8,(i,t)=>{const a=i/8*TAU;set(Math.cos(a)*ease(t*7),.15,Math.sin(a)*ease(t*7),.15,1.4*fade(t,0,.5),.15)});cracks(2);break;
  case 'mark':portal(1.6,1.3,true);runes(1.6,1.3,8,true);break;
  case 'vitality':
   portal(.1,2);runes(.1,1.9,16);batch(f,'bar',12,(i,t)=>{const a=i/12*TAU,h=(t*.5+i/12)%1*3;set(Math.cos(a)*1.3,h,Math.sin(a)*1.3,.16,.5,.12,0,-a)});mesh(f,'ring',[0,2.2,0],[1.5,1.8,1],[0,0,0],'spin');break;
  case 'power':
   // Golden shock front and a crown of rising stone blades, not a static sky seal.
   batch(f,'ring',4,(i,t)=>{const u=t-i*.065,s=u>=0&&u<.65?r*ease(u*6):0;set(0,.16+i*.13,0,s,s,s,-Math.PI/2)});
   ring(f,r*.7,.2,'shock',true);
   batch(f,'crystal',24,(i,t)=>{const a=i/24*TAU,u=t-.07-i%3*.035,h=3.8*ease(u*12)*fade(u,0,1.15),rr=r*.78;set(Math.cos(a)*rr,h*.45,Math.sin(a)*rr,.35,h,.35,.2*Math.cos(a),a,.2*Math.sin(a))});
   batch(f,'beam',32,(i,t)=>{const a=i/32*TAU,rr=r*ease(t*6),s=fade(t,0,.8);beam(Math.cos(a)*rr*.7,.3,Math.sin(a)*rr*.7,Math.cos(a)*rr,1.1+s,Math.sin(a)*rr,.085*s)});runes(.12,r*.55,12);cracks(r);break;
  case 'rage':
   // A red-gold eruption: low shockwave, rolling flame wall, then airborne debris.
   ring(f,r*.75,.2,'shock',true);
   batch(f,'ring',3,(i,t)=>{const u=t-i*.08,s=u>=0&&u<.75?r*ease(u*5):0;set(0,.12+i*.18,0,s,s,s,-Math.PI/2)});
   batch(f,'cone',36,(i,t)=>{const a=i/36*TAU,rr=r*ease(t*6),h=(2.5+Math.sin(i*4+t*17)*.8)*fade(t,0,1.2);set(Math.cos(a)*rr,h*.4,Math.sin(a)*rr,.45,h,.45,.45*Math.cos(a),a,.45*Math.sin(a))});
   batch(f,'crystal',24,(i,t)=>{const a=i*2.399,u=Math.max(0,t-.08),rr=r*.9*ease(u*3),s=.22*fade(t,.08,1.3);set(Math.cos(a)*rr,Math.max(.1,1+u*8-u*u*7),Math.sin(a)*rr,s,s*2,s,u*5,a)});
   batch(f,'arc',2,(i,t)=>{const s=(4+i)*fade(t,0,.65);set(0,2,0,s,s,.9,i?.65:-.65,0,(i?1:-1)*(-1+ease(t*5)*2.8))});cracks(r);break;
  case 'slash':
   batch(f,'bar',18,(i,t)=>{const side=i%2?1:-1,j=Math.floor(i/2),progress=ease(t*5),s=fade(t,0,1.2);set(side*(.3+j*.1)*progress,.15+j*.2*s,(j-4)*r/5,.2,2.5*s,.2,0,0,-side*.3)});mesh(f,'arc',[0,1.4,0],[4,4,.7],[.4,0,-.9],'cut');cracks(r);break;
 }
}
