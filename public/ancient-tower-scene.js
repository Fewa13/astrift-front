// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
import {towerRunes,towerRuneAligned} from './ancient-dungeon.js';
// Only the combat deck is simulated. The 100-storey shaft is instanced scenery;
// moving its reference frame upward keeps existing movement physics precise.
export function buildTowerScene(scene){
 const world=new T.Group();world.name='Trial Tower';scene.add(world);const owned=[],materials={stone:new T.MeshStandardMaterial({color:0x263343,roughness:.78,metalness:.18}),edge:new T.MeshStandardMaterial({color:0x9d8053,roughness:.4,metalness:.72}),dark:new T.MeshStandardMaterial({color:0x101b2a,roughness:.8}),rune:new T.MeshBasicMaterial({color:0xe6c485})};
 const box=new T.BoxGeometry(1,1,1),cylinder=new T.CylinderGeometry(1,1,1,12),ring=new T.TorusGeometry(38,.22,4,48);owned.push(box,cylinder,ring);
 const batches=new Map();function part(geometry,mat,x,y,z,w,h,d,ry=0){const key=geometry.uuid+mat;let b=batches.get(key);if(!b){b={geometry,mat,items:[]};batches.set(key,b)}const o=new T.Object3D();o.position.set(x,y,z);o.scale.set(w,h,d);o.rotation.y=ry;o.updateMatrix();b.items.push(o.matrix.clone());}
 part(box,'stone',0,-.526,29,44,1,52);for(const x of [-22.3,22.3])part(box,'edge',x,.85,29,.6,1.7,52);for(const z of [2.7,55.3])part(box,'edge',0,.85,z,44,1.7,.6);
 for(let x=-20;x<=20;x+=4)for(let z=5;z<=53;z+=4){part(box,'dark',x,-.009,z,3.92,.012,3.92);if((x+z)%3===0)part(box,'edge',x,.008,z,.065,.012,3.6)}
 for(const x of [-25,25])for(const z of [7,18,29,40,51]){part(cylinder,'stone',x,7,z,.8,14,.8);part(cylinder,'edge',x,.2,z,1.3,.4,1.3);part(cylinder,'edge',x,13.7,z,1.3,.4,1.3);part(box,'rune',x,7,z,.085,5,.085)}
 for(const [key,b]of batches){const mesh=new T.InstancedMesh(b.geometry,materials[b.mat],b.items.length);b.items.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.computeBoundingSphere();world.add(mesh)}
 const shaft=new T.Group();world.add(shaft);const floors=new T.InstancedMesh(ring,materials.edge,100),o=new T.Object3D();for(let i=0;i<100;i++){o.position.set(0,i*8-.35,29);o.rotation.set(Math.PI/2,0,0);o.updateMatrix();floors.setMatrixAt(i,o.matrix)}floors.computeBoundingSphere();shaft.add(floors);
 const columns=new T.InstancedMesh(cylinder,materials.stone,16);for(let i=0;i<16;i++){const a=i*Math.PI/8;o.position.set(Math.sin(a)*38,395,29+Math.cos(a)*38);o.rotation.set(0,0,0);o.scale.set(.7,800,.7);o.updateMatrix();columns.setMatrixAt(i,o.matrix)}columns.computeBoundingSphere();shaft.add(columns);
 const circle=new T.Mesh(new T.TorusGeometry(5,.045,4,64),materials.rune);owned.push(circle.geometry);circle.rotation.x=Math.PI/2;circle.position.set(0,.065,30);world.add(circle);
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const texture=new T.CanvasTexture(canvas),labelMaterial=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}),label=new T.Mesh(new T.PlaneGeometry(13,3.25),labelMaterial);owned.push(label.geometry);label.position.set(0,7.5,54.8);label.rotation.y=Math.PI;world.add(label);
 const activeRune=new T.MeshBasicMaterial({color:0x7de8f5}),solvedRune=new T.MeshBasicMaterial({color:0x8ff0a6});
 const runeGroup=new T.Group();world.add(runeGroup);
 let floor=0,offset=0,target=0,pointers=[];
 function sync(run){
  const f=run?.tower?.floor||1;
  if(f!==floor){
   const initial=floor===0;floor=f;target=-(floor-1)*8;if(initial)offset=target;
   runeGroup.clear();pointers=[];
   function piece(geometry,material,x,y,z,w,h,d){
    const mesh=new T.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);return mesh;
   }
   for(const rune of towerRunes(f)){
    const pedestal=new T.Group();pedestal.position.set(rune.x,0,rune.z);runeGroup.add(pedestal);
    pedestal.add(piece(cylinder,materials.dark,0,.42,0,.53,.84,.53));
    pedestal.add(piece(cylinder,materials.edge,0,.87,0,.82,.12,.82));
    const marker=new T.Group();marker.rotation.y=rune.target*Math.PI/2;
    marker.add(piece(box,materials.rune,0,.97,.65,.23,.08,.23));pedestal.add(marker);
    const pointer=new T.Group(),needle=piece(box,activeRune,0,1.02,.28,.1,.08,.6);
    pointer.add(needle);pedestal.add(pointer);pointers.push({pointer,needle,target:rune.target});
   }
   const c=canvas.getContext('2d');c.clearRect(0,0,1024,256);c.fillStyle='#efd297';c.textAlign='center';c.font='bold 76px sans-serif';
   c.fillText(String(floor).padStart(3,'0')+' / 100',512,108);c.font='34px sans-serif';
   c.fillText(floor%5===0?'BOSS · Lv. '+floor*5:'TRIAL · Lv. '+floor*5,512,180);texture.needsUpdate=true;
  }
  pointers.forEach(({pointer,needle,target},i)=>{
   const value=run?.tower?.runes?.[i]||0;
   pointer.rotation.y=value*Math.PI/2;
   needle.material=towerRuneAligned(value,target)?solvedRune:activeRune;
  });
 }
 return {world,fires:[],sync,update(){offset+=(target-offset)*.12;shaft.position.y=offset;},dispose(){world.removeFromParent();texture.dispose();labelMaterial.dispose();activeRune.dispose();solvedRune.dispose();owned.forEach(g=>g.dispose());Object.values(materials).forEach(m=>m.dispose())}};
}
