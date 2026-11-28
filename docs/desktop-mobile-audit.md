# Desktop and mobile bug audit

Status: implementation and non-browser regressions complete; browser/device acceptance pending. No production deployment was performed for this audit.

## Confirmed issues and changes

| Priority | Evidence | Fix |
| --- | --- | --- |
| P1 Community | Unit separation checked player collision and projectile line of sight. Both allow passage through monster-only walls. | Use monster collision and a swept monster walk check for community units. Keep population and collision fixes already implemented. |
| P1 Startup | `createStartupFlow()` mounted FPS and Ancient before showing the chooser. The old frame was retained while the next renderer initialized. | Mount Ancient after selection and remove the prior frame before mounting the next one. Apply the same lifecycle to the generated single HTML shell. |
| P1 Startup | The FPS chooser preparation requested an Ancient profile that Ancient requested again after selection. | Defer that request to the selected Ancient client. Add timing spans for FPS host, authentication, account preparation and chooser preparation. |
| P1 Touch | Ancient joystick, attack and canvas look controls accepted secondary pointerdowns and cleared ownership on unrelated pointerup/cancel. | Track an independent pointer ID per control; match move/up/cancel/lost-capture events; release captures on reset. Reset movement, held actions and look on mode changes. FPS floating movement now also resets its existing gesture state. |
| P2 Cache | Preloading revalidated assets and SW forced another revalidation during module imports. | Generate SHA-256 resource hashes; reuse only verified matching cache entries. Refresh the manifest, verify changed bytes, reject mixed releases, retain offline manifest/asset fallback. Cache write failure does not prevent use of a verified online response. |
| P2 Account | Different import query strings instantiated multiple account modules in one frame. | Canonicalize account import URLs. |
| P2 Account | Cloud sync timers/pagehide were started only by FPS account UI initialization, which Ancient does not call. | Start cloud synchronization once after the page lease is granted, independently of FPS UI. Keep an in-memory sequence fallback if session storage cannot be written. |
| P2 Account | `saving` caused explicit saves/logout to skip an in-flight save. Old responses could change the upload marker after account switch. Pagehide used an independent unordered request. | Await/coalesce saves, capture account ownership, protect logout/login completion, and give regular/pagehide saves a shared monotonic sequence. |
| P2 Account | Server accepted stale snapshots in arrival order. | Persist the last sequence for the active session atomically with the snapshot; reject stale saves and recheck session ownership after asynchronous validation. New tabs recover the sequence from account profile; new sessions reset it. |

Graphics settings, model detail, skill effects, authored monster counts and gameplay features were not reduced. No production map state or other maps' cooldowns were cleared.

## Validation performed

`npm run check:audit` runs TypeScript checking and 14 regression scripts:

- Touch ownership with simultaneous move, aim, attack and jump; secondary up/cancel; floating/fixed mode switches and canvas look reset.
- Startup chooser mounts only the FPS host; prior frame removed before Ancient construction; entry remains independent of Tribe GPU work; cleanup/retry/cancellation preserved; byte-based progress remains real.
- Cache reuse, changed bytes at the same URL, coherent offline fallback and mixed-release rejection.
- Client save coalescing, account switching, pagehide ordering, stale retry and fresh-tab cursor recovery.
- Actual Worker/SQLite save reordering, replaced-session rejection and new-session sequence reset.
- Unit separation across thin monster-only walls; 250 authored monsters and 24 scripted monsters preserved; shipped arena's 18 targets, refill pedal and 3600-second respawn; existing navigation, community state and page lease checks.

The normal and Canva single HTML exports were rebuilt successfully. This verifies packaging, not browser behavior.

## Browser acceptance still required

`npm run check:audit:browser` contains desktop startup, desktop/mobile map entry and desktop/mobile/single-HTML UI regressions. It was attempted but stopped at `listen EPERM 127.0.0.1`. An independent headless Chrome launch was also denied. Browser automation additionally rejected a local `file://` test fixture because only HTTP/HTTPS URLs are allowed. No bypass was attempted.

Cold/hot cache startup, CPU throttling, real multi-touch capture, low-performance GPU behavior and single-HTML browser execution therefore remain unverified. There are no measured before/after latency numbers. `ancientEntryPerformance()` and performance measures provide the new instrumentation; results must be captured on the same device, cache state and viewport before comparing releases.

Structural comparison verified by regression: preselection frame mounts changed from FPS plus Ancient to FPS only; the same verified asset can satisfy repeated preload/import requests without a second network request. These are not device timing measurements.

Run after building with `npm run build:html`:

```sh
npm run check:audit
npm run check:audit:browser
```

Do not mark browser/device acceptance complete based solely on the non-browser suite.
