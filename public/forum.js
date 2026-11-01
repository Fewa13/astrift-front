// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {accountSession} from './account.js?v=20261027-auth-recovery-1';

const $=id=>document.getElementById(id);
const DEVICE_KEY='astrift.forum.device.v1';
let device=localStorage.getItem(DEVICE_KEY);
if(!device||!/^[0-9a-f-]{36}$/i.test(device)){device=crypto.randomUUID();localStorage.setItem(DEVICE_KEY,device)}
let adminToken='',offset=0,loading=false,queuedReset=false;
const status=(message,error=false)=>{$('forumStatus').textContent=message;$('forumStatus').dataset.error=String(error)};
async function api(path,body){const response=await fetch('/api/forum'+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,cache:'no-store'});let result;try{result=await response.json()}catch{throw Error('论坛服务器响应无效')}if(!response.ok)throw Error(result.error||'请求失败');return result}
function updateIdentity(){const account=accountSession();$('forumName').value=account?.name||'';$('forumPostButton').disabled=!account;$('forumLoginPrompt').hidden=!!account}
function postElement(post){const article=document.createElement('article');article.className='forumPost'+(post.pinned?' pinned':'');const header=document.createElement('div');header.className='forumPostHeader';const name=document.createElement('b');name.textContent=post.name;const time=document.createElement('time');time.dateTime=new Date(post.created_at).toISOString();time.textContent=new Date(post.created_at).toLocaleString('zh-CN');header.append(name,time);if(post.pinned){const badge=document.createElement('span');badge.className='pinBadge';badge.textContent='置顶';header.append(badge)}const body=document.createElement('p');body.textContent=post.body;article.append(header,body);if(adminToken){const actions=document.createElement('div');actions.className='forumPostActions';const pin=document.createElement('button');pin.type='button';pin.textContent=post.pinned?'取消置顶':'置顶';pin.onclick=()=>moderate(post.id,post.pinned?'unpin':'pin');const remove=document.createElement('button');remove.type='button';remove.className='delete';remove.textContent='删除';remove.onclick=()=>{if(confirm('确定删除这条帖子？'))moderate(post.id,'delete')};actions.append(pin,remove);article.append(actions)}return article}
async function load(reset=true){if(loading){queuedReset ||= reset;return}loading=true;try{if(reset){offset=0;$('forumPosts').replaceChildren()}const result=await api(`?offset=${offset}`);for(const post of result.posts)$('forumPosts').append(postElement(post));offset+=result.posts.length;$('forumMore').hidden=!result.hasMore;if(offset===0){const empty=document.createElement('p');empty.className='forumEmpty';empty.textContent='还没有帖子，来发第一条吧。';$('forumPosts').append(empty)}}catch(error){status(error.message,true)}finally{loading=false;if(queuedReset){queuedReset=false;void load(true)}}}
async function moderate(id,action){try{await api('/moderate',{id,action,token:adminToken});status(action==='delete'?'帖子已删除':action==='pin'?'帖子已置顶':'已取消置顶');await load()}catch(error){status(error.message,true)}}
function setAdmin(active){$('forumAdminState').hidden=!active;$('forumPinWrap').hidden=!active;$('forumLogin').hidden=true;$('forumPassword').value='';$('forumAdmin').textContent=active?'管理员已登录':'管理员'}
async function logout(){const token=adminToken;adminToken='';setAdmin(false);if(token)try{await api('/logout',{token})}catch{}if(!$('forumOverlay').hidden)await load()}
async function closeForum(){if($('forumOverlay').hidden)return;$('forumOverlay').hidden=true;await logout()}
export function initForumUI(){
  $('openForum').onclick=()=>{$('forumOverlay').hidden=false;updateIdentity();status('');void load()};
  $('forumClose').onclick=()=>{void closeForum()};
  $('forumLoginPrompt').onclick=()=>{void closeForum();$('loginAccount').click()};
  $('forumBody').addEventListener('input',()=>{const chars=Array.from($('forumBody').value);if(chars.length>200)$('forumBody').value=chars.slice(0,200).join('');$('forumCount').textContent=`${Math.min(chars.length,200)} / 200`});
  $('postForm').addEventListener('submit',async event=>{event.preventDefault();const account=accountSession();if(!account){status('请先登录账号',true);return}const button=$('forumPostButton');button.disabled=true;try{await api('/post',{accountName:account.name,accountToken:account.token,accountDevice:account.device,body:$('forumBody').value,device,token:adminToken,pinned:!!adminToken&&$('forumPin').checked});$('forumBody').value='';$('forumPin').checked=false;$('forumCount').textContent='0 / 200';status('发布成功');await load()}catch(error){status(error.message,true)}finally{updateIdentity()}});
  $('forumRefresh').onclick=()=>{void load()};$('forumMore').onclick=()=>{void load(false)};
  $('forumAdmin').onclick=()=>{if(adminToken)return;$('forumLogin').hidden=!$('forumLogin').hidden;if(!$('forumLogin').hidden)$('forumPassword').focus()};
  $('forumCancelLogin').onclick=()=>{$('forumLogin').hidden=true;$('forumPassword').value=''};
  $('forumLogin').addEventListener('submit',async event=>{event.preventDefault();try{const result=await api('/login',{password:$('forumPassword').value});adminToken=result.token;setAdmin(true);status('管理员模式已开启');await load()}catch(error){status(error.message,true)}});
  $('forumLogout').onclick=()=>{void logout()};
  window.addEventListener('astrift:account-changed',updateIdentity);
  window.addEventListener('astrift:account-profile',updateIdentity);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('forumOverlay').hidden){event.preventDefault();event.stopImmediatePropagation();void closeForum()}},true);
  window.addEventListener('pagehide',()=>{if(!adminToken)return;const token=adminToken;adminToken='';void fetch('/api/forum/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token}),keepalive:true}).catch(()=>{})});
  updateIdentity();
  if(new URLSearchParams(location.search).has('forum'))$('openForum').click();
}
