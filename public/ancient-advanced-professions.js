// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const route = (id, name, ...skills) => ({ id, name, skills });
const ADVANCED_PROFESSIONS = {
  warrior: [
    route("berserker", ["\u72C2\u6218\u58EB", "Berserker"], ["\u55DC\u8840\u98DE\u5F39", "Bloodseeker Bolt"], ["\u732E\u796D", "Sacrifice"], ["\u51B2\u950B", "Charge"], ["\u6D74\u8840\u91CD\u751F", "Blood Rebirth"]),
    route("paladin", ["\u5723\u6218\u58EB", "Paladin"], ["\u51C0\u5316", "Purify"], ["\u5723\u5149\u6062\u590D", "Radiant Recovery"], ["\u5723\u5149\u9886\u57DF", "Sanctuary"], ["\u5BA1\u5224", "Judgment"])
  ],
  summoner: [
    route("spiritcaller", ["\u5723\u7075\u53EC\u5524\u5E08", "Spiritcaller"], ["\u53EC\u5524", "Call Guardian"], ["\u7075\u57DF", "Spirit Domain"], ["\u53D8\u8EAB", "Spirit Ascendant"], ["\u65B0\u751F", "Rebirth"]),
    route("beastlord", ["\u5951\u517D\u9886\u4E3B", "Beastlord"], ["\u7F14\u7EA6", "Bind Beast"], ["\u534F\u730E", "Coordinated Hunt"], ["\u62A4\u4E3B", "Guard Master"], ["\u88C2\u5730\u6251\u51FB", "Rending Pounce"])
  ],
  lightning: [
    route("stormcaller", ["\u5929\u96F7\u4F7F", "Stormcaller"], ["\u96F7\u5370", "Thunder Seal"], ["\u5F15\u96F7\u67F1", "Lightning Rod"], ["\u96F7\u4E91\u56DA\u7B3C", "Thundercloud Prison"], ["\u4E07\u96F7\u5929\u8BDB", "Heavenly Thunder"]),
    route("voltstalker", ["\u96F7\u5F71\u884C\u8005", "Voltstalker"], ["\u77AC\u96F7\u523A", "Volt Spike"], ["\u96F7\u5F71\u7A7F\u884C", "Volt Dash"], ["\u9006\u96F7\u62A4\u8EAB", "Countercharge"], ["\u75BE\u96F7\u65AD\u754C", "Thunder Break"])
  ],
  ice: [
    route("crystalist", ["\u971C\u6676\u672F\u58EB", "Frost Crystalist"], ["\u51B0\u6676\u5F39", "Crystal Bolt"], ["\u6676\u68F1\u6298\u5C04", "Prismatic Ice"], ["\u51BB\u88C2\u5E26", "Shatterfield"], ["\u4E07\u6676\u5D29\u843D", "Crystal Collapse"]),
    route("winterwarden", ["\u6781\u5BD2\u5B88\u671B\u8005", "Winter Warden"], ["\u5BD2\u67AA", "Glacial Spear"], ["\u51B0\u5792", "Ice Rampart"], ["\u96EA\u5E55\u5E87\u62A4", "Snow Veil"], ["\u51B0\u6CB3\u5C01\u754C", "Glacial Lock"])
  ],
  fire: [
    route("wildfire", ["\u71CE\u539F\u4F7F", "Wildfire Herald"], ["\u706B\u79CD", "Ember Seed"], ["\u63A8\u7130", "Flamefront"], ["\u5408\u7130", "Confluence"], ["\u711A\u5929\u9668\u661F", "Solar Cataclysm"]),
    route("hellfire", ["\u51A5\u7130\u672F\u58EB", "Hellfire Warlock"], ["\u51A5\u70EC", "Nether Ember"], ["\u5165\u9AA8\u4E4B\u706B", "Bonefire"], ["\u5F15\u70EC", "Ember Threads"], ["\u4E0D\u706D\u51A5\u706B", "Undying Flame"])
  ],
  curse: [
    route("hexweaver", ["\u707E\u5492\u7F16\u7EC7\u8005", "Hexweaver"], ["\u8870\u8D25\u5492", "Decay Hex"], ["\u5492\u7EBF", "Hex Tether"], ["\u707E\u75AB\u8FC1\u79FB", "Plague Transfer"], ["\u707E\u5492\u574D\u7F29", "Hex Collapse"]),
    route("pactbinder", ["\u547D\u5951\u672F\u58EB", "Pactbinder"], ["\u523B\u547D", "Life Brand"], ["\u7D22\u503A", "Reckoning"], ["\u9006\u5951", "Inverted Pact"], ["\u672B\u65E5\u5951\u7EA6", "Doom Pact"])
  ],
  swordsman: [
    route("blademaster", ["\u4E07\u5251\u5B97\u5E08", "Myriad Blademaster"], ["\u5FA1\u5251", "Flying Blade"], ["\u5251\u7F51", "Blade Net"], ["\u5316\u5251", "Sword Form"], ["\u5F3A\u5316", "Empower"]),
    route("linebreaker", ["\u7834\u9635\u5251\u58EB", "Linebreaker"], ["\u88C2\u7532\u65A9", "Sunder Armor"], ["\u8FDB\u6B65\u8FDE\u65A9", "Advancing Slashes"], ["\u67B6\u5251\u53CD\u65A9", "Guard Counter"], ["\u5F00\u9635\u5DE8\u5251", "Formation Breaker"])
  ],
  shadowblade: [
    route("shadowhunter", ["\u5F71\u72E9\u8005", "Shadow Hunter"], ["\u8FFD\u5F71\u5203", "Stalking Blade"], ["\u6362\u5F71", "Shadow Swap"], ["\u53CC\u5F71\u5939\u51FB", "Twin Ambush"], ["\u7FA4\u5F71\u8FFD\u730E", "Shadow Hunt"]),
    route("boundarycutter", ["\u65AD\u754C\u5BA2", "Boundary Cutter"], ["\u65AD\u754C\u5203", "Boundary Blade"], ["\u7A7F\u754C\u7A81\u88AD", "Boundary Assault"], ["\u88C2\u754C\u56DE\u65A9", "Rift Reprise"], ["\u65AD\u754C\u6740\u9635", "Boundary Execution"])
  ],
  stonewright: [
    route("mountainguard", ["\u5C71\u5CB3\u5B88\u536B", "Mountain Guard"], ["\u9707\u5CA9\u62F3", "Quake Fist"], ["\u5CA9\u7532", "Stone Armor"], ["\u5C71\u95E8", "Mountain Gate"], ["\u7FA4\u5C71\u5408\u62E2", "Closing Peaks"]),
    route("veinforger", ["\u5730\u8109\u94F8\u5E08", "Veinforger"], ["\u5927\u5730\u5E03\u9635", "Earth Formation"], ["\u98DE\u523A", "Piercing Spike"], ["\u7206\u7834", "Detonation"], ["\u8FDE\u9635", "Linked Formation"])
  ],
  elementalist: [
    route("elemental-god", ["\u4E07\u8C61\u6218\u795E", "God of Elements"], ["\u5143\u7D20\u70D9\u5370", "Elemental Brand"], ["\u5929\u8C61\u795E\u7F5A", "Skyfall Judgment"], ["\u4E07\u8C61\u4FB5\u8680", "Prismatic Erosion"], ["\u5143\u7D20\u593A\u6743", "Elemental Dominion"]),
    route("elemental-ward", ["\u56DB\u6781\u9547\u5B88\u8005", "Quarter Warden"], ["\u6362\u6781", "Attunement Shift"], ["\u9006\u6D41", "Countercurrent"], ["\u56DB\u6781\u7ED3\u754C", "Fourfold Ward"], ["\u5929\u5730\u5F52\u8861", "Equilibrium"])
  ],
  voidsword: [
    route("riftlord", ["\u88C2\u754C\u5251\u5C0A", "Rift Sovereign"], ["\u4E24\u754C\u65A9", "Twin-Realm Cut"], ["\u53CC\u754C\u7A81\u88AD", "Twin Rifts"], ["\u7834\u754C\u9886\u57DF", "Broken Boundary"], ["\u4E07\u754C\u7EC8\u7ED3", "Realm End"]),
    route("riftduelist", ["\u65E0\u95F4\u5251\u5BA2", "Rift Duelist"], ["\u65AD\u5F71", "Shadow Sever"], ["\u9519\u4F4D", "Displace"], ["\u7A7A\u5203\u53CD\u51FB", "Void Riposte"], ["\u5B64\u754C\u51B3\u6597", "Isolated Duel"])
  ],
  abyssal: [
    route("abyss-king", ["\u6DF1\u6E0A\u541B\u738B", "Abyssal King"], ["\u6DF1\u6E0A\u8840\u5370", "Abyssal Bloodmark"], ["\u566C\u9B42\u507F\u8840", "Soul Reclamation"], ["\u6DF1\u6E0A\u738B\u5EA7", "Abyssal Throne"], ["\u6DF1\u6E0A\u771F\u8EAB", "True Abyss"]),
    route("abyss-herald", ["\u8680\u754C\u5148\u77E5", "Abyssal Prophet"], ["\u5BC4\u8680", "Parasite"], ["\u79BB\u9B42", "Soul Fracture"], ["\u8680\u6F6E", "Corruption Tide"], ["\u4E07\u8680\u5F52\u6F6E", "Abyssal Convergence"])
  ],
  chrono: [
    route("time-sovereign", ["\u65F6\u5E8F\u4E3B\u5BB0", "Time Sovereign"], ["\u53CC\u523B\u88C2\u9699", "Double Rift"], ["\u65F6\u95F4\u5206\u8EAB", "Temporal Double"], ["\u751F\u547D\u951A\u70B9", "Life Anchor"], ["\u65F6\u5E8F\u88C1\u51B3", "Temporal Verdict"]),
    route("time-weaver", ["\u56E0\u679C\u7EC7\u8005", "Causality Weaver"], ["\u5EF6\u65F6\u5370\u8BB0", "Delayed Mark"], ["\u56E0\u679C\u8FDE\u7EBF", "Causal Link"], ["\u672A\u6765\u501F\u4F4D", "Borrowed Position"], ["\u56E0\u679C\u5012\u7F6E", "Causal Inversion"])
  ]
};
const ADVANCEMENT_KEYS = ["X", "Q", "Z", "C"];
function advancementCastKey(id) {
  return /^advanced:[XQZC]$/.test(id) ? id.slice(-1) : void 0;
}
const ADVANCEMENT_REWORK = {
  storm: { duration: 9e3, tick: 1e3, radius: 18, markDuration: 1e4, chance: 0.3, critical: 2.8, splash: 0.8, splashRadius: 7, tickPower: 1.6 },
  ember: { radius: 12, power: 6.5, transfer: 0.8, duration: 8e3 },
  rift: { duration: 11e3, bonus: 1, followup: 2.4, delay: 1e3, attackBuff: 0.35, speedBuff: 0.2 },
  life: { range: 50, duration: 15e3, buffDuration: 8e3, buff: 0.2 },
  verdict: { duration: 7e3, tick: 1e3, vulnerability: 0.4, min: (level) => 2.5 + level * 0.08, max: (level) => 5 + level * 0.16 },
  earth: { range: 50, duration: 45e3, limit: (level) => level * 2 + 5, radius: 2, tick: 1e3, tickPower: 0.85, linkDuration: 1e4, spacing: 2.5, innerRadius: 3, outerRadius: 7, innerPower: 8, outerPower: 3.5, pierce: 3, projectileSpeed: 55 },
  boundary: { markDuration: 8e3, markBonus: 0.3, fieldDuration: 6500, fieldTick: 1e3 }
};
export {
  ADVANCED_PROFESSIONS,
  ADVANCEMENT_KEYS,
  ADVANCEMENT_REWORK,
  advancementCastKey
};
