// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const PUZZLE_FLOORS=120;
export type PuzzleState={floor:number;revision:number;values:number[];sequence:number;lastPulse:number;layout?:number;relayDone?:boolean};
type Text=[string,string];
type Dial={label:Text;max:number};
type Stage={
 kind:number;name:Text;dials:Dial[];target:number;measure:(values:number[])=>number;unit:string;
 plate?:string;order?:number[];cables?:number[];window?:[number,number];
};
export const newPuzzleState=(floor=1,revision=0):PuzzleState=>({floor,revision,values:[],sequence:0,lastPulse:0,layout:2});

function buildStage(difficulty:number,n:number,kind:number,relay=false):Stage{
 const max=8+difficulty*2,extra=difficulty>=3;
 const dial=(zh:string,en:string):Dial=>({label:[zh,en],max});
 const solution=[2+n%7,3+n%5,2+n*3%8];
 if(relay){
  const count=difficulty===5?8:6;
  const order=Array.from({length:count},(_,i)=>i).sort((a,b)=>Math.sin(a*13.4+n*9.1)-Math.sin(b*13.4+n*9.1)||a-b);
  const cables=Array.from({length:count},(_,i)=>12+order.indexOf(i)*7+(n+i)%5);
  return {kind:5,name:['信号接力','Signal relay'],dials:cables.map((_,i)=>({label:['触点 '+(i+1),'Contact '+(i+1)],max:0})),
   target:count,measure:()=>0,unit:'',order,cables,window:difficulty===5?[1000,12000]:[1000,16000]};
 }
 function machine(name:Text,dials:Dial[],unit:string,plate:string,measure:Stage['measure']):Stage{
  return {kind,name,dials,unit,plate,measure,target:measure(solution)};
 }
 if(kind===0){
  const left=2+n%6,right=5+n%7,trim=extra?3+n%4:0;
  return machine(['力矩平衡','Torque balance'],[dial('左载荷','Left load'),dial('右载荷','Right load'),...(extra?[dial('微调载荷','Trim load')]:[])],
   'N·m',[left+' m',right+' m',...(extra?[trim+' m']:[])].join(' / '),v=>left*v[0]-right*v[1]+trim*(v[2]||0));
 }
 if(kind===1){
  const supply=12+n%7,shunt=extra?2+n%3:0;
  return machine(['电阻桥','Resistance bridge'],[dial('电阻 A','Resistor A'),dial('电阻 B','Resistor B'),...(extra?[dial('末级电阻','Last resistor')]:[])],
   'A',supply+' V · 1 Ω'+(shunt?' · '+shunt+' Ω':''),v=>supply/(1+v[0]+v[1]+(shunt?(v[2]+1)*shunt/(v[2]+1+shunt):0)));
 }
 if(kind===2){
  const motor=60+12*(n%9),final=16+n*5%7;
  return machine(['传动齿轮','Gear train'],[dial('主动轮','Driver'),dial('从动轮','Driven gear'),...(extra?[dial('二级主动轮','Second driver')]:[])],
   'rpm',motor+' rpm'+(extra?' · '+final+'T':''),v=>motor*(v[0]+8)/(v[1]+12)*(extra?(v[2]+8)/final:1));
 }
 if(kind===3){
  const piston=2+n%4,load=4+n*5%7;
  return machine(['液压升降','Hydraulic lift'],[dial('输入力','Input force'),dial('输出面积','Output area'),...(extra?[dial('副缸','Counter-cylinder')]:[])],
   'N',piston+' cm²'+(extra?' · '+load+' N':''),v=>(v[0]+1)/piston*(v[1]+1)-(extra?load*(v[2]+1):0));
 }
 const frequency=2+n%7;
 return machine(['驻波共振','Standing wave'],[dial('长度','Length'),dial('谐波','Harmonic'),...(extra?[dial('频率','Frequency')]:[])],
  'm/s',frequency+' Hz',v=>2*(v[0]+1)*(frequency+(extra?v[2]:0))/(v[1]+1));
}
const sameReading=(a:number,b:number)=>Math.round(a*1000)===Math.round(b*1000);
const difficultyFor=(floor:number)=>Math.min(5,Math.ceil(floor/24));

