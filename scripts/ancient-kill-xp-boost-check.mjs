// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
import {build} from 'esbuild';
import {ancientMonsterXP,ancientCoinReward,xpNeeded} from '../public/ancient-rules.js';
import {BLIGHT_CRYSTAL_XP} from '../public/ancient-blight.js';
const db=new DatabaseSync(':memory:'),sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {toArray:()=>rows}}},sockets=[];
const ctx={storage:{sql,setAlarm:async()=>{},transactionSync:f=>f()},getWebSockets:()=>sockets};
const out=await build({entryPoints:['src/ancient-world.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['cloudflare:workers']}),module={exports:{}};
vm.runInNewContext(out.outputFiles[0].text,{module,exports:module.exports,Date,crypto,Math,structuredClone,AbortController,require:()=>({DurableObject:class{constructor(ctx){this.ctx=ctx}}})});
const server=new module.exports.AncientWorld(ctx,{}),p=server.read('tester');p.level=200;server.save('tester',p);
let actor={name:'tester',connectionId:'qa',map:'tribe',tribeLayout:2,x:0,y:1.7,z:50,hp:1e8,maxHp:1e8,seen:Date.now(),weapon:p.weapons[0],deadAt:0};
const ws={readyState:1,messages:[],deserializeAttachment:()=>actor,serializeAttachment:a=>actor=a,send:s=>ws.messages.push(JSON.parse(s))};sockets.push(ws);
for(const boosted of [false,true])for(const [kind,level,temporary] of [['grox',1],['grox',25],['chief',22],['lord',25],['rootwarden',45],['crystal_metal',65],['emptyking',100],['blight_lord',130],['immaculate_judge',150],['grox',151],['chief',175],['immaculate_judge',200],['grox',200,true],['grox',40,true]]){
 const profile=server.read('tester');profile.level=1000;profile.xp=0;profile.coins=0;profile.boosts={experience:boosted?Date.now()+60000:0};server.save('tester',profile);ws.messages=[];
 const monster={id:kind+level,kind,level,temporary,hp:100,maxHp:100,x:0,z:55,homeX:0,homeZ:55,action:'idle',target:'',region:0};
server.damageMonster(ws,actor,monster,100);const base=Math.floor(ancientMonsterXP(kind,level)*(temporary?.25:1)),unboosted=level>150?Math.floor(Math.floor(base*120/100)*115/100):Math.floor(base*120/100),expected=boosted?Math.floor(unboosted*1.5):unboosted,after=server.read('tester');
 assert.equal(after.xp,expected,kind+' saved XP');assert.equal(after.coins,ancientCoinReward(base),kind+' coins unchanged');assert.equal(ws.messages.find(d=>d.type==='kill').xp,expected,kind+' displayed XP');server.damageMonster(ws,actor,monster,100);assert.equal(server.read('tester').xp,expected,'no duplicate rewards');
}
assert.equal(xpNeeded(25),125000);assert.equal(BLIGHT_CRYSTAL_XP,10000);db.close();
console.log('PASS: real kill settlement +20% baseline and additional +15% above monster Lv150 across mob/elite/boss/maps/temporary summons; XP potion stacks once; saved and displayed XP agree; coins unchanged; no duplicate rewards; upgrade curve and fixed crystals unchanged.');
