// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {AncientProfile} from './ancient-rules';

export const FUSION_DAMAGE_MULTIPLIER=2.8;
const fusionDamageByJob: Record<string,number>={elementalist:3.2,voidsword:3.5,abyssal:3.35,chrono:3.15};
export function fusionDamageMultiplier(job?:string){
 return fusionDamageByJob[job||'']??FUSION_DAMAGE_MULTIPLIER;
}

const growth: Record<string,number> = {
 raiseSkeleton:.055,consumeSoul:.04,necropolis:.04,
 prism:.045,judgment:.035,erosion:.06,siphon:.05,
 voidslash:.05,riftassault:.045,voiddomain:.03,execution:.032,
 abysstouch:.045,devour:.05,descent:.037,avatar:.03,
 temporalrift:.045,chronoshift:.04,rewind:.025,stasis:.022,
};
export const masteryLevel=(p:AncientProfile,id:string)=>p.mastery?.[id]?.level||1;
export const skeletonLimit=(level:number)=>Math.min(48,2+2*level);
export const skeletonSlots=(pet:{count?:number;merged?:number})=>pet.merged??pet.count??1;
export function releasableSkeletons(p:AncientProfile,state:{reserve:number[];reserveCount?:number;legion:{until:number;hp?:number;count?:number;merged?:number}[]}|undefined,now=Date.now()){
 if(!state)return 0;
 const active=state.legion.reduce((total,pet)=>total+(pet.until>now&&pet.hp!==0?skeletonSlots(pet):0),0);
 const reserve=(state.reserveCount||0)+state.reserve.length;
 return Math.max(0,Math.min(reserve,skeletonLimit(masteryLevel(p,'raiseSkeleton'))-active));
}
export const masteryCost=(id:string,level:number)=>Math.ceil((25+level*level*12)*(1+(growth[id]||0)*4));
export const masteryPower=(p:AncientProfile,id:string)=>1+(growth[id]||0)*Math.min(99,masteryLevel(p,id)-1);
export function masteryReward(player:number,monster:number,boss:boolean,elite:boolean){
 const difference=monster-player;
 if(difference<-Math.max(8,Math.ceil(player*.15)))return 0;
 const points=difference<-3?1:difference<=3?4:Math.min(10,5+Math.floor(difference/4));
 return points*(boss?8:elite?3:1);
}
export function awardMastery(p:AncientProfile,id:string,points:number){
 if(!growth[id]||points<=0)return false;
 const record=((p.mastery??={})[id]??={level:1,points:0});
 const before=record.level;
 record.points+=points;
 while(record.level<100&&record.points>=masteryCost(id,record.level)){
  record.points-=masteryCost(id,record.level++);
 }
 if(record.level>=100)record.points=0;
 return record.level>before;
}
