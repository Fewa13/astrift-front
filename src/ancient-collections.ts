// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {jadeQualitySummary} from './ancient-jade-quality.js';
import {jadeSlot,isJadeWorn} from './ancient-jade-wear';
export {jadeSlot,equippedJade,jadeItemBonus,jadeBonuses,isJadeWorn} from './ancient-jade-wear';
import type {AncientProfile} from './ancient-rules';
import type {JadeProduct,jadeStoneModel} from './ancient-jade-stonework';
export type JadePart={product:JadeProduct;jade:ReturnType<typeof jadeStoneModel>};
export type JadeCollectible={quality?:number;id:string;kind:'bangle'|'bead'|'bracelet'|'buddha'|'peace';size:number;parts:JadePart[];value:number;createdAt:number};
export const COLLECTION_LIMIT=256,BEAD_LIMIT=20;
export function collectionFits(items:JadeCollectible[]){return items.length<=COLLECTION_LIMIT&&items.reduce((n,i)=>n+i.parts.length,0)<=1024;}
export function collectionCommand(p:AncientProfile,action:string,d:Record<string,unknown>,reserved:(id:string)=>boolean=()=>false){
 const items=p.collections||[];
 if(action==='collectionList')return {};
 if(action==='collectionEquip'){const item=items.find(i=>i.id===d.id);if(!item)return {error:'Collection item not found'};const slot=jadeSlot(item.kind);if(!slot)return {error:'Only bangles, bracelets and pendants can be worn'};if(reserved(item.id))return {error:'Collection item is in a trade'};p.jadeEquipped={...p.jadeEquipped,[slot]:item.id};return {selected:item.id};}
 if(action==='collectionUnequip'){if(d.slot!=='wrist'&&d.slot!=='chest')return {error:'Invalid jewelry slot'};if(d.id&&p.jadeEquipped?.[d.slot]!==d.id)return {error:'Jewelry slot changed'};if(p.jadeEquipped)delete p.jadeEquipped[d.slot];return {};}
 if(action==='collectionAutoString'){
  const groups=new Map<number,JadeCollectible[]>();
  for(const item of items)if(item.kind==='bead'&&item.parts.length===1&&!reserved(item.id)){const group=groups.get(item.size)||[];group.push(item);groups.set(item.size,group);}
  const consumed=new Set<string>(),strings:JadeCollectible[]=[];
  for(const [size,beads]of [...groups].sort((a,b)=>a[0]-b[0])){
   let offset=0;while(beads.length-offset>=2){const remaining=beads.length-offset,count=remaining===BEAD_LIMIT+1?BEAD_LIMIT-1:Math.min(BEAD_LIMIT,remaining),batch=beads.slice(offset,offset+count);offset+=count;
    strings.push({id:crypto.randomUUID(),kind:'bracelet',size,parts:batch.flatMap(i=>i.parts),value:batch.reduce((n,i)=>n+i.value,0),createdAt:Date.now()});for(const bead of batch)consumed.add(bead.id);
   }
  }
  if(!strings.length)return {};for(const item of strings)item.quality=jadeQualitySummary(item).quality;
  p.collections=[...items.filter(i=>!consumed.has(i.id)),...strings];return {selected:strings[0].id};
 }
 if(action==='collectionSell'){
  const item=items.find(i=>i.id===d.id);if(!item)return {error:'Collection item not found'};if(reserved(item.id))return {error:'Collection item is in a trade'};
  if(isJadeWorn(p,item.id))return {error:'Unequip this jewelry first'};
  const coins=Math.round(p.coins*100)+item.value*100;if(!Number.isSafeInteger(coins))return {error:'Gold limit reached'};
  p.coins=coins/100;p.collections=items.filter(i=>i!==item);return {};
 }
 if(action!=='collectionString')return {error:'Invalid collection action'};
 if(!Array.isArray(d.ids)||!d.ids.length||d.ids.length>BEAD_LIMIT||d.ids.some(id=>typeof id!=='string')||new Set(d.ids).size!==d.ids.length)return {error:'Choose matching loose beads'};
 const beads=d.ids.map(id=>items.find(i=>i.id===id));if(beads.some(i=>!i||i.kind!=='bead'||i.parts.length!==1))return {error:'Choose matching loose beads'};
 const target=d.target?items.find(i=>i.id===d.target):undefined;
 if(d.target&&target?.kind!=='bracelet')return {error:'Collection item not found'};
 const size=target?.size||beads[0]!.size;if(beads.some(i=>i!.size!==size))return {error:'Bead diameters must match'};
 if((target?.parts.length||0)+beads.length>BEAD_LIMIT||!target&&beads.length<2)return {error:'Use 2 to 20 matching beads'};
 if(target&&isJadeWorn(p,target.id))return {error:'Unequip this jewelry first'};
 if([...beads,target].some(i=>i&&reserved(i.id)))return {error:'Collection item is in a trade'};
 const parts=[...(target?.parts||[]),...beads.flatMap(i=>i!.parts)],value=(target?.value||0)+beads.reduce((n,i)=>n+i!.value,0);
 const result:JadeCollectible={id:target?.id||crypto.randomUUID(),kind:'bracelet',size,parts,value,createdAt:target?.createdAt||Date.now()};
 result.quality=jadeQualitySummary(result).quality;p.collections=items.filter(i=>!beads.includes(i)&&i!==target);p.collections.push(result);return {selected:result.id};
}
