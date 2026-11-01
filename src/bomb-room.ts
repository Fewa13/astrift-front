// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {initDamageReceipts,recordDamageReceipt,confirmDamageReceipt,sendDamageReceipt} from './damage-receipts';
import {DurableObject} from 'cloudflare:workers';
import {BOMB_MAP_LIMIT,BOMB_MAP_SCALE,BOMB_PRESETS,beginBombHold,createBombMatch,startBombRound,tickBombMatch,type BombFighter,type BombMatch,type BombPreset,type BombSide} from './bomb-rules';
import {initCoverState,resetCoverState,coverSnapshot,applyCoverDamage} from './cover-state';
import {BOMB_START_CREDITS,awardBombCredits,buyBombWeapon,bombWeaponCost} from './bomb-economy';
import {contentIssue,roomChat} from './content-safety';

type Seat=BombFighter&{name:string;eye:[number,number,number];rotation:number;prone:boolean;slide:boolean;session:string;connected:boolean;lastSeen:number;until:number;skin:string;knifeSkin:string;weapon:string;ready?:boolean;credits?:number;boughtWeapon?:string|null};
type Bot=BombFighter&{name:string;weapon:string;rotation:number;prone:boolean;slide:boolean};
type Hit={attacker:string;victim:string;created:number;knife:boolean};
const spawn=(team:BombSide,index:number):[number,number,number]=>[[-32,-16,0,16,32][index%5]*BOMB_MAP_SCALE,0,(team===0?180:-180)*BOMB_MAP_SCALE];
export class BombRoom extends DurableObject<Env>{
 kickAccount(name:string){for(const ws of this.ctx.getWebSockets('account:'+encodeURIComponent(name)))try{ws.close(1008,'Account banned')}catch{}}

