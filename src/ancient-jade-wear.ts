// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {jadeQualityBonus} from './ancient-jade-quality.js';
import type {AncientProfile} from './ancient-rules';
import type {JadeCollectible} from './ancient-collections';
export type JadeSlot='wrist'|'chest';
export function jadeSlot(kind:string):JadeSlot|null{return kind==='bangle'||kind==='bracelet'?'wrist':kind==='buddha'||kind==='peace'?'chest':null;}
export function equippedJade(p:AncientProfile){const result:Partial<Record<JadeSlot,JadeCollectible>>={};for(const slot of ['wrist','chest'] as const){const item=p.collections?.find(i=>i.id===p.jadeEquipped?.[slot]);if(item&&jadeSlot(item.kind)===slot)result[slot]=item;}return result;}
export function isJadeWorn(p:AncientProfile,id:string){return Object.values(equippedJade(p)).some(i=>i.id===id);}
export function jadeItemBonus(item:JadeCollectible){const value=Number.isFinite(item.value)?Math.max(0,item.value):0;return Math.min(.12,Math.log2(1+value/100)*.01)+jadeQualityBonus(item);}
export function jadeBonuses(p:AncientProfile){const items=equippedJade(p),w=items.wrist?jadeItemBonus(items.wrist):0,c=items.chest?jadeItemBonus(items.chest):0;return {attack:w,health:w*.5+c*1.5,reduction:c*.25};}
export function jadeWearRefs(p:AncientProfile){return Object.fromEntries(Object.entries(equippedJade(p)).map(([slot,item])=>[slot,item.id])) as Partial<Record<JadeSlot,string>>;}
