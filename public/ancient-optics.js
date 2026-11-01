// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const mirrorYaw = (angle) => angle * Math.PI / 2 + Math.PI / 4;
function reflectMirror(dx, dz, angle) {
  const [nx, nz] = [[-1, -1], [-1, 1], [1, 1], [1, -1]][(angle % 4 + 4) % 4], dot = dx * nx + dz * nz;
  if (dot >= 0) return;
  return { dx: dx - dot * nx, dz: dz - dot * nz };
}
function traceMirrorLight(angles, mirrors, source, receiver, bounds) {
  let { x, z } = source, dx = 1, dz = 0, last = "", solved = false, blockedBack = "";
  const segments = [], visited = /* @__PURE__ */ new Set();
  for (let bounce = 0; bounce < 8; bounce++) {
    const hit = [...mirrors, { id: "receiver", ...receiver }].filter((m) => m.id !== last).map((m) => ({ m, t: (m.x - x) * dx + (m.z - z) * dz, off: Math.abs((m.x - x) * dz - (m.z - z) * dx) })).filter((v) => v.t > 0.2 && v.off < 0.1).sort((a, b) => a.t - b.t)[0];
    const length = dx ? dx > 0 ? bounds.maxX - x : x - bounds.minX : dz > 0 ? bounds.maxZ - z : z - bounds.minZ;
    if (!hit || hit.t > length) {
      segments.push({ ax: x, az: z, bx: x + dx * length, bz: z + dz * length });
      break;
    }
    segments.push({ ax: x, az: z, bx: hit.m.x, bz: hit.m.z });
    if (hit.m.id === "receiver") {
      solved = true;
      break;
    }
    if (visited.has(hit.m.id)) break;
    visited.add(hit.m.id);
    x = hit.m.x;
    z = hit.m.z;
    last = hit.m.id;
    const reflected = reflectMirror(dx, dz, angles[last] || 0);
    if (!reflected) {
      blockedBack = last;
      break;
    }
    ({ dx, dz } = reflected);
  }
  return { segments, solved, blockedBack };
}
export {
  mirrorYaw,
  reflectMirror,
  traceMirrorLight
};
