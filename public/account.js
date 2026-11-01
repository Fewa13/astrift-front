// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {accountPageLease} from './account-page-lease.js';
import {createAnnouncementPoll} from './official-announcements.js';
import {diagnosticFetch,apiURL} from './network-diagnostics.js?v=20261027-backend-fallback-1';
import {createAccountEmailUI,accountEmailError} from './account-email-ui.js';
const SESSION_KEY='astrift.accountSession.v1';
const DEVICE_KEY='astrift.accountDevice.v1';
import {SEASON_SKINS} from './skin-system.js?v=20261006-damage-result-3';
const CLOUD_KEYS=[
  'astrift.extraction.v1',
  'astrift.callsign','astrift.weaponBuilds.v1','astrift.weaponSlots.v1','astrift.sidearm.v1',
  'astrift.equipment.v1','astrift.skins.v1','astrift.knifeSkins.v1','astrift.keybinds.v1',
  'astrift.quality.v1','astrift.map.v1','astrift.gunmasterWeapon','astrift.weapon'
];
let session=null,profile=null,lastUploaded='',saving=false;
let device=localStorage.getItem(DEVICE_KEY);
if(!device||!/^[0-9a-f-]{36}$/i.test(device)){device=crypto.randomUUID();localStorage.setItem(DEVICE_KEY,device)}
try{const value=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');if(value&&typeof value.name==='string'&&/^[a-f0-9]{64}$/i.test(value.token))session={name:value.name,token:value.token,device}}catch{}
const $=id=>document.getElementById(id);
export function accountSession(){return session}
export function localSave(){const data={};for(const key of CLOUD_KEYS){const value=localStorage.getItem(key);if(value!==null)data[key]=value}if(session)data['astrift.callsign']=session.name;return data}
function applyCloudSave(data,name){for(const key of CLOUD_KEYS){if(typeof data[key]==='string')localStorage.setItem(key,data[key]);else localStorage.removeItem(key)}localStorage.setItem('astrift.callsign',name)}
export async function accountApi(path,body){
  if(!await accountPageLease())throw Error('此设备已有游戏页面打开，请先关闭另一个页面。 / Another game page is open on this device. Close it first.');
  const response=await diagnosticFetch(apiURL('/api/'+path),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,device}),cache:'no-store'});
  let result;try{result=await response.json()}catch{throw Error('服务器响应无效')}
  if(response.status===401&&session&&body?.token===session.token){clearSession();window.dispatchEvent(new CustomEvent('astrift:account-reset'))}
  if(!response.ok||!result?.ok){if(String(result?.error||'').startsWith('账号已被')){clearSession();window.dispatchEvent(new CustomEvent('astrift:account-banned'));window.dispatchEvent(new CustomEvent('astrift:account-reset'))}throw Error(result?.error||'请求失败');}
  return result;
}
export const accountEmailUI=createAccountEmailUI({request:accountApi,getSession:accountSession,onReset:()=>{clearSession();window.dispatchEvent(new CustomEvent('astrift:account-reset'));document.getElementById('loginAccount')?.click()}});
createAnnouncementPoll({session:accountSession,request:accountApi,openInbox:()=>accountEmailUI.openInbox()});
function renderAccount(){
  if(!$('registerAccount'))return;
  const home=$('accountStatus').parentElement;home.setAttribute('data-no-translate','');$('registerAccount').textContent='注册 / Register';$('loginAccount').textContent='登录 / Log in';$('logoutAccount').textContent='退出登录 / Log out';const logged=Boolean(session);$('registerAccount').hidden=$('loginAccount').hidden=logged;$('logoutAccount').hidden=!logged;
  $('name').disabled=logged;if($('accountSettings'))$('accountSettings').hidden=!logged;
  if(logged){$('name').value=session.name;$('accountStatus').textContent=`${session.name} · 排位分 / Rank points ${profile?.rankPoints??'…'}`}
  else $('accountStatus').textContent='游客 / Guest · 数据保存在本机 / Saved on this device';
}
function renderSeason(){
  if(!$('seasonDetails'))return;
  const panel=$('seasonDetails');panel.replaceChildren();
  if(!session){panel.textContent='登录账号后可查看 S1 赛季等级和排位分。';return}
  if(!profile){panel.textContent='正在读取赛季进度…';return}
  const season=profile.season;
  const hero=document.createElement('section');hero.className='seasonHero';
  const kicker=document.createElement('small');kicker.textContent='当前赛季等级';
  const title=document.createElement('strong');title.textContent=season.title;
  const level=document.createElement('b');level.textContent=`LV. ${season.level}`;
  const points=document.createElement('p');points.textContent=`排位分 ${profile.rankPoints} · 累计成长值 ${season.earned} · 刀皮抽奖 ${profile.knifeDraw?.tickets||0} 次`;
  const meter=document.createElement('div');meter.className='seasonMeter';
  const fill=document.createElement('i');fill.style.width=`${Math.min(100,season.progress/season.next*100)}%`;meter.append(fill);
  const progress=document.createElement('small');progress.textContent=`距离 ${season.level+1} 级：${season.progress} / ${season.next} 成长值`;
  hero.append(kicker,title,level,points,meter,progress);
  const news=document.createElement('section');news.className='seasonNews';news.innerHTML='<h3>战区更新公告</h3><article><time>S1 · 最新</time><b>赛季刀皮抽奖</b><p>每升一级获得一次刀皮抽奖。进入「武器与皮肤 → 相位刃皮肤」抽取或用碎片兑换。</p></article><article><time>S1 · 最新</time><b>赛季奖励领取</b><p>达到对应等级后，在下方亲自领取称号皮肤。</p></article><article><time>S1 · 最新</time><b>相位刃外观重制</b><p>任务、抽奖与活动刀皮拥有不同的刀身轮廓。</p></article>';
  const rewards=document.createElement('section');rewards.className='seasonRewards';const heading=document.createElement('h3');heading.textContent='赛季奖励领取';rewards.append(heading);
  const claimed=new Set(profile.seasonClaims||[]);
  for(const skin of SEASON_SKINS){
    const row=document.createElement('div');row.className='seasonReward';row.style.setProperty('--reward','#'+skin.accent.toString(16).padStart(6,'0'));
    const label=document.createElement('div');const name=document.createElement('b');name.textContent=skin.name;const detail=document.createElement('small');detail.textContent=`${skin.level} 级解锁 · ${skin.desc}`;label.append(name,detail);
    const button=document.createElement('button');button.type='button';const owned=claimed.has(skin.id);button.textContent=owned?'已领取':season.level>=skin.level?'领取':'未解锁';button.disabled=owned||season.level<skin.level;
    button.onclick=async()=>{button.disabled=true;button.textContent='领取中…';try{const result=await accountApi('account/season-claim',{...session,skinId:skin.id});profile=result.profile;renderSeason();window.dispatchEvent(new CustomEvent('astrift:account-profile',{detail:profile}))}catch(error){button.disabled=false;button.textContent='重试领取';button.title=error.message||'领取失败'}};
    row.append(label,button);rewards.append(row);
  }
  panel.append(hero,news,rewards);
}
export async function refreshAccountProfile(){
  if(!session)return null;
  const current=session;
  try{const result=await accountApi('account/profile',current);if(session!==current)return null;profile=result.profile;renderAccount();renderSeason();window.dispatchEvent(new CustomEvent('astrift:account-profile',{detail:profile}));return profile}
  catch(error){if(error.message==='登录已失效'&&session===current)clearSession();throw error}
}
function clearSession(){session=null;profile=null;lastUploaded='';localStorage.removeItem(SESSION_KEY);renderAccount();renderSeason();window.dispatchEvent(new CustomEvent('astrift:account-profile',{detail:null}))}
async function checkSession(){if(!session||!navigator.onLine)return;const current=session;try{await accountApi('account/check',current)}catch(error){if(error.message==='登录已失效'&&session===current)clearSession()}}
async function syncCloud(){
  if(!session||saving||!navigator.onLine)return;
  const snapshot=localSave(),serial=JSON.stringify(snapshot);if(serial===lastUploaded)return;
  saving=true;try{await accountApi('account/save',{...session,snapshot});lastUploaded=serial}catch{}finally{saving=false}
}
export async function authenticateAccount(action,name,password,beforeChanged=()=>{}){
 if(!['login','register'].includes(action))throw Error('操作无效');const result=await accountApi('account/'+action,{name:name.trim().normalize('NFKC'),password,...(action==='register'?{snapshot:localSave()}:{})});
 session={name:result.profile.name,token:result.token,device};profile=result.profile;localStorage.setItem(SESSION_KEY,JSON.stringify(session));if(action==='login'||result.registrationRecovered)applyCloudSave(profile.snapshot,session.name);else localStorage.setItem('astrift.callsign',session.name);lastUploaded=JSON.stringify(localSave());renderAccount();renderSeason();beforeChanged(result);if(action==='register')await accountEmailUI.offer();window.dispatchEvent(new CustomEvent('astrift:account-changed',{detail:{action,name:session.name,snapshot:profile.snapshot,profile}}));return result;
}
export async function logoutAccount(){const previous=session;if(!previous)return;await syncCloud();try{await accountApi('account/logout',previous)}catch{}clearSession();window.dispatchEvent(new CustomEvent('astrift:account-reset'))}
export function initAccountUI(){
  const dialog=$('accountDialog'),form=$('accountForm');dialog.setAttribute('data-no-translate','');$('accountPassword').parentElement.firstChild.textContent='密码 / Password';$('accountCancel').textContent='返回 / Back';$('accountName').parentElement.setAttribute('data-no-translate','');let action='register',submitting=false;
  const open=mode=>{if(submitting)return;action=mode;dialog.hidden=false;$('accountDialogTitle').textContent=mode==='register'?'注册账号 / Register':'登录账号 / Log in';$('accountDialogHint').textContent=mode==='register'?'注册时会上传本机存档。 / Your local save will be uploaded.':'登录后使用云端存档。 / Your cloud save will be loaded.';$('accountSubmit').textContent=mode==='register'?'注册 / Register':'登录 / Log in';$('accountSubmit').disabled=false;$('accountPassword').autocomplete=mode==='register'?'new-password':'current-password';$('accountName').maxLength=mode==='register'?14:254;$('accountName').parentElement.firstChild.textContent=mode==='register'?'账号名 / Account name':'账号名或邮箱 / Account name or email';$('accountName').value=mode==='register'?$('name').value:'';$('accountPassword').value='';$('accountError').textContent='';$('accountName').focus()};
  const settings=document.createElement('button');settings.id='accountSettings';settings.type='button';settings.textContent='账号设置 / Account settings';settings.onclick=()=>accountEmailUI.openSettings();settings.setAttribute('data-no-translate','');$('logoutAccount').parentElement.prepend(settings);const settingsEntry=document.createElement('button');settingsEntry.type='button';settingsEntry.setAttribute('data-no-translate','');settingsEntry.textContent='账号 / Account';settingsEntry.onclick=()=>accountEmailUI.openSettings();$('keybindSettings').querySelector('.keybindHead').after(settingsEntry);const forgot=document.createElement('button');forgot.type='button';forgot.setAttribute('data-no-translate','');forgot.textContent='忘记密码 / Forgot password';forgot.onclick=()=>accountEmailUI.openReset();const recoveryActions=document.createElement('div');recoveryActions.className='roomActions';recoveryActions.style.gridTemplateColumns='1fr';recoveryActions.append(forgot);$('accountPassword').parentElement.after(recoveryActions);
  $('registerAccount').onclick=()=>open('register');$('loginAccount').onclick=()=>open('login');$('accountCancel').onclick=()=>{dialog.hidden=true;window.dispatchEvent(new CustomEvent('astrift:account-dialog-cancelled'))};
  form.onsubmit=async event=>{
    event.preventDefault();if(submitting)return;submitting=true;const button=$('accountSubmit'),name=$('accountName').value.trim().normalize('NFKC'),password=$('accountPassword').value;
    button.disabled=true;$('accountError').textContent='正在连接…';
    try{
      await authenticateAccount(action,name,password,()=>{dialog.hidden=true;$('name').value=session.name});
    }catch(error){$('accountError').textContent=accountEmailError(error.message,localStorage.getItem('astrift.language.v1')!=='zh')||'请检查网络后重试'}finally{submitting=false;button.disabled=false}
  };
  $('logoutAccount').onclick=logoutAccount;
  $('openSeason').onclick=()=>{$('seasonDialog').hidden=false;renderSeason();if(session)void refreshAccountProfile().catch(()=>{panelError('赛季进度读取失败，请稍后再试')})};
  $('closeSeason').onclick=()=>{$('seasonDialog').hidden=true};
  renderAccount();renderSeason();
  if(session)void refreshAccountProfile().then(value=>{if(value)lastUploaded=JSON.stringify(value.snapshot)}).catch(()=>{});
  setInterval(()=>{void syncCloud()},4000);
  setInterval(()=>{void checkSession()},15000);
  setInterval(()=>{if(session&&!document.hidden)void refreshAccountProfile().catch(()=>{})},60000);
  addEventListener('focus',()=>{void checkSession()});
  addEventListener('online',()=>{void syncCloud()});
  addEventListener('pagehide',()=>{if(session&&JSON.stringify(localSave())!==lastUploaded)void fetch(apiURL('/api/account/save'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...session,snapshot:localSave()}),keepalive:true}).catch(()=>{})});
}
function panelError(message){$('seasonDetails').textContent=message}

void accountPageLease().then(allowed=>{if(!allowed){session=null;profile=null;window.dispatchEvent(new CustomEvent('astrift:account-reset'));}});
