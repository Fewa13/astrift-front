import assert from 'node:assert/strict';
import {createECDH,randomBytes} from 'node:crypto';

const base=process.env.ASTRIFT_TEST_BASE||'http://127.0.0.1:8791';
const password=process.env.ASTRIFT_TEST_ADMIN_PASSWORD;
if(!password)throw Error('Set ASTRIFT_TEST_ADMIN_PASSWORD');
async function api(path,body){
  const response=await fetch(base+'/api/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const data=await response.json();if(!response.ok||data.ok===false)throw Error(`${path}: ${response.status} ${JSON.stringify(data)}`);return data;
}
const suffix=Date.now().toString(36),accounts=[];
for(const letter of ['a','b','c']){
  const device=crypto.randomUUID(),name=`t${letter}${suffix}`;
  const result=await api('account/register',{name,password:'test-password-123',device,snapshot:{}});
  accounts.push({name,device,token:result.token});
}
const admin=await api('tournaments/admin-login',{password});
const created=await api('tournaments/create',{adminToken:admin.token,kind:'warrior',eventName:'武者大赛测试',description:'真人淘汰测试',details:'测试赛事'});
const eventId=created.id;
const browserKey=createECDH('prime256v1');browserKey.generateKeys();
const subscription={endpoint:'https://fcm.googleapis.com/fcm/send/integration-test-'+suffix,keys:{p256dh:browserKey.getPublicKey().toString('base64url'),auth:randomBytes(16).toString('base64url')}};
assert.equal((await api('tournaments/push-config',{})).ok,true);
await assert.rejects(api('tournaments/push-subscribe',{subscription}),/401/);
await assert.rejects(api('tournaments/push-subscribe',{...accounts[0],subscription:{...subscription,endpoint:'https://127.0.0.1/private'}}),/400/);
await api('tournaments/push-subscribe',{...accounts[0],subscription});
await api('tournaments/push-unsubscribe',{...accounts[0],endpoint:subscription.endpoint});
await assert.rejects(api('tournaments/claim',{...accounts[0],eventId}),/403/);
for(const account of accounts)await api('tournaments/join',{...account,eventId});
const registrationRoster=await api('tournaments/roster',{eventId});assert.equal(registrationRoster.participants.length,3);assert.ok(registrationRoster.participants.every(person=>person.lives===3));
await api('tournaments/start',{adminToken:admin.token,eventId});
async function state(account=accounts[0]){return (await api('tournaments/list',account)).events.find(event=>event.id===eventId)}
async function waitFor(predicate,timeout=8000){const started=Date.now();while(Date.now()-started<timeout){const current=await state();if(predicate(current))return current;await new Promise(resolve=>setTimeout(resolve,100))}throw Error('Timed out waiting for tournament state')}
async function socket(account,room,map){
  const ws=new WebSocket(base.replace(/^http/,'ws')+'/api/tournament/'+room);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
  const id=crypto.randomUUID();ws.send(JSON.stringify({type:'join',id,name:account.name,account:account.name,token:account.token,device:account.device,map}));
  return {ws,id};
}
async function duel(winner,loser,expectedLives){
  const first=await api('tournaments/queue',{...winner,eventId});assert.equal(first.status,'waiting');
  const second=await api('tournaments/queue',{...loser,eventId});assert.equal(second.status,'matched');
  const firstStatus=await api('tournaments/status',{...winner,eventId,ticket:first.ticket});assert.equal(firstStatus.room,second.room);
  const win=await socket(winner,second.room,second.map),lose=await socket(loser,second.room,second.map);
  await new Promise(resolve=>setTimeout(resolve,180));
  lose.ws.send(JSON.stringify({type:'leave'}));
  const latest=await waitFor(event=>event.ranking.find(p=>p.name===loser.name)?.lives===expectedLives);
  win.ws.close();lose.ws.close();
  return latest;
}
for(let lives=2;lives>=0;lives--)await duel(accounts[0],accounts[1],lives);
for(let lives=2;lives>=0;lives--)await duel(accounts[0],accounts[2],lives);
const final=await state();assert.equal(final.status,'finished');
assert.deepEqual(final.ranking.filter(item=>item.place).sort((a,b)=>a.place-b.place).map(item=>item.name),[accounts[0].name,accounts[2].name,accounts[1].name]);
for(const [index,account] of accounts.entries()){
  const claim=await api('tournaments/claim',{...account,eventId});assert.equal(claim.place,[1,3,2][index]);assert.equal(claim.profile.eventRewards.length,2);
}
const replay=await api('tournaments/claim',{...accounts[0],eventId});assert.equal(replay.profile.eventRewards.length,2);
await api('tournaments/delete',{adminToken:admin.token,eventId});
const manual=await api('tournaments/create',{adminToken:admin.token,kind:'warrior',eventName:'手动淘汰测试',description:'名单与灯数',details:'测试'});
for(const account of accounts)await api('tournaments/join',{...account,eventId:manual.id});
await api('tournaments/start',{adminToken:admin.token,eventId:manual.id});
await api('tournaments/eliminate',{adminToken:admin.token,eventId:manual.id,target:accounts[1].name});
let roster=await api('tournaments/roster',{eventId:manual.id});assert.equal(roster.participants.find(p=>p.name===accounts[1].name).lives,0);
assert.equal(roster.participants.find(p=>p.name===accounts[1].name).disqualified,true);
assert.ok(!(await api('tournaments/list',accounts[0])).events.find(event=>event.id===manual.id).ranking.some(p=>p.name===accounts[1].name));
await assert.rejects(api('tournaments/eliminate',{adminToken:admin.token,eventId:manual.id,target:accounts[1].name}),/already|已经淘汰/);
await api('tournaments/eliminate',{adminToken:admin.token,eventId:manual.id,target:accounts[2].name});
roster=await api('tournaments/roster',{eventId:manual.id});assert.deepEqual(roster.participants.filter(p=>p.place).sort((a,b)=>a.place-b.place).map(p=>p.name),[accounts[0].name]);
await assert.rejects(api('tournaments/claim',{...accounts[1],eventId:manual.id}),/403/);
await api('tournaments/delete',{adminToken:admin.token,eventId:manual.id});
await api('tournaments/admin-logout',{adminToken:admin.token});
console.log('Tournament integration passed:',eventId);
