// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const TOWER_WEEK_MS=7*24*60*60*1000;
export const TOWER_KING_SKIN='weekly-tower-king';
// Wednesday 00:00 Asia/Shanghai = Tuesday 16:00 UTC. No daylight-saving shift.
const WEEK_ANCHOR=Date.UTC(2026,8,29,16);
export function towerWeekStart(now:number){return WEEK_ANCHOR+Math.floor((now-WEEK_ANCHOR)/TOWER_WEEK_MS)*TOWER_WEEK_MS}
export type TowerMember={account:string;name:string};
export type TowerResult={runId:string;startedAt:number;finishedAt:number;elapsedMs:number;members:TowerMember[]};
export function towerTeamKey(members:TowerMember[]){return members.map(p=>p.account.toLowerCase()).sort().join('|')}
export function validTowerResult(result:TowerResult,now:number){
  return Boolean(result&&/^[0-9a-f-]{36}$/i.test(result.runId)&&Number.isSafeInteger(result.startedAt)&&Number.isSafeInteger(result.finishedAt)&&Number.isSafeInteger(result.elapsedMs)&&result.elapsedMs>=1000&&result.elapsedMs<=TOWER_WEEK_MS&&result.startedAt<=result.finishedAt&&result.finishedAt<=now+5000&&result.elapsedMs<=result.finishedAt-result.startedAt+1000&&Array.isArray(result.members)&&[1,2].includes(result.members.length)&&result.members.every(m=>m&&typeof m.account==='string'&&/^[-_\p{L}\p{N}]{2,14}$/u.test(m.account)&&typeof m.name==='string'&&Array.from(m.name).length>=2&&Array.from(m.name).length<=14)&&new Set(result.members.map(m=>m.account.toLowerCase())).size===result.members.length);
}
