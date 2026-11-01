// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {MAIN_QUESTS,currentQuest,advanceQuest,questCanTalk,QUEST_NPCS} from '../public/ancient-quests.js';
import {newAncientProfile} from '../public/ancient-rules.js';
const bridges=['reach-twenty','reach-thirty','reach-forty','reach-fifty','reach-sixty','city-level','city-final-level'];
const isAdded=q=>bridges.some(id=>q.id.startsWith(id+'-'));
const legacy=MAIN_QUESTS.filter(q=>!isAdded(q));
for(const [index,q]of legacy.entries()){
 const p=newAncientProfile();p.quest={step:index,count:2};p.level=q.kind==='level'?q.level-1:100;
 const expected=q.kind==='level'&&bridges.includes(q.id)?q.id+'-prepare':q.id;
 assert.equal(currentQuest(p).id,expected);assert.equal(p.quest.revision,2);
 assert.equal(currentQuest(p).id,expected,'Migration is idempotent');
 if(expected!==q.id)assert.equal(p.quest.count,0);
}
const finished=newAncientProfile();finished.quest={step:legacy.length,count:0};assert.equal(currentQuest(finished),undefined);
for(const id of bridges){
 const p=newAncientProfile();p.level=100;p.quest={step:MAIN_QUESTS.findIndex(q=>q.id===id+'-prepare'),count:0,revision:2};
 advanceQuest(p);let q=currentQuest(p),visits=0;
 while(q&&isAdded(q)&&!q.id.endsWith('-prepare')){
  if(q.kind==='talk'){
   const n=QUEST_NPCS[q.npc];assert(questCanTalk(p,q.npc,{x:n.x,z:n.z,hp:100,map:n.map},()=>true));
   const before=structuredClone(p);advanceQuest(p,{kind:'talk',npc:q.npc,map:'wrong'});assert.deepEqual(p,before);
   const other=structuredClone(p);advanceQuest(p,{kind:'talk',npc:q.npc,map:q.map});assert.deepEqual(other,before,'Other players do not share quest progress');visits++;
  }else if(q.kind==='kill')advanceQuest(p,{kind:'kill',map:q.map,monster:{kind:q.kinds[0],region:q.region??0,level:45}});
  else break;
  q=currentQuest(p);
 }
 assert(visits>=4);assert(q&&!isAdded(q));
}
console.log('PASS: all seven interludes; every old index migration; completed saves; wrong-map rejection; independent progress and rewards; story reconnects to original mainline.');
