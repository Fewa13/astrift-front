import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {build} from 'esbuild';
import {setCommunityMap,communityBlocked,communityLineWalk} from '../public/ancient-community.js';
const {outputFiles}=await build({entryPoints:['src/ancient-unit-spacing.ts'],bundle:true,write:false,format:'esm'}),{spaceAncientUnits}=await import('data:text/javascript;base64,'+Buffer.from(outputFiles[0].text).toString('base64'));
const map='community:818181';setCommunityMap({id:818181,tier:3,boundary:[{x:-40,z:-40},{x:40,z:-40},{x:40,z:40},{x:-40,z:40}],spawn:{x:-10,z:0},spawns:[],objects:[{id:'wall',model:'box',x:0,y:0,z:0,w:.2,h:5,d:30,rotation:0,solid:true,components:{collision:{mode:'static',layers:['monster']}}}]});
const source=fs.readFileSync('src/ancient-world.ts','utf8'),at=source.indexOf('const separateUnits=()=>spaceAncientUnits'),start=source.indexOf('(body,x,z)=>',at),end=source.indexOf('\n  separateUnits();',start),callback=source.slice(start,end).trim().slice(0,-2);
const context=vm.createContext({communityId:()=>true,communityBlocked,communityLineWalk,map,blocked:()=>false,clear:()=>true}),canPlace=vm.runInContext('('+callback+')',context),body={position:{x:-2,z:0},floor:0,radius:.65};
assert.equal(canPlace(body,2,0),false,'Unit separation cannot pass through monster-only walls');assert.equal(canPlace(body,-3,0),true);
const bodies=Array.from({length:15},()=>({position:{x:-1,z:0},floor:0,radius:.65}));spaceAncientUnits(bodies,canPlace);assert(bodies.every(b=>b.position.x<0),'Crowded monsters stay on their side of the wall');
console.log('PASS actual spacing callback: monster collision layer and swept path prevent crowded units crossing thin monster-only walls');
