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
console.log('PASS: reworked storms, single-hop burn explosions, earth placement/cap/ticks/link/explosion/three-target piercing, and every Boundary Cutter skill.');

// Remaining audited skills now have independent value without forcing movement or incoming hits.
{
 const f=setup('ice','crystalist');f.enemy('target');assert.equal(f.cast('Z'),null);f.tick(N+100);assert(f.hits.some(h=>h.id==='advancement:crystalist:Z'));
 const h=setup('curse','hexweaver');h.enemy('target');assert.equal(h.cast('Z'),null);assert(h.hits.length>0);assert(h.a.skillRuntime.advancedCurse.hexes.target);
 const shadow=setup('shadowblade','shadowhunter');shadow.enemy('target');assert.equal(shadow.cast('Q'),null);const position={x:shadow.a.x,z:shadow.a.z};assert(shadow.hits.length>0);shadow.tick(N+6000);assert.equal(shadow.a.x,position.x);assert.equal(shadow.a.z,position.z);assert(!shadow.a.skillRuntime.advancedShadow.anchor);
 const summon=setup('summoner','spiritcaller');assert.equal(summon.cast('X'),null);const pet=summon.a.skillRuntime.summon;pet.hp=pet.maxHp*.25;assert.equal(summon.cast('C',N+100),null);assert(pet.hp>pet.maxHp*.5);assert.equal(summon.a.skillRuntime.advancedSummon.revivalUntil,pet.until);pet.hp=0;summon.tick(N+200);assert(Math.abs(pet.hp/pet.maxHp-.3)<.001);assert(!summon.a.skillRuntime.advancedSummon.revivalUntil);
}
console.log('PASS: Frost field damage, independent plague opener, optional shadow return, and immediate guardian healing with a lifetime single revival.');

// Exercise the real server entry too: queued effects and potion gates must not exist only in the fixture.
{
 const {DatabaseSync}=await import('node:sqlite'),vm=await import('node:vm');
 const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows}}},peers=[];
 const mod={exports:{}},out=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']});
 const rng=Object.create(Math);rng.random=()=>0;
 vm.runInNewContext(out.outputFiles[0].text,{module:mod,exports:mod.exports,Math:rng,Date,crypto,URL,URLSearchParams,Request,Response,AbortController,structuredClone,require:()=>({DurableObject:class{constructor(ctx,env){this.ctx=ctx;this.env=env}}})});
 const server=new mod.exports.AncientWorld({storage:{sql,setAlarm:async()=>{},transactionSync:f=>f()},getWebSockets:()=>peers},{});
 let attachment;const ws={readyState:1,deserializeAttachment:()=>attachment,serializeAttachment:p=>attachment=p,send(){}};peers.push(ws);
 const storm=setup('lightning','stormcaller');Object.assign(storm.a,{level:150,map:'tribe',seen:Date.now()});server.save('tester',storm.p);attachment=storm.a;
 const primary=storm.enemy('primary'),near=storm.enemy('nearby',2,16);storm.cast('Z',Date.now());storm.tick(Date.now()+1);
 storm.a.skillRuntime.stormcaller.attraction={primary:{until:Date.now()+10000,level:5}};
 const crit=server.damageMonster(ws,storm.a,primary,100,'body','tester','skill','advancement:stormcaller:X',[primary,near]);
 assert(crit>=280);assert(near.strikes.some(hit=>hit.skillId==='advancement:stormcaller:Z:proc'));
 storm.p.potions.minor=1;server.save('tester',storm.p);storm.a.hp=1;storm.a.pvpEffects={timeDistortion:{owner:'other',until:Date.now()+5000,level:5,power:100}};
 // Use an actual potion id from the profile's inventory, avoiding any production account.
 const denied=await server.command('tester','usePotion',{id:'minor'});
 assert(!denied.ok);assert(/时间扭曲/.test(denied.error));
 db.close();console.log('PASS: authoritative server produces attraction criticals with splash and enforces potion gates.');
}
