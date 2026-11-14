// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export type BossArea={x:number;z:number;radius:number;arc?:number;inner?:number;angle?:number;length?:number;width?:number};
export type BossCast={id:string;kind:string;x:number;z:number;areas:BossArea[];started:number;hitAt:number;power:number;basic?:boolean;echo?:boolean};
export type BossState={huntBoss?:boolean;id:string;kind:string;x:number;z:number;hp:number;maxHp?:number;attackAt:number;action:string;actionAt:number;bossCast?:BossCast;bossStep?:number;bossSkillAt?:number;bossNeedsBasic?:boolean;attackFacing?:number};
export function isAncientBoss(kind:string){return kind==='buried_marshal'||kind==='hourglass_regent'||kind==='sky_sovereign'||kind==='thunder_warden'||kind==='frost_crowned'||kind==='furnace_regent'||kind==='starbound_heart'||kind==='immaculate_judge'||kind==='blight_lord'||kind==='chief'||kind==='oathknight'||kind==='emptyking'||kind==='lord'||kind==='rootwarden'||['metal','wood','water','fire','earth'].some(e=>kind==='crystal_'+e)}
export function bossAreaHit(a:BossArea,x:number,z:number){const dx=x-a.x,dz=z-a.z;if(a.arc){const angle=Math.atan2(dx,dz)-(a.angle||0),wrapped=Math.atan2(Math.sin(angle),Math.cos(angle));return Math.hypot(dx,dz)<=a.radius&&Math.abs(wrapped)<=a.arc/2}if(a.length){const along=dx*Math.sin(a.angle||0)+dz*Math.cos(a.angle||0),side=dx*Math.cos(a.angle||0)-dz*Math.sin(a.angle||0);return along>=0&&along<=a.length&&Math.abs(side)<=(a.width||3)/2}const d=Math.hypot(dx,dz);return d<=a.radius&&d>=(a.inner||0)}
const basicRanges: Record<string, number> = {
 chief: 6, lord: 8, rootwarden: 7, crystal_metal: 19, crystal_wood: 7,
 crystal_water: 17, crystal_fire: 18, crystal_earth: 8, oathknight: 6,
 emptyking: 8, blight_lord: 9, immaculate_judge: 18, starbound_heart: 20,
 furnace_regent: 8, thunder_warden: 21, buried_marshal: 8, hourglass_regent: 16,
 sky_sovereign: 20, frost_crowned: 8,
};

