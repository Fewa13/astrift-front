// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const CITY_BUILDINGS=[-1,1].flatMap(side=>[210,265,320].map(z=>({x:side*30,z,w:20,d:28,h:8,side})));
export const CITY_DEVICES=[{id:'city-west',x:-30,z:246},{id:'city-east',x:30,z:301},{id:'city-gate',x:0,z:354}];
export function cityHeight(x:number,z:number){if(z>365)return -Math.min(12,(z-365)*.3);for(const b of CITY_BUILDINGS)if(Math.abs(x-b.side*44)<3.5&&z>b.z-26&&z<b.z+14)return (z-(b.z-26))*.2;return 0}
export function citySurface(x:number,z:number,feet=0){for(const b of CITY_BUILDINGS)if(feet>=b.h-.55&&Math.abs(x-b.x)<b.w/2+1.15&&Math.abs(z-b.z)<b.d/2+1.15)return b.h;return cityHeight(x,z)}
export function cityCeiling(x:number,z:number,feet:number){for(const b of CITY_BUILDINGS)if(feet<b.h-.55&&Math.abs(x-b.x)<b.w/2&&Math.abs(z-b.z)<b.d/2)return b.h-.35;return Infinity}
export type CityWall={x:number;z:number;w:number;d:number;h:number;y:number};
export const CITY_WALLS:CityWall[]=[];
const wall=(x:number,z:number,w:number,d:number,h:number,y=0)=>CITY_WALLS.push({x,z,w,d,h,y});
for(const b of CITY_BUILDINGS){const doorX=b.x-b.side*b.w/2;for(const s of [-1,1])wall(doorX,b.z+s*8.5,1,11,8);wall(doorX,b.z,1,6,2.5,5.5);wall(b.x+b.side*b.w/2,b.z,1,b.d,8);wall(b.x,b.z-b.d/2,b.w,1,8);for(const s of [-1,1])wall(b.x+s*6.25,b.z+b.d/2,7.5,1,8);wall(b.x,b.z+b.d/2,b.w,1,2.5,5.5)}
for(const z of [80,125,164])for(const s of [-1,1])wall(s*27,z,14,8,4);
for(const z of [32,62])for(const s of [-1,1])wall(s*12,z,2,2,7);
for(const z of [183,355])for(const s of [-1,1])wall(s*31,z,34,3,14);
for(const z of [430,475,520])for(const s of [-1,1])wall(s*27,z,3,3,17,-12);
export function cityBlocked(x:number,z:number,r=.6,feet=0){return Math.abs(x)>48-r||z<3+r||z>556-r||CITY_WALLS.some(o=>feet<o.y+o.h-.1&&feet+1.8>o.y&&Math.abs(x-o.x)<o.w/2+r&&Math.abs(z-o.z)<o.d/2+r)}
export function cityLineClear(ax:number,ay:number,az:number,bx:number,by:number,bz:number){
 const hits=(o:CityWall)=>{let lo=0,hi=1;for(const [a,b,min,max]of [[ax,bx,o.x-o.w/2,o.x+o.w/2],[ay,by,o.y,o.y+o.h],[az,bz,o.z-o.d/2,o.z+o.d/2]]){const d=b-a;if(Math.abs(d)<1e-8){if(a<min||a>max)return false}else{const t1=(min-a)/d,t2=(max-a)/d;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));if(lo>hi)return false}}return hi>0&&lo<1};
 if(CITY_WALLS.some(hits)||CITY_BUILDINGS.some(b=>hits({x:b.x,z:b.z,w:b.w,d:b.d,h:.35,y:b.h-.35})))return false;
 const n=Math.max(1,Math.ceil(Math.hypot(bx-ax,by-ay,bz-az)/.4));
 for(let i=1;i<n;i++){const t=i/n,x=ax+(bx-ax)*t,y=ay+(by-ay)*t,z=az+(bz-az)*t;if(Math.abs(x)>48||z<3||z>557||y<cityHeight(x,z)-.15)return false;if(CITY_WALLS.some(o=>Math.abs(x-o.x)<o.w/2&&Math.abs(z-o.z)<o.d/2&&y>=o.y&&y<o.y+o.h))return false;for(const b of CITY_BUILDINGS)if(Math.abs(x-b.x)<b.w/2&&Math.abs(z-b.z)<b.d/2&&y>b.h-.35&&y<b.h)return false}
 return true;
}
export const CITY_KINDS:Record<string,{name:string;en:string;size:number;hp:number;damage:number;xp:number;range:number;speed:number;boss:boolean}>={
 city_husk:{name:'失落城民',en:'Lost Citizen',size:1.25,hp:1,damage:1,xp:1,range:2.8,speed:3.9,boss:false},
 city_guard:{name:'空誓守卫',en:'Hollow Oathguard',size:1.6,hp:1.4,damage:1.2,xp:1,range:3.2,speed:4.3,boss:false},
 city_acolyte:{name:'裂隙侍祭',en:'Rift Acolyte',size:1.4,hp:1.15,damage:1.1,xp:1,range:18,speed:3.8,boss:false},
 oathknight:{name:'失誓骑士',en:'Forsworn Knight',size:2.5,hp:12,damage:2.3,xp:1,range:9,speed:4.4,boss:true},
 emptyking:{name:'空冠之王',en:'The Empty-Crowned King',size:4,hp:22,damage:3.2,xp:1,range:14,speed:3.6,boss:true}
};
import {ancientBossHP,ancientBossDamage} from './ancient-boss-stats.js';
import {ancientMobHP,ancientMobDamage} from './ancient-mob-stats.js';
export function cityMonsterHP(kind:string,level:number){return ancientBossHP(kind,level)||ancientMobHP(kind,level)||Math.floor(20000*(Math.max(1,level)/50)**3*CITY_KINDS[kind].hp)}
export function cityMonsterDamage(kind:string,level:number){return ancientBossDamage(kind,level)||ancientMobDamage(kind,level)||Math.floor(3200*(Math.max(1,level)/70)**2.5*CITY_KINDS[kind].damage)}
export const cityWorldId=(map:string)=>/^community:[1-9]\d{0,7}$/.test(map)?3000000000+Number(map.slice(10))*2:/^dungeon:[1-9]\d{0,8}$/.test(map)?1000+Number(map.slice(8))*2:map==='skyreach'?15:map==='frostcourt'?13:map==='starfall'?11:map==='sanctum'?9:map==='blight'?7:map==='city'?5:map==='forest'?3:1;
export const cityMap=(value:unknown)=>value==='skyreach'?'skyreach':value==='frostcourt'?'frostcourt':value==='starfall'?'starfall':value==='sanctum'?'sanctum':value==='blight'?'blight':value==='city'?'city':value==='forest'?'forest':'tribe';
let nav:Map<string,{x:number;z:number}>|undefined;
function segment(ax:number,az:number,bx:number,bz:number){const n=Math.max(1,Math.ceil(Math.hypot(bx-ax,bz-az)/.5));for(let i=1;i<=n;i++){const x=ax+(bx-ax)*i/n,z=az+(bz-az)*i/n;if(cityBlocked(x,z,1))return false}return true}
export function cityPath(ax:number,az:number,bx:number,bz:number){
 if(segment(ax,az,bx,bz))return [{x:bx,z:bz}];if(!nav){nav=new Map();for(let x=-44;x<=44;x+=4)for(let z=8;z<=552;z+=4)if(!cityBlocked(x,z,1))nav.set(x+','+z,{x,z})}
 const nearest=(x:number,z:number)=>[...nav!.entries()].filter(([,p])=>Math.hypot(p.x-x,p.z-z)<9&&segment(x,z,p.x,p.z)).sort((a,b)=>Math.hypot(a[1].x-x,a[1].z-z)-Math.hypot(b[1].x-x,b[1].z-z))[0],start=nearest(ax,az),end=nearest(bx,bz);if(!start||!end)return [];
 const queue=[start[0]],parents=new Map([[start[0],'']]);for(let head=0;head<queue.length&&head<4000;head++){const key=queue[head],p=nav.get(key)!;if(key===end[0]){const path=[{x:bx,z:bz}];let k=key;while(k!==start[0]){path.push(nav.get(k)!);k=parents.get(k)!}path.push(start[1]);return path.reverse()}for(const [dx,dz]of [[4,0],[-4,0],[0,4],[0,-4]]){const k=(p.x+dx)+','+(p.z+dz);if(!parents.has(k)&&nav.has(k)&&segment(p.x,p.z,p.x+dx,p.z+dz)){parents.set(k,key);queue.push(k)}}}return [];
}
