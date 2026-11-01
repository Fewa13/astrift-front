// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const BOMB_START_CREDITS=1200;
export const BOMB_WIN_CREDITS=1200;
export const BOMB_LOSS_CREDITS=800;
export const BOMB_MAX_CREDITS=5000;
export const BOMB_WEAPON_COSTS={smg:700,shotgun:900,redline:1000,autoShotgun:1400,gale:1600,hammer:1800,lmg:2100,frost:2600,meteor:3000} as const;
export type BombShopWeapon=keyof typeof BOMB_WEAPON_COSTS;
export function bombWeaponCost(weapon:unknown){return typeof weapon==='string'&&Object.hasOwn(BOMB_WEAPON_COSTS,weapon)?BOMB_WEAPON_COSTS[weapon as BombShopWeapon]:null}
export function buyBombWeapon(credits:number,weapon:unknown){const cost=weapon===null?0:bombWeaponCost(weapon);if(cost===null||credits<cost)return null;return {weapon:weapon as BombShopWeapon|null,credits:credits-cost}}
export function awardBombCredits(credits:number,won:boolean){return Math.min(BOMB_MAX_CREDITS,credits+(won?BOMB_WIN_CREDITS:BOMB_LOSS_CREDITS))}
