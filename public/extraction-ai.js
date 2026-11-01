// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {value,addItems} from './extraction-inventory.js?v=20261008-7';
import {extractionRole} from './extraction-design.js?v=20261014-raid-1';
// AI use the same bag capacity, stack rules and actual ground containers as players.
export function updateExtractionLoot(bot,markers,now,exit){
  const s=bot.userData;if(s.extracted||!bot.visible)return;
  s.extractionRole??=extractionRole(s.extractionIndex||0);
  if(s.targetVisible){s.lootGoal=null;s.lootSearchUntil=0;return}
  if(s.lastSeenPosition&&now-(s.lastSeenAt||0)<4500){s.lootSearchUntil=0;return}
  if(s.signalGoal&&now<s.signalUntil){s.lootGoal=null;s.lootSearchUntil=0;s.wander.copy(s.signalGoal);return}
  if(!s.lootGoal||!s.lootGoal.exit&&!s.lootGoal.items.length||now>(s.lootNextAt||0)){
    const elapsed=now-s.raidStarted,bagValue=s.extractionBag.reduce((n,i)=>n+value(i),0),leave=s.extractionReserve+s.ammoLeft<=0||s.extractionBag.length>=17||elapsed>300000||elapsed>90000&&bagValue>1600;
    const score=m=>bot.position.distanceToSquared(m.mesh.position)*(s.extractionRole==='raider'&&m.containerType==='safe'?.55:s.extractionRole==='scavenger'&&m.containerType==='tools'?.8:1)+(Number(String(m.id).replace(/\D/g,''))%4===(s.extractionIndex||0)%4?0:240);
    s.lootGoal=leave?{exit:true,position:exit}:markers.filter(m=>m.items.length&&!m.exit).reduce((best,m)=>!best||score(m)<score(best)?m:best,null);s.lootNextAt=now+5000;
  }
  const goal=s.lootGoal;if(!goal)return;s.wander.copy(goal.exit?goal.position:goal.mesh.position);s.wander.y=0;
  if(bot.position.distanceTo(s.wander)>(goal.exit?3:2))return;
  if(goal.exit){s.extracted=true;bot.visible=false;return}
  if(!s.lootSearchUntil){s.lootSearchUntil=now+1200;return}if(now<s.lootSearchUntil)return;s.lootSearchUntil=0;
  let changed=false;
  for(const i of [...goal.items]){
    let old=null;if(s.extractionBag.length>=20){old=s.extractionBag.reduce((a,b)=>value(a)<value(b)?a:b);if(value(old)>=value(i))continue;s.extractionBag.splice(s.extractionBag.indexOf(old),1)}
    try{addItems(s.extractionBag,[i],20);goal.items.splice(goal.items.indexOf(i),1);if(old)goal.items.push(old);changed=true}catch{if(old)s.extractionBag.push(old)}
  }
  if(changed)goal.searched=true;s.lootGoal=null;s.lootNextAt=now+1000;return changed;
}
