<!-- © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved. -->
# Ancient Age

The Worlds button opens the atlas. Ancient Age requires an existing Astrift
account; progression is stored by account in the AncientWorld Durable Object.
It does not reuse ordinary FPS loadouts, ratings, equipment or inventories.

## First release

- Tribe: 80 × 1,000 m; inner settlement, hunting grounds and outer altar.
- One shared server-authoritative world, capped at 38 living creatures.
- Grox, Shardfang Hunters, Bonebreaker Chieftain and Gorash.
- Once a creature detects a player, it keeps that target across distances,
  regions and lost visibility until either dies or the player disconnects.
  Obstacles still prevent movement through solids and attacks through walls.
- Seven craftable guns; only Common quality is obtainable.
- Initial Common R6 and a small material pack prevent an unarmed first visit.
- Forest remains closed; higher-quality acquisition is deliberately deferred.
- WASD movement, Shift sprint, Space jump, RMB/held E aim, R reload, TAB bag.
- One primary gun; no equipment, phase ability, grenades or PvP damage.
- Dead players return to the initial camp; earned progression is retained.

## Progression

Damage is floored after applying `(ordinary damage / 2) * quality² * level^1.5
* stars^1.2`. XP to the next player level is `150 * currentLevel³`.
Star upgrades cost `quality * currentWeaponLevel² * targetStars` cores.
The 5-to-6-star breakthrough uses the old level and target 6, consumes another
identical gun of the same quality/level at 5 stars, and produces the next level
at 1 star. Materials are represented as inventory stacks of up to 999.

## Networking and rendering

Movement validation, collision, shots, ammunition, monster health, rewards and
crafting run on the server. Clients interpolate nearby actor snapshots; a
single-use 30-second authenticated ticket opens the WebSocket. An account's
previous connection is replaced when it enters elsewhere. Connection failure
retries automatically. Remote actor visibility is limited to 150 m.

Shared procedural textures and instanced static scenery reduce draw calls.
Creature geometry is batched per animated joint; transient effects are disposed.
No map-wide dynamic shadow pass or third-party art pack is required.

## Verification

Run `npm run build:modes`, `npm run typecheck`, then start local Wrangler on
port 8791 and run `node scripts/ancient-check.mjs`. The integration test creates
two local-only accounts and checks authentication, crafting, formulas, shared
positions/HP, rejected teleportation, real hits, single-award kills and storage.
