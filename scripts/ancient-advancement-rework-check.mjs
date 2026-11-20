// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const built=await build({stdin:{contents:`
 export {chooseAdvancement} from './src/ancient-advancement-progress';
 export {castAncientSkill,tickAncientSkills,monsterSpeed} from './src/ancient-skill-combat';
 export {advancementAttack,aimGroundPoint} from './src/ancient-advancement-combat';
 export {newAncientProfile} from './src/ancient-rules';
 export {PROFESSIONS,skillDamageMultiplier,skillSpeedMultiplier} from './src/ancient-skills';
 export {ADVANCEMENT_REWORK} from './src/ancient-advanced-professions';
 `,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const M=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const {advancementEffectIds}=await import('../public/ancient-advancement-fx.js');
const fxIds=new Set(advancementEffectIds),N=100000;
function setup(job,route){
 const p=M.newAncientProfile();p.level=150;p.profession=job;
 p.ascension={jobs:{[job]:{holy:true}},attempts:0,day:''};
 p.skills=Object.fromEntries(M.PROFESSIONS[job].skills.map(id=>[id,5]));
 if(['chrono','voidsword'].includes(job)){p.fusedJobs={[job]:true};p.mastery=Object.fromEntries(M.PROFESSIONS[job].skills.map(id=>[id,{level:5,points:0}]))}
 assert(M.chooseAdvancement(p,route));
 const a={name:'tester',profession:job,advancement:route,holy:true,x:0,y:1.7,z:10,hp:10000,maxHp:10000,weapon:p.weapons[0]};
 const monsters=[],hits=[],visuals=[];
 let now=N,random=()=>1;
 const c={map:'tribe',monsters,damage(m,v,source,id){v=M.advancementAttack(a,p,m,v,id,c,now,random);assert(Number.isFinite(v)&&v>=0);hits.push({m:m.id,v,id,at:now});m.hp-=Math.min(v,m.hp);return v},fx(id,x,z,radius){assert(fxIds.has(id),id);assert([x,z,radius].every(Number.isFinite));visuals.push(id)}};
 const enemy=(id,x=0,z=16,kind='grox')=>{const m={id,kind,x,y:0,z,hp:1e20,maxHp:1e20};monsters.push(m);return m};
 const cast=(key,t=now,dir=[0,-.08,Math.sqrt(1-.08**2)])=>{now=t;return M.castAncientSkill(a,p,'advanced:'+key,dir,c,t)};
 const tick=t=>{now=t;M.tickAncientSkills(a,p,c,.2,t);for(const m of monsters){const due=(m.strikes||[]).filter(v=>v.at<=t);m.strikes=(m.strikes||[]).filter(v=>v.at>t);for(const hit of due)c.damage(m,hit.damage,undefined,hit.skillId)}};
 return {a,p,c,enemy,cast,tick,hits,visuals,random(fn){random=fn}};
}
// Storm damages stationary bosses and refreshes attraction; criticals splash only once.
{
 const f=setup('lightning','stormcaller'),boss=f.enemy('boss',0,16,'chief'),near=f.enemy('near',3,16);
 assert.equal(f.cast('Z'),null);f.tick(N+1);assert(f.hits.some(h=>h.m==='boss'&&h.id.endsWith(':Z')));
 assert(f.a.skillRuntime.stormcaller.attraction.boss.until>N+9000);
 f.random(()=>0);const start=f.hits.length;assert.equal(f.cast('X',N+1000),null);
 assert(near.strikes.some(v=>v.skillId.endsWith(':proc')));f.tick(N+1002);
 assert(f.hits.length-start<12,'critical splash is not recursive');
 boss.x=70;f.tick(N+10000);assert(f.a.skillRuntime.stormcaller.attraction.boss.until<N+12000);
}
// Lone targets still explode; copied burns are one hop and persist without a burst chain.
{
 const f=setup('fire','hellfire'),m=f.enemy('boss',0,16,'chief');
 assert.equal(f.cast('X'),null);let before=f.hits.length;assert.equal(f.cast('Z',N+10),null);assert(f.hits.length>before);
 const g=setup('fire','hellfire');g.enemy('source');g.enemy('copy',3,16);assert.equal(g.cast('X'),null);assert.equal(g.cast('Z',N+1),null);
 assert.equal(g.a.skillRuntime.advancedFire.embers.copy.hops,1);
 g.enemy('third',6,16);g.a.x=3;g.a.z=10;g.a.skillRuntime.cooldowns['advanced:Z']=0;
 assert.equal(g.cast('Z',N+100),null);assert.equal(g.a.skillRuntime.advancedFire.embers.third,undefined,'copied burn cannot hop again');
}
// Sword hits inside the domain are amplified and queue a nonrecursive execution exactly 1s later.
{
 const f=setup('voidsword','riftlord'),m=f.enemy('target');assert.equal(f.cast('Z'),null);f.tick(N+1);
 assert.equal(f.cast('X',N+100),null);const echo=m.strikes.find(v=>v.skillId==='advancement:riftlord:Z:proc');assert(echo);assert.equal(echo.at,N+1100);
 const first=f.hits.find(h=>h.id==='advancement:riftlord:X');assert(Math.abs(echo.damage/first.v-2.4)<1e-8);
 const n=m.strikes.length;f.tick(N+1100);assert(m.strikes.length<n,'echo does not create another echo');
 f.a.x=50;f.tick(N+1300);assert(!f.a.skillRuntime.effects.riftDomain);
}
// Life Anchor records an aimed position; damaged return heals and stacks charges. Offensive casts consume once.
{
 const f=setup('chrono','time-sovereign');f.enemy('target');
 assert.equal(f.cast('Z'),null);const point={...f.a.skillRuntime.advancedTime.rewind};assert(point.z>20&&point.z<60);
 f.a.hp=5000;assert.equal(f.cast('Z',N+500),null);assert.equal(f.a.hp,10000);assert.equal(f.a.skillRuntime.advancedTime.charges,1);assert.equal(f.a.z,point.z);
 f.a.z=10;assert.equal(f.cast('Z',N+24000),null);f.a.hp=4000;assert.equal(f.cast('Z',N+24500),null);assert.equal(f.a.skillRuntime.advancedTime.charges,2);
 f.a.z=10;const control=setup('chrono','time-sovereign');control.enemy('target');assert.equal(control.cast('X',N+25000),null);assert.equal(f.cast('X',N+25000),null);
 assert(Math.abs(f.hits.at(-1).v/control.hits.at(-1).v-3)<1e-8);assert.equal(f.a.skillRuntime.advancedTime.charges,0);
 const g=setup('chrono','time-sovereign');g.enemy('target');assert.equal(g.cast('Z'),null);assert.equal(g.cast('Z',N+500),null);
 assert.equal(M.skillSpeedMultiplier(g.a,N+600),1.2);assert.equal(M.skillDamageMultiplier(g.a,N+600),1.2);
 assert.equal(M.aimGroundPoint(g.a,[NaN,0,1],g.c,50),undefined);
}
// Time field affects later entrants including bosses, stops movement, scales random bounds, and echoes only on real attacks.
{
 const f=setup('chrono','time-sovereign');const m=f.enemy('boss',0,16,'chief');assert.equal(f.cast('C'),null);f.tick(N+1);
 assert.equal(M.monsterSpeed(m,N+2),0);assert(m.timeDistortion);
 const n=f.enemy('late',2,16);f.tick(N+1100);assert(n.timeDistortion,'new entrants are affected');
 const before=m.strikes.length;f.c.damage(m,100,undefined,'weapon');assert.equal(m.strikes.length,before+1);
 f.tick(N+1700);assert(m.strikes.length<=before);
 assert(M.ADVANCEMENT_REWORK.verdict.min(20)>M.ADVANCEMENT_REWORK.verdict.min(5));
}
// Earth placement works without targets; limit scales, contact ticks, connected spikes and detonation consume correctly.
{
 const f=setup('stonewright','veinforger');
 const dirs=[[0,-.3,Math.sqrt(.91)],[.25,-.3,Math.sqrt(.8475)],[-.25,-.3,Math.sqrt(.8475)]];
 for(let i=0;i<18;i++)assert.equal(f.cast('X',N+i*1300,dirs[i%3]),null);
 const state=f.a.skillRuntime.advancedStone;assert.equal(state.spikes.length,15);
 const p=state.spikes.at(-1),m=f.enemy('touching',p.x,p.z);f.tick(N+23000);assert(f.hits.some(h=>h.id==='advancement:veinforger:X'));
 assert.equal(f.cast('C',N+24000),null);assert(state.formation.points.length>0);assert(state.formation.points.length<=1200);
 assert.equal(f.cast('Z',N+25000),null);assert.equal(state.spikes.length,0);assert.equal(state.formation,undefined);assert(f.hits.some(h=>h.id==='advancement:veinforger:Z'));
}
// Flying spike pierces three distinct enemies, never a fourth or the same enemy twice.
{
 const f=setup('stonewright','veinforger');for(let i=0;i<4;i++)f.enemy('line'+i,0,15+i*4);
 assert.equal(f.cast('Q',N,[0,0,1]),null);f.tick(N+500);f.tick(N+700);
 const hits=f.hits.filter(h=>h.id==='advancement:veinforger:Q');assert.equal(hits.length,3);assert.equal(new Set(hits.map(h=>h.m)).size,3);
}
// All Boundary Cutter attacks deal damage without attack windups or preexisting marks.
for(const key of ['X','Q','Z','C']){
 const f=setup('shadowblade','boundarycutter');f.enemy('idle',0,16);assert.equal(f.cast(key,N,[0,0,1]),null);
 assert(f.hits.length>0,key+' has independent damage');if(key==='Z'){f.tick(N+800);assert(f.hits.length>=2)}
 if(key==='C'){const before=f.hits.length;f.tick(N+1000);f.tick(N+7000);assert(f.hits.length>before)}
}
console.log('PASS: reworked storms, single-hop burn explosions, sword executions, Life Anchor branches and charges, late-entry time fields, earth placement/cap/ticks/link/explosion/three-target piercing, and every Boundary Cutter skill.');

// Exercise the real server entry too: queued effects and potion gates must not exist only in the fixture.
{
 const {DatabaseSync}=await import('node:sqlite'),vm=await import('node:vm');
 const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows}}},peers=[];
 const mod={exports:{}},out=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']});
 const rng=Object.create(Math);rng.random=()=>0;
 vm.runInNewContext(out.outputFiles[0].text,{module:mod,exports:mod.exports,Math:rng,Date,crypto,URL,URLSearchParams,Request,Response,AbortController,structuredClone,require:()=>({DurableObject:class{constructor(ctx,env){this.ctx=ctx;this.env=env}}})});
 const server=new mod.exports.AncientWorld({storage:{sql,setAlarm:async()=>{},transactionSync:f=>f()},getWebSockets:()=>peers},{});
 const f=setup('voidsword','riftlord');f.a.level=150;f.a.map='tribe';f.a.seen=Date.now();server.save('tester',f.p);
 let attachment=f.a;const ws={readyState:1,deserializeAttachment:()=>attachment,serializeAttachment:p=>attachment=p,send(){}};peers.push(ws);
 f.cast('Z',Date.now());const m=f.enemy('server-target');const now=Date.now();
 const actual=server.damageMonster(ws,f.a,m,100,'body','tester','skill','advancement:riftlord:X',[m]);
 assert(actual>100);assert(m.strikes.some(hit=>hit.skillId==='advancement:riftlord:Z:proc'&&hit.at>=now+1000));
 const storm=setup('lightning','stormcaller');Object.assign(storm.a,{level:150,map:'tribe',seen:Date.now()});server.save('tester',storm.p);attachment=storm.a;
 const primary=storm.enemy('primary'),near=storm.enemy('nearby',2,16);storm.cast('Z',Date.now());storm.tick(Date.now()+1);
 storm.a.skillRuntime.stormcaller.attraction={primary:{until:Date.now()+10000,level:5}};
 const crit=server.damageMonster(ws,storm.a,primary,100,'body','tester','skill','advancement:stormcaller:X',[primary,near]);
 assert(crit>=280);assert(near.strikes.some(hit=>hit.skillId==='advancement:stormcaller:Z:proc'));
 storm.p.potions.minor=1;server.save('tester',storm.p);storm.a.hp=1;storm.a.pvpEffects={timeDistortion:{owner:'other',until:Date.now()+5000,level:5,power:100}};
 // Use an actual potion id from the profile's inventory, avoiding any production account.
 const denied=await server.command('tester','usePotion',{id:'minor'});
 assert(!denied.ok);assert(/时间扭曲/.test(denied.error));
 db.close();console.log('PASS: authoritative server amplifies sword hits, queues spatial executions, and produces attraction criticals with splash.');
}
