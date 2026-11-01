// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {grantGearBonusAffix} from './ancient-gear';
import {jadeQualitySummary,priceJadeCollection} from './ancient-jade-quality';
import {marketGearItem,isMarketGear,MARKET_CATEGORIES,type MarketItem} from './ancient-market-rules';
import {isJadeWorn} from './ancient-jade-wear';
import type {AncientProfile} from './ancient-rules';
import {collectionFits,type JadeCollectible} from './ancient-collections';
import {roughPublic,roughMarketTransfer,roughMarketProbe} from './ancient-rough-market';
import type {StoneworkState} from './ancient-stonework';

type ListingRow={id:string;seller:string;item_id:string;kind:string;price:number;created:number;data:string};
type Result={error?:string;selected?:string;changed?:string[]};
export const MARKET_PAGE_SIZE=12,MARKET_SELLER_LIMIT=20,MARKET_MAX_PRICE=1_000_000_000;
// Profiles, escrow and payment receipts share this world's SQLite transaction.
// Never await between the debit, credit, ownership transfer and listing deletion.
export class AncientMarket{
 constructor(private sql:SqlStorage,private read:(name:string)=>AncientProfile,private save:(name:string,p:AncientProfile)=>void,private reserved:(name:string,id:string,asset?:string)=>boolean,private stones:(n:string)=>StoneworkState=()=>({stones:[],receipts:[]}),private saveStones:(n:string,s:StoneworkState)=>void=()=>{}){
  sql.exec('CREATE TABLE IF NOT EXISTS ancient_market(id TEXT PRIMARY KEY,seller TEXT NOT NULL,item_id TEXT UNIQUE NOT NULL,kind TEXT NOT NULL,price INTEGER NOT NULL,created INTEGER NOT NULL,data TEXT NOT NULL)');
  sql.exec('CREATE INDEX IF NOT EXISTS ancient_market_seller ON ancient_market(seller,created DESC)');
  sql.exec('CREATE INDEX IF NOT EXISTS ancient_market_created ON ancient_market(created DESC,id)');
  sql.exec('CREATE INDEX IF NOT EXISTS ancient_market_kind ON ancient_market(kind,created DESC)');
  sql.exec('CREATE INDEX IF NOT EXISTS ancient_market_price ON ancient_market(price,id)');
  sql.exec('CREATE TABLE IF NOT EXISTS ancient_market_receipts(name TEXT NOT NULL,request_id TEXT NOT NULL,signature TEXT NOT NULL,listing TEXT NOT NULL,created INTEGER NOT NULL,PRIMARY KEY(name,request_id))');
  // Upgrade escrowed equipment in place, preserving seller, listing ID and asking price.
  for(const row of sql.exec<{id:string;data:string}>("SELECT id,data FROM ancient_market WHERE kind IN ('weapon','helmet','armor')").toArray()){
   const item=JSON.parse(row.data) as MarketItem;if(isMarketGear(item)&&grantGearBonusAffix(item.gear))sql.exec('UPDATE ancient_market SET data=? WHERE id=?',JSON.stringify({...item,...marketGearItem(item.gear)}),row.id);
  }
  sql.exec("UPDATE ancient_market SET price=MAX(1,CAST((json_extract(data,'$.value')*2+2)/3 AS INTEGER)) WHERE price<MAX(1,CAST((json_extract(data,'$.value')*2+2)/3 AS INTEGER))");
 }
 private row(id:unknown){return typeof id==='string'?this.sql.exec<ListingRow>('SELECT * FROM ancient_market WHERE id=?',id).toArray()[0]:undefined;}
 private pricedItem(data:string){const item=JSON.parse(data) as MarketItem;if(!isMarketGear(item))priceJadeCollection(item);return item;}
 private summary(r:ListingRow){if(r.kind==='rough')return {id:r.id,seller:r.seller,price:r.price,created:r.created,item:roughPublic(JSON.parse(r.data).stone)};const item=this.pricedItem(r.data);return {id:r.id,seller:r.seller,price:r.price,created:r.created,item:{id:item.id,kind:item.kind,size:item.size,value:item.value,...(isMarketGear(item)?{asset:'gear',gear:item.gear}:{...jadeQualitySummary(item),count:item.parts.length,material:item.parts[0]?.jade.variety,grade:item.parts[0]?.jade.grade,fissured:item.parts.some(p=>p.product.crackCount>0)})}};}
 inspect(id:unknown){const r=this.row(id);return r?{...this.summary(r),item:r.kind==='rough'?roughPublic(JSON.parse(r.data).stone):this.pricedItem(r.data)}:null;}
 probe(name:string,d:Record<string,unknown>){return roughMarketProbe(this.row(d.id),this.read(name),d);}
 state(name:string,d:Record<string,unknown>){
  const own=d.own===true,kind=[...MARKET_CATEGORIES.map(c=>c[0]),'bead'].includes(String(d.kind))?String(d.kind):'',where=[...(own?['seller=?']:[]),...(kind?['kind=?']:[])],args=[...(own?[name]:[]),...(kind?[kind]:[])],clause=where.length?' WHERE '+where.join(' AND '):'';
  const total=this.sql.exec<{n:number}>('SELECT COUNT(*) AS n FROM ancient_market'+clause,...args).toArray()[0].n,pages=Math.max(1,Math.ceil(total/MARKET_PAGE_SIZE)),page=Math.min(pages-1,Math.max(0,Number.isSafeInteger(d.page)?Number(d.page):0));
  const order=d.sort==='low'?'price ASC,created DESC,id':d.sort==='high'?'price DESC,created DESC,id':'created DESC,id';
  const listings=this.sql.exec<ListingRow>('SELECT * FROM ancient_market'+clause+' ORDER BY '+order+' LIMIT ? OFFSET ?',...args,MARKET_PAGE_SIZE,page*MARKET_PAGE_SIZE).toArray().map(r=>this.summary(r));
  const mine=this.sql.exec<{n:number}>('SELECT COUNT(*) AS n FROM ancient_market WHERE seller=?',name).toArray()[0].n;
  return {listings,total,pages,page,mine,limit:MARKET_SELLER_LIMIT,maxPrice:MARKET_MAX_PRICE,categories:MARKET_CATEGORIES};
 }
 command(name:string,action:string,d:Record<string,unknown>):Result{
  if(action==='marketList')return {};
  if(action==='marketInspect')return this.row(d.id)?{selected:String(d.id)}:{error:'This listing is no longer available'};
  if(!['marketSell','marketBuy','marketCancel'].includes(action))return {error:'Invalid market action'};
  const requestId=d.requestId;if(typeof requestId!=='string'||!/^[-a-zA-Z0-9]{16,80}$/.test(requestId))return {error:'Invalid market request'};
  const signature=JSON.stringify([action,d.id??null,d.price??null,...(d.asset?[d.asset]:[])]);
  const receipt=this.sql.exec<{signature:string;listing:string}>('SELECT signature,listing FROM ancient_market_receipts WHERE name=? AND request_id=?',name,requestId).toArray()[0];
  if(receipt)return receipt.signature===signature?{selected:action==='marketSell'?receipt.listing:undefined,changed:[]}:{error:'Market request has changed'};
  if(d.asset==='rough'||this.row(d.id)?.kind==='rough'){
   if(action==='marketSell'&&(!Number.isSafeInteger(d.price)||Number(d.price)<1||Number(d.price)>MARKET_MAX_PRICE))return {error:'Enter a whole Gold price from 1 to 1,000,000,000'};
   const result=roughMarketTransfer(this.sql,this.read,this.save,this.stones,this.saveStones,name,action,d,this.row(d.id));if(result.error)return result;
   this.sql.exec('INSERT INTO ancient_market_receipts VALUES(?,?,?,?,?)',name,requestId,signature,result.selected||String(d.id||''),Date.now());return result;
  }
  const p=structuredClone(this.read(name));let listingId='',changed=[name];
  if(action==='marketSell'){
   const gear=d.asset==='gear'?p.gear?.find(g=>g.id===d.id):undefined,item:MarketItem|undefined=d.asset==='gear'?(gear&&marketGearItem(gear)||undefined):p.collections?.find(i=>i.id===d.id);if(!item)return {error:'Collection item not found'};if(isMarketGear(item)){if(item.gear.locked||Object.values(p.gearEquipped||{}).includes(item.id))return {error:'Unequip and unlock this equipment first'};}else if(isJadeWorn(p,item.id))return {error:'Unequip this jewelry first'};
   if(this.reserved(name,item.id,isMarketGear(item)?'gear':'collection'))return {error:'Remove this collection from the trade first'};
   if(!Number.isSafeInteger(d.price)||Number(d.price)<1||Number(d.price)>MARKET_MAX_PRICE)return {error:'Enter a whole Gold price from 1 to 1,000,000,000'};

   const count=this.sql.exec<{n:number}>('SELECT COUNT(*) AS n FROM ancient_market WHERE seller=?',name).toArray()[0].n;if(count>=MARKET_SELLER_LIMIT)return {error:'You can list up to 20 collections'};
   if(this.sql.exec<{id:string}>('SELECT id FROM ancient_market WHERE item_id=?',item.id).toArray().length)return {error:'This collection is already listed'};
   listingId=crypto.randomUUID();this.sql.exec('INSERT INTO ancient_market VALUES(?,?,?,?,?,?,?)',listingId,name,item.id,item.kind,Number(d.price),Date.now(),JSON.stringify(item));
   if(isMarketGear(item))p.gear=p.gear!.filter(i=>i.id!==item.id);else p.collections=p.collections!.filter(i=>i.id!==item.id);this.save(name,p);
  }else{
   const listing=this.row(d.id);if(!listing)return {error:'This listing is no longer available'};listingId=listing.id;
   const item=this.pricedItem(listing.data);
   if((isMarketGear(item)?p.gear:p.collections)?.some(i=>i.id===item.id))return {error:'Collection ownership conflict'};
   if(isMarketGear(item)?(p.gear?.length||0)>=1000:!collectionFits([...(p.collections||[]),item]))return {error:'Collections are full; free some space first'};
   if(action==='marketCancel'){
    if(listing.seller!==name)return {error:'Only the seller can remove this listing'};
   }else{
    if(listing.seller===name)return {error:'You cannot buy your own listing'};
    if(d.price!==listing.price)return {error:'Listing price changed; refresh before buying'};
    const funds=Math.round(p.coins*100),cost=listing.price*100;if(!Number.isSafeInteger(funds)||funds<cost)return {error:'Not enough Ancient Gold'};
    const seller=structuredClone(this.read(listing.seller)),credit=Math.round(seller.coins*100)+cost;if(!Number.isSafeInteger(credit))return {error:'Seller Gold limit reached'};
    p.coins=(funds-cost)/100;seller.coins=credit/100;this.save(listing.seller,seller);changed.push(listing.seller);
   }
   if(isMarketGear(item))(p.gear??=[]).push(item.gear);else(p.collections??=[]).push(item);this.save(name,p);this.sql.exec('DELETE FROM ancient_market WHERE id=?',listing.id);
  }
  this.sql.exec('INSERT INTO ancient_market_receipts VALUES(?,?,?,?,?)',name,requestId,signature,listingId,Date.now());
  return {selected:action==='marketSell'?listingId:undefined,changed};
 }
}
