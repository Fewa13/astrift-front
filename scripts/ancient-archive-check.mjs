// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {PUZZLE_FLOORS,newPuzzleState,puzzleStage,puzzleView,puzzleOperate,puzzleReward} from '../src/ancient-puzzle.ts';
import {GEAR,GEAR_AFFIXES,gearHuntEligible,gearHuntCounts,gearRerollQuote,rollGearItem} from '../public/ancient-gear.js';

let state=newPuzzleState(),now=20000;
for(let floor=1;floor<=PUZZLE_FLOORS;floor++){
 const stage=puzzleStage(floor);
 assert.equal(state.floor,floor);
 const operate=(control,extra={})=>puzzleOperate(state,{floor,revision:state.revision,control,...extra},now);
 const old=state;
 if(stage.order){
  assert(floor>72);
  assert(!Object.hasOwn(puzzleView(state),'order'));
  state=operate('pulse',{index:stage.order[0]}).state;
  assert.equal(state.sequence,1);
  state=operate('pulse',{index:stage.order[1]}).state;
  assert.equal(state.sequence,0,'Early trigger resets the relay');
  for(const index of stage.order){now+=1000;state=operate('pulse',{index}).state;}
 }else{
  const n=Math.floor((floor-1)/5),values=[2+n%7,3+n%5,2+n*3%8];
  for(let index=0;index<stage.dials.length;index++)for(let i=0;i<values[index];i++)state=operate('dial',{index,delta:1}).state;
  state=operate('check').state;
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
