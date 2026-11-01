// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { traceMirrorLight } from "./ancient-optics.js";
const DUNGEON_MIRRORS = [{ id: "lens-a", x: -4, z: 25 }, { id: "lens-b", x: -4, z: 48 }, { id: "lens-c", x: 6, z: 48 }];
const DUNGEON_LIGHT_SOURCE = { x: -18, z: 25 }, DUNGEON_RECEIVER = { x: 6, z: 57 };
const DUNGEON_CONTROLS = [...DUNGEON_MIRRORS.map((m) => ({ ...m, stage: 0, type: "mirror" })), ...[0, 1, 2].map((i) => ({ id: "rune-" + i, x: -6 + i * 6, z: 96, stage: 1, type: "rune" })), { id: "trap-lever", x: -18, z: 80, stage: 1, type: "lever" }, ...[0, 1].map((i) => ({ id: "weight-" + i, x: i ? 17 : -17, z: 135, stage: 2, type: "weight" }))];
function dungeonLight(s) {
  return traceMirrorLight(s.angles, DUNGEON_MIRRORS, DUNGEON_LIGHT_SOURCE, DUNGEON_RECEIVER, { minX: -22, maxX: 22, minZ: 5, maxZ: 60 });
}
function newDungeonMechanisms(seed) {
  const n = seed >>> 0, s = { version: 1, angles: { "lens-a": n % 4, "lens-b": (n >>> 2) % 4, "lens-c": (n >>> 4) % 4 }, runes: 0, order: [n % 3, (n + 1) % 3, (n + 2) % 3, n % 3], weights: [0, 0], targets: [1 + n % 2, 1 + (n >>> 2) % 2], solved: [false, false, false], revision: 0, lastAt: 0, wrongAt: 0, trapUntil: 0, leverReady: 0 };
  if (dungeonLight(s).solved) s.angles["lens-a"] = (s.angles["lens-a"] + 1) % 4;
  return s;
}
function weightPosition(index, slot) {
  return { x: (index ? 6 : -14) + slot * 4, z: 140 };
}
function dungeonMechanismSolids(s) {
  return s ? [{ ...DUNGEON_LIGHT_SOURCE, w: 2.5, d: 2, h: 3 }, { ...DUNGEON_RECEIVER, w: 2, d: 1.2, h: 3 }, { x: -18, z: 80, w: 1.8, d: 1.8, h: 1.2 }, ...[-4.8, 4.8].map((x) => ({ x, z: 84, w: 0.3, d: 0.6, h: 2.4 })), ...[-17, 17].map((x) => ({ x, z: 135, w: 1.6, d: 1.6, h: 1.8 })), ...DUNGEON_MIRRORS.map((m) => ({ ...m, w: 2.3, d: 2.3, h: 4 })), ...[0, 1, 2].map((i) => ({ x: -6 + i * 6, z: 96, w: 1.4, d: 1.4, h: 2 })), ...[0, 1].map((i) => ({ ...weightPosition(i, s.weights[i]), w: 2.2, d: 2.2, h: 2.5 }))] : [];
}
function useDungeonMechanism(s, stage, id, player, now, occupied = () => false) {
  const control = DUNGEON_CONTROLS.find((c) => c.id === id && c.stage === stage);
  if (!control || !Number.isFinite(player.x + player.y + player.z) || Math.hypot(player.x - control.x, player.z - control.z) > 4 || player.y > 5 || now - s.lastAt < 280) return false;
  if (control.type === "lever") {
    if (now < s.leverReady) return false;
    s.trapUntil = now + 8e3;
    s.leverReady = now + 12e3;
  } else {
    if (s.solved[stage]) return false;
    if (control.type === "mirror") {
      s.angles[id] = (s.angles[id] + 1) % 4;
      s.solved[0] = dungeonLight(s).solved;
    } else if (control.type === "rune") {
      const value = Number(id.slice(-1));
      if (value === s.order[s.runes]) s.runes++;
      else {
        s.runes = 0;
        s.wrongAt = now;
      }
      s.solved[1] = s.runes === s.order.length;
    } else {
      const i = Number(id.slice(-1)), slot = (s.weights[i] + 1) % 3, p = weightPosition(i, slot);
      if (occupied(p.x, p.z)) return false;
      s.weights[i] = slot;
      s.solved[2] = s.weights.every((v, j) => v === s.targets[j]);
    }
  }
  s.lastAt = now;
  s.revision++;
  return true;
}
function dungeonPuzzleGate(run, enemies) {
  if (!run.mechanisms || run.ascensionJob) return enemies && run.stage < 2 ? run.stage * 60 + 62 : 189;
  return run.stage < 2 ? enemies || !run.mechanisms.solved[run.stage] ? run.stage * 60 + 62 : 189 : run.mechanisms.solved[2] ? 189 : 162;
}
export {
  DUNGEON_CONTROLS,
  DUNGEON_LIGHT_SOURCE,
  DUNGEON_MIRRORS,
  DUNGEON_RECEIVER,
  dungeonLight,
  dungeonMechanismSolids,
  dungeonPuzzleGate,
  newDungeonMechanisms,
  useDungeonMechanism,
  weightPosition
};
