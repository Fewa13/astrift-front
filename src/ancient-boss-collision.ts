// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Body volumes only: horns, weapons and spell effects do not become invisible walls.
export const BOSS_BODIES:Record<string,{radius:number;height:number}>={
 chief:{radius:1.65,height:4.5},lord:{radius:2.05,height:5.8},rootwarden:{radius:2.3,height:7},
 crystal_metal:{radius:2.7,height:8},crystal_wood:{radius:2.7,height:8},crystal_water:{radius:2.7,height:8},crystal_fire:{radius:2.7,height:8},crystal_earth:{radius:2.7,height:8},
 oathknight:{radius:1.45,height:4.6},emptyking:{radius:2.3,height:7},blight_lord:{radius:2.5,height:7.5},immaculate_judge:{radius:2.3,height:7}
};
type Body={kind:string;x:number;z:number;hp:number};
// Temporarily disabled for walking and dashes on both client and server.
export const BOSS_BODY_COLLISION_ENABLED=false;
export function bossBodyPathBlocked(ax:number,az:number,bx:number,bz:number,feet:number,bodies:Iterable<Body>,ground:(x:number,z:number)=>number,r=.6){
 if(!BOSS_BODY_COLLISION_ENABLED)return false;
 const dx=bx-ax,dz=bz-az,length=dx*dx+dz*dz;
 for(const m of bodies){const body=BOSS_BODIES[m.kind];if(!body||m.hp<=0)continue;const floor=ground(m.x,m.z);if(feet>=floor+body.height||feet+1.7<=floor)continue;
  const radius=body.radius+r,sx=ax-m.x,sz=az-m.z,start=sx*sx+sz*sz,end=(bx-m.x)**2+(bz-m.z)**2;
  // If a moving boss overlaps us, allow escape, but never travel deeper through it.
  if(start<radius*radius-.0001){if(end>start+.000001&&sx*dx+sz*dz>=-.000001)continue;return true}
  const t=length?Math.max(0,Math.min(1,-(sx*dx+sz*dz)/length)):0;
  if((sx+dx*t)**2+(sz+dz*t)**2<radius*radius-.0001)return true;
 }return false;
}
