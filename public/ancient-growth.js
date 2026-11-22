// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const ANCIENT_GROWTH = { lateAnchor: 220, levelsPerStep: 20, stepMultiplier: 3, ordinaryHealthPerAttack: 18, normalKillsAt300: 80 };
function ancientLateGrowth(level) {
  return ANCIENT_GROWTH.stepMultiplier ** ((Math.max(ANCIENT_GROWTH.lateAnchor, level) - ANCIENT_GROWTH.lateAnchor) / ANCIENT_GROWTH.levelsPerStep);
}
export {
  ANCIENT_GROWTH,
  ancientLateGrowth
};
