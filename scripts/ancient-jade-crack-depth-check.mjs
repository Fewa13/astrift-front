// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
import {makeRoughStone,updateStoneAssay,stoneView} from '../public/ancient-stonework.js';
const {chromium}=createRequire('/Users/jingfeng/Documents/astrift-promo/record-worlds-v7.mjs')('playwright');
const s=Object.assign(makeRoughStone('roughMoon',4,'depth-check'),{grade:5,cracks:.95,coverage:.8,weight:2.7,variety:'spring',cut:{plane:{normal:[1,0,0],constant:0},position:50,angle:0,pose:[0,0,0,1]}});updateStoneAssay(s);
const source=fs.readFileSync('public/ancient-jade-workshop.js','utf8'),errors=[],temp=fs.mkdtempSync(path.join(os.tmpdir(),'astrift-crack-depth-'));
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://local');if(u.pathname==='/'){res.setHeader('Content-Type','text/html');res.end(`<body style="margin:0;background:#12251f"><div id="host" style="width:900px"></div><script type="module">import {createStonePreview} from '/ancient-jade-adapter.js';window.stopPreview=createStonePreview(document.getElementById('host'),${JSON.stringify(stoneView(s))});window.ready=true;</script>`);return;}try{res.setHeader('Content-Type','text/javascript');res.end(fs.readFileSync(path.join(path.resolve('public'),u.pathname)));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
try{
 for(const separation of [1,.25]){
  const frames={};for(const mode of ['on','off','mask','wrong-piece','too-deep']){
   const page=await browser.newPage({viewport:{width:900,height:600}});page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'&&m.text().includes('THREE'))errors.push(m.text());});
   await page.route('**/ancient-jade-workshop.js*',route=>{let text=source.replace('openParts(1);',`openParts(${separation});`);
    if(mode==='off'){assert(text.includes('line*.7*fade'));text=text.replace('line*.7*fade','line*0.*fade');}
    if(mode==='wrong-piece')text=text.replace('uPieceId: { value: id }','uPieceId: { value: 200 }');
    if(mode==='too-deep')text=text.replace('depth >= .30','depth >= .0001').replace('depth>=.30','depth>=.0001');
    if(mode==='mask')text=text.replace('renderer.render(scene, camera);\n    drawInk();','scene.overrideMaterial=crackMaskMaterial;renderer.render(scene,camera);scene.overrideMaterial=null;\n    drawInk();');
    return route.fulfill({contentType:'text/javascript',body:text});});
   await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.ready);await page.waitForTimeout(150);
   frames[mode]=Buffer.from(await page.locator('canvas[data-renderer=webgl]').evaluate(c=>{const gl=c.getContext('webgl2'),data=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,data);let bytes='';for(let i=0;i<data.length;i+=8192)bytes+=String.fromCharCode(...data.subarray(i,i+8192));return btoa(bytes);}),'base64');
   if(mode==='on')await page.screenshot({path:path.join(temp,'separation-'+separation+'.png')});await page.evaluate(()=>stopPreview());await page.close();
  }
  let changed=0;for(let i=0;i<frames.on.length;i+=4){const delta=Math.max(...[0,1,2].map(k=>Math.abs(frames.on[i+k]-frames.off[i+k])));if(delta>2){changed++;const cut=Math.max(...[-3600,0,3600].flatMap(d=>[-4,0,4].map(x=>frames.mask[i+d+x+1]||0)));assert(cut>120,'Gray hints cannot show through skin or empty background (one-pixel MSAA edge allowance)');}
   for(const mode of ['wrong-piece','too-deep'])assert(Math.max(...[0,1,2].map(k=>Math.abs(frames[mode][i+k]-frames.off[i+k])))<=2,mode+' hints must be fully hidden');
  }
  assert(changed>0,'Shallow same-piece cracks remain visible');console.log('PASS separation',separation,':',changed,'visible gray pixels, none through skin, wrong piece or beyond depth cutoff');
 }
 assert.deepEqual(errors,[]);console.log('PASS actual WebGL ownership/cut-face masking and depth cutoff; screenshots:',temp);
}finally{await browser.close();await new Promise(r=>server.close(r));}
