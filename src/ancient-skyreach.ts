// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {chapterPoint,chapterHeight,chapterBlocked,chapterClear,chapterPath,chapterSafe,CHAPTER_PROPS} from './ancient-geography.js';
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
export const skyreachHeight=(x:number,z:number)=>chapterHeight('skyreach',x,z);
export const skyreachSurface=skyreachHeight;
export const SKYREACH_SOLIDS=CHAPTER_PROPS.skyreach;
export const skyreachBlocked=(x:number,z:number,r=.6,feet=skyreachHeight(x,z))=>chapterBlocked('skyreach',x,z,r,feet);
export const skyreachLineClear=(ax:number,ay:number,az:number,bx:number,by:number,bz:number)=>chapterClear('skyreach',ax,ay,az,bx,by,bz);
export const skyreachPath=(ax:number,az:number,bx:number,bz:number)=>chapterPath('skyreach',ax,az,bx,bz);
export function skyreachMonsterHP(kind:string,level:number){const k=SKYREACH_KINDS[kind];return !k?0:Math.round(k.boss?ancientBossHealth(level,kind==='thunder_warden'?6.5:9,1.5,5.5):ancientMobHealth(level,ancientBaseAttack(level)*12*(kind==='prism_golem'?1.5:kind==='storm_weaver'?1.1:1.3)));}
export function skyreachMonsterDamage(kind:string,level:number){return SKYREACH_KINDS[kind]?Math.round(ancientBaseHealth(level)*(kind==='sky_sovereign'?.40:kind==='thunder_warden'?.28:kind==='storm_weaver'?.07:.08)*(SKYREACH_KINDS[kind].boss?1:ancientMobDamageScale(level))):0;}
export const SKYREACH_SPAWNS=Array.from({length:28},(_,i)=>{const region=Math.floor(i/7);return {kind:region===0?'sky_lancer':region===1?'storm_weaver':region===2?'prism_golem':i%2?'prism_golem':'sky_lancer',level:220+region*10+i%7,x:[-9,0,9,18][i%7%4],z:[42,112,212,314][region]+Math.floor(i%7/4)*17,region};}).map(s=>({...s,...chapterSafe('skyreach',...Object.values(chapterPoint('skyreach',s.x,s.z)) as [number,number],1.8)}));
