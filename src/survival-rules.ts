// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const TOWER_HEIGHT=10;
export const TOWER_LIMIT=5.45;
export const ZOMBIE_LIMIT=80;
export const SURVIVAL_SKILLS={
  rage1:{name:'狂暴 I',cost:500,duration:60_000,cooldown:120_000,key:'5',bonus:1},
  rage2:{name:'狂暴 II',cost:3000,duration:60_000,cooldown:100_000,key:'5',bonus:1.5},
  blood:{name:'嗜血 I',cost:5000,duration:120_000,cooldown:60_000,key:'6',bonus:0},
  protection:{name:'保护 I',cost:8000,duration:20_000,cooldown:80_000,key:'7',bonus:0}
} as const;
export type SkillKey=keyof typeof SURVIVAL_SKILLS;
export type SurvivalPlayer={id:string;name:string;ready:boolean;connected:boolean;rage:number;blood:boolean;protection:boolean;rageUntil:number;bloodUntil:number;protectionUntil:number;rageReady:number;bloodReady:number;protectionReady:number;kills:number};
export type Zombie={id:string;x:number;z:number;hp:number;maxHp:number;attackAt:number};
export type SurvivalState={version:1;round:number;status:'waiting'|'running'|'finished';elapsed:number;towerHp:number;towerMax:number;points:number;healthLevel:number;attackLevel:number;kills:number;players:SurvivalPlayer[];zombies:Zombie[];spawnAt:number;nextZombie:number};
export function newSurvivalState(round=1):SurvivalState{return {version:1,round,status:'waiting',elapsed:0,towerHp:100,towerMax:100,points:0,healthLevel:0,attackLevel:0,kills:0,players:[],zombies:[],spawnAt:0,nextZombie:0}}
export function newSurvivalPlayer(id:string,name:string):SurvivalPlayer{return {id,name,ready:false,connected:true,rage:0,blood:false,protection:false,rageUntil:0,bloodUntil:0,protectionUntil:0,rageReady:0,bloodReady:0,protectionReady:0,kills:0}}
export function zombieStats(elapsed:number){const minute=Math.floor(elapsed/60_000),rate=1.1**minute;return {minute,speed:3.2*rate,spawnInterval:2000/rate,damage:minute+1,attackInterval:1000/rate,hp:100*1.3**minute,reward:2*2**minute}}
export function survivalDamageMultiplier(state:SurvivalState,id:string){const player=state.players.find(p=>p.id===id);return 2**state.attackLevel*(player&&player.rageUntil>state.elapsed?1+(player.rage===2?1.5:1):1)}
export function tickSurvival(state:SurvivalState,dtMs:number){
  if(state.status!=='running'||!state.players.some(p=>p.connected))return;
  const previousMinute=Math.floor(state.elapsed/60_000);
  const dt=Math.max(0,Math.min(250,dtMs));state.elapsed+=dt;
  const stats=zombieStats(state.elapsed);
  if(stats.minute>previousMinute)for(const zombie of state.zombies){zombie.hp*=1.3;zombie.maxHp*=1.3}
  if(state.elapsed>=state.spawnAt){
    if(state.zombies.length<ZOMBIE_LIMIT){const index=state.nextZombie++,angle=((index*.61803398875)%1)*Math.PI*2,radius=43+(index%5)*1.6;state.zombies.push({id:`${state.round}-${index}`,x:Math.sin(angle)*radius,z:Math.cos(angle)*radius,hp:stats.hp,maxHp:stats.hp,attackAt:state.elapsed+stats.attackInterval})}
    state.spawnAt=state.elapsed+stats.spawnInterval;
  }
  const protectedNow=state.players.some(p=>p.protectionUntil>state.elapsed);
  for(const zombie of state.zombies){
    // The tower is square. Zombies spread across all four walls instead of stacking in its center.
    const targetX=Math.max(-6.6,Math.min(6.6,zombie.x)),targetZ=Math.max(-6.6,Math.min(6.6,zombie.z));
    const dx=targetX-zombie.x,dz=targetZ-zombie.z,distance=Math.hypot(dx,dz);
    if(distance>.12){const step=Math.min(distance,stats.speed*dt/1000);zombie.x+=dx/distance*step;zombie.z+=dz/distance*step;zombie.attackAt=state.elapsed+stats.attackInterval}
    else if(state.elapsed>=zombie.attackAt){if(!protectedNow)state.towerHp=Math.max(0,state.towerHp-stats.damage);zombie.attackAt=state.elapsed+stats.attackInterval}
  }
  if(state.towerHp<=0)state.status='finished';
}
export function hitSurvivalZombie(state:SurvivalState,playerId:string,zombieId:string,baseDamage:number){
  if(state.status!=='running'||!Number.isFinite(baseDamage)||baseDamage<=0)return null;
  const player=state.players.find(p=>p.id===playerId&&p.connected),zombie=state.zombies.find(z=>z.id===zombieId);
  if(!player||!zombie)return null;
  const damage=Math.min(1000,baseDamage)*survivalDamageMultiplier(state,playerId);zombie.hp-=damage;
  if(zombie.hp>0)return {damage,killed:false,reward:0};
  state.zombies.splice(state.zombies.indexOf(zombie),1);const reward=zombieStats(state.elapsed).reward;state.points=Math.min(Number.MAX_SAFE_INTEGER,state.points+reward);state.kills++;player.kills++;
  if(player.bloodUntil>state.elapsed)state.towerHp=Math.min(state.towerMax,state.towerHp+state.towerMax*.01);
  return {damage,killed:true,reward};
}
export function purchaseSurvival(state:SurvivalState,playerId:string,item:string){
  const player=state.players.find(p=>p.id===playerId&&p.connected);if(!player||state.status!=='running')return {ok:false,error:'对局尚未开始'};
  if(item==='health'||item==='attack'){
    const cost=item==='health'?state.towerMax*5:200*2**state.attackLevel;
    if(!Number.isSafeInteger(cost)||cost>Number.MAX_SAFE_INTEGER/5)return {ok:false,error:'已达到本局升级上限'};
    if(state.points<cost)return {ok:false,error:'生存点不足'};
    state.points-=cost;
    if(item==='health'){state.towerMax*=5;state.towerHp*=5;state.healthLevel++}else state.attackLevel++;
    return {ok:true};
  }
  if(state.elapsed<300_000)return {ok:false,error:'生存满 5 分钟解锁技能'};
  if(!Object.hasOwn(SURVIVAL_SKILLS,item))return {ok:false,error:'升级不存在'};
  const key=item as SkillKey,skill=SURVIVAL_SKILLS[key];
  if(key==='rage1'&&player.rage>0||key==='rage2'&&player.rage!==1||key==='blood'&&player.blood||key==='protection'&&player.protection)return {ok:false,error:key==='rage2'?'需要先购买狂暴 I':'已拥有该技能'};
  if(state.points<skill.cost)return {ok:false,error:'生存点不足'};
  state.points-=skill.cost;if(key==='rage1')player.rage=1;else if(key==='rage2')player.rage=2;else player[key]=true;return {ok:true};
}
export function activateSurvivalSkill(state:SurvivalState,playerId:string,slot:string){
  const player=state.players.find(p=>p.id===playerId&&p.connected);if(!player||state.status!=='running')return {ok:false,error:'对局尚未开始'};
  const key=slot==='5'?(player.rage===2?'rage2':'rage1'):slot==='6'?'blood':slot==='7'?'protection':null;
  if(!key||key.startsWith('rage')&&!player.rage||key==='blood'&&!player.blood||key==='protection'&&!player.protection)return {ok:false,error:'未购买该技能'};
  const category=key.startsWith('rage')?'rage':key,ready=category==='rage'?'rageReady':category==='blood'?'bloodReady':'protectionReady',until=category==='rage'?'rageUntil':category==='blood'?'bloodUntil':'protectionUntil';
  if(player[ready]>state.elapsed)return {ok:false,error:'技能冷却中'};
  const skill=SURVIVAL_SKILLS[key];player[ready]=state.elapsed+skill.cooldown;player[until]=state.elapsed+skill.duration;return {ok:true};
}
