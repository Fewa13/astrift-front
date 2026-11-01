// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {ancientBaseHealth,ancientBaseAttack} from './ancient-gear.js';
import {ancientMobHealth} from './ancient-mob-stats.js';
const BOSS_FACTORS:Record<string,[number,number]>={chief:[3,.18],lord:[5,.32],rootwarden:[4,.24],crystal_metal:[6,.34],crystal_wood:[6,.34],crystal_water:[6,.34],crystal_fire:[6,.34],crystal_earth:[7,.38],oathknight:[5,.29],emptyking:[8,.4]};
// Keep early encounters manageable; late bosses scale with same-level mobs
// instead of falling behind the player's faster-growing skill damage.
export function ancientBossHealth(level:number,healthFactor:number,mobFactor:number,mobRatio:number){const earlyFloor=.35+1.15*Math.min(1,Math.max(0,(level-60)/40));return Math.round(Math.max(ancientBaseHealth(level)*healthFactor*earlyFloor,ancientMobHealth(level,ancientBaseAttack(level)*12*mobFactor)*mobRatio))}
export function ancientBossHP(kind:string,level:number){const f=BOSS_FACTORS[kind];if(!f)return 0;const mobFactor=kind==='oathknight'||kind==='emptyking'?1.68:kind.startsWith('crystal_')?1.3:kind==='rootwarden'?1.1:1;const ratio=kind==='chief'||kind==='rootwarden'||kind==='oathknight'?6:kind==='crystal_earth'?9:8;return ancientBossHealth(level,f[0],mobFactor,ratio)}
export function ancientBossDamage(kind:string,level:number){const f=BOSS_FACTORS[kind];return f?Math.round(ancientBaseHealth(level)*f[1]):0}
