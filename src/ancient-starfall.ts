// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {chapterPoint,chapterHeight,chapterBlocked,chapterClear,chapterPath,chapterSafe,CHAPTER_PROPS} from './ancient-geography.js';
import {STARFALL_REBUILT,starfallWidth} from './ancient-chapter-layouts.js';
import {ancientBaseAttack,ancientBaseHealth} from './ancient-gear.js';
import {ancientMobHealth,ancientMobDamageScale} from './ancient-mob-stats.js';
import {ancientBossHealth} from './ancient-boss-stats.js';
export const STARFALL_LEVEL=150;
export const STARFALL_KINDS:Record<string,{name:string;en:string;size:number;range:number;speed:number;boss:boolean}>={
 tide_carapace:{name:'潮壳潜卫',en:'Tidecarapace Guardian',size:1.5,range:3.2,speed:4.1,boss:false},
 drowned_scribe:{name:'溺星书记',en:'Drowned Star Scribe',size:1.3,range:18,speed:3.8,boss:false},
 anchor_revenant:{name:'缚锚遗骸',en:'Anchorbound Revenant',size:1.8,range:3.6,speed:4.3,boss:false},
 starbound_heart:{name:'沉星执核者',en:'The Sunken Corekeeper',size:4,range:14,speed:3.6,boss:true}
};
export const starfallHeight=(x:number,z:number)=>chapterHeight('starfall',x,z);
export const starfallSurface=starfallHeight;
export const STARFALL_SOLIDS=CHAPTER_PROPS.starfall;
export const starfallBlocked=(x:number,z:number,r=.6,feet=starfallHeight(x,z))=>chapterBlocked('starfall',x,z,r,feet);
export const starfallLineClear=(ax:number,ay:number,az:number,bx:number,by:number,bz:number)=>chapterClear('starfall',ax,ay,az,bx,by,bz);
export const starfallPath=(ax:number,az:number,bx:number,bz:number)=>chapterPath('starfall',ax,az,bx,bz);
export function starfallMonsterHP(kind:string,level:number){return STARFALL_KINDS[kind]?Math.round(kind==='starbound_heart'?ancientBossHealth(level,8.5,1.5,5.5):ancientMobHealth(level,ancientBaseAttack(level)*12*(kind==='anchor_revenant'?1.5:kind==='drowned_scribe'?1.1:1.3))):0}
export function starfallMonsterDamage(kind:string,level:number){return STARFALL_KINDS[kind]?Math.round(ancientBaseHealth(level)*(kind==='starbound_heart'?.4:kind==='drowned_scribe'?.07:.08)*(STARFALL_KINDS[kind].boss?1:ancientMobDamageScale(level))):0}
export const STARFALL_SPAWNS=Array.from({length:24},(_,i)=>{const region=Math.floor(i/8);return {kind:['tide_carapace','drowned_scribe','anchor_revenant'][region],level:150+region*10+i%8,x:[-18,-6,6,18][i%4],z:[52,172,310][region]+Math.floor(i%8/4)*36,region}}).map(s=>({...s,...chapterSafe('starfall',...Object.values(chapterPoint('starfall',s.x,s.z)) as [number,number],1.8)}));
