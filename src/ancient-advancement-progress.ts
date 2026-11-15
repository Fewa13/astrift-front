// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {ADVANCED_PROFESSIONS} from './ancient-advanced-professions';
import {isHoly} from './ancient-ascension';
import {masteryLevel} from './ancient-mastery';
import type {AncientProfile} from './ancient-rules';
import {isFusionJob, PROFESSIONS, SKILLS} from './ancient-skills';

export type AdvancementProgress = {
 route: string;
 skills: Record<string, {level: number; points: number}>;
};

export function advancementRoute(profile: AncientProfile, profession = profile.profession || '') {
 const progress = profile.advancements?.[profession];
 return ADVANCED_PROFESSIONS[profession]?.find(route => route.id === progress?.route);
}

export function chooseAdvancement(profile: AncientProfile, routeId: string) {
 const profession = profile.profession || '';
 const route = ADVANCED_PROFESSIONS[profession]?.find(candidate => candidate.id === routeId);
 if (!route || !isHoly(profile) || profile.consumedJobs?.[profession]) return false;
 const fused = isFusionJob(profession);
 if (fused && !profile.fusedJobs?.[profession]) return false;
 const records = profile.advancements ??= {};
 if (records[profession]) return records[profession].route === routeId;

 const skills: AdvancementProgress['skills'] = {};
 const oldSkills = PROFESSIONS[profession].skills;
 for (const key of 'XQZC') {
  const old = oldSkills.find(id => SKILLS[id].key === key);
  const inherited = old && fused ? profile.mastery?.[old] : undefined;
  const level = old ? (fused ? masteryLevel(profile, old) : profile.skills?.[old] || 1) : 1;
  skills[key] = {level, points: inherited?.points || 0};
 }
 records[profession] = {route: routeId, skills};
 return true;
}

export function advancementCost(level: number) {
 return Math.ceil((25 + level * level * 12) * 1.2);
}

export function awardAdvancementMastery(profile: AncientProfile, routeId: string, key: string, points: number) {
 if (!Number.isSafeInteger(points) || points <= 0 || !/^[XQZC]$/.test(key)) return false;
 const profession = profile.profession || '';
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
