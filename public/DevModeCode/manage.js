// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const $=id=>document.getElementById(id);
async function request(action,extra={}){
 const response=await fetch('/api/devbuild/codes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,password:$('password').value,...extra})});
 const data=await response.json();
 if(!data.ok)throw Error(data.error);
 return data;
}
async function refresh(){
 const {codes}=await request('list');$('panel').hidden=false;$('list').replaceChildren();
 for(const code of codes){
  const row=document.createElement('li');
  row.textContent=(code.label||new Date(code.created).toLocaleString())+' · '+(code.used?'已使用':'待兑换');
  if(!code.used){
   const remove=document.createElement('button');remove.textContent='删除';
   remove.onclick=()=>run(async()=>{await request('delete',{id:code.id});await refresh();});
   row.append(remove);
  }
  $('list').append(row);
 }
}
async function run(action){try{await action();}catch(error){$('message').textContent=error.message;}}
$('unlock').onsubmit=e=>{e.preventDefault();$('message').textContent='';void run(refresh);};
$('create').onsubmit=e=>{e.preventDefault();void run(async()=>{
 const {code}=await request('add',{label:$('label').value});
 $('message').textContent='请复制游玩码（仅显示一次） '+code;
 await refresh();
});};
