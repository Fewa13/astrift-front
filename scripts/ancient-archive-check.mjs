// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {PUZZLE_FLOORS,newPuzzleState,puzzleView,puzzleOperate,puzzleReward,TILE_NEIGHBORS} from '../src/ancient-puzzle.ts';
import {GEAR,GEAR_AFFIXES,gearHuntEligible,gearHuntCounts,gearRerollQuote,rollGearItem} from '../public/ancient-gear.js';

let state=newPuzzleState(),now=20000;
for(let floor=1;floor<=PUZZLE_FLOORS;floor++){
 const room=puzzleView(state);
 assert.equal(room.floor,floor);
 assert(room.banks.length>=8&&room.banks.length<=24);
 const activate=index=>puzzleOperate(state,{floor,revision:state.revision,control:'activate',index},now);
 const old=state;
 assert.equal(activate(-1).notice,'locked');
 assert.equal(activate(room.banks.at(-1).start).notice,'locked');
 for(const bank of room.banks){
  if(bank.kind===7){
   for(let first=0;first<bank.count;first++){
    if(state.floor!==floor)break;
    if(state.values[bank.start+first])continue;
    if(state.pair!==bank.start+first)state=activate(bank.start+first).state;
    for(let second=first+1;second<bank.count;second++){
     if(state.values[bank.start+second])continue;
     const result=activate(bank.start+second);state=result.state;
     if(result.notice!=='wrongPair')break;
     state=activate(bank.start+first).state;
    }
   }
   if(state.floor===floor)assert(puzzleView(state).banks.find(item=>item.start===bank.start).done);
   continue;
  }
  if(bank.kind>=9){
   const press=i=>{const result=activate(bank.start+i);assert.notEqual(result.state,state);state=result.state;};
   if(bank.kind===9){
    press(0);press(0);for(let i=2;i<bank.count;i++)press(i);
   }else if(bank.kind===10){
    for(let i=1;i<bank.count;i++)press(i);
   }else if(bank.kind===11){
    press(0);press(0);for(let i=2;i<bank.count;i++)if(bank.target[i])press(i);
   }else if(bank.kind===12){
    const total=bank.target.reduce((a,b)=>a+b,0);
    let split=0;
    for(let mask=1;mask<1<<bank.count;mask++){
     if(bank.target.reduce((sum,v,i)=>sum+((mask>>i)&1)*v,0)*2===total){split=mask;break;}
    }
    assert(split);
    for(let i=0;i<bank.count;i++){press(i);if((split>>i)&1)press(i);}
   }else if(bank.kind===13){
    let orientation=1;
    for(let i=0;i<bank.count;i++){if(i&&bank.target[i])orientation=3-orientation;for(let j=0;j<orientation;j++)press(i);}
   }else if(bank.kind===14){
    const queue=[{tiles:bank.initial,steps:[]}],seen=new Set([bank.initial.join('')]);
    for(const {tiles,steps} of queue){
     if(tiles.every((v,i)=>v===bank.target[i])){steps.forEach(press);break;}
     const gap=tiles.indexOf(0);
     for(const i of TILE_NEIGHBORS[gap]){
      const moved=tiles.slice();
      [moved[gap],moved[i]]=[moved[i],moved[gap]];
      const key=moved.join('');
      if(!seen.has(key)){seen.add(key);queue.push({tiles:moved,steps:[...steps,i]});}
     }
    }
   }else if(bank.kind===15){
    for(const i of bank.target){now=(Math.floor(now/(950*bank.count))*bank.count+bank.count+i)*950+475;press(i);}
   }else if(bank.kind===16){
    press(0);now+=6500;press(bank.count-1);
    assert.equal(state.values[bank.start],0);
    press(0);now+=3200;press(bank.count-1);
   }else{
    const current=bank.initial.slice();
    for(let i=0;i<bank.count;i++){
     if(current[i]===bank.target[i])continue;
     const j=current.indexOf(bank.target[i]);
     press(j);press(i);press(j);
     [current[i],current[j]]=[current[j],current[i]];
    }
   }
   if(state.floor===floor)assert(puzzleView(state).banks.find(item=>item.start===bank.start).done,'chamber '+bank.kind+' on floor '+floor);
   continue;
  }
  let steps;
  if(bank.kind===1)steps=bank.target.flatMap((turns,index)=>Array(turns).fill(index));
  else if(bank.kind===4)steps=bank.symbols.flatMap((_,index)=>index%2===0?[index]:[]);
  else if(bank.kind===0)steps=[0];
  else steps=bank.target;
  if([2,3,8].includes(bank.kind)){
   const wrong=(steps[0]+1)%bank.count;
   assert.equal(activate(bank.start+wrong).notice,'reset');
   state=activate(bank.start+steps[0]).state;
   assert.equal(state.values[bank.start],1);
   const restarted=activate(bank.start+steps[0]);
   assert.equal(restarted.notice,'reset');
   assert.equal(restarted.state.values[bank.start],0);
   state=restarted.state;
  }
  if(bank.kind===6){
   state=activate(bank.start).state;
   now=state.deadline;
   state=activate(bank.start+1).state;
   assert.equal(state.values[bank.start],0,'expired lamps reset');
  }
  for(const index of steps){
   if(state.floor!==floor||puzzleView(state).banks.find(item=>item.start===bank.start).done)break;
   const result=activate(bank.start+index);
   assert.notEqual(result.state,state);
   state=result.state;
  }
  if(state.floor===floor)assert(puzzleView(state).banks.find(item=>item.start===bank.start).done);
 }
 assert.equal(state.floor,floor+1,'Floor '+floor+' must be solvable');
 assert.equal(puzzleOperate(state,{floor,revision:old.revision,control:'activate',index:0},now).notice,'stale');
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
console.log('PASS: all 120 floors solvable; sequence and stale input checks; rewards scale; eligible hunt sources; rerolls preserve unrelated affixes.');

const {DatabaseSync}=await import('node:sqlite'),{build}=await import('esbuild'),vm=await import('node:vm');
const db=new DatabaseSync(':memory:'),sql={exec(query,...args){const rows=db.prepare(query).all(...args);return {toArray:()=>rows}}};
const ctx={getWebSockets:()=>[],storage:{sql,getAlarm:async()=>null,setAlarm:async()=>{},transactionSync(fn){db.exec('BEGIN');try{const r=fn();db.exec('COMMIT');return r;}catch(error){db.exec('ROLLBACK');throw error;}}}};
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
sql.exec('INSERT INTO ancient_abilities VALUES(?,?)','global-puzzle-v1',JSON.stringify(newPuzzleState(30)));
const oldProfile=server.read('puzzle-a');
oldProfile.puzzleClaimed=29;
server.save('puzzle-a',oldProfile);
const first=(await server.command('puzzle-a','puzzleEnter',{})).puzzle;
const other=(await server.command('puzzle-b','puzzleEnter',{})).puzzle;
assert.equal(first.floor,1);
assert.equal(other.floor,1);
assert.equal(first.claimed,0);
const press={floor:1,revision:first.revision,control:'activate',index:first.banks[0].start};
assert.equal((await server.command('puzzle-a','puzzleOperate',press)).puzzle.banks[0].done,true);
assert.equal((await server.command('puzzle-a','puzzleOperate',press)).puzzle.notice,'stale');
assert.equal((await server.command('puzzle-b','puzzleState',{})).puzzle.banks[0].done,false);
assert.equal((await server.command('puzzle-a','puzzleEnter',{})).puzzle.banks[0].done,true);
const board=(await server.command('puzzle-b','puzzleLeaderboard',{})).leaderboard;
assert.equal(board.players.length,1);
assert.equal(board.players[0].rooms,1);
sql.exec('INSERT INTO ancient_puzzle_titles VALUES(?,?,?,?)','puzzle-a',1,Date.now()+60000,0);
assert.equal((await server.command('puzzle-a','equipPuzzleTitle',{worn:true})).profile.puzzleTitle.worn,true);
assert.equal((await server.command('puzzle-a','equipPuzzleTitle',{worn:false})).profile.puzzleTitle.worn,false);
assert.equal((await server.command('puzzle-b','equipPuzzleTitle',{worn:true})).ok,false);
console.log('PASS: old puzzle progress reset, independent puzzle commands, reconnect persistence, replay-safe scores and title equipment.');
db.close();
console.log('PASS: actual AncientWorld commands redeem once, charge once, keep or replace a single affix, and reject replay.');
