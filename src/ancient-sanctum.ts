// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {ancientBaseAttack,ancientBaseHealth} from './ancient-gear.js';
import {ancientBossHealth} from './ancient-boss-stats.js';
import {ancientMobHealth,ancientMobDamageScale} from './ancient-mob-stats.js';
import {traceMirrorLight} from './ancient-optics.js';
export {mirrorYaw,reflectMirror} from './ancient-optics.js';
export const SANCTUM_LEVEL=120;
export const SANCTUM_KINDS:Record<string,{name:string;en:string;size:number;range:number;speed:number;boss:boolean}>={
 sanctum_sentinel:{name:'光铸守卫',en:'Lightforged Sentinel',size:1.55,range:3.2,speed:4.1,boss:false},
 mirror_wraith:{name:'镜光灵体',en:'Mirrorlight Wraith',size:1.3,range:18,speed:3.8,boss:false},
 seal_warden:{name:'封印执卫',en:'Seal Warden',size:1.8,range:3.6,speed:4.3,boss:false},
 immaculate_judge:{name:'无瑕裁决者',en:'The Immaculate Arbiter',size:4,range:14,speed:3.6,boss:true}
};
export function sanctumHeight(_x:number,z:number){return z<180?0:z<240?(z-180)*8/60:z<430?8:z<470?8+(z-430)*.1:12}
export function sanctumSurface(x:number,z:number){const r=Math.hypot(x,z-555);return sanctumHeight(x,z)+(r<13?.45:r<14?.3:r<15?.15:0)}
export type SanctumSolid={x:number;z:number;w:number;d:number;h:number;bottom?:number;kind:string};
export const SANCTUM_SOLIDS:SanctumSolid[]=[];
for(const z of [35,165,250,390,470,590])for(const s of [-1,1])SANCTUM_SOLIDS.push({x:s*(z<180?24:35),z,w:2.6,d:2.6,h:8,kind:'column'});
for(const z of [495,565])for(let i=0;i<12;i++){const a=i*Math.PI/6;SANCTUM_SOLIDS.push({x:Math.sin(a)*37,z:z+Math.cos(a)*27,w:2.6,d:2.6,h:21,kind:'column'})}
for(const z of [45,95,145])for(const s of [-1,1])SANCTUM_SOLIDS.push({x:s*25,z,w:2.6,d:2.6,h:13,kind:'column'});
for(const z of [260,290,350,390,480,515,580])for(const s of [-1,1])SANCTUM_SOLIDS.push({x:s*36,z,w:3,d:3,h:z>=470?19:15,kind:'column'});
for(const z of [60,125])for(const s of [-1,1])SANCTUM_SOLIDS.push({x:s*39,z,w:15,d:26,h:7,kind:'pavilion'});
for(const z of [185,195,205,215,225,235])for(const s of [-1,1])SANCTUM_SOLIDS.push({x:s*9.6,z,w:.6,d:10,h:2,kind:'rail'});
for(const z of [250,315,375,495,545,590])for(const s of [-1,1])SANCTUM_SOLIDS.push({x:s*50,z,w:2,d:50,h:19,kind:'wall'});
for(const x of [-30,30])SANCTUM_SOLIDS.push({x,z:410,w:44,d:2,h:16,kind:'wall'});SANCTUM_SOLIDS.push({x:0,z:410,w:16,d:2,h:16,bottom:10,kind:'wall'});
export const SANCTUM_MIRRORS=[{id:'mirror-a',x:0,z:270},{id:'mirror-b',x:0,z:320},{id:'mirror-c',x:20,z:320}];
for(const m of SANCTUM_MIRRORS)SANCTUM_SOLIDS.push({...m,w:1.6,d:1.6,h:1.4,kind:'mirrorBase'});
export const SANCTUM_RECEIVER={x:20,z:380};
const sanctumColliders=[...SANCTUM_SOLIDS,
 {...SANCTUM_RECEIVER,w:2.6,d:2.6,h:6,kind:'receiver'},
 ...[-1,1].flatMap(s=>Array.from({length:5},(_,j)=>({x:s*(22+j*2.5),z:555,w:2,d:32,h:2+j*1.4,kind:'dais-wing'}))),
];
export function sanctumInside(x:number,z:number,r=0){return z>=3+r&&z<=606-r&&Math.abs(x)<(z>=185&&z<=235?9.3:49)-r}
export function sanctumBlocked(x:number,z:number,r=.6,feet=sanctumHeight(x,z)){return !sanctumInside(x,z,r)||sanctumColliders.some(o=>feet<sanctumHeight(o.x,o.z)+o.h-.06&&feet+1.8>sanctumHeight(o.x,o.z)+(o.bottom||0)+.01&&Math.abs(x-o.x)<o.w/2+r&&Math.abs(z-o.z)<o.d/2+r)}
export function sanctumGateBlocks(x:number,z:number,r=.6){return Math.abs(z-410)<1+r&&Math.abs(x)<49+r}
export function sanctumGateCrosses(ax:number,az:number,bx:number,bz:number){return (az<410&&bz>=410)||(az>410&&bz<=410)||sanctumGateBlocks(bx,bz,.2)}
export function sanctumLineClear(ax:number,ay:number,az:number,bx:number,by:number,bz:number){
 for(const o of sanctumColliders){let lo=0,hi=1;const y=sanctumHeight(o.x,o.z);for(const [a,b,min,max]of [[ax,bx,o.x-o.w/2,o.x+o.w/2],[ay,by,y+(o.bottom||0),y+o.h],[az,bz,o.z-o.d/2,o.z+o.d/2]]){const d=b-a;if(Math.abs(d)<1e-8){if(a<min||a>max){lo=2;break}}else{const t1=(min-a)/d,t2=(max-a)/d;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));if(lo>hi)break}}if(lo<=hi&&hi>0&&lo<1)return false}
 const n=Math.ceil(Math.hypot(bx-ax,bz-az)/.4);for(let i=1;i<n;i++){const t=i/n;if(ay+(by-ay)*t<sanctumHeight(ax+(bx-ax)*t,az+(bz-az)*t)-.1)return false}return true;
}
export function sanctumMonsterHP(kind:string,level:number){return SANCTUM_KINDS[kind]?Math.round(kind==='immaculate_judge'?ancientBossHealth(level,8.5,1.5,5.5):ancientMobHealth(level,ancientBaseAttack(level)*12*(kind==='seal_warden'?1.5:kind==='mirror_wraith'?1.1:1.3))):0}
export function sanctumMonsterDamage(kind:string,level:number){return SANCTUM_KINDS[kind]?Math.round(ancientBaseHealth(level)*(kind==='immaculate_judge'?.4:kind==='mirror_wraith'?.07:.08)*(SANCTUM_KINDS[kind].boss?1:ancientMobDamageScale(level))):0}
export type SanctumOptics={angles:Record<string,number>;opened:boolean;revision:number};
export const newSanctumOptics=():SanctumOptics=>({angles:{'mirror-a':0,'mirror-b':2,'mirror-c':3},opened:false,revision:0});
export type LightSegment={ax:number;az:number;bx:number;bz:number};
export function traceSanctumLight(s:SanctumOptics){return traceMirrorLight(s.angles,SANCTUM_MIRRORS,{x:-16,z:270},SANCTUM_RECEIVER,{minX:-48,maxX:48,minZ:242,maxZ:408})}
export function rotateSanctumMirror(s:SanctumOptics,id:string){if(!SANCTUM_MIRRORS.some(m=>m.id===id)||s.opened)return false;s.angles[id]=((s.angles[id]||0)+1)%4;s.revision++;if(traceSanctumLight(s).solved)s.opened=true;return true}
export function sanctumPath(ax:number,az:number,bx:number,bz:number){const valid=(x:number,z:number,tx:number,tz:number)=>{const n=Math.max(1,Math.ceil(Math.hypot(tx-x,tz-z)/.5));for(let i=1;i<=n;i++)if(sanctumBlocked(x+(tx-x)*i/n,z+(tz-z)*i/n,1))return false;return true};if(valid(ax,az,bx,bz))return [{x:bx,z:bz}];const nodes=new Map<string,{x:number;z:number}>(),parents=new Map<string,string>(),queue:string[]=[],x0=Math.round(ax/4)*4,z0=Math.round(az/4)*4;if(!valid(ax,az,x0,z0))return [];const first=x0+','+z0;nodes.set(first,{x:x0,z:z0});parents.set(first,'');queue.push(first);for(let head=0;head<queue.length&&head<4300;head++){const key=queue[head],p=nodes.get(key)!;if(Math.hypot(p.x-bx,p.z-bz)<8&&valid(p.x,p.z,bx,bz)){const out=[{x:bx,z:bz}];let k=key;while(k){out.push(nodes.get(k)!);k=parents.get(k)!}return out.reverse()}for(const [dx,dz]of [[4,0],[-4,0],[0,4],[0,-4]]){const x=p.x+dx,z=p.z+dz,k=x+','+z;if(!parents.has(k)&&valid(p.x,p.z,x,z)){nodes.set(k,{x,z});parents.set(k,key);queue.push(k)}}}return []}
