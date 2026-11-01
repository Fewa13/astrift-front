import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import {stripTypeScriptTypes} from 'node:module';
let now=1_000_000,alarmAt=0;
const db=new DatabaseSync(':memory:'),sockets=[];
const sql={exec(query,...args){const statement=db.prepare(query),rows=statement.columns().length?statement.all(...args):(statement.run(...args),[]);return{one:()=>{assert.equal(rows.length,1);return rows[0]},toArray:()=>rows}}};
const ctx={storage:{sql,setAlarm:async n=>{alarmAt=n},deleteAlarm:async()=>{alarmAt=0}},getWebSockets:()=>sockets,waitUntil(p){p.catch(e=>{throw e})}};
const sandbox={exports:{},crypto,Date:class extends Date{static now(){return now}}};
const source=fs.readFileSync(new URL('../src/duel-room.ts',import.meta.url),'utf8');
vm.runInNewContext(stripTypeScriptTypes(source.replace('export class DuelRoomEngine','class DuelRoomEngine'),{mode:'transform'})+'\nexports.Engine=DuelRoomEngine;',sandbox);
let engine=new sandbox.exports.Engine(ctx);
function send(s,data){engine.message(s,JSON.stringify({...data,round:data.round??match().round}));}
function join(id){const s={a:{duel:true,id:'',session:''},messages:[],serializeAttachment(a){this.a=a},deserializeAttachment(){return this.a},send(x){this.messages.push(JSON.parse(x))},close(){this.closed=true}};sockets.push(s);send(s,{type:'join',id,name:id});return s;}
const match=()=>sql.exec('SELECT * FROM duel_match').one();
const person=id=>sql.exec('SELECT * FROM duel_people WHERE id=?',id).toArray()[0];
const shot=(attacker,victim)=>{send(attacker,{type:'shot',target:victim.a.id,damage:100});return victim.messages.filter(m=>m.type==='shot').at(-1)};
const a=join('a'),b=join('b'),c=join('c'),d=join('d');
assert.equal(person('a').team,0);assert.equal(person('b').team,1);assert.equal(person('c').team,-1);assert.equal(person('d').team,-1);
assert.equal(match().phase,'waiting');send(a,{type:'ready'});assert.equal(match().phase,'waiting');send(b,{type:'ready'});
assert.equal(match().phase,'running');assert.equal(match().endsAt-now,600000);
const originalDeadline=match().endsAt;
send(c,{type:'state',position:[0,1,0],hp:100});assert.equal(person('c').state,'');
const count=b.messages.filter(m=>m.type==='shot').length;send(c,{type:'shot',target:'b',damage:100});assert.equal(b.messages.filter(m=>m.type==='shot').length,count);
send(a,{type:'shot',target:'c',damage:100});assert.equal(sql.exec('SELECT * FROM duel_hits').toArray().length,0);
const hit=shot(a,b);send(b,{type:'death',shotId:hit.shotId});send(b,{type:'death',shotId:hit.shotId});assert.equal(match().blue,1);assert.equal(a.messages.filter(m=>m.kill).length,1);
// No 20-point cap exists in duel mode; only the authoritative deadline ends it.
sql.exec('UPDATE duel_match SET blue=24');assert.equal(match().phase,'running');
engine.close(b);assert.equal(person('b').connected,0);assert.equal(person('c').team,-1);assert.ok(alarmAt<=now+10000);
now+=5000;const rejoined=join('b');assert.equal(person('b').team,1);assert.equal(match().endsAt,originalDeadline);
engine.close(b);assert.equal(person('b').connected,1,'obsolete socket cannot disconnect a rejoined player');
send(rejoined,{type:'leave'});assert.equal(person('b'),undefined);
const promoted=[c,d].find(s=>person(s.a.id)?.team===1),watcher=[c,d].find(s=>person(s.a.id)?.team===-1);
assert.ok(promoted);assert.ok(watcher);assert.equal(match().blue,24);assert.equal(match().endsAt,originalDeadline);
engine.close(a);now+=10001;engine.alarm();assert.equal(person(watcher.a.id).team,0,'disconnect grace expiry randomly fills the free seat');
assert.equal(sql.exec('SELECT * FROM duel_people WHERE team>=0').toArray().length,2);
engine=new sandbox.exports.Engine(ctx);assert.equal(match().endsAt,originalDeadline,'object recreation preserves deadline');
now=originalDeadline;sql.exec('UPDATE duel_people SET lastSeen=?',now);engine.alarm();
assert.equal(match().phase,'finished');assert.equal(promoted.messages.filter(m=>m.type==='duel').at(-1).winner,0);
const finishedBlue=match().blue;send(watcher,{type:'shot',target:promoted.a.id,damage:100});send(promoted,{type:'death',shotId:hit.shotId});assert.equal(match().blue,finishedBlue);
const oldRound=match().round;send(promoted,{type:'ready'});assert.equal(match().phase,'finished');send(watcher,{type:'ready'});
assert.equal(match().phase,'running');assert.equal(match().round,oldRound+1);assert.equal(match().blue,0);assert.equal(match().red,0);assert.equal(match().endsAt-now,600000);
send(watcher,{type:'shot',target:promoted.a.id,damage:100,round:oldRound});assert.equal(sql.exec('SELECT * FROM duel_hits').toArray().length,0);
now=match().endsAt;sql.exec('UPDATE duel_people SET lastSeen=?',now);engine.alarm();assert.equal(promoted.messages.filter(m=>m.type==='duel').at(-1).winner,-1,'ties are draws');
const observer=join('observer');send(observer,{type:'ready'});send(promoted,{type:'leave'});assert.equal(person('observer').team,1);
assert.equal(match().phase,'finished','one ready replacement cannot restart without the other team');
send(watcher,{type:'ready'});assert.equal(match().phase,'running');
console.log('PASS duel: 2 fighters + spectators; spectator isolation; 10-minute deadline; >20 kills; duplicate deaths; reconnect grace; random promotion; persistence; victory/draw; continue/exit; stale-round isolation');

