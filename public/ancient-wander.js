// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { communityId, getCommunityMap } from "./ancient-community.js";
import { tribeCompactZ } from "./ancient-rules.js";
function wanderAllowed(map, region, x, z) {
  if (communityId(map)) {
    const spawn = getCommunityMap(map)?.spawn;
    return !!spawn && Math.hypot(x - spawn.x, z - spawn.z) >= 12;
  }
  if (map === "skyreach" && [18, 89, 189, 289].some((n) => Math.hypot(x, z - n) < 22)) return false;
  if (map === "frostcourt" && [18, 94, 196, 296].some((n) => Math.hypot(x, z - n) < 22)) return false;
  if (map === "forest" && Math.hypot(x - 25.5, z - 165) < 11) return false;
  if (Math.hypot(x, z - 10) < 30) return false;
  if (map === "tribe") return region === 0 ? z >= 40 && z < tribeCompactZ(180) : region === 1 ? z > tribeCompactZ(220) && z < tribeCompactZ(480) : z > tribeCompactZ(520) && z < tribeCompactZ(990);
  return true;
}
function tickWander(m, map, now, dt, solid, random = Math.random) {
  const safe = (x2, z2) => wanderAllowed(map, m.region, x2, z2) && !solid(x2, z2);
  const route = (x2, z2) => {
    const n = Math.max(1, Math.ceil(Math.hypot(x2 - m.x, z2 - m.z) / 0.5));
    for (let i = 1; i <= n; i++) if (!safe(m.x + (x2 - m.x) * i / n, m.z + (z2 - m.z) * i / n)) return false;
    return true;
  };
  if (m.wander && (now > m.wander.until || Math.hypot(m.x - m.wander.x, m.z - m.wander.z) < 0.5)) {
    delete m.wander;
    m.wanderAt = now + 2e3 + random() * 4e3;
  }
  if (!m.wander) {
    m.action = "idle";
    if (now < (m.wanderAt || 0)) return;
    m.wanderAt = now + 3e3 + random() * 4e3;
    for (let i = 0; i < 12; i++) {
      const angle = random() * Math.PI * 2, r = 4 + random() * 14, x2 = m.homeX + Math.sin(angle) * r, z2 = m.homeZ + Math.cos(angle) * r;
      if (route(x2, z2)) {
        m.wander = { x: x2, z: z2, until: now + 15e3 };
        m.actionAt = now;
        break;
      }
    }
  }
  if (!m.wander) return;
  const dx = m.wander.x - m.x, dz = m.wander.z - m.z, d = Math.hypot(dx, dz) || 1, step = Math.min(d, Math.max(0, Math.min(0.5, dt)) * 1.6), x = m.x + dx / d * step, z = m.z + dz / d * step;
  if (safe(x, z)) {
    m.x = x;
    m.z = z;
    m.action = "walk";
  } else {
    delete m.wander;
    m.wanderAt = now + 2e3;
    m.action = "idle";
  }
}
export {
  tickWander,
  wanderAllowed
};
