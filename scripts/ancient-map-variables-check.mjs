// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import {build} from 'esbuild';
const bundle=await build({stdin:{contents:"export * from './src/ancient-map-script.ts';export * from './src/ancient-map-runtime.ts';",resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node'}),{CommunityMapRuntime,compileMapScript}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows,one:()=>rows[0]}}};let r=new CommunityMapRuntime(sql);const p={name:'alice',x:0,y:1.7,z:0,hp:10,maxHp:100,connectionId:'one'},code=`item coin "铜币" "Coin"
when join
 let session 1
 add visits 1
 save explicit $visits
end
when kill any
 add session 1
 add total 1
end
when npc show
 if session == 2
  give coin 2
 end
 if total == 2
  give coin 3
 end
end`,map={id:1,name:'One',revision:1,code};
r.enter(1,p.name,p.connectionId,false);r.heartbeat(map,p,()=>{});r.execute(map,p,'kill','grox',()=>{});r=new CommunityMapRuntime(sql);p.connectionId='reconnected';r.enter(1,p.name,p.connectionId,true);r.heartbeat(map,p,()=>{});r.execute(map,p,'npc','show',()=>{});assert.equal(r.bag(map,p.name).items[0].quantity,2,'normal variable survives reconnect AND server restart without reinitializing join');
r.leave(p.name,'one');r.execute(map,p,'npc','show',()=>{});assert.equal(r.bag(map,p.name).items[0].quantity,4,'old socket leave cannot clear a new connection');r.leave(p.name,p.connectionId);r.enter(1,p.name,'new-visit',false);p.connectionId='new-visit';r.heartbeat(map,p,()=>{});r.execute(map,p,'npc','show',()=>{});assert.equal(r.bag(map,p.name).items[0].quantity,4,'normal variable reset after actual leave');r.execute(map,p,'kill','grox',()=>{});r.execute(map,p,'npc','show',()=>{});assert.equal(r.bag(map,p.name).items[0].quantity,9,'saved total remains across visits');
const data=JSON.parse(sql.exec('SELECT data FROM community_player_items WHERE map=? AND name=?',1,'alice').one().data);assert.equal(data.vars.explicit,2);assert.equal(data.vars.visits,2);assert.equal(data.temp.session,2);r.enter(2,p.name,'other-map',false);const old=JSON.parse(sql.exec('SELECT data FROM community_player_items WHERE map=? AND name=?',1,'alice').one().data);assert.deepEqual(old.temp,{});assert.equal(old.vars.total,2);assert.equal(r.bag({...map,id:2},p.name).items.length,0);assert.equal(r.bag(map,'bob').items.length,0);
assert.throws(()=>compileMapScript('when join\nlet constructor 1\nend'));console.log('PASS ordinary variables survive reconnect/server recreation, reset only on leave/new visit/map change, saved variables persist, stale leaves ignored, player/map isolation and legacy set/add compatibility.');
