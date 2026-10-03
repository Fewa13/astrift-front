const BOMB_MAP_SCALE = 0.45;
const BOMB_MAP_LIMIT = 208 * BOMB_MAP_SCALE;
const BOMB_PREP_MS = 7e3;
function bombSitesFor(attackTeam) {
  const defenderZ = (attackTeam === 0 ? -132 : 132) * BOMB_MAP_SCALE;
  return { A: [-110 * BOMB_MAP_SCALE, 0, defenderZ], B: [110 * BOMB_MAP_SCALE, 0, defenderZ] };
}
const BOMB_SITES = bombSitesFor(0);
const BOMB_PRESETS = {
  solo: { humans: 1, hostHumans: 1, alliedAi: 4, enemyAi: 5 },
  duoCoop: { humans: 2, hostHumans: 2, alliedAi: 3, enemyAi: 5 },
  duoOpposite: { humans: 2, hostHumans: 1, alliedAi: 4, enemyAi: 4 },
  trioCoop: { humans: 3, hostHumans: 3, alliedAi: 2, enemyAi: 3 },
  trioOpposite: { humans: 3, hostHumans: 1, alliedAi: 3, enemyAi: 4 },
  fourCoop: { humans: 4, hostHumans: 4, alliedAi: 1, enemyAi: 5 },
  fourOpposite: { humans: 4, hostHumans: 2, alliedAi: 3, enemyAi: 3 },
  fiveCoop: { humans: 5, hostHumans: 5, alliedAi: 0, enemyAi: 5 },
  fiveOpposite: { humans: 5, hostHumans: 3, alliedAi: 2, enemyAi: 3 },
  sixOpposite: { humans: 6, hostHumans: 3, alliedAi: 2, enemyAi: 2 },
  sevenOpposite: { humans: 7, hostHumans: 4, alliedAi: 1, enemyAi: 2 },
  eightOpposite: { humans: 8, hostHumans: 4, alliedAi: 1, enemyAi: 1 },
  nineOpposite: { humans: 9, hostHumans: 5, alliedAi: 0, enemyAi: 1 },
  full: { humans: 10, hostHumans: 5, alliedAi: 0, enemyAi: 0 }
};
function createBombMatch(now = Date.now(), firstAttackTeam = Math.random() < 0.5 ? 0 : 1) {
  return { phase: "waiting", round: 0, scores: [0, 0], attackTeam: firstAttackTeam, firstAttackTeam, startedAt: 0, endsAt: 0, nextAt: 0, plantedSite: null, plantedAt: 0, carrier: null, hold: null, event: "\u7B49\u5F85\u73A9\u5BB6", revision: 0, winner: null };
}
function startBombRound(m, fighters, now = Date.now()) {
  m.round++;
  m.phase = "prep";
  m.attackTeam = m.round <= 6 ? m.firstAttackTeam : 1 - m.firstAttackTeam;
  m.startedAt = now;
  m.endsAt = now + BOMB_PREP_MS;
  m.nextAt = 0;
  m.plantedSite = null;
  m.plantedAt = 0;
  m.hold = null;
  m.winner = null;
  const attackers = fighters.filter((p) => p.team === m.attackTeam && p.hp > 0);
  m.carrier = attackers.length ? attackers[Math.floor(Math.random() * attackers.length)].id : null;
  m.event = `\u7B2C ${m.round}/12 \u56DE\u5408 \xB7 \u5B88\u65B9\u5E03\u9632`;
  m.revision++;
}
function finishBombRound(m, winner, event, now = Date.now()) {
  if (m.phase !== "running") return;
  m.scores[winner]++;
  m.phase = m.round >= 12 ? "finished" : "intermission";
  m.winner = winner;
  m.nextAt = now + (m.phase === "finished" ? 15e3 : 4500);
  m.endsAt = now;
  m.hold = null;
  m.event = event;
  m.revision++;
}
function tickBombMatch(m, fighters, now = Date.now()) {
  if (m.phase === "prep") {
    if (now >= m.endsAt) {
      m.phase = "running";
      m.startedAt = now;
      m.endsAt = now + 9e4;
      m.event = "\u653B\u65B9\u7A81\u5165 \xB7 \u56DE\u5408\u5F00\u59CB";
      m.revision++;
    }
    return;
  }
  if (m.phase !== "running") return;
  const alive = (team) => fighters.filter((p) => p.team === team && p.hp > 0 && p.connected !== false);
  const attackers = alive(m.attackTeam), defenders = alive(1 - m.attackTeam);
  if (!m.plantedSite && m.carrier && !attackers.some((p) => p.id === m.carrier)) {
    m.carrier = attackers[0]?.id || null;
    m.hold = null;
    m.revision++;
  }
  if (!m.plantedSite && attackers.length === 0) return finishBombRound(m, 1 - m.attackTeam, "\u653B\u65B9\u5168\u706D \xB7 \u5B88\u65B9\u83B7\u80DC", now);
  if (defenders.length === 0) return finishBombRound(m, m.attackTeam, "\u5B88\u65B9\u5168\u706D \xB7 \u653B\u65B9\u83B7\u80DC", now);
  if (m.hold) {
    const h = m.hold, actor = fighters.find((p) => p.id === h.id), site = bombSitesFor(m.attackTeam)[h.site], close = actor && actor.hp > 0 && actor.connected !== false && actor.interacting && Math.hypot(actor.position[0] - site[0], actor.position[2] - site[2]) <= 3.2 && Math.abs(actor.position[1] - site[1]) < 4;
    if (!close || h.kind === "plant" && (m.plantedSite || m.carrier !== h.id || actor.team !== m.attackTeam) || h.kind === "defuse" && (m.plantedSite !== h.site || actor.team === m.attackTeam)) {
      m.hold = null;
      m.revision++;
    } else if (now - h.since >= 5e3) {
      m.hold = null;
      if (h.kind === "plant") {
        m.plantedSite = h.site;
        m.plantedAt = now;
        m.endsAt = now + 35e3;
        m.carrier = null;
        m.event = `\u76F8\u4F4D\u6838\u5FC3\u5DF2\u5B89\u653E\u81F3 ${h.site} \u70B9`;
      } else return finishBombRound(m, 1 - m.attackTeam, "\u76F8\u4F4D\u6838\u5FC3\u5DF2\u62C6\u9664 \xB7 \u5B88\u65B9\u83B7\u80DC", now);
      m.revision++;
    }
  }
  if (now >= m.endsAt) finishBombRound(m, m.plantedSite ? m.attackTeam : 1 - m.attackTeam, m.plantedSite ? "\u76F8\u4F4D\u6838\u5FC3\u7206\u70B8 \xB7 \u653B\u65B9\u83B7\u80DC" : "\u56DE\u5408\u65F6\u95F4\u7ED3\u675F \xB7 \u5B88\u65B9\u83B7\u80DC", now);
}
function beginBombHold(m, actor, site, now = Date.now()) {
  if (m.phase !== "running" || m.hold || actor.hp <= 0 || !actor.interacting || Math.hypot(actor.position[0] - bombSitesFor(m.attackTeam)[site][0], actor.position[2] - bombSitesFor(m.attackTeam)[site][2]) > 3.2) return false;
  const kind = m.plantedSite ? "defuse" : "plant";
  if (kind === "plant" && (actor.team !== m.attackTeam || actor.id !== m.carrier) || kind === "defuse" && (actor.team === m.attackTeam || m.plantedSite !== site)) return false;
  m.hold = { id: actor.id, kind, site, since: now };
  m.revision++;
  return true;
}
export {
  BOMB_MAP_LIMIT,
  BOMB_MAP_SCALE,
  BOMB_PREP_MS,
  BOMB_PRESETS,
  BOMB_SITES,
  beginBombHold,
  bombSitesFor,
  createBombMatch,
  finishBombRound,
  startBombRound,
  tickBombMatch
};
