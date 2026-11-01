// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
let messages=[],account={name:'Alice'},calls=[];const children=[],listeners=new Map(),saved=new Map();
const window={addEventListener:(n,f)=>listeners.set(n,f),removeEventListener:n=>listeners.delete(n)};
function element(){return {style:{},setAttribute(){},append(...nodes){this.children??=[];this.children.push(...nodes)},remove(){this.removed=true},isConnected:true}}
const document={hidden:false,createElement:element,body:{append(n){children.push(n)}}};
const context=vm.createContext({document,window,localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},setInterval:()=>1,clearInterval(){},setTimeout:()=>2,clearTimeout(){},Date,console});
vm.runInContext(readFileSync(new URL('../public/official-announcements.js',import.meta.url),'utf8').replace('export function','function')+'\nglobalThis.create=createAnnouncementPoll',context);
const make=()=>context.create({session:()=>account,request:async(path,data)=>{calls.push({path,data});return {messages}},openInbox:async()=>{}});
const mail=(id,extra={})=>({id,title:id,announcement:true,createdAt:Date.now(),...extra});
messages=[mail('old',{createdAt:Date.now()-864000000}),mail('prior')];const poll=make();await poll.poll();assert.equal(children.length,0,'History must not pop on login');
messages=[mail('read',{readAt:1}),mail('claimed',{claimedAt:1}),...messages];await poll.poll();assert.equal(children.length,0,'Read and claimed announcements must not pop');
messages=[mail('new'),...messages];await poll.poll();assert.equal(children.length,1);await poll.poll();assert.equal(children.length,1,'Repeated polls must not repeat');assert(calls.some(c=>c.path.endsWith('/read')&&c.data.id==='new'));
children[0].children[2].onclick();await poll.poll();assert.equal(children.length,1,'Closing must not drain historical queue');
messages=[mail('another'),...messages];await poll.poll();assert.equal(children.length,2);listeners.get('astrift:mail-read')({detail:{id:'another'}});assert(children[1].removed);
account=null;await poll.poll();account={name:'Bob'};await poll.poll();assert.equal(children.length,2,'Account switch baselines history');
poll.stop();assert.equal(listeners.size,0);const again=make();await again.poll();assert.equal(children.length,2,'Reload does not replay');again.stop();
console.log('PASS: announcement history, read/claimed exclusion, single notification, no queue replay, account switching, reload, cleanup');
