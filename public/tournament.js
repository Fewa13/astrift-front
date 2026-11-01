// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {accountSession,accountApi,refreshAccountProfile} from './account.js?v=20261027-auth-recovery-1';

const $=id=>document.getElementById(id);
const stage={registration:'报名阶段',active:'比赛进行中',finished:'比赛结束'};
const rewardNames={1:'武者大赛·冠军枪皮 + 冠军刀皮',2:'武者大赛·亚军枪皮 + 亚军刀皮',3:'武者大赛·季军枪皮 + 季军刀皮'};
let events=[],selected='',adminToken='',queueTicket='',queueEvent='',queueRun=0,refreshing=false,adminOpen=false,showRoster=false,rosterEvent='',roster=[],pushEnabled=false,pushBusy=false;
const status=(message,error=false)=>{const line=$('tournamentStatus');line.textContent=message;line.dataset.error=String(error)};
const call=(action,data={})=>accountApi('tournaments/'+action,{...(accountSession()||{}),...data});
const element=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node};
const button=(label,handler,primary=false)=>{const node=element('button',primary?'tournamentPrimary':'',label);node.type='button';node.onclick=handler;return node};

export function initTournamentUI(startMatch,startWeekly){
  const screen=$('tournamentScreen'),content=$('tournamentContent'),adminPanel=$('tournamentAdminPanel');
  const active=()=>events.find(item=>item.id===selected);
  const pushSupported=()=>window.isSecureContext&&'Notification' in window&&'serviceWorker' in navigator&&'PushManager' in window;
  async function restorePush(){
    pushEnabled=false;
    if(!pushSupported()||Notification.permission!=='granted'||!accountSession())return;
    const current=accountSession();
    try{const registration=await navigator.serviceWorker.getRegistration('/'),subscription=await registration?.pushManager.getSubscription();if(subscription&&accountSession()===current){await call('push-subscribe',{...current,subscription:subscription.toJSON()});if(accountSession()===current)pushEnabled=true}}
    catch{}finally{render()}
  }
  async function togglePush(){
    if(pushBusy)return;
    if(!pushSupported()){status('当前浏览器不支持系统推送通知',true);return}
    if(!accountSession()){status('请先登录账号',true);return}
    const current=accountSession();pushBusy=true;
    // Request permission directly from the click so browsers keep the user gesture.
    const permission=pushEnabled?Promise.resolve(Notification.permission):Notification.requestPermission();
    render();
    try{
      if(await permission!=='granted'&&!pushEnabled)throw Error('通知未开启，可在浏览器的网站设置中允许通知');
      const registration=await navigator.serviceWorker.register('/sw.js');
      await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(Error('通知准备超时，请重试')),15000))]);
      let subscription=await registration.pushManager.getSubscription();
      if(accountSession()!==current)throw Error('账号已切换，请重新开启提醒');
      if(pushEnabled){
        await call('push-unsubscribe',{...current,endpoint:subscription?.endpoint||''});
        await subscription?.unsubscribe();pushEnabled=false;status('开赛提醒已关闭');
      }else{
        const config=await call('push-config');if(!config.publicKey)throw Error('通知服务暂不可用，请稍后重试');
        const raw=atob(config.publicKey.replace(/-/g,'+').replace(/_/g,'/'));
        if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:Uint8Array.from(raw,character=>character.charCodeAt(0))});
        if(accountSession()!==current)throw Error('账号已切换，请重新开启提醒');
        await call('push-subscribe',{...current,subscription:subscription.toJSON()});pushEnabled=true;status('已开启开赛提醒');
      }
    }catch(error){status(error.message||'开启提醒失败，请重试',true)}finally{pushBusy=false;render()}
  }
  async function loadRoster(eventId){
    try{const result=await call('roster',{eventId});if(selected!==eventId)return;rosterEvent=eventId;roster=result.participants||[];render();if(!adminPanel.contains(document.activeElement))renderAdmin()}
    catch(error){status(error.message||'名单读取失败',true)}
  }
  async function refresh(){
    if(refreshing||screen.hidden)return;refreshing=true;
    try{const result=await call('list'),next=result.events||[],changed=JSON.stringify(next)!==JSON.stringify(events);events=next;if(selected&&!active())selected='';if(changed)render();if(selected&&(showRoster||adminOpen))await loadRoster(selected)}
    catch(error){status(error.message||'赛事读取失败',true)}finally{refreshing=false}
  }
  async function doAction(action,data={},message='操作成功'){
    try{await call(action,data);status(message);await refresh();if(selected&&rosterEvent===selected)await loadRoster(selected);renderAdmin();render();return true}
    catch(error){status(error.message||'操作失败',true);return false}
  }
  async function close(){
    queueRun++;const ticket=queueTicket,eventId=queueEvent;queueTicket='';queueEvent='';
    if(ticket&&eventId&&accountSession())void call('cancel',{eventId,ticket}).catch(()=>{});
    screen.hidden=true;selected='';showRoster=false;rosterEvent='';roster=[];adminOpen=false;adminPanel.hidden=true;
    if(adminToken){const token=adminToken;adminToken='';void call('admin-logout',{adminToken:token}).catch(()=>{})}
  }
  function renderAdmin(){
    adminPanel.replaceChildren();adminPanel.hidden=!adminOpen;if(!adminOpen)return;
    if(!adminToken){
      const form=element('form');const label=element('label',null,'管理密码');const input=element('input');input.type='password';input.autocomplete='off';input.required=true;label.append(input);const submit=button('进入管理',()=>form.requestSubmit());form.append(label,submit);form.onsubmit=async event=>{event.preventDefault();try{const result=await call('admin-login',{password:input.value});adminToken=result.token;input.value='';status('管理员已登录');renderAdmin()}catch(error){status(error.message||'验证失败',true)}};adminPanel.append(form);return;
    }
    if(active()?.kind==='warriorWeekly'){adminPanel.append(element('p',null,'武者挑战自动轮换、结算。'),button('创建另一场',()=>{selected='';renderAdmin();render()}));return}const event=active(),heading=element('h3',null,event?`管理 · ${event.name}`:'创建赛事');adminPanel.append(heading);
    const form=element('form');const kindLabel=element('label',null,'比赛类型'),kind=element('select');const option=element('option',null,'武者大赛');option.value='warrior';kind.append(option);kindLabel.append(kind);
    const nameLabel=element('label',null,'赛事名称'),name=element('input');name.maxLength=40;name.required=true;name.value=event?.name||'武者大赛';nameLabel.append(name);
    const descLabel=element('label',null,'简介'),description=element('input');description.maxLength=180;description.value=event?.description||'三盏灯淘汰赛 · 真人 1v1 · 最终三强领取专属枪皮与刀皮';descLabel.append(description);
    const detailLabel=element('label',null,'比赛详情'),details=element('textarea');details.maxLength=4000;details.value=event?.details||'报名结束后开启真人匹配。每人有三盏灯，每次对局失败熄灭一盏；三盏全灭出局。最后一名仍有灯的选手获得冠军。';detailLabel.append(details);
    const controls=element('div','tournamentAdminButtons');controls.append(button(event?'保存修改':'创建赛事',()=>{}));form.append(kindLabel,nameLabel,descLabel,detailLabel,controls);
    form.onsubmit=async e=>{e.preventDefault();const action=event?'edit':'create',data={adminToken,eventId:event?.id,kind:kind.value,eventName:name.value.trim(),description:description.value.trim(),details:details.value.trim()};try{const result=await call(action,data);if(result.id)selected=result.id;status(event?'详情已更新':'赛事已创建');await refresh();renderAdmin()}catch(error){status(error.message||'保存失败',true)}};
    controls.firstChild.onclick=()=>form.requestSubmit();
    if(event){
      if(event.status==='registration')controls.append(button('结束报名，开始比赛',async()=>{if(!confirm(`确定结束「${event.name}」报名并开始比赛？`))return;await doAction('start',{adminToken,eventId:event.id},'报名已结束，比赛开始')}));
      if(event.status==='active'&&event.kind!=='warriorWeekly'){
        const label=element('label',null,'淘汰选手'),select=element('select');
        if(rosterEvent!==event.id){const option=element('option',null,'名单加载中…');select.append(option);select.disabled=true}
        else{for(const person of roster.filter(person=>person.lives>0)){const option=element('option',null,`${person.name} · ${person.lives} 盏灯`);option.value=person.account;select.append(option)}if(!select.options.length){const option=element('option',null,'没有可淘汰的选手');select.append(option);select.disabled=true}}
        label.append(select);form.append(label);
        const eliminate=button('淘汰所选选手',async()=>{const target=select.value,person=roster.find(item=>item.account===target);if(!person||!confirm(`确定淘汰「${person.name}」？剩余 ${person.lives} 盏灯将全部熄灭。`))return;await doAction('eliminate',{adminToken,eventId:event.id,target},'选手已淘汰')});eliminate.disabled=select.disabled;controls.append(eliminate);
      }
      controls.append(button('删除赛事',async()=>{if(!confirm(`确定永久删除「${event.name}」及报名、对局记录？`))return;selected='';await doAction('delete',{adminToken,eventId:event.id},'赛事已删除')}));
      controls.append(button('创建另一场',()=>{selected='';render()}));
    }
    adminPanel.append(form);
  }
  function renderList(){
    content.replaceChildren();const joined=events.filter(item=>item.mine&&['registration','active'].includes(item.status));if(joined.length){content.append(element('h3',null,'正在参加的比赛'));const grid=element('div','tournamentGrid');for(const event of joined)grid.append(eventButton(event));content.append(grid)}
    content.append(element('h3',null,'全部赛事'));if(!events.length){content.append(element('p',null,'暂无赛事，等待管理员创建。'));return}const grid=element('div','tournamentGrid');for(const event of events)grid.append(eventButton(event));content.append(grid);
  }
  function eventButton(event){const card=button('',()=>{selected=event.id;showRoster=false;rosterEvent='';roster=[];renderAdmin();render();void loadRoster(event.id)});card.className='tournamentCard';card.append(element('b',null,event.name),element('span',null,event.description),element('em',null,`${stage[event.status]||event.status} · ${event.players} 人报名`));return card}
  function lights(count){const wrap=element('span','tournamentLights');for(let i=0;i<3;i++){const dot=element('i',i<count?'on':'');wrap.append(dot)}return wrap}
  function renderDetail(event){
    if(event.kind==='warriorWeekly')event={...event,details:event.details.replace('前三名领取武者枪皮与刀皮。','前三名领取武者枪皮与刀皮，领取后有效 7 天。')};
    content.replaceChildren();content.append(button('← 返回赛事',()=>{selected='';showRoster=false;renderAdmin();render()}));
    const box=element('section','tournamentDetail'),top=element('div','tournamentDetailTop');top.append(element('h3',null,event.name),element('span','tournamentBadge',stage[event.status]||event.status));box.append(top,element('p',null,event.description),element('p',null,event.details||'暂无详情'),element('div','tournamentMeta',`报名 ${event.players} 人 · 仍在比赛 ${event.alive} 人`));
    if(event.mine&&event.kind!=='warriorWeekly'){const row=element('div','tournamentLives');row.append(element('b',null,'你的灯：'),lights(event.mine.lives),element('span',null,event.mine.lives?`${event.mine.lives}/3`:'已淘汰'));box.append(row)}
    if(event.kind==='warriorWeekly'){const w=event.weekly;box.append(element('p',null,`今日剩余 ${w.attemptsLeft} 次 · 截止 ${new Date(w.endsAt).toLocaleString()}`));box.append(element('p',null,`统一地图：${({crossroads:'星港街区',depot:'环轨货场',arcade:'霓虹回廊'})[w.conditions.map]} · 三关挑战 · 裸装武器`))}box.append(button('名单',()=>{showRoster=!showRoster;render()}));
    if(showRoster){
      const list=element('div','tournamentRoster');
      if(rosterEvent!==event.id)list.append(element('p',null,'名单加载中…'));
      else if(!roster.length)list.append(element('p',null,'暂无参赛选手'));
      else for(const person of roster){const row=element('div','tournamentRosterRow');row.append(element('span',null,person.name));if(event.kind!=='warriorWeekly')row.append(lights(person.lives),element('span',null,person.lives?`剩余 ${person.lives} 盏`:'淘汰'));list.append(row)}
      box.append(list);
    }
    if(event.status==='registration'&&event.mine)box.append(element('p',null,'报名阶段中'));
    if(event.status==='registration'&&event.mine){const notify=button(pushBusy?'处理中…':pushEnabled?'关闭开赛提醒':'开启开赛提醒',()=>{void togglePush()});notify.disabled=pushBusy;box.append(notify)}
    if(event.status!=='registration'){
      box.append(element('h4',null,event.status==='finished'?'最终排名':'当前排名'));
      const ranking=element('div');for(const [index,person] of (event.weekly?.ranking||event.ranking).entries()){const row=element('div','tournamentRank');if(event.weekly)row.classList.add('weeklyRank');row.dataset.place=String(person.place||0);row.append(element('b',null,String(person.place||index+1)),element('span',null,person.name),element('span',null,event.weekly?`${person.clears} 关 · ${person.kills} 杀 / ${person.deaths} 死 · ${(person.elapsed/1000).toFixed(1)}s`:person.place?`${person.place} 名`:person.lives?`${person.lives} 盏灯`:'已淘汰'));ranking.append(row)}box.append(ranking);
    }
    const actions=element('div','tournamentActions');
    if((event.status==='registration'||event.kind==='warriorWeekly'&&event.status==='active')&&!event.mine){const join=button('参加比赛',async()=>{if(!accountSession()){await close();$('loginAccount').click();return}join.disabled=true;if(!await doAction('join',{eventId:event.id},'报名成功'))join.disabled=false},true);actions.append(join)}
    if(event.kind!=='warriorWeekly'&&event.status==='active'&&event.mine?.lives>0){const match=button(queueTicket&&queueEvent===event.id?'匹配中 · 仅真人':'匹配真人',()=>{void queueFor(event.id)},true);actions.append(match);if(queueTicket&&queueEvent===event.id)actions.append(button('取消匹配',()=>{void cancelQueue()}))}
    if(event.kind==='warriorWeekly'&&event.status==='active'&&event.mine&&!event.mine.disqualified){const play=button(event.weekly.activeRun?'继续挑战':'开始挑战',async()=>{play.disabled=true;try{const result=await call('weeklyBegin',{eventId:event.id});await close();startWeekly(event.id,result.run,result.conditions)}catch(error){status(error.message||'挑战开始失败',true);play.disabled=false}},true);play.disabled=!event.weekly.activeRun&&event.weekly.attemptsLeft<=0;actions.append(play)}if(event.status==='finished'){box.append(element('p',null,'比赛结束'));if(event.mine?.place>=1&&event.mine.place<=3){const reward=rewardNames[event.mine.place]+(event.kind==='warriorWeekly'?' · 领取后有效 7 天':'');box.append(element('p',null,`你的奖励：${reward}`));actions.append(button(event.mine.claimed?'已领取':'领取枪皮与刀皮',async()=>{if(event.mine.claimed)return;const result=await doAction('claim',{eventId:event.id},'奖励已领取');if(result)void refreshAccountProfile().catch(()=>{})},true));actions.lastChild.disabled=!!event.mine.claimed}}
    box.append(actions);content.append(box);
  }
  function render(){if(screen.hidden)return;const event=active();if(event)renderDetail(event);else renderList()}
  async function cancelQueue(){queueRun++;const ticket=queueTicket,eventId=queueEvent;queueTicket='';queueEvent='';render();if(ticket&&eventId)await call('cancel',{eventId,ticket}).catch(()=>{});status('已取消匹配')}
  async function queueFor(eventId){
    if(queueTicket||queueEvent)return;const run=++queueRun;queueEvent=eventId;status('正在寻找真人选手…');
    try{
      let result=await call('queue',{eventId});if(run!==queueRun){if(result.ticket)void call('cancel',{eventId,ticket:result.ticket}).catch(()=>{});return}queueTicket=result.ticket;render();
      while(run===queueRun&&result.status==='waiting'){
        await new Promise(resolve=>setTimeout(resolve,1200));if(run!==queueRun)return;
        result=await call('status',{eventId,ticket:queueTicket});
      }
      if(run!==queueRun)return;
      if(result.status==='matched'){
        status('匹配成功 · 即将进入赛场');
        await new Promise(resolve=>setTimeout(resolve,900));if(run!==queueRun)return;
        queueTicket='';queueEvent='';screen.hidden=true;adminOpen=false;adminPanel.hidden=true;if(adminToken){const token=adminToken;adminToken='';void call('admin-logout',{adminToken:token}).catch(()=>{})}startMatch(eventId,result.room,result.map);
      }
    }catch(error){if(run===queueRun){queueTicket='';queueEvent='';if(error.message==='对手未进入，已返回匹配队列'){status('对手未进入，继续寻找真人选手…');void queueFor(eventId)}else{status(error.message||'匹配失败',true);render()}}}
  }
  $('openTournaments').onclick=()=>{screen.hidden=false;status('');renderAdmin();render();void refresh()};
  $('tournamentClose').onclick=()=>{void close()};
  $('tournamentAdmin').onclick=()=>{adminOpen=!adminOpen;renderAdmin();if(adminOpen&&selected&&rosterEvent!==selected)void loadRoster(selected)};
  addEventListener('astrift:account-changed',()=>{void cancelQueue();void restorePush();if(!screen.hidden)void refresh()});
  addEventListener('astrift:account-profile',event=>{if(!event.detail){pushEnabled=false;render()}});
  navigator.serviceWorker?.addEventListener('message',event=>{if(event.data?.type==='astrift:tournament-started'&&!screen.hidden)void refresh()});
  void restorePush();
  setInterval(()=>{if(!screen.hidden)void refresh()},5000);
  document.addEventListener('keydown',event=>{if(event.code==='Escape'&&!screen.hidden){event.preventDefault();event.stopImmediatePropagation();void close()}},true);
}
