// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {updateExtractionLoot} from '../public/extraction-ai.js';
import {item} from '../public/extraction-inventory.js';
class V {constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z})}copy(v){Object.assign(this,v);return this}clone(){return new V(this.x,this.y,this.z)}setY(y){this.y=y;return this}distanceToSquared(v){return (this.x-v.x)**2+(this.y-v.y)**2+(this.z-v.z)**2}distanceTo(v){return Math.sqrt(this.distanceToSquared(v))}}
const bot={visible:true,position:new V(),rotation:{y:0},userData:{extractionReserve:180,ammoLeft:30,extractionBag:[],wander:new V(),raidStarted:0}};
const marker={items:[item('valuable',{type:'wire'})],mesh:{position:new V()},exit:false};
updateExtractionLoot(bot,[marker],1000,new V(10));assert.equal(marker.items.length,1,'Search takes time');
assert(updateExtractionLoot(bot,[marker],2300,new V(10)));assert.equal(marker.items.length,0);assert.equal(bot.userData.extractionBag[0].type,'wire');
bot.userData.lootGoal=null;bot.userData.ammoLeft=bot.userData.extractionReserve=0;bot.position=new V(10);updateExtractionLoot(bot,[],2400,new V(10));assert(!bot.visible);assert(bot.userData.extracted,'Empty ammo AI extracts');
const source=fs.readFileSync(new URL('../public/game.js',import.meta.url),'utf8'),start=source.indexOf('function botCanDiscover('),end=source.indexOf('\nfunction duelAwareness',start),discover=Function('hasLineOfSight','roomMode','aiDuelLevel',source.slice(start,end)+';return botCanDiscover;');
const guard={position:new V(),rotation:{y:0},userData:{}},target=(x,z)=>({kind:'player',position:new V(x,1.7,z)});
assert(discover(()=>true,'extraction','master')(guard,target(0,-10),1000));
assert(!discover(()=>true,'extraction','master')(guard,target(0,10),1000),'Cannot see behind');
assert(!discover(()=>true,'extraction','master')(guard,target(0,-80),1000),'Finite detection distance');
assert(!discover(()=>false,'extraction','master')(guard,target(0,-10),1000),'Solid walls block discovery');
console.log('PASS: timed AI looting, actual container removal, finite-ammo extraction, facing/range/LOS perception');
