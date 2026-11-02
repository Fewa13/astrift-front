// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {DUNES_NPCS,DUNES_QUESTS} from './ancient-dunes-quests.js';
import {SANCTUM_NPCS,SANCTUM_QUESTS} from './ancient-sanctum-quests.js';
import {SKYREACH_NPCS,SKYREACH_QUESTS} from './ancient-skyreach-quests.js';
import {FROSTCOURT_NPCS,FROSTCOURT_QUESTS} from './ancient-frostcourt-quests.js';
import {STARFALL_NPCS,STARFALL_QUESTS} from './ancient-starfall-quests.js';
import {BESTIARY_HUNTS,bestiaryQuestSteps} from './ancient-bestiary-quests.js';
import {BLIGHT_NPCS,BLIGHT_QUESTS} from './ancient-blight-quests.js';
import {tribeCompactZ,gainXP,xpNeeded,xpRewardBase,type AncientProfile} from './ancient-rules.js';
import {PROFESSIONS,SKILLS,skillBook} from './ancient-skills.js';
export type QuestState={step:number;count:number;revision?:number};
type Text=[string,string];
type Reward={unlockPurification?:boolean;xp?:number;xpFraction?:number;coins?:number;materials?:Record<string,number>;potions?:Record<string,number>;qBook?:boolean};
export type QuestStep={id:string;title:Text;goal:Text;kind:string;map?:string;npc?:string;dialogue?:Text;reply?:Text;count?:number;kinds?:string[];region?:number;level?:number;z?:number;reward?:Reward;patrol?:{target:number;gate:string;first?:boolean;last?:boolean}};
export const QUEST_NPCS:Record<string,{name:string;en:string;map:string;x:number;z:number;role:Text}>={
 gruk:{name:'格鲁克',en:'Gruk',map:'tribe',x:-10,z:14,role:['部落守望者','Tribal Watchkeeper'] as Text},
 tok:{name:'托克',en:'Tok',map:'tribe',x:-8,z:212,role:['猎道引路人','Hunting Trail Guide'] as Text},
 raka:{name:'拉卡',en:'Raka',map:'tribe',x:11,z:512,role:['祭坛斥候','Altar Scout'] as Text},
 mira:{name:'米拉',en:'Mira',map:'forest',x:-10,z:16,role:['林地守护者','Woodland Warden'] as Text},
 ilun:{name:'伊伦',en:'Ilun',map:'forest',x:60,z:195,role:['古树学者','Elder-tree Scholar'] as Text},
 sen:{name:'森',en:'Sen',map:'forest',x:90,z:228,role:['五行祭司','Keeper of the Five'] as Text},
 veya:{name:'薇娅',en:'Veya',map:'city',x:-10,z:18,role:['王城幸存者','City Survivor'] as Text},
 aron:{name:'阿隆',en:'Aron',map:'city',x:-10,z:192,role:['失踪的守卫','Missing Watchman'] as Text},
 eira:{name:'艾拉',en:'Eira',map:'city',x:12,z:342,role:['前王城卫队长','Former Guard Captain'] as Text},
 westseal:{name:'西侧相位装置',en:'Western Phase Relay',map:'city',x:-30,z:246,role:['失控装置','Unstable Relay'] as Text},
 eastseal:{name:'东侧相位装置',en:'Eastern Phase Relay',map:'city',x:30,z:301,role:['失控装置','Unstable Relay'] as Text},
 gateseal:{name:'核心殿封印',en:'Core Hall Seal',map:'city',x:0,z:354,role:['失控装置','Unstable Relay'] as Text}
};
const steps:QuestStep[]=[];
const add=(id:string,title:Text,goal:Text,kind:string,extra:Partial<QuestStep>={})=>steps.push({id,title,goal,kind,...extra});
const talk=(id:string,npc:keyof typeof QUEST_NPCS,title:Text,dialogue:Text,reward?:Reward,reply:Text=['好的','All right.'])=>add(id,title,[`与${QUEST_NPCS[npc].name}交谈`,`Talk to ${QUEST_NPCS[npc].en}`],'talk',{npc,map:QUEST_NPCS[npc].map,dialogue,reply,reward});
const kill=(id:string,title:Text,goal:Text,kinds:string[],count:number,map='tribe',region?:number)=>add(id,title,goal,'kill',{kinds,count,map,region});
const level=(id:string,n:number)=>add(id,['继续成长','Grow stronger'],[`升到 ${n} 级`,`Reach level ${n}`],'level',{level:n});
add('arrival',['初到部落','A new arrival'],['进入部落','Enter the Tribe'],'enter',{map:'tribe',reward:{xp:200}});
talk('gruk-help','gruk',['守望者的指引','The watchkeeper’s guidance'],['我们部落被攻击了。先唤醒你的力量：打开技能，选择职业，我会教你使用第一个技能。','Our tribe is under attack. First awaken your power: open Skills and choose a profession. I will teach you your first ability.']);
kill('grox-five',['保卫内区','Defend the settlement'],['击杀 5 个 1–5 级穴居兽','Defeat 5 Grox, levels 1–5'],['grox'],5);
talk('gruk-reward','gruk',['初次报捷','Your first victory'],['感谢你帮助我们，这里是你的奖励。现在你可以点亮技能点了：打开技能按钮，选择你的职业。','Thank you for helping us. Here is your reward. It is time to awaken your abilities: open Skills and choose a profession.'],{xp:300,materials:{core:1,'supply:transfer':1}});
add('choose-job',['选择道路','Choose your path'],['打开技能，选择职业','Open Skills and choose a profession'],'profession');
talk('gruk-book','gruk',['第一本技能书','Your first skill book'],['{job}是一个很好的职业。我来送你一本技能书来激活技能吧。我们来升级技能：打开技能，修炼 Q 技能，然后回到战斗中使用一次。','{job} is an excellent choice. Take this skill book to awaken your first ability. Open Skills and train your Q skill, then return to combat and use it once.'],{qBook:true});
add('train-q',['唤醒力量','Awaken your power'],['在技能页面修炼 Q 技能至 1 级','Train your Q skill to level 1 in Skills'],'trainQ');
add('use-q',['试试你的力量','Try your new power'],['使用一次 Q 技能；攻击技能需要瞄准可见敌人','Use your Q skill once; attack skills require a visible enemy'],'useQ');
talk('gruk-foundation','gruk',['生存的基础','The basics of survival'],['好的，你已经学会了在这里生存的基础。升级到5级，然后去中部入口找托克。他知道袭击者从哪里来。','Good. You have learned the basics of surviving here. Reach level 5, then find Tok at the entrance to the hunting grounds. He knows where the attackers came from.']);
level('reach-five',5);
talk('tok-trail','tok',['猎道上的线索','Clues on the hunting trail'],['格鲁克提到过你。先别闯进深处，猎手会投掷长矛。击败6个碎牙猎手，我们需要夺回这条猎道。','Gruk told me about you. Do not rush into the depths: the hunters throw spears. Defeat six Shardfang Hunters so we can reclaim this trail.']);
kill('hunters-six',['夺回猎道','Reclaim the trail'],['击杀 6 个中部碎牙猎手','Defeat 6 Shardfang Hunters in the hunting grounds'],['hunter'],6,'tribe',1);
talk('tok-core','tok',['打磨武器','Sharpen your weapon'],['猎道终于安静了一些。这些相位核心给你。打开背包，检查并穿戴你的主手武器；更强的敌人正在等你。','The trail is quieter now. Take these Phase Cores. Open Inventory and equip your main-hand weapon. Stronger enemies await.'],{xp:1200,coins:50,materials:{core:3}});
add('first-star',['主手武器','Your main-hand weapon'],['在背包中穿戴一把近战武器','Equip a melee weapon in Inventory'],'equipGear');
talk('tok-medicine','tok',['准备补给','Prepare your supplies'],['伤口不会自己消失。用我给你的金币在商店买一瓶低级血瓶。血瓶在背包里，受伤后可以使用；现在先备好。','Wounds do not heal on their own. Use the gold I gave you to buy a Minor Health Potion in the Shop. It will appear in your inventory. Keep it ready for when you are injured.']);
add('buy-potion',['带上血瓶','Carry a health potion'],['在商店购买一瓶血瓶','Buy a health potion in the Shop'],'buyPotion');
talk('tok-second','tok',['第二种力量','A second ability'],['补给齐了。这本{zskill}技能书给你。修炼你的 Z 技能，学会配合近战武器运用职业力量。','Your supplies are ready. Take this {zskill} skill book. Train your Z skill and learn to use your profession alongside your weapon.'],{xp:1600,materials:{core:4},qBook:false});
add('train-z',['拓展能力','Expand your abilities'],['将当前职业 Z 技能修炼至 1 级','Train your current profession’s Z skill to level 1'],'trainZ');
talk('tok-hunt','tok',['清理营地','Clear the camps'],['两种力量都掌握了。猎手营地仍在召集援军。再击败10个中部猎手，切断他们的集结。','You now wield two abilities. The hunters are still gathering reinforcements. Defeat ten more hunters in the hunting grounds to break their muster.']);
kill('hunters-ten',['切断援军','Cut off reinforcements'],['击杀 10 个中部碎牙猎手','Defeat 10 Shardfang Hunters in the hunting grounds'],['hunter'],10,'tribe',1);
talk('tok-chief','tok',['图腾之主','Master of the totem'],['碎骨酋长就在中部尽头。他的砸地攻击很危险，先把自己提升到20级，并用技能书强化职业技能，再回来找我。','The Bonebreaker Chieftain waits at the far end of the hunting grounds. His ground slam is deadly. Reach level 20 and keep training your profession skills, then return to me.'],{xp:6000,materials:{core:12}});
level('reach-twenty',20);
talk('tok-third','tok',['完整的职业','Your full arsenal'],['你已经准备好修炼{cskill}。拿着这本技能书，学会 C 技能，再去挑战碎骨酋长。他是袭击的指挥者。','You are ready to learn {cskill}. Take this book, train your C skill, then challenge the Bonebreaker Chieftain. He commands these attacks.'],{materials:{core:20}});
add('train-c',['掌握第三技能','Learn your third skill'],['将当前职业 C 技能修炼至 1 级','Train your current profession’s C skill to level 1'],'trainC');
kill('bonebreaker',['打碎图腾','Break the totem'],['击败中部头目：碎骨酋长','Defeat the Bonebreaker Chieftain'],['chief'],1);
talk('tok-victory','tok',['越过木寨','Beyond the palisade'],['酋长倒下了，但袭击还没有结束。外围的拉卡发现了更大的威胁。穿过第二道大门去找她；路上不要停留。','The chieftain has fallen, but the attacks are not over. Raka has found a greater threat in the outer territory. Cross the second gate and find her. Stay alert on the way.'],{xp:18000,materials:{core:30}});
talk('raka-scout','raka',['外围的斥候','The outer scout'],['祭坛正在召集所有兽群。先清掉外围8只穴居兽、再清掉8个猎手，别让它们夹击你。','The altar is calling every beast to it. First clear eight Grox, then eight hunters in the outer territory. Do not let them surround you.']);
kill('outer-grox',['肃清兽群','Thin the beasts'],['击杀 8 个外围穴居兽','Defeat 8 Grox in the outer territory'],['grox'],8,'tribe',2);
kill('outer-hunters',['肃清投矛手','Silence the spear throwers'],['击杀 8 个外围碎牙猎手','Defeat 8 Shardfang Hunters in the outer territory'],['hunter'],8,'tribe',2);
talk('raka-gorash','raka',['祭坛的阴影','Shadow of the altar'],['远古大酋长·戈拉什就在最深处的祭坛。他远比酋长强大。先升到30级，备好血瓶和强化武器，再从我这里接下最后的挑战。','Gorash, the Ancient High Chieftain, waits at the deepest altar. He is far stronger than the chieftain. Reach level 30, prepare your potions and strengthen your weapon, then return for the final challenge.'],{xp:30000,materials:{core:60}});
level('reach-thirty',30);
talk('raka-final','raka',['向戈拉什宣战','Challenge Gorash'],['现在，去击败戈拉什。躲开砸地和咆哮，别站着硬扛。你的职业技能和血瓶会决定这场战斗。','Now defeat Gorash. Avoid his ground slams and roars; do not try to endure them all. Your profession skills and potions will decide this fight.']);
kill('gorash',['部落的终战','The tribe’s final battle'],['击败远古大酋长·戈拉什','Defeat Gorash, Ancient High Chieftain'],['lord'],1);
talk('raka-forest','raka',['古林的呼唤','The elder forest calls'],['部落终于能喘口气了。戈拉什的力量来自古林。返回大厅，选择森林，然后去入口找米拉。我们的故事还没有结束。','The tribe can finally breathe again. Gorash drew his power from the elder forest. Return to the lobby, enter the Forest and find Mira near its entrance. Our story is not over.'],{xp:60000,materials:{core:100}});
add('forest-entry',['踏入森林','Into the forest'],['进入森林地图','Enter the Forest'],'enter',{map:'forest'});
talk('mira-welcome','mira',['林地的异变','Trouble in the woodland'],['你就是救下部落的人。这里的苔甲兽也失控了。击败8只苔甲兽，替我守住入口。','You are the one who saved the tribe. The Mossbacks here have also gone wild. Defeat eight and help me secure the entrance.']);
kill('moss-eight',['守住林口','Secure the woodland entrance'],['击杀 8 只苔甲兽','Defeat 8 Mossbacks'],['mossling'],8,'forest');
talk('mira-trace','mira',['古根的痕迹','Traces of the ancient roots'],['树根下有东西醒来了。先升到40级，再去交界处击败古根守望者。它并不总会出现，留意森林与高台之间的石径。','Something has awakened beneath the roots. Reach level 40, then defeat the Ancient Rootwarden at the woodland–terrace crossing. It appears only from time to time; watch the stone trail.'],{xp:80000,materials:{core:60}});
level('reach-forty',40);
kill('root-warden',['沉睡的守卫','The sleeping warden'],['击败古根守望者','Defeat the Ancient Rootwarden'],['rootwarden'],1,'forest');
talk('mira-return','mira',['净化树根','Cleanse the roots'],['古根暂时平静了。沿着上坡走到巨树高台，伊伦正在那里研究水晶。他能解释这场异变。','The roots are calm for now. Follow the rising trail to the elder-tree terrace. Ilun is studying the crystals there. He can explain this disturbance.'],{xp:120000,materials:{core:100}});
talk('ilun-thorns','ilun',['高台的学者','Scholar of the terrace'],['五座祭坛的力量外泄了，棘枝猎手占据了高台。击败10个猎手，给我一点研究的时间。','Power is leaking from the five altars, and Thornstalkers have taken over the terrace. Defeat ten of them and give me time to study.']);
kill('thorns-ten',['肃清巨树高台','Clear the elder-tree terrace'],['击杀 10 个棘枝猎手','Defeat 10 Thornstalkers'],['thorn'],10,'forest');
talk('ilun-pass','ilun',['右侧的古门','The ancient gate to the right'],['祭坛就在右转后的古门里面。先升到50级，再去里面找祭司森。水晶巨人的力量不能被轻视。','The altars lie beyond the ancient gate on your right. Reach level 50, then find Sen inside. Do not underestimate the crystal giants.'],{xp:160000,materials:{core:120}});
level('reach-fifty',50);
talk('sen-shells','sen',['祭司的试炼','The keeper’s trial'],['五行失衡了，晶壳守卫挡住了通往祭坛的路。先击败12个守卫，证明你能在这里生存。','The five elements are out of balance. Crystal Sentinels block the paths to the altars. Defeat twelve and prove that you can survive here.']);
kill('sentinels-twelve',['打开祭坛之路','Open the altar paths'],['击杀 12 个晶壳守卫','Defeat 12 Crystal Sentinels'],['sentinel'],12,'forest');
talk('sen-ready','sen',['五行失衡','The five in discord'],['你通过了试炼。先升到60级，把武器与技能准备好。我们必须逐一平息五座祭坛；不要同时招惹多个巨人。','You have passed the trial. Reach level 60 and prepare your weapon and skills. We must calm all five altars, one at a time. Do not provoke several giants at once.'],{xp:250000,materials:{core:180}});
level('reach-sixty',60);
const elements:[string,Text,Text][]=[
 ['wood',['苍木','Verdant'],['先去苍木祭坛，击败苍木水晶巨人。古林需要重新扎根。','Go to the Verdant altar first and defeat its crystal giant. The forest must take root again.']],
 ['water',['沧澜','Tidal'],['苍木已经平息。接下来是沧澜祭坛，击败那里的水晶巨人，让力量重新流动。','Verdant is calm. Next, defeat the crystal giant at the Tidal altar and let the power flow again.']],
 ['fire',['熔焰','Ember'],['水流回来了，现在熔焰必须降温。击败熔焰水晶巨人，小心它的爆发。','The flow has returned. Now Ember must cool. Defeat its crystal giant and beware its bursts of power.']],
 ['earth',['玄岩','Terra'],['火焰平静了，玄岩仍在震动。去击败玄岩水晶巨人，稳住大地。','The flames are calm, but Terra still trembles. Defeat its crystal giant and steady the earth.']],
 ['metal',['金曜','Aurum'],['只剩金曜了。击败最后的水晶巨人，让五行重新归位。','Only Aurum remains. Defeat the final crystal giant and restore the balance of the five.']]
];
for(const [element,name,dialogue]of elements){talk('sen-'+element,'sen',[name[0]+'的试炼',name[1]+' trial'],dialogue,element==='wood'?undefined:{xp:150000,materials:{core:100}});kill('giant-'+element,[name[0]+'归位',name[1]+' restored'],['击败'+name[0]+'水晶巨人','Defeat the '+name[1]+' Crystal Titan'],['crystal_'+element],1,'forest')}
talk('sen-balance','sen',['五行归位','Balance restored'],['五行终于平衡了。是你把部落与森林从混乱中拉了回来。带着这份奖励继续成长；新的道路开启时，我会再次需要你。','The five are finally in balance. You brought both the tribe and the forest back from chaos. Take this reward and keep growing. When a new path opens, I will need your help again.'],{xp:400000,materials:{core:300}});
add('homecoming',['回到故事的起点','Back to where it began'],['返回部落，向格鲁克报告森林已经恢复平衡','Return to the Tribe and tell Gruk that the forest is in balance'],'enter',{map:'tribe'});
talk('gruk-home','gruk',['新的守望者','A new watchkeeper'],['你从在部落唤醒职业力量开始，却一路走到了五行祭坛。部落会记住你的名字。收下这份谢礼吧——你已经不再只是一个过路人了。','You began by awakening your profession in our tribe, and your journey led all the way to the five altars. The tribe will remember your name. Take this token of our thanks. You are no longer just a traveler here.'],{xp:50000,materials:{core:50}});
talk('gruk-city','gruk',['封印后的道路','A road beyond the seal'],['森林的五座祭坛不是供奉巨人，而是在封印通往失落王城的道路。如今道路重新显现，袭击部落的力量也来自那里。达到70级后前往王城，找回失踪的守卫阿隆。','The five forest altars were not built to worship the titans. They sealed the road to the Lost Royal City. That road has reappeared, and the force that attacked our tribe came from beyond it. Reach level 70, enter the city and find the missing watchman, Aron.'],{xp:250000,materials:{core:80}});
level('city-level',70);
add('city-arrival',['失落王城','The Lost Royal City'],['进入失落王城','Enter the Lost Royal City'],'enter',{map:'city'});
talk('city-survivor','veya',['废墟中的声音','A voice in the ruins'],['你是从森林来的？我们曾经主动封闭王城，想把地下的东西永远关住。现在街上的城民已经失去神智。清除前路的4个失落城民，阿隆就在城门内等救援。','You came through the forest? We sealed our own city to keep something beneath it trapped forever. Now the citizens have lost their minds. Clear four Lost Citizens from the road. Aron is waiting for help beyond the inner gate.']);
kill('city-clear-road',['打通废城','Clear the ruined approach'],['击败 4 个失落城民','Defeat 4 Lost Citizens'],['city_husk'],4,'city',0);
talk('city-watchman','aron',['找到阿隆','Find Aron'],['终于有人来了。卫队长艾拉仍在街区尽头，但空誓守卫堵住了道路。别从正面硬拼，石阶能通往屋顶，房屋大门也是开的。击败4个守卫，让幸存者可以撤出。','At last, help has arrived. Captain Eira is still at the far end of the district, but the Hollow Oathguards block our escape. Do not charge straight into them. The stone stairs lead to the roofs, and the house doors are open. Defeat four guards so the survivors can leave.'],{xp:400000,coins:2500});
kill('city-rescue',['救援守卫','Rescue the watchmen'],['击败 4 个空誓守卫','Defeat 4 Hollow Oathguards'],['city_guard'],4,'city',1);
talk('city-captain','eira',['艾拉的秘密','Eira’s secret'],['我们不是被外敌击败的。国王把相位核心埋在城下，以为能挡住裂隙中的东西，最后却被它吞噬。先检查西侧和东侧装置，再检查核心殿门口的封印。不要碰核心本体。','An invading army did not defeat us. Our king buried a Phase Core beneath the city to hold back something in the rift. In the end, it consumed him. Inspect the western and eastern relays, then the seal at the Core Hall entrance. Do not touch the core itself.'],{xp:600000,materials:{core:120}});
talk('city-relay-west','westseal',['第一处装置','The first relay'],['装置中的记忆仍在重复：关闭城门，撤入街区。相位能量不是向外流动，而是在把整座城市的生命引向地下。你关闭了失控的回路。','The relay repeats an old command: close the gates, fall back into the district. Its energy is not flowing outward. It is drawing the city’s life underground. You shut down the unstable circuit.'],{xp:300000},['关闭回路','Shut down the circuit']);
talk('city-relay-east','eastseal',['第二处装置','The second relay'],['装置保存着卫队最后的记录：国王已不在铠甲里。不要相信他的命令。裂隙需要一具王冠来维持形体。你切断了装置与核心的连接。','The relay contains the guard’s final record: the king is no longer inside his armor. Do not obey his commands. The rift needs a crown to hold its form. You sever the relay’s link to the core.'],{xp:300000},['切断连接','Sever the link']);
talk('city-relay-gate','gateseal',['第三处装置','The third relay'],['封印记录显示，还有一位失誓骑士在守护这里。他不是守着国王，而是在阻止空冠离开核心殿。必须击败他，才能让封印解除。','The seal reveals that a Forsworn Knight still guards this place. He is not protecting the king. He is keeping the Empty Crown inside the Core Hall. Defeat him to release the seal.'],{xp:400000},['记录线索','Record the findings']);
talk('city-knight-brief','eira',['失誓的守门人','The forsaken gatekeeper'],['骑士会举盾，也会沿着地上的金色枪线冲锋。看清攻击预兆，从侧面躲开，再寻找机会反击。我会留下来保护阿隆。','The knight raises his shield and charges along the golden line on the ground. Watch his attack warnings, dodge to the side, then strike back. I will stay here to protect Aron.']);
kill('city-knight',['打破旧誓','Break the old oath'],['击败头目：失誓骑士','Defeat the Forsworn Knight'],['oathknight'],1,'city');
talk('city-core-open','eira',['打开核心殿','Open the Core Hall'],['封印解除了。沿着下沉石道进入地下，清除3个裂隙侍祭，别让它们继续喂养核心。空冠之王会在受伤后撕开更多裂隙，别站在蓝色预兆里。','The seal is broken. Follow the descending stone passage underground. Defeat three Rift Acolytes before they can keep feeding the core. The Empty-Crowned King tears open more rifts when wounded. Stay out of the blue warning zones.'],{xp:800000,materials:{core:200}});
kill('city-acolytes',['切断献祭','Stop the sacrifice'],['击败 3 个裂隙侍祭','Defeat 3 Rift Acolytes'],['city_acolyte'],3,'city',2);
level('city-final-level',90);
kill('city-empty-king',['王冠之下','Beneath the crown'],['击败空冠之王','Defeat the Empty-Crowned King'],['emptyking'],1,'city');
talk('city-aftermath','eira',['无人之冠','A crown without a king'],['王冠终于落下了。谢谢你，王城里的幸存者能重见天日了。但核心深处仍传来回声：国王只是被选中的容器。真正唤醒它的东西，还在更远的地方。','The crown has finally fallen. Thank you. The survivors can see daylight again. Yet an echo remains deep within the core: the king was only a chosen vessel. Whatever awakened it is still out there.'],{xp:1500000,coins:15000,materials:{core:400}});

