// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync('public/ancient.html','utf8'),source=fs.readFileSync('public/sw.js','utf8'),listeners={},saved=new Set();let active=0,peak=0,activated=false,waiting;
assert(!html.includes('controllerchange'),'Worker replacement must not reload an active Ancient world');assert(!html.includes('location.reload()'));
const self={location:{origin:'https://play.astrift.com'},addEventListener:(k,fn)=>listeners[k]=fn,skipWaiting:async()=>{activated=true}};
const cache={put:async(path,response)=>{assert(response.ok);saved.add(path)}};
const context=vm.createContext({self,caches:{open:async()=>cache},Request:class{constructor(path,options){this.path=path;assert.equal(options.priority,'low')}},fetch:async req=>{active++;peak=Math.max(peak,active);await new Promise(r=>setTimeout(r,1));active--;return {ok:true}},URL,Promise,Array,Error,console});vm.runInContext(source,context);
listeners.install({waitUntil:p=>waiting=p});await waiting;const expected=vm.runInContext('ASSETS.length',context);assert.equal(saved.size,expected);assert(peak<=3);assert(activated);console.log('PASS no automatic reload, full offline cache retained, low-priority download concurrency capped at',peak,'for',expected,'assets.');
