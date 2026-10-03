// AI shares each weapon's damage table with player shots. Shotguns model the
// fraction of pellets likely to land, instead of applying every pellet at range.
export function botWeaponDamage(weapon, zone, distance, weaponKey = '') {
  if (!weapon) return 0;
  if (weapon.blastRadius) return weapon.directDamage || 100;
  const base = weapon.damage[zone] ?? weapon.damage[zone === "leg" ? "arm" : "body"];
  if (!weapon.pellets) {
    const falloff = weaponKey === 'redline' ? 1 - Math.max(0, distance - 35) / Math.max(1, weapon.range - 35) * .25
      : weaponKey === 'smg' ? 1 - Math.max(0, distance - 22) / Math.max(1, weapon.range - 22) * .4
      : weaponKey === 'lmg' ? 1 - Math.max(0, distance - 45) / Math.max(1, weapon.range - 45) * .18 : 1;
    return Math.max(1, Math.round(base * falloff));
  }
  const range = Math.max(1, weapon.range);
  const landedFraction = Math.max(.18, .67 - Math.max(0, distance - 3) / range * .38);
  return Math.max(1, Math.round(base * weapon.pellets * landedFraction));
}
