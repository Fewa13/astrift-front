const BOMB_START_CREDITS = 1200;
const BOMB_WIN_CREDITS = 1200;
const BOMB_LOSS_CREDITS = 800;
const BOMB_MAX_CREDITS = 5e3;
const BOMB_WEAPON_COSTS = { smg: 700, shotgun: 900, redline: 1e3, autoShotgun: 1400, gale: 1600, hammer: 1800, lmg: 2100, frost: 2600, meteor: 3e3 };
function bombWeaponCost(weapon) {
  return typeof weapon === "string" && Object.hasOwn(BOMB_WEAPON_COSTS, weapon) ? BOMB_WEAPON_COSTS[weapon] : null;
}
function buyBombWeapon(credits, weapon) {
  const cost = weapon === null ? 0 : bombWeaponCost(weapon);
  if (cost === null || credits < cost) return null;
  return { weapon, credits: credits - cost };
}
function awardBombCredits(credits, won) {
  return Math.min(BOMB_MAX_CREDITS, credits + (won ? BOMB_WIN_CREDITS : BOMB_LOSS_CREDITS));
}
export {
  BOMB_LOSS_CREDITS,
  BOMB_MAX_CREDITS,
  BOMB_START_CREDITS,
  BOMB_WEAPON_COSTS,
  BOMB_WIN_CREDITS,
  awardBombCredits,
  bombWeaponCost,
  buyBombWeapon
};
