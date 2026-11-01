// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
function motionPoint(m, now) {
  const t = Math.max(0, Math.min(1, (now - m.started) / m.duration)), u = t * t * (3 - 2 * t);
  return { x: m.from.x + (m.to.x - m.from.x) * u, y: m.from.y + (m.to.y - m.from.y) * u, z: m.from.z + (m.to.z - m.from.z) * u };
}
function beginForcedMotion(a, to, now) {
  return a.forcedMotion = { from: { x: a.x, y: a.y, z: a.z }, to, started: now, duration: Math.max(300, Math.min(750, Math.hypot(to.x - a.x, to.z - a.z) * 45)) };
}
function tickForcedMotion(a, now, solid) {
  const m = a.forcedMotion;
  if (!m) return false;
  if (a.hp <= 0) {
    delete a.forcedMotion;
    return false;
  }
  const target = motionPoint(m, now), start = { x: a.x, y: a.y, z: a.z }, n = Math.max(1, Math.ceil(Math.hypot(target.x - a.x, target.z - a.z) / 0.15));
  for (let i = 1; i <= n; i++) {
    const t = i / n, x = start.x + (target.x - start.x) * t, z = start.z + (target.z - start.z) * t, y = start.y + (target.y - start.y) * t;
    if (solid(x, z, y - 1.7)) {
      delete a.forcedMotion;
      return true;
    }
    Object.assign(a, { x, y, z });
  }
  if (now >= m.started + m.duration) delete a.forcedMotion;
  return true;
}
export {
  beginForcedMotion,
  motionPoint,
  tickForcedMotion
};
