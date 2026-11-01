<!-- © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved. -->
# Ancient rough-stone economy

New ground rough stones are minted directly into the existing per-account stonework store, with unique IDs and fixed interiors; no new rough-material stacks. Legacy material stacks remain available rather than being deleted. Ground stones are small and mostly barren. Existing stones and collections are not rerolled.

Shop stock is per-account and persisted: nine slots in price bands 2×100–299, 2×301–999, 3×1001–9999, 2×10000–50000. Higher prices increase size and jade probability, not guaranteed resale profit. Refresh and local light probing are free. Purchase replaces only its slot, preserves the purchased interior, and records an idempotent receipt. Raw public views never include grade, full interior, or appraisal.

Uncut system sales are rejected server-side. Unopened rough can be discarded or placed in market escrow at a user-entered price; it has no reference price or two-thirds appraisal floor. Open-window stones cannot enter raw escrow. Seller payment, buyer debit, stone transfer and receipt use the same SQLite transaction. Market preview/probe never sends the escrowed private stone fields. Other market items retain the existing minimum-price rules.

Regression checks: `ancient-rough-economy-check.mjs`, `ancient-rough-browser-check.mjs`, `ancient-market-check.mjs`, `ancient-market-browser-check.mjs`, `ancient-jade-check.mjs`, `ancient-jade-product-pricing-check.mjs`, `ancient-jade-craft-storage-check.mjs` in `scripts/`.

Normal deployment rebuilds standalone dual-world HTML and Surge output. Publish Surge separately; Codeberg's root `index.html` must be replaced with the generated dual-world file when direct repository publishing is unavailable.
