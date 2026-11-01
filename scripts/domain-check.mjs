// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {once} from 'node:events';
import WebSocket from 'ws';
for(const file of ['../astrift-hub/public/index.html','../homework-ai/public/index.html','public/index.html']){
  const html=fs.readFileSync(file,'utf8'),script=html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/);
  assert.ok(script,'First inline script required: '+file);
  assert.ok(!/<link\b|<script\b[^>]*\bsrc=/.test(html.slice(0,script.index)),'Exit guard must precede external resources');
  const listeners=[];vm.runInNewContext(script[1],{window:{addEventListener:(name,callback)=>listeners.push([name,callback])}});
  assert.equal(listeners[0][0],'beforeunload');let prevented=false;const event={preventDefault(){prevented=true}};listeners[0][1](event);assert.equal(prevented,true);assert.equal(event.returnValue,true);
}
const hub=fs.readFileSync('../astrift-hub/public/index.html','utf8');assert.match(hub,/href="https:\/\/ai.astrift.com"/);assert.match(hub,/href="https:\/\/play.astrift.com"/);
const config=fs.readFileSync('wrangler.jsonc','utf8');assert.match(config,/"pattern": "play.astrift.com", "custom_domain": true/);assert.match(config,/"workers_dev": true/);assert.match(config,/"name": "astrift-front"/);
console.log('PASS: all three exit guards register before resources; exact navigation URLs; game keeps the same Worker and workers.dev address.');
if(process.argv.includes('--live')){
  const old='https://astrift-front.fewa3729.workers.dev',play='https://play.astrift.com';
  const [oldHtml,newHtml]=await Promise.all([old,play].map(async origin=>{const response=await fetch(origin);assert.equal(response.status,200);return response.text()}));assert.equal(oldHtml,newHtml,'Both domains must serve the same frontend');
  const cors=await fetch(old+'/api/account/profile',{method:'OPTIONS',headers:{Origin:play,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'Content-Type'}});assert.equal(cors.status,204);assert.equal(cors.headers.get('access-control-allow-origin'),play);
  const denied=await fetch(old+'/api/account/profile',{method:'POST',headers:{Origin:'https://untrusted.invalid','Content-Type':'application/json'},body:'{}'});assert.equal(denied.status,403,'Do not loosen origin checks');
  function code(){const l='ABCDEFGHJKLMNPQRSTUVWXYZ',d='23456789';return [...randomBytes(6)].map((v,i)=>i%2?d[v%d.length]:l[v%l.length]).join('')}
  function wait(peer,predicate){const found=peer.messages.findLast(predicate);if(found)return Promise.resolve(found);return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{peer.socket.off('parsed',onMessage);reject(Error('Timed out: '+peer.id))},10000);function onMessage(data){if(predicate(data)){clearTimeout(timeout);peer.socket.off('parsed',onMessage);resolve(data)}}peer.socket.on('parsed',onMessage)})}
  async function connect(origin,mode,room,id){const socket=new WebSocket(origin.replace('https:','wss:')+'/api/'+mode+'/'+room,{headers:{Origin:origin}}),peer={socket,id,messages:[]};socket.on('message',raw=>{const d=JSON.parse(String(raw));peer.messages.push(d);socket.emit('parsed',d)});await once(socket,'open');socket.send(JSON.stringify({type:'join',id,name:id}));await wait(peer,d=>mode==='room'?d.type==='welcome':d.type==='duel'&&d.players.some(p=>p.id===id));return peer}
  for(const mode of ['room','duel']){const peers=[];let round;try{const room=code(),a=await connect(play,mode,room,'Domain-A');peers.push(a);const b=await connect(old,mode,room,'Domain-B');peers.push(b);
    if(mode==='duel'){const roster=await wait(a,d=>d.type==='duel'&&d.players.length===2);assert.equal(roster.players.find(p=>p.id===b.id).team,1);for(const p of peers)p.socket.send(JSON.stringify({type:'ready',round:roster.round}));round=(await wait(b,d=>d.type==='duel'&&d.phase==='running')).round}
    else{const roster=await wait(b,d=>d.type==='roster');assert.ok(roster.players.includes(a.id))}
    a.socket.send(JSON.stringify({type:'state',round,position:[12,1.7,15],rotation:0,hp:100}));const position=await wait(b,d=>d.type==='state'&&d.id===a.id);assert.deepEqual(position.position,[12,1.7,15]);
    b.socket.send(JSON.stringify({type:'state',round,position:[-12,1.7,-15],rotation:1,hp:100}));const back=await wait(a,d=>d.type==='state'&&d.id===b.id);assert.deepEqual(back.position,[-12,1.7,-15]);console.log('PASS: '+mode+' cross-domain room membership and bidirectional player position synchronization');
  }finally{for(const peer of peers){peer.socket.send(JSON.stringify({type:'leave'}));peer.socket.close()}}}
  console.log('PASS: same HTML on both hosts; custom-domain CORS permitted; untrusted origins still denied.');
}
