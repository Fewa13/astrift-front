// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {ROUGH_STONES} from './ancient-stonework.js';
import type {AncientProfile} from './ancient-rules';
export const PASSAGE_RECTS:Record<string,number[][]>={
 tribe:[[35,84,78,90],[64,84,78,138],[35,84,126,138]],
 forest:[[-65,-30,36,44],[-65,-45,36,89],[-65,-30,81,89]]
};
export const PASSAGE_NAMES={tribe:['遗弃矿道','Abandoned Mine'],forest:['树根暗道','Rootveil Passage']};
export const FISH_SPECIES:Record<string,{name:string;en:string;sell:number;tribe:number;forest:number;strength:number;minKg:number;maxKg:number;color:number;shape:string;meal:number}>={
 fishRiver:{name:'溪银鱼',en:'Silverbrook Fish',sell:8,tribe:35,forest:18,strength:.8,minKg:.12,maxKg:.45,color:0xb8d8d5,shape:'slim',meal:1},
 fishPerch:{name:'青鳍鲈',en:'Jadefin Perch',sell:20,tribe:9,forest:23,strength:1,minKg:.4,maxKg:1.8,color:0x67a68b,shape:'perch',meal:1},
 fishMoon:{name:'月纹鲤',en:'Moonmarked Carp',sell:50,tribe:1,forest:3,strength:1.2,minKg:1.2,maxKg:4.5,color:0x9bb4e6,shape:'carp',meal:2},
 fishCrucian:{name:'银鳞鲫',en:'Silverfin Crucian',sell:12,tribe:25,forest:15,strength:.85,minKg:.2,maxKg:1.1,color:0xc9bea3,shape:'carp',meal:1},
 fishMinnow:{name:'长尾鳑鲏',en:'Longtail Bitterling',sell:6,tribe:18,forest:0,strength:.75,minKg:.06,maxKg:.22,color:0xbca5c6,shape:'slim',meal:1},
 fishLoach:{name:'花纹泥鳅',en:'Mottled Loach',sell:10,tribe:14,forest:0,strength:.85,minKg:.08,maxKg:.35,color:0xa3966f,shape:'eel',meal:1},
 fishCatfish:{name:'石底鲶',en:'Stonebed Catfish',sell:28,tribe:7,forest:0,strength:1.1,minKg:.8,maxKg:3.8,color:0x697d80,shape:'catfish',meal:1},
 fishTrout:{name:'赤斑鳟',en:'Redspot Trout',sell:25,tribe:0,forest:20,strength:1.05,minKg:.5,maxKg:2.2,color:0xb88e7a,shape:'slim',meal:1},
 fishPike:{name:'芦苇狗鱼',en:'Reed Pike',sell:42,tribe:3,forest:5,strength:1.2,minKg:1.1,maxKg:5,color:0x829a62,shape:'pike',meal:2},
 fishEel:{name:'青背鳗',en:'Blueback Eel',sell:35,tribe:0,forest:10,strength:1.1,minKg:.4,maxKg:2.4,color:0x597c91,shape:'eel',meal:1},
 fishGolden:{name:'金须鲤',en:'Goldenwhisker Carp',sell:85,tribe:1,forest:0,strength:1.3,minKg:1.8,maxKg:6,color:0xd5ae53,shape:'carp',meal:2},
 fishGlass:{name:'透鳍鱼',en:'Glassfin',sell:22,tribe:0,forest:10,strength:.9,minKg:.15,maxKg:.65,color:0x99d6cb,shape:'slim',meal:1},
 fishLotus:{name:'莲影鲷',en:'Lotusshade Bream',sell:55,tribe:0,forest:6,strength:1.15,minKg:.6,maxKg:2.6,color:0xb586a7,shape:'carp',meal:2},
 fishMoss:{name:'苔纹鳟',en:'Mossback Trout',sell:28,tribe:0,forest:0,strength:1.05,minKg:.4,maxKg:2.1,color:0x779d68,shape:'slim',meal:1},
 fishAmber:{name:'琥珀鳍鲈',en:'Amberfin Perch',sell:38,tribe:0,forest:0,strength:1.15,minKg:.6,maxKg:2.8,color:0xd3a75a,shape:'perch',meal:1},
 fishCrown:{name:'月冠鲤',en:'Mooncrown Carp',sell:90,tribe:0,forest:0,strength:1.35,minKg:1.5,maxKg:5.5,color:0xb9a8df,shape:'carp',meal:2},
 fishSturgeon:{name:'古纹鲟',en:'Ancient Sturgeon',sell:150,tribe:0,forest:1,strength:1.45,minKg:3,maxKg:12,color:0x8c9ea0,shape:'sturgeon',meal:3}
};
export const LEISURE_FOODS:Record<string,{name:string;en:string;healPercent:number}>={'meal:grilled':{name:'香烤溪鱼',en:'Grilled Brookfish',healPercent:12}};
for(const [key,f]of Object.entries(FISH_SPECIES))LEISURE_FOODS['meal:'+key]={name:'香烤'+f.name,en:'Grilled '+f.en,healPercent:12+Math.round((f.sell-6)/144*18)};
export const UPLAND_FISH_WEIGHTS:Record<string,number>={fishMoss:45,fishAmber:30,fishCrown:5,fishTrout:10,fishGlass:8,fishMoon:2};
export function rollFish(map:string,random=Math.random,poolId=''){const value=(key:string,f:typeof FISH_SPECIES[string])=>poolId==='upland'?(UPLAND_FISH_WEIGHTS[key]||0):map==='forest'?f.forest:f.tribe,pool=Object.entries(FISH_SPECIES).filter(([key,f])=>value(key,f)>0),weight=pool.reduce((n,[key,f])=>n+value(key,f),0);let roll=Math.max(0,Math.min(.999999,random()))*weight;for(const [key,f]of pool){roll-=value(key,f);if(roll<0)return key;}return pool[0][0];}
export function leisureErrorText(message:string,english:boolean){const zh:Record<string,string>={'Use food while alive':'请在存活时食用料理','Food is cooling down':'料理冷却中','Not enough food':'料理不足','Health is already full':'生命值已满','Recipe not found':'配方不存在','Not enough materials':'制作材料不足','Item limit reached':'物品数量已达上限','Invalid quantity':'数量无效或物品不足','Gold limit reached':'金币已达上限'};return english?message:zh[message]||message}
export function passageInside(map:string,x:number,z:number,r=0){return (PASSAGE_RECTS[map]||[]).some(([l,h,b,f])=>x>l+r&&x<h-r&&z>b+r&&z<f-r)}
// Base mountain blocks already own these four portal-side planes (x=39..59).
export function tribeMineWallCovered(axis:number,x:number,z:number){return axis===1&&x>39&&x<59&&[78,90,126,138].includes(z)}
export function tribeLeisureOpening(x:number,z:number){return x>36&&((z>=78&&z<=90)||(z>=126&&z<=138))}
export function tribePassageLineClear(ax:number,az:number,bx:number,bz:number){if(Math.abs(ax)<39&&Math.abs(bx)<39)return true;const steps=Math.ceil(Math.hypot(bx-ax,bz-az)/.4);for(let i=0;i<=steps;i++){const t=steps?i/steps:0,x=ax+(bx-ax)*t,z=az+(bz-az)*t;if(!(Math.abs(x)<39&&z>3&&z<597)&&!passageInside('tribe',x,z))return false;}return true}
export const LEISURE_ITEMS:Record<string,{name:string;en:string;sell:number;icon:string}>={
 oreCopper:{name:'赤铜矿',en:'Copper Ore',sell:12,icon:'⬟'},oreIron:{name:'乌铁矿',en:'Iron Ore',sell:25,icon:'⬟'},oreMoon:{name:'月辉矿',en:'Moonstone Ore',sell:65,icon:'◆'},
 fishRiver:{name:'溪银鱼',en:'Silverbrook Fish',sell:8,icon:'◁'},fishPerch:{name:'青鳍鲈',en:'Jadefin Perch',sell:20,icon:'◁'},fishMoon:{name:'月纹鲤',en:'Moonmarked Carp',sell:50,icon:'◁'},
 'meal:grilled':{name:'香烤溪鱼',en:'Grilled Brookfish',sell:0,icon:'♨'}
};
for(const [key,d]of Object.entries(ROUGH_STONES))LEISURE_ITEMS[key]={name:d.name,en:d.en,sell:d.sell,icon:'⬟'};
for(const [key,f]of Object.entries(FISH_SPECIES))LEISURE_ITEMS[key]={name:f.name,en:f.en,sell:f.sell,icon:'◁'};
for(const [key,f]of Object.entries(LEISURE_FOODS))LEISURE_ITEMS[key]={name:f.name,en:f.en,sell:0,icon:'♨'};
export type LeisureNode={id:string;map:string;x:number;z:number;kind:'mine'|'fish';y?:number;pool?:string;direction?:number;material?:string;name:string;en:string};
export const LEISURE_NODES:LeisureNode[]=[
 {id:'tribe-copper',map:'tribe',x:76,z:99,kind:'mine',material:'roughStone',name:'山纹石层',en:'Striated Stone Deposit'},
 {id:'tribe-iron',map:'tribe',x:76,z:117,kind:'mine',material:'roughDark',name:'乌皮石层',en:'Darkskin Stone Deposit'},
 {id:'tribe-brook',map:'tribe',x:14,z:17,kind:'fish',name:'部落溪潭',en:'Tribe Brookpool'},
 {id:'forest-iron',map:'forest',x:-57,z:52,kind:'mine',material:'roughDark',name:'乌皮石层',en:'Darkskin Stone Deposit'},
 {id:'forest-moon',map:'forest',x:-57,z:73,kind:'mine',material:'roughMoon',name:'月纹石层',en:'Moonvein Stone Deposit'},
 {id:'forest-upland',map:'forest',x:20,y:10,z:165,direction:1,kind:'fish',pool:'upland',name:'高台映月池',en:'Highland Moonpool'},
 {id:'forest-pond',map:'forest',x:-17,z:17,kind:'fish',name:'林间清潭',en:'Forest Glade Pool'}
];
// Bounded shared ground pickups, not mining actors.
for(const [map,spots]of Object.entries({
 tribe:[[72,88],[69,106],[77,129]],
 forest:[[-53,42],[-60,62],[-51,83]],
 city:[[-10,50],[12,65],[-12,130],[10,155],[-12,245],[12,290]],
 blight:[[-10,50],[10,70],[-12,145],[10,165],[-10,275],[10,300]],
 sanctum:[[-10,50],[10,70],[-12,130],[12,155],[-10,260],[10,290]],
 frostcourt:[[-10,45],[10,63],[-14,120],[12,147],[-12,224],[14,245],[-14,325],[14,343]],
 skyreach:[[-15,42],[14,58],[-15,112],[15,146],[-15,212],[14,246],[-15,314],[14,340]],
 starfall:[[-10,45],[10,70],[-12,165],[10,190],[-10,315],[12,340]]
})){spots.forEach(([x,z],i)=>LEISURE_NODES.push({id:map+'-ground-'+i,map,x,z,y:map==='skyreach'?(z>=285?18:z>=185?12:z>=85?6:0):map==='frostcourt'?(z>=290?18:z>=190?12:z>=90?6:0):map==='sanctum'&&z>=240?8:map==='starfall'?(z>=290?-12:z>=150?-6:0):0,kind:'mine',material:['roughStone','oreCopper','roughDark','oreIron','roughMoon','oreMoon'][i%6],name:'散落石料',en:'Loose Stone'}));}
// Ground pickups are unclassified rough stones; the workshop rolls their actual contents.
for(const n of LEISURE_NODES)if(n.kind==='mine'){n.material='roughStone';n.name='原石';n.en='Rough Stone';}
for(const key of ['roughStone','roughDark','roughMoon']){LEISURE_ITEMS[key].name='原石';LEISURE_ITEMS[key].en='Rough Stone';}
const LEISURE_POSTS=Object.entries(PASSAGE_RECTS).flatMap(([map])=>{const x=map==='tribe'?74:-55,start=map==='tribe'?82:40,end=map==='tribe'?134:85,out:{map:string;x:number;z:number;r:number}[]=[];for(let z=start;z<=end;z+=7)for(const side of [-1,1])out.push({map,x:x+side*8.5,z,r:.18});for(const z of [start,end])for(const side of [-1,1])out.push({map,x:map==='tribe'?38:-34,z:z+side*4.8,r:.25});return out});
export function leisureSolid(map:string,x:number,z:number,r=.6){return LEISURE_POSTS.some(p=>p.map===map&&Math.hypot(p.x-x,p.z-z)<p.r+r)}
export type LeisureSession={node:string;kind:'mine'|'fish';phase:'mining'|'waiting'|'hooked';started:number;nextAt:number;biteAt:number;expires:number;hits:number;progress:number;hp:number;fish?:string;weight?:number;tension?:number;lastAt?:number;controlAt?:number;held?:boolean;strain?:number;seed?:number};
export type LeisureActor={map?:string;x:number;y:number;z:number;hp:number;leisure?:LeisureSession;leisureAt?:number};
export type LeisureMapState={ready:Record<string,number>};
export function leisureView(s?:LeisureSession){if(!s)return s;const {fish,weight,...view}=s;return view;}
export function fishingGauge(now:number,started:number){return (Math.sin((now-started)*.0035)+1)/2}
// Fish alternate between short runs and recovery. The float/line and HUD share this.
export function fishingPull(now:number,s:LeisureSession){const t=Math.max(0,(now-s.started)/1000),cycle=Math.floor(t/5),noise=(n:number)=>{const x=Math.sin((cycle+1)*12.9898+(s.seed||0)*78.233+n*19.19)*43758.5453;return x-Math.floor(x)},start=1+noise(0)*1.2;return t%5>start&&t%5<start+1+noise(1)*.9;}
function advanceFishing(s:LeisureSession,now:number){const f=FISH_SPECIES[s.fish||'fishRiver']||FISH_SPECIES.fishRiver;const start=Math.max(s.lastAt||now,now-1000);for(let at=start;at<now;at+=50){const dt=Math.min(50,now-at)/1000,held=!!s.held&&at<(s.controlAt||0)+750,pull=fishingPull(at,s);s.tension=Math.max(0,Math.min(105,(s.tension??35)+(held?(pull?25*f.strength:8):pull?-5:-23)*dt));s.progress=Math.max(0,Math.min(100,s.progress+(held?(pull?7:19)/f.strength:-(pull?6:3))*dt));s.strain=s.tension>=100?(s.strain||0)+dt:0;}
 s.lastAt=now;return (s.strain||0)>=.85?'line':s.progress>=100?'catch':null;}
