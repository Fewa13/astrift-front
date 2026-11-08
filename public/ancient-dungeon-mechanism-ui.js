// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {formatAncientHints,ancientKeyLabel} from './ancient-input-settings.js';
import {towerRunes,towerRuneAligned,TOWER_RUNE_RANGE} from './ancient-dungeon.js';
import {DUNGEON_CONTROLS,dungeonLight} from './ancient-dungeon-mechanisms.js';
export function createDungeonMechanismUI({camera,getRun,getPlayer,en,send,clear}){
 const button=document.createElement('button');button.className='ancientSanctumInteract';button.hidden=true;document.getElementById('ancientHud').append(button);let target=null,last=-Infinity;
 const L=(zh,eng)=>formatAncientHints(en()?eng:zh,en());
 function interact(){const run=getRun();if(button.hidden||button.disabled||!target||!(run?.mechanisms||run?.tower)||getPlayer()?.hp<=0||performance.now()-last<300)return false;last=performance.now();send(run.tower?{type:'towerRune',floor:run.tower.floor,index:target.index}:{type:'dungeonMechanism',id:target.id});return true}button.onclick=interact;
 function update(active,paused){button.hidden=true;target=null;const run=getRun(),s=run?.mechanisms;if(!active||paused||run?.status!=='active'||getPlayer()?.hp<=0)return;
 if(run.tower){
  if(run.tower.nextAt)return;
  let distance=TOWER_RUNE_RANGE;
  towerRunes(run.tower.floor).forEach((rune,index)=>{
   const gap=Math.hypot(camera.position.x-rune.x,camera.position.z-rune.z);
   if(gap<distance){distance=gap;target={...rune,index};}
  });
  if(!target)return;
  button.hidden=false;
  button.disabled=towerRuneAligned(run.tower.runes?.[target.index],target.target);
  button.textContent=button.disabled?L('符文已对齐','Rune aligned'):ancientKeyLabel('KeyF',en())+' · '+L('旋转符文','Rotate rune');
  return;
 }
 if(!s)return;target=DUNGEON_CONTROLS.filter(c=>c.stage===run.stage&&(c.type==='lever'||!s.solved[run.stage])).filter(c=>Math.hypot(camera.position.x-c.x,camera.position.z-c.z)<=4&&clear(camera.position.x,camera.position.y,camera.position.z,c.x,2.7,c.z)).sort((a,b)=>Math.hypot(camera.position.x-a.x,camera.position.z-a.z)-Math.hypot(camera.position.x-b.x,camera.position.z-b.z))[0];if(!target)return;button.hidden=false;button.disabled=target.type==='lever'&&Date.now()<s.leverReady;const label=target.type==='mirror'?L('旋转镜面','Rotate mirror'):target.type==='rune'?L('点亮符文','Touch rune')+' '+['☀','☾','◇'][Number(target.id.slice(-1))]:target.type==='weight'?L('推动石像','Shift stone'):button.disabled?L('拉杆恢复中','Lever resetting')+' '+Math.ceil((s.leverReady-Date.now())/1000)+'s':L('停摆地刺','Disable spikes');button.textContent=ancientKeyLabel('KeyF',en())+' · '+label;if(target.type==='mirror'&&dungeonLight(s).blockedBack===target.id)button.textContent+=' · '+L('镜背挡光','Back facing beam')}
 return {interact,update};
}
