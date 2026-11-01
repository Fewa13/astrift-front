// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as THREE from './three.module.js?v=0.180.0';

// Bake the trim into one vertex-coloured mesh per articulated anchor. These
// cosmetics deliberately have no raycast: the original combat volumes remain.
export function dressFpsActor(actor, teamColor) {
  const u=actor.userData, team=new THREE.Color(teamColor), steel=0x708491,
    black=0x101d29, edge=0x263e51, light=0x8defff;
  const primary=team.clone().multiplyScalar(.65), secondary=team.clone().lerp(new THREE.Color(0x10243d),.48);
  function bake(anchor, pieces, emissive=false) {
    const positions=[],normals=[],colors=[];
    for(const [x,y,z,w,h,d,color,rx=0,ry=0,rz=0] of pieces){
      const c0=Math.min(w,h,d)*.23,shape=new THREE.Shape();
      shape.moveTo(-w/2+c0,-h/2);shape.lineTo(w/2-c0,-h/2);shape.lineTo(w/2,-h/2+c0);shape.lineTo(w/2,h/2-c0);shape.lineTo(w/2-c0,h/2);shape.lineTo(-w/2+c0,h/2);shape.lineTo(-w/2,h/2-c0);shape.lineTo(-w/2,-h/2+c0);shape.closePath();
      const geo=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,steps:1,curveSegments:1});geo.translate(0,0,-d/2);
      const matrix=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(1,1,1));
      geo.applyMatrix4(matrix);
      positions.push(...geo.attributes.position.array);normals.push(...geo.attributes.normal.array);
      const c=color?.isColor?color:new THREE.Color(color);
      for(let i=0;i<geo.attributes.position.count;i++)colors.push(c.r,c.g,c.b);
      geo.dispose();
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    geometry.computeBoundingSphere();
    const material=emissive?new THREE.MeshBasicMaterial({vertexColors:true}):new THREE.MeshStandardMaterial({vertexColors:true,metalness:.65,roughness:.38});
    const mesh=new THREE.Mesh(geometry,material);mesh.name='fps-armour-detail';mesh.raycast=()=>{};anchor.add(mesh);
    return mesh;
  }
  const chest=[];
  // Retain the old volumes for combat but replace their round helmet rendering.
  for(const m of u.pose.children.filter(m=>m.userData.hitZone==='head')){
    m.material=m.material.clone();m.material.visible=false;
  }
  for(const s of [-1,1]){
    chest.push([s*.19,.16,-.015,.26,.25,.10,primary,0,0,s*.16],
      [s*.19,.19,-.073,.20,.024,.015,steel,0,0,s*.16],
      [s*.22,-.10,.008,.15,.18,.08,secondary,0,0,-s*.2],
      [s*.16,-.25,.008,.19,.055,.07,black],
      [s*.22,.045,-.081,.055,.018,.014,light]);
  }
  chest.push([0,.08,-.08,.07,.25,.045,black],[0,.16,-.106,.028,.07,.012,light]);
  bake(u.armorPlate,chest);
  const body=[
    [0,1.74,0,.24,.21,.25,black],
    [-.30,1.55,.17,.15,.16,.14,secondary,0,0,-.25],[.30,1.55,.17,.15,.16,.14,secondary,0,0,.25],
    [0,1.29,.25,.48,.59,.16,black],[0,1.30,.345,.22,.40,.035,secondary],
    [-.19,1.30,.35,.07,.30,.045,steel],[.19,1.30,.35,.07,.30,.045,steel],
    [0,.84,-.235,.52,.12,.09,edge],[0,.84,-.29,.12,.075,.025,steel],
    [-.30,.84,-.19,.12,.19,.12,black],[.30,.84,-.19,.12,.19,.12,black],
    [0,1.65,0,.44,.10,.37,black],
  ];
  for(let i=0;i<3;i++)body.push([0,1.12-i*.09,-.224,.39-i*.04,.055,.035,secondary]);
  bake(u.pose,body);
  for(const s of [-1,1]){
    const arm=s<0?u.leftArm:u.rightArm,leg=s<0?u.leftLeg:u.rightLeg;
    bake(arm,[[s*.025,.29,0,.29,.22,.32,primary,0,0,-s*.22],
      [s*.04,.36,-.01,.27,.055,.30,steel,0,0,-s*.22],
      [0,-.04,-.112,.19,.21,.08,black],
      [0,-.24,-.08,.23,.26,.22,secondary,0,0,s*.07],
      [0,-.25,-.197,.15,.15,.035,primary],
      [0,-.24,-.218,.095,.025,.008,light],
      [0,-.43,-.025,.18,.12,.18,black]]);
    bake(leg,[[0,.23,-.065,.25,.29,.20,primary],
      [0,.035,-.13,.27,.20,.14,secondary,.12],
      [0,.06,-.209,.12,.025,.018,steel],
      [0,-.19,-.045,.23,.28,.20,secondary],
      [s*.08,-.18,-.15,.035,.17,.02,primary],
      [0,-.31,-.08,.26,.12,.34,black],
      [0,-.29,-.23,.23,.055,.08,steel]]);
  }
  // Helmet trim is parented to the existing gear so removing a helmet still works.
  bake(u.helmetShell,[[0,.03,.025,.54,.39,.49,secondary],
    [0,-.10,-.215,.39,.18,.15,black],
    [0,.025,-.255,.43,.14,.10,black],
    [0,.10,-.22,.45,.09,.13,primary,.18],
    [0,.10,0,.44,.10,.45,secondary],
    [-.245,-.035,-.02,.11,.24,.30,primary,0,0,-.16],
    [.245,-.035,-.02,.11,.24,.30,primary,0,0,.16],
    [0,-.17,-.20,.27,.13,.15,edge,.2],
    [-.12,-.10,-.27,.09,.14,.12,secondary,0,-.28],
    [.12,-.10,-.27,.09,.14,.12,secondary,0,.28],
    [0,.025,-.30,.39,.055,.08,black],
    [0,.13,.02,.075,.07,.38,steel]]);
  bake(u.helmetVisor,[[0,.035,-.032,.31,.025,.012,light],
    [-.17,.016,-.015,.045,.025,.02,light,0,0,-.35],
    [.17,.016,-.015,.045,.025,.02,light,0,0,.35]],true);
  bake(u.rifle,[[0,.04,-.05,.16,.13,.57,edge],
    [0,.13,.02,.09,.07,.18,black],[0,.17,.02,.10,.018,.14,steel],
    [0,-.13,.09,.10,.20,.17,black,.15],
    [0,.02,-.40,.09,.08,.24,steel],
    [-.085,.02,-.08,.016,.018,.29,light],
    [.085,.02,-.08,.016,.018,.29,light]]);
  u.fpsArmour=true;
}
