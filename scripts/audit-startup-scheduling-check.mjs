import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
class Node{constructor(){this.style={};this.dataset={};this.nodes={};this.hidden=false;this.contentWindow={}}querySelector(key){return this.nodes[key]??=new Node()}append(){}remove(){this.removed=true}removeAttribute(){}load(){}}
const mounts=[],body=new Node(),shell={},bridge={authenticate:async()=>{},prepare:async()=>[],prepareChoices:async()=>{},showChoices:()=>mounts.push('choices')};
const c=vm.createContext({document:{createElement:()=>new Node(),body},Audio:class{constructor(){this.paused=true}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}removeAttribute(){}load(){}},requestAnimationFrame:fn=>queueMicrotask(fn),shell,mount:async world=>{mounts.push(world);return bridge},prepareAssets:async report=>report(1,'done'),openEntryAnnouncements(){},entryTimer:()=>()=>{},entryStage:async(_,fn)=>fn()});
vm.runInContext(fs.readFileSync('public/startup-flow.js','utf8').replace(/^import .*\n/gm,'').replace(/^export /gm,'')+'\ncreateStartupFlow({shell,mount,prepareAssets});',c);
for(let i=0;i<20&&!shell.entryFinished();i++)await new Promise(setImmediate);
assert(shell.entryFinished());assert.deepEqual(mounts,['main','choices'],'Mode chooser must not mount Ancient before selection');
const live=[],outer={};const context=vm.createContext({window:{__ASTRIFT_SHELL__:outer},document:{body:{append:frame=>live.push(frame)},createElement:()=>new Node(),cookie:''},location:{search:'',protocol:'https:'},URLSearchParams,setTimeout,clearTimeout,navigator:{},createStartupFlow:options=>context.mount=options.mount,preloadStartupAssets(){}});
vm.runInContext(fs.readFileSync('public/world-shell.js','utf8').replace(/^import .*\n/gm,''),context);
let pending=context.mount('main');outer.mainReady(live.at(-1).contentWindow,bridge);await pending;
pending=context.mount('ancient');assert(live[0].removed,'Previous renderer removed before creating Ancient');assert.equal(live.filter(f=>!f.removed).length,1);outer.ancientReady(live.at(-1).contentWindow);await pending;
console.log('PASS chooser mounts only FPS host; Ancient initializes on selection and previous renderer is removed first');
