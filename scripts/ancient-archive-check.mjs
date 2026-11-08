// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {PUZZLE_FLOORS,newPuzzleState,puzzleView,puzzleOperate,puzzleReward} from '../src/ancient-puzzle.ts';
import {GEAR,GEAR_AFFIXES,gearHuntEligible,gearHuntCounts,gearRerollQuote,rollGearItem} from '../public/ancient-gear.js';

let state=newPuzzleState(),now=20000;
for(let floor=1;floor<=PUZZLE_FLOORS;floor++){
 const room=puzzleView(state);
 assert.equal(room.floor,floor);
 assert(room.banks.length>=8&&room.banks.length<=24);
 const operate=(control,extra={})=>puzzleOperate(state,{floor,revision:state.revision,control,...extra},now);
 const old=state;
 const first=room.banks.find(bank=>!bank.done);
 assert.equal(operate('weight',{index:first.start,value:999}).notice,'invalid');
 assert.equal(operate('weight',{index:room.banks.at(-1).start,value:1}).notice,'locked');
 for(const [i,bank] of room.banks.entries()){
  if(state.floor!==floor)break;
  if(puzzleView(state).banks[i].done)continue;
  if(bank.timed){
   const order=bank.cables.map((length,index)=>({length,index})).sort((a,b)=>a.length-b.length).map(v=>bank.start+v.index);
   assert(floor>72);
   state=operate('pulse',{index:order[0]}).state;
   assert.equal(state.sequence,1);
   state=operate('pulse',{index:order[1]}).state;
   assert.equal(state.sequence,0,'Early trigger resets the relay');
   for(const index of order){now+=1000;state=operate('pulse',{index}).state;}
   continue;
  }
  const n=floor*17+i*13,solution=[2+n%7,3+n%5,2+n*3%8];
  if(bank.kind===0){
   const [left,right,trim=0]=bank.plate.split(" / ").map(parseFloat);
   if(left*solution[0]-right*solution[1]+trim*solution[2]===0)solution[0]++;
  }
  for(let j=0;j<bank.count&&state.floor===floor&&!puzzleView(state).banks[i].done;j++){
   const index=bank.start+j,value=solution[j];
   if(bank.kind===0)state=operate('weight',{index,value}).state;
   else if(bank.kind===1){
    for(const bit of [1,2,4,8,16])if(value&bit)state=operate('socket',{index,value:bit}).state;
   }else if(bank.kind===2||bank.kind===3){
    for(let k=0;k<=room.dials[index].max&&state.floor===floor&&!puzzleView(state).banks[i].done&&(state.values[index]||0)!==value;k++)
     state=operate(bank.kind===2?'shiftGear':'pump',{index}).state;
   }else state=operate('tune',{index,value}).state;
   if(state.floor===floor&&!puzzleView(state).banks[i].done)assert.equal(state.values[index],value);
  }
 }

 assert.equal(state.floor,floor+1,'Floor '+floor+' must be solvable');
 assert.equal(puzzleOperate(state,{floor,revision:old.revision,control:'check'},now).notice,'stale');
 if(floor>1)assert(puzzleReward(floor).coins>=puzzleReward(floor-1).coins);
}
assert.equal(PUZZLE_FLOORS,120);
assert.equal(puzzleView(state).complete,true);
const targets=Object.keys(GEAR).filter(gearHuntEligible);
assert(targets.length>0);
assert(targets.some(key=>gearHuntCounts(key,'lord','tribe',30)));
assert(targets.every(key=>!gearHuntCounts(key,'grox','tribe',150)&&!gearHuntCounts(key,'lord','community:5',150)));
for(const key of [...targets,'skyArmor']){
 const item=rollGearItem(key,()=>.33),snapshot=structuredClone(item);
 for(const [i,old] of item.affixes.entries()){
  const quote=gearRerollQuote(item,i,()=>.6);
  assert(quote);
  assert(!item.affixes.some((a,j)=>i!==j&&a.key===quote.candidate.key));
  assert.equal(!!GEAR_AFFIXES[old.key].quality,!!GEAR_AFFIXES[quote.candidate.key].quality);
 }
 assert.deepEqual(item,snapshot);
}
console.log('PASS: all 120 floors solvable; timing and stale input checks; rewards scale; eligible hunt sources; rerolls preserve unrelated affixes.');

const {DatabaseSync}=await import('node:sqlite'),{build}=await import('esbuild'),vm=await import('node:vm');
const db=new DatabaseSync(':memory:'),sql={exec(query,...args){const rows=db.prepare(query).all(...args);return {toArray:()=>rows}}};
const ctx={getWebSockets:()=>[],storage:{sql,setAlarm:async()=>{},transactionSync(fn){db.exec('BEGIN');try{const r=fn();db.exec('COMMIT');return r;}catch(error){db.exec('ROLLBACK');throw error;}}}};
const bundle=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']});
const module={exports:{}};
vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,Date,Math,crypto,URL,AbortController,structuredClone,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx;}}})});
const server=new module.exports.AncientWorld(ctx,{});
const name='workshop-qa',profile=server.read(name),item=rollGearItem('armor2');
profile.level=50;profile.gear.push(item);profile.materials.fieldSalvage2=90;
server.save(name,profile);
const tracked=targets.find(key=>gearHuntCounts(key,'lord','tribe',30)&&GEAR[key].quality===2);
assert((await server.command(name,'gearHuntSet',{key:tracked})).ok);
assert(!(await server.command(name,'gearHuntClaim',{})).ok);
const hunter=server.read(name);hunter.gearHunt.count=100;
server.save(name,hunter);
const claimed=await server.command(name,'gearHuntClaim',{});
assert(claimed.ok);
assert(claimed.profile.gear.some(v=>v.key===tracked));
assert(!(await server.command(name,'gearHuntClaim',{})).ok);
const opened=await server.command(name,'gearRerollStart',{id:item.id,index:0});
assert(opened.ok,opened.error);
const repeated=await server.command(name,'gearRerollStart',{id:item.id,index:0});
assert.equal(repeated.profile.materials.fieldSalvage2,opened.profile.materials.fieldSalvage2);
assert.deepEqual(repeated.profile.gearReroll,opened.profile.gearReroll);
const committed=await server.command(name,'gearRerollChoose',{id:item.id,replace:true});
assert(committed.ok,committed.error);
const changed=committed.profile.gear.find(v=>v.id===item.id);
assert.deepEqual(changed.affixes[0],opened.profile.gearReroll.candidate);
assert.equal(JSON.stringify(changed.affixes.slice(1)),JSON.stringify(item.affixes.slice(1)));
assert(!(await server.command(name,'gearRerollChoose',{id:item.id,replace:true})).ok);
const before=await server.command(name,'gearRerollStart',{id:item.id,index:0});
assert(before.ok,before.error);
const kept=await server.command(name,'gearRerollChoose',{id:item.id,replace:false});
assert(kept.ok);
assert.deepEqual(kept.profile.gear.find(v=>v.id===item.id).affixes,changed.affixes);
db.close();
console.log('PASS: actual AncientWorld commands redeem once, charge once, keep or replace a single affix, and reject replay.');
