// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const result=await build({entryPoints:['src/content-safety.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {contentIssue}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
const denied=['你是傻逼','你是傻 比','你是傻\u200b逼','你真是废物','你这个智障','操你妈','死全家','SB','你sb啊','n.m.s.l','ＣＮＭ','t m d','stfu','GTFO','k y s','you idiot','f.u.c.k','fück','f@ggot','sh1t','sh!t','b1tch','b!tch','a55hole','kill yourself','kill you','go die','你去死','我要开盒你','儿童色情','https://spam.test'];
for(const kind of ['name','message','post'])for(const text of denied)assert.ok(contentIssue(text,kind),kind+': must reject '+text);
for(const text of ['你好','一起打BOSS吗','我死了，等我复活','击杀5个穴居兽','手雷爆炸伤害','Thunder Stride','class over','USB keyboard','assignment','passage','skill book','please help','AstriftFront','剑术师','forest boss','普通模式'])assert.equal(contentIssue(text,'message'),null,'Must allow '+text);
console.log('PASS: names/messages/posts, Chinese abuse, abbreviations, threats, separators, zero-width/full-width/diacritic variants, and normal game vocabulary.');
