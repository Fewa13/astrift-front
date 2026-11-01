// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {DurableObject} from 'cloudflare:workers';
import {sendTournamentPush,validSubscription} from './tournament-push';
import {WarriorWeekly} from './warrior-weekly';

type EventRow={id:string;kind:string;name:string;description:string;details:string;status:string;created:number;started:number;finished:number};
type Participant={account:string;name:string;lives:number;eliminated_at:number;place:number;claimed:number;disqualified:number};
type Ticket={id:string;event_id:string;account:string;room:string;map:string;seen:number};
type Match={room:string;event_id:string;first_account:string;second_account:string;status:string;created:number;finished:number};
type QueueResult={ok:boolean;error?:string;ticket?:string;status?:'waiting'|'matched';room?:string;map?:string};
const MAPS=['crossroads','depot','arcade'];
const REWARDS:Record<number,{gun:string;knife:string}>={
  1:{gun:'event-warrior-gold',knife:'knife-event-warrior-gold'},
  2:{gun:'event-warrior-silver',knife:'knife-event-warrior-silver'},
  3:{gun:'event-warrior-bronze',knife:'knife-event-warrior-bronze'}
};

export class TournamentHub extends DurableObject<Env>{
  private weekly:WarriorWeekly;
  constructor(ctx:DurableObjectState,env:Env){
    super(ctx,env);
    const sql=ctx.storage.sql;
    sql.exec('CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY,kind TEXT NOT NULL,name TEXT NOT NULL,description TEXT NOT NULL,details TEXT NOT NULL,status TEXT NOT NULL,created INTEGER NOT NULL,started INTEGER NOT NULL DEFAULT 0,finished INTEGER NOT NULL DEFAULT 0)');
    sql.exec('CREATE TABLE IF NOT EXISTS participants (event_id TEXT NOT NULL,account TEXT NOT NULL,name TEXT NOT NULL,lives INTEGER NOT NULL DEFAULT 3,eliminated_at INTEGER NOT NULL DEFAULT 0,place INTEGER NOT NULL DEFAULT 0,claimed INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(event_id,account))');
    if(!sql.exec<{name:string}>('PRAGMA table_info(participants)').toArray().some(column=>column.name==='disqualified'))sql.exec('ALTER TABLE participants ADD COLUMN disqualified INTEGER NOT NULL DEFAULT 0');
    sql.exec('CREATE TABLE IF NOT EXISTS tickets (id TEXT PRIMARY KEY,event_id TEXT NOT NULL,account TEXT NOT NULL,room TEXT NOT NULL DEFAULT \'\',map TEXT NOT NULL DEFAULT \'\',seen INTEGER NOT NULL)');
    sql.exec('CREATE TABLE IF NOT EXISTS matches (room TEXT PRIMARY KEY,event_id TEXT NOT NULL,first_account TEXT NOT NULL,second_account TEXT NOT NULL,status TEXT NOT NULL,created INTEGER NOT NULL,finished INTEGER NOT NULL DEFAULT 0)');
    if(!sql.exec<{name:string}>('PRAGMA table_info(matches)').toArray().some(c=>c.name==='seen'))sql.exec('ALTER TABLE matches ADD COLUMN seen INTEGER NOT NULL DEFAULT 0');
    sql.exec('CREATE TABLE IF NOT EXISTS admins (token_hash TEXT PRIMARY KEY,expires INTEGER NOT NULL)');
    sql.exec('CREATE TABLE IF NOT EXISTS push_subscriptions (endpoint TEXT PRIMARY KEY,account TEXT NOT NULL,device TEXT NOT NULL,subscription TEXT NOT NULL,updated INTEGER NOT NULL)');
    sql.exec('CREATE TABLE IF NOT EXISTS push_jobs (event_id TEXT NOT NULL,endpoint TEXT NOT NULL,payload TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,next INTEGER NOT NULL,PRIMARY KEY(event_id,endpoint))');
    this.weekly=new WarriorWeekly(ctx);
  }
  private event(id:string){return this.ctx.storage.sql.exec<EventRow>('SELECT * FROM events WHERE id=?',id).toArray()[0]}
  private cleanup(){
    const now=Date.now();this.ctx.storage.sql.exec("DELETE FROM tickets WHERE room='' AND seen<?",now-25000);
    const stale=this.ctx.storage.sql.exec<{room:string}>("SELECT room FROM matches WHERE (status='matched' AND created<?) OR (status='running' AND COALESCE(NULLIF(seen,0),created)<?)",now-120000,now-180000).toArray();
    for(const row of stale)this.abandon(row.room);
  }
  private async arm(){
    const push=this.ctx.storage.sql.exec<{n:number|null}>('SELECT MIN(next) n FROM push_jobs').one().n;
    const match=this.ctx.storage.sql.exec<{n:number|null}>("SELECT MIN(CASE WHEN status='matched' THEN created+120000 ELSE COALESCE(NULLIF(seen,0),created)+180000 END) n FROM matches WHERE status IN ('matched','running')").one().n;
    const next=Math.min(push??Infinity,match??Infinity,this.weekly.next());
    if(Number.isFinite(next)){const at=Math.max(Date.now()+100,next),current=await this.ctx.storage.getAlarm();if(current===null||current>at)await this.ctx.storage.setAlarm(at)}
  }
  abandon(room:string){const row=this.ctx.storage.sql.exec<Match>('SELECT * FROM matches WHERE LOWER(room)=?',room.toLowerCase()).toArray()[0];if(row&&['matched','running'].includes(row.status)){this.ctx.storage.sql.exec("UPDATE matches SET status='cancelled',finished=? WHERE room=?",Date.now(),row.room);this.ctx.storage.sql.exec('DELETE FROM tickets WHERE room=?',row.room)}return {ok:true}}
  touchMatch(room:string){this.ctx.storage.sql.exec("UPDATE matches SET seen=? WHERE LOWER(room)=? AND status IN ('matched','running')",Date.now(),room.toLowerCase());this.ctx.waitUntil(this.arm());return {ok:true}}
  weeklyBegin(id:string,account:string){this.cleanup();if(this.ctx.storage.sql.exec('SELECT id FROM tickets WHERE account=? LIMIT 1',account).toArray().length)return {ok:false,error:'请先结束当前赛事匹配'};const result=this.weekly.begin(id,account);this.ctx.waitUntil(this.arm());return result}
  weeklyStep(id:string,account:string,seq:number,action:string){const result=this.weekly.step(id,account,seq,action);this.ctx.waitUntil(this.arm());return result}
  weeklyStop(id:string,account:string){const result=this.weekly.stop(id,account);this.ctx.waitUntil(this.arm());return result}
  private participant(id:string,account:string){return this.ctx.storage.sql.exec<Participant>('SELECT account,name,lives,eliminated_at,place,claimed,disqualified FROM participants WHERE event_id=? AND account=?',id,account).toArray()[0]}
  private summary(row:EventRow,account?:string){
    const players=this.ctx.storage.sql.exec<{count:number}>('SELECT COUNT(*) AS count FROM participants WHERE event_id=?',row.id).one().count;
    const alive=this.ctx.storage.sql.exec<{count:number}>('SELECT COUNT(*) AS count FROM participants WHERE event_id=? AND lives>0',row.id).one().count;
    const mine=account?this.participant(row.id,account):undefined;
    const ranking=this.ctx.storage.sql.exec<Participant>('SELECT account,name,lives,eliminated_at,place,claimed,disqualified FROM participants WHERE event_id=? AND disqualified=0 ORDER BY CASE WHEN lives>0 THEN 0 ELSE 1 END,lives DESC,eliminated_at DESC,name LIMIT 50',row.id).toArray().map(p=>({name:p.name,lives:p.lives,place:p.place,eliminatedAt:p.eliminated_at}));
    return {id:row.id,kind:row.kind,name:row.name,description:row.description,details:row.details,status:row.status,created:row.created,started:row.started,finished:row.finished,players,alive,mine:mine?{lives:mine.lives,place:mine.place,claimed:!!mine.claimed,disqualified:!!mine.disqualified}:null,ranking,...(row.kind==='warriorWeekly'?{weekly:this.weekly.summary(row.id,account||'')}: {})};
  }
  list(account=''){
    this.weekly.ensure();this.cleanup();this.ctx.waitUntil(this.arm());
    return this.ctx.storage.sql.exec<EventRow>('SELECT * FROM events ORDER BY created DESC').toArray().map(row=>this.summary(row,account.toLowerCase()));
  }
  roster(id:string){
    if(!this.event(id))return {ok:false,error:'赛事不存在'};
    const participants=this.ctx.storage.sql.exec<Participant>('SELECT account,name,lives,eliminated_at,place,claimed,disqualified FROM participants WHERE event_id=? ORDER BY CASE WHEN lives>0 THEN 0 ELSE 1 END,lives DESC,eliminated_at DESC,name',id).toArray().map(p=>({account:p.account,name:p.name,lives:p.lives,place:p.place,eliminatedAt:p.eliminated_at,disqualified:!!p.disqualified}));
    return {ok:true,participants};
  }
  async openAdmin(){const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');const hash=await this.hash(token);this.ctx.storage.sql.exec('INSERT INTO admins VALUES(?,?)',hash,Date.now()+60*60*1000);return token}
  private async hash(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),v=>v.toString(16).padStart(2,'0')).join('')}
  async isAdmin(token:string){if(!/^[a-f0-9]{64}$/i.test(token))return false;return Boolean(this.ctx.storage.sql.exec<{token_hash:string}>('SELECT token_hash FROM admins WHERE token_hash=? AND expires>?',await this.hash(token),Date.now()).toArray()[0])}
  async closeAdmin(token:string){if(/^[a-f0-9]{64}$/i.test(token))this.ctx.storage.sql.exec('DELETE FROM admins WHERE token_hash=?',await this.hash(token))}
  create(kind:string,name:string,description:string,details:string){
    if(kind!=='warrior'||!name||name.length>40||description.length>180||details.length>4000)return {ok:false,error:'赛事信息无效'};
    const id=crypto.randomUUID();this.ctx.storage.sql.exec('INSERT INTO events VALUES(?,?,?,?,?,?,?,0,0)',id,kind,name,description,details,'registration',Date.now());return {ok:true,id};
  }
  edit(id:string,name:string,description:string,details:string){const row=this.event(id);if(!row)return {ok:false,error:'赛事不存在'};if(!name||name.length>40||description.length>180||details.length>4000)return {ok:false,error:'赛事信息无效'};this.ctx.storage.sql.exec('UPDATE events SET name=?,description=?,details=? WHERE id=?',name,description,details,id);return {ok:true}}
  async start(id:string){const row=this.event(id);if(!row||row.status!=='registration')return {ok:false,error:'报名已结束'};const count=this.ctx.storage.sql.exec<{n:number}>('SELECT COUNT(*) AS n FROM participants WHERE event_id=?',id).one().n;if(count<2)return {ok:false,error:'至少需要 2 人报名'};const now=Date.now();this.ctx.storage.sql.exec("UPDATE events SET status='active',started=? WHERE id=?",now,id);
    const payload=JSON.stringify({title:`${row.name}已开始`,body:'你报名的比赛已开始，点击打开星隙前线。',tag:'astrift-tournament-'+id});
    this.ctx.storage.sql.exec('INSERT OR IGNORE INTO push_jobs(event_id,endpoint,payload,next) SELECT ?,s.endpoint,?,? FROM push_subscriptions s JOIN participants p ON p.account=s.account WHERE p.event_id=? AND p.disqualified=0',id,payload,now,id);
    await this.arm();
    return {ok:true}}
  subscribe(account:string,device:string,subscription:unknown){
    if(!validSubscription(subscription))return {ok:false,error:'通知订阅无效'};
    this.ctx.storage.sql.exec('DELETE FROM push_subscriptions WHERE account=? AND device<>?',account,device);
    this.ctx.storage.sql.exec('INSERT OR REPLACE INTO push_subscriptions VALUES(?,?,?,?,?)',subscription.endpoint,account,device,JSON.stringify(subscription),Date.now());return {ok:true};
  }
  unsubscribe(account:string,device:string,endpoint=''){
    if(endpoint)this.ctx.storage.sql.exec('DELETE FROM push_subscriptions WHERE account=? AND device=? AND endpoint=?',account,device,endpoint);
    else this.ctx.storage.sql.exec('DELETE FROM push_subscriptions WHERE account=? AND device=?',account,device);
    return {ok:true};
  }
  async alarm(){
    this.weekly.ensure();this.cleanup();
    const jobs=this.ctx.storage.sql.exec<{event_id:string;endpoint:string;payload:string;attempts:number}>('SELECT event_id,endpoint,payload,attempts FROM push_jobs WHERE next<=? ORDER BY next LIMIT 8',Date.now()).toArray();
    await Promise.all(jobs.map(async job=>{
      const sub=this.ctx.storage.sql.exec<{subscription:string;account:string}>('SELECT subscription,account FROM push_subscriptions WHERE endpoint=?',job.endpoint).toArray()[0];
      const event=this.event(job.event_id);
      if(!sub||!event||event.status!=='active'||!this.participant(job.event_id,sub.account)||this.participant(job.event_id,sub.account)?.disqualified){this.ctx.storage.sql.exec('DELETE FROM push_jobs WHERE event_id=? AND endpoint=?',job.event_id,job.endpoint);return}
      try{
        const subscription:unknown=JSON.parse(sub.subscription);
        if(!validSubscription(subscription))throw Error('Invalid subscription');
        const code=await sendTournamentPush(this.env,subscription,job.payload);
        if(code===404||code===410)this.ctx.storage.sql.exec('DELETE FROM push_subscriptions WHERE endpoint=?',job.endpoint);
        if((code>=200&&code<300)||code===404||code===410||code===400){this.ctx.storage.sql.exec('DELETE FROM push_jobs WHERE event_id=? AND endpoint=?',job.event_id,job.endpoint);return}
        console.warn(JSON.stringify({event:'tournament_push_retry',eventId:job.event_id,status:code}));
      }catch{ /* Retry transient delivery failures without blocking the tournament. */ }
      if(job.attempts>=3)this.ctx.storage.sql.exec('DELETE FROM push_jobs WHERE event_id=? AND endpoint=?',job.event_id,job.endpoint);
      else this.ctx.storage.sql.exec('UPDATE push_jobs SET attempts=attempts+1,next=? WHERE event_id=? AND endpoint=?',Date.now()+30_000*2**job.attempts,job.event_id,job.endpoint);
    }));
    await this.arm();
  }
  delete(id:string){this.weekly.remove(id);this.ctx.storage.sql.exec('DELETE FROM push_jobs WHERE event_id=?',id);if(!this.event(id))return {ok:false,error:'赛事不存在'};this.ctx.storage.sql.exec('DELETE FROM tickets WHERE event_id=?',id);this.ctx.storage.sql.exec('DELETE FROM matches WHERE event_id=?',id);this.ctx.storage.sql.exec('DELETE FROM participants WHERE event_id=?',id);this.ctx.storage.sql.exec('DELETE FROM events WHERE id=?',id);return {ok:true}}
  join(id:string,account:string,name:string){const row=this.event(id);if(!row||!(row.status==='registration'||row.kind==='warriorWeekly'&&row.status==='active'))return {ok:false,error:'当前不在报名阶段'};this.ctx.storage.sql.exec('INSERT OR IGNORE INTO participants(event_id,account,name) VALUES(?,?,?)',id,account.toLowerCase(),name);return {ok:true}}
  queue(id:string,account:string):QueueResult{
    this.cleanup();
    if(this.weekly.busy(account)||this.ctx.storage.sql.exec('SELECT id FROM tickets WHERE account=? AND event_id<>? LIMIT 1',account,id).toArray().length)return {ok:false,error:'已有其他赛事匹配或挑战进行中'};
    const row=this.event(id),participant=this.participant(id,account);
    if(!row||row.kind!=='warrior'||row.status!=='active'||!participant||participant.lives<=0||participant.disqualified)return {ok:false,error:'无法参加匹配'};
    const now=Date.now();this.ctx.storage.sql.exec("DELETE FROM tickets WHERE event_id=? AND room='' AND seen<?",id,now-25_000);
    let existing:Ticket|undefined=this.ctx.storage.sql.exec<Ticket>('SELECT * FROM tickets WHERE event_id=? AND account=? ORDER BY seen DESC LIMIT 1',id,account).toArray()[0];
    if(existing?.room){const match=this.ctx.storage.sql.exec<Match>('SELECT * FROM matches WHERE room=?',existing.room).toArray()[0];if(match?.status==='matched'&&now-match.created>120_000){this.ctx.storage.sql.exec('DELETE FROM tickets WHERE room=?',existing.room);this.ctx.storage.sql.exec('DELETE FROM matches WHERE room=?',existing.room);existing=undefined}}
    if(existing){if(existing.room)return {ok:true,ticket:existing.id,status:'matched',room:existing.room,map:existing.map};this.ctx.storage.sql.exec('UPDATE tickets SET seen=? WHERE id=?',now,existing.id);return {ok:true,ticket:existing.id,status:'waiting'}}
    const peer=this.ctx.storage.sql.exec<Ticket>("SELECT * FROM tickets WHERE event_id=? AND room='' AND account<>? ORDER BY seen LIMIT 1",id,account).toArray()[0];
    const ticket=crypto.randomUUID();if(peer){
      const room='T'+crypto.randomUUID().replaceAll('-','').slice(0,25),bytes=crypto.getRandomValues(new Uint32Array(1)),map=MAPS[bytes[0]%MAPS.length];
      this.ctx.storage.sql.exec('UPDATE tickets SET room=?,map=?,seen=? WHERE id=?',room,map,now,peer.id);
      this.ctx.storage.sql.exec('INSERT INTO tickets VALUES(?,?,?,?,?,?)',ticket,id,account,room,map,now);
      this.ctx.storage.sql.exec('INSERT INTO matches(room,event_id,first_account,second_account,status,created,finished,seen) VALUES(?,?,?,?,?,?,0,?)',room,id,peer.account,account,'matched',now,now);this.ctx.waitUntil(this.arm());
      return {ok:true,ticket,status:'matched',room,map};
    }
    this.ctx.storage.sql.exec('INSERT INTO tickets VALUES(?,?,?,?,?,?)',ticket,id,account,'','',now);
    return {ok:true,ticket,status:'waiting'};
  }
  queueStatus(id:string,account:string,ticket:string){this.cleanup();const row=this.ctx.storage.sql.exec<Ticket>('SELECT * FROM tickets WHERE id=? AND event_id=? AND account=?',ticket,id,account).toArray()[0];if(!row)return {ok:false,error:'匹配已失效'};if(row.room){const match=this.ctx.storage.sql.exec<Match>('SELECT * FROM matches WHERE room=?',row.room).toArray()[0];if(match?.status==='matched'&&Date.now()-match.created>120_000){this.ctx.storage.sql.exec('DELETE FROM tickets WHERE room=?',row.room);this.ctx.storage.sql.exec('DELETE FROM matches WHERE room=?',row.room);return {ok:false,error:'对手未进入，已返回匹配队列'}}return {ok:true,status:'matched',room:row.room,map:row.map}}this.ctx.storage.sql.exec('UPDATE tickets SET seen=? WHERE id=?',Date.now(),ticket);return {ok:true,status:'waiting'}}
  queueCancel(id:string,account:string,ticket:string){const row=this.ctx.storage.sql.exec<Ticket>('SELECT * FROM tickets WHERE id=? AND event_id=? AND account=?',ticket,id,account).toArray()[0];if(row&&!row.room)this.ctx.storage.sql.exec('DELETE FROM tickets WHERE id=?',ticket);else if(row&&this.ctx.storage.sql.exec<Match>('SELECT * FROM matches WHERE room=?',row.room).toArray()[0]?.status==='matched')this.abandon(row.room);return {ok:true}}
  isParticipant(room:string,account:string){const row=this.ctx.storage.sql.exec<Match>('SELECT * FROM matches WHERE LOWER(room)=?',room.toLowerCase()).toArray()[0];return Boolean(row&&(row.first_account===account||row.second_account===account)&&['matched','running'].includes(row.status)&&this.event(row.event_id)?.status==='active')}
  markStarted(room:string){this.touchMatch(room);this.ctx.storage.sql.exec("UPDATE matches SET status='running' WHERE LOWER(room)=? AND status='matched'",room.toLowerCase());return {ok:true}}
  private finishIfWinner(id:string){
    if(this.event(id)?.kind!=='warrior')return;
    const alive=this.ctx.storage.sql.exec<{n:number}>('SELECT COUNT(*) AS n FROM participants WHERE event_id=? AND lives>0',id).one().n;
    if(alive!==1)return;
    this.ctx.storage.sql.exec("UPDATE events SET status='finished',finished=? WHERE id=? AND status='active'",Date.now(),id);
    this.ctx.storage.sql.exec('DELETE FROM tickets WHERE event_id=?',id);
    const leaders=this.ctx.storage.sql.exec<{account:string}>('SELECT account FROM participants WHERE event_id=? AND disqualified=0 ORDER BY lives DESC,eliminated_at DESC LIMIT 3',id).toArray();
    leaders.forEach((p,index)=>this.ctx.storage.sql.exec('UPDATE participants SET place=? WHERE event_id=? AND account=?',index+1,id,p.account));
  }
  eliminate(id:string,account:string){
    const event=this.event(id),target=this.participant(id,account);
    if(!event||event.status!=='active')return {ok:false,error:'比赛尚未开始或已经结束'};
    if(!target)return {ok:false,error:'选手不在名单中'};
    if(target.lives<=0)return {ok:false,error:'该选手已经淘汰'};
    const match=this.ctx.storage.sql.exec<Match>("SELECT * FROM matches WHERE event_id=? AND (first_account=? OR second_account=?) AND status IN ('matched','running') LIMIT 1",id,account,account).toArray()[0];
    if(match)return {ok:false,error:'该选手正在对局，请在本局结束后淘汰'};
    const last=this.ctx.storage.sql.exec<{value:number}>('SELECT COALESCE(MAX(eliminated_at),0) AS value FROM participants WHERE event_id=?',id).one().value;
    this.ctx.storage.sql.exec('UPDATE participants SET lives=0,eliminated_at=?,disqualified=1,place=0 WHERE event_id=? AND account=?',Math.max(Date.now(),last+1),id,account);
    this.ctx.storage.sql.exec('DELETE FROM tickets WHERE event_id=? AND account=?',id,account);
    this.finishIfWinner(id);
    return {ok:true};
  }
  recordOutcome(room:string,winner:string,loser:string){
    const match=this.ctx.storage.sql.exec<Match>('SELECT * FROM matches WHERE LOWER(room)=?',room.toLowerCase()).toArray()[0];if(!match||['finished','cancelled'].includes(match.status))return {ok:true};
    if(![winner,loser].every(a=>a===match.first_account||a===match.second_account)||winner===loser)return {ok:false};
    const event=this.event(match.event_id);if(!event||event.status!=='active')return {ok:false};
    this.ctx.storage.sql.exec("UPDATE matches SET status='finished',finished=? WHERE room=?",Date.now(),match.room);
    this.ctx.storage.sql.exec('DELETE FROM tickets WHERE room=?',match.room);
    const lost=this.participant(match.event_id,loser);if(lost&&lost.lives>0){const next=lost.lives-1,last=this.ctx.storage.sql.exec<{value:number}>('SELECT COALESCE(MAX(eliminated_at),0) AS value FROM participants WHERE event_id=?',match.event_id).one().value;this.ctx.storage.sql.exec('UPDATE participants SET lives=?,eliminated_at=? WHERE event_id=? AND account=?',next,next?0:Math.max(Date.now(),last+1),match.event_id,loser)}
    this.finishIfWinner(match.event_id);
    return {ok:true};
  }
  reward(id:string,account:string){const event=this.event(id),participant=this.participant(id,account);if(!event||event.status!=='finished'||!participant?.place||participant.disqualified||!REWARDS[participant.place]||!['warrior','warriorWeekly'].includes(event.kind))return null;return {place:participant.place,...REWARDS[participant.place],claimed:!!participant.claimed}}
  markClaimed(id:string,account:string){this.ctx.storage.sql.exec('UPDATE participants SET claimed=1 WHERE event_id=? AND account=? AND place BETWEEN 1 AND 3 AND disqualified=0',id,account);return {ok:true}}
}
