// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {requiresClientVersion,currentClient,clientVersionResponse} from './client-version';
import {adminAPI} from './admin-api';
import {normalizeAccountEmail,emailDigest} from './account-email';
import {worldEntry} from './world-entry';
import {initDamageReceipts,recordDamageReceipt,confirmDamageReceipt,sendDamageReceipt} from './damage-receipts';
import { DurableObject } from "cloudflare:workers";
import { DuelRoomEngine } from "./duel-room";
import {SurvivalRoomEngine} from './survival-room';
import {initCoverState,resetCoverState,coverSnapshot,applyCoverDamage} from './cover-state';
import {initSupply,resetSupply,supplySnapshot,claimSupply} from './supply-state';
import {contentIssue,roomChat} from './content-safety';
import type {PushEnv} from './tournament-push';
export { ObjectiveRoom } from './objective-room';
export { BombRoom } from './bomb-room';
export { LoadoutCodeRegistry } from './loadout-codes';
export { ForumBoard } from './forum';
export { DuelMatchmaker } from './duel-matchmaker';
export { PlayerAccount } from './player-account';
export { AccountSessionRegistry } from './account-session-registry';
export { TournamentHub } from './tournament-hub';
export { SocialHub } from './social-hub';
export {SurvivalLeaderboard} from './survival-leaderboard';
export {ExtractionRoom} from './extraction-room';
export {AncientWorld} from './ancient-world';

type ClientMessage = {
  type: "damageAck" | "join" | "chat" | "state" | "shot" | "rocket" | "blast" | "throwable" | "throwableBurst" | "muzzle" | "phaseFlash" | "coverHit" | "supplyClaim" | "leave" | "death" | "heal" | "survivalBots" | "survivalWave" | "survivalHit" | "survivalEnd" | "survivalBotShot" | "survivalBotDown";
  text?: string;
  effect?: string;
  coverId?: string;
  shotId?: string;
  hitPoint?: [number,number,number];
  id?: string;
  name?: string;
  color?: string;
  position?: [number, number, number];
  targets?: string[];
  rotation?: number;
  yaw?: number;
  prone?: boolean;
  slide?: boolean;
  hp?: number;
  score?: number;
  target?: string;
  damage?: number;
  zone?: "head" | "body" | "abdomen" | "arm" | "leg" | "explosion";
  team?: number;
  reconnect?: boolean;
  creator?: boolean;
  origin?: [number, number, number];
  rocketId?: string;
  throwId?: string;
  kind?: "smoke" | "grenade";
  fuseMs?: number;
  velocity?: [number,number,number];
  radius?: number;
  incendiary?: boolean;
  smoke?: boolean;
  cluster?: boolean;
  direction?: [number, number, number];
  speed?: number;
  drop?: number;
  life?: number;
  hidden?: boolean;
  skin?: string;
  knifeSkin?: string;
  weapon?: string;
  map?: string;
  wave?: number;
  bots?: unknown[];
  botId?: string;
};