  private phaseFlashTimes=new Map<string,number>();
  private match:BombMatch;
  private seats=new Map<string,Seat>();
  private bots=new Map<string,Bot>();
  private hits=new Map<string,Hit>();
  private mapId='bomb';
  private preset:BombPreset='solo';
  private host='';
  private awardedRound=0;
  constructor(ctx:DurableObjectState,env:Env){super(ctx,env);initDamageReceipts(ctx);ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS bomb_data(id INTEGER PRIMARY KEY,body TEXT NOT NULL)');initCoverState(ctx);const saved=ctx.storage.sql.exec<{body:string}>('SELECT body FROM bomb_data WHERE id=1').toArray()[0];if(saved){const state=JSON.parse(saved.body);this.match=state.match;this.mapId='bomb';this.preset=state.preset;this.host=state.host;this.awardedRound=state.awardedRound??(this.match.phase==='intermission'||this.match.phase==='finished'?this.match.round:0);for(const p of state.seats)this.seats.set(p.id,{...p,credits:p.credits??BOMB_START_CREDITS,boughtWeapon:p.boughtWeapon??(this.match.phase==='running'&&bombWeaponCost(p.weapon)!==null?p.weapon:null)});for(const b of state.bots)this.bots.set(b.id,b);}else this.match=createBombMatch();}
  private attachment(ws:WebSocket):{id:string;session:string}|null{return ws.deserializeAttachment();}
  private save(){this.ctx.storage.sql.exec('INSERT OR REPLACE INTO bomb_data(id,body) VALUES(1,?)',JSON.stringify({match:this.match,seats:[...this.seats.values()],bots:[...this.bots.values()],mapId:this.mapId,preset:this.preset,host:this.host,awardedRound:this.awardedRound}));}
  private send(ws:WebSocket,value:unknown){try{ws.send(JSON.stringify(value));}catch{}}
  private broadcast(value:unknown,except?:WebSocket){for(const ws of this.ctx.getWebSockets())if(ws!==except&&this.attachment(ws)?.id)this.send(ws,value);}
  private fighters():BombFighter[]{return [...this.seats.values(),...this.bots.values()];}
  private snapshot(){return {type:'bomb',...this.match,map:this.mapId,preset:this.preset,host:this.host,serverNow:Date.now(),players:[...this.seats.values()].map(p=>({id:p.id,name:p.name,team:p.team,hp:p.hp,position:p.eye,rotation:p.rotation,prone:p.prone,slide:p.slide,connected:p.connected,ready:!!p.ready,credits:p.credits??BOMB_START_CREDITS,boughtWeapon:p.boughtWeapon??null,skin:p.skin,knifeSkin:p.knifeSkin,weapon:p.weapon})),bots:[...this.bots.values()]};}
  private publish(){this.broadcast(this.snapshot());}
  private arm(){this.ctx.waitUntil(this.seats.size?this.ctx.storage.setAlarm(Date.now()+(this.match.phase==='running'||this.match.phase==='prep'?250:1000)):this.ctx.storage.deleteAlarm());}
  private resetRound(now:number){for(const [i,p] of [...this.seats.values()].entries()){p.hp=100;p.eye=[...spawn(p.team,i)] as [number,number,number];p.eye[1]=1.7;p.position=[p.eye[0],0,p.eye[2]];p.weapon=p.boughtWeapon||'revolver';p.prone=false;p.slide=false;}for(const [i,b] of [...this.bots.values()].entries()){b.hp=100;b.position=spawn(b.team,i);b.prone=false;b.slide=false;}startBombRound(this.match,this.fighters(),now);resetCoverState(this.ctx);this.hits.clear();this.broadcast({type:'coverSnapshot',covers:coverSnapshot(this.ctx)});this.save();this.publish();}
  private beginIfReady(now:number){const config=BOMB_PRESETS[this.preset];if(this.seats.size<config.humans||![...this.seats.values()].every(p=>p.connected&&p.ready))return false;this.resetRound(now);return true;}
  private advance(){const now=Date.now();for(const p of [...this.seats.values()])if(!p.connected&&now>=p.until){this.seats.delete(p.id);this.broadcast({type:'leave',id:p.id});}if(!this.seats.has(this.host))this.host=[...this.seats.values()].find(p=>p.connected)?.id||'';
    if(this.match.phase==='waiting')this.beginIfReady(now);
    else if(this.match.phase==='running'||this.match.phase==='prep')tickBombMatch(this.match,this.fighters(),now);
    if((this.match.phase==='intermission'||this.match.phase==='finished')&&this.match.round>this.awardedRound){this.awardedRound=this.match.round;for(const p of this.seats.values())p.credits=awardBombCredits(p.credits??BOMB_START_CREDITS,p.team===this.match.winner);}
    if(this.match.phase==='intermission'&&now>=this.match.nextAt){this.match.phase='waiting';this.match.event=`第 ${this.match.round+1}/12 回合购买阶段`;this.match.revision++;for(const p of this.seats.values()){p.ready=false;p.boughtWeapon=null;}}
    else if(this.match.phase==='finished'&&now>=this.match.nextAt){this.match=createBombMatch(now);this.awardedRound=0;for(const p of this.seats.values()){p.ready=false;p.credits=BOMB_START_CREDITS;p.boughtWeapon=null;}}
    this.save();this.publish();this.arm();}
  alarm(){this.advance();}
  async fetch(request:Request){if(request.headers.get('Upgrade')!=='websocket')return new Response('WebSocket required',{status:426});const [client,server]=Object.values(new WebSocketPair());this.ctx.acceptWebSocket(server,request.headers.get('X-Astrift-Account')?['account:'+request.headers.get('X-Astrift-Account')]:[]);server.serializeAttachment(null);return new Response(null,{status:101,webSocket:client});}
  webSocketMessage(ws:WebSocket,message:string|ArrayBuffer){if(typeof message!=='string'||message.length>8192)return;let d:Record<string,unknown>;try{d=JSON.parse(message);if(!d||typeof d!=='object'||Array.isArray(d))return;}catch{return;}const now=Date.now();
    if(d.type==='join'){
      if(this.attachment(ws)||typeof d.id!=='string'||typeof d.name!=='string')return;const id=d.id.slice(0,48),name=d.name.slice(0,14);if(!id||!name)return;
      const nameIssue=contentIssue(name,'name');if(nameIssue){this.send(ws,{type:'full',message:nameIssue});ws.close(1008,'Invalid name');return}
      const prior=this.seats.get(id);if(!prior&&this.seats.size>=BOMB_PRESETS[this.preset].humans){this.send(ws,{type:'full',message:'当前爆破房间选手已满'});ws.close(1013,'Full');return;}
      if(!this.seats.size){this.preset=typeof d.preset==='string'&&d.preset in BOMB_PRESETS?d.preset as BombPreset:'solo';this.mapId='bomb';this.host=id;this.match=createBombMatch(now);this.awardedRound=0;this.bots.clear();const config=BOMB_PRESETS[this.preset];for(let team=0;team<2;team++){const count=team===0?config.alliedAi:config.enemyAi;for(let i=0;i<count;i++){const botId=`bomb-ai-${team}-${i}`;this.bots.set(botId,{id:botId,name:`战术 AI ${team===0?'蓝':'红'}-${i+1}`,team:team as BombSide,hp:100,position:spawn(team as BombSide,i),rotation:0,prone:false,slide:false,weapon:['redline','hammer','gale','smg','frost'][i%5],connected:true});}}}
      const config=BOMB_PRESETS[this.preset],ordinal=this.seats.size,team=prior?.team??(ordinal<config.hostHumans?0:1) as BombSide,position=spawn(team,ordinal),session=crypto.randomUUID();const p:Seat=prior?{...prior,connected:true,lastSeen:now,until:0,session}:{id,name,team,hp:100,position,eye:[position[0],1.7,position[2]],rotation:0,prone:false,slide:false,session,connected:true,lastSeen:now,until:0,skin:'',knifeSkin:'',weapon:'revolver',ready:false,credits:BOMB_START_CREDITS,boughtWeapon:null};
      for(const peer of this.ctx.getWebSockets())if(peer!==ws&&this.attachment(peer)?.id===id){peer.serializeAttachment(null);try{peer.close(1000,'Replaced');}catch{}}
      this.seats.set(id,p);ws.serializeAttachment({id,session});this.send(ws,{type:'bombWelcome',id,team,map:this.mapId,preset:this.preset,host:this.host});this.send(ws,{type:'coverSnapshot',covers:coverSnapshot(this.ctx)});this.advance();this.arm();return;
    }
    const a=this.attachment(ws),p=a?.id?this.seats.get(a.id):undefined;if(!p||p.session!==a?.session)return;p.lastSeen=now;
    if(d.type==='damageAck'){const receipt=confirmDamageReceipt(this.ctx,p.id,d);sendDamageReceipt(this.ctx,receipt);return;}
    if(d.type==='chat'){
      const result=roomChat(this.ctx,p.id,p.name,p.team,d.text);
      if(result.error)this.send(ws,{type:'chatError',message:result.error});else this.broadcast(result.message);
      return;
    }
    if(d.type==='leave'){p.connected=false;p.until=now;this.advance();ws.serializeAttachment(null);ws.close(1000,'Left');return;}
    if(d.type==='ping'){this.send(ws,this.snapshot());return;}
    if(d.round!==this.match.round)return;
    if(d.type==='restart'&&this.match.phase==='finished'){this.match=createBombMatch(now);this.awardedRound=0;for(const seat of this.seats.values()){seat.ready=false;seat.credits=BOMB_START_CREDITS;seat.boughtWeapon=null;}this.save();this.publish();return;}
    if(d.type==='ready'&&this.match.phase==='waiting'){if(p.ready)return;const weapon=typeof d.weapon==='string'?d.weapon:null,purchase=buyBombWeapon(p.credits??BOMB_START_CREDITS,weapon);if(!purchase){this.send(ws,{type:'bombBuyError',message:bombWeaponCost(weapon)===null?'无效武器':'相位点不足'});return}p.credits=purchase.credits;p.boughtWeapon=purchase.weapon;p.weapon=p.boughtWeapon||'revolver';p.ready=true;this.advance();return;}
    if(d.type==='state'){if(!Array.isArray(d.position)||d.position.length!==3||!d.position.every(v=>typeof v==='number'&&Number.isFinite(v)))return;const eye=d.position.map((v,i)=>Math.max(i===1?-20:-BOMB_MAP_LIMIT,Math.min(i===1?90:BOMB_MAP_LIMIT,v))) as [number,number,number];if(this.match.phase!=='prep'||p.team!==this.match.attackTeam){p.eye=eye;p.position=[eye[0],Math.max(0,eye[1]-((d.prone||d.slide)?.48:1.7)),eye[2]];}p.rotation=Number.isFinite(d.rotation)?Number(d.rotation):0;p.prone=!!d.prone;p.slide=!!d.slide&&!p.prone;p.weapon=typeof d.weapon==='string'?d.weapon.slice(0,20):p.weapon;p.skin=typeof d.skin==='string'?d.skin.slice(0,20):'';p.knifeSkin=typeof d.knifeSkin==='string'?d.knifeSkin.slice(0,20):'';if(this.match.phase==='running')p.hp=Math.min(p.hp,Math.max(0,Math.min(100,Number(d.hp)||0)));p.interacting=!!d.interacting;this.broadcast({type:'state',id:p.id,name:p.name,team:p.team,position:p.eye,rotation:p.rotation,prone:p.prone,slide:p.slide,hp:p.hp,weapon:p.weapon,skin:p.skin,knifeSkin:p.knifeSkin,round:this.match.round},ws);if(this.match.phase==='running'){if(p.interacting&&!this.match.hold)for(const site of ['A','B'] as const)if(beginBombHold(this.match,p,site,now))break;tickBombMatch(this.match,this.fighters(),now);}this.save();return;}
    if(this.match.phase!=='running'&&!(this.match.phase==='prep'&&d.type==='botState')||p.hp<=0&&!['botState','botShot','botDown'].includes(String(d.type)))return;
    if(d.type==='death'){const hit=typeof d.shotId==='string'?this.hits.get(d.shotId):null;if(!hit||hit.victim!==p.id||now-hit.created>15000)return;p.hp=0;p.interacting=false;this.hits.delete(d.shotId as string);this.broadcast({type:'bombKill',id:d.shotId,killerId:hit.attacker,killer:this.seats.get(hit.attacker)?.name||this.bots.get(hit.attacker)?.name||'玩家',victimId:p.id,victim:p.name,knife:hit.knife,round:this.match.round});tickBombMatch(this.match,this.fighters(),now);this.save();this.publish();return;}
    if(d.type==='botDown'&&p.id===this.host&&typeof d.botId==='string'){const bot=this.bots.get(d.botId);if(!bot||bot.hp<=0)return;bot.hp=0;this.broadcast({type:'bombKill',id:crypto.randomUUID(),killerId:typeof d.killerId==='string'?d.killerId:p.id,killer:typeof d.killer==='string'?d.killer.slice(0,20):p.name,victimId:bot.id,victim:bot.name,round:this.match.round});tickBombMatch(this.match,this.fighters(),now);this.save();this.publish();return;}
    if(d.type==='botState'&&p.id===this.host&&Array.isArray(d.bots)){for(const row of d.bots.slice(0,10) as Record<string,unknown>[]){const bot=typeof row.id==='string'?this.bots.get(row.id):undefined;if(!bot||bot.hp<=0||this.match.phase==='prep'&&bot.team===this.match.attackTeam||!Array.isArray(row.position)||row.position.length!==3||!row.position.every(v=>typeof v==='number'&&Number.isFinite(v)))continue;bot.position=row.position.map((v,i)=>Math.max(i===1?-20:-BOMB_MAP_LIMIT,Math.min(i===1?90:BOMB_MAP_LIMIT,v))) as [number,number,number];bot.rotation=Number(row.rotation)||0;bot.prone=!!row.prone;bot.slide=!!row.slide&&!bot.prone;bot.weapon=typeof row.weapon==='string'?row.weapon.slice(0,20):bot.weapon;bot.interacting=!!row.interacting;}
      if(this.match.phase==='running'&&!this.match.hold)for(const bot of this.bots.values())if(bot.interacting)for(const site of ['A','B'] as const)if(beginBombHold(this.match,bot,site,now))break;tickBombMatch(this.match,this.fighters(),now);this.broadcast({type:'bombBotState',bots:[...this.bots.values()],round:this.match.round},ws);this.save();return;}
    if(d.type==='shot'||d.type==='botShot'){if(d.type==='botShot'&&p.id!==this.host)return;if(d.type==='shot'&&!['knife','revolver',p.boughtWeapon].includes(String(d.weapon)))return;const attacker=d.type==='botShot'&&typeof d.botId==='string'?this.bots.get(d.botId):p,target=typeof d.target==='string'?this.seats.get(d.target)||this.bots.get(d.target):undefined;if(!attacker||attacker.hp<=0||!target?.connected||target.hp<=0||target.team===attacker.team)return;const damage=Math.max(0,Math.min(200,Number(d.damage)||0));if(!damage)return;const shotId=crypto.randomUUID();if(this.bots.has(target.id)){target.hp=Math.max(0,target.hp-damage);if(target.hp===0){this.broadcast({type:'bombKill',id:shotId,killerId:attacker.id,killer:this.seats.get(attacker.id)?.name||this.bots.get(attacker.id)?.name||'玩家',victimId:target.id,victim:this.bots.get(target.id)?.name||'AI',round:this.match.round});tickBombMatch(this.match,this.fighters(),now);this.save();this.publish();}else this.broadcast({type:'bombBotHit',botId:target.id,hp:target.hp,round:this.match.round});return;}recordDamageReceipt(this.ctx,shotId,attacker.id,target.id,damage,d);this.hits.set(shotId,{attacker:attacker.id,victim:target.id,created:now,knife:d.weapon==='knife'});const shot={type:'shot',id:attacker.id,team:attacker.team,target:target.id,damage,zone:typeof d.zone==='string'?d.zone:'body',shotId,round:this.match.round};this.broadcast(shot,ws);if(d.type==='botShot'&&target.id===p.id)this.send(ws,shot);return;}
    if(d.type==='coverHit'){const state=applyCoverDamage(this.ctx,this.mapId,d.coverId,d.damage);if(state)this.broadcast({...state,round:this.match.round});return;}
    if(d.type==='phaseFlash'){
      if(!Array.isArray(d.origin)||d.origin.length!==3||!d.origin.every(Number.isFinite)||!Number.isFinite(d.yaw))return;
      if(now-(this.phaseFlashTimes.get(p.id)||0)<20000)return;
      this.phaseFlashTimes.set(p.id,now);
      this.broadcast({type:'phaseFlash',id:p.id,team:p.team,round:this.match.round,origin:d.origin.map((v:number)=>Math.max(-300,Math.min(300,v))),yaw:d.yaw},ws);return;
    }
    if(['muzzle','rocket','blast','throwable','throwableBurst','heal'].includes(String(d.type))){if(d.type==='rocket'&&p.boughtWeapon!=='meteor')return;if(d.type==='throwable')d.fuseMs=d.kind==='grenade'&&typeof d.fuseMs==='number'&&Number.isFinite(d.fuseMs)?Math.max(0,Math.min(4000,d.fuseMs)):4000;this.broadcast({...d,id:p.id,team:p.team,round:this.match.round},ws);return;}
  }
  webSocketClose(ws:WebSocket){const a=this.attachment(ws),p=a?.id?this.seats.get(a.id):undefined;if(!p||p.session!==a?.session)return;p.connected=false;p.until=Date.now()+60000;p.interacting=false;ws.serializeAttachment(null);this.advance();}
  webSocketError(ws:WebSocket){this.webSocketClose(ws);try{ws.close(1011,'Connection error');}catch{}}
}
