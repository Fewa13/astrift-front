// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const CACHE_NAME='astrift-offline-20261108-puzzle-room-3';
const ASSETS=['/ancient-puzzle-ui.js','/ancient-puzzle-map.js','/ancient-gear-workshop.js','/client-version.js',
 '/ancient-community-optics.js',
 '/ancient-community-amenities.js','/ancient-community-uses.js','/ancient-amenity-defs.js',
 '/ancient-community-gameplay.js','/ancient-map-gameplay.js','/ancient-community-script-ui.js','/codehelp.html','/codehelp.js','/codehelp-data.js','/codehelp.css',
 '/ancient-geography.js','/ancient-chapter-worlds.js','/ancient-chapter-features.js','/ancient-chapter-feature-ui.js','/ancient-dunes.js','/ancient-dunes-quests.js','/ancient-dunes-creatures.js',
 '/account-auth-panel.js','/account-auth-panel.css',
 '/ancient-map-expressions.js',
 '/ancient-community-expansion.js','/ancient-community-furniture.js','/ancient-community-catalog.js','/ancient-community-editor.js','/ancient-community-creation.js','/ancient-community-editor.css','/ancient-community-models.js','/ancient-community-hulls.js','/ancient-community.js','/ancient-community-ui.js','/ancient-community-scene.js','/account-page-lease.js','/ancient-potion-visuals.js','/ancient-potion-drink.js',
 '/mailbox-view.js',
 '/official-announcements.js',
 '/network-diagnostics.js',
 '/account-email-ui.js',
 '/ancient-combat-notices.js','/ancient-notice-themes.js','/ancient-quest-location.js',
 '/ancient-combat-clock.js','/ancient-equipment-compare.js',
 '/ancient-input-settings.js','/ancient-screen-layout.js','/ancient-controls.css',
 '/ancient-daily-shop-ui.js','/ancient-book-sale-ui.js',
 '/ancient-rough-shop-ui.js','/ancient-rough-preview.js',
 '/ancient-forced-motion.js','/ancient-projectile-model.js',
 '/ancient-skyreach.js','/ancient-skyreach-quests.js','/ancient-skyreach-scene.js','/ancient-market-rules.js','/ancient-market-gear-preview.js',
 '/ancient-jade-wear.js','/ancient-jade-wear-visuals.js',
 '/ancient-workshop-collections.js',
 '/ancient-stonework-layout.js',
 '/ancient-api.js',
 '/ancient-frostcourt.js','/ancient-frostcourt-quests.js','/ancient-frostcourt-scene.js',
 '/ancient-collection-weave.js','/ancient-market-ui.js','/ancient-market.css','/ancient-collections.js','/ancient-collections-ui.js','/ancient-collection-model.js','/ancient-collection-display.js','/ancient-collection-label.js',
 '/ancient-jade-adapter.js','/ancient-jade-workshop.js','/ancient-jade-geometry.js','/ancient-jade-core.js','/ancient-stonework.css','/ancient-stone-report.js','/ancient-jade-craft-ui.js',
 '/world-entry.css','/world-entry-fps.webp','/world-entry-ancient.webp',
 '/ancient-cast-gestures.js',
 '/ancient-weapon-models.js','/ancient-melee-visuals.js',
 '/ancient-mining-motion.js',
 '/ancient-leaderboard-ui.js',
 '/ancient-branches.js','/ancient-branch-ui.js',
 '/ancient-hunts.js','/ancient-hunts-ui.js',
 '/ancient-fishing-visuals.js',
 '/ancient-growth-ui.js','/ancient-growth-hud.js',
 '/ancient-research-ui.js','/ancient-trials-ui.js','/ancient-trial-rules.js','/ancient-activity-scene.js','/ancient-activities.css','/ancient-trial-badge.js','/ancient-skill-coach.css',
 '/fps-actor-model.js',
 '/adaptive-render.js',
 '/ancient-player-label.js',
 '/ancient-mail-ui.js',
 '/ancient-starfall.js','/ancient-starfall-quests.js','/ancient-starfall-scene.js',
 '/world-shell.html','/world-shell.js','/ancient-leisure.js','/ancient-leisure-ui.js','/ancient-stonework.js','/ancient-stonework-ui.js','/ancient-stonework-preview.js','/ancient-stone-material.js','/ancient-stone-cut-geometry.js','/ancient-fish-codex.js',
 '/world-navigation.js',
 '/ancient-friends-ui.js','/ancient-friends.css','/ancient-inventory-ui.js','/ancient-inventory.css','/ancient-connection.js',
 '/ancient-bestiary.js','/ancient-bestiary-quests.js','/ancient-bestiary-models.js','/ancient-bestiary-fx.js',
  '/ancient-sanctum.js','/ancient-sanctum-quests.js','/ancient-sanctum-scene.js','/ancient-sanctum-ui.js','/ancient-sanctum.css',
  '/ancient-blight.js','/ancient-blight-quests.js','/ancient-blight-scene.js','/ancient-blight-ui.js','/ancient-blight.css',
  '/ancient-environment-detail.js',
  '/ancient-profession-models.js','/ancient-expansion-fx.js',
  '/ancient-trade-ui.js',
  '/ancient-optics.js','/ancient-dungeon-mechanisms.js','/ancient-dungeon-mechanism-scene.js','/ancient-dungeon-mechanism-ui.js','/ancient-dungeon.js','/ancient-dungeon-scene.js','/ancient-dungeon-ui.js',
  '/ancient-mob-stats.js','/ancient-boss-stats.js','/world-menu.js','/ancient.css','/ancient-menu.css',
  '/tutorial.js','/tutorial-state.js','/tutorial-world.js',
  '/extraction.js','/extraction-design.js','/extraction-presentation.js','/extraction-refine.css','/extraction-economy.js','/extraction-world.js','/extraction-inventory.js','/extraction-ai.js','/ranked-rules.js','/extraction.css',
  '/i18n.js','/language-catalog.js','/language-overrides.js','/language.css',
  '/look-sensitivity.js',
  '/mobile-controls.js','/mobile-controls.css',
  '/knife-combat.js',
  '/knife-detail.js',
  '/knife-forms.js',
  "/survival-leaderboard.js", "/survival-leaderboard.css",
  "/tower-survival.js", "/tower-survival.css", "/survival-rules.js",
  '/','/index.html','/forum.html',
  '/style.css','/tutorial.css','/rooms.css','/menu-groups.css','/menu-navigation.css',
  '/armory.css','/armory-viewport.css','/crosshair.css','/equipment.css','/headshot.css',
  '/weapon-slots.css','/gale-d7.css','/loadout-fix.css','/reticle-alignment.css',
  '/weapon-viewmodel.css','/performance.css','/duel.css','/arena-modes.css',
  '/kill-toast.css','/heal-point.css','/supply.css','/practice-range.css',
  '/objective.css','/bomb.css','/keybinds.css','/wounds.css','/throwables.css',
  '/new-modes.css','/forum.css','/forum-embedded.css',
  '/three.module.js','/game.js','/menu-navigation.js','/attachment-layout.js',
  '/render-performance.js','/objective-rules.js','/bomb-rules.js',
  '/bomb-economy.js','/objective-world.js','/weapon-viewmodel.js',
  '/combat-balance.js','/cover-layout.js','/skin-system.js','/knife-skins.js',
  '/match-recovery.js','/skin-silhouettes.js','/forum.js','/account.js','/account-rank.css','/social.js','/social.css','/game-chat.js','/game-chat.css','/tournament.js','/tournament.css'
];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    // Offline preparation must not flood the startup connection pool.
    // Activation still waits for the entire cache; failed installs keep the old worker.
    let next=0;
    await Promise.all(Array.from({length:3},async()=>{
      while(next<ASSETS.length){
        const path=ASSETS[next++],response=await fetch(new Request(path,{priority:'low'}));
        if(!response.ok)throw new Error('Offline asset unavailable: '+path);
        await cache.put(path,response);
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(name=>name.startsWith('astrift-offline-')&&name!==CACHE_NAME).map(name=>caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('push',event=>{
  event.waitUntil((async()=>{
    let data={};try{data=event.data?.json()||{}}catch{}
    const language=await (await caches.open(CACHE_NAME)).match('/__language');
    const english=language&&await language.text()==='en';
    await self.registration.showNotification(english?'ASTRIFT FRONT · Event Reminder':typeof data.title==='string'?data.title:'星隙前线 · 赛事提醒',{
      body:english?'Your registered event has started. Click to open Astrift.':typeof data.body==='string'?data.body:'你报名的比赛已开始，点击打开星隙前线。',
      tag:typeof data.tag==='string'?data.tag:'astrift-tournament',data:{url:'/'},requireInteraction:true
    });
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of windows)client.postMessage({type:'astrift:tournament-started'});
  })());
});
 self.addEventListener('message',event=>{if(event.data?.type==='astrift:language')event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put('/__language',new Response(event.data.language==='en'?'en':'zh'))))});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    const home=new URL('/',self.location.origin).href;
    await self.clients.openWindow(home);
  })());
});

