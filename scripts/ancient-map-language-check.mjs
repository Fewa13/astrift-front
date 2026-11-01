// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {build} from 'esbuild';
const bundle=await build({stdin:{contents:"export * from './src/ancient-map-script.ts';export * from './src/ancient-map-runtime.ts';export * from './src/ancient-community.ts';",resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node'}),api=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const {compileMapScript,runMapScript,CommunityMapRuntime,setCommunityMap,communityBlocked}=api;
const vars={},temp={},shared={},items={},messages=[];
const source=`item coin "铜币" "Coin"
function square n
 return n * n
end
function reward amount
 give coin amount
 return square(amount)
end
when join
 let text "hello"
 add text " world"
 call reward 3 -> squared
 save result squared + square(4)
 if result == 0
  save branch 0
 else if result == 25 and len(text) == 11
  save branch 2
 else
  save branch 3
 end
 shared message text
 addshared visits 1
 let roll random(2, 4)
 message "{text}: {result}" "{shared.message}: {item.coin}"
 if false and (1 / 0 > 0)
  heal 999
 end
end`;
runMapScript(compileMapScript(source),'join',()=>true,{vars,temp,shared,items,random:()=>.99,message:m=>messages.push(m),heal:()=>assert.fail()});
assert.equal(vars.result,25);assert.equal(vars.branch,2);assert.equal(temp.roll,4);assert.equal(shared.visits,1);assert.equal(items.coin,3);assert.deepEqual(messages,[['hello world: 25','hello world: 3']]);
for(const code of ['let x random(5, 1)','let x 1 / 0','let x constructor','let x "x" * 3'])assert.throws(()=>runMapScript(compileMapScript(`when join\n${code}\nend`),'join',()=>true,{vars:{},items:{}}));
assert.throws(()=>compileMapScript('when join\ncall missing\nend'),/line 2/);assert.throws(()=>compileMapScript('when join\nelse\nend'),/line 2/);
assert.throws(()=>runMapScript(compileMapScript('function recurse\n call recurse\nend\nwhen join\ncall recurse\nend'),'join',()=>true,{vars:{},items:{}}),/depth limit/);
const db=new DatabaseSync(':memory:'),sql={exec(query,...args){const rows=db.prepare(query).all(...args);return {toArray:()=>rows,one:()=>rows[0]}}};
const base={id:77,name:'Runtime',revision:1,tier:3,boundary:[{x:-50,z:-50},{x:50,z:-50},{x:50,z:50},{x:-50,z:50}],spawn:{x:0,z:-30},spawns:[],npcs:[],objects:[{id:'door',model:'box',x:10,y:0,z:10,w:4,h:4,d:1,rotation:0,color:'#888888',solid:true}],code:`item coin "币" "Coin"
when join
 addshared visits 1
 task hunt "访问 {shared.visits} · {player.name}" "Visits {shared.visits} · {player.name}"
end
when kill open
 open door
 move door 12 0 10
end
when kill hide
 hide door
end
when kill close
 show door
 close door
end
when kill bad
 give coin 5
 shared broken 1
 show door
 close door
 move door 0 0 0
end
when kill done
 complete hunt
end`};
let runtime=new CommunityMapRuntime(sql);const player={name:'alice',map:'community:77',x:0,y:1.7,z:0,hp:50,maxHp:100,level:30,connectionId:'a'},spawn=()=>{};
let map=runtime.worldMap(base);setCommunityMap(map);assert.equal(communityBlocked(player.map,10,10,.6,0),true);
runtime.heartbeat(map,player,spawn);assert.match(runtime.tasks(map,player).tasks[0].title[1],/Visits 1 · alice/);
runtime.execute(map,player,'kill','open',spawn);map=runtime.worldMap(base);assert.equal(map.objects[0].scriptOpen,true);assert.equal(map.objects[0].x,12);assert.equal(communityBlocked(player.map,12,10,.6,0),false);assert.equal(runtime.worldMap(base),map,'stable cached collision/scene view');
runtime=new CommunityMapRuntime(sql);map=runtime.worldMap(base);setCommunityMap(map);assert.equal(map.objects[0].scriptOpen,true,'shared object state survives server restart');runtime.heartbeat(map,{...player,name:'bob',connectionId:'b'},spawn);assert.match(runtime.tasks(map,player).tasks[0].title[1],/Visits 2/);
runtime.execute(map,player,'kill','close',spawn);map=runtime.worldMap(base);assert.equal(communityBlocked(player.map,12,10,.6,0),true);assert.equal(map.objects[0].rotation,0,'no accumulating rotation');
runtime.execute(map,player,'kill','hide',spawn);map=runtime.worldMap(base);assert.equal(map.objects[0].scriptHidden,true);assert.equal(communityBlocked(player.map,12,10,.6,0),false);
assert.throws(()=>runtime.execute(map,player,'kill','bad',spawn),/trap/);assert.equal(runtime.bag(map,player.name).items.length,0,'failed event does not grant items');map=runtime.worldMap(base);assert.equal(map.objects[0].scriptHidden,true,'failed event restores objects');assert.equal(runtime.logs(77).length,1);assert.match(runtime.logs(77)[0].message,/trap/);
const sharedData=JSON.parse(db.prepare('SELECT data FROM community_script_shared WHERE map=77').get().data);assert.equal(sharedData.vars.broken,undefined,'failed event restores shared variables');
runtime.execute(map,player,'kill','done',spawn);assert.equal(runtime.tasks(map,player).tasks[0].done,true);runtime.leave(player.name,'a');runtime=new CommunityMapRuntime(sql);assert.equal(runtime.tasks(map,player).tasks[0].done,true,'tasks persist after leaving');assert.equal(runtime.logs(77).length,1);runtime.logs(77,true);assert.equal(runtime.logs(77).length,0);
console.log('PASS functions/returns, else-if, expressions, strings, randomness, short circuit, recursion/budget errors, persistent shared variables/tasks/objects, collision updates, rollback and persistent logs.');
