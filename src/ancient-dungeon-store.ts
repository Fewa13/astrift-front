// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {DUNGEON_TIERS,type DungeonRun} from './ancient-dungeon';
import {newDungeonMechanisms} from './ancient-dungeon-mechanisms';
import {huntDefinition,huntLevel,huntQuality,HUNT_SLOTS,type HuntSlot} from './ancient-hunts';
import type {AncientProfile} from './ancient-rules';
import type {AncientParty} from './ancient-party';
export class AncientDungeonStore{
 constructor(private sql:SqlStorage,private profile:(name:string)=>AncientProfile,private party:(name:string)=>AncientParty|undefined,private online:()=>Map<string,string>,private alive:(name:string)=>boolean){
  sql.exec('CREATE TABLE IF NOT EXISTS ancient_dungeon_runs(id INTEGER PRIMARY KEY AUTOINCREMENT,data TEXT NOT NULL)');
  sql.exec('CREATE TABLE IF NOT EXISTS ancient_dungeon_members(name TEXT PRIMARY KEY,run INTEGER NOT NULL)');
 }
 read(id:number){const row=this.sql.exec<{data:string}>('SELECT data FROM ancient_dungeon_runs WHERE id=?',id).toArray()[0];if(!row)return;const r=JSON.parse(row.data) as DungeonRun;if((r.status==='active'||r.status==='preparing')&&r.expires<Date.now()){r.status='failed';r.reason='expired';if(r.hunt)r.traps=[];r.finished=Date.now();this.save(r)}return r}
 get(name:string){const row=this.sql.exec<{run:number}>('SELECT run FROM ancient_dungeon_members WHERE name=?',name).toArray()[0];return row?this.read(row.run):undefined}
 save(r:DungeonRun){r.revision=(r.revision||0)+1;this.sql.exec('UPDATE ancient_dungeon_runs SET data=? WHERE id=?',JSON.stringify(r),r.id)}
 createHunt(name:string,data:Record<string,unknown>):string|null{
  const def=huntDefinition(data.hunt),rank=data.rank===undefined?0:Number(data.rank);
  if(!def||!Number.isInteger(rank)||rank<0||rank>2||def.kind==='contract'&&rank!==0)return 'Invalid hunt.';
  const level=huntLevel(def.id,rank),members=def.kind==='nemesis'||data.withParty!==true?[name]:[name,...(this.party(name)?.members||[]).filter(n=>n!==name&&this.online().has(n)&&this.profile(n).level>=level&&this.alive(n)&&!['active','preparing'].includes(this.get(n)?.status||''))];
  if(members.length>3)return 'Hunts support up to three players.';
  const online=this.online();for(const n of members){const p=this.profile(n),r=this.get(n);if(p.level<level)return 'Level requirement not met.';if(!this.alive(n))return 'Revive in camp first.';if(n!==name&&!online.has(n))return 'All party members must be online.';if(r&&['active','preparing'].includes(r.status))return 'Finish or abandon the current challenge first.';if(def.kind==='nemesis'&&rank>0&&!(p.huntClears?.[def.id+':'+(rank-1)]))return 'Defeat the previous nemesis rank first.';}
  const slot=String(data.slot||'weapon');if(!Object.hasOwn(HUNT_SLOTS,slot))return 'Choose a reward slot.';
  const now=Date.now(),id=this.sql.exec<{id:number}>("INSERT INTO ancient_dungeon_runs(data) VALUES('{}') RETURNING id").one().id;
  const r:DungeonRun={id,map:'dungeon:'+id,leader:name,members,ready:[],tier:'hunt',level,stage:0,gateZ:62,status:'preparing',created:now,expires:now+300000,started:0,joined:[],fallen:[],positions:{},seed:Math.floor(Math.random()*0xffffffff),traps:[],trapAt:0,collapsed:[],hunt:{id:def.id,rank,round:0,quality:huntQuality(level),choices:Object.fromEntries(members.map(n=>[n,slot as HuntSlot]))}};
  if(def.id==='beacon')r.hunt!.device={x:0,z:23,hp:100,maxHp:100};
  this.save(r);for(const n of members)this.sql.exec('INSERT INTO ancient_dungeon_members VALUES(?,?) ON CONFLICT(name) DO UPDATE SET run=excluded.run',n,id);return null;
 }
 createAscension(name:string,job:string,final=false){
  const previous=this.get(name);if(previous&&(previous.status==='active'||previous.status==='preparing'))return 'You already have an active trial or dungeon.';
  if(!this.alive(name))return 'Revive in camp before starting.';
  const now=Date.now(),id=this.sql.exec<{id:number}>("INSERT INTO ancient_dungeon_runs(data) VALUES('{}') RETURNING id").one().id;
  const r:DungeonRun={id,map:'dungeon:'+id,leader:name,members:[name],ready:[name],tier:final?'ascensionFinal':'ascensionTrial',ascensionJob:job,level:80,stage:0,gateZ:62,status:'active',created:now,expires:now+35*60000,started:now,joined:[],fallen:[],positions:{},seed:Math.floor(Math.random()*0xffffffff),traps:[],trapAt:0,collapsed:[]};this.save(r);this.sql.exec('INSERT INTO ancient_dungeon_members VALUES(?,?) ON CONFLICT(name) DO UPDATE SET run=excluded.run',name,id);return null;
 }
 state(name:string){const r=this.get(name),online=this.online();return {run:r?{...r,positions:undefined,members:r.members.map(n=>({name:n,ready:r.ready.includes(n),online:online.has(n),fallen:r.fallen.includes(n)}))}:null}}
 command(name:string,action:string,data:Record<string,unknown>):string|null{
  if(action==='dungeonState')return null;
  if(action==='dungeonCreate'){
   const previous=this.get(name);if(previous&&(previous.status==='preparing'||previous.status==='active'))return '已有进行中的副本';
   const tier=DUNGEON_TIERS.find(t=>t.id===data.tier&&!t.id.startsWith('ascension'));if(!tier)return '请选择副本难度';
   const party=this.party(name);const members=data.withParty===true?[name,...(party?.members||[]).filter(n=>n!==name&&this.online().has(n)&&this.profile(n).level>=tier.level&&this.alive(n)&&!['active','preparing'].includes(this.get(n)?.status||''))]:[name];if(members.length>3)return '副本最多三人';
   const online=this.online();for(const member of members){if(member!==name&&!online.has(member))return '队员必须在线';if(this.profile(member).level<tier.level)return '队员等级不足';if(!this.alive(member))return '请先在营地复活';const r=this.get(member);if(r&&(r.status==='active'||r.status==='preparing'))return '队员已有进行中的副本'}
   const now=Date.now(),id=this.sql.exec<{id:number}>("INSERT INTO ancient_dungeon_runs(data) VALUES('{}') RETURNING id").one().id;
   const r:DungeonRun={id,map:'dungeon:'+id,leader:name,members:[...members],ready:[],tier:tier.id,level:tier.level,stage:0,gateZ:62,status:'preparing',created:now,expires:now+300000,started:0,joined:[],fallen:[],positions:{},seed:Math.floor(Math.random()*0xffffffff),traps:[],trapAt:0,collapsed:[]};r.mechanisms=newDungeonMechanisms(r.seed);this.save(r);for(const member of members)this.sql.exec('INSERT INTO ancient_dungeon_members VALUES(?,?) ON CONFLICT(name) DO UPDATE SET run=excluded.run',member,id);return null;
  }
  const r=this.get(name);if(!r||!r.members.includes(name))return '副本不存在';
  if(action==='dungeonRewardSlot'){if(!r.hunt||r.status!=='preparing'||!Object.hasOwn(HUNT_SLOTS,String(data.slot)))return 'Choose a reward slot before starting.';r.hunt.choices[name]=data.slot as HuntSlot;this.save(r);return null;}
  if(action==='dungeonReady'){
   if(r.status!=='preparing')return '副本已开始';if(!this.alive(name))return '请先在营地复活';
   r.ready=r.ready.includes(name)?r.ready.filter(n=>n!==name):[...r.ready,name];
   if(r.members.every(n=>r.ready.includes(n))){for(const n of r.members)if(!this.alive(n)||this.profile(n).level<r.level)return '队员无法进入副本';r.status='active';r.started=Date.now();r.expires=r.started+(r.hunt?8:35)*60000}this.save(r);return null;
  }
  if(action==='dungeonStart'){
   if(r.status!=='preparing')return '副本已开始';if(r.leader!==name)return '只有队长可以操作';
   if(!this.alive(name)||this.profile(name).level<r.level)return '请先在营地复活';
   const members=r.members.filter(n=>n===name||r.ready.includes(n)&&this.online().has(n)&&this.alive(n)&&this.profile(n).level>=r.level);
   for(const n of r.members)if(!members.includes(n))this.sql.exec('DELETE FROM ancient_dungeon_members WHERE name=? AND run=?',n,r.id);
   r.members=members;r.ready=[...members];r.status='active';r.started=Date.now();r.expires=r.started+(r.hunt?8:35)*60000;this.save(r);return null;
  }
  if(action==='dungeonCancel'){
   if(r.leader!==name||r.status!=='preparing')return '只有队长可以取消准备';r.status='failed';r.reason='cancelled';r.finished=Date.now();this.save(r);return null;
  }
  if(action==='dungeonAbandon'){
   if(r.status!=='active')return null;r.abandoned??=[];if(!r.abandoned.includes(name))r.abandoned.push(name);if(!r.fallen.includes(name))r.fallen.push(name);if(r.members.every(n=>r.fallen.includes(n))){r.status='failed';r.reason='abandoned';r.finished=Date.now()}this.save(r);return null;
  }
  return '操作无效';
 }
}
