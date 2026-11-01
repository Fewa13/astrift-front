import assert from 'node:assert/strict';
const base=(process.argv[2]||'http://127.0.0.1:8789').replace(/^http/,'ws'),peers=[];
const code=()=>Array.from(crypto.getRandomValues(new Uint8Array(6)),(n,i)=>i%2?String(n%10):String.fromCharCode(65+n%26)).join('');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,timeout=8000){const end=Date.now()+timeout;while(!fn()){if(Date.now()>end)throw Error('Timeout');await sleep(20);}return fn();}
async function join(mode,room,id){const ws=new WebSocket(`${base}/api/${mode}/${room}`),p={ws,id,messages:[],board:null,position:[0,1.7,43],hold:false,hp:100};peers.push(p);ws.onmessage=e=>{const d=JSON.parse(e.data);p.messages.push(d);if(d.type==='objective')p.board=d;};await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});ws.send(JSON.stringify({type:'join',id,name:id}));await until(()=>p.board||p.messages.find(m=>m.type==='welcome'));return p;}
const send=(p,d)=>p.ws.send(JSON.stringify({...d,round:d.round??p.board?.round??0}));
const heartbeat=setInterval(()=>{for(const p of peers)if(p.ws.readyState===1&&p.board)send(p,{type:'state',position:p.position,rotation:0,hp:p.hp,interacting:p.hold});},100);
try{
 const room=code(),a=await join('ctf',room,'blue'),b=await join('ctf',room,'red');b.position=[0,1.7,-43];await until(()=>a.board.phase==='running');
 const startRound=a.board.round,deadline=a.board.endsAt;
 const late=await join('ctf',room,'late');await until(()=>late.board.round===startRound);assert.equal(late.board.endsAt,deadline,'late join preserves clock');
 send(a,{type:'shot',target:b.id,damage:100,zone:'head'});const hit=await until(()=>b.messages.find(m=>m.type==='shot'));b.hp=0;send(b,{type:'death',shotId:hit.shotId});send(b,{type:'death',shotId:hit.shotId});await until(()=>a.messages.find(m=>m.type==='objectiveKill'));assert.equal(a.messages.filter(m=>m.type==='objectiveKill').length,1);assert.deepEqual(a.board.scores,[0,0],'kill is not a capture');
 a.position=[0,1.7,-43];a.hold=true;await until(()=>a.board.flags[1].carrier===a.id);a.hold=false;a.ws.close();await until(()=>b.board.flags[1].carrier===null&&!b.board.flags[1].home);
 const a2=await join('ctf',room,'blue');assert.equal(a2.board.players.find(p=>p.id==='blue').team,0,'reconnect keeps team');assert.equal(a2.board.endsAt,deadline);
 for(let i=1;i<=3;i++){a2.position=[0,1.7,-43];a2.hold=true;await until(()=>a2.board.flags[1].carrier===a2.id);a2.hold=false;a2.position=[0,1.7,43];await until(()=>a2.board.scores[0]===i);}
 assert.equal(a2.board.phase,'finished');send(a2,{type:'shot',target:b.id,damage:100});
 await until(()=>a2.board.round>startRound,8000);assert.equal(a2.board.phase,'running');assert.deepEqual(a2.board.scores,[0,0]);assert.equal(a2.board.players.find(p=>p.id==='blue').team,0,'auto continue keeps roster');
 send(a2,{type:'shot',target:b.id,damage:100,round:startRound});await sleep(200);assert.equal(b.messages.filter(m=>m.type==='shot').length,1,'old-round and finished shots rejected');
 const normal=await join('room',room,'normal');assert.equal(normal.messages.find(m=>m.type==='scoreboard').blue,0,'ordinary room isolated');
 const hroom=code(),h1=await join('hardpoint',hroom,'hill-blue'),h2=await join('hardpoint',hroom,'hill-red');h2.position=[0,1.7,-43];h1.position=[0,1.7,6];await until(()=>h1.board.scores[0]>=2);h2.position=[0,1.7,6];await until(()=>h1.board.contested);const score=h1.board.scores[0];await sleep(1300);assert.equal(h1.board.scores[0],score,'server contest pauses points');
 console.log('PASS live objective rooms: waiting/late join, non-scoring duplicate kill, flag drop/reconnect, 3 captures, finish/auto-continue/teams, stale shots, normal isolation, hardpoint scoring and contest.');
}finally{clearInterval(heartbeat);for(const p of peers)if(p.ws.readyState===1){send(p,{type:'leave'});p.ws.close();}}
