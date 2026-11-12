// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {ANCIENT_POTIONS,gainXP,type AncientProfile} from './ancient-rules';
import {ANCIENT_SUPPLIES,supplyKey} from './ancient-commerce';
import {GEAR,GEAR_QUALITIES,ANCIENT_FORGE,rollGearItem} from './ancient-gear';
import {PROFESSIONS,SKILLS,skillBook} from './ancient-skills';
export type MailReward={key:string;quantity:number;name?:string;en?:string};
export function adminRewardCatalog(){return [
 ...[1,2,3].map(tier=>({key:'blank-map:'+tier,name:['','初级空白地图','中级空白地图','高级空白地图'][tier],en:['','Basic Blank Map','Intermediate Blank Map','Advanced Blank Map'][tier]})),
 {key:'skill-choice',name:'技能书自选（可跨职业）',en:'Choose skill books (any profession)'},
 ...GEAR_QUALITIES.map(([name,en],i)=>({key:'random-gear:'+(i+1),name:name+'随机装备 / 武器',en:en+' random equipment / weapon'})),
 {key:'coins',name:'远古金币',en:'Ancient Gold'},{key:'xp',name:'经验（不受药水加成）',en:'XP (no potion multiplier)'},{key:'core',name:'相位核心',en:'Phase Core'},
 ...Object.entries(ANCIENT_POTIONS).map(([id,d])=>({key:'potion:'+id,name:d.name,en:d.en})),
 ...Object.entries(ANCIENT_SUPPLIES).filter(([,d])=>['book','transfer','boost'].includes(d.kind)).map(([id,d])=>({key:supplyKey(id),name:d.name,en:d.en})),
 ...Object.entries(SKILLS).map(([id,d])=>({key:skillBook(id),name:d.name+'技能书',en:d.en+' Skill Book'}))
 ]}
export function cleanMailRewards(value:unknown):MailReward[]|null{
 if(value===undefined)return [];if(!Array.isArray(value)||value.length>20)return null;const allowed=new Set(adminRewardCatalog().map(r=>r.key)),seen=new Set<string>();
 const rewards:MailReward[]=[];for(const r of value){if(!r||!allowed.has(r.key)||seen.has(r.key)||!Number.isSafeInteger(r.quantity)||r.quantity<1||(r.key.startsWith('random-gear:')&&r.quantity>1000))return null;seen.add(r.key);rewards.push({key:r.key,quantity:r.quantity})}return rewards;
}
export function mailBookChoices(){return Object.entries(PROFESSIONS).map(([id,p])=>({id,name:p.name,en:p.en,skills:p.skills.map(id=>({id,name:SKILLS[id].name,en:SKILLS[id].en}))}))}
export function grantMailRewards(p:AncientProfile,rewards:MailReward[],selection:unknown=[]){
 const required=rewards.find(r=>r.key==='skill-choice')?.quantity||0,selected=new Map<string,number>();let total=0;
 if(!Array.isArray(selection)||selection.length>Object.keys(SKILLS).length)return 'Invalid skill book selection.';
 for(const item of selection){if(!item||typeof item.id!=='string'||!Object.hasOwn(SKILLS,item.id)||selected.has(item.id)||!Number.isSafeInteger(item.quantity)||item.quantity<1||item.quantity>required-total)return 'Invalid skill book selection.';total+=item.quantity;selected.set(item.id,item.quantity)}
 if(total!==required)return required?'Choose all skill books before claiming.':'Invalid skill book selection.';
 const grants=new Map<string,number>();let gearCount=0;const gearPlans:{pool:string[];count:number}[]=[];
 for(const r of rewards){if(r.key==='skill-choice')continue;if(r.key.startsWith('random-gear:')){const q=Number(r.key.split(':')[1]),pool=Object.entries(GEAR).filter(([key,d])=>d.quality===q&&!Object.hasOwn(ANCIENT_FORGE,key)).map(([key])=>key);if(!pool.length)return 'No equipment available for this quality.';gearCount+=r.quantity;gearPlans.push({pool,count:r.quantity})}else grants.set(r.key,(grants.get(r.key)||0)+r.quantity)}
 for(const [id,count]of selected){const key=skillBook(id);grants.set(key,(grants.get(key)||0)+count)}
 if((p.gear?.length||0)+gearCount>1000)return 'Gear inventory is full.';
 // Validate the full attachment before granting anything; the caller commits it with the claim receipt.
 for(const [key,count]of grants){const current=key==='coins'?p.coins:key==='xp'?p.xp:key.startsWith('potion:')?(p.potions?.[key.slice(7)]||0):(p.materials?.[key]||0);if(!Number.isSafeInteger(count)||!Number.isSafeInteger(Math.floor(current)+count))return '物品数量已达上限'}
 const gear=gearPlans.flatMap(({pool,count})=>Array.from({length:count},()=>rollGearItem(pool[Math.floor(Math.random()*pool.length)])));
 for(const [key,count]of grants)if(key==='coins')p.coins+=count;else if(key==='xp')gainXP(p,count,false);else if(key.startsWith('potion:')){p.potions??={};const id=key.slice(7);p.potions[id]=(p.potions[id]||0)+count}else{p.materials??={};p.materials[key]=(p.materials[key]||0)+count}
 if(gear.length)(p.gear??=[]).push(...gear);
 return null;
}
