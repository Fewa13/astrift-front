// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export type BombPreset='solo'|'duoCoop'|'duoOpposite'|'trioCoop'|'trioOpposite'|'fourCoop'|'fourOpposite'|'fiveCoop'|'fiveOpposite'|'sixOpposite'|'sevenOpposite'|'eightOpposite'|'nineOpposite'|'full';
export type BombSite='A'|'B';
export type BombSide=0|1;
export type BombPhase='waiting'|'prep'|'running'|'intermission'|'finished';
export type BombFighter={id:string;team:BombSide;hp:number;position:[number,number,number];interacting?:boolean;connected?:boolean};
export type BombMatch={phase:BombPhase;round:number;scores:[number,number];attackTeam:BombSide;firstAttackTeam:BombSide;startedAt:number;endsAt:number;nextAt:number;plantedSite:BombSite|null;plantedAt:number;carrier:string|null;hold:{id:string;kind:'plant'|'defuse';site:BombSite;since:number}|null;event:string;revision:number;winner:BombSide|null};
export const BOMB_MAP_SCALE=.45;
export const BOMB_MAP_LIMIT=208*BOMB_MAP_SCALE;
export const BOMB_PREP_MS=7000;
export function bombSitesFor(attackTeam:BombSide):Record<BombSite,[number,number,number]>{const defenderZ=(attackTeam===0?-132:132)*BOMB_MAP_SCALE;return {A:[-110*BOMB_MAP_SCALE,0,defenderZ],B:[110*BOMB_MAP_SCALE,0,defenderZ]};}
export const BOMB_SITES=bombSitesFor(0);
export const BOMB_PRESETS:Record<BombPreset,{humans:number;hostHumans:number;alliedAi:number;enemyAi:number}>={
  solo:{humans:1,hostHumans:1,alliedAi:4,enemyAi:5},
  duoCoop:{humans:2,hostHumans:2,alliedAi:3,enemyAi:5},
  duoOpposite:{humans:2,hostHumans:1,alliedAi:4,enemyAi:4},
  trioCoop:{humans:3,hostHumans:3,alliedAi:2,enemyAi:3},
  trioOpposite:{humans:3,hostHumans:1,alliedAi:3,enemyAi:4},
  fourCoop:{humans:4,hostHumans:4,alliedAi:1,enemyAi:5},
  fourOpposite:{humans:4,hostHumans:2,alliedAi:3,enemyAi:3},
  fiveCoop:{humans:5,hostHumans:5,alliedAi:0,enemyAi:5},
  fiveOpposite:{humans:5,hostHumans:3,alliedAi:2,enemyAi:3},
  sixOpposite:{humans:6,hostHumans:3,alliedAi:2,enemyAi:2},
  sevenOpposite:{humans:7,hostHumans:4,alliedAi:1,enemyAi:2},
  eightOpposite:{humans:8,hostHumans:4,alliedAi:1,enemyAi:1},
  nineOpposite:{humans:9,hostHumans:5,alliedAi:0,enemyAi:1},
  full:{humans:10,hostHumans:5,alliedAi:0,enemyAi:0}
};
export function createBombMatch(now=Date.now(),firstAttackTeam:BombSide=Math.random()<.5?0:1):BombMatch{return {phase:'waiting',round:0,scores:[0,0],attackTeam:firstAttackTeam,firstAttackTeam,startedAt:0,endsAt:0,nextAt:0,plantedSite:null,plantedAt:0,carrier:null,hold:null,event:'等待玩家',revision:0,winner:null};}
export function startBombRound(m:BombMatch,fighters:BombFighter[],now=Date.now()){
  m.round++;m.phase='prep';m.attackTeam=m.round<=6?m.firstAttackTeam:(1-m.firstAttackTeam) as BombSide;m.startedAt=now;m.endsAt=now+BOMB_PREP_MS;m.nextAt=0;m.plantedSite=null;m.plantedAt=0;m.hold=null;m.winner=null;
  const attackers=fighters.filter(p=>p.team===m.attackTeam&&p.hp>0);m.carrier=attackers.length?attackers[Math.floor(Math.random()*attackers.length)].id:null;m.event=`第 ${m.round}/12 回合 · 守方布防`;m.revision++;
}
export function finishBombRound(m:BombMatch,winner:BombSide,event:string,now=Date.now()){
  if(m.phase!=='running')return;m.scores[winner]++;m.phase=m.round>=12?'finished':'intermission';m.winner=winner;m.nextAt=now+(m.phase==='finished'?15000:4500);m.endsAt=now;m.hold=null;m.event=event;m.revision++;
}
export function tickBombMatch(m:BombMatch,fighters:BombFighter[],now=Date.now()){
  if(m.phase==='prep'){if(now>=m.endsAt){m.phase='running';m.startedAt=now;m.endsAt=now+90000;m.event='攻方突入 · 回合开始';m.revision++;}return;}
  if(m.phase!=='running')return;
  const alive=(team:BombSide)=>fighters.filter(p=>p.team===team&&p.hp>0&&p.connected!==false);
  const attackers=alive(m.attackTeam),defenders=alive((1-m.attackTeam) as BombSide);
  if(!m.plantedSite&&m.carrier&&!attackers.some(p=>p.id===m.carrier)){m.carrier=attackers[0]?.id||null;m.hold=null;m.revision++;}
  if(!m.plantedSite&&attackers.length===0)return finishBombRound(m,(1-m.attackTeam) as BombSide,'攻方全灭 · 守方获胜',now);
  if(defenders.length===0)return finishBombRound(m,m.attackTeam,'守方全灭 · 攻方获胜',now);
  if(m.hold){const h=m.hold,actor=fighters.find(p=>p.id===h.id),site=bombSitesFor(m.attackTeam)[h.site],close=actor&&actor.hp>0&&actor.connected!==false&&actor.interacting&&Math.hypot(actor.position[0]-site[0],actor.position[2]-site[2])<=3.2&&Math.abs(actor.position[1]-site[1])<4;
    if(!close||h.kind==='plant'&&(m.plantedSite||m.carrier!==h.id||actor.team!==m.attackTeam)||h.kind==='defuse'&&(m.plantedSite!==h.site||actor.team===m.attackTeam)){m.hold=null;m.revision++;}
    else if(now-h.since>=5000){m.hold=null;if(h.kind==='plant'){m.plantedSite=h.site;m.plantedAt=now;m.endsAt=now+35000;m.carrier=null;m.event=`相位核心已安放至 ${h.site} 点`;}else return finishBombRound(m,(1-m.attackTeam) as BombSide,'相位核心已拆除 · 守方获胜',now);m.revision++;}
  }
  if(now>=m.endsAt)finishBombRound(m,m.plantedSite?m.attackTeam:(1-m.attackTeam) as BombSide,m.plantedSite?'相位核心爆炸 · 攻方获胜':'回合时间结束 · 守方获胜',now);
}
export function beginBombHold(m:BombMatch,actor:BombFighter,site:BombSite,now=Date.now()){
  if(m.phase!=='running'||m.hold||actor.hp<=0||!actor.interacting||Math.hypot(actor.position[0]-bombSitesFor(m.attackTeam)[site][0],actor.position[2]-bombSitesFor(m.attackTeam)[site][2])>3.2)return false;
  const kind=m.plantedSite?'defuse':'plant';if(kind==='plant'&&(actor.team!==m.attackTeam||actor.id!==m.carrier)||kind==='defuse'&&(actor.team===m.attackTeam||m.plantedSite!==site))return false;
  m.hold={id:actor.id,kind,site,since:now};m.revision++;return true;
}
