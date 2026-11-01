// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {apiURL} from '../public/network-diagnostics.js';
for(const host of ['astrift-front.surge.sh','astrift-front.web.app','astrift-front.firebaseapp.com']){
 globalThis.location=new URL('https://'+host+'/_world/ancient.html');globalThis.window={__ASTRIFT_API_ORIGIN__:location.origin};
 assert.equal(apiURL('/api/account/login'),'https://play.astrift.com/api/account/login');
 assert.equal(apiURL('/api/admin'),'https://play.astrift.com/api/admin');
}
for(const host of ['play.astrift.com','astrift-front.fewa3729.workers.dev','localhost:8787']){
 globalThis.location=new URL('https://'+host+'/');assert.equal(apiURL('/api/account/check'),location.origin+'/api/account/check');
}
const source=await fs.readFile('public/account.js','utf8');
const request=source.slice(source.indexOf('export async function accountApi'),source.indexOf('export const accountEmailUI')).replace('export ','');
let cleared=0,events=[],session={token:'current'},status=401;
const ctx={accountPageLease:async()=>true,session,device:'test',apiURL:p=>p,diagnosticFetch:async()=>({status,ok:false,json:async()=>({error:'请先登录账号'})}),clearSession:()=>{cleared++},window:{dispatchEvent:e=>events.push(e.type)},CustomEvent:class{constructor(type){this.type=type}}};
vm.createContext(ctx);vm.runInContext(request,ctx);
await assert.rejects(ctx.accountApi('ancient/profile',{token:'current'}),/请先登录账号/);assert.equal(cleared,1);assert.deepEqual(events,['astrift:account-reset']);
await assert.rejects(ctx.accountApi('account/login',{password:'wrong'}));assert.equal(cleared,1);
await assert.rejects(ctx.accountApi('account/check',{token:'older'}));assert.equal(cleared,1);
status=503;await assert.rejects(ctx.accountApi('account/check',{token:'current'}));assert.equal(cleared,1);
console.log('PASS: mirrors route login/admin directly, primary/local origins preserved, stale auth resets UI, unrelated/old requests and outages do not log users out.');
