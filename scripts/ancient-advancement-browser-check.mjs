// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';

const {chromium}=createRequire(resolve('../astrift-promo/record-worlds-v7.mjs'))('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
const screenshots=process.env.ASTRIFT_ADVANCEMENT_SCREENSHOTS;
const origin=process.env.ASTRIFT_ADVANCEMENT_ORIGIN||'http://advancement.local';
if(screenshots)mkdirSync(screenshots,{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1080,height:720}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route(origin+'/**',route=>{
  const {pathname}=new URL(route.request().url());
  if(pathname==='/advancement-browser-check')return route.fulfill({contentType:'text/html',body:'<!doctype html><title>Advancement preview</title>'});
  if(origin!=='http://advancement.local')return route.continue();
  try{return route.fulfill({contentType:'text/javascript',body:readFileSync(resolve('public','.'+pathname))});}
  catch{return route.abort();}
 });
 await page.goto(origin+'/advancement-browser-check');
 const routes=await page.evaluate(async()=>{
  const {ADVANCED_PROFESSIONS}=await import('/ancient-advanced-professions.js');
  const {openSkillPreview}=await import('/ancient-skill-preview.js');
  window.openRoute=(job,advancement)=>openSkillPreview(job,{en:()=>true,advancement});
  return Object.entries(ADVANCED_PROFESSIONS).flatMap(([job,paths])=>paths.map(path=>({job,path})));
 });
 assert.equal(routes.length,26);
 for(const {job,path} of routes){
  await page.evaluate(({job,path})=>window.openRoute(job,path),{job,path});
  const dialog=page.getByRole('dialog');
  const select=dialog.getByRole('combobox',{name:'Skill'});
  assert.equal(await select.locator('option').count(),4);
  await dialog.getByLabel('Loop').uncheck();
  for(let index=0;index<4;index++){
   await select.selectOption(String(index));
   await dialog.getByRole('button',{name:'Play Skill'}).click();
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   assert(await dialog.locator('canvas').isVisible());
   if(screenshots)await dialog.locator('canvas').screenshot({path:resolve(screenshots,path.id+'-'+index+'.png')});
  }
  await dialog.getByRole('button',{name:'Close'}).click();
  assert.equal(await page.locator('canvas').count(),0);
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: WebGL preview opened, played and closed for all 104 skill slots across 26 routes.');
}finally{await browser.close();}
