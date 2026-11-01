// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Real client + real AncientWorld/SQLite; only the Cloudflare transport/auth is local.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {DatabaseSync} from 'node:sqlite';
import {WebSocketServer} from 'ws';
import {build} from 'esbuild';
const {chromium}=createRequire('/Users/jingfeng/Documents/astrift-promo/record-worlds-v7.mjs')('playwright');
const root=path.resolve('public'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'astrift-hunts-qa-')),errors=[],missing=[],sockets=[],db=new DatabaseSync(':memory:'),module={exports:{}};
const sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows,one:()=>{assert.equal(rows.length,1);return rows[0];}};}},ctx={getWebSockets:()=>sockets.filter(s=>!s.closed),acceptWebSocket:ws=>sockets.push(ws),storage:{sql,setAlarm:async()=>{},transactionSync(fn){db.exec('BEGIN');try{const r=fn();db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}}}};
let connecting;
class Pair{constructor(){this[0]={};let actor;const real=connecting;this[1]={deserializeAttachment:()=>structuredClone(actor),serializeAttachment:a=>actor=structuredClone(a),send:s=>{if(real.readyState===1)real.send(s);},close(){this.closed=true;real.close();},real};}}
class EdgeResponse{constructor(body,options){this.status=options.status;this.webSocket=options.webSocket;}static json(body,options){return Response.json(body,options);}}
const compiled=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']});
vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,Date,crypto,AbortController,Math,Response:EdgeResponse,WebSocketPair:Pair,URL,console,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx;}}})});
const world=new module.exports.AncientWorld(ctx,{}),profile=world.read('qa');Object.assign(profile,{level:40,profession:'swordsman',skills:{swordwave:2,triplecut:2,swordrain:2,phantomblade:2}});profile.materials.huntToken=10;world.save('qa',profile);
const server=http.createServer(async(req,res)=>{const url=new URL(req.url,'http://local');try{
 if(url.pathname==='/api/ancient/profile'){let body='';for await(const b of req)body+=b;const data=JSON.parse(body),result=await world.command('qa',data.action,data);res.setHeader('Content-Type','application/json');res.writeHead(result.ok?200:409).end(JSON.stringify(result));return;}
 const file=path.join(root,url.pathname==='/'?'ancient.html':url.pathname);let data=fs.readFileSync(file);if(url.pathname==='/ancient-client.js')data=data.toString()+`\nwindow.huntQA={open:()=>openMenu('hunts'),stats:()=>({active,map:currentMap,run:dungeonRun,geometries:renderer.info.memory.geometries,draws:renderer.info.render.calls}),close:()=>{view='pause';paused=false;renderPanel()}};`;
 res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(data);
 }catch(e){if(url.pathname.startsWith('/api/')){res.writeHead(500).end(JSON.stringify({error:String(e)}));}else{if(url.pathname!=='/favicon.ico')missing.push(url.pathname);res.writeHead(404).end();}}});
