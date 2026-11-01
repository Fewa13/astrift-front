// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { ancientBaseAttack, ancientBaseHealth } from "./ancient-gear.js";
import { ancientMobHealth, ancientMobDamageScale } from "./ancient-mob-stats.js";
const BESTIARY = {
  bone_shield: { name: "\u9AA8\u76FE\u536B\u58EB", en: "Bone-Shield Guard", map: "tribe", base: "hunter", size: 1.2, range: 3, speed: 3.2, boss: false, health: 1.25, damage: 1, xp: 1.15, behavior: "shield", color: 14861467 },
  wasteland_runner: { name: "\u8352\u539F\u5954\u517D", en: "Wasteland Charger", map: "tribe", base: "grox", size: 1.5, range: 3, speed: 4, boss: false, health: 1.1, damage: 1.1, xp: 1.1, behavior: "charge", color: 13671266 },
  totem_priest: { name: "\u56FE\u817E\u796D\u53F8", en: "Totem Priest", map: "tribe", base: "hunter", size: 1.1, range: 14, speed: 3.2, boss: false, health: 0.9, damage: 0.8, xp: 1.15, behavior: "totem", color: 14854490 },
  bone_javelin: { name: "\u9AA8\u77DB\u6295\u624B", en: "Bone Javeliner", map: "tribe", base: "hunter", size: 1.1, range: 20, speed: 4, boss: false, health: 0.95, damage: 1, xp: 1.1, behavior: "javelin", color: 14202244 },
  branch_panther: { name: "\u679D\u8DC3\u730E\u8C79", en: "Branchbound Panther", map: "forest", base: "mossling", size: 1.4, range: 3, speed: 4.5, boss: false, health: 1, damage: 1.05, xp: 1.1, behavior: "pounce", color: 8760681 },
  parasite_bloom: { name: "\u5BC4\u751F\u82B1\u5996", en: "Parasitic Bloom", map: "forest", base: "thorn", size: 1.35, range: 15, speed: 2.3, boss: false, health: 1.1, damage: 0.8, xp: 1.15, behavior: "bloom", color: 14515116 },
  oath_cavalry: { name: "\u6B8B\u8A93\u9A91\u5175", en: "Broken-Oath Cavalry", map: "city", base: "city_guard", size: 1.6, range: 3.5, speed: 4.2, boss: false, health: 1.4, damage: 1.15, xp: 1.2, behavior: "charge", color: 12034412 },
  chain_jailer: { name: "\u9501\u94FE\u72F1\u5352", en: "Chain Jailer", map: "city", base: "city_guard", size: 1.5, range: 22, speed: 3.3, boss: false, health: 1.2, damage: 0.85, xp: 1.15, behavior: "hook", color: 12823201 },
  hollow_noble: { name: "\u7A7A\u58F3\u8D35\u65CF", en: "Hollow Noble", map: "city", base: "city_acolyte", size: 1.2, range: 16, speed: 3.1, boss: false, health: 1.05, damage: 1, xp: 1.15, behavior: "illusion", color: 11054580 },
  noble_echo: { name: "\u8D35\u65CF\u5E7B\u5F71", en: "Noble Echo", map: "city", base: "city_acolyte", size: 1.2, range: 12, speed: 3.1, boss: false, health: 0.12, damage: 0.3, xp: 0, behavior: "echo", color: 6585004 },
  brokenwing: { name: "\u65AD\u7FFC\u9B54\u79BD", en: "Brokenwing Fiend", map: "blight", base: "blight_stalker", size: 1.7, range: 3, speed: 4.2, boss: false, health: 1.05, damage: 1.05, xp: 1.1, behavior: "dive", color: 12289768 },
  shade_prowler: { name: "\u8680\u5F71\u6F5C\u730E\u8005", en: "Blightshade Prowler", map: "blight", base: "rift_maw", size: 1.45, range: 3, speed: 4, boss: false, health: 1.1, damage: 1.05, xp: 1.1, behavior: "shadow", color: 10773445 },
  refract_twin: { name: "\u6298\u5149\u53CC\u751F\u8005", en: "Refracted Twin", map: "sanctum", base: "sanctum_sentinel", size: 1.45, range: 3.2, speed: 3.8, boss: false, health: 1, damage: 1, xp: 1.1, behavior: "twin", color: 9168608 },
  light_deacon: { name: "\u5DE1\u5149\u6267\u4E8B", en: "Lightwarden Deacon", map: "sanctum", base: "mirror_wraith", size: 1.35, range: 22, speed: 3, boss: false, health: 1, damage: 1, xp: 1.1, behavior: "ring", color: 16768924 }
};
for (const [e, name, color] of [["metal", "\u91D1", 16766315], ["wood", "\u6728", 7463825], ["water", "\u6C34", 6475007], ["fire", "\u706B", 16740440], ["earth", "\u571F", 14332024]]) BESTIARY["crystal_wisp_" + e] = { name: "\u5E7C\u6676\u7075\xB7" + name, en: e[0].toUpperCase() + e.slice(1) + " Crystal Wisp", map: "forest", base: "sentinel", size: 1, range: 16, speed: 3.4, boss: false, health: 0.9, damage: 0.85, xp: 1.05, behavior: "wisp", color };
BESTIARY.crystal_wisp_earth.range = 6;
function bestiaryHP(kind, l) {
  const d = BESTIARY[kind];
  if (!d) return 0;
  const progress = Math.min(1, Math.max(0, (l - 1) / 69)), base = d.map === "blight" || d.map === "sanctum" ? ancientBaseAttack(l) * 12 : ancientBaseAttack(l) * (8 + 4 * progress);
  return kind === "noble_echo" ? Math.round(base * d.health) : ancientMobHealth(l, base * d.health);
}
function bestiaryDamage(kind, l) {
  const d = BESTIARY[kind];
  return d ? Math.max(20, Math.round(ancientBaseHealth(l) * (d.map === "blight" || d.map === "sanctum" ? 0.07 : 0.04 + 0.025 * Math.min(1, (l - 1) / 49)) * d.damage * ancientMobDamageScale(l))) : 0;
}
function bestiarySlot(map, region, index) {
  const i = index % (map === "tribe" ? 12 : map === "forest" ? 10 : map === "sanctum" ? 8 : 9);
  if (map === "tribe") return region === 0 ? i < 2 ? "wasteland_runner" : null : ["bone_shield", "totem_priest", "bone_javelin", "wasteland_runner"][i] || null;
  if (map === "forest") return region === 0 ? i < 2 ? "branch_panther" : null : region === 1 ? ["branch_panther", "parasite_bloom"][i] || null : ["parasite_bloom", "crystal_wisp_metal", "crystal_wisp_wood", "crystal_wisp_water", "crystal_wisp_fire", "crystal_wisp_earth"][i] || null;
  if (map === "city") return ["oath_cavalry", "chain_jailer", "hollow_noble", "noble_echo", "noble_echo"][i] || null;
  if (map === "blight") return ["brokenwing", "shade_prowler"][i] || null;
  if (map === "sanctum") return ["refract_twin", "refract_twin", "light_deacon"][i] || null;
  return null;
}
const BESTIARY_HOOK_WIDTH = 1.4;
function bestiaryHookContact(s, p, now, dt) {
  if (now < s.hitAt || now > s.ends + 200) return false;
  const dx = s.tx - s.ax, dz = s.tz - s.az, len = Math.hypot(dx, dz);
  if (len < 1e-3) return false;
  const along = ((p.x - s.ax) * dx + (p.z - s.az) * dz) / len, side = Math.abs((p.x - s.ax) * dz - (p.z - s.az) * dx) / len;
  if (along < 0 || along > len || side > BESTIARY_HOOK_WIDTH / 2) return false;
  const duration = Math.max(1, s.ends - s.hitAt), previous = Math.max(s.hitAt, s.hookCheckedAt ?? now - Math.min(0.2, Math.max(0, dt)) * 1e3), from = Math.min(1, Math.max(0, (previous - s.hitAt) / duration)) * len, to = Math.min(1, Math.max(0, (now - s.hitAt) / duration)) * len;
  return along >= from - 0.2 && along <= to + 0.2;
}
function bestiaryIncoming(m, ax, az, now) {
  const d = BESTIARY[m.kind];
  if (!d) return 1;
  if (d.behavior === "shield" && !m.special && (m.recoverUntil || 0) <= now && m.facing !== void 0) {
    const dot = ((ax - m.x) * Math.sin(m.facing) + (az - m.z) * Math.cos(m.facing)) / (Math.hypot(ax - m.x, az - m.z) || 1);
    if (dot > 0.45) return 0.35;
  }
  return d.behavior === "twin" && m.linked?.length ? 0.75 : 1;
}
function prepareBestiary(ms, now, clear) {
  for (const m of ms) {
    m.linked = void 0;
    if (m.hp <= 0) continue;
    const behavior = BESTIARY[m.kind]?.behavior;
    if (behavior === "twin") {
      const other = ms.find((v) => v.id !== m.id && v.kind === "refract_twin" && v.hp > 0 && Math.hypot(v.x - m.x, v.z - m.z) < 10 && clear(m.x, m.z, v.x, v.z));
      if (other) m.linked = other.id;
    }
    if (behavior === "totem") {
      for (const v of ms) if (v !== m && v.hp > 0 && !["chief", "lord"].includes(v.kind) && !v.kind.includes("lord") && Math.hypot(v.x - m.x, v.z - m.z) < 9 && clear(m.x, m.z, v.x, v.z)) {
        v.buffUntil = now + 350;
        v.buffPower = 1.2;
      }
    }
  }
}
function tickBestiary(m, target, c) {
  const d = BESTIARY[m.kind];
  if (!d) return false;
  const { now, dt } = c;
  if (m.hp <= 0) {
    delete m.special;
    delete m.linked;
    return true;
  }
  if (now < (m.recoverUntil || 0)) {
    m.action = "recover";
    m.air = 0;
    return true;
  }
  if (!target) {
    delete m.special;
    m.air = d.behavior === "dive" ? 0.7 : 0;
    return false;
  }
  const dist = Math.hypot(target.x - m.x, target.z - m.z);
  if (!m.special) m.facing = Math.atan2(target.x - m.x, target.z - m.z);
  const canSee = c.clear(m.x, m.z, target.x, target.z);
  const areaHit = (x, z, r, power, low = false) => {
    for (const p of c.victims) if (p.hp > 0 && Math.hypot(p.x - x, p.z - z) < r && (!low || p.y - c.ground(p.x, p.z) < 2.2) && c.clear(m.x, m.z, p.x, p.z)) c.hit(m, p, power);
  };
  if (m.special) {
    const s = m.special;
    m.facing = Math.atan2(s.tx - s.ax, s.tz - s.az);
    if (now < s.hitAt) {
      m.action = s.id === "shadow" ? "shadow" : "windup";
      if (s.id === "shadow") c.move(m, target.x, target.z, dt * d.speed);
      return true;
    }
    if (s.id === "shadow") {
      c.fx(m, "shadow", "cancel", [], s.started, now);
      s.id = "pounce";
      s.ax = m.x;
      s.az = m.z;
      s.tx = target.x;
      s.tz = target.z;
      s.started = now;
      s.hitAt = now + 600;
      s.ends = now + 2100;
      m.action = "windup";
      m.actionAt = now;
      c.fx(m, "pounce", "warning", [{ x: m.x, z: m.z, radius: 0, length: Math.hypot(s.tx - m.x, s.tz - m.z), width: 2.5, angle: Math.atan2(s.tx - m.x, s.tz - m.z) }], s.started, s.hitAt, { tx: s.tx, tz: s.tz, ends: s.ends });
      return true;
    }
    if (["charge", "pounce", "dive"].includes(s.id)) {
      m.action = s.id === "dive" ? "dive" : "charge";
      m.air = s.id === "dive" ? Math.max(0, 0.7 * (1 - (now - s.hitAt) / 700)) : 0;
      const ox = m.x, oz = m.z, dx = s.tx - m.x, dz = s.tz - m.z, length = Math.hypot(dx, dz), step = Math.min(length, dt * (s.id === "charge" ? 14 : 12)), nx = m.x + dx / (length || 1) * step, nz = m.z + dz / (length || 1) * step;
      let wall = false;
      for (let v = 0.25; v <= step + 0.25; v += 0.25) {
        const f = Math.min(step, v) / (step || 1);
        if (c.solid(m.x + (nx - m.x) * f, m.z + (nz - m.z) * f)) {
          wall = true;
          break;
        }
      }
      if (!wall) {
        m.x = nx;
        m.z = nz;
      }
      for (const p of c.victims) {
        const vx = m.x - ox, vz = m.z - oz, t = Math.max(0, Math.min(1, ((p.x - ox) * vx + (p.z - oz) * vz) / (vx * vx + vz * vz || 1)));
        if (p.hp > 0 && !s.hit.includes(p.name) && Math.hypot(p.x - ox - vx * t, p.z - oz - vz * t) < 2.6 && p.y - c.ground(p.x, p.z) < 3 && c.clear(m.x, m.z, p.x, p.z)) {
          s.hit.push(p.name);
          c.hit(m, p, 1.25);
        }
      }
      if (wall || length < 0.6 || now > s.ends) {
        delete m.special;
        m.action = "recover";
        m.actionAt = now;
        m.recoverUntil = now + (wall ? 1700 : 1e3);
        m.air = 0;
      }
      return true;
    }
    if (s.id === "hook") {
      m.action = "attack";
      const hookY = c.ground(s.ax, s.az) + 1.5;
      const victim = c.victims.filter((p) => p.hp > 0 && bestiaryHookContact(s, p, now, dt) && hookY >= p.y - 1.7 && hookY <= p.y + 0.3 && c.clear(s.ax, s.az, p.x, p.z)).sort((a, b) => Math.hypot(a.x - s.ax, a.z - s.az) - Math.hypot(b.x - s.ax, b.z - s.az))[0];
      s.hookCheckedAt = now;
      if (victim) {
        c.hit(m, victim, 1);
        const n = Math.hypot(m.x - victim.x, m.z - victim.z) || 1;
        c.pull(victim, victim.x + (m.x - victim.x) / n * Math.max(0, Math.min(2, n - 2)), victim.z + (m.z - victim.z) / n * Math.max(0, Math.min(2, n - 2)));
      }
      if (victim || now >= s.ends) {
        c.fx(m, s.id, "impact", [{ x: victim?.x ?? s.tx, z: victim?.z ?? s.tz, radius: 0.2 }], s.started, now);
        delete m.special;
        m.recoverUntil = now + 450;
      }
      return true;
    }
    if (s.id === "javelin" || s.id === "bolt") {
      if (now < s.ends) {
        m.action = "attack";
        return true;
      }
      for (const p of c.victims) if (p.hp > 0 && Math.hypot(p.x - s.tx, p.z - s.tz) < 1.25 && p.y - c.ground(p.x, p.z) < 3 && c.clear(s.ax, s.az, p.x, p.z)) {
        c.hit(m, p, m.kind === "crystal_wisp_metal" ? 1.15 : 1);
        if (m.kind === "crystal_wisp_water") p.hinderedUntil = now + 1500;
      }
      c.fx(m, s.id, "impact", [{ x: s.tx, z: s.tz, radius: 1.2 }], s.started, now);
      delete m.special;
      m.recoverUntil = now + 450;
      if (d.behavior === "javelin") {
        const side = (m.step || 0) % 2 ? 1 : -1;
        c.move(m, m.x + Math.cos(m.facing || 0) * side * 4, m.z - Math.sin(m.facing || 0) * side * 4, 3);
      }
      return true;
    }
    if (s.id === "ring") {
      const radius = Math.min(18, 2 + (now - s.hitAt) / 1e3 * 5);
      for (const p of c.victims) {
        const angle2 = Math.atan2(p.x - s.ax, p.z - s.az), gap = Math.abs(Math.atan2(Math.sin(angle2 - (m.facing || 0)), Math.cos(angle2 - (m.facing || 0))));
        if (p.hp > 0 && !s.hit.includes(p.name) && gap > 0.32 && Math.abs(Math.hypot(p.x - s.ax, p.z - s.az) - radius) < 1.1 && p.y - c.ground(p.x, p.z) < 2.4 && c.clear(s.ax, s.az, p.x, p.z)) {
          s.hit.push(p.name);
          c.hit(m, p, 1);
        }
      }
      if (now > s.ends) {
        delete m.special;
        m.recoverUntil = now + 700;
      }
      return true;
    }
    if (s.id === "bloom" || s.id === "totem") {
      for (const v of c.monsters) if (v.id !== m.id && v.hp > 0 && !["chief", "lord", "rootwarden", "oathknight", "emptyking", "blight_lord", "immaculate_judge", "crystal_metal", "crystal_wood", "crystal_water", "crystal_fire", "crystal_earth"].includes(v.kind) && Math.hypot(v.x - m.x, v.z - m.z) < 9 && c.clear(m.x, m.z, v.x, v.z)) {
        if (s.id === "bloom") v.hp = Math.min(v.maxHp, v.hp + Math.ceil(v.maxHp * 0.03));
      }
      areaHit(target.x, target.z, 1.5, 0.8);
      c.fx(m, s.id, "impact", [{ x: m.x, z: m.z, radius: 9 }], s.started, now);
    } else if (s.id === "flare") areaHit(s.tx, s.tz, 3, 1);
    else areaHit(m.x, m.z, d.range + 0.3, 1, true);
    delete m.special;
    m.action = "attack";
    m.actionAt = now;
    m.recoverUntil = now + 500;
    return true;
  }
  const startRange = ["charge", "pounce", "dive", "shadow"].includes(d.behavior) ? 14 : d.range;
  if (dist > startRange || !canSee) {
    c.move(m, target.x, target.z, dt * d.speed);
    m.action = "walk";
    m.air = d.behavior === "dive" ? 0.7 : 0;
    return true;
  }
  if (now < m.attackAt) {
    m.action = d.behavior === "shield" ? "guard" : "idle";
    return true;
  }
  let id = d.behavior === "shield" || d.behavior === "twin" ? "melee" : d.behavior === "charge" ? "charge" : d.behavior === "pounce" ? "pounce" : d.behavior === "dive" ? "dive" : d.behavior === "shadow" ? "shadow" : d.behavior === "hook" ? "hook" : d.behavior === "javelin" ? "javelin" : d.behavior === "ring" ? "ring" : d.behavior === "bloom" ? "bloom" : d.behavior === "totem" ? "totem" : "bolt";
  if (m.kind === "crystal_wisp_wood") id = "bloom";
  if (m.kind === "crystal_wisp_fire") id = "flare";
  if (m.kind === "crystal_wisp_earth") id = "quake";
  if (d.behavior === "pounce") {
    const side = (m.step || 0) % 2 ? 1 : -1;
    c.move(m, m.x + Math.cos(m.facing || 0) * side * 2, m.z - Math.sin(m.facing || 0) * side * 2, 1.5);
  }
  const windup = id === "hook" ? 850 : id === "charge" ? 800 : id === "pounce" || id === "dive" ? 650 : id === "shadow" ? 1200 : id === "ring" ? 900 : 600, angle = Math.atan2(target.x - m.x, target.z - m.z), len = Math.min(id === "hook" ? 22 : 16, dist), tx = m.x + Math.sin(angle) * len, tz = m.z + Math.cos(angle) * len;
  const travel = ["hook", "javelin", "bolt"].includes(id) ? Math.max(250, len / 16 * 1e3) : id === "ring" ? 3300 : 1500;
  if (d.behavior === "illusion") for (const echo of c.monsters.filter((v) => v.patron === m.id && v.hp <= 0)) {
    for (const [dx, dz] of [[-3, 2], [3, -2], [-2, -3], [2, 3]]) {
      if (c.solid(m.x + dx, m.z + dz)) continue;
      echo.x = m.x + dx;
      echo.z = m.z + dz;
      echo.hp = echo.maxHp;
      echo.target = target.name;
      echo.attackAt = now + 600;
      echo.respawnAt = Number.MAX_SAFE_INTEGER;
      break;
    }
  }
  m.special = { id, started: now, hitAt: now + windup, ends: now + windup + travel, ax: m.x, az: m.z, tx, tz, hit: [] };
  m.attackAt = now + (id === "ring" ? 6e3 : id === "totem" || id === "bloom" ? 4e3 : 3e3);
  m.step = (m.step || 0) + 1;
  m.action = id === "shadow" ? "shadow" : "windup";
  m.actionAt = now;
  const areas = ["charge", "pounce", "dive", "shadow", "hook", "javelin", "bolt"].includes(id) ? [{ x: m.x, z: m.z, radius: 0, length: Math.max(1, len), width: id === "hook" ? BESTIARY_HOOK_WIDTH : 2.5, angle }] : [{ x: id === "flare" ? tx : m.x, z: id === "flare" ? tz : m.z, radius: id === "ring" ? 18 : id === "flare" ? 3 : id === "bloom" || id === "totem" ? 9 : d.range }];
  c.fx(m, id, "warning", areas, now, now + windup, { tx, tz, ends: m.special.ends, gap: angle });
  return true;
}
export {
  BESTIARY,
  BESTIARY_HOOK_WIDTH,
  bestiaryDamage,
  bestiaryHP,
  bestiaryHookContact,
  bestiaryIncoming,
  bestiarySlot,
  prepareBestiary,
  tickBestiary
};
