// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Static motifs and translucent tints; no additional particles or render loops.
export const BOSS_NOTICE_THEMES={
 chief:['#e9c89d','#332217','bone','╱╲'],lord:['#ffcc75','#3b2111','totem','◆'],
 rootwarden:['#9cde89','#15331e','roots','❧'],
 crystal_metal:['#ffe497','#383018','facets','◇'],crystal_wood:['#7ee0ac','#12352c','leaves','❖'],
 crystal_water:['#79d6ff','#102c43','waves','≈'],crystal_fire:['#ff9a73','#431c15','embers','⋀'],crystal_earth:['#dcb78b','#35281c','strata','▱'],
 oathknight:['#a8caff','#17283e','heraldry','⚔'],emptyking:['#d4a4f4','#2e193c','crown','♜'],
 blight_lord:['#c5a0f5','#2c163a','rift','⋈'],immaculate_judge:['#fff0be','#333225','halo','⊙'],
 starbound_heart:['#9bb5ff','#171c3c','stars','✦'],furnace_regent:['#ffa764','#3e2116','forge','⏣'],
 frost_crowned:['#a6f0f5','#162f3c','frost','❄'],thunder_warden:['#b9b4ff','#241d42','storm','ϟ'],
 sky_sovereign:['#e4c7ff','#2e2045','sky','⌁']
};
export const MAP_NOTICE_THEMES={
 tribe:['#c9b38d','#2e2418','bone'],forest:['#9ed5a7','#18301f','leaves'],city:['#b4bedb','#23293b','heraldry'],
 blight:['#c7a3df','#2e1d36','rift'],sanctum:['#ede2ad','#302f22','halo'],starfall:['#a2b9f2','#1c2540','stars'],
 frostcourt:['#a3dce9','#1b303c','frost'],skyreach:['#c6b5f4','#28213f','storm'],dungeon:['#c7a08c','#30221d','strata']
};
export function noticeTheme(kind,map,boss){return boss?(BOSS_NOTICE_THEMES[kind]||['#edcf91','#352619','totem','◆']):(MAP_NOTICE_THEMES[map]||MAP_NOTICE_THEMES.dungeon);}
