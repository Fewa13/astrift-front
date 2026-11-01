// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {ANCIENT_KINDS,ancientMonsterXP,xpNeeded} from '../public/ancient-rules.js';
import {GEAR,ancientProfileHealth,ancientBaseHealth,ancientBaseAttack,ancientMeleeDamage,ancientSkillDamage} from '../public/ancient-gear.js';
for(const [kind,d]of Object.entries(ANCIENT_KINDS))if(!d.boss&&kind!=='noble_echo'){
 let previous=0;
 for(let l=50;l<=200;l++){const xp=ancientMonsterXP(kind,l),kills=xpNeeded(l)/xp;assert(kills>=20,kind+' minimum kills');assert(kills>=previous,kind+' slows at higher levels');previous=kills;}
}
for(const [l,n]of [[50,45],[60,50],[80,60],[100,69],[150,139]])assert.equal(Math.floor(xpNeeded(l)/ancientMonsterXP('sentinel',l)),n);
for(const [level,q,key]of [[50,4,'emperor'],[80,5,'starRuin'],[100,6,'genesis']]){
 const p={level,gear:[{id:'w',key},{id:'a',key:'armor'+q},{id:'h',key:'helmet'+q},{id:'v',key:'wings'+q}],gearEquipped:{weapon:'w',armor:'a',helmet:'h',wings:'v'}};
 assert(ancientProfileHealth(p)<ancientBaseHealth(level)*1.8,'equipment does not multiply HP excessively');
 assert(GEAR[key].damage<=ancientBaseAttack(level),'weapon bonus stays below level base attack');
 assert(ancientMeleeDamage(p)<ancientSkillDamage(p)*3.9,'single ordinary skill exceeds melee swing');
}
assert.equal(GEAR.set_thunder_armor6.health,GEAR.armor6.health);
assert.equal(GEAR.forge_crystal_weapon.damage,Math.floor(GEAR.emperor.damage*.95));
console.log('PASS: all ordinary monster curves >=20 kills and monotonically slower after Lv50; gear health/weapon bounds; sets and forged gear use updated stats.');
