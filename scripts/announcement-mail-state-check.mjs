// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {emailHarness} from './account-email-check.mjs';
const h=await emailHarness();h.registryState.storage.setAlarm=async()=>{};const db=new DatabaseSync(':memory:'),sql={exec(q,...a){const rows=db.prepare(q).all(...a);return {toArray:()=>rows}}},ctx={getWebSockets:()=>[],storage:{sql,setAlarm:async()=>{},transactionSync(fn){db.exec('BEGIN');try{const r=fn();db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}}}};h.world=new h.classes.AncientWorld(ctx,h.env);
await h.registry.publishOfficialMail({id:'announcement-read-test',title:'测试',titleEn:'Test',body:'测试',bodyEn:'Test',announcement:true,channel:'game',rewards:[{key:'skill-choice',quantity:2}]},['alice']);
let r=await h.world.command('alice','mailList',{});assert(r.ok);assert.equal(r.mailState.messages[0].readAt,0);
assert((await h.world.command('alice','mailRead',{id:'announcement-read-test'})).ok);
r=await h.world.command('alice','mailList',{});assert(r.mailState.messages[0].readAt>0);assert.equal(r.mailState.messages[0].claimedAt,0,'reading does not claim rewards');
r=await h.world.command('alice','mailClaim',{id:'announcement-read-test',selection:[{id:'chain',quantity:2}]});assert(r.ok,JSON.stringify(r));assert(r.mailState.messages[0].claimedAt>0);assert.equal(r.profile.materials['skillbook:chain'],2);
assert.equal((await h.world.command('alice','mailClaim',{id:'announcement-read-test',selection:[{id:'chain',quantity:2}]})).ok,false);
assert.equal((await h.world.command('bob','mailList',{})).mailState.messages[0].readAt,0);
console.log('PASS: actual World mail read, independent rewards, persisted read/claim states and account isolation');
