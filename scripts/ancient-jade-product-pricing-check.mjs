// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {jadeProductValue,makeRoughStone,stoneworkCommand,updateStoneworkAssays} from '../public/ancient-stonework.js';
for(const kind of ['bead','bangle'])for(const material of [0,1,10,100,10000])for(const purity of [.25,.5,1]){
 const fee=kind==='bead'?2:8,value=jadeProductValue(material,purity,0,fee,2,kind);
 assert(value>material+fee,'Sound jade increases combined sale proceeds after paying workmanship');
 assert(jadeProductValue(material,purity,1,fee,2,kind)<=Math.max(1,value*.11),'Real cracks still sharply devalue products');
}
assert.equal(jadeProductValue(0,0,4,2,0,'bead'),1,'Small or stone-only products cannot round to zero');
const s=Object.assign(makeRoughStone('roughMoon',4,'price-fixture'),{grade:2,variety:'imperial',weight:2.7,coverage:.8,color:1,cracks:0}),state={stones:[s],receipts:[]},p={coins:1000,materials:{}};
assert(!stoneworkCommand(p,state,'stoneCut',{id:s.id,plane:{normal:[1,0,0],constant:0},pose:[0,0,0,1]}).error);
const original=s.cut.value,gold=p.coins,pieceValue=s.cut.pieces[0].value;
assert(!stoneworkCommand(p,state,'stoneCraft',{id:s.id,piece:'0',requestId:'price-bead-1',layout:{kind:'bead',size:12,face:0,point:[0,0,0]}}).error);
const item=s.products[0];assert(item.value>=1);assert(item.value>item.materialValue+item.fee,'Sound finished jewelry appreciates relative to its consumed material');const workedLoss=Math.ceil((pieceValue-item.materialValue)*.12);assert.equal(s.cut.value+item.value+p.coins,original+gold-item.materialValue-workedLoss+item.value-item.fee,'Total proceeds also account for the requested used-stock discount');
item.value=0;delete item.pricingVersion;assert(updateStoneworkAssays(state));assert(item.value>0);const snapshot=JSON.stringify(state);assert(!updateStoneworkAssays(state));assert.equal(JSON.stringify(state),snapshot,'Migration runs once, cannot farm repricing');
console.log('PASS sound-product net appreciation, small-bead nonzero values, real crack discounts, existing-product repair and idempotent migration.');
