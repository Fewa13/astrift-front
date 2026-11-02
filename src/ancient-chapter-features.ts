// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {chapterPoint,chapterSafe,type ChapterState} from './ancient-geography.js';
export type ChapterFeature={id:string;map:string;name:[string,string];x:number;z:number;kind:'drain'|'thermal'|'wind'|'dial';index?:number;to?:{x:number;z:number}};
const at=(map:string,x:number,u:number)=>{const p=chapterPoint(map,x,u);return chapterSafe(map,p.x,p.z)};
export const CHAPTER_FEATURES:ChapterFeature[]=[{id:'tide-drain',map:'starfall',name:['开启潮汐排水阀','Open the tidal drain'],...at('starfall',-12,105),kind:'drain'},{id:'court-thermal',map:'frostcourt',name:['切换冰火回路','Switch the thermal circuit'],x:0,z:150,kind:'thermal'},
 ...[[55,85],[150,185],[250,285]].flatMap(([a,b],i)=>[{id:'wind-'+i,map:'skyreach',name:['乘上升气流','Ride the updraft'] as [string,string],...at('skyreach',0,a),kind:'wind' as const,to:at('skyreach',0,b)},{id:'wind-back-'+i,map:'skyreach',name:['乘回流风道','Ride the return current'] as [string,string],...at('skyreach',0,b),kind:'wind' as const,to:at('skyreach',0,a)}]),
 ...[[-12,225],[12,245],[0,270]].map(([x,u],i)=>({id:'sun-'+i,map:'dunes',name:[['校准黎明影针','校准正午影针','校准黄昏影针'][i],['Align Dawn Gnomon','Align Noon Gnomon','Align Dusk Gnomon'][i]] as [string,string],...at('dunes',x,u),kind:'dial' as const,index:i}))
];
export const DIAL_TARGETS=[1,3,2];
export function useChapterFeature(state:ChapterState,f:ChapterFeature,quest=false){if(f.kind==='drain')state.drained=true;if(f.kind==='thermal')state.phase=1-(state.phase||0);if(f.kind==='dial'&&!state.solved){const values=state.dials||[0,0,0];values[f.index!]=quest?DIAL_TARGETS[f.index!]:((values[f.index!]||0)+1)%4;state.dials=values;state.solved=values.every((v,i)=>v===DIAL_TARGETS[i])}return state}
export function questChapterFeature(map:string,npc:string){return CHAPTER_FEATURES.find(f=>f.map===map&&(npc==='starrecordseal'&&f.kind==='drain'||npc==='courtrepairseal'&&f.kind==='thermal'||['dunesun1seal','dunesun2seal','dunesun3seal'][f.index??-1]===npc&&f.kind==='dial'))}
