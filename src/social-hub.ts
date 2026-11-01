// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {DurableObject} from 'cloudflare:workers';
import {contentIssue} from './content-safety';

type Invite={id:string;from:string;to:string;mode:string;room:string;map:string;created:number;expires:number;status:'pending'|'accepting'|'accepted'|'rejected';};
type Message={from:string;text:string;at:number};
const MODES=new Set(['duel','ranked','normal','tri','quad','survival','ctf','hardpoint','bomb','gunmaster','challenge','extraction']);
const MAPS=new Set(['crossroads','depot','arcade']);
const key=(name:string)=>name.toLowerCase();
const pair=(a:string,b:string)=>[key(a),key(b)].sort().join('|');
const roomCode=()=>{const letters='ABCDEFGHJKLMNPQRSTUVWXYZ',digits='23456789',bytes=crypto.getRandomValues(new Uint8Array(6));return [...bytes].map((v,i)=>i%2?digits[v%digits.length]:letters[v%letters.length]).join('')};

// Social state is small and serialized in one object: a single invite cannot be accepted twice.
export class SocialHub extends DurableObject<Env>{
  constructor(ctx:DurableObjectState,env:Env){super(ctx,env);
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS social_friends (owner TEXT NOT NULL, friend TEXT NOT NULL, PRIMARY KEY(owner,friend))');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS social_requests (sender TEXT NOT NULL,target TEXT NOT NULL,created INTEGER NOT NULL,PRIMARY KEY(sender,target))');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS social_messages (pair TEXT NOT NULL, seq INTEGER PRIMARY KEY AUTOINCREMENT, sender TEXT NOT NULL, text TEXT NOT NULL, at INTEGER NOT NULL)');
    ctx.storage.sql.exec('CREATE INDEX IF NOT EXISTS social_messages_pair ON social_messages(pair,seq)');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS social_invites (id TEXT PRIMARY KEY,sender TEXT NOT NULL,target TEXT NOT NULL,mode TEXT NOT NULL,room TEXT NOT NULL,map TEXT NOT NULL,created INTEGER NOT NULL,expires INTEGER NOT NULL,status TEXT NOT NULL)');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS social_mutes (target TEXT NOT NULL,sender TEXT NOT NULL,until INTEGER NOT NULL,PRIMARY KEY(target,sender))');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS social_presence (name TEXT PRIMARY KEY,seen INTEGER NOT NULL)');
  }
  private friends(a:string,b:string){return Boolean(this.ctx.storage.sql.exec<{friend:string}>('SELECT friend FROM social_friends WHERE owner=? AND friend=?',key(a),key(b)).toArray()[0]);}
  private clean(){const now=Date.now();this.ctx.storage.sql.exec('DELETE FROM social_invites WHERE expires<?',now-60000);this.ctx.storage.sql.exec('DELETE FROM social_mutes WHERE until<?',now);this.ctx.storage.sql.exec('DELETE FROM social_presence WHERE seen<?',now-3600000);}
  state(name:string){this.clean();const me=key(name),now=Date.now();this.ctx.storage.sql.exec('INSERT INTO social_presence(name,seen) VALUES(?,?) ON CONFLICT(name) DO UPDATE SET seen=excluded.seen',me,now);
    const friends=this.ctx.storage.sql.exec<{friend:string;seen:number}>('SELECT f.friend,p.seen FROM social_friends f LEFT JOIN social_presence p ON p.name=f.friend WHERE f.owner=? ORDER BY f.friend',me).toArray().map(row=>({name:row.friend,online:(row.seen||0)>now-20000}));
    const incoming=this.ctx.storage.sql.exec<Invite>("SELECT id,sender AS 'from',target AS 'to',mode,room,map,created,expires,status FROM social_invites WHERE target=? AND status='pending' AND expires>? ORDER BY created DESC",me,now).toArray();
    const outgoing=this.ctx.storage.sql.exec<Invite>("SELECT id,sender AS 'from',target AS 'to',mode,room,map,created,expires,status FROM social_invites WHERE sender=? AND status IN ('pending','accepted') AND expires>? ORDER BY created DESC",me,now).toArray();
    const requests=this.ctx.storage.sql.exec<{sender:string;created:number}>('SELECT sender,created FROM social_requests WHERE target=? ORDER BY created DESC',me).toArray();
    return {ok:true,friends,requests,incoming,outgoing};
  }
  add(name:string,target:string){const me=key(name),them=key(target);if(me===them)return {ok:false,error:'不能添加自己'};if(this.friends(me,them))return {ok:true,already:true};const count=this.ctx.storage.sql.exec<{n:number}>('SELECT COUNT(*) AS n FROM social_friends WHERE owner=?',me).one().n;if(count>=100)return {ok:false,error:'好友已达 100 人上限'};
    if(this.ctx.storage.sql.exec<{sender:string}>('SELECT sender FROM social_requests WHERE sender=? AND target=?',them,me).toArray()[0])return this.respondFriend(me,them,'accept');
    this.ctx.storage.sql.exec('INSERT OR IGNORE INTO social_requests VALUES(?,?,?)',me,them,Date.now());return {ok:true,requested:true};}
  respondFriend(name:string,target:string,action:string){const me=key(name),them=key(target);const request=this.ctx.storage.sql.exec<{sender:string}>('SELECT sender FROM social_requests WHERE sender=? AND target=?',them,me).toArray()[0];if(!request)return {ok:false,error:'好友申请已失效'};
    if(action==='accept'&&[me,them].some(owner=>this.ctx.storage.sql.exec<{n:number}>('SELECT COUNT(*) AS n FROM social_friends WHERE owner=?',owner).one().n>=100))return {ok:false,error:'好友已达 100 人上限'};
    this.ctx.storage.sql.exec('DELETE FROM social_requests WHERE (sender=? AND target=?) OR (sender=? AND target=?)',them,me,me,them);
    if(action==='accept'){this.ctx.storage.sql.exec('INSERT OR IGNORE INTO social_friends VALUES(?,?)',me,them);this.ctx.storage.sql.exec('INSERT OR IGNORE INTO social_friends VALUES(?,?)',them,me)}return {ok:true};}
  remove(name:string,target:string){const me=key(name),them=key(target);this.ctx.storage.sql.exec('DELETE FROM social_friends WHERE (owner=? AND friend=?) OR (owner=? AND friend=?)',me,them,them,me);this.ctx.storage.sql.exec("UPDATE social_invites SET status='rejected' WHERE status='pending' AND ((sender=? AND target=?) OR (sender=? AND target=?))",me,them,them,me);return {ok:true};}
  messages(name:string,target:string){if(!this.friends(name,target))return {ok:false,error:'对方不在好友列表'};const rows=this.ctx.storage.sql.exec<Message>('SELECT sender AS `from`,text,at FROM social_messages WHERE pair=? ORDER BY seq DESC LIMIT 15',pair(name,target)).toArray().reverse();return {ok:true,messages:rows};}
  send(name:string,target:string,text:string){if(!this.friends(name,target))return {ok:false,error:'对方不在好友列表'};const value=text.trim().normalize('NFKC');if(!value||Array.from(value).length>200)return {ok:false,error:'消息需要 1–200 个字符'};const issue=contentIssue(value,'message');if(issue)return {ok:false,error:issue};const p=pair(name,target);this.ctx.storage.sql.exec('INSERT INTO social_messages(pair,sender,text,at) VALUES(?,?,?,?)',p,key(name),value,Date.now());this.ctx.storage.sql.exec('DELETE FROM social_messages WHERE pair=? AND seq NOT IN (SELECT seq FROM social_messages WHERE pair=? ORDER BY seq DESC LIMIT 15)',p,p);return this.messages(name,target);}
  async invite(name:string,target:string,mode:string,map:string,squad=''){this.clean();const me=key(name),them=key(target),now=Date.now();if(!this.friends(me,them))return {ok:false,error:'只能邀请好友'};if(!MODES.has(mode))return {ok:false,error:'模式无效'};if(!MAPS.has(map))map='crossroads';const mute=this.ctx.storage.sql.exec<{until:number}>('SELECT until FROM social_mutes WHERE target=? AND sender=?',them,me).toArray()[0];if(mute&&mute.until>now)return {ok:false,error:'对方暂时不接收你的邀请'};
    if(mode==='extraction'&&(!/^X[a-f0-9]{20}$/i.test(squad)||!await this.env.EXTRACTION_ROOMS.getByName(squad).authorize(me,them)))return {ok:false,error:'搜打撤队伍已满或已出发'};
    const prior=this.ctx.storage.sql.exec<Invite>("SELECT id,sender AS 'from',target AS 'to',mode,room,map,created,expires,status FROM social_invites WHERE sender=? AND target=? AND status='pending' AND expires>? ORDER BY created DESC LIMIT 1",me,them,now).toArray()[0];if(prior)return {ok:true,invite:prior,reused:true};
    const sent=this.ctx.storage.sql.exec<{n:number}>('SELECT COUNT(*) AS n FROM social_invites WHERE sender=? AND created>?',me,now-60000).one().n;if(sent>=6)return {ok:false,error:'邀请太频繁，请稍后再试'};
    const existing=mode==='ranked'?null:this.ctx.storage.sql.exec<{room:string}>("SELECT room FROM social_invites WHERE sender=? AND mode=? AND map=? AND status IN ('pending','accepted') AND expires>? ORDER BY created DESC LIMIT 1",me,mode,map,now).toArray()[0];
    const invite:Invite={id:crypto.randomUUID(),from:me,to:them,mode,room:mode==='extraction'?squad:mode==='ranked'?'M'+crypto.randomUUID().replaceAll('-','').slice(0,25):existing?.room||roomCode(),map:mode==='bomb'?'crossroads':map,created:now,expires:now+120000,status:'pending'};
    this.ctx.storage.sql.exec('INSERT INTO social_invites VALUES(?,?,?,?,?,?,?,?,?)',invite.id,me,them,mode,invite.room,invite.map,now,invite.expires,'pending');return {ok:true,invite};
  }
  async respond(name:string,id:string,action:string){this.clean();const me=key(name),invite=this.ctx.storage.sql.exec<Invite>("SELECT id,sender AS 'from',target AS 'to',mode,room,map,created,expires,status FROM social_invites WHERE id=? AND target=?",id,me).toArray()[0];if(!invite||invite.status!=='pending'||invite.expires<=Date.now())return {ok:false,error:'邀请已失效'};if(!this.friends(me,invite.from))return {ok:false,error:'对方已不是好友'};
    if(action==='accept'){
      this.ctx.storage.sql.exec("UPDATE social_invites SET status='accepting' WHERE id=? AND status='pending'",id);
      try{if(invite.mode==='ranked')await this.env.DUEL_MATCHMAKER.getByName('ranked-s1').authorizeFriendRoom(invite.room,invite.from,me)}catch(error){this.ctx.storage.sql.exec("UPDATE social_invites SET status='pending' WHERE id=? AND status='accepting'",id);throw error}
      this.ctx.storage.sql.exec("UPDATE social_invites SET status='accepted',expires=? WHERE id=? AND status='accepting'",Date.now()+60000,id);
      return {ok:true,invite:{...invite,status:'accepted'}};
    }
    if(action==='mute')this.ctx.storage.sql.exec('INSERT INTO social_mutes(target,sender,until) VALUES(?,?,?) ON CONFLICT(target,sender) DO UPDATE SET until=excluded.until',me,invite.from,Date.now()+300000);
    this.ctx.storage.sql.exec("UPDATE social_invites SET status='rejected' WHERE id=?",id);return {ok:true};
  }
}
