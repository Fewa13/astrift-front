// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {MAIN_QUESTS,currentQuest,questText,questRewardInfo} from '../public/ancient-quests.js';
import {newAncientProfile} from '../public/ancient-rules.js';
import {PROFESSIONS} from '../public/ancient-skills.js';
import {ANCIENT_POTIONS} from '../public/ancient-rules.js';
const node=()=>({children:[],append(n){this.children.push(n)},setAttribute(){},replaceChildren(){this.children=[]}});
const created=[];const document={body:node(),getElementById:()=>node(),createElement:()=>{const n=node();created.push(n);return n}};
const source=fs.readFileSync(new URL('../public/ancient-quest-ui.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace('export function createAncientQuestUI','function createAncientQuestUI');
const context=vm.createContext({document,MAIN_QUESTS,QUEST_NPCS:{},currentQuest,questText,PROFESSIONS,ANCIENT_POTIONS,questRewardInfo,formatAncientHints:t=>t,appendQuestLocation(){},createObjectActionFX:()=>({reset(){}})});
vm.runInContext(source,context);
const p=newAncientProfile();p.level=20;let english=false,map='tribe';
const ui=context.createAncientQuestUI({getProfile:()=>p,getMap:()=>map,en:()=>english,material:k=>k});
const text=n=>[n.textContent||'',...n.children.map(text)].join(' ');
for(const [id,expected]of [['tribe-outer-reach21-patrol-hunt',String(questRewardInfo(p,MAIN_QUESTS.find(q=>q.patrol)).xp.toLocaleString())],['tribe-outer-reach21-patrol-report',String(questRewardInfo(p,MAIN_QUESTS.find(q=>q.patrol)).xp.toLocaleString())],['tribe-outer-reach21-patrol-second',String(questRewardInfo(p,MAIN_QUESTS.find(q=>q.patrol)).xp.toLocaleString())],['tribe-outer-reach21-patrol-finish',String(questRewardInfo(p,MAIN_QUESTS.find(q=>q.patrol)).xp.toLocaleString())],['tribe-outer-reach21-patrol-brief',String(questRewardInfo(p,MAIN_QUESTS.find(q=>q.patrol)).xp.toLocaleString())],['tribe-outer-ready25','None']]){
 p.quest={revision:7,step:MAIN_QUESTS.findIndex(q=>q.id===id),count:0};
 for(english of [false,true]){const root=node();ui.renderSummary(root);const rendered=text(root);assert(rendered.includes(english?'Reward:':'任务奖励：'));assert(rendered.includes(expected==='None'?(english?'None':'无'):expected))}
}
console.log('PASS: real HUD renderer displays bilingual reward/None, with handover reward preview for both kill objectives.');

map='community:1';const hiddenSummary=node();ui.renderSummary(hiddenSummary);assert.equal(hiddenSummary.children.length,0);ui.update(500,true,false);assert(created.find(n=>n.id==='ancientQuestTracker').hidden);assert(created.find(n=>n.id==='ancientNpcInteract').hidden);console.log('PASS community maps hide the story HUD, story panel summary and NPC interaction hint.');
