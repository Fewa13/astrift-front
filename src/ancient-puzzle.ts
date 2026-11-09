// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const PUZZLE_FLOORS=120;
export type PuzzleState={floor:number;revision:number;values:number[];layout?:number};
type Text=[string,string];
const glyphs=['○','△','◇','✦','☾','☀','✚','□'];
const rules:{name:Text;clue:Text}[]=[
 {name:['拉杆门','Lever gate'],clue:['走到拉杆旁，按 F 开门。','Walk to the lever and press F to open the gate.']},
 {name:['符文门','Rune gate'],clue:['按 F 转动符文，把它们对准门上的图案。','Press F to turn each rune. Match the pattern above the gate.']},
 {name:['火盆门','Brazier gate'],clue:['按门上的图案顺序，用 F 点亮火盆。顺序错了，火会熄灭。','Light the braziers with F in the order shown above the gate. A wrong turn extinguishes them.']},
 {name:['脚印门','Footstep gate'],clue:['按门上的图案顺序，踩过地上的石板。','Step on the floor plates in the order shown above the gate.']},
 {name:['联动门','Linked gate'],clue:['按 F 翻动石柱，同时翻动编号紧随其后的一根。让所有石柱亮起来。','Press F to flip a pillar and the next numbered pillar. Light them all.']},
 {name:['石印门','Seal gate'],clue:['找到和门上图案相同的石印，走近按 F。','Find the seal that matches the gate symbol and press F beside it.']},
];
const difficultyFor=(floor:number)=>Math.min(5,Math.ceil(floor/24));
export const newPuzzleState=(floor=1,revision=0):PuzzleState=>({floor,revision,values:[],layout:4});
export function upgradePuzzleState(state:PuzzleState){
 return state.layout===4?state:newPuzzleState(state.floor,state.revision+1);
}
function roomLayout(floor:number){
 const difficulty=difficultyFor(floor),count=8+Math.floor(16*(floor-1)/(PUZZLE_FLOORS-1));
 let start=0;
 return Array.from({length:count},(_,room)=>{
  const kind=floor===1&&room===0?0:1+(floor+room-2+5)%5;
  const size=kind===0?1:Math.min(8,3+difficulty+(room%2));
  const symbols=glyphs.slice(0,size);
  const seed=(floor*31+room*17)>>>0;
  const order=Array.from({length:size},(_,i)=>i).sort((a,b)=>(Math.imul(a+seed,2654435761)>>>0)-(Math.imul(b+seed,2654435761)>>>0));
  const target=kind===1?symbols.map((_,i)=>1+(seed+i*3)%3):kind===5?[order[0]]:order;
  const bank={...rules[kind],kind,start,count:size,symbols,target};
  start+=size;
  return bank;
 });
}
type Bank=ReturnType<typeof roomLayout>[number];
function done(bank:Bank,values:number[]){
 return bank.kind===1?bank.target.every((v,i)=>values[bank.start+i]===v):
  bank.kind===4?bank.symbols.every((_,i)=>values[bank.start+i]===1):
  (values[bank.start]||0)===(bank.kind===2||bank.kind===3?bank.count:1);
}
export function puzzleView(state:PuzzleState){
 if(state.floor>PUZZLE_FLOORS)return {floor:state.floor,revision:state.revision,complete:true as const};
 const banks=roomLayout(state.floor);
 return {floor:state.floor,revision:state.revision,complete:false as const,difficulty:difficultyFor(state.floor),
  banks:banks.map(bank=>({...bank,done:done(bank,state.values)})),
  values:Array.from({length:banks.reduce((sum,bank)=>sum+bank.count,0)},(_,i)=>state.values[i]||0)};
}
export function puzzleOperate(state:PuzzleState,input:Record<string,unknown>,_now:number){
 if(state.floor>PUZZLE_FLOORS||input.floor!==state.floor||input.revision!==state.revision)return {state,notice:'stale'};
 const banks=roomLayout(state.floor),active=banks.find(bank=>!done(bank,state.values)),index=input.index;
 if(input.control!=='activate'||typeof index!=='number'||!Number.isInteger(index))return {state,notice:'invalid'};
 if(!active||index<active.start||index>=active.start+active.count)return {state,notice:'locked'};
 const {kind,start,count,target}=active,local=index-start,values=state.values.slice();
 let notice='activate';
 if(kind===1)values[index]=((values[index]||0)+1)%4;
 else if(kind===2||kind===3){
  const step=values[start]||0;
  values[start]=target[step]===local?step+1:Number(target[0]===local);
  if(target[step]!==local)notice='reset';
 }else if(kind===4){
  values[index]=1-(values[index]||0);
  if(local+1<count)values[index+1]=1-(values[index+1]||0);
 }else if(kind===0||target[0]===local)values[start]=1;
 else return {state,notice:'wrong'};
 const revision=state.revision+1;
 if(banks.every(bank=>done(bank,values)))return {state:newPuzzleState(state.floor+1,revision),notice:'clear'};
 if(done(active,values))notice='open';
 return {state:{...state,values,revision},notice};
}
export const puzzleReward=(floor:number)=>{const difficulty=difficultyFor(floor);return {coins:40*difficulty*difficulty,cores:difficulty>=3?difficulty-2:0}};
