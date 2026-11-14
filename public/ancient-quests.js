// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { DUNES_NPCS, DUNES_QUESTS } from "./ancient-dunes-quests.js";
import { SANCTUM_NPCS, SANCTUM_QUESTS } from "./ancient-sanctum-quests.js";
import { SKYREACH_NPCS, SKYREACH_QUESTS } from "./ancient-skyreach-quests.js";
import { FROSTCOURT_NPCS, FROSTCOURT_QUESTS } from "./ancient-frostcourt-quests.js";
import { STARFALL_NPCS, STARFALL_QUESTS } from "./ancient-starfall-quests.js";
import { BESTIARY_HUNTS, bestiaryQuestSteps } from "./ancient-bestiary-quests.js";
import { BLIGHT_NPCS, BLIGHT_QUESTS } from "./ancient-blight-quests.js";
import { ANCIENT_SECRETS, SECRET_ORIGINS, secretLocation } from "./ancient-secrets.js";
import { blocked, ancientMapHeight, tribeCompactZ, gainXP, xpNeeded, xpRewardBase } from "./ancient-rules.js";
import { PROFESSIONS, SKILLS, skillBook } from "./ancient-skills.js";
const QUEST_NPCS = {
  gruk: { name: "\u683C\u9C81\u514B", en: "Gruk", map: "tribe", x: -10, z: 14, role: ["\u90E8\u843D\u5B88\u671B\u8005", "Tribal Watchkeeper"] },
  tok: { name: "\u6258\u514B", en: "Tok", map: "tribe", x: -8, z: 212, role: ["\u730E\u9053\u5F15\u8DEF\u4EBA", "Hunting Trail Guide"] },
  raka: { name: "\u62C9\u5361", en: "Raka", map: "tribe", x: 11, z: 512, role: ["\u796D\u575B\u65A5\u5019", "Altar Scout"] },
  mira: { name: "\u7C73\u62C9", en: "Mira", map: "forest", x: -10, z: 16, role: ["\u6797\u5730\u5B88\u62A4\u8005", "Woodland Warden"] },
  ilun: { name: "\u4F0A\u4F26", en: "Ilun", map: "forest", x: 60, z: 195, role: ["\u53E4\u6811\u5B66\u8005", "Elder-tree Scholar"] },
  sen: { name: "\u68EE", en: "Sen", map: "forest", x: 90, z: 228, role: ["\u4E94\u884C\u796D\u53F8", "Keeper of the Five"] },
  veya: { name: "\u8587\u5A05", en: "Veya", map: "city", x: -10, z: 18, role: ["\u738B\u57CE\u5E78\u5B58\u8005", "City Survivor"] },
  aron: { name: "\u963F\u9686", en: "Aron", map: "city", x: -10, z: 192, role: ["\u5931\u8E2A\u7684\u5B88\u536B", "Missing Watchman"] },
  eira: { name: "\u827E\u62C9", en: "Eira", map: "city", x: 12, z: 342, role: ["\u524D\u738B\u57CE\u536B\u961F\u957F", "Former Guard Captain"] },
  westseal: { name: "\u897F\u4FA7\u76F8\u4F4D\u88C5\u7F6E", en: "Western Phase Relay", map: "city", x: -30, z: 246, role: ["\u5931\u63A7\u88C5\u7F6E", "Unstable Relay"] },
  eastseal: { name: "\u4E1C\u4FA7\u76F8\u4F4D\u88C5\u7F6E", en: "Eastern Phase Relay", map: "city", x: 30, z: 301, role: ["\u5931\u63A7\u88C5\u7F6E", "Unstable Relay"] },
  gateseal: { name: "\u6838\u5FC3\u6BBF\u5C01\u5370", en: "Core Hall Seal", map: "city", x: 0, z: 354, role: ["\u5931\u63A7\u88C5\u7F6E", "Unstable Relay"] }
};
const steps = [];
const add = (id, title, goal, kind, extra = {}) => steps.push({ id, title, goal, kind, ...extra });
const talk = (id, npc, title, dialogue, reward, reply = ["\u597D\u7684", "All right."]) => add(id, title, [`\u4E0E${QUEST_NPCS[npc].name}\u4EA4\u8C08`, `Talk to ${QUEST_NPCS[npc].en}`], "talk", { npc, map: QUEST_NPCS[npc].map, dialogue, reply, reward });
const kill = (id, title, goal, kinds, count, map = "tribe", region) => add(id, title, goal, "kill", { kinds, count, map, region });
const level = (id, n) => add(id, ["\u7EE7\u7EED\u6210\u957F", "Grow stronger"], [`\u5347\u5230 ${n} \u7EA7`, `Reach level ${n}`], "level", { level: n });
add("arrival", ["\u521D\u5230\u90E8\u843D", "A new arrival"], ["\u8FDB\u5165\u90E8\u843D", "Enter the Tribe"], "enter", { map: "tribe", reward: { xp: 200 } });
talk("gruk-help", "gruk", ["\u5B88\u671B\u8005\u7684\u6307\u5F15", "The watchkeeper\u2019s guidance"], ["\u6211\u4EEC\u90E8\u843D\u88AB\u653B\u51FB\u4E86\u3002\u5148\u5524\u9192\u4F60\u7684\u529B\u91CF\uFF1A\u6253\u5F00\u6280\u80FD\uFF0C\u9009\u62E9\u804C\u4E1A\uFF0C\u6211\u4F1A\u6559\u4F60\u4F7F\u7528\u7B2C\u4E00\u4E2A\u6280\u80FD\u3002", "Our tribe is under attack. First awaken your power: open Skills and choose a profession. I will teach you your first ability."]);
kill("grox-five", ["\u4FDD\u536B\u5185\u533A", "Defend the settlement"], ["\u51FB\u6740 5 \u4E2A 1\u20135 \u7EA7\u7A74\u5C45\u517D", "Defeat 5 Grox, levels 1\u20135"], ["grox"], 5);
talk("gruk-reward", "gruk", ["\u521D\u6B21\u62A5\u6377", "Your first victory"], ["\u611F\u8C22\u4F60\u5E2E\u52A9\u6211\u4EEC\uFF0C\u8FD9\u91CC\u662F\u4F60\u7684\u5956\u52B1\u3002\u73B0\u5728\u4F60\u53EF\u4EE5\u70B9\u4EAE\u6280\u80FD\u70B9\u4E86\uFF1A\u6253\u5F00\u6280\u80FD\u6309\u94AE\uFF0C\u9009\u62E9\u4F60\u7684\u804C\u4E1A\u3002", "Thank you for helping us. Here is your reward. It is time to awaken your abilities: open Skills and choose a profession."], { xp: 300, materials: { core: 1, "supply:transfer": 1 } });
add("choose-job", ["\u9009\u62E9\u9053\u8DEF", "Choose your path"], ["\u6253\u5F00\u6280\u80FD\uFF0C\u9009\u62E9\u804C\u4E1A", "Open Skills and choose a profession"], "profession");
talk("gruk-book", "gruk", ["\u7B2C\u4E00\u672C\u6280\u80FD\u4E66", "Your first skill book"], ["{job}\u662F\u4E00\u4E2A\u5F88\u597D\u7684\u804C\u4E1A\u3002\u6211\u6765\u9001\u4F60\u4E00\u672C\u6280\u80FD\u4E66\u6765\u6FC0\u6D3B\u6280\u80FD\u5427\u3002\u6211\u4EEC\u6765\u5347\u7EA7\u6280\u80FD\uFF1A\u6253\u5F00\u6280\u80FD\uFF0C\u4FEE\u70BC Q \u6280\u80FD\uFF0C\u7136\u540E\u56DE\u5230\u6218\u6597\u4E2D\u4F7F\u7528\u4E00\u6B21\u3002", "{job} is an excellent choice. Take this skill book to awaken your first ability. Open Skills and train your Q skill, then return to combat and use it once."], { qBook: true });
add("train-q", ["\u5524\u9192\u529B\u91CF", "Awaken your power"], ["\u5728\u6280\u80FD\u9875\u9762\u4FEE\u70BC Q \u6280\u80FD\u81F3 1 \u7EA7", "Train your Q skill to level 1 in Skills"], "trainQ");
add("use-q", ["\u8BD5\u8BD5\u4F60\u7684\u529B\u91CF", "Try your new power"], ["\u4F7F\u7528\u4E00\u6B21 Q \u6280\u80FD\uFF1B\u653B\u51FB\u6280\u80FD\u9700\u8981\u7784\u51C6\u53EF\u89C1\u654C\u4EBA", "Use your Q skill once; attack skills require a visible enemy"], "useQ");
talk("gruk-foundation", "gruk", ["\u751F\u5B58\u7684\u57FA\u7840", "The basics of survival"], ["\u597D\u7684\uFF0C\u4F60\u5DF2\u7ECF\u5B66\u4F1A\u4E86\u5728\u8FD9\u91CC\u751F\u5B58\u7684\u57FA\u7840\u3002\u5347\u7EA7\u52305\u7EA7\uFF0C\u7136\u540E\u53BB\u4E2D\u90E8\u5165\u53E3\u627E\u6258\u514B\u3002\u4ED6\u77E5\u9053\u88AD\u51FB\u8005\u4ECE\u54EA\u91CC\u6765\u3002", "Good. You have learned the basics of surviving here. Reach level 5, then find Tok at the entrance to the hunting grounds. He knows where the attackers came from."]);
level("reach-five", 5);
talk("tok-trail", "tok", ["\u730E\u9053\u4E0A\u7684\u7EBF\u7D22", "Clues on the hunting trail"], ["\u683C\u9C81\u514B\u63D0\u5230\u8FC7\u4F60\u3002\u5148\u522B\u95EF\u8FDB\u6DF1\u5904\uFF0C\u730E\u624B\u4F1A\u6295\u63B7\u957F\u77DB\u3002\u51FB\u8D256\u4E2A\u788E\u7259\u730E\u624B\uFF0C\u6211\u4EEC\u9700\u8981\u593A\u56DE\u8FD9\u6761\u730E\u9053\u3002", "Gruk told me about you. Do not rush into the depths: the hunters throw spears. Defeat six Shardfang Hunters so we can reclaim this trail."]);
kill("hunters-six", ["\u593A\u56DE\u730E\u9053", "Reclaim the trail"], ["\u51FB\u6740 6 \u4E2A\u4E2D\u90E8\u788E\u7259\u730E\u624B", "Defeat 6 Shardfang Hunters in the hunting grounds"], ["hunter"], 6, "tribe", 1);
talk("tok-core", "tok", ["\u6253\u78E8\u6B66\u5668", "Sharpen your weapon"], ["\u730E\u9053\u7EC8\u4E8E\u5B89\u9759\u4E86\u4E00\u4E9B\u3002\u8FD9\u4E9B\u76F8\u4F4D\u6838\u5FC3\u7ED9\u4F60\u3002\u6253\u5F00\u80CC\u5305\uFF0C\u68C0\u67E5\u5E76\u7A7F\u6234\u4F60\u7684\u4E3B\u624B\u6B66\u5668\uFF1B\u66F4\u5F3A\u7684\u654C\u4EBA\u6B63\u5728\u7B49\u4F60\u3002", "The trail is quieter now. Take these Phase Cores. Open Inventory and equip your main-hand weapon. Stronger enemies await."], { xp: 1200, coins: 50, materials: { core: 3 } });
add("first-star", ["\u4E3B\u624B\u6B66\u5668", "Your main-hand weapon"], ["\u5728\u80CC\u5305\u4E2D\u7A7F\u6234\u4E00\u628A\u8FD1\u6218\u6B66\u5668", "Equip a melee weapon in Inventory"], "equipGear");
talk("tok-medicine", "tok", ["\u51C6\u5907\u8865\u7ED9", "Prepare your supplies"], ["\u4F24\u53E3\u4E0D\u4F1A\u81EA\u5DF1\u6D88\u5931\u3002\u7528\u6211\u7ED9\u4F60\u7684\u91D1\u5E01\u5728\u5546\u5E97\u4E70\u4E00\u74F6\u4F4E\u7EA7\u8840\u74F6\u3002\u8840\u74F6\u5728\u80CC\u5305\u91CC\uFF0C\u53D7\u4F24\u540E\u53EF\u4EE5\u4F7F\u7528\uFF1B\u73B0\u5728\u5148\u5907\u597D\u3002", "Wounds do not heal on their own. Use the gold I gave you to buy a Minor Health Potion in the Shop. It will appear in your inventory. Keep it ready for when you are injured."]);
add("buy-potion", ["\u5E26\u4E0A\u8840\u74F6", "Carry a health potion"], ["\u5728\u5546\u5E97\u8D2D\u4E70\u4E00\u74F6\u8840\u74F6", "Buy a health potion in the Shop"], "buyPotion");
talk("tok-second", "tok", ["\u7B2C\u4E8C\u79CD\u529B\u91CF", "A second ability"], ["\u8865\u7ED9\u9F50\u4E86\u3002\u8FD9\u672C{zskill}\u6280\u80FD\u4E66\u7ED9\u4F60\u3002\u4FEE\u70BC\u4F60\u7684 Z \u6280\u80FD\uFF0C\u5B66\u4F1A\u914D\u5408\u8FD1\u6218\u6B66\u5668\u8FD0\u7528\u804C\u4E1A\u529B\u91CF\u3002", "Your supplies are ready. Take this {zskill} skill book. Train your Z skill and learn to use your profession alongside your weapon."], { xp: 1600, materials: { core: 4 }, qBook: false });
add("train-z", ["\u62D3\u5C55\u80FD\u529B", "Expand your abilities"], ["\u5C06\u5F53\u524D\u804C\u4E1A Z \u6280\u80FD\u4FEE\u70BC\u81F3 1 \u7EA7", "Train your current profession\u2019s Z skill to level 1"], "trainZ");
talk("tok-hunt", "tok", ["\u6E05\u7406\u8425\u5730", "Clear the camps"], ["\u4E24\u79CD\u529B\u91CF\u90FD\u638C\u63E1\u4E86\u3002\u730E\u624B\u8425\u5730\u4ECD\u5728\u53EC\u96C6\u63F4\u519B\u3002\u518D\u51FB\u8D2510\u4E2A\u4E2D\u90E8\u730E\u624B\uFF0C\u5207\u65AD\u4ED6\u4EEC\u7684\u96C6\u7ED3\u3002", "You now wield two abilities. The hunters are still gathering reinforcements. Defeat ten more hunters in the hunting grounds to break their muster."]);
kill("hunters-ten", ["\u5207\u65AD\u63F4\u519B", "Cut off reinforcements"], ["\u51FB\u6740 10 \u4E2A\u4E2D\u90E8\u788E\u7259\u730E\u624B", "Defeat 10 Shardfang Hunters in the hunting grounds"], ["hunter"], 10, "tribe", 1);
talk("tok-chief", "tok", ["\u56FE\u817E\u4E4B\u4E3B", "Master of the totem"], ["\u788E\u9AA8\u914B\u957F\u5C31\u5728\u4E2D\u90E8\u5C3D\u5934\u3002\u4ED6\u7684\u7838\u5730\u653B\u51FB\u5F88\u5371\u9669\uFF0C\u5148\u628A\u81EA\u5DF1\u63D0\u5347\u523020\u7EA7\uFF0C\u5E76\u7528\u6280\u80FD\u4E66\u5F3A\u5316\u804C\u4E1A\u6280\u80FD\uFF0C\u518D\u56DE\u6765\u627E\u6211\u3002", "The Bonebreaker Chieftain waits at the far end of the hunting grounds. His ground slam is deadly. Reach level 20 and keep training your profession skills, then return to me."], { xp: 6e3, materials: { core: 12 } });
level("reach-twenty", 20);
talk("tok-third", "tok", ["\u5B8C\u6574\u7684\u804C\u4E1A", "Your full arsenal"], ["\u4F60\u5DF2\u7ECF\u51C6\u5907\u597D\u4FEE\u70BC{cskill}\u3002\u62FF\u7740\u8FD9\u672C\u6280\u80FD\u4E66\uFF0C\u5B66\u4F1A C \u6280\u80FD\uFF0C\u518D\u53BB\u6311\u6218\u788E\u9AA8\u914B\u957F\u3002\u4ED6\u662F\u88AD\u51FB\u7684\u6307\u6325\u8005\u3002", "You are ready to learn {cskill}. Take this book, train your C skill, then challenge the Bonebreaker Chieftain. He commands these attacks."], { materials: { core: 20 } });
add("train-c", ["\u638C\u63E1\u7B2C\u4E09\u6280\u80FD", "Learn your third skill"], ["\u5C06\u5F53\u524D\u804C\u4E1A C \u6280\u80FD\u4FEE\u70BC\u81F3 1 \u7EA7", "Train your current profession\u2019s C skill to level 1"], "trainC");
kill("bonebreaker", ["\u6253\u788E\u56FE\u817E", "Break the totem"], ["\u51FB\u8D25\u4E2D\u90E8\u5934\u76EE\uFF1A\u788E\u9AA8\u914B\u957F", "Defeat the Bonebreaker Chieftain"], ["chief"], 1);
talk("tok-victory", "tok", ["\u8D8A\u8FC7\u6728\u5BE8", "Beyond the palisade"], ["\u914B\u957F\u5012\u4E0B\u4E86\uFF0C\u4F46\u88AD\u51FB\u8FD8\u6CA1\u6709\u7ED3\u675F\u3002\u5916\u56F4\u7684\u62C9\u5361\u53D1\u73B0\u4E86\u66F4\u5927\u7684\u5A01\u80C1\u3002\u7A7F\u8FC7\u7B2C\u4E8C\u9053\u5927\u95E8\u53BB\u627E\u5979\uFF1B\u8DEF\u4E0A\u4E0D\u8981\u505C\u7559\u3002", "The chieftain has fallen, but the attacks are not over. Raka has found a greater threat in the outer territory. Cross the second gate and find her. Stay alert on the way."], { xp: 18e3, materials: { core: 30 } });
talk("raka-scout", "raka", ["\u5916\u56F4\u7684\u65A5\u5019", "The outer scout"], ["\u796D\u575B\u6B63\u5728\u53EC\u96C6\u6240\u6709\u517D\u7FA4\u3002\u5148\u6E05\u6389\u5916\u56F48\u53EA\u7A74\u5C45\u517D\u3001\u518D\u6E05\u63898\u4E2A\u730E\u624B\uFF0C\u522B\u8BA9\u5B83\u4EEC\u5939\u51FB\u4F60\u3002", "The altar is calling every beast to it. First clear eight Grox, then eight hunters in the outer territory. Do not let them surround you."]);
kill("outer-grox", ["\u8083\u6E05\u517D\u7FA4", "Thin the beasts"], ["\u51FB\u6740 8 \u4E2A\u5916\u56F4\u7A74\u5C45\u517D", "Defeat 8 Grox in the outer territory"], ["grox"], 8, "tribe", 2);
kill("outer-hunters", ["\u8083\u6E05\u6295\u77DB\u624B", "Silence the spear throwers"], ["\u51FB\u6740 8 \u4E2A\u5916\u56F4\u788E\u7259\u730E\u624B", "Defeat 8 Shardfang Hunters in the outer territory"], ["hunter"], 8, "tribe", 2);
talk("raka-gorash", "raka", ["\u796D\u575B\u7684\u9634\u5F71", "Shadow of the altar"], ["\u8FDC\u53E4\u5927\u914B\u957F\xB7\u6208\u62C9\u4EC0\u5C31\u5728\u6700\u6DF1\u5904\u7684\u796D\u575B\u3002\u4ED6\u8FDC\u6BD4\u914B\u957F\u5F3A\u5927\u3002\u5148\u5347\u523030\u7EA7\uFF0C\u5907\u597D\u8840\u74F6\u548C\u5F3A\u5316\u6B66\u5668\uFF0C\u518D\u4ECE\u6211\u8FD9\u91CC\u63A5\u4E0B\u6700\u540E\u7684\u6311\u6218\u3002", "Gorash, the Ancient High Chieftain, waits at the deepest altar. He is far stronger than the chieftain. Reach level 30, prepare your potions and strengthen your weapon, then return for the final challenge."], { xp: 3e4, materials: { core: 60 } });
level("reach-thirty", 30);
talk("raka-final", "raka", ["\u5411\u6208\u62C9\u4EC0\u5BA3\u6218", "Challenge Gorash"], ["\u73B0\u5728\uFF0C\u53BB\u51FB\u8D25\u6208\u62C9\u4EC0\u3002\u8EB2\u5F00\u7838\u5730\u548C\u5486\u54EE\uFF0C\u522B\u7AD9\u7740\u786C\u625B\u3002\u4F60\u7684\u804C\u4E1A\u6280\u80FD\u548C\u8840\u74F6\u4F1A\u51B3\u5B9A\u8FD9\u573A\u6218\u6597\u3002", "Now defeat Gorash. Avoid his ground slams and roars; do not try to endure them all. Your profession skills and potions will decide this fight."]);
kill("gorash", ["\u90E8\u843D\u7684\u7EC8\u6218", "The tribe\u2019s final battle"], ["\u51FB\u8D25\u8FDC\u53E4\u5927\u914B\u957F\xB7\u6208\u62C9\u4EC0", "Defeat Gorash, Ancient High Chieftain"], ["lord"], 1);
talk("raka-forest", "raka", ["\u53E4\u6797\u7684\u547C\u5524", "The elder forest calls"], ["\u90E8\u843D\u7EC8\u4E8E\u80FD\u5598\u53E3\u6C14\u4E86\u3002\u6208\u62C9\u4EC0\u7684\u529B\u91CF\u6765\u81EA\u53E4\u6797\u3002\u8FD4\u56DE\u5927\u5385\uFF0C\u9009\u62E9\u68EE\u6797\uFF0C\u7136\u540E\u53BB\u5165\u53E3\u627E\u7C73\u62C9\u3002\u6211\u4EEC\u7684\u6545\u4E8B\u8FD8\u6CA1\u6709\u7ED3\u675F\u3002", "The tribe can finally breathe again. Gorash drew his power from the elder forest. Return to the lobby, enter the Forest and find Mira near its entrance. Our story is not over."], { xp: 6e4, materials: { core: 100 } });
add("forest-entry", ["\u8E0F\u5165\u68EE\u6797", "Into the forest"], ["\u8FDB\u5165\u68EE\u6797\u5730\u56FE", "Enter the Forest"], "enter", { map: "forest" });
talk("mira-welcome", "mira", ["\u6797\u5730\u7684\u5F02\u53D8", "Trouble in the woodland"], ["\u4F60\u5C31\u662F\u6551\u4E0B\u90E8\u843D\u7684\u4EBA\u3002\u8FD9\u91CC\u7684\u82D4\u7532\u517D\u4E5F\u5931\u63A7\u4E86\u3002\u51FB\u8D258\u53EA\u82D4\u7532\u517D\uFF0C\u66FF\u6211\u5B88\u4F4F\u5165\u53E3\u3002", "You are the one who saved the tribe. The Mossbacks here have also gone wild. Defeat eight and help me secure the entrance."]);
kill("moss-eight", ["\u5B88\u4F4F\u6797\u53E3", "Secure the woodland entrance"], ["\u51FB\u6740 8 \u53EA\u82D4\u7532\u517D", "Defeat 8 Mossbacks"], ["mossling"], 8, "forest");
talk("mira-trace", "mira", ["\u53E4\u6839\u7684\u75D5\u8FF9", "Traces of the ancient roots"], ["\u6811\u6839\u4E0B\u6709\u4E1C\u897F\u9192\u6765\u4E86\u3002\u5148\u5347\u523040\u7EA7\uFF0C\u518D\u53BB\u4EA4\u754C\u5904\u51FB\u8D25\u53E4\u6839\u5B88\u671B\u8005\u3002\u5B83\u5E76\u4E0D\u603B\u4F1A\u51FA\u73B0\uFF0C\u7559\u610F\u68EE\u6797\u4E0E\u9AD8\u53F0\u4E4B\u95F4\u7684\u77F3\u5F84\u3002", "Something has awakened beneath the roots. Reach level 40, then defeat the Ancient Rootwarden at the woodland\u2013terrace crossing. It appears only from time to time; watch the stone trail."], { xp: 8e4, materials: { core: 60 } });
level("reach-forty", 40);
kill("root-warden", ["\u6C89\u7761\u7684\u5B88\u536B", "The sleeping warden"], ["\u51FB\u8D25\u53E4\u6839\u5B88\u671B\u8005", "Defeat the Ancient Rootwarden"], ["rootwarden"], 1, "forest");
talk("mira-return", "mira", ["\u51C0\u5316\u6811\u6839", "Cleanse the roots"], ["\u53E4\u6839\u6682\u65F6\u5E73\u9759\u4E86\u3002\u6CBF\u7740\u4E0A\u5761\u8D70\u5230\u5DE8\u6811\u9AD8\u53F0\uFF0C\u4F0A\u4F26\u6B63\u5728\u90A3\u91CC\u7814\u7A76\u6C34\u6676\u3002\u4ED6\u80FD\u89E3\u91CA\u8FD9\u573A\u5F02\u53D8\u3002", "The roots are calm for now. Follow the rising trail to the elder-tree terrace. Ilun is studying the crystals there. He can explain this disturbance."], { xp: 12e4, materials: { core: 100 } });
talk("ilun-thorns", "ilun", ["\u9AD8\u53F0\u7684\u5B66\u8005", "Scholar of the terrace"], ["\u4E94\u5EA7\u796D\u575B\u7684\u529B\u91CF\u5916\u6CC4\u4E86\uFF0C\u68D8\u679D\u730E\u624B\u5360\u636E\u4E86\u9AD8\u53F0\u3002\u51FB\u8D2510\u4E2A\u730E\u624B\uFF0C\u7ED9\u6211\u4E00\u70B9\u7814\u7A76\u7684\u65F6\u95F4\u3002", "Power is leaking from the five altars, and Thornstalkers have taken over the terrace. Defeat ten of them and give me time to study."]);
kill("thorns-ten", ["\u8083\u6E05\u5DE8\u6811\u9AD8\u53F0", "Clear the elder-tree terrace"], ["\u51FB\u6740 10 \u4E2A\u68D8\u679D\u730E\u624B", "Defeat 10 Thornstalkers"], ["thorn"], 10, "forest");
talk("ilun-pass", "ilun", ["\u53F3\u4FA7\u7684\u53E4\u95E8", "The ancient gate to the right"], ["\u796D\u575B\u5C31\u5728\u53F3\u8F6C\u540E\u7684\u53E4\u95E8\u91CC\u9762\u3002\u5148\u5347\u523050\u7EA7\uFF0C\u518D\u53BB\u91CC\u9762\u627E\u796D\u53F8\u68EE\u3002\u6C34\u6676\u5DE8\u4EBA\u7684\u529B\u91CF\u4E0D\u80FD\u88AB\u8F7B\u89C6\u3002", "The altars lie beyond the ancient gate on your right. Reach level 50, then find Sen inside. Do not underestimate the crystal giants."], { xp: 16e4, materials: { core: 120 } });
level("reach-fifty", 50);
talk("sen-shells", "sen", ["\u796D\u53F8\u7684\u8BD5\u70BC", "The keeper\u2019s trial"], ["\u4E94\u884C\u5931\u8861\u4E86\uFF0C\u6676\u58F3\u5B88\u536B\u6321\u4F4F\u4E86\u901A\u5F80\u796D\u575B\u7684\u8DEF\u3002\u5148\u51FB\u8D2512\u4E2A\u5B88\u536B\uFF0C\u8BC1\u660E\u4F60\u80FD\u5728\u8FD9\u91CC\u751F\u5B58\u3002", "The five elements are out of balance. Crystal Sentinels block the paths to the altars. Defeat twelve and prove that you can survive here."]);
kill("sentinels-twelve", ["\u6253\u5F00\u796D\u575B\u4E4B\u8DEF", "Open the altar paths"], ["\u51FB\u6740 12 \u4E2A\u6676\u58F3\u5B88\u536B", "Defeat 12 Crystal Sentinels"], ["sentinel"], 12, "forest");
talk("sen-ready", "sen", ["\u4E94\u884C\u5931\u8861", "The five in discord"], ["\u4F60\u901A\u8FC7\u4E86\u8BD5\u70BC\u3002\u5148\u5347\u523060\u7EA7\uFF0C\u628A\u6B66\u5668\u4E0E\u6280\u80FD\u51C6\u5907\u597D\u3002\u6211\u4EEC\u5FC5\u987B\u9010\u4E00\u5E73\u606F\u4E94\u5EA7\u796D\u575B\uFF1B\u4E0D\u8981\u540C\u65F6\u62DB\u60F9\u591A\u4E2A\u5DE8\u4EBA\u3002", "You have passed the trial. Reach level 60 and prepare your weapon and skills. We must calm all five altars, one at a time. Do not provoke several giants at once."], { xp: 25e4, materials: { core: 180 } });
level("reach-sixty", 60);
const elements = [
  ["wood", ["\u82CD\u6728", "Verdant"], ["\u5148\u53BB\u82CD\u6728\u796D\u575B\uFF0C\u51FB\u8D25\u82CD\u6728\u6C34\u6676\u5DE8\u4EBA\u3002\u53E4\u6797\u9700\u8981\u91CD\u65B0\u624E\u6839\u3002", "Go to the Verdant altar first and defeat its crystal giant. The forest must take root again."]],
  ["water", ["\u6CA7\u6F9C", "Tidal"], ["\u82CD\u6728\u5DF2\u7ECF\u5E73\u606F\u3002\u63A5\u4E0B\u6765\u662F\u6CA7\u6F9C\u796D\u575B\uFF0C\u51FB\u8D25\u90A3\u91CC\u7684\u6C34\u6676\u5DE8\u4EBA\uFF0C\u8BA9\u529B\u91CF\u91CD\u65B0\u6D41\u52A8\u3002", "Verdant is calm. Next, defeat the crystal giant at the Tidal altar and let the power flow again."]],
  ["fire", ["\u7194\u7130", "Ember"], ["\u6C34\u6D41\u56DE\u6765\u4E86\uFF0C\u73B0\u5728\u7194\u7130\u5FC5\u987B\u964D\u6E29\u3002\u51FB\u8D25\u7194\u7130\u6C34\u6676\u5DE8\u4EBA\uFF0C\u5C0F\u5FC3\u5B83\u7684\u7206\u53D1\u3002", "The flow has returned. Now Ember must cool. Defeat its crystal giant and beware its bursts of power."]],
  ["earth", ["\u7384\u5CA9", "Terra"], ["\u706B\u7130\u5E73\u9759\u4E86\uFF0C\u7384\u5CA9\u4ECD\u5728\u9707\u52A8\u3002\u53BB\u51FB\u8D25\u7384\u5CA9\u6C34\u6676\u5DE8\u4EBA\uFF0C\u7A33\u4F4F\u5927\u5730\u3002", "The flames are calm, but Terra still trembles. Defeat its crystal giant and steady the earth."]],
  ["metal", ["\u91D1\u66DC", "Aurum"], ["\u53EA\u5269\u91D1\u66DC\u4E86\u3002\u51FB\u8D25\u6700\u540E\u7684\u6C34\u6676\u5DE8\u4EBA\uFF0C\u8BA9\u4E94\u884C\u91CD\u65B0\u5F52\u4F4D\u3002", "Only Aurum remains. Defeat the final crystal giant and restore the balance of the five."]]
];
for (const [element, name, dialogue] of elements) {
  talk("sen-" + element, "sen", [name[0] + "\u7684\u8BD5\u70BC", name[1] + " trial"], dialogue, element === "wood" ? void 0 : { xp: 15e4, materials: { core: 100 } });
  kill("giant-" + element, [name[0] + "\u5F52\u4F4D", name[1] + " restored"], ["\u51FB\u8D25" + name[0] + "\u6C34\u6676\u5DE8\u4EBA", "Defeat the " + name[1] + " Crystal Titan"], ["crystal_" + element], 1, "forest");
}
talk("sen-balance", "sen", ["\u4E94\u884C\u5F52\u4F4D", "Balance restored"], ["\u4E94\u884C\u7EC8\u4E8E\u5E73\u8861\u4E86\u3002\u662F\u4F60\u628A\u90E8\u843D\u4E0E\u68EE\u6797\u4ECE\u6DF7\u4E71\u4E2D\u62C9\u4E86\u56DE\u6765\u3002\u5E26\u7740\u8FD9\u4EFD\u5956\u52B1\u7EE7\u7EED\u6210\u957F\uFF1B\u65B0\u7684\u9053\u8DEF\u5F00\u542F\u65F6\uFF0C\u6211\u4F1A\u518D\u6B21\u9700\u8981\u4F60\u3002", "The five are finally in balance. You brought both the tribe and the forest back from chaos. Take this reward and keep growing. When a new path opens, I will need your help again."], { xp: 4e5, materials: { core: 300 } });
add("homecoming", ["\u56DE\u5230\u6545\u4E8B\u7684\u8D77\u70B9", "Back to where it began"], ["\u8FD4\u56DE\u90E8\u843D\uFF0C\u5411\u683C\u9C81\u514B\u62A5\u544A\u68EE\u6797\u5DF2\u7ECF\u6062\u590D\u5E73\u8861", "Return to the Tribe and tell Gruk that the forest is in balance"], "enter", { map: "tribe" });
talk("gruk-home", "gruk", ["\u65B0\u7684\u5B88\u671B\u8005", "A new watchkeeper"], ["\u4F60\u4ECE\u5728\u90E8\u843D\u5524\u9192\u804C\u4E1A\u529B\u91CF\u5F00\u59CB\uFF0C\u5374\u4E00\u8DEF\u8D70\u5230\u4E86\u4E94\u884C\u796D\u575B\u3002\u90E8\u843D\u4F1A\u8BB0\u4F4F\u4F60\u7684\u540D\u5B57\u3002\u6536\u4E0B\u8FD9\u4EFD\u8C22\u793C\u5427\u2014\u2014\u4F60\u5DF2\u7ECF\u4E0D\u518D\u53EA\u662F\u4E00\u4E2A\u8FC7\u8DEF\u4EBA\u4E86\u3002", "You began by awakening your profession in our tribe, and your journey led all the way to the five altars. The tribe will remember your name. Take this token of our thanks. You are no longer just a traveler here."], { xp: 5e4, materials: { core: 50 } });
talk("gruk-city", "gruk", ["\u5C01\u5370\u540E\u7684\u9053\u8DEF", "A road beyond the seal"], ["\u68EE\u6797\u7684\u4E94\u5EA7\u796D\u575B\u4E0D\u662F\u4F9B\u5949\u5DE8\u4EBA\uFF0C\u800C\u662F\u5728\u5C01\u5370\u901A\u5F80\u5931\u843D\u738B\u57CE\u7684\u9053\u8DEF\u3002\u5982\u4ECA\u9053\u8DEF\u91CD\u65B0\u663E\u73B0\uFF0C\u88AD\u51FB\u90E8\u843D\u7684\u529B\u91CF\u4E5F\u6765\u81EA\u90A3\u91CC\u3002\u8FBE\u523070\u7EA7\u540E\u524D\u5F80\u738B\u57CE\uFF0C\u627E\u56DE\u5931\u8E2A\u7684\u5B88\u536B\u963F\u9686\u3002", "The five forest altars were not built to worship the titans. They sealed the road to the Lost Royal City. That road has reappeared, and the force that attacked our tribe came from beyond it. Reach level 70, enter the city and find the missing watchman, Aron."], { xp: 25e4, materials: { core: 80 } });
level("city-level", 70);
add("city-arrival", ["\u5931\u843D\u738B\u57CE", "The Lost Royal City"], ["\u8FDB\u5165\u5931\u843D\u738B\u57CE", "Enter the Lost Royal City"], "enter", { map: "city" });
talk("city-survivor", "veya", ["\u5E9F\u589F\u4E2D\u7684\u58F0\u97F3", "A voice in the ruins"], ["\u4F60\u662F\u4ECE\u68EE\u6797\u6765\u7684\uFF1F\u6211\u4EEC\u66FE\u7ECF\u4E3B\u52A8\u5C01\u95ED\u738B\u57CE\uFF0C\u60F3\u628A\u5730\u4E0B\u7684\u4E1C\u897F\u6C38\u8FDC\u5173\u4F4F\u3002\u73B0\u5728\u8857\u4E0A\u7684\u57CE\u6C11\u5DF2\u7ECF\u5931\u53BB\u795E\u667A\u3002\u6E05\u9664\u524D\u8DEF\u76844\u4E2A\u5931\u843D\u57CE\u6C11\uFF0C\u963F\u9686\u5C31\u5728\u57CE\u95E8\u5185\u7B49\u6551\u63F4\u3002", "You came through the forest? We sealed our own city to keep something beneath it trapped forever. Now the citizens have lost their minds. Clear four Lost Citizens from the road. Aron is waiting for help beyond the inner gate."]);
kill("city-clear-road", ["\u6253\u901A\u5E9F\u57CE", "Clear the ruined approach"], ["\u51FB\u8D25 4 \u4E2A\u5931\u843D\u57CE\u6C11", "Defeat 4 Lost Citizens"], ["city_husk"], 4, "city", 0);
talk("city-watchman", "aron", ["\u627E\u5230\u963F\u9686", "Find Aron"], ["\u7EC8\u4E8E\u6709\u4EBA\u6765\u4E86\u3002\u536B\u961F\u957F\u827E\u62C9\u4ECD\u5728\u8857\u533A\u5C3D\u5934\uFF0C\u4F46\u7A7A\u8A93\u5B88\u536B\u5835\u4F4F\u4E86\u9053\u8DEF\u3002\u522B\u4ECE\u6B63\u9762\u786C\u62FC\uFF0C\u77F3\u9636\u80FD\u901A\u5F80\u5C4B\u9876\uFF0C\u623F\u5C4B\u5927\u95E8\u4E5F\u662F\u5F00\u7684\u3002\u51FB\u8D254\u4E2A\u5B88\u536B\uFF0C\u8BA9\u5E78\u5B58\u8005\u53EF\u4EE5\u64A4\u51FA\u3002", "At last, help has arrived. Captain Eira is still at the far end of the district, but the Hollow Oathguards block our escape. Do not charge straight into them. The stone stairs lead to the roofs, and the house doors are open. Defeat four guards so the survivors can leave."], { xp: 4e5, coins: 2500 });
kill("city-rescue", ["\u6551\u63F4\u5B88\u536B", "Rescue the watchmen"], ["\u51FB\u8D25 4 \u4E2A\u7A7A\u8A93\u5B88\u536B", "Defeat 4 Hollow Oathguards"], ["city_guard"], 4, "city", 1);
talk("city-captain", "eira", ["\u827E\u62C9\u7684\u79D8\u5BC6", "Eira\u2019s secret"], ["\u6211\u4EEC\u4E0D\u662F\u88AB\u5916\u654C\u51FB\u8D25\u7684\u3002\u56FD\u738B\u628A\u76F8\u4F4D\u6838\u5FC3\u57CB\u5728\u57CE\u4E0B\uFF0C\u4EE5\u4E3A\u80FD\u6321\u4F4F\u88C2\u9699\u4E2D\u7684\u4E1C\u897F\uFF0C\u6700\u540E\u5374\u88AB\u5B83\u541E\u566C\u3002\u5148\u68C0\u67E5\u897F\u4FA7\u548C\u4E1C\u4FA7\u88C5\u7F6E\uFF0C\u518D\u68C0\u67E5\u6838\u5FC3\u6BBF\u95E8\u53E3\u7684\u5C01\u5370\u3002\u4E0D\u8981\u78B0\u6838\u5FC3\u672C\u4F53\u3002", "An invading army did not defeat us. Our king buried a Phase Core beneath the city to hold back something in the rift. In the end, it consumed him. Inspect the western and eastern relays, then the seal at the Core Hall entrance. Do not touch the core itself."], { xp: 6e5, materials: { core: 120 } });
talk("city-relay-west", "westseal", ["\u7B2C\u4E00\u5904\u88C5\u7F6E", "The first relay"], ["\u88C5\u7F6E\u4E2D\u7684\u8BB0\u5FC6\u4ECD\u5728\u91CD\u590D\uFF1A\u5173\u95ED\u57CE\u95E8\uFF0C\u64A4\u5165\u8857\u533A\u3002\u76F8\u4F4D\u80FD\u91CF\u4E0D\u662F\u5411\u5916\u6D41\u52A8\uFF0C\u800C\u662F\u5728\u628A\u6574\u5EA7\u57CE\u5E02\u7684\u751F\u547D\u5F15\u5411\u5730\u4E0B\u3002\u4F60\u5173\u95ED\u4E86\u5931\u63A7\u7684\u56DE\u8DEF\u3002", "The relay repeats an old command: close the gates, fall back into the district. Its energy is not flowing outward. It is drawing the city\u2019s life underground. You shut down the unstable circuit."], { xp: 3e5 }, ["\u5173\u95ED\u56DE\u8DEF", "Shut down the circuit"]);
talk("city-relay-east", "eastseal", ["\u7B2C\u4E8C\u5904\u88C5\u7F6E", "The second relay"], ["\u88C5\u7F6E\u4FDD\u5B58\u7740\u536B\u961F\u6700\u540E\u7684\u8BB0\u5F55\uFF1A\u56FD\u738B\u5DF2\u4E0D\u5728\u94E0\u7532\u91CC\u3002\u4E0D\u8981\u76F8\u4FE1\u4ED6\u7684\u547D\u4EE4\u3002\u88C2\u9699\u9700\u8981\u4E00\u5177\u738B\u51A0\u6765\u7EF4\u6301\u5F62\u4F53\u3002\u4F60\u5207\u65AD\u4E86\u88C5\u7F6E\u4E0E\u6838\u5FC3\u7684\u8FDE\u63A5\u3002", "The relay contains the guard\u2019s final record: the king is no longer inside his armor. Do not obey his commands. The rift needs a crown to hold its form. You sever the relay\u2019s link to the core."], { xp: 3e5 }, ["\u5207\u65AD\u8FDE\u63A5", "Sever the link"]);
talk("city-relay-gate", "gateseal", ["\u7B2C\u4E09\u5904\u88C5\u7F6E", "The third relay"], ["\u5C01\u5370\u8BB0\u5F55\u663E\u793A\uFF0C\u8FD8\u6709\u4E00\u4F4D\u5931\u8A93\u9A91\u58EB\u5728\u5B88\u62A4\u8FD9\u91CC\u3002\u4ED6\u4E0D\u662F\u5B88\u7740\u56FD\u738B\uFF0C\u800C\u662F\u5728\u963B\u6B62\u7A7A\u51A0\u79BB\u5F00\u6838\u5FC3\u6BBF\u3002\u5FC5\u987B\u51FB\u8D25\u4ED6\uFF0C\u624D\u80FD\u8BA9\u5C01\u5370\u89E3\u9664\u3002", "The seal reveals that a Forsworn Knight still guards this place. He is not protecting the king. He is keeping the Empty Crown inside the Core Hall. Defeat him to release the seal."], { xp: 4e5 }, ["\u8BB0\u5F55\u7EBF\u7D22", "Record the findings"]);
talk("city-knight-brief", "eira", ["\u5931\u8A93\u7684\u5B88\u95E8\u4EBA", "The forsaken gatekeeper"], ["\u9A91\u58EB\u4F1A\u4E3E\u76FE\uFF0C\u4E5F\u4F1A\u6CBF\u7740\u5730\u4E0A\u7684\u91D1\u8272\u67AA\u7EBF\u51B2\u950B\u3002\u770B\u6E05\u653B\u51FB\u9884\u5146\uFF0C\u4ECE\u4FA7\u9762\u8EB2\u5F00\uFF0C\u518D\u5BFB\u627E\u673A\u4F1A\u53CD\u51FB\u3002\u6211\u4F1A\u7559\u4E0B\u6765\u4FDD\u62A4\u963F\u9686\u3002", "The knight raises his shield and charges along the golden line on the ground. Watch his attack warnings, dodge to the side, then strike back. I will stay here to protect Aron."]);
kill("city-knight", ["\u6253\u7834\u65E7\u8A93", "Break the old oath"], ["\u51FB\u8D25\u5934\u76EE\uFF1A\u5931\u8A93\u9A91\u58EB", "Defeat the Forsworn Knight"], ["oathknight"], 1, "city");
talk("city-core-open", "eira", ["\u6253\u5F00\u6838\u5FC3\u6BBF", "Open the Core Hall"], ["\u5C01\u5370\u89E3\u9664\u4E86\u3002\u6CBF\u7740\u4E0B\u6C89\u77F3\u9053\u8FDB\u5165\u5730\u4E0B\uFF0C\u6E05\u96643\u4E2A\u88C2\u9699\u4F8D\u796D\uFF0C\u522B\u8BA9\u5B83\u4EEC\u7EE7\u7EED\u5582\u517B\u6838\u5FC3\u3002\u7A7A\u51A0\u4E4B\u738B\u4F1A\u5728\u53D7\u4F24\u540E\u6495\u5F00\u66F4\u591A\u88C2\u9699\uFF0C\u522B\u7AD9\u5728\u84DD\u8272\u9884\u5146\u91CC\u3002", "The seal is broken. Follow the descending stone passage underground. Defeat three Rift Acolytes before they can keep feeding the core. The Empty-Crowned King tears open more rifts when wounded. Stay out of the blue warning zones."], { xp: 8e5, materials: { core: 200 } });
kill("city-acolytes", ["\u5207\u65AD\u732E\u796D", "Stop the sacrifice"], ["\u51FB\u8D25 3 \u4E2A\u88C2\u9699\u4F8D\u796D", "Defeat 3 Rift Acolytes"], ["city_acolyte"], 3, "city", 2);
level("city-final-level", 90);
kill("city-empty-king", ["\u738B\u51A0\u4E4B\u4E0B", "Beneath the crown"], ["\u51FB\u8D25\u7A7A\u51A0\u4E4B\u738B", "Defeat the Empty-Crowned King"], ["emptyking"], 1, "city");
talk("city-aftermath", "eira", ["\u65E0\u4EBA\u4E4B\u51A0", "A crown without a king"], ["\u738B\u51A0\u7EC8\u4E8E\u843D\u4E0B\u4E86\u3002\u8C22\u8C22\u4F60\uFF0C\u738B\u57CE\u91CC\u7684\u5E78\u5B58\u8005\u80FD\u91CD\u89C1\u5929\u65E5\u4E86\u3002\u4F46\u6838\u5FC3\u6DF1\u5904\u4ECD\u4F20\u6765\u56DE\u58F0\uFF1A\u56FD\u738B\u53EA\u662F\u88AB\u9009\u4E2D\u7684\u5BB9\u5668\u3002\u771F\u6B63\u5524\u9192\u5B83\u7684\u4E1C\u897F\uFF0C\u8FD8\u5728\u66F4\u8FDC\u7684\u5730\u65B9\u3002", "The crown has finally fallen. Thank you. The survivors can see daylight again. Yet an echo remains deep within the core: the king was only a chosen vessel. Whatever awakened it is still out there."], { xp: 15e5, coins: 15e3, materials: { core: 400 } });
const LEGACY_QUEST_IDS = steps.map((q) => q.id);
function interlude(before, minimum, npc, map, x, z, title, dialogue, objects, xp, coins) {
  const start = steps.length;
  level(before + "-prepare", minimum);
  talk(before + "-brief", npc, title, dialogue);
  for (const o of objects) {
    QUEST_NPCS[o.id] ??= { name: o.name[0], en: o.name[1], map, x: o.x, z: o.z, role: ["\u4EFB\u52A1\u5730\u70B9", "Story location"] };
    talk(before + "-" + o.id, o.id, o.name, o.text, { xp: Math.floor(xp / (objects.length + 1)), coins: Math.floor(coins / (objects.length + 1)) }, ["\u8C03\u67E5\u5E76\u5B8C\u6210", "Investigate and finish"]);
  }
  if (before === "reach-twenty") kill(before + "-pursuers", ["\u6E05\u7406\u8FFD\u5175", "Clear the pursuers"], ["\u51FB\u8D25 3 \u4E2A\u4E2D\u90E8\u730E\u624B\uFF0C\u6253\u901A\u54E8\u5175\u7684\u56DE\u7A0B", "Defeat 3 hunters in the hunting grounds to clear the watchman\u2019s return route"], ["hunter"], 3, "tribe", 1);
  if (before === "reach-fifty") kill(before + "-pursuers", ["\u4FDD\u4F4F\u7814\u7A76\u6210\u679C", "Protect the findings"], ["\u51FB\u8D25 3 \u4E2A\u68D8\u679D\u730E\u624B\uFF0C\u963B\u6B62\u5B83\u4EEC\u7834\u574F\u523B\u5370", "Defeat 3 Thornstalkers before they damage the inscriptions"], ["thorn"], 3, "forest");
  talk(before + "-report", npc, ["\u5E26\u56DE\u6D88\u606F", "Report your findings"], ["\u4F60\u5E26\u56DE\u7684\u6D88\u606F\u8BA9\u6211\u4EEC\u6709\u4E86\u4E0B\u4E00\u6B65\u8BA1\u5212\u3002\u6536\u4E0B\u8865\u7ED9\uFF0C\u7EE7\u7EED\u78E8\u7EC3\u4F60\u7684\u529B\u91CF\uFF0C\u7136\u540E\u63A5\u4E0B\u6311\u6218\u3002", "Your findings give us a way forward. Take these supplies, continue honing your abilities, then face the next challenge."], { xp: Math.ceil(xp / (objects.length + 1)), coins: Math.ceil(coins / (objects.length + 1)) });
  const added = steps.splice(start);
  const index = steps.findIndex((q) => q.id === before);
  steps.splice(index, 0, ...added);
}
QUEST_NPCS.watchman = { name: "\u5931\u8054\u54E8\u5175", en: "Stranded Watchman", map: "tribe", x: 8, z: 325, role: ["\u53D7\u4F24\u7684\u5DE1\u903B\u8005", "Wounded Patroller"] };
interlude("reach-twenty", 15, "tok", "tribe", 0, 0, ["\u5931\u8054\u7684\u54E8\u5175", "The missing watchman"], ["\u5DE1\u903B\u961F\u5931\u8054\u4E86\u3002\u5148\u627E\u5230\u54E8\u5175\uFF0C\u518D\u6CBF\u730E\u9053\u68C0\u67E5\u4E09\u6839\u5C01\u5370\u77F3\u67F1\uFF0C\u963B\u6B62\u796D\u575B\u7EE7\u7EED\u53EC\u96C6\u517D\u7FA4\u3002", "Our patrol is missing. Find the watchman, then inspect three seal pillars along the trail before the altar calls more beasts."], [
  { id: "watchman", name: ["\u6551\u63F4\u54E8\u5175", "Aid the watchman"], x: 8, z: 325, text: ["\u6211\u8FD8\u80FD\u81EA\u5DF1\u8D70\uFF0C\u4F46\u77F3\u67F1\u5DF2\u7ECF\u88C2\u5F00\u3002\u66FF\u6211\u5173\u95ED\u6CBF\u8DEF\u7684\u4E09\u4E2A\u56DE\u8DEF\uFF0C\u6211\u5C31\u80FD\u5B89\u5168\u8FD4\u56DE\u730E\u9053\u5165\u53E3\u3002", "I can still walk, but the pillars are cracked. Close the three circuits along the trail so I can safely return to the entrance."] },
  ...[260, 300, 340].map((z, i) => ({ id: "tribe" + i + "seal", name: ["\u5C01\u5370\u77F3\u67F1 " + (i + 1), "Seal Pillar " + (i + 1)], x: i % 2 ? 8 : -8, z, text: ["\u4F60\u91CD\u65B0\u63A5\u901A\u77F3\u67F1\uFF0C\u88C2\u9699\u7684\u4F4E\u9E23\u9010\u6E10\u6D88\u9000\u3002", "You reconnect the pillar. The low hum of the rift begins to fade."] }))
], 9e3, 100);
interlude("reach-thirty", 25, "raka", "tribe", 0, 0, ["\u796D\u575B\u7684\u56DE\u58F0", "Echoes of the altar"], ["\u6208\u62C9\u4EC0\u7684\u529B\u91CF\u5728\u6CBF\u7740\u56FE\u817E\u4F20\u64AD\u3002\u68C0\u67E5\u5916\u56F4\u7684\u4E24\u5EA7\u65E7\u56FE\u817E\uFF0C\u627E\u51FA\u529B\u91CF\u6D41\u5411\uFF0C\u7136\u540E\u56DE\u6765\u544A\u8BC9\u6211\u3002", "Gorash spreads his power through the totems. Inspect two old totems in the outer territory and trace the flow of energy."], [600, 720].map((z, i) => ({ id: "outer" + i + "seal", name: ["\u65E7\u56FE\u817E " + (i + 1), "Old Totem " + (i + 1)], x: i ? 10 : -10, z, text: ["\u56FE\u817E\u4E0A\u7684\u7EB9\u8DEF\u671D\u5411\u6700\u6DF1\u5904\u7684\u796D\u575B\u3002\u4F60\u5207\u65AD\u4E86\u5B83\u4E0E\u517D\u7FA4\u7684\u8054\u7CFB\u3002", "The markings point toward the deepest altar. You sever its link to the beasts."] })), 45e3, 250);
interlude("reach-forty", 35, "mira", "forest", 0, 0, ["\u82CF\u9192\u7684\u6839\u8109", "Awakening roots"], ["\u6811\u6839\u6B63\u5728\u541E\u566C\u6797\u5730\u7684\u6C34\u6E90\u3002\u68C0\u67E5\u6797\u53E3\u7684\u6839\u7ED3\u4E0E\u77F3\u5F84\u8FB9\u7684\u6CC9\u773C\uFF0C\u518D\u56DE\u6765\u627E\u6211\u3002", "The roots are draining the woodland springs. Inspect the root knot and the spring beside the stone trail, then return to me."], [{ id: "rootsseal", name: ["\u5F02\u5E38\u6839\u7ED3", "Disturbed Root Knot"], x: 0, z: 52, text: ["\u4F60\u677E\u5F00\u7F20\u7ED5\u7684\u6839\u987B\uFF0C\u53D1\u73B0\u80FD\u91CF\u6B63\u6D41\u5411\u68EE\u6797\u4EA4\u754C\u3002", "You loosen the tangled roots and discover energy flowing toward the woodland crossing."] }, { id: "springseal", name: ["\u5E72\u6DB8\u6CC9\u773C", "Dry Spring"], x: 0, z: 92, text: ["\u6E05\u9664\u6CC9\u773C\u91CC\u7684\u6676\u5C51\u540E\uFF0C\u7EC6\u5C0F\u7684\u6C34\u6D41\u91CD\u65B0\u51FA\u73B0\u3002", "You clear crystal debris from the spring. A thin stream begins flowing again."] }], 12e4, 600);
interlude("reach-fifty", 45, "ilun", "forest", 0, 0, ["\u53E4\u6811\u7684\u8BB0\u5FC6", "Memories of the elder trees"], ["\u9AD8\u53F0\u4E0A\u7684\u523B\u5370\u8BB0\u5F55\u4E86\u4E94\u884C\u796D\u575B\u7684\u6765\u5386\u3002\u8C03\u67E5\u4E24\u5904\u6811\u65C1\u523B\u5370\uFF0C\u6211\u4F1A\u5E2E\u4F60\u89E3\u8BFB\u3002", "The terrace inscriptions record the origin of the five altars. Investigate two carvings beside the trees and I will decipher them."], [150, 180].map((z, i) => ({ id: "tree" + i + "seal", name: ["\u53E4\u6811\u523B\u5370 " + (i + 1), "Elder Inscription " + (i + 1)], x: 0, z, text: ["\u523B\u5370\u63ED\u793A\u796D\u575B\u662F\u5C01\u5370\uFF0C\u800C\u4E0D\u662F\u4F9B\u5949\u5DE8\u4EBA\u7684\u795E\u5E99\u3002", "The inscription reveals that the altars are seals, not temples built to worship giants."] })), 24e4, 1200);
interlude("reach-sixty", 55, "sen", "forest", 0, 0, ["\u91CD\u65B0\u8FDE\u63A5\u4E94\u884C", "Reconnect the five"], ["\u5148\u68C0\u67E5\u901A\u9053\u9644\u8FD1\u7684\u4E09\u5904\u5F15\u6D41\u77F3\uFF0C\u6062\u590D\u796D\u575B\u4E4B\u95F4\u7684\u8054\u7CFB\u3002\u4FDD\u6301\u8DDD\u79BB\uFF0C\u4E0D\u8981\u60CA\u52A8\u6C34\u6676\u5DE8\u4EBA\u3002", "Inspect three channeling stones near the passage to reconnect the altars. Keep your distance from the crystal titans."], [240, 260, 280].map((z, i) => ({ id: "flow" + i + "seal", name: ["\u4E94\u884C\u5F15\u6D41\u77F3 " + (i + 1), "Channeling Stone " + (i + 1)], x: 55, z, text: ["\u77F3\u7EB9\u91CD\u65B0\u4EAE\u8D77\uFF0C\u4E00\u675F\u80FD\u91CF\u6D41\u56DE\u4E94\u884C\u796D\u575B\u3002", "The carved lines light up and a stream of energy returns to the five altars."] })), 42e4, 2e3);
interlude("city-level", 65, "gruk", "tribe", 0, 0, ["\u65E7\u738B\u57CE\u7684\u4FE1\u53F7", "A signal from the old city"], ["\u738B\u57CE\u7684\u6C42\u6551\u4FE1\u53F7\u51FA\u73B0\u5728\u90E8\u843D\u65E7\u54E8\u7AD9\u3002\u68C0\u67E5\u4E24\u5904\u4FE1\u53F7\u77F3\uFF0C\u627E\u5230\u5E78\u5B58\u8005\u7559\u4E0B\u7684\u8DEF\u7EBF\u3002", "A distress signal from the city has reached our old outposts. Inspect two signal stones and find the route left by the survivors."], [80, 160].map((z, i) => ({ id: "signal" + i + "seal", name: ["\u6C42\u6551\u4FE1\u53F7\u77F3 " + (i + 1), "Distress Signal Stone " + (i + 1)], x: 8, z, text: ["\u6B8B\u5B58\u7684\u8BB0\u5F55\u6307\u5411\u738B\u57CE\u5E78\u5B58\u8005\u8587\u5A05\u3002\u4F60\u8BB0\u4E0B\u4E86\u8FDB\u5165\u5E9F\u57CE\u7684\u8DEF\u7EBF\u3002", "The surviving record points to Veya, a city survivor. You record the route into the ruins."] })), 65e4, 3500);
interlude("city-final-level", 85, "eira", "city", 0, 0, ["\u738B\u51A0\u7684\u5F31\u70B9", "The crown\u2019s weakness"], ["\u8FDB\u6838\u5FC3\u6BBF\u524D\uFF0C\u67E5\u9605\u8857\u533A\u91CC\u4E24\u5904\u536B\u961F\u8BB0\u5F55\u3002\u56FD\u738B\u53D7\u4F24\u65F6\u4F1A\u6495\u5F00\u88C2\u9699\uFF0C\u4F46\u536B\u961F\u53EF\u80FD\u7559\u4E0B\u4E86\u8EB2\u907F\u7684\u65B9\u6CD5\u3002", "Before entering the Core Hall, inspect two guard records in the district. The wounded king tears open rifts, but the guards may have recorded a way to evade them."], [{ id: "guardrecordseal", name: ["\u536B\u961F\u6218\u6597\u8BB0\u5F55", "Guard Combat Record"], x: -10, z: 220, text: ["\u8BB0\u5F55\u63D0\u9192\u4F60\u89C2\u5BDF\u5730\u9762\u7684\u84DD\u8272\u9884\u5146\uFF0C\u63D0\u524D\u79BB\u5F00\u88C2\u9699\u843D\u70B9\u3002", "The record warns you to watch the blue marks and leave the rift impact zones early."] }, { id: "crownrecordseal", name: ["\u738B\u51A0\u88C2\u9699\u8BB0\u5F55", "Crown Rift Record"], x: 10, z: 325, text: ["\u8BB0\u5F55\u663E\u793A\u7A7A\u51A0\u5728\u534A\u8840\u540E\u4F1A\u52A0\u5FEB\u6495\u88C2\u3002\u4F60\u5C06\u60C5\u62A5\u5E26\u56DE\u7ED9\u827E\u62C9\u3002", "The record shows that the crown tears rifts faster below half health. Bring this warning to Eira."] }], 1e6, 5e3);
const REVISION_TWO_IDS = steps.map((q) => q.id);
const errandsStart = steps.length;
talk("tribe-recovery-brief", "tok", ["\u91CD\u5EFA\u730E\u9053", "Rebuild the hunting trail"], ["\u4E0D\u7528\u6025\u7740\u6311\u6218\u914B\u957F\u3002\u5DE1\u903B\u961F\u7559\u4E0B\u4E86\u51E0\u4EF6\u6025\u4E8B\uFF1A\u67E5\u6E05\u8DB3\u8FF9\u3001\u4FEE\u590D\u9632\u7EBF\uFF0C\u518D\u628A\u8865\u7ED9\u9001\u5230\u54E8\u5175\u90A3\u91CC\u3002\u6BCF\u5B8C\u6210\u4E00\u4EF6\u90FD\u4F1A\u7ED9\u4F60\u62A5\u916C\u3002", "There is no need to challenge the chieftain yet. The patrol needs help tracing tracks, repairing defenses and delivering supplies to the watchman. You will be paid for each task."]);
const recoverySites = [
  { id: "tracksseal", name: ["\u6298\u65AD\u7684\u9AA8\u77DB", "Broken Bone Spear"], x: -8, z: 230, text: ["\u9AA8\u77DB\u65C1\u7684\u8DB3\u8FF9\u7ED5\u5F00\u4E86\u5927\u95E8\uFF0C\u6CBF\u897F\u4FA7\u8FDB\u5165\u730E\u9053\u3002\u4F60\u8BB0\u5F55\u4E86\u88AD\u51FB\u8005\u7684\u8DEF\u7EBF\u3002", "Tracks beside the spear bypass the gate and enter from the west. You record the attackers\u2019 route."], reply: ["\u8BB0\u5F55\u8DB3\u8FF9", "Record the tracks"] },
  { id: "trailseal", name: ["\u6563\u843D\u7684\u5DE1\u903B\u6807\u8BB0", "Scattered Patrol Markers"], x: 8, z: 250, text: ["\u4F60\u628A\u6563\u843D\u7684\u6807\u8BB0\u91CD\u65B0\u7ACB\u8D77\uFF0C\u6307\u51FA\u4E00\u6761\u907F\u5F00\u517D\u7FA4\u7684\u56DE\u7A0B\u8DEF\u7EBF\u3002", "You put the fallen markers back in place, marking a return route away from the beasts."], reply: ["\u6062\u590D\u8DEF\u6807", "Restore the markers"] },
  { id: "timberseal", name: ["\u9632\u7EBF\u6728\u6599", "Defense Timber"], x: -8, z: 270, text: ["\u8FD9\u6279\u6728\u6599\u4ECD\u7136\u80FD\u7528\u3002\u4F60\u6574\u7406\u597D\u6728\u6599\uFF0C\u7559\u7ED9\u54E8\u5175\u4FEE\u8865\u9632\u7EBF\u3002", "This timber is still usable. You sort it for the watchmen to repair the defenses."], reply: ["\u6574\u7406\u6728\u6599", "Sort the timber"] },
  { id: "barricadeseal", name: ["\u7834\u635F\u7684\u9632\u7EBF", "Damaged Defense"], x: 8, z: 280, text: ["\u4F60\u7528\u9644\u8FD1\u7684\u6728\u6599\u52A0\u56FA\u4E86\u9632\u7EBF\uFF0C\u5DE1\u903B\u961F\u7EC8\u4E8E\u6709\u4E86\u53EF\u4EE5\u9000\u5B88\u7684\u4F4D\u7F6E\u3002", "You reinforce the defense with nearby timber, giving the patrol a place to fall back to."], reply: ["\u52A0\u56FA\u9632\u7EBF", "Reinforce the defense"] },
  { id: "suppliesseal", name: ["\u9057\u843D\u7684\u8865\u7ED9", "Abandoned Supplies"], x: -8, z: 290, text: ["\u8865\u7ED9\u6CA1\u6709\u88AB\u7834\u574F\u3002\u4F60\u6E05\u70B9\u5E76\u5C01\u597D\u5305\u88F9\uFF0C\u51C6\u5907\u4EA4\u7ED9\u5931\u8054\u54E8\u5175\u3002", "The supplies are intact. You count and seal the packages for the stranded watchman."], reply: ["\u6574\u7406\u8865\u7ED9", "Pack the supplies"] },
  { id: "signalrepairseal", name: ["\u7184\u706D\u7684\u4FE1\u53F7\u67F1", "Dark Signal Post"], x: 8, z: 310, text: ["\u4F60\u63A5\u597D\u677E\u8131\u7684\u56DE\u8DEF\uFF0C\u4FE1\u53F7\u67F1\u91CD\u65B0\u53D1\u4EAE\u3002\u5165\u53E3\u7684\u6258\u514B\u73B0\u5728\u80FD\u770B\u5230\u5DE1\u903B\u961F\u7684\u4FE1\u53F7\u4E86\u3002", "You reconnect the loose circuit. The post lights up, sending the patrol\u2019s signal back to Tok."], reply: ["\u4FEE\u590D\u4FE1\u53F7", "Restore the signal"] },
  { id: "smalltotemseal", name: ["\u730E\u9053\u53EC\u96C6\u56FE\u817E", "Trail Muster Totem"], x: -8, z: 350, text: ["\u4F60\u5173\u95ED\u56FE\u817E\u7684\u53EC\u96C6\u56DE\u8DEF\u3002\u8FD9\u91CC\u7684\u4F4E\u9E23\u6D88\u5931\u4E86\uFF0C\u54E8\u5175\u4E0D\u5FC5\u518D\u9760\u8FD1\u914B\u957F\u8425\u5730\u3002", "You shut down the totem\u2019s muster circuit. Its hum fades, sparing the watchman a trip to the chieftain\u2019s camp."], reply: ["\u5173\u95ED\u56FE\u817E", "Disable the totem"] }
];
for (const o of recoverySites) {
  QUEST_NPCS[o.id] = { name: o.name[0], en: o.name[1], map: "tribe", x: o.x, z: o.z, role: ["\u730E\u9053\u4E8B\u52A1", "Trail Errand"] };
  talk("tribe-recovery-" + o.id, o.id, o.name, o.text, { xp: 15e3, coins: 30 }, o.reply);
}
talk("tribe-recovery-deliver", "watchman", ["\u8865\u7ED9\u9001\u8FBE", "Supplies delivered"], ["\u8865\u7ED9\u548C\u4FE1\u53F7\u90FD\u6062\u590D\u4E86\uFF01\u6211\u4F1A\u5E26\u5DE1\u903B\u961F\u5B89\u5168\u8FD4\u56DE\uFF0C\u4E0D\u9700\u8981\u4F60\u66FF\u6211\u4EEC\u6311\u6218\u914B\u957F\u3002\u5E26\u4E0A\u8FD9\u4E9B\u8840\u74F6\uFF0C\u4F60\u4E5F\u8BE5\u4F11\u6574\u4E00\u4E0B\u3002", "Supplies and signals are restored! I can lead the patrol home without asking you to fight the chieftain. Take these potions and catch your breath."], { xp: 3e4, coins: 60, potions: { minor: 2 } }, ["\u4EA4\u4ED8\u8865\u7ED9", "Deliver the supplies"]);
talk("tribe-recovery-report", "tok", ["\u730E\u9053\u91CD\u65B0\u4EAE\u8D77", "The trail lights up again"], ["\u4F60\u505A\u7684\u8FD9\u4E9B\u4E8B\u8BA9\u6574\u6761\u730E\u9053\u6062\u590D\u4E86\u8054\u7CFB\u3002\u8FD9\u4EFD\u62A5\u916C\u662F\u4F60\u5E94\u5F97\u7684\uFF0C\u8840\u74F6\u4E5F\u66FF\u4F60\u5907\u597D\u4E86\u3002\u7B49\u51C6\u5907\u5145\u5206\uFF0C\u518D\u8003\u8651\u914B\u957F\u3002", "Your work has reconnected the whole trail. You have earned this payment, and I have prepared potions for you. Face the chieftain only when you are ready."], { xp: 5e4, coins: 100, potions: { minor: 3 } });
const recoverySteps = steps.splice(errandsStart);
steps.splice(steps.findIndex((q) => q.id === "reach-twenty"), 0, ...recoverySteps);
const REVISION_THREE_IDS = steps.map((q) => q.id);
for (const [before, id, title, goal, kinds, count] of [
  ["tribe-recovery-trailseal", "trackers", ["\u9A71\u6563\u8FFD\u730E\u8005", "Break the pursuit"], ["\u51FB\u8D2520\u4E2A\u4E2D\u90E8\u788E\u7259\u730E\u624B\uFF0C\u518D\u6062\u590D\u5DE1\u903B\u8DEF\u6807", "Defeat 20 hunters in the middle territory, then restore the patrol markers"], ["hunter"], 20],
  ["tribe-recovery-suppliesseal", "defense", ["\u5B88\u4F4F\u9632\u7EBF", "Hold the defense"], ["\u51FB\u8D2525\u4E2A\u4E2D\u90E8\u7A74\u5C45\u517D\u6216\u788E\u7259\u730E\u624B\uFF0C\u518D\u56DE\u6536\u8865\u7ED9", "Defeat 25 Grox or hunters in the middle territory, then recover the supplies"], ["grox", "hunter"], 25],
  ["tribe-recovery-smalltotemseal", "muster", ["\u5207\u65AD\u96C6\u7ED3", "Break the muster"], ["\u51FB\u8D2530\u4E2A\u4E2D\u90E8\u7A74\u5C45\u517D\u6216\u788E\u7259\u730E\u624B\uFF0C\u518D\u5173\u95ED\u53EC\u96C6\u56FE\u817E", "Defeat 30 Grox or hunters in the middle territory, then disable the muster totem"], ["grox", "hunter"], 30]
]) {
  const start = steps.length;
  kill("tribe-recovery-" + id, title, goal, [...kinds], count, "tribe", 1);
  steps[start].reward = { xp: 1e4 };
  const added = steps.splice(start);
  steps.splice(steps.findIndex((q) => q.id === before), 0, ...added);
}
for (const q of steps) {
  if (q.id === "tribe-recovery-deliver") q.reward.xp = 15e3;
  if (q.id === "tribe-recovery-report") q.reward.xp = 25e3;
}
const REVISION_FOUR_IDS = steps.map((q) => q.id), outerStart = steps.length;
level("tribe-outer-reach21", 21);
talk("tribe-outer-tok", "tok", ["\u4F59\u6CE2\u672A\u5E73", "Aftershocks"], ["\u914B\u957F\u5012\u4E0B\u540E\uFF0C\u730E\u624B\u4ECD\u5728\u8BD5\u63A2\u9632\u7EBF\u3002\u6E05\u740620\u4E2A\u4E2D\u90E8\u730E\u624B\uFF0C\u518D\u628A\u60C5\u51B5\u544A\u8BC9\u54E8\u5175\u3002\u522B\u6025\u7740\u76F4\u5954\u796D\u575B\u3002", "The chieftain is gone, but hunters still probe our defenses. Defeat 20 hunters in the middle territory, then report to the watchman. Do not rush to the altar."], { xp: 1500 });
kill("tribe-outer-patrol", ["\u5DE1\u903B\u730E\u9053", "Patrol the trail"], ["\u51FB\u8D2520\u4E2A\u4E2D\u90E8\u788E\u7259\u730E\u624B", "Defeat 20 hunters in the middle territory"], ["hunter"], 20, "tribe", 1);
talk("tribe-outer-watchman", "watchman", ["\u4EA4\u63A5\u5DE1\u903B", "Hand over the patrol"], ["\u9632\u7EBF\u7EC8\u4E8E\u80FD\u8F6E\u6362\u4E86\u3002\u6211\u53D1\u73B0\u6709\u517D\u7FA4\u5F80\u5916\u56F4\u79FB\u52A8\uFF0C\u7B49\u4F60\u5347\u523022\u7EA7\uFF0C\u53BB\u627E\u62C9\u5361\u95EE\u95EE\u5B83\u4EEC\u7684\u53BB\u5411\u3002", "We can finally rotate the watch. Beasts are moving toward the outer territory. Reach level 22, then ask Raka where they are heading."], { xp: 2e3 });
level("tribe-outer-reach22", 22);
talk("tribe-outer-raka", "raka", ["\u5916\u56F4\u7684\u52A8\u9759", "Trouble beyond the gate"], ["\u517D\u7FA4\u6CA1\u6709\u6563\u53BB\uFF0C\u800C\u662F\u5728\u7ED5\u7740\u5916\u56F4\u96C6\u7ED3\u3002\u6E05\u740620\u53EA\u5916\u56F4\u7A74\u5C45\u517D\uFF0C\u6211\u6765\u5224\u65AD\u796D\u575B\u7684\u4FE1\u53F7\u3002", "The beasts are gathering around the outer territory. Defeat 20 outer Grox while I study the altar signals."], { xp: 1500 });
kill("tribe-outer-grox20", ["\u6253\u6563\u96C6\u7ED3", "Disrupt the gathering"], ["\u51FB\u8D2520\u53EA\u5916\u56F4\u7A74\u5C45\u517D", "Defeat 20 Grox in the outer territory"], ["grox"], 20, "tribe", 2);
talk("tribe-outer-findings", "raka", ["\u517D\u7FA4\u7684\u65B9\u5411", "Where the beasts are heading"], ["\u5B83\u4EEC\u90FD\u5728\u54CD\u5E94\u540C\u4E00\u4E2A\u56FE\u817E\u3002\u5148\u78E8\u7EC3\u523023\u7EA7\uFF0C\u518D\u53BB\u897F\u4FA7\u68C0\u67E5\u65E7\u56FE\u817E\u3002\u4E0D\u8981\u9760\u8FD1\u6700\u6DF1\u5904\u7684\u796D\u575B\u3002", "They all answer the same totem. Reach level 23, then inspect the old western totem. Stay away from the deepest altar."], { xp: 2e3 });
level("tribe-outer-reach23", 23);
QUEST_NPCS.outerpatrolseal = { name: "\u5916\u56F4\u5DE1\u903B\u56FE\u817E", en: "Outer Patrol Totem", map: "tribe", x: -10, z: 555, role: ["\u4EFB\u52A1\u5730\u70B9", "Story location"] };
talk("tribe-outer-totem", "outerpatrolseal", ["\u622A\u83B7\u53EC\u96C6\u4FE1\u53F7", "Intercept the muster signal"], ["\u56FE\u817E\u523B\u7EB9\u6B63\u5411\u796D\u575B\u4F20\u9012\u8BAF\u606F\u3002\u4F60\u8BB0\u4E0B\u9891\u7387\uFF0C\u51C6\u5907\u4EA4\u7ED9\u62C9\u5361\u3002", "The carvings relay a signal toward the altar. You record its rhythm for Raka."], { xp: 1500 }, ["\u8BB0\u5F55\u4FE1\u53F7", "Record the signal"]);
talk("tribe-outer-report", "raka", ["\u51C6\u5907\u5411\u5916\u63A8\u8FDB", "Prepare to push outward"], ["\u4FE1\u53F7\u5DF2\u7ECF\u786E\u8BA4\u4E86\u3002\u63A5\u4E0B\u6765\u6211\u4EEC\u8981\u4E3A25\u7EA7\u7684\u5916\u56F4\u884C\u52A8\u505A\u51C6\u5907\u3002", "The signal is confirmed. We must now prepare for the level-25 operation."], { xp: 1500 });
level("tribe-outer-half23", 1);
talk("tribe-outer-ready25", "raka", ["\u6574\u88C5\u5F85\u53D1", "Ready for the next push"], ["\u4F60\u5DF2\u7ECF\u80FD\u5728\u5916\u56F4\u7AD9\u7A33\u811A\u8DDF\u4E86\u3002\u63A5\u4E0B\u6765\u5347\u523025\u7EA7\uFF0C\u7136\u540E\u56DE\u6765\u4E00\u8D77\u6E05\u7406\u796D\u575B\u5916\u56F4\u3002\u4FDD\u6301\u8BAD\u7EC3\uFF0C\u522B\u5192\u8FDB\u3002", "You can now hold your ground outside. Reach level 25, then return to clear the altar outskirts. Keep training and do not overextend."]);
level("tribe-outer-reach25", 25);
const outerSteps = steps.splice(outerStart);
steps.splice(steps.findIndex((q) => q.id === "raka-scout"), 0, ...outerSteps);
const REVISION_FIVE_IDS = steps.map((q) => q.id);
const patrols = [
  ["reach-five", "gruk", "tribe", ["grox"], 0, "signal0seal", ["\u51FA\u751F\u70B9\u5916\u7684\u7A74\u5C45\u517D", "Grox outside the camp"]],
  ["reach-twenty-prepare", "tok", "tribe", ["hunter"], 1, "tracksseal", ["\u4E2D\u90E8\u788E\u7259\u730E\u624B", "hunters in the middle territory"]],
  ["reach-twenty", "tok", "tribe", ["grox", "hunter"], 1, "trailseal", ["\u4E2D\u90E8\u7A74\u5C45\u517D\u6216\u788E\u7259\u730E\u624B", "Grox or hunters in the middle territory"]],
  ["tribe-outer-reach21", "tok", "tribe", ["hunter"], 1, "tracksseal", ["\u4E2D\u90E8\u788E\u7259\u730E\u624B", "hunters in the middle territory"]],
  ["tribe-outer-reach22", "watchman", "tribe", ["grox", "hunter"], 1, "trailseal", ["\u4E2D\u90E8\u7A74\u5C45\u517D\u6216\u788E\u7259\u730E\u624B", "Grox or hunters in the middle territory"]],
  ["tribe-outer-reach23", "raka", "tribe", ["grox", "hunter"], 2, "outerpatrolseal", ["\u5916\u56F4\u7A74\u5C45\u517D\u6216\u788E\u7259\u730E\u624B", "Grox or hunters in the outer territory"]],
  ["tribe-outer-reach25", "raka", "tribe", ["grox", "hunter"], 2, "outerpatrolseal", ["\u5916\u56F4\u7A74\u5C45\u517D\u6216\u788E\u7259\u730E\u624B", "Grox or hunters in the outer territory"]],
  ["reach-thirty-prepare", "raka", "tribe", ["grox", "hunter"], 2, "outer0seal", ["\u5916\u56F4\u7A74\u5C45\u517D\u6216\u788E\u7259\u730E\u624B", "Grox or hunters in the outer territory"]],
  ["reach-thirty", "raka", "tribe", ["grox", "hunter"], 2, "outer1seal", ["\u5916\u56F4\u7A74\u5C45\u517D\u6216\u788E\u7259\u730E\u624B", "Grox or hunters in the outer territory"]],
  ["reach-forty-prepare", "mira", "forest", ["mossling"], 0, "rootsseal", ["\u68EE\u6797\u5165\u53E3\u82D4\u7532\u517D", "Mossbacks in the woodland"]],
  ["reach-forty", "mira", "forest", ["mossling"], 0, "springseal", ["\u68EE\u6797\u5165\u53E3\u82D4\u7532\u517D", "Mossbacks in the woodland"]],
  ["reach-fifty-prepare", "ilun", "forest", ["thorn"], 1, "tree0seal", ["\u9AD8\u53F0\u68D8\u679D\u730E\u624B", "Thornstalkers on the terrace"]],
  ["reach-fifty", "ilun", "forest", ["thorn"], 1, "tree1seal", ["\u9AD8\u53F0\u68D8\u679D\u730E\u624B", "Thornstalkers on the terrace"]],
  ["reach-sixty-prepare", "sen", "forest", ["sentinel"], 2, "flow0seal", ["\u796D\u575B\u533A\u57DF\u6676\u58F3\u5B88\u536B", "Crystal Sentinels around the altars"]],
  ["reach-sixty", "sen", "forest", ["sentinel"], 2, "flow1seal", ["\u796D\u575B\u533A\u57DF\u6676\u58F3\u5B88\u536B", "Crystal Sentinels around the altars"]],
  ["city-level-prepare", "sen", "forest", ["sentinel"], 2, "flow2seal", ["\u796D\u575B\u533A\u57DF\u6676\u58F3\u5B88\u536B", "Crystal Sentinels around the altars"]],
  ["city-level", "sen", "forest", ["sentinel"], 2, "flow2seal", ["\u796D\u575B\u533A\u57DF\u6676\u58F3\u5B88\u536B", "Crystal Sentinels around the altars"]],
  ["city-final-level-prepare", "eira", "city", ["city_guard"], 1, "guardrecordseal", ["\u8857\u533A\u7A7A\u8A93\u5B88\u536B", "Hollow Oathguards in the district"]],
  ["city-final-level", "eira", "city", ["city_guard", "city_acolyte"], void 0, "crownrecordseal", ["\u7A7A\u8A93\u5B88\u536B\u6216\u88C2\u9699\u4F8D\u796D", "Hollow Oathguards or Rift Acolytes"]]
];
for (const [gate, npc, map, kinds, region, object, names] of patrols) {
  const at = steps.findIndex((q) => q.id === gate);
  if (at < 0) continue;
  const target = steps[at].level, start = steps.length;
  talk(gate + "-patrol-brief", npc, ["\u5DE1\u730E\u5B89\u6392", "Patrol assignment"], ["\u7EE7\u7EED\u6210\u957F\u5230" + target + "\u7EA7\u3002\u8FD9\u6BB5\u65F6\u95F4\u6211\u4EEC\u4E5F\u9700\u8981\u4F60\u5DE1\u730E\u3001\u68C0\u67E5\u7EBF\u7D22\uFF0C\u5B8C\u6210\u4E00\u6BB5\u5C31\u56DE\u6765\u4EA4\u63A5\u3002", "Keep training toward level " + target + ". Help us patrol and investigate between hunts; report after each assignment."]);
  kill(gate + "-patrol-hunt", ["\u5DE1\u730E\u6E05\u969C", "Clear the patrol route"], ["\u51FB\u8D2520\u4E2A" + names[0], "Defeat 20 " + names[1]], kinds, 20, map, region);
  const site = QUEST_NPCS[object] ? object : npc;
  talk(gate + "-patrol-investigate", site, ["\u786E\u8BA4\u5DE1\u903B\u7EBF\u7D22", "Check the patrol clues"], ["\u9644\u8FD1\u7684\u75D5\u8FF9\u5DF2\u7ECF\u8BB0\u5F55\u4E0B\u6765\u3002\u628A\u6D88\u606F\u5E26\u56DE\u53BB\uFF0C\u51C6\u5907\u4E0B\u4E00\u6BB5\u5DE1\u730E\u3002", "You record the nearby traces. Bring the findings back and prepare for the next patrol."], void 0, ["\u8BB0\u5F55\u7EBF\u7D22", "Record the findings"]);
  talk(gate + "-patrol-report", npc, ["\u5DE1\u903B\u4EA4\u63A5", "Patrol handover"], ["\u7EBF\u7D22\u6536\u5230\u4E86\u3002\u518D\u6E05\u740625\u4E2A" + names[0] + "\uFF0C\u6211\u4EEC\u5C31\u80FD\u5B89\u6392\u4E0B\u4E00\u73ED\u5DE1\u903B\u3002", "Findings received. Defeat another 25 " + names[1] + " so we can send out the next patrol."]);
  kill(gate + "-patrol-second", ["\u63A9\u62A4\u4E0B\u4E00\u73ED\u5DE1\u903B", "Cover the next patrol"], ["\u51FB\u8D2525\u4E2A" + names[0], "Defeat 25 " + names[1]], kinds, 25, map, region);
  talk(gate + "-patrol-finish", npc, ["\u5DE1\u730E\u56DE\u62A5", "Patrol report"], ["\u8FD9\u4E00\u6BB5\u5DE1\u730E\u7ED3\u675F\u4E86\u3002\u5982\u679C\u8FD8\u6CA1\u5230" + target + "\u7EA7\uFF0C\u5C31\u7EE7\u7EED\u4E0B\u4E00\u8F6E\uFF1B\u51C6\u5907\u597D\u540E\uFF0C\u6211\u4EEC\u4F1A\u63A5\u7740\u63A8\u8FDB\u4E3B\u7EBF\u3002", "This patrol is complete. If you are below level " + target + ", take the next patrol. Once ready, continue the main story."]);
  const added = steps.splice(start);
  for (const q of added) q.patrol = { target, gate };
  added[0].patrol.first = true;
  added.at(-1).patrol.last = true;
  steps.splice(at, 0, ...added);
}
const QUEST_XP_BUDGETS = [];
let budgetStart = 0, budgetLevel = 1;
function capStoryXP(end, target) {
  let required = 0;
  for (let l = budgetLevel; l < target; l++) required += xpRewardBase(l);
  const quests = steps.slice(budgetStart, end), total = quests.reduce((n, q) => n + (q.reward?.xp || 0), 0), budget = Math.floor(required * 0.2), scale = total > budget ? budget / total : 1;
  for (const q of quests) if (q.reward?.xp) q.reward.xp = Math.floor(q.reward.xp * scale);
  QUEST_XP_BUDGETS.push({ from: budgetLevel, to: target, budget, awarded: quests.reduce((n, q) => n + (q.reward?.xp || 0), 0) });
  budgetStart = end;
  budgetLevel = target;
}
for (let i = 0; i < steps.length; i++) {
  const q = steps[i];
  if (q.kind === "level" && Number.isInteger(q.level) && q.level > budgetLevel) capStoryXP(i + 1, q.level);
}
if (budgetStart < steps.length) capStoryXP(steps.length, Math.max(100, budgetLevel + 5));
for (const q of steps) if (q.patrol) q.reward = { xpFraction: 0.03 };
for (const q of steps) if (q.npc?.endsWith("seal")) {
  const n = QUEST_NPCS[q.npc], kind = /timber|barricade|repair|trail/.test(q.npc) ? ["\u4FEE\u590D", "Repair "] : /supplies/.test(q.npc) ? ["\u6574\u7406", "Pack "] : /tracks|record|signal0/.test(q.npc) ? ["\u8C03\u67E5", "Inspect "] : ["\u64CD\u4F5C", "Operate "];
  q.goal = [kind[0] + n.name, kind[1] + n.en];
}
Object.assign(QUEST_NPCS, BLIGHT_NPCS);
for (const q of BLIGHT_QUESTS) if (q.kind === "talk" && q.npc) {
  const n = QUEST_NPCS[q.npc];
  q.goal = [(q.npc.endsWith("seal") ? "\u64CD\u4F5C" : "\u4E0E") + n.name + (q.npc.endsWith("seal") ? "" : "\u4EA4\u8C08"), (q.npc.endsWith("seal") ? "Interact with " : "Talk to ") + n.en];
}
steps.push(...BLIGHT_QUESTS);
Object.assign(QUEST_NPCS, SANCTUM_NPCS);
for (const q of SANCTUM_QUESTS) if (q.kind === "talk" && q.npc) {
  const n = QUEST_NPCS[q.npc];
  q.goal = [(q.npc.endsWith("seal") ? "\u64CD\u4F5C" : "\u4E0E") + n.name + (q.npc.endsWith("seal") ? "" : "\u4EA4\u8C08"), (q.npc.endsWith("seal") ? "Interact with " : "Talk to ") + n.en];
}
steps.push(...SANCTUM_QUESTS);
for (const n of Object.values(QUEST_NPCS)) if (n.map === "tribe") n.z = tribeCompactZ(n.z);
for (const q of steps) if (q.map === "tribe" && q.z !== void 0) q.z = tribeCompactZ(q.z);
const REVISION_SIX_IDS = steps.map((q) => q.id);
for (const [before, map, region, npc, kind, zh, en] of BESTIARY_HUNTS) {
  const at = steps.findIndex((q) => q.id === before);
  if (at < 0 || !QUEST_NPCS[npc]) throw new Error("Invalid bestiary story link: " + before);
  const added = bestiaryQuestSteps(before, map, region, npc, kind, zh, en);
  added[0].goal = ["\u4E0E" + QUEST_NPCS[npc].name + "\u4EA4\u8C08", "Talk to " + QUEST_NPCS[npc].en];
  steps.splice(at, 0, ...added);
}
Object.assign(QUEST_NPCS, STARFALL_NPCS);
for (const q of STARFALL_QUESTS) if (q.kind === "talk" && q.npc) {
  const n = QUEST_NPCS[q.npc];
  q.goal = [(q.npc.endsWith("seal") ? "\u64CD\u4F5C" : "\u4E0E") + n.name + (q.npc.endsWith("seal") ? "" : "\u4EA4\u8C08"), (q.npc.endsWith("seal") ? "Interact with " : "Talk to ") + n.en];
}
steps.push(...STARFALL_QUESTS);
Object.assign(QUEST_NPCS, FROSTCOURT_NPCS);
for (const q of FROSTCOURT_QUESTS) if (q.kind === "talk" && q.npc) {
  const n = QUEST_NPCS[q.npc];
  q.goal = [(q.npc.endsWith("seal") ? "\u64CD\u4F5C" : "\u4E0E") + n.name + (q.npc.endsWith("seal") ? "" : "\u4EA4\u8C08"), (q.npc.endsWith("seal") ? "Interact with " : "Talk to ") + n.en];
}
steps.push(...FROSTCOURT_QUESTS);
Object.assign(QUEST_NPCS, SKYREACH_NPCS);
for (const q of SKYREACH_QUESTS) if (q.kind === "talk" && q.npc) {
  const n = QUEST_NPCS[q.npc];
  q.goal = [(q.npc.endsWith("seal") ? "\u64CD\u4F5C" : "\u4E0E") + n.name + (q.npc.endsWith("seal") ? "" : "\u4EA4\u8C08"), (q.npc.endsWith("seal") ? "Interact with " : "Talk to ") + n.en];
}
steps.push(...SKYREACH_QUESTS);
Object.assign(QUEST_NPCS, DUNES_NPCS);
for (const q of DUNES_QUESTS) if (q.kind === "talk" && q.npc) {
  const n = QUEST_NPCS[q.npc];
  q.goal = [(q.npc.endsWith("seal") ? "\u64CD\u4F5C" : "\u4E0E") + n.name + (q.npc.endsWith("seal") ? "" : "\u4EA4\u8C08"), (q.npc.endsWith("seal") ? "Interact with " : "Talk to ") + n.en];
}
steps.push(...DUNES_QUESTS);
function mapSecret(map) {
  if (!Object.hasOwn(SECRET_ORIGINS, map)) return null;
  const index = steps.findIndex((q) => q.id === SECRET_ORIGINS[map]);
  const origin = steps[index], npc = origin?.npc && QUEST_NPCS[origin.npc];
  if (!npc) return null;
  const point = secretLocation(map, npc, (x, z) => !blocked(x, z, 1, map, ancientMapHeight(map, x, z)));
  return point && { ...point, index, origin: origin.id, story: ANCIENT_SECRETS[map] };
}
const MAIN_QUESTS = steps;
for (const id of ["grox-five", "gruk-reward"]) steps.find((q) => q.id === id).kind = "openingSkip";
function questState(p) {
  const state = p.quest ??= { step: 0, count: 0, revision: 7 };
  if (state.revision !== 7) {
    const sequence = state.revision === 6 ? REVISION_SIX_IDS : state.revision === 5 ? REVISION_FIVE_IDS : state.revision === 4 ? REVISION_FOUR_IDS : state.revision === 3 ? REVISION_THREE_IDS : state.revision === 2 ? REVISION_TWO_IDS : LEGACY_QUEST_IDS, id = sequence[state.step];
    state.step = id ? MAIN_QUESTS.findIndex((q2) => q2.id === id) : state.step === sequence.length ? state.revision === 6 ? MAIN_QUESTS.findIndex((q2) => q2.id === "starfall-signal") : MAIN_QUESTS.findIndex((q2) => q2.id === "city-aftermath") + 1 : MAIN_QUESTS.length;
    const q = MAIN_QUESTS[state.step], bridge = id && MAIN_QUESTS.findIndex((q2) => q2.id === id + "-prepare");
    if ((state.revision || 1) < 3 && id === "reach-twenty" && p.level < 20) {
      state.step = MAIN_QUESTS.findIndex((q2) => q2.id === "tribe-recovery-brief");
      state.count = 0;
    } else if ((state.revision || 1) < 2 && q?.kind === "level" && p.level < q.level && typeof bridge === "number" && bridge >= 0) {
      state.step = bridge;
      state.count = 0;
    }
    if ((state.revision || 1) >= 5 && q?.kind === "level" && p.level < q.level) {
      const patrol = MAIN_QUESTS.findIndex((v) => v.id === id + "-patrol-brief");
      if (patrol >= 0) {
        state.step = patrol;
        state.count = 0;
      }
    }
    state.revision = 7;
  }
  return state;
}
function currentQuest(p) {
  return MAIN_QUESTS[questState(p).step];
}
function questText(text, p, english = false) {
  const job = p.profession && Object.hasOwn(PROFESSIONS, p.profession) ? PROFESSIONS[p.profession] : void 0;
  return text[english ? 1 : 0].replaceAll("{job}", job ? english ? job.en : job.name : english ? "Your profession" : "\u4F60\u7684\u804C\u4E1A").replaceAll("{zskill}", job ? english ? SKILLS[job.skills[1]].en : SKILLS[job.skills[1]].name : "Z").replaceAll("{cskill}", job ? english ? SKILLS[job.skills[2]].en : SKILLS[job.skills[2]].name : "C");
}
function questRewardInfo(p, q) {
  const r = q.reward, result = r?.xpFraction ? { ...r, xp: Math.max(1, Math.floor(xpRewardBase(p.level) * r.xpFraction)) } : { ...r };
  if (q.kind === "kill" || q.patrol?.last) {
    result.coins = (result.coins || 0) + Math.min(100, Math.max(2, p.level * 2));
    if ((q.count || 0) >= 20 || q.patrol?.last) {
      const potion = p.level < 30 ? "minor" : p.level < 70 ? "medium" : p.level < 100 ? "major" : "superior";
      result.potions = { ...result.potions, [potion]: (result.potions?.[potion] || 0) + 1 };
    }
  }
  if (result.potions) {
    const order = ["minor", "medium", "major", "superior", "ultimate"], upgraded = {};
    for (const [key, count] of Object.entries(result.potions)) {
      const index = order.indexOf(key), next = index < 0 ? key : order[Math.min(index + 1, order.length - 1)];
      upgraded[next] = (upgraded[next] || 0) + count;
    }
    result.potions = upgraded;
  }
  return Object.keys(result).length ? result : void 0;
}
function questReward(p, q) {
  const r = questRewardInfo(p, q);
  if (!r) return;
  if (r.unlockPurification) p.purificationUnlocked = true;
  if (r.xp) gainXP(p, r.xp);
  for (const [key, n] of Object.entries(r.potions || {})) p.potions[key] = (p.potions[key] || 0) + n;
  if (r.coins) p.coins = Math.round((p.coins + r.coins) * 100) / 100;
  for (const [key, n] of Object.entries(r.materials || {})) p.materials[key] = (p.materials[key] || 0) + n;
  const job = p.profession && PROFESSIONS[p.profession];
  if (job) {
    const index = r.qBook ? 0 : q.id === "tok-second" ? 1 : q.id === "tok-third" ? 2 : -1;
    if (index >= 0) {
      const key = skillBook(job.skills[index]);
      p.materials[key] = (p.materials[key] || 0) + 1;
    }
  }
}
function fulfilled(p, q, e) {
  const job = p.profession && PROFESSIONS[p.profession];
  if (q.kind === "openingSkip") return true;
  if (q.kind === "level") {
    const target = q.level, whole = Math.floor(target);
    return p.level >= Math.ceil(target) || p.level === whole && p.xp >= xpNeeded(whole) * (target - whole);
  }
  ;
  if (q.kind === "profession") return !!job;
  if (q.kind === "useQ") return !!job && e?.kind === "skill" && e.id === job.skills[0];
  if (q.kind.startsWith("train")) {
    const index = { trainQ: 0, trainZ: 1, trainC: 2 }[q.kind];
    return !!job && index !== void 0 && (p.skills?.[job.skills[index]] || 0) >= 1;
  }
  if (q.kind === "equipGear") return !!p.gearEquipped?.weapon;
  if (q.kind === "upgrade") return e?.kind === "upgrade" || p.weapons.some((w) => w.level > 1 || w.stars > 1);
  if (q.kind === "buyPotion") return e?.kind === "buyPotion" || Object.values(p.potions).some((n) => n > 0);
  if (q.kind === "mirrors") return e?.kind === "mirrors" && e.map === q.map;
  if (q.kind === "defend") return e?.kind === "defend" && e.map === q.map;
  if (q.kind === "enter") return e?.kind === "enter" && e.map === q.map;
  return false;
}
function advanceQuest(p, e) {
  const state = questState(p), completed = [];
  let event = e;
  for (let i = 0; i < MAIN_QUESTS.length; i++) {
    const q = currentQuest(p);
    if (!q) break;
    const finishing = q.kind === "talk" ? event?.kind === "talk" && event.npc === q.npc && event.map === q.map : q.kind === "kill" && event?.kind === "kill" && event.map === q.map && q.kinds?.includes(event.monster.kind) && (q.region === void 0 || event.monster.region === q.region) && state.count + 1 >= q.count;
    if (q.patrol && p.level >= q.patrol.target && !finishing) {
      state.step = MAIN_QUESTS.findIndex((v) => v.id === q.patrol.gate);
      state.count = 0;
      continue;
    }
    let done = false;
    if (q.kind === "talk") done = event?.kind === "talk" && event.npc === q.npc && event.map === q.map;
    else if (q.kind === "absorb") {
      if (event?.kind === "absorb" && event.map === q.map) state.count = Math.min(q.count, state.count + 1);
      done = state.count >= q.count;
    } else if (q.kind === "kill") {
      if (event?.kind === "kill" && event.map === q.map && q.kinds?.includes(event.monster.kind) && (q.region === void 0 || event.monster.region === q.region) && (q.id !== "grox-five" || event.monster.level >= 1 && event.monster.level <= 5)) state.count = Math.min(q.count, state.count + 1);
      done = state.count >= q.count;
    } else done = fulfilled(p, q, event);
    if (!done) break;
    questReward(p, q);
    completed.push(q.id);
    state.step++;
    state.count = 0;
    if (q.patrol?.last && p.level < q.patrol.target) state.step = MAIN_QUESTS.findIndex((v) => v.id === q.patrol.gate + "-patrol-brief");
    event = event?.map ? { kind: "check", map: event.map } : void 0;
  }
  return completed;
}
function questCanTalk(p, npc, a, clear) {
  if (!Object.hasOwn(QUEST_NPCS, npc)) return false;
  const n = QUEST_NPCS[npc], q = currentQuest(p);
  return !!q && q.kind === "talk" && q.npc === npc && a.hp > 0 && (a.map || "tribe") === n.map && Math.hypot(a.x - n.x, a.z - n.z) <= (npc.endsWith("seal") ? 4 : 7) && (!clear || clear(a.x, a.z, n.x, n.z));
}
export {
  MAIN_QUESTS,
  QUEST_NPCS,
  QUEST_XP_BUDGETS,
  REVISION_SIX_IDS,
  advanceQuest,
  currentQuest,
  mapSecret,
  questCanTalk,
  questReward,
  questRewardInfo,
  questState,
  questText
};
