// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import * as THREE from '../public/three.module.js';
import {PROFESSIONS,SKILLS,ensureBasicSkills,skillDescription,skillRadius,skillDrops} from '../public/ancient-skills.js';
import {newAncientProfile} from '../public/ancient-rules.js';
import {ANCIENT_SUPPLIES,chooseAncientProfession,useAncientSupply} from '../public/ancient-commerce.js';
import {ASCENSION_SKILLS,ascensionEligible,holySkillDetails} from '../public/ancient-ascension.js';
import {createProfessionPlayer} from '../public/ancient-profession-models.js';
import {attachHolyRegalia} from '../public/ancient-holy-model.js';
import {createAncientMagicFX} from '../public/ancient-spell-fx.js';
const output=await build({entryPoints:['src/ancient-skill-combat.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {castAncientSkill,tickAncientSkills}=await import('data:text/javascript;base64,'+Buffer.from(output.outputFiles[0].text).toString('base64'));
const jobs=['shadowblade','stonewright'],dir=[0,-.15,Math.sqrt(1-.15**2)];
function profile(job,level=80,n=3,holy=false){const p=newAncientProfile();p.level=level;p.profession=job;p.skills=Object.fromEntries(PROFESSIONS[job].skills.map(id=>[id,n]));if(holy)p.ascension={day:'2026-10-14',attempts:0,jobs:{[job]:{holy:true,permit:true,step:3,count:0}}};return p;}
function fixture(job,id,level=80,n=3,holy=false){const p=profile(job,level,n,holy),a={name:'qa',x:0,y:1.7,z:50,hp:1e8,maxHp:1e8,profession:job,weapon:p.weapons[0]},m={id:'target',kind:'grox',x:0,z:id==='shadowreturn'?45:55,hp:1e12,maxHp:1e12},hits=[],fx=[];
 const c={map:'tribe',monsters:[m],damage(m,n){const actual=Math.min(m.hp,n);m.hp-=actual;hits.push(actual);return actual},fx(id,x,z,radius,details){fx.push({id,x,z,radius,...details});}};return {p,a,m,hits,fx,c};}
for(const job of jobs){
 assert.deepEqual(ASCENSION_SKILLS[job],PROFESSIONS[job].skills);assert(ANCIENT_SUPPLIES['book:'+job]);
 const p=newAncientProfile();p.materials['supply:transfer']=3;assert.equal(chooseAncientProfession(p,job),null);assert.equal(p.skills[PROFESSIONS[job].skills[3]],1);
 p.materials['supply:book:'+job]=1;assert.equal(useAncientSupply(p,'book:'+job,1,()=>0),null);assert.equal(p.materials['skillbook:'+PROFESSIONS[job].skills[0]],1);
 assert(ascensionEligible(profile(job)));p.skills[PROFESSIONS[job].skills[3]]=4;assert.equal(chooseAncientProfession(p,'warrior'),null);assert.equal(chooseAncientProfession(p,job),null);assert.equal(p.skills[PROFESSIONS[job].skills[3]],4);
 for(const id of PROFESSIONS[job].skills){
  assert(skillDescription(id,3,false).length>30);assert(skillDescription(id,3,true).length>30);assert(!holySkillDetails(id,3,true).includes('original recovery'));
  assert(skillRadius(id,6)>skillRadius(id,1));
  for(const level of [1,5,20,80,150])for(const n of [1,3,6]){
   if(SKILLS[id].unlock>level)continue;const totals=[];
   for(const holy of [false,true]){
    const f=fixture(job,id,level,n,holy),now=Date.now();assert.equal(castAncientSkill(f.a,f.p,id,dir,f.c,now),null,id);
    for(let t=0;t<=4000;t+=100)tickAncientSkills(f.a,f.p,f.c,.1,now+t);
    const total=f.hits.reduce((a,b)=>a+b,0);assert(total>0,id+' damage');totals.push(total);
    assert.equal(castAncientSkill(f.a,f.p,id,dir,f.c,now+1),id==='shadowreturn'?null:'技能冷却中');
    assert(f.fx.length>0);
   }
   assert(Math.abs(totals[1]/totals[0]-2.5)<1e-8,id+' holy multiplier once');
  }
 }
}
const f=fixture('shadowblade','shadowreturn'),now=Date.now();assert.equal(castAncientSkill(f.a,f.p,'shadowreturn',dir,f.c,now),null);assert.equal(f.a.z,44);const cooldown=f.a.skillRuntime.cooldowns.shadowreturn;
assert.equal(castAncientSkill(f.a,f.p,'shadowreturn',null,f.c,now+100),null);assert.equal(f.a.z,50);assert.equal(f.a.skillRuntime.cooldowns.shadowreturn,cooldown);assert(!f.a.skillRuntime.shadowAnchor);assert.equal(castAncientSkill(f.a,f.p,'shadowreturn',dir,f.c,now+200),'技能冷却中');
const cross=fixture('shadowblade','shadowreturn');castAncientSkill(cross.a,cross.p,'shadowreturn',dir,cross.c,now);cross.c.map='forest';const old=cross.a.z;assert.equal(castAncientSkill(cross.a,cross.p,'shadowreturn',dir,cross.c,now+1),'残影已消失');assert.equal(cross.a.z,old);
const wall=fixture('shadowblade','shadowstep');wall.c.canMove=(x,z,nx,nz)=>nz<=52;castAncientSkill(wall.a,wall.p,'shadowstep',dir,wall.c,now);assert.equal(wall.a.z,52);assert(wall.hits.length<=1,'dash hits each enemy once');
const invalid=fixture('shadowblade','shadowstep');assert(castAncientSkill(invalid.a,invalid.p,'shadowstep',[0,0,100],invalid.c,now));assert.equal(invalid.a.z,50);assert(!invalid.a.skillRuntime.cooldowns.shadowstep);
const hunt=fixture('shadowblade','nightfall');castAncientSkill(hunt.a,hunt.p,'nightfall',dir,hunt.c,now);assert.equal(castAncientSkill(hunt.a,hunt.p,'shadowstep',dir,hunt.c,now+100),null);assert.equal(hunt.a.skillRuntime.cooldowns.shadowstep,now+3100);
const missed=fixture('stonewright','mountainfall');missed.c.monsters=[];assert(castAncientSkill(missed.a,missed.p,'mountainfall',dir,missed.c,now));assert(!missed.a.skillRuntime.cooldowns.mountainfall);
const prison=fixture('stonewright','stoneprison');prison.m.kind='lord';castAncientSkill(prison.a,prison.p,'stoneprison',dir,prison.c,now);assert.equal(prison.m.slow,.3);assert.equal(prison.m.slowUntil,now+3000);
const corpse=fixture('stonewright','mountainfall');castAncientSkill(corpse.a,corpse.p,'mountainfall',dir,corpse.c,now);corpse.a.hp=0;tickAncientSkills(corpse.a,corpse.p,corpse.c,.2,now+4000);assert.equal(corpse.hits.length,0,'death cancels own pending damage');
// Every model has a genuinely distinct baked silhouette and shared clone geometry.
const silhouettes=new Set();
for(const job of jobs){const model=createProfessionPlayer(job),clone=createProfessionPlayer(job);let draws=0;const shape=[];model.traverse(m=>{if(m.isMesh){draws++;shape.push([...m.geometry.attributes.position.array].reduce((a,n,i)=>a+n*(i%13+1),0));}});assert(draws<=10);assert.equal(model.getObjectByName('baked-armor').geometry,clone.getObjectByName('baked-armor').geometry);attachHolyRegalia(model,job);attachHolyRegalia(model,job);assert.equal(model.children.filter(c=>c.name==='holy-regalia').length,1);silhouettes.add(shape.join(','));}assert.equal(silhouettes.size,2);
const designs=new Set();
for(const job of jobs)for(const id of PROFESSIONS[job].skills)for(const holy of [false,true]){
 const scene=new THREE.Scene(),fx=createAncientMagicFX(scene,()=>({x:0,y:1.7,z:0}));fx.effect({id,x:2,z:0,radius:skillRadius(id,3,holy),owner:'qa',holy,source:{x:-2,y:1.45,z:0}},()=>0);const root=scene.children[0];assert(root.children.length<=12,id+' draws');
 const fingerprint=root.children.map(m=>m.count||0).join(',');designs.add(id+':'+fingerprint);
 for(let i=0;i<100;i++){fx.update(i*100,.1);for(const g of scene.children)for(const m of g.children){assert(m.position.toArray().every(Number.isFinite));if(m.isInstancedMesh)assert([...m.instanceMatrix.array].every(Number.isFinite),id+' finite instance poses');}}
 assert.equal(scene.children.length,0);fx.clear();
}
assert.equal(designs.size,16,'normal and holy have independent compositions');
const stressScene=new THREE.Scene(),stress=createAncientMagicFX(stressScene);for(let i=0;i<200;i++){stress.effect({id:'mountainfall',x:0,z:0,holy:true,radius:9},()=>0);assert(stress.count<=12);assert(stressScene.children.reduce((n,g)=>n+g.children.reduce((n,m)=>n+(m.count||0),0),0)<=2400);}stress.clear();assert.equal(stressScene.children.length,0);
// Actual SQLite world handler: authoritative damage, dash correction and same-map FX.
const compiled=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']}),db=new DatabaseSync(':memory:'),sockets=[],module={exports:{}};
const sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows}}};
const ctx={storage:{sql,setAlarm:async()=>{},transactionSync:f=>f()},getWebSockets:()=>sockets};
vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,Date,crypto,Math,URL,structuredClone,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
const server=new module.exports.AncientWorld(ctx,{});
function peer(name,job,map='tribe'){const p=profile(job);server.save(name,p);let actor={name,map,tribeLayout:2,x:0,z:50,y:1.7,yaw:0,hp:1e8,maxHp:1e8,seen:Date.now(),weapon:p.weapons[0],lastShot:0,reloadAt:0,deadAt:0,profession:job};const ws={readyState:1,messages:[],deserializeAttachment:()=>structuredClone(actor),serializeAttachment:a=>actor=structuredClone(a),send:s=>ws.messages.push(JSON.parse(s)),close(){}};sockets.push(ws);return ws;}
const caster=peer('caster','shadowblade'),observer=peer('observer','stonewright'),foreign=peer('foreign','warrior','forest');
for(const job of jobs)for(const id of PROFESSIONS[job].skills){
 server.save('caster',profile(job));const a=caster.deserializeAttachment();a.x=0;a.z=50;a.y=1.7;a.hp=1e8;a.seen=Date.now();a.profession=job;delete a.skillRuntime;caster.serializeAttachment(a);sockets.forEach(ws=>ws.messages=[]);
 const world=server.world('tribe');for(const m of world.monsters)m.hp=0;Object.assign(world.monsters[0],{kind:'grox',x:0,z:id==='shadowreturn'?45:55,hp:1e12,maxHp:1e12});server.persist(world);
 await server.webSocketMessage(caster,JSON.stringify({type:'skill',id,direction:dir}));
 assert(!caster.messages.some(d=>d.type==='skillError'),id+' actual handler');const own=caster.messages.find(d=>d.type==='skillFx');assert(own,id);assert.deepEqual(observer.messages.find(d=>d.type==='skillFx'),own,'remote sees identical cast data');assert(!foreign.messages.some(d=>d.type==='skillFx'),'no cross-map effects');
 if(id==='shadowstep'||id==='shadowreturn'){const dash=caster.messages.find(d=>d.type==='skillDash');assert(dash);assert.equal(dash.z,caster.deserializeAttachment().z);if(id==='shadowreturn')assert(server.ctx.storage.sql.exec('SELECT data FROM ancient_abilities WHERE name=?','caster').toArray()[0].data.includes('shadowAnchor'));}
 const stored=server.world('tribe'),target=stored.monsters[0];for(const hit of target.strikes||[])hit.at=Date.now()-1;server.persist(stored);await server.tickMap('tribe');assert(caster.messages.some(d=>d.type==='hit'),id+' synchronized real damage');
}
db.close();console.log('PASS: eight new skills across level/skill bands; exact holy scaling; training/books/retained levels/ascension; wall-safe dash, recall, invalid input, cooldowns, death cleanup; 16 distinct bounded FX; baked models; real SQLite damage and identical same-map network FX.');
