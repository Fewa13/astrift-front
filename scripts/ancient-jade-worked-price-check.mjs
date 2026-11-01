// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {makeRoughStone,stoneworkCommand} from '../public/ancient-stonework.js';
const s=Object.assign(makeRoughStone('roughMoon',4,'worked-price'),{grade:4,cracks:0,weight:2.7,coverage:.8}),p={coins:10000},state={stones:[s],receipts:[]};
const cmd=(action,data)=>stoneworkCommand(p,state,action,{id:s.id,...data});
assert(!cmd('stoneCut',{plane:{normal:[1,0,0],constant:0},pose:[0,0,0,1]}).error);
const sibling=structuredClone(s.cut.pieces[1]);let piece=s.cut.pieces[0],before=piece.value;
assert(!cmd('stoneCraft',{piece:'0',requestId:'worked-first',layout:{kind:'bead',size:6,face:0,point:[0,0,0]}}).error);
const product=s.products[0],remaining=before-product.materialValue;
assert.equal(piece.value,remaining-Math.ceil(remaining*.12));assert(piece.workedDiscount);assert.equal(piece.discount,.88);assert.deepEqual(s.cut.pieces[1],sibling);assert.equal(s.cut.value,s.cut.pieces.reduce((n,p)=>n+p.value,0));
const saved=JSON.stringify({state,p});assert(!cmd('stoneCraft',{piece:'0',requestId:'worked-first',layout:{kind:'bead',size:6,face:0,point:[0,0,0]}}).error);assert.equal(JSON.stringify({state,p}),saved);
before=piece.value;assert(!cmd('stoneCraft',{piece:'0',requestId:'worked-second',layout:{kind:'bead',size:6,face:0,point:[0,.2,0]}}).error);assert.equal(piece.value,before-s.products[1].materialValue,'The 12% discount cannot repeat for every bead');assert.equal(s.products[0].value,product.value);
assert(!cmd('stoneRecut',{piece:'0',plane:{normal:[0,1,0],constant:0},pose:[0,0,0,1]}).error);assert(s.cut.pieces.filter(p=>p.id.startsWith('0')).every(p=>p.workedDiscount),'Recutting must preserve the paid discount');
console.log('PASS first-use 12% remainder discount, material deduction, untouched sibling/products, retry safety, no repeated bead penalty, recut inheritance');
