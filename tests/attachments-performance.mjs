import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {organizeAttachments,migrateBuilds,ATTACHMENT_MOVES} from '../public/attachment-layout.js';
import {batchStaticScene,createEffects,disposeObject} from '../public/render-performance.js';
const THREE=await import(process.env.ASTRIFT_THREE_TEST||'/tmp/astrift-three-test.mjs');
const game=fs.readFileSync(new URL('../public/game.js',import.meta.url),'utf8');
const sandbox={};vm.runInNewContext(game.slice(game.indexOf('const MODS='),game.indexOf('organizeAttachments(MODS);'))+';globalThis.catalog=MODS',sandbox);
const catalog=sandbox.catalog;
const allIds=c=>Object.entries(c).flatMap(([weapon,slots])=>Object.values(slots).flatMap(parts=>Object.keys(parts).map(id=>weapon+'/'+id))).sort();
const original=allIds(catalog);organizeAttachments(catalog);
assert.deepEqual(allIds(catalog),original,'no lost or duplicated attachments');
for(const [weapon,moves] of Object.entries(ATTACHMENT_MOVES)){
  for(const [id,slot] of Object.entries(moves)){
    assert.ok(catalog[weapon][slot][id]);assert.ok(!catalog[weapon].战术扩展?.[id]);
    const migrated=migrateBuilds({[weapon]:{战术扩展:id}},catalog);
    assert.equal(migrated.builds[weapon][slot],id);
    assert.ok(!migrated.builds[weapon].战术扩展);
  }
}
const migrated=migrateBuilds({frost:{瞄具:'scope',战术扩展:'dualScope'},redline:{战术扩展:'hollow'},meteor:{操控:'dual',战术扩展:'remoteFuse'}},catalog);
assert.equal(migrated.builds.frost.瞄具,'scope');assert.equal(migrated.conflicts.length,1);
assert.equal(migrated.builds.redline.弹药,'hollow');
assert.equal(migrated.builds.meteor.装填与携行,'dual');assert.equal(migrated.builds.meteor.引信,'remoteFuse');
assert.deepEqual(migrateBuilds(migrated.builds,catalog).builds,migrated.builds,'migration is idempotent');
organizeAttachments(catalog);assert.deepEqual(allIds(catalog),original,'catalog normalization is idempotent');
console.log('PASS attachment catalog:',original.length,'parts preserved; physical slots, migration, conflicts, repeat loads');

const scene=new THREE.Scene(),obstacles=[];
for(let i=0;i<12;i++){const mesh=new THREE.Mesh(new THREE.BoxGeometry(2,1+i*.1,3),new THREE.MeshStandardMaterial({color:i%2?0xff1122:0x1122ff}));mesh.position.set(i*3,1,0);scene.add(mesh);obstacles.push(mesh);}
scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster(new THREE.Vector3(0,1,10),new THREE.Vector3(0,0,-1));
const before=ray.intersectObjects(obstacles)[0];const batched=batchStaticScene(THREE,scene);
const after=ray.intersectObjects(obstacles)[0];
assert.equal(after.object,before.object);assert.equal(after.distance,before.distance);assert.deepEqual(batched,{before:12,after:1});
const effects=createEffects(THREE,scene);
for(let i=0;i<200;i++)effects.trace(new THREE.Vector3(),new THREE.Vector3(0,1,5));
assert.equal(effects.count,64);effects.update(1);assert.equal(effects.count,0);
effects.trace(new THREE.Vector3(),new THREE.Vector3(0,1,5));effects.clear();assert.equal(effects.count,0);
const group=new THREE.Group(),geo=new THREE.BoxGeometry(),mat=new THREE.MeshBasicMaterial();let disposed=0;geo.addEventListener('dispose',()=>disposed++);mat.addEventListener('dispose',()=>disposed++);
group.add(new THREE.Mesh(geo,mat),new THREE.Mesh(geo,mat));scene.add(group);disposeObject(group);assert.equal(disposed,2);assert.equal(group.parent,null);
console.log('PASS render: 12→1 static draw batch, identical raycast, 64-tracer cap/reuse, resource cleanup');

// Execute the real shooting function: renderer batching must not break damage or cover.
const shootSource=game.slice(game.indexOf('function shoot(){'),game.indexOf('\nfunction fireRocket('));
function combatTest(withWall){
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera();camera.position.set(0,1.7,0);camera.updateMatrixWorld(true);
  const enemy=new THREE.Group(),body=new THREE.Mesh(new THREE.BoxGeometry(.78,.82,.42),new THREE.MeshBasicMaterial());body.position.y=1.7;body.userData.hitZone='body';enemy.add(body);enemy.position.z=-10;enemy.userData={hp:100,team:1};scene.add(enemy);
  const walls=[];
  if(withWall){for(const x of [0,8]){const wall=new THREE.Mesh(new THREE.BoxGeometry(3,3,1),new THREE.MeshBasicMaterial());wall.position.set(x,1.5,-5);wall.userData.bounds={minX:x-1.5,maxX:x+1.5,minZ:-5.5,maxZ:-4.5,maxY:3};walls.push(wall);scene.add(wall);}batchStaticScene(THREE,scene);}
  scene.updateMatrixWorld(true);
  const context={THREE,performance:{now:()=>10000},matchFinished:false,lastShot:0,reloading:false,cycling:false,hp:100,weaponKey:'redline',ammo:30,weaponRuntime:[{}],activeWeaponSlot:0,weaponDef:{interval:100,recoil:55,spread:0,drop:0,range:72,bulletSpeed:720,damage:{head:45,body:30,arm:15},armorDamage:1},adsMouse:false,adsKey:false,keys:{},grounded:true,prone:false,yaw:0,camera,bots:[enemy],remotes:new Map(),obstacles:walls,playerTeam:0,shotFeedback(){},tracer(){},hitmark(){},showDamageNumber(){},updateHud(){},botDown(){},feed(){}};
  context.duelBlocked=()=>false;
  vm.runInNewContext(shootSource+';shoot();',context);
  return enemy.userData.hp;
}
assert.equal(combatTest(false),70,'actual shot damages the enemy');
assert.equal(combatTest(true),100,'batched wall still blocks damage');
console.log('PASS actual shoot(): enemy takes 30 damage; unchanged exact wall collider blocks it');
