// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Platform-only bootstrap. This file is copied into CrazyGames builds, never public/.
(() => {
  const config=window.__ASTRIFT_CRAZYGAMES_CONFIG__;
  if(!config)throw new Error('Missing CrazyGames build configuration');
  const backend=new URL(config.backendOrigin);
  window.__ASTRIFT_API_ORIGIN__=backend.origin;
  const nativeFetch=window.fetch.bind(window);
  window.fetch=(input,init)=>{
    if(typeof input==='string'&&input.startsWith('/api/'))input=backend.origin+input;
    return nativeFetch(input,init);
  };
  const NativeWebSocket=window.WebSocket;
  class PlatformWebSocket extends NativeWebSocket {
    constructor(input,protocols){
      const url=new URL(input,location.href);
      if(url.pathname.startsWith('/api/')){url.host=backend.host;url.protocol=backend.protocol==='https:'?'wss:':'ws:'}
      super(url.href,protocols);
    }
  }
  window.WebSocket=PlatformWebSocket;
  try{if(!localStorage.getItem('astrift.language.v1'))localStorage.setItem('astrift.language.v1',config.defaultLanguage)}catch{}
  // No beforeunload prompt or service worker in the hosted platform build.
  // They interfere with the portal's iframe lifecycle and asset updates.
  let sdk=null,started=false,loading=false,roomSerial='',pendingJoin=null,initialJoinHandled=false;
  const settings={muteAudio:false,disableChat:false};
  window.__ASTRIFT_CG_SETTINGS__=settings;
  const applySettings=value=>{
    settings.muteAudio=Boolean(value?.muteAudio);settings.disableChat=Boolean(value?.disableChat);
    window.__ASTRIFT_CG_APPLY_SETTINGS__?.(settings);
  };
  const call=method=>{try{sdk?.game[method]()}catch(error){console.warn('[CrazyGames]',method,error)}};
  const update=()=>{
    if(!sdk)return;
    const state=window.__ASTRIFT_CG_STATE__?.();
    if(!state)return;
    window.__ASTRIFT_CG_APPLY_SETTINGS__?.(settings);
    if(!initialJoinHandled&&window.__ASTRIFT_CG_JOIN__){
      initialJoinHandled=true;
      if(pendingJoin)void window.__ASTRIFT_CG_JOIN__(pendingJoin).catch(error=>console.warn('[CrazyGames] invite failed',error));
      else if(sdk.game.isInstantMultiplayer)void window.__ASTRIFT_CG_INSTANT__().catch(error=>console.warn('[CrazyGames] instant room failed',error));
    }
    const serial=JSON.stringify(state.room||null);
    if(serial!==roomSerial){try{if(state.room)sdk.game.updateRoom(state.room);else if(roomSerial&&roomSerial!=='null')sdk.game.leftRoom();roomSerial=serial}catch(error){console.warn('[CrazyGames] room update failed',error)}}
    if(loading){call('loadingStop');loading=false}
    if(Boolean(state.playing)===started)return;
    started=Boolean(state.playing);call(started?'gameplayStart':'gameplayStop');
  };
  if(config.sdkEnabled){
    const script=document.createElement('script');script.src='https://sdk.crazygames.com/crazygames-sdk-v3.js';script.async=true;
    script.onload=async()=>{try{
      const candidate=window.CrazyGames?.SDK;if(!candidate)return;
      await candidate.init();if(!['local','crazygames'].includes(candidate.environment))return;
      sdk=candidate;pendingJoin=sdk.game.inviteParams;
      sdk.game.addJoinRoomListener?.(params=>{if(window.__ASTRIFT_CG_JOIN__)void window.__ASTRIFT_CG_JOIN__(params).catch(error=>console.warn('[CrazyGames] invite failed',error));else pendingJoin=params});
      applySettings(sdk.game.settings);sdk.game.addSettingsChangeListener?.(applySettings);call('loadingStart');loading=true;update();
      setInterval(update,250);
    }catch(error){console.warn('[CrazyGames] SDK initialization failed; local gameplay remains available',error)}};
    script.onerror=()=>console.warn('[CrazyGames] SDK unavailable; local gameplay remains available');document.head.append(script);
  }
})();
