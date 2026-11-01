// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {ancientPlayerLabel} from '../public/ancient-player-label.js';
import {PROFESSIONS} from '../public/ancient-skills.js';
for(const [profession,job]of Object.entries(PROFESSIONS))for(const english of [false,true]){
 const p={name:'Felix',level:150,profession,holy:true,gear:{weapon:'stoneRough'}};
 const label=ancientPlayerLabel(p,english);assert(label.includes('150'));assert(label.includes(english?'Holy '+job.en:'圣·'+job.name));assert(!label.includes('stoneRough'));
 assert.equal(ancientPlayerLabel({...p,form:'beast'},english),label);
}
assert(ancientPlayerLabel({name:'new',level:1}).includes('未选择职业'));assert(ancientPlayerLabel({name:'a',level:25,profession:'warrior',corrupted:true}).endsWith('魔化'));
console.log('PASS: all professions bilingual, Holy status, level, corruption, no weapon/transformation substitution.');
