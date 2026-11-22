// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { POTION_EFFECTS } from "./ancient-potion-effects.js";
import { isAuthorityJob } from "./ancient-authority.js";
import { rollbackAdvancement } from "./ancient-advancement-progress.js";
import { PROFESSION_FUSIONS, isFusionJob } from "./ancient-skills.js";
import { FUSION_SCROLLS } from "./ancient-fusion-passives.js";
import { PROFESSIONS, SKILLS, hasSkillBook, skillBook, ensureBasicSkills } from "./ancient-skills.js";
const ANCIENT_SUPPLIES = {
  purity: { name: "\u51C0\u5316\u5370\u8BB0", en: "Purification Sigil", price: 0, kind: "cleanse" },
  rollback: { name: "\u804C\u4E1A\u56DE\u9000\u5377\u8F74", en: "Profession Reversion Scroll", price: 1e5, kind: "rollback" },
  transfer: { name: "\u8F6C\u804C\u4E66", en: "Profession Change Book", price: 1e3, kind: "transfer" },
  damage: { name: "\u53CC\u500D\u4F24\u5BB3\u836F\u6C34", en: "Double Damage Potion", price: 200, kind: "boost", duration: POTION_EFFECTS.duration },
  defense: { name: "\u53CC\u500D\u9632\u5FA1\u836F\u6C34", en: "Double Defense Potion", price: 200, kind: "boost", duration: POTION_EFFECTS.duration },
  speed: { name: "\u901F\u5EA6\u836F\u6C34", en: "Speed Potion", price: 200, kind: "boost", duration: POTION_EFFECTS.duration },
  berserk: { name: "\u72C2\u66B4\u836F\u6C34", en: "Berserk Potion", price: 1e3, kind: "boost", duration: POTION_EFFECTS.duration },
  elementFire: { name: "\u706B\u7130\u5143\u7D20\u836F\u6C34", en: "Fire Element Potion", price: 400, kind: "boost", duration: POTION_EFFECTS.duration },
  elementLightning: { name: "\u96F7\u7535\u5143\u7D20\u836F\u6C34", en: "Lightning Element Potion", price: 400, kind: "boost", duration: POTION_EFFECTS.duration },
  elementCurse: { name: "\u8BC5\u5492\u5143\u7D20\u836F\u6C34", en: "Curse Element Potion", price: 400, kind: "boost", duration: POTION_EFFECTS.duration },
  elementEarth: { name: "\u5927\u5730\u5143\u7D20\u836F\u6C34", en: "Earth Element Potion", price: 400, kind: "boost", duration: POTION_EFFECTS.duration },
  elementIce: { name: "\u5BD2\u51B0\u5143\u7D20\u836F\u6C34", en: "Ice Element Potion", price: 400, kind: "boost", duration: POTION_EFFECTS.duration },
  experience: { name: "\u7ECF\u9A8C\u836F\u6C34", en: "XP Potion", price: 300, kind: "boost", duration: POTION_EFFECTS.duration }
};
for (const [id, scroll] of Object.entries(FUSION_SCROLLS)) ANCIENT_SUPPLIES[id] = { ...scroll, kind: "scroll" };
for (const [id, j] of Object.entries(PROFESSIONS)) if (!isFusionJob(id) && !isAuthorityJob(id)) ANCIENT_SUPPLIES["book:" + id] = { name: j.name + "\u6280\u80FD\u4E66", en: j.en + " Skill Book", price: 300, kind: "book", job: id };
function supplyKey(id) {
  return "supply:" + id;
}
function supplyDescription(id, en = false) {
  const d = ANCIENT_SUPPLIES[id];
  if (!d) return "";
  if (d.kind === "cleanse") return en ? "Consumed to remove corruption. Does not heal or prevent future corruption. Craft after the Sanctum story: 1 Verdict Crystal + 30 Phase Cores." : "\u6D88\u8017\u4E00\u679A\u89E3\u9664\u9B54\u5316\uFF1B\u4E0D\u56DE\u8840\uFF0C\u4E0D\u9632\u6B62\u518D\u6B21\u9B54\u5316\u3002\u5B8C\u6210\u5723\u57DF\u4E3B\u7EBF\u540E\uFF0C\u75281\u4E2A\u88C1\u51B3\u6676\u6838\u548C30\u4E2A\u76F8\u4F4D\u6838\u5FC3\u5236\u4F5C\u3002";
  if (d.kind === "rollback") return en ? "Revert the current ordinary Holy advancement branch. Retains Holy status and trained skill progress; lets you choose a branch again." : "\u56DE\u9000\u5F53\u524D\u666E\u901A\u804C\u4E1A\u7684\u5723\u7EA7\u5347\u534E\u5206\u652F\uFF0C\u4FDD\u7559\u5723\u7EA7\u4E0E\u6280\u80FD\u6210\u957F\uFF0C\u53EF\u91CD\u65B0\u9009\u62E9\u5206\u652F\u3002";
  if (d.kind === "transfer") return en ? "Consumed when choosing or changing profession. Trained skill levels are retained." : "\u9009\u62E9\u6216\u5207\u6362\u804C\u4E1A\u65F6\u6D88\u8017\u4E00\u672C\uFF0C\u5DF2\u4FEE\u70BC\u6280\u80FD\u7B49\u7EA7\u4FDD\u7559\u3002";
  if (d.kind === "scroll") return en ? "Used to ignite a fusion passive." : "\u7528\u4E8E\u70B9\u4EAE\u878D\u5408\u804C\u4E1A\u88AB\u52A8\u6280\u80FD\u3002";
  if (id === "speed") return en ? "Movement speed +50% for 10 minutes. Reuse refreshes duration." : "10\u5206\u949F\u5185\u79FB\u52A8\u901F\u5EA6+50%\uFF0C\u91CD\u590D\u4F7F\u7528\u5237\u65B0\u6301\u7EED\u65F6\u95F4\u3002";
  if (id === "berserk") return en ? "10 minutes: skill cooldown \xD70.8, damage \xD72, movement +30%, incoming damage \xD71.5, melee interval \xD70.7, skill cast range +10%. Stacks with Double Damage Potion for \xD74 damage. Reuse refreshes duration." : "10\u5206\u949F\u5185\uFF1A\u6280\u80FD\u51B7\u5374\u221220%\u3001\u4F24\u5BB3+100%\u3001\u79FB\u901F+30%\u3001\u53D7\u5230\u4F24\u5BB3+50%\u3001\u8FD1\u6218\u653B\u51FB\u95F4\u9694\u221230%\u3001\u6280\u80FD\u65BD\u653E\u8DDD\u79BB+10%\u3002\u53EF\u4E0E\u53CC\u500D\u4F24\u5BB3\u836F\u6C34\u53E0\u52A0\u4E3A4\u500D\u4F24\u5BB3\uFF1B\u91CD\u590D\u4F7F\u7528\u5237\u65B0\u6301\u7EED\u65F6\u95F4\u3002";
  if (id.startsWith("element")) return (en ? "For 10 minutes, skill hits have a 20% chance to apply " : "10\u5206\u949F\u5185\u6280\u80FD\u547D\u4E2D\u670920%\u6982\u7387\u9644\u52A0") + (en ? { elementFire: "burning (30% hit damage over 3s)", elementLightning: "20% extra damage and a 75%-strength chain to one nearby enemy", elementCurse: "20% extra damage, \u221210% attack and +10% incoming damage for 4s", elementEarth: "20% extra damage, a brief stagger and 15% slow", elementIce: "20% extra damage and 30% slow for 4s" }[id] : { elementFire: "\u71C3\u70E7\uFF083\u79D2\u5185\u989D\u5916\u9020\u6210\u672C\u6B21\u4F24\u5BB3\u768430%\uFF09", elementLightning: "\u989D\u591620%\u4F24\u5BB3\uFF0C\u5E76\u4EE5\u517675%\u7684\u5F3A\u5EA6\u8FDE\u9501\u9644\u8FD11\u4E2A\u654C\u4EBA", elementCurse: "\u989D\u591620%\u4F24\u5BB3\uFF0C\u76EE\u68074\u79D2\u5185\u653B\u51FB\u221210%\u3001\u53D7\u5230\u4F24\u5BB3+10%", elementEarth: "\u989D\u591620%\u4F24\u5BB3\u3001\u77ED\u6682\u9707\u51FB\u4E0E15%\u51CF\u901F", elementIce: "\u989D\u591620%\u4F24\u5BB3\uFF0C\u76EE\u68074\u79D2\u5185\u51CF\u901F30%" }[id]) + (en ? ". Per target and element: at most once per second. Same potion refreshes; different elements coexist." : "\u3002\u540C\u76EE\u6807\u540C\u5143\u7D20\u6BCF\u79D2\u6700\u591A\u89E6\u53D1\u4E00\u6B21\uFF1B\u540C\u7C7B\u5237\u65B0\uFF0C\u4E0D\u540C\u5143\u7D20\u53EF\u5171\u5B58\u3002");
  if (d.kind === "book") return en ? "Use to receive one random skill book for this profession." : "\u4F7F\u7528\u540E\u968F\u673A\u83B7\u5F97\u4E00\u672C\u8BE5\u804C\u4E1A\u7684\u5177\u4F53\u6280\u80FD\u4E66\u3002";
  return (en ? { damage: "All damage \xD72", defense: "Incoming damage \xD70.5", experience: "XP +50%" } : { damage: "\u6240\u6709\u4F24\u5BB3 \xD72", defense: "\u53D7\u5230\u4F24\u5BB3 \xD70.5", experience: "\u7ECF\u9A8C +50%" })[id] + " \xB7 " + (en ? "10 minutes; expires while offline; does not stack." : "10\u5206\u949F\uFF1B\u79BB\u7EBF\u4ECD\u8BA1\u65F6\uFF1B\u540C\u7C7B\u4E0D\u53E0\u52A0\u3002");
}
function buyAncientSupply(p, id, quantity, now = Date.now()) {
  const d = Object.hasOwn(ANCIENT_SUPPLIES, id) ? ANCIENT_SUPPLIES[id] : void 0;
  if (!d || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 999) return "\u8D2D\u4E70\u6570\u91CF\u65E0\u6548";
  if (d.kind === "cleanse") return "\u51C0\u5316\u5370\u8BB0\u9700\u8981\u5236\u4F5C";
  const remaining = ancientSkillBooksRemaining(p, id, now);
  if (d.kind === "transfer" && quantity > remaining) return "\u4ECA\u65E5\u8F6C\u804C\u4E66\u9650\u8D2D2\u672C";
  if (d.kind === "book" && quantity > remaining) return "\u4ECA\u65E5\u6BCF\u79CD\u6280\u80FD\u4E66\u9650\u8D2D8\u672C";
  const boostRemaining = ancientBoostsRemaining(p, id, now);
  if (d.kind === "boost" && quantity > boostRemaining) return id === "berserk" ? "\u4ECA\u65E5\u72C2\u66B4\u836F\u6C34\u9650\u8D2D3\u74F6" : "\u4ECA\u65E5\u6BCF\u79CD\u7279\u6B8A\u6548\u679C\u836F\u6C34\u9650\u8D2D5\u74F6";
  const key = supplyKey(id), count = (p.materials[key] || 0) + quantity, cost = d.price * quantity;
  if (!Number.isSafeInteger(count)) return "\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650";
  if (p.coins < cost) return "\u8FDC\u53E4\u91D1\u5E01\u4E0D\u8DB3";
  p.coins = Math.round((p.coins - cost) * 100) / 100;
  p.materials[key] = count;
  if (d.kind === "book" || d.kind === "transfer") {
    if (p.shopSkillBooksByKind?.day !== ancientShopDay(now)) p.shopSkillBooksByKind = { day: ancientShopDay(now), counts: {} };
    p.shopSkillBooksByKind.counts[id] = (d.kind === "transfer" ? 2 : 8) - remaining + quantity;
  }
  ;
  if (d.kind === "boost") {
    if (p.shopBoosts?.day !== ancientShopDay(now)) p.shopBoosts = { day: ancientShopDay(now), counts: {} };
    p.shopBoosts.counts[id] = ancientBoostLimit(id) - boostRemaining + quantity;
  }
  return null;
}
const shopCalendar = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" });
function ancientShopDay(now = Date.now()) {
  const parts = shopCalendar.formatToParts(new Date(now)), get = (type) => parts.find((p) => p.type === type).value;
  return get("year") + "-" + get("month") + "-" + get("day");
}
function ancientSkillBooksRemaining(p, id, now = Date.now()) {
  const limit = id === "transfer" ? 2 : 8;
  return p.shopSkillBooksByKind?.day === ancientShopDay(now) ? Math.max(0, limit - Math.max(0, p.shopSkillBooksByKind.counts?.[id] || 0)) : limit;
}
function useAncientSupply(p, id, now = Date.now(), random = Math.random) {
  const d = Object.hasOwn(ANCIENT_SUPPLIES, id) ? ANCIENT_SUPPLIES[id] : void 0, key = supplyKey(id);
  if (!d || (p.materials[key] || 0) < 1) return "\u7269\u54C1\u4E0D\u8DB3";
  if (d.kind === "scroll") return "\u8BF7\u5728\u804C\u4E1A\u9875\u9762\u70B9\u4EAE\u88AB\u52A8\u6280\u80FD";
  if (d.kind === "transfer") return "\u8BF7\u5728\u804C\u4E1A\u9875\u9762\u9009\u62E9\u804C\u4E1A";
  if (d.kind === "rollback") {
    const error = rollbackAdvancement(p);
    if (error) return error;
  } else if (d.kind === "cleanse") {
    if (!p.purificationUnlocked) return "\u5C1A\u672A\u5B66\u4F1A\u51C0\u5316";
    if (!p.corrupted) return "\u5F53\u524D\u6CA1\u6709\u9B54\u5316";
    p.corrupted = false;
    delete p.corruptedMap;
  } else if (d.kind === "boost") {
    p.boosts ??= {};
    p.boosts[id] = now + d.duration;
  } else {
    const ids = PROFESSIONS[d.job].skills.filter((id2) => hasSkillBook(id2) && SKILLS[id2]?.job === d.job);
    if (!ids.length) return "\u8BE5\u804C\u4E1A\u6CA1\u6709\u53EF\u7528\u6280\u80FD\u4E66";
    const book = skillBook(ids[Math.min(ids.length - 1, Math.floor(random() * ids.length))]);
    p.materials[book] = (p.materials[book] || 0) + 1;
  }
  p.materials[key]--;
  return null;
}
function chooseAncientProfession(p, job) {
  if (!Object.hasOwn(PROFESSIONS, job) || isAuthorityJob(job) && !p.authority?.[job]?.unlocked || p.consumedJobs?.[job] || isFusionJob(job) && !p.fusedJobs?.[job]) return "\u804C\u4E1A\u4E0D\u53EF\u7528";
  if (p.profession === job) return "\u5DF2\u662F\u5F53\u524D\u804C\u4E1A";
  const key = supplyKey("transfer");
  if (p.profession) {
    if (p.level < 15) return "15\u7EA7\u5F00\u653E\u8F6C\u804C";
    if ((p.materials[key] || 0) < 1) return "\u8F6C\u804C\u4E66\u4E0D\u8DB3";
    p.materials[key]--;
  }
  p.profession = job;
  ensureBasicSkills(p);
  return null;
}
const ancientBoostLimit = (id) => id === "berserk" ? 3 : 5;
function ancientBoostsRemaining(p, id, now = Date.now()) {
  const limit = ancientBoostLimit(id);
  return p.shopBoosts?.day === ancientShopDay(now) ? Math.max(0, limit - Math.max(0, p.shopBoosts.counts?.[id] || 0)) : limit;
}
function fuseAncientProfession(p, job) {
  if (p.level < 15) return "15\u7EA7\u5F00\u653E\u8F6C\u804C";
  if (!isFusionJob(job) || p.fusedJobs?.[job]) return "\u804C\u4E1A\u65E0\u6CD5\u878D\u5408";
  const recipe = PROFESSION_FUSIONS[job];
  for (const source of recipe.sources) {
    if (p.consumedJobs?.[source] || !PROFESSIONS[source].skills.every((id) => (p.skills?.[id] || 0) >= 5)) return "\u878D\u5408\u804C\u4E1A\u7684\u6240\u6709\u6750\u6599\u6280\u80FD\u987B\u8FBE\u52305\u7EA7\uFF0C\u4E14\u804C\u4E1A\u5C1A\u672A\u88AB\u6D88\u8017";
  }
  (p.fusedJobs ??= {})[job] = true;
  for (const source of recipe.sources) (p.consumedJobs ??= {})[source] = true;
  p.ascension ??= { day: "", attempts: 0, jobs: {} };
  p.ascension.jobs[job] = { holy: true, permit: true, step: 2, count: 0 };
  for (const id of PROFESSIONS[job].skills) (p.skills ??= {})[id] = 1;
  p.profession = job;
  return null;
}
export {
  ANCIENT_SUPPLIES,
  ancientBoostLimit,
  ancientBoostsRemaining,
  ancientShopDay,
  ancientSkillBooksRemaining,
  buyAncientSupply,
  chooseAncientProfession,
  fuseAncientProfession,
  supplyDescription,
  supplyKey,
  useAncientSupply
};
