// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export function initDamageReceipts(ctx:DurableObjectState){
  ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS damage_receipts(id TEXT PRIMARY KEY,attacker TEXT NOT NULL,victim TEXT NOT NULL,raw REAL NOT NULL,created INTEGER NOT NULL,metadata TEXT NOT NULL)');
  ctx.storage.sql.exec('CREATE INDEX IF NOT EXISTS damage_receipts_created ON damage_receipts(created)');
}
export function recordDamageReceipt(ctx:DurableObjectState,id:string,attacker:string,victim:string,raw:number,data:{zone?:unknown;hitPoint?:unknown;round?:unknown;bout?:unknown}){
  const point=Array.isArray(data.hitPoint)&&data.hitPoint.length===3&&data.hitPoint.every(Number.isFinite)?data.hitPoint.map(v=>Math.max(-300,Math.min(300,v))):null;
  ctx.storage.sql.exec('DELETE FROM damage_receipts WHERE created<?',Date.now()-15000);
  const zone=['head','body','abdomen','arm','leg','explosion'].includes(String(data.zone))?data.zone:'body';
  ctx.storage.sql.exec('INSERT OR REPLACE INTO damage_receipts VALUES(?,?,?,?,?,?)',id,attacker,victim,raw,Date.now(),JSON.stringify({zone,position:point,round:data.round,bout:data.bout}));
}
export function confirmDamageReceipt(ctx:DurableObjectState,victim:string,data:{shotId?:unknown;damage?:unknown}){
  if(typeof data.shotId!=='string'||typeof data.damage!=='number'||!Number.isFinite(data.damage)||data.damage<0)return null;
  const row=ctx.storage.sql.exec<{attacker:string;raw:number;metadata:string}>('SELECT attacker,raw,metadata FROM damage_receipts WHERE id=? AND victim=? AND created>?',data.shotId,victim,Date.now()-15000).toArray()[0];
  if(!row||data.damage>row.raw)return null;
  // Persist consumption before emitting; reconnects/retries cannot duplicate numbers.
  ctx.storage.sql.exec('DELETE FROM damage_receipts WHERE id=?',data.shotId);
  return {type:'damageResult',id:victim,target:row.attacker,shotId:data.shotId,damage:Math.round(data.damage),...JSON.parse(row.metadata)};
}
export function sendDamageReceipt(ctx:DurableObjectState,receipt:ReturnType<typeof confirmDamageReceipt>){
  if(!receipt)return;
  const text=JSON.stringify(receipt);
  for(const socket of ctx.getWebSockets())try{if(socket.deserializeAttachment()?.id===receipt.target)socket.send(text)}catch{/* Disconnected clients need no floating number. */}
}
