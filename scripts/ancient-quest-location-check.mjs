// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {MAIN_QUESTS} from '../public/ancient-quests.js';
import {QUEST_MAP_NAMES,questLocationText,appendQuestLocation} from '../public/ancient-quest-location.js';
let checked=0;
for(const q of MAIN_QUESTS){if(q.map){assert(QUEST_MAP_NAMES[q.map],q.id+': unknown map');assert.equal(questLocationText(q,q.map),'');for(const map of [...Object.keys(QUEST_MAP_NAMES),'dungeon:test'])if(map!==q.map){assert.equal(questLocationText(q,map),'任务地图：'+QUEST_MAP_NAMES[q.map][0]);assert.equal(questLocationText(q,map,true),'Quest location: '+QUEST_MAP_NAMES[q.map][1]);checked++}}else assert.equal(questLocationText(q,'tribe'),'');}
assert.equal(questLocationText(null,'forest'),'');
const parent={children:[],append(node){this.children.push(node)}};globalThis.document={createElement:()=>({})};appendQuestLocation(parent,{map:'forest'},'tribe');assert.equal(parent.children[0].textContent,'任务地图：森林');appendQuestLocation(parent,{map:'forest'},'forest');assert.equal(parent.children.length,1);
const ui=await fs.readFile('public/ancient-quest-ui.js','utf8');assert(ui.includes('p.level,p.profession,map,en()].join()'));assert(ui.includes('appendQuestLocation(box,q,getMap(),en())'));
console.log(`PASS: ${checked} off-map quest cases, both languages, same-map suppression, unrestricted tasks, dungeon labels and map-change refresh.`);
