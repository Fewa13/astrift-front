// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Build only when changing skins. Static parts are baked into material batches,
// not left as dozens of independently rendered ornaments.
export function phaseKnifeDetails(T,materials){
  const group=new T.Group(),[steel,edge,grip,accent,core]=materials;
  const add=(geometry,material,x,y,z,rotation=0)=>{const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.rotation.y=rotation;group.add(m);return m};
  const box=(w,h,d,mat,x,y,z,r=0)=>add(new T.BoxGeometry(w,h,d),mat,x,y,z,r);
  const plate=(points,depth,mat,y)=>{const shape=new T.Shape(points.map(p=>new T.Vector2(...p)));shape.closePath();const m=add(new T.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelSegments:1,bevelSize:.003,bevelThickness:.003}),mat,0,y,0);m.rotation.x=-Math.PI/2;return m};
  // Double-sided machinery: visible during both normal holding and inspection.
  for(const side of [-1,1]){
    const surface=side>0?.053:-.019;
    plate([[-.033,.13],[.033,.13],[.047,.29],[.024,.66],[0,.86],[-.024,.66],[-.047,.29]],.018,grip,surface);
    plate([[-.019,.18],[.019,.18],[.026,.31],[.013,.62],[0,.78],[-.013,.62],[-.026,.31]],.021,accent,surface+side*.009);
    // Faceted central phase crystal, seated above its dark recessed housing.
    const crystal=add(new T.OctahedronGeometry(.043,0),core,0,surface+side*.039,-.36);crystal.scale.set(.65,.48,2.5);
    for(let i=0;i<6;i++){
      const z=.2+i*.087,width=.072-i*.006;
      for(const direction of [-1,1]){
        box(width*.46,.012,.016,steel,direction*width*.42,surface+side*.014,-z,direction*.28);
        box(.009,.015,.041,core,direction*(.025-i*.002),surface+side*.019,-z);
      }
    }
    // Paired structural blade rails; not a flat painted stripe.
    for(const direction of [-1,1]){
      box(.013,.024,.38,edge,direction*.064,surface,-.36,direction*.055);
      box(.012,.017,.18,steel,direction*.039,surface,-.68,direction*.12);
      for(const z of [.13,.28,.48]){
        add(new T.CylinderGeometry(.01,.012,.01,6),steel,direction*.053,surface+side*.022,-z);
        box(.008,.004,.002,grip,direction*.053,surface+side*.029,-z);
      }
    }
    // Stacked wing guard, socketed energy node, warning notches.
    for(const direction of [-1,1]){
      box(.11,.035,.065,steel,direction*.14,side*.037,.015,direction*.35);
      box(.07,.015,.018,core,direction*.135,side*.061,.01,direction*.35);
      for(let i=0;i<3;i++)box(.005,.012,.026,grip,direction*(.11+i*.017),side*.057,.034);
    }
    const socket=add(new T.CylinderGeometry(.052,.052,.018,8),grip,0,side*.071,.03);
    add(new T.CylinderGeometry(.035,.039,.024,8),steel,0,side*.087,.03);
    const node=add(new T.OctahedronGeometry(.027,0),core,0,side*.104,.03);node.scale.y=.55;
    // Grip scales, diamond knurling and a segmented butt-cap.
    box(.087,.016,.28,grip,0,side*.061,.275);
    for(let i=0;i<8;i++)for(const direction of [-1,1])box(.038,.01,.009,accent,direction*.021,side*.076,.155+i*.033,direction*.5);
    for(const z of [.14,.405])add(new T.CylinderGeometry(.014,.014,.014,6),steel,0,side*.08,z);
    for(let i=0;i<3;i++)box(.018,.009,.032,core,(i-1)*.031,side*.075,.49);
  }
  for(const direction of [-1,1]){
    box(.017,.07,.32,steel,direction*.066,0,.275);
    for(let i=0;i<5;i++)box(.022,.08,.009,grip,direction*.067,0,.17+i*.05);
  }
  group.userData.detailParts=group.children.length;
  return group;
}

