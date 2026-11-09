// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {PROFESSIONS} from './ancient-skills.js?v=20261021-skyreach-market-1';
import {holyName} from './ancient-ascension.js?v=20261014-new-professions-1';
const puzzleTitles=[
 ['解密之王','Puzzle King','#ffd36b'],
 ['解密大师','Puzzle Master','#d7e4ef'],
 ['解密高手','Puzzle Expert','#c49aff']
];
export const puzzleTitleName=(rank,english)=>puzzleTitles[rank-1]?.[english?1:0]||'';
export const puzzleTitleColor=title=>title?.worn&&title.expires>Date.now()?puzzleTitles[title.rank-1]?.[2]:undefined;
export function ancientPlayerLabel(player,english=false){
 const job=PROFESSIONS[player.profession],profession=job?(english?job.en:job.name):(english?'Unassigned':'未选择职业');
 const level=Number.isFinite(player.level)?Math.max(1,Math.floor(player.level)):1;
 const title=puzzleTitleColor(player.puzzleTitle)?puzzleTitleName(player.puzzleTitle.rank,english):'';
 return `${title?title+' · ':''}${player.name} · ${english?'Lv.':'等级 '}${level} · ${holyName(profession,english,!!player.holy)}${player.corrupted?(english?' · Corrupted':' · 魔化'):''}`;
}
