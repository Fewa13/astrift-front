// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
// One batched mesh per projectile, so the existing effect disposal owns it.
export function createMonsterProjectile(kind){
 const wooden=kind==='hunter',fire=/ember|fire|furnace/.test(kind),ice=/frost|water|ice/.test(kind),storm=/storm|sky|metal|sanctum/.test(kind),voidish=/acolyte|scribe|wraith|blight|thorn/.test(kind),color=kind==='sand_oracle'?0xefca82:wooden?0x9c8958:fire?0xffa35b:ice?0x9be5ff:storm?0x99baff:voidish?0xc58aff:0x90df9a;
 const geometry=wooden?new T.CylinderGeometry(.045,.025,2.4,6):fire?new T.IcosahedronGeometry(.24,1):ice?new T.OctahedronGeometry(.25,0):storm?new T.ConeGeometry(.14,.85,6):new T.IcosahedronGeometry(.19,1);
 if(ice)geometry.scale(.7,2,.7);return new T.Mesh(geometry,wooden?new T.MeshStandardMaterial({color}):new T.MeshBasicMaterial({color}));
}
