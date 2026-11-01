// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { DurableObject } from 'cloudflare:workers';
import {rankedAiProfile} from './ranked-rules';

type Ticket = { id:string; player:string; room:string; map:string; seen:number };
type RankedTicket={id:string;player:string;account:string;room:string;map:string;created:number;ai_at:number;ai_name:string;ai_profile:string;ai_since:number;result:string};
const MAPS=['crossroads','depot','arcade'];
const WAIT_MS=20_000;
const MATCH_MS=120_000;

export class DuelMatchmaker extends DurableObject<Env> {
  constructor(ctx:DurableObjectState,env:Env){
    super(ctx,env);
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS tickets (id TEXT PRIMARY KEY, player TEXT NOT NULL, room TEXT NOT NULL, map TEXT NOT NULL, seen INTEGER NOT NULL)');
    ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS ranked_tickets (id TEXT PRIMARY KEY,player TEXT NOT NULL,account TEXT NOT NULL,room TEXT NOT NULL DEFAULT '',map TEXT NOT NULL DEFAULT '',created INTEGER NOT NULL,ai_at INTEGER NOT NULL DEFAULT 0,ai_name TEXT NOT NULL DEFAULT '',ai_profile TEXT NOT NULL DEFAULT '',ai_since INTEGER NOT NULL DEFAULT 0,result TEXT NOT NULL DEFAULT '')");
    try{ctx.storage.sql.exec('ALTER TABLE ranked_tickets ADD COLUMN ai_at INTEGER NOT NULL DEFAULT 0')}catch{}
    try{ctx.storage.sql.exec("ALTER TABLE ranked_tickets ADD COLUMN ai_profile TEXT NOT NULL DEFAULT ''")}catch{}
    ctx.storage.sql.exec('UPDATE ranked_tickets SET ai_at=created+10000 WHERE ai_at=0');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS friend_ranked_rooms (room TEXT NOT NULL,account TEXT NOT NULL,created INTEGER NOT NULL,PRIMARY KEY(room,account))');
  }
  private clean(now:number){this.ctx.storage.sql.exec('DELETE FROM tickets WHERE (room=\'\' AND seen<?) OR (room<>\'\' AND seen<?)',now-WAIT_MS,now-MATCH_MS)}
  join(player:string){
    const now=Date.now();this.clean(now);
    // A player may refresh or click twice while queued; keep one unmatched ticket per identity.
    this.ctx.storage.sql.exec("DELETE FROM tickets WHERE player=? AND room=''",player);
    const id=crypto.randomUUID();
    const peer=this.ctx.storage.sql.exec<Ticket>('SELECT * FROM tickets WHERE room=\'\' AND player<>? ORDER BY seen ASC LIMIT 1',player).toArray()[0];
    if(peer){
      const room='M'+crypto.randomUUID().replaceAll('-','').slice(0,25);
      const map=MAPS[Math.floor(Math.random()*MAPS.length)];
      this.ctx.storage.sql.exec('UPDATE tickets SET room=?,map=?,seen=? WHERE id=?',room,map,now,peer.id);
      this.ctx.storage.sql.exec('INSERT INTO tickets VALUES (?,?,?,?,?)',id,player,room,map,now);
      return {ticket:id,status:'matched',room,map};
    }
    this.ctx.storage.sql.exec('INSERT INTO tickets VALUES (?,?,?,?,?)',id,player,'','',now);
    return {ticket:id,status:'waiting'};
  }
  status(id:string){
    const now=Date.now();this.clean(now);
    const row=this.ctx.storage.sql.exec<Ticket>('SELECT * FROM tickets WHERE id=?',id).toArray()[0];
    if(!row)return {status:'expired'};
    if(!row.room){this.ctx.storage.sql.exec('UPDATE tickets SET seen=? WHERE id=?',now,id);return {status:'waiting'};}
    return {status:'matched',room:row.room,map:row.map};
  }
  cancel(id:string){this.ctx.storage.sql.exec('DELETE FROM tickets WHERE id=?',id);return {ok:true}}
  joinRanked(player:string,account:string){
    const now=Date.now();
    this.ctx.storage.sql.exec("DELETE FROM ranked_tickets WHERE created<?",now-24*60*60*1000);
    this.ctx.storage.sql.exec("DELETE FROM ranked_tickets WHERE account=? AND room='' AND ai_name=''",account);
    const id=crypto.randomUUID();
    const peer=this.ctx.storage.sql.exec<RankedTicket>("SELECT * FROM ranked_tickets WHERE room='' AND ai_name='' AND account<>? AND ai_at>? ORDER BY created LIMIT 1",account,now).toArray()[0];
    if(peer){
      const room='M'+crypto.randomUUID().replaceAll('-','').slice(0,25),map=MAPS[crypto.getRandomValues(new Uint32Array(1))[0]%MAPS.length];
      this.ctx.storage.sql.exec('UPDATE ranked_tickets SET room=?,map=? WHERE id=?',room,map,peer.id);
      this.ctx.storage.sql.exec('INSERT INTO ranked_tickets(id,player,account,room,map,created) VALUES(?,?,?,?,?,?)',id,player,account,room,map,now);
      return {ticket:id,status:'matched',room,map};
    }
    const random=crypto.getRandomValues(new Uint32Array(1))[0],aiAt=now+5000+random%5001;
    this.ctx.storage.sql.exec('INSERT INTO ranked_tickets(id,player,account,created,ai_at) VALUES(?,?,?,?,?)',id,player,account,now,aiAt);
    return {ticket:id,status:'waiting',startedAt:now,until:aiAt};
  }
  rankedStatus(id:string,account:string,seasonLevel:number){
    const row=this.ctx.storage.sql.exec<RankedTicket>('SELECT * FROM ranked_tickets WHERE id=? AND account=?',id,account).toArray()[0];
    if(!row)return {status:'expired'};
    if(row.room)return {status:'matched',room:row.room,map:row.map};
    if(row.ai_name)return {status:'ai',name:row.ai_name,aiProfile:row.ai_profile||'master',ticket:id};
    const now=Date.now();if(now<row.ai_at)return {status:'waiting',startedAt:row.created,until:row.ai_at};
    const adjectives=['疾风','赤曜','沉着','破晓','孤影','霜刃','无声','坚毅'];
    const nouns=['猎手','先锋','守卫','游侠','战鹰','影刃','星轨','壁垒'];
    const bytes=crypto.getRandomValues(new Uint32Array(3));
    const name=`${adjectives[bytes[0]%adjectives.length]}${nouns[bytes[1]%nouns.length]}${String(bytes[2]%1000).padStart(3,'0')}`;
    const aiProfile=rankedAiProfile(seasonLevel,bytes[2]%100);
    this.ctx.storage.sql.exec('UPDATE ranked_tickets SET ai_name=?,ai_profile=?,ai_since=? WHERE id=?',name,aiProfile,now,id);
    return {status:'ai',name,aiProfile,ticket:id};
  }
  rankedCancel(id:string,account:string){
    const row=this.ctx.storage.sql.exec<RankedTicket>('SELECT * FROM ranked_tickets WHERE id=? AND account=?',id,account).toArray()[0];
    if(row?.room)this.ctx.storage.sql.exec("UPDATE ranked_tickets SET room='',map='' WHERE room=? AND id<>?",row.room,id);
    if(row&&!row.result)this.ctx.storage.sql.exec('DELETE FROM ranked_tickets WHERE id=?',id);
    return {ok:true};
  }
  rankedFinishAi(id:string,account:string,playerScore:number,aiScore:number){
    const row=this.ctx.storage.sql.exec<RankedTicket>('SELECT * FROM ranked_tickets WHERE id=? AND account=?',id,account).toArray()[0];
    if(!row?.ai_name||Date.now()<row.ai_since+20_000)return null;
    if(!Number.isInteger(playerScore)||!Number.isInteger(aiScore)||playerScore<0||aiScore<0||playerScore>10||aiScore>10||Math.max(playerScore,aiScore)!==10||Math.min(playerScore,aiScore)===10)return null;
    const outcome={matchId:'ai:'+id,won:playerScore===10,deaths:aiScore};
    if(row.result)return JSON.parse(row.result) as typeof outcome;
    this.ctx.storage.sql.exec('UPDATE ranked_tickets SET result=? WHERE id=?',JSON.stringify(outcome),id);
    return outcome;
  }
  isRankedParticipant(room:string,account:string){
    return Boolean(this.ctx.storage.sql.exec<{id:string}>('SELECT id FROM ranked_tickets WHERE LOWER(room)=? AND account=? LIMIT 1',room.toLowerCase(),account).toArray()[0]||this.ctx.storage.sql.exec<{room:string}>('SELECT room FROM friend_ranked_rooms WHERE room=? AND account=?',room.toLowerCase(),account).toArray()[0]);
  }
  authorizeFriendRoom(room:string,first:string,second:string){
    if(!/^M[a-f0-9]{25}$/i.test(room)||first===second)throw Error('排位房间无效');
    const now=Date.now();this.ctx.storage.sql.exec('DELETE FROM friend_ranked_rooms WHERE created<?',now-24*60*60*1000);
    for(const account of [first,second])this.ctx.storage.sql.exec('INSERT OR IGNORE INTO friend_ranked_rooms VALUES(?,?,?)',room.toLowerCase(),account,now);
    return {ok:true};
  }
}
