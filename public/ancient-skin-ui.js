// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
import {ancientProfessionSkins,SKIN_COLORS,SKIN_RARITIES,DEFAULT_SKIN,SKIN_DRAW_COST,SKIN_DRAW_COUNT,SKIN_DRAW_WEIGHTS,skinFragmentCost,ownedAncientSkins,equippedAncientSkin} from './ancient-skins.js?v=20261111-skin-draw-1';
import {createAncientSkinModel} from './ancient-skin-model.js?v=20261111-skin-draw-1';

export function createAncientSkinUI(){
 let disposePreview=()=>{},selected='',receipt=null,receiptHost,receiptAccount;
 const el=(parent,tag,value='')=>{const node=document.createElement(tag);node.textContent=value;parent.append(node);return node;};
 function render(parent,{profile={},english=true,action,account,gallery=false,profession=profile.profession}={}){
  disposePreview();
  const lang=english?1:0,own=new Set(ownedAncientSkins(profile)),equipped=equippedAncientSkin(profile);
  const skins=ancientProfessionSkins(profession);
  selected||=equipped||DEFAULT_SKIN;
  el(parent,'h2',english?'Skins':'皮肤');
  if(!gallery){
   if(receiptAccount!==account){receiptAccount=account;receipt=null;}
   const banner=el(parent,'section');banner.className='ancientSkinDraw';
   const heading=el(banner,'div');heading.className='ancientSkinDrawHeading';
   const text=el(heading,'div');
   el(text,'strong',english?'Skin Draw':'皮肤抽奖');
   el(text,'p',english?`Get ${SKIN_DRAW_COUNT} fragments per draw`:`每次获得 ${SKIN_DRAW_COUNT} 块碎片`);
   const drawButton=el(heading,'button',(english?'Draw · ':'抽奖 · ')+SKIN_DRAW_COST+(english?' Gold':' 金币'));
   drawButton.type='button';drawButton.disabled=profile.coins<SKIN_DRAW_COST||own.size===skins.length;
   const odds=el(banner,'details');el(odds,'summary',english?'Fragment odds':'碎片概率');
   const pool=skins.filter(skin=>!own.has(skin.id));
   const total=pool.reduce((sum,skin)=>sum+SKIN_DRAW_WEIGHTS[skin.rarity],0);
   if(total)for(const [rarity,labels] of SKIN_RARITIES.entries()){
    const weight=pool.filter(skin=>skin.rarity===rarity).length*SKIN_DRAW_WEIGHTS[rarity];
    if(weight)el(odds,'span',labels[lang]+' '+(weight/total*100).toFixed(1)+'%').style.color=SKIN_COLORS[rarity];
   }
   receiptHost=el(banner,'div');receiptHost.className='ancientSkinDrawResults';receiptHost.setAttribute('aria-live','polite');
   const showReceipt=()=>{
    if(!receiptHost?.isConnected)return;
    receiptHost.replaceChildren();
    for(const [id,count] of Object.entries(receipt||{})){
     const skin=skins.find(skin=>skin.id===id);if(!skin)continue;
     const chip=el(receiptHost,'span',(english?skin.en:skin.zh)+' × '+count);
     chip.style.setProperty('--skin-color',SKIN_COLORS[skin.rarity]);
    }
   };
   showReceipt();
   drawButton.onclick=async()=>{
    drawButton.disabled=true;
    try{const result=await action('drawSkinFragments');if(result?.fragments&&receiptAccount===account){receipt=result.fragments;showReceipt();}}
    finally{if(drawButton.isConnected)drawButton.disabled=false;}
   };
  }
  const layout=el(parent,'div');layout.className='ancientSkinLayout';
  const list=el(layout,'div');list.className='ancientSkinList';
  const panel=el(layout,'section');panel.className='ancientSkinPreview';
  const stage=el(panel,'div');stage.className='ancientSkinStage';
  const caption=el(panel,'div');caption.className='ancientSkinCaption';
  const canvas=el(stage,'canvas');canvas.setAttribute('aria-label',english?'3D skin preview':'皮肤 3D 预览');canvas.tabIndex=0;
  let renderer;
  try{renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true});}
  catch{canvas.remove();el(stage,'p',english?'3D preview unavailable':'无法打开 3D 预览');}
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,30);
  scene.add(new T.HemisphereLight(0xffe8c9,0x536284,2));
  const key=new T.DirectionalLight(0xffead6,2.5);key.position.set(3,6,-4);scene.add(key);
  const rim=new T.DirectionalLight(0x9fe7ff,1.8);rim.position.set(-3,2,4);scene.add(rim);
  let actor,azimuth=Math.PI,elevation=.13,distance=4.7,drag=null;
  function draw(){
   if(!renderer||!actor||!stage.clientWidth||!stage.clientHeight)return;
   const width=stage.clientWidth,height=stage.clientHeight;
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(width,height,false);
   camera.aspect=width/height;camera.updateProjectionMatrix();
   camera.position.set(Math.sin(azimuth)*distance,1.07+Math.sin(elevation)*distance,Math.cos(azimuth)*distance);
   camera.lookAt(0,1.07,0);renderer.render(scene,camera);
  }
  const observer=new ResizeObserver(draw);observer.observe(stage);
  disposePreview=()=>{observer.disconnect();renderer?.dispose();renderer?.forceContextLoss();disposePreview=()=>{};};
  canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY};};
  canvas.onpointermove=e=>{
   if(drag?.id!==e.pointerId)return;
   azimuth-=(e.clientX-drag.x)*.012;elevation=T.MathUtils.clamp(elevation+(e.clientY-drag.y)*.009,-.45,.7);
   drag.x=e.clientX;drag.y=e.clientY;draw();
  };
  canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=()=>{drag=null;};
  canvas.onwheel=e=>{e.preventDefault();distance=T.MathUtils.clamp(distance+e.deltaY*.003,3.2,7);draw();};
  canvas.onkeydown=e=>{
   if(!['ArrowLeft','ArrowRight'].includes(e.key))return;
   e.preventDefault();azimuth+=e.key==='ArrowLeft'?.2:-.2;draw();
  };
  const buttons=[];
  function pick(skin){
   selected=skin.id;
   for(const [button,item] of buttons)button.setAttribute('aria-pressed',String(item.id===selected));
   caption.replaceChildren();caption.style.setProperty('--skin-color',SKIN_COLORS[skin.rarity]);
   el(caption,'small',SKIN_RARITIES[skin.rarity][lang]);el(caption,'strong',english?skin.en:skin.zh);
   if(!gallery){
    const unlocked=own.has(skin.id),worn=skin.id===equipped;
    if(unlocked){
     const equip=el(caption,'button',worn?(english?'Equipped':'已装备'):(english?'Equip':'装备'));
     equip.type='button';equip.disabled=worn;equip.onclick=()=>void action('equipSkin',{id:skin.id});
    }else{
     const count=profile.ancientSkinFragments?.[skin.id]||0,cost=skinFragmentCost(skin.rarity);
     el(caption,'span',(english?'Fragments ':'碎片 ')+count+' / '+cost);
     const progress=el(caption,'progress');progress.max=cost;progress.value=count;
     progress.setAttribute('aria-label',english?'Fragment progress':'碎片进度');
     const unlock=el(caption,'button',english?'Unlock':'解锁');
     unlock.type='button';unlock.disabled=count<cost;unlock.onclick=()=>void action('unlockSkin',{id:skin.id});
    }
   }
   if(actor)scene.remove(actor);
   actor=createAncientSkinModel(skin.id,profession);scene.add(actor);draw();
  }
  for(const [rarity,labels] of SKIN_RARITIES.entries()){
   const group=el(list,'section');group.style.setProperty('--skin-color',SKIN_COLORS[rarity]);
   el(group,'h3',labels[lang]);
   for(const skin of skins.filter(item=>item.rarity===rarity)){
    const button=el(group,'button',english?skin.en:skin.zh);button.type='button';
    if(!gallery)el(button,'small',skin.id===equipped?(english?'Equipped':'已装备'):own.has(skin.id)?'✓':'🔒');
    button.onclick=()=>pick(skin);buttons.push([button,skin]);
   }
  }
  pick(skins.find(skin=>skin.id===selected)||skins[0]);
 }
 return {render,dispose(){disposePreview();}};
}
