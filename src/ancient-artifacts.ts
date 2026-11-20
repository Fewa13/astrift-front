// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {AncientProfile} from './ancient-rules';
export const ARTIFACTS={
 elements:{zh:'元素之心',en:'Heart of Elements',level:180,targets:['crystal_fire','crystal_water','crystal_wood','crystal_metal','crystal_earth'],job:'elementalist',color:'#ffbf65'},
 void:{zh:'虚空断刃',en:'Blade of the Void',level:200,targets:['emptyking','starbound_heart','sky_sovereign'],job:'voidsword',color:'#c086ff'},
 abyss:{zh:'深渊之心',en:'Abyssal Heart',level:200,targets:['blight_lord','immaculate_judge','furnace_regent'],job:'abyssal',color:'#ff577c'},
 hourglass:{zh:'永恒沙漏',en:'Eternal Hourglass',level:220,targets:['hourglass_regent','thunder_warden','frost_crowned'],job:'chrono',color:'#67e9ed'},
 crown:{zh:'不朽王冠',en:'Immortal Crown',level:240,targets:['buried_marshal','sky_sovereign','frost_crowned'],job:'',color:'#ffe491'},
 origin:{zh:'起源',en:'The Origin',level:300,targets:['hourglass_regent','starbound_heart','sky_sovereign'],job:'',color:'#fff7d6'},
 divinity:{zh:'破碎神格',en:'Shattered Divinity',level:280,targets:['hourglass_regent','buried_marshal','sky_sovereign','starbound_heart','furnace_regent'],job:'',color:'#f8ace9'},
};
export type ArtifactId=keyof typeof ARTIFACTS;
export type ArtifactRecord={stage:number;trail?:number;marks:Record<string,number>};
export const ARTIFACT_STAGES=[['沉睡','Dormant'],['觉醒','Awakened'],['超越','Transcendent'],['神化','Divine']];
export function artifactStage(p:AncientProfile){return p.artifactEquipped?p.artifacts?.[p.artifactEquipped]?.stage||0:0}
export function recordArtifactVictory(p:AncientProfile,kind:string,share:number){
 if(share<.35)return;
 for(const [key,spec] of Object.entries(ARTIFACTS)){
  if(p.level<spec.level||!spec.targets.includes(kind)||!artifactClueFound(p,key as ArtifactId))continue;
  const id=key as ArtifactId;
  const record=((p.artifacts??={})[id]??={stage:0,marks:{}});
  if(record.stage>0)continue;
  record.marks[kind]=Math.min(artifactRequirement(record.stage),(record.marks[kind]||0)+1);
 }
}
export function artifactRequirement(stage:number){return stage===0?1:0}
function originEligible(p:AncientProfile){
 return Object.keys(ARTIFACTS).filter(id=>id!=='origin').every(id=>p.artifacts?.[id as ArtifactId]?.stage===4)
  &&Object.values(p.mastery||{}).filter(skill=>skill.level>=20).length>=4
  &&Object.values(p.secrets||{}).filter(value=>value===2).length>=3;
}
export function completeArtifactTrial(p:AncientProfile,id:ArtifactId,expectedStage:number){
 const spec=Object.hasOwn(ARTIFACTS,id)?ARTIFACTS[id]:null, record=spec&&p.artifacts?.[id];
 if(!spec||!record||record.stage!==expectedStage||!canStartArtifactTrial(p,id))return false;
 record.stage++;record.marks={};return true;
}

export const ARTIFACT_ROUTES:Record<ArtifactId,{clue:string;mastery:number;minutes:number;guardian:string;final:string}>={
 elements:{clue:'forest',mastery:10,minutes:12,guardian:'crystal_earth',final:'crystal_fire'},
 void:{clue:'starfall',mastery:12,minutes:10,guardian:'emptyking',final:'starbound_heart'},
 abyss:{clue:'blight',mastery:12,minutes:12,guardian:'blight_lord',final:'furnace_regent'},
 hourglass:{clue:'dunes',mastery:15,minutes:5,guardian:'hourglass_regent',final:'thunder_warden'},
 crown:{clue:'frostcourt',mastery:15,minutes:12,guardian:'frost_crowned',final:'buried_marshal'},
 divinity:{clue:'skyreach',mastery:20,minutes:9,guardian:'sky_sovereign',final:'starbound_heart'},
 origin:{clue:'sanctum',mastery:20,minutes:8,guardian:'hourglass_regent',final:'starbound_heart'},
};
export function artifactClueFound(p:AncientProfile,id:ArtifactId){
 if(!Object.hasOwn(ARTIFACTS,id))return false;
 return id==='origin'?p.secrets?.sanctum===2&&originEligible(p):p.level>=ARTIFACTS[id].level||p.secrets?.[ARTIFACT_ROUTES[id].clue]===2;
}
export function canStartArtifactTrial(p:AncientProfile,id:ArtifactId){
 if(!Object.hasOwn(ARTIFACTS,id)||!artifactClueFound(p,id))return false;
 const spec=ARTIFACTS[id],record=p.artifacts?.[id],stage=record?.stage||0;
 return p.level>=spec.level&&stage<4
  &&(stage>0||(record?.trail||0)>=ARTIFACT_TRAILS[id].length)
  &&Object.values(p.mastery||{}).some(skill=>skill.level>=ARTIFACT_ROUTES[id].mastery+stage*5)
  &&spec.targets.every(kind=>(record?.marks[kind]||0)>=artifactRequirement(stage));
}

export const ARTIFACT_COMBAT={
 survivalCooldown:180000,crownWeakness:6000,crownDamageScale:.75,
 voidRiftRadius:6,voidRiftTicks:3,voidRiftInterval:700,voidRiftDamage:.42,
 chronoAnchorExtension:2000,chronoEchoMultiplier:1.3,
 abyssHealingDuration:5000,abyssHealingMultiplier:1.12,
};

// Relative search offsets keep the trail anchored to each map's hidden relic.
export const ARTIFACT_TRAILS:Record<ArtifactId,readonly (readonly [number,number])[]>={
 elements:[[9,0]],void:[[0,-12]],abyss:[[-12,-4]],
 hourglass:[[0,14]],crown:[[-10,13]],
 divinity:[[14,-6]],origin:[[0,-9]],
};
export function artifactTrailPoint(id:ArtifactId,index:number,origin:{x:number;z:number},safe:(x:number,z:number)=>boolean){
 const offset=ARTIFACT_TRAILS[id][index];if(!offset)return null;
 for(let i=0;i<12;i++){
  const angle=i*Math.PI/6;
  const x=origin.x+offset[0]*Math.cos(angle)-offset[1]*Math.sin(angle);
  const z=origin.z+offset[0]*Math.sin(angle)+offset[1]*Math.cos(angle);
  if(safe(x,z))return {x,z};
 }
 return null;
}
