// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
import {build} from 'esbuild';
import {masteryCost} from '../public/ancient-mastery.js';
import {castVisuals} from './ancient-advancement-combat-check.mjs';
import {advancementEffectIds} from '../public/ancient-advancement-fx.js';
const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows}}};
const output=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']}),module={exports:{}},sockets=[];
function socket(actor){let state=actor;return {readyState:1,messages:[],deserializeAttachment:()=>structuredClone(state),serializeAttachment:a=>{if(Buffer.byteLength(JSON.stringify(a))>16384)throw Error("WebSocket attachment cannot be larger than 16384 bytes");state=structuredClone(a)},send(s){this.messages.push(JSON.parse(s))},close(){this.readyState=2}}}
const ctx={storage:{sql,setAlarm:async()=>{},transactionSync:f=>f()},getWebSockets:()=>sockets,acceptWebSocket:ws=>sockets.push(ws)};
vm.runInNewContext(output.outputFiles[0].text,{module,exports:module.exports,Date,crypto,Math,URL,URLSearchParams,Request,structuredClone,AbortController,WebSocketPair:class{constructor(){return {0:socket(null),1:socket(null)}}},Response:class{constructor(body,options){Object.assign(this,options)}static json(data){return {json:async()=>data}}},require:()=>({DurableObject:class{constructor(ctx,env){this.ctx=ctx;this.env=env}}})});
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
profile.ascension={jobs:{necromancer:{holy:true}},attempts:0,day:''};
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
necromancer.profession='necromancer';
necromancer.fusedJobs={necromancer:true};
necromancer.skills={raiseSkeleton:1,unleashLegion:1,consumeSoul:1,necropolis:1};
necromancer.mastery=Object.fromEntries(Object.keys(necromancer.skills).map(id=>[id,{level:8,points:0}]));
necromancer.ascension={jobs:{necromancer:{holy:true}},attempts:0,day:''};
necromancer.advancements={summoner:{route:'necromancer',skills:{X:{level:8,points:0},Q:{level:8,points:0},Z:{level:8,points:0},C:{level:8,points:0}}}};
server.save('friend',necromancer);
assert.equal(server.read('friend').advancements.summoner.route,'beastlord');
assert.equal(server.read('friend').advancements.summoner.skills.X.level,8);
for(const id of ['raiseSkeleton','unleashLegion'])await server.webSocketMessage(friend,JSON.stringify({type:'skill',id}));
const legion=friend.deserializeAttachment().skillRuntime.advancedSummon;
assert.equal(legion.legion.length,1);
assert.equal(legion.reserve.length,0);
const friendActor=friend.deserializeAttachment();
for(const key of Object.keys(friendActor.skillRuntime.cooldowns))if(key==='raiseSkeleton')friendActor.skillRuntime.cooldowns[key]=Date.now()-1;
friend.serializeAttachment(friendActor);
await server.webSocketMessage(friend,JSON.stringify({type:'skill',id:'raiseSkeleton'}));
const beforeReconnect=friend.deserializeAttachment().skillRuntime.advancedSummon;
assert.equal(beforeReconnect.reserveCount,1);
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
 ownFirst:{owner:'friend',id:'necropolis',until:markUntil},
 ownDuplicate:{owner:'friend',id:'necropolis',until:markUntil},
 expired:{owner:'friend',id:'consumeSoul',until:Date.now()-1},
};
server.damageMonster(rejoined,rejoined.deserializeAttachment(),masteryTarget,1,'body','friend','skill','unleashLegion',killWorld.monsters);
const credited=server.read('friend').mastery;
assert.equal(credited.unleashLegion.points,0);
assert.equal(credited.raiseSkeleton.points,6);
assert.equal(credited.necropolis.points,4,'duplicate marks award one credit');
assert.equal(credited.consumeSoul.points,0,'expired mark cannot earn mastery');
const beforeLevelUp=server.read('friend');
const skill=beforeLevelUp.mastery.necropolis;
skill.points=masteryCost('necropolis',skill.level)-1;
server.save('friend',beforeLevelUp);
const levelUpTarget={...masteryTarget,id:'mastery-level-up',hp:1,contributions:[],masteryMarks:{}};
const beforeMessages=rejoined.messages.length;
assert.equal(server.damageMonster(rejoined,rejoined.deserializeAttachment(),levelUpTarget,1,'body','friend','skill',
 'necropolis',killWorld.monsters),1);
