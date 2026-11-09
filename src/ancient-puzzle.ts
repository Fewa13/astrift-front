// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const PUZZLE_FLOORS=120;
export type PuzzleState={floor:number;revision:number;values:number[];layout?:number;deadline?:number;pair?:number;held?:number};
type Text=[string,string];
const glyphs=['○','△','◇','✦','☾','☀','✚','□'];
const CHAMBER_RULES:{name:Text;clue:Text}[]=[
 {name:['折光镜','Mirror path'],clue:['让光经过门上刻着的编号，至少反射一次双格，最后抵达宝石。','Route light through the carved numbers. Use a two-step reflection before reaching the gem.']},
 {name:['水渠','Water channels'],clue:['转动闸板，让两个石盆都接到门上刻着的水量。','Turn the sluices to deliver the carved amounts to both basins.']},
 {name:['影子墙','Shadow wall'],clue:['转动石雕，让叠起来的影子和墙上轮廓一致。','Turn the carvings until their combined shadows match the wall.']},
 {name:['压重板','Balance plates'],clue:['挪动石块，让左右两边重量相等。','Move the stones until both sides weigh the same.']},
 {name:['机关桥','Bridge route'],clue:['第一块横放。每道接缝的 ═ 表示和上一块同向，╳ 表示转向。','Start with a straight plank. At each joint, ═ keeps the previous direction and ╳ turns it.']},
 {name:['拼图壁画','Sliding mural'],clue:['把空格旁的石砖滑进去，拼出门上刻的图案。','Slide tiles into the empty space to match the gate carving.']},
 {name:['追光柱','Moving light'],clue:['光经过门刻对应的柱子时按 F，按门刻顺序捕捉。','Catch the light with F on each carved pillar, in order.']},
 {name:['双闸门','Twin gates'],clue:['拉下近处闸杆，再沿刻痕路线赶到另一根。','Pull the near lever, then follow the marked route to the far lever.']},
 {name:['遗物归位','Relic niches'],clue:['按 F 拿起遗物，再按 F 交换。按门刻把遗物归位。','Press F to pick up or swap relics. Match the carved order.']},
];
const rules:{name:Text;clue:Text}[]=[
 {name:['拉杆门','Lever gate'],clue:['走到拉杆旁，按 F 开门。','Walk to the lever and press F to open the gate.']},
 {name:['符文门','Rune gate'],clue:['按 F 转动符文，把它们对准门上的图案。','Press F to turn each rune. Match the pattern above the gate.']},
 {name:['火盆门','Brazier gate'],clue:['按门上的图案顺序，用 F 点亮火盆。顺序错了，火会熄灭。','Light the braziers with F in the order shown above the gate. A wrong turn extinguishes them.']},
 {name:['脚印门','Footstep gate'],clue:['按门上的图案顺序，踩过地上的石板。','Step on the floor plates in the order shown above the gate.']},
 {name:['联动门','Linked gate'],clue:['按 F 翻动石柱，同时翻动编号紧随其后的一根。让所有石柱亮起来。','Press F to flip a pillar and the next numbered pillar. Light them all.']},
 {name:['石印门','Seal gate'],clue:['找到和门上图案相同的石印，走近按 F。','Find the seal that matches the gate symbol and press F beside it.']},
 {name:['沙漏门','Hourglass gate'],clue:['点亮第一盏灯后开始倒计时，熄灭前点亮其余的灯。顺序不限。','The first lamp starts the timer. Light every lamp before time runs out, in any order.']},
 {name:['双印门','Twin seals'],clue:['按 F 翻看石印。每次找出两个相同图案，配对后会亮起。','Press F to reveal a seal. Find matching pairs to keep them lit.']},
 {name:['回声门','Echo gate'],clue:['先记住门上的顺序。触碰第一块石碑后，提示会消失。','Memorize the gate pattern. It vanishes when you touch the first stone.']},
 ...CHAMBER_RULES,
];
const difficultyFor=(floor:number)=>Math.min(5,Math.ceil(floor/24));
export const newPuzzleState=(floor=1,revision=0):PuzzleState=>({floor,revision,values:[],layout:6});
export function upgradePuzzleState(state:PuzzleState){
 return state.layout===4||state.layout===5||state.layout===6?state:newPuzzleState(state.floor,state.revision+1);
}
function roomLayout(floor:number,layout?:number){
 const difficulty=difficultyFor(floor),count=8+Math.floor(16*(floor-1)/(PUZZLE_FLOORS-1));
 const palette=floor<3?[1,2,3,4,5,6,7]:[1,2,3,4,5,6,7,8];
 const expanded=[1,9,5,10,2,11,3,12,4,13,14,6,15,7,16,8,17];
 const rotation=(Math.imul(floor,2654435761)>>>0)%palette.length;
 let start=0;
 return Array.from({length:count},(_,room)=>{
  const kind=floor===1&&room===0?0:layout===4?1+(floor+room-2+5)%5:layout===5?
   palette[(rotation+room*[1,3,5][floor%3])%palette.length]:
   expanded[((floor-1)*5+room*(floor%2?1:3))%expanded.length];
  const size=kind===0?1:layout===6&&kind===1?5:kind===14?6:[10,12].includes(kind)?(difficulty<3?6:8):kind===7?Math.min(8,4+2*Math.floor(difficulty/2)):Math.min(8,3+difficulty+(room%2));
  const symbols=glyphs.slice(0,size);
  const seed=(floor*31+room*17)>>>0;
  const order=Array.from({length:size},(_,i)=>i).sort((a,b)=>(Math.imul(a+seed,2654435761)>>>0)-(Math.imul(b+seed,2654435761)>>>0));
  const runePattern=Array.from({length:size},(_,i)=>i<3?1+i:1+((Math.imul(seed+i+1,1597334677)>>>16)%3));
  if(kind===1&&layout===6){
   for(let i=size-1;i>0;i--){
    const j=(Math.imul(seed+i,1597334677)>>>0)%(i+1);
    [runePattern[i],runePattern[j]]=[runePattern[j],runePattern[i]];
   }
  }
  const target=kind>=9?chamberTarget(kind,seed,size,difficulty):layout===6&&kind===1?runePattern:kind===1?symbols.map((_,i)=>1+(seed+i*3)%3):kind===5?(layout===6?[order[0],order[1]]:[order[0]]):kind===7?order.map(i=>i% (size/2)):order;
  const initial=kind>=9?chamberStart(kind,seed,size,difficulty):symbols.map(()=>0);
  if(kind===17&&initial.every((v,i)=>v===target[i]))[initial[0],initial[1]]=[initial[1],initial[0]];
  const clue:Text=kind===5&&layout===6?['先找门上的石印，再找侧墙上的石印。顺序错了就重来。','Find the seal shown above the gate, then the seal on the side wall. A mistake resets the lock.']:rules[kind].clue;
  const bank={...rules[kind],clue,kind,start,count:size,symbols,target,initial};
  start+=size;
  return bank;
 });
}
type Bank=ReturnType<typeof roomLayout>[number];
function done(bank:Bank,values:number[]){
 if(bank.kind>=9)return chamberSolved(bank.kind,bank.initial.map((v,i)=>values[bank.start+i]??v),bank.target);
 return bank.kind===1?bank.target.every((v,i)=>values[bank.start+i]===v):
  [4,6,7].includes(bank.kind)?bank.symbols.every((_,i)=>values[bank.start+i]===1):
  (values[bank.start]||0)===([2,3,8].includes(bank.kind)?bank.count:bank.kind===5?bank.target.length:1);
}
export function puzzleView(state:PuzzleState){
 if(state.floor>PUZZLE_FLOORS)return {floor:state.floor,revision:state.revision,complete:true as const};
 const banks=roomLayout(state.floor,state.layout);
 return {floor:state.floor,revision:state.revision,complete:false as const,difficulty:difficultyFor(state.floor),
  deadline:state.deadline,pair:state.pair,held:state.held,
  banks:banks.map(bank=>({...bank,target:bank.kind===7?bank.target.map((v,i)=>state.pair===bank.start+i||state.values[bank.start+i]===1?v:-1):bank.target,done:done(bank,state.values)})),
  values:banks.flatMap(bank=>bank.initial.map((value,i)=>state.values[bank.start+i]??value))};
}
export function puzzleOperate(state:PuzzleState,input:Record<string,unknown>,now:number){
 if(state.floor>PUZZLE_FLOORS||input.floor!==state.floor||input.revision!==state.revision)return {state,notice:'stale'};
 const banks=roomLayout(state.floor,state.layout),active=banks.find(bank=>!done(bank,state.values)),index=input.index;
 if(input.control!=='activate'||typeof index!=='number'||!Number.isInteger(index))return {state,notice:'invalid'};
 if(!active||index<active.start||index>=active.start+active.count)return {state,notice:'locked'};
 const {kind,start,count,target}=active,local=index-start,values=state.values.slice();
 let notice='activate',deadline=state.deadline,pair=state.pair,held=state.held;
 if(kind>=9){
  const result=advanceChamber(kind,active.initial.map((v,i)=>values[start+i]??v),local,target,now,deadline,held);
  if(!result.values)return {state,notice:result.notice};
  result.values.forEach((v,i)=>{values[start+i]=v;});
  ({notice,deadline,held}=result);
 }else if(kind===1)values[index]=((values[index]||0)+1)%4;
 else if(kind===2||kind===3||kind===8){
  const step=values[start]||0;
  values[start]=target[step]===local?step+1:0;
  if(target[step]!==local)notice='reset';
 }else if(kind===4){
  values[index]=1-(values[index]||0);
  if(local+1<count)values[index+1]=1-(values[index+1]||0);
 }else if(kind===6){
  if(!deadline||now>=deadline){
   for(let i=start;i<start+count;i++)values[i]=0;
   deadline=now+Math.max(7500,15000-difficultyFor(state.floor)*1200);
  }
  values[index]=1;
 }else if(kind===7){
  if(values[index]||pair===index)return {state,notice:'invalid'};
  if(pair===undefined)pair=index;
  else{
   if(target[pair-start]===target[local])values[pair]=values[index]=1;
   else notice='wrongPair';
   pair=notice==='wrongPair'?index:undefined;
  }
 }else if(kind===5&&target.length===2){
  if(target[values[start]||0]!==local){values[start]=0;notice='reset';}
  else values[start]=(values[start]||0)+1;
 }else if(kind===0||target[0]===local)values[start]=1;
 else return {state,notice:'wrong'};
 const revision=state.revision+1;
 if(banks.every(bank=>done(bank,values)))return {state:newPuzzleState(state.floor+1,revision),notice:'clear'};
 if(done(active,values)){notice='open';deadline=pair=held=undefined;}
 return {state:{...state,values,revision,deadline,pair,held},notice};
}
export const puzzleReward=(floor:number)=>{const difficulty=difficultyFor(floor);return {coins:40*difficulty*difficulty,cores:difficulty>=3?difficulty-2:0}};

