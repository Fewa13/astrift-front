// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {build} from 'esbuild';import initSqlJs from 'sql.js/dist/sql-asm.js';
const {chromium}=createRequire('/Users/jingfeng/Documents/astrift-promo/record-worlds-v7.mjs')('playwright');
const bundle=await build({stdin:{contents:`export {newAncientProfile} from './src/ancient-rules';export {PROFESSIONS} from './src/ancient-skills';`,resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node'});
const M=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64')),SQL=await initSqlJs();
const p=M.newAncientProfile();Object.assign(p,{level:250,profession:'warrior',gearAffixVersion:2,gear:[{id:'crit-blade',key:'blade8',affixBonusVersion:1,affixes:[{key:'critChance',value:.04},{key:'critDamage',value:.1},{key:'weaponDamage',value:.08},{key:'pet',value:.06}],hiddenAffixes:[{key:'slow',value:.04,rarity:8}]}],gearEquipped:{weapon:'crit-blade'}});
const db=new SQL.Database();db.run('CREATE TABLE ancient_profiles(name TEXT PRIMARY KEY,data TEXT NOT NULL)');db.run('INSERT INTO ancient_profiles VALUES(?,?)',['admintest',JSON.stringify(p)]);const bytes=Buffer.from(db.export()).toString('base64');db.close();
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
try{
const context=await browser.newContext({viewport:{width:1200,height:800}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(bytes=>{localStorage.setItem('Astrift-DevBuildAncient.activation.1','local-regression-fixture');localStorage.setItem('astrift.dev.database.v1',bytes)},bytes);
await page.route('https://critical.local/**',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('../astrift-html/Astrift-DevBuildAncient.html')}));
await page.goto('https://critical.local/');await page.waitForFunction(()=>window.__ASTRIFT_DEV__);
await page.evaluate(()=>{const Native=window.WebSocket;window.WebSocket=class extends Native{constructor(...args){super(...args);window.qaSocket=this}}});
await page.getByRole('button',{name:'Enter the Tribe',exact:true}).click();await page.locator('[data-region=tribe]').focus();await page.keyboard.press('Enter');
await page.waitForFunction(()=>window.qaSocket?.peer.deserializeAttachment()?.moveSeq>0,{},{timeout:15000});
await page.keyboard.press('Escape');
await page.getByRole('button',{name:'Inventory',exact:true}).click();
await page.getByRole('button',{name:'Gear & Items',exact:true}).click();
await page.waitForFunction(()=>document.body.textContent.includes('Melee critical chance'));
await page.getByRole('tab',{name:/^Weapons/}).click();
const details=page.locator('summary').filter({hasText:'Stats & affixes'});if(await details.count())await details.click();
const text=await page.locator('body').innerText();assert(text.includes('Critical damage'));assert(text.includes('Weapon damage'));assert(!text.includes('Summon damage +'));assert(!text.includes('Slow strength +'));
const saved=await page.evaluate(()=>window.__ASTRIFT_DEV__.command({action:'profile'}));const gear=saved.profile.gear.find(i=>i.id==='crit-blade');assert(![...gear.affixes,...gear.hiddenAffixes].some(v=>v.key==='pet'||v.key==='slow'));assert.equal(gear.hiddenAffixes[0].rarity,8);
await page.screenshot({path:'/tmp/astrift-melee-critical-gear.png'});
assert.deepEqual(errors,[]);await context.close();console.log('PASS: real Dev HTML migrates weapon affixes, preserves hidden rarity and renders critical stats without browser errors.');
}finally{await browser.close()}