function roomLayout(floor:number){
 const difficulty=difficultyFor(floor),count=5+Math.floor(12*(floor-1)/(PUZZLE_FLOORS-1));
 const hasRelay=difficulty>=4&&floor%5===0;
 const banks:Stage[]=[];
 for(let i=0;i<count-(hasRelay?(count===17?3:2):0);i++){
  banks.push(buildStage(count===17&&!hasRelay&&i===16?2:difficulty,floor*17+i*13,(floor-1+i)%5));
 }
 if(hasRelay)banks.push(buildStage(difficulty,floor,4,true));
 let start=0;
 return banks.map(stage=>{const bank={stage,start};start+=stage.dials.length;return bank});
}

export function upgradePuzzleState(state:PuzzleState){
 return state.layout===2?state:newPuzzleState(state.floor,state.revision+1);
}

function roomReadings(state:PuzzleState){
 const banks=roomLayout(state.floor);
 const dials=banks.flatMap(({stage})=>stage.dials);
 const values=dials.map((_,i)=>state.values[i]||0);
 return {banks,dials,values};
}

export function puzzleView(state:PuzzleState){
 if(state.floor>PUZZLE_FLOORS)return {floor:state.floor,revision:state.revision,complete:true as const};
 const {banks,dials,values}=roomReadings(state);
 return {floor:state.floor,revision:state.revision,complete:false as const,difficulty:difficultyFor(state.floor),dials,values,
  banks:banks.map(({stage,start})=>({
   start,kind:stage.kind,count:stage.dials.length,name:stage.name,target:stage.target,unit:stage.unit,plate:stage.plate,
   reading:stage.order?state.sequence:stage.measure(values.slice(start,start+stage.dials.length)),
   timed:!!stage.order,done:!!stage.order&&!!state.relayDone,
   cables:stage.cables,
   window:stage.window,
  }))};
}

export function puzzleOperate(state:PuzzleState,input:Record<string,unknown>,now:number){
 if(state.floor>PUZZLE_FLOORS||input.floor!==state.floor||input.revision!==state.revision)return {state,notice:'stale'};
 const {banks,dials,values}=roomReadings(state);
 const next={...state,revision:state.revision+1,values};
 if(input.control==='check'){
  const ready=banks.every(({stage,start})=>stage.order?state.relayDone:sameReading(stage.measure(values.slice(start,start+stage.dials.length)),stage.target));
  return ready?{state:newPuzzleState(state.floor+1,next.revision),notice:'clear'}:{state,notice:'wrong'};
 }
 const index=input.index;
 if(typeof index!=='number'||!Number.isInteger(index)||index<0||index>=dials.length)return {state,notice:'invalid'};
 const {stage,start}=banks.find(({stage,start})=>index>=start&&index<start+stage.dials.length)!;
 if(stage.order){
  if(input.control!=='pulse'||state.relayDone)return {state,notice:'invalid'};
  const delay=now-state.lastPulse;
  const valid=index-start===stage.order[state.sequence]&&(!state.sequence||delay>=stage.window![0]&&delay<=stage.window![1]);
  if(!valid)return {state:{...next,sequence:0,lastPulse:0},notice:'reset'};
  next.sequence++;next.lastPulse=now;next.relayDone=next.sequence===stage.order.length;
  return {state:next,notice:'pulse'};
 }
 const value=values[index],max=dials[index].max;
 switch(stage.kind){
  case 0:
   if(input.control!=='weight'||typeof input.value!=='number'||!Number.isInteger(input.value)||input.value<0||input.value>max)return {state,notice:'invalid'};
   next.values[index]=input.value;
   break;
  case 1: {
   const resistor=input.value;
   if(input.control!=='socket'||typeof resistor!=='number'||![1,2,4,8,16].includes(resistor)||(value^resistor)>max)return {state,notice:'invalid'};
   next.values[index]=value^resistor;
   break;
  }
  case 2:
   if(input.control!=='shiftGear')return {state,notice:'invalid'};
   next.values[index]=(value+2)%(max+1);
   break;
  case 3:
   if(input.control!=='pump')return {state,notice:'invalid'};
   next.values[index]=(value+1)%(max+1);
   break;
  case 4:
   if(input.control!=='tune'||typeof input.value!=='number'||!Number.isInteger(input.value)||input.value<0||input.value>max)return {state,notice:'invalid'};
   next.values[index]=input.value;
   break;
 }
 return {state:next,notice:'dial'};
}
export const puzzleReward=(floor:number)=>{const difficulty=difficultyFor(floor);return {coins:40*difficulty*difficulty,cores:difficulty>=3?difficulty-2:0}};
