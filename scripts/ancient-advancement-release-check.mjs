// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {build} from 'esbuild';

const module = await build({
 stdin:{contents:`
 export {ADVANCED_PROFESSIONS} from './src/ancient-advanced-professions';
 export {ADVANCEMENT_COMBAT_ROUTES} from './src/ancient-advancement-combat';
 `,resolveDir:process.cwd()},
 bundle:true,write:false,platform:'node',format:'esm',
});
const {ADVANCED_PROFESSIONS,ADVANCEMENT_COMBAT_ROUTES} = await import(
 'data:text/javascript;base64,'+Buffer.from(module.outputFiles[0].text).toString('base64')
);
const routes=Object.values(ADVANCED_PROFESSIONS).flat();
assert.equal(routes.length,26);
assert.equal(new Set(routes.map(route=>route.id)).size,routes.length);
assert.equal(routes.flatMap(route=>route.skills).length,104);
const implemented=new Set(ADVANCEMENT_COMBAT_ROUTES);
const missing=routes.filter(route=>!implemented.has(route.id)).map(route=>route.id);
assert.equal(missing.length,0,'Routes missing combat implementation: '+missing.join(', '));

const {readFileSync}=await import('node:fs');
const THREE=await import('../public/three.module.js');
const {createAdvancementFX,advancementEffectIds}=await import('../public/ancient-advancement-fx.js');
const combat=readFileSync('src/ancient-advancement-combat.ts','utf8');
const ids=new Set(advancementEffectIds);
for(const match of combat.matchAll(/\bc\.fx\('([^']+)'/g))assert(ids.has(match[1]),'Missing visual for '+match[1]);
for(const route of routes){
 const matching=advancementEffectIds.filter(id=>id.startsWith(route.id+'-'));
 assert(matching.length>=4,route.id+' is missing visual patterns');
}
for(const pressure of [false,true]){
 const scene=new THREE.Scene(),camera=new THREE.Camera();
 camera.userData.renderPressure=pressure;
 const fx=createAdvancementFX(scene,camera,()=>0);
 for(const id of ids){
  assert(fx.effect({id,x:4,z:10,radius:10,source:{x:1,y:2,z:1}},()=>0),id);
  assert(scene.children.at(-1)?.children.length>0,id);
  fx.update(250);
  scene.updateMatrixWorld();
  scene.children.at(-1).traverse(node=>assert(node.matrixWorld.elements.every(Number.isFinite),id));
  assert(scene.children.length<=(pressure?12:26));
 }
 fx.update(4000);
 assert.equal(scene.children.length,0);
}
console.log('PASS: combat route registry, effect coverage, finite scene transforms, bounded effect count and expiration.');

const {attachAdvancementRegalia,advancementLookIds}=await import('../public/ancient-advancement-model.js');
const {releaseAncientInstances}=await import('../public/ancient-model-cleanup.js');
assert.deepEqual([...advancementLookIds].sort(),routes.map(route=>route.id).sort());
const silhouettes=new Set();
for(const route of routes){
 const model=new THREE.Group(),body=new THREE.Group();
 body.name='body';model.add(body);
 assert(attachAdvancementRegalia(model,route.id));
 const group=body.getObjectByName('advancement-'+route.id);
 assert(group.children.length>0&&group.children.length<=20,route.id);
 const matrices=[];
 for(const part of group.children){
  assert(part.isInstancedMesh&&part.boundingSphere.radius>0,route.id);
  assert(part.instanceMatrix.array.every(Number.isFinite),route.id);
  for(let i=0;i<part.count;i++)matrices.push(...part.instanceMatrix.array.slice(i*16,(i+1)*16));
 }
 const signature=JSON.stringify(matrices);
 assert(!silhouettes.has(signature),'Repeated model geometry for '+route.id);
 silhouettes.add(signature);
 releaseAncientInstances(model);
}
console.log('PASS: 26 distinct regalia transforms, bounded instanced model groups and cleanup.');

const {advancementDescription}=await import('../public/ancient-advancement-descriptions.js');
for(const route of routes)for(let slot=0;slot<5;slot++){
 assert(advancementDescription(route.id,slot).trim().length>0,route.id);
 assert(advancementDescription(route.id,slot,true).trim().length>0,route.id);
}
