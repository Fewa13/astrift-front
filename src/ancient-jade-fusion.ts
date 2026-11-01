// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {jadeQualitySummary,priceJadeCollection,JADE_QUALITY_PRICE} from './ancient-jade-quality';
import {isJadeWorn} from './ancient-jade-wear';
import type {AncientProfile} from './ancient-rules';
import type {JadeCollectible} from './ancient-collections';
export const JADE_FUSION_COUNT=10;
const RANGES=[[.25,.7],[.18,.55],[.12,.4],[.08,.28],[.05,.18],[.025,.1],[.01,.05]];
export type JadeFusionQuote={error?:string;quality?:number;nextQuality?:number;chance?:number};
export type JadeFusionResult={error?:string;selected?:string;fusion?:{success:boolean;chance:number;quality:number;consumed:number}};
export function jadeFusionQuote(main:JadeCollectible,aux:JadeCollectible[]):JadeFusionQuote{
 const q=jadeQualitySummary(main);if(q.qualityMin!==q.qualityMax)return {error:'Fusion requires a uniform jewelry quality'};
 if(q.quality>=8)return {error:'This jewelry is already at maximum quality'};
 if(aux.length!==JADE_FUSION_COUNT||new Set(aux.map(i=>i.id)).size!==JADE_FUSION_COUNT||aux.some(i=>i.id===main.id))return {error:'Choose exactly 10 different auxiliary items'};
 if(aux.some(i=>{const a=jadeQualitySummary(i);return i.kind!==main.kind||a.qualityMin!==q.quality||a.qualityMax!==q.quality}))return {error:'Auxiliaries must match the main jewelry type and quality'};
 // Material appraisal excludes rarity. Average per bead prevents filling cheap strings
 // with more beads from masquerading as fine material. Dimensions remain part of value.
 const scores=aux.map(i=>{const copy=structuredClone(i);priceJadeCollection(copy);const physical=copy.parts.reduce((n,p)=>n+Math.max(1,p.product.baseValue||1),0)/Math.max(1,copy.parts.length);return Math.max(0,Math.min(1,Math.log10(1+physical)/6));});
 const [low,high]=RANGES[q.quality-1],score=scores.reduce((n,v)=>n+v,0)/JADE_FUSION_COUNT;
 const chance=Math.round((low+(high-low)*score)*10000)/10000;return {quality:q.quality,nextQuality:q.quality+1,chance};
}
export function fuseJade(p:AncientProfile,data:Record<string,unknown>,reserved:(id:string)=>boolean=()=>false,random=Math.random):JadeFusionResult{
 const items=p.collections||[],main=items.find(i=>i.id===data.id);
 if(!main)return {error:'Collection item not found'};
 if(!Array.isArray(data.ids)||data.ids.some(id=>typeof id!=='string'))return {error:'Choose exactly 10 different auxiliary items'};
 const aux=data.ids.map(id=>items.find(i=>i.id===id));if(aux.some(i=>!i))return {error:'Collection item not found'};
 const quote=jadeFusionQuote(main,aux as JadeCollectible[]);if(quote.error)return quote;
 if([main,...aux].some(i=>reserved(i!.id)))return {error:'Collection item is in a trade'};
 if(aux.some(i=>isJadeWorn(p,i!.id)))return {error:'Unequip auxiliary jewelry first'};
 const success=random()<quote.chance!;
 if(success){priceJadeCollection(main);for(const part of main.parts){const product=part.product;product.quality=quote.nextQuality!;product.value=Math.max(1,Math.floor(product.baseValue!*JADE_QUALITY_PRICE[quote.nextQuality!-1]));product.qualityPriceVersion=2;}main.quality=quote.nextQuality!;priceJadeCollection(main);}
 const consumed=new Set(data.ids);p.collections=items.filter(i=>!consumed.has(i.id));
 return {selected:main.id,fusion:{success,chance:quote.chance!,quality:(success?quote.nextQuality:quote.quality)!,consumed:JADE_FUSION_COUNT}};
}
