// © 2026 Felix — Astrift. Contextual onboarding, no forced training map.
import {tutorialContext,tutorialEvent,openTutorialManager} from './smart-onboarding.js';
export function initTutorial(api){
 const b=document.createElement('button');b.id='openTutorial';b.textContent='教学管理 / Tutorials';b.onclick=openTutorialManager;document.getElementById('openKeybinds')?.parentElement.append(b);
 let before=null,moved=0;return {update(){if(!api.playing()){before=null;moved=0;return}const s=api.state();tutorialContext('fps.combat.v1');if(before){moved+=Math.hypot(s.x-before.x,s.z-before.z);if(moved>.5)tutorialEvent('move');if(s.targetHp<before.targetHp)tutorialEvent('attack')}before=s},get active(){return false},get showing(){return false}};
}
