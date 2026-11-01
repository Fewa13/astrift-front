# Ancient growth pass — 2026-10-16

© 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.

## Scope and intent

First playable slice: Tribe → Forest preparation and equipment. No new map,
spawn-order changes, login rewards, equipment loss, or persistent 3D workload.
This validates a path through a difficulty wall; it does not establish player retention.

## Equipment

Legacy inventory IDs, quality, affixes, locks and ownership are preserved.
Definitions now give weapons separate percentage-based skill power (6/22/38/40/42/45%),
armor adds base-HP percentage (10/18/24/26/28/30%), helmets add cooldown reduction
(2/5/8/8/9/10%). Existing fixed melee damage is not added to skill damage.
Cooldown totals retain the 20% cap. Other existing set/affix effects remain.

New field equipment has four slots in three tiers. Normal Tribe enemies Lv1–9
give Trail Salvage, Lv10–25 Hunt Salvage; Forest enemies Lv30–60 give Forest Salvage.
Each ordinary kill grants one unit, distributed to a contributor through the existing
contribution loot ownership. There is also a 12% chance of one tier-appropriate item.
Temporary/summoned and dungeon enemies cannot generate these field rewards.
No passive teammate rewards were introduced.

Crafting: weapon 12, armor 10, helmet/wings 8 matching salvage. Class weapons cost
24 Hunt / 32 Forest Salvage. Unneeded unequipped/unlocked Common/Rare/Epic items
salvage into 2/3/4 units respectively, always less than new field recipes cost.
Trade-offered items cannot be salvaged, including after a server reconstruction.
There is a two-click irreversible-action confirmation in the equipment detail UI.

Eight class weapons prime one 10-second combo after a successful relevant cast:

| Profession | Sequence | Next ability damage |
|---|---|---|
| Warrior | Power Surge → Earthsplit Slash | +35% |
| Summoner | Soul Bolt → Soul Bolt | +30% |
| Ice | Ice Lance → Blizzard | +30% |
| Lightning | Chain Lightning → Thunderstorm | +30% |
| Curse | Hex → Life Drain | +35% |
| Swordmaster | Triple Cut → Sword Rain | +30% |
| Shadowblade | Shadowstep → Rift Blades | +35% |
| Stonewright | Stone Prison → Mountainfall | +30% |

The boost snapshots into actual delayed hits and DOTs. Failed casts neither prime
nor consume a combo. No cooldown resets, multiple stacking, or global damage cap.
The current equipped matching-profession weapon is required.

## Combat changes

The ordinary-monster factor at Lv20 formerly jumped to 17.5 times base attack.
It now rises from 10 at Lv20 to 17.5 at Lv30; Lv30+ ordinary curves are unchanged.
Early boss HP uses the greater of its same-level mob ratio and a reduced health
floor; this removes the player-HP-driven early sponge. Boss damage/telegraphs are
unchanged, and late boss curves converge to the prior floor at Lv100.
Stored monster HP migrations preserve remaining HP ratio and death state.

## UI and performance

Inventory compares skill power, HP, reduction and cooldown, in addition to melee.
A collapsed next-equipment goal describes sources and exact costs. Forge has
explicit tracking; saved targets survive reconnects. Completion clears that target
but does not silently equip the result. Other professions' class recipes are hidden.
The tracked goal and ready combo show compact HUD text, throttled to 5 Hz.
No extra enemies, textures, renderers or particle systems were added.

## Verification and interpretation

- `scripts/ancient-growth-check.mjs`: gear ratios at Lv10/20/30/40/50,
  eight real combos, delayed damage, guaranteed pre-boss materials, one-time kill
  rewards, profile isolation, persistent goals and trade-reserved salvage guard.
- Fixed-target benchmark uses actual casts, cooldowns, summons and delayed damage;
  normal Lv20 with Lv2 skills and matching craftable gear: 17–49s against a same-level
  chief. It excludes travel, dodging, latency and human input, not a real-player TTK promise.
- `scripts/ancient-growth-browser-check.mjs`: real-server crafting, equip,
  target tracking, two-step salvage, English/Chinese, missing assets/errors.
- Existing 24 profession trials, dungeon state, contribution rewards, Starfall
  world and 48 skill-FX parity tests pass; full Ancient Chrome regression passes.

The next design decision should use ordinary-player feedback: whether one session
produces a noticeable upgrade and a reason to retry, not how many recipes were added.
