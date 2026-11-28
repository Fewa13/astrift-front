// Scheduling budget only: every entity remains in authoritative world state.
export type CommunityAIActor={id:string;x:number;z:number;hp:number;target?:string;attackWindup?:unknown;bossCast?:unknown;aiUpdatedAt?:number};
export function communityAIUpdates<T extends CommunityAIActor>(monsters:T[],players:{x:number;z:number;hp:number}[],now:number,frameDt:number){
 const living=players.filter(p=>p.hp>0),distance=(m:T)=>living.reduce((nearest,p)=>Math.min(nearest,Math.hypot(m.x-p.x,m.z-p.z)),Infinity);
 const ranked=monsters.filter(m=>m.hp>0).map(m=>({m,distance:distance(m)})).sort((a,b)=>a.distance-b.distance),updates=new Map<string,number>();
 for(let i=0;i<ranked.length;i++){
  const {m,distance}=ranked[i],full=i<48||distance<=100||!!m.target||!!m.attackWindup||!!m.bossCast;
  if(!full&&m.aiUpdatedAt!==undefined&&now-m.aiUpdatedAt<1000)continue;
  updates.set(m.id,full?frameDt:Math.min(1,Math.max(frameDt,(now-(m.aiUpdatedAt??now))/1000)));m.aiUpdatedAt=now;
 }
 return updates;
}
