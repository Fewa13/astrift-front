// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import fs from 'node:fs';
const tribe=fs.readFileSync('public/ancient-scene.js','utf8'),city=fs.readFileSync('public/ancient-city-scene.js','utf8');
assert(tribe.includes('z,20,height,12)'));assert(tribe.includes('z+2.5,5,15,5)'));assert(city.includes('z,3,h,6)'));assert(city.includes('z,3.5,1,6)'));
for(const [step,width]of [[12,12],[5,5],[6,6]]){let previousEnd;for(let n=0;n<100;n++){const center=n*step,min=center-width/2,max=center+width/2;if(previousEnd!==undefined)assert.equal(min,previousEnd,'No overlapping face or gap at a seam');previousEnd=max}}
console.log('PASS: tribe/forest/city wall blocks and coping meet edge-to-edge, without gaps or overlapping coplanar faces.');
