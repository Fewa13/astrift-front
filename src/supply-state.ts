// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const SUPPLY_OPTIONS=['mark','heal','guard','ads','hip'] as const;
export type SupplyOption=typeof SUPPLY_OPTIONS[number];
const POINTS:[number,number][]=[[-22,23],[22,-22],[-22,-22],[22,22],[-5,42],[5,-42],[-49,12],[49,-12]];
export const SUPPLY_INTERVAL=30_000;

export function initSupply(ctx:DurableObjectState){
  ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS supply_state(id INTEGER PRIMARY KEY,seq INTEGER NOT NULL,next_at INTEGER NOT NULL)');
  ctx.storage.sql.exec('INSERT OR IGNORE INTO supply_state VALUES(1,0,0)');
}
export function resetSupply(ctx:DurableObjectState){ctx.storage.sql.exec('UPDATE supply_state SET seq=0,next_at=0 WHERE id=1');}
export function supplySnapshot(ctx:DurableObjectState){
  const row=ctx.storage.sql.exec<{seq:number;next_at:number}>('SELECT seq,next_at FROM supply_state WHERE id=1').one();
  const [x,z]=POINTS[row.seq%POINTS.length];
  return {type:'supplyState' as const,seq:row.seq,nextAt:row.next_at,position:[x,z] as [number,number],serverNow:Date.now()};
}
export function claimSupply(ctx:DurableObjectState,actor:[number,number,number],effect:unknown,hp:number){
  if(!SUPPLY_OPTIONS.includes(effect as SupplyOption)||!actor.every(Number.isFinite)||hp<=0||effect==='heal'&&hp>=100)return null;
  const current=supplySnapshot(ctx),now=Date.now();
  if(now<current.nextAt||Math.hypot(actor[0]-current.position[0],actor[2]-current.position[1])>3.3)return null;
  ctx.storage.sql.exec('UPDATE supply_state SET seq=?,next_at=? WHERE id=1',current.seq+1,now+SUPPLY_INTERVAL);
  return {...supplySnapshot(ctx),effect:effect as SupplyOption};
}
