// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {WEAPON_DESIGNS} from '../public/ancient-weapon-designs.js';
import {createAncientWeaponModel,releaseAncientWeaponModel} from '../public/ancient-weapon-models.js';
import {GEAR} from '../public/ancient-gear.js';
const keys=Object.keys(GEAR).filter(k=>GEAR[k].slot==='weapon');
assert.equal(keys.length,53);assert.deepEqual(new Set(keys),new Set(Object.keys(WEAPON_DESIGNS)));
const fingerprints=new Set(),ids=new Set();let max=0;
for(const key of keys){const a=createAncientWeaponModel(key),b=createAncientWeaponModel(key);assert(a.children.length>=2&&a.children.length<=3);assert(!ids.has(a.userData.designId));ids.add(a.userData.designId);let vertices=0;const hash=createHash('sha256');for(let i=0;i<a.children.length;i++){const mesh=a.children[i],g=mesh.geometry;assert.equal(g,b.children[i].geometry);assert.equal(mesh.material,b.children[i].material);for(const attr of Object.values(g.attributes))assert(attr.array.every(Number.isFinite),key);vertices+=g.attributes.position.count;hash.update(new Uint8Array(g.attributes.position.array.buffer));assert(g.boundingSphere.radius>0&&g.boundingSphere.radius<2,key);}assert(vertices<10000,key);max=Math.max(max,vertices);const fp=hash.digest('hex');assert(!fingerprints.has(fp),key);fingerprints.add(fp);releaseAncientWeaponModel(a);for(let i=0;i<30;i++){const c=createAncientWeaponModel(key);assert.equal(c.children[0].geometry,b.children[0].geometry);releaseAncientWeaponModel(c);}}
console.log(`PASS: ${keys.length} distinct designs and geometry, finite attributes, shared resources, <=3 batches; max ${max} vertices.`);