const levelUp=rejoined.messages.slice(beforeMessages).find(message=>message.type==='kill'&&message.id===levelUpTarget.id);
assert.deepEqual(levelUp?.masteryUps,['necropolis']);
const savedLevel=server.read('friend').mastery.necropolis;
assert.equal(savedLevel.level,skill.level+1);
assert.equal(savedLevel.points,credited.necropolis.points-1);
assert.equal(levelUp.profile.mastery.necropolis.level,savedLevel.level);

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
const purified={...released,id:'sanctuary-friendly',kind:'grox',x:0,y:0,z:53,hp:100,maxHp:100,contributions:[],dormant:false,
 charm:{owner:paladin.name,until:Date.now()+10000,next:0}};
server.damageMonster(authoritative,paladin,purified,1,'body','caster','skill');
assert.equal(paladin.hp,520,'a purified ally does not provide Sanctuary healing');
const spreadAt=Date.now();
const judgedEnemy={...released,id:'judged-spread',kind:'grox',x:0,y:0,z:53,hp:100,maxHp:100,
 contributions:[],dormant:false,judgment:{owner:'caster',until:spreadAt+10000,maxHp:143}};
const neighbor={...judgedEnemy,id:'nearby',z:55,judgment:undefined,weak:.55,weakUntil:spreadAt-1};
const dormant={...neighbor,id:'dormant',dormant:true};
const stronger={...neighbor,id:'stronger',weakUntil:spreadAt+10000};
const distant={...neighbor,id:'distant',z:75};
assert.equal(server.damageMonster(authoritative,paladin,judgedEnemy,1000,'body','caster','skill',
 undefined,[judgedEnemy,neighbor,dormant,stronger,distant]),100);
assert.equal(neighbor.weak,.2);
assert(neighbor.weakUntil>spreadAt);
assert.equal(stronger.weak,.55);
assert.equal(stronger.weakUntil,spreadAt+10000);
assert.equal(dormant.weakUntil,spreadAt-1);
assert.equal(distant.weakUntil,spreadAt-1);
const broadcastActor=authoritative.deserializeAttachment();
const broadcast=server.skillContext(authoritative,broadcastActor,[],'tribe');
const watchStart=[authoritative.messages.length,rejoined.messages.length];
const details={target:'preview-target',source:{x:2,y:3,z:4},links:[{x:6,height:1,z:8,target:'linked'}]};
for(const id of advancementEffectIds)broadcast.fx(id,1,5,6,details);
const sent=authoritative.messages.slice(watchStart[0]),observed=rejoined.messages.slice(watchStart[1]);
assert.deepEqual(sent.map(message=>message.id),advancementEffectIds);
assert.deepEqual(observed,sent);
for(const message of sent){
 assert.deepEqual(message.source,details.source);
 assert.deepEqual(message.links,details.links);
}
const replayStart=[authoritative.messages.length,rejoined.messages.length];
for(const {id,x,z,radius,details} of castVisuals)broadcast.fx(id,x,z,radius,details);
const replay=authoritative.messages.slice(replayStart[0]);
assert.deepEqual(rejoined.messages.slice(replayStart[1]),replay);
assert.deepEqual(replay.map(({id,x,z,radius})=>({id,x,z,radius})),
 castVisuals.map(({id,x,z,radius})=>({id,x,z,radius})));
