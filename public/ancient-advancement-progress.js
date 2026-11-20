// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { ADVANCED_PROFESSIONS } from "./ancient-advanced-professions.js";
import { isHoly } from "./ancient-ascension.js";
import { masteryLevel, masteryCost } from "./ancient-mastery.js";
import { isFusionJob, PROFESSIONS, SKILLS } from "./ancient-skills.js";
function advancementRoute(profile, profession = profile.profession || "") {
  const progress = profile.advancements?.[profession];
  return ADVANCED_PROFESSIONS[profession]?.find((route) => route.id === progress?.route);
}
function chooseAdvancement(profile, routeId) {
  const profession = profile.profession || "";
  const route = ADVANCED_PROFESSIONS[profession]?.find((candidate) => candidate.id === routeId);
  if (isFusionJob(profession) || !route || !isHoly(profile) || profile.consumedJobs?.[profession]) return false;
  const fused = isFusionJob(profession);
  if (fused && !profile.fusedJobs?.[profession]) return false;
  const records = profile.advancements ??= {};
  if (records[profession]?.route) return records[profession].route === routeId;
  const skills = {};
  const oldSkills = PROFESSIONS[profession].skills;
  for (const key of "XQZC") {
    const old = oldSkills.find((id) => SKILLS[id].key === key);
    const inherited = old && fused ? profile.mastery?.[old] : void 0;
    const level = old ? fused ? masteryLevel(profile, old) : profile.skills?.[old] || 1 : 1;
    const retained = records[profession]?.skills[key];
    const rank = Math.max(level, retained?.level || 1);
    const points = retained ? Math.max(
      retained.level === rank ? retained.points : 0,
      fused && level === rank ? Math.floor((inherited?.points || 0) * advancementCost(rank) / masteryCost(old, rank)) : 0
    ) : inherited?.points || 0;
    skills[key] = { level: rank, points };
  }
  records[profession] = { route: routeId, skills };
  return true;
}
function rollbackAdvancement(profile) {
  const job = profile.profession || "", progress = profile.advancements?.[job];
  if (!progress?.route || !advancementRoute(profile)) return "\u5F53\u524D\u804C\u4E1A\u672A\u9009\u62E9\u5347\u534E\u5206\u652F / No advancement branch selected";
  for (const id of PROFESSIONS[job].skills) {
    const trained = progress.skills[SKILLS[id].key];
    if (!trained) continue;
    if (isFusionJob(job)) {
      const saved = (profile.mastery ??= {})[id];
      if (!saved || saved.level <= trained.level) {
        const points = Math.floor(trained.points * masteryCost(id, trained.level) / advancementCost(trained.level));
        profile.mastery[id] = { level: trained.level, points: Math.max(saved?.level === trained.level ? saved.points : 0, points) };
      }
    } else {
      profile.skills ??= {};
      profile.skills[id] = Math.max(profile.skills[id] || 0, trained.level);
    }
  }
  progress.route = "";
  return null;
}
function advancementCost(level) {
  return Math.ceil((25 + level * level * 12) * 1.2);
}
function awardAdvancementMastery(profile, routeId, key, points) {
  if (!Number.isSafeInteger(points) || points <= 0 || !/^[XQZC]$/.test(key)) return false;
  const profession = profile.profession || "";
  const progress = profile.advancements?.[profession];
  if (!progress || progress.route !== routeId || !advancementRoute(profile)) return false;
  const skill = progress.skills[key];
  if (!skill || skill.level >= 100) return false;
  const before = skill.level;
  skill.points += points;
  while (skill.level < 100 && skill.points >= advancementCost(skill.level)) {
    skill.points -= advancementCost(skill.level++);
  }
  if (skill.level >= 100) skill.points = 0;
  return skill.level > before;
}
function retireFusionAdvancements(profile) {
  let changed = false;
  for (const [job, progress] of Object.entries(profile.advancements || {})) {
    if (!isFusionJob(job)) continue;
    if (progress.route) {
      for (const id of PROFESSIONS[job].skills) {
        const trained = progress.skills?.[SKILLS[id].key];
        if (!trained || !Number.isSafeInteger(trained.level) || trained.level < 1 || trained.level > 100) continue;
        const saved = profile.mastery?.[id];
        const points = trained.level >= 100 ? 0 : Math.floor(Math.max(0, Number.isFinite(trained.points) ? trained.points : 0) * masteryCost(id, trained.level) / advancementCost(trained.level));
        if (!saved || saved.level < trained.level) (profile.mastery ??= {})[id] = { level: trained.level, points };
        else if (saved.level === trained.level) saved.points = Math.max(saved.points, points);
      }
    }
    delete profile.advancements[job];
    changed = true;
  }
  return changed;
}
export {
  advancementCost,
  advancementRoute,
  awardAdvancementMastery,
  chooseAdvancement,
  retireFusionAdvancements,
  rollbackAdvancement
};
