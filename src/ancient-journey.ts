import {ancientMonsterXP,ancientKillExperience,xpNeeded,type AncientProfile} from './ancient-rules';
import {ancientShopDay} from './ancient-commerce';
import {AUTHORITY_MAPS} from './ancient-authority';
import {ANCIENT_GROWTH} from './ancient-growth';
export type JourneyProgress={day:string;maps:Record<string,{kills:number;claimed?:boolean}>};
export type RecentReward={at:number;map:string;kind:string;drops:Record<string,number>;gear:string[]};
export function rememberReward(p:AncientProfile,map:string,kind:string,drops:Record<string,number>,gear:{key:string}[],now=Date.now()){
 if(!Object.keys(drops).length&&!gear.length)return;
 p.recentRewards=[{at:now,map,kind,drops:{...drops},gear:gear.map(g=>g.key)},...(p.recentRewards||[])].slice(0,20);
}
export const REGION_STORIES:Record<string,[string,string]>={tribe:['守住部落猎道','Secure the tribal hunting path'],forest:['驱散林间侵扰','Repel the woodland incursion'],city:['肃清旧城巡道','Clear the old city patrol route'],blight:['压制蚀影涌动','Contain the blight surge'],sanctum:['净界巡守','Patrol the veil'],starfall:['守护沉星遗迹','Guard the fallen-star ruins'],frostcourt:['平息霜烬暴动','Quell the frostfire unrest'],skyreach:['驱逐雷云侵扰','Disperse the storm incursion'],dunes:['清理暮沙商道','Reopen the duskglass trade route']};
export function regionProgress(p:AncientProfile,now=Date.now()):JourneyProgress{const day=ancientShopDay(now);return p.journey?.day===day?p.journey:{day,maps:{}};}
export function regionKill(p:AncientProfile,map:string,level:number,now=Date.now()){
 if(!AUTHORITY_MAPS.includes(map as typeof AUTHORITY_MAPS[number])||level<Math.max(1,p.level-10))return false;
 p.journey=regionProgress(p,now);const entry=p.journey.maps[map]??={kills:0};entry.kills=Math.min(12,entry.kills+1);return true;
}
export function claimRegion(p:AncientProfile,map:string,now=Date.now()){
 const progress=regionProgress(p,now),entry=progress.maps[map];if(!REGION_STORIES[map]||!entry||entry.kills<12||entry.claimed)return 0;
 // Two ordinary same-level kills, capped at 5% of a level; professions never affect it.
 const xp=Math.max(1,Math.min(Math.floor(xpNeeded(p.level)*.05),ancientKillExperience(ancientMonsterXP('grox',p.level),p.level)*2));entry.claimed=true;p.journey=progress;return xp;
}
export function growthOutlook(p:AncientProfile){const reward=ancientKillExperience(ancientMonsterXP('grox',p.level),p.level);return {remaining:Math.max(0,xpNeeded(p.level)-p.xp),sameLevelKills:Math.ceil(Math.max(0,xpNeeded(p.level)-p.xp)/reward),levelsPerStep:ANCIENT_GROWTH.levelsPerStep,lateMultiplier:ANCIENT_GROWTH.stepMultiplier,anchor:ANCIENT_GROWTH.lateAnchor};}
