// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const AUTHORITY_MAPS = ["tribe", "forest", "city", "blight", "sanctum", "starfall", "frostcourt", "skyreach", "dunes"];
const AUTHORITY_MAP_NAMES = { tribe: ["\u90E8\u843D", "Tribe"], forest: ["\u68EE\u6797", "Forest"], city: ["\u5931\u843D\u738B\u57CE", "Lost Royal City"], blight: ["\u8680\u5F71\u8352\u539F", "Shadowblight Wastes"], sanctum: ["\u51C0\u754C\u5723\u57DF", "Sanctum of the Veil"], starfall: ["\u6C89\u661F\u9057\u5883", "Sunken Star Ruins"], frostcourt: ["\u971C\u70EC\u738B\u5EAD", "Frostfire Court"], skyreach: ["\u5BC2\u96F7\u5929\u7A79", "Silent Storm Skyreach"], dunes: ["\u66AE\u6C99\u8FF7\u57CE", "Duskglass Labyrinth"] };
const AUTHORITY_JOBS = { timelord: { name: "\u65F6\u95F4\u4E4B\u4E3B", en: "Lord of Time", source: "chrono", icon: "\u25F7" }, spacelord: { name: "\u7A7A\u95F4\u4E4B\u4E3B", en: "Lord of Space", source: "voidsword", icon: "\u27D0" } };
const isAuthorityJob = (id) => Object.hasOwn(AUTHORITY_JOBS, id);
const AUTHORITY_SKILLS = {
  timelord: [["timecurse", "\u65F6\u95F4\u8BC5\u5492", "Temporal Curse", "X", 5], ["timedominion", "\u65F6\u95F4\u9886\u57DF", "Time Dominion", "Q", 26], ["timeflow", "\u65F6\u95F4\u56DE\u6D41", "Temporal Reflow", "Z", 35], ["timeresurrection", "\u65F6\u95F4\u5012\u6D41", "Time Resurrection", "C", 50]],
  spacelord: [["spacefracture", "\u7A7A\u95F4\u65AD\u5C42", "Spatial Fracture", "X", 4], ["spacefold", "\u6298\u53E0\u9886\u57DF", "Folded Dominion", "Q", 22], ["spaceswap", "\u7A7A\u95F4\u7F6E\u6362", "Spatial Exchange", "Z", 12], ["spacecollapse", "\u7A7A\u95F4\u574D\u7F29", "Spatial Collapse", "C", 36]]
};
const AUTHORITY_BALANCE = { damage: 60, fractureHit: 8, fractureExplosion: 12, fractureSplash: 3, history: 12e4, wraithStart: 5, wraithEssence: (count) => Math.ceil(120 * (1 + Math.max(0, count - 5) * 0.35) ** 1.45), domainRadius: 22, domainDuration: 18e3, wraithRevive: 8e3, wraithAttack: 1500, wraithPower: 1.5, deprivationDuration: 8e3, deprivation: 0.2, curseDuration: 18e3, curseTick: 1e3, cursePower: 1.3, curseChance: 0.25, reflowBonus: 0.5, reflowDuration: 12e3, resurrectionDuration: 22e3, resurrectionPower: 0.7, trialOffsets: [0, 5, 10, 20], trialAttempts: 2, trialMinutes: 30, trialReaction: 1e3, trialBaseSpeed: 6, safeRadius: 2.2 };
const authorityDay = (now = Date.now()) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(now));
function authorityProgress(p, job) {
  return (p.authority ??= {})[job] ??= job === "timelord" ? { tokens: [], wraiths: 5, essence: 0 } : { tokens: [] };
}
function authorityRequirements(p, job, skills) {
  const source = AUTHORITY_JOBS[job].source, r = p.authority?.[job];
  const trained = !!p.fusedJobs?.[source] && skills[source].skills.every((id) => (p.mastery?.[id]?.level || 1) >= 12) && [0, 1, 2].every((i) => (p.fusionPassives?.[source]?.[i]?.level || 0) >= 12);
  const ordinary = Object.keys(skills).filter((id) => !["elementalist", "voidsword", "abyssal", "chrono", "necromancer", "timelord", "spacelord"].includes(id));
  const holy = ordinary.every((id) => !!p.consumedJobs?.[id] || !!p.ascension?.jobs?.[id]?.holy);
  return { tokens: AUTHORITY_MAPS.every((map) => r?.tokens.includes(map)), trained, holy, submitted: !!r?.submitted, unlocked: !!r?.unlocked };
}
function authorityTrialError(p, job, now = Date.now()) {
  const r = p.authority?.[job];
  if (!r?.submitted || r.unlocked) return "\u5C1A\u672A\u63D0\u4EA4\u5168\u90E8\u4FE1\u7269\uFF0C\u6216\u5DF2\u83B7\u5F97\u6743\u67C4 / Submit your tokens first, or authority already earned";
  if (p.profession !== AUTHORITY_JOBS[job].source) return "\u8BF7\u4F7F\u7528\u5BF9\u5E94\u7684\u9884\u5907\u878D\u5408\u804C\u4E1A / Equip the prerequisite fusion profession";
  if (r.day === authorityDay(now) && (r.attempts || 0) >= 2) return "\u4ECA\u65E5\u6311\u6218\u6B21\u6570\u5DF2\u7528\u5B8C\uFF08\u6BCF\u59292\u6B21\uFF09 / Daily limit: two attempts";
  return null;
}
function authoritySafePattern(x, z, round, now) {
  const points = Array.from({ length: 25 }, (_, i) => ({ x: -48 + i % 5 * 24, z: 14 + Math.floor(i / 5) * 28 }));
  const ordered = points.sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z));
  const safe = [ordered[Math.min(round % 2, 1)], ordered[ordered.length - 1]];
  const distance = Math.min(...safe.map((p) => Math.max(0, Math.hypot(p.x - x, p.z - z) - AUTHORITY_BALANCE.safeRadius + 0.7)));
  return { safe, started: now, hitAt: now + AUTHORITY_BALANCE.trialReaction + Math.ceil(distance / AUTHORITY_BALANCE.trialBaseSpeed * 1e3), radius: Number(AUTHORITY_BALANCE.safeRadius) };
}
const AUTHORITY_DESCRIPTIONS = {
  timecurse: ["\u8BC5\u5492\u6301\u7EED18\u79D2\uFF0C\u65F6\u95F4\u52A0\u901F3\u500D\u8D77\uFF0C\u6301\u7EED\u65F6\u95F4\u7F29\u77ED\u4E14\u8DF3\u4F24\u52A0\u5FEB\uFF1B\u6BCF\u8DF3\u670925%\u6982\u7387\u9644\u52A08\u79D2\u65F6\u95F4\u5265\u593A\uFF08\u5168\u90E8\u6218\u6597\u5C5E\u6027\u221220%\uFF0C\u4E0D\u53E0\u52A0\uFF09\u3002", "18 seconds of curse compressed by 3\xD7 time acceleration. Each tick has a 25% chance of 8-second non-stacking Time Deprivation: all combat attributes \u221220%."],
  timedominion: ["\u5C55\u5F0018\u79D2\u65F6\u95F4\u9886\u57DF\uFF0C\u88C2\u7F1D\u6301\u7EED\u5207\u5272\u5E76\u5F3A\u529B\u51CF\u901F\u3002\u81EA\u5E265\u540D\u6028\u7075\uFF1B\u51FB\u6740\u79EF\u6512\u6028\u7075\u4E4B\u6C14\uFF0C\u6C38\u4E45\u589E\u52A0\u6028\u7075\uFF0C\u6570\u91CF\u65E0\u4E0A\u9650\u4E14\u83B7\u53D6\u9010\u6E10\u53D8\u96BE\u3002\u6028\u7075\u6D88\u6563\u540E\u5B55\u80B2\uFF0C\u4E0B\u6B21\u9886\u57DF\u91CD\u73B0\u3002", "An 18-second domain cuts and hinders enemies. Begin with five wraiths; kills earn essence for permanent, uncapped wraith growth at increasing cost. Fallen wraiths incubate until the next domain."],
  timeflow: ["\u56DE\u5230\u8FC7\u53BB2\u5206\u949F\u6700\u9AD8\u751F\u547D\u503C\uFF0C\u83B7\u5F97\u65F6\u95F4\u9644\u52A0I\uFF1B\u5F53\u524D\u5DF2\u662F\u6700\u9AD8\u5219\u83B7\u5F97\u589E\u5E45\u53CC\u500D\u7684II\u3002\u547D\u4E2D\u654C\u4EBA\u65F6\u989D\u5916\u65BD\u52A0\u65F6\u95F4\u5265\u593A\u3002", "Restore your highest health in the last two minutes and gain Time Infusion I. If already at that health, gain II with twice the bonus. A hit also inflicts Time Deprivation."],
  timeresurrection: ["\u590D\u6D3B\u8FC7\u53BB2\u5206\u949F\u4EB2\u81EA\u51FB\u8D25\u7684\u602A\u7269\uFF0C\u5E2E\u52A9\u6218\u659722\u79D2\uFF1B\u590D\u6D3B\u8005\u653B\u51FB\u6982\u7387\u65BD\u52A0\u65F6\u95F4\u5265\u593A\u6216\u65F6\u95F4\u8BC5\u5492\u3002", "Raise enemies you defeated in the last two minutes as allies for 22 seconds. Their attacks may inflict Time Deprivation or Temporal Curse."],
  spacefracture: ["\u53D1\u51FA\u7A7A\u95F4\u65AD\u5C42\uFF0C\u547D\u4E2D\u7559\u4E0B\u88C2\u75D5\uFF0C\u518D\u6B21\u547D\u4E2D\u5F15\u7206\u5E76\u6CE2\u53CA\u9644\u8FD1\u654C\u4EBA\u3002", "Launch a spatial fracture. Hits leave a mark; another hit detonates it and damages nearby enemies."],
  spacefold: ["\u5C55\u5F00\u6298\u53E0\u9886\u57DF\u4E0E\u53CC\u5411\u661F\u95E8\uFF0C\u8D70\u5165\u661F\u95E8\u5373\u53EF\u7A7F\u8D8A\u81F3\u53E6\u4E00\u7AEF\u3002\u9886\u57DF\u6301\u7EED\u5207\u5272\uFF0C\u5E76\u5C06\u90E8\u5206\u4F24\u5BB3\u4F20\u5BFC\u81F3\u5176\u4ED6\u76EE\u6807\u3002", "Fold the battlefield into a cutting domain with two linked gates. Walk through either to emerge at the other. Part of its damage is relayed between enemies."],
  spaceswap: ["\u5411\u7784\u51C6\u4F4D\u7F6E\u4F20\u9001\u5E76\u7559\u4E0B\u5750\u6807\uFF0C\u518D\u6B21\u91CA\u653E\u8FD4\u56DE\uFF1B\u51FA\u53D1\u4E0E\u62B5\u8FBE\u4F4D\u7F6E\u540C\u65F6\u9707\u8361\u3002", "Teleport toward your aim and leave a coordinate. Recast to return; both departure and arrival release shockwaves."],
  spacecollapse: ["\u538B\u7F29\u76EE\u6807\u533A\u57DF\uFF0C\u666E\u901A\u654C\u4EBA\u88AB\u7275\u5F15\uFF0CBOSS\u53D7\u5230\u5F3A\u529B\u51CF\u901F\u3002\u591A\u5C42\u5207\u9762\u8FDE\u7EED\u4F24\u5BB3\u540E\u5F15\u7206\u5168\u90E8\u7A7A\u95F4\u5370\u8BB0\u3002", "Compress an area, pulling ordinary enemies and heavily slowing bosses. Layered cuts culminate in a detonation of spatial marks."]
};
const AUTHORITY_TYPES = { timecurse: ["\u5355\u4F53 / \u6301\u7EED\u4F24\u5BB3 / \u524A\u5F31", "Single target / Damage over time / Debuff"], timedominion: ["\u7FA4\u4F53 / \u53EC\u5524 / \u63A7\u5236", "Area / Summon / Control"], timeflow: ["\u6062\u590D / \u589E\u76CA / \u524A\u5F31", "Healing / Buff / Debuff"], timeresurrection: ["\u53EC\u5524 / \u589E\u76CA", "Summon / Buff"], spacefracture: ["\u5355\u4F53 / \u7206\u53D1", "Single target / Burst"], spacefold: ["\u7FA4\u4F53 / \u4F4D\u79FB / \u6301\u7EED\u4F24\u5BB3", "Area / Movement / Damage over time"], spaceswap: ["\u4F4D\u79FB / \u7FA4\u4F53", "Movement / Area"], spacecollapse: ["\u7FA4\u4F53 / \u63A7\u5236 / \u7206\u53D1", "Area / Control / Burst"] };
function authorityDamageCoefficients(id) {
  const b = AUTHORITY_BALANCE;
  return id === "timecurse" ? { tick: b.cursePower } : id === "timedominion" ? { tick: 1.2, summon: b.wraithPower } : id === "spacefracture" ? { hit: b.fractureHit, detonation: b.fractureExplosion } : id === "spacefold" ? { tick: 1.6 } : id === "spaceswap" ? { hit: 3 } : id === "spacecollapse" ? { tick: 3, detonation: 7 } : id === "timeresurrection" ? { summon: b.resurrectionPower } : {};
}
export {
  AUTHORITY_BALANCE,
  AUTHORITY_DESCRIPTIONS,
  AUTHORITY_JOBS,
  AUTHORITY_MAPS,
  AUTHORITY_MAP_NAMES,
  AUTHORITY_SKILLS,
  AUTHORITY_TYPES,
  authorityDamageCoefficients,
  authorityDay,
  authorityProgress,
  authorityRequirements,
  authoritySafePattern,
  authorityTrialError,
  isAuthorityJob
};
