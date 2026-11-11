// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const DEFAULT_SKIN = "wanderer";
const SKIN_RARITIES = [["\u666E\u901A", "Common"], ["\u7A00\u6709", "Rare"], ["\u53F2\u8BD7", "Epic"], ["\u4F20\u8BF4", "Legendary"], ["\u795E\u8BDD", "Mythic"], ["\u8D85\u5723", "Transcendent"]];
const SKIN_COLORS = ["#c3c9c4", "#5bb8df", "#ac75ec", "#ffca5b", "#ee6b99", "#e7f9ff"];
const designs = [
  ["wanderer", "\u884C\u65C5\u8005", "Wanderer", 0, 6378823, 12887161, 4540490, "plain"],
  ["reed", "\u82C7\u539F\u65A5\u5019", "Reed Scout", 1, 4216647, 10192987, 3488560, "hood"],
  ["caravan", "\u8D64\u7802\u5546\u65C5", "Red Dune Caravaner", 1, 8801589, 14723682, 4733245, "scarf"],
  ["shore", "\u6F6E\u5CB8\u5B88\u536B", "Tidewatch Guard", 1, 3496050, 8696766, 3226187, "guard"],
  ["briar", "\u8346\u51A0\u730E\u624B", "Briar Hunter", 2, 4085835, 11650947, 3356486, "thorn"],
  ["smoke", "\u70DF\u7070\u5251\u5BA2", "Ash Duelist", 2, 5324892, 14197167, 2630967, "coat"],
  ["kiln", "\u7089\u5FC3\u5DE5\u5320", "Kiln Smith", 2, 5651513, 15240008, 3224375, "smith"],
  ["sun", "\u65E5\u8F6E\u9A91\u58EB", "Sunwheel Knight", 3, 8739139, 15647334, 4599868, "sun"],
  ["glacier", "\u51B0\u5DDD\u884C\u8005", "Glacier Walker", 3, 4286082, 11856373, 3358564, "crystal"],
  ["jackal", "\u91D1\u9762\u80E1\u72FC", "Gilded Jackal", 3, 4472144, 14333807, 2762547, "jackal"],
  ["moon", "\u6708\u8680\u884C\u8005", "Eclipse Walker", 4, 3352144, 12887279, 2104372, "moon"],
  ["phoenix", "\u6731\u7130\u795E\u4F7F", "Vermilion Herald", 4, 9189954, 16032082, 4793915, "feather"],
  ["sea", "\u6DF1\u6D77\u541B\u738B", "Abyssal Regent", 4, 2509911, 7460038, 2503490, "crown"],
  ["star", "\u661F\u95E8\u5B88\u671B\u8005", "Stargate Sentinel", 5, 3355987, 11135487, 2106175, "orbit"],
  ["ivory", "\u767D\u66DC\u88C1\u51B3\u8005", "Ivory Arbiter", 5, 11576974, 16768933, 4866388, "ivory"],
  ["void", "\u865A\u7A7A\u7EC7\u8005", "Void Weaver", 5, 3746384, 14788348, 2366517, "void"]
];
const ANCIENT_SKINS = designs.map(([id, zh, en, rarity, cloth, accent, boots, style]) => ({ id, zh, en, rarity, cloth, accent, boots, style }));
function ownedAncientSkins(profile) {
  const unlocked = /* @__PURE__ */ new Set([DEFAULT_SKIN, ...profile.ancientSkins || []]);
  return ANCIENT_SKINS.filter((skin) => unlocked.has(skin.id)).map((skin) => skin.id);
}
function equippedAncientSkin(profile) {
  const id = profile.ancientSkinByJob?.[profile.profession || "adventurer"] || profile.ancientSkin;
  return id && ownedAncientSkins(profile).includes(id) ? id : DEFAULT_SKIN;
}
const SKIN_PROFESSIONS = {
  warrior: { zh: "\u6218\u58EB", en: "Warrior", cloth: 7816763, accent: 14657395 },
  summoner: { zh: "\u53EC\u5524\u5E08", en: "Summoner", cloth: 4551006, accent: 10412707 },
  ice: { zh: "\u51B0\u96EA\u6CD5\u5E08", en: "Frost Mage", cloth: 4486033, accent: 12120063 },
  lightning: { zh: "\u96F7\u7535\u6CD5\u5E08", en: "Lightning Mage", cloth: 4800131, accent: 16768888 },
  curse: { zh: "\u8BC5\u5492\u6CD5\u5E08", en: "Curse Mage", cloth: 5649494, accent: 15700168 },
  swordsman: { zh: "\u5251\u672F\u5E08", en: "Swordmaster", cloth: 3565402, accent: 10873552 },
  shadowblade: { zh: "\u5F71\u5203\u884C\u8005", en: "Shadowblade", cloth: 3619144, accent: 11247584 },
  stonewright: { zh: "\u5CA9\u94F8\u5E08", en: "Stonewright", cloth: 7953210, accent: 16761219 }
};
function ancientProfessionSkins(profession) {
  const job = profession && Object.hasOwn(SKIN_PROFESSIONS, profession) ? profession : void 0;
  const theme = job && SKIN_PROFESSIONS[job];
  if (!theme) return ANCIENT_SKINS.map((skin) => ({ ...skin, profession: "adventurer" }));
  return ANCIENT_SKINS.map((skin) => ({
    ...skin,
    profession: job,
    zh: theme.zh + " \xB7 " + (skin.rarity ? skin.zh : "\u5B66\u5F92\u670D"),
    en: theme.en + " \xB7 " + (skin.rarity ? skin.en : "Apprentice"),
    cloth: theme.cloth,
    accent: skin.rarity >= 2 ? skin.accent : theme.accent
  }));
}
export {
  ANCIENT_SKINS,
  DEFAULT_SKIN,
  SKIN_COLORS,
  SKIN_PROFESSIONS,
  SKIN_RARITIES,
  ancientProfessionSkins,
  equippedAncientSkin,
  ownedAncientSkins
};
