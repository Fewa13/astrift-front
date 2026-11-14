// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import * as THREE from '../public/three.module.js';
import {createAncientBossFX} from '../public/ancient-boss-fx.js';
const out=await build({entryPoints:['src/ancient-boss.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {tickAncientBoss,bossAreaHit}=await import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'));
const scene=new THREE.Scene(),fx=createAncientBossFX(scene),all=[],owners=new Map();
const kinds=['chief','lord','rootwarden','crystal_metal','crystal_wood','crystal_water','crystal_fire','crystal_earth','oathknight','emptyking','blight_lord','immaculate_judge','starbound_heart','furnace_regent','thunder_warden','buried_marshal','hourglass_regent','sky_sovereign','frost_crowned'];
for(const kind of kinds){
 const m={id:kind,kind,x:0,z:0,hp:100,attackAt:0,action:'idle',actionAt:0},events=[],skills=new Set(),target={x:0,z:5};
 const emit=(stage,c)=>events.push({stage,boss:m.id,...c});
 let hits=0,previousSkill=false,now=10000;
 for(let i=0;i<20;i++){
  assert(tickAncientBoss(m,target,now,emit,()=>hits++));
  const cast=structuredClone(m.bossCast);
  assert.equal(m.action,'windup');
  tickAncientBoss(m,{x:100,z:100},cast.hitAt-1,emit,()=>hits++);
  assert.deepEqual(m.bossCast,cast);
  assert.equal(hits,i);
  tickAncientBoss(m,target,cast.hitAt,emit,()=>hits++);
  assert.equal(hits,i+1);
  if(cast.id==='secondHand'){
   const echo=m.bossCast;
   assert(echo.echo && echo.hitAt>cast.hitAt);
   assert.notDeepEqual(echo.areas,cast.areas);
   tickAncientBoss(m,target,echo.hitAt,emit,echoHit=>assert(echoHit.echo));
  }
  assert(!m.bossCast);
  if(!cast.basic){
   assert(!previousSkill);
   assert.equal(owners.get(cast.id)??kind,kind);
   owners.set(cast.id,kind);
   skills.add(cast.id);
  }
  previousSkill=!cast.basic;
  now=m.attackAt;
 }
 assert(skills.size>=2,kind);
 assert(events.some(e=>e.basic));
 assert(!tickAncientBoss(m,target,now,emit,()=>hits++,false));
 tickAncientBoss(m,target,now,emit,()=>hits++);
 m.hp=0;tickAncientBoss(m,target,now+5000,emit,()=>hits++);
 assert.equal(hits,20);assert(!m.bossCast);
 all.push(...events.slice(0,8));
}
assert(bossAreaHit({x:0,z:0,radius:18,inner:6},0,10));assert(!bossAreaHit({x:0,z:0,radius:18,inner:6},0,2));
assert(bossAreaHit({x:0,z:0,radius:0,length:20,width:4,angle:Math.PI/2},10,0));assert(!bossAreaHit({x:0,z:0,radius:0,length:20,width:4,angle:Math.PI/2},-10,0));
for(const e of all){e.started=Date.now();e.hitAt=e.started+1400;fx.effect(e,()=>0);fx.update(performance.now()+300);scene.traverse(o=>{assert(o.position.toArray().every(Number.isFinite));if(o.isInstancedMesh)assert([...o.instanceMatrix.array].every(Number.isFinite))})}
assert(fx.count<=16);fx.clear();assert.equal(scene.children.length,0);
const warning={stage:'warning',boss:'dead',kind:'lord',id:'quake',started:Date.now(),hitAt:Date.now()+1000,areas:[{x:0,z:0,radius:9}]};fx.effect(warning,()=>0);fx.sync([],()=>0);assert.equal(fx.count,0);
console.log('PASS: 19 bosses with unique skill IDs and interleaved basics, fixed warnings, delayed once-only hits, cooldown, death cancellation, safe center/lane geometry, bounded finite FX and cleanup.');
