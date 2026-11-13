// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from '../public/three.module.js';
import {buildAncientScene,buildForestScene,createAncientCreature,animateCreature} from '../public/ancient-scene.js';
import {buildCityScene} from '../public/ancient-city-scene.js';
import {buildBlightScene} from '../public/ancient-blight-scene.js';
import {buildSanctumScene} from '../public/ancient-sanctum-scene.js';
import {buildDistinctStarfall,buildDistinctSkyreach,buildDistinctFrostcourt,buildDunesScene} from '../public/ancient-chapter-worlds.js';
import {buildTowerScene} from '../public/ancient-tower-scene.js';
import {createPuzzleMap} from '../public/ancient-puzzle-map.js';
import {createAncientMagicFX} from '../public/ancient-spell-fx.js';
import {slideAncientMove} from '../public/ancient-control-feel.js';
import {ancientMapHeight,blocked,newAncientProfile,ANCIENT_POTIONS,ANCIENT_KINDS} from '../public/ancient-rules.js';
import {ANCIENT_SUPPLIES,useAncientSupply,supplyKey} from '../public/ancient-commerce.js';
import {BOSS_CARDS,useBossCard,bossCardKey,bossFormStats} from '../public/ancient-boss-cards.js';
import {ancientProfessionSkins} from '../public/ancient-skins.js';
import {createAncientSkinModel} from '../public/ancient-skin-model.js';
import {PROFESSIONS,SKILLS,skillRadius} from '../public/ancient-skills.js';
import {castAncientSkill,tickAncientSkills} from '../src/ancient-skill-combat.ts';
import {ancientBaseAttack,ancientProfileHealth,GEAR,rollGearItem} from '../public/ancient-gear.js';
import {FOREST_ALTARS} from '../public/ancient-forest.js';
import {chapterProjection,CHAPTER_ROUTES} from '../public/ancient-geography.js';
import {towerRunes,towerRuneAligned,turnTowerRune} from '../public/ancient-dungeon.js';
import {towerEnemy} from '../src/ancient-tower.ts';
import {newPuzzleState,puzzleView,puzzleOperate} from '../src/ancient-puzzle.ts';

