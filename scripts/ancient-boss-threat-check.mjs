// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {ancientMonsterDamage,newAncientProfile} from '../public/ancient-rules.js';
import {ancientBaseHealth,ancientProfileHealth,ancientGearStats} from '../public/ancient-gear.js';
import {ancientBossHP} from '../public/ancient-boss-stats.js';
const cases=[['chief',25,.18,.12],['lord',30,.32,.16],['rootwarden',45,.24,.14],...['metal','wood','water','fire'].map(e=>['crystal_'+e,65,.34,.17]),['crystal_earth',70,.38,.19],['oathknight',88,.29,.17],['emptyking',100,.4,.2],['blight_lord',120,.4,.2],['immaculate_judge',150,.4,.2],['starbound_heart',180,.4,.2],['furnace_regent',200,.28,.16],['frost_crowned',220,.4,.2],['thunder_warden',240,.28,.16],['sky_sovereign',260,.4,.2]];
for(const [kind,level,coefficient,old]of cases){const value=ancientMonsterDamage(kind,level),base=ancientBaseHealth(level);assert(Math.abs(value-base*coefficient)<=1,kind);assert(value>base*old*1.49,kind);assert(value<base*.401,kind+' base must not one-shot a bare same-level player');assert(ancientMonsterDamage(kind,level+1)>value,kind+' level progression')}
for(const kind of ['grox','hunter','mossling','city_husk','blight_beast','sanctum_sentinel','drowned_scribe','ember_mason','storm_weaver'])assert(ancientMonsterDamage(kind,80)<ancientBaseHealth(80)*.16,kind+' ordinary attacks unchanged');
for(const [level,boss,bossLevel,q]of [[20,'lord',30,2],[50,'crystal_fire',65,4],[80,'emptyking',100,5],[150,'starbound_heart',180,7]]){
 const p=newAncientProfile();p.level=level;p.gear=['helmet','armor','wings'].map(slot=>({id:slot,key:slot+q,affixes:[]}));p.gearEquipped=Object.fromEntries(p.gear.map(g=>[g.id,g.id]));p.collections=[{id:'w',kind:'bangle',quality:3,value:10000},{id:'c',kind:'buddha',quality:3,value:10000}];p.jadeEquipped={wrist:'w',chest:'c'};
 const hp=ancientProfileHealth(p),damage=Math.floor(ancientMonsterDamage(boss,bossLevel)*(1-ancientGearStats(p).reduction)),fraction=damage/hp;assert(fraction>.17&&fraction<1,boss+' overlevel hit should threaten an equipped player without unavoidable one-shot');
}
console.log('PASS: every boss/elite attack coefficient and level progression; geared cross-level encounters retain dangerous but survivable hits; ordinary monsters unchanged.');
