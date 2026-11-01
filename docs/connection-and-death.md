<!-- © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved. -->
# Ancient connection and death feedback

Connection feedback has its own persistent banner, independent of transient quest/reward messages. It shows connecting, stalled synchronization, retry countdown, browser-offline, expired-session and recovery states. Reconnect now retries immediately when a request is not already pending; browser-offline waits for connectivity. Movement/attacks remain gated on authoritative world state and movement acknowledgement health. Recovered world state resets prediction to the server position. Intentional exit clears retry timers and the banner.

Every existing normal-world damage path records an authoritative lethal source: monster melee, projectiles, bestiary attacks, boss casts, dungeon traps/collapse, and PvP including known skill IDs. Amounts and existing mitigation are unchanged. Later hits cannot overwrite a lethal source. Death details are persisted in `ancient_death_causes`, restored after reconnect, and removed after revival; the existing health-table schema is unchanged. Historic deaths without a source display an unavailable-source message.

Death shows the attacker/monster and level, attack and post-mitigation incoming damage. Existing dungeon spectating, respawn delay and return-to-camp controls remain. On entering death, a previously open pause/menu panel closes so it cannot obscure the result.

Checks: `ancient-connection-check`, `ancient-connection-health-check`, `ancient-connection-ui-check`, `ancient-death-cause-check`, `ancient-delayed-reconnect-check`, `ancient-regression-fixes-check`, and `ancient-boss-threat-server-check`. Browser QA uses the real client with local WebSocket fault fixtures; no test buttons are shipped.
