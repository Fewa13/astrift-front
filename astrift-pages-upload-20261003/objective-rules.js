const BASES = [[0, 0, 43], [0, 0, -43]];
const HILLS = [{ name: "\u4E2D\u592E\u8857\u53E3", position: [0, 0, 0], radius: 7 }, { name: "\u897F\u4FA7\u901A\u9053", position: [-18, 0, 18], radius: 5 }, { name: "\u4E1C\u4FA7\u901A\u9053", position: [18, 0, -18], radius: 5 }];
const ROUND_MS = 6e5, HILL_MS = 6e4, HOLD_MS = 600, RETURN_MS = 2e4;
function createMatch(mode, now, round = 1, waiting = false) {
  return { mode, round, phase: waiting ? "waiting" : "running", startedAt: now, endsAt: now + ROUND_MS, nextAt: 0, scores: [0, 0], flags: BASES.map((p, team) => ({ team, position: [...p], carrier: null, home: true, returnAt: 0 })), hill: 0, hillEndsAt: now + HILL_MS, owner: -1, contested: false, lastTick: now, carryMs: 0, holds: {}, event: "", revision: 0 };
}
const near = (a, b, r) => Math.hypot(a[0] - b[0], a[2] - b[2]) <= r && Math.abs(a[1] - b[1]) < 2.6;
const carrierFlag = (m, id) => m.flags.find((f) => f.carrier === id);
function announce(m, text) {
  m.event = text;
  m.revision++;
}
function returnFlag(f) {
  f.carrier = null;
  f.home = true;
  f.returnAt = 0;
  f.position = [...BASES[f.team]];
}
function dropFlag(m, id, now) {
  const f = carrierFlag(m, id);
  if (!f) return;
  f.carrier = null;
  f.home = false;
  f.returnAt = now + RETURN_MS;
  f.position[1] = 0;
  delete m.holds[id];
  announce(m, "\u65D7\u5E1C\u6389\u843D \xB7 20 \u79D2\u540E\u81EA\u52A8\u5F52\u4F4D");
}
function finish(m, now) {
  m.phase = "finished";
  m.nextAt = now + 5e3;
  m.holds = {};
  m.owner = -1;
  m.contested = false;
  announce(m, m.scores[0] === m.scores[1] ? "\u5E73\u5C40" : m.scores[0] > m.scores[1] ? "\u84DD\u961F\u83B7\u80DC" : "\u7EA2\u961F\u83B7\u80DC");
}
function tickMatch(m, players, now) {
  if (m.phase !== "running") return;
  const dt = Math.max(0, Math.min(1e3, now - m.lastTick));
  m.lastTick = now;
  if (now >= m.endsAt) {
    finish(m, now);
    return;
  }
  const alive = players.filter((p) => p.hp > 0 && (p.team === 0 || p.team === 1));
  if (m.mode === "ctf") {
    for (const f of m.flags) {
      if (f.carrier) {
        const p = alive.find((p2) => p2.id === f.carrier);
        if (!p) dropFlag(m, f.carrier, now);
        else f.position = [...p.position];
      }
      if (!f.home && !f.carrier && now >= f.returnAt) {
        returnFlag(f);
        announce(m, "\u6389\u843D\u65D7\u5E1C\u5DF2\u81EA\u52A8\u5F52\u4F4D");
      }
    }
    for (const id of Object.keys(m.holds)) if (!alive.some((p) => p.id === id && p.interacting)) delete m.holds[id];
    for (const p of alive) {
      const carried = carrierFlag(m, p.id), own = m.flags[p.team];
      if (carried && own.home && near(p.position, BASES[p.team], 3)) {
        m.scores[p.team]++;
        returnFlag(carried);
        announce(m, `${p.name} \u6210\u529F\u4EA4\u65D7 \xB7 ${p.team === 0 ? "\u84DD" : "\u7EA2"}\u961F +1`);
        if (m.scores[p.team] >= 3) {
          finish(m, now);
          return;
        }
      }
      if (!p.interacting) {
        delete m.holds[p.id];
        continue;
      }
      const f = m.flags.find((f2) => !f2.carrier && (!f2.home || f2.team !== p.team) && near(p.position, f2.position, 2.4));
      if (!f) {
        delete m.holds[p.id];
        continue;
      }
      const hold = m.holds[p.id];
      if (!hold || hold.team !== f.team) {
        m.holds[p.id] = { team: f.team, since: now };
        continue;
      }
      if (now - hold.since < HOLD_MS) continue;
      delete m.holds[p.id];
      if (f.team === p.team) {
        returnFlag(f);
        announce(m, `${p.name} \u593A\u56DE\u5DF1\u65B9\u65D7\u5E1C`);
      } else if (!carrierFlag(m, p.id)) {
        f.carrier = p.id;
        f.home = false;
        f.returnAt = 0;
        f.position = [...p.position];
        announce(m, `${p.name} \u62FF\u5230${f.team === 0 ? "\u84DD" : "\u7EA2"}\u961F\u65D7\u5E1C`);
      }
    }
  } else {
    const index = Math.floor((now - m.startedAt) / HILL_MS) % HILLS.length;
    if (index !== m.hill) {
      m.hill = index;
      m.carryMs = 0;
      m.owner = -1;
      announce(m, `\u636E\u70B9\u8F6C\u79FB\u5230${HILLS[index].name}`);
    }
    m.hillEndsAt = m.startedAt + (Math.floor((now - m.startedAt) / HILL_MS) + 1) * HILL_MS;
    const hill = HILLS[m.hill], teams = new Set(alive.filter((p) => near(p.position, hill.position, hill.radius)).map((p) => p.team));
    const owner = teams.size === 1 ? [...teams][0] : -1;
    if (owner !== m.owner) m.carryMs = 0;
    m.owner = owner;
    m.contested = teams.size > 1;
    if (owner >= 0) {
      m.carryMs += dt;
      while (m.carryMs >= 1e3) {
        m.scores[owner]++;
        m.carryMs -= 1e3;
      }
      if (m.scores[owner] >= 180) finish(m, now);
    } else m.carryMs = 0;
  }
}
function botGoal(m, p, players, role) {
  if (m.mode === "hardpoint") return [...HILLS[m.hill].position];
  const own = m.flags[p.team], enemy = m.flags[1 - p.team];
  if (own.carrier) return [...own.position];
  if (carrierFlag(m, p.id)) return [...own.home ? BASES[p.team] : own.position];
  if (!own.home) return [...own.position];
  if (enemy.carrier) {
    const escort = players.find((a) => a.id === enemy.carrier);
    if (escort) return [...escort.position];
  }
  return [...role % 5 === 0 ? BASES[p.team] : enemy.position];
}
export {
  BASES,
  HILLS,
  HILL_MS,
  HOLD_MS,
  RETURN_MS,
  ROUND_MS,
  botGoal,
  carrierFlag,
  createMatch,
  dropFlag,
  near,
  tickMatch
};