// Keep the original numeric save format readable after adding story interludes.
const LEGACY_QUEST_IDS=steps.map(q=>q.id);
function interlude(before:string,minimum:number,npc:string,map:string,x:number,z:number,title:Text,dialogue:Text,objects:{id:string;name:Text;x:number;z:number;text:Text}[],xp:number,coins:number){
 const start=steps.length;
 level(before+'-prepare',minimum);
 talk(before+'-brief',npc,title,dialogue);
 for(const o of objects){QUEST_NPCS[o.id]??={name:o.name[0],en:o.name[1],map,x:o.x,z:o.z,role:['任务地点','Story location']};talk(before+'-'+o.id,o.id,o.name,o.text,{xp:Math.floor(xp/(objects.length+1)),coins:Math.floor(coins/(objects.length+1))},['调查并完成','Investigate and finish']);}
 if(before==='reach-twenty')kill(before+'-pursuers',['清理追兵','Clear the pursuers'],['击败 3 个中部猎手，打通哨兵的回程','Defeat 3 hunters in the hunting grounds to clear the watchman’s return route'],['hunter'],3,'tribe',1);
 if(before==='reach-fifty')kill(before+'-pursuers',['保住研究成果','Protect the findings'],['击败 3 个棘枝猎手，阻止它们破坏刻印','Defeat 3 Thornstalkers before they damage the inscriptions'],['thorn'],3,'forest');
 talk(before+'-report',npc,['带回消息','Report your findings'],['你带回的消息让我们有了下一步计划。收下补给，继续磨练你的力量，然后接下挑战。','Your findings give us a way forward. Take these supplies, continue honing your abilities, then face the next challenge.'],{xp:Math.ceil(xp/(objects.length+1)),coins:Math.ceil(coins/(objects.length+1))});
 const added=steps.splice(start);const index=steps.findIndex(q=>q.id===before);steps.splice(index,0,...added);
}
QUEST_NPCS.watchman={name:'失联哨兵',en:'Stranded Watchman',map:'tribe',x:8,z:325,role:['受伤的巡逻者','Wounded Patroller']};
interlude('reach-twenty',15,'tok','tribe',0,0,['失联的哨兵','The missing watchman'],['巡逻队失联了。先找到哨兵，再沿猎道检查三根封印石柱，阻止祭坛继续召集兽群。','Our patrol is missing. Find the watchman, then inspect three seal pillars along the trail before the altar calls more beasts.'],[
 {id:'watchman',name:['救援哨兵','Aid the watchman'],x:8,z:325,text:['我还能自己走，但石柱已经裂开。替我关闭沿路的三个回路，我就能安全返回猎道入口。','I can still walk, but the pillars are cracked. Close the three circuits along the trail so I can safely return to the entrance.']},
 ...[260,300,340].map((z,i):{id:string;name:Text;x:number;z:number;text:Text}=>({id:'tribe'+i+'seal',name:['封印石柱 '+(i+1),'Seal Pillar '+(i+1)],x:i%2?8:-8,z,text:['你重新接通石柱，裂隙的低鸣逐渐消退。','You reconnect the pillar. The low hum of the rift begins to fade.']}))],9000,100);
