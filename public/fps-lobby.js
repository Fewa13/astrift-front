import {mobileDevice} from './mobile-ui.js';
import {renderFixedMovement} from './mobile-movement-settings.js';
import {createHUDEditor} from './astrift-hud-editor.js';
import {tutorialContext,tutorialEvent} from './smart-onboarding.js';
// © 2026 Felix — Astrift. All rights reserved.
const $=id=>document.getElementById(id),en=()=>document.documentElement.lang==='en',L=(a,b)=>en()?b:a;
const menu=$('menu'),home=menu.querySelector('.homeModes');menu.classList.add('fpsOrganizedLobby');
const start=document.createElement('button');start.id='startGame';start.className='fpsStart primary';const lobbyActions=document.createElement('div');lobbyActions.className='fpsLobbyActions';lobbyActions.hidden=true;const hero=document.createElement('section');hero.className='fpsLobbyHero';hero.append(menu.querySelector('.brand'),start);lobbyActions.append(hero);document.body.append(lobbyActions);const syncLobby=()=>{lobbyActions.hidden=!menu.classList.contains('active')||menu.hidden||!!document.getElementById('worldEntry')&&!document.getElementById('worldEntry').hidden};new MutationObserver(syncLobby).observe(menu,{attributes:true,attributeFilter:['class','hidden']});if($('worldEntry'))new MutationObserver(syncLobby).observe($('worldEntry'),{attributes:true,attributeFilter:['hidden','class']});syncLobby();
const dialog=document.createElement('dialog');dialog.className='fpsStartDialog';dialog.innerHTML='<header><h2></h2><button type="button">×</button></header><div class="fpsModeColumns"><section><h3></h3><div id="fpsOrdinaryModes"></div></section><section><h3></h3><div id="fpsSpecialModes"></div></section></div>';document.body.append(dialog);dialog.querySelector('header button').onclick=()=>dialog.close();
const ordinary=$('fpsOrdinaryModes'),special=$('fpsSpecialModes');
for(const id of ['solo','openNormalMode','practice'])ordinary.append($(id));
for(const entry of [...$('specialModePanel').querySelectorAll('.duelEntry,.objectiveEntry')]){
 if(entry.querySelector('#openExtraction,#soloBomb')){entry.hidden=true;entry.dataset.retired='true';continue}
 (entry.querySelector('#quickDuel,#soloAiDuel,#createTri,#createQuad')?ordinary:special).append(entry);entry.hidden=false;
}
$('openSpecialMode').hidden=true;
const settings=document.createElement('details');settings.className='fpsSettings';settings.innerHTML='<summary></summary><div></div>';menu.append(settings);const body=settings.lastElementChild;if(mobileDevice)renderFixedMovement(body,en);
for(const node of [$('toggleLanguage'),menu.querySelector('.qualityControl'),menu.querySelector('.settingsActions')])if(node)body.append(node);
const moveGuide=()=>{if($('openGameGuide'))body.append($('openGameGuide'));if($('openTutorial'))body.append($('openTutorial'))};moveGuide();new MutationObserver(moveGuide).observe(home,{childList:true});
$('openLoadoutMode').classList.add('fpsLoadout');const forum=$('openForum');forum.innerHTML='<b></b><small></small>';home.append(forum);home.classList.add('fpsLobbyDock');home.append($('openLoadoutMode'));lobbyActions.append(home);
for(const option of document.querySelectorAll('#friendInviteMode option[value="bomb"],#friendInviteMode option[value="extraction"]'))option.remove();
start.onclick=()=>dialog.showModal();dialog.addEventListener('click',e=>{if(e.target.closest('button')&&e.target!==start)dialog.close()});
function labels(){forum.querySelector('b').textContent=L('论坛','Forum');forum.querySelector('small').textContent=L('交流与讨论','Community discussions');start.textContent=L('开始游戏','Start game');settings.firstElementChild.textContent=L('设置','Settings');dialog.querySelector('h2').textContent=L('开始游戏','Start game');const headings=dialog.querySelectorAll('h3');headings[0].textContent=L('普通模式','Normal modes');headings[1].textContent=L('特殊模式','Special modes')};labels();window.addEventListener('astrift:language-changed',labels);

const hud=createHUDEditor('fps',['#hud .score','#hud .health','#hud .rift','#hud .ammo','#hud .cross','#playerIdentity','#equipmentHud','#minimap']);const hudButton=document.createElement('button');hudButton.textContent='HUD';hudButton.onclick=hud.open;body.append(hudButton);document.getElementById('openArmory')?.addEventListener('click',()=>tutorialContext('fps.weapon.v1'));
