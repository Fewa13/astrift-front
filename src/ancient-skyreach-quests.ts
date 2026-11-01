// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {QuestStep} from './ancient-quests';
export const SKYREACH_NPCS={
 nerys:{name:'奈璃丝',en:'Nerys',map:'skyreach',x:-7,z:18,role:['天穹观测者','Sky Observer'] as [string,string]},
 orren:{name:'奥伦',en:'Orren',map:'skyreach',x:7,z:89,role:['星仪修复师','Astrolabe Restorer'] as [string,string]},
 selene:{name:'瑟琳',en:'Selene',map:'skyreach',x:-7,z:189,role:['寂雷记录官','Keeper of Silent Thunder'] as [string,string]},
 skyaster:{name:'阿斯特',en:'Aster',map:'skyreach',x:7,z:289,role:['最后的引星者','The Last Starcaller'] as [string,string]},
 skybeaconseal:{name:'失准星标',en:'Misaligned Star Beacon',map:'skyreach',x:12,z:61,role:['校准装置','Alignment Device'] as [string,string]},
 skyrelayseal:{name:'断路雷枢',en:'Broken Thunder Relay',map:'skyreach',x:-12,z:159,role:['雷枢','Thunder Relay'] as [string,string]},
 skymirrorseal:{name:'天穹镜环',en:'Celestial Mirror Array',map:'skyreach',x:12,z:256,role:['折光星仪','Prismatic Astrolabe'] as [string,string]},
 skydawnseal:{name:'黎明引星盘',en:'Dawn Star Dial',map:'skyreach',x:-12,z:315,role:['引星装置','Starcalling Device'] as [string,string]}
};
const reward={xpFraction:.009};
const talk=(id:string,npc:string,title:[string,string],dialogue:[string,string]):QuestStep=>({id:'sky-'+id,title,goal:['交谈','Talk'],kind:'talk',map:npc==='kael'?'frostcourt':'skyreach',npc,dialogue,reply:['继续','Continue'],reward});
const kill=(id:string,kind:string,count:number,region:number,title:[string,string]):QuestStep=>({id:'sky-'+id,title,goal:[`击败${count}个敌人`,`Defeat ${count} enemies`],kind:'kill',map:'skyreach',kinds:[kind],count,region,reward});
export const SKYREACH_QUESTS:QuestStep[]=[
 talk('signal','kael',['雷声消失的地方','Where Thunder Fell Silent'],['王庭已停下，天空的星仪却仍在发出命令。到寂雷天穹寻找奈璃丝，查明那道来自云层之上的信号。','The Court has fallen silent, but the celestial instruments still issue orders. Find Nerys in Skyreach and trace the signal above the clouds.']),
 {id:'sky-level',title:['云海之上','Above the Cloudsea'],goal:['达到220级','Reach level 220'],kind:'level',level:220,reward:{}},
 {id:'sky-enter',title:['寂雷天穹','Silent Storm Skyreach'],goal:['进入寂雷天穹','Enter Silent Storm Skyreach'],kind:'enter',map:'skyreach',reward},
 talk('arrival','nerys',['没有雷声的雷暴','The Soundless Storm'],['天空并不安静，雷声被星仪收走了。清理20个巡穹枪卫，我们才能安全校准第一座星标。','The sky is not quiet: its thunder has been captured by the astrolabes. Defeat twenty Lancers so we can align the first beacon.']),
 kill('lancers','sky_lancer',20,0,['打通观测前庭','Clear the Observation Court']),
 talk('beacon','skybeaconseal',['重置北辰','Realign the Pole Star'],['你转动铜制星轨，拧紧失准的齿盘。一束星光重新落到观测台，指向更高处的雷枢。','You rotate the bronze orbit and secure the misaligned gears. A starlight beam returns to the platform, pointing toward the thunder relay.']),
 talk('relay','orren',['被编织的雷霆','Woven Thunder'],['织雷星使一直在抽取云海中的雷光。击退20个，再重新接通雷枢。监守只会在受到攻击后应战，准备好再挑战。','The Stormweavers draw lightning from the cloudsea. Defeat twenty and reconnect the relay. The Warden retaliates only when attacked; prepare before challenging it.']),
 kill('weavers','storm_weaver',20,1,['解开雷网','Unweave the Storm']),
 talk('repair','skyrelayseal',['修复断路','Repair the Relay'],['你卸下烧毁的铜片，用锤子敲正支座，再将两条光路接回星环。天空传来短暂的雷声。','You remove the scorched copper, hammer its support straight and reconnect both circuits. For a moment, thunder returns to the sky.']),
 kill('warden','thunder_warden',1,1,['让雷霆归天','Return Thunder to the Sky']),
 {id:'sky-level232',title:['稳住雷枢','Hold the Relay'],goal:['达到232级','Reach level 232'],kind:'level',level:232,reward:{}},
 talk('archive','selene',['镜面后的命令','Orders Behind the Mirror'],['星仪在复制一条早已结束的命令。击败20个棱晶重卫，再将镜环转向真正的天空。','The astrolabes repeat an order whose purpose ended long ago. Defeat twenty Bulwarks, then turn the mirrors toward the real sky.']),
 kill('golems','prism_golem',20,2,['破开棱晶阵','Break the Prismatic Formation']),
 talk('mirror','skymirrorseal',['映出真实天空','Reflect the True Sky'],['你依次转动三面晶镜，锁住最后的镜架。被遮蔽的天光终于穿过星环。','You turn three crystal mirrors and lock the final frame. The hidden daylight finally passes through the array.']),
 {id:'sky-level246',title:['穿越寂雷','Cross the Silent Storm'],goal:['达到246级','Reach level 246'],kind:'level',level:246,reward:{}},
 talk('approach','skyaster',['最后的引星者','The Last Starcaller'],['天君守着最后一座星盘。先清理20个枪卫，再启动黎明引星盘。它的雷线与星环都有蓄势，别站着硬接。','The Sovereign guards the last dial. Defeat twenty Lancers, then activate the dawn instrument. Its lightning lanes and star rings have clear windups. Keep moving.']),
 kill('lastwatch','sky_lancer',20,3,['守住黎明','Hold Until Dawn']),
 talk('dial','skydawnseal',['把黎明还给天空','Return Dawn to the Sky'],['你推开封闭的星盘，缓缓合上主轴。所有星环第一次指向同一个黎明。','You open the sealed dial and bring its main axle into alignment. For the first time, every ring points toward the same dawn.']),
 kill('sovereign','sky_sovereign',1,3,['寂雷终响','Let Thunder Resound']),
 talk('end','skyaster',['云海之外','Beyond the Cloudsea'],['雷声回来了。我们不再让天空听从旧命令。谢谢你，将这一段旅途的结局带到了这里。','Thunder has returned. The sky no longer obeys the old command. Thank you for bringing this journey to its end.'])
];
