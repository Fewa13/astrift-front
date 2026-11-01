// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {GameGuide,type GuideInput,type GuideEnv} from './game-guide';
import {AccountEmailStore,ACCOUNT_SENDERS} from './account-email';
import {AdminControl} from './admin-control';
import {ProblemReports} from './problem-reports';
import {OfficialMailStore,type OfficialMail} from './official-mail';
import {DurableObject} from 'cloudflare:workers';

// One globally addressed object serializes account/device claims across account objects.
export class AccountSessionRegistry extends DurableObject<Env>{
  private emailStore:AccountEmailStore;
  private adminStore?:AdminControl;
  private mailStore?:OfficialMailStore;
  constructor(ctx:DurableObjectState,env:Env){
    super(ctx,env);
    this.emailStore=new AccountEmailStore(ctx.storage,env.EMAIL);
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS active_sessions (account TEXT PRIMARY KEY,device TEXT NOT NULL UNIQUE,token_hash TEXT NOT NULL,expires INTEGER NOT NULL)');
  }
  gameGuideStatus(){return new GameGuide(this.ctx.storage,this.env as Env & GuideEnv).diagnostics()}
  gameGuide(account:string,input:GuideInput){return new GameGuide(this.ctx.storage,this.env as Env & GuideEnv).handle(account,input)}
  submitProblemReport(device:string,ip:string,id:string,report:string){return new ProblemReports(this.ctx.storage,this.env.EMAIL).submit(device,ip,id,report)}
  private admin(){return this.adminStore??=new AdminControl(this.ctx.storage,this.env)}
  adminLogin(stage:number,password:string,ip:string,challenge:string){return this.admin().login(stage,password,ip,challenge)}
  adminValid(token:string,ip:string){return this.admin().valid(token,ip)}
  adminLogout(token:string){return this.admin().logout(token)}
  banState(account:string){return this.admin().banState(account)}
  async socketTicket(account:string,path:string){if(this.banState(account))return null;this.ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS fps_socket_tickets(hash TEXT PRIMARY KEY,account TEXT NOT NULL,path TEXT NOT NULL,expires INTEGER NOT NULL)');const ticket=crypto.randomUUID()+crypto.randomUUID();this.ctx.storage.sql.exec('DELETE FROM fps_socket_tickets WHERE expires<?',Date.now());this.ctx.storage.sql.exec('INSERT INTO fps_socket_tickets VALUES(?,?,?,?)',await (await import('./account-email')).emailDigest(ticket),account,path,Date.now()+30000);return ticket}
  async consumeSocketTicket(ticket:string,path:string){if(ticket.length!==72)return '';const sql=this.ctx.storage.sql;sql.exec('CREATE TABLE IF NOT EXISTS fps_socket_tickets(hash TEXT PRIMARY KEY,account TEXT NOT NULL,path TEXT NOT NULL,expires INTEGER NOT NULL)');const hash=await (await import('./account-email')).emailDigest(ticket);const row=sql.exec<{account:string;path:string;expires:number}>('SELECT account,path,expires FROM fps_socket_tickets WHERE hash=?',hash).toArray()[0];if(!row||row.path!==path||row.expires<=Date.now()||this.banState(row.account))return '';sql.exec('DELETE FROM fps_socket_tickets WHERE hash=?',hash);return row.account}
  rememberSocket(account:string,path:string){this.ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS account_socket_paths(account TEXT NOT NULL,path TEXT NOT NULL,seen INTEGER NOT NULL,PRIMARY KEY(account,path))');this.ctx.storage.sql.exec('INSERT INTO account_socket_paths VALUES(?,?,?) ON CONFLICT(account,path) DO UPDATE SET seen=excluded.seen',account,path,Date.now())}
  async kickBannedRooms(account:string){
   this.ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS account_socket_paths(account TEXT NOT NULL,path TEXT NOT NULL,seen INTEGER NOT NULL,PRIMARY KEY(account,path))');
   const rows=this.ctx.storage.sql.exec<{path:string}>('SELECT path FROM account_socket_paths WHERE account=?',account).toArray();
   for(const {path}of rows){const m=path.match(/^\/api\/(room|duel|tri|quad|gunmaster|challenge|ranked|tournament|survival|ctf|hardpoint|bomb|extraction)\/([^/]+)$/);if(!m)continue;const kind=m[1],key=kind==='extraction'?m[2]:(kind==='room'?'':kind+':')+m[2].toLowerCase();try{if(kind==='bomb')await this.env.BOMB_ROOMS.getByName(key).kickAccount(account);else if(kind==='extraction')await this.env.EXTRACTION_ROOMS.getByName(key).kickAccount(account);else if(kind==='ctf'||kind==='hardpoint')await this.env.OBJECTIVE_ROOMS.getByName(key).kickAccount(account);else await this.env.GAME_ROOMS.getByName(key).kickAccount(account)}catch{/* A stale room must not undo the ban. */}}
  }
  adminState(){return {bans:this.admin().bans(),logs:this.admin().logs()}}
  adminBan(id:string,name:string,seconds:number|null,reason:string){return this.admin().setBan(id,name,seconds,reason)}
  adminUnban(id:string,name:string){this.admin().unban(id,name);return {ok:true}}
  knownAccounts(){return Array.from(new Set([...this.ctx.storage.sql.exec<{account:string}>('SELECT account FROM active_sessions').toArray().map(r=>r.account),...this.ctx.storage.sql.exec<{account:string}>('SELECT account FROM verified_emails').toArray().map(r=>r.account)]))}
  async adminPublish(mail:OfficialMail,accounts:string[]){this.admin().record(mail.id,mail.announcement?'announcement':mail.channel==='email'?'email':'game-mail',mail.announcement?'all':accounts.join(','),{title:mail.title,body:mail.body,rewards:mail.rewards||[],channel:mail.channel});return this.publishOfficialMail(mail,accounts)}
  private officialMail(){return this.mailStore??=new OfficialMailStore(this.ctx.storage,this.env.EMAIL)}
  officialInbox(account:string):Array<OfficialMail & {sender:string;date:string}>{return this.officialMail().inbox(account)}
  officialMailRead(account:string,id:string){return this.officialMail().markRead(account,id)}
  publishOfficialMail(mail:OfficialMail,accounts:string[]){return this.officialMail().publish(mail,accounts.map(account=>({account,email:this.emailStore.address(account.toLowerCase())}))) }
  async alarm(){await this.officialMail().deliver()}
  claim(account:string,device:string,tokenHash:string,expires:number){
    if(this.banState(account))return false;
    if(!/^[0-9a-f-]{36}$/i.test(device)||!/^([a-f0-9]{64})$/i.test(tokenHash))return false;
    this.ctx.storage.sql.exec('DELETE FROM active_sessions WHERE account=? OR device=? OR expires<=?',account,device,Date.now());
    this.ctx.storage.sql.exec('INSERT INTO active_sessions VALUES(?,?,?,?)',account,device,tokenHash,expires);
    return true;
  }
  active(account:string,device:string,tokenHash:string){
    if(this.banState(account))return false;
    const row=this.ctx.storage.sql.exec<{device:string;token_hash:string;expires:number}>('SELECT device,token_hash,expires FROM active_sessions WHERE account=?',account).toArray()[0];
    return Boolean(row&&row.device===device&&row.token_hash===tokenHash&&row.expires>Date.now());
  }
  release(account:string,device:string,tokenHash:string){
    this.ctx.storage.sql.exec('DELETE FROM active_sessions WHERE account=? AND device=? AND token_hash=?',account,device,tokenHash);
  }
  emailAccount(email:string){return this.emailStore.lookup(email)}
  accountEmail(account:string){return this.emailStore.address(account)}
  requestEmailCode(purpose:'verify'|'reset',email:string,account:string,ipKey:string){return this.emailStore.request(purpose,email,account,ipKey)}
  bindEmail(email:string,account:string,code:string){return this.emailStore.bind(email,account,code)}
  consumeEmailReset(email:string,account:string,code:string){return this.emailStore.consumeReset(email,account,code)}
  revokeAccount(account:string){this.ctx.storage.sql.exec('DELETE FROM active_sessions WHERE account=?',account.toLowerCase());}
  async passwordResetNotice(account:string){const email=this.emailStore.address(account);if(!email)return;await this.env.EMAIL.send({from:{email:ACCOUNT_SENDERS.security,name:'Astrift Security'},to:email,replyTo:ACCOUNT_SENDERS.security,subject:'Astrift · 密码已重设 / Password changed',text:'你的 Astrift 账号密码已通过邮箱验证码重设，旧登录已失效。若非本人操作，请联系 help@astrift.com。Your Astrift password has been reset using email verification. Previous sessions were revoked. If this was not you, contact help@astrift.com. 请勿回复 / Do not reply.',html:'<h2>密码已重设 / Password changed</h2><p>你的 Astrift 密码已通过邮箱验证码重设，旧登录已失效。</p><p>Your Astrift password was reset using email verification. Previous sessions were revoked.</p><p>非本人操作请联系 / If this was not you, contact help@astrift.com.</p>'});}
}
