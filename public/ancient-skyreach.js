// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { chapterPoint, chapterHeight, chapterBlocked, chapterClear, chapterPath, chapterSafe, CHAPTER_PROPS } from "./ancient-geography.js";
import { ancientBaseAttack, ancientBaseHealth } from "./ancient-gear.js";
import { ancientMobHealth, ancientMobDamageScale } from "./ancient-mob-stats.js";
import { ancientBossHealth } from "./ancient-boss-stats.js";
const SKYREACH_LEVEL = 220;
const SKYREACH_KINDS = {
  sky_lancer: { name: "\u5DE1\u7A79\u67AA\u536B", en: "Skywatch Lancer", size: 1.55, range: 3.2, speed: 4.3, boss: false },
  storm_weaver: { name: "\u7EC7\u96F7\u661F\u4F7F", en: "Stormweaver", size: 1.45, range: 19, speed: 3.8, boss: false },
  prism_golem: { name: "\u68F1\u6676\u91CD\u536B", en: "Prismatic Bulwark", size: 1.9, range: 3.8, speed: 3.7, boss: false },
  thunder_warden: { name: "\u9547\u96F7\u76D1\u5B88", en: "Warden of Thunder", size: 2.9, range: 11, speed: 3.7, boss: true },
  sky_sovereign: { name: "\u5BC2\u96F7\u5929\u541B", en: "Sovereign of the Silent Storm", size: 4.3, range: 15, speed: 3.5, boss: true }
};
const skyreachHeight = (x, z) => chapterHeight("skyreach", x, z);
const skyreachSurface = skyreachHeight;
const SKYREACH_SOLIDS = CHAPTER_PROPS.skyreach;
const skyreachBlocked = (x, z, r = 0.6, feet = skyreachHeight(x, z)) => chapterBlocked("skyreach", x, z, r, feet);
const skyreachLineClear = (ax, ay, az, bx, by, bz) => chapterClear("skyreach", ax, ay, az, bx, by, bz);
const skyreachPath = (ax, az, bx, bz) => chapterPath("skyreach", ax, az, bx, bz);
function skyreachMonsterHP(kind, level) {
  const k = SKYREACH_KINDS[kind];
  return !k ? 0 : Math.round(k.boss ? ancientBossHealth(level, kind === "thunder_warden" ? 6.5 : 9, 1.5, 5.5) : ancientMobHealth(level, ancientBaseAttack(level) * 12 * (kind === "prism_golem" ? 1.5 : kind === "storm_weaver" ? 1.1 : 1.3)));
}
function skyreachMonsterDamage(kind, level) {
  return SKYREACH_KINDS[kind] ? Math.round(ancientBaseHealth(level) * (kind === "sky_sovereign" ? 0.4 : kind === "thunder_warden" ? 0.28 : kind === "storm_weaver" ? 0.07 : 0.08) * (SKYREACH_KINDS[kind].boss ? 1 : ancientMobDamageScale(level))) : 0;
}
const SKYREACH_SPAWNS = Array.from({ length: 28 }, (_, i) => {
  const region = Math.floor(i / 7);
  return { kind: region === 0 ? "sky_lancer" : region === 1 ? "storm_weaver" : region === 2 ? "prism_golem" : i % 2 ? "prism_golem" : "sky_lancer", level: 220 + region * 10 + i % 7, x: [-9, 0, 9, 18][i % 7 % 4], z: [42, 112, 212, 314][region] + Math.floor(i % 7 / 4) * 17, region };
}).map((s) => ({ ...s, ...chapterSafe("skyreach", ...Object.values(chapterPoint("skyreach", s.x, s.z)), 1.8) }));
export {
  SKYREACH_KINDS,
  SKYREACH_LEVEL,
  SKYREACH_SOLIDS,
  SKYREACH_SPAWNS,
  skyreachBlocked,
  skyreachHeight,
  skyreachLineClear,
  skyreachMonsterDamage,
  skyreachMonsterHP,
  skyreachPath,
  skyreachSurface
};
