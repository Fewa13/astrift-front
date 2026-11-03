// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {ancientBossGearWeights,GEAR,ANCIENT_FORGE,rollGearItem} from './ancient-gear';
export const TOWER_FLOORS=100;
export type TowerProgress={best:number;books:number};
export function towerEnemy(floor:number){if(!Number.isInteger(floor)||floor<1||floor>100)throw Error('Invalid tower floor');const level=floor*5,boss=floor%5===0;
 const band=level<30?0:level<70?1:level<100?2:level<120?3:level<150?4:level<180?5:level<220?6:7;
 const maps=['tribe','forest','city','blight','sanctum','starfall','frostcourt','skyreach'];
 const mobs=['grox','sentinel','city_guard','rift_maw','seal_warden','tide_carapace','frost_oathguard','sky_lancer'];
 const bosses=['lord','crystal_fire','emptyking','blight_lord','immaculate_judge','starbound_heart','frost_crowned','sky_sovereign'];
 return {level,boss,kind:boss?bosses[band]:mobs[band],map:maps[band]};
}
export function towerMilestone(floor:number){return {blank:floor===20?1:0,books:floor%2===0?1:0,gear:floor%10===0,medium:floor%30===0?1:0,advanced:floor===80?1:0,slots:floor===100?1:0}}
export function towerGear(floor:number,random=Math.random){const e=towerEnemy(floor),weights=ancientBossGearWeights(e.map);let r=random()*100,q=1;for(let i=0;i<weights.length;i++){r-=weights[i];if(r<0){q=i+1;break;}}const pool=Object.entries(GEAR).filter(([key,d])=>d.quality===q&&!Object.hasOwn(ANCIENT_FORGE,key));if(!pool.length)throw Error('Tower reward pool missing');return rollGearItem(pool[Math.min(pool.length-1,Math.floor(random()*pool.length))][0],random)}
