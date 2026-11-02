// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {CHAPTER_ROUTES,chapterPoint} from './ancient-geography.js';
import {communityId,getCommunityMap} from './ancient-community.js';
import {tribeCompactZ} from './ancient-rules.js';
export type Wanderer={x:number;z:number;homeX:number;homeZ:number;region:number;wander?:{x:number;z:number;until:number};wanderAt?:number;action:string;actionAt:number};
export function wanderAllowed(map:string,region:number,x:number,z:number){
 if(communityId(map)){const spawn=getCommunityMap(map)?.spawn;return !!spawn&&Math.hypot(x-spawn.x,z-spawn.z)>=12;}
 if(CHAPTER_ROUTES[map])return ![10,89,189,289].some(u=>{const p=chapterPoint(map,0,u);return Math.hypot(x-p.x,z-p.z)<20});
 if(map==='skyreach'&&[18,89,189,289].some(n=>Math.hypot(x,z-n)<22))return false;
 if(map==='frostcourt'&&[18,94,196,296].some(n=>Math.hypot(x,z-n)<22))return false;
 if(map==='forest'&&Math.hypot(x-25.5,z-165)<11)return false;
 if(Math.hypot(x,z-10)<30)return false;
 if(map==='tribe')return region===0?z>=40&&z<tribeCompactZ(180):region===1?z>tribeCompactZ(220)&&z<tribeCompactZ(480):z>tribeCompactZ(520)&&z<tribeCompactZ(990);
 return true;
}
export function tickWander(m:Wanderer,map:string,now:number,dt:number,solid:(x:number,z:number)=>boolean,random=Math.random){
 const safe=(x:number,z:number)=>wanderAllowed(map,m.region,x,z)&&!solid(x,z);
 const route=(x:number,z:number)=>{const n=Math.max(1,Math.ceil(Math.hypot(x-m.x,z-m.z)/.5));for(let i=1;i<=n;i++)if(!safe(m.x+(x-m.x)*i/n,m.z+(z-m.z)*i/n))return false;return true};
 if(m.wander&&(now>m.wander.until||Math.hypot(m.x-m.wander.x,m.z-m.wander.z)<.5)){delete m.wander;m.wanderAt=now+2000+random()*4000}
 if(!m.wander){m.action='idle';if(now<(m.wanderAt||0))return;m.wanderAt=now+3000+random()*4000;for(let i=0;i<12;i++){const angle=random()*Math.PI*2,r=4+random()*14,x=m.homeX+Math.sin(angle)*r,z=m.homeZ+Math.cos(angle)*r;if(route(x,z)){m.wander={x,z,until:now+15000};m.actionAt=now;break}}}
 if(!m.wander)return;const dx=m.wander.x-m.x,dz=m.wander.z-m.z,d=Math.hypot(dx,dz)||1,step=Math.min(d,Math.max(0,Math.min(.5,dt))*1.6),x=m.x+dx/d*step,z=m.z+dz/d*step;
 if(safe(x,z)){m.x=x;m.z=z;m.action='walk'}else{delete m.wander;m.wanderAt=now+2000;m.action='idle'}
}
