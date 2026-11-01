// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Isolated UI fixture: no account, API calls, localStorage writes or real progression.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const root=path.resolve('public');
const html=`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/ancient.css"><link rel="stylesheet" href="/ancient-skills.css"></head><body><main id="card" class="ancientCard"></main><div id="ancientHud"></div><script type="module">
import {createAncientSkillUI} from '/ancient-skill-ui.js';import {PROFESSIONS} from '/ancient-skills.js';
const p={level:80,profession:'lightning',skills:Object.fromEntries(Object.values(PROFESSIONS).flatMap(j=>j.skills).map(id=>[id,3])),materials:{'supply:transfer':2},ascension:{day:'2026-10-12',attempts:0,jobs:{}}};
const ui=createAncientSkillUI({getProfile:()=>p,getPlayer:()=>null,en:()=>true,action:async()=>{},cast(){},slot(){},request:async()=>({dungeonState:{run:null}}),join:async()=>{}});ui.render(document.getElementById('card'));
</script></body></html>`;
http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');if(url.pathname==='/__ascension-preview'){res.setHeader('Content-Type','text/html');res.end(html);return}const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'application/octet-stream');fs.createReadStream(file).pipe(res)}).listen(8793,'127.0.0.1',()=>process.stdout.write('Ascension UI fixture: http://127.0.0.1:8793/__ascension-preview\n'));
