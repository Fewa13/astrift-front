// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
import {build} from 'esbuild';
import {QUEST_NPCS} from '../public/ancient-quests.js';
import {LEISURE_NODES} from '../public/ancient-leisure.js';
const maps=['starfall','frostcourt','skyreach'],root=path.resolve('public'),out=path.resolve('artifacts/chapter-rebuild');await mkdir(out,{recursive:true});
for(const map of maps){const m=await import('../public/ancient-'+map+'.js'),points=[...m[map.toUpperCase()+'_SPAWNS'],...Object.values(QUEST_NPCS).filter(v=>v.map===map),...LEISURE_NODES.filter(v=>v.map===map),{x:0,z:map==='starfall'?378:map==='frostcourt'?360:352}];
 for(const v of points){assert(!m[map+'Blocked'](v.x,v.z,1.8),map+' blocked '+JSON.stringify(v));assert(m[map+'Path'](0,10,v.x,v.z).length,map+' no route '+JSON.stringify(v));}
 console.log('PASS shared layout, spawns, NPCs, gathering, final arena and routes:',map,points.length);
}
// An already-running world must not leave saved actors trapped in new walls.
{
 const db=new DatabaseSync(':memory:'),messages=[],module={exports:{}},actor={name:'fixture',map:'frostcourt',x:0,z:130,y:7.7,hp:123,maxHp:500},peer={deserializeAttachment:()=>structuredClone(actor),serializeAttachment:a=>Object.assign(actor,a),send:m=>messages.push(JSON.parse(m))};
 const ctx={storage:{sql:{exec(q,...args){return {toArray:()=>db.prepare(q).all(...args)}}},transactionSync(fn){db.exec('BEGIN');try{const r=fn();db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}},setAlarm:async()=>{}},getWebSockets:()=>[peer]};
 // Run DDL immediately, matching Durable Object SQL rather than lazy cursors.
 ctx.storage.sql.exec=(q,...args)=>{const rows=db.prepare(q).all(...args);return {toArray:()=>rows};};
 const bundle=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']});vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,Date,Math,crypto,structuredClone,URL,AbortController,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
 const server=new module.exports.AncientWorld(ctx,{}),world=server.world('frostcourt'),m=world.monsters[0];m.x=0;m.z=130;m.homeX=0;m.homeZ=130;m.hp=321;server.persist(world);
 const fixed=server.world('frostcourt'),logic=await import('../public/ancient-frostcourt.js');assert(!logic.frostcourtBlocked(fixed.monsters[0].x,fixed.monsters[0].z,1.8));assert.equal(fixed.monsters[0].hp,321);assert(!logic.frostcourtBlocked(actor.x,actor.z,.6));assert.equal(actor.hp,123);assert(messages.some(m=>m.type==='mapResize'));
 server.world('frostcourt');assert.equal(messages.filter(m=>m.type==='mapResize').length,1);console.log('PASS one-time saved-world recovery; health preserved, no repeated teleport.');
}
const {chromium}=createRequire('/Users/jingfeng/Documents/astrift-promo/record-worlds-v7.mjs')('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
try{const page=await browser.newPage({viewport:{width:1200,height:760}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://localhost:9187/**',async r=>{const url=new URL(r.request().url());if(url.pathname==='/')return r.fulfill({contentType:'text/html',body:'<!doctype html><style>body{margin:0;background:#172a34}</style>'});const file=path.resolve(root,'.'+url.pathname);if(!file.startsWith(root+path.sep))return r.abort();try{await r.fulfill({contentType:file.endsWith('.js')?'text/javascript':'text/plain',body:await readFile(file)})}catch{await r.abort()}});
 await page.goto('http://localhost:9187/');
 for(const map of maps){const report=await page.evaluate(async map=>{
  const T=await import('/three.module.js'),mod=await import('/ancient-'+map+'-scene.js'),logic=await import('/ancient-'+map+'.js');
  window.renderer?.dispose();document.querySelector('canvas')?.remove();const renderer=new T.WebGLRenderer({antialias:true});renderer.setSize(1200,760);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;document.body.append(renderer.domElement);
  const scene=new T.Scene();scene.background=new T.Color(map==='starfall'?0x173d4b:map==='frostcourt'?0x70828b:0x8aaec7);scene.fog=new T.Fog(scene.background,90,240);scene.add(new T.HemisphereLight(0xd9efff,0x36404a,2.2));const light=new T.DirectionalLight(0xffe3bd,2.7);light.position.set(-35,70,20);scene.add(light);
  const key='build'+map[0].toUpperCase()+map.slice(1)+'Scene',world=mod[key](scene),camera=new T.PerspectiveCamera(66,1200/760,.1,600);
  const render=(z,elevated=false)=>{camera.position.set(elevated?31:0,logic[map+'Height'](0,z)+(elevated?22:2.1),z);camera.lookAt(0,logic[map+'Height'](0,z+45)+(elevated?3:7),z+45);world.update(0,camera);renderer.render(scene,camera);return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries};};
  const first=render(16),groundChecks=[];
  for(const z of [16,93,202,300,352]){if(logic[map+'Blocked'](0,z,.8))continue;const y=logic[map+'Surface'](0,z),ray=new T.Raycaster(new T.Vector3(0,y+3,z),new T.Vector3(0,-1,0),0,8),hit=ray.intersectObject(world.world,true).find(h=>!h.object.material.transparent);if(!hit)throw Error(map+' missing floor at '+z);if(Math.abs(hit.point.y-y)>.12)throw Error(map+' floor/collision mismatch at '+z+': '+hit.point.y+' vs '+y);groundChecks.push(z);}
  if(map==='frostcourt'){const {frostcourtWidth}=await import('/ancient-chapter-layouts.js');world.world.updateMatrixWorld(true);let checked=0;for(let z=8;z<380;z+=2)for(const side of [-1,1]){const x=side*(frostcourtWidth(z)-.61);if(logic.frostcourtBlocked(x,z,.6))continue;const ray=new T.Raycaster(new T.Vector3(x,logic.frostcourtHeight(x,z)+1.7,z),new T.Vector3(side,0,0),0,.58);const hits=ray.intersectObject(world.world,true).filter(h=>!h.object.material.transparent);if(hits.length)throw Error('Frostcourt wall protrudes into walkable camera at '+x+','+z+' '+JSON.stringify(hits.slice(0,2).map(h=>({p:h.point.toArray(),name:h.object.name,mat:h.object.material.color.getHexString()}))));checked++;}if(checked<200)throw Error('Insufficient rim samples');}
  window.chapterPreview={render,world,renderer,scene,camera};window.renderer=renderer;return {name:world.world.name,...first,groundChecks};
 },map);assert(report.name.startsWith('rebuilt-'));assert(report.calls<160,JSON.stringify(report));
 console.log('PASS browser render:',map,report);
 for(const [label,z,high]of [['arrival',16,false],['middle',map==='starfall'?158:map==='frostcourt'?100:93,false],['arena',map==='starfall'?330:map==='frostcourt'?308:300,true]]){await page.evaluate(({z,high})=>window.chapterPreview.render(z,high),{z,high});await page.screenshot({path:path.join(out,map+'-'+label+'.png')});}
 }
 assert.deepEqual(errors,[]);console.log('PASS no browser errors; screenshots:',out);
}finally{await browser.close();}
