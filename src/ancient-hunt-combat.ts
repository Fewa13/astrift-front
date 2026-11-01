// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {huntDefinition} from './ancient-hunts';
import {dungeonHealthScale,dungeonDamageScale,type DungeonRun} from './ancient-dungeon';
import {ancientMobHP} from './ancient-mob-stats';
import {blocked} from './ancient-rules';
import {monsterSpeed,type SkillMonster} from './ancient-skill-combat';
export type HuntMonster=SkillMonster&{level:number;map?:string;title?:[string,string];huntBoss?:boolean;huntRaider?:boolean;target:string;attackAt:number;action:string;actionAt:number;dungeonPower?:number;attackWindup?:{started:number;hitAt:number;target:string}};
export function spawnHunt<T extends HuntMonster>(run:DungeonRun,make:(kind:string,level:number,x:number,z:number,region:number)=>T):T[]{
 const h=run.hunt!,def=huntDefinition(h.id)!,nemesis=def.kind==='nemesis',last=nemesis||h.id==='quarry'&&h.round===1||h.id==='encircle'&&h.round===2,result:T[]=[];
 const add=(kind:string,x:number,z:number,boss=false)=>{if(blocked(x,z,1.8,run.map))return;const m=make(kind,run.level,x,z,0);m.map=run.map;m.huntBoss=boss;m.maxHp=Math.round((boss&&!nemesis?ancientMobHP('grox',run.level)*(h.id==='quarry'?5:7):m.maxHp)*dungeonHealthScale(run.members.length));m.hp=m.maxHp;m.dungeonPower=dungeonDamageScale(run.members.length)*(boss&&!nemesis?.8:1);if(boss)m.title=nemesis?[def.name,def.en]:h.id==='quarry'?['裂骨凶兽','Ravager']:['围猎队长','Huntmaster'];result.push(m);return m;};
 if(last){add(h.id==='serahn'?'rootwarden':'chief',0,45,true);return result;}
 const count=h.id==='encircle'?5:h.id==='beacon'?4:4;
 for(let i=0;i<count;i++){const m=add(h.id==='encircle'&&i%2?'hunter':'grox',[-16,-5,5,16,0][i],53);if(m&&h.id==='beacon'){m.huntRaider=i<2;m.title=i<2?['信标突袭者','Beacon Raider']:['掩护猎手','Raider Escort'];}}
 return result;
}
// Objective attackers use normal pathing and a visible wind-up, never instant hits.
export function tickBeaconRaider(m:HuntMonster,run:DungeonRun,dt:number,now:number,move:(x:number,z:number,step:number)=>void){
 const d=run.hunt?.device;if(!d||!m.huntRaider||m.hp<=0)return false;
 if(m.attackWindup){if(now>=m.attackWindup.hitAt){delete m.attackWindup;m.action='attack';m.actionAt=now;if(Math.hypot(m.x-d.x,m.z-d.z)<3)d.hp=Math.max(0,d.hp-8);}return true;}
 if(Math.hypot(m.x-d.x,m.z-d.z)>2.6){move(d.x,d.z,dt*3.3*monsterSpeed(m,now));m.action='walk';}
 else if(now>=m.attackAt){m.attackAt=now+1400;m.attackWindup={started:now,hitAt:now+500,target:'@beacon'};m.action='windup';m.actionAt=now;}
 return true;
}
