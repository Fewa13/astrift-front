import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {build} from 'esbuild';
const compiled=await build({stdin:{resolveDir:process.cwd(),contents:"export {TournamentHub} from './src/tournament-hub';export {DuelRoomEngine} from './src/duel-room'"},bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'test-runtime',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'runtime',namespace:'test'}));b.onResolve({filter:/tournament-push$/},()=>({path:'push',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},a=>({contents:a.path==='runtime'?'export class DurableObject {constructor(ctx,env){this.ctx=ctx;this.env=env}}':'export const validSubscription=()=>false;export const sendTournamentPush=async()=>201',loader:'js'}))}}]});
const {TournamentHub,DuelRoomEngine}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const db=new DatabaseSync(':memory:');let alarm=null;const pending=[];
const ctx={storage:{sql:{exec(query,...args){const stmt=db.prepare(query),rows=stmt.columns().length?stmt.all(...args):(stmt.run(...args),[]);return {toArray:()=>rows,one:()=>{assert.equal(rows.length,1);return rows[0]}}}},getAlarm:async()=>alarm,setAlarm:async at=>{alarm=at},deleteAlarm:async()=>{alarm=null}},waitUntil:p=>pending.push(p)};
const original=Date.now;let now=Date.UTC(2026,9,6,12);Date.now=()=>now;
ctx.getWebSockets=()=>[];
try{
 const hub=new TournamentHub(ctx,{}),weekly=hub.list('alice').find(e=>e.kind==='warriorWeekly');assert.ok(weekly);assert.equal(weekly.weekly.attemptsLeft,3);
 hub.join(weekly.id,'alice','Alice');hub.join(weekly.id,'bob','Bob');hub.join(weekly.id,'carol','Carol');
 assert.equal(hub.weeklyBegin(weekly.id,'outsider').ok,false);
 let result=hub.weeklyBegin(weekly.id,'alice'),run=result.run;assert.equal(run.stage,1);assert.equal(hub.weeklyBegin(weekly.id,'alice').run.id,run.id);
 assert.equal(hub.weeklyStep(run.id,'bob',1,'kill').ok,false);
 assert.equal(hub.weeklyStep(run.id,'alice',2,'kill').ok,false);
 for(let i=1;i<=12;i++){now+=1000;result=hub.weeklyStep(run.id,'alice',i,'kill');assert.equal(result.ok,true);run=result.run}
 assert.equal(run.status,'finished');assert.equal(run.clears,3);assert.equal(run.kills,12);
 assert.equal(hub.weeklyStep(run.id,'alice',12,'kill').run.kills,12);
 for(let i=0;i<2;i++){const r=hub.weeklyBegin(weekly.id,'alice').run;assert.ok(r);hub.weeklyStop(r.id,'alice')}
 assert.equal(hub.weeklyBegin(weekly.id,'alice').ok,false);assert.equal(hub.list('alice').find(e=>e.id===weekly.id).weekly.attemptsLeft,0);
 now+=86400000;assert.equal(hub.weeklyBegin(weekly.id,'alice').ok,true);hub.weeklyStop(hub.list('alice').find(e=>e.id===weekly.id).weekly.activeRun.id,'alice');
 const b=hub.weeklyBegin(weekly.id,'bob').run;now+=1000;hub.weeklyStep(b.id,'bob',1,'kill');for(let i=2;i<=4;i++){now+=1000;result=hub.weeklyStep(b.id,'bob',i,'death')}assert.equal(result.run.status,'finished');assert.equal(result.run.deaths,3);
 const c=hub.weeklyBegin(weekly.id,'carol').run;now+=181000;assert.equal(hub.list('carol').find(e=>e.id===weekly.id).weekly.activeRun,null);assert.equal(hub.weeklyStop(c.id,'carol').run.elapsed,180000);
 now=weekly.weekly.endsAt;const ended=hub.list('alice').find(e=>e.id===weekly.id);assert.equal(ended.status,'finished');assert.equal(ended.mine.place,1);assert.equal(hub.reward(weekly.id,'bob').place,2);assert.equal(hub.reward(weekly.id,'carol'),null);assert.equal(hub.list().filter(e=>e.kind==='warriorWeekly').length,2);
 const a=hub.create('warrior','A','test','test'),other=hub.create('warrior','B','test','test');for(const id of [a.id,other.id]){hub.join(id,'alice','Alice');hub.join(id,'bob','Bob');await hub.start(id)}
 const ticket=hub.queue(a.id,'alice');assert.equal(ticket.status,'waiting');assert.equal(hub.queue(other.id,'alice').ok,false);const match=hub.queue(a.id,'bob');assert.equal(match.status,'matched');hub.markStarted(match.room);now+=170000;hub.touchMatch(match.room);now+=20000;assert.equal(hub.queueStatus(a.id,'alice',ticket.ticket).status,'matched');now+=181000;assert.equal(hub.queueStatus(a.id,'alice',ticket.ticket).ok,false);assert.equal(hub.roster(a.id).participants[0].lives,3);
 const first=hub.queue(a.id,'alice');const m=hub.queue(a.id,'bob');assert.equal(m.status,'matched');hub.recordOutcome(m.room,'alice','bob');hub.recordOutcome(m.room,'alice','bob');assert.equal(hub.roster(a.id).participants.find(p=>p.account==='bob').lives,2);
 assert.equal(hub.isParticipant(match.room,'alice'),false);await Promise.all(pending);assert.ok(alarm);
 hub.queue(a.id,'alice');const retry=hub.queue(a.id,'bob');let failures=1;
 const env={TOURNAMENTS:{getByName:()=>({markStarted:r=>hub.markStarted(r),abandon:r=>hub.abandon(r),recordOutcome:(...args)=>{if(failures--)throw Error('temporary RPC failure');return hub.recordOutcome(...args)}})}};
 const engine=new DuelRoomEngine(ctx,env,'tournament',retry.room);
 const addFighters=(connected=1)=>{ctx.storage.sql.exec('DELETE FROM duel_people');for(const [i,account] of ['alice','bob'].entries())ctx.storage.sql.exec('INSERT INTO duel_people(id,name,team,ready,connected,session,lastSeen,reconnectUntil,account_key) VALUES(?,?,?,0,?,?,?, ?,?)',account,account,i,connected,'test',now,now-1,account);ctx.storage.sql.exec("UPDATE duel_match SET phase='running' WHERE id=1")};
 addFighters();engine.finishRanked(0);await Promise.all(pending);assert.equal(ctx.storage.sql.exec('SELECT kind FROM duel_tournament_delivery').toArray().length,1);await engine.alarm();assert.equal(ctx.storage.sql.exec('SELECT kind FROM duel_tournament_delivery').toArray().length,0);assert.equal(hub.roster(a.id).participants.find(p=>p.account==='bob').lives,1);
 hub.queue(a.id,'alice');const empty=hub.queue(a.id,'bob');ctx.storage.sql.exec('UPDATE duel_rank_meta SET room=? WHERE id=1',empty.room.toLowerCase());hub.markStarted(empty.room);addFighters(0);await engine.alarm();assert.equal(hub.isParticipant(empty.room,'alice'),false);assert.equal(hub.roster(a.id).participants.find(p=>p.account==='bob').lives,1);await Promise.all(pending);
 console.log('Passed: weekly stages, retries, ownership, daily limits, best score, timeout, weekly settlement, rewards, concurrent queues, match lease, idempotent results.');
}finally{Date.now=original;db.close()}
