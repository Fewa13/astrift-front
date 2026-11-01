// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { STARFALL_REBUILT, starfallWidth } from "./ancient-chapter-layouts.js";
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
function starfallHeight(_x, z) {
  return z < 110 ? 0 : z < 150 ? -(z - 110) * 0.15 : z < 250 ? -6 : z < 290 ? -6 - (z - 250) * 0.15 : -12;
}
function starfallSurface(x, z) {
  return starfallHeight(x, z) + (Math.hypot(x, z - 378) < 17 ? 0.3 : 0);
}
const STARFALL_SOLIDS = STARFALL_REBUILT;
function starfallBlocked(x, z, r = 0.6, feet = starfallHeight(x, z)) {
  if (z < 3 + r || z > 416 - r || Math.abs(x) > starfallWidth(z) - r) return true;
  return STARFALL_SOLIDS.some((o) => feet < starfallHeight(o.x, o.z) + o.h - 0.06 && Math.abs(x - o.x) < o.w / 2 + r && Math.abs(z - o.z) < o.d / 2 + r);
}
function starfallLineClear(ax, ay, az, bx, by, bz) {
  const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.35));
  for (let i = 1; i < n; i++) {
    const t = i / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t, y = ay + (by - ay) * t;
    if (Math.abs(x) > starfallWidth(z) || y < starfallSurface(x, z) - 0.1 || STARFALL_SOLIDS.some((o) => Math.abs(x - o.x) < o.w / 2 && Math.abs(z - o.z) < o.d / 2 && y < starfallHeight(o.x, o.z) + o.h)) return false;
  }
  return true;
}
function starfallPath(ax, az, bx, bz) {
  const valid = (x, z, tx, tz) => {
    const n = Math.max(1, Math.ceil(Math.hypot(tx - x, tz - z) / 0.5));
    for (let i = 1; i <= n; i++) if (starfallBlocked(x + (tx - x) * i / n, z + (tz - z) * i / n, 1)) return false;
    return true;
  };
  if (valid(ax, az, bx, bz)) return [{ x: bx, z: bz }];
  const first = { x: Math.round(ax / 4) * 4, z: Math.round(az / 4) * 4 };
  if (!valid(ax, az, first.x, first.z)) return [];
  const queue = [first], parents = /* @__PURE__ */ new Map([[first.x + "," + first.z, ""]]), nodes = /* @__PURE__ */ new Map([[first.x + "," + first.z, first]]);
  for (let i = 0; i < queue.length && i < 3e3; i++) {
    const p = queue[i], key = p.x + "," + p.z;
    if (Math.hypot(p.x - bx, p.z - bz) < 7 && valid(p.x, p.z, bx, bz)) {
      const out = [{ x: bx, z: bz }];
      let k = key;
      while (k) {
        out.push(nodes.get(k));
        k = parents.get(k);
      }
      return out.reverse();
    }
    for (const [dx, dz] of [[4, 0], [-4, 0], [0, 4], [0, -4]]) {
      const n = { x: p.x + dx, z: p.z + dz }, k = n.x + "," + n.z;
      if (!parents.has(k) && valid(p.x, p.z, n.x, n.z)) {
        parents.set(k, key);
        nodes.set(k, n);
        queue.push(n);
      }
    }
  }
  return [];
}
function starfallMonsterHP(kind, level) {
  return STARFALL_KINDS[kind] ? Math.round(kind === "starbound_heart" ? ancientBossHealth(level, 8.5, 1.5, 5.5) : ancientMobHealth(level, ancientBaseAttack(level) * 12 * (kind === "anchor_revenant" ? 1.5 : kind === "drowned_scribe" ? 1.1 : 1.3))) : 0;
}
function starfallMonsterDamage(kind, level) {
  return STARFALL_KINDS[kind] ? Math.round(ancientBaseHealth(level) * (kind === "starbound_heart" ? 0.4 : kind === "drowned_scribe" ? 0.07 : 0.08) * (STARFALL_KINDS[kind].boss ? 1 : ancientMobDamageScale(level))) : 0;
}
const STARFALL_SPAWNS = Array.from({ length: 24 }, (_, i) => {
  const region = Math.floor(i / 8);
  return { kind: ["tide_carapace", "drowned_scribe", "anchor_revenant"][region], level: 150 + region * 10 + i % 8, x: [-18, -6, 6, 18][i % 4], z: [52, 172, 310][region] + Math.floor(i % 8 / 4) * 36, region };
});
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
