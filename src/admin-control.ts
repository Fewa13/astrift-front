// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {emailDigest} from './account-email';
declare global {interface Env {ASTRIFT_ADMIN_PASSWORD_1:string;ASTRIFT_ADMIN_PASSWORD_2:string}}
type Ban={account:string;until:number;reason:string;created:number};
export class AdminControl{
 constructor(private storage:DurableObjectStorage,private env:Env){const sql=storage.sql;
 sql.exec('CREATE TABLE IF NOT EXISTS admin_auth(hash TEXT PRIMARY KEY,ip TEXT NOT NULL,stage INTEGER NOT NULL,expires INTEGER NOT NULL)');
 sql.exec('CREATE TABLE IF NOT EXISTS admin_auth_limits(ip TEXT PRIMARY KEY,start INTEGER NOT NULL,count INTEGER NOT NULL)');
 sql.exec('CREATE TABLE IF NOT EXISTS account_bans(account TEXT PRIMARY KEY,until INTEGER NOT NULL,reason TEXT NOT NULL,created INTEGER NOT NULL)');
 sql.exec('CREATE TABLE IF NOT EXISTS admin_audit(id TEXT PRIMARY KEY,created INTEGER NOT NULL,action TEXT NOT NULL,target TEXT NOT NULL,detail TEXT NOT NULL)');
 }
 async login(stage:number,password:string,ip:string,challenge=''){
  const sql=this.storage.sql,now=Date.now();sql.exec('DELETE FROM admin_auth WHERE expires<=?',now);sql.exec('DELETE FROM admin_auth_limits WHERE start<?',now-3600000);
  const row=sql.exec<{start:number;count:number}>('SELECT start,count FROM admin_auth_limits WHERE ip=?',ip).toArray()[0];if(row&&now-row.start<900000&&row.count>=10)return {ok:false,error:'尝试次数过多，请15分钟后再试'};
  sql.exec('INSERT INTO admin_auth_limits VALUES(?,?,?) ON CONFLICT(ip) DO UPDATE SET start=excluded.start,count=excluded.count',ip,row&&now-row.start<900000?row.start:now,row&&now-row.start<900000?row.count+1:1);
  const secret=stage===1?this.env.ASTRIFT_ADMIN_PASSWORD_1:this.env.ASTRIFT_ADMIN_PASSWORD_2;if(!secret)return {ok:false,error:'管理员入口尚未配置'};
  let challengeHash='';if(stage===2){challengeHash=await emailDigest(challenge);const c=sql.exec<{stage:number;expires:number;ip:string}>('SELECT stage,expires,ip FROM admin_auth WHERE hash=?',challengeHash).toArray()[0];if(!c||c.stage!==1||c.ip!==ip||c.expires<=now)return {ok:false,error:'第一层验证已失效，请重新开始'}}
  const a=await emailDigest(password),b=await emailDigest(secret);let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);if(diff)return {ok:false,error:'密码错误'};
  if(stage===2){const current=sql.exec<{expires:number}>('SELECT expires FROM admin_auth WHERE hash=? AND stage=1 AND ip=?',challengeHash,ip).toArray()[0];if(!current||current.expires<=Date.now())return {ok:false,error:'第一层验证已失效，请重新开始'};sql.exec('DELETE FROM admin_auth WHERE hash=?',challengeHash)}
  const token=crypto.randomUUID()+crypto.randomUUID(),hash=await emailDigest(token),expires=now+(stage===1?300000:1800000);sql.exec('INSERT INTO admin_auth VALUES(?,?,?,?)',hash,ip,stage,expires);
  if(stage===2)sql.exec('DELETE FROM admin_auth_limits WHERE ip=?',ip);return {ok:true,...(stage===1?{challenge:token}:{token}),expires};
 }
 async valid(token:string,ip:string){if(typeof token!=='string'||token.length!==72)return false;const row=this.storage.sql.exec<{expires:number}>('SELECT expires FROM admin_auth WHERE hash=? AND ip=? AND stage=2',await emailDigest(token),ip).toArray()[0];return !!row&&row.expires>Date.now()}
 async logout(token:string){this.storage.sql.exec('DELETE FROM admin_auth WHERE hash=?',await emailDigest(token))}
 banState(account:string){const row=this.storage.sql.exec<Ban>('SELECT * FROM account_bans WHERE account=?',account.toLowerCase()).toArray()[0];return row&&(row.until===0||row.until>Date.now())?row:null}
 bans(){return this.storage.sql.exec<Ban>('SELECT * FROM account_bans WHERE until=0 OR until>? ORDER BY created DESC',Date.now()).toArray()}
 logs(){return this.storage.sql.exec<{id:string;created:number;action:string;target:string;detail:string}>('SELECT * FROM admin_audit ORDER BY created DESC LIMIT 100').toArray()}
 record(id:string,action:string,target:string,detail:unknown){const value=JSON.stringify(detail);const old=this.storage.sql.exec<{action:string;target:string;detail:string}>('SELECT action,target,detail FROM admin_audit WHERE id=?',id).toArray()[0];if(old){if(old.action!==action||old.target!==target||old.detail!==value)throw Error('操作编号冲突，请刷新页面');return false}this.storage.sql.exec('INSERT INTO admin_audit VALUES(?,?,?,?,?)',id,Date.now(),action,target,value);return true}
 setBan(id:string,account:string,seconds:number|null,reason:string){return this.storage.transactionSync(()=>{if(!this.record(id,'ban',account,{seconds,reason}))return this.banState(account);const until=seconds===null?0:Date.now()+seconds*1000;this.storage.sql.exec('INSERT INTO account_bans VALUES(?,?,?,?) ON CONFLICT(account) DO UPDATE SET until=excluded.until,reason=excluded.reason,created=excluded.created',account,until,reason,Date.now());this.storage.sql.exec('DELETE FROM active_sessions WHERE account=?',account);return this.banState(account)})}
 unban(id:string,account:string){this.storage.transactionSync(()=>{if(!this.record(id,'unban',account,{}))return;this.storage.sql.exec('DELETE FROM account_bans WHERE account=?',account)})}
}
