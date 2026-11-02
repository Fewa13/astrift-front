// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {QuestStep} from './ancient-quests';
import {mapChapterNPCs} from './ancient-geography.js';
type Text=[string,string];
export const DUNES_NPCS={
 tamari:{name:'塔玛莉',en:'Tamari',map:'dunes',x:-9,z:18,role:['砂海向导','Sandsea Guide'] as Text},
 izar:{name:'伊扎尔',en:'Izar',map:'dunes',x:10,z:110,role:['失落城匠','Lost-city Mason'] as Text},
 nahla:{name:'娜赫拉',en:'Nahla',map:'dunes',x:-12,z:205,role:['日影记录者','Keeper of Sundials'] as Text},
 duneelder:{name:'阿苏尔',en:'Asur',map:'dunes',x:10,z:300,role:['最后的守钟人','Last Keeper of the Hourglass'] as Text},
 dunecompassseal:{name:'风蚀路碑',en:'Windworn Waystone',map:'dunes',x:8,z:68,role:['路碑','Waystone'] as Text},
 dunewellseal:{name:'埋沙水井',en:'Sand-choked Well',map:'dunes',x:-8,z:155,role:['修复水井','Restore the Well'] as Text},
 dunesun1seal:{name:'黎明影针',en:'Dawn Gnomon',map:'dunes',x:-12,z:225,role:['日影机关','Sunshadow Device'] as Text},
 dunesun2seal:{name:'正午影针',en:'Noon Gnomon',map:'dunes',x:12,z:245,role:['日影机关','Sunshadow Device'] as Text},
 dunesun3seal:{name:'黄昏影针',en:'Dusk Gnomon',map:'dunes',x:0,z:270,role:['日影机关','Sunshadow Device'] as Text},
 dunegateseal:{name:'暮沙封门',en:'Duskglass Seal',map:'dunes',x:-10,z:320,role:['解封装置','Unsealing Device'] as Text}
};mapChapterNPCs(DUNES_NPCS);
const reward={xpFraction:.009},talk=(id:string,npc:string,title:Text,dialogue:Text):QuestStep=>({id:'dunes-'+id,title,goal:['交谈','Talk'],kind:'talk',map:npc==='skyaster'?'skyreach':'dunes',npc,dialogue,reply:['继续','Continue'],reward});
const kill=(id:string,kind:string,count:number,region:number,title:Text):QuestStep=>({id:'dunes-'+id,title,goal:[`击败${count}个敌人`,`Defeat ${count} enemies`],kind:'kill',map:'dunes',kinds:[kind],count,region,reward});
export const DUNES_QUESTS:QuestStep[]=[
 talk('signal','skyaster',['雷声之后','After the Thunder'],['恢复的星盘照见了一片从未记录的沙海。旧命令并非来自天空，而是来自暮沙迷城的砂钟。去找向导塔玛莉，别把整座沙城当作敌人。','The restored dial reveals an uncharted sandsea. The old orders came not from the sky, but from an hourglass in Duskglass City. Find Tamari; not everyone in the buried city is an enemy.']),
 {id:'dunes-level260',title:['循光入沙','Follow Light into Sand'],goal:['达到260级','Reach level 260'],kind:'level',level:260,reward:{}},
 {id:'dunes-enter',title:['暮沙迷城','Duskglass Labyrinth'],goal:['进入暮沙迷城','Enter Duskglass Labyrinth'],kind:'enter',map:'dunes',reward},
 talk('arrival','tamari',['被沙掩埋的道路','Roads Beneath the Sand'],['峡谷会把风声变成假回音。先击退20只砂甲掘行者，再修复路碑；沿绿洲走，别顺着砂钟的低语直冲神殿。','The canyon turns wind into false echoes. Defeat twenty Sandscarabs, then restore the waystone. Follow the oasis; do not rush toward the whispering temple.']),
 kill('scarabs','dune_scarab',20,0,['砂甲之下','Beneath the Sand Armor']),
 talk('waystone','dunecompassseal',['重刻归途','Mark the Return Route'],['你刷去碑上的沙粒，重新嵌入铜指针。回声不再乱窜，通往绿洲的标记亮了起来。','You brush sand from the stone and fit its bronze pointer. The echoes settle, and the markers toward the oasis begin to glow.']),
 talk('oasis','izar',['还有人守着这里','Someone Still Keeps Watch'],['水井被逐沙祭师的仪式堵住了。击退20名祭师，再清理井口。埋誓将军是旧城的守卫，不是祭师的同伴，但它已经听不见我们。','The Oracles have choked our well with ritual sand. Defeat twenty and clear the mouth. The Entombed Marshal once guarded this city; it no longer hears us.']),
 kill('oracles','sand_oracle',20,1,['驱散沙咒','Disperse the Sand Hex']),
 talk('well','dunewellseal',['让水重新流动','Let Water Flow Again'],['你拉起倒塌的井架，用锤子固定横梁，将堵住水道的砂盘转开。井底传来水声。','You raise the fallen frame, hammer its beam into place and turn the sandwheel away from the channel. Water sounds below.']),
 {id:'dunes-level270',title:['稳住绿洲','Secure the Oasis'],goal:['达到270级','Reach level 270'],kind:'level',level:270,reward:{}},
 talk('marshal','izar',['唤醒埋誓者','Wake the Entombed Oath'],['将军把每一个接近影针的人都当成入侵者。避开它举起双臂的砸击，结束这条错误的守卫命令。','The Marshal sees anyone approaching the gnomons as an invader. Dodge when both arms rise, and end its broken guard order.']),
 kill('marshal-clear','buried_marshal',1,1,['旧誓归尘','Let the Old Oath Rest']),
 talk('sundials','nahla',['三个时刻，同一束光','Three Hours, One Light'],['三座影针把同一束光拆成了黎明、正午与黄昏。我们必须分别校准它们。先清理20只琉砂猎兽，再逐座检查。','Three gnomons divide a single beam into dawn, noon and dusk. Align each of them. First clear twenty Glassfang Jackals, then inspect the devices.']),
 kill('jackals','glass_jackal',20,2,['琉砂猎影','Hunt the Glassfangs']),
 talk('dawn','dunesun1seal',['黎明之刻','The Hour of Dawn'],['你转动第一枚砂轮，让最短的刻影与日纹重合。黎明影针停止震颤。','You turn the first sandwheel until its short shadow meets the sunmark. The Dawn Gnomon stops trembling.']),
 talk('noon','dunesun2seal',['正午之刻','The Hour of Noon'],['你压住错位的铜环，将第二枚镜盘转向高处。一道白光射向神殿。','You hold the slipped bronze ring and turn the second mirror upward. A white beam reaches the temple.']),
 talk('dusk','dunesun3seal',['黄昏之刻','The Hour of Dusk'],['最后一根影针缓缓对齐。封闭的近道打开了，砂钟深处却传来第二次心跳。','The final gnomon aligns. A sealed shortcut opens, but a second heartbeat sounds within the hourglass.']),
 {id:'dunes-level284',title:['神殿前的长影','Long Shadows Before the Temple'],goal:['达到284级','Reach level 284'],kind:'level',level:284,reward:{}},
 talk('warning','duneelder',['被困住的黄昏','A Dusk That Cannot End'],['司命一直在重复最后一道命令，好让暮沙城永远停在毁灭前一刻。我们救下了人，现在该让时间继续往前。','The Regent repeats its final order to hold the city one moment before destruction. We have saved its people. Now time must move again.']),
 kill('temple-guards','dune_scarab',24,3,['清出神殿前庭','Clear the Temple Forecourt']),
 talk('open','dunegateseal',['卸下停滞之锁','Unfasten the Stillness'],['你依次拔出封门上的三根锁栓。沙流没有扑向绿洲，而是沿着旧水道缓缓散去。','You withdraw three bolts from the gate. The sand follows the old channels instead of rushing toward the oasis.']),
 {id:'dunes-level296',title:['走向砂钟','Approach the Hourglass'],goal:['达到296级','Reach level 296'],kind:'level',level:296,reward:{}},
 kill('regent','hourglass_regent',1,3,['让暮色流逝','Let Dusk Pass']),
 talk('end','duneelder',['明日仍会到来','Tomorrow Will Come'],['砂钟终于流完了这一刻。城里的钟第一次响起不同的声音。谢谢你，我们不用再靠重复昨日来活下去。','The hourglass finally releases this moment. For the first time, the bells sound a different hour. Thank you. We no longer have to survive by repeating yesterday.'])
];

