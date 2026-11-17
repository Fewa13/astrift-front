// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
type Body={position:{x:number;z:number};floor:number;radius:number};

// Keep footprints on separate floors independent. Reserve free positions in a
// stable order so trailing units wait or step around units already in range.
export function spaceAncientUnits(bodies:Body[],canPlace:(body:Body,x:number,z:number)=>boolean){
 const placed:Body[]=[];
 for(const body of bodies){
  const {x,z}=body.position;
  const free=(nx:number,nz:number)=>placed.every(other=>Math.abs(body.floor-other.floor)>1.35||
   (nx-other.position.x)**2+(nz-other.position.z)**2>=(body.radius+other.radius)**2);
  if(!free(x,z)){
   let found=false;
   for(let ring=1;ring<=5&&!found;ring++){
    const distance=ring*Math.max(.4,body.radius*.75);
    for(let step=0;step<12;step++){
     const angle=step*Math.PI/6,nx=x+Math.cos(angle)*distance,nz=z+Math.sin(angle)*distance;
     if(!free(nx,nz)||!canPlace(body,nx,nz))continue;
     Object.assign(body.position,{x:nx,z:nz});
     found=true;
     break;
    }
   }
  }
  placed.push(body);
 }
}
