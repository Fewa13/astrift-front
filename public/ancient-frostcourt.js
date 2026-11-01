// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { FROSTCOURT_REBUILT, frostcourtWidth } from "./ancient-chapter-layouts.js";
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
function frostcourtHeight(_x, z) {
  return z < 70 ? 0 : z < 90 ? (z - 70) * 0.3 : z < 170 ? 6 : z < 190 ? 6 + (z - 170) * 0.3 : z < 270 ? 12 : z < 290 ? 12 + (z - 270) * 0.3 : 18;
}
function frostcourtSurface(x, z) {
  return frostcourtHeight(x, z) + (Math.hypot(x, z - 360) < 16 ? 0.3 : 0);
}
const FROSTCOURT_SOLIDS = FROSTCOURT_REBUILT;
function frostcourtBlocked(x, z, r = 0.6, feet = frostcourtHeight(x, z)) {
  return Math.abs(x) > frostcourtWidth(z) - r || z < 4 + r || z > 386 - r || FROSTCOURT_SOLIDS.some((o) => feet < frostcourtHeight(o.x, o.z) + o.h - 0.08 && Math.abs(x - o.x) < o.w / 2 + r && Math.abs(z - o.z) < o.d / 2 + r);
}
function frostcourtLineClear(ax, ay, az, bx, by, bz) {
  const count = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.4));
  for (let i = 1; i < count; i++) {
    const t = i / count, x = ax + (bx - ax) * t, z = az + (bz - az) * t, y = ay + (by - ay) * t;
    if (Math.abs(x) > frostcourtWidth(z) || y < frostcourtSurface(x, z) - 0.1 || FROSTCOURT_SOLIDS.some((o) => Math.abs(x - o.x) < o.w / 2 && Math.abs(z - o.z) < o.d / 2 && y < frostcourtHeight(o.x, o.z) + o.h)) return false;
  }
  return true;
}
function frostcourtPath(ax, az, bx, bz) {
  const valid = (x, z, tx, tz) => {
    const n = Math.max(1, Math.ceil(Math.hypot(tx - x, tz - z) / 0.5));
    for (let i = 1; i <= n; i++) if (frostcourtBlocked(x + (tx - x) * i / n, z + (tz - z) * i / n, 1)) return false;
    return true;
  };
  if (valid(ax, az, bx, bz)) return [{ x: bx, z: bz }];
  const first = { x: Math.round(ax / 4) * 4, z: Math.round(az / 4) * 4 };
  if (!valid(ax, az, first.x, first.z)) return [];
  const queue = [first], parent = /* @__PURE__ */ new Map([[first.x + "," + first.z, ""]]), nodes = /* @__PURE__ */ new Map([[first.x + "," + first.z, first]]);
  for (let i = 0; i < queue.length && i < 3200; i++) {
    const p = queue[i], key = p.x + "," + p.z;
    if (Math.hypot(p.x - bx, p.z - bz) < 7 && valid(p.x, p.z, bx, bz)) {
      const out = [{ x: bx, z: bz }];
      let k = key;
      while (k) {
        out.push(nodes.get(k));
        k = parent.get(k);
      }
      return out.reverse();
    }
    for (const [dx, dz] of [[4, 0], [-4, 0], [0, 4], [0, -4]]) {
      const n = { x: p.x + dx, z: p.z + dz }, k = n.x + "," + n.z;
      if (!parent.has(k) && valid(p.x, p.z, n.x, n.z)) {
        parent.set(k, key);
        nodes.set(k, n);
        queue.push(n);
      }
    }
  }
  return [];
}
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
});
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
