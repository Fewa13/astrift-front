// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { skillRadius } from "./ancient-skills.js";
const ASCENSION_SKILLS = { shadowblade: ["shadowstep", "shadowreturn", "nightfall", "riftblade"], stonewright: ["faultline", "stoneprison", "mountainfall", "stonefist"], warrior: ["vitality", "power", "rage", "slash"], summoner: ["summon", "weaken", "transform", "soulbolt"], ice: ["icebolt", "icearmor", "blizzard", "frostburst"], lightning: ["chain", "haste", "storm", "tempest"], fire: ["firewave", "firestorm", "inferno", "firebolt"], curse: ["hex", "drain", "doom"], swordsman: ["triplecut", "swordrain", "phantomblade", "swordwave"] };
function ascensionProgress(p, job = p.profession || "") {
  return p.ascension?.jobs?.[job];
}
function isHoly(p) {
  return !!p.profession && !!p.ascension?.jobs?.[p.profession]?.holy;
}
const holyPower = (p) => isHoly(p) ? 2.5 : 1;
const holyName = (name, en = false, holy = false) => holy ? en ? "Holy " + name : "\u5723\xB7" + name : name;
function holySkillDetails(id, n, en = false) {
  const level = Math.max(1, n), damage = { firebolt: 300 + 27 * level, firewave: 340 + 30 * level, firestorm: 300 + 26 * level, inferno: 700 + 55 * level, tempest: 800 + 65 * level, riftblade: 300 + 25 * level, shadowstep: 260 + 22 * level, shadowreturn: 220 + 20 * level, nightfall: 400 + 35 * level, stonefist: 320 + 30 * level, faultline: 180 + 15 * level, stoneprison: 300 + 30 * level, mountainfall: 700 + 60 * level, frostburst: 260 + 25 * level, swordwave: 300 + 25 * level, triplecut: 330 + 30 * level, swordrain: 140 + 16 * level, phantomblade: 845 + 78 * level, slash: 320 + 30 * level, soulbolt: 330 + 30 * level, power: 300 + 30 * level, rage: 400 + 40 * level, icebolt: 300 + 30 * level, icearmor: 300 + 30 * level, blizzard: 125 + 10 * level, chain: 300 + 30 * level, haste: 300 + 30 * level, storm: 160 + 15 * level, hex: 320 + 30 * level, drain: 400 + 40 * level, doom: 80 + 8 * level, weaken: 280 + 30 * level, transform: 125 + 10 * level, summon: 75 + 5 * level };
  const radius = skillRadius(id, level, true), tick = ["blizzard", "storm", "doom"].includes(id), parts = [];
  if (damage[id]) parts.push(en ? `${damage[id] * 2.5}% base attack ${tick ? "per second" : id === "swordrain" ? "per strike" : id === "triplecut" ? "on the first strike" : "damage"}` : `${damage[id] * 2.5}%\u57FA\u7840\u653B\u51FB${tick ? "\u6BCF\u79D2\u4F24\u5BB3" : id === "swordrain" ? "\u6BCF\u8F6E\u4F24\u5BB3" : id === "triplecut" ? "\u9996\u5200\u4F24\u5BB3" : "\u4F24\u5BB3"}`);
  if (id === "shadowreturn") parts.push(en ? `Recall slash: ${Math.round(damage[id] * 2.75)}% base attack` : `\u56DE\u62C9\u65A9\u51FB\uFF1A${Math.round(damage[id] * 2.75)}%\u57FA\u7840\u653B\u51FB`);
  if (radius) parts.push(en ? `Radius ${radius}m` : `\u534A\u5F84${radius}\u7C73`);
  if (id === "chain") parts.push(en ? `${level + 4} targets \xB7 ${(16 + level - 1) * 1.5}m chain diameter` : `\u6700\u591A${level + 4}\u4E2A\u76EE\u6807 \xB7 \u8FDE\u9501\u76F4\u5F84${(16 + level - 1) * 1.5}\u7C73`);
  if (id === "summon") parts.push(en ? "Beast HP \xD71.5" : "\u53EC\u5524\u517D\u8840\u91CF\xD71.5");
  return (en ? "Holy result: " : "\u5723\u7EA7\u5B9E\u9645\uFF1A") + (parts.join(" \xB7 ") || (en ? "Sacred appearance; original recovery and cooldown retained." : "\u5723\u7EA7\u5916\u89C2\uFF0C\u539F\u56DE\u590D\u6548\u679C\u548C\u51B7\u5374\u4FDD\u7559\u3002"));
}
function ascensionDay(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10);
}
function ascensionAttempts(p, now = Date.now()) {
  return p.ascension?.day === ascensionDay(now) ? p.ascension.attempts : 0;
}
function ascensionEligible(p) {
  return p.level >= 80 && !!p.profession && !!ASCENSION_SKILLS[p.profession] && ASCENSION_SKILLS[p.profession].every((id) => (p.skills?.[id] || 0) >= 5);
}
function ascensionStartError(p, final = false, now = Date.now()) {
  if (!ascensionEligible(p)) return "Requires level 80 and all profession skills at level 5.";
  const progress = ascensionProgress(p);
  if (progress?.holy) return "This profession is already ascended.";
  if (final) return progress?.permit && progress.step === 2 ? null : "Complete the ascension side quest first.";
  if (progress?.permit) return "Ascension permit already earned.";
  return ascensionAttempts(p, now) >= 2 ? "Daily limit: 2 trial attempts." : null;
}
function consumeAscensionAttempt(p, now = Date.now()) {
  const day = ascensionDay(now);
  p.ascension ??= { day, attempts: 0, jobs: {} };
  if (p.ascension.day !== day) {
    p.ascension.day = day;
    p.ascension.attempts = 0;
  }
  p.ascension.attempts++;
}
function grantAscension(p, job, final = false) {
  if (p.profession !== job || !ASCENSION_SKILLS[job]) return false;
  p.ascension ??= { day: ascensionDay(), attempts: 0, jobs: {} };
  const s = p.ascension.jobs[job] ??= { permit: false, step: 0, count: 0, holy: false };
  if (final) {
    if (!s.permit || s.step !== 2 || s.holy) return false;
    s.holy = true;
    s.step = 3;
    return true;
  }
  if (s.permit) return false;
  s.permit = true;
  return true;
}
function ascensionKill(p, map, kind, level) {
  const s = ascensionProgress(p);
  if (!s?.permit || s.holy) return;
  if (s.step === 0 && map === "city" && level >= 70 && !["oathknight", "emptyking", "noble_echo"].includes(kind) || s.step === 1 && map === "forest" && kind.startsWith("crystal_")) {
    s.count++;
    if (s.count >= (s.step === 0 ? 20 : 2)) {
      s.step++;
      s.count = 0;
    }
  }
}
const ASCENSION_STEPS = [["\u638C\u63E1\u6E90\u529B\uFF1A\u51FB\u8D2520\u4E2A\u738B\u57CE\u666E\u901A\u602A\u7269", "Master the source: defeat 20 ordinary city enemies"], ["\u6DEC\u70BC\u529B\u91CF\uFF1A\u51FB\u8D252\u4E2A\u68EE\u6797\u6C34\u6676\u5DE8\u4EBA", "Temper your power: defeat 2 forest Crystal Titans"], ["\u5723\u804C\u4EEA\u5F0F\uFF1A\u5B8C\u6210\u6700\u7EC8\u5355\u4EBA\u8BD5\u70BC", "Sacred rite: complete the final solo trial"]];
const HOLY_DESCRIPTIONS = {
  fire: ["\u91D1\u8272\u65E5\u5195\u4E0E\u7194\u706B\u9668\u661F\uFF0C\u706B\u7130\u8986\u76D6\u66F4\u5E7F\uFF0C\u71C3\u70E7\u4F24\u5BB3\u83B7\u5F97\u5723\u7EA7\u589E\u5E45\u3002", "A golden corona and molten meteors widen the blaze and amplify its burn."],
  shadowblade: ["\u53CC\u5203\u5F71\u51A0\u3001\u5B9E\u4F53\u6B8B\u5F71\u4EA4\u53C9\u8FFD\u51FB\u4E0E\u591C\u5E55\u5200\u9635\uFF0C\u7A81\u8FDB\u7559\u4E0B\u6495\u88C2\u7A7A\u95F4\u7684\u5203\u75D5\u3002", "A twin-blade crown, solid shadow cross-slashes and a nightfall blade formation leave rifts along each dash."],
  stonewright: ["\u60AC\u6D6E\u5DE8\u5CA9\u91CD\u94E0\u3001\u5730\u8109\u7B26\u5370\u4E0E\u5C71\u5CB3\u5DE8\u81C2\uFF0C\u5CA9\u7262\u5316\u4E3A\u5C42\u53E0\u7684\u5723\u5CA9\u5C16\u5854\u3002", "Floating monolith armor, tectonic seals and a mountain-sized arm transform the prison into layered sacred spires."],
  warrior: ["\u5723\u94E0\u4E0E\u5DE8\u578B\u88C2\u5730\u5723\u5203\uFF0C\u9707\u8361\u5316\u4E3A\u91D1\u8272\u65AD\u5C42\u3002", "Sacred armor and colossal blades turn shockwaves into golden fractures."],
  summoner: ["\u865A\u7A7A\u53EC\u5524\u9635\u663E\u73B0\uFF0C\u94C1\u7532\u517D\u5316\u4E3A\u5723\u517D\uFF0C\u9B42\u5F39\u4E0E\u722A\u51FB\u83B7\u5F97\u5723\u529B\u3002", "A dimensional gate calls a sacred beast; soul bolts and claws gain holy power."],
  ice: ["\u51B0\u51A0\u5C55\u5F00\uFF0C\u51B0\u77DB\u5316\u4E3A\u5DE8\u6676\uFF0C\u98CE\u96EA\u5F62\u6210\u591A\u5C42\u51B0\u6676\u98CE\u66B4\u3002", "A frost crown manifests; lances become giant crystals and blizzards become glacial storms."],
  lightning: ["\u4ECE\u82CD\u7A79\u5F15\u4E0B\u96F7\u67F1\uFF0C\u4ECE\u865A\u7A7A\u805A\u96C6\u96F7\u9706\uFF0C\u7535\u5F27\u8D2F\u7A7F\u53D7\u51FB\u533A\u57DF\u3002", "Call thunder pillars from the sky and gather lightning from the void."],
  curse: ["\u591A\u5C42\u865A\u7A7A\u6CD5\u9635\u3001\u590D\u6742\u7B26\u6587\u4E0E\u5492\u5370\u5B9E\u4F53\u5316\uFF0C\u707E\u5384\u5728\u9635\u5FC3\u964D\u4E34\u3002", "Layered void circles and intricate runes materialize as doom descends at their center."],
  swordsman: ["\u7FE1\u7FE0\u5251\u51A0\u3001\u60AC\u6D6E\u5251\u9635\u4E0E\u5DE8\u578B\u5723\u5251\u6295\u5F71\uFF0C\u5251\u96E8\u7B3C\u7F69\u66F4\u5927\u8303\u56F4\u3002", "An emerald blade crown, hovering swords and a colossal sacred sword cover a wider battlefield."]
};
export {
  ASCENSION_SKILLS,
  ASCENSION_STEPS,
  HOLY_DESCRIPTIONS,
  ascensionAttempts,
  ascensionDay,
  ascensionEligible,
  ascensionKill,
  ascensionProgress,
  ascensionStartError,
  consumeAscensionAttempt,
  grantAscension,
  holyName,
  holyPower,
  holySkillDetails,
  isHoly
};
