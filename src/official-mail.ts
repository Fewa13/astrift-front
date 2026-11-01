// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {MailReward} from './admin-rewards';
import {ACCOUNT_SENDERS} from './account-email';
export type OfficialMail={id:string;title:string;titleEn:string;body:string;bodyEn:string;channel?:'game'|'email'|'both';announcement?:boolean;rewards?:MailReward[]};
export const RETIRED_MAIL='ancient-xp-compensation-20261015';
// Called by trusted server code only. No public publishing endpoint.
export class OfficialMailStore{
 constructor(private storage:DurableObjectStorage,private email:SendEmail){
  storage.sql.exec('CREATE TABLE IF NOT EXISTS official_mail_reads(account TEXT NOT NULL,id TEXT NOT NULL,readAt INTEGER NOT NULL,PRIMARY KEY(account,id))');
  storage.sql.exec('CREATE TABLE IF NOT EXISTS official_mail(id TEXT PRIMARY KEY,data TEXT NOT NULL,created INTEGER NOT NULL)');
  storage.sql.exec('CREATE TABLE IF NOT EXISTS official_mail_recipients(id TEXT NOT NULL,account TEXT NOT NULL,email TEXT NOT NULL,status TEXT NOT NULL,attempts INTEGER NOT NULL,next INTEGER NOT NULL,PRIMARY KEY(id,account))');
 }
 inbox(account:string){const reads=new Map(this.storage.sql.exec<{id:string;readAt:number}>('SELECT id,readAt FROM official_mail_reads WHERE account=?',account.toLowerCase()).toArray().map(r=>[r.id,r.readAt]));return this.storage.sql.exec<{data:string;created:number}>("SELECT m.data,m.created FROM official_mail m LEFT JOIN official_mail_recipients r ON m.id=r.id AND r.account=? WHERE (r.account IS NOT NULL OR json_extract(m.data,'$.announcement')=1) AND m.id<>? AND COALESCE(json_extract(m.data,'$.channel'),'both')<>'email' ORDER BY m.created DESC",account.toLowerCase(),RETIRED_MAIL).toArray().map(r=>({...JSON.parse(r.data),createdAt:r.created,readAt:reads.get(JSON.parse(r.data).id)||0,sender:'ASTRIFT',date:new Date(r.created).toISOString().slice(0,10)}));}

 markRead(account:string,id:string){if(!this.inbox(account).some(m=>m.id===id))return {ok:false};this.storage.sql.exec('INSERT OR IGNORE INTO official_mail_reads VALUES(?,?,?)',account.toLowerCase(),id,Date.now());return {ok:true}}
 async publish(mail:OfficialMail,recipients:{account:string;email:string}[]){
  if(!mail||mail.id===RETIRED_MAIL||!/^[-a-zA-Z0-9_]{1,100}$/.test(mail.id)||![mail.title,mail.titleEn,mail.body,mail.bodyEn].every(s=>typeof s==='string'&&s.trim()&&s.length<=12000)||recipients.length>1000)throw new Error('Invalid official mail');
  const fresh=this.storage.transactionSync(()=>{
   if(this.storage.sql.exec('SELECT id FROM official_mail WHERE id=?',mail.id).toArray().length)return false;
   this.storage.sql.exec('INSERT INTO official_mail VALUES(?,?,?)',mail.id,JSON.stringify(mail),Date.now());
   for(const r of recipients)this.storage.sql.exec('INSERT OR IGNORE INTO official_mail_recipients VALUES(?,?,?,?,?,?)',mail.id,r.account.toLowerCase(),r.email,r.email&&mail.channel!=='game'?'pending':'in_game_only',0,Date.now());
   return true;
  });
  await this.storage.setAlarm(Date.now()+1000);
  return {ok:true,created:fresh};
 }
 async deliver(){
  const rows=this.storage.sql.exec<{id:string;account:string;email:string;attempts:number;data:string}>('SELECT r.id,r.account,r.email,r.attempts,m.data FROM official_mail_recipients r JOIN official_mail m ON m.id=r.id WHERE r.status=? AND r.next<=? LIMIT 20','pending',Date.now()).toArray();
  if(rows.length)await this.storage.setAlarm(Date.now()+300000);
  for(const r of rows){
   // Lease before sending; a restart retries an unfinished delivery.
   this.storage.sql.exec('UPDATE official_mail_recipients SET next=? WHERE id=? AND account=?',Date.now()+300000,r.id,r.account);
   try{const m=JSON.parse(r.data) as OfficialMail;const rewardNote=m.rewards?.length?'\n\n附件奖励（请进入游戏领取） / Attachments (claim in game):\n'+m.rewards.map(r=>`${r.name||r.key} × ${r.quantity}`).join('\n'):'';const duplicate=m.title===m.titleEn&&m.body===m.bodyEn,alternate=duplicate?'':`\n\n${m.titleEn}\n${m.bodyEn}`,inboxNote=m.channel==='email'?'':'\n\n游戏内邮箱也可查看。Also available in your in-game mailbox.';const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
    await this.email.send({from:{email:ACCOUNT_SENDERS.notice,name:'Astrift'},to:r.email,replyTo:ACCOUNT_SENDERS.notice,subject:`Astrift · ${m.title}${m.titleEn===m.title?'':' / '+m.titleEn}`.replace(/[\r\n]/g,' ').slice(0,240),text:`${m.title}\n${m.body}${alternate}${rewardNote}${inboxNote}\n请勿回复 / Do not reply. help@astrift.com`,html:`<h2>${escape(m.title)}</h2><p style="white-space:pre-wrap">${escape(m.body)}</p>${duplicate?'':`<h2>${escape(m.titleEn)}</h2><p style="white-space:pre-wrap">${escape(m.bodyEn)}</p>`}${rewardNote?`<pre style="white-space:pre-wrap">${escape(rewardNote)}</pre>`:''}<p>请勿回复 / Do not reply. help@astrift.com</p>`});
    this.storage.sql.exec('UPDATE official_mail_recipients SET status=? WHERE id=? AND account=?','sent',r.id,r.account);
   }catch{this.storage.sql.exec('UPDATE official_mail_recipients SET attempts=?,status=?,next=? WHERE id=? AND account=?',r.attempts+1,r.attempts>=5?'failed':'pending',Date.now()+60000*2**r.attempts,r.id,r.account);}
  }
  const next=this.storage.sql.exec<{due:number}>('SELECT MIN(next) AS due FROM official_mail_recipients WHERE status=?','pending').toArray()[0]?.due;
  if(next)await this.storage.setAlarm(Math.max(Date.now()+1000,next));
 }
}
