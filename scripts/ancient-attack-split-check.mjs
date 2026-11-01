// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import * as rules from '../public/ancient-rules.js';
import * as gear from '../public/ancient-gear.js';
import {combat} from './ancient-test-modules.mjs';
for(const [level,base] of [[30,2500],[50,10000]]){
 const p=rules.newAncientProfile();p.level=level;
 assert.equal(gear.ancientBaseAttack(level),base);
 for(const key of ['stoneRough','purifyHoly']){
  p.gear=[{id:'test',key}];p.gearEquipped={weapon:'test'};
  assert.equal(gear.ancientSkillDamage(p),base);
  assert.equal(gear.ancientMeleeDamage(p),base+gear.gearDefinition(key).damage);
  for(const [job,id,multiplier] of [['warrior','slash',4.1],['summoner','soulbolt',4.2],['ice','icebolt',3.9],['lightning','chain',3.9],['curse','hex',4.1]]){
   p.profession=job;p.skills={[id]:3};const a={name:'test',x:0,y:1.7,z:50,hp:10000,maxHp:10000,weapon:p.weapons[0]};
   let damage=0;const c={map:'tribe',monsters:[{id:'m',kind:'grox',x:0,z:55,hp:1e8,maxHp:1e8}],damage(m,n){damage=Math.floor(n);return damage},fx(){}};
   assert.equal(combat.castAncientSkill(a,p,id,[0,-.15,Math.sqrt(1-.15**2)],c),null);
   assert.equal(damage,Math.floor(base*multiplier),`${level} ${key} ${id}`);
  }
 }
 gear.equipAncientGear(p,'weapon','');assert.equal(gear.ancientMeleeDamage(p),0);assert.equal(gear.ancientSkillDamage(p),base);
}
{
 const p=rules.newAncientProfile();p.level=50;p.profession='summoner';p.skills={transform:3};
 const now=Date.now(),a={name:'claw',x:0,y:1.7,z:50,hp:10000,maxHp:10000,weapon:p.weapons[0],skillRuntime:{cooldowns:{},effects:{transform:{until:now+60000,level:3}},mode:1,lastAux:0}};
 let damage=0;const c={map:'tribe',monsters:[{id:'m',kind:'grox',x:0,z:53,hp:1e8,maxHp:1e8}],damage(m,n){damage=Math.floor(n);return damage},fx(){}};
 combat.ancientAuxShot(a,p,[0,-.15,Math.sqrt(1-.15**2)],c,now);
 assert.equal(damage,15500,'Level 50, level 3 transformation claws at 155%');
 combat.ancientAuxShot(a,p,[0,-.15,Math.sqrt(1-.15**2)],c,now+100);assert.equal(a.skillRuntime.lastAux,now,'Claw cooldown unchanged');
}
console.log('PASS: 30/50-level skills; weapon-independent skill damage; additive melee; 155% transformation claws; retained cooldown.');
