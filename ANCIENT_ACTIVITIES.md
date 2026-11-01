# Ancient activities — 2026-10-16

© 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.

## Monster Codex / 怪物图鉴

- 48 entries, filtered by map. Actual participating kills unlock discovery, tactics and mastery.
- Ordinary research thresholds: 1 / 10 / 30 kills; bosses: 1 / 3 / 8.
- Three one-time reward claims per creature: gold, then gold and phase cores. Nearby attack observations and successful repositioning are recorded separately.
- New research starts counting after this update; historic kills are not reconstructed.
- Models load only on demand; closing the preview releases its renderer and instance resources.

## Profession Trials / 职业试炼

- Eight professions, each with distinct required abilities and goals; Normal / Advanced / Holy tiers.
- Unlock levels 1 / 20 / 80; Holy requires the selected profession's ascension.
- Fixed Lv.30 profile and Lv.3 skills. Uses real server-side skill damage, cooldowns, summons and delayed hits.
- Independent state: no outdoor health, inventory, potions, loot or spawn changes.
- First clears award 100 / 250 / 500 gold and the corresponding cosmetic badge. Repeats update best time without another payment.
- Badges are optional and visible to other players; each uses one cached, merged mesh.
- Arena has at most four enemies and a 30 FPS preview renderer. UI closure stops rendering and polling.

## Verification

`node scripts/ancient-activities-check.mjs` checks research isolation, one-time rewards and real completion of all 24 profession/tier combinations.

`node scripts/ancient-activities-browser-check.mjs` checks real server claims, badge permissions, actual trial damage and movement, bilingual UI, repeated preview cleanup and missing assets/runtime errors.

Existing contribution, dungeon, Starfall and skill-effect parity regressions remain unchanged and pass.
