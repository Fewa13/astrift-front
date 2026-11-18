// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { isFusionJob, PROFESSIONS, SKILLS } from "./ancient-skills.js";
import { masteryLevel } from "./ancient-mastery.js";
const FUSION_SCROLLS = {
  ignitionBasic: { name: "\u521D\u7EA7\u6280\u80FD\u5377\u8F74", en: "Basic Skill Scroll", price: 5e3, odds: [0.5, 0.2, 0.05] },
  ignitionIntermediate: { name: "\u4E2D\u7EA7\u6280\u80FD\u5377\u8F74", en: "Intermediate Skill Scroll", price: 3e4, odds: [0.8, 0.5, 0.3] },
  ignitionAdvanced: { name: "\u9AD8\u7EA7\u6280\u80FD\u5377\u8F74", en: "Advanced Skill Scroll", price: 2e5, odds: [1, 0.9, 0.7] }
};
const FUSION_PASSIVE_REQUIREMENTS = [5, 8, 12];
const FUSION_PASSIVES = {
  necromancer: [
    ["\u81EA\u52A8\u586B\u5145", "Auto-Raise", "\u7F13\u6162\u8865\u5145\u9AB7\u9AC5\u50A8\u5907\uFF0C\u5347\u7EA7\u52A0\u5FEB\u8865\u5145\u901F\u5EA6\u3002", "Refills the reserve over time. Levels shorten the interval."],
    ["\u4F24\u5BB3\u8F6C\u79FB", "Damage Transfer", "\u4F24\u5BB3\u9664\u4EE5\u88AB\u52A8\u7B49\u7EA7\uFF0C\u5269\u4F59\u4F24\u5BB3\u768480%\u7531\u5B58\u6D3B\u9AB7\u9AC5\u5206\u62C5\u3002", "Divides damage by passive level and shares 80% of the remainder with living skeletons."],
    ["\u4E0D\u6B7B\u4E4B\u8EAB", "Deathless", "\u9AB7\u9AC5\u53EF\u590D\u6D3B\u4E00\u6B21\u3002\u73A9\u5BB6\u81F4\u547D\u4F24\u65F6\u590D\u6D3B\uFF0C\u89E6\u53D1\u671F\u95F4\u9AB7\u9AC5\u590D\u6D3B\u6682\u505C\u3002", "Skeletons revive once. A lethal hit revives you, and skeleton revivals pause during your cooldown."]
  ],
  elementalist: [
    ["\u5143\u7D20\u5171\u632F", "Elemental Resonance", "\u505C\u6B62\u65BD\u6CD5\u540E\u84C4\u79EF\u5143\u7D20\u4E4B\u529B\u3002\u4E0B\u4E00\u6B21\u795E\u7F5A\u6D88\u8017\u50A8\u80FD\uFF0C\u4E3A\u6240\u6709\u547D\u4E2D\u76EE\u6807\u5FC5\u5B9A\u9644\u52A0\u51CF\u76CA\uFF0C\u50A8\u80FD\u8D8A\u591A\u8D8A\u5F3A\u3002", "Build elemental power between casts. The next Divine Judgment spends it to apply guaranteed debuffs to all enemies hit."],
    ["\u5143\u7D20\u5BF9\u51B2", "Elemental Clash", "\u706B\u4E0E\u51B0\u5728\u540C\u4E00\u76EE\u6807\u76F8\u9047\u65F6\u5F15\u53D1\u8303\u56F4\u7206\u70B8\u3002", "Fire and ice together trigger a powerful area explosion."],
    ["\u4E07\u8C61\u5171\u9E23", "Prismatic Convergence", "\u5927\u5E45\u5F3A\u5316\u653B\u51FB\uFF0C\u5BF9\u524A\u5F31\u76EE\u6807\u989D\u5916\u589E\u4F24\u3002", "Greatly amplifies attacks, with an extra bonus against weakened enemies."]
  ],
  voidsword: [
    ["\u865A\u7A7A\u950B\u5203", "Void Edge", "\u865A\u7A7A\u65A9\u6709\u6982\u7387\u76F4\u63A5\u5F15\u7206\uFF0C\u5347\u7EA7\u63D0\u9AD8\u6982\u7387\u3002", "Void Slash can detonate immediately. Levels raise the chance."],
    ["\u88C2\u9699\u62A4\u4F53", "Rift Guard", "\u964D\u4F4E\u53D7\u5230\u7684\u4F24\u5BB3\u3002\u5728\u865A\u7A7A\u9886\u57DF\u5185\u6BCF\u7EA7\u989D\u5916\u51CF\u4F24 1%\uFF0C\u989D\u5916\u51CF\u4F24\u6700\u591A 30%\u3002", "Reduces damage taken. Inside your void domain, gain another 1% reduction per level, up to 30%."],
    ["\u754C\u5916\u7EDD\u65A9", "Beyond the Rift", "\u5927\u5E45\u5F3A\u5316\u653B\u51FB\uFF0C\u7EC8\u7ED3\u6280\u83B7\u5F97\u66F4\u9AD8\u589E\u5E45\u3002", "Greatly amplifies attacks, with a larger bonus on finishers."]
  ],
  abyssal: [
    ["\u8840\u8680", "Blood Corrosion", "\u8840\u91CF\u8D8A\u4F4E\uFF0C\u6280\u80FD\u4F24\u5BB3\u8D8A\u9AD8\u3002", "Skill damage rises as health falls."],
    ["\u6DF1\u6E0A\u8840\u7532", "Abyssal Carapace", "\u964D\u4F4E\u53D7\u5230\u7684\u4F24\u5BB3\uFF0C\u751F\u547D\u8D8A\u4F4E\u6548\u679C\u8D8A\u5F3A\u3002", "Reduces incoming damage more as your health falls."],
    ["\u6DF1\u6E0A\u9965\u6E34", "Abyssal Hunger", "\u5927\u5E45\u5F3A\u5316\u5168\u90E8\u653B\u51FB\uFF0C\u4F4E\u8840\u65F6\u6548\u679C\u66F4\u5F3A\u3002", "Greatly amplifies all attacks, especially at low health."]
  ],
  chrono: [
    ["\u65F6\u5E8F\u52A0\u901F", "Temporal Acceleration", "\u6210\u529F\u56DE\u6EAF\u540E\u5237\u65B0\u5176\u4ED6\u65F6\u7A7A\u6280\u80FD\u3002\u653B\u51FB\u6982\u7387\u9644\u52A0 4 \u79D2\u65F6\u95F4\u6DF7\u4E71\uFF0C\u4F7F\u76EE\u6807\u53D7\u4F24 +15%\u3001\u653B\u51FB \u221215%\u3002\u518D\u6B21\u89E6\u53D1\u4F1A\u989D\u5916\u9020\u6210 250% \u672C\u6B21\u4F24\u5BB3\uFF0C\u5E76\u51CF\u901F 45% \u6301\u7EED 3 \u79D2\u3002", "Rewind refreshes your other Chrono Walker skills. Hits may inflict 4 seconds of Temporal Disorder: 15% more damage taken and 15% less attack. A second proc deals 250% bonus hit damage and slows by 45% for 3 seconds."],
    ["\u65F6\u95F4\u7F13\u51B2", "Time Buffer", "\u964D\u4F4E\u53D7\u5230\u7684\u4F24\u5BB3\uFF0C\u8DC3\u8FC1\u6216\u56DE\u6EAF\u540E\u77ED\u6682\u52A0\u5F3A\u3002", "Reduces damage taken, with stronger protection briefly after shifting or rewinding."],
    ["\u65F6\u95F4\u53E0\u5C42", "Temporal Overlap", "\u5927\u5E45\u5F3A\u5316\u653B\u51FB\uFF0C\u5BF9\u51CF\u901F\u76EE\u6807\u989D\u5916\u589E\u4F24\u3002", "Greatly amplifies attacks, with an extra bonus against slowed foes."]
  ]
};
const TEMPORAL_DISORDER = {
  duration: 4e3,
  vulnerability: 0.15,
  weakness: 0.15,
  explosion: 2.5,
  slow: 0.45,
  slowDuration: 3e3,
  chance: (level) => Math.min(0.5, 0.18 + 5e-3 * (level - 1))
};
const voidDomainExtraReduction = (level) => Math.min(0.3, level * 0.01);
const passiveCost = (level, job, index) => (12 + level * level * 6) * (job === "necromancer" && index === 0 ? 2 : 1);
const passiveLevel = (p, index) => p.fusionPassives?.[p.profession || ""]?.[index]?.level || 0;
function ignitionEligible(p, index) {
  const job = p.profession || "", required = FUSION_PASSIVE_REQUIREMENTS[index];
  if (!required || !isFusionJob(job) || !p.fusedJobs?.[job] || passiveLevel(p, index)) return false;
  const advanced = p.advancements?.[job];
  return PROFESSIONS[job].skills.every((id) => id === "unleashLegion" || (advanced?.skills[SKILLS[id].key]?.level ?? masteryLevel(p, id)) >= required) && FUSION_PASSIVE_REQUIREMENTS.slice(0, index).every((_, i) => passiveLevel(p, i) >= required);
}
function igniteFusionPassive(p, index, scroll, random = Math.random) {
  if (!ignitionEligible(p, index) || !Object.hasOwn(FUSION_SCROLLS, scroll)) return { error: "\u5C1A\u672A\u6EE1\u8DB3\u70B9\u4EAE\u6761\u4EF6 / Ignition requirements not met" };
  const key = "supply:" + scroll;
  if (!(p.materials[key] > 0)) return { error: "\u6280\u80FD\u5377\u8F74\u4E0D\u8DB3 / Skill scroll required" };
  p.materials[key]--;
  const ignited = random() < FUSION_SCROLLS[scroll].odds[index];
  if (ignited) {
    const slots = (p.fusionPassives ??= {})[p.profession] ??= {};
    slots[index] = { level: 1, points: 0 };
  }
  return { ignited };
}
function trainFusionPassive(p, index, points) {
  const progress = p.fusionPassives?.[p.profession || ""]?.[index];
  if (!progress || points <= 0 || progress.level >= 100) return false;
  const before = progress.level;
  progress.points += points;
  while (progress.level < 100 && progress.points >= passiveCost(progress.level, p.profession, index)) progress.points -= passiveCost(progress.level++);
  if (progress.level === 100) progress.points = 0;
  return progress.level > before;
}
export {
  FUSION_PASSIVES,
  FUSION_PASSIVE_REQUIREMENTS,
  FUSION_SCROLLS,
  TEMPORAL_DISORDER,
  igniteFusionPassive,
  ignitionEligible,
  passiveCost,
  passiveLevel,
  trainFusionPassive,
  voidDomainExtraReduction
};
