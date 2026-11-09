// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {formatAncientHints,ancientKeyLabel} from './ancient-input-settings.js';
import * as T from './three.module.js';
import {BLIGHT_CRYSTALS,blightHeight} from './ancient-blight.js?v=20261012-new-player-flow-1';
export function createBlightUI({scene,camera,getMap,getPlayer,getQuest,en,send,clear}){
 const L=(zh,eng)=>formatAncientHints(en()?eng:zh,en()),hud=document.createElement('button'),badge=document.createElement('div'),ray=new T.Vector3();hud.className='ancientBlightInteract';badge.className='ancientCorruptionBadge';document.getElementById('ancientHud').append(hud,badge);let ready={},target=null,last=0;const effects=[];
 function effect(d){while(effects.length>=8){const old=effects.shift();scene.remove(old.mesh);old.mesh.geometry.dispose();old.mesh.material.dispose()}const points=Array.from({length:9},(_,i)=>{const t=i/8;return new T.Vector3(d.x+(d.source.x-d.x)*t,d.y+(d.source.y-d.y)*t+Math.sin(t*Math.PI)*.2,d.z+(d.source.z-d.z)*t)}),mesh=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:0xdab3ff,transparent:true,opacity:1,depthWrite:false}));scene.add(mesh);effects.push({mesh,until:performance.now()+500})}

 const defend=()=>getQuest()?.kind==='defend'&&Math.hypot(camera.position.x,camera.position.z-275)<5;
 function absorb(){if(getMap()!=='blight'||getPlayer()?.hp<=0||!target||performance.now()-last<500)return false;last=performance.now();camera.getWorldDirection(ray);send({type:'absorbCrystal',id:target.id,direction:ray.toArray()});return true}
 function interact(){if(getMap()!=='blight'||!defend())return false;send({type:'blightDefend'});return true}
 hud.onclick=()=>{if(defend())interact();else absorb()};
 function update(active,paused){for(let i=effects.length-1;i>=0;i--){const e=effects[i],t=(e.until-performance.now())/500;if(t<=0||!active){scene.remove(e.mesh);e.mesh.geometry.dispose();e.mesh.material.dispose();effects.splice(i,1)}else e.mesh.material.opacity=t}const p=getPlayer();badge.hidden=!active||!p?.corrupted||p.hp<=0;badge.textContent=L('魔化 · 伤害 +30% · 可与其他玩家互相攻击','CORRUPTED · Damage +30% · Player combat enabled');hud.hidden=true;target=null;if(!active||paused||getMap()!=='blight'||!p||p.hp<=0)return;camera.getWorldDirection(ray);target=BLIGHT_CRYSTALS.filter(c=>(ready[c.id]||0)<=Date.now()&&Math.hypot(c.x-camera.position.x,c.z-camera.position.z)<4).find(c=>{const v=new T.Vector3(c.x,blightHeight(c.x,c.z)+1.3,c.z).sub(camera.position);return ray.dot(v.normalize())>.88&&clear(camera.position.x,camera.position.y,camera.position.z,c.x,blightHeight(c.x,c.z)+1.3,c.z)});if(defend()){hud.hidden=false;hud.textContent=p.defenseUntil?L('净化中 · ','Cleansing · ')+Math.max(0,Math.ceil((p.defenseUntil-Date.now())/1000))+'s':L('F · 启动净化防守','F · Start purifier defense')}else if(target){hud.hidden=false;hud.textContent=L('右键 · 吸收魔化结晶（有概率魔化）','Right-click · Absorb Blight Crystal (may corrupt you)')}}
 return {absorb,interact,update,effect,state(data){ready=data||{}}};
}
let fogGeometry,fogMaterial;
function createCorruptionFog(){
 if(!fogGeometry){
  fogGeometry=new T.BufferGeometry();
  fogGeometry.setAttribute('position',new T.Float32BufferAttribute(Array.from({length:24},(_,i)=>i%3===1?(Math.floor(i/3)+.5)/8:0),3));
  fogMaterial=new T.ShaderMaterial({
   transparent:true,depthWrite:false,uniforms:{clock:{value:0}},
   vertexShader:`
    uniform float clock;
    varying float density;
    void main(){
     float phase=position.y;
     float life=fract(clock*.42+phase);
     float angle=phase*41.0+clock*.72;
     float radius=.42+.38*life;
     vec3 offset=vec3(cos(angle)*radius,.35+life*1.4,sin(angle)*radius);
     vec4 viewPosition=modelViewMatrix*vec4(offset,1.);
     gl_Position=projectionMatrix*viewPosition;
     gl_PointSize=clamp(360./max(1.,-viewPosition.z),5.,90.);
     density=sin(life*3.14159)*smoothstep(.65,1.6,-viewPosition.z);
    }`,
   fragmentShader:`
    varying float density;
    void main(){
     vec2 uv=gl_PointCoord-.5;
     float cloud=1.-smoothstep(.06,.5,length(uv)+.025*sin(uv.x*28.)*cos(uv.y*24.));
     gl_FragColor=vec4(.025,.017,.034,cloud*density*.48);
    }`,
  });
 }
 const fog=new T.Points(fogGeometry,fogMaterial);fog.frustumCulled=false;
 fog.onBeforeRender=()=>{fogMaterial.uniforms.clock.value=performance.now()/1000;};
 return fog;
}
export function tintCorrupted(mesh,corrupted){
 const fog=mesh.userData.corruptionFog;
 if(!corrupted){if(fog){fog.removeFromParent();delete mesh.userData.corruptionFog;}return;}
 if(fog)return;
 mesh.userData.corruptionFog=createCorruptionFog();
 mesh.add(mesh.userData.corruptionFog);
}
