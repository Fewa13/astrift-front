// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
function rankDelta(won, deaths) {
  return won ? 300 + 100 * (10 - Math.max(0, Math.min(10, Math.floor(deaths)))) : -300;
}
function seasonStepCost(nextLevel) {
  const step = Math.max(0, Math.floor(nextLevel) - 2);
  return Math.round(1500 + 40 * Math.sqrt(step) + 18 * step);
}
function seasonLevel(earned) {
  const total = Math.max(0, Math.floor(earned));
  let level = 1, spent = 0;
  while (level < 1e4 && spent + seasonStepCost(level + 1) <= total) {
    level++;
    spent += seasonStepCost(level);
  }
  const title = level <= 10 ? "\u9752\u94DC" : level <= 20 ? "\u767D\u94F6" : level <= 30 ? "\u9EC4\u91D1" : level <= 40 ? "\u94BB\u77F3" : level <= 50 ? "\u4F20\u8BF4" : level <= 60 ? "\u795E\u8BDD" : level <= 70 ? "\u8D85\u51E1" : level <= 80 ? "\u6218\u795E" : `\u5DC5\u5CF0${level - 80}\u9636`;
  return { level, title, progress: total - spent, next: seasonStepCost(level + 1), earned: total };
}
function rankedAiProfile(level, roll) {
  const chance = Math.max(0, Math.min(99, Math.floor(roll)));
  if (level <= 10) return chance < 90 ? "advancedPlus" : "master";
  if (level <= 20) return chance < 80 ? "advancedPlus" : "master";
  if (level <= 30) return chance < 50 ? "advancedPlus" : "masterLow";
  if (level <= 40) return chance < 30 ? "advancedPlus" : chance < 70 ? "masterLow" : "masterMid";
  if (level <= 50) return chance < 50 ? "masterLow" : "masterMid";
  if (level <= 60) return chance < 30 ? "masterLow" : chance < 90 ? "masterMid" : "masterHigh";
  if (level <= 70) return chance < 80 ? "masterHigh" : "masterMid";
  if (level <= 80) return chance < 70 ? "masterHigh" : "masterTop";
  return "masterTop";
}
export {
  rankDelta,
  rankedAiProfile,
  seasonLevel,
  seasonStepCost
};
