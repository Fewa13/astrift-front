// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {emailDigest} from './account-email';
declare global {interface Env {ASTRIFT_DEVBUILD_PASSWORD?:string}}

export async function devbuildCodeCommand(storage:DurableObjectStorage,secret:string|undefined,ip:string,data:Record<string,unknown>){
 const sql=storage.sql,now=Date.now(),action=data.action;
 sql.exec('CREATE TABLE IF NOT EXISTS devbuild_codes(hash TEXT PRIMARY KEY,label TEXT NOT NULL,created INTEGER NOT NULL,used INTEGER)');
 if(action==='redeem'){
  if(typeof data.code!=='string'||!/^[0-9a-f]{32}$/i.test(data.code))return {error:'游玩码无效'};
  const hash=await emailDigest(data.code.toLowerCase());
  const claimed=sql.exec('UPDATE devbuild_codes SET used=? WHERE hash=? AND used IS NULL RETURNING hash',now,hash).toArray();
  return claimed.length?{ok:true,activation:crypto.randomUUID()}:{error:'游玩码不存在或已使用'};
 }
 if(!secret)return {error:'口令管理尚未配置'};
 sql.exec('CREATE TABLE IF NOT EXISTS devbuild_limits(ip TEXT PRIMARY KEY,at INTEGER NOT NULL,attempts INTEGER NOT NULL)');
 sql.exec('DELETE FROM devbuild_limits WHERE at<?',now-900000);
 const limit=sql.exec<{attempts:number}>('SELECT attempts FROM devbuild_limits WHERE ip=?',ip).toArray()[0];
 if((limit?.attempts||0)>=10)return {error:'尝试次数过多，请稍后再试'};
 if(typeof data.password!=='string'||data.password.length>128)return {error:'密码无效'};
 const [a,b]=await Promise.all([emailDigest(data.password),emailDigest(secret)]);
 let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);
 if(diff){
  sql.exec('INSERT INTO devbuild_limits VALUES(?,?,1) ON CONFLICT(ip) DO UPDATE SET attempts=attempts+1',ip,now);
  return {error:'密码错误'};
 }
 if(action==='add'||action==='list'){
  const columns=sql.exec<{name:string}>('PRAGMA table_info(devbuild_codes)').toArray();
  if(!columns.some(column=>column.name==='code'))sql.exec('ALTER TABLE devbuild_codes ADD COLUMN code TEXT');
 }
 if(action==='add'){
  const code=crypto.randomUUID().replaceAll('-','');
  sql.exec('INSERT INTO devbuild_codes(hash,label,created,used,code) VALUES(?,?,?,NULL,?)',await emailDigest(code),String(data.label||'').slice(0,80),now,code);
  return {ok:true,code};
 }
 if(action==='delete'&&typeof data.id==='string'){
  // Keep used hashes as redemption receipts.
  sql.exec('DELETE FROM devbuild_codes WHERE hash=? AND used IS NULL',data.id);
  return {ok:true};
 }
 if(action==='list')return {ok:true,codes:sql.exec('SELECT hash AS id,label,created,used,code FROM devbuild_codes ORDER BY created DESC').toArray()};
 return {error:'未知操作'};
}
