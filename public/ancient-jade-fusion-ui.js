// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {jadeFusionQuote,JADE_FUSION_COUNT} from './ancient-jade-fusion.js?v=20261025-1';
import {jadeQualitySummary,JADE_QUALITIES} from './ancient-jade-quality.js';
import {isJadeWorn} from './ancient-collections.js';
import {collectionName} from './ancient-collection-label.js';
export function createJadeFusionUI({getProfile,en,action,refresh,onSelect}){
 let mainId='',ids=new Set(),confirming=false,pending=false,outcome=null,attempt=null,scroll=0;
 const L=(a,b)=>en()?b:a,el=(t,text,parent)=>{const n=document.createElement(t);n.textContent=text;parent.append(n);return n},button=(text,fn,parent)=>{const b=el('button',text,parent);b.type='button';b.onclick=fn;return b};
 function reset(){confirming=false;outcome=null;attempt=null;}
 function render(host,initial){const profile=getProfile(),items=profile?.collections||[];if(!mainId)mainId=initial||'';let main=items.find(i=>i.id===mainId);if(!main){main=items[0];mainId=main?.id||''}ids=new Set([...ids].filter(id=>items.some(i=>i.id===id)&&id!==mainId));
  host.classList.add('ancientJadeFusion');el('h3',L('玉饰合成','Jade Ascension'),host);el('p',L('主玉饰保留。每次消耗10件同品质、同类型辅料，失败也会消耗。尺寸可以不同。','Keep the main jewelry. Each attempt consumes 10 auxiliaries of the same type and quality, including on failure. Sizes may differ.'),host);
  const label=el('label',L('主玉饰','Main jewelry'),host),select=el('select','',label);select.setAttribute('aria-label',L('选择主玉饰','Select main jewelry'));select.disabled=pending;for(const i of items){const o=el('option',collectionName(i,en())+' · '+L('估价 ','Value ')+i.value.toLocaleString(),select);o.value=i.id;o.selected=i.id===mainId;}select.onchange=()=>{mainId=select.value;ids.clear();scroll=0;reset();onSelect(mainId);refresh()};
  if(outcome)el('p',outcome.success?L('合成成功，主玉饰已提升一个品质！','Success! The main jewelry advanced one quality tier.'):L('合成失败，主玉饰未变，10件辅料已消耗。','Ascension failed. The main jewelry is unchanged; 10 auxiliaries were consumed.'),host).setAttribute('role','status');
  if(!main){el('p',L('暂无可合成的玉饰','No jewelry available'),host);return}const q=jadeQualitySummary(main);if(q.qualityMin!==q.qualityMax){el('p',L('混合品质手串不能合成，请选择品质一致的玉饰。','Mixed-quality bracelets cannot ascend. Choose jewelry of a uniform quality.'),host);return}if(q.quality===8){el('p',L('已达到最高品质：太初','Maximum quality reached: Primordial'),host);return}
  el('strong',JADE_QUALITIES[q.quality-1][en()?1:0]+' → '+JADE_QUALITIES[q.quality][en()?1:0],host);
  const candidates=items.filter(i=>{const a=jadeQualitySummary(i);return i.id!==main.id&&i.kind===main.kind&&a.qualityMin===q.quality&&a.qualityMax===q.quality});ids=new Set([...ids].filter(id=>candidates.some(i=>i.id===id)));
  el('h4',L('选择辅料','Choose auxiliaries')+' · '+ids.size+' / '+JADE_FUSION_COUNT,host);el('small',L('辅料玉料价值越高，成功率越高。手串按每颗珠子的平均玉料价值计算。','Finer auxiliary jade increases the success chance. Bracelets use the average material value per bead.'),host);
  const list=el('div','',host);list.className='ancientFusionCandidates';for(const i of candidates){
   const row=el('div','',list),selected=ids.has(i.id),worn=isJadeWorn(profile,i.id);
   row.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 0';
   el('span',collectionName(i,en())+' · '+L('估价 ','Value ')+i.value.toLocaleString()+(worn?L(' · 已佩戴',' · Equipped'):''),row);
   const add=button(selected?L('移除辅料','Remove auxiliary'):L('添加辅料','Add auxiliary'),()=>{
    scroll=list.scrollTop;if(selected)ids.delete(i.id);else ids.add(i.id);reset();refresh();
   },row);add.setAttribute('aria-pressed',String(selected));add.disabled=pending||worn||!selected&&ids.size>=JADE_FUSION_COUNT;
  }
  list.scrollTop=scroll;
  if(!candidates.length)el('p',L('没有同品质、同类型的辅料。','No matching auxiliaries.'),list);
  const aux=items.filter(i=>ids.has(i.id)),quote=jadeFusionQuote(main,aux),ready=!quote.error;
  const chance=el('p',L('成功率：','Success chance: ')+(ready?(quote.chance*100).toFixed(2)+'%':L('请选择10件辅料','Select 10 auxiliaries')),host);chance.className='ancientFusionChance';
  if(confirming)el('p',L('即将永久消耗以上10件辅料。请核对后再次点击确认合成。','The 10 selected auxiliaries will be permanently consumed. Review them, then confirm ascension.'),host);
  const submit=button(pending?L('正在合成…','Ascending…'):confirming?L('确认消耗10件并合成','Confirm: consume 10 & ascend'):L('合成升阶','Ascend jewelry'),async()=>{if(pending||!ready)return;if(!confirming){confirming=true;refresh();return}const signature=JSON.stringify([main.id,[...ids].sort()]);if(attempt?.signature!==signature)attempt={signature,id:crypto.randomUUID()};pending=true;refresh();try{const r=await action('collectionFuse',{id:main.id,ids:[...ids],requestId:attempt.id});if(r){outcome=r.fusion;ids.clear();attempt=null;confirming=false;onSelect(main.id)}}finally{pending=false;refresh()}},host);submit.disabled=!ready||pending;
 }
 return {render,open(id){if(mainId!==id){mainId=id;ids.clear();scroll=0;reset()}}};
}