const $=id=>document.getElementById(id),panel=$('panel'),menu=$('menu'),hud=$('hud');
const saveKey='Astrift-DevBuildAncient.save.1',activationKey='Astrift-DevBuildAncient.activation.1';
let saved={};
try{saved=JSON.parse(localStorage.getItem(saveKey)||'{}')||{};}catch{}
const profile=Object.assign(newAncientProfile(),{level:1,profession:'warrior',skills:{}},saved.profile);
const defaults={level:1,skillLevel:1,holy:false,skin:'wanderer',title:'',tower:1,puzzle:newPuzzleState()};
const state={...defaults,...saved.state};
const save=()=>localStorage.setItem(saveKey,JSON.stringify({profile,state}));
let towerRun,held;
let scene,camera,renderer,world,magic,actor,preview,puzzle,frame=0,worldId='',last=0,yaw=0,pitch=0,vy=0,mobs=[],message='',lastAttack=0,formUntil=0;
const keys=new Set();
const maps={
 tribe:['部落',buildAncientScene,Infinity,'grox','lord'],
 forest:['森林',buildForestScene,Infinity,'mossling','crystal_fire'],
 city:['失落王城',buildCityScene,168,'city_guard'],
 blight:['裂隙深谷',buildBlightScene,180,'blight_beast'],
 sanctum:['净界圣域',buildSanctumScene,180,'sanctum_sentinel'],
 starfall:['沉星遗迹',buildDistinctStarfall,Infinity,'tide_carapace'],
 frostcourt:['霜火宫廷',buildDistinctFrostcourt,Infinity,'frost_oathguard'],
 skyreach:['寂雷天穹',buildDistinctSkyreach,Infinity,'sky_lancer'],
 dunes:['暮沙迷城',buildDunesScene,Infinity,'dune_scarab'],
};
const node=(tag,text,parent=panel)=>{const item=document.createElement(tag);if(text)item.textContent=text;parent.append(item);return item;};
function button(text,fn,parent=panel){const b=node('button',text,parent);b.type='button';b.onclick=fn;return b;}
function select(title,options,value,change){
 const label=node('label',title),control=node('select','',label);
 for(const [key,name] of options){const option=node('option',name,control);option.value=key;}
 control.value=value;control.onchange=()=>change(control.value);return control;
}
function number(title,key,max){
 const label=node('label',title),input=node('input','',label);input.type='number';input.min=1;input.max=max;input.value=state[key];
 input.onchange=()=>{state[key]=Math.max(1,Math.min(max,Math.floor(Number(input.value)||1)));applyProfile();input.value=state[key];};
}
function applyProfile(){
 profile.level=state.level;
 profile.skills=Object.fromEntries(PROFESSIONS[profile.profession].skills.map(id=>[id,state.skillLevel]));
 profile.ascension={jobs:{[profile.profession]:{holy:state.holy}}};
 if(actor){actor.boosts={...profile.boosts};actor.skillRuntime=undefined;actor.maxHp=ancientProfileHealth(profile);actor.hp=actor.maxHp;}
 save();
}
function openMenu(){
 menu.hidden=false;keys.clear();if(document.pointerLockElement)document.exitPointerLock();panel.replaceChildren();node('h1','Astrift-DevBuildAncient');node('p','单人生日版 · ∞ 金币');
 if(worldId)button('继续',()=>resume());
 for(const [id,[name]] of Object.entries(maps))button(name,()=>enter(id));
 button('试炼塔',()=>enter('tower'));button('密室',()=>enterPuzzle());
 for(const text of ['创建地图','社区地图','排行榜'])button(text,()=>{}).disabled=true;
 node('h2','测试面板');number('角色等级 ', 'level',300);number('技能等级 ','skillLevel',30);
 select('职业 ',Object.entries(PROFESSIONS).map(([id,d])=>[id,d.name]),profile.profession,id=>{profile.profession=id;state.skin='wanderer';applyProfile();openMenu();});
 select('技能形态 ',[['false','普通'],['true','圣级']],String(state.holy),v=>{state.holy=v==='true';applyProfile();});
 select('皮肤 ',ancientProfessionSkins(profile.profession).map(s=>[s.id,s.zh]),state.skin,v=>{state.skin=v;save();showSkin();});
 select('称号 ',[['','无'],['king','解密之王'],['master','解密大师'],['expert','解密高手']],state.title,v=>{state.title=v;save();});
 const skinCanvas=node('canvas');skinCanvas.style.cssText='width:150px;height:170px';preview=skinCanvas;showSkin();
 node('h2','免费商店与消耗品');
 select('装备 ',[['','选择装备'],...Object.entries(GEAR).map(([id,gear])=>[id,gear.name||gear.en||id])],'',id=>{
  if(!id)return;
  const gear=GEAR[id],item=profile.gear.find(v=>v.key===id)||rollGearItem(id);
  if(!profile.gear.includes(item))profile.gear.push(item);
  (profile.gearEquipped??={})[gear.slot]=item.id;
  applyProfile();notice('已免费装备 '+(gear.name||gear.en||id));
 });
 select('血瓶 ',[['','选择血瓶'],...Object.entries(ANCIENT_POTIONS).map(([id,p])=>[id,p.name])],'',id=>{
  if(id&&actor){actor.hp=Math.min(actor.maxHp,actor.hp+ANCIENT_POTIONS[id].heal);message='已使用血瓶';}
 });
 select('变身卡 ',[['','选择变身卡'],...Object.keys(BOSS_CARDS).map(id=>[id,ANCIENT_KINDS[id]?.name||id])],'',id=>{
  if(!id||!actor)return;
  profile.materials[bossCardKey(id)]=1;
  const issue=useBossCard(profile,actor,id);
  if(issue){notice(issue);return;}
  formUntil=performance.now()+60000;actor.hp=ancientProfileHealth(profile)*(1+BOSS_CARDS[id].health);
  actor.maxHp=actor.hp;notice('变身卡已启用');
 });
 select('消耗品 ',[['','选择消耗品'],...Object.entries(ANCIENT_SUPPLIES).map(([id,p])=>[id,p.name])],'',id=>{
  if(!id)return;
  const key=supplyKey(id);
  if(ANCIENT_SUPPLIES[id].kind==='boost'){
   profile.materials[key]=1;useAncientSupply(profile,id);
   if(actor)actor.boosts={...profile.boosts};notice('药水效果已启用');
  }else{profile.materials[key]=(profile.materials[key]||0)+999;notice('已领取 999 件，可重复领取');}
  save();
 });
 node('output',message).id='menuNote';
}
function notice(text){message=text;if($('menuNote'))$('menuNote').textContent=text;}
let skinRenderer;
function showSkin(){
 if(!preview)return;
 // Reuse a single WebGL context for the actual skin preview.
 if(!skinRenderer)skinRenderer=new T.WebGLRenderer({alpha:true,antialias:false});
 skinRenderer.setSize(150,170);const s=new T.Scene(),c=new T.PerspectiveCamera(34,150/170,.1,20);
 c.position.set(2,1.35,-4.2);c.lookAt(0,1.1,0);s.add(new T.HemisphereLight(0xffffff,0x7c5541,2.3));
 s.add(createAncientSkinModel(state.skin,profile.profession));skinRenderer.render(s,c);
 preview.getContext('2d').drawImage(skinRenderer.domElement,0,0,preview.width,preview.height);
}
function cleanup(){
 cancelAnimationFrame(frame);puzzle?.dispose?.();puzzle=null;magic?.clear();world?.dispose?.();scene?.clear();renderer?.dispose();renderer=null;$('game').replaceChildren();keys.clear();worldId='';
}
function resize(){if(!renderer||!camera)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
function atLimit(x,z){
 const route=CHAPTER_ROUTES[worldId];
 return route?chapterProjection(worldId,x,z).u>route.at(-1)[0]*.30:z>(maps[worldId]?.[2]??Infinity);
}
function ground(x,z,feet){return worldId==='tower'?0:ancientMapHeight(worldId,x,z,feet);}
function solid(x,z,r,feet){return atLimit(x,z)||(worldId==='tower'?Math.abs(x)>19||z<2||z>45:blocked(x,z,r,worldId,feet));}
function addBarrier(){
 const route=CHAPTER_ROUTES[worldId],end=route?route.at(-1)[0]*.30:maps[worldId][2];
 if(!Number.isFinite(end))return;
 let x=0,z=end,angle=0,width=100;
 if(route){
  let i=1;while(route[i][0]<end)i++;
  const a=route[i-1],b=route[i],t=(end-a[0])/(b[0]-a[0]);x=T.MathUtils.lerp(a[1],b[1],t);z=T.MathUtils.lerp(a[2],b[2],t);angle=Math.atan2(b[1]-a[1],b[2]-a[2]);width=2*T.MathUtils.lerp(a[3],b[3],t)+4;
 }
 const wall=new T.Mesh(new T.PlaneGeometry(width,18),new T.MeshBasicMaterial({color:0x90c9ff,opacity:.32,transparent:true,side:T.DoubleSide,depthWrite:false}));
 wall.position.set(x,ground(x,z)+7,z);wall.rotation.y=angle;scene.add(wall);
}
function spawn(kind,level,x,z,boss=false){
 if(solid(x,z,1.4,ground(x,z)))return;
 const model=createAncientCreature(kind,level),maxHp=Math.max(100,ancientBaseAttack(level)*(boss?22:5));
 model.position.set(x,ground(x,z),z);scene.add(model);
 mobs.push({id:String(mobs.length),kind,x,z,homeX:x,homeZ:z,hp:maxHp,maxHp,model,boss,level,action:'idle',attackAt:0});
}
function populate(){
 mobs=[];
 if(worldId==='tower'){const e=towerEnemy(state.tower);spawn(e.kind,e.level,0,29,e.boss);return;}
 const [, ,limit,kind,boss]=maps[worldId];
 if(worldId==='forest'){
  for(let i=0;i<30;i++){const z=i<12?38+i*9:i<19?153+(i%5)*6:220+(i-19)*13;spawn(i<12?kind:i<19?'thorn':'sentinel',30+i,i<19?Math.sin(i*2.4)*19:83+Math.sin(i)*32,z);}
  for(const altar of FOREST_ALTARS)spawn('crystal_'+altar.element,65,altar.x,altar.z,true);
 }else{
  const route=CHAPTER_ROUTES[worldId],end=route?route.at(-1)[0]*.28:Math.min(limit-12,570);
  for(let i=0;i<28;i++){
   const distance=26+i/28*(end-26),x=Math.sin(i*2.4)*13;
   if(route){
    let j=1;while(route[j][0]<distance)j++;
    const a=route[j-1],b=route[j],t=(distance-a[0])/(b[0]-a[0]);spawn(kind,profile.level,T.MathUtils.lerp(a[1],b[1],t)+x,T.MathUtils.lerp(a[2],b[2],t));
   }else spawn(worldId==='tribe'&&i>10&&i%2?'hunter':kind,worldId==='tribe'?1+Math.floor(i*.8):profile.level,x,distance);
  }
  if(boss){spawn('chief',23,0,270,true);spawn(boss,30,0,555,true);}
 }
}
function enter(id){
 cleanup();worldId=id;scene=new T.Scene();scene.background=new T.Color(0x839aa8);scene.fog=new T.FogExp2(0x839aa8,.006);
 scene.add(new T.HemisphereLight(0xdce9ff,0x504335,1.6));const sun=new T.DirectionalLight(0xffe0b7,2);sun.position.set(-18,40,-10);scene.add(sun);
 camera=new T.PerspectiveCamera(75,1,.05,190);yaw=Math.PI;pitch=0;vy=0;
 renderer??=new T.WebGLRenderer({antialias:false});renderer.setPixelRatio(Math.min(1,devicePixelRatio));$('game').append(renderer.domElement);resize();
 world=id==='tower'?buildTowerScene(scene):maps[id][1](scene);magic=createAncientMagicFX(scene,name=>{const m=mobs.find(m=>'@monster:'+m.id===name);return m&&{...m,y:ground(m.x,m.z)};},camera);
 applyProfile();actor={name:'devbuild',x:0,y:ground(0,10)+1.7,z:10,hp:ancientProfileHealth(profile),maxHp:ancientProfileHealth(profile),weapon:profile.weapons[0]};
 camera.position.set(actor.x,actor.y,actor.z);camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);
 if(id!=='tower')addBarrier();else{
  towerRun={tower:{floor:state.tower,runes:state.towerRunes||[]}};world.sync(towerRun);
 }
 held=new T.Mesh(new T.BoxGeometry(.085,.68,.09),new T.MeshStandardMaterial({color:0xb7c6cd,metalness:.55,roughness:.36}));
 held.position.set(.48,-.36,-.86);held.rotation.z=-.23;camera.add(held);scene.add(camera);
 populate();last=performance.now();resume();frame=requestAnimationFrame(loop);
}
function resume(){menu.hidden=true;hud.hidden=false;$('cross').hidden=worldId==='puzzle';(worldId==='puzzle'?$('game').querySelector('canvas'):renderer?.domElement)?.requestPointerLock?.();}
function damage(m,amount){
 const n=Math.min(m.hp,Math.max(0,Math.floor(amount)));if(!n)return 0;
 m.hp-=n;message=m.kind+' · −'+n.toLocaleString();
 if(!m.hp){m.model.visible=false;m.deadAt=performance.now();message='击败 '+m.kind;}
 return n;
}
function context(){
 const map=worldId==='tower'?'tribe':worldId;
 return {map,monsters:mobs,canMove:(_,__,x,z)=>!solid(x,z,.6,ground(x,z)),damage,fx:(id,x,z,radius,extra)=>magic.effect({id,x,z,radius,holy:state.holy,...extra},ground)};
}
function useSkill(key){
 const id=PROFESSIONS[profile.profession].skills.find(id=>SKILLS[id].key===key);
 if(!id)return;
 const direction=camera.getWorldDirection(new T.Vector3()).toArray();
 const error=castAncientSkill(actor,profile,id,direction,context(),Date.now());
 if(error)message=error;
 camera.position.set(actor.x,actor.y,actor.z);
}
function attack(){
 const now=performance.now();if(now-lastAttack<260||actor.hp<=0)return;lastAttack=now;
 const dir=camera.getWorldDirection(new T.Vector3());
 const target=mobs.filter(m=>m.hp>0&&Math.hypot(m.x-actor.x,m.z-actor.z)<5.3&&dir.dot(new T.Vector3(m.x-actor.x,.5,m.z-actor.z).normalize())>.44).sort((a,b)=>Math.hypot(a.x-actor.x,a.z-actor.z)-Math.hypot(b.x-actor.x,b.z-actor.z))[0];
 if(target)damage(target,ancientBaseAttack(profile.level)*(formUntil>now?3:1.4));
}
function loop(t){
 frame=requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;
 if(document.hidden||!menu.hidden)return;
 const forward=Number(keys.has('KeyW'))-Number(keys.has('KeyS')),side=Number(keys.has('KeyD'))-Number(keys.has('KeyA')),speed=(keys.has('ShiftLeft')?9:6)*(1+(bossFormStats(actor)?.speed||0))*dt/Math.max(1,Math.hypot(forward,side));
 const next=slideAncientMove(actor,(-Math.sin(yaw)*forward+Math.cos(yaw)*side)*speed,(-Math.cos(yaw)*forward-Math.sin(yaw)*side)*speed,solid,ground);
 Object.assign(actor,next);vy-=19*dt;actor.y+=vy*dt;const floor=ground(actor.x,actor.z,actor.y-1.7)+1.7;
 if(actor.y<=floor){actor.y=floor;vy=keys.has('Space')?6:0;}
 tickAncientSkills(actor,profile,context(),dt,Date.now());
 camera.position.set(actor.x,actor.y,actor.z);camera.rotation.set(pitch,yaw,0);
 for(const m of mobs){
  if(!m.hp){if(worldId!=='tower'&&t-m.deadAt>15000){m.hp=m.maxHp;m.x=m.homeX;m.z=m.homeZ;m.model.visible=true;}continue;}
  const dx=actor.x-m.x,dz=actor.z-m.z,dist=Math.hypot(dx,dz);
  m.action=dist<3?'attack':dist<20?'walk':'idle';
  if(dist<20)m.model.rotation.y=Math.atan2(-dx,-dz);
  if(dist>2.3&&dist<20){const x=m.x+dx/dist*dt*3,z=m.z+dz/dist*dt*3;if(!solid(x,z,.55,ground(x,z))){m.x=x;m.z=z;}}
  if(dist<2.5&&t>=m.attackAt){m.attackAt=t+1300;m.actionAt=Date.now();actor.hp=Math.max(0,actor.hp-Math.max(1,ancientBaseAttack(m.level)*.15*(1-(bossFormStats(actor)?.reduction||0))));}
  m.model.position.set(m.x,ground(m.x,m.z),m.z);animateCreature(m.model,m,t,dt);
 }
 if(actor.hp<=0){formUntil=0;actor.hp=actor.maxHp;actor.x=0;actor.z=10;actor.y=ground(0,10)+1.7;message='已复活';}
 const tower=worldId==='tower';
 held.rotation.z=-.23-Math.max(0,1-(t-lastAttack)/260)*.9;
 hud.textContent=(tower?'试炼塔 '+state.tower+' 层':maps[worldId][0])+' · Lv.'+profile.level+' · HP '+Math.ceil(actor.hp).toLocaleString()+' / '+actor.maxHp.toLocaleString()+' · ∞ 金币'+(state.title?' · '+({king:'解密之王',master:'解密大师',expert:'解密高手'})[state.title]:'')+(formUntil>t?' · 变身 '+Math.ceil((formUntil-t)/1000)+'s':'')+' · '+(tower&&mobs.every(m=>!m.hp)?'按 F 转动符文／前往下一层':message)+' · Esc 菜单';
 world.update?.(t);magic.update(t,dt);renderer.render(scene,camera);
}
function enterPuzzle(){
 cleanup();worldId='puzzle';const canvas=document.createElement('canvas');$('game').append(canvas);
 puzzle=createPuzzleMap(canvas,()=> 'DevBuild',()=>false,index=>{
  const result=puzzleOperate(state.puzzle,{control:'activate',index,floor:state.puzzle.floor,revision:state.puzzle.revision},Date.now());state.puzzle=result.state;save();paintPuzzle();
 });
 paintPuzzle();resume();
}
function paintPuzzle(){
 const view=puzzleView(state.puzzle,Date.now());puzzle.sync?.({...view,players:[]});
 hud.textContent='密室 · '+(view.complete?'已通关':view.floor+' 层')+' · F 交互 · Esc 菜单';
}
window.addEventListener('resize',resize);
document.addEventListener('pointerlockchange',()=>{if(worldId&&!document.pointerLockElement&&menu.hidden)openMenu();});
document.addEventListener('mousemove',e=>{if(document.pointerLockElement&&menu.hidden&&worldId!=='puzzle'){yaw-=e.movementX*.002;pitch=T.MathUtils.clamp(pitch-e.movementY*.002,-1.52,1.52);}});
document.addEventListener('keydown',e=>{
 if(e.code==='Escape'&&worldId&&menu.hidden){openMenu();return;}
 if(!menu.hidden||!worldId||worldId==='puzzle')return;
 keys.add(e.code);if(e.repeat)return;
 if(['KeyQ','KeyZ','KeyC','KeyX'].includes(e.code))useSkill(e.code.slice(3));
 if(e.code==='KeyF'&&worldId==='tower'){
  const runes=towerRunes(state.tower),index=runes.findIndex(r=>Math.hypot(r.x-actor.x,r.z-actor.z)<3);
  if(index>=0&&turnTowerRune(towerRun.tower,state.tower,index,actor.x,actor.z)){
   state.towerRunes=towerRun.tower.runes;world.sync(towerRun);save();
  }
  if(!mobs.length||mobs.some(m=>m.hp>0)||!runes.every((r,i)=>towerRuneAligned(towerRun.tower.runes[i],r.target)))return;
  if(state.tower<100){state.tower++;state.towerRunes=[];save();enter('tower');}
  else{message='试炼塔已通关';openMenu();}
 }
});
document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());
document.addEventListener('mousedown',e=>{if(e.button===0&&menu.hidden&&worldId&&worldId!=='puzzle'){if(document.pointerLockElement)attack();else resume();}});
function activate(){
 node('h1','Astrift-DevBuildAncient');node('p','首次兑换需要联网。兑换完成后可在此浏览器离线游玩。');
 const form=node('form'),code=node('input','',form),submit=node('button','兑换',form),output=node('output');
 code.placeholder='输入一次性游玩码';code.required=true;
 form.onsubmit=async e=>{
  e.preventDefault();submit.disabled=true;
  try{
   const response=await fetch('https://play.astrift.com/api/devbuild/redeem',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:code.value.trim()})});
   const data=await response.json();if(!data.activation)throw Error(data.error||'兑换失败');
   localStorage.setItem(activationKey,data.activation);applyProfile();openMenu();
  }catch(error){output.textContent=error.message;}finally{submit.disabled=false;}
 };
}
if(localStorage.getItem(activationKey)){applyProfile();openMenu();}else activate();
