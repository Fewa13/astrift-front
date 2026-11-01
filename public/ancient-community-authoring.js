// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {attachMapCodeCompletion} from './ancient-code-completion.js';
import {communitySnapRotation} from './ancient-community-models.js';
import {compileMapScript} from './ancient-map-script.js';
export const MAP_SCRIPT_EXAMPLE=`# 地图物品 / Map-only items
item token "小镇铜币" "Town coin"
item pass "通行证" "Pass"

when join
  if visited == 0
    give token 5
    save visited 1
    message "欢迎来到小镇！" "Welcome to town!"
  end
end

when kill any
  give token 1
  add kills 1
end
`;
export function renderCommunityAuthoring(root,{mode,en,map,edit,place,focus,readOnly,status,request}){
 const L=(a,b)=>en()?b:a,E=(tag,text,parent=root)=>{const e=document.createElement(tag);e.textContent=text;parent.append(e);return e},B=(text,fn,parent=root)=>{const b=E('button',text,parent);b.type='button';b.onclick=fn;b.disabled=readOnly;return b},field=(label,value,fn,parent=root,type='text')=>{const l=E('label',label,parent);l.className='ceField';const i=E(type==='textarea'?'textarea':'input','',l);if(type!=='textarea')i.type=type;i.value=value;i.dataset.editorField=label;i.disabled=readOnly;i.onchange=()=>fn(type==='number'?Number(i.value):i.value);return i};
 if(map.tier===1&&mode!=='code'){E('p',L('中级地图解锁 NPC。','NPCs unlock on intermediate maps.')).className='communityHelp';return}
 if(mode==='code'){E('p',L('Astrift MapScript · 只作用于当前地图。先检查，再应用；应用后自动保存。','Astrift MapScript · Current map only. Check, then apply; changes autosave.')).className='communityHelp';const editor=field('MapScript',map.code||'',()=>{},root,'textarea');editor.style.cssText='min-height:300px;width:100%;box-sizing:border-box;font:13px/1.6 monospace;white-space:pre;';editor.spellcheck=false;editor.maxLength=16000;attachMapCodeCompletion(editor,{npcs:()=>(map.npcs||[]).map(n=>n.id),objects:()=>map.objects.map(o=>o.id)});E('small',L('灰字建议 · Tab 补全 / 缩进 · Esc 隐藏','Ghost suggestion · Tab complete / indent · Esc dismiss')).className='communityHelp';const output=E('p','');output.setAttribute('role','status');const check=()=>{try{const p=compileMapScript(editor.value);output.textContent=L('检查通过：','Valid: ')+p.items.length+L('种物品，',' items, ')+p.events.length+L('个事件',' events');return true}catch(e){output.textContent=e.message;return false}};B(L('检查代码','Check code'),check);B(L('应用代码','Apply code'),()=>{if(check()){edit(()=>{map.code=editor.value});status(L('代码已应用，正在自动保存。','Code applied. Autosaving.'))}});B(L('插入入门示例','Insert starter example'),()=>{if(editor.value&&!confirm(L('替换当前未应用的代码？','Replace the current code draft?')))return;editor.value=MAP_SCRIPT_EXAMPLE;check()});const help=E('details','');E('summary',L('语法与命令','Language reference'),help);E('pre',`function reward amount
  give token amount
  return amount * 2
end
when kill any
  call reward 2 -> result
  if player.hp < player.maxhp / 2
    heal 10
  else if item.token >= 10
    message "已有 {item.token} 铜币" "Coins: {item.token}"
  else
    addshared kills 1
  end
  task hunt "击杀：{shared.kills}" "Kills: {shared.kills}"
end

item id "中文" "English"
when join | kill [kind/any] | npc [id] | timer 秒 | zone X Z 半径
  give item 数量 / take item 数量
  let variable 数字 / save variable 数字
  add variable 数字
  if variable >= 数字或$变量
    ...
  end
  repeat 3
    ...
  end
  message "中文" "English"
  teleport X 脚底Y Z
  heal 数值
  spawn kind 等级 X 脚底Y Z
end
# function / call name 参数 -> 返回值变量 / return 表达式
# if / else if / else / end · repeat 0–16
# + - * / % · and or not · 字符串用双引号 / quoted strings
# random(min,max), min/max, abs/floor/ceil/round, clamp, len
# player.hp/maxhp/x/y/z/level/name/map · item.id
# shared name 值 / addshared name 增量 · shared.name 读取
# shared: 全图共享且永久保存 / shared and persistent per map
# show/hide/open/close 物体ID · move 物体ID X Y Z
# open: 旋转90°并取消碰撞；close: 恢复 / turn & unlock collision
# task id "中文" "English" · complete id · untask id
# 多参数中的复合表达式加括号 / wrap compound arguments: teleport ($x + 1) 0 20
# 每个 function/if/repeat/when 都需要 end
# == != > >= < <= · $variable 读取变量
# let 普通变量：仅退出地图时清空，掉线重连保留
# let: visit variable; reset on leaving, kept on reconnect
# save 保存变量：退出、重连后仍保留
# save: persistent per-player, per-map variable
# add 增减变量，$name 读取变量；未定义为 0
# add updates a variable; $name reads it; default 0
# set 保留旧行为，等同 save / legacy set = save
# 物品与保存变量按玩家、地图隔离
# Saved variables and items are isolated per player/map
# timer/zone 在玩家在线时检查 / checked while online
# Max 128 operations/event · 16 repeats · 16 script monsters
# 脚本怪物不提供正常世界奖励 / no normal-world rewards`,help).style.whiteSpace='pre-wrap';const logs=E('details','');E('summary',L('运行错误记录','Runtime error log'),logs);const list=E('div','',logs),refresh=E('button',L('刷新记录','Refresh logs'),logs);refresh.type='button';const load=async(clear=false)=>{if(!request)return;refresh.disabled=true;try{const result=await request('communityCodeLogs',{id:map.id,clear});list.replaceChildren();if(!result.logs?.length)E('p',L('暂无运行错误。','No runtime errors.'),list);for(const row of result.logs||[]){const entry=E('p',new Date(row.at).toLocaleString()+' · '+row.name+' · '+row.event+'\n'+row.message,list);entry.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.5 monospace'}}catch(e){list.textContent=e.message}finally{refresh.disabled=false}};refresh.onclick=()=>load();B(L('清空记录','Clear logs'),()=>load(true),logs);if(!request)refresh.disabled=true;return}
 E('p',L('先放置 NPC，再填写中英文对话。最多32个 NPC，每个最多10轮。交易只使用代码中 item 定义的本图物品。','Place an NPC, then write both languages. Up to 32 NPCs and 10 rounds each. Trades use this map’s item definitions in Code.')).className='communityHelp';B(L('放置 NPC','Place NPC'),place).disabled=readOnly||(map.npcs?.length||0)>=32;
 for(const n of map.npcs||[]){const box=E('details','');box.className='ceSelectedItem';const summary=E('summary',n.name[en()?1:0]+' · '+n.id,box);B(L('定位','Focus'),()=>focus(n.id),box);for(const [i,label]of [[0,'名字（中文）'],[1,'Name (English)']])field(label,n.name[i],v=>edit(()=>n.name[i]=v),box);for(const key of ['x','y','z'])field(key.toUpperCase(),n[key],v=>edit(()=>{n[key]=v}),box,'number');field(L('角度','Rotation'),Math.round(n.rotation*180/Math.PI),v=>edit(()=>{n.rotation=communitySnapRotation(v*Math.PI/180)}),box,'number');
 const lineBox=E('div','',box);for(const [index,line]of n.lines.entries()){const group=E('details','',lineBox);E('summary',L('第','Round ')+(index+1)+(en()?'':'轮'),group);for(const [key,who]of [['npc','NPC'],['player',L('玩家回复','Player reply')]])for(const [i,label]of [[0,'中文'],[1,'English']])field(who+' · '+label,line[key][i],v=>edit(()=>line[key][i]=v),group,'textarea');for(const [key,label]of [['take',L('玩家交出','Player gives')],['give',L('玩家获得','Player receives')]]){const input=field(label+' · item:1, other:2',line[key].map(a=>a.item+':'+a.quantity).join(', '),v=>{try{const items=compileMapScript(map.code||'').items,parsed=v.trim()?v.split(',').map(x=>{const [item,num]=x.trim().split(':');const quantity=Number(num);if(!items.some(i=>i.id===item)||!Number.isInteger(quantity)||quantity<1||quantity>999999)throw Error(L('请先在代码中定义物品，并填写有效数量。','Define items in Code first and enter valid quantities.'));return {item,quantity}}):[];edit(()=>line[key]=parsed)}catch(e){status(e.message,true)}},group);input.placeholder='token:2'}B(L('删除本轮','Delete round'),()=>{edit(()=>n.lines.splice(index,1));renderAgain()},group).disabled=readOnly||n.lines.length<=1}
 B(L('增加一轮对话','Add dialogue round'),()=>{edit(()=>n.lines.push({npc:['你好。','Hello.'],player:['好的。','All right.'],give:[],take:[]}));renderAgain()},box).disabled=readOnly||n.lines.length>=10;B(L('删除 NPC','Delete NPC'),()=>{edit(()=>map.npcs=map.npcs.filter(v=>v.id!==n.id));renderAgain()},box)}
 function renderAgain(){root.replaceChildren();renderCommunityAuthoring(root,{mode,en,map,edit,place,focus,readOnly,status,request})}
}
