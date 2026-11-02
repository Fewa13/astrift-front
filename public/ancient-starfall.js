// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { chapterPoint, chapterHeight, chapterBlocked, chapterClear, chapterPath, chapterSafe, CHAPTER_PROPS } from "./ancient-geography.js";
import { ancientBaseAttack, ancientBaseHealth } from "./ancient-gear.js";
import { ancientMobHealth, ancientMobDamageScale } from "./ancient-mob-stats.js";
import { ancientBossHealth } from "./ancient-boss-stats.js";
const STARFALL_LEVEL = 150;
const STARFALL_KINDS = {
  tide_carapace: { name: "\u6F6E\u58F3\u6F5C\u536B", en: "Tidecarapace Guardian", size: 1.5, range: 3.2, speed: 4.1, boss: false },
  drowned_scribe: { name: "\u6EBA\u661F\u4E66\u8BB0", en: "Drowned Star Scribe", size: 1.3, range: 18, speed: 3.8, boss: false },
  anchor_revenant: { name: "\u7F1A\u951A\u9057\u9AB8", en: "Anchorbound Revenant", size: 1.8, range: 3.6, speed: 4.3, boss: false },
  starbound_heart: { name: "\u6C89\u661F\u6267\u6838\u8005", en: "The Sunken Corekeeper", size: 4, range: 14, speed: 3.6, boss: true }
};
const starfallHeight = (x, z) => chapterHeight("starfall", x, z);
const starfallSurface = starfallHeight;
const STARFALL_SOLIDS = CHAPTER_PROPS.starfall;
const starfallBlocked = (x, z, r = 0.6, feet = starfallHeight(x, z)) => chapterBlocked("starfall", x, z, r, feet);
const starfallLineClear = (ax, ay, az, bx, by, bz) => chapterClear("starfall", ax, ay, az, bx, by, bz);
const starfallPath = (ax, az, bx, bz) => chapterPath("starfall", ax, az, bx, bz);
function starfallMonsterHP(kind, level) {
  return STARFALL_KINDS[kind] ? Math.round(kind === "starbound_heart" ? ancientBossHealth(level, 8.5, 1.5, 5.5) : ancientMobHealth(level, ancientBaseAttack(level) * 12 * (kind === "anchor_revenant" ? 1.5 : kind === "drowned_scribe" ? 1.1 : 1.3))) : 0;
}
function starfallMonsterDamage(kind, level) {
  return STARFALL_KINDS[kind] ? Math.round(ancientBaseHealth(level) * (kind === "starbound_heart" ? 0.4 : kind === "drowned_scribe" ? 0.07 : 0.08) * (STARFALL_KINDS[kind].boss ? 1 : ancientMobDamageScale(level))) : 0;
}
const STARFALL_SPAWNS = Array.from({ length: 24 }, (_, i) => {
  const region = Math.floor(i / 8);
  return { kind: ["tide_carapace", "drowned_scribe", "anchor_revenant"][region], level: 150 + region * 10 + i % 8, x: [-18, -6, 6, 18][i % 4], z: [52, 172, 310][region] + Math.floor(i % 8 / 4) * 36, region };
}).map((s) => ({ ...s, ...chapterSafe("starfall", ...Object.values(chapterPoint("starfall", s.x, s.z)), 1.8) }));
export {
  STARFALL_KINDS,
  STARFALL_LEVEL,
  STARFALL_SOLIDS,
  STARFALL_SPAWNS,
  starfallBlocked,
  starfallHeight,
  starfallLineClear,
  starfallMonsterDamage,
  starfallMonsterHP,
  starfallPath,
  starfallSurface
};
