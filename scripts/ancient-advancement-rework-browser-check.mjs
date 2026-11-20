// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import initSqlJs from 'sql.js/dist/sql-asm.js';
const {chromium}=createRequire('/Users/jingfeng/Documents/astrift-promo/record-worlds-v7.mjs')('playwright');
const bundle=await build({stdin:{contents:`export {newAncientProfile} from './src/ancient-rules';export {chooseAdvancement} from './src/ancient-advancement-progress';export {PROFESSIONS} from './src/ancient-skills';`,resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node'});
const M=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const SQL=await initSqlJs();
function seed(job,route){const p=M.newAncientProfile();p.level=150;p.profession=job;p.skills=Object.fromEntries(M.PROFESSIONS[job].skills.map(id=>[id,5]));p.ascension={jobs:{[job]:{holy:true}},attempts:0,day:''};if(job==='chrono'){p.fusedJobs={[job]:true};p.mastery=Object.fromEntries(M.PROFESSIONS[job].skills.map(id=>[id,{level:5,points:0}]))}assert(M.chooseAdvancement(p,route));const db=new SQL.Database();db.run('CREATE TABLE ancient_profiles(name TEXT PRIMARY KEY,data TEXT NOT NULL)');db.run('INSERT INTO ancient_profiles VALUES(?,?)',['admintest',JSON.stringify(p)]);const bytes=Buffer.from(db.export()).toString('base64');db.close();return bytes;}
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
try{
 for(const [job,route] of [['stonewright','veinforger']]){
  const context=await browser.newContext({viewport:{width:1200,height:800}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.addInitScript(bytes=>{localStorage.setItem('Astrift-DevBuildAncient.activation.1','local-regression-fixture');localStorage.setItem('astrift.dev.database.v1',bytes)},seed(job,route));
  await page.route('https://rework.local/**',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('../astrift-html/Astrift-DevBuildAncient.html')}));
  await page.goto('https://rework.local/');await page.waitForFunction(()=>window.__ASTRIFT_DEV__);
  await page.evaluate(()=>{const Native=window.WebSocket;window.WebSocket=class extends Native{constructor(...args){super(...args);window.qaSocket=this}}});
  await page.getByRole('button',{name:'Enter the Tribe',exact:true}).click();await page.locator('[data-region=tribe]').focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>window.qaSocket?.peer.deserializeAttachment()?.moveSeq>0,{},{timeout:15000});
  const send=key=>page.evaluate(key=>{window.qaSocket.send(JSON.stringify({type:'skill',id:'advanced:'+key,direction:[0,-.3,Math.sqrt(.91)]}))},key);
  if(route==='veinforger'){
   await send('X');await page.waitForFunction(()=>window.qaSocket.peer.deserializeAttachment()?.skillRuntime?.advancedStone?.spikes.length===1);
   await page.waitForTimeout(1300);await page.evaluate(()=>{const a=window.qaSocket.peer.deserializeAttachment();a.x+=3;window.qaSocket.peer.serializeAttachment(a)});await send('X');
   await page.waitForFunction(()=>window.qaSocket.peer.deserializeAttachment()?.skillRuntime?.advancedStone?.spikes.length===2);await send('C');
   await page.waitForFunction(()=>window.qaSocket.peer.deserializeAttachment()?.skillRuntime?.advancedStone?.formation?.points.length>0);
   await page.screenshot({path:'/tmp/astrift-earth-rework.png'});await send('Z');await page.waitForFunction(()=>window.qaSocket.peer.deserializeAttachment()?.skillRuntime?.advancedStone?.spikes.length===0);
  }
  assert.deepEqual(errors,[],route);await context.close();
 }
 console.log('PASS: real Dev HTML renders earth placement/link/detonation, and has no browser runtime errors.');
}finally{await browser.close()}
