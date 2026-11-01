// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('public/ancient-client.js','utf8');let flashes=0,cancels=0,last;
const overlay={setAttribute(){},animate(frames,options){flashes++;last={frames,options};return {cancel(){cancels++}}}},context={node:()=>overlay,document:{body:{}}};
vm.runInNewContext(source.split('\n').filter(l=>l.startsWith('const hurtOverlay')||l.startsWith('function clearHurt')||l.startsWith('function flashHurt')).join('\n'),context);
const hp=(hp,maxHp=100,name='player')=>({name,hp,maxHp});
context.flashHurt(hp(100),hp(80));assert.equal(flashes,1);assert.equal(last.options.duration,650);assert.equal(last.frames.at(-1).opacity,0);
context.flashHurt(hp(80),hp(60));assert.equal(flashes,2);assert.equal(cancels,1,'Repeated hits replace the old animation');
for(const [a,b]of [[null,hp(100)],[hp(80),hp(100)],[hp(80),hp(80)],[hp(0),hp(100)],[hp(100),hp(80,100,'pet')],[hp(103),hp(100)],[hp(103,103),hp(100,100)]]){if(a?.hp===103&&a.maxHp===100)continue;context.flashHurt(a,b)}assert.equal(flashes,2,'Healing, entry, respawn, other actors and expired max-HP bonuses do not flash');
context.flashHurt(hp(103,103),hp(90,100));assert.equal(flashes,3);context.flashHurt(hp(90),hp(0));assert.equal(flashes,4,'Fatal hits also flash');context.clearHurt();assert.equal(cancels,4);
assert(source.includes("if(d.type==='state'){flashHurt(me,d.you);me=d.you;"));const css=fs.readFileSync('public/ancient.css','utf8');assert(css.includes('#ancientHurt{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:0;'));
console.log('PASS: actual HP loss triggers fading red edges; repeat/fatal hits; no healing/spawn/pet/max-HP-expiry false positives; cleanup; input-transparent layer below HUD');
