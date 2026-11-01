// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {combat} from './ancient-test-modules.mjs';
import {ANCIENT_KINDS,newAncientProfile} from '../public/ancient-rules.js';
const built=await build({entryPoints:['src/ancient-hitboxes.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {ancientHitbox,rayAncientHitbox}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const kinds=['grox','hunter','chief','lord',...Object.keys(ANCIENT_KINDS)];
for(const kind of kinds){
 const {height,radius}=ancientHitbox(kind),m={id:kind,kind,x:0,z:55,hp:1e12,maxHp:1e12};
 const a={name:'p',x:0,y:height*.98,z:50,hp:1e6},c={map:'tribe',monsters:[m],damage(){return 1},fx(){}};
 assert.equal(combat.selectSkillTarget(a,[0,0,1],4.5,c)?.id,kind,kind+' upper head in melee range');
 assert.equal(combat.selectSkillTarget(a,[0,0,1],30,c)?.id,kind,kind+' upper head skill lock');
 assert.equal(rayAncientHitbox({...a,y:height+.1},[0,0,1],m,0,30),undefined,kind+' above body misses');
 assert.equal(rayAncientHitbox({...a,x:radius+.1},[0,0,1],m,0,30),undefined,kind+' horizontal radius not inflated');
}
for(const kind of ['bone_shield','totem_priest','chain_jailer','city_guard','blight_stalker','sanctum_sentinel','crystal_fire']){
 const p=newAncientProfile();p.level=80;p.profession='swordsman';p.skills={swordrain:3,phantomblade:3};
 const m={id:'m',kind,x:0,z:55,hp:1e12,maxHp:1e12};
 for(const id of ['swordrain','phantomblade']){
  const a={name:'p',x:0,y:ancientHitbox(kind).height*.98,z:50,hp:1e6,weapon:p.weapons[0]};let damage=0;
  const c={map:'tribe',monsters:[m],damage(m,n){damage+=n;return n},fx(){}};const now=Date.now();
  assert.equal(combat.castAncientSkill(a,p,id,[0,0,1],c,now),null,kind+' upper head cast');
  for(let t=200;t<3500;t+=200)combat.tickAncientSkills(a,p,c,.2,now+t);
  assert(damage>0,kind+' upper head actual skill damage');
 }
}
// Existing wall occlusion and strict reach are preserved.
const wall={id:'wall',kind:'bone_shield',x:27,z:70,hp:100,maxHp:100};
assert.equal(combat.selectSkillTarget({name:'p',x:27,z:30,y:2,hp:100},[0,0,1],60,{map:'tribe',monsters:[wall]}),undefined);
assert.equal(rayAncientHitbox({x:0,y:1,z:0},[0,0,1],{kind:'grox',x:0,z:10},0,4.5),undefined);
console.log(`PASS: ${kinds.length} monster upper heads for melee/skills; seven archetypes actual delayed skill damage; above-head/side misses, reach and walls preserved.`);
