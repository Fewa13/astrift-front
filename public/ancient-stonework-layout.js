// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Move existing controls only: no extra previews, render loops or API calls.
export function organizeStoneWorkspace({body,list,detail,preview,tools,modeHint,probeReadout,en,cut,piece,product,initialTab,onTab}){
 const L=(a,b)=>en()?b:a,el=(tag,cls,parent)=>{const n=document.createElement(tag);n.className=cls;parent?.append(n);return n};
 body.classList.add('ancientStoneWorkspace');
 const sidebar=el('aside','ancientStoneSidebar');body.insertBefore(sidebar,detail);const heading=el('h4','',sidebar);heading.textContent=L('原石','Stones');list.setAttribute('aria-label',L('选择原石','Choose a stone'));sidebar.append(list);
 detail.classList.add('ancientStoneDesk');const title=detail.querySelector(':scope > h3');title?.classList.add('ancientStoneTitle');
 const existing=[...detail.children].filter(n=>n!==title),work=el('div','ancientStoneWork',detail),stage=el('div','ancientStoneStage',work),rail=el('div','ancientStoneRail',work);
 tools.classList.add('ancientStoneTools');stage.append(tools,preview);preview.classList.add('ancientStoneViewport');stage.append(modeHint,probeReadout);
 const tabs=el('div','ancientStoneTabs',rail);tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label',L('工坊操作','Workshop controls'));const contents=el('div','ancientStonePanels',rail),panels=new Map(),buttons=new Map();
 const switchTab=key=>{for(const [id,p]of panels){p.hidden=id!==key;const b=buttons.get(id);b.setAttribute('aria-selected',String(id===key));b.tabIndex=id===key?0:-1;}rail.dataset.tab=key;onTab?.(key);};
 const addTab=(key,label)=>{const b=el('button','',tabs);b.type='button';b.setAttribute('role','tab');b.textContent=label;b.dataset.workshopTab=key;b.onclick=()=>switchTab(key);buttons.set(key,b);const p=el('section','ancientStoneTabPanel',contents);p.setAttribute('role','tabpanel');p.setAttribute('aria-label',label);panels.set(key,p);return p;};
 if(cut){addTab('pieces',L('选料','Pieces'));addTab('craft',L('加工','Craft'));addTab('products',L('成品','Jewelry'));}
 addTab('report',cut?L('重量与估价','Weight & value'):L('原石信息','Stone details'));
 if(!cut){tabs.removeAttribute('role');tabs.removeAttribute('aria-label');const heading=el('h4','ancientStoneInfoHeading');heading.textContent=L('原石信息','Stone details');tabs.replaceWith(heading);rail.prepend(heading);}
 const pieces=detail.querySelector('.ancientStonePieces'),craft=detail.querySelector('.ancientJadeCraft'),products=detail.querySelector('.ancientJadeProducts');
 if(pieces)panels.get('pieces').append(pieces);if(craft)panels.get('craft').append(craft);if(products){panels.get('products').append(products);buttons.get('products').textContent+=` (${products.querySelectorAll('.ancientJadeProduct').length})`;}
 if(cut&&!craft){const p=el('p','ancientStoneEmpty',panels.get('craft'));p.textContent=L('先在“选料”中选择一块子料。','Choose a cut piece in Pieces first.');const b=el('button','',panels.get('craft'));b.type='button';b.textContent=L('选择子料','Choose a piece');b.onclick=()=>switchTab('pieces');}
 if(cut&&!products){const p=el('p','ancientStoneEmpty',panels.get('products'));p.textContent=L('暂无成品','No finished jewelry');}
 const footer=el('div','ancientStoneFooter',rail),sell=existing.at(-1);
 for(const n of existing){if([preview,tools,modeHint,probeReadout,pieces,craft,products].includes(n))continue;if(!cut&&n===sell&&n.tagName==='DIV'){const more=el('details','ancientStoneSellDrawer',panels.get('report'));const summary=el('summary','',more);summary.textContent=L('上架或丢弃','List or discard');more.append(n);continue;}if(n===sell&&n.tagName==='BUTTON'){footer.append(n);continue;}if(n.tagName==='BUTTON'&&product){stage.append(n);continue;}panels.get('report').append(n);}
 // An appraisal is already its own tab, so no nested disclosure is needed.
 for(const d of panels.get('report').querySelectorAll('.ancientJadeAssayDetails'))d.replaceWith(...[...d.children].filter(n=>n.tagName!=='SUMMARY'));
 tabs.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const ids=[...buttons.keys()],current=ids.indexOf(rail.dataset.tab),i=e.key==='Home'?0:e.key==='End'?ids.length-1:(current+(e.key==='ArrowRight'?1:-1)+ids.length)%ids.length;switchTab(ids[i]);buttons.get(ids[i]).focus();};
 switchTab(panels.has(initialTab)?initialTab:!cut?'report':product?'products':piece?'craft':'pieces');
}
