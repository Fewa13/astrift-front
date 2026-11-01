// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const MOBILE_ENABLED=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const STORAGE='astrift.touchLayout.v1',AUTO_AIM_STORAGE='astrift.touchFireAutoAim.v1';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const paths={
 joystick:'<circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="6"/><path d="M24 3v6m0 30v6M3 24h6m30 0h6"/>',
 fire:'<circle cx="24" cy="24" r="14"/><circle cx="24" cy="24" r="5"/><path d="M24 3v10m0 22v10M3 24h10m22 0h10"/>',
 aim:'<path d="M8 17V8h9m14 0h9v9m0 14v9h-9m-14 0H8v-9M24 14v20m-10-10h20"/><circle cx="24" cy="24" r="7"/>',
 jump:'<path d="M24 38V8m-10 11L24 5l14 14M9 39h30"/>',
 prone:'<circle cx="9" cy="29" r="4"/><path d="M15 30h15l10 7M22 30l-6 8M5 41h38"/>',
 slide:'<circle cx="19" cy="11" r="4"/><path d="m20 17 8 10 12 4M28 27l-13 9H7m14-17-12 5M5 43h37"/>',
 phase:'<path d="m26 4-15 23h12l-2 17 17-25H25z"/>',
 phaseFlash:'<path d="m7 30 13-9 7 7-9 13zM23 18l6 6m2-17 2 9m4 5 8-1m-8-9 7-7"/>',
 throwable:'<path d="M20 12h10v6m-7-6V7h10l4 5M19 20c-13 9-9 23 6 23s19-14 6-23zM17 26h16m-18 8h20"/>',
 detonate:'<rect x="12" y="16" width="24" height="27" rx="5"/><path d="M24 16V5m-8 3 8-5 8 5"/><circle cx="24" cy="29" r="5"/>',
 reload:'<path d="M36 15a15 15 0 1 0 2 15M36 5v12H24"/>',
 tactical:'<path d="M18 8h12v10h10v12H30v10H18V30H8V18h10z"/>',
 interact:'<path d="M12 25V14a3 3 0 0 1 6 0v9-14a3 3 0 0 1 6 0v14-10a3 3 0 0 1 6 0v12-7a3 3 0 0 1 6 0v14c0 12-21 16-25 2l-5-8a3 3 0 0 1 5-3l7 7"/>',
 trainingSettings:'<circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="9"/><circle cx="24" cy="24" r="3"/><path d="M24 3v8m0 26v8M3 24h8m26 0h8"/>',
 supply:'<path d="M6 15h36v27H6zM4 8h40v7H4m20 0v27M16 25h16"/>',
 inspect:'<path d="M3 24s8-13 21-13 21 13 21 13-8 13-21 13S3 24 3 24"/><circle cx="24" cy="24" r="7"/>',
 pause:'<path d="M18 9v30m12-30v30"/>',
 zoom:'<circle cx="21" cy="21" r="13"/><path d="m31 31 12 12M21 14v14m-7-7h14"/>',
 weapon1:'<path d="M6 16h34v9H24l-6 13h-8l5-13H6zM33 25v10h7"/><path d="M23 9h4"/>',
 weapon2:'<path d="M6 16h34v9H24l-6 13h-8l5-13H6zM33 25v10h7"/><path d="M20 9h4m4 0h4"/>',
 sidearm:'<path d="M7 14h35v11H23l-7 16H7l6-16H7z"/>',
 knife:'<path d="m8 39 12-12m-5-4 11 11m-5-9L42 5c0 12-5 18-15 25M5 42l9-1-7-7z"/>',
 skill5:'<path d="m8 35 8-22 8 11 8-11 8 22z"/>',
 skill6:'<path d="M24 4S9 22 9 30a15 15 0 0 0 30 0C39 22 24 4 24 4"/>',
 skill7:'<path d="m24 4 16 6v14c0 10-16 20-16 20S8 34 8 24V10z"/>'
};
const names={joystick:'移动',fire:'开火',aim:'开镜',jump:'跳跃',prone:'趴下',slide:'滑铲',phase:'星际相位',phaseFlash:'相位闪',throwable:'投掷物',detonate:'引爆',reload:'换弹',tactical:'道具',interact:'交互',trainingSettings:'靶子设置',supply:'补给',inspect:'检视',pause:'暂停',zoom:'倍率',weapon1:'武器1',weapon2:'武器2',sidearm:'副武器',knife:'刀',skill5:'狂暴',skill6:'嗜血',skill7:'保护'};
const defaults={joystick:[14,75,124],fire:[87,61,78],aim:[78,43,64],jump:[94,80,56],prone:[77,82,52],slide:[67,81,54],phase:[64,60,58],phaseFlash:[58,43,52],throwable:[57,80,54],detonate:[89,35,56],reload:[89,17,46],tactical:[48,79,48],interact:[47,59,58],trainingSettings:[47,59,58],supply:[39,59,52],inspect:[59,18,42],pause:[96,10,42],zoom:[70,20,42],weapon1:[28,90,46],weapon2:[35,90,46],sidearm:[42,90,44],knife:[49,90,44],skill5:[37,42,50],skill6:[44,42,50],skill7:[51,42,50]};
export function initMobileControls(hooks){
  if(!MOBILE_ENABLED)return {update(){},openEditor(){},reset(){}};
  document.documentElement.classList.add('mobile-game');
  let layout=structuredClone(defaults);try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');for(const id of Object.keys(defaults))if(Array.isArray(saved?.[id])&&saved[id].length===3&&saved[id].every(Number.isFinite))layout[id]=[clamp(saved[id][0],0,100),clamp(saved[id][1],0,100),clamp(saved[id][2],36,180)]}catch{}
  let editing=false,selected='fire',lastUpdate=0,fireAutoAim=false;try{fireAutoAim=localStorage.getItem(AUTO_AIM_STORAGE)==='true'}catch{}
  const root=document.createElement('div');root.id='mobileControls';root.hidden=true;document.body.append(root);
  const toolbar=document.createElement('div');toolbar.className='touchEditorToolbar';toolbar.hidden=true;
  toolbar.innerHTML='<strong>按钮布局</strong><span id="touchSelected"></span><label>大小 <input id="touchSize" type="range" min="36" max="180" step="2"></label><button type="button" id="touchReset">恢复默认</button><button type="button" id="touchDone">完成</button>';
  const sensitivityRow=document.createElement('label');sensitivityRow.innerHTML='灵敏度 <input id="touchSensitivity" type="range" min="0.1" max="5" step="0.05" value="1"><output id="touchSensitivityValue">1.00</output>';toolbar.insertBefore(sensitivityRow,toolbar.querySelector('#touchReset'));
  const sensitivity=toolbar.querySelector('#touchSensitivity'),sensitivityValue=toolbar.querySelector('#touchSensitivityValue');sensitivity.oninput=()=>{sensitivityValue.textContent=hooks.setSensitivity(sensitivity.value).toFixed(2)};
  const autoAimRow=document.createElement('label');autoAimRow.className='touchAutoAimSetting';const autoAim=document.createElement('input');autoAim.type='checkbox';autoAim.id='touchFireAutoAim';autoAim.checked=fireAutoAim;autoAimRow.append(autoAim,document.createTextNode('开火自动开镜'));toolbar.insertBefore(autoAimRow,toolbar.querySelector('#touchReset'));autoAim.onchange=()=>{fireAutoAim=autoAim.checked;try{localStorage.setItem(AUTO_AIM_STORAGE,String(fireAutoAim))}catch{}};
  root.append(toolbar);const size=toolbar.querySelector('#touchSize'),buttons=new Map(),gestures=new Map();let lookId=null,lookX=0,lookY=0;
  const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(layout))}catch{}};
  function position(id){const el=buttons.get(id),[x,y,s]=layout[id],w=innerWidth,h=innerHeight,top=editing?toolbar.getBoundingClientRect().bottom:0,px=clamp(w*x/100,s/2+8,w-s/2-8),py=clamp(h*y/100,Math.min(top+s/2+8,h-s/2-8),h-s/2-8);el.style.left=`${px}px`;el.style.top=`${py}px`;el.style.width=el.style.height=`${s}px`;if(editing){layout[id][0]=px/w*100;layout[id][1]=py/h*100}}
  function select(id){selected=id;toolbar.querySelector('#touchSelected').textContent=names[id];size.value=layout[id][2];for(const [key,button] of buttons)button.classList.toggle('selected',editing&&key===id)}
  function finish(pointerId,cancel=false){const g=gestures.get(pointerId);if(!g)return;gestures.delete(pointerId);const el=buttons.get(g.id);el.classList.remove('pressed');if(g.edit){save();return}if(g.id==='joystick'){el.style.setProperty('--stick-x','0px');el.style.setProperty('--stick-y','0px');hooks.move(0,0,false)}else hooks.action(g.id,false,cancel)}
  function reset(){for(const id of [...gestures.keys()])finish(id,true);lookId=null;hooks.move(0,0,false);hooks.release()}
  for(const id of Object.keys(defaults)){
    const button=document.createElement('button');button.type='button';button.className='touchButton';button.dataset.action=id;button.setAttribute('aria-label',names[id]);button.innerHTML=`<svg viewBox="0 0 48 48" aria-hidden="true">${paths[id]}</svg><span>${names[id]}</span>${id==='joystick'?'<i class="touchStick"></i>':''}`;root.append(button);buttons.set(id,button);position(id);
    button.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(e.pointerType==='mouse'&&!editing)return;if([...gestures.values()].some(g=>g.id===id))return;if(!editing&&!hooks.state().available[id])return;button.setPointerCapture(e.pointerId);gestures.set(e.pointerId,{id,edit:editing,x:e.clientX,y:e.clientY,startX:layout[id][0],startY:layout[id][1]});button.classList.add('pressed');if(editing){select(id);return}if(id!=='joystick')hooks.action(id,true,false,fireAutoAim);});
    button.addEventListener('pointermove',e=>{const g=gestures.get(e.pointerId);if(!g)return;e.preventDefault();if(g.edit){layout[id][0]=clamp(g.startX+(e.clientX-g.x)/innerWidth*100,0,100);layout[id][1]=clamp(g.startY+(e.clientY-g.y)/innerHeight*100,0,100);position(id)}else if(id==='joystick'){const radius=layout[id][2]*.38,dx=e.clientX-g.x,dy=e.clientY-g.y,length=Math.hypot(dx,dy),scale=Math.max(radius,length);hooks.move(dx/scale,dy/scale,length>radius*.82);button.style.setProperty('--stick-x',`${dx/scale*radius}px`);button.style.setProperty('--stick-y',`${dy/scale*radius}px`)}else if(id==='fire'||id==='aim'){hooks.look(e.clientX-g.x,e.clientY-g.y);g.x=e.clientX;g.y=e.clientY}});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,e=>{e.preventDefault();finish(e.pointerId,type!=='pointerup')});
  }
  hooks.canvas.style.touchAction='none';
  hooks.canvas.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'||editing||lookId!==null||!hooks.state().look||e.clientX<innerWidth*.3)return;e.preventDefault();lookId=e.pointerId;lookX=e.clientX;lookY=e.clientY;hooks.canvas.setPointerCapture(e.pointerId)});
  hooks.canvas.addEventListener('pointermove',e=>{if(e.pointerId!==lookId)return;e.preventDefault();if(hooks.state().look)hooks.look(e.clientX-lookX,e.clientY-lookY);lookX=e.clientX;lookY=e.clientY});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])hooks.canvas.addEventListener(type,e=>{if(e.pointerId===lookId)lookId=null});
  size.oninput=()=>{layout[selected][2]=Number(size.value);position(selected);save()};
  toolbar.querySelector('#touchReset').onclick=()=>{layout=structuredClone(defaults);for(const id of buttons.keys())position(id);select(selected);save()};
  toolbar.querySelector('#touchDone').onclick=()=>{reset();editing=false;root.classList.remove('editing');toolbar.hidden=true;for(const button of buttons.values())button.classList.remove('selected');save();hooks.editor(false);lastUpdate=0;update(performance.now())};
  function openEditor(){reset();editing=true;root.hidden=false;root.classList.add('editing');toolbar.hidden=false;sensitivity.value=hooks.sensitivity();sensitivityValue.textContent=hooks.sensitivity().toFixed(2);for(const [id,button] of buttons){button.hidden=false;position(id)}select(selected);hooks.editor(true)}
  function update(now){if(editing||now-lastUpdate<80)return;lastUpdate=now;const state=hooks.state();root.hidden=!state.visible;if(!state.visible){if(gestures.size||lookId!==null)reset();return}for(const [id,button] of buttons){const show=!!state.available[id];if(!show){for(const [pointer,g] of gestures)if(g.id===id&&id!=='fire'&&id!=='aim'&&id!=='jump')finish(pointer,true)}button.hidden=!show;}}
  window.addEventListener('resize',()=>{reset();for(const id of buttons.keys())position(id)});window.addEventListener('blur',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});
  return {update,openEditor,reset};
}
