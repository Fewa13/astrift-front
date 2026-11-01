import assert from 'node:assert/strict';
const base=(process.argv[2]||'http://127.0.0.1:8791').replace(/^http/,'ws'),peers=[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){const end=Date.now()+18000;while(!fn()){if(Date.now()>end)throw Error('Timed out');await sleep(25)}return fn()}
async function join(mode,room,id){const ws=new WebSocket(`${base}/api/${mode}/${room}`),p={id,ws,messages:[],board:null};peers.push(p);ws.onmessage=e=>{const d=JSON.parse(e.data);p.messages.push(d);if(['duel','objective','bomb'].includes(d.type))p.board=d};await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});ws.send(JSON.stringify({type:'join',id,name:id,preset:'duoOpposite'}));await until(()=>p.board||p.messages.some(m=>m.type==='welcome'));return p}
const send=(p,d)=>p.ws.send(JSON.stringify({...d,round:p.board?.round??0}));
try{
 for(const mode of ['room','duel','ctf','bomb']){
  const room=Array.from(crypto.getRandomValues(new Uint8Array(6)),(n,i)=>i%2?String(n%10):String.fromCharCode(65+n%26)).join('');
  const a=await join(mode,room,mode+'-a'),b=await join(mode,room,mode+'-b');
  if(mode==='duel'||mode==='bomb'){send(a,{type:'ready',weapon:null});send(b,{type:'ready',weapon:null})}
  if(mode!=='room')await until(()=>a.board?.phase==='running'&&b.board?.phase==='running');
  send(a,{type:'shot',target:b.id,damage:100,zone:'head',weapon:'revolver',hitPoint:[0,1.95,0]});
  const hit=await until(()=>b.messages.find(m=>m.type==='shot'));
  send(a,{type:'damageAck',shotId:hit.shotId,damage:64});await sleep(100);assert(!a.messages.some(m=>m.type==='damageResult'));
  send(b,{type:'damageAck',shotId:hit.shotId,damage:64});const result=await until(()=>a.messages.find(m=>m.type==='damageResult'));assert.equal(result.damage,64);assert.equal(result.target,a.id);
  send(b,{type:'damageAck',shotId:hit.shotId,damage:64});await sleep(100);assert.equal(a.messages.filter(m=>m.type==='damageResult').length,1);
  console.log('PASS live damage receipt:',mode,'100 raw → 64 settled; wrong victim/duplicate rejected');
 }
}finally{for(const p of peers){if(p.ws.readyState===1){send(p,{type:'leave'});p.ws.close()}}}
