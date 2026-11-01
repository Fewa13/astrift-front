// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
import {build} from 'esbuild';
const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows,one:()=>rows[0]}}};
const output=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']}),module={exports:{}},sockets=[];let now=Date.now();class Clock extends Date{static now(){return now}}
function socket(actor){let state=actor;return {readyState:1,messages:[],deserializeAttachment:()=>structuredClone(state),serializeAttachment:a=>state=structuredClone(a),send(s){this.messages.push(JSON.parse(s))},close(){this.readyState=2}}}
class Reply{constructor(body,options){Object.assign(this,options);this.body=body}static json(body,{status=200}={}){return new Reply(body,{status})}}
const ctx={storage:{sql,setAlarm:async()=>{},transactionSync:f=>f()},getWebSockets:()=>sockets,acceptWebSocket:ws=>sockets.push(ws)};
vm.runInNewContext(output.outputFiles[0].text,{module,exports:module.exports,Date:Clock,crypto,Math,URL,structuredClone,AbortController,WebSocketPair:class{constructor(){return {0:socket(null),1:socket(null)}}},Response:Reply,require:()=>({DurableObject:class{constructor(ctx,env){this.ctx=ctx;this.env=env}}})});
const env={ACCOUNT_SESSIONS:{getByName:()=>({banState:async()=>null})},PLAYER_ACCOUNTS:{getByName:key=>({exists:async()=>key!=='account:missing',validate:async()=>true})}},server=new module.exports.AncientWorld(ctx,env),cmd=(name,action,data={})=>server.command(name,action,data);
const hostProfile=server.read('host');hostProfile.level=100;server.save('host',hostProfile);
const host=socket({name:'host',connectionId:'host-session',map:'forest',tribeLayout:2,x:0,z:10,y:1.7,hp:100000,maxHp:100000,seen:now,weapon:hostProfile.weapons[0],lastShot:0,deadAt:0});sockets.push(host);
assert.equal((await cmd('guest','ticket',{map:'forest'})).ok,false);
assert.equal((await cmd('guest','friendAdd',{target:'missing'})).ok,false);
assert.equal((await cmd('guest','friendAdd',{target:'host'})).ok,true);assert.equal((await cmd('host','friendRequestRespond',{target:'guest',accept:true})).ok,true);
let state=(await cmd('guest','friendState')).friendState;assert.equal(state.friends.length,1);assert(state.friends[0].online);
assert.equal((await cmd('intruder','friendMapInvite',{target:'guest'})).ok,false);
assert.equal((await cmd('guest','friendMapInvite',{target:'host'})).ok,false,'lobby cannot invite');
for(let i=0;i<20;i++){now+=600;assert.equal((await cmd(i%2?'host':'guest','friendSend',{target:i%2?'guest':'host',text:'hello '+i})).ok,true)}
const messages=(await cmd('host','friendMessages',{target:'guest'})).messages;assert.equal(messages.length,15);assert.equal(messages[0].text,'hello 5');assert.equal((await cmd('intruder','friendMessages',{target:'host'})).ok,false);assert.equal((await cmd('guest','friendSend',{target:'host',text:'a'.repeat(201)})).ok,false);
assert.equal((await cmd('guest','friendSend',{target:'host',text:'fuck you'})).ok,false,'friend chat uses content moderation');
const update=()=>{const a=host.deserializeAttachment();a.seen=now;host.serializeAttachment(a)};update();await cmd('guest','friendState');
assert.equal((await cmd('host','friendMapInvite',{target:'guest',map:'sanctum'})).ok,true);
let invitation=(await cmd('guest','friendState')).friendState.incoming[0];assert.equal(invitation.map,'forest','server chooses inviter map, not request body');
assert.equal((await cmd('intruder','friendInviteRespond',{id:invitation.id,accept:true})).ok,false);
const accepted=await cmd('guest','friendInviteRespond',{id:invitation.id,accept:true});assert.equal(accepted.joinMap,'forest');assert.equal((await cmd('guest','friendInviteRespond',{id:invitation.id,accept:true})).ok,false,'single-use invitation');
assert.equal((await cmd('guest','ticket',{map:'sanctum'})).ok,false,'invitation cannot bypass other maps');
const ticket=(await cmd('guest','ticket',{map:'forest'})).ticket;
const connect=(ticket,map)=>server.fetch(new Request('https://play.astrift.com/api/ancient/connect?map='+map+'&ticket='+ticket,{headers:{Upgrade:'websocket'}}));
assert.equal((await connect(ticket,'sanctum')).status,403,'tickets bound to the invited map');assert.equal((await connect(ticket,'forest')).status,101);
let guest=server.connections().find(ws=>ws.deserializeAttachment().name==='guest');assert(guest.deserializeAttachment().visitPass);assert.equal(server.read('guest').level,1,'no permanent level unlock');
now+=20000;await server.webSocketMessage(guest,JSON.stringify({type:'heartbeat',token:'token',device:'device'}));guest.readyState=3;server.webSocketClose(guest);
const reconnect=await cmd('guest','ticket',{map:'forest'});assert(reconnect.ok,'brief accidental disconnect may reconnect');assert.equal((await connect(reconnect.ticket,'forest')).status,101);
guest=server.connections().find(ws=>ws.deserializeAttachment().name==='guest');const unused=(await cmd('guest','ticket',{map:'forest'})).ticket;await server.webSocketMessage(guest,JSON.stringify({type:'leave'}));assert.equal((await cmd('guest','ticket',{map:'forest'})).ok,false,'intentional exit revokes access');assert.equal((await connect(unused,'forest')).status,403,'old ticket cannot resurrect revoked pass');
now+=4000;update();await cmd('guest','friendState');await cmd('host','friendMapInvite',{target:'guest'});invitation=(await cmd('guest','friendState')).friendState.incoming[0];
host.readyState=3;server.webSocketClose(host);assert.equal((await cmd('guest','friendInviteRespond',{id:invitation.id,accept:true})).ok,false,'departed inviter invalidates invitation');
const restored=new module.exports.AncientWorld(ctx,env);assert.equal((await restored.command('guest','friendState',{})).friendState.friends.length,1,'friendship persisted');assert.equal((await restored.command('guest','friendMessages',{target:'host'})).messages.length,15,'chat persisted independently of world connections');
assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name='social_friends'").get().n,0,'Ancient does not reuse FPS friendships');
db.close();console.log('PASS: independent persisted friends, consent, online state, moderated 15-message chat, in-map-only invitations, ownership/expiry/map restrictions, one-visit level bypass, reconnect grace and revocation even for previously issued tickets.');
