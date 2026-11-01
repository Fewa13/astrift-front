// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {QuestStep} from './ancient-quests';
export const BLIGHT_NPCS={
 sera:{name:'塞拉',en:'Sera',map:'blight',x:-8,z:18,role:['边境医师','Border Healer'] as [string,string]},
 bren:{name:'布伦',en:'Bren',map:'blight',x:8,z:195,role:['营地守卫','Camp Watchman'] as [string,string]},
 blighttracksseal:{name:'侵蚀足迹',en:'Blighted Tracks',map:'blight',x:-10,z:95,role:['调查地点','Investigation Site'] as [string,string]},
 blightcureseal:{name:'受伤的轻蚀兽',en:'Wounded Blight-Touched Beast',map:'blight',x:12,z:145,role:['可净化的生命','A Life That Can Be Restored'] as [string,string]},
 blightpurifyseal:{name:'村落净化装置',en:'Village Purifier',map:'blight',x:0,z:275,role:['净化装置','Purifier'] as [string,string]},
 blightrescueseal:{name:'被困的幸存者',en:'Trapped Survivors',map:'blight',x:-30,z:290,role:['救援地点','Rescue Site'] as [string,string]},
 blightwestseal:{name:'西侧供能节点',en:'Western Power Node',map:'blight',x:30,z:345,role:['侵蚀节点','Blight Node'] as [string,string]},
 blighteastseal:{name:'东侧供能节点',en:'Eastern Power Node',map:'blight',x:-30,z:345,role:['侵蚀节点','Blight Node'] as [string,string]},
 lyra:{name:'莉拉',en:'Lyra',map:'blight',x:8,z:402,role:['裂隙研究者','Rift Researcher'] as [string,string]}
};
const reward={xpFraction:.02};
const talk=(id:string,npc:string,title:[string,string],dialogue:[string,string],map='blight'):QuestStep=>({id:'blight-'+id,npc,title,dialogue,goal:['与指定人物或地点交互','Interact with the marked person or site'],kind:'talk',map,reward,reply:['继续','Continue']});
const kill=(id:string,title:[string,string],kinds:string[],count:number,region?:number):QuestStep=>({id:'blight-'+id,title,goal:[`击败 ${count} 个指定敌人`,`Defeat ${count} marked enemies`],kind:'kill',map:'blight',kinds,count,region,reward});
export const BLIGHT_QUESTS:QuestStep[]=[
 talk('summons','eira',['边境来信','A Letter from the Border'],['王城已经安全了。这次是独立的边境求援：远方村落出现魔化，医师塞拉正在蚀影荒原等待援助。','The royal city is safe. This is a new call for help from the border: a distant village is suffering from blight. Healer Sera awaits you in the Shadowblight Wastes.'],'city'),
 {id:'blight-enter',title:['新的边境','A New Frontier'],goal:['进入蚀影荒原','Enter the Shadowblight Wastes'],kind:'enter',map:'blight',reward},
 talk('welcome','sera',['不是所有生命都已失去','Not Every Life Is Lost'],['营地外的野兽出现了黑色结晶。有些已经狂暴，有些仍能恢复。先击败20只轻蚀兽保护营地，再调查沿路的足迹。','Black crystals have appeared on the beasts outside camp. Some have become violent, but others can still recover. Defeat twenty hostile beasts to protect the camp, then investigate their tracks.']),
 kill('beasts',['守住边境','Hold the Border'],['blight_beast'],20,0),
 talk('tracks','blighttracksseal',['残留的脉搏','A Lingering Pulse'],['足迹旁的结晶并未完全侵入血肉。你记录样本的位置，发现仍有净化的可能。','The crystals beside these tracks have not fully entered the flesh. You record the samples and find that recovery may still be possible.']),
 talk('cure-brief','sera',['留下活路','A Chance to Live'],['东北边有一只受伤的轻蚀兽。靠近标记处，把净化药敷上去。别把它当作必须杀掉的怪物。','There is a wounded beast to the northeast. Apply the cleansing remedy at the marked site. It does not need to be killed.']),
 talk('cure','blightcureseal',['净化而非猎杀','Cleanse, Do Not Kill'],['结晶逐渐脱落，野兽的呼吸恢复平稳。它退回林中，不再敌视营地。','The crystals fall away and the beast begins breathing steadily. It returns to the woodland, no longer hostile to the camp.']),
 talk('findings','sera',['可逆的侵蚀','Reversible Blight'],['它活下来了。这证明轻度魔化可以恢复。村落里的净化装置已经停摆，找布伦带你过去。','It survived. This proves that mild blight can be reversed. The purifier in the village has stopped working. Find Bren on the road.']),
 talk('village','bren',['被根脉缠绕的村落','The Rootbound Village'],['屋子里还有幸存者。先清理20个根脉潜伏者，再修复村落中央的净化装置。','There are still survivors inside the houses. Defeat twenty Rootvein Stalkers, then repair the purifier in the village center.']),
 kill('stalkers',['夺回街道','Reclaim the Streets'],['blight_stalker'],20,1),
 talk('repair','blightpurifyseal',['点亮净化装置','Restore the Purifier'],['你接通回路，净化装置重新亮起。启动后需要守在附近，让装置完成净化。','You reconnect the circuits and the purifier lights up. Stay nearby once it starts to let the cleansing finish.']),
 {id:'blight-defend',title:['守住净化之光','Guard the Cleansing Light'],goal:['在装置旁按 F 启动，守住30秒；离开或死亡需重新开始','Press F beside the purifier and hold for 30 seconds; leaving or dying restarts the defense'],kind:'defend',map:'blight',npc:'blightpurifyseal',reward},
 talk('rescue','blightrescueseal',['打开生路','Open a Way Out'],['你拆下堵门的晶根，帮助幸存者离开房屋。净化光照到了他们身上。','You remove the crystal roots blocking the doorway and help the survivors leave. The cleansing light reaches them.']),
 talk('report','bren',['村落仍在被喂养','The Village Is Still Being Fed'],['村民安全了，但两处供能节点仍在把侵蚀送向村落。清理附近的潜伏者，然后切断两个节点。','The villagers are safe, but two power nodes still feed blight into the village. Clear the nearby stalkers, then sever both nodes.']),
 kill('nodes-guard',['清除节点守卫','Clear the Node Guards'],['blight_stalker'],20,1),
 talk('west','blightwestseal',['切断第一条根脉','Sever the First Rootvein'],['你切断核心连接，黑色根脉逐渐停止搏动。','You sever the core connection. The black roots stop pulsing.']),
 talk('east','blighteastseal',['切断第二条根脉','Sever the Second Rootvein'],['第二处节点失去供能，村落里的晶根开始崩落。','The second node loses power and the crystal roots in the village begin to crumble.']),
 talk('deep','bren',['深谷的入口','The Gorge Entrance'],['村落稳住了。沿坡道去找莉拉。深谷里的东西不是魔化野兽，而是真正来自裂隙的魔物。','The village is stable. Follow the descent to Lyra. The creatures in the gorge are not blighted beasts; they are beings from the rift itself.']),
 talk('crystals-brief','lyra',['危险的馈赠','A Dangerous Gift'],['深谷有魔化结晶。靠近并瞄准结晶，右键吸收，可获得固定10000经验（不受经验药水影响），但有概率魔化。魔化后身体变为灰黑色、伤害提升30%，也会与其他玩家互相造成伤害；死亡或进入其他地图后恢复正常。吸收3个，帮我记录它们的反应。','Blight Crystals grow in the gorge. Stand nearby, aim at one and right-click to absorb it for a fixed 10,000 XP (unaffected by XP potions), but it may corrupt you. Corruption turns your body gray-black and increases damage by 30%. You and other players can then hurt each other; death or entering another map restores your normal state. Absorb three crystals so I can study their reactions.']),
 {id:'blight-crystals',title:['吸收魔化结晶','Absorb Blight Crystals'],goal:['右键吸收3个魔化结晶；有概率魔化，死亡或换图恢复正常','Right-click to absorb 3 Blight Crystals; corruption is possible and ends on death or entering another map'],kind:'absorb',map:'blight',count:3,reward},
 talk('crystal-report','lyra',['力量与代价','Power and Its Price'],['这些结晶会向活物索取代价，净化装置无法直接处理。先清理20只裂口魔物，找出蚀心领主的位置。','These crystals exact a price from living creatures, and the purifier cannot cleanse them directly. Defeat twenty Riftmaws and locate the Blightheart Lord.']),
 kill('demons',['深入裂隙深谷','Into the Rift Gorge'],['rift_maw'],20,2),
 talk('lord-brief','lyra',['蚀心的召唤','The Blightheart Summons'],['领主会召唤魔物，并把侵蚀集中在地面。看到紫色预兆就离开，别硬吃它的斩击。','The lord summons rift creatures and concentrates blight on the ground. Move away from violet warnings and avoid its sweeping strikes.']),
 kill('lord',['斩断蚀心','Sever the Blightheart'],['blight_lord'],1,2),
 talk('aftermath','lyra',['边境重见天光','Daylight Returns to the Border'],['领主倒下了。村落恢复供水，净化营地重新开放。结晶仍然危险，但现在我们知道魔化并非总是无法挽回。下一步不是盲目追逐力量，而是找到安全驾驭它的方法。','The lord has fallen. Water flows through the village again and the cleansing camp is open. The crystals remain dangerous, but we now know that blight is not always irreversible. Our next step is to learn how to handle this power safely, not chase it blindly.'])
];
