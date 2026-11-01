// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import fs from 'node:fs/promises';import vm from 'node:vm';import assert from 'node:assert/strict';
const runtime=await fs.readFile('.static-hosting/static-backend.js','utf8'),calls=[],sockets=[];
class Socket{constructor(url){sockets.push(url)}}
const window={fetch:async(...args)=>calls.push(args),WebSocket:Socket};const location=new URL('https://astrift-front.surge.sh/_world/main.html');
vm.runInNewContext(runtime,{window,location,URL,Request});await window.fetch('/api/account/login',{method:'POST'});assert.equal(calls[0][0],'https://play.astrift.com/api/account/login');await window.fetch('/three.module.js');assert.equal(calls[1][0],'https://astrift-front.surge.sh/three.module.js');new window.WebSocket('wss://astrift-front.surge.sh/api/room/test');assert.equal(sockets[0],'wss://play.astrift.com/api/room/test');
await window.fetch(new Request('https://astrift-front.surge.sh/api/account/check',{method:'POST',body:'{}'}));assert.equal(calls[2][0].url,'https://play.astrift.com/api/account/check');
for(const file of ['index.html','_world/main.html','_world/ancient.html']){const html=await fs.readFile('.static-hosting/'+file,'utf8');assert(html.includes('static-backend.js'));for(const [,url]of html.matchAll(/(?:src|href)="(\/[^"?]+)(?:\?[^\"]*)?"/g)){if(url==='/')continue;await fs.access('.static-hosting'+url)}}
const shell=await fs.readFile('.static-hosting/world-shell.js','utf8');assert(shell.includes("'/_world/'+world+'.html'"));for(const file of ['game.js','ancient-client.js']){const normalize=s=>s.replace(/three-[a-f0-9]{12}\.js/g,'three.module.js').replace(/\.js\?[^'"\s]+/g,'.js');assert.equal(normalize(await fs.readFile('.static-hosting/'+file,'utf8')),normalize(await fs.readFile('public/'+file,'utf8')))};
console.log('PASS: unbundled main game sources, both world documents/assets, API routing, Request bodies and FPS WebSocket routing.');
