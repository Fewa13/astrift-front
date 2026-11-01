// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {createAncientRenderWarmup} from '../public/ancient-render-warmup.js';
const tasks=[],requests=[],events=[],scene={},camera={};let restore;
const renderer={domElement:{addEventListener(_,fn){restore=fn}},compileAsync(){return new Promise((resolve,reject)=>requests.push({resolve,reject}));}};
const warm=createAncientRenderWarmup(renderer,{schedule:fn=>tasks.push(fn),mark:s=>events.push(s),warn:()=>{}}),settle=async()=>{for(let i=0;i<8;i++)await Promise.resolve()};
assert(!warm.ready(scene,camera,'tribe:lobby'));assert.equal(requests.length,0,'Initial GPU setup yields to menu input');
for(let i=0;i<100;i++)assert(!warm.ready(scene,camera,'tribe:lobby'));assert.equal(tasks.length,1,'No compile every animation frame');tasks.shift()();await settle();assert.equal(requests.length,1);assert(!warm.ready(scene,camera,'tribe:lobby'),'No first render while compilation is pending');requests[0].resolve();await settle();assert(warm.ready(scene,camera,'tribe:lobby'));
assert(!warm.ready(scene,camera,'tribe:play'));tasks.shift()();await settle();assert(!warm.ready(scene,camera,'forest:play'));tasks.shift()();await settle();requests[1].resolve();await settle();assert(!warm.ready(scene,camera,'forest:play'),'Old map completion cannot unlock the new map');requests[2].resolve();await settle();assert(warm.ready(scene,camera,'forest:play'));
restore();assert(!warm.ready(scene,camera,'forest:play'));tasks.shift()();await settle();requests[3].reject(Error('GPU unavailable'));await settle();assert(warm.ready(scene,camera,'forest:play'),'Preparation failure does not leave a permanent black screen');
assert(events.length>=6);console.log('PASS deferred single-flight GPU warmup, gated first draw, map changes, context restore and failure recovery.');
