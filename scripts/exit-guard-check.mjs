// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
for(const file of ['index.html','ancient.html']){
 const html=fs.readFileSync(new URL('../public/'+file,import.meta.url),'utf8'),code=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(v=>v[1]).find(s=>s.includes("addEventListener('beforeunload'"));
 const handlers={},window={__ASTRIFT_NAVIGATING__:true,addEventListener:(id,fn)=>handlers[id]=fn};vm.runInNewContext(code,{window});assert.equal(window.__ASTRIFT_NAVIGATING__,false);
 const event=()=>({prevented:false,preventDefault(){this.prevented=true}});let e=event();handlers.beforeunload(e);assert(e.prevented&&e.returnValue===true);
 window.__ASTRIFT_NAVIGATING__=true;e=event();handlers.beforeunload(e);assert(!e.prevented);assert.equal(window.__ASTRIFT_NAVIGATING__,false);e=event();handlers.beforeunload(e);assert(e.prevented);
 window.__ASTRIFT_NAVIGATING__=true;handlers.pageshow();assert.equal(window.__ASTRIFT_NAVIGATING__,false);
 const location={hostname:'play.astrift.com',protocol:'https:',assign(){throw Error('blocked navigation')}},context={window,document:{cookie:''},location,setTimeout:()=>1,clearTimeout(){}};vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../public/world-navigation.js',import.meta.url),'utf8').replace('export function','function'),context);assert.throws(()=>context.navigateWorld('ancient'));assert.equal(window.__ASTRIFT_NAVIGATING__,false);
 console.log('PASS '+file+': initial guard, one-use internal exemption, back/forward restore and failed navigation.');
}
