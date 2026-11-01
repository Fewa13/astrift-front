// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {diagnosticFetch,apiURL} from '../public/network-diagnostics.js';
globalThis.location=new URL('https://astrift-front.web.app/');globalThis.window={};
const storage=new Map();globalThis.sessionStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};
const primary='https://play.astrift.com',backup='https://astrift-front.fewa3729.workers.dev';
let calls=[];
const json=(data,status=200)=>Response.json(data,{status});
const options={method:'POST',body:JSON.stringify({name:'tester',password:'test-only'})};
const result=await diagnosticFetch(primary+'/api/account/login',options,async(url,init)=>{calls.push([url,init.body]);if(calls.length===1)throw new TypeError('Failed to fetch');return json({ok:true})});
assert.equal((await result.json()).ok,true);assert.deepEqual(calls.map(c=>c[0]),[primary+'/api/account/login',backup+'/api/account/login']);assert.equal(calls[0][1],calls[1][1]);assert.equal(apiURL('/api/ancient/profile'),backup+'/api/ancient/profile');assert.equal(window.__ASTRIFT_API_ORIGIN__,backup);
calls=[];await diagnosticFetch(primary+'/api/account/login',options,async url=>{calls.push(url);return json({error:'账号或密码错误'},401)});assert.equal(calls.length,1);
calls=[];await diagnosticFetch(primary+'/api/account/login',options,async url=>{calls.push(url);return calls.length===1?new Response('<html>Unavailable</html>'):json({ok:true})});assert.equal(calls.length,2);
for(const [path,body]of [['account/email/reset-request',{}],['ancient/profile',{action:'buy'}],['admin',{action:'auth2'}],['admin',{action:'publish'}]]){calls=[];await assert.rejects(diagnosticFetch(primary+'/api/'+path,{method:'POST',body:JSON.stringify(body)},async url=>{calls.push(url);throw new TypeError('Failed to fetch')}));assert.equal(calls.length,1,path)}
globalThis.location=new URL('https://unrelated.example/');calls=[];await assert.rejects(diagnosticFetch(primary+'/api/account/login',options,async url=>{calls.push(url);throw new TypeError('Failed to fetch')}));assert.equal(calls.length,1);
console.log('PASS: trusted origin fallback, same login body, HTML failure, shared backend pinning, no retry on auth rejection or mutations, unknown origins excluded.');
