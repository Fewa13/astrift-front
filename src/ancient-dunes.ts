// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {chapterPoint,chapterSafe,chapterHeight,chapterBlocked,chapterClear,chapterPath} from './ancient-geography.js';
import {ancientBaseAttack,ancientBaseHealth} from './ancient-gear.js';
import {ancientMobHealth,ancientMobDamageScale} from './ancient-mob-stats.js';
import {ancientBossHealth} from './ancient-boss-stats.js';
export const DUNES_LEVEL=260;
export const DUNES_KINDS:Record<string,{name:string;en:string;size:number;range:number;speed:number;boss:boolean}>={
 dune_scarab:{name:'砂甲掘行者',en:'Burrowing Sandscarab',size:1.45,range:3.2,speed:4.1,boss:false},
 sand_oracle:{name:'逐沙祭师',en:'Dunewind Oracle',size:1.4,range:20,speed:3.6,boss:false},
 glass_jackal:{name:'琉砂猎兽',en:'Glassfang Jackal',size:1.6,range:3.4,speed:4.8,boss:false},
 buried_marshal:{name:'埋誓将军',en:'The Entombed Marshal',size:3.2,range:11,speed:3.6,boss:true},
 hourglass_regent:{name:'暮沙司命',en:'The Duskglass Regent',size:4.5,range:15,speed:3.4,boss:true}
};
export const dunesHeight=(x:number,z:number)=>chapterHeight('dunes',x,z),dunesSurface=dunesHeight;
export const dunesBlocked=(x:number,z:number,r=.6,feet=dunesHeight(x,z))=>chapterBlocked('dunes',x,z,r,feet);
export const dunesLineClear=(ax:number,ay:number,az:number,bx:number,by:number,bz:number)=>chapterClear('dunes',ax,ay,az,bx,by,bz);
export const dunesPath=(ax:number,az:number,bx:number,bz:number)=>chapterPath('dunes',ax,az,bx,bz);
export function dunesMonsterHP(kind:string,level:number){const d=DUNES_KINDS[kind];return !d?0:d.boss?ancientBossHealth(level,kind==='buried_marshal'?6.5:9,1.5,5.5):ancientMobHealth(level,ancientBaseAttack(level)*12*(kind==='sand_oracle'?1.1:kind==='glass_jackal'?1.5:1.3));}
export function dunesMonsterDamage(kind:string,level:number){const d=DUNES_KINDS[kind];return !d?0:Math.round(ancientBaseHealth(level)*(kind==='hourglass_regent'?.4:kind==='buried_marshal'?.28:kind==='sand_oracle'?.07:.08)*(d.boss?1:ancientMobDamageScale(level)));}
export const DUNES_SPAWNS=Array.from({length:28},(_,i)=>{const region=Math.floor(i/7),kind=region===0?'dune_scarab':region===1?'sand_oracle':region===2?'glass_jackal':i%2?'glass_jackal':'dune_scarab',point=chapterPoint('dunes',[-18,-6,8,18][i%4],[40,135,215,325][region]+Math.floor(i%7/4)*18);return {kind,level:260+region*10+i%7,...chapterSafe('dunes',point.x,point.z,1.8),region};});
export const DUNES_BOSSES=[{kind:'buried_marshal',level:280,...chapterPoint('dunes',20,180),region:1},{kind:'hourglass_regent',level:300,...chapterPoint('dunes',0,365),region:3}];
