// Level-only melee base. Equipment and combat modifiers are applied afterwards.
export const MELEE_LEVEL_BASE_MULTIPLIER=1;
export function meleeLevelBaseDamage(levelAttack:number,weaponAttack:number){return levelAttack*MELEE_LEVEL_BASE_MULTIPLIER+weaponAttack;}
