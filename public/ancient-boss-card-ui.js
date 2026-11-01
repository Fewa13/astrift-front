// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {BOSS_CARDS,bossCardKey,bossCardDescription,activeBossForm} from './ancient-boss-cards.js?v=20261012-new-player-flow-1';
import {FORGE_MATERIAL_NAMES} from './ancient-gear.js?v=20261021-skyreach-market-1';
import {ancientStacks} from './ancient-rules.js?v=20261022-world-fixes-1';
export function renderBossCards(card,{profile,player,en,action,recipes=false}){
 const el=(tag,text,parent)=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n};
 el('h3',en?'BOSS Transformation Cards':'BOSS变身卡',card);const grid=el('div','',card);grid.className='ancientGrid';
 for(const [kind,d]of Object.entries(BOSS_CARDS))for(const count of recipes?[0]:ancientStacks(profile.materials[bossCardKey(kind)]||0)){
  const box=el('section','',grid);box.className='materialCard';el('strong',(en?d.en:d.name)+(recipes?'':' × '+count),box);el('small',bossCardDescription(kind,en),box);
  if(recipes)for(const [key,n]of Object.entries(d.recipe))el('p',(key==='core'?(en?'Phase Core':'相位核心'):FORGE_MATERIAL_NAMES[key]?.[en?1:0]||key)+' · '+(profile.materials[key]||0)+' / '+n,box);
  const b=el('button',recipes?(en?'Craft':'合成'):(en?'Use':'使用'),box);b.type='button';b.onclick=()=>void action(recipes?'craftBossCard':'useBossCard',{kind});
  if(recipes)b.disabled=Object.entries(d.recipe).some(([k,n])=>(profile.materials[k]||0)<n);else{b.dataset.bossCardUse=kind;b.disabled=!player||player.hp<=0||(player.skillRuntime?.effects?.transform?.until||0)>Date.now()}
 }
 if(!recipes&&!grid.childElementCount)el('p',en?'Craft cards in Inventory → Forge using BOSS materials.':'在背包 → 打造中使用BOSS材料合成。',grid);
}