export const TILE_NEIGHBORS=[[1,3],[0,2,4],[1,5],[0,4],[1,3,5],[2,4]];

export function chamberStart(kind:number,seed:number,count:number,difficulty:number){
 const choose=(n:number)=>((Math.imul(seed+n+1,2654435761)>>>0)%7);
 if(kind===14){
  const tiles=[1,2,3,4,5,0];
  let empty=5,previous=-1;
  for(let i=0;i<8+difficulty*4;i++){
   const options=TILE_NEIGHBORS[empty].filter(v=>v!==previous);
   const next=options[choose(i)%options.length];
   [tiles[empty],tiles[next]]=[tiles[next],tiles[empty]];
   previous=empty;empty=next;
  }
  if(tiles.every((v,i)=>v===(i+1)%6)){
   const next=TILE_NEIGHBORS[empty][0];
   [tiles[empty],tiles[next]]=[tiles[next],tiles[empty]];
  }
  return tiles;
 }
 if(kind===17)return Array.from({length:count},(_,i)=>1+(i+1+seed%(count-1))%count);
 return Array.from({length:count},()=>0);
}

export function chamberTarget(kind:number,seed:number,count:number,difficulty:number){
 const order=Array.from({length:count},(_,i)=>i).sort((a,b)=>(Math.imul(seed+a,2654435761)>>>0)-(Math.imul(seed+b,2654435761)>>>0));
 if(kind===10)return order.map((_,i)=>2*(1+(Math.floor(i/2)+seed)%3));
 if(kind===12)return order.map(i=>1+(Math.floor(i/2)+seed)%3);
 if(kind===13)return order.map((_,i)=>((seed>>>i)&1));
 if(kind===9)return order.filter(i=>i%2===0).slice(0,Math.max(1,Math.floor(count/3)));
 if(kind===11)return order.map((_,i)=>i===0||i>=3&&((seed>>>i)&1)?0:1<<i);
 if(kind===14)return [1,2,3,4,5,0];
 if(kind===15)return order.slice(0,Math.min(count,3+Math.floor(difficulty/2)));
 if(kind===16)return [0,count-1];
 if(kind===17)return order.map(i=>i+1);
 return order;
}

