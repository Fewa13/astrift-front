// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export function mobRespawnDelay(players:number){return Math.max(4000,6000/Math.max(1,Math.min(3,players)))}
export function safeMobRespawn(x:number,z:number,_players:{x:number;z:number;hp:number}[]){return Number.isFinite(x)&&Number.isFinite(z)}
export function tribeRespawnFloor(monsters:{region:number;hp:number;kind:string;temporary?:boolean}[],boss:(kind:string)=>boolean){const counts=[0,0,0];for(const m of monsters)if(!m.temporary&&!boss(m.kind)&&m.hp>0)counts[m.region]=(counts[m.region]||0)+1;return counts;}
