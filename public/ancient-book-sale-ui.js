// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const pending=new Map();
export function appendBookSale(host,key,count,{en,action,useId}){const L=(z,e)=>en()?e:z,wrap=document.createElement('div');wrap.className='ancientActivityFilters';host.append(wrap);const q=document.createElement('input');q.type='number';q.min='1';q.max=String(Math.min(999,count));q.value='1';q.style.width='80px';q.setAttribute('aria-label',L('技能书数量','Skill book quantity'));wrap.append(q);const b=document.createElement('button');b.type='button';wrap.append(b);const use=useId?document.createElement('button'):null;
if(use){
 use.type='button';
 wrap.prepend(use);
 use.onclick=async()=>{
  if(use.disabled)return;
  sending=true;update();
  try{await action('useSupply',{id:useId,quantity:Number(q.value)});}
  finally{sending=false;update();}
 };
}
let sending=false;const update=()=>{const n=Number(q.value),valid=Number.isSafeInteger(n)&&n>=1&&n<=Math.min(999,count);b.textContent=L('出售','Sell')+' · '+(valid?n*300:0).toLocaleString();b.disabled=sending||!valid;
q.disabled=sending;
if(use){use.disabled=b.disabled;use.textContent=L('使用','Use')+(valid?' · '+n:'');}};q.oninput=update;b.onclick=async()=>{if(sending)return;const n=Number(q.value);if(!Number.isSafeInteger(n)||n<1||n>Math.min(999,count))return;if(!confirm(L('出售 '+n+' 本技能书，获得 '+n*300+' 金币？','Sell '+n+' skill book(s) for '+n*300+' Gold?')))return;const k=key+':'+n,data=pending.get(k)||{key,quantity:n,requestId:crypto.randomUUID()};pending.set(k,data);sending=true;update();try{const r=await action('sellSkillBooks',data);if(r?.ok)pending.delete(k);}finally{sending=false;update();}};update();}
