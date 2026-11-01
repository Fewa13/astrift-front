// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const BOSS_CARDS = {
  frost_crowned: { name: "\u971C\u70EC\u88C1\u4EE4\u8005\u53D8\u8EAB\u5361", en: "Frostfire Arbiter Transformation Card", recipe: { edictCore: 1, core: 200 }, health: 0.65, damage: 0.5, speed: 0.1, reduction: 0.22, color: 10086655 },
  starbound_heart: { name: "\u6C89\u661F\u6267\u6838\u8005\u53D8\u8EAB\u5361", en: "Sunken Corekeeper Transformation Card", recipe: { starCore: 1, core: 180 }, health: 0.65, damage: 0.5, speed: 0.1, reduction: 0.22, color: 9236193 },
  blight_lord: { name: "\u8680\u5FC3\u9886\u4E3B\u53D8\u8EAB\u5361", en: "Blightheart Lord Transformation Card", recipe: { blightHeart: 1, core: 180 }, health: 0.65, damage: 0.5, speed: 0.1, reduction: 0.22, color: 13073151 },
  oathknight: { name: "\u5931\u8A93\u9A91\u58EB\u53D8\u8EAB\u5361", en: "Forsworn Knight Transformation Card", recipe: { royalSeal: 1, core: 100 }, health: 0.5, damage: 0.4, speed: 0.15, reduction: 0.2, color: 16765575 },
  emptyking: { name: "\u7A7A\u51A0\u4E4B\u738B\u53D8\u8EAB\u5361", en: "Empty-Crowned King Transformation Card", recipe: { emptyCrown: 1, core: 150 }, health: 0.6, damage: 0.5, speed: 0.12, reduction: 0.2, color: 10140671 },
  lord: { name: "\u6208\u62C9\u4EC0\u53D8\u8EAB\u5361", en: "Gorash Transformation Card", recipe: { crown: 1, core: 20 }, health: 0.5, damage: 0.45, speed: 0.1, reduction: 0.15, color: 16753992 },
  rootwarden: { name: "\u53E4\u6839\u5B88\u536B\u53D8\u8EAB\u5361", en: "Rootwarden Transformation Card", recipe: { rootHeart: 1, core: 30 }, health: 0.65, damage: 0.3, speed: 0.1, reduction: 0.18, color: 7466896 },
  crystal_metal: { name: "\u91D1\u66DC\u5DE8\u4EBA\u53D8\u8EAB\u5361", en: "Aurum Titan Transformation Card", recipe: { metalCrystal: 1, core: 60 }, health: 0.5, damage: 0.4, speed: 0.1, reduction: 0.18, color: 16767602 },
  crystal_wood: { name: "\u82CD\u6728\u5DE8\u4EBA\u53D8\u8EAB\u5361", en: "Verdant Titan Transformation Card", recipe: { woodCrystal: 1, core: 60 }, health: 0.65, damage: 0.3, speed: 0.12, reduction: 0.15, color: 4842912 },
  crystal_water: { name: "\u6CA7\u6F9C\u5DE8\u4EBA\u53D8\u8EAB\u5361", en: "Tidal Titan Transformation Card", recipe: { waterCrystal: 1, core: 60 }, health: 0.5, damage: 0.3, speed: 0.18, reduction: 0.18, color: 6936575 },
  crystal_fire: { name: "\u7194\u7130\u5DE8\u4EBA\u53D8\u8EAB\u5361", en: "Ember Titan Transformation Card", recipe: { fireCrystal: 1, core: 60 }, health: 0.4, damage: 0.5, speed: 0.12, reduction: 0.12, color: 16738622 },
  crystal_earth: { name: "\u7384\u5CA9\u5DE8\u4EBA\u53D8\u8EAB\u5361", en: "Terra Titan Transformation Card", recipe: { earthCrystal: 1, core: 60 }, health: 0.75, damage: 0.25, speed: 0.08, reduction: 0.22, color: 13345914 }
};
function bossCardKey(kind) {
  return "bossCard:" + kind;
}
function bossCardDefinition(kind) {
  return Object.hasOwn(BOSS_CARDS, kind) ? BOSS_CARDS[kind] : void 0;
}
function activeBossForm(a, now = Date.now()) {
  const f = a.skillRuntime?.bossForm;
  return f && f.until > now && bossCardDefinition(f.kind) ? f : void 0;
}
function bossFormStats(a, now = Date.now()) {
  const f = activeBossForm(a, now);
  return f ? bossCardDefinition(f.kind) : void 0;
}
function healBossCard(a, untransformedMax) {
  const max = a.maxHp || untransformedMax;
  a.hp = Math.min(max, a.hp + Math.max(0, max - untransformedMax));
}
function bossCardDescription(kind, en = false) {
  const d = bossCardDefinition(kind);
  if (!d) return "";
  const percent = (n) => Math.round(n * 100);
  return en ? `60s \xB7 Max HP +${percent(d.health)}% \xB7 Damage +${percent(d.damage)}% \xB7 Speed +${percent(d.speed)}% \xB7 Incoming damage \u2212${percent(d.reduction)}%. Consumed on use; forms do not stack; ends on death; offline time counts.` : `60\u79D2 \xB7 \u751F\u547D\u4E0A\u9650+${percent(d.health)}% \xB7 \u4F24\u5BB3+${percent(d.damage)}% \xB7 \u79FB\u901F+${percent(d.speed)}% \xB7 \u53D7\u5230\u4F24\u5BB3\u51CF\u5C11${percent(d.reduction)}%\u3002\u4F7F\u7528\u6D88\u8017\u4E00\u5F20\uFF1B\u53D8\u8EAB\u4E0D\u53E0\u52A0\uFF1B\u6B7B\u4EA1\u7ED3\u675F\uFF1B\u79BB\u7EBF\u4ECD\u8BA1\u65F6\u3002`;
}
function craftBossCard(p, kind) {
  const d = bossCardDefinition(kind);
  if (!d) return "\u914D\u65B9\u4E0D\u5B58\u5728";
  const key = bossCardKey(kind), count = p.materials[key] || 0;
  if (!Number.isSafeInteger(count) || count >= 999999) return "\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650";
  if (Object.entries(d.recipe).some(([k, n]) => !Number.isSafeInteger(p.materials[k]) || p.materials[k] < n)) return "\u5408\u6210\u6750\u6599\u4E0D\u8DB3";
  for (const [k, n] of Object.entries(d.recipe)) p.materials[k] -= n;
  p.materials[key] = count + 1;
  return null;
}
function useBossCard(p, a, kind, now = Date.now()) {
  const d = bossCardDefinition(kind), key = bossCardKey(kind);
  if (!d || (p.materials[key] || 0) < 1) return "\u7269\u54C1\u4E0D\u8DB3";
  if (a.hp <= 0) return "\u8BF7\u5728\u5B58\u6D3B\u65F6\u4F7F\u7528\u53D8\u8EAB\u5361";
  if ((a.skillRuntime?.effects?.transform?.until || 0) > now) return "\u53D8\u8EAB\u671F\u95F4\u4E0D\u80FD\u4F7F\u7528\u53D8\u8EAB\u5361";
  a.skillRuntime ??= { cooldowns: {}, effects: {}, mode: 1, lastAux: 0 };
  a.skillRuntime.bossForm = { kind, until: now + 6e4 };
  a.skillRuntime.mode = 1;
  p.materials[key]--;
  return null;
}
export {
  BOSS_CARDS,
  activeBossForm,
  bossCardDefinition,
  bossCardDescription,
  bossCardKey,
  bossFormStats,
  craftBossCard,
  healBossCard,
  useBossCard
};
