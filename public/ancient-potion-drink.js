// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const POTION_DRINK_MS = 2e3;
function beginPotionDrink(a, id, heal, now = Date.now()) {
  if (a.drinking) return "\u6B63\u5728\u559D\u836F";
  if (a.hp <= 0) return "\u8BF7\u5728\u5B58\u6D3B\u65F6\u4F7F\u7528\u8840\u74F6";
  if (a.hp >= (a.maxHp || 100)) return "\u751F\u547D\u503C\u5DF2\u6EE1";
  a.drinking = { id, heal, started: now, ends: now + POTION_DRINK_MS };
  return null;
}
function finishPotionDrink(a, now = Date.now()) {
  const drink = a.drinking;
  if (!drink) return null;
  if (a.hp <= 0) {
    delete a.drinking;
    return null;
  }
  if (now < drink.ends) return null;
  delete a.drinking;
  const amount = Math.max(0, Math.min(drink.heal, (a.maxHp || 100) - a.hp));
  a.hp += amount;
  return amount;
}
export {
  POTION_DRINK_MS,
  beginPotionDrink,
  finishPotionDrink
};
