// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {GROWTH_COMBOS,GROWTH_SKILL_NAMES,ANCIENT_FORGE,gearName,equippedGear,gearHuntQuota} from './ancient-gear.js?v=20261021-skyreach-market-1';
export function createGrowthHud(parent,en){
 let nextUpdate=0;
 const combo=document.createElement('div');combo.className='ancientComboHint';combo.hidden=true;parent.append(combo);
 const goal=document.createElement('div');goal.className='ancientGrowthTrack';goal.hidden=true;parent.append(goal);
 return {update(p,actor,visible){
  if(!visible){combo.hidden=goal.hidden=true;return;}if(performance.now()<nextUpdate)return;nextUpdate=performance.now()+200;
  const key=equippedGear(p,'weapon')?.combo,c=key&&key===p.profession&&GROWTH_COMBOS[key],ready=c&&actor?.skillRuntime?.gearChain?.key===key&&actor.skillRuntime.gearChain.until>Date.now();combo.hidden=!visible||!ready;
  if(ready)combo.textContent='◆ '+GROWTH_SKILL_NAMES[c.to][en()?1:0]+' +'+Math.round(c.bonus*100)+'% · '+Math.ceil((actor.skillRuntime.gearChain.until-Date.now())/1000)+'s';
  if(p.gearHunt){goal.hidden=false;goal.textContent=gearName(p.gearHunt.key,en())+' · '+p.gearHunt.count+'/'+gearHuntQuota(p.gearHunt.key);return;}
  const recipe=p.gearGoal&&ANCIENT_FORGE[p.gearGoal];goal.hidden=!visible||!recipe;if(recipe)goal.textContent=gearName(p.gearGoal,en())+' · '+Object.entries(recipe).map(([k,n])=>Math.min(p.materials[k]||0,n)+'/'+n).join(' · ');
 }};
}
