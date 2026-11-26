// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const COMMUNITY_BUDGETS = { models: 1200, dynamic: 300, groups: 100, dynamicCollision: 80, lights: 16, shadows: 2, emitters: 64, particles: 3e3, triggers: 200, areas: 100, interactions: 100, spawns: 250, bosses: 6, variables: 100, events: 128 };
const MOTION_TYPES = ["linear", "rotation", "orbit", "floating", "path", "swing", "scale"];
const PARTICLE_TYPES = ["fire", "smoke", "spark", "stardust", "snow", "rain", "leaves", "petals", "energy", "magic", "lightning", "fireflies", "dust", "bubbles", "ash", "void", "meteor"];
const TRIGGER_EVENTS = ["mapLoaded", "playerSpawned", "proximity", "enter", "exit", "stay", "interact", "monsterKilled", "bossDefeated", "allMonstersKilled", "killCount", "timer", "health", "motionCompleted", "trigger", "variable"];
const TRIGGER_ACTIONS = ["start", "stop", "pause", "resume", "reverse", "reset", "speed", "show", "hide", "collision", "material", "light", "particles", "spawn", "despawn", "teleport", "sound", "music", "message", "timer", "checkpoint", "trigger", "variable", "resetVariable", "enable", "disable", "resetTrigger", "area", "spawnPoint", "weather", "time", "shake", "screen", "resetEncounter", "complete"];
const finite = (n, def = 0, min = -1e4, max = 1e4) => typeof n === "number" && Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : def;
const vec = (v, d = 0) => ({ x: finite(v?.x, d), y: finite(v?.y, d), z: finite(v?.z, d) });
const safe = (raw, depth = 0) => {
  if (depth > 12) throw Error("Component nesting exceeds 12");
  if (raw === null || typeof raw === "boolean") return raw;
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) throw Error("Non-finite component value");
    return Math.max(-1e9, Math.min(1e9, raw));
  }
  if (typeof raw === "string") {
    if (raw.length > 85e4) throw Error("Component text/audio is too large");
    return raw;
  }
  if (Array.isArray(raw)) {
    if (raw.length > 1200) throw Error("Component array limit");
    return raw.map((v) => safe(v, depth + 1));
  }
  if (raw && typeof raw === "object") {
    const o = {};
    for (const [k, v] of Object.entries(raw)) {
      if (["__proto__", "constructor", "prototype"].includes(k)) throw Error("Invalid component property");
      o[k.slice(0, 80)] = safe(v, depth + 1);
    }
    return o;
  }
  return void 0;
};
function cleanComponents(raw) {
  if (!raw) return;
  const c = safe(raw), out = {};
  if (c.motions) {
    if (!Array.isArray(c.motions) || c.motions.length > 12) throw Error("At most 12 motion layers");
    out.motions = c.motions.map((m, i) => {
      if (!MOTION_TYPES.includes(m.type)) throw Error("Unknown motion type");
      return { ...m, id: String(m.id || "motion-" + i), enabled: m.enabled !== false, autoplay: m.autoplay !== false, duration: finite(m.duration, 4, 0.1, 86400), period: finite(m.period, 4, 0.1, 86400), speed: finite(m.speed, 1, 0, 360), delay: finite(m.delay, 0, 0, 86400), phase: finite(m.phase), pause: finite(m.pause, 0, 0, 3600), count: finite(m.count, 0, 0, 1e4), from: vec(m.from), to: vec(m.to), pivot: vec(m.pivot), axis: vec(m.axis), amplitude: vec(m.amplitude), radius: vec(m.radius, 3), points: Array.isArray(m.points) ? m.points.slice(0, 128).map((p) => vec(p)) : [] };
    });
  }
  if (c.material) {
    const m = c.material;
    out.material = { ...m, opacity: finite(m.opacity, 1, 0, 1), intensity: finite(m.intensity, 0, 0, 8), metalness: finite(m.metalness, 0, 0, 1), roughness: finite(m.roughness, 0.75, 0, 1) };
  }
  if (c.collision) {
    if (!["none", "static", "dynamic", "platform", "trigger"].includes(c.collision.mode)) throw Error("Invalid collision mode");
    out.collision = { mode: c.collision.mode, layers: (c.collision.layers || ["player", "monster", "projectile"]).filter((v) => ["player", "monster", "projectile"].includes(v)) };
  }
  for (const key of ["lights", "particles"]) if (c[key]) {
    if (!Array.isArray(c[key]) || c[key].length > 8) throw Error("Component count limit");
    out[key] = c[key];
  }
  if (c.interaction) out.interaction = c.interaction;
  if (c.audio) out.audio = c.audio;
  return out;
}
function cleanCommunityV2(raw, objects, extraIds = []) {
  if (JSON.stringify(raw || {}).length > 3e6) throw Error("Component file exceeds 3MB");
  const c = safe(raw || {}), v = { version: 2, groups: c.groups || [], triggers: c.triggers || [], areas: c.areas || [], variables: c.variables || {}, environment: c.environment || {}, audio: c.audio || [], metadata: c.metadata || {}, photo: c.photo === true, prefabs: c.prefabs || [] };
  for (const [key, max] of [["groups", 100], ["triggers", 200], ["areas", 100], ["audio", 64], ["prefabs", 100]]) if (!Array.isArray(v[key]) || v[key].length > max) throw Error(key + " budget exceeded");
  if (Object.keys(v.variables).length > 100) throw Error("Variable budget exceeded");
  for (const g of v.groups) {
    if (g.transform) {
      const t = g.transform;
      g.x = t.position?.x ?? g.x;
      g.y = t.position?.y ?? g.y;
      g.z = t.position?.z ?? g.z;
      g.w = t.scale?.x ?? g.w;
      g.h = t.scale?.y ?? g.h;
      g.d = t.scale?.z ?? g.d;
      g.rotation = t.rotation?.y ?? g.rotation;
      g.rx = t.rotation?.x ?? g.rx;
      g.rz = t.rotation?.z ?? g.rz;
      delete g.transform;
    }
    g.x = finite(g.x);
    g.y = finite(g.y);
    g.z = finite(g.z);
    g.w = finite(g.w, 1, 0.01, 60);
    g.h = finite(g.h, 1, 0.01, 60);
    g.d = finite(g.d, 1, 0.01, 60);
    g.rotation = finite(g.rotation);
    g.rx = finite(g.rx);
    g.rz = finite(g.rz);
    g.origin ??= { x: g.x, y: g.y, z: g.z, w: 1, h: 1, d: 1, rotation: 0, rx: 0, rz: 0 };
  }
  const ids = /* @__PURE__ */ new Map();
  for (const o of [...objects, ...v.groups]) {
    if (!o.id || ["__proto__", "constructor", "prototype"].includes(o.id) || ids.has(o.id)) throw Error("Duplicate component ID");
    ids.set(o.id, o);
    o.components = cleanComponents(o.components);
  }
  for (const o of ids.values()) {
    const visited = /* @__PURE__ */ new Set([o.id]);
    let p = o.parentId;
    while (p) {
      if (visited.has(p) || !ids.has(p)) throw Error("Invalid or cyclic group parent");
      visited.add(p);
      p = ids.get(p)?.parentId;
    }
  }
  const unique = new Set(ids.keys());
  for (const e of [...v.triggers, ...v.areas]) {
    if (typeof e.id !== "string" || ["__proto__", "constructor", "prototype"].includes(e.id) || !/^[a-zA-Z0-9_-]{1,80}$/.test(e.id) || unique.has(e.id)) throw Error("Duplicate or invalid component ID");
    unique.add(e.id);
  }
  for (const id of extraIds) {
    if (unique.has(id)) throw Error("Duplicate component ID");
    unique.add(id);
  }
  for (const audio of v.audio) {
    if (audio.parentId && !unique.has(audio.parentId)) throw Error("Missing audio anchor");
    if (audio.area && !v.areas.some((area) => area.id === audio.area)) throw Error("Missing audio area");
  }
  for (const o of objects) {
    const trigger = o.components?.interaction?.trigger;
    if (trigger && !v.triggers.some((t) => t.id === trigger)) throw Error("Missing interaction trigger");
  }
  const moving = (o) => !!o.components?.motions?.some((m) => m.enabled !== false) || !!o.parentId && moving(ids.get(o.parentId));
  let dynamic = 0, collision = 0, lights = 0, shadows = 0, emitters = 0;
  for (const o of ids.values()) {
    const c2 = o.components;
    if (moving(o)) {
      dynamic++;
      if (["platform", "dynamic"].includes(c2?.collision?.mode || "")) collision++;
    }
    for (const l of c2?.lights || []) {
      lights++;
      if (l.shadow) shadows++;
    }
    emitters += c2?.particles?.length || 0;
  }
  if (dynamic > 300 || collision > 80 || lights > 16 || shadows > 2 || emitters > 64) throw Error("Dynamic/light/particle budget exceeded");
  for (const area of v.areas) {
    if (!["box", "sphere", "cylinder", "plane"].includes(area.shape || "box")) throw Error("Invalid area shape");
    for (const k of ["x", "y", "z"]) area[k] = finite(area[k]);
    for (const k of ["w", "h", "d"]) area[k] = finite(area[k], 5, area.shape === "plane" && k === "h" ? 0.05 : 0.1, 1e3);
    area.strength = finite(area.strength, 1, 0, 2);
    area.priority = finite(area.priority, 0, -100, 100);
  }
  for (const t of v.triggers) {
    if (!TRIGGER_EVENTS.includes(t.event) || !Array.isArray(t.actions) || t.actions.length > 32) throw Error("Invalid trigger");
    for (const a of t.actions) {
      if (!TRIGGER_ACTIONS.includes(a.type)) throw Error("Invalid trigger action");
      if (a.target && !unique.has(a.target)) throw Error("Missing trigger target");
    }
    t.cooldown = finite(t.cooldown, 1, 0.1, 86400);
    t.max = finite(t.max, 1, 0, 1e4);
    t.delay = finite(t.delay, 0, 0, 3600);
  }
  const checking = /* @__PURE__ */ new Set(), checked = /* @__PURE__ */ new Set();
  function visit(id) {
    if (checking.has(id)) throw Error("Cyclic trigger activation");
    if (checked.has(id)) return;
    checking.add(id);
    for (const action of v.triggers.find((t) => t.id === id)?.actions || []) if (action.type === "trigger") visit(action.target);
    checking.delete(id);
    checked.add(id);
  }
  for (const t of v.triggers) visit(t.id);
  return v;
}
const mix = (a, b, t) => a + (b - a) * t;
function rotateComponentPoint(v, x, y, z, inverse = false) {
  let p = { ...v };
  const axis = (a, r) => {
    const c = Math.cos(r), s = Math.sin(r), q = { ...p };
    if (a === "x") {
      p.y = q.y * c - q.z * s;
      p.z = q.y * s + q.z * c;
    } else if (a === "y") {
      p.x = q.x * c + q.z * s;
      p.z = -q.x * s + q.z * c;
    } else {
      p.x = q.x * c - q.y * s;
      p.y = q.x * s + q.y * c;
    }
  };
  if (inverse) {
    axis("x", -x);
    axis("y", -y);
    axis("z", -z);
  } else {
    axis("z", z);
    axis("y", y);
    axis("x", x);
  }
  return p;
}
function progress(m, time) {
  let t = (m.frozenTime ?? time) - (m.startedAt || 0) - (m.delay || 0) + (m.sync ? 0 : m.phase || 0);
  if (t < 0) return 0;
  let duration = m.duration || 4;
  if (m.speed) {
    if (m.type === "linear") {
      const a = m.from || vec(null), b = m.to || vec(null);
      duration = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) / m.speed || duration;
    } else if (m.type === "rotation") duration = Math.abs(m.angle || 360) / m.speed;
    else if (m.type === "orbit") duration = Math.PI * 2 * Math.max(0.01, m.radius?.x || 3, m.radius?.z || 3) / m.speed;
    else if (m.type === "path" && m.points?.length) {
      duration = 0;
      for (let i = 1; i < m.points.length; i++) duration += Math.hypot(m.points[i].x - m.points[i - 1].x, m.points[i].y - m.points[i - 1].y, m.points[i].z - m.points[i - 1].z) / m.speed;
    }
  }
  const d = Math.max(0.01, m.type === "floating" || m.type === "swing" ? m.period || 4 : duration), pause = m.pause || 0, cycle = d + pause, index = Math.floor(t / cycle);
  if (m.count && index >= m.count) return m.loop === "pingpong" && m.count % 2 === 0 ? 0 : 1;
  if (m.loop === "once") t = Math.min(t, d);
  else t = Math.min(t % cycle, d);
  let p = t / d;
  if (m.loop === "pingpong" && index % 2) p = 1 - p;
  if (m.reverse) p = 1 - p;
  return m.easing === "in" ? p * p : m.easing === "out" ? 1 - (1 - p) ** 2 : m.easing === "smooth" ? p * p * (3 - 2 * p) : p;
}
function motionPose(o, time) {
  const p = { ...o };
  for (const m of o.components?.motions || []) {
    if (m.enabled === false || m.autoplay === false && m.frozenTime === void 0) continue;
    const t = progress(m, time), a = m.from || vec(null), b = m.to || vec(null), axis = m.axis || { x: 0, y: 1, z: 0 };
    if (m.type === "linear") for (const k of ["x", "y", "z"]) p[k] = m.relative === false ? mix(a[k], b[k], t) : p[k] + mix(a[k], b[k], t);
    else if (m.type === "floating") for (const k of ["x", "y", "z"]) p[k] += (m.amplitude?.[k] || 0) * Math.sin(t * Math.PI * 2);
    else if (m.type === "rotation" || m.type === "swing") {
      const angle = (m.angle ?? 360) * Math.PI / 180 * (m.type === "swing" ? Math.sin(t * Math.PI * 2) : t);
      const ax = angle * axis.x, ay = angle * (axis.y || (!axis.x && !axis.z ? 1 : 0)), az = angle * axis.z, pivot = m.pivot || vec(null), center = { x: o.x + pivot.x, y: o.y + pivot.y, z: o.z + pivot.z }, offset = rotateComponentPoint({ x: p.x - center.x, y: p.y - center.y, z: p.z - center.z }, ax, -ay, az);
      p.x = center.x + offset.x;
      p.y = center.y + offset.y;
      p.z = center.z + offset.z;
      p.rotation += ay;
      p.rx = (p.rx || 0) + ax;
      p.rz = (p.rz || 0) + az;
    } else if (m.type === "orbit") {
      const angle = t * Math.PI * 2, pivot = m.pivot || vec(null), r = m.radius || vec(null, 3);
      if (Math.abs(axis.x) > Math.abs(axis.y) && Math.abs(axis.x) >= Math.abs(axis.z)) {
        p.y += pivot.y + Math.cos(angle) * r.y;
        p.z += pivot.z + Math.sin(angle) * r.z;
        p.x += pivot.x;
      } else if (Math.abs(axis.z) > Math.abs(axis.y)) {
        p.x += pivot.x + Math.cos(angle) * r.x;
        p.y += pivot.y + Math.sin(angle) * r.y;
        p.z += pivot.z;
      } else {
        p.x += pivot.x + Math.cos(angle) * r.x;
        p.z += pivot.z + Math.sin(angle) * r.z;
        p.y += pivot.y;
      }
      ;
      if (m.orient) p.rotation += angle;
    } else if (m.type === "scale") {
      p.w *= Math.max(0.01, mix(a.x || 1, b.x || 1, t));
      p.h *= Math.max(0.01, mix(a.y || 1, b.y || 1, t));
      p.d *= Math.max(0.01, mix(a.z || 1, b.z || 1, t));
    } else if (m.type === "path" && m.points?.length) {
      const nodes = m.closed ? [...m.points, m.points[0]] : m.points, u = t * (nodes.length - 1), i = Math.min(nodes.length - 2, Math.floor(u));
      if (i >= 0) {
        for (const k of ["x", "y", "z"]) p[k] += mix(nodes[i][k], nodes[i + 1][k], u - i);
        if (m.orient) p.rotation = Math.atan2(nodes[i + 1].x - nodes[i].x, nodes[i + 1].z - nodes[i].z);
      }
    }
  }
  return p;
}
function communityPoses(objects, groups, time) {
  const all = new Map([...objects, ...groups].map((o) => [o.id, o])), cache = /* @__PURE__ */ new Map();
  function pose(o) {
    if (cache.has(o.id)) return cache.get(o.id);
    const p = motionPose(o, time);
    if (o.parentId && all.has(o.parentId)) {
      const group = all.get(o.parentId), base = group.origin || group, parent = pose(group), r = parent.rotation - (base.rotation || 0), dx = (p.x - base.x) * (parent.w || 1) / (base.w || 1), dz = (p.z - base.z) * (parent.d || 1) / (base.d || 1);
      const rx = (parent.rx || 0) - (base.rx || 0), rz = (parent.rz || 0) - (base.rz || 0), offset = rotateComponentPoint({ x: dx, y: (p.y - base.y) * (parent.h || 1) / (base.h || 1), z: dz }, rx, -r, rz);
      p.x = parent.x + offset.x;
      p.z = parent.z + offset.z;
      p.y = parent.y + offset.y;
      p.rotation += r;
      p.rx = (p.rx || 0) + rx;
      p.rz = (p.rz || 0) + rz;
      for (const k of ["w", "h", "d"]) p[k] *= (parent[k] || 1) / (base[k] || 1);
    }
    cache.set(o.id, p);
    return p;
  }
  return objects.map(pose);
}
function areaContains(a, p) {
  const x = (p.x - (a.x || 0)) / Math.max(0.1, a.w || 5), y = (p.y - (a.y || 0)) / Math.max(0.1, a.h || 5), z = (p.z - (a.z || 0)) / Math.max(0.1, a.d || 5);
  return a.shape === "sphere" ? x * x + y * y + z * z <= 0.25 : a.shape === "cylinder" ? x * x + z * z <= 0.25 && Math.abs(y) <= 0.5 : Math.abs(x) <= 0.5 && Math.abs(y) <= 0.5 && Math.abs(z) <= 0.5;
}
export {
  COMMUNITY_BUDGETS,
  MOTION_TYPES,
  PARTICLE_TYPES,
  TRIGGER_ACTIONS,
  TRIGGER_EVENTS,
  areaContains,
  cleanCommunityV2,
  cleanComponents,
  communityPoses,
  motionPose,
  rotateComponentPoint
};
