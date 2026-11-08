// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';

const origin=new URL(process.argv[2]||'http://127.0.0.1:8874');
assert(['localhost','127.0.0.1'].includes(origin.hostname),'Run against a local Worker with isolated storage.');
async function request(path,body){
 const response=await fetch(new URL('/api/'+path,origin),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 return {status:response.status,data:await response.json()};
}
async function versionFor(world){
 const html=await (await fetch(new URL('/_world/'+world,origin))).text();
 return html.match(/name="astrift-build" content="([^"]+)"/)?.[1];
}
const version=await versionFor('ancient');
assert.match(version,/^[a-f0-9]{20}$/);
assert.equal(await versionFor('main'),version);
const session={name:'VerQA'+crypto.randomUUID().slice(0,7),device:crypto.randomUUID()};
const registered=await request('account/register',{...session,password:crypto.randomUUID(),snapshot:{}});
assert.equal(registered.status,200,JSON.stringify(registered.data));
session.token=registered.data.token;
const ancient=(action,clientVersion=version,extra={})=>request('ancient/profile',{...session,action,clientVersion,...extra});
const rejectVersion=({status,data})=>{assert.equal(status,409);assert.equal(data.code,'CLIENT_UPDATE_REQUIRED');};
await ancient('profile');
const initial=await ancient('profile');
assert.equal(initial.status,200);
for(const action of ['ticket','buyPotion','marketBuy','tradeConfirm','mailClaim','communitySave','trainSkill']){
 rejectVersion(await ancient(action,'old',{map:'tribe',id:'low'}));
}
rejectVersion(await request('ancient/profile',{...session,action:'buyPotion'}));
assert.equal((await ancient('profile','old')).status,200);
assert.deepEqual((await ancient('profile')).data.profile,initial.data.profile);
assert.equal((await request('client-version',{clientVersion:version})).status,200);
rejectVersion(await request('client-version',{clientVersion:'old'}));
rejectVersion(await request('extraction/squad',{...session,action:'create',clientVersion:'old'}));
rejectVersion(await request('account/socket-ticket',{...session,path:'/api/room/test',clientVersion:'old'}));
const ticket=await ancient('ticket',version,{map:'tribe'});
assert.equal(ticket.status,200,JSON.stringify(ticket.data));
const url=new URL('/api/ancient/connect',origin);url.protocol='ws:';
url.search=new URLSearchParams({map:'tribe',ticket:ticket.data.ticket,clientVersion:version});
const ws=new WebSocket(url);
function message(type){
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('Missing '+type)),5000);
  ws.addEventListener('message',function receive(event){if(JSON.parse(event.data).type!==type)return;clearTimeout(timer);ws.removeEventListener('message',receive);resolve();});
 });
}
try{
 await message('welcome');
 const ack=message('heartbeatAck');
 ws.send(JSON.stringify({type:'heartbeat'}));
 await ack;
}finally{ws.close()}
console.log('PASS: stale and missing versions cannot change data; current clients can enter and use the normal world socket.');
