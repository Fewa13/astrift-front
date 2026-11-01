// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {accountSession} from './account.js?v=20261027-auth-recovery-1';
import {navigateWorld} from './world-navigation.js?v=20261012-ancient-auth-buttons-1';
const en=()=>localStorage.getItem('astrift.language.v1')!=='zh';
const panel=document.createElement('div');panel.id='worldChooser';panel.hidden=true;panel.innerHTML='<section class="worldAtlas"><button class="atlasClose" type="button">×</button><small>ASTRIFT // WORLDS</small><h2></h2><div class="atlasTerrain"><div class="atlasRiver"></div><button class="worldNode current" type="button"></button><button class="worldNode ancient" type="button"></button></div><p></p></section>';document.body.append(panel);
const nodes=panel.querySelectorAll('.worldNode');
const worldButton=document.getElementById('openWorld');
document.body.append(worldButton);
worldButton.querySelector('b').textContent=en()?'Worlds':'世界';
window.addEventListener('astrift:language-changed',()=>{worldButton.querySelector('b').textContent=en()?'Worlds':'世界'});
document.getElementById('openWorld').onclick=()=>{panel.querySelector('h2').textContent=en()?'Worlds':'世界';nodes[0].textContent=en()?'FPS Combat':'FPS 对战';nodes[1].textContent=en()?'Ancient Age':'远古世纪';panel.querySelector('p').textContent='';panel.hidden=false};
panel.querySelector('.atlasClose').onclick=()=>panel.hidden=true;nodes[0].onclick=()=>panel.hidden=true;
const entry=document.getElementById('worldEntry');
function entryLanguage(){const english=en();entry.querySelector('[data-entry-heading]').textContent=english?'Choose your world':'选择世界';entry.querySelector('[data-entry-heading-secondary]').textContent=english?'选择世界':'Choose your world';for(const [id,zh,eng,tags]of [['enterMainWorld','FPS 对战','FPS Combat',[['竞技','ARENA'],['枪械','LOADOUTS'],['联机','MULTIPLAYER']]],['enterAncientWorld','远古世纪','Ancient Age',[['职业','CLASSES'],['冒险','ADVENTURE'],['成长','PROGRESSION']]]]){const card=document.getElementById(id);card.querySelector('[data-entry-title]').textContent=english?eng:zh;card.querySelector('[data-entry-subtitle]').textContent=english?zh:eng;card.querySelector('[data-entry-enter]').textContent=english?'ENTER':'进入';card.querySelectorAll('[data-entry-tag]').forEach((n,i)=>n.textContent=tags[i][english?1:0]);}}
entryLanguage();window.addEventListener('astrift:language-changed',entryLanguage);
let pendingWorld='',pendingResume=null;
function selectEntryWorld(world){document.documentElement.dataset.entryWorld=world;window.dispatchEvent(new CustomEvent('astrift:entry-world-changed',{detail:{world}}))}
const auth=document.createElement('section');auth.hidden=true;auth.id='ancientEntryAuth';auth.setAttribute('data-no-translate','');auth.setAttribute('role','dialog');auth.setAttribute('aria-modal','true');
auth.style.cssText='position:fixed;inset:0;z-index:100001;display:grid;place-content:center;gap:24px;padding:24px;background:#080d16f5;color:#eefaff;text-align:center;font-family:system-ui';
auth.innerHTML='<h1>注册 / 登录 · Register / Log in</h1><div><button type="button" data-mode="register">注册 / Register</button><button type="button" data-mode="login">登录 / Log in</button></div><button type="button" data-mode="cancel">返回 / Back</button>';
for(const button of auth.querySelectorAll('button'))button.style.cssText='padding:16px 28px;margin:6px;border:1px solid #72dce6;border-radius:10px;background:#142936;color:#eefaff;font:inherit;cursor:pointer';
// Explicit hidden rule overrides this dialog’s inline grid display.
const authStyle=document.createElement('style');authStyle.textContent='#ancientEntryAuth[hidden]{display:none!important}';document.head.append(authStyle);document.body.append(auth);
function requireAccount(resume,world='main'){
  if(accountSession()){resume();return true}
  pendingWorld=world;pendingResume=resume;selectEntryWorld(world==='ancient'?'ancient':'auth');entry.hidden=true;panel.hidden=true;auth.hidden=false;return false;
}
window.__ASTRIFT_REQUIRE_ACCOUNT__=requireAccount;
function enterAncient(){selectEntryWorld('ancient');entry.hidden=true;panel.hidden=true;navigateWorld('ancient')}
function enterMain(){requireAccount(()=>{entry.hidden=true;selectEntryWorld('main')},'main')}
for(const button of auth.querySelectorAll('[data-mode]'))button.onclick=()=>{
  const mode=button.dataset.mode;auth.hidden=true;
  if(mode==='cancel'){pendingWorld='';pendingResume=null;selectEntryWorld('');entry.hidden=false;return}
  document.getElementById(mode==='register'?'registerAccount':'loginAccount').click();
};
nodes[1].onclick=enterAncient;
document.getElementById('enterMainWorld').onclick=enterMain;
document.getElementById('enterAncientWorld').onclick=enterAncient;
window.addEventListener('astrift:account-changed',()=>{if(pendingWorld&&accountSession()){const resume=pendingResume;pendingWorld='';pendingResume=null;auth.hidden=true;resume?.()}});
const directAncientAuth=new URLSearchParams(location.search).get('astriftAuth');
window.addEventListener('astrift:account-dialog-cancelled',()=>{if(pendingWorld){pendingWorld='';pendingResume=null;if(['register','login'].includes(directAncientAuth)){navigateWorld('ancient');return}selectEntryWorld('');entry.hidden=false}});
if(['register','login'].includes(directAncientAuth)){
 const open=()=>{if(accountSession()){navigateWorld('ancient');return}pendingWorld='ancient';pendingResume=()=>navigateWorld('ancient');entry.hidden=true;selectEntryWorld('ancient');document.getElementById(directAncientAuth==='register'?'registerAccount':'loginAccount').click()};
 if(document.readyState==='complete')open();else window.addEventListener('load',open,{once:true});
}
