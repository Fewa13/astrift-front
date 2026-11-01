// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {makeRoughStone,stoneworkCommand,stoneView,assessJadeBlank,inJadeBlank} from '../public/ancient-stonework.js';
const s=Object.assign(makeRoughStone('roughMoon',4,'buddha-corners'),{grade:5,cracks:0,weight:2.7,coverage:.8}),p={coins:10000},state={stones:[s],receipts:[]};
const command=(action,data)=>stoneworkCommand(p,state,action,{id:s.id,...data});
assert(!command('stoneCut',{plane:{normal:[1,0,0],constant:0},pose:[0,0,0,1]}).error);
const layout={kind:'buddha',size:48,face:0,point:[0,0,0]},assay=assessJadeBlank(stoneView(s),s.cut.pieces[0],layout);assert(assay.valid);
const b=assay.blank,corner=b.point.map((v,i)=>v+b.u[i]*b.radius*.72+b.v[i]*b.radius*.52);
assert(Math.hypot(.72,.52)<1,'Corner lies inside the old circular exclusion zone');assert(!inJadeBlank(b,corner,.006),'Uncarved corner must not belong to Buddha');
assert(assay.volume<Math.PI*b.radius**2*b.depth*.85);assert(assay.productVolume>0&&assay.productVolume<assay.volume);
assert(!command('stoneCraft',{piece:'0',requestId:'buddha-cut',layout}).error);
const before=JSON.stringify(state);assert(command('stoneCraft',{piece:'0',requestId:'overlap-cut',layout:{kind:'bead',size:6,face:0,point:[0,0,0]}}).error);assert.equal(JSON.stringify(state),before,'Real body overlap must still fail');
assert(!command('stoneCraft',{piece:'0',requestId:'corner-bead',layout:{kind:'bead',size:6,face:0,point:corner}}).error,'A bead must fit in the unused corner');
assert.equal(s.products.length,2);assert.equal(s.cut.pieces[0].holes.length,2);console.log('PASS Buddha silhouette waste volume, unused corner inside old circle remains craftable, actual body overlap rejected, two retained products');
