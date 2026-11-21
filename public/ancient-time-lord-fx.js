// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
import {ancientMapHeight} from './ancient-rules.js';
import {createAncientSkinModel} from './ancient-skin-model.js';
const IDS=new Set(['timecurse','timedominion','timeflow','timeresurrection']);
const vertex=`varying vec2 vUv;varying vec3 vNormal;varying vec3 vEye;varying vec3 vWorld;void main(){vUv=uv;vec4 local=vec4(position,1.);vec3 n=normal;
#ifdef USE_INSTANCING
local=instanceMatrix*local;n=mat3(instanceMatrix)*n;
#endif
vec4 p=modelViewMatrix*local;vNormal=normalize(normalMatrix*n);vEye=normalize(-p.xyz);vWorld=(modelMatrix*local).xyz;gl_Position=projectionMatrix*p;}`;
const fragment=`uniform vec3 color;uniform float time;uniform float opacity;uniform float hologram;varying vec2 vUv;varying vec3 vNormal;varying vec3 vEye;varying vec3 vWorld;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){float edge=pow(max(0.,sin(vUv.y*3.14159)),.7);float streak=pow(.5+.5*sin(vUv.x*90.-time*8.),5.);float dust=hash(floor(vUv*vec2(95.,9.))+floor(time*9.));float fres=pow(1.-abs(dot(normalize(vNormal),normalize(vEye))),1.5);float scan=.55+.45*step(.25,fract(vWorld.y*12.-time*.8));float a=mix(edge*(.22+.6*streak+.18*dust),(.15+.85*fres)*scan,hologram);vec3 c=mix(color,vec3(1.,.97,.84),mix(streak*.7,fres*.5,hologram));gl_FragColor=vec4(c*(1.+streak*.35),a*opacity);}`;
function ink(color,hologram=0){return new T.ShaderMaterial({uniforms:{color:{value:new T.Color(color)},time:{value:0},opacity:{value:1},hologram:{value:hologram}},vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});}
function ribbon(points,width=.1){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),count=Math.max(20,points.length*10),positions=[],uv=[],indices=[],up=new T.Vector3(0,1,0),side=new T.Vector3();for(let i=0;i<=count;i++){const t=i/count,p=curve.getPoint(t),dir=curve.getTangent(t);side.crossVectors(dir,Math.abs(dir.y)>.9?new T.Vector3(0,0,1):up).normalize().multiplyScalar(width*(.15+.85*Math.sin(Math.PI*t)));for(const sign of [-1,1]){positions.push(p.x+side.x*sign,p.y+side.y*sign,p.z+side.z*sign);uv.push(t,sign===-1?0:1);}if(i<count){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;}
function arc(radius,start,end,y=0,rise=0){return Array.from({length:12},(_,i)=>{const t=i/11,a=start+(end-start)*t;return [Math.cos(a)*radius,y+Math.sin(t*Math.PI)*rise,Math.sin(a)*radius];});}
const baseBox=new T.BoxGeometry(1,1,1),dummy=new T.Object3D();
function ticks(root,radius,material,count=60){const mesh=new T.InstancedMesh(baseBox,material,count);for(let i=0;i<count;i++){const a=i/count*Math.PI*2;dummy.position.set(Math.sin(a)*radius,.03,Math.cos(a)*radius);dummy.rotation.set(0,a,0);dummy.scale.set(i%5?.025:.06,.025,i%5?.18:.45);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}mesh.computeBoundingSphere();root.add(mesh);return mesh;}
function consolidate(group){const batches=new Map();for(const m of [...group.children]){if(!m.isMesh||m.isInstancedMesh)continue;let list=batches.get(m.material);if(!list)batches.set(m.material,list=[]);list.push(m);}for(const [material,list]of batches){if(list.length<2)continue;const attributes={position:[],normal:[],uv:[]};for(const mesh of list){mesh.updateMatrix();const geometry=(mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone()).applyMatrix4(mesh.matrix);for(const [key,values]of Object.entries(attributes))for(const v of geometry.attributes[key].array)values.push(v);geometry.dispose();mesh.geometry.dispose();group.remove(mesh);}const geometry=new T.BufferGeometry();for(const [key,values]of Object.entries(attributes))geometry.setAttribute(key,new T.Float32BufferAttribute(values,key==='uv'?2:3));geometry.computeBoundingSphere();group.add(new T.Mesh(geometry,material));}}
function remove(group){group.traverse(m=>{if(m.isMesh&&m.geometry!==baseBox&&!m.userData.shared)m.geometry.dispose();if(m.isInstancedMesh)m.dispose();});group.removeFromParent();}
export function createTimeLordFX(scene,camera){
 const root=new T.Group();root.name='time-lord-effects';scene.add(root);const cyan=ink(0x65dfe7),gold=ink(0xe4bc74),white=ink(0xe9fcff),ghost=ink(0x469fae,1),futureGhost=ink(0xc5a465,1),brass=new T.MeshBasicMaterial({color:0xbda36c}),glass=new T.MeshBasicMaterial({color:0x659ca8,transparent:true,opacity:.1,side:T.DoubleSide,depthWrite:false}),materials=[cyan,gold,white,ghost,futureGhost],bursts=[],fields=new Map(),echoes=new Map();
 ghost.uniforms.opacity.value=.34;futureGhost.uniforms.opacity.value=.34;
 const add=(parent,points,width,material=cyan)=>{const m=new T.Mesh(ribbon(points,width),material);parent.add(m);return m;};
 function clock(radius){const g=new T.Group();ticks(g,radius,brass,camera.userData.renderPressure?30:60);for(let i=0;i<6;i++)add(g,arc(radius*(i%2?.88:1.02),i*Math.PI/3,i*Math.PI/3+.8),.035,i%2?cyan:gold);const hands=new T.Group();add(hands,[[0,.04,0],[radius*.1,.04,radius*.4],[0,.04,radius*.78]],.04,white);add(hands,[[0,.05,0],[-radius*.2,.05,-radius*.25],[-radius*.55,.05,-radius*.18]],.055,gold);consolidate(g);g.add(hands);for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const mark=new T.Mesh(new T.BoxGeometry(radius*.025,.035,radius*.12),brass);mark.position.set(Math.sin(angle)*radius*.75,.02,Math.cos(angle)*radius*.75);mark.rotation.y=angle;g.add(mark);}g.userData.hands=hands;return g;}
 function event(d,ground=()=>0){if(!IDS.has(d.id))return false;const g=new T.Group();g.position.set(d.x,ground(d.x,d.z)+.05,d.z);root.add(g);const low=camera.userData.renderPressure,life=d.id==='timecurse'?1800:d.id==='timeresurrection'?1500:2300;
  if(d.id==='timecurse'){
   // An aging fracture winds through the body, with hour-mark fragments pulled forward in time.
   for(let lane=0;lane<(low?3:6);lane++){const points=Array.from({length:20},(_,i)=>{const t=i/19,a=t*Math.PI*3+lane*Math.PI/3;return [Math.cos(a)*(.8+t*.35),.15+t*3.6,Math.sin(a)*(.8+t*.35)];});add(g,points,lane%2?.04:.08,lane%2?gold:cyan);}
   const dial=clock(1.6);dial.rotation.x=Math.PI/2;dial.position.y=1.7;g.add(dial);
  }else if(d.id==='timedominion'){
   const radius=Math.min(22,d.radius||22),dial=clock(radius);g.add(dial);
   for(let i=0;i<(low?8:18);i++){const a=i*2.39996,r=radius*(.25+(i%5)*.13),x=Math.cos(a)*r,z=Math.sin(a)*r;add(g,[[x,.1,z],[x+.5,1,z-.3],[x-.25,2.4,z+.2],[x+.3,4.5,z]],.09,i%2?cyan:gold);}
   g.userData.expand=true;
  }else if(d.id==='timeflow'){
   // Trajectories stream backwards into the caster rather than exploding outwards.
   for(let i=0;i<(low?8:18);i++){const a=i*2.39996,r=3+i%3;const points=Array.from({length:18},(_,j)=>{const t=j/17,angle=a+t*2;return [Math.cos(angle)*r*(1-t),.1+t*2.8,Math.sin(angle)*r*(1-t)];});add(g,points,.045,i%3?cyan:gold);}
   const dial=clock(2.8);g.add(dial);if(d.source&&Math.hypot(d.source.x-d.x,d.source.z-d.z)>1)add(g,[[d.source.x-d.x,1.2,d.source.z-d.z],[(d.source.x-d.x)*.5,1.8,(d.source.z-d.z)*.5],[0,1,0]],.12,white);g.userData.rewind=true;
  }else{
   // Each hit has an actual historical origin, so the attack reaches the target from its past position.
   const source=d.source;if(source){const dx=source.x-d.x,dz=source.z-d.z;add(g,[[dx,1.5,dz],[dx*.65,2.2,dz*.65],[dx*.25,1.8,dz*.25],[0,1.3,0]],.16,white);}
   for(let i=0;i<(low?3:7);i++){const a=i*Math.PI/3;add(g,[[Math.cos(a)*3,.3,Math.sin(a)*3],[Math.cos(a+.5)*1.5,1.5,Math.sin(a+.5)*1.5],[0,2,0]],.035,i%2?gold:cyan);}
  }
  consolidate(g);g.userData.at=performance.now();g.traverse(m=>{if(m.isMesh&&m.material.uniforms)m.onBeforeRender=()=>{m.material.uniforms.opacity.value=Math.min(1,Math.max(0,(life-(performance.now()-g.userData.at))/450));m.material.uniformsNeedUpdate=true;};});bursts.push({g,id:d.id,at:performance.now(),life});while(bursts.length>(low?6:16))remove(bursts.shift().g);return true;
 }
 function field(actor,d,r){const g=new T.Group();g.position.set(d.x,ancientMapHeight(r.map,d.x,d.z)+.08,d.z);const radius=d.radius||22,dial=clock(radius);g.add(dial);
  // Suspended radial fractures articulate the volume without an opaque dome.
  for(let i=0;i<(camera.userData.renderPressure?6:10);i++){const a=i*Math.PI/5;add(g,arc(radius,a,a+.18,.2,1.4),.06,i%2?gold:cyan);const x=Math.cos(a)*radius*.82,z=Math.sin(a)*radius*.82;add(g,[[x,.1,z],[x+.4,1.8,z-.3],[x-.3,3.8,z+.3],[x+.2,5,z]],.18,white);const shard=new T.Mesh(new T.RingGeometry(radius*.32,radius*.56,7,1,a,.24),glass);shard.rotation.set(-Math.PI/2+.14*(i%2?1:-1),0,.1);shard.position.y=1.1+(i%3)*.5;g.add(shard);}
  consolidate(g);g.traverse(m=>{if(m.isMesh&&m.material.uniforms)m.onBeforeRender=()=>{m.material.uniforms.opacity.value=1;m.material.uniformsNeedUpdate=true;};});g.userData.dial=dial;root.add(g);return g;
 }
 function silhouette(skin,index){const model=createAncientSkinModel(skin||'wanderer','timelord');model.name='temporal-self-echo';model.traverse(m=>{if(m.isMesh){m.material=index%2?futureGhost:ghost;m.userData.shared=true;}});return model;}
 function updateFields(actors){const used=new Set(),usedEcho=new Set(),now=Date.now();let fieldCount=0,echoCount=0;for(const a of actors.filter(Boolean).sort((a,b)=>Math.hypot(a.x-camera.position.x,a.z-camera.position.z)-Math.hypot(b.x-camera.position.x,b.z-camera.position.z))){if(a.hp<=0||a.profession!=='timelord')continue;const r=a.skillRuntime?.authority;if(!r)continue;const d=r.domain;
   if(d?.id==='timedominion'&&d.until>now&&fieldCount++<(camera.userData.renderPressure?4:8)){const key=a.name+':'+d.until;used.add(key);if(!fields.has(key))fields.set(key,field(a,d,r));const g=fields.get(key);g.userData.dial.userData.hands.rotation.y=-now*.0002;}
   if((r.echoUntil||0)>now&&echoCount++<(camera.userData.renderPressure?4:8)){const key=a.name;usedEcho.add(key);let group=echoes.get(key);if(!group){group=new T.Group();const count=camera.userData.renderPressure?2:4;for(let i=0;i<count;i++)group.add(silhouette(a.skin,i));echoes.set(key,group);root.add(group);}const trail=(r.history||[]).filter(p=>p.x!==undefined&&p.z!==undefined);group.children.forEach((clone,i)=>{const sample=trail[Math.max(0,trail.length-1-(i+1)*2)];const angle=(a.yaw||0)+(i%2?1:-1)*.65;clone.position.set((sample?.x??a.x)+Math.sin(angle)*(i+1)*.8,(sample?.y??a.y)-1.7,(sample?.z??a.z)+Math.cos(angle)*(i+1)*.8);clone.rotation.y=a.yaw||0;clone.visible=i<(camera.userData.renderPressure?2:4);for(const [j,arm]of (clone.userData.arms||[]).entries())arm.rotation.x=-.8-Math.sin(now*.005+i+j)*.45;});}
  }
  for(const [key,g]of fields)if(!used.has(key)){remove(g);fields.delete(key);}for(const [key,g]of echoes)if(!usedEcho.has(key)){g.removeFromParent();echoes.delete(key);}
 }
 return {effect:event,updateFields,update(time){for(const material of materials)material.uniforms.time.value=time/1000;for(let i=bursts.length-1;i>=0;i--){const b=bursts[i],age=(time-b.at)/b.life;if(age>=1){remove(b.g);bursts.splice(i,1);continue;}const scale=b.g.userData.expand?.2+.8*Math.min(1,age*4):b.g.userData.rewind?1.1-age*.2:1;b.g.scale.setScalar(scale);b.g.visible=age<.94;for(const child of b.g.children)if(child.userData.hands)child.userData.hands.rotation.y=(b.g.userData.rewind?-1:1)*age*7;}},clear(){for(const b of bursts)remove(b.g);bursts.length=0;for(const g of fields.values())remove(g);fields.clear();for(const g of echoes.values())g.removeFromParent();echoes.clear();},dispose(){this.clear();root.removeFromParent();materials.forEach(m=>m.dispose());}};
}
export function createTimeLordProjectile(group,flight,low){
 const materials=[ink(0x83e9e4),ink(0xe9bd72)],geometries=[];
 for(let lane=0;lane<(low?2:4);lane++){const points=Array.from({length:20},(_,i)=>{const t=i/19,a=t*Math.PI*4+lane*Math.PI/2;return [Math.cos(a)*(.3+t*.25),Math.sin(a)*(.3+t*.25),-2.7+t*3.1];});const geometry=ribbon(points,.065);geometries.push(geometry);group.add(new T.Mesh(geometry,materials[lane%2]));}
 const needle=new T.Mesh(new T.ConeGeometry(.12,1.5,5),new T.MeshBasicMaterial({color:0xffe6a3}));needle.rotation.x=Math.PI/2;needle.position.z=.2;group.add(needle);geometries.push(needle.geometry);
 const dial=new T.Group();dial.rotation.x=Math.PI/2;ticks(dial,.62,materials[1],low?12:24);group.add(dial);
 return {update(now){for(const m of materials)m.uniforms.time.value=now/1000;dial.rotation.y=-now*.002;},dispose(){materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());needle.material.dispose();dial.traverse(m=>{if(m.isInstancedMesh)m.dispose();});}};
}
