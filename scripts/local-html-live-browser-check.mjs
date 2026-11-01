// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Real file:// browser + production transport; invalid credentials only.
import assert from 'node:assert/strict';import path from 'node:path';import {pathToFileURL} from 'node:url';import {createRequire} from 'node:module';
const {chromium}=createRequire('/Users/jingfeng/Documents/astrift-promo/record-worlds-v7.mjs')('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
try{for(const file of ['index.html','ancient-only.html']){const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('../astrift-html',file)).href);if(file==='index.html')await page.waitForFunction(()=>window.__ASTRIFT_SHELL__?.switchWorld);let frame;for(let i=0;i<100;i++){frame=page.frames().find(f=>f.parentFrame());if(frame&&await frame.evaluate(()=>!!window.__ASTRIFT_API_ORIGIN__).catch(()=>false))break;await page.waitForTimeout(100)}assert(frame,'Local file must create its game document');
const report=await frame.evaluate(async()=>{const out=[];for(const p of ['/api/account/login','/api/ancient/profile']){const response=await fetch(p,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});out.push({path:p,status:response.status,data:await response.json()})}return out});for(const r of report){assert(r.status>=400&&r.status<500,JSON.stringify(r));assert(r.data.error);}
assert.deepEqual(errors,[]);console.log('PASS real file://',file,'receives backend JSON authentication errors rather than Failed to fetch:',JSON.stringify(report));await page.close();}
}finally{await browser.close();}
