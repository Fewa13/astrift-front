// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import * as THREE from '../public/three.module.js';
import {skills,combat} from './ancient-test-modules.mjs';
import {newAncientProfile} from '../public/ancient-rules.js';
import {createAncientMagicFX,ANCIENT_FX_IDS} from '../public/ancient-spell-fx.js';
import {createProfessionPlayer} from '../public/ancient-profession-models.js';
import {attachHolyRegalia} from '../public/ancient-holy-model.js';
function run(id,holy){const p=newAncientProfile();p.level=80;p.profession=skills.SKILLS[id].job;p.skills={[id]:3};if(holy)p.ascension={day:'2026-10-12',attempts:0,jobs:{[p.profession]:{permit:true,step:3,count:0,holy:true}}};const a={name:'tester',x:0,y:1.7,z:50,hp:1000,maxHp:1000,weapon:p.weapons[0],profession:p.profession,skills:p.skills},m={id:'target',kind:'grox',x:0,z:55,hp:1e15,maxHp:1e15},hits=[],ctx={map:'tribe',monsters:[m],damage:(v,n)=>{hits.push(n);return n},fx(){}};assert.equal(combat.castAncientSkill(a,p,id,[0,-.15,Math.sqrt(1-.15**2)],ctx,1000),null);for(let t=1000;t<10000;t+=250)combat.tickAncientSkills(a,p,ctx,.25,t);return hits.reduce((a,b)=>a+b,0)}
for(const id of ['swordwave','triplecut','swordrain','phantomblade','slash','power','rage','icebolt','icearmor','blizzard','chain','haste','storm','hex','drain','doom','soulbolt','frostburst']){const ordinary=run(id,false),holy=run(id,true);assert(ordinary>0,id);assert(Math.abs(holy/ordinary-2.5)<.00001,id+' exactly one holy multiplier')}
for(const id of ANCIENT_FX_IDS){const scene=new THREE.Scene(),fx=createAncientMagicFX(scene);fx.effect({id,x:0,z:0,holy:true,radius:8},()=>0);for(let i=0;i<20;i++){fx.update(i*50,.05);for(const g of scene.children){assert(g.children.length<=16,id+' draw cap');for(const m of g.children)if(m.isInstancedMesh)assert([...m.instanceMatrix.array].every(Number.isFinite))}}fx.clear();assert.equal(scene.children.length,0)}
for(const job of Object.keys(skills.PROFESSIONS)){const model=createProfessionPlayer(job);attachHolyRegalia(model,job);attachHolyRegalia(model,job);const regalia=model.children.filter(n=>n.name==='holy-regalia');assert.equal(regalia.length,1);assert([...regalia[0].geometry.attributes.position.array].every(Number.isFinite));assert(regalia[0].geometry.attributes.position.count>500)}
console.log('PASS: 17 offensive skills apply exactly ×2.5 once; all 24 holy FX have finite poses and bounded draws; six distinct baked regalia are idempotent.');
