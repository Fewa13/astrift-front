// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {JADE_VARIETIES,jadeUnitPrice,jadeVariety,jadePigment,makeRoughStone,stoneworkCommand,stoneView,updateStoneworkAssays} from '../public/ancient-stonework.js';
assert.equal(JADE_VARIETIES.length,40);assert.equal(new Set(JADE_VARIETIES.map(v=>v.id)).size,40);
const state={stones:[],receipts:[]},p={coins:100000,materials:{roughStone:1}},signatures=new Set();
for(const v of JADE_VARIETIES){
 const s=makeRoughStone('roughStone',4,v.id);Object.assign(s,{variety:v.id,grade:3,lit:true});state.stones.push(s);
 assert(!('variety' in stoneView(s))&&!('jade' in stoneView(s)),'Uncut contents stay hidden');
 const raw=JSON.stringify(s),probe=stoneworkCommand(p,state,'stoneProbe',{id:s.id,point:[0,0,.95]}).probe;
 assert.equal(JSON.stringify(s),raw,'Light does not reroll the variety');assert(probe.tint?.every(Number.isFinite));
 assert(probe.patch.pixels.every(n=>Number.isInteger(n)&&n>=0&&n<=255));
 signatures.add(JSON.stringify(Array.from({length:20},(_,i)=>jadePigment(v.id,[i*.12-.9,Math.sin(i)*.5,0],1.3))));
 assert(!stoneworkCommand(p,state,'stoneCut',{id:s.id,plane:{normal:[1,0,0],constant:0},pose:[0,0,0,1]}).error);
 assert.equal(state.collection[v.id].count,1);assert.equal(state.collection[v.id].best,s.cut.value);assert.equal(stoneView(s).variety,v.id);assert.equal(stoneView(s).jade.variety,v.id);
 const initial=s.cut.value,initialWeight=s.cut.weight,quotePerKg=jadeUnitPrice(s.grade,s.color,s.variety)*(s.cut.pricingScale??1);
 assert.equal(initial,s.cut.pieces.reduce((n,p)=>n+Math.floor(p.jadeWeight*quotePerKg),0),'Variety participates in authoritative appraisal');
 const saved=JSON.stringify(state.collection);stoneworkCommand(p,state,'stoneCut',{id:s.id});assert.equal(JSON.stringify(state.collection),saved,'Retries do not duplicate discoveries');
 const copy=JSON.parse(JSON.stringify(s));assert(!updateStoneworkAssays({stones:[copy],receipts:[]}));assert.equal(copy.cut.value,initial,'No reroll or repricing on reload');
 const sibling=structuredClone(s.cut.pieces[1]);assert(!stoneworkCommand(p,state,'stoneRecut',{id:s.id,piece:'0',plane:{normal:[0,1,0],constant:0},pose:[0,0,0,1]}).error);assert(s.cut.value<=initial);assert(s.cut.weight<=initialWeight);assert.deepEqual(s.cut.pieces.find(p=>p.id==='1'),sibling);
 const balance=p.coins,quote=s.cut.value;assert(!stoneworkCommand(p,state,'stoneSell',{id:s.id}).error);assert.equal(p.coins,balance+quote);assert.equal(state.collection[v.id].count,1,'Discovery survives sale');
}
assert.equal(signatures.size,40,'Every variety has a distinct color/pattern field');
const old=makeRoughStone('roughStone',4,'old');delete old.variety;state.stones.push(old);stoneworkCommand(p,state,'stoneCut',{id:'old'});const oldSnapshot=JSON.stringify(old);assert(!updateStoneworkAssays(state));assert.equal(JSON.stringify(old),oldSnapshot,'Legacy stones retain their original field and price');assert(!jadeVariety(old.variety));
const found=new Set();for(let i=0;i<6000;i++){const s=makeRoughStone('roughStone',i,'distribution');if(s.variety)found.add(s.variety);}assert.equal(found.size,40,'All varieties can actually roll');
console.log('PASS 40 reachable, distinct varieties; hidden raw contents, colored probe patches, appraisal factors, retry-safe permanent discoveries, recut/sale preservation, and unchanged legacy stones.');
