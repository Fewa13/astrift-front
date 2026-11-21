// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { skillDirectMultiplier, isFusionJob } from "./ancient-skills.js";
import { holyPower } from "./ancient-ascension.js";
import { advancementRoute } from "./ancient-advancement-progress.js";
import { FUSION_DAMAGE_SCALE, fusionDamageMultiplier, masteryPower } from "./ancient-mastery.js";
const MELEE_BASIC_SKILL_FLOOR = 0.2;
const basics = { warrior: "slash", swordsman: "swordwave", shadowblade: "riftblade", stonewright: "stonefist", summoner: "soulbolt", ice: "frostburst", fire: "firebolt", lightning: "chain", curse: "hex" };
const ADVANCEMENT_BASIC_REFERENCES = {
  berserker: { key: "X", multiplier: 9 },
  paladin: { key: "X", multiplier: 3.8, holy: true },
  stormcaller: { key: "X", multiplier: 6.8, holy: true },
  voltstalker: { key: "X", multiplier: 3.9 },
  crystalist: { key: "X", multiplier: 3.7 * 1.15 },
  winterwarden: { key: "X", multiplier: 4.1 },
  wildfire: { key: "X", multiplier: 3.8, holy: true },
  hellfire: { key: "X", multiplier: 3.25, holy: true },
  hexweaver: { key: "X", multiplier: 3.6 },
  pactbinder: { key: "X", multiplier: 3.8 },
  blademaster: { key: "Q", multiplier: 1.1 },
  linebreaker: { key: "X", multiplier: 4 },
  shadowhunter: { key: "X", multiplier: 4 },
  boundarycutter: { key: "X", multiplier: 4.2, holy: true },
  mountainguard: { key: "X", multiplier: 4.8 },
  veinforger: { key: "Q", multiplier: 3.8, holy: true }
};
const fusionBasics = { elementalist: { id: "prism", multiplier: 4.2 }, voidsword: { id: "voidslash", multiplier: 10 }, abyssal: { id: "abysstouch", multiplier: 3.6 }, chrono: { id: "temporalrift", multiplier: 8 } };
function meleeBasicSkillReference(p) {
  const job = p.profession || "", route = advancementRoute(p), advanced = route && ADVANCEMENT_BASIC_REFERENCES[route.id];
  if (advanced) {
    const level2 = p.advancements?.[job]?.skills[advanced.key]?.level || 1;
    return { id: "advancement:" + route.id + ":" + advanced.key, multiplier: advanced.multiplier * (1 + Math.min(99, level2 - 1) * 0.055) * (advanced.holy ? holyPower(p) : 1) };
  }
  const fused = fusionBasics[job];
  if (fused && p.fusedJobs?.[job]) {
    const second = job === "abyssal" ? p.fusionPassives?.[job]?.[0]?.level || 0 : 0;
    return { id: fused.id, multiplier: fused.multiplier * holyPower(p) * fusionDamageMultiplier(job) * masteryPower(p, fused.id) * (second ? 1 + 0.24 + 0.42 + second * 0.012 : 1) };
  }
  const id = basics[job], level = p.skills?.[id] || 0;
  if (!id || !level) return;
  return { id, multiplier: skillDirectMultiplier(id, level) * holyPower(p) };
}
function meleeBasicSkillFloor(p, skillBase) {
  const reference = meleeBasicSkillReference(p);
  return reference ? Math.ceil(Math.ceil(skillBase * reference.multiplier * MELEE_BASIC_SKILL_FLOOR) / (isFusionJob(p.profession || "") ? FUSION_DAMAGE_SCALE : 1)) : 0;
}
export {
  ADVANCEMENT_BASIC_REFERENCES,
  MELEE_BASIC_SKILL_FLOOR,
  meleeBasicSkillFloor,
  meleeBasicSkillReference
};
