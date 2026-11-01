// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {AncientProfile} from './ancient-rules';
import type {AncientGear} from './ancient-gear';
export function ancientPartyShare(p:AncientProfile,xp:number,coins:number,drops:Record<string,number>,gear:AncientGear[],random=Math.random){
 const fractions=p.partyFractions??={},portion=(key:string,value:number)=>{const total=(fractions[key]||0)+value*.1,n=Math.floor(total+1e-9);fractions[key]=Math.max(0,total-n);return n};
 // Non-participants no longer earn XP merely by sharing a map/party.
 fractions.xp=0;
 const sharedXP=0,sharedCoins=portion('coins',coins*100)/100,sharedDrops:Record<string,number>={},sharedGear:AncientGear[]=[];
 p.coins=Math.round((p.coins+sharedCoins)*100)/100;
 for(const [key,value]of Object.entries(drops)){const n=portion('item:'+key,value);if(n){p.materials[key]=(p.materials[key]||0)+n;sharedDrops[key]=n}}
 p.gear??=[];for(const item of gear)if(p.gear.length<1000&&random()<.1){const copy={id:crypto.randomUUID(),key:item.key};p.gear.push(copy);sharedGear.push(copy)}
 return {xp:sharedXP,coins:sharedCoins,drops:sharedDrops,gearDrops:sharedGear};
}
export type AncientParty={id:string;leader:string;members:string[];blocked:string[]};
export type PartyPresence={name:string;map:string;seen:number};
export class AncientPartyStore{
 constructor(private sql:SqlStorage,private live:()=>PartyPresence[]){
  sql.exec('CREATE TABLE IF NOT EXISTS ancient_parties(id TEXT PRIMARY KEY,data TEXT NOT NULL)');
  sql.exec('CREATE TABLE IF NOT EXISTS ancient_party_members(name TEXT PRIMARY KEY,party TEXT NOT NULL)');
  sql.exec('CREATE TABLE IF NOT EXISTS ancient_party_invites(target TEXT NOT NULL,party TEXT NOT NULL,sender TEXT NOT NULL,expires INTEGER NOT NULL,PRIMARY KEY(target,party))');
  sql.exec('CREATE TABLE IF NOT EXISTS ancient_party_presence(name TEXT PRIMARY KEY,seen INTEGER NOT NULL)');
  sql.exec('CREATE TABLE IF NOT EXISTS ancient_party_ignored(target TEXT NOT NULL,party TEXT NOT NULL,expires INTEGER NOT NULL,PRIMARY KEY(target,party))');
  sql.exec('CREATE INDEX IF NOT EXISTS ancient_party_presence_seen ON ancient_party_presence(seen)');
  sql.exec('CREATE INDEX IF NOT EXISTS ancient_party_invites_expiry ON ancient_party_invites(expires)');
 }
 get(name:string){const row=this.sql.exec<{data:string}>('SELECT p.data FROM ancient_parties p JOIN ancient_party_members m ON m.party=p.id WHERE m.name=?',name).toArray()[0];return row?JSON.parse(row.data) as AncientParty:undefined}
 private byId(id:string){const row=this.sql.exec<{data:string}>('SELECT data FROM ancient_parties WHERE id=?',id).toArray()[0];return row?JSON.parse(row.data) as AncientParty:undefined}
 private save(p:AncientParty){this.sql.exec('INSERT INTO ancient_parties VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data',p.id,JSON.stringify(p))}
 touch(name:string,now=Date.now()){this.sql.exec('INSERT INTO ancient_party_presence VALUES(?,?) ON CONFLICT(name) DO UPDATE SET seen=excluded.seen',name,now)}
 online(now=Date.now()){const online=new Map<string,string>();for(const p of this.live())if(p.seen>=now-15000)online.set(p.name,p.map);for(const p of this.sql.exec<{name:string}>('SELECT name FROM ancient_party_presence WHERE seen>=?',now-15000).toArray())if(!online.has(p.name))online.set(p.name,'lobby');return online}
 state(name:string,now=Date.now()){
  this.sql.exec('DELETE FROM ancient_party_invites WHERE expires<=?',now);
  this.sql.exec('DELETE FROM ancient_party_ignored WHERE expires<=?',now);
  const p=this.get(name),online=this.online(now),map=online.get(name),members=p?.members.map(n=>({name:n,online:online.has(n),map:online.get(n)||''}))||[];
  return {party:p?{id:p.id,leader:p.leader,members,blocked:p.leader===name?p.blocked:[]}:null,nearby:map&&map!=='lobby'?[...online].filter(([n,m])=>n!==name&&m===map&&!p?.members.includes(n)).map(([n])=>({name:n,grouped:!!this.get(n),blocked:!!p?.blocked.includes(n)})):[],invites:this.sql.exec<{party:string;sender:string;expires:number}>('SELECT party,sender,expires FROM ancient_party_invites WHERE target=?',name).toArray()};
 }
 command(name:string,action:string,data:Record<string,unknown>,now=Date.now()):string|null{
  this.touch(name,now);if(action==='partyState')return null;
  let p=this.get(name);const target=String(data.target||'').toLowerCase();
  if(action==='partyInvite'){
   if(!target||target===name)return '请选择其他玩家';const online=this.online(now),map=online.get(name);
   if(!map||map==='lobby'||online.get(target)!==map)return '只能邀请本地图在线玩家';
   if(p?.blocked.includes(target))return '队长已拉黑该玩家';if(this.get(target))return '该玩家已经组队';
   if(!p){p={id:crypto.randomUUID(),leader:name,members:[name],blocked:[]};this.save(p);this.sql.exec('INSERT INTO ancient_party_members VALUES(?,?)',name,p.id)}
   const ignored=this.sql.exec<{expires:number}>('SELECT expires FROM ancient_party_ignored WHERE target=? AND party=?',target,p.id).toArray()[0];if(ignored&&ignored.expires>now)return null;
   const pending=this.sql.exec<{expires:number}>('SELECT expires FROM ancient_party_invites WHERE target=? AND party=?',target,p.id).toArray()[0];if(pending&&pending.expires>now)return '邀请已发送';
   this.sql.exec('INSERT INTO ancient_party_invites VALUES(?,?,?,?) ON CONFLICT(target,party) DO UPDATE SET sender=excluded.sender,expires=excluded.expires',target,p.id,name,now+60000);return null;
  }
  if(action==='partyAccept'||action==='partyDecline'||action==='partyIgnore'){
   const id=String(data.party||''),invite=this.sql.exec<{sender:string;expires:number}>('SELECT sender,expires FROM ancient_party_invites WHERE target=? AND party=?',name,id).toArray()[0];
   if(!invite||invite.expires<=now)return '邀请已失效';if(action==='partyDecline'||action==='partyIgnore'){if(action==='partyIgnore')this.sql.exec('INSERT INTO ancient_party_ignored VALUES(?,?,?) ON CONFLICT(target,party) DO UPDATE SET expires=excluded.expires',name,id,now+300000);this.sql.exec('DELETE FROM ancient_party_invites WHERE target=? AND party=?',name,id);return null}
   if(p)return '你已经组队';const other=this.byId(id);if(!other||!other.members.includes(invite.sender))return '邀请已失效';if(other.blocked.includes(name))return '队长已拉黑该玩家';
   other.members.push(name);this.sql.exec('INSERT INTO ancient_party_members VALUES(?,?)',name,id);this.save(other);this.sql.exec('DELETE FROM ancient_party_invites WHERE target=?',name);return null;
  }
  if(!p)return '你还没有队伍';
  if(action==='partyLeave'){this.remove(p,name);return null}
  if(p.leader!==name)return '只有队长可以操作';
  if(action==='partyKick'){if(!p.members.includes(target)||target===name)return '请选择其他队员';this.remove(p,target);return null}
  if(action==='partyBlock'){
   if(!target||target===name||target.length>64)return '请选择其他玩家';if(!p.blocked.includes(target))p.blocked.push(target);
   if(p.members.includes(target))this.remove(p,target);else this.save(p);
   this.sql.exec('DELETE FROM ancient_party_invites WHERE target=? AND party=?',target,p.id);return null;
  }
  if(action==='partyUnblock'){p.blocked=p.blocked.filter(n=>n!==target);this.save(p);return null}
  return '操作无效';
 }
 private remove(p:AncientParty,name:string){p.members=p.members.filter(n=>n!==name);this.sql.exec('DELETE FROM ancient_party_members WHERE name=?',name);this.sql.exec('DELETE FROM ancient_party_invites WHERE party=? AND sender=?',p.id,name);if(!p.members.length){this.sql.exec('DELETE FROM ancient_parties WHERE id=?',p.id);this.sql.exec('DELETE FROM ancient_party_invites WHERE party=?',p.id)}else{if(p.leader===name)p.leader=p.members[0];this.save(p)}}
 recipients(killer:string,now=Date.now()){const p=this.get(killer);if(!p)return [];const online=this.online(now),map=online.get(killer);if(!map||map==='lobby')return [];return p.members.filter(n=>n!==killer&&online.get(n)===map)}
}
