// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {GUIDE_FPS} from './game-guide-fps.generated';
import {PROFESSIONS,SKILLS,skillDescription,skillTrainingCost} from './ancient-skills';
import {HOLY_DESCRIPTIONS,holySkillDetails,ASCENSION_STEPS} from './ancient-ascension';
import {PROFESSION_BRANCHES} from './ancient-branches';
import {GEAR,gearName,gearDescription,GEAR_LEVELS,GEAR_QUALITIES} from './ancient-gear';
import {ANCIENT_POTIONS} from './ancient-rules';
import {ANCIENT_SUPPLIES,supplyDescription} from './ancient-commerce';
import {MAIN_QUESTS,QUEST_NPCS} from './ancient-quests';
import {MAP_LIMITS} from './ancient-community';
import {JADE_FUSION_COUNT} from './ancient-jade-fusion';
import {JADE_GRADES,JADE_VARIETIES} from './ancient-jade-stonework';
import {BEAD_LIMIT} from './ancient-collections';
import {SURVIVAL_SKILLS} from './survival-rules';
export type GuideDoc={id:string;category:string;title:string;text:string;source:string};
export const GUIDE_CATEGORIES=[['skills','职业与技能','Professions & skills'],['gear','装备与武器','Equipment & weapons'],['quests','主线与NPC','Quests & NPCs'],['shop','商店与药水','Shop & potions'],['jade','玉石与藏品','Jade & collections'],['community','社区地图','Community maps'],['fps','FPS与高塔生存','FPS & tower survival'],['account','账号与操作','Account & controls']] as const;
// Only public definitions. No account profiles, passwords, admin secrets, or player code enter this corpus.
export function guideDocuments(category:string,en=false,level=1):GuideDoc[]{
 const out:GuideDoc[]=[],L=(zh:string,eng:string)=>en?eng:zh;
 const add=(id:string,title:string,text:string,source:string)=>out.push({id,category,title,text,source});
 if(category==='skills'){
  add('skills-training',L('技能升级材料','Skill training costs'),L('激活、升级在技能页面操作。以下为当前等级升到下一级的材料：','Activate and train in Skills. Materials for advancing from the current skill level:')+' '+Array.from({length:6},(_,n)=>{const c=skillTrainingCost(n);return `${n} → ${n+1}: ${c.books} ${L('本对应技能书','matching skill books')}, ${c.cores} ${L('相位核心','Phase Cores')}, ${c.coins} ${L('金币','Gold')}`}).join('; '),'ancient-skills / skillTrainingCost');
  add('ascension',L('如何升华圣级职业','How to become Holy'),L('80级，当前职业的所有技能至少5级。在技能页面查看升华，先通过试炼取得升华许可，再完成升华支线；试炼每日最多2次。','Level 80 and every skill of your current profession at least level 5. Open Skills and Ascension: earn a permit in the trial, then complete the ascension side quest. At most 2 trial attempts daily.')+' '+ASCENSION_STEPS.map(x=>x[en?1:0]).join(' → '),'ancient-ascension / ascensionEligible, ascensionStartError, ASCENSION_STEPS');
  for(const [id,p]of Object.entries(PROFESSIONS)){
   add('profession-'+id,L(p.name,p.en),p.skills.map(k=>L(SKILLS[k].name,SKILLS[k].en)+' ('+SKILLS[k].key+')').join(', ')+'\n'+(HOLY_DESCRIPTIONS[id]?.[en?1:0]||''),'ancient-skills / PROFESSIONS; ancient-ascension / HOLY_DESCRIPTIONS');
   for(const k of p.skills){const s=SKILLS[k];add('skill-'+k,L(s.name,s.en),`${L(p.name,p.en)} · ${s.key} · ${L('解锁等级','Unlock level')} ${s.unlock}
${L('技能等级','Skill level')} ${level}: ${skillDescription(k,level,en)}
${L('圣级效果','Holy effects')}: ${holySkillDetails(k,level,en)}
`+L('这是技能说明，不是你的最终实战伤害；最终伤害还受角色、装备、分支及目标影响。','This is the skill description, not your final combat damage; character stats, equipment, branches and target also matter.'),'ancient-skills / skillDescription; ancient-ascension / holySkillDetails')}
   for(const b of PROFESSION_BRANCHES[id]||[])add('branch-'+b.id,L(p.name,p.en)+' · '+L(b.name,b.en),L('30级开始选择；每个职业单独选择，选定后不能更改；先到部落找格鲁克接受引导。','Available from level 30; selected separately for each profession and cannot be changed. Speak to Gruk in the Tribe first.')+' '+b.description[en?1:0],'ancient-branches / PROFESSION_BRANCHES, chooseBranch');
  }
 }
 if(category==='gear'){
  add('gear-levels',L('品质与穿戴等级','Quality & required levels'),GEAR_QUALITIES.map((q,i)=>q[en?1:0]+': '+GEAR_LEVELS[i]).join(' · '),'ancient-gear / GEAR_QUALITIES, GEAR_LEVELS');
  for(const key of Object.keys(GEAR))add('gear-'+key,gearName(key,en),gearDescription(key,en),'ancient-gear / GEAR, gearDescription');
 }
 if(category==='quests'){
  for(const q of MAIN_QUESTS)add('quest-'+q.id,q.title[en?1:0],q.goal[en?1:0]+'\n'+[q.map&&`${L('地图','Map')}: ${q.map}`,q.npc&&`${L('NPC','NPC')}: ${QUEST_NPCS[q.npc]?L(QUEST_NPCS[q.npc].name,QUEST_NPCS[q.npc].en):q.npc}`,q.count&&`${L('数量','Count')}: ${q.count}`,q.level&&`${L('等级目标','Target level')}: ${q.level}`].filter(Boolean).join(' · ')+'\n'+L('实时奖励以主线任务 HUD 显示为准；部分任务按当前等级计算经验。','See the Main Quest HUD for current rewards; some XP rewards scale with your current level.'),'ancient-quests / MAIN_QUESTS');
  for(const [id,n]of Object.entries(QUEST_NPCS))add('npc-'+id,L(n.name,n.en),`${n.map} · X ${n.x}, Z ${n.z} · ${n.role[en?1:0]}`,'ancient-quests / QUEST_NPCS');
 }
 if(category==='shop'){
  for(const [id,p]of Object.entries(ANCIENT_POTIONS))add('potion-'+id,L(p.name,p.en),`${L('价格','Price')}: ${p.price} ${L('金币','Gold')}; ${L('恢复生命','Restores HP')}: ${p.heal}`,'ancient-rules / ANCIENT_POTIONS');
  for(const [id,s]of Object.entries(ANCIENT_SUPPLIES))add('supply-'+id,L(s.name,s.en),`${L('价格','Price')}: ${s.price} ${L('金币','Gold')}. ${supplyDescription(id,en)}`,'ancient-commerce / ANCIENT_SUPPLIES, supplyDescription');
  add('shop-limits',L('每日限购与刷新','Daily limits & reset'),L('每天每种职业技能书限购8本；每种特殊效果药水5瓶；转职书2本。按照 Irvine / America/Los_Angeles 的午夜刷新。','Each profession skill book: 8 per day; each special-effect potion: 5 per day; transfer books: 2 per day. Resets at midnight in Irvine / America/Los_Angeles.'),'ancient-commerce / ancientSkillBooksRemaining, ancientBoostsRemaining, ancientShopDay');
 }
 if(category==='jade')add('jade-beads',L('手串珠子数量','Beads per bracelet'),L(`每串最多${BEAD_LIMIT}颗珠子。藏品页面可以编串；同尺寸珠子才能串在一起。佩戴、展示、出售与交易在藏品页面操作。`,`At most ${BEAD_LIMIT} beads per bracelet. Weave beads of matching size in Collections; wear, show, sell and trade from Collections.`),'ancient-collections / BEAD_LIMIT, collectionCommand');
 if(category==='jade'){
  add('jade-fusion',L('玉饰合成升阶','Jade quality fusion'),L(`选择1件主玉饰和${JADE_FUSION_COUNT}件同品质、同类型的辅助玉饰。辅料料质越好成功率越高，高品质升阶更难。失败保留主玉饰，但消耗全部辅料。成功仅提升主玉饰品质。`,`Select 1 main collectible and ${JADE_FUSION_COUNT} auxiliaries of the same quality and type. Better auxiliary material improves the chance; higher qualities are harder to upgrade. Failure keeps the main item but consumes every auxiliary. Success upgrades the main item's quality.`),'ancient-jade-fusion / jadeFusionQuote, fuseJade');
  add('jade-wear',L('玉饰佩戴位置与属性','Wearing jade'),L('手镯或手串共用1个手腕槽，玉佛吊坠或平安扣共用1个胸前槽。珠子不能单独佩戴。加成取决于价值和品质，不提供技能冷却缩减。','Bangles and bracelets share 1 wrist slot; Buddha and peace pendants share 1 chest slot. Individual beads cannot be worn. Bonuses depend on value and quality; no skill cooldown reduction.'),'ancient-jade-wear / jadeSlot, jadeBonuses');
  add('jade-grades',L('玉料种与花色','Jade grades & varieties'),L('种：','Grades: ')+JADE_GRADES.map(g=>L(g.name,g.en)).join(', ')+'\n'+L('花色：','Varieties: ')+Object.values(JADE_VARIETIES).map(v=>L(v.name,v.en)).join(', '),'ancient-jade-stonework / JADE_GRADES; jade/varieties / JADE_VARIETIES');
  add('jade-stones',L('原石购买、打光与加工','Rough stones, light & processing'),L('原石在专门的原石页面单独选择。商店一次展示9块原石，可免费打光、换一批。未切开的原石可丢弃或上架市场。加工时先选切开的料，再选择成品并在玉面放样；是否放得下还取决于厚度、裂纹和已有取料位置。','Select individual stones in Stones. The shop offers 9 rough stones, with free light inspection and refresh. Uncut stones can be discarded or listed on the market. Select a cut piece and product, then place its outline on the jade face; fit also depends on thickness, fractures and previously used areas.'),'ancient-rough-shop; ancient-jade-stonework; jade/craft');
 }
 if(category==='community')for(const [tier,d]of Object.entries(MAP_LIMITS))add('map-tier-'+tier,L('地图等级','Map tier')+' '+tier,L(`最大面积${d.area}平方米，物体${d.objects}个，怪物刷新点${d.spawns}个，怪物等级上限${d.level}，BOSS最多${d.bosses}个、等级上限${d.bossLevel}。`,`Area up to ${d.area} m²; ${d.objects} objects; ${d.spawns} monster spawns; monster level up to ${d.level}; up to ${d.bosses} bosses at level ${d.bossLevel} or below.`),'ancient-community / MAP_LIMITS');
 if(category==='fps')for(const [id,s]of Object.entries(SURVIVAL_SKILLS))add('tower-'+id,s.name,`${L('生存点','Survival points')}: ${s.cost}; ${L('持续秒数','Duration seconds')}: ${s.duration/1000}; ${L('冷却秒数','Cooldown seconds')}: ${s.cooldown/1000}; ${L('默认按键','Default key')}: ${s.key}`,'survival-rules / SURVIVAL_SKILLS');
 if(category==='fps')for(const w of GUIDE_FPS)add('fps-'+w.id,en?w.code:w.name,`${L('裸枪基础数值；配件、护甲、距离和皮肤可改变实战结果','Base weapon stats; attachments, armor, distance and skins can change combat results')}. ${L('弹匣','Magazine')}: ${w.mag}; ${L('开火间隔毫秒','Fire interval ms')}: ${w.interval}; ${L('装填毫秒','Reload ms')}: ${w.reload}; ${L('头/身体/手臂伤害','Head/body/arm damage')}: ${w.damage.head}/${w.damage.body}/${w.damage.arm}; ${L('射程米','Range m')}: ${w.range}; ${L('弹丸数','Pellets')}: ${w.pellets}.`+(w.price===null?'':` ${L('搜打撤裸枪价格','Extraction base gun price')}: ${w.price}; ${L('普通弹每发价格','Standard ammo per round')}: ${w.ammo}.`),'game / WEAPONS; extraction-economy / GUN_PRICES, AMMO_PRICES');
 if(category==='account')add('account-help',L('账号、邮箱与设置','Account, email & settings'),L('注册后可选择绑定邮箱，也可在设置 → 账号绑定。绑定需要验证码，一个邮箱最多绑定一个账号。登录可填写账号名或绑定邮箱；忘记密码可通过已绑定邮箱的验证码重设。按键、布局和灵敏度在设置里调整。','Optionally bind an email after registering, or later in Settings → Account. Verification is required; one account per email. Sign in with your account name or bound email. Reset a forgotten password using a code sent to your bound email. Configure controls, layout and sensitivity in Settings.'),'account-email; account-email-ui; ancient-controls');
 if(category==='account')add('connection-death',L('断线、重连与死亡原因','Connection recovery & death causes'),L('同步暂停或断线时会暂停移动和攻击，系统自动重连，也可点击立即重连。浏览器离线时等待联网；登录失效时需要重新登录。死亡界面显示服务器确认的敌人、致命攻击和伤害；重新连接不会清除已记录的死亡原因，复活后清除。','Movement and attacks pause when synchronization stalls or disconnects. Reconnection is automatic, with a Reconnect now action. Browser-offline waits for connectivity; expired sessions require login. Death shows the server-confirmed enemy, fatal attack and damage. Recorded death details survive reconnect and clear after revival.'),'ancient-connection; ancient-connection-ui; ancient-damage-source; ancient-death-ui');
 return out;
}
const terms=(s:string)=>{const n=s.toLowerCase().normalize('NFKC'),t:string[]=n.match(/[a-z0-9_-]+/g)||[];for(const part of n.match(/[\p{Script=Han}]+/gu)||[])for(let i=0;i<part.length-1;i++)t.push(part.slice(i,i+2));return [...new Set(t)]};
export function findGuideDocs(docs:GuideDoc[],question:string,previous:string[]=[]){const tokens=terms(question),ranked=docs.map(d=>({d,score:tokens.reduce((s,t)=>s+(d.title.toLowerCase().includes(t)?8:d.text.toLowerCase().includes(t)?1:0),0)+(previous.includes(d.id)?1:0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);return ranked.filter(x=>x.score>=Math.max(1,(ranked[0]?.score||0)*.35)).slice(0,6).map(x=>x.d)}
