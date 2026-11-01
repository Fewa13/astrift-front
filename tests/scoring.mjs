import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { DatabaseSync } from 'node:sqlite';
import { stripTypeScriptTypes } from 'node:module';

const db = new DatabaseSync(':memory:');
const sockets = [];
const ctx = { getWebSockets: () => sockets, storage: { sql: { exec(query, ...args) {
  const stmt = db.prepare(query);
  const rows = stmt.columns().length ? stmt.all(...args) : (stmt.run(...args), []);
  return { toArray: () => rows, one: () => { assert.equal(rows.length, 1); return rows[0]; } };
} } } };
const source = fs.readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8').replace("export { ObjectiveRoom } from './objective-room';",'');
const compiled = stripTypeScriptTypes(source.replace('import { DuelRoomEngine } from "./duel-room";','').replace('import { DurableObject } from "cloudflare:workers";', 'class DurableObject { constructor(ctx) { this.ctx=ctx; } }').replace('export class GameRoom','class GameRoom').replace('export default {','const worker = {'))+'\nexports.GameRoom=GameRoom;';
const sandbox = {exports:{},crypto,Date};
vm.runInNewContext(compiled, sandbox);
let room = new sandbox.exports.GameRoom(ctx, {});
function send(socket, data) { room.webSocketMessage(socket, JSON.stringify(data)); }
function join(id, reconnect=false) {
  const s = { a:{}, messages:[], serializeAttachment(a){this.a=a;}, deserializeAttachment(){return this.a;}, send(x){this.messages.push(JSON.parse(x));},close(){} };
  sockets.push(s);send(s,{type:'join',id,name:id,reconnect});return s;
}
const blue=join('blue'),red=join('red');
const board=s=>s.messages.filter(m=>m.type==='scoreboard').at(-1);
const shoot=()=>{send(blue,{type:'shot',target:'red',damage:100});return red.messages.filter(m=>m.type==='shot').at(-1).shotId;};
assert.equal(blue.a.team,0);assert.equal(red.a.team,1);
const hit=shoot();
assert.equal(board(blue).blue,0,'a hit alone must not score');
send(red,{type:'death',shotId:'unknown'});assert.equal(board(blue).blue,0);
send(red,{type:'death',shotId:hit});send(red,{type:'death',shotId:hit});
assert.equal(board(blue).blue,1);assert.equal(board(red).blue,1);
assert.equal(blue.messages.filter(m=>m.kill).length,1,'duplicate death must not repeat kill feed');
send(red,{type:'state',hp:100});
assert.equal(db.prepare('SELECT dead FROM combatants WHERE id=?').get('red').dead,1,'early stale state must not revive');
const replacement=join('blue',true);
assert.equal(board(replacement).blue,1);
assert.equal(blue.a.id,'','superseded connection must be invalidated');
room.webSocketClose(blue);
assert.equal(red.messages.filter(m=>m.type==='leave'&&m.id==='blue').length,0);
send(replacement,{type:'state',hp:100});assert.equal(red.messages.at(-1).type,'state');
room=new sandbox.exports.GameRoom(ctx,{});
const late=join('late');assert.equal(board(late).blue,1,'late join and object recreation restore score');
db.prepare('UPDATE combatants SET diedAt=0 WHERE id=?').run('red');send(red,{type:'state',hp:100});
send(red,{type:'death',shotId:hit});assert.equal(board(red).blue,1,'old hit cannot score after respawn');
for(let i=1;i<35;i++) {
  send(replacement,{type:'shot',target:'red',damage:100});
  const shotId=red.messages.filter(m=>m.type==='shot').at(-1).shotId;
  send(red,{type:'death',shotId});
  db.prepare('UPDATE combatants SET diedAt=0 WHERE id=?').run('red');send(red,{type:'state',hp:100});
}
assert.equal(board(red).blue,35);assert.equal(board(red).winner,null);
const shots=red.messages.filter(m=>m.type==='shot').length;
send(replacement,{type:'shot',target:'red',damage:100});assert.equal(red.messages.filter(m=>m.type==='shot').length,shots+1);
const beyond=join('beyond',true);assert.equal(board(beyond).blue,35);assert.equal(board(beyond).winner,null);
console.log('PASS server: 35 kills with continued shooting/respawns/scoring; reconnect and late join above 20; duplicate suppression');

const game=fs.readFileSync(new URL('../public/game.js',import.meta.url),'utf8');
const names=['isObjectiveMode','applyScoreboard','awardKill','botDown'];
const functions=names.map(name=>game.split('\n').find(l=>l.startsWith(`function ${name}(`))).join('\n');
const elements=new Map();const feed=[];
const client={console,performance,objectiveState:null,roomMode:'normal',playerId:'test-player',showKillToast(){},clearInterval(){},setTimeout(){},document:{pointerLockElement:null},canvas:{},$:id=>{if(!elements.has(id))elements.set(id,{querySelector(){return this;},value:'Player'});return elements.get(id);},feed:s=>feed.push(s)};
vm.createContext(client);
vm.runInContext('let matchFinished=false,paused=false,firing=false,adsMouse=false,adsKey=false,respawnTimer=null,online=false,score=0,redScore=0,scoreRevision=-1,playing=true;const seenKills=new Set(),remotes=new Map(),bots=[];'+functions,client);
vm.runInContext('const bot={userData:{team:1,name:"Enemy"},visible:true};botDown(bot);botDown(bot);',client);
assert.equal(feed.length,1);assert.equal(elements.get('blueScore').textContent,1);
vm.runInContext('awardKill(1,"Red AI","Blue AI")',client);assert.equal(elements.get('redScore').textContent,1);
vm.runInContext('online=true;const snapshot={blue:3,red:2,revision:5,winner:null,kill:{id:"unique",killer:"A",victim:"B"}};applyScoreboard(snapshot);applyScoreboard(snapshot);applyScoreboard({...snapshot,blue:0,revision:4});',client);
assert.equal(feed.length,3);assert.equal(elements.get('blueScore').textContent,3);
vm.runInContext('applyScoreboard({blue:20,red:2,revision:22,winner:0})',client);
assert.equal(vm.runInContext('matchFinished||paused',client),false,'even legacy winner packets must not end ordinary rooms');
vm.runInContext('online=false;score=redScore=19;for(let i=0;i<16;i++){awardKill(0,"Blue","Red");awardKill(1,"Red","Blue")}',client);
assert.equal(elements.get('blueScore').textContent,35);assert.equal(elements.get('redScore').textContent,35);
assert.equal(vm.runInContext('matchFinished||paused',client),false,'solo AI must continue beyond 20 on both teams');
assert.ok(!game.includes('finishMatch('));assert.ok(!game.includes('先到 20 击杀'));
console.log('PASS client: solo AI both teams reach 35 without ending; normal scoreboard never ends game; duplicate/outdated snapshots');
