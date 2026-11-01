// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {contentIssue,roomChat} from './content-safety';
import {activateSurvivalSkill,hitSurvivalZombie,newSurvivalPlayer,newSurvivalState,purchaseSurvival,tickSurvival,TOWER_HEIGHT,TOWER_LIMIT} from './survival-rules';
import type {SurvivalState} from './survival-rules';
import type {TowerMember,TowerResult} from './survival-ranking-rules';
type Attachment={towerSurvival:boolean;id:string;joined:number};
type TowerSession={solo:boolean;paused?:boolean;runId:string;startedAt:number;lastTick:number;members:(TowerMember&{id:string})[];accounts:Record<string,TowerMember>;qualified:boolean;queued:boolean};
const newSession=(solo=false):TowerSession=>({solo,runId:crypto.randomUUID(),startedAt:0,lastTick:Date.now(),members:[],accounts:{},qualified:false,queued:false});
export class SurvivalRoomEngine{
  private state:SurvivalState;
  private session:TowerSession;
  private reporting:Promise<void>|null=null;
  private lastTick=Date.now();
  constructor(private ctx:DurableObjectState,private env:Env){
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS tower_survival (id INTEGER PRIMARY KEY,state TEXT NOT NULL)');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS tower_session(id INTEGER PRIMARY KEY,data TEXT NOT NULL)');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS tower_result_outbox(run_id TEXT PRIMARY KEY,data TEXT NOT NULL)');
    const row=ctx.storage.sql.exec<{state:string}>('SELECT state FROM tower_survival WHERE id=1').toArray()[0];
    this.state=row?JSON.parse(row.state):newSurvivalState();
    const saved=ctx.storage.sql.exec<{data:string}>('SELECT data FROM tower_session WHERE id=1').toArray()[0];
    this.session=saved?JSON.parse(saved.data):newSession();this.lastTick=this.session.lastTick||Date.now();
    const connected=new Set(ctx.getWebSockets().map(s=>(s.deserializeAttachment() as Attachment|null)?.id));
    for(const p of this.state.players)p.connected=connected.has(p.id);
  }
  private save(){this.session.lastTick=this.lastTick;this.ctx.storage.sql.exec('INSERT OR REPLACE INTO tower_survival VALUES(1,?)',JSON.stringify(this.state));this.ctx.storage.sql.exec('INSERT OR REPLACE INTO tower_session VALUES(1,?)',JSON.stringify(this.session))}
  private broadcast(payload:unknown,except?:WebSocket){const text=JSON.stringify(payload);for(const s of this.ctx.getWebSockets())if(s!==except){try{s.send(text)}catch{}}}
  private snapshot(){return {type:'survivalState',state:this.state,ranked:this.session.qualified,solo:this.session.solo,host:this.state.players.find(p=>p.connected)?.id||''}}
  private publish(){this.queueCompleted();this.save();this.broadcast(this.snapshot())}
  private begin(){
    this.state.status='running';this.lastTick=Date.now();this.session.startedAt=this.lastTick;
    const players=this.state.players.filter(p=>p.connected);
    this.session.members=players.flatMap(p=>this.session.accounts[p.id]?[{id:p.id,...this.session.accounts[p.id]}]:[]);
    this.session.qualified=this.session.members.length===players.length&&new Set(this.session.members.map(m=>m.account)).size===players.length;
  }
  private queueCompleted(){
    if(this.state.status!=='finished'||this.session.queued||!this.session.qualified||!this.session.startedAt)return;
    this.session.queued=true;
    const result:TowerResult={runId:this.session.runId,startedAt:this.session.startedAt,finishedAt:Date.now(),elapsedMs:Math.round(this.state.elapsed),members:this.session.members.map(({account,name})=>({account,name}))};
    this.ctx.storage.sql.exec('INSERT OR IGNORE INTO tower_result_outbox VALUES(?,?)',result.runId,JSON.stringify(result));
    this.ctx.waitUntil(this.flushResults());
  }
  private flushResults(){
    if(this.reporting)return this.reporting;
    this.reporting=(async()=>{for(const row of this.ctx.storage.sql.exec<{run_id:string;data:string}>('SELECT * FROM tower_result_outbox').toArray()){
      const result=await this.env.SURVIVAL_LEADERBOARD.getByName('tower-weekly-v1').record(JSON.parse(row.data));
      if(result.ok||result.error==='本周成绩已结算'||result.error==='成绩无效')this.ctx.storage.sql.exec('DELETE FROM tower_result_outbox WHERE run_id=?',row.run_id);
    }})().catch(error=>{console.error('Tower leaderboard report failed',String(error));this.ctx.waitUntil(this.ctx.storage.setAlarm(Date.now()+5000))}).finally(()=>{this.reporting=null});return this.reporting;
  }
  fetch(solo=false,account=''){this.session.solo=solo;this.save();const [client,server]=Object.values(new WebSocketPair());this.ctx.acceptWebSocket(server,account?['account:'+account]:[]);server.serializeAttachment({towerSurvival:true,id:'',joined:Date.now()});return new Response(null,{status:101,webSocket:client})}
  async message(socket:WebSocket,message:string|ArrayBuffer){
    if(typeof message!=='string'||message.length>12000)return;
    let data:Record<string,unknown>;try{data=JSON.parse(message);if(!data||typeof data!=='object')return}catch{return}
    const attachment=socket.deserializeAttachment() as Attachment|null;if(!attachment)return;
    if(data.type==='join'){
      if(typeof data.id!=='string'||!data.id||typeof data.name!=='string')return;
      const id=data.id.slice(0,48);let name=data.name.slice(0,14),account:TowerMember|undefined;
      if(typeof data.account==='string'&&/^[-_\p{L}\p{N}]{2,14}$/u.test(data.account)&&typeof data.token==='string'&&typeof data.device==='string'){
        const key=data.account.normalize('NFKC').toLowerCase(),profile=await this.env.PLAYER_ACCOUNTS.getByName('account:'+key).read(data.token,data.device);
        if(profile){name=profile.name;account={account:key,name}}
      }
      const issue=contentIssue(name,'name');
      if(issue){socket.send(JSON.stringify({type:'full',message:issue}));socket.close(1008,'Invalid name');return}
      if(this.session.solo&&!account){socket.send(JSON.stringify({type:'full',message:'请先登录账号'}));socket.close(1008,'Login required');return}
      let player=this.state.players.find(p=>p.id===id);
      const active=this.state.players.filter(p=>p.connected),capacity=this.session.solo?1:2;
      if(!player?.connected&&active.length>=capacity||!player&&this.state.status==='running'&&active.length){socket.send(JSON.stringify({type:'full',message:'高塔生存房已满'}));socket.close(1013,'Room full');return}
      const original=this.session.members.find(m=>m.id===id);
      if(original&&original.account!==account?.account){socket.send(JSON.stringify({type:'full',message:'请使用原账号返回对局'}));socket.close(1008,'Account changed');return}
      if(!player){
        if(!this.state.players.some(p=>p.connected)){this.state=newSurvivalState(this.state.round+1);this.session=newSession(this.session.solo)}
        this.state.players=this.state.players.filter(p=>p.connected);
        player=newSurvivalPlayer(id,name);this.state.players.push(player);
      }
      for(const peer of this.ctx.getWebSockets())if(peer!==socket&&(peer.deserializeAttachment() as Attachment|null)?.id===id){peer.serializeAttachment({towerSurvival:true,id:'',joined:0});try{peer.close(1000,'Reconnected')}catch{}}
      player.connected=true;player.name=name;
      if(account)this.session.accounts[id]=account;else delete this.session.accounts[id];
      if(this.session.solo)this.session.paused=false;
      if(this.session.solo&&this.state.status==='waiting'){player.ready=true;this.begin()}
      socket.serializeAttachment({towerSurvival:true,id,joined:attachment.joined});
      socket.send(JSON.stringify({type:'welcome',id,team:0,map:'survival'}));
      this.broadcast({type:'join',id,name,team:0},socket);
      for(const p of this.state.players)if(p.id!==id&&p.connected)socket.send(JSON.stringify({type:'join',id:p.id,name:p.name,team:0}));
      this.publish();this.lastTick=Date.now();if(this.state.status==='running')await this.ctx.storage.setAlarm(Date.now()+200);return;
    }
    if(!attachment.id)return;
    const player=this.state.players.find(p=>p.id===attachment.id&&p.connected);if(!player)return;
    if(data.type==='leave'){player.connected=false;player.ready=false;socket.serializeAttachment({towerSurvival:true,id:'',joined:0});this.broadcast({type:'leave',id:player.id},socket);this.publish();socket.close(1000,'Left match');return}
    if(data.type==='survivalReady'&&this.state.status==='waiting'){
      player.ready=data.ready===true;
      if(this.state.players.filter(p=>p.connected).length===2&&this.state.players.filter(p=>p.connected).every(p=>p.ready)){this.begin();await this.ctx.storage.setAlarm(Date.now()+200)}
      this.publish();return;
    }
    if(data.type==='survivalRestart'&&this.state.status==='finished'){
      const connected=this.state.players.filter(p=>p.connected),accounts=this.session.accounts;this.state=newSurvivalState(this.state.round+1);this.session=newSession(this.session.solo);this.session.accounts=accounts;this.state.players=connected.map(p=>newSurvivalPlayer(p.id,p.name));if(this.session.solo){this.begin();await this.ctx.storage.setAlarm(Date.now()+200)}this.publish();return;
    }
    if(data.type==='chat'){
      const result=roomChat(this.ctx,player.id,player.name,0,typeof data.text==='string'?data.text:'');if(result.error)socket.send(JSON.stringify({type:'chatError',message:result.error}));else this.broadcast(result.message);return;
    }
    if(data.type==='state'&&Array.isArray(data.position)&&data.position.length===3&&data.position.every(Number.isFinite)){
      const [x,y,z]=data.position;this.broadcast({...data,id:player.id,name:player.name,team:0,hp:100,position:[Math.max(-TOWER_LIMIT,Math.min(TOWER_LIMIT,x)),Math.max(TOWER_HEIGHT+.35,Math.min(TOWER_HEIGHT+12,y)),Math.max(-TOWER_LIMIT,Math.min(TOWER_LIMIT,z))]},socket);return;
    }
    if(data.type==='survivalPause'&&this.session.solo){this.session.paused=data.paused===true;this.lastTick=Date.now();this.publish();if(!this.session.paused&&this.state.status==='running')await this.ctx.storage.setAlarm(Date.now()+200);return}
    if(this.session.paused&&['survivalHit','survivalBuy','survivalSkill'].includes(String(data.type)))return;
    if(data.type==='survivalHit'){
      if(data.round!==this.state.round||typeof data.botId!=='string'||typeof data.damage!=='number')return;
      const result=hitSurvivalZombie(this.state,player.id,data.botId,data.damage);
      if(result?.killed){this.broadcast({type:'survivalKill',killerId:player.id,name:player.name,botId:data.botId,reward:result.reward,knife:data.weapon==='knife'});this.publish()}return;
    }
    if(data.type==='survivalBuy'||data.type==='survivalSkill'){
      if(data.round!==this.state.round)return;
      const result=data.type==='survivalBuy'?purchaseSurvival(this.state,player.id,String(data.item||'')):activateSurvivalSkill(this.state,player.id,String(data.slot||''));
      if(!result.ok)socket.send(JSON.stringify({type:'survivalError',message:result.error}));else this.publish();return;
    }
    if(['rocket','blast','muzzle'].includes(String(data.type))&&this.state.status==='running')this.broadcast({...data,id:player.id,team:0},socket);
  }
  close(socket:WebSocket){const a=socket.deserializeAttachment() as Attachment|null;if(!a?.id)return;const p=this.state.players.find(p=>p.id===a.id);if(p){p.connected=false;p.ready=false}socket.serializeAttachment({towerSurvival:true,id:'',joined:0});this.broadcast({type:'leave',id:a.id},socket);this.publish()}
  async alarm(){
    const now=Date.now(),delta=Math.max(0,Math.min(5000,now-this.lastTick));this.lastTick=now;
    for(let remaining=delta;remaining>0&&!this.session.paused&&this.state.status==='running';remaining-=200)tickSurvival(this.state,Math.min(200,remaining));
    this.publish();await this.flushResults();if(!this.session.paused&&this.state.status==='running'&&this.state.players.some(p=>p.connected))await this.ctx.storage.setAlarm(now+200);else if(this.ctx.storage.sql.exec('SELECT run_id FROM tower_result_outbox LIMIT 1').toArray().length)await this.ctx.storage.setAlarm(now+5000);
  }
}
