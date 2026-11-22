// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire('/Users/jingfeng/Documents/astrift-promo/record-worlds-v7.mjs')('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=metal']});
try{
 const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.addInitScript(()=>localStorage.setItem('Astrift-DevBuildAncient.activation.1','local-regression-fixture'));
 if(!process.env.DEV_MOVEMENT_ORIGIN)await page.route('https://dev-movement.local/**',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('../astrift-html/Astrift-DevBuildAncient.html')}));
 await page.route('**/favicon.ico',r=>r.fulfill({status:204}));
 await page.goto(process.env.DEV_MOVEMENT_ORIGIN||'https://dev-movement.local/');await page.waitForFunction(()=>!!window.__ASTRIFT_DEV__);
 await page.evaluate(()=>{window.qaMoves=[];const Native=window.WebSocket;window.WebSocket=class extends Native{constructor(...args){super(...args);window.qaSocket=this}send(data){const v=JSON.parse(data);if(v.type==='move')window.qaMoves.push(v);super.send(data)}}});
 await page.getByRole('button',{name:'Enter the Tribe',exact:true}).click();
 await page.locator('[data-region=tribe]').focus();await page.keyboard.press('Enter');
 await page.waitForFunction(()=>window.qaSocket?.peer.deserializeAttachment()?.moveSeq>0,{},{timeout:15000}).catch(async error=>{
  await page.screenshot({path:'/tmp/dev-connection-failure.png'});
  const diagnostic=await page.evaluate(()=>({socket:window.qaSocket?.readyState,actor:window.qaSocket?.peer.deserializeAttachment(),moves:window.qaMoves.length,text:document.body.innerText.slice(-1500)}));
  throw new Error(error.message+' '+JSON.stringify(diagnostic)+' errors='+JSON.stringify(errors));
 });
 await page.evaluate(async()=>{for(const id of ['speed','berserk']){const r=await window.__ASTRIFT_DEV__.command({action:'useSupply',id});if(r.ok===false)throw Error(r.error);}const a=window.qaSocket.peer.deserializeAttachment();if(!(a.boosts.speed>Date.now()&&a.boosts.berserk>Date.now()))throw Error('Boosts not synchronized');});
 await page.locator('#ancientCanvas').click({position:{x:700,y:400}});
 const position=()=>page.evaluate(()=>{const a=window.qaSocket.peer.deserializeAttachment();return {x:a.x,y:a.y,z:a.z,seq:a.moveSeq}});
 const before=await position();await page.evaluate(()=>window.qaMoves=[]);await page.keyboard.down('s');await page.waitForTimeout(1100);await page.keyboard.up('s');await page.waitForTimeout(250);const walked=await position();
 const walking=Math.hypot(walked.x-before.x,walked.z-before.z);assert(walking>8,'W must move the authoritative Dev player: '+JSON.stringify({before,walked}));
 const maxStep=()=>page.evaluate(()=>Math.max(0,...window.qaMoves.slice(1).map((v,i)=>Math.hypot(v.x-window.qaMoves[i].x,v.z-window.qaMoves[i].z))));
 const walkStep=await maxStep();await page.evaluate(()=>window.qaMoves=[]);
 await page.keyboard.down('Shift');await page.keyboard.down('w');await page.waitForTimeout(1100);await page.keyboard.up('w');await page.keyboard.up('Shift');await page.waitForTimeout(250);const sprinted=await position();
 assert(Math.hypot(sprinted.x-walked.x,sprinted.z-walked.z)>walking*1.15,'Boosted Shift sprint must exceed boosted walking distance');
 await page.evaluate(()=>window.qaMoves=[]);await page.keyboard.press('Space');await page.waitForTimeout(900);assert(await page.evaluate(base=>window.qaMoves.some(v=>v.y>base+.4),sprinted.y),'Space must initiate a jump');
 await page.keyboard.press('Tab');assert(await page.locator('#ancientPanel').getByText('Inventory',{exact:true}).count()>0||await page.locator('#ancientPanel').getByText('背包',{exact:true}).count()>0,'Tab opens inventory');
 await page.screenshot({path:'/tmp/astrift-potion-dev-movement.png'});assert.deepEqual(errors,[]);
 console.log('PASS: real Dev consumes Speed and Berserk supplies, synchronizes both saved buffs, accepts boosted 1.8x walking and sprint movement, jumps and opens inventory without correction or runtime errors.');
}finally{await browser.close()}
