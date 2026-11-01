# Ancient fishing refresh — 2026-10-16

© 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.

- F casts; the float lands in the water, then dips on a bite. F or left mouse hooks.
- Hold F, left mouse, or the HUD button to reel; release to ease line tension.
- Fish make irregular, seeded runs. Larger-species resistance is stronger. High
  tension is warned before sustained overload snaps the line. Ordinary fish are forgiving.
- The server integrates elapsed time, not click counts or client progress. Inputs
  expire after 750ms without refresh. Backgrounding, pausing and pointer loss release
  the line; moving away, injury, death, skills or cancellation end the activity.
- No offline reward, XP award, instant click completion or automatic recasting.
- Fourteen weighted fish species; nine occur in Tribe, ten in Forest. Species/weight
  remain private until landing. Catches retain normal stackable item keys and fixed
  species sale prices. Personal count and maximum weight persist in the profile.
- Every fish can be sold or cooked. Backpack Fish shows the fishing log;
  Consumables → Trail Cooking shows available fish recipes.
- The float, fishing line, rod motion, cranking hand and one reusable catch model
  give physical feedback. Catch geometry is allocated once, never once per fish.
- No new monster spawns, map reshuffle, additional renderer, or texture download.

Checks: `scripts/ancient-fishing-check.mjs` covers all species, timing, tension,
weighted pools, control expiry, duplicate/spam defense, logs, recipes and sales.
`scripts/ancient-leisure-check.mjs` includes real server fishing payment and record
persistence, plus mining/passages/unchanged spawning. The full Ancient Chrome
regression exercises the actual keyboard/hold UI, cooking and multiplayer cleanup.
