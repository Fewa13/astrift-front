// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const AUTHORITY_MAPS = ["tribe", "forest", "city", "blight", "sanctum", "starfall", "frostcourt", "skyreach", "dunes"];
const AUTHORITY_MAP_NAMES = { tribe: ["\u90E8\u843D", "Tribe"], forest: ["\u68EE\u6797", "Forest"], city: ["\u5931\u843D\u738B\u57CE", "Lost Royal City"], blight: ["\u8680\u5F71\u8352\u539F", "Shadowblight Wastes"], sanctum: ["\u51C0\u754C\u5723\u57DF", "Sanctum of the Veil"], starfall: ["\u6C89\u661F\u9057\u5883", "Sunken Star Ruins"], frostcourt: ["\u971C\u70EC\u738B\u5EAD", "Frostfire Court"], skyreach: ["\u5BC2\u96F7\u5929\u7A79", "Silent Storm Skyreach"], dunes: ["\u66AE\u6C99\u8FF7\u57CE", "Duskglass Labyrinth"] };
const AUTHORITY_JOBS = { timelord: { name: "\u65F6\u95F4\u4E4B\u4E3B", en: "Lord of Time", source: "chrono", icon: "\u25F7" }, spacelord: { name: "\u7A7A\u95F4\u4E4B\u4E3B", en: "Lord of Space", source: "voidsword", icon: "\u27D0" } };
const isAuthorityJob = (id) => Object.hasOwn(AUTHORITY_JOBS, id);
const AUTHORITY_SKILLS = {
  timelord: [["timecurse", "\u5C81\u6708\u4FB5\u8680", "Age Acceleration", "X", 5], ["timedominion", "\u65F6\u95F4\u9886\u57DF", "Time Dominion", "Q", 26], ["timeflow", "\u65F6\u95F4\u56DE\u6D41", "Temporal Reflow", "Z", 35], ["timeresurrection", "\u4E07\u8C61\u91CD\u6F14", "Temporal Reprise", "C", 40]],
  spacelord: [["spacefracture", "\u7A7A\u95F4\u65AD\u5C42", "Spatial Fracture", "X", 4], ["spacefold", "\u6298\u53E0\u9886\u57DF", "Folded Dominion", "Q", 22], ["spaceswap", "\u7A7A\u95F4\u7F6E\u6362", "Spatial Exchange", "Z", 12], ["spacecollapse", "\u7A7A\u95F4\u574D\u7F29", "Spatial Collapse", "C", 36]]
};
const AUTHORITY_BALANCE = { damage: 60, fractureHit: 8, fractureExplosion: 12, fractureSplash: 3, history: 12e4, domainRadius: 22, domainDuration: 18e3, deprivationDuration: 8e3, deprivation: 0.2, curseDuration: 18e3, curseTick: 1e3, cursePower: 1.3, reflowBonus: 0.2, reflowDuration: 1e4, trialOffsets: [0, 5, 10, 20], trialAttempts: 2, trialMinutes: 30, trialReaction: 1e3, trialBaseSpeed: 6, safeRadius: 2.2 };
const TIME_LORD = {
  revision: 2,
  recordInterval: 500,
  maxHistory: 512,
  maxQueue: 1024,
  acceleration: (level) => Math.min(8, 3 + 0.08 * (level - 1)),
  cursePower: 1.3,
  agingSpread: (level) => Math.min(9, 5 + 0.04 * (level - 1)),
  stopDuration: (level) => Math.min(12e3, 5e3 + 100 * (level - 1)),
  stopRadius: (level) => Math.min(30, 22 + 0.12 * (level - 1)),
  bossSlow: 0.8,
  rewindShield: (level) => Math.min(0.35, 0.15 + 2e-3 * (level - 1)),
  shieldDuration: 6500,
  echoWindow: (level) => Math.min(14e3, 8e3 + 100 * (level - 1)),
  echoDuration: (level) => Math.min(14e3, 8e3 + 80 * (level - 1)),
  echoCopies: (level) => Math.min(4, 2 + Math.floor((level - 1) / 15)),
  echoRatio: (level) => Math.min(0.6, 0.3 + 3e-3 * (level - 1)),
  echoDelay: 400,
  echoSpacing: 800,
  echoGrace: 14e3
};
function migrateTimeLord(p) {
  const progress = p.authority?.timelord;
  if (!progress || progress.timeRevision === TIME_LORD.revision) return false;
  if (progress.wraiths !== void 0 || progress.essence !== void 0) progress.retiredArmy = { wraiths: progress.wraiths || 0, essence: progress.essence || 0 };
  delete progress.wraiths;
  delete progress.essence;
  progress.timeRevision = TIME_LORD.revision;
  return true;
}
const authorityDay = (now = Date.now()) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(now));
function authorityProgress(p, job) {
  return (p.authority ??= {})[job] ??= { tokens: [], ...job === "timelord" ? { timeRevision: 2 } : {} };
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
  timecurse: ["\u8BA9\u76EE\u6807\u7ECF\u5386\u52A0\u901F\u7684\u5C81\u6708\uFF0C18\u6B21\u4FB5\u8680\u4F24\u5BB3\u4EE53\u500D\u8D77\u7684\u65F6\u95F4\u901F\u5EA6\u7ED3\u7B97\uFF1B\u540C\u65F6\u52A0\u5FEB\u76EE\u6807\u5DF2\u6709\u7684\u6301\u7EED\u4F24\u5BB3\uFF0C\u4E0D\u590D\u5236\u4F24\u5BB3\u603B\u91CF\u3002\u5347\u7EA7\u63D0\u5347\u4FB5\u8680\u4F24\u5BB3\u4E0E\u52A0\u901F\u500D\u7387\u3002", "Accelerate the target through 18 aging ticks at 3\xD7 time speed or faster. Existing damage-over-time ticks also occur sooner without duplicating their total damage. Levels increase aging damage and acceleration."],
  timedominion: ["\u5C55\u5F00\u5927\u578B\u65F6\u505C\u9886\u57DF\uFF1A\u666E\u901A\u654C\u4EBA\u6682\u505C\u884C\u52A8\uFF0C\u53D7\u5230\u7684\u653B\u51FB\u6682\u5B58\u5E76\u5728\u65F6\u95F4\u6062\u590D\u65F6\u7ED3\u7B97\uFF1BBOSS\u5927\u5E45\u51CF\u901F\u3002\u9886\u57DF\u5185\u547D\u4E2D\u7684\u5C81\u6708\u4FB5\u8680\u4F1A\u540C\u6B65\u5F71\u54CD\u9644\u8FD1\u654C\u4EBA\u3002\u5347\u7EA7\u5EF6\u957F\u65F6\u505C\u5E76\u6269\u5927\u8303\u56F4\u3002", "Create a large time-stop field: ordinary enemies stop acting, and incoming damage waits until time resumes. Bosses are heavily slowed. Age Acceleration spreads to nearby enemies when it hits inside this field. Levels increase duration and radius."],
  timeflow: ["\u6062\u590D\u8FC7\u53BB2\u5206\u949F\u5185\u6700\u9AD8\u7684\u751F\u547D\u72B6\u6001\uFF0C\u5E76\u8FD4\u56DE\u5F53\u65F6\u4F4D\u7F6E\uFF1B\u6E05\u9664\u8D1F\u9762\u72B6\u6001\u5E76\u77ED\u6682\u589E\u4F24\u3002\u751F\u547D\u5DF2\u6EE1\u65F6\u83B7\u5F97\u65F6\u95F4\u62A4\u76FE\u3002\u4E0D\u4F1A\u91CD\u7F6E\u6280\u80FD\u51B7\u5374\u3001\u6D88\u8017\u54C1\u6216\u654C\u4EBA\u751F\u547D\u3002", "Restore your highest health from the past two minutes and return to that position. Cleanse debuffs and briefly increase damage; if already at peak health, gain a temporal shield. Never resets cooldowns, consumables or enemy health."],
  timeresurrection: ["\u8FC7\u53BB\u4E0E\u672A\u6765\u7684\u81EA\u8EAB\u6B8B\u5F71\u91CD\u6F14\u8FD1\u671F\u6709\u6548\u653B\u51FB\uFF1B\u6301\u7EED\u671F\u95F4\u7684\u65B0\u653B\u51FB\u4E5F\u4F1A\u5728\u77ED\u6682\u5EF6\u8FDF\u540E\u91CD\u6F14\u4E00\u6B21\u3002\u6B8B\u5F71\u4E0D\u590D\u5236\u6CBB\u7597\u3001\u6D88\u8017\u54C1\u3001\u5956\u52B1\u6216\u51B7\u5374\u5237\u65B0\uFF0C\u4E0D\u80FD\u518D\u6B21\u751F\u6210\u56DE\u54CD\u3002\u5347\u7EA7\u589E\u5F3A\u91CD\u6F14\u6BD4\u4F8B\u3001\u6B21\u6570\u4E0E\u53EF\u64CD\u7EB5\u7684\u65F6\u95F4\u957F\u5EA6\u3002", "Past and future silhouettes replay recent successful attacks. New attacks during the effect also replay once after a short delay. Echoes never copy healing, consumables, rewards or cooldown resets, and cannot create more echoes. Levels improve replay power, count and temporal reach."],
  spacefracture: ["\u53D1\u51FA\u7A7A\u95F4\u65AD\u5C42\uFF0C\u547D\u4E2D\u7559\u4E0B\u88C2\u75D5\uFF0C\u518D\u6B21\u547D\u4E2D\u5F15\u7206\u5E76\u6CE2\u53CA\u9644\u8FD1\u654C\u4EBA\u3002", "Launch a spatial fracture. Hits leave a mark; another hit detonates it and damages nearby enemies."],
  spacefold: ["\u5C55\u5F00\u6298\u53E0\u9886\u57DF\u4E0E\u53CC\u5411\u661F\u95E8\uFF0C\u8D70\u5165\u661F\u95E8\u5373\u53EF\u7A7F\u8D8A\u81F3\u53E6\u4E00\u7AEF\u3002\u9886\u57DF\u6301\u7EED\u5207\u5272\uFF0C\u5E76\u5C06\u90E8\u5206\u4F24\u5BB3\u4F20\u5BFC\u81F3\u5176\u4ED6\u76EE\u6807\u3002", "Fold the battlefield into a cutting domain with two linked gates. Walk through either to emerge at the other. Part of its damage is relayed between enemies."],
  spaceswap: ["\u5411\u7784\u51C6\u4F4D\u7F6E\u4F20\u9001\u5E76\u7559\u4E0B\u5750\u6807\uFF0C\u518D\u6B21\u91CA\u653E\u8FD4\u56DE\uFF1B\u51FA\u53D1\u4E0E\u62B5\u8FBE\u4F4D\u7F6E\u540C\u65F6\u9707\u8361\u3002", "Teleport toward your aim and leave a coordinate. Recast to return; both departure and arrival release shockwaves."],
  spacecollapse: ["\u538B\u7F29\u76EE\u6807\u533A\u57DF\uFF0C\u666E\u901A\u654C\u4EBA\u88AB\u7275\u5F15\uFF0CBOSS\u53D7\u5230\u5F3A\u529B\u51CF\u901F\u3002\u591A\u5C42\u5207\u9762\u8FDE\u7EED\u4F24\u5BB3\u540E\u5F15\u7206\u5168\u90E8\u7A7A\u95F4\u5370\u8BB0\u3002", "Compress an area, pulling ordinary enemies and heavily slowing bosses. Layered cuts culminate in a detonation of spatial marks."]
};
const AUTHORITY_TYPES = { timecurse: ["\u5355\u4F53 / \u6301\u7EED\u4F24\u5BB3 / \u52A0\u901F", "Single target / Damage over time / Acceleration"], timedominion: ["\u7FA4\u4F53 / \u505C\u6EDE / \u5EF6\u8FDF\u7ED3\u7B97", "Area / Stasis / Delayed damage"], timeflow: ["\u6062\u590D / \u4F4D\u79FB / \u589E\u76CA", "Healing / Movement / Buff"], timeresurrection: ["\u91CD\u6F14 / \u7206\u53D1", "Replay / Burst"], spacefracture: ["\u5355\u4F53 / \u7206\u53D1", "Single target / Burst"], spacefold: ["\u7FA4\u4F53 / \u4F4D\u79FB / \u6301\u7EED\u4F24\u5BB3", "Area / Movement / Damage over time"], spaceswap: ["\u4F4D\u79FB / \u7FA4\u4F53", "Movement / Area"], spacecollapse: ["\u7FA4\u4F53 / \u63A7\u5236 / \u7206\u53D1", "Area / Control / Burst"] };
function authorityDamageCoefficients(id) {
  const b = AUTHORITY_BALANCE;
  return id === "timecurse" ? { tick: b.cursePower } : id === "timedominion" ? {} : id === "spacefracture" ? { hit: b.fractureHit, detonation: b.fractureExplosion } : id === "spacefold" ? { tick: 1.6 } : id === "spaceswap" ? { hit: 3 } : id === "spacecollapse" ? { tick: 3, detonation: 7 } : id === "timeresurrection" ? {} : {};
}
export {
  AUTHORITY_BALANCE,
  AUTHORITY_DESCRIPTIONS,
  AUTHORITY_JOBS,
  AUTHORITY_MAPS,
  AUTHORITY_MAP_NAMES,
  AUTHORITY_SKILLS,
  AUTHORITY_TYPES,
  TIME_LORD,
  authorityDamageCoefficients,
  authorityDay,
  authorityProgress,
  authorityRequirements,
  authoritySafePattern,
  authorityTrialError,
  isAuthorityJob,
  migrateTimeLord
};
