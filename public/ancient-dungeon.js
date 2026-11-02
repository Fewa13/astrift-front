// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { dungeonMechanismSolids } from "./ancient-dungeon-mechanisms.js";
const DUNGEON_TIERS = [
  { id: "burrow", name: "\u517D\u9AA8\u5730\u7A74", en: "Bone Burrow", level: 20, quality: 2, material: "hollowSeal2" },
  { id: "depths", name: "\u788E\u9AA8\u6DF1\u5C42", en: "Bonebreaker Depths", level: 40, quality: 3, material: "hollowSeal3" },
  { id: "sanctum", name: "\u914B\u957F\u7981\u5730", en: "Chieftain Sanctum", level: 65, quality: 4, material: "hollowSeal4" }
];
const ASCENSION_DUNGEON_TIERS = [
  { id: "ascensionTrial", name: "\u5347\u534E\u8003\u9A8C", en: "Ascension Trial", level: 80, quality: 5, material: "core" },
  { id: "ascensionFinal", name: "\u5723\u804C\u4EEA\u5F0F", en: "Sacred Rite", level: 80, quality: 5, material: "core" }
];
const dungeonId = (map) => typeof map === "string" && /^dungeon:[1-9]\d{0,8}$/.test(map) ? Number(map.slice(8)) : 0;
const isDungeonMap = (map) => dungeonId(map) > 0;
const DUNGEON_PILLARS = [{ x: -10, z: 144 }, { x: 10, z: 156 }, { x: -10, z: 171 }];
const DUNGEON_BLOCKS = [
  { x: -13, z: 34, w: 6, d: 8, h: 5 },
  { x: 12, z: 45, w: 5, d: 7, h: 4 },
  { x: -12, z: 91, w: 6, d: 9, h: 5 },
  { x: 13, z: 108, w: 6, d: 8, h: 5 },
  ...[64, 124].flatMap((z) => [-16, 16].map((x) => ({ x, z, w: 16, d: 5, h: 10 }))),
  ...DUNGEON_PILLARS.map((p) => ({ ...p, w: 3, d: 3, h: 9 }))
];
const geometry = /* @__PURE__ */ new Map();
function setDungeonGeometry(map, collapsed, gateZ = 189, mechanisms, tower = false) {
  if (!isDungeonMap(map)) return;
  if (geometry.size > 128 && !geometry.has(map)) geometry.delete(geometry.keys().next().value);
  geometry.set(map, { collapsed, gateZ, mechanisms, tower });
}
function solids(map) {
  if (geometry.get(map || "")?.tower) return [];
  const { collapsed, gateZ, mechanisms } = geometry.get(map || "") || { collapsed: [], gateZ: 189 };
  return [...DUNGEON_BLOCKS.filter((o) => !collapsed.some((i) => DUNGEON_PILLARS[i].x === o.x && DUNGEON_PILLARS[i].z === o.z)), ...dungeonObstacles({ collapsed }), ...dungeonMechanismSolids(mechanisms), ...gateZ < 189 ? [{ x: 0, z: gateZ + 1, w: gateZ === 162 ? 48 : 16, d: 2, h: 14 }] : []];
}
function dungeonBlocked(x, z, r = 0.6, map) {
  if (geometry.get(map || "")?.tower) return !Number.isFinite(x + z) || Math.abs(x) > 22 - r || z < 3 + r || z > 55 - r;
  return !Number.isFinite(x + z) || Math.abs(x) > 24 - r || z < 3 + r || z > (geometry.get(map || "")?.gateZ || 189) - r || solids(map).some((o) => Math.abs(x - o.x) < o.w / 2 + r && Math.abs(z - o.z) < o.d / 2 + r);
}
function dungeonLineClear(ax, ay, az, bx, by, bz, map, ignore) {
  return !solids(map).some((o) => {
    if (ignore && o.x === ignore.x && o.z === ignore.z) return false;
    let lo = 0, hi = 1;
    for (const [a, b, min, max] of [[ax, bx, o.x - o.w / 2, o.x + o.w / 2], [ay, by, 0, o.h], [az, bz, o.z - o.d / 2, o.z + o.d / 2]]) {
      const d = b - a;
      if (Math.abs(d) < 1e-8) {
        if (a < min || a > max) return false;
      } else {
        const u = (min - a) / d, v = (max - a) / d;
        lo = Math.max(lo, Math.min(u, v));
        hi = Math.min(hi, Math.max(u, v));
        if (lo > hi) return false;
      }
    }
    return hi >= 0 && lo <= 1;
  });
}
function dungeonControlClear(ax, ay, az, bx, by, bz, map) {
  return dungeonLineClear(ax, ay, az, bx, by, bz, map, { x: bx, z: bz });
}
function dungeonPath(ax, az, bx, bz, map) {
  const cell = 2, nx = 23, nz = 92, key = (x, z) => z * nx + x;
  const point = (i) => ({ x: -22 + i % nx * cell, z: 5 + Math.floor(i / nx) * cell });
  const index = (x, z) => key(Math.max(0, Math.min(nx - 1, Math.round((x + 22) / cell))), Math.max(0, Math.min(nz - 1, Math.round((z - 5) / cell))));
  const start = index(ax, az), end = index(bx, bz), queue = [start], prev = /* @__PURE__ */ new Map([[start, -1]]);
  let head = 0;
  while (head < queue.length && queue.length < 2200) {
    const i = queue[head++];
    if (i === end) break;
    for (const j of [i - 1, i + 1, i - nx, i + nx]) {
      if (j < 0 || j >= nx * nz || Math.abs(j % nx - i % nx) > 1 || prev.has(j)) continue;
      const p = point(j);
      if (dungeonBlocked(p.x, p.z, 1, map)) continue;
      prev.set(j, i);
      queue.push(j);
    }
  }
  if (!prev.has(end)) return [];
  const result = [];
  for (let i = end; i !== start && i >= 0; i = prev.get(i)) result.push(point(i));
  return result.reverse();
}
const dungeonHealthScale = (players) => 1 + 0.65 * (Math.max(1, Math.min(3, players)) - 1);
const dungeonDamageScale = (players) => 1 + 0.05 * (Math.max(1, Math.min(3, players)) - 1);
function dungeonObstacles(run) {
  return run.collapsed.map((i) => {
    const p = DUNGEON_PILLARS[i];
    return { x: p.x + (p.x < 0 ? 4 : -4), z: p.z, w: 10, d: 3, h: 1.5 };
  });
}
function dungeonRubbleBlocked(run, x, z, r = 0.6) {
  return dungeonObstacles(run).some((o) => Math.abs(x - o.x) < o.w / 2 + r && Math.abs(z - o.z) < o.d / 2 + r);
}
function dungeonTraps(seed) {
  let n = seed >>> 0;
  const rand = () => {
    n = 1664525 * n + 1013904223 >>> 0;
    return n / 4294967296;
  };
  return [82, 98, 114].map((z) => ({ x: Math.round((rand() - 0.5) * 24), z: z + Math.round(rand() * 4) }));
}
function dungeonEliteXP(baseXP, kind, level, run) {
  return run && !run.hunt && !run.ascensionJob && kind === "chief" ? Math.min(baseXP, Math.floor(200 * level ** 2 * 0.1)) : baseXP;
}
export {
  ASCENSION_DUNGEON_TIERS,
  DUNGEON_BLOCKS,
  DUNGEON_PILLARS,
  DUNGEON_TIERS,
  dungeonBlocked,
  dungeonControlClear,
  dungeonDamageScale,
  dungeonEliteXP,
  dungeonHealthScale,
  dungeonId,
  dungeonLineClear,
  dungeonObstacles,
  dungeonPath,
  dungeonRubbleBlocked,
  dungeonTraps,
  isDungeonMap,
  setDungeonGeometry
};
