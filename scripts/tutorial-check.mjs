// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as rules from '../public/tutorial-state.js';
import * as THREE from 'three';
import {buildTutorialWorld} from '../public/tutorial-world.js';
const device={done:true},alice=rules.tutorialRecord('Alice');
assert.equal(rules.needsTutorial(null,alice,'Alice'),true);
assert.equal(rules.needsTutorial(device,null,''),false);
assert.equal(rules.needsTutorial(device,null,'Bob'),true);
assert.equal(rules.needsTutorial(device,alice,'ALICE'),false);
assert.equal(rules.needsTutorial(device,alice,'Bob'),true);
assert.equal(rules.tutorialRecord('Bob',true).skipped,true);
const initial={x:0,z:0,targetHp:100,aim:0,slot:0,weapon:'redline',phaseActive:0,sliding:false,throwCharges:2,tacticalReady:0};
const actions={move:{x:3},attack:{targetHp:80},aim:{aim:1},switch:{slot:1,weapon:'smg'},phase:{phaseActive:.1,z:-5},slide:{sliding:true},throwable:{throwCharges:1},tactical:{tacticalReady:22000}};
for(const step of rules.PRACTICAL_STEPS){assert.equal(Boolean(rules.practicalComplete(step,initial,initial)),false,step+' must require an action');assert.equal(Boolean(rules.practicalComplete(step,{...initial,...actions[step]},initial)),true,step)}
assert.equal(rules.practicalComplete('switch',{...initial,slot:1},initial),false);
const world=buildTutorialWorld(THREE);assert.equal(world.group.visible,false);assert.ok(world.colliders.length>=6);assert.ok(!world.colliders.some(m=>m.userData.bounds.minX<=0&&m.userData.bounds.maxX>=0&&m.userData.bounds.minZ<=-6&&m.userData.bounds.maxZ>=-6&&m.userData.bounds.minY<1.7));
// Exercise the real UI controller against a minimal DOM and game adapter.
class Element{constructor(tag){this.tagName=tag;this.children=[];this.dataset={};this.hidden=false;this.attributes={};this.textContent='';const classes=new Set();this.classList={add:(...names)=>names.forEach(n=>classes.add(n)),remove:(...names)=>names.forEach(n=>classes.delete(n)),contains:n=>classes.has(n)}}append(...nodes){this.children.push(...nodes);for(const n of nodes)n.parentElement=this}replaceChildren(){this.children=[]}setAttribute(k,v){this.attributes[k]=v}}
const body=new Element('body'),head=new Element('head'),menu=new Element('div'),settings=new Element('button'),root=new Element('html'),entry=new Element('section'),auth=new Element('section');entry.id='worldEntry';auth.id='accountDialog';auth.hidden=true;body.append(entry,auth);settings.id='openKeybinds';menu.append(settings);body.append(menu);
const find=(node,id)=>node.id===id?node:node.children.map(n=>find(n,id)).find(Boolean);
const storage=new Map(),events={},queue=[];let language='en',owner=null,playing=false,state={...initial},opened='',stops=0;
const window={addEventListener:(name,fn)=>{(events[name]??=[]).push(fn)}};
const context={...rules,document:{head,body,documentElement:root,createElement:tag=>new Element(tag),getElementById:id=>find(body,id)},window,localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},getLanguage:()=>language,setLanguage:value=>{language=value;for(const fn of events['astrift:language-changed']||[])fn()},accountSession:()=>owner?{name:owner}:null,queueMicrotask:fn=>queue.push(fn),URL,Date};
let source=fs.readFileSync(new URL('../public/tutorial.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace('export function initTutorial','function initTutorial').replace('import.meta.url',JSON.stringify('http://localhost/tutorial.js'));
vm.createContext(context);vm.runInContext(source+'\nthis.initTutorial=initTutorial;',context);
const api={mobile:false,key:a=>a,playing:()=>playing,paused:()=>false,start:()=>{playing=true;state={...initial}},stop:()=>{playing=false;stops++},prepare:()=>{},state:()=>({...state}),closePanels:()=>{},open:id=>{opened=id},playSolo:()=>{playing=true}};
const client=context.initTutorial(api);queue.shift()();
const panel=find(body,'tutorialPanel'),hud=find(body,'tutorialHud');
assert.equal(panel.hidden,true,'World selection must not launch the FPS tutorial');entry.hidden=true;root.dataset.entryWorld='ancient';owner='AncientNewAccount';events['astrift:account-changed'][0]();client.update(2000);assert.equal(panel.hidden,true,'Ancient login never triggers FPS onboarding');assert.equal(storage.size,0,'Ancient entry must not mark the FPS tutorial completed');owner=null;root.dataset.entryWorld='main';events['astrift:entry-world-changed'][0]();assert.equal(panel.hidden,true,'Main guests must authenticate before onboarding');owner='MainNewAccount';events['astrift:account-changed'][0]();
const button=(node,label)=>{const b=node.children.find(n=>n.tagName==='button'&&n.textContent===label);assert.ok(b,'button '+label);b.onclick()};
assert.equal(panel.hidden,false);assert.equal(language,'en');button(panel.children.find(n=>n.className==='tutorialLanguages'),'中文');assert.equal(language,'zh');button(panel,'开始新手教程');assert.equal(playing,true);
let now=0;for(const step of rules.PRACTICAL_STEPS){state={...state,...actions[step]};client.update(now+=1000);client.update(now+=1000)}
assert.equal(playing,false);assert.equal(hud.hidden,true);assert.equal(panel.hidden,false);assert.equal(stops,1);
button(panel,'打开看看');assert.equal(opened,'openArmory');button(body,'返回教程');
for(let i=0;i<9;i++)button(panel,'下一步');button(panel,'完成教程');assert.equal(JSON.parse(storage.get(rules.DEVICE_TUTORIAL_KEY)).done,true);
owner='NewAccount';events['astrift:account-changed'][0]();assert.equal(language,'en');button(panel,'Skip tutorial');assert.equal(JSON.parse(storage.get(rules.ACCOUNT_TUTORIAL_KEY)).accounts.newaccount.done,true);
const before=storage.get(rules.ACCOUNT_TUTORIAL_KEY);find(body,'openTutorial').onclick();button(panel,'Skip tutorial');assert.equal(storage.get(rules.ACCOUNT_TUTORIAL_KEY),before,'replaying must not overwrite completion');
const game=fs.readFileSync(new URL('../public/game.js',import.meta.url),'utf8');assert.match(game,/function saveCurrentMatch\(\)\{\s*if\([^\n]*roomMode==='tutorial'/);assert.match(game,/function saveBuilds\(\)\{if\([^;]*roomMode==="tutorial"/);assert.match(game,/if\(roomMode!=='tutorial'\)localStorage.setItem\(WEAPON_SLOT_KEY/);
assert.match(fs.readFileSync(new URL('../public/i18n.js',import.meta.url),'utf8'),/let language='en'/);assert.equal(JSON.parse(fs.readFileSync(new URL('../crazygames/config.json',import.meta.url))).defaultLanguage,'en');
auth.hidden=false;owner='AnotherNewAccount';events['astrift:account-changed'][0]();assert.equal(panel.hidden,true,'Account dialog and tutorial cannot overlap');auth.hidden=true;client.update(100000);assert.equal(panel.hidden,false,'Main lobby resumes onboarding after auth closes');root.dataset.entryWorld='ancient';events['astrift:entry-world-changed'][0]();assert.equal(panel.hidden,true,'Switching to Ancient dismisses an already-open tutorial');
console.log('Tutorial checks passed: world selection/Ancient suppression, auth dialog isolation, main lobby onboarding, first device/account, eight actual actions, bilingual UI, skip/replay and save isolation.');
