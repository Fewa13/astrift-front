// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export type StallState={at:number;x:number;z:number;y:number;sign:number;flips:number;rejected:number;cooldown?:number};
export function movementStall(previous:StallState|undefined,p:{x:number;y:number;z:number},accepted:boolean,now:number){
 if(!previous||Math.hypot(p.x-previous.x,p.z-previous.z)>.8||now-previous.at>8000)return {state:{at:now,x:p.x,z:p.z,y:p.y,sign:0,flips:0,rejected:0,cooldown:previous?.cooldown},recover:false};
 const state={...previous},dy=p.y-state.y,sign=Math.abs(dy)>.055?Math.sign(dy):0;if(sign){if(state.sign&&state.sign!==sign)state.flips++;state.sign=sign;state.y=p.y}if(!accepted)state.rejected++;
 const recover=now-state.at>=2500&&state.flips>=4&&state.rejected>=8&&now>=(state.cooldown||0);if(recover)state.cooldown=now+15000;return {state,recover};
}
export function nearestRecovery(p:{x:number;y:number;z:number},ground:(x:number,z:number,feet:number)=>number,solid:(x:number,z:number,feet:number)=>boolean,sameArea:(x:number,z:number)=>boolean=()=>true){
 const feet=p.y-1.7,candidates:{x:number;y:number;z:number;score:number;same:boolean}[]=[];for(const radius of [.5,1,1.5,2,3,4,6,8,12])for(let i=0;i<16;i++){const a=i*Math.PI/8,x=p.x+Math.cos(a)*radius,z=p.z+Math.sin(a)*radius;for(const limit of [feet,feet-1]){const floor=ground(x,z,limit);if(!Number.isFinite(floor)||floor>feet+.5||solid(x,z,floor))continue;candidates.push({x,y:floor+1.7,z,score:radius+Math.abs(floor-feet)*3,same:sameArea(x,z)})}}
 candidates.sort((a,b)=>Number(b.same)-Number(a.same)||a.score-b.score);const best=candidates[0];return best?{x:best.x,y:best.y,z:best.z}:null;
}
