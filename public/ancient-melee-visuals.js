// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {clearAncientRemotePotion} from './ancient-potion-visuals.js';
import * as THREE from './three.module.js';
import {PROFESSION_LOOKS} from './ancient-profession-models.js?v=20261014-new-professions-1';
import {createAncientWeaponModel,releaseAncientWeaponModel} from './ancient-weapon-models.js?v=20261018-cast-hands-1';
import {equippedGear} from './ancient-gear.js?v=20261021-skyreach-market-1';
import {castGestureProfile,castGesturePhase} from './ancient-cast-gestures.js?v=20261018-cast-hands-1';
import {activeSkill} from './ancient-skills.js?v=20261021-skyreach-market-1';
const colors=[0x9bafa8,0x5bb8df,0xac75ec,0xffca5b,0xee6b99,0xe7f9ff,0x8ebeff,0xe9a0ff];
export function clearAncientRemoteGear(mesh){clearAncientRemotePotion(mesh);for(const old of [mesh.userData.gearMesh,mesh.userData.remoteWeapon])if(old){old.removeFromParent();old.traverse(o=>{if(o.userData.sharedWeaponResource){o.userData.corruptMaterial?.dispose();return;}o.geometry?.dispose();if(o.material){if(o.userData.normalMaterial&&o.userData.normalMaterial!==o.material)o.userData.normalMaterial.dispose();o.material.dispose()}})}delete mesh.userData.remoteWeapon;delete mesh.userData.gearMesh;delete mesh.userData.gearKey}
export function updateAncientRemoteMelee(mesh,attackAt,now=Date.now()){const weapon=mesh.userData.remoteWeapon;if(!weapon)return;const t=(now-(attackAt||0))/480,ease=v=>v*v*(3-2*v);let roll=0;if(t>=0&&t<1)roll=t<.5?1.35*ease(t/.5):1.35*(1-ease((t-.5)/.5));weapon.rotation.set(-.4-Math.max(0,Math.sin(Math.min(1,Math.max(0,t))*Math.PI))*.4,0,roll)}
export function createAncientMeleeVisuals(camera){
 const group=new THREE.Group();camera.add(group);group.visible=false;
 const wrist=new THREE.Group();wrist.name='melee-wrist';group.add(wrist);
 const bracerMat=new THREE.MeshStandardMaterial({color:0x52695f,metalness:.55,roughness:.45}),gloveMat=new THREE.MeshStandardMaterial({color:0x29332f,roughness:.85});
 const bracer=new THREE.Mesh(new THREE.CylinderGeometry(.065,.083,.25,10),bracerMat);bracer.position.set(0,-.26,.075);bracer.rotation.x=.32;group.add(bracer);
 const palm=new THREE.Mesh(new THREE.BoxGeometry(.115,.14,.08),gloveMat);palm.position.set(0,-.10,.035);wrist.add(palm);
 const knuckles=new THREE.Mesh(new THREE.BoxGeometry(.12,.055,.025),bracerMat);knuckles.position.set(0,-.075,.086);wrist.add(knuckles);
 let swing=0,swingDuration=.48,lastKey='',sword=null,casting=null;
 function update(p,a,time,dt,suppressed=false){
  const d=p&&equippedGear(p,'weapon');group.visible=!suppressed&&!!d&&!!a&&a.hp>0&&!activeSkill(a,'transform')&&(a.skillRuntime?.mode||1)===1;if(!group.visible)return;
  const look=PROFESSION_LOOKS[p.profession]||PROFESSION_LOOKS.adventurer;bracerMat.color.set(p.corrupted?0x333039:look.metal);bracerMat.emissive.set(look.glow);bracerMat.emissiveIntensity=.08;
  const item=p.gear?.find(i=>i.id===p.gearEquipped?.weapon),key=item?.key||'';
  if(key!==lastKey){lastKey=key;releaseAncientWeaponModel(sword);sword=createAncientWeaponModel(key);if(sword){sword.scale.setScalar(.8);sword.position.y=.01;wrist.add(sword);}}
  swing=Math.max(0,swing-dt);const progress=1-swing/swingDuration,ease=t=>t*t*(3-2*t);let roll=0;
  if(swing>0)roll=progress<.5?1.35*ease(progress/.5):1.35*(1-ease((progress-.5)/.5));
  const drive=Math.sin(progress*Math.PI)*(swing>0?1:0);group.position.set(.46-drive*.055,-.29+drive*.025,-.98-drive*.045);group.rotation.set(-.25,-.18,-.12);wrist.rotation.set(-drive*.18,drive*.12,roll);if(sword)sword.position.y=.01+Math.sin(time*.003)*.003;
  if(casting){const t=castGesturePhase(casting,time);if(t>=1)casting=null;else{const kind=castGestureProfile(casting.id)[0],w=Math.sin(t*Math.PI);if(kind==='triple')wrist.rotation.z=Math.sin(t*Math.PI*6)*.8*w;else if(kind==='greatblade'){group.position.y+=.13*w;wrist.rotation.x-=.55*w;wrist.rotation.z+=1.5*Math.sin(Math.max(0,t-.35)/.65*Math.PI)*w;}else wrist.rotation.z+=1.5*Math.sin(t*Math.PI);}}
 }
 return {update,cast(id){const p=castGestureProfile(id);casting=p&&['blade','triple','greatblade'].includes(p[0])?{id,at:performance.now()}:null;},attack(interval=600){casting=null;swingDuration=Math.max(.16,Math.min(.48,interval/1000*.85));swing=swingDuration},clear(){casting=null;swing=0;group.visible=false}};
}
export function attachAncientRemoteGear(mesh,keys){if(mesh.userData.gearKey===JSON.stringify(keys||{}))return;clearAncientRemoteGear(mesh);mesh.userData.gearKey=JSON.stringify(keys||{});const group=new THREE.Group();(mesh.userData.body||mesh).add(group);mesh.userData.gearMesh=group;const add=(geo,slot,x,y,z)=>{if(!keys?.[slot]){geo.dispose();return;}const q=Number(keys[slot].match(/\d$/)?.[0])||2,m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:colors[q-1],metalness:.55,roughness:.4}));m.position.set(x,y,z);group.add(m);return m};if(mesh.userData.sharedProfessionModel){add(new THREE.OctahedronGeometry(.045),'helmet',0,1.92,-.245);add(new THREE.BoxGeometry(.095,.12,.022),'armor',-.18,1.28,-.268)}else{add(new THREE.SphereGeometry(.2,10,6),'helmet',0,1.65,0)?.scale.set(1,.75,1);add(new THREE.BoxGeometry(.60,.69,.38),'armor',0,1.1,0)}for(const side of [-1,1]){const w=add(new THREE.BoxGeometry(.7,.65,.035),'wings',side*.48,1.1,.23);if(w)w.rotation.z=side*.38}if(keys?.weapon){const weapon=createAncientWeaponModel(keys.weapon);if(weapon){const held=new THREE.Group(),arm=mesh.userData.arms?.[1];(arm||mesh.userData.body||mesh).add(held);held.position.set(arm?0:.38,arm?-.55:.8,arm?-.1:-.2);held.rotation.x=-.4;held.add(weapon);mesh.userData.remoteWeapon=held;}}return group;}
