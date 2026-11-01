// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Appended inside the game module only for the CrazyGames release.
const platformModes=new Set(['normal','duel','tri','quad','gunmaster','challenge','ctf','hardpoint','bomb','survival']);
const platformMaps=new Set(['crossroads','depot','arcade','bomb','survival']);
window.__ASTRIFT_CG_JOIN__=async(params,create=false)=>{
  const mode=String(params?.mode||'normal'),code=String(params?.room||'').toUpperCase(),map=String(params?.map||'crossroads');
  if(!platformModes.has(mode)||!(validRoomCode(code)||/^M[a-f0-9]{25}$/i.test(code))||!platformMaps.has(map))return false;
  await cancelQuickDuel();await cancelRankedQueue();
  if(playing)endMatch();
  for(const id of ['roomDialog','normalModePanel','specialModePanel','accountDialog','friendsScreen','forumOverlay'])if($(id))$(id).hidden=true;
  pendingRoomMode=mode;survivalSolo=false;socialInviteMap=map;
  $('room').value=code;$('roomDialog').dataset.mode=create?'create':'join';
  clearPracticeMode();start(true);return true;
};
window.__ASTRIFT_CG_INSTANT__=()=>window.__ASTRIFT_CG_JOIN__({mode:'normal',room:generateRoomCode(),map:'crossroads'},true);
window.__ASTRIFT_CG_STATE__=()=>{
  const capacity={normal:12,duel:2,tri:3,quad:4,gunmaster:2,challenge:2,ctf:12,hardpoint:12,bomb:10,survival:2}[roomMode]||0;
  const count=duelState?.players?.filter(p=>p.team>=0).length??(remotes.size+1);
  const connected=playing&&online&&ws?.readyState===1&&platformModes.has(roomMode);
  return {playing:playing&&!paused&&!duelBlocked()&&hp>0&&!matchFinished,
    room:connected?{roomId:roomMode+':'+activeRoomCode.toUpperCase(),isJoinable:count<capacity&&!matchFinished,
      inviteParams:{room:activeRoomCode.toUpperCase(),mode:roomMode,map:activeMapId}}:null};
};
