// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {DurableObject} from 'cloudflare:workers';
import {rankDelta,seasonLevel,seasonStepCost} from './ranked-rules';
import {contentIssue} from './content-safety';
import {TOWER_KING_SKIN,TOWER_WEEK_MS,towerWeekStart} from './survival-ranking-rules';

const KEYS=new Set([
  'astrift.extraction.v1',
  'astrift.callsign','astrift.weaponBuilds.v1','astrift.weaponSlots.v1','astrift.sidearm.v1',
  'astrift.equipment.v1','astrift.skins.v1','astrift.knifeSkins.v1','astrift.keybinds.v1',
  'astrift.quality.v1','astrift.map.v1','astrift.gunmasterWeapon','astrift.weapon'
]);
type AccountRow={name:string;salt:string;password_hash:string;snapshot:string;rank_points:number;season_earned:number;season_bonus:number};
const SEASON_REWARD_LEVELS:Record<string,number>={
  'season-s1-bronze':1,'season-s1-silver':11,'season-s1-gold':21,'season-s1-diamond':31,
  'season-s1-legend':41,'season-s1-myth':51,'season-s1-transcend':61,'season-s1-war':71,'season-s1-peak':81
};
const KNIFE_DRAW_IDS=['knife-draw-comet','knife-draw-tide','knife-draw-ember','knife-draw-ghost','knife-draw-thunder','knife-draw-verdant','knife-draw-eclipse','knife-draw-crown'];
const KNIFE_SHARD_COST=6;
function legacySeasonBonus(earned:number){
  let level=1,spent=0;
  const oldCost=(nextLevel:number)=>{const step=Math.max(1,nextLevel-1);return Math.round(300+80*Math.sqrt(step)+10*step)};
  while(level<10000&&spent+oldCost(level+1)<=earned){level++;spent+=oldCost(level)}
  let newSpent=0;for(let next=2;next<=level;next++)newSpent+=seasonStepCost(next);
  const carried=Math.floor((earned-spent)/oldCost(level+1)*seasonStepCost(level+1));
  return Math.max(0,newSpent+carried-earned);
}
const hex=(bytes:Uint8Array)=>Array.from(bytes,byte=>byte.toString(16).padStart(2,'0')).join('');
const unhex=(value:string)=>Uint8Array.from(value.match(/.{2}/g)?.map(part=>parseInt(part,16))||[]);
async function digest(value:string){return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))))}
async function passwordHash(password:string,salt:string){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  return hex(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:unhex(salt),iterations:100000,hash:'SHA-256'},key,256)));
}
function equalHex(a:string,b:string){const x=unhex(a),y=unhex(b);let different=x.length^y.length;for(let i=0;i<Math.max(x.length,y.length);i++)different|=(x[i]||0)^(y[i]||0);return different===0}
function cleanSnapshot(raw:unknown,name:string){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
  const data:Record<string,string>={};let size=0;
  for(const [key,value] of Object.entries(raw)){
    if(!KEYS.has(key)||typeof value!=='string'||value.length>(key==='astrift.extraction.v1'?256000:32000))continue;
    size+=key.length+value.length;if(size>320000)return null;data[key]=value;
  }
  data['astrift.callsign']=name;
  return data;
}

