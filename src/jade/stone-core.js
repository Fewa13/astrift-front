// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Ported from Felix’s jade-night-market; market and account systems excluded.
import {jadeVariety,jadeUnitPrice,JADE_PRICE_RATES,JADE_PRICE_CAP} from './varieties.ts';
export const GRADES = [
 {name:'普通石料',short:'石',color:'#a8a391',rate:4,desc:'颗粒粗、几乎不透光。也有属于它的朴实。'},
 {name:'豆种',short:'豆',color:'#8dba76',rate:50,desc:'晶体如豆，青绿质朴，适合入门把玩。'},
 {name:'糯种',short:'糯',color:'#a8d9ad',rate:140,desc:'如糯米汤般温润，细腻柔和，颇有韵味。'},
 {name:'糯冰种',short:'润',color:'#72d6b0',rate:350,desc:'糯意渐退，冰感初生，温润与清透兼具。'},
 {name:'冰种',short:'冰',color:'#5fe5c1',rate:850,desc:'似冰清透，光影流转，已是难得的好料。'},
 {name:'玻璃种',short:'璃',color:'#c0ffe9',rate:1800,desc:'晶莹通透，宛若凝固的清泉，可遇而不可求。'}
];
for(const [i,g]of GRADES.entries())g.rate=JADE_PRICE_RATES[i];
export const ORIGINS=[{name:'莫西沙',skin:'灰白砂皮',color:'#86857a',bias:.10,tip:'砂感细密，留意脱砂与棉絮。'}, {name:'木那',skin:'黄盐砂皮',color:'#aa9270',bias:.04,tip:'皮壳偏薄，留意点状棉与色带。'}, {name:'会卡',skin:'青灰蜡皮',color:'#65786c',bias:-.01,tip:'表面光滑，留意水头与细裂。'}, {name:'后江',skin:'乌黑薄皮',color:'#555c55',bias:.07,tip:'小料见长，色与裂往往相伴。'}];
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function rng(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
export function phase3D(a){return (a.seed%997)/997*Math.PI*2;}
export function core3D(a){const phase=phase3D(a);return {x:(a.coreX-50)*.025,y:Math.sin(phase)*.12,z:Math.cos(phase*1.7)*.2};}
export function volumeSample3D(a,p){
 const phase=phase3D(a),angle=a.coreAngle*Math.PI/180,center=core3D(a),x=p.x-center.x,y=p.y-center.y,z=p.z-center.z;
 const u=x*Math.cos(angle)+y*Math.sin(angle),v=-x*Math.sin(angle)+y*Math.cos(angle);
 const cloud=Math.sin(p.x*5+Math.sin(p.y*4)*2+phase)*Math.cos(p.z*5+p.y*3-phase);
 const coverage=clamp(1.3-(u/(.4+a.core*.68))**2-(v/(.6+a.core*.65))**2-(z/(.48+a.core*.65))**2+cloud*.15,0,1);
 const strength=a.grade===0?.025:Math.max(.015,([.025,.18,.38,.55,.76,.93][a.grade])*coverage);
 return {coverage,strength,label:a.grade===0||coverage<.12?'此处黄白弱光，透入很浅，暂未见明显绿色。':a.grade===1?'见绿但颗粒粗、透光短，低种水料，不要只因颜色追价。':strength>.45?'此处清绿透亮，光晕向内延伸，仍需留意棉裂。':strength>.19?'此处有柔和青绿，透光一般，继续转动看看别的面。':'此处略见浅绿，光晕较短，厚皮或颗粒影响透光。'};
}
export const pieceName=id=>'料 '+id.split('').map(x=>x==='0'?'A':'B').join('');
const shares=(xs,fallback=[.5,.5])=>Array.isArray(xs)&&xs.length===2&&xs.every(x=>Number.isFinite(x)&&x>.001&&x<1)&&Math.abs(xs[0]+xs[1]-1)<.001?xs:fallback;
export function ensureCutPieces(a){
 if(a.stage!=='cut')return [];
 if(a.cut.pieces)return a.cut.pieces;
 const rad=a.cut.angle*Math.PI/180,plane=a.cut.plane3d??{normal:[Math.cos(rad),-Math.sin(rad),0],constant:-(a.cut.position-50)*.025};
 const mass=shares(plane.massShares),jade=shares(plane.jadeShares,mass),first=Math.floor(a.cut.value*jade[0]);
 a.cut.pieces=[0,1].map((i)=>({id:String(i),path:[{normal:[...plane.normal],constant:plane.constant,side:i===0?1:-1}],weight:a.weight*mass[i],jadeWeight:a.cut.weight*jade[i],value:i===0?first:a.cut.value-first,discount:1,depth:1}));
 if(a.cut.pricingVersion===2){for(const p of a.cut.pieces)p.value=Math.floor(p.jadeWeight*jadeUnitPrice(a.grade,a.color,a.variety)*(a.cut.pricingScale??1)*p.discount);a.cut.value=a.cut.pieces.reduce((n,p)=>n+p.value,0);}
 a.cut.rounds??=1;return a.cut.pieces;
}
export function recutFee(a,id){const p=ensureCutPieces(a).find(p=>p.id===id);return p?Math.max(20,Math.min(100,Math.ceil((p.weight*18+p.depth*8)/5)*5)):0;}
export function canRecut(a,id){const p=ensureCutPieces(a).find(p=>p.id===id);return !!p&&p.weight>=.08&&p.depth<5&&a.cut.pieces.length<16;}
export function sizeDiscount(jadeKg){return .45+.5*Math.min(1,Math.sqrt(Math.max(0,jadeKg)/2));}
export function validVolumeAssay(a){return !!(a&&a.version===2&&Number.isFinite(a.solidVolume)&&a.solidVolume>0&&Number.isFinite(a.jadeVolume)&&a.jadeVolume>=0&&a.jadeVolume<=a.solidVolume*1.000001);}
export function applyVolumeAssay(a,assay,measurements){
 if(!validVolumeAssay(assay))throw Error('玉肉体积无效。');
 const pieces=ensureCutPieces(a),retention=1-a.cracks*.45;
 for(const p of pieces){
  const m=measurements[p.id];if(!m||!Number.isFinite(m.jade)||m.jade<0)throw Error('子料体积无效。');
  p.jadeWeight=a.weight*(a.grade===0?m.volume:m.jade)/assay.solidVolume*retention*Math.pow(.97,p.depth);
  p.value=Math.floor(p.jadeWeight*jadeUnitPrice(a.grade,a.color,a.variety)*(a.cut.pricingScale??1)*p.discount);
 }
 const sum=pieces.reduce((n,p)=>n+p.value,0);if(sum>JADE_PRICE_CAP){const factor=JADE_PRICE_CAP/sum;for(const p of pieces)p.value=Math.floor(p.value*factor);a.cut.pricingScale=(a.cut.pricingScale??1)*factor;}a.cut.value=pieces.reduce((n,p)=>n+p.value,0);a.cut.weight=pieces.reduce((n,p)=>n+p.jadeWeight,0);a.cut.yieldRate=a.cut.weight/a.weight;a.cut.pricingVersion=2;a.cut.assay={...assay,retention,kerf:.97};
}
