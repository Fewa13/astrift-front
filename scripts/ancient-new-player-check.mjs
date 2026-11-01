// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {newAncientProfile,ANCIENT_POTIONS,xpNeeded} from '../public/ancient-rules.js';
import {MAIN_QUESTS,questRewardInfo,questReward} from '../public/ancient-quests.js';
const compiled=await build({entryPoints:['src/ancient-population.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {mobRespawnDelay,safeMobRespawn}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
assert.equal(mobRespawnDelay(1),6000);assert.equal(mobRespawnDelay(2),4000);assert.equal(mobRespawnDelay(3),4000);assert.equal(mobRespawnDelay(99999),4000);
assert(safeMobRespawn(0,50,[{x:0,z:55,hp:100}]));assert(safeMobRespawn(0,50,[{x:0,z:60,hp:100}]));assert(safeMobRespawn(0,50,[{x:0,z:50,hp:0}]));
for(const level of [1,15,35,80,130]){const p=newAncientProfile();p.level=level;const q=MAIN_QUESTS.find(q=>q.kind==='kill'&&(q.count||0)>=20);const r=questRewardInfo(p,q);assert(r.coins>=2&&r.coins<=100);for(const k of Object.keys(r.potions))assert(ANCIENT_POTIONS[k],k);const coins=p.coins;questReward(p,q);assert(p.coins>coins);assert(Object.values(p.potions).some(n=>n>0));}
const p=newAncientProfile();p.level=20;const patrol=MAIN_QUESTS.find(q=>q.patrol&&q.kind==='kill');assert.equal(questRewardInfo(p,patrol).xp,Math.floor(xpNeeded(20)*.03));
console.log('PASS: bounded multiplayer respawn delay, safe-distance respawns, valid supply rewards and unchanged patrol XP.');
