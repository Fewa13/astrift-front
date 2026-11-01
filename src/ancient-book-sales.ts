// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {ANCIENT_SUPPLIES} from './ancient-commerce';
import {skillBookName} from './ancient-skills';
import type {AncientProfile} from './ancient-rules';
export function sellSkillBooks(p:AncientProfile,key:string,quantity:number,reserved=false){const id=key.startsWith('supply:')?key.slice(7):'',book=skillBookName(key)||id&&Object.hasOwn(ANCIENT_SUPPLIES,id)&&ANCIENT_SUPPLIES[id].kind==='book';if(!book)return '只能出售技能书';if(reserved)return '请先从交易中移除这本技能书';if(!Number.isSafeInteger(quantity)||quantity<1||quantity>999)return '出售数量无效';if((p.materials[key]||0)<quantity)return '技能书不足';const coins=Math.round(p.coins*100)+quantity*30000;if(!Number.isSafeInteger(coins))return '金币已达上限';p.materials[key]-=quantity;p.coins=coins/100;return null;}
