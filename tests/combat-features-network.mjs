import assert from 'node:assert/strict';

const base=(process.argv[2]||'http://127.0.0.1:8789').replace(/^http/,'ws');
const bytes=crypto.getRandomValues(new Uint8Array(6));
const code=[...bytes].map((value,index)=>index%2?String(value%10):String.fromCharCode(65+value%26)).join('');
const sockets=[];
const wait=async check=>{const until=Date.now()+10000;while(!check()){if(Date.now()>until)throw Error('Timed out waiting for room state');await new Promise(resolve=>setTimeout(resolve,25));}return check()};
async function join(mode,id,map='depot'){
  const socket=new WebSocket(`${base}/api/${mode}/${code}`),messages=[];sockets.push(socket);
  socket.addEventListener('message',event=>messages.push(JSON.parse(event.data)));
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
  socket.send(JSON.stringify({type:'join',id,name:id,map}));
  await wait(()=>messages.find(message=>['welcome','duelWelcome','objectiveWelcome'].includes(message.type)));
  return {socket,messages,id};
}
function send(peer,data){peer.socket.send(JSON.stringify(data))}
try{
  const a=await join('challenge','challenger-a'),b=await join('challenge','challenger-b');
  await wait(()=>b.messages.find(message=>message.type==='duel'));
  const initial=b.messages.filter(message=>message.type==='duel').at(-1);
  send(a,{type:'ready',round:initial.round});send(b,{type:'ready',round:initial.round});
  const running=await wait(()=>b.messages.find(message=>message.type==='duel'&&message.phase==='running'));
  assert.ok(['frost','redline','gale','meteor'].includes(running.challengeWeapon));
  const wrong=['frost','redline','gale','meteor'].find(weapon=>weapon!==running.challengeWeapon);
  send(a,{type:'shot',round:running.round,target:b.id,damage:30,weapon:wrong});
  await new Promise(resolve=>setTimeout(resolve,200));
  assert.equal(b.messages.filter(message=>message.type==='shot').length,0,'other weapon rejected');
  send(a,{type:'shot',round:running.round,target:b.id,damage:30,weapon:running.challengeWeapon});
  await wait(()=>b.messages.find(message=>message.type==='shot'));
  send(a,{type:'state',round:running.round,position:[0,1.7,0],hp:87,weapon:wrong,ammo:4,mag:5,armor:'轻型护甲',helmet:'侦察头盔',skill:66,equipment:'医疗注射器',tacticalReady:7,energy:92});
  const state=await wait(()=>b.messages.find(message=>message.type==='state'));
  assert.equal(state.weapon,running.challengeWeapon);
  assert.equal(state.ammo,4);
  assert.equal(state.armor,'轻型护甲');
  assert.equal(state.tacticalReady,7);
  send(a,{type:'coverHit',round:running.round,coverId:'depot:glass',damage:30});
  const cover=await wait(()=>b.messages.find(message=>message.type==='coverState'&&message.coverId==='depot:glass'));
  assert.equal(cover.hp,0);
  const spectator=await join('challenge','challenger-watch');
  const snapshot=await wait(()=>spectator.messages.find(message=>message.type==='coverSnapshot'));
  assert.equal(snapshot.covers.find(item=>item.id==='depot:glass')?.hp,0);
  send(spectator,{type:'coverHit',round:running.round,coverId:'depot:wood',damage:75});
  await new Promise(resolve=>setTimeout(resolve,200));
  assert.equal(b.messages.filter(message=>message.type==='coverState'&&message.coverId==='depot:wood').length,0,'spectator cannot destroy cover');
  const normal=await join('room','cover-normal-a');
  send(normal,{type:'coverHit',coverId:'depot:wood',damage:75});
  await wait(()=>normal.messages.find(message=>message.type==='coverState'&&message.coverId==='depot:wood'));
  const normalLate=await join('room','cover-normal-b');
  assert.equal((await wait(()=>normalLate.messages.find(message=>message.type==='coverSnapshot'))).covers.find(item=>item.id==='depot:wood')?.hp,0);
  const objectiveA=await join('ctf','cover-ctf-a'),objectiveB=await join('ctf','cover-ctf-b');
  const objective=await wait(()=>objectiveA.messages.find(message=>message.type==='objective'&&message.phase==='running'));
  send(objectiveA,{type:'coverHit',round:objective.round,coverId:'depot:glass',damage:30});
  assert.equal((await wait(()=>objectiveB.messages.find(message=>message.type==='coverState'&&message.coverId==='depot:glass'))).hp,0);
  console.log('PASS challenge weapon lock, spectator combat data, cover destruction and late-join snapshot across rooms');
}finally{for(const socket of sockets)if(socket.readyState===WebSocket.OPEN)socket.close()}
