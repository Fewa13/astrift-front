// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {build} from 'esbuild';
import * as gear from '../public/ancient-gear.js';
import * as rules from '../public/ancient-rules.js';
import {forestPath} from '../public/ancient-forest.js';
import {skills,combat} from './ancient-test-modules.mjs';
const direction=[0,-.15,Math.sqrt(1-.15**2)];
const anchors=[[1,25],[5,125],[10,400],[20,800],[30,2500],[40,6000],[50,10000],[60,20000],[70,40000],[80,60000],[90,90000],[100,130000]];
for(const [l,n]of anchors)assert.equal(gear.ancientBaseAttack(l),n);
for(let l=1;l<150;l+=.1){assert(gear.ancientBaseAttack(l+.1)>=gear.ancientBaseAttack(l));assert(gear.ancientBaseAttack(l+.1)/gear.ancientBaseAttack(l)<1.16,'No segment boundary jump');}
for(const level of [1,5,10,20,30,40,50,60,70,80,90,100])for(const [job,definition]of Object.entries(skills.PROFESSIONS))for(const id of definition.skills){
 if(level<skills.SKILLS[id].unlock)continue;
 const p=rules.newAncientProfile();p.level=level;p.profession=job;p.skills=Object.fromEntries(definition.skills.map(key=>[key,1]));
 const a={name:'tester',x:0,y:1.7,z:50,hp:gear.ancientProfileHealth(p),weapon:p.weapons[0]};
 const m={id:'target',kind:'grox',x:0,z:id==='shadowreturn'?45:55,hp:1e9,maxHp:1e9};let damage=0;
 const c={map:'tribe',monsters:[m],damage(target,n){assert(Number.isFinite(n)&&n>0);const hit=Math.min(target.hp,Math.floor(n));target.hp-=hit;damage+=hit;return hit},fx(){}};
 const now=Date.now();assert.equal(combat.castAncientSkill(a,p,id,direction,c,now),null,id);
 if(id==='summon'){a.skillRuntime.summon.x=0;a.skillRuntime.summon.z=54;combat.tickAncientSkills(a,p,c,.2,now+200);assert(damage>=1);}
 else if(id==='weaken'){combat.ancientAuxShot(a,p,direction,c,now+400);assert(damage>0);}
 else if(id==='transform'){m.z=53;combat.ancientAuxShot(a,p,direction,c,now+400);assert(damage>0);}
 else if(id!=='vitality'){combat.tickAncientSkills(a,p,c,.2,now+(['phantomblade','swordrain','mountainfall'].includes(id)?750:200));assert(damage>0,id+' deals actual damage');if(id==='shadowreturn'){assert.equal(combat.castAncientSkill(a,p,id,direction,c,now+201),null);assert.equal(a.z,50);assert.equal(combat.castAncientSkill(a,p,id,direction,c,now+202),'技能冷却中');}else assert.equal(combat.castAncientSkill(a,p,id,direction,c,now+201),'技能冷却中');}
 p.gear=[{id:'sword',key:'genesis'}];p.gearEquipped={weapon:'sword'};assert.equal(gear.ancientSkillDamage(p),gear.ancientBaseAttack(level),'No weapon bonus leaks into skills');
}
// Actual multiplayer server path, not a fake damage callback.
const compiled=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']});
let now=100000;const messages=[],module={exports:{}},profile=rules.newAncientProfile();profile.profession='summoner';profile.skills={summon:1,soulbolt:1};
let actor={name:'owner',map:'tribe',x:0,z:49,y:1.7,yaw:0,hp:100,maxHp:100,weapon:profile.weapons[0],ammo:10,lastShot:0,reloadAt:0,seen:now,deadAt:0,profession:'summoner'};
const ws={deserializeAttachment:()=>structuredClone(actor),serializeAttachment:a=>actor=structuredClone(a),send:s=>messages.push(JSON.parse(s)),close(){}},ctx={getWebSockets:()=>[ws],storage:{sql:{exec:()=>({toArray:()=>[]})},setAlarm:async()=>{}}};
vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}}),Date:{now:()=>now},Math,crypto});
const server=new module.exports.AncientWorld(ctx,{}),monster={id:'grox',kind:'grox',level:1,hp:500,maxHp:500,x:0,z:51,homeX:0,homeZ:51,region:0,action:'idle',actionAt:0,attackAt:0,respawnAt:0,target:'owner'},world={map:'tribe',monsters:[monster],tick:now-200};
server.read=()=>profile;server.save=()=>{};server.world=()=>world;server.persist=()=>{};server.persistAbilities=()=>{};server.persistHealth=()=>{};
const c=server.skillContext(ws,actor,world.monsters,'tribe');assert.equal(combat.castAncientSkill(actor,profile,'summon',direction,c,now),null);actor.skillRuntime.summon.x=0;actor.skillRuntime.summon.z=50;
await server.alarm();assert.equal(monster.hp,480);assert.equal(monster.target,'@pet:owner');assert.equal(actor.hp,100);assert.equal(actor.skillRuntime.summon.hp,60,'Enemy damages pet, not owner');
assert(messages.some(m=>m.type==='hit'&&m.damage===20));assert.equal(messages.at(-1).summons[0].hp,60);
now+=200;actor.seen=now;await server.alarm();assert.equal(monster.hp,480,'Pet respects its attack cooldown');
actor.skillRuntime.summon.hp=0;now+=200;actor.seen=now;await server.alarm();assert(!actor.skillRuntime.summon);assert.notEqual(monster.target,'@pet:owner');
// No attacks through cover; marked pets path around actual forest obstacles.
const p=rules.newAncientProfile();p.level=30;p.profession='summoner';p.skills={summon:1};
const tree=rules.FOREST_TREES.find(t=>!rules.blocked(t.x-4,t.z,.8,'forest')&&!rules.blocked(t.x+4,t.z,.8,'forest')&&forestPath(t.x-4,t.z,t.x+4,t.z).length),a={name:'path',x:tree.x-4,z:tree.z,y:1.7,hp:100,weapon:p.weapons[0]};
const target={id:'blocked',kind:'mossling',x:tree.x+4,z:tree.z,hp:10000,maxHp:10000};let hits=0;
const context={map:'forest',monsters:[target],damage(){hits++;return 1},fx(){}};
assert.equal(combat.castAncientSkill(a,p,'summon',direction,context,now),null);Object.assign(a.skillRuntime.summon,{x:tree.x-4,z:tree.z,target:target.id});
combat.tickAncientSkills(a,p,context,.2,now+200);assert.equal(hits,0);assert(a.skillRuntime.summon.path.length>0);assert(!rules.blocked(a.skillRuntime.summon.x,a.skillRuntime.summon.z,.8,'forest'));
console.log('PASS: continuous level 1–150 curve; every unlocked profession damage skill across 12 level bands; cooldowns; weapon-independent spells; real server pet damage, aggro, enemy counterattack, synchronized HP, death release; forest cover and pathing.');
