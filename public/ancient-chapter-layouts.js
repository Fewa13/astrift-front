// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
function nearestChapterPoint(x, z, blocked) {
  if (!blocked(x, z)) return { x, z };
  for (let radius = 1; radius <= 80; radius += 1) for (let i = 0; i < 32; i++) {
    const angle = i * Math.PI / 16, nx = x + Math.cos(angle) * radius, nz = z + Math.sin(angle) * radius;
    if (!blocked(nx, nz)) return { x: nx, z: nz };
  }
  return { x: 0, z: 10 };
}
function width(z, anchors) {
  for (let i = 1; i < anchors.length; i++) {
    const [a, w] = anchors[i - 1], [b, v] = anchors[i];
    if (z <= b) return w + (v - w) * Math.max(0, (z - a) / (b - a));
  }
  return anchors.at(-1)[1];
}
const starfallWidth = (z) => width(z, [[0, 44], [90, 38], [125, 23], [155, 40], [215, 43], [270, 24], [300, 42], [420, 44]]);
const frostcourtWidth = (z) => width(z, [[0, 47], [60, 47], [85, 35], [105, 49], [155, 49], [185, 36], [205, 48], [250, 48], [285, 36], [310, 49], [395, 49]]);
const skyreachWidth = (z) => width(z, [[0, 40], [60, 40], [70, 22], [85, 22], [100, 50], [150, 50], [165, 22], [185, 22], [200, 46], [250, 46], [265, 22], [285, 22], [304, 50], [390, 50]]);
const STARFALL_REBUILT = [
  { x: -29, z: 55, w: 15, d: 27, h: 9, kind: "wreck" },
  { x: 26, z: 85, w: 12, d: 18, h: 5, kind: "wreck" },
  ...[-1, 1].flatMap((s) => [185, 195].map((z) => ({ x: s * 9, z, w: 3, d: 3, h: 9, kind: "engine-support" }))),
  { x: -31, z: 190, w: 13, d: 36, h: 9, kind: "archive" },
  { x: 31, z: 220, w: 13, d: 30, h: 8, kind: "archive" },
  ...[-1, 1].flatMap((s) => [251, 261].map((z) => ({ x: s * 9, z, w: 3, d: 3, h: 9, kind: "engine-support" }))),
  { x: -32, z: 330, w: 10, d: 18, h: 5, kind: "wreck" },
  { x: 32, z: 365, w: 10, d: 22, h: 6, kind: "wreck" },
  ...Array.from({ length: 14 }, (_, i) => ({ x: Math.sin(i * Math.PI / 7) * 34, z: 378 + Math.cos(i * Math.PI / 7) * 30, w: 2.2, d: 2.2, h: 14, kind: "vault-column" }))
];
const FROSTCOURT_REBUILT = [
  { x: -35, z: 48, w: 15, d: 24, h: 13, kind: "icekeep" },
  { x: 34, z: 48, w: 15, d: 24, h: 9, kind: "gatehouse" },
  { x: 0, z: 130, w: 8, d: 26, h: 7, kind: "furnace" },
  { x: -37, z: 132, w: 15, d: 40, h: 16, kind: "icekeep" },
  { x: 37, z: 132, w: 15, d: 40, h: 12, kind: "furnace" },
  { x: 0, z: 225, w: 8, d: 22, h: 10, kind: "archive" },
  { x: -36, z: 233, w: 15, d: 32, h: 11, kind: "archive" },
  { x: 36, z: 230, w: 15, d: 36, h: 14, kind: "furnace" },
  { x: -35, z: 340, w: 12, d: 18, h: 18, kind: "icekeep" },
  { x: 35, z: 340, w: 12, d: 18, h: 14, kind: "gatehouse" },
  ...Array.from({ length: 15 }, (_, i) => ({ x: Math.cos(i * Math.PI / 14) * 39, z: 360 + Math.sin(i * Math.PI / 14) * 28, w: 6, d: 7, h: 6, kind: "gallery" }))
];
const SKYREACH_REBUILT = [
  { x: -29, z: 42, w: 9, d: 12, h: 6, kind: "anchor" },
  { x: 36, z: 118, w: 16, d: 23, h: 14, kind: "observatory" },
  { x: -37, z: 132, w: 12, d: 20, h: 9, kind: "orrery" },
  { x: 0, z: 242, w: 8, d: 12, h: 8, kind: "relay" },
  { x: -33, z: 222, w: 10, d: 16, h: 12, kind: "anchor" },
  { x: 33, z: 230, w: 10, d: 16, h: 12, kind: "anchor" },
  { x: -37, z: 338, w: 12, d: 20, h: 15, kind: "observatory" },
  { x: 37, z: 365, w: 12, d: 20, h: 10, kind: "orrery" },
  ...Array.from({ length: 8 }, (_, i) => ({ x: Math.sin(i * Math.PI / 4) * 30, z: 352 + Math.cos(i * Math.PI / 4) * 26, w: 0.7, d: 0.7, h: 16, kind: "cable-anchor" }))
];
export {
  FROSTCOURT_REBUILT,
  SKYREACH_REBUILT,
  STARFALL_REBUILT,
  frostcourtWidth,
  nearestChapterPoint,
  skyreachWidth,
  starfallWidth
};
