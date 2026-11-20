// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source=path.join(root,'.static-hosting'),ai=path.resolve(root,'../homework-ai'),out=path.join(ai,'surge-dist');
await fs.access(path.join(source,'world-shell.js'));
const files=await fs.readdir(path.join(ai,'public'));
const collisions=[];
for(const file of files)if(file!=='index.html'){try{await fs.access(path.join(source,file));collisions.push(file)}catch(error){if(error.code!=='ENOENT')throw error}}
if(collisions.length)throw new Error('AI/game asset collisions: '+collisions.join(', '));
await fs.rm(out,{recursive:true,force:true});
await fs.cp(source,out,{recursive:true});
await fs.rename(path.join(out,'index.html'),path.join(out,'game.html'));
await fs.cp(path.join(ai,'public'),out,{recursive:true});
await fs.writeFile(path.join(out,'CNAME'),'astrift-ai.surge.sh\n');
const release=await fs.readFile(path.join(root,'src/client-release.ts'),'utf8');
await fs.writeFile(path.join(out,'game-build.json'),JSON.stringify({clientRelease:/CLIENT_RELEASE = '([^']+)'/.exec(release)?.[1],entry:'/game.html',localAssets:true})+'\n');
console.log('AI site built with complete local Astrift assets:',out);
