// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import {build} from 'esbuild';
const b=await build({stdin:{contents:`export {castAncientSkill,tickAncientSkills,ancientAuxShot,selectSkillTarget,skillAreaHits,skillProjectileContact,skillSurfaceContact} from './src/ancient-skill-combat';export {newAncientProfile,blocked,lineClear,ancientMapHeight} from './src/ancient-rules';export {chooseAdvancement} from './src/ancient-advancement-progress';export {PROFESSIONS} from './src/ancient-skills';export {rayAncientHitbox} from './src/ancient-hitboxes';export {SKILL_CONTACT,skillFlight} from './src/ancient-skill-flight';`,resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node'});
const M=await import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));
function fixture(){const p=M.newAncientProfile();p.level=150;p.profession='swordsman';p.skills=Object.fromEntries(M.PROFESSIONS.swordsman.skills.map(id=>[id,8]));p.ascension={jobs:{swordsman:{holy:true}},day:'',attempts:0};assert(M.chooseAdvancement(p,'blademaster'));const a={name:'tester',profession:p.profession,x:0,y:1.7,z:10,hp:10000,maxHp:10000,weapon:p.weapons[0]},hits=[],effects=[],c={map:'tribe',monsters:[],damage(m,v,s,id){hits.push({target:m.id,v,id});m.hp-=v;return v},fx(id,x,z,r,d){effects.push({id,x,z,r,...d})}};const monster=(id,x,z)=>{const m={id,kind:'grox',hp:1e20,maxHp:1e20,x,y:0,z};c.monsters.push(m);return m};const tick=t=>M.tickAncientSkills(a,p,c,.1,t);return{a,p,c,hits,effects,monster,tick};}
const now=100000;
{
 const f=fixture(),m=f.monster('graze',1.1,20);
 assert.equal(M.rayAncientHitbox(f.a,[0,0,1],m,0,30),undefined,'actual weapon body remains narrow');
 assert.equal(M.selectSkillTarget(f.a,[0,0,1],30,f.c),m,'spell aim accepts a modest near miss');
 m.x=1.8;assert.equal(M.selectSkillTarget(f.a,[0,0,1],30,f.c),undefined,'forgiveness is bounded');
 m.x=3.9;m.z=10;assert(M.skillAreaHits({x:0,y:0,z:10},m,3,'tribe'),'area borders include the enemy body and margin');
}
{
 const f=fixture();assert.equal(M.castAncientSkill(f.a,f.p,'advanced:Q',[0,-.3,Math.sqrt(.91)],f.c,now),null);
 for(let t=100;t<=800;t+=100)f.tick(now+t);
 const net=f.a.skillRuntime.advancedSword.nets[0];assert(net,'an empty ground hit opens the net');assert.equal(net.y,0);assert.equal(f.a.skillRuntime.advancedSword.projectiles.length,0);
 const a=f.monster('entrant',net.x+1,net.z+1),b=f.monster('second',net.x-2,net.z),out=f.monster('outside',net.x+9,net.z);
 f.tick(now+1300);assert(f.hits.some(h=>h.target==='entrant'));assert(f.hits.some(h=>h.target==='second'));assert(!f.hits.some(h=>h.target==='outside'));
 a.hp=0;const before=f.hits.filter(h=>h.target==='second').length;f.tick(now+1900);assert(f.hits.filter(h=>h.target==='second').length>before,'net survives the first enemy death');
 const point={x:net.x,z:net.z};b.x+=20;f.tick(now+2500);assert.equal(net.x,point.x);assert.equal(net.z,point.z);const exited=f.hits.length;f.tick(now+3100);assert.equal(f.hits.length,exited,'leaving the plane stops contact damage');
 f.tick(now+6000);assert.equal(f.a.skillRuntime.advancedSword.nets.length,0);
}
{
 const f=fixture();f.monster('first',0,18);f.monster('nearby',3,17);
 assert.equal(M.castAncientSkill(f.a,f.p,'advanced:Q',[0,0,1],f.c,now),null);f.tick(now+250);
 assert(f.a.skillRuntime.advancedSword.nets.length===1);assert(f.hits.some(h=>h.target==='nearby'),'enemy hit opens an AoE, not a single-target attachment');
}
{
 const f=fixture();const m=f.monster('visual-edge',3,19);
 assert.equal(M.castAncientSkill(f.a,f.p,'advanced:Z',[0,0,1],f.c,now),null);
 assert.equal(M.ancientAuxShot(f.a,f.p,[0,0,1],f.c,now+1),null);f.tick(now+180);
 assert(f.hits.some(h=>h.target===m.id),'the visible 2.8m crescent edge is accepted');
}
{
 const f=fixture();let found;
 for(let x=8;x<45&&!found;x++)for(let z=15;z<100&&!found;z+=2){
  if(M.blocked(x,z,.35,'tribe',0)&&!M.blocked(x-7,z,.35,'tribe',0)&&!M.blocked(x+7,z,.35,'tribe',0)&&!M.lineClear(x-7,1.5,z,x+7,1.5,z,'tribe'))found={x,z};
 }
 assert(found,'wall fixture');f.a.x=found.x-7;f.a.z=found.z;f.a.y=1.5;const m=f.monster('behind-wall',found.x+7,found.z);
 assert.equal(M.selectSkillTarget(f.a,[1,0,0],30,f.c),undefined,'larger spell hitbox cannot reach through a wall');
 const surface=M.skillSurfaceContact(f.a,{x:found.x+7,y:1.5,z:found.z},'tribe');assert(surface&&surface.x<m.x,'surface collision stops the flight before the hidden enemy');
}
// Real fallback casts carry their profession's flight geometry and matching collision width.
for(const [job,id] of [['fire','firebolt'],['ice','frostburst'],['lightning','tempest'],['curse','hex']]){
 const f=fixture();f.p.profession=job;f.p.advancements={};f.p.skills={[id]:5};f.a.profession=job;delete f.a.advancement;
 assert.equal(M.castAncientSkill(f.a,f.p,id,[0,0,1],f.c,now),null);
 assert.equal(f.a.skillRuntime.freeProjectiles.length,1);
 const flight=f.effects.find(e=>e.phase==='skill-flight');assert(flight?.flight.shape);assert.equal(flight.flight.color,M.skillFlight(job,job==='lightning'?'X':job==='curse'?'Q':'X').color);
 f.monster('grazing-flight',1.1,16);f.tick(now+200);f.tick(now+700);assert(f.hits.length>0,job+' flight accepts a visible edge contact');
}
// Every profession and slot has a meaningful flight shape. Sword edges and graphics use the same radius.
const shapes=new Set();for(const job of Object.keys(M.PROFESSIONS))for(const key of 'XQZC'){const f=M.skillFlight(job,key);assert(f.shape&&Number.isFinite(f.radius)&&f.radius>0);shapes.add(f.shape);}assert(shapes.size>40);assert.equal(M.skillFlight('swordsman','X').radius,M.SKILL_CONTACT.slashRadius);
const THREE=await import('../public/three.module.js'),{createSkillProjectileFX}=await import('../public/ancient-projectile-fx.js'),{createGroundBladeNet}=await import('../public/ancient-sword-rework-fx.js');
for(const low of [false,true]){const scene=new THREE.Scene(),camera=new THREE.Camera();camera.userData.renderPressure=low;const fx=createSkillProjectileFX(scene,camera);let i=0;for(const job of Object.keys(M.PROFESSIONS))for(const key of 'XQZC'){assert(fx.effect({phase:'skill-flight',flight:M.skillFlight(job,key),projectile:String(i++),source:{x:0,y:2,z:0},direction:[0,0,1],level:60}));scene.updateMatrixWorld();scene.traverse(n=>assert(n.matrixWorld.elements.every(Number.isFinite)));assert(scene.children.length<=(low?14:32));}fx.update(performance.now()+5000);assert.equal(scene.children.length,0);fx.dispose();}
const net=createGroundBladeNet(5);net.updateMatrixWorld();const box=new THREE.Box3().setFromObject(net);assert(box.max.y-box.min.y<.3,'deployed net is a horizontal plane');
console.log('PASS: forgiving spell aim/areas, unchanged weapon bodies, empty-ground and enemy net deployment, multiple/late targets, death and exit behavior, visible crescent contacts, wall occlusion, all profession flight styles, bounded rendering and planar nets.');
