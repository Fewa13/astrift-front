// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {emailHarness} from './account-email-check.mjs';
const h=await emailHarness(),db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows,one:()=>rows[0]}}},ctx={storage:{sql,transactionSync:fn=>fn(),setAlarm:async()=>{},getAlarm:async()=>null},getWebSockets:()=>[]};
let clock=Date.now();Date.now=()=>clock;
const world=new h.classes.AncientWorld(ctx,h.env),f=world.friends();
for(const buddy of ['alice','carol'])for(const [a,b] of [['bob',buddy],[buddy,'bob']])sql.exec('INSERT INTO ancient_friends VALUES(?,?)',a,b);
const send=(who)=>{clock+=600;assert(!f.command(who,'friendSend',{target:'bob',text:'Hello friend'}).error)};
send('alice');send('carol');assert.equal(f.state('bob').unread,2);assert.equal(f.state('alice').unread,0);
const chat=f.command('bob','friendMessages',{target:'alice'});assert.equal(f.state('bob').unread,2,'fetching messages alone cannot clear unread');send('alice');
f.command('bob','friendRead',{target:'alice',through:chat.readThrough});assert.equal(f.state('bob').unread,2,'a newer message and another conversation remain unread');
for(let i=0;i<20;i++)send('alice');assert.equal(f.command('bob','friendMessages',{target:'alice'}).messages.length,15);assert.equal(f.state('bob').unread,22,'unread is independent of retained history');
const again=new h.classes.AncientWorld(ctx,h.env).friends();assert.equal(again.state('bob').unread,22,'unread survives object recreation');
again.command('bob','friendRead',{target:'alice',through:999});assert.equal(again.state('bob').unread,1);assert(again.command('bob','friendRead',{target:'stranger',through:1}).error);assert(again.command('bob','friendRead',{target:'alice',through:-1}).error);
again.command('bob','friendRemove',{target:'carol'});assert.equal(again.state('bob').unread,0);
console.log('PASS unread persistence, separate conversations, bounded read receipts, history trimming, and friendship authorization.');
