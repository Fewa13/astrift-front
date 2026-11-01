// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import {createAncientAPI} from '../public/ancient-api.js';
let calls=0,aborts=0;const hangs=async(_,o)=>{calls++;o.signal.addEventListener('abort',()=>aborts++);return new Promise(()=>{})};
const make=(fetchImpl)=>createAncientAPI({session:()=>({device:'test-device'}),fallback:async()=>({fallback:true}),fetchImpl,readTimeout:10,writeTimeout:10});
await assert.rejects(make(hangs)('ancient/profile',{action:'profile'}),/ANCIENT_REQUEST_TIMEOUT/);assert.equal(calls,2);assert.equal(aborts,2);
calls=aborts=0;await assert.rejects(make(hangs)('ancient/profile',{action:'buyPotion'}),/ANCIENT_REQUEST_TIMEOUT/);assert.equal(calls,1,'Writes are never automatically replayed');
calls=0;const request=make(async(_,o)=>{assert.equal(JSON.parse(o.body).device,'test-device');if(++calls===1)throw TypeError('network');return {ok:true,json:async()=>({ok:true,profile:{level:4}})}});assert.equal((await request('ancient/profile',{action:'profile'})).profile.level,4);assert.equal(calls,2);
calls=0;await assert.rejects(make(async()=>{calls++;return {ok:false,json:async()=>({error:'请先登录账号'})}})('ancient/profile',{action:'profile'}),/请先登录账号/);assert.equal(calls,1,'Authentication errors must not retry');
assert.deepEqual(await request('account/profile',{}),{fallback:true});calls=0;await assert.rejects(make(async()=>({ok:true,json:async()=>new Promise(()=>{})}))('ancient/profile',{action:'profile'}),/ANCIENT_REQUEST_TIMEOUT/);console.log('PASS Ancient API: bounded fetch and body time, aborts, one read retry, zero write replay, auth errors and non-Ancient API preserved.');
