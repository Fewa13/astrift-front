// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {ancientMonsterXP,ancientKillExperience,ancientMonsterDamage,xpNeeded,xpRewardBase,gainXP,newAncientProfile} from '../public/ancient-rules.js';
import {ancientBaseHealth,ancientBaseAttack} from '../public/ancient-gear.js';
import {FROSTCOURT_SPAWNS,FROSTCOURT_KINDS,frostcourtMonsterHP,frostcourtMonsterDamage} from '../public/ancient-frostcourt.js';
import {starfallMonsterHP,starfallMonsterDamage} from '../public/ancient-starfall.js';
const oldNeeded=l=>Math.floor(200*l*l*(l<150?1:2*(1+(l-150)/40)**2));
const killXP=l=>ancientKillExperience(ancientMonsterXP('frost_oathguard',l));
for(let l=1;l<=100;l++)assert.equal(xpNeeded(l),oldNeeded(l),'Earlier maps are unchanged');
for(let l=101;l<180;l++){const start=oldNeeded(100)/killXP(100),end=oldNeeded(180)*1.6/killXP(180);assert(Math.abs(xpNeeded(l)/killXP(l)-(start+(end-start)*(l-100)/80))<1e-4,'Even per-level increase');}
let previous=0;
for(let l=30;l<=10000;l++){
 const kills=xpNeeded(l)/killXP(l);assert(Number.isFinite(kills)&&kills>previous,'Same-level effort must increase at '+l);previous=kills;
 assert(xpNeeded(l)>=oldNeeded(l));
 if(l>=180)assert(Math.abs(xpNeeded(l)/oldNeeded(l)-1.6)<1e-5,'Requested latest-map multiplier at '+l);
}
// Reward curves, coin inputs and same-level combat are untouched, including
// all currently spawned level bands and both passive/telegraphed bosses.
for(const [kind,ref]of [['frost_oathguard','tide_carapace'],['ember_mason','drowned_scribe'],['chain_executor','anchor_revenant'],['frost_crowned','starbound_heart']]){
 let hp=0,damage=0,xp=0;
 for(let l=180;l<=230;l++){
  const h=frostcourtMonsterHP(kind,l),d=frostcourtMonsterDamage(kind,l),x=ancientMonsterXP(kind,l);
  assert(h>hp&&d>damage&&x>xp);hp=h;damage=d;xp=x;
  assert.equal(h,starfallMonsterHP(ref,l));assert.equal(d,starfallMonsterDamage(ref,l));assert.equal(x,ancientMonsterXP(ref,l));
  assert(h+.51>=ancientBaseAttack(l)*43.6);assert.equal(d,ancientMonsterDamage(kind,l));
 }
}
for(const point of [...FROSTCOURT_SPAWNS,{kind:'furnace_regent',level:200},{kind:'frost_crowned',level:220}]){
 const {kind,level}=point,hp=frostcourtMonsterHP(kind,level),damage=frostcourtMonsterDamage(kind,level);
 assert(Number.isSafeInteger(hp)&&hp>0&&Number.isSafeInteger(damage)&&damage>0);
 assert(damage/ancientBaseHealth(level)>=.069&&damage/ancientBaseHealth(level)<=.201);
 if(FROSTCOURT_KINDS[kind].boss)assert(hp>=frostcourtMonsterHP('frost_oathguard',level)*5.5);
}
const save=newAncientProfile();save.level=134;save.xp=123456;const copy=structuredClone(save);xpNeeded(save.level);assert.deepEqual(save,copy,'No level/XP reset or retroactive changes');
for(const l of [90,100,134,149,150,179,180,220]){const p={level:l,xp:xpNeeded(l)-1};gainXP(p,1,false);assert.deepEqual(p,{level:l+1,xp:0});}
assert.equal(xpRewardBase(180),6480000,'Quest reward reference stays unchanged');
console.table([90,100,120,134,140,150,160,180,200,220].map(level=>({level,neededXP:xpNeeded(level),killXP:killXP(level),oldKills:+(oldNeeded(level)/killXP(level)).toFixed(2),newKills:+(xpNeeded(level)/killXP(level)).toFixed(2)})));
console.table([['frost_oathguard',180],['ember_mason',190],['chain_executor',200],['furnace_regent',200],['frost_crowned',220]].map(([kind,level])=>({kind,level,hp:frostcourtMonsterHP(kind,level),damage:frostcourtMonsterDamage(kind,level),xp:ancientKillExperience(ancientMonsterXP(kind,level))})));
console.log('PASS progression: old saves/rewards/combat intact, Lv1–100 unchanged, linear Lv100–180 effort, monotonic same-level effort through Lv10000, preserved 1.6x Lv180+ target, every new spawn finite and level-scaled.');
