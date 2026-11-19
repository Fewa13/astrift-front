import {createSwordForm,createSwordReworkFX} from './ancient-sword-rework-fx.js';
import {skeletonFormation} from './ancient-mastery.js';
import {flyingSwordGeometry,flyingSwordMaterial} from './ancient-flying-sword.js';
import {createAdvancementSummon,animateAdvancementSummon} from './ancient-advancement-summons.js';
// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {createAdvancementFX} from './ancient-advancement-fx.js';
import * as THREE from './three.module.js';
import {releaseAncientInstances} from './ancient-model-cleanup.js?v=20261013-regression-fixes-1';
import {attachHolyRegalia} from './ancient-holy-model.js?v=20261024-elemental-body-1';
import {createAncientMagicFX} from './ancient-magic-fx.js?v=20261015-budget-1';
import {createAncientBeast,animateCreature} from './ancient-scene.js?v=20261021-skyreach-market-1';
import {bossFormStats} from './ancient-boss-cards.js?v=20261012-spell-flourish-1'; import {activeSkill} from './ancient-skills.js?v=20261021-skyreach-market-1';
export function createAncientSkillVisuals(scene,camera,gunGroup,resolveOwner){
 const magic=createAncientMagicFX(scene,resolveOwner,camera);
 const advancement=createAdvancementFX(scene,camera),swords=createSwordReworkFX(scene,camera);
 function effect(d,ground){if(document.hidden)return;if(swords.effect(d))return;if(d.id.startsWith('linebreaker-')&&!['linebreaker-guard'].includes(d.id)){magic.effect({...d,id:d.id==='linebreaker-triple'?'triplecut':d.id==='linebreaker-break'?'phantomblade':'swordwave'},ground);}if(!advancement.effect(d,ground))magic.effect(d,ground)}
 const pets=new Map(),special=new THREE.Group();camera.add(special);special.visible=false;const claws=new THREE.Group(),tool=new THREE.Group();special.add(claws,tool);const metal=new THREE.MeshStandardMaterial({color:0x8096a0,metalness:.8,roughness:.3}),skin=new THREE.MeshStandardMaterial({color:0x38483f,roughness:.8}),rune=new THREE.MeshBasicMaterial({color:0x72eecc});const geo=new THREE.ConeGeometry(.025,.3,6),palmGeo=new THREE.SphereGeometry(.12,10,8);for(const side of [-1,1]){const hand=new THREE.Group();hand.position.set(side*.34,-.25,-.55);claws.add(hand);const palm=new THREE.Mesh(palmGeo,skin);palm.scale.set(1,1.2,.65);hand.add(palm);for(let i=0;i<3;i++){const claw=new THREE.Mesh(geo,metal);claw.rotation.x=-Math.PI/2;claw.position.set((i-1)*.07,.025,-.2);hand.add(claw)}}const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.025,.04,.5,10),metal);barrel.rotation.x=0;barrel.position.set(.26,-.25,-.65);tool.add(barrel);const sigil=new THREE.Mesh(new THREE.TorusGeometry(.1,.015,6,18),rune);sigil.position.set(.26,.01,-.65);tool.add(sigil);const handle=new THREE.Mesh(new THREE.BoxGeometry(.12,.18,.16),metal);handle.position.set(.26,-.3,-.45);tool.add(handle);let swing=0;
 const barGeometry=new THREE.PlaneGeometry(.72,.075);
 const barBackground=new THREE.MeshBasicMaterial({color:0x152920});
 const barHealth=new THREE.MeshBasicMaterial({color:0x83e669});
 function skeletonHealthBar(){
  const group=new THREE.Group(),background=new THREE.Mesh(barGeometry,barBackground),fill=new THREE.Mesh(barGeometry,barHealth);
  group.position.y=2.1;
  fill.position.z=.01;
  group.add(background,fill);
  return {group,fill};
 }
 const cohortMaterial=new THREE.MeshLambertMaterial({color:0xc5bea1});
 function cohortGeometry(detail){
  const parts=[
   new THREE.IcosahedronGeometry(.18,0).translate(0,.67,0),
   new THREE.BoxGeometry(.27,.38,.17).translate(0,.26,0),
   ...[-1,1].flatMap(side=>[
    new THREE.BoxGeometry(.085,.55,.09).translate(side*.23,.12,0),
    new THREE.BoxGeometry(.105,.65,.11).translate(side*.105,-.37,0),
   ]),
  ];
  if(detail){
   for(const y of [.15,.28,.41])parts.push(new THREE.BoxGeometry(.36,.048,.23).translate(0,y,0));
   parts.push(new THREE.BoxGeometry(.055,.42,.08).rotateZ(-.3).translate(.29,-.24,0));
  }
  const positions=[],normals=[];
  for(const part of parts){
   const mesh=part.index?part.toNonIndexed():part;
   positions.push(...mesh.attributes.position.array);
   normals.push(...mesh.attributes.normal.array);
   if(mesh!==part)mesh.dispose();
   part.dispose();
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
  return geometry;
 }
 const cohortGeometries=[cohortGeometry(true),cohortGeometry(false)];
 const cohorts=cohortGeometries.map(()=>null);
 const cohortPose=new THREE.Object3D();
 let cohortFrame=-Infinity;
 function updateCohorts(list,ground,time){
  if(time-cohortFrame<33)return;
  cohortFrame=time;
  const groups=[[],[]];
  for(const p of list||[]){
   if(p.model!=='skeleton'||p.hp<=0||p.count<=1)continue;
   const actor=pets.get(p.id||p.owner);
   if(!actor)continue;
   const position=actor.mesh.position;
   groups[camera.position.distanceToSquared(position)<900?0:1].push({p,position});
  }
  groups.forEach((group,lod)=>{
   const count=group.reduce((sum,{p})=>sum+p.count-1,0);
   let batch=cohorts[lod];
   if(!count){if(batch)batch.count=0;return;}
   if(!batch||batch.instanceMatrix.count<count){
    if(batch){scene.remove(batch);batch.dispose();}
    batch=new THREE.InstancedMesh(cohortGeometries[lod],cohortMaterial,2**Math.ceil(Math.log2(count)));
    batch.frustumCulled=false;
    scene.add(batch);
    cohorts[lod]=batch;
   }
   let slot=0;
   for(const {p,position} of group)for(let i=1;i<p.count;i++){
    const offset=skeletonFormation(i);
    const sway=lod?0:Math.sin(time*.008+i)*.065;
    cohortPose.position.set(position.x+offset.x,ground(position.x+offset.x,position.z+offset.z)+.83+sway,position.z+offset.z);
    cohortPose.rotation.set(0,i, sway);
    cohortPose.updateMatrix();
    batch.setMatrixAt(slot++,cohortPose.matrix);
   }
   batch.count=slot;
   batch.instanceMatrix.needsUpdate=true;
  });
 }
 function updatePet(list,ground,time,dt){const seen=new Set();for(const p of list||[]){const id=p.id||p.owner;seen.add(id);let a=pets.get(id);if(a&&a.model!==p.model){releaseAncientInstances(a.mesh);a=undefined;}if(!a){const mesh=p.model==='spirit'||p.model==='skeleton'?createAdvancementSummon(p.model):createAncientBeast();if(p.holy&&p.model!=='spirit')attachHolyRegalia(mesh,'summoner');scene.add(mesh);a={model:p.model,mesh,target:new THREE.Vector3(p.x,ground(p.x,p.z),p.z)};mesh.position.copy(a.target);if(p.model==='skeleton'){a.health=skeletonHealthBar();mesh.add(a.health.group);}pets.set(id,a)}a.mesh.visible=p.hp>0;if(p.model==='skeleton')a.mesh.scale.setScalar(p.scale||1);a.target.set(p.x,ground(p.x,p.z),p.z);const moving=a.mesh.position.distanceToSquared(a.target)>.02;if(moving)a.mesh.rotation.y=Math.atan2(a.mesh.position.x-p.x,a.mesh.position.z-p.z);a.mesh.position.lerp(a.target,1-Math.exp(-dt*12));if(a.health){const ratio=Math.max(0,Math.min(1,p.hp/Math.max(1,p.maxHp||p.hp)));a.health.fill.scale.x=ratio;a.health.fill.position.x=(ratio-1)*.36;a.health.group.rotation.set(0,-a.mesh.rotation.y+camera.rotation.y,0);}if(!animateAdvancementSummon(a.mesh,moving,Date.now()-p.attackAt+1000<400,time))animateCreature(a.mesh,{action:moving?'walk':Date.now()-p.attackAt+1000<400?'attack':'idle',hp:p.hp,actionAt:p.attackAt-1000},time,dt)}for(const [id,a]of pets)if(!seen.has(id)){releaseAncientInstances(a.mesh);pets.delete(id)}updateCohorts(list,ground,time)}
 const rideSword=new THREE.Mesh(flyingSwordGeometry,flyingSwordMaterial);
 rideSword.visible=false;scene.add(rideSword);
 const formSword=createSwordForm();camera.add(formSword);formSword.position.set(0,-1.1,-1.15);formSword.scale.setScalar(.65);formSword.visible=false;
 function update(a,time,dt,suppressHands=false){formSword.visible=!!a&&a.hp>0&&!!activeSkill(a,"swordForm");rideSword.visible=!!a&&a.hp>0&&a.advancement==='blademaster'&&!activeSkill(a,'swordForm')&&(a.skillRuntime?.advancedSword?.flightUntil||0)>Date.now();if(rideSword.visible){rideSword.position.copy(camera.position);rideSword.position.y-=1.76;rideSword.rotation.set(Math.PI/2,0,0);rideSword.rotateZ(camera.rotation.y);rideSword.scale.set(.95,1.15,1);}const boss=bossFormStats(a||{}),form=activeSkill(a||{},'transform'),mode=a?.skillRuntime?.mode||1;special.visible=!activeSkill(a||{},'swordForm')&&!suppressHands&&!!a&&a.hp>0&&(form>0||!!boss||mode!==1);claws.visible=form>0||!!boss&&mode===1;tool.visible=!form&&mode!==1;skin.color.set(boss?boss.color:0x38483f);metal.emissive.set(boss?boss.color:0x000000);metal.emissiveIntensity=boss?.35:0;gunGroup.visible=!!a&&a.hp>0&&!special.visible;swing=Math.max(0,swing-dt);const phase=swing/.4;claws.rotation.y=Math.sin(phase*Math.PI)*.65;claws.position.z=-Math.sin(phase*Math.PI)*.3;tool.position.z=Math.sin(phase*Math.PI)*.05;sigil.rotation.z=time*.003;rune.color.set(mode===2&&a?.skillRuntime?.summon?0x62ead8:0xc97de9)}
 function updateMagic(time,dt){magic.update(time,dt);advancement.update(time);swords.update(time)}
 return {createSwordForm,update,updatePet,effect,updateMagic,clearMagic(){magic.clear();advancement.clear();swords.clear()},attack(){swing=.4},clear(){for(const a of pets.values())releaseAncientInstances(a.mesh);pets.clear();for(const batch of cohorts)if(batch)batch.count=0;cohortFrame=-Infinity;magic.clear();advancement.clear();swords.clear();special.visible=false;rideSword.visible=false;formSword.visible=false;}};
}
