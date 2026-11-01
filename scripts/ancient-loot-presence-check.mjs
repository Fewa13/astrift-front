// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
import {build} from 'esbuild';
const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows}}};
const output=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']}),module={exports:{}},sockets=[];
const ctx={storage:{sql,setAlarm:async()=>{},transactionSync:f=>f()},getWebSockets:()=>sockets};
const testMath=Object.assign(Object.create(Math),{random:()=>0});
vm.runInNewContext(output.outputFiles[0].text,{module,exports:module.exports,Date,crypto,Math:testMath,structuredClone,require:()=>({DurableObject:class{constructor(ctx,env){this.ctx=ctx;this.env=env}}})});
const env={PLAYER_ACCOUNTS:{getByName:()=>({validate:async()=>false})}},server=new module.exports.AncientWorld(ctx,env),actors=[];
for(const name of ['top','finisher','partyonly']){const p=server.read(name);p.level=80;server.save(name,p);const a={name,connectionId:name+'-connection',map:'tribe',tribeLayout:2,x:0,z:50,y:1.7,yaw:0,hp:100000,maxHp:100000,seen:Date.now(),weapon:p.weapons[0],lastShot:0,reloadAt:0,deadAt:0};actors.push(a);let state=a;sockets.push({readyState:1,messages:[],deserializeAttachment:()=>structuredClone(state),serializeAttachment:a=>state=structuredClone(a),send(s){this.messages.push(JSON.parse(s))},close(){this.readyState=2}});}
const shared=[];server.sharePartyRewards=(...args)=>shared.push(args);
const books=p=>Object.entries(p.materials).filter(([k])=>k.startsWith('skillbook:')).reduce((n,[,v])=>n+v,0);
for(const kind of ['chief','lord','rootwarden','crystal_metal','crystal_earth','oathknight','emptyking','blight_lord','immaculate_judge']){
 const before=actors.map(a=>server.read(a.name)),m={id:kind,kind,level:30,hp:100,maxHp:100,x:0,z:55,region:0,homeX:0,homeZ:55,action:'idle',attackAt:0,respawnAt:0,target:''};
 server.damageMonster(sockets[0],actors[0],m,80,'body','@pet:top','summon');server.damageMonster(sockets[1],actors[1],m,10000);
 const after=actors.map(a=>server.read(a.name));assert.equal(books(after[0])-books(before[0]),1,'top contributor gets the guaranteed book');assert.equal(books(after[1])-books(before[1]),0,'last hit cannot steal book');assert.equal(after[0].gear.length-before[0].gear.length,2,'forced equipment drops all go to top contributor');assert.equal(after[1].gear.length-before[1].gear.length,0);
 const shares=shared.splice(0);assert(shares.every(args=>!Object.keys(args[3]).some(k=>k.startsWith('skillbook:'))&&args[4].length===0),'no party duplication of boss book/equipment');assert(shares.every(args=>args[1]>0&&args[2]>0),'XP/gold sharing retained');
}
testMath.random=Math.random;
const live=sockets[0],hp=live.deserializeAttachment().hp;
await server.command('top','leaveWorld',{connectionId:'stale-old-connection'});assert(live.deserializeAttachment(),'late old-page beacon cannot remove a new connection');
await server.webSocketMessage(live,JSON.stringify({type:'leave'}));assert.equal(live.deserializeAttachment(),null);assert(!server.connections().includes(live));
await server.tickMap('tribe');assert.equal(db.prepare('SELECT hp FROM ancient_health WHERE name=?').get('top').hp,hp,'retired player no longer takes monster damage');assert(!sockets[1].messages.findLast(m=>m.type==='state').players.some(p=>p.name==='top'));
await server.webSocketMessage(sockets[1],JSON.stringify({type:'heartbeat',token:'expired',device:'old-device'}));assert.equal(sockets[1].deserializeAttachment(),null,'expired session retired on heartbeat');assert(sockets[1].messages.some(m=>m.type==='sessionEnded'));
await server.disconnect('partyonly');assert.equal(sockets[2].deserializeAttachment(),null,'account logout can remove the character immediately');
db.close();console.log('PASS: all nine boss categories award books/equipment to top actual-damage contributor, pet credit, unchanged XP/gold sharing, no party duplicates, scoped page-exit beacons, immediate leave/logout and invalid-session removal.');
