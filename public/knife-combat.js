// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Sidegrades: reach and damage trade off. Rarity improves presentation, not power.
const rows={
  default:[3.25,100,55,40,0,0],froststeel:[3.28,98,54,39,0,0],rustcopper:[3.14,106,59,43,1,0],
  aurorablade:[3.34,96,52,38,2,1],redobsidian:[3.08,110,61,44,3,1],starfall:[3.38,94,51,37,4,2],phasebreak:[3.22,102,57,41,5,2],
  'knife-draw-comet':[3.36,95,53,38,6,0],'knife-draw-tide':[3.31,97,54,39,7,0],
  'knife-draw-ember':[3.06,112,62,45,8,1],'knife-draw-ghost':[3.43,92,49,36,9,1],
  'knife-draw-thunder':[3.19,104,58,42,10,1],'knife-draw-verdant':[3.33,96,53,38,11,1],
  'knife-draw-eclipse':[3.12,108,60,43,12,2],'knife-draw-crown':[3.39,93,50,37,13,2],
  'knife-event-warrior-gold':[3.18,105,58,42,14,2],'knife-event-warrior-silver':[3.37,94,52,38,15,1],
  'knife-event-warrior-bronze':[3.10,109,60,44,16,0],'knife-event-ranked-apex':[3.40,93,51,37,17,2],
  'knife-event-breach-apex':[3.04,113,63,46,18,2]
};
export function knifeCombat(id){const r=rows[id]||rows.default;return {range:r[0],damage:{head:r[1],body:r[2],arm:r[3]},style:r[4],tier:r[5],interval:520}}
export function knifeSwingPose(id,age,combo,out={}){
  const r=rows[id]||rows.default,style=r[4],tier=r[5],t=Math.max(0,Math.min(1,age/480));
  // Wind up, cut across the screen, then recover; both combo directions
  // need lateral travel rather than simply reversing a wrist rotation.
  const active=age>=0&&age<480;
  const smooth=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u)};
  const travel=t<.2?-.42*smooth(t/.2):t<.58?-.42+1.42*smooth((t-.2)/.38):1-smooth((t-.58)/.42);
  const cut=active?travel:0;
  const envelope=active?Math.sin(Math.PI*t)**1.35:0;
  const diagonal=style%4,alternate=combo%2?-1:1,flourish=tier>0?Math.sin(t*Math.PI*(tier===2?4:2))*envelope:0;
  out.x=(diagonal===1?.55:diagonal===2?-.28:.18)*envelope+flourish*.07;
  out.y=alternate*(.32+(style%5)*.018)*cut+flourish*.04;
  out.z=alternate*(diagonal===1?.62:diagonal===3?.9:.76)*cut+flourish*(tier===2?.10:.04);
  out.dx=-alternate*(.25+(style%3)*.025)*cut;
  out.dy=-.065*cut+(diagonal===1?-.025:.025)*envelope;
  out.dz=-(.12+(style%3)*.025)*envelope;
  out.twist=tier===2?flourish*.42:tier===1?flourish*.14:0;
  out.swing=envelope;return out;
}
export const HIP_SPREAD_SCALE=.8;
export const hipCone=(spread,minimum)=>Math.max(spread,minimum)*HIP_SPREAD_SCALE;
