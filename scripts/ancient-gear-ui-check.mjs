// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {newAncientProfile} from '../public/ancient-rules.js';
import {rollGearItem} from '../public/ancient-gear.js';
class Element{constructor(tag){this.tag=tag;this.textContent='';this.children=[];this.dataset={};this.className=''}append(n){this.children.push(n)}get childElementCount(){return this.children.length}}
globalThis.document={createElement:tag=>new Element(tag)};
const compiled=await build({entryPoints:['public/ancient-gear-ui.js'],bundle:true,write:false,format:'esm',platform:'node'}),{createAncientGearUI}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const p=newAncientProfile();p.level=50;const setItem=rollGearItem('set_thunder_armor2',()=>.5);p.gear.push(setItem,rollGearItem('purifyHoly',()=>.5));let english=false,card,actions=[];const ui=createAncientGearUI({getProfile:()=>p,en:()=>english,action:(a,d)=>actions.push([a,d]),refresh:()=>render()});function render(){card=new Element('main');ui.render(card)}const all=n=>[n,...n.children.flatMap(all)],find=(tag,text)=>all(card).find(n=>n.tag===tag&&n.textContent===text),items=()=>all(card).filter(n=>n.className.includes('ancientGearItem'));
render();assert.equal(items().length,3);assert(all(card).some(n=>n.className==='ancientAffixes'));
let select=all(card).find(n=>n.tag==='select');select.value='2';select.onchange();assert.equal(items().length,1);assert(items()[0].children.some(n=>n.textContent.includes('雷鸣')));find('button','锁定').onclick();assert.deepEqual(actions.at(-1),['lockGear',{id:setItem.id,locked:true}]);
find('button','全部物品').onclick();assert.equal(items().length,3);find('button','打造').onclick();assert(find('button','返回装备'));assert(all(card).find(n=>n.className==='ancientGrid').children.length<=40,'Forge paginated');
english=true;render();assert(find('button','Back to gear'));assert(all(card).some(n=>n.textContent.includes('Skill damage +5%')));find('button','Back to gear').onclick();assert(find('button','Forge'));assert(all(card).some(n=>n.textContent.includes('Skill cooldown reduction')));
console.log('PASS: inventory rendering, quality/set filters, affix details, lock action, forge pagination, bilingual UI.');
