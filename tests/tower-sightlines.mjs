import assert from 'node:assert/strict';
import * as T from 'three';
import {towerMap,TOWER_LIMIT,TOWER_HEIGHT} from '../public/tower-survival.js';
const world=towerMap(T);world.group.updateMatrixWorld(true);
for(const [x,z] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
 const eye=new T.Vector3(x*TOWER_LIMIT,TOWER_HEIGHT+1.7,z*TOWER_LIMIT);
 for(const y of [.3,1,1.7]){
  const target=new T.Vector3(x*6.6,y,z*6.6),direction=target.clone().sub(eye),distance=direction.length();
  assert(Math.asin(-direction.y/distance)<1.53,'Survival pitch must reach the attacker');
  const ray=new T.Raycaster(eye,direction.normalize(),0,distance-.01);
  assert.equal(ray.intersectObjects(world.group.children,true).length,0,`Deck must not hide attacker ${x},${z},${y}`);
  assert.equal(ray.intersectObjects(world.colliders,true).length,0,'Bullets must clear the actual tower');
 }
}
// The tower still blocks shooting through it from the middle of the platform.
const eye=new T.Vector3(0,11.7,0),target=new T.Vector3(6.6,1,0),delta=target.clone().sub(eye);
assert(new T.Raycaster(eye,delta.clone().normalize(),0,delta.length()).intersectObjects(world.colliders,true).length>0);
console.log('PASS tower edge sightlines: four sides/corners, all body heights; no wall bypass');
