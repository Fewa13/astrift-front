// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const bundle=await build({absWorkingDir:root,entryPoints:['devbuild/game.js'],bundle:true,write:false,minify:true,format:'iife',target:'es2022',
 plugins:[{name:'asset-versions',setup(build){build.onResolve({filter:/\.js\?v=/},args=>({path:path.resolve(args.resolveDir,args.path.split('?')[0])}));}}]});
const target=path.resolve(root,'../astrift-html/Astrift-DevBuildAncient.html');
const html=fs.readFileSync(path.join(root,'devbuild/index.html'),'utf8').replace('/*BUNDLE*/',()=>bundle.outputFiles[0].text.replace(/<\/script/gi,'<\\/script'));
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,html);
console.log(target);
