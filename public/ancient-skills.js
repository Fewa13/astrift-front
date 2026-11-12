// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { bossFormStats } from "./ancient-boss-cards.js";
const PROFESSIONS = {
  shadowblade: { name: "\u5F71\u5203\u884C\u8005", en: "Shadowblade", icon: "\u25C8", skills: ["shadowstep", "shadowreturn", "nightfall", "riftblade"] },
  stonewright: { name: "\u5CA9\u94F8\u5E08", en: "Stonewright", icon: "\u2B1F", skills: ["faultline", "stoneprison", "mountainfall", "stonefist"] },
  swordsman: { name: "\u5251\u672F\u5E08", en: "Swordmaster", icon: "\u2694", skills: ["triplecut", "swordrain", "phantomblade", "swordwave"] },
  warrior: { name: "\u6218\u58EB", en: "Warrior", icon: "\u2694", skills: ["vitality", "power", "rage", "slash"] },
  summoner: { name: "\u53EC\u5524\u5E08", en: "Summoner", icon: "\u265C", skills: ["summon", "weaken", "transform", "soulbolt"] },
  ice: { name: "\u51B0\u96EA\u6CD5\u5E08", en: "Frost Mage", icon: "\u2744", skills: ["icebolt", "icearmor", "blizzard", "frostburst"] },
  fire: { name: "\u706B\u7130\u6CD5\u5E08", en: "Fire Mage", icon: "\u2739", skills: ["firewave", "firestorm", "inferno", "firebolt"] },
  lightning: { name: "\u96F7\u7535\u6CD5\u5E08", en: "Lightning Mage", icon: "\u03DF", skills: ["chain", "haste", "storm", "tempest"] },
  curse: { name: "\u8BC5\u5492\u6CD5\u5E08", en: "Curse Mage", icon: "\u263D", skills: ["hex", "drain", "doom"] }
};
const SKILLS = {
  firebolt: { job: "fire", name: "\u4F59\u70EC\u5F39", en: "Ember Bolt", unlock: 0, key: "X", duration: 5, cooldown: 5 },
  firewave: { job: "fire", name: "\u71CE\u539F\u706B\u6D6A", en: "Wildfire Wave", unlock: 0, key: "Q", duration: 6, cooldown: 9 },
  firestorm: { job: "fire", name: "\u7194\u706B\u6DA1\u6D41", en: "Molten Vortex", unlock: 5, key: "Z", duration: 8, cooldown: 18 },
  inferno: { job: "fire", name: "\u711A\u5929\u9668\u661F", en: "Solar Cataclysm", unlock: 20, key: "C", duration: 11, cooldown: 32 },
  tempest: { job: "lightning", name: "\u4E5D\u9704\u96F7\u7F5A", en: "Heavenfall Judgment", unlock: 25, key: "X", duration: 0, cooldown: 34 },
  riftblade: { job: "shadowblade", name: "\u88C2\u5F71\u5203", en: "Rift Blades", unlock: 0, key: "X", duration: 0, cooldown: 4 },
  shadowstep: { job: "shadowblade", name: "\u7A7F\u5F71", en: "Shadowstep", unlock: 0, key: "Q", duration: 0, cooldown: 7 },
  shadowreturn: { job: "shadowblade", name: "\u5F71\u8FD4", en: "Shadow Recall", unlock: 5, key: "Z", duration: 6, cooldown: 18 },
  nightfall: { job: "shadowblade", name: "\u591C\u5E55\u8FFD\u730E", en: "Nightfall Hunt", unlock: 20, key: "C", duration: 8, cooldown: 30 },
  stonefist: { job: "stonewright", name: "\u788E\u5CA9\u62F3", en: "Shatter Fist", unlock: 0, key: "X", duration: 0, cooldown: 5 },
  faultline: { job: "stonewright", name: "\u5730\u8109\u9707", en: "Faultline", unlock: 0, key: "Q", duration: 0, cooldown: 10 },
  stoneprison: { job: "stonewright", name: "\u5CA9\u7262", en: "Stone Prison", unlock: 5, key: "Z", duration: 3, cooldown: 18 },
  mountainfall: { job: "stonewright", name: "\u5C71\u5CB3\u5760", en: "Mountainfall", unlock: 20, key: "C", duration: 0, cooldown: 26 },
  frostburst: { job: "ice", name: "\u971C\u68F1\u8FF8\u5C04", en: "Frost Shard Volley", unlock: 0, key: "X", duration: 0, cooldown: 5 },
  swordwave: { job: "swordsman", name: "\u7FE0\u950B\u5251\u6C14", en: "Jade Sword Wave", unlock: 0, key: "X", duration: 0, cooldown: 5 },
  triplecut: { job: "swordsman", name: "\u78A7\u5F71\u4E09\u8FDE\u65A9", en: "Emerald Triple Slash", unlock: 0, key: "Q", duration: 0, cooldown: 9 },
  swordrain: { job: "swordsman", name: "\u9752\u7A79\u5251\u96E8", en: "Verdant Sword Rain", unlock: 5, key: "Z", duration: 3, cooldown: 18 },
  phantomblade: { job: "swordsman", name: "\u82CD\u7FE0\u5929\u5251", en: "Celestial Phantom Blade", unlock: 20, key: "C", duration: 0, cooldown: 24 },
  slash: { job: "warrior", name: "\u88C2\u5730\u65A9", en: "Sundering Slash", unlock: 0, key: "X", duration: 0, cooldown: 6 },
  soulbolt: { job: "summoner", name: "\u7075\u9B42\u5F39", en: "Soul Bolt", unlock: 0, key: "X", duration: 0, cooldown: 6 },
  vitality: { job: "warrior", name: "\u4F53\u8D28\u5F3A\u5316", en: "Vitality", unlock: 0, key: "Q", duration: 20, cooldown: 100 },
  power: { job: "warrior", name: "\u4F24\u5BB3\u5F3A\u5316", en: "Power", unlock: 5, key: "Z", duration: 20, cooldown: 100 },
  rage: { job: "warrior", name: "\u72C2\u66B4", en: "Berserk", unlock: 20, key: "C", duration: 20, cooldown: 80 },
  summon: { job: "summoner", name: "\u53EC\u5524", en: "Summon", unlock: 0, key: "Q", duration: 100, cooldown: 100 },
  weaken: { job: "summoner", name: "\u524A\u5F31", en: "Weaken", unlock: 5, key: "Z", duration: 0, cooldown: 12 },
  transform: { job: "summoner", name: "\u53D8\u8EAB", en: "Beast Form", unlock: 20, key: "C", duration: 60, cooldown: 120 },
  icebolt: { job: "ice", name: "\u5BD2\u51B0\u7BAD", en: "Ice Lance", unlock: 0, key: "Q", duration: 6, cooldown: 6 },
  icearmor: { job: "ice", name: "\u51B0\u6676\u62A4\u4F53", en: "Ice Ward", unlock: 5, key: "Z", duration: 15, cooldown: 50 },
  blizzard: { job: "ice", name: "\u66B4\u98CE\u96EA", en: "Blizzard", unlock: 20, key: "C", duration: 6, cooldown: 24 },
  chain: { job: "lightning", name: "\u8FDE\u9501\u95EA\u7535", en: "Chain Lightning", unlock: 0, key: "Q", duration: 0, cooldown: 7 },
  haste: { job: "lightning", name: "\u96F7\u9706\u75BE\u884C", en: "Thunderstride", unlock: 5, key: "Z", duration: 10, cooldown: 45 },
  storm: { job: "lightning", name: "\u96F7\u66B4", en: "Thunderstorm", unlock: 20, key: "C", duration: 4, cooldown: 24 },
  hex: { job: "curse", name: "\u8870\u5F31\u5370\u8BB0", en: "Frailty Hex", unlock: 0, key: "Q", duration: 10, cooldown: 8 },
  drain: { job: "curse", name: "\u751F\u547D\u6C72\u53D6", en: "Life Drain", unlock: 5, key: "Z", duration: 0, cooldown: 10 },
  doom: { job: "curse", name: "\u707E\u5384\u9886\u57DF", en: "Doom Field", unlock: 20, key: "C", duration: 8, cooldown: 28 }
};
const ELEMENTAL_IMPACTS = {
  firebolt: { hit: 0.75, growth: 0.07, burn: 0.42, burnGrowth: 0.04, seconds: 4 },
  firewave: { hit: 1, growth: 0.09, burn: 0.62, burnGrowth: 0.055, seconds: 5 },
  firestorm: { hit: 0.9, growth: 0.08, burn: 0.7, burnGrowth: 0.065, seconds: 7 },
  inferno: { hit: 1.8, growth: 0.15, burn: 1.05, burnGrowth: 0.09, seconds: 10 },
  tempest: { hit: 8, growth: 0.65, burn: 0, burnGrowth: 0, seconds: 0 }
};
function runtime(a) {
  return a.skillRuntime ??= { cooldowns: {}, effects: {}, mode: 1, lastAux: 0 };
}
function skillBook(id) {
  return "skillbook:" + id;
}
function skillBookName(key, english = false) {
  const id = key.slice(10);
  if (!key.startsWith("skillbook:") || !Object.hasOwn(SKILLS, id)) return null;
  const s = SKILLS[id];
  return (english ? PROFESSIONS[s.job].en : PROFESSIONS[s.job].name) + "-" + (english ? s.en : s.name) + (english ? " Skill Book" : "\u6280\u80FD\u4E66");
}
const targetedSkillRanges = new Map([
  ["slash", 12],
  ["triplecut", 15],
  ["drain", 20],
  ["riftblade", 20],
  ["stonefist", 20],
  ["faultline", 25],
  ["stoneprison", 25],
  ["mountainfall", 25],
  ...[...Object.keys(ELEMENTAL_IMPACTS), "frostburst", "swordwave", "swordrain", "phantomblade", "soulbolt", "icebolt", "blizzard", "chain", "storm", "hex", "doom"].map((id) => [id, 30])
]);
function skillCastRange(id, level) {
  const base = targetedSkillRanges.get(id);
  return base === void 0 ? 0 : Math.min(60, base + Math.max(0, level - 1) * 0.5);
}
function skillRadius(id, level, holy = false) {
  const base = { firewave: 4, firestorm: 6, inferno: 8, tempest: 8, riftblade: 2, shadowstep: 2, shadowreturn: 3, nightfall: 5, stonefist: 2, faultline: 4, stoneprison: 4, mountainfall: 6, frostburst: 2, slash: 4, power: 7, rage: 7, icearmor: 6, blizzard: 6, haste: 6, storm: 5, doom: 6, swordwave: 2, swordrain: 3, phantomblade: 5 };
  return base[id] === void 0 ? 0 : (base[id] + Math.max(0, level - 1) * 0.5) * (holy ? 1.5 : 1);
}
function curseHitMultiplier(id, level, hexed = false) {
  return id === "hex" ? (3.2 + 0.3 * level) * 1.2 : (4 + 0.4 * level) * (hexed ? 1.5 : 1);
}
function skillCooldown(id, level) {
  return id === "vitality" || id === "power" ? Math.max(50, 100 - level * 2) : SKILLS[id]?.cooldown || 0;
}
function ensureBasicSkills(p) {
  const id = p.profession === "fire" ? "firebolt" : p.profession === "shadowblade" ? "riftblade" : p.profession === "stonewright" ? "stonefist" : p.profession === "swordsman" ? "swordwave" : p.profession === "warrior" ? "slash" : p.profession === "summoner" ? "soulbolt" : p.profession === "ice" ? "frostburst" : null;
  if (!id || p.skills?.[id] !== void 0) return false;
  (p.skills ??= {})[id] = 1;
  return true;
}
function skillTrainingCost(current) {
  const next = current + 1;
  return { books: 2 ** current, cores: current > 0 ? next : 0, coins: current > 0 ? 50 * next ** 2 : 0 };
}
function trainSkill(p, id) {
  const s = Object.hasOwn(SKILLS, id) ? SKILLS[id] : void 0;
  if (!s || p.profession !== s.job) return "\u804C\u4E1A\u4E0D\u5339\u914D";
  if (p.level < s.unlock) return "\u73A9\u5BB6\u7B49\u7EA7\u4E0D\u8DB3";
  const next = (p.skills?.[id] || 0) + 1, cost = skillTrainingCost(next - 1);
  if (!Object.values(cost).every(Number.isSafeInteger)) return "\u6280\u80FD\u7B49\u7EA7\u5DF2\u8FBE\u4E0A\u9650";
  const key = skillBook(id);
  if ((p.materials[key] || 0) < cost.books) return "\u6280\u80FD\u4E66\u4E0D\u8DB3";
  if ((p.materials.core || 0) < cost.cores) return "\u76F8\u4F4D\u6838\u5FC3\u4E0D\u8DB3";
  if ((p.coins || 0) < cost.coins) return "\u8FDC\u53E4\u91D1\u5E01\u4E0D\u8DB3";
  p.materials[key] -= cost.books;
  if (cost.cores) p.materials.core -= cost.cores;
  if (cost.coins) p.coins = Math.round((p.coins - cost.coins) * 100) / 100;
  (p.skills ??= {})[id] = next;
  return null;
}
function skillDescription(id, n, en = false) {
  const level = Math.max(1, n), cd = skillCooldown(id, level), range = skillCastRange(id, level);
  const texts = {
    riftblade: [`${range}\u7C73\u88C2\u5F71\u53CC\u5203\uFF0C\u603B\u8BA1${300 + 25 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF1B\u51B7\u53744\u79D2\u3002\u81EA\u5E261\u7EA7\uFF0C\u6309X\u4F7F\u7528\u3002`, `${range}m twin rift blades: ${300 + 25 * level}% base attack damage in total. Cooldown 4s. Starts at level 1; press X.`],
    shadowstep: [`\u6CBF\u671D\u5411\u7A81\u8FDB\u6700\u591A10\u7C73\uFF0C\u6CBF\u9014\u654C\u4EBA\u5404\u53D7\u4E00\u6B21${260 + 22 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF1B\u4E0D\u80FD\u7A7F\u5899\uFF0C\u51B7\u53747\u79D2\u3002`, `Dash up to 10m forward; each enemy along the path takes ${260 + 22 * level}% base attack damage once. Cannot cross walls. Cooldown 7s.`],
    shadowreturn: [`\u7559\u4E0B6\u79D2\u6B8B\u5F71\u5E76\u5411\u540E\u95EA\u907F\u6700\u591A9\u7C73\uFF0C\u5468\u56F4\u9020\u6210${220 + 20 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF1B6\u79D2\u5185\u518D\u6B21\u6309Z\u6216\u5230\u671F\u81EA\u52A8\u8FD4\u56DE\uFF0C\u56DE\u62C9\u901F\u5EA6\u7FFB\u500D\uFF0C\u7EC8\u70B9\u65A9\u51FB\u4F24\u5BB3\u9AD810%\u3002\u5899\u4F53\u4F1A\u963B\u6321\u8FD4\u56DE\uFF1B\u51B7\u537418\u79D2\u3002`, `Leave a 6s afterimage and retreat up to 9m, dealing ${220 + 20 * level}% base attack damage nearby. Recast Z or wait 6s to return at double speed and slash for 10% more damage. Walls stop the return. Cooldown 18s.`],
    nightfall: [`\u5468\u56F4\u65A9\u51FB\u9020\u6210${400 + 35 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF1B8\u79D2\u5185\u4F24\u5BB3+25%\u3001\u79FB\u901F+30%\uFF0C\u4F7F\u7528\u7A7F\u5F71\u540E\u51B7\u5374\u964D\u4E3A3\u79D2\uFF1B\u51B7\u537430\u79D2\u3002`, `Nearby slashes deal ${400 + 35 * level}% base attack damage. For 8s: +25% damage, +30% speed, Shadowstep cooldown becomes 3s. Cooldown 30s.`],
    stonefist: [`${range}\u7C73\u788E\u5CA9\u91CD\u62F3\uFF0C\u9020\u6210${320 + 30 * level}%\u57FA\u7840\u653B\u51FB\u8303\u56F4\u4F24\u5BB3\uFF1B\u51B7\u53745\u79D2\u3002\u81EA\u5E261\u7EA7\uFF0C\u6309X\u4F7F\u7528\u3002`, `${range}m stone fist: ${320 + 30 * level}% base attack area damage. Cooldown 5s. Starts at level 1; press X.`],
    faultline: [`\u9501\u5B9A${range}\u7C73\u5185\u654C\u4EBA\uFF0C\u5730\u8109\u8FDE\u7EED\u7206\u53D13\u6B21\uFF0C\u6BCF\u6B21${180 + 15 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF1B\u51B7\u537410\u79D2\u3002`, `Lock an enemy within ${range}m: three ground eruptions, each ${180 + 15 * level}% base attack damage. Cooldown 10s.`],
    stoneprison: [`${range}\u7C73\u5CA9\u7262\u9020\u6210${300 + 30 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF0C\u51CF\u901F60%\u6301\u7EED3\u79D2\uFF08\u5934\u76EE\u51CF\u534A\uFF09\uFF1B3\u79D2\u540E\u574D\u584C\u518D\u9020\u6210${200 + 20 * level}%\u4F24\u5BB3\u3002\u5CA9\u67F1\u4E0D\u963B\u6321\u73A9\u5BB6\uFF1B\u51B7\u537418\u79D2\u3002`, `${range}m stone prison: ${300 + 30 * level}% base attack damage and 60% slow for 3s (half on bosses), then collapses for ${200 + 20 * level}%. Pillars do not block players. Cooldown 18s.`],
    mountainfall: [`\u9501\u5B9A${range}\u7C73\u5185\u654C\u4EBA\uFF0C\u5DE8\u5CA9\u624B\u81C2\u84C4\u52BF0.65\u79D2\u540E\u7838\u4E0B\uFF0C\u9020\u6210${700 + 60 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF0C\u968F\u540E3\u6B21\u88C2\u5730\u9707\u8361\u5404${80 + 6 * level}%\uFF1B\u51B7\u537426\u79D2\u3002`, `Lock an enemy within ${range}m: a colossal stone arm slams after 0.65s for ${700 + 60 * level}% base attack damage, followed by three fractures at ${80 + 6 * level}% each. Cooldown 26s.`],
    swordwave: [`${range}\u7C73\u5251\u6C14\uFF0C\u9020\u6210${300 + 25 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF1B\u51B7\u53745\u79D2\u3002\u8F6C\u804C\u540E\u81EA\u5E261\u7EA7\uFF0C\u6309X\u4F7F\u7528`, `${range}m sword wave: ${300 + 25 * level}% base attack damage. Cooldown 5s. Starts at level 1; press X.`],
    triplecut: [`\u9501\u5B9A${range}\u7C73\u5185\u654C\u4EBA\u8FDE\u65A93\u6B21\uFF0C\u9996\u5200${330 + 30 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF0C\u7B2C\u4E8C\u520050%\u3001\u7B2C\u4E09\u520025%\u9996\u5200\u4F24\u5BB3\uFF1B\u51B7\u53749\u79D2`, `Lock an enemy within ${range}m: three slashes. First: ${330 + 30 * level}% base attack damage; second: 50%, third: 25% of the first. Cooldown 9s.`],
    swordrain: [`\u9501\u5B9A${range}\u7C73\u5185\u654C\u4EBA\uFF0C3\u79D2\u5185\u843D\u4E0B6\u8F6E\u5251\u96E8\uFF0C\u6BCF\u8F6E${140 + 16 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF1B\u51B7\u537418\u79D2`, `Lock an enemy within ${range}m: six sword-rain strikes over 3s, each ${140 + 16 * level}% base attack damage. Cooldown 18s.`],
    phantomblade: [`\u9501\u5B9A${range}\u7C73\u5185\u654C\u4EBA\uFF0C\u5DE8\u5251\u6295\u5F71\u84C4\u52BF0.5\u79D2\u540E\u65A9\u4E0B\uFF0C\u9020\u6210${845 + 78 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF1B\u51B7\u537424\u79D2`, `Lock an enemy within ${range}m: a giant spectral sword strikes after 0.5s for ${845 + 78 * level}% base attack damage. Cooldown 24s.`],
    slash: [`${range}\u7C73\u88C2\u5730\u65A9\uFF0C\u76EE\u6807\u5468\u56F4${skillRadius("slash", level)}\u7C73\u9020\u6210${320 + 30 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF1B\u51B7\u53746\u79D2\u3002\u8F6C\u804C\u540E\u81EA\u5E261\u7EA7\uFF0C\u6309X\u4F7F\u7528`, `${range}m slash: ${320 + 30 * level}% base attack damage in a ${skillRadius("slash", level)}m area. Cooldown 6s. Starts at level 1; press X.`],
    soulbolt: [`${range}\u7C73\u7075\u9B42\u5F39\uFF0C\u9020\u6210${330 + 30 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF0C\u540C\u65F6\u6307\u6325\u53EC\u5524\u517D\u8FFD\u51FB\uFF1B\u51B7\u53746\u79D2\u3002\u8F6C\u804C\u540E\u81EA\u5E261\u7EA7\uFF0C\u6309X\u4F7F\u7528`, `${range}m soul bolt: ${330 + 30 * level}% base attack damage; marks the target for your beast. Cooldown 6s. Starts at level 1; press X.`],
    frostburst: [`${range}\u7C73\u971C\u68F1\u8FF8\u5C04\uFF0C\u9020\u6210${260 + 25 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF0C\u534A\u5F84${skillRadius("frostburst", level)}\u7C73\uFF1B\u51B7\u53745\u79D2\u3002\u81EA\u5E261\u7EA7\uFF0C\u6309X\u4F7F\u7528\u3002`, `${range}m shard volley: ${260 + 25 * level}% base attack damage in a ${skillRadius("frostburst", level)}m radius. Cooldown 5s. Starts at level 1; press X.`],
    vitality: [`20\u79D2\u5185\u8840\u91CF\u4E0A\u9650 +${3 * level}%\uFF0C\u6BCF\u79D2\u6062\u590D\u6700\u5927\u8840\u91CF ${level}%\uFF1B\u51B7\u5374 ${cd}\u79D2`, `20s: +${3 * level}% max HP, heal ${level}% max HP/s. Cooldown ${cd}s.`],
    power: [`\u91CA\u653E\u65F6${skillRadius("power", level)}\u7C73\u9707\u8361\uFF0C\u9020\u6210${300 + 30 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF1B20\u79D2\u5185\u4F24\u5BB3 +${2 * level}%\uFF1B\u51B7\u5374 ${cd}\u79D2`, `${skillRadius("power", level)}m shockwave: ${300 + 30 * level}% base attack damage. 20s: +${2 * level}% damage. Cooldown ${cd}s.`],
    rage: [`\u91CA\u653E\u65F6${skillRadius("rage", level)}\u7C73\u9707\u8361\uFF0C\u9020\u6210${400 + 40 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF1B20\u79D2\u5185\u53D7\u4F24 +100%\uFF0C\u4F24\u5BB3 +${30 * level}%\uFF0C\u901F\u5EA6 +${20 * level}%\uFF1B\u51B7\u537480\u79D2`, `${skillRadius("rage", level)}m shockwave: ${400 + 40 * level}% base attack damage. 20s: +100% incoming damage, +${30 * level}% damage, +${20 * level}% speed. Cooldown 80s.`],
    summon: [`\u94C1\u7532\u517D\u8840\u91CF\u548C\u653B\u51FB\u4E3A\u73A9\u5BB6\u57FA\u7840\u503C ${75 + 5 * level}%\uFF0C\u5728\u573A100\u79D2\u3002\u63091\u4E3B\u624B/2\u9501\u5B9A\u5370\u8BB0\uFF0C\u5C04\u4E2D\u602A\u7269\u6307\u6325\u94C1\u7532\u517D\u653B\u51FB\u3002\u6D88\u5931\u540E\u51B7\u5374100\u79D2`, `Armored Beast: ${75 + 5 * level}% base player HP and base attack damage, lasts 100s. 1 melee / 2 command sigil; hit a monster to mark it. Cooldown 100s after it disappears.`],
    weaken: [`\u524A\u5F31\u5370\u8BB0\u547D\u4E2D\uFF1A\u9020\u6210${280 + 30 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF0C\u653B\u51FB -${Math.min(80, 5 * level)}%\uFF0C\u6301\u7EED${level * 8}\u79D2\uFF0C\u51B7\u537412\u79D2\u3002\u63091\u4E3B\u624B/2\u524A\u5F31\u5370\u8BB0\uFF1B\u6709\u53EC\u5524\u517D\u65F6\u524A\u5F31\u5370\u8BB0\u4E3A3`, `Weakening sigil: ${280 + 30 * level}% base attack damage, -${Math.min(80, 5 * level)}% enemy damage for ${level * 8}s. Cooldown 12s. 1 melee / 2 weakening sigil (3 while beast is active).`],
    transform: [`60\u79D2\u517D\u5F62\u6001\uFF0C\u8840\u91CF\u4E0A\u9650 +${Math.min(100, 20 + 4 * level)}%\uFF0C\u722A\u4F24\u4E3A\u57FA\u7840\u653B\u51FB\u4F24\u5BB3 ${125 + 10 * level}%\uFF0C\u901F\u5EA6 +${Math.min(40, 10 + 2 * level)}%\uFF0C\u53D7\u4F24 -${Math.min(35, 10 + level)}%\u3002\u7981\u7528\u67AA\u68B0\uFF0C1\u4E3A\u722A\u5B50\uFF1B\u51B7\u5374120\u79D2`, `60s beast form: +${Math.min(100, 20 + 4 * level)}% max HP, claws ${125 + 10 * level}% base attack damage, +${Math.min(40, 10 + 2 * level)}% speed, -${Math.min(35, 10 + level)}% incoming damage. No firearms; 1 claws. Cooldown 120s.`],
    icebolt: [`${range}\u7C73\u5BD2\u51B0\u7BAD\uFF0C\u9020\u6210${300 + 30 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF0C\u51CF\u901F${Math.min(60, 20 + 2 * level)}%\u6301\u7EED6\u79D2\uFF0C\u51B7\u53746\u79D2`, `${range}m ice lance: ${300 + 30 * level}% base attack damage, ${Math.min(60, 20 + 2 * level)}% slow for 6s. Cooldown 6s.`],
    icearmor: [`\u91CA\u653E\u65F6${skillRadius("icearmor", level)}\u7C73\u51B0\u971C\u65B0\u661F\uFF0C\u9020\u6210${300 + 30 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF0C\u51CF\u901F35%\u6301\u7EED4\u79D2\uFF08\u5934\u76EE\u51CF\u534A\uFF09\uFF1B15\u79D2\u5185\u53D7\u4F24 -${Math.min(50, 15 + 2 * level)}%\uFF0C\u51B7\u537450\u79D2`, `${skillRadius("icearmor", level)}m frost nova: ${300 + 30 * level}% base attack damage, 35% slow for 4s (half on bosses). 15s: -${Math.min(50, 15 + 2 * level)}% incoming damage. Cooldown 50s.`],
    blizzard: [`${range}\u7C73\u76EE\u6807\u5468\u56F4${skillRadius("blizzard", level)}\u7C73\u66B4\u98CE\u96EA6\u79D2\uFF0C\u6BCF\u79D2${125 + 10 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF0C\u51CF\u901F${Math.min(60, 25 + level)}%\uFF08\u5934\u76EE\u51CF\u534A\uFF09\uFF1B\u51B7\u537424\u79D2`, `${range}m target: ${skillRadius("blizzard", level)}m blizzard for 6s, ${125 + 10 * level}% base attack damage/s, ${Math.min(60, 25 + level)}% slow (half on bosses). Cooldown 24s.`],
    chain: [`${range}\u7C73\u9996\u76EE\u6807\uFF0C\u8FDE\u9501\u6700\u591A${level + 2}\u4E2A\u76EE\u6807\u3001\u8FDE\u9501\u76F4\u5F84${16 + level - 1}\u7C73\uFF0C\u9996\u4E2A${300 + 30 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF0C\u540E\u7EED\u8DF3\u8DC3\u5404\u51CF25%\uFF1B\u51B7\u53747\u79D2`, `${range}m first target: up to ${level + 2} enemies, ${16 + level - 1}m chain diameter, ${300 + 30 * level}% base attack damage on the first, -25% each jump. Cooldown 7s.`],
    haste: [`\u5411\u524D\u7A81\u8FDB\u6700\u591A15\u7C73\uFF0C\u6CBF\u9014\u534A\u5F84${skillRadius("haste", level)}\u7C73\u5185\u6BCF\u4E2A\u602A\u7269\u53D7\u51FB\u4E00\u6B21\uFF0C\u9020\u6210${300 + 30 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF1B10\u79D2\u901F\u5EA6 +${Math.min(40, 15 + 2 * level)}%\uFF0C\u653B\u51FB\u95F4\u9694 -${Math.min(25, 8 + level)}%\uFF1B\u51B7\u537445\u79D2`, `Dash forward up to 15m; hit each enemy within ${skillRadius("haste", level)}m of the path once: ${300 + 30 * level}% base attack damage. 10s: +${Math.min(40, 15 + 2 * level)}% speed, -${Math.min(25, 8 + level)}% attack interval. Cooldown 45s.`],
    storm: [`${range}\u7C73\u76EE\u6807\u5468\u56F4${skillRadius("storm", level)}\u7C73\u96F7\u66B44\u79D2\uFF0C\u6BCF\u79D2${160 + 15 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF1B\u51B7\u537424\u79D2`, `${range}m target: ${skillRadius("storm", level)}m storm for 4s, ${160 + 15 * level}% base attack damage/s. Cooldown 24s.`],
    hex: [`${range}\u7C73\u76EE\u6807\u53D7\u5230${Math.round(curseHitMultiplier("hex", level) * 100)}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF1B10\u79D2\u653B\u51FB -${Math.min(40, 10 + 2 * level)}%\uFF0C\u53D7\u4F24 +${Math.min(30, 8 + level)}%\uFF1B\u51B7\u53748\u79D2`, `${range}m hex: ${Math.round(curseHitMultiplier("hex", level) * 100)}% base attack damage; -${Math.min(40, 10 + 2 * level)}% enemy damage, +${Math.min(30, 8 + level)}% damage taken for 10s. Cooldown 8s.`],
    drain: [`${range}\u7C73\u6C72\u53D6\uFF0C\u9020\u6210${400 + 40 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF0C\u76EE\u6807\u5E26\u6709\u8870\u5F31\u5370\u8BB0\u65F6\u4F24\u5BB3\u989D\u5916+50%\uFF0C\u56DE\u590D\u5B9E\u9645\u4F24\u5BB330%\uFF08\u6700\u591A\u6700\u5927\u8840\u91CF20%\uFF09\uFF1B\u51B7\u537410\u79D2`, `${range}m drain: ${400 + 40 * level}% base attack damage, +50% damage against a target with an active Frailty Hex; heal 30% actual damage (max 20% max HP). Cooldown 10s.`],
    doom: [`${range}\u7C73\u76EE\u6807\u5468\u56F4${skillRadius("doom", level)}\u7C73\u9886\u57DF8\u79D2\uFF0C\u6BCF\u79D2${80 + 8 * level}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF0C\u653B\u51FB -${Math.min(40, 10 + level)}%\uFF1B\u51B7\u537428\u79D2`, `${range}m target: ${skillRadius("doom", level)}m field for 8s, ${80 + 8 * level}% base attack damage/s, -${Math.min(40, 10 + level)}% enemy damage. Cooldown 28s.`]
  };
  const impact = ELEMENTAL_IMPACTS[id], hit = impact && Math.round((impact.hit + impact.growth * level) * 100), burn = impact && Math.round((impact.burn + impact.burnGrowth * level) * 100);
  const text = impact ? en ? `Hit: ${hit}% base attack. ${range}m targeting. Cooldown ${cd}s.` + (impact.seconds ? ` ${id === "firebolt" ? "Burns the target" : "Burns enemies in the area"} for ${impact.seconds}s at ${burn}% per second, even after the cast ends.` : "") : `\u547D\u4E2D\u9020\u6210${hit}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF0C\u9501\u5B9A\u8DDD\u79BB${range}\u7C73\uFF0C\u51B7\u5374${cd}\u79D2\u3002` + (impact.seconds ? `${id === "firebolt" ? "\u76EE\u6807" : "\u533A\u57DF\u5185\u654C\u4EBA"}\u71C3\u70E7\u6301\u7EED${impact.seconds}\u79D2\uFF0C\u6BCF\u79D2${burn}%\u57FA\u7840\u653B\u51FB\u4F24\u5BB3\uFF0C\u65BD\u6CD5\u7ED3\u675F\u540E\u4ECD\u751F\u6548\u3002` : "") : texts[id]?.[en ? 1 : 0] || "", radius = skillRadius(id, level);
  return text + (radius ? en ? ` Area radius: ${radius}m (+0.5m per skill level).` : ` \u4F5C\u7528\u534A\u5F84\uFF1A${radius}\u7C73\uFF08\u6BCF\u5347\u4E00\u7EA7+0.5\u7C73\uFF09\u3002` : "");
}
function activeSkill(a, id, now = Date.now()) {
  const e = a.skillRuntime?.effects[id];
  return e && e.until > now ? e.level : 0;
}
function skillDamageMultiplier(a, now = Date.now()) {
  return (a.corrupted ? 1.3 : 1) * ((a.boosts?.damage || 0) > now ? 2 : 1) * (activeSkill(a, "nightfall", now) ? 1.25 : 1) * (1 + activeSkill(a, "power", now) * 0.02) * (1 + activeSkill(a, "rage", now) * 0.3) * (1 + (bossFormStats(a, now)?.damage || 0));
}
function skillSpeedMultiplier(a, now = Date.now()) {
  const t = activeSkill(a, "transform", now), h = activeSkill(a, "haste", now);
  return (activeSkill(a, "nightfall", now) ? 1.3 : 1) * (1 + activeSkill(a, "rage", now) * 0.2) * (t ? 1 + Math.min(0.4, 0.1 + 0.02 * t) : 1) * (h ? 1 + Math.min(0.4, 0.15 + 0.02 * h) : 1) * (1 + (bossFormStats(a, now)?.speed || 0));
}
function skillFireMultiplier(a, now = Date.now()) {
  const h = activeSkill(a, "haste", now);
  return h ? 1 - Math.min(0.25, 0.08 + 0.01 * h) : 1;
}
function skillIncoming(a, now = Date.now()) {
  const t = activeSkill(a, "transform", now), i = activeSkill(a, "icearmor", now);
  return ((a.boosts?.defense || 0) > now ? 0.5 : 1) * (1 - (a.gearReduction || 0)) * (activeSkill(a, "rage", now) ? 2 : 1) * (t ? 1 - Math.min(0.35, 0.1 + 0.01 * t) : 1) * (i ? 1 - Math.min(0.5, 0.15 + 0.02 * i) : 1) * (1 - (bossFormStats(a, now)?.reduction || 0));
}
function skillHealth(a, base, now) {
  const t = activeSkill(a, "transform", now);
  a.skillBaseHp = base;
  runtime(a).baseHp = base;
  a.maxHp = Math.floor(base * (1 + activeSkill(a, "vitality", now) * 0.03 + (t ? Math.min(1, 0.2 + 0.04 * t) : 0)) * (1 + (bossFormStats(a, now)?.health || 0)));
  a.hp = Math.min(a.hp, a.maxHp);
}
function skillDrops(kind, random = Math.random) {
  const boss = kind === "buried_marshal" || kind === "hourglass_regent" || kind === "sky_sovereign" || kind === "thunder_warden" || kind === "frost_crowned" || kind === "furnace_regent" || kind === "starbound_heart" || kind === "immaculate_judge" || kind === "blight_lord" || kind === "oathknight" || kind === "emptyking" || kind === "chief" || kind === "lord" || kind === "rootwarden" || ["metal", "wood", "water", "fire", "earth"].some((e) => kind === "crystal_" + e);
  if (!boss) return {};
  const ids = Object.keys(SKILLS), id = ids[Math.min(ids.length - 1, Math.floor(random() * ids.length))];
  return { [skillBook(id)]: 1 };
}
export {
  ELEMENTAL_IMPACTS,
  PROFESSIONS,
  SKILLS,
  activeSkill,
  curseHitMultiplier,
  ensureBasicSkills,
  runtime,
  skillBook,
  skillBookName,
  skillCastRange,
  skillCooldown,
  skillDamageMultiplier,
  skillDescription,
  skillDrops,
  skillFireMultiplier,
  skillHealth,
  skillIncoming,
  skillRadius,
  skillSpeedMultiplier,
  skillTrainingCost,
  trainSkill
};
