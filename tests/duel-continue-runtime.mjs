import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';

// Shorten ONLY this in-memory test bundle. Production source stays at ten minutes.
const bundle=await build({entryPoints:['src/index.ts'],bundle:true,write:false,format:'esm',platform:'browser',external:['cloudflare:workers'],plugins:[{name:'test-clock',setup(b){b.onLoad({filter:/duel-room\.ts$/},({path})=>({contents:fs.readFileSync(path,'utf8').replace('const ROUND_MS = 10 * 60 * 1000;','const ROUND_MS = 1000;'),loader:'ts'}));}}]});
const mf=new Miniflare(convertV4MiniflareOptions({name:'duel-test',modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-09-02',compatibilityFlags:['nodejs_compat'],durableObjects:{GAME_ROOMS:{className:'GameRoom',useSQLite:true}}}));
const peers=[];
async function until(check,timeout=10000){const end=Date.now()+timeout;while(!check()){if(Date.now()>end)throw Error('Timed out');await new Promise(r=>setTimeout(r,20));}return check();}
async function join(id){const response=await mf.dispatchFetch('http://local/api/duel/T1E2S3',{headers:{Upgrade:'websocket'}});const ws=response.webSocket;assert.ok(ws);ws.accept();const p={ws,board:null};peers.push(p);ws.addEventListener('message',e=>{const d=JSON.parse(e.data);if(d.type==='duel')p.board=d;});ws.send(JSON.stringify({type:'join',id,name:id}));await until(()=>p.board);return p;}
const send=(p,type)=>p.ws.send(JSON.stringify({type,round:p.board.round}));
try{
  const a=await join('a'),b=await join('b'),c=await join('c');
  send(a,'ready');send(b,'ready');await until(()=>c.board.phase==='running');
  await until(()=>c.board.phase==='finished');
  assert.ok(c.board.autoContinueAt-c.board.serverNow>=4900&&c.board.autoContinueAt-c.board.serverNow<=5000);
  const seats=c.board.players.map(p=>[p.id,p.team]),round=c.board.round;
  await new Promise(r=>setTimeout(r,4500));
  assert.equal(c.board.phase,'finished','must not skip choice window');
  await until(()=>c.board.phase==='running');
  assert.equal(c.board.round,round+1);assert.deepEqual(c.board.players.map(p=>[p.id,p.team]),seats);
  assert.equal(c.board.blue,0);assert.equal(c.board.red,0);
  console.log('PASS real Workers alarm: 5-second automatic restart, same fighters and spectator, reset scores, no ready clicks needed');
}finally{for(const p of peers){send(p,'leave');p.ws.close();}await mf.dispose();}
