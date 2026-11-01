// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {ACCOUNT_SENDERS} from './account-email';
type Result={ok:boolean;error?:string;retryAfter?:number;id?:string};
export class ProblemReports{
 constructor(private storage:DurableObjectStorage,private email:SendEmail){
  storage.sql.exec('CREATE TABLE IF NOT EXISTS problem_report_limits(key TEXT PRIMARY KEY,start INTEGER NOT NULL,count INTEGER NOT NULL,blocked INTEGER NOT NULL)');
  storage.sql.exec('CREATE TABLE IF NOT EXISTS problem_report_receipts(id TEXT PRIMARY KEY,device TEXT NOT NULL,status TEXT NOT NULL,created INTEGER NOT NULL)');
 }
 async submit(device:string,ip:string,id:string,report:string):Promise<Result>{
  if(!/^[0-9a-f-]{36}$/i.test(device)||!/^([a-f0-9]{64})$/i.test(ip)||!(/^[0-9a-f-]{36}$/i.test(id))||typeof report!=='string'||report.length<20||report.length>6000)return {ok:false,error:'INVALID_REPORT'};
  const sql=this.storage.sql,now=Date.now();
  const previous=sql.exec<{device:string;status:string}>('SELECT device,status FROM problem_report_receipts WHERE id=?',id).toArray()[0];
  if(previous){if(previous.device!==device)return {ok:false,error:'INVALID_REPORT'};return previous.status==='sent'?{ok:true,id}:{ok:false,error:previous.status==='sending'?'REPORT_PENDING':'REPORT_SEND_FAILED',retryAfter:60}}
  sql.exec('DELETE FROM problem_report_limits WHERE start<? AND blocked<?',now-86400000,now);sql.exec('DELETE FROM problem_report_receipts WHERE created<?',now-7*86400000);
  const limit=(key:string,max:number,window:number,ban:number)=>{
   const row=sql.exec<{start:number;count:number;blocked:number}>('SELECT start,count,blocked FROM problem_report_limits WHERE key=?',key).toArray()[0];
   if(row&&row.blocked>now)return Math.ceil((row.blocked-now)/1000);
   const active=!!row&&now-row.start<window,count=active?row.count+1:1,start=active?row.start:now,blocked=count>max?now+ban:0;
   sql.exec('INSERT INTO problem_report_limits VALUES(?,?,?,?) ON CONFLICT(key) DO UPDATE SET start=excluded.start,count=excluded.count,blocked=excluded.blocked',key,start,count,blocked);return blocked?Math.ceil(ban/1000):0;
  };
  // Limits persist across Worker restarts. Shared school IPs get a larger allowance.
  for(const [key,max,window,ban]of [['device-short:'+device,1,300000,600000],['device-hour:'+device,3,3600000,3600000],['ip:'+ip,15,3600000,900000],['global-hour',30,3600000,3600000],['global-day',100,86400000,3600000]] as const){const wait=limit(key,max,window,ban);if(wait)return {ok:false,error:'REPORT_RATE_LIMIT',retryAfter:wait}}
  sql.exec('INSERT INTO problem_report_receipts VALUES(?,?,?,?)',id,device,'sending',now);
  const clean=report.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/(https?:\/\/[^\s?]+)\?[^\s]*/g,'$1'),text=`问题报告 / Problem report\nReport ID: ${id}\nReceived: ${new Date(now).toISOString()}\n\n${clean}`;
  const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
  try{await this.email.send({from:{email:ACCOUNT_SENDERS.notice,name:'Astrift Problem Reports'},to:'help@astrift.com',subject:'Astrift · 连接问题报告 / Connection problem report',text,html:'<h2>Astrift 问题报告 / Problem report</h2><pre style="white-space:pre-wrap">'+escape(text)+'</pre>'});sql.exec('UPDATE problem_report_receipts SET status=? WHERE id=?','sent',id);return {ok:true,id}}
  catch{sql.exec('UPDATE problem_report_receipts SET status=? WHERE id=?','failed',id);return {ok:false,error:'REPORT_SEND_FAILED',retryAfter:60}}
 }
}
