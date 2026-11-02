// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { jadeBonuses } from "./ancient-jade-wear.js";
const GEAR_SETS = {
  thunder: { name: "\u96F7\u9E23", en: "Thunder", two: ["\u6280\u80FD\u4F24\u5BB3+5%", "Skill damage +5%"], three: ["\u8FDE\u9501\u95EA\u7535\u76EE\u6807+1\uFF0C\u6280\u80FD\u4F24\u5BB3\u518D+3%", "Chain Lightning +1 target; another +3% skill damage"] },
  frost: { name: "\u971C\u75D5", en: "Frost", two: ["\u51CF\u901F\u5F3A\u5EA6+8%\uFF0C\u5934\u76EE\u51CF\u534A", "Slow strength +8%; halved on bosses"], three: ["\u5BF9\u51CF\u901F\u4E2D\u7684\u654C\u4EBA\u4F24\u5BB3+12%", "Damage against slowed enemies +12%"] },
  blood: { name: "\u8840\u5203", en: "Blood", two: ["\u8FD1\u6218\u653B\u51FB\u95F4\u9694-8%", "Melee attack interval \u22128%"], three: ["\u6B66\u5668\u547D\u4E2D\u5438\u8840+3%", "Weapon-hit lifesteal +3%"] },
  beast: { name: "\u517D\u5951", en: "Beast", two: ["\u53EC\u5524\u517D\u4F24\u5BB3+12%", "Summon damage +12%"], three: ["\u53EC\u5524\u517D\u751F\u547D+20%\uFF0C\u4F24\u5BB3\u518D+8%", "Summon HP +20%; another +8% damage"] },
  arcane: { name: "\u7075\u672F", en: "Arcane", two: ["\u6280\u80FD\u51B7\u5374-4.8%", "Skill cooldown \u22124.8%"], three: ["\u6280\u80FD\u51B7\u5374\u518D-3.2%\uFF0C\u751F\u547D\u4E0A\u9650+5%", "Another \u22123.2% skill cooldown; max HP +5%"] }
};
const GEAR_AFFIXES = {
  astralTempo: { name: "\u661F\u5F8B\u6D41\u8F6C\xB7\u6280\u80FD\u51B7\u5374\u7F29\u51CF", en: "Astral Tempo \xB7 cooldown reduction", min: 0.075, max: 0.1125, quality: 7, slots: ["weapon", "helmet", "armor", "wings"] },
  primalTempo: { name: "\u592A\u521D\u65F6\u5E8F\xB7\u6280\u80FD\u51B7\u5374\u7F29\u51CF", en: "Primordial Tempo \xB7 cooldown reduction", min: 0.085, max: 0.125, quality: 8, slots: ["weapon", "helmet", "armor", "wings"] },
  starHunter: { name: "\u661F\u730E\xB7\u5BF9\u5934\u76EE/BOSS\u6280\u80FD\u4F24\u5BB3", en: "Skill damage against bosses", min: 0.08, max: 0.12, quality: 7, slots: ["weapon", "helmet", "armor", "wings"] },
  primalVerdict: { name: "\u592A\u521D\u88C1\u51B3\xB7\u5BF9\u4F4E\u4E8E30%\u751F\u547D\u654C\u4EBA\u6280\u80FD\u4F24\u5BB3", en: "Skill damage below 30% enemy HP", min: 0.1, max: 0.16, quality: 8, slots: ["weapon", "helmet", "armor", "wings"] },
  health: { name: "\u751F\u547D\u589E\u5E45", en: "Vitality", min: 0.01, max: 0.025, slots: ["helmet", "armor", "wings"] },
  reduction: { name: "\u575A\u97E7", en: "Resilience", min: 5e-3, max: 0.015, slots: ["helmet", "armor"] },
  speed: { name: "\u8F7B\u76C8", en: "Agility", min: 0.01, max: 0.025, slots: ["wings"] },
  haste: { name: "\u6325\u51FB\u52A0\u901F", en: "Melee haste", min: 0.02, max: 0.04, slots: ["weapon", "wings"] },
  lifesteal: { name: "\u6B66\u5668\u5438\u8840", en: "Weapon lifesteal", min: 5e-3, max: 0.015, slots: ["weapon"] },
  cooldown: { name: "\u6280\u80FD\u51B7\u5374\u7F29\u51CF", en: "Skill cooldown reduction", min: 0.01, max: 0.025, slots: ["helmet", "armor", "wings"] },
  pet: { name: "\u53EC\u5524\u517D\u4F24\u5BB3", en: "Summon damage", min: 0.03, max: 0.06, slots: ["weapon", "helmet", "armor", "wings"] },
  slow: { name: "\u51CF\u901F\u5F3A\u5316", en: "Slow strength", min: 0.02, max: 0.04, slots: ["weapon", "helmet", "armor", "wings"] }
};
function rollGearItem(key, random = Math.random) {
  const item = { id: crypto.randomUUID(), key };
  rollGearAffixes(item, random);
  grantGearBonusAffix(item, random);
  return item;
}
function rollGearAffixes(item, random = Math.random) {
  const d = gearDefinition(item.key);
  item.affixes = [];
  if (!d) return;
  const pool = Object.entries(GEAR_AFFIXES).filter(([key, a]) => a.slots.includes(d.slot) && !a.quality && (d.quality < 7 || key !== "cooldown"));
  if (d.quality >= 7) {
    const exclusive = d.quality === 7 ? ["astralTempo", "starHunter"] : ["primalTempo", "starHunter", "primalVerdict"], key = exclusive[Math.min(exclusive.length - 1, Math.floor(random() * exclusive.length))], a = GEAR_AFFIXES[key];
    item.affixes.push({ key, value: Math.round((a.min + (a.max - a.min) * Math.max(0, Math.min(1, random()))) * 1e4) / 1e4 });
  }
  const count = d.quality === 1 ? 0 : Math.min(3, d.quality - 1);
  for (let i = 0; i < count - (d.quality >= 7 ? 1 : 0) && pool.length; i++) {
    const index = Math.max(0, Math.min(pool.length - 1, Math.floor(random() * pool.length))), [key, a] = pool.splice(index, 1)[0];
    item.affixes.push({ key, value: Math.round((a.min + (a.max - a.min) * Math.max(0, Math.min(1, random()))) * 1e4) / 1e4 });
  }
}
function grantGearBonusAffix(item, random = Math.random) {
  if (item.affixBonusVersion === 1) return false;
  const d = gearDefinition(item.key);
  if (!d) return false;
  if (item.affixes === void 0) rollGearAffixes(item, random);
  const pool = Object.entries(GEAR_AFFIXES).filter(([key2, a2]) => a2.slots.includes(d.slot) && !a2.quality && (d.quality < 7 || key2 !== "cooldown") && !item.affixes.some((v) => v.key === key2));
  if (!pool.length) return false;
  const [key, a] = pool[Math.max(0, Math.min(pool.length - 1, Math.floor(random() * pool.length)))];
  item.affixes.push({ key, value: Math.round((a.min + (a.max - a.min) * Math.max(0, Math.min(1, random()))) * 1e4) / 1e4 });
  item.affixBonusVersion = 1;
  return true;
}
function gearAffixDescription(item, en = false) {
  return (item.affixes || []).map((v) => {
    const a = GEAR_AFFIXES[v.key];
    return a ? `${en ? a.en : a.name} +${+(v.value * (v.key === "cooldown" ? 0.8 : 1) * 100).toFixed(2)}%` : "";
  }).filter(Boolean).join(" \xB7 ");
}
const GEAR_QUALITIES = [["\u666E\u901A", "Common"], ["\u7A00\u6709", "Rare"], ["\u53F2\u8BD7", "Epic"], ["\u4F20\u8BF4", "Legendary"], ["\u795E\u8BDD", "Mythic"], ["\u8D85\u5723", "Transcendent"], ["\u5929\u7A79", "Celestial"], ["\u592A\u521D", "Primordial"]];
const GEAR_LEVELS = [0, 10, 30, 50, 80, 100, 140, 200];
const GEAR_SLOTS = { weapon: ["\u6B66\u5668", "Weapon"], helmet: ["\u5934\u76D4", "Helmet"], armor: ["\u62A4\u7532", "Armor"], wings: ["\u7FBD\u7FFC", "Wings"] };
const GEAR = {
  stoneRough: { name: "\u7C97\u5236\u77F3\u5251", en: "Rough Stone Sword", slot: "weapon", quality: 1, damage: 10 },
  stoneSharp: { name: "\u950B\u5229\u77F3\u5251", en: "Sharp Stone Sword", slot: "weapon", quality: 1, damage: 15 },
  ironClub: { name: "\u94C1\u68CD", en: "Iron Cudgel", slot: "weapon", quality: 1, damage: 8 },
  ironBroken: { name: "\u7834\u635F\u94C1\u5251", en: "Broken Iron Sword", slot: "weapon", quality: 1, damage: 30 },
  ironSharp: { name: "\u950B\u5229\u94C1\u5251", en: "Sharp Iron Sword", slot: "weapon", quality: 2, damage: 700 },
  purifyBroken: { name: "\u7834\u635F\u51C0\u5316\u795E\u5251", en: "Broken Purification Blade", slot: "weapon", quality: 2, damage: 600, lifesteal: 0.03 },
  fangBlade: { name: "\u788E\u7259\u730E\u5203", en: "Shardfang Hunting Blade", slot: "weapon", quality: 2, damage: 850 },
  frostKnife: { name: "\u5BD2\u7EB9\u77ED\u5200", en: "Frost-Etched Dagger", slot: "weapon", quality: 2, damage: 650, slow: 0.1 },
  windBlade: { name: "\u75BE\u98CE\u94C1\u5203", en: "Gale Iron Blade", slot: "weapon", quality: 2, damage: 600, interval: 500 },
  purifyHoly: { name: "\u51C0\u5316\u5723\u5251", en: "Holy Purification Sword", slot: "weapon", quality: 3, damage: 5e3, lifesteal: 0.05 },
  emberBlade: { name: "\u7194\u7130\u6218\u5203", en: "Ember Warblade", slot: "weapon", quality: 3, damage: 6500 },
  rootBlade: { name: "\u53E4\u6839\u88C1\u51B3", en: "Elderroot Verdict", slot: "weapon", quality: 3, damage: 5500, slow: 0.15 },
  stormKnife: { name: "\u98CE\u66B4\u77ED\u5203", en: "Storm Dagger", slot: "weapon", quality: 3, damage: 4500, interval: 480 },
  emperor: { name: "\u5E1D\u738B\u5723\u5251", en: "Imperial Holy Sword", slot: "weapon", quality: 4, damage: 8e3, lifesteal: 0.06, execute: 0.2 },
  thunderVerdict: { name: "\u96F7\u9706\u88C1\u51B3", en: "Thunder Verdict", slot: "weapon", quality: 4, damage: 1e4, slow: 0.2 },
  duskFang: { name: "\u66AE\u5F71\u7360\u7259", en: "Duskfang", slot: "weapon", quality: 4, damage: 7e3, interval: 450, lifesteal: 0.04 },
  starRuin: { name: "\u661F\u9668\u795E\u5203", en: "Starfall Divine Blade", slot: "weapon", quality: 5, damage: 28e3, lifesteal: 0.08, execute: 0.25 },
  abyssJudge: { name: "\u6DF1\u6E0A\u5BA1\u5224", en: "Abyssal Judgment", slot: "weapon", quality: 5, damage: 35e3, slow: 0.25 },
  dawnGod: { name: "\u9ECE\u660E\u795E\u5251", en: "Dawn Divine Sword", slot: "weapon", quality: 5, damage: 24e3, interval: 420, lifesteal: 0.1 },
  genesis: { name: "\u521B\u4E16\u5723\u88C1", en: "Genesis Holy Verdict", slot: "weapon", quality: 6, damage: 8e4, lifesteal: 0.12, execute: 0.3 },
  eclipse: { name: "\u6C38\u591C\u5929\u5203", en: "Eternal Eclipse Blade", slot: "weapon", quality: 6, damage: 65e3, interval: 400, slow: 0.3 }
};
const prefixes = [["\u517D\u9AA8", "Bone"], ["\u94A2\u7EB9", "Steel-Etched"], ["\u5723\u7EB9", "Hallowed"], ["\u5E1D\u738B", "Imperial"], ["\u661F\u7A79", "Celestial"], ["\u521B\u4E16", "Genesis"]], health = [100, 3e3, 2e4, 45e3, 1e5, 18e4];
for (let q = 1; q <= 6; q++) {
  const [zh, en] = prefixes[q - 1], h = health[q - 1];
  GEAR["helmet" + q] = { name: zh + "\u5934\u76D4", en: en + " Helmet", slot: "helmet", quality: q, health: Math.floor(h * 0.5), reduction: [0.02, 0.04, 0.06, 0.08, 0.1, 0.12][q - 1] };
  GEAR["armor" + q] = { name: zh + "\u62A4\u7532", en: en + " Armor", slot: "armor", quality: q, health: h, reduction: [0.04, 0.08, 0.12, 0.18, 0.24, 0.3][q - 1] };
  GEAR["wings" + q] = { name: zh + "\u7FBD\u7FFC", en: en + " Wings", slot: "wings", quality: q, speed: [0.03, 0.05, 0.07, 0.1, 0.13, 0.16][q - 1], bonus: [0.02, 0.04, 0.06, 0.09, 0.12, 0.16][q - 1] };
}
for (const q of [7, 8]) {
  const primal = q === 8, zh = primal ? "\u592A\u521D" : "\u5929\u7A79", en = primal ? "Primordial" : "Celestial";
  GEAR["blade" + q] = { name: zh + "\u88C1\u51B3\u5251", en: en + " Verdict", slot: "weapon", quality: q, damage: primal ? 26e4 : 14e4, skillPower: primal ? 0.58 : 0.5 };
  GEAR["helmet" + q] = { name: zh + "\u51A0\u5195", en: en + " Crown", slot: "helmet", quality: q, health: primal ? 2e5 : 13e4, reduction: 0.13 };
  GEAR["armor" + q] = { name: zh + "\u6218\u7532", en: en + " Plate", slot: "armor", quality: q, health: primal ? 4e5 : 26e4, hpPercent: primal ? 0.38 : 0.34, reduction: 0.31 };
  GEAR["wings" + q] = { name: zh + "\u7FBD\u7FFC", en: en + " Wings", slot: "wings", quality: q, speed: 0.17, bonus: primal ? 0.22 : 0.19 };
}
function gearDefinition(key) {
  return Object.hasOwn(GEAR, key) ? GEAR[key] : void 0;
}
const ANCIENT_FORGE = {};
Object.assign(GEAR, {
  copperTrailBlade: { name: "\u8D64\u94DC\u884C\u65C5\u5251", en: "Copper Trailblade", slot: "weapon", quality: 1, damage: 25 },
  ironTrailBlade: { name: "\u4E4C\u94C1\u63A2\u8DEF\u5203", en: "Iron Pathfinder", slot: "weapon", quality: 2, damage: 650 },
  moonTrailBlade: { name: "\u6708\u8F89\u5BFB\u5F84\u5251", en: "Moonstone Wayfinder", slot: "weapon", quality: 3, damage: 4500 }
});
Object.assign(ANCIENT_FORGE, { copperTrailBlade: { oreCopper: 12, stone: 8 }, ironTrailBlade: { oreIron: 20, core: 12 }, moonTrailBlade: { oreMoon: 24, core: 35 } });
const ANCIENT_FORGE_LEGACY = {};
for (const [key, source] of [["copperTrailBlade", "roughStone"], ["ironTrailBlade", "roughDark"], ["moonTrailBlade", "roughMoon"]]) {
  ANCIENT_FORGE_LEGACY[key] = { ...ANCIENT_FORGE[key] };
  const oldKey = Object.keys(ANCIENT_FORGE[key]).find((k) => k.startsWith("ore"));
  ANCIENT_FORGE[key] = { [source]: ANCIENT_FORGE[key][oldKey], ...Object.fromEntries(Object.entries(ANCIENT_FORGE[key]).filter(([k]) => k !== oldKey)) };
}
const GROWTH_COMBOS = {
  warrior: { name: ["\u6218\u610F\u56DE\u54CD", "Battle Echo"], from: "power", to: "slash", bonus: 0.35 },
  summoner: { name: ["\u7075\u5951\u8FFD\u51FB", "Soul Pursuit"], from: "soulbolt", to: "soulbolt", bonus: 0.3 },
  ice: { name: ["\u971C\u75D5\u805A\u5408", "Frost Convergence"], from: "icebolt", to: "blizzard", bonus: 0.3 },
  lightning: { name: ["\u5F15\u96F7\u56DE\u8DEF", "Thunder Circuit"], from: "chain", to: "storm", bonus: 0.3 },
  curse: { name: ["\u5492\u5370\u6536\u5272", "Hex Harvest"], from: "hex", to: "drain", bonus: 0.35 },
  swordsman: { name: ["\u5251\u75D5\u843D\u96E8", "Blademark Rain"], from: "triplecut", to: "swordrain", bonus: 0.3 },
  shadowblade: { name: ["\u88C2\u5F71\u8FDE\u88AD", "Rift Pursuit"], from: "shadowstep", to: "riftblade", bonus: 0.35 },
  stonewright: { name: ["\u5CA9\u7262\u5D29\u89E3", "Prison Collapse"], from: "stoneprison", to: "mountainfall", bonus: 0.3 }
};
const GROWTH_MATERIALS = ["fieldSalvage1", "fieldSalvage2", "fieldSalvage3"];
const GROWTH_SKILL_NAMES = { power: ["\u4F24\u5BB3\u5F3A\u5316", "Power Surge"], slash: ["\u88C2\u5730\u65A9", "Earthsplit Slash"], soulbolt: ["\u7075\u9B42\u5F39", "Soul Bolt"], icebolt: ["\u5BD2\u51B0\u7BAD", "Ice Lance"], blizzard: ["\u66B4\u98CE\u96EA", "Blizzard"], chain: ["\u8FDE\u9501\u96F7\u7535", "Chain Lightning"], storm: ["\u96F7\u66B4", "Thunderstorm"], hex: ["\u8BC5\u5492", "Hex"], drain: ["\u751F\u547D\u6C72\u53D6", "Life Drain"], triplecut: ["\u4E09\u6BB5\u65A9", "Triple Cut"], swordrain: ["\u5251\u96E8", "Sword Rain"], shadowstep: ["\u7A7F\u5F71", "Shadowstep"], riftblade: ["\u88C2\u5F71\u53CC\u5203", "Rift Blades"], stoneprison: ["\u5CA9\u7262", "Stone Prison"], mountainfall: ["\u5C71\u5D29", "Mountainfall"] };
function growthComboText(job, en = false) {
  const c = GROWTH_COMBOS[job];
  if (!c) return "";
  const a = GROWTH_SKILL_NAMES[c.from][en ? 1 : 0], b = GROWTH_SKILL_NAMES[c.to][en ? 1 : 0];
  return en ? `${a} \u2192 next ${b} within 10s: +${Math.round(c.bonus * 100)}% damage` : `${a} \u2192 10\u79D2\u5185\u4E0B\u4E00\u6B21${b}\u4F24\u5BB3+${Math.round(c.bonus * 100)}%`;
}
function growthTier(level) {
  return level < 10 ? 1 : level < 30 ? 2 : 3;
}
for (let q = 1; q <= 3; q++) for (const slot of Object.keys(GEAR_SLOTS)) {
  const key = `field_${slot}${q}`, base = GEAR[slot === "weapon" ? ["ironBroken", "ironSharp", "purifyHoly"][q - 1] : slot + q];
  GEAR[key] = { ...base, name: ["\u884C\u65C5", "\u730E\u9014", "\u68EE\u8A93"][q - 1] + { weapon: "\u5251", helmet: "\u5934\u76D4", armor: "\u62A4\u7532", wings: "\u7FBD\u7FFC" }[slot], en: ["Trail", "Hunt", "Forest Oath"][q - 1] + " " + { weapon: "Blade", helmet: "Helm", armor: "Armor", wings: "Wings" }[slot] };
  ANCIENT_FORGE[key] = { [GROWTH_MATERIALS[q - 1]]: slot === "weapon" ? 12 : slot === "armor" ? 10 : 8 };
}
for (const [job, c] of Object.entries(GROWTH_COMBOS)) for (const q of [2, 3]) {
  const key = `path_${job}${q}`;
  GEAR[key] = { ...GEAR[`field_weapon${q}`], name: c.name[0] + (q === 3 ? "\xB7\u68EE\u8A93" : ""), en: c.name[1] + (q === 3 ? " \xB7 Forest Oath" : ""), combo: job };
  ANCIENT_FORGE[key] = { [GROWTH_MATERIALS[q - 1]]: q === 2 ? 24 : 32 };
}
for (const [set, s] of Object.entries(GEAR_SETS)) for (let q = 2; q <= 6; q++) for (const slot of ["helmet", "armor", "wings"]) {
  const key = `set_${set}_${slot}${q}`;
  GEAR[key] = { ...GEAR[slot + q], set, name: s.name + GEAR_SLOTS[slot][0], en: s.en + " " + GEAR_SLOTS[slot][1] };
  ANCIENT_FORGE[key] = { [["", "crown", "rootHeart", "crystalShard", "royalSeal", "emptyCrown"][q - 1]]: 2, core: [0, 60, 100, 180, 250, 400][q - 1] };
}
const FORGE_MATERIAL_NAMES = { roughStone: ["\u5C71\u7EB9\u539F\u77F3", "Striated Rough"], roughDark: ["\u4E4C\u76AE\u539F\u77F3", "Darkskin Rough"], roughMoon: ["\u6708\u7EB9\u539F\u77F3", "Moonvein Rough"], oreCopper: ["\u8D64\u94DC\u77FF", "Copper Ore"], oreIron: ["\u4E4C\u94C1\u77FF", "Iron Ore"], oreMoon: ["\u6708\u8F89\u77FF", "Moonstone Ore"], royalSeal: ["\u738B\u57CE\u8A93\u5370", "Royal Oath Seal"], emptyCrown: ["\u7A7A\u51A0\u788E\u7247", "Empty Crown Fragment"], bone: ["\u517D\u9AA8", "Bone"], wood: ["\u53E4\u6728", "Ancient Wood"], stone: ["\u77F3\u6599", "Stone"], fang: ["\u7A74\u5C45\u517D\u7360\u7259", "Grox Fang"], spear: ["\u730E\u624B\u77DB\u5C16", "Hunter Spearhead"], totem: ["\u56FE\u817E\u788E\u7247", "Totem Fragment"], crown: ["\u914B\u957F\u51A0\u9970", "Chieftain Crown"], rootHeart: ["\u53E4\u6839\u4E4B\u5FC3", "Root Heart"], mossHide: ["\u82D4\u517D\u76AE", "Moss Hide"], thornSeed: ["\u8346\u68D8\u79CD\u5B50", "Thorn Seed"], crystalShard: ["\u6C34\u6676\u788E\u7247", "Crystal Shard"], metalCrystal: ["\u91D1\u6676", "Metal Crystal"], woodCrystal: ["\u6728\u6676", "Wood Crystal"], waterCrystal: ["\u6C34\u6676\u6838", "Water Crystal"], fireCrystal: ["\u706B\u6676", "Fire Crystal"], earthCrystal: ["\u571F\u6676", "Earth Crystal"] };
Object.assign(FORGE_MATERIAL_NAMES, { huntToken: ["\u72E9\u730E\u5370\u8BB0", "Hunt Seal"], fieldSalvage1: ["\u884C\u65C5\u6B8B\u6750", "Trail Salvage"], fieldSalvage2: ["\u730E\u9014\u6B8B\u6750", "Hunt Salvage"], fieldSalvage3: ["\u68EE\u8A93\u6B8B\u6750", "Forest Salvage"] });
for (const [theme, q, special, zh, en] of [["tribal", 2, "crown", "\u6208\u62C9\u4EC0", "Gorash"], ["root", 3, "rootHeart", "\u53E4\u6839", "Elderroot"], ["crystal", 4, "crystalShard", "\u4E94\u66DC", "Fivefold"]]) {
  for (const slot of ["weapon", "helmet", "armor", "wings"]) {
    const key = "forge_" + theme + "_" + slot, base = GEAR[slot === "weapon" ? q === 2 ? "fangBlade" : q === 3 ? "rootBlade" : "emperor" : slot + q];
    GEAR[key] = { ...base, name: zh + { weapon: "\u796D\u5203", helmet: "\u51A0\u76D4", armor: "\u5B88\u5FA1\u7532", wings: "\u7075\u7FFC" }[slot], en: en + " " + { weapon: "Ritual Blade", helmet: "Crown Helm", armor: "Wardplate", wings: "Spirit Wings" }[slot] };
    if (slot === "weapon") {
      GEAR[key].damage = Math.floor(base.damage * 0.95);
      GEAR[key].lifesteal = 0.02 * q;
      delete GEAR[key].execute;
    }
    if (slot === "helmet" || slot === "armor") {
      GEAR[key].health = Math.floor(base.health * 0.9);
      GEAR[key].reduction = (base.reduction || 0) + 0.01;
    }
    if (slot === "wings") {
      GEAR[key].speed = (base.speed || 0) + 0.01;
      GEAR[key].bonus = Math.max(0, (base.bonus || 0) - 0.01);
    }
    ANCIENT_FORGE[key] = { [special]: slot === "weapon" ? 3 : 2, bone: q * 10, wood: q * 10, stone: q * 10 };
    if (theme === "tribal") Object.assign(ANCIENT_FORGE[key], { totem: 1, ...slot === "weapon" ? { fang: 2 } : { spear: 2 } });
    if (theme === "root") Object.assign(ANCIENT_FORGE[key], slot === "weapon" || slot === "wings" ? { thornSeed: 2 } : { mossHide: 2 });
    if (theme === "crystal") Object.assign(ANCIENT_FORGE[key], { [{ weapon: "metalCrystal", helmet: "waterCrystal", armor: "earthCrystal", wings: "fireCrystal" }[slot]]: 1, woodCrystal: 1 });
    ANCIENT_FORGE_LEGACY[key] = { ...ANCIENT_FORGE[key] };
    ANCIENT_FORGE[key] = { [special]: slot === "weapon" ? 3 : 2, core: { tribal: 60, root: 100, crystal: 180 }[theme] * (slot === "weapon" ? 1.5 : 1) };
  }
}
Object.assign(GEAR, { courtVerdict: { ...GEAR.genesis, name: "\u971C\u70EC\u65AD\u4EE4\u5203", en: "Frostfire Edictbreaker", damage: 78e3, skillPower: 0.1, lifesteal: 0.07, execute: 0.2 }, courtOathArmor: { ...GEAR.armor6, name: "\u53CC\u76F8\u5B88\u8A93\u7532", en: "Twinphase Oathplate", hpPercent: 0.08, skillPower: 0.06, cooldown: 0.015 }, courtMantle: { ...GEAR.wings6, name: "\u971C\u70EC\u8A93\u7FFC", en: "Frostfire Oathwings", hpPercent: 0.05, skillPower: 0.06, cooldown: 0.02 } });
Object.assign(ANCIENT_FORGE, { courtVerdict: { edictCore: 3, forgeSigil: 2, core: 600 }, courtOathArmor: { edictCore: 2, forgeSigil: 2, core: 450 }, courtMantle: { edictCore: 2, forgeSigil: 3, core: 400 } });
Object.assign(GEAR, { skyVerdict: { ...GEAR.genesis, name: "\u5BC2\u96F7\u88C1\u661F\u5251", en: "Silent Storm Starblade", damage: 9e4, skillPower: 0.46 }, skyArmor: { ...GEAR.armor6, name: "\u5929\u7A79\u661F\u94E0", en: "Skyreach Starplate", hpPercent: 0.32 }, skyHelmet: { ...GEAR.helmet6, name: "\u5F15\u661F\u51A0\u5195", en: "Starcaller Circlet", cooldown: 0.1 } });
Object.assign(ANCIENT_FORGE, { skyVerdict: { skyCore: 3, stormSigil: 2, core: 750 }, skyArmor: { skyCore: 2, stormSigil: 3, core: 650 }, skyHelmet: { skyCore: 2, stormSigil: 2, core: 550 } });
Object.assign(FORGE_MATERIAL_NAMES, { skyCore: ["\u5BC2\u96F7\u661F\u6838", "Silent Storm Core"], stormSigil: ["\u96F7\u67A2\u5370\u8BB0", "Thunder Relay Sigil"] });
function craftAncientGear(p, key) {
  let recipe = Object.hasOwn(ANCIENT_FORGE, key) ? ANCIENT_FORGE[key] : void 0;
  if (!recipe) return "\u914D\u65B9\u4E0D\u5B58\u5728";
  if ((p.gear?.length || 0) >= 1e3) return "\u88C5\u5907\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650";
  const has = (cost) => Object.entries(cost).every(([k, n]) => Number.isSafeInteger(p.materials[k]) && p.materials[k] >= n);
  if (!has(recipe)) {
    const legacy = ANCIENT_FORGE_LEGACY[key];
    if (!legacy || !has(legacy)) return "\u5408\u6210\u6750\u6599\u4E0D\u8DB3";
    recipe = legacy;
  }
  const item = rollGearItem(key);
  for (const [k, n] of Object.entries(recipe)) p.materials[k] -= n;
  (p.gear ??= []).push(item);
  return null;
}
for (const [q, blade, zh, en, seal] of [[2, "fangBlade", "\u517D\u9AA8", "Bonebound", "hollowSeal2"], [3, "rootBlade", "\u788E\u9AA8", "Bonebreaker", "hollowSeal3"], [4, "emperor", "\u914B\u957F", "Chieftain", "hollowSeal4"]]) {
  GEAR["hollow_" + q + "_weapon"] = { ...GEAR[blade], name: zh + "\u88C2\u5203", en: en + " Cleaver", damage: Math.floor(GEAR[blade].damage * 0.95), lifesteal: 0.02, execute: 0.1 };
  GEAR["hollow_" + q + "_armor"] = { ...GEAR["armor" + q], name: zh + "\u5730\u7A74\u80F8\u7532", en: en + " Hollowplate", health: Math.floor(GEAR["armor" + q].health * 0.95), reduction: GEAR["armor" + q].reduction + 0.01 };
  ANCIENT_FORGE["hollow_" + q + "_weapon"] = { [seal]: 8 };
  ANCIENT_FORGE["hollow_" + q + "_armor"] = { [seal]: 6 };
  FORGE_MATERIAL_NAMES[seal] = [zh + "\u5730\u7A74\u5370\u8BB0", en + " Hollow Seal"];
}
function ancientCraftMaterials(kind, random = Math.random) {
  if (kind === "hourglass_regent") return { core: 700 };
  if (kind === "buried_marshal") return { core: 330 };
  if (kind === "sky_sovereign") return { skyCore: 1, core: 650 };
  if (kind === "thunder_warden") return { stormSigil: 1, core: 450 };
  if (kind === "frost_crowned") return { edictCore: 1, core: 550 };
  if (kind === "furnace_regent") return { forgeSigil: 1, core: 350 };
  if (kind === "starbound_heart") return { starCore: 1, core: 550 };
  if (kind === "immaculate_judge") return { verdictShard: 1, core: 550 };
  if (kind === "blight_lord") return { blightHeart: 1, core: 500 };
  if (kind === "oathknight" || kind === "emptyking") {
    const drops2 = {};
    if (random() < 0.8) drops2[kind === "oathknight" ? "royalSeal" : "emptyCrown"] = 1;
    if (random() < 0.35) drops2.core = kind === "emptyking" ? 400 : 250;
    return drops2;
  }
  const boss = kind === "lord" || kind === "rootwarden" || ["metal", "wood", "water", "fire", "earth"].some((e) => kind === "crystal_" + e);
  const drops = {};
  if (!boss) return drops;
  const scale = kind === "lord" ? 1 : kind === "rootwarden" ? 2 : 3;
  for (const k of ["bone", "wood", "stone"]) if (random() < 0.6) drops[k] = 10 * scale;
  if (random() < 0.8) {
    if (kind === "lord") Object.assign(drops, { crown: 1, totem: 1, fang: 2, spear: 2 });
    else if (kind === "rootwarden") Object.assign(drops, { rootHeart: 1, mossHide: 2, thornSeed: 2 });
    else {
      drops[kind.slice(8) + "Crystal"] = 1;
      drops.crystalShard = 1;
    }
  }
  if (random() < 0.35) drops.core = kind === "lord" ? 120 : kind === "rootwarden" ? 100 : 250;
  return drops;
}
function ensureAncientGear(p) {
  if (p.gear !== void 0 && p.gearAffixVersion === 2 && p.gear.every((i) => i.affixBonusVersion === 1)) return false;
  let changed = p.gearAffixVersion !== 2;
  if (p.gear === void 0) {
    const starter = rollGearItem("stoneRough");
    p.gear = [starter];
    p.gearEquipped = { weapon: starter.id };
    changed = true;
  }
  for (const item of p.gear) changed = grantGearBonusAffix(item) || changed;
  p.gearAffixVersion = 2;
  return changed;
}
function equippedGear(p, slot) {
  const item = p.gear?.find((i) => i.id === p.gearEquipped?.[slot]), d = item && gearDefinition(item.key);
  return d?.slot === slot && p.level >= GEAR_LEVELS[d.quality - 1] ? d : void 0;
}
function gearKeys(p) {
  return Object.fromEntries(Object.keys(GEAR_SLOTS).map((slot) => {
    const id = p.gearEquipped?.[slot], item = p.gear?.find((i) => i.id === id);
    return [slot, item && equippedGear(p, slot) ? item.key : ""];
  }));
}
function ancientGearStats(p) {
  let health2 = 0, reduction = 0, speed = 0, bonus = 0, hpPercent = 0, haste = 0, lifesteal = 0, cooldown = 0, pet = 0, slow = 0, skillBonus = 0, chainTargets = 0, slowedBonus = 0, petHealth = 0, tempo = 0, tempoCapacity = 0, bossSkill = 0, finisherSkill = 0;
  const sets = {};
  for (const slot of Object.keys(GEAR_SLOTS)) {
    const d = equippedGear(p, slot);
    if (!d) continue;
    if (d.quality >= 7) tempoCapacity += (d.quality === 8 ? 0.5 : 0.45) / 4;
    skillBonus += d.skillPower || 0;
    hpPercent += d.hpPercent || 0;
    cooldown += d.cooldown || 0;
    if (slot !== "weapon") {
      health2 += d.health || 0;
      reduction += d.reduction || 0;
      speed += d.speed || 0;
      bonus += d.bonus || 0;
      if (d.set) sets[d.set] = (sets[d.set] || 0) + 1;
    }
    const item = p.gear?.find((i) => i.id === p.gearEquipped?.[slot]);
    for (const v of item?.affixes || []) {
      const def = GEAR_AFFIXES[v.key];
      if (!def?.slots.includes(slot) || !Number.isFinite(v.value) || (def.quality || 0) > d.quality) continue;
      const n = Math.max(0, Math.min(def.max, v.value));
      switch (v.key) {
        case "astralTempo":
        case "primalTempo":
          tempo += n;
          break;
        case "starHunter":
          bossSkill += n;
          break;
        case "primalVerdict":
          finisherSkill += n;
          break;
        case "health":
          hpPercent += n;
          break;
        case "reduction":
          reduction += n;
          break;
        case "speed":
          speed += n;
          break;
        case "haste":
          haste += n;
          break;
        case "lifesteal":
          lifesteal += n;
          break;
        case "cooldown":
          cooldown += n;
          break;
        case "pet":
          pet += n;
          break;
        case "slow":
          slow += n;
          break;
      }
    }
  }
  if (sets.thunder >= 2) skillBonus += 0.05;
  if (sets.thunder >= 3) {
    skillBonus += 0.03;
    chainTargets = 1;
  }
  if (sets.frost >= 2) slow += 0.08;
  if (sets.frost >= 3) slowedBonus = 0.12;
  if (sets.blood >= 2) haste += 0.08;
  if (sets.blood >= 3) lifesteal += 0.03;
  if (sets.beast >= 2) pet += 0.12;
  if (sets.beast >= 3) {
    pet += 0.08;
    petHealth = 0.2;
  }
  if (sets.arcane >= 2) cooldown += 0.06;
  if (sets.arcane >= 3) {
    cooldown += 0.04;
    hpPercent += 0.05;
  }
  health2 += Math.floor(ancientBaseHealth(p.level) * Math.min(0.6, hpPercent));
  const jade = jadeBonuses(p);
  health2 += Math.floor((ancientBaseHealth(p.level) + health2) * jade.health);
  return { health: health2, jadeAttack: jade.attack, reduction: Math.min(0.6, reduction) + (1 - Math.min(0.6, reduction)) * jade.reduction, speed: Math.min(0.3, speed), bonus, haste: Math.min(0.2, haste), lifesteal: Math.min(0.05, lifesteal), cooldown: Math.min(0.5, Math.min(0.16, cooldown * 0.8) + Math.min(tempoCapacity, tempo)), bossSkill, finisherSkill, pet: Math.min(0.4, pet), slow: Math.min(0.2, slow), skillBonus, chainTargets, slowedBonus, petHealth, sets };
}
function ancientBaseHealth(level) {
  const l = Math.max(1, Number.isFinite(level) ? level : 1), anchors = [[1, 100], [5, 3e3], [10, 12e3], [30, 9e4], [50, 25e4], [60, 32e4], [80, 47e4], [100, 65e4]];
  for (let i = 1; i < anchors.length; i++) {
    const [a, h] = anchors[i - 1], [b, k] = anchors[i];
    if (l <= b) return Math.round(h * (l / a) ** (Math.log(k / h) / Math.log(b / a)));
  }
  return Math.round(65e4 * (l / 100) ** 3);
}
function ancientProfileHealth(p) {
  return ancientBaseHealth(p.level) + ancientGearStats(p).health;
}
function ancientLevelDamage(level) {
  return 1.25 ** Math.min(300, Math.max(0, level - 1));
}
function ancientBaseAttack(level) {
  const l = Math.max(1, Number.isFinite(level) ? level : 1), anchors = [[1, 25], [5, 125], [10, 400], [20, 800], [30, 2500], [40, 6e3], [50, 1e4], [60, 2e4], [70, 4e4], [80, 6e4], [90, 9e4], [100, 13e4]];
  for (let i = 1; i < anchors.length; i++) {
    const [a, h] = anchors[i - 1], [b, k] = anchors[i];
    if (l <= b) return Math.round(h * (l / a) ** (Math.log(k / h) / Math.log(b / a)));
  }
  return Math.round(l <= 150 ? 13e4 * (l / 100) ** 3 : 438750 * (l / 150) ** 4.5);
}
function ancientSkillDamage(p) {
  const s = ancientGearStats(p);
  return Math.floor(ancientBaseAttack(p.level) * (1 + s.bonus) * (1 + s.skillBonus) * (1 + s.jadeAttack));
}
for (const d of Object.values(GEAR)) {
  if (d.quality >= 7) continue;
  if (d.slot === "weapon") d.skillPower = [0.06, 0.22, 0.38, 0.4, 0.42, 0.45][d.quality - 1];
  if (d.slot === "armor") d.hpPercent = [0.1, 0.18, 0.24, 0.26, 0.28, 0.3][d.quality - 1];
  if (d.slot === "helmet") d.cooldown = [0.02, 0.05, 0.08, 0.08, 0.09, 0.1][d.quality - 1];
}
function ancientFieldReward(level, map, random = Math.random, kind = "") {
  if (!["tribe", "forest"].includes(map) || !Number.isInteger(level) || level < 1 || level > 60) return { drops: {}, gear: [] };
  const q = map === "tribe" ? Math.min(2, growthTier(level)) : 3, key = GROWTH_MATERIALS[q - 1], slot = ["weapon", "helmet", "armor", "wings"][Math.min(3, Math.floor(random() * 4))];
  const chance = kind.startsWith("crystal_wisp_") ? 5e-3 : 0.02;
  return { drops: { [key]: 1 }, gear: random() < chance ? [rollGearItem(`field_${slot}${q}`, random)] : [] };
}
function salvageAncientGear(p, id) {
  const item = p.gear?.find((i) => i.id === id), d = item && gearDefinition(item.key);
  if (!item || !d) return "\u88C5\u5907\u4E0D\u5B58\u5728";
  if (item.locked || Object.values(p.gearEquipped || {}).includes(id)) return "\u8BF7\u5148\u5378\u4E0B\u5E76\u89E3\u9501\u88C5\u5907";
  if (d.quality > 3) return "\u6B64\u88C5\u5907\u6682\u4E0D\u53EF\u5206\u89E3";
  const key = GROWTH_MATERIALS[d.quality - 1], amount = [2, 3, 4][d.quality - 1];
  if (!Number.isSafeInteger((p.materials[key] || 0) + amount)) return "\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650";
  p.gear = p.gear.filter((i) => i.id !== id);
  p.materials[key] = (p.materials[key] || 0) + amount;
  return null;
}
function ancientMeleeDamage(p) {
  const d = equippedGear(p, "weapon");
  if (!d) return 0;
  const s = ancientGearStats(p);
  return Math.floor((ancientBaseAttack(p.level) + (d.damage || 0)) * (1 + s.bonus) * (1 + s.jadeAttack));
}
function ancientMeleeInterval(p) {
  return (equippedGear(p, "weapon")?.interval || 600) * (1 - ancientGearStats(p).haste);
}
function equipAncientGear(p, slot, id) {
  if (!Object.hasOwn(GEAR_SLOTS, slot)) return "\u88C5\u5907\u69FD\u4E0D\u5B58\u5728";
  if (!id) {
    p.gearEquipped ??= {};
    delete p.gearEquipped[slot];
    return null;
  }
  const item = p.gear?.find((i) => i.id === id), d = item && gearDefinition(item.key);
  if (!d || d.slot !== slot) return "\u88C5\u5907\u4E0D\u5B58\u5728";
  if (p.level < GEAR_LEVELS[d.quality - 1]) return "\u73A9\u5BB6\u7B49\u7EA7\u4E0D\u8DB3";
  p.gearEquipped ??= {};
  p.gearEquipped[slot] = id;
  return null;
}
function ancientBossGearWeights(map) {
  const center = { tribe: 2, forest: 4, city: 5, blight: 6, sanctum: 6, starfall: 6, frostcourt: 6, skyreach: 6, dunes: 6 }[map] || 2;
  const weights = Array(8).fill(0);
  if (center === 2) {
    weights[0] = 30;
    weights[1] = 65;
    weights[2] = 4.5;
    weights[3] = 0.5;
  } else if (center === 6) {
    weights[3] = 5;
    weights[4] = 30;
    weights[5] = 65;
  } else {
    weights[center - 3] = 5;
    weights[center - 2] = 30;
    weights[center - 1] = 60;
    weights[center] = center === 5 ? 5 : 4.5;
    if (center < 5) weights[center + 1] = 0.5;
  }
  if (map === "frostcourt" || map === "skyreach" || map === "dunes") {
    weights[5] -= 0.35;
    weights[6] = 0.3;
    weights[7] = 0.05;
  }
  return weights;
}
function ancientGearLoot(kind, random = Math.random, level = 0, map) {
  if (map?.startsWith("community:")) return [];
  const maps = { buried_marshal: "dunes", hourglass_regent: "dunes", chief: "tribe", lord: "tribe", rootwarden: "forest", oathknight: "city", emptyking: "city", blight_lord: "blight", immaculate_judge: "sanctum", starbound_heart: "starfall", frost_crowned: "frostcourt", furnace_regent: "frostcourt", sky_sovereign: "skyreach", thunder_warden: "skyreach" };
  const home = maps[kind] || (["metal", "wood", "water", "fire", "earth"].some((e) => kind === "crystal_" + e) ? "forest" : "");
  if (!home) return [];
  const weights = ancientBossGearWeights(map || home), result = [];
  const quality = () => {
    let r = Math.max(0, Math.min(0.999999999, random())) * 100;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r < 0) return i + 1;
    }
    return 6;
  };
  for (const slot of ["weapon", "equipment"]) if (random() < 0.5) {
    const q = quality(), pool = Object.entries(GEAR).filter(([key, d]) => !Object.hasOwn(ANCIENT_FORGE, key) && d.quality === q && (slot === "weapon" ? d.slot === "weapon" : d.slot !== "weapon"));
    const setPool = Object.entries(GEAR).filter(([key, d]) => !Object.hasOwn(ANCIENT_FORGE, key) && d.set && d.quality === q);
    const choices = slot === "equipment" && setPool.length > 0 && q >= 2 && random() < 0.35 ? setPool : pool;
    if (choices.length) result.push(rollGearItem(choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))][0], random));
  }
  return result;
}
function gearName(key, en = false) {
  const d = gearDefinition(key);
  return d ? `[${GEAR_QUALITIES[d.quality - 1][en ? 1 : 0]}] ${en ? d.en : d.name}` : key;
}
function gearDescription(key, en = false) {
  const d = gearDefinition(key);
  if (!d) return "";
  const parts = [`${en ? "Required level" : "\u7A7F\u6234\u7B49\u7EA7"} ${GEAR_LEVELS[d.quality - 1]}`];
  for (const [k, zh, eng] of [["damage", "\u666E\u653B\u4F24\u5BB3", "Melee damage"], ["skillPower", "\u6280\u80FD\u5F3A\u5EA6", "Skill power"], ["hpPercent", "\u6700\u5927\u751F\u547D", "Max HP"], ["cooldown", "\u6280\u80FD\u51B7\u5374\u7F29\u51CF", "Skill cooldown reduction"], ["health", "\u751F\u547D", "HP"], ["reduction", "\u51CF\u4F24", "Damage reduction"], ["speed", "\u79FB\u901F", "Speed"], ["bonus", "\u6240\u6709\u4F24\u5BB3", "All damage"], ["lifesteal", "\u5438\u8840", "Lifesteal"]]) {
    const n = (d[k] || 0) * (k === "cooldown" ? 0.8 : 1);
    if (n) parts.push(`${en ? eng : zh} +${k === "damage" || k === "health" ? n.toLocaleString() : +(n * 100).toFixed(2) + "%"}`);
  }
  if (d.combo) {
    const c = GROWTH_COMBOS[d.combo];
    parts.push(growthComboText(d.combo, en));
  }
  if (d.slow) parts.push(en ? `Hits slow ${Math.round(d.slow * 100)}% for 2s (half on bosses)` : `\u547D\u4E2D\u51CF\u901F${Math.round(d.slow * 100)}%\uFF0C2\u79D2\uFF08\u5934\u76EE\u51CF\u534A\uFF09`);
  if (d.execute) parts.push(en ? `+${Math.round(d.execute * 100)}% damage below 30% enemy HP` : `\u654C\u4EBA\u8840\u91CF\u4F4E\u4E8E30%\u65F6\u4F24\u5BB3+${Math.round(d.execute * 100)}%`);
  if (d.interval) parts.push(`${en ? "Attack interval" : "\u653B\u51FB\u95F4\u9694"} ${d.interval / 1e3}s`);
  return parts.join(" \xB7 ");
}
export {
  ANCIENT_FORGE,
  ANCIENT_FORGE_LEGACY,
  FORGE_MATERIAL_NAMES,
  GEAR,
  GEAR_AFFIXES,
  GEAR_LEVELS,
  GEAR_QUALITIES,
  GEAR_SETS,
  GEAR_SLOTS,
  GROWTH_COMBOS,
  GROWTH_MATERIALS,
  GROWTH_SKILL_NAMES,
  ancientBaseAttack,
  ancientBaseHealth,
  ancientBossGearWeights,
  ancientCraftMaterials,
  ancientFieldReward,
  ancientGearLoot,
  ancientGearStats,
  ancientLevelDamage,
  ancientMeleeDamage,
  ancientMeleeInterval,
  ancientProfileHealth,
  ancientSkillDamage,
  craftAncientGear,
  ensureAncientGear,
  equipAncientGear,
  equippedGear,
  gearAffixDescription,
  gearDefinition,
  gearDescription,
  gearKeys,
  gearName,
  grantGearBonusAffix,
  growthComboText,
  growthTier,
  rollGearItem,
  salvageAncientGear
};
