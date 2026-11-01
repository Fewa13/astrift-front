// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {SKYREACH_REBUILT,skyreachWidth} from './ancient-chapter-layouts.js';
import {ancientBaseAttack,ancientBaseHealth} from './ancient-gear.js';
import {ancientMobHealth,ancientMobDamageScale} from './ancient-mob-stats.js';
import {ancientBossHealth} from './ancient-boss-stats.js';
export const SKYREACH_LEVEL=220;
export const SKYREACH_KINDS:Record<string,{name:string;en:string;size:number;range:number;speed:number;boss:boolean}>={
 sky_lancer:{name:'巡穹枪卫',en:'Skywatch Lancer',size:1.55,range:3.2,speed:4.3,boss:false},
 storm_weaver:{name:'织雷星使',en:'Stormweaver',size:1.45,range:19,speed:3.8,boss:false},
 prism_golem:{name:'棱晶重卫',en:'Prismatic Bulwark',size:1.9,range:3.8,speed:3.7,boss:false},
 thunder_warden:{name:'镇雷监守',en:'Warden of Thunder',size:2.9,range:11,speed:3.7,boss:true},
 sky_sovereign:{name:'寂雷天君',en:'Sovereign of the Silent Storm',size:4.3,range:15,speed:3.5,boss:true}
};
export function skyreachHeight(_x:number,z:number){return z<65?0:z<85?(z-65)*.3:z<165?6:z<185?6+(z-165)*.3:z<265?12:z<285?12+(z-265)*.3:18;}
export function skyreachSurface(x:number,z:number){return skyreachHeight(x,z)+(Math.hypot(x,z-352)<15?.3:0);}
export const SKYREACH_SOLIDS=SKYREACH_REBUILT;
export function skyreachBlocked(x:number,z:number,r=.6,feet=skyreachHeight(x,z)){return Math.abs(x)>skyreachWidth(z)-r||z<4+r||z>384-r||SKYREACH_SOLIDS.some(o=>feet<skyreachHeight(o.x,o.z)+o.h-.08&&Math.abs(x-o.x)<o.w/2+r&&Math.abs(z-o.z)<o.d/2+r);}
export function skyreachLineClear(ax:number,ay:number,az:number,bx:number,by:number,bz:number){const count=Math.max(1,Math.ceil(Math.hypot(bx-ax,bz-az)/.4));for(let i=1;i<count;i++){const t=i/count,x=ax+(bx-ax)*t,z=az+(bz-az)*t,y=ay+(by-ay)*t;if(Math.abs(x)>skyreachWidth(z)||y<skyreachSurface(x,z)-.1||SKYREACH_SOLIDS.some(o=>Math.abs(x-o.x)<o.w/2&&Math.abs(z-o.z)<o.d/2&&y<skyreachHeight(o.x,o.z)+o.h))return false;}return true;}
export function skyreachPath(ax:number,az:number,bx:number,bz:number){
 const valid=(x:number,z:number,tx:number,tz:number)=>{const n=Math.max(1,Math.ceil(Math.hypot(tx-x,tz-z)/.6));for(let i=1;i<=n;i++)if(skyreachBlocked(x+(tx-x)*i/n,z+(tz-z)*i/n,1))return false;return true;};if(valid(ax,az,bx,bz))return [{x:bx,z:bz}];
 const first={x:Math.round(ax/4)*4,z:Math.round(az/4)*4},queue=[first],parents=new Map([[first.x+','+first.z,'']]),nodes=new Map([[first.x+','+first.z,first]]);if(!valid(ax,az,first.x,first.z))return [];
 for(let i=0;i<queue.length&&i<3200;i++){const p=queue[i],key=p.x+','+p.z;if(Math.hypot(p.x-bx,p.z-bz)<7&&valid(p.x,p.z,bx,bz)){const out=[{x:bx,z:bz}];let k=key;while(k){out.push(nodes.get(k)!);k=parents.get(k)!;}return out.reverse();}for(const [dx,dz]of [[4,0],[-4,0],[0,4],[0,-4]]){const n={x:p.x+dx,z:p.z+dz},k=n.x+','+n.z;if(!parents.has(k)&&valid(p.x,p.z,n.x,n.z)){parents.set(k,key);nodes.set(k,n);queue.push(n);}}}return [];
}
export function skyreachMonsterHP(kind:string,level:number){const k=SKYREACH_KINDS[kind];return !k?0:Math.round(k.boss?ancientBossHealth(level,kind==='thunder_warden'?6.5:9,1.5,5.5):ancientMobHealth(level,ancientBaseAttack(level)*12*(kind==='prism_golem'?1.5:kind==='storm_weaver'?1.1:1.3)));}
export function skyreachMonsterDamage(kind:string,level:number){return SKYREACH_KINDS[kind]?Math.round(ancientBaseHealth(level)*(kind==='sky_sovereign'?.40:kind==='thunder_warden'?.28:kind==='storm_weaver'?.07:.08)*(SKYREACH_KINDS[kind].boss?1:ancientMobDamageScale(level))):0;}
export const SKYREACH_SPAWNS=Array.from({length:28},(_,i)=>{const region=Math.floor(i/7);return {kind:region===0?'sky_lancer':region===1?'storm_weaver':region===2?'prism_golem':i%2?'prism_golem':'sky_lancer',level:220+region*10+i%7,x:[-9,0,9,18][i%7%4],z:[42,112,212,314][region]+Math.floor(i%7/4)*17,region};});
