// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { jadeQualityBonus } from "./ancient-jade-quality.js";
function jadeSlot(kind) {
  return kind === "bangle" || kind === "bracelet" ? "wrist" : kind === "buddha" || kind === "peace" ? "chest" : null;
}
function equippedJade(p) {
  const result = {};
  for (const slot of ["wrist", "chest"]) {
    const item = p.collections?.find((i) => i.id === p.jadeEquipped?.[slot]);
    if (item && jadeSlot(item.kind) === slot) result[slot] = item;
  }
  return result;
}
function isJadeWorn(p, id) {
  return Object.values(equippedJade(p)).some((i) => i.id === id);
}
function jadeItemBonus(item) {
  const value = Number.isFinite(item.value) ? Math.max(0, item.value) : 0;
  return Math.min(0.12, Math.log2(1 + value / 100) * 0.01) + jadeQualityBonus(item);
}
function jadeBonuses(p) {
  const items = equippedJade(p), w = items.wrist ? jadeItemBonus(items.wrist) : 0, c = items.chest ? jadeItemBonus(items.chest) : 0;
  return { attack: w, health: w * 0.5 + c * 1.5, reduction: c * 0.25 };
}
function jadeWearRefs(p) {
  return Object.fromEntries(Object.entries(equippedJade(p)).map(([slot, item]) => [slot, item.id]));
}
export {
  equippedJade,
  isJadeWorn,
  jadeBonuses,
  jadeItemBonus,
  jadeSlot,
  jadeWearRefs
};
