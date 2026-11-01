// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {mountRoughPreview} from './ancient-rough-preview.js?v=20261022-rough-1';
import {collectionName,collectionPartLabel} from './ancient-collection-label.js?v=20261021-jade-wear-1';
import {MARKET_CATEGORIES,marketGearItem,marketMinimumPrice} from './ancient-market-rules.js?v=20261021-skyreach-market-1';
import {gearName,gearDefinition,gearAffixDescription} from './ancient-gear.js?v=20261021-skyreach-market-1';
const ERRORS={
 'Unequip and unlock this equipment first':'请先卸下并解锁装备',
 'This listing is no longer available':'这件藏品已售出或下架',
 'Invalid market request':'请求无效，请重新打开市场',
 'Market request has changed':'请求内容已更改，请重新操作',
 'Collection item not found':'这件藏品已不在背包中',
 'Remove this collection from the trade first':'请先把这件藏品从交易中移除',
 'Enter a whole Gold price from 1 to 1,000,000,000':'请输入 1～1,000,000,000 的整数价格',
 'You can list up to 20 collections':'最多同时上架 20 件藏品',
 'Unequip this jewelry first':'请先卸下这件玉饰','This collection is already listed':'这件藏品已经上架',
 'Collection ownership conflict':'藏品归属冲突，请刷新市场',
 'Collections are full; free some space first':'藏品栏已满，请先腾出空间',
 'Only the seller can remove this listing':'只能下架自己上架的藏品',
 'You cannot buy your own listing':'不能购买自己的藏品',
 'Listing price changed; refresh before buying':'价格已变化，请刷新后再购买',
 'Not enough Ancient Gold':'远古金币不足',
 'Seller Gold limit reached':'卖家的金币已达上限，暂时无法购买'
};
export function createAncientMarketUI({en,getProfile,name,request,onProfile,refresh,isOpen}){
 const L=(z,e)=>en()?e:z,el=(tag,text,parent)=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n},button=(text,fn,parent)=>{const b=el('button',text,parent);b.type='button';b.onclick=fn;return b};
 let roughItems=[];let tab='browse',kind='',sort='new',page=0,sellPage=0,state=null,current=null,sellId='',loading=false,error='',message='',retry=null,confirm='',previewGeneration=0,stopPreview=()=>{},queuedRefresh=false;
 const itemName=item=>item.asset==='rough'?L('原石','Rough stone')+' · '+item.stone.weight.toFixed(3)+' kg':item.asset==='gear'?gearName(item.gear.key,en()):collectionName(item,en());
 const itemInfo=item=>item.asset==='rough'?item.stone.weight.toFixed(3)+' kg':item.asset==='gear'?gearAffixDescription(item.gear,en()):collectionPartLabel({jade:{variety:item.material,grade:item.grade}},en());
 const drafts=new Map(),redraw=()=>{if(isOpen())refresh()},dispose=()=>{previewGeneration++;stopPreview();stopPreview=()=>{}},query=()=>({own:tab==='mine',kind,sort,page});
 async function perform(action,data={},replay=false){
  if(loading)return;loading=true;error='';message='';confirm='';if(!replay)retry=null;redraw();
  try{
   const r=await request(action,{...query(),...data});if(!r?.ok&&r?.error)throw Error(r.error);
   if(r.profile)onProfile(r.profile);state=r.marketState||state;page=state?.page||0;
   if(action==='marketInspect')current=r.marketItem;
   else if(action==='marketSell'){tab='mine';kind='';page=0;current=r.marketItem;sellId='';message=L('已上架','Listed');}
   else if(action==='marketBuy'||action==='marketCancel'){current=null;message=action==='marketBuy'?L('购买成功，已放入背包','Purchased · Added to inventory'):L('已下架，已退回背包','Removed · Returned to inventory');}
   else if(current&&!state?.listings.some(i=>i.id===current.id))current=null;
   retry=null;
  }catch(e){error=en()?e.message:(ERRORS[e.message]||e.message);if(action==='marketInspect'||e.message==='This listing is no longer available')current=null;if(e.message==='This listing is no longer available'&&state)state={...state,listings:state.listings.filter(i=>i.id!==data.id)};if(['marketSell','marketBuy','marketCancel'].includes(action)&&!ERRORS[e.message])retry={action,data};}
  finally{loading=false;redraw();if(queuedRefresh){queuedRefresh=false;if(isOpen()&&tab!=='sell')void perform('marketList');}}
 }
 const mutate=(action,data)=>perform(action,{...data,requestId:crypto.randomUUID()});
 async function loadRough(){try{const r=await request('marketRoughInventory',{});roughItems=(r.stones||[]).map(stone=>({asset:'rough',id:stone.id,kind:'rough',stone}));redraw();}catch(e){error=e.message;redraw();}}
 function changeTab(next){if(loading)return;tab=next;page=0;current=null;confirm='';error='';message='';retry=null;if(next==='sell'){redraw();void loadRough();}else void perform('marketList');}
 function mount(host,item){if(item.asset==='rough'){stopPreview=mountRoughPreview(host,item.stone,{request,action:tab==='sell'?'stoneProbe':'marketRoughProbe',data:{id:tab==='sell'?item.id:current?.id}});return;}const token=previewGeneration;import(item.asset==='gear'?'./ancient-market-gear-preview.js?v=20261021-skyreach-market-1':'./ancient-collection-model.js?v=20261025-quality-lustre-1').then(m=>{if(token===previewGeneration&&host.isConnected)stopPreview=item.asset==='gear'?m.mountGearMarketPreview(host,item.gear):m.mountJadeCollectionPreview(host,item)}).catch(()=>{if(token===previewGeneration&&host.isConnected)host.textContent=L('3D 预览加载失败，请重试','3D preview failed to load; please try again')});}
 function details(host,item){
  el('h3',itemName(item),host);const preview=el('div','',host);preview.className='ancientCollectionPreview';mount(preview,item);
  if(item.asset==='rough')return;el('small',L('估价 ','Appraisal ')+item.value.toLocaleString()+' · '+L('远古金币','Ancient Gold'),host);
  if(item.asset==='gear'){const d=gearDefinition(item.gear.key);el('p',gearAffixDescription(item.gear,en()),host);for(const [key,zh,eng]of [['damage','武器伤害','Weapon damage'],['health','生命','HP'],['skillPower','技能伤害','Skill damage'],['hpPercent','生命上限','Max HP'],['reduction','减伤','Damage reduction']])if(d?.[key])el('p',L(zh,eng)+' +'+(key==='damage'||key==='health'?d[key]:(d[key]*100).toFixed(1)+'%'),host);return;}
  const detail=el('details','',host);el('summary',L('材质详情','Material details'),detail);for(const [i,part]of item.parts.entries())el('p',(item.kind==='bracelet'?(i+1)+'. ':'')+collectionPartLabel(part,en())+(part.product.crackCount?L(' · 有裂',' · Fissured'):''),detail);
 }
 function render(host){
  dispose();host.classList.add('ancientMarket');el('h2',L('市场','Market'),host);
  const header=el('div','',host);header.className='ancientMarketHeader';el('strong',L('远古金币 · ','Ancient Gold · ')+(getProfile()?.coins||0).toLocaleString(undefined,{maximumFractionDigits:2}),header);
  const tabs=el('div','',host);tabs.className='ancientTabs';for(const [id,zh,eng]of [['browse','市场','Browse'],['mine','我的上架','My listings'],['sell','上架物品','List an item']]){const b=button(L(zh,eng),()=>changeTab(id),tabs);b.classList.toggle('selected',tab===id);b.disabled=loading;}
  if(error){const note=el('div',error,host);note.className='ancientMarketError';if(retry)button(L('重试','Retry'),()=>void perform(retry.action,retry.data,true),note);}
  if(message){const note=el('p',message,host);note.setAttribute('role','status');}
  if(loading)el('p',L('加载中…','Loading…'),host);
  const body=el('div','',host);body.className='ancientMarketBody';const list=el('div','',body);list.className='ancientMarketList';const aside=el('aside','',body);aside.className='ancientMarketPreview';
  if(tab==='sell'){
   el('small',L('上架中 ','Active listings ')+(state?.mine||0)+' / '+(state?.limit||20),list);
   const p=getProfile(),items=[...roughItems,...(p?.collections||[]).filter(i=>!Object.values(p?.jadeEquipped||{}).includes(i.id)),...(p?.gear||[]).filter(i=>!i.locked&&!Object.values(p?.gearEquipped||{}).includes(i.id)).map(marketGearItem).filter(Boolean)];const pages=Math.max(1,Math.ceil(items.length/12));sellPage=Math.min(sellPage,pages-1);
   const grid=el('div','',list);grid.className='ancientMarketCards';for(const item of items.slice(sellPage*12,sellPage*12+12)){
    const b=button('',()=>{sellId=item.id;confirm='';redraw()},grid);b.dataset.marketCollection=item.id;b.classList.toggle('selected',sellId===item.id);b.disabled=loading;el('strong',itemName(item),b);if(item.asset!=='rough')el('small',L('估价 ','Appraisal ')+item.value.toLocaleString(),b);
   }
   if(!items.length)el('p',L('暂无可上架的藏品','No collections available to list'),list);
   pager(list,sellPage,pages,p=>{sellPage=p;redraw()});
   const item=items.find(i=>i.id===sellId);if(item){details(aside,item);const form=el('form','',aside);form.className='ancientMarketForm';const label=el('label',L('上架价格（远古金币）','Listing price (Ancient Gold)'),form),price=document.createElement('input');price.type='number';price.min=String((item.asset==='rough'?1:marketMinimumPrice(item.value)));price.max='1000000000';price.step='1';price.required=true;price.value=drafts.get(item.id)??(item.asset==='rough'?'':Math.max(1,item.value));price.setAttribute('aria-label',L('上架价格','Listing price'));label.append(price);price.disabled=loading;price.oninput=()=>{drafts.set(item.id,price.value);update()};
    const publish=button(L('确认上架','Confirm listing'),()=>{},form);publish.type='submit';const update=()=>{const n=Number(price.value);publish.disabled=loading||!Number.isSafeInteger(n)||n<marketMinimumPrice(item.value)||n>1e9;};update();form.onsubmit=e=>{e.preventDefault();if(!loading&&form.reportValidity())void mutate('marketSell',{id:item.id,asset:item.asset,price:Number(price.value)})};
   }else el('p',L('选择要上架的藏品','Choose a collection to list'),aside);
  }else{
   const filters=el('div','',list);filters.className='ancientMarketFilters';const type=el('select','',filters);type.setAttribute('aria-label',L('藏品类型','Collection type'));for(const [id,zh,eng]of [['','全部','All types'],...MARKET_CATEGORIES]){const o=el('option',L(zh,eng),type);o.value=id;}type.value=kind;type.disabled=loading;type.onchange=()=>{kind=type.value;page=0;current=null;void perform('marketList')};
   const order=el('select','',filters);order.setAttribute('aria-label',L('排序','Sort'));for(const [id,zh,eng]of [['new','最新上架','Newest'],['low','价格从低到高','Price: low to high'],['high','价格从高到低','Price: high to low']]){const o=el('option',L(zh,eng),order);o.value=id;}order.value=sort;order.disabled=loading;order.onchange=()=>{sort=order.value;page=0;current=null;void perform('marketList')};button(L('刷新','Refresh'),()=>void perform('marketList'),filters).disabled=loading;
   const grid=el('div','',list);grid.className='ancientMarketCards';for(const listing of state?.listings||[]){
    const b=button('',()=>void perform('marketInspect',{id:listing.id}),grid);b.dataset.marketListing=listing.id;b.classList.toggle('selected',current?.id===listing.id);b.disabled=loading;
    el('strong',itemName({...listing.item,parts:Array(listing.item.count||0).fill(null)}),b);el('span',listing.price.toLocaleString()+' '+L('金币','Gold'),b);el('small',itemInfo(listing.item)+(listing.item.fissured?L(' · 有裂',' · Fissured'):''),b);el('small',L('卖家：','Seller: ')+listing.seller,b);
   }
   if(state&&!state.listings.length)el('p',L('暂无上架藏品','No listings yet'),list);
   pager(list,state?.page||0,state?.pages||1,p=>{page=p;current=null;void perform('marketList')});
   if(current?.item){
    details(aside,current.item);el('p',L('卖家：','Seller: ')+current.seller,aside);el('strong',L('售价 · ','Price · ')+current.price.toLocaleString()+' '+L('远古金币','Ancient Gold'),aside);
    const tools=el('div','',aside);tools.className='ancientMarketBuy';
    if(current.seller===name().toLowerCase())button(L('下架取回','Remove listing'),()=>void mutate('marketCancel',{id:current.id}),tools).disabled=loading;
    else{
     const enough=(getProfile()?.coins||0)>=current.price;
     const buy=button(!enough?L('远古金币不足','Not enough Ancient Gold'):confirm===current.id?L('确认购买','Confirm purchase'):L('购买','Buy')+' · '+current.price.toLocaleString(),()=>{if(confirm===current.id)void mutate('marketBuy',{id:current.id,price:current.price});else{confirm=current.id;redraw()}},tools);buy.disabled=loading||!enough;
     if(confirm===current.id)button(L('取消','Cancel'),()=>{confirm='';redraw()},tools).disabled=loading;
    }
   }else el('p',L('选择藏品查看 3D 模型','Choose a collection to view its 3D model'),aside);
  }
 }
 function pager(host,p,pages,go){if(pages<=1)return;const bar=el('div','',host);bar.className='ancientInventoryPager';button(L('上一页','Previous'),()=>go(p-1),bar).disabled=loading||p===0;el('span',(p+1)+' / '+pages,bar);button(L('下一页','Next'),()=>go(p+1),bar).disabled=loading||p>=pages-1;}
 return {render,dispose,changed:()=>{if(!isOpen())return;if(loading)queuedRefresh=true;else if(tab!=='sell')void perform('marketList');else redraw()},open:()=>{confirm='';if(tab==='sell'){redraw();void loadRough();return;}void perform('marketList')}};
}
