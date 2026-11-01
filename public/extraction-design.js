// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {LOOT,GUN_PRICES} from './extraction-economy.js?v=20261008-7';
export const DISTRICTS=[
  {id:'homes',name:'南岸住宅',en:'Southbank',x:-90,z:94,color:0x659caa},
  {id:'works',name:'西区维修厂',en:'Westworks',x:-96,z:-92,color:0xd6a260},
  {id:'depot',name:'东岸仓储',en:'East Depot',x:95,z:91,color:0x7da284},
  {id:'lab',name:'北境实验区',en:'North Labs',x:94,z:-93,color:0xa59cdd}
];
export const districtAt=(x,z)=>DISTRICTS[x<0?(z<0?1:0):(z<0?3:2)];
export const EXIT_SPECS=[
  {id:'north',x:153,z:-148,name:'北侧检修口',en:'North Service Gate',seconds:5,signal:false},
  {id:'east',x:157,z:57,name:'东岸信号站',en:'East Signal Station',seconds:8,signal:true}
];
export function containerSpec(index,x,z){const district=districtAt(x,z),types=district.id==='homes'?['medical','tools','case']:district.id==='works'?['tools','case','tools']:district.id==='depot'?['case','tools','medical']:['safe','medical','case'];return {type:types[index%3],district:district.id}}
export const CONTAINER_NAMES={medical:['医疗箱','Medical Case'],tools:['工具箱','Tool Chest'],case:['补给箱','Supply Crate'],safe:['资料保险箱','Data Safe'],death:['死亡盒','Death Box'],ground:['散落物','Dropped Items']};
export const LOOT_EN={wire:'Copper Wiring',bolts:'Fasteners',fabric:'Fiber Cloth',tape:'Industrial Tape',scrap:'Alloy Scrap',glass:'Optical Glass',rubber:'Seal Ring',filter:'Air Filter',bearing:'Precision Bearing',circuit:'Circuit Board',battery:'Power Cell',sensor:'Sensor Module',coolant:'Coolant',motor:'Micro Motor',lens:'Military Lens',relay:'Phase Relay',chip:'Encrypted Chip',drive:'Data Drive',gyroscope:'Navigation Gyroscope',ceramic:'Armor Ceramic',processor:'Processor Core',transmitter:'Quantum Transmitter',crystal:'Rift Crystal',core:'Phase Core',archive:'Classified Archive',prototype:'Prototype Energy Module',bandage:'Field Bandage',medkit:'Medical Kit',injector:'Regen Injector'};
export function rollContainer(seed,index,spec){
  let n=2166136261;for(const c of String(seed)+':'+index)n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;
  const rand=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296};
  const preferences={tools:['wire','bolts','scrap','bearing','motor','battery','sensor'],medical:['bandage','medkit','injector','fabric','filter'],safe:['chip','drive','archive','processor','core','transmitter'],case:['circuit','battery','ceramic','lens','relay','coolant']};
  const list=[];for(let j=0,count=2+Math.floor(rand()*3);j<count;j++){
    const quality=Math.min(.999,rand()+(spec.type==='safe'?.08:0)),rarity=quality>.97?3:quality>.82?2:quality>.48?1:0;
    let pool=LOOT.filter(i=>i.rarity===rarity);const favored=pool.filter(i=>preferences[spec.type]?.includes(i.id));if(favored.length&&rand()<.8)pool=favored;
    list.push(pool[Math.floor(rand()*pool.length)]);
  }return list;
}
export function sortRaidBag(items){const order={weapon:0,armor:1,helmet:2,medical:3,ammo:4,valuable:5};return items.sort((a,b)=>(order[a.kind]??6)-(order[b.kind]??6)||String(a.weapon||a.type).localeCompare(String(b.weapon||b.type))||(b.quantity||1)-(a.quantity||1))}
export const itemRarity=i=>i.kind==='valuable'||i.kind==='medical'?LOOT.find(l=>l.id===i.type)?.rarity||0:i.kind==='weapon'?1:i.type==='heavy'||i.type==='fortress'?2:0;
export function extractionRole(index){return ['scavenger','patrol','scavenger','raider'][index%4]}
export function extractionGun(playerGun,index){const cost=GUN_PRICES[playerGun]||300,choices=Object.keys(GUN_PRICES).filter(k=>k!=='meteor'&&GUN_PRICES[k]>=cost*.6&&GUN_PRICES[k]<=cost*1.3);return choices[index%choices.length]||playerGun}
