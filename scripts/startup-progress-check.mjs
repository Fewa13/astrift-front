import assert from 'node:assert/strict';import{preloadStartupAssets}from'../public/startup-flow.js';
let release;const gate=new Promise(r=>release=r),events=[];
async function fetchImpl(url){
 if(url==='/manifest')return {ok:true,json:async()=>({files:[{url:'/a.js',bytes:4},{url:'/b.css',bytes:6}]})};
 let index=0;return {ok:true,body:{getReader:()=>({async read(){
  if(url==='/a.js'){if(index++===0)return {value:new Uint8Array(2)};if(index===2){await gate;return {value:new Uint8Array(2)}}return {done:true}}
  if(index++===0)return {value:new Uint8Array(6)};return {done:true};
 }})}};
}
const work=preloadStartupAssets((fraction,label)=>events.push({fraction,label}),{fetchImpl,manifestURL:'/manifest'});
await new Promise(r=>setTimeout(r,25));assert.equal(events.at(-1).fraction,.8);await new Promise(r=>setTimeout(r,25));assert.equal(events.at(-1).fraction,.8,'Time alone never advances loading');release();await work;assert.equal(events.at(-1).fraction,1);assert(events.every((e,i)=>!i||e.fraction>=events[i-1].fraction));const failed=[];await assert.rejects(preloadStartupAssets(f=>failed.push(f),{manifestURL:'/manifest',fetchImpl:async url=>url==='/manifest'?{ok:true,json:async()=>({files:[{url:'/bad.js',bytes:5}]})}:{ok:false}}));assert(!failed.includes(1));console.log('PASS byte-based progress stalls until actual bytes complete, is monotonic and never completes after a failed resource');
