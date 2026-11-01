import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
const rules=await build({entryPoints:['src/survival-ranking-rules.ts'],write:false,format:'esm'});
const r=await import('data:text/javascript;base64,'+Buffer.from(rules.outputFiles[0].text).toString('base64'));
const boundary=Date.UTC(2026,9,6,16);
assert.equal(r.towerWeekStart(boundary),boundary);
assert.equal(r.towerWeekStart(boundary-1),boundary-r.TOWER_WEEK_MS);
assert.equal(r.towerWeekStart(boundary+r.TOWER_WEEK_MS),boundary+r.TOWER_WEEK_MS);
const members=[{account:'alice',name:'Alice'},{account:'bob',name:'Bob'}];
assert.equal(r.towerTeamKey(members),r.towerTeamKey([...members].reverse()));
const now=Date.now();
const result=(elapsedMs=2000,m=members)=>({runId:crypto.randomUUID(),startedAt:now-10000,finishedAt:now,elapsedMs,members:m});
assert(r.validTowerResult(result(),now));
assert(!r.validTowerResult(result(999),now));
assert(!r.validTowerResult(result(50000),now));
assert(!r.validTowerResult(result(2000,[members[0],members[0]]),now));
const bundle=await build({stdin:{resolveDir:process.cwd(),contents:`
import {SurvivalLeaderboard} from './src/survival-leaderboard';
import {PlayerAccount} from './src/player-account';
import {AccountSessionRegistry} from './src/account-session-registry';
import {SurvivalRoomEngine} from './src/survival-room';
import {DurableObject} from 'cloudflare:workers';
export {AccountSessionRegistry};
export class TestRoom extends DurableObject {
 constructor(ctx,env){super(ctx,env);this.engine=new SurvivalRoomEngine(ctx,env)}
 fetch(request){return this.engine.fetch(new URL(request.url).pathname.includes('solo-'))}
 webSocketMessage(ws,message){return this.engine.message(ws,message)}
 webSocketClose(ws){return this.engine.close(ws)}
 alarm(){return this.engine.alarm()}
 finish(){this.engine.state.status='finished';this.engine.state.towerHp=0;return this.engine.alarm()}
}
export class TestBoard extends SurvivalLeaderboard {
 seed(week,team,members,elapsed,completed){this.ctx.storage.sql.exec('INSERT INTO tower_entries VALUES(?,?,?,?,?,?)',week,team,JSON.stringify(members),elapsed,completed,crypto.randomUUID())}
}
export class TestAccount extends PlayerAccount {
 seed(name){this.ctx.storage.sql.exec('INSERT INTO account(id,name,salt,password_hash,snapshot) VALUES(1,?,?,?,?)',name,'salt','hash','{}')}
 inspect(){return this.profile(this.row())}
 expire(){this.ctx.storage.sql.exec('UPDATE timed_skin_rewards SET expires=?',Date.now()-1)}
 token(device){return this.session(device)}
}
export default {fetch(request,env){return env.GAME_ROOMS.getByName(new URL(request.url).pathname).fetch(request)}};
`},bundle:true,write:false,format:'esm',platform:'browser',external:['cloudflare:workers']});
const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-09-02',compatibilityFlags:['nodejs_compat'],durableObjects:{SURVIVAL_LEADERBOARD:{className:'TestBoard',useSQLite:true},PLAYER_ACCOUNTS:{className:'TestAccount',useSQLite:true},ACCOUNT_SESSIONS:{className:'AccountSessionRegistry',useSQLite:true},GAME_ROOMS:{className:'TestRoom',useSQLite:true}}}));
try{
 const ns=await mf.getDurableObjectNamespace('SURVIVAL_LEADERBOARD'),board=ns.get(ns.idFromName('tower-weekly-v1'));
 const accounts=await mf.getDurableObjectNamespace('PLAYER_ACCOUNTS');
 const alice=accounts.get(accounts.idFromName('account:alice')),bob=accounts.get(accounts.idFromName('account:bob'));
 await alice.seed('Alice');await bob.seed('Bob');
 const run=result();assert.equal((await board.record(run)).ok,true);
 assert.equal((await board.record(run)).duplicate,true);
 await board.record(result(1500,[...members].reverse()));
 assert.equal((await board.board()).entries.length,1);
 assert.equal((await board.board()).entries[0].elapsedMs,2000);
 await board.record(result(5000));
 await board.record(result(3000,[{account:'charlie',name:'Charlie'}]));
 let current=await board.board();assert.deepEqual(current.entries.map(e=>e.elapsedMs),[5000,3000]);
 assert.deepEqual(current.entries[0].names,['Alice','Bob']);
 assert.equal((await board.record(result(50000))).ok,false);
 const lastWeek=r.towerWeekStart(Date.now())-r.TOWER_WEEK_MS;
 await board.seed(lastWeek,'alice|bob',members,90000,lastWeek+100000);
 await board.seed(lastWeek,'other',[{account:'other',name:'Other'}],90000,lastWeek+100001);
 current=await board.board();assert.deepEqual(current.champion.names,['Alice','Bob']);
 const reward=(await alice.inspect()).timedSkins[0];
 assert.equal(reward.skinId,'weekly-tower-king');assert.equal(reward.expiresAt,lastWeek+2*r.TOWER_WEEK_MS);
 assert.equal((await bob.inspect()).timedSkins[0].expiresAt,reward.expiresAt);
 await board.board();assert.equal((await alice.inspect()).timedSkins.length,1);
 assert.equal((await alice.inspect()).timedSkins[0].expiresAt,reward.expiresAt);
 await alice.grantTowerReward(lastWeek-r.TOWER_WEEK_MS,lastWeek+r.TOWER_WEEK_MS);
 assert.equal((await alice.inspect()).timedSkins[0].expiresAt,reward.expiresAt);
 assert.equal(await alice.grantTowerReward(lastWeek,reward.expiresAt+1),null);
 await alice.expire();assert.equal((await alice.inspect()).timedSkins.length,0);
 const device=crypto.randomUUID(),token=await alice.token(device),peers=[];
 async function until(check){const end=Date.now()+5000;while(!check()){if(Date.now()>end)throw Error('Socket timeout');await new Promise(r=>setTimeout(r,20))}return check()}
 async function join(path,id,auth){const response=await mf.dispatchFetch('http://local'+path,{headers:{Upgrade:'websocket'}}),ws=response.webSocket;ws.accept();const p={ws,last:null,error:null};peers.push(p);ws.addEventListener('message',e=>{const d=JSON.parse(e.data);if(d.type==='survivalState')p.last=d;if(d.type==='full')p.error=d});ws.send(JSON.stringify({type:'join',id,name:'Alice',...auth}));await until(()=>p.last||p.error);return p}
 const path='/api/survival/solo-'+crypto.randomUUID(),single=await join(path,'solo-player',{account:'alice',token,device});
 assert.equal(single.last.state.status,'running');assert.equal(single.last.ranked,true);assert.equal(single.last.solo,true);
 const rejected=await join(path,'intruder',{});assert(rejected.error);
 await until(()=>single.last.state.elapsed>=1200);
 single.ws.send(JSON.stringify({type:'survivalPause',paused:true}));await new Promise(r=>setTimeout(r,250));const pausedTime=single.last.state.elapsed;
 await new Promise(r=>setTimeout(r,350));assert.equal(single.last.state.elapsed,pausedTime);
 single.ws.send(JSON.stringify({type:'survivalPause',paused:false}));await until(()=>single.last.state.elapsed>pausedTime);
 const rooms=await mf.getDurableObjectNamespace('GAME_ROOMS'),room=rooms.get(rooms.idFromName(path));await room.finish();
 await until(()=>single.last.state.status==='finished');
 const ranked=await board.board();assert.equal(ranked.entries.filter(e=>e.names.length===1&&e.names[0]==='Alice').length,1);
 const oldRound=single.last.state.round;single.ws.send(JSON.stringify({type:'survivalRestart'}));await until(()=>single.last.state.round===oldRound+1);assert.equal(single.last.state.status,'running');
 const duoPath='/api/survival/A1B2C3',a=await join(duoPath,'duo-a',{account:'alice',token,device});assert.equal(a.last.state.status,'waiting');
 const b=await join(duoPath,'duo-b',{});a.ws.send(JSON.stringify({type:'survivalReady',ready:true}));await new Promise(r=>setTimeout(r,80));assert.equal(a.last.state.status,'waiting');b.ws.send(JSON.stringify({type:'survivalReady',ready:true}));await until(()=>a.last.state.status==='running');assert.equal(a.last.ranked,false);
 for(const peer of peers)try{peer.ws.close()}catch{}
 console.log('PASS weekly boundaries, best team scores, ordering/ties, replay protection, duo awards, fixed 7-day expiry, expired entitlement removal');
 console.log('PASS authenticated solo WebSocket timing/reporting, pause/resume/restart, guest rejection, duo ready gate, guests cannot rank');
}finally{await mf.dispose()}
