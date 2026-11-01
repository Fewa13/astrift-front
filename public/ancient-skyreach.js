// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { SKYREACH_REBUILT, skyreachWidth } from "./ancient-chapter-layouts.js";
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
function skyreachHeight(_x, z) {
  return z < 65 ? 0 : z < 85 ? (z - 65) * 0.3 : z < 165 ? 6 : z < 185 ? 6 + (z - 165) * 0.3 : z < 265 ? 12 : z < 285 ? 12 + (z - 265) * 0.3 : 18;
}
function skyreachSurface(x, z) {
  return skyreachHeight(x, z) + (Math.hypot(x, z - 352) < 15 ? 0.3 : 0);
}
const SKYREACH_SOLIDS = SKYREACH_REBUILT;
function skyreachBlocked(x, z, r = 0.6, feet = skyreachHeight(x, z)) {
  return Math.abs(x) > skyreachWidth(z) - r || z < 4 + r || z > 384 - r || SKYREACH_SOLIDS.some((o) => feet < skyreachHeight(o.x, o.z) + o.h - 0.08 && Math.abs(x - o.x) < o.w / 2 + r && Math.abs(z - o.z) < o.d / 2 + r);
}
function skyreachLineClear(ax, ay, az, bx, by, bz) {
  const count = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.4));
  for (let i = 1; i < count; i++) {
    const t = i / count, x = ax + (bx - ax) * t, z = az + (bz - az) * t, y = ay + (by - ay) * t;
    if (Math.abs(x) > skyreachWidth(z) || y < skyreachSurface(x, z) - 0.1 || SKYREACH_SOLIDS.some((o) => Math.abs(x - o.x) < o.w / 2 && Math.abs(z - o.z) < o.d / 2 && y < skyreachHeight(o.x, o.z) + o.h)) return false;
  }
  return true;
}
function skyreachPath(ax, az, bx, bz) {
  const valid = (x, z, tx, tz) => {
    const n = Math.max(1, Math.ceil(Math.hypot(tx - x, tz - z) / 0.6));
    for (let i = 1; i <= n; i++) if (skyreachBlocked(x + (tx - x) * i / n, z + (tz - z) * i / n, 1)) return false;
    return true;
  };
  if (valid(ax, az, bx, bz)) return [{ x: bx, z: bz }];
  const first = { x: Math.round(ax / 4) * 4, z: Math.round(az / 4) * 4 }, queue = [first], parents = /* @__PURE__ */ new Map([[first.x + "," + first.z, ""]]), nodes = /* @__PURE__ */ new Map([[first.x + "," + first.z, first]]);
  if (!valid(ax, az, first.x, first.z)) return [];
  for (let i = 0; i < queue.length && i < 3200; i++) {
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
});
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
