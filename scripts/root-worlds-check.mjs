// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
const origins=process.argv.slice(2);if(!origins.length)origins.push('http://localhost:8792');
for(const origin of origins){
 for(const [cookie,world]of [['','main'],['astrift_world=ancient','ancient'],['otherastrift_world=ancient','main'],['astrift_world=main','main']]){
  const r=await fetch(origin+'/',{headers:{Cookie:cookie},redirect:'manual'});assert.equal(r.status,200);assert.equal(r.headers.get('X-Astrift-World'),'shell');assert.equal(r.headers.get('Cache-Control'),'no-store');const html=await r.text();assert(html.includes('__ASTRIFT_SHELL__'));assert(!html.includes('src="/ancient-client.js'));
 }
 for(const path of ['/ancient','/ancient/','/ancient.html']){const r=await fetch(origin+path,{redirect:'manual'});assert.equal(r.status,302);assert.equal(new URL(r.headers.get('Location')).pathname,'/');assert(r.headers.get('Set-Cookie').includes('astrift_world=ancient'));}
 const main=await fetch(origin+'/index.html',{headers:{Cookie:'astrift_world=ancient'}});assert((await main.text()).includes('id="worldEntry"'));
 for(const world of ['main','ancient']){const r=await fetch(origin+'/_world/'+world,{redirect:'manual'});assert.equal(r.status,200);assert.equal(r.headers.get('X-Astrift-World'),world);const html=await r.text();assert.equal(html.includes('src="/ancient-client.js'),world==='ancient');assert.equal(html.includes('id="worldEntry"'),world==='main')}
 const api=await fetch(origin+'/api/ancient/profile',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert(api.headers.get('Content-Type').includes('application/json'),'API stays JSON');
 console.log('PASS '+origin+': root selection, one world engine, legacy redirects, separate main cache and API routing.');
}
