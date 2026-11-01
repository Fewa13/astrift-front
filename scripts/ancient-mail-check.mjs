// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import vm from 'node:vm';import {build} from 'esbuild';
const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows}}};
const ctx={storage:{sql,setAlarm:async()=>{},transactionSync(fn){db.exec('BEGIN');try{const r=fn();db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}}},getWebSockets:()=>[]};
const built=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']}),module={exports:{}};
vm.runInNewContext(built.outputFiles[0].text,{module,exports:module.exports,Date,crypto,Math,structuredClone,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
let server=new module.exports.AncientWorld(ctx,{});
for(const [job,skills]of Object.entries({warrior:['vitality','power'],summoner:['summon','weaken'],ice:['icebolt','icearmor'],lightning:['chain','storm'],curse:['hex','doom'],swordsman:['triplecut','swordrain'],shadowblade:['shadowstep','nightfall'],stonewright:['faultline','mountainfall']})){
 const p=server.read(job);p.profession=job;server.save(job,p);const before=structuredClone(server.read(job).materials),mail=await server.command(job,'mailList',{}),id=mail.mailState.messages[0].id;assert(!mail.mailState.messages[0].claimedAt);assert(mail.mailState.choices.some(c=>c.id===skills[0]));
 for(const selection of [[],[{id:skills[0],quantity:3}],[{id:skills[0],quantity:5}],[{id:skills[0],quantity:2.5}],[{id:'invalid',quantity:4}],[{id:skills[0],quantity:2},{id:skills[0],quantity:2}]]){
  assert.equal((await server.command(job,'mailClaim',{id,selection})).ok,false);assert.equal(JSON.stringify(server.read(job).materials),JSON.stringify(before));
 }
 assert.equal((await server.command(job,'mailClaim',{id:'forged-mail',selection:[{id:skills[0],quantity:4}]})).ok,false);
 const result=await server.command(job,'mailClaim',{id,selection:[{id:skills[0],quantity:1},{id:skills[1],quantity:3}]});assert(result.ok);assert(result.mailState.messages[0].claimedAt>0);assert.equal(result.profile.materials['skillbook:'+skills[0]],(before['skillbook:'+skills[0]]||0)+1);assert.equal(result.profile.materials['skillbook:'+skills[1]],(before['skillbook:'+skills[1]]||0)+3);
 server=new module.exports.AncientWorld(ctx,{});assert.equal((await server.command(job,'mailClaim',{id,selection:[{id:skills[0],quantity:4}]})).ok,false);assert((await server.command(job,'mailList',{})).mailState.messages[0].claimedAt>0);
}
assert.equal((await server.command('new','mailClaim',{id:'ancient-xp-compensation-20261015',selection:[{id:'chain',quantity:4}]})).ok,false);
const p=server.read('rollback');p.profession='lightning';server.save('rollback',p);const oldSave=server.save.bind(server);server.save=(...args)=>{oldSave(...args);throw Error('test failure')};await assert.rejects(server.command('rollback','mailClaim',{id:'ancient-xp-compensation-20261015',selection:[{id:'chain',quantity:4}]}));server.save=oldSave;
assert.equal(server.read('rollback').materials['skillbook:chain']||0,0);assert.equal((await server.command('rollback','mailList',{})).mailState.messages[0].claimedAt,0);
console.log('PASS: all professions, mandatory exactly 4 choices, mixed books, invalid/cross-profession/replay rejection, persisted receipts, atomic rollback.');db.close();