export class PlayerAccount extends DurableObject<Env>{
  private registry(){return this.env.ACCOUNT_SESSIONS.getByName('global-v1')}
  constructor(ctx:DurableObjectState,env:Env){
    super(ctx,env);
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS account (id INTEGER PRIMARY KEY,name TEXT NOT NULL,salt TEXT NOT NULL,password_hash TEXT NOT NULL,snapshot TEXT NOT NULL,rank_points INTEGER NOT NULL DEFAULT 0,season_earned INTEGER NOT NULL DEFAULT 0,season_bonus INTEGER NOT NULL DEFAULT 0)');
    let addedBonus=false;
    try{ctx.storage.sql.exec('ALTER TABLE account ADD COLUMN season_bonus INTEGER NOT NULL DEFAULT 0');addedBonus=true}catch(error){if(!String(error).includes('duplicate column name'))throw error}
    if(addedBonus){const previous=ctx.storage.sql.exec<{season_earned:number}>('SELECT season_earned FROM account WHERE id=1').toArray()[0];if(previous)ctx.storage.sql.exec('UPDATE account SET season_bonus=? WHERE id=1',legacySeasonBonus(previous.season_earned))}
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY,expires INTEGER NOT NULL)');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS rank_results (match_id TEXT PRIMARY KEY,delta INTEGER NOT NULL,won INTEGER NOT NULL,created INTEGER NOT NULL)');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS season_rewards (skin_id TEXT PRIMARY KEY,claimed_at INTEGER NOT NULL)');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS knife_draw_state (id INTEGER PRIMARY KEY CHECK(id=1),used INTEGER NOT NULL DEFAULT 0,shards INTEGER NOT NULL DEFAULT 0)');
    ctx.storage.sql.exec('INSERT OR IGNORE INTO knife_draw_state(id,used,shards) VALUES(1,0,0)');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS knife_draw_owned (skin_id TEXT PRIMARY KEY,obtained_at INTEGER NOT NULL)');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS event_rewards (event_id TEXT NOT NULL,skin_id TEXT NOT NULL,claimed_at INTEGER NOT NULL,PRIMARY KEY(event_id,skin_id))');
    if(!ctx.storage.sql.exec<{name:string}>('PRAGMA table_info(event_rewards)').toArray().some(c=>c.name==='expires'))ctx.storage.sql.exec('ALTER TABLE event_rewards ADD COLUMN expires INTEGER NOT NULL DEFAULT 0');
    ctx.storage.sql.exec("UPDATE event_rewards SET expires=claimed_at+604800000 WHERE event_id LIKE '00000000-0000-4000-8000-%' AND expires=0");
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS timed_skin_rewards(skin_id TEXT PRIMARY KEY,week INTEGER NOT NULL,expires INTEGER NOT NULL)');
  }
  private row(){return this.ctx.storage.sql.exec<AccountRow>('SELECT name,salt,password_hash,snapshot,rank_points,season_earned,season_bonus FROM account WHERE id=1').toArray()[0]}
  exists(){return Boolean(this.row())}
  private profile(row:AccountRow){
    const snapshot=JSON.parse(row.snapshot) as Record<string,string>,level=seasonLevel(row.season_earned+row.season_bonus);
    // Keep a season skin equipped before the claim flow was introduced.
    try{const active=JSON.parse(snapshot['astrift.skins.v1']||'null')?.active;if(typeof active==='string'&&SEASON_REWARD_LEVELS[active]<=level.level)this.ctx.storage.sql.exec('INSERT OR IGNORE INTO season_rewards VALUES(?,?)',active,Date.now())}catch{}
    const seasonClaims=this.ctx.storage.sql.exec<{skin_id:string}>('SELECT skin_id FROM season_rewards ORDER BY claimed_at').toArray().map(row=>row.skin_id);
    const knifeDraw=this.ctx.storage.sql.exec<{used:number;shards:number}>('SELECT used,shards FROM knife_draw_state WHERE id=1').one();
    const knifeOwned=this.ctx.storage.sql.exec<{skin_id:string}>('SELECT skin_id FROM knife_draw_owned ORDER BY obtained_at').toArray().map(item=>item.skin_id);
    const eventRewards=this.ctx.storage.sql.exec<{skin_id:string}>('SELECT DISTINCT skin_id FROM event_rewards WHERE expires=0 OR expires>?',Date.now()).toArray().map(item=>item.skin_id);
    const permanentEventRewards=this.ctx.storage.sql.exec<{skin_id:string}>('SELECT DISTINCT skin_id FROM event_rewards WHERE expires=0').toArray().map(item=>item.skin_id);
    const timedSkins=this.ctx.storage.sql.exec<{skin_id:string;expires:number;week:number}>('SELECT * FROM timed_skin_rewards WHERE expires>?',Date.now()).toArray().map(item=>({skinId:item.skin_id,expiresAt:item.expires,weekStart:item.week}));
    timedSkins.push(...this.ctx.storage.sql.exec<{skin_id:string;expires:number}>('SELECT skin_id,MAX(expires) expires FROM event_rewards WHERE expires>? GROUP BY skin_id',Date.now()).toArray().map(item=>({skinId:item.skin_id,expiresAt:item.expires,weekStart:0})));
    return {name:row.name,snapshot,rankPoints:row.rank_points,season:level,seasonClaims,eventRewards,permanentEventRewards,timedSkins,serverNow:Date.now(),knifeDraw:{used:knifeDraw.used,shards:knifeDraw.shards,owned:knifeOwned,tickets:Math.max(0,level.level-1-knifeDraw.used)}};
  }
  grantTowerReward(week:number,expires:number){
    if(!Number.isSafeInteger(week)||towerWeekStart(week)!==week||expires!==week+2*TOWER_WEEK_MS||!this.row())return null;
    this.ctx.storage.sql.exec('INSERT INTO timed_skin_rewards VALUES(?,?,?) ON CONFLICT(skin_id) DO UPDATE SET week=excluded.week,expires=excluded.expires WHERE excluded.expires>timed_skin_rewards.expires',TOWER_KING_SKIN,week,expires);
    return {ok:true};
  }
  grantTournamentReward(eventId:string,place:number){
    if(!/^[0-9a-f-]{36}$/i.test(eventId)||![1,2,3].includes(place))return null;
    const row=this.row();if(!row)return null;
    const suffix=['','gold','silver','bronze'][place],now=Date.now();
    const expires=eventId.startsWith('00000000-0000-4000-8000-')?now+604800000:0;
    this.ctx.storage.sql.exec('INSERT OR IGNORE INTO event_rewards(event_id,skin_id,claimed_at,expires) VALUES(?,?,?,?)',eventId,`event-warrior-${suffix}`,now,expires);
    this.ctx.storage.sql.exec('INSERT OR IGNORE INTO event_rewards(event_id,skin_id,claimed_at,expires) VALUES(?,?,?,?)',eventId,`knife-event-warrior-${suffix}`,now,expires);
    return this.profile(row);
  }
  async drawKnife(token:string,device:string){
    if(!await this.validate(token,device))return {ok:false,error:'请重新登录'};
    const row=this.row();if(!row)return {ok:false,error:'账号不存在'};
    const level=seasonLevel(row.season_earned+row.season_bonus).level;
    const current=this.ctx.storage.sql.exec<{used:number}>('SELECT used FROM knife_draw_state WHERE id=1').one();
    if(current.used>=level-1)return {ok:false,error:'暂无抽奖次数'};
    const random=crypto.getRandomValues(new Uint32Array(1))[0],skinId=KNIFE_DRAW_IDS[random%KNIFE_DRAW_IDS.length];
    const duplicate=Boolean(this.ctx.storage.sql.exec('SELECT skin_id FROM knife_draw_owned WHERE skin_id=?',skinId).toArray()[0]);
    this.ctx.storage.sql.exec('UPDATE knife_draw_state SET used=used+1,shards=shards+? WHERE id=1',duplicate?2:0);
    if(!duplicate)this.ctx.storage.sql.exec('INSERT INTO knife_draw_owned VALUES(?,?)',skinId,Date.now());
    return {ok:true,skinId,duplicate,shardsGained:duplicate?2:0,profile:this.profile(row)};
  }
  async redeemKnife(token:string,device:string,skinId:string){
    if(!await this.validate(token,device))return {ok:false,error:'请重新登录'};
    const row=this.row();if(!row||!KNIFE_DRAW_IDS.includes(skinId))return {ok:false,error:'刀皮不存在'};
    if(this.ctx.storage.sql.exec('SELECT skin_id FROM knife_draw_owned WHERE skin_id=?',skinId).toArray()[0])return {ok:false,error:'已拥有这款刀皮'};
    const result=this.ctx.storage.sql.exec('UPDATE knife_draw_state SET shards=shards-? WHERE id=1 AND shards>=?',KNIFE_SHARD_COST,KNIFE_SHARD_COST);
    if(!result.rowsWritten)return {ok:false,error:'刀皮碎片不足'};
    this.ctx.storage.sql.exec('INSERT INTO knife_draw_owned VALUES(?,?)',skinId,Date.now());
    return {ok:true,profile:this.profile(row)};
  }
  async claimSeasonReward(token:string,device:string,skinId:string){
    if(!await this.validate(token,device))return {ok:false,error:'请重新登录'};
    const row=this.row(),required=SEASON_REWARD_LEVELS[skinId];
    if(!row||!required)return {ok:false,error:'奖励不存在'};
    if(seasonLevel(row.season_earned+row.season_bonus).level<required)return {ok:false,error:'赛季等级不足'};
    this.ctx.storage.sql.exec('INSERT OR IGNORE INTO season_rewards VALUES(?,?)',skinId,Date.now());
    return {ok:true,profile:this.profile(row)};
  }
  private async session(device:string){
    return this.ctx.blockConcurrencyWhile(async()=>{
      const token=hex(crypto.getRandomValues(new Uint8Array(32))),hash=await digest(token),expires=Date.now()+30*24*60*60*1000;
      const row=this.row();if(!row||!await this.registry().claim(row.name.toLowerCase(),device,hash,expires))throw Error('设备标识无效');
      this.ctx.storage.sql.exec('DELETE FROM sessions');
      this.ctx.storage.sql.exec('INSERT INTO sessions VALUES (?,?)',hash,expires);
      return token;
    });
  }
  async validate(token:string,device:string){
    if(!/^[a-f0-9]{64}$/i.test(token)||!/^([0-9a-f-]{36})$/i.test(device))return false;
    const hash=await digest(token),row=this.ctx.storage.sql.exec<{expires:number}>('SELECT expires FROM sessions WHERE token_hash=?',hash).toArray()[0];
    const account=this.row();return Boolean(row&&account&&row.expires>Date.now()&&await this.registry().active(account.name.toLowerCase(),device,hash));
  }
  async register(name:string,password:string,raw:unknown,device:string){
    const issue=contentIssue(name,'name');if(issue)return {ok:false,error:issue};
    if(this.row())return {ok:false,error:'账号名已被使用'};
    const snapshot=cleanSnapshot(raw,name);if(!snapshot)return {ok:false,error:'本机存档格式无效'};
    const salt=hex(crypto.getRandomValues(new Uint8Array(16))),passwordHashValue=await passwordHash(password,salt);
    if(this.row())return {ok:false,error:'账号名已被使用'};
    this.ctx.storage.sql.exec('INSERT INTO account(id,name,salt,password_hash,snapshot) VALUES(1,?,?,?,?)',name,salt,passwordHashValue,JSON.stringify(snapshot));
    const token=await this.session(device);return {ok:true,token,profile:this.profile(this.row())};
  }
  async login(password:string,device:string){
    const row=this.row();if(!row)return {ok:false,error:'账号或密码错误'};
    const ban=await this.registry().banState(row.name.toLowerCase());if(ban)return {ok:false,error:ban.until===0?'账号已被永久封禁 / Account permanently banned':`账号已被封禁，解封时间 / Banned until: ${new Date(ban.until).toISOString()}`};
    const hash=await passwordHash(password,row.salt);if(!equalHex(hash,row.password_hash))return {ok:false,error:'账号或密码错误'};
    const token=await this.session(device);return {ok:true,token,profile:this.profile(row)};
  }
  async resetPasswordUsingEmail(email:string,code:string,password:string){
    if(password.length<8||password.length>128)return {ok:false,error:'密码需要 8–128 个字符'};
    const result=await this.ctx.blockConcurrencyWhile(async()=>{
      const row=this.row();if(!row||!await this.registry().consumeEmailReset(email,row.name.toLowerCase(),code))return {ok:false,error:'验证码无效或已过期'};
      const salt=hex(crypto.getRandomValues(new Uint8Array(16))),hash=await passwordHash(password,salt);
      this.ctx.storage.sql.exec('UPDATE account SET salt=?,password_hash=? WHERE id=1',salt,hash);
      this.ctx.storage.sql.exec('DELETE FROM sessions');await this.registry().revokeAccount(row.name.toLowerCase());
      return {ok:true};
    });
    if(result.ok){const name=this.row()!.name;try{await this.registry().passwordResetNotice(name.toLowerCase())}catch{/* A notification failure does not undo a completed reset. */}}
    return result;
  }
  async read(token:string,device:string){if(!await this.validate(token,device))return null;const row=this.row();return row?this.profile(row):null}
  async saveSnapshot(token:string,device:string,raw:unknown){if(!await this.validate(token,device))return {ok:false,error:'请重新登录'};const row=this.row();if(!row)return {ok:false,error:'账号不存在'};const data=cleanSnapshot(raw,row.name);if(!data)return {ok:false,error:'存档格式无效'};this.ctx.storage.sql.exec('UPDATE account SET snapshot=? WHERE id=1',JSON.stringify(data));return {ok:true}}
  async logout(token:string,device:string){if(/^[a-f0-9]{64}$/i.test(token)&&/^([0-9a-f-]{36})$/i.test(device)){const hash=await digest(token),row=this.row();if(row)await this.registry().release(row.name.toLowerCase(),device,hash);this.ctx.storage.sql.exec('DELETE FROM sessions WHERE token_hash=?',hash)}return {ok:true}}
  recordResult(matchId:string,won:boolean,deaths:number){
    const row=this.row();if(!row||!/^([a-z0-9:-]){10,100}$/i.test(matchId))return null;
    const prior=this.ctx.storage.sql.exec<{delta:number}>('SELECT delta FROM rank_results WHERE match_id=?',matchId).toArray()[0];
    if(prior)return {applied:false,delta:prior.delta,...this.profile(row)};
    const delta=rankDelta(won,deaths);
    this.ctx.storage.sql.exec('INSERT INTO rank_results VALUES(?,?,?,?)',matchId,delta,won?1:0,Date.now());
    this.ctx.storage.sql.exec('UPDATE account SET rank_points=MAX(0,rank_points+?),season_earned=season_earned+? WHERE id=1',delta,Math.max(0,delta));
    return {applied:true,delta,...this.profile(this.row())};
  }
}
