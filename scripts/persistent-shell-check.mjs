// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const html=fs.readFileSync(new URL('../public/world-shell.html',import.meta.url),'utf8'),head=html.match(/<script>([\s\S]*?)<\/script>/)[1],listeners=[],frames=[];
const window={addEventListener:(id,fn)=>listeners.push({id,fn})},document={cookie:'',body:{append(f){frames.push(f)}},createElement:()=>({remove(){frames.splice(frames.indexOf(this),1)}})},context={window,document,URLSearchParams,location:{protocol:'https:',search:''},navigator:{onLine:true}};vm.createContext(context);vm.runInContext(head,context);vm.runInContext(fs.readFileSync(new URL('../public/world-shell.js',import.meta.url),'utf8'),context);const listener=listeners[0].fn;
for(let i=0;i<30;i++){window.__ASTRIFT_SHELL__.switchWorld(i%2?'main':'ancient');assert.equal(frames.length,1);assert.equal(listeners.length,1);assert.equal(listeners[0].fn,listener)}
const event={prevented:false,preventDefault(){this.prevented=true}};listener(event);assert(event.prevented&&event.returnValue===true);
window.__ASTRIFT_SHELL__.switchWorld('main',{auth:'login'});assert.equal(frames[0].src,'/_world/main?astriftAuth=login');
window.__ASTRIFT_SHELL__.switchWorld('main',{auth:'register'});assert.equal(frames[0].src,'/_world/main?astriftAuth=register');
window.__ASTRIFT_SHELL__.switchWorld('ancient',{auth:'login'});assert.equal(frames[0].src,'/_world/ancient');assert.equal(listeners.length,1);
for(const file of ['index.html','ancient.html']){const source=fs.readFileSync(new URL('../public/'+file,import.meta.url),'utf8'),guard=[...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(v=>v[1]).find(s=>s.includes("addEventListener('beforeunload'")),child={parent:window,addEventListener(){throw Error('Child installed duplicate guard')}};vm.runInNewContext(guard,{window:child});}
console.log('PASS: 30 world switches retain the exact same outer listener, one live frame, and no child exit listeners.');
for(const online of [true,false])for(const cookie of ['', 'astrift_world=ancient', 'astrift_world=main']){
 const frames=[],listeners=[],window={addEventListener:(id,fn)=>listeners.push({id,fn})},document={cookie,body:{append:f=>frames.push(f)},createElement:()=>({remove(){frames.splice(frames.indexOf(this),1)}})};
 const ctx={window,document,URLSearchParams,location:{protocol:'https:',search:''},navigator:{onLine:online}};
 vm.runInNewContext(head,ctx);vm.runInNewContext(fs.readFileSync(new URL('../public/world-shell.js',import.meta.url),'utf8'),ctx);
 assert.equal(frames[0].src,'/_world/main','fresh entry always opens world chooser');assert.equal(listeners.length,1);
}
console.log('PASS: previous-world cookies cannot skip world choice, online or offline.');
