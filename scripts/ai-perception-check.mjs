// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
const source=fs.readFileSync(new URL('../public/game.js',import.meta.url),'utf8');
assert(source.includes('const botLookHelper=new THREE.PerspectiveCamera();'),'Production look-at helper uses -Z');
assert(source.includes("g.rotation.order='YXZ';g.add(pose)"),'Actor yaw works in every quadrant');
function section(start,end){const a=source.indexOf('function '+start+'('),b=source.indexOf('\nfunction '+end+'(',a);assert(a>=0&&b>a);return source.slice(a,b)}
const discover=Function('hasLineOfSight','roomMode','aiDuelLevel',section('botCanDiscover','botPatrolLook')+';return botCanDiscover;')(()=>true,'extraction','advanced');
const helper=new THREE.PerspectiveCamera(),bot=new THREE.Group();bot.rotation.order='YXZ';bot.userData={};
for(let i=0;i<16;i++){
  const angle=i*Math.PI/8,point=new THREE.Vector3(Math.sin(angle)*10,0,Math.cos(angle)*10);helper.lookAt(point);bot.quaternion.copy(helper.quaternion);
  assert(discover(bot,{kind:'player',position:point.clone().setY(1.7)},1000),'Facing must agree in every quadrant '+i);
  assert(!discover(bot,{kind:'player',position:point.clone().multiplyScalar(-1).setY(1.7)},1000),'Behind must not be detected '+i);
}
helper.lookAt(0,0,-1);bot.quaternion.copy(helper.quaternion);
assert(!discover(bot,{kind:'player',position:new THREE.Vector3(0,1.7,1)},1000),'No point-blank rear spider sense');
const noSight=Function('hasLineOfSight','roomMode','aiDuelLevel',section('botCanDiscover','botPatrolLook')+';return botCanDiscover;')(()=>false,'extraction','advanced');
assert(!noSight(bot,{kind:'player',position:new THREE.Vector3(0,1.7,-1)},1000),'Close walls block detection');
const patrol=Function('THREE',section('botPatrolLook','duelAwareness')+';return botPatrolLook;')(THREE),goal=new THREE.Vector3(0,0,-20);bot.userData={patrolScanAt:0};
let angles=[];for(const now of [0,2600,5200]){const point=patrol(bot,goal,now);angles.push(Math.atan2(point.x,-point.z))}
assert(angles[0]*angles[1]<0&&Math.abs(angles[0])>1&&Math.abs(angles[1])>1&&Math.abs(angles[2])>3,'Independent left/right/rear scanning');
const awarenessSource=section('duelAwareness','duelCoverGoal'),awareness=Function('THREE','roomMode','aiDuelLevel','botCanDiscover','blocked','healPoint',awarenessSource+';return duelAwareness;')(THREE,'extraction','advanced',discover,()=>false,{x:0,z:0});
bot.userData={extractionProfile:'normal'};let target={kind:'player',position:new THREE.Vector3(0,1.7,-2)};
assert(awareness(bot,target,1000).visible);assert.equal(bot.userData.sightReadyAt,1040,'Close encounter only 40ms reaction');
awareness(bot,target,1020);assert.equal(bot.userData.sightReadyAt,1040,'Reaction is not delayed every frame');
for(const [profile,delay] of [['normal',140],['advancedPlus',90],['masterTop',55]]){bot.userData={extractionProfile:profile};target.position.z=-20;assert(awareness(bot,target,2000).visible);assert.equal(bot.userData.sightReadyAt,2000+delay)}
bot.userData={blindUntil:5000};assert(!discover(bot,target,4000),'Blind AI cannot acquire new targets');
console.log('PASS: 16 facing directions, no rear/wall detection, independent patrol scans, 40ms close reaction, stable deadlines, profile delays and blindness');
