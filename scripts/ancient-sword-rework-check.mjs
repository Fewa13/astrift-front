import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {build} from 'esbuild';
const built=await build({stdin:{contents:`export {castAncientSkill,tickAncientSkills,ancientAuxShot} from './src/ancient-skill-combat';export {newAncientProfile} from './src/ancient-rules';export {chooseAdvancement,rollbackAdvancement} from './src/ancient-advancement-progress';export {PROFESSIONS,SKILLS,skillTravelRange,skillDamageMultiplier,skillSpeedMultiplier} from './src/ancient-skills';`,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const {castAncientSkill,tickAncientSkills,ancientAuxShot,newAncientProfile,chooseAdvancement,rollbackAdvancement,PROFESSIONS,SKILLS,skillTravelRange,skillDamageMultiplier,skillSpeedMultiplier}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
function fixture(route='blademaster'){
 const p=newAncientProfile();p.profession='swordsman';p.level=150;p.skills=Object.fromEntries(PROFESSIONS.swordsman.skills.map(id=>[id,8]));p.ascension={jobs:{swordsman:{holy:true}},attempts:0,day:''};assert(chooseAdvancement(p,route));
 const a={name:'tester',profession:'swordsman',x:0,y:1.7,z:10,hp:50000,maxHp:100000,weapon:p.weapons[0]},hits=[],effects=[];
 const c={map:'tribe',monsters:[],damage(m,n,s,id){hits.push({id,n});const actual=Math.min(m.hp,n);m.hp-=actual;return actual},fx(id,x,z,r,d){effects.push({id,x,z,r,...d})}};
 const monster=(z=16)=>({id:'target',kind:'grox',x:0,y:0,z,hp:1e15,maxHp:1e15});
 return {p,a,c,hits,effects,monster};
}
const dir=[0,0,1],now=100000;
{
 const {p,a,c,monster,hits}=fixture();assert.equal(rollbackAdvancement(p),null);assert.equal(p.advancements.swordsman.route,'');
 c.monsters.push(monster());assert.equal(castAncientSkill(a,p,'advanced:X',dir,c,now),null);assert(hits.length>0,'stale branch binding maps back to base skill');
 assert(readFileSync('public/ancient-client.js','utf8').includes("id=advanced?.route&&/^Key[XQZC]$/"));
}
{
 const {p,a,c,monster,hits}=fixture();rollbackAdvancement(p);
 assert.equal(castAncientSkill(a,p,'swordwave',dir,c,now),null);assert.equal(a.skillRuntime.freeProjectiles.length,1);const cooldown=a.skillRuntime.cooldowns.swordwave;
 assert.equal(castAncientSkill(a,p,'swordwave',dir,c,now+1),'技能冷却中');
 c.monsters.push(monster());tickAncientSkills(a,p,c,.2,now+200);assert.equal(a.skillRuntime.freeProjectiles.length,0);assert(hits.length);assert(a.skillRuntime.cooldowns.swordwave>=cooldown);
 const count=hits.length;tickAncientSkills(a,p,c,.2,now+400);assert.equal(hits.length,count,'impact settled once');
 assert.equal(skillTravelRange(1),50);assert.equal(skillTravelRange(26),100);assert.equal(skillTravelRange(100),100);
}
{
 const {p,a,c,monster,hits,effects}=fixture();
 assert.equal(castAncientSkill(a,p,'advanced:Q',dir,c,now),null);assert.equal(a.skillRuntime.advancedSword.projectiles[0].remaining,60);
 c.monsters.push(monster());for(let t=200;t<=4400;t+=100)tickAncientSkills(a,p,c,.1,now+t);
 assert.equal(hits.filter(h=>h.id==='advancement:blademaster:Q').length,9,'initial cut plus eight half-second cuts');assert(effects.some(e=>e.phase==='blade-field'));
 assert.equal(castAncientSkill(a,p,'advanced:X',dir,c,now+5000),null);const flight=a.skillRuntime.advancedSword.flightUntil;assert.equal(a.skillRuntime.cooldowns['advanced:X'],flight+5000,'riding cooldown starts after flight ends');
 assert.equal(castAncientSkill(a,p,'advanced:Z',dir,c,now+5001),null);const form=a.skillRuntime.advancedSword.formUntil;assert.equal(a.skillRuntime.cooldowns['advanced:Z'],form+16000,'form cooldown starts after transformation ends');assert.equal(castAncientSkill(a,p,'advanced:Z',dir,c,form+1),'技能冷却中');assert(form<flight,'form expiration resumes active riding');
 assert.equal(ancientAuxShot(a,p,dir,c,now+5002),null);const shots=a.skillRuntime.advancedSword.projectiles.length;ancientAuxShot(a,p,dir,c,now+5100);assert.equal(a.skillRuntime.advancedSword.projectiles.length,shots,'700ms attack interval enforced');
 assert.equal(castAncientSkill(a,p,'advanced:C',dir,c,now+5200),null);assert(skillDamageMultiplier(a,now+5201)>1.4);assert(skillSpeedMultiplier(a,now+5201)>1.2);
 c.map='forest';tickAncientSkills(a,p,c,.1,now+5300);assert(!a.skillRuntime.advancedSword,'map change removes old projectiles/form');
}
{
 const {p,a,c,effects}=fixture('linebreaker');assert.equal(castAncientSkill(a,p,'advanced:Z',dir,c,now),null);tickAncientSkills(a,p,c,.1,now+2401);
 assert(effects.some(e=>e.phase==='blade-wave'),'unhit guard always sends ending slash');assert.equal(a.skillRuntime.advancedSword.projectiles.length,1);
}

{
 const {p,a,c}=fixture('linebreaker');castAncientSkill(a,p,'advanced:Z',dir,c,now);tickAncientSkills(a,p,c,.1,now+2401);const distance=a.skillRuntime.advancedSword.projectiles[0].remaining;tickAncientSkills(a,p,c,.1,now+2501);
 assert(Math.abs(a.skillRuntime.advancedSword.projectiles[0].remaining-(distance-7.2))<1e-6,'sword energy travels 72m/s, twice the previous speed');
}
const THREE=await import('../public/three.module.js');const {createSwordReworkFX,createSwordForm}=await import('../public/ancient-sword-rework-fx.js');
const scene=new THREE.Scene(),camera=new THREE.Camera(),fx=createSwordReworkFX(scene,camera);camera.userData.renderPressure=true;
for(let i=0;i<40;i++)fx.effect({phase:'blade-net',source:{x:0,y:2,z:0},x:0,z:60,radius:3,level:60,direction:dir});assert(scene.children.length<=12);fx.update(performance.now()+5000);assert.equal(scene.children.length,0);const form=createSwordForm();form.updateMatrixWorld();form.traverse(n=>assert(n.matrixWorld.elements.every(Number.isFinite)));
console.log('PASS: rollback keyboard/server recovery, no-lock cast/cooldown/one-time impact, 50–100m range, net half-second cuts, stacked flight/form, 700ms attacks, empowerment, map cleanup, unconditional guard slash and bounded net visuals.');
