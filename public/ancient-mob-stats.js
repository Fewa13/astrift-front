// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { ancientBaseAttack, ancientBaseHealth } from "./ancient-gear.js";
const MOB_FACTORS = { grox: [1, 1], hunter: [0.95, 1.1], mossling: [1.1, 1], thorn: [1, 1.1], sentinel: [1.3, 1.15], city_husk: [1.32, 1.15], city_guard: [1.68, 1.3225], city_acolyte: [1.38, 1.265] };
function ancientMobDamageScale(level) {
  return Math.max(1, level / 100) ** 1.5;
}
function ancientMobHealth(level, legacy) {
  const holyRamp = Math.min(1, Math.max(0, (level - 50) / 30)), factor = level < 20 ? 6.3 : level < 30 ? 10 + 0.75 * (level - 20) : 17.5 + 26.1 * holyRamp;
  return Math.round(Math.max(legacy, ancientBaseAttack(level) * factor) * Math.min(2, Math.max(1, level / 100) ** 0.6));
}
function ancientMobHP(kind, level) {
  const f = MOB_FACTORS[kind];
  if (!f) return 0;
  const progress = Math.min(1, Math.max(0, (level - 1) / 69));
  return ancientMobHealth(level, ancientBaseAttack(level) * (8 + 4 * progress) * f[0]);
}
function ancientMobDamage(kind, level) {
  const f = MOB_FACTORS[kind];
  if (!f) return 0;
  const progress = Math.min(1, Math.max(0, (level - 1) / 49));
  return Math.max(Math.round(20 * f[1]), Math.round(ancientBaseHealth(level) * (0.04 + 0.025 * progress) * f[1] * ancientMobDamageScale(level)));
}
export {
  ancientMobDamage,
  ancientMobDamageScale,
  ancientMobHP,
  ancientMobHealth
};
