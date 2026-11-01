// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const compiled=await build({entryPoints:['src/ancient-wander.ts'],bundle:true,write:false,format:'esm'});
const {tickWander,wanderAllowed}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
let seed=13;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
for(const [region,z]of [[0,45],[0,170],[1,225],[1,470],[2,530]]){const m={x:0,z,homeX:0,homeZ:z,region,action:'idle',actionAt:0};let moved=false,rested=false;for(let i=0;i<3000;i++){tickWander(m,'tribe',i*200,.2,(x,z)=>Math.abs(x)>35||(x>4&&x<8),random);assert(wanderAllowed('tribe',region,m.x,m.z));assert(!(m.x>4&&m.x<8));moved||=Math.hypot(m.x,m.z-z)>1;rested||=m.action==='idle';}assert(moved);assert(rested);}
for(const map of ['forest','city']){const m={x:0,z:42,homeX:0,homeZ:42,region:0,action:'idle',actionAt:0};for(let i=0;i<2000;i++){tickWander(m,map,i*200,.2,()=>false,random);assert(Math.hypot(m.x,m.z-10)>=30);}}
const trapped={x:0,z:50,homeX:0,homeZ:50,region:0,action:'idle',actionAt:0};tickWander(trapped,'tribe',0,.2,()=>true,random);assert.equal(trapped.action,'idle');assert.equal(trapped.z,50);
console.log('PASS: randomized movement and rest, spawn exclusion, both Tribe gate buffers, region confinement, blocked route avoidance and bounded retries.');
