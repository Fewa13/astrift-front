// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {gearDefinition,GEAR_AFFIXES,type AncientGear} from './ancient-gear.js';
import type {JadeCollectible} from './ancient-collections';
export const MARKET_CATEGORIES=[['rough','原石','Rough stones'],['bangle','手镯','Bangles'],['bracelet','手串','Bracelets'],['buddha','玉佛吊坠','Jade Buddha pendants'],['peace','平安扣','Peace pendants'],['helmet','头盔','Helmets'],['armor','胸甲','Chest armor'],['weapon','武器','Weapons']] as const;
export type MarketGear={asset:'gear';id:string;kind:string;value:number;size?:never;gear:AncientGear};
export type MarketItem=JadeCollectible|MarketGear;
export function isMarketGear(item:MarketItem):item is MarketGear{return 'asset'in item&&item.asset==='gear';}
export function marketGearValue(item:AncientGear){const d=gearDefinition(item.key);if(!d)return 0;let affix=0;for(const a of item.affixes||[]){const def=GEAR_AFFIXES[a.key];if(def&&def.slots.includes(d.slot)&&Number.isFinite(a.value))affix+=Math.max(0,Math.min(1,a.value/def.max))*.12;}return Math.floor([100,1200,9000,60000,300000,1500000,4000000,10000000][d.quality-1]*(d.slot==='weapon'?1.25:d.slot==='armor'?1.1:1)*(1+affix));}
export function marketMinimumPrice(_value:number){return 1;}
export function marketGearItem(gear:AncientGear):MarketGear|null{const d=gearDefinition(gear.key);return d&&['weapon','armor','helmet'].includes(d.slot)?{asset:'gear',id:gear.id,kind:d.slot,value:marketGearValue(gear),gear:structuredClone(gear)}:null;}
