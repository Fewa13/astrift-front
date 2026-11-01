// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { passageInside, PASSAGE_RECTS, leisureSolid } from "./ancient-leisure.js";
import { ancientBossHP, ancientBossDamage } from "./ancient-boss-stats.js";
import { ancientMobHP, ancientMobDamage } from "./ancient-mob-stats.js";
const FOREST_ALTARS = [{ element: "metal", x: 81, z: 310, color: 16766315 }, { element: "wood", x: 12, z: 251, color: 7463825 }, { element: "water", x: 150, z: 251, color: 6475007 }, { element: "fire", x: 150, z: 371, color: 16740440 }, { element: "earth", x: 12, z: 371, color: 14332024 }];
function forestCompactPoint(x, z) {
  return z >= 205 ? { x: 60 + (x - 60) * 0.7, z: 205 + (z - 205) * 0.7 } : { x, z };
}
function forestHeight(x, z) {
  return z < 105 ? 0 : z < 145 ? (z - 105) * 0.25 : 10;
}
function forestSurface(x, z) {
  let height = forestHeight(x, z);
  for (const a of FOREST_ALTARS) for (let i = 0; i < 3; i++) if (Math.hypot(x - a.x, z - a.z) <= 15 - i * 1.8) height = Math.max(height, 9.95 + i * 0.12);
  return height;
}
function forestInside(x, z, r = 0) {
  return passageInside("forest", x, z, r) || x > -35 + r && x < 35 - r && z > 3 + r && z < 190 - r || x > 25 + r && x < 95 - r && z > 158 + r && z < 190 - r || x > 44 + r && x < 76 - r && z > 180 + r && z < 220 - r || x > -12 + r && x < 174 - r && z > 205 + r && z < 394 - r;
}
const FOREST_CLIFFS = [];
const forestRects = [[-35, 35, 3, 190], [25, 95, 158, 190], [44, 76, 180, 220], [-12, 174, 205, 394], ...PASSAGE_RECTS.forest];
const cutsX = [...new Set(forestRects.flatMap((r) => r.slice(0, 2)))], cutsZ = [...new Set(forestRects.flatMap((r) => r.slice(2)))];
for (const [left, right, back, front] of forestRects) {
  for (const [axis, edge, lo, hi, sign] of [[0, left, back, front, -1], [0, right, back, front, 1], [1, back, left, right, -1], [1, front, left, right, 1]]) {
    const cuts = [lo, hi, ...(axis === 0 ? cutsZ : cutsX).filter((v) => v > lo && v < hi)].sort((a, b) => a - b);
    for (let i = 1; i < cuts.length; i++) {
      const mid = (cuts[i - 1] + cuts[i]) / 2;
      if (forestInside(axis === 0 ? edge + sign * 0.01 : mid, axis === 0 ? mid : edge + sign * 0.01)) continue;
      for (let start = cuts[i - 1]; start < cuts[i]; start += 5) {
        const length = Math.min(5, cuts[i] - start), center = start + length / 2;
        FOREST_CLIFFS.push(axis === 0 ? { x: edge + sign * 2.5, z: center, w: 5, d: length } : { x: center, z: edge + sign * 2.5, w: length, d: 5 });
      }
    }
  }
}
const cliffKeys = /* @__PURE__ */ new Set();
for (let i = FOREST_CLIFFS.length - 1; i >= 0; i--) {
  const c = FOREST_CLIFFS[i], key = [c.x, c.z, c.w, c.d].join(":");
  if (cliffKeys.has(key)) FOREST_CLIFFS.splice(i, 1);
  else cliffKeys.add(key);
}
const FOREST_TREES = [];
let seed = 783121;
const random = () => {
  seed = 1664525 * seed + 1013904223 >>> 0;
  return seed / 4294967296;
};
for (let i = 0; i < 92; i++) {
  const x = (random() - 0.5) * 60, z = 26 + random() * 78;
  if (Math.abs(x) < 5 || Math.hypot(x, z - 10) < 22) continue;
  FOREST_TREES.push({ x, z, r: 0.75 + random() * 0.65, h: 13 + random() * 9, giant: false });
}
for (const [x, z] of [[-22, 151], [19, 153], [-18, 177], [15, 179]]) FOREST_TREES.push({ x, z, r: 2.4, h: 42, giant: true });
for (let i = 0; i < 80; i++) {
  const x = -1 + random() * 164, z = 207 + random() * 181;
  if (x > 15 && x < 147 && z > 222 && z < 380 || FOREST_ALTARS.some((a) => Math.hypot(a.x - x, a.z - z) < 24) || Math.abs(x - 60) < 9 && z < 250) continue;
  FOREST_TREES.push({ x, z, r: 1 + random() * 0.55, h: 15 + random() * 13, giant: false });
}
function forestSafePosition(x, z, r = 1.8) {
  if (!forestBlocked(x, z, r)) return { x, z };
  for (let distance = 2; distance < 500; distance += 2) for (let i = 0; i < 24; i++) {
    const angle = i / 24 * Math.PI * 2, nx = x + Math.cos(angle) * distance, nz = z + Math.sin(angle) * distance;
    if (!forestBlocked(nx, nz, r)) return { x: nx, z: nz };
  }
  return { x: 60, z: 210 };
}
function forestBlocked(x, z, r = 0.6) {
  return !forestInside(x, z, r) || leisureSolid("forest", x, z, r) || FOREST_TREES.some((t) => Math.hypot(x - t.x, z - t.z) < t.r + r);
}
function forestLineClear(ax, ay, az, bx, by, bz) {
  const length = Math.hypot(bx - ax, bz - az), steps = Math.max(1, Math.ceil(length / 0.45));
  for (let i = 1; i < steps; i++) {
    const t = i / steps, x = ax + (bx - ax) * t, z = az + (bz - az) * t, y = ay + (by - ay) * t;
    if (!forestInside(x, z) || y < forestHeight(x, z) - 0.1 || FOREST_TREES.some((o) => Math.hypot(x - o.x, z - o.z) < o.r && y < forestHeight(o.x, o.z) + o.h)) return false;
  }
  return true;
}
const FOREST_KINDS = {
  mossling: { name: "\u82D4\u7532\u517D", en: "Mossback", size: 1.25, hp: 220, damage: 35, xp: 60, range: 2.8, speed: 3.5, boss: false },
  thorn: { name: "\u68D8\u679D\u730E\u624B", en: "Thornstalker", size: 1.4, hp: 280, damage: 42, xp: 90, range: 18, speed: 4, boss: false },
  sentinel: { name: "\u6676\u58F3\u5B88\u536B", en: "Crystal Sentinel", size: 1.7, hp: 360, damage: 50, xp: 130, range: 3.5, speed: 3.8, boss: false },
  rootwarden: { name: "\u53E4\u6839\u5B88\u671B\u8005", en: "Ancient Rootwarden", size: 4, hp: 9e3, damage: 250, xp: 2400, range: 9, speed: 3, boss: true },
  crystal_metal: { name: "\u91D1\u66DC\u6C34\u6676\u5DE8\u4EBA", en: "Aurum Crystal Titan", size: 4.8, hp: 15e3, damage: 340, xp: 4e3, range: 12, speed: 3.4, boss: true },
  crystal_wood: { name: "\u82CD\u6728\u6C34\u6676\u5DE8\u4EBA", en: "Verdant Crystal Titan", size: 4.8, hp: 15e3, damage: 340, xp: 4e3, range: 12, speed: 3.4, boss: true },
  crystal_water: { name: "\u6CA7\u6F9C\u6C34\u6676\u5DE8\u4EBA", en: "Tidal Crystal Titan", size: 4.8, hp: 15e3, damage: 340, xp: 4e3, range: 15, speed: 3.4, boss: true },
  crystal_fire: { name: "\u7194\u7130\u6C34\u6676\u5DE8\u4EBA", en: "Ember Crystal Titan", size: 4.8, hp: 15e3, damage: 340, xp: 4e3, range: 12, speed: 3.4, boss: true },
  crystal_earth: { name: "\u7384\u5CA9\u6C34\u6676\u5DE8\u4EBA", en: "Terra Crystal Titan", size: 5.2, hp: 18e3, damage: 380, xp: 4200, range: 12, speed: 2.8, boss: true }
};
function forestMonsterHP(kind, level) {
  return ancientBossHP(kind, level) || ancientMobHP(kind, level) || Math.floor(FOREST_KINDS[kind].hp * level * 1.075 ** Math.max(0, level - 30));
}
function forestMonsterDamage(kind, level, skill = "attack") {
  return Math.floor((ancientBossDamage(kind, level) || ancientMobDamage(kind, level) || FOREST_KINDS[kind].damage * 1.13 ** Math.max(0, level - 1)) * (skill === "roar" ? 0.6 : 1));
}
const nav = /* @__PURE__ */ new Map();
for (let x = -70; x <= 205; x += 5) for (let z = 10; z <= 460; z += 5) if (!forestBlocked(x, z, 1.15)) nav.set(x + "," + z, { x, z });
function walkSegment(ax, az, bx, bz) {
  const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.5));
  for (let i = 1; i <= n; i++) if (forestBlocked(ax + (bx - ax) * i / n, az + (bz - az) * i / n, 1)) return false;
  return true;
}
function forestPath(ax, az, bx, bz) {
  if (walkSegment(ax, az, bx, bz)) return [{ x: bx, z: bz }];
  const nearest = (x, z) => [...nav.entries()].filter(([, p]) => Math.hypot(p.x - x, p.z - z) < 12 && walkSegment(x, z, p.x, p.z)).sort((a, b) => Math.hypot(a[1].x - x, a[1].z - z) - Math.hypot(b[1].x - x, b[1].z - z))[0];
  const start = nearest(ax, az), end = nearest(bx, bz);
  if (!start || !end) return [];
  const queue = [start[0]], parent = /* @__PURE__ */ new Map([[start[0], ""]]);
  for (let head = 0; head < queue.length && head < 5500; head++) {
    const key = queue[head], p = nav.get(key);
    if (key === end[0]) {
      const path = [{ x: bx, z: bz }];
      let k = key;
      while (k !== start[0]) {
        path.push(nav.get(k));
        k = parent.get(k);
      }
      path.push(start[1]);
      return path.reverse();
    }
    for (const [dx, dz] of [[5, 0], [-5, 0], [0, 5], [0, -5]]) {
      const next = p.x + dx + "," + (p.z + dz);
      if (!parent.has(next) && nav.has(next) && walkSegment(p.x, p.z, p.x + dx, p.z + dz)) {
        parent.set(next, key);
        queue.push(next);
      }
    }
  }
  return [];
}
export {
  FOREST_ALTARS,
  FOREST_CLIFFS,
  FOREST_KINDS,
  FOREST_TREES,
  forestBlocked,
  forestCompactPoint,
  forestHeight,
  forestInside,
  forestLineClear,
  forestMonsterDamage,
  forestMonsterHP,
  forestPath,
  forestSafePosition,
  forestSurface
};
