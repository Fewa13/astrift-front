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
 for(const [job,route] of [['swordsman','blademaster']]){
  const context=await browser.newContext({viewport:{width:1200,height:800}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.addInitScript(bytes=>{localStorage.setItem('Astrift-DevBuildAncient.activation.1','local-regression-fixture');localStorage.setItem('astrift.dev.database.v1',bytes)},seed(job,route));
  await page.route('https://rework.local/**',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('../astrift-html/Astrift-DevBuildAncient.html')}));
  await page.goto('https://rework.local/');await page.waitForFunction(()=>window.__ASTRIFT_DEV__);
  await page.evaluate(()=>{const Native=window.WebSocket;window.WebSocket=class extends Native{constructor(...args){super(...args);window.qaSocket=this}}});
  await page.getByRole('button',{name:'Enter the Tribe',exact:true}).click();await page.locator('[data-region=tribe]').focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>window.qaSocket?.peer.deserializeAttachment()?.moveSeq>0,{},{timeout:15000});
  const send=key=>page.evaluate(key=>{window.qaSocket.send(JSON.stringify({type:'skill',id:'advanced:'+key,direction:[0,-.3,Math.sqrt(.91)]}))},key);
  await send('Q');
  await page.waitForFunction(()=>window.qaSocket.peer.deserializeAttachment()?.skillRuntime?.advancedSword?.nets?.length===1);
  const net=await page.evaluate(()=>window.qaSocket.peer.deserializeAttachment().skillRuntime.advancedSword.nets[0]);
  assert(net.radius===5&&Math.abs(net.y)<.1);
  await page.waitForTimeout(250);await page.screenshot({path:'/tmp/astrift-ground-net-in-game.png'});
  await page.evaluate(()=>{
   const a=window.qaSocket.peer.deserializeAttachment();
   for(const [index,shape] of ['flame-orb','ice-shard','thunder-sigil','hex-ring','stone-lance','time-sigil'].entries())window.qaSocket.onmessage({data:JSON.stringify({type:'skillFx',id:'swordwave',phase:'skill-flight',owner:a.name,projectile:'qa-'+index,x:a.x,z:a.z+50,source:{x:a.x+(index-2.5)*.5,y:a.y,z:a.z},direction:[0,0,1],level:50,flight:{shape,color:[0xff792e,0x70d8f5,0x8fafff,0xad65e9,0xb58a57,0xf2c66c][index],trim:0xc1fbd8,radius:.7,speed:40,slot:index%4}})});
  });
  await page.waitForTimeout(350);await page.screenshot({path:'/tmp/astrift-skill-flights-in-game.png'});
  assert.deepEqual(errors,[],route);await context.close();
 }
 console.log('PASS: real game HTML deploys a ground sword net and renders multiple profession flight families without runtime errors.');
}finally{await browser.close()}