export function tickAncientBoss(
 m: BossState,
 target: {x:number; z:number},
 now: number,
 fx: (stage:string, c:BossCast)=>void,
 hit: (c:BossCast)=>void,
 visible = true,
){
 if (m.hp <= 0) {
  delete m.bossCast;
  return false;
 }
 if (!isAncientBoss(m.kind)) return false;
 if (m.bossCast) {
  const cast = m.bossCast;
  if (now >= cast.hitAt) {
   delete m.bossCast;
   m.action = 'attack';
   m.actionAt = now;
   m.attackAt = now + (cast.basic ? 850 : 650);
   if (!cast.basic) {
    m.bossSkillAt = now + 4200;
    m.bossNeedsBasic = true;
   } else {
    m.bossNeedsBasic = false;
   }
   fx('impact', cast);
   hit(cast);
   if (cast.id === 'secondHand' && !cast.echo && m.hp > 0) {
    const echo: BossCast = {
     ...cast, started:now, hitAt:now+780, echo:true,
     areas:cast.areas.map(area=>({...area,x:2*cast.x-area.x,z:2*cast.z-area.z,angle:area.angle===undefined?undefined:area.angle+Math.PI})),
     power:cast.power*.65,
    };
    m.bossCast = echo;
    m.action = 'windup';
    fx('warning',echo);
   }
  }
  return true;
 }

 const dx = target.x - m.x, dz = target.z - m.z;
 const distance = Math.hypot(dx, dz), angle = Math.atan2(dx, dz);
 const range = basicRanges[m.kind];
 const ranged = range > 10;
 if (!visible || now < m.attackAt || distance > Math.max(m.kind === 'chief' ? 7 : 30, range)) return false;

 const origin = {x:m.x, z:m.z};
 const aim = {x:target.x, z:target.z};
 const offset = (forward:number, side:number) => ({
  x: aim.x + Math.sin(angle)*forward + Math.cos(angle)*side,
  z: aim.z + Math.cos(angle)*forward - Math.sin(angle)*side,
 });
 const circle = (radius:number, center=origin, inner=0):BossArea => ({...center,radius,inner});
 const line = (length:number,width:number,direction=angle,center=origin):BossArea =>
  ({...center,radius:0,angle:direction,length,width});
 const arc = (radius:number,span:number,direction=angle):BossArea =>
  ({...origin,radius,angle:direction,arc:span});
 const skill = (id:string,areas:BossArea[],power=1,delay=1350) => ({id,areas,power,delay});

 // Resolve the locked aim once. Each pattern leaves an escape route.
 const patterns: Record<string, ()=>ReturnType<typeof skill>[]> = {
  chief: () => [skill('quake',[circle(7)],1,1000), skill('boneSweep',[arc(10,Math.PI*.72)],1.1)],
  lord: () => [skill('totemCross',[line(26,4),line(18,3,angle+Math.PI/2),line(18,3,angle-Math.PI/2)],1.15),skill('totemCollapse',[circle(7,aim),circle(5,offset(-11,0))],1.2)],
  rootwarden: () => [skill('rootCage',[circle(8,aim,3)],.9),skill('rootSpikes',[-1,0,1].map(i=>circle(3,offset(i*6,i*4))),1)],
  crystal_metal: () => [skill('goldLance',[line(28,3)],1.25,1000),skill('goldShards',[-.42,-.14,.14,.42].map(a=>line(22,2,angle+a)),1)],
  crystal_wood: () => [skill('thornCorridor',[-6,6].map(x=>line(27,6,angle,offset(-distance,x))),1),skill('seedBurst',[circle(4,aim),...[-1,1].flatMap(i=>[circle(3,offset(i*8,0)),circle(3,offset(0,i*8))])],1.05)],
  crystal_water: () => [skill('tidalRing',[circle(19,origin,7)],1.05),skill('tidalPool',[circle(8,aim),circle(5,offset(10,0))],.95,1550)],
  crystal_fire: () => [skill('meteors',[circle(5,aim),circle(3,offset(6,6)),circle(3,offset(-6,-6))],1.2,1550),skill('fireBreath',[arc(22,Math.PI*.43)],1.06)],
  crystal_earth: () => [skill('stoneRidge',[-1,1].map(i=>line(25,4,angle+i*.26)),1.1),skill('rockFall',[circle(9,aim,4),circle(4,origin)],1.12,1600)],
  oathknight: () => [skill('oathCharge',[line(20,3.5)],1.2,1200),skill('oathGuard',[arc(9,Math.PI*1.45,angle+Math.PI)],.95)],
  emptyking: () => [skill('crownBlade',[line(30,5)],1.16),skill('voidRifts',[-8,0,8].map(x=>line(16,3,angle,offset(-8,x))),1.15),skill('royalMuster',[circle(15,origin,5)],.65)],
  blight_lord: () => [skill('blightMuster',[circle(6)],.6),skill('blightRupture',[circle(10,aim,4),circle(2.5,aim)],1.1),skill('blightScythe',[arc(17,Math.PI*.95),arc(10,Math.PI*.55,angle+Math.PI)],1.2)],
  immaculate_judge: () => [skill('judgmentRay',[line(35,3.6)]),skill('verdictSweep',[arc(16,Math.PI*.75)]),skill('sealingArray',[-1,0,1].map(i=>circle(4,offset(i*6,-i*3))))],
  starbound_heart: () => [skill('orbitCollapse',Array.from({length:6},(_,i)=>{const a=i*Math.PI/3;return circle(4,offset(Math.cos(a)*9,Math.sin(a)*9))}),1.15),skill('constellation',[-1,1].map(i=>line(24,2,angle+i*.62,offset(-7,0))),1.17)],
  furnace_regent: () => [skill('forgeHammer',[line(18,5),circle(5,offset(18-distance,0))],1.28),skill('furnaceRing',[circle(6),circle(20,origin,12)],1.08)],
  thunder_warden: () => [skill('forkedThunder',[-.52,0,.52].map(a=>line(30,2.4,angle+a)),1.13,1050),skill('lightningGrid',[-6,0,6].map(x=>line(25,2,angle+Math.PI/2,offset(x,-12))),1.18)],
  buried_marshal: () => [skill('buriedAmbush',[-1,1].map(i=>arc(17,Math.PI*.37,angle+i*Math.PI/2)),1.18),skill('sandSink',[circle(12,aim)],1.3,1750)],
  hourglass_regent: () => [skill('hourglassPinch',[arc(22,Math.PI*.42),arc(22,Math.PI*.42,angle+Math.PI)],1.2),skill('secondHand',[circle(5,offset(0,-8)),circle(5,offset(0,8)),line(23,2)],1.15)],
  sky_sovereign: () => [skill('galeCorridors',[-10,0,10].map(x=>line(30,4,angle,offset(-distance,x))),1.15),skill('eyeOfStorm',[circle(23,aim,5)],1.15,1650)],
  frost_crowned: () => [skill('frostEdict',[line(30,4),arc(14,Math.PI*.38,angle+Math.PI)],1.12),skill('icePrison',[circle(8,aim,4),circle(13,aim,10)],1.2)],
 };

 const useSkill = !m.bossNeedsBasic && now >= (m.bossSkillAt ?? 0);
 if (!useSkill && distance > range) return false;
 const step = m.bossStep ?? 0;
 let attack;
 if (useSkill) {
  const choices = patterns[m.kind]();
  attack = choices[step % choices.length];
  m.bossStep = step + 1;
 } else {
  attack = ranged
   ? skill('bossBasicBolt',[line(range,1.8)],.67,550)
   : skill('bossBasicStrike',[arc(range,Math.PI*.61)],.72,480);
 }
 const cast: BossCast = {
  id:attack.id, kind:m.kind, ...origin, areas:attack.areas, started:now,
  hitAt:now+attack.delay, power:attack.power, basic:!useSkill,
 };
 m.bossCast = cast;
 m.attackFacing = angle;
 m.action = 'windup';
 m.actionAt = now;
 fx('warning',cast);
 return true;
}
