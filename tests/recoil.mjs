import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const game=fs.readFileSync(new URL('../public/game.js',import.meta.url),'utf8');
const shot=game.split('\n').find(l=>l.startsWith('function shotFeedback('));
const decay=game.match(/viewKick\*=Math\.exp[^;]+;gunKick\*=Math\.exp[^;]+/)[0];
function simulate(key,recoil,recovery=1){const ctx={performance:{now:()=>10000},weaponKey:key,weaponDef:{recoil,recoilRecovery:recovery},lastRecoilAt:0,recoilIndex:0,viewKick:0,yaw:0,gunKick:0,crossBloom:0,muzzleFlash:{material:{},scale:{setScalar(){}}},muzzleLight:{},playShotSound(){},dt:.1};vm.createContext(ctx);vm.runInContext(shot+';shotFeedback()',ctx);return ctx;}
for(const [key,recoil,pitch] of [['redline',55,.012],['gale',60,.022],['frost',72,.052],['meteor',84,.078]]){
  const c=simulate(key,recoil);assert.ok(Math.abs(c.viewKick-pitch*recoil/64*3)<1e-9);
  const forwardY=Math.sin(c.viewKick);assert.ok(forwardY>0,'recoil must point upward');
}
const normal=simulate('redline',55),first=normal.viewKick;vm.runInContext(decay+';shotFeedback()',normal);assert.ok(normal.viewKick>first*1.5,'automatic fire accumulates vertical climb');
const modified=simulate('redline',55*.68);assert.ok(modified.viewKick<first,'recoil attachments still reduce kick');
const fast=simulate('redline',55,1.5),slow=simulate('redline',55);vm.runInContext(decay,fast);vm.runInContext(decay,slow);assert.ok(fast.viewKick<slow.viewKick,'recovery attachments accelerate return');
for(let i=0;i<100;i++)vm.runInContext('shotFeedback()',normal);assert.ok(normal.viewKick<=.55&&normal.gunKick<=.42);
for(let i=0;i<30;i++)vm.runInContext(decay,normal);assert.ok(normal.viewKick<.00001);
console.log('PASS recoil: 3x upward impulse, sustained climb, horizontal kick, bounded return, recoil/recovery attachments');
