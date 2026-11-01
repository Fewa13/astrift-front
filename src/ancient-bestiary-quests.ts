// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {QuestStep} from './ancient-quests.js';
import {BESTIARY} from './ancient-bestiary.js';
export const BESTIARY_HUNTS=[
 ['tok-hunt','tribe',1,'tok','bone_shield','从正面举盾时绕侧面，或等它放下盾出招。','Flank its raised shield, or strike while it lowers the shield to attack.'],
 ['tok-chief','tribe',1,'tok','wasteland_runner','它低头后会沿直线冲撞，躲开后可以反击。','It lowers its head before a straight charge. Dodge aside and counterattack.'],
 ['tribe-recovery-smalltotemseal','tribe',1,'watchman','totem_priest','祭司在强化附近的兽群，先切断援助。','The priests strengthen nearby beasts. Cut off their support first.'],
 ['raka-gorash','tribe',2,'raka','bone_javelin','投手会在出手后换位，骨矛能侧移躲开。','Javeliners reposition after throwing. Sidestep their spears.'],
 ['mira-trace','forest',0,'mira','branch_panther','留意猎豹压低身体的动作，扑空后它会停顿。','Watch the panther crouch before pouncing. A missed pounce leaves it exposed.'],
 ['sentinels-twelve','forest',2,'sen','parasite_bloom','花妖的藤蔓正在治疗兽群，找到连接的源头。','The bloom’s vines heal nearby creatures. Find and defeat the source.'],
 ['sentinels-twelve','forest',2,'sen','crystal_wisp_metal','幼晶灵在五座祭坛附近活动，观察不同元素的攻击。','Crystal wisps gather near the five altars. Watch their different elemental attacks.'],
 ['city-watchman','city',0,'veya','oath_cavalry','骑兵冲锋前会亮起路线；避开，让障碍物阻挡它。','Its charge route lights up in advance. Dodge and let obstacles stop it.'],
 ['city-captain','city',1,'aron','chain_jailer','看到它抬起钩子就准备闪避。钩子出手后不再追踪你。','Dodge when it raises its hook. Once thrown, the hook does not track you.'],
 ['city-knight-brief','city',2,'eira','hollow_noble','胸口有完整金色纹章的才是真身，幻影很脆弱。','The true noble bears an intact golden chest crest. Its echoes are fragile.'],
 ['blight-crystals','blight',2,'lyra','brokenwing','魔禽俯冲后会落地，抓住它收起翅膀的时机。','The fiend lands after diving. Strike while its wings are folded.'],
 ['blight-lord','blight',2,'lyra','shade_prowler','黑影有地面轨迹，现身后才会扑击；不要盲追。','Its shadow leaves a visible trail. It emerges before pouncing. Do not chase blindly.'],
 ['sanctum-wraiths','sanctum',1,'lumen','refract_twin','双生者靠近时会连接，拉开它们就能削弱防护。','Twins link when close together. Separate them to weaken their protection.'],
 ['sanctum-wardens','sanctum',2,'seraph','light_deacon','光环移动不快，跳过去或从缺口通过。','The light ring moves slowly. Jump over it or pass through its gap.']
] as const;
// These hunts name a species and map, not a region. The same species can spawn
// in several regions or pursue a player across a boundary; all must count.
export function bestiaryQuestSteps(before:string,map:string,_region:number,npc:string,kind:string,zh:string,en:string):QuestStep[]{const def=BESTIARY[kind],kinds=kind.startsWith('crystal_wisp')?Object.keys(BESTIARY).filter(k=>k.startsWith('crystal_wisp')):[kind];return [{id:'bestiary-'+kind+'-brief',title:['新的威胁：'+def.name,'New Threat: '+def.en],goal:['与指定人物交谈','Talk to the marked character'],kind:'talk',map,npc,dialogue:[zh+' 帮我们击败20个，再继续前进。',en+' Defeat 20 before moving on.'],reply:['我来处理','I will handle it.']},{id:'bestiary-'+kind+'-hunt',title:['清理'+def.name,'Defeat '+def.en],goal:['击败20个'+(kind.startsWith('crystal_wisp')?'幼晶灵':def.name),'Defeat 20 '+(kind.startsWith('crystal_wisp')?'Crystal Wisps':def.en)],kind:'kill',map,kinds,count:20,reward:{xpFraction:.01}}]}
