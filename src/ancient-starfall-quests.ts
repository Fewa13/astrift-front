// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {QuestStep} from './ancient-quests';
type Text=[string,string];
export const STARFALL_NPCS={
 neris:{name:'奈莉丝',en:'Neris',map:'starfall',x:-8,z:18,role:['遗境领航员','Sunken Expedition Guide'] as Text},
 orien:{name:'奥里恩',en:'Orien',map:'starfall',x:8,z:151,role:['星核档案员','Starcore Archivist'] as Text},
 sela:{name:'瑟拉',en:'Sela',map:'starfall',x:-8,z:291,role:['封印工程师','Seal Engineer'] as Text},
 starrecordseal:{name:'潮汐记录台',en:'Tidal Record Console',map:'starfall',x:12,z:105,role:['记录装置','Record Console'] as Text},
 starrepairseal:{name:'书库传动环',en:'Archive Drive Ring',map:'starfall',x:-12,z:242,role:['受损装置','Damaged Mechanism'] as Text},
 starwestseal:{name:'西侧抑制器',en:'West Suppressor',map:'starfall',x:-20,z:350,role:['封印装置','Seal Array'] as Text},
 stareastseal:{name:'东侧抑制器',en:'East Suppressor',map:'starfall',x:20,z:350,role:['封印装置','Seal Array'] as Text}
};
const reward={xpFraction:.012};
const talk=(id:string,npc:string,title:Text,dialogue:Text):QuestStep=>({id:'starfall-'+id,title,goal:['交谈','Talk'],kind:'talk',map:npc==='seraph'?'sanctum':'starfall',npc,dialogue,reply:['继续','Continue'],reward});
const kill=(id:string,title:Text,kind:string,count:number,region:number):QuestStep=>({id:'starfall-'+id,title,goal:[`击败${count}个敌人`,`Defeat ${count} enemies`],kind:'kill',map:'starfall',kinds:[kind],count,region,reward});
export const STARFALL_QUESTS:QuestStep[]=[
 talk('signal','seraph',['净光之外','Beyond the Cleansing Light'],['净化印记已经能分离侵蚀，但信号仍从海底传来。它不是新的污染，而是圣域旧装置一直在索取能量。带着安全光谱去沉星遗境，找奈莉丝。别再把那里所有的生命都当成敌人。','The sigils can separate corruption, but a signal still rises from the seabed. It is not new blight: the old sanctum machinery is still drawing power. Bring the safe spectrum to Neris in the Sunken Star Ruins. Do not assume every life there is an enemy.']),
 {id:'starfall-level',title:['深海的门槛','The Deepwater Threshold'],goal:['升到150级','Reach level 150'],kind:'level',level:150,reward:{}},
 {id:'starfall-enter',title:['沉星遗境','Sunken Star Ruins'],goal:['进入沉星遗境','Enter the Sunken Star Ruins'],kind:'enter',map:'starfall',reward},
 talk('arrival','neris',['仍在呼吸的遗迹','Ruins That Still Breathe'],['我们在完整的避水穹顶中行动，不必下水。潮壳潜卫只是在保卫旧命令，先清理挡路的20只，再读取潮汐记录。','We travel inside intact dry domes; there is no need to swim. The Tidecarapace Guardians defend an obsolete order. Defeat twenty blocking the approach, then read the tidal records.']),
 kill('shore',['夺回避水回廊','Reclaim the Dry Gallery'],'tide_carapace',20,0),
 talk('record','starrecordseal',['借来的心跳','A Borrowed Heartbeat'],['你拨动记录环，影像显示：圣域的净化曾借用星核力量，但回路从未真正关闭。持续抽取能量才是深处异变的原因。','You turn the recording ring. The projection reveals that the sanctum once borrowed starcore power, but never truly shut the circuit down. The endless drain is what changed the depths.']),
 talk('archive','orien',['保存而非抹除','Preserve, Do Not Erase'],['这些书记的记录被旧指令占据了。击败20个溺星书记，修复传动环，我们才能读取没有被删改的原始档案。','Old commands have overtaken the scribes. Defeat twenty Drowned Star Scribes and repair the drive ring so we can read the unaltered archive.']),
 kill('scribes',['取回原始档案','Recover the Original Archive'],'drowned_scribe',20,1),
 talk('repair','starrepairseal',['重启传动环','Restore the Drive Ring'],['你逐个锤正偏移的齿扣，转动锁环，书库重新投下完整星图。图中的执核者曾经保护这里，如今却被持续抽取的能量逼入失控。','You hammer the displaced gear catches into alignment and turn the locking ring. A complete star chart returns. The Corekeeper once protected this place; the endless energy drain drove it out of control.']),
 talk('truth','orien',['先停下抽取','Stop the Drain First'],['杀死更多守卫不能解决问题。工程师瑟拉在封印入口。帮她清理周围遗骸，关闭两侧抑制器，再解除执核者的失控指令。','Killing more guardians will not fix this. Sela waits at the seal entrance. Clear the revenants around her, shut down both suppressors, then break the commands driving the Corekeeper.']),
 talk('engineer','sela',['封印的代价','The Cost of the Seal'],['清理20个缚锚遗骸后，先转动西侧装置，再操作东侧装置。我们的目标是终止抽取，不是摧毁整座遗迹。','Defeat twenty Anchorbound Revenants. Then turn the west array and operate the east array. We are ending the drain, not destroying the ruins.']),
 kill('anchors',['松开沉重枷锁','Release the Anchors'],'anchor_revenant',20,2),
 talk('west','starwestseal',['第一道断流','Sever the First Conduit'],['你转动三层锁环，切断流向圣域的第一条能量回路。','You rotate the three locking rings and sever the first energy conduit to the sanctum.']),
 talk('east','stareastseal',['最后一条回路','The Final Conduit'],['你将逆向光谱接入东侧抑制器。星核不再被抽取，但执核者仍在执行最后的封锁命令。','You feed the reversed spectrum into the east suppressor. The drain stops, but the Corekeeper still follows its final lockdown command.']),
 talk('warning','sela',['星核的守门人','Keeper of the Starcore'],['留意直线星矛、空心潮环和脚下的三道星印。它们都有起手和预兆。避开再进攻，解除旧命令，我们才有机会让这片遗境继续存在。','Watch for the straight star lance, the hollow tidal ring and three star marks beneath you. Each attack has a windup and a visible warning. Dodge, then counterattack. Break the old command and give these ruins a future.']),
 kill('corekeeper',['归还星核','Return the Starcore'],'starbound_heart',1,2),
 talk('aftermath','sela',['不再借取明天','No More Borrowed Tomorrows'],['抽取已经终止。我们保留了遗迹、记录和能恢复的生命。下一步不是寻找更强的净化，而是追查是谁写下了那条把生命当作燃料的旧命令。','The drain has ended. We preserved the ruins, the records and the lives that can recover. Our next step is not stronger purification. It is finding who wrote the command that treated life as fuel.'])
];
// Combat interleaves with conversations while the player grows into the next
// area's level band. A turn-in bonus is modest; kills remain the main XP source.
for(const [before,target,region,kind,npc]of [['starfall-archive',160,0,'tide_carapace','neris'],['starfall-engineer',170,1,'drowned_scribe','orien'],['starfall-warning',180,2,'anchor_revenant','sela']] as const){
 const gate='starfall-ready-'+target,brief=gate+'-patrol-brief',report=gate+'-report';
 const extra:QuestStep[]=[
  {...talk('training-'+target,npc,['巩固前线','Secure the Approach'],['前面的敌人更加危险。先继续清理本区20个敌人，再回来报告。我们每次都会补给，准备充分后再向前。','The next area is more dangerous. Defeat twenty more enemies in this area, then report back for supplies. Move on when you are ready.']),id:brief,patrol:{target,gate,first:true}},
  {...kill('training-kills-'+target,['压制残留指令','Suppress the Old Commands'],kind,20,region),patrol:{target,gate},reward:{xpFraction:.03}},
  {...talk('training-report-'+target,npc,['前线回报','Field Report'],['这一轮的路线已经安全些了。带上补给，继续清理，或者在准备充分后进入下一区域。','This patrol route is safer now. Take these supplies and continue, or move into the next area when ready.']),id:report,patrol:{target,gate,last:true},reward:{xpFraction:.01}},
  {id:gate,title:['准备深入','Ready to Descend'],goal:[`达到${target}级`,`Reach level ${target}`],kind:'level',level:target,map:'starfall',reward:{}}
 ];STARFALL_QUESTS.splice(STARFALL_QUESTS.findIndex(q=>q.id===before),0,...extra);
}
