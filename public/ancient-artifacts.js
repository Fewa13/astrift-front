// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const ARTIFACTS = {
  elements: { zh: "\u5143\u7D20\u4E4B\u5FC3", en: "Heart of Elements", level: 180, targets: ["crystal_fire", "crystal_water", "crystal_wood", "crystal_metal", "crystal_earth"], job: "elementalist", color: "#ffbf65" },
  void: { zh: "\u865A\u7A7A\u65AD\u5203", en: "Blade of the Void", level: 200, targets: ["emptyking", "starbound_heart", "sky_sovereign"], job: "voidsword", color: "#c086ff" },
  abyss: { zh: "\u6DF1\u6E0A\u4E4B\u5FC3", en: "Abyssal Heart", level: 200, targets: ["blight_lord", "immaculate_judge", "furnace_regent"], job: "abyssal", color: "#ff577c" },
  hourglass: { zh: "\u6C38\u6052\u6C99\u6F0F", en: "Eternal Hourglass", level: 220, targets: ["hourglass_regent", "thunder_warden", "frost_crowned"], job: "chrono", color: "#67e9ed" },
  crown: { zh: "\u4E0D\u673D\u738B\u51A0", en: "Immortal Crown", level: 240, targets: ["buried_marshal", "sky_sovereign", "frost_crowned"], job: "", color: "#ffe491" },
  origin: { zh: "\u8D77\u6E90", en: "The Origin", level: 300, targets: ["hourglass_regent", "starbound_heart", "sky_sovereign"], job: "", color: "#fff7d6" },
  divinity: { zh: "\u7834\u788E\u795E\u683C", en: "Shattered Divinity", level: 280, targets: ["hourglass_regent", "buried_marshal", "sky_sovereign", "starbound_heart", "furnace_regent"], job: "", color: "#f8ace9" }
};
const ARTIFACT_STAGES = [["\u6C89\u7761", "Dormant"], ["\u89C9\u9192", "Awakened"], ["\u8D85\u8D8A", "Transcendent"], ["\u795E\u5316", "Divine"]];
function artifactStage(p) {
  return p.artifactEquipped ? p.artifacts?.[p.artifactEquipped]?.stage || 0 : 0;
}
function recordArtifactVictory(p, kind, share) {
  if (share < 0.35) return;
  for (const [key, spec] of Object.entries(ARTIFACTS)) {
    if (p.level < spec.level || !spec.targets.includes(kind) || !artifactClueFound(p, key)) continue;
    const id = key;
    const record = (p.artifacts ??= {})[id] ??= { stage: 0, marks: {} };
    if (record.stage > 0) continue;
    record.marks[kind] = Math.min(artifactRequirement(record.stage), (record.marks[kind] || 0) + 1);
  }
}
function artifactRequirement(stage) {
  return stage === 0 ? 3 : 0;
}
function originEligible(p) {
  return Object.keys(ARTIFACTS).filter((id) => id !== "origin").every((id) => p.artifacts?.[id]?.stage === 4) && Object.values(p.mastery || {}).filter((skill) => skill.level >= 20).length >= 4 && Object.values(p.secrets || {}).filter((value) => value === 2).length >= 3;
}
function completeArtifactTrial(p, id, expectedStage) {
  const spec = Object.hasOwn(ARTIFACTS, id) ? ARTIFACTS[id] : null, record = spec && p.artifacts?.[id];
  if (!spec || !record || record.stage !== expectedStage || !canStartArtifactTrial(p, id)) return false;
  record.stage++;
  record.marks = {};
  return true;
}
const ARTIFACT_ROUTES = {
  elements: { clue: "forest", mastery: 10, minutes: 12, guardian: "crystal_earth", final: "crystal_fire" },
  void: { clue: "starfall", mastery: 12, minutes: 10, guardian: "emptyking", final: "starbound_heart" },
  abyss: { clue: "blight", mastery: 12, minutes: 12, guardian: "blight_lord", final: "furnace_regent" },
  hourglass: { clue: "dunes", mastery: 15, minutes: 5, guardian: "hourglass_regent", final: "thunder_warden" },
  crown: { clue: "frostcourt", mastery: 15, minutes: 12, guardian: "frost_crowned", final: "buried_marshal" },
  divinity: { clue: "skyreach", mastery: 20, minutes: 9, guardian: "sky_sovereign", final: "starbound_heart" },
  origin: { clue: "sanctum", mastery: 20, minutes: 8, guardian: "hourglass_regent", final: "starbound_heart" }
};
function artifactClueFound(p, id) {
  return p.secrets?.[ARTIFACT_ROUTES[id].clue] === 2 && (id !== "origin" || originEligible(p));
}
function canStartArtifactTrial(p, id) {
  if (!Object.hasOwn(ARTIFACTS, id) || !artifactClueFound(p, id)) return false;
  const spec = ARTIFACTS[id], record = p.artifacts?.[id], stage = record?.stage || 0;
  return p.level >= spec.level && stage < 4 && (stage > 0 || (record?.trail || 0) >= ARTIFACT_TRAILS[id].length) && Object.values(p.mastery || {}).some((skill) => skill.level >= ARTIFACT_ROUTES[id].mastery + stage * 5) && spec.targets.every((kind) => (record?.marks[kind] || 0) >= artifactRequirement(stage));
}
const ARTIFACT_COMBAT = {
  survivalCooldown: 18e4,
  crownWeakness: 6e3,
  crownDamageScale: 0.75,
  voidRiftRadius: 6,
  voidRiftTicks: 3,
  voidRiftInterval: 700,
  voidRiftDamage: 0.42,
  chronoAnchorExtension: 2e3,
  chronoEchoMultiplier: 1.3,
  abyssHealingDuration: 5e3,
  abyssHealingMultiplier: 1.12
};
const ARTIFACT_TRAILS = {
  elements: [[9, 0], [-7, 9], [3, 15]],
  void: [[0, -12], [12, 4]],
  abyss: [[-12, -4], [0, 13], [13, -2]],
  hourglass: [[0, 14], [11, 10], [-11, 7]],
  crown: [[-10, 13], [10, 13], [0, -15]],
  divinity: [[14, -6], [-14, -7], [0, 17]],
  origin: [[0, -9], [13, 0], [0, 15], [-13, 0]]
};
function artifactTrailPoint(id, index, origin, safe) {
  const offset = ARTIFACT_TRAILS[id][index];
  if (!offset) return null;
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;
    const x = origin.x + offset[0] * Math.cos(angle) - offset[1] * Math.sin(angle);
    const z = origin.z + offset[0] * Math.sin(angle) + offset[1] * Math.cos(angle);
    if (safe(x, z)) return { x, z };
  }
  return null;
}
export {
  ARTIFACTS,
  ARTIFACT_COMBAT,
  ARTIFACT_ROUTES,
  ARTIFACT_STAGES,
  ARTIFACT_TRAILS,
  artifactClueFound,
  artifactRequirement,
  artifactStage,
  artifactTrailPoint,
  canStartArtifactTrial,
  completeArtifactTrial,
  recordArtifactVictory
};
