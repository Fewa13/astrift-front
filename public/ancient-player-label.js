// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {PROFESSIONS} from './ancient-skills.js?v=20261021-skyreach-market-1';
import {holyName} from './ancient-ascension.js?v=20261014-new-professions-1';
export function ancientPlayerLabel(player,english=false){
 const job=PROFESSIONS[player.profession],profession=job?(english?job.en:job.name):(english?'Unassigned':'未选择职业');
 const level=Number.isFinite(player.level)?Math.max(1,Math.floor(player.level)):1;
 return `${player.name} · ${english?'Lv.':'等级 '}${level} · ${holyName(profession,english,!!player.holy)}${player.corrupted?(english?' · Corrupted':' · 魔化'):''}`;
}
