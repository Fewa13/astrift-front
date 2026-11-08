// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const CHAPTER_ROUTES = {
  starfall: [[0, 0, 0, 24, 0], [90, 100, 35, 29, 0], [150, 105, 145, 28, -6], [250, -75, 160, 30, -6], [290, -115, 65, 23, -12], [330, -65, 20, 25, -12], [378, 0, 88, 34, -12], [420, 0, 140, 34, -12]],
  frostcourt: [[0, 0, 0, 26, 0], [70, 0, 65, 30, 0], [90, -65, 95, 25, 0], [170, -115, 160, 30, 0], [190, -35, 205, 28, 0], [270, 90, 160, 30, 0], [290, 105, 245, 26, 0], [360, 0, 310, 38, 0], [395, -35, 335, 32, 0]],
  skyreach: [[0, 0, 0, 25, 0], [55, 0, 50, 28, 0], [70, 30, 72, 9, 1.5], [85, 58, 85, 26, 6], [150, 135, 85, 32, 6], [165, 135, 115, 10, 6], [185, 115, 155, 27, 12], [250, 15, 225, 30, 12], [265, -12, 220, 9, 12], [285, -50, 190, 27, 18], [352, -110, 100, 37, 18], [390, -140, 75, 32, 18]],
  dunes: [[0, 0, 0, 26, 0], [60, -55, 50, 24, 0], [100, -100, 125, 27, 0], [160, -25, 175, 37, 0], [200, 90, 155, 35, 0], [250, 135, 235, 24, 0], [300, 55, 290, 36, 0], [365, 0, 350, 40, 0], [410, -25, 370, 32, 0]]
};
const smooth = (x) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};
function chapterProjection(map, x, z) {
  const route = CHAPTER_ROUTES[map];
  let best = { distance: Infinity, u: 0, width: 0, height: 0 };
  if (!route) return best;
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1], b = route[i], dx = b[1] - a[1], dz = b[2] - a[2], t = Math.max(0, Math.min(1, ((x - a[1]) * dx + (z - a[2]) * dz) / (dx * dx + dz * dz))), distance = Math.hypot(x - a[1] - dx * t, z - a[2] - dz * t), w = a[3] + (b[3] - a[3]) * t;
    if (distance - w < best.distance - best.width) best = { distance, u: a[0] + (b[0] - a[0]) * t, width: w, height: a[4] + (b[4] - a[4]) * t };
  }
  return best;
}
function chapterPoint(map, x, u) {
  const route = CHAPTER_ROUTES[map];
  if (!route) return { x, z: u };
  let i = 1;
  while (i < route.length - 1 && u > route[i][0]) i++;
  const a = route[i - 1], b = route[i], t = Math.max(0, Math.min(1, (u - a[0]) / (b[0] - a[0]))), dx = b[1] - a[1], dz = b[2] - a[2], n = Math.hypot(dx, dz), width = a[3] + (b[3] - a[3]) * t, side = x * Math.min(1, width / 46);
  return { x: a[1] + dx * t + dz / n * side, z: a[2] + dz * t - dx / n * side };
}
const CHAPTER_EXTRAS = { frostcourt: [{ x: 0, z: 150, w: 72, d: 100 }, { x: -75, z: 150, w: 100, d: 14 }, { x: 65, z: 165, w: 100, d: 14 }, { x: 0, z: 235, w: 16, d: 80 }], starfall: [], skyreach: [], dunes: [{ x: 15, z: 180, w: 90, d: 55 }, { x: 5, z: 270, w: 16, d: 100 }] };
function chapterDistance(map, x, z) {
  const p = chapterProjection(map, x, z);
  let d = p.width - p.distance;
  for (const e of CHAPTER_EXTRAS[map] || []) d = Math.max(d, Math.min(e.w / 2 - Math.abs(x - e.x), e.d / 2 - Math.abs(z - e.z)));
  return d;
}
const DUNES_OASIS = { x: 15, z: 180, rx: 12, rz: 7, water: -0.42 };
function dunesOasisRadius(x, z) {
  const o = DUNES_OASIS;
  return Math.hypot((x - o.x) / o.rx, (z - o.z) / o.rz);
}
function chapterHeight(map, x, z) {
  if (map === "frostcourt") return 8 * smooth((z - 245) / 45) + 4 * smooth((-x - 65) / 40) * (1 - smooth((z - 190) / 30)) - 6 * smooth((x - 55) / 40) * (1 - smooth((z - 200) / 35));
  if (map === "dunes") {
    const r = dunesOasisRadius(x, z);
    return 10 * smooth((z - 265) / 60) + Math.sin(x * 0.026) * Math.sin(z * 0.028) * 2.4 * (1 - smooth((z - 300) / 25)) * smooth((r - 1.2) / 0.65) - (1 - smooth((r - 0.48) / 0.83)) * 1.45;
  }
  let total = 0, sum = 0;
  const route = CHAPTER_ROUTES[map] || [];
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1], b = route[i], dx = b[1] - a[1], dz = b[2] - a[2], t = Math.max(0, Math.min(1, ((x - a[1]) * dx + (z - a[2]) * dz) / (dx * dx + dz * dz))), dist = Math.hypot(x - a[1] - t * dx, z - a[2] - t * dz), w = a[3] + (b[3] - a[3]) * t, weight = Math.max(0, 1 - dist / (w + 12)) ** 3;
    sum += (a[4] + (b[4] - a[4]) * t) * weight;
    total += weight;
  }
  return total ? sum / total : chapterProjection(map, x, z).height;
}
const CHAPTER_PROPS = {
  starfall: [{ x: 145, z: 70, w: 24, d: 70, h: 24, kind: "broken-hull" }, { x: 68, z: 180, w: 20, d: 18, h: 20, kind: "sunken-arch" }, { x: -120, z: 140, w: 14, d: 26, h: 13, kind: "coral-tower" }, { x: -60, z: -10, w: 30, d: 12, h: 8, kind: "wreck-ribs" }, { x: 43, z: 124, w: 8, d: 10, h: 17, kind: "vault-pylon" }, { x: -44, z: 115, w: 8, d: 10, h: 17, kind: "vault-pylon" }],
  frostcourt: [{ x: -150, z: 110, w: 17, d: 35, h: 24, kind: "ice-bastion" }, { x: -155, z: 185, w: 18, d: 28, h: 19, kind: "ice-bastion" }, { x: 145, z: 138, w: 20, d: 35, h: 22, kind: "blast-furnace" }, { x: 145, z: 190, w: 16, d: 18, h: 15, kind: "blast-furnace" }, { x: -25, z: 125, w: 12, d: 12, h: 12, kind: "fountain" }, { x: 25, z: 190, w: 12, d: 12, h: 14, kind: "bell-tower" }, { x: -46, z: 307, w: 12, d: 30, h: 22, kind: "throne-wing" }, { x: 46, z: 307, w: 12, d: 30, h: 22, kind: "throne-wing" }],
  skyreach: [{ x: 35, z: 18, w: 8, d: 10, h: 15, kind: "sky-mooring" }, { x: 158, z: 72, w: 9, d: 12, h: 24, kind: "wind-harp" }, { x: 125, z: 181, w: 9, d: 9, h: 16, kind: "lightning-coil" }, { x: -8, z: 252, w: 9, d: 10, h: 15, kind: "broken-orbit" }, { x: -145, z: 122, w: 10, d: 10, h: 27, kind: "storm-needle" }],
  dunes: [{ x: -102, z: 80, w: 14, d: 20, h: 24, kind: "eroded-pillar" }, { x: -133, z: 151, w: 20, d: 20, h: 18, kind: "eroded-pillar" }, { x: -42, z: 205, w: 12, d: 16, h: 13, kind: "sand-house" }, { x: 48, z: 178, w: 14, d: 22, h: 14, kind: "sand-house" }, { x: 120, z: 185, w: 13, d: 15, h: 12, kind: "sand-house" }, { x: 168, z: 249, w: 13, d: 28, h: 22, kind: "stone-spire" }, { x: 80, z: 325, w: 16, d: 18, h: 25, kind: "sun-obelisk" }, { x: -55, z: 325, w: 14, d: 18, h: 22, kind: "sun-obelisk" }]
};
for (let z = 270; z < 340; z += 14) for (const x of [-28, 28]) CHAPTER_PROPS.frostcourt.push({ x, z, w: 3, d: 3, h: 20, kind: "nave-column" });
for (const x of [-45, 45]) CHAPTER_PROPS.dunes.push({ x, z: 350, w: 30, d: 90, h: 30, kind: "temple-wing" });
function chapterBlocked(map, x, z, r = 0.6, feet = chapterHeight(map, x, z)) {
  return !Number.isFinite(x + z) || chapterDistance(map, x, z) < r || [...CHAPTER_PROPS[map] || [], ...chapterGates(map)].some((o) => feet < chapterHeight(map, o.x, o.z) + o.h - 0.1 && Math.abs(x - o.x) < o.w / 2 + r && Math.abs(z - o.z) < o.d / 2 + r) || false;
}
function chapterClear(map, ax, ay, az, bx, by, bz) {
  const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.7));
  for (let i = 1; i < n; i++) {
    const t = i / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t, y = ay + (by - ay) * t;
    if (chapterDistance(map, x, z) < 0 || y < chapterHeight(map, x, z) - 0.15 || [...CHAPTER_PROPS[map] || [], ...chapterGates(map)].some((o) => Math.abs(x - o.x) < o.w / 2 && Math.abs(z - o.z) < o.d / 2 && y < chapterHeight(map, o.x, o.z) + o.h)) return false;
  }
  return true;
}
function chapterPath(map, ax, az, bx, bz) {
  const clear = (x, z, tx, tz) => {
    const n = Math.max(1, Math.ceil(Math.hypot(tx - x, tz - z) / 1));
    for (let i = 0; i <= n; i++) if (chapterBlocked(map, x + (tx - x) * i / n, z + (tz - z) * i / n, 1)) return false;
    return true;
  };
  if (clear(ax, az, bx, bz)) return [{ x: bx, z: bz }];
  const step = 4, first = { x: Math.round(ax / step) * step, z: Math.round(az / step) * step }, key = (p) => p.x + "," + p.z;
  if (!clear(ax, az, first.x, first.z)) return [];
  const queue = [first], parent = /* @__PURE__ */ new Map([[key(first), ""]]), nodes = /* @__PURE__ */ new Map([[key(first), first]]);
  let head = 0;
  while (head < queue.length && head < 6500) {
    const p = queue[head++], k = key(p);
    if (Math.hypot(p.x - bx, p.z - bz) < 7 && clear(p.x, p.z, bx, bz)) {
      const path = [{ x: bx, z: bz }];
      let at = k;
      while (at) {
        path.push(nodes.get(at));
        at = parent.get(at);
      }
      return path.reverse();
    }
    for (const [dx, dz] of [[4, 0], [-4, 0], [0, 4], [0, -4]]) {
      const q = { x: p.x + dx, z: p.z + dz }, j = key(q);
      if (!parent.has(j) && clear(p.x, p.z, q.x, q.z)) {
        parent.set(j, k);
        nodes.set(j, q);
        queue.push(q);
      }
    }
  }
  return [];
}
function chapterSafe(map, x, z, r = 0.8) {
  if (!chapterBlocked(map, x, z, r)) return { x, z };
  for (let d = 1; d <= 50; d++) for (let i = 0; i < 24; i++) {
    const a = i * Math.PI / 12, p = { x: x + Math.sin(a) * d, z: z + Math.cos(a) * d };
    if (!chapterBlocked(map, p.x, p.z, r)) return p;
  }
  return chapterPoint(map, 0, 10);
}
const mappedNPCs = /* @__PURE__ */ new WeakSet();
function mapChapterNPCs(npcs) {
  for (const n of Object.values(npcs)) if (CHAPTER_ROUTES[n.map] && !mappedNPCs.has(n)) {
    Object.assign(n, chapterSafe(n.map, ...Object.values(chapterPoint(n.map, n.x, n.z))));
    mappedNPCs.add(n);
  }
  return npcs;
}
const chapterStates = /* @__PURE__ */ new Map();
function setChapterState(map, state) {
  chapterStates.set(map, state);
}
function getChapterState(map) {
  return chapterStates.get(map) || {};
}
const CHAPTER_GATES = {
  frostcourt: [{ x: -68, z: 150, w: 3, d: 14, h: 6, kind: "ice-door", open: (s) => !s.phase }, { x: 65, z: 165, w: 3, d: 14, h: 6, kind: "fire-door", open: (s) => !!s.phase }],
  dunes: [{ x: 5, z: 275, w: 16, d: 3, h: 9, kind: "sun-gate", open: (s) => !!s.solved }]
};
function chapterGates(map) {
  const state = getChapterState(map);
  return (CHAPTER_GATES[map] || []).filter((g) => !g.open(state));
}
function chapterMovementScale(map, x, z) {
  return map === "starfall" && !getChapterState(map).drained && chapterHeight(map, x, z) < -4 ? 0.85 : 1;
}
export {
  CHAPTER_EXTRAS,
  CHAPTER_GATES,
  CHAPTER_PROPS,
  CHAPTER_ROUTES,
  DUNES_OASIS,
  chapterBlocked,
  chapterClear,
  chapterDistance,
  chapterGates,
  chapterHeight,
  chapterMovementScale,
  chapterPath,
  chapterPoint,
  chapterProjection,
  chapterSafe,
  dunesOasisRadius,
  getChapterState,
  mapChapterNPCs,
  setChapterState
};
