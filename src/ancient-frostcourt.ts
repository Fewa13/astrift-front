// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {chapterPoint,chapterHeight,chapterBlocked,chapterClear,chapterPath,chapterSafe,CHAPTER_PROPS} from './ancient-geography.js';
import {FROSTCOURT_REBUILT,frostcourtWidth} from './ancient-chapter-layouts.js';
import {ancientBaseAttack,ancientBaseHealth} from './ancient-gear.js';
import {ancientMobHealth,ancientMobDamageScale} from './ancient-mob-stats.js';
import {ancientBossHealth} from './ancient-boss-stats.js';
export const FROSTCOURT_LEVEL=180;
export const FROSTCOURT_KINDS:Record<string,{name:string;en:string;size:number;range:number;speed:number;boss:boolean}>={
 frost_oathguard:{name:'霜契哨卫',en:'Frostbound Oathguard',size:1.55,range:3.2,speed:4.2,boss:false},
 ember_mason:{name:'烬炉铸役',en:'Emberforge Artificer',size:1.4,range:18,speed:3.7,boss:false},
 chain_executor:{name:'断誓执刑者',en:'Oathchain Executioner',size:1.85,range:3.8,speed:4.4,boss:false},
 furnace_regent:{name:'熔誓监工',en:'Overseer of the Oathforge',size:2.8,range:10,speed:3.7,boss:true},
 frost_crowned:{name:'霜烬裁令者',en:'The Frostfire Arbiter',size:4.2,range:14,speed:3.5,boss:true}
};
export const frostcourtHeight=(x:number,z:number)=>chapterHeight('frostcourt',x,z);
export const frostcourtSurface=frostcourtHeight;
export const FROSTCOURT_SOLIDS=CHAPTER_PROPS.frostcourt;
export const frostcourtBlocked=(x:number,z:number,r=.6,feet=frostcourtHeight(x,z))=>chapterBlocked('frostcourt',x,z,r,feet);
export const frostcourtLineClear=(ax:number,ay:number,az:number,bx:number,by:number,bz:number)=>chapterClear('frostcourt',ax,ay,az,bx,by,bz);
export const frostcourtPath=(ax:number,az:number,bx:number,bz:number)=>chapterPath('frostcourt',ax,az,bx,bz);
export function frostcourtMonsterHP(kind:string,level:number){if(!FROSTCOURT_KINDS[kind])return 0;return Math.round(FROSTCOURT_KINDS[kind].boss?ancientBossHealth(level,kind==='furnace_regent'?6:8.5,1.5,5.5):ancientMobHealth(level,ancientBaseAttack(level)*12*(kind==='chain_executor'?1.5:kind==='ember_mason'?1.1:1.3)));}
export function frostcourtMonsterDamage(kind:string,level:number){return FROSTCOURT_KINDS[kind]?Math.round(ancientBaseHealth(level)*(kind==='frost_crowned'?.4:kind==='furnace_regent'?.28:kind==='ember_mason'?.07:.08)*(FROSTCOURT_KINDS[kind].boss?1:ancientMobDamageScale(level))):0;}
export const FROSTCOURT_SPAWNS=Array.from({length:28},(_,i)=>{const region=Math.floor(i/7);return {kind:region===0?'frost_oathguard':region===1?'ember_mason':region===2?'chain_executor':i%2?'chain_executor':'frost_oathguard',level:180+region*10+i%7,x:[-16,-7,7,16][i%7%4],z:[46,120,224,324][region]+Math.floor(i%7/4)*18,region};}).map(s=>({...s,...chapterSafe('frostcourt',...Object.values(chapterPoint('frostcourt',s.x,s.z)) as [number,number],1.8)}));
