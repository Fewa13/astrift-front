// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const QUEST_MAP_NAMES={tribe:['部落','The Tribe'],forest:['森林','The Forest'],city:['失落王城','Lost Royal City'],blight:['蚀影荒原','Shadowblight Wastes'],sanctum:['净界圣域','Sanctum of the Veil'],starfall:['沉星遗境','Sunken Star Ruins'],frostcourt:['霜烬王庭','Frostfire Court'],skyreach:['寂雷天穹','Silent Storm Skyreach'],dunes:['暮沙迷城','Duskglass Labyrinth']};
export function questLocationText(quest,currentMap,english=false){
 const target=quest?.map;
 if(!target||target===currentMap)return '';
 const name=QUEST_MAP_NAMES[target]?.[english?1:0]||target;
 return (english?'Quest location: ':'任务地图：')+name;
}
export function appendQuestLocation(parent,quest,currentMap,english=false){
 const text=questLocationText(quest,currentMap,english);if(!text)return;
 const label=document.createElement('p');label.className='ancientQuestLocation';label.textContent=text;parent.append(label);return label;
}
