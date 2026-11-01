// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
import {LEISURE_NODES,leisureCommand,fishingPull,leisureRecipe,sellLeisure,rollFish,leisureNear,UPLAND_FISH_WEIGHTS,tribeMineWallCovered} from '../public/ancient-leisure.js';
import {newAncientProfile,blocked,lineClear,TRIBE_COLLIDERS,ancientMapHeight} from '../public/ancient-rules.js';
import {forestInside,FOREST_TREES,forestPath} from '../public/ancient-forest.js';
import {craftAncientGear} from '../public/ancient-gear.js';
import {ancientProfileHealth} from '../public/ancient-gear.js';
for(const [x,z]of [[37,84],[50,84],[74,90],[74,110],[74,132],[38,132]])assert(!blocked(x,z,.6,'tribe'));
for(const [x,z]of [[-34,40],[-50,40],[-50,60],[-50,85],[-34,85]])assert(!blocked(x,z,.6,'forest'));
assert(blocked(50,110,.6,'tribe'));assert(blocked(86,110,.6,'tribe'));assert(blocked(-67,60,.6,'forest'));
assert(!lineClear(50,1.7,84,50,1.7,132,'tribe'));assert(!lineClear(-50,1.7,60,-30,1.7,60,'forest'));
assert(forestPath(-50,60,-28,40).length,'Forest navigation reaches the new passage');
// All original spawning footprints retain exactly the same collision result.
for(let x=-27;x<=27;x+=1.5)for(let z=31;z<590;z+=3.7){
 const old=Math.abs(x)>38||z<3||z>597||TRIBE_COLLIDERS.some(o=>0<o.h-.05&&1.7>(o.bottom||0)+.02&&Math.abs(x-o.x)<o.w/2+1&&Math.abs(z-o.z)<o.d/2+1);
 assert.equal(blocked(x,z,1,'tribe'),old,'Original tribe spawn geometry unchanged');
}
for(const z of [78,90,126,138]){for(let x=39.5;x<59;x++)assert(tribeMineWallCovered(1,x,z),'Mountain owns the portal wall face');assert(!tribeMineWallCovered(1,59.5,z));assert(!tribeMineWallCovered(0,84,z));}
const p=newAncientProfile(),mine=LEISURE_NODES[0],a={map:'tribe',x:74,z:99,y:1.7,hp:100},state={ready:{}},clear=()=>true;let now=100000;
const upland=LEISURE_NODES.find(n=>n.id==='forest-upland'),angler={map:'forest',x:upland.x,z:upland.z,y:11.7,hp:100};
assert(leisureNear(angler,upland,clear));assert(!leisureNear({...angler,y:1.7},upland,clear),'Cannot fish through the platform');
for(let i=0;i<100;i++){assert(UPLAND_FISH_WEIGHTS[rollFish('forest',()=>i/100,'upland')]);assert(!['fishMoss','fishAmber','fishCrown'].includes(rollFish('forest',()=>i/100)),'Existing pond pool unchanged');}
leisureCommand(angler,p,{id:upland.id},state,now,clear,()=>.5);assert.equal(angler.leisure.fish,'fishMoss');
const use=(actor=a,node=mine)=>leisureCommand(actor,p,{id:node.id},state,now,clear,()=>.5);
use();assert.equal(p.materials.roughStone,1);assert(!a.leisure);const respawn=state.ready[mine.id];assert(respawn>=now+45000&&respawn<=now+120000);for(let i=0;i<10;i++)use();assert.equal(p.materials.roughStone,1);const xp=p.xp;now+=700;use();assert(!a.leisure);
for(const n of LEISURE_NODES){assert(!blocked(n.x,n.z,.6,n.map,n.y||0),n.id+' is reachable');assert.equal(ancientMapHeight(n.map,n.x,n.z),n.y||0,n.id+' sits on the floor');}
for(const map of ['tribe','forest','city','blight','sanctum','starfall'])assert(LEISURE_NODES.filter(n=>n.map===map&&n.kind==='mine').length>=4);
assert.equal(upland.x,20);assert.equal(upland.direction,1);
assert.equal(p.xp,xp,'Gathering grants no XP');
const rejected={map:'tribe',x:0,z:10,y:1.7,hp:100};now+=1000;use(rejected);assert(!rejected.leisure);
const fish=LEISURE_NODES.find(n=>n.kind==='fish'),f={map:'tribe',x:fish.x,z:fish.z,y:1.7,hp:100};now+=1000;use(f,fish);const bite=f.leisure.biteAt;now+=700;use(f,fish);assert.equal(f.leisure.phase,'waiting');now=bite;use(f,fish);assert.equal(f.leisure.phase,'hooked');
// Holding too long snaps the line; releasing eases tension but loses distance.
const clone=()=>({...f,leisure:{...f.leisure,progress:40,tension:90,held:true}}),hard=clone(),ease=clone();let testNow=now;
leisureCommand(ease,p,{id:fish.id,action:'reel',held:false},state,testNow,clear,()=>.5);
for(let i=0;i<10;i++){testNow+=200;leisureCommand(ease,p,{id:fish.id,action:'reel',held:false},state,testNow,clear,()=>.5);}
assert(ease.leisure.tension<90);assert(ease.leisure.progress<40,'Release lets the fish escape outward');
testNow=now;for(let i=0;i<100&&hard.leisure;i++){testNow+=200;leisureCommand(hard,p,{id:fish.id,action:'reel',held:true},state,testNow,clear,()=>.5);}
assert(!hard.leisure,'Uninterrupted hard reeling snaps the line');
const caughtKey=f.leisure.fish;for(let count=0;count<220&&f.leisure;count++){now+=200;const s=f.leisure;leisureCommand(f,p,{id:fish.id,action:'reel',held:(s.tension||0)<(fishingPull(now,s)?43:68)},state,now,clear,()=>.5);}
assert.equal(p.materials[caughtKey],1);assert(!f.leisure);const fishCount=p.materials[caughtKey];now+=500;use(f,fish);now=f.leisure.expires+1;use(f,fish);assert.equal(p.materials[caughtKey],fishCount,'Expired fishing grants nothing');
leisureCommand(f,p,{action:'cancel'},state,now,clear);assert(!f.leisure);
const injured={map:'tribe',x:fish.x,z:fish.z,y:1.7,hp:100};now+=1000;use(injured,fish);const castAt=injured.leisure.started;injured.hp=90;now+=700;use(injured,fish);assert.equal(injured.leisure.started,castAt,'Damage does not restart fishing');
p.materials.oreIron=4;assert.equal(sellLeisure(p,'oreIron',-1),'Invalid quantity');const gold=p.coins;assert.equal(sellLeisure(p,'oreIron',3),null);assert.equal(p.coins,gold+75);assert.equal(p.materials.oreIron,1);
assert.equal(sellLeisure(p,'core',1),'Invalid quantity');p.materials.fishRiver=2;assert.equal(leisureRecipe(p,'riverMeal'),null);assert.equal(p.materials['meal:fishRiver'],1);assert.equal(leisureRecipe(p,'riverMeal'),'Not enough materials');
p.materials.oreCopper=12;p.materials.stone=8;assert.equal(craftAncientGear(p,'copperTrailBlade'),null);assert(p.gear.some(g=>g.key==='copperTrailBlade'));assert.equal(p.materials.oreCopper,0);
// Full server path: two miners, persisted exhaustion, remote animation, safe transactions.
const bundle=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']}),db=new DatabaseSync(':memory:'),sockets=[],module={exports:{}};
const ctx={storage:{sql:{exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows}}},setAlarm:async()=>{},transactionSync(fn){db.exec('BEGIN');try{const r=fn();db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}}},getWebSockets:()=>sockets};
vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,Date:class extends Date{static now(){return now}},crypto,AbortController,Math,URL,structuredClone,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
let server=new module.exports.AncientWorld(ctx,{});
function peer(name,map='tribe'){const p=server.read(name);p.level=40;server.save(name,p);let actor={name,map,tribeLayout:2,x:74,z:99,y:1.7,yaw:0,hp:100000,maxHp:100000,weapon:p.weapons[0],lastShot:0,deadAt:0,seen:now};const ws={readyState:1,messages:[],deserializeAttachment:()=>structuredClone(actor),serializeAttachment:a=>actor=structuredClone(a),send:s=>ws.messages.push(JSON.parse(s)),close(){}};sockets.push(ws);return ws;}
const one=peer('one'),two=peer('two'),other=peer('other','forest'),packet=JSON.stringify({type:'leisure',id:mine.id});
now+=100000;await server.webSocketMessage(one,packet);await server.webSocketMessage(two,packet);
for(let i=0;i<3;i++){now+=700;await server.webSocketMessage(one,packet);}now+=700;for(let i=0;i<4;i++){await server.webSocketMessage(two,packet);now+=700;}
assert((server.read('one').materials.roughStone||0)>0);assert.equal(server.read('two').materials.oreCopper||0,0);assert(two.messages.some(d=>d.type==='leisureAnimation'));assert(!other.messages.some(d=>d.type==='leisureAnimation'));
server=new module.exports.AncientWorld(ctx,{});await server.webSocketMessage(two,packet);assert.equal(two.deserializeAttachment().leisure,undefined,'Exhaustion survives reconstruction');
let food=server.read('one');food.materials['meal:grilled']=2;server.save('one',food);const v=one.deserializeAttachment();v.hp=100;v.maxHp=ancientProfileHealth(food);v.skillBaseHp=v.maxHp;one.serializeAttachment(v);assert((await server.command('one','useLeisureFood',{})).ok);assert.equal(one.deserializeAttachment().hp,100+Math.floor(v.maxHp*.12));assert(!(await server.command('one','useLeisureFood',{})).ok);assert.equal(server.read('one').materials['meal:grilled'],1);
food=server.read('one');food.materials['meal:fishSturgeon']=2;server.save('one',food);
assert(!(await server.command('one','useLeisureFood',{key:'meal:fishSturgeon'})).ok,'Species share cooldown');
now+=60001;const beforeFish=one.deserializeAttachment().hp;assert((await server.command('one','useLeisureFood',{key:'meal:fishSturgeon'})).ok);assert.equal(one.deserializeAttachment().hp,Math.min(v.maxHp,beforeFish+Math.floor(v.maxHp*.30)));assert.equal(server.read('one').materials['meal:fishSturgeon'],1);
now+=60001;assert(!(await server.command('one','useLeisureFood',{key:'core'})).ok);assert(!(await server.command('one','useLeisureFood',{key:'__proto__'})).ok);
const full=one.deserializeAttachment();full.hp=full.maxHp;one.serializeAttachment(full);assert(!(await server.command('one','useLeisureFood',{key:'meal:fishSturgeon'})).ok);assert.equal(server.read('one').materials['meal:fishSturgeon'],1);full.hp=100;one.serializeAttachment(full);
assert(!(await server.command('one','sellLeisure',{key:'core',quantity:1})).ok);
// Server-owned stone state: retry-safe take, hidden contents, single debit/sale, persistence.
let stoneProfile=server.read('one');stoneProfile.coins=100;server.save('one',stoneProfile);const rawBefore=stoneProfile.materials.roughStone,take={source:'roughStone',requestId:'stone-test-00001'};let stoneResult=await server.command('one','stoneTake',take);assert(stoneResult.ok);assert.equal(stoneResult.profile.materials.roughStone,rawBefore-1);assert(!('seed' in stoneResult.stones[0]));assert(!('grade' in stoneResult.stones[0]));const stoneId=stoneResult.selected;stoneResult=await server.command('one','stoneTake',take);assert.equal(stoneResult.stones.length,1);assert.equal(stoneResult.profile.materials.roughStone,rawBefore-1);assert(!(await server.command('two','stoneCut',{id:stoneId})).ok);assert(!(await server.command('one','stoneCut',{id:stoneId,position:NaN})).ok);stoneResult=await server.command('one','stoneCut',{id:stoneId,plane:{normal:[0,1,0],constant:.2},pose:[0,0,0,1]});assert.equal(stoneResult.profile.coins,97);const quote=stoneResult.stones[0].quote;assert(stoneResult.stones[0].cut);assert.equal((await server.command('one','stoneCut',{id:stoneId})).profile.coins,97);server=new module.exports.AncientWorld(ctx,{});assert.equal((await server.command('one','stoneList',{})).stones[0].quote,quote);assert.deepEqual(JSON.parse(JSON.stringify((await server.command('one','stoneList',{})).stones[0].cut.plane)),{normal:[0,1,0],constant:.2});assert.equal((await server.command('one','stoneSell',{id:stoneId})).profile.coins,97+quote);assert(!(await server.command('one','stoneSell',{id:stoneId})).ok);
// Real socket path: elapsed-time reeling, hidden fish selection, exactly one catch,
// and the personal record survives reconstruction.
const fishingActor=one.deserializeAttachment();Object.assign(fishingActor,{x:fish.x,z:fish.z,y:1.7,seen:now});one.serializeAttachment(fishingActor);now+=1000;await server.webSocketMessage(one,JSON.stringify({type:'leisure',id:fish.id}));const fishingStart=one.deserializeAttachment().leisure,expectedFish=fishingStart.fish;assert(expectedFish);const damaged=one.deserializeAttachment();damaged.hp-=1;one.serializeAttachment(damaged);for(const peer of [one,two]){const live=peer.deserializeAttachment();live.seen=now;peer.serializeAttachment(live);}await server.tickMap('tribe');assert.equal(one.deserializeAttachment().leisure?.started,fishingStart.started,'Server tick preserves fishing after damage');assert(!one.messages.filter(m=>m.type==='leisureState').at(-1).session.fish);now=fishingStart.biteAt;await server.webSocketMessage(one,JSON.stringify({type:'leisure',id:fish.id,held:true}));
for(let i=0;i<220&&one.deserializeAttachment().leisure;i++){now+=200;const session=one.deserializeAttachment().leisure;await server.webSocketMessage(one,JSON.stringify({type:'leisure',id:fish.id,action:'reel',held:(session.tension||0)<(fishingPull(now,session)?43:68)}));}
assert(!one.deserializeAttachment().leisure);assert.equal(server.read('one').fishing[expectedFish].count,1);const caughtAmount=server.read('one').materials[expectedFish];await server.webSocketMessage(one,JSON.stringify({type:'leisure',id:fish.id,action:'reel',held:true}));assert.equal(server.read('one').materials[expectedFish],caughtAmount);server=new module.exports.AncientWorld(ctx,{});assert.equal(server.read('one').fishing[expectedFish].count,1);assert(one.messages.some(m=>m.type==='leisureReward'&&m.key===expectedFish&&m.weight>0));
const world=server.world('tribe'),identity=world.monsters.map(m=>[m.id,m.kind,m.level,m.homeX,m.homeZ]);for(const m of world.monsters){m.hp=0;m.respawnAt=now+1000000;}server.persist(world);for(const ws of [one,two]){const a=ws.deserializeAttachment();a.seen=now;ws.serializeAttachment(a);}await server.tickMap('tribe');assert.deepEqual(server.world('tribe').monsters.map(m=>[m.id,m.kind,m.level,m.homeX,m.homeZ]),identity,'No monster order/home/level/count changes');assert(one.messages.some(d=>d.type==='state'&&d.leisureReady[mine.id]));
db.close();console.log('PASS: walkable two-ended passages, wall LOS, unchanged original spawn geometry/order/levels/count, instant ground pickups and timed fishing, no XP, cancellation, shared depletion/anti-spam, atomic rewards, persistence, map-isolated animation, sales/cooking/forge and food cooldown.');
