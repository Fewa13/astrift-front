import assert from 'node:assert/strict';
const base=(process.argv[2]||'http://127.0.0.1:8789').replace(/^http/,'ws');
const bytes=crypto.getRandomValues(new Uint8Array(6)),code=[...bytes].map((n,i)=>i%2?String(n%10):String.fromCharCode(65+n%26)).join('');
const peers=[];
async function until(check,timeout=12000){const end=Date.now()+timeout;while(!check()){if(Date.now()>end)throw Error('Timeout');await new Promise(r=>setTimeout(r,30));}return check();}
async function join(id,normal=false){const ws=new WebSocket(`${base}/api/${normal?'room':'duel'}/${code}`),p={ws,id,messages:[],board:null};peers.push(p);ws.addEventListener('message',e=>{const d=JSON.parse(e.data);p.messages.push(d);if(d.type==='duel')p.board=d;});await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',j,{once:true});});ws.send(JSON.stringify({type:'join',id,name:id}));await until(()=>normal?p.messages.find(m=>m.type==='welcome'):p.board);return p;}
const send=(p,d)=>p.ws.send(JSON.stringify({...d,round:p.board?.round??0}));
const timer=setInterval(()=>{for(const p of peers)if(p.ws.readyState===1&&p.board)send(p,{type:'ping'})},2000);
try{
  const a=await join('network-a'),b=await join('network-b'),c=await join('network-c');
  assert.equal(c.board.players.filter(p=>p.team>=0).length,2);assert.equal(c.board.players.find(p=>p.id===c.id).team,-1);
  send(a,{type:'ready'});send(b,{type:'ready'});await until(()=>c.board.phase==='running');
  assert.ok(c.board.endsAt-c.board.serverNow>598000);
  send(a,{type:'shot',target:b.id,damage:100});const hit=await until(()=>b.messages.find(m=>m.type==='shot'));
  send(b,{type:'death',shotId:hit.shotId});send(b,{type:'death',shotId:hit.shotId});await until(()=>c.board.blue===1);assert.equal(c.messages.filter(m=>m.kill).length,1);
  send(c,{type:'shot',target:a.id,damage:200});send(c,{type:'state',position:[0,1,0],hp:100});
  const normal=await join('normal-player',true);assert.equal(normal.messages.find(m=>m.type==='welcome').team,0);assert.equal(normal.messages.find(m=>m.type==='scoreboard').blue,0);
  const endsAt=c.board.endsAt;b.ws.close();await until(()=>c.board.players.find(p=>p.id===b.id)?.connected===false);
  const b2=await join(b.id);assert.equal(b2.board.players.find(p=>p.id===b.id).team,1);assert.equal(b2.board.endsAt,endsAt);
  // Exercise the real Workers alarm rather than a mock timer.
  b2.ws.close();await until(()=>c.board.players.find(p=>p.id===c.id)?.team===1,16000);
  assert.equal(c.board.blue,1);assert.equal(c.board.endsAt,endsAt);
  assert.equal(a.messages.filter(m=>m.type==='shot'&&m.id===c.id).length,0,'spectator shot rejected');
  assert.equal(a.messages.filter(m=>m.type==='state'&&m.id===c.id).length,0,'spectator body rejected');
  console.log('PASS live Workers WebSockets/alarm: 1v1 + spectator, 600-second deadline, single score, spectator isolation, reconnect, timed promotion, score/time preserved, ordinary room isolated');
}finally{clearInterval(timer);for(const p of peers)if(p.ws.readyState===1){if(p.board)send(p,{type:'leave'});p.ws.close();}}
