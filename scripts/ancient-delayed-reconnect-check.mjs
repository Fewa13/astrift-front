// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
import {build} from 'esbuild';
const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows}}};
const output=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']}),module={exports:{}},sockets=[];
function socket(actor){let state=actor;return {readyState:1,messages:[],deserializeAttachment:()=>structuredClone(state),serializeAttachment:a=>state=structuredClone(a),send(s){this.messages.push(JSON.parse(s))},close(){this.readyState=2}}}
const ctx={storage:{sql,setAlarm:async()=>{},transactionSync:f=>f()},getWebSockets:()=>sockets,acceptWebSocket:ws=>sockets.push(ws)};
vm.runInNewContext(output.outputFiles[0].text,{module,exports:module.exports,Date,crypto,Math,URL,structuredClone,AbortController,WebSocketPair:class{constructor(){return {0:socket(null),1:socket(null)}}},Response:class{constructor(body,options){Object.assign(this,options)}},require:()=>({DurableObject:class{constructor(ctx,env){this.ctx=ctx;this.env=env}}})});
const server=new module.exports.AncientWorld(ctx,{ACCOUNT_SESSIONS:{getByName:()=>({banState:async()=>null})}});
for(const name of ['caster','friend']){const p=server.read(name);p.level=80;p.profession='swordsman';p.skills={swordrain:3,phantomblade:3};server.save(name,p);sockets.push(socket({name,map:'tribe',tribeLayout:2,x:0,z:50,y:1.7,yaw:0,hp:100000,maxHp:100000,seen:Date.now(),weapon:p.weapons[0],lastShot:0,reloadAt:0,ammo:10,deadAt:0}));}
const stale=socket({...sockets[0].deserializeAttachment(),hp:0,seen:Date.now()-5000});sockets.unshift(stale);const live=sockets[1],friend=sockets[2];
assert(!server.connections().includes(stale));const previous=stale.deserializeAttachment().seen;await server.webSocketMessage(stale,JSON.stringify({type:'heartbeat'}));assert.equal(stale.deserializeAttachment().seen,previous,'superseded connection cannot regain authority');
for(const id of ['swordrain','phantomblade']){
 for(const peer of [live,friend]){const a=peer.deserializeAttachment();delete a.skillRuntime;peer.serializeAttachment(a);peer.messages=[];}
 const w=server.world('tribe');for(const m of w.monsters)m.hp=0;const target=w.monsters[0];Object.assign(target,{kind:'grox',level:150,x:0,z:55,hp:19129500,maxHp:19129500});server.persist(w);
 for(const peer of [live,friend])await server.webSocketMessage(peer,JSON.stringify({type:'skill',id,direction:[0,-.15,Math.sqrt(1-.15**2)]}));
 const saved=server.world('tribe'),locked=saved.monsters.find(m=>m.id===target.id),count=id==='swordrain'?6:1;
 assert.equal(locked.strikes.length,count*2);for(const strike of locked.strikes)strike.at=Date.now()-9000;server.persist(saved);
 await server.tickMap('tribe');
 for(const peer of [live,friend])assert.equal(peer.messages.filter(m=>m.type==='hit'&&m.id===target.id).length,count,'every delayed hit survives the stall for each player');
 await server.tickMap('tribe');for(const peer of [live,friend])assert.equal(peer.messages.filter(m=>m.type==='hit'&&m.id===target.id).length,count,'no duplicate damage on next tick');
 assert.equal(server.world('tribe').monsters.find(m=>m.id===target.id).strikes.length,0);
}
const profile=server.read('caster');
profile.profession='summoner';
profile.ascension={jobs:{summoner:{holy:true}},attempts:0,day:''};
profile.advancements={summoner:{route:'spiritcaller',skills:{X:{level:8,points:0},Q:{level:8,points:0},Z:{level:8,points:0},C:{level:8,points:0}}}};
server.save('caster',profile);
const detached=socket(null);
const otherMap=socket({...friend.deserializeAttachment(),name:'forest-observer',map:'forest'});
sockets.push(detached,otherMap);
await server.webSocketMessage(live,JSON.stringify({type:'skill',id:'advanced:X'}));
const guardianFx=peer=>peer.messages.findLast(message=>message.type==='skillFx'&&message.id==='spiritcaller-guardian');
assert(guardianFx(live),'caster receives the guardian visual');
assert.deepEqual(guardianFx(friend),guardianFx(live),'same-map peer receives identical visual data');
assert.equal(guardianFx(detached),undefined,'detached socket cannot receive map visuals');
assert.equal(guardianFx(otherMap),undefined,'other maps cannot receive tribe visuals');
assert.equal(guardianFx(stale),undefined,'superseded socket cannot receive tribe visuals');
sockets.splice(-2);
const preReconnect=live.deserializeAttachment().skillRuntime;
assert(preReconnect?.summon?.hp>0,'guardian spawned on the authoritative socket');
// Real connection replacement must null the old attachment before asynchronous close.
const result=await server.command('caster','ticket',{map:'tribe'});const response=await server.fetch(new Request('https://play.astrift.com/api/ancient/connect?map=tribe&ticket='+result.ticket,{headers:{Upgrade:'websocket'}}));
assert.equal(response.status,101);assert.equal(live.deserializeAttachment(),null);assert.equal(stale.deserializeAttachment(),null);
assert.equal(server.connections().filter(ws=>ws.deserializeAttachment().name==='caster').length,1);
const authoritative=server.connections().find(ws=>ws.deserializeAttachment().name==='caster');const hp=authoritative.deserializeAttachment().hp;
assert.deepEqual(authoritative.deserializeAttachment().skillRuntime.summon,preReconnect.summon);
assert.equal(authoritative.deserializeAttachment().skillRuntime.advancementIdentity,'tribe|spiritcaller');
server.webSocketClose(live);assert.equal(authoritative.deserializeAttachment().hp,hp,'old close cannot overwrite new character health');
const necromancer=server.read('friend');
necromancer.profession='summoner';
necromancer.ascension={jobs:{summoner:{holy:true}},attempts:0,day:''};
necromancer.advancements={summoner:{route:'necromancer',skills:{X:{level:8,points:0},Q:{level:8,points:0},Z:{level:8,points:0},C:{level:8,points:0}}}};
server.save('friend',necromancer);
for(const key of ['X','Q'])await server.webSocketMessage(friend,JSON.stringify({type:'skill',id:'advanced:'+key}));
const legion=friend.deserializeAttachment().skillRuntime.advancedSummon;
assert.equal(legion.legion.length,1);
assert.equal(legion.reserve.length,0);
const friendActor=friend.deserializeAttachment();
for(const key of Object.keys(friendActor.skillRuntime.cooldowns))if(key.endsWith(':X'))friendActor.skillRuntime.cooldowns[key]=Date.now()-1;
friend.serializeAttachment(friendActor);
await server.webSocketMessage(friend,JSON.stringify({type:'skill',id:'advanced:X'}));
const beforeReconnect=friend.deserializeAttachment().skillRuntime.advancedSummon;
assert.equal(beforeReconnect.reserve.length,1);
const necroTicket=await server.command('friend','ticket',{map:'tribe'});
const necroResponse=await server.fetch(new Request('https://play.astrift.com/api/ancient/connect?map=tribe&ticket='+necroTicket.ticket,{headers:{Upgrade:'websocket'}}));
assert.equal(necroResponse.status,101);
const rejoined=server.connections().find(ws=>ws.deserializeAttachment().name==='friend');
assert.equal(friend.deserializeAttachment(),null);
assert.deepEqual(rejoined.deserializeAttachment().skillRuntime.advancedSummon,beforeReconnect);
const killWorld=server.world('tribe');
for(const monster of killWorld.monsters)monster.hp=0;
const masteryTarget=killWorld.monsters[0];
Object.assign(masteryTarget,{kind:'grox',level:80,x:0,y:0,z:53,hp:1,maxHp:1});
masteryTarget.contributions=[];
const markUntil=Date.now()+60000;
masteryTarget.masteryMarks={
 ownFirst:{owner:'friend',id:'advancement:necromancer:C',until:markUntil},
 ownDuplicate:{owner:'friend',id:'advancement:necromancer:C',until:markUntil},
 expired:{owner:'friend',id:'advancement:necromancer:X',until:Date.now()-1},
};
server.damageMonster(rejoined,rejoined.deserializeAttachment(),masteryTarget,1,'body','friend','skill','advancement:necromancer:Q',killWorld.monsters);
const credited=server.read('friend').advancements.summoner.skills;
assert(credited.Q.points>0);
assert.deepEqual(credited.C,credited.Q,'duplicate marks award the same points as one active skill');
assert.equal(credited.X.points,0,'expired mark cannot earn mastery');
const judgmentWorld=server.world('tribe');
const judged=judgmentWorld.monsters.find(monster=>monster.hp>0)||judgmentWorld.monsters[0];
const originalCap=judged.maxHp;
const reducedCap=Math.floor(originalCap*.7);
Object.assign(judged,{hp:reducedCap,maxHp:reducedCap,judgment:{owner:'caster',until:Date.now()+60000,maxHp:originalCap}});
server.persist(judgmentWorld);
assert.equal(server.world('tribe').monsters.find(monster=>monster.id===judged.id).maxHp,reducedCap);
judged.judgment.until=Date.now()-1;
server.persist(judgmentWorld);
await server.tickMap('tribe');
const released=server.world('tribe').monsters.find(monster=>monster.id===judged.id);
assert.equal(released.judgment,undefined);
assert.equal(released.maxHp,originalCap);
assert.equal(released.hp,reducedCap,'ending Judgment restores the cap without healing the target');
const hitAt=Date.now();
const berserker={...authoritative.deserializeAttachment(),hp:100,maxHp:1000,advancement:'berserker',
 skillRuntime:{effects:{bloodRebirth:{until:hitAt+5000,level:8}},cooldowns:{},mode:1}};