// Authority owns the roll, consumes the exact scroll, and guards later tiers.
const ignition=server.read('friend');
for(const id of ['raiseSkeleton','consumeSoul','necropolis'])ignition.mastery[id]={level:12,points:0};
ignition.materials['supply:ignitionAdvanced']=2;
server.save('friend',ignition);
assert.equal((await server.command('friend','igniteFusionPassive',{index:1,scroll:'ignitionAdvanced'})).ok,false);
assert.equal((await server.command('friend','igniteFusionPassive',{index:0,scroll:'ignitionAdvanced'})).ignited,true);
assert.equal(server.read('friend').materials['supply:ignitionAdvanced'],1);
assert.equal((await server.command('friend','igniteFusionPassive',{index:0,scroll:'ignitionAdvanced'})).ok,false);
assert.equal(server.read('friend').materials['supply:ignitionAdvanced'],1);
const passiveProfile=server.read('friend');
passiveProfile.fusionPassives.necromancer={0:{level:12,points:0},1:{level:2,points:0},2:{level:1,points:0}};
server.save('friend',passiveProfile);
const actor=rejoined.deserializeAttachment(),now=Date.now();
actor.hp=actor.maxHp=1000;
const squad={count:1,unitHp:100,hp:100,scale:1,x:0,z:50,until:now+10000,next:0,slot:0};
actor.skillRuntime.advancedSummon.legion=[squad];
server.applyMapDamage(actor,1000,{type:'environment'},now);
assert.equal(actor.hp,600,'damage is halved, and the skeleton absorbs up to its remaining HP');
assert.equal(squad.hp,35,'a skeleton revives once with 35% HP');
server.hurtSkeletonSquad(actor,squad,35,now+1);
assert.equal(squad.hp,0,'an already-revived skeleton cannot revive again');
server.applyMapDamage(actor,5000,{type:'environment'},now+2);
assert.equal(actor.hp,350);
assert.equal(actor.skillRuntime.cooldowns.necromancerDeathless,now+60002);
const during={count:1,unitHp:100,hp:100,scale:1,x:0,z:50,until:now+10000,next:0,slot:1};
server.hurtSkeletonSquad(actor,during,100,now+3);
assert.equal(during.hp,0,'player revival cooldown disables skeleton revival');

const swordsman=server.read('caster');
swordsman.profession='swordsman';
swordsman.ascension={jobs:{swordsman:{holy:true}},attempts:0,day:''};
swordsman.advancements={swordsman:{route:'blademaster',skills:Object.fromEntries([...('XQZC')].map(key=>[key,{level:16,points:0}]))}};
server.save('caster',swordsman);
const sky=authoritative.deserializeAttachment();
Object.assign(sky,{x:0,y:75,z:50,hp:1e6,lastMove:Date.now()-450,moveSeq:0,advancement:'blademaster'});
authoritative.serializeAttachment(sky);
await server.webSocketMessage(authoritative,JSON.stringify({type:'skill',id:'advanced:X'}));
await server.webSocketMessage(authoritative,JSON.stringify({type:'move',seq:1,x:0,z:50,y:77,yaw:0}));
assert.equal(authoritative.deserializeAttachment().y,77,'flight accepts ascent above the ordinary jump ceiling');
const flight=authoritative.deserializeAttachment();
flight.lastMove=Date.now()-500;
flight.moveCredit=20;
flight.x=38;flight.z=50;
authoritative.serializeAttachment(flight);
await server.webSocketMessage(authoritative,JSON.stringify({type:'move',seq:2,x:40,z:50,y:77,yaw:0}));
assert.equal(authoritative.deserializeAttachment().x,38,'flying players remain inside map boundaries');
const expired=authoritative.deserializeAttachment();
expired.skillRuntime.advancedSword.flightUntil=Date.now()-1;
expired.lastMove=Date.now()-500;
authoritative.serializeAttachment(expired);
await server.webSocketMessage(authoritative,JSON.stringify({type:'move',seq:3,x:38,z:50,y:75,yaw:0}));
assert.equal(authoritative.deserializeAttachment().y,75,'expired flight permits falling');

const duneProfile=server.read('dune-necro');
Object.assign(duneProfile,{level:267,profession:'necromancer',fusedJobs:{necromancer:true},ascension:{jobs:{necromancer:{holy:true}},attempts:0,day:''},fusionPassives:{necromancer:{0:{level:1,points:0}}}});
server.save('dune-necro',duneProfile);
const duneTicket=await server.command('dune-necro','ticket',{map:'dunes'});
assert(duneTicket.ok,JSON.stringify(duneTicket));
await server.fetch(new Request('https://play.astrift.com/api/ancient/connect?map=dunes&ticket='+duneTicket.ticket,{headers:{Upgrade:'websocket'}}));
const duneSocket=sockets.at(-1);
assert(duneSocket.messages.find(m=>m.type==='welcome')?.you.maxHp>100);
const largeDuneActor=server.readSocket(duneSocket);
largeDuneActor.skillRuntime={...largeDuneActor.skillRuntime,regressionPayload:'x'.repeat(17000)};
server.writeSocket(duneSocket,largeDuneActor);
assert(duneSocket.deserializeAttachment().overflow);
assert.equal(server.readSocket(duneSocket).skillRuntime.regressionPayload.length,17000);
await server.tickMap('dunes');
assert(duneSocket.messages.find(m=>m.type==='state')?.monsters.length>0);
assert(duneSocket.messages.find(m=>m.type==='state')?.you.maxHp>100);

