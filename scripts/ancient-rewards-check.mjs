// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {transform} from 'esbuild';
import * as rules from '../public/ancient-rules.js';
import * as gear from '../public/ancient-gear.js';
import * as forest from '../public/ancient-forest.js';
import * as commerce from '../public/ancient-commerce.js';
import {skills,combat,quests} from './ancient-test-modules.mjs';
const now=Date.now(),messages=[],ctx={storage:{sql:{exec:()=>({toArray:()=>[]})}}};
const module={exports:{}},compiled=await transform(fs.readFileSync('src/ancient-world.ts','utf8'),{loader:'ts',format:'cjs'});
vm.runInNewContext(compiled.code,{module,exports:module.exports,crypto,Date:{now:()=>now},require:n=>n==='cloudflare:workers'?{DurableObject:class{constructor(ctx){this.ctx=ctx}}}:n.includes('ancient-commerce')?commerce:n.includes('ancient-gear')?gear:n.includes('ancient-quests')?quests:n.includes('ancient-skill-combat')?combat:n.includes('ancient-skills')?skills:n.includes('ancient-forest')?forest:rules});
const server=new module.exports.AncientWorld(ctx,{}),ws={send:s=>messages.push(JSON.parse(s))};let stored;
server.read=()=>structuredClone(stored);server.save=(_,p)=>stored=structuredClone(p);
const cases=[['grox',1,10],['hunter',6,120],['chief',20,30000],['lord',30,100000],...Object.entries(forest.FOREST_KINDS).map(([kind,d])=>[kind,d.boss?65:35,d.xp*(d.boss?65:35)])];
for(const [level,xp]of [[1,40],[5,200],[10,600],[15,1000],[20,1600],[25,2500],[30,6000],[40,9411],[50,13157]])assert.equal(rules.ancientMonsterXP('grox',level),xp);
assert.equal(rules.ancientMonsterXP('lord',30),30000);assert.equal(rules.ancientMonsterXP('crystal_fire',70),800000);
for(let level=2;level<=100;level++){assert(rules.ancientMonsterXP('grox',level)>rules.ancientMonsterXP('grox',level-1));assert(rules.ancientMonsterXP('lord',level)>rules.ancientMonsterXP('lord',level-1));assert(rules.ancientMonsterXP('lord',level)>=rules.ancientMonsterXP('grox',level)*1.79)}
for(const boosted of [false,true])for(const [kind,level,baseXp]of cases){
 stored=rules.newAncientProfile();stored.coins=7.25;stored.quest={step:quests.MAIN_QUESTS.length,count:0};if(boosted)stored.boosts={experience:now+60000};
 const xp=rules.ancientMonsterXP(kind,level),expected=structuredClone(stored);rules.gainXP(expected,xp);
 const actor={name:'tester',map:forest.FOREST_KINDS[kind]?'forest':'tribe',hp:100,maxHp:100},monster={id:kind,kind,level,hp:1,maxHp:1,x:0,z:50},before=messages.length;
 assert.equal(server.damageMonster(ws,actor,monster,10,'body',boosted?'@pet:tester':'tester'),1);
 const kill=messages.slice(before).find(m=>m.type==='kill');assert(kill);
 const coins=Math.round(.3*(xp/40)**.8*100)/100;
 assert.equal(kill.xp,xp*(boosted?2:1),kind+' XP');assert.equal(kill.coins,coins,kind+' coins');
 assert.equal(stored.coins,Math.round(725+coins*100)/100);assert.equal(stored.level,expected.level);assert.equal(stored.xp,expected.xp);
 const balance=stored.coins,length=messages.length;assert.equal(server.damageMonster(ws,actor,monster,10),0);assert.equal(messages.length,length);assert.equal(stored.coins,balance);
}
assert.equal(rules.ancientCoinReward(40),.3);assert.equal(rules.ancientCoinReward(200),1.09);
for(const xp of [0,-1,NaN,Infinity])assert.equal(rules.ancientCoinReward(xp),0);
let balance=0;for(let i=0;i<1000;i++)balance=rules.ancientAddCoins(balance,40);assert.equal(balance,300);
console.log('PASS: XP curve; all 13 monsters; coins = 0.3 × (base XP / 40)^0.8; cent rounding without drift; potion-independent coins; summon rewards; stored/displayed agreement; no duplicate rewards');
