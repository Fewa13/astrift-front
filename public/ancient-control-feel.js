// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Bounded movement sweeps use the existing collision rules, never a second map.
export function slideAncientMove(position,dx,dz,blocked,ground){
 let {x,z}=position,feet=position.y-1.7;const steps=Math.min(128,Math.max(1,Math.ceil(Math.hypot(dx,dz)/.12)));
 const allowed=(nx,nz)=>{const floor=ground(nx,nz,feet),rise=floor-feet;if(rise>.36)return false;return !blocked(nx,nz,.6,Math.max(feet,floor));};
 for(let i=0;i<steps;i++){const sx=dx/steps,sz=dz/steps;if(allowed(x+sx,z+sz)){x+=sx;z+=sz}else{if(allowed(x+sx,z))x+=sx;if(allowed(x,z+sz))z+=sz}feet=Math.max(feet,ground(x,z,feet));}
 return {x,z,y:Math.max(position.y,feet+1.7)};
}
export function createMeleeBuffer(windowMs=150){let until=-Infinity;return {press(now,readyAt){until=now+windowMs;if(Number.isFinite(readyAt)&&readyAt>=now&&readyAt<=until)until=Math.max(until,readyAt+250)},pending(now){return now<=until},consume(){until=-Infinity},clear(){until=-Infinity}};}
// Only remote decoration is reduced; spell geometry and damage timing stay intact.
export function remoteSpellPolicy({local,distance=0,pressure=false,remoteCount=0}){if(local)return {detail:16,particles:1,interval:0};return {detail:distance>45||pressure?6:remoteCount>=3?8:12,particles:distance>60?.3:pressure||remoteCount>=4?.45:.7,interval:distance>60?1/15:pressure?1/30:0};}
// A pending skill owns facing; never reuse the previous basic swing's direction.
export function monsterAttackFacing(m){if(!['windup','attack','shadow'].includes(m.action))return null;const cast=m.special||m.bossCast||m.attackWindup;if(cast){if(Number.isFinite(cast.areas?.[0]?.angle))return cast.areas[0].angle;if(Number.isFinite(cast.angle))return cast.angle;if([cast.ax,cast.az,cast.tx,cast.tz].every(Number.isFinite))return Math.atan2(cast.tx-cast.ax,cast.tz-cast.az);return null;}return Number.isFinite(m.attackFacing)?m.attackFacing:null;}
