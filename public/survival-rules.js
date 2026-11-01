// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const TOWER_HEIGHT = 10;
const TOWER_LIMIT = 5.45;
const ZOMBIE_LIMIT = 80;
const SURVIVAL_SKILLS = {
  rage1: { name: "\u72C2\u66B4 I", cost: 500, duration: 6e4, cooldown: 12e4, key: "5", bonus: 1 },
  rage2: { name: "\u72C2\u66B4 II", cost: 3e3, duration: 6e4, cooldown: 1e5, key: "5", bonus: 1.5 },
  blood: { name: "\u55DC\u8840 I", cost: 5e3, duration: 12e4, cooldown: 6e4, key: "6", bonus: 0 },
  protection: { name: "\u4FDD\u62A4 I", cost: 8e3, duration: 2e4, cooldown: 8e4, key: "7", bonus: 0 }
};
function newSurvivalState(round = 1) {
  return { version: 1, round, status: "waiting", elapsed: 0, towerHp: 100, towerMax: 100, points: 0, healthLevel: 0, attackLevel: 0, kills: 0, players: [], zombies: [], spawnAt: 0, nextZombie: 0 };
}
function newSurvivalPlayer(id, name) {
  return { id, name, ready: false, connected: true, rage: 0, blood: false, protection: false, rageUntil: 0, bloodUntil: 0, protectionUntil: 0, rageReady: 0, bloodReady: 0, protectionReady: 0, kills: 0 };
}
function zombieStats(elapsed) {
  const minute = Math.floor(elapsed / 6e4), rate = 1.1 ** minute;
  return { minute, speed: 3.2 * rate, spawnInterval: 2e3 / rate, damage: minute + 1, attackInterval: 1e3 / rate, hp: 100 * 1.3 ** minute, reward: 2 * 2 ** minute };
}
function survivalDamageMultiplier(state, id) {
  const player = state.players.find((p) => p.id === id);
  return 2 ** state.attackLevel * (player && player.rageUntil > state.elapsed ? 1 + (player.rage === 2 ? 1.5 : 1) : 1);
}
function tickSurvival(state, dtMs) {
  if (state.status !== "running" || !state.players.some((p) => p.connected)) return;
  const previousMinute = Math.floor(state.elapsed / 6e4);
  const dt = Math.max(0, Math.min(250, dtMs));
  state.elapsed += dt;
  const stats = zombieStats(state.elapsed);
  if (stats.minute > previousMinute) for (const zombie of state.zombies) {
    zombie.hp *= 1.3;
    zombie.maxHp *= 1.3;
  }
  if (state.elapsed >= state.spawnAt) {
    if (state.zombies.length < ZOMBIE_LIMIT) {
      const index = state.nextZombie++, angle = index * 0.61803398875 % 1 * Math.PI * 2, radius = 43 + index % 5 * 1.6;
      state.zombies.push({ id: `${state.round}-${index}`, x: Math.sin(angle) * radius, z: Math.cos(angle) * radius, hp: stats.hp, maxHp: stats.hp, attackAt: state.elapsed + stats.attackInterval });
    }
    state.spawnAt = state.elapsed + stats.spawnInterval;
  }
  const protectedNow = state.players.some((p) => p.protectionUntil > state.elapsed);
  for (const zombie of state.zombies) {
    const targetX = Math.max(-6.6, Math.min(6.6, zombie.x)), targetZ = Math.max(-6.6, Math.min(6.6, zombie.z));
    const dx = targetX - zombie.x, dz = targetZ - zombie.z, distance = Math.hypot(dx, dz);
    if (distance > 0.12) {
      const step = Math.min(distance, stats.speed * dt / 1e3);
      zombie.x += dx / distance * step;
      zombie.z += dz / distance * step;
      zombie.attackAt = state.elapsed + stats.attackInterval;
    } else if (state.elapsed >= zombie.attackAt) {
      if (!protectedNow) state.towerHp = Math.max(0, state.towerHp - stats.damage);
      zombie.attackAt = state.elapsed + stats.attackInterval;
    }
  }
  if (state.towerHp <= 0) state.status = "finished";
}
function hitSurvivalZombie(state, playerId, zombieId, baseDamage) {
  if (state.status !== "running" || !Number.isFinite(baseDamage) || baseDamage <= 0) return null;
  const player = state.players.find((p) => p.id === playerId && p.connected), zombie = state.zombies.find((z) => z.id === zombieId);
  if (!player || !zombie) return null;
  const damage = Math.min(1e3, baseDamage) * survivalDamageMultiplier(state, playerId);
  zombie.hp -= damage;
  if (zombie.hp > 0) return { damage, killed: false, reward: 0 };
  state.zombies.splice(state.zombies.indexOf(zombie), 1);
  const reward = zombieStats(state.elapsed).reward;
  state.points = Math.min(Number.MAX_SAFE_INTEGER, state.points + reward);
  state.kills++;
  player.kills++;
  if (player.bloodUntil > state.elapsed) state.towerHp = Math.min(state.towerMax, state.towerHp + state.towerMax * 0.01);
  return { damage, killed: true, reward };
}
function purchaseSurvival(state, playerId, item) {
  const player = state.players.find((p) => p.id === playerId && p.connected);
  if (!player || state.status !== "running") return { ok: false, error: "\u5BF9\u5C40\u5C1A\u672A\u5F00\u59CB" };
  if (item === "health" || item === "attack") {
    const cost = item === "health" ? state.towerMax * 5 : 200 * 2 ** state.attackLevel;
    if (!Number.isSafeInteger(cost) || cost > Number.MAX_SAFE_INTEGER / 5) return { ok: false, error: "\u5DF2\u8FBE\u5230\u672C\u5C40\u5347\u7EA7\u4E0A\u9650" };
    if (state.points < cost) return { ok: false, error: "\u751F\u5B58\u70B9\u4E0D\u8DB3" };
    state.points -= cost;
    if (item === "health") {
      state.towerMax *= 5;
      state.towerHp *= 5;
      state.healthLevel++;
    } else state.attackLevel++;
    return { ok: true };
  }
  if (state.elapsed < 3e5) return { ok: false, error: "\u751F\u5B58\u6EE1 5 \u5206\u949F\u89E3\u9501\u6280\u80FD" };
  if (!Object.hasOwn(SURVIVAL_SKILLS, item)) return { ok: false, error: "\u5347\u7EA7\u4E0D\u5B58\u5728" };
  const key = item, skill = SURVIVAL_SKILLS[key];
  if (key === "rage1" && player.rage > 0 || key === "rage2" && player.rage !== 1 || key === "blood" && player.blood || key === "protection" && player.protection) return { ok: false, error: key === "rage2" ? "\u9700\u8981\u5148\u8D2D\u4E70\u72C2\u66B4 I" : "\u5DF2\u62E5\u6709\u8BE5\u6280\u80FD" };
  if (state.points < skill.cost) return { ok: false, error: "\u751F\u5B58\u70B9\u4E0D\u8DB3" };
  state.points -= skill.cost;
  if (key === "rage1") player.rage = 1;
  else if (key === "rage2") player.rage = 2;
  else player[key] = true;
  return { ok: true };
}
function activateSurvivalSkill(state, playerId, slot) {
  const player = state.players.find((p) => p.id === playerId && p.connected);
  if (!player || state.status !== "running") return { ok: false, error: "\u5BF9\u5C40\u5C1A\u672A\u5F00\u59CB" };
  const key = slot === "5" ? player.rage === 2 ? "rage2" : "rage1" : slot === "6" ? "blood" : slot === "7" ? "protection" : null;
  if (!key || key.startsWith("rage") && !player.rage || key === "blood" && !player.blood || key === "protection" && !player.protection) return { ok: false, error: "\u672A\u8D2D\u4E70\u8BE5\u6280\u80FD" };
  const category = key.startsWith("rage") ? "rage" : key, ready = category === "rage" ? "rageReady" : category === "blood" ? "bloodReady" : "protectionReady", until = category === "rage" ? "rageUntil" : category === "blood" ? "bloodUntil" : "protectionUntil";
  if (player[ready] > state.elapsed) return { ok: false, error: "\u6280\u80FD\u51B7\u5374\u4E2D" };
  const skill = SURVIVAL_SKILLS[key];
  player[ready] = state.elapsed + skill.cooldown;
  player[until] = state.elapsed + skill.duration;
  return { ok: true };
}
export {
  SURVIVAL_SKILLS,
  TOWER_HEIGHT,
  TOWER_LIMIT,
  ZOMBIE_LIMIT,
  activateSurvivalSkill,
  hitSurvivalZombie,
  newSurvivalPlayer,
  newSurvivalState,
  purchaseSurvival,
  survivalDamageMultiplier,
  tickSurvival,
  zombieStats
};
