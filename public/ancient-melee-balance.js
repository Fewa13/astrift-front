// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const MELEE_LEVEL_BASE_MULTIPLIER = 1;
function meleeLevelBaseDamage(levelAttack, weaponAttack) {
  return levelAttack * MELEE_LEVEL_BASE_MULTIPLIER + weaponAttack;
}
export {
  MELEE_LEVEL_BASE_MULTIPLIER,
  meleeLevelBaseDamage
};
