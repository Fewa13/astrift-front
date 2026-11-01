# Ancient Age — Hunts, Nemeses and Profession Relics

© 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.

## Entry and scope

The **Hunts / 狩猎** button appears in the Ancient lobby and in-game navigation. The panel has Contracts, Nemeses and Profession Relics tabs. Outdoor spawn ordering, FPS rules and existing dungeons are unchanged. Encounters use the first chamber of the existing dungeon scene, a separate `dungeon:<id>` per party. No extra monsters are spawned in shared outdoor maps.

## Contracts

- Track the Ravager (Lv10): four scouts, then one ravager.
- Elite Encirclement (Lv15): two packs of five mixed melee/ranged attackers, then a huntmaster.
- Hold the Beacon (Lv15): three waves of four, including two objective raiders and two escorts. Beacon starts with 100 integrity. Raiders path normally and wind up for 0.5s before dealing 8 integrity damage; attacks are at least 1.4s apart. Integrity persists across waves and reconnects.
- 1–3 party members; everyone must be alive, eligible, online and ready. Preparing expires after 5 minutes; active encounters after 8 minutes. Missing initial participants fail the run after 90s. No mid-run revives.
- Each participant selects a reward slot before starting. Each clear grants 2 Hunt Seals and crafting salvage: weapon 6, armor 5, helmet/wings 4. Contract salvage is tier 2. No completion XP; XP comes from kills through the existing contribution system.

## Nemeses

- Karok, Bonebreaker: Lv20 / 30 / 45; totem slam and a 126-degree sweep.
- Serahn, Thorncrown: Lv40 / 50 / 65; root spikes and an annular thorn field.
- Solo, even if the player belongs to a party. Beat the previous rank to unlock the next.
- Rank 2 adds ground attacks telegraphed for 1.4s every 7s; rank 3 also adds two reinforcements once, below 55% boss HP. Total enemies at once never exceeds three in a nemesis fight, five in contracts.
- Clear seals: 3 / 4 / 5, plus 2 extra for the first clear of each rank. First clear grants one item of the selected slot (quality 2 below Lv30, otherwise 3). Repeats still grant seals and salvage, not another first-clear item. Full equipment inventory converts the guaranteed item to 6 extra salvage instead of losing the reward.
- Run completion, profile rewards and first-clear flags commit together in a synchronous storage transaction. Clients cannot submit completion or rewards.

## Relics

One relic for each of eight professions, 8 Hunt Seals each; owned relics persist. One equipped slot, restricted to the current profession. No equipping during preparing/active dungeon encounters; swapping has a server-side 10s interval.

- Warrior: Slash leaves a delayed 35% impact echo.
- Summoner: Soul Bolt accelerates the active pet for 4s and leaves a 35% spirit impact.
- Frost: Ice Bolt leaves a stationary 3s damaging/slow field.
- Lightning: Chain marks up to 8 enemies; another damaging skill detonates hit marks for a small area burst. Storm handles its delayed damage explicitly.
- Curse: Drain spreads 35% damage and weakness from a weakened foe to 2 nearby enemies.
- Swordmaster: six Sword Rain strikes follow the target and reselect area victims each time; total baseline rain damage is unchanged. One visual effect follows the target, not six full effects.
- Shadowblade: Shadowstep leaves a delayed damaging afterimage at its origin.
- Stonewright: Stone Prison leaves a delayed aftershock.

Server runtime is bounded to 8 pending pulses/8 marks per player. Death and a new WebSocket connection cancel relic runtime, preventing map-transfer or disconnected delayed hits. Area effects obey walls; visuals use the same broadcast path as ordinary skills. The beacon reuses existing scene geometry/materials and is allocated once per scene.

## Verification

- `node scripts/ancient-hunts-check.mjs`: real World/SQLite transactions, readiness and selected rewards, beacon wind-up/damage, nemesis rank mechanics, first-clear replay protection, persistence, expiration, all 8 real relic combat hooks.
- `node scripts/ancient-hunts-browser-check.mjs`: real Chrome client + World/SQLite local transport; complete beacon and nemesis runs, return to Tribe, exchange/equip a relic, stable GPU geometry count, mobile layout, no missing assets/errors.
- Existing dungeon, boss, growth, profession trials, contributions/trade, fish inventory and corruption-map regressions retained.
