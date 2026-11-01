// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export function buildTutorialWorld(THREE){
  const group=new THREE.Group(),colliders=[];
  const grey=new THREE.MeshStandardMaterial({color:0x5a6b78,roughness:.9}),blue=new THREE.MeshStandardMaterial({color:0x263e50,roughness:.85}),light=new THREE.MeshBasicMaterial({color:0x5fdec7});
  function box(x,y,z,w,h,d,mat,solid=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);group.add(m);if(solid){m.userData.bounds={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY:y-h/2,maxY:y+h/2};colliders.push(m)}return m}
  box(0,-.14,0,48,.25,48,blue,false);
  for(const edge of [-23,23]){box(edge,1.5,0,1,3,48,grey);box(0,1.5,edge,48,3,1,grey)}
  for(const x of [-10,10]){box(x,.55,-8,3,1.1,2,grey);box(x,.04,-8,3.2,.06,2.2,light,false)}
  box(0,.04,-7,3,.06,16,light,false); // Open phase lane, not a solid wall.
  for(const x of [-2,2])box(x,1.8,-6,.25,3.6,.25,grey);box(0,3.6,-6,4.25,.25,.25,grey);
  for(let z=-18;z<18;z+=4)box(-16,.02,z,.1,.04,2,light,false);
  const beacon=new THREE.Mesh(new THREE.TorusGeometry(1,.08,6,32),light);beacon.rotation.x=-Math.PI/2;beacon.position.set(-5,.08,0);group.add(beacon);
  group.visible=false;return {group,colliders,beacon};
}
