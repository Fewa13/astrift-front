// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { chapterPoint, chapterHeight, chapterBlocked, chapterClear, chapterPath, chapterSafe, CHAPTER_PROPS } from "./ancient-geography.js";
import { ancientBaseAttack, ancientBaseHealth } from "./ancient-gear.js";
import { ancientMobHealth, ancientMobDamageScale } from "./ancient-mob-stats.js";
import { ancientBossHealth } from "./ancient-boss-stats.js";
const FROSTCOURT_LEVEL = 180;
const FROSTCOURT_KINDS = {
  frost_oathguard: { name: "\u971C\u5951\u54E8\u536B", en: "Frostbound Oathguard", size: 1.55, range: 3.2, speed: 4.2, boss: false },
  ember_mason: { name: "\u70EC\u7089\u94F8\u5F79", en: "Emberforge Artificer", size: 1.4, range: 18, speed: 3.7, boss: false },
  chain_executor: { name: "\u65AD\u8A93\u6267\u5211\u8005", en: "Oathchain Executioner", size: 1.85, range: 3.8, speed: 4.4, boss: false },
  furnace_regent: { name: "\u7194\u8A93\u76D1\u5DE5", en: "Overseer of the Oathforge", size: 2.8, range: 10, speed: 3.7, boss: true },
  frost_crowned: { name: "\u971C\u70EC\u88C1\u4EE4\u8005", en: "The Frostfire Arbiter", size: 4.2, range: 14, speed: 3.5, boss: true }
};
const frostcourtHeight = (x, z) => chapterHeight("frostcourt", x, z);
const frostcourtSurface = frostcourtHeight;
const FROSTCOURT_SOLIDS = CHAPTER_PROPS.frostcourt;
const frostcourtBlocked = (x, z, r = 0.6, feet = frostcourtHeight(x, z)) => chapterBlocked("frostcourt", x, z, r, feet);
const frostcourtLineClear = (ax, ay, az, bx, by, bz) => chapterClear("frostcourt", ax, ay, az, bx, by, bz);
const frostcourtPath = (ax, az, bx, bz) => chapterPath("frostcourt", ax, az, bx, bz);
function frostcourtMonsterHP(kind, level) {
  if (!FROSTCOURT_KINDS[kind]) return 0;
  return Math.round(FROSTCOURT_KINDS[kind].boss ? ancientBossHealth(level, kind === "furnace_regent" ? 6 : 8.5, 1.5, 5.5) : ancientMobHealth(level, ancientBaseAttack(level) * 12 * (kind === "chain_executor" ? 1.5 : kind === "ember_mason" ? 1.1 : 1.3)));
}
function frostcourtMonsterDamage(kind, level) {
  return FROSTCOURT_KINDS[kind] ? Math.round(ancientBaseHealth(level) * (kind === "frost_crowned" ? 0.4 : kind === "furnace_regent" ? 0.28 : kind === "ember_mason" ? 0.07 : 0.08) * (FROSTCOURT_KINDS[kind].boss ? 1 : ancientMobDamageScale(level))) : 0;
}
const FROSTCOURT_SPAWNS = Array.from({ length: 28 }, (_, i) => {
  const region = Math.floor(i / 7);
  return { kind: region === 0 ? "frost_oathguard" : region === 1 ? "ember_mason" : region === 2 ? "chain_executor" : i % 2 ? "chain_executor" : "frost_oathguard", level: 180 + region * 10 + i % 7, x: [-16, -7, 7, 16][i % 7 % 4], z: [46, 120, 224, 324][region] + Math.floor(i % 7 / 4) * 18, region };
}).map((s) => ({ ...s, ...chapterSafe("frostcourt", ...Object.values(chapterPoint("frostcourt", s.x, s.z)), 1.8) }));
export {
  FROSTCOURT_KINDS,
  FROSTCOURT_LEVEL,
  FROSTCOURT_SOLIDS,
  FROSTCOURT_SPAWNS,
  frostcourtBlocked,
  frostcourtHeight,
  frostcourtLineClear,
  frostcourtMonsterDamage,
  frostcourtMonsterHP,
  frostcourtPath,
  frostcourtSurface
};
