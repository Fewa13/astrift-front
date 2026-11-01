// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {createJadeFusionUI} from './ancient-jade-fusion-ui.js?v=20261025-1';
import {renderEquipmentComparison} from './ancient-equipment-compare.js';
import {collectionName,collectionPartLabel} from './ancient-collection-label.js?v=20261021-jade-wear-1';
import {jadeSlot,jadeItemBonus,equippedJade,jadeBonuses} from './ancient-collections.js?v=20261021-jade-wear-1';
export function createCollectionsUI({getProfile,getPlayer,en,action,refresh,onShow,openMarket}){
 let fusing=false;const fusionUI=createJadeFusionUI({getProfile,en,action,refresh,onSelect:id=>selected=id});
 let lastOrder=[];let selected='',chosen=new Set(),page=0,generation=0,stop=()=>{};
 const L=(z,e)=>en()?e:z,el=(tag,text,parent)=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n},button=(text,fn,parent)=>{const n=el('button',text,parent);n.type='button';n.onclick=fn;return n};
 const bonusText=s=>[s.attack&&L('攻击 +','Attack +')+(s.attack*100).toFixed(2)+'%',s.health&&L('生命上限 +','Max HP +')+(s.health*100).toFixed(2)+'%',s.reduction&&L('受到伤害 -','Damage taken −')+(s.reduction*100).toFixed(2)+'%'].filter(Boolean).join(' · ');
 const dispose=()=>{generation++;stop();stop=()=>{}};
 function render(host){dispose();const token=generation,items=getProfile()?.collections||[];chosen=new Set([...chosen].filter(id=>items.some(i=>i.id===id&&i.kind==='bead')));if(!items.some(i=>i.id===selected)){const previous=lastOrder.indexOf(selected);selected=items[Math.min(Math.max(0,previous),items.length-1)]?.id||'';}lastOrder=items.map(i=>i.id);
  const chosenSize=items.find(i=>chosen.has(i.id))?.size;
  if(fusing){button(L('返回藏品','Back to collections'),()=>{fusing=false;refresh()},host);fusionUI.render(host,selected);return;}
  el('h3',L('藏品','Collections'),host);const tools=el('div','',host);tools.className='ancientInventoryTools';const join=button(L('串成手串','String selected beads'),()=>void action('collectionString',{ids:[...chosen]}).then(r=>{if(r){chosen.clear();selected=r.selected||selected;refresh()}}),tools);join.disabled=chosen.size<2||chosen.size>20;
  button(L('玉饰合成','Jade Ascension'),()=>{fusing=true;fusionUI.open(selected);refresh()},tools);
  if(openMarket)button(L('市场','Market'),openMarket,tools);
  const worn=equippedJade(getProfile()||{}),slots=el('div','',host);slots.className='ancientJadeWearSlots';for(const slot of ['wrist','chest']){const item=worn[slot],row=el('div','',slots);el('strong',L(slot==='wrist'?'腕饰':'胸饰',slot==='wrist'?'Wrist':'Pendant')+' · '+(item?collectionName(item,en()):L('未佩戴','Empty')),row);if(item)button(L('卸下','Unequip'),()=>void action('collectionUnequip',{slot,id:item.id}),row);}const total=jadeBonuses(getProfile()||{});if(total.attack||total.health||total.reduction)el('p',bonusText(total),slots);
  const counts=new Map();for(const item of items)if(item.kind==='bead')counts.set(item.size,(counts.get(item.size)||0)+1);
  const auto=button(L('珠联成串','Weave All Beads'),()=>void action('collectionAutoString').then(r=>{if(r){chosen.clear();selected=r.selected||selected;page=0;refresh()}}),tools);auto.disabled=![...counts.values()].some(n=>n>=2);
  const current=items.find(i=>i.id===selected);if(current){const preview=el('div','',host);preview.className='ancientCollectionPreview';import('./ancient-collection-model.js?v=20261025-quality-lustre-1').then(m=>{if(token===generation&&preview.isConnected)stop=m.mountJadeCollectionPreview(preview,current)});el('strong',collectionName(current,en()),host);if(jadeSlot(current.kind))renderEquipmentComparison(host,getProfile(),current,en(),true);
   const detail=el('details','',host);el('summary',L('材质详情','Material details'),detail);for(let i=0;i<current.parts.length;i++){const p=current.parts[i];el('p',(current.kind==='bracelet'?(i+1)+'. ':'')+collectionPartLabel(p,en())+' · '+L('估价 ','Value ')+p.product.value.toLocaleString()+(p.product.crackCount?L(' · 有裂',' · Fissured'):''),detail);}
  }
  const grid=el('div','',host);grid.className='ancientGrid ancientInventoryMaterials';const pages=Math.max(1,Math.ceil(items.length/12));page=Math.min(page,pages-1);
  for(const item of items.slice(page*12,page*12+12)){const card=el('article','',grid);card.className='materialCard ancientCollectionCard';card.dataset.collectionId=item.id;const name=button(collectionName(item,en()),()=>{selected=item.id;refresh()},card);name.classList.toggle('selected',selected===item.id);el('small',L('估价 ','Value ')+item.value.toLocaleString(),card);
   if(item.kind==='bead'){const label=el('label','',card),check=document.createElement('input');check.type='checkbox';check.checked=chosen.has(item.id);check.disabled=(!!chosenSize&&chosenSize!==item.size)||(chosen.size>=20&&!chosen.has(item.id));check.setAttribute('aria-label',L('选择串珠：','Select bead: ')+item.size+' mm');label.append(check,document.createTextNode(L('选择串珠','Select for stringing')));check.onchange=()=>{if(check.checked)chosen.add(item.id);else chosen.delete(item.id);refresh()};}
   const slot=jadeSlot(item.kind),wearing=slot&&worn[slot]?.id===item.id;if(slot){const n=jadeItemBonus(item);el('small',bonusText(slot==='wrist'?{attack:n,health:n*.5,reduction:0}:{attack:0,health:n*1.5,reduction:n*.25}),card);button(wearing?L('卸下','Unequip'):L('佩戴','Wear'),()=>void action(wearing?'collectionUnequip':'collectionEquip',wearing?{slot,id:item.id}:{id:item.id}),card).dataset.jadeWear=item.id;}
   if(item.kind==='bracelet'){const add=button(L('加入所选珠子','Add selected beads'),()=>void action('collectionString',{target:item.id,ids:[...chosen]}).then(r=>{if(r){chosen.clear();refresh()}}),card);add.disabled=wearing||!chosen.size||chosenSize!==item.size||item.parts.length+chosen.size>20;}
   const show=button(L('展示','Show'),()=>void action('collectionShow',{id:item.id}).then(r=>{if(r)onShow?.(r.display)}),card);show.disabled=!getPlayer()||getPlayer().hp<=0;
   button(L('出售','Sell')+' · '+item.value.toLocaleString(),()=>void action('collectionSell',{id:item.id}),card).disabled=!!wearing;
  }
  if(!items.length)el('p',L('暂无藏品','No collections yet'),grid);
  if(pages>1){const nav=el('div','',host);nav.className='ancientInventoryPager';button(L('上一页','Previous'),()=>{page--;refresh()},nav).disabled=page===0;el('span',(page+1)+' / '+pages,nav);button(L('下一页','Next'),()=>{page++;refresh()},nav).disabled=page===pages-1;}
 }
 return {render,dispose};
}
