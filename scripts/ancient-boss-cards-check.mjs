// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {build} from 'esbuild';
import {BOSS_CARDS,bossCardKey,craftBossCard,useBossCard,activeBossForm} from '../public/ancient-boss-cards.js';
import {newAncientProfile} from '../public/ancient-rules.js';
import {ancientProfileHealth} from '../public/ancient-gear.js';
import {skillHealth,skillDamageMultiplier,skillSpeedMultiplier,skillIncoming} from '../public/ancient-skills.js';
const now=10000;
for(const [kind,d]of Object.entries(BOSS_CARDS)){
 assert.equal(Object.entries(d.recipe).filter(([key])=>key!=='core').length,1);assert.equal(Object.entries(d.recipe).find(([key])=>key!=='core')[1],1,'Exactly one dedicated BOSS drop');assert(d.recipe.core>0,'Auxiliary cores still required');
 const p=newAncientProfile();p.level=50;Object.assign(p.materials,d.recipe);assert.equal(craftBossCard(p,kind),null);assert.equal(p.materials[bossCardKey(kind)],1);for(const k of Object.keys(d.recipe))assert.equal(p.materials[k],0);
 const before=JSON.stringify(p);assert.equal(craftBossCard(p,kind),'合成材料不足');assert.equal(JSON.stringify(p),before);
 const a={hp:10000};assert.equal(useBossCard(p,a,kind,now),null);assert.equal(p.materials[bossCardKey(kind)],0);skillHealth(a,ancientProfileHealth(p),now);assert.equal(a.hp,10000);assert.equal(a.maxHp,Math.floor(250000*(1+d.health)));
 assert.equal(skillDamageMultiplier(a,now),1+d.damage);assert.equal(skillSpeedMultiplier(a,now),1+d.speed);assert.equal(skillIncoming(a,now),1-d.reduction);
 const serialized=JSON.parse(JSON.stringify(a));assert(activeBossForm(serialized,now+59999));assert(!activeBossForm(serialized,now+60000));assert.equal(skillDamageMultiplier(a,now+60000),1);assert.equal(skillSpeedMultiplier(a,now+60000),1);assert.equal(skillIncoming(a,now+60000),1);skillHealth(a,250000,now+60000);assert.equal(a.maxHp,250000);
 p.materials[bossCardKey(kind)]=1;assert.equal(useBossCard(p,a,kind,now+1),'变身期间不能使用变身卡');assert.equal(p.materials[bossCardKey(kind)],1);
 a.skillRuntime.bossForm=undefined;a.skillRuntime.effects.transform={level:1,until:now+60000};assert.equal(useBossCard(p,a,kind,now),'变身期间不能使用变身卡');a.hp=0;assert.equal(useBossCard(p,a,kind,now),'请在存活时使用变身卡');
}
assert.equal(craftBossCard(newAncientProfile(),'__proto__'),'配方不存在');
const compiled=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']});
let clock=now,player,profile=newAncientProfile(),healthRow,abilities;profile.level=50;Object.assign(profile.materials,{crown:4,core:40});const messages=[];
const ws={deserializeAttachment:()=>JSON.parse(JSON.stringify(player)),serializeAttachment:a=>player=JSON.parse(JSON.stringify(a)),send:s=>messages.push(JSON.parse(s))};
const ctx={getWebSockets:()=>[ws],storage:{sql:{exec:(sql,...args)=>{let rows=[];if(sql.startsWith('SELECT hp'))rows=healthRow?[healthRow]:[];if(sql.startsWith('SELECT data FROM ancient_abilities'))rows=abilities?[{data:abilities}]:[];if(sql.startsWith('INSERT INTO ancient_health'))healthRow={hp:args[1],maxHp:args[2],deadAt:args[3]};if(sql.startsWith('INSERT INTO ancient_abilities'))abilities=args[1];return {toArray:()=>rows}}}}},module={exports:{}};
vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,crypto,Date:{now:()=>clock},Math,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
const server=new module.exports.AncientWorld(ctx,{});server.read=()=>profile;server.save=(_,p)=>profile=p;
player={name:'test',hp:10000,maxHp:250000,deadAt:0,weapon:profile.weapons[0],ammo:10,x:0,z:10,y:1.7};
assert((await server.command('test','craftBossCard',{kind:'lord'})).ok);assert((await server.command('test','craftBossCard',{kind:'lord'})).ok);
assert((await server.command('test','useBossCard',{kind:'lord'})).ok);assert.equal(player.hp,10000);assert.equal(player.maxHp,375000);assert.equal(profile.materials[bossCardKey('lord')],1);assert(JSON.parse(abilities).bossForm);assert(messages.some(m=>m.type==='bossForm'));
assert(!(await server.command('test','useBossCard',{kind:'lord'})).ok);assert.equal(profile.materials[bossCardKey('lord')],1);assert.equal(server.restoreHealth('test',profile).maxHp,375000);
clock+=60000;assert.equal(server.restoreHealth('test',profile).maxHp,250000);assert.equal(server.restoreHealth('test',profile).hp,10000);
player.hp=0;server.persistHealth(player);assert(!player.skillRuntime.bossForm);assert(!JSON.parse(abilities).bossForm);assert.equal(player.maxHp,250000);
console.log('PASS: all BOSS card recipes, atomic consumption, stat buffs, no healing, 60s/offline expiry, mutual exclusion, server use and death/reconnect persistence.');
