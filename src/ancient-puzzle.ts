// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const PUZZLE_FLOORS=120;
export type PuzzleState={floor:number;revision:number;values:number[];sequence:number;lastPulse:number};
type Text=[string,string];
type Dial={label:Text;max:number};
type Stage={name:Text;hint:Text;difficulty:number;dials:Dial[];target:number;measure:(values:number[])=>number;unit:string;order?:number[];window?:[number,number];formula?:Text;calibration?:{label:Text;unit:string;target:number;measure:(values:number[])=>number}};
export const newPuzzleState=(floor=1,revision=0):PuzzleState=>({floor,revision,values:[],sequence:0,lastPulse:0});
function buildStage(floor:number):Stage{
 const difficulty=Math.min(5,Math.ceil(floor/24)),i=floor-1,n=Math.floor(i/5),kind=i%5;
 const dial=(zh:string,en:string,max:number):Dial=>({label:[zh,en],max}),a=2+n%7,b=3+n%5,c=2+(n*3)%8,d=4+(n*5)%7;
 if(difficulty>=4&&kind===4){
  const count=difficulty===5?7:6;
  const stations=Array.from({length:count},(_,j)=>j).sort((x,y)=>
   Math.sin(x*13.4+n*9.1)-Math.sin(y*13.4+n*9.1)||x-y);
  const cable=Array.from({length:count},(_,j)=>12+stations.indexOf(j)*7+(n+j)%5);
  return {name:['信号接力','Signal relay'],hint:[`导线传播速度相同。按最短到最长依次触发，每两次触发之间等待 ${difficulty===5?'0.75–1.35':'0.6–1.8'} 秒。线长：`+cable.map((v,j)=>`${j+1}号 ${v}m`).join(' · '),`Signals travel at equal speeds. Trigger shortest to longest, leaving ${difficulty===5?'0.75–1.35':'0.6–1.8'} seconds between presses. Cable lengths: `+cable.map((v,j)=>`#${j+1} ${v}m`).join(' · ')],difficulty,dials:cable.map((_,j)=>dial('触点 '+(j+1),'Contact '+(j+1),0)),target:count,measure:()=>0,unit:'',order:stations,window:difficulty===5?[750,1350]:[600,1800]};
 }
 const max=8+difficulty*2,extra=difficulty>=3;
 if(kind===0){const arm=2+n%6,other=5+n%7,trim=extra?3+n%4:0;return {name:['力矩平衡','Torque balance'],hint:[`左右力矩相等才会平衡。左侧 ${arm}m，右侧 ${other}m`+(extra?`，另有左侧 ${trim}m 微调臂。`:'。'),`Balance the moments. Left arm ${arm}m, right arm ${other}m`+(extra?`, with a ${trim}m left trim arm.`:'.')],difficulty,dials:[dial('左载荷 (N)','Left load (N)',max),dial('右载荷 (N)','Right load (N)',max),...(extra?[dial('微调载荷 (N)','Trim load (N)',max)]:[])],target:arm*a-other*b+trim*c,measure:v=>arm*v[0]-other*v[1]+trim*(v[2]||0),unit:'N·m',formula:['用配重把净力矩调到目标值，抵消装置原有的偏载。','Set the net moment to the target to counter the existing load.']};}
 if(kind===1){const supply=12+n%7,shunt=extra?2+n%3:0;const measure=(v:number[])=>supply/(1+v[0]+v[1]+(shunt?(v[2]+1)*shunt/(v[2]+1+shunt):0));return {name:['电阻桥','Resistance bridge'],hint:[`${supply}V 电源，固定串联电阻 1Ω。`+(extra?`末级可调电阻另与 ${shunt}Ω 并联；末级刻度需加 1Ω。`:''),`${supply}V supply and a fixed 1Ω series resistor. `+(extra?`The last resistor (dial + 1Ω) is parallel with ${shunt}Ω.`:'')],difficulty,dials:[dial('电阻 A','Resistor A',max),dial('电阻 B','Resistor B',max),...(extra?[dial('末级电阻','Last resistor',max)]:[])],target:measure([a,b,c]),measure,unit:'A',formula:['串联电阻相加，并联电阻用乘积除以和。I = V ÷ R。','Add series resistances. For the parallel pair, divide the product by the sum. I = V ÷ R.']};}
 if(kind===2){const motor=60+12*(n%9),measure=(v:number[])=>motor*(v[0]+8)/(v[1]+12)*(extra?(v[2]+8)/(12+d):1);return {name:['传动齿轮','Gear train'],hint:[`电机 ${motor} rpm。主动轮齿数为刻度 +8，从动轮为刻度 +12。`+(extra?`同轴二级主动轮为末档刻度 +8，最终从动轮 ${12+d} 齿。`:''),`Motor: ${motor} rpm. Driver teeth = dial +8; driven teeth = dial +12. `+(extra?`Second driver: last dial +8, final driven gear: ${12+d} teeth.`:'')],difficulty,dials:[dial('主动轮','Driver',max),dial('从动轮','Driven gear',max),...(extra?[dial('二级主动轮','Second driver',max)]:[])],target:measure([a,b,c]),measure,unit:'rpm',formula:['每级转速乘以主动齿数 ÷ 从动齿数。','At each stage multiply speed by driver teeth ÷ driven teeth.']};}
 if(kind===3){const piston=2+n%4,load=extra?d:0,measure=(v:number[])=>((v[0]+1)/piston)*(v[1]+1)-(extra?load*(v[2]+1):0);return {name:['液压升降','Hydraulic lift'],hint:[`输入活塞面积 ${piston} cm²，输入力和输出活塞面积都等于刻度 +1。`+(extra?`副缸反向施加 ${load} ×（副缸刻度 +1）N。`:''),`Input piston: ${piston} cm². Input force and output piston area both equal dial +1. `+(extra?`The counter-cylinder applies ${load} × (dial +1) N in the opposite direction.`:'')],difficulty,dials:[dial('输入力','Input force',max),dial('输出面积','Output area',max),...(extra?[dial('副缸','Counter-cylinder',max)]:[])],target:measure([a,b,c]),measure,unit:'N',formula:['压强 = 力 ÷ 面积；输出力 = 压强 × 输出面积，再减去反向力。','Pressure = force ÷ area; output force = pressure × output area, minus opposing force.']};}
 const frequency=2+n%7,measure=(v:number[])=>2*(v[0]+1)*(frequency+(extra?v[2]:0))/(v[1]+1);
 return {name:['驻波共振','Standing wave'],hint:[`两端固定。长度与谐波阶数都等于刻度 +1。`+(extra?`频率为 ${frequency} + 第三档刻度 Hz。`:`频率固定为 ${frequency} Hz。`),`Both ends are fixed. Length and harmonic number each equal dial +1. Frequency is ${frequency} Hz`+(extra?' plus the third dial.':'.')],difficulty,dials:[dial('长度','Length',max),dial('谐波','Harmonic',max),...(extra?[dial('频率','Frequency',max)]:[])],target:measure([a,b,c]),measure,unit:'m/s',formula:['两端固定时 λ = 2L ÷ 谐波阶数，波速 = 频率 × 波长。','For fixed ends λ = 2L ÷ harmonic number. Wave speed = frequency × wavelength.']};
}
export function puzzleStage(floor:number):Stage{
 const stage=buildStage(floor);
 if(stage.difficulty<4||stage.order)return stage;
 const i=floor-1,n=Math.floor(i/5),solution=[2+n%7,3+n%5,2+n*3%8];
 const options:[Text,string,(v:number[])=>number][]=[
  [['支点总载荷','Total load at the fulcrum'],'N',v=>v[0]+v[1]+v[2]],
  [['电阻 A 功率 I²R','Resistor A power I²R'],'W',v=>stage.measure(v)**2*v[0]],
  [['第一级两轮齿数之和','First-stage total tooth count'],'',v=>v[0]+v[1]+20],
  [['输入压强','Input pressure'],'N/cm²',v=>(v[0]+1)/(2+n%4)],
  [['驻波波长','Standing-wave wavelength'],'m',v=>2*(v[0]+1)/(v[1]+1)],
 ];
 const [label,unit,measure]=options[i%5];
 return {...stage,calibration:{label,unit,measure,target:measure(solution)}};
}
const sameReading=(a:number,b:number)=>Math.round(a*1000)===Math.round(b*1000);
export function puzzleView(state:PuzzleState){
 if(state.floor>PUZZLE_FLOORS)return {floor:state.floor,revision:state.revision,complete:true as const};
 const stage=puzzleStage(state.floor),values=stage.dials.map((_,i)=>state.values[i]||0);
 return {floor:state.floor,revision:state.revision,complete:false as const,name:stage.name,hint:stage.hint,formula:stage.formula,difficulty:stage.difficulty,dials:stage.dials,values,target:stage.target,reading:stage.measure(values),unit:stage.unit,calibration:stage.calibration&&{label:stage.calibration.label,unit:stage.calibration.unit,target:stage.calibration.target,reading:stage.calibration.measure(values)},timed:!!stage.order,sequence:state.sequence,lastPulse:state.lastPulse,window:stage.window};
}
export function puzzleOperate(state:PuzzleState,input:Record<string,unknown>,now:number){
 if(state.floor>PUZZLE_FLOORS||input.floor!==state.floor||input.revision!==state.revision)return {state,notice:'stale'};
 const stage=puzzleStage(state.floor),next={...state,revision:state.revision+1,values:stage.dials.map((_,i)=>state.values[i]||0)};
 if(stage.order){
  if(input.control!=='pulse'||!Number.isInteger(input.index)||Number(input.index)<0||Number(input.index)>=stage.dials.length)return {state,notice:'invalid'};
  const delay=now-state.lastPulse,valid=input.index===stage.order[state.sequence]&&(!state.sequence||delay>=stage.window![0]&&delay<=stage.window![1]);
  if(!valid)return {state:{...next,sequence:0,lastPulse:0},notice:'reset'};
  if(next.sequence+1===stage.order.length)return {state:newPuzzleState(state.floor+1,next.revision),notice:'clear'};
  next.sequence++;next.lastPulse=now;return {state:next,notice:'pulse'};
 }
 if(input.control==='check'){
  if(sameReading(stage.measure(next.values),stage.target)&&(!stage.calibration||sameReading(stage.calibration.measure(next.values),stage.calibration.target)))return {state:newPuzzleState(state.floor+1,next.revision),notice:'clear'};
  return {state,notice:'wrong'};
 }
 const index=Number(input.index),delta=input.delta;
 if(input.control!=='dial'||!Number.isInteger(index)||index<0||index>=stage.dials.length||delta!==1&&delta!==-1)return {state,notice:'invalid'};
 next.values[index]=Math.max(0,Math.min(stage.dials[index].max,next.values[index]+delta));
 return {state:next,notice:'dial'};
}
export const puzzleReward=(floor:number)=>{const difficulty=puzzleStage(floor).difficulty;return {coins:40*difficulty*difficulty,cores:difficulty>=3?difficulty-2:0}};
