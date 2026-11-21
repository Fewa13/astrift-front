// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
const out=await build({stdin:{contents:`
 export {newAncientProfile} from './src/ancient-rules';
 export {PROFESSIONS,SKILLS} from './src/ancient-skills';
 export {ADVANCED_PROFESSIONS,LEGACY_FUSION_ADVANCEMENTS} from './src/ancient-advanced-professions';
 export {retireFusionAdvancements,chooseAdvancement,advancementRoute,advancementCost} from './src/ancient-advancement-progress';
 export {masteryCost,FUSION_DAMAGE_SCALE,FUSION_DAMAGE_MULTIPLIER,fusionDamageMultiplier} from './src/ancient-mastery';
 export {migrateFusionAdvancementProfiles} from './src/ancient-fusion-rollback';
 export {castAncientSkill,tickAncientSkills} from './src/ancient-skill-combat';
 `,resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node'});
const M=await import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'));
const jobs=['elementalist','voidsword','abyssal','chrono','necromancer'];
function profile(){const p=M.newAncientProfile();Object.assign(p,{level:150,profession:'voidsword',fusedJobs:Object.fromEntries(jobs.map(j=>[j,true])),mastery:{},fusionPassives:{voidsword:{0:{level:9,points:3}}},ascension:{jobs:{swordsman:{holy:true}},attempts:0,day:''},advancements:{}});for(const [job,routes] of Object.entries(M.LEGACY_FUSION_ADVANCEMENTS))p.advancements[job]={route:routes[0].id,skills:Object.fromEntries([... 'XQZC'].map((key,i)=>[key,{level:6+i,points:31+i}]))};p.profession='swordsman';p.skills=Object.fromEntries(M.PROFESSIONS.swordsman.skills.map(id=>[id,5]));assert(M.chooseAdvancement(p,'blademaster'));p.profession='voidsword';return p;}
{
 const p=profile(),before=structuredClone(p),ids=M.PROFESSIONS.voidsword.skills;
 p.mastery[ids[0]]={level:12,points:5};p.mastery[ids[1]]={level:before.advancements.voidsword.skills[M.SKILLS[ids[1]].key].level,points:999};
 assert(M.retireFusionAdvancements(p));
 for(const job of jobs){assert.equal(p.advancements[job],undefined);assert.equal(M.ADVANCED_PROFESSIONS[job],undefined);for(const route of M.LEGACY_FUSION_ADVANCEMENTS[job]||[])assert.equal(M.chooseAdvancement({...p,profession:job},route.id),false);}
 assert.deepEqual(p.advancements.swordsman,before.advancements.swordsman);
 for(const key of ['profession','fusedJobs','fusionPassives','ascension','materials','coins','weapons'])assert.deepEqual(p[key],before[key]);
 assert.deepEqual(p.mastery[ids[0]],{level:12,points:5});assert.deepEqual(p.mastery[ids[1]],{level:before.advancements.voidsword.skills[M.SKILLS[ids[1]].key].level,points:999});
 for(const job of Object.keys(M.LEGACY_FUSION_ADVANCEMENTS))for(const id of M.PROFESSIONS[job].skills){if(ids.slice(0,2).includes(id))continue;const trained=before.advancements[job].skills[M.SKILLS[id].key];assert.deepEqual(p.mastery[id],{level:trained.level,points:Math.floor(trained.points*M.masteryCost(id,trained.level)/M.advancementCost(trained.level))});}
 assert.equal(M.advancementRoute(p),undefined);assert.equal(M.retireFusionAdvancements(p),false);
 p.profession='swordsman';assert.equal(M.advancementRoute(p).id,'blademaster');
}
for(const [job,old] of Object.entries({elementalist:3.2,voidsword:3.5,abyssal:3.35,chrono:3.15,necromancer:2.8}))assert(Math.abs(M.fusionDamageMultiplier(job)/old-.85)<1e-12);
assert.equal(M.FUSION_DAMAGE_SCALE,.85);assert.equal(M.FUSION_DAMAGE_MULTIPLIER,2.38);
const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows}}};
sql.exec('CREATE TABLE ancient_profiles(name TEXT PRIMARY KEY,data TEXT NOT NULL)');sql.exec('CREATE TABLE ancient_abilities(name TEXT PRIMARY KEY,data TEXT NOT NULL)');
const old=profile(),inactive=profile();inactive.profession='swordsman';const ordinary=M.newAncientProfile();
for(const [name,p] of Object.entries({active:old,inactive,ordinary}))sql.exec('INSERT INTO ancient_profiles VALUES(?,?)',name,JSON.stringify(p));
sql.exec('INSERT INTO ancient_abilities VALUES(?,?)','active',JSON.stringify({advancementIdentity:'tribe|riftlord',advancedRift:{domain:{until:1e15}},cooldowns:{'advanced:X':123}}));
sql.exec('INSERT INTO ancient_abilities VALUES(?,?)','inactive',JSON.stringify({advancementIdentity:'tribe|blademaster',advancedSword:{flight:{until:123}}}));
const ordinaryState=sql.exec('SELECT data FROM ancient_abilities WHERE name=?','inactive').toArray()[0].data;
sql.exec('BEGIN');assert.equal(M.migrateFusionAdvancementProfiles(sql,12345),2);sql.exec('COMMIT');
for(const name of ['active','inactive']){const p=JSON.parse(sql.exec('SELECT data FROM ancient_profiles WHERE name=?',name).toArray()[0].data);assert(!p.advancements.voidsword);assert(p.advancements.swordsman);assert.equal(p.mastery.voidslash.level,6);assert.equal(sql.exec('SELECT appliedAt FROM ancient_fusion_rollback_backups WHERE name=?',name).toArray()[0].appliedAt,12345);}
assert.equal(sql.exec('SELECT profile AS data FROM ancient_fusion_rollback_backups WHERE name=?','active').toArray()[0].data,JSON.stringify(old));
assert.equal(sql.exec('SELECT data FROM ancient_abilities WHERE name=?','inactive').toArray()[0].data,ordinaryState);
assert.equal(JSON.parse(sql.exec('SELECT data FROM ancient_abilities WHERE name=?','active').toArray()[0].data).advancedRift,undefined);
assert.equal(M.migrateFusionAdvancementProfiles(sql,99999),0);assert.equal(sql.exec('SELECT count(*) AS n FROM ancient_fusion_rollback_backups').toArray()[0].n,2);
// Real world constructor, authoritative weapon/skill gates, and stale client keys after rollback.
const worldBuild=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']});
const mod={exports:{}},peers=[];vm.runInNewContext(worldBuild.outputFiles[0].text,{module:mod,exports:mod.exports,Math,Date,crypto,URL,URLSearchParams,Request,Response,AbortController,structuredClone,require:()=>({DurableObject:class{constructor(ctx,env){this.ctx=ctx;this.env=env}}})});
sql.exec('INSERT INTO ancient_profiles VALUES(?,?)','late',JSON.stringify(old));
const world=new mod.exports.AncientWorld({storage:{sql,setAlarm:async()=>{},transactionSync:f=>f()},getWebSockets:()=>peers},{});
assert(!world.read('late').advancements.voidsword);
const p=world.read('active'),a={name:'active',profession:'voidsword',level:150,map:'tribe',holy:true,x:0,y:1.7,z:10,hp:10000,maxHp:10000,weapon:p.weapons[0]},ws={readyState:1,deserializeAttachment:()=>a,serializeAttachment(){},send(){}};peers.push(ws);
const enemy=()=>({id:'target',kind:'grox',x:0,y:0,z:14,hp:1e12,maxHp:1e12,level:150,region:'tribe'});
assert.equal(world.damageMonster(ws,a,enemy(),100,'body','active','weapon',undefined,[]),85);
assert.equal(world.damageMonster(ws,a,enemy(),100,'body','active','skill','voidslash',[]),100,'skill body is scaled exactly once by the caster');
assert.equal(world.damageMonster(ws,a,enemy(),100,'body','active','skill','advancement:riftlord:X',[]),0);
const hits=[],m=enemy(),now=100000,c={map:'tribe',projectileImpact:true,monsters:[m],damage(_m,n,_s,id){hits.push({n,id});return n},fx(){}};
assert.equal(M.castAncientSkill(a,p,'advanced:X',[0,0,1],c,now),null);assert(hits.some(h=>h.id==='voidslash'));
Object.assign(a.skillRuntime,{advancementIdentity:'tribe|riftlord',advancedRift:{domain:{until:now+10000}},effects:{riftDomain:{until:now+10000,level:5}}});
m.strikes=[{owner:a.name,skillId:'advancement:riftlord:Z:proc',at:now+1000,damage:100},{owner:a.name,skillId:'voidslash',at:now+1000,damage:10}];
M.tickAncientSkills(a,p,c,.2,now+1);assert(!a.skillRuntime.advancedRift);assert(!a.skillRuntime.effects.riftDomain);assert.equal(m.strikes.length,1);assert.equal(m.strikes[0].skillId,'voidslash');
db.close();console.log('PASS: all fusion damage ×0.85, complete/idempotent online+offline rollback with backups and mastery preservation, ordinary routes intact, stale route actions/effects rejected, base skills usable.');