interlude('reach-thirty',25,'raka','tribe',0,0,['祭坛的回声','Echoes of the altar'],['戈拉什的力量在沿着图腾传播。检查外围的两座旧图腾，找出力量流向，然后回来告诉我。','Gorash spreads his power through the totems. Inspect two old totems in the outer territory and trace the flow of energy.'],[600,720].map((z,i)=>({id:'outer'+i+'seal',name:['旧图腾 '+(i+1),'Old Totem '+(i+1)],x:i?10:-10,z,text:['图腾上的纹路朝向最深处的祭坛。你切断了它与兽群的联系。','The markings point toward the deepest altar. You sever its link to the beasts.']})),45000,250);
interlude('reach-forty',35,'mira','forest',0,0,['苏醒的根脉','Awakening roots'],['树根正在吞噬林地的水源。检查林口的根结与石径边的泉眼，再回来找我。','The roots are draining the woodland springs. Inspect the root knot and the spring beside the stone trail, then return to me.'],[{id:'rootsseal',name:['异常根结','Disturbed Root Knot'],x:0,z:52,text:['你松开缠绕的根须，发现能量正流向森林交界。','You loosen the tangled roots and discover energy flowing toward the woodland crossing.']},{id:'springseal',name:['干涸泉眼','Dry Spring'],x:0,z:92,text:['清除泉眼里的晶屑后，细小的水流重新出现。','You clear crystal debris from the spring. A thin stream begins flowing again.']}],120000,600);
interlude('reach-fifty',45,'ilun','forest',0,0,['古树的记忆','Memories of the elder trees'],['高台上的刻印记录了五行祭坛的来历。调查两处树旁刻印，我会帮你解读。','The terrace inscriptions record the origin of the five altars. Investigate two carvings beside the trees and I will decipher them.'],[150,180].map((z,i)=>({id:'tree'+i+'seal',name:['古树刻印 '+(i+1),'Elder Inscription '+(i+1)],x:0,z,text:['刻印揭示祭坛是封印，而不是供奉巨人的神庙。','The inscription reveals that the altars are seals, not temples built to worship giants.']})),240000,1200);
interlude('reach-sixty',55,'sen','forest',0,0,['重新连接五行','Reconnect the five'],['先检查通道附近的三处引流石，恢复祭坛之间的联系。保持距离，不要惊动水晶巨人。','Inspect three channeling stones near the passage to reconnect the altars. Keep your distance from the crystal titans.'],[240,260,280].map((z,i)=>({id:'flow'+i+'seal',name:['五行引流石 '+(i+1),'Channeling Stone '+(i+1)],x:55,z,text:['石纹重新亮起，一束能量流回五行祭坛。','The carved lines light up and a stream of energy returns to the five altars.']})),420000,2000);
interlude('city-level',65,'gruk','tribe',0,0,['旧王城的信号','A signal from the old city'],['王城的求救信号出现在部落旧哨站。检查两处信号石，找到幸存者留下的路线。','A distress signal from the city has reached our old outposts. Inspect two signal stones and find the route left by the survivors.'],[80,160].map((z,i)=>({id:'signal'+i+'seal',name:['求救信号石 '+(i+1),'Distress Signal Stone '+(i+1)],x:8,z,text:['残存的记录指向王城幸存者薇娅。你记下了进入废城的路线。','The surviving record points to Veya, a city survivor. You record the route into the ruins.']})),650000,3500);
interlude('city-final-level',85,'eira','city',0,0,['王冠的弱点','The crown’s weakness'],['进核心殿前，查阅街区里两处卫队记录。国王受伤时会撕开裂隙，但卫队可能留下了躲避的方法。','Before entering the Core Hall, inspect two guard records in the district. The wounded king tears open rifts, but the guards may have recorded a way to evade them.'],[{id:'guardrecordseal',name:['卫队战斗记录','Guard Combat Record'],x:-10,z:220,text:['记录提醒你观察地面的蓝色预兆，提前离开裂隙落点。','The record warns you to watch the blue marks and leave the rift impact zones early.']},{id:'crownrecordseal',name:['王冠裂隙记录','Crown Rift Record'],x:10,z:325,text:['记录显示空冠在半血后会加快撕裂。你将情报带回给艾拉。','The record shows that the crown tears rifts faster below half health. Bring this warning to Eira.']}],1000000,5000);