let scheduled;
ctx.storage.getAlarm=async()=>Date.now()+3600000;
ctx.storage.setAlarm=async when=>{scheduled=when;};
await server.webSocketMessage(duneSocket,JSON.stringify({type:'heartbeat'}));
assert(scheduled<Date.now()+2000,'heartbeat must replace the idle alarm when a player is connected');

const tribe=server.world('tribe');
const roamingTribeMob=server.makeMonster('grox',12,0,330,1);
tribe.monsters.push(roamingTribeMob);
server.persist(tribe);
await server.tickMap('tribe');
assert(server.world('tribe').monsters.find(m=>m.id===roamingTribeMob.id).dormant);
const approach=server.readSocket(authoritative);
Object.assign(approach,{x:0,z:280,y:1.7,seen:Date.now()});
server.writeSocket(authoritative,approach);
await server.tickMap('tribe');
assert(!server.world('tribe').monsters.find(m=>m.id===roamingTribeMob.id).dormant);
assert(authoritative.messages.findLast(m=>m.type==='state').monsters.some(m=>m.id===roamingTribeMob.id));

const release=readFileSync('src/client-release.ts','utf8').match(/CLIENT_RELEASE = '([^']+)'/)[1];
const httpTicket=await server.command('dune-necro','ticket',{map:'dunes'});
const httpResult=await server.httpConnect('dune-necro',{ticket:httpTicket.ticket,map:'dunes',resume:true,clientVersion:release});
assert(httpResult.ok,JSON.stringify(httpResult));
const welcome=await server.httpExchange('dune-necro',{connection:httpResult.connection,messages:[],ack:0});
assert(welcome.messages.some(m=>m.data.type==='welcome'));
await server.tickMap('dunes');
const snapshot=await server.httpExchange('dune-necro',{connection:httpResult.connection,messages:[],ack:welcome.messages.at(-1).seq});
assert(snapshot.messages.some(m=>m.data.type==='state'));
assert.equal((await server.httpExchange('friend',{connection:httpResult.connection,messages:[]})).ok,false);
const restoredServer=new module.exports.AncientWorld(ctx,{ACCOUNT_SESSIONS:{getByName:()=>({banState:async()=>null})}});
const survived=await restoredServer.httpExchange('dune-necro',{connection:httpResult.connection,messages:[]});
assert(survived.ok,'HTTP sessions survive server reconstruction');
const closed=await restoredServer.httpExchange('dune-necro',{connection:httpResult.connection,messages:[{type:'leave'}]});
assert(closed.ok);
assert.equal((await restoredServer.httpExchange('dune-necro',{connection:httpResult.connection,messages:[]})).ok,false);

const quickbar=['potion:minor','supply:book:warrior','','bossCard:lord','meal:grilled',''];
const quickSave=await server.command('caster','saveQuickbar',{slots:quickbar});
assert(quickSave.ok);
const quickServer=new module.exports.AncientWorld(ctx,{ACCOUNT_SESSIONS:{getByName:()=>({banState:async()=>null})}});
assert.deepEqual(Array.from(quickServer.read('caster').quickbar),quickbar,'quickbar survives server reconstruction');
assert.equal(quickServer.read('friend').quickbar,undefined,'accounts keep separate quickbars');
assert.equal((await server.command('caster','saveQuickbar',{slots:['bad']})).ok,false);
let alarms=0;ctx.storage.setAlarm=async()=>alarms++;const ticks=[];server.tickMap=async map=>{ticks.push(map);throw Error('simulated map failure')};await server.alarm();assert.equal(alarms,1,'failed tick must still schedule the next alarm');assert(ticks.includes('tribe'));
db.close();console.log('PASS: two players, stale dead attachment, nine-second tick delay, exactly-once rain/giant hits, real WebSocket replacement, late old-close safety and alarm recovery.');
