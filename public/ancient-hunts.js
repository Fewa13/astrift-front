// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const HUNTS = [
  { id: "quarry", name: "\u8FFD\u730E\u51F6\u517D", en: "Track the Ravager", level: 10, kind: "contract", description: ["\u6E05\u9664\u65A5\u5019\uFF0C\u8FCE\u6218\u8FFD\u6765\u7684\u88C2\u9AA8\u51F6\u517D\u3002", "Defeat the scouts, then face the pursuing ravager."] },
  { id: "encircle", name: "\u7CBE\u82F1\u56F4\u730E", en: "Elite Encirclement", level: 15, kind: "contract", description: ["\u7A81\u7834\u8FDC\u8FD1\u6DF7\u5408\u7684\u4E24\u6CE2\u56F4\u730E\uFF0C\u518D\u51FB\u8D25\u730E\u961F\u9996\u9886\u3002", "Break two mixed melee/ranged packs, then defeat their huntmaster."] },
  { id: "beacon", name: "\u5B88\u536B\u8425\u5730", en: "Hold the Beacon", level: 15, kind: "contract", description: ["\u5B88\u4F4F\u8425\u5730\u4FE1\u6807\uFF0C\u51FB\u9000\u4E09\u6CE2\u88AD\u51FB\uFF1B\u7A81\u88AD\u8005\u4F1A\u76F4\u63A5\u653B\u51FB\u4FE1\u6807\u3002", "Protect the camp beacon through three waves. Raiders attack the beacon itself."] },
  { id: "karok", name: "\u88C2\u9AA8\xB7\u5361\u6D1B\u514B", en: "Karok, Bonebreaker", level: 20, kind: "nemesis", description: ["\u56FE\u817E\u91CD\u51FB\u4E0E\u6247\u5F62\u6A2A\u626B\uFF1B\u8FDB\u9636\u52A0\u5165\u843D\u70B9\u8FFD\u51FB\uFF0C\u5927\u5E08\u53EC\u6765\u63F4\u519B\u3002", "Totem slams and sweeping blows. Higher ranks add marked strikes, then reinforcements."] },
  { id: "serahn", name: "\u8346\u51A0\xB7\u745F\u62C9\u6069", en: "Serahn, Thorncrown", level: 40, kind: "nemesis", description: ["\u6839\u8109\u91CD\u51FB\u4E0E\u8346\u68D8\u9886\u57DF\uFF1B\u8FDB\u9636\u52A0\u5165\u843D\u70B9\u8FFD\u51FB\uFF0C\u5927\u5E08\u53EC\u6765\u63F4\u519B\u3002", "Root slams and thorn fields. Higher ranks add marked strikes, then reinforcements."] }
];
const HUNT_RANKS = [["\u521D\u9047", "First Encounter"], ["\u8FFD\u51FB", "Pursuit"], ["\u51B3\u6218", "Final Confrontation"]];
const HUNT_SLOTS = { weapon: ["\u6B66\u5668", "Weapon"], helmet: ["\u5934\u76D4", "Helmet"], armor: ["\u62A4\u7532", "Armor"], wings: ["\u7FBD\u7FFC", "Wings"] };
function huntDefinition(id) {
  return HUNTS.find((h) => h.id === id);
}
function huntLevel(id, rank = 0) {
  const h = huntDefinition(id);
  return h ? h.level + (h.kind === "nemesis" ? [0, 10, 25][rank] || 0 : 0) : 0;
}
function huntQuality(level) {
  return level < 30 ? 2 : 3;
}
function huntTokens(h) {
  return huntDefinition(h.id)?.kind === "nemesis" ? 3 + h.rank : 2;
}
function nemesisGearQuality(rank, level, random = Math.random) {
  const roll = random();
  return roll < 0.3 ? 1 : roll < 0.42 ? 2 : rank >= 1 && level >= 30 && roll < 0.45 ? 3 : 0;
}
const RELICS = [
  { id: "warrior", name: "\u6218\u543C\u4F59\u950B", en: "Warcry Echo", effect: ["\u88C2\u5730\u65A9\u547D\u4E2D\u540E\uFF0C\u539F\u843D\u70B9\u57280.6\u79D2\u540E\u4EA7\u751F\u4E00\u6B2135%\u5A01\u529B\u7684\u56DE\u54CD\u3002", "Ground Slash leaves a 35%-power echo at its impact after 0.6s."] },
  { id: "summoner", name: "\u5954\u730E\u517D\u5951", en: "Pursuer Pact", effect: ["\u7075\u9B42\u5F39\u547D\u4E2D\u540E\uFF0C\u53EC\u5524\u517D\u83B7\u5F974\u79D2\u8FFD\u730E\u52A0\u901F\uFF0C\u5E76\u5728\u547D\u4E2D\u70B9\u4EA7\u751F\u4E00\u6B2135%\u5A01\u529B\u7684\u517D\u9B42\u51B2\u51FB\u3002", "Soul Bolt grants your summon 4s of pursuit speed and a 35%-power spirit impact at the target."] },
  { id: "ice", name: "\u7559\u971C\u4E4B\u773C", en: "Eye of Lingering Frost", effect: ["\u51B0\u971C\u5F39\u5728\u547D\u4E2D\u70B9\u7559\u4E0B3\u79D2\u971C\u57DF\uFF0C\u6BCF\u79D2\u9020\u6210\u666E\u653B\u6280\u80FD\u57FA\u7840\u5A01\u529B\u768415%\u4F24\u5BB3\u5E76\u51CF\u901F\u3002", "Ice Bolt leaves a 3s frost field, dealing 15% of skill attack power each second and slowing enemies."] },
  { id: "lightning", name: "\u84C4\u96F7\u68F1\u6676", en: "Stormcharge Prism", effect: ["\u8FDE\u9501\u96F7\u7535\u7559\u4E0B8\u79D2\u96F7\u5370\uFF1B\u4E0B\u4E00\u4E2A\u5176\u4ED6\u4F24\u5BB3\u6280\u80FD\u547D\u4E2D\u540E\u5F15\u7206\u96F7\u5370\uFF0C\u9020\u6210\u8BE5\u6B21\u4F24\u5BB335%\u7684\u5C0F\u8303\u56F4\u51B2\u51FB\u3002", "Chain Lightning marks enemies for 8s. Your next different damaging skill detonates each hit mark for a small 35%-power blast."] },
  { id: "curse", name: "\u8513\u5492\u4E4B\u9875", en: "Page of Contagion", effect: ["\u6C72\u53D6\u547D\u4E2D\u88AB\u8BC5\u5492\u524A\u5F31\u7684\u654C\u4EBA\u65F6\uFF0C\u5C0635%\u4F24\u5BB3\u4E0E\u524A\u5F31\u4F20\u64AD\u7ED9\u9644\u8FD1\u6700\u591A2\u540D\u654C\u4EBA\u3002", "Drain spreads 35% damage and weakness from a hexed enemy to up to 2 nearby foes."] },
  { id: "swordsman", name: "\u9010\u5F71\u5251\u5323", en: "Pursuing Sword Casket", effect: ["\u5251\u96E8\u6539\u4E3A\u8DDF\u968F\u9501\u5B9A\u76EE\u6807\uFF0C\u516D\u8F6E\u5251\u96E8\u9010\u8F6E\u91CD\u65B0\u5224\u5B9A\u76EE\u6807\u9644\u8FD1\u654C\u4EBA\uFF1B\u76EE\u6807\u6B7B\u4EA1\u540E\u843D\u5728\u6700\u540E\u4F4D\u7F6E\u3002", "Sword Rain follows its target and checks nearby foes on each of its six strikes; on death it stays at the last location."] },
  { id: "shadowblade", name: "\u6B8B\u5F71\u88C2\u7247", en: "Afterimage Shard", effect: ["\u6697\u5F71\u7A81\u88AD\u5728\u8D77\u70B9\u7559\u4E0B\u6B8B\u5F71\uFF0C0.8\u79D2\u540E\u7206\u53D1\u4E00\u6B2150%\u6280\u80FD\u653B\u51FB\u529B\u7684\u88C2\u9699\u4F24\u5BB3\u3002", "Shadow Step leaves an afterimage at its origin, bursting after 0.8s for 50% of skill attack power."] },
  { id: "stonewright", name: "\u590D\u9707\u5CA9\u5FC3", en: "Aftershock Heart", effect: ["\u5CA9\u7262\u843D\u70B9\u57281.5\u79D2\u540E\u518D\u6B21\u9707\u8361\uFF0C\u9020\u621060%\u6280\u80FD\u653B\u51FB\u529B\u7684\u8303\u56F4\u4F24\u5BB3\u3002", "Stone Prison creates a second area shock after 1.5s for 60% of skill attack power."] }
];
const RELIC_COST = 8;
function activeRelic(p) {
  return p.relic && p.relic === p.profession && p.relics?.includes(p.relic) ? p.relic : void 0;
}
export {
  HUNTS,
  HUNT_RANKS,
  HUNT_SLOTS,
  RELICS,
  RELIC_COST,
  activeRelic,
  huntDefinition,
  huntLevel,
  huntQuality,
  huntTokens,
  nemesisGearQuality
};
