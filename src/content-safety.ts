// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// A conservative first-pass rule set for user-generated text. Keep combat words
// (击杀、爆破、手雷等) available to players; reject targeted abuse and spam.
const blocked=[
  /支[\s._-]*那|黑[\s._-]*鬼|贱[\s._-]*种|低[\s._-]*能[\s._-]*儿|n[\s._-]*i[\s._-]*g[\s._-]*g[\s._-]*e[\s._-]*r/i,
  /强[\s._-]*奸|儿[\s._-]*童[\s._-]*色[\s._-]*情|恋[\s._-]*童|child[\s._-]*porn|rape\s+(you|her|him)/i,
  /去[\s._-]*死[\s._-]*吧|你[\s._-]*怎[\s._-]*么[\s._-]*还[\s._-]*不[\s._-]*死|kill\s+yourself|k[\s._-]*y[\s._-]*s\b/i,
  /售[\s._-]*卖[\s._-]*外[\s._-]*挂|代[\s._-]*练[\s._-]*加|免[\s._-]*费[\s._-]*刷[\s._-]*分/i,
  /(?:https?:\/\/|www\.|discord\.gg\/|t\.me\/|微[\s._-]*信[\s._-]*号|q[\s._-]*q[\s._-]*群)/i
];
const controls=/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
// Normalize only for detection; never rewrite a player's displayed message.
const invisible=/[\p{Cf}\p{M}]/gu;
const chineseAbuse=/傻[逼比屄]|煞[笔逼]|沙[比逼]|傻叉|傻狗|蠢货|蠢猪|废物|白痴|智障|弱智|脑残|脑瘫|贱人|贱货|贱种|狗东西|狗杂种|杂种|畜生|滚蛋|滚开|垃圾东西|你.{0,3}垃圾|操你|草你|艹你|肏你|你妈逼|你妈死|你爹死|你全家|死全家|全家死|死妈|没妈|妈了个逼|他妈的|她妈的|狗日的|婊子|妓女|吃屎|去死|自杀去|弄死你|杀了你|杀你全家|打死你|揍死你|人肉你|开盒你|支那|黑鬼|低能儿|强奸|兒童色情|儿童色情|恋童/;
const latinWords=['fuck','fucker','fucking','motherfucker','shit','bullshit','bitch','bastard','asshole','dumbass','dickhead','dick','cunt','whore','slut','retard','retarded','idiot','moron','imbecile','stupid','loser','scumbag','nigger','nigga','faggot','fag'];
// ASCII boundaries let Chinese text surround an abbreviation, but do not
// accidentally match "ass" inside "class" or "sb" inside "USB".
const abbreviations=['sb','s b','nmsl','nm sl','cnm','nmd','tmd','wcnm','wsnd','wdnmd','nt','sbl','stfu','gtfo','kys','wtf','fml','mf','fk','fck','fuk','bs','md','nm'];
function separatedWords(words:string[]){return new RegExp('(?:^|[^a-z0-9])(?:'+words.map(word=>Array.from(word.replace(/\s/g,'')).join('[\\s\\p{P}\\p{S}_]*')).join('|')+')(?:$|[^a-z0-9])','iu')}
const latinAbuse=separatedWords([...latinWords,...abbreviations,'kill yourself','kill you','go die','hurt you','rape you','murder you','kill your family']);
const threats=/\b(?:kill|hurt|rape|murder)\s+(?:you|yourself|ur|your\s+family)\b|\bgo\s+die\b|\b(?:hope|wish)\s+you\s+(?:die|were\s+dead)\b|\bchild\s*porn\b/i;
export function harmfulContent(value:string){
 const clean=value.normalize('NFKC').normalize('NFD').toLowerCase().replace(invisible,'');
 const compact=clean.replace(/[\s\p{P}\p{S}_]/gu,'');
 const leet=clean.replace(/[0134578@$!]/g,c=>({'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','@':'a','$':'s','!':'i'}[c]||c));
 return chineseAbuse.test(compact)||latinAbuse.test(clean)||latinAbuse.test(leet)||threats.test(clean)||blocked.some(rule=>rule.test(clean)||rule.test(compact));
}
export function contentIssue(value:string,kind:'name'|'message'|'post'){
  const text=value.trim().normalize('NFKC');
  if(!text||controls.test(text))return kind==='name'?'用户名无效':'内容无效';
  if(harmfulContent(text))return kind==='name'?'用户名包含违规内容':'内容包含违规信息，请修改后重试';
  if(kind!=='name'&&/(.)\1{11,}/u.test(text))return '请勿重复刷屏';
  return null;
}

export function roomChat(ctx:DurableObjectState,id:string,name:string,team:number,raw:unknown){
  if(typeof raw!=='string')return {error:'消息格式无效'};
  const text=raw.trim().normalize('NFKC');
  if(Array.from(text).length<1||Array.from(text).length>120)return {error:'消息需要 1–120 个字符'};
  const issue=contentIssue(text,'message');if(issue)return {error:issue};
  ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS room_chat_rate(id TEXT PRIMARY KEY,last_at INTEGER NOT NULL)');
  const now=Date.now(),last=ctx.storage.sql.exec<{last_at:number}>('SELECT last_at FROM room_chat_rate WHERE id=?',id).toArray()[0]?.last_at||0;
  if(now-last<1500)return {error:'发送太快，请稍后再试'};
  ctx.storage.sql.exec('INSERT INTO room_chat_rate(id,last_at) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET last_at=excluded.last_at',id,now);
  return {message:{type:'chat',id,name,team,text,at:now}};
}
