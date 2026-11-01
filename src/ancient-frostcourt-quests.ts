// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {QuestStep} from './ancient-quests';
type Text=[string,string];
export const FROSTCOURT_NPCS={
 velra:{name:'维尔拉',en:'Velra',map:'frostcourt',x:-7,z:18,role:['失誓巡察官','Forsworn Inspector'] as Text},
 brann:{name:'布兰',en:'Brann',map:'frostcourt',x:-7,z:94,role:['王庭铸匠','Court Smith'] as Text},
 elthea:{name:'艾瑟娅',en:'Elthea',map:'frostcourt',x:7,z:196,role:['断令书记','Scribe of Severed Commands'] as Text},
 kael:{name:'凯尔',en:'Kael',map:'frostcourt',x:-7,z:296,role:['王庭守誓者','Court Oathkeeper'] as Text},
 courtrecordseal:{name:'冰封令碑',en:'Frozen Edict Tablet',map:'frostcourt',x:12,z:68,role:['封存档案','Sealed Record'] as Text},
 courtrepairseal:{name:'铸炉泄压阀',en:'Forge Pressure Valve',map:'frostcourt',x:14,z:158,role:['铸炉阀门','Forge Valve'] as Text},
 courtcodexseal:{name:'旧誓原典',en:'The Original Covenant',map:'frostcourt',x:-12,z:254,role:['禁令原典','Edict Archive'] as Text},
 courtfinalseal:{name:'双相封令环',en:'Twinphase Edict Seal',map:'frostcourt',x:14,z:314,role:['封令装置','Edict Seal'] as Text}
};
const reward={xpFraction:.009};
const talk=(id:string,npc:string,title:Text,dialogue:Text):QuestStep=>({id:'court-'+id,title,goal:['交谈','Talk'],kind:'talk',map:npc==='sela'?'starfall':'frostcourt',npc,dialogue,reply:['继续','Continue'],reward});
const kill=(id:string,title:Text,kind:string,count:number,region:number):QuestStep=>({id:'court-'+id,title,goal:[`击败${count}个敌人`,`Defeat ${count} enemies`],kind:'kill',map:'frostcourt',kinds:[kind],count,region,reward});
export const FROSTCOURT_QUESTS:QuestStep[]=[
 talk('signal','sela',['命令的源头','Where the Orders Began'],['档案指向霜烬王庭：冰封的誓约负责保存命令，永燃的铸炉负责执行命令。那里没有新的侵蚀，只有一条从未撤销的旧法。去找维尔拉，查清谁还在维持它。','The archive points to the Frostfire Court. Frozen covenants preserve its orders; undying forges enforce them. This is not new corruption, but an old law never revoked. Find Velra and learn who keeps it alive.']),
 {id:'court-level',title:['王庭之外','Beyond the Court Gates'],goal:['达到180级','Reach level 180'],kind:'level',level:180,reward:{}},
 {id:'court-enter',title:['霜烬王庭','Frostfire Court'],goal:['进入霜烬王庭','Enter the Frostfire Court'],kind:'enter',map:'frostcourt',reward},
 talk('arrival','velra',['冰封的旧誓','The Frozen Oath'],['哨卫仍把所有来客当作逃犯。先击退20个霜契哨卫，再调查令碑。别去碰远处的裁令者，我们还没有足够证据让它停止。','The guards still treat every visitor as a fugitive. Defeat twenty Oathguards, then inspect the edict tablet. Leave the distant Arbiter alone for now; we lack the evidence to halt it.']),
 kill('guards',['撬开霜封城门','Break the Frozen Watch'],'frost_oathguard',20,0),
 talk('tablet','courtrecordseal',['令碑中的名字','Names in the Tablet'],['你刮去冰霜，转动铭盘。记录中没有罪名，只有代代追加的名字。净化装置的能量正被用来维持这份名单。','You scrape away the frost and turn the inscribed plate. The record contains no crimes, only names added generation after generation. The cleansing network has been powering this list.']),
 talk('forge','brann',['停止铸造枷锁','Stop Forging Chains'],['铸役不分昼夜制造誓链。先清理20个铸役，再修复泄压阀。监工只会在被攻击后追击，准备好再挑战它。','The Artificers forge oathchains without rest. Defeat twenty, then repair the pressure valve. The Overseer only retaliates after being attacked. Challenge it when you are ready.']),
 kill('artificers',['让铸炉停歇','Silence the Artificers'],'ember_mason',20,1),
 talk('valve','courtrepairseal',['铸炉第一次降温','The Forge Cools'],['你锤正卡死的阀扣，慢慢旋开泄压环。白色蒸汽从铜管喷出，铸炉的轰鸣终于减弱。','You hammer the jammed catches straight and slowly turn the pressure ring. White steam escapes the brass pipes, and the roar of the forge finally subsides.']),
 kill('overseer',['打断熔誓','Break the Forged Oath'],'furnace_regent',1,1),
 talk('release','brann',['不是所有枷锁都该铸成','Not Every Chain Should Be Forged'],['监工停下了。去上层找艾瑟娅，她保留了旧法最初的文本。那里执刑者的锁刃很重，抬起后会留下明显破绽。','The Overseer has fallen silent. Find Elthea above; she kept the original law. The Executioners carry heavy chainblades. Their raised weapons leave a clear opening.']),
 talk('archive','elthea',['被删去的一句话','The Missing Sentence'],['清理20个断誓执刑者，再读取原典。旧法原本允许赦免，但最后一句被裁令者锁住了。','Defeat twenty Executioners and read the Covenant. The original law permitted pardon, but the Arbiter sealed away its final sentence.']),
 kill('executors',['夺回赦免条款','Reclaim the Right to Pardon'],'chain_executor',20,2),
 talk('covenant','courtcodexseal',['归还选择','Restore the Choice'],['你拨开三层封签，原典最后一页显现：誓约应保护生命，而非支配生命。将这条原文带到凯尔那里。','You release three locking seals. The last page reads: an oath shall protect life, not command it. Take these original words to Kael.']),
 talk('approach','kael',['走进双相王座','Before the Twinphase Throne'],['最后的守卫仍受旧令束缚。击退20个守卫后，接通封令环。裁令者的霜焰直线、双相环与落印都有预兆；不要站着硬接。','The last guards remain bound to the old order. Defeat twenty, then reconnect the edict seal. The Arbiter telegraphs its frostfire line, twinphase ring and falling brands. Do not try to endure them standing still.']),
 kill('lastwatch',['最后的守望','The Final Watch'],'frost_oathguard',20,3),
 talk('seal','courtfinalseal',['把原文交还王庭','Return the Original Words'],['你将原典接入双相锁环。冰蓝和赤金两条光路第一次同时归零，裁令者终于能够被解除。','You feed the Covenant into the twinphase seal. Ice-blue and amber circuits fall silent together. The Arbiter can finally be released.']),
 kill('arbiter',['终止无尽裁决','End the Endless Judgment'],'frost_crowned',1,3),
 talk('aftermath','kael',['誓约之后仍有明天','A Tomorrow Beyond the Oath'],['王庭的旧令已经终止。我们留下铸炉和档案，让它们重新服务活着的人。档案仍有几页空白；下一段旅程，将由我们自己选择。','The old order has ended. The forges and archives remain, ready to serve the living again. A few pages are still blank. We will choose what the next journey means.'])
];
for(const [before,target,region,kind,npc]of [['court-forge',190,0,'frost_oathguard','velra'],['court-archive',200,1,'ember_mason','brann'],['court-approach',210,2,'chain_executor','elthea'],['court-seal',220,3,'frost_oathguard','kael']] as const){
 const gate='court-ready-'+target,brief=gate+'-patrol-brief';const steps:QuestStep[]=[
  {...talk('patrol-'+target,npc,['巩固王庭前线','Secure the Court Approach'],['继续清理本区20个敌人，回来领取补给。确认准备充分后，我们再向前推进。','Defeat twenty more enemies here and return for supplies. We will advance when you are ready.']),id:brief,patrol:{target,gate,first:true}},
  {...kill('patrol-kills-'+target,['压制旧令守卫','Suppress the Old Guard'],kind,20,region),patrol:{target,gate},reward:{xpFraction:.03}},
  {...talk('patrol-report-'+target,npc,['前线补给','Frontline Resupply'],['这段道路安全了一些。带上补给，继续磨练，或者在准备好后前进。','The approach is safer now. Take these supplies and keep preparing, or advance when ready.']),id:gate+'-report',patrol:{target,gate,last:true},reward:{xpFraction:.01}},
  {id:gate,title:['准备深入王庭','Ready for the Inner Court'],goal:[`达到${target}级`,`Reach level ${target}`],kind:'level',level:target,map:'frostcourt',reward:{}}
 ];FROSTCOURT_QUESTS.splice(FROSTCOURT_QUESTS.findIndex(q=>q.id===before),0,...steps);
}