// Expiration alone continues with the same fighters, teams and spectator seats.
const bench=join('bench');
const seats=()=>sql.exec('SELECT id,team FROM duel_people ORDER BY id').toArray();
const beforeSeats=seats(),beforeRound=match().round;
now=match().endsAt;sql.exec('UPDATE duel_people SET lastSeen=?',now);engine.alarm();
assert.equal(match().phase,'finished');assert.equal(alarmAt,now+5000);
now+=4999;engine.alarm();assert.equal(match().phase,'finished','full five-second choice window');
engine=new sandbox.exports.Engine(ctx);now++;engine.alarm();
assert.equal(match().phase,'running');assert.equal(match().round,beforeRound+1);
assert.equal(match().endsAt-now,600000);assert.deepEqual(seats(),beforeSeats);
engine.alarm();assert.equal(match().round,beforeRound+1,'alarm retry does not start another round');
// One manual choice plus the other timeout also keeps both fighters.
now=match().endsAt;sql.exec('UPDATE duel_people SET lastSeen=?',now);engine.alarm();
send(watcher,{type:'ready'});now+=5000;engine.alarm();
assert.equal(match().phase,'running');assert.deepEqual(seats(),beforeSeats);
// A reconnecting fighter keeps the seat even when the choice window expires.
now=match().endsAt;sql.exec('UPDATE duel_people SET lastSeen=?',now);engine.alarm();
engine.close(observer);now+=5000;engine.alarm();
assert.equal(match().phase,'finished');assert.equal(person('observer').team,1);assert.equal(person('bench').team,-1);
const observerAgain=join('observer');assert.equal(match().phase,'running');assert.deepEqual(seats(),beforeSeats);
// An explicit exit is honored; only that vacated seat can be filled.
now=match().endsAt;sql.exec('UPDATE duel_people SET lastSeen=?',now);engine.alarm();
send(observerAgain,{type:'leave'});assert.equal(person('observer'),undefined);
now+=5000;engine.alarm();assert.equal(match().phase,'running');assert.equal(person('bench').team,1);
console.log('PASS 5-second auto-continue: exact deadline, same fighters/teams, observers stay observers, one/no choices, persistence, idempotence, reconnect reservation, explicit exit');

// Existing normal mode still has no timer, and all duel hooks are inactive there.
const game=fs.readFileSync(new URL('../public/game.js',import.meta.url),'utf8');
const hooks=['isObjectiveMode','duelBlocked','sendNetwork'].map(name=>game.split('\n').find(l=>l.startsWith(`function ${name}(`))).join('\n');
const sent=[],client={ws:{readyState:1,send:s=>sent.push(JSON.parse(s))},roomMode:'normal',spectator:true,duelState:{phase:'finished',round:9},pitch:1};
vm.runInNewContext(hooks+';if(duelBlocked())throw Error("normal mode gated");sendNetwork({type:"state",hp:100});',client);
assert.deepEqual(sent,[{type:'state',hp:100}]);
assert.ok(game.includes("function start(isOnline,mode='normal')")&&game.includes('$("solo").onclick=()=>{clearPracticeMode();start(false)}'),'normal solo entry uses normal default');
const html=fs.readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
assert.ok(!html.includes('推荐切磋'));
assert.ok(html.includes('id="duelReady"')&&html.includes('id="duelExit"'));
assert.ok(!fs.readFileSync(new URL('../public/duel.css',import.meta.url),'utf8').includes('[data-phase="finished"] .duelActions'));
const clockCode=game.split('\n').find(l=>l.startsWith('function updateDuelClock('));
const labels={};const clockClient={roomMode:'normal',duelState:{phase:'finished',endsAt:now,autoContinueAt:now+5000,blue:30,red:22},Date:{now:()=>now},duelClockOffset:0,setText:(id,text)=>labels[id]=text};
vm.runInNewContext(clockCode+';updateDuelClock()',clockClient);assert.deepEqual(labels,{});
clockClient.roomMode='duel';vm.runInNewContext('updateDuelClock()',clockClient);assert.ok(labels.duelStatus.includes('5 秒未选择自动继续'));assert.equal(labels.duelTimer,'00:00');
console.log('PASS ordinary/AI isolation: hooks disabled, wire message unchanged, solo always normal');
