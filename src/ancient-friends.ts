// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {contentIssue} from './content-safety';
import {ANCIENT_MAP_LEVELS,AncientVisits} from './ancient-visits';
export type FriendActivity={kind:'lobby'|'map'|'community'|'editor'|'dungeon';map?:string;title?:string};
type Online={name:string;map:string;connectionId?:string;seen:number};
type MapInvite={id:string;sender:string;target:string;map:string;connection:string;expires:number};
const pair=(a:string,b:string)=>[a,b].sort().join('|');
export class AncientFriends{
 constructor(private sql:SqlStorage,private live:()=>Online[],private visits:AncientVisits,private activity:(name:string)=>FriendActivity|undefined=()=>undefined){
  for(const query of [
   'CREATE TABLE IF NOT EXISTS ancient_friends(owner TEXT NOT NULL,friend TEXT NOT NULL,PRIMARY KEY(owner,friend))',
   'CREATE TABLE IF NOT EXISTS ancient_friend_requests(sender TEXT NOT NULL,target TEXT NOT NULL,created INTEGER NOT NULL,PRIMARY KEY(sender,target))',
   'CREATE TABLE IF NOT EXISTS ancient_friend_messages(seq INTEGER PRIMARY KEY AUTOINCREMENT,pair TEXT NOT NULL,sender TEXT NOT NULL,text TEXT NOT NULL,at INTEGER NOT NULL)',
   'CREATE INDEX IF NOT EXISTS ancient_friend_messages_pair ON ancient_friend_messages(pair,seq)',
   'CREATE TABLE IF NOT EXISTS ancient_friend_unread(owner TEXT NOT NULL,friend TEXT NOT NULL,delivered INTEGER NOT NULL,opened INTEGER NOT NULL,PRIMARY KEY(owner,friend))',
   'CREATE TABLE IF NOT EXISTS ancient_friend_presence(name TEXT PRIMARY KEY,seen INTEGER NOT NULL)',
   'CREATE TABLE IF NOT EXISTS ancient_friend_invites(id TEXT PRIMARY KEY,sender TEXT NOT NULL,target TEXT NOT NULL,map TEXT NOT NULL,connection TEXT NOT NULL,expires INTEGER NOT NULL)',
   'CREATE TABLE IF NOT EXISTS ancient_friend_cooldowns(name TEXT NOT NULL,kind TEXT NOT NULL,until INTEGER NOT NULL,PRIMARY KEY(name,kind))'
  ])sql.exec(query);
 }
 private friends(a:string,b:string){return !!this.sql.exec('SELECT friend FROM ancient_friends WHERE owner=? AND friend=?',a,b).toArray()[0]}
 private limited(name:string,kind:string,ms:number){const now=Date.now(),row=this.sql.exec<{until:number}>('SELECT until FROM ancient_friend_cooldowns WHERE name=? AND kind=?',name,kind).toArray()[0];if(row&&row.until>now)return true;this.sql.exec('INSERT INTO ancient_friend_cooldowns VALUES(?,?,?) ON CONFLICT(name,kind) DO UPDATE SET until=excluded.until',name,kind,now+ms);return false}
 offline(name:string){this.sql.exec('DELETE FROM ancient_friend_presence WHERE name=?',name)}
 state(name:string){
  const now=Date.now(),live=this.live();this.sql.exec('INSERT INTO ancient_friend_presence VALUES(?,?) ON CONFLICT(name) DO UPDATE SET seen=excluded.seen',name,now);
  this.sql.exec('DELETE FROM ancient_friend_invites WHERE expires<=?',now);this.sql.exec('DELETE FROM ancient_friend_requests WHERE created<?',now-30*86400000);
  const friends=this.sql.exec<{name:string;seen:number;unread:number}>('SELECT f.friend AS name,p.seen,COALESCE(u.delivered-u.opened,0) AS unread FROM ancient_friends f LEFT JOIN ancient_friend_presence p ON p.name=f.friend LEFT JOIN ancient_friend_unread u ON u.owner=f.owner AND u.friend=f.friend WHERE f.owner=? ORDER BY f.friend',name).toArray().map(p=>{const actor=live.find(a=>a.name===p.name),activity=this.activity(p.name),online=!!actor||p.seen>now-20000||!!activity;return {name:p.name,online,unread:p.unread||0,...(online?{activity:activity||(actor?{kind:actor.map.startsWith('community:')?'community':actor.map.startsWith('dungeon:')?'dungeon':'map',map:actor.map}:{kind:'lobby'})}:{})}});
  const requests=this.sql.exec<{name:string}>('SELECT sender AS name FROM ancient_friend_requests WHERE target=? ORDER BY created',name).toArray();
  const incoming=this.sql.exec<MapInvite>('SELECT * FROM ancient_friend_invites WHERE target=? ORDER BY expires',name).toArray().filter(i=>this.friends(name,i.sender)&&live.some(a=>a.name===i.sender&&a.map===i.map&&a.connectionId===i.connection));
  return {friends,requests,incoming,unread:friends.reduce((n,p)=>n+p.unread,0)};
 }
 messages(name:string,target:string){return this.sql.exec<{from:string;text:string;at:number}>('SELECT sender AS `from`,text,at FROM ancient_friend_messages WHERE pair=? ORDER BY seq DESC LIMIT 15',pair(name,target)).toArray().reverse()}
 private readThrough(name:string,target:string){return this.sql.exec<{delivered:number}>('SELECT delivered FROM ancient_friend_unread WHERE owner=? AND friend=?',name,target).toArray()[0]?.delivered||0}
 command(name:string,action:string,data:Record<string,unknown>):{error?:string;messages?:ReturnType<AncientFriends['messages']>;readThrough?:number;joinMap?:string}{
  const target=String(data.target||'').trim().toLowerCase(),valid=/^[-_\p{L}\p{N}]{2,14}$/u.test(target),now=Date.now();
  if(action==='friendState')return {};
  if(action==='friendInviteRespond'){
   const id=String(data.id||''),i=this.sql.exec<MapInvite>('SELECT * FROM ancient_friend_invites WHERE id=? AND target=?',id,name).toArray()[0];
   if(!i||i.expires<=now)return {error:'Invitation expired'};
   this.sql.exec('DELETE FROM ancient_friend_invites WHERE id=?',id);
   if(data.accept!==true)return {};
   if(!this.friends(name,i.sender)||!this.live().some(a=>a.name===i.sender&&a.map===i.map&&a.connectionId===i.connection))return {error:'Your friend has left this map'};
   if(this.live().some(a=>a.name===name&&a.map===i.map))return {error:'Already in this map'};
   this.visits.grant(name,i.map);return {joinMap:i.map};
  }
  if(!valid||target===name)return {error:'Invalid friend account'};
  if(action==='friendAdd'){
   if(this.limited(name,'add',1500))return {error:'Please wait before trying again'};
   if(this.friends(name,target))return {};
   if(this.sql.exec<{n:number}>('SELECT COUNT(*) AS n FROM ancient_friends WHERE owner=?',name).toArray()[0].n>=100)return {error:'Friend list is full'};
   const pending=this.sql.exec<{n:number}>('SELECT COUNT(*) AS n FROM ancient_friend_requests WHERE target=? OR sender=?',target,name).toArray()[0].n;if(pending>=100)return {error:'Too many pending requests'};
   this.sql.exec('INSERT OR IGNORE INTO ancient_friend_requests VALUES(?,?,?)',name,target,now);return {};
  }
  if(action==='friendRequestRespond'){
   if(!this.sql.exec('SELECT sender FROM ancient_friend_requests WHERE sender=? AND target=?',target,name).toArray()[0])return {error:'Friend request expired'};
   if(data.accept===true){for(const n of [name,target])if(this.sql.exec<{n:number}>('SELECT COUNT(*) AS n FROM ancient_friends WHERE owner=?',n).toArray()[0].n>=100)return {error:'Friend list is full'};this.sql.exec('INSERT OR IGNORE INTO ancient_friends VALUES(?,?)',name,target);this.sql.exec('INSERT OR IGNORE INTO ancient_friends VALUES(?,?)',target,name)}
   this.sql.exec('DELETE FROM ancient_friend_requests WHERE (sender=? AND target=?) OR (sender=? AND target=?)',target,name,name,target);return {};
  }
  if(!this.friends(name,target))return {error:'This player is not your Ancient friend'};
  if(action==='friendRemove'){this.sql.exec('DELETE FROM ancient_friend_unread WHERE (owner=? AND friend=?) OR (owner=? AND friend=?)',name,target,target,name);this.sql.exec('DELETE FROM ancient_friends WHERE (owner=? AND friend=?) OR (owner=? AND friend=?)',name,target,target,name);this.sql.exec('DELETE FROM ancient_friend_invites WHERE (sender=? AND target=?) OR (sender=? AND target=?)',name,target,target,name);return {}}
  if(action==='friendRead'){const through=Number(data.through);if(!Number.isSafeInteger(through)||through<0)return {error:'Invalid read receipt'};this.sql.exec('UPDATE ancient_friend_unread SET opened=MAX(opened,MIN(delivered,?)) WHERE owner=? AND friend=?',through,name,target);return {}}
  if(action==='friendMessages')return {messages:this.messages(name,target),readThrough:this.readThrough(name,target)};
  if(action==='friendSend'){
   const text=String(data.text||'').normalize('NFKC').trim();if(!text||Array.from(text).length>200)return {error:'Messages must contain 1–200 characters'};const issue=contentIssue(text,'message');if(issue)return {error:issue};if(this.limited(name,'chat',500))return {error:'Please wait before trying again'};
   const key=pair(name,target);this.sql.exec('INSERT INTO ancient_friend_messages(pair,sender,text,at) VALUES(?,?,?,?)',key,name,text,now);this.sql.exec('INSERT INTO ancient_friend_unread VALUES(?,?,1,0) ON CONFLICT(owner,friend) DO UPDATE SET delivered=ancient_friend_unread.delivered+1',target,name);this.sql.exec('DELETE FROM ancient_friend_messages WHERE pair=? AND seq NOT IN (SELECT seq FROM ancient_friend_messages WHERE pair=? ORDER BY seq DESC LIMIT 15)',key,key);return {messages:this.messages(name,target),readThrough:this.readThrough(name,target)};
  }
  if(action==='friendMapInvite'){
   const host=this.live().find(a=>a.name===name),guest=this.live().find(a=>a.name===target);if(!host?.connectionId||!Object.hasOwn(ANCIENT_MAP_LEVELS,host.map))return {error:'Enter a shared map before inviting'};if(guest?.map===host.map)return {error:'Already in this map'};
   if(!guest&&!this.sql.exec('SELECT name FROM ancient_friend_presence WHERE name=? AND seen>?',target,now-20000).toArray()[0])return {error:'Friend is offline'};
   if(this.limited(name,'invite',3000))return {error:'Please wait before trying again'};
   this.sql.exec('DELETE FROM ancient_friend_invites WHERE (sender=? AND target=?) OR expires<=?',name,target,now);
   this.sql.exec('INSERT INTO ancient_friend_invites VALUES(?,?,?,?,?,?)',crypto.randomUUID(),name,target,host.map,host.connectionId,now+60000);return {};
  }
  return {error:'Invalid friend action'};
 }
}
