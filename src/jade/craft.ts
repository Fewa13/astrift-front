// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Shared, deterministic source-space layout. No client-provided weights or prices.
export type JadeLayout={kind:'bangle'|'bead'|'buddha'|'peace';size:number;face:number;point:number[]};
export const JADE_DESIGNS={
 bangle:{name:'手镯',en:'Bangle',min:40,max:68,size:54,fee:8},
 bead:{name:'珠子',en:'Bead',min:6,max:24,size:12,fee:2},
 buddha:{name:'玉佛吊坠',en:'Jade Buddha pendant',min:20,max:48,size:32,fee:12},
 peace:{name:'平安扣',en:'Peace pendant',min:16,max:40,size:26,fee:5}
} as const;
// Shared carving volumes: x/y in blank radii, z in blank depths (front = 0).
// Keeping assay and mesh on the same primitives prevents pricing invisible jade.
export const JADE_BUDDHA_PARTS=[
 [0,-.12,.52,.53,.50,.36], [0,.53,.49,.28,.28,.29], [0,.83,.5,.13,.10,.19],
 [-.29,.51,.5,.085,.19,.14],[.29,.51,.5,.085,.19,.14],
 [-.48,-.02,.48,.15,.35,.22],[.48,-.02,.48,.15,.35,.22],
 [-.29,-.29,.21,.18,.10,.13],[.29,-.29,.21,.18,.10,.13],
 [-.46,-.51,.49,.39,.23,.27],[.46,-.51,.49,.39,.23,.27],
 [0,-.74,.54,.72,.105,.27], [0,.49,.19,.065,.07,.07],
 [-.115,.57,.225,.075,.018,.028],[.115,.57,.225,.075,.018,.028],
 [-.08,.37,.225,.058,.017,.028],[0,.35,.21,.055,.015,.028],[.08,.37,.225,.058,.017,.028],
 ...Array.from({length:7},(_,i)=>[(i-3)*.19,-.69+Math.abs(i-3)*.009,.26,.115,.09,.1])
];
export function jadeBuddhaInside(x:number,y:number,z:number){return JADE_BUDDHA_PARTS.some(([cx,cy,cz,rx,ry,rz])=>((x-cx)/rx)**2+((y-cy)/ry)**2+((z-cz)/rz)**2<=1);}
export function jadeBuddhaFootprint(x:number,y:number,margin=0){return JADE_BUDDHA_PARTS.some(([cx,cy,,rx,ry])=>((x-cx)/(rx+margin))**2+((y-cy)/(ry+margin))**2<=1);}
export const JADE_BUDDHA_OUTLINE=JADE_BUDDHA_PARTS.flatMap(([cx,cy,,rx,ry],index)=>Array.from({length:96},(_,i)=>{
 const a=i/96*Math.PI*2,b=(i+1)/96*Math.PI*2,m=(a+b)/2,x=cx+rx*Math.cos(m),y=cy+ry*Math.sin(m);
 if(JADE_BUDDHA_PARTS.some(([ox,oy,,sx,sy],n)=>n!==index&&((x-ox)/sx)**2+((y-oy)/sy)**2<1))return [];
 return [[cx+rx*Math.cos(a),cy+ry*Math.sin(a),cx+rx*Math.cos(b),cy+ry*Math.sin(b)]];
}).flat());
const BUDDHA_AREA_RATIO=JADE_BUDDHA_OUTLINE.reduce((n,[x,y,u,v])=>n+x*v-u*y,0)/(2*Math.PI);
export type JadeBlank=JadeLayout&{normal:number[];u:number[];v:number[];radius:number;inner:number;depth:number};
// A batch size, not a lifetime limit. A material may be worked repeatedly.
export const CRAFT_LIMIT=12;
const dot=(a:number[],b:number[])=>a.reduce((s,x,i)=>s+x*b[i],0);
const cross=(a:number[],b:number[])=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=(a:number[])=>{const l=Math.hypot(...a);return a.map(x=>x/l);};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export function jadeMillimeters(weight:number){return 58*Math.cbrt(weight);}
export function jadeFractures(a:any){
 let seed=(a.seed^0x37ba81)|0;const r=()=>{seed=Math.imul(seed^seed>>>16,0x45d9f3b);seed=Math.imul(seed^seed>>>16,0x45d9f3b);seed^=seed>>>16;return (seed>>>0)/4294967296;};
 return Array.from({length:Math.min(4,Math.floor(a.cracks*4.5))},()=>({normal:norm([r()*2-1,r()*2-1,r()*2-1]),offset:(r()-.5)*1.25,phase:r()*6.28}));
}
export function fractureDistance(f:any,p:number[]){return dot(f.normal,p)+f.offset+.025*Math.sin(p[0]*9+p[1]*7+p[2]*5+f.phase);}
export function jadeCoverageAt(a:any,p:number[]){if(a.grade===0)return 0;const phase=(a.seed%997)/997*Math.PI*2,x=p[0]-(a.coreX-50)*.025,y=p[1]-Math.sin(phase)*.12,z=p[2]-Math.cos(phase*1.7)*.2,c=Math.cos(a.coreAngle*Math.PI/180),s=Math.sin(a.coreAngle*Math.PI/180);return clamp(1.3-((x*c+y*s)/(.4+a.core*.68))**2-((-x*s+y*c)/(.6+a.core*.65))**2-(z/(.48+a.core*.65))**2+Math.sin(p[0]*5+Math.sin(p[1]*4)*2+phase)*Math.cos(p[2]*5+p[1]*3-phase)*.15);}
function originalInside(a:any,p:number[]){const q=[p[0]/1.42,p[1]/1.04,p[2]/.96],r=Math.hypot(...q);if(r<1e-8)return true;const [x,y,z]=q.map(x=>x/r),ph=(a.seed%997)/997*Math.PI*2;return r<=1+.065*Math.sin(x*4+y*3+ph)*Math.cos(z*4-ph)+.045*Math.cos(y*6-z*3+ph)+.025*Math.sin(z*9+x*5)-.009;}
export function inJadeBlank(b:JadeBlank,p:number[],margin=0){const d=p.map((x,i)=>x-b.point[i]),t=-dot(d,b.normal),x=dot(d,b.u),y=dot(d,b.v),r=Math.hypot(x,y);return t>=-margin&&t<=b.depth+margin&&(b.kind==='buddha'?jadeBuddhaFootprint(x/b.radius,y/b.radius,margin/b.radius):r<=b.radius+margin&&(b.inner===0||r>=b.inner-margin));}
export function makeJadeBlank(s:any,piece:any,layout:any):JadeBlank|null{
 const design=layout&&typeof layout.kind==='string'&&Object.hasOwn(JADE_DESIGNS,layout.kind)?JADE_DESIGNS[layout.kind as keyof typeof JADE_DESIGNS]:null;
 if(!design||!Number.isFinite(layout.size)||layout.size<design.min||layout.size>design.max||!Number.isInteger(layout.face)||!Array.isArray(layout.point)||layout.point.length!==3||!layout.point.every((x:any)=>typeof x==='number'&&Number.isFinite(x)&&Math.abs(x)<2))return null;
 const face=piece.path[layout.face];if(!face||Math.abs(dot(face.normal,layout.point)+face.constant)>.003)return null;
 const normal=face.normal.map((x:number)=>-face.side*x),u=norm(cross(normal,Math.abs(normal[1])<.9?[0,1,0]:[1,0,0])),v=cross(normal,u),mm=jadeMillimeters(s.weight),radius=(layout.kind==='bangle'?layout.size/2+8:layout.size/2)/mm,inner=layout.kind==='bangle'?layout.size/2/mm:layout.kind==='peace'?radius*.20:0,depth=(layout.kind==='bangle'?12:layout.kind==='peace'?layout.size*.24:layout.kind==='buddha'?layout.size*.36:layout.size)/mm;
 // Snap to the server-owned cut plane; never let a forged normal choose another face.
 const error=dot(face.normal,layout.point)+face.constant,point=layout.point.map((x:number,i:number)=>x-face.normal[i]*error);
 return {kind:layout.kind,size:layout.size,face:layout.face,point,normal,u,v,radius,inner,depth};
}
export function jadeBlankPoint(b:JadeBlank,r:number,t:number,angle:number){return b.point.map((x,i)=>x+b.u[i]*r*Math.cos(angle)+b.v[i]*r*Math.sin(angle)-b.normal[i]*t);}
export function assessJadeBlank(s:any,piece:any,layout:any){
 const blank=makeJadeBlank(s,piece,layout);if(!blank)return {valid:false,error:'Choose a flat cut face'};
 const b=blank,a=s.jade||s.model,fractures=jadeFractures(a),ranges=fractures.map(()=>[Infinity,-Infinity]);let purity=0,count=0,blankJade=0,blankSamples=0,shapeSamples=0,totalShapeSamples=0;
 const available=(p:number[])=>originalInside(a,p)&&piece.path.every((f:any)=>(dot(f.normal,p)+f.constant)*f.side>=-.0001)&&!(piece.holes||[]).some((h:any)=>inJadeBlank(h,p,.006));
 // Full-depth and full-circumference checks, not a 2D circle or a centre ray.
 for(let z=0;z<=4;z++)for(let ring=0;ring<=4;ring++)for(let j=0;j<48;j++){
  const radius=Math.sqrt(b.inner*b.inner+(b.radius*b.radius-b.inner*b.inner)*ring/4),p=jadeBlankPoint(b,radius,b.depth*z/4,j/48*Math.PI*2);
  if(b.kind==='buddha'&&!inJadeBlank(b,p,.00001))continue;
  if(!available(p))return {valid:false,error:'Not enough solid material',blank:b};
  blankJade+=jadeCoverageAt(a,p);blankSamples++;
 }
 // Two layouts cannot overlap, even if a tiny previous blank falls between samples.
 if(b.kind==='buddha')for(const [x,y]of JADE_BUDDHA_OUTLINE)for(const t of [0,b.depth/2,b.depth]){const p=b.point.map((v,k)=>v+b.u[k]*x*b.radius+b.v[k]*y*b.radius-b.normal[k]*t);if(!available(p))return {valid:false,error:'Not enough solid material',blank:b};}
 for(const h of piece.holes||[])for(let z=0;z<=2;z++)for(let r=0;r<=2;r++)for(let j=0;j<24;j++){const p=jadeBlankPoint(h,Math.sqrt(h.inner*h.inner+(h.radius*h.radius-h.inner*h.inner)*r/2),h.depth*z/2,j/24*Math.PI*2);if(inJadeBlank(h,p,.00001)&&inJadeBlank(b,p,.006))return {valid:false,error:'Overlaps a previous cut',blank:b};}
 // Assay the finished shape, not the cylindrical waste removed by the machine.
 for(let z=0;z<9;z++){
  const t=b.depth*(.03+.94*(z+.5)/9),outer=b.kind==='bead'?Math.sqrt(Math.max(0,(b.radius*.97)**2-(t-b.depth/2)**2)):b.radius-(b.radius-b.inner)*.015,inner=b.kind==='bead'?b.radius*.11:b.inner+(b.radius-b.inner)*.015,area=Math.max(0,outer*outer-inner*inner);
  for(let ring=0;ring<5;ring++)for(let j=0;j<48;j++){const angle=j/48*Math.PI*2,r=Math.sqrt(inner*inner+area*(ring+.5)/5),p=jadeBlankPoint(b,r,t,angle);totalShapeSamples++;if(b.kind==='buddha'&&!jadeBuddhaInside(r*Math.cos(angle)/b.radius,r*Math.sin(angle)/b.radius,t/b.depth))continue;shapeSamples++;purity+=jadeCoverageAt(a,p)*area;count+=area;fractures.forEach((f,i)=>{const d=fractureDistance(f,p);ranges[i][0]=Math.min(ranges[i][0],d);ranges[i][1]=Math.max(ranges[i][1],d);});}
 }
 const crackCount=ranges.filter(([lo,hi])=>lo<.008&&hi>-.008).length,cylinder=Math.PI*(b.radius*b.radius-b.inner*b.inner)*b.depth,volume=cylinder*(b.kind==='buddha'?BUDDHA_AREA_RATIO:1),productVolume=b.kind==='bead'?volume*.60:b.kind==='buddha'?cylinder*shapeSamples/totalShapeSamples*.94:volume*.94;
 return {valid:true,blank:b,purity:purity/count,blankPurity:blankJade/blankSamples,crackCount,volume,productVolume,error:''};
}
export function assessJadePlan(s:any,piece:any,layouts:JadeLayout[]){
 const holes=[...(piece.holes||[])],items=[];
 if(layouts.length>CRAFT_LIMIT)return {valid:false,items:[],error:'Craft batch limit reached'};
 for(const layout of layouts){const item=assessJadeBlank(s,{...piece,holes},layout);items.push(item);if(item.valid&&item.blank)holes.push(item.blank);}
 return {valid:layouts.length>0&&items.every(i=>i.valid),items,error:items.find(i=>!i.valid)?.error||''};
}
