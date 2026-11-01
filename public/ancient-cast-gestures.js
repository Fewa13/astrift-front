// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
import {PROFESSION_LOOKS} from './ancient-profession-models.js?v=20261014-new-professions-1';
const profiles={
 chain:['point',.58],haste:['sweep',.56],storm:['sky',1.05],
 icebolt:['push',.60],frostburst:['fan',.68],icearmor:['ward',.85],blizzard:['sky',1.05],
 soulbolt:['push',.6],summon:['seal',1.05],weaken:['point',.58],transform:['clench',.8],
 hex:['point',.65],drain:['grasp',.85],doom:['seal',1.05],
 vitality:['ward',.75],power:['clench',.7],rage:['clench',.8],slash:['blade',.65],
 swordwave:['blade',.58],triplecut:['triple',.95],swordrain:['sky',.95],phantomblade:['greatblade',1.05],
 riftblade:['fan',.6],shadowstep:['sweep',.5],shadowreturn:['sweep',.6],nightfall:['fan',.9],
 stonefist:['punch',.65],faultline:['slam',.8],stoneprison:['seal',.95],mountainfall:['slam',1.05]
};
export function castGestureProfile(id){return Object.hasOwn(profiles,id)?profiles[id]:null;}
export function castGesturePhase(cast,now){const p=cast&&castGestureProfile(cast.id);return p?Math.max(0,(now-cast.at)/1000/p[1]):2;}
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const weight=t=>smooth(t/.16)*(1-smooth((t-.70)/.30));
const bladeKind=kind=>['blade','triple','greatblade'].includes(kind);
export function createAncientCastGestures(camera){
 const root=new T.Group();root.name='ancient-casting-hands';camera.add(root);root.visible=false;
 const glove=new T.MeshStandardMaterial({color:0x27332f,roughness:.8}),metal=new T.MeshStandardMaterial({color:0x758b85,metalness:.6,roughness:.4}),cloth=new T.MeshStandardMaterial({color:0x244c3e,roughness:.8}),rune=new T.MeshBasicMaterial({color:0x67ff9c,transparent:true,opacity:.65,depthWrite:false});
 const fingerGeo=new T.CapsuleGeometry(.011,.028,2,5),palmGeo=new T.BoxGeometry(.092,.11,.045),sleeveGeo=new T.CylinderGeometry(.049,.061,.24,8),plateGeo=new T.BoxGeometry(.075,.068,.012),ringGeo=new T.TorusGeometry(.085,.0025,3,24),dummy=new T.Object3D();
 const hands=[-1,1].map(side=>{const hand=new T.Group();root.add(hand);const sleeve=new T.Mesh(sleeveGeo,cloth);sleeve.position.set(0,-.16,.055);sleeve.rotation.x=.4;hand.add(sleeve);const palm=new T.Mesh(palmGeo,glove);hand.add(palm);const plate=new T.Mesh(plateGeo,metal);plate.position.z=.029;hand.add(plate);const fingers=new T.InstancedMesh(fingerGeo,glove,10);fingers.instanceMatrix.setUsage(T.DynamicDrawUsage);fingers.frustumCulled=false;hand.add(fingers);const ring=new T.Mesh(ringGeo,rune);ring.position.set(0,.02,-.052);hand.add(ring);return {hand,fingers,ring,side};});
 let cast=null;
 function poseFingers(h,kind,t){const open=['sky','fan','push','ward','seal'].includes(kind),fist=['clench','punch','slam'].includes(kind),point=kind==='point';for(let i=0;i<5;i++){const thumb=i===4,spread=open?.014:.006,curl=fist?1.25:point&&i>0&&!thumb?1.1:kind==='grasp'?.7:open?.12:.3,x=thumb?h.side*.061:(i-1.5)*(.022+spread),base=thumb?-.01:.065,angle=thumb?h.side*-.8:(i-1.5)*(open?.15:.025);for(let joint=0;joint<2;joint++){dummy.position.set(x+Math.sin(angle)*joint*.027,base+joint*.032*Math.cos(curl),-.012-joint*.035*Math.sin(curl));dummy.rotation.set(-curl-(joint?curl*.45:0),0,angle);dummy.scale.set(thumb?.88:1,i===3?.86:1,1);dummy.updateMatrix();h.fingers.setMatrixAt(i*2+joint,dummy.matrix);}}h.fingers.instanceMatrix.needsUpdate=true;}
 function clear(){cast=null;root.visible=false;}
 function start(id,holy=false,now=performance.now()){if(!castGestureProfile(id))return false;cast={id,holy,at:now};return true;}
 function update(p,a,time,suppressed=false){
  if(!cast||!a||a.hp<=0){clear();return;}const t=castGesturePhase(cast,time);if(t>=1){clear();return;}
  if(suppressed||(a.skillRuntime?.effects?.transform?.until||0)>Date.now()||a.skillRuntime?.bossForm){root.visible=false;return;}
  const [kind]=profiles[cast.id],w=weight(t),look=PROFESSION_LOOKS[p?.profession]||PROFESSION_LOOKS.adventurer;
  cloth.color.set(look.cloth);metal.color.set(look.metal);rune.color.set(look.glow);rune.opacity=w*(cast.holy?.8:.45);root.visible=true;
  for(const h of hands){const side=h.side,single=['point','push','blade','triple','greatblade','sky','punch'].includes(kind);h.hand.visible=!single||side===-1;if(!h.hand.visible)continue;
   let x=side*.25,y=-.35,z=-.7,rx=-.15,ry=side*-.2,rz=side*-.15;
   if(kind==='point'||kind==='push'){x=side*.24;y=-.20;z=-.78;rx=-.60;rz=side*-.25;}
   if(kind==='sky'){x=side*.30;y=-.04;z=-.82;rx=-.08;rz=side*-.3;}
   if(kind==='seal'||kind==='ward'){x=side*(kind==='seal'?.15:.26);y=-.22;z=-.75;ry=side*.55;rz=side*(kind==='seal'?.55:-.35);}
   if(kind==='fan'||kind==='sweep'){x=side*(.20+.16*smooth(t/.6));y=-.23;z=-.74;rz=side*-.65;}
   if(kind==='grasp'){x=side*(.34-.16*smooth(t/.7));y=-.21;z=-.78+.1*smooth(t/.6);ry=side*.5;}
   if(kind==='clench'){x=side*.27;y=-.20;z=-.62;rz=side*.35;}
   if(kind==='slam'){x=side*.25;y=.01-.35*smooth((t-.18)/.38);z=-.76;rx=-.25;}
   if(kind==='punch'){x=side*.23;y=-.24;z=-.68-.18*smooth(t/.35);rx=-.9;}
   if(bladeKind(kind)){x=side*.3;y=kind==='greatblade'?-.09:-.24;z=-.76;rz=side*-.45;}
   h.hand.position.set(x,y-.18*(1-w),z+.07*(1-w));h.hand.rotation.set(rx,ry,rz);h.ring.visible=!['punch','clench','sweep'].includes(kind);h.ring.rotation.z=(side*t*1.5);h.ring.scale.setScalar(cast.holy?1.15:1);poseFingers(h,kind,t);
  }
 }
 return {start,update,clear,get weaponSuppressed(){return !!cast&&!bladeKind(profiles[cast.id][0]);},get current(){return cast;},dispose(){clear();root.removeFromParent();for(const h of hands)h.fingers.dispose();for(const g of [fingerGeo,palmGeo,sleeveGeo,plateGeo,ringGeo])g.dispose();for(const m of [glove,metal,cloth,rune])m.dispose();}};
}
// Apply after locomotion; restore only axes not reset by animateCreature.
export function updateAncientRemoteCast(mesh,cast,now=Date.now()){
 const arms=mesh.userData.arms;if(!arms?.length)return;const t=castGesturePhase(cast,now),old=mesh.userData.castPose;
 if(!cast||t>=1){if(old){arms.forEach((arm,i)=>{arm.rotation.y=old[i][0];arm.rotation.z=old[i][1];});delete mesh.userData.castPose;if(mesh.userData.remoteWeapon)mesh.userData.remoteWeapon.visible=true;}return;}
 if(!old)mesh.userData.castPose=arms.map(a=>[a.rotation.y,a.rotation.z]);const [kind]=profiles[cast.id],w=weight(t),weapon=mesh.userData.remoteWeapon;
 if(weapon)weapon.visible=bladeKind(kind);
 arms.forEach((arm,i)=>{const side=i===0?-1:1;let x=-1.25,y=side*.2,z=side*.25;
  if(kind==='sky'||kind==='greatblade'){x=-2.65;z=side*.25;}
  if(kind==='point'||kind==='push'||kind==='punch'){x=i===0?-1.65:-.3;z=i===0?-.2:.25;}
  if(kind==='seal'||kind==='ward'){x=-1.18;y=side*-.5;z=side*-.45;}
  if(kind==='clench'){x=-1.45;z=side*.6;}
  if(kind==='fan'||kind==='sweep'){x=-1.3;z=side*(.2+t*.75);}
  if(kind==='grasp'){x=-1.6;z=side*(.6-t*.4);}
  if(kind==='slam'){x=-2.5+1.8*smooth((t-.18)/.38);}
  if(kind==='blade'){x=i===1?-1.8+1.8*smooth(t/.65):-.8;z=i===1?1.1*Math.sin(t*Math.PI):-.25;}
  if(kind==='triple'){x=i===1?-1.2: -.7;z=i===1?Math.sin(t*Math.PI*6)*.85:-.2;}
  arm.rotation.x=T.MathUtils.lerp(arm.rotation.x,x,w);arm.rotation.y=T.MathUtils.lerp(mesh.userData.castPose[i][0],y,w);arm.rotation.z=T.MathUtils.lerp(mesh.userData.castPose[i][1],z,w);
 });
}
