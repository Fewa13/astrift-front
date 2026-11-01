// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {PROFESSIONS,skillIncoming,type SkillActor} from './ancient-skills';
import {newAncientProfile,type AncientProfile} from './ancient-rules';
import {ancientProfileHealth} from './ancient-gear';
import {isHoly} from './ancient-ascension';
import {castAncientSkill,ancientAuxShot,tickAncientSkills,type SkillMonster,type SkillContext,type SkillFXDetails} from './ancient-skill-combat';
import {TRIAL_TIERS,TRIAL_LESSONS} from './ancient-trial-rules';
type TrialMob=SkillMonster&{attackAt:number};
type Trial={id:string;job:string;tier:string;profile:AncientProfile;actor:SkillActor;monsters:TrialMob[];started:number;ends:number;tick:number;inputAt:number;nextHazard:number;hazard?:{x:number;z:number;hitAt:number};casts:string[];multi:boolean;petDamage:number;dodges:number;status:'active'|'complete'|'failed'|'abandoned';seq:number;finished?:number;reward?:number;waveAt?:number};
type Effect={id:string;x:number;z:number;radius:number;details?:SkillFXDetails};
export class AncientProfessionTrials{
 constructor(private sql:SqlStorage){sql.exec('CREATE TABLE IF NOT EXISTS ancient_profession_trials(name TEXT PRIMARY KEY,data TEXT NOT NULL)');sql.exec('CREATE TABLE IF NOT EXISTS ancient_trial_mastery(name TEXT NOT NULL,job TEXT NOT NULL,tier TEXT NOT NULL,best INTEGER NOT NULL,PRIMARY KEY(name,job,tier))');}
 read(name:string):Trial|undefined{const row=this.sql.exec<{data:string}>('SELECT data FROM ancient_profession_trials WHERE name=?',name).toArray()[0];return row?JSON.parse(row.data):undefined;}
 save(name:string,r:Trial){this.sql.exec('INSERT INTO ancient_profession_trials VALUES(?,?) ON CONFLICT(name) DO UPDATE SET data=excluded.data',name,JSON.stringify(r));}
 mastery(name:string){return this.sql.exec<{job:string;tier:string;best:number}>('SELECT job,tier,best FROM ancient_trial_mastery WHERE name=?',name).toArray();}
 start(name:string,p:AncientProfile,tierId:string,now=Date.now()){
  const tier=TRIAL_TIERS.find(t=>t.id===tierId),job=p.profession||'';if(!tier||!Object.hasOwn(TRIAL_LESSONS,job))return 'Choose a profession first.';
  if(p.level<tier.level)return 'Player level too low.';if(tierId==='holy'&&!isHoly(p))return 'Ascend this profession first.';
  const previous=this.read(name);if(previous?.status==='active'&&previous.ends>now)return 'Finish or leave the current trial first.';
  const profile=newAncientProfile();profile.level=30;profile.profession=job;profile.gear=[];profile.gearEquipped={};profile.materials={};profile.skills=Object.fromEntries(PROFESSIONS[job].skills.map(id=>[id,3]));if(tierId==='holy')profile.ascension={day:'',attempts:0,jobs:{[job]:{permit:true,step:3,count:0,holy:true}}};
  const hp=ancientProfileHealth(profile),actor:SkillActor={name,x:0,y:1.7,z:9,hp,maxHp:hp,weapon:profile.weapons[0],profession:job,holy:tierId==='holy',skills:profile.skills};
  const multiplier=tierId==='holy'?2.5:tierId==='advanced'?1.35:1,count=job==='summoner'?(tierId==='normal'?2:3):tierId==='normal'?3:4;
  const monsters=Array.from({length:count},(_,i)=>{const maxHp=Math.floor((job==='summoner'?26000:45000)*multiplier);return {id:'trial-'+i,kind:'grox',x:(i%3-1)*2.5,z:19+Math.floor(i/3)*3,hp:maxHp,maxHp,attackAt:now+3000};});
  const r:Trial={id:crypto.randomUUID(),job,tier:tierId,profile,actor,monsters,started:now,ends:now+tier.time*1000,tick:now,inputAt:now,nextHazard:now+4500,casts:[],multi:false,petDamage:0,dodges:0,status:'active',seq:0};this.save(name,r);return null;
 }
 context(r:Trial,fx:Effect[]):SkillContext{return {map:'dungeon:999999999',monsters:r.monsters,canMove:(_x,_z,x,z)=>Math.abs(x)<9&&z>=5&&z<=30,damage:(m,n,source)=>{if(m.hp<=0||!Number.isFinite(n)||n<=0)return 0;const amount=Math.min(m.hp,Math.floor(n));m.hp-=amount;if(source==='summon')r.petDamage+=amount;return amount;},fx:(id,x,z,radius,details)=>fx.push({id,x,z,radius,details})};}
 tick(r:Trial,now:number,fx:Effect[]){if(r.status!=='active')return;const dt=Math.min(.5,Math.max(0,(now-r.tick)/1000));r.tick=now;
  if(now>=r.ends){r.status='failed';r.finished=now;return;}
  tickAncientSkills(r.actor,r.profile,this.context(r,fx),dt,now);
  for(const m of r.monsters){if(m.hp<=0)continue;const dx=r.actor.x-m.x,dz=r.actor.z-m.z,d=Math.hypot(dx,dz)||1;if(d>2){const step=Math.min(d-2,dt*(r.tier==='normal'?1.4:2));m.x+=dx/d*step;m.z+=dz/d*step;}else if(now>=m.attackAt){m.attackAt=now+1600;r.actor.hp=Math.max(0,r.actor.hp-4500*skillIncoming(r.actor,now));}}
  if(r.hazard&&now>=r.hazard.hitAt){if(Math.hypot(r.actor.x-r.hazard.x,r.actor.z-r.hazard.z)<2.8)r.actor.hp=Math.max(0,r.actor.hp-18000*skillIncoming(r.actor,now));else r.dodges++;delete r.hazard;}
  if(now>=r.nextHazard&&r.monsters.some(m=>m.hp>0)){r.hazard={x:r.actor.x,z:r.actor.z,hitAt:now+1400};r.nextHazard=now+(r.tier==='normal'?6500:4500);}
  if(r.actor.hp<=0){r.status='failed';r.finished=now;return;}
  const lesson=TRIAL_LESSONS[r.job];if(r.monsters.every(m=>m.hp<=0)&&lesson.required.every(id=>r.casts.includes(id))&&(!lesson.multi||r.multi)&&(!lesson.pet||r.petDamage>0)){r.status='complete';r.finished=now;}
  else if(r.monsters.every(m=>m.hp<=0)){r.waveAt??=now+1800;if(now>=r.waveAt){for(const [i,m]of r.monsters.entries())Object.assign(m,{hp:m.maxHp,x:(i%3-1)*2.5,z:19+Math.floor(i/3)*3,strikes:[],dots:[],attackAt:now+2000});delete r.waveAt;}}
 }
 input(name:string,data:Record<string,unknown>,now=Date.now()){
  const r=this.read(name),fx:Effect[]=[];if(!r||r.id!==data.id)return {error:'Trial expired. Reopen the trial.'};
  this.tick(r,now,fx);let error:string|null=null;
  if(r.status==='active'&&typeof data.seq==='number'&&Number.isSafeInteger(data.seq)&&data.seq>r.seq){r.seq=data.seq;const dt=Math.min(.35,Math.max(0,(now-r.inputAt)/1000));r.inputAt=now;
   const movement=data.op==='move'?data:data.movement&&typeof data.movement==='object'&&!Array.isArray(data.movement)?data.movement as Record<string,unknown>:{};if(typeof movement.x==='number'&&typeof movement.z==='number'&&Number.isFinite(movement.x+movement.z)){const d=Math.hypot(movement.x,movement.z);if(d>0&&d<=1.01){r.actor.x=Math.max(-9,Math.min(9,r.actor.x+movement.x/d*6*dt));r.actor.z=Math.max(5,Math.min(30,r.actor.z+movement.z/d*6*dt));}}
   if(data.op==='cast'){
    const id=String(data.skill||''),target=r.monsters.find(m=>m.id===data.target&&m.hp>0)||r.monsters.find(m=>m.hp>0),dx=(target?.x??r.actor.x)-r.actor.x,dz=(target?.z??r.actor.z+10)-r.actor.z,dy=.9-r.actor.y,d=Math.hypot(dx,dy,dz)||1,before=new Map(r.monsters.map(m=>[m.id,{hp:m.hp,strikes:m.strikes?.length||0,dots:m.dots?.length||0}]));
    const aim=Array.isArray(data.direction)&&data.direction.length===3&&data.direction.every(Number.isFinite)&&Math.abs(Math.hypot(...data.direction)-1)<.05?data.direction:[dx/d,dy/d,dz/d];error=castAncientSkill(r.actor,r.profile,id,aim,this.context(r,fx),now);
    if(!error){if(!r.casts.includes(id))r.casts.push(id);const affected=r.monsters.filter(m=>m.hp<before.get(m.id)!.hp||(m.strikes?.length||0)>before.get(m.id)!.strikes||(m.dots?.length||0)>before.get(m.id)!.dots);if(id===TRIAL_LESSONS[r.job].multi&&affected.length>=2)r.multi=true;}
   }
   if(data.op==='claw'){const target=r.monsters.find(m=>m.id===data.target&&m.hp>0)||r.monsters.find(m=>m.hp>0);if(target){const dx=target.x-r.actor.x,dz=target.z-r.actor.z,dy=.9-r.actor.y,d=Math.hypot(dx,dy,dz)||1;const aim=Array.isArray(data.direction)&&data.direction.length===3&&data.direction.every(Number.isFinite)&&Math.abs(Math.hypot(...data.direction)-1)<.05?data.direction:[dx/d,dy/d,dz/d];error=ancientAuxShot(r.actor,r.profile,aim,this.context(r,fx),now)??null;}}
   this.tick(r,now,fx);
  }
  this.save(name,r);return {run:this.view(r),effects:fx,error};
 }
 settle(name:string,p:AncientProfile){const r=this.read(name);if(r?.status!=='complete'||r.reward!==undefined)return;const ms=Math.max(1,(r.finished||r.tick)-r.started),row=this.mastery(name).find(m=>m.job===r.job&&m.tier===r.tier);r.reward=row?0:TRIAL_TIERS.find(t=>t.id===r.tier)!.reward;if(!row||ms<row.best)this.sql.exec('INSERT INTO ancient_trial_mastery VALUES(?,?,?,?) ON CONFLICT(name,job,tier) DO UPDATE SET best=excluded.best',name,r.job,r.tier,ms);p.coins=Math.round((p.coins+r.reward)*100)/100;this.save(name,r);}
 state(name:string,now=Date.now()){const r=this.read(name),effects:Effect[]=[];if(r){this.tick(r,now,effects);this.save(name,r);}return {run:r?this.view(r):null,effects,mastery:this.mastery(name)};}
 leave(name:string){const r=this.read(name);if(r?.status==='active'){r.status='abandoned';r.finished=Date.now();this.save(name,r);}}
 view(r:Trial){return {seq:r.seq,id:r.id,job:r.job,tier:r.tier,actor:r.actor,monsters:r.monsters,started:r.started,ends:r.ends,now:r.tick,status:r.status,casts:r.casts,multi:r.multi,petDamage:r.petDamage,dodges:r.dodges,hazard:r.hazard,finished:r.finished,reward:r.reward};}
}
