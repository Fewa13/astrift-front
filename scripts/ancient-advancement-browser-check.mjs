// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
import {castVisuals} from './ancient-advancement-combat-check.mjs';

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
 const messages=await page.evaluate(async()=>{
  const {createCombatNotices}=await import('/ancient-combat-notices.js');
  const notices=createCombatNotices();
  const profile={profession:'summoner',advancements:{summoner:{skills:{Q:{level:9,points:2}}}}};
  for(const en of [true,false])notices.mastery(['advancement:necromancer:Q'],profile,en);
  notices.update(performance.now());
  const text=document.querySelector('.ancientCombatFeed').textContent;
  notices.clear();
  return text;
 });
 assert(messages.includes('Unleash · Lv. 9'));
 assert(messages.includes('释放 · 9 级'));

 const dispatcherFailures=await page.evaluate(async castEvents=>{
  const THREE=await import('/three.module.js');
  const {advancementEffectIds}=await import('/ancient-advancement-fx.js');
  const {createAncientSkillVisuals}=await import('/ancient-skill-visuals.js');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera();
  const visuals=createAncientSkillVisuals(scene,camera,new THREE.Group(),()=>undefined);
  const failures=[];
  for(const id of advancementEffectIds){
   visuals.effect({id,x:2,z:0,radius:5,source:{x:-2,y:1.45,z:0},
    target:'test',links:[{x:4,z:-3,height:1,target:'linked'}]},()=>0);
   visuals.updateMagic(performance.now(),.016);
   if(!scene.children.some(group=>group.children.length))failures.push(id);
   visuals.clearMagic();
   if(scene.children.length)failures.push(id+':cleanup');
  }
  for(const {id,x,z,radius,details} of castEvents){
   if(!advancementEffectIds.includes(id))continue;
   visuals.effect({id,x,z,radius,source:{x:0,y:1.45,z:10},...details},()=>0);
   visuals.updateMagic(performance.now(),.016);
   if(!scene.children.some(group=>group.children.length))failures.push(id+':cast');
   scene.traverse(node=>{
    if(![...node.position,...node.scale,...node.quaternion].every(Number.isFinite))failures.push(id+':transform');
   });
   visuals.clearMagic();
  }
  return failures;
 },castVisuals);
 assert.deepEqual(dispatcherFailures,[]);

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
   if(path.id==='stormcaller'&&index===3){
    const canvas=dialog.locator('canvas');
    await page.waitForTimeout(900);
    const second=await canvas.screenshot();
    await page.waitForTimeout(550);
    const third=await canvas.screenshot();
    assert(!second.equals(third),'Heavenfall preview should continue rendering through the final wave');
   }
  }
  await dialog.getByRole('button',{name:'Close'}).click();
  assert.equal(await page.locator('canvas').count(),0);
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: WebGL preview opened, played and closed for all 104 skill slots across 26 routes.');
}finally{await browser.close();}
