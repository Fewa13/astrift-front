// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {newExtractionState,GUN_PRICES,ARMOR_PRICES,HELMET_PRICES,LOOT_BY_ID,ammoPrice,partPrice,refreshDaily} from './extraction-economy.js?v=20261008-7';
export const MEDICAL_PRICES={bandage:75,medkit:180,injector:300};
export const ARMOR_NAMES={light:'轻型护甲',medium:'复合护甲',heavy:'重型护甲'};
export const HELMET_NAMES={scout:'侦察头盔',composite:'复合头盔',fortress:'堡垒头盔'};
const uid=()=>crypto.randomUUID();
export function item(kind,data={}){return {id:uid(),kind,...structuredClone(data)}}
export function value(i){if(i.kind==='weapon')return (GUN_PRICES[i.weapon]||0)+Object.entries(i.mods||{}).reduce((s,[slot,id])=>s+partPrice(slot,id),0);if(i.kind==='armor')return ARMOR_PRICES[i.type]||0;if(i.kind==='helmet')return HELMET_PRICES[i.type]||0;if(i.kind==='ammo')return i.quantity*ammoPrice(i.weapon,i.type);return MEDICAL_PRICES[i.type]||LOOT_BY_ID[i.type]?.value||0}
export function saleValue(i){return i.free?0:Math.floor(value(i)*(i.kind==='valuable'?1:.8))}
export function addItems(dest,items,capacity=Infinity){
  const copy=structuredClone(dest);
  for(const source of items){if(source.kind!=='ammo'){copy.push(structuredClone(source));continue}let n=source.quantity;if(!Number.isInteger(n)||n<=0)throw Error('弹药数量无效');for(const stack of copy){if(stack.kind!=='ammo'||stack.weapon!==source.weapon||stack.type!==source.type||!!stack.free!==!!source.free)continue;const move=Math.min(30-stack.quantity,n);stack.quantity+=move;n-=move;if(!n)break}while(n>0){const move=Math.min(30,n);copy.push(item('ammo',{weapon:source.weapon,type:source.type||'',quantity:move,free:!!source.free}));n-=move}}
  if(copy.length>capacity)throw Error('存储空间已满');dest.splice(0,dest.length,...copy);return dest;
}
export function migrateInventory(raw){
  if(raw?.version===2&&Array.isArray(raw.inventory)){raw.equipped??={weapon:null,armor:null,helmet:null};raw.packed??=[];return raw}
  const s=newExtractionState();if(!raw||raw.version!==1)return s;
  Object.assign(s,{credits:raw.credits,day:raw.day,freeUsed:raw.freeUsed,stats:raw.stats});
  for(const k of raw.inventory||[]){const w=item('weapon',{weapon:k.weapon,mods:k.mods||{},free:!!k.free});s.inventory.push(w);if(k.armor!=='none')s.inventory.push(item('armor',{type:k.armor,free:!!k.free}));if(k.helmet!=='none')s.inventory.push(item('helmet',{type:k.helmet,free:!!k.free}));if(k.ammo)addItems(s.inventory,[item('ammo',{weapon:k.weapon,type:Object.entries(k.mods||{}).find(([slot])=>/弹药|弹头/.test(slot))?.[1]||'',quantity:k.ammo,free:!!k.free})]);if(!s.equipped.weapon)s.equipped.weapon=w.id}
  for(const type of raw.warehouse||[])if(LOOT_BY_ID[type])s.inventory.push(item(LOOT_BY_ID[type].heal?'medical':'valuable',{type}));
  for(const type of raw.packed||[])if(LOOT_BY_ID[type]){const i=item('medical',{type});s.inventory.push(i);s.packed.push(i.id)}
  // A legacy active raid stays recoverable rather than refunding entry equipment.
  if(raw.raid){const r=raw.raid,w=item('weapon',{weapon:r.kit.weapon,mods:r.kit.mods||{},free:!!r.kit.free});r.gear={weapon:w,armor:r.kit.armor==='none'?null:item('armor',{type:r.kit.armor,free:!!r.kit.free}),helmet:r.kit.helmet==='none'?null:item('helmet',{type:r.kit.helmet,free:!!r.kit.free})};r.bag=r.bag.map(type=>item(LOOT_BY_ID[type]?.heal?'medical':'valuable',{type}));r.loadedType=Object.entries(w.mods).find(([slot])=>/弹药|弹头/.test(slot))?.[1]||'';s.raid=r}return s;
}
export function upgradeCost(old,mods){let spend=0,refund=0;for(const slot of new Set([...Object.keys(old.mods),...Object.keys(mods)])){if(old.mods[slot]===mods[slot])continue;spend+=partPrice(slot,mods[slot]);refund+=Math.floor(partPrice(slot,old.mods[slot])*.8)}return {spend,refund,total:spend-refund}}
export function inventoryAction(s,a){
  if(s.raid)throw Error('先完成当前搜打撤');refreshDaily(s);
  const spend=n=>{if(s.credits<n)throw Error('信用点不足');s.credits-=n};
  if(a.kind==='free'){if(s.freeUsed>=10)throw Error('今日免费套装已用完');const w=item('weapon',{weapon:'redline',mods:{},free:true});addItems(s.inventory,[w,item('ammo',{weapon:'redline',type:'',quantity:90,free:true})],500);s.freeUsed++;s.equipped.weapon=w.id;s.packed.push(...s.inventory.filter(i=>i.kind==='ammo'&&i.free&&i.weapon==='redline'&&!s.packed.includes(i.id)).slice(-3).slice(0,Math.max(0,20-s.packed.length)).map(i=>i.id))}
  else if(a.kind==='buy'){if(!GUN_PRICES[a.weapon])throw Error('武器无效');spend(GUN_PRICES[a.weapon]);s.inventory.push(item('weapon',{weapon:a.weapon,mods:{}}))}
  else if(a.kind==='preset'){const k=a.kit,price=(GUN_PRICES[k.weapon]||0)+Object.entries(k.mods).reduce((n,[slot,id])=>n+partPrice(slot,id),0)+(ARMOR_PRICES[k.armor]||0)+(HELMET_PRICES[k.helmet]||0)+k.ammo*ammoPrice(k.weapon);spend(price);s.inventory.push(item('weapon',{weapon:k.weapon,mods:k.mods}),item('armor',{type:k.armor}),item('helmet',{type:k.helmet}));addItems(s.inventory,[item('ammo',{weapon:k.weapon,type:'',quantity:k.ammo})])}
  else if(a.kind==='buyEquipment'){const prices=a.category==='armor'?ARMOR_PRICES:a.category==='helmet'?HELMET_PRICES:MEDICAL_PRICES;if(!prices[a.type])throw Error('装备无效');spend(prices[a.type]);s.inventory.push(item(a.category,{type:a.type}))}
  else if(a.kind==='ammo'){if(!GUN_PRICES[a.weapon]||!Number.isInteger(a.quantity)||a.quantity<1||a.quantity>600)throw Error('弹药无效');spend(a.quantity*ammoPrice(a.weapon,a.type));addItems(s.inventory,[item('ammo',{weapon:a.weapon,type:a.type||'',quantity:a.quantity})])}
  else if(a.kind==='equip'){const i=s.inventory.find(i=>i.id===a.id);if(!i||!['weapon','armor','helmet'].includes(i.kind))throw Error('装备不存在');s.equipped[i.kind]=i.id;if(i.kind==='weapon')s.packed=s.packed.filter(id=>{const p=s.inventory.find(i=>i.id===id);return p&&!(p.kind==='ammo'&&p.weapon!==i.weapon)})}
  else if(a.kind==='pack'){const i=s.inventory.find(i=>i.id===a.id),w=s.inventory.find(i=>i.id===s.equipped.weapon);if(!i||!['medical','ammo'].includes(i.kind)||i.kind==='ammo'&&i.weapon!==w?.weapon)throw Error('只能携带已装备武器的弹药');if(s.packed.includes(i.id))s.packed=s.packed.filter(id=>id!==i.id);else{if(s.packed.length>=20)throw Error('背包只有20格');s.packed.push(i.id)}}
  else if(a.kind==='upgrade'){const w=s.inventory.find(i=>i.id===a.id&&i.kind==='weapon');if(!w)throw Error('武器不存在');const c=upgradeCost(w,a.mods);spend(c.total);w.mods=structuredClone(a.mods)}
  else if(a.kind==='sell'){const ids=new Set(a.ids||[]),chosen=s.inventory.filter(i=>ids.has(i.id));if(!chosen.length)throw Error('请选择物品');if(chosen.some(i=>i.free))throw Error('装备券物品不能出售');s.credits+=chosen.reduce((n,i)=>n+saleValue(i),0);s.inventory=s.inventory.filter(i=>!ids.has(i.id));s.packed=s.packed.filter(id=>!ids.has(id));for(const key of Object.keys(s.equipped))if(ids.has(s.equipped[key]))s.equipped[key]=null}
  else throw Error('未知操作');return s;
}
export function beginRaid(s,now=Date.now()){
  if(s.raid)throw Error('已有未完成对局');const weapon=s.inventory.find(i=>i.id===s.equipped.weapon);if(!weapon)throw Error('请先装备武器');
  const gear=Object.fromEntries(['weapon','armor','helmet'].map(k=>[k,structuredClone(s.inventory.find(i=>i.id===s.equipped[k])||null)]));const bag=s.inventory.filter(i=>s.packed.includes(i.id)&&['ammo','medical'].includes(i.kind));if(!bag.some(i=>i.kind==='ammo'&&i.weapon===weapon.weapon))throw Error('请携带武器弹药');
  if(bag.length>20)throw Error('背包只有20格');const ids=new Set([...Object.values(gear).filter(Boolean).map(i=>i.id),...bag.map(i=>i.id)]);s.inventory=s.inventory.filter(i=>!ids.has(i.id));s.packed=[];s.equipped={weapon:null,armor:null,helmet:null};s.stats.raids++;
  s.raid={id:uid(),started:now,ends:now+1200000,gear,bag:structuredClone(bag),opened:[],drops:[],hp:100,ammo:0,reserve:0,loadedType:'',position:null,bots:null,kit:{weapon:weapon.weapon,mods:weapon.mods,armor:gear.armor?.type||'none',helmet:gear.helmet?.type||'none',ammo:0}};return s.raid;
}
export function detachAmmo(raid,ammo,reserve){const n=Math.max(0,Math.floor(ammo+reserve));if(n)addItems(raid.bag,[item('ammo',{weapon:raid.kit.weapon,type:raid.loadedType||'',quantity:n,free:!!raid.ammoFree})]);raid.ammo=raid.reserve=0}
export function settleRaid(s,won){const r=s.raid;if(!r)return null;const items=[...Object.values(r.gear).filter(Boolean),...r.bag];if(won){addItems(s.inventory,items);s.stats.extracted++}else s.stats.lost++;s.raid=null;return {won,items,value:items.reduce((n,i)=>n+value(i),0)}}
