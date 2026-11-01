// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {transform} from 'esbuild';
import * as rules from '../public/ancient-rules.js';
import {skills,combat,quests} from './ancient-test-modules.mjs';
for(const kind of ['grox','hunter','mossling','thorn','sentinel'])for(const random of [0,.1,.5,.999])assert.deepEqual(skills.skillDrops(kind,()=>random),{},kind+' never drops books');
for(const kind of ['chief','lord','rootwarden','crystal_metal','crystal_wood','crystal_water','crystal_fire','crystal_earth'])for(const random of [0,.1,.5,.999]){const drop=skills.skillDrops(kind,()=>random);assert.equal(Object.keys(drop).length,1);assert.equal(Object.values(drop)[0],1);assert(Object.keys(drop)[0].startsWith('skillbook:'))}
const compiled=await transform(fs.readFileSync('src/ancient-world.ts','utf8'),{loader:'ts',format:'cjs'}),module={exports:{}},ctx={getWebSockets:()=>[],storage:{sql:{exec:()=>({toArray:()=>[]})}}};
vm.runInNewContext(compiled.code,{module,exports:module.exports,require:n=>n==='cloudflare:workers'?{DurableObject:class{constructor(ctx){this.ctx=ctx}}}:n.includes('ancient-quests')?quests:n.includes('ancient-skill-combat')?combat:n.includes('ancient-skills')?skills:rules,crypto,Date});
const server=new module.exports.AncientWorld(ctx,{}),monster={id:'far',kind:'grox',level:5,x:0,z:500,region:2,hp:500,maxHp:500,target:''},player={name:'attacker',x:0,z:50,y:1.7,hp:100},messages=[],ws={send:s=>messages.push(JSON.parse(s))};
assert.equal(rules.ancientTarget(monster,[{p:player}]),undefined);assert.equal(server.damageMonster(ws,player,monster,20),20);assert.equal(monster.target,player.name);assert.equal(rules.ancientTarget(monster,[{p:player}]).p.name,player.name);assert.equal(messages[0].type,'hit');
const source=fs.readFileSync('public/ancient-client.js','utf8'),buttons=[],navElement={hidden:true,replaceChildren(){buttons.length=0}},listeners={},input={active:true,paused:false,view:'pause',tab:'owned',profile:{},mobile:false,me:{hp:100},fire:true,aim:true,keys:new Set(['KeyW']),questUI:{dismiss(){},isOpen:()=>false},L:(zh,en)=>en,$:()=>navElement,button:(label,fn)=>buttons.push({label,fn}),unlock(){},renderPanel(){},lock(){},leave(){},canvas:{addEventListener(){}},document:{pointerLockElement:null,addEventListener:(n,fn)=>listeners[n]=fn},window:{addEventListener(){}},location:{assign(){}}};
vm.runInNewContext(source.split('\n').filter(l=>l.startsWith('function openMenu')||l.startsWith('function nav')||l.startsWith("document.addEventListener('keydown'")||l.startsWith("canvas.addEventListener('click'")).join('\n'),input);
input.nav();assert.deepEqual(buttons.map(b=>b.label),['Lobby','Weapons','Skills','Shop','Inventory']);assert.equal(navElement.hidden,false);
for(const [label,view]of [['Weapons','weapons'],['Skills','skills'],['Shop','shop'],['Inventory','bag']]){buttons.find(b=>b.label===label).fn();assert.equal(input.active,true);assert.equal(input.paused,true);assert.equal(input.view,view)}
input.paused=false;input.view='bag';listeners.pointerlockchange();assert.equal(input.paused,false,'Unlock does not open a pause card');assert.equal(input.fire,false);assert.equal(input.keys.size,0);
listeners.keydown({code:'Escape',preventDefault(){}});assert.equal(input.paused,false);assert.equal(input.view,'bag');
input.active=false;input.nav();assert(buttons.some(b=>b.label==='Enter'));assert(buttons.some(b=>b.label==='Worlds'));
assert(!source.includes('The shared world keeps running while panels are open.'));
console.log('PASS: persistent five-button in-map navigation; all panels usable without leaving; silent pointer unlock/Escape; lobby-only Enter/Worlds; damage immediately starts persistent pursuit; ordinary monsters drop no books; every boss drops exactly one');
