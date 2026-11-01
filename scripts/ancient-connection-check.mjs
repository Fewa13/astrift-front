// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {createAncientConnection} from '../public/ancient-connection.js';
const flush=async()=>{for(let i=0;i<15;i++)await Promise.resolve()};
function harness(){
 let clock=0,sequence=0,current=null,requests=0;const timers=new Map(),sockets=[],statuses=[],messages=[],responses=[];
 const setTimer=(fn,ms)=>{const id=++sequence;timers.set(id,{fn,at:clock+ms});return id},clearTimer=id=>timers.delete(id);
 const connection=createAncientConnection({session:()=>({name:'tester',token:'secret',device:'device'}),map:()=> 'tribe',origin:()=> 'https://play.astrift.com',onSocket:s=>current=s,onMessage:(d,r)=>messages.push({d,r}),onStatus:s=>statuses.push(s),onDisconnect(){},setTimer,clearTimer,now:()=>clock,
  fetchImpl:async(url,options)=>{requests++;assert.equal(JSON.parse(options.body).device,'device');const response=responses.shift();if(response instanceof Error)throw response;if(typeof response==='function')return response(options);return response||{ok:true,status:200,json:async()=>({ok:true,ticket:'new-ticket'})}},
  socketFactory:url=>{assert(url.toString().startsWith('wss://play.astrift.com/'));const ws={closed:false,close(){this.closed=true},message(data){this.onmessage?.({data:JSON.stringify(data)})}};sockets.push(ws);return ws}});
 return {connection,timers,sockets,statuses,messages,responses,get current(){return current},get requests(){return requests},async advance(ms){const end=clock+ms;while(true){const next=[...timers].filter(([,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;clock=next[1].at;timers.delete(next[0]);next[1].fn();await flush()}clock=end;await flush()}};
}
{
 const h=harness();h.responses.push(new Error('offline'),{ok:false,status:502,json:async()=>{throw Error('HTML error page')}});await h.connection.start();assert.equal(h.sockets.length,0);await h.advance(2000);assert.equal(h.requests,2);await h.advance(4000);assert.equal(h.sockets.length,1);h.current.message({type:'welcome'});assert(h.messages[0].r);h.connection.stop();assert.equal(h.timers.size,0);
}
{
 const h=harness();await h.connection.start();const old=h.current;await h.advance(12000);assert(old.closed);await h.advance(2000);assert.equal(h.sockets.length,2);h.current.message({type:'welcome'});await h.advance(8001);assert.equal(h.current,null);await h.advance(2000);assert.equal(h.sockets.length,3);h.connection.stop();await h.advance(60000);assert.equal(h.sockets.length,3);
}
{
 const h=harness();let complete;h.responses.push(()=>new Promise(resolve=>complete=resolve));const pending=h.connection.start();h.connection.stop();complete({ok:true,status:200,json:async()=>({ok:true,ticket:'late'})});await pending;assert.equal(h.sockets.length,0);assert.equal(h.timers.size,0);
}
{
 const h=harness();h.responses.push({ok:false,status:401});await h.connection.start();await h.advance(60000);assert.equal(h.requests,1);assert(h.statuses.includes('auth'));
}
{
 const h=harness();h.responses.push(options=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Error('timeout')))));const pending=h.connection.start();await h.advance(12000);await pending;await h.advance(2000);assert.equal(h.sockets.length,1);h.connection.stop();
}
{
 const h=harness();h.responses.push(new Error('offline'));await h.connection.start();h.connection.retryNow();await flush();assert.equal(h.sockets.length,1);h.current.message({type:'welcome'});await h.advance(4000);h.current.message({type:'state'});await h.advance(4000);assert.equal(h.sockets.length,1);h.connection.stop();assert.equal(h.timers.size,0);
}
console.log('PASS: ticket failure and HTML/502 retries, ticket and welcome timeouts, silent disconnect watchdog, online recovery, auth stop, stale responses and intentional exit cancellation.');
