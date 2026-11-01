// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {initDamageReceipts,recordDamageReceipt,confirmDamageReceipt,sendDamageReceipt} from './damage-receipts';
type DuelMatch = { phase: string; round: number; bout: number; boutStartAt: number; endsAt: number; blue: number; red: number; purple: number; green: number; gunmasterWeapon:string; autoContinueAt: number };
type DuelPerson = { id: string; name: string; team: number; ready: number; connected: number; session: string; lastSeen: number; reconnectUntil: number; dead: number; diedAt: number; state: string; account_key:string };
type DuelAttachment = { duel: true; id: string; session: string };
import {initCoverState,resetCoverState,coverSnapshot,applyCoverDamage} from './cover-state';
import {initSupply,resetSupply,supplySnapshot,claimSupply} from './supply-state';
import {contentIssue,roomChat} from './content-safety';
const CHALLENGE_WEAPONS=['frost','redline','hammer','gale','meteor','shotgun','smg','revolver','lmg','autoShotgun'] as const;
const ROUND_MS = 10 * 60 * 1000;
const CONTINUE_MS = 5_000;
const RECONNECT_MS = 60_000;
const SILENCE_MS = 40_000;

// Isolated protocol and tables: ordinary rooms and offline AI never enter this engine.
export class DuelRoomEngine {
  private phaseFlashTimes=new Map<string,number>();
  private seats: number;
  private gunmaster: boolean;
  private challenge: boolean;
  private ranked:boolean;
  private tournament:boolean;
  private delivering=false;
  private tournamentTouch=0;
  constructor(private ctx: DurableObjectState,private env:Env, mode?: 'duel' | 'tri' | 'quad' | 'gunmaster' | 'challenge' | 'ranked' | 'tournament',roomCode='') {
    const sql=ctx.storage.sql;
    initDamageReceipts(ctx);
    sql.exec("CREATE TABLE IF NOT EXISTS duel_match(id INTEGER PRIMARY KEY,phase TEXT,round INTEGER,endsAt INTEGER,blue INTEGER,red INTEGER)");
    sql.exec("INSERT OR IGNORE INTO duel_match(id,phase,round,endsAt,blue,red) VALUES(1,'waiting',0,0,0,0)");
    for(const column of ['purple','green'])try{sql.exec(`ALTER TABLE duel_match ADD COLUMN ${column} INTEGER NOT NULL DEFAULT 0`);}catch{/* Existing room already has this score. */}
    try{sql.exec('ALTER TABLE duel_match ADD COLUMN bout INTEGER NOT NULL DEFAULT 0');}catch{}
    try{sql.exec('ALTER TABLE duel_match ADD COLUMN boutStartAt INTEGER NOT NULL DEFAULT 0');}catch{}
    try{sql.exec("ALTER TABLE duel_match ADD COLUMN challengeWeapon TEXT NOT NULL DEFAULT 'redline'");}catch{}
    try{sql.exec("ALTER TABLE duel_match ADD COLUMN gunmasterWeapon TEXT NOT NULL DEFAULT 'redline'");}catch{}
    sql.exec('CREATE TABLE IF NOT EXISTS duel_format(id INTEGER PRIMARY KEY,seats INTEGER NOT NULL)');
    sql.exec('INSERT OR IGNORE INTO duel_format(id,seats) VALUES(1,?)',mode==='tri'?3:mode==='quad'?4:2);
    try{sql.exec("ALTER TABLE duel_format ADD COLUMN mode TEXT NOT NULL DEFAULT 'duel'");}catch{}
    if(mode==='gunmaster')sql.exec("UPDATE duel_format SET mode='gunmaster' WHERE id=1");
    if(mode==='challenge')sql.exec("UPDATE duel_format SET mode='challenge' WHERE id=1");
    if(mode==='ranked')sql.exec("UPDATE duel_format SET mode='ranked' WHERE id=1");
    if(mode==='tournament')sql.exec("UPDATE duel_format SET mode='tournament' WHERE id=1");
    this.seats=sql.exec<{seats:number}>('SELECT seats FROM duel_format WHERE id=1').one().seats;
    this.gunmaster=sql.exec<{mode:string}>('SELECT mode FROM duel_format WHERE id=1').one().mode==='gunmaster';
    this.challenge=sql.exec<{mode:string}>('SELECT mode FROM duel_format WHERE id=1').one().mode==='challenge';
    this.ranked=sql.exec<{mode:string}>('SELECT mode FROM duel_format WHERE id=1').one().mode==='ranked';
    this.tournament=sql.exec<{mode:string}>('SELECT mode FROM duel_format WHERE id=1').one().mode==='tournament';
    sql.exec('CREATE TABLE IF NOT EXISTS duel_continue(id INTEGER PRIMARY KEY,deadline INTEGER NOT NULL DEFAULT 0)');
    sql.exec('INSERT OR IGNORE INTO duel_continue VALUES(1,0)');
    sql.exec("CREATE TABLE IF NOT EXISTS duel_people(id TEXT PRIMARY KEY,name TEXT,team INTEGER,ready INTEGER DEFAULT 0,connected INTEGER DEFAULT 1,session TEXT,lastSeen INTEGER,reconnectUntil INTEGER DEFAULT 0,dead INTEGER DEFAULT 0,diedAt INTEGER DEFAULT 0,state TEXT DEFAULT '')");
    try{sql.exec("ALTER TABLE duel_people ADD COLUMN account_key TEXT NOT NULL DEFAULT ''")}catch{}
    sql.exec("CREATE TABLE IF NOT EXISTS duel_rank_meta (id INTEGER PRIMARY KEY,room TEXT NOT NULL)");
    sql.exec("INSERT OR IGNORE INTO duel_rank_meta VALUES(1,'')");
    if((this.ranked||this.tournament)&&roomCode)sql.exec('UPDATE duel_rank_meta SET room=? WHERE id=1',roomCode.toLowerCase());
    sql.exec('CREATE TABLE IF NOT EXISTS duel_rank_results (account_key TEXT PRIMARY KEY,match_id TEXT NOT NULL,won INTEGER NOT NULL,deaths INTEGER NOT NULL)');
    sql.exec('CREATE TABLE IF NOT EXISTS duel_tournament_delivery(kind TEXT PRIMARY KEY,payload TEXT NOT NULL)');
    sql.exec("CREATE TABLE IF NOT EXISTS duel_hits(id TEXT PRIMARY KEY,attacker TEXT,victim TEXT,team INTEGER,name TEXT,round INTEGER,created INTEGER)");
    try{sql.exec('ALTER TABLE duel_hits ADD COLUMN knife INTEGER NOT NULL DEFAULT 0')}catch{}
    sql.exec("CREATE TABLE IF NOT EXISTS duel_map(id INTEGER PRIMARY KEY,map_id TEXT NOT NULL)");
    sql.exec("INSERT OR IGNORE INTO duel_map VALUES(1,'crossroads')");
    initCoverState(ctx);
    initSupply(ctx);
  }
  private mapId(){return this.ctx.storage.sql.exec<{map_id:string}>('SELECT map_id FROM duel_map WHERE id=1').one().map_id;}
  private match(){return this.ctx.storage.sql.exec<DuelMatch & {challengeWeapon:string}>('SELECT phase,round,bout,boutStartAt,endsAt,blue,red,purple,green,challengeWeapon,gunmasterWeapon,(SELECT deadline FROM duel_continue WHERE id=1) AS autoContinueAt FROM duel_match WHERE id=1').one();}
  private people(){return this.ctx.storage.sql.exec<DuelPerson>('SELECT * FROM duel_people ORDER BY rowid').toArray();}
  private person(id:string){return this.ctx.storage.sql.exec<DuelPerson>('SELECT * FROM duel_people WHERE id=?',id).toArray()[0];}
  private attachment(socket:WebSocket){return socket.deserializeAttachment() as DuelAttachment | null;}
  private broadcast(data:unknown,except?:WebSocket){
    const text=JSON.stringify(data);
    for(const socket of this.ctx.getWebSockets())if(socket!==except&&this.attachment(socket)?.id){try{socket.send(text);}catch{/* close handler reconciles membership */}}
  }
  private snapshot(){
    const match=this.match();
    const scores=[match.blue,match.red,match.purple,match.green].slice(0,this.seats),best=Math.max(...scores),leaders=scores.flatMap((value,index)=>value===best?[index]:[]);
    return {type:'duel',...match,map:this.mapId(),mode:this.tournament?'tournament':this.ranked?'ranked':this.gunmaster?'gunmaster':this.challenge?'challenge':'arena',seats:this.seats,scores,serverNow:Date.now(),winner:match.phase!=='finished'?null:leaders.length===1?leaders[0]:-1,
      players:this.people().map(p=>({id:p.id,name:p.name,team:p.team,ready:!!p.ready,connected:!!p.connected,reconnectUntil:p.reconnectUntil,state:p.state?JSON.parse(p.state):null}))};
  }
  private publish(){this.broadcast(this.snapshot());}
  private arm(){
    const match=this.match(),people=this.people();
    const deadlines=people.map(p=>p.connected?p.lastSeen+SILENCE_MS:p.reconnectUntil);
    if(this.ctx.storage.sql.exec('SELECT kind FROM duel_tournament_delivery LIMIT 1').toArray().length)deadlines.push(Date.now()+5000);
    if(match.phase==='running'&&!this.ranked&&!this.tournament)deadlines.push(match.endsAt);
    if(match.phase==='finished'&&match.autoContinueAt>0)deadlines.push(match.autoContinueAt);
    this.ctx.waitUntil(deadlines.length?this.ctx.storage.setAlarm(Math.max(Date.now()+1,Math.min(...deadlines))):this.ctx.storage.deleteAlarm());
  }
  private invalidate(id:string){
    for(const socket of this.ctx.getWebSockets())if(this.attachment(socket)?.id===id){socket.serializeAttachment({duel:true,id:'',session:''});try{socket.close(1000,'Seat released');}catch{}}
  }
  private tournamentDelivery(kind:string,payload:Record<string,string>){this.ctx.storage.sql.exec('INSERT OR REPLACE INTO duel_tournament_delivery VALUES(?,?)',kind,JSON.stringify(payload));this.ctx.waitUntil(this.flushTournament());this.arm()}
  private async flushTournament(){
    if(this.delivering)return;this.delivering=true;
    try{for(const job of this.ctx.storage.sql.exec<{kind:string;payload:string}>("SELECT * FROM duel_tournament_delivery ORDER BY CASE WHEN kind='start' THEN 0 ELSE 1 END").toArray()){
      const p=JSON.parse(job.payload),hub=this.env.TOURNAMENTS.getByName('events-v1');
      const result=job.kind==='start'?await hub.markStarted(p.room):job.kind==='finish'?await hub.recordOutcome(p.room,p.winner,p.loser):await hub.abandon(p.room);
      if(result.ok)this.ctx.storage.sql.exec('DELETE FROM duel_tournament_delivery WHERE kind=? AND payload=?',job.kind,job.payload);
    }}catch{ /* Persistent outbox retries on the next alarm. */ }finally{this.delivering=false;this.arm()}
  }
  private remove(id:string){
    this.ctx.storage.sql.exec('DELETE FROM duel_people WHERE id=?',id);
    this.ctx.storage.sql.exec('DELETE FROM duel_hits WHERE victim=? OR attacker=?',id,id);
    this.invalidate(id);this.broadcast({type:'leave',id});
  }
  private fillSeats(){
    const match=this.match();
    for(let team=0;team<this.seats;team++){
      const people=this.people();
      if(people.some(p=>p.team===team))continue; // Includes a reconnect-reserved seat.
      const candidates=people.filter(p=>p.team===-1&&p.connected&&(match.phase!=='finished'||p.ready));
      if(!candidates.length)continue;
      const bytes=crypto.getRandomValues(new Uint32Array(1));
      const selected=candidates[bytes[0]%candidates.length];
      this.ctx.storage.sql.exec("UPDATE duel_people SET team=?,dead=0,diedAt=0,state='' WHERE id=?",team,selected.id);
    }
  }
  private maybeStart(){
    if(this.match().phase==='running'||(this.ranked||this.tournament)&&this.match().phase==='finished')return;
    const fighters=this.people().filter(p=>p.team!==-1);
    if(fighters.length!==this.seats||fighters.some(p=>!p.connected||!p.ready))return;
    const previous=this.match().challengeWeapon,choices=CHALLENGE_WEAPONS.filter(weapon=>weapon!==previous);
    const challengeWeapon=choices[crypto.getRandomValues(new Uint32Array(1))[0]%choices.length];
    this.ctx.storage.sql.exec("UPDATE duel_match SET phase='running',round=round+1,bout=0,boutStartAt=0,endsAt=?,blue=0,red=0,purple=0,green=0,challengeWeapon=? WHERE id=1",this.ranked||this.tournament?0:Date.now()+ROUND_MS,challengeWeapon);
    this.ctx.storage.sql.exec('UPDATE duel_continue SET deadline=0 WHERE id=1');
    this.ctx.storage.sql.exec("UPDATE duel_people SET ready=0,dead=0,diedAt=0,state=''");
    this.ctx.storage.sql.exec('DELETE FROM duel_hits');
    resetCoverState(this.ctx);
    resetSupply(this.ctx);
    this.broadcast(supplySnapshot(this.ctx));
    if(this.tournament){const room=this.ctx.storage.sql.exec<{room:string}>('SELECT room FROM duel_rank_meta WHERE id=1').one().room;this.tournamentDelivery('start',{room})}
  }
  private pauseIfUnderfilled(){
    if(this.match().phase!=='running'||this.people().filter(p=>p.team!==-1).length>=this.seats)return;
    this.ctx.storage.sql.exec("UPDATE duel_match SET phase='waiting',endsAt=0,boutStartAt=0 WHERE id=1");
    this.ctx.storage.sql.exec("UPDATE duel_people SET ready=0,dead=0,diedAt=0,state=''");
    this.ctx.storage.sql.exec('DELETE FROM duel_hits');
  }
  rankedResultFor(accountKey:string){
    if(!this.ranked)return null;
    const row=this.ctx.storage.sql.exec<{match_id:string;won:number;deaths:number}>('SELECT match_id,won,deaths FROM duel_rank_results WHERE account_key=?',accountKey).toArray()[0];
    return row?{matchId:row.match_id,won:!!row.won,deaths:row.deaths}:null;
  }
  private finishRanked(winner:number){
    if(!(this.ranked||this.tournament)||this.match().phase!=='running')return;
    const match=this.match(),scores=[match.blue,match.red],room=this.ctx.storage.sql.exec<{room:string}>('SELECT room FROM duel_rank_meta WHERE id=1').one().room;
    if(!room)return;
    this.ctx.storage.sql.exec("UPDATE duel_match SET phase='finished' WHERE id=1");
    this.ctx.storage.sql.exec('UPDATE duel_continue SET deadline=0 WHERE id=1');
    this.ctx.storage.sql.exec('DELETE FROM duel_hits');
    for(const person of this.people().filter(p=>p.team>=0&&p.account_key)){
      const won=person.team===winner,deaths=Math.max(0,Math.min(10,scores[1-person.team]||0));
      this.ctx.storage.sql.exec('INSERT OR IGNORE INTO duel_rank_results VALUES(?,?,?,?)',person.account_key,`${this.tournament?'tournament':'ranked'}:${room}`,won?1:0,deaths);
      if(this.ranked)this.ctx.waitUntil(this.env.PLAYER_ACCOUNTS.getByName('account:'+person.account_key).recordResult(`ranked:${room}`,won,deaths).catch(error=>console.error(JSON.stringify({message:'rank result failed',error:String(error)}))));
    }
    if(this.tournament){
      const people=this.people().filter(p=>p.team>=0&&p.account_key),winnerAccount=people.find(p=>p.team===winner)?.account_key,loserAccount=people.find(p=>p.team!==winner)?.account_key;
      if(winnerAccount&&loserAccount)this.tournamentDelivery('finish',{room,winner:winnerAccount,loser:loserAccount});
    }
  }
  private tick(){
    let changed=false;const now=Date.now(),match=this.match();
    if(match.phase==='running'&&!this.ranked&&!this.tournament&&now>=match.endsAt){
      this.ctx.storage.sql.exec("UPDATE duel_match SET phase='finished' WHERE id=1");
      this.ctx.storage.sql.exec('UPDATE duel_continue SET deadline=? WHERE id=1',now+CONTINUE_MS);
      this.ctx.storage.sql.exec('UPDATE duel_people SET ready=0');
      this.ctx.storage.sql.exec('DELETE FROM duel_hits');changed=true;
    }
    if(match.phase==='finished'&&match.autoContinueAt>0&&now>=match.autoContinueAt){
      // No selection means continue, never surrender a fighter's seat to a spectator.
      this.ctx.storage.sql.exec('UPDATE duel_people SET ready=1');
      this.ctx.storage.sql.exec('UPDATE duel_continue SET deadline=0 WHERE id=1');
      changed=true;
    }
    for(const p of this.people())if((!p.connected&&now>=p.reconnectUntil)||(p.connected&&now-p.lastSeen>=SILENCE_MS)){
      if((this.ranked||this.tournament)&&this.match().phase==='running'){
        const opponent=this.people().find(other=>other.team>=0&&other.team!==p.team&&other.connected&&now-other.lastSeen<SILENCE_MS);
        if(opponent)this.finishRanked(opponent.team);else if(this.tournament){const room=this.ctx.storage.sql.exec<{room:string}>('SELECT room FROM duel_rank_meta WHERE id=1').one().room;this.tournamentDelivery('abandon',{room});this.ctx.storage.sql.exec("UPDATE duel_match SET phase='finished' WHERE id=1")}
      }
      this.remove(p.id);changed=true;
    }
    if(changed){
      this.fillSeats();
      // Do not leave a running duel with only one active fighter after the reconnect window expires.
      this.pauseIfUnderfilled();
      this.maybeStart();this.publish();
    }
    return changed;
  }
  async alarm(){this.tick();await this.flushTournament();this.arm();}
  async fetch(account=''):Promise<Response>{
    const [client,server]=Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server,account?['account:'+account]:[]);server.serializeAttachment({duel:true,id:'',session:''});
    return new Response(null,{status:101,webSocket:client});
  }
  async message(socket:WebSocket,message:string|ArrayBuffer){
    if(typeof message!=='string'||message.length>2048)return;
    let data:Record<string,unknown>;
    try{const parsed:unknown=JSON.parse(message);if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return;data=parsed as Record<string,unknown>;}catch{return;}
    const changed=this.tick();if(changed)this.arm();
    if(data.type==='join'){
      if(this.attachment(socket)?.id||typeof data.id!=='string'||typeof data.name!=='string')return;
      const id=data.id.slice(0,48);let name=data.name.slice(0,14),accountKey='';if(!id||!name)return;
      if(this.ranked||this.tournament){
        accountKey=typeof data.account==='string'?data.account.trim().normalize('NFKC').toLowerCase():'';
        const token=typeof data.token==='string'?data.token:'';
        if(!accountKey||!/^[-_\p{L}\p{N}]{2,14}$/u.test(accountKey)){socket.send(JSON.stringify({type:'full',message:'请先登录账号'}));socket.close(1008,'Account required');return}
        const profile=await this.env.PLAYER_ACCOUNTS.getByName('account:'+accountKey).read(token,typeof data.device==='string'?data.device:'');
        if(!profile){socket.send(JSON.stringify({type:'full',message:'登录已失效，请重新登录'}));socket.close(1008,'Account required');return}
        const room=this.ctx.storage.sql.exec<{room:string}>('SELECT room FROM duel_rank_meta WHERE id=1').one().room;
        const permitted=room&&(this.tournament?await this.env.TOURNAMENTS.getByName('events-v1').isParticipant(room,accountKey):await this.env.DUEL_MATCHMAKER.getByName('ranked-s1').isRankedParticipant(room,accountKey));
        if(!permitted){socket.send(JSON.stringify({type:'full',message:'不在本局匹配名单'}));socket.close(1008,'Not matched');return}
        name=profile.name;
      }
      const nameIssue=contentIssue(name,'name');if(nameIssue){socket.send(JSON.stringify({type:'full',message:nameIssue}));socket.close(1008,'Invalid name');return}
      const existing=this.person(id),people=this.people();
      if((this.ranked||this.tournament)&&people.some(p=>p.account_key===accountKey&&p.id!==id)){socket.send(JSON.stringify({type:'full',message:'该账号已在本局中'}));socket.close(1008,'Already joined');return}
      if((this.ranked||this.tournament)&&!existing&&people.length>=2){socket.send(JSON.stringify({type:'full',message:'本局已满'}));socket.close(1013,'Room full');return}
      if(this.gunmaster&&!people.length&&data.creator===true){const requested=typeof data.gunmasterWeapon==='string'&&CHALLENGE_WEAPONS.includes(data.gunmasterWeapon as typeof CHALLENGE_WEAPONS[number])?data.gunmasterWeapon:'redline';this.ctx.storage.sql.exec('UPDATE duel_match SET gunmasterWeapon=? WHERE id=1',requested)}
      if(!existing&&people.length>=64){socket.send(JSON.stringify({type:'full',message:'观战席已满，请稍后再试'}));socket.close(1013,'Room full');return;}
      if(!people.length){this.ctx.storage.sql.exec("UPDATE duel_match SET phase='waiting',endsAt=0,blue=0,red=0,purple=0,green=0 WHERE id=1");this.ctx.storage.sql.exec('UPDATE duel_continue SET deadline=0 WHERE id=1');this.ctx.storage.sql.exec('DELETE FROM duel_hits');if(data.reconnect!==true)this.ctx.storage.sql.exec('UPDATE duel_map SET map_id=? WHERE id=1',typeof data.map==='string'&&['crossroads','depot','arcade'].includes(data.map)?data.map:'crossroads');}
      const session=crypto.randomUUID();
      // Remove only the old socket identity, retaining its reserved role and match state.
      for(const peer of this.ctx.getWebSockets())if(peer!==socket&&this.attachment(peer)?.id===id){peer.serializeAttachment({duel:true,id:'',session:''});try{peer.close(1000,'Connection replaced');}catch{}}
      const team=existing?.team??Array.from({length:this.seats},(_,index)=>index).find(index=>!people.some(p=>p.team===index))??-1;
      this.ctx.storage.sql.exec("INSERT INTO duel_people(id,name,team,session,lastSeen,ready,account_key) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,session=excluded.session,connected=1,lastSeen=excluded.lastSeen,reconnectUntil=0,account_key=excluded.account_key",id,name,team,session,Date.now(),this.ranked||this.tournament?1:0,accountKey);
      socket.serializeAttachment({duel:true,id,session});
      socket.send(JSON.stringify({type:'duelWelcome',id,team,map:this.mapId()}));
      socket.send(JSON.stringify({type:'coverSnapshot',covers:coverSnapshot(this.ctx)}));
      socket.send(JSON.stringify(supplySnapshot(this.ctx)));
      this.maybeStart();this.publish();this.arm();return;
    }
    const attachment=this.attachment(socket);if(!attachment?.id)return;
    const person=this.person(attachment.id);if(!person||person.session!==attachment.session||!person.connected)return;
    if(data.type==='damageAck'){const receipt=confirmDamageReceipt(this.ctx,person.id,data);sendDamageReceipt(this.ctx,receipt);return;}
    if(this.tournament&&Date.now()-this.tournamentTouch>15000){this.tournamentTouch=Date.now();const room=this.ctx.storage.sql.exec<{room:string}>('SELECT room FROM duel_rank_meta WHERE id=1').one().room;this.ctx.waitUntil(this.env.TOURNAMENTS.getByName('events-v1').touchMatch(room).catch(()=>{}))}
    if(data.type==='chat'){
      const result=roomChat(this.ctx,person.id,person.name,person.team,data.text);
      if(result.error)socket.send(JSON.stringify({type:'chatError',message:result.error}));else this.broadcast(result.message);
      return;
    }
    if(Date.now()-person.lastSeen>=3000)this.ctx.storage.sql.exec('UPDATE duel_people SET lastSeen=? WHERE id=?',Date.now(),person.id);
    if(data.type==='leave'){if((this.ranked||this.tournament)&&this.match().phase==='running'){const opponent=this.people().find(other=>other.team>=0&&other.team!==person.team&&other.connected);if(opponent)this.finishRanked(opponent.team)}this.remove(person.id);this.fillSeats();this.pauseIfUnderfilled();this.maybeStart();this.publish();this.arm();return;}
    if(data.type==='ping'){socket.send(JSON.stringify(this.snapshot()));return;}
    const match=this.match();
    if(data.round!==match.round)return; // Old shots, deaths and ready clicks cannot cross rounds.
    if(this.gunmaster&&['state','shot','death','rocket','blast','throwable','throwableBurst','muzzle'].includes(String(data.type))&&data.bout!==match.bout)return;
    if(data.type==='ready'){
      if(this.ranked||this.tournament)return;
      if(match.phase==='running')return;
      this.ctx.storage.sql.exec('UPDATE duel_people SET ready=1 WHERE id=?',person.id);
      this.fillSeats();this.maybeStart();this.publish();this.arm();return;
    }
    if(person.team===-1)return; // Spectators cannot send bodies, shots, rockets or deaths.
    if(data.type==='supplyClaim'){
      if(match.phase!=='running'||person.dead)return;
      let state:{position?:number[];hp?:number}={};try{state=JSON.parse(person.state||'{}')}catch{}
      const pos=state.position,claim=Array.isArray(pos)&&pos.length===3?claimSupply(this.ctx,pos as [number,number,number],data.effect,Number(state.hp)||100):null;
      if(claim)this.broadcast({...claim,claimedBy:person.id,round:match.round});else socket.send(JSON.stringify(supplySnapshot(this.ctx)));
      return;
    }
    if(data.type==='coverHit'){
      if(match.phase!=='running'||person.dead)return;
      const state=applyCoverDamage(this.ctx,this.mapId(),data.coverId,data.damage);
      if(state)this.broadcast({...state,round:match.round});
      return;
    }
    if(data.type==='muzzle'){
      this.broadcast({type:'muzzle',id:person.id,team:person.team,hidden:Boolean(data.hidden),round:match.round,bout:match.bout},socket);return;
    }
    if(data.type==='phaseFlash'){
      if(match.phase!=='running'||person.dead||!Array.isArray(data.origin)||data.origin.length!==3||!data.origin.every(Number.isFinite)||!Number.isFinite(data.yaw))return;
      const now=Date.now();if(now-(this.phaseFlashTimes.get(person.id)||0)<20000)return;
      this.phaseFlashTimes.set(person.id,now);
      this.broadcast({type:'phaseFlash',id:person.id,team:person.team,round:match.round,bout:match.bout,origin:data.origin.map((v:number)=>Math.max(-300,Math.min(300,v))),yaw:data.yaw},socket);return;
    }
    if(data.type==='state'){
      if(!Array.isArray(data.position)||data.position.length!==3||!data.position.every(v=>typeof v==='number'&&Number.isFinite(v)))return;
      const claimedHp=Math.max(0,Math.min(100,Number(data.hp)||0));
      if(!this.gunmaster&&person.dead&&claimedHp>0&&Date.now()-person.diedAt>=2500)this.ctx.storage.sql.exec('UPDATE duel_people SET dead=0 WHERE id=?',person.id);
      const weapon=typeof data.weapon==='string'&&['frost','redline','hammer','gale','meteor','shotgun','smg','revolver','lmg','autoShotgun','knife'].includes(data.weapon)?data.weapon:'redline';
      const state={type:'state',id:person.id,name:person.name,team:person.team,round:match.round,bout:match.bout,position:data.position.map(v=>Math.max(-300,Math.min(300,v))),rotation:Number.isFinite(data.rotation)?Number(data.rotation):0,pitch:Number.isFinite(data.pitch)?Math.max(-1.35,Math.min(1.35,Number(data.pitch))):0,prone:!!data.prone,slide:!!data.slide&&!data.prone,skin:typeof data.skin==='string'&&/^[a-z]{1,16}$/.test(data.skin)?data.skin:'',knifeSkin:typeof data.knifeSkin==='string'&&/^[a-z]{1,20}$/.test(data.knifeSkin)?data.knifeSkin:'',hp:person.dead&&Date.now()-person.diedAt<2500?0:claimedHp,weapon:this.challenge?match.challengeWeapon:weapon,ammo:Math.max(0,Math.min(100,Number(data.ammo)||0)),mag:Math.max(1,Math.min(100,Number(data.mag)||1)),armor:typeof data.armor==='string'?data.armor.slice(0,24):'',helmet:typeof data.helmet==='string'?data.helmet.slice(0,24):'',skill:Math.max(0,Math.min(100,Number(data.skill)||0)),equipment:typeof data.equipment==='string'?data.equipment.slice(0,32):'',tacticalReady:Math.max(0,Math.min(120,Number(data.tacticalReady)||0)),energy:Math.max(0,Math.min(100,Number(data.energy)||0))};
      this.ctx.storage.sql.exec('UPDATE duel_people SET state=? WHERE id=?',JSON.stringify(state),person.id);
      this.broadcast(state,socket);return;
    }
    if(match.phase!=='running')return;
    if(data.type==='death'){
      if(person.dead||typeof data.shotId!=='string')return;
      const hit=this.ctx.storage.sql.exec<{id:string;attacker:string;team:number;name:string;knife:number}>('SELECT id,attacker,team,name,knife FROM duel_hits WHERE id=? AND victim=? AND round=? AND created>?',data.shotId,person.id,match.round,Date.now()-15000).toArray()[0];
      if(!hit)return;
      this.ctx.storage.sql.exec('DELETE FROM duel_hits WHERE victim=?',person.id);
      this.ctx.storage.sql.exec('UPDATE duel_people SET dead=1,diedAt=? WHERE id=?',Date.now(),person.id);
      const scoreColumn=['blue','red','purple','green'][hit.team];
      if(!scoreColumn||hit.team>=this.seats)return;
      this.ctx.storage.sql.exec(`UPDATE duel_match SET ${scoreColumn}=${scoreColumn}+1 WHERE id=1`);
      if((this.ranked||this.tournament)&&this.match()[scoreColumn as 'blue'|'red']>=10)this.finishRanked(hit.team);
      if(this.gunmaster){
        this.ctx.storage.sql.exec('UPDATE duel_match SET bout=bout+1,boutStartAt=? WHERE id=1',Date.now()+5000);
        this.ctx.storage.sql.exec("UPDATE duel_people SET dead=0,diedAt=0,state='' WHERE team>=0");
        this.ctx.storage.sql.exec('DELETE FROM duel_hits');
      }
      this.broadcast({...this.snapshot(),kill:{id:hit.id,killer:hit.name,killerId:hit.attacker,victim:person.name,victimId:person.id,knife:!!hit.knife}});return;
    }
    if(person.dead)return;
    if(this.gunmaster&&Date.now()<match.boutStartAt&&data.type==='shot')return;
    if(this.challenge&&['shot','rocket'].includes(String(data.type))&&data.weapon!==match.challengeWeapon)return;
    if(data.type==='shot'){
      const target=typeof data.target==='string'?this.person(data.target):undefined;
      if(!target||!target.connected||target.team===-1||target.team===person.team||target.dead)return;
      const shotId=crypto.randomUUID(),damage=Math.max(0,Math.min(200,Number(data.damage)||0));if(!damage)return;
      this.ctx.storage.sql.exec('DELETE FROM duel_hits WHERE created<?',Date.now()-15000);
      this.ctx.storage.sql.exec('INSERT INTO duel_hits(id,attacker,victim,team,name,round,created,knife) VALUES(?,?,?,?,?,?,?,?)',shotId,person.id,target.id,person.team,person.name,match.round,Date.now(),data.weapon==='knife'&&data.zone!=='explosion'?1:0);
      const zone=['head','body','abdomen','arm','leg','explosion'].includes(String(data.zone))?String(data.zone):'body';
      recordDamageReceipt(this.ctx,shotId,person.id,target.id,damage,{...data,zone});
      this.broadcast({type:'shot',id:person.id,team:person.team,target:target.id,damage,zone,shotId,round:match.round,bout:match.bout},socket);return;
    }
    if(data.type==='rocket'){
      if(!Array.isArray(data.origin)||!Array.isArray(data.direction)||data.origin.length!==3||data.direction.length!==3)return;
      if(![...data.origin,...data.direction].every(v=>typeof v==='number'&&Number.isFinite(v)))return;
      this.broadcast({type:'rocket',id:person.id,team:person.team,round:match.round,bout:match.bout,rocketId:typeof data.rocketId==='string'&&/^[a-f0-9-]{36}$/.test(data.rocketId)?data.rocketId:undefined,origin:data.origin.map(v=>Math.max(-300,Math.min(300,v))),direction:data.direction.map(v=>Math.max(-1,Math.min(1,v))),speed:Math.max(10,Math.min(100,Number(data.speed)||34)),drop:Math.max(0,Math.min(10,Number(data.drop)||0)),life:Math.max(.2,Math.min(6,Number(data.life)||3))},socket);return;
    }
    if(data.type==='blast'){
      if(typeof data.rocketId!=='string'||!/^[a-f0-9-]{36}$/.test(data.rocketId)||!Array.isArray(data.position)||data.position.length!==3||!data.position.every(v=>typeof v==='number'&&Number.isFinite(v)))return;
      this.broadcast({type:'blast',id:person.id,team:person.team,round:match.round,bout:match.bout,rocketId:data.rocketId,position:data.position.map(v=>Math.max(-300,Math.min(300,v))),radius:Math.max(2,Math.min(15,Number(data.radius)||7)),incendiary:!!data.incendiary,smoke:!!data.smoke,cluster:!!data.cluster},socket);return;
    }
    if(data.type==='throwable'||data.type==='throwableBurst'){
      if(typeof data.throwId!=='string'||!/^[a-f0-9-]{36}$/.test(data.throwId)||!['smoke','grenade'].includes(String(data.kind)))return;
      const point=data.type==='throwable'?data.origin:data.position;
      if(!Array.isArray(point)||point.length!==3||!point.every(v=>typeof v==='number'&&Number.isFinite(v)))return;
      if(data.type==='throwable'){
        if(!Array.isArray(data.velocity)||data.velocity.length!==3||!data.velocity.every(v=>typeof v==='number'&&Number.isFinite(v)))return;
        this.broadcast({type:'throwable',id:person.id,team:person.team,round:match.round,bout:match.bout,throwId:data.throwId,kind:data.kind,origin:point.map(v=>Math.max(-300,Math.min(300,v))),velocity:data.velocity.map(v=>Math.max(-30,Math.min(30,v))),fuseMs:data.kind==='grenade'&&typeof data.fuseMs==='number'&&Number.isFinite(data.fuseMs)?Math.max(0,Math.min(4000,data.fuseMs)):4000},socket);
      }else this.broadcast({type:'throwableBurst',id:person.id,team:person.team,round:match.round,bout:match.bout,throwId:data.throwId,kind:data.kind,position:point.map(v=>Math.max(-300,Math.min(300,v)))},socket);
      return;
    }
  }
  close(socket:WebSocket){
    const a=this.attachment(socket),p=a?.id?this.person(a.id):undefined;
    if(!p||p.session!==a?.session)return;
    socket.serializeAttachment({duel:true,id:'',session:''});
    if(p.team===-1)this.remove(p.id);
    else this.ctx.storage.sql.exec('UPDATE duel_people SET connected=0,reconnectUntil=? WHERE id=?',Date.now()+RECONNECT_MS,p.id);
    this.publish();this.arm();
  }
}
