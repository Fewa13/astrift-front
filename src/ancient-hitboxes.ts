// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {DUNES_KINDS} from './ancient-dunes';
import {BESTIARY} from './ancient-bestiary';
import {FOREST_KINDS} from './ancient-forest';
import {CITY_KINDS} from './ancient-city';
import {BLIGHT_KINDS} from './ancient-blight';
import {SANCTUM_KINDS} from './ancient-sanctum';
import {SKYREACH_KINDS} from './ancient-skyreach';
import {FROSTCOURT_KINDS} from './ancient-frostcourt';
import {STARFALL_KINDS} from './ancient-starfall';
// Body/head bounds follow the model primitives, not label height, weapons,
// floating halos or decorative horns. Horizontal tolerance is unchanged.
export function ancientHitbox(kind:string){
 let scale=1,height=1.78;
 const best=BESTIARY[kind];
 if(best){scale=best.size;height=kind==='oath_cavalry'?2.45:best.behavior==='wisp'?1.6:['charge','pounce','dive','shadow'].includes(best.behavior)?1.65:2.15;}
 else if(FOREST_KINDS[kind]){scale=FOREST_KINDS[kind].size;height=1.9;}
 else if(CITY_KINDS[kind]){scale=CITY_KINDS[kind].size;height=1.95;}
 else if(BLIGHT_KINDS[kind]){scale=BLIGHT_KINDS[kind].size;height=kind==='blight_beast'?1.65:2.1;}
 else if(DUNES_KINDS[kind]){scale=DUNES_KINDS[kind].size;height=kind==='dune_scarab'||kind==='glass_jackal'?1.7:2.5;}
 else if(SKYREACH_KINDS[kind]){scale=SKYREACH_KINDS[kind].size;height=2.4;}
 else if(FROSTCOURT_KINDS[kind]){scale=FROSTCOURT_KINDS[kind].size;height=2.2;}
 else if(STARFALL_KINDS[kind]){scale=STARFALL_KINDS[kind].size;height=2.2;}
 else if(SANCTUM_KINDS[kind]){scale=SANCTUM_KINDS[kind].size;height=2.15;}
 else if(kind==='hunter')height=2.18;
 else if(kind==='chief')scale=2.7;
 else if(kind==='lord')scale=3.4;
 else if(kind==='player')height=2.1;
 return {height:height*scale,radius:scale*.6};
}
// Intersect the finite vertical cylinder. Projecting onto the body centre can
// reject a valid ray at the top/bottom, especially at close range or steep pitch.
export function rayAncientHitbox(origin:{x:number;y:number;z:number},dir:number[],target:{x:number;z:number;kind:string},floor:number,range:number,padding=0){
 const bounds=ancientHitbox(target.kind),pad=Math.max(0,Math.min(.3,padding)),height=bounds.height+pad*2,radius=bounds.radius+pad;floor-=pad;const ox=origin.x-target.x,oz=origin.z-target.z;
 const horizontal=dir[0]**2+dir[2]**2,b=2*(ox*dir[0]+oz*dir[2]),c=ox**2+oz**2-radius**2;
 let lo=0,hi=range;
 if(horizontal<1e-10){if(c>0)return;}
 else{const discriminant=b*b-4*horizontal*c;if(discriminant<0)return;const root=Math.sqrt(discriminant);lo=Math.max(lo,(-b-root)/(2*horizontal));hi=Math.min(hi,(-b+root)/(2*horizontal));}
 if(Math.abs(dir[1])<1e-10){if(origin.y<floor||origin.y>floor+height)return;}
 else{const a=(floor-origin.y)/dir[1],b=(floor+height-origin.y)/dir[1];lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));}
 if(hi<lo||hi<=0)return;
 const t=Math.max(.00001,lo);if(t>hi)return;
 return {t,x:origin.x+dir[0]*t,y:origin.y+dir[1]*t,z:origin.z+dir[2]*t};
}