self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request);
        if(response.ok){const cache=await caches.open(CACHE_NAME);const world=response.headers.get('X-Astrift-World');await cache.put(world?'/__world-'+world:request,response.clone());if(world==='shell')await cache.put('/world-shell.html',response.clone());if(world)await cache.put('/__last-world',new Response(world));}
        return response;
      }catch{
        const cache=await caches.open(CACHE_NAME);
        // Ancient requires its online shared-world server; retain the offline main lobby.
        if(url.pathname==='/'){const shell=await cache.match('/world-shell.html');if(shell)return shell}
        if(url.pathname==='/_world/main'){const main=await cache.match('/__world-main')||await cache.match('/index.html');if(main)return main}
        if(url.pathname==='/_world/ancient'){const ancient=await cache.match('/__world-ancient');if(ancient)return ancient}
        return await cache.match(request,{ignoreSearch:true})||await cache.match('/index.html');
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    // Shared-world definitions must update together; retain cache only for offline use.
    if((url.pathname.endsWith('.js')&&url.pathname!=='/three.module.js')||url.pathname==='/ancient.css'||url.pathname.startsWith('/ancient-')||url.pathname==='/world-shell.js'||url.pathname==='/world-shell.html'){
      try{
        const response=await fetch(request,{cache:'no-cache'});
        if(response.ok){event.waitUntil(cache.put(request,response.clone()));if(url.pathname.startsWith('/world-shell'))event.waitUntil(cache.put(url.pathname,response.clone()));return response}
      }catch{}
      const offlineCopy=await cache.match(request)||await cache.match(request,{ignoreSearch:true});
      if(offlineCopy)return offlineCopy;
      return fetch(request);
    }
    const cached=await cache.match(request);
    if(cached)return cached;
    try{
      const response=await fetch(request);
      if(response.ok)event.waitUntil(cache.put(request,response.clone()));
      return response;
    }catch{
      const offlineCopy=await cache.match(request,{ignoreSearch:true});
      if(offlineCopy)return offlineCopy;
      throw new Error('Resource unavailable offline');
    }
  })());
});
