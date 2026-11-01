// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { gearDefinition, GEAR_AFFIXES } from "./ancient-gear.js";
const MARKET_CATEGORIES = [["rough", "\u539F\u77F3", "Rough stones"], ["bangle", "\u624B\u956F", "Bangles"], ["bracelet", "\u624B\u4E32", "Bracelets"], ["buddha", "\u7389\u4F5B\u540A\u5760", "Jade Buddha pendants"], ["peace", "\u5E73\u5B89\u6263", "Peace pendants"], ["helmet", "\u5934\u76D4", "Helmets"], ["armor", "\u80F8\u7532", "Chest armor"], ["weapon", "\u6B66\u5668", "Weapons"]];
function isMarketGear(item) {
  return "asset" in item && item.asset === "gear";
}
function marketGearValue(item) {
  const d = gearDefinition(item.key);
  if (!d) return 0;
  let affix = 0;
  for (const a of item.affixes || []) {
    const def = GEAR_AFFIXES[a.key];
    if (def && def.slots.includes(d.slot) && Number.isFinite(a.value)) affix += Math.max(0, Math.min(1, a.value / def.max)) * 0.12;
  }
  return Math.floor([100, 1200, 9e3, 6e4, 3e5, 15e5, 4e6, 1e7][d.quality - 1] * (d.slot === "weapon" ? 1.25 : d.slot === "armor" ? 1.1 : 1) * (1 + affix));
}
function marketMinimumPrice(_value) {
  return 1;
}
function marketGearItem(gear) {
  const d = gearDefinition(gear.key);
  return d && ["weapon", "armor", "helmet"].includes(d.slot) ? { asset: "gear", id: gear.id, kind: d.slot, value: marketGearValue(gear), gear: structuredClone(gear) } : null;
}
export {
  MARKET_CATEGORIES,
  isMarketGear,
  marketGearItem,
  marketGearValue,
  marketMinimumPrice
};
