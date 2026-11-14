// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { SANCTUM_KINDS } from './ancient-sanctum.js';
import type {QuestStep} from './ancient-quests';
export const SANCTUM_NPCS={
 aster:{name:'阿斯特',en:'Aster',map:'sanctum',x:-7,z:18,role:['圣域引路者','Sanctum Guide'] as [string,string]},
 iris:{name:'伊莉丝',en:'Iris',map:'sanctum',x:8,z:165,role:['净化学者','Cleansing Scholar'] as [string,string]},
 lumen:{name:'露明',en:'Lumen',map:'sanctum',x:-9,z:245,role:['镜光看守','Keeper of Mirrors'] as [string,string]},
 seraph:{name:'瑟拉芙',en:'Seraph',map:'sanctum',x:8,z:470,role:['失誓祭司','Dissenting Priest'] as [string,string]},
 sanctumwaterseal:{name:'失衡的泉眼',en:'Unbalanced Spring',map:'sanctum',x:12,z:92,role:['调查地点','Investigation Site'] as [string,string]},
 sanctumrecordseal:{name:'被抹去的记载',en:'Erased Chronicle',map:'sanctum',x:-12,z:138,role:['古老记录','Ancient Record'] as [string,string]},
 sanctumrepairseal:{name:'折断的桥柱',en:'Damaged Bridge Anchor',map:'sanctum',x:5,z:205,role:['修复地点','Repair Site'] as [string,string]},
 sanctumlensseal:{name:'裂纹聚光镜',en:'Cracked Focusing Lens',map:'sanctum',x:-13,z:360,role:['聚光装置','Focusing Device'] as [string,string]},
 sanctumnorthseal:{name:'北侧封印阵',en:'Northern Seal Array',map:'sanctum',x:20,z:496,role:['失控封印','Unstable Seal'] as [string,string]},
 sanctumsouthseal:{name:'南侧封印阵',en:'Southern Seal Array',map:'sanctum',x:-20,z:496,role:['失控封印','Unstable Seal'] as [string,string]}
};
const reward={xpFraction:.02};
const talk=(id:string,npc:string,title:[string,string],dialogue:[string,string],map='sanctum'):QuestStep=>({id:'sanctum-'+id,title,goal:['交谈或操作标记地点','Talk or interact at the marked site'],kind:'talk',npc,map,dialogue,reply:['继续','Continue'],reward});
const kill=(id:string,title:[string,string],kinds:string[],count:number,region?:number):QuestStep=>({id:'sanctum-'+id,title,goal:[`击败 ${count} 个${kinds.map(kind=>SANCTUM_KINDS[kind].name).join("、")}`,`Defeat ${count} ${kinds.map(kind=>SANCTUM_KINDS[kind].en).join(" / ")}`],kind:'kill',map:'sanctum',kinds,count,region,reward});
export const SANCTUM_QUESTS:QuestStep[]=[
 talk('invitation','lyra',['净界之路','The Road to Clarity'],['边境已经安全了。我找到了净界圣域的古老记载，那里也许知道如何解除结晶的代价。带上我们的研究，去找外庭的阿斯特。别把洁白的建筑误当成善意的保证。','The border is safe. I found old records of the Sanctum of the Veil; its people may know how to reverse the crystals’ price. Take our findings to Aster in the outer court. White stone does not guarantee a welcome.'],'blight'),
 {id:'sanctum-enter',title:['越过白石门','Beyond the White Gate'],goal:['进入净界圣域','Enter the Sanctum of the Veil'],kind:'enter',map:'sanctum',reward},
 talk('welcome','aster',['被拒绝的来客','The Unwelcome Visitor'],['守护者把接触过结晶的人都视为威胁。我愿意听你的解释，但外庭的守卫已不再听从我们。击败20个光铸守卫，保护仍在这里生活的人。','The guardians treat anyone exposed to crystals as a threat. I will hear you out, but the sentinels no longer heed us. Defeat twenty hostile Lightforged Sentinels to protect the people who still live here.']),
 kill('court',['守护者的误判','The Guardians’ Error'],['sanctum_sentinel'],20,0),
 talk('spring','sanctumwaterseal',['没有污浊的污染','A Blight Without Darkness'],['泉水依然清澈，但照到水面的净化光正在抽走生命。问题不是污染太重，而是净化已经失去分寸。','The spring is clear, but the cleansing light is draining life from it. The problem is not too much blight; the purification itself has gone too far.']),
 talk('chronicle','sanctumrecordseal',['被删去的名字','The Names That Were Erased'],['石板曾记录许多成功获救的人。后来的命令却将他们全部划为不洁，连救治方法也被抹去了。','The tablet once listed many people who were healed. Later orders branded every one of them impure and erased the remedy itself.']),
 talk('scholar','iris',['净化不是抹除','Cleansing Is Not Erasure'],['你的研究和这些记录吻合。无瑕裁决者正在把正常生命也纳入净化。先清理20个守卫，修复桥柱，再去找镜光看守。','Your findings match the records. The Immaculate Arbiter now includes healthy lives in its cleansing. Defeat twenty more sentinels, repair the bridge anchor and find the Keeper of Mirrors.']),
 kill('bridge-guards',['夺回前路','Reclaim the Approach'],['sanctum_sentinel'],20,0),
 talk('bridge','sanctumrepairseal',['重接悬桥','Restore the Skybridge'],['你锤紧松脱的锚环，重新接通桥柱内的回路。水雾从两侧瀑布升起，回廊就在桥的另一端。','You hammer the loose anchor rings into place and reconnect the bridge circuits. Mist rises from the waterfalls below; the gallery waits across the span.']),
 talk('mirrors-brief','lumen',['让光走正确的路','Let the Light Find Its Path'],['镜台一次转向一个方向。靠近镜台按F旋转，沿着可见光束追踪，把光从入口导入尽头的接收器。不要把净化光直接打进封印。','Each turn redirects a mirror to another direction. Press F beside a mirror and follow the visible beam. Route it from the entrance into the receiver at the far end, not into a seal.']),
 kill('wraiths',['镜中的回响','Echoes in the Mirrors'],['mirror_wraith'],20,1),
 {id:'sanctum-mirrors',title:['接通镜光回路','Connect the Mirrorlight Circuit'],goal:['靠近镜台按F旋转，将光束引入接收器，打开圣殿通路','Press F beside mirrors and guide the beam into the receiver to open the temple passage'],kind:'mirrors',map:'sanctum',reward},
 talk('lens','sanctumlensseal',['校准聚光镜','Calibrate the Focusing Lens'],['光束到达了接收器。你调整裂纹镜片的边缘，保存了能安全分离魔化力量的光谱。','The beam reaches the receiver. You align the cracked lens edges and record a spectrum that can safely separate blight from living flesh.']),
 talk('mirror-report','lumen',['光也会伤人','Even Light Can Wound'],['我们找到了方法，但裁决者仍在执行旧命令。瑟拉芙留在圣殿入口，她知道怎样关闭过度净化的封印。','We have a method, but the Arbiter still obeys its old orders. Seraph waits at the temple entrance and knows how to halt the excessive cleansing.']),
 talk('temple','seraph',['违抗无瑕','Defying Perfection'],['我曾帮助它执行裁决，现在我要阻止它。先清理20个封印执卫，再断开两侧封印。留意守卫抬手的光矛，别站着承受攻击。','I once helped it carry out its judgments. Now I must stop it. Defeat twenty Seal Wardens and disconnect both seal arrays. Watch their raised weapons and keep moving.']),
 kill('wardens',['拆除裁决的锁链','Break the Chains of Judgment'],['seal_warden'],20,2),
 talk('seal-north','sanctumnorthseal',['松开第一道封印','Release the First Seal'],['你转动石环，让净化光不再汇入裁决者的铠甲。','You turn the stone rings and stop the cleansing light from feeding the Arbiter’s armor.']),
 talk('seal-south','sanctumsouthseal',['松开第二道封印','Release the Second Seal'],['第二条回路断开。圣殿不再把正常生命当作净化的燃料。','The second circuit disconnects. The temple no longer draws healthy lives into its cleansing.']),
 talk('arbiter-brief','seraph',['最后一次裁决','The Final Judgment'],['它会射出光束、挥出扇形斩击，也会在脚下放出封印阵。攻击前地面会亮起金色预兆，先躲开，再反击。我们要终止命令，不是毁掉圣域。','It fires beams, sweeps its blade in a fan and places seal arrays beneath you. Golden warnings appear before each strike; dodge first, then counterattack. We must end its orders, not destroy the sanctum.']),
 kill('arbiter',['无瑕并非无错','Perfection Is Not Wisdom'],['immaculate_judge'],1,2),
 talk('accord','seraph',['新的净化誓约','A New Vow of Cleansing'],['裁决结束了。我们将用你保存的光谱制作净化印记。使用一枚即可解除魔化，不会恢复生命，也不会让你免于再次魔化。先收下3枚；以后用1枚裁决晶核和30个相位核心制作一枚。请把净化用来救人。','The judgment is over. Your recorded spectrum lets us make Purification Sigils. Each sigil removes corruption, but does not heal you or prevent future corruption. Take three. You can later craft one with a Verdict Crystal and thirty Phase Cores. Let cleansing save lives.'])
];
SANCTUM_QUESTS.at(-1)!.reward={xpFraction:.02,unlockPurification:true,materials:{'supply:purity':3}};