export function knifeSkinDetails(T,materials,form,id){
  if(id==='phasebreak')return phaseKnifeDetails(T,materials);
  const group=new T.Group(),[steel,edge,grip,accent,core]=materials;
  const seed=[...id].reduce((n,c)=>n+c.charCodeAt(0),0),royal=/gold|apex|crown|eclipse|starfall/.test(id);
  const add=(geo,mat,x,y,z,r=0)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.y=r;group.add(m);return m};
  const box=(w,h,d,mat,x,y,z,r=0)=>add(new T.BoxGeometry(w,h,d),mat,x,y,z,r);
  const crossSection=y=>{
    const xs=[];
    for(let i=0;i<form.blade.length;i++){const a=form.blade[i],b=form.blade[(i+1)%form.blade.length];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))xs.push(a[0]+(y-a[1])/(b[1]-a[1])*(b[0]-a[0]))}
    return xs.length>=2?[(Math.min(...xs)+Math.max(...xs))/2,(Math.max(...xs)-Math.min(...xs))*.5]:null;
  };
  const height=Math.max(...form.blade.map(p=>p[1])),count=royal?9:6+(seed%3);
  for(const side of [-1,1]){
    // An actual beveled relief follows each skin's own blade silhouette.
    const shape=new T.Shape(form.inlay.map(([x,y])=>new T.Vector2(x,y)));shape.closePath();
    const relief=add(new T.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:true,bevelSegments:1,bevelSize:.003,bevelThickness:.003}),accent,0,side>0?.048:-.017,0);relief.rotation.x=-Math.PI/2;
    for(let i=0;i<count;i++){
      const y=height*(.16+i*.64/count),section=crossSection(y);if(!section)continue;const [center,width]=section,surface=side>0?.068:-.025;
      if(royal){const jewel=add(new T.OctahedronGeometry(Math.min(.024,width*.26),0),i%3?steel:core,center,surface,-y);jewel.scale.set(1,.5,1.6)}
      for(const direction of [-1,1]){
        const style=seed%4;
        box(width*(style===0?.68:.45),.009,.008,i%3?steel:edge,center+direction*width*.42,surface,-y,direction*(style===1?.65:style===2?-.3:.2));
        if(i%2===0)add(new T.CylinderGeometry(.008,.01,.009,6),grip,center+direction*width*.67,surface,-y);
      }
    }
    // Custom scale patterns on the grip, with inset screws and butt-cap vents.
    const bands=royal?10:7,spacing=form.handle[2]/(bands+2);
    for(let i=0;i<bands;i++)for(const direction of [-1,1])box(form.handle[0]*.37,.008,spacing*.22,i%3===seed%3?accent:grip,direction*form.handle[0]*.19,side*.068,.275+(i-(bands-1)/2)*spacing,direction*(seed%2?.4:-.3));
    for(const z of [.275-form.handle[2]*.35,.275+form.handle[2]*.35])add(new T.CylinderGeometry(.012,.014,.009,6),steel,0,side*.078,z);
    for(let i=0;i<3;i++)box(.013,.01,.027,core,(i-1)*.032,side*.073,.275+form.handle[2]/2+.04);
    const guardGem=add(royal?new T.OctahedronGeometry(.028,0):new T.CylinderGeometry(.027,.032,.012,seed%2?6:8),royal?core:steel,0,side*.072,.024);if(royal)guardGem.scale.y=.55;
  }
  group.userData.detailParts=group.children.length;return group;
}

export function mergeKnifeParts(T,meshes){
  const groups=new Map(),result=new T.Group();
  for(const mesh of meshes){
    if(!mesh.isMesh||!mesh.visible)continue;
    mesh.updateMatrix();
    const geometry=(mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone());
    geometry.applyMatrix4(mesh.matrix);
    if(!geometry.attributes.normal)geometry.computeVertexNormals();
    const list=groups.get(mesh.material)||[];list.push(geometry);groups.set(mesh.material,list);
  }
  for(const [material,list] of groups){
    const geometry=new T.BufferGeometry();
    for(const name of ['position','normal','uv']){
      const size=name==='uv'?2:3,total=list.reduce((n,g)=>n+g.attributes.position.count*size,0),array=new Float32Array(total);let offset=0;
      for(const g of list){const attr=g.attributes[name];if(attr)array.set(attr.array,offset);offset+=g.attributes.position.count*size}
      geometry.setAttribute(name,new T.BufferAttribute(array,size));
    }
    geometry.computeBoundingSphere();geometry.computeBoundingBox();
    result.add(new T.Mesh(geometry,material));
    for(const g of list)g.dispose();
  }
  result.userData.sourceParts=meshes.filter(m=>m.isMesh&&m.visible).length;
  return result;
}
