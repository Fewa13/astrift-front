// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {initDamageReceipts,recordDamageReceipt,confirmDamageReceipt,sendDamageReceipt} from './damage-receipts';
import {DurableObject} from 'cloudflare:workers';
import {createMatch,tickMatch,dropFlag,carrierFlag,BASES,type Match,type Mode,type Fighter,type Position} from './objective-rules';
import {initCoverState,resetCoverState,coverSnapshot,applyCoverDamage} from './cover-state';
import {initSupply,resetSupply,supplySnapshot,claimSupply} from './supply-state';
import {contentIssue,roomChat} from './content-safety';

type Seat=Fighter&{connected:boolean;lastSeen:number;until:number;deadAt:number;session:string;eye:Position;rotation:number;prone:boolean;slide:boolean;ready:boolean;skin?:string;knifeSkin?:string;weapon?:string;lastHealAt?:number;};
export class ObjectiveRoom extends DurableObject<Env>{
 kickAccount(name:string){for(const ws of this.ctx.getWebSockets('account:'+encodeURIComponent(name)))try{ws.close(1008,'Account banned')}catch{}}

  private phaseFlashTimes=new Map<string,number>();
  private match:Match|null=null;
  private seats=new Map<string,Seat>();
  private mapId='crossroads';
  constructor(ctx:DurableObjectState,env:Env){
    super(ctx,env);
    initDamageReceipts(ctx);
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS objective_match(id INTEGER PRIMARY KEY,body TEXT)');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS objective_seats(id TEXT PRIMARY KEY,body TEXT)');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS objective_hits(id TEXT PRIMARY KEY,attacker TEXT,victim TEXT,round INTEGER,created INTEGER)');
    try{ctx.storage.sql.exec('ALTER TABLE objective_hits ADD COLUMN knife INTEGER NOT NULL DEFAULT 0')}catch{}
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS objective_map(id INTEGER PRIMARY KEY,map_id TEXT NOT NULL)');
    ctx.storage.sql.exec("INSERT OR IGNORE INTO objective_map VALUES(1,'crossroads')");
    initCoverState(ctx);
    initSupply(ctx);
    this.mapId=ctx.storage.sql.exec<{map_id:string}>('SELECT map_id FROM objective_map WHERE id=1').one().map_id;
    const saved=ctx.storage.sql.exec<{body:string}>('SELECT body FROM objective_match WHERE id=1').toArray()[0];
    if(saved)this.match=JSON.parse(saved.body);
    for(const row of ctx.storage.sql.exec<{body:string}>('SELECT body FROM objective_seats').toArray()){
      const seat:Seat=JSON.parse(row.body);this.seats.set(seat.id,seat);
    }
    for(const ws of ctx.getWebSockets()){const seat=this.attachment(ws);if(seat?.id)this.seats.set(seat.id,seat);}
  }
  private attachment(ws:WebSocket):Seat|null{return ws.deserializeAttachment();}
  private save(){if(this.match)this.ctx.storage.sql.exec('INSERT OR REPLACE INTO objective_match VALUES(1,?)',JSON.stringify(this.match));}
  private saveSeat(p:Seat){this.ctx.storage.sql.exec('INSERT OR REPLACE INTO objective_seats VALUES(?,?)',p.id,JSON.stringify(p));}
  private broadcast(data:unknown,except?:WebSocket){const msg=JSON.stringify(data);for(const ws of this.ctx.getWebSockets())if(ws!==except&&this.attachment(ws)?.id){try{ws.send(msg);}catch{}}}
  private snapshot(){return {type:'objective',...this.match,map:this.mapId,serverNow:Date.now(),players:[...this.seats.values()].map(p=>({id:p.id,name:p.name,team:p.team,connected:p.connected,ready:p.ready,state:{type:'state',id:p.id,name:p.name,team:p.team,hp:p.hp,position:p.eye,rotation:p.rotation,prone:p.prone,slide:p.slide,skin:p.skin||'',knifeSkin:p.knifeSkin||'',weapon:p.weapon||''}}))};}
  private publish(){this.broadcast(this.snapshot());}
  private arm(){this.ctx.waitUntil(this.seats.size?this.ctx.storage.setAlarm(Date.now()+(this.match?.phase==='running'?250:1000)):this.ctx.storage.deleteAlarm());}
  private both(){return [0,1].every(team=>[...this.seats.values()].some(p=>p.connected&&p.team===team));}
  private restart(){
    if(!this.match)return;
    this.match=createMatch(this.match.mode,Date.now(),this.match.round+1,!this.both());
    this.ctx.storage.sql.exec('DELETE FROM objective_hits');
    resetCoverState(this.ctx);
    resetSupply(this.ctx);
    for(const p of this.seats.values()){
      p.hp=100;p.deadAt=0;p.interacting=false;p.ready=false;p.position=[...BASES[p.team]];p.eye=[p.position[0],1.7,p.position[2]];
      this.saveSeat(p);for(const ws of this.ctx.getWebSockets())if(this.attachment(ws)?.session===p.session)ws.serializeAttachment(p);
    }
    this.save();this.publish();this.broadcast(supplySnapshot(this.ctx));
  }
  private remove(id:string){const p=this.seats.get(id);if(!p)return;if(this.match)dropFlag(this.match,id,Date.now());this.seats.delete(id);this.ctx.storage.sql.exec('DELETE FROM objective_seats WHERE id=?',id);this.broadcast({type:'leave',id});}
  private advance(){
    if(!this.match)return;
    const now=Date.now();
    for(const p of this.seats.values())if((!p.connected&&now>=p.until)||(p.connected&&now-p.lastSeen>40000)){
      for(const ws of this.ctx.getWebSockets())if(this.attachment(ws)?.session===p.session){ws.serializeAttachment(null);try{ws.close(1000,'Idle');}catch{}}
      this.remove(p.id);
    }
    if(this.match.phase==='waiting'&&this.both()){this.restart();return;}
    if(this.match.phase==='finished'&&(now>=this.match.nextAt||[...this.seats.values()].filter(p=>p.connected).every(p=>p.ready))){this.restart();return;}
    tickMatch(this.match,[...this.seats.values()].filter(p=>p.connected&&now-p.lastSeen<10000),now);
    this.save();
  }
  alarm(){this.advance();this.publish();this.arm();}
  async fetch(request:Request){
    if(request.headers.get('Upgrade')!=='websocket')return new Response('WebSocket required',{status:426});
    const mode=new URL(request.url).pathname.split('/')[2] as Mode;
    if(!this.match){this.match=createMatch(mode,Date.now(),0,true);this.save();}
    const [client,server]=Object.values(new WebSocketPair());this.ctx.acceptWebSocket(server,request.headers.get('X-Astrift-Account')?['account:'+request.headers.get('X-Astrift-Account')]:[]);server.serializeAttachment(null);
    return new Response(null,{status:101,webSocket:client});
  }
  webSocketMessage(ws:WebSocket,message:string|ArrayBuffer){
    if(typeof message!=='string'||message.length>2048||!this.match)return;
    let d:Record<string,unknown>;try{d=JSON.parse(message);if(!d||typeof d!=='object'||Array.isArray(d))return;}catch{return;}
    const now=Date.now();
    if(d.type==='join'){
      if(this.attachment(ws)||typeof d.id!=='string'||typeof d.name!=='string')return;
      const nameIssue=contentIssue(d.name,'name');if(nameIssue){ws.send(JSON.stringify({type:'full',message:nameIssue}));ws.close(1008,'Invalid name');return}
      this.advance();const id=d.id.slice(0,48),name=d.name.slice(0,14);if(!id||!name)return;
      const previous=this.seats.get(id),counts=[0,0];for(const p of this.seats.values())counts[p.team]++;
      if(!previous&&this.seats.size>=12){ws.send(JSON.stringify({type:'full',message:'房间已满（最多 12 人，每队 6 人）'}));ws.close(1013,'Full');return;}
      if(!this.seats.size){this.match=createMatch(this.match.mode,now,this.match.round+1,true);if(d.reconnect!==true){this.mapId=typeof d.map==='string'&&['crossroads','depot','arcade'].includes(d.map)?d.map:'crossroads';this.ctx.storage.sql.exec('UPDATE objective_map SET map_id=? WHERE id=1',this.mapId)}}
      const team=previous?.team??(counts[0]<=counts[1]?0:1),base=BASES[team];
      const p:Seat=previous?{...previous,connected:true,lastSeen:now,until:0,session:crypto.randomUUID()}:{id,name,team,position:[...base],eye:[base[0],1.7,base[2]],hp:100,connected:true,lastSeen:now,until:0,deadAt:0,session:crypto.randomUUID(),rotation:team===0?0:Math.PI,prone:false,slide:false,ready:false,lastHealAt:0};
      for(const other of this.ctx.getWebSockets())if(other!==ws&&this.attachment(other)?.id===id){other.serializeAttachment(null);try{other.close(1000,'Replaced');}catch{}}
      this.seats.set(id,p);this.saveSeat(p);ws.serializeAttachment(p);ws.send(JSON.stringify({type:'objectiveWelcome',id,team,map:this.mapId}));ws.send(JSON.stringify({type:'coverSnapshot',covers:coverSnapshot(this.ctx)}));ws.send(JSON.stringify(supplySnapshot(this.ctx)));this.advance();this.publish();this.arm();return;
    }
    const a=this.attachment(ws),p=a?.id?this.seats.get(a.id):undefined;if(!p||p.session!==a?.session)return;
    if(d.type==='damageAck'){const receipt=confirmDamageReceipt(this.ctx,p.id,d);sendDamageReceipt(this.ctx,receipt);return;}
    if(d.type==='chat'){
      const result=roomChat(this.ctx,p.id,p.name,p.team,d.text);
      if(result.error)ws.send(JSON.stringify({type:'chatError',message:result.error}));else this.broadcast(result.message);
      return;
    }
    p.lastSeen=now;
    if(d.type==='leave'){this.remove(p.id);ws.serializeAttachment(null);this.save();this.publish();ws.close(1000,'Left');this.arm();return;}
    if(d.type==='ping'){ws.serializeAttachment(p);ws.send(JSON.stringify(this.snapshot()));return;}
    if(d.round!==this.match.round)return;
    if(d.type==='supplyClaim'){
      if(this.match.phase!=='running'||p.hp<=0)return;
      const claim=claimSupply(this.ctx,p.eye,d.effect,p.hp);
      if(claim)this.broadcast({...claim,claimedBy:p.id,round:this.match.round});else ws.send(JSON.stringify(supplySnapshot(this.ctx)));
      return;
    }
    if(d.type==='coverHit'){
      if(this.match.phase!=='running'||p.hp<=0)return;
      const state=applyCoverDamage(this.ctx,this.mapId,d.coverId,d.damage);
      if(state)this.broadcast({...state,round:this.match.round});
      return;
    }
    if(d.type==='ready'&&this.match.phase==='finished'){p.ready=true;ws.serializeAttachment(p);this.saveSeat(p);this.advance();this.publish();return;}
    if(d.type==='heal'){
      if(this.match.phase!=='running'||p.hp<=0||now-(p.lastHealAt||0)<10000||!Array.isArray(d.targets)||d.targets.length>12)return;
      const healed:string[]=[];
      for(const id of new Set(d.targets.filter((value):value is string=>typeof value==='string'))){const ally=this.seats.get(id);if(!ally?.connected||ally.hp<=0||ally.team!==p.team||Math.hypot(ally.position[0]-p.position[0],ally.position[2]-p.position[2])>12||Math.abs(ally.position[1]-p.position[1])>2.6)continue;ally.hp=Math.min(100,ally.hp+20);this.saveSeat(ally);healed.push(id);for(const peer of this.ctx.getWebSockets())if(this.attachment(peer)?.id===ally.id)peer.serializeAttachment(ally);}
      if(!healed.length)return;p.lastHealAt=now;ws.serializeAttachment(p);this.saveSeat(p);this.broadcast({type:'heal',id:p.id,team:p.team,targets:healed,amount:20,round:this.match.round});this.publish();return;
    }
    if(d.type==='state'){
      if(!Array.isArray(d.position)||d.position.length!==3||!d.position.every(v=>typeof v==='number'&&Number.isFinite(v)))return;
      const eye=d.position.map(v=>Math.max(-100,Math.min(100,v))) as Position;
      // Carrying disallows climbing through the arena with a jetpack; a violation drops the flag.
      if(carrierFlag(this.match,p.id)&&eye[1]>7)dropFlag(this.match,p.id,now);
      p.eye=eye;p.prone=!!d.prone;p.slide=!!d.slide&&!p.prone;p.position=[eye[0],Math.max(0,eye[1]-((p.prone||p.slide)?.48:1.7)),eye[2]];
      p.rotation=Number.isFinite(d.rotation)?Number(d.rotation):0;p.skin=typeof d.skin==='string'&&/^[a-z]{1,16}$/.test(d.skin)?d.skin:'';p.knifeSkin=typeof d.knifeSkin==='string'&&/^[a-z]{1,20}$/.test(d.knifeSkin)?d.knifeSkin:'';p.weapon=typeof d.weapon==='string'&&/^[a-zA-Z0-9]{1,20}$/.test(d.weapon)?d.weapon:'';
      const claimed=Math.max(0,Math.min(100,Number(d.hp)||0));
      p.hp=p.deadAt&&now-p.deadAt<2600?0:claimed;if(p.hp>0)p.deadAt=0;
      p.interacting=!!d.interacting;ws.serializeAttachment(p);
      this.broadcast({type:'state',id:p.id,name:p.name,team:p.team,position:p.eye,rotation:p.rotation,prone:p.prone,slide:p.slide,hp:p.hp,skin:p.skin||'',knifeSkin:p.knifeSkin||'',weapon:p.weapon||'',round:this.match.round},ws);
      if(now-this.match.lastTick>=250){this.advance();this.publish();}return;
    }
    if(this.match.phase!=='running')return;
    if(d.type==='death'){
      if(p.deadAt||typeof d.shotId!=='string')return;
      const hit=this.ctx.storage.sql.exec<{attacker:string;knife:number}>('SELECT attacker,knife FROM objective_hits WHERE id=? AND victim=? AND round=? AND created>?',d.shotId,p.id,this.match.round,now-15000).toArray()[0];
      if(!hit)return;p.hp=0;p.deadAt=now;p.interacting=false;dropFlag(this.match,p.id,now);ws.serializeAttachment(p);this.saveSeat(p);this.ctx.storage.sql.exec('DELETE FROM objective_hits WHERE victim=?',p.id);
      this.save();this.broadcast({type:'objectiveKill',id:d.shotId,killerId:hit.attacker,killer:this.seats.get(hit.attacker)?.name||'玩家',victimId:p.id,victim:p.name,knife:!!hit.knife,round:this.match.round});this.publish();return;
    }
    if(p.hp<=0||p.deadAt)return;
    if(d.type==='shot'){
      const target=typeof d.target==='string'?this.seats.get(d.target):undefined;
      if(!target?.connected||target.hp<=0||target.team===p.team)return;
      const damage=Math.max(0,Math.min(200,Number(d.damage)||0));if(!damage)return;
      const shotId=crypto.randomUUID();this.ctx.storage.sql.exec('DELETE FROM objective_hits WHERE created<?',now-15000);
      this.ctx.storage.sql.exec('INSERT INTO objective_hits(id,attacker,victim,round,created,knife) VALUES(?,?,?,?,?,?)',shotId,p.id,target.id,this.match.round,now,d.weapon==='knife'&&d.zone!=='explosion'?1:0);
      recordDamageReceipt(this.ctx,shotId,p.id,target.id,damage,d);
      this.broadcast({type:'shot',id:p.id,team:p.team,target:target.id,damage,zone:['head','body','abdomen','arm','leg','explosion'].includes(String(d.zone))?d.zone:'body',shotId,round:this.match.round},ws);return;
    }
    if(d.type==='muzzle'){this.broadcast({type:'muzzle',id:p.id,team:p.team,hidden:!!d.hidden,round:this.match.round},ws);return;}
    if(d.type==='phaseFlash'){
      if(!Array.isArray(d.origin)||d.origin.length!==3||!d.origin.every(Number.isFinite)||!Number.isFinite(d.yaw))return;
      const now=Date.now();if(now-(this.phaseFlashTimes.get(p.id)||0)<20000)return;
      this.phaseFlashTimes.set(p.id,now);
      this.broadcast({type:'phaseFlash',id:p.id,team:p.team,round:this.match.round,origin:d.origin.map((v:number)=>Math.max(-300,Math.min(300,v))),yaw:d.yaw},ws);return;
    }
    if(d.type==='rocket'){
      if(!Array.isArray(d.origin)||!Array.isArray(d.direction)||d.origin.length!==3||d.direction.length!==3||![...d.origin,...d.direction].every(v=>typeof v==='number'&&Number.isFinite(v)))return;
      this.broadcast({type:'rocket',id:p.id,team:p.team,round:this.match.round,rocketId:typeof d.rocketId==='string'&&/^[a-f0-9-]{36}$/.test(d.rocketId)?d.rocketId:undefined,origin:d.origin.map(v=>Math.max(-100,Math.min(100,v))),direction:d.direction.map(v=>Math.max(-1,Math.min(1,v))),speed:Math.max(10,Math.min(100,Number(d.speed)||34)),drop:Math.max(0,Math.min(10,Number(d.drop)||0)),life:Math.max(.2,Math.min(6,Number(d.life)||3))},ws);return;
    }
    if(d.type==='blast'){
      if(typeof d.rocketId!=='string'||!/^[a-f0-9-]{36}$/.test(d.rocketId)||!Array.isArray(d.position)||d.position.length!==3||!d.position.every(v=>typeof v==='number'&&Number.isFinite(v)))return;
      this.broadcast({type:'blast',id:p.id,team:p.team,round:this.match.round,rocketId:d.rocketId,position:d.position.map(v=>Math.max(-100,Math.min(100,v))),radius:Math.max(2,Math.min(15,Number(d.radius)||7)),incendiary:!!d.incendiary,smoke:!!d.smoke,cluster:!!d.cluster},ws);return;
    }
    if(d.type==='throwable'||d.type==='throwableBurst'){
      if(typeof d.throwId!=='string'||!/^[a-f0-9-]{36}$/.test(d.throwId)||!['smoke','grenade'].includes(String(d.kind)))return;
      const point=d.type==='throwable'?d.origin:d.position;
      if(!Array.isArray(point)||point.length!==3||!point.every(v=>typeof v==='number'&&Number.isFinite(v)))return;
      if(d.type==='throwable'){
        if(!Array.isArray(d.velocity)||d.velocity.length!==3||!d.velocity.every(v=>typeof v==='number'&&Number.isFinite(v)))return;
        this.broadcast({type:'throwable',id:p.id,team:p.team,round:this.match.round,throwId:d.throwId,kind:d.kind,origin:point.map(v=>Math.max(-100,Math.min(100,v))),velocity:d.velocity.map(v=>Math.max(-30,Math.min(30,v))),fuseMs:d.kind==='grenade'&&typeof d.fuseMs==='number'&&Number.isFinite(d.fuseMs)?Math.max(0,Math.min(4000,d.fuseMs)):4000},ws);
      }else this.broadcast({type:'throwableBurst',id:p.id,team:p.team,round:this.match.round,throwId:d.throwId,kind:d.kind,position:point.map(v=>Math.max(-100,Math.min(100,v)))},ws);
      return;
    }
  }
  webSocketClose(ws:WebSocket){const a=this.attachment(ws),p=a?.id?this.seats.get(a.id):undefined;if(!p||p.session!==a?.session)return;p.connected=false;p.interacting=false;p.until=Date.now()+60000;if(this.match)dropFlag(this.match,p.id,Date.now());this.saveSeat(p);ws.serializeAttachment(null);this.save();this.publish();this.arm();}
  webSocketError(ws:WebSocket){this.webSocketClose(ws);try{ws.close(1011,'Connection error');}catch{}}
}
