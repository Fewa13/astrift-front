import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
class Target{
 constructor(tagName='DIV'){this.tagName=tagName;this.children=[];this.listeners={};this.dataset={};this.captured=new Set();this.style={setProperty(k,v){this[k]=v}};this.offsetWidth=100;this.offsetLeft=this.offsetTop=0;this.classList={values:new Set(),add(k){this.values.add(k)},remove(k){this.values.delete(k)},contains(k){return this.values.has(k)},toggle(k,on){on?this.add(k):this.remove(k)}};}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}
 emit(type,fields={}){const e={pointerId:1,clientX:50,clientY:50,pointerType:'touch',target:this,preventDefault(){},stopImmediatePropagation(){},...fields};this['on'+type]?.(e);for(const fn of this.listeners[type]||[])fn(e)}
 append(child){this.children.push(child)}querySelector(){return this.label??=new Target('SPAN')}
 getBoundingClientRect(){return {left:0,top:0,width:100,height:100}}getClientRects(){return [this.getBoundingClientRect()]}
 contains(target){return target===this||this.children.includes(target)}setAttribute(){}
 setPointerCapture(id){this.captured.add(id)}hasPointerCapture(id){return this.captured.has(id)}releasePointerCapture(id){this.captured.delete(id);this.emit('lostpointercapture',{pointerId:id})}
}
for(const english of [true,false]){
 const body=new Target(),doc=new Target(),win=new Target(),moves=[],turns=[],starts=[],ends=[];let fixed=true;
 doc.body=body;doc.createElement=tag=>new Target(tag.toUpperCase());
 const c=vm.createContext({document:doc,window:win,innerWidth:844,fixedMovement:()=>fixed,fixedAttack:()=>false,uiCoord:v=>v,queueMicrotask,joystickInput:(dx,dy,r)=>({x:dx/r,y:dy/r,sprint:dy<-.85*r}),touchIconSVG:()=>'',move:(...v)=>moves.push(v),turn:(...v)=>turns.push(v),actions:Object.fromEntries(['Fire','Jump','Bag'].map(id=>[id,{start:()=>starts.push(id),end:()=>ends.push(id)}])),canMove:()=>true,en:()=>english});
 for(const file of ['floating-joystick.js','ancient-touch-controls.js'])vm.runInContext(fs.readFileSync('public/'+file,'utf8').replace(/^import .*\n/gm,'').replaceAll('export function ','function '),c);
 const controls=vm.runInContext('createAncientTouchControls({en,move,turn,actions,canMove})',c),[stick,fire,jump]=controls.root.children;
 stick.emit('pointerdown',{pointerId:1,clientY:10});const moving=moves.at(-1);stick.emit('pointerdown',{pointerId:2});stick.emit('pointerup',{pointerId:2});assert.equal(moves.at(-1),moving,'Secondary stick touch cannot hijack or release movement');
 fire.emit('pointerdown',{pointerId:3});fire.emit('pointerdown',{pointerId:4});fire.emit('pointerup',{pointerId:4});assert.deepEqual(starts,['Fire']);assert.equal(ends.length,0);
 fire.emit('pointermove',{pointerId:3,clientX:70});jump.emit('pointerdown',{pointerId:5});assert.equal(turns.length,1);assert.deepEqual(starts,['Fire','Jump']);assert.equal(moves.at(-1),moving,'Move, attack, aim and jump remain independent');
 fire.emit('pointercancel',{pointerId:4});assert.equal(ends.length,0);fire.emit('pointerup',{pointerId:3});assert.deepEqual(ends,['Fire']);
 fixed=false;win.emit('astrift:movement-mode-changed');assert.deepEqual(moves.at(-1),[0,0,false]);assert(!stick.hasPointerCapture(1));assert(!jump.hasPointerCapture(5));
 const canvas=new Target('CANVAS');Object.assign(c,{canvas,paused:false,yaw:0,pitch:0,ancientSensitivity:()=>1});
 const line=fs.readFileSync('public/ancient-client.js','utf8').split('\n').find(l=>l.startsWith('if(mobile){createAncientTouchControls'));
 vm.runInContext('{'+line.slice(line.indexOf('let lastTouch'),-1)+'}',c);
 canvas.emit('pointerdown',{pointerId:7});canvas.emit('pointerdown',{pointerId:8});canvas.emit('pointerup',{pointerId:8});canvas.emit('pointermove',{pointerId:7,clientX:60});assert.equal(c.yaw,-.04,'Secondary look touch cannot steal/release primary aim');canvas.emit('pointercancel',{pointerId:7});canvas.emit('pointermove',{pointerId:7,clientX:80});assert.equal(c.yaw,-.04);
 doc.emit('pointerdown',{pointerId:9,target:canvas,clientX:80});assert(stick.hasPointerCapture(9));doc.emit('pointerdown',{pointerId:10,target:canvas,clientX:90});assert(!stick.hasPointerCapture(10));win.emit('astrift:movement-mode-changed');assert(!stick.hasPointerCapture(9));assert.deepEqual(moves.at(-1),[0,0,false]);
}
console.log('PASS touch ownership, simultaneous move/aim/attack/jump, secondary up/cancel, floating mode switch and look reset (both languages)');
