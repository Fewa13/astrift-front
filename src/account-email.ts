// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const ACCOUNT_SENDERS={verify:'verify-noreply@astrift.com',reset:'reset-noreply@astrift.com',security:'security-noreply@astrift.com',notice:'notice-noreply@astrift.com'} as const;
export function normalizeAccountEmail(value:unknown){if(typeof value!=='string')return '';const email=value.trim().toLowerCase();return email.length<=254&&/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(email)&&email.split('@')[0].length<=64&&!email.split('@')[0].startsWith('.')&&!email.split('@')[0].endsWith('.')&&!email.includes('..')?email:'';}
export const emailDigest=async(value:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),v=>v.toString(16).padStart(2,'0')).join('');
const same=(a:string,b:string)=>{let d=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)d|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return d===0;};
type Challenge={purpose:string;email:string;account:string;hash:string;expires:number;attempts:number;sent:number};
type Result={ok:boolean;error?:string};
export class AccountEmailStore{
 constructor(private storage:DurableObjectStorage,private mail:SendEmail){const sql=storage.sql;sql.exec('CREATE TABLE IF NOT EXISTS verified_emails(email TEXT PRIMARY KEY,account TEXT NOT NULL UNIQUE,verified INTEGER NOT NULL)');sql.exec('CREATE TABLE IF NOT EXISTS email_challenges(purpose TEXT NOT NULL,email TEXT NOT NULL,account TEXT NOT NULL,hash TEXT NOT NULL,expires INTEGER NOT NULL,attempts INTEGER NOT NULL,sent INTEGER NOT NULL,PRIMARY KEY(purpose,email))');sql.exec('CREATE TABLE IF NOT EXISTS email_limits(key TEXT PRIMARY KEY,start INTEGER NOT NULL,count INTEGER NOT NULL)');}
 lookup(email:string){return this.storage.sql.exec<{account:string}>('SELECT account FROM verified_emails WHERE email=?',normalizeAccountEmail(email)).toArray()[0]?.account||'';}
 address(account:string){return this.storage.sql.exec<{email:string}>('SELECT email FROM verified_emails WHERE account=?',account.toLowerCase()).toArray()[0]?.email||'';}
 private limit(key:string,n:number,window:number){const sql=this.storage.sql,now=Date.now(),row=sql.exec<{start:number;count:number}>('SELECT start,count FROM email_limits WHERE key=?',key).toArray()[0];if(row&&now-row.start<window&&row.count>=n)return false;sql.exec('INSERT INTO email_limits VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET start=excluded.start,count=excluded.count',key,row&&now-row.start<window?row.start:now,row&&now-row.start<window?row.count+1:1);return true;}
 async request(purpose:'verify'|'reset',rawEmail:string,account:string,ipKey:string):Promise<Result>{
  const email=normalizeAccountEmail(rawEmail);if(!email)return {ok:false,error:'邮箱格式无效'};
  const now=Date.now(),sql=this.storage.sql;sql.exec('DELETE FROM email_limits WHERE start<?',now-86400000);sql.exec('DELETE FROM email_challenges WHERE expires<?',now-86400000);
  if(!this.limit('ip:'+ipKey,30,3600000)||!this.limit(purpose+':minute:'+email,1,60000)||!this.limit('email:'+email,6,3600000))return {ok:false,error:'发送太频繁，请稍后再试'};
  account=purpose==='reset'?this.lookup(email):account.toLowerCase();
  if(purpose==='reset'&&!account)return {ok:true};
  if(purpose==='verify'&&(this.lookup(email)||this.address(account)))return {ok:false,error:'邮箱或账号已经绑定'};
  let random;do{random=crypto.getRandomValues(new Uint32Array(1))[0]}while(random>=4294000000);const code=String(random%1000000).padStart(6,'0'),hash=await emailDigest([purpose,email,account,code].join(':'));
  sql.exec('INSERT INTO email_challenges VALUES(?,?,?,?,?,0,?) ON CONFLICT(purpose,email) DO UPDATE SET account=excluded.account,hash=excluded.hash,expires=excluded.expires,attempts=0,sent=excluded.sent',purpose,email,account,hash,now+600000,now);
  const title=purpose==='verify'?'绑定邮箱验证码 / Verify your Astrift email':'重设密码验证码 / Reset your Astrift password';
  const text=`${title}\n\n${code}\n\n验证码10分钟内有效，请勿分享给他人。This code expires in 10 minutes. Do not share it.\n如果不是你发起的操作，请忽略此邮件。If you did not request this, ignore this email.\n\n此地址不接收回复。客服 / Support: help@astrift.com`;
  try{await this.mail.send({from:{email:ACCOUNT_SENDERS[purpose],name:'Astrift Account'},to:email,replyTo:ACCOUNT_SENDERS[purpose],subject:'Astrift · '+title,text,html:'<div style="font:16px system-ui;line-height:1.7"><h2>'+title+'</h2><p style="font-size:36px;letter-spacing:8px;font-weight:700">'+code+'</p><p>验证码10分钟内有效，请勿分享。<br>This code expires in 10 minutes. Do not share it.</p><p>非本人操作请忽略。If you did not request this, ignore this email.</p><p>Support: help@astrift.com · 请勿回复 / Do not reply</p></div>',headers:{'Auto-Submitted':'auto-generated','X-Auto-Response-Suppress':'All'}});return {ok:true};}catch{sql.exec('DELETE FROM email_challenges WHERE purpose=? AND email=? AND hash=?',purpose,email,hash);return {ok:false,error:'邮件暂时无法发送，请稍后重试'};}
 }
 private async check(purpose:'verify'|'reset',rawEmail:string,account:string,code:string):Promise<boolean>{
  const email=normalizeAccountEmail(rawEmail);if(!email||!/^\d{6}$/.test(code))return false;
  const hash=await emailDigest([purpose,email,account.toLowerCase(),code].join(':')),sql=this.storage.sql;
  // Re-read after hashing; concurrent attempts and resends cannot reuse a stale challenge.
  const row=sql.exec<Challenge>('SELECT * FROM email_challenges WHERE purpose=? AND email=?',purpose,email).toArray()[0];
  if(!row||row.account!==account.toLowerCase()||row.expires<=Date.now()||row.attempts>=5)return false;
  sql.exec('UPDATE email_challenges SET attempts=attempts+1 WHERE purpose=? AND email=?',purpose,email);
  if(!same(hash,row.hash))return false;
  sql.exec('DELETE FROM email_challenges WHERE purpose=? AND email=?',purpose,email);return true;
 }
 async bind(email:string,account:string,code:string):Promise<Result>{
  account=account.toLowerCase();if(!await this.check('verify',email,account,code))return {ok:false,error:'验证码无效或已过期'};
  return this.storage.transactionSync(()=>{if(this.lookup(email)||this.address(account))return {ok:false,error:'邮箱或账号已经绑定'};this.storage.sql.exec('INSERT INTO verified_emails VALUES(?,?,?)',normalizeAccountEmail(email),account,Date.now());return {ok:true};});
 }
 async consumeReset(email:string,account:string,code:string){if(this.lookup(email)!==account.toLowerCase())return false;return this.check('reset',email,account,code);}
}
