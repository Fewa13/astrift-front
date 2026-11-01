// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
import {build} from 'esbuild';
import {DUNGEON_TIERS,dungeonBlocked,dungeonPath,setDungeonGeometry,dungeonHealthScale,dungeonDamageScale} from '../public/ancient-dungeon.js';
import {cityWorldId} from '../public/ancient-city.js';
import {ANCIENT_FORGE,GEAR} from '../public/ancient-gear.js';
import {ancientMonsterXP,lineClear} from '../public/ancient-rules.js';
const compiled=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']});
let now=100000;const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows,one:()=>{assert.equal(rows.length,1);return rows[0]}}}},sockets=[],messages=new Map(),module={exports:{}};
const ctx={getWebSockets:()=>sockets.filter(ws=>!ws.closed),storage:{sql,setAlarm:async()=>{},transactionSync(fn){db.exec('BEGIN');try{const result=fn();db.exec('COMMIT');return result}catch(e){db.exec('ROLLBACK');throw e}}}};
class TestResponse{constructor(body,options){this.status=options.status;this.webSocket=options.webSocket}static json(body,options){return Response.json(body,options)}}
class TestPair{constructor(){this[0]={};let actor;this[1]={deserializeAttachment:()=>structuredClone(actor),serializeAttachment:a=>actor=structuredClone(a),send:s=>messages.get(actor.name).push(JSON.parse(s)),close(){this.closed=true}}}}
ctx.acceptWebSocket=ws=>sockets.push(ws);
vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,Date:class extends Date{static now(){return now}},crypto,Math,Response:TestResponse,WebSocketPair:TestPair,URL,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
const server=new module.exports.AncientWorld(ctx,{}),cmd=(n,a,d={})=>server.command(n,a,d);
function add(name,level=20){const p=server.read(name);p.level=level;server.save(name,p);let actor={name,map:'tribe',x:0,y:1.7,z:50,hp:50000,maxHp:50000,seen:now,weapon:p.weapons[0],skills:{},lastShot:0,lastMove:now,moveCredit:2,deadAt:0};messages.set(name,[]);const ws={deserializeAttachment:()=>structuredClone(actor),serializeAttachment:a=>actor=structuredClone(a),send:s=>messages.get(name).push(JSON.parse(s)),close(){this.closed=true}};sockets.push(ws);return ws}


const {ANCIENT_FX_IDS,createAncientMagicFX}=await import('../public/ancient-spell-fx.js');
const THREE=await import('../public/three.module.js');
const {previewChainActors,resolvePreviewActor}=await import('../public/ancient-skill-preview.js');
const caster=add('caster',80),viewer=add('viewer',80),other=add('other',80);let a=caster.deserializeAttachment();Object.assign(a,{holy:true,x:-2,y:1.7,z:0});caster.serializeAttachment(a);const outsider=other.deserializeAttachment();outsider.map='forest';other.serializeAttachment(outsider);
for(const holy of [false,true])for(const id of ANCIENT_FX_IDS){a.holy=holy;const before=messages.get('other').length,context=server.skillContext(caster,a,[],'tribe');context.fx(id,2,0,6,id==='chain'?{target:'m0',links:[{target:'m0',x:2,y:1.2,z:0,height:1.2},{target:'m1',x:4,y:1.2,z:-3,height:1.2}]}:undefined);
const own=messages.get('caster').at(-1),remote=messages.get('viewer').at(-1);assert.deepEqual(own,remote,id+' same authoritative event for caster/viewer');assert.equal(messages.get('other').length,before,'map isolation');assert.deepEqual(own.source,{x:-2,y:1.45,z:0});assert.equal(own.holy,holy);
const geometries=[];for(const packet of [own,remote]){const scene=new THREE.Scene(),fx=createAncientMagicFX(scene,()=>undefined);fx.effect(packet,()=>0);fx.update(80,.08);geometries.push(scene.children[0].children.map(m=>m.isInstancedMesh?Array.from(m.instanceMatrix.array):[m.position.toArray(),m.rotation.toArray(),m.scale.toArray()]));fx.clear()}assert.deepEqual(geometries[0],geometries[1],id+' identical rendered poses');}
const targets=previewChainActors();assert.equal(resolvePreviewActor('@monster:missing',targets),undefined);assert.notDeepEqual(resolvePreviewActor('preview',targets),resolvePreviewActor('@monster:preview-0',targets));
for(const holy of [false,true]){const scene=new THREE.Scene(),fx=createAncientMagicFX(scene,n=>resolvePreviewActor(n,targets));fx.effect({id:'chain',x:2,z:0,owner:'preview',source:resolvePreviewActor('preview',targets),holy,links:targets.map(t=>({...t,target:t.id}))},()=>0);fx.update(80,.08);const batches=scene.children[0].children.filter(m=>m.isInstancedMesh&&m.geometry.type==='CylinderGeometry'),path=batches[holy?1:0],matrix=new THREE.Matrix4(),pos=new THREE.Vector3(),rot=new THREE.Quaternion(),scale=new THREE.Vector3();let minX=Infinity,maxX=-Infinity;for(let i=0;i<Math.min(path.count,holy?8:10);i++){path.getMatrixAt(i,matrix);matrix.decompose(pos,rot,scale);if(scale.y>.001){minX=Math.min(minX,pos.x);maxX=Math.max(maxX,pos.x)}}assert(maxX-minX>2,holy?'holy caster-to-target beam':'normal caster-to-target beam');fx.clear()}
// Player movement must reach peers without waiting for the world alarm.
let moving=caster.deserializeAttachment();Object.assign(moving,{tribeLayout:2,x:0,y:1.7,z:10,yaw:0,lastMove:now,moveCredit:2,moveSeq:0});caster.serializeAttachment(moving);
const peerBefore=messages.get('viewer').length,otherBefore=messages.get('other').length;
await server.webSocketMessage(caster,JSON.stringify({type:'move',seq:1,x:.3,y:1.7,z:10,yaw:.2}));
assert.equal(messages.get('viewer').length,peerBefore+1);assert.equal(messages.get('other').length,otherBefore);
assert.equal(messages.get('viewer').at(-1).type,'playerMove');assert.equal(messages.get('viewer').at(-1).x,.3);
await server.webSocketMessage(caster,JSON.stringify({type:'move',seq:2,x:9999,y:1.7,z:10,yaw:.2}));
assert.equal(messages.get('viewer').at(-1).x,.3,'invalid teleport never relayed');
db.close();console.log('PASS: 48 FX parity; separate preview chain endpoints; immediate player relay, map isolation and rejected teleport.');