const wss=new WebSocketServer({server});wss.on('connection',async(real,req)=>{connecting=real;try{const r=await world.fetch(new Request('https://local'+req.url,{headers:{Upgrade:'websocket'}}));if(r.status!==101)throw Error('Connect '+r.status);const fake=sockets.find(s=>s.real===real);real.on('message',data=>void world.webSocketMessage(fake,String(data)));real.on('close',()=>{fake.closed=true;});}catch(e){errors.push(String(e));real.close();}finally{connecting=undefined;}});
const timer=setInterval(()=>void world.alarm(),200);await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{localStorage.setItem('astrift.accountSession.v1',JSON.stringify({name:'qa',token:'a'.repeat(64)}));localStorage.setItem('astrift.language.v1','en');HTMLCanvasElement.prototype.requestPointerLock=()=>Promise.resolve();});
 await page.goto('http://127.0.0.1:'+server.address().port+'/ancient.html');await page.waitForFunction(()=>window.huntQA&&document.getElementById('ancientIdentity').textContent);
 await page.getByRole('button',{name:'Hunts',exact:true}).click();await page.getByRole('heading',{name:'The Hunt',exact:true}).waitFor();assert.equal(await page.locator('.ancientHuntCard').count(),3);
 await page.screenshot({path:path.join(temp,'contracts.png')});
 await page.locator('.ancientHuntCard').filter({hasText:'Hold the Beacon'}).getByRole('button',{name:'Create Challenge'}).click();await page.getByRole('button',{name:'Ready',exact:true}).click();await page.waitForFunction(()=>window.huntQA.stats().active&&window.huntQA.stats().run?.hunt?.id==='beacon');
 await page.waitForFunction(()=>document.getElementById('ancientDungeonHud').textContent.includes('Beacon · 100/100'));
 const geometry=(await page.evaluate(()=>huntQA.stats())).geometries;await page.waitForTimeout(1200);assert.equal((await page.evaluate(()=>huntQA.stats())).geometries,geometry,'Repeated snapshots reuse geometry');
 await page.screenshot({path:path.join(temp,'beacon.png')});
 for(let round=0;round<3;round++){const run=world.dungeons().get('qa'),live=world.world(run.map),ws=ctx.getWebSockets().find(s=>s.deserializeAttachment()?.name==='qa'),a=ws.deserializeAttachment();for(const m of live.monsters)world.damageMonster(ws,a,m,m.hp);world.persist(live);await world.tickMap(run.map);await page.waitForTimeout(250);}
 await page.waitForFunction(()=>window.huntQA.stats().run?.status==='complete');await page.getByRole('button',{name:'Leave Hunt'}).click();await page.waitForFunction(()=>window.huntQA.stats().map==='tribe'&&window.huntQA.stats().active);
 await page.evaluate(()=>huntQA.open());await page.getByRole('button',{name:'Nemeses',exact:true}).click();assert.equal(await page.locator('.ancientHuntCard').count(),2);
 await page.locator('.ancientHuntCard').filter({hasText:'Karok, Bonebreaker'}).getByRole('button',{name:'Create Challenge'}).click();await page.getByRole('button',{name:'Ready',exact:true}).click();await page.waitForFunction(()=>huntQA.stats().run?.hunt?.id==='karok'&&huntQA.stats().active);
 const run=world.dungeons().get('qa'),live=world.world(run.map),ws=ctx.getWebSockets().find(s=>s.deserializeAttachment()?.name==='qa'),a=ws.deserializeAttachment();assert(live.monsters[0].title);world.damageMonster(ws,a,live.monsters[0],live.monsters[0].hp);world.persist(live);await world.tickMap(run.map);await page.waitForFunction(()=>huntQA.stats().run?.status==='complete');await page.getByRole('button',{name:'Leave Hunt'}).click();await page.waitForFunction(()=>huntQA.stats().map==='tribe'&&huntQA.stats().active);
 await page.evaluate(()=>huntQA.open());await page.getByRole('button',{name:'Profession Relics',exact:true}).click();assert.equal(await page.locator('.relicCard').count(),8);const relic=page.locator('.relicCard').filter({hasText:'Pursuing Sword Casket'});await relic.getByRole('button',{name:/Exchange/}).click();await relic.getByRole('button',{name:'Equip',exact:true}).click();await relic.getByText('Equipped',{exact:true}).waitFor();assert.equal(world.read('qa').relic,'swordsman');await page.screenshot({path:path.join(temp,'relics.png')});
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Mobile panel has no horizontal overflow');await page.screenshot({path:path.join(temp,'relics-mobile.png')});assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
 console.log('PASS real Chrome + SQLite: lobby Hunts, beacon 3 waves, nemesis clear, exit to world, relic craft/equip, HUD, mobile layout, stable geometry and no exceptions/missing assets. Screenshots:',temp);
}finally{clearInterval(timer);await browser.close();for(const s of sockets)s.real.close();wss.close();server.close();db.close();}
