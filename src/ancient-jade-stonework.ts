// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Original Jade Night Market mesh, material and volume algorithm; Ancient economy.
import {JADE_VARIETIES,jadeVariety,rollJadeVariety,jadePigment,jadeUnitPrice,JADE_PRICE_CAP,JADE_PRICE_RATES} from './jade/varieties';
export {JADE_VARIETIES,jadeVariety,jadePigment,jadeUnitPrice,JADE_PRICE_CAP,JADE_PRICE_RATES} from './jade/varieties';
import type {AncientProfile} from './ancient-rules';
import {rollJadeQuality,jadeQualitySummary,priceJadeProduct} from './ancient-jade-quality';
import {collectionFits,BEAD_LIMIT,type JadeCollectible} from './ancient-collections';
import {assayJadeStone} from './jade/server-geometry.js';
import {assessJadeBlank,jadeFractures,fractureDistance,CRAFT_LIMIT,JADE_DESIGNS,type JadeBlank} from './jade/craft';
export {JADE_DESIGNS,assessJadeBlank,assessJadePlan,makeJadeBlank,jadeMillimeters,jadeFractures,fractureDistance,jadeBlankPoint,inJadeBlank} from './jade/craft';
export const ROUGH_STONES:Record<string,{name:string;en:string;sell:number;cut:number;window:number;bias:number}>={roughStone:{name:'山纹原石',en:'Striated Rough',sell:8,cut:3,window:2,bias:0},roughDark:{name:'乌皮原石',en:'Darkskin Rough',sell:14,cut:5,window:3,bias:.04},roughMoon:{name:'月纹原石',en:'Moonvein Rough',sell:24,cut:8,window:5,bias:.1}};
export const JADE_GRADES=[{name:'普通石料',en:'Common Stone',rate:4,color:'#aaa28c'},{name:'豆种玉',en:'Grain Jade',rate:50,color:'#8dba76'},{name:'糯种玉',en:'Soft Jade',rate:140,color:'#a8d9ad'},{name:'糯冰玉',en:'Mist Jade',rate:350,color:'#72d6b0'},{name:'冰种玉',en:'Ice Jade',rate:850,color:'#5fe5c1'},{name:'玻璃玉',en:'Crystal Jade',rate:1800,color:'#c0ffe9'}];
for(const [i,g]of JADE_GRADES.entries())g.rate=JADE_PRICE_RATES[i];
export type StonePlane={normal:number[];constant:number};
export type StonePiece={id:string;path:(StonePlane&{side:number})[];weight:number;jadeWeight:number;value:number;discount:number;depth:number;holes?:JadeBlank[];processedRecut?:boolean;workedDiscount?:boolean};
export type JadeProduct={quality?:number;baseValue?:number;qualityPriceVersion?:number;id:string;blank:JadeBlank;weight:number;value:number;purity:number;crackCount:number;fee:number;materialValue?:number;pricingVersion?:number};
export type Stone={id:string;source:string;variety?:string;seed:number;weight:number;grade:number;coverage:number;color:number;cracks:number;lit:boolean;window:boolean;pose?:number[];cut?:{position:number;angle:number;plane?:StonePlane;pose?:number[];weight:number;value:number;retention:number;assayVersion?:number;pricingVersion?:number;pricingScale?:number;jadeRatio?:number;faceJadeRatio?:number;assay?:{solidVolume:number;jadeVolume:number};pieces?:StonePiece[];rounds?:number};cost:number;products?:JadeProduct[];craftRequests?:string[];craftRealized?:number;craftCollected?:number;craftBaseRealized?:number;craftBaseCollected?:number};
export type StoneworkState={stones:Stone[];receipts:{id:string;stone:string}[];collection?:Record<string,{count:number;best:number;grade:number}>};
export type StoneInterior={center:number[];radii:number[];phase:number;color:number;cracks:number;grade:number;angle?:number};
export function validStonePlane(p:unknown):p is StonePlane{if(!p||typeof p!=='object')return false;const v=p as StonePlane;return Array.isArray(v.normal)&&v.normal.length===3&&v.normal.every(n=>typeof n==='number'&&Number.isFinite(n))&&typeof v.constant==='number'&&Number.isFinite(v.constant)&&Math.abs(Math.hypot(...v.normal)-1)<.001&&Math.abs(v.constant)<=Math.hypot(v.normal[0]*1.42,v.normal[1]*1.04,v.normal[2]*.96)*.90;}
export function validStonePose(p:unknown):p is number[]{return Array.isArray(p)&&p.length===4&&p.every(n=>typeof n==='number'&&Number.isFinite(n))&&Math.abs(Math.hypot(...p)-1)<.001;}
export function stoneRng(seed:number){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
export function jadeStoneModel(s:Stone){const r=stoneRng(s.seed^0x518ac7);return {seed:s.seed%997,origin:s.seed%4,grade:s.grade,core:s.coverage,coreX:30+r()*40,coreAngle:-35+r()*70,color:s.color,cracks:s.cracks,weight:s.weight,...(s.grade&&jadeVariety(s.variety)?{variety:s.variety}: {})};}
export function stoneInterior(s:Stone):StoneInterior{const a=jadeStoneModel(s),phase=a.seed/997*Math.PI*2;return {center:[(a.coreX-50)*.025,Math.sin(phase)*.12,Math.cos(phase*1.7)*.2],radii:[.4+a.core*.68,.6+a.core*.65,.48+a.core*.65],phase,color:s.color,cracks:s.cracks,grade:s.grade,angle:a.coreAngle*Math.PI/180};}
export function stoneCoverage(f:StoneInterior,p:number[]){if(f.grade===0)return 0;const x=p[0]-f.center[0],y=p[1]-f.center[1],z=p[2]-f.center[2],c=Math.cos(f.angle||0),s=Math.sin(f.angle||0),q=[(x*c+y*s)/f.radii[0],(-x*s+y*c)/f.radii[1],z/f.radii[2]],cloud=Math.sin(p[0]*5+Math.sin(p[1]*4)*2+f.phase)*Math.cos(p[2]*5+p[1]*3-f.phase);return Math.max(0,Math.min(1,1.3-q.reduce((n,v)=>n+v*v,0)+cloud*.15));}
export function insideRough(s:Stone,p:number[]){const q=[p[0]/1.42,p[1]/1.04,p[2]/.96],r=Math.hypot(...q);if(r<1e-9)return true;const [x,y,z]=q.map(n=>n/r),phase=(s.seed%997)/997*Math.PI*2,d=1+.065*Math.sin(x*4+y*3+phase)*Math.cos(z*4-phase)+.045*Math.cos(y*6-z*3+phase)+.025*Math.sin(z*9+x*5);return r<=d;}
export function stoneJadeRatio(s:Stone){if(s.grade===0)return 0;const m=assayJadeStone(jadeStoneModel(s)).total;return m.jade/m.volume;}
function planeOf(s:Stone):StonePlane{return s.cut?.plane||{normal:[1,0,0],constant:-((s.cut?.position||50)-50)/55};}
export function stoneFaceJadeRatio(s:Stone){if(!s.cut||!s.grade)return 0;const plane=planeOf(s),n=plane.normal,ref=Math.abs(n[1])<.9?[0,1,0]:[1,0,0],cross=(a:number[],b:number[])=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],u=cross(n,ref),len=Math.hypot(...u);for(let i=0;i<3;i++)u[i]/=len;const v=cross(n,u),f=stoneInterior(s);let solid=0,jade=0;for(let i=0;i<16;i++)for(let j=0;j<16;j++){const a=((i+.5)/16*2-1)*1.6,b=((j+.5)/16*2-1)*1.6,p=n.map((x,k)=>-plane.constant*x+u[k]*a+v[k]*b);if(insideRough(s,p)){solid++;jade+=stoneCoverage(f,p);}}return jade/Math.max(1,solid);}
export function updateStoneAssay(s:Stone,measurement?:ReturnType<typeof assayJadeStone>){if(!s.cut||s.cut.assayVersion===2)return false;const plane=planeOf(s),m=measurement||assayJadeStone(jadeStoneModel(s),plane),mass=m.massShares||[.5,.5],jade=m.jadeShares||mass,ratio=s.grade===0?1:m.total.jade/m.total.volume,retention=(1-s.cracks*.45)*.97,total=s.weight*ratio*retention;s.cut.retention=retention;s.cut.jadeRatio=s.grade===0?0:ratio;s.cut.assay={solidVolume:m.total.volume,jadeVolume:m.total.jade};s.cut.pieces=[0,1].map(i=>({id:String(i),path:[{normal:[...plane.normal],constant:plane.constant,side:i===0?1:-1}],weight:s.weight*mass[i],jadeWeight:total*jade[i],value:Math.floor(total*jade[i]*JADE_GRADES[s.grade].rate*s.color*(jadeVariety(s.variety)?.multiplier||1)),discount:1,depth:1}));s.cut.rounds=1;s.cut.weight=s.cut.pieces.reduce((n,p)=>n+p.jadeWeight,0);s.cut.value=s.cut.pieces.reduce((n,p)=>n+p.value,0);s.cut.faceJadeRatio=stoneFaceJadeRatio(s);s.cut.assayVersion=2;updateStonePrice(s);return true;}
export function updateStonePrice(s:Stone){if(!s.cut?.pieces||s.cut.pricingVersion===3)return false;const unit=jadeUnitPrice(s.grade,s.color,s.variety),raw=s.cut.pieces.reduce((n,p)=>n+p.jadeWeight*unit*p.discount,0);s.cut.pricingScale=Math.min(1,JADE_PRICE_CAP/Math.max(1,raw));for(const p of s.cut.pieces)p.value=Math.floor(p.jadeWeight*unit*p.discount*s.cut.pricingScale);s.cut.value=s.cut.pieces.reduce((n,p)=>n+p.value,0);s.cut.pricingVersion=3;return true;}
// Anchor craftsmanship to consumed material; do not square purity and erase small beads.
export function jadeProductValue(materialValue:number,purity:number,cracks:number,fee:number,grade:number,kind:string){
 const quality=Math.max(0,Math.min(1,purity)),premium=(kind==='bangle'?1.8:1.6)+quality*.6,sound=grade>0&&quality>=.25;
 return Math.max(1,Math.floor((materialValue*(sound?premium:.65+quality)+(sound?fee*1.5:0))*Math.max(.05,Math.pow(.35,Math.max(0,Math.floor(cracks))))));
}
function updateProductPrices(s:Stone){
 if(!s.cut?.pieces||!s.products?.length)return false;let changed=false;
 let budget=Math.max(0,JADE_PRICE_CAP-(s.craftBaseRealized??s.craftRealized??0)-(s.craftBaseCollected??s.craftCollected??0)-s.cut.value-s.products.reduce((n,p)=>n+(p.baseValue??p.value),0));
 for(const p of s.products){if(p.pricingVersion===3&&p.value>=1)continue;
  const piece=s.cut.pieces.find(v=>v.path[p.blank.face]&&Math.abs(v.path[p.blank.face].normal.reduce((n,x,i)=>n+x*p.blank.point[i],v.path[p.blank.face].constant))<.003);
  const assay=piece?assessJadeBlank({...s,model:jadeStoneModel(s)},{...piece,holes:[]},p.blank):null;
  const unit=jadeUnitPrice(s.grade,s.color,s.variety)*(s.cut.pricingScale??1);
  p.materialValue??=Math.ceil(p.weight/(p.blank.kind==='bead'?.60:.94)*(assay?.blankPurity??p.purity)*unit*(piece?.discount??.7));
  const target=jadeProductValue(p.materialValue,p.purity,p.crackCount,p.fee,s.grade,p.blank.kind),increase=Math.min(budget,Math.max(0,target-p.value));
  p.value+=increase;budget-=increase;
  // Repair old zero quotes even when the original stone already fills its cap.
  if(p.value===0){const donor=s.cut.pieces.find(v=>v.value>0);if(donor){donor.value--;s.cut.value--;p.value=1;}else{const donor=s.products.find(v=>v!==p&&v.value>1);if(donor){donor.value--;p.value=1;}}}
  p.pricingVersion=3;changed=true;
 }
 for(const p of s.products)changed=priceJadeProduct(p,jadeStoneModel(s))||changed;
 return changed;
}
export function updateStoneworkAssays(state:StoneworkState){let changed=false;for(const s of state.stones){if(s.craftBaseRealized===undefined||s.craftBaseCollected===undefined){s.craftBaseRealized??=s.craftRealized||0;s.craftBaseCollected??=s.craftCollected||0;changed=true;}const measured=updateStoneAssay(s),priced=updateStonePrice(s),products=updateProductPrices(s);changed=measured||priced||products||changed;}return changed;}
export function makeRoughStone(source:string,seed:number,id:string=crypto.randomUUID()):Stone{const r=stoneRng(seed),q=r(),b=ROUGH_STONES[source].bias,grade=q<.48-b?0:q<.75-b*.5?1:q<.91-b*.25?2:q<.97-b*.1?3:q<.995-b*.025?4:5;return {id,source,seed,grade,weight:Math.round((.45+r()*2.25)*100)/100,coverage:.22+r()*.58,color:.55+r()*.45,cracks:r(),lit:false,window:false,cost:0,...(grade?{variety:rollJadeVariety(stoneRng(seed^0x63bd912)())}:{})};}
export function stoneView(s:Stone){const windowCoverage=s.window?stoneCoverage(stoneInterior(s),[.32*.78,.12*.78,.92*.78]):0;return {id:s.id,source:s.source,weight:s.weight,lit:s.lit,window:s.window,cost:s.cost,skin:s.seed%4,shapeSeed:s.seed%997,pose:s.pose,...(s.cut?{quote:s.cut.value}:{}),products:s.products||[],realized:s.craftRealized||0,collected:s.craftCollected||0,...(s.window?{windowTint:jadePigment(s.variety,[.32,.12,.92],stoneInterior(s).phase,true),windowCoverage,signal:windowCoverage>.14?'bright':'dull',cracked:s.cracks>.65}:{}),...(s.cut?{variety:s.variety,grade:s.grade,cut:s.cut,interior:stoneInterior(s),jade:jadeStoneModel(s)}:{})};}
export function stoneworkView(state:StoneworkState){return state.stones.map(stoneView);}
export function stoneRecutFee(s:Stone,piece:StonePiece){return Math.max(ROUGH_STONES[s.source].cut,Math.min(40,Math.ceil((piece.weight*5+piece.depth*2)/2)*2));}
export function stoneworkCommand(p:AncientProfile,state:StoneworkState,action:string,d:Record<string,unknown>,seed=crypto.getRandomValues(new Uint32Array(1))[0]):{error?:string;selected?:string;probe?:{strength:number;tint?:number[];green:boolean;cracked:boolean;coverage:number;glow:number;patch?:{size:number;radius:number;u:number[];v:number[];point:number[];pixels:number[];crackMask?:{size:number;pixels:number[]}}}}{
 if(action==='stoneList')return {};
 if(action==='stoneTake'){const source=String(d.source||''),receipt=String(d.requestId||'');if(!/^[a-zA-Z0-9-]{8,64}$/.test(receipt))return {error:'Invalid stone request'};const prior=state.receipts.find(r=>r.id===receipt);if(prior)return {selected:prior.stone};if(!Object.hasOwn(ROUGH_STONES,source)||(p.materials[source]||0)<1)return {error:'No rough stone available'};if(state.stones.length>=60)return {error:'Sell a stone first (60 stone limit)'};const stone=makeRoughStone(source,seed);p.materials[source]--;state.stones.push(stone);state.receipts.push({id:receipt,stone:stone.id});state.receipts=state.receipts.slice(-32);return {selected:stone.id};}
 const s=state.stones.find(s=>s.id===d.id);if(!s)return {error:'Stone no longer available'};const fees=ROUGH_STONES[s.source];
 if(action==='stoneProbe'){
  const point=d.point;if(!Array.isArray(point)||point.length!==3||!point.every(v=>typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<=1.8))return {error:'Invalid probe point'};
  const f=stoneInterior(s),coverage=stoneCoverage(f,point.map(v=>v*.78)),strength=s.grade===0?.025:Math.max(.015,([.025,.18,.38,.55,.76,.93][s.grade])*coverage);
  // Only a small illuminated patch is sent, never the hidden whole-stone field.
  const normal=point.map(v=>v/(Math.hypot(...point)||1)),ref=Math.abs(normal[1])<.9?[0,1,0]:[1,0,0],cross=(a:number[],b:number[])=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],u=cross(normal,ref),len=Math.hypot(...u)||1;for(let k=0;k<3;k++)u[k]/=len;const v=cross(normal,u),pixels:number[]=[],size=17,radius=.46,hex=JADE_GRADES[s.grade].color.slice(1),jade=[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255);
  const fract=(x:number)=>x-Math.floor(x),hash=(p:number[])=>fract(Math.sin(p[0]*127.1+p[1]*311.7+p[2]*74.7)*43758.5453),noise=(p:number[])=>{const a=p.map(Math.floor),b=p.map(fract).map(t=>t*t*(3-2*t));let sum=0;for(let x=0;x<2;x++)for(let y=0;y<2;y++)for(let z=0;z<2;z++)sum+=hash([a[0]+x,a[1]+y,a[2]+z])*(x?b[0]:1-b[0])*(y?b[1]:1-b[1])*(z?b[2]:1-b[2]);return sum;},smooth=(a:number,b:number,t:number)=>{t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t);};
  const fractures=jadeFractures(jadeStoneModel(s)),maskSize=49,mask:number[]=[];let visibleCrack=false,hasCrack=false;
  // A local, antialiased transmission shadow from the same immutable 3D fissures
  // used by cut surfaces and product appraisal. Never reveal the whole interior.
  if(fractures.length)for(let y=0;y<maskSize;y++)for(let x=0;x<maskSize;x++){
   const p=point.map((c,k)=>c+u[k]*((x/(maskSize-1)*2-1)*radius)+v[k]*((y/(maskSize-1)*2-1)*radius));let shadow=0;
   for(const depth of [1,.9,.78])for(const f of fractures){const distance=Math.abs(fractureDistance(f,p.map(c=>c*depth))),width=.008+radius/(maskSize-1)*depth;shadow=Math.max(shadow,(1-smooth(.003,width,distance))*(depth===1?1:depth===.9?.88:.76));}
   const value=Math.round(shadow*255);mask.push(value);if(value>12)hasCrack=true;if(value>40&&Math.hypot(x-24,y-24)<10)visibleCrack=true;
  }
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const p=point.map((c,k)=>c+u[k]*((x/(size-1)*2-1)*radius)+v[k]*((y/(size-1)*2-1)*radius)),cv=stoneCoverage(f,p.map(c=>c*.78)),cloud=noise(p.map(c=>c*6+f.phase)),stone=[.43,.46,.38],base=[.39,.50,.39],pigment=jadePigment(s.variety,p,f.phase,true);
   for(let k=0;k<3;k++){const material=stone[k]*(1-cv)+(pigment?pigment[k]*(.75+s.color*.25):base[k]*(1-s.color)+jade[k]*s.color)*cv;pixels.push(Math.round(Math.max(0,Math.min(1,material*(.85+cloud*.3)))*255));}
   pixels.push(Math.round(cv*255));
  }
  return {probe:{strength,tint:jadePigment(s.variety,point,f.phase,true)||undefined,coverage,glow:s.grade===0?.025:coverage*(.16+s.grade*.15),green:s.grade>0&&coverage>=.12,cracked:visibleCrack,patch:{size,radius,u,v,point,pixels,...(hasCrack?{crackMask:{size:maskSize,pixels:mask}}:{})}}};
 }
 if(action==='stonePose'){if(!validStonePose(d.pose))return {error:'Invalid stone pose'};s.pose=[...d.pose];return {selected:s.id};}
 if(['stoneCollectAll','stoneString','stoneStringAll'].includes(action)){
  const request=String(d.requestId||'');if(!/^[a-zA-Z0-9-]{8,64}$/.test(request))return {error:'Invalid stone request'};
  if(s.craftRequests?.includes(request))return {selected:s.id};
  const last=typeof d.lastProduct==='string'?s.products?.findIndex(p=>p.id===d.lastProduct):-1,ids=Array.isArray(d.ids)?d.ids:action!=='stoneString'&&last!==undefined&&last>=0?s.products!.slice(0,last+1).filter(p=>action==='stoneCollectAll'||p.blank.kind==='bead').map(p=>p.id):[];
  if(!ids.length||ids.some(id=>typeof id!=='string')||new Set(ids).size!==ids.length)return {error:'Choose matching loose beads'};
  const products=ids.map(id=>s.products?.find(v=>v.id===id));if(products.some(v=>!v))return {error:'Collection item not found'};
  const selected=products as JadeProduct[],created:JadeCollectible[]=[],now=Date.now(),part=(product:JadeProduct)=>({product:structuredClone(product),jade:jadeStoneModel(s)});
  if(action==='stoneCollectAll')for(const product of selected)created.push({id:'jade:'+s.id+':'+product.id,kind:product.blank.kind,quality:product.quality||1,size:product.blank.size,parts:[part(product)],value:product.value,createdAt:now});
  else{
   if(selected.some(v=>v.blank.kind!=='bead'))return {error:'Choose matching loose beads'};
   const groups=new Map<number,JadeProduct[]>();for(const v of selected){const g=groups.get(v.blank.size)||[];g.push(v);groups.set(v.blank.size,g);}
   if(action==='stoneString'&&(groups.size!==1||selected.length<2||selected.length>BEAD_LIMIT))return {error:'Use 2 to 20 matching beads'};
   for(const [size,beads]of groups){let offset=0;while(beads.length-offset>=2){const remaining=beads.length-offset,count=remaining===BEAD_LIMIT+1?BEAD_LIMIT-1:Math.min(BEAD_LIMIT,remaining),batch=beads.slice(offset,offset+count);offset+=count;created.push({id:'jade-string:'+s.id+':'+request+':'+size+':'+offset,kind:'bracelet',size,parts:batch.map(part),value:batch.reduce((n,p)=>n+p.value,0),createdAt:now});}}
   if(!created.length)return {error:'Use 2 to 20 matching beads'};
  }
  for(const item of created)item.quality=jadeQualitySummary(item).quality;
  if(!collectionFits([...(p.collections||[]),...created]))return {error:'Collection inventory limit reached'};
  const consumed=new Set(created.flatMap(i=>i.parts.map(v=>v.product.id)));p.collections=[...(p.collections||[]),...created];s.products=(s.products||[]).filter(v=>!consumed.has(v.id));s.craftBaseCollected=(s.craftBaseCollected??s.craftCollected??0)+created.reduce((n,i)=>n+i.parts.reduce((a,p)=>a+(p.product.baseValue??p.product.value),0),0);s.craftCollected=(s.craftCollected||0)+created.reduce((n,i)=>n+i.value,0);s.craftRequests??=[];s.craftRequests.push(request);return {selected:s.id};
 }
 if(action==='stoneCollect'){
  const id='jade:'+s.id+':'+String(d.product||''),product=s.products?.find(p=>p.id===d.product);
  if(!product)return p.collections?.some(i=>i.id===id)?{selected:s.id}:{error:'Collection item not found'};
  const item:JadeCollectible={id,kind:product.blank.kind,quality:product.quality||1,size:product.blank.size,parts:[{product:structuredClone(product),jade:jadeStoneModel(s)}],value:product.value,createdAt:Date.now()};
  if(!collectionFits([...(p.collections||[]),item]))return {error:'Collection inventory limit reached'};
  p.collections??=[];p.collections.push(item);s.products!.splice(s.products!.indexOf(product),1);s.craftBaseCollected=(s.craftBaseCollected??s.craftCollected??0)+(product.baseValue??product.value);s.craftCollected=(s.craftCollected||0)+product.value;
  return {selected:s.id};
 }
 if(action==='stoneProductSell'){
  const product=s.products?.find(p=>p.id===d.product);if(!product)return {selected:s.id};
  const next=Math.round(p.coins*100)+product.value*100;if(!Number.isSafeInteger(next))return {error:'Gold limit reached'};
  p.coins=next/100;s.craftBaseRealized=(s.craftBaseRealized??s.craftRealized??0)+(product.baseValue??product.value);s.craftRealized=(s.craftRealized||0)+product.value;s.products!.splice(s.products!.indexOf(product),1);return {selected:s.id};
 }
 if(action==='stoneCraft'){
  const request=String(d.requestId||'');if(!/^[a-zA-Z0-9-]{8,64}$/.test(request))return {error:'Invalid craft request'};
  if(s.craftRequests?.includes(request))return {selected:s.id};
  if(d.layouts!==undefined){
   if(!Array.isArray(d.layouts)||d.layouts.length<1||d.layouts.length>CRAFT_LIMIT||request.length>60)return {error:'Invalid craft request'};
   // Stage every cut on private copies: a late failure cannot debit or carve an earlier item.
   const staged=structuredClone(state),profile=structuredClone(p);
   for(let i=0;i<d.layouts.length;i++){
    const result=stoneworkCommand(profile,staged,'stoneCraft',{id:s.id,piece:d.piece,requestId:i?request+'-'+i:request,layout:d.layouts[i]});
    if(result.error)return result;
   }
   Object.assign(s,staged.stones.find(v=>v.id===s.id)!);Object.assign(p,profile);return {selected:s.id};
  }
  const piece=s.cut?.pieces?.find(p=>p.id===d.piece);if(!piece)return {error:'Choose a cut piece'};
  const assay=assessJadeBlank({...s,model:jadeStoneModel(s)},piece,d.layout);if(!assay.valid||!assay.blank)return {error:assay.error};
  const fee=JADE_DESIGNS[assay.blank.kind].fee;if(p.coins<fee)return {error:'Not enough Ancient Gold'};
  const density=s.weight/Math.max(.001,s.cut!.assay!.solidVolume)*Math.pow(.97,piece.depth-1),used=assay.volume!*density;
  if(used>piece.weight*.98)return {error:'Not enough solid material'};
  const purity=assay.purity!,weight=assay.productVolume!*density,jadeUsed=Math.min(piece.jadeWeight,used*assay.blankPurity!),removedValue=Math.min(piece.value,Math.ceil(piece.value*(piece.jadeWeight>.00001?jadeUsed/piece.jadeWeight:used/piece.weight)));
  const remainder=piece.value-removedValue,workedLoss=piece.workedDiscount?0:Math.ceil(remainder*.12);
  const remainingValue=s.cut!.value-removedValue-workedLoss,ceiling=Math.max(0,JADE_PRICE_CAP-(s.craftBaseRealized??s.craftRealized??0)-(s.craftBaseCollected??s.craftCollected??0)-(s.products||[]).reduce((n,p)=>n+(p.baseValue??p.value),0)-remainingValue);
  if(ceiling<1)return {error:'This stone has reached its appraisal limit'};
  const value=Math.min(ceiling,jadeProductValue(removedValue,purity,assay.crackCount!,fee,s.grade,assay.blank.kind));
  const product:JadeProduct={quality:rollJadeQuality(),id:request,blank:assay.blank,weight,value,purity,crackCount:assay.crackCount!,fee,materialValue:removedValue,pricingVersion:3};
  priceJadeProduct(product,jadeStoneModel(s));
  piece.holes??=[];piece.holes.push(assay.blank);piece.weight=Math.max(0,piece.weight-used);piece.jadeWeight-=jadeUsed;piece.value-=removedValue+workedLoss;if(!piece.workedDiscount){piece.discount*=.88;piece.workedDiscount=true;}
  s.cut!.value=remainingValue;s.cut!.weight=s.cut!.pieces!.reduce((n,p)=>n+p.jadeWeight,0);s.cost+=fee;p.coins=Math.round((p.coins-fee)*100)/100;
  s.products??=[];s.products.push(product);s.craftRequests??=[];s.craftRequests.push(request);return {selected:s.id};
 }
 if(action==='stoneDiscard'){if(s.cut)return {error:'Only unopened rough stones can be discarded'};state.stones.splice(state.stones.indexOf(s),1);return {};}
 if(action==='stoneSell'){if(!s.cut)return {error:'Uncut stones cannot be sold to the shop'};const value=s.cut.value+(s.products||[]).reduce((n,p)=>n+p.value,0),next=Math.round(p.coins*100)+value*100;if(!Number.isSafeInteger(next))return {error:'Gold limit reached'};p.coins=next/100;state.stones.splice(state.stones.indexOf(s),1);return {};}
 if(action==='stoneRecut'){
  if(!s.cut?.pieces)return {error:'Choose a cut piece'};const id=String(d.piece||''),piece=s.cut.pieces.find(v=>v.id===id);if(!piece){if(s.cut.pieces.some(v=>v.id.startsWith(id)&&id&&/^[01]{1,5}$/.test(id)))return {selected:s.id};return {error:'Choose a cut piece'};}
  if(piece.processedRecut)return {error:'Processed recut already used'};
  if(piece.weight<.08||(!piece.holes?.length&&(piece.depth>=5||s.cut.pieces.reduce((n,p)=>n+(p.processedRecut?.5:1),0)>=16)))return {error:'Piece too small to recut'};
  if(!validStonePlane(d.plane)||!validStonePose(d.pose))return {error:'Invalid cut line'};const plane=d.plane,fee=stoneRecutFee(s,piece);if(p.coins<fee)return {error:'Not enough Ancient Gold'};
  const measured=assayJadeStone(jadeStoneModel(s),plane,piece.path,piece.holes||[]);if(!measured.valid)return {error:'Invalid cut line'};const mass=measured.massShares!,jade=measured.jadeShares!,children=[0,1].map(i=>{const jadeWeight=piece.jadeWeight*jade[i]*.97,discount=Math.min(piece.discount*.94,.45+.5*Math.min(1,Math.sqrt(jadeWeight/2)));return {id:piece.id+i,path:[...piece.path,{normal:[...plane.normal],constant:plane.constant,side:i===0?1:-1}],weight:piece.weight*mass[i]*.97,jadeWeight,value:Math.max(0,Math.min(Math.floor(piece.value*jade[i]*.97*.94),Math.floor(jadeWeight*jadeUnitPrice(s.grade,s.color,s.variety)*(s.cut!.pricingScale??1)*discount))),discount,depth:piece.depth+1,...(piece.workedDiscount?{workedDiscount:true}:{}),...(piece.holes?.length?{holes:structuredClone(piece.holes),processedRecut:true}:{})};});
  p.coins=Math.round((p.coins-fee)*100)/100;s.cost+=fee;s.pose=[...d.pose];s.cut.pieces.splice(s.cut.pieces.indexOf(piece),1,...children);s.cut.rounds=(s.cut.rounds||1)+1;s.cut.value=s.cut.pieces.reduce((n,p)=>n+p.value,0);s.cut.weight=s.cut.pieces.reduce((n,p)=>n+p.jadeWeight,0);return {selected:s.id};
 }
 if(s.cut)return {selected:s.id};if(action==='stoneLight'){s.lit=true;return {selected:s.id};}if(action!=='stoneWindow'&&action!=='stoneCut')return {error:'Unknown stone tool'};if(action==='stoneWindow'&&s.window)return {selected:s.id};
 const position=Number(d.position??50),angle=Number(d.angle??0);if(action==='stoneCut'&&(!Number.isFinite(position)||position<20||position>80||!Number.isFinite(angle)||angle< -90||angle>90))return {error:'Invalid cut line'};
 if(action==='stoneCut'&&d.plane!==undefined&&(!validStonePlane(d.plane)||!validStonePose(d.pose)))return {error:'Invalid cut line'};const fee=action==='stoneWindow'?fees.window:fees.cut;if(p.coins<fee)return {error:'Not enough Ancient Gold'};
 const cutPlane=(d.plane as StonePlane|undefined)||{normal:[1,0,0],constant:-(position-50)/55},measurement=action==='stoneCut'?assayJadeStone(jadeStoneModel(s),cutPlane):undefined;if(measurement&&!measurement.valid)return {error:'Invalid cut line'};
 p.coins=Math.round((p.coins-fee)*100)/100;s.cost+=fee;if(action==='stoneWindow'){s.window=true;return {selected:s.id};}const plane=d.plane as StonePlane|undefined;s.cut={position,angle,...(plane?{plane:{normal:[...plane.normal],constant:plane.constant},pose:[...(d.pose as number[])]}:{}),weight:0,value:0,retention:0};if(validStonePose(d.pose))s.pose=[...d.pose];updateStoneAssay(s,measurement);if(s.grade>0&&s.variety){state.collection??={};const old=state.collection[s.variety]||{count:0,best:0,grade:0};state.collection[s.variety]={count:Math.min(999999999,old.count+1),best:Math.max(old.best,s.cut.value),grade:Math.max(old.grade,s.grade)};}return {selected:s.id};
}
