// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
class Element{constructor(tag){this.tag=tag;this.children=[];this.hidden=false;this.value=''}append(...items){this.children.push(...items)}setAttribute(){}replaceChildren(...items){this.children=items}}
const body=new Element('body'),saved=new Map();globalThis.document={body,createElement:t=>new Element(t)};globalThis.localStorage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)};
const {createAncientQuickbar,quickItems,QUICK_KEYS}=await import('../public/ancient-quickbar.js');
let p={potions:{minor:2},materials:{'supply:damage':1,'supply:transfer':1,'supply:book:warrior':1,'bossCard:lord':1,'skillbook:slash':2}},allowed=true,failed=false;
const calls=[],options={getProfile:()=>p,en:()=>false,account:()=> 'tester',canUse:()=>allowed,visible:()=>true,action:async(action,data)=>{calls.push([action,data]);if(failed)return;if(action==='usePotion')p.potions[data.id]--;if(action==='useSupply')p.materials['supply:'+data.id]--;if(action==='useBossCard')p.materials['bossCard:'+data.kind]--}};
const q=createAncientQuickbar(options);assert.equal(quickItems(p).length,4);assert(!quickItems(p).some(i=>i.key==='supply:transfer'||i.key.startsWith('skillbook:')));
const inventory=new Element('section');q.renderInventory(inventory);const selects=inventory.children[0].children[1].children.map(label=>label.children[0]);assert.equal(selects.length,6);selects[0].value='potion:minor';selects[0].onchange();selects[1].value='supply:damage';selects[1].onchange();selects[2].value='bossCard:lord';selects[2].onchange();
assert.equal(q.key('Digit1'),false);assert.equal(q.key('Digit5'),true);await new Promise(r=>setTimeout(r,0));assert.equal(p.potions.minor,1);assert.equal(body.children[0].children[0].children[3].textContent,'×1');
failed=true;q.key('Digit5');await new Promise(r=>setTimeout(r,0));assert.equal(p.potions.minor,1);assert(!body.children[0].children[0].disabled);failed=false;
q.key('Digit5');await new Promise(r=>setTimeout(r,0));assert.equal(p.potions.minor,0);assert(body.children[0].children[0].disabled);assert.equal(JSON.parse(saved.values().next().value)[0],'');
q.key('Digit6');q.key('Digit7');await new Promise(r=>setTimeout(r,0));assert.equal(calls.at(-2)[0],'useSupply');assert.equal(calls.at(-1)[0],'useBossCard');assert.equal(p.materials['bossCard:lord'],0);
allowed=false;const count=calls.length;q.key('Digit8');assert.equal(calls.length,count);assert.deepEqual(QUICK_KEYS,['Digit5','Digit6','Digit7','Digit8','Digit9','Digit0']);
assert.equal(saved.size,1);createAncientQuickbar({...options,account:()=> 'other'}).update();assert.equal(body.children[1].children[0].disabled,true,'Other account does not inherit bindings');
console.log('PASS: six key bindings; inventory assignment; item counts; potion/supply/card action routing; failed-use preservation; depletion clears saved binding; unusable state guard; account-isolated storage.');
