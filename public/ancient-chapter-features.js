// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { chapterPoint, chapterSafe } from "./ancient-geography.js";
const at = (map, x, u) => {
  const p = chapterPoint(map, x, u);
  return chapterSafe(map, p.x, p.z);
};
const CHAPTER_FEATURES = [
  { id: "tide-drain", map: "starfall", name: ["\u5F00\u542F\u6F6E\u6C50\u6392\u6C34\u9600", "Open the tidal drain"], ...at("starfall", -12, 105), kind: "drain" },
  { id: "court-thermal", map: "frostcourt", name: ["\u5207\u6362\u51B0\u706B\u56DE\u8DEF", "Switch the thermal circuit"], x: 0, z: 150, kind: "thermal" },
  ...[[55, 85], [150, 185], [250, 285]].flatMap(([a, b], i) => [{ id: "wind-" + i, map: "skyreach", name: ["\u4E58\u4E0A\u5347\u6C14\u6D41", "Ride the updraft"], ...at("skyreach", 0, a), kind: "wind", to: at("skyreach", 0, b) }, { id: "wind-back-" + i, map: "skyreach", name: ["\u4E58\u56DE\u6D41\u98CE\u9053", "Ride the return current"], ...at("skyreach", 0, b), kind: "wind", to: at("skyreach", 0, a) }]),
  ...[[-12, 225], [12, 245], [0, 270]].map(([x, u], i) => ({ id: "sun-" + i, map: "dunes", name: [["\u6821\u51C6\u9ECE\u660E\u5F71\u9488", "\u6821\u51C6\u6B63\u5348\u5F71\u9488", "\u6821\u51C6\u9EC4\u660F\u5F71\u9488"][i], ["Align Dawn Gnomon", "Align Noon Gnomon", "Align Dusk Gnomon"][i]], ...at("dunes", x, u), kind: "dial", index: i }))
];
const DIAL_TARGETS = [1, 3, 2];
function useChapterFeature(state, f, quest = false) {
  if (f.kind === "drain") state.drained = true;
  if (f.kind === "thermal") state.phase = 1 - (state.phase || 0);
  if (f.kind === "dial" && !state.solved) {
    const values = state.dials || [0, 0, 0];
    values[f.index] = quest ? DIAL_TARGETS[f.index] : ((values[f.index] || 0) + 1) % 4;
    state.dials = values;
    state.solved = values.every((v, i) => v === DIAL_TARGETS[i]);
  }
  return state;
}
function questChapterFeature(map, npc) {
  return CHAPTER_FEATURES.find((f) => f.map === map && (npc === "starrecordseal" && f.kind === "drain" || npc === "courtrepairseal" && f.kind === "thermal" || ["dunesun1seal", "dunesun2seal", "dunesun3seal"][f.index ?? -1] === npc && f.kind === "dial"));
}
export {
  CHAPTER_FEATURES,
  DIAL_TARGETS,
  questChapterFeature,
  useChapterFeature
};
