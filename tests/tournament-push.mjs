import assert from 'node:assert/strict';
import {builtinModules,createRequire} from 'node:module';
import {createECDH,randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import webpush from 'web-push';
const require=createRequire(import.meta.url),ece=require('http_ece');
const browserKey=createECDH('prime256v1');browserKey.generateKeys();
const auth=randomBytes(16),keys=webpush.generateVAPIDKeys();
const subscription={endpoint:'https://fcm.googleapis.com/fcm/send/test',keys:{p256dh:browserKey.getPublicKey().toString('base64url'),auth:auth.toString('base64url')}};
const built=await build({stdin:{resolveDir:process.cwd(),contents:`
  import {generateRequestDetails} from 'web-push';
  import {validSubscription} from './src/tournament-push';
  import {TournamentHub} from './src/tournament-hub';
  const deliveries=[];
  globalThis.fetch=async(endpoint,options)=>{deliveries.push({endpoint,headers:options.headers});return new Response(null,{status:201})};
  export class TestHub extends TournamentHub {deliveries(){return deliveries}}
  export default {async fetch(request,env){
    const subscription=await request.json();
    if(!validSubscription(subscription))return Response.json({invalid:true});
    const details=generateRequestDetails(subscription,JSON.stringify({title:'武者大赛已开始',tag:'test'}),{vapidDetails:{subject:'https://astrift-front.pages.dev',publicKey:env.PUBLIC_KEY,privateKey:env.PRIVATE_KEY}});
    return Response.json({headers:details.headers,body:details.body.toString('base64')});
  }};
`},bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'worker-builtins',setup(b){const names=new Set(builtinModules.map(name=>name.replace(/^node:/,'')));b.onResolve({filter:/^[a-z][a-z0-9_/-]*$/},args=>names.has(args.path)?{path:'node:'+args.path,external:true}:undefined)}}],external:['node:*','cloudflare:workers']});
const source=built.outputFiles[0].text,builtins=[...new Set([...source.matchAll(/__require\("(node:[^"]+)"\)/g)].map(match=>match[1]))];
const shim=builtins.map((name,index)=>`import * as builtin${index} from ${JSON.stringify(name)};`).join('\n')+`\nconst require=name=>({${builtins.map((name,index)=>`${JSON.stringify(name)}:(builtin${index}.default||{...builtin${index}})`).join(',')}})[name];\n`;
const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:shim+source,compatibilityDate:'2026-09-02',compatibilityFlags:['nodejs_compat'],bindings:{PUBLIC_KEY:keys.publicKey,PRIVATE_KEY:keys.privateKey,TOURNAMENT_PUSH_PUBLIC_KEY:keys.publicKey,TOURNAMENT_PUSH_PRIVATE_KEY:keys.privateKey},durableObjects:{TOURNAMENTS:{className:'TestHub',useSQLite:true}}}));
try{
  const response=await mf.dispatchFetch('https://test.local',{method:'POST',body:JSON.stringify(subscription)});
  assert.equal(response.status,200);const data=await response.json();
  assert.equal(data.headers['Content-Encoding'],'aes128gcm');assert.match(data.headers.Authorization,/^vapid /);
  const decrypted=ece.decrypt(Buffer.from(data.body,'base64'),{version:'aes128gcm',privateKey:browserKey,authSecret:auth});
  assert.equal(JSON.parse(decrypted.toString()).title,'武者大赛已开始');
  const invalid=await mf.dispatchFetch('https://test.local',{method:'POST',body:JSON.stringify({...subscription,endpoint:'https://127.0.0.1/private'})});assert.equal((await invalid.json()).invalid,true);
  const namespace=await mf.getDurableObjectNamespace('TOURNAMENTS'),hub=namespace.get(namespace.idFromName('test'));
  const event=await hub.create('warrior','武者大赛','测试','测试');
  await hub.join(event.id,'player-a','PlayerA');await hub.join(event.id,'player-b','PlayerB');
  await hub.subscribe('player-a','device-a',subscription);
  await hub.subscribe('outsider','device-b',{...subscription,endpoint:subscription.endpoint+'-outsider'});
  assert.equal((await hub.start(event.id)).ok,true);
  for(let attempt=0;attempt<40&&!(await hub.deliveries()).length;attempt++)await new Promise(resolve=>setTimeout(resolve,50));
  assert.equal((await hub.deliveries()).length,1);assert.equal((await hub.deliveries())[0].endpoint,subscription.endpoint);
  assert.equal((await hub.start(event.id)).ok,false);await new Promise(resolve=>setTimeout(resolve,150));assert.equal((await hub.deliveries()).length,1);
}finally{await mf.dispose()}
const handlers={},shown=[],opened=[],messages=[];
const context={URL,console,self:{location:{origin:'https://astrift-front.pages.dev'},addEventListener:(name,handler)=>{handlers[name]=handler},registration:{showNotification:async(...args)=>shown.push(args)},clients:{matchAll:async()=>[{postMessage:message=>messages.push(message)}],openWindow:async url=>opened.push(url)}}};
vm.runInNewContext(await readFile('public/sw.js','utf8'),context);
let pending;
handlers.push({data:{json:()=>({title:'武者大赛已开始',tag:'test'})},waitUntil:promise=>{pending=promise}});await pending;
assert.equal(shown[0][0],'武者大赛已开始');assert.equal(shown[0][1].data.url,'/');assert.equal(messages[0].type,'astrift:tournament-started');
handlers.notificationclick({notification:{close(){}},waitUntil:promise=>{pending=promise}});await pending;
assert.equal(opened[0],'https://astrift-front.pages.dev/');
console.log('Passed: Workers push encryption, endpoint validation, system notification, click opens homepage.');
