<!-- © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved. -->

# Asset licenses

This file records the provenance of assets shipped with Astrift / ASTRIFT FRONT.

## Original project assets

- Ancient Age: procedural soil/wood/fur/rock textures, tribal settlement,
  creatures, player meshes and animations were created in code for this project.
  No third-party model or texture pack is used in this world.
- Bonebreaker Hollow: stone-grain/fracture textures, chambers, bone throne,
  traps, runes, pillars and rubble are original procedural project assets.
  The dungeon reuses this project's existing creatures and weapon visuals.

- Game code, gameplay systems, UI layouts, fictional weapon designs, fictional
  names, original 3D meshes, materials, effects, and promotional compositions:
  created for this project by Felix / project contributors; all rights reserved.
- Project screenshots and gameplay recordings: captured from this project and
  owned by the project copyright holder.
- World chooser `world-entry-fps.webp` and `world-entry-ancient.webp`: reused
  original Astrift scene captures from `astrift-hub/public/front-real.webp` and
  `astrift-hub/public/ancient-real.webp` (2026-10-16). No stock art or AI-painted
  scenery; decorative chooser symbols are original inline SVG/CSS.
- Generated promotional artwork: commissioned/generated for this project and
  treated as project artwork; all rights reserved unless a separate source is
  credited alongside the asset.

## Third-party software

- Ancient Stone Workshop: `src/jade/rock-geometry.js`, `workshop3d.js` and the
  required portions of `stone-core.js` reuse Felix's own `jade-night-market`
  project (2026-10-19). Original rock mesh, procedural skin/jade shaders,
  saw/reveal animation and fragment geometry are retained. Ancient's adapter
  supplies authenticated storage, fees, bilingual UI and authoritative assays;
  the Night Market's market, collection, daily rewards and payments are absent.

- Three.js: distributed under the MIT License. See `node_modules/three/LICENSE`.
- Cloudflare Workers tooling and runtime packages: retain their respective
  upstream licenses in `node_modules/*/LICENSE*` or package metadata.

## Audio, fonts, and external media

The game currently uses procedural/runtime-generated sound and system/browser
fonts. No uncredited commercial music, font, or stock-media file is intended
to ship in the game build. If a new asset is added, record its creator, source,
license, and purchase/attribution terms in this file before release.

## License hygiene

Do not remove upstream license files. A packaged build may omit development-only
files, but the corresponding license obligations must still be honored.
