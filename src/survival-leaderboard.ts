// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {DurableObject} from 'cloudflare:workers';
import {TOWER_WEEK_MS,towerWeekStart,towerTeamKey,validTowerResult} from './survival-ranking-rules';
import type {TowerResult,TowerMember} from './survival-ranking-rules';
type Entry={week:number;team:string;names:string;elapsed:number;completed:number;run_id:string};
type Settlement={week:number;champion:string;expires:number;delivered:number};
export class SurvivalLeaderboard extends DurableObject<Env>{
  private settling:Promise<void>|null=null;
  constructor(ctx:DurableObjectState,env:Env){
    super(ctx,env);
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS tower_entries(week INTEGER NOT NULL,team TEXT NOT NULL,names TEXT NOT NULL,elapsed INTEGER NOT NULL,completed INTEGER NOT NULL,run_id TEXT NOT NULL,PRIMARY KEY(week,team))');
    ctx.storage.sql.exec('CREATE INDEX IF NOT EXISTS tower_order ON tower_entries(week,elapsed DESC,completed ASC,team ASC)');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS tower_results(run_id TEXT PRIMARY KEY,week INTEGER NOT NULL)');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS tower_settlements(week INTEGER PRIMARY KEY,champion TEXT NOT NULL,expires INTEGER NOT NULL,delivered INTEGER NOT NULL DEFAULT 0)');
  }
  async record(result:TowerResult){
    const now=Date.now();if(!validTowerResult(result,now))return {ok:false,error:'成绩无效'};
    const week=towerWeekStart(result.finishedAt),current=towerWeekStart(now);
    if(week<current||week>current)return {ok:false,error:'本周成绩已结算'};
    if(this.ctx.storage.sql.exec('SELECT run_id FROM tower_results WHERE run_id=?',result.runId).toArray().length)return {ok:true,duplicate:true};
    const team=towerTeamKey(result.members),names=JSON.stringify(result.members);
    this.ctx.storage.sql.exec('INSERT INTO tower_results VALUES(?,?)',result.runId,week);
    this.ctx.storage.sql.exec('INSERT INTO tower_entries VALUES(?,?,?,?,?,?) ON CONFLICT(week,team) DO UPDATE SET names=excluded.names,elapsed=excluded.elapsed,completed=excluded.completed,run_id=excluded.run_id WHERE excluded.elapsed>tower_entries.elapsed OR (excluded.elapsed=tower_entries.elapsed AND excluded.completed<tower_entries.completed)',week,team,names,result.elapsedMs,result.finishedAt,result.runId);
    await this.schedule();return {ok:true};
  }
  async board(){
    await this.settleDue();
    const now=Date.now(),week=towerWeekStart(now),rows=this.ctx.storage.sql.exec<Entry>('SELECT * FROM tower_entries WHERE week=? ORDER BY elapsed DESC,completed ASC,team ASC LIMIT 100',week).toArray();
    const previous=this.ctx.storage.sql.exec<Settlement>('SELECT * FROM tower_settlements ORDER BY week DESC LIMIT 1').toArray()[0];
    await this.schedule();
    return {ok:true,serverNow:now,weekStart:week,settlesAt:week+TOWER_WEEK_MS,timeZone:'Asia/Shanghai',entries:rows.map((row,index)=>({rank:index+1,names:(JSON.parse(row.names) as TowerMember[]).map(m=>m.name),elapsedMs:row.elapsed})),champion:previous?{names:(JSON.parse(previous.champion) as {members:TowerMember[]}).members.map(m=>m.name),elapsedMs:(JSON.parse(previous.champion) as {elapsedMs:number}).elapsedMs,expiresAt:previous.expires}:null};
  }
  private async schedule(){
    const pending=this.ctx.storage.sql.exec('SELECT week FROM tower_settlements WHERE delivered=0 LIMIT 1').toArray().length;
    const when=pending?Date.now()+30_000:towerWeekStart(Date.now())+TOWER_WEEK_MS;
    const current=await this.ctx.storage.getAlarm();if(current===null||current>when)await this.ctx.storage.setAlarm(when);
  }
  private settleDue(){
    if(this.settling)return this.settling;
    this.settling=this.settle().finally(()=>{this.settling=null});return this.settling;
  }
  private async settle(){
    const now=Date.now(),current=towerWeekStart(now);
    const weeks=this.ctx.storage.sql.exec<{week:number}>('SELECT DISTINCT week FROM tower_entries WHERE week<? AND week NOT IN(SELECT week FROM tower_settlements) ORDER BY week',current).toArray();
    for(const {week} of weeks){
      const winner=this.ctx.storage.sql.exec<Entry>('SELECT * FROM tower_entries WHERE week=? ORDER BY elapsed DESC,completed ASC,team ASC LIMIT 1',week).one();
      const champion=JSON.stringify({members:JSON.parse(winner.names),elapsedMs:winner.elapsed});
      this.ctx.storage.sql.exec('INSERT OR IGNORE INTO tower_settlements VALUES(?,?,?,0)',week,champion,week+2*TOWER_WEEK_MS);
    }
    const pending=this.ctx.storage.sql.exec<Settlement>('SELECT * FROM tower_settlements WHERE delivered=0 ORDER BY week').toArray();
    for(const row of pending){
      const champion=JSON.parse(row.champion) as {members:TowerMember[]};
      for(const member of champion.members){const result=await this.env.PLAYER_ACCOUNTS.getByName('account:'+member.account).grantTowerReward(row.week,row.expires);if(!result)throw Error('Tower champion account unavailable')}
      this.ctx.storage.sql.exec('UPDATE tower_settlements SET delivered=1 WHERE week=?',row.week);
    }
    // Keep four settled weeks for history and idempotent delivery, plus the current board.
    this.ctx.storage.sql.exec('DELETE FROM tower_results WHERE week<?',current-4*TOWER_WEEK_MS);
    this.ctx.storage.sql.exec('DELETE FROM tower_entries WHERE week<? AND week IN(SELECT week FROM tower_settlements WHERE delivered=1)',current-4*TOWER_WEEK_MS);
  }
  async alarm(){try{await this.settleDue()}finally{await this.schedule()}}
}