export function leisureNear(a:LeisureActor,n:LeisureNode,clear:(ax:number,ay:number,az:number,bx:number,by:number,bz:number)=>boolean){return a.hp>0&&a.map===n.map&&Math.hypot(a.x-n.x,a.z-n.z)<3&&Math.abs(a.y-((n.y||0)+1.7))<1.6&&clear(a.x,a.y,a.z,n.x,(n.y||0)+.75,n.z)}
function add(p:AncientProfile,key:string,n:number){const count=(p.materials[key]||0)+n;if(!Number.isSafeInteger(count)||count>999999999)return false;p.materials[key]=count;return true}
export function leisureCommand(a:LeisureActor,p:AncientProfile,d:Record<string,unknown>,state:LeisureMapState,now:number,clear:(ax:number,ay:number,az:number,bx:number,by:number,bz:number)=>boolean,random=Math.random){
 const n=LEISURE_NODES.find(n=>n.id===d.id&&n.map===a.map),old=a.leisure;
 if(d.action==='cancel'){delete a.leisure;return {changed:false}}
 if(!n||!leisureNear(a,n,clear)){delete a.leisure;return {changed:false}}
 if((!old||n.kind==='mine')&&now-(a.leisureAt??-Infinity)<250)return {changed:false};a.leisureAt=now;
 if(old&&(old.node!==n.id||old.expires<=now))delete a.leisure;
 if(n.kind==='mine'){
  delete a.leisure;
  if(d.action==='reel'||d.action==='tick'||d.action==='hook'||(state.ready[n.id]||0)>now)return {changed:false};
  const key=n.material||'roughStone';
  if(!add(p,key,1))return {changed:false};
  state.ready[n.id]=now+45000+Math.floor(random()*75000);
  return {changed:true,reward:key,animation:'pickup'};
 }
 let s=a.leisure;
 if(!s){
  if(d.action==='reel'||d.action==='tick'||d.action==='hook')return {changed:false};
  const biteAt=now+2500+Math.floor(random()*2500),fish=n.kind==='fish'?rollFish(n.map,random,n.pool):undefined,f=fish&&FISH_SPECIES[fish];
  a.leisure={node:n.id,kind:n.kind,phase:'waiting',started:now,nextAt:now+650,biteAt,expires:biteAt+3500,hits:0,progress:0,hp:a.hp,...(f?{fish,weight:Math.round((f.minKg+(f.maxKg-f.minKg)*random())*100)/100,seed:random(),tension:35}: {})};
  return {changed:false,animation:'cast'};
 }
 if(s.kind==='mine'){delete a.leisure;return {changed:false};}
 if(s.phase==='waiting'){
  if(d.action==='tick'||d.action==='reel')return {changed:false};
  if(now<s.biteAt)return {changed:false};
  s.phase='hooked';s.started=now;s.nextAt=now;s.lastAt=now;s.controlAt=now;s.held=d.held===true;s.expires=now+45000;
  return {changed:false,animation:'hook'};
 }
 const result=advanceFishing(s,now);if(result==='line'){delete a.leisure;return {changed:false,animation:'lineBreak'};}
 if(result!=='catch'){s.held=d.held===true;s.controlAt=now;return {changed:false};}
 const key=s.fish&&Object.hasOwn(FISH_SPECIES,s.fish)?s.fish:'fishRiver',weight=s.weight||FISH_SPECIES[key].minKg,rewarded=add(p,key,1);
 if(rewarded){p.fishing??={};const old=p.fishing[key]||{count:0,bestKg:0};p.fishing[key]={count:Math.min(999999999,old.count+1),bestKg:Math.max(old.bestKg,weight)};}
 delete a.leisure;return {changed:rewarded,reward:rewarded?key:undefined,weight:rewarded?weight:undefined,animation:'catch'};
}
export function leisureRecipe(p:AncientProfile,id:string){
 if(id.startsWith('fishMeal:')){const key=id.slice(9),fish=Object.hasOwn(FISH_SPECIES,key)?FISH_SPECIES[key]:undefined;if(!fish)return 'Recipe not found';if((p.materials[key]||0)<1)return 'Not enough materials';if(!add(p,'meal:'+key,fish.meal))return 'Item limit reached';p.materials[key]--;return null;}
 const recipes:Record<string,{cost:Record<string,number>;key:string;n:number}>={
  copperFlint:{cost:{oreCopper:2},key:'stone',n:5},
  ironFlint:{cost:{oreIron:1},key:'stone',n:5},
  moonFlint:{cost:{oreMoon:1},key:'stone',n:12},
  riverMeal:{cost:{fishRiver:2},key:'meal:fishRiver',n:1},
  perchMeal:{cost:{fishPerch:1},key:'meal:fishPerch',n:1},
  moonMeal:{cost:{fishMoon:1},key:'meal:fishMoon',n:2}
 };const r=Object.hasOwn(recipes,id)?recipes[id]:undefined;if(!r)return 'Recipe not found';
 if(Object.entries(r.cost).some(([k,n])=>(p.materials[k]||0)<n))return 'Not enough materials';
 if(!add(p,r.key,r.n))return 'Item limit reached';for(const [k,n]of Object.entries(r.cost))p.materials[k]-=n;return null;
}
export function sellLeisure(p:AncientProfile,key:string,quantity:number){const d=Object.hasOwn(LEISURE_ITEMS,key)?LEISURE_ITEMS[key]:undefined;if(!d||!d.sell||!Number.isSafeInteger(quantity)||quantity<1||quantity>999||(p.materials[key]||0)<quantity)return 'Invalid quantity';const coins=Math.round(p.coins*100+d.sell*quantity*100);if(!Number.isSafeInteger(coins))return 'Gold limit reached';p.materials[key]-=quantity;p.coins=coins/100;return null}
