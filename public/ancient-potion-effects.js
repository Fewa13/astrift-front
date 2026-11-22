// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const POTION_EFFECTS = { duration: 6e5, speed: 0.5, berserk: { cooldown: 0.8, damage: 2, speed: 0.3, incoming: 1.5, melee: 0.7, range: 1.1 }, element: { chance: 0.2, interval: 1e3, duration: 4e3, fireTotal: 0.3, damage: 0.2, chain: 0.15, chainRadius: 6 } };
const ELEMENT_POTIONS = ["elementFire", "elementLightning", "elementCurse", "elementEarth", "elementIce"];
const potionActive = (a, id, now = Date.now()) => (a.boosts?.[id] || 0) > now;
const potionCooldownMultiplier = (a, now = Date.now()) => potionActive(a, "berserk", now) ? POTION_EFFECTS.berserk.cooldown : 1;
const potionRangeMultiplier = (a, now = Date.now()) => potionActive(a, "berserk", now) ? POTION_EFFECTS.berserk.range : 1;
const potionSpeedMultiplier = (a, now = Date.now()) => 1 + (potionActive(a, "speed", now) ? POTION_EFFECTS.speed : 0) + (potionActive(a, "berserk", now) ? POTION_EFFECTS.berserk.speed : 0);
const potionDamageMultiplier = (a, now = Date.now()) => potionActive(a, "damage", now) || potionActive(a, "berserk", now) ? POTION_EFFECTS.berserk.damage : 1;
const potionCooldownReduction = (base, a, now = Date.now()) => base + (1 - base) * (1 - potionCooldownMultiplier(a, now));
const potionIncomingMultiplier = (a, now = Date.now()) => potionActive(a, "berserk", now) ? POTION_EFFECTS.berserk.incoming : 1;
const potionMeleeMultiplier = (a, now = Date.now()) => potionActive(a, "berserk", now) ? POTION_EFFECTS.berserk.melee : 1;
export {
  ELEMENT_POTIONS,
  POTION_EFFECTS,
  potionActive,
  potionCooldownMultiplier,
  potionCooldownReduction,
  potionDamageMultiplier,
  potionIncomingMultiplier,
  potionMeleeMultiplier,
  potionRangeMultiplier,
  potionSpeedMultiplier
};
