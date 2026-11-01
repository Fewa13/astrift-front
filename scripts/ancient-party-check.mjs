// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
import {build} from 'esbuild';
const db=new DatabaseSync(':memory:'),sql={exec(query,...args){const rows=db.prepare(query).all(...args);return {toArray:()=>rows}}};
const compiled=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']});
let now=100000;const messages=new Map(),actors=new Map(),sockets=[];
const ctx={storage:{sql,setAlarm:async()=>{}},getWebSockets:()=>sockets},module={exports:{}};
vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,Date:{now:()=>now},crypto,Math,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
const Server=module.exports.AncientWorld,server=new Server(ctx,{});
for(const name of ['a','b','c','d']){const p=server.read(name),actor={name,map:name==='c'?'forest':'tribe',x:0,y:1.7,z:50,hp:100,maxHp:100,seen:now,weapon:p.weapons[0],lastShot:0,deadAt:0};actors.set(name,actor);messages.set(name,[]);sockets.push({deserializeAttachment:()=>structuredClone(actors.get(name)),serializeAttachment:a=>actors.set(name,structuredClone(a)),send:s=>messages.get(name).push(JSON.parse(s)),close(){}})}
async function command(name,action,data={}){const r=await server.command(name,action,data);return r}
assert.equal((await command('a','partyInvite',{target:'c'})).ok,false,'Cross-map invites rejected');
assert.equal((await command('a','partyInvite',{target:'b'})).ok,true);const id=server.parties().get('a').id;
assert.equal((await command('c','partyAccept',{party:id})).ok,false,'Cannot accept another player invitation');
assert.equal((await command('b','partyAccept',{party:id})).ok,true);
assert.equal((await command('a','partyInvite',{target:'d'})).ok,true);assert.equal((await command('d','partyIgnore',{party:id})).ok,true);assert.equal((await command('b','partyInvite',{target:'d'})).ok,true);assert.equal(server.parties().state('d').invites.length,0,'Mute covers every inviter in this party');assert.equal(new Server(ctx,{}).parties().state('d').invites.length,0);now+=300001;for(const a of actors.values())a.seen=now;assert.equal((await command('a','partyInvite',{target:'d'})).ok,true);assert.equal(server.parties().state('d').invites.length,1,'Mute expires after five minutes');await command('d','partyDecline',{party:id});
assert.equal((await command('b','partyInvite',{target:'d'})).ok,true,'Members can invite');
assert.equal((await command('d','partyAccept',{party:id})).ok,true);
assert.equal((await command('b','partyKick',{target:'d'})).ok,false,'Members cannot kick');
assert.equal((await command('a','partyBlock',{target:'d'})).ok,true);
assert.equal((await command('b','partyInvite',{target:'d'})).ok,false,'Member cannot bypass leader blocklist');
assert.equal((await command('d','partyAccept',{party:id})).ok,false,'Blocked invite invalidated');
assert.equal((await command('a','partyUnblock',{target:'d'})).ok,true);
assert.equal((await command('b','partyInvite',{target:'d'})).ok,true);
assert.equal((await command('a','partyKick',{target:'b'})).ok,true);
assert.equal((await command('d','partyAccept',{party:id})).ok,false,'Kicked sender cannot leave valid invites');
assert.equal((await command('a','partyInvite',{target:'b'})).ok,true);assert.equal((await command('b','partyAccept',{party:id})).ok,true);
const restored=new Server(ctx,{});assert.equal(restored.parties().get('b').id,id,'Persistent after DO reconstruction');
actors.get('b').map='forest';const killer=actors.get('a'),monster={id:'loot',kind:'grox',level:1,hp:1,maxHp:100,x:0,z:55,region:0,homeX:0,homeZ:55,action:'idle',attackAt:0,respawnAt:0,target:''};
server.damageMonster(sockets[0],killer,monster,1);assert.equal(server.read('a').xp,40,'Killer gets full reward');assert.equal(server.read('b').xp,0,'Other map receives nothing');assert.equal(server.read('c').xp,0,'Non-member receives nothing');assert.equal(messages.get('b').filter(m=>m.type==='partyReward').length,0);
server.damageMonster(sockets[0],killer,monster,1);assert.equal(server.read('b').xp,0,'Dead target cannot pay twice');actors.get('b').map='tribe';monster.hp=1;server.damageMonster(sockets[0],killer,monster,1);assert.equal(server.read('b').xp,0,'Same-map non-participant receives no XP');
actors.get('b').seen=now-16000;db.prepare('DELETE FROM ancient_party_presence WHERE name=?').run('b');monster.hp=1;server.damageMonster(sockets[0],killer,monster,1);assert.equal(server.read('b').xp,0,'Offline receives nothing');assert.equal(server.parties().get('b').id,id,'Offline remains a member');
await command('b','partyState');monster.hp=1;server.damageMonster(sockets[0],killer,monster,1);assert.equal(server.read('b').xp,0,'Lobby does not qualify');actors.get('b').seen=now;monster.hp=1;server.damageMonster(sockets[0],killer,monster,1);assert.equal(server.read('b').xp,0,'Same-map non-participant still receives no XP');
assert.equal((await command('a','partyLeave')).ok,true);assert.equal(server.parties().get('b').leader,'b','Leader transferred');assert.equal((await command('b','partyLeave')).ok,true);assert.equal(server.parties().get('b'),undefined,'Last member leaves cleanly');
const bundle=await build({entryPoints:['src/ancient-party.ts'],bundle:true,write:false,format:'esm',platform:'node'}),party=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const p={coins:0,materials:{},gear:[]};let xp=0,coins=0;for(let i=0;i<10;i++){const r=party.ancientPartyShare(p,7,.06,{core:1},[{id:'original',key:'stoneRough'}],()=>i===0?0:1);xp+=r.xp;coins+=r.coins}assert.equal(xp,0);assert.equal(p.coins,.06);assert.equal(p.materials.core,1);assert.equal(p.gear.length,1);assert.notEqual(p.gear[0].id,'original');
db.close();console.log('PASS: real SQLite persistence; same-map consent; member invites; leader-only kick/block; blocked/past invites rejected; leader handover; no XP for same-map non-participants / cross-map exclusion; full killer reward; offline exclusion; lobby exclusion / five-minute party-wide invitation mute; no double payout; fractional coins/material accumulation; unique gear IDs.');
