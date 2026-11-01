import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {BOMB_MAP_SCALE,bombSitesFor} from '../public/bomb-rules.js';
import {createObjectiveNavigator} from '../public/objective-world.js';

const source=fs.readFileSync(new URL('../public/game.js',import.meta.url),'utf8');
const start=source.indexOf("beginMap('bomb');"),end=source.indexOf("finishMap('bomb');",start);
assert.ok(start>=0&&end>start);
const colliders=[];
const context={
  mapBuildColliders:colliders,
  beginMap(){},surface(){},
  detailBox(){return {userData:{}}},
  box(x,z,w,h,d){const mesh={userData:{bounds:{minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,maxY:h}}};colliders.push(mesh);return mesh},
};
vm.runInNewContext(`${source.slice(start,end)}\nglobalThis.coverCount=bombCoverCount`,context);
assert.ok(context.coverCount>=35,`expected dense new cover, got ${context.coverCount}`);
const blocked=(x,z)=>colliders.some(({userData:{bounds:b}})=>b&&(b.minY===undefined||b.minY<1.9)&&x/BOMB_MAP_SCALE>b.minX-.5/BOMB_MAP_SCALE&&x/BOMB_MAP_SCALE<b.maxX+.5/BOMB_MAP_SCALE&&z/BOMB_MAP_SCALE>b.minZ-.5/BOMB_MAP_SCALE&&z/BOMB_MAP_SCALE<b.maxZ+.5/BOMB_MAP_SCALE);
for(const attackTeam of [0,1])for(const [name,point] of Object.entries(bombSitesFor(attackTeam)))assert.equal(blocked(point[0],point[2]),false,`${name} site must remain open for attack team ${attackTeam}`);
for(const z of [-180,-168,168,180])for(const x of [-32,0,32])assert.equal(blocked(x*BOMB_MAP_SCALE,z*BOMB_MAP_SCALE),false,`spawn ${x},${z} must remain open`);
const navigator=createObjectiveNavigator(blocked,true,208*BOMB_MAP_SCALE);
for(const attackTeam of [0,1])for(const [name,goal] of Object.entries(bombSitesFor(attackTeam))){
  const z=attackTeam===0?180:-180;
  let position=[0,0,z*BOMB_MAP_SCALE];
  for(let step=0;step<400&&Math.hypot(position[0]-goal[0],position[2]-goal[2])>4;step++){
    const direction=navigator.direction(`${z}:${name}`,position,goal,step*16);
    position=[position[0]+direction[0]*1.5,0,position[2]+direction[1]*1.5];
    assert.equal(blocked(position[0],position[2]),false,`AI route ${z} to ${name} enters cover`);
  }
  assert.ok(Math.hypot(position[0]-goal[0],position[2]-goal[2])<=4,`AI route ${z} to ${name} reaches site`);
}
console.log(`PASS compact bomb layout: ${context.coverCount} extra covers, clear sites and spawns.`);
