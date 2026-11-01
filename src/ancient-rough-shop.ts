// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {makeRoughStone,stoneRng,stoneView,stoneworkCommand,stoneJadeRatio,jadeUnitPrice,jadeVariety,type Stone,type StoneworkState} from './ancient-stonework';
import type {AncientProfile} from './ancient-rules';
export type RoughOffer={price:number;stone:Stone};
export type RoughShopState=StoneworkState&{offers?:RoughOffer[];roughPricingVersion?:number;shopReceipts?:string[]};
export function groundRough(seed:number){const s=makeRoughStone('roughStone',seed),r=stoneRng(seed^0x71a25);s.weight=Math.round((.06+r()*.34)*1000)/1000;if(r()<.86){s.grade=0;delete s.variety;}s.coverage=.12+r()*.28;return s;}
// Calibrate the material itself, not its sale quote: cutting and crafting still
// use the same geometry, grade, colour and fracture valuation as every stone.
export function roughOffers(seed:number):RoughOffer[]{
 const r=stoneRng(seed),bands=[[100,299],[100,299],[301,999],[301,999],[1001,9999],[1001,9999],[1001,9999],[10000,50000],[10000,50000]];
 return bands.map(([lo,hi])=>{
  const price=lo+Math.floor(r()*(hi-lo+1)),s=makeRoughStone('roughStone',Math.floor(r()*0xffffffff)),t=Math.log(price/100)/Math.log(500);
  s.variety ||= 'apple';s.grade=1;s.coverage=.35+r()*.5;s.cracks=Math.min(s.cracks,.55);
  s.weight=Math.round((.35+t*8)*(.8+r()*.4)*1000)/1000;
  const target=price*(r()<.02?1.5+r()*1.5:.65+r()*.5);
  const ratio=stoneJadeRatio(s),retention=(1-s.cracks*.45)*.97,multiplier=jadeVariety(s.variety)?.multiplier||1;
  const rate=target/(s.weight*ratio*retention*multiplier);
  const rates=[0,50,300,5000,85000,3000000];
  s.grade=rates.findIndex((v,i)=>i>0&&v>=rate);if(s.grade<1)s.grade=5;
  s.color=Math.pow(Math.min(1,rate/rates[s.grade]),s.grade>=3?.25:1);
  // Very large targets still conserve actual material value instead of using
  // a hidden price multiplier that would disagree with finished jewellery.
  s.weight=target/(ratio*retention*jadeUnitPrice(s.grade,s.color,s.variety));
  return {price,stone:s};
 });
}
export function roughShopView(state:RoughShopState){return (state.offers||[]).map(o=>({price:o.price,stone:{...stoneView(o.stone),lit:true}}));}
export function roughShopCommand(p:AncientProfile,state:RoughShopState,action:string,d:Record<string,unknown>){
 if(action==='roughShopList'||action==='roughShopRefresh'){if(!state.offers||state.roughPricingVersion!==2||action==='roughShopRefresh'){state.offers=roughOffers(crypto.getRandomValues(new Uint32Array(1))[0]);state.roughPricingVersion=2;}return {};}
 const o=state.offers?.find(o=>o.stone.id===d.id);
 if(action==='roughShopProbe'){if(!o)return {error:'Stone no longer available'};return stoneworkCommand(p,{stones:[{...o.stone,lit:true}],receipts:[]},'stoneProbe',d);}
 if(action!=='roughShopBuy')return {error:'Invalid stone request'};
 const key=String(d.requestId||'');if(!/^[a-zA-Z0-9-]{16,80}$/.test(key))return {error:'Invalid stone request'};
 if(state.shopReceipts?.includes(key))return {};
 if(!o)return {error:'Stone no longer available'};
 if(d.price!==o.price)return {error:'Listing price changed; refresh before buying'};
 if(state.stones.length>=60)return {error:'Sell a stone first (60 stone limit)'};
 if(p.coins<o.price)return {error:'Not enough Ancient Gold'};
 p.coins=Math.round((p.coins-o.price)*100)/100;o.stone.cost+=o.price;state.stones.push(o.stone);const slot=state.offers!.indexOf(o);state.offers![slot]=roughOffers(crypto.getRandomValues(new Uint32Array(1))[0])[slot];state.shopReceipts=[...(state.shopReceipts||[]),key].slice(-128);return {};
}
