// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {ancientShopDay} from './ancient-commerce';
import {GEAR,rollGearItem,type AncientGear} from './ancient-gear';
import {marketGearValue} from './ancient-market-rules';
import {SKILLS,skillBook} from './ancient-skills';
import {stoneRng} from './ancient-stonework';
import type {AncientProfile} from './ancient-rules';
type DailyOffer={id:string;kind:'gear'|'material'|'book';key:string;price:number;gear?:AncientGear;bought?:boolean;requestId?:string};
export type DailyShop={day:string;offers:DailyOffer[]};
const BOSS_MATERIALS:Record<string,number>={crown:15000,rootHeart:30000,metalCrystal:60000,woodCrystal:60000,waterCrystal:60000,fireCrystal:60000,earthCrystal:60000,royalSeal:100000,emptyCrown:150000,blightHeart:200000,verdictShard:250000,starCore:300000,forgeSigil:350000,edictCore:400000,stormSigil:450000,skyCore:500000};
export function makeDailyShop(now=Date.now()):DailyShop{const day=ancientShopDay(now);let seed=0;for(const c of day)seed=Math.imul(seed,31)+c.charCodeAt(0)|0;const random=stoneRng(seed^0x197aef),pick=(a:string[])=>a.splice(Math.floor(random()*a.length),1)[0],q=random(),quality=q<.4?1:q<.7?2:q<.88?3:q<.97?4:q<.995?5:6,keys=Object.keys(GEAR).filter(k=>GEAR[k].quality===quality),key=pick(keys),gear=rollGearItem(key,random),offers:DailyOffer[]=[{id:'gear',kind:'gear',key,gear,price:Math.max(300,Math.ceil(marketGearValue(gear)*1.5))}],materials=Object.keys(BOSS_MATERIALS),books=Object.keys(SKILLS);
 for(let i=0;i<2;i++){const key=pick(materials);offers.push({id:'material'+i,kind:'material',key,price:BOSS_MATERIALS[key]});}
 for(let i=0;i<3;i++){const key=skillBook(pick(books));offers.push({id:'book'+i,kind:'book',key,price:600});}
 return {day,offers};}
export function dailyShopBuy(p:AncientProfile,state:DailyShop,d:Record<string,unknown>,now=Date.now()){
 if(d.day!==state.day||state.day!==ancientShopDay(now))return '商品已刷新，请重新打开限时商店';
 const o=state.offers.find(o=>o.id===d.id);if(!o)return '商品不存在';
 const request=String(d.requestId||'');if(!/^[a-zA-Z0-9-]{16,80}$/.test(request))return '请求无效';
 if(o.bought)return o.requestId===request?null:'今日已购买';
 if(d.price!==o.price)return '商品价格已变化，请刷新';if(p.coins<o.price)return '远古金币不足';
 if(o.kind==='gear'){if((p.gear?.length||0)>=1000)return '装备数量已达上限';if(p.gear?.some(g=>g.id===o.gear!.id))return '装备已存在';}
 else if(!Number.isSafeInteger((p.materials[o.key]||0)+1))return '物品数量已达上限';
 p.coins=Math.round((p.coins-o.price)*100)/100;if(o.kind==='gear')(p.gear??=[]).push(structuredClone(o.gear!));else p.materials[o.key]=(p.materials[o.key]||0)+1;o.bought=true;o.requestId=request;return null;
}
