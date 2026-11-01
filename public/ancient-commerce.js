// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { PROFESSIONS, skillBook, ensureBasicSkills } from "./ancient-skills.js";
const ANCIENT_SUPPLIES = {
  purity: { name: "\u51C0\u5316\u5370\u8BB0", en: "Purification Sigil", price: 0, kind: "cleanse" },
  transfer: { name: "\u8F6C\u804C\u4E66", en: "Profession Change Book", price: 1e3, kind: "transfer" },
  damage: { name: "\u53CC\u500D\u4F24\u5BB3\u836F\u6C34", en: "Double Damage Potion", price: 200, kind: "boost", duration: 6e5 },
  defense: { name: "\u53CC\u500D\u9632\u5FA1\u836F\u6C34", en: "Double Defense Potion", price: 200, kind: "boost", duration: 6e5 },
  experience: { name: "\u7ECF\u9A8C\u836F\u6C34", en: "XP Potion", price: 300, kind: "boost", duration: 6e5 }
};
for (const [id, j] of Object.entries(PROFESSIONS)) ANCIENT_SUPPLIES["book:" + id] = { name: j.name + "\u6280\u80FD\u4E66", en: j.en + " Skill Book", price: 300, kind: "book", job: id };
function supplyKey(id) {
  return "supply:" + id;
}
function supplyDescription(id, en = false) {
  const d = ANCIENT_SUPPLIES[id];
  if (!d) return "";
  if (d.kind === "cleanse") return en ? "Consumed to remove corruption. Does not heal or prevent future corruption. Craft after the Sanctum story: 1 Verdict Crystal + 30 Phase Cores." : "\u6D88\u8017\u4E00\u679A\u89E3\u9664\u9B54\u5316\uFF1B\u4E0D\u56DE\u8840\uFF0C\u4E0D\u9632\u6B62\u518D\u6B21\u9B54\u5316\u3002\u5B8C\u6210\u5723\u57DF\u4E3B\u7EBF\u540E\uFF0C\u75281\u4E2A\u88C1\u51B3\u6676\u6838\u548C30\u4E2A\u76F8\u4F4D\u6838\u5FC3\u5236\u4F5C\u3002";
  if (d.kind === "transfer") return en ? "Consumed when choosing or changing profession. Trained skill levels are retained." : "\u9009\u62E9\u6216\u5207\u6362\u804C\u4E1A\u65F6\u6D88\u8017\u4E00\u672C\uFF0C\u5DF2\u4FEE\u70BC\u6280\u80FD\u7B49\u7EA7\u4FDD\u7559\u3002";
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
  if (d.kind === "boost" && quantity > boostRemaining) return "\u4ECA\u65E5\u6BCF\u79CD\u7279\u6B8A\u6548\u679C\u836F\u6C34\u9650\u8D2D5\u74F6";
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
    p.shopBoosts.counts[id] = 5 - boostRemaining + quantity;
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
  if (d.kind === "transfer") return "\u8BF7\u5728\u6280\u80FD\u9875\u9762\u9009\u62E9\u804C\u4E1A";
  if (d.kind === "cleanse") {
    if (!p.purificationUnlocked) return "\u5C1A\u672A\u5B66\u4F1A\u51C0\u5316";
    if (!p.corrupted) return "\u5F53\u524D\u6CA1\u6709\u9B54\u5316";
    p.corrupted = false;
    delete p.corruptedMap;
  } else if (d.kind === "boost") {
    p.boosts ??= {};
    p.boosts[id] = now + d.duration;
  } else {
    const ids = PROFESSIONS[d.job].skills, book = skillBook(ids[Math.min(ids.length - 1, Math.floor(random() * ids.length))]);
    p.materials[book] = (p.materials[book] || 0) + 1;
  }
  p.materials[key]--;
  return null;
}
function chooseAncientProfession(p, job) {
  if (!Object.hasOwn(PROFESSIONS, job)) return "\u804C\u4E1A\u4E0D\u5B58\u5728";
  if (p.profession === job) return "\u5DF2\u662F\u5F53\u524D\u804C\u4E1A";
  const key = supplyKey("transfer");
  if ((p.materials[key] || 0) < 1) return "\u8F6C\u804C\u4E66\u4E0D\u8DB3";
  p.materials[key]--;
  p.profession = job;
  ensureBasicSkills(p);
  return null;
}
function ancientBoostsRemaining(p, id, now = Date.now()) {
  return p.shopBoosts?.day === ancientShopDay(now) ? Math.max(0, 5 - Math.max(0, p.shopBoosts.counts?.[id] || 0)) : 5;
}
export {
  ANCIENT_SUPPLIES,
  ancientBoostsRemaining,
  ancientShopDay,
  ancientSkillBooksRemaining,
  buyAncientSupply,
  chooseAncientProfession,
  supplyDescription,
  supplyKey,
  useAncientSupply
};
