// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import {build} from 'esbuild';import vm from 'node:vm';
const bundle=await build({entryPoints:['src/game-guide.ts','src/game-guide-data.ts'],outdir:'/tmp/guide-test',bundle:true,write:false,format:'cjs',platform:'node'});
function load(file){const module={exports:{}};vm.runInNewContext(bundle.outputFiles.find(f=>f.path.endsWith(file)).text,{module,exports:module.exports,crypto,Date,TextEncoder,TextDecoder,AbortSignal,fetch,console});return module.exports}
const {GameGuide}=load('game-guide.js'),{guideDocuments,findGuideDocs,GUIDE_CATEGORIES}=load('game-guide-data.js');
const db=new DatabaseSync(':memory:');const storage={sql:{exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows}}}};
const input={category:'skills',language:'zh',skillLevel:3,question:'连锁闪电'},env={GAME_GUIDE_FREE_ONLY:'true',GROQ_FREE_KEY:'test-groq',GEMINI_FREE_KEY:'test-gemini'},service=new GameGuide(storage,env);let calls=[];
const mock=async(url,options)=>{calls.push({url,options});if(url.includes('groq'))return new Response('quota',{status:429});return Response.json({candidates:[{content:{parts:[{text:'{"ids":["skill-chain"]}'}]}}]})};
const result=await service.handle('tester',input,mock);assert.equal(result.mode,'ai');assert.equal(result.docs[0].id,'skill-chain');assert.match(result.docs[0].text,/技能等级 3/);assert.equal(calls.length,2);assert(calls.every(c=>!c.options.body.includes('password')));
const cached=await service.handle('tester2',input,mock);assert.equal(cached.mode,'cached');assert.equal(calls.length,2);
assert.equal((await service.handle('tester',input,mock)).ok,false,'per-player spam blocked');
const off=new GameGuide(storage,{});assert.equal((await off.handle('offline',input,()=>{throw Error('must not fetch')})).mode,'source');
assert.equal((await service.handle('none',{...input,category:'invalid'},mock)).ok,false);
assert.equal((await service.handle('unknown',{...input,question:'quantum spaghetti 999xyz'},mock)).docs.length,0);
for(const [cat] of GUIDE_CATEGORIES){const docs=guideDocuments(cat);assert(docs.length,cat);assert.equal(new Set(docs.map(d=>d.id)).size,docs.length);}
assert.match(guideDocuments('shop').find(d=>d.id==='shop-limits').text,/8本/);assert.match(guideDocuments('jade').find(d=>d.id==='jade-fusion').text,/10件/);
assert.equal(findGuideDocs(guideDocuments('skills'),'升华')[0].id,'ascension');
// Model prose and invented IDs must never reach the player.
db.exec('DELETE FROM guide_usage; DELETE FROM guide_cooldown; DELETE FROM guide_cache');
const poison=await service.handle('poison',{...input,question:'连锁闪电 伤害'},async()=>Response.json({choices:[{message:{content:'{"ids":["fake-admin"],"answer":"999999999 damage"}'}}]}));assert.equal(poison.docs.length,0);assert(!JSON.stringify(poison).includes('999999999'));
// Persisted quota reservations survive a new helper instance and prevent paid fallback.
db.exec('DELETE FROM guide_usage; DELETE FROM guide_cooldown; DELETE FROM guide_cache');for(let i=0;i<100;i++)db.prepare('INSERT INTO guide_usage VALUES(?,?,?)').run('groq',Date.now()-120000,1);for(let i=0;i<10;i++)db.prepare('INSERT INTO guide_usage VALUES(?,?,?)').run('gemini',Date.now()-120000,1);
assert.equal((await new GameGuide(storage,env).handle('capped',input,()=>{throw Error('quota must stop fetch')})).mode,'source');
console.log('Game guide: live definitions, category isolation, skill levels, no-key fallback, failover, cache, spam, malformed/invented output, durable free quotas passed');
