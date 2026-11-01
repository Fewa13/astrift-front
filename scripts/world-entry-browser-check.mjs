// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire('/Users/jingfeng/Documents/astrift-promo/record-worlds-v7.mjs')('playwright');
const root=path.resolve('public'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'astrift-entry-')),errors=[],missing=[];
// Use the shipped chooser markup/styles/module, without starting the FPS renderer.
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://local');try{let body;if(url.pathname==='/'){body=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,s=>s.includes('src="/world-menu.js')?s:'');}else if(url.pathname==='/account.js')body='export function accountSession(){return window.qaLogged?{name:"qa"}:null}';else if(url.pathname==='/world-navigation.js')body='export function navigateWorld(world){window.qaWorld=world}';else body=fs.readFileSync(path.join(root,url.pathname));res.setHeader('Content-Type',url.pathname.endsWith('.webp')?'image/webp':url.pathname.endsWith('.css')?'text/css':url.pathname.endsWith('.js')?'text/javascript':'text/html');res.end(body);}catch{if(url.pathname!='/favicon.ico')missing.push(url.pathname);res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:'chrome',headless:true});
try{const page=await browser.newPage({viewport:{width:1440,height:960}});page.on('pageerror',e=>errors.push(String(e)));await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>document.querySelector('#enterMainWorld [data-entry-tag]').textContent==='ARENA');await page.evaluate(()=>Promise.all([...document.querySelectorAll('#worldEntry img')].map(i=>i.decode())));
 assert.equal(await page.locator('#worldEntry .entryCard').count(),2);await page.screenshot({path:path.join(temp,'desktop-en.png')});
 await page.locator('#enterAncientWorld').click();assert(await page.locator('#ancientEntryAuth').isVisible());await page.locator('#ancientEntryAuth [data-mode=cancel]').click();assert(await page.locator('#worldEntry').isVisible());
 await page.evaluate(()=>{window.qaLogged=true});await page.locator('#enterMainWorld').click();assert(await page.locator('#worldEntry').isHidden());
 await page.evaluate(()=>{document.getElementById('worldEntry').hidden=false;localStorage.setItem('astrift.language.v1','zh');dispatchEvent(new Event('astrift:language-changed'))});assert.equal(await page.locator('#enterAncientWorld [data-entry-title]').textContent(),'远古世纪');await page.screenshot({path:path.join(temp,'desktop-zh.png')});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(temp,'mobile-zh.png'),fullPage:true});assert(await page.evaluate(()=>{const entry=document.getElementById('worldEntry');return entry.scrollWidth<=entry.clientWidth+1&&[...entry.querySelectorAll('.entryCard')].every(c=>c.getBoundingClientRect().width<=innerWidth)}),'No horizontal overflow');await page.locator('#enterAncientWorld').click();assert.equal(await page.evaluate(()=>window.qaWorld),'ancient');
 await page.setViewportSize({width:844,height:390});await page.screenshot({path:path.join(temp,'landscape.png')});await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('#enterMainWorld').evaluate(n=>getComputedStyle(n).transitionDuration),'0s');assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log('PASS: real chooser markup/style/module, both languages, desktop/mobile/landscape, auth/cancel and both routes, reduced motion, no missing assets/errors. Screenshots:',temp);
}finally{await browser.close();await new Promise(r=>server.close(r));}
