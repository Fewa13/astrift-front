// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {createMailboxView} from '../public/mailbox-view.js';
class Element{constructor(tag){this.tag=tag;this.children=[];this.isConnected=true;this.scrollTop=0;this.style={};this.classList={add:()=>{}}}append(...n){this.children.push(...n)}setAttribute(){}replaceChildren(){this.children=[]}querySelector(selector){return all(this).find(n=>n.className?.split(' ').includes(selector.slice(1)))}}
const all=n=>[n,...n.children.flatMap(all)];const head=new Element('head');globalThis.document={head,getElementById:id=>all(head).find(n=>n.id===id),createElement:tag=>new Element(tag)};
globalThis.window={dispatchEvent(){}};globalThis.CustomEvent=class{constructor(type,init){this.type=type;this.detail=init.detail}};
let backCalls=0,claimCalls=0;const root=new Element('main'),state={messages:[{id:'choice',title:'Gift',body:'Choose books',rewards:[{key:'skill-choice',quantity:2}]}],bookChoices:[{id:'warrior',en:'Warrior',skills:[{id:'power',en:'Power'}]},{id:'lightning',en:'Lightning',skills:[{id:'chain',en:'Chain'}]}]};
const ui=createMailboxView({en:()=>true,onBack:()=>backCalls++,load:async()=>structuredClone(state),claim:async()=>{claimCalls++;throw Error('do not claim in cancel test')}});
const buttons=()=>all(root).filter(n=>n.tag==='button'),click=text=>{const b=buttons().find(n=>n.textContent===text);assert(b,'Missing '+text);assert(!b.disabled,text+' disabled');b.onclick()};
ui.render(root);await ui.poll();await new Promise(r=>setImmediate(r));
assert(buttons().some(n=>n.textContent==='Back'));click('Claim');assert(buttons().some(n=>n.textContent==='Back'));click('Warrior');click('Power');assert(buttons().some(n=>n.textContent==='Back'));click('Lightning');click('Chain');assert(buttons().some(n=>n.textContent==='Confirm claim'&&!n.disabled));click('Back');assert.equal(backCalls,0);assert.equal(claimCalls,0);assert(buttons().some(n=>n.textContent==='Claim'));assert(!buttons().some(n=>n.textContent==='Confirm claim'));
click('Claim');assert(all(root).some(n=>n.textContent==='Choose skill books · 0 / 2'));await ui.poll();assert(buttons().some(n=>n.textContent==='Back'));click('Back');click('Back');assert.equal(backCalls,1);assert.equal(claimCalls,0);
assert(head.children[0].textContent.includes('position:sticky;top:0'));console.log('PASS: Back remains through profession changes, book choices and refresh; first Back cancels without claiming, second returns to caller; sticky toolbar independent of article scroll.');
