// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),source=path.join(root,'public'),out=path.join(root,'.static-hosting');
await fs.rm(out,{recursive:true,force:true});await fs.cp(source,out,{recursive:true});
const runtime=`(()=>{window.__ASTRIFT_API_ORIGIN__='https://play.astrift.com';const route=value=>{const u=new URL(value,location.href);return u.origin===location.origin&&u.pathname.startsWith('/api/')?window.__ASTRIFT_API_ORIGIN__+u.pathname+u.search:u.href};const nativeFetch=window.fetch.bind(window);window.fetch=(input,init)=>{const url=route(input instanceof Request?input.url:String(input));return nativeFetch(input instanceof Request?new Request(url,input):url,init)};const Socket=window.WebSocket;window.WebSocket=class extends Socket{constructor(url,protocols){const u=new URL(url,location.href);if(u.host===location.host&&u.pathname.startsWith('/api/')){u.protocol='wss:';u.host='play.astrift.com'}super(u.href,protocols)}}})();`;
await fs.writeFile(path.join(out,'static-backend.js'),'// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.\n'+runtime);
function prepare(html){return html.replace(/<head>/i,'<head><base href="/"><script src="/static-backend.js"></script>').replace(/<title>[\s\S]*?<\/title>/i,'<title>Study Portal</title>');}
await fs.writeFile(path.join(out,'codehelp.html'),prepare(await fs.readFile(path.join(source,'codehelp.html'),'utf8')));await fs.mkdir(path.join(out,'codehelp'),{recursive:true});await fs.writeFile(path.join(out,'codehelp','index.html'),prepare(await fs.readFile(path.join(source,'codehelp.html'),'utf8')));
await fs.mkdir(path.join(out,'_world'),{recursive:true});
for(const [world,file]of [['main','index.html'],['ancient','ancient.html']])await fs.writeFile(path.join(out,'_world',world+'.html'),prepare(await fs.readFile(path.join(source,file),'utf8')));
await fs.writeFile(path.join(out,'fps.html'),prepare(await fs.readFile(path.join(source,'index.html'),'utf8')));
await fs.writeFile(path.join(out,'ancient.html'),prepare(await fs.readFile(path.join(source,'ancient.html'),'utf8')));
await fs.writeFile(path.join(out,'index.html'),prepare(await fs.readFile(path.join(source,'world-shell.html'),'utf8')));
let shell=await fs.readFile(path.join(source,'world-shell.js'),'utf8');shell=shell.replace("'/_world/'+world+(search.size", "'/_world/'+world+'.html'+(search.size");await fs.writeFile(path.join(out,'world-shell.js'),shell);
// A mirror needs no offline API fallback; remove old registrations/caches on upgrade.
await fs.writeFile(path.join(out,'sw.js'),`// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.\nself.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',event=>event.waitUntil((async()=>{await Promise.all((await caches.keys()).filter(k=>k.startsWith('astrift-offline-')).map(k=>caches.delete(k)));await self.clients.claim()})()));`);
// Version the renderer URL so an old browser/CDN cache cannot reuse a partial file.
const three=await fs.readFile(path.join(source,'three.module.js')),threeName='three-'+createHash('sha256').update(three).digest('hex').slice(0,12)+'.js';
await fs.writeFile(path.join(out,threeName),three);
for(const file of await fs.readdir(out)){if(!file.endsWith('.js')||file==='three.module.js'||file===threeName)continue;const p=path.join(out,file),s=await fs.readFile(p,'utf8');if(s.includes('three.module.js'))await fs.writeFile(p,s.replaceAll('three.module.js',threeName));}
// Version every module edge as well as entry scripts, not just the top-level page.
const revision=createHash('sha256');for(const file of (await fs.readdir(source)).filter(f=>f.endsWith('.js')).sort())revision.update(await fs.readFile(path.join(source,file)));const stamp=revision.digest('hex').slice(0,12);
async function versionFiles(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()){await versionFiles(p);continue}if(!/\.(js|html)$/.test(e.name)||e.name.startsWith('three-')||e.name==='three.module.js')continue;let s=await fs.readFile(p,'utf8');s=s.replace(/(['"])(\.{0,2}\/[^'"\s]+\.js)(?:\?[^'"]*)?\1/g,(_,q,url)=>q+url+'?v='+stamp+q);await fs.writeFile(p,s)}}
await versionFiles(out);
await fs.writeFile(path.join(out,'CNAME'),'astrift-front.surge.sh\n');
console.log('Static mirror built from astrift-front/public:',out);

// Keep the domain hub's admin assets tied to this source too.
const hub=path.resolve(root,'../astrift-hub/public');try{await fs.access(hub);for(const file of ['codehelp.html','codehelp.js','codehelp-data.js','codehelp.css','admin.html','admin.css','admin.js','network-diagnostics.js','ancient-community-scene.js','ancient-community-furniture.js','ancient-community-catalog.js','ancient-community.js','ancient-community-models.js','ancient-community-hulls.js','three.module.js'])await fs.copyFile(path.join(source,file),path.join(hub,file));await fs.mkdir(path.join(hub,'codehelp'),{recursive:true});await fs.copyFile(path.join(source,'codehelp.html'),path.join(hub,'codehelp/index.html'));await fs.mkdir(path.join(hub,'admin'),{recursive:true});await fs.copyFile(path.join(source,'admin.html'),path.join(hub,'admin/index.html'));}catch(error){if(error.code!=='ENOENT')throw error}
