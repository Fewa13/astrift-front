// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(import.meta.url),module={exports:{}};
const {outputFiles}=await build({entryPoints:['src/index.ts','src/client-release.ts'],outdir:'test',bundle:true,write:false,platform:'node',format:'cjs',external:['cloudflare:workers']});
const context={module,exports:module.exports,process,Buffer,crypto,Request,Response,Headers,URL,TextEncoder,AbortController,require:id=>id==='cloudflare:workers'?{DurableObject:class{}}:require(id)};
vm.runInNewContext(outputFiles.find(f=>f.path.endsWith('/index.js')).text,context);
const worker=module.exports.default;
vm.runInNewContext(outputFiles.find(f=>f.path.endsWith('/client-release.js')).text,context);
const version=module.exports.CLIENT_RELEASE,tickets=new Map(),requests=new Map();
const env={
 ACCOUNT_SESSIONS:{getByName:()=>({consumeSocketTicket(ticket,path){const record=tickets.get(ticket);tickets.delete(ticket);return record?.path===path?record.account:''},rememberSocket(){}})},
 LOADOUT_CODES:{getByName:()=>({consumeRateLimit(key,limit){const count=(requests.get(key)||0)+1;requests.set(key,count);return count<=limit}})},
 GAME_ROOMS:{getByName:()=>({fetch(request){return new Response(request.headers.get('X-Astrift-Account'))}})}
};
const path='/api/room/A1B2C3';
async function connect(account,withTicket=true){
 const ticket=crypto.randomUUID();
 if(withTicket)tickets.set(ticket,{account,path});
 return worker.fetch(new Request('https://play.astrift.com'+path+'?clientVersion='+version+'&ticket='+ticket,{headers:{Upgrade:'websocket','CF-Connecting-IP':'192.0.2.1','X-Astrift-Account':'spoofed'}}),env);
}
for(let i=0;i<30;i++)assert.equal(await (await connect('first')).text(),'first');
assert.equal((await connect('first')).status,429);
assert.equal(await (await connect('second')).text(),'second');
assert.equal((await connect('second',false)).status,401);
console.log('PASS: shared IP does not merge authenticated FPS room budgets, per-account limit and ticket verification preserved.');
