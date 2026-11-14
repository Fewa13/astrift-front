// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as THREE from './three.module.js';
const actions={
 tribe0seal:['turn',9],tribe1seal:['turn',10],tribe2seal:['turn',11],signal1seal:['align',4],
 'barricadeseal':['hammer',0],
 'timberseal':['hammer',1],
 'trailseal':['hammer',2],
 'tribe-recovery-trailseal':['hammer',3],
 'sanctumrepairseal':['hammer',4],
 'starrepairseal':['hammer',5],
 'courtrepairseal':['hammer',6],
 'signalrepairseal':['hammer',7],
 'suppliesseal':['pack',0],
 'tribe-recovery-suppliesseal':['pack',1],
 'tracksseal':['inspect',0],
 'blighttracksseal':['inspect',1],
 'guardrecordseal':['inspect',2],
 'crownrecordseal':['inspect',3],
 'sanctumrecordseal':['inspect',4],
 'courtcodexseal':['inspect',5],
 'courtrecordseal':['inspect',6],
 'signal0seal':['inspect',7],
 'starrecordseal':['turn',0],
 'starwestseal':['turn',1],
 'sanctumnorthseal':['turn',2],
 'smalltotemseal':['turn',3],
 'tribe-recovery-smalltotemseal':['turn',4],
 'dunecompassseal':['turn',5],
 'dunesun1seal':['turn',6],
 'dunesun2seal':['turn',7],
 'dunesun3seal':['turn',8],
 'sanctumlensseal':['align',0],
 'skymirrorseal':['align',1],
 'skybeaconseal':['align',2],
 'stareastseal':['align',3],
 'springseal':['pour',0],
 'sanctumwaterseal':['pour',1],
 'dunewellseal':['pour',2],
 'rootsseal':['cut',0],
 'blightwestseal':['cut',1],
 'blighteastseal':['cut',2],
 'blightrescueseal':['pull',0],
 'gateseal':['pull',1],
 'dunegateseal':['pull',2],
 'blightcureseal':['heal',0],
 'blightpurifyseal':['channel',0],
 'sanctumsouthseal':['channel',1],
 'courtfinalseal':['channel',2],
 'court-seal':['channel',3],
 'skyrelayseal':['channel',4],
 'skydawnseal':['channel',5],
 'westseal':['channel',6],
 'eastseal':['channel',7],
 'flow0seal':['channel',8],
 'flow1seal':['channel',9],
 'flow2seal':['channel',10],
 'outer0seal':['channel',11],
 'outer1seal':['channel',12],
 'outerpatrolseal':['channel',13],
 'tree0seal':['channel',14],
 'tree1seal':['channel',15],
};
const labels={
 hammer:['敲击修复','Hammer and repair'],pack:['打包补给','Pack supplies'],inspect:['翻查记录','Examine the record'],
 turn:['旋转机关','Turn the mechanism'],align:['校准光束','Align the beam'],pour:['检查水源','Examine the water'],
 cut:['切断连接','Sever the connection'],pull:['拉开障碍','Pull the obstruction clear'],
 heal:['净化伤口','Cleanse the wound'],channel:['调整回路','Tune the circuit'],
};
export function objectActionProfile(id){
 const [kind,variant]=actions[id]||['inspect',0];
 return {kind,variant,label:labels[kind],duration:kind==='hammer'?3000+variant%3*180:kind==='heal'?3600:2600+variant%4*220};
}
export function createObjectActionFX(scene,camera){
 const hand=new THREE.Group(),fx=new THREE.Group();hand.visible=fx.visible=false;scene.add(hand,fx);
 const wood=new THREE.MeshStandardMaterial({color:0x745238,roughness:.85}),metal=new THREE.MeshStandardMaterial({color:0x9bafac,metalness:.7,roughness:.3}),glove=new THREE.MeshStandardMaterial({color:0x344e43,roughness:.85}),light=new THREE.MeshBasicMaterial({color:0x72ffcf,transparent:true,opacity:.85,depthWrite:false});
 const mesh=(geo,mat,parent,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.renderOrder=100;parent.add(m);return m};
 const arm=mesh(new THREE.CylinderGeometry(.085,.12,.42,7),glove,hand,.05,-.28,.03);arm.rotation.z=-.3;
 const palm=mesh(new THREE.BoxGeometry(.17,.14,.17),glove,hand,0,-.05,0);
 const hammer=new THREE.Group();hand.add(hammer);mesh(new THREE.CylinderGeometry(.035,.045,.55,8),wood,hammer,0,.18,0);mesh(new THREE.BoxGeometry(.35,.15,.15),metal,hammer,0,.47,0);mesh(new THREE.BoxGeometry(.09,.17,.17),metal,hammer,.2,.47,0);
 const orb=mesh(new THREE.IcosahedronGeometry(.13,1),light,hand,0,.22,-.24),paper=mesh(new THREE.BoxGeometry(.36,.025,.27),wood,hand,0,.08,-.24);
 const blade=mesh(new THREE.BoxGeometry(.055,.48,.023),metal,hand,0,.28,-.1);
 const vial=mesh(new THREE.CylinderGeometry(.07,.09,.2,12),light,hand,0,.16,-.12);
 const lens=mesh(new THREE.TorusGeometry(.15,.027,6,24),metal,hand,0,.18,-.17);
 const ring=mesh(new THREE.TorusGeometry(.7,.025,6,40),light,fx);ring.rotation.x=-Math.PI/2;
 const beam=mesh(new THREE.CylinderGeometry(.012,.012,1,6),light,fx);const sparks=Array.from({length:12},()=>mesh(new THREE.OctahedronGeometry(.035,0),light,fx));
 let state=null;const local=new THREE.Vector3(),end=new THREE.Vector3(),direction=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),rotation=new THREE.Quaternion(),euler=new THREE.Euler();
 function reset(){hand.visible=fx.visible=false;if(state){state.actor.mesh.userData.body.position.x=0;state.actor.mesh.userData.body.rotation.z=0}state=null}
 return {start(profile,actor){reset();if(!actor)return;const {kind}=profile;state={...profile,actor};hand.visible=fx.visible=true;hammer.visible=kind==='hammer';paper.visible=kind==='pack'||kind==='inspect';orb.visible=['channel','heal'].includes(kind);beam.visible=['channel','align','heal'].includes(kind);blade.visible=kind==='cut';vial.visible=kind==='pour';lens.visible=['align','turn'].includes(kind);},reset,update(progress,time){if(!state)return;const {kind,variant,actor}=state,t=progress,cycle=(t*(2+variant%3))%1,impact=Math.max(0,1-Math.abs(cycle-.65)*12),pulse=Math.sin(time*.012);
 const reach=Math.sin(t*Math.PI)*(1+variant*.022),sweep=Math.sin(t*Math.PI*2),sign=variant%2?-1:1;
 const pitch={hammer:-.7+Math.sin(cycle*Math.PI)*1.3,pack:.35*reach,inspect:-.35+.2*sweep,turn:.12,align:.05,pour:.7*reach,cut:-.4*reach,pull:.2,heal:-.32*reach,channel:.12};
 const roll={turn:sign*t*Math.PI*1.6,cut:sign*(1-2*t)*.9,pour:sign*reach*.8,pack:sweep*.24,align:sign*(1-t)*.45};
 local.set(.38+(kind==='cut'?sign*sweep*.27:0),-.28+(kind==='inspect'?.13*reach:0),-.8-(kind==='pull'?.35*reach:.18*reach)).applyQuaternion(camera.quaternion).add(camera.position);hand.position.copy(local);hand.quaternion.copy(camera.quaternion);euler.set(pitch[kind]||0,kind==='align'?sign*(1-t)*.28:0,roll[kind]||0);rotation.setFromEuler(euler);hand.quaternion.multiply(rotation);
 fx.position.copy(actor.mesh.position);direction.copy(camera.position).sub(fx.position);direction.y=0;if(direction.lengthSq()>.001)fx.position.addScaledVector(direction.normalize(),.8);fx.position.y+=kind==='hammer'?.7:1.1;ring.scale.setScalar(kind==='inspect'?.65+t*.5:1+.06*pulse);ring.position.y=kind==='inspect'?Math.sin(t*Math.PI*4)*.65:0;ring.material.opacity=.35+.35*Math.abs(pulse);
 ring.visible=['align','turn','heal','channel','pour'].includes(kind);
 ring.rotation.z=kind==='turn'?sign*(variant+1)*t:0;
 ring.scale.multiplyScalar(kind==='pour'?.3+t*.8:kind==='heal'?.5+reach*.65:1);
 light.color.setHex(({heal:0x8cfaa3,pour:0x62d9ff,cut:0xb788f7,align:0xffdc87,hammer:0xffbf70})[kind]||0x72ffcf);
 if(beam.visible){end.copy(hand.position).sub(fx.position);beam.position.copy(end).multiplyScalar(.5);beam.scale.y=end.length();direction.copy(end).normalize();beam.quaternion.setFromUnitVectors(up,direction)}
 for(let i=0;i<sparks.length;i++){const m=sparks[i],a=i*Math.PI*2/sparks.length,r=kind==='hammer'?impact*.7:.25+t*.6;m.visible=kind==='hammer'?impact>0:kind!=='pack';m.position.set(Math.cos(a)*r,(kind==='hammer'?impact:.2+Math.sin(time*.004+i)*.35),Math.sin(a)*r);if(kind==='pour')m.position.set(Math.cos(a)*t,.12+((t*2+i*.1)%1)*.35,Math.sin(a)*t);
 if(kind==='cut')m.position.set((i-5.5)*.14,sign*(i-5.5)*.11,.12);
 if(kind==='heal')m.position.y=((t+i/12)%1)*1.2;
 m.visible&&=!['pack','pull','inspect'].includes(kind);
 m.scale.setScalar(kind==='hammer'?impact:kind==='cut'?Math.sin(t*Math.PI):1)}
 actor.mesh.userData.body.position.x=kind==='hammer'?impact*.035:0;actor.mesh.userData.body.rotation.z=kind==='hammer'?impact*.025:0;
 }};
}
