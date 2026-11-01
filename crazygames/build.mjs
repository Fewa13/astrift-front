// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const directory=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(directory);
const config=JSON.parse(fs.readFileSync(path.join(directory,'config.json'),'utf8'));
if(!/^[\w.-]+$/.test(config.version))throw Error('Invalid release version');
if(!['zh','en'].includes(config.defaultLanguage))throw Error('Invalid default language');
if(typeof config.sdkEnabled!=='boolean')throw Error('Invalid SDK setting');
const backend=new URL(config.backendOrigin);if(backend.protocol!=='https:'||backend.pathname!=='/'||backend.search||backend.hash||backend.username||backend.password)throw Error('backendOrigin must be an HTTPS origin');

const source=path.join(root,'public'),sourceHashes={};
const files=fs.readdirSync(source,{withFileTypes:true}).filter(entry=>entry.isFile()&&/\.(html|css|js|txt)$/.test(entry.name)&&!['sw.js','forum.html'].includes(entry.name)).map(entry=>entry.name).sort();
const compiled=new Map();
for(const name of files){
  const original=fs.readFileSync(path.join(source,name));sourceHashes[name]=createHash('sha256').update(original).digest('hex');
  let content=original.toString();
  if(name==='index.html'){
    content=content.replace(/<script id="astriftExitGuard">[\s\S]*?<\/script>/,'');
    const bootstrap=/<script>\s*\/\/ Pages[\s\S]*?<\/script>/;
    if(!bootstrap.test(content))throw Error('Homepage bootstrap changed: review the CrazyGames adapter before building');
    content=content.replace(bootstrap,`<script>window.__ASTRIFT_CRAZYGAMES_CONFIG__=${JSON.stringify(config).replaceAll('<','\\u003c')};</script>\n  <script src="./crazygames-platform.js"></script>`);
    // Upload bundles are served from a nested platform directory, not origin root.
    content=content.replace(/\b(href|src)="\/(?!\/)([^"\s]+)"/g,(_,attribute,file)=>`${attribute}="./${file}"`);
  }
  if(name==='game.js'){
    const audioConnection='audioCompressor.connect(audioContext.destination)';
    if(!content.includes(audioConnection))throw Error('Review platform audio routing: game audio output changed');
    content=content.replace(audioConnection,'platformAudioGain=audioContext.createGain();platformAudioGain.gain.value=window.__ASTRIFT_CG_SETTINGS__?.muteAudio?0:1;audioCompressor.connect(platformAudioGain);platformAudioGain.connect(audioContext.destination)');
    content+='\nlet platformAudioGain=null;\nwindow.__ASTRIFT_CG_APPLY_SETTINGS__=settings=>{if(platformAudioGain)platformAudioGain.gain.value=settings.muteAudio?0:1;for(const id of ["gameChat","openForum","openFriends"])$(id)?.classList.toggle("cgChatDisabled",settings.disableChat);if(settings.disableChat&&!$("gameChatForm").hidden)resetGameChat()};\n';
    content+='\n'+fs.readFileSync(path.join(directory,'overrides/game-hooks.js'),'utf8');
  }
  if(name==='game-chat.js'){
    content=content.replace("export function handleGameChat(data){","export function handleGameChat(data){if(window.__ASTRIFT_CG_SETTINGS__?.disableChat)return true;");
    content=content.replace("if(text){if(Array.from(text)","if(text&&!window.__ASTRIFT_CG_SETTINGS__?.disableChat){if(Array.from(text)");
    content=content.replace("if(!isPlaying()||event.repeat","if(window.__ASTRIFT_CG_SETTINGS__?.disableChat||!isPlaying()||event.repeat");
  }
  if(name==='style.css')content+='\n.cgChatDisabled{display:none!important}\n';
  compiled.set(name,Buffer.from(content));
}
compiled.set('crazygames-platform.js',fs.readFileSync(path.join(directory,'overrides/crazygames-platform.js')));
// Validate every local HTML asset and JS module reference before writing a release.
for(const [name,bytes] of compiled){const content=bytes.toString();const references=name.endsWith('.html')?[...content.matchAll(/\b(?:href|src)="(\.\/[^"?#]+)(?:[^" ]*)"/g)].map(m=>m[1]):name.endsWith('.js')?[...content.matchAll(/(?:from\s*|import\s*)['"](\.\/[^'"?#]+)(?:[^'"]*)['"]/g)].map(m=>m[1]):[];for(const reference of references)if(!compiled.has(reference.slice(2)))throw Error(`${name}: missing bundled asset ${reference}`)}
const fingerprint=createHash('sha256');for(const [name,bytes] of compiled)fingerprint.update(name).update(bytes);
const sourceFingerprint=fingerprint.digest('hex');
const releaseId=`${config.version}-${new Date().toISOString().replace(/[:.]/g,'-')}-${sourceFingerprint.slice(0,8)}`;
const release=path.join(directory,'releases',releaseId),game=path.join(release,'game');
fs.mkdirSync(game,{recursive:true});for(const [name,bytes] of compiled)fs.writeFileSync(path.join(game,name),bytes);
const archive=path.join(release,'astrift-crazygames.zip');
execFileSync('/usr/bin/zip',['-q',archive,...compiled.keys()],{cwd:game});
const report={releaseId,builtAt:new Date().toISOString(),version:config.version,sourceFingerprint,sourceHashes,files:compiled.size,totalBytes:[...compiled.values()].reduce((sum,bytes)=>sum+bytes.length,0),zipBytes:fs.statSync(archive).size,backendOrigin:backend.origin,status:'development-build-not-submitted',warnings:['Exact Astrift CrazyGames origin is configured in backend source; verify deployed backend and two-player/mode regressions in official Preview.','Platform muteAudio/disableChat implementation needs official Preview tests. Full Launch account, SDK data, friends/invite and UGC requirements still need implementation/review.','Local browser tests do not replace CrazyGames Developer Portal preview or platform approval.']};
fs.writeFileSync(path.join(release,'report.json'),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(directory,'latest.json'),JSON.stringify({releaseId,game:path.relative(directory,game),archive:path.relative(directory,archive),report:path.relative(directory,path.join(release,'report.json'))},null,2)+'\n');
console.log(`CrazyGames build: ${releaseId}\n${compiled.size} files · ${(report.totalBytes/1048576).toFixed(2)} MiB uncompressed\nUpload archive: ${archive}\nThis is a development build; platform integration/review is still required.`);
