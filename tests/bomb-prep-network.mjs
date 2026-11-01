import assert from 'node:assert/strict';

const code=Array.from(crypto.getRandomValues(new Uint8Array(6)),(n,i)=>i%2?String(n%10):String.fromCharCode(65+n%26)).join('');
const base=(process.argv[2]||'http://127.0.0.1:8787').replace(/^http/,'ws');
const peers=[];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(predicate,timeout=9000){const ends=Date.now()+timeout;while(!predicate()){if(Date.now()>ends)throw Error('prep room timeout');await sleep(30)}}
async function join(id,preset){const ws=new WebSocket(`${base}/api/bomb/${code}`),peer={id,ws,board:null};peers.push(peer);ws.onmessage=event=>{const message=JSON.parse(event.data);if(message.type==='bomb')peer.board=message};await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});ws.send(JSON.stringify({type:'join',id,name:id,preset}));await until(()=>peer.board);return peer}
const send=(peer,data)=>peer.ws.send(JSON.stringify({...data,round:peer.board.round}));
try{
  const host=await join('host','duoOpposite'),guest=await join('guest');
  send(host,{type:'ready',weapon:null});send(guest,{type:'ready',weapon:null});
  await until(()=>host.board.phase==='prep'&&guest.board.phase==='prep');
  const attackTeam=host.board.attackTeam,attacker=host.board.players.find(player=>player.team===attackTeam),defender=host.board.players.find(player=>player.team!==attackTeam),attackPeer=attacker.id==='host'?host:guest,defendPeer=defender.id==='host'?host:guest;
  send(attackPeer,{type:'state',position:[0,1.7,0],hp:100,rotation:0,interacting:true});
  send(defendPeer,{type:'state',position:[0,1.7,0],hp:100,rotation:0,interacting:true});
  await sleep(350);send(host,{type:'ping'});await sleep(250);
  const currentAttacker=host.board.players.find(player=>player.id===attacker.id),currentDefender=host.board.players.find(player=>player.id===defender.id);
  assert.ok(Math.abs(currentAttacker.position[2])>60,'attacker stays in spawn during setup');
  assert.equal(currentDefender.position[0],0,'defender may move during setup');
  assert.equal(currentDefender.position[2],0,'defender may reach a setup position');
  assert.equal(host.board.plantedSite,null,'no planting before combat starts');
  await until(()=>host.board.phase==='running',9000);
  console.log('PASS bomb prep: defender moves, attacker is held at spawn, planting waits for combat.');
}finally{for(const peer of peers)if(peer.ws.readyState===1){send(peer,{type:'leave'});peer.ws.close()}}
