// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { PROCEDURAL_MODELS } from "./ancient-community-procedural.js";
import { cleanComponents, cleanCommunityV2, communityPoses, rotateComponentPoint, areaContains } from "./ancient-community-v2.js";
import { COMMUNITY_CATALOG, communityCatalogTier } from "./ancient-community-catalog.js";
import { compileMapScript, cleanMapNPCs } from "./ancient-map-script.js";
import { communityModelParts } from "./ancient-community-models.js";
import { COMMUNITY_HULLS, TORUS_TRIANGLES, TORUS_BINS } from "./ancient-community-hulls.js";
const MAP_LIMITS = { 1: { area: 1e4, spawns: 250, bosses: 6, level: 300, bossLevel: 300, objects: 1200 }, 2: { area: 4e4, spawns: 250, bosses: 6, level: 300, bossLevel: 300, objects: 1200 }, 3: { area: 9e4, spawns: 250, bosses: 6, level: 300, bossLevel: 300, objects: 1200 } };
const BASIC_MODELS = ["box", "sphere", "cylinder", "cone", "wedge", "torus"];
const families = [["rocks", "\u5CA9\u77F3", "Rock"], ["cliffs", "\u5047\u5C71", "Crag"], ["trees", "\u6811\u6728", "Tree"], ["shrubs", "\u704C\u6728", "Shrub"], ["flowers", "\u82B1\u8349", "Flower"], ["ruins", "\u9057\u8FF9", "Ruin"], ["pillars", "\u77F3\u67F1", "Pillar"], ["arches", "\u62F1\u95E8", "Arch"], ["walls", "\u56F4\u5899", "Wall"], ["fences", "\u6805\u680F", "Fence"], ["crystals", "\u6C34\u6676", "Crystal"], ["lanterns", "\u706F\u9970", "Lantern"], ["statues", "\u96D5\u50CF", "Statue"], ["camp", "\u8425\u5730", "Camp"], ["bridges", "\u6865\u6881", "Bridge"]];
const COMMUNITY_MODELS = [...PROCEDURAL_MODELS, ...COMMUNITY_CATALOG, ...BASIC_MODELS.map((id) => ({ id, category: "basic", name: { box: "\u65B9\u5757", sphere: "\u7403\u4F53", cylinder: "\u5706\u67F1", cone: "\u5706\u9525", wedge: "\u659C\u5761", torus: "\u5706\u73AF" }[id], en: id })), ...families.flatMap(([category, zh, en]) => Array.from({ length: 40 }, (_, i) => ({ id: `${category}-${i + 1}`, category, name: `${zh} ${i + 1}`, en: `${en} ${i + 1}` }))), { id: "mirror", category: "interactive", name: "\u53CD\u5C04\u955C", en: "Reflecting mirror", size: [2, 3, 0.22] }, ...[["lightSource", "\u5149\u6E90", "Light emitter", [1, 3, 1]], ["lightReceiver", "\u5149\u7EBF\u63A5\u6536\u5668", "Light receiver", [1.5, 3, 1]], ["lightGate", "\u5149\u63A7\u673A\u5173\u95E8", "Light gate", [4, 4, 0.7]]].map(([id, name, en, size]) => ({ id, category: "interactive", name, en, size }))];
function communityModelTier(id) {
  if (["mirror", "lightSource", "lightReceiver", "lightGate"].includes(id)) return 3;
  if (BASIC_MODELS.includes(id)) return 1;
  const catalog = communityCatalogTier(id);
  if (catalog !== null) return catalog;
  return id.endsWith("-1") ? 1 : 2;
}
const communityId = (map) => typeof map === "string" && /^community:[1-9]\d{0,7}$/.test(map) ? Number(map.slice(10)) : 0;
const navigation = /* @__PURE__ */ new Map();
const staticColliderCache = /* @__PURE__ */ new Map();
const maps = /* @__PURE__ */ new Map(), indices = /* @__PURE__ */ new Map();
function nearby(map, x, z) {
  refreshCommunityMotion(map);
  return indices.get(map)?.get(Math.floor(x / 16) + "," + Math.floor(z / 16)) || [];
}
function indexCommunityMap(map) {
  const key = "community:" + map.id;
  if (maps.get(key) === map) return;
  if (maps.size >= 8 && !maps.has(key)) {
    const oldest = maps.keys().next().value;
    maps.delete(oldest);
    indices.delete(oldest);
    navigation.delete(oldest);
    motionSources.delete(oldest);
    motionTimes.delete(oldest);
  }
  maps.set(key, map);
  navigation.delete(key);
  const source = motionSources.get(key) || map, byId = new Map([...source.v2?.groups || [], ...source.objects].map((o) => [o.id, o])), moving = (o) => !!o.components?.motions?.some((m) => m.enabled !== false) || !!o.parentId && !!byId.get(o.parentId) && moving(byId.get(o.parentId)), cached = staticColliderCache.get(key), reuse = cached?.source === source, index = reuse ? new Map([...cached.index].map(([k, v]) => [k, [...v]])) : /* @__PURE__ */ new Map();
  for (const o of map.objects.filter((o2) => (!reuse || moving(o2)) && o2.solid !== false && !o2.scriptHidden && (!o2.scriptOpen || o2.model === "lightGate"))) for (const p of communityModelParts(o.model, o.parameters)) {
    if (o.model === "lightGate" && o.scriptOpen && p.w < 0.1) continue;
    const r = o.rotation, offset = rotateComponentPoint({ x: p.x * o.w, y: p.y * o.h, z: p.z * o.d }, o.rx || 0, -r, o.rz || 0), c = { id: o.id, shape: p.shape, stair: p.stair, x: o.x + offset.x, y: o.y + offset.y, z: o.z + offset.z, w: p.w * o.w, h: p.h * o.h, d: p.d * o.d, rotation: -r + p.ry, rx: o.rx, rz: o.rz, layers: o.components?.collision?.layers }, radius = Math.hypot(c.w, c.h, c.d) / 2 + 2;
    for (let x = Math.floor((c.x - radius) / 16); x <= Math.floor((c.x + radius) / 16); x++) for (let z = Math.floor((c.z - radius) / 16); z <= Math.floor((c.z + radius) / 16); z++) {
      const k = x + "," + z;
      if (!index.has(k)) index.set(k, []);
      index.get(k).push(c);
    }
  }
  indices.set(key, index);
  if (!reuse) {
    const stable = /* @__PURE__ */ new Map();
    for (const [k, v] of index) {
      const entries = v.filter((c) => !moving(byId.get(c.id)));
      if (entries.length) stable.set(k, entries);
    }
    if (staticColliderCache.size >= 8) staticColliderCache.delete(staticColliderCache.keys().next().value);
    staticColliderCache.set(key, { source, index: stable });
  }
}
const motionSources = /* @__PURE__ */ new Map(), motionTimes = /* @__PURE__ */ new Map();
function setCommunityMap(map) {
  const key = "community:" + map.id;
  if (motionSources.get(key) !== map || !maps.has(key)) {
    motionSources.set(key, map);
    motionTimes.delete(key);
    indexCommunityMap({ ...map, objects: communityPoses(map.objects, map.v2?.groups || [], 0) });
  }
}
function refreshCommunityMotion(key, time = Date.now() / 1e3) {
  const source = motionSources.get(key);
  if (!source || !source.objects.some((o) => o.components?.motions?.length) && !source.v2?.groups.some((o) => o.components?.motions?.length)) return;
  const tick = Math.floor(time * 10);
  if (motionTimes.get(key) === tick) return;
  motionTimes.set(key, tick);
  indexCommunityMap({ ...source, objects: communityPoses(source.objects, source.v2?.groups || [], tick / 10 - (source.v2?.epoch || 0) / 1e3) });
}
const getCommunitySource = (id) => motionSources.get(id);
const getCommunityMap = (id) => {
  refreshCommunityMotion(id);
  return maps.get(id);
};
function communityPlatformCarry(map, p, from, to) {
  const source = motionSources.get(map);
  if (!source) return { x: 0, y: 0, z: 0 };
  const a = communityPoses(source.objects, source.v2?.groups || [], from - (source.v2?.epoch || 0) / 1e3), b = communityPoses(source.objects, source.v2?.groups || [], to - (source.v2?.epoch || 0) / 1e3);
  for (let i = 0; i < a.length; i++) {
    const o = a[i];
    if (o.components?.collision?.mode !== "platform" || o.components.collision.layers && !o.components.collision.layers.includes("player")) continue;
    const top = o.y + Math.max(...communityModelParts(o.model, o.parameters).map((part) => part.y + part.h / 2)) * o.h;
    if (Math.abs(p.y - top) > 0.35 || Math.abs(p.x - o.x) > o.w / 2 + 0.4 || Math.abs(p.z - o.z) > o.d / 2 + 0.4) continue;
    const r = b[i].rotation - o.rotation, dx = p.x - o.x, dz = p.z - o.z;
    return { x: b[i].x + dx * Math.cos(r) - dz * Math.sin(r) - p.x, y: b[i].y - o.y, z: b[i].z + dx * Math.sin(r) + dz * Math.cos(r) - p.z };
  }
  return { x: 0, y: 0, z: 0 };
}
function polygonArea(points) {
  return Math.abs(points.reduce((s, p, i) => {
    const q = points[(i + 1) % points.length];
    return s + p.x * q.z - q.x * p.z;
  }, 0)) / 2;
}
function insideBoundary(points, x, z, r = 0) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i], b = points[j];
    if (a.z > z !== b.z > z && x < (b.x - a.x) * (z - a.z) / (b.z - a.z) + a.x) inside = !inside;
    if (r) {
      const dx = b.x - a.x, dz = b.z - a.z, t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1)));
      if (Math.hypot(x - a.x - dx * t, z - a.z - dz * t) < r) return false;
    }
  }
  return inside;
}
function local(o, x, z) {
  const c = Math.cos(o.rotation), s = Math.sin(o.rotation), dx = x - o.x, dz = z - o.z;
  return { x: dx * c - dz * s, z: dx * s + dz * c };
}
function column(o, x, z, r = 0) {
  if (o.rx || o.rz) {
    const origins = r ? [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]] : [[0, 0]], segments2 = [];
    for (const [dx, dz] of origins) {
      const a = rotateComponentPoint({ x: x + dx - o.x, y: -o.y, z: z + dz - o.z }, o.rx || 0, o.rotation, o.rz || 0, true), b = rotateComponentPoint({ x: 0, y: 1, z: 0 }, o.rx || 0, o.rotation, o.rz || 0, true);
      let low = -Infinity, high = Infinity;
      for (const [nx, ny, nz, d] of COMMUNITY_HULLS[o.shape] || COMMUNITY_HULLS.box) {
        const start = nx * a.x / o.w + ny * a.y / o.h + nz * a.z / o.d, delta = nx * b.x / o.w + ny * b.y / o.h + nz * b.z / o.d;
        if (Math.abs(delta) < 1e-9) {
          if (start > d) {
            low = Infinity;
            break;
          }
        } else if (delta > 0) high = Math.min(high, (d - start) / delta);
        else low = Math.max(low, (d - start) / delta);
      }
      if (low <= high) segments2.push([low, high]);
    }
    return segments2;
  }
  let p = local(o, x, z);
  if (Math.abs(p.x) > o.w / 2 + r || Math.abs(p.z) > o.d / 2 + r) return [];
  if (r) {
    if (o.shape === "box" || o.shape === "wedge") {
      const x2 = Math.max(-o.w / 2, Math.min(o.w / 2, p.x)), z2 = Math.max(-o.d / 2, Math.min(o.d / 2, p.z));
      if (Math.hypot(p.x - x2, p.z - z2) > r) return [];
      p = { x: x2, z: z2 };
    } else {
      const d = Math.hypot(p.x, p.z), step = Math.min(r, d);
      if (d > 0) p = { x: p.x * (1 - step / d), z: p.z * (1 - step / d) };
    }
  }
  const u = p.x / o.w, v = p.z / o.d;
  let segments = [];
  if (o.shape === "torus") {
    const heights = [];
    for (const index of TORUS_BINS[Math.floor((u + 0.5) * 8) + "," + Math.floor((v + 0.5) * 8)] || []) {
      const [ax, ay, az, bx, by, bz, cx, cy, cz] = TORUS_TRIANGLES[index], den = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz);
      if (Math.abs(den) < 1e-10) continue;
      const a = ((bz - cz) * (u - cx) + (cx - bx) * (v - cz)) / den, b = ((cz - az) * (u - cx) + (ax - cx) * (v - cz)) / den, c = 1 - a - b;
      if (a >= -1e-6 && b >= -1e-6 && c >= -1e-6) heights.push(a * ay + b * by + c * cy);
    }
    const sorted = heights.sort((a, b) => a - b).filter((y, i, arr) => i === 0 || Math.abs(y - arr[i - 1]) > 1e-6);
    for (let i = 0; i < sorted.length; i += 2) segments.push([sorted[i], sorted[i + 1] ?? sorted[i]]);
  } else {
    let low = -0.5, high = 0.5;
    for (const [nx, ny, nz, d] of COMMUNITY_HULLS[o.shape] || COMMUNITY_HULLS.box) {
      const remaining = d - nx * u - nz * v;
      if (Math.abs(ny) < 1e-8) {
        if (remaining < -1e-6) return [];
      } else if (ny > 0) high = Math.min(high, remaining / ny);
      else low = Math.max(low, remaining / ny);
      if (low > high + 1e-6) return [];
    }
    segments = [[low, high]];
  }
  return segments.map(([low, high]) => [o.y + low * o.h, o.y + high * o.h]);
}
function communityHeight(map, x, z, feet = 0, layer = "player") {
  let y = 0;
  for (const o of nearby(map, x, z)) {
    if (o.layers && !o.layers.includes(layer)) continue;
    if (!o.rx && !o.rz && o.y - o.h / 2 > feet + 0.5) continue;
    for (const [, top] of column(o, x, z)) if (top <= feet + 0.5) y = Math.max(y, top);
  }
  return y;
}
function communityPlayerHeight(map, x, z, feet = 0, stepUp = 0.5) {
  let y = communityHeight(map, x, z, feet + stepUp - 0.5);
  for (const o of nearby(map, x, z)) {
    if (o.layers && !o.layers.includes("player")) continue;
    if (o.stair || !o.rx && !o.rz && o.y - o.h / 2 > feet + 0.025) continue;
    for (const [, top] of column(o, x, z, 0.61)) if (top <= feet + 0.025) y = Math.max(y, top);
  }
  return y;
}
function communityCeiling(map, x, z, previousEye) {
  let ceiling = Infinity;
  for (const o of nearby(map, x, z).filter((o2) => !o2.layers || o2.layers.includes("player"))) for (const [bottom] of column(o, x, z)) if (bottom >= previousEye - 0.02) ceiling = Math.min(ceiling, bottom);
  return ceiling;
}
function communityBlocked(map, x, z, r = 0.6, feet = 0, layer = "player") {
  refreshCommunityMotion(map);
  const m = maps.get(map);
  if (!m || !Number.isFinite(x + z) || !insideBoundary(m.boundary, x, z, r)) return true;
  if (m.v2?.areas.some((a) => a.enabled !== false && a.type === "invisibleWall" && (!a.targets || a.targets.includes(layer)) && areaContains(a, { x, y: feet + 0.85, z }))) return true;
  return nearby(map, x, z).some((o) => (!o.layers || o.layers.includes(layer)) && (o.rx || o.rz || o.y + o.h / 2 > feet + (o.stair ? 0.65 : 0.45) && o.y - o.h / 2 < feet + 1.7) && column(o, x, z, r).some(([bottom, top]) => feet < top - (o.stair ? 0.65 : 0.45) && feet + 1.7 > bottom + 0.02));
}
function communityClear(map, ax, ay, az, bx, by, bz, ignore = []) {
  if (!maps.has(map)) return false;
  const candidates = /* @__PURE__ */ new Set(), steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 4));
  for (let i = 0; i <= steps; i++) for (const c of nearby(map, ax + (bx - ax) * i / steps, az + (bz - az) * i / steps)) candidates.add(c);
  return ![...candidates].filter((o) => !ignore.includes(o.id) && (!o.layers || o.layers.includes("projectile"))).some((o) => {
    const a = rotateComponentPoint({ x: ax - o.x, y: ay - o.y, z: az - o.z }, o.rx || 0, o.rotation, o.rz || 0, true), b = rotateComponentPoint({ x: bx - o.x, y: by - o.y, z: bz - o.z }, o.rx || 0, o.rotation, o.rz || 0, true), from = [a.x / o.w, a.y / o.h, a.z / o.d], to = [b.x / o.w, b.y / o.h, b.z / o.d];
    let lo = 0, hi = 1;
    const hull = COMMUNITY_HULLS[o.shape] || COMMUNITY_HULLS.box;
    for (const [nx, ny, nz, d] of hull) {
      const start = nx * from[0] + ny * from[1] + nz * from[2] - d, delta = nx * (to[0] - from[0]) + ny * (to[1] - from[1]) + nz * (to[2] - from[2]);
      if (Math.abs(delta) < 1e-8) {
        if (start > 0) return false;
      } else if (delta > 0) hi = Math.min(hi, -start / delta);
      else lo = Math.max(lo, -start / delta);
      if (lo > hi) return false;
    }
    return hi >= 0 && lo <= 1;
  });
}
const color = (v) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : "#709184";
function cleanCommunityMap(raw, tier, id, owner) {
  const a = raw, limit = MAP_LIMITS[tier];
  if (!a || typeof a !== "object") throw Error("Invalid map");
  const number = (v, min, max, precision = 100) => {
    if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max) throw Error("Invalid map coordinates");
    return Math.round(v * precision) / precision;
  };
  const point = (p) => ({ x: number(p?.x, -500, 500), z: number(p?.z, -500, 500) });
  if (!Array.isArray(a.boundary) || a.boundary.length < 3 || a.boundary.length > 32) throw Error("Draw 3\u201332 boundary points");
  const boundary = a.boundary.map(point), area = polygonArea(boundary);
  if (area < 100 || area > limit.area) throw Error("Map area exceeds tier limit");
  const cross = (a2, b, c) => (b.x - a2.x) * (c.z - a2.z) - (b.z - a2.z) * (c.x - a2.x);
  for (let i = 0; i < boundary.length; i++) for (let j = i + 1; j < boundary.length; j++) {
    if (j === i + 1 || i === 0 && j === boundary.length - 1) continue;
    const a2 = boundary[i], b = boundary[(i + 1) % boundary.length], c = boundary[j], d = boundary[(j + 1) % boundary.length];
    if (Math.max(Math.min(a2.x, b.x), Math.min(c.x, d.x)) <= Math.min(Math.max(a2.x, b.x), Math.max(c.x, d.x)) && Math.max(Math.min(a2.z, b.z), Math.min(c.z, d.z)) <= Math.min(Math.max(a2.z, b.z), Math.max(c.z, d.z)) && cross(a2, b, c) * cross(a2, b, d) <= 0 && cross(c, d, a2) * cross(c, d, b) <= 0) throw Error("Boundary edges overlap");
  }
  const spawn = point(a.spawn);
  if (!insideBoundary(boundary, spawn.x, spawn.z, 2)) throw Error("Spawn must be inside the boundary");
  if (!Array.isArray(a.objects) || a.objects.length > limit.objects || !Array.isArray(a.spawns) || a.spawns.length > limit.spawns) throw Error("Too many objects or spawn points");
  const usedIds = /* @__PURE__ */ new Set(), entityId = (value, fallback) => {
    const id2 = typeof value === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(value) ? value : fallback;
    if (usedIds.has(id2)) throw Error("Duplicate object identifier");
    usedIds.add(id2);
    return id2;
  };
  const objects = a.objects.map((input, i) => {
    const t = input.transform, o = { ...input, model: input.model || input.type || "", x: t?.position?.x ?? input.x, y: t?.position?.y ?? input.y, z: t?.position?.z ?? input.z, w: t?.scale?.x ?? input.w, h: t?.scale?.y ?? input.h, d: t?.scale?.z ?? input.d, rotation: t?.rotation?.y ?? input.rotation ?? 0, rx: t?.rotation?.x ?? input.rx ?? 0, rz: t?.rotation?.z ?? input.rz ?? 0 };
    if (!COMMUNITY_MODELS.some((m) => m.id === o.model)) throw Error("Model requires a higher map tier");
    const p = point(o);
    if (!insideBoundary(boundary, p.x, p.z)) throw Error("Object outside boundary");
    return { id: entityId(o.id, "o" + i), model: o.model, name: String(o.name || "").trim().slice(0, 80), ...p, y: number(o.y, 0, 500), w: number(o.w, 5e-3, 60, 1e3), h: number(o.h, 5e-3, 60, 1e3), d: number(o.d, 5e-3, 60, 1e3), rotation: number(o.rotation, -100, 100), rx: number(o.rx ?? 0, -100, 100), rz: number(o.rz ?? 0, -100, 100), color: color(o.color), solid: !["none", "trigger"].includes(o.components?.collision?.mode || "static"), parameters: o.parameters ? Object.fromEntries(Object.entries(o.parameters).slice(0, 16).map(([k, v]) => [k, k === "text" ? String(v).slice(0, 100) : k === "color" ? color(v) : number(v, 5e-3, 100)])) : void 0, locked: o.locked === true, components: cleanComponents(o.components), ...typeof o.parentId === "string" ? { parentId: o.parentId } : {}, ...o.model === "lightReceiver" && typeof o.opticsTarget === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(o.opticsTarget) ? { opticsTarget: o.opticsTarget } : {}, ...typeof o.group === "string" ? { group: o.group.slice(0, 40) } : {} };
  });
  if (objects.filter((o) => o.model === "lightSource").length > 16 || objects.filter((o) => o.model === "lightReceiver").length > 32 || objects.filter((o) => o.model === "lightGate").length > 32) throw Error("Light mechanism limit: 16 sources, 32 receivers, 32 gates");
  if (objects.filter((o) => o.model === "mirror").length > 24) throw Error("At most 24 interactive mirrors");
  const spawns = a.spawns.map((s, i) => {
    const p = point(s);
    if (!insideBoundary(boundary, p.x, p.z, 2) || Math.hypot(p.x - spawn.x, p.z - spawn.z) < 12) throw Error("Monsters must be at least 12m from spawn");
    return { id: entityId(s.id, "s" + i), enabled: s.enabled !== false, count: number(s.count ?? 1, 1, 20, 1), maximumAlive: number(s.maximumAlive ?? 1, 1, 20, 1), radius: number(s.radius ?? 0, 0, 30), respawn: number(s.respawn ?? 30, 3, 3600), delay: number(s.delay ?? 0, 0, 3600), aggro: number(s.aggro ?? 30, 5, 80), leash: number(s.leash ?? 60, 10, 120), wave: String(s.wave || "").slice(0, 40), condition: String(s.condition || "").slice(0, 80), patrol: Array.isArray(s.patrol) ? s.patrol.slice(0, 64).map(point) : [], pool: Array.isArray(s.pool) ? s.pool.slice(0, 16).map((x) => String(x).slice(0, 40)) : [], kind: String(s.kind).slice(0, 40), level: number(s.level, 1, s.boss ? limit.bossLevel : limit.level), boss: s.boss === true, ...p, y: s.y === void 0 ? void 0 : number(s.y, 0, 500, 1e3) };
  });
  if (spawns.filter((s) => s.boss).length > limit.bosses || spawns.some((s) => !Number.isInteger(s.level))) throw Error("Boss or level limit exceeded");
  const result = { id, owner, tier, name: String(a.name || "").trim().slice(0, 48) || "Untitled", boundary, spawn, sky: color(a.sky), skyArt: Array.isArray(a.skyArt) ? a.skyArt.slice(0, 128).map((o) => ({ x: number(o.x, 0, 1), y: number(o.y, 0, 1), r: number(o.r, 5e-3, 0.5), color: color(o.color) })) : [], objects, spawns, revision: 0, visibility: a.visibility === "unlisted" ? "unlisted" : "public", rules: { disableSkills: a.rules?.disableSkills === true, disableWeapons: a.rules?.disableWeapons === true } };
  const code = typeof a.code === "string" ? a.code : "";
  const program = compileMapScript(code), npcs = cleanMapNPCs(a.npcs, tier, program.items);
  for (const n of npcs) {
    if (usedIds.has(n.id)) throw Error("Duplicate object identifier");
    usedIds.add(n.id);
    if (!insideBoundary(boundary, n.x, n.z, 1)) throw Error("NPC outside boundary");
  }
  if (code) result.code = code;
  if (npcs.length) result.npcs = npcs;
  result.v2 = cleanCommunityV2(a.v2, objects, spawns.map((s) => s.id));
  if (result.v2.areas.some((area2) => area2.enabled !== false && ["kill", "damage", "invisibleWall"].includes(area2.type) && areaContains(area2, { x: spawn.x, y: 0.85, z: spawn.z }))) throw Error("Player spawn is inside a harmful or blocked area");
  const previous = motionSources.get("community:" + id) || maps.get("community:" + id);
  try {
    setCommunityMap(result);
    for (const s of spawns) if (s.y === void 0) s.y = communityHeight("community:" + id, s.x, s.z, 0, "monster");
    if (npcs.some((n) => Math.abs(communityHeight("community:" + id, n.x, n.z, n.y) - n.y) > 0.15 || communityBlocked("community:" + id, n.x, n.z, 0.4, n.y))) throw Error("NPC needs a walkable floor");
    if (communityBlocked("community:" + id, spawn.x, spawn.z, 1.2) || spawns.some((s) => Math.abs(communityHeight("community:" + id, s.x, s.z, s.y || 0, "monster") - (s.y || 0)) > 0.15 || communityBlocked("community:" + id, s.x, s.z, 0.65, s.y || 0, "monster"))) throw Error("Spawn point is obstructed");
  } finally {
    if (previous) setCommunityMap(previous);
    else {
      maps.delete("community:" + id);
      indices.delete("community:" + id);
    }
  }
  return result;
}
function communityLineWalk(map, ax, az, bx, bz, r = 1, feet = 0, layer = "player") {
  const count = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.3));
  for (let i = 1; i <= count; i++) {
    const x = ax + (bx - ax) * i / count, z = az + (bz - az) * i / count, next = communityHeight(map, x, z, feet, layer);
    if (Math.abs(next - feet) > 0.55 || communityBlocked(map, x, z, r, next, layer)) return false;
    feet = next;
  }
  return true;
}
function communityRoute(map, ax, az, bx, bz, now = Date.now(), feet = 0) {
  const walk = (ax2, az2, bx2, bz2) => communityLineWalk(map, ax2, az2, bx2, bz2, feet ? 0.65 : 1, feet, "monster");
  const source = maps.get(map), result = (points = [], deferred = false, expanded2 = 0, cached2 = false) => ({ points: points.map((p) => ({ ...p })), deferred, expanded: expanded2, cached: cached2 });
  if (!source || ![ax, az, bx, bz].every(Number.isFinite)) return result();
  if (walk(ax, az, bx, bz)) return result([{ x: bx, z: bz }]);
  let nav = navigation.get(map);
  if (!nav || nav.source !== source) {
    nav = { source, open: /* @__PURE__ */ new Map(), edges: /* @__PURE__ */ new Map(), routes: /* @__PURE__ */ new Map(), window: -1, solves: 0 };
    navigation.set(map, nav);
  }
  const state = nav, cell = 1.5, key = (x, z) => Math.round(feet * 2) / 2 + ":" + x + "," + z, epoch = Math.floor(now / 200);
  if (epoch !== state.window) {
    state.window = epoch;
    state.solves = 0;
  }
  const isOpen = (x, z) => {
    const k = key(x, z);
    let open = state.open.get(k);
    if (open === void 0) {
      open = Math.abs(communityHeight(map, x * cell, z * cell, feet, "monster") - feet) <= 0.55 && !communityBlocked(map, x * cell, z * cell, feet ? 0.65 : 1, feet, "monster");
      if (state.open.size > 24e3) state.open.clear();
      state.open.set(k, open);
    }
    return open;
  };
  const anchor = (x, z, start2) => {
    const cx = Math.round(x / cell), cz = Math.round(z / cell), candidates = [];
    for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) {
      const nx = cx + dx, nz = cz + dz, d = Math.hypot(nx * cell - x, nz * cell - z);
      if (d > 3.5 || !isOpen(nx, nz)) continue;
      candidates.push({ x: nx, z: nz, d });
    }
    return candidates.sort((a, b) => a.d - b.d).find((p) => !start2 || walk(x, z, p.x * cell, p.z * cell));
  };
  const start = anchor(ax, az, true), end = anchor(bx, bz, false);
  if (!start || !end) return result();
  const routeKey = key(start.x, start.z) + ">" + key(end.x, end.z), cached = state.routes.get(routeKey);
  const trim = (points) => {
    let i = 0;
    while (i + 1 < points.length && i < 6 && walk(ax, az, points[i + 1].x, points[i + 1].z)) i++;
    return points.slice(i);
  };
  if (cached && cached.until >= now) return result(trim(cached.points), false, 0, true);
  if (state.solves >= 4) return result([], true);
  state.solves++;
  const heap = [], push = (node) => {
    let i = heap.push(node) - 1;
    while (i > 0) {
      const parent = i - 1 >> 1;
      if (heap[parent].f <= node.f) break;
      heap[i] = heap[parent];
      i = parent;
    }
    heap[i] = node;
  }, pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      let i = 0;
      while (i * 2 + 1 < heap.length) {
        let child = i * 2 + 1;
        if (child + 1 < heap.length && heap[child + 1].f < heap[child].f) child++;
        if (heap[child].f >= last.f) break;
        heap[i] = heap[child];
        i = child;
      }
      heap[i] = last;
    }
    return top;
  };
  const heuristic = (x, z) => {
    const dx = Math.abs(x - end.x), dz = Math.abs(z - end.z);
    return Math.max(dx, dz) + (Math.SQRT2 - 1) * Math.min(dx, dz);
  }, scores = /* @__PURE__ */ new Map([[key(start.x, start.z), 0]]), previous = /* @__PURE__ */ new Map(), closed = /* @__PURE__ */ new Set();
  push({ ...start, g: 0, f: heuristic(start.x, start.z) });
  let found, best = start, bestH = heuristic(start.x, start.z), expanded = 0;
  while (heap.length && expanded < 1600) {
    const current = pop(), id = key(current.x, current.z);
    if (closed.has(id) || current.g !== scores.get(id)) continue;
    closed.add(id);
    expanded++;
    const h = heuristic(current.x, current.z);
    if (h < bestH) {
      best = current;
      bestH = h;
    }
    if (current.x === end.x && current.z === end.z) {
      found = current;
      break;
    }
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const x = current.x + dx, z = current.z + dz, k = key(x, z);
      if (closed.has(k) || !isOpen(x, z) || dx && dz && (!isOpen(current.x + dx, current.z) || !isOpen(current.x, current.z + dz))) continue;
      const cost = current.g + (dx && dz ? Math.SQRT2 : 1);
      if (cost >= (scores.get(k) ?? Infinity)) continue;
      const edge = id < k ? id + ">" + k : k + ">" + id;
      let clear = state.edges.get(edge);
      if (clear === void 0) {
        clear = walk(current.x * cell, current.z * cell, x * cell, z * cell);
        if (state.edges.size > 32e3) state.edges.clear();
        state.edges.set(edge, clear);
      }
      if (!clear) continue;
      scores.set(k, cost);
      previous.set(k, { x: current.x, z: current.z });
      push({ x, z, g: cost, f: cost + heuristic(x, z) });
    }
  }
  if (!found && expanded >= 1600 && bestH < heuristic(start.x, start.z) - 2) found = best;
  if (!found) {
    if (state.routes.size >= 128) state.routes.delete(state.routes.keys().next().value);
    state.routes.set(routeKey, { points: [], until: now + 1500 });
    return result([], false, expanded);
  }
  const path = [];
  for (let p = found; ; ) {
    path.push({ x: p.x * cell, z: p.z * cell });
    const parent = previous.get(key(p.x, p.z));
    if (!parent) break;
    p = parent;
  }
  path.reverse();
  if (state.routes.size >= 128) state.routes.delete(state.routes.keys().next().value);
  state.routes.set(routeKey, { points: path, until: Infinity });
  return result(trim(path), false, expanded);
}
function communityPath(map, ax, az, bx, bz) {
  return communityRoute(map, ax, az, bx, bz).points;
}
export {
  BASIC_MODELS,
  COMMUNITY_MODELS,
  MAP_LIMITS,
  cleanCommunityMap,
  communityBlocked,
  communityCeiling,
  communityClear,
  communityHeight,
  communityId,
  communityLineWalk,
  communityModelTier,
  communityPath,
  communityPlatformCarry,
  communityPlayerHeight,
  communityRoute,
  getCommunityMap,
  getCommunitySource,
  insideBoundary,
  polygonArea,
  refreshCommunityMotion,
  setCommunityMap
};
