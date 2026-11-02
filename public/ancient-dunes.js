// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { chapterPoint, chapterSafe, chapterHeight, chapterBlocked, chapterClear, chapterPath } from "./ancient-geography.js";
import { ancientBaseAttack, ancientBaseHealth } from "./ancient-gear.js";
import { ancientMobHealth, ancientMobDamageScale } from "./ancient-mob-stats.js";
import { ancientBossHealth } from "./ancient-boss-stats.js";
const DUNES_LEVEL = 260;
const DUNES_KINDS = {
  dune_scarab: { name: "\u7802\u7532\u6398\u884C\u8005", en: "Burrowing Sandscarab", size: 1.45, range: 3.2, speed: 4.1, boss: false },
  sand_oracle: { name: "\u9010\u6C99\u796D\u5E08", en: "Dunewind Oracle", size: 1.4, range: 20, speed: 3.6, boss: false },
  glass_jackal: { name: "\u7409\u7802\u730E\u517D", en: "Glassfang Jackal", size: 1.6, range: 3.4, speed: 4.8, boss: false },
  buried_marshal: { name: "\u57CB\u8A93\u5C06\u519B", en: "The Entombed Marshal", size: 3.2, range: 11, speed: 3.6, boss: true },
  hourglass_regent: { name: "\u66AE\u6C99\u53F8\u547D", en: "The Duskglass Regent", size: 4.5, range: 15, speed: 3.4, boss: true }
};
const dunesHeight = (x, z) => chapterHeight("dunes", x, z), dunesSurface = dunesHeight;
const dunesBlocked = (x, z, r = 0.6, feet = dunesHeight(x, z)) => chapterBlocked("dunes", x, z, r, feet);
const dunesLineClear = (ax, ay, az, bx, by, bz) => chapterClear("dunes", ax, ay, az, bx, by, bz);
const dunesPath = (ax, az, bx, bz) => chapterPath("dunes", ax, az, bx, bz);
function dunesMonsterHP(kind, level) {
  const d = DUNES_KINDS[kind];
  return !d ? 0 : d.boss ? ancientBossHealth(level, kind === "buried_marshal" ? 6.5 : 9, 1.5, 5.5) : ancientMobHealth(level, ancientBaseAttack(level) * 12 * (kind === "sand_oracle" ? 1.1 : kind === "glass_jackal" ? 1.5 : 1.3));
}
function dunesMonsterDamage(kind, level) {
  const d = DUNES_KINDS[kind];
  return !d ? 0 : Math.round(ancientBaseHealth(level) * (kind === "hourglass_regent" ? 0.4 : kind === "buried_marshal" ? 0.28 : kind === "sand_oracle" ? 0.07 : 0.08) * (d.boss ? 1 : ancientMobDamageScale(level)));
}
const DUNES_SPAWNS = Array.from({ length: 28 }, (_, i) => {
  const region = Math.floor(i / 7), kind = region === 0 ? "dune_scarab" : region === 1 ? "sand_oracle" : region === 2 ? "glass_jackal" : i % 2 ? "glass_jackal" : "dune_scarab", point = chapterPoint("dunes", [-18, -6, 8, 18][i % 4], [40, 135, 215, 325][region] + Math.floor(i % 7 / 4) * 18);
  return { kind, level: 260 + region * 10 + i % 7, ...chapterSafe("dunes", point.x, point.z, 1.8), region };
});
const DUNES_BOSSES = [{ kind: "buried_marshal", level: 280, ...chapterPoint("dunes", 20, 180), region: 1 }, { kind: "hourglass_regent", level: 300, ...chapterPoint("dunes", 0, 365), region: 3 }];
export {
  DUNES_BOSSES,
  DUNES_KINDS,
  DUNES_LEVEL,
  DUNES_SPAWNS,
  dunesBlocked,
  dunesHeight,
  dunesLineClear,
  dunesMonsterDamage,
  dunesMonsterHP,
  dunesPath,
  dunesSurface
};
