// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {tickBestiary,bestiaryHookContact,BESTIARY_HOOK_WIDTH} from '../public/ancient-bestiary.js';
const cast={id:'hook',started:0,hitAt:850,ends:1850,ax:0,az:0,tx:0,tz:16,hit:[]};
assert.equal(BESTIARY_HOOK_WIDTH,1.4);
for(const x of [-1,-.99,-.71,.71,.99,1])assert.equal(bestiaryHookContact({...cast},{x,z:16},1850,.1),false,'outside visible warning '+x);
assert(bestiaryHookContact({...cast},{x:.69,z:16},1850,.1));
assert(!bestiaryHookContact({...cast},{x:0,z:8},850,.1),'no full-lane instant hit');
assert(bestiaryHookContact({...cast},{x:0,z:8},1350,.1),'hook reaches middle');
assert(!bestiaryHookContact({...cast,hookCheckedAt:1500},{x:0,z:8},1600,.1),'spent chain cannot grab behind projectile');
assert(!bestiaryHookContact({...cast},{x:0,z:16.1},1850,.1),'no invisible endpoint splash');
assert(!bestiaryHookContact({...cast},{x:0,z:-.1},850,.1),'no hit behind caster');
const diagonal={...cast,tx:16/Math.SQRT2,tz:16/Math.SQRT2};assert(!bestiaryHookContact(diagonal,{x:diagonal.tx+.8/Math.SQRT2,z:diagonal.tz-.8/Math.SQRT2},1850,.1));
function run(x,wall=false,y=1.7){let now=10000,hits=0,pulls=0;const victim={name:'player',x:0,z:16,y,hp:1000},m={id:'jailer',kind:'chain_jailer',x:0,z:0,hp:1000,maxHp:1000,level:80,action:'idle',actionAt:0,attackAt:0};const ctx={get now(){return now},dt:.1,monsters:[m],victims:[victim],ground:()=>0,clear:()=>!wall,solid:()=>wall,move:()=>{},hit:()=>hits++,pull:()=>pulls++,fx:()=>{}};
// Begin the cast with an unobstructed target; add a wall only after the wind-up.
const clear=ctx.clear;ctx.clear=()=>true;tickBestiary(m,victim,ctx);ctx.clear=clear;const s={...m.special};victim.x=x;for(now=s.hitAt;now<=s.ends+100;now+=50)tickBestiary(m,victim,ctx);return {get hits(){return hits},get pulls(){return pulls},m,victim,s,ctx,setNow:v=>now=v};}
for(const x of [-.99,-.71,.71,.99,3])assert.deepEqual([run(x).hits,run(x).pulls],[0,0]);assert.deepEqual([run(.6).hits,run(.6).pulls],[1,1]);assert.deepEqual([run(0,true).hits,run(0,true).pulls],[0,0]);assert.deepEqual([run(0,false,4).hits,run(0,false,4).pulls],[0,0]);
const result=run(3);result.victim.x=0;result.setNow(result.s.ends+400);tickBestiary(result.m,result.victim,result.ctx);assert.equal(result.hits,0);
console.log('PASS: visible lane edges, diagonal lane, no endpoint splash, real flight timing, no spent-chain hits, sidestep, wall, height and single pull.');
