// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {makeRoughStone,stoneworkCommand,updateStoneworkAssays,jadeUnitPrice,JADE_PRICE_CAP,stoneView} from '../public/ancient-stonework.js';
import {stoneReport} from '../public/ancient-stone-report.js';
const s=Object.assign(makeRoughStone('roughMoon',4,'top'),{grade:5,variety:'imperial',weight:2.7,coverage:.8,color:1,cracks:0}),state={stones:[s],receipts:[]},profile={coins:1000,materials:{}};
assert(!stoneworkCommand(profile,state,'stoneCut',{id:s.id,plane:{normal:[1,0,0],constant:0},pose:[0,0,0,1]}).error);
assert(s.cut.value>=JADE_PRICE_CAP-2,'Actual geometry can reach the advertised ceiling');assert(s.cut.value<=JADE_PRICE_CAP);
const scale=s.cut.pricingScale,quote=s.cut.value,sibling=structuredClone(s.cut.pieces[1]);
assert(!stoneworkCommand(profile,state,'stoneRecut',{id:s.id,piece:'0',plane:{normal:[0,1,0],constant:0},pose:[0,0,0,1]}).error);
assert(s.cut.value<=quote);assert.equal(s.cut.pricingScale,scale);assert.deepEqual(s.cut.pieces.find(p=>p.id==='1'),sibling);
for(const p of s.cut.pieces)assert.equal(p.value,Math.floor(p.jadeWeight*jadeUnitPrice(5,1,'imperial')*scale*p.discount));
const geometry=JSON.stringify(s.cut.pieces.map(({value,...p})=>p)),cost=s.cost;delete s.cut.pricingVersion;s.cut.value=1;
assert(updateStoneworkAssays(state));assert.equal(JSON.stringify(s.cut.pieces.map(({value,...p})=>p)),geometry);assert.equal(s.cost,cost);assert(!updateStoneworkAssays(state));
const report=stoneReport(stoneView(s));assert.equal(report.price,s.cut.value);assert.equal(report.net,report.price-cost);assert.equal(report.pieces.length,3);
const expected=profile.coins+s.cut.value;assert(!stoneworkCommand(profile,state,'stoneSell',{id:s.id}).error);assert.equal(profile.coins,expected);assert(stoneworkCommand(profile,state,'stoneSell',{id:s.id}).error);
assert.equal(jadeUnitPrice(1,1),50);assert(jadeUnitPrice(5,1,'imperial')>jadeUnitPrice(5,.8,'imperial'));
console.log('PASS attainable 6M ceiling, inherited recut cap, exact quotes, one-time price migration without geometry/cost changes, report accounting and retry-safe sale.');
