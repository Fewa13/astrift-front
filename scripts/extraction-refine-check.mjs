// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {buildExtractionWorld,EXTRACTION_HOUSES,EXTRACTION_GUARDS,EXTRACTION_LOOT_POINTS,EXTRACTION_SPAWN} from '../public/extraction-world.js';
import {DISTRICTS,EXIT_SPECS,districtAt,containerSpec,rollContainer,extractionGun,sortRaidBag} from '../public/extraction-design.js';
import {createRaidPresentation} from '../public/extraction-presentation.js';
import {batchStaticScene} from '../public/render-performance.js';
import {createObjectiveNavigator} from '../public/objective-world.js';
import {GUN_PRICES} from '../public/extraction-economy.js';
const w=buildExtractionWorld(THREE);w.group.updateMatrixWorld(true);
const bounds=w.colliders.map(o=>o.userData.bounds).filter(b=>b&&b.minY<1.9),blocked=(x,z)=>bounds.some(b=>x>b.minX-.45&&x<b.maxX+.45&&z>b.minZ-.45&&z<b.maxZ+.45);
assert.equal(DISTRICTS.length,4);assert.equal(EXIT_SPECS.length,2);assert.notEqual(districtAt(-100,100).id,districtAt(100,-100).id);
assert(!blocked(...EXTRACTION_SPAWN));for(const [x,z] of EXTRACTION_GUARDS){assert(!blocked(x,z),'AI spawn in solid '+[x,z]);assert(Math.hypot(x-EXTRACTION_SPAWN[0],z-EXTRACTION_SPAWN[1])>50)}
for(const h of EXTRACTION_HOUSES){assert(!blocked(h.x,h.z+h.d/2),'front door blocked');assert(!blocked(h.x,h.z-h.d/2),'back door blocked')}
const nav=createObjectiveNavigator(blocked,true,172);
// Follow the same navigation directions used by actual AI, with collision checks.
for(const [index,[x,z]]of EXTRACTION_LOOT_POINTS.entries()){
 const from=[...EXTRACTION_SPAWN.slice(0,1),0,EXTRACTION_SPAWN[1]],to=[x,0,z];let now=1000,reached=false;
 for(let i=0;i<3500;i++){const [dx,dz]=nav.direction('qa'+index,from,to,now);now+=50;if(Math.hypot(from[0]-x,from[2]-z)<1.9){reached=true;break}if(!blocked(from[0]+dx*.38,from[2]))from[0]+=dx*.38;if(!blocked(from[0],from[2]+dz*.38))from[2]+=dz*.38}
 assert(reached,'Unreachable loot '+index+' '+[x,z]);
 const spec=containerSpec(index,x,z),a=rollContainer('raid-a',index,spec),b=rollContainer('raid-a',index,spec);assert.deepEqual(a,b);assert(a.length>=2&&a.length<=4);
}
for(const e of EXIT_SPECS)assert(!blocked(e.x,e.z),'exit blocked');
for(const gun of Object.keys(GUN_PRICES))for(let i=0;i<12;i++)assert(GUN_PRICES[extractionGun(gun,i)]>0);
const sorted=sortRaidBag([{kind:'valuable',type:'core'},{kind:'ammo',weapon:'redline',quantity:20},{kind:'medical',type:'bandage'}]);assert.equal(sorted[0].kind,'medical');
const p=createRaidPresentation(THREE),types=['case','medical','tools','safe','death','ground'];for(const type of types){const a=p.container(type),b=p.container(type);assert.equal(a.children.find(m=>m.isMesh).geometry,b.children.find(m=>m.isMesh).geometry,'reuse GPU geometry');if(type!=='ground'){assert(a.userData.lid!==b.userData.lid);p.update([{mesh:a,searched:true}],.1);assert(a.userData.lid.rotation.x<0);assert.equal(b.userData.lid.rotation.x,0)}}
const before=w.group.children.length,batch=batchStaticScene(THREE,w.group);assert(batch.after<10);assert(w.group.children.length<before/10,'static detail batched');
const source=fs.readFileSync('public/game.js','utf8');assert(source.includes("roomMode!=='extraction'&&awareness?.visible&&(!wasVisible"));assert(source.includes("roomMode!=='extraction'&&awareness?.visible&&!flankGoal"));assert(source.includes("if(roomMode==='extraction')return false;"));
console.log('PASS: four districts, two open doorways per building, safe spawns, all '+EXTRACTION_LOOT_POINTS.length+' loot points reachable with real AI navigation, deterministic loot, weapon diversity, shared GPU geometry, independent opening animation, static scene batching, extraction-only movement changes. Map draws:',w.group.children.length);
