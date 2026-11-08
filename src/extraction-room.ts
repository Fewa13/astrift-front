// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {CLIENT_OUTDATED,currentClient} from './client-version';
import {DurableObject} from 'cloudflare:workers';
type Member={name:string;host:boolean;ready:boolean;level:number;loadout:Record<string,unknown>|null;finished:boolean};
type Party={room:string;phase:'lobby'|'running';members:Member[];started:number;ends:number};
type Identity={name:string;id:string;position?:number[];signalAt?:number};
export class ExtractionRoom extends DurableObject<Env>{
 kickAccount(name:string){for(const ws of this.ctx.getWebSockets('account:'+encodeURIComponent(name)))try{ws.close(1008,'Account banned')}catch{}}

  constructor(ctx:DurableObjectState,env:Env){super(ctx,env);ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS extraction_state (id INTEGER PRIMARY KEY,data TEXT NOT NULL)');ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS extraction_invites (name TEXT PRIMARY KEY)');ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS extraction_world (id INTEGER PRIMARY KEY,data TEXT NOT NULL)')}
  private read():Party|null{const row=this.ctx.storage.sql.exec<{data:string}>('SELECT data FROM extraction_state WHERE id=1').toArray()[0];return row?JSON.parse(row.data):null}
  private write(p:Party){this.ctx.storage.sql.exec('INSERT INTO extraction_state VALUES(1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data',JSON.stringify(p))}
  private broadcast(data:unknown,except?:WebSocket){const raw=JSON.stringify(data);for(const ws of this.ctx.getWebSockets())if(ws!==except)try{ws.send(raw)}catch{}}
  authorize(name:string,target:string){const p=this.read();if(!p||p.phase!=='lobby'||!p.members.some(m=>m.name===name))return false;if(p.members.length>=3)return false;this.ctx.storage.sql.exec('INSERT OR REPLACE INTO extraction_invites VALUES(?)',target);return true}
  command(room:string,name:string,action:string,loadout:Record<string,unknown>|null=null,level=1){
    let p=this.read();
    if(!p&&action==='create'){p={room,phase:'lobby',members:[{name,host:true,ready:false,level,loadout:null,finished:false}],started:0,ends:0};this.write(p)}
    if(!p)return {ok:false,error:'队伍不存在'};
    const me=p.members.find(m=>m.name===name);
    if(action==='join'&&!me){if(p.phase!=='lobby'||p.members.length>=3)return {ok:false,error:'队伍已满或已出发'};if(!this.ctx.storage.sql.exec('SELECT name FROM extraction_invites WHERE name=?',name).toArray().length)return {ok:false,error:'需要好友邀请'};p.members.push({name,host:false,ready:false,level,loadout:null,finished:false});for(const m of p.members)m.ready=false;this.write(p)}
    else if(!me)return {ok:false,error:'你不在队伍里'};
    if(action==='ready'&&me){if(p.phase!=='lobby')return {ok:false,error:'对局已经开始'};if(!loadout?.weapon||!Array.isArray(loadout.bag)||loadout.bag.length>20)return {ok:false,error:'请完成整备'};me.ready=true;me.level=level;me.loadout=loadout;if(p.members.every(m=>m.ready)){p.phase='running';p.started=Date.now();p.ends=p.started+1200000}this.write(p)}
    if(action==='unready'&&me&&p.phase==='lobby'){me.ready=false;this.write(p)}
    if(action==='finish'&&me){me.finished=true;me.ready=false;if(me.host&&p.members.some(m=>!m.finished)){me.host=false;p.members.find(m=>!m.finished)!.host=true}if(p.members.every(m=>m.finished)){p.phase='lobby';for(const m of p.members){m.finished=false;m.loadout=null}this.ctx.storage.sql.exec('DELETE FROM extraction_world')}this.write(p);this.broadcast({type:'extractionParty',party:p})}
    if(action==='leave'&&me){p.members=p.members.filter(m=>m!==me);if(p.members.length){if(me.host)p.members[0].host=true;for(const m of p.members)m.ready=false;this.write(p)}else this.ctx.storage.sql.exec('DELETE FROM extraction_state');this.broadcast({type:'extractionParty',party:p})}
    return {ok:true,party:p};
  }
  async fetch(request:Request){if(request.headers.get('Upgrade')!=='websocket')return Response.json({error:'需要WebSocket'}, {status:426});const pair=new WebSocketPair();const account=request.headers.get('X-Astrift-Account'),release=new URL(request.url).searchParams.get('clientVersion')||'';this.ctx.acceptWebSocket(pair[1],[...(account?['account:'+account]:[]),'release:'+release]);return new Response(null,{status:101,webSocket:pair[0]})}
  async webSocketMessage(ws:WebSocket,raw:string|ArrayBuffer){
    if(typeof raw!=='string'||raw.length>60000)return;let d:Record<string,unknown>;try{d=JSON.parse(raw)}catch{return}if(!d||typeof d!=='object'||Array.isArray(d))return;
    if(d.type==='join'){
      const name=String(d.account||'').toLowerCase(),token=String(d.token||''),device=String(d.device||''),p=this.read();if(!p||p.phase!=='running'||!p.members.some(m=>m.name===name)||!await this.env.PLAYER_ACCOUNTS.getByName('account:'+name).validate(token,device)){ws.close(1008,'登录或队伍已失效');return}
      const identity:Identity={name,id:String(d.id).slice(0,80)};for(const old of this.ctx.getWebSockets())if(old!==ws&&old.deserializeAttachment()?.name===name)old.close(1000,'重新连接');ws.serializeAttachment(identity);
      const world=this.ctx.storage.sql.exec<{data:string}>('SELECT data FROM extraction_world WHERE id=1').toArray()[0];ws.send(JSON.stringify({type:'extractionWelcome',party:p,world:world?JSON.parse(world.data):null}));return;
    }
    const who=ws.deserializeAttachment() as Identity|null,p=this.read();if(!who||!p||p.phase!=='running')return;const member=p.members.find(m=>m.name===who.name);if(!member)return;
    if(['extractionRequest','extractionTransfer','extractionDrop'].includes(String(d.type))&&!currentClient(this.ctx.getTags(ws).find(tag=>tag.startsWith('release:'))?.slice(8))){
      ws.send(JSON.stringify({type:'clientUpdateRequired',...CLIENT_OUTDATED}));return;
    }

    if(d.type==='extractionDeath'){
      if(!Array.isArray(d.position)||d.position.length!==3||!d.position.every(v=>Number.isFinite(v)&&Math.abs(v)<200)||!Array.isArray(d.items)||d.items.length>80)return;
      const row=this.ctx.storage.sql.exec<{data:string}>('SELECT data FROM extraction_world WHERE id=1').toArray()[0],world=row?JSON.parse(row.data):{bots:[],drops:[]},id='death:'+who.name+':'+p.started;
      if(!world.drops.some((drop:{id:string})=>drop.id===id)){world.drops.push({id,position:d.position,items:d.items,name:who.name+' · 死亡盒',box:true});this.ctx.storage.sql.exec('INSERT INTO extraction_world VALUES(1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data',JSON.stringify(world));this.broadcast({type:'extractionWorld',world:{drops:world.drops}})}return;
    }
    if(member.finished)return;
    if(d.type==='state'){if(!Array.isArray(d.position)||d.position.length!==3||!d.position.every(v=>Number.isFinite(v)&&Math.abs(v)<200))return;who.position=d.position as number[];ws.serializeAttachment(who);this.broadcast({...d,id:who.id,name:who.name,team:0},ws)}
    else if(d.type==='extractionSignal'){
      const now=Date.now();if(!who.position||Math.hypot(who.position[0]-157,who.position[2]-57)>4||now-(who.signalAt||0)<12000)return;who.signalAt=now;ws.serializeAttachment(who);this.broadcast({type:'extractionSignal',id:who.id,position:[157,0,57]},ws);
    }
    else if(d.type==='extractionWorld'&&member.host){
      if(!d.world||typeof d.world!=='object'||Array.isArray(d.world))return;const world=d.world as {bots?:Record<string,unknown>[];drops?:unknown[]};if(world.bots&&(!Array.isArray(world.bots)||world.bots.length>24)||world.drops&&(!Array.isArray(world.drops)||world.drops.length>200))return;
      const row=this.ctx.storage.sql.exec<{data:string}>('SELECT data FROM extraction_world WHERE id=1').toArray()[0],old=row?JSON.parse(row.data) as {bots:Record<string,unknown>[];drops:unknown[]}: {bots:[],drops:[]};
      const drops=world.drops?[...world.drops,...old.drops.filter(drop=>{const id=String((drop as {id:string}).id);return id.startsWith('death:')&&!world.drops!.some(v=>(v as {id:string}).id===id)})]:old.drops;
      const merged={bots:world.bots?.map((b,i)=>({...old.bots[i],...b}))||old.bots,drops};this.ctx.storage.sql.exec('INSERT INTO extraction_world VALUES(1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data',JSON.stringify(merged));this.broadcast({...d,world:{...world,...(world.drops?{drops}:{})}},ws)
    }
    else if(['extractionHit','extractionTransfer','extractionDrop','extractionDeath','extractionBotShot','extractionRequest'].includes(String(d.type))){if(['extractionBotShot','extractionTransfer'].includes(String(d.type))&&!member.host)return;this.broadcast({...d,id:who.id,name:who.name},ws)}
    else if(['muzzle','rocket','blast','phaseFlash'].includes(String(d.type)))this.broadcast({...d,id:who.id,name:who.name},ws);
  }
  webSocketClose(ws:WebSocket,code:number){try{ws.close(code===1005?1000:code)}catch{}const who=ws.deserializeAttachment() as Identity|null;if(!who)return;const connected=this.ctx.getWebSockets().filter(s=>s!==ws&&s.readyState===1).map(s=>s.deserializeAttachment() as Identity|null);if(connected.some(c=>c?.name===who.name))return;this.broadcast({type:'leave',id:who.id});const p=this.read(),me=p?.members.find(m=>m.name===who.name);if(p&&me?.host&&p.phase==='running'){const next=p.members.find(m=>!m.finished&&connected.some(c=>c?.name===m.name));if(next){me.host=false;next.host=true;this.write(p);this.broadcast({type:'extractionParty',party:p})}}}
}
