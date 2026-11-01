// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {MAIN_QUESTS,currentQuest,questText,questRewardInfo} from '../public/ancient-quests.js';
import {PROFESSIONS} from '../public/ancient-skills.js';
const node=()=>({children:[],style:{},append(n){this.children.push(n)},setAttribute(){},replaceChildren(){this.children=[]},focus(){this.focused=true}});
const document={body:node(),getElementById:()=>node(),createElement:tag=>Object.assign(node(),{tag})};
const source=fs.readFileSync('public/ancient-quest-ui.js','utf8').replace(/^import .*;\n/gm,'').replace('export function createAncientQuestUI','function createAncientQuestUI');
let q,english=false,opened;const p={level:10,skills:{},materials:{},potions:{},quest:{}};
const context=vm.createContext({document,MAIN_QUESTS,QUEST_NPCS:{},currentQuest:()=>q,questText,questRewardInfo:()=>undefined,PROFESSIONS,ANCIENT_POTIONS:{},createObjectActionFX:()=>({reset(){}})});vm.runInContext(source,context);
const ui=context.createAncientQuestUI({getProfile:()=>p,en:()=>english,openPanel:view=>opened=view,material:k=>k});
const buttons=n=>[...(n.tag==='button'?[n]:[]),...n.children.flatMap(buttons)];
for(english of [false,true])for(const kind of ['profession','trainQ','trainZ','trainC']){
 q={kind,title:['任务','Quest'],goal:['去技能页面','Open Skills']};const root=node();ui.renderSummary(root);const list=buttons(root);assert.equal(list.length,1);list[0].onclick();assert.equal(opened,'skills');
 // Exercise the actual accepted() closure, not a separate mock implementation.
 const functionCode=source.slice(source.indexOf('function accepted(){'),source.indexOf('function close(){'));
 const overlay=node(),guide=node();guide.tag='button';let ordinaryButtons=0;
 const nested=vm.createContext({dialogue:{title:['上一任务','Previous']},objectAction:null,pending:false,getProfile:()=>p,currentQuest:()=>q,overlay,el:(tag,text,parent)=>{const n=node();n.textContent=text;parent?.append(n);return n},L:(zh,en)=>english?en:zh,en:()=>english,questText,rewards(){},guidance:parent=>{parent.append(guide);return guide},btn(){ordinaryButtons++},close(){}});vm.runInContext(functionCode+';accepted()',nested);assert.equal(ordinaryButtons,0);assert(guide.focused);
}
console.log('PASS: profession and all three training steps expose only the Skills guide button, in both languages, in summary and post-dialogue panels.');
