// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const node=(tag='div')=>({tag,children:[],style:{},isConnected:true,scrollTop:0,scrollHeight:0,clientHeight:0,append(n){this.children.push(n)},replaceChildren(){this.children=[]},setAttribute(){},remove(){this.isConnected=false}});
const document={body:node('body'),hidden:false,activeElement:null,createElement:node},source=fs.readFileSync('public/ancient-friends-ui.js','utf8').replace('export function createAncientFriendsUI','function createAncientFriendsUI');
const context=vm.createContext({document,setInterval:()=>0,clearInterval(){}});vm.runInContext(source,context);
let english=false,active=true,joined='',sent=[];const state={friends:[{name:'buddy',online:true}],requests:[],incoming:[]};
const ui=context.createAncientFriendsUI({request:async(kind,data)=>{sent.push({kind,data});return {ok:true,friendState:state,...(kind==='friendMessages'?{messages:[{from:'buddy',text:'Hello',at:1}]}:{}),...(kind==='friendInviteRespond'?{joinMap:'forest'}:{})}},en:()=>english,name:()=> 'tester',active:()=>active,open(){},join:async map=>joined=map,isOpen:()=>true,refresh(){},status(){}});
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve()},buttons=n=>[...(n.tag==='button'?[n]:[]),...n.children.flatMap(buttons)];await flush();
for(english of [false,true]){
 const card=node();ui.render(card,false);assert(buttons(card).some(b=>b.textContent===(english?'Chat':'聊天')));assert(!buttons(card).some(b=>b.textContent===(english?'Invite':'邀请')),'Friends page has no direct invitation button');
 const invite=node();ui.render(invite,true);const button=buttons(invite).find(b=>b.textContent===(english?'Invite':'邀请'));assert(button);await button.onclick();await flush();assert.equal(sent.at(-1).kind,'friendMapInvite');
}
const text=n=>[n.textContent||'',...n.children.map(text)].join(' ');for(english of [false,true])for(const [activity,zh,eng]of [[{kind:'lobby'},'大厅','Lobby'],[{kind:'map',map:'forest'},'森林','The Forest'],[{kind:'community',title:'Friend Park'},'社区地图 · Friend Park','Community map · Friend Park'],[{kind:'editor',title:'New Castle'},'编辑器 · New Castle','Map editor · New Castle']]){state.friends[0].activity=activity;const panel=node();ui.render(panel,false);assert(text(panel).includes(english?eng:zh))}state.friends[0].online=false;const offline=node();ui.render(offline,false);assert(text(offline).includes('Offline'));assert(!text(offline).includes('New Castle'));state.friends[0].online=true;
active=false;const lobby=node();ui.render(lobby,true);assert(buttons(lobby).find(b=>b.textContent==='Invite').disabled,'invitations disabled outside map');
state.incoming=[{id:'invitation',sender:'buddy',map:'forest'}];await ui.poll();const accept=buttons(document.body).find(b=>b.textContent==='Accept');assert(accept);accept.onclick();await flush();assert.equal(joined,'forest');ui.dispose();
console.log('PASS: bilingual Friends page has chat but no Invite; separate map invitation page, lobby guard and incoming acceptance route to the invited map.');
