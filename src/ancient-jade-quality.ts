// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {jadeUnitPrice} from './jade/varieties.js';
// Jewelry rarity is separate from jade material grade and is rolled only on crafting.
export const JADE_QUALITIES=[['普通','Common'],['稀有','Rare'],['史诗','Epic'],['传说','Legendary'],['神话','Mythic'],['超圣','Transcendent'],['天穹','Celestial'],['太初','Primordial']];
export const JADE_QUALITY_WEIGHTS=[729000,240000,24000,5500,1200,250,45,5];
export const JADE_QUALITY_BONUS=[0,.025,.06,.13,.25,.45,.8,1.5];
export function jadeQuality(value:unknown){return typeof value==='number'&&Number.isInteger(value)&&value>=1&&value<=8?value:1;}
export function rollJadeQuality(random=Math.random){let n=Math.max(0,Math.min(1-Number.EPSILON,random()))*1000000;for(let i=0;i<JADE_QUALITY_WEIGHTS.length;i++){n-=JADE_QUALITY_WEIGHTS[i];if(n<0)return i+1}return 8;}
type QualityItem={quality?:number;qualityMin?:number;qualityMax?:number;parts?:{product:{quality?:number}}[]};
export function jadeQualitySummary(item:QualityItem){const levels=item.parts?.length?item.parts.filter(p=>p?.product).map(p=>jadeQuality(p.product.quality)):[];if(!levels.length)return {quality:jadeQuality(item.quality),qualityMin:jadeQuality(item.qualityMin??item.quality),qualityMax:jadeQuality(item.qualityMax??item.quality)};return {quality:Math.floor(levels.reduce((a,b)=>a+b,0)/levels.length),qualityMin:Math.min(...levels),qualityMax:Math.max(...levels)};}
export function jadeQualityLabel(item:QualityItem,en=false){const {quality,qualityMin,qualityMax}=jadeQualitySummary(item);return qualityMin===qualityMax?JADE_QUALITIES[quality-1][en?1:0]:(en?'Mixed: ':'混合：')+JADE_QUALITIES[qualityMin-1][en?1:0]+'–'+JADE_QUALITIES[qualityMax-1][en?1:0];}
export function jadeQualityBonus(item:QualityItem){const parts=item.parts?.filter(p=>p?.product)||[];return parts.length?parts.reduce((n,p)=>n+JADE_QUALITY_BONUS[jadeQuality(p.product.quality)-1],0)/parts.length:JADE_QUALITY_BONUS[jadeQuality(item.quality)-1];}
// Rarity multiplies the physical-material appraisal, never replaces it.
export const JADE_QUALITY_PRICE=[1,1.5,2.3,3.5,5.5,8,12,18];
export type JadePricedProduct={quality?:number;value:number;baseValue?:number;qualityPriceVersion?:number;weight?:number;purity?:number;crackCount?:number;fee?:number;blank?:{kind:string}};
type JadeMaterial={grade:number;color:number;variety?:string};
export function jadePhysicalAppraisal(p:JadePricedProduct,jade:JadeMaterial){
 const purity=Math.max(0,Math.min(1,p.purity||0)),mass=Math.max(0,p.weight||0),unit=jadeUnitPrice(jade.grade,jade.color,jade.variety),sound=jade.grade>0&&purity>=.25,premium=(p.blank?.kind==='bangle'?1.8:1.6)+purity*.6;
 // Price actual finished material, not an old quote or the depleted remainder.
 // Several fractures remain costly without repeatedly erasing 90% of all value.
 const fissures=Math.max(0,Math.floor(p.crackCount||0)),retention=Math.max(.05,Math.pow(.35,fissures));
 return Math.max(1,Math.floor((mass*unit*(.2+.8*purity)*(sound?premium:.65+purity)+(sound?(p.fee||0)*1.5:0))*retention));
}
export function priceJadeProduct(p:JadePricedProduct,jade?:JadeMaterial){if(p.qualityPriceVersion===2)return false;const canMeasure=jade&&Number.isFinite(p.weight)&&Number.isFinite(p.purity)&&p.blank;
 p.baseValue=canMeasure?jadePhysicalAppraisal(p,jade!):Number.isFinite(p.baseValue)?Math.max(1,p.baseValue!):Math.max(1,p.value);
 p.value=Math.max(1,Math.floor(p.baseValue*JADE_QUALITY_PRICE[jadeQuality(p.quality)-1]));p.qualityPriceVersion=2;return true;}
export function priceJadeCollection(item:{value:number;parts:{product:JadePricedProduct;jade?:JadeMaterial}[]}){let changed=false;for(const part of item.parts)changed=priceJadeProduct(part.product,part.jade)||changed;const value=item.parts.reduce((n,p)=>n+p.product.value,0);if(item.value!==value){item.value=value;changed=true}return changed;}
