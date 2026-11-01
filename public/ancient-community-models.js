// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { communityCatalogParts } from "./ancient-community-catalog.js";
function communityModelParts(model) {
  if (model === "__npc") {
    const parts = [];
    const p = (shape, color, x, y, z, w, h, d) => parts.push({ shape, color, x, y, z, w, h, d, ry: 0 });
    p("cone", "#55776a", 0, 0.95, 0, 0.65, 1.25, 0.5);
    p("sphere", "#d2ad83", 0, 1.76, 0, 0.42, 0.46, 0.4);
    p("cylinder", "#4a3f32", 0, 1.98, 0, 0.46, 0.14, 0.45);
    p("box", "#a98d59", 0, 1.15, -0.27, 0.42, 0.12, 0.07);
    p("box", "#c9b788", 0, 1.16, -0.32, 0.1, 0.1, 0.04);
    p("box", "#8a745b", 0, 1.5, -0.22, 0.12, 0.16, 0.09);
    for (const side of [-1, 1]) {
      p("cylinder", "#55776a", side * 0.34, 1.12, 0, 0.16, 0.65, 0.16);
      p("cylinder", "#bcb490", side * 0.34, 0.84, 0, 0.18, 0.09, 0.18);
      p("sphere", "#d2ad83", side * 0.34, 0.74, -0.02, 0.17, 0.2, 0.17);
      p("cylinder", "#45493c", side * 0.16, 0.32, 0, 0.18, 0.48, 0.2);
      p("box", "#483f34", side * 0.16, 0.1, -0.08, 0.23, 0.2, 0.36);
      p("sphere", "#2a2926", side * 0.085, 1.8, -0.19, 0.035, 0.04, 0.025);
      p("box", "#d1c6a1", side * 0.13, 1.46, -0.22, 0.07, 0.12, 0.035);
    }
    for (let i = 0; i < 4; i++) p("sphere", "#bbad79", 0, 1.36 - i * 0.11, -0.26, 0.035, 0.035, 0.035);
    p("cylinder", "#755b3e", 0.55, 1.12, 0, 0.055, 2.2, 0.055);
    p("rock", "#8cb5a2", 0.55, 2.22, 0, 0.15, 0.22, 0.15);
    return parts;
  }
  const catalog = communityCatalogParts(model);
  if (catalog) return catalog;
  const out = [], add = (shape, x, y, z, w, h, d, color, ry = 0) => out.push({ shape, x, y, z, w, h, d, color, ry });
  if (["box", "sphere", "cylinder", "cone", "wedge", "torus"].includes(model)) {
    add(model, 0, 0.5, 0, 1, 1, 1);
    return out;
  }
  if (model === "mirror") {
    add("box", 0, 0.5, 0, 0.9, 1, 0.09, "#9ae9f3");
    add("box", -0.48, 0.5, 0, 0.07, 1.1, 0.15, "#b79e67");
    add("box", 0.48, 0.5, 0, 0.07, 1.1, 0.15, "#b79e67");
    add("box", 0, 1.02, 0, 1, 0.07, 0.15, "#b79e67");
    add("box", 0, 0.03, 0, 1, 0.07, 0.15, "#b79e67");
    return out;
  }
  const [f, n] = model.split("-"), v = Number(n), a = v % 5 / 5, b = Math.floor((v - 1) / 5) % 4, edition = Math.floor((v - 1) / 20), stone = ["#6e7773", "#8a8173", "#596b6c", "#9d9d87"][b], wood = ["#6a4d33", "#86623e", "#513f32", "#a28154"][b], leaf = ["#47794b", "#5e8852", "#74904b", "#396c60"][b];
  if (f === "rocks" || f === "cliffs") {
    for (let i = 0; i < 5 + b * 2; i++) {
      const t = i * 2.399 + v;
      add("rock", Math.sin(t) * 0.26, 0.18 + i * 0.055, Math.cos(t) * 0.2, 0.45 + a * 0.2, 0.35 + (f === "cliffs" ? 0.35 : 0), 0.4, stone, t);
    }
    for (let i = 0; i < 3; i++) add("box", -0.24 + i * 0.19, 0.17 + i * 0.18, 0.28, 0.24, 0.025, 0.11, "#435c41", 0.3);
  } else if (f === "trees") {
    add("cylinder", 0, 0.4, 0, 0.13, 0.8, 0.13, wood);
    for (let i = 0; i < 5; i++) {
      const t = i * 1.8 + v;
      add("cylinder", Math.sin(t) * 0.13, 0.48 + i * 0.045, Math.cos(t) * 0.13, 0.045, 0.35, 0.045, wood, t);
      add(b % 2 ? "cone" : "rock", Math.sin(t) * 0.2, 0.63 + i * 0.07, Math.cos(t) * 0.2, 0.55 + a * 0.2, 0.35, 0.5, leaf, t);
    }
    for (let i = 0; i < 4; i++) add("rock", Math.sin(i * 1.57) * 0.12, 0.025, Math.cos(i * 1.57) * 0.12, 0.22, 0.06, 0.12, wood);
  } else if (f === "shrubs" || f === "flowers") {
    for (let i = 0; i < 7 + b; i++) {
      const t = i * 2.4 + v, x = Math.sin(t) * 0.35, z = Math.cos(t) * 0.3;
      add("cylinder", x, 0.2, z, 0.025, 0.35, 0.025, leaf);
      add("rock", x, 0.37 + a * 0.2, z, f === "flowers" ? 0.16 : 0.35, 0.14, 0.2, f === "flowers" ? ["#e7a5bb", "#dec574", "#b6aad5", "#dfe9dc"][b] : leaf, t);
    }
  } else if (f === "pillars" || f === "ruins") {
    add("cylinder", 0, 0.45, 0, 0.45, 0.8, 0.45, stone);
    for (let i = 0; i < 4 + b; i++) add("cylinder", 0, 0.08 + i * 0.17, 0, 0.52, 0.04, 0.52, "#a09a7c");
    add("box", 0, 0.93, 0, 0.7, 0.14, 0.7, stone);
    for (let i = 0; i < 4; i++) add("box", Math.sin(i * 1.57) * 0.23, 0.45, Math.cos(i * 1.57) * 0.23, 0.055, 0.6, 0.055, "#394b43");
    if (f === "ruins") for (let i = 0; i < 4; i++) add("rock", Math.sin(i + v) * 0.34, 0.06, Math.cos(i + v) * 0.3, 0.2, 0.12, 0.23, stone, i);
  } else if (f === "arches") {
    for (const x of [-0.4, 0.4]) {
      add("box", x, 0.4, 0, 0.2, 0.8, 0.5, stone);
      for (let i = 0; i < 4; i++) add("box", x, 0.1 + i * 0.2, 0.26, 0.23, 0.035, 0.04, "#b0a68d");
    }
    for (let i = 0; i < 7; i++) {
      const t = i * Math.PI / 6;
      add("box", Math.cos(t) * 0.4, 0.75 + Math.sin(t) * 0.24, 0, 0.18, 0.17, 0.5, stone, t);
    }
  } else if (f === "walls") {
    for (let y = 0; y < 5; y++) for (let x = 0; x < 4; x++) add("box", (x - 1.5) * 0.25 + (y % 2 ? 0.06 : 0), 0.1 + y * 0.2, 0, 0.24, 0.19, 0.6, stone);
    for (let i = 0; i < 4; i++) add("rock", Math.sin(i + v) * 0.38, 0.07, 0.32, 0.2, 0.1, 0.2, "#506849");
  } else if (f === "fences") {
    for (const x of [-0.44, 0, 0.44]) {
      add("cylinder", x, 0.5, 0, 0.08, 1, 0.08, wood);
      add("cone", x, 1.02, 0, 0.1, 0.1, 0.1, wood);
    }
    for (const y of [0.3, 0.65]) add("box", 0, y, 0, 1, 0.06, 0.08, wood);
  } else if (f === "crystals") {
    for (let i = 0; i < 6; i++) {
      const t = i * 2.4 + v;
      add("cone", Math.sin(t) * 0.23, 0.4 + i % 3 * 0.1, Math.cos(t) * 0.23, 0.18, 0.65, 0.18, ["#78bec9", "#bd8acb", "#9bbf80", "#d9b36b"][b], t);
      add("rock", Math.sin(t) * 0.3, 0.07, Math.cos(t) * 0.3, 0.3, 0.1, 0.25, stone);
    }
  } else if (f === "lanterns") {
    add("cylinder", 0, 0.33, 0, 0.06, 0.65, 0.06, wood);
    add("box", 0, 0.75, 0, 0.4, 0.4, 0.4, "#f4d58d");
    add("cone", 0, 1.02, 0, 0.6, 0.2, 0.6, wood);
    for (const x of [-0.21, 0.21]) for (const z of [-0.21, 0.21]) add("cylinder", x, 0.75, z, 0.025, 0.48, 0.025, wood);
    add("box", 0, 0.51, 0, 0.5, 0.05, 0.5, wood);
  } else if (f === "statues") {
    add("box", 0, 0.07, 0, 0.7, 0.14, 0.7, stone);
    add("cone", 0, 0.5, 0, 0.45, 0.7, 0.45, stone);
    add("sphere", 0, 0.9, 0, 0.25, 0.25, 0.25, stone);
    for (const x of [-0.23, 0.23]) add("cylinder", x, 0.6, 0, 0.1, 0.5, 0.1, stone);
    add("torus", 0, 0.94, -0.01, 0.5, 0.5, 0.12, "#b8aa72");
  } else if (f === "camp") {
    add("cone", 0, 0.45, 0, 1, 0.9, 0.9, ["#a69774", "#867c65", "#a09083", "#6d887a"][b]);
    for (let i = 0; i < 5; i++) add("cylinder", -0.4 + i * 0.2, 0.04, 0.42, 0.07, 0.1, 0.15, wood);
    add("box", 0, 0.25, 0.44, 0.25, 0.5, 0.02, "#403d36");
    add("cylinder", 0, 0.96, 0, 0.04, 0.2, 0.04, wood);
  } else if (f === "bridges") {
    for (let i = 0; i < 10; i++) add("box", 0, 0.12, -0.45 + i * 0.1, 0.95, 0.08, 0.09, wood);
    for (const x of [-0.46, 0.46]) {
      add("box", x, 0.06, 0, 0.08, 0.12, 1, wood);
      for (const z of [-0.45, 0, 0.45]) add("cylinder", x, 0.4, z, 0.06, 0.6, 0.06, wood);
      add("box", x, 0.65, 0, 0.06, 0.05, 1, wood);
    }
  }
  if (edition) {
    if (f === "rocks" || f === "cliffs") {
      for (let i = 0; i < 6; i++) add("cone", Math.sin(i * 2.4 + v) * 0.28, 0.3 + i * 0.06, Math.cos(i * 2.4 + v) * 0.25, 0.1, 0.3, 0.1, "#9cae9f", i);
    } else if (f === "trees") {
      for (let i = 0; i < 5; i++) {
        const t = i * 1.7 + v;
        add("cylinder", Math.sin(t) * 0.28, 0.53 + i * 0.045, Math.cos(t) * 0.28, 0.055, 0.55, 0.055, wood, t);
        add("rock", Math.sin(t) * 0.4, 0.81 + i * 0.04, Math.cos(t) * 0.4, 0.4, 0.22, 0.4, leaf, t);
      }
    } else if (f === "shrubs" || f === "flowers") {
      for (let i = 0; i < 5; i++) add("rock", Math.sin(i * 1.3) * 0.4, 0.06, Math.cos(i * 1.3) * 0.4, 0.16, 0.12, 0.19, stone, i);
    } else if (f === "walls" || f === "ruins") {
      for (let i = 0; i < 5; i++) add("box", -0.4 + i * 0.2, 1.05, 0, 0.15, 0.2, 0.65, stone);
      for (let i = 0; i < 3; i++) add("rock", -0.3 + i * 0.3, 0.1, 0.36, 0.25, 0.14, 0.2, stone, i);
    } else if (f === "bridges") {
      for (const x of [-0.48, 0.48]) for (const z of [-0.45, 0.45]) {
        add("rock", x, 0.1, z, 0.24, 0.18, 0.24, stone);
        add("sphere", x, 0.75, z, 0.15, 0.15, 0.15, "#b6ab83");
      }
    } else if (f === "arches" || f === "pillars") {
      add("torus", 0, 0.8, 0.3, 0.55, 0.55, 0.05, "#b1a17d");
      for (let i = 0; i < 5; i++) add("box", -0.3 + i * 0.15, 0.92, 0.29, 0.05, 0.06, 0.04, "#c9bb8f");
    } else if (f === "statues") {
      for (let i = 0; i < 7; i++) {
        const t = i * Math.PI / 6;
        add("cone", Math.cos(t) * 0.27, 0.9 + Math.sin(t) * 0.27, 0, 0.09, 0.25, 0.09, "#b6a778", t);
      }
    } else if (f === "crystals") {
      for (let i = 0; i < 8; i++) add("rock", Math.sin(i) * 0.4, 0.05, Math.cos(i) * 0.4, 0.16, 0.1, 0.16, stone);
      add("torus", 0, 0.32, 0, 0.7, 0.7, 0.08, "#acbdb1");
    } else if (f === "camp") {
      for (const x of [-0.45, 0.45]) add("cylinder", x, 0.45, 0.5, 0.05, 0.9, 0.05, wood);
      add("box", 0, 0.88, 0.5, 1, 0.06, 0.6, "#bcae89");
    } else if (f === "lanterns") {
      add("torus", 0, 1.15, 0, 0.25, 0.25, 0.07, wood);
      for (const x of [-0.2, 0.2]) add("box", x, 0.75, 0.22, 0.025, 0.38, 0.03, wood);
    } else if (f === "fences") {
      for (let i = 0; i < 5; i++) add("box", -0.4 + i * 0.2, 0.48, 0, 0.04, 0.8, 0.1, wood);
      add("box", 0, 0.92, 0, 1, 0.06, 0.12, wood);
    }
  }
  return out;
}
function communityModelBounds(model, w = 1, h = 1, d = 1, rotation = 0) {
  const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity };
  for (const p of communityModelParts(model)) {
    const r = -rotation + p.ry, c = Math.cos(r), s = Math.sin(r), dx = p.x * w, dz = p.z * d, x = Math.cos(rotation) * dx - Math.sin(rotation) * dz, z = Math.sin(rotation) * dx + Math.cos(rotation) * dz, halfX = p.w * w * (p.shape === "torus" ? 0.48 : 0.5), halfZ = p.d * d * (p.shape === "torus" ? 0.1 : 0.5), ex = Math.abs(c) * halfX + Math.abs(s) * halfZ, ez = Math.abs(s) * halfX + Math.abs(c) * halfZ, ey = p.h * h * (p.shape === "torus" ? 0.48 : 0.5);
    bounds.minX = Math.min(bounds.minX, x - ex);
    bounds.maxX = Math.max(bounds.maxX, x + ex);
    bounds.minY = Math.min(bounds.minY, p.y * h - ey);
    bounds.maxY = Math.max(bounds.maxY, p.y * h + ey);
    bounds.minZ = Math.min(bounds.minZ, z - ez);
    bounds.maxZ = Math.max(bounds.maxZ, z + ez);
  }
  return bounds;
}
function communitySurfacePlacement(model, point, w = 3, h = 3, d = 3, rotation = 0) {
  const b = communityModelBounds(model, w, h, d, rotation), n = point.normal || { x: 0, y: 1, z: 0 }, radius = (b.maxX - b.minX) / 2 * Math.abs(n.x) + (b.maxY - b.minY) / 2 * Math.abs(n.y) + (b.maxZ - b.minZ) / 2 * Math.abs(n.z) + 4e-3;
  return { x: point.x - (b.minX + b.maxX) / 2 + n.x * radius, y: Math.max(0, point.y - (b.minY + b.maxY) / 2 + n.y * radius), z: point.z - (b.minZ + b.maxZ) / 2 + n.z * radius };
}
function communityFlightStep(position, forward, side, vertical, yaw, pitch, speed, dt) {
  const step = Math.max(0, Math.min(0.05, dt)) * speed;
  return { x: position.x + (-Math.sin(yaw) * forward + Math.cos(yaw) * side) * step, y: Math.max(0.25, Math.min(600, position.y + vertical * step)), z: position.z + (-Math.cos(yaw) * forward - Math.sin(yaw) * side) * step };
}
function communityAssemblyBounds(parts) {
  const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity };
  for (const p of parts) {
    const b = communityModelBounds(p.model, p.w, p.h, p.d, p.rotation);
    for (const [min, max, offset] of [["minX", "maxX", p.x], ["minY", "maxY", p.y], ["minZ", "maxZ", p.z]]) {
      bounds[min] = Math.min(bounds[min], b[min] + offset);
      bounds[max] = Math.max(bounds[max], b[max] + offset);
    }
  }
  return bounds;
}
function communityAssemblyPlacement(parts, point) {
  if (!parts.length) return [];
  const b = communityAssemblyBounds(parts), n = point.normal || { x: 0, y: 1, z: 0 }, radius = (b.maxX - b.minX) / 2 * Math.abs(n.x) + (b.maxY - b.minY) / 2 * Math.abs(n.y) + (b.maxZ - b.minZ) / 2 * Math.abs(n.z) + 4e-3, offset = { x: point.x - (b.minX + b.maxX) / 2 + n.x * radius, y: point.y - (b.minY + b.maxY) / 2 + n.y * radius, z: point.z - (b.minZ + b.maxZ) / 2 + n.z * radius }, minBase = Math.min(...parts.map((p) => p.y + offset.y));
  if (minBase < 0) offset.y -= minBase;
  return parts.map((p) => ({ ...p, x: p.x + offset.x, y: p.y + offset.y, z: p.z + offset.z }));
}
function communitySnapRotation(angle, free = false) {
  const target = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
  return !free && Math.abs(angle - target) <= Math.PI / 18 + 1e-9 ? target : angle;
}
function communityFacingPlacement(parts, point, player) {
  const rawYaw = Math.atan2(point.x - player.x, player.z - point.z), yaw = communitySnapRotation(rawYaw, player.freeRotation), c = Math.cos(yaw), s = Math.sin(yaw), b = communityAssemblyBounds(parts), cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
  return communityAssemblyPlacement(parts.map((p) => ({ ...p, x: c * (p.x - cx) - s * (p.z - cz), z: s * (p.x - cx) + c * (p.z - cz), rotation: p.rotation + yaw })), point);
}
export {
  communityAssemblyBounds,
  communityAssemblyPlacement,
  communityFacingPlacement,
  communityFlightStep,
  communityModelBounds,
  communityModelParts,
  communitySnapRotation,
  communitySurfacePlacement
};
