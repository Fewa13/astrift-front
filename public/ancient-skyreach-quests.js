// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const SKYREACH_NPCS = {
  nerys: { name: "\u5948\u7483\u4E1D", en: "Nerys", map: "skyreach", x: -7, z: 18, role: ["\u5929\u7A79\u89C2\u6D4B\u8005", "Sky Observer"] },
  orren: { name: "\u5965\u4F26", en: "Orren", map: "skyreach", x: 7, z: 89, role: ["\u661F\u4EEA\u4FEE\u590D\u5E08", "Astrolabe Restorer"] },
  selene: { name: "\u745F\u7433", en: "Selene", map: "skyreach", x: -7, z: 189, role: ["\u5BC2\u96F7\u8BB0\u5F55\u5B98", "Keeper of Silent Thunder"] },
  skyaster: { name: "\u963F\u65AF\u7279", en: "Aster", map: "skyreach", x: 7, z: 289, role: ["\u6700\u540E\u7684\u5F15\u661F\u8005", "The Last Starcaller"] },
  skybeaconseal: { name: "\u5931\u51C6\u661F\u6807", en: "Misaligned Star Beacon", map: "skyreach", x: 12, z: 61, role: ["\u6821\u51C6\u88C5\u7F6E", "Alignment Device"] },
  skyrelayseal: { name: "\u65AD\u8DEF\u96F7\u67A2", en: "Broken Thunder Relay", map: "skyreach", x: -12, z: 159, role: ["\u96F7\u67A2", "Thunder Relay"] },
  skymirrorseal: { name: "\u5929\u7A79\u955C\u73AF", en: "Celestial Mirror Array", map: "skyreach", x: 12, z: 256, role: ["\u6298\u5149\u661F\u4EEA", "Prismatic Astrolabe"] },
  skydawnseal: { name: "\u9ECE\u660E\u5F15\u661F\u76D8", en: "Dawn Star Dial", map: "skyreach", x: -12, z: 315, role: ["\u5F15\u661F\u88C5\u7F6E", "Starcalling Device"] }
};
const reward = { xpFraction: 9e-3 };
const talk = (id, npc, title, dialogue) => ({ id: "sky-" + id, title, goal: ["\u4EA4\u8C08", "Talk"], kind: "talk", map: npc === "kael" ? "frostcourt" : "skyreach", npc, dialogue, reply: ["\u7EE7\u7EED", "Continue"], reward });
const kill = (id, kind, count, region, title) => ({ id: "sky-" + id, title, goal: [`\u51FB\u8D25${count}\u4E2A\u654C\u4EBA`, `Defeat ${count} enemies`], kind: "kill", map: "skyreach", kinds: [kind], count, region, reward });
const SKYREACH_QUESTS = [
  talk("signal", "kael", ["\u96F7\u58F0\u6D88\u5931\u7684\u5730\u65B9", "Where Thunder Fell Silent"], ["\u738B\u5EAD\u5DF2\u505C\u4E0B\uFF0C\u5929\u7A7A\u7684\u661F\u4EEA\u5374\u4ECD\u5728\u53D1\u51FA\u547D\u4EE4\u3002\u5230\u5BC2\u96F7\u5929\u7A79\u5BFB\u627E\u5948\u7483\u4E1D\uFF0C\u67E5\u660E\u90A3\u9053\u6765\u81EA\u4E91\u5C42\u4E4B\u4E0A\u7684\u4FE1\u53F7\u3002", "The Court has fallen silent, but the celestial instruments still issue orders. Find Nerys in Skyreach and trace the signal above the clouds."]),
  { id: "sky-level", title: ["\u4E91\u6D77\u4E4B\u4E0A", "Above the Cloudsea"], goal: ["\u8FBE\u5230220\u7EA7", "Reach level 220"], kind: "level", level: 220, reward: {} },
  { id: "sky-enter", title: ["\u5BC2\u96F7\u5929\u7A79", "Silent Storm Skyreach"], goal: ["\u8FDB\u5165\u5BC2\u96F7\u5929\u7A79", "Enter Silent Storm Skyreach"], kind: "enter", map: "skyreach", reward },
  talk("arrival", "nerys", ["\u6CA1\u6709\u96F7\u58F0\u7684\u96F7\u66B4", "The Soundless Storm"], ["\u5929\u7A7A\u5E76\u4E0D\u5B89\u9759\uFF0C\u96F7\u58F0\u88AB\u661F\u4EEA\u6536\u8D70\u4E86\u3002\u6E05\u740620\u4E2A\u5DE1\u7A79\u67AA\u536B\uFF0C\u6211\u4EEC\u624D\u80FD\u5B89\u5168\u6821\u51C6\u7B2C\u4E00\u5EA7\u661F\u6807\u3002", "The sky is not quiet: its thunder has been captured by the astrolabes. Defeat twenty Lancers so we can align the first beacon."]),
  kill("lancers", "sky_lancer", 20, 0, ["\u6253\u901A\u89C2\u6D4B\u524D\u5EAD", "Clear the Observation Court"]),
  talk("beacon", "skybeaconseal", ["\u91CD\u7F6E\u5317\u8FB0", "Realign the Pole Star"], ["\u4F60\u8F6C\u52A8\u94DC\u5236\u661F\u8F68\uFF0C\u62E7\u7D27\u5931\u51C6\u7684\u9F7F\u76D8\u3002\u4E00\u675F\u661F\u5149\u91CD\u65B0\u843D\u5230\u89C2\u6D4B\u53F0\uFF0C\u6307\u5411\u66F4\u9AD8\u5904\u7684\u96F7\u67A2\u3002", "You rotate the bronze orbit and secure the misaligned gears. A starlight beam returns to the platform, pointing toward the thunder relay."]),
  talk("relay", "orren", ["\u88AB\u7F16\u7EC7\u7684\u96F7\u9706", "Woven Thunder"], ["\u7EC7\u96F7\u661F\u4F7F\u4E00\u76F4\u5728\u62BD\u53D6\u4E91\u6D77\u4E2D\u7684\u96F7\u5149\u3002\u51FB\u900020\u4E2A\uFF0C\u518D\u91CD\u65B0\u63A5\u901A\u96F7\u67A2\u3002\u76D1\u5B88\u53EA\u4F1A\u5728\u53D7\u5230\u653B\u51FB\u540E\u5E94\u6218\uFF0C\u51C6\u5907\u597D\u518D\u6311\u6218\u3002", "The Stormweavers draw lightning from the cloudsea. Defeat twenty and reconnect the relay. The Warden retaliates only when attacked; prepare before challenging it."]),
  kill("weavers", "storm_weaver", 20, 1, ["\u89E3\u5F00\u96F7\u7F51", "Unweave the Storm"]),
  talk("repair", "skyrelayseal", ["\u4FEE\u590D\u65AD\u8DEF", "Repair the Relay"], ["\u4F60\u5378\u4E0B\u70E7\u6BC1\u7684\u94DC\u7247\uFF0C\u7528\u9524\u5B50\u6572\u6B63\u652F\u5EA7\uFF0C\u518D\u5C06\u4E24\u6761\u5149\u8DEF\u63A5\u56DE\u661F\u73AF\u3002\u5929\u7A7A\u4F20\u6765\u77ED\u6682\u7684\u96F7\u58F0\u3002", "You remove the scorched copper, hammer its support straight and reconnect both circuits. For a moment, thunder returns to the sky."]),
  kill("warden", "thunder_warden", 1, 1, ["\u8BA9\u96F7\u9706\u5F52\u5929", "Return Thunder to the Sky"]),
  { id: "sky-level232", title: ["\u7A33\u4F4F\u96F7\u67A2", "Hold the Relay"], goal: ["\u8FBE\u5230232\u7EA7", "Reach level 232"], kind: "level", level: 232, reward: {} },
  talk("archive", "selene", ["\u955C\u9762\u540E\u7684\u547D\u4EE4", "Orders Behind the Mirror"], ["\u661F\u4EEA\u5728\u590D\u5236\u4E00\u6761\u65E9\u5DF2\u7ED3\u675F\u7684\u547D\u4EE4\u3002\u51FB\u8D2520\u4E2A\u68F1\u6676\u91CD\u536B\uFF0C\u518D\u5C06\u955C\u73AF\u8F6C\u5411\u771F\u6B63\u7684\u5929\u7A7A\u3002", "The astrolabes repeat an order whose purpose ended long ago. Defeat twenty Bulwarks, then turn the mirrors toward the real sky."]),
  kill("golems", "prism_golem", 20, 2, ["\u7834\u5F00\u68F1\u6676\u9635", "Break the Prismatic Formation"]),
  talk("mirror", "skymirrorseal", ["\u6620\u51FA\u771F\u5B9E\u5929\u7A7A", "Reflect the True Sky"], ["\u4F60\u4F9D\u6B21\u8F6C\u52A8\u4E09\u9762\u6676\u955C\uFF0C\u9501\u4F4F\u6700\u540E\u7684\u955C\u67B6\u3002\u88AB\u906E\u853D\u7684\u5929\u5149\u7EC8\u4E8E\u7A7F\u8FC7\u661F\u73AF\u3002", "You turn three crystal mirrors and lock the final frame. The hidden daylight finally passes through the array."]),
  { id: "sky-level246", title: ["\u7A7F\u8D8A\u5BC2\u96F7", "Cross the Silent Storm"], goal: ["\u8FBE\u5230246\u7EA7", "Reach level 246"], kind: "level", level: 246, reward: {} },
  talk("approach", "skyaster", ["\u6700\u540E\u7684\u5F15\u661F\u8005", "The Last Starcaller"], ["\u5929\u541B\u5B88\u7740\u6700\u540E\u4E00\u5EA7\u661F\u76D8\u3002\u5148\u6E05\u740620\u4E2A\u67AA\u536B\uFF0C\u518D\u542F\u52A8\u9ECE\u660E\u5F15\u661F\u76D8\u3002\u5B83\u7684\u96F7\u7EBF\u4E0E\u661F\u73AF\u90FD\u6709\u84C4\u52BF\uFF0C\u522B\u7AD9\u7740\u786C\u63A5\u3002", "The Sovereign guards the last dial. Defeat twenty Lancers, then activate the dawn instrument. Its lightning lanes and star rings have clear windups. Keep moving."]),
  kill("lastwatch", "sky_lancer", 20, 3, ["\u5B88\u4F4F\u9ECE\u660E", "Hold Until Dawn"]),
  talk("dial", "skydawnseal", ["\u628A\u9ECE\u660E\u8FD8\u7ED9\u5929\u7A7A", "Return Dawn to the Sky"], ["\u4F60\u63A8\u5F00\u5C01\u95ED\u7684\u661F\u76D8\uFF0C\u7F13\u7F13\u5408\u4E0A\u4E3B\u8F74\u3002\u6240\u6709\u661F\u73AF\u7B2C\u4E00\u6B21\u6307\u5411\u540C\u4E00\u4E2A\u9ECE\u660E\u3002", "You open the sealed dial and bring its main axle into alignment. For the first time, every ring points toward the same dawn."]),
  kill("sovereign", "sky_sovereign", 1, 3, ["\u5BC2\u96F7\u7EC8\u54CD", "Let Thunder Resound"]),
  talk("end", "skyaster", ["\u4E91\u6D77\u4E4B\u5916", "Beyond the Cloudsea"], ["\u96F7\u58F0\u56DE\u6765\u4E86\u3002\u6211\u4EEC\u4E0D\u518D\u8BA9\u5929\u7A7A\u542C\u4ECE\u65E7\u547D\u4EE4\u3002\u8C22\u8C22\u4F60\uFF0C\u5C06\u8FD9\u4E00\u6BB5\u65C5\u9014\u7684\u7ED3\u5C40\u5E26\u5230\u4E86\u8FD9\u91CC\u3002", "Thunder has returned. The sky no longer obeys the old command. Thank you for bringing this journey to its end."])
];
export {
  SKYREACH_NPCS,
  SKYREACH_QUESTS
};
