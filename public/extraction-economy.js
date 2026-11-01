// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const EXTRACTION_KEY='astrift.extraction.v1';
export const GUN_PRICES={redline:300,smg:340,shotgun:380,revolver:180,hammer:520,gale:580,frost:700,lmg:650,autoShotgun:650,meteor:900};
export const AMMO_PRICES={redline:2,smg:1,shotgun:5,revolver:3,hammer:4,gale:5,frost:8,lmg:2,autoShotgun:5,meteor:70};
export const ARMOR_PRICES={none:0,light:140,medium:360,heavy:720};
export const HELMET_PRICES={none:0,scout:100,composite:260,fortress:520};
export const LOOT=[
  ['wire','铜线束',30,1,0],['bolts','紧固件',25,1,0],['fabric','纤维织物',35,1,0],['tape','工业胶带',40,1,0],
  ['scrap','合金废料',55,2,0],['glass','光学玻璃',65,1,0],['rubber','密封圈',30,1,0],['filter','空气滤芯',75,2,0],
  ['bearing','精密轴承',90,1,1],['circuit','电路板',110,1,1],['battery','储能电池',120,2,1],['sensor','传感模组',140,1,1],
  ['coolant','冷却液',85,2,1],['motor','微型电机',160,2,1],['lens','军用镜片',180,1,1],['relay','相位继电器',200,2,1],
  ['chip','加密芯片',270,1,2],['drive','数据存储器',300,1,2],['gyroscope','导航陀螺仪',320,2,2],['ceramic','防护陶瓷',240,2,2],
  ['processor','运算核心',380,2,2],['transmitter','量子发射器',440,3,2],['crystal','裂隙晶体',600,2,3],['core','相位核心',850,3,3],
  ['archive','战区机密档案',950,2,3],['prototype','实验能源模块',1200,4,3],
  ['bandage','战地绷带',45,1,0,20],['medkit','应急医疗包',110,2,1,45],['injector','再生注射剂',180,1,2,70]
].map(([id,name,value,weight,rarity,heal])=>({id,name,value,weight,rarity,heal:heal||0}));
export const LOOT_BY_ID=Object.fromEntries(LOOT.map(item=>[item.id,item]));
export const partPrice=(slot,id)=>!id?0:/弹药|弹头/.test(slot)?0:/瞄|镜/.test(slot)?120:/特殊|战术|引信/.test(slot)?180:/枪管/.test(slot)?140:/弹匣|装填/.test(slot)?90:70;
export function ammoType(kit){return Object.entries(kit.mods||{}).find(([slot])=>/弹药|弹头/.test(slot))?.[1]||(kit.special?true:false)}
export function ammoPrice(weapon,type=false){const multiplier=!type?1:typeof type!=='string'?3:/incendiary|burn|fire/i.test(type)?4:/AP|pierc|penetr/i.test(type)?3:/tracer/i.test(type)?1.5:/veloc|speed|尖弹/i.test(type)?2:/heavy|shaped/i.test(type)?2.5:/explosive|sticky/i.test(type)?2.8:2.2;return Math.ceil((AMMO_PRICES[weapon]||2)*multiplier)}
export function kitPrice(kit){return (GUN_PRICES[kit.weapon]||0)+Object.entries(kit.mods||{}).reduce((sum,[slot,id])=>sum+partPrice(slot,id),0)+(ARMOR_PRICES[kit.armor]||0)+(HELMET_PRICES[kit.helmet]||0)+kit.ammo*ammoPrice(kit.weapon,ammoType(kit))}
export function newExtractionState(){return {version:2,credits:2000,day:'',freeUsed:0,inventory:[],warehouse:[],packed:[],equipped:{weapon:null,armor:null,helmet:null},raid:null,stats:{raids:0,extracted:0,lost:0}}}
export function refreshDaily(state,now=Date.now()){const day=new Date(now).toISOString().slice(0,10);if(day>state.day){state.day=day;state.freeUsed=0}return Math.max(0,10-state.freeUsed)}
export const bagWeight=bag=>bag.reduce((sum,id)=>sum+(LOOT_BY_ID[id]?.weight||0),0);
export function transact(state,action){
  refreshDaily(state);
  if(state.raid)throw Error('先完成当前搜打撤');
  if(action.kind==='free'){
    if(state.freeUsed>=10)throw Error('今日免费基础套装已用完');
    if(state.inventory.length>=30)throw Error('装备仓库已满');
    state.freeUsed++;state.inventory.push({id:crypto.randomUUID(),weapon:'redline',mods:{},armor:'none',helmet:'none',ammo:90,special:false,free:true});
  }else if(action.kind==='buy'){
    const kit=action.kit;if(!GUN_PRICES[kit.weapon]||!Number.isInteger(kit.ammo)||kit.ammo<0||kit.ammo>600)throw Error('装备无效');
    const price=kitPrice(kit);if(state.credits<price)throw Error('信用点不足');if(state.inventory.length>=30)throw Error('装备仓库已满');
    state.credits-=price;state.inventory.push({...structuredClone(kit),id:crypto.randomUUID()});
  }else if(action.kind==='upgrade'){
    const kit=state.inventory.find(k=>k.id===action.id);if(!kit)throw Error('未找到枪械');
    const total=Object.entries(action.mods).reduce((sum,[slot,id])=>sum+(kit.mods[slot]===id?0:partPrice(slot,id)),0)+kit.ammo*Math.max(0,ammoPrice(kit.weapon,ammoType(action))-ammoPrice(kit.weapon,ammoType(kit)))+(action.armor!==kit.armor?ARMOR_PRICES[action.armor]||0:0)+(action.helmet!==kit.helmet?HELMET_PRICES[action.helmet]||0:0);
    if(state.credits<total)throw Error('信用点不足');state.credits-=total;kit.mods=structuredClone(action.mods);kit.special=!!action.special;kit.armor=action.armor||kit.armor;kit.helmet=action.helmet||kit.helmet;
  }else if(action.kind==='ammo'){
    const kit=state.inventory.find(k=>k.id===action.id),n=action.quantity;if(!kit||!Number.isInteger(n)||n<=0||n>600||kit.ammo+n>600)throw Error('弹药数量无效');
    const price=n*ammoPrice(kit.weapon,ammoType(kit));if(state.credits<price)throw Error('信用点不足');state.credits-=price;kit.ammo+=n;
  }else if(action.kind==='buyMedical'){
    const prices={bandage:75,medkit:180,injector:300},price=prices[action.id];if(!price||state.credits<price)throw Error('信用点不足');if(state.warehouse.length>=200)throw Error('物资仓库已满');state.credits-=price;state.warehouse.push(action.id);
  }else if(action.kind==='pack'){
    const item=LOOT_BY_ID[state.warehouse[action.index]];state.packed??=[];if(!item?.heal||state.packed.length>=6)throw Error('最多携带 6 件医疗物资');state.warehouse.splice(action.index,1);state.packed.push(item.id);
  }else if(action.kind==='unpack'){
    if(!state.packed?.[action.index])throw Error('物资已不存在');state.warehouse.push(...state.packed.splice(action.index,1));
  }else if(action.kind==='sellLoot'){
    const index=action.index;if(!Number.isInteger(index)||index<0||index>=state.warehouse.length)throw Error('物资已不存在');
    state.credits+=LOOT_BY_ID[state.warehouse[index]]?.value||0;state.warehouse.splice(index,1);
  }else if(action.kind==='sellKit'){
    const index=state.inventory.findIndex(k=>k.id===action.id);if(index<0)throw Error('装备已不存在');
    state.credits+=state.inventory[index].free?0:Math.floor(kitPrice(state.inventory[index])*.45);state.inventory.splice(index,1);
  }else throw Error('未知操作');
  return state;
}
export function beginExtraction(state,id,now=Date.now()){
  if(state.raid)throw Error('已有未完成的搜打撤');
  if(state.warehouse.length>170)throw Error('物资仓库接近上限，请先出售物资');
  const index=state.inventory.findIndex(k=>k.id===id);if(index<0)throw Error('请选择仓库中的套装');
  const kit=state.inventory[index];if(kit.ammo<=0)throw Error('请先购买弹药');
  state.inventory.splice(index,1);state.stats.raids++;
  state.raid={id:crypto.randomUUID(),kit:structuredClone(kit),started:now,ends:now+600000,bag:[...(state.packed||[])],opened:[],hp:100,ammo:null,reserve:null,position:null,bots:null};state.packed=[];return state.raid;
}
export function settleExtraction(state,won,remainingAmmo=0){
  const raid=state.raid;if(!raid)return null;
  const result={won,bag:[...raid.bag],value:raid.bag.reduce((sum,id)=>sum+(LOOT_BY_ID[id]?.value||0),0)};
  if(won){state.stats.extracted++;state.warehouse.push(...raid.bag);raid.kit.ammo=Math.max(0,Math.floor(remainingAmmo));state.inventory.push(raid.kit)}else state.stats.lost++;
  state.raid=null;return result;
}
