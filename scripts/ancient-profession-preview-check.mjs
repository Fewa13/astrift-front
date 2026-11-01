// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
class Node{constructor(tag){this.tag=tag;this.children=[];this.classList={toggle(){}};this.isConnected=true}append(n){this.children.push(n)}replaceChildren(){this.children=[]}setAttribute(){} }
globalThis.document={createElement:tag=>new Node(tag),getElementById:()=>new Node('div')};
const {createAncientSkillUI}=await import('../public/ancient-skill-ui.js');
let p={level:30,skills:{},materials:{'supply:transfer':1}},english=true,calls=[],release;
const ui=createAncientSkillUI({getProfile:()=>p,getPlayer:()=>null,en:()=>english,cast(){},slot(){},action:async(k,d)=>{calls.push([k,d]);await new Promise(r=>release=r);p.profession=d.job;p.materials['supply:transfer']--}}),card=new Node('section');ui.render(card);
const nodes=()=>{const all=[];function walk(n){all.push(n);n.children.forEach(walk)}walk(card);return all},find=text=>nodes().find(n=>n.tag==='button'&&n.textContent===text),job=name=>nodes().find(n=>n.tag==='button'&&n.textContent.endsWith(name));
job('Frost Mage').onclick();assert.equal(calls.length,0);assert(find('Choose profession'));assert(!nodes().some(n=>n.tag==='button'&&n.textContent.startsWith('Train to')));
job('Lightning Mage').onclick();assert.equal(calls.length,0);const confirm=find('Choose profession'),pending=confirm.onclick();confirm.onclick();assert.equal(calls.length,1);assert.equal(calls[0][1].job,'lightning');release();await pending;assert(find('Current profession').disabled);
p.materials['supply:transfer']=1;job('Warrior').onclick();assert.equal(calls.length,1);assert(find('Change profession'));english=false;card.replaceChildren();ui.render(card);assert(find('更改职业'));p.materials['supply:transfer']=0;card.replaceChildren();ui.render(card);assert(find('更改职业').disabled);job('冰雪法师').onclick();assert.equal(calls.length,1);assert(find('更改职业').disabled);
console.log('PASS: preview never changes profession, explicit confirm, double-click guard, retained preview, no-book browsing and bilingual labels.');
