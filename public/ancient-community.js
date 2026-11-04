// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { COMMUNITY_CATALOG, communityCatalogTier } from "./ancient-community-catalog.js";
import { compileMapScript, cleanMapNPCs } from "./ancient-map-script.js";
import { communityModelParts } from "./ancient-community-models.js";
import { COMMUNITY_HULLS, TORUS_TRIANGLES, TORUS_BINS } from "./ancient-community-hulls.js";
const MAP_LIMITS = { 1: { area: 1e4, spawns: 30, bosses: 1, level: 80, bossLevel: 49, objects: 200 }, 2: { area: 4e4, spawns: 80, bosses: 3, level: 150, bossLevel: 150, objects: 600 }, 3: { area: 9e4, spawns: 250, bosses: 6, level: 300, bossLevel: 300, objects: 1200 } };
const BASIC_MODELS = ["box", "sphere", "cylinder", "cone", "wedge", "torus"];
const families = [["rocks", "\u5CA9\u77F3", "Rock"], ["cliffs", "\u5047\u5C71", "Crag"], ["trees", "\u6811\u6728", "Tree"], ["shrubs", "\u704C\u6728", "Shrub"], ["flowers", "\u82B1\u8349", "Flower"], ["ruins", "\u9057\u8FF9", "Ruin"], ["pillars", "\u77F3\u67F1", "Pillar"], ["arches", "\u62F1\u95E8", "Arch"], ["walls", "\u56F4\u5899", "Wall"], ["fences", "\u6805\u680F", "Fence"], ["crystals", "\u6C34\u6676", "Crystal"], ["lanterns", "\u706F\u9970", "Lantern"], ["statues", "\u96D5\u50CF", "Statue"], ["camp", "\u8425\u5730", "Camp"], ["bridges", "\u6865\u6881", "Bridge"]];
const COMMUNITY_MODELS = [...COMMUNITY_CATALOG, ...BASIC_MODELS.map((id) => ({ id, category: "basic", name: { box: "\u65B9\u5757", sphere: "\u7403\u4F53", cylinder: "\u5706\u67F1", cone: "\u5706\u9525", wedge: "\u659C\u5761", torus: "\u5706\u73AF" }[id], en: id })), ...families.flatMap(([category, zh, en]) => Array.from({ length: 40 }, (_, i) => ({ id: `${category}-${i + 1}`, category, name: `${zh} ${i + 1}`, en: `${en} ${i + 1}` }))), { id: "mirror", category: "interactive", name: "\u53CD\u5C04\u955C", en: "Reflecting mirror", size: [2, 3, 0.22] }, ...[["lightSource", "\u5149\u6E90", "Light emitter", [1, 3, 1]], ["lightReceiver", "\u5149\u7EBF\u63A5\u6536\u5668", "Light receiver", [1.5, 3, 1]], ["lightGate", "\u5149\u63A7\u673A\u5173\u95E8", "Light gate", [4, 4, 0.7]]].map(([id, name, en, size]) => ({ id, category: "interactive", name, en, size }))];
function communityModelTier(id) {
  if (["mirror", "lightSource", "lightReceiver", "lightGate"].includes(id)) return 3;
  if (BASIC_MODELS.includes(id)) return 1;
  const catalog = communityCatalogTier(id);
  if (catalog !== null) return catalog;
  return id.endsWith("-1") ? 1 : 2;
}
const communityId = (map) => typeof map === "string" && /^community:[1-9]\d{0,7}$/.test(map) ? Number(map.slice(10)) : 0;
const navigation = /* @__PURE__ */ new Map();
const maps = /* @__PURE__ */ new Map(), indices = /* @__PURE__ */ new Map();
function nearby(map, x, z) {
  return indices.get(map)?.get(Math.floor(x / 16) + "," + Math.floor(z / 16)) || [];
}
function setCommunityMap(map) {
  const key = "community:" + map.id;
  if (maps.get(key) === map) return;
  if (maps.size >= 8 && !maps.has(key)) {
    const oldest = maps.keys().next().value;
    maps.delete(oldest);
    indices.delete(oldest);
    navigation.delete(oldest);
  }
  maps.set(key, map);
  navigation.delete(key);
  const index = /* @__PURE__ */ new Map();
  for (const o of map.objects.filter((o2) => o2.solid !== false && !o2.scriptHidden && (!o2.scriptOpen || o2.model === "lightGate"))) for (const p of communityModelParts(o.model)) {
    if (o.model === "lightGate" && o.scriptOpen && p.w < 0.1) continue;
    const r = o.rotation, dx = p.x * o.w, dz = p.z * o.d, c = { id: o.id, shape: p.shape, stair: p.stair, x: o.x + Math.cos(r) * dx - Math.sin(r) * dz, y: o.y + p.y * o.h, z: o.z + Math.sin(r) * dx + Math.cos(r) * dz, w: p.w * o.w, h: p.h * o.h, d: p.d * o.d, rotation: -r + p.ry }, radius = Math.hypot(c.w, c.d) / 2 + 2;
    for (let x = Math.floor((c.x - radius) / 16); x <= Math.floor((c.x + radius) / 16); x++) for (let z = Math.floor((c.z - radius) / 16); z <= Math.floor((c.z + radius) / 16); z++) {
      const k = x + "," + z;
      if (!index.has(k)) index.set(k, []);
      index.get(k).push(c);
    }
  }
  indices.set(key, index);
}
const getCommunityMap = (id) => maps.get(id);
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
function communityHeight(map, x, z, feet = 0) {
  let y = 0;
  for (const o of nearby(map, x, z)) {
    if (o.y - o.h / 2 > feet + 0.5) continue;
    for (const [, top] of column(o, x, z)) if (top <= feet + 0.5) y = Math.max(y, top);
  }
  return y;
}
function communityPlayerHeight(map, x, z, feet = 0, stepUp = 0.5) {
  let y = communityHeight(map, x, z, feet + stepUp - 0.5);
  for (const o of nearby(map, x, z)) {
    if (o.stair || o.y - o.h / 2 > feet + 0.025) continue;
    for (const [, top] of column(o, x, z, 0.61)) if (top <= feet + 0.025) y = Math.max(y, top);
  }
  return y;
}
function communityCeiling(map, x, z, previousEye) {
  let ceiling = Infinity;
  for (const o of nearby(map, x, z)) for (const [bottom] of column(o, x, z)) if (bottom >= previousEye - 0.02) ceiling = Math.min(ceiling, bottom);
  return ceiling;
}
function communityBlocked(map, x, z, r = 0.6, feet = 0) {
  const m = maps.get(map);
  if (!m || !Number.isFinite(x + z) || !insideBoundary(m.boundary, x, z, r)) return true;
  return nearby(map, x, z).some((o) => o.y + o.h / 2 > feet + (o.stair ? 0.65 : 0.45) && o.y - o.h / 2 < feet + 1.7 && column(o, x, z, r).some(([bottom, top]) => feet < top - (o.stair ? 0.65 : 0.45) && feet + 1.7 > bottom + 0.02));
}
function communityClear(map, ax, ay, az, bx, by, bz, ignore = []) {
  if (!maps.has(map)) return false;
  const candidates = /* @__PURE__ */ new Set(), steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 4));
  for (let i = 0; i <= steps; i++) for (const c of nearby(map, ax + (bx - ax) * i / steps, az + (bz - az) * i / steps)) candidates.add(c);
  return ![...candidates].filter((o) => !ignore.includes(o.id)).some((o) => {
    const a = local(o, ax, az), b = local(o, bx, bz), from = [a.x / o.w, (ay - o.y) / o.h, a.z / o.d], to = [b.x / o.w, (by - o.y) / o.h, b.z / o.d];
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
  const objects = a.objects.map((o, i) => {
    if (!COMMUNITY_MODELS.some((m) => m.id === o.model) || communityModelTier(o.model) > tier) throw Error("Model requires a higher map tier");
    const p = point(o);
    if (!insideBoundary(boundary, p.x, p.z)) throw Error("Object outside boundary");
    return { id: entityId(o.id, "o" + i), model: o.model, ...p, y: number(o.y, 0, 500), w: number(o.w, 5e-3, 60, 1e3), h: number(o.h, 5e-3, 60, 1e3), d: number(o.d, 5e-3, 60, 1e3), rotation: number(o.rotation, -100, 100), color: color(o.color), solid: true, ...tier === 3 && o.model === "lightReceiver" && typeof o.opticsTarget === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(o.opticsTarget) ? { opticsTarget: o.opticsTarget } : {}, ...tier === 3 && typeof o.group === "string" ? { group: o.group.slice(0, 40) } : {} };
  });
  if (objects.filter((o) => o.model === "lightSource").length > 16 || objects.filter((o) => o.model === "lightReceiver").length > 32 || objects.filter((o) => o.model === "lightGate").length > 32) throw Error("Light mechanism limit: 16 sources, 32 receivers, 32 gates");
  if (objects.filter((o) => o.model === "mirror").length > 24) throw Error("At most 24 interactive mirrors");
  const spawns = a.spawns.map((s, i) => {
    const p = point(s);
    if (!insideBoundary(boundary, p.x, p.z, 2) || Math.hypot(p.x - spawn.x, p.z - spawn.z) < 12) throw Error("Monsters must be at least 12m from spawn");
    return { id: entityId(s.id, "s" + i), kind: String(s.kind).slice(0, 40), level: number(s.level, 1, s.boss ? limit.bossLevel : limit.level), boss: s.boss === true, ...p, y: s.y === void 0 ? void 0 : number(s.y, 0, 500, 1e3) };
  });
  if (spawns.filter((s) => s.boss).length > limit.bosses || spawns.some((s) => !Number.isInteger(s.level))) throw Error("Boss or level limit exceeded");
  const result = { id, owner, tier, name: String(a.name || "").trim().slice(0, 48) || "Untitled", boundary, spawn, sky: tier > 1 ? color(a.sky) : "#93b4c2", skyArt: tier === 3 && Array.isArray(a.skyArt) ? a.skyArt.slice(0, 128).map((o) => ({ x: number(o.x, 0, 1), y: number(o.y, 0, 1), r: number(o.r, 5e-3, 0.5), color: color(o.color) })) : [], objects, spawns, revision: 0, visibility: a.visibility === "unlisted" ? "unlisted" : "public", rules: { disableSkills: a.rules?.disableSkills === true, disableWeapons: a.rules?.disableWeapons === true } };
  const code = typeof a.code === "string" ? a.code : "";
  const program = compileMapScript(code), npcs = cleanMapNPCs(a.npcs, tier, program.items);
  for (const n of npcs) {
    if (usedIds.has(n.id)) throw Error("Duplicate object identifier");
    usedIds.add(n.id);
    if (!insideBoundary(boundary, n.x, n.z, 1)) throw Error("NPC outside boundary");
  }
  if (code) result.code = code;
  if (npcs.length) result.npcs = npcs;
  const previous = maps.get("community:" + id);
  try {
    setCommunityMap(result);
    for (const s of spawns) if (s.y === void 0) s.y = communityHeight("community:" + id, s.x, s.z, 0);
    if (npcs.some((n) => Math.abs(communityHeight("community:" + id, n.x, n.z, n.y) - n.y) > 0.15 || communityBlocked("community:" + id, n.x, n.z, 0.4, n.y))) throw Error("NPC needs a walkable floor");
    if (communityBlocked("community:" + id, spawn.x, spawn.z, 1.2) || spawns.some((s) => Math.abs(communityHeight("community:" + id, s.x, s.z, s.y || 0) - (s.y || 0)) > 0.15 || communityBlocked("community:" + id, s.x, s.z, 0.65, s.y || 0))) throw Error("Spawn point is obstructed");
  } finally {
    if (previous) setCommunityMap(previous);
    else {
      maps.delete("community:" + id);
      indices.delete("community:" + id);
    }
  }
  return result;
}
function communityLineWalk(map, ax, az, bx, bz, r = 1, feet = 0) {
  const count = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.3));
  for (let i = 1; i <= count; i++) {
    const x = ax + (bx - ax) * i / count, z = az + (bz - az) * i / count, next = communityHeight(map, x, z, feet);
    if (Math.abs(next - feet) > 0.55 || communityBlocked(map, x, z, r, next)) return false;
    feet = next;
  }
  return true;
}
function communityRoute(map, ax, az, bx, bz, now = Date.now(), feet = 0) {
  const walk = (ax2, az2, bx2, bz2) => communityLineWalk(map, ax2, az2, bx2, bz2, feet ? 0.65 : 1, feet);
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
      open = Math.abs(communityHeight(map, x * cell, z * cell, feet) - feet) <= 0.55 && !communityBlocked(map, x * cell, z * cell, feet ? 0.65 : 1, feet);
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
  communityPlayerHeight,
  communityRoute,
  getCommunityMap,
  insideBoundary,
  polygonArea,
  setCommunityMap
};