export function chamberSolved(kind:number,values:number[],target:number[]){
 if(kind===9){
  let node=0;
  const seen=new Set<number>();
  while(node<values.length&&!seen.has(node)){
   seen.add(node);
   const turn=values[node];
   if(!turn)return false;
   node=(turn===1?node+1:node+2)% (values.length+1);
  }
  return node===values.length&&seen.size>=Math.ceil(values.length/2)&&target.every(index=>seen.has(index))&&[...seen].some(index=>values[index]===2);
 }
 if(kind===10){
  const left=values.reduce((sum,v,i)=>sum+(v===0?target[i]:v===1?target[i]/2:0),0);
  const right=target.reduce((a,b)=>a+b,0)-left;
  return left-right===target[0];
 }
 if(kind===12||kind===11){
  if(kind===11){
   const shadow=values.reduce((mask,value,i)=>mask|(value===1?1<<i:value===2?1<<((i+1)%values.length):0),0);
   return shadow===target.reduce((mask,v)=>mask|v,0)&&values.some(v=>v===2);
  }
  const left=values.reduce((sum,v,i)=>sum+(v===1?target[i]:0),0);
  const right=values.reduce((sum,v,i)=>sum+(v===2?target[i]:0),0);
  return values.every(Boolean)&&left===right&&left>0;
 }
 if(kind===13){
  if(!values.every(Boolean)||values[0]!==1)return false;
  return values.every((value,i)=>i===0||Number(value!==values[i-1])===target[i]);
 }
 if(kind===15)return values[0]===target.length;
 if(kind===16)return values[0]===2;
 return values.every((value,i)=>value===target[i]);
}

export function advanceChamber(kind:number,values:number[],index:number,target:number[],now:number,deadline?:number,held?:number){
 let notice='activate';
 if(kind===14){
  const empty=values.indexOf(0);
  if(!TILE_NEIGHBORS[empty].includes(index))return {notice:'blocked'};
  [values[index],values[empty]]=[values[empty],values[index]];
 }else if(kind===15){
  const progress=values[0];
  const phaseMatches=[now-170,now,now+170].some(t=>Math.floor(t/950)%values.length===index);
  if(target[progress]!==index||!phaseMatches){values[0]=0;notice='reset';}
  else values[0]++;
 }else if(kind===16){
  if(index===target[0]){values[0]=1;deadline=now+6500;}
  else if(index===target[1]&&values[0]===1&&deadline&&now<deadline){values[0]=2;}
  else{values[0]=0;deadline=undefined;notice='reset';}
 }else if(kind===17){
  const relic=values[index];
  values[index]=held||0;
  held=relic||undefined;
 }else values[index]=(values[index]+1)%3;
 return {values,deadline,held,notice};
}
