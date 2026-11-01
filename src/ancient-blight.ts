// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {ancientBaseAttack,ancientBaseHealth} from './ancient-gear.js';
import {ancientBossHealth} from './ancient-boss-stats.js';
import {ancientMobHealth,ancientMobDamageScale} from './ancient-mob-stats.js';
import type {AncientProfile} from './ancient-rules';
// Run only after a destination connection has passed its ticket/access checks.
// Old saves can only have acquired corruption in Blight, so retain it on reconnect.
export function corruptionMapEntry(p:AncientProfile,map:string){
 if(!p.corrupted){delete p.corruptedMap;return false;}
 if(map===(p.corruptedMap||'blight')){p.corruptedMap=map;return false;}
 p.corrupted=false;delete p.corruptedMap;return true;
}
export const BLIGHT_LEVEL=90;
export const BLIGHT_KINDS:Record<string,{name:string;en:string;size:number;range:number;speed:number;boss:boolean}>={
 blight_beast:{name:'轻蚀兽',en:'Blight-Touched Beast',size:1.15,range:2.6,speed:4,boss:false},
 blight_stalker:{name:'根脉潜伏者',en:'Rootvein Stalker',size:1.5,range:3.2,speed:4.4,boss:false},
 rift_maw:{name:'裂口魔物',en:'Riftmaw',size:1.8,range:3.6,speed:4.6,boss:false},
 blight_lord:{name:'蚀心领主',en:'The Blightheart Lord',size:4.2,range:12,speed:3.7,boss:true}
};
export const BLIGHT_HOUSES=[-1,1].flatMap(side=>[235,290,345].map(z=>({x:side*30,z,w:18,d:24,h:8,side})));
export type BlightSolid={x:number;z:number;w:number;d:number;h:number;bottom?:number;kind:string};
export const BLIGHT_SOLIDS:BlightSolid[]=[];
for(const b of BLIGHT_HOUSES){const front=b.x-b.side*b.w/2;for(const s of [-1,1])BLIGHT_SOLIDS.push({x:front,z:b.z+s*8,w:1,d:8,h:8,kind:'wall'});BLIGHT_SOLIDS.push({x:front,z:b.z,w:1,d:8,h:8,bottom:5,kind:'wall'},{x:b.x+b.side*b.w/2,z:b.z,w:1,d:24,h:8,kind:'wall'},{x:b.x,z:b.z-12,w:18,d:1,h:8,kind:'wall'},{x:b.x,z:b.z+12,w:18,d:1,h:8,kind:'wall'},{x:b.x,z:b.z,w:18,d:24,h:8,bottom:7.65,kind:'roof'})}
for(let i=0;i<28;i++){const z=65+i*18,x=(i%2?1:-1)*(42+(i*7%11));BLIGHT_SOLIDS.push({x,z,w:5+(i%3),d:7,h:6+(i%4),kind:'rock'})}
for(const z of [70,120,170])for(const s of [-1,1])BLIGHT_SOLIDS.push({x:s*22,z,w:1.8,d:1.8,h:12,kind:'tree'});
export function blightHeight(_x:number,z:number){return z<=400?0:-Math.min(16,(z-400)*.12)}
export function blightSurface(x:number,z:number,feet=0){for(const b of BLIGHT_HOUSES)if(feet>=b.h-.5&&Math.abs(x-b.x)<b.w/2+.5&&Math.abs(z-b.z)<b.d/2+.5)return b.h;const r=Math.hypot(x,z-600);return blightHeight(x,z)+(r<=11?.4:r<=12?.3:r<=13?.2:0)}
export function blightBlocked(x:number,z:number,r=.6,feet=blightHeight(x,z)){return Math.abs(x)>55-r||z<3+r||z>635-r||BLIGHT_SOLIDS.some(o=>feet<blightHeight(o.x,o.z)+o.h-.05&&feet+1.8>blightHeight(o.x,o.z)+(o.bottom||0)+.02&&Math.abs(x-o.x)<o.w/2+r&&Math.abs(z-o.z)<o.d/2+r)}
export function blightLineClear(ax:number,ay:number,az:number,bx:number,by:number,bz:number){
 for(const o of BLIGHT_SOLIDS){let lo=0,hi=1;const base=blightHeight(o.x,o.z);for(const [a,b,min,max]of [[ax,bx,o.x-o.w/2,o.x+o.w/2],[ay,by,base+(o.bottom||0),base+o.h],[az,bz,o.z-o.d/2,o.z+o.d/2]]){const d=b-a;if(Math.abs(d)<1e-8){if(a<min||a>max){lo=2;break}}else{const t1=(min-a)/d,t2=(max-a)/d;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));if(lo>hi)break}}if(lo<=hi&&hi>0&&lo<1)return false}
 const n=Math.ceil(Math.hypot(bx-ax,bz-az)/.5);for(let i=1;i<n;i++){const t=i/n;if(ay+(by-ay)*t<blightHeight(ax+(bx-ax)*t,az+(bz-az)*t)-.1)return false}return true;
}
export function blightMonsterHP(kind:string,level:number){return BLIGHT_KINDS[kind]?Math.round(kind==='blight_lord'?ancientBossHealth(level,8,1.5,6):ancientMobHealth(level,ancientBaseAttack(level)*12*(kind==='rift_maw'?1.5:kind==='blight_stalker'?1.25:1))):0}
export function blightMonsterDamage(kind:string,level:number){return BLIGHT_KINDS[kind]?Math.round(ancientBaseHealth(level)*(kind==='blight_lord'?.4:kind==='rift_maw'?.085:.07)*(BLIGHT_KINDS[kind].boss?1:ancientMobDamageScale(level))):0}
export const BLIGHT_CRYSTALS=Array.from({length:12},(_,i)=>({id:'blight-crystal-'+i,x:(i%2?1:-1)*(10+i%3*6),z:425+i*15}));
export const BLIGHT_CRYSTAL_XP=10000;
export function blightCrystalXP(_level?:number){return BLIGHT_CRYSTAL_XP}
export const blightCanFight=(a:{name:string;hp:number;corrupted?:boolean},b:{name:string;hp:number;corrupted?:boolean})=>a.name!==b.name&&a.hp>0&&b.hp>0&&!!(a.corrupted||b.corrupted);
export function blightPath(ax:number,az:number,bx:number,bz:number){const valid=(x:number,z:number,tx:number,tz:number)=>{const n=Math.max(1,Math.ceil(Math.hypot(tx-x,tz-z)/.5));for(let i=1;i<=n;i++)if(blightBlocked(x+(tx-x)*i/n,z+(tz-z)*i/n,1))return false;return true};if(valid(ax,az,bx,bz))return [{x:bx,z:bz}];const nodes=new Map<string,{x:number;z:number}>(),parents=new Map<string,string>(),queue:string[]=[];const x0=Math.round(ax/4)*4,z0=Math.round(az/4)*4;if(!valid(ax,az,x0,z0))return [];const first=x0+','+z0;nodes.set(first,{x:x0,z:z0});parents.set(first,'');queue.push(first);for(let head=0;head<queue.length&&head<4600;head++){const key=queue[head],p=nodes.get(key)!;if(Math.hypot(p.x-bx,p.z-bz)<8&&valid(p.x,p.z,bx,bz)){const out=[{x:bx,z:bz}];let k=key;while(k){out.push(nodes.get(k)!);k=parents.get(k)!}return out.reverse()}for(const [dx,dz]of [[4,0],[-4,0],[0,4],[0,-4]]){const x=p.x+dx,z=p.z+dz,k=x+','+z;if(!parents.has(k)&&valid(p.x,p.z,x,z)){nodes.set(k,{x,z});parents.set(k,key);queue.push(k)}}}return []}
