export const QUALITY = {
  smooth:{label:'流畅',pixelRatio:1,shadows:false,particles:3},
  balanced:{label:'均衡',pixelRatio:1.25,shadows:false,particles:5},
  sharp:{label:'清晰',pixelRatio:1.7,shadows:true,particles:7}
};

// Render-only batching. Original collider meshes keep their precise world matrices.
export function batchStaticScene(THREE,scene) {
  const groups=new Map();
  for (const mesh of [...scene.children]) {
    if (!mesh.isMesh || mesh.userData.noBatch || !['BoxGeometry','PlaneGeometry'].includes(mesh.geometry.type)) continue;
    const m=mesh.material;
    if (Array.isArray(m)||m.map||m.transparent) continue;
    const key=[mesh.geometry.type,m.type,m.roughness,m.metalness,m.side,mesh.castShadow,mesh.receiveShadow].join('/');
    if (!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(mesh);
  }
  let before=0,after=0;
  for (const meshes of groups.values()) {
    if (meshes.length<2) continue;
    const first=meshes[0],box=first.geometry.type==='BoxGeometry';
    const material=first.material.clone();material.color.set(0xffffff);
    const batch=new THREE.InstancedMesh(box?new THREE.BoxGeometry(1,1,1):new THREE.PlaneGeometry(1,1),material,meshes.length);
    batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;
    meshes.forEach((mesh,index)=>{
      mesh.updateMatrixWorld(true);
      const p=mesh.geometry.parameters;
      batch.setMatrixAt(index,mesh.matrixWorld.clone().multiply(new THREE.Matrix4().makeScale(p.width,p.height,box?p.depth:1)));
      batch.setColorAt(index,mesh.material.color);
      mesh.matrixAutoUpdate=false;
      scene.remove(mesh);
    });
    batch.computeBoundingSphere();scene.add(batch);before+=meshes.length;after++;
  }
  return {before,after};
}

export function disposeObject(root) {
  if (!root) return;
  root.removeFromParent();
  const geometries=new Set(),materials=new Set();
  root.traverse(child=>{if(child.geometry)geometries.add(child.geometry);for(const m of (Array.isArray(child.material)?child.material:[child.material]))if(m)materials.add(m);});
  for(const geometry of geometries)geometry.dispose();
  for(const material of materials){material.map?.dispose();material.dispose();}
}

// Bounded reuse: no per-tracer animation loop or per-frame GPU buffer allocation.
export function createEffects(THREE,scene) {
  const active=[],pool=[],maxTraces=64;
  function recycle(item){item.line.removeFromParent();pool.push(item);}
  return {
    trace(a,b,speed=700,bright=false) {
      if(active.length>=maxTraces)recycle(active.shift());
      let item=pool.pop();
      if(!item){
        const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));
        item={line:new THREE.Line(geometry,new THREE.LineBasicMaterial({transparent:true})),start:new THREE.Vector3(),end:new THREE.Vector3()};
        item.line.frustumCulled=false;
      }
      item.start.copy(a);item.end.copy(b);item.age=0;
      // Keep a short segment visible even on 25–30 FPS devices. Visual only.
      item.duration=THREE.MathUtils.clamp(a.distanceTo(b)/Math.max(1,speed),.06,.32);
      item.line.material.color.set(bright?0xfff06a:speed>950?0xd8f8ff:0x8ffaff);item.line.material.opacity=1;
      const p=item.line.geometry.attributes.position;p.setXYZ(0,a.x,a.y,a.z);p.setXYZ(1,a.x+(b.x-a.x)*.16,a.y+(b.y-a.y)*.16,a.z+(b.z-a.z)*.16);p.needsUpdate=true;
      scene.add(item.line);active.push(item);
    },
    update(dt) {
      for(let i=active.length-1;i>=0;i--){
        const item=active[i];item.age+=dt;
        if(item.age>=item.duration){recycle(item);active.splice(i,1);continue;}
        const t=item.age/item.duration,tail=Math.max(0,t-.16),p=item.line.geometry.attributes.position,a=item.start,b=item.end;
        p.setXYZ(0,a.x+(b.x-a.x)*tail,a.y+(b.y-a.y)*tail,a.z+(b.z-a.z)*tail);
        p.setXYZ(1,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,a.z+(b.z-a.z)*t);p.needsUpdate=true;
        item.line.material.opacity=t<.82?1:(1-t)/.18;
      }
    },
    clear(){for(const item of active)recycle(item);active.length=0;},
    get count(){return active.length;}
  };
}
