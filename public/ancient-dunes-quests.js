// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { mapChapterNPCs } from "./ancient-geography.js";
const DUNES_NPCS = {
  tamari: { name: "\u5854\u739B\u8389", en: "Tamari", map: "dunes", x: -9, z: 18, role: ["\u7802\u6D77\u5411\u5BFC", "Sandsea Guide"] },
  izar: { name: "\u4F0A\u624E\u5C14", en: "Izar", map: "dunes", x: 10, z: 110, role: ["\u5931\u843D\u57CE\u5320", "Lost-city Mason"] },
  nahla: { name: "\u5A1C\u8D6B\u62C9", en: "Nahla", map: "dunes", x: -12, z: 205, role: ["\u65E5\u5F71\u8BB0\u5F55\u8005", "Keeper of Sundials"] },
  duneelder: { name: "\u963F\u82CF\u5C14", en: "Asur", map: "dunes", x: 10, z: 300, role: ["\u6700\u540E\u7684\u5B88\u949F\u4EBA", "Last Keeper of the Hourglass"] },
  dunecompassseal: { name: "\u98CE\u8680\u8DEF\u7891", en: "Windworn Waystone", map: "dunes", x: 8, z: 68, role: ["\u8DEF\u7891", "Waystone"] },
  dunewellseal: { name: "\u57CB\u6C99\u6C34\u4E95", en: "Sand-choked Well", map: "dunes", x: -8, z: 155, role: ["\u4FEE\u590D\u6C34\u4E95", "Restore the Well"] },
  dunesun1seal: { name: "\u9ECE\u660E\u5F71\u9488", en: "Dawn Gnomon", map: "dunes", x: -12, z: 225, role: ["\u65E5\u5F71\u673A\u5173", "Sunshadow Device"] },
  dunesun2seal: { name: "\u6B63\u5348\u5F71\u9488", en: "Noon Gnomon", map: "dunes", x: 12, z: 245, role: ["\u65E5\u5F71\u673A\u5173", "Sunshadow Device"] },
  dunesun3seal: { name: "\u9EC4\u660F\u5F71\u9488", en: "Dusk Gnomon", map: "dunes", x: 0, z: 270, role: ["\u65E5\u5F71\u673A\u5173", "Sunshadow Device"] },
  dunegateseal: { name: "\u66AE\u6C99\u5C01\u95E8", en: "Duskglass Seal", map: "dunes", x: -10, z: 320, role: ["\u89E3\u5C01\u88C5\u7F6E", "Unsealing Device"] }
};
mapChapterNPCs(DUNES_NPCS);
const reward = { xpFraction: 9e-3 }, talk = (id, npc, title, dialogue) => ({ id: "dunes-" + id, title, goal: ["\u4EA4\u8C08", "Talk"], kind: "talk", map: npc === "skyaster" ? "skyreach" : "dunes", npc, dialogue, reply: ["\u7EE7\u7EED", "Continue"], reward });
const kill = (id, kind, count, region, title) => ({ id: "dunes-" + id, title, goal: [`\u51FB\u8D25${count}\u4E2A\u654C\u4EBA`, `Defeat ${count} enemies`], kind: "kill", map: "dunes", kinds: [kind], count, region, reward });
const DUNES_QUESTS = [
  talk("signal", "skyaster", ["\u96F7\u58F0\u4E4B\u540E", "After the Thunder"], ["\u6062\u590D\u7684\u661F\u76D8\u7167\u89C1\u4E86\u4E00\u7247\u4ECE\u672A\u8BB0\u5F55\u7684\u6C99\u6D77\u3002\u65E7\u547D\u4EE4\u5E76\u975E\u6765\u81EA\u5929\u7A7A\uFF0C\u800C\u662F\u6765\u81EA\u66AE\u6C99\u8FF7\u57CE\u7684\u7802\u949F\u3002\u53BB\u627E\u5411\u5BFC\u5854\u739B\u8389\uFF0C\u522B\u628A\u6574\u5EA7\u6C99\u57CE\u5F53\u4F5C\u654C\u4EBA\u3002", "The restored dial reveals an uncharted sandsea. The old orders came not from the sky, but from an hourglass in Duskglass City. Find Tamari; not everyone in the buried city is an enemy."]),
  { id: "dunes-level260", title: ["\u5FAA\u5149\u5165\u6C99", "Follow Light into Sand"], goal: ["\u8FBE\u5230260\u7EA7", "Reach level 260"], kind: "level", level: 260, reward: {} },
  { id: "dunes-enter", title: ["\u66AE\u6C99\u8FF7\u57CE", "Duskglass Labyrinth"], goal: ["\u8FDB\u5165\u66AE\u6C99\u8FF7\u57CE", "Enter Duskglass Labyrinth"], kind: "enter", map: "dunes", reward },
  talk("arrival", "tamari", ["\u88AB\u6C99\u63A9\u57CB\u7684\u9053\u8DEF", "Roads Beneath the Sand"], ["\u5CE1\u8C37\u4F1A\u628A\u98CE\u58F0\u53D8\u6210\u5047\u56DE\u97F3\u3002\u5148\u51FB\u900020\u53EA\u7802\u7532\u6398\u884C\u8005\uFF0C\u518D\u4FEE\u590D\u8DEF\u7891\uFF1B\u6CBF\u7EFF\u6D32\u8D70\uFF0C\u522B\u987A\u7740\u7802\u949F\u7684\u4F4E\u8BED\u76F4\u51B2\u795E\u6BBF\u3002", "The canyon turns wind into false echoes. Defeat twenty Sandscarabs, then restore the waystone. Follow the oasis; do not rush toward the whispering temple."]),
  kill("scarabs", "dune_scarab", 20, 0, ["\u7802\u7532\u4E4B\u4E0B", "Beneath the Sand Armor"]),
  talk("waystone", "dunecompassseal", ["\u91CD\u523B\u5F52\u9014", "Mark the Return Route"], ["\u4F60\u5237\u53BB\u7891\u4E0A\u7684\u6C99\u7C92\uFF0C\u91CD\u65B0\u5D4C\u5165\u94DC\u6307\u9488\u3002\u56DE\u58F0\u4E0D\u518D\u4E71\u7A9C\uFF0C\u901A\u5F80\u7EFF\u6D32\u7684\u6807\u8BB0\u4EAE\u4E86\u8D77\u6765\u3002", "You brush sand from the stone and fit its bronze pointer. The echoes settle, and the markers toward the oasis begin to glow."]),
  talk("oasis", "izar", ["\u8FD8\u6709\u4EBA\u5B88\u7740\u8FD9\u91CC", "Someone Still Keeps Watch"], ["\u6C34\u4E95\u88AB\u9010\u6C99\u796D\u5E08\u7684\u4EEA\u5F0F\u5835\u4F4F\u4E86\u3002\u51FB\u900020\u540D\u796D\u5E08\uFF0C\u518D\u6E05\u7406\u4E95\u53E3\u3002\u57CB\u8A93\u5C06\u519B\u662F\u65E7\u57CE\u7684\u5B88\u536B\uFF0C\u4E0D\u662F\u796D\u5E08\u7684\u540C\u4F34\uFF0C\u4F46\u5B83\u5DF2\u7ECF\u542C\u4E0D\u89C1\u6211\u4EEC\u3002", "The Oracles have choked our well with ritual sand. Defeat twenty and clear the mouth. The Entombed Marshal once guarded this city; it no longer hears us."]),
  kill("oracles", "sand_oracle", 20, 1, ["\u9A71\u6563\u6C99\u5492", "Disperse the Sand Hex"]),
  talk("well", "dunewellseal", ["\u8BA9\u6C34\u91CD\u65B0\u6D41\u52A8", "Let Water Flow Again"], ["\u4F60\u62C9\u8D77\u5012\u584C\u7684\u4E95\u67B6\uFF0C\u7528\u9524\u5B50\u56FA\u5B9A\u6A2A\u6881\uFF0C\u5C06\u5835\u4F4F\u6C34\u9053\u7684\u7802\u76D8\u8F6C\u5F00\u3002\u4E95\u5E95\u4F20\u6765\u6C34\u58F0\u3002", "You raise the fallen frame, hammer its beam into place and turn the sandwheel away from the channel. Water sounds below."]),
  { id: "dunes-level270", title: ["\u7A33\u4F4F\u7EFF\u6D32", "Secure the Oasis"], goal: ["\u8FBE\u5230270\u7EA7", "Reach level 270"], kind: "level", level: 270, reward: {} },
  talk("marshal", "izar", ["\u5524\u9192\u57CB\u8A93\u8005", "Wake the Entombed Oath"], ["\u5C06\u519B\u628A\u6BCF\u4E00\u4E2A\u63A5\u8FD1\u5F71\u9488\u7684\u4EBA\u90FD\u5F53\u6210\u5165\u4FB5\u8005\u3002\u907F\u5F00\u5B83\u4E3E\u8D77\u53CC\u81C2\u7684\u7838\u51FB\uFF0C\u7ED3\u675F\u8FD9\u6761\u9519\u8BEF\u7684\u5B88\u536B\u547D\u4EE4\u3002", "The Marshal sees anyone approaching the gnomons as an invader. Dodge when both arms rise, and end its broken guard order."]),
  kill("marshal-clear", "buried_marshal", 1, 1, ["\u65E7\u8A93\u5F52\u5C18", "Let the Old Oath Rest"]),
  talk("sundials", "nahla", ["\u4E09\u4E2A\u65F6\u523B\uFF0C\u540C\u4E00\u675F\u5149", "Three Hours, One Light"], ["\u4E09\u5EA7\u5F71\u9488\u628A\u540C\u4E00\u675F\u5149\u62C6\u6210\u4E86\u9ECE\u660E\u3001\u6B63\u5348\u4E0E\u9EC4\u660F\u3002\u6211\u4EEC\u5FC5\u987B\u5206\u522B\u6821\u51C6\u5B83\u4EEC\u3002\u5148\u6E05\u740620\u53EA\u7409\u7802\u730E\u517D\uFF0C\u518D\u9010\u5EA7\u68C0\u67E5\u3002", "Three gnomons divide a single beam into dawn, noon and dusk. Align each of them. First clear twenty Glassfang Jackals, then inspect the devices."]),
  kill("jackals", "glass_jackal", 20, 2, ["\u7409\u7802\u730E\u5F71", "Hunt the Glassfangs"]),
  talk("dawn", "dunesun1seal", ["\u9ECE\u660E\u4E4B\u523B", "The Hour of Dawn"], ["\u4F60\u8F6C\u52A8\u7B2C\u4E00\u679A\u7802\u8F6E\uFF0C\u8BA9\u6700\u77ED\u7684\u523B\u5F71\u4E0E\u65E5\u7EB9\u91CD\u5408\u3002\u9ECE\u660E\u5F71\u9488\u505C\u6B62\u9707\u98A4\u3002", "You turn the first sandwheel until its short shadow meets the sunmark. The Dawn Gnomon stops trembling."]),
  talk("noon", "dunesun2seal", ["\u6B63\u5348\u4E4B\u523B", "The Hour of Noon"], ["\u4F60\u538B\u4F4F\u9519\u4F4D\u7684\u94DC\u73AF\uFF0C\u5C06\u7B2C\u4E8C\u679A\u955C\u76D8\u8F6C\u5411\u9AD8\u5904\u3002\u4E00\u9053\u767D\u5149\u5C04\u5411\u795E\u6BBF\u3002", "You hold the slipped bronze ring and turn the second mirror upward. A white beam reaches the temple."]),
  talk("dusk", "dunesun3seal", ["\u9EC4\u660F\u4E4B\u523B", "The Hour of Dusk"], ["\u6700\u540E\u4E00\u6839\u5F71\u9488\u7F13\u7F13\u5BF9\u9F50\u3002\u5C01\u95ED\u7684\u8FD1\u9053\u6253\u5F00\u4E86\uFF0C\u7802\u949F\u6DF1\u5904\u5374\u4F20\u6765\u7B2C\u4E8C\u6B21\u5FC3\u8DF3\u3002", "The final gnomon aligns. A sealed shortcut opens, but a second heartbeat sounds within the hourglass."]),
  { id: "dunes-level284", title: ["\u795E\u6BBF\u524D\u7684\u957F\u5F71", "Long Shadows Before the Temple"], goal: ["\u8FBE\u5230284\u7EA7", "Reach level 284"], kind: "level", level: 284, reward: {} },
  talk("warning", "duneelder", ["\u88AB\u56F0\u4F4F\u7684\u9EC4\u660F", "A Dusk That Cannot End"], ["\u53F8\u547D\u4E00\u76F4\u5728\u91CD\u590D\u6700\u540E\u4E00\u9053\u547D\u4EE4\uFF0C\u597D\u8BA9\u66AE\u6C99\u57CE\u6C38\u8FDC\u505C\u5728\u6BC1\u706D\u524D\u4E00\u523B\u3002\u6211\u4EEC\u6551\u4E0B\u4E86\u4EBA\uFF0C\u73B0\u5728\u8BE5\u8BA9\u65F6\u95F4\u7EE7\u7EED\u5F80\u524D\u3002", "The Regent repeats its final order to hold the city one moment before destruction. We have saved its people. Now time must move again."]),
  kill("temple-guards", "dune_scarab", 24, 3, ["\u6E05\u51FA\u795E\u6BBF\u524D\u5EAD", "Clear the Temple Forecourt"]),
  talk("open", "dunegateseal", ["\u5378\u4E0B\u505C\u6EDE\u4E4B\u9501", "Unfasten the Stillness"], ["\u4F60\u4F9D\u6B21\u62D4\u51FA\u5C01\u95E8\u4E0A\u7684\u4E09\u6839\u9501\u6813\u3002\u6C99\u6D41\u6CA1\u6709\u6251\u5411\u7EFF\u6D32\uFF0C\u800C\u662F\u6CBF\u7740\u65E7\u6C34\u9053\u7F13\u7F13\u6563\u53BB\u3002", "You withdraw three bolts from the gate. The sand follows the old channels instead of rushing toward the oasis."]),
  { id: "dunes-level296", title: ["\u8D70\u5411\u7802\u949F", "Approach the Hourglass"], goal: ["\u8FBE\u5230296\u7EA7", "Reach level 296"], kind: "level", level: 296, reward: {} },
  kill("regent", "hourglass_regent", 1, 3, ["\u8BA9\u66AE\u8272\u6D41\u901D", "Let Dusk Pass"]),
  talk("end", "duneelder", ["\u660E\u65E5\u4ECD\u4F1A\u5230\u6765", "Tomorrow Will Come"], ["\u7802\u949F\u7EC8\u4E8E\u6D41\u5B8C\u4E86\u8FD9\u4E00\u523B\u3002\u57CE\u91CC\u7684\u949F\u7B2C\u4E00\u6B21\u54CD\u8D77\u4E0D\u540C\u7684\u58F0\u97F3\u3002\u8C22\u8C22\u4F60\uFF0C\u6211\u4EEC\u4E0D\u7528\u518D\u9760\u91CD\u590D\u6628\u65E5\u6765\u6D3B\u4E0B\u53BB\u3002", "The hourglass finally releases this moment. For the first time, the bells sound a different hour. Thank you. We no longer have to survive by repeating yesterday."])
];
for (const [gate, target, npc, kind, region, seal] of [["dunes-level270", 270, "izar", "sand_oracle", 1, "dunewellseal"], ["dunes-level284", 284, "nahla", "glass_jackal", 2, "dunesun2seal"], ["dunes-level296", 296, "duneelder", "dune_scarab", 3, "dunegateseal"]]) {
  const at = DUNES_QUESTS.findIndex((q) => q.id === gate), prefix = gate + "-patrol", patrol = { gate, target };
  const brief = talk(prefix + "-brief", npc, ["\u5B88\u4F4F\u8FD9\u6BB5\u5F52\u9014", "Keep the Return Route Safe"], ["\u6709\u4EBA\u8981\u6CBF\u65E7\u8DEF\u56DE\u5230\u7EFF\u6D32\u3002\u51FB\u900024\u4E2A\u6CBF\u8DEF\u654C\u4EBA\uFF0C\u68C0\u67E5\u8DEF\u4E0A\u7684\u88C5\u7F6E\uFF0C\u518D\u56DE\u6765\u544A\u8BC9\u6211\u3002\u6162\u6162\u6765\uFF0C\u522B\u628A\u4EBA\u7559\u5728\u6C99\u91CC\u3002", "Travelers need the old road back to the oasis. Defeat twenty-four enemies, inspect the roadside device, then report back. Take your time; leave nobody in the sand."]);
  brief.id = prefix + "-brief";
  brief.patrol = patrol;
  brief.reward = { xpFraction: 3e-3 };
  const fight = kill(prefix + "-clear", kind, 24, region, ["\u6E05\u7406\u5F52\u9014\u5DE1\u903B", "Clear the Return Patrol"]);
  fight.id = prefix + "-clear";
  fight.patrol = patrol;
  fight.reward = { xpFraction: 0.03 };
  const inspect = talk(prefix + "-inspect", seal, ["\u590D\u67E5\u8DEF\u4E0A\u88C5\u7F6E", "Recheck the Roadside Device"], ["\u4F60\u68C0\u67E5\u652F\u67B6\u548C\u5C01\u53E3\uFF0C\u6572\u7D27\u677E\u52A8\u7684\u94DC\u6263\u3002\u4E0B\u4E00\u6279\u65C5\u4EBA\u53EF\u4EE5\u5B89\u5168\u901A\u8FC7\u8FD9\u91CC\u3002", "You inspect the supports and seals, hammering loose bronze fasteners tight. The next travelers can pass safely."]);
  inspect.id = prefix + "-inspect";
  inspect.patrol = patrol;
  inspect.reward = { xpFraction: 3e-3 };
  const report = talk(prefix + "-report", npc, ["\u628A\u6D88\u606F\u5E26\u56DE\u6765", "Bring Back the News"], ["\u8DEF\u8FD8\u901A\u7740\uFF0C\u8FD9\u6BD4\u7802\u949F\u91CC\u7684\u547D\u4EE4\u91CD\u8981\u3002\u4F11\u6574\u4E00\u4E0B\uFF1B\u5982\u679C\u8FD8\u9700\u8981\u78E8\u7EC3\uFF0C\u5C31\u518D\u62A4\u9001\u4E0B\u4E00\u6BB5\u5F52\u9014\u3002", "The road is still open. That matters more than the hourglass orders. Rest, then protect the next journey if you still need training."]);
  report.id = prefix + "-report";
  report.patrol = { ...patrol, last: true };
  report.reward = { xpFraction: 3e-3 };
  DUNES_QUESTS.splice(at, 0, brief, fight, inspect, report);
}
export {
  DUNES_NPCS,
  DUNES_QUESTS
};
