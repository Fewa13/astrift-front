// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs/promises';
const source=await fs.readFile('public/sw.js','utf8'),listeners={},requests=[];
const oldCSS=new Response('/* stale stylesheet without the feed */'),freshCSS=new Response(await fs.readFile('public/ancient.css','utf8'));
let online=true;const cache={match:async()=>oldCSS.clone(),put:async()=>{}};
vm.runInNewContext(source,{URL,console,self:{location:{origin:'https://test.example'},addEventListener:(event,fn)=>listeners[event]=fn},caches:{open:async()=>cache},fetch:async req=>{requests.push(req.url);if(!online)throw Error('offline');return freshCSS.clone()}});
async function request(path){let promise;listeners.fetch({request:new Request('https://test.example'+path),respondWith:p=>promise=p,waitUntil:()=>{}});return await (await promise).text()}
assert.match(await request('/ancient.css?v=old'),/\.ancientCombatFeed/);assert.equal(requests.length,1);online=false;assert.match(await request('/ancient.css?v=old'),/stale stylesheet/);
const html=await fs.readFile('public/ancient.html','utf8');assert(html.includes('/ancient.css?v=20261025-kill-feed-quest-location-1'));
console.log('PASS: ancient.css bypasses stale online cache, retains offline fallback, entry requests new CSS version.');
