// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {MapValue,MapText} from './ancient-map-script';
export const MAP_SCRIPT_KEYS=['KeyG','KeyH','KeyJ','KeyK','KeyL','KeyO','KeyP','KeyU','KeyV','KeyB','KeyN','KeyT'];
export const MAP_GAME_COMMANDS:Record<string,{count:number;literals:number[]}>= {
 checkpoint:{count:3,literals:[]},clearcheckpoint:{count:0,literals:[]},deathitems:{count:1,literals:[0]},deathloss:{count:2,literals:[0]},
 effect:{count:6,literals:[0,1]},stopeffect:{count:1,literals:[0]},sound:{count:8,literals:[0,1]},stopsound:{count:1,literals:[0]},sky:{count:1,literals:[]},fog:{count:2,literals:[]},environmentreset:{count:0,literals:[]},
 round:{count:2,literals:[0]},stage:{count:1,literals:[]},nextstage:{count:0,literals:[]},resetround:{count:0,literals:[]},stat:{count:2,literals:[0]},resetstats:{count:0,literals:[]},
 craft:{count:2,literals:[0]},roll:{count:2,literals:[0]},input:{count:6,literals:[0,1,2]},option:{count:4,literals:[0]},progress:{count:6,literals:[0,1]}
};
export type MapStats={speed?:number;jump?:number;health?:number;damage?:number};
export type MapCheckpoint={x:number;y:number;z:number};
export type MapEffect={id:string;kind:string;x:number;y:number;z:number;started:number;until:number;volume?:number;pitch?:number};
export type MapRound={phase:string;stage:number;number:number;started:number;until:number;revision:number};
export type MapGameState={stats?:MapStats;checkpoint?:MapCheckpoint;deathItems?:'keep'|'clear';deathLoss?:Record<string,number>;deathHandled?:boolean;phaseToken?:number;inputs?:Record<string,MapValue>};
export type MapGameShared={round?:MapRound;environment?:{sky?:string;fog?:string;density?:number};effects?:Record<string,MapEffect>;sounds?:Record<string,MapEffect>};
export type MapRecipe={id:string;output:string;quantity:number;ingredients:{item:string;quantity:number}[]};
export type MapLoot={id:string;entries:{item:string;quantity:number;weight:number}[]};
export const mapText=(v:MapValue[],limit=120):MapText=>{const t=v.map(String);if(t.length!==2||t.some(s=>!s.trim()||s.length>limit))throw Error('Chinese/English text required (max '+limit+')');return t as MapText};
export function mapRange(v:MapValue,min:number,max:number,integer=false){if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max||integer&&!Number.isInteger(v))throw Error('Expected '+(integer?'integer ':'number ')+min+'–'+max);return v;}
export function mapHex(v:MapValue){if(typeof v!=='string'||!/^#[0-9a-f]{6}$/i.test(v))throw Error('Use a quoted #RRGGBB color');return v;}
export function runMapGameCommand(op:string,args:string[],v:MapValue[],s:MapGameState&{items:Record<string,number>;ui?:Record<string,import('./ancient-map-script').MapUIElement>},shared:MapGameShared,program:import('./ancient-map-script').MapProgram,actor:{hp:number;maxHp?:number;mapModifiers?:MapStats;skillBaseHp?:number},now:number,safe:(x:number,y:number,z:number)=>void){
 const id=args[0],num=(i:number,min:number,max:number,int=false)=>mapRange(v[i],min,max,int),item=(id:string)=>{if(!program.items.some(i=>i.id===id))throw Error('Unknown map item '+id)},round=()=>shared.round??(shared.round={phase:'waiting',stage:1,number:0,started:now,until:0,revision:0});
 if(op==='checkpoint'){const [x,y,z]=v.map(Number);safe(x,y,z);s.checkpoint={x,y,z};return}
 if(op==='clearcheckpoint'){delete s.checkpoint;return}
 if(op==='deathitems'){if(!['keep','clear'].includes(id))throw Error('deathitems keep|clear');s.deathItems=id as 'keep'|'clear';return}
 if(op==='deathloss'){item(id);(s.deathLoss??={})[id]=num(0,0,999999,true);return}
 if(op==='stat'){const bounds:Record<string,number[]>={speed:[.25,3],jump:[.25,2],health:[1,1e9],damage:[0,10]};if(!bounds[id])throw Error('stat speed|jump|health|damage');const value=num(0,bounds[id][0],bounds[id][1]);(s.stats??={})[id as keyof MapStats]=value;actor.mapModifiers={...s.stats};if(id==='health'){const ratio=actor.hp/(actor.maxHp||100);actor.maxHp=value;actor.skillBaseHp=value;actor.hp=Math.min(value,Math.max(0,ratio*value))}return}
 if(op==='resetstats'){s.stats={};actor.mapModifiers={};return}
 if(op==='effect'||op==='sound'){const kinds=op==='effect'?['flash','beam','ring','sparks']:['chime','bell','rumble','wind','danger'];if(!kinds.includes(args[1]))throw Error('Unsupported '+op+' kind');const x=num(0,-10000,10000),y=num(1,0,500),z=num(2,-10000,10000),list=op==='effect'?(shared.effects??={}):(shared.sounds??={});for(const [k,e]of Object.entries(list))if(e.until<=now)delete list[k];if(!list[id]&&Object.keys(list).length>=(op==='effect'?16:8))throw Error('Too many active '+op+'s');const duration=op==='effect'?num(3,.1,30):num(5,.1,20);list[id]={id,kind:args[1],x,y,z,started:now,until:now+duration*1000,...(op==='sound'?{volume:num(3,0,1),pitch:num(4,.25,4)}:{})};return}
 if(op==='stopeffect'||op==='stopsound'){delete (op==='stopeffect'?shared.effects??{}:shared.sounds??{})[id];return}
 if(op==='sky'){(shared.environment??={}).sky=mapHex(v[0]);return}
 if(op==='fog'){Object.assign(shared.environment??={},{fog:mapHex(v[0]),density:num(1,0,.08)});return}
 if(op==='environmentreset'){shared.environment={};return}
 if(op==='round'){if(!/^[a-zA-Z_][\w-]{0,63}$/.test(id))throw Error('Invalid phase');const r=round(),duration=num(0,0,3600);if(id==='countdown')r.number++;Object.assign(r,{phase:id,started:now,until:duration?now+duration*1000:0,revision:r.revision+1});return}
 if(op==='stage'||op==='nextstage'){const r=round();r.stage=op==='stage'?num(0,1,10000,true):Math.min(10000,r.stage+1);return}
 if(op==='resetround'){const r=round();shared.round={phase:'waiting',stage:1,number:r.number,started:now,until:0,revision:r.revision+1};shared.effects={};shared.sounds={};return}
 if(op==='craft'||op==='roll'){const count=num(0,1,16,true),balances={...s.items},add=(itemId:string,q:number)=>{const n=(balances[itemId]||0)+q;if(n<0)throw Error('Not enough map items');if(n>999999)throw Error('Map item stack full');balances[itemId]=n};if(op==='craft'){const r=program.recipes?.find(r=>r.id===id);if(!r)throw Error('Unknown recipe '+id);for(const i of r.ingredients)add(i.item,-i.quantity*count);add(r.output,r.quantity*count)}else{const table=program.loot?.find(t=>t.id===id);if(!table)throw Error('Unknown loot '+id);const sum=table.entries.reduce((a,e)=>a+e.weight,0);for(let i=0;i<count;i++){let pick=Math.random()*sum;const e=table.entries.find(e=>(pick-=e.weight)<0)||table.entries.at(-1)!;add(e.item,e.quantity)}}for(const k of Object.keys(s.items))delete s.items[k];Object.assign(s.items,balances);return}
 if(['input','option','progress'].includes(op)){s.ui??={};const ui=s.ui;if(op==='option'){const e=ui[id];if(e?.kind!=='input'||e.inputType!=='select')throw Error('Define select input first');e.options??=[];if(e.options.length>=30||e.options.some(o=>o.value===v[0]))throw Error('Maximum 30 unique options');e.options.push({value:v[0],title:mapText(v.slice(1))});return}const parent=args[1];if(ui[parent]?.kind!=='panel')throw Error('Define parent panel first');if(ui[id]&&ui[id].kind!==op)throw Error('UI identifier already used');if(!ui[id]&&Object.keys(ui).length>=40)throw Error('Maximum 40 UI elements');if(op==='input'){if(!['text','number','check','select'].includes(args[2]))throw Error('input text|number|check|select');const type=args[2] as 'text'|'number'|'check'|'select',value=v[2];if(type==='number'&&(typeof value!=='number'||!Number.isFinite(value))||type==='check'&&typeof value!=='boolean'||type==='text'&&(typeof value!=='string'||value.length>200))throw Error('Invalid input default');ui[id]={id,kind:'input',panel:parent,inputType:type,title:mapText(v.slice(0,2)),value,options:[]};(s.inputs??={})[id]=value}else{ui[id]={id,kind:'progress',panel:parent,value:v[0],maximum:v[1],title:mapText(v.slice(2))}}return}
 throw Error('Unsupported map command '+op);
}
