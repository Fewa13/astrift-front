// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {newAncientProfile} from '../public/ancient-rules.js';
import {ANCIENT_SUPPLIES,supplyKey,useAncientSupply} from '../public/ancient-commerce.js';
import {BOSS_CARDS,bossCardKey,useBossCard,bossFormStats,healBossCard} from '../public/ancient-boss-cards.js';
import {skillHealth} from '../public/ancient-skills.js';
import {ancientGearStats,gearDescription,gearAffixDescription} from '../public/ancient-gear.js';
const p=newAncientProfile(),now=10000;
for(const [id,d]of Object.entries(ANCIENT_SUPPLIES).filter(([,d])=>d.kind==='boost')){
 p.materials[supplyKey(id)]=3;
 assert.equal(useAncientSupply(p,id,now),null);
 assert.equal(useAncientSupply(p,id,now+1000),null);
 assert.equal(p.boosts[id],now+1000+d.duration);
 assert.equal(p.materials[supplyKey(id)],1);
}
const a={hp:100};
for(const [kind,def]of Object.entries(BOSS_CARDS))for(const initial of [500,1000]){
 const actor={name:'test',hp:initial,maxHp:1000};p.materials[bossCardKey(kind)]=2;
 assert.equal(useBossCard(p,actor,kind,now),null);skillHealth(actor,1000,now);healBossCard(actor,1000);
 const max=Math.floor(1000*(1+def.health)),bonus=max-1000;
 assert.equal(actor.hp,initial+bonus);assert.equal(actor.maxHp,max);
 actor.hp=100;
 assert.equal(useBossCard(p,actor,kind,now+1000),null);skillHealth(actor,1000,now+1000);healBossCard(actor,1000);
 assert.equal(actor.hp,Math.min(max,100+bonus));assert.equal(actor.maxHp,max);
 const hp=actor.hp;skillHealth(actor,1000,now+2000);assert.equal(actor.hp,hp,'ticks must not heal again');
}
for(const kind of Object.keys(BOSS_CARDS)){
 p.materials[bossCardKey(kind)]=2;
 assert.equal(useBossCard(p,a,kind,now),null);
 const stats=JSON.stringify(bossFormStats(a,now));
 assert.equal(useBossCard(p,a,kind,now+1000),null);
 assert.equal(a.skillRuntime.bossForm.until,now+61000);
 assert.equal(JSON.stringify(bossFormStats(a,now+1000)),stats);
 assert.equal(p.materials[bossCardKey(kind)],0);
}
p.level=150;p.gear=[{id:'helm',key:'helmet6',affixes:[{key:'cooldown',value:.025}]}];p.gearEquipped={helmet:'helm'};
assert(Math.abs(ancientGearStats(p).cooldown-.1)<1e-9);
assert(gearDescription('helmet6').includes('8%'));
assert(gearAffixDescription(p.gear[0]).includes('2%'));
assert(!gearDescription('helmet6').includes('80%'));
console.log('PASS timed potions refresh from now and consume once; every boss card refreshes without stacking stats; equipment and affix cooldown numbers agree with effects.');
