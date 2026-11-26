import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {chromium}=createRequire('/Users/jingfeng/Documents/astrift-promo/record-worlds-v7.mjs')('playwright');const root=path.resolve('public'),errors=[];const server=http.createServer((req,res)=>{if(req.url==='/ui-check'){res.setHeader('Content-Type','text/html');res.end('<html><body></body></html>');return}const file=path.join(root,new URL(req.url,'http://local').pathname==='/'?'index.html':new URL(req.url,'http://local').pathname);try{res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});const url='http://127.0.0.1:'+server.address().port;
try {
 const page=await browser.newPage({viewport:{width:1366,height:900}});
 await page.goto(url+'/ui-check',{waitUntil:'domcontentloaded'});
 await page.setContent('<html lang="en"><head><link rel="stylesheet" href="/ancient.css"><link rel="stylesheet" href="/ancient-controls.css"></head><body class="ancientPage" style="overflow:auto"><main id="fixture"></main></body></html>');
 await page.evaluate(async()=>{
  const {createHUDEditor}=await import('/astrift-hud-editor.js');window.hud=createHUDEditor('ancient',[]);
  const {createCommunityMapsUI}=await import('/ancient-community-ui.js');window.calls=[];
  window.community=createCommunityMapsUI({en:()=>true,request:async(action,data)=>{calls.push({action,...data});return {rows:[],page:1,pages:1,wallet:{}}}});
  await community.render(document.getElementById('fixture'));
 });
 const filter=page.getByRole('combobox',{name:'Map selection',exact:true});assert.equal(await filter.inputValue(),'all');
 await filter.selectOption('favorites');await page.waitForFunction(()=>calls.at(-1).code==='#favorites');await page.waitForTimeout(50);assert.equal(await filter.inputValue(),'favorites');
 await filter.selectOption('all');await page.waitForFunction(()=>!calls.at(-1).code);
 await page.evaluate(async()=>{document.getElementById('fixture').replaceChildren();const {createAncientInputSettings}=await import('/ancient-input-settings.js');createAncientInputSettings({en:()=>true,canLayout:()=>false,onLayout(){}}).render(document.getElementById('fixture'));});
 assert.equal(await page.locator('.ancientBindingGroup').count(),5);
 await page.locator('[data-ancient-binding="forward"]').click();await page.keyboard.press('KeyG');assert.equal(await page.locator('[data-ancient-binding="forward"]').innerText(),'G');
 await page.evaluate(()=>hud.open());await page.waitForFunction(()=>getComputedStyle(document.querySelector('.astriftHudEditor')).position==='fixed');
 assert.equal(await page.locator('.astriftHudEditor fieldset').count(),4);
 for(const node of await page.locator('.astriftHudEditor select,.astriftHudEditor input:not([type=range],[type=checkbox])').all()){
  assert.notEqual(await node.evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(255, 255, 255)');
  assert(await node.evaluate(n=>!!n.id&&!!document.querySelector('label[for="'+n.id+'"]')),'All controls have labels');
 }
 await page.getByLabel(/New profile name/).fill('Everyday');await page.getByRole('button',{name:/Save current bindings/}).click();
 await page.waitForFunction(()=>[...document.querySelectorAll('.astriftHudEditor option')].some(o=>o.value==='Everyday'));assert.equal(await page.getByLabel(/Saved profiles/).inputValue(),'Everyday');await page.getByRole('button',{name:/Load selected profile/}).click();await page.waitForFunction(()=>document.querySelector('.astriftHudEditor [role=status]').textContent.includes('applied'));
 await page.screenshot({path:'/tmp/astrift-controls-organized.png'});
 await page.setViewportSize({width:390,height:844});assert(await page.locator('.astriftHudEditor').evaluate(n=>n.getBoundingClientRect().right<=innerWidth));
 await page.getByRole('button',{name:/Done/}).click();assert.equal(await page.locator('.ancientBindingGrid').first().evaluate(n=>getComputedStyle(n).gridTemplateColumns.split(' ').length),1);
 console.log('PASS default all/favorites dropdown, dark labelled forms, grouped key rebinding, profile save/load and mobile layout');
}finally{await browser.close();server.closeAllConnections();server.close()}
