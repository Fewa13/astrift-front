// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { tribeCompactZ, blocked, ancientMapHeight } from "./ancient-rules.js";
const names = { herb: ["\u836F\u8349\u4E1B", "Medicinal Herbs"], pouch: ["\u9057\u7559\u94B1\u888B", "Forgotten Coin Pouch"], rune: ["\u53E4\u4EE3\u7B26\u7891", "Ancient Runestone"] };
function mapObjects(map) {
  if (!["tribe", "forest", "city"].includes(map)) return [];
  const points = map === "forest" ? Array.from({ length: 18 }, (_, i) => i < 6 ? { x: -18 + i % 3 * 18, z: 40 + Math.floor(i / 3) * 40 } : i < 10 ? { x: -18 + (i - 6) * 12, z: 155 } : { x: 30 + (i - 10) % 4 * 28, z: 244 + Math.floor((i - 10) / 4) * 105 }) : map === "city" ? Array.from({ length: 18 }, (_, i) => ({ x: i % 2 ? -12 : 12, z: 45 + i * 27 })) : Array.from({ length: 24 }, (_, i) => ({ x: i % 2 ? -13 : 13, z: tribeCompactZ(42 + i * 37) }));
  return points.map((p, i) => {
    let x = p.x, z = p.z;
    for (let n = 0; n < 40 && blocked(x, z, 1.2, map); n++) {
      x = p.x + Math.sin(n * 2.4) * (2 + n * 0.4);
      z = p.z + Math.cos(n * 2.4) * (2 + n * 0.4);
    }
    const kind = ["herb", "pouch", "rune"][i % 3];
    return { id: map + ":" + i, map, x, z, kind, name: names[kind][0], en: names[kind][1] };
  }).filter((p) => !blocked(p.x, p.z, 1.2, map));
}
function canUseMapObject(a, o, now, readyAt, clear) {
  return a.hp > 0 && (a.map || "tribe") === o.map && now >= readyAt && Math.hypot(a.x - o.x, a.z - o.z) <= 2.8 && Math.abs(a.y - ancientMapHeight(o.map, o.x, o.z)) < 3 && clear(a.x, a.y, a.z, o.x, ancientMapHeight(o.map, o.x, o.z) + 0.6, o.z);
}
function grantMapObject(p, kind) {
  if (kind === "herb") {
    const id = p.level < 20 ? "minor" : p.level < 40 ? "medium" : p.level < 70 ? "major" : "superior";
    p.potions[id] = (p.potions[id] || 0) + 1;
    return { potion: id };
  }
  if (kind === "pouch") {
    const coins = Math.max(5, Math.floor(p.level * 2));
    p.coins = Math.round((p.coins + coins) * 100) / 100;
    return { coins };
  }
  p.materials.stone = (p.materials.stone || 0) + 3;
  return { material: "stone", count: 3 };
}
export {
  canUseMapObject,
  grantMapObject,
  mapObjects
};
