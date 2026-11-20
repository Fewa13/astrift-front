// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {build} from 'esbuild';import initSqlJs from 'sql.js/dist/sql-asm.js';
const {chromium}=createRequire('/Users/jingfeng/Documents/astrift-promo/record-worlds-v7.mjs')('playwright');
const bundle=await build({stdin:{contents:`export {newAncientProfile} from './src/ancient-rules';export {PROFESSIONS} from './src/ancient-skills';`,resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node'});
const M=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64')),SQL=await initSqlJs();
const p=M.newAncientProfile();Object.assign(p,{level:150,profession:'voidsword',fusedJobs:{voidsword:true},mastery:{},ascension:{jobs:{swordsman:{holy:true}},attempts:0,day:''},advancements:{voidsword:{route:'riftlord',skills:Object.fromEntries([...'XQZC'].map(key=>[key,{level:8,points:17}]))}}});
const db=new SQL.Database();db.run('CREATE TABLE ancient_profiles(name TEXT PRIMARY KEY,data TEXT NOT NULL)');db.run('INSERT INTO ancient_profiles VALUES(?,?)',['admintest',JSON.stringify(p)]);const bytes=Buffer.from(db.export()).toString('base64');db.close();
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
try{
const context=await browser.newContext({viewport:{width:1200,height:800}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(bytes=>{localStorage.setItem('Astrift-DevBuildAncient.activation.1','local-regression-fixture');localStorage.setItem('astrift.dev.database.v1',bytes)},bytes);
await page.route('https://fusion.local/**',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('../astrift-html/Astrift-DevBuildAncient.html')}));
await page.goto('https://fusion.local/');await page.waitForFunction(()=>window.__ASTRIFT_DEV__);
await page.evaluate(()=>{const Native=window.WebSocket;window.WebSocket=class extends Native{constructor(...args){super(...args);window.qaSocket=this}}});
await page.getByRole('button',{name:'Enter the Tribe',exact:true}).click();await page.locator('[data-region=tribe]').focus();await page.keyboard.press('Enter');
await page.waitForFunction(()=>window.qaSocket?.peer.deserializeAttachment()?.moveSeq>0,{},{timeout:15000});
assert.equal(await page.evaluate(()=>window.qaSocket.peer.deserializeAttachment().advancement),undefined);
await page.keyboard.press('Escape');
await page.getByRole('button',{name:'Character',exact:true}).click();
await page.getByRole('button',{name:'Professions',exact:true}).click();
await page.waitForFunction(()=>document.body.textContent.includes('Void Slash'));
const text=await page.locator('body').innerText();assert(text.includes('Void Swordmaster'));assert(!text.includes('Choose this path'));assert(!text.includes('Rift Sovereign'));assert(text.includes('Skill level · 8'));assert(text.includes('×2.975'));assert(!text.includes('Level 30 · Visit Gruk'));assert(!text.includes('CHOOSE AN ADVANCEMENT PATH'));
const saved=await page.evaluate(()=>window.__ASTRIFT_DEV__.command({action:'profile'}));assert(!saved.profile.advancements.voidsword);assert.equal(saved.profile.mastery.voidslash.level,8);

await page.screenshot({path:'/tmp/astrift-fusion-retirement.png'});
assert.deepEqual(errors,[]);await context.close();console.log('PASS: Dev HTML loads a legacy fusion account and removes its branch without browser errors.');
}finally{await browser.close()}
