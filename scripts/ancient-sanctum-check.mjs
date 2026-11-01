// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import * as S from '../public/ancient-sanctum.js';
import {newAncientProfile} from '../public/ancient-rules.js';
import {cityMap,cityWorldId} from '../public/ancient-city.js';
import {MAIN_QUESTS,advanceQuest,currentQuest,QUEST_NPCS} from '../public/ancient-quests.js';
import {useAncientSupply,buyAncientSupply} from '../public/ancient-commerce.js';
import {build} from 'esbuild'; const bossModule=await build({entryPoints:['src/ancient-boss.ts'],bundle:true,write:false,format:'esm'}); const {tickAncientBoss,bossAreaHit}=await import('data:text/javascript;base64,'+Buffer.from(bossModule.outputFiles[0].text).toString('base64'));
assert.equal(cityMap('sanctum'),'sanctum');assert.equal(cityWorldId('sanctum'),9);
for(let z=10;z<605;z+=.5)assert(!S.sanctumBlocked(4,z),'Center route accessible '+z);
assert(S.sanctumBlocked(12,205));assert(S.sanctumBlocked(25,45));assert(S.sanctumGateCrosses(0,408,0,412));assert(!S.sanctumGateCrosses(0,400,0,405));
assert.equal(S.sanctumSurface(0,555),12.45);
for(const n of Object.values(QUEST_NPCS).filter(n=>n.map==='sanctum'))assert(!S.sanctumBlocked(n.x,n.z,1),n.en);
const optics=S.newSanctumOptics();assert(!S.traceSanctumLight(optics).solved);assert(!S.rotateSanctumMirror(optics,'invalid'));
S.rotateSanctumMirror(optics,'mirror-a');for(let i=0;i<1;i++)S.rotateSanctumMirror(optics,'mirror-b');for(let i=0;i<2;i++)S.rotateSanctumMirror(optics,'mirror-c');assert(optics.opened);assert(S.traceSanctumLight(optics).solved);assert.equal(S.traceSanctumLight(optics).segments.length,4);assert(!S.rotateSanctumMirror(optics,'mirror-a'));
const p=newAncientProfile();p.level=150;p.quest={revision:7,step:MAIN_QUESTS.findIndex(q=>q.id==='sanctum-accord'),count:0};advanceQuest(p,{kind:'talk',map:'sanctum',npc:'seraph'});assert(p.purificationUnlocked);assert.equal(p.materials['supply:purity'],3);assert(!currentQuest(p));advanceQuest(p,{kind:'talk',map:'sanctum',npc:'seraph'});assert.equal(p.materials['supply:purity'],3);
assert(useAncientSupply(p,'purity'));assert.equal(p.materials['supply:purity'],3);p.corrupted=true;assert.equal(useAncientSupply(p,'purity'),null);assert(!p.corrupted);assert.equal(p.materials['supply:purity'],2);assert(buyAncientSupply(p,'purity',1));
const boss={id:'b',kind:'immaculate_judge',x:0,z:555,hp:100,maxHp:100,attackAt:0,action:'idle',actionAt:0};const seen=[];let hits=0;
for(let i=0;i<3;i++){const now=i*5000;tickAncientBoss(boss,{x:0,z:560},now,stage=>seen.push(stage),()=>hits++);assert.equal(hits,i);tickAncientBoss(boss,{x:0,z:560},now+1399,()=>{},()=>hits++);assert.equal(hits,i);tickAncientBoss(boss,{x:0,z:560},now+1400,()=>{},()=>hits++);assert.equal(hits,i+1)}
assert.deepEqual(seen,['warning','warning','warning']);assert(bossAreaHit({x:0,z:0,radius:16,angle:0,arc:Math.PI*.75},0,10));assert(!bossAreaHit({x:0,z:0,radius:16,angle:0,arc:Math.PI*.75},0,-10));
console.log('PASS: traversable ramps/bridge/dais, accessible NPCs, persistent optics shape, mirror solution/latched gate, idempotent story unlock, finite non-healing purification, three telegraphed boss attacks.');
