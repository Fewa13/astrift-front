// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { BESTIARY } from "./ancient-bestiary.js";
const BESTIARY_HUNTS = [
  ["tok-hunt", "tribe", 1, "tok", "bone_shield", "\u4ECE\u6B63\u9762\u4E3E\u76FE\u65F6\u7ED5\u4FA7\u9762\uFF0C\u6216\u7B49\u5B83\u653E\u4E0B\u76FE\u51FA\u62DB\u3002", "Flank its raised shield, or strike while it lowers the shield to attack."],
  ["tok-chief", "tribe", 1, "tok", "wasteland_runner", "\u5B83\u4F4E\u5934\u540E\u4F1A\u6CBF\u76F4\u7EBF\u51B2\u649E\uFF0C\u8EB2\u5F00\u540E\u53EF\u4EE5\u53CD\u51FB\u3002", "It lowers its head before a straight charge. Dodge aside and counterattack."],
  ["tribe-recovery-smalltotemseal", "tribe", 1, "watchman", "totem_priest", "\u796D\u53F8\u5728\u5F3A\u5316\u9644\u8FD1\u7684\u517D\u7FA4\uFF0C\u5148\u5207\u65AD\u63F4\u52A9\u3002", "The priests strengthen nearby beasts. Cut off their support first."],
  ["raka-gorash", "tribe", 2, "raka", "bone_javelin", "\u6295\u624B\u4F1A\u5728\u51FA\u624B\u540E\u6362\u4F4D\uFF0C\u9AA8\u77DB\u80FD\u4FA7\u79FB\u8EB2\u5F00\u3002", "Javeliners reposition after throwing. Sidestep their spears."],
  ["mira-trace", "forest", 0, "mira", "branch_panther", "\u7559\u610F\u730E\u8C79\u538B\u4F4E\u8EAB\u4F53\u7684\u52A8\u4F5C\uFF0C\u6251\u7A7A\u540E\u5B83\u4F1A\u505C\u987F\u3002", "Watch the panther crouch before pouncing. A missed pounce leaves it exposed."],
  ["sentinels-twelve", "forest", 2, "sen", "parasite_bloom", "\u82B1\u5996\u7684\u85E4\u8513\u6B63\u5728\u6CBB\u7597\u517D\u7FA4\uFF0C\u627E\u5230\u8FDE\u63A5\u7684\u6E90\u5934\u3002", "The bloom\u2019s vines heal nearby creatures. Find and defeat the source."],
  ["sentinels-twelve", "forest", 2, "sen", "crystal_wisp_metal", "\u5E7C\u6676\u7075\u5728\u4E94\u5EA7\u796D\u575B\u9644\u8FD1\u6D3B\u52A8\uFF0C\u89C2\u5BDF\u4E0D\u540C\u5143\u7D20\u7684\u653B\u51FB\u3002", "Crystal wisps gather near the five altars. Watch their different elemental attacks."],
  ["city-watchman", "city", 0, "veya", "oath_cavalry", "\u9A91\u5175\u51B2\u950B\u524D\u4F1A\u4EAE\u8D77\u8DEF\u7EBF\uFF1B\u907F\u5F00\uFF0C\u8BA9\u969C\u788D\u7269\u963B\u6321\u5B83\u3002", "Its charge route lights up in advance. Dodge and let obstacles stop it."],
  ["city-captain", "city", 1, "aron", "chain_jailer", "\u770B\u5230\u5B83\u62AC\u8D77\u94A9\u5B50\u5C31\u51C6\u5907\u95EA\u907F\u3002\u94A9\u5B50\u51FA\u624B\u540E\u4E0D\u518D\u8FFD\u8E2A\u4F60\u3002", "Dodge when it raises its hook. Once thrown, the hook does not track you."],
  ["city-knight-brief", "city", 2, "eira", "hollow_noble", "\u80F8\u53E3\u6709\u5B8C\u6574\u91D1\u8272\u7EB9\u7AE0\u7684\u624D\u662F\u771F\u8EAB\uFF0C\u5E7B\u5F71\u5F88\u8106\u5F31\u3002", "The true noble bears an intact golden chest crest. Its echoes are fragile."],
  ["blight-crystals", "blight", 2, "lyra", "brokenwing", "\u9B54\u79BD\u4FEF\u51B2\u540E\u4F1A\u843D\u5730\uFF0C\u6293\u4F4F\u5B83\u6536\u8D77\u7FC5\u8180\u7684\u65F6\u673A\u3002", "The fiend lands after diving. Strike while its wings are folded."],
  ["blight-lord", "blight", 2, "lyra", "shade_prowler", "\u9ED1\u5F71\u6709\u5730\u9762\u8F68\u8FF9\uFF0C\u73B0\u8EAB\u540E\u624D\u4F1A\u6251\u51FB\uFF1B\u4E0D\u8981\u76F2\u8FFD\u3002", "Its shadow leaves a visible trail. It emerges before pouncing. Do not chase blindly."],
  ["sanctum-wraiths", "sanctum", 1, "lumen", "refract_twin", "\u53CC\u751F\u8005\u9760\u8FD1\u65F6\u4F1A\u8FDE\u63A5\uFF0C\u62C9\u5F00\u5B83\u4EEC\u5C31\u80FD\u524A\u5F31\u9632\u62A4\u3002", "Twins link when close together. Separate them to weaken their protection."],
  ["sanctum-wardens", "sanctum", 2, "seraph", "light_deacon", "\u5149\u73AF\u79FB\u52A8\u4E0D\u5FEB\uFF0C\u8DF3\u8FC7\u53BB\u6216\u4ECE\u7F3A\u53E3\u901A\u8FC7\u3002", "The light ring moves slowly. Jump over it or pass through its gap."]
];
function bestiaryQuestSteps(before, map, _region, npc, kind, zh, en) {
  const def = BESTIARY[kind], kinds = kind.startsWith("crystal_wisp") ? Object.keys(BESTIARY).filter((k) => k.startsWith("crystal_wisp")) : [kind];
  return [{ id: "bestiary-" + kind + "-brief", title: ["\u65B0\u7684\u5A01\u80C1\uFF1A" + def.name, "New Threat: " + def.en], goal: ["\u4E0E\u6307\u5B9A\u4EBA\u7269\u4EA4\u8C08", "Talk to the marked character"], kind: "talk", map, npc, dialogue: [zh + " \u5E2E\u6211\u4EEC\u51FB\u8D2520\u4E2A\uFF0C\u518D\u7EE7\u7EED\u524D\u8FDB\u3002", en + " Defeat 20 before moving on."], reply: ["\u6211\u6765\u5904\u7406", "I will handle it."] }, { id: "bestiary-" + kind + "-hunt", title: ["\u6E05\u7406" + def.name, "Defeat " + def.en], goal: ["\u51FB\u8D2520\u4E2A" + (kind.startsWith("crystal_wisp") ? "\u5E7C\u6676\u7075" : def.name), "Defeat 20 " + (kind.startsWith("crystal_wisp") ? "Crystal Wisps" : def.en)], kind: "kill", map, kinds, count: 20, reward: { xpFraction: 0.01 } }];
}
export {
  BESTIARY_HUNTS,
  bestiaryQuestSteps
};
