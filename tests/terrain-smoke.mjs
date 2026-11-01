import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../public/game.js',import.meta.url),'utf8');
const terrain=source.slice(source.indexOf('function coverAt('),source.indexOf('const sightRay='));
const thrown=source.slice(source.indexOf('function updateThrownItems('),source.indexOf('function updateThrowableHud('));
class Vector {
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}
  clone(){return new Vector(this.x,this.y,this.z)}
  addScaledVector(v,n){this.x+=v.x*n;this.y+=v.y*n;this.z+=v.z*n;return this}
  copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this}
}
const cover={userData:{bounds:{minX:-1,maxX:1,minZ:-1,maxZ:1,maxY:3.2}}};
const camera={position:new Vector(0,4.9,0)};
const bursts=[];
let currentTime=1000;
const context={obstacles:[cover],camera,playerEyeHeight:1.7,verticalVelocity:0,prone:false,yaw:0,performance:{now:()=>currentTime},thrownItems:[],smokeClouds:[],disposeObject(){},bursts,burstThrowable(item){bursts.push(item.mesh.position.clone())}};
vm.runInNewContext(`${terrain}\n${thrown}\nglobalThis.testApi={coverAt,blockedForPlayer,playerFloorHeight,updateThrownItems}`,context);
const {blockedForPlayer,playerFloorHeight,updateThrownItems}=context.testApi;
assert.equal(playerFloorHeight(0,0),4.9,'all cover tops are valid standing surfaces');
assert.equal(blockedForPlayer(0,0),false,'player on a tall cover is not treated as stuck in a wall');
camera.position.y=4.4;
assert.equal(blockedForPlayer(0,0),true,'a player below a tall cover cannot walk through its side');

const shopRoof={userData:{bounds:{minX:4,maxX:6,minZ:-2,maxZ:2,minY:6.64,maxY:7}}};
context.obstacles.push(shopRoof);
camera.position.y=1.7;
assert.equal(playerFloorHeight(5,0),1.7,'a shop interior stays at ground level below its roof');
assert.equal(blockedForPlayer(5,0),false,'a shop roof does not block walking through the interior');
camera.position.y=6.6;context.verticalVelocity=5;
playerFloorHeight(5,0);
assert.equal(context.verticalVelocity,0,'jumping into the shop roof stops upward movement');
assert.ok(camera.position.y<shopRoof.userData.bounds.minY,'the player remains below the roof after impact');
camera.position.y=8.7;
assert.equal(playerFloorHeight(5,0),8.7,'the roof remains a valid landing surface from above');

function smoke(position,velocity,life=6){const item={kind:'smoke',mesh:{position},velocity,fuse:0,life,local:true};context.thrownItems.push(item);return item}
smoke(new Vector(0,3.4,0),new Vector(0,-1,0));
updateThrownItems(.1);
assert.equal(context.bursts.length,1,'smoke detonates as soon as it lands on a tall cover');
assert.equal(context.bursts[0].y,3.33);
assert.equal(context.thrownItems.length,0);

const side=smoke(new Vector(2,1,0),new Vector(-20,0,0));
updateThrownItems(.1);
assert.equal(context.bursts.length,1,'hitting a cover side does not count as landing on its roof');
assert.equal(side.mesh.position.x,2,'side impact bounces instead of freezing horizontal movement');
assert.ok(side.velocity.x>0);

smoke(new Vector(5,.2,0),new Vector());
updateThrownItems(.1);
assert.equal(context.bursts.length,2,'smoke still deploys on the ground');
const grenade={kind:'grenade',mesh:{position:new Vector(8,.2,0)},velocity:new Vector(),fuse:4,burstAt:4000,life:6,local:true};
context.thrownItems.push(grenade);
currentTime=3999;
updateThrownItems(.1);
assert.ok(context.thrownItems.includes(grenade),'grenade remains live until its absolute four-second deadline');
currentTime=4000;
updateThrownItems(.1);
assert.ok(!context.thrownItems.includes(grenade),'grenade explodes on schedule even while resting on the ground');
assert.ok(context.bursts.some(point=>point.x===8),'grenade blast occurs at its current position');
console.log('PASS terrain: tall cover standing and smoke deployment on cover/ground');
