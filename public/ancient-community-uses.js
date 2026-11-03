// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { communityModelParts } from "./ancient-community-models.js";
const byMap = /* @__PURE__ */ new WeakMap();
const cache = /* @__PURE__ */ new WeakMap();
function objectAmenities(o) {
  let anchors = cache.get(o);
  if (anchors) return anchors;
  anchors = [];
  const c = Math.cos(o.rotation), s = Math.sin(o.rotation);
  communityModelParts(o.model).forEach((p, index) => {
    for (const [slot, use] of (p.uses || []).entries()) {
      const ry = p.ry || 0, ox = (use.x || 0) * p.w * o.w, oz = (use.z || 0) * p.d * o.d, lx = p.x * o.w + Math.cos(ry) * ox - Math.sin(ry) * oz, lz = p.z * o.d + Math.sin(ry) * ox + Math.cos(ry) * oz;
      anchors.push({ id: o.id + ":" + o.model + ":" + index + ":" + slot, object: o.id, model: o.model, kind: use.kind, x: o.x + c * lx - s * lz, y: o.y + (p.y + p.h / 2 + (use.y || 0) * p.h) * o.h, z: o.z + s * lx + c * lz, yaw: Math.PI - o.rotation - ry, w: p.w * o.w, d: p.d * o.d * (use.depth || 1) });
    }
  });
  cache.set(o, anchors);
  return anchors;
}
function amenitiesNear(map, p, radius = 5, limit = 128) {
  const found = [];
  for (const o of map.objects) {
    if (o.scriptHidden || Math.hypot(o.x - p.x, o.z - p.z) > radius + Math.hypot(o.w, o.d)) continue;
    for (const a of objectAmenities(o)) if (Math.hypot(a.x - p.x, a.z - p.z) <= radius) found.push(a);
  }
  return found.sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z)).slice(0, limit);
}
function findAmenity(map, id) {
  let index = byMap.get(map);
  if (!index) {
    index = new Map(map.objects.map((o2) => [o2.id, o2]));
    byMap.set(map, index);
  }
  const objId = id.split(":")[0], o = index.get(objId);
  return o && !o.scriptHidden ? objectAmenities(o).find((a) => a.id === id) : void 0;
}
export {
  amenitiesNear,
  findAmenity,
  objectAmenities
};
