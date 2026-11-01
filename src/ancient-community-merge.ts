// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {CommunityMap} from './ancient-community';
const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
export function mergeCommunityDraft(base:CommunityMap,local:CommunityMap,remote:CommunityMap,preferLocal:(key:string)=>boolean=()=>true){
 const conflicts:string[]=[],map=structuredClone(remote);
 const choose=(before:unknown,mine:unknown,theirs:unknown,key:string)=>{if(equal(before,mine))return theirs;if(!equal(before,theirs)&&!equal(mine,theirs)){conflicts.push(key);return preferLocal(key)?mine:theirs}return mine};
 for(const key of ['name','boundary','spawn','sky','skyArt','code','npcs','rules','visibility'] as const)(map as any)[key]=structuredClone(choose(base[key],local[key],remote[key],key));
 for(const key of ['objects','spawns'] as const){const b=new Map(base[key].map(o=>[o.id,o])),l=new Map(local[key].map(o=>[o.id,o])),r=new Map(remote[key].map(o=>[o.id,o])),out:any[]=[];
  for(const id of new Set([...r.keys(),...l.keys(),...b.keys()])){const before=b.get(id),mine=l.get(id),theirs=r.get(id);if(!before||!mine||!theirs){const chosen=choose(before,mine,theirs,key+':'+id);if(chosen)out.push(structuredClone(chosen));continue}const value:any={...theirs};for(const field of new Set([...Object.keys(before),...Object.keys(mine),...Object.keys(theirs)])){const chosen=choose((before as any)[field],(mine as any)[field],(theirs as any)[field],key+':'+id+':'+field);if(chosen===undefined)delete value[field];else value[field]=structuredClone(chosen)}out.push(value)}(map as any)[key]=out;
 }
 return {map,conflicts};
}

export function communityChangedFields(base:CommunityMap,next:CommunityMap){const keys:string[]=[];for(const key of ['name','boundary','spawn','sky','skyArt','code','npcs','rules','visibility'] as const)if(!equal(base[key],next[key]))keys.push(key);for(const key of ['objects','spawns'] as const){const b=new Map(base[key].map(o=>[o.id,o])),n=new Map(next[key].map(o=>[o.id,o]));for(const id of new Set([...b.keys(),...n.keys()])){const old=b.get(id),value=n.get(id);if(!old||!value){keys.push(key+':'+id);continue}for(const field of new Set([...Object.keys(old),...Object.keys(value)]))if(!equal((old as any)[field],(value as any)[field]))keys.push(key+':'+id+':'+field)}}return keys}