export class GameRoom extends DurableObject<Env> {
  kickAccount(name:string){for(const ws of this.ctx.getWebSockets('account:'+encodeURIComponent(name)))try{ws.close(1008,'Account banned')}catch{}}
  private duel?: DuelRoomEngine;
  private survival?:SurvivalRoomEngine;
  private survivalRoom(){return this.survival??=new SurvivalRoomEngine(this.ctx,this.env)}
  private phaseFlashTimes=new Map<string,number>();
  private duelRoom(mode?: 'duel' | 'tri' | 'quad' | 'gunmaster' | 'challenge' | 'ranked' | 'tournament',roomCode=''){return this.duel??=new DuelRoomEngine(this.ctx,this.env,mode,roomCode);}
  rankedResultFor(accountKey:string){return this.duelRoom().rankedResultFor(accountKey)}
  alarm(){if(this.survival||this.ctx.getWebSockets().some(s=>(s.deserializeAttachment() as {towerSurvival?:boolean}|null)?.towerSurvival))return this.survivalRoom().alarm();try{if(this.ctx.storage.sql.exec('SELECT id FROM tower_session WHERE id=1').toArray().length)return this.survivalRoom().alarm()}catch{}return this.duelRoom().alarm();}
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    initDamageReceipts(ctx);
    ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS match_score (id INTEGER PRIMARY KEY, blue INTEGER, red INTEGER, revision INTEGER)");
    ctx.storage.sql.exec("INSERT OR IGNORE INTO match_score VALUES (1,0,0,0)");
    ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS pending_hits (id TEXT PRIMARY KEY, victim TEXT, team INTEGER, name TEXT, created INTEGER)");
    try { ctx.storage.sql.exec("ALTER TABLE pending_hits ADD COLUMN attacker TEXT") } catch {}
    try { ctx.storage.sql.exec("ALTER TABLE pending_hits ADD COLUMN knife INTEGER NOT NULL DEFAULT 0") } catch {}
    ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS combatants (id TEXT PRIMARY KEY, name TEXT, team INTEGER, dead INTEGER DEFAULT 0, lastShot TEXT, attacker TEXT, attackerTeam INTEGER, attackerName TEXT, diedAt INTEGER DEFAULT 0)");
    for (const column of ["x", "y", "z"]) try { ctx.storage.sql.exec(`ALTER TABLE combatants ADD COLUMN ${column} REAL NOT NULL DEFAULT 0`) } catch {}
    ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS tactical_cooldowns (id TEXT PRIMARY KEY, used_at INTEGER NOT NULL)");
    ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS room_recovery (id TEXT PRIMARY KEY, team INTEGER NOT NULL, until INTEGER NOT NULL)");
    ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS room_settings (id INTEGER PRIMARY KEY, map_id TEXT NOT NULL)");
    ctx.storage.sql.exec("INSERT OR IGNORE INTO room_settings(id,map_id) VALUES (1,'crossroads')");
    try{ctx.storage.sql.exec("ALTER TABLE room_settings ADD COLUMN survival_creator TEXT NOT NULL DEFAULT ''")}catch{}
    initCoverState(ctx);
    initSupply(ctx);
  }
  private scoreboard() {
    const row = this.ctx.storage.sql.exec<{blue:number;red:number;revision:number}>("SELECT blue,red,revision FROM match_score WHERE id=1").one();
    return { type: "scoreboard", ...row, winner: null };
  }
  private broadcast(payload: unknown, except?: WebSocket) {
    const data = JSON.stringify(payload);
    for (const socket of this.ctx.getWebSockets()) {
      if (socket !== except) {
        try { socket.send(data); } catch { /* connection is closing */ }
      }
    }
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return Response.json({ error: "WebSocket required" }, { status: 426 });
    }
    const path=new URL(request.url).pathname;
    if(path.startsWith('/api/survival/'))return this.survivalRoom().fetch(/\/solo-/i.test(path),request.headers.get('X-Astrift-Account')||'');
    const arenaPath=path.match(/^\/api\/(duel|tri|quad|gunmaster|challenge|ranked|tournament)\/([^/]+)$/);
    const arenaMode=arenaPath?.[1] as 'duel' | 'tri' | 'quad' | 'gunmaster' | 'challenge' | 'ranked' | 'tournament' | undefined;
    if(arenaMode)return this.duelRoom(arenaMode,arenaPath?.[2]||'').fetch(request.headers.get('X-Astrift-Account')||'');
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server,request.headers.get('X-Astrift-Account')?['account:'+request.headers.get('X-Astrift-Account')]:[]);
    server.serializeAttachment({ id: "", team: -1, survival:path.startsWith('/api/survival/') });
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(socket: WebSocket, message: string | ArrayBuffer) {
    if((socket.deserializeAttachment() as {towerSurvival?:boolean}|null)?.towerSurvival){await this.survivalRoom().message(socket,message);return;}
    if((socket.deserializeAttachment() as {duel?:boolean}|null)?.duel){await this.duelRoom().message(socket,message);return;}
    if (typeof message !== "string" || message.length > 4096) return;
    let data: ClientMessage;
    try { data = JSON.parse(message) as ClientMessage; } catch { return; }
    if (data.type === "join" && data.id && data.name) {
      const issue=contentIssue(data.name,'name');if(issue){socket.send(JSON.stringify({type:'full',message:issue}));socket.close(1008,'Invalid name');return}
      const id = data.id.slice(0, 48);
      this.ctx.storage.sql.exec("DELETE FROM room_recovery WHERE until<?",Date.now());
      const reservation=this.ctx.storage.sql.exec<{team:number}>("SELECT team FROM room_recovery WHERE id=?",id).toArray()[0];
      const peers = this.ctx.getWebSockets().filter((peer) => {
        if (peer === socket) return false;
        const a = peer.deserializeAttachment() as { id?: string } | null;
        return Boolean(a?.id);
      });
      const duplicate = peers.find((peer) => (peer.deserializeAttachment() as { id?: string } | null)?.id === data.id);
      const previousAttachment=duplicate?.deserializeAttachment() as {team?:number;joinedAt?:number;hp?:number;creator?:boolean}|null;
      const previousTeam = previousAttachment?.team;
      const survival=Boolean((socket.deserializeAttachment() as {survival?:boolean}|null)?.survival);
      const activePeers = peers.filter((peer) => peer !== duplicate);
      const reserved=this.ctx.storage.sql.exec<{id:string;team:number}>("SELECT id,team FROM room_recovery WHERE until>=? AND id<>?",Date.now(),id).toArray().filter(row=>!activePeers.some(peer=>(peer.deserializeAttachment() as {id?:string}|null)?.id===row.id));
      if (activePeers.length+reserved.length >= (survival?6:12) && !duplicate && !reservation) {
        socket.send(JSON.stringify({ type: "full" }));
        socket.close(1013, "Room full");
        return;
      }
      if(survival&&data.creator===true)this.ctx.storage.sql.exec("UPDATE room_settings SET survival_creator=? WHERE id=1 AND survival_creator=''",id);
      if (activePeers.length === 0 && !data.reconnect && reserved.length===0) {
        this.ctx.storage.sql.exec("UPDATE match_score SET blue=0,red=0,revision=0 WHERE id=1");
        this.ctx.storage.sql.exec("DELETE FROM combatants");
        this.ctx.storage.sql.exec("DELETE FROM pending_hits");
        this.ctx.storage.sql.exec("UPDATE room_settings SET map_id=? WHERE id=1",['crossroads','depot','arcade'].includes(data.map||'')?data.map:'crossroads');
        resetCoverState(this.ctx);
        resetSupply(this.ctx);
      }
      const counts = [0, 0];
      for (const peer of activePeers) {
        const a = peer.deserializeAttachment() as { team?: number } | null;
        if (a?.team === 0 || a?.team === 1) counts[a.team]++;
      }
      for(const row of reserved)if(row.team===0||row.team===1)counts[row.team]++;
      const requestedTeam = previousTeam ?? reservation?.team ?? (data.reconnect && (data.team === 0 || data.team === 1) ? data.team : undefined);
      const team = survival?0:requestedTeam !== undefined && counts[requestedTeam] < 6 ? requestedTeam : counts[0] <= counts[1] && counts[0] < 6 ? 0 : 1;
      if (duplicate) {
        duplicate.serializeAttachment({id:"",team:-1});
        try { duplicate.close(1000, "Connection replaced"); } catch { /* already closed */ }
      }
      const latestJoin=Math.max(0,...activePeers.map(peer=>Number((peer.deserializeAttachment() as {joinedAt?:number}|null)?.joinedAt)||0));
      const survivalCreator=this.ctx.storage.sql.exec<{survival_creator:string}>("SELECT survival_creator FROM room_settings WHERE id=1").one().survival_creator;
      const creator=Boolean(survival&&(previousAttachment?.creator||survivalCreator===id));
      socket.serializeAttachment({ id, team, survival, creator, hp:previousAttachment?.hp??100, joinedAt:previousAttachment?.joinedAt||Math.max(Date.now(),latestJoin+1) });
      this.ctx.storage.sql.exec("DELETE FROM room_recovery WHERE id=?",id);
      this.ctx.storage.sql.exec("INSERT INTO combatants(id,name,team) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,team=excluded.team",id,data.name.slice(0,14),team);
      socket.send(JSON.stringify({ type: "welcome", id, team, map:this.ctx.storage.sql.exec<{map_id:string}>("SELECT map_id FROM room_settings WHERE id=1").one().map_id }));
      socket.send(JSON.stringify({type:'coverSnapshot',covers:coverSnapshot(this.ctx)}));
      socket.send(JSON.stringify(supplySnapshot(this.ctx)));
      if(survival)this.broadcastSurvivalRoster();
      socket.send(JSON.stringify(this.scoreboard()));
      this.broadcast({ ...data, id, team, type: "join" }, socket);
      socket.send(JSON.stringify({
        type: "roster",
          players: this.ctx.getWebSockets().flatMap((peer) => {
          const a = peer.deserializeAttachment() as { id?: string } | null;
          return a?.id && peer !== socket ? [a.id] : [];
        })
      }));
      return;
    }

    if (data.type === "muzzle") {
      const attachment=socket.deserializeAttachment() as {id?:string;team?:number}|null;
      if(!attachment?.id)return;
      this.broadcast({type:"muzzle",id:attachment.id,team:attachment.team,hidden:Boolean(data.hidden)},socket);
      return;
    }
    const attachment = socket.deserializeAttachment() as { id?: string; team?: number; survival?:boolean; hp?:number; joinedAt?:number } | null;
    if (!attachment?.id) return;
    if(data.type==='damageAck'){const receipt=confirmDamageReceipt(this.ctx,attachment.id,data);sendDamageReceipt(this.ctx,receipt);return;}
    if(data.type==='chat'){
      const author=this.ctx.storage.sql.exec<{name:string}>('SELECT name FROM combatants WHERE id=?',attachment.id).toArray()[0];if(!author)return;
      const result=roomChat(this.ctx,attachment.id,author.name,attachment.team??-1,data.text);
      if(result.error)socket.send(JSON.stringify({type:'chatError',message:result.error}));else this.broadcast(result.message);
      return;
    }
    if(data.type==='phaseFlash'){
      if(!Array.isArray(data.origin)||data.origin.length!==3||!data.origin.every(Number.isFinite)||!Number.isFinite(data.yaw))return;
      const now=Date.now();if(now-(this.phaseFlashTimes.get(attachment.id)||0)<20000)return;
      this.phaseFlashTimes.set(attachment.id,now);
      this.broadcast({type:'phaseFlash',id:attachment.id,team:attachment.team,origin:data.origin.map(v=>Math.max(-300,Math.min(300,v))),yaw:data.yaw},socket);return;
    }
    const current = this.ctx.getWebSockets().find(peer => peer !== socket && (peer.deserializeAttachment() as {id?:string}|null)?.id === attachment.id);
    if (current) return;
    if(data.type==="leave"){
      this.ctx.storage.sql.exec("DELETE FROM room_recovery WHERE id=?",attachment.id);
      socket.serializeAttachment(null);
      this.broadcast({type:"leave",id:attachment.id},socket);
      if(attachment.survival)this.broadcastSurvivalRoster(socket);
      socket.close(1000,"Left match");
      return;
    }
    if(data.type==='supplyClaim'){
      const actor=this.ctx.storage.sql.exec<{x:number;y:number;z:number}>('SELECT x,y,z FROM combatants WHERE id=?',attachment.id).toArray()[0];
      const claim=actor&&claimSupply(this.ctx,[actor.x,actor.y,actor.z],data.effect,attachment.hp??100);
      if(claim)this.broadcast({...claim,claimedBy:attachment.id});else socket.send(JSON.stringify(supplySnapshot(this.ctx)));
      return;
    }
    if(data.type==='coverHit'){
      const map=this.ctx.storage.sql.exec<{map_id:string}>('SELECT map_id FROM room_settings WHERE id=1').one().map_id;
      const state=applyCoverDamage(this.ctx,map,data.coverId,data.damage);
      if(state)this.broadcast(state);
      return;
    }
    if(data.type.startsWith('survival')){
      if(!attachment.survival)return;
      const host=this.survivalIds()[0];
      if(data.type==='survivalHit'){
        if(typeof data.botId!=='string'||data.botId.length>48||!Number.isFinite(data.damage)||!['head','body','abdomen','arm','leg','explosion'].includes(String(data.zone)))return;
        this.broadcast({type:'survivalHit',id:attachment.id,botId:data.botId,damage:Math.max(0,Math.min(200,Number(data.damage))),zone:data.zone,knife:data.weapon==='knife'&&data.zone!=='explosion'},socket);
      }else if(attachment.id===host&&data.type==='survivalBotShot'){
        if(typeof data.target!=='string'||data.target.length>48||!Number.isFinite(data.damage)||!['head','body','abdomen','arm','leg','explosion'].includes(String(data.zone)))return;
        this.broadcast({type:'survivalBotShot',id:host,target:data.target,damage:Math.max(0,Math.min(200,Number(data.damage))),zone:data.zone,name:typeof data.name==='string'?data.name.slice(0,14):'AI'},socket);
      }else if(attachment.id===host&&data.type==='survivalBotDown'){
        if(typeof data.botId!=='string'||data.botId.length>48)return;
        this.broadcast({type:'survivalBotDown',id:host,botId:data.botId,killerId:typeof data.target==='string'?data.target.slice(0,48):'',knife:data.weapon==='knife'},socket);
      }else if(attachment.id===host&&data.type==='survivalBots'&&Array.isArray(data.bots)&&data.bots.length<=20){
        this.broadcast({type:'survivalBots',id:host,wave:Math.max(1,Math.min(1000,Number(data.wave)||1)),bots:data.bots},socket);
      }else if(attachment.id===host&&['survivalWave','survivalEnd'].includes(data.type)){
        this.broadcast({type:data.type,id:host,wave:Math.max(1,Math.min(1000,Number(data.wave)||1))},socket);
      }
      return;
    }
    if (data.type === "death") {
      const victim = this.ctx.storage.sql.exec<{dead:number;lastShot:string;attacker:string;attackerTeam:number;attackerName:string;name:string}>("SELECT * FROM combatants WHERE id=?",attachment.id).toArray()[0];
      const hit=data.shotId ? this.ctx.storage.sql.exec<{team:number;name:string;attacker:string;knife:number}>("SELECT team,name,attacker,knife FROM pending_hits WHERE id=? AND victim=? AND created>?",data.shotId,attachment.id,Date.now()-15000).toArray()[0] : undefined;
      if (!victim || victim.dead || !hit) return;
      this.ctx.storage.sql.exec("DELETE FROM pending_hits WHERE victim=?",attachment.id);
      this.ctx.storage.sql.exec("UPDATE combatants SET dead=1,diedAt=? WHERE id=?",Date.now(),attachment.id);
      this.ctx.storage.sql.exec(hit.team===0 ? "UPDATE match_score SET blue=blue+1,revision=revision+1 WHERE id=1" : "UPDATE match_score SET red=red+1,revision=revision+1 WHERE id=1");
      this.broadcast({...this.scoreboard(),kill:{id:data.shotId,killer:hit.name,killerId:hit.attacker,victim:victim.name,victimId:attachment.id,knife:!!hit.knife}});
      return;
    }
    if (data.type === "state" && Array.isArray(data.position) && data.position.length === 3 && data.position.every(Number.isFinite)) {
      data.slide=Boolean(data.slide)&&!data.prone;
      const [x,y,z] = data.position.map((value) => Math.max(-100, Math.min(100, Number(value))));
      this.ctx.storage.sql.exec("UPDATE combatants SET x=?,y=?,z=? WHERE id=?",x,y,z,attachment.id);
      {const hp=Math.max(0,Math.min(100,Number(data.hp)||0)),wasAlive=(attachment.hp??100)>0;socket.serializeAttachment({...attachment,hp});if(attachment.survival&&wasAlive!==(hp>0))this.broadcastSurvivalRoster();}
    }
    if (data.type === "state" && Number(data.hp)>0) this.ctx.storage.sql.exec("UPDATE combatants SET dead=0,lastShot=NULL WHERE id=? AND dead=1 AND diedAt<=?",attachment.id,Date.now()-2500);
    if (data.type === "heal") {
      const now=Date.now(),last=this.ctx.storage.sql.exec<{used_at:number}>("SELECT used_at FROM tactical_cooldowns WHERE id=?",attachment.id).toArray()[0]?.used_at||0;
      if(now-last<10000||!Array.isArray(data.targets)||data.targets.length>12)return;
      const healer=this.ctx.storage.sql.exec<{team:number;x:number;y:number;z:number;dead:number}>("SELECT team,x,y,z,dead FROM combatants WHERE id=?",attachment.id).toArray()[0];
      if(!healer||healer.dead)return;
      const valid=data.targets.filter((id):id is string=>typeof id==="string").filter((id)=>{
        const target=this.ctx.storage.sql.exec<{team:number;x:number;y:number;z:number;dead:number}>("SELECT team,x,y,z,dead FROM combatants WHERE id=?",id).toArray()[0];
        return Boolean(target&&target.team===healer.team&&!target.dead&&(target.x-healer.x)**2+(target.y-healer.y)**2+(target.z-healer.z)**2<=144);
      });
      if(!valid.length)return;
      this.ctx.storage.sql.exec("INSERT INTO tactical_cooldowns(id,used_at) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET used_at=excluded.used_at",attachment.id,now);
      this.broadcast({type:"heal",id:attachment.id,team:healer.team,targets:valid,amount:20});
      return;
    }
    if (data.type === "shot") {
      if (!data.target) return;
      const target=this.ctx.storage.sql.exec<{team:number;dead:number}>("SELECT team,dead FROM combatants WHERE id=?",data.target).toArray()[0];
      const attacker=this.ctx.storage.sql.exec<{name:string;dead:number}>("SELECT name,dead FROM combatants WHERE id=?",attachment.id).toArray()[0];
      if (!target || !attacker || target.dead || attacker.dead || target.team===attachment.team) return;
      data.damage = Math.max(0, Math.min(200, Number(data.damage) || 0));
      if(!["head","body","abdomen","arm","leg","explosion"].includes(String(data.zone)))data.zone="body";
      data.shotId=crypto.randomUUID();
      this.ctx.storage.sql.exec("DELETE FROM pending_hits WHERE created<?",Date.now()-15000);
      this.ctx.storage.sql.exec("INSERT INTO pending_hits (id,victim,team,name,created,attacker,knife) VALUES(?,?,?,?,?,?,?)",data.shotId,data.target,attachment.team!,attacker.name,Date.now(),attachment.id,data.weapon==='knife'&&data.zone!=='explosion'?1:0);
      this.ctx.storage.sql.exec("UPDATE combatants SET lastShot=?,attacker=?,attackerTeam=?,attackerName=? WHERE id=?",data.shotId,attachment.id,attachment.team!,attacker.name,data.target);
      recordDamageReceipt(this.ctx,data.shotId,attachment.id,data.target!,data.damage,data);
    }
    if (data.type === "rocket") {
      if (!Array.isArray(data.origin) || !Array.isArray(data.direction) || data.origin.length !== 3 || data.direction.length !== 3) return;
      const numbers = [...data.origin, ...data.direction].map(Number);
      if (numbers.some((value) => !Number.isFinite(value))) return;
      data.origin = numbers.slice(0, 3).map((value) => Math.max(-300, Math.min(300, value))) as [number, number, number];
      data.direction = numbers.slice(3, 6).map((value) => Math.max(-1, Math.min(1, value))) as [number, number, number];
      data.speed = Math.max(10, Math.min(100, Number(data.speed) || 34));
      data.drop = Math.max(0, Math.min(10, Number(data.drop) || 0));
      data.life = Math.max(0.2, Math.min(6, Number(data.life) || 3));
      data.rocketId=typeof data.rocketId==="string"&&/^[a-f0-9-]{36}$/.test(data.rocketId)?data.rocketId:undefined;
    }
    if (data.type === "blast") {
      if (!Array.isArray(data.position)||data.position.length!==3||data.position.some(value=>typeof value!=="number"||!Number.isFinite(value)))return;
      if(typeof data.rocketId!=="string"||!/^[a-f0-9-]{36}$/.test(data.rocketId))return;
      data.position=data.position.map(value=>Math.max(-300,Math.min(300,value))) as [number,number,number];
      data.radius=Math.max(2,Math.min(15,Number(data.radius)||7));
      data.incendiary=Boolean(data.incendiary);data.smoke=Boolean(data.smoke);data.cluster=Boolean(data.cluster);
    }
    if(data.type==="throwable"||data.type==="throwableBurst"){
      if(typeof data.throwId!=="string"||!/^[a-f0-9-]{36}$/.test(data.throwId)||!["smoke","grenade"].includes(String(data.kind)))return;
      const point=data.type==="throwable"?data.origin:data.position;
      if(!Array.isArray(point)||point.length!==3||point.some(value=>typeof value!=="number"||!Number.isFinite(value)))return;
      if(data.type==="throwable"){
        if(!Array.isArray(data.velocity)||data.velocity.length!==3||data.velocity.some(value=>typeof value!=="number"||!Number.isFinite(value)))return;
        data.origin=point.map(value=>Math.max(-300,Math.min(300,value))) as [number,number,number];
        data.velocity=data.velocity.map(value=>Math.max(-30,Math.min(30,value))) as [number,number,number];
        data.fuseMs=data.kind==="grenade"&&typeof data.fuseMs==="number"&&Number.isFinite(data.fuseMs)?Math.max(0,Math.min(4000,data.fuseMs)):4000;
      }else data.position=point.map(value=>Math.max(-300,Math.min(300,value))) as [number,number,number];
    }
    this.broadcast({ ...data, id: attachment.id, team: attachment.team }, socket);
  }

  webSocketClose(socket: WebSocket) {
    if((socket.deserializeAttachment() as {towerSurvival?:boolean}|null)?.towerSurvival){this.survivalRoom().close(socket);return;}
    if((socket.deserializeAttachment() as {duel?:boolean}|null)?.duel){this.duelRoom().close(socket);return;}
    const attachment = socket.deserializeAttachment() as { id?: string;team?:number;survival?:boolean } | null;
    if (attachment?.id) {this.ctx.storage.sql.exec("INSERT INTO room_recovery(id,team,until) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET team=excluded.team,until=excluded.until",attachment.id,attachment.team??0,Date.now()+60000);this.broadcast({ type: "leave", id: attachment.id }, socket);if(attachment.survival)this.broadcastSurvivalRoster(socket);}
  }

  webSocketError(socket: WebSocket) {
    if((socket.deserializeAttachment() as {towerSurvival?:boolean}|null)?.towerSurvival){this.survivalRoom().close(socket);try{socket.close(1011,'Connection error')}catch{}return;}
    if((socket.deserializeAttachment() as {duel?:boolean}|null)?.duel){this.duelRoom().close(socket);try{socket.close(1011,'Connection error');}catch{}return;}
    const attachment = socket.deserializeAttachment() as { id?: string;team?:number;survival?:boolean } | null;
    if (attachment?.id) {this.ctx.storage.sql.exec("INSERT INTO room_recovery(id,team,until) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET team=excluded.team,until=excluded.until",attachment.id,attachment.team??0,Date.now()+60000);socket.serializeAttachment(null);this.broadcast({ type: "leave", id: attachment.id }, socket);if(attachment.survival)this.broadcastSurvivalRoster(socket);}
    try { socket.close(1011, "Connection error"); } catch { /* already closed */ }
  }
  private survivalIds(exclude?:WebSocket){return this.ctx.getWebSockets().filter(peer=>peer!==exclude).map(peer=>peer.deserializeAttachment() as {id?:string;survival?:boolean;creator?:boolean;joinedAt?:number}|null).filter((a):a is {id:string;survival:true;creator?:boolean;joinedAt:number}=>Boolean(a?.id&&a.survival)).sort((a,b)=>Number(Boolean(b.creator))-Number(Boolean(a.creator))||a.joinedAt-b.joinedAt||a.id.localeCompare(b.id)).map(a=>a.id)}
  private broadcastSurvivalRoster(exclude?:WebSocket){const peers=this.ctx.getWebSockets().filter(peer=>peer!==exclude).map(peer=>peer.deserializeAttachment() as {id?:string;survival?:boolean;creator?:boolean;joinedAt?:number;hp?:number}|null).filter((a):a is {id:string;survival:true;creator?:boolean;joinedAt:number;hp?:number}=>Boolean(a?.id&&a.survival)).sort((a,b)=>Number(Boolean(b.creator))-Number(Boolean(a.creator))||a.joinedAt-b.joinedAt||a.id.localeCompare(b.id));const players=peers.map(p=>p.id),alive=peers.filter(p=>(p.hp??100)>0).map(p=>p.id);this.broadcast({type:'survivalRoster',players,alive,host:players[0]||'',count:players.length},exclude)}
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    let socketAccount='';
    if(request.headers.get('Upgrade')==='websocket'&&!currentClient(url.searchParams.get('clientVersion')))return clientVersionResponse();

    if(url.pathname==='/api/client-version'&&request.method==='POST'){
      if(Number(request.headers.get('Content-Length'))>256)return clientVersionResponse();
      let raw:string;try{raw=await request.text()}catch{return clientVersionResponse()}
      if(raw.length>256)return clientVersionResponse();
      let version:unknown;try{version=JSON.parse(raw)?.clientVersion}catch{return clientVersionResponse()}
      return currentClient(version)?Response.json({ok:true},{headers:{'Cache-Control':'no-store'}}):clientVersionResponse();
    }
    if(url.pathname==='/api/admin'){
      const origin=request.headers.get('Origin');if(!origin||origin==='null'||!allowedApiOrigin(origin,url.origin)||googleEmbedOrigin(origin)||canvaEmbedOrigin(origin))return Response.json({error:'管理请求来源无效'},{status:403});return adminAPI(request,env);
    }
    if(['/admin','/admin/'].includes(url.pathname)){const response=await env.ASSETS.fetch(new Request(new URL('/admin/',url),request));const headers=new Headers(response.headers);headers.set('Cache-Control','no-store');headers.set('X-Frame-Options','DENY');return new Response(response.body,{status:response.status,headers})}
    if(request.headers.get('Upgrade')==='websocket'&&!url.pathname.startsWith('/api/ancient/')){
      const account=await env.ACCOUNT_SESSIONS.getByName('global-v1').consumeSocketTicket(url.searchParams.get('ticket')||'',url.pathname);
      if(!account)return Response.json({error:'请重新登录 / Please log in again'},{status:401});
      socketAccount=account;
      await env.ACCOUNT_SESSIONS.getByName('global-v1').rememberSocket(account,url.pathname);
      const headers=new Headers(request.headers);headers.set('X-Astrift-Account',encodeURIComponent(account));request=new Request(request,{headers});
    }
    if(['/joinlog','/joinlog/','/joinlog.html'].includes(url.pathname)){const target=new URL('/joinlog',url);const response=await env.ASSETS.fetch(new Request(target,request)),headers=new Headers(response.headers);headers.set('Cache-Control','no-store');headers.set('X-Frame-Options','DENY');headers.set('Referrer-Policy','no-referrer');return new Response(response.body,{status:response.status,headers});}
    if(url.pathname.startsWith('/api/ancient/')){
      const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
      if(request.headers.get('Origin')&&!allowedApiOrigin(request.headers.get('Origin'),url.origin))return json({error:'请求来源无效'},403);
      const world=env.ANCIENT_WORLDS.getByName('tribe-v1');
      if(url.pathname==='/api/ancient/connect'&&request.headers.get('Upgrade')==='websocket')return world.fetch(request);
      if(url.pathname!=='/api/ancient/profile'||request.method!=='POST')return json({error:'请求无效'},405);
      if(Number(request.headers.get('Content-Length'))>800000)return json({error:'请求过大'},413);
      let body:Record<string,unknown>;try{const text=await request.text();if(text.length>800000)return json({error:'请求过大'},413);body=JSON.parse(text);if(text.length>350000&&body?.action!=='communitySave')return json({error:'请求过大'},413);if(!body||Array.isArray(body)||typeof body!=='object')throw Error()}catch{return json({error:'请求格式无效'},400)}
      if(requiresClientVersion(url.pathname,String(body?.action||''))&&!currentClient(body?.clientVersion))return clientVersionResponse();
      const name=String(body.name||'').toLowerCase();if(!/^[-_\p{L}\p{N}]{2,14}$/u.test(name)||!await env.PLAYER_ACCOUNTS.getByName('account:'+name).validate(String(body.token||''),String(body.device||'')))return json({error:'请先登录账号'},401);
      const result=await world.command(name,String(body.action||'profile'),body);return json(result,result.ok?200:409);
    }
    if(url.pathname.startsWith('/api/extraction/')){
      const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
      if(request.headers.get('Origin')&&!allowedApiOrigin(request.headers.get('Origin'),url.origin))return json({error:'请求来源无效'},403);
      if(request.headers.get('Upgrade')==='websocket'){
        const room=url.pathname.slice('/api/extraction/'.length);if(!/^X[a-f0-9]{20}$/i.test(room))return json({error:'队伍无效'},400);return env.EXTRACTION_ROOMS.getByName(room).fetch(request);
      }
      if(request.method!=='POST'||url.pathname!=='/api/extraction/squad')return json({error:'请求无效'},405);
      let body:Record<string,unknown>;try{const raw=await request.text();if(raw.length>12000)return json({error:'请求过大'},413);body=JSON.parse(raw)}catch{return json({error:'请求格式无效'},400)}
      if(requiresClientVersion(url.pathname,String(body?.action||''))&&!currentClient(body?.clientVersion))return clientVersionResponse();
      const name=String(body.name||'').toLowerCase(),token=String(body.token||''),device=String(body.device||'');if(!/^[-_\p{L}\p{N}]{2,14}$/u.test(name)||!await env.PLAYER_ACCOUNTS.getByName('account:'+name).validate(token,device))return json({error:'请先登录账号'},401);
      const action=String(body.action||''),room=body.room?String(body.room):action==='create'?'X'+crypto.randomUUID().replaceAll('-','').slice(0,20):'';if(!/^X[a-f0-9]{20}$/i.test(room)||!['create','join','state','ready','unready','leave','finish'].includes(action))return json({error:'队伍无效'},400);
      const profile=await env.PLAYER_ACCOUNTS.getByName('account:'+name).read(token,device),level=profile?.season.level||1;
      const loadout=body.loadout&&typeof body.loadout==='object'&&!Array.isArray(body.loadout)?body.loadout as Record<string,unknown>:null;
      const result=await env.EXTRACTION_ROOMS.getByName(room).command(room,name,action,loadout,level);return json(result,result.ok?200:409);
    }
    const rateLimit = async (action: string, limit: number, windowMs = 60_000, account = '') => {
      const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
      const ipDigest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(account?'account:'+account:clientIp));
      const ipHash = Array.from(new Uint8Array(ipDigest), byte => byte.toString(16).padStart(2, "0")).join("").slice(0, 24);
      return env.LOADOUT_CODES.getByName(`rate:${ipHash[0]}`).consumeRateLimit(`${ipHash}:${action}`, limit, windowMs);
    };
    const limited = () => Response.json({ error: "请求太频繁，请稍后再试" }, { status: 429, headers: { "Retry-After": "60", "Cache-Control": "no-store" } });
    if(url.pathname==='/api/joinlog'){
      const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
      if(request.method!=='POST')return json({error:'不支持的请求'},405);
      if(request.headers.get('Origin')&&request.headers.get('Origin')!==url.origin)return json({error:'请求来源无效'},403);
      if(Number(request.headers.get('Content-Length'))>1024)return json({error:'请求过大'},413);
      let data:Record<string,unknown>;try{const raw=await request.text();if(raw.length>1024)throw Error();data=JSON.parse(raw);if(!data||typeof data!=='object'||Array.isArray(data))throw Error();}catch{return json({error:'请求格式无效'},400);}
      const action=String(data.action||''),world=env.ANCIENT_WORLDS.getByName('tribe-v1');
      if(action==='login'){
        if(!await rateLimit('joinlog-login',5,300000))return limited();
        const secret=(env as Env & {JOINLOG_PASSWORD?:string}).JOINLOG_PASSWORD||'',supplied=typeof data.password==='string'?data.password:'';
        const hash=async(value:string)=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
        const [a,b]=await Promise.all([hash(secret),hash(supplied)]);let difference=0;for(let i=0;i<a.length;i++)difference|=a[i]^b[i];
        if(!secret||difference)return json({error:'密码错误'},401);return json(await world.joinLog('login',{}));
      }
      if(!['list','stats','logout'].includes(action))return json({error:'请求无效'},400);
      if(!await rateLimit('joinlog-read',30))return limited();
      const result=await world.joinLog(action,data);return json(result,result.ok?200:401);
    }
    if(url.pathname.startsWith('/api/tournaments/')){
      const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
      if(request.method!=='POST')return json({error:'不支持的请求'},405);
      if(request.headers.get('Origin')&&!allowedApiOrigin(request.headers.get('Origin'),url.origin))return json({error:'请求来源无效'},403);
      if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'请求格式无效'},415);
      let body:Record<string,unknown>;try{const raw=await request.text();if(raw.length>7000)return json({error:'请求过大'},413);body=JSON.parse(raw);if(!body||typeof body!=='object'||Array.isArray(body))throw Error()}catch{return json({error:'请求格式无效'},400)}
      const action=url.pathname.slice('/api/tournaments/'.length),hub=env.TOURNAMENTS.getByName('events-v1');
      const eventId=typeof body.eventId==='string'&&/^[0-9a-f-]{36}$/i.test(body.eventId)?body.eventId:'';
      if(action==='push-config')return json({ok:true,publicKey:(env as PushEnv).TOURNAMENT_PUSH_PUBLIC_KEY||''});
      if(action==='list'){
        const name=typeof body.name==='string'?body.name.trim().normalize('NFKC'):'';
        const device=typeof body.device==='string'?body.device:'',token=typeof body.token==='string'?body.token:'';
        const account=name&&await env.PLAYER_ACCOUNTS.getByName('account:'+name.toLowerCase()).validate(token,device)?name.toLowerCase():'';
        return json({ok:true,events:await hub.list(account)});
      }
      if(action==='roster')return json(eventId?await hub.roster(eventId):{ok:false,error:'赛事不存在'},eventId?200:404);
      if(action==='admin-login'){
        if(!await rateLimit('tournament-admin',5,300_000))return limited();
        const supplied=typeof body.password==='string'?body.password:'',secret=(env as Env & {EVENT_ADMIN_PASSWORD?:string}).EVENT_ADMIN_PASSWORD||'';
        const a=new TextEncoder().encode(supplied),b=new TextEncoder().encode(secret);let difference=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)difference|=(a[i]||0)^(b[i]||0);
        if(!secret||difference!==0)return json({error:'管理密码错误'},403);
        return json({ok:true,token:await hub.openAdmin()});
      }
      if(action==='admin-logout'){await hub.closeAdmin(typeof body.adminToken==='string'?body.adminToken:'');return json({ok:true})}
      if(['create','edit','start','delete','eliminate'].includes(action)){
        if(!await hub.isAdmin(typeof body.adminToken==='string'?body.adminToken:''))return json({error:'管理身份已失效'},403);
        const name=typeof body.eventName==='string'?body.eventName.trim():'',description=typeof body.description==='string'?body.description.trim():'',details=typeof body.details==='string'?body.details.trim():'';
        const target=typeof body.target==='string'?body.target.trim().normalize('NFKC').toLowerCase():'';
        const result=action==='create'?await hub.create(String(body.kind||''),name,description,details):action==='edit'?await hub.edit(eventId,name,description,details):action==='start'?await hub.start(eventId):action==='eliminate'?await hub.eliminate(eventId,target):await hub.delete(eventId);
        return json(result,result.ok?200:400);
      }
      const name=typeof body.name==='string'?body.name.trim().normalize('NFKC'):'',token=typeof body.token==='string'?body.token:'',device=typeof body.device==='string'?body.device:'';
      if(!/^[-_\p{L}\p{N}]{2,14}$/u.test(name))return json({error:'请先登录账号'},401);
      const account=env.PLAYER_ACCOUNTS.getByName('account:'+name.toLowerCase());
      if(!await account.validate(token,device))return json({error:'登录已失效'},401);
      if(action==='push-subscribe'){const result=await hub.subscribe(name.toLowerCase(),device,body.subscription);return json(result,result.ok?200:400)}
      if(action==='push-unsubscribe')return json(await hub.unsubscribe(name.toLowerCase(),device,typeof body.endpoint==='string'?body.endpoint:''));
      if(!eventId)return json({error:'赛事不存在'},404);
      const key=name.toLowerCase(),ticket=typeof body.ticket==='string'?body.ticket:'';
      if(action==='join')return json(await hub.join(eventId,key,name));
      if(action==='weeklyBegin')return json(await hub.weeklyBegin(eventId,key));
      if(action==='weeklyStep')return json(await hub.weeklyStep(String(body.runId||''),key,Number(body.seq),String(body.action||'')));
      if(action==='weeklyStop')return json(await hub.weeklyStop(String(body.runId||''),key));
      if(action==='queue')return json(await hub.queue(eventId,key));
      if(action==='status')return json(await hub.queueStatus(eventId,key,ticket));
      if(action==='cancel')return json(await hub.queueCancel(eventId,key,ticket));
      if(action==='claim'){
        const reward=await hub.reward(eventId,key);if(!reward)return json({error:'没有可领取的奖励'},403);
        const profile=await account.grantTournamentReward(eventId,reward.place);if(!profile)return json({error:'账号不存在'},404);
        await hub.markClaimed(eventId,key);return json({ok:true,profile,place:reward.place});
      }
      return json({error:'页面不存在'},404);
    }
    if(url.pathname.startsWith('/api/social/')){
      const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
      if(request.method!=='POST')return json({error:'不支持的请求'},405);
      if(request.headers.get('Origin')&&!allowedApiOrigin(request.headers.get('Origin'),url.origin))return json({error:'请求来源无效'},403);
      if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'请求格式无效'},415);
      let body:Record<string,unknown>;try{const raw=await request.text();if(raw.length>2048)return json({error:'请求过大'},413);body=JSON.parse(raw);if(!body||typeof body!=='object'||Array.isArray(body))throw Error()}catch{return json({error:'请求格式无效'},400)}
      const name=typeof body.name==='string'?body.name.trim().normalize('NFKC'):'',token=typeof body.token==='string'?body.token:'',device=typeof body.device==='string'?body.device:'';
      if(!/^[-_\p{L}\p{N}]{2,14}$/u.test(name))return json({error:'账号无效'},400);
      const account=env.PLAYER_ACCOUNTS.getByName('account:'+name.toLowerCase());
      if(!await account.validate(token,device))return json({error:'请先登录账号'},401);
      const hub=env.SOCIAL_HUB.getByName('social-v1'),action=url.pathname.slice('/api/social/'.length);
      if(action==='state')return json(await hub.state(name));
      const target=typeof body.target==='string'?body.target.trim().normalize('NFKC'):'';
      if(['add','remove','friendRespond','messages','send','invite'].includes(action)&&(!/^[-_\p{L}\p{N}]{2,14}$/u.test(target)))return json({error:'好友账号无效'},400);
      if(action==='add'){
        if(!await rateLimit('friend-add',12,300000))return limited();
        if(!await env.PLAYER_ACCOUNTS.getByName('account:'+target.toLowerCase()).exists())return json({error:'没有找到这个账号'},404);
        const result=await hub.add(name,target);return json(result,result.ok?200:400);
      }
      if(action==='remove')return json(await hub.remove(name,target));
      if(action==='friendRespond'){
        const decision=String(body.decision||'');if(!['accept','reject'].includes(decision))return json({error:'操作无效'},400);
        const result=await hub.respondFriend(name,target,decision);return json(result,result.ok?200:409);
      }
      if(action==='messages'){const result=await hub.messages(name,target);return json(result,result.ok?200:403)}
      if(action==='send'){
        if(!await rateLimit('friend-chat',30))return limited();
        const result=await hub.send(name,target,typeof body.text==='string'?body.text:'');return json(result,result.ok?200:400);
      }
      if(action==='invite'){
        if(!await rateLimit('friend-invite',12))return limited();
        const result=await hub.invite(name,target,String(body.mode||''),String(body.map||''),String(body.room||''));return json(result,result.ok?200:400);
      }
      if(action==='respond'){
        const id=typeof body.id==='string'?body.id:'',decision=String(body.decision||'');
        if(!/^[0-9a-f-]{36}$/i.test(id)||!['accept','reject','mute'].includes(decision))return json({error:'操作无效'},400);
        const result=await hub.respond(name,id,decision);return json(result,result.ok?200:409);
      }
      return json({error:'页面不存在'},404);
    }
    if(url.pathname.startsWith('/api/account/')){
      const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
      if(request.method!=='POST')return json({error:'不支持的请求'},405);
      if(request.headers.get('Origin')&&!allowedApiOrigin(request.headers.get('Origin'),url.origin))return json({error:'请求来源无效'},403);
      if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'请求格式无效'},415);
      if(Number(request.headers.get('Content-Length')||0)>400000)return json({error:'请求过大'},413);
      let body:Record<string,unknown>;
      try{const raw=await request.text();if(raw.length>400000)return json({error:'请求过大'},413);body=JSON.parse(raw);if(!body||typeof body!=='object'||Array.isArray(body))throw Error()}catch{return json({error:'请求格式无效'},400)}
      if(requiresClientVersion(url.pathname,String(body?.action||''))&&!currentClient(body?.clientVersion))return clientVersionResponse();
      let name=typeof body.name==='string'?body.name.trim().normalize('NFKC'):'';
      const device=typeof body.device==='string'?body.device:'',email=normalizeAccountEmail(body.email),code=typeof body.code==='string'?body.code:'',registry=env.ACCOUNT_SESSIONS.getByName('global-v1');
      if(url.pathname==='/api/account/problem-report'){
        const result=await registry.submitProblemReport(device,await emailDigest(request.headers.get('CF-Connecting-IP')||'unknown'),String(body.id||''),typeof body.report==='string'?body.report:'');
        return json(result,result.ok?200:result.error==='REPORT_RATE_LIMIT'?429:result.error==='INVALID_REPORT'?400:503);
      }
      if(url.pathname==='/api/account/email/reset-request'){
        if(!await rateLimit('email-request',5,300000))return limited();
        const result=await registry.requestEmailCode('reset',email,'',await emailDigest(request.headers.get('CF-Connecting-IP')||'unknown'));return json(result,result.ok?200:400);
      }
      if(url.pathname==='/api/account/email/reset-confirm'){
        if(!await rateLimit('email-reset',8,300000))return limited();
        const target=await registry.emailAccount(email);if(!target)return json({error:'验证码无效或已过期'},400);
        const result=await env.PLAYER_ACCOUNTS.getByName('account:'+target).resetPasswordUsingEmail(email,code,typeof body.password==='string'?body.password:'');
        if(result.ok)await env.ANCIENT_WORLDS.getByName('tribe-v1').disconnect(target);
        return json(result,result.ok?200:400);
      }
      if(url.pathname==='/api/account/login'&&name.includes('@')){
        if(!await rateLimit('account-email-lookup',8,300000))return limited();
        name=await registry.emailAccount(name);if(!name)return json({error:'账号或密码错误'},401);
      }

      if(Array.from(name).length<2||Array.from(name).length>14||!/^[-_\p{L}\p{N}]+$/u.test(name))return json({error:'账号名需要 2–14 个字母、数字、汉字或下划线'},400);
      const account=env.PLAYER_ACCOUNTS.getByName('account:'+name.toLowerCase());
      if(url.pathname==='/api/account/register'||url.pathname==='/api/account/login'){
        if(!await rateLimit('account-auth',8,300_000))return limited();
        const password=typeof body.password==='string'?body.password:'';
        if(password.length<8||password.length>128)return json({error:'密码需要 8–128 个字符'},400);
        if(!/^[0-9a-f-]{36}$/i.test(device))return json({error:'设备标识无效，请刷新页面'},400);
        const result=url.pathname.endsWith('/register')?await account.register(name,password,body.snapshot,device):await account.login(password,device);
        return json(result,result.ok?200:401);
      }
      const token=typeof body.token==='string'?body.token:'';
      const ban=await registry.banState(name.toLowerCase());if(ban)return json({error:ban.until===0?'账号已被永久封禁 / Account permanently banned':`账号已被封禁，解封时间 / Banned until: ${new Date(ban.until).toISOString()}`},403);
      if(url.pathname.startsWith('/api/account/email/')){
        if(!await account.validate(token,device))return json({error:'登录已失效'},401);
        if(url.pathname==='/api/account/email/read')return json(await registry.officialMailRead(name,String(body.id||'')));
        if(url.pathname==='/api/account/email/inbox'){const result=await env.ANCIENT_WORLDS.getByName('tribe-v1').command(name.toLowerCase(),'mailList',{});const state=(result as unknown as {mailState?:{messages:unknown[];bookChoices:unknown[]}}).mailState;return json({ok:true,messages:state?.messages||[],bookChoices:state?.bookChoices||[]})}
      if(url.pathname==='/api/account/email/claim'){
        if(!await account.validate(token,device))return json({error:'登录已失效'},401);const result=await env.ANCIENT_WORLDS.getByName('tribe-v1').command(name.toLowerCase(),'mailClaim',{id:body.id,selection:body.selection});return json(result,result.ok?200:400);
      }
        if(url.pathname==='/api/account/email/status')return json({ok:true,email:await registry.accountEmail(name)});
        if(url.pathname==='/api/account/email/bind-request'){
          if(!await rateLimit('email-request',5,300000))return limited();
          const result=await registry.requestEmailCode('verify',email,name,await emailDigest(request.headers.get('CF-Connecting-IP')||'unknown'));return json(result,result.ok?200:400);
        }
        if(url.pathname==='/api/account/email/bind-confirm'){
          if(!await rateLimit('email-bind',8,300000))return limited();
          const result=await registry.bindEmail(email,name,code);return json(result,result.ok?200:400);
        }
        return json({error:'页面不存在'},404);
      }
      if(url.pathname==='/api/account/profile'){const profile=await account.read(token,device);return profile?json({ok:true,profile}):json({error:'登录已失效'},401)}
      if(url.pathname==='/api/account/socket-ticket'){
        if(!await account.validate(token,device))return json({error:'登录已失效'},401);const path=String(body.path||'');if(!/^\/api\/(room|duel|tri|quad|gunmaster|challenge|ranked|tournament|survival|ctf|hardpoint|bomb|extraction)\/[-a-zA-Z0-9_]{1,50}$/.test(path))return json({error:'房间路径无效'},400);return json({ok:true,ticket:await registry.socketTicket(name.toLowerCase(),path)});
      }
      if(url.pathname==='/api/account/guide'){if(!await account.validate(token,device))return json({error:'请先登录 / Please log in'},401);const result=await registry.gameGuide(name.toLowerCase(),body);return json(result,result.ok?200:400)}
      if(url.pathname==='/api/account/check')return await account.validate(token,device)?json({ok:true}):json({error:'登录已失效'},401);
      if(url.pathname==='/api/account/season-claim'){const result=await account.claimSeasonReward(token,device,typeof body.skinId==='string'?body.skinId:'');return json(result,result.ok?200:403)}
      if(url.pathname==='/api/account/knife-draw'){const result=await account.drawKnife(token,device);return json(result,result.ok?200:403)}
      if(url.pathname==='/api/account/knife-redeem'){const result=await account.redeemKnife(token,device,typeof body.skinId==='string'?body.skinId:'');return json(result,result.ok?200:403)}
      if(url.pathname==='/api/account/save'){const result=await account.saveSnapshot(token,device,body.snapshot);return json(result,result.ok?200:401)}
      if(url.pathname==='/api/account/logout'){
        if(await account.validate(token,device)){await env.TOURNAMENTS.getByName('events-v1').unsubscribe(name.toLowerCase(),device);await env.ANCIENT_WORLDS.getByName('tribe-v1').disconnect(name.toLowerCase());}
        return json(await account.logout(token,device));
      }
      return json({error:'页面不存在'},404);
    }
    if(url.pathname==='/api/matchmaking/ranked'||url.pathname==='/api/ranked/result'){
      const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
      if(request.method!=='POST')return json({error:'不支持的请求'},405);
      if(request.headers.get('Origin')&&!allowedApiOrigin(request.headers.get('Origin'),url.origin))return json({error:'请求来源无效'},403);
      if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'请求格式无效'},415);
      let body:Record<string,unknown>;
      try{const raw=await request.text();if(raw.length>2048)return json({error:'请求过大'},413);body=JSON.parse(raw);if(!body||typeof body!=='object'||Array.isArray(body))throw Error()}catch{return json({error:'请求格式无效'},400)}
      if(requiresClientVersion(url.pathname,String(body?.action||''))&&!currentClient(body?.clientVersion))return clientVersionResponse();
      const accountName=typeof body.name==='string'?body.name.trim().normalize('NFKC'):'';
      const token=typeof body.token==='string'?body.token:'',device=typeof body.device==='string'?body.device:'';
      if(!accountName||Array.from(accountName).length>14||!/^[-_\p{L}\p{N}]+$/u.test(accountName))return json({error:'账号无效'},400);
      const accountKey=accountName.toLowerCase(),account=env.PLAYER_ACCOUNTS.getByName('account:'+accountKey);
      const rankedAccount=await account.read(token,device);
      if(!rankedAccount)return json({error:'请先登录账号'},401);
      if(url.pathname==='/api/ranked/result'){
        const room=typeof body.room==='string'?body.room:'';
        if(!/^M[a-f0-9]{25}$/i.test(room))return json({error:'排位房间无效'},400);
        const outcome=await env.GAME_ROOMS.getByName('ranked:'+room.toLowerCase()).rankedResultFor(accountKey);
        if(!outcome)return json({error:'对局尚未结束'},409);
        const result=await account.recordResult(outcome.matchId,outcome.won,outcome.deaths);
        return result?json({ok:true,...result}):json({error:'结算失败'},500);
      }
      const action=body.action;
      const queue=env.DUEL_MATCHMAKER.getByName('ranked-s1');
      if(action==='join'){
        if(!await rateLimit('ranked-match',8,300_000))return limited();
        if(typeof body.player!=='string'||!/^[0-9a-f-]{36}$/i.test(body.player))return json({error:'玩家标识无效'},400);
        return json({ok:true,...await queue.joinRanked(body.player,accountKey)});
      }
      const ticket=typeof body.ticket==='string'?body.ticket:'';
      if(!/^[0-9a-f-]{36}$/i.test(ticket))return json({error:'匹配凭证无效'},400);
      if(action==='status')return json({ok:true,...await queue.rankedStatus(ticket,accountKey,rankedAccount.season.level)});
      if(action==='cancel')return json(await queue.rankedCancel(ticket,accountKey));
      if(action==='finishAi'){
        const outcome=await queue.rankedFinishAi(ticket,accountKey,Number(body.score),Number(body.deaths));
        if(!outcome)return json({error:'排位成绩尚未满足结算条件'},409);
        const result=await account.recordResult(outcome.matchId,outcome.won,outcome.deaths);
        return result?json({ok:true,...result}):json({error:'结算失败'},500);
      }
      return json({error:'操作无效'},400);
    }
    if(url.pathname==='/api/matchmaking/duel'){
      const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
      if(request.headers.get('Origin')&&!allowedApiOrigin(request.headers.get('Origin'),url.origin))return json({error:'请求来源无效'},403);
      const queue=env.DUEL_MATCHMAKER.getByName('duel-global');
      if(request.method==='POST'){
        if(!await rateLimit('duel-match',12))return limited();
        if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'请求格式无效'},415);
        let body:{player?:unknown;clientVersion?:unknown};try{body=await request.json() as typeof body}catch{return json({error:'请求格式无效'},400)}
        if(!currentClient(body?.clientVersion))return clientVersionResponse();
        if(typeof body.player!=='string'||!/^[0-9a-f-]{36}$/i.test(body.player))return json({error:'玩家标识无效'},400);
        return json(await queue.join(body.player));
      }
      const ticket=url.searchParams.get('ticket')||'';
      if(!/^[0-9a-f-]{36}$/i.test(ticket))return json({error:'匹配凭证无效'},400);
      if(request.method==='GET')return json(await queue.status(ticket));
      if(request.method==='DELETE')return json(await queue.cancel(ticket));
      return json({error:'不支持的请求'},405);
    }
    if(url.pathname==='/api/forum'||url.pathname.startsWith('/api/forum/')){
      const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
      const board=env.FORUM_BOARD.getByName('public-board');
      if(request.method==='GET'&&url.pathname==='/api/forum')return json(await board.list(Number(url.searchParams.get('offset'))||0));
      if(request.method!=='POST')return json({error:'不支持的请求'},405);
      if(request.headers.get('Origin')&&!allowedApiOrigin(request.headers.get('Origin'),url.origin))return json({error:'请求来源无效'},403);
      if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'请求格式无效'},415);
      if(Number(request.headers.get('Content-Length')||0)>2048)return json({error:'内容过长'},413);
      let data:Record<string,unknown>;
      try{const raw=await request.text();if(raw.length>2048)return json({error:'内容过长'},413);data=JSON.parse(raw);if(!data||typeof data!=='object'||Array.isArray(data))throw Error()}catch{return json({error:'请求格式无效'},400)}
      const token=typeof data.token==='string'?data.token:'';
      if(url.pathname==='/api/forum/login'){
        if(!await rateLimit('forum-login',5,300_000))return limited();
        const submitted=new TextEncoder().encode(typeof data.password==='string'?data.password.slice(0,64):'');
        const expected=new TextEncoder().encode(env.FORUM_ADMIN_PASSWORD||'');
        let different=submitted.length^expected.length;
        for(let i=0;i<Math.max(submitted.length,expected.length);i++)different|=(submitted[i]||0)^(expected[i]||0);
        if(!expected.length||different)return json({error:'密码错误'},401);
        return json({token:await board.openAdminSession()});
      }
      if(url.pathname==='/api/forum/logout'){await board.closeAdminSession(token);return json({ok:true})}
      if(url.pathname==='/api/forum/post'){
        if(!await rateLimit('forum-post',10))return limited();
        const accountName=typeof data.accountName==='string'?data.accountName.trim().normalize('NFKC'):'';
        const accountToken=typeof data.accountToken==='string'?data.accountToken:'';
        if(!/^[-_\p{L}\p{N}]{2,14}$/u.test(accountName))return json({error:'请先登录账号'},401);
        const author=await env.PLAYER_ACCOUNTS.getByName('account:'+accountName.toLowerCase()).read(accountToken,typeof data.accountDevice==='string'?data.accountDevice:'');
        if(!author)return json({error:'登录已失效，请重新登录'},401);
        const name=author.name;
        const body=typeof data.body==='string'?data.body.trim():'';
        if(!body||Array.from(body).length>200||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(body))return json({error:'帖子内容须为 1–200 字'},400);
        const device=typeof data.device==='string'&&/^[0-9a-f-]{36}$/i.test(data.device)?data.device:'';
        if(!device&&!token)return json({error:'设备标识无效，请刷新页面'},400);
        const result=await board.publish(name,body,device,token,data.pinned===true);
        return json(result,result.ok?201:result.retryAfter?429:403);
      }
      if(url.pathname==='/api/forum/moderate'){
        const id=Number(data.id),action=data.action;
        if(!Number.isSafeInteger(id)||id<1||!['delete','pin','unpin'].includes(String(action)))return json({error:'操作无效'},400);
        const result=await board.moderate(id,action as 'delete'|'pin'|'unpin',token);
        return json(result,result.ok?200:403);
      }
      return json({error:'页面不存在'},404);
    }
    if (url.pathname === "/api/loadout-codes") {
      const aliases: Record<string, string> = { M9: "frost", V6: "redline", H8: "hammer", D7: "gale", L1: "meteor", S12: "shotgun", MP9: "smg", R6: "revolver", KX: "lmg", A8: "autoShotgun" };
      const parsed = (value: string | null) => {
        const match = value?.trim().toUpperCase().match(/^(M9|V6|H8|D7|L1|S12|MP9|R6|KX|A8)-([A-Z0-9]{12})$/);
        return match ? { weapon: aliases[match[1]], code: `${match[1]}-${match[2]}`, shard: match[2][0].toLowerCase() } : null;
      };
      const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
      if (request.method === "POST") {
        if (!await rateLimit("build-create", 5)) return limited();
        if (Number(request.headers.get("content-length") || 0) > 4096) return json({ error: "请求过大" }, 413);
        let body: { code?: unknown; weapon?: unknown; build?: unknown };
        try {
          const raw = await request.text();
          if (raw.length > 4096) return json({ error: "请求过大" }, 413);
          body = JSON.parse(raw) as typeof body;
        } catch { return json({ error: "无效请求" }, 400); }
        const info = parsed(typeof body.code === "string" ? body.code : null);
        if (!info || body.weapon !== info.weapon || !body.build || typeof body.build !== "object" || Array.isArray(body.build)) return json({ error: "改枪码或方案格式无效" }, 400);
        // Keep a plain object so the Durable Object RPC layer can serialize it.
        const safeBuild: Record<string, string> = {};
        for (const [slot, id] of Object.entries(body.build as Record<string, unknown>).slice(0, 24)) {
          if (/^[\p{L}\p{N}_-]{1,32}$/u.test(slot) && !["__proto__", "prototype", "constructor"].includes(slot) && typeof id === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(id)) safeBuild[slot] = id;
        }
        const registry = env.LOADOUT_CODES.getByName(`loadout:${info.shard}`);
        return await registry.createCode(info.code, info.weapon, safeBuild)
          ? json({ ok: true })
          : json({ error: "码已存在，请重新创建" }, 409);
      }
      if (request.method === "GET") {
        if (!await rateLimit("build-read", 20)) return limited();
        const info = parsed(url.searchParams.get("code"));
        if (!info) return json({ error: "改枪码格式应为 M9-加12位字母数字" }, 400);
        const result = await env.LOADOUT_CODES.getByName(`loadout:${info.shard}`).readCode(info.code);
        if (!result) return json({ error: "没有找到这个改枪码" }, 404);
        if (result.weapon !== info.weapon) return json({ error: "改枪码枪型不匹配" }, 400);
        return json(result);
      }
      return json({ error: "仅支持 GET/POST" }, 405);
    }
    if (/^\/api\/(?:room\/|duel\/|tri\/|quad\/|gunmaster\/|challenge\/|ranked\/|tournament\/|ctf\/|hardpoint\/|survival\/|bomb\/)/.test(url.pathname) && !await rateLimit("room-connect", 30, 60_000, socketAccount)) return limited();
    const bombMatch=url.pathname.match(/^\/api\/bomb\/([a-zA-Z][0-9][a-zA-Z][0-9][a-zA-Z][0-9])$/);
    if(bombMatch)return env.BOMB_ROOMS.getByName('bomb:'+bombMatch[1].toLowerCase()).fetch(request);
    const objectiveMatch=url.pathname.match(/^\/api\/(ctf|hardpoint)\/([a-zA-Z][0-9][a-zA-Z][0-9][a-zA-Z][0-9])$/);
    if(objectiveMatch)return env.OBJECTIVE_ROOMS.getByName(objectiveMatch[1]+':'+objectiveMatch[2].toLowerCase()).fetch(request);
    const duelMatch=url.pathname.match(/^\/api\/(duel|tri|quad|gunmaster|challenge|ranked|tournament)\/([a-zA-Z][0-9][a-zA-Z][0-9][a-zA-Z][0-9]|[MT][a-f0-9]{25})$/i);
    if(duelMatch)return env.GAME_ROOMS.getByName(duelMatch[1]+':'+duelMatch[2].toLowerCase()).fetch(request);
    if(url.pathname==='/api/survival/leaderboard'){
      if(request.method!=='GET')return Response.json({error:'不支持的请求'},{status:405});
      return Response.json(await env.SURVIVAL_LEADERBOARD.getByName('tower-weekly-v1').board(),{headers:{'Cache-Control':'no-store'}});
    }
    const soloSurvival=url.pathname.match(/^\/api\/survival\/(solo-[0-9a-f-]{36})$/i);
    if(soloSurvival)return env.GAME_ROOMS.getByName('survival:'+soloSurvival[1].toLowerCase()).fetch(request);
    const survivalMatch=url.pathname.match(/^\/api\/survival\/([a-zA-Z][0-9][a-zA-Z][0-9][a-zA-Z][0-9])$/);
    if(survivalMatch)return env.GAME_ROOMS.getByName('survival:'+survivalMatch[1].toLowerCase()).fetch(request);
    const match = url.pathname.match(/^\/api\/room\/([a-zA-Z0-9_-]{1,32})$/);
    if (match) {
      const room = env.GAME_ROOMS.getByName(match[1].toLowerCase());
      return room.fetch(request);
    }
    return await worldEntry(request,env.ASSETS)||env.ASSETS.fetch(request);
}