// Snapshot revision 2 before inserting more objectives: numeric saves must retain their quest ID.
const REVISION_TWO_IDS=steps.map(q=>q.id);
const errandsStart=steps.length;
talk('tribe-recovery-brief','tok',['重建猎道','Rebuild the hunting trail'],['不用急着挑战酋长。巡逻队留下了几件急事：查清足迹、修复防线，再把补给送到哨兵那里。每完成一件都会给你报酬。','There is no need to challenge the chieftain yet. The patrol needs help tracing tracks, repairing defenses and delivering supplies to the watchman. You will be paid for each task.']);
const recoverySites:{id:string;name:Text;x:number;z:number;text:Text;reply:Text}[]=[
 {id:'tracksseal',name:['折断的骨矛','Broken Bone Spear'],x:-8,z:230,text:['骨矛旁的足迹绕开了大门，沿西侧进入猎道。你记录了袭击者的路线。','Tracks beside the spear bypass the gate and enter from the west. You record the attackers’ route.'],reply:['记录足迹','Record the tracks']},
 {id:'trailseal',name:['散落的巡逻标记','Scattered Patrol Markers'],x:8,z:250,text:['你把散落的标记重新立起，指出一条避开兽群的回程路线。','You put the fallen markers back in place, marking a return route away from the beasts.'],reply:['恢复路标','Restore the markers']},
 {id:'timberseal',name:['防线木料','Defense Timber'],x:-8,z:270,text:['这批木料仍然能用。你整理好木料，留给哨兵修补防线。','This timber is still usable. You sort it for the watchmen to repair the defenses.'],reply:['整理木料','Sort the timber']},
 {id:'barricadeseal',name:['破损的防线','Damaged Defense'],x:8,z:280,text:['你用附近的木料加固了防线，巡逻队终于有了可以退守的位置。','You reinforce the defense with nearby timber, giving the patrol a place to fall back to.'],reply:['加固防线','Reinforce the defense']},
 {id:'suppliesseal',name:['遗落的补给','Abandoned Supplies'],x:-8,z:290,text:['补给没有被破坏。你清点并封好包裹，准备交给失联哨兵。','The supplies are intact. You count and seal the packages for the stranded watchman.'],reply:['整理补给','Pack the supplies']},
 {id:'signalrepairseal',name:['熄灭的信号柱','Dark Signal Post'],x:8,z:310,text:['你接好松脱的回路，信号柱重新发亮。入口的托克现在能看到巡逻队的信号了。','You reconnect the loose circuit. The post lights up, sending the patrol’s signal back to Tok.'],reply:['修复信号','Restore the signal']},
 {id:'smalltotemseal',name:['猎道召集图腾','Trail Muster Totem'],x:-8,z:350,text:['你关闭图腾的召集回路。这里的低鸣消失了，哨兵不必再靠近酋长营地。','You shut down the totem’s muster circuit. Its hum fades, sparing the watchman a trip to the chieftain’s camp.'],reply:['关闭图腾','Disable the totem']}
];
for(const o of recoverySites){QUEST_NPCS[o.id]={name:o.name[0],en:o.name[1],map:'tribe',x:o.x,z:o.z,role:['猎道事务','Trail Errand']};talk('tribe-recovery-'+o.id,o.id,o.name,o.text,{xp:15000,coins:30},o.reply)}
talk('tribe-recovery-deliver','watchman',['补给送达','Supplies delivered'],['补给和信号都恢复了！我会带巡逻队安全返回，不需要你替我们挑战酋长。带上这些血瓶，你也该休整一下。','Supplies and signals are restored! I can lead the patrol home without asking you to fight the chieftain. Take these potions and catch your breath.'],{xp:30000,coins:60,potions:{minor:2}},['交付补给','Deliver the supplies']);
talk('tribe-recovery-report','tok',['猎道重新亮起','The trail lights up again'],['你做的这些事让整条猎道恢复了联系。这份报酬是你应得的，血瓶也替你备好了。等准备充分，再考虑酋长。','Your work has reconnected the whole trail. You have earned this payment, and I have prepared potions for you. Face the chieftain only when you are ready.'],{xp:50000,coins:100,potions:{minor:3}});
const recoverySteps=steps.splice(errandsStart);steps.splice(steps.findIndex(q=>q.id==='reach-twenty'),0,...recoverySteps);
// Preserve revision-3 IDs before inserting combat objectives into the errands.
const REVISION_THREE_IDS=steps.map(q=>q.id);
for(const [before,id,title,goal,kinds,count]of [
 ['tribe-recovery-trailseal','trackers',['驱散追猎者','Break the pursuit'],['击败20个中部碎牙猎手，再恢复巡逻路标','Defeat 20 hunters in the middle territory, then restore the patrol markers'],['hunter'],20],
 ['tribe-recovery-suppliesseal','defense',['守住防线','Hold the defense'],['击败25个中部穴居兽或碎牙猎手，再回收补给','Defeat 25 Grox or hunters in the middle territory, then recover the supplies'],['grox','hunter'],25],
 ['tribe-recovery-smalltotemseal','muster',['切断集结','Break the muster'],['击败30个中部穴居兽或碎牙猎手，再关闭召集图腾','Defeat 30 Grox or hunters in the middle territory, then disable the muster totem'],['grox','hunter'],30]
] as const){const start=steps.length;kill('tribe-recovery-'+id,title as Text,goal as Text,[...kinds],count,'tribe',1);steps[start].reward={xp:10000};const added=steps.splice(start);steps.splice(steps.findIndex(q=>q.id===before),0,...added)}
for(const q of steps){if(q.id==='tribe-recovery-deliver')q.reward!.xp=15000;if(q.id==='tribe-recovery-report')q.reward!.xp=25000}
const REVISION_FOUR_IDS=steps.map(q=>q.id),outerStart=steps.length;
level('tribe-outer-reach21',21);
talk('tribe-outer-tok','tok',['余波未平','Aftershocks'],['酋长倒下后，猎手仍在试探防线。清理20个中部猎手，再把情况告诉哨兵。别急着直奔祭坛。','The chieftain is gone, but hunters still probe our defenses. Defeat 20 hunters in the middle territory, then report to the watchman. Do not rush to the altar.'],{xp:1500});
kill('tribe-outer-patrol',['巡逻猎道','Patrol the trail'],['击败20个中部碎牙猎手','Defeat 20 hunters in the middle territory'],['hunter'],20,'tribe',1);
talk('tribe-outer-watchman','watchman',['交接巡逻','Hand over the patrol'],['防线终于能轮换了。我发现有兽群往外围移动，等你升到22级，去找拉卡问问它们的去向。','We can finally rotate the watch. Beasts are moving toward the outer territory. Reach level 22, then ask Raka where they are heading.'],{xp:2000});
level('tribe-outer-reach22',22);
talk('tribe-outer-raka','raka',['外围的动静','Trouble beyond the gate'],['兽群没有散去，而是在绕着外围集结。清理20只外围穴居兽，我来判断祭坛的信号。','The beasts are gathering around the outer territory. Defeat 20 outer Grox while I study the altar signals.'],{xp:1500});
kill('tribe-outer-grox20',['打散集结','Disrupt the gathering'],['击败20只外围穴居兽','Defeat 20 Grox in the outer territory'],['grox'],20,'tribe',2);
talk('tribe-outer-findings','raka',['兽群的方向','Where the beasts are heading'],['它们都在响应同一个图腾。先磨练到23级，再去西侧检查旧图腾。不要靠近最深处的祭坛。','They all answer the same totem. Reach level 23, then inspect the old western totem. Stay away from the deepest altar.'],{xp:2000});
level('tribe-outer-reach23',23);
QUEST_NPCS.outerpatrolseal={name:'外围巡逻图腾',en:'Outer Patrol Totem',map:'tribe',x:-10,z:555,role:['任务地点','Story location']};
talk('tribe-outer-totem','outerpatrolseal',['截获召集信号','Intercept the muster signal'],['图腾刻纹正向祭坛传递讯息。你记下频率，准备交给拉卡。','The carvings relay a signal toward the altar. You record its rhythm for Raka.'],{xp:1500},['记录信号','Record the signal']);
talk('tribe-outer-report','raka',['准备向外推进','Prepare to push outward'],['信号已经确认了。接下来我们要为25级的外围行动做准备。','The signal is confirmed. We must now prepare for the level-25 operation.'],{xp:1500});
// Keep this saved step ID as an automatically fulfilled bridge, not an XP gate.
level('tribe-outer-half23',1);
talk('tribe-outer-ready25','raka',['整装待发','Ready for the next push'],['你已经能在外围站稳脚跟了。接下来升到25级，然后回来一起清理祭坛外围。保持训练，别冒进。','You can now hold your ground outside. Reach level 25, then return to clear the altar outskirts. Keep training and do not overextend.']);
level('tribe-outer-reach25',25);
const outerSteps=steps.splice(outerStart);steps.splice(steps.findIndex(q=>q.id==='raka-scout'),0,...outerSteps);
// Revision 5 is a stable snapshot for existing numeric quest saves.
const REVISION_FIVE_IDS=steps.map(q=>q.id);
const patrols:[string,string,string,string[],number|undefined,string,Text][]=[
 ['reach-five','gruk','tribe',['grox'],0,'signal0seal',['出生点外的穴居兽','Grox outside the camp']],
 ['reach-twenty-prepare','tok','tribe',['hunter'],1,'tracksseal',['中部碎牙猎手','hunters in the middle territory']],
 ['reach-twenty','tok','tribe',['grox','hunter'],1,'trailseal',['中部穴居兽或碎牙猎手','Grox or hunters in the middle territory']],
 ['tribe-outer-reach21','tok','tribe',['hunter'],1,'tracksseal',['中部碎牙猎手','hunters in the middle territory']],
 ['tribe-outer-reach22','watchman','tribe',['grox','hunter'],1,'trailseal',['中部穴居兽或碎牙猎手','Grox or hunters in the middle territory']],
 ['tribe-outer-reach23','raka','tribe',['grox','hunter'],2,'outerpatrolseal',['外围穴居兽或碎牙猎手','Grox or hunters in the outer territory']],
 ['tribe-outer-reach25','raka','tribe',['grox','hunter'],2,'outerpatrolseal',['外围穴居兽或碎牙猎手','Grox or hunters in the outer territory']],
 ['reach-thirty-prepare','raka','tribe',['grox','hunter'],2,'outer0seal',['外围穴居兽或碎牙猎手','Grox or hunters in the outer territory']],
 ['reach-thirty','raka','tribe',['grox','hunter'],2,'outer1seal',['外围穴居兽或碎牙猎手','Grox or hunters in the outer territory']],
 ['reach-forty-prepare','mira','forest',['mossling'],0,'rootsseal',['森林入口苔甲兽','Mossbacks in the woodland']],
 ['reach-forty','mira','forest',['mossling'],0,'springseal',['森林入口苔甲兽','Mossbacks in the woodland']],
 ['reach-fifty-prepare','ilun','forest',['thorn'],1,'tree0seal',['高台棘枝猎手','Thornstalkers on the terrace']],
 ['reach-fifty','ilun','forest',['thorn'],1,'tree1seal',['高台棘枝猎手','Thornstalkers on the terrace']],
 ['reach-sixty-prepare','sen','forest',['sentinel'],2,'flow0seal',['祭坛区域晶壳守卫','Crystal Sentinels around the altars']],
 ['reach-sixty','sen','forest',['sentinel'],2,'flow1seal',['祭坛区域晶壳守卫','Crystal Sentinels around the altars']],
 ['city-level-prepare','sen','forest',['sentinel'],2,'flow2seal',['祭坛区域晶壳守卫','Crystal Sentinels around the altars']],
 ['city-level','sen','forest',['sentinel'],2,'flow2seal',['祭坛区域晶壳守卫','Crystal Sentinels around the altars']],
 ['city-final-level-prepare','eira','city',['city_guard'],1,'guardrecordseal',['街区空誓守卫','Hollow Oathguards in the district']],
 ['city-final-level','eira','city',['city_guard','city_acolyte'],undefined,'crownrecordseal',['空誓守卫或裂隙侍祭','Hollow Oathguards or Rift Acolytes']]
];
for(const [gate,npc,map,kinds,region,object,names]of patrols){const at=steps.findIndex(q=>q.id===gate);if(at<0)continue;const target=steps[at].level!,start=steps.length;
 talk(gate+'-patrol-brief',npc,['巡猎安排','Patrol assignment'],['继续成长到'+target+'级。这段时间我们也需要你巡猎、检查线索，完成一段就回来交接。','Keep training toward level '+target+'. Help us patrol and investigate between hunts; report after each assignment.']);
 kill(gate+'-patrol-hunt',['巡猎清障','Clear the patrol route'],['击败20个'+names[0],'Defeat 20 '+names[1]],kinds,20,map,region);
 const site=QUEST_NPCS[object]?object:npc;
 talk(gate+'-patrol-investigate',site,['确认巡逻线索','Check the patrol clues'],['附近的痕迹已经记录下来。把消息带回去，准备下一段巡猎。','You record the nearby traces. Bring the findings back and prepare for the next patrol.'],undefined,['记录线索','Record the findings']);
 talk(gate+'-patrol-report',npc,['巡逻交接','Patrol handover'],['线索收到了。再清理25个'+names[0]+'，我们就能安排下一班巡逻。','Findings received. Defeat another 25 '+names[1]+' so we can send out the next patrol.']);
 kill(gate+'-patrol-second',['掩护下一班巡逻','Cover the next patrol'],['击败25个'+names[0],'Defeat 25 '+names[1]],kinds,25,map,region);
 talk(gate+'-patrol-finish',npc,['巡猎回报','Patrol report'],['这一段巡猎结束了。如果还没到'+target+'级，就继续下一轮；准备好后，我们会接着推进主线。','This patrol is complete. If you are below level '+target+', take the next patrol. Once ready, continue the main story.']);
 const added=steps.splice(start);for(const q of added)q.patrol={target,gate};added[0].patrol!.first=true;added.at(-1)!.patrol!.last=true;steps.splice(at,0,...added);
}
// Budget direct story XP against each level interval, never raise a small reward.
// Kill XP (including required kills) remains the main source of progression.
export const QUEST_XP_BUDGETS:{from:number;to:number;budget:number;awarded:number}[]=[];
let budgetStart=0,budgetLevel=1;
function capStoryXP(end:number,target:number){let required=0;for(let l=budgetLevel;l<target;l++)required+=xpRewardBase(l);const quests=steps.slice(budgetStart,end),total=quests.reduce((n,q)=>n+(q.reward?.xp||0),0),budget=Math.floor(required*.2),scale=total>budget?budget/total:1;for(const q of quests)if(q.reward?.xp)q.reward.xp=Math.floor(q.reward.xp*scale);QUEST_XP_BUDGETS.push({from:budgetLevel,to:target,budget,awarded:quests.reduce((n,q)=>n+(q.reward?.xp||0),0)});budgetStart=end;budgetLevel=target}
for(let i=0;i<steps.length;i++){const q=steps[i];if(q.kind==='level'&&Number.isInteger(q.level)&&q.level!>budgetLevel)capStoryXP(i+1,q.level!)}
if(budgetStart<steps.length)capStoryXP(steps.length,Math.max(100,budgetLevel+5));
// Every completed patrol step pays level-scaled XP outside the one-time story budget.
for(const q of steps)if(q.patrol)q.reward={xpFraction:.03};
for(const q of steps)if(q.npc?.endsWith('seal')){const n=QUEST_NPCS[q.npc],kind=/timber|barricade|repair|trail/.test(q.npc)?['修复','Repair ']:/supplies/.test(q.npc)?['整理','Pack ']:/tracks|record|signal0/.test(q.npc)?['调查','Inspect ']:['操作','Operate '];q.goal=[kind[0]+n.name,kind[1]+n.en]}
// Append the new chapter: existing saved numeric quest indices are preserved.
Object.assign(QUEST_NPCS,BLIGHT_NPCS);for(const q of BLIGHT_QUESTS)if(q.kind==='talk'&&q.npc){const n=QUEST_NPCS[q.npc];q.goal=[(q.npc.endsWith('seal')?'操作':'与')+n.name+(q.npc.endsWith('seal')?'':'交谈'),(q.npc.endsWith('seal')?'Interact with ':'Talk to ')+n.en]}steps.push(...BLIGHT_QUESTS);Object.assign(QUEST_NPCS,SANCTUM_NPCS);for(const q of SANCTUM_QUESTS)if(q.kind==='talk'&&q.npc){const n=QUEST_NPCS[q.npc];q.goal=[(q.npc.endsWith('seal')?'操作':'与')+n.name+(q.npc.endsWith('seal')?'':'交谈'),(q.npc.endsWith('seal')?'Interact with ':'Talk to ')+n.en]}steps.push(...SANCTUM_QUESTS);
for(const n of Object.values(QUEST_NPCS))if(n.map==='tribe')n.z=tribeCompactZ(n.z);
for(const q of steps)if(q.map==='tribe'&&q.z!==undefined)q.z=tribeCompactZ(q.z);
export const REVISION_SIX_IDS=steps.map(q=>q.id);
for(const [before,map,region,npc,kind,zh,en]of BESTIARY_HUNTS){const at=steps.findIndex(q=>q.id===before);if(at<0||!QUEST_NPCS[npc])throw new Error('Invalid bestiary story link: '+before);const added=bestiaryQuestSteps(before,map,region,npc,kind,zh,en);added[0].goal=['与'+QUEST_NPCS[npc].name+'交谈','Talk to '+QUEST_NPCS[npc].en];steps.splice(at,0,...added)}
// Append only after all legacy insertions. Revision 7 indices, including its old
// end-of-story sentinel, now point naturally into this continuation.
Object.assign(QUEST_NPCS,STARFALL_NPCS);
for(const q of STARFALL_QUESTS)if(q.kind==='talk'&&q.npc){const n=QUEST_NPCS[q.npc];q.goal=[(q.npc.endsWith('seal')?'操作':'与')+n.name+(q.npc.endsWith('seal')?'':'交谈'),(q.npc.endsWith('seal')?'Interact with ':'Talk to ')+n.en]}
steps.push(...STARFALL_QUESTS);
Object.assign(QUEST_NPCS,FROSTCOURT_NPCS);
for(const q of FROSTCOURT_QUESTS)if(q.kind==='talk'&&q.npc){const n=QUEST_NPCS[q.npc];q.goal=[(q.npc.endsWith('seal')?'操作':'与')+n.name+(q.npc.endsWith('seal')?'':'交谈'),(q.npc.endsWith('seal')?'Interact with ':'Talk to ')+n.en]}
steps.push(...FROSTCOURT_QUESTS);
Object.assign(QUEST_NPCS,SKYREACH_NPCS);for(const q of SKYREACH_QUESTS)if(q.kind==='talk'&&q.npc){const n=QUEST_NPCS[q.npc];q.goal=[(q.npc.endsWith('seal')?'操作':'与')+n.name+(q.npc.endsWith('seal')?'':'交谈'),(q.npc.endsWith('seal')?'Interact with ':'Talk to ')+n.en]}steps.push(...SKYREACH_QUESTS);
Object.assign(QUEST_NPCS,DUNES_NPCS);for(const q of DUNES_QUESTS)if(q.kind==='talk'&&q.npc){const n=QUEST_NPCS[q.npc];q.goal=[(q.npc.endsWith('seal')?'操作':'与')+n.name+(q.npc.endsWith('seal')?'':'交谈'),(q.npc.endsWith('seal')?'Interact with ':'Talk to ')+n.en]}steps.push(...DUNES_QUESTS);
export const MAIN_QUESTS:readonly QuestStep[]=steps;
// Preserve numeric saves while retiring the opening combat gate and extra dialogue.
for(const id of ['grox-five','gruk-reward'])steps.find(q=>q.id===id)!.kind='openingSkip';
export type QuestEvent={kind:string;map?:string;npc?:string;id?:string;monster?:{kind:string;level:number;region:number};};
export function questState(p:AncientProfile):QuestState{const state=p.quest??={step:0,count:0,revision:7};if(state.revision!==7){const sequence=(state.revision===6?REVISION_SIX_IDS:state.revision===5?REVISION_FIVE_IDS:state.revision===4?REVISION_FOUR_IDS:state.revision===3?REVISION_THREE_IDS:state.revision===2?REVISION_TWO_IDS:LEGACY_QUEST_IDS),id=sequence[state.step];state.step=id?MAIN_QUESTS.findIndex(q=>q.id===id):state.step===sequence.length?(state.revision===6?MAIN_QUESTS.findIndex(q=>q.id==='starfall-signal'):MAIN_QUESTS.findIndex(q=>q.id==='city-aftermath')+1):MAIN_QUESTS.length;const q=MAIN_QUESTS[state.step],bridge=id&&MAIN_QUESTS.findIndex(q=>q.id===id+'-prepare');if((state.revision||1)<3&&id==='reach-twenty'&&p.level<20){state.step=MAIN_QUESTS.findIndex(q=>q.id==='tribe-recovery-brief');state.count=0}else if((state.revision||1)<2&&q?.kind==='level'&&p.level<q.level!&&typeof bridge==='number'&&bridge>=0){state.step=bridge;state.count=0}if((state.revision||1)>=5&&q?.kind==='level'&&p.level<q.level!){const patrol=MAIN_QUESTS.findIndex(v=>v.id===id+'-patrol-brief');if(patrol>=0){state.step=patrol;state.count=0}}state.revision=7}return state}
export function currentQuest(p:AncientProfile){return MAIN_QUESTS[questState(p).step]}
export function questText(text:Text,p:AncientProfile,english=false){const job=p.profession&&Object.hasOwn(PROFESSIONS,p.profession)?PROFESSIONS[p.profession]:undefined;return text[english?1:0].replaceAll('{job}',job?(english?job.en:job.name):(english?'Your profession':'你的职业')).replaceAll('{zskill}',job?(english?SKILLS[job.skills[1]].en:SKILLS[job.skills[1]].name):'Z').replaceAll('{cskill}',job?(english?SKILLS[job.skills[2]].en:SKILLS[job.skills[2]].name):'C')}
export function questRewardInfo(p:AncientProfile,q:QuestStep){const r=q.reward,result:Reward=r?.xpFraction?{...r,xp:Math.max(1,Math.floor(xpRewardBase(p.level)*r.xpFraction))}:{...r};if(q.kind==='kill'||q.patrol?.last){result.coins=(result.coins||0)+Math.min(100,Math.max(2,p.level*2));if((q.count||0)>=20||q.patrol?.last){const potion=p.level<30?'minor':p.level<70?'medium':p.level<100?'major':'superior';result.potions={...result.potions,[potion]:(result.potions?.[potion]||0)+1}}}if(result.potions){const order=['minor','medium','major','superior','ultimate'],upgraded:Record<string,number>={};for(const [key,count]of Object.entries(result.potions)){const index=order.indexOf(key),next=index<0?key:order[Math.min(index+1,order.length-1)];upgraded[next]=(upgraded[next]||0)+count}result.potions=upgraded}return Object.keys(result).length?result:undefined}
export function questReward(p:AncientProfile,q:QuestStep){const r=questRewardInfo(p,q);if(!r)return;if(r.unlockPurification)p.purificationUnlocked=true;if(r.xp)gainXP(p,r.xp);for(const [key,n]of Object.entries(r.potions||{}))p.potions[key]=(p.potions[key]||0)+n;if(r.coins)p.coins=Math.round((p.coins+r.coins)*100)/100;for(const [key,n]of Object.entries(r.materials||{}))p.materials[key]=(p.materials[key]||0)+n;const job=p.profession&&PROFESSIONS[p.profession];if(job){const index=r.qBook?0:q.id==='tok-second'?1:q.id==='tok-third'?2:-1;if(index>=0){const key=skillBook(job.skills[index]);p.materials[key]=(p.materials[key]||0)+1}}}
function fulfilled(p:AncientProfile,q:QuestStep,e?:QuestEvent){const job=p.profession&&PROFESSIONS[p.profession];if(q.kind==='openingSkip')return true;if(q.kind==='level'){const target=q.level!,whole=Math.floor(target);return p.level>=Math.ceil(target)||(p.level===whole&&p.xp>=xpNeeded(whole)*(target-whole))};if(q.kind==='profession')return !!job;if(q.kind==='useQ')return !!job&&e?.kind==='skill'&&e.id===job.skills[0];if(q.kind.startsWith('train')){const index={trainQ:0,trainZ:1,trainC:2}[q.kind];return !!job&&index!==undefined&&(p.skills?.[job.skills[index]]||0)>=1}if(q.kind==='equipGear')return !!p.gearEquipped?.weapon;if(q.kind==='upgrade')return e?.kind==='upgrade'||p.weapons.some(w=>w.level>1||w.stars>1);if(q.kind==='buyPotion')return e?.kind==='buyPotion'||Object.values(p.potions).some(n=>n>0);if(q.kind==='mirrors')return e?.kind==='mirrors'&&e.map===q.map;if(q.kind==='defend')return e?.kind==='defend'&&e.map===q.map;if(q.kind==='enter')return e?.kind==='enter'&&e.map===q.map;return false}
// Events are produced only by authoritative map entry / combat / dialogue handlers.
export function advanceQuest(p:AncientProfile,e?:QuestEvent){const state=questState(p),completed:string[]=[];let event=e;for(let i=0;i<MAIN_QUESTS.length;i++){const q=currentQuest(p);if(!q)break;const finishing=q.kind==='talk'?event?.kind==='talk'&&event.npc===q.npc&&event.map===q.map:q.kind==='kill'&&event?.kind==='kill'&&event.map===q.map&&q.kinds?.includes(event.monster!.kind)&&(q.region===undefined||event.monster!.region===q.region)&&state.count+1>=q.count!;if(q.patrol&&p.level>=q.patrol.target&&!finishing){state.step=MAIN_QUESTS.findIndex(v=>v.id===q.patrol!.gate);state.count=0;continue}let done=false;if(q.kind==='talk')done=event?.kind==='talk'&&event.npc===q.npc&&event.map===q.map;else if(q.kind==='absorb'){if(event?.kind==='absorb'&&event.map===q.map)state.count=Math.min(q.count!,state.count+1);done=state.count>=q.count!}else if(q.kind==='kill'){if(event?.kind==='kill'&&event.map===q.map&&q.kinds?.includes(event.monster!.kind)&&(q.region===undefined||event.monster!.region===q.region)&&(q.id!=='grox-five'||event.monster!.level>=1&&event.monster!.level<=5))state.count=Math.min(q.count!,state.count+1);done=state.count>=q.count!}else done=fulfilled(p,q,event);if(!done)break;questReward(p,q);completed.push(q.id);state.step++;state.count=0;if(q.patrol?.last&&p.level<q.patrol.target)state.step=MAIN_QUESTS.findIndex(v=>v.id===q.patrol!.gate+'-patrol-brief');event=event?.map?{kind:'check',map:event.map}:undefined;}return completed}
export function questCanTalk(p:AncientProfile,npc:string,a:{x:number;z:number;hp:number;map?:string},clear?:(ax:number,az:number,bx:number,bz:number)=>boolean){if(!Object.hasOwn(QUEST_NPCS,npc))return false;const n=QUEST_NPCS[npc as keyof typeof QUEST_NPCS],q=currentQuest(p);return !!q&&q.kind==='talk'&&q.npc===npc&&a.hp>0&&(a.map||'tribe')===n.map&&Math.hypot(a.x-n.x,a.z-n.z)<=(npc.endsWith('seal')?4:7)&&(!clear||clear(a.x,a.z,n.x,n.z))}
