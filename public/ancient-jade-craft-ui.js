// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {JADE_DESIGNS} from './ancient-stonework.js?v=20261021-jade-wear-1';
export function createJadeCraftControls(host,{en,getView,craft,isBusy}){
 const L=(a,b)=>en()?b:a,el=(tag,text,parent=host)=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n;},button=(text,fn,parent=host)=>{const b=el('button',text,parent);b.type='button';b.onclick=fn;return b;};
 host.classList.add('ancientJadeCraft');el('h4',L('进一步加工','Jewelry workshop'));
 const help=el('details','');help.className='ancientJadeCraftHelp';el('summary',L('操作说明','How to use'),help);el('p',L('选款式和大小，点击玉面新增；点放样名字后可移动或修改。','Choose a design and size, then click the face to add. Select a layout name to move or edit it.'),help);
 let kind='bangle',active=false,layouts=[],requestId='',last='',settings=Object.fromEntries(Object.entries(JADE_DESIGNS).map(([k,d])=>[k,d.size]));
 const choices=el('div',''),designButtons={};for(const [id,d]of Object.entries(JADE_DESIGNS))designButtons[id]=button(L('制作'+d.name,'Make a '+d.en.toLowerCase()),()=>start(id),choices);choices.className='ancientJadeDesignChoices';const label=el('label',''),range=el('input','',label),output=el('strong','',label);range.type='range';range.step='1';range.dataset.jadeSize='';
 const note=el('small',''),drafts=el('section','');drafts.className='ancientJadeLayouts';drafts.dataset.jadeLayouts='';
 const status=el('p',L('选择制作款式。','Choose a design to begin.'));status.setAttribute('aria-live','polite');status.dataset.craftStatus='';
 const actions=el('div','');actions.className='ancientJadeCraftActions';button(L('清除全部放样','Clear all layouts'),()=>{if(!isBusy())getView().clearCraft?.();},actions);
 const confirm=button(L('确认加工','Cut & polish'),()=>{if(!layouts.length||isBusy()||confirm.disabled)return;void craft({layouts,piece:host.dataset.piece,requestId});},actions);confirm.disabled=true;confirm.dataset.jadeCraft='';
 function start(next){if(isBusy())return;kind=next;active=true;configure();getView().setCraft?.({kind,size:settings[kind],startNew:true});}
 function configure(){const d=JADE_DESIGNS[kind];range.min=String(d.min);range.max=String(d.max);range.value=String(settings[kind]);output.textContent=L(kind==='bangle'?'圈口内径：':'尺寸：',kind==='bangle'?'Inner diameter: ':'Size: ')+settings[kind]+' mm';range.setAttribute('aria-label',L(d.name,d.en));for(const [id,b]of Object.entries(designButtons))b.classList.toggle('selected',active&&kind===id);note.textContent=L('工费'+d.fee+'金币／件',d.fee+' Gold each');}
 range.oninput=()=>{if(isBusy())return;settings[kind]=Number(range.value);configure();if(active)getView().setCraft?.({kind,size:settings[kind]});};
 configure();return {update(info){
  layouts=info?.layouts||[];const signature=JSON.stringify(layouts);if(last!==signature){last=signature;requestId=crypto.randomUUID();}
  confirm.disabled=!info?.valid||!layouts.length;confirm.textContent=L('确认加工','Cut & polish')+(layouts.length?' · '+layouts.length+L('件',' items'):'');drafts.replaceChildren();drafts.hidden=!layouts.length;
  if(info?.editing&&info.layout){kind=info.layout.kind;settings[kind]=info.layout.size;active=true;configure();}
  for(let i=0;i<layouts.length;i++){
   const layout=layouts[i],row=el('div','',drafts),name=(i+1)+'. '+L(JADE_DESIGNS[layout.kind].name,JADE_DESIGNS[layout.kind].en)+' · '+layout.size+' mm',select=button(name,()=>{if(!isBusy())getView().selectCraft?.(i);},row);select.classList.toggle('selected',info.editing&&i===info.active);select.dataset.jadeLayout=String(i);
   const remove=button('×',()=>{if(!isBusy())getView().removeCraft?.(i);},row);remove.setAttribute('aria-label',L('删除放样 ','Remove layout ')+(i+1));row.classList.toggle('invalid',!info.items[i]?.valid);
  }
  if(info?.error==='Choose a flat cut face'){status.textContent=L('请点击平整切面。原有放样已保留。','Click a flat cut face. Existing layouts are preserved.');return;}
  if(info?.error==='Craft batch limit reached'||info?.error==='Craft limit reached'){status.textContent=L('每批最多12件，完成后可继续放样。','Up to 12 layouts per batch; keep crafting after this batch.');return;}
  if(info?.error==='Not enough solid material'){status.textContent=L('此处边缘或厚度不足，请缩小或换位置。','Insufficient edge clearance or thickness. Reduce the size or choose another position.');return;}
  if(info?.error==='Overlaps a previous cut'){status.textContent=L('此处与已有放样或取料孔重叠，请换位置。','This position overlaps an existing layout or cutout. Choose another position.');return;}
  if(layouts.length&&!info.valid){status.textContent=L('有放样放不下或相互重叠。选中红框项目，换位置、缩小或删除；整批确认前不扣费。','A layout does not fit or overlaps another. Select a red item to move, resize or remove it. No charge before the complete plan is confirmed.');return;}
  const fee=layouts.reduce((n,p)=>n+JADE_DESIGNS[p.kind].fee,0),cracks=(info?.items||[]).filter(i=>i.crackCount>0).length;
  status.textContent=(layouts.length?L('已排好 ','Layouts ready: ')+layouts.length+L('件 · 总工费 ',' · Total fee: ')+fee+L('金币。',' Gold. '):'')+(!info?.editing?L('再点玉面直接新增；点下方名字才能编辑已有放样。','Click again to add another; select a name below to edit an existing layout.'):L('点击玉面可移动选中放样，滑条可调整大小。','Click a cut face to move the selected layout; use the slider to resize it.'))+(cracks?L(' 有裂纹穿过成品，价格会大幅下降。',' Crossing fissures will sharply reduce the affected item values.'):'');
 }};
}
