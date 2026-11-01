// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
let offset=0,ready=false;
export function syncCombatClock(serverTime,received=Date.now()){if(!Number.isFinite(serverTime))return;const sample=serverTime-received;offset=ready?offset+Math.max(-100,Math.min(100,sample-offset))*.2:sample;ready=true;}
export const combatNow=()=>Date.now()+offset;
