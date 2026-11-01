// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire('/Users/jingfeng/Documents/astrift-promo/record-worlds-v7.mjs')('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  for(const host of ['play.astrift.com','astrift-front.fewa3729.workers.dev']){
    const page=await browser.newPage();
    await page.route('https://9876543210-atari-embeds.googleusercontent.com/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>CORS fixture</title>'}));
    await page.goto('https://9876543210-atari-embeds.googleusercontent.com/test');
    const result=await page.evaluate(async host=>{
      const out=[];
      // No real credentials, registration, or mutations: authentication must fail.
      for(const path of ['/api/account/login','/api/ancient/profile']){
        const r=await fetch('https://'+host+path,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
        out.push({path,status:r.status,body:await r.json()});
      }
      return out;
    },host);
    for(const r of result){assert(r.status>=400&&r.status<500);assert(r.body.error);}
    const origin='https://9876543210-atari-embeds.googleusercontent.com';
    for(const path of ['/api/forum/admin','/api/tournaments/admin-login','/api/joinlog']){
      const r=await fetch('https://'+host+path,{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'POST'}});
      assert.equal(r.status,403);assert.equal(r.headers.get('Access-Control-Allow-Origin'),null);
    }
    console.log('PASS live browser CORS:',host,JSON.stringify(result),'management APIs blocked');
    await page.close();
  }
}finally{await browser.close();}