const PUBLIC_ORIGINS=new Set(['https://astrift-front.fewa3729.workers.dev','https://astrift.com','https://www.astrift.com','https://astrift-hub.fewa3729.workers.dev','https://play.astrift.com','https://astrift-front.pages.dev','https://fewa13.github.io','https://astrift-front-netlify.netlify.app','https://astrift-front-vercel.vercel.app',
  'https://astrift.codeberg.page',
  'https://astrift-front.surge.sh',
  'https://astrift-2b44b8.gitlab.io',
  'https://astrift-front.web.app',
  'https://astrift-front.firebaseapp.com',
  'https://cadencepark-iusd.my.canva.site',
  // Exact game-files origin observed in the official CrazyGames preview.
  // Do not allow unrelated games or wildcard platform subdomains.
  'https://xing-xi-qian-xian-astrift-front.game-files.crazygames.com']);
// Google rotates code-embed hosts. This identifies the platform, not our Site;
// every protected operation must still authenticate the account server-side.
function googleEmbedOrigin(origin:string|null){return Boolean(origin&&/^https:\/\/[0-9]{1,20}-atari-embeds\.googleusercontent\.com$/.test(origin))}
// Canva regenerates its codelet host when code is re-embedded. These are public,
// credentialless game clients, never proof of an account or administrative access.
function canvaEmbedOrigin(origin:string|null){return Boolean(origin&&/^https:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.canvacode\.com$/.test(origin))}
function allowedApiOrigin(origin:string|null,workerOrigin:string){return origin===workerOrigin||origin==='null'||Boolean(origin&&(PUBLIC_ORIGINS.has(origin)||googleEmbedOrigin(origin)||canvaEmbedOrigin(origin)))}
function googleEmbedPath(path:string){return /^\/api\/(account|ancient|social)\//.test(path)}
// Opaque origins cannot identify a particular file. Treat these as public,
// credentialless clients; protected actions still require explicit account tokens.
function localFilePath(path:string){return path==='/api/client-version'||googleEmbedPath(path)||/^\/api\/(extraction|room|duel|tri|quad|gunmaster|challenge|ranked|tournament|ctf|hardpoint|survival|bomb)\//.test(path)||['/api/loadout-codes','/api/matchmaking/ranked','/api/matchmaking/duel','/api/forum','/api/forum/post'].includes(path)}

export default {
  async fetch(request,env):Promise<Response>{
    const url=new URL(request.url),origin=request.headers.get('Origin');
    // Deny other API families before dispatch (including WebSocket upgrades).
    if(url.pathname.startsWith('/api/')&&googleEmbedOrigin(origin)&&!googleEmbedPath(url.pathname))return Response.json({error:'请求来源无效'},{status:403,headers:{'Cache-Control':'no-store','Vary':'Origin'}});
    if(url.pathname.startsWith('/api/')&&canvaEmbedOrigin(origin)&&!localFilePath(url.pathname))return Response.json({error:'请求来源无效'},{status:403,headers:{'Cache-Control':'no-store','Vary':'Origin'}});
    if(url.pathname.startsWith('/api/')&&origin==='null'&&!localFilePath(url.pathname))return Response.json({error:'请求来源无效'},{status:403,headers:{'Cache-Control':'no-store','Vary':'Origin'}});
    const pagesRequest=url.pathname.startsWith('/api/')&&Boolean(origin&&(PUBLIC_ORIGINS.has(origin)||googleEmbedOrigin(origin)&&googleEmbedPath(url.pathname)||canvaEmbedOrigin(origin)&&localFilePath(url.pathname)||origin==='null'&&localFilePath(url.pathname))),corsOrigin=origin==='null'?'*':origin||'';
    if(pagesRequest&&request.method==='OPTIONS')return new Response(null,{status:204,headers:{
      'Access-Control-Allow-Origin':corsOrigin,
      'Access-Control-Allow-Methods':'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':'Content-Type',
      'Access-Control-Max-Age':'86400',
      'Vary':'Origin',
    }});
    const response=await handleRequest(request,env);
    if(!pagesRequest||response.status===101)return response;
    const headers=new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin',corsOrigin);
    headers.append('Vary','Origin');
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }
} satisfies ExportedHandler<Env>;
