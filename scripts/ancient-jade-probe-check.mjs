// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {makeRoughStone,stoneworkCommand,stoneView} from '../public/ancient-stonework.js';
const s=Object.assign(makeRoughStone('roughMoon',4,'probe-check'),{grade:5,variety:'spring',cracks:.95,lit:true}),state={stones:[s],receipts:[]},profile={coins:1000,materials:{}};
const before=JSON.stringify({state,profile});let found=0;
for(let y=-.6;y<=.6;y+=.2)for(let x=-.8;x<=.8;x+=.2){
 const data={id:s.id,point:[x,y,.85]},a=stoneworkCommand(profile,state,'stoneProbe',data),b=stoneworkCommand(profile,state,'stoneProbe',data);
 assert.deepEqual(a,b,'Same point gives immutable shadows');assert.equal(a.probe.patch.size,17);
 const mask=a.probe.patch.crackMask;if(mask){found++;assert.equal(mask.size,49);assert.equal(mask.pixels.length,2401);assert(mask.pixels.every(n=>Number.isInteger(n)&&n>=0&&n<=255));assert(Math.max(...mask.pixels)>12);}
}
assert(found>0,'Actual cracks produce visible local masks');assert.equal(JSON.stringify({state,profile}),before,'Hover does not mutate inventory or appraisal');
s.cracks=0;const clean=stoneworkCommand(profile,state,'stoneProbe',{id:s.id,point:[0,0,.85]});assert(!clean.probe.patch.crackMask);assert(!clean.probe.cracked);assert(!stoneView(s).jade,'Raw interior remains private');
console.log('PASS deterministic real crack masks, bounded local payload, crack-free clearing, hidden interior and read-only probing.');
