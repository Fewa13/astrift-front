// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const SKILL_CONTACT = { aimPadding: 0.75, areaPadding: 0.55, lanePadding: 0.45, slashRadius: 2.8, netFlightRadius: 3, netRadius: 5, smallNetRadius: 2.5, netDuration: 4e3, smallNetDuration: 2e3, netTick: 500 };
const families = {
  warrior: ["war-crescent", "war-ring", "war-lance", "war-comet"],
  summoner: ["soul-orb", "soul-ring", "soul-sigil", "soul-comet"],
  fire: ["flame-orb", "flame-ring", "flame-comet", "meteor-core"],
  ice: ["ice-shard", "ice-lance", "frost-ring", "ice-comet"],
  lightning: ["thunder-lance", "lightning-arc", "storm-ring", "thunder-sigil"],
  curse: ["hex-orb", "hex-sigil", "hex-ring", "hex-comet"],
  swordsman: ["jade-crescent", "jade-double", "jade-ring", "jade-lance"],
  shadowblade: ["shadow-crescent", "shadow-dart", "shadow-double", "shadow-ring"],
  stonewright: ["stone-shard", "stone-lance", "stone-ring", "stone-comet"],
  elementalist: ["prism-orb", "prism-sigil", "prism-ring", "prism-comet"],
  voidsword: ["void-crescent", "void-double", "void-ring", "void-lance"],
  abyssal: ["abyss-orb", "abyss-sigil", "abyss-ring", "abyss-comet"],
  chrono: ["time-sigil", "time-double", "time-ring", "time-comet"],
  necromancer: ["bone-shard", "bone-ring", "bone-sigil", "bone-comet"]
};
const routeFamilies = {
  berserker: ["blood-bolt", "blood-sigil", "blood-lance", "blood-ring"],
  paladin: ["radiant-orb", "radiant-ring", "radiant-sigil", "radiant-lance"],
  spiritcaller: ["soul-orb", "soul-ring", "soul-sigil", "soul-comet"],
  beastlord: ["stone-shard", "shadow-double", "soul-ring", "stone-comet"],
  stormcaller: ["thunder-sigil", "thunder-lance", "storm-ring", "thunder-comet"],
  voltstalker: ["lightning-arc", "thunder-lance", "thunder-sigil", "lightning-double"],
  crystalist: ["crystal-shard", "crystal-double", "crystal-ring", "crystal-comet"],
  winterwarden: ["ice-lance", "ice-shard", "frost-ring", "ice-comet"],
  wildfire: ["flame-orb", "flame-ring", "flame-sigil", "meteor-core"],
  hellfire: ["nether-orb", "nether-lance", "nether-ring", "nether-comet"],
  hexweaver: ["hex-orb", "hex-double", "hex-ring", "hex-sigil"],
  pactbinder: ["blood-sigil", "hex-lance", "blood-ring", "hex-comet"],
  blademaster: ["jade-crescent", "jade-ring", "jade-double", "jade-lance"],
  linebreaker: ["jade-crescent", "jade-double", "jade-lance", "jade-comet"],
  shadowhunter: ["shadow-dart", "shadow-crescent", "shadow-double", "shadow-ring"],
  boundarycutter: ["shadow-crescent", "shadow-lance", "shadow-double", "shadow-sigil"],
  mountainguard: ["stone-comet", "stone-ring", "stone-sigil", "stone-double"],
  veinforger: ["stone-sigil", "stone-lance", "stone-comet", "stone-ring"],
  "elemental-god": ["prism-orb", "prism-sigil", "prism-ring", "prism-comet"],
  "elemental-ward": ["prism-ring", "prism-double", "prism-sigil", "prism-comet"],
  riftlord: ["void-crescent", "void-double", "void-ring", "void-lance"],
  riftduelist: ["void-lance", "void-crescent", "void-double", "void-sigil"],
  "abyss-king": ["abyss-orb", "blood-sigil", "abyss-ring", "abyss-comet"],
  "abyss-herald": ["hex-shard", "abyss-double", "hex-ring", "abyss-sigil"],
  "time-sovereign": ["time-sigil", "time-double", "time-ring", "time-comet"],
  "time-weaver": ["time-orb", "time-double", "time-sigil", "time-ring"]
};
const routeColors = { paladin: [14993006, 16771774], beastlord: [11768164, 15067310], voltstalker: [8944361, 12970495], hellfire: [14632828, 16758138], pactbinder: [12078473, 15184617], boundarycutter: [15044526, 13023219], riftduelist: [8230889, 13293823], "abyss-herald": [10253267, 9102015], "time-weaver": [7135183, 13087218] };
const palettes = { warrior: [15291728, 16763022], summoner: [5561524, 12910572], fire: [16742702, 16765292], ice: [7395573, 13889535], lightning: [9416703, 14151167], curse: [11363817, 15316717], swordsman: [4841361, 12712920], shadowblade: [9597655, 15316199], stonewright: [11897431, 15911815], elementalist: [6019278, 16761203], voidsword: [10190319, 13814015], abyssal: [13913718, 16755082], chrono: [15910508, 11134956], necromancer: [8051074, 12760303] };
function skillFlight(job, key, route = "") {
  const slot = Math.max(0, "XQZC".indexOf(key)), list = families[job] || families.summoner;
  const shape = routeFamilies[route]?.[slot] || list[slot];
  const colors = routeColors[route] || palettes[job] || palettes.summoner;
  return { shape, color: colors[0], trim: colors[1], radius: shape.includes("crescent") || shape.includes("double") && /^(jade|void|shadow)/.test(shape) ? SKILL_CONTACT.slashRadius : shape.includes("ring") || shape.includes("sigil") ? 1.1 : 0.7, speed: 40, slot };
}
const projectileSkills = /* @__PURE__ */ new Set(["slash", "soulbolt", "icebolt", "frostburst", "blizzard", "chain", "storm", "hex", "drain", "doom", "firebolt", "firewave", "firestorm", "inferno", "tempest", "swordwave", "triplecut", "swordrain", "phantomblade", "riftblade", "stonefist", "faultline", "stoneprison", "mountainfall", "prism", "judgment", "erosion", "voidslash", "abysstouch", "devour", "temporalrift"]);
const projectileRoutes = { berserker: "X", paladin: "C", stormcaller: "XC", voltstalker: "X", crystalist: "XQC", wildfire: "X", hellfire: "XQZ", hexweaver: "XQZC", pactbinder: "XQC", linebreaker: "XQC", shadowhunter: "X" };
function isTravelingSkill(id, route = "") {
  return id.startsWith("advanced:") ? /^advanced:[XQZC]$/.test(id) && !!projectileRoutes[route]?.includes(id.slice(-1)) : projectileSkills.has(id);
}
export {
  SKILL_CONTACT,
  isTravelingSkill,
  projectileRoutes,
  projectileSkills,
  skillFlight
};
