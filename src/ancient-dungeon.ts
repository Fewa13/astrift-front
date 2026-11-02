// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Shared geometry and balance only; rewards and party membership are server-authoritative.
import {dungeonMechanismSolids,type DungeonMechanisms} from './ancient-dungeon-mechanisms.js';
export const DUNGEON_TIERS=[
 {id:'burrow',name:'兽骨地穴',en:'Bone Burrow',level:20,quality:2,material:'hollowSeal2'},
 {id:'depths',name:'碎骨深层',en:'Bonebreaker Depths',level:40,quality:3,material:'hollowSeal3'},
 {id:'sanctum',name:'酋长禁地',en:'Chieftain Sanctum',level:65,quality:4,material:'hollowSeal4'}
] as const;
export const ASCENSION_DUNGEON_TIERS=[
 {id:'ascensionTrial',name:'升华考验',en:'Ascension Trial',level:80,quality:5,material:'core'},
 {id:'ascensionFinal',name:'圣职仪式',en:'Sacred Rite',level:80,quality:5,material:'core'}
] as const;
export const dungeonId=(map:unknown)=>typeof map==='string'&&/^dungeon:[1-9]\d{0,8}$/.test(map)?Number(map.slice(8)):0;
export const isDungeonMap=(map:unknown)=>dungeonId(map)>0;
export const DUNGEON_PILLARS=[{x:-10,z:144},{x:10,z:156},{x:-10,z:171}];
export const DUNGEON_BLOCKS=[
 {x:-13,z:34,w:6,d:8,h:5},{x:12,z:45,w:5,d:7,h:4},
 {x:-12,z:91,w:6,d:9,h:5},{x:13,z:108,w:6,d:8,h:5},
 ...[64,124].flatMap(z=>[-16,16].map(x=>({x,z,w:16,d:5,h:10}))),
 ...DUNGEON_PILLARS.map(p=>({...p,w:3,d:3,h:9}))
];
const geometry=new Map<string,{collapsed:number[];gateZ:number;mechanisms?:DungeonMechanisms;tower?:boolean}>();
export function setDungeonGeometry(map:string,collapsed:number[],gateZ=189,mechanisms?:DungeonMechanisms,tower=false){if(!isDungeonMap(map))return;if(geometry.size>128&&!geometry.has(map))geometry.delete(geometry.keys().next().value!);geometry.set(map,{collapsed,gateZ,mechanisms,tower})}
function solids(map?:string){if(geometry.get(map||'')?.tower)return []; const {collapsed,gateZ,mechanisms}=geometry.get(map||'')||{collapsed:[],gateZ:189};return [...DUNGEON_BLOCKS.filter(o=>!collapsed.some(i=>DUNGEON_PILLARS[i].x===o.x&&DUNGEON_PILLARS[i].z===o.z)),...dungeonObstacles({collapsed}),...dungeonMechanismSolids(mechanisms),...(gateZ<189?[{x:0,z:gateZ+1,w:gateZ===162?48:16,d:2,h:14}]:[])]}
export function dungeonBlocked(x:number,z:number,r=.6,map?:string){if(geometry.get(map||'')?.tower)return !Number.isFinite(x+z)||Math.abs(x)>22-r||z<3+r||z>55-r;return !Number.isFinite(x+z)||Math.abs(x)>24-r||z<3+r||z>(geometry.get(map||'')?.gateZ||189)-r||solids(map).some(o=>Math.abs(x-o.x)<o.w/2+r&&Math.abs(z-o.z)<o.d/2+r)}
export function dungeonLineClear(ax:number,ay:number,az:number,bx:number,by:number,bz:number,map?:string,ignore?:{x:number;z:number}){
 return !solids(map).some(o=>{if(ignore&&o.x===ignore.x&&o.z===ignore.z)return false;let lo=0,hi=1;for(const [a,b,min,max]of [[ax,bx,o.x-o.w/2,o.x+o.w/2],[ay,by,0,o.h],[az,bz,o.z-o.d/2,o.z+o.d/2]]){const d=b-a;if(Math.abs(d)<1e-8){if(a<min||a>max)return false}else{const u=(min-a)/d,v=(max-a)/d;lo=Math.max(lo,Math.min(u,v));hi=Math.min(hi,Math.max(u,v));if(lo>hi)return false}}return hi>=0&&lo<=1});
}
// Ignore only the operated mechanism, not surrounding walls or closed gates.
export function dungeonControlClear(ax:number,ay:number,az:number,bx:number,by:number,bz:number,map:string){return dungeonLineClear(ax,ay,az,bx,by,bz,map,{x:bx,z:bz})}
// A bounded grid keeps creatures out of stonework without an expensive navmesh.
export function dungeonPath(ax:number,az:number,bx:number,bz:number,map?:string){
 const cell=2,nx=23,nz=92,key=(x:number,z:number)=>z*nx+x;
 const point=(i:number)=>({x:-22+(i%nx)*cell,z:5+Math.floor(i/nx)*cell});
 const index=(x:number,z:number)=>key(Math.max(0,Math.min(nx-1,Math.round((x+22)/cell))),Math.max(0,Math.min(nz-1,Math.round((z-5)/cell))));
 const start=index(ax,az),end=index(bx,bz),queue=[start],prev=new Map<number,number>([[start,-1]]);let head=0;
 while(head<queue.length&&queue.length<2200){const i=queue[head++];if(i===end)break;for(const j of [i-1,i+1,i-nx,i+nx]){if(j<0||j>=nx*nz||Math.abs(j%nx-i%nx)>1||prev.has(j))continue;const p=point(j);if(dungeonBlocked(p.x,p.z,1,map))continue;prev.set(j,i);queue.push(j)}}
 if(!prev.has(end))return [];const result=[];for(let i=end;i!==start&&i>=0;i=prev.get(i)!)result.push(point(i));return result.reverse();
}
export const dungeonHealthScale=(players:number)=>1+.65*(Math.max(1,Math.min(3,players))-1);
export const dungeonDamageScale=(players:number)=>1+.05*(Math.max(1,Math.min(3,players))-1);
export type DungeonRun={tower?:{floor:number;nextAt?:number};revision?:number;hunt?:import('./ancient-hunts').HuntRun;mechanisms?:DungeonMechanisms;ascensionJob?:string;id:number;map:string;leader:string;members:string[];ready:string[];tier:string;level:number;stage:number;gateZ?:number;status:'preparing'|'active'|'complete'|'failed';created:number;expires:number;started:number;finished?:number;rewarded?:boolean;joined:string[];fallen:string[];abandoned?:string[];positions:Record<string,{x:number;y:number;z:number;hp:number}>;seed:number;traps:{x:number;z:number;hitAt:number;started:number}[];trapAt:number;collapsed:number[];collapse?:{index:number;hitAt:number};reason?:string};
export function dungeonObstacles(run:Pick<DungeonRun,'collapsed'>){return run.collapsed.map(i=>{const p=DUNGEON_PILLARS[i];return {x:p.x+(p.x<0?4:-4),z:p.z,w:10,d:3,h:1.5}})}
export function dungeonRubbleBlocked(run:Pick<DungeonRun,'collapsed'>,x:number,z:number,r=.6){return dungeonObstacles(run).some(o=>Math.abs(x-o.x)<o.w/2+r&&Math.abs(z-o.z)<o.d/2+r)}
export function dungeonTraps(seed:number){let n=seed>>>0;const rand=()=>{n=(1664525*n+1013904223)>>>0;return n/4294967296};return [82,98,114].map(z=>({x:Math.round((rand()-.5)*24),z:z+Math.round(rand()*4)}))}

// Cap standard dungeon elites without changing field bosses or hunt rewards.
export function dungeonEliteXP(baseXP:number,kind:string,level:number,run?:Pick<DungeonRun,'hunt'|'ascensionJob'>){return run&&!run.hunt&&!run.ascensionJob&&kind==='chief'?Math.min(baseXP,Math.floor(200*level**2*.1)):baseXP}
