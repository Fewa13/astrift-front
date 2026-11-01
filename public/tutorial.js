// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {getLanguage,setLanguage} from './i18n.js?v=20261008-onboarding-1';
import {accountSession} from './account.js?v=20261027-auth-recovery-1';
import {DEVICE_TUTORIAL_KEY,ACCOUNT_TUTORIAL_KEY,needsTutorial,tutorialRecord,PRACTICAL_STEPS,practicalComplete} from './tutorial-state.js?v=20261008-onboarding-1';
const TEXT={
  en:{language:'Choose your language',start:'Start tutorial',skip:'Skip tutorial',replay:'Tutorial',next:'Next',back:'Back',open:'Try it',return:'Back to tutorial',play:'Play solo',finish:'Finish tutorial',continue:'Click to continue',practical:'FIELD TRAINING',guide:'EXPLORE ASTRIFT',
    move:['Move','Walk around the glowing ring. Look around with the mouse.','⌨'],attack:['Fire','Hit the red training target.','◎'],aim:['Aim down sights','Hold aim to line up your sights.','⊕'],switch:['Switch weapons','Draw your second weapon. Both guns are different.','1 ⇄ 2'],phase:['Phase dash','Face the open gate and dash forward. Direction keys change the dash direction.','⇢'],slide:['Slide','Sprint while moving, then slide. Jump cancels a slide.','↘'],throwable:['Throw a smoke grenade','Draw it, then press fire to throw. Weapon keys put it away.','◉'],tactical:['Use tactical equipment','Activate the pulse shield. Equipment has a cooldown.','⬡'],
    sprint:'Sprint',fire:'Fire',aimKey:'Hold aim',mouse:'Mouse',ready:'Completed',lessons:[
      ['guns','Gunsmith','Choose a weapon, then fit one attachment per slot. Read the calculated damage, recoil, bullet speed and aim time.','openArmory','◎'],
      ['gear','Weapons & equipment','Choose two primary guns, an optional sidearm, armor, a helmet, a tactical gadget and a throwable. Heavy protection reduces movement speed.','openEquipment','⬡'],
      ['skills','Abilities','Phase dash and equipment are separate abilities. Jetpack uses energy; other gadgets use cooldowns. You practiced the pulse shield.','openEquipment','⇢'],
      ['solo','Solo & AI','Solo starts immediately with AI. Duel AI offers Normal, Advanced and Master. Use the practice range to test weapons and armor.','openSpecialMode','◉'],
      ['online','Multiplayer rooms','Create a room, choose a map, and give friends the six-character room code. They use Join room; you do not need to share a link.','openNormalMode','☷'],
      ['duel','Duels','Duel is a ten-minute 1v1. Both players ready up; the higher score wins. Full rooms allow spectators.','openSpecialMode','⚔'],
      ['friends','Play with friends','Log in to add friends, chat and invite them. Ordinary multiplayer supports teams; some special modes need all players to be ready.','openFriends','♧'],
      ['ranked','Ranked & season','Ranked is first to ten kills. Wins earn ranked points and season progress. Open S1 Season to view your level and claim rewards.','openSeason','◇'],
      ['special','Special modes','Capture the Flag: take and return the enemy flag. Hardpoint: hold the zone. Phase Demolition: plant or defuse the core. Weapon Master: kills earn attachment upgrades.','openSpecialMode','✦'],
      ['survival','Survival & extraction','Tower Survival: defend the tower, earn points and buy upgrades. Extraction: prepare equipment, search for loot, then reach an exit to keep it. Training has no item loss.','openSpecialMode','▣']
    ]},
  zh:{language:'选择语言',start:'开始新手教程',skip:'跳过教程',replay:'新手教程',next:'下一步',back:'上一步',open:'打开看看',return:'返回教程',play:'开始单人对战',finish:'完成教程',continue:'点击继续操作',practical:'实操训练',guide:'认识 ASTRIFT',
    move:['移动','在发光圆环附近移动，用鼠标转动视角。','⌨'],attack:['攻击','击中红色训练靶。','◎'],aim:['开镜','按住开镜键，观察瞄具。','⊕'],switch:['切换武器','切出第二把不同的武器。','1 ⇄ 2'],phase:['星际相位','朝向空旷门框向前突进，方向键可以改变突进方向。','⇢'],slide:['滑铲','移动时按住疾跑，再按滑铲；空格可以打断并跃起。','↘'],throwable:['投掷物','切出烟雾弹，再按开火投掷；武器键可以收回。','◉'],tactical:['技能装备','使用脉冲护盾，注意技能冷却。','⬡'],
    sprint:'疾跑',fire:'开火',aimKey:'按住开镜',mouse:'鼠标',ready:'已完成',lessons:[
      ['guns','改枪','选择枪械，每个槽位安装一个配件。查看计算后的伤害、后坐、弹速和开镜时间。','openArmory','◎'],
      ['gear','选择武器与装备','选择两把主武器、可选副武器、护甲、头盔、战术道具与投掷物。更厚的防护会降低移速。','openEquipment','⬡'],
      ['skills','技能与能力','星际相位和装备技能是两套能力。飞行器使用能量，其他道具使用冷却；刚才练习的是脉冲护盾。','openEquipment','⇢'],
      ['solo','单人和 AI','单人对战直接与 AI 战斗；单挑 AI 可选普通、进阶、大师。练习场可以测试武器和护甲。','openSpecialMode','◉'],
      ['online','多人联机','创建房间并选图，把六位房间号告诉好友。好友点击加入房间输入房间号，不需要分享链接。','openNormalMode','☷'],
      ['duel','单挑','单挑为十分钟 1v1，双方准备后开始，比分高者获胜。房间满员后可以观战。','openSpecialMode','⚔'],
      ['friends','好友组队','登录后添加好友、聊天并邀请。普通房间支持团队对战，一些特殊模式需要全员准备。','openFriends','♧'],
      ['ranked','排位与赛季','排位先到十次击杀获胜，胜利获得排位分和赛季进度。S1赛季中查看等级并手动领取奖励。','openSeason','◇'],
      ['special','特殊模式','夺旗：拿回敌方旗帜；据点：占领区域；相位爆破：安装或拆除核心；武器大师：击杀获得配件升级次数。','openSpecialMode','✦'],
      ['survival','生存与搜打撤','高塔生存：守塔、赚生存点并升级。搜打撤：整备后搜索物资，到撤离点离开才能带回物资。教程不会损失物品。','openSpecialMode','▣']
    ]}
};
export function initTutorial(api){
  let stage='idle',step=0,lesson=0,before=null,advanceAt=0,replay=false,opening=false;
  const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}},words=()=>TEXT[getLanguage()];
  const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./tutorial.css?v=20261008-onboarding-1',import.meta.url);document.head.append(css);
  const panel=document.createElement('section');panel.id='tutorialPanel';panel.hidden=true;panel.dataset.noTranslate='';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');document.body.append(panel);
  const hud=document.createElement('section');hud.id='tutorialHud';hud.hidden=true;hud.dataset.noTranslate='';document.body.append(hud);
  const returnButton=document.createElement('button');returnButton.id='tutorialReturn';returnButton.hidden=true;returnButton.dataset.noTranslate='';returnButton.onclick=()=>{api.stop();api.closePanels();returnButton.hidden=true;panel.hidden=false;renderGuide()};document.body.append(returnButton);
  const replayButton=document.createElement('button');replayButton.id='openTutorial';replayButton.type='button';replayButton.onclick=()=>open(true);document.getElementById('openKeybinds').parentElement.append(replayButton);
  const make=(tag,text,parent)=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n};
  const button=(text,fn,parent=panel)=>{const b=make('button',text,parent);b.type='button';b.onclick=fn;return b};
  function mark(skipped){if(replay)return;const owner=accountSession()?.name?.toLowerCase();try{localStorage.setItem(DEVICE_TUTORIAL_KEY,JSON.stringify({done:true,at:Date.now()}));if(owner){const accounts=read(ACCOUNT_TUTORIAL_KEY)?.accounts||{};accounts[owner]=tutorialRecord(owner,skipped);localStorage.setItem(ACCOUNT_TUTORIAL_KEY,JSON.stringify({accounts}))}}catch{}}
  function clearBrowse(){document.body.classList.remove('tutorialBrowsing')}
  function skip(){mark(true);stage='idle';advanceAt=0;clearBrowse();panel.hidden=hud.hidden=returnButton.hidden=true;api.stop();api.closePanels()}
  function eligible(){const entry=document.getElementById('worldEntry'),auth=document.getElementById('accountDialog'),world=document.documentElement.dataset.entryWorld;return !!accountSession()&&world!=='ancient'&&(!entry||world==='main'&&entry.hidden)&&(!auth||auth.hidden)}
  function open(force=false){if(opening||!eligible())return;opening=true;try{if(api.playing())api.stop();replay=force;stage='language';panel.hidden=false;hud.hidden=true;returnButton.hidden=true;api.closePanels();setLanguage('en');renderLanguage()}finally{opening=false}}
  function renderLanguage(){const w=words();panel.replaceChildren();make('small','ASTRIFT // FRONT',panel);make('h1',w.language,panel);const row=make('div','',panel);row.className='tutorialLanguages';for(const [code,label] of [['en','English'],['zh','中文']]){const b=button(label,()=>{setLanguage(code);renderLanguage()},row);b.setAttribute('aria-pressed',String(getLanguage()===code))}button(w.start,()=>{panel.hidden=true;stage='practical';step=0;api.start();enterStep()},panel);button(w.skip,skip,panel)}
  function controls(id){const k=a=>api.key(a);if(api.mobile)return ({move:getLanguage()==='en'?'◉ Joystick':'◉ 摇杆',attack:'◎ '+words().fire,aim:'⊕ '+k('aim'),switch:k('weapon2'),phase:'⇢ '+k('phase'),slide:k('sprint')+' → '+k('slide'),throwable:k('throwable')+' → '+words().fire,tactical:'⬡ '+k('tactical')})[id];return ({move:[k('forward'),k('left'),k('back'),k('right')].join(' '),attack:words().mouse+' 1 · '+words().fire,aim:words().mouse+' 2 / '+k('aim'),switch:k('weapon2'),phase:k('phase'),slide:k('sprint')+' + '+k('forward')+' → '+k('slide'),throwable:k('throwable')+' → '+words().fire,tactical:k('tactical')})[id]}
  function enterStep(){const id=PRACTICAL_STEPS[step];api.prepare(id);before=api.state();advanceAt=0;renderHud()}
  function renderHud(){const w=words(),id=PRACTICAL_STEPS[step],data=w[id];hud.replaceChildren();make('small',w.practical+' · '+(step+1)+' / '+PRACTICAL_STEPS.length,hud);make('span',data[2],hud).className='tutorialSymbol';make('h2',data[0],hud);make('p',data[1],hud);make('kbd',controls(id),hud);button(w.skip,skip,hud);hud.hidden=false}
  function guide(){api.stop();hud.hidden=true;stage='guide';lesson=0;document.body.classList.add('tutorialBrowsing');panel.hidden=false;renderGuide()}
  function renderGuide(){const w=words(),d=w.lessons[lesson];panel.replaceChildren();make('small',w.guide+' · '+(lesson+1)+' / '+w.lessons.length,panel);make('span',d[4],panel).className='tutorialSymbol';make('h1',d[1],panel);make('p',d[2],panel);const diagram=make('div','',panel);diagram.className='tutorialDiagram';for(const label of (d[0]==='guns'?(getLanguage()==='en'?['Weapon','Slot','Attachment','Stats']:['武器','槽位','配件','数值']):d[0]==='online'?(getLanguage()==='en'?['Create','Room code','Friend joins']:['创建','房间号','好友加入']):d[0]==='ranked'?(getLanguage()==='en'?['Match','Win / lose','S1 rewards']:['匹配','胜负','S1奖励']):[d[4],d[1]]))make('span',label,diagram);
    button(w.open,()=>{panel.hidden=true;returnButton.textContent=w.return;returnButton.hidden=false;api.open(d[3])});if(lesson>0)button(w.back,()=>{lesson--;renderGuide()});button(lesson===w.lessons.length-1?w.finish:w.next,()=>{if(lesson<w.lessons.length-1){lesson++;renderGuide()}else{mark(false);stage='idle';panel.hidden=true;returnButton.hidden=true;api.closePanels();showFinished()}});button(w.skip,skip)}
  function showFinished(){clearBrowse();panel.replaceChildren();make('h1',words().ready,panel);button(words().play,()=>{panel.hidden=true;api.playSolo()});button(getLanguage()==='en'?'Main menu':'主页面',()=>{panel.hidden=true});panel.hidden=false}
  function check(){if(stage!=='idle'||api.playing()||!eligible())return;const owner=accountSession()?.name?.toLowerCase();if(needsTutorial(read(DEVICE_TUTORIAL_KEY),read(ACCOUNT_TUTORIAL_KEY)?.accounts?.[owner],owner))open(false)}
  let nextCheck=0;
  function update(now){if(stage==='idle'&&!api.playing()&&now>nextCheck){nextCheck=now+1500;check()}if(stage!=='practical')return;if(!api.playing()){stage='idle';hud.hidden=true;return}if(api.paused())return;if(advanceAt){if(now>=advanceAt){if(++step===PRACTICAL_STEPS.length)guide();else enterStep()}return}if(practicalComplete(PRACTICAL_STEPS[step],api.state(),before)){make('b','✓ '+words().ready,hud);advanceAt=now+900}}
  window.addEventListener('astrift:account-changed',()=>{if(stage!=='idle'){api.stop();stage='idle';panel.hidden=hud.hidden=returnButton.hidden=true}check()});
  window.addEventListener('astrift:entry-world-changed',()=>{if(!eligible()){if(stage!=='idle')api.stop();stage='idle';advanceAt=0;clearBrowse();panel.hidden=hud.hidden=returnButton.hidden=true}else check()});
  window.addEventListener('astrift:language-changed',()=>{replayButton.textContent=words().replay;returnButton.textContent=words().return;if(stage==='practical')renderHud()});
  replayButton.textContent=words().replay;queueMicrotask(check);
  return {update,get active(){return stage==='practical'},get showing(){return stage!=='idle'}};
}
