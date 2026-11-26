import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {newAncientProfile} from '../public/ancient-rules.js';
const {chromium}=createRequire('/Users/jingfeng/Documents/astrift-promo/record-worlds-v7.mjs')('playwright');
const origin=process.env.ENTRY_ORIGIN||'https://play.astrift.com',errors=[];
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--autoplay-policy=no-user-gesture-required']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:960}});
 await page.route('**/api/**',r=>{const url=r.request().url();return r.fulfill({contentType:'application/json',body:JSON.stringify(url.includes('/ancient/profile')?{ok:true,profile:newAncientProfile()}:url.includes('/account/profile')?{ok:true,profile:{name:'EntryFixture',snapshot:{},season:{level:1,xp:0},rankPoints:1500,stats:{}}}:url.includes('/email/inbox')?{ok:true,messages:[{id:'entry-fixture',announcement:true,title:'更新公告',titleEn:'Update announcement',body:'启动与界面更新。',bodyEn:'Startup and interface update.',createdAt:Date.now()}]}:{ok:true})})});
 await page.addInitScript(()=>{localStorage.setItem('astrift.accountSession.v1',JSON.stringify({name:'EntryFixture',token:'a'.repeat(64)}));const Native=Audio;window.Audio=function(...args){const audio=new Native(...args);window.qaTheme=audio;return audio}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/?entryCheck='+Date.now(),{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__ASTRIFT_SHELL__?.entryFinished?.(),null,{timeout:120000});
 await page.locator('.entryAnnouncements').waitFor();await page.screenshot({path:'/tmp/astrift-live-announcement.png'});
 await page.getByRole('button',{name:'关闭公告 / Close announcements',exact:true}).click();
 await page.screenshot({path:'/tmp/astrift-live-chooser.png'});
 await page.setViewportSize({width:390,height:844});
 const frame=page.frameLocator('#astriftWorldFrame');
 assert(await frame.locator('#worldEntry').isVisible());
 assert(await frame.locator('html').evaluate(el=>el.scrollWidth<=innerWidth+1),'No horizontal overflow on mobile');
 await frame.locator('#enterAncientWorld').click();await page.waitForFunction(()=>document.querySelectorAll('iframe').length===1);
 assert(await page.frameLocator('#astriftWorldFrame').locator('#ancientStartup').isHidden());
 assert(await page.evaluate(()=>qaTheme.paused&&qaTheme.currentTime===0));
 assert.deepEqual(errors,[]);
 console.log('PASS live startup, announcement, mobile chooser, prewarmed Ancient, music stop:',origin);
}finally{await browser.close()}
