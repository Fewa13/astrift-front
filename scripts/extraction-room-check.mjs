// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
const base=process.env.EXTRACT_TEST_URL||'http://localhost:8788';
if(!/^http:\/\/(localhost|127\.0\.0\.1):/.test(base))throw Error('This test creates accounts: local server only');
const suffix=crypto.randomUUID().slice(0,6),password=crypto.randomUUID(),users=[];
async function call(path,user,body={}){const r=await fetch(base+'/api/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...user,...body})});const data=await r.json();return {status:r.status,...data}}
for(let i=0;i<3;i++){const user={name:'xt'+i+suffix,device:crypto.randomUUID()},r=await call('account/register',user,{password,snapshot:{}});assert.equal(r.ok,true,JSON.stringify(r));user.token=r.token;users.push(user)}
const [a,b,c]=users;
for(const target of [b,c]){assert((await call('social/add',a,{target:target.name})).ok);assert((await call('social/friendRespond',target,{target:a.name,decision:'accept'})).ok)}
let r=await call('extraction/squad',a,{action:'create'});assert(r.ok,JSON.stringify(r));const room=r.party.room;
assert.equal((await call('extraction/squad',b,{action:'join',room})).ok,false,'Uninvited entry denied');
for(const user of [b,c]){const invite=await call('social/invite',a,{target:user.name,mode:'extraction',map:'crossroads',room});assert(invite.ok,JSON.stringify(invite));assert((await call('social/respond',user,{id:invite.invite.id,decision:'accept'})).ok);assert((await call('extraction/squad',user,{action:'join',room})).ok)}
const loadout={weapon:{id:crypto.randomUUID(),kind:'weapon',weapon:'redline',mods:{}},armor:null,helmet:null,bag:[{id:crypto.randomUUID(),kind:'ammo',weapon:'redline',type:'',quantity:30}]};
for(let i=0;i<3;i++){r=await call('extraction/squad',users[i],{action:'ready',room,loadout});assert(r.ok,JSON.stringify(r));assert.equal(r.party.phase,i===2?'running':'lobby','All members including host must ready')}
function connect(user,id){return new Promise((resolve,reject)=>{const ws=new WebSocket(base.replace('http:','ws:')+'/api/extraction/'+room);ws.addEventListener('error',reject,{once:true});ws.addEventListener('open',()=>ws.send(JSON.stringify({type:'join',id,account:user.name,token:user.token,device:user.device})));ws.addEventListener('message',e=>{const d=JSON.parse(e.data);if(d.type==='extractionWelcome')resolve({ws,welcome:d})})})}
const first=await connect(a,'one'),second=await connect(b,'two');
const wait=(ws,type)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Timed out '+type)),5000),listen=e=>{const d=JSON.parse(e.data);if(d.type===type){clearTimeout(timer);ws.removeEventListener('message',listen);resolve(d)}};ws.addEventListener('message',listen)});
let next=wait(second.ws,'state');first.ws.send(JSON.stringify({type:'state',position:[-150,1.7,145],hp:100,rotation:0}));assert.equal((await next).name,a.name);
// The signal is a canonical room event, not a client-supplied arbitrary position.
next=wait(second.ws,'state');first.ws.send(JSON.stringify({type:'state',position:[157,1.7,57],hp:100,rotation:0}));await next;
next=wait(second.ws,'extractionSignal');first.ws.send(JSON.stringify({type:'extractionSignal',position:[0,0,0]}));assert.deepEqual((await next).position,[157,0,57]);
let signals=0;const countSignal=e=>{if(JSON.parse(e.data).type==='extractionSignal')signals++};second.ws.addEventListener('message',countSignal);first.ws.send(JSON.stringify({type:'extractionSignal'}));await new Promise(r=>setTimeout(r,80));assert.equal(signals,0,'Repeated signal rate limited');second.ws.removeEventListener('message',countSignal);
next=wait(second.ws,'state');first.ws.send(JSON.stringify({type:'state',position:[-150,1.7,145],hp:100,rotation:0}));await next;
const world={bots:[{index:0,position:[100,0,-100],ammo:20,reserve:190,gear:loadout,bag:[]}],drops:[{id:'loot',items:[{id:'thing',kind:'valuable',type:'wire'}]}]};
next=wait(second.ws,'extractionWorld');first.ws.send(JSON.stringify({type:'extractionWorld',world}));await next;
next=wait(second.ws,'extractionWorld');first.ws.send(JSON.stringify({type:'extractionWorld',world:{bots:[{index:0,position:[99,0,-100],ammo:19,reserve:190}]}}));await next;
const third=await connect(c,'three');assert.equal(third.welcome.world.bots[0].ammo,19);assert.equal(third.welcome.world.bots[0].gear.weapon.weapon,'redline');assert.equal(third.welcome.world.drops[0].items[0].id,'thing');
next=wait(second.ws,'extractionParty');await call('extraction/squad',a,{action:'finish',room});const changed=await next;assert(changed.party.members.find(m=>m.name===b.name).host);assert.equal(changed.party.phase,'running');
// Death may arrive after the separate HTTP finish request; preserve it exactly once.
next=wait(second.ws,'extractionWorld');const death={type:'extractionDeath',position:[-150,1.7,145],items:[loadout.weapon,...loadout.bag]};first.ws.send(JSON.stringify(death));first.ws.send(JSON.stringify(death));let dropWorld=(await next).world;assert.equal(dropWorld.drops.filter(d=>d.id.startsWith('death:')).length,1);
next=wait(third.ws,'extractionWorld');second.ws.send(JSON.stringify({type:'extractionWorld',world:{drops:world.drops}}));assert.equal((await next).world.drops.filter(d=>d.id.startsWith('death:')).length,1,'Stale host snapshot must not delete a new death box');
const rejoined=await connect(c,'returning-three');assert.equal(rejoined.welcome.world.drops.find(d=>d.id.startsWith('death:')).items[0].weapon,'redline');rejoined.ws.close();
for(const socket of [first.ws,second.ws,third.ws])socket.close();
for(const user of [b,c])await call('extraction/squad',user,{action:'finish',room});
r=await call('extraction/squad',b,{action:'state',room});assert.equal(r.party.phase,'lobby');
console.log('PASS: authenticated invitations, unauthorized entry denied, 3-player readiness, position relay, partial snapshots, host handover, idempotent death boxes after finish, stale-snapshot protection and lobby reset');
