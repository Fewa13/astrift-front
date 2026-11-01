// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Exact 32-bit mixing avoids correlated stamp-like lattice shapes and CPU/GPU drift.
function latticeHash(x:number,y:number,z:number){let h=Math.imul(x,0x8da6b343)^Math.imul(y,0xd8163841)^Math.imul(z,0xcb1ab31f);h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;h=Math.imul(h,0x846ca68b);h^=h>>>16;return (h&0xffffff)/16777215;}
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
function noise(p:number[]){const i=p.map(Math.floor),f=p.map((x,j)=>{const t=x-i[j];return t*t*(3-2*t);}),h=(x:number,y:number,z:number)=>latticeHash(i[0]+x,i[1]+y,i[2]+z);return mix(mix(mix(h(0,0,0),h(1,0,0),f[0]),mix(h(0,1,0),h(1,1,0),f[0]),f[1]),mix(mix(h(0,0,1),h(1,0,1),f[0]),mix(h(0,1,1),h(1,1,1),f[0]),f[1]),f[2]);}
export function naturalJadePattern(pattern:number,p:number[],phase:number){
 const q=[p[0]+phase*.23,p[1]+Math.sin(phase)*.71,p[2]+Math.cos(phase)*.63],n=noise(q.map(x=>x*1.75)),f=noise(q.map((x,i)=>x*6.7+[3.1,7.4,1.7][i])),cloud=n*.72+f*.28,w=q.map((x,i)=>x+[f-.5,n-.5,(n+f)*.5-.5][i]*.45);
 if(pattern===1)return .18+cloud*.65;
 if(pattern===2)return smooth(.2,.8,noise([q[0]*1.4+f*.35,q[1]*3.6,q[2]*1.7])*.7+n*.3);
 if(pattern===3)return smooth(.52,.8,noise(q.map((x,i)=>x*[8,2.2,3.1][i]+f*.7)));
 if(pattern===4)return smooth(.35,.85,cloud)*.78;
 if(pattern===5)return smooth(.28,.72,noise(q.map(x=>x*1.2+f*.4)));
 if(pattern===6)return smooth(.2,.8,cloud);
 if(pattern===7)return .2+cloud*.48;
 if(pattern===8)return Math.pow(f*.6+n*.4,1.5);
 if(pattern===9)return .1+Math.pow(noise(w.map((x,i)=>x*[4.2,36,4][i])),3)*.65;
 if(pattern===10)return .08+Math.pow(noise(q.map(x=>x*11))*.65+noise(q.map(x=>x*23+.7))*.35,2)*.8;
 if(pattern===11)return smooth(.25,.75,noise(q.map((x,i)=>x*[1.5,5.7,1.7][i]))*.7+n*.3);
 return smooth(.35,.9,noise(w.map((x,i)=>x*[3.2,7,3.8][i]+f*.8))*.66+n*.34)*.8;
}
export const JADE_PATTERN_GLSL=`
 float jHash(vec3 p){uvec3 c=uvec3(ivec3(p));uint h=c.x*0x8da6b343u ^ c.y*0xd8163841u ^ c.z*0xcb1ab31fu;h^=h>>16u;h*=0x7feb352du;h^=h>>15u;h*=0x846ca68bu;h^=h>>16u;return float(h&0xffffffu)/16777215.;}
 float jNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(jHash(i),jHash(i+vec3(1,0,0)),f.x),mix(jHash(i+vec3(0,1,0)),jHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(jHash(i+vec3(0,0,1)),jHash(i+vec3(1,0,1)),f.x),mix(jHash(i+vec3(0,1,1)),jHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
 float naturalJadePattern(float pattern,vec3 p,float phase){
  vec3 q=p+vec3(phase*.23,sin(phase)*.71,cos(phase)*.63);float n=jNoise(q*1.75),f=jNoise(q*6.7+vec3(3.1,7.4,1.7)),cloud=n*.72+f*.28;vec3 w=q+vec3(f-.5,n-.5,(n+f)*.5-.5)*.45;
  if(pattern<1.5)return .18+cloud*.65;
  if(pattern<2.5)return smoothstep(.2,.8,jNoise(vec3(q.x*1.4+f*.35,q.y*3.6,q.z*1.7))*.7+n*.3);
  if(pattern<3.5)return smoothstep(.52,.8,jNoise(q*vec3(8,2.2,3.1)+vec3(f*.7)));
  if(pattern<4.5)return smoothstep(.35,.85,cloud)*.78;
  if(pattern<5.5)return smoothstep(.28,.72,jNoise(q*1.2+vec3(f*.4)));
  if(pattern<6.5)return smoothstep(.2,.8,cloud);
  if(pattern<7.5)return .2+cloud*.48;
  if(pattern<8.5)return pow(f*.6+n*.4,1.5);
  if(pattern<9.5)return .1+pow(jNoise(w*vec3(4.2,36,4)),3.)*.65;
  if(pattern<10.5)return .08+pow(jNoise(q*11.)*.65+jNoise(q*23.+vec3(.7))*.35,2.)*.8;
  if(pattern<11.5)return smoothstep(.25,.75,jNoise(q*vec3(1.5,5.7,1.7))*.7+n*.3);
  return smoothstep(.35,.9,jNoise(w*vec3(3.2,7,3.8)+vec3(f*.8))*.66+n*.34)*.8;
 }
`;
