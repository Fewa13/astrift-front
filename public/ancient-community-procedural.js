// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const PROCEDURAL_MODELS = [["hemisphere", "\u534A\u7403", "Hemisphere"], ["polyhedron", "\u591A\u9762\u4F53", "Polyhedron"], ["hollowCylinder", "\u7A7A\u5FC3\u5706\u67F1", "Hollow cylinder"], ["torus", "\u53C2\u6570\u5706\u73AF", "Parametric torus"], ["text", "\u7ACB\u4F53\u6587\u5B57", "Custom text"], ["arc", "\u5706\u5F27", "Arc"], ["tube", "\u8DEF\u5F84\u7BA1\u9053", "Tube"], ["polygon", "\u591A\u8FB9\u5F62\u67F1", "Polygon"], ["spiral", "\u87BA\u65CB", "Spiral"], ["staircase", "\u53C2\u6570\u697C\u68AF", "Staircase"], ["chain", "\u9501\u94FE", "Chain"], ["beam", "\u5149\u675F", "Beam"], ["ribbon", "\u98D8\u5E26", "Ribbon"], ["waterSurface", "\u6C34\u9762", "Water surface"], ["energyBarrier", "\u80FD\u91CF\u5C4F\u969C", "Energy barrier"], ["gear", "\u9F7F\u8F6E", "Gear"], ["fan", "\u98CE\u6247", "Fan"], ["floatingIsland", "\u6D6E\u5C9B", "Floating island"], ["portal", "\u4F20\u9001\u95E8", "Portal"], ["hologram", "\u5168\u606F\u5C4F", "Hologram"], ["mountain", "\u5C71\u5CF0", "Mountain"]].map(([id, name, en]) => ({ id: "proc-" + id, name, en, category: "basic", size: [3, 3, 3] }));
function proceduralParts(id, p = {}) {
  if (!id.startsWith("proc-")) return null;
  const out = [], n = Math.round(Math.max(3, Math.min(64, p.segments || 24))), radius = Math.max(0.05, Math.min(5, p.radius || 0.4)), thickness = Math.max(5e-3, Math.min(1, p.thickness || 0.08)), color = typeof p.color === "string" ? p.color : void 0;
  const add = (shape, x, y, z, w, h, d, ry = 0) => out.push({ shape, x, y, z, w, h, d, ry, color });
  const kind = id.slice(5);
  if (kind === "text") {
    add("box", 0, 0.5, 0, 1, 1, 5e-3);
    return out;
  }
  if (kind === "polyhedron") {
    add("rock", 0, 0.5, 0, 1, 1, 1);
    return out;
  }
  if (kind === "hemisphere") {
    for (let i = 0; i < 12; i++) {
      const y = (i + 0.5) / 12, r = Math.sqrt(1 - y * y);
      add("cylinder", 0, y * 0.5, 0, r, 1 / 24, r);
    }
    return out;
  }
  if (kind === "staircase") {
    const steps = Math.round(Math.max(1, Math.min(64, p.steps || 12)));
    for (let i = 0; i < steps; i++) add("box", 0, (i + 1) / steps * 0.5, -0.5 + (i + 0.5) / steps, 1, (i + 1) / steps, 1 / steps);
    return out;
  }
  if (kind === "chain") {
    for (let i = 0; i < Math.min(64, n); i++) add("torus", 0, i / n, 0, thickness * 3, 1.5 / n, thickness * 3, i % 2 ? Math.PI / 2 : 0);
    return out;
  }
  if (kind === "beam" || kind === "ribbon" || kind === "energyBarrier" || kind === "hologram" || kind === "waterSurface") {
    add("box", 0, 0.5, 0, 1, kind === "waterSurface" ? 0.02 : 1, kind === "beam" ? thickness : 0.02);
    return out;
  }
  if (kind === "mountain" || kind === "floatingIsland") {
    add(kind === "mountain" ? "cone" : "rock", 0, 0.5, 0, 1, 1, 1);
    return out;
  }
  if (kind === "portal") {
    add("torus", 0, 0.5, 0, 1, 1, 0.12);
    add("cylinder", 0, 0.04, 0, 1, 0.08, 1);
    return out;
  }
  const turns = Math.max(1, Math.min(10, p.turns || 3)), angle = (p.angle || 270) * Math.PI / 180;
  for (let i = 0; i < n; i++) {
    const a = (kind === "arc" ? angle : kind === "spiral" ? turns * Math.PI * 2 : Math.PI * 2) * i / n, b = (kind === "arc" ? angle : kind === "spiral" ? turns * Math.PI * 2 : Math.PI * 2) * (i + 1) / n;
    if (kind === "hollowCylinder") {
      add("box", Math.cos(a) * radius, 0.5, Math.sin(a) * radius, thickness, 1, Math.PI * 2 * radius / n + thickness, -a);
      continue;
    }
    if (kind === "gear" || kind === "fan") {
      add("box", Math.cos(a) * radius, 0.5, Math.sin(a) * radius, kind === "gear" ? thickness : radius, 0.12, thickness, -a);
      continue;
    }
    const y = kind === "spiral" ? i / n : 0.5, x = Math.cos(a) * radius, z = Math.sin(a) * radius, dx = Math.cos(b) * radius - x, dz = Math.sin(b) * radius - z;
    add("box", x + dx / 2, y, z + dz / 2, thickness, thickness, Math.hypot(dx, dz) + thickness, Math.atan2(dx, dz));
  }
  return out;
}
export {
  PROCEDURAL_MODELS,
  proceduralParts
};
