// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {createRequire} from 'node:module';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdir,copyFile,writeFile} from 'node:fs/promises';
const require=createRequire('/Users/jingfeng/Documents/astrift-promo/package.json');
const ffmpeg=require('ffmpeg-static');
const run=promisify(execFile);
const out=new URL('./marketing/',import.meta.url).pathname;
const image='/Users/jingfeng/.codex/generated_images/01a065a1-ed85-7c00-9ec4-eb146425a7e4/exec-41a3e7ca-0a2d-44d6-a91e-9928be2f1074.png';
const raw='/Users/jingfeng/Documents/astrift-promo/raw-v6/page@9fa377d19b934105ea5e9e15c6df4af4.webm';
await mkdir(out,{recursive:true});
await copyFile(image,out+'cover-source.png');
for(const [name,w,h] of [['landscape',1920,1080],['portrait',800,1200],['square',800,800]]){
 await run(ffmpeg,['-i',image,'-vf',`scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`,'-frames:v','1','-update','1','-y',out+`cover-${name}.png`],{maxBuffer:2e6});
}
for(const [name,w,h] of [['landscape',1920,1080],['portrait',1080,1620]]){
 const cover=out+`cover-${name}.png`;
 const filter=`[0:v]scale=${w}:${h},fps=30,setsar=1,format=yuv420p[c];[1:v]crop=1180:664:50:28,scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},eq=contrast=1.12:brightness=0.04:saturation=1.2,fps=30,setsar=1,format=yuv420p[g];[c][g]concat=n=2:v=1:a=0[v]`;
 await run(ffmpeg,['-loop','1','-t','0.2','-i',cover,'-ss','5.9','-t','16','-i',raw,'-filter_complex',filter,'-map','[v]','-an','-c:v','libx264','-preset','veryfast','-crf','25','-movflags','+faststart','-y',out+`preview-${name}.mp4`],{maxBuffer:4e6});
}
await writeFile(out+'README.txt','CrazyGames Basic submission assets. Three cover formats and silent 16.2-second gameplay previews. Cover generated using the built-in image tool: original neon low-poly FPS arena, blue/red fictional fighters and a cyan phase rift, with only ASTRIFT // FRONT / 星隙前线 title text. Video sourced from existing original Astrift gameplay recording; no menu, promotional tagline, audio, or sped-up footage.\n');
console.log(out);
