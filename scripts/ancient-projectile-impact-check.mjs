// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import {build} from 'esbuild';
const built=await build({stdin:{contents:`export {castAncientSkill,tickAncientSkills} from './src/ancient-skill-combat';export {newAncientProfile,blocked,lineClear} from './src/ancient-rules';export {PROFESSIONS,SKILLS} from './src/ancient-skills';export {ADVANCED_PROFESSIONS} from './src/ancient-advanced-professions';export {chooseAdvancement} from './src/ancient-advancement-progress';export {projectileSkills,projectileRoutes} from './src/ancient-skill-flight';`,resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node'});
const M=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64')),now=100000;
function fixture(job='fire',route){const p=M.newAncientProfile();Object.assign(p,{profession:job,level:150,skills:Object.fromEntries(M.PROFESSIONS[job].skills.map(id=>[id,5])),fusedJobs:{[job]:true},mastery:Object.fromEntries(M.PROFESSIONS[job].skills.map(id=>[id,{level:5,points:0}])),ascension:{jobs:{[job]:{holy:true}},day:'',attempts:0}});if(route)assert(M.chooseAdvancement(p,route));const a={name:'tester',profession:job,x:0,y:1.7,z:10,hp:10000,maxHp:10000,weapon:p.weapons[0]},hits=[],fx=[],monsters=[],c={map:'tribe',monsters,fx(id,x,z,r,d){fx.push({id,x,z,r,...d})},damage(m,n,s,id){hits.push({id,target:m.id,n});return n}};const enemy=(id='target',x=0,z=24)=>{const m={id,kind:'grox',x,y:0,z,hp:1e15,maxHp:1e15};monsters.push(m);return m};return {p,a,c,hits,fx,enemy,tick(t){M.tickAncientSkills(a,p,c,.1,t)}};}
let tested=0;
const cases=[...[...M.projectileSkills].map(id=>[M.SKILLS[id].job,undefined,id]),...Object.entries(M.projectileRoutes).flatMap(([route,keys])=>[...keys].map(key=>[Object.entries(M.ADVANCED_PROFESSIONS).find(([,rs])=>rs.some(r=>r.id===route))[0],route,'advanced:'+key]))];
for(const [job,route,id] of cases){const f=fixture(job,route),m=f.enemy();if(route==='hellfire'&&id!=='advanced:X'){M.castAncientSkill(f.a,f.p,'advanced:X',[0,0,1],{...f.c,projectileImpact:true},now-1000);f.a.skillRuntime.cooldowns={};for(const ember of Object.values(f.a.skillRuntime.advancedFire.embers))ember.next=now+10000;f.hits.length=f.fx.length=0;}
 assert.equal(M.castAncientSkill(f.a,f.p,id,[0,0,1],f.c,now),null,route||id);assert.equal(f.hits.length,0,'no damage at launch '+(route||id));assert.equal(f.fx.filter(e=>e.phase==='skill-flight').length,1);assert.equal(f.fx.filter(e=>!e.phase).length,0,'no impact FX before contact');
 const cd=f.a.skillRuntime.cooldowns[id];f.tick(now+50);assert.equal(f.hits.length,0,'no early hit '+(route||id));assert.equal(f.a.skillRuntime.freeProjectiles.length,1);
 f.tick(now+400);assert.equal(f.a.skillRuntime.freeProjectiles.length,0);assert(f.fx.some(e=>e.phase==='flight-impact'&&e.target===m.id),'actual contact');assert(f.fx.some(e=>e.phase!=='skill-flight'&&e.phase!=='flight-impact'),'effect only after contact '+(route||id));assert.equal(f.a.skillRuntime.cooldowns[id],cd,'cooldown starts at launch once');tested++;
}
{
 const f=fixture(),m=f.enemy();M.castAncientSkill(f.a,f.p,'firebolt',[0,0,1],f.c,now);m.x=20;f.tick(now+500);assert.equal(f.hits.length,0,'target can dodge');f.tick(now+2000);assert.equal(f.hits.length,0);assert.equal(f.a.skillRuntime.freeProjectiles.length,0);assert(!f.fx.some(e=>!e.phase),'miss does not burst');
}
{
 const f=fixture();M.castAncientSkill(f.a,f.p,'firebolt',[0,0,1],f.c,now);f.tick(now+100);f.enemy('late',0,24);f.tick(now+400);assert(f.hits.some(h=>h.target==='late'),'enemy entering path gets hit');const n=f.hits.length;f.tick(now+500);assert.equal(f.hits.length,n,'one impact');
}
{
 const f=fixture();f.enemy('front',.8,18);f.enemy('back',0,24);M.castAncientSkill(f.a,f.p,'firebolt',[0,0,1],f.c,now);f.tick(now+500);assert.equal(f.hits[0].target,'front','nearest collider blocks farther centered target');
}
{
 const f=fixture();f.enemy();M.castAncientSkill(f.a,f.p,'firebolt',[0,0,1],f.c,now);const cd=f.a.skillRuntime.cooldowns.firebolt;f.a.skillRuntime.cooldowns.firebolt=cd+5000;f.tick(now+500);assert.equal(f.a.skillRuntime.cooldowns.firebolt,cd+5000,'old projectile cannot reset a newer cooldown');
}
{
 const f=fixture();let wall;for(let x=8;x<45&&!wall;x++)for(let z=15;z<100&&!wall;z+=2)if(M.blocked(x,z,.35,'tribe',0)&&!M.blocked(x-7,z,.35,'tribe',0)&&!M.blocked(x+7,z,.35,'tribe',0)&&!M.lineClear(x-7,1.5,z,x+7,1.5,z,'tribe'))wall={x,z};assert(wall);Object.assign(f.a,{x:wall.x-7,y:1.5,z:wall.z});f.enemy('hidden',wall.x+7,wall.z);M.castAncientSkill(f.a,f.p,'firebolt',[1,0,0],f.c,now);f.tick(now+500);assert.equal(f.hits.length,0);assert.equal(f.a.skillRuntime.freeProjectiles.length,0);assert(!f.fx.some(e=>!e.phase),'wall is not a monster impact');
}
for(const cancel of ['death','map','profession']){const f=fixture();f.enemy();M.castAncientSkill(f.a,f.p,'firebolt',[0,0,1],f.c,now);if(cancel==='death')f.a.hp=0;if(cancel==='map')f.c.map='forest';if(cancel==='profession')f.p.profession='ice';f.tick(now+500);assert.equal(f.hits.length,0);assert.equal(f.a.skillRuntime.freeProjectiles.length,0);}
{const f=fixture('fire','hellfire');assert(M.castAncientSkill(f.a,f.p,'firebolt',[0,0,1],f.c,now));assert(!f.a.skillRuntime?.freeProjectiles?.length);assert(M.castAncientSkill(f.a,f.p,'advanced:invalidX',[0,0,1],f.c,now));assert(!f.a.skillRuntime.freeProjectiles?.length);}
{const f=fixture();assert.equal(M.castAncientSkill(f.a,f.p,'firebolt',[0,0,1.04],f.c,now),null);assert.equal(Math.hypot(...f.a.skillRuntime.freeProjectiles[0].direction),1);}
// Reworked Paladin has independent close combat, bounded sustain and no charm/max-HP deletion.
{
 const f=fixture('warrior','paladin'),m=f.enemy('boss',0,13);m.kind='chief';m.charm={owner:f.a.name,until:now+99999,next:now};m.judgment={owner:f.a.name,until:now+9999,maxHp:m.maxHp};m.maxHp*=.7;
 assert.equal(M.castAncientSkill(f.a,f.p,'advanced:X',[0,0,1],f.c,now),null);assert(f.hits.length);assert(!m.charm);assert(!m.judgment);assert.equal(m.maxHp,1e15);
 f.a.hp=1000;M.castAncientSkill(f.a,f.p,'advanced:Z',[0,0,1],f.c,now+1);f.tick(now+2);assert(f.hits.some(h=>h.id==='advancement:paladin:Z'));assert.equal(f.a.hp,1300);f.tick(now+100);assert.equal(f.a.hp,1300,'no healing per frame');
 m.z=24;const max=m.maxHp;assert.equal(M.castAncientSkill(f.a,f.p,'advanced:C',[0,0,1],f.c,now+200),null);assert(!m.weakUntil);f.tick(now+700);assert.equal(m.maxHp,max);assert.equal(m.weak,.25);assert.equal(m.slow,.25);assert.equal(m.vulnerable,.2);
}
console.log('PASS: '+tested+' projectile spells/routes defer effects until physical contact; dodging, late entrants, first collider, walls, empty casts, one impact, independent cooldowns and reworked Paladin.');

const THREE=await import('../public/three.module.js'),{createAdvancementFields}=await import('../public/ancient-advancement-fields.js');
{const scene=new THREE.Scene(),camera=new THREE.Camera(),fields=createAdvancementFields(scene,camera),a={hp:100,advancement:'paladin',skillRuntime:{paladin:{field:{x:0,y:0,z:0,radius:9,until:Date.now()+5000}}}};fields.update([a],0);const rings=scene.children.find(n=>n.geometry.type==='TorusGeometry');assert.equal(rings.count,2);assert(rings.instanceColor.array[0]>rings.instanceColor.array[1]&&rings.instanceColor.array[1]>rings.instanceColor.array[2]);a.skillRuntime.paladin.field.until=0;fields.update([a],200);assert.equal(rings.count,0);fields.clear();}
console.log('PASS: authoritative gold Sanctuary rings persist, use bounded instancing and expire.');
