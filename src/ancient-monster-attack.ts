// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export type MonsterWindup={started:number;hitAt:number;target:string;angle?:number;tx?:number;tz?:number};
export const rangedMonster=(kind:string)=>['sand_oracle','storm_weaver','ember_mason','drowned_scribe','hunter','thorn','city_acolyte','mirror_wraith'].includes(kind);
export function beginMonsterAttack(m:{kind:string;x:number;z:number},target:{name:string;x:number;z:number},now:number):MonsterWindup{return {started:now,hitAt:now+600,target:target.name,angle:Math.atan2(target.x-m.x,target.z-m.z),tx:target.x,tz:target.z};}
export function monsterMeleeConnect(m:{x:number;z:number},cast:MonsterWindup,target:{x:number;z:number},range:number){const dx=target.x-m.x,dz=target.z-m.z,angle=Math.atan2(dx,dz)-(cast.angle??Math.atan2(dx,dz));return Math.hypot(dx,dz)<=range&&Math.cos(angle)>=Math.cos(Math.PI*.45);}
export const monsterProjectileRadius=(kind:string)=>kind==='hunter'?.7:.85;

export function monsterAttackCycle(kind:string,fallback:number){return ['sky_lancer','prism_golem','frost_oathguard','chain_executor','tide_carapace','anchor_revenant','grox','blight_beast','blight_stalker','rift_maw','sanctum_sentinel','seal_warden'].includes(kind)?1000:fallback;}
