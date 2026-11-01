// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Rendering only: never throttle simulation, input, network or damage handling.
export function createFrameBudget({maxRatio=1,onChange=()=>{}}={}){
 let scale=1,last=0,start=0,total=0,count=0,bad=0,good=0,ratio=0;
 function apply(){const next=Math.round(Math.max(.65,maxRatio*scale)*100)/100;if(next!==ratio){ratio=next;onChange(ratio,scale<1)}return ratio}
 apply();
 return {sample(now,active=true){
  if(!active||!Number.isFinite(now)||!last||now-last>250||now<=last){last=now;start=now;total=count=bad=good=0;return ratio}
  total+=now-last;count++;last=now;if(now-start<1200)return ratio;
  const average=total/count;start=now;total=count=0;
  if(average>25){bad++;good=0}else if(average<18){good++;bad=0}else{bad=good=0}
  if(bad>=2){scale=Math.max(.55,scale-.15);bad=0;apply()}
  if(good>=8){scale=Math.min(1,scale+.10);good=0;apply()}
  return ratio;
 },reset(max){maxRatio=Math.max(.65,Number(max)||1);scale=1;last=start=total=count=bad=good=0;apply()},get ratio(){return ratio},get reduced(){return scale<1}};
}

export function installAdaptiveRender(renderer,{maxRatio=()=>1,active=()=>true,decorate=()=>{}}={}){
 const original=renderer.render;let cap=maxRatio(),lastDecorate=-Infinity;
 const budget=createFrameBudget({maxRatio:cap,onChange:(ratio,reduced)=>{
  if(renderer.getPixelRatio()!==ratio)renderer.setPixelRatio(ratio);
  if(renderer.shadowMap)renderer.shadowMap.enabled=!reduced&&!!renderer.userData?.requestedShadows;
 }});
 renderer.render=function(scene,camera){
  const now=performance.now(),requested=maxRatio();if(requested!==cap){cap=requested;budget.reset(cap)}
  budget.sample(now,active()&&!document.hidden);
  camera.userData.renderPressure=budget.reduced;
  if(now-lastDecorate>500){lastDecorate=now;decorate(camera,budget.reduced)}
  return original.call(this,scene,camera);
 };
 return budget;
}

// The FPS trim is cosmetic and has raycast disabled; leave all combat meshes alone.
export function updateFpsDetail(root,camera,reduced){
 const distance=root.position.distanceToSquared(camera.position),hide=distance>(reduced?18:38)**2;
 if(root.userData.trimHidden===hide)return;root.userData.trimHidden=hide;
 root.traverse(o=>{if(o.name==='fps-armour-detail'&&o.parent!==root.userData.helmetShell&&o.parent!==root.userData.helmetVisor&&o.parent!==root.userData.armorPlate)o.visible=!hide});
}
