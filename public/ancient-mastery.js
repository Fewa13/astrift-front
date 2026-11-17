// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const FUSION_DAMAGE_MULTIPLIER = 2.8;
const growth = {
  raiseSkeleton: 0.055,
  consumeSoul: 0.04,
  necropolis: 0.04,
  prism: 0.045,
  judgment: 0.035,
  erosion: 0.06,
  siphon: 0.05,
  voidslash: 0.05,
  riftassault: 0.045,
  voiddomain: 0.03,
  execution: 0.032,
  abysstouch: 0.045,
  devour: 0.05,
  descent: 0.037,
  avatar: 0.03,
  temporalrift: 0.045,
  chronoshift: 0.04,
  rewind: 0.025,
  stasis: 0.022
};
const masteryLevel = (p, id) => p.mastery?.[id]?.level || 1;
const masteryCost = (id, level) => Math.ceil((25 + level * level * 12) * (1 + (growth[id] || 0) * 4));
const masteryPower = (p, id) => 1 + (growth[id] || 0) * Math.min(99, masteryLevel(p, id) - 1);
function masteryReward(player, monster, boss, elite) {
  const difference = monster - player;
  if (difference < -Math.max(8, Math.ceil(player * 0.15))) return 0;
  const points = difference < -3 ? 1 : difference <= 3 ? 4 : Math.min(10, 5 + Math.floor(difference / 4));
  return points * (boss ? 8 : elite ? 3 : 1);
}
function awardMastery(p, id, points) {
  if (!growth[id] || points <= 0) return false;
  const record = (p.mastery ??= {})[id] ??= { level: 1, points: 0 };
  const before = record.level;
  record.points += points;
  while (record.level < 100 && record.points >= masteryCost(id, record.level)) {
    record.points -= masteryCost(id, record.level++);
  }
  if (record.level >= 100) record.points = 0;
  return record.level > before;
}
export {
  FUSION_DAMAGE_MULTIPLIER,
  awardMastery,
  masteryCost,
  masteryLevel,
  masteryPower,
  masteryReward
};