const projectile={type:'monster',kind:'hunter',monsterId:'hunter-thrower',attack:'projectile'};
assert.equal(server.applyMapDamage(berserker,1000,projectile,hitAt),0);
assert.equal(berserker.hp,400);
assert.equal(berserker.skillRuntime.bloodRevenge?.attacker,projectile.monsterId);
assert.equal(berserker.skillRuntime.bloodRevenge?.until,hitAt+10000);
assert.equal(berserker.skillRuntime.effects.bloodRebirth,undefined);
const revivalVisuals=peer=>peer.messages.filter(message=>message.type==='skillFx'&&message.id==='berserker-revival');
assert.equal(revivalVisuals(authoritative).length,1);
assert.deepEqual(revivalVisuals(authoritative),revivalVisuals(rejoined));
server.applyMapDamage(berserker,1000,projectile,hitAt+1);
assert.equal(berserker.hp,0,'Blood Rebirth can absorb only one lethal hit per cast');
assert.equal(revivalVisuals(authoritative).length,1);
const paladin={...authoritative.deserializeAttachment(),hp:500,maxHp:1000,
 skillRuntime:{effects:{},cooldowns:{},mode:1,paladin:{map:'tribe',field:{x:0,y:0,z:50,radius:5,until:Date.now()+10000}}}};
for(const [z,expected] of [[53,520],[75,520]]){
 const enemy={...released,id:'sanctuary-target-'+z,kind:'grox',x:0,y:0,z,hp:100,maxHp:100,contributions:[],dormant:false};
 assert.equal(server.damageMonster(authoritative,paladin,enemy,1000,'body','caster','skill'),100);
 assert.equal(paladin.hp,expected);
}
let alarms=0;ctx.storage.setAlarm=async()=>alarms++;const ticks=[];server.tickMap=async map=>{ticks.push(map);throw Error('simulated map failure')};await server.alarm();assert.equal(alarms,1,'failed tick must still schedule the next alarm');assert(ticks.includes('tribe'));
db.close();console.log('PASS: two players, stale dead attachment, nine-second tick delay, exactly-once rain/giant hits, real WebSocket replacement, late old-close safety and alarm recovery.');
