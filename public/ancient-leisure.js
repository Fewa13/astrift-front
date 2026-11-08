// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { CHAPTER_ROUTES, chapterPoint, chapterSafe, chapterHeight } from "./ancient-geography.js";
import { ROUGH_STONES } from "./ancient-stonework.js";
const PASSAGE_RECTS = {
  tribe: [[35, 84, 78, 90], [64, 84, 78, 138], [35, 84, 126, 138]],
  forest: [[-65, -30, 36, 44], [-65, -45, 36, 89], [-65, -30, 81, 89]]
};
const PASSAGE_NAMES = { tribe: ["\u9057\u5F03\u77FF\u9053", "Abandoned Mine"], forest: ["\u6811\u6839\u6697\u9053", "Rootveil Passage"] };
const FISH_SPECIES = {
  fishRiver: { name: "\u6EAA\u94F6\u9C7C", en: "Silverbrook Fish", sell: 8, tribe: 35, forest: 18, strength: 0.8, minKg: 0.12, maxKg: 0.45, color: 12114133, shape: "slim", meal: 1 },
  fishPerch: { name: "\u9752\u9CCD\u9C88", en: "Jadefin Perch", sell: 20, tribe: 9, forest: 23, strength: 1, minKg: 0.4, maxKg: 1.8, color: 6792843, shape: "perch", meal: 1 },
  fishMoon: { name: "\u6708\u7EB9\u9CA4", en: "Moonmarked Carp", sell: 50, tribe: 1, forest: 3, strength: 1.2, minKg: 1.2, maxKg: 4.5, color: 10204390, shape: "carp", meal: 2 },
  fishCrucian: { name: "\u94F6\u9CDE\u9CAB", en: "Silverfin Crucian", sell: 12, tribe: 25, forest: 15, strength: 0.85, minKg: 0.2, maxKg: 1.1, color: 13221539, shape: "carp", meal: 1 },
  fishMinnow: { name: "\u957F\u5C3E\u9CD1\u9C8F", en: "Longtail Bitterling", sell: 6, tribe: 18, forest: 0, strength: 0.75, minKg: 0.06, maxKg: 0.22, color: 12363206, shape: "slim", meal: 1 },
  fishLoach: { name: "\u82B1\u7EB9\u6CE5\u9CC5", en: "Mottled Loach", sell: 10, tribe: 14, forest: 0, strength: 0.85, minKg: 0.08, maxKg: 0.35, color: 10720879, shape: "eel", meal: 1 },
  fishCatfish: { name: "\u77F3\u5E95\u9CB6", en: "Stonebed Catfish", sell: 28, tribe: 7, forest: 0, strength: 1.1, minKg: 0.8, maxKg: 3.8, color: 6913408, shape: "catfish", meal: 1 },
  fishTrout: { name: "\u8D64\u6591\u9CDF", en: "Redspot Trout", sell: 25, tribe: 0, forest: 20, strength: 1.05, minKg: 0.5, maxKg: 2.2, color: 12095098, shape: "slim", meal: 1 },
  fishPike: { name: "\u82A6\u82C7\u72D7\u9C7C", en: "Reed Pike", sell: 42, tribe: 3, forest: 5, strength: 1.2, minKg: 1.1, maxKg: 5, color: 8559202, shape: "pike", meal: 2 },
  fishEel: { name: "\u9752\u80CC\u9CD7", en: "Blueback Eel", sell: 35, tribe: 0, forest: 10, strength: 1.1, minKg: 0.4, maxKg: 2.4, color: 5864593, shape: "eel", meal: 1 },
  fishGolden: { name: "\u91D1\u987B\u9CA4", en: "Goldenwhisker Carp", sell: 85, tribe: 1, forest: 0, strength: 1.3, minKg: 1.8, maxKg: 6, color: 14003795, shape: "carp", meal: 2 },
  fishGlass: { name: "\u900F\u9CCD\u9C7C", en: "Glassfin", sell: 22, tribe: 0, forest: 10, strength: 0.9, minKg: 0.15, maxKg: 0.65, color: 10081995, shape: "slim", meal: 1 },
  fishLotus: { name: "\u83B2\u5F71\u9CB7", en: "Lotusshade Bream", sell: 55, tribe: 0, forest: 6, strength: 1.15, minKg: 0.6, maxKg: 2.6, color: 11896487, shape: "carp", meal: 2 },
  fishMoss: { name: "\u82D4\u7EB9\u9CDF", en: "Mossback Trout", sell: 28, tribe: 0, forest: 0, strength: 1.05, minKg: 0.4, maxKg: 2.1, color: 7839080, shape: "slim", meal: 1 },
  fishAmber: { name: "\u7425\u73C0\u9CCD\u9C88", en: "Amberfin Perch", sell: 38, tribe: 0, forest: 0, strength: 1.15, minKg: 0.6, maxKg: 2.8, color: 13870938, shape: "perch", meal: 1 },
  fishCrown: { name: "\u6708\u51A0\u9CA4", en: "Mooncrown Carp", sell: 90, tribe: 0, forest: 0, strength: 1.35, minKg: 1.5, maxKg: 5.5, color: 12167391, shape: "carp", meal: 2 },
  fishSturgeon: { name: "\u53E4\u7EB9\u9C9F", en: "Ancient Sturgeon", sell: 150, tribe: 0, forest: 1, strength: 1.45, minKg: 3, maxKg: 12, color: 9215648, shape: "sturgeon", meal: 3 }
};
const LEISURE_FOODS = { "meal:grilled": { name: "\u9999\u70E4\u6EAA\u9C7C", en: "Grilled Brookfish", healPercent: 12 } };
for (const [key, f] of Object.entries(FISH_SPECIES)) LEISURE_FOODS["meal:" + key] = { name: "\u9999\u70E4" + f.name, en: "Grilled " + f.en, healPercent: 12 + Math.round((f.sell - 6) / 144 * 18) };
const UPLAND_FISH_WEIGHTS = { fishMoss: 45, fishAmber: 30, fishCrown: 5, fishTrout: 10, fishGlass: 8, fishMoon: 2 };
function rollFish(map, random = Math.random, poolId = "") {
  const value = (key, f) => poolId === "upland" ? UPLAND_FISH_WEIGHTS[key] || 0 : map === "forest" ? f.forest : f.tribe, pool = Object.entries(FISH_SPECIES).filter(([key, f]) => value(key, f) > 0), weight = pool.reduce((n, [key, f]) => n + value(key, f), 0);
  let roll = Math.max(0, Math.min(0.999999, random())) * weight;
  for (const [key, f] of pool) {
    roll -= value(key, f);
    if (roll < 0) return key;
  }
  return pool[0][0];
}
function leisureErrorText(message, english) {
  const zh = { "Use food while alive": "\u8BF7\u5728\u5B58\u6D3B\u65F6\u98DF\u7528\u6599\u7406", "Food is cooling down": "\u6599\u7406\u51B7\u5374\u4E2D", "Not enough food": "\u6599\u7406\u4E0D\u8DB3", "Health is already full": "\u751F\u547D\u503C\u5DF2\u6EE1", "Recipe not found": "\u914D\u65B9\u4E0D\u5B58\u5728", "Not enough materials": "\u5236\u4F5C\u6750\u6599\u4E0D\u8DB3", "Item limit reached": "\u7269\u54C1\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650", "Invalid quantity": "\u6570\u91CF\u65E0\u6548\u6216\u7269\u54C1\u4E0D\u8DB3", "Gold limit reached": "\u91D1\u5E01\u5DF2\u8FBE\u4E0A\u9650" };
  return english ? message : zh[message] || message;
}
function passageInside(map, x, z, r = 0) {
  return (PASSAGE_RECTS[map] || []).some(([l, h, b, f]) => x > l + r && x < h - r && z > b + r && z < f - r);
}
function tribeMineWallCovered(axis, x, z) {
  return axis === 1 && x > 39 && x < 59 && [78, 90, 126, 138].includes(z);
}
function tribeLeisureOpening(x, z) {
  return x > 36 && (z >= 78 && z <= 90 || z >= 126 && z <= 138);
}
function tribePassageLineClear(ax, az, bx, bz) {
  if (Math.abs(ax) < 39 && Math.abs(bx) < 39) return true;
  const steps = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.4);
  for (let i = 0; i <= steps; i++) {
    const t = steps ? i / steps : 0, x = ax + (bx - ax) * t, z = az + (bz - az) * t;
    if (!(Math.abs(x) < 39 && z > 3 && z < 597) && !passageInside("tribe", x, z)) return false;
  }
  return true;
}
const LEISURE_ITEMS = {
  oreCopper: { name: "\u8D64\u94DC\u77FF", en: "Copper Ore", sell: 12, icon: "\u2B1F" },
  oreIron: { name: "\u4E4C\u94C1\u77FF", en: "Iron Ore", sell: 25, icon: "\u2B1F" },
  oreMoon: { name: "\u6708\u8F89\u77FF", en: "Moonstone Ore", sell: 65, icon: "\u25C6" },
  fishRiver: { name: "\u6EAA\u94F6\u9C7C", en: "Silverbrook Fish", sell: 8, icon: "\u25C1" },
  fishPerch: { name: "\u9752\u9CCD\u9C88", en: "Jadefin Perch", sell: 20, icon: "\u25C1" },
  fishMoon: { name: "\u6708\u7EB9\u9CA4", en: "Moonmarked Carp", sell: 50, icon: "\u25C1" },
  "meal:grilled": { name: "\u9999\u70E4\u6EAA\u9C7C", en: "Grilled Brookfish", sell: 0, icon: "\u2668" }
};
for (const [key, d] of Object.entries(ROUGH_STONES)) LEISURE_ITEMS[key] = { name: d.name, en: d.en, sell: d.sell, icon: "\u2B1F" };
for (const [key, f] of Object.entries(FISH_SPECIES)) LEISURE_ITEMS[key] = { name: f.name, en: f.en, sell: f.sell, icon: "\u25C1" };
for (const [key, f] of Object.entries(LEISURE_FOODS)) LEISURE_ITEMS[key] = { name: f.name, en: f.en, sell: 0, icon: "\u2668" };
const LEISURE_NODES = [
  { id: "tribe-copper", map: "tribe", x: 76, z: 99, kind: "mine", material: "roughStone", name: "\u5C71\u7EB9\u77F3\u5C42", en: "Striated Stone Deposit" },
  { id: "tribe-iron", map: "tribe", x: 76, z: 117, kind: "mine", material: "roughDark", name: "\u4E4C\u76AE\u77F3\u5C42", en: "Darkskin Stone Deposit" },
  { id: "tribe-brook", map: "tribe", x: 14, z: 17, kind: "fish", name: "\u90E8\u843D\u6EAA\u6F6D", en: "Tribe Brookpool" },
  { id: "forest-iron", map: "forest", x: -57, z: 52, kind: "mine", material: "roughDark", name: "\u4E4C\u76AE\u77F3\u5C42", en: "Darkskin Stone Deposit" },
  { id: "forest-moon", map: "forest", x: -57, z: 73, kind: "mine", material: "roughMoon", name: "\u6708\u7EB9\u77F3\u5C42", en: "Moonvein Stone Deposit" },
  { id: "forest-upland", map: "forest", x: 20, y: 10, z: 165, direction: 1, kind: "fish", pool: "upland", name: "\u9AD8\u53F0\u6620\u6708\u6C60", en: "Highland Moonpool" },
  { id: "forest-pond", map: "forest", x: -17, z: 17, kind: "fish", name: "\u6797\u95F4\u6E05\u6F6D", en: "Forest Glade Pool" }
];
for (const [map, spots] of Object.entries({
  tribe: [[72, 88], [69, 106], [77, 129]],
  forest: [[-53, 42], [-60, 62], [-51, 83]],
  city: [[-10, 50], [12, 65], [-12, 130], [10, 155], [-12, 245], [12, 290]],
  blight: [[-10, 50], [10, 70], [-12, 145], [10, 165], [-10, 275], [10, 300]],
  sanctum: [[-10, 50], [10, 70], [-12, 130], [12, 155], [-10, 260], [10, 290]],
  frostcourt: [[-10, 45], [10, 63], [-14, 120], [12, 147], [-12, 224], [14, 245], [-14, 325], [14, 343]],
  skyreach: [[-15, 42], [14, 58], [-15, 112], [15, 146], [-15, 212], [14, 246], [-15, 314], [14, 340]],
  dunes: [[-12, 45], [10, 75], [-12, 130], [12, 155], [-12, 225], [12, 250], [-12, 320], [12, 345]],
  starfall: [[-10, 45], [10, 70], [-12, 165], [10, 190], [-10, 315], [12, 340]]
})) {
  spots.forEach(([x, z], i) => LEISURE_NODES.push({ id: map + "-ground-" + i, map, x, z, y: map === "skyreach" ? z >= 285 ? 18 : z >= 185 ? 12 : z >= 85 ? 6 : 0 : map === "frostcourt" ? z >= 290 ? 18 : z >= 190 ? 12 : z >= 90 ? 6 : 0 : map === "sanctum" && z >= 240 ? 8 : map === "starfall" ? z >= 290 ? -12 : z >= 150 ? -6 : 0 : 0, kind: "mine", material: ["roughStone", "oreCopper", "roughDark", "oreIron", "roughMoon", "oreMoon"][i % 6], name: "\u6563\u843D\u77F3\u6599", en: "Loose Stone" }));
}
for (const n of LEISURE_NODES) if (n.kind === "mine") {
  n.material = "roughStone";
  n.name = "\u539F\u77F3";
  n.en = "Rough Stone";
}
for (const key of ["roughStone", "roughDark", "roughMoon"]) {
  LEISURE_ITEMS[key].name = "\u539F\u77F3";
  LEISURE_ITEMS[key].en = "Rough Stone";
}
const LEISURE_POSTS = Object.entries(PASSAGE_RECTS).flatMap(([map]) => {
  const x = map === "tribe" ? 74 : -55, start = map === "tribe" ? 82 : 40, end = map === "tribe" ? 134 : 85, out = [];
  for (let z = start; z <= end; z += 7) for (const side of [-1, 1]) out.push({ map, x: x + side * 8.5, z, r: 0.18 });
  for (const z of [start, end]) for (const side of [-1, 1]) out.push({ map, x: map === "tribe" ? 38 : -34, z: z + side * 4.8, r: 0.25 });
  return out;
});
for (const n of LEISURE_NODES) if (CHAPTER_ROUTES[n.map]) {
  const p = chapterPoint(n.map, n.x, n.z), safe = chapterSafe(n.map, p.x, p.z);
  Object.assign(n, safe, { y: chapterHeight(n.map, safe.x, safe.z) });
}
function leisureSolid(map, x, z, r = 0.6) {
  return LEISURE_POSTS.some((p) => p.map === map && Math.hypot(p.x - x, p.z - z) < p.r + r);
}
function leisureView(s) {
  if (!s) return s;
  const { fish, weight, ...view } = s;
  return view;
}
function fishingGauge(now, started) {
  return (Math.sin((now - started) * 35e-4) + 1) / 2;
}
function fishingPull(now, s) {
  const t = Math.max(0, (now - s.started) / 1e3), cycle = Math.floor(t / 5), noise = (n) => {
    const x = Math.sin((cycle + 1) * 12.9898 + (s.seed || 0) * 78.233 + n * 19.19) * 43758.5453;
    return x - Math.floor(x);
  }, start = 1 + noise(0) * 1.2;
  return t % 5 > start && t % 5 < start + 1 + noise(1) * 0.9;
}
function advanceFishing(s, now) {
  const f = FISH_SPECIES[s.fish || "fishRiver"] || FISH_SPECIES.fishRiver;
  const start = Math.max(s.lastAt || now, now - 1e3);
  for (let at = start; at < now; at += 50) {
    const dt = Math.min(50, now - at) / 1e3, held = !!s.held && at < (s.controlAt || 0) + 750, pull = fishingPull(at, s);
    s.tension = Math.max(0, Math.min(105, (s.tension ?? 35) + (held ? pull ? 25 * f.strength : 8 : pull ? -5 : -23) * dt));
    s.progress = Math.max(0, Math.min(100, s.progress + (held ? (pull ? 7 : 19) / f.strength : -(pull ? 6 : 3)) * dt));
    s.strain = s.tension >= 100 ? (s.strain || 0) + dt : 0;
  }
  s.lastAt = now;
  return (s.strain || 0) >= 0.85 ? "line" : s.progress >= 100 ? "catch" : null;
}
function leisureNear(a, n, clear) {
  return a.hp > 0 && a.map === n.map && Math.hypot(a.x - n.x, a.z - n.z) < 3 && Math.abs(a.y - ((n.y || 0) + 1.7)) < 1.6 && clear(a.x, a.y, a.z, n.x, (n.y || 0) + 0.75, n.z);
}
function add(p, key, n) {
  const count = (p.materials[key] || 0) + n;
  if (!Number.isSafeInteger(count) || count > 999999999) return false;
  p.materials[key] = count;
  return true;
}
function leisureCommand(a, p, d, state, now, clear, random = Math.random) {
  const n = LEISURE_NODES.find((n2) => n2.id === d.id && n2.map === a.map), old = a.leisure;
  if (d.action === "cancel") {
    delete a.leisure;
    return { changed: false };
  }
  if (!n || !leisureNear(a, n, clear)) {
    delete a.leisure;
    return { changed: false };
  }
  if ((!old || n.kind === "mine") && now - (a.leisureAt ?? -Infinity) < 250) return { changed: false };
  a.leisureAt = now;
  if (old && (old.node !== n.id || old.expires <= now)) delete a.leisure;
  if (n.kind === "mine") {
    delete a.leisure;
    if (d.action === "reel" || d.action === "tick" || d.action === "hook" || (state.ready[n.id] || 0) > now) return { changed: false };
    const key2 = n.material || "roughStone";
    if (!add(p, key2, 1)) return { changed: false };
    state.ready[n.id] = now + 45e3 + Math.floor(random() * 75e3);
    return { changed: true, reward: key2, animation: "pickup" };
  }
  let s = a.leisure;
  if (!s) {
    if (d.action === "reel" || d.action === "tick" || d.action === "hook") return { changed: false };
    const biteAt = now + 2500 + Math.floor(random() * 2500), fish = n.kind === "fish" ? rollFish(n.map, random, n.pool) : void 0, f = fish && FISH_SPECIES[fish];
    a.leisure = { node: n.id, kind: n.kind, phase: "waiting", started: now, nextAt: now + 650, biteAt, expires: biteAt + 3500, hits: 0, progress: 0, hp: a.hp, ...f ? { fish, weight: Math.round((f.minKg + (f.maxKg - f.minKg) * random()) * 100) / 100, seed: random(), tension: 35 } : {} };
    return { changed: false, animation: "cast" };
  }
  if (s.kind === "mine") {
    delete a.leisure;
    return { changed: false };
  }
  if (s.phase === "waiting") {
    if (d.action === "tick" || d.action === "reel") return { changed: false };
    if (now < s.biteAt) return { changed: false };
    s.phase = "hooked";
    s.started = now;
    s.nextAt = now;
    s.lastAt = now;
    s.controlAt = now;
    s.held = d.held === true;
    s.expires = now + 45e3;
    return { changed: false, animation: "hook" };
  }
  const result = advanceFishing(s, now);
  if (result === "line") {
    delete a.leisure;
    return { changed: false, animation: "lineBreak" };
  }
  if (result !== "catch") {
    s.held = d.held === true;
    s.controlAt = now;
    return { changed: false };
  }
  const key = s.fish && Object.hasOwn(FISH_SPECIES, s.fish) ? s.fish : "fishRiver", weight = s.weight || FISH_SPECIES[key].minKg, rewarded = add(p, key, 1);
  if (rewarded) {
    p.fishing ??= {};
    const old2 = p.fishing[key] || { count: 0, bestKg: 0 };
    p.fishing[key] = { count: Math.min(999999999, old2.count + 1), bestKg: Math.max(old2.bestKg, weight) };
  }
  delete a.leisure;
  return { changed: rewarded, reward: rewarded ? key : void 0, weight: rewarded ? weight : void 0, animation: "catch" };
}
function leisureRecipe(p, id) {
  if (id.startsWith("fishMeal:")) {
    const key = id.slice(9), fish = Object.hasOwn(FISH_SPECIES, key) ? FISH_SPECIES[key] : void 0;
    if (!fish) return "Recipe not found";
    if ((p.materials[key] || 0) < 1) return "Not enough materials";
    if (!add(p, "meal:" + key, fish.meal)) return "Item limit reached";
    p.materials[key]--;
    return null;
  }
  const recipes = {
    copperFlint: { cost: { oreCopper: 2 }, key: "stone", n: 5 },
    ironFlint: { cost: { oreIron: 1 }, key: "stone", n: 5 },
    moonFlint: { cost: { oreMoon: 1 }, key: "stone", n: 12 },
    riverMeal: { cost: { fishRiver: 2 }, key: "meal:fishRiver", n: 1 },
    perchMeal: { cost: { fishPerch: 1 }, key: "meal:fishPerch", n: 1 },
    moonMeal: { cost: { fishMoon: 1 }, key: "meal:fishMoon", n: 2 }
  };
  const r = Object.hasOwn(recipes, id) ? recipes[id] : void 0;
  if (!r) return "Recipe not found";
  if (Object.entries(r.cost).some(([k, n]) => (p.materials[k] || 0) < n)) return "Not enough materials";
  if (!add(p, r.key, r.n)) return "Item limit reached";
  for (const [k, n] of Object.entries(r.cost)) p.materials[k] -= n;
  return null;
}
function sellLeisure(p, key, quantity) {
  const d = Object.hasOwn(LEISURE_ITEMS, key) ? LEISURE_ITEMS[key] : void 0;
  if (!d || !d.sell || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 999 || (p.materials[key] || 0) < quantity) return "Invalid quantity";
  const coins = Math.round(p.coins * 100 + d.sell * quantity * 100);
  if (!Number.isSafeInteger(coins)) return "Gold limit reached";
  p.materials[key] -= quantity;
  p.coins = coins / 100;
  return null;
}
export {
  FISH_SPECIES,
  LEISURE_FOODS,
  LEISURE_ITEMS,
  LEISURE_NODES,
  PASSAGE_NAMES,
  PASSAGE_RECTS,
  UPLAND_FISH_WEIGHTS,
  fishingGauge,
  fishingPull,
  leisureCommand,
  leisureErrorText,
  leisureNear,
  leisureRecipe,
  leisureSolid,
  leisureView,
  passageInside,
  rollFish,
  sellLeisure,
  tribeLeisureOpening,
  tribeMineWallCovered,
  tribePassageLineClear
};
