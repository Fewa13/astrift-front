// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {ancientTarget,ANCIENT_KINDS} from '../public/ancient-rules.js';
const a={p:{name:'attacker',hp:100,x:0,y:1.7,z:50}},b={p:{name:'bystander',hp:100,x:0,y:1.7,z:50}},pet={p:{...a.p,name:'@pet:attacker'}};
for(const kind of ['chief','lord',...Object.keys(ANCIENT_KINDS).filter(k=>ANCIENT_KINDS[k].boss)]){
 const m={kind,hp:100,target:'bystander',region:0,x:0,z:50,map:'tribe'};
 assert.equal(ancientTarget(m,[a,b,pet]),undefined,kind+' stale automatic aggro cleared');
 m.contributions=[{name:'attacker',damage:1}];assert.equal(ancientTarget(m,[a,b]),a);
 m.target=pet.p.name;assert.equal(ancientTarget(m,[a,b,pet]),pet);
 assert.equal(ancientTarget(m,[b]),undefined,kind+' does not switch to innocent player');
}
assert.equal(ancientTarget({kind:'grox',hp:100,target:'',region:0,x:0,z:50},[b]),b,'ordinary mob remains aggressive');
console.log('PASS: bosses ignore bystanders, retaliate on damage, preserve summon aggro, do not transfer to innocent players; ordinary mobs unchanged.');
