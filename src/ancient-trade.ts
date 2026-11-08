// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {CLIENT_RELEASE} from './client-release';
import {isJadeWorn} from './ancient-jade-wear';
import type {AncientProfile} from './ancient-rules';
import {collectionFits} from './ancient-collections';
type Item={type:'gear'|'material'|'potion'|'collection';id:string;quantity:number};
type Offer={coins:number;items:Item[];confirmed:boolean;confirmedVersion?:string};
type Deal={id:string;players:string[];accepted:boolean;expires:number;offers:Record<string,Offer>;revision:number};
export class AncientTrade{
 constructor(private sql:SqlStorage,private read:(name:string)=>AncientProfile,private save:(name:string,p:AncientProfile)=>void,private online:()=>{name:string;map:string;seen:number}[]){sql.exec('CREATE TABLE IF NOT EXISTS ancient_trades(id TEXT PRIMARY KEY,data TEXT NOT NULL)')}
 private deals(){return this.sql.exec<{data:string}>('SELECT data FROM ancient_trades').toArray().map(r=>JSON.parse(r.data) as Deal)}
 private current(name:string){this.sql.exec("DELETE FROM ancient_trades WHERE json_extract(data,'$.expires')<?",Date.now());return this.deals().find(d=>d.players.includes(name))}
 private put(d:Deal){this.sql.exec('INSERT INTO ancient_trades VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data',d.id,JSON.stringify(d))}
 reservedCollections(name:string){return new Set((this.current(name)?.offers[name]?.items||[]).filter(i=>i.type==='collection').map(i=>i.id));}
 reservedCollection(name:string,id:string){return this.reservedCollections(name).has(id);}
 reservedItem(name:string,id:string,type:string){return (this.current(name)?.offers[name]?.items||[]).some(i=>i.id===id&&i.type===type);}
 private peers(name:string){const list=this.online(),me=list.find(p=>p.name===name);return me?list.filter(p=>p.name!==name&&p.map===me.map&&p.map!=='lobby'):[]}
 state(name:string){let d=this.current(name);if(d){d=structuredClone(d);for(const offer of Object.values(d.offers))offer.confirmed=offer.confirmed&&offer.confirmedVersion===CLIENT_RELEASE;for(const n of d.players)for(const item of d.offers[n].items)if(item.type==='collection'){Object.assign(item,{collectible:this.read(n).collections?.find(i=>i.id===item.id)})}else if(item.type==='gear'){const gear=this.read(n).gear?.find(g=>g.id===item.id);Object.assign(item,{key:gear?.key,affixes:gear?.affixes})}}return {deal:d||null,players:this.peers(name).map(p=>p.name)}}
 private valid(p:AncientProfile,o:Offer){if(!Number.isFinite(o.coins)||o.coins<0||o.coins>p.coins)return false;const ids=new Set<string>();for(const item of o.items){if(!item||typeof item!=='object'||!['gear','material','potion','collection'].includes(item.type)||typeof item.id!=='string'||!item.id||item.id.length>160||!Number.isSafeInteger(item.quantity)||item.quantity<1)return false;const key=item.type+':'+item.id;if(ids.has(key))return false;ids.add(key);if(item.type==='collection'){if(item.quantity!==1||isJadeWorn(p,item.id)||!p.collections?.some(i=>i.id===item.id))return false}else if(item.type==='gear'){if(item.quantity!==1||!p.gear?.some(g=>g.id===item.id&&!g.locked)||Object.values(p.gearEquipped||{}).includes(item.id))return false}else if(!Object.hasOwn(item.type==='material'?p.materials:p.potions,item.id)||(item.type==='material'?p.materials:p.potions)[item.id]<item.quantity)return false}return true}
 command(name:string,action:string,data:Record<string,unknown>){
  if(action==='tradeState')return null;
  let d=this.current(name);
  if(action==='tradeInvite'){const target=String(data.target||'').toLowerCase();if(d||this.current(target))return '已有进行中的交易';if(!this.peers(name).some(p=>p.name===target))return '玩家不在同一地图';d={id:crypto.randomUUID(),players:[name,target],accepted:false,expires:Date.now()+60000,revision:1,offers:Object.fromEntries([name,target].map(n=>[n,{coins:0,items:[],confirmed:false}]))};this.put(d);return null}
  if(!d||data.id!==d.id)return '交易已结束或过期';
  if(action==='tradeCancel'){this.sql.exec('DELETE FROM ancient_trades WHERE id=?',d.id);return null}
  if(action==='tradeAccept'){if(!this.peers(name).some(p=>d!.players.includes(p.name)))return '对方已离开地图';if(d.players[1]!==name||d.accepted)return '邀请不可接受';d.accepted=true;d.expires=Date.now()+300000;this.put(d);return null}
  if(!d.accepted)return '请先接受交易邀请';
  if(!this.peers(name).some(p=>d!.players.includes(p.name))){this.sql.exec('DELETE FROM ancient_trades WHERE id=?',d.id);return '对方已离开地图'}
  if(Number(data.revision)!==d.revision)return '交易内容已更改，请重新确认';
  if(action==='tradeOffer'){if(!Array.isArray(data.items)||data.items.length>25)return '交易物品无效';const offer={coins:Math.round(Number(data.coins)*100)/100,items:data.items as Item[],confirmed:false};if(!this.valid(this.read(name),offer))return '金币或物品不足，请先卸下并解锁装备';d.offers[name]=offer;for(const n of d.players)d.offers[n].confirmed=false;d.revision++;d.expires=Date.now()+300000;this.put(d);return null}
  if(action!=='tradeConfirm')return '操作无效';
  const profiles=d.players.map(n=>structuredClone(this.read(n)));
  if(d.players.some((n,i)=>!this.valid(profiles[i],d!.offers[n]))){for(const n of d.players)d.offers[n].confirmed=false;d.revision++;this.put(d);return '金币或物品不足，请重新修改报价';}
  d.offers[name].confirmed=true;d.offers[name].confirmedVersion=CLIENT_RELEASE;if(!d.players.every(n=>d!.offers[n].confirmed&&d!.offers[n].confirmedVersion===CLIENT_RELEASE)){this.put(d);return null}
  for(let i=0;i<2;i++){const p=profiles[i],other=profiles[1-i],offer=d.offers[d.players[i]];p.coins=Math.round((p.coins-offer.coins)*100)/100;other.coins=Math.round((other.coins+offer.coins)*100)/100;for(const item of offer.items){if(item.type==='collection'){const at=p.collections!.findIndex(i=>i.id===item.id);(other.collections??=[]).push(p.collections!.splice(at,1)[0]);}else if(item.type==='gear'){const at=p.gear!.findIndex(g=>g.id===item.id);(other.gear??=[]).push(p.gear!.splice(at,1)[0])}else{const src=item.type==='material'?p.materials:p.potions,dst=item.type==='material'?other.materials:other.potions;src[item.id]-=item.quantity;dst[item.id]=(Object.hasOwn(dst,item.id)?dst[item.id]:0)+item.quantity;if(!Number.isSafeInteger(dst[item.id]))return '物品数量过大'}}}
  if(profiles.some(p=>!collectionFits(p.collections||[])||(p.gear?.length||0)>1000||!Number.isSafeInteger(Math.round(p.coins*100))))return '库存或金币已达上限';
  for(let i=0;i<2;i++)this.save(d.players[i],profiles[i]);this.sql.exec('DELETE FROM ancient_trades WHERE id=?',d.id);return null;
 }
}
