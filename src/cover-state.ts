// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {COVER_SPECS} from './cover-layout';

const specs=new Map(COVER_SPECS.map(spec=>[spec.id,spec]));
export function initCoverState(ctx:DurableObjectState){ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS cover_state(id TEXT PRIMARY KEY,hp INTEGER NOT NULL)');}
export function resetCoverState(ctx:DurableObjectState){ctx.storage.sql.exec('DELETE FROM cover_state');}
export function coverSnapshot(ctx:DurableObjectState){return ctx.storage.sql.exec<{id:string;hp:number}>('SELECT id,hp FROM cover_state').toArray();}
export function applyCoverDamage(ctx:DurableObjectState,map:string,id:unknown,damage:unknown){
  if(typeof id!=='string')return null;
  const spec=specs.get(id);
  if(!spec||spec.map!==map)return null;
  const amount=Math.max(0,Math.min(100,Number(damage)||0));
  if(!amount)return null;
  const previous=ctx.storage.sql.exec<{hp:number}>('SELECT hp FROM cover_state WHERE id=?',id).toArray()[0]?.hp??spec.hp;
  if(previous<=0)return null;
  const hp=Math.max(0,Math.round(previous-amount));
  ctx.storage.sql.exec('INSERT INTO cover_state(id,hp) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET hp=excluded.hp',id,hp);
  return {type:'coverState',coverId:id,hp};
}
