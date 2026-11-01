// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {combat,skills} from './ancient-test-modules.mjs';
import {newAncientProfile,blocked} from '../public/ancient-rules.js';
const p=newAncientProfile();p.level=30;p.profession='lightning';p.skills={haste:1,chain:1};
const actor=()=>({name:'test',x:0,y:1.7,z:50,hp:90000,weapon:p.weapons[0]});
const monsters=[{id:'along',kind:'grox',x:4,z:60,hp:1e8,maxHp:1e8},{id:'far',kind:'grox',x:9,z:60,hp:1e8,maxHp:1e8}],hits=[];
const c={map:'tribe',monsters,damage(m,n){hits.push(m.id);return n},fx(){}};
const a=actor();assert.equal(combat.castAncientSkill(a,p,'haste',[0,0,1],c,1000),null);assert.equal(a.z,65);assert.equal(a.x,0);assert.deepEqual(hits,['along']);assert.equal(combat.castAncientSkill(a,p,'haste',[0,0,1],c,1001),'技能冷却中');
const wall=actor();wall.x=32;combat.castAncientSkill(wall,p,'haste',[1,0,0],{...c,monsters:[]},1000);assert(wall.x<47);assert.equal(blocked(wall.x,wall.z,.6,'tribe',wall.y-1.7),false);
for(const [level,count]of [[1,3],[2,4],[5,7]]){p.skills.chain=level;const hit=[];const list=Array.from({length:9},(_,i)=>({id:String(i),kind:'grox',x:0,z:55+i*2,hp:1e8,maxHp:1e8}));assert.equal(combat.castAncientSkill(actor(),p,'chain',[0,-.17,Math.sqrt(1-.17**2)],{...c,monsters:list,damage(m,n){hit.push(m.id);return n}},1000),null);assert.equal(hit.length,count);assert.equal(new Set(hit).size,count)}
for(const [level,count]of [[1,1],[2,2]]){p.skills.chain=level;let hit=0;const list=[{id:'first',kind:'grox',x:0,z:55,hp:1e8,maxHp:1e8},{id:'second',kind:'grox',x:0,z:63.2,hp:1e8,maxHp:1e8}];combat.castAncientSkill(actor(),p,'chain',[0,-.17,Math.sqrt(1-.17**2)],{...c,monsters:list,damage(){hit++;return 1}},1000);assert.equal(hit,count,'Diameter increases by 1m, radius by 0.5m')}
p.skills.chain=0;p.materials['skill:chain']=0;
const key=skills.skillBook('chain');for(let n=0;n<5;n++){p.materials[key]=2**n;assert.equal(skills.trainSkill(p,'chain'),null);assert.equal(p.materials[key],0);assert.equal(p.skills.chain,n+1)}
console.log('PASS: 15m dash; 6m swept attack once per enemy; wall collision; cooldown; scaling chain counts; exponential book costs 1/2/4/8/16.');
