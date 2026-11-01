// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const HEARTBEAT_LIMIT=15000,RECONNECT_GRACE=60000;
const dayFormat=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'});
export function irvineDay(time:number){const p=dayFormat.formatToParts(time),part=(type:string)=>p.find(v=>v.type===type)!.value;return `${part('year')}-${part('month')}-${part('day')}`;}
type PlaySession={id:number;name:string;map:string;joined:number;last_seen:number;connection:string;closed:number;milliseconds:number};
export function initJoinLog(sql:SqlStorage){
 sql.exec('CREATE TABLE IF NOT EXISTS ancient_joinlog(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,map TEXT NOT NULL,joined INTEGER NOT NULL)');
 sql.exec('CREATE TABLE IF NOT EXISTS ancient_joinlog_sessions(token TEXT PRIMARY KEY,expires INTEGER NOT NULL)');
 sql.exec('CREATE TABLE IF NOT EXISTS ancient_joinlog_meta(key TEXT PRIMARY KEY,value TEXT NOT NULL)');
 sql.exec('CREATE TABLE IF NOT EXISTS ancient_play_sessions(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,map TEXT NOT NULL,joined INTEGER NOT NULL,last_seen INTEGER NOT NULL,connection TEXT NOT NULL,closed INTEGER NOT NULL DEFAULT 0,milliseconds INTEGER NOT NULL DEFAULT 0)');
 sql.exec('CREATE INDEX IF NOT EXISTS ancient_play_name ON ancient_play_sessions(name COLLATE NOCASE,id DESC)');
 sql.exec('CREATE TABLE IF NOT EXISTS ancient_play_daily(name TEXT NOT NULL COLLATE NOCASE,day TEXT NOT NULL,milliseconds INTEGER NOT NULL,PRIMARY KEY(name,day))');
 // One-time reset requested by the owner. Never clear again on restart/deploy.
 if(!sql.exec("SELECT value FROM ancient_joinlog_meta WHERE key='sessions-v2-reset'").toArray().length){
  const removed=sql.exec<{n:number}>('SELECT COUNT(*) n FROM ancient_joinlog').toArray()[0].n;
  sql.exec('DELETE FROM ancient_joinlog');sql.exec('DELETE FROM ancient_joinlog_sessions');
  sql.exec("INSERT INTO ancient_joinlog_meta VALUES('sessions-v2-reset',?)",JSON.stringify({time:Date.now(),removed}));
 }
}
function latest(sql:SqlStorage,name:string){return sql.exec<PlaySession>('SELECT * FROM ancient_play_sessions WHERE name=? COLLATE NOCASE ORDER BY id DESC LIMIT 1',name).toArray()[0];}
function credit(sql:SqlStorage,row:PlaySession,now:number){
 const elapsed=now-row.last_seen;if(elapsed<=0)return;
 // Never invent online time across an unobserved network/background gap.
 if(elapsed<=HEARTBEAT_LIMIT){
  let cursor=row.last_seen;
  while(cursor<now){const day=irvineDay(cursor);let end=now;
   if(irvineDay(now-1)!==day){let lo=cursor+1,hi=now;while(lo<hi){const mid=Math.floor((lo+hi)/2);if(irvineDay(mid)===day)lo=mid+1;else hi=mid;}end=lo;}
   sql.exec('INSERT INTO ancient_play_daily(name,day,milliseconds) VALUES(?,?,?) ON CONFLICT(name,day) DO UPDATE SET milliseconds=milliseconds+excluded.milliseconds',row.name,day,end-cursor);cursor=end;
  }
  sql.exec('UPDATE ancient_play_sessions SET milliseconds=milliseconds+? WHERE id=?',elapsed,row.id);
 }
 sql.exec('UPDATE ancient_play_sessions SET last_seen=? WHERE id=?',now,row.id);
}
export function recordMapJoin(sql:SqlStorage,name:string,map:string,now=Date.now(),connection:string=crypto.randomUUID()){
 const row=latest(sql,name);
 if(row&&row.map===map&&row.closed!==2&&now>=row.last_seen&&now-row.last_seen<=RECONNECT_GRACE){
  // A new transport is not a new visit. Reconnect gaps are not credited.
  sql.exec('UPDATE ancient_play_sessions SET last_seen=?,connection=?,closed=0 WHERE id=?',now,connection,row.id);return row.id;
 }
 if(row&&row.closed===0){credit(sql,row,now);sql.exec('UPDATE ancient_play_sessions SET closed=2 WHERE id=?',row.id);}
 return sql.exec<{id:number}>('INSERT INTO ancient_play_sessions(name,map,joined,last_seen,connection) VALUES(?,?,?,?,?) RETURNING id',name,map,now,now,connection).toArray()[0].id;
}
export function recordPlayHeartbeat(sql:SqlStorage,name:string,map:string,connection:string,now=Date.now()){
 const row=latest(sql,name);if(!row){recordMapJoin(sql,name,map,now,connection);return;}
 if(row.connection!==connection||row.closed!==0||row.map!==map)return;
 // At most one small durable update per five seconds, never per move/frame.
 if(now-row.last_seen>=5000)credit(sql,row,now);
}
export function endPlaySession(sql:SqlStorage,name:string,connection:string,explicit=false,now=Date.now()){
 const row=latest(sql,name);if(!row||row.connection!==connection||row.closed!==0)return;
 credit(sql,row,now);sql.exec('UPDATE ancient_play_sessions SET closed=? WHERE id=?',explicit?2:1,row.id);
}
export function joinLogCommand(sql:SqlStorage,action:string,data:Record<string,unknown>,now=Date.now()){
 if(action==='login'){sql.exec('DELETE FROM ancient_joinlog_sessions WHERE expires<=?',now);const token=crypto.randomUUID()+crypto.randomUUID();sql.exec('INSERT INTO ancient_joinlog_sessions VALUES(?,?)',token,now+1800000);return {ok:true,token};}
 const token=typeof data.token==='string'?data.token:'';
 if(!token||!sql.exec('SELECT token FROM ancient_joinlog_sessions WHERE token=? AND expires>?',token,now).toArray().length)return {ok:false,error:'验证已过期，请重新输入密码'};
 if(action==='logout'){sql.exec('DELETE FROM ancient_joinlog_sessions WHERE token=?',token);return {ok:true};}
 const name=typeof data.name==='string'?data.name.trim().slice(0,64):'',requested=Number(data.page),wanted=Math.max(1,Number.isFinite(requested)?Math.floor(requested):1);
 if(action==='stats'){
  if(!name)return {ok:false,error:'请输入完整玩家名'};
  const total=sql.exec<{n:number}>('SELECT COUNT(*) n FROM ancient_play_daily WHERE name=? COLLATE NOCASE',name).toArray()[0].n,pages=Math.max(1,Math.ceil(total/30)),page=Math.min(pages,wanted);
  const rows=sql.exec<{name:string;day:string;milliseconds:number}>('SELECT name,day,milliseconds FROM ancient_play_daily WHERE name=? COLLATE NOCASE ORDER BY day DESC LIMIT 30 OFFSET ?',name,(page-1)*30).toArray();
  const milliseconds=sql.exec<{n:number}>('SELECT COALESCE(SUM(milliseconds),0) n FROM ancient_play_daily WHERE name=? COLLATE NOCASE',name).toArray()[0].n;
  return {ok:true,name:rows[0]?.name||name,rows,page,pages,total,milliseconds};
 }
 if(action!=='list')return {ok:false,error:'请求无效'};
 const where=name?' WHERE name=? COLLATE NOCASE':'',args=name?[name]:[],total=sql.exec<{n:number}>('SELECT COUNT(*) n FROM ancient_play_sessions'+where,...args).toArray()[0].n,pages=Math.max(1,Math.ceil(total/50)),page=Math.min(pages,wanted);
 const rows=sql.exec<PlaySession>('SELECT * FROM ancient_play_sessions'+where+' ORDER BY id DESC LIMIT 50 OFFSET ?',...args,(page-1)*50).toArray().map(r=>({name:r.name,map:r.map,joined:r.joined,lastSeen:r.last_seen,milliseconds:r.milliseconds,online:r.closed===0&&now-r.last_seen<=HEARTBEAT_LIMIT}));
 const reset=JSON.parse(sql.exec<{value:string}>("SELECT value FROM ancient_joinlog_meta WHERE key='sessions-v2-reset'").toArray()[0].value) as {time:number;removed:number};
 return {ok:true,rows,page,pages,total,resetAt:reset.time};
}

export function nextIrvineMidnight(now:number){const day=irvineDay(now);let lo=now+1,hi=now+27*3600000;while(lo<hi){const mid=Math.floor((lo+hi)/2);if(irvineDay(mid)===day)lo=mid+1;else hi=mid}return lo}
export function flushPlaySessions(sql:SqlStorage,now=Date.now()){for(const r of sql.exec<PlaySession>('SELECT * FROM ancient_play_sessions WHERE closed=0 AND last_seen>?',now-HEARTBEAT_LIMIT).toArray())credit(sql,r,now)}
