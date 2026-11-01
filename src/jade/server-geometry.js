// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {Plane,Vector3} from 'three';
import {createRockGeometry,fragmentGeometry,splitRockGeometry,splitShares,measureGeometry,disposeSplit} from './rock-geometry.js';
export function assayJadeStone(a,plane,paths=[],holes=[]){
 const original=createRockGeometry(a);let parent,split;
 try{
  const total=measureGeometry(original,a);
  if(!plane)return {total};
  parent=paths.length?fragmentGeometry(original,paths):original;
  split=splitRockGeometry(parent,new Plane(new Vector3(...plane.normal),plane.constant));
  const shares=splitShares(split,a,holes),valid=shares.massShares.every(n=>n>.012)&&split.ring.length>=8&&split.positive.getAttribute('position').count>60&&split.negative.getAttribute('position').count>60;
  return {total,...shares,valid};
 }finally{if(split)disposeSplit(split);if(parent&&parent!==original)parent.dispose();original.dispose();}
}