// Dense repeatable patrols fill the level gates without giving away the levels.
for(const [gate,target,npc,kind,region,seal]of [['dunes-level270',270,'izar','sand_oracle',1,'dunewellseal'],['dunes-level284',284,'nahla','glass_jackal',2,'dunesun2seal'],['dunes-level296',296,'duneelder','dune_scarab',3,'dunegateseal']] as const){
 const at=DUNES_QUESTS.findIndex(q=>q.id===gate),prefix=gate+'-patrol',patrol={gate,target};
 const brief=talk(prefix+'-brief',npc,['守住这段归途','Keep the Return Route Safe'],['有人要沿旧路回到绿洲。击退24个沿路敌人，检查路上的装置，再回来告诉我。慢慢来，别把人留在沙里。','Travelers need the old road back to the oasis. Defeat twenty-four enemies, inspect the roadside device, then report back. Take your time; leave nobody in the sand.']);brief.id=prefix+'-brief';brief.patrol=patrol;brief.reward={xpFraction:.003};
 const fight=kill(prefix+'-clear',kind,24,region,['清理归途巡逻','Clear the Return Patrol']);fight.id=prefix+'-clear';fight.patrol=patrol;fight.reward={xpFraction:.03};
 const inspect=talk(prefix+'-inspect',seal,['复查路上装置','Recheck the Roadside Device'],['你检查支架和封口，敲紧松动的铜扣。下一批旅人可以安全通过这里。','You inspect the supports and seals, hammering loose bronze fasteners tight. The next travelers can pass safely.']);inspect.id=prefix+'-inspect';inspect.patrol=patrol;inspect.reward={xpFraction:.003};
 const report=talk(prefix+'-report',npc,['把消息带回来','Bring Back the News'],['路还通着，这比砂钟里的命令重要。休整一下；如果还需要磨练，就再护送下一段归途。','The road is still open. That matters more than the hourglass orders. Rest, then protect the next journey if you still need training.']);report.id=prefix+'-report';report.patrol={...patrol,last:true};report.reward={xpFraction:.003};
 DUNES_QUESTS.splice(at,0,brief,fight,inspect,report);
}
