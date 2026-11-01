// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const DEVICE_TUTORIAL_KEY='astrift.tutorial.device.v1';
export const ACCOUNT_TUTORIAL_KEY='astrift.tutorial.account.v1';
export function needsTutorial(deviceRecord,accountRecord,accountName){
  if(!deviceRecord?.done)return true;
  return !!accountName&&(!accountRecord?.done||accountRecord.owner?.toLowerCase()!==accountName.toLowerCase());
}
export function tutorialRecord(owner,skipped=false,now=Date.now()){return {version:1,done:true,owner:owner||'guest',skipped,at:now}}
export const PRACTICAL_STEPS=['move','attack','aim','switch','phase','slide','throwable','tactical'];
export function practicalComplete(step,current,before){
  if(step==='move')return Math.hypot(current.x-before.x,current.z-before.z)>=3;
  if(step==='attack')return current.targetHp<before.targetHp;
  if(step==='aim')return current.aim>.65;
  if(step==='switch')return current.slot===1&&current.weapon!==before.weapon;
  if(step==='phase')return current.phaseActive>0&&Math.hypot(current.x-before.x,current.z-before.z)>=4;
  if(step==='slide')return current.sliding;
  if(step==='throwable')return current.throwCharges<before.throwCharges;
  if(step==='tactical')return current.tacticalReady>before.tacticalReady;
  return false;
}
