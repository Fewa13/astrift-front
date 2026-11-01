// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const MINING_IMPACT_MS=260;
const smooth=t=>{const v=Math.max(0,Math.min(1,t));return v*v*(3-2*v);};
// A short anticipation, fast diagonal strike, impact stop and slower recovery.
// Shared by the first-person tool and remote arms; no timers or allocations of meshes.
export function miningMotion(elapsed){
 const t=elapsed/650;if(t<0||t>=1)return {x:.43,y:-.4,z:-.85,rx:-.38,ry:-.12,rz:-.24,arm:-.8,impact:0};
 const up=smooth(t/.28),down=smooth((t-.28)/.12),recover=smooth((t-.47)/.53),swing=down*(1-recover),lift=up*(1-down);
 return {x:.43+lift*.14-swing*.28,y:-.4+lift*.16-swing*.12,z:-.85+lift*.12-swing*.5,rx:-.38+lift-swing*1.05,ry:-.12-lift*.22+swing*.4,rz:-.24-lift*.2+swing*.38,arm:-.8-lift*.9+swing*1.55,impact:Math.max(0,1-Math.abs(elapsed-MINING_IMPACT_MS)/65)};
}
