// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const OPTICAL_MODELS = ["mirror", "lightSource", "lightReceiver", "lightGate"];
function traceCommunityLight(map, angles = {}, clear = () => true) {
  const segments = [], powered = /* @__PURE__ */ new Set(), objects = map.objects.filter((o) => !o.scriptHidden), mirrors = objects.filter((o) => o.model === "mirror"), receivers = objects.filter((o) => o.model === "lightReceiver");
  for (const source of objects.filter((o) => o.model === "lightSource").slice(0, 16)) {
    let dx = -Math.sin(source.rotation), dz = Math.cos(source.rotation), x = source.x + dx * (source.d * 0.55 + 0.05), z = source.z + dz * (source.d * 0.55 + 0.05), y = source.y + source.h * 0.5, last = "", remaining = 120;
    const visited = /* @__PURE__ */ new Set();
    for (let bounce = 0; bounce < 12 && remaining > 0.1; bounce++) {
      let distance = remaining, hit;
      for (let i = 0; i < map.boundary.length; i++) {
        const a = map.boundary[i], b = map.boundary[(i + 1) % map.boundary.length], ex = b.x - a.x, ez = b.z - a.z, den = dx * ez - dz * ex;
        if (Math.abs(den) < 1e-8) continue;
        const t = ((a.x - x) * ez - (a.z - z) * ex) / den, u = ((a.x - x) * dz - (a.z - z) * dx) / den;
        if (t > 1e-3 && u >= 0 && u <= 1) distance = Math.min(distance, t);
      }
      for (const o of [...mirrors, ...receivers]) {
        if (o.id === last || Math.abs(o.y + o.h * 0.5 - y) > o.h * 0.46) continue;
        let t = 0;
        if (o.model === "mirror") {
          const angle2 = o.rotation + (angles[o.id] || 0) * Math.PI / 4, nx2 = -Math.sin(angle2), nz2 = Math.cos(angle2), den = dx * nx2 + dz * nz2;
          if (Math.abs(den) < 1e-7) continue;
          t = ((o.x - x) * nx2 + (o.z - z) * nz2) / den;
          if (Math.abs((x + dx * t - o.x) * nz2 - (z + dz * t - o.z) * nx2) > o.w * 0.46) continue;
        } else {
          t = (o.x - x) * dx + (o.z - z) * dz;
          if (Math.abs((o.x - x) * dz - (o.z - z) * dx) > Math.max(0.15, Math.min(o.w, o.d) * 0.4)) continue;
        }
        if (t > 0.08 && t < distance) {
          distance = t;
          hit = o;
        }
      }
      let endX = x + dx * distance, endZ = z + dz * distance;
      const ignore = [bounce === 0 ? source.id : "", last, hit?.id || ""], check = distance;
      if (!clear(x, y, z, x + dx * check, y, z + dz * check, ignore)) {
        let lo = 0, hi = check;
        for (let i = 0; i < 13; i++) {
          const m = (lo + hi) / 2;
          if (clear(x, y, z, x + dx * m, y, z + dz * m, ignore)) lo = m;
          else hi = m;
        }
        endX = x + dx * lo;
        endZ = z + dz * lo;
        segments.push({ ax: x, ay: y, az: z, bx: endX, by: y, bz: endZ });
        break;
      }
      segments.push({ ax: x, ay: y, az: z, bx: endX, by: y, bz: endZ });
      remaining -= distance;
      if (!hit) break;
      if (hit.model === "lightReceiver") {
        powered.add(hit.id);
        break;
      }
      if (visited.has(hit.id)) break;
      visited.add(hit.id);
      last = hit.id;
      const angle = hit.rotation + (angles[hit.id] || 0) * Math.PI / 4, nx = -Math.sin(angle), nz = Math.cos(angle), dot = dx * nx + dz * nz;
      dx -= 2 * dot * nx;
      dz -= 2 * dot * nz;
      x = endX + dx * Math.max(0.14, hit.d * 0.75);
      z = endZ + dz * Math.max(0.14, hit.d * 0.75);
    }
  }
  const doors = objects.filter((o) => o.model === "lightGate" && receivers.some((r) => r.opticsTarget === o.id && powered.has(r.id))).map((o) => o.id);
  return { segments, powered: [...powered].sort(), doors: doors.sort() };
}
function communityOpticsKit(x, y, z, prefix = "optic") {
  const group = prefix, base = { y, color: "#70bfc0", solid: true, group };
  return [
    { id: prefix + "_source", model: "lightSource", ...base, x: x - 8, z, w: 1, h: 3, d: 1, rotation: -Math.PI / 2 },
    { id: prefix + "_mirror", model: "mirror", ...base, x, z, w: 2, h: 3, d: 0.22, rotation: -Math.PI / 4 },
    { id: prefix + "_receiver", model: "lightReceiver", ...base, x, z: z + 8, w: 1.5, h: 3, d: 1, opticsTarget: prefix + "_gate", rotation: 0 },
    { id: prefix + "_gate", model: "lightGate", ...base, x: x + 5, z: z + 8, w: 4, h: 4, d: 0.7, rotation: 0 }
  ];
}
function copyCommunityOpticsLinks(original, copies) {
  const ids = new Map(original.map((p, i) => [p.id, copies[i]?.id]));
  for (const [i, p] of copies.entries()) if (original[i]?.opticsTarget) p.opticsTarget = ids.get(original[i].opticsTarget) || original[i].opticsTarget;
  return copies;
}
export {
  OPTICAL_MODELS,
  communityOpticsKit,
  copyCommunityOpticsLinks,
  traceCommunityLight
};
