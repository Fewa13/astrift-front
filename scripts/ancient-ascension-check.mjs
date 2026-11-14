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
vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,Date:class extends Date{static now(){return now}},crypto,Math,AbortController,structuredClone,Response:TestResponse,WebSocketPair:TestPair,URL,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
const server=new module.exports.AncientWorld(ctx,{}),cmd=(n,a,d={})=>server.command(n,a,d);
function add(name,level=20){const p=server.read(name);p.level=level;server.save(name,p);let actor={name,map:'tribe',x:0,y:1.7,z:50,hp:50000,maxHp:50000,seen:now,weapon:p.weapons[0],skills:{},lastShot:0,lastMove:now,moveCredit:2,deadAt:0};messages.set(name,[]);const ws={deserializeAttachment:()=>structuredClone(actor),serializeAttachment:a=>actor=structuredClone(a),send:s=>messages.get(name).push(JSON.parse(s)),close(){this.closed=true}};sockets.push(ws);return ws}

const {ASCENSION_SKILLS,ascensionProgress,ascensionKill,ascensionAttempts,isHoly}=await import('../public/ancient-ascension.js');
const ws=add('ascender',79);let p=server.read('ascender');p.profession='lightning';p.skills=Object.fromEntries(ASCENSION_SKILLS.lightning.map(id=>[id,5]));server.save('ascender',p);
assert.equal((await cmd('ascender','ascensionStart')).ok,false,'level gate');p.level=80;p.skills.storm=4;server.save('ascender',p);assert.equal((await cmd('ascender','ascensionStart')).ok,false,'every skill gate');p.skills.storm=5;server.save('ascender',p);
assert.equal((await cmd('ascender','dungeonCreate',{tier:'ascensionTrial'})).ok,false,'cannot bypass daily gate');
assert.equal((await cmd('ascender','ascensionFinalStart')).ok,false,'cannot skip permit/sidequest');
assert.equal((await cmd('ascender','ascensionStart')).ok,true);let run=server.dungeons().get('ascender');assert.equal(run.members.length,1);assert.equal(ascensionAttempts(server.read('ascender'),now),1);assert.equal((await cmd('ascender','ascensionStart')).ok,false);assert.equal(ascensionAttempts(server.read('ascender'),now),1,'duplicate request cannot charge again');
assert.equal((await cmd('ascender','chooseProfession',{job:'warrior'})).ok,false,'cannot swap inside trial');
let rebuilt=new module.exports.AncientWorld(ctx,{});assert.equal(rebuilt.dungeons().get('ascender').id,run.id,'run survives reconstruction');assert.equal((await rebuilt.command('ascender','ticket',{map:run.map})).ok,true,'can resume same run');
run.status='failed';server.dungeons().save(run);assert(!ascensionProgress(server.read('ascender'))?.permit);assert.equal((await cmd('ascender','ascensionStart')).ok,true);run=server.dungeons().get('ascender');run.status='failed';server.dungeons().save(run);assert.equal((await cmd('ascender','ascensionStart')).ok,false,'two daily attempts total');
now+=86400000;assert.equal((await cmd('ascender','ascensionStart')).ok,true,'daily UTC reset');run=server.dungeons().get('ascender');run.joined=['ascender'];run.stage=2;server.dungeons().save(run);server.completeDungeon(run);p=server.read('ascender');assert(ascensionProgress(p).permit);assert(!isHoly(p));assert.equal(p.materials.core||0,0,'no regular dungeon reward');server.completeDungeon(run);assert.equal(ascensionProgress(server.read('ascender')).step,0,'idempotent');
assert.equal((await cmd('ascender','ascensionFinalStart')).ok,false);for(let i=0;i<20;i++)ascensionKill(p,'city','city_husk',75);assert.equal(ascensionProgress(p).step,1);ascensionKill(p,'tribe','lord',30);assert.equal(ascensionProgress(p).count,0);for(let i=0;i<2;i++)ascensionKill(p,'forest','crystal_fire',65);assert.equal(ascensionProgress(p).step,2);server.save('ascender',p);
assert.equal((await cmd('ascender','ascensionFinalStart')).ok,true);assert.equal(ascensionAttempts(server.read('ascender'),now),1,'final rite has no daily charge');run=server.dungeons().get('ascender');run.joined=['ascender'];run.stage=2;server.dungeons().save(run);server.completeDungeon(run);p=server.read('ascender');assert(isHoly(p));assert.equal(p.skills.chain,5);server.completeDungeon(run);assert.equal((await cmd('ascender','ascensionStart')).ok,false);
p.materials['supply:transfer']=2;server.save('ascender',p);assert.equal((await cmd('ascender','chooseProfession',{job:'warrior'})).ok,true);assert(!isHoly(server.read('ascender')));assert.equal((await cmd('ascender','chooseProfession',{job:'lightning'})).ok,true);assert(isHoly(server.read('ascender')),'holy status survives switching professions');
db.close();console.log('PASS: authoritative level/skills gates, daily shared limit, atomic attempts, solo run persistence/resume, failed trial, permit before sidequest, unlimited final rite, idempotent permanent ascension and profession switching.');
