// Build-time translation only. The game uses the resulting local catalog offline.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const phrases=new Set();
function collect(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory()){collect(file);continue}if(!/\.(js|ts|html|css)$/.test(file)||/three\.module|i18n|language-catalog/.test(entry.name))continue;for(const phrase of fs.readFileSync(file,'utf8').match(/[\p{Script=Han}]+/gu)||[])phrases.add(phrase)}}
collect(path.join(root,'public'));collect(path.join(root,'src'));
const glossary={滑铲:'slide',腰射:'hip fire',开镜:'ADS',瞄具:'optic',准心:'reticle',准星:'reticle',后坐:'recoil',回弹:'recoil recovery',拉栓:'bolt cycling',换弹:'reload',弹匣:'magazine',弹容:'magazine capacity',下坠:'bullet drop',弹速:'projectile speed',血量:'health',头盔:'helmet',护甲:'armor',击杀:'kill',复活:'respawn',爆头:'headshot',配件:'attachment',枪皮:'weapon skin',刀皮:'knife skin',生存点:'survival points',相位点:'phase credits',安包:'plant',拆包:'defuse',攻方:'attackers',守方:'defenders',趴下:'prone',温雷:'cook grenade',人机:'AI',丧尸:'zombie',掩体:'cover'};
const glossaryKeys=Object.keys(glossary).sort((a,b)=>b.length-a.length);
const preprocess=s=>s.replace(new RegExp(glossaryKeys.join('|'),'g'),s=>' '+glossary[s]+' ');
const output={};const items=[...phrases];
for(let index=0;index<items.length;index+=45){
 const batch=items.slice(index,index+45),query=batch.map(preprocess).join('\n');
 let translated;
 for(let attempt=0;attempt<4;attempt++)try{
  const url=new URL('https://translate.googleapis.com/translate_a/single');for(const [key,value] of Object.entries({client:'gtx',sl:'zh-CN',tl:'en',dt:'t',q:query}))url.searchParams.set(key,value);
  const result=JSON.parse(execFileSync('curl',['-fsSL','--max-time','25',url.href],{encoding:'utf8'}));translated=result[0].map(part=>part[0]).join('').split('\n').map(s=>s.trim());if(translated.length!==batch.length)throw Error('Translation alignment '+translated.length+'/'+batch.length);break;
 }catch(error){if(attempt===3)throw error;await new Promise(r=>setTimeout(r,500*(attempt+1)))}
 for(let i=0;i<batch.length;i++)output[batch[i]]=translated[i];
 process.stderr.write(`Translated ${Math.min(index+45,items.length)}/${items.length}\n`);
}
process.stdout.write(JSON.stringify(output,null,2));
