import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import * as THREE from 'three';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {KNIFE_FORMS,knifePreviewSVG} from '../public/knife-forms.js';
const profiles=Object.values(KNIFE_FORMS);
const game=await readFile('public/game.js','utf8'),mesh=()=>new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial());
const names=['knifeBlade','knifeCuttingEdge','knifeHalo','knifeGuard','knifeHandle','knifePommel','knifeFacet','knifeChannel'];
const context={THREE,KNIFE_FORMS,knifeFormId:'',knifeWraps:Array.from({length:5},mesh),...Object.fromEntries(names.map(n=>[n,mesh()]))};
vm.runInNewContext(game.split('\n').filter(line=>line.startsWith('function knifeShape(')||line.startsWith('function applyKnifeForm(')).join('\n'),context);
for(const id of Object.keys(KNIFE_FORMS)){context.applyKnifeForm(id);context.knifeBlade.geometry.computeBoundingBox();assert(context.knifeBlade.geometry.boundingBox.max.y>.7,id);assert.equal(context.knifeGuard.rotation.x,-Math.PI/2)}
for(const item of [...names.map(n=>context[n]),...context.knifeWraps]){item.geometry.dispose();item.material.dispose()}
assert.equal(profiles.length,19);assert.equal(new Set(profiles.map(f=>JSON.stringify(f.blade))).size,19);
for(const [id,f] of Object.entries(KNIFE_FORMS)){
 for(const points of [f.blade,f.edge,f.guardProfile,f.inlay]){const shape=new THREE.Shape(points.map(p=>new THREE.Vector2(...p)));shape.closePath();const geometry=new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:true,bevelSegments:2,bevelSize:.006,bevelThickness:.009});assert(geometry.attributes.position.count>0,id);assert([...geometry.attributes.position.array].every(Number.isFinite),id);geometry.dispose()}
 const svg=knifePreviewSVG({id,shell:0x444444,edge:0xffffff,grip:0x222222,accent:0x66ffff,dark:0x111111});assert(svg.includes('<svg'));assert(!svg.includes('undefined'));
}
const bundled=await build({stdin:{resolveDir:process.cwd(),contents:`import {PlayerAccount} from './src/player-account';export class TestAccount extends PlayerAccount{seed(){this.ctx.storage.sql.exec("INSERT INTO account(id,name,salt,password_hash,snapshot) VALUES(1,'Tester','salt','hash','{}')")}profileNow(){return this.profile(this.row())}expire(){this.ctx.storage.sql.exec('UPDATE event_rewards SET expires=? WHERE expires>0',Date.now()-1)}legacy(id){this.ctx.storage.sql.exec('INSERT OR REPLACE INTO event_rewards VALUES(?,?,?,0)',id,'event-warrior-bronze',Date.now()-1000)}}export default {fetch(){return new Response('ok')}}`},bundle:true,write:false,format:'esm',platform:'browser',external:['cloudflare:workers']});
const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:bundled.outputFiles[0].text,compatibilityDate:'2026-09-02',durableObjects:{PLAYER_ACCOUNTS:{className:'TestAccount',useSQLite:true}}}));
try{
 const ns=await mf.getDurableObjectNamespace('PLAYER_ACCOUNTS'),account=ns.get(ns.idFromName('rewards-test'));await account.seed();
 const id='00000000-0000-4000-8000-019900000000',before=Date.now();let profile=await account.grantTournamentReward(id,1);
 assert.equal(profile.eventRewards.length,2);assert.equal(profile.permanentEventRewards.length,0);assert.equal(profile.timedSkins.length,2);assert(profile.timedSkins.every(s=>s.expiresAt>=before+604800000&&s.expiresAt<=Date.now()+604800000));
 const expiry=profile.timedSkins[0].expiresAt;profile=await account.grantTournamentReward(id,1);assert.equal(profile.timedSkins[0].expiresAt,expiry);
 await account.expire();profile=await account.profileNow();assert.equal(profile.eventRewards.length,0);assert.equal(profile.timedSkins.length,0);
 profile=await account.grantTournamentReward(id,1);assert.equal(profile.eventRewards.length,0,'reclaim must not renew expired rewards');
 profile=await account.grantTournamentReward(crypto.randomUUID(),1);assert.equal(profile.eventRewards.length,2);assert.equal(profile.permanentEventRewards.length,2);assert.equal(profile.timedSkins.length,0);
 console.log('PASS: 19 distinct valid knife meshes, matching SVG previews, 7-day gun/knife rewards, idempotent claims, expired ownership removed, permanent tournament rewards preserved.');
}finally{await mf.dispose()}
