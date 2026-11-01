// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { ancientBaseAttack, ancientBaseHealth } from "./ancient-gear.js";
import { ancientBossHealth } from "./ancient-boss-stats.js";
import { ancientMobHealth, ancientMobDamageScale } from "./ancient-mob-stats.js";
function corruptionMapEntry(p, map) {
  if (!p.corrupted) {
    delete p.corruptedMap;
    return false;
  }
  if (map === (p.corruptedMap || "blight")) {
    p.corruptedMap = map;
    return false;
  }
  p.corrupted = false;
  delete p.corruptedMap;
  return true;
}
const BLIGHT_LEVEL = 90;
const BLIGHT_KINDS = {
  blight_beast: { name: "\u8F7B\u8680\u517D", en: "Blight-Touched Beast", size: 1.15, range: 2.6, speed: 4, boss: false },
  blight_stalker: { name: "\u6839\u8109\u6F5C\u4F0F\u8005", en: "Rootvein Stalker", size: 1.5, range: 3.2, speed: 4.4, boss: false },
  rift_maw: { name: "\u88C2\u53E3\u9B54\u7269", en: "Riftmaw", size: 1.8, range: 3.6, speed: 4.6, boss: false },
  blight_lord: { name: "\u8680\u5FC3\u9886\u4E3B", en: "The Blightheart Lord", size: 4.2, range: 12, speed: 3.7, boss: true }
};
const BLIGHT_HOUSES = [-1, 1].flatMap((side) => [235, 290, 345].map((z) => ({ x: side * 30, z, w: 18, d: 24, h: 8, side })));
const BLIGHT_SOLIDS = [];
for (const b of BLIGHT_HOUSES) {
  const front = b.x - b.side * b.w / 2;
  for (const s of [-1, 1]) BLIGHT_SOLIDS.push({ x: front, z: b.z + s * 8, w: 1, d: 8, h: 8, kind: "wall" });
  BLIGHT_SOLIDS.push({ x: front, z: b.z, w: 1, d: 8, h: 8, bottom: 5, kind: "wall" }, { x: b.x + b.side * b.w / 2, z: b.z, w: 1, d: 24, h: 8, kind: "wall" }, { x: b.x, z: b.z - 12, w: 18, d: 1, h: 8, kind: "wall" }, { x: b.x, z: b.z + 12, w: 18, d: 1, h: 8, kind: "wall" }, { x: b.x, z: b.z, w: 18, d: 24, h: 8, bottom: 7.65, kind: "roof" });
}
for (let i = 0; i < 28; i++) {
  const z = 65 + i * 18, x = (i % 2 ? 1 : -1) * (42 + i * 7 % 11);
  BLIGHT_SOLIDS.push({ x, z, w: 5 + i % 3, d: 7, h: 6 + i % 4, kind: "rock" });
}
for (const z of [70, 120, 170]) for (const s of [-1, 1]) BLIGHT_SOLIDS.push({ x: s * 22, z, w: 1.8, d: 1.8, h: 12, kind: "tree" });
function blightHeight(_x, z) {
  return z <= 400 ? 0 : -Math.min(16, (z - 400) * 0.12);
}
function blightSurface(x, z, feet = 0) {
  for (const b of BLIGHT_HOUSES) if (feet >= b.h - 0.5 && Math.abs(x - b.x) < b.w / 2 + 0.5 && Math.abs(z - b.z) < b.d / 2 + 0.5) return b.h;
  const r = Math.hypot(x, z - 600);
  return blightHeight(x, z) + (r <= 11 ? 0.4 : r <= 12 ? 0.3 : r <= 13 ? 0.2 : 0);
}
function blightBlocked(x, z, r = 0.6, feet = blightHeight(x, z)) {
  return Math.abs(x) > 55 - r || z < 3 + r || z > 635 - r || BLIGHT_SOLIDS.some((o) => feet < blightHeight(o.x, o.z) + o.h - 0.05 && feet + 1.8 > blightHeight(o.x, o.z) + (o.bottom || 0) + 0.02 && Math.abs(x - o.x) < o.w / 2 + r && Math.abs(z - o.z) < o.d / 2 + r);
}
function blightLineClear(ax, ay, az, bx, by, bz) {
  for (const o of BLIGHT_SOLIDS) {
    let lo = 0, hi = 1;
    const base = blightHeight(o.x, o.z);
    for (const [a, b, min, max] of [[ax, bx, o.x - o.w / 2, o.x + o.w / 2], [ay, by, base + (o.bottom || 0), base + o.h], [az, bz, o.z - o.d / 2, o.z + o.d / 2]]) {
      const d = b - a;
      if (Math.abs(d) < 1e-8) {
        if (a < min || a > max) {
          lo = 2;
          break;
        }
      } else {
        const t1 = (min - a) / d, t2 = (max - a) / d;
        lo = Math.max(lo, Math.min(t1, t2));
        hi = Math.min(hi, Math.max(t1, t2));
        if (lo > hi) break;
      }
    }
    if (lo <= hi && hi > 0 && lo < 1) return false;
  }
  const n = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.5);
  for (let i = 1; i < n; i++) {
    const t = i / n;
    if (ay + (by - ay) * t < blightHeight(ax + (bx - ax) * t, az + (bz - az) * t) - 0.1) return false;
  }
  return true;
}
function blightMonsterHP(kind, level) {
  return BLIGHT_KINDS[kind] ? Math.round(kind === "blight_lord" ? ancientBossHealth(level, 8, 1.5, 6) : ancientMobHealth(level, ancientBaseAttack(level) * 12 * (kind === "rift_maw" ? 1.5 : kind === "blight_stalker" ? 1.25 : 1))) : 0;
}
function blightMonsterDamage(kind, level) {
  return BLIGHT_KINDS[kind] ? Math.round(ancientBaseHealth(level) * (kind === "blight_lord" ? 0.4 : kind === "rift_maw" ? 0.085 : 0.07) * (BLIGHT_KINDS[kind].boss ? 1 : ancientMobDamageScale(level))) : 0;
}
const BLIGHT_CRYSTALS = Array.from({ length: 12 }, (_, i) => ({ id: "blight-crystal-" + i, x: (i % 2 ? 1 : -1) * (10 + i % 3 * 6), z: 425 + i * 15 }));
const BLIGHT_CRYSTAL_XP = 1e4;
function blightCrystalXP(_level) {
  return BLIGHT_CRYSTAL_XP;
}
const blightCanFight = (a, b) => a.name !== b.name && a.hp > 0 && b.hp > 0 && !!(a.corrupted || b.corrupted);
function blightPath(ax, az, bx, bz) {
  const valid = (x, z, tx, tz) => {
    const n = Math.max(1, Math.ceil(Math.hypot(tx - x, tz - z) / 0.5));
    for (let i = 1; i <= n; i++) if (blightBlocked(x + (tx - x) * i / n, z + (tz - z) * i / n, 1)) return false;
    return true;
  };
  if (valid(ax, az, bx, bz)) return [{ x: bx, z: bz }];
  const nodes = /* @__PURE__ */ new Map(), parents = /* @__PURE__ */ new Map(), queue = [];
  const x0 = Math.round(ax / 4) * 4, z0 = Math.round(az / 4) * 4;
  if (!valid(ax, az, x0, z0)) return [];
  const first = x0 + "," + z0;
  nodes.set(first, { x: x0, z: z0 });
  parents.set(first, "");
  queue.push(first);
  for (let head = 0; head < queue.length && head < 4600; head++) {
    const key = queue[head], p = nodes.get(key);
    if (Math.hypot(p.x - bx, p.z - bz) < 8 && valid(p.x, p.z, bx, bz)) {
      const out = [{ x: bx, z: bz }];
      let k = key;
      while (k) {
        out.push(nodes.get(k));
        k = parents.get(k);
      }
      return out.reverse();
    }
    for (const [dx, dz] of [[4, 0], [-4, 0], [0, 4], [0, -4]]) {
      const x = p.x + dx, z = p.z + dz, k = x + "," + z;
      if (!parents.has(k) && valid(p.x, p.z, x, z)) {
        nodes.set(k, { x, z });
        parents.set(k, key);
        queue.push(k);
      }
    }
  }
  return [];
}
export {
  BLIGHT_CRYSTALS,
  BLIGHT_CRYSTAL_XP,
  BLIGHT_HOUSES,
  BLIGHT_KINDS,
  BLIGHT_LEVEL,
  BLIGHT_SOLIDS,
  blightBlocked,
  blightCanFight,
  blightCrystalXP,
  blightHeight,
  blightLineClear,
  blightMonsterDamage,
  blightMonsterHP,
  blightPath,
  blightSurface,
  corruptionMapEntry
};
