// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {stoneView,stoneworkCommand,type Stone,type StoneworkState} from './ancient-stonework';
import type {AncientProfile} from './ancient-rules';
export type RoughListing={id:string;seller:string;price:number;created:number;data:string};
export const roughPublic=(s:Stone)=>({asset:'rough' as const,id:s.id,kind:'rough',stone:{...stoneView(s),lit:true,cost:0}});
export function roughMarketProbe(row:RoughListing|undefined,p:AncientProfile,d:Record<string,unknown>){if(!row)return {error:'This listing is no longer available'};const item=JSON.parse(row.data);if(item.asset!=='rough')return {error:'Invalid stone request'};return stoneworkCommand(p,{stones:[{...item.stone,lit:true}],receipts:[]},'stoneProbe',{...d,id:item.stone.id});}
export function roughMarketTransfer(sql:SqlStorage,read:(n:string)=>AncientProfile,save:(n:string,p:AncientProfile)=>void,stones:(n:string)=>StoneworkState,saveStones:(n:string,s:StoneworkState)=>void,name:string,action:string,d:Record<string,unknown>,row?:RoughListing){
 const p=structuredClone(read(name)),state=stones(name);let id='',changed=[name];
 if(action==='marketSell'){
  const s=state.stones.find(s=>s.id===d.id);if(!s||s.cut||s.window)return {error:'Only unopened rough stones can be listed'};
  if(sql.exec('SELECT id FROM ancient_market WHERE item_id=?',s.id).toArray().length)return {error:'This collection is already listed'};
  if(sql.exec<{n:number}>('SELECT COUNT(*) AS n FROM ancient_market WHERE seller=?',name).toArray()[0].n>=20)return {error:'You can list up to 20 collections'};
  id=crypto.randomUUID();sql.exec('INSERT INTO ancient_market VALUES(?,?,?,?,?,?,?)',id,name,s.id,'rough',Number(d.price),Date.now(),JSON.stringify({asset:'rough',stone:s}));state.stones=state.stones.filter(v=>v.id!==s.id);saveStones(name,state);
 }else{
  if(!row)return {error:'This listing is no longer available'};
  const s=JSON.parse(row.data).stone as Stone;id=row.id;
  if(state.stones.length>=60)return {error:'Sell a stone first (60 stone limit)'};
  if(state.stones.some(v=>v.id===s.id))return {error:'Collection ownership conflict'};
  if(action==='marketCancel'){if(row.seller!==name)return {error:'Only the seller can remove this listing'};}
  else{
   if(row.seller===name)return {error:'You cannot buy your own listing'};
   if(d.price!==row.price)return {error:'Listing price changed; refresh before buying'};
   const funds=Math.round(p.coins*100),cost=row.price*100,seller=structuredClone(read(row.seller)),credit=Math.round(seller.coins*100)+cost;
   if(!Number.isSafeInteger(funds)||funds<cost)return {error:'Not enough Ancient Gold'};
   if(!Number.isSafeInteger(credit))return {error:'Seller Gold limit reached'};
   p.coins=(funds-cost)/100;seller.coins=credit/100;s.cost=row.price;save(row.seller,seller);save(name,p);changed.push(row.seller);
  }
  state.stones.push(s);saveStones(name,state);sql.exec('DELETE FROM ancient_market WHERE id=?',row.id);
 }
 return {selected:action==='marketSell'?id:undefined,changed};
}
