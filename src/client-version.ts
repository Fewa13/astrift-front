// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {CLIENT_RELEASE} from './client-release';

export const CLIENT_OUTDATED={ok:false,code:'CLIENT_UPDATE_REQUIRED',error:'游戏版本已更新，请刷新页面后再试。 / Game updated. Refresh the page to continue.'} as const;
export const currentClient=(version:unknown)=>version===CLIENT_RELEASE;
export const clientVersionResponse=()=>Response.json(CLIENT_OUTDATED,{status:409,headers:{'Cache-Control':'no-store'}});

// Reads, chat, cleanup and routine combat stay available until a protected operation is attempted.
const ancientUnversioned=new Set([
 'profile','leaveWorld','onlinePlayers','levelLeaderboard','dailyLeaderboard','tradeState','tradeCancel',
 'mailList','mailRead','researchList','dailyShopList','roughShopList','roughShopProbe',
 'marketList','marketInspect','marketRoughInventory','marketRoughProbe','collectionList','stoneList','stoneProbe',
 'communityAccess','communityGet','communityList','communityModelList','communityModelGet','communityEditorSync',
 'friendState','friendMessages','friendRead','friendSend','partyState','dungeonState','trialState','trialInput','trialLeave',
 'usePotion','useSupply','useBossCard','useLeisureFood','attack',
]);
const accountProtected=new Set(['socket-ticket','season-claim','knife-draw','knife-redeem','email/claim','save']);
export function requiresClientVersion(path:string,action:string){
 if(path==='/api/ancient/profile')return !ancientUnversioned.has(action||'profile');
 if(path==='/api/extraction/squad')return !['state','leave','unready'].includes(action);
 if(path.startsWith('/api/account/'))return accountProtected.has(path.slice('/api/account/'.length));
 if(path==='/api/ranked/result')return true;
 return path==='/api/matchmaking/ranked'&&['join','finishAi'].includes(action);
}
const worldProtected=new Set(['communityAction','chapterFeature','dungeonMechanism','rotateMirror','absorbCrystal','blightDefend','mapInteract','branchMentor','questTalk','questAccept']);
export const worldActionRequiresVersion=(type:unknown,action:unknown)=>
 typeof type==='string'&&(worldProtected.has(type)||type==='communityUI'&&(action==='click'||action==='input'));
