// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {t,initLanguage,setNameProvider,setLocalizedText} from './i18n.js?v=20261008-onboarding-1';
import {initTutorial} from './tutorial.js?v=20261026-admin-1';
import {buildTutorialWorld} from './tutorial-world.js?v=20261008-onboarding-1';
import {MOBILE_ENABLED,initMobileControls} from './mobile-controls.js?v=20261024-fire-auto-ads-1';
import {loadSensitivity,saveSensitivity,lookMultiplier} from './look-sensitivity.js?v=20261006-touch-editor-3';
import {createTowerSurvival,towerMap,TOWER_HEIGHT,TOWER_LIMIT} from './tower-survival.js?v=20261006-touch-editor-3';
import * as THREE from "./three.module.js?v=0.180.0";
import {dressFpsActor} from './fps-actor-model.js?v=20261015-armour-1';
import {installAdaptiveRender,updateFpsDetail} from './adaptive-render.js?v=20261015-budget-1';
import {organizeAttachments,migrateBuilds} from "./attachment-layout.js?v=20260923-perf";
import {QUALITY,batchStaticScene,disposeObject,createEffects} from "./render-performance.js?v=20261004-online-fps-1";
import {createMatch,tickMatch,carrierFlag,botGoal,BASES,HILLS} from './objective-rules.js?v=1';
import {BOMB_MAP_SCALE,BOMB_MAP_LIMIT,BOMB_PRESETS,BOMB_SITES,bombSitesFor,createBombMatch,startBombRound,tickBombMatch,beginBombHold} from './bomb-rules.js?v=20261003-bomb-pacing-1';
import {BOMB_WEAPON_COSTS,BOMB_START_CREDITS,awardBombCredits,buyBombWeapon} from './bomb-economy.js?v=20261001-bomb-buy-1';
import {createObjectiveWorld,createObjectiveNavigator} from './objective-world.js?v=20261003-bomb-cover-1';
import {createWeaponViewModels} from './weapon-viewmodel.js?v=20261006-touch-editor-3';
import {OPTIC_MODELS,rebuildWeaponOptic} from './weapon-optics.js?v=20261009-7';
import {botWeaponDamage} from './combat-balance.js?v=20260930-ai-fairness-1';
import {COVER_SPECS} from './cover-layout.js?v=20260928-combat-1';
import {activeSkin,skinById,applySkin,recordKill,initSkinScreen,updateSkinPulse} from './skin-system.js?v=20261006-touch-editor-3';
import {activeKnifeSkin,knifeSkinById,initKnifeSkinScreen,recordKnifeKill} from './knife-skins.js?v=20261026-admin-1';
import {readMatchRecovery,writeMatchRecovery,clearMatchRecovery} from './match-recovery.js?v=20261006-touch-editor-3';
import {KNIFE_FORMS} from './knife-forms.js?v=20261006-touch-editor-3';
import {knifeSkinDetails,mergeKnifeParts} from './knife-detail.js?v=20261006-touch-editor-3';
import {knifeCombat,knifeSwingPose,HIP_SPREAD_SCALE,hipCone} from './knife-combat.js?v=20261007-knife-swing-1';
import {initExtraction} from './extraction.js?v=20261026-admin-1';
import {extractionRole,extractionGun} from './extraction-design.js?v=20261014-raid-1';
import {buildExtractionWorld,EXTRACTION_LOOT_POINTS,EXTRACTION_EXITS,EXTRACTION_GUARDS,EXTRACTION_LIMIT,EXTRACTION_SPAWN,EXTRACTION_AI_EXIT} from './extraction-world.js?v=20261014-raid-1';
import {item as extractionItem,value as extractionValue,addItems as extractionAddItems} from './extraction-inventory.js?v=20261008-7';
import {rankedAiProfile as extractionRankProfile} from './ranked-rules.js?v=20261008-7';
import {updateExtractionLoot} from './extraction-ai.js?v=20261014-raid-1';
let extractionClient=null,extractionBackup=null,extractionSocket=null,extractionHost=true,extractionParty=null,extractionNextSync=0,extractionRetry=null;
import {accountSession,accountApi,refreshAccountProfile,initAccountUI} from './account.js?v=20261027-auth-recovery-1';
import {initSocialUI} from './social.js?v=20261026-admin-1';
import {initTournamentUI} from './tournament.js?v=20261026-admin-1';
import {initForumUI} from './forum.js?v=20261026-admin-1';
import {initGameChat,handleGameChat,resetGameChat} from './game-chat.js?v=20261005-1';
import {initSurvivalLeaderboardUI} from './survival-leaderboard.js?v=20261026-admin-1';
const API_ORIGIN=window.__ASTRIFT_API_ORIGIN__||'';
let mobileControls=null;const mobileMove={x:0,y:0};let mobileEditorPaused=false;
let lookSensitivity=loadSensitivity(MOBILE_ENABLED);
function setLookSensitivity(value){lookSensitivity=saveSensitivity(value,MOBILE_ENABLED);$('lookSensitivity').value=lookSensitivity;setText('lookSensitivityValue',lookSensitivity.toFixed(2));return lookSensitivity}
const apiUrl=path=>`${API_ORIGIN}${path}`;
const DEFAULT_BINDINGS={forward:"KeyW",back:"KeyS",left:"KeyA",right:"KeyD",sprint:"ShiftLeft",jump:"Space",slide:"KeyV",prone:"KeyZ",aim:"KeyE",reload:"KeyR",phase:"KeyQ",phaseFlash:"Enter",tactical:"KeyG",throwable:"KeyC",detonate:"KeyT",zoom:"KeyX",interact:"KeyF",supply:"KeyJ",inspect:"KeyP",weapon1:"Digit1",weapon2:"Digit2",sidearm:"Digit3",knife:"Digit4",backpack:"KeyB"};
const BINDING_GROUPS={移动:{forward:"前进",back:"后退",left:"向左",right:"向右",sprint:"冲刺 / 稳瞄",jump:"跳跃 / 飞行",slide:"滑铲",prone:"趴下 / 起身"},战斗:{aim:"键盘开镜（按住）",reload:"换弹",inspect:"检视武器",phase:"相位突进",phaseFlash:"相位闪（需装备相位手电）",tactical:"战术道具",throwable:"投掷物",weapon1:"武器 1",weapon2:"武器 2",sidearm:"手枪 / 无手枪时切刀",knife:"相位刃（装备手枪时）",backpack:"搜打撤背包"},特殊操作:{detonate:"遥控引爆",zoom:"切换瞄具倍率",interact:"目标交互（按住）",supply:"领取补给箱"}};
const DEFAULT_ACTION_BY_CODE=Object.fromEntries(Object.entries(DEFAULT_BINDINGS).map(([action,code])=>[code,action]));
const BINDING_STORAGE_KEY="astrift.keybinds.v1";
const validBindingCode=code=>typeof code==="string"&&/^(Key[A-Z]|Digit[0-9]|Numpad[0-9]|Enter|NumpadEnter|Space|ShiftLeft|ShiftRight|ControlLeft|ControlRight|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Backquote|Minus|Equal|BracketLeft|BracketRight|Semicolon|Quote|Comma|Period|Slash|Backslash)$/.test(code);
let keyBindings={...DEFAULT_BINDINGS};try{const stored=JSON.parse(localStorage.getItem(BINDING_STORAGE_KEY)||"null");if(stored&&!stored.sidearm){stored.sidearm=stored.knife||"Digit3";stored.knife="Digit4"}const priorActions=Object.keys(DEFAULT_BINDINGS).filter(action=>!["throwable","inspect","supply","slide","phaseFlash","backpack"].includes(action));if(stored&&priorActions.every(action=>validBindingCode(stored[action]))&&new Set(priorActions.map(action=>stored[action])).size===priorActions.length){const preferred=validBindingCode(stored.throwable)&&!priorActions.some(action=>stored[action]===stored.throwable)?stored.throwable:["KeyC","KeyB","KeyN"].find(code=>!priorActions.some(action=>stored[action]===code));if(preferred){const used=new Set([...priorActions.map(action=>stored[action]),preferred]);const savedInspect=stored.inspect==="KeyV"?"KeyP":stored.inspect,inspect=validBindingCode(savedInspect)&&!used.has(savedInspect)?savedInspect:["KeyP","KeyV","KeyB","KeyN","KeyM"].find(code=>!used.has(code));used.add(inspect||"KeyP");const supply=validBindingCode(stored.supply)&&!used.has(stored.supply)?stored.supply:["KeyJ","KeyH","KeyL","KeyY"].find(code=>!used.has(code));used.add(supply||"KeyJ");const slide=validBindingCode(stored.slide)&&!used.has(stored.slide)?stored.slide:["KeyV","KeyB","KeyN","KeyM"].find(code=>!used.has(code));used.add(slide||"KeyV");const phaseFlash=validBindingCode(stored.phaseFlash)&&!used.has(stored.phaseFlash)?stored.phaseFlash:["Enter","NumpadEnter","KeyH"].find(code=>!used.has(code));keyBindings={...DEFAULT_BINDINGS,...stored,throwable:preferred,inspect:inspect||"KeyP",supply:supply||"KeyJ",slide:slide||"KeyV",phaseFlash:phaseFlash||"Enter"}}}}catch{}
function keyLabel(action){if(MOBILE_ENABLED){const touchNames={forward:"摇杆",back:"摇杆",left:"摇杆",right:"摇杆",sprint:"疾跑",jump:"跳跃",slide:"滑铲",prone:"趴下",aim:"开镜",reload:"换弹",phase:"星际相位",phaseFlash:"相位闪",tactical:"道具",throwable:"投掷物",detonate:"引爆",zoom:"倍率",interact:"交互",supply:"补给",inspect:"检视",weapon1:"武器1",weapon2:"武器2",sidearm:"副武器",knife:"刀"};if(touchNames[action])return touchNames[action]}const code=keyBindings[action],names={Space:"空格",ShiftLeft:"左 Shift",ShiftRight:"右 Shift",ControlLeft:"左 Ctrl",ControlRight:"右 Ctrl",ArrowUp:"↑",ArrowDown:"↓",ArrowLeft:"←",ArrowRight:"→",Backquote:"`",Minus:"-",Equal:"=",BracketLeft:"[",BracketRight:"]",Semicolon:";",Quote:"'",Comma:",",Period:".",Slash:"/",Backslash:"\\"};return names[code]||code?.replace(/^Key|^Digit|^Numpad/,"")||"?"}
function controlDescription(value){return String(value).replaceAll("按住 F",`按住 ${keyLabel("interact")}`).replaceAll("按 F",`按 ${keyLabel("interact")}`).replaceAll("按 C",`按 ${keyLabel("throwable")}`).replaceAll("按 T",`按 ${keyLabel("detonate")}`).replaceAll("按 X",`按 ${keyLabel("zoom")}`).replaceAll("按 Enter",`按 ${keyLabel("phaseFlash")}`).replaceAll("按 Shift",`按 ${keyLabel("sprint")}`)}
let objectiveState=null,objectiveActors=[],objectiveLastUpdate=0,objectiveClockOffset=0,objectiveSeenRevision=-1;
let bombState=null,bombClockOffset=0,bombLastUpdate=0,bombSeenRevision=-1,bombHost='',bombWatchId='',bombLastBotSync=0,bombSitesVisual=[],bombLoadoutConfirmed=false,bombCredits=BOMB_START_CREDITS,bombPurchasedWeapon=null,bombAwardedRound=0,normalBombLoadout=null,bombCueSecond=-1;
const isBombMode=()=>roomMode==='bomb';
function isObjectiveMode(){return roomMode==='ctf'||roomMode==='hardpoint'}
function carryingObjectiveFlag(){return isObjectiveMode()&&objectiveState?.mode==='ctf'&&!!carrierFlag(objectiveState,playerId)}

const elementCache=new Map();
let lastSlotMarkup="";
const $ = (id) => {if(!elementCache.has(id))elementCache.set(id,document.getElementById(id));return elementCache.get(id)};
function setText(id,value){setLocalizedText($(id),value)}
function setWidth(id,value){const el=$(id),width=`${Math.round(value)}%`;if(el&&el.style.width!==width)el.style.width=width}
let qualityKey;try{qualityKey=localStorage.getItem('astrift.quality.v1')}catch{}
if(!QUALITY[qualityKey])qualityKey='smooth';
let quality=QUALITY[qualityKey];
const canvas = $("game");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x040914);
scene.fog = new THREE.FogExp2(0x08101a, .009);
const camera = new THREE.PerspectiveCamera(76, innerWidth / innerHeight, .08, 260);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, quality.pixelRatio));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = quality.shadows;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.userData={requestedShadows:quality.shadows};
installAdaptiveRender(renderer,{maxRatio:()=>Math.min(devicePixelRatio,quality.pixelRatio),active:()=>playing&&!paused,decorate:(camera,reduced)=>{for(const b of bots)updateFpsDetail(b,camera,reduced);for(const r of remotes.values())updateFpsDetail(r.mesh,camera,reduced)}});
function applyQuality(key){qualityKey=QUALITY[key]?key:'smooth';quality=QUALITY[qualityKey];renderer.setPixelRatio(Math.min(devicePixelRatio,quality.pixelRatio));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=quality.shadows;renderer.userData.requestedShadows=quality.shadows;scene.traverse(object=>{if(object.material)for(const material of (Array.isArray(object.material)?object.material:[object.material]))material.needsUpdate=true});for(const id of ['qualitySelect','pauseQualitySelect'])$(id).value=qualityKey;try{localStorage.setItem('astrift.quality.v1',qualityKey)}catch{}}
for(const id of ['qualitySelect','pauseQualitySelect']){$(id).value=qualityKey;$(id).onchange=e=>applyQuality(e.target.value)}

scene.add(new THREE.HemisphereLight(0x8ea6cf, 0x11131a, 1.3));
const moon = new THREE.DirectionalLight(0xc8dcff, 2.25); moon.position.set(28, 42, 18); moon.castShadow = true; scene.add(moon);

// A quiet star field makes the arena read as a real outdoor place instead of a neon void.
const starPositions=[];
for(let i=0;i<1100;i++){const r=120+Math.random()*90,theta=Math.random()*Math.PI*2,phi=Math.random()*Math.PI*.47;starPositions.push(Math.cos(theta)*Math.cos(phi)*r,Math.sin(phi)*r+18,Math.sin(theta)*Math.cos(phi)*r)}
const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute("position",new THREE.Float32BufferAttribute(starPositions,3));
const nearStars=new THREE.Points(starGeometry,new THREE.PointsMaterial({color:0xe8f2ff,size:.34,sizeAttenuation:true}));scene.add(nearStars);
const farStarPositions=[];for(let i=0;i<1100;i++){const r=480+Math.random()*100,theta=Math.random()*Math.PI*2,phi=Math.random()*Math.PI*.38;farStarPositions.push(Math.cos(theta)*Math.cos(phi)*r,Math.sin(phi)*r+90,Math.sin(theta)*Math.cos(phi)*r)}const farStarGeometry=new THREE.BufferGeometry();farStarGeometry.setAttribute('position',new THREE.Float32BufferAttribute(farStarPositions,3));const bombStars=new THREE.Points(farStarGeometry,new THREE.PointsMaterial({color:0xcdeaff,size:1.1,sizeAttenuation:true}));bombStars.visible=false;scene.add(bombStars);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(180,180),new THREE.MeshStandardMaterial({color:0x171b20,roughness:.96,metalness:.04})); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true;floor.userData.noBatch=true;scene.add(floor);
const bombFloor=new THREE.Mesh(new THREE.PlaneGeometry(440*BOMB_MAP_SCALE,440*BOMB_MAP_SCALE),new THREE.MeshStandardMaterial({color:0x0b1422,roughness:.58,metalness:.6}));bombFloor.rotation.x=-Math.PI/2;bombFloor.receiveShadow=true;bombFloor.visible=false;bombFloor.userData.noBatch=true;scene.add(bombFloor);

const MAP_NAMES={survival:'相位高塔',crossroads:'星港街区',depot:'环轨货场',arcade:'霓虹回廊',bomb:'相位矩阵'};
const obstacles=[floor],mapWorlds=new Map(),breakableCovers=new Map();
let mapBuildTarget=scene,mapBuildColliders=obstacles,activeMapId='crossroads';
function beginMap(id){mapBuildTarget=new THREE.Group();mapBuildTarget.name=`map-${id}`;mapBuildColliders=[]}
function finishMap(id){batchStaticScene(THREE,mapBuildTarget);mapBuildTarget.visible=false;scene.add(mapBuildTarget);mapWorlds.set(id,{group:mapBuildTarget,colliders:mapBuildColliders});mapBuildTarget=scene;mapBuildColliders=obstacles}
function setMap(id){if(!mapWorlds.has(id))id='crossroads';for(const [key,world] of mapWorlds)world.group.visible=key===id;obstacles.splice(1,obstacles.length-1,...mapWorlds.get(id).colliders.filter(mesh=>!mesh.userData.destroyed));activeMapId=id;for(const visual of healVisuals)visual.visible=id!=='training';floor.visible=id!=='bomb'&&id!=='extraction';bombFloor.visible=id==='bomb';nearStars.visible=id!=='bomb';bombStars.visible=id==='bomb';scene.fog.density=id==='extraction'?.002:id==='bomb'?.003:.009;camera.far=id==='bomb'||id==='extraction'?650:260;camera.updateProjectionMatrix();return id}
function box(x,z,w,h,d,color=0x27313a){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,metalness:.25,roughness:.72}));
  m.position.set(x,h/2,z);m.castShadow=m.receiveShadow=true;m.userData.bounds={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,maxY:h};mapBuildTarget.add(m);mapBuildColliders.push(m);return m;
}
const coverTextures=new Map();
function coverTexture(kind){if(coverTextures.has(kind))return coverTextures.get(kind);const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,64,64);ctx.lineWidth=3;ctx.strokeStyle=kind==='glass'?'#a4bdc0':kind==='wood'?'#ad9b88':kind==='steel'?'#a4aeb4':'#c1bcb6';if(kind==='wood'){for(const y of [13,31,49]){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(64,y);ctx.stroke()}ctx.strokeRect(3,3,58,58)}else if(kind==='glass'){for(const x of [16,32,48]){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,64);ctx.stroke()}ctx.strokeRect(2,2,60,60)}else if(kind==='steel'){ctx.strokeRect(3,3,58,58);for(const x of [10,54])for(const y of [10,54]){ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fillStyle='#87939b';ctx.fill()}}else{for(const [x,y] of [[12,12],[36,34],[20,52]]){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+12,y+4);ctx.lineTo(x+8,y+12);ctx.stroke()}}const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;coverTextures.set(kind,texture);return texture}
function addBreakableCovers(map){for(const spec of COVER_SPECS.filter(item=>item.map===map)){const mesh=box(spec.x,spec.z,spec.w,spec.h,spec.d,spec.color);mesh.userData.noBatch=true;mesh.userData.coverId=spec.id;mesh.userData.coverMaterial=spec.material;mesh.userData.coverHp=spec.hp;mesh.userData.coverMaxHp=spec.hp;mesh.material.map=coverTexture(spec.material);mesh.material.metalness=spec.material==='steel'?.82:spec.material==='glass'?.18:.06;mesh.material.roughness=spec.material==='glass'?.12:.8;if(spec.material==='glass'){mesh.material.transparent=true;mesh.material.opacity=.54;mesh.material.depthWrite=false}breakableCovers.set(spec.id,mesh)}}
function applyCoverState(id,hp){const mesh=breakableCovers.get(id);if(!mesh)return;const before=mesh.userData.coverHp;mesh.userData.coverHp=Math.max(0,Math.min(mesh.userData.coverMaxHp,Number(hp)||0));const destroyed=mesh.userData.coverHp<=0;mesh.userData.destroyed=destroyed;mesh.visible=!destroyed;mesh.material.opacity=mesh.userData.coverMaterial==='glass'?.54:1;mesh.material.color.setHex(COVER_SPECS.find(spec=>spec.id===id).color).multiplyScalar(.58+.42*mesh.userData.coverHp/mesh.userData.coverMaxHp);const index=obstacles.indexOf(mesh);if(destroyed&&index>=0)obstacles.splice(index,1);else if(!destroyed&&index<0&&id.startsWith(activeMapId+':'))obstacles.push(mesh);if(before>0&&destroyed)impactFX(mesh.position.clone().setY(mesh.userData.bounds.maxY*.55),mesh.userData.coverMaterial==='glass'?'head':'body')}
function resetCovers(){for(const spec of COVER_SPECS)applyCoverState(spec.id,spec.hp)}
function applyCoverSnapshot(rows){resetCovers();if(Array.isArray(rows))for(const row of rows)if(row&&typeof row.id==='string')applyCoverState(row.id,row.hp)}
function damageCover(mesh,damage){const id=mesh?.userData?.coverId;if(!id||mesh.userData.destroyed)return;if(online)sendNetwork({type:'coverHit',coverId:id,damage:Math.max(1,Math.min(100,Math.round(damage)))});else applyCoverState(id,mesh.userData.coverHp-damage)}
function surface(x,z,w,d,color,y=.018){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(x,y,z);mapBuildTarget.add(m);return m}
function detailBox(x,y,z,w,h,d,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color}));m.position.set(x,y,z);mapBuildTarget.add(m);return m}
function mapLight(x,y,z,color,power=8,range=16){const light=new THREE.PointLight(color,power,range);light.position.set(x,y,z);mapBuildTarget.add(light);return light}
function blocked(x,z){return obstacles.some(o=>{const b=o.userData.bounds;return b&&(b.minY===undefined||b.minY<1.9)&&x>b.minX-.45&&x<b.maxX+.45&&z>b.minZ-.45&&z<b.maxZ+.45})}
function coverAt(x,z){let highest;const feet=camera.position.y-playerEyeHeight;for(const o of obstacles){const b=o.userData.bounds;if(b&&x>b.minX-.38&&x<b.maxX+.38&&z>b.minZ-.38&&z<b.maxZ+.38&&(b.minY===undefined||feet>=b.minY-.4)&&(!highest||b.maxY>highest.userData.bounds.maxY))highest=o}return highest}
function blockedForPlayer(x,z,checkProne=prone,angle=yaw){if(roomMode==='survival')return Math.abs(x)>TOWER_LIMIT||Math.abs(z)>TOWER_LIMIT;const feet=camera.position.y-playerEyeHeight,collides=(sx,sz)=>obstacles.some(o=>{const b=o.userData.bounds;if(!b||sx<=b.minX-.38||sx>=b.maxX+.38||sz<=b.minZ-.38||sz>=b.maxZ+.38)return false;if(b.stair&&b.maxY-feet<=.58)return false;return feet<b.maxY-.18&&(b.minY===undefined||camera.position.y>b.minY+.05)});if(collides(x,z))return true;if(!checkProne)return false;const fx=-Math.sin(angle)*.95,fz=-Math.cos(angle)*.95;return collides(x+fx,z+fz)||collides(x-fx,z-fz)}
function blockedForProneBot(x,z,angle){const fx=-Math.sin(angle)*.95,fz=-Math.cos(angle)*.95;return blocked(x,z)||blocked(x+fx,z+fz)||blocked(x-fx,z-fz)}
function playerFloorHeight(x,z){if(roomMode==='survival')return TOWER_HEIGHT+playerEyeHeight;if(verticalVelocity>0){const roof=obstacles.find(o=>{const b=o.userData.bounds;return b?.minY!==undefined&&x>b.minX-.3&&x<b.maxX+.3&&z>b.minZ-.3&&z<b.maxZ+.3&&camera.position.y+.16>=b.minY&&camera.position.y-playerEyeHeight<b.minY});if(roof){camera.position.y=roof.userData.bounds.minY-.16;verticalVelocity=0}}return playerEyeHeight+(coverAt(x,z)?.userData.bounds.maxY||0)}
const sightRay=new THREE.Raycaster();
// Actor models face -Z, so their look-at helper must use the camera convention.
const botLookHelper=new THREE.PerspectiveCamera();
function hasLineOfSight(from,to,throughSmoke=false){if(!throughSmoke&&smokeBlocks(from,to))return false;const direction=to.clone().sub(from),distance=direction.length();sightRay.set(from,direction.normalize());sightRay.far=Math.max(.001,distance-.03);return sightRay.intersectObjects(obstacles,false).length===0}
function addBuildings(buildings){for(const [x,z,w,h,d,c] of buildings){box(x,z,w,h,d,c);const trim=new THREE.Mesh(new THREE.BoxGeometry(w+.12,.18,d+.12),new THREE.MeshBasicMaterial({color:c===0x3c3046||c===0x433142?0xff6ba8:0x5fdcff}));trim.position.set(x,h+.1,z);mapBuildTarget.add(trim);for(let y=2;y<h-1;y+=2.5){for(const side of [-1,1]){const windows=new THREE.Mesh(new THREE.PlaneGeometry(w*.65,.32),new THREE.MeshBasicMaterial({color:side>0?0x77dfff:0xffc96b}));windows.position.set(x,y,z+side*(d/2+.011));if(side<0)windows.rotation.y=Math.PI;mapBuildTarget.add(windows)}}}}
beginMap('crossroads');
for(const [x,z,w,d] of [[0,0,18,116],[0,0,116,18]])surface(x,z,w,d,0x10141a);
for(let i=-5;i<=5;i++)for(const [x,z,w,d] of [[-1,i*10,.16,5],[1,i*10,.16,5],[i*10,-1,5,.16],[i*10,1,5,.16]])surface(x,z,w,d,0xd9bf74,.027);
addBuildings([[-35,-34,24,15,20,0x273647],[-35,31,22,11,25,0x3c3046],[34,-34,24,12,21,0x263f3d],[35,33,22,17,23,0x3e342d],[-35,0,18,8,14,0x304052],[35,0,18,9,14,0x433142]]);
// Familiar street cover: concrete planters, cargo crates, and a central transit shelter.
box(-12,-12,6,1.4,3,0x555b5e);box(12,12,6,1.4,3,0x555b5e);box(-12,12,3,2.2,3,0x40536b);box(12,-12,3,2.2,3,0x6b493f);
box(0,0,9,3.2,4,0x263942);
const healVisuals=[];const healPoint={x:0,z:0,radius:8};
const healDisc=new THREE.Mesh(new THREE.CircleGeometry(healPoint.radius,48),new THREE.MeshBasicMaterial({color:0x35f4d1,transparent:true,opacity:.075,depthWrite:false}));healDisc.rotation.x=-Math.PI/2;healDisc.position.set(healPoint.x,.035,healPoint.z);scene.add(healDisc);healVisuals.push(healDisc);
const healRing=new THREE.Mesh(new THREE.TorusGeometry(healPoint.radius,.14,6,64),new THREE.MeshBasicMaterial({color:0x63ffe4,transparent:true,opacity:.86}));healRing.rotation.x=Math.PI/2;healRing.position.set(healPoint.x,.1,healPoint.z);scene.add(healRing);healVisuals.push(healRing);
for(let i=0;i<4;i++){const angle=i*Math.PI/2,beacon=new THREE.Mesh(new THREE.CylinderGeometry(.12,.22,1.4,6),new THREE.MeshBasicMaterial({color:0x55ffe0,transparent:true,opacity:.72}));beacon.position.set(Math.cos(angle)*7.35,.72,Math.sin(angle)*7.35);scene.add(beacon);healVisuals.push(beacon)}
// Street-level cover breaks long sightlines and gives every spawn a safe route.
for(const [x,z,w,d,c] of [[-6,30,3,7,0x34495e],[6,-30,3,7,0x594238],[-30,6,7,3,0x394f47],[30,-6,7,3,0x4b3c59],[-7,-20,5,2,0x4b5962],[7,20,5,2,0x4b5962],[-20,7,2,5,0x685441],[20,-7,2,5,0x3f5868]])box(x,z,w,1.65,d,c);
for(const [x,z,w,d] of [[-7,7,5,.55],[7,-7,5,.55],[-17,0,.55,6],[17,0,.55,6],[0,-17,6,.55],[0,17,6,.55]])box(x,z,w,1.05,d,0x6b7072);
for(const [x,z,c] of [[-15,-28,0x356f91],[15,28,0x8a4c55],[-28,15,0x6c7350],[28,-15,0x5c4d79]]){box(x,z,3.6,1.25,6.4,c);const cabin=box(x,z-.5,3,1,3,c);cabin.position.y=1.55;cabin.userData.bounds.maxY=2.05}
for(const [x,z,c] of [[-8,25,0x55ccff],[8,-25,0xff6b80],[-25,-8,0xffc65f],[25,8,0x7cf0bd]]){box(x,z,.16,4,.16,0x313a42);const lamp=new THREE.PointLight(c,10,16);lamp.position.set(x,4,z);mapBuildTarget.add(lamp);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.2,8,8),new THREE.MeshBasicMaterial({color:c}));bulb.position.copy(lamp.position);mapBuildTarget.add(bulb)}
addBreakableCovers('crossroads');
finishMap('crossroads');

beginMap('depot');
surface(0,0,136,136,0x303932,.014);
for(const trackX of [-5.6,5.6]){
  surface(trackX,0,4.8,112,0x232d2d,.022);
  for(const offset of [-1.45,1.45])surface(trackX+offset,0,.24,112,0xaeb9af,.034);
  for(let z=-52;z<=52;z+=4)surface(trackX,z,4.6,.34,0x826a47,.028);
}
for(const [x,z,w,d] of [[-25,-29,17,15],[25,29,17,15],[-29,27,10,13],[29,-27,10,13]])surface(x,z,w,d,0x555a4e,.022);
for(const [x,z,w,h,d,c] of [[-39,-30,15,5.5,15,0x565e4e],[39,30,15,5.5,15,0x665747],[-40,28,12,4.5,13,0x536266],[40,-28,12,4.5,13,0x68584e]]){box(x,z,w,h,d,c);detailBox(x,h-.25,z,w+.35,.32,d+.35,0xd1a64d)}
function cargo(x,z,w,h,d,color){box(x,z,w,h,d,color);for(let k=-w/2+1;k<w/2;k+=1.45){detailBox(x+k,h/2,z-d/2-.035,.1,h*.78,.09,0x18282b);detailBox(x+k,h/2,z+d/2+.035,.1,h*.78,.09,0x18282b)}detailBox(x,h-.22,z-d/2-.07,w*.85,.22,.1,0xffc84d)}
for(const [x,z,w,h,d,c] of [[-23,-13,11,2.6,3.2,0xd48d41],[-23,-4,11,5.2,3.2,0x447f83],[-23,5,11,2.6,3.2,0xc9a14f],[23,-5,11,5.2,3.2,0xa35b55],[23,5,11,2.6,3.2,0x5b8582],[23,16,11,2.6,3.2,0xc58b43],[-13,-32,10,2.6,3.2,0x547980],[13,32,10,2.6,3.2,0x9a6d4e]])cargo(x,z,w,h,d,c);
for(const z of [-25,25]){for(const x of [-15,15])box(x,z,.65,7,.65,0xd0a24d);detailBox(0,7.1,z,31,.7,.8,0xd0a24d);detailBox(0,5.7,z,.3,2,.3,0xc5d0bc);detailBox(0,4.7,z,.9,.28,.9,0xffc452);mapLight(0,5,z,0xffc56e,6,17)}
for(const [x,z,w,d] of [[-20,18,6,2.6],[20,-18,6,2.6],[-13,8,4,2],[13,-8,4,2]])box(x,z,w,1.25,d,0x78694e);
for(const z of [-43,43]){surface(0,z,19,.55,0xe5ae55,.042);surface(0,z+(z>0?-1.8:1.8),19,.28,0xe5ae55,.042)}
addBreakableCovers('depot');
finishMap('depot');

beginMap('arcade');
surface(0,0,136,136,0x251d31,.014);
surface(0,0,29,112,0x191b32,.022);
for(const x of [-14.4,14.4])surface(x,0,.28,112,x<0?0x4be7ef:0xff5cb8,.034);
for(let z=-52;z<=52;z+=8)surface(0,z,28,.15,z%16===0?0x726598:0x394765,.032);
for(const [x,z,w,h,d,c] of [[-33,-37,13,7,15,0x403257],[-33,-16,13,7,15,0x334c60],[-33,16,13,7,15,0x493659],[-33,37,13,7,15,0x365060],[33,-37,13,7,15,0x424965],[33,-16,13,7,15,0x593850],[33,16,13,7,15,0x425365],[33,37,13,7,15,0x5a3953]]){
  const wall=.55,doorWidth=4.8,frontX=x+(x<0?w/2:-w/2),backX=x-(x<0?w/2:-w/2),neon=x<0?0x4be7ef:0xff5cb8;
  // Shops are hollow. The corridor-facing wall is split around a real, walkable doorway.
  box(backX,z,wall,h,d,c);
  for(const side of [-1,1]){
    box(x,z+side*(d/2-wall/2),w, h,wall,c);
    box(frontX,z+side*(doorWidth/2+(d-doorWidth)/4),wall,h,(d-doorWidth)/2,c);
  }
  const roof=detailBox(x,h-.18,z,w,.36,d,c);roof.userData.noBatch=true;roof.userData.bounds={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY:h-.36,maxY:h};mapBuildColliders.push(roof);
  detailBox(frontX,h-.3,z,wall+.12,.6,doorWidth+.22,neon);
  detailBox(frontX,4.9,z,wall+.14,.22,doorWidth+.22,0xe5d6ff);
  for(const side of [-1,1]){
    detailBox(frontX,1.55,z+side*(doorWidth/2+.14),wall+.16,3.1,.14,neon);
    detailBox(frontX,3.7,z+side*(doorWidth/2+1.7),wall+.18,.9,1.35,0xe5d6ff);
  }
  surface(x,z,w-wall,d-wall,c,.025);
  detailBox(backX+(x<0?1:-1),1.1,z,1.5,2.2,5.2,0x22263e);
}
for(const z of [-32,-12,8,32]){for(const x of [-14,14]){box(x,z,.65,5.3,.8,x<0?0x33738b:0x8c446f);detailBox(x,4.1,z,.76,.16,.9,x<0?0x4be7ef:0xff5cb8)}detailBox(0,5.2,z,28.5,.42,.8,0x3b385d);detailBox(0,5.5,z,28.5,.12,.84,z%2?0xff5cb8:0x4be7ef)}
for(const [x,z,c] of [[-10,-23,0x4be7ef],[10,23,0xff5cb8],[-10,23,0xff5cb8],[10,-23,0x4be7ef]]){box(x,z,2.8,1.45,2.8,0x39405b);detailBox(x,1.5,z,2.9,.16,2.9,c)}
for(const [x,z,c] of [[-18,-21,0x4be7ef],[18,21,0xff5cb8],[-18,27,0xff5cb8],[18,-27,0x4be7ef]])mapLight(x,4,z,c,6,15);
addBreakableCovers('arcade');
finishMap('arcade');
// Compact bomb field: three lanes and cross-links retain several routes to each site.
beginMap('bomb');
surface(0,0,414,414,0x0d1929,.012);
for(const x of [-108,0,108]){surface(x,0,32,400,0x14243a,.018);for(const edge of [-16,16])surface(x+edge,0,.35,400,x===0?0x4ae8ff:0x7669ff,.03)}
for(const z of [-132,0,132]){surface(0,z,400,24,0x132239,.02);for(const edge of [-12,12])surface(0,z+edge,400,.3,0x3d94d4,.032)}
for(const z of [-184,-120,-56,56,120,184])for(const x of [-108,0,108]){
  surface(x,z,23,.8,z>0?0x3ebae0:0x8d6cdb,.04);
  surface(x,z+3,8,.26,0xb6eaff,.045);
}
for(const p of [-208,208]){box(p,0,2,11,418,0x152b3e);box(0,p,418,11,2,0x152b3e);detailBox(p,10,0,2.2,.45,418,0x4cf1ff);detailBox(0,10,p,418,.45,2.2,0x4cf1ff)}
for(const z of [-116,0,116]){
  for(const x of [-38,38]){box(x,z,2.2,10,2.2,0x24405c);detailBox(x,6,z,2.5,7,.22,0x5edcf8)}
  detailBox(0,10.4,z,78,1.2,2.6,0x315e80);
  detailBox(0,11.1,z,70,.18,2.9,z===0?0xb181ff:0x57dfff);
  for(const x of [-24,-12,0,12,24])detailBox(x,10.35,z+1.5,5,.28,.2,0xc5f5ff);
}
for(const x of [-170,-55,55,170])for(const z of [-148,-54,54,148]){
  if(Math.abs(x)===55&&Math.abs(z)===54)continue;
  const color=(x*z>0)?0x24435c:0x2c3658,accent=x*z>0?0x4de8ff:0xad78ff;
  box(x,z,18,6.5,19,color);
  detailBox(x,6.6,z,18.4,.34,19.4,accent);
  for(const side of [-1,1]){detailBox(x+side*8.9,3.2,z,.18,4.8,12,0x406c8c);detailBox(x,3.2,z+side*9.55,11,.18,.15,accent)}
}
for(const x of [-108,0,108])for(const z of [-176,-94,-38,38,94,176]){
  if(Math.abs(x)===108&&Math.abs(z)===38)continue;
  const tone=(x===0)?0x2a4659:0x30405e;
  box(x-9,z,5,1.45,3,tone);box(x+9,z,5,1.45,3,tone);
  detailBox(x-9,1.49,z,5.2,.12,3.2,0x5aeaff);detailBox(x+9,1.49,z,5.2,.12,3.2,0x9e84ff);
}
// Staggered barriers interrupt long sightlines; deliberate gaps keep each lane navigable.
for(const x of [-146,-86,-26,26,86,146])for(const z of [-158,-104,-48,48,104,158]){
  if(Math.abs(x)>=70&&Math.abs(x)<=95&&Math.abs(z)>=70&&Math.abs(z)<=110)continue;
  const variant=(Math.abs(x)+Math.abs(z))%3,color=variant===0?0x304e62:variant===1?0x3b4564:0x324a55;
  box(x,z,variant===1?3.2:6.2,variant===0?3.5:2.2,variant===1?9:4.5,color);
  box(x+7,z+(z>0?-7:7),8.5,1.5,2.3,0x44576a);
  detailBox(x+7,1.56,z+(z>0?-7:7),8.8,.12,2.5,variant===1?0xaf88f7:0x63d9e8);
}
// Four reachable upper decks. Each stair rises 0.45 m; the sites remain on ground level.
for(const x of [-78,78])for(const side of [-1,1]){
  const z=side*78,deck=detailBox(x,3.85,z,24,.3,14,0x34516b);
  deck.userData.noBatch=true;deck.userData.bounds={minX:x-12,maxX:x+12,minZ:z-7,maxZ:z+7,minY:3.7,maxY:4,stair:true};mapBuildColliders.push(deck);
  detailBox(x,4.07,z,23.5,.12,13.5,0x5c96b2);
  for(const dx of [-11,11])for(const dz of [-6,6])box(x+dx,z+dz,.7,3.7,.7,0x263d56);
  for(let step=1;step<=8;step++){
    const stair=box(x,side*(102-step*2),5,step*.45,2,0x3c5770);
    stair.userData.bounds.stair=true;
    detailBox(x,step*.45+.04,side*(102-step*2),5.2,.08,2.05,step%2?0x5ed6ed:0x8a9dea);
  }
  for(const dx of [-3.3,3.3])detailBox(x+dx,2.15,side*93,.22,4.3,19,0x82b6d2);
  for(const dx of [-9,9])box(x+dx,z,3,1.1,2.5,0x425b72);
}
for(const z of [-180,180]){
  surface(0,z,100,22,z>0?0x123e5a:0x3d2958,.04);
  for(const x of [-42,42]){box(x,z,4,7,4,0x213d56);detailBox(x,7.2,z,5,.4,5,z>0?0x55dfff:0xb287ff)}
  detailBox(0,8,z,64,.45,2,0x446c93);
}
for(const [x,color] of [[-110,0xff9275],[110,0x91a9ff]])for(const side of [-1,1]){const z=side*132;
  surface(x,z,17,17,0x283750,.05);surface(x,z,10,10,color,.058);
  for(const dx of [-12,12])for(const dz of [-12,12]){
    box(x+dx,z+dz,5,2,5,0x34465c);detailBox(x+dx,2.1,z+dz,5.3,.18,5.3,color);
  }
  for(const dx of [-17,17])for(const dz of [-17,17]){
    detailBox(x+dx,2.3,z+dz,.45,4.6,.45,color);
  }
}
// Dense staggered cover. Only free cells are used, leaving spawns, sites, stairs
// and the established lane intersections open. All dimensions scale with the map.
let bombCoverCount=0;
for(let row=-7;row<=7;row++)for(let column=-7;column<=7;column++){
  if((row+column)%2===0)continue;
  const x=column*24+(row%3===0?4:-4),z=row*24+(column%3===0?4:-4);
  if(Math.abs(x)<20&&Math.abs(z)<20)continue;
  if(Math.abs(x)<46&&Math.abs(z)>152)continue;
  if(Math.hypot(x+110,Math.abs(z)-132)<25||Math.hypot(x-110,Math.abs(z)-132)<25)continue;
  const width=(Math.abs(row*7+column)%3===0?9:6),depth=(Math.abs(row-column*5)%3===0?8:5);
  if(mapBuildColliders.some(mesh=>{const b=mesh.userData.bounds;return b&&x+width/2+8>b.minX&&x-width/2-8<b.maxX&&z+depth/2+8>b.minZ&&z-depth/2-8<b.maxZ}))continue;
  const tall=(row*11+column*7)%5===0,height=tall?5.2:2.35;
  const color=(row+column)%4===0?0x49516e:(row-column)%3===0?0x326078:0x354859;
  box(x,z,width,height,depth,color);
  detailBox(x,height+.08,z,width+.25,.16,depth+.25,(row+column)%4===0?0xaf8cff:0x64d9ee);
  bombCoverCount++;
}
box(65,0,8,9,8,0x20384f);
for(const y of [2.5,5.5,8.5])detailBox(65,y,0,8.5,.24,8.5,0x67e7ff);
for(const x of [57,73])for(const z of [-8,8]){detailBox(x,3,z,.8,6,.8,0xa586ff);detailBox(x,6.5,z,1.4,.3,1.4,0xe5b6ff)}
for(const [x,z,color] of [[-190,0,0x48d9ff],[190,0,0xa77fff],[0,-190,0x79a7ff],[0,190,0x57e8d7]]){
  detailBox(x,11,z,2,22,2,0x263b5c);detailBox(x,22.3,z,5,.7,5,color);
}
finishMap('bomb');
const bombWorld=mapWorlds.get('bomb');
bombWorld.group.scale.set(BOMB_MAP_SCALE,1,BOMB_MAP_SCALE);
for(const mesh of bombWorld.colliders){const bounds=mesh.userData.bounds;if(!bounds)continue;bounds.minX*=BOMB_MAP_SCALE;bounds.maxX*=BOMB_MAP_SCALE;bounds.minZ*=BOMB_MAP_SCALE;bounds.maxZ*=BOMB_MAP_SCALE;}
setMap('crossroads');
try{const savedMap=localStorage.getItem('astrift.map.v1');if(mapWorlds.has(savedMap))$('mapSelect').value=savedMap}catch{}
$('mapSelect').addEventListener('change',()=>{try{localStorage.setItem('astrift.map.v1',$('mapSelect').value)}catch{}});

const sceneryBatchStats=batchStaticScene(THREE,scene);
const objectiveWorld=createObjectiveWorld(THREE,scene,BASES,HILLS);
let objectiveNavigator=createObjectiveNavigator(blocked),objectiveNavigatorMap=activeMapId,objectiveNavigatorColliderCount=obstacles.length;
const effects=createEffects(THREE,scene),impactEffects=[],impactPool=[];
const weapon=new THREE.Group();camera.add(weapon);scene.add(camera);
const viewModelLight=new THREE.PointLight(0xbdefff,3.2,4);viewModelLight.position.set(.2,.2,.25);camera.add(viewModelLight);
const gunMat=new THREE.MeshStandardMaterial({color:0x355363,emissive:0x102d3b,emissiveIntensity:.85,metalness:.72,roughness:.28});
const gun=new THREE.Mesh(new THREE.BoxGeometry(.22,.2,.85),gunMat);gun.position.set(.32,-.28,-.62);weapon.add(gun);
const grenadeModel=new THREE.Group();grenadeModel.position.set(.31,-.23,-.45);grenadeModel.rotation.set(.18,-.12,-.08);grenadeModel.visible=false;weapon.add(grenadeModel);
const grenadeBody=new THREE.Mesh(new THREE.SphereGeometry(.17,14,10),new THREE.MeshStandardMaterial({color:0x38444d,metalness:.55,roughness:.42}));grenadeModel.add(grenadeBody);
const grenadeCap=new THREE.Mesh(new THREE.CylinderGeometry(.065,.075,.09,10),new THREE.MeshStandardMaterial({color:0xd1a95e,metalness:.7,roughness:.25}));grenadeCap.position.y=.18;grenadeModel.add(grenadeCap);
const grenadeRing=new THREE.Mesh(new THREE.TorusGeometry(.105,.012,6,16),new THREE.MeshBasicMaterial({color:0xffb348}));grenadeRing.rotation.x=Math.PI/2;grenadeRing.position.y=.04;grenadeModel.add(grenadeRing);
const grenadeGrip=new THREE.Mesh(new THREE.BoxGeometry(.22,.18,.27),new THREE.MeshStandardMaterial({color:0x17222b,roughness:.84}));grenadeGrip.position.set(.04,-.22,.1);grenadeModel.add(grenadeGrip);
const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.035,.05,.45,10),new THREE.MeshStandardMaterial({color:0x67f5ff,emissive:0x25dfff,emissiveIntensity:2}));barrel.rotation.x=Math.PI/2;barrel.position.set(.32,-.25,-1.17);weapon.add(barrel);
const knifeModel=new THREE.Group();knifeModel.position.set(.34,-.3,-.58);knifeModel.rotation.y=-.12;weapon.add(knifeModel);
const knifeSteel=new THREE.MeshStandardMaterial({color:0x91aebc,metalness:.9,roughness:.24,side:THREE.DoubleSide});
const knifeEdge=new THREE.MeshStandardMaterial({color:0x92f4ff,metalness:.56,roughness:.2,emissive:0x16778b,emissiveIntensity:.65,side:THREE.DoubleSide});
const knifeGrip=new THREE.MeshStandardMaterial({color:0x17222b,metalness:.3,roughness:.8});
const knifeAccent=new THREE.MeshStandardMaterial({color:0x755bc4,metalness:.65,roughness:.34,emissive:0x241451,emissiveIntensity:.35});
const bladeShape=new THREE.Shape();bladeShape.moveTo(-.105,0);bladeShape.lineTo(.105,0);bladeShape.lineTo(.13,.19);bladeShape.lineTo(.12,.57);bladeShape.lineTo(.055,.81);bladeShape.lineTo(0,1.02);bladeShape.lineTo(-.07,.75);bladeShape.lineTo(-.13,.52);bladeShape.lineTo(-.13,.18);bladeShape.closePath();
const knifeBlade=new THREE.Mesh(new THREE.ExtrudeGeometry(bladeShape,{depth:.035,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.009,bevelThickness:.009}),knifeSteel);knifeBlade.rotation.x=-Math.PI/2;knifeModel.add(knifeBlade);
const edgeShape=new THREE.Shape();edgeShape.moveTo(-.13,.18);edgeShape.lineTo(-.13,.52);edgeShape.lineTo(-.07,.75);edgeShape.lineTo(0,1.02);edgeShape.lineTo(-.028,.75);edgeShape.lineTo(-.09,.5);edgeShape.lineTo(-.09,.18);edgeShape.closePath();
const knifeCuttingEdge=new THREE.Mesh(new THREE.ShapeGeometry(edgeShape),knifeEdge);knifeCuttingEdge.rotation.x=-Math.PI/2;knifeCuttingEdge.position.y=.047;knifeModel.add(knifeCuttingEdge);
const knifeChannel=new THREE.Mesh(new THREE.BoxGeometry(.018,.006,.43),knifeAccent);knifeChannel.position.set(.035,.052,-.38);knifeModel.add(knifeChannel);
const knifeGuard=new THREE.Mesh(new THREE.BoxGeometry(.32,.095,.09),knifeAccent);knifeGuard.position.set(0,0,.045);knifeModel.add(knifeGuard);
const knifeHandle=new THREE.Mesh(new THREE.BoxGeometry(.145,.11,.39),knifeGrip);knifeHandle.position.set(0,-.005,.275);knifeModel.add(knifeHandle);
const knifeWraps=[];for(const z of [.13,.2,.27,.34,.41]){const wrap=new THREE.Mesh(new THREE.BoxGeometry(.155,.117,.022),knifeAccent);wrap.position.set(0,-.005,z);knifeModel.add(wrap);knifeWraps.push(wrap)}
const knifePommel=new THREE.Mesh(new THREE.BoxGeometry(.19,.13,.09),knifeSteel);knifePommel.position.set(0,-.005,.49);knifeModel.add(knifePommel);
const knifeInlayMat=new THREE.MeshStandardMaterial({color:0x9eeeff,emissive:0x46b9da,emissiveIntensity:.65,metalness:.6,roughness:.24,side:THREE.DoubleSide});
const knifeFacetShape=new THREE.Shape();knifeFacetShape.moveTo(-.052,.24);knifeFacetShape.lineTo(.037,.22);knifeFacetShape.lineTo(.068,.57);knifeFacetShape.lineTo(0,.78);knifeFacetShape.lineTo(-.025,.53);knifeFacetShape.closePath();
const knifeFacet=new THREE.Mesh(new THREE.ShapeGeometry(knifeFacetShape),knifeInlayMat);knifeFacet.rotation.x=-Math.PI/2;knifeFacet.position.y=.055;knifeModel.add(knifeFacet);
const knifeRivetMat=new THREE.MeshStandardMaterial({color:0xd9eeff,emissive:0x3e9dbd,emissiveIntensity:.35,metalness:.9,roughness:.2});
for(const z of [.21,.34]){const rivet=new THREE.Mesh(new THREE.SphereGeometry(.023,8,6),knifeRivetMat);rivet.scale.y=.38;rivet.position.set(0,.068,z);knifeModel.add(rivet)}
const knifeHaloMat=new THREE.MeshBasicMaterial({color:0x92e9ff,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
const knifeHalo=new THREE.Mesh(new THREE.ShapeGeometry(edgeShape),knifeHaloMat);knifeHalo.rotation.x=-Math.PI/2;knifeHalo.position.set(-.02,.059,-.025);knifeHalo.scale.set(1.18,1.09,1);knifeModel.add(knifeHalo);
const knifeAura=new THREE.Mesh(new THREE.TorusGeometry(.085,.012,5,18),knifeHaloMat.clone());knifeAura.rotation.x=Math.PI/2;knifeAura.position.set(0,.004,.035);knifeModel.add(knifeAura);
const knifeMarks={};
function addKnifeMark(id,points,color){const shape=new THREE.Shape();shape.moveTo(points[0][0],points[0][1]);for(const point of points.slice(1))shape.lineTo(point[0],point[1]);shape.closePath();const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.88,depthWrite:false}));mesh.rotation.x=-Math.PI/2;mesh.position.y=.063;mesh.visible=false;knifeModel.add(mesh);(knifeMarks[id]??=[]).push(mesh)}
for(const [id,color] of [['froststeel',0xe5fbff],['rustcopper',0xf6b879],['aurorablade',0x8efce7],['redobsidian',0xff526a]])for(let i=0;i<3;i++)addKnifeMark(id,[[-.065,.3+i*.12],[-.01,.34+i*.12],[.002,.35+i*.12],[-.05,.33+i*.12]],color);
for(let i=0;i<4;i++){const z=.28+i*.11;addKnifeMark('starfall',[[0,z-.023],[.017,z],[0,z+.023],[-.017,z]],i%2?0xffe5a0:0xffffff)}
addKnifeMark('phasebreak',[[-.065,.23],[.01,.35],[-.018,.43],[.065,.6],[.018,.5],[.038,.43],[-.03,.31]],0xbfeeff);
addKnifeMark('phasebreak',[[.02,.25],[.06,.36],[.025,.42],[.08,.52],[.05,.39]],0xa08fff);
let knifeFormId='';
function knifeShape(points){const shape=new THREE.Shape();shape.moveTo(...points[0]);for(const point of points.slice(1))shape.lineTo(...point);shape.closePath();return shape}
function applyKnifeForm(id){if(id===knifeFormId)return;knifeFormId=id;const form=KNIFE_FORMS[id]||KNIFE_FORMS.froststeel;const replace=(mesh,geometry)=>{mesh.geometry.dispose();mesh.geometry=geometry};replace(knifeBlade,new THREE.ExtrudeGeometry(knifeShape(form.blade),{depth:.035,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.006,bevelThickness:.009}));replace(knifeCuttingEdge,new THREE.ShapeGeometry(knifeShape(form.edge)));replace(knifeHalo,new THREE.ShapeGeometry(knifeShape(form.edge)));replace(knifeGuard,new THREE.ExtrudeGeometry(knifeShape(form.guardProfile),{depth:.065,bevelEnabled:true,bevelSegments:1,bevelSize:.008,bevelThickness:.008}));knifeGuard.rotation.set(-Math.PI/2,0,0);knifeGuard.position.y=-.032;replace(knifeHandle,new THREE.BoxGeometry(...form.handle));replace(knifePommel,new THREE.BoxGeometry(...form.pommel));knifePommel.position.z=.275+form.handle[2]/2+.04;replace(knifeFacet,new THREE.ShapeGeometry(knifeShape(form.inlay)));knifeFacet.scale.set(1,1,1);knifeChannel.visible=false;knifeWraps.forEach((wrap,i)=>{wrap.scale.x=form.handle[0]/.145;wrap.position.z=.275+(i-2)*form.handle[2]/6;wrap.rotation.z=0})}
function applyKnifeAppearanceBase(){const skin=activeKnifeSkin(),legendary=skin&&(skin.rarity==='legendary'||['starfall','phasebreak'].includes(skin.id));applyKnifeForm(skin?.id||'froststeel');knifeSteel.color.setHex(skin?.shell??0x91aebc);knifeSteel.metalness=skin?.id==='phasebreak'?.48:.9;knifeSteel.roughness=legendary?.14:.25;knifeSteel.transparent=skin?.id==='phasebreak';knifeSteel.opacity=skin?.id==='phasebreak'?.82:1;knifeSteel.depthWrite=skin?.id!=='phasebreak';knifeEdge.color.setHex(skin?.edge??0x92f4ff);knifeEdge.emissive.setHex(skin?.accent??0x16778b);knifeEdge.emissiveIntensity=legendary?.48:skin?.3:.25;knifeGrip.color.setHex(skin?.grip??0x17222b);knifeAccent.color.setHex(skin?.dark??0x755bc4);knifeAccent.emissive.setHex(skin?.accent??0x241451);knifeAccent.emissiveIntensity=legendary?.75:skin?.33:.35;knifeInlayMat.color.setHex(skin?.accent??0x9eeeff);knifeInlayMat.emissive.setHex(skin?.accent??0x46b9da);knifeInlayMat.emissiveIntensity=legendary?.55:.3;knifeRivetMat.color.setHex(skin?.edge??0xd9eeff);knifeRivetMat.emissive.setHex(skin?.accent??0x3e9dbd);knifeHaloMat.color.setHex(skin?.accent??0x92e9ff);knifeAura.material.color.setHex(skin?.accent??0x92e9ff);knifeFacet.visible=!!skin;knifeHalo.visible=knifeAura.visible=!!legendary;for(const [id,marks] of Object.entries(knifeMarks))for(const mark of marks)mark.visible=id===skin?.id}
const knifeStaticParts=knifeModel.children.filter(m=>m!==knifeHalo&&m!==knifeAura);
let knifeMerged=null,knifeAppearanceId=null;
function applyKnifeAppearance(){
  const skin=activeKnifeSkin(),id=skin?.id||'froststeel',appearance=skin?.id||'default';
  if(knifeAppearanceId===appearance)return;
  knifeAppearanceId=appearance;
  for(const mesh of knifeStaticParts)mesh.visible=true;
  applyKnifeAppearanceBase();
  // The solid frame must not incur transparent double-pass rendering.
  knifeSteel.transparent=false;knifeSteel.opacity=1;knifeSteel.depthWrite=true;
  knifeSteel.needsUpdate=true;
  knifeHaloMat.forceSinglePass=true;knifeAura.material.forceSinglePass=true;
  if(knifeMerged){knifeModel.remove(knifeMerged);for(const mesh of knifeMerged.children)mesh.geometry.dispose()}
  const details=activeKnifeSkin()?knifeSkinDetails(THREE,[knifeSteel,knifeEdge,knifeGrip,knifeAccent,knifeInlayMat],KNIFE_FORMS[id]||KNIFE_FORMS.froststeel,id):null;
  for(const marks of Object.values(knifeMarks))for(const mark of marks){if(mark.material!==knifeInlayMat){mark.material.dispose();mark.material=knifeInlayMat}}
  knifeMerged=mergeKnifeParts(THREE,[...knifeStaticParts,...(details?.children||[])]);
  knifeModel.add(knifeMerged);
  for(const mesh of knifeStaticParts)mesh.visible=false;
  if(details)for(const mesh of details.children)mesh.geometry.dispose();
}
let knifeSwingAt=-1000,knifeInspectStart=-99999,knifeCombo=0;
const knifePose={};
const muzzleFlash=new THREE.Mesh(new THREE.SphereGeometry(.11,8,6),new THREE.MeshBasicMaterial({color:0xcffcff,transparent:true,opacity:0}));muzzleFlash.position.set(.32,-.25,-1.43);weapon.add(muzzleFlash);
const flameOuter=new THREE.Mesh(new THREE.ConeGeometry(.15,.48,9),new THREE.MeshBasicMaterial({color:0xff6a18,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));flameOuter.rotation.x=-Math.PI/2;flameOuter.position.set(.32,-.25,-1.65);weapon.add(flameOuter);
const flameCore=new THREE.Mesh(new THREE.ConeGeometry(.082,.32,8),new THREE.MeshBasicMaterial({color:0xffed9b,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));flameCore.rotation.x=-Math.PI/2;flameCore.position.set(.32,-.25,-1.58);weapon.add(flameCore);
const muzzleLight=new THREE.PointLight(0x79edff,0,4);muzzleLight.position.copy(muzzleFlash.position);weapon.add(muzzleLight);
const tacticalLight=new THREE.SpotLight(0xe8f4ff,0,22,.42,.55,1.4);tacticalLight.position.set(.25,-.18,-.8);tacticalLight.target.position.set(.25,-.18,-12);weapon.add(tacticalLight,tacticalLight.target);
const opticMount=new THREE.Group();opticMount.position.set(.32,-.13,-.72);weapon.add(opticMount);
const heldWeaponModels=createWeaponViewModels(THREE,weapon);
const renderGunSkins=initSkinScreen(heldWeaponModels);
initKnifeSkinScreen(applyKnifeAppearance,renderGunSkins);
const trajectoryGeometry=new THREE.BufferGeometry(),trajectoryLine=new THREE.Line(trajectoryGeometry,new THREE.LineDashedMaterial({color:0xffc35a,dashSize:.7,gapSize:.45,transparent:true,opacity:.75}));trajectoryLine.visible=false;scene.add(trajectoryLine);

const WEAPONS={
  frost:{name:"霜脊 M9 · 狙击步枪",mag:5,reserve:Infinity,interval:1000,reload:2200,auto:false,damage:{head:180,body:80,arm:50},bulletSpeed:900,recoil:72,adsTime:420,zoom:2.5,spread:.0018,drop:.5,range:120},
  redline:{name:"赤线 V6 · 突击步枪",mag:30,reserve:Infinity,interval:104,reload:1400,auto:true,damage:{head:45,body:30,arm:15},bulletSpeed:720,recoil:55,adsTime:230,zoom:1.55,spread:.008,drop:.2,range:72},
  hammer:{name:"重锋 H8 · 重型连发步枪",mag:10,reserve:Infinity,interval:218.75,reload:3000,auto:true,damage:{head:72,body:42,arm:22},bulletSpeed:790,recoil:58,adsTime:280,zoom:1.5,spread:.002,drop:.24,range:120},
  shotgun:{name:"裂潮 S12 · 泵动霰弹枪",mag:8,reserve:Infinity,interval:820,reload:2600,auto:false,damage:{head:28,body:24,arm:15},bulletSpeed:460,recoil:86,adsTime:360,zoom:1.15,spread:.055,drop:.7,range:48,pellets:8},
  smg:{name:"蜂鸣 MP9 · 冲锋枪",mag:36,reserve:Infinity,interval:72,reload:1700,auto:true,damage:{head:36,body:24,arm:14},bulletSpeed:610,recoil:54,adsTime:190,zoom:1.25,spread:.014,drop:.28,range:74},
  revolver:{name:"断层 R6 · 左轮手枪",mag:10,reserve:Infinity,interval:520,reload:2100,auto:false,damage:{head:60,body:36,arm:19},bulletSpeed:680,recoil:78,adsTime:240,zoom:1,spread:.006,drop:.35,range:78},
  lmg:{name:"壁垒 KX · 轻机枪",mag:60,reserve:Infinity,interval:105,reload:4200,auto:true,damage:{head:36,body:23,arm:13},bulletSpeed:700,recoil:72,adsTime:480,zoom:1.35,spread:.012,drop:.3,range:92},
  autoShotgun:{name:"涌潮 A8 · 自动霰弹枪",mag:10,reserve:Infinity,interval:280,reload:3400,auto:true,damage:{head:21,body:17,arm:11},bulletSpeed:430,recoil:69,adsTime:330,zoom:1.12,spread:.068,drop:.8,range:40,pellets:6},
  gale:{name:"岚隼 D7 · 精准射手步枪",mag:12,reserve:Infinity,interval:300,reload:1850,auto:false,damage:{head:100,body:51,arm:31},bulletSpeed:840,recoil:64,adsTime:310,zoom:2.05,spread:.0032,drop:.32,range:102},
  knife:{name:"相位刃 K0 · 近战武器",mag:1,reserve:Infinity,interval:520,reload:0,auto:true,damage:{head:100,body:55,arm:40},bulletSpeed:0,recoil:18,adsTime:120,zoom:1,spread:0,drop:0,range:3.25},
  meteor:{name:"陨星 L1 · 火箭筒",mag:1,reserve:Infinity,interval:1000,reload:2000,auto:false,damage:{head:100,body:100,arm:100},bulletSpeed:34,recoil:84,adsTime:360,zoom:1.35,spread:.003,drop:3.2,range:136,blastRadius:7,edgeDamage:90,directDamage:100,fuse:0}
};
Object.defineProperty(WEAPONS,"knife",{enumerable:false});
const MODS={
  frost:{
    瞄具:{scope:["高倍镜","远处目标放大；开镜时间 +35%",{zoom:1.6,adsTime:1.35}],quickScope:["快开镜镜","开镜速度 +35%；倍率略低",{zoom:.82,adsTime:.65}],fastOptic:["快瞄镜","开镜更快，倍率偏低",{adsTime:.62,zoom:.78}],longOptic:["远距镜","开镜慢，超高倍率",{adsTime:1.45,zoom:1.9}]},
    枪口:{brake:["制退器","后坐和枪口上跳明显减少",{recoil:.62}],balanceRing:["配重环","射击后准星回正更快",{recoilRecovery:1.55}]},
    枪管:{long:["长枪管","射程 +25%；弹速 +18%；下坠 -35%",{range:1.25,bulletSpeed:1.18,drop:.65}],heavyBarrel:["重枪管","后坐恢复慢，但弹道极稳",{recoil:.82,spread:.35,adsTime:1.12}],precision:["精密枪管","偏移接近零；射程微降",{spread:.12,range:.92}],shortHeavy:["短重管","开镜移速提高；射程略降",{adsMove:1.16,range:.88}]},
    枪托与握把:{sniperStock:["狙击枪托","开镜后枪口回正更快",{recoil:.7}],stableGrip:["稳定握把","开镜抖动 -55%",{spread:.45}],shockPad:["减震垫","镜头回正速度提高",{recoilRecovery:1.5}],cheekPad:["贴腮垫","第一枪更稳，开镜准星更快静止",{firstShot:.45,spread:.72}]},
    弹匣:{quickMag:["快拔弹匣","换弹与首发上膛 +30%",{reload:.7,boltTime:.78}],largeMag:["大弹匣","弹容 8；换弹变慢",{mag:8,reload:1.25}],doubleMag:["双排弹匣","弹容 10，换弹不变",{mag:10}],rapidAction:["速射机匣","连点间隔缩短",{interval:.72,boltTime:.72}]},
    弹药:{highVelocity:["高速弹","弹速 +35%；提前量和下坠更小",{bulletSpeed:1.35,drop:.58}],heavyAmmo:["重弹头","伤害 +12%；弹速 -18%",{damage:1.12,bulletSpeed:.82}],ap:["穿甲弹","可穿一层薄掩体；护甲伤害 +15%",{penetration:true,armorDamage:1.15}],incendiary:["燃烧弹","命中处留下持续伤害火区",{incendiary:true}],tracerAmmo:["曳光弹","明亮轨迹双方可见",{brightTracer:true}]},
    特殊:{calibrator:["弹道校准器","下坠和左右偏移几乎为 0",{drop:.08,spread:.12}],bipod:["快拆脚架","靠近掩体开镜时稳定锁定",{bipod:true}]},
    战术扩展:{lowLight:["低光增亮镜","暗处目标更清楚，边缘略模糊",{lowLight:true}],dualScope:["双倍率镜","按 X 切换低倍和高倍",{dualZoom:true}],flashHider:["消焰器","枪口火光降低，弹速略降",{muzzleHidden:true,bulletSpeed:.94}],suppressor:["一体式消音器","枪声和曳光减弱，射程略降",{suppressed:true,range:.9}],floating:["浮动枪管","静止极准，移动散布增加",{stationaryAccuracy:true}],carbon:["碳纤短管","开镜移动更快，下坠增加",{adsMove:1.18,drop:1.35}],thumb:["拇指托","连续瞄准时稳定性提高",{recoilRecovery:1.3}],sandbag:["沙袋托架","掩体旁后坐极低，移动略慢",{bipod:true,recoil:.55,moveSpeed:.94}],straightBolt:["直拉枪机","拉栓速度显著提高",{boltTime:.58}],singleLoader:["单发装填器","单发弹匣，首发极准，装填快",{mag:1,reload:.55,firstShot:.22}],fragRound:["裂片弹","命中产生小范围碎片伤害",{softPoint:true}],subsonic:["亚音速弹","声音和曳光很弱，弹速较慢",{suppressed:true,bulletSpeed:.72}],rangefinder:["测距模块","准心显示瞄准距离",{rangefinder:true}],breath:["呼吸稳定器","开镜按 Shift 稳定准心",{breathControl:true}]}
  },
  redline:{
    瞄具:{redDot:["红点镜","开镜快，适合近战",{adsTime:.72,zoom:1.02}],holo:["全息镜","粗准星，连续跟枪更稳",{spread:.82,zoom:1.08}],threeX:["3×镜","中距离放大；开镜稍慢",{zoom:1.75,adsTime:1.25}],sideDot:["侧面红点","近战超快开镜",{adsTime:.5,zoom:.96}],compact:["1.5×紧凑镜","开镜极快，中近距离通用",{adsTime:.6,zoom:1.18}]},
    枪口:{comp:["补偿器","整体后坐 -22%",{recoil:.78}],weight:["枪口配重","上跳 -32%；移速 -4%",{recoil:.68,moveSpeed:.96}],weightPlus:["枪口配重 II","进一步压低上跳，移速略降",{recoil:.62,moveSpeed:.95}],diffuser:["扩散器","腰射弹道更集中",{hipSpread:.62}]},
    握把:{vertical:["垂直握把","上下后坐 -28%",{recoil:.72}],angled:["斜角握把","左右散布 -24%；开镜 +16%",{spread:.76,adsTime:.84}],rightAngle:["直角握把","横向散布降低，开镜更快",{spread:.72,adsTime:.82}],hybrid:["混合握把","全面小幅降低后坐与散布",{spread:.86,recoil:.86}]},
    枪托:{tactical:["战术枪托","连射准星回收 +28%",{recoil:.76}],lightStock:["轻量枪托","跑动和开镜移速 +7%",{moveSpeed:1.07,adsMove:1.07}],telescopic:["伸缩枪托","跑动开镜快，静止精度略降",{adsTime:.72,spread:1.1}],shockStock:["减震枪托","连续射击回正更快",{recoilRecovery:1.45,recoil:.88}]},
    弹匣:{quickMag:["快速弹匣","换弹 +30%",{reload:.7}],extended:["扩容弹匣","弹容 42；换弹变慢",{mag:42,reload:1.22}],drum:["鼓式弹匣","弹容 60；换弹很慢",{mag:60,reload:1.7}],fastLatch:["弹匣快挂","换弹速度极快",{reload:.48}]},
    弹药:{highVelocity:["高速弹","弹速 +25%；远距离衰减减少",{bulletSpeed:1.25,falloff:.25}],ap:["穿甲弹","可穿一层薄掩体；护甲伤害 +12%",{penetration:true,armorDamage:1.12}],pointed:["高速尖弹","弹速提高，远距衰减减少",{bulletSpeed:1.2,falloff:.35}],softPoint:["软尖弹","命中伤害扩散到附近敌人",{softPoint:true}]},
    激光与导轨:{laser:["激光条","连射腰射越打越稳；首发改善较小",{hipSpread:.9,hipBurstGrowth:.18}],infrared:["红外激光","隐蔽的通用腰射强化；移动和静止都生效",{hipSpread:.57}],flashlight:["战术灯","照亮近处，但会暴露位置",{flashlight:true}]},
    战术扩展:{flipMagnifier:["翻转放大镜","按 X 切换红点和 3 倍",{dualZoom:true}],iron:["开放式机械瞄具","开镜最快，几乎无放大",{adsTime:.42,zoom:.82}],suppressor:["消音器","降低枪声和火光，射程略降",{suppressed:true,muzzleHidden:true,range:.9}],comboMuzzle:["制退消焰一体器","后坐与火光降低，移动略慢",{recoil:.74,muzzleHidden:true,moveSpeed:.96}],heavyHandguard:["重型长护木","连射稳定，开镜移动变慢",{recoil:.72,adsMove:.88}],vented:["通风护木","长连射散布增长更慢",{recoilRecovery:1.35}],shortGrip:["短前握把","开镜更快，垂直后坐略高",{adsTime:.78,recoil:1.08}],supportGrip:["支撑握把","靠近掩体时显著稳定",{bipod:true}],balancedStock:["平衡枪托","水平垂直后坐小幅降低",{recoil:.84,spread:.9}],bullpup:["无托结构","移动更快，换弹稍慢",{moveSpeed:1.09,reload:1.16}],quadMag:["四排弹匣","弹容 50，换弹较慢",{mag:50,reload:1.35}],coupledMag:["双弹匣夹","第一次换弹极快",{reload:.58}],hollow:["空尖弹","近距伤害提高，远距衰减明显",{damage:1.12,falloff:1.8}],lowRecoil:["低后坐弹","后坐降低，伤害略低",{recoil:.68,damage:.9}],visibleLaser:["可见激光","移动腰射专用：走位时散布显著降低",{hipMoving:.53}],iff:["敌我识别模块","准心根据敌我改变颜色",{iff:true}]}
  },
  gale:{
    瞄具:{galeReflex:["精准反射镜","开镜快，适合中近距离连续点射",{adsTime:.72,zoom:.86}],galeTwoX:["2×巡猎镜","均衡倍率与开镜速度",{zoom:1.22,adsTime:.92}],galeFourX:["4×风眼镜","中远距离放大，开镜稍慢",{zoom:1.78,adsTime:1.18}],galeVariable:["2-6×变倍镜","按 X 切换倍率",{zoom:1.32,dualZoom:true}],galeOpen:["开放式准镜","几乎无放大，开镜极快",{zoom:.7,adsTime:.58}]},
    枪口:{galeBrake:["双室制退器","后坐显著降低",{recoil:.68}],galeComp:["精密补偿器","后坐和散布同时降低",{recoil:.8,spread:.82}],galeSuppressor:["低鸣抑制器","降低枪声与火光，射程略降",{suppressed:true,muzzleHidden:true,range:.92}],galeWeight:["稳定配重器","回正更快，移动速度略降",{recoilRecovery:1.42,moveSpeed:.97}]},
    枪管:{galeLong:["远射长管","弹速和射程提高，下坠减少",{bulletSpeed:1.18,range:1.2,drop:.72}],galeMatch:["竞赛枪管","首发偏移接近零",{spread:.42,firstShot:.32}],galeHeavy:["重型浮置管","连续点射稳定，开镜稍慢",{recoil:.75,spread:.65,adsTime:1.12}],galeShort:["轻型短管","开镜移动更快，射程降低",{adsMove:1.16,range:.88,adsTime:.86}]},
    握把:{galeVertical:["垂直稳定握把","垂直后坐降低",{recoil:.73}],galeAngle:["导流斜握把","开镜更快，水平散布降低",{adsTime:.82,spread:.78}],galePrecision:["精密托手","开镜散布大幅降低",{spread:.58,adsMove:.94}],galeHybrid:["自适应握把","后坐、散布全面小幅改善",{recoil:.86,spread:.86}]},
    枪托:{galeMarksman:["射手枪托","射击后回正更快",{recoilRecovery:1.52}],galeLight:["轻量枪托","移动与开镜移速提高",{moveSpeed:1.06,adsMove:1.1}],galeShock:["吸能枪托","连续点射后坐降低",{recoil:.72}],galeCheek:["可调贴腮板","第一枪更稳",{firstShot:.48,spread:.82}]},
    弹匣:{galeQuick:["快拔弹匣","换弹速度提高",{reload:.68}],galeExtended:["扩容弹匣","弹容增加到 18 发",{mag:18,reload:1.18}],galeDrum:["紧凑鼓匣","弹容增加到 24 发，换弹较慢",{mag:24,reload:1.46}],galeRapid:["速射机匣","点射间隔缩短，后坐略增",{interval:.72,recoil:1.1}]},
    弹药:{galeVelocity:["高速远射弹","弹速提高，下坠减少",{bulletSpeed:1.28,drop:.7}],galeHeavyAmmo:["重型射手弹","伤害提高，弹速降低",{damage:1.12,bulletSpeed:.86}],galeAP:["硬芯穿甲弹","穿透薄掩体，护甲伤害提高",{penetration:true,armorDamage:1.13}],galeTracer:["风迹曳光弹","弹道清晰可见",{brightTracer:true}],galeSoft:["扩张弹","命中伤害扩散到附近目标",{softPoint:true}]},
    战术扩展:{galeBipod:["折叠脚架","靠近掩体开镜时大幅稳定",{bipod:true}],galeRange:["数字测距模块","瞄具显示目标距离",{rangefinder:true}],galeLaser:["低可视激光","腰射首发更准；连续点射不额外受益",{hipFirstShot:.4}],galeThermal:["微光热像镜","暗处目标更清晰，开镜变慢",{lowLight:true,adsTime:1.18}],galeCarbon:["碳纤护木","移动更快，后坐略增",{moveSpeed:1.08,recoil:1.08}],galeBuffer:["液压缓冲器","准星回正速度提高",{recoilRecovery:1.38}],galeCalibrator:["弹道校准芯片","下坠和随机偏移大幅减少",{drop:.3,spread:.38}],galeQuiet:["亚音速组件","枪声与曳光减弱，弹速降低",{suppressed:true,bulletSpeed:.76}],galeCoupled:["并联弹匣","换弹极快",{reload:.55}],galeBalanced:["平衡套件","全面改善操控",{recoil:.9,spread:.9,adsTime:.92}],galeIff:["敌我识别导轨","准心根据敌我改变颜色",{iff:true}],galeFlash:["战术照明器","照亮近处暗区",{flashlight:true}]}
  },
  meteor:{
    瞄具:{predictor:["弹道预测镜","开镜时显示火箭轨迹",{trajectory:true}],wide:["广角瞄具","视野更大，追踪目标更方便",{zoom:.82,adsTime:.82}],thermal:["热成像瞄","敌人高亮；开镜慢 28%",{thermal:true,adsTime:1.28}]},
    尾翼与发射管:{straight:["直飞尾翼","弹道更直；下坠 -55%",{drop:.45}],lightTube:["轻量发射管","切换/开镜 +25%；后坐 +18%",{adsTime:.75,recoil:1.18}],glider:["滑翔翼","射程大增，弹速慢、弧线大",{range:2.2,bulletSpeed:.66,drop:1.65}],vector:["矢量喷嘴","轻微追踪敌人；全部爆炸伤害 -10%",{homing:true}]},
    发动机:{rangeEngine:["增程发动机","射程 +30%；弹速 +18%",{range:1.3,bulletSpeed:1.18}],boostFuel:["加速燃料","弹速 +48%",{bulletSpeed:1.48}]},
    弹头:{highExplosive:["高爆弹头","半径 +30%；边缘伤害 +12",{blastRadius:1.3,edgeDamage:12}],shaped:["聚能弹头","半径 -32%；中心伤害 125",{blastRadius:.68,directDamage:125}],sticky:["黏着弹头","黏住表面后延时爆炸",{sticky:true,fuse:.65}],wallPiercer:["穿墙弹","穿过一层薄墙后爆炸",{rocketPenetration:true}]},
    引信:{delay:["延时引信","命中后 0.2 秒爆炸",{fuse:.2}],contact:["接触引信","触碰立即爆炸",{fuse:0}],proximity:["近炸引信","接近敌人自动引爆",{proximity:true}],jumpFuse:["跳炸引信","落地弹起后再爆炸",{jumpFuse:true,fuse:.35}]},
    操控:{damper:["后坐阻尼","镜头晃动 -38%",{recoil:.62}],fastReload:["快速再装填","装填 +32%",{reload:.68}],dual:["双发挂架","弹匣 2 发；装填变慢",{mag:2,reload:1.28}],shoulderPad:["缓冲肩垫","发射硬直和镜头晃动降低",{recoil:.52,interval:.82}]},
    装填与携行:{autoLoader:["自动装填","自动完成装填，速度提高",{reload:.62}],bandolier:["弹带挂架","两发并排携行，补弹更快",{mag:2,reload:.88}]},
    战术扩展:{digitalRange:["数字测距镜","显示距离和预计落点",{rangefinder:true,trajectory:true}],nightSight:["夜视瞄具","暗处轮廓更清晰",{lowLight:true}],cluster:["分裂弹头","爆炸散出低伤碎片",{cluster:true}],concussion:["震荡弹头","伤害降低并造成短暂震荡",{damage:.72,concussion:true}],smoke:["烟幕弹头","爆炸产生遮挡烟雾",{smoke:true}],fireWarhead:["燃烧弹头","爆炸区域持续燃烧",{incendiary:true}],twoStage:["二段发动机","飞行一段距离后加速",{twoStage:true}],ricochet:["跳弹外壳","首次碰墙会反弹",{ricochet:true}],bunker:["钻地引信","落地延迟后扩大地面爆炸",{bunker:true,fuse:.55,blastRadius:1.18}],safety:["保险引信","离自己过近时不会爆炸",{safety:true}],remoteFuse:["遥控引信","火箭飞行时按 T 主动引爆",{remoteFuse:true}],gyro:["旋转稳定器","飞行更直，取消追踪",{drop:.55,disableHoming:true}],triple:["三联挂架","弹匣 3 发，移动和装填变慢",{mag:3,reload:1.65,moveSpeed:.9}]}
  }
};
const EXTRA_MODS={
  frost:{
    瞄具:{prismScope:["棱镜 3× 镜","比标准镜更快开镜，适合中距离",{zoom:1.18,adsTime:.86}],longEye:["星环 5× 镜","远距离放大更多，开镜略慢",{zoom:1.42,adsTime:1.16}]},
    枪口:{hybridBrake:["消焰制退器","枪口火光与上跳同时降低",{muzzleHidden:true,recoil:.86}],crown:["冠状精密器","首发回正更快，弹速略降",{recoilRecovery:1.22,bulletSpeed:.96}]},
    枪管:{coldForged:["低温精锻管","弹速提高，连续射击更稳",{bulletSpeed:1.12,spread:.78}],fluted:["纵向导流管","移动开镜更灵活，射程略降",{adsMove:1.12,range:.94}]},
    枪托与握把:{floatingCheek:["浮动贴腮托","连续开镜更稳，移动略慢",{recoilRecovery:1.24,adsMove:.94}],snapGrip:["快拆握把","切枪与开镜更快",{adsTime:.84,moveSpeed:1.04}]},
    弹匣:{compactMag:["轻量 6 发匣","弹容提高，换弹略慢",{mag:6,reload:1.12}],matchMag:["竞赛弹匣","弹容不变，换弹更快",{reload:.78}]},
    弹药:{bondedAmmo:["粘结弹芯","护甲伤害提高，弹速略降",{armorDamage:1.18,bulletSpeed:.94}],flatBase:["平底高速弹","弹速提高，下坠减少",{bulletSpeed:1.16,drop:.78}]},
    特殊:{zeroStop:["零位限位器","首发更稳，后续偏移略大",{firstShot:.56,spread:1.08}],rangeSeal:["密封校准环","射程提高，开镜略慢",{range:1.12,adsTime:1.06}]},
    战术扩展:{microRange:["微型测距仪","准心显示目标距离",{rangefinder:true}],quickLatch:["快拆机匣","换弹与拉栓更快",{reload:.82,boltTime:.78}]}
  },
  redline:{
    瞄具:{circleDot:["环窗红点","视野更开阔，开镜更快",{adsTime:.78,zoom:.94}],etchedHolo:["刻线全息镜","跟枪更稳，倍率略高",{spread:.88,zoom:1.12}]},
    枪口:{portedBrake:["开孔制退器","连射上跳降低",{recoil:.82}],flashCan:["短筒消焰器","枪口火光降低，弹速略降",{muzzleHidden:true,bulletSpeed:.97}]},
    握把:{thumbRest:["拇指托握把","开镜速度提高",{adsTime:.82}],widePalm:["宽掌稳定握把","横向散布降低，移速略降",{spread:.82,moveSpeed:.97}]},
    枪托:{foldingStock:["折叠枪托","移速提高，连续射击更跳",{moveSpeed:1.06,recoil:1.08}],weightedStock:["配重枪托","连续射击回正更快",{recoilRecovery:1.28}]},
    弹匣:{lightweightMag:["轻量扩容匣","弹容 36 发，换弹略慢",{mag:36,reload:1.1}],singlePointMag:["单点快拆匣","换弹和切枪更快",{reload:.78,moveSpeed:1.03}]},
    弹药:{controlledAmmo:["低跳弹药","后坐降低，弹速略慢",{recoil:.86,bulletSpeed:.96}],jacketed:["全被甲弹","弹速和护甲伤害提高",{bulletSpeed:1.1,armorDamage:1.08}]},
    激光与导轨:{greenLaser:["绿光激光器","静止腰射专用：站稳时散布显著降低",{hipStill:.43}],angledRail:["斜置导轨","腰射操控更快，开镜略慢",{hipSpread:.78,adsTime:1.06}]},
    战术扩展:{quickSelector:["快慢机组件","连射间隔缩短，后坐略增",{interval:.9,recoil:1.08}],sealedReceiver:["密封机匣","弹道偏移降低，换弹略慢",{spread:.88,reload:1.08}]}
  },
  gale:{
    瞄具:{widePrism:["宽视棱镜镜","视野开阔，开镜迅速",{zoom:.88,adsTime:.78}],galeSixX:["6×远望镜","极远距离放大，开镜变慢",{zoom:2.05,adsTime:1.28}]},
    枪口:{galeCrown:["冠状制退器","垂直上跳显著降低",{recoil:.78}],galeFlashCan:["低焰消音筒","降低枪声与火光，弹速稍降",{suppressed:true,muzzleHidden:true,bulletSpeed:.94}]},
    枪管:{galeFluted:["螺旋轻量管","开镜移动更快，散布略增",{adsMove:1.12,spread:1.08}],galeCarbonTube:["碳纤精密管","弹速提高，后坐恢复略慢",{bulletSpeed:1.12,recoilRecovery:.9}]},
    握把:{galeThumb:["快扣拇指握把","开镜和切枪更快",{adsTime:.82,moveSpeed:1.03}],galePalm:["掌托稳定握把","静止点射更准，跑动散布略增",{spread:.78,adsMove:.96}]},
    枪托:{galeFoldStock:["折叠轻托","跑动更快，后坐略增",{moveSpeed:1.07,recoil:1.08}],galeReturnStock:["回弹缓冲托","连续点射后准星回正更快",{recoilRecovery:1.32}]},
    弹匣:{galeCompact:["轻量 14 发匣","弹容小幅增加，装填速度不变",{mag:14}],galeSpeedLoader:["双排快装匣","换弹大幅加快",{reload:.72}]},
    弹药:{galeBonded:["粘结重芯弹","护甲伤害提高，弹速稍降",{armorDamage:1.16,bulletSpeed:.94}],galeFlatBase:["平底竞速弹","弹速提高，下坠进一步减少",{bulletSpeed:1.14,drop:.82}]},
    战术扩展:{galeQuickSwitch:["快切倍率环","切换倍率和开镜更快",{dualZoom:true,adsTime:.9}],galeZeroStop:["零位校正器","静止首发更稳，射程略降",{firstShot:.58,range:.96}]}
  },
  meteor:{
    瞄具:{meteorReflex:["宽窗反射镜","开镜更快，视野更宽",{adsTime:.78,zoom:.9}],meteorRange:["远射测距镜","高倍并显示目标距离",{zoom:1.2,adsTime:1.12,rangefinder:true}]},
    尾翼与发射管:{microFins:["微调尾翼","随机偏移降低，弹速略降",{spread:.72,bulletSpeed:.96}],reinforcedTube:["加固发射管","后坐减轻，移速略降",{recoil:.84,moveSpeed:.96}]},
    发动机:{economyMotor:["节流增程机","射程提高，弹速略降",{range:1.18,bulletSpeed:.94}],shortBurn:["短燃助推器","近中距离弹速提高",{bulletSpeed:1.22,range:.92}]},
    弹头:{denseCore:["高密度核心弹","中心伤害提高，爆炸范围缩小",{directDamage:112,blastRadius:.9}],wideFragment:["广域破片弹","边缘伤害提高，中心伤害略降",{edgeDamage:14,directDamage:94,blastRadius:1.12}]},
    引信:{safeDistance:["安全距离引信","近距离不爆，减少自伤风险",{safety:true,fuse:.12}],surfaceSensor:["地表感应引信","落地后短延时引爆",{bunker:true,fuse:.3}]},
    操控:{softShoulder:["软垫肩托","发射后镜头更稳，装填略慢",{recoil:.76,reload:1.08}],snapTrigger:["轻压发射扳机","开火间隔缩短，镜头晃动略增",{interval:.88,recoil:1.08}]},
    装填与携行:{quickHarness:["快拆携行架","装填更快，弹匣维持 1 发",{reload:.78,mag:1}],balancedHarness:["平衡背带","持筒移动更快，装填稍慢",{moveSpeed:1.08,reload:1.1}]},
    战术扩展:{straightGyro:["直线陀螺仪","弹道更直，不改变伤害",{drop:.62,spread:.82}],rangeDial:["机械测距盘","显示估算距离，开镜略快",{rangefinder:true,adsTime:.94}]}
  }
};
for(const [weapon,slots] of Object.entries(EXTRA_MODS))for(const [slot,choices] of Object.entries(slots))Object.assign(MODS[weapon][slot],choices);
organizeAttachments(MODS);
MODS.hammer=structuredClone(MODS.redline);
for(const key of ["shotgun","smg","revolver","lmg","autoShotgun"])MODS[key]=structuredClone(MODS.redline);
// These older weapon families never had the V6-style open iron-sight attachment.
// Keep their native sights, and only offer the optic models already present in this build.
for(const key of ["hammer","shotgun","smg","revolver","lmg","autoShotgun"])delete MODS[key].瞄具?.iron;
MODS.shotgun.弹匣={quick:["快拔管仓","8 发，装填更快",{mag:8,reload:.72}],extended:["延长管仓","10 发，装填稍慢",{mag:10,reload:1.18}]};
MODS.autoShotgun.弹匣={quick:["快速弹鼓","10 发，换弹更快",{mag:10,reload:.74}],extended:["扩容弹鼓","14 发，换弹较慢",{mag:14,reload:1.28}],drum24:["24 发弹鼓","24 发，换弹更慢，开镜稍慢",{mag:24,reload:1.55,adsTime:1.12}]};
MODS.revolver={
  瞄具:{r6Fast:["快开镜 1×","倍率 1×，开镜更快",{zoom:1,adsTime:.72}],r6Dot:["红点镜 1.25×","倍率 1.25×，快速捕捉目标",{zoom:1.25,adsTime:.88}],r6Holo:["全息镜 1.5×","R6 允许的最高倍率；准星更清晰",{zoom:1.5,adsTime:1.04}]},
  弹匣:{r6Default:["标准弹匣","10 发；无操控惩罚",{mag:10}],r6Fifteen:["15 发弹匣","腰射散布 +20%；开镜时间 +12%",{mag:15,hipSpread:1.2,adsTime:1.12}],r6Thirty:["30 发弹匣","腰射散布 +45%；开镜时间 +28%",{mag:30,hipSpread:1.45,adsTime:1.28}]}
};
for(const choices of Object.values(MODS))if(choices.战术扩展)choices.战术扩展.phaseFlashlight=["相位手电","持续照明；按 Enter 相位闪，前方目标致盲 3 秒并耳鸣；20 秒恢复，最多 1 次",{flashlight:true,phaseFlashlight:true}];
MODS.smg.弹匣={quick:["快速弹匣","36 发，换弹更快",{mag:36,reload:.72}],extended:["扩容弹匣","45 发，换弹变慢",{mag:45,reload:1.23}],drum:["鼓式弹匣","60 发，换弹很慢",{mag:60,reload:1.65}]};
MODS.lmg.弹匣={quick:["轻型弹链","45 发，换弹更快",{mag:45,reload:.7}],extended:["重型弹箱","90 发，换弹更慢",{mag:90,reload:1.4}]};
MODS.hammer.弹匣={
  h8Quick:["快速弹匣","10 发；基础换弹 2 秒",{mag:10,reload:2/3}],
  h8Extended:["普通扩容弹匣","15 发；基础换弹 3.5 秒；开镜时间 +25%；腰射散布 +15%",{mag:15,reload:7/6,adsTime:1.25,hipSpread:1.15}],
  h8Large:["大型扩容弹匣","20 发；基础换弹 4 秒；开镜时间 +40%；腰射散布 +30%",{mag:20,reload:4/3,adsTime:1.4,hipSpread:1.3}]
};
const BUILD_KEY="astrift.weaponBuilds.v1",defaultBuilds={frost:{},redline:{},hammer:{},gale:{},meteor:{},shotgun:{},smg:{},revolver:{},lmg:{},autoShotgun:{}},hasSavedBuilds=localStorage.getItem(BUILD_KEY)!==null;
let builds=(()=>{try{return {...defaultBuilds,...JSON.parse(localStorage.getItem(BUILD_KEY)||"{}")}}catch{return structuredClone(defaultBuilds)}})();
// Preserve old H8 magazine choices without letting V6's 42–60 round magazines survive.
if(builds.hammer?.弹匣){const old=builds.hammer.弹匣,mapping={quickMag:'h8Quick',fastLatch:'h8Quick',singlePointMag:'h8Quick',coupledMag:'h8Quick',extended:'h8Extended',lightweightMag:'h8Extended',drum:'h8Large',quadMag:'h8Large'};builds.hammer.弹匣=mapping[old]||old}
if(builds.meteor?.["瞄准"]&&!builds.meteor["瞄具"])builds.meteor["瞄具"]=builds.meteor["瞄准"];if(builds.meteor)delete builds.meteor["瞄准"];
const migratedBuilds=migrateBuilds(builds,MODS);
if(JSON.stringify(builds)!==JSON.stringify(migratedBuilds.builds)){
  try{if(!localStorage.getItem('astrift.weaponBuilds.beforeSlotMigration'))localStorage.setItem('astrift.weaponBuilds.beforeSlotMigration',JSON.stringify(builds));localStorage.setItem(BUILD_KEY,JSON.stringify(migratedBuilds.builds));if(migratedBuilds.conflicts.length)localStorage.setItem('astrift.slotMigrationNotice','配件已归类；槽位冲突时保留原槽位配件，旧方案已备份在本机。请检查改枪台。')}catch{}
  builds=migratedBuilds.builds;
}
try{const notice=localStorage.getItem('astrift.slotMigrationNotice');if(notice){$('migrationNotice').hidden=false;$('migrationNotice').textContent=notice}}catch{}
if(!hasSavedBuilds){
  const starterPlans={
    frost:[["瞄具",["quickScope","fastOptic"]],["枪口",["brake","balanceRing"]],["枪托与握把",["stableGrip","sniperStock"]]],
    redline:[["瞄具",["redDot","holo","compact"]],["枪口",["comp","weight"]],["握把",["vertical","angled"]]],
    hammer:[["瞄具",["redDot","compact"]],["枪口",["comp","weight"]],["握把",["vertical","angled"]]],
    gale:[["瞄具",["galeReflex","galeTwoX"]],["枪口",["galeBrake","galeWeight"]],["枪管",["galeMatch","galeHeavy"]]],
    meteor:[["瞄具",["predictor","wide"]],["尾翼与发射管",["straight","lightTube"]],["操控",["damper","shoulderPad"]]]
  };
  for(const [weapon,slots] of Object.entries(starterPlans))for(const [slot,ids] of slots){const choices=MODS[weapon]?.[slot];const id=ids.find(candidate=>choices?.[candidate]);if(id)builds[weapon][slot]=id;}
  try{localStorage.setItem(BUILD_KEY,JSON.stringify(builds))}catch{}
}
if(!localStorage.getItem("astrift.fiveGunPresets.v1")){
  const presets={shotgun:{瞄具:"redDot",枪口:"diffuser"},smg:{瞄具:"sideDot",枪口:"comp",握把:"angled"},revolver:{瞄具:"r6Fast",弹匣:"r6Default"},lmg:{瞄具:"holo",枪口:"weight",握把:"vertical"},autoShotgun:{瞄具:"redDot",枪口:"diffuser",枪托:"shockStock"}};
  for(const [key,parts] of Object.entries(presets))if(!Object.keys(builds[key]||{}).length)builds[key]=parts;
  try{localStorage.setItem(BUILD_KEY,JSON.stringify(builds));localStorage.setItem("astrift.fiveGunPresets.v1","1")}catch{}
}
const EQUIPMENT={护甲:{light:["轻型纤维护甲","身体减伤 10%，移速 -2%",{body:.1,speed:.98}],medium:["复合战术护甲","身体减伤 20%，移速 -7%",{body:.2,speed:.93}],heavy:["重型相位护甲","身体减伤 32%，移速 -15%",{body:.32,speed:.85}]},头盔:{scout:["侦察头盔","爆头减伤 10%，移速 -1%，视野遮挡 4%",{head:.1,speed:.99,vision:4}],composite:["复合头盔","爆头减伤 22%，移速 -4%，视野遮挡 10%",{head:.22,speed:.96,vision:10}],fortress:["堡垒头盔","爆头减伤 36%，移速 -9%，视野遮挡 18%",{head:.36,speed:.91,vision:18}]},战术道具:{jetpack:["脉冲飞行器","长按空格飞行；100 能量，每秒消耗 10、恢复 2",{type:"jetpack"}],medkit:["医疗注射器","按 G 回复 30 生命；冷却 10 秒",{type:"medkit",cooldown:10000}],squadHeal:["战地救护器","为附近队友恢复 20 生命；冷却 10 秒",{type:"squadHeal",cooldown:10000}],shield:["脉冲护盾","按 G 获得 4 秒 35% 减伤；冷却 22 秒",{type:"shield",cooldown:22000}],scanner:["侦察扫描器","按 G 报告最近敌人方向和距离；冷却 10 秒",{type:"scanner",cooldown:10000}],adrenaline:["战术加速器","按 G 获得 5 秒移速 +28%；冷却 18 秒",{type:"adrenaline",cooldown:18000}],stabilizer:["稳瞄注射剂","按 G 获得 6 秒后坐与散布降低；冷却 20 秒",{type:"stabilizer",cooldown:20000}],phaseCell:["相位充能器","按 G 立即充满相位能量；冷却 24 秒",{type:"phaseCell",cooldown:24000}]},投掷物:{smoke:["烟雾弹","按 C 切出、左键投出；落地立即形成覆盖范围扩大 25% 的浓密烟雾，持续 5 秒；最多 2 枚，每 10 秒补充 1 枚",{type:"smoke"}],grenade:["手雷","按 C 切出或收回，按住左键温雷、松开投掷；最多温 3 秒自动投出，起爆总计 4 秒；直径 25 米范围内按距离造成 70–160 点伤害，自身也会受伤；最多 2 枚，每 10 秒补充 1 枚",{type:"grenade"}]}};
const EQUIPMENT_KEY="astrift.equipment.v1";let equipmentLoadout=(()=>{try{return {...{护甲:"light",头盔:"scout",战术道具:"medkit",投掷物:"smoke"},...JSON.parse(localStorage.getItem(EQUIPMENT_KEY)||"{}")}}catch{return {护甲:"light",头盔:"scout",战术道具:"medkit"}}})();if(!EQUIPMENT.投掷物[equipmentLoadout.投掷物])equipmentLoadout.投掷物="smoke";let equipmentEnergy=100,equipmentReadyAt=0,shieldUntil=0,equipmentMove=1,adrenalineUntil=0,stabilizerUntil=0;
const WEAPON_SLOT_KEY="astrift.weaponSlots.v1",SIDEARM_KEY="astrift.sidearm.v1";let storedWeaponSlots;try{storedWeaponSlots=JSON.parse(localStorage.getItem(WEAPON_SLOT_KEY)||"null")}catch{}const fallbackWeapon=localStorage.getItem("astrift.weapon")||"redline",migratedR6=Array.isArray(storedWeaponSlots)&&storedWeaponSlots.includes("revolver");let weaponSlots=Array.isArray(storedWeaponSlots)&&storedWeaponSlots.length===2&&storedWeaponSlots.every(key=>WEAPONS[key]&&key!=="knife"&&key!=="revolver")?storedWeaponSlots:Array.isArray(storedWeaponSlots)&&storedWeaponSlots.length===2?storedWeaponSlots.map(key=>key==="revolver"?"redline":WEAPONS[key]&&key!=="knife"?key:"redline"):[fallbackWeapon!=="knife"&&fallbackWeapon!=="revolver"&&WEAPONS[fallbackWeapon]?fallbackWeapon:"redline",fallbackWeapon==="redline"?"frost":"redline"],sidearmKey=localStorage.getItem(SIDEARM_KEY)==="revolver"||migratedR6?"revolver":"",activeWeaponSlot=0,weaponKey=weaponSlots[0],weaponDef={...WEAPONS[weaponSlots[0]]},cycling=false,adsMouse=false,adsKey=false,lastLauncherShot=-9999,playerTeam=0,adsBlend=0,viewKick=0,gunKick=0,crossBloom=0,audioContext=null,zoomMode=0;
let viewRoll=0,gunKickSide=0,shotFovPulse=0,audioCompressor=null;

let playing=false,paused=false,online=false,ws=null,playerId=crypto.randomUUID(),yaw=0,pitch=0,hp=100,ammo=30,reserve=Infinity,reloading=false,phase=100,phaseActive=0,lastShot=0,lastSync=0,score=0,redScore=0,verticalVelocity=0,grounded=true,firing=false,prone=false,playerEyeHeight=1.7,reconnectTimer=null,reconnectAttempts=0,allowReconnect=false,activeRoomCode="",respawnTimer=null,weaponActionToken=0,suppressWeaponStash=false,weaponRuntime=[...weaponSlots.map(key=>({key,ammo:null,reserve:Infinity})),{key:sidearmKey||"knife",ammo:null,reserve:Infinity},{key:"knife",ammo:1,reserve:Infinity}],recoilIndex=0,lastRecoilAt=0,feelGrounded=true,weaponBobTime=0,viewKickTarget=0,viewKickVelocity=0,audioNoiseBuffer=null;
let slideStartedAt=0,slideCooldownUntil=0,slideDirectionX=0,slideDirectionZ=0;
const playerLowProfile=()=>prone||Boolean(slideStartedAt);
function stopSlide(jump=false){if(!slideStartedAt)return;slideStartedAt=0;slideCooldownUntil=performance.now()+500;camera.position.y+=1.7-playerEyeHeight;playerEyeHeight=1.7;if(jump){camera.position.y+=.12;verticalVelocity=woundActive("leg")?6.1:8.2;grounded=false}syncNow()}
function startSlide(){const now=performance.now();if(slideStartedAt||now<slideCooldownUntil||!playing||paused||hp<=0||!grounded||prone||!keys.ShiftLeft||!(keys.KeyW||keys.KeyA||keys.KeyS||keys.KeyD))return;slideStartedAt=now;slideDirectionX=-Math.sin(yaw);slideDirectionZ=-Math.cos(yaw);camera.position.y+=.48-playerEyeHeight;playerEyeHeight=.48;syncNow()}
function updateSlide(dt,now){if(!slideStartedAt)return;if(!playing||hp<=0||!grounded){stopSlide();return}const elapsed=now-slideStartedAt;if(elapsed>=1125){stopSlide();return}const progress=elapsed/1125,rising=Math.min(1,(1125-elapsed)/210),nextHeight=1.7-1.22*rising;camera.position.y+=nextHeight-playerEyeHeight;playerEyeHeight=nextHeight;const speed=(11.5*(1-progress)**1.25+1.1)*1.5625*(woundActive("leg")?.7:1),dx=slideDirectionX*speed*dt,dz=slideDirectionZ*speed*dt;if(!blockedForPlayer(camera.position.x+dx,camera.position.z))camera.position.x+=dx;if(!blockedForPlayer(camera.position.x,camera.position.z+dz))camera.position.z+=dz}
let reloadStarted=0,reloadDuration=0,reloadPhase="",switchStarted=0,switchDuration=420,switchTarget=-1,switchCommitted=false,boltStarted=-1,boltDuration=1000,actionNod=0,actionRoll=0;
const rawKeys={},keys=new Proxy(rawKeys,{get(target,code){const action=DEFAULT_ACTION_BY_CODE[code];if(slideStartedAt&&["forward","back","left","right"].includes(action))return false;return action?Boolean(target[keyBindings[action]]):target[code]}}),velocity=new THREE.Vector3(),clock=new THREE.Clock(),bots=[],remotes=new Map(),tracers=[],rockets=[],remoteRockets=[],fireZones=[],thrownItems=[],smokeClouds=[];
let throwCharges=2,nextThrowRefill=0,grenadeReady=false,grenadeCookStarted=0,grenadeCookTimer=null,grenadeHeld=false;
const knockbackVelocity=new THREE.Vector3();
const SUPPLY_POINTS=[[-22,23],[22,-22],[-22,-22],[22,22],[-5,42],[5,-42],[-49,12],[49,-12]];
const SUPPLY_OPTIONS={mark:['战场标记','显示敌人位置 3 秒'],heal:['战地急救','回复 40 生命；满血不可选'],guard:['备用护盾','获得 20 点不可恢复的额外生命；可无限叠加'],ads:['速瞄模组','开镜速度 +50%，持续 20 秒'],hip:['近战稳定器','腰射散布降低 20%，持续 20 秒']};
let supplyState={seq:0,nextAt:0,position:SUPPLY_POINTS[0]},supplyClockOffset=0,supplyPending=false,bonusGuard=0,markUntil=0,adsBoostUntil=0,hipBoostUntil=0;
const supplyCrate=new THREE.Group(),supplyCore=new THREE.Mesh(new THREE.BoxGeometry(1.15,.8,1.15),new THREE.MeshStandardMaterial({color:0x273e4b,metalness:.48,roughness:.38,emissive:0x745824,emissiveIntensity:.36})),supplyLid=new THREE.Mesh(new THREE.BoxGeometry(1.3,.16,1.3),new THREE.MeshStandardMaterial({color:0xd6ad54,metalness:.7,roughness:.25,emissive:0x584114,emissiveIntensity:.35}));
supplyCore.position.y=.46;supplyLid.position.y=.95;const supplyBeacon=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,4,8,1,true),new THREE.MeshBasicMaterial({color:0xf3d979,transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide}));supplyBeacon.position.y=2.4;supplyCrate.add(supplyCore,supplyLid,supplyBeacon);scene.add(supplyCrate);supplyCrate.visible=false;
const supplyMarkerGeometry=new THREE.TorusGeometry(.6,.065,6,20),supplyMarkerMaterial=new THREE.MeshBasicMaterial({color:0xff684f,depthTest:false,depthWrite:false,transparent:true,opacity:.95}),supplyMarkers=[];
function resetSupplyClient(){supplyState={seq:0,nextAt:0,position:SUPPLY_POINTS[0]};supplyClockOffset=0;supplyPending=false;bonusGuard=0;markUntil=adsBoostUntil=hipBoostUntil=0;$('supplyPicker').hidden=true;$('supplyHint').hidden=true;$('supplyTracker').hidden=true;$('supplyBuffs').textContent='';supplyCrate.visible=false;for(const marker of supplyMarkers)marker.visible=false}
function updateSupplyState(data){if(!Array.isArray(data.position)||data.position.length!==2)return;if(Number.isFinite(data.serverNow))supplyClockOffset=data.serverNow-Date.now();const wasPending=supplyPending;supplyState={seq:Number(data.seq)||0,nextAt:Number(data.nextAt)||0,position:data.position};supplyPending=false;$('supplyPicker').hidden=true;if(data.claimedBy===playerId&&SUPPLY_OPTIONS[data.effect])applySupplyReward(data.effect);else if(wasPending)feed('补给已被领取或距离不足，请等下一次刷新')}
function applySupplyReward(effect){const now=performance.now();if(effect==='mark'){markUntil=now+3000}else if(effect==='heal'){hp=Math.min(100,hp+40);updateHud();syncNow()}else if(effect==='guard'){bonusGuard+=20;updateHud()}else if(effect==='ads'){adsBoostUntil=now+20000}else if(effect==='hip'){hipBoostUntil=now+20000}feed(`补给已领取：${SUPPLY_OPTIONS[effect][0]}`)}
function openSupplyPicker(){if(!playing||paused||hp<=0||spectator||duelBlocked()||trainingMode||supplyPending||Date.now()+supplyClockOffset<supplyState.nextAt||Math.hypot(camera.position.x-supplyState.position[0],camera.position.z-supplyState.position[1])>3.3)return;const choices=$('supplyChoices');choices.replaceChildren();for(const [effect,[name,description]] of Object.entries(SUPPLY_OPTIONS)){const button=document.createElement('button'),small=document.createElement('small');button.type='button';button.textContent=name;small.textContent=description;button.appendChild(small);button.disabled=effect==='heal'&&hp>=100;button.onclick=()=>claimSupplyBox(effect);choices.appendChild(button)}$('supplyPicker').hidden=false;if(document.pointerLockElement===canvas)document.exitPointerLock()}
function claimSupplyBox(effect){if(supplyPending||effect==='heal'&&hp>=100)return;supplyPending=true;$('supplyPicker').hidden=true;if(online){if(ws?.readyState===1)sendNetwork({type:'supplyClaim',effect});else{supplyPending=false;feed('补给领取失败：联机未连接')}}else{updateSupplyState({type:'supplyState',seq:supplyState.seq+1,nextAt:Date.now()+30000,position:SUPPLY_POINTS[(supplyState.seq+1)%SUPPLY_POINTS.length],claimedBy:playerId,effect})}if(!paused)requestGamePointerLock()}
function updateSupplyVisual(now){const available=roomMode!=='survival'&&playing&&!trainingMode&&Date.now()+supplyClockOffset>=supplyState.nextAt&&!matchFinished,supplyPosition=supplyState.position;supplyCrate.visible=available;if(available){supplyCrate.position.set(supplyPosition[0],.04,supplyPosition[1]);supplyLid.material.emissiveIntensity=.3+.15*Math.sin(now*.004)}const tracker=$('supplyTracker');tracker.hidden=roomMode==='survival'||!playing||trainingMode||spectator;if(!tracker.hidden){const dx=supplyPosition[0]-camera.position.x,dz=supplyPosition[1]-camera.position.z,direction=`${dx<0?'西':'东'}${dz<0?'北':'南'}`;setText('supplyTracker',available?`补给箱 ${direction} · ${Math.round(Math.hypot(dx,dz))}m`:`补给箱 ${Math.max(0,Math.ceil((supplyState.nextAt-Date.now()-supplyClockOffset)/1000))} 秒后刷新`)}const nearby=available&&!paused&&hp>0&&!spectator&&!duelBlocked()&&Math.hypot(camera.position.x-supplyPosition[0],camera.position.z-supplyPosition[1])<=3.3;$('supplyHint').hidden=!nearby;if(nearby)setText('supplyHint',`补给箱 · 按 ${keyLabel('supply')} 领取`);const buffs=[];if(bonusGuard>0)buffs.push(`额外护盾 ${bonusGuard}`);if(now<adsBoostUntil)buffs.push(`速瞄 ${Math.ceil((adsBoostUntil-now)/1000)}s`);if(now<hipBoostUntil)buffs.push(`腰射稳定 ${Math.ceil((hipBoostUntil-now)/1000)}s`);setText('supplyBuffs',buffs.join(' · '));const enemies=now<markUntil?[...bots.filter(b=>b.visible&&b.userData.team!==playerTeam),...[...remotes.values()].filter(r=>r.mesh.visible&&r.mesh.userData.team!==playerTeam).map(r=>r.mesh)]:[];while(supplyMarkers.length<enemies.length){const marker=new THREE.Mesh(supplyMarkerGeometry,supplyMarkerMaterial);marker.renderOrder=999;scene.add(marker);supplyMarkers.push(marker)}supplyMarkers.forEach((marker,index)=>{marker.visible=Boolean(enemies[index]);if(marker.visible){marker.position.copy(enemies[index].position).add(new THREE.Vector3(0,2.65,0));marker.quaternion.copy(camera.quaternion)}})}
const WOUND_MS={head:1400,body:1100,abdomen:1800,arm:3000,leg:3000,explosion:600};
const WOUND_CHANCE={head:.45,body:.35,abdomen:.4,arm:.5,leg:.5,explosion:.35};
const WOUND_LABEL={head:"头部震荡",body:"胸部受创 · 移速 -20%",abdomen:"腹部受创",arm:"手臂受伤",leg:"腿部受伤",explosion:"爆炸踉跄"};
const wounds=Object.create(null);let woundStatusSignature="";
function woundActive(zone,now=performance.now()){return (wounds[zone]||0)>now}
function clearWounds(){for(const zone of Object.keys(wounds))delete wounds[zone];woundStatusSignature="";$("woundStatus").replaceChildren();$("hud").classList.remove("headWound")}
function woundDuration(zone,gear){const protection=zone==="head"?(gear.helmet?.head||0):(gear.armor?.body||0);return Math.round((WOUND_MS[zone]||0)*(1-protection*.75))}
function applyWound(zone,gear){if(!WOUND_MS[zone]||Math.random()>WOUND_CHANCE[zone])return;const now=performance.now();wounds[zone]=now+woundDuration(zone,gear);renderWounds(now)}
function renderWounds(now=performance.now()){const active=Object.keys(wounds).filter(zone=>wounds[zone]>now),signature=active.map(zone=>`${zone}:${Math.ceil((wounds[zone]-now)/1000)}`).join("|");if(signature===woundStatusSignature)return;woundStatusSignature=signature;$("woundStatus").replaceChildren(...active.map(zone=>{const tag=document.createElement("span");tag.textContent=`${WOUND_LABEL[zone]} ${Math.ceil((wounds[zone]-now)/1000)}s`;return tag}));$("hud").classList.toggle("headWound",active.includes("head"))}
function applyBotWound(bot,zone){if(!WOUND_MS[zone]||bot.userData.hp<=0||Math.random()>WOUND_CHANCE[zone])return;const gear=bot.userData.aiGear||{};bot.userData.wounds??=Object.create(null);bot.userData.wounds[zone]=performance.now()+woundDuration(zone,gear)}
function botWounded(bot,zone,now){return (bot.userData.wounds?.[zone]||0)>now}
function zoneDamage(stats,zone){return stats.damage[zone]??stats.damage[zone==="leg"?"arm":"body"]}
const trainingTargets=[];let trainingMode=false,trainingHits=0,trainingHeadshots=0,trainingShots=0;
const seenDamageReceipts=new Set();
function receiveDamageResult(d){
  if(!playing||d.target!==playerId||typeof d.shotId!=='string'||seenDamageReceipts.has(d.shotId)||!Number.isFinite(d.damage)||d.damage<=0)return;
  const currentRound=isBombMode()?bombState?.round:isArenaMode()?duelState?.round:isObjectiveMode()?objectiveState?.round:undefined;
  if(currentRound!==undefined&&d.round!==currentRound||roomMode==='gunmaster'&&d.bout!==duelState?.bout)return;
  seenDamageReceipts.add(d.shotId);if(seenDamageReceipts.size>512)seenDamageReceipts.delete(seenDamageReceipts.values().next().value);
  const target=remotes.get(d.id)?.mesh,point=Array.isArray(d.position)&&d.position.length===3&&d.position.every(Number.isFinite)?new THREE.Vector3(...d.position):target?.position.clone().add(new THREE.Vector3(0,1.3,0));
  if(point)showDamageNumber(d.damage,point,d.zone||'body');
}
let roomMode='normal',pendingRoomMode='normal',duelState=null,spectator=false,watchTarget='',duelClockOffset=0,lastDuelRoster='',sessionSeq=0,aiDuelRemaining=600,aiDuelLevel='advanced',aiDuelNoAttackUntil=0,isRoomCreator=false,gunmasterWeapon=localStorage.getItem('astrift.gunmasterWeapon')||'redline',survivalSpectating=false,survivalWatchTarget='';
const DUEL_AI_PROFILES={
  normal:{aim:.72,smoke:.22,reaction:150,turn:7,rethink:.7,cap:.92,masterDodge:false},
  advanced:{aim:1,smoke:.22,reaction:80,turn:17,rethink:.12,cap:.92,masterDodge:false},
  advancedPlus:{aim:1.28,smoke:.32,reaction:65,turn:20,rethink:.10,cap:.96,masterDodge:false},
  master:{aim:1.4,smoke:.45,reaction:30,turn:24,rethink:.07,cap:.98,masterDodge:true},
  masterLow:{aim:1.46,smoke:.48,reaction:28,turn:25,rethink:.065,cap:.985,masterDodge:true},
  masterMid:{aim:1.52,smoke:.51,reaction:25,turn:26,rethink:.06,cap:.985,masterDodge:true},
  masterHigh:{aim:1.58,smoke:.55,reaction:23,turn:27,rethink:.055,cap:.985,masterDodge:true},
  masterTop:{aim:1.64,smoke:.58,reaction:20,turn:28,rethink:.05,cap:.985,masterDodge:true}
};
const AI_SLIDE_TRACKING={normal:.22,advanced:.36,advancedPlus:.43,master:.51,masterLow:.56,masterMid:.61,masterHigh:.66,masterTop:.72};
let survivalSolo=false;
let rankedAiActive=false,rankedAiTicket='',rankedAiName='',rankedAiDifficulty='master',rankedQueueRun=0,rankedQueueTicket='',rankedResultRequested=false;
let tournamentWaitStartedAt=0;
let weeklyRun=null,weeklyConditions=null,weeklyBackup=null,weeklyPending=false,weeklyWork=Promise.resolve();
function weeklySetup(eventId,run,conditions){
  if(playing)endMatch();
  weeklyBackup={slots:[...weaponSlots],sidearm:sidearmKey,gear:{...equipmentLoadout},builds:structuredClone(builds)};
  weeklyRun={...run,event:eventId};weeklyConditions=conditions;weeklyWork=Promise.resolve();weeklyPending=false;
  builds={};equipmentLoadout={护甲:'light',头盔:'scout',战术道具:'medkit',投掷物:'smoke'};equipmentMove=.98*.99;sidearmKey=conditions.secondary;
  weeklyStage();
}
function weeklyStage(){
  const menu=[$('menuWeapon1').value,$('menuWeapon2').value],stored=localStorage.getItem(WEAPON_SLOT_KEY);
  $('menuWeapon1').value=$('menuWeapon2').value=weeklyConditions.weapon;
  socialInviteMap=weeklyConditions.map;rankedAiTicket='';rankedAiActive=false;start(false,'aiDuel');
  $('menuWeapon1').value=menu[0];$('menuWeapon2').value=menu[1];if(stored!==null)localStorage.setItem(WEAPON_SLOT_KEY,stored);else localStorage.removeItem(WEAPON_SLOT_KEY);
  aiDuelLevel=weeklyConditions.levels[weeklyRun.stage-1];score=weeklyRun.stageKills;redScore=weeklyRun.stageDeaths;
  $('blueScore').textContent=score;$('redScore').textContent=redScore;equipmentReadyAt=adrenalineUntil=stabilizerUntil=0;equipmentEnergy=100;
  for(const bot of bots){Object.assign(bot.userData,{weapon:weeklyConditions.weapon,secondaryWeapon:weeklyConditions.secondary,skill:.92,aggression:.88,name:'周赛守卫',preferredDistance:18,ammoLeft:WEAPONS[weeklyConditions.weapon].mag,weaponAmmo:{[weeklyConditions.weapon]:WEAPONS[weeklyConditions.weapon].mag,[weeklyConditions.secondary]:WEAPONS[weeklyConditions.secondary].mag}});bot.userData.aiGear={armor:EQUIPMENT.护甲.light[2],helmet:EQUIPMENT.头盔.scout[2],tactical:'medkit',nextUse:performance.now()+3000,shieldUntil:0,adrenalineUntil:0,stabilizerUntil:0};setActorLabel(bot,'周赛守卫',1)}
  $('netText').textContent='武者挑战';$('aiDuelTimer').textContent=`${Math.floor(Math.max(0,weeklyRun.stageStarted+weeklyConditions.stageMs-Date.now())/60000)}:${String(Math.ceil(Math.max(0,weeklyRun.stageStarted+weeklyConditions.stageMs-Date.now())/1000)%60).padStart(2,'0')}`;$('helmetVision').className='helmetVision helmet-scout';$('aiDuelPanel').querySelector('b').textContent=`武者挑战 · 第 ${weeklyRun.stage}/3 关`;$('aiDuelPanel').querySelector('small').textContent=`击杀 ${weeklyConditions.killsToClear} 次通关 · 死亡 3 次结束`;$('roomLabel').textContent=`武者挑战 · ${MAP_NAMES[activeMapId]}`;document.querySelector('.score>span').textContent='本关击杀 / 死亡';clearMatchRecovery();
}
function weeklyReport(action){
  if(!weeklyRun||weeklyRun.status!=='running')return;
  const id=weeklyRun.id,account=accountSession(),eventId=weeklyRun.event;
  if(!account)return;
  if(action==='finish'||score>=(weeklyConditions?.killsToClear||4)||redScore>=3){weeklyPending=true;matchFinished=true;firing=false;clearInterval(respawnTimer);respawnTimer=null;$('respawn').hidden=true}
  weeklyWork=weeklyWork.then(async()=>{
    if(!weeklyRun||weeklyRun.id!==id)return;
    const seq=weeklyRun.seq+1;let result;
    for(let attempt=0;attempt<6;attempt++){try{result=await accountApi('tournaments/weeklyStep',{...account,eventId,runId:id,seq,action});break}catch(error){if(attempt===5){if(weeklyRun?.id===id){feed('挑战记录连接失败，请退出后从赛事继续');weeklyPending=true;matchFinished=true}return}await new Promise(resolve=>setTimeout(resolve,1000*Math.min(4,attempt+1)))}}
    if(!weeklyRun||weeklyRun.id!==id||!result)return;
    const oldStage=weeklyRun.stage;weeklyRun=result.run;
    if(weeklyRun.status==='finished'){
      weeklyPending=false;matchFinished=true;firing=false;clearInterval(respawnTimer);respawnTimer=null;$('respawn').hidden=true;$('aiDuelWinner').textContent=weeklyRun.clears===3?'三关通关':'挑战结束';$('aiDuelFinal').textContent=`${weeklyRun.clears} 关 · ${weeklyRun.kills} 杀 / ${weeklyRun.deaths} 死 · ${(weeklyRun.elapsed/1000).toFixed(1)} 秒`;$('aiDuelResult').hidden=false;$('aiDuelRetry').textContent='返回周赛';if(document.pointerLockElement===canvas)document.exitPointerLock();
    }else if(oldStage!==weeklyRun.stage){weeklyPending=false;weeklyStage()}
  }).catch(()=>{});
}
let restoringMatch=false,socialInviteMap='';
function saveCurrentMatch(){
  if(weeklyRun||roomMode==='extraction'||roomMode==='tutorial')return;
  if(!playing)return;
  writeMatchRecovery({
    online,survivalSolo,mode:roomMode,training:trainingMode,id:playerId,name:$('name').value,room:activeRoomCode.toUpperCase(),team:playerTeam,creator:isRoomCreator,map:activeMapId,
    slots:[...weaponSlots],sidearm:sidearmKey,activeSlot:activeWeaponSlot,weaponRuntime:weaponRuntime.map(item=>({key:item.key,ammo:item.ammo,reserve:Number.isFinite(item.reserve)?item.reserve:null})),
    position:camera.position.toArray(),yaw,pitch,hp,score,redScore,phase,throwCharges,
    aiLevel:aiDuelLevel,aiSeconds:aiDuelRemaining,rankedAi:rankedAiActive,rankedAiTicket:rankedAiActive?rankedAiTicket:undefined,rankedAiName:rankedAiActive?rankedAiName:undefined,rankedAiDifficulty:rankedAiActive?rankedAiDifficulty:undefined,bombPreset:$('bombPreset').value,gunmasterWeapon,
    towerState:roomMode==='survival'&&!online?towerSurvival.state:undefined,survivalWave:roomMode==='survival'?survivalWave:undefined,survivalKills:roomMode==='survival'?survivalKills:undefined,
    trainingShots:trainingMode?trainingShots:undefined,trainingHits:trainingMode?trainingHits:undefined,trainingHeadshots:trainingMode?trainingHeadshots:undefined,
    bots:online||trainingMode?undefined:bots.map(bot=>({position:bot.position.toArray(),rotation:bot.rotation.y,hp:bot.userData.hp,visible:bot.visible,weapon:bot.userData.weapon,name:bot.userData.name,team:bot.userData.team})),
  });
}
function showMatchRecovery(){
  const saved=readMatchRecovery(),button=$('resumePreviousMatch');
  button.hidden=!saved;if(!saved)return;
  button.querySelector('b').textContent=saved.rankedAi?'排位赛':'返回上一局';
  const labels={normal:'普通对战',duel:'单挑',tournament:'武者大赛',tri:'1v1v1',quad:'1v1v1v1',gunmaster:'武器大师',challenge:'枪械挑战',ctf:'夺旗',hardpoint:'据点争夺',bomb:'相位爆破',survival:'高塔生存',aiDuel:'单挑 AI'};
  $('resumePreviousMatchInfo').textContent=`${saved.training?'武器练习场':saved.rankedAi?'排位赛':labels[saved.mode]||'上一局'} · ${saved.survivalSolo?'单人':saved.online?`房间 ${saved.room}`:MAP_NAMES[saved.map]||'单人'} · ${saved.name||'玩家'}`;
}
function restorePreviousMatch(){
  const saved=readMatchRecovery();if(!saved){showMatchRecovery();return}
  $('name').value=accountSession()?.name||String(saved.name||'游隼-07').slice(0,14);
  if(MAP_NAMES[saved.map])$('mapSelect').value=saved.map;
  if(Array.isArray(saved.slots)&&saved.slots.length===2&&saved.slots.every(key=>WEAPONS[key]&&key!=='knife'&&key!=='revolver')){
    $('menuWeapon1').value=saved.slots[0];$('menuWeapon2').value=saved.slots[1];
  }
  if(saved.sidearm===''||saved.sidearm==='revolver')setSidearm(saved.sidearm);
  rankedAiActive=Boolean(saved.rankedAi&&saved.rankedAiTicket&&saved.rankedAiName);rankedAiTicket=rankedAiActive?saved.rankedAiTicket:'';rankedAiName=rankedAiActive?saved.rankedAiName:'';rankedAiDifficulty=rankedAiActive&&DUEL_AI_PROFILES[saved.rankedAiDifficulty]?saved.rankedAiDifficulty:'master';
  if(saved.aiLevel)$('aiDuelDifficulty').value=saved.aiLevel;
  if(saved.bombPreset&&BOMB_PRESETS[saved.bombPreset])$('bombPreset').value=saved.bombPreset;
  if(saved.gunmasterWeapon&&WEAPONS[saved.gunmasterWeapon])$('menuGunmasterWeapon').value=saved.gunmasterWeapon;
  $('roomDialog').dataset.mode=saved.online?(saved.creator?'create':'join'):'solo';
  survivalSolo=saved.mode==='survival'&&Boolean(saved.survivalSolo);
  if(saved.online){playerId=saved.id;playerTeam=saved.team===1?1:0;pendingRoomMode=saved.mode;$('room').value=saved.room}
  restoringMatch=true;
  try{if(saved.training&&!saved.online)startTraining();else start(Boolean(saved.online),saved.mode)}finally{restoringMatch=false}
  if(saved.online)playerTeam=saved.team===1?1:0;
  if(Array.isArray(saved.position)&&saved.position.length===3&&saved.position.every(Number.isFinite))camera.position.set(...saved.position);
  if(Number.isFinite(saved.yaw))yaw=saved.yaw;
  if(Number.isFinite(saved.pitch))pitch=saved.pitch;
  if(Number.isFinite(saved.hp))hp=THREE.MathUtils.clamp(saved.hp,0,100);
  if(Number.isFinite(saved.phase))phase=THREE.MathUtils.clamp(saved.phase,0,100);
  if(Number.isFinite(saved.throwCharges))throwCharges=THREE.MathUtils.clamp(saved.throwCharges,0,2);
  if(!saved.online){score=Number.isFinite(saved.score)?saved.score:0;redScore=Number.isFinite(saved.redScore)?saved.redScore:0;$('blueScore').textContent=String(score);$('redScore').textContent=String(redScore)}
  if(Number.isInteger(saved.activeSlot)&&saved.activeSlot>=0&&saved.activeSlot<weaponRuntime.length){activeWeaponSlot=saved.activeSlot;selectWeapon(weaponRuntime[activeWeaponSlot].key,{equip:false})}
  if(Array.isArray(saved.weaponRuntime))for(let i=0;i<Math.min(saved.weaponRuntime.length,weaponRuntime.length);i++){
    const source=saved.weaponRuntime[i],target=weaponRuntime[i];if(source?.key!==target.key)continue;
    if(Number.isFinite(source.ammo))target.ammo=Math.max(0,source.ammo);
    target.reserve=Number.isFinite(source.reserve)?Math.max(0,source.reserve):Infinity;
  }
  ammo=weaponRuntime[activeWeaponSlot]?.ammo??ammo;reserve=weaponRuntime[activeWeaponSlot]?.reserve??reserve;
  if(!saved.online){
    if(roomMode==='survival'&&Number.isInteger(saved.survivalWave)&&saved.survivalWave>1){clearSurvivalBots();survivalWave=saved.survivalWave;spawnBots()}
    if(roomMode==='survival'&&saved.towerState)towerSurvival.restore(saved.towerState)
    if(roomMode==='aiDuel'&&Number.isFinite(saved.aiSeconds))aiDuelRemaining=Math.max(0,saved.aiSeconds);
    if(trainingMode){trainingShots=saved.trainingShots||0;trainingHits=saved.trainingHits||0;trainingHeadshots=saved.trainingHeadshots||0;setText('practiceHits',trainingHits);setText('practiceHeadshots',trainingHeadshots);updatePracticeStats()}
    if(Array.isArray(saved.bots))for(let i=0;i<Math.min(bots.length,saved.bots.length);i++){
      const source=saved.bots[i],bot=bots[i];if(!Array.isArray(source.position)||source.position.length!==3||!source.position.every(Number.isFinite))continue;
      bot.position.set(...source.position);bot.rotation.y=Number(source.rotation)||0;bot.userData.hp=THREE.MathUtils.clamp(Number(source.hp)||0,0,100);bot.visible=Boolean(source.visible)&&bot.userData.hp>0;
      if(WEAPONS[source.weapon])bot.userData.weapon=source.weapon;
      if(typeof source.name==='string'){bot.userData.name=source.name.slice(0,14);setActorLabel(bot,bot.userData.name,bot.userData.team)}
    }
  }
  updateHud();saveCurrentMatch();$('resumePreviousMatch').hidden=true;feed('已返回上一局');
}
$('resumePreviousMatch').onclick=restorePreviousMatch;
let soloNoAttackUntil=0;
const ARENA_SEATS={duel:2,ranked:2,tournament:2,tri:3,quad:4,gunmaster:2,challenge:2},ARENA_TEAMS=[{name:'蓝队',identity:'蓝隙队',color:'#5fc5ff',mesh:0x4fbfff},{name:'红队',identity:'红潮队',color:'#ff6680',mesh:0xff596f},{name:'紫队',identity:'紫曜队',color:'#b98aff',mesh:0xa66bea},{name:'绿队',identity:'绿穹队',color:'#70dfa1',mesh:0x4acb82}];
const isTenPointMode=()=>roomMode==='ranked'||roomMode==='tournament';
function isArenaMode(){return Object.hasOwn(ARENA_SEATS,roomMode)}
function arenaTitle(){return roomMode==='ranked'?'排位对战':roomMode==='tournament'?'武者大赛':roomMode==='tri'?'1v1v1':roomMode==='quad'?'1v1v1v1':roomMode==='gunmaster'?'武器大师':roomMode==='challenge'?'枪械挑战房':'单挑'}
let matchFinished=false,scoreRevision=-1;const seenKills=new Set();
function applyScoreboard(d){if(d.revision<scoreRevision)return;scoreRevision=d.revision;score=d.blue;redScore=d.red;$("blueScore").textContent=score;$("redScore").textContent=redScore;if(d.kill&&!seenKills.has(d.kill.id)){seenKills.add(d.kill.id);feed(`${d.kill.killer} 击倒 ${d.kill.victim}`);if(d.kill.killerId===playerId)showKillToast(d.kill.victim,!!d.kill.knife);const victim=remotes.get(d.kill.victimId);if(victim)victim.mesh.visible=false}}
function awardKill(team,killer,victim){if(online||matchFinished)return;if(isObjectiveMode()){feed(`${killer} 击倒 ${victim}`);if(killer===$("name").value)showKillToast(victim,weaponKey==='knife');return;}if(team===0)score++;else redScore++;$("blueScore").textContent=score;$("redScore").textContent=redScore;feed(`${killer} 击倒 ${victim}`);if(killer===$("name").value)showKillToast(victim,weaponKey==='knife');if(weeklyRun)weeklyReport(team===0?'kill':'death');if(rankedAiActive&&roomMode==='aiDuel'&&(score>=10||redScore>=10))queueMicrotask(finishAiDuel)}
const SPAWN_POINTS=[[-5,42],[5,-42],[-49,12],[49,-12],[-22,23],[22,-22],[-22,-22],[22,22]];const BOMB_SPAWN_POINTS=[[0,180],[-32,180],[32,180],[-16,168],[16,168],[0,-180],[-32,-180],[32,-180],[-16,-168],[16,-168]].map(([x,z])=>[x*BOMB_MAP_SCALE,z*BOMB_MAP_SCALE]);
function randomSpawn(exclude,team=playerTeam){if(roomMode==='survival')return new THREE.Vector3(online?-2:0,TOWER_HEIGHT+1.7,0);const spawnPool=isBombMode()?BOMB_SPAWN_POINTS:SPAWN_POINTS,points=isObjectiveMode()||isBombMode()||roomMode==='gunmaster'&&(team===0||team===1)?spawnPool.filter(([,z])=>team===0?z>0:z<0):spawnPool;const blockers=[];if(playing&&hp>0)blockers.push(camera.position);for(const b of bots)if(b.visible&&b.userData.hp>0&&Number.isFinite(b.position.x)&&Number.isFinite(b.position.z))blockers.push(b.position);for(const r of remotes.values())if(r.mesh.visible&&r.hp>0)blockers.push(r.mesh.position);const safeDistance=18,farEnough=(x,z)=>!blockers.some(p=>Math.hypot(x-p.x,z-p.z)<safeDistance)&&(!exclude||Math.hypot(x-exclude.x,z-exclude.z)>14),safe=points.filter(([x,z])=>!blocked(x,z)&&farEnough(x,z)),open=points.filter(([x,z])=>!blocked(x,z)),pool=safe.length?safe:open.length?open:points;let best=pool[0],bestScore=-Infinity;for(const candidate of pool){const [x,z]=candidate,score=Math.min(...blockers.map(p=>Math.hypot(x-p.x,z-p.z)),Infinity);if(score>bestScore){best=candidate;bestScore=score}}const [x,z]=best||points[0];return new THREE.Vector3(x,1.7,z)}
let lastCompetitiveSpawn=-1;
function isCompetitiveSpawnMode(){return roomMode==='duel'||roomMode==='ranked'||roomMode==='tournament'||roomMode==='aiDuel'}
function chooseCompetitiveSpawn(team,lastIndex,forBot=false){
  const enemies=[];
  if(forBot){if(playing&&hp>0)enemies.push(camera.position)}
  else{
    for(const b of bots)if(b.visible&&b.userData.hp>0&&b.userData.team!==team)enemies.push(b.position);
    for(const r of remotes.values())if(r.mesh.visible&&r.hp>0&&r.mesh.userData.team!==team)enemies.push(r.mesh.position);
  }
  const open=SPAWN_POINTS.map(([x,z],index)=>({x,z,index})).filter(p=>!blocked(p.x,p.z));
  const fresh=open.filter(p=>p.index!==lastIndex),candidates=fresh.length?fresh:open;
  if(!candidates.length)return {position:randomSpawn(),index:lastIndex};
  const evaluated=candidates.map(p=>{
    const nearest=Math.min(Infinity,...enemies.map(enemy=>Math.hypot(p.x-enemy.x,p.z-enemy.z)));
    const exposed=enemies.some(enemy=>hasLineOfSight(new THREE.Vector3(p.x,1.5,p.z),new THREE.Vector3(enemy.x,1.5,enemy.z)));
    return {...p,nearest,exposed};
  });
  let pool=evaluated.filter(p=>p.nearest>=18&&!p.exposed);
  if(!pool.length)pool=evaluated.filter(p=>p.nearest>=18);
  if(!pool.length)pool=evaluated.filter(p=>p.nearest>=12&&!p.exposed);
  if(!pool.length){const best=Math.max(...evaluated.map(p=>p.nearest));pool=evaluated.filter(p=>p.nearest>=best-.01)}
  if(enemies.length===0&&(team===0||team===1)){const ownSide=pool.filter(p=>team===0?p.z>0:p.z<0);if(ownSide.length)pool=ownSide}
  const chosen=pool[Math.floor(Math.random()*pool.length)];
  return {position:new THREE.Vector3(chosen.x,1.7,chosen.z),index:chosen.index};
}
function playerSpawn(){if(!isCompetitiveSpawnMode())return randomSpawn();const spawn=chooseCompetitiveSpawn(playerTeam,lastCompetitiveSpawn);lastCompetitiveSpawn=spawn.index;return spawn.position}
function syncRoomMap(id){if(roomMode==='survival'){setMap('survival');return;}if(!mapWorlds.has(id))return;if(activeMapId!==id){setMap(id);camera.position.copy(playerSpawn());yaw=Math.atan2(camera.position.x,camera.position.z);pitch=0;verticalVelocity=0;grounded=true;feed(`房主地图：${MAP_NAMES[id]}`)}if(online)$('roomLabel').textContent=`${roomMode==='ranked'?'排位对战':roomMode==='tournament'?'武者大赛':/^M[a-f0-9]{25}$/i.test(activeRoomCode)?'快速单挑':activeRoomCode.toUpperCase()} · ${MAP_NAMES[activeMapId]}`}
camera.position.copy(randomSpawn());
const CALLSIGN_FIRST=["星岚","霜羽","夜航","苍雷","流萤","暮光","银隼","青焰","远潮","零弦","天际","雾刃"],CALLSIGN_LAST=["先锋","游骑","巡星","疾影","守望","逐光","破晓","回声","猎风","跃迁"];
function generateCallsign(){const bytes=new Uint8Array(3);crypto.getRandomValues(bytes);return `${CALLSIGN_FIRST[bytes[0]%CALLSIGN_FIRST.length]}${CALLSIGN_LAST[bytes[1]%CALLSIGN_LAST.length]}-${String(bytes[2]%100).padStart(2,"0")}`.slice(0,14)}
try{$('name').value=(localStorage.getItem('astrift.callsign')||$('name').value).slice(0,14);$('menuGunmasterWeapon').value=WEAPONS[gunmasterWeapon]&&gunmasterWeapon!=='knife'?gunmasterWeapon:'redline'}catch{}
$('name').addEventListener('input',()=>{const value=$('name').value.replace(/[<>]/g,'').slice(0,14);if(value!==$('name').value)$('name').value=value;try{localStorage.setItem('astrift.callsign',value)}catch{}});
$('menuGunmasterWeapon').addEventListener('change',()=>{gunmasterWeapon=$('menuGunmasterWeapon').value;try{localStorage.setItem('astrift.gunmasterWeapon',gunmasterWeapon)}catch{}});
for(const select of [$('menuWeapon1'),$('menuWeapon2'),$('menuGunmasterWeapon')])for(const option of select.options)if(WEAPONS[option.value])option.textContent=WEAPONS[option.value].name;
function updatePlayerIdentity(waiting=false){const name=$("name").value,team=waiting?"等待分队":isArenaMode()&&spectator?"观战席":ARENA_TEAMS[playerTeam]?.identity||"红潮队";$("playerIdentityName").textContent=name;$("playerIdentityTeam").textContent=team;$("playerIdentity").dataset.team=waiting?"":String(playerTeam)}

function actorMesh(color=0xff496c){
  const g=new THREE.Group(),pose=new THREE.Group(),armor=new THREE.MeshStandardMaterial({color,roughness:.34,metalness:.72}),dark=new THREE.MeshStandardMaterial({color:0x111820,roughness:.55,metalness:.62}),glow=new THREE.MeshBasicMaterial({color:color===0x5ff5ff?0xbaffff:0xffd08a});g.rotation.order='YXZ';g.add(pose);
  const part=(geometry,material,x,y,z)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=material===armor&&y>1.1&&geometry.type==='BoxGeometry';pose.add(m);return m};
  const torso=part(new THREE.BoxGeometry(.78,.82,.42),armor,0,1.25,0);torso.userData.hitZone="body";
  const armorPlate=part(new THREE.BoxGeometry(.58,.5,.055),new THREE.MeshStandardMaterial({color:0x33424d,roughness:.34,metalness:.76}),0,1.27,-.238);armorPlate.userData.hitZone="body";
  part(new THREE.BoxGeometry(.9,.13,.48),dark,0,1.61,0);part(new THREE.BoxGeometry(.58,.28,.42),dark,0,.78,0).userData.hitZone="abdomen";
  const head=part(new THREE.SphereGeometry(.34,12,8),dark,0,1.92,0);head.scale.y=.9;head.userData.hitZone="head";
  const helmetMaterial=new THREE.MeshStandardMaterial({color:0x293b49,roughness:.38,metalness:.68}),helmetShell=part(new THREE.SphereGeometry(.37,12,8,0,Math.PI*2,0,Math.PI/2),helmetMaterial,0,2.02,0);helmetShell.userData.hitZone="head";
  const visorMaterial=new THREE.MeshStandardMaterial({color:0x67dff0,emissive:0x125568,emissiveIntensity:.45,metalness:.75,roughness:.2}),helmetVisor=part(new THREE.BoxGeometry(.39,.075,.09),visorMaterial,0,1.99,-.285);helmetVisor.userData.hitZone="head";
  part(new THREE.BoxGeometry(.58,.14,.05),glow,0,1.94,-.31).userData.hitZone="head";
  const leftArm=part(new THREE.CapsuleGeometry(.12,.55,4,7),armor,-.54,1.27,-.05),rightArm=part(new THREE.CapsuleGeometry(.12,.55,4,7),armor,.54,1.27,-.05);leftArm.userData.hitZone=rightArm.userData.hitZone="arm";leftArm.rotation.x=rightArm.rotation.x=-.72;leftArm.rotation.z=.08;rightArm.rotation.z=-.08;
  const leftLeg=part(new THREE.CapsuleGeometry(.14,.66,4,7),dark,-.22,.36,0),rightLeg=part(new THREE.CapsuleGeometry(.14,.66,4,7),dark,.22,.36,0);leftLeg.userData.hitZone=rightLeg.userData.hitZone="leg";
  const rifle=part(new THREE.BoxGeometry(.13,.16,.9),dark.clone(),.18,1.22,-.48);rifle.rotation.x=-.28;const rifleGlow=part(new THREE.BoxGeometry(.06,.06,.55),glow,.18,1.08,-1.07);
  const heldBlade=part(new THREE.BoxGeometry(.055,.085,.7),new THREE.MeshStandardMaterial({color:0xb9eafa,metalness:.8,roughness:.2,emissive:0x163d4c}),.18,1.12,-.54);heldBlade.rotation.x=-.36;heldBlade.visible=false;
  const heldGuard=part(new THREE.BoxGeometry(.2,.075,.12),new THREE.MeshStandardMaterial({color:0x345365,metalness:.8,roughness:.3}),.18,1.06,-.23);heldGuard.visible=false;
  const heldGrip=part(new THREE.BoxGeometry(.12,.1,.3),new THREE.MeshStandardMaterial({color:0x17222b,roughness:.75}),.18,1.08,.01);heldGrip.visible=false;
  g.userData={hp:100,pose,leftLeg,rightLeg,leftArm,rightArm,rifle,rifleGlow,heldBlade,heldGuard,heldGrip,helmetShell,helmetVisor,armorPlate,walkPhase:Math.random()*6,prone:false,slide:false};if(color!==0x6ca65d)dressFpsActor(g,color);return g;
}
function setActorLabel(actor,name,team){name=String(name||"玩家").slice(0,14);if(actor.userData.nameTag){actor.remove(actor.userData.nameTag);actor.userData.nameTag.material.map?.dispose();actor.userData.nameTag.material.dispose()}const label=document.createElement("canvas");label.width=512;label.height=96;const ctx=label.getContext("2d"),teamInfo=ARENA_TEAMS[team]||ARENA_TEAMS[1];ctx.fillStyle="rgba(3,8,15,.78)";ctx.fillRect(8,8,496,80);ctx.strokeStyle=teamInfo.color;ctx.lineWidth=4;ctx.strokeRect(8,8,496,80);ctx.font="700 32px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle="#ffffff";ctx.fillText(`${t(teamInfo.name)} · ${actor.userData.trainingTarget?t(name):name}`,256,49,475);const texture=new THREE.CanvasTexture(label);texture.colorSpace=THREE.SRGBColorSpace;const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:true,depthWrite:false});material.depthTest=true;material.depthWrite=false;const tag=new THREE.Sprite(material);tag.renderOrder=0;tag.scale.set(3.7,.7,1);tag.position.set(0,actor.userData.prone?.9:2.55,0);actor.add(tag);actor.userData.name=name;actor.userData.team=team;actor.userData.nameTag=tag}
function disposeActorLabel(actor){const tag=actor.userData.nameTag;if(!tag)return;tag.material.map?.dispose();tag.material.dispose();actor.userData.nameTag=null}
// Labels are display-only: Sprite.raycast requires a camera and must never block bullets.
const createActorLabel = setActorLabel;
setActorLabel = function(actor,name,team) {
  createActorLabel(actor,name,team);
  actor.userData.nameTag.raycast = () => {};
};
function setActorProne(actor,value,instant=false){if(actor.userData.prone===value&&!instant)return;actor.userData.prone=value;const pose=actor.userData.pose;if(!pose)return;pose.rotation.x=value?Math.PI/2:0;pose.position.set(0,value?.38:0,value?-1.2:0);actor.userData.leftLeg.rotation.x=value?0:actor.userData.leftLeg.rotation.x;actor.userData.rightLeg.rotation.x=value?0:actor.userData.rightLeg.rotation.x;if(actor.userData.nameTag)actor.userData.nameTag.position.y=value?.9:2.55}
function setActorSlide(actor,value){if(actor.userData.slide===value)return;actor.userData.slide=value;const pose=actor.userData.pose;if(!pose)return;if(value){pose.rotation.x=.72;pose.position.set(0,.08,.16);pose.scale.y=.48;actor.userData.leftLeg.rotation.x=-.65;actor.userData.rightLeg.rotation.x=-.85}else if(actor.userData.prone){setActorProne(actor,true,true);pose.scale.y=1}else{pose.rotation.x=0;pose.position.set(0,0,0);pose.scale.y=1;actor.userData.leftLeg.rotation.x=0;actor.userData.rightLeg.rotation.x=0}if(actor.userData.nameTag)actor.userData.nameTag.position.y=value?1.18:actor.userData.prone?.9:2.55}
function toggleProne(){if(!playing||hp<=0||!grounded)return;if(!prone&&blockedForPlayer(camera.position.x,camera.position.z,true)){feed("此处空间不足，无法趴下");return}prone=!prone;const nextHeight=prone?.48:1.7;camera.position.y+=nextHeight-playerEyeHeight;playerEyeHeight=nextHeight;verticalVelocity=0;syncNow();feed(prone?"已趴下 · 移动速度降低":"已起身")}
function equipBot(bot,index){const armorKeys=Object.keys(EQUIPMENT.护甲),helmetKeys=Object.keys(EQUIPMENT.头盔),tacticalKeys=["medkit","squadHeal","shield","adrenaline","stabilizer"],armor=EQUIPMENT.护甲[armorKeys[Math.floor(Math.random()*armorKeys.length)]][2],helmet=EQUIPMENT.头盔[helmetKeys[Math.floor(Math.random()*helmetKeys.length)]][2],tactical=tacticalKeys[(index+Math.floor(Math.random()*tacticalKeys.length))%tacticalKeys.length];bot.userData.aiGear={armor,helmet,tactical,nextUse:performance.now()+1500+Math.random()*4500,shieldUntil:0,adrenalineUntil:0,stabilizerUntil:0};bot.userData.helmetShell.material.color.set(helmet.head>=.3?0x594e69:helmet.head>=.2?0x375a68:0x38533e);bot.userData.helmetVisor.material.color.set(helmet.head>=.3?0xb88cff:helmet.head>=.2?0x67dff0:0x7affb8);bot.userData.armorPlate.material.color.set(armor.body>=.3?0x70614e:armor.body>=.2?0x43565d:0x334f46);}
function switchBotWeapon(bot,key,now){if(!WEAPONS[key]||bot.userData.weapon===key)return false;bot.userData.weapon=key;bot.userData.ammoLeft=bot.userData.weaponAmmo?.[key]??WEAPONS[key].mag;bot.userData.reloadUntil=0;bot.userData.sightReadyAt=now+220;bot.userData.weaponSwitchUntil=now+260;return true}
function triggerDuelBotDodge(bot,now=performance.now()){
  if(roomMode!=='aiDuel'||aiDuelLevel==='normal'||bot.userData.hp<=0||now<(bot.userData.dodgeCooldownUntil||0))return;
  const toward=camera.position.clone().sub(bot.position).setY(0),distance=toward.length();
  if(distance<3||distance>27||!hasLineOfSight(bot.position.clone().setY(1.35),camera.position.clone().add(new THREE.Vector3(0,-.45,0)),true))return;
  toward.normalize();const facing=new THREE.Vector3(0,0,1).applyQuaternion(bot.quaternion).setY(0).normalize();
  if(facing.dot(toward)<.45||blockedForProneBot(bot.position.x,bot.position.z,bot.rotation.y))return;
  const masterDodge=DUEL_AI_PROFILES[aiDuelLevel]?.masterDodge;
  bot.userData.dodgeProneUntil=now+(masterDodge?390:480);
  bot.userData.dodgeHopUntil=bot.userData.dodgeProneUntil+(masterDodge?2100:1700);
  bot.userData.dodgeCooldownUntil=now+(masterDodge?4600:5600);
  bot.userData.dodgeSide=Math.random()<.5?-1:1;
  bot.userData.dodgeSwitchAt=bot.userData.dodgeProneUntil;
  bot.userData.hopUntil=0;
  setActorProne(bot,true);
}
function applyBotDamage(bot,amount,zone="body",playerShot=false){if(roomMode==='survival')return towerSurvival.hit(bot,amount);if(online&&roomMode==='survival'&&!isSurvivalHost()){sendNetwork({type:'survivalHit',botId:bot.userData.networkId,damage:amount,zone});const protection=zone==='head'?bot.userData.aiGear?.helmet.head:bot.userData.aiGear?.armor.body;return Math.max(1,Math.round(amount*(1-(protection||0))))}const gear=bot.userData.aiGear;if(!gear){bot.userData.hp=(bot.userData.hp||100)-amount;applyBotWound(bot,zone);if(playerShot)triggerDuelBotDodge(bot);return amount}const protection=zone==="head"?gear.helmet.head:zone==="explosion"?gear.armor.body*.55:gear.armor.body,shield=performance.now()<gear.shieldUntil?.35:0,dealt=Math.max(1,Math.round(amount*(1-protection)*(1-shield)));bot.userData.hp=(bot.userData.hp||100)-dealt;applyBotWound(bot,zone);if(playerShot)triggerDuelBotDodge(bot);return dealt}
function useBotTactical(bot,target,distance,now){const gear=bot.userData.aiGear;if(!gear||now<gear.nextUse)return;let used=false;if(gear.tactical==="medkit"&&bot.userData.hp<=62){bot.userData.hp=Math.min(100,bot.userData.hp+30);bot.userData.wounds=Object.create(null);used=true}else if(gear.tactical==="squadHeal"){const allies=bots.filter(other=>other!==bot&&other.visible&&other.userData.team===bot.userData.team&&other.userData.hp<85&&other.position.distanceTo(bot.position)<12);if(allies.length){for(const ally of allies){ally.userData.hp=Math.min(100,ally.userData.hp+20);ally.userData.wounds=Object.create(null)}used=true}}else if(gear.tactical==="shield"&&bot.userData.hp<=78&&target.kind!=="objective"&&distance<25){gear.shieldUntil=now+4000;used=true}else if(gear.tactical==="adrenaline"&&distance>16){gear.adrenalineUntil=now+5000;used=true}else if(gear.tactical==="stabilizer"&&target.kind!=="objective"&&distance<32){gear.stabilizerUntil=now+6000;used=true}if(used)gear.nextUse=now+(EQUIPMENT.战术道具[gear.tactical][2].cooldown||10000)}
function spawnBots(){if(roomMode==='survival')return;const ctf=roomMode==="ctf",survival=roomMode==='survival',aiDuel=roomMode==='aiDuel',count=roomMode==="extraction"?12:aiDuel?1:survival?Math.min(4+survivalWave+2*(survivalPlayers-1),16):ctf?10:11,weapons=aiDuel?["hammer","redline","gale","frost","smg","revolver","lmg"]:ctf?["redline","redline","gale","gale","frost","smg","shotgun"]:survival?["redline","gale","frost","smg","shotgun","lmg"]:["redline","frost","gale","meteor","shotgun","smg","revolver","lmg","autoShotgun"];for(let i=0;i<count;i++){const team=aiDuel||survival||roomMode==="extraction"?1:i<5?0:1,color=team===0?0x4fbfff:0xff596f,m=actorMesh(color),initialSpawn=aiDuel?chooseCompetitiveSpawn(team,-1,true):null,p=initialSpawn?.position||randomSpawn(undefined,team),botName=aiDuel?(rankedAiActive?rankedAiName:'猎影 AI'):generateCallsign();m.position.set(p.x,0,p.z);const aiWeapon=weapons[Math.floor(Math.random()*weapons.length)],secondaryWeapon=aiDuel?weapons.filter(key=>key!==aiWeapon)[Math.floor(Math.random()*Math.max(1,weapons.length-1))]:null,skill=THREE.MathUtils.clamp(.85+(i%4)*.025+Math.random()*.035,.85,.96),aggression=.78+Math.random()*.18,preferredDistance=(aiWeapon==="frost"?25:aiWeapon==="gale"?21:aiWeapon==="meteor"?18:WEAPONS[aiWeapon].pellets?9:aiWeapon==="smg"?11:aiWeapon==="lmg"?19:12)+THREE.MathUtils.randFloatSpread(5);Object.assign(m.userData,{lastSpawnIndex:initialSpawn?.index??-1,networkId:survival?crypto.randomUUID():"",hp:100,team,weapon:aiWeapon,secondaryWeapon,name:botName,skill,aggression,preferredDistance,cooldown:Math.random(),strafe:i%2?1:-1,dodgeSide:i%2?1:-1,rethink:0,target:null,wander:randomSpawn(),reactionUntil:0,burstLeft:0,burstPauseUntil:0,moveVelocity:new THREE.Vector3(),facingYaw:Math.random()*Math.PI*2,proneDecisionAt:performance.now()+2400,smokeReadyAt:performance.now()+6500,phaseReadyAt:performance.now()+4000,hopUntil:0,hopNextAt:performance.now()+250,playerMotionSince:performance.now(),lastPlayerPosition:new THREE.Vector3(),ammoLeft:WEAPONS[aiWeapon].mag,weaponAmmo:{[aiWeapon]:WEAPONS[aiWeapon].mag,...secondaryWeapon?{[secondaryWeapon]:WEAPONS[secondaryWeapon].mag}:{}},reloadUntil:0});setActorLabel(m,botName,team);equipBot(m,i);if(aiWeapon==="frost")m.userData.rifle.scale.z=1.45;if(aiWeapon==="gale"){m.userData.rifle.scale.set(1.12,1.08,1.34);m.userData.rifle.material.color.set(0x20534e)}if(aiWeapon==="meteor"){m.userData.rifle.scale.set(1.7,1.7,1.25);m.userData.rifle.material.color.set(0x556236)}scene.add(m);bots.push(m)}}
function trimBotsForSlots(){while(1+remotes.size+bots.filter(b=>b.visible).length>12){const bot=bots.findLast(b=>b.visible);if(!bot)break;bot.visible=false;bot.userData.removed=true}}
const TRAINING_DISTANCES=[1,5,10,20,30,50,100];
function buildTrainingMap(){
  if(mapWorlds.has('training'))return;
  MAP_NAMES.training='武器练习场';beginMap('training');
  surface(0,-20,76,132,0x172533,.01);surface(0,33,72,18,0x273847,.025);
  box(-37,-20,1,4,132,0x26384c);box(37,-20,1,4,132,0x26384c);box(0,-85,75,7,1,0x304457);box(0,43,75,3,1,0x26384c);
  for(const [i,distance] of TRAINING_DISTANCES.entries()){
    const x=(i-3)*10,z=30-distance;
    surface(x,30,3,3,0x347b88,.035);surface(x,30-distance/2,.08,distance,0x428a99,.03);
    surface(x,z,3,2.5,0x753a50,.03);detailBox(x,.08,z,2.4,.16,1.3,0x526779);
    for(const edge of [-4.5,4.5])surface(x+edge,-20,.06,125,0x324957,.028);
    const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=128;
    const ctx=labelCanvas.getContext('2d');ctx.fillStyle='#0a1928';ctx.fillRect(0,0,512,128);ctx.fillStyle='#83f3ff';ctx.font='bold 64px sans-serif';ctx.textAlign='center';ctx.fillText(`${distance} m`,256,88);
    const texture=new THREE.CanvasTexture(labelCanvas);texture.colorSpace=THREE.SRGBColorSpace;
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.5,.875),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));sign.position.set(x,3.7,z-1.5);mapBuildTarget.add(sign);
  }
  finishMap('training');
}
function spawnTrainingTargets(){for(const [i,distance] of TRAINING_DISTANCES.entries()){
  const target=actorMesh(0xff596f),x=(i-3)*10,label=`${distance} 米靶`;
  target.position.set(x,0,30-distance);Object.assign(target.userData,{team:1,hp:100,trainingMaxHp:100,trainingTarget:true,trainingDistance:distance,stationX:x,name:label});
  target.userData.rifle.visible=target.userData.rifleGlow.visible=false;target.userData.armorPlate.visible=target.userData.helmetShell.visible=target.userData.helmetVisor.visible=false;
  setActorLabel(target,label,1);scene.add(target);trainingTargets.push(target);bots.push(target);
}}
function nearbyTrainingTarget(){return trainingMode&&playing?trainingTargets.find(target=>Math.abs(camera.position.x-target.userData.stationX)<1.6&&Math.abs(camera.position.z-30)<1.6):null}
let editingTrainingTarget=null;
function updateTrainingStation(){const target=nearbyTrainingTarget();$('trainingHint').hidden=!target||paused;if(target)setText('trainingHint',MOBILE_ENABLED?`${target.userData.trainingDistance} 米靶 · 靶子设置`:`${target.userData.trainingDistance} 米靶 · 按 ${keyLabel('interact')} 设置`)}
function openTrainingSettings(){const target=nearbyTrainingTarget();if(!target)return;editingTrainingTarget=target;paused=true;firing=false;adsMouse=adsKey=false;for(const key of Object.keys(rawKeys))rawKeys[key]=false;if(document.pointerLockElement)document.exitPointerLock();setText('trainingSettingsTitle',`${target.userData.trainingDistance} 米靶`);$('trainingHealth').value=target.userData.trainingMaxHp;$('trainingArmor').value=target.userData.trainingArmor||'none';$('trainingHelmet').value=target.userData.trainingHelmet||'none';$('trainingSettings').showModal()}
function closeTrainingSettings(){editingTrainingTarget=null;$('trainingSettings').close();if(playing&&trainingMode){paused=false;requestGamePointerLock()}}
$('trainingSettings').addEventListener('cancel',event=>{event.preventDefault();closeTrainingSettings()});
$('trainingSettingsClose').onclick=closeTrainingSettings;
$('trainingSettingsForm').onsubmit=event=>{event.preventDefault();const target=editingTrainingTarget,value=Number($('trainingHealth').value);if(!target||!Number.isInteger(value)||value<1||value>1000)return;
  const armor=$('trainingArmor').value,helmet=$('trainingHelmet').value;Object.assign(target.userData,{hp:value,trainingMaxHp:value,trainingArmor:armor,trainingHelmet:helmet});target.visible=true;
  target.userData.aiGear={armor:armor==='none'?{body:0,speed:1}:EQUIPMENT.护甲[armor][2],helmet:helmet==='none'?{head:0,speed:1}:EQUIPMENT.头盔[helmet][2],shieldUntil:0};
  target.userData.armorPlate.visible=armor!=='none';target.userData.helmetShell.visible=target.userData.helmetVisor.visible=helmet!=='none';
  target.userData.armorPlate.material.color.set(armor==='heavy'?0x70614e:armor==='medium'?0x43565d:0x334f46);
  setActorLabel(target,`${target.userData.trainingDistance} 米靶 · ${value} HP`,1);closeTrainingSettings();
};
function clearActors(){slideStartedAt=0;slideCooldownUntil=0;clearGrenadeCook();effects.clear();for(const effect of impactEffects)disposeObject(effect.group);impactEffects.length=0;allowReconnect=false;clearTimeout(reconnectTimer);reconnectTimer=null;for(const bot of bots){disposeObject(bot)}bots.length=0;trainingTargets.length=0;for(const remote of remotes.values()){disposeObject(remote.mesh)}remotes.clear();for(const rocket of [...rockets,...remoteRockets])disposeObject(rocket.mesh);rockets.length=0;remoteRockets.length=0;for(const zone of fireZones)disposeObject(zone.mesh);fireZones.length=0;for(const item of thrownItems)disposeObject(item.mesh);thrownItems.length=0;for(const cloud of smokeClouds)disposeObject(cloud.mesh);smokeClouds.length=0;for(const trace of tracers)disposeObject(trace.line);tracers.length=0;trajectoryLine.visible=false;if(ws){const old=ws;ws=null;old.close()}}
function generateRoomCode(){const letters="ABCDEFGHJKLMNPQRSTUVWXYZ",digits="23456789",bytes=new Uint8Array(6);crypto.getRandomValues(bytes);return [...bytes].map((value,index)=>index%2?digits[value%digits.length]:letters[value%letters.length]).join("")}
function buildWeapon(key){const base=WEAPONS[key],out={...base,damage:{...base.damage},moveSpeed:1,adsMove:1,armorDamage:1,hipSpread:key==="frost"?12:key==="gale"?9:key==="redline"?7:4.5,falloff:1,boltTime:1000,recoilRecovery:1,firstShot:1};for(const [slot,id] of Object.entries(builds[key]||{})){const mod=MODS[key]?.[slot]?.[id]?.[2];if(!mod)continue;for(const [stat,value] of Object.entries(mod)){if(["penetration","thermal","incendiary","brightTracer","bipod","softPoint","flashlight","phaseFlashlight","trajectory","sticky","rocketPenetration","homing","proximity","jumpFuse","lowLight","dualZoom","muzzleHidden","suppressed","stationaryAccuracy","rangefinder","breathControl","visibleLaser","iff","cluster","concussion","smoke","twoStage","ricochet","bunker","safety","remoteFuse","disableHoming"].includes(stat))out[stat]=value;else if(["mag","fuse","directDamage"].includes(stat))out[stat]=value;else if(stat==="edgeDamage")out.edgeDamage+=value;else if(stat==="damage")for(const zone of Object.keys(out.damage))out.damage[zone]=Math.round(out.damage[zone]*value);else out[stat]=(out[stat]??1)*value}}if(out.homing){out.directDamage=Math.round(out.directDamage*.9);out.edgeDamage=Math.round(out.edgeDamage*.9);for(const zone of Object.keys(out.damage))out.damage[zone]=Math.round(out.damage[zone]*.9)}if(key==="knife")Object.assign(out,knifeCombat(activeKnifeSkin()?.id));return out}
function selectedParts(key){return Object.entries(builds[key]||{}).map(([slot,id])=>MODS[key]?.[slot]?.[id]?.[0]).filter(Boolean)}
// Main and Ancient Age use exactly the same optic geometry and definitions.
function currentOpticId(){return builds[weaponKey]?.["瞄具"]||(weaponKey+"Default")}
function rebuildOpticModel(){rebuildWeaponOptic(THREE,opticMount,weaponKey,currentOpticId())}
let normalGunmasterLoadout=null,normalChallengeLoadout=null,gunmasterCredits=0,gunmasterHeal=0,gunmasterLastKillId='';
function saveBuilds(){if(weeklyRun||roomMode==="extraction"||roomMode==="tutorial")return;if(roomMode==='gunmaster'||roomMode==='challenge'||roomMode==='bomb')return;localStorage.setItem(BUILD_KEY,JSON.stringify(builds));localStorage.setItem("astrift.weapon",weaponKey);localStorage.setItem(WEAPON_SLOT_KEY,JSON.stringify(weaponSlots));localStorage.setItem(SIDEARM_KEY,sidearmKey)}
function slotWeapon(slot){if((roomMode==='bomb'||weeklyRun)&&slot===1)return null;return slot<2?weaponSlots[slot]:slot===2?sidearmKey||"knife":slot===3&&sidearmKey?"knife":null}
function refreshEquipment(){if(weeklyRun||roomMode==="extraction"||roomMode==="tutorial")return;const armor=EQUIPMENT.护甲[equipmentLoadout.护甲],helmet=EQUIPMENT.头盔[equipmentLoadout.头盔],tactical=EQUIPMENT.战术道具[equipmentLoadout.战术道具];equipmentMove=armor[2].speed*helmet[2].speed;localStorage.setItem(EQUIPMENT_KEY,JSON.stringify(equipmentLoadout));$("equipmentSummary").textContent=`1 ${WEAPONS[weaponSlots[0]].name} · 2 ${WEAPONS[weaponSlots[1]].name} · 3 ${sidearmKey?WEAPONS[sidearmKey].name:"相位刃 K0"} · ${armor[0]} · ${tactical[0]}`;$("helmetVision").className=`helmetVision helmet-${equipmentLoadout.头盔}`;if(weaponDef?.name){const base=buildWeapon(weaponKey);weaponDef={...base,moveSpeed:base.moveSpeed*equipmentMove}}}
function setSidearm(key){sidearmKey=key==="revolver"?"revolver":"";try{localStorage.setItem(SIDEARM_KEY,sidearmKey)}catch{}weaponRuntime[2]={key:sidearmKey||"knife",ammo:buildWeapon(sidearmKey||"knife").mag,reserve:Infinity};if(!sidearmKey&&activeWeaponSlot===3)activeWeaponSlot=2;if(activeWeaponSlot===2||activeWeaponSlot===3&&!sidearmKey){suppressWeaponStash=true;selectWeapon(slotWeapon(activeWeaponSlot),{equip:false});suppressWeaponStash=false}if($("menuSidearm"))$("menuSidearm").value=sidearmKey;const equipmentSidearm=document.querySelector("#equipmentSidearm select");if(equipmentSidearm)equipmentSidearm.value=sidearmKey;refreshEquipment();renderKeyHints();updateHud()}
function stashWeaponState(){const state=weaponRuntime[activeWeaponSlot];if(!suppressWeaponStash&&state&&state.ammo!==null){state.key=weaponKey;state.ammo=ammo;state.reserve=reserve}}
function selectWeapon(key,{equip=true}={}){if(!WEAPONS[key])return;stashWeaponState();if(equip&&key==="revolver"){sidearmKey="revolver";weaponRuntime[2]={key:"revolver",ammo:weaponRuntime[2]?.ammo??WEAPONS.revolver.mag,reserve:Infinity};activeWeaponSlot=2;if($("menuSidearm"))$("menuSidearm").value="revolver"}else if(equip&&key!=="knife"){if(activeWeaponSlot>=2)activeWeaponSlot=0;weaponSlots[activeWeaponSlot]=key}const state=weaponRuntime[activeWeaponSlot];if(state.key!==key){state.key=key;state.ammo=null;state.reserve=Infinity}weaponKey=key;if(!buildWeapon(key).iff)document.querySelectorAll(".cross i").forEach(i=>i.style.background="");weaponDef=buildWeapon(key);weaponDef.moveSpeed*=equipmentMove;zoomMode=0;ammo=Math.min(state.ammo??weaponDef.mag,weaponDef.mag);reserve=state.reserve??weaponDef.reserve;state.ammo=ammo;state.reserve=reserve;gun.scale.set(key==="frost"?.8:key==="meteor"?1.5:1,key==="meteor"?1.5:1,key==="frost"?1.55:key==="meteor"?1.3:1);gun.material.color.set(key==="frost"?0x263946:key==="meteor"?0x4b5330:0x152934);barrel.scale.set(key==="meteor"?2.2:1,key==="meteor"?1.8:1,key==="frost"?1.7:1);rebuildOpticModel();document.querySelectorAll("[data-weapon]").forEach(b=>b.classList.toggle("selected",b.dataset.weapon===key));const parts=selectedParts(key);$("buildSummary").textContent=`${weaponDef.name} · ${parts.length?parts.join(" / "):"标准配置"}`;saveBuilds();updateHud()}
const selectWeaponCore=selectWeapon;selectWeapon=function(key,options){selectWeaponCore(key,options);const isKnife=key==="knife";gun.visible=barrel.visible=false;muzzleFlash.visible=flameOuter.visible=flameCore.visible=muzzleLight.visible=tacticalLight.visible=!isKnife&&!grenadeHeld;knifeModel.visible=isKnife&&!grenadeHeld;for(const [modelKey,model] of Object.entries(heldWeaponModels))model.visible=!grenadeHeld&&modelKey===key;grenadeModel.visible=grenadeHeld;opticMount.visible=!grenadeHeld&&key!=="knife";if(!isKnife){knifeInspectStart=-99999;knifeModel.position.set(.34,-.3,-.58);knifeModel.rotation.set(0,-.12,0);heldWeaponModels[key].add(opticMount);opticMount.position.set(0,.15,-.1);heldWeaponModels.hammer.userData.magazine.scale.y=builds.hammer?.弹匣==='h8Large'?1.7:builds.hammer?.弹匣==='h8Extended'?1.35:1}};
function updateHeldItemVisuals(){const isKnife=weaponKey==="knife";knifeModel.visible=isKnife&&!grenadeHeld;for(const [key,model] of Object.entries(heldWeaponModels))model.visible=!grenadeHeld&&key===weaponKey;grenadeModel.visible=grenadeHeld;opticMount.visible=!grenadeHeld&&!isKnife;muzzleFlash.visible=flameOuter.visible=flameCore.visible=muzzleLight.visible=tacticalLight.visible=!grenadeHeld&&!isKnife}
function resetWeaponSwitch(){switchTarget=-1;switchCommitted=false;switchStarted=0;weapon.position.y=0;weapon.rotation.z=0}
function switchWeaponSlot(slot,announce=true){if((roomMode==='gunmaster'||roomMode==='challenge')&&slot!==0)return;const key=slotWeapon(slot);if(!key||hp<=0||switchTarget>=0)return;if(grenadeReady){if(grenadeCookStarted)releaseCookedGrenade();else clearGrenadeCook()}if(slot===activeWeaponSlot)return;cancelInspect();cancelReload();stashWeaponState();weaponActionToken++;cycling=firing=false;adsMouse=adsKey=false;switchTarget=slot;switchStarted=performance.now();switchDuration=slot>=2||activeWeaponSlot>=2?320:420;switchCommitted=false;if(announce)feed(`切换武器：${WEAPONS[key].name}`)}
function updateWeaponSwitch(now){if(switchTarget<0)return;if(!playing){resetWeaponSwitch();return}const progress=Math.min(1,(now-switchStarted)/switchDuration),ease=Math.sin(Math.PI*progress);if(progress>=.5&&!switchCommitted){switchCommitted=true;activeWeaponSlot=switchTarget;weapon.rotation.set(0,0,0);suppressWeaponStash=true;selectWeapon(slotWeapon(activeWeaponSlot),{equip:false});suppressWeaponStash=false}weapon.position.y=THREE.MathUtils.lerp(0,.08,adsBlend)-ease*.39;weapon.position.x+=ease*(progress<.5?.12:-.09);weapon.rotation.z=ease*(progress<.5?-.16:.13);weapon.rotation.y=ease*(progress<.5?-.12:.1);if(progress>=1){weapon.rotation.y=0;resetWeaponSwitch()}}
function resetWeaponRuntime(){weaponActionToken++;reloading=cycling=false;boltStarted=-1;reloadPhase="";for(const key of Object.keys(heldWeaponModels))resetMagazinePose(key);resetWeaponSwitch();weapon.rotation.set(0,0,0);weaponRuntime=[...weaponSlots.map(key=>{const def=buildWeapon(key);return{key,ammo:def.mag,reserve:def.reserve}}),{key:sidearmKey||"knife",ammo:buildWeapon(sidearmKey||"knife").mag,reserve:Infinity},{key:"knife",ammo:1,reserve:Infinity}];ammo=weaponRuntime[activeWeaponSlot]?.ammo??1;reserve=weaponRuntime[activeWeaponSlot]?.reserve??Infinity}
document.querySelectorAll("[data-weapon]").forEach(button=>button.onclick=()=>selectWeapon(button.dataset.weapon));
function syncMenuWeaponSelectors(){if($("menuWeapon1"))$("menuWeapon1").value=weaponSlots[0];if($("menuWeapon2"))$("menuWeapon2").value=weaponSlots[1];if($("menuSidearm"))$("menuSidearm").value=sidearmKey}
for(const [index,id] of [[0,"menuWeapon1"],[1,"menuWeapon2"]])$(id).onchange=e=>{weaponSlots[index]=e.target.value;weaponRuntime[index]={key:e.target.value,ammo:null,reserve:Infinity};if(activeWeaponSlot===index)selectWeapon(e.target.value,{equip:false});else{saveBuilds();updateHud()}syncMenuWeaponSelectors();refreshEquipment()};syncMenuWeaponSelectors();
$("menuSidearm").onchange=e=>setSidearm(e.target.value);

function renderArmory(){const tabs=$("armoryWeaponTabs");tabs.innerHTML="";for(const [key,base] of Object.entries(WEAPONS)){const button=document.createElement("button");button.textContent=base.name;button.className=key===weaponKey?"active":"";button.onclick=()=>{selectWeapon(key);renderArmory()};tabs.appendChild(button)}const grid=$("attachmentGrid");grid.innerHTML="";for(const [slot,choices] of Object.entries(MODS[weaponKey])){const wrap=document.createElement("div");wrap.className="attachmentSlot";const label=document.createElement("label");label.textContent=slot;const select=document.createElement("select");select.innerHTML='<option value="">不装备</option>';for(const [id,[name]] of Object.entries(choices)){const option=document.createElement("option");option.value=id;option.textContent=name;option.selected=builds[weaponKey]?.[slot]===id;select.appendChild(option)}const note=document.createElement("p");const refresh=()=>{note.textContent=select.value?controlDescription(choices[select.value][1]):"保留武器标准数值"};select.onchange=()=>{builds[weaponKey][slot]=select.value;if(!select.value)delete builds[weaponKey][slot];selectWeapon(weaponKey);refresh();renderStats()};refresh();wrap.append(label,select,note);grid.appendChild(wrap)}renderStats()}
function renderStats(){weaponDef=buildWeapon(weaponKey);const maxDamage=Math.max(...Object.values(weaponDef.damage),weaponDef.directDamage||0),stats=[["伤害",`${weaponDef.damage.body}${weaponKey==="meteor"?` / 中心 ${weaponDef.directDamage}`:` / 头 ${weaponDef.damage.head}`}`,maxDamage/125],["弹速",`${Math.round(weaponDef.bulletSpeed)} m/s`,weaponDef.bulletSpeed/(weaponKey==="meteor"?55:1200)],["后坐",`${Math.round(weaponDef.recoil)}`,weaponDef.recoil/100],["开镜时间",`${Math.round(weaponDef.adsTime)} ms`,230/weaponDef.adsTime],["弹匣",`${weaponDef.mag} 发`,weaponDef.mag/(weaponKey==="redline"?60:weaponKey==="hammer"?20:weaponKey==="gale"?24:weaponKey==="frost"?10:3)],["换弹时间",`${(weaponDef.reload/1000).toFixed(2)} s`,Math.min(1,1400/Math.max(1,weaponDef.reload))]];if(weaponKey==="hammer")stats.push(["腰射散布",`${(weaponDef.spread*weaponDef.hipSpread*180/Math.PI).toFixed(2)}°`,Math.min(1,.52/(weaponDef.spread*weaponDef.hipSpread*180/Math.PI))]);$("gunStats").innerHTML=stats.map(([name,value,ratio])=>`<div class="statLine"><span>${name}</span><i><b style="width:${Math.min(100,Math.max(4,ratio*100))}%"></b></i><strong>${value}</strong></div>`).join("");const parts=selectedParts(weaponKey);$("buildNote").textContent=parts.length?`当前效果：${parts.join("、")}。所有数值已应用到实战。`:"当前为标准配置。选择配件后会立即预览并自动保存。";$("buildSummary").textContent=`${weaponDef.name} · ${parts.length?parts.join(" / "):"标准配置"}`}
const BUILD_CODE_GUNS={M9:"frost",V6:"redline",H8:"hammer",D7:"gale",L1:"meteor",S12:"shotgun",MP9:"smg",R6:"revolver",KX:"lmg",A8:"autoShotgun"};
const BUILD_CODE_ALIASES=Object.fromEntries(Object.entries(BUILD_CODE_GUNS).map(([alias,key])=>[key,alias]));
function parseBuildCode(value){const match=String(value||"").trim().toUpperCase().match(/^(M9|V6|H8|D7|L1|S12|MP9|R6|KX|A8)-([A-Z0-9]{12})$/);return match?{code:`${match[1]}-${match[2]}`,weapon:BUILD_CODE_GUNS[match[1]]}:null}
function randomBuildCode(weapon){const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",bytes=crypto.getRandomValues(new Uint8Array(12));return `${BUILD_CODE_ALIASES[weapon]}-${Array.from(bytes,n=>alphabet[n%alphabet.length]).join("")}`}
function validImportedBuild(weapon,build){if(!build||typeof build!=="object"||Array.isArray(build)||!MODS[weapon])return null;const clean={};for(const [slot,id] of Object.entries(build)){if(Object.hasOwn(MODS[weapon][slot]||{},id))clean[slot]=id}return clean}
function setBuildCodeStatus(message,isError=false){const status=$("buildCodeStatus");status.textContent=message;status.dataset.error=isError?"true":"false"}
async function readBuildCodeResponse(response){const body=await response.text();try{return JSON.parse(body)}catch{throw new Error(`服务器返回了非 JSON 响应（${response.status}），请重试`)}}
async function createCurrentBuildCode(){const button=$("createBuildCode"),weapon=weaponKey,build={...builds[weapon]};button.disabled=true;setBuildCodeStatus("正在创建改枪码…");try{for(let attempt=0;attempt<3;attempt++){const code=randomBuildCode(weapon),response=await fetch("/api/loadout-codes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code,weapon,build})});if(response.status===409)continue;const result=await readBuildCodeResponse(response);if(!response.ok)throw new Error(result.error||"创建失败");$("buildCodeInput").value=code;try{await navigator.clipboard.writeText(code);setBuildCodeStatus(`已创建并复制：${code}`)}catch{setBuildCodeStatus(`已创建：${code}（可手动复制）`)}return}throw new Error("暂时无法分配唯一改枪码，请重试")}catch(error){setBuildCodeStatus(error.message||"创建失败，请检查网络",true)}finally{button.disabled=false}}
async function useBuildCode(){const button=$("useBuildCode"),info=parseBuildCode($("buildCodeInput").value);if(!info){setBuildCodeStatus("格式应为 M9-后接12位字母或数字",true);return}button.disabled=true;setBuildCodeStatus("正在读取改枪方案…");try{const response=await fetch(`/api/loadout-codes?code=${encodeURIComponent(info.code)}`,{cache:"no-store"}),result=await readBuildCodeResponse(response);if(!response.ok)throw new Error(result.error||"读取失败");if(result.weapon!==info.weapon)throw new Error("改枪码与枪型不匹配");const clean=validImportedBuild(info.weapon,result.build);if(!clean)throw new Error("方案数据无效");builds[info.weapon]=clean;weaponRuntime=weaponRuntime.map(state=>state.key===info.weapon?{key:info.weapon,ammo:null,reserve:Infinity}:state);selectWeapon(info.weapon);syncMenuWeaponSelectors();refreshEquipment();renderArmory();setBuildCodeStatus(`已覆盖并切换到${WEAPONS[info.weapon].name}`)}catch(error){setBuildCodeStatus(error.message||"读取失败，请检查网络",true)}finally{button.disabled=false}}
$("openArmory").onclick=()=>{if(weaponKey==="knife"){activeWeaponSlot=0;suppressWeaponStash=true;selectWeapon(weaponSlots[0],{equip:false});suppressWeaponStash=false}$("armory").hidden=false;renderArmory()};
$("closeArmory").onclick=()=>{$("armory").hidden=true};
$("resetBuild").onclick=()=>{builds[weaponKey]={};selectWeapon(weaponKey);renderArmory()};
$("createBuildCode").onclick=createCurrentBuildCode;
$("useBuildCode").onclick=useBuildCode;
$("buildCodeInput").addEventListener("keydown",event=>{if(event.key==="Enter")useBuildCode()});
function renderEquipment(){const wrap=$("equipmentSlots");wrap.innerHTML="";for(let index=0;index<2;index++){const box=document.createElement("div");box.className="equipmentSlot weaponSlot";const label=document.createElement("label");label.textContent=`武器 ${index+1} · 按 ${keyLabel(index===0?"weapon1":"weapon2")} 唤出`;const select=document.createElement("select"),note=document.createElement("p");for(const [key,def] of Object.entries(WEAPONS)){if(key==="knife"||key==="revolver")continue;const option=document.createElement("option");option.value=key;option.textContent=def.name;option.selected=weaponSlots[index]===key;select.appendChild(option)}const update=()=>note.textContent=`${WEAPONS[select.value].name} · 弹匣 ${buildWeapon(select.value).mag} 发`;select.onchange=()=>{weaponSlots[index]=select.value;weaponRuntime[index]={key:select.value,ammo:null,reserve:Infinity};saveBuilds();if(index===activeWeaponSlot)selectWeapon(select.value,{equip:false});update();renderEquipmentStats()};update();box.append(label,select,note);wrap.appendChild(box)}for(const [slot,choices] of Object.entries(EQUIPMENT)){const box=document.createElement("div");box.className="equipmentSlot";const label=document.createElement("label");label.textContent=slot;const select=document.createElement("select"),note=document.createElement("p");for(const [id,[name]] of Object.entries(choices)){const option=document.createElement("option");option.value=id;option.textContent=name;option.selected=equipmentLoadout[slot]===id;select.appendChild(option)}const update=()=>note.textContent=controlDescription(choices[select.value][1]).replaceAll("按 G",`按 ${keyLabel("tactical")}`).replaceAll("按住空格",`按住 ${keyLabel("jump")}`);select.onchange=()=>{equipmentLoadout[slot]=select.value;refreshEquipment();update();renderEquipmentStats()};update();box.append(label,select,note);wrap.appendChild(box)}renderEquipmentStats()}
function renderEquipmentStats(){let sidearmBox=document.getElementById("equipmentSidearm");if(!sidearmBox){sidearmBox=document.createElement("div");sidearmBox.id="equipmentSidearm";sidearmBox.className="equipmentSlot weaponSlot";const label=document.createElement("label");label.textContent="第三武器 · R6 手枪";const select=document.createElement("select");select.innerHTML='<option value="">不装备 R6（3 切刀）</option><option value="revolver">装备断层 R6（3 手枪，4 切刀）</option>';select.onchange=()=>setSidearm(select.value);sidearmBox.append(label,select);$("equipmentSlots").appendChild(sidearmBox)}sidearmBox.querySelector("select").value=sidearmKey;const armor=EQUIPMENT.护甲[equipmentLoadout.护甲][2],helmet=EQUIPMENT.头盔[equipmentLoadout.头盔][2];$("equipmentStats").textContent=`身体减伤 ${Math.round(armor.body*100)}% · 爆头减伤 ${Math.round(helmet.head*100)}% · 视野遮挡 ${helmet.vision}% · 移动速度 ${Math.round(armor.speed*helmet.speed*100)}%`}
$("openEquipment").onclick=()=>{$("equipment").hidden=false;renderEquipment()};$("closeEquipment").onclick=()=>{$("equipment").hidden=true;syncMenuWeaponSelectors()};
refreshEquipment();
selectWeapon(weaponKey);

function requestGamePointerLock(){
  if(MOBILE_ENABLED)return;
  if(document.pointerLockElement===canvas)return;
  if(navigator.userActivation&&!navigator.userActivation.isActive){
    if(playing&&!paused)feed('点击战场继续');
    return;
  }
  try{
    const request=canvas.requestPointerLock();
    if(request&&typeof request.catch==='function')void request.catch(()=>{if(playing&&!paused)feed('点击战场继续')});
  }catch{
    if(playing&&!paused)feed('点击战场继续');
  }
}

function start(isOnline,mode='normal'){if(!accountSession()){if(window.__ASTRIFT_REQUIRE_ACCOUNT__)window.__ASTRIFT_REQUIRE_ACCOUNT__(()=>start(isOnline,mode));else $('loginAccount').click();return}const noticeToken=++sessionSeq;knifeKillPending=false;clearWounds();clearPracticeMode();resetSupplyClient();roomMode=isOnline?pendingRoomMode:mode;if(roomMode!=='survival')survivalSolo=false;if(!(roomMode==='aiDuel'&&rankedAiTicket)){rankedAiActive=false;rankedAiTicket='';rankedAiName='';rankedAiDifficulty='master'}rankedResultRequested=false;aiDuelLevel=rankedAiActive&&DUEL_AI_PROFILES[rankedAiDifficulty]?rankedAiDifficulty:roomMode==='aiDuel'&&['normal','advanced','master'].includes($('aiDuelDifficulty').value)?$('aiDuelDifficulty').value:'advanced';aiDuelNoAttackUntil=0;isRoomCreator=isOnline&&$('roomDialog').dataset.mode==='create';clearObjectiveMode();resetDuelClient();$('gunmasterOpen').hidden=true;$('gunmasterUpgrade').hidden=true;$('survivalPanel').hidden=true;$('survivalResult').hidden=true;$('aiDuelPanel').hidden=roomMode!=='aiDuel';$('aiDuelResult').hidden=true;aiDuelRemaining=rankedAiActive?Infinity:600;document.querySelector('.score>span').textContent=roomMode==='ranked'||rankedAiActive?'排位比分':roomMode==='gunmaster'?'武器大师比分':roomMode==='duel'?'10 分钟单挑':roomMode==='survival'?'累计击杀':roomMode==='aiDuel'?'单挑 AI 比分':'队伍比分';matchFinished=false;scoreRevision=-1;seenKills.clear();score=redScore=0;$("blueScore").textContent="0";$("redScore").textContent="0";$("resumeMatch").hidden=false;$("pauseScreen").querySelector("h2").textContent="游戏暂停";
  soloNoAttackUntil=!isOnline&&roomMode==='normal'?performance.now()+5000:0;
  resetCovers();setMap(roomMode==='survival'?'survival':roomMode==='bomb'?'bomb':socialInviteMap||($('roomDialog').dataset.mode==='join'?'crossroads':$('mapSelect').value));socialInviteMap='';
  prepareShotAudio();
  clearActors();lastCompetitiveSpawn=-1;phaseFlashReadyAt=0;phaseFlashPulseUntil=phaseBlindUntil=0;throwCharges=2;nextThrowRefill=0;if(roomMode==='gunmaster'){if(!WEAPONS[gunmasterWeapon]||gunmasterWeapon==='knife')gunmasterWeapon='redline';if(isRoomCreator){gunmasterWeapon=$('menuGunmasterWeapon').value||'redline';try{localStorage.setItem('astrift.gunmasterWeapon',gunmasterWeapon)}catch{}}normalGunmasterLoadout={slots:[...weaponSlots],builds:structuredClone(builds)};builds[gunmasterWeapon]={};weaponSlots=[gunmasterWeapon,gunmasterWeapon];gunmasterCredits=0;gunmasterLastKillId=''}else if(roomMode==='challenge'){normalChallengeLoadout=[...weaponSlots];weaponSlots=['redline','redline']}else{weaponSlots=[$("menuWeapon1").value,$("menuWeapon2").value];if(roomMode!=='tutorial')localStorage.setItem(WEAPON_SLOT_KEY,JSON.stringify(weaponSlots))}activeWeaponSlot=0;resetWeaponRuntime();suppressWeaponStash=true;selectWeapon(weaponSlots[0],{equip:false});suppressWeaponStash=false;const alias=$("name").value.trim().replace(/[<>]/g,"").slice(0,14)||"游隼-07";$("name").value=alias;try{localStorage.setItem("astrift.callsign",alias)}catch{}online=isOnline;playerTeam=isArenaMode()?-1:0;allowReconnect=isOnline;reconnectAttempts=0;activeRoomCode=isOnline?(roomMode==='survival'&&survivalSolo?'solo-'+playerId:$("room").value.replace(/[^\w-]/g,"").slice(0,32)||"ORBIT-01"):"";playing=true;paused=false;phaseActive=0;shieldUntil=0;prone=false;playerEyeHeight=1.7;verticalVelocity=0;grounded=true;camera.position.copy(playerSpawn());$("menu").classList.remove("active");$("pauseScreen").hidden=true;$("hud").hidden=false;$("roomLabel").textContent=isOnline?activeRoomCode.toUpperCase():roomMode==='survival'?'高塔生存':"AI 训练场";updatePlayerIdentity(isOnline);if(roomMode==='survival'){phase=0;equipmentEnergy=0;equipmentReadyAt=Infinity;startSurvival();}else if(!isOnline&&roomMode!=='tutorial')spawnBots();if(roomMode!=='survival'||!online||survivalSolo)requestGamePointerLock();setTimeout(()=>{if(noticeToken!==sessionSeq)return;$("coach").textContent=roomMode==='gunmaster'?`已载入：裸装${WEAPONS[gunmasterWeapon].name} · 击杀后按 ${keyLabel('interact')} 选择配件`:roomMode==='challenge'?`本局限定 ${WEAPONS[weaponSlots[0]].name}`:`已载入：1 ${WEAPONS[weaponSlots[0]].name} / 2 ${WEAPONS[weaponSlots[1]].name} · 按 Q 相位`},1200);setTimeout(()=>{if(noticeToken===sessionSeq)$("coach").style.opacity=0},10000);
  yaw=Math.atan2(camera.position.x,camera.position.z);pitch=roomMode==='survival'?-.6:0;initObjectiveMode();$('roomLabel').textContent=online?`${activeRoomCode.toUpperCase()} · ${MAP_NAMES[activeMapId]}`:`${roomMode==='ctf'?'夺旗':roomMode==='hardpoint'?'据点':roomMode==='bomb'?'相位爆破':roomMode==='survival'?'高塔生存':rankedAiActive?'排位对战':roomMode==='aiDuel'?'单挑 AI':'AI 演习'} · ${MAP_NAMES[activeMapId]}`;if(rankedAiActive){$('aiDuelPanel').querySelector('b').textContent='排位对战';$('aiDuelTimer').textContent='先到 10 分';$('aiDuelPanel').querySelector('small').textContent=`蓝队：你　红队：${rankedAiName}`}else{$('aiDuelPanel').querySelector('b').textContent='单挑 AI';$('aiDuelPanel').querySelector('small').textContent='蓝队：你　红队：AI'}if(roomMode==='survival'&&survivalSolo)$('roomLabel').textContent='高塔生存 · 单人';if(online) connect(restoringMatch); else {$("netText").textContent=rankedAiActive?"排位对战":roomMode==='aiDuel'?"单挑 AI":roomMode==='bomb'?"单人爆破":"AI 演习";$("netDot").style.background="#ffbf5f"}if(!restoringMatch)saveCurrentMatch();$('resumePreviousMatch').hidden=true;
}
function clearPracticeMode(){trainingMode=false;editingTrainingTarget=null;$("trainingSettings").close();$("trainingHint").hidden=true;$("practicePanel").hidden=true}
function updatePracticeStats(){setText("practiceStats",`射击 ${trainingShots} · 命中率 ${trainingShots?Math.round(trainingHits/trainingShots*100):0}% · 靶标命中会自动复位`)}
function startTraining(){clearPracticeMode();start(false);for(const bot of bots)disposeObject(bot);bots.length=0;trainingMode=true;trainingHits=trainingHeadshots=trainingShots=0;setText("practiceHits",0);setText("practiceHeadshots",0);updatePracticeStats();$("practicePanel").hidden=false;document.querySelector('.score>span').textContent="训练数据";$("roomLabel").textContent=`武器练习 · ${MAP_NAMES[activeMapId]}`;buildTrainingMap();setMap("training");scene.fog.density=.0015;camera.position.set(0,1.7,35);yaw=0;pitch=0;$("roomLabel").textContent="武器练习场";spawnTrainingTargets();if(!restoringMatch)saveCurrentMatch()}
function normalizeRoomCode(value){return value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6)}
function validRoomCode(value){return /^[A-Z][0-9][A-Z][0-9][A-Z][0-9]$/.test(value)}
function openRoomDialog(mode){const creating=mode==="create",code=creating?generateRoomCode():normalizeRoomCode($("room").value);$("roomDialog").dataset.mode=mode;$("roomDialogKicker").textContent="ASTRIFT // MULTIPLAYER";$("roomCodeField").hidden=false;$("roomDialogTitle").textContent=creating?"创建房间":"加入房间";$("roomDialogHelp").textContent=creating?"选择地图，把房间号发给朋友，然后房主先进入战场。":"输入房主发给你的 6 位房间号，可直接中途加入正在进行的对局。";$("roomDialogHelp").hidden=false;$("roomDialogCode").value=creating?code:(validRoomCode(code)?code:"");$("roomMapField").hidden=!creating;$("bombPresetField").hidden=true;$("roomMessage").hidden=false;$("roomMessage").className="";$("roomMessage").textContent=creating?"房主先进入即可；其他玩家之后随时加入。":"房间号格式：字母和数字交替，例如 A7K2M9。";$("copyRoom").hidden=!creating;$("enterRoom").textContent=creating?"房主进入战场":"确认加入房间";$("roomDialog").hidden=false;setTimeout(()=>$("roomDialogCode").focus(),0)}
let soloMapAction=null;
function openSoloMapDialog(title,action){soloMapAction=action;$("roomDialog").dataset.mode="solo";$("roomDialogKicker").textContent="ASTRIFT // SOLO";$("roomDialogTitle").textContent=title;$("roomDialogHelp").hidden=true;$("roomCodeField").hidden=true;$("roomMapField").hidden=false;$("bombPresetField").hidden=true;$("copyRoom").hidden=true;$("enterRoom").textContent="开始游戏";$("roomMessage").hidden=true;$("roomDialog").hidden=false;setTimeout(()=>$("mapSelect").focus(),0)}
$("roomDialogCode").addEventListener("input",e=>{e.target.value=normalizeRoomCode(e.target.value);$("roomMessage").className=""});
$("randomRoom").onclick=()=>{$("room").value=generateRoomCode()};
$("solo").onclick=()=>openSoloMapDialog("单人对战",()=>{clearPracticeMode();start(false)});
$("practice").onclick=startTraining;
$("createRoom").onclick=()=>{pendingRoomMode="normal";openRoomDialog("create")};
$("online").onclick=()=>{pendingRoomMode="normal";openRoomDialog("join")};
async function cancelRankedQueue(){rankedQueueRun++;$('rankedMatchDialog').hidden=true;$('rankedMatchDialog').classList.remove('matched');$('rankedMatchTitle').textContent='排位匹配';const ticket=rankedQueueTicket;rankedQueueTicket='';const account=accountSession();if(ticket&&account)void accountApi('matchmaking/ranked',{...account,action:'cancel',ticket}).catch(()=>{})}
$('cancelRankedMatch').onclick=cancelRankedQueue;
$('openRanked').onclick=async()=>{
  const account=accountSession();if(!account){$('loginAccount').click();return}
  await cancelRankedQueue();const run=++rankedQueueRun;$('rankedMatchDialog').hidden=false;$('cancelRankedMatch').hidden=false;$('rankedMatchStatus').textContent='正在寻找选手… 1 秒';
  try{
    let result=await accountApi('matchmaking/ranked',{...account,action:'join',player:playerId});
    if(run!==rankedQueueRun)return;rankedQueueTicket=result.ticket;
    while(run===rankedQueueRun&&result.status==='waiting'){
      $('rankedMatchStatus').textContent=`正在寻找选手… ${Math.max(1,Math.floor((Date.now()-result.startedAt)/1000)+1)} 秒`;
      await new Promise(resolve=>setTimeout(resolve,750));if(run!==rankedQueueRun)return;
      result=await accountApi('matchmaking/ranked',{...account,action:'status',ticket:rankedQueueTicket});
    }
    if(run!==rankedQueueRun)return;
    if(result.status==='matched'||result.status==='ai'){
      $('rankedMatchDialog').classList.add('matched');$('rankedMatchTitle').textContent='对手已锁定';$('rankedMatchStatus').textContent='匹配成功 · 即将进入战场';$('cancelRankedMatch').hidden=true;
      await new Promise(resolve=>setTimeout(resolve,1000));if(run!==rankedQueueRun)return;
    }
    if(result.status==='matched'){
      rankedQueueTicket='';$('rankedMatchDialog').hidden=true;rankedAiActive=false;pendingRoomMode='ranked';$('room').value=result.room;$('mapSelect').value=result.map;$('roomDialog').dataset.mode='join';start(true);return;
    }
    if(result.status==='ai'){
      rankedQueueTicket='';$('rankedMatchDialog').hidden=true;rankedAiActive=true;rankedAiTicket=result.ticket;rankedAiName=result.name;rankedAiDifficulty=DUEL_AI_PROFILES[result.aiProfile]?result.aiProfile:'master';start(false,'aiDuel');return;
    }
    throw Error('匹配已过期，请重试');
  }catch(error){
    if(run!==rankedQueueRun)return;
    if(playing)endMatch();
    $('rankedMatchDialog').hidden=false;$('rankedMatchDialog').classList.remove('matched');$('rankedMatchTitle').textContent='排位匹配';
    $('cancelRankedMatch').hidden=false;
    $('rankedMatchStatus').textContent=error.message||'匹配失败，请重试';
  }
};
$("cancelRoom").onclick=()=>{$("roomDialog").hidden=true};
$("copyRoom").onclick=async()=>{const code=$("roomDialogCode").value;try{await navigator.clipboard.writeText(code);$("roomMessage").textContent=`房间号 ${code} 已复制，发给朋友即可。`;$("roomMessage").className="success"}catch{$("roomMessage").textContent=`请手动复制房间号：${code}`;$("roomMessage").className="error"}};
$("enterRoom").onclick=()=>{if($( "roomDialog").dataset.mode==="solo"){$("roomDialog").hidden=true;soloMapAction?.();return}const code=normalizeRoomCode($("roomDialogCode").value);if(!validRoomCode(code)){$("roomMessage").textContent="房间号必须是 6 位，并按字母、数字交替，例如 A7K2M9。";$("roomMessage").className="error";return}$("room").value=code;$("roomDialog").hidden=true;clearPracticeMode();start(true)};
function scheduleReconnect(){if(!allowReconnect||!online||!playing||reconnectTimer)return;const delay=Math.min(800*2**reconnectAttempts,8000);reconnectAttempts++;$("netText").textContent=`重连中 · ${Math.ceil(delay/1000)}s`;$("netDot").style.background="#ffbf5f";reconnectTimer=setTimeout(()=>{reconnectTimer=null;connect(true)},delay)}
async function connect(isRetry=false){
  if(!online||!allowReconnect)return;const connectionSeq=sessionSeq;
  if(!isRetry)resetGameChat();
  const protocol=location.protocol==="https:"?"wss":"ws",room=activeRoomCode||"ORBIT-01";
  const socketPath=`/api/${isObjectiveMode()||isArenaMode()||roomMode==='survival'||isBombMode()?roomMode:"room"}/${room}`;let socketTicket;
  try{socketTicket=(await accountApi('account/socket-ticket',{...accountSession(),path:socketPath})).ticket}catch(error){$("netText").textContent=error.message;scheduleReconnect();return}if(!online||!allowReconnect||connectionSeq!==sessionSeq)return;
  const socket=new WebSocket(`${protocol}://${location.host}${socketPath}?ticket=${encodeURIComponent(socketTicket)}`);ws=socket;$("netText").textContent=isRetry?"正在重新连接":"正在连接";$("netDot").style.background="#ffbf5f";
  socket.onopen=()=>{if(ws!==socket)return;socket.send(JSON.stringify({type:"join",id:playerId,name:$("name").value,color:"#5ff5ff",team:playerTeam,map:activeMapId,reconnect:isRetry,creator:isRoomCreator,preset:isBombMode()?$('bombPreset').value:undefined,gunmasterWeapon:roomMode==='gunmaster'?gunmasterWeapon:undefined,...((isTenPointMode()||roomMode==='survival')?{account:accountSession()?.name,token:accountSession()?.token,device:accountSession()?.device}:{})}));$("netText").textContent=isRetry?"正在恢复房间":"正在加入房间";$("netDot").style.background="#ffbf5f"};
  socket.addEventListener('message',e=>{if(ws!==socket)return;let data;try{data=JSON.parse(e.data)}catch{return}handleGameChat(data)});
  socket.addEventListener('message',e=>{if(!isBombMode()||ws!==socket)return;e.stopImmediatePropagation();let d;try{d=JSON.parse(e.data)}catch{return}handleBombMessage(d)});
  socket.onmessage=(e)=>{if(ws!==socket)return;let d;try{d=JSON.parse(e.data)}catch{return}if(d.type==='damageResult'){receiveDamageResult(d);return}if(d.type==='phaseFlash'){if((!isArenaMode()&& !isObjectiveMode()&&!isBombMode())||d.round===(isBombMode()?bombState?.round:isArenaMode()?duelState?.round:objectiveState?.round))receivePhaseFlash(d);return}if(['welcome','objectiveWelcome','duelWelcome'].includes(d.type))syncRoomMap(d.map);if(d.type==='supplyState'){updateSupplyState(d);return}if(d.type==='coverSnapshot'){applyCoverSnapshot(d.covers);return}if(d.type==='coverState'){if(!isArenaMode()&&!isObjectiveMode()||d.round===(isArenaMode()?duelState?.round:objectiveState?.round))applyCoverState(d.coverId,d.hp);return}if(handleObjectiveMessage(d)||handleDuelMessage(d)||handleSurvivalMessage(d))return;if(d.type==="full"){allowReconnect=false;alert(d.message||"房间已满");return}if(d.type==="welcome"){reconnectAttempts=0;playerTeam=d.team;updatePlayerIdentity(false);$("netText").textContent=isRetry?"已重新连接":"联机已连接";$("netDot").style.background="#6fffc5";syncNow();return}if(d.type==="scoreboard"){applyScoreboard(d);return}if(d.id===playerId)return;if(d.type==="join"){addRemote(d.id,d.name,d.team)}if(d.type==="leave"){const r=remotes.get(d.id);if(r){disposeObject(r.mesh);remotes.delete(d.id)}}if(d.type==="state"){const r=addRemote(d.id,d.name,d.team),remoteProne=Boolean(d.prone);setActorProne(r.mesh,remoteProne);setActorSlide(r.mesh,!!d.slide);applyRemoteSkin(r,d.skin,d.knifeSkin,d.weapon);if(d.position){r.target.set(d.position[0],Math.max(0,d.position[1]-((remoteProne||d.slide)?.48:1.7)),d.position[2]);r.mesh.rotation.y=d.rotation||0}if(d.hp<=0)r.mesh.visible=false;else r.mesh.visible=true}if(d.type==="muzzle")showRemoteMuzzleFlash(d.id,Boolean(d.hidden));if(d.type==="rocket")spawnRemoteRocket(d);if(d.type==="blast")showRemoteBlast(d);if(d.type==="throwable")spawnRemoteThrowable(d);if(d.type==="throwableBurst")showRemoteThrowableBurst(d);if(d.type==="shot"&&d.target===playerId&&d.team!==playerTeam)damage(Math.max(0,Math.min(200,Number(d.damage)||0)),d.id,d.zone||"body",d.shotId)};
  socket.addEventListener("message",e=>{if(ws!==socket||isArenaMode()||isObjectiveMode())return;let d;try{d=JSON.parse(e.data)}catch{return}if(d.type==="state"){const remote=remotes.get(d.id);if(remote)remote.hp=Math.max(0,Number(d.hp)||0)}if(d.type==="heal"&&d.team===playerTeam&&Array.isArray(d.targets)&&d.targets.includes(playerId)){hp=Math.min(100,hp+Math.max(0,Math.min(20,Number(d.amount)||20)));clearWounds();feed("队友使用战地救护器：恢复 20 生命并解除负面效果");updateHud();syncNow()}});
  socket.onerror=()=>{if(ws===socket)socket.close()};
  socket.onclose=()=>{if(ws!==socket)return;ws=null;if(allowReconnect){$("netText").textContent="连接中断";$("netDot").style.background="#ff496c";scheduleReconnect()}};
}
function addRemote(id,name="玩家",team=1){if(remotes.has(id)){const existing=remotes.get(id);if(existing.mesh.userData.name!==name||existing.mesh.userData.team!==team)setActorLabel(existing.mesh,name,team);return existing}const mesh=actorMesh((ARENA_TEAMS[team]||ARENA_TEAMS[1]).mesh);const spawn=randomSpawn();mesh.position.set(spawn.x,0,spawn.z);setActorLabel(mesh,name,team);scene.add(mesh);const r={mesh,target:mesh.position.clone(),targetEyePosition:new THREE.Vector3(spawn.x,1.7,spawn.z),targetYaw:0,pitch:0,targetPitch:0};remotes.set(id,r);return r}
function applyRemoteSkin(remote,id,knifeId,weapon){if(!remote)return;const actor=remote.mesh.userData;if(actor.skinId===id&&actor.knifeSkinId===knifeId&&actor.heldWeapon===weapon)return;const formId=knifeId||'froststeel',knifeChanged=actor.knifeFormId!==formId;actor.skinId=id;actor.knifeSkinId=knifeId;actor.knifeFormId=formId;actor.heldWeapon=weapon;const skin=skinById(id),knifeSkin=knifeSkinById(knifeId),holdingKnife=weapon==='knife',form=KNIFE_FORMS[formId]||KNIFE_FORMS.froststeel;actor.rifle.visible=actor.rifleGlow.visible=!holdingKnife;actor.heldBlade.visible=actor.heldGuard.visible=actor.heldGrip.visible=holdingKnife;if(knifeChanged){actor.heldBlade.geometry.dispose();actor.heldBlade.geometry=new THREE.ExtrudeGeometry(knifeShape(form.blade),{depth:.035,bevelEnabled:true,bevelSize:.006,bevelThickness:.008});actor.heldBlade.rotation.x=-Math.PI/2;actor.heldBlade.position.set(.18,1.12,-.23);actor.heldGuard.geometry.dispose();actor.heldGuard.geometry=new THREE.ExtrudeGeometry(knifeShape(form.guardProfile),{depth:.06,bevelEnabled:false});actor.heldGuard.rotation.x=-Math.PI/2;actor.heldGuard.position.z=-.23;actor.heldGrip.geometry.dispose();actor.heldGrip.geometry=new THREE.BoxGeometry(form.handle[0],form.handle[1],form.handle[2])}actor.rifle.material.color.setHex(skin?.shell??0x111820);actor.heldBlade.material.color.setHex(knifeSkin?.shell??0xb9eafa);actor.heldBlade.material.emissive.setHex(knifeSkin?.accent??0x163d4c);actor.heldGuard.material.color.setHex(knifeSkin?.dark??0x345365);actor.heldGrip.material.color.setHex(knifeSkin?.grip??0x17222b)}
function showRemoteMuzzleFlash(id,hidden=false){const r=remotes.get(id);if(!r?.mesh.visible)return;let fx=r.mesh.userData.muzzleFx;if(!fx){fx=new THREE.Group();const outer=new THREE.Mesh(new THREE.ConeGeometry(.13,.42,8),new THREE.MeshBasicMaterial({color:0xff6a18,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending})),core=new THREE.Mesh(new THREE.ConeGeometry(.07,.28,7),new THREE.MeshBasicMaterial({color:0xffed9b,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));outer.rotation.x=core.rotation.x=-Math.PI/2;outer.position.z=-.17;core.position.z=-.12;fx.add(outer,core);fx.position.set(.18,1.14,-1.24);r.mesh.userData.pose.add(fx);r.mesh.userData.muzzleFx=fx;r.mesh.userData.muzzleFxParts=[outer,core]}const level=hidden?.13:1;r.mesh.userData.muzzleFxParts[0].material.opacity=.88*level;r.mesh.userData.muzzleFxParts[1].material.opacity=.96*level;const token=(r.mesh.userData.muzzleFxToken||0)+1;r.mesh.userData.muzzleFxToken=token;setTimeout(()=>{if(r.mesh.userData.muzzleFxToken!==token)return;for(const part of r.mesh.userData.muzzleFxParts)part.material.opacity=0},75)}

// Bomb messages carry a round number so delayed projectiles cannot affect a later round.
const sendNetworkBase=sendNetwork;
sendNetwork=function(data){if(isBombMode()){if(['shot','rocket','blast','throwable','throwableBurst','muzzle','phaseFlash'].includes(data.type)&&bombState?.phase!=='running')return;if(data.type==='shot'&&data.name){const bot=bots.find(b=>b.userData.name===data.name);if(bot)data={...data,type:'botShot',botId:bot.userData.networkId}}data={...data,round:bombState?.round??0,...(data.type==='state'?{interacting:!!keys.KeyF&&!paused}: {})}}sendNetworkBase(data)};
const duelBlockedBase=duelBlocked;
duelBlocked=function(){if(isBombMode())return !bombState||bombState.phase!=='running'&&!(bombState.phase==='prep'&&playerTeam!==bombState.attackTeam)||hp<=0||online&&ws?.readyState!==1;return duelBlockedBase()};
// Duel-only client state. Returning to ordinary/AI mode disables every hook below.
function duelBlocked(){if(roomMode==='survival')return towerSurvival.blocked||online&&ws?.readyState!==1;if(isObjectiveMode())return !objectiveState||objectiveState.phase!=='running'||(online&&ws?.readyState!==1);return isArenaMode()&&(!duelState||duelState.phase!=='running'||spectator||ws?.readyState!==1||roomMode==='gunmaster'&&Date.now()+duelClockOffset<duelState.boutStartAt)}
function sendNetwork(data){if(ws?.readyState!==1)return;if(data.type==='shot'&&remotes.has(data.target)&&!data.hitPoint){const target=remotes.get(data.target).mesh;data.hitPoint=target.position.clone().add(new THREE.Vector3(0,data.zone==='head'?1.95:1.3,0)).toArray()}if(isObjectiveMode()){if(['shot','rocket','blast','throwable','throwableBurst','muzzle','phaseFlash'].includes(data.type)&&duelBlocked())return;data={...data,round:objectiveState?.round??0,...(data.type==='state'?{interacting:!!keys.KeyF&&!paused}: {})}}if(isArenaMode()){if(['shot','rocket','blast','throwable','throwableBurst','death'].includes(data.type)&&duelBlocked())return;if(data.type==='state'&&spectator)return;data={...data,round:duelState?.round??0,bout:duelState?.bout??0,...(data.type==='state'?{pitch,weapon:weaponKey,ammo,mag:weaponDef.mag,armor:EQUIPMENT.护甲[equipmentLoadout.护甲][0],helmet:EQUIPMENT.头盔[equipmentLoadout.头盔][0],skill:Math.round(phase),equipment:EQUIPMENT.战术道具[equipmentLoadout.战术道具][0],tacticalReady:Math.max(0,Math.ceil((equipmentReadyAt-performance.now())/1000)),energy:Math.round(equipmentEnergy)}: {})}}if(['shot','rocket','survivalHit'].includes(data.type))data.weapon=weaponKey;if(data.type==='state'){data.prone=prone;data.slide=Boolean(slideStartedAt);data.skin=activeSkin()?.id||'';data.knifeSkin=activeKnifeSkin()?.id||'';data.weapon=weaponKey}ws.send(JSON.stringify(data))}
function resetDuelClient(){duelState=null;spectator=isArenaMode();watchTarget='';lastDuelRoster='';$('duelPanel').hidden=!isArenaMode();$('arenaScores').hidden=!(ARENA_SEATS[roomMode]>2);document.body.classList.toggle('arena-multiteam',ARENA_SEATS[roomMode]>2);document.body.classList.toggle('duel-spectator',spectator);$('watchCombat').hidden=true;if(isArenaMode()){$('duelTitle').textContent=roomMode==='duel'?'单挑模式':arenaTitle();$('duelTimer').textContent=isTenPointMode()?'先到 10 分':'10:00';$('duelStatus').textContent='正在连接房间…';$('duelRoster').textContent='';$('watchStatus').textContent='';$('duelReady').disabled=true;$('watchControl').hidden=true}}
function openArenaRoom(arena,action){pendingRoomMode=arena;openRoomDialog(action);const title=arena==='duel'?'单挑':arena==='tri'?'1v1v1':arena==='quad'?'1v1v1v1':arena==='challenge'?'枪械挑战':'武器大师',seats=ARENA_SEATS[arena];$('roomDialogTitle').textContent=action==='create'?`创建${title}房`:`加入${title} / 观战`;$('roomDialogHelp').textContent=`${title}专用房间：${seats} 人各自一队，所有人到齐并准备后开始 10 分钟对局；满员后进入观战席。`;$('roomMessage').textContent='从同一模式入口输入相同房间号；选手退出后观众可补位。'}
$('createDuel').onclick=()=>openArenaRoom('duel','create');$('joinDuel').onclick=()=>openArenaRoom('duel','join');
let matchTicket='',matchRun=0;
async function cancelQuickDuel(){matchRun++;$('matchDialog').hidden=true;const ticket=matchTicket;matchTicket='';if(ticket)fetch(`/api/matchmaking/duel?ticket=${encodeURIComponent(ticket)}`,{method:'DELETE'}).catch(()=>{})}
$('cancelMatch').onclick=cancelQuickDuel;
$('quickDuel').onclick=async()=>{
  await cancelQuickDuel();const run=++matchRun;$('matchDialog').hidden=false;$('matchStatus').textContent='正在寻找单挑对手…';
  try{
    const response=await fetch('/api/matchmaking/duel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({player:playerId})});
    const first=await response.json();if(!response.ok)throw Error(first.error||'匹配失败');
    if(run!==matchRun){fetch(`/api/matchmaking/duel?ticket=${encodeURIComponent(first.ticket)}`,{method:'DELETE'}).catch(()=>{});return}
    matchTicket=first.ticket;let state=first;
    while(run===matchRun&&state.status==='waiting'){
      await new Promise(resolve=>setTimeout(resolve,1500));if(run!==matchRun)return;
      const poll=await fetch(`/api/matchmaking/duel?ticket=${encodeURIComponent(matchTicket)}`,{cache:'no-store'});
      state=await poll.json();if(!poll.ok)throw Error(state.error||'匹配中断');
      if(state.status==='expired')throw Error('匹配已超时，请重新尝试');
    }
    if(run!==matchRun)return;
    if(state.status!=='matched'||!/^M[a-f0-9]{25}$/i.test(state.room)||!['crossroads','depot','arcade'].includes(state.map))throw Error('匹配结果无效');
    matchTicket='';matchRun++;$('matchDialog').hidden=true;pendingRoomMode='duel';$('room').value=state.room;$('mapSelect').value=state.map;$('roomDialog').dataset.mode='create';start(true);
  }catch(error){if(run!==matchRun)return;$('matchStatus').textContent=error.message||'匹配失败，请重试';matchTicket=''}
};
$('createTri').onclick=()=>openArenaRoom('tri','create');$('joinTri').onclick=()=>openArenaRoom('tri','join');
$('createQuad').onclick=()=>openArenaRoom('quad','create');$('joinQuad').onclick=()=>openArenaRoom('quad','join');
$('createGunmaster').onclick=()=>openArenaRoom('gunmaster','create');$('joinGunmaster').onclick=()=>openArenaRoom('gunmaster','join');
$('createChallenge').onclick=()=>openArenaRoom('challenge','create');$('joinChallenge').onclick=()=>openArenaRoom('challenge','join');
$('duelReady').onclick=()=>sendNetwork({type:'ready'});$('duelExit').onclick=()=>endMatch();
$('watchSelect').onchange=e=>{watchTarget=e.target.value};
function clearRoundEffects(){effects.clear();for(const effect of impactEffects)disposeObject(effect.group);impactEffects.length=0;for(const item of [...rockets,...remoteRockets,...fireZones,...thrownItems,...smokeClouds])disposeObject(item.mesh);rockets.length=remoteRockets.length=fireZones.length=thrownItems.length=smokeClouds.length=0;trajectoryLine.visible=false;grenadeArc.visible=grenadeArcRibbon.visible=grenadeArcEnd.visible=false;weaponActionToken++;reloading=cycling=firing=false;adsMouse=adsKey=false;adsBlend=0;viewKick=viewKickTarget=viewKickVelocity=viewRoll=gunKick=gunKickSide=shotFovPulse=crossBloom=0;phaseActive=0;scene.fog.color.set(0x08101a);renderer.domElement.style.filter='';clearInterval(respawnTimer);respawnTimer=null;$('respawn').hidden=true;for(const key of Object.keys(keys))keys[key]=false;knockbackVelocity.set(0,0,0)}
function resetDuelFighter(){clearRoundEffects();throwCharges=2;nextThrowRefill=0;hp=100;phase=100;equipmentEnergy=100;equipmentReadyAt=shieldUntil=0;activeWeaponSlot=0;resetWeaponRuntime();suppressWeaponStash=true;selectWeapon(weaponSlots[0],{equip:false});suppressWeaponStash=false;slideStartedAt=0;slideCooldownUntil=0;prone=false;playerEyeHeight=1.7;verticalVelocity=0;grounded=true;camera.position.copy(playerSpawn());camera.fov=76;camera.updateProjectionMatrix();updateHud();syncNow()}
function applyChallengeWeapon(key){if(roomMode!=='challenge'||!WEAPONS[key]||key==='knife'||weaponSlots[0]===key)return;weaponSlots=[key,key];activeWeaponSlot=0;resetWeaponRuntime();suppressWeaponStash=true;selectWeapon(key,{equip:false});suppressWeaponStash=false;updateHud()}
function resetGunmasterBout(){const previous=Math.max(0,hp);resetDuelFighter();hp=previous;gunmasterHeal=performance.now()+2000;updateHud();syncNow();for(const remote of remotes.values()){remote.mesh.visible=false;remote.hp=100;remote.networkReady=false}}
function updateGunmasterCredits(){const button=$('gunmasterOpen');button.hidden=roomMode!=='gunmaster'||gunmasterCredits<=0||spectator;button.textContent=`改装配件 · ${gunmasterCredits} 次（${keyLabel('interact')}）`;setText('gunmasterCredits',`可选择 ${gunmasterCredits} 次`);setText('gunmasterHelp',`每次击杀累计 1 次选择；按 ${keyLabel('interact')} 自己打开。可在空槽装配或替换已有配件。`)}
function renderGunmasterChoices(){const panel=$('gunmasterUpgrade'),list=$('gunmasterChoices');updateGunmasterCredits();list.replaceChildren();if(!gunmasterCredits||roomMode!=='gunmaster'||spectator){panel.hidden=true;return}for(const [slot,choices] of Object.entries(MODS[gunmasterWeapon])){const section=document.createElement('section'),title=document.createElement('h3'),cards=document.createElement('div');section.className='gunmasterCategory';title.textContent=slot;cards.className='gunmasterCategoryItems';for(const [id,item] of Object.entries(choices)){if(builds[gunmasterWeapon][slot]===id)continue;const button=document.createElement('button');button.type='button';const name=document.createElement('b');name.textContent=item[0];const description=document.createElement('small');description.textContent=controlDescription(item[1]);button.append(name,description);button.onclick=()=>{builds[gunmasterWeapon][slot]=id;gunmasterCredits--;suppressWeaponStash=true;selectWeapon(gunmasterWeapon,{equip:false});suppressWeaponStash=false;feed(`武器大师：已装配 ${item[0]}`);updateGunmasterCredits();if(gunmasterCredits)renderGunmasterChoices();else{panel.hidden=true;if(playing&&!paused)requestGamePointerLock()}};cards.append(button)}if(cards.childElementCount){section.append(title,cards);list.append(section)}}$('gunmasterWeaponTitle').textContent='选择 '+WEAPONS[gunmasterWeapon].name+' 配件';panel.hidden=false;if(document.pointerLockElement===canvas)document.exitPointerLock()}
$('gunmasterOpen').onclick=renderGunmasterChoices;
$('gunmasterLater').onclick=()=>{$('gunmasterUpgrade').hidden=true;if(playing&&!paused)requestGamePointerLock()};
document.addEventListener('keydown',e=>{if(roomMode==='gunmaster'&&e.code===keyBindings.interact&&gunmasterCredits>0&&!e.repeat&&playing&&!paused&&$('gunmasterUpgrade').hidden){e.preventDefault();renderGunmasterChoices()}});
function applyDuelRemote(d){if(d.id===playerId||d.team<0)return;const r=addRemote(d.id,d.name,d.team),isProne=!!d.prone;setActorProne(r.mesh,isProne);setActorSlide(r.mesh,!!d.slide);applyRemoteSkin(r,d.skin,d.knifeSkin,d.weapon);if(d.position){r.target.set(d.position[0],Math.max(0,d.position[1]-((isProne||d.slide)?.48:1.7)),d.position[2]);r.targetEyePosition.fromArray(d.position);r.targetYaw=Number(d.rotation)||0;r.targetPitch=Number(d.pitch)||0;if(!r.networkReady||r.mesh.position.distanceToSquared(r.target)>144){r.mesh.position.copy(r.target);r.mesh.rotation.y=r.targetYaw;r.eyePosition?.copy(r.targetEyePosition)}r.networkReady=true}r.hp=d.hp;r.weapon=d.weapon;r.ammo=d.ammo;r.mag=d.mag;r.armor=d.armor;r.helmet=d.helmet;r.skill=d.skill;r.equipment=d.equipment;r.tacticalReady=d.tacticalReady;r.energy=d.energy;r.mesh.visible=d.hp>0}
function updateArenaRemotes(dt){if(isArenaMode()&&!spectator){const blend=1-Math.exp(-dt*18);for(const r of remotes.values()){if(!r.networkReady)continue;r.mesh.position.lerp(r.target,blend);r.mesh.rotation.y+=Math.atan2(Math.sin(r.targetYaw-r.mesh.rotation.y),Math.cos(r.targetYaw-r.mesh.rotation.y))*blend}}else if(isObjectiveMode()||isBombMode()){const blend=1-Math.exp(-dt*18);for(const r of remotes.values())r.mesh.position.lerp(r.target,blend)}}
function renderArenaScores(d){if(d.seats<3)return;const board=$('arenaScores');board.replaceChildren();for(let team=0;team<d.seats;team++){const row=document.createElement('div'),name=document.createElement('span'),value=document.createElement('b');row.dataset.team=String(team);name.textContent=ARENA_TEAMS[team].name;value.textContent=String(d.scores[team]||0);row.append(name,value);board.append(row)}}
function applyDuelSnapshot(d){
  if(!isArenaMode()||!playing||duelState&&d.round<duelState.round)return;
  const old=duelState,wasSpectator=spectator,me=d.players.find(p=>p.id===playerId);if(!me)return;
  if(roomMode==='tournament')tournamentWaitStartedAt=d.phase==='waiting'?(old?.phase==='waiting'?tournamentWaitStartedAt||Date.now():Date.now()):0;
  const nextRound=d.phase==='running'&&old?.round!==d.round,nextBout=roomMode==='gunmaster'&&old?.round===d.round&&d.bout>old?.bout;
  if(roomMode==='gunmaster'&&WEAPONS[d.gunmasterWeapon]&&d.gunmasterWeapon!=='knife'&&gunmasterWeapon!==d.gunmasterWeapon){gunmasterWeapon=d.gunmasterWeapon;weaponSlots=[gunmasterWeapon,gunmasterWeapon];activeWeaponSlot=0;resetWeaponRuntime();suppressWeaponStash=true;selectWeapon(gunmasterWeapon,{equip:false});suppressWeaponStash=false}
  if(roomMode==='challenge')applyChallengeWeapon(d.challengeWeapon);
  duelState=d;duelClockOffset=d.serverNow-Date.now();spectator=me.team===-1;playerTeam=me.team;score=d.blue;redScore=d.red;setText('blueScore',score);setText('redScore',redScore);renderArenaScores(d);updatePlayerIdentity();
  $('duelPanel').hidden=false;$('duelPanel').dataset.phase=d.phase;$('duelPanel').dataset.spectator=String(spectator);document.body.classList.toggle('duel-spectator',spectator);
  const activeIds=new Set(d.players.filter(p=>p.team!==-1&&p.connected).map(p=>p.id));for(const [id,r] of remotes)if(!activeIds.has(id)){disposeObject(r.mesh);remotes.delete(id)}
  for(const p of d.players)if(p.id!==playerId&&p.team!==-1&&p.connected){if(p.state)applyDuelRemote(p.state);else{const r=addRemote(p.id,p.name,p.team);r.mesh.visible=false;}}
  if(nextRound){resetCovers();seenKills.clear();matchFinished=false;paused=false;bonusGuard=0;markUntil=adsBoostUntil=hipBoostUntil=0;$('pauseScreen').hidden=true;clearRoundEffects();for(const remote of remotes.values())remote.networkReady=false;if(roomMode==='gunmaster'){builds[gunmasterWeapon]={};gunmasterCredits=0;gunmasterLastKillId='';$('gunmasterUpgrade').hidden=true}}
  if(!spectator&&(nextRound||wasSpectator))resetDuelFighter();
  else if(!spectator&&nextBout)resetGunmasterBout();
  if(spectator&&!wasSpectator)clearRoundEffects();
  if(!spectator&&hp<=0&&!respawnTimer&&d.phase==='running'&&roomMode!=='gunmaster')respawn();
  if(d.phase!=='running'||spectator){firing=false;adsMouse=adsKey=false;$('adsOverlay').className='';if(document.pointerLockElement===canvas)document.exitPointerLock();}
  if(d.phase==='finished'&&old?.phase!=='finished'){clearRoundEffects();paused=false;$('pauseScreen').hidden=true;}
  if(d.kill&&!seenKills.has(d.kill.id)){seenKills.add(d.kill.id);feed(`${d.kill.killer} 击倒 ${d.kill.victim}`);if(d.kill.killerId===playerId){showKillToast(d.kill.victim,!!d.kill.knife);if(roomMode==='gunmaster'){gunmasterCredits++;gunmasterLastKillId=d.kill.id;updateGunmasterCredits();feed(`获得 1 次改装机会 · 按 ${keyLabel('interact')} 选择配件`)}}const victim=remotes.get(d.kill.victimId);if(victim&&roomMode!=='gunmaster'){victim.hp=0;victim.mesh.visible=false;}}
  const rosterKey=JSON.stringify(d.players.map(p=>[p.id,p.name,p.team,p.connected,p.ready]));
  if(rosterKey!==lastDuelRoster){lastDuelRoster=rosterKey;$('duelRoster').replaceChildren();for(let team=0;team<d.seats;team++){const p=d.players.find(p=>p.team===team),row=document.createElement('div');row.dataset.team=String(team);row.textContent=`${ARENA_TEAMS[team].name}：${p?p.name+(p.connected?(p.ready?' · 已准备':''):' · 等待重连'):'等待选手'}`;$('duelRoster').append(row)}const watchers=document.createElement('div');watchers.textContent=`观战席：${d.players.filter(p=>p.team===-1).length} 人`;$('duelRoster').append(watchers);$('watchSelect').replaceChildren();for(const p of d.players.filter(p=>p.team!==-1&&p.connected)){const option=document.createElement('option');option.value=p.id;option.textContent=`${ARENA_TEAMS[p.team].name} · ${p.name}`;$('watchSelect').append(option)}if(!activeIds.has(watchTarget))watchTarget=d.players.find(p=>p.team!==-1&&p.connected)?.id||'';$('watchSelect').value=watchTarget;}
  $('watchControl').hidden=!spectator;$('duelReady').hidden=isTenPointMode()||d.phase==='running';$('duelReady').disabled=me.ready;
  $('duelReady').textContent=me.ready?(d.seats===2?'已准备，等待对方':'已准备，等待其他选手'):d.phase==='finished'?'继续下一局':'准备开始';
  $('duelTitle').textContent=d.phase==='finished'?(d.winner===-1?'平局':isTenPointMode()?(d.winner===me.team?`${arenaTitle()}胜利`:`${arenaTitle()}失败`):`${ARENA_TEAMS[d.winner].name}获胜`):`${arenaTitle()} · ${isTenPointMode()?'先到 10 分':'10 分钟'}`;
  $('duelStatus').textContent=isTenPointMode()?(d.phase==='finished'?roomMode==='tournament'?`最终比分 ${d.scores.join(' : ')} · 灯数正在结算，退出后查看赛事页`:`最终比分 ${d.scores.join(' : ')} · 正在结算…`:d.phase==='waiting'?'等待另一名选手加入…':'先到 10 分者获胜'):d.phase==='finished'?`本局 ${d.scores.join(' : ')}。可退出，或继续留在原房间。`:d.phase==='waiting'?(d.seats===2?'两名选手准备后开始。观众可切换观看对象。':`${d.seats} 名选手到齐并准备后开始。`):roomMode==='challenge'?`本局限定：${WEAPONS[d.challengeWeapon]?.name||'赤线 V6'}`:spectator?'正在观战；选手离开后，将随机抽取观众补位。':d.seats===2?'按双方队伍击杀数计分，时间到结算。':'按各队击杀数计分，时间到结算。';
  if(roomMode==='ranked'&&d.phase==='finished'&&!rankedResultRequested){rankedResultRequested=true;void claimHumanRankedResult()}
  updateDuelClock();
}
async function claimHumanRankedResult(){const account=accountSession(),room=activeRoomCode;if(!account||!room)return;try{const result=await accountApi('ranked/result',{...account,room});if(roomMode==='ranked'&&activeRoomCode===room){setText('duelStatus',`最终比分 ${duelState?.scores.join(' : ')} · ${result.delta>0?'+':''}${result.delta} 排位分 · 当前 ${result.rankPoints} 分`);void refreshAccountProfile()}}catch(error){if(roomMode==='ranked')setText('duelStatus',`结算同步中：${error.message}`)}}
function showShotBlood(d){const r=remotes.get(d.target);if(!r)return;const y=d.zone==='head'?1.95:d.zone==='arm'?1.3:d.zone==='leg'?.45:d.zone==='abdomen'?.8:d.zone==='explosion'?1:1.25;bloodFX(r.mesh.position.clone().add(new THREE.Vector3(0,y,0)),d.zone==='head')}
function handleDuelMessage(d){if(!isArenaMode()){if(d.type==='shot')showShotBlood(d);return false}if(d.type==='duelWelcome'){reconnectAttempts=0;$('netText').textContent=`${arenaTitle()}已连接`;$('netDot').style.background='#6fffc5';return true}if(d.type==='duel'){applyDuelSnapshot(d);return true}if(['state','shot','rocket','blast','throwable','throwableBurst','muzzle'].includes(d.type)&&(d.round!==duelState?.round||roomMode==='gunmaster'&&d.bout!==duelState?.bout))return true;if(d.type==='muzzle'){showRemoteMuzzleFlash(d.id,Boolean(d.hidden));return true}if(d.type==='shot'){showShotBlood(d);return false}if(d.type==='state'){applyDuelRemote(d);return true}return false}
function updateDuelClock(){if(!isArenaMode()||!duelState)return;if(isTenPointMode()){setText('duelTimer','先到 10 分');return}const remaining=duelState.phase==='waiting'?600:Math.max(0,Math.ceil((duelState.endsAt-Date.now()-duelClockOffset)/1000));setText('duelTimer',String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0'));if(duelState.phase==='finished'){const seconds=Math.max(0,Math.ceil((duelState.autoContinueAt-Date.now()-duelClockOffset)/1000));setText('duelStatus',`本局 ${duelState.scores.join(' : ')}。${seconds>0?`${seconds} 秒未选择自动继续，保留原选手。`:'已选择继续，等待选手连接。'}`)}else if(roomMode==='gunmaster'&&duelState.phase==='running'){const prep=Math.max(0,Math.ceil((duelState.boutStartAt-Date.now()-duelClockOffset)/1000)),tip=`${gunmasterCredits} 次配件选择可用 · 按 ${keyLabel('interact')} 打开`;setText('duelStatus',prep?`下一轮 ${prep} 秒后开始 · ${tip}`:`击杀得 1 次配件选择 · 双方重新出生 · ${tip}`)}}
setInterval(()=>{if(roomMode==='tournament'&&playing&&duelState?.phase==='waiting'&&tournamentWaitStartedAt&&Date.now()-tournamentWaitStartedAt>120_000){endMatch();$('openTournaments').click()}},1000);
function updateDuelView(dt){
  if(!isArenaMode()||!playing)return;
  updateDuelClock();$('watchCombat').hidden=!spectator;if(!spectator)return;
  const lines=(duelState?.players||[]).filter(p=>p.team>=0).map(p=>{
    const r=remotes.get(p.id),gun=WEAPONS[r?.weapon]?.name||'—',tactical=r?.equipment?.includes('飞行')?`${r?.energy??'—'}%`:r?.tacticalReady?`${Math.ceil(r.tacticalReady)}s`:'就绪';
    return `${ARENA_TEAMS[p.team].name} ${p.name}${p.id===watchTarget?' ◀':''}\n生命 ${Math.max(0,Math.round(r?.hp||0))}  护甲 ${r?.armor||'—'} / ${r?.helmet||'—'}\n${gun}  ${r?.ammo??'—'}/${r?.mag??'—'}  相位 ${r?.skill??'—'}%  ${r?.equipment||'—'} ${tactical}`;
  });
  setText('watchCombat',lines.join('\n\n'));
  const smoothing=1-Math.exp(-dt*9);
  for(const remote of remotes.values()){remote.mesh.position.lerp(remote.target,smoothing);remote.mesh.rotation.y+=Math.atan2(Math.sin(remote.targetYaw-remote.mesh.rotation.y),Math.cos(remote.targetYaw-remote.mesh.rotation.y))*smoothing;remote.pitch=THREE.MathUtils.lerp(remote.pitch,remote.targetPitch,smoothing);if(remote.targetEyePosition){remote.eyePosition??=remote.targetEyePosition.clone();remote.eyePosition.lerp(remote.targetEyePosition,smoothing)}}
  const r=remotes.get(watchTarget);if(!r?.eyePosition){camera.position.lerp(new THREE.Vector3(0,24,45),smoothing);camera.lookAt(0,0,0);setText('watchStatus','等待选手进入战场');return;}
  const eye=r.eyePosition,yaw=r.mesh.rotation.y,offset=new THREE.Vector3(Math.sin(yaw)*3.2,1,Math.cos(yaw)*3.2),length=offset.length(),ray=new THREE.Raycaster(eye,offset.clone().normalize(),0,length),wall=ray.intersectObjects(obstacles,false)[0];if(wall)offset.setLength(Math.max(.12,wall.distance-.15));const desiredCamera=eye.clone().add(offset);camera.position.lerp(desiredCamera,smoothing);const lookTarget=eye.clone().add(new THREE.Vector3(-Math.sin(yaw)*12,Math.sin(r.pitch||0)*12,-Math.cos(yaw)*12));camera.lookAt(lookTarget);if(camera.fov!==76){camera.fov=76;camera.updateProjectionMatrix()}setText('watchStatus',r.hp>0?`跟随：${r.mesh.userData.name}`:'选手正在复活…')
}
setInterval(()=>{if(isArenaMode()&&playing)sendNetwork({type:'ping'})},5000);

function clearObjectiveMode(){objectiveState=null;objectiveActors=[];objectiveClockOffset=0;objectiveLastUpdate=0;objectiveSeenRevision=-1;objectiveWorld.hide();objectiveNavigator.clear();$('objectivePanel').hidden=true;$('objectiveResult').hidden=true;}
function initObjectiveMode(){
  if(isBombMode()){initBombMode();return;}
  if(!isObjectiveMode())return;
  hp=100;objectiveState=online?null:createMatch(roomMode,Date.now());objectiveLastUpdate=Date.now();
  $('objectivePanel').hidden=false;setText('objectiveTitle',roomMode==='ctf'?'夺旗 · 3 分获胜':'据点争夺 · 180 分获胜');
  setText('objectiveTimer',online?'连接中':'10:00');
  document.querySelector('.score>span').textContent=roomMode==='ctf'?'交旗得分':'占点得分';
  setText('objectiveStatus',online?'正在连接房间…':'');setText('objectiveHint',roomMode==='ctf'?`按住 ${keyLabel("interact")} 拿旗 / 归还 · 己旗在基地才能交旗`:'站入亮起的圆环占点 · 双方在场暂停计分');
  if(!online)setText('roomLabel',roomMode==='ctf'?'夺旗 · AI 对战':'据点争夺 · AI 对战');
  updateHud();
}
function objectiveFighters(){return [{id:playerId,name:$('name').value,team:playerTeam,position:[camera.position.x,Math.max(0,camera.position.y-playerEyeHeight),camera.position.z],hp,interacting:!!keys.KeyF&&!paused},...bots.map(b=>({id:b.uuid,name:b.userData.name,team:b.userData.team,position:b.position.toArray(),hp:b.visible?b.userData.hp:0,interacting:true}))];}
function resetObjectiveRound(){
  resetCovers();
  clearWounds();bonusGuard=0;markUntil=adsBoostUntil=hipBoostUntil=0;matchFinished=false;paused=false;$('pauseScreen').hidden=true;$('objectiveResult').hidden=true;objectiveSeenRevision=-1;objectiveNavigator.clear();
  resetDuelFighter();
  for(const b of bots){b.userData.deathCounted=false;b.userData.hp=100;b.userData.wounds=Object.create(null);b.userData.target=null;b.userData.rethink=0;b.userData.flankGoal=b.userData.flankEntry=null;b.userData.aimedAtSince=0;b.userData.moveSlideUntil=0;b.visible=true;b.userData.moveVelocity.set(0,0,0);const spawn=randomSpawn(undefined,b.userData.team);b.position.set(spawn.x,0,spawn.z);}
}
function handleObjectiveMessage(d){
  if(!isObjectiveMode())return false;
  if(['state','shot','rocket','blast','throwable','throwableBurst','muzzle','objectiveKill','heal'].includes(d.type)&&d.round!==objectiveState?.round)return true;
  if(d.type==='objectiveWelcome'){reconnectAttempts=0;playerTeam=d.team;updatePlayerIdentity();setText('netText','联机已连接');$('netDot').style.background='#6fffc5';return true;}
  if(d.type==='heal'){if(d.team===playerTeam&&Array.isArray(d.targets)&&d.targets.includes(playerId)){clearWounds();feed('队友使用战地救护器：恢复 20 生命并解除负面效果')}return true;}
  if(d.type==='objective'){
    if(objectiveState&&d.round<objectiveState.round)return true;
    const old=objectiveState;objectiveState=d;objectiveClockOffset=d.serverNow-Date.now();
    const me=d.players.find(p=>p.id===playerId);if(me){playerTeam=me.team;if(Number.isFinite(me.hp))hp=me.hp;updatePlayerIdentity();updateHud();}
    const ids=new Set(d.players.filter(p=>p.connected&&p.id!==playerId).map(p=>p.id));
    for(const [id,r]of remotes)if(!ids.has(id)){disposeObject(r.mesh);remotes.delete(id);}
    for(const p of d.players)if(p.id!==playerId&&p.connected){const r=addRemote(p.id,p.name,p.team),s=p.state;r.hp=s.hp;r.target.set(s.position[0],Math.max(0,s.position[1]-((s.prone||s.slide)?.48:1.7)),s.position[2]);if(!r.networkReady||r.mesh.position.distanceToSquared(r.target)>144)r.mesh.position.copy(r.target);r.networkReady=true;r.mesh.rotation.y=s.rotation;setActorProne(r.mesh,s.prone);setActorSlide(r.mesh,!!s.slide);applyRemoteSkin(r,s.skin,s.knifeSkin,s.weapon);r.mesh.visible=s.hp>0;}
    if(d.phase==='running'&&(!old||old.round!==d.round||old.phase==='waiting'))resetObjectiveRound();
    if(!old&&d.phase==='running')syncNow();
    if(d.phase==='running'&&hp<=0&&!respawnTimer)respawn();
    return true;
  }
  if(d.type==='objectiveKill'){
    if(!seenKills.has(d.id)){seenKills.add(d.id);feed(`${d.killer} 击倒 ${d.victim}`);if(d.killerId===playerId)showKillToast(d.victim,!!d.knife);const r=remotes.get(d.victimId);if(r)r.mesh.visible=false;}return true;
  }
  return false;
}
function objectiveBotGoal(b){if(!objectiveState)return b.position.clone();const p={id:b.uuid,team:b.userData.team,position:b.position.toArray()};return new THREE.Vector3(...botGoal(objectiveState,p,objectiveActors,bots.indexOf(b)));}
function objectiveBotDirection(b){if(objectiveNavigatorMap!==activeMapId||objectiveNavigatorColliderCount!==obstacles.length){objectiveNavigator=createObjectiveNavigator(blocked);objectiveNavigatorMap=activeMapId;objectiveNavigatorColliderCount=obstacles.length}const goal=objectiveBotGoal(b);return objectiveNavigator.direction(b.uuid,b.position.toArray(),goal.toArray(),performance.now());}
function objectiveCombatTarget(bot,now){
  if(now<(bot.userData.blindUntil||0)){bot.userData.objectiveCombatTarget=null;return null}
  if(now<(bot.userData.objectiveCombatScanAt||0))return bot.userData.objectiveCombatTarget||null;
  bot.userData.objectiveCombatScanAt=now+150+Math.random()*50;
  const muzzle=new THREE.Vector3(bot.position.x,bot.userData.prone?.55:1.35,bot.position.z),range=WEAPONS[bot.userData.weapon].range;
  let best=null,bestScore=Infinity;
  const consider=(target,pointY)=>{const point=new THREE.Vector3(target.position.x,target.position.y+pointY,target.position.z),distance=muzzle.distanceTo(point);if(distance>=range||!hasLineOfSight(muzzle,point)||!botCanDiscover(bot,target,now))return;const id=target.kind==='player'?playerId:target.kind==='bot'?target.mesh.uuid:target.id,priority=objectiveState&&carrierFlag(objectiveState,id)?-8:0,score=distance+priority;if(score<bestScore){best=target;bestScore=score}};
  if(hp>0&&bot.userData.team!==playerTeam)consider({kind:'player',position:camera.position,name:$('name').value,prone:playerLowProfile()},playerLowProfile()?-.1:-.45);
  for(const other of bots)if(other!==bot&&other.visible&&other.userData.team!==bot.userData.team)consider({kind:'bot',position:other.position,mesh:other,name:other.userData.name,prone:other.userData.prone},other.userData.prone?.38:.9);
  for(const [id,remote] of remotes)if(remote.mesh.visible&&remote.mesh.userData.team!==bot.userData.team)consider({kind:'remote',position:remote.mesh.position,id,name:remote.mesh.userData.name,prone:remote.mesh.userData.prone||remote.mesh.userData.slide},remote.mesh.userData.prone?.38:remote.mesh.userData.slide?.58:.9);
  bot.userData.objectiveCombatTarget=best;return best;
}
function objectiveTargetPriority(target,bot){if(!isObjectiveMode()||!objectiveState)return 0;const id=target.kind==='player'?playerId:target.kind==='bot'?target.mesh.uuid:target.id;if(!carrierFlag(objectiveState,id))return 0;if(objectiveState.mode==='ctf'&&bots.indexOf(bot)%3!==0)return 2;return-1;}
function updateObjectiveMode(dt){
  if(!playing||!isObjectiveMode())return;
  const localNow=Date.now(),now=localNow+objectiveClockOffset;
  if(!objectiveState)return;
  const m=objectiveState;
  if(!online){
    if(paused){const elapsed=localNow-objectiveLastUpdate;m.startedAt+=elapsed;m.endsAt+=elapsed;m.hillEndsAt+=elapsed;for(const flag of m.flags)if(flag.returnAt)flag.returnAt+=elapsed;m.lastTick=localNow;objectiveLastUpdate=localNow;return;}
    if(localNow-objectiveLastUpdate>=100){objectiveActors=objectiveFighters();tickMatch(m,objectiveActors,localNow);objectiveLastUpdate=localNow;}
    if(m.phase==='finished'&&localNow>=m.nextAt){objectiveState=createMatch(roomMode,localNow,m.round+1);resetObjectiveRound();return;}
  }
  score=m.scores[0];redScore=m.scores[1];setText('blueScore',score);setText('redScore',redScore);
  if(m.revision!==objectiveSeenRevision){objectiveSeenRevision=m.revision;if(m.event)feed(m.event);}
  const seconds=Math.max(0,Math.ceil((m.endsAt-now)/1000));setText('objectiveTimer',m.phase==='waiting'?'等待两队选手':`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`);
  if(m.phase==='finished'){
    if(!matchFinished){matchFinished=true;firing=false;adsMouse=adsKey=false;$('adsOverlay').className='';clearInterval(respawnTimer);respawnTimer=null;$('respawn').hidden=true;$('objectiveResult').hidden=false;$('objectiveContinue').disabled=false;if(document.pointerLockElement===canvas)document.exitPointerLock();}
    setText('objectiveWinner',m.scores[0]===m.scores[1]?'平局':m.scores[0]>m.scores[1]?'蓝队获胜':'红队获胜');setText('objectiveFinalScore',`${roomMode==='ctf'?'交旗':'占点'}比分　${score} : ${redScore}`);setText('objectiveContinueHint',`${Math.max(0,Math.ceil((m.nextAt-now)/1000))} 秒后自动继续 · 保留当前队伍`);return;
  }
  if(m.phase==='waiting'){setText('objectiveStatus','等待另一队加入，双方到齐后自动开局');return;}
  objectiveWorld.update(m,id=>id===playerId?[camera.position.x,camera.position.y-playerEyeHeight,camera.position.z]:bots.find(b=>b.uuid===id)?.position.toArray()||remotes.get(id)?.mesh.position.toArray(),performance.now());
  if(m.mode==='ctf'){
    const own=m.flags[playerTeam],enemy=m.flags[1-playerTeam],label=f=>f.home?'基地':f.carrier?'携带中':`掉落 ${Math.max(0,Math.ceil((f.returnAt-now)/1000))}s`;
    const destination=carryingObjectiveFlag()?(own.home?BASES[playerTeam]:own.position):enemy.position,angle=Math.atan2(-(destination[0]-camera.position.x),-(destination[2]-camera.position.z))-yaw,relative=Math.atan2(Math.sin(angle),Math.cos(angle)),arrow=Math.abs(relative)<.55?'↑':Math.abs(relative)>2.6?'↓':relative>0?'←':'→';
    setText('objectiveStatus',`己旗：${label(own)}　敌旗：${label(enemy)} · 目标 ${arrow} ${Math.round(Math.hypot(camera.position.x-destination[0],camera.position.z-destination[2]))}m`);
    const hold=m.holds[playerId];setText('objectiveHint',hold?`交互中 ${Math.min(100,Math.round((now-hold.since)/6))}% · 保持按住 ${keyLabel("interact")}`:carryingObjectiveFlag()?(own.home?'携旗中：返回己方圆环交旗 · 飞行器停用':'携旗中：先找回己方旗帜 · 飞行器停用'):`靠近旗帜按住 ${keyLabel("interact")} · 己旗在基地才能交旗`);
  }else{
    const h=HILLS[m.hill],remaining=Math.max(0,Math.ceil((m.hillEndsAt-now)/1000));setText('objectiveStatus',`${h.name} · ${m.contested?'双方争夺，暂停计分':m.owner===0?'蓝队占领':m.owner===1?'红队占领':'无人占领'} · ${remaining}s 后转移`);setText('objectiveHint',`距据点 ${Math.round(Math.hypot(camera.position.x-h.position[0],camera.position.z-h.position[2]))}m · 下一处：${HILLS[(m.hill+1)%HILLS.length].name} · 单队在圈内每秒 +1`);
  }
}
for(const [suffix,mode] of [['Ctf','ctf'],['Hardpoint','hardpoint']]){
  $('solo'+suffix).onclick=()=>openSoloMapDialog(mode==='ctf'?'夺旗模式 · AI 对战':'据点争夺 · AI 对战',()=>{clearPracticeMode();start(false,mode)});
  for(const action of ['create','join'])$(action+suffix).onclick=()=>{pendingRoomMode=mode;openRoomDialog(action);setText('roomDialogTitle',`${action==='create'?'创建':'加入'}${mode==='ctf'?'夺旗':'据点'}房间`);setText('roomDialogHelp','双方从同一模式入口输入这个六位房间号 · 每队最多 6 人 · 可中途加入');};
}
$('objectiveContinue').onclick=()=>{if(online){sendNetwork({type:'ready'});$('objectiveContinue').disabled=true;}else{objectiveState=createMatch(roomMode,Date.now(),objectiveState.round+1);resetObjectiveRound();}};
$('objectiveExit').onclick=endMatch;
setInterval(()=>{if(playing&&isObjectiveMode()&&online)sendNetwork({type:'ping'});},5000);

function clearBombMode(){bombState=null;bombHost='';bombWatchId='';bombSeenRevision=-1;bombClockOffset=0;bombLoadoutConfirmed=false;bombCredits=BOMB_START_CREDITS;bombPurchasedWeapon=null;bombAwardedRound=0;for(const mesh of bombSitesVisual){scene.remove(mesh);mesh.geometry?.dispose();mesh.material?.dispose()}bombSitesVisual=[];$('bombPanel').hidden=true;$('bombResult').hidden=true;$('bombWatchField').hidden=true;$('bombLoadout').hidden=true}
function applyBombRoundWeapon(){const key=bombPurchasedWeapon||'revolver';weaponSlots=[key,'revolver'];sidearmKey='revolver';activeWeaponSlot=0;resetWeaponRuntime();suppressWeaponStash=true;selectWeapon(key,{equip:false});suppressWeaponStash=false;syncMenuWeaponSelectors();updateHud()}
function showBombLoadout(){if(!isBombMode()||!playing)return;const select=$('bombWeapon');select.replaceChildren();const save=document.createElement('option');save.value='';save.textContent='不买主枪 · 本回合使用免费 R6';select.append(save);for(const [key,cost] of Object.entries(BOMB_WEAPON_COSTS)){const option=document.createElement('option');option.value=key;option.textContent=`${WEAPONS[key].name} · ${cost} 相位点`;option.disabled=cost>bombCredits;select.append(option)}select.value='';setText('bombBuyTitle',`第 ${Math.min(12,(bombState?.round||0)+1)}/12 回合购买阶段`);setText('bombCredits',`相位点 ${bombCredits}`);$('bombReady').disabled=online&&ws?.readyState!==1;setText('bombLoadoutStatus',online&&ws?.readyState!==1?'正在连接房间…':'胜利 +1200 · 失败 +800 · 上限 5000');$('bombLoadout').hidden=false;firing=false;if(document.pointerLockElement===canvas)document.exitPointerLock()}
function confirmBombLoadout(){if(!isBombMode()||bombLoadoutConfirmed||online&&ws?.readyState!==1)return;const choice=$('bombWeapon').value||null,purchase=buyBombWeapon(bombCredits,choice);if(!purchase){setText('bombLoadoutStatus','相位点不足，请换一把枪或存点数');return}bombLoadoutConfirmed=true;$('bombReady').disabled=true;if(online){sendNetwork({type:'ready',weapon:choice});setText('bombLoadoutStatus','已确认 · 等待其他玩家购买')}else{bombCredits=purchase.credits;bombPurchasedWeapon=purchase.weapon;applyBombRoundWeapon();resetBombRoundLocal(Date.now());$('bombLoadout').hidden=true;requestGamePointerLock()}}
$('bombReady').onclick=confirmBombLoadout;
function initBombMode(){clearBombMode();normalBombLoadout={slots:[...weaponSlots],sidearm:sidearmKey};applyBombRoundWeapon();setText('hudControls',`${keyLabel('forward')}/${keyLabel('left')}/${keyLabel('back')}/${keyLabel('right')} 移动 · ${keyLabel('weapon1')} 主枪 · ${keyLabel('sidearm')} 免费 R6 · ${keyLabel('knife')} 刀 · ${keyLabel('jump')} 跳跃 · ${keyLabel('interact')} 安包/拆包 · Esc 暂停`);$('bombPanel').hidden=false;document.querySelector('.score>span').textContent='爆破回合';setText('bombStatus',online?'等待房间连接':'准备开始');for(const [site,point] of Object.entries(BOMB_SITES)){const ring=new THREE.Mesh(new THREE.RingGeometry(2.5,3,36),new THREE.MeshBasicMaterial({color:site==='A'?0xff876c:0x8f9cff,transparent:true,opacity:.75,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.set(point[0],.07,point[2]);scene.add(ring);bombSitesVisual.push(ring);const beacon=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,4,8),new THREE.MeshBasicMaterial({color:site==='A'?0xff876c:0x8f9cff,transparent:true,opacity:.32,depthWrite:false}));beacon.position.set(point[0],2,point[2]);scene.add(beacon);bombSitesVisual.push(beacon)}if(!online){bombState=createBombMatch(Date.now());setupBombBots(BOMB_PRESETS.solo)}showBombLoadout();setTimeout(()=>{if(playing&&isBombMode())setText('coach','每回合买一把主枪 · 3 手枪 · 4 刀')},1300)}
function setupBombBots(config,serverBots){for(const b of bots)disposeObject(b);bots.length=0;spawnBots();const definitions=serverBots||[...Array(config.alliedAi+config.enemyAi)].map((_,i)=>({id:`local-bomb-${i}`,name:generateCallsign(),team:i<config.alliedAi?0:1,weapon:null}));while(bots.length>definitions.length)disposeObject(bots.pop());for(let i=0;i<bots.length;i++){const bot=bots[i],record=definitions[i];bot.userData.networkId=record.id;bot.userData.name=record.name;bot.userData.team=record.team;bot.userData.weapon=record.weapon||bot.userData.weapon;bot.userData.hp=100;bot.userData.deathCounted=false;bot.visible=true;setActorLabel(bot,record.name,record.team);const p=randomSpawn(undefined,record.team);bot.position.set(p.x,0,p.z)}}
function bombFighters(){return [{id:playerId,team:playerTeam,hp,position:[camera.position.x,camera.position.y-playerEyeHeight,camera.position.z],interacting:!!keys.KeyF&&!paused,connected:true},...bots.map(b=>({id:b.userData.networkId||b.uuid,team:b.userData.team,hp:b.visible?b.userData.hp:0,position:b.position.toArray(),interacting:bombBotInteracting(b),connected:true}))]}
function bombBotInteracting(bot){if(!bombState||bombState.phase!=='running'||!bot.visible)return false;const m=bombState,site=m.plantedSite||((bots.indexOf(bot)%2)?'B':'A'),point=bombSitesFor(m.attackTeam)[site];return Math.hypot(bot.position.x-point[0],bot.position.z-point[2])<3&&((m.plantedSite&&bot.userData.team!==m.attackTeam)||(!m.plantedSite&&m.carrier===(bot.userData.networkId||bot.uuid)))}
function bombBotGoal(bot){if(!bombState)return bot.position.clone();const m=bombState,sites=bombSitesFor(m.attackTeam);if(m.plantedSite)return new THREE.Vector3(...sites[m.plantedSite]);if(bot.userData.team===m.attackTeam){const site=bots.indexOf(bot)%2?'B':'A';return new THREE.Vector3(...sites[site])}const site=bots.indexOf(bot)%2?'B':'A',point=sites[site];return new THREE.Vector3(point[0]+(bots.indexOf(bot)%3-1)*3,0,point[2]+(bots.indexOf(bot)%4-1.5)*3)}
function bombCombatTarget(bot,now){return objectiveCombatTarget(bot,now)}
function resetBombRoundLocal(now){resetCovers();clearWounds();bonusGuard=0;markUntil=adsBoostUntil=hipBoostUntil=0;matchFinished=false;$('bombResult').hidden=true;resetDuelFighter();for(const b of bots){b.userData.hp=100;b.userData.deathCounted=false;b.userData.wounds=Object.create(null);b.userData.target=null;b.userData.rethink=0;b.userData.flankGoal=b.userData.flankEntry=null;b.userData.aimedAtSince=0;b.userData.moveSlideUntil=0;b.visible=true;b.userData.moveVelocity.set(0,0,0);const p=randomSpawn(undefined,b.userData.team);b.position.set(p.x,0,p.z)}startBombRound(bombState,bombFighters(),now);bombLastUpdate=now;syncNow()}
function bombWatchChoices(){if(!isBombMode()||hp>0)return;const options=[];for(const [id,r] of remotes)if(r.mesh.visible)options.push({id,name:r.mesh.userData.name});for(const b of bots)if(b.visible)options.push({id:b.userData.networkId||b.uuid,name:b.userData.name});if(!options.some(o=>o.id===bombWatchId))bombWatchId=options[0]?.id||'';const select=$('bombWatch'),markup=options.map(o=>`<option value="${o.id}">${o.name}</option>`).join('');if(select.innerHTML!==markup)select.innerHTML=markup;select.value=bombWatchId;$('bombWatchField').hidden=false}
$('bombWatch').onchange=e=>{bombWatchId=e.target.value};
function updateBombSpectatorCamera(dt){if(!isBombMode()||hp>0||bombState?.phase!=='running')return;bombWatchChoices();const target=remotes.get(bombWatchId)?.mesh||bots.find(b=>(b.userData.networkId||b.uuid)===bombWatchId);if(!target?.visible)return;const desired=spectatorViewPosition(target.position,target.rotation.y);if(camera.position.distanceToSquared(desired)>400)camera.position.copy(desired);else camera.position.lerp(desired,1-Math.exp(-dt*6));camera.lookAt(target.position.x,target.position.y+1.2,target.position.z);yaw=camera.rotation.y;pitch=camera.rotation.x}
function handleBombMessage(d){if(!isBombMode())return;if(d.type==='bombWelcome'){syncRoomMap(d.map);playerTeam=d.team;bombHost=d.host;updatePlayerIdentity();setText('netText','爆破房间已连接');$('netDot').style.background='#6fffc5';reconnectAttempts=0;if(!$('bombLoadout').hidden&&!bombLoadoutConfirmed){$('bombReady').disabled=false;setText('bombLoadoutStatus','胜利 +1200 · 失败 +800 · 上限 5000')}return}if(d.type==='bombBuyError'){bombLoadoutConfirmed=false;$('bombReady').disabled=false;setText('bombLoadoutStatus',d.message||'购买失败');return}if(d.type==='full'){allowReconnect=false;alert(d.message||'房间已满');return}if(d.type==='coverSnapshot'){applyCoverSnapshot(d.covers);return}if(d.type==='coverState'){if(d.round===bombState?.round)applyCoverState(d.coverId,d.hp);return}if(d.type==='bomb'){
  if(d.phase==='running'&&bombState?.phase==='finished'){matchFinished=false;$('bombContinue').disabled=false;}
  const old=bombState;bombState=d;bombClockOffset=d.serverNow-Date.now();bombHost=d.host;const me=d.players.find(p=>p.id===playerId);if(me){playerTeam=me.team;bombCredits=me.credits??BOMB_START_CREDITS;bombPurchasedWeapon=me.boughtWeapon||null;if(me.hp<=0&&hp>0)hp=0;updatePlayerIdentity();}if(d.phase==='waiting'){if(old?.phase==='finished'||old?.phase==='intermission'){bombLoadoutConfirmed=false;$('bombResult').hidden=true;matchFinished=false;showBombLoadout()}if(me?.ready){bombLoadoutConfirmed=true;$('bombReady').disabled=true}else if($('bombLoadout').hidden)showBombLoadout();if(!$('bombLoadout').hidden){const ready=d.players.filter(p=>p.ready).length;setText('bombCredits',`相位点 ${bombCredits}`);setText('bombLoadoutStatus',bombLoadoutConfirmed?`已确认 · ${ready}/${BOMB_PRESETS[d.preset]?.humans||1} 人准备`:`购买并确认 · ${ready}/${BOMB_PRESETS[d.preset]?.humans||1} 人准备`)}}else if(d.phase==='running'||d.phase==='intermission')$('bombLoadout').hidden=true;if(playerId===bombHost&&bots.length===0)setupBombBots(BOMB_PRESETS[d.preset]||BOMB_PRESETS.solo,d.bots);if(playerId!==bombHost){for(const b of d.bots)updateBombRemoteBot(b);}else for(const b of d.bots){const local=bots.find(bot=>bot.userData.networkId===b.id);if(local){local.userData.hp=b.hp;local.visible=b.hp>0;}}
  const liveIds=new Set([...d.players.filter(p=>p.connected&&p.id!==playerId).map(p=>p.id),...(playerId===bombHost?[]:d.bots.map(b=>b.id))]);for(const [id,r] of remotes)if(!liveIds.has(id)){disposeObject(r.mesh);remotes.delete(id)}for(const p of d.players)if(p.id!==playerId&&p.connected){const r=addRemote(p.id,p.name,p.team);r.hp=p.hp;r.target.set(p.position[0],Math.max(0,p.position[1]-((p.prone||p.slide)?.48:1.7)),p.position[2]);if(!r.networkReady||r.mesh.position.distanceToSquared(r.target)>144)r.mesh.position.copy(r.target);r.networkReady=true;r.mesh.rotation.y=p.rotation;setActorProne(r.mesh,p.prone);setActorSlide(r.mesh,!!p.slide);applyRemoteSkin(r,p.skin,p.knifeSkin,p.weapon);r.mesh.visible=p.hp>0;}
  if(d.phase==='prep'&&(!old||old.round!==d.round)){resetCovers();clearWounds();bonusGuard=0;markUntil=adsBoostUntil=hipBoostUntil=0;applyBombRoundWeapon();resetDuelFighter();const player=d.players.find(p=>p.id===playerId);if(player){camera.position.set(...player.position);hp=player.hp}for(const b of bots){b.userData.hp=100;b.userData.deathCounted=false;b.visible=true;b.userData.target=null;b.userData.rethink=0;const record=d.bots.find(item=>item.id===b.userData.networkId);if(record)b.position.set(...record.position)}$('respawn').hidden=true;$('bombResult').hidden=true;syncNow()}
  if(d.phase==='prep')$('bombLoadout').hidden=true;
  if(d.phase==='finished'&&$('bombResult').hidden){matchFinished=true;firing=false;if(document.pointerLockElement===canvas)document.exitPointerLock();$('bombResult').hidden=false;setText('bombWinner',d.scores[0]===d.scores[1]?'平局':`${d.scores[0]>d.scores[1]?'蓝':'红'}队获胜`);setText('bombFinal',`12 回合总比分 ${d.scores[0]} : ${d.scores[1]}`)}if(d.revision!==bombSeenRevision){bombSeenRevision=d.revision;if(d.event)feed(d.event)}updateHud();return}
  if(d.round!==bombState?.round&&['state','shot','bombKill','bombBotState','bombBotHit','muzzle','rocket','blast','throwable','throwableBurst'].includes(d.type))return;
  if(d.type==='bombBotState'){if(playerId!==bombHost)for(const b of d.bots)updateBombRemoteBot(b);return}if(d.type==='bombBotHit'){const b=bots.find(bot=>bot.userData.networkId===d.botId);if(b)b.userData.hp=d.hp;const r=remotes.get(d.botId);if(r)r.hp=d.hp;return}if(d.type==='bombKill'){if(!seenKills.has(d.id)){seenKills.add(d.id);feed(`${d.killer} 击倒 ${d.victim}`);if(d.killerId===playerId)showKillToast(d.victim,!!d.knife)}const r=remotes.get(d.victimId);if(r)r.mesh.visible=false;const b=bots.find(bot=>bot.userData.networkId===d.victimId);if(b){b.visible=false;b.userData.hp=0;b.userData.deathCounted=true}if(d.victimId===playerId){hp=0;$('respawn').hidden=true;bombWatchChoices()}return}
  if(d.type==='state'){if(d.id===playerId)return;const r=addRemote(d.id,d.name,d.team);r.hp=d.hp;r.target.set(d.position[0],Math.max(0,d.position[1]-((d.prone||d.slide)?.48:1.7)),d.position[2]);r.mesh.rotation.y=d.rotation||0;setActorProne(r.mesh,d.prone);setActorSlide(r.mesh,!!d.slide);applyRemoteSkin(r,d.skin,d.knifeSkin,d.weapon);r.mesh.visible=d.hp>0;return}
  if(d.type==='muzzle'){showRemoteMuzzleFlash(d.id,!!d.hidden);return}if(d.type==='shot'){showShotBlood(d);if(d.target===playerId&&d.team!==playerTeam)damage(Math.max(0,Math.min(200,Number(d.damage)||0)),d.id,d.zone||'body',d.shotId);return}if(d.type==='rocket'){spawnRemoteRocket(d);return}if(d.type==='blast'){showRemoteBlast(d);return}if(d.type==='throwable'){spawnRemoteThrowable(d);return}if(d.type==='throwableBurst'){showRemoteThrowableBurst(d);return}if(d.type==='leave'){const r=remotes.get(d.id);if(r){disposeObject(r.mesh);remotes.delete(d.id)}return}}
function updateBombRemoteBot(b){const r=addRemote(b.id,b.name,b.team),now=performance.now(),previous=r.target.clone(),elapsed=Math.max(.05,(now-(r.lastBotMotionAt||now))/1000);r.hp=b.hp;r.target.set(b.position[0],b.position[1],b.position[2]);if(!r.networkReady||r.mesh.position.distanceToSquared(r.target)>144)r.mesh.position.copy(r.target);r.networkReady=true;r.mesh.rotation.y=b.rotation||0;setActorProne(r.mesh,b.prone);setActorSlide(r.mesh,!!b.slide);const speed=previous.distanceTo(r.target)/elapsed;if(b.hp>0)animateBotStride(r.mesh,Math.min(elapsed,.2),speed,speed>6.5);r.lastBotMotionAt=now;applyRemoteSkin(r,'','',b.weapon);r.mesh.visible=b.hp>0}
function updateBombMode(dt){if(!playing||!isBombMode()||!bombState)return;const m=bombState,now=Date.now()+bombClockOffset;if(!online&&m.phase==='running'&&!paused&&Date.now()-bombLastUpdate>=100){const fighters=bombFighters();if(!m.hold){for(const fighter of fighters)if(fighter.interacting)for(const site of ['A','B'])if(beginBombHold(m,fighter,site,Date.now()))break}tickBombMatch(m,fighters,Date.now());bombLastUpdate=Date.now()}if(!online&&(m.phase==='intermission'||m.phase==='finished')&&m.round>bombAwardedRound){bombAwardedRound=m.round;bombCredits=awardBombCredits(bombCredits,m.winner===playerTeam)}if(!online&&m.phase==='intermission'&&Date.now()>=m.nextAt){m.phase='waiting';m.event=`第 ${m.round+1}/12 回合购买阶段`;m.revision++;bombLoadoutConfirmed=false;bombPurchasedWeapon=null;showBombLoadout()}if(!online&&m.phase==='finished'&&$('bombResult').hidden){matchFinished=true;firing=false;if(document.pointerLockElement===canvas)document.exitPointerLock();$('bombResult').hidden=false;setText('bombWinner',m.scores[0]===m.scores[1]?'平局':`${m.scores[0]>m.scores[1]?'蓝':'红'}队获胜`);setText('bombFinal',`12 回合总比分 ${m.scores[0]} : ${m.scores[1]}`)}
  setText('bombWallet',`相位点 ${bombCredits}`);if(m.revision!==bombSeenRevision){bombSeenRevision=m.revision;if(m.event)feed(m.event)}score=m.scores[0];redScore=m.scores[1];setText('blueScore',score);setText('redScore',redScore);setText('bombRound',`${Math.max(1,m.round)}/12`);setText('bombScore',`攻 ${m.scores[m.attackTeam]} : ${m.scores[1-m.attackTeam]} 守`);const seconds=Math.max(0,Math.ceil((m.endsAt-now)/1000));setText('bombTimer',m.phase==='waiting'?'购买阶段':m.phase==='intermission'?`下回合 ${Math.ceil((m.nextAt-now)/1000)}s`:`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`);setText('bombStatus',m.phase==='running'?(m.plantedSite?`核心已安放 ${m.plantedSite} 点 · ${m.attackTeam===playerTeam?'守住':'拆除'}`:m.attackTeam===playerTeam?'攻方 · 安放相位核心':'守方 · 守住 A / B 点'):m.phase==='waiting'?`等待 ${BOMB_PRESETS[m.preset||'solo']?.humans||1} 位玩家购买并准备`:m.event);const site=m.plantedSite||'A',point=bombSitesFor(m.attackTeam)[site],dist=Math.round(Math.hypot(camera.position.x-point[0],camera.position.z-point[2]));setText('bombHint',m.hold?`${m.hold.kind==='plant'?'安放':'拆除'}中 ${Math.min(100,Math.round((now-m.hold.since)/50))}% · 保持按住 ${keyLabel('interact')}`:m.carrier===playerId?`你携带相位核心 · 靠近 A/B 点按住 ${keyLabel('interact')} 5 秒`:m.plantedSite?`距 ${site} 点 ${dist}m · 守方按住 ${keyLabel('interact')} 5 秒拆除`:`A / B 包点已标记 · ${m.attackTeam===playerTeam?'护送核心':'阻止安放'}`);if(hp<=0)bombWatchChoices();else $('bombWatchField').hidden=true;if(online&&playerId===bombHost&&m.phase==='running'&&performance.now()-bombLastBotSync>150){bombLastBotSync=performance.now();sendNetwork({type:'botState',bots:bots.map(b=>({id:b.userData.networkId,position:b.position.toArray(),rotation:b.rotation.y,prone:!!b.userData.prone,slide:!!b.userData.slide,weapon:b.userData.weapon,interacting:bombBotInteracting(b)}))})}}
$('soloBomb').onclick=()=>start(false,'bomb');
const updateBombModeRulesBase=updateBombMode;
updateBombMode=function(dt){if(playing&&isBombMode()&&!online&&!paused&&bombState?.phase==='prep')tickBombMatch(bombState,bombFighters(),Date.now());updateBombModeRulesBase(dt)};
const initBombModeBase=initBombMode;
initBombMode=function(){initBombModeBase();for(const [site,point] of Object.entries(BOMB_SITES)){const marker=document.createElement('canvas');marker.width=marker.height=128;const ctx=marker.getContext('2d');ctx.fillStyle=site==='A'?'#ff846f':'#839cff';ctx.beginPath();ctx.arc(64,64,55,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e7faff';ctx.lineWidth=8;ctx.stroke();ctx.fillStyle='#071522';ctx.font='bold 76px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(site,64,68);const texture=new THREE.CanvasTexture(marker),sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:true}));sprite.position.set(point[0],4.4,point[2]);sprite.scale.set(2.5,2.5,1);scene.add(sprite);bombSitesVisual.push(sprite)}const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.42,1),new THREE.MeshBasicMaterial({color:0xffd376}));core.visible=false;scene.add(core);bombSitesVisual.push(core);bombCoreVisual=core};
let bombCoreVisual=null;
const setupBombBotsBase=setupBombBots;
setupBombBots=function(config,records){if(records)for(const record of records){const remote=remotes.get(record.id);if(remote){disposeObject(remote.mesh);remotes.delete(record.id)}}setupBombBotsBase(config,records);for(const bot of bots)bot.userData.ammoLeft=WEAPONS[bot.userData.weapon]?.mag||30};
const updateBombModeVisualBase=updateBombMode;
updateBombMode=function(dt){updateBombModeVisualBase(dt);if(!isBombMode()||!bombState||!bombCoreVisual)return;const m=bombState,sites=bombSitesFor(m.attackTeam);for(let i=0;i<6;i++){const marker=bombSitesVisual[i];if(marker)marker.position.z=sites[i<4?(i<2?'A':'B'):(i===4?'A':'B')][2]}let point=null;if(m.plantedSite){point=sites[m.plantedSite];bombCoreVisual.scale.setScalar(1.3)}else if(m.carrier===playerId){point=camera.position;bombCoreVisual.scale.setScalar(.45)}else{const bot=bots.find(b=>b.userData.networkId===m.carrier),remote=remotes.get(m.carrier);point=bot?.position||remote?.mesh.position;bombCoreVisual.scale.setScalar(1)}bombCoreVisual.visible=m.phase==='running'&&!!point;if(point){bombCoreVisual.position.set(point.x??point[0],(point.y??point[1])+1.7,point.z??point[2]);bombCoreVisual.rotation.y+=dt*1.2}};
const updateBombModeBase=updateBombMode;
updateBombMode=function(dt){if(isBombMode()&&!online&&paused&&bombState){const delta=dt*1000;bombState.endsAt+=delta;bombState.nextAt+=delta;if(bombState.hold)bombState.hold.since+=delta;return}updateBombModeBase(dt)};
let bombStageKey='',bombBannerTimeout=0;
function playBombCue(kind){try{prepareShotAudio();if(!audioContext||!audioCompressor||audioContext.state==='suspended')return;const notes=kind==='plant'?[660,880,660]:kind==='round'?[520,390,290]:kind==='start'?[490,740]:kind==='prep'?[410,520]:[760],now=audioContext.currentTime;for(let i=0;i<notes.length;i++){const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),at=now+i*(kind==='tick'?.04:.11);oscillator.type=kind==='tick'?'sine':'triangle';oscillator.frequency.setValueAtTime(notes[i],at);gain.gain.setValueAtTime(.001,at);gain.gain.linearRampToValueAtTime(kind==='tick'?.11:.16,at+.012);gain.gain.exponentialRampToValueAtTime(.001,at+(kind==='tick'?.09:.17));oscillator.connect(gain).connect(audioCompressor);oscillator.start(at);oscillator.stop(at+(kind==='tick'?.1:.18));oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()}}}catch{}}
function updateBombPresentation(){const active=playing&&isBombMode()&&!!bombState,prep=$('bombPrep'),banner=$('bombRoundBanner');if(!active){prep.hidden=true;banner.hidden=true;return}const m=bombState,now=Date.now()+bombClockOffset,seconds=Math.max(0,Math.ceil((m.endsAt-now)/1000)),sites=bombSitesFor(m.attackTeam),a=Math.round(Math.hypot(camera.position.x-sites.A[0],camera.position.z-sites.A[2])),b=Math.round(Math.hypot(camera.position.x-sites.B[0],camera.position.z-sites.B[2]));prep.hidden=m.phase!=='prep';if(!prep.hidden){setText('bombPrepTitle',playerTeam===m.attackTeam?'攻方准备突入':'守方布防');setText('bombPrepSeconds',seconds);setText('bombPrepNote',playerTeam===m.attackTeam?'倒计时结束后可行动':'先占据 A / B 点附近的掩体')}setText('bombRoutes',m.plantedSite?`${m.plantedSite} 点已安放 · ${seconds} 秒后爆炸`:m.phase==='prep'||m.phase==='running'?`中央主路 · A 左翼 ${a}m · B 右翼 ${b}m`:'');$('bombPanel').dataset.planted=String(m.phase==='running'&&!!m.plantedSite);if(m.phase==='prep')setText('bombStatus',playerTeam===m.attackTeam?'攻方等待突入':'守方可提前布防');if(m.phase==='prep')setText('bombHint',playerTeam===m.attackTeam?'观察路线，倒计时结束后突入':'趁现在前往包点，选择掩体架枪');const stage=`${m.round}:${m.phase}:${m.plantedSite||''}`;if(stage!==bombStageKey){bombStageKey=stage;bombCueSecond=-1;if(m.phase==='prep')playBombCue('prep');else if(m.phase==='running')playBombCue(m.plantedSite?'plant':'start');else if(m.phase==='intermission'||m.phase==='finished'){playBombCue('round');banner.dataset.win=String(m.winner===playerTeam);setText('bombRoundOutcome',m.winner===playerTeam?'本回合胜利':'本回合失利');setText('bombRoundReason',`${m.event} · ${m.scores[0]} : ${m.scores[1]}`);banner.hidden=false;clearTimeout(bombBannerTimeout);bombBannerTimeout=setTimeout(()=>{banner.hidden=true},2800)}}if(m.phase==='running'&&m.plantedSite&&seconds>0&&(seconds<=10||seconds%4===0)&&seconds!==bombCueSecond){bombCueSecond=seconds;playBombCue('tick')}}
const updateBombModePacingBase=updateBombMode;
updateBombMode=function(dt){updateBombModePacingBase(dt);updateBombPresentation()};
const initBombModePacingBase=initBombMode;
initBombMode=function(){bombStageKey='';bombCueSecond=-1;$('bombPrep').hidden=true;$('bombRoundBanner').hidden=true;initBombModePacingBase()};
$('bombReady').addEventListener('click',prepareShotAudio);
for(const [id,action] of [['createBomb','create'],['joinBomb','join']])$(id).onclick=()=>{pendingRoomMode='bomb';openRoomDialog(action);$('roomMapField').hidden=true;$('bombPresetField').hidden=action!=='create';setText('roomDialogTitle',action==='create'?'创建相位爆破房':'加入相位爆破房');setText('roomDialogHelp',action==='create'?'选择人数方案；每回合购买并全员确认后开战。':'输入房主的六位房间号；到齐后各自购买武器并准备。')};
$('bombContinue').onclick=()=>{if(online){sendNetwork({type:'restart'});$('bombContinue').disabled=true;setText('bombFinal','正在准备下一局购买阶段，保持当前队伍')}else{bombState=createBombMatch(Date.now());bombCredits=BOMB_START_CREDITS;bombAwardedRound=0;bombPurchasedWeapon=null;bombLoadoutConfirmed=false;$('bombResult').hidden=true;matchFinished=false;showBombLoadout()}};
$('bombExit').onclick=()=>endMatch();
const endMatchBase=endMatch;
endMatch=function(){const previousBomb=isBombMode();if(previousBomb){sendNetwork({type:'leave'});clearBombMode()}endMatchBase();if(previousBomb&&normalBombLoadout){weaponSlots=normalBombLoadout.slots;sidearmKey=normalBombLoadout.sidearm;normalBombLoadout=null;activeWeaponSlot=0;resetWeaponRuntime();selectWeapon(weaponSlots[0],{equip:false});syncMenuWeaponSelectors();refreshEquipment();renderKeyHints()}};
setInterval(()=>{if(playing&&isBombMode()&&online)sendNetwork({type:'ping'})},5000);
const respawnBase=respawn;
respawn=function(){if(isBombMode()){$('respawn').hidden=true;bombWatchChoices();if(document.pointerLockElement===canvas)document.exitPointerLock();return}respawnBase()};
const awardKillBase=awardKill;
awardKill=function(team,killer,victim){if(isBombMode()){feed(`${killer} 击倒 ${victim}`);if(killer===$('name').value)showKillToast(victim,weaponKey==='knife');return}awardKillBase(team,killer,victim)};
const botDownBase=botDown;
botDown=function(bot,killer=$('name').value,killerId=playerId,knife=weaponKey==='knife'&&killerId===playerId){if(isBombMode()){if(bot.userData.deathCounted)return;bot.userData.deathCounted=true;bot.userData.hp=0;bot.visible=false;if(online)sendNetwork({type:'botDown',botId:bot.userData.networkId,killerId,killer});else awardKill(1-bot.userData.team,killer,bot.userData.name);return}botDownBase(bot,killer,killerId,knife)};
const damageBase=damage;
damage=function(n,source='AI',zone='body',shotId=null){if(isBombMode()&&bombState?.phase!=='running')return;if(isBombMode()&&online&&!shotId&&playerId===bombHost){const bot=bots.find(b=>b.visible&&b.userData.name===source);if(bot){sendNetwork({type:'botShot',botId:bot.userData.networkId,target:playerId,damage:n,zone});return}}damageBase(n,source,zone,shotId)};

let capturingBinding=null,grenadeArc=null,grenadeArcRibbon=null,grenadeArcEnd=null;
function renderKeybindGrid(){const grid=$("keybindGrid");grid.replaceChildren();for(const [group,actions] of Object.entries(BINDING_GROUPS)){const title=document.createElement("h3");title.textContent=group;grid.appendChild(title);for(const [action,label] of Object.entries(actions)){const row=document.createElement("div"),name=document.createElement("span"),button=document.createElement("button");row.className="keybindRow";name.textContent=label;button.type="button";button.textContent=capturingBinding===action?"按下新键…":keyLabel(action);button.classList.toggle("capturing",capturingBinding===action);button.onclick=()=>{capturingBinding=action;setText("keybindStatus",`正在设置「${label}」；按 Esc 取消`);renderKeybindGrid()};row.append(name,button);grid.appendChild(row)}}}
function renderKeyHints(){const label=keyLabel;setText("slot1MenuHint",`按 ${label("weapon1")} 唤出`);setText("slot2MenuHint",`按 ${label("weapon2")} 唤出`);setText("knifeMenuHint",sidearmKey?`按 ${label("sidearm")} 手枪 · ${label("knife")} 刀`:`按 ${label("sidearm")} 切换相位刃 K0（${label("knife")} 无效）`);setText("ctfMenuHint",`带回敌旗得分 · 先到 3 分或 10 分钟结算 · 按住 ${label("interact")} 拿旗 / 归还`);setText("riftKeyHint",MOBILE_ENABLED?"星际相位":`星隙相位 · ${label("phase")}`);setText("equipmentKeyHint",`两把主武器与副武器会保存在本机；按 ${label("weapon1")}/${label("weapon2")} 主武器，${label("sidearm")} ${sidearmKey?"手枪":"刀"}${sidearmKey?`，${label("knife")} 刀`:""}。`);setText("menuControlTip",`${label("forward")}/${label("left")}/${label("back")}/${label("right")} 移动 · 右键 / ${label("aim")} 开镜 · 左键开火 · ${label("phase")} 相位突进`);setText("hudControls",`${label("forward")}/${label("left")}/${label("back")}/${label("right")} 移动 · ${label("weapon1")}/${label("weapon2")} 枪械 · ${label("sidearm")} ${sidearmKey?"手枪":"刀"}${sidearmKey?` · ${label("knife")} 刀`:""} · ${label("jump")} 跳跃/飞行 · ${label("slide")} 滑铲 · ${label("prone")} 趴下 · 右键/${label("aim")} 开镜 · 左键攻击 · ${label("reload")} 换弹 · ${label("phase")} 相位 · ${label("tactical")} 道具 · ${label("throwable")} 投掷物 · ${label("supply")} 补给 · ${label("inspect")} 检视 · ${label("detonate")} 遥控引爆 · ${label("zoom")} 切倍率 · Esc 暂停`);document.querySelector("#adsOverlay .optic").dataset.zoomHint=`${label("zoom")} 切倍率`;lastSlotMarkup="";updateHud();updateThrowableHud();if(!$('gunmasterUpgrade').hidden)updateGunmasterCredits();if(!$("armory").hidden)renderArmory();if(!$("equipment").hidden)renderEquipment()}
function closeKeybindSettings(){$("keybindSettings").hidden=true;capturingBinding=null;setText("keybindStatus","按键设置自动保存在本机。");renderKeybindGrid()}
function openKeybindSettings(){if(MOBILE_ENABLED){mobileControls?.openEditor();return}if(document.pointerLockElement===canvas)document.exitPointerLock();$("keybindSettings").hidden=false;capturingBinding=null;renderKeybindGrid()}
$("lookSensitivity").oninput=event=>setLookSensitivity(event.target.value);setLookSensitivity(lookSensitivity);$("openKeybinds").onclick=openKeybindSettings;$("pauseKeybinds").onclick=openKeybindSettings;$("closeKeybinds").onclick=closeKeybindSettings;
$("resetKeybinds").onclick=()=>{keyBindings={...DEFAULT_BINDINGS};try{localStorage.setItem(BINDING_STORAGE_KEY,JSON.stringify(keyBindings))}catch{}for(const code of Object.keys(rawKeys))rawKeys[code]=false;adsKey=false;capturingBinding=null;renderKeybindGrid();renderKeyHints();setText("keybindStatus","已恢复默认键位")};
document.addEventListener("keydown",e=>{if($( "keybindSettings").hidden)return;if(!capturingBinding&&e.code!=="Escape"&&e.target.closest?.("input"))return;e.preventDefault();e.stopImmediatePropagation();if(e.code==="Escape"){if(capturingBinding){capturingBinding=null;renderKeybindGrid();setText("keybindStatus","已取消录入")}else closeKeybindSettings();return}if(!capturingBinding||e.repeat)return;if(!validBindingCode(e.code)){setText("keybindStatus","这个键不能绑定，请按字母、数字、方向键或常用功能键");return}const oldCode=keyBindings[capturingBinding],other=Object.keys(keyBindings).find(action=>action!==capturingBinding&&keyBindings[action]===e.code);keyBindings[capturingBinding]=e.code;if(other)keyBindings[other]=oldCode;try{localStorage.setItem(BINDING_STORAGE_KEY,JSON.stringify(keyBindings))}catch{}for(const code of Object.keys(rawKeys))rawKeys[code]=false;adsKey=false;setText("keybindStatus",other?`已与「${Object.values(BINDING_GROUPS).map(group=>group[other]).find(Boolean)}」交换键位`:`已设置为 ${keyLabel(capturingBinding)}`);capturingBinding=null;renderKeybindGrid();renderKeyHints()},true);
renderKeyHints();
document.addEventListener('keydown',e=>{if(playing&&isBombMode()&&!$('bombLoadout').hidden&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation()}},true);
document.addEventListener("keydown",e=>{if(document.querySelector(".gameGuide[open]"))return;if($("trainingSettings").open){if(e.code==="Escape"){e.preventDefault();closeTrainingSettings()}return}if(e.code==="Escape"&&playing&&!e.repeat){if(!$('supplyPicker').hidden){$('supplyPicker').hidden=true;if(!paused)requestGamePointerLock();return}if(!$('gunmasterUpgrade').hidden){$('gunmasterUpgrade').hidden=true;if(!paused)requestGamePointerLock();return}togglePause();return}if(!playing||paused||duelBlocked()||!$("keybindSettings").hidden||!$('gunmasterUpgrade').hidden||!$('supplyPicker').hidden||(e.target.closest?.("input,select,textarea")&&document.pointerLockElement!==canvas))return;const action=Object.keys(keyBindings).find(key=>keyBindings[key]===e.code);if(!action)return;e.preventDefault();rawKeys[e.code]=true;if(e.repeat)return;if(action==="interact"&&trainingMode){openTrainingSettings();return}if(action==="weapon1")switchWeaponSlot(0);if(action==="weapon2")switchWeaponSlot(1);if(action==="sidearm")switchWeaponSlot(2);if(action==="knife"&&sidearmKey)switchWeaponSlot(3);if(action==="slide")startSlide();if(action==="jump"&&slideStartedAt&&hp>0)stopSlide(true);else if(action==="jump"&&grounded&&hp>0&&!prone){verticalVelocity=woundActive("leg")?6.1:8.2;grounded=false}if(action==="prone"&&!slideStartedAt)toggleProne();if(action==="aim"&&weaponKey!=="knife"&&!grenadeReady)adsKey=true;if(action==="reload"&&weaponKey!=="knife")reload();if(action==="phase")usePhase();if(action==="phaseFlash")usePhaseFlash();if(action==="tactical")useTactical();if(action==="throwable")primeOrThrowCurrent();if(action==="supply")openSupplyPicker();if(action==="detonate")remoteDetonate();if(action==="zoom"&&weaponDef.dualZoom){zoomMode=1-zoomMode;weaponDef.zoom*=zoomMode?2.2:1/2.2;feed(`瞄具倍率：${zoomMode?"高倍":"低倍"}`)}});
document.addEventListener("keyup",e=>{rawKeys[e.code]=false;if(e.code===keyBindings.aim)adsKey=false});
window.addEventListener("blur",()=>{for(const key of Object.keys(keys))keys[key]=false;firing=false;adsKey=adsMouse=false});
document.addEventListener("mousemove",e=>{if(document.pointerLockElement===canvas&&playing&&!paused&&!duelBlocked()){const zoom=Math.max(1,weaponDef.zoom||1),sensitivity=THREE.MathUtils.lerp(1,1/zoom,adsBlend),step=.0022*sensitivity*lookSensitivity;const oldYaw=yaw;yaw-=e.movementX*step;if(prone&&blockedForPlayer(camera.position.x,camera.position.z,true,yaw))yaw=oldYaw;pitch=Math.max(roomMode==='survival'?-1.565:-1.35,Math.min(1.35,pitch-e.movementY*step))}});
document.addEventListener("mousedown",e=>{if(MOBILE_ENABLED)return;if(!$('bombLoadout').hidden||!$('supplyPicker').hidden||!$('gunmasterUpgrade').hidden||duelBlocked()||roomMode==='survival'&&e.target.closest?.('#survivalPanel')||isArenaMode()&&e.target.closest?.("#duelPanel"))return;if(e.button===2&&playing&&!paused&&weaponKey!=="knife"&&!grenadeReady){adsMouse=true;e.preventDefault()}if(e.button===0&&playing&&!paused){if(document.pointerLockElement!==canvas)requestGamePointerLock();else if(grenadeReady){beginGrenadeCook();e.preventDefault()}else{firing=true;shoot()}}});
document.addEventListener("mouseup",e=>{if(MOBILE_ENABLED)return;if(e.button===0){firing=false;if(grenadeCookStarted)releaseCookedGrenade(paused||hp<=0)}if(e.button===2)adsMouse=false});
document.addEventListener("contextmenu",e=>{if(playing)e.preventDefault()});
document.addEventListener("pointerlockchange",()=>{if(document.pointerLockElement!==canvas){firing=false;adsMouse=false}});
function togglePause(force){if(!playing||matchFinished)return;paused=force??!paused;if(online&&roomMode==='survival'&&survivalSolo)sendNetwork({type:'survivalPause',paused});$("pauseScreen").hidden=!paused;firing=false;adsMouse=adsKey=false;for(const key of Object.keys(keys))keys[key]=false;if(isObjectiveMode())syncNow();if(paused){if(document.pointerLockElement===canvas)document.exitPointerLock()}else{requestGamePointerLock();syncNow()}}
function endMatch(){if(roomMode==="extraction"){extractionClient?.abandon();restoreExtractionLoadout()}if(weeklyRun){const run=weeklyRun,account=accountSession();if(run.status==='running'&&account)void weeklyWork.then(()=>accountApi('tournaments/weeklyStop',{...account,eventId:run.event,runId:run.id})).catch(()=>{});weeklyRun=null;weeklyConditions=null;weeklyPending=false;if(weeklyBackup){weaponSlots=weeklyBackup.slots;sidearmKey=weeklyBackup.sidearm;equipmentLoadout=weeklyBackup.gear;builds=weeklyBackup.builds;weeklyBackup=null;equipmentMove=EQUIPMENT.护甲[equipmentLoadout.护甲][2].speed*EQUIPMENT.头盔[equipmentLoadout.头盔][2].speed;$('helmetVision').className=`helmetVision helmet-${equipmentLoadout.头盔}`;activeWeaponSlot=0;resetWeaponRuntime();selectWeapon(weaponSlots[0],{equip:false});syncMenuWeaponSelectors()}$('aiDuelRetry').textContent='再来一局'}towerSurvival.stop();sessionSeq++;clearMatchRecovery();$('resumePreviousMatch').hidden=true;if(online)sendNetwork({type:"leave"});playing=false;paused=false;firing=false;adsMouse=adsKey=false;clearTimeout(survivalPending);survivalPending=null;clearInterval(respawnTimer);respawnTimer=null;$("respawn").hidden=true;$("pauseScreen").hidden=true;$("hud").hidden=true;$("menu").classList.add("active");$('gunmasterUpgrade').hidden=true;$('survivalResult').hidden=true;$('survivalPanel').hidden=true;$('aiDuelPanel').hidden=true;$('aiDuelResult').hidden=true;if(document.pointerLockElement===canvas)document.exitPointerLock();clearActors();clearObjectiveMode();resetSupplyClient();online=false;if(roomMode==='gunmaster'&&normalGunmasterLoadout){builds=normalGunmasterLoadout.builds;weaponSlots=normalGunmasterLoadout.slots;normalGunmasterLoadout=null;activeWeaponSlot=0;resetWeaponRuntime();selectWeapon(weaponSlots[0],{equip:false});syncMenuWeaponSelectors()}if(roomMode==='challenge'&&normalChallengeLoadout){weaponSlots=normalChallengeLoadout;normalChallengeLoadout=null;activeWeaponSlot=0;resetWeaponRuntime();selectWeapon(weaponSlots[0],{equip:false});syncMenuWeaponSelectors()}roomMode="normal";survivalSolo=false;resetDuelClient();activeRoomCode="";hp=100;score=redScore=0;$("blueScore").textContent="0";$("redScore").textContent="0";camera.fov=76;camera.updateProjectionMatrix();for(const key of Object.keys(keys))keys[key]=false;updateHud()}
$("resumeMatch").onclick=()=>togglePause(false);
$("exitMatch").onclick=endMatch;
$("supplyCancel").onclick=()=>{$("supplyPicker").hidden=true;if(playing&&!paused)requestGamePointerLock()};
canvas.addEventListener("click",()=>{if(playing&&!duelBlocked()&&document.pointerLockElement!==canvas)requestGamePointerLock()});

function usePhase(){if(roomMode==='survival')return;if(phase<100||phaseActive>0||hp<=0)return;phase=0;phaseActive=.75;const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw)),dir=new THREE.Vector3();if(keys.KeyW)dir.add(forward);if(keys.KeyS)dir.sub(forward);if(keys.KeyD)dir.add(right);if(keys.KeyA)dir.sub(right);if(dir.lengthSq()<.001)dir.copy(forward);dir.normalize();const startX=camera.position.x,startZ=camera.position.z;for(let distance=.5;distance<=8;distance+=.5){const nextX=startX+dir.x*distance,nextZ=startZ+dir.z*distance;if(blockedForPlayer(nextX,nextZ))break;camera.position.x=nextX;camera.position.z=nextZ}camera.position.x=THREE.MathUtils.clamp(camera.position.x,roomMode==='extraction'?-EXTRACTION_LIMIT:isBombMode()?-208:-52,roomMode==='extraction'?EXTRACTION_LIMIT:isBombMode()?208:52);camera.position.z=THREE.MathUtils.clamp(camera.position.z,roomMode==='extraction'?-EXTRACTION_LIMIT:isBombMode()?-208:-52,roomMode==='extraction'?EXTRACTION_LIMIT:isBombMode()?208:52);if(trainingMode){camera.position.x=THREE.MathUtils.clamp(camera.position.x,-34,34);camera.position.z=THREE.MathUtils.clamp(camera.position.z,30,40)}scene.fog.color.set(0x30115c);renderer.domElement.style.filter="hue-rotate(35deg) saturate(1.5)"}
let phaseFlashReadyAt=0,phaseFlashPulseUntil=0,phaseBlindUntil=0;
const PHASE_FLASH_RANGE=22,PHASE_FLASH_HALF_ANGLE=.42;
function phaseFlashHits(origin,angle,target,targetAngle){const delta=target.clone().sub(origin),distance=delta.length();if(distance<.2||distance>PHASE_FLASH_RANGE)return false;const forward=new THREE.Vector3(-Math.sin(angle),0,-Math.cos(angle)),towards=delta.clone().normalize();if(forward.dot(towards)<Math.cos(PHASE_FLASH_HALF_ANGLE))return false;if(Number.isFinite(targetAngle)){const facing=new THREE.Vector3(-Math.sin(targetAngle),0,-Math.cos(targetAngle));if(facing.dot(towards.clone().negate())<.15)return false}return hasLineOfSight(origin,target)}
function playPhaseRing(){try{prepareShotAudio();if(!audioContext||!audioCompressor)return;const at=audioContext.currentTime,osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.setValueAtTime(1450,at);osc.frequency.exponentialRampToValueAtTime(950,at+3);gain.gain.setValueAtTime(.001,at);gain.gain.linearRampToValueAtTime(.075,at+.035);gain.gain.exponentialRampToValueAtTime(.001,at+3);osc.connect(gain).connect(audioCompressor);osc.start(at);osc.stop(at+3.02);osc.onended=()=>{osc.disconnect();gain.disconnect()}}catch{}}
function showPhaseFlashPulse(origin,yawAngle){const forward=new THREE.Vector3(-Math.sin(yawAngle),0,-Math.cos(yawAngle)),point=origin.clone().addScaledVector(forward,.55),light=new THREE.PointLight(0xd8f7ff,0,8,2),spark=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),new THREE.MeshBasicMaterial({color:0xe9fcff,transparent:true,opacity:0,depthWrite:false}));light.position.copy(point);spark.position.copy(point);scene.add(light,spark);let ticks=0;const timer=setInterval(()=>{ticks++;const on=ticks%2===1;light.intensity=on?20:0;spark.material.opacity=on?.95:0;spark.scale.setScalar(on?2.5:1);if(ticks>=9){clearInterval(timer);scene.remove(light,spark);spark.geometry.dispose();spark.material.dispose()}},60)}
function applyPhaseBlind(){if(!playing||hp<=0)return;phaseBlindUntil=Math.max(phaseBlindUntil,performance.now()+3000);$('phaseBlindOverlay').hidden=false;playPhaseRing()}
function receivePhaseFlash(d){if(d.id===playerId||!Array.isArray(d.origin)||d.origin.length!==3||!d.origin.every(Number.isFinite)||!Number.isFinite(d.yaw))return;const origin=new THREE.Vector3(...d.origin),now=performance.now();showPhaseFlashPulse(origin,d.yaw);if(hp>0&&phaseFlashHits(origin,d.yaw,camera.position,yaw))applyPhaseBlind();for(const bot of bots){if(!bot.visible)continue;const eye=bot.position.clone().add(new THREE.Vector3(0,bot.userData.prone?.55:1.45,0));if(phaseFlashHits(origin,d.yaw,eye,bot.rotation.y+Math.PI))bot.userData.blindUntil=now+3000}const remote=remotes.get(d.id);if(remote){remote.mesh.userData.phaseFlashUntil=now+560}}
function usePhaseFlash(){if(roomMode==='survival')return;const now=performance.now();if(!playing||paused||duelBlocked()||hp<=0||weaponKey==='knife'||!weaponDef.phaseFlashlight||now<phaseFlashReadyAt)return;phaseFlashReadyAt=now+20000;phaseFlashPulseUntil=now+560;const origin=camera.position.clone(),data={type:'phaseFlash',origin:origin.toArray(),yaw};for(const bot of bots){if(!bot.visible)continue;const eye=bot.position.clone().add(new THREE.Vector3(0,bot.userData.prone?.55:1.45,0));if(phaseFlashHits(origin,yaw,eye,bot.rotation.y+Math.PI))bot.userData.blindUntil=now+3000}sendNetwork(data);feed('相位闪 · 已释放');updatePhaseFlashHud()}
function updatePhaseFlashHud(){const hud=$('phaseFlashHud');hud.hidden=!playing||weaponKey==='knife'||!weaponDef.phaseFlashlight;if(!hud.hidden){setText('phaseFlashKey',`相位闪 · ${keyLabel('phaseFlash')}`);const remaining=Math.max(0,phaseFlashReadyAt-performance.now());setText('phaseFlashCharge',remaining?`${Math.ceil(remaining/1000)}s`:'READY')}const blind=$('phaseBlindOverlay');blind.hidden=!playing||performance.now()>=phaseBlindUntil;blind.classList.toggle('fading',!blind.hidden&&phaseBlindUntil-performance.now()<700)}
setInterval(updatePhaseFlashHud,80);
function useTactical(){if(roomMode==='survival'||roomMode==='extraction')return;const tactical=EQUIPMENT.战术道具[equipmentLoadout.战术道具][2],now=performance.now();if(!playing||paused||duelBlocked()||tactical.type==="jetpack"||now<equipmentReadyAt||hp<=0)return;if(tactical.type==="medkit"){if(hp>=100&&!Object.keys(wounds).some(zone=>woundActive(zone)))return;hp=Math.min(100,hp+30);clearWounds();feed("医疗注射器：恢复生命并解除负面效果")}else if(tactical.type==="squadHeal"){const radius=12,healedBots=bots.filter(b=>b.visible&&b.userData.team===playerTeam&&b.userData.hp<100&&b.position.distanceTo(camera.position)<=radius),healedRemotes=[...remotes].filter(([,r])=>r.mesh.visible&&r.mesh.userData.team===playerTeam&&(r.hp??100)<100&&r.mesh.position.distanceTo(camera.position)<=radius).map(([id])=>id);if(!healedBots.length&&!healedRemotes.length){feed("战地救护器：附近没有受伤队友");return}for(const ally of healedBots){ally.userData.hp=Math.min(100,ally.userData.hp+20);ally.userData.wounds=Object.create(null)};for(const id of healedRemotes){const ally=remotes.get(id);if(ally)ally.hp=Math.min(100,(ally.hp??100)+20)}if(online&&ws?.readyState===1&&healedRemotes.length)sendNetwork({type:"heal",targets:healedRemotes,position:[camera.position.x,camera.position.y,camera.position.z]});feed(`战地救护器：${healedBots.length+healedRemotes.length} 名队友恢复 20 生命`)}else if(tactical.type==="shield"){shieldUntil=now+4000;feed("脉冲护盾：4 秒减伤")}else if(tactical.type==="scanner"){const enemies=[...bots.filter(b=>b.visible&&b.userData.team!==playerTeam),...[...remotes.values()].filter(r=>r.mesh.visible&&r.mesh.userData.team!==playerTeam).map(r=>r.mesh)];if(enemies.length){const target=enemies.reduce((a,b)=>a.position.distanceTo(camera.position)<b.position.distanceTo(camera.position)?a:b),delta=target.position.clone().sub(camera.position),direction=Math.abs(delta.x)>Math.abs(delta.z)?(delta.x>0?"东":"西"):(delta.z>0?"南":"北");feed(`扫描：${direction}方 ${Math.round(delta.length())} 米`)}else feed("扫描：未发现敌人")}else if(tactical.type==="adrenaline"){adrenalineUntil=now+5000;equipmentMove*=1.28;weaponDef.moveSpeed*=1.28;setTimeout(()=>{if(performance.now()>=adrenalineUntil)refreshEquipment()},5050);feed("战术加速：移速提升 28%")}else if(tactical.type==="stabilizer"){stabilizerUntil=now+6000;feed("稳瞄注射剂：后坐与散布降低")}else if(tactical.type==="phaseCell"){if(phase>=100||phaseActive>0)return;phase=100;feed("相位充能：突进已就绪")}equipmentReadyAt=now+(tactical.cooldown||10000);updateHud()}
function remoteDetonate(){if(weaponKey!=="meteor"||!weaponDef.remoteFuse||!rockets.length)return;const rocket=rockets.pop();explode(rocket.mesh.position,null,rocket.stats,rocket.id);disposeObject(rocket.mesh);feed("遥控引爆")}
function resetMagazinePose(key=weaponKey){const model=heldWeaponModels[key],magazine=model?.userData.magazine;if(magazine)magazine.position.copy(model.userData.magazineHome)}
function cancelReload(){if(!reloading)return;weaponActionToken++;reloading=false;reloadPhase="";resetMagazinePose();weapon.rotation.set(0,0,0);updateHud()}
function reload(){if(reloading||cycling||switchTarget>=0||weaponKey==="knife"||ammo===weaponDef.mag||reserve===0)return;cancelInspect();const token=++weaponActionToken;reloading=true;firing=false;reloadStarted=performance.now();reloadDuration=weaponDef.reload*(woundActive("arm")?1.22:1);reloadPhase="拔弹匣";actionNod+=.012;updateHud();setTimeout(()=>{if(token!==weaponActionToken)return;const n=Math.min(weaponDef.mag-ammo,reserve);ammo+=n;reserve-=n;weaponRuntime[activeWeaponSlot].ammo=ammo;weaponRuntime[activeWeaponSlot].reserve=reserve;reloading=false;reloadPhase="";resetMagazinePose();weapon.rotation.set(0,0,0);updateHud()},reloadDuration)}
function updateReloadAnimation(now){if(!reloading)return;if(!playing){cancelReload();return}const progress=Math.min(1,(now-reloadStarted)/reloadDuration),phase=progress<.27?"拔弹匣":progress<.76?"装弹":"拉栓";if(reloadPhase!==phase){reloadPhase=phase;actionNod+=phase==='拉栓'?.018:.009;updateHud()}const model=heldWeaponModels[weaponKey],magazine=model?.userData.magazine,ease=t=>t*t*(3-2*t);if(magazine){const home=model.userData.magazineHome,drop=progress<.27?ease(progress/.27):progress<.48?1:progress<.76?1-ease((progress-.48)/.28):0;magazine.position.copy(home);magazine.position.y-=drop*.34;magazine.position.x+=drop*.045}const hold=ease(Math.min(1,progress/.2))*(1-ease(Math.max(0,(progress-.78)/.22)));weapon.rotation.x=hold*.26;weapon.rotation.z=-hold*.1+(progress>.76?Math.sin((progress-.76)/.24*Math.PI)*-.13:0);weapon.rotation.y=hold*.12;weapon.position.z=gunKick+hold*.08}
function cycleBolt(){const token=++weaponActionToken;cycling=true;boltStarted=performance.now();boltDuration=weaponDef.boltTime||1000;setTimeout(()=>{if(token!==weaponActionToken)return;cycling=false;boltStarted=-1;weapon.rotation.z=weapon.rotation.y=0},boltDuration)}
function updateBoltAnimation(now){if(!cycling||boltStarted<0||reloading)return;const p=Math.min(1,(now-boltStarted)/boltDuration),pull=Math.sin(Math.PI*Math.min(1,p/.58));weapon.rotation.z=-.18*pull+(p>.6?.11*Math.sin(Math.PI*(p-.6)/.4):0);weapon.rotation.y=.12*pull;weapon.position.z=gunKick+.11*pull}
const SHOT_SOUND_PROFILES={redline:[180,.2,.11,1800,2700,.34],hammer:[132,.3,.17,1250,2200,.43],gale:[145,.3,.15,1350,2200,.43],frost:[98,.43,.24,950,1900,.55],meteor:[62,.5,.3,650,1200,.5],shotgun:[92,.43,.22,1000,1700,.54],smg:[225,.15,.075,2300,3600,.28],revolver:[110,.4,.2,1100,1900,.48],lmg:[145,.26,.14,1450,2300,.4],autoShotgun:[105,.34,.17,1050,1800,.46]};
function prepareShotAudio(){try{if(!audioContext){audioContext=new AudioContext();audioCompressor=audioContext.createDynamicsCompressor();audioCompressor.threshold.value=-18;audioCompressor.ratio.value=4;audioCompressor.attack.value=.003;audioCompressor.release.value=.16;audioCompressor.connect(audioContext.destination)}if(audioContext.state==="suspended")void audioContext.resume();if(!audioNoiseBuffer){const length=Math.floor(audioContext.sampleRate*.6);audioNoiseBuffer=audioContext.createBuffer(1,length,audioContext.sampleRate);const data=audioNoiseBuffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/length,2)}}catch{}}
function playShotSound(){try{if(!audioContext||!audioNoiseBuffer)prepareShotAudio();if(!audioContext||!audioCompressor||!audioNoiseBuffer)return;if(audioContext.state==="suspended")void audioContext.resume();const now=audioContext.currentTime,profile=SHOT_SOUND_PROFILES[weaponKey]||SHOT_SOUND_PROFILES.redline,master=audioContext.createGain();master.gain.value=weaponDef.suppressed?.42:1;master.connect(audioCompressor);const osc=audioContext.createOscillator(),body=audioContext.createGain(),filter=audioContext.createBiquadFilter();osc.type=weaponKey==="meteor"?"sawtooth":"square";osc.frequency.setValueAtTime(profile[0],now);osc.frequency.exponentialRampToValueAtTime(32,now+profile[2]);body.gain.setValueAtTime(profile[1],now);body.gain.exponentialRampToValueAtTime(.001,now+profile[2]);filter.type="lowpass";filter.frequency.value=profile[3];osc.connect(filter).connect(body).connect(master);osc.start(now);osc.stop(now+profile[2]+.02);const noise=audioContext.createBufferSource(),crack=audioContext.createGain(),high=audioContext.createBiquadFilter();noise.buffer=audioNoiseBuffer;high.type="bandpass";high.frequency.value=profile[4];crack.gain.setValueAtTime(.001,now);crack.gain.linearRampToValueAtTime(profile[5],now+.003);crack.gain.exponentialRampToValueAtTime(.001,now+profile[2]);noise.connect(high).connect(crack).connect(master);noise.start(now);noise.stop(now+profile[2]);const click=audioContext.createOscillator(),clickGain=audioContext.createGain();click.type="triangle";click.frequency.setValueAtTime(weaponKey==="frost"?560:820,now);click.frequency.exponentialRampToValueAtTime(210,now+.045);clickGain.gain.setValueAtTime(.1,now);clickGain.gain.exponentialRampToValueAtTime(.001,now+.045);click.connect(clickGain).connect(master);click.start(now);click.stop(now+.05);osc.onended=()=>{for(const node of [osc,body,filter,noise,crack,high,click,clickGain,master])node.disconnect()}}catch{}}
const SHOT_FEEDBACK_PROFILES={redline:{pitch:.031,snap:.009,yaw:[-.004,.003,.005,-.006,.002],kick:.068,roll:.002,fov:.12,side:.75,bloom:.34,flash:1},hammer:{pitch:.059,snap:.028,yaw:[-.006,.005,.007,-.005],kick:.105,roll:.004,fov:.31,side:.9,bloom:.45,flash:1.3},gale:{pitch:.078,snap:.048,yaw:[-.004,.006,-.003,.004],kick:.15,roll:.007,bloom:.48,flash:1.25},frost:{pitch:.13,snap:.078,yaw:[-.008,.006],kick:.22,roll:.012,bloom:.78,flash:1.65},meteor:{pitch:.17,snap:.08,yaw:[-.014,.012],kick:.26,roll:.012,bloom:1,flash:2.4},shotgun:{pitch:.105,snap:.055,yaw:[-.008,.007],kick:.2,roll:.01,bloom:.8,flash:1.9},smg:{pitch:.021,snap:.01,yaw:[-.0045,.0035,.0055],kick:.05,roll:.002,bloom:.38,flash:.75},revolver:{pitch:.1,snap:.06,yaw:[-.008,.007],kick:.19,roll:.009,bloom:.68,flash:1.5},lmg:{pitch:.046,snap:.02,yaw:[-.006,.005],kick:.1,roll:.004,bloom:.5,flash:1.25},autoShotgun:{pitch:.075,snap:.035,yaw:[-.006,.006],kick:.13,roll:.007,bloom:.68,flash:1.55}};
function shotFeedback(){const now=performance.now(),profile=SHOT_FEEDBACK_PROFILES[weaponKey]||SHOT_FEEDBACK_PROFILES.redline,power=weaponDef.recoil/64*(now<stabilizerUntil?.62:1),recoilScale=weaponKey==="meteor"?.58:1,force=power*(woundActive("arm")?1.18:1);if(now-lastRecoilAt>420)recoilIndex=0;const side=profile.yaw[recoilIndex%profile.yaw.length];recoilIndex++;lastRecoilAt=now;viewKickTarget=Math.min(.44,viewKickTarget+profile.pitch*force);viewKick=Math.min(.45,viewKick+profile.snap*force);viewKickVelocity=0;viewRoll=THREE.MathUtils.clamp(viewRoll+(recoilIndex%2?1:-1)*profile.roll*force,-.025,.025);yaw+=side*force*.5;gunKick=Math.min(.4,gunKick+profile.kick*force);gunKickSide=THREE.MathUtils.clamp(gunKickSide+side*force*4*(profile.side||1),-.06,.06);shotFovPulse=Math.min(1.25,shotFovPulse+(profile.fov??(weaponKey==="meteor"?.75:.42))*force);crossBloom=Math.min(1.25,crossBloom+profile.bloom*(now<stabilizerUntil?.72:1)*recoilScale);const muted=Boolean(weaponDef.muzzleHidden),level=muted?.13:1,skin=activeSkin(),signature={meteor:[0xff9a3d,1.45,20],frost:[0xb9f6ff,.8,12],shotgun:[0xffd47d,1.3,16],smg:[0xffb44a,.7,10],lmg:[0xff8a34,1.1,14]}[weaponKey]||[skin?.accent??0xffb13b,1,11],flashColor=muted?0x9bb9c7:signature[0];muzzleFlash.material.color.setHex(flashColor);muzzleFlash.material.opacity=muted?.12:(weaponKey==="meteor"?.88:.72);muzzleFlash.scale.setScalar(profile.flash*signature[1]*(muted?.55:1));flameOuter.material.opacity=.9*level;flameCore.material.opacity=.98*level;flameOuter.scale.set(1+Math.random()*.45,1+Math.random()*.4,1);flameCore.scale.setScalar(.85+Math.random()*.45);muzzleLight.color.setHex(muted?0x8caab9:flashColor);muzzleLight.intensity=muted?.55:signature[2];if(online&&ws?.readyState===1)sendNetwork({type:"muzzle",hidden:muted});playShotSound()}
function knifeAttack(){
  knifeSwingAt=performance.now();
  knifeCombo++;
  Object.assign(weaponDef,knifeCombat(activeKnifeSkin()?.id));
  const targets=[...bots.filter(b=>b.visible),...[...remotes.values()].filter(r=>r.mesh.visible).map(r=>r.mesh)];
  const ray=new THREE.Raycaster(),objects=[...targets,...obstacles];
  let chosen=null;
  // A slash covers a short arc, including crouched and prone targets.
  // Obstacles remain in each raycast, so extending reach does not cut through cover.
  for(const y of [0,-.18,-.52])for(const x of [0,-.08,.08,-.16,.16]){
    ray.setFromCamera(new THREE.Vector2(x,y),camera);
    ray.far=weaponDef.range;
    const hit=ray.intersectObjects(objects,true)[0];
    if(!hit)continue;
    let root=hit.object;
    while(root.parent&&!targets.includes(root)&&!obstacles.includes(root))root=root.parent;
    if(targets.includes(root)&&root.userData.team!==playerTeam&&(!chosen||hit.distance<chosen.hit.distance))chosen={hit,root};
    // A direct crosshair hit wins over the fallback slash arc: a nearer chest
    // must never replace a head which the player actually aimed at.
    if(x===0&&y===0&&chosen){applyKnifeHit(chosen);return}
  }
  if(!chosen)return;
  applyKnifeHit(chosen);
}
function applyKnifeHit({hit,root}){
  const zone=hit.object.userData.hitZone||"body";
  let dealt=zoneDamage(weaponDef,zone);
  const remoteEntry=[...remotes].find(([,r])=>r.mesh===root);
  if(!remoteEntry)dealt=applyBotDamage(root,dealt,zone,true);
  hitmark(zone==="head");
  if(!remoteEntry)showDamageNumber(dealt,hit.point,zone);
  if(remoteEntry&&ws?.readyState===1)sendNetwork({type:"shot",target:remoteEntry[0],damage:dealt,zone});
  if(!remoteEntry&&root.userData.hp<=0){root.visible=false;knifeKillPending=true;botDown(root);knifeKillPending=false}
}
function nearCover(){const p=camera.position;return [[.8,0],[-.8,0],[0,.8],[0,-.8]].some(([x,z])=>blocked(p.x+x,p.z+z))}
function spawnFire(point,visualOnly=false){const mesh=new THREE.Mesh(new THREE.CircleGeometry(1.8,18),new THREE.MeshBasicMaterial({color:0xff5a19,transparent:true,opacity:.55,side:THREE.DoubleSide}));mesh.rotation.x=-Math.PI/2;mesh.position.copy(point);mesh.position.y=.05;scene.add(mesh);fireZones.push({mesh,life:4,tick:0,visualOnly})}
function shoot(){if(matchFinished||duelBlocked()||isBombMode()&&bombState?.phase!=='running')return;const now=performance.now(),shotGap=now-lastShot;if(switchTarget>=0||cycling||shotGap<weaponDef.interval||hp<=0)return;if(reloading){if(ammo<=0)return;cancelReload()}cancelInspect();if(weaponKey==="knife"){lastShot=now;knifeAttack();return}if(ammo<=0){reload();return}lastShot=now;ammo--;if(trainingMode)trainingShots++;weaponRuntime[activeWeaponSlot].ammo=ammo;shotFeedback();if(trainingMode)updatePracticeStats();if(weaponKey==="meteor"){const firedSlot=activeWeaponSlot;lastLauncherShot=now;fireRocket();updateHud();if(ammo===0)setTimeout(()=>{if(activeWeaponSlot===firedSlot&&weaponKey==="meteor")reload()},220);return}if(weaponDef.pellets){shootPellets();updateHud();return}
  const aiming=adsMouse||adsKey,moving=Boolean(keys.KeyW||keys.KeyA||keys.KeyS||keys.KeyD),braced=aiming&&!moving&&weaponDef.bipod&&nearCover(),firstShot=shotGap>650,stanceSpread=!grounded?2.45:prone?.58:moving?(keys.ShiftLeft?1.85:1.34):1,movingAimPenalty=aiming&&moving&&!prone?(keys.ShiftLeft?2.15:1.6):1,hipBurst=1+Math.min(Math.max(0,recoilIndex-1),7)*.1*(weaponDef.hipBurstGrowth||1),hipLaser=(moving?(weaponDef.hipMoving||1):(weaponDef.hipStill||1))*(firstShot?(weaponDef.hipFirstShot||1):1),hipFactor=Math.max(.34,(weaponDef.hipSpread||1)*hipLaser),spread=weaponDef.spread*(aiming?(braced?.12:firstShot?weaponDef.firstShot:1)*Math.max(1,stanceSpread*.68)*movingAimPenalty:hipFactor*stanceSpread*hipBurst*(performance.now()<hipBoostUntil?.8:1))*(performance.now()<stabilizerUntil?.72:1)*(woundActive("arm")?1.55:1)*(woundActive("head")&&aiming?1.35:1),cone=aiming?spread:hipCone(spread,weaponKey==='frost'?.08:weaponKey==='gale'?.065:.06),direction=new THREE.Vector3(),right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion),up=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion),radius=Math.sqrt(Math.random())*cone,angle=Math.random()*Math.PI*2;camera.getWorldDirection(direction);direction.addScaledVector(right,Math.cos(angle)*radius).addScaledVector(up,Math.sin(angle)*radius);direction.y-=weaponDef.drop*.00045;direction.normalize();const ray=new THREE.Raycaster(camera.position,direction,0,weaponDef.range),targets=[...bots.filter(b=>b.visible),...[...remotes.values()].filter(r=>r.mesh.visible).map(r=>r.mesh)],hits=ray.intersectObjects([...targets,...obstacles],true);let hit=hits[0],piercedCover=false;
  if(hit?.object.userData.coverId){const cover=hit.object,material=cover.userData.coverMaterial;damageCover(cover,weaponDef.damage.body*(material==='steel'?.35:material==='wall'?.7:1));const mayPierce=material==='glass'||material==='wood'&&(weaponKey==='frost'||weaponKey==='gale'||weaponDef.penetration);if(mayPierce){const next=hits.find(candidate=>candidate.object!==cover&&candidate.distance>hit.distance+.15);if(next){hit=next;piercedCover=true}}}
  if(hit&&weaponDef.penetration&&!piercedCover&&!hit.object.userData.coverId){let obstacleSkipped=false;for(const candidate of hits){let root=candidate.object;while(root.parent&&!targets.includes(root)&&!obstacles.includes(root))root=root.parent;if(targets.includes(root)){hit=candidate;break}const b=root.userData?.bounds;if(!obstacleSkipped&&!root.userData?.coverId&&b&&Math.min(b.maxX-b.minX,b.maxZ-b.minZ)<=1.25){obstacleSkipped=true;continue}hit=candidate;break}}
  const end=hit?hit.point:ray.ray.at(weaponDef.range,new THREE.Vector3());tracer(camera.position.clone(),end,weaponDef.bulletSpeed,weaponDef.brightTracer);
  if(hit){const zone=hit.object.userData.hitZone||"body";let root=hit.object;while(root.parent&&!targets.includes(root))root=root.parent;if(weaponDef.incendiary)spawnFire(hit.point);if(targets.includes(root)&&root.userData.team===playerTeam&&now>(root.userData.friendlyWarnAt||0)){root.userData.friendlyWarnAt=now+1200;feed("蓝色名字牌是队友 · 友军伤害关闭")}if(targets.includes(root)&&root.userData.team!==playerTeam){const distance=camera.position.distanceTo(hit.point),falloff=weaponKey==="redline"?1-Math.max(0,distance-35)/Math.max(1,weaponDef.range-35)*.25*(weaponDef.falloff||1):weaponKey==="smg"?1-Math.max(0,distance-22)/Math.max(1,weaponDef.range-22)*.4*(weaponDef.falloff||1):weaponKey==="lmg"?1-Math.max(0,distance-45)/Math.max(1,weaponDef.range-45)*.18*(weaponDef.falloff||1):1;let dealt=Math.max(1,Math.round(zoneDamage(weaponDef,zone)*falloff*(weaponDef.armorDamage||1)*(piercedCover?.68:1)));const remoteEntry=[...remotes].find(([,r])=>r.mesh===root);if(!remoteEntry)dealt=applyBotDamage(root,dealt,zone,true);if(weaponDef.softPoint)for(const other of bots)if(other!==root&&other.visible&&other.userData.team!==playerTeam&&other.position.distanceTo(root.position)<2.4){applyBotDamage(other,Math.round(dealt*.3),"body");if(other.userData.hp<=0)botDown(other)}hitmark(zone==="head");if(!remoteEntry)showDamageNumber(dealt,hit.point,zone);if(remoteEntry&&ws?.readyState===1)sendNetwork({type:"shot",target:remoteEntry[0],damage:dealt,zone});if(!remoteEntry&&root.userData.hp<=0){root.visible=false;botDown(root)}}}if(weaponKey==="frost")cycleBolt();updateHud();
}
function shootPellets(){
  const targets=[...bots.filter(bot=>bot.visible),...[...remotes.values()].filter(remote=>remote.mesh.visible).map(remote=>remote.mesh)];
  const aim=adsMouse||adsKey,base=new THREE.Vector3();camera.getWorldDirection(base);
  const right=new THREE.Vector3().crossVectors(base,camera.up).normalize(),up=new THREE.Vector3().crossVectors(right,base).normalize();
  const cone=weaponDef.spread*(aim?.38:1)*(grounded?1:1.4)*(prone?.8:1)*(weaponDef.hipSpread||1)/3*(aim?1:HIP_SPREAD_SCALE);
  const groups=new Map();
  for(let i=0;i<weaponDef.pellets;i++){
    const radius=Math.sqrt(Math.random())*cone,angle=Math.random()*Math.PI*2;
    const direction=base.clone().addScaledVector(right,Math.cos(angle)*radius).addScaledVector(up,Math.sin(angle)*radius-weaponDef.drop*.00045).normalize();
    const ray=new THREE.Raycaster(camera.position,direction,0,weaponDef.range),hit=ray.intersectObjects([...targets,...obstacles],true)[0];
    if(i<3)tracer(camera.position.clone(),hit?.point||ray.ray.at(weaponDef.range,new THREE.Vector3()),weaponDef.bulletSpeed,weaponDef.brightTracer);
    if(!hit)continue;
    if(hit.object.userData.coverId){damageCover(hit.object,weaponDef.damage.body*.6);continue}
    let root=hit.object;while(root.parent&&!targets.includes(root))root=root.parent;
    if(!targets.includes(root)||root.userData.team===playerTeam)continue;
    const zone=hit.object.userData.hitZone||"body",distance=hit.distance;
    const falloff=Math.max(.32,1-Math.max(0,distance-10)/Math.max(1,weaponDef.range-10)*.58);
    const damage=Math.max(1,Math.round(zoneDamage(weaponDef,zone)*falloff*(weaponDef.armorDamage||1)));
    const entry=groups.get(root)||{point:hit.point.clone(),head:false,zones:{head:0,body:0,arm:0},total:0};
    entry.zones[zone]=(entry.zones[zone]||0)+damage;entry.total+=damage;entry.head ||= zone==="head";groups.set(root,entry);
  }
  for(const [root,entry] of groups){
    const remoteEntry=[...remotes].find(([,remote])=>remote.mesh===root);
    let dealt=entry.total;
    if(remoteEntry){if(ws?.readyState===1)for(const [zone,damage] of Object.entries(entry.zones))if(damage>0)sendNetwork({type:"shot",target:remoteEntry[0],damage,zone})}
    else{dealt=0;for(const [zone,damage] of Object.entries(entry.zones))if(damage>0)dealt+=applyBotDamage(root,damage,zone,true);if(root.userData.hp<=0){root.visible=false;botDown(root)}}
    hitmark(entry.head);if(!remoteEntry)showDamageNumber(dealt,entry.point,entry.head?"head":"body");
  }
}
function fireRocket(){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,.65,8),new THREE.MeshBasicMaterial({color:0xffb04d})),direction=new THREE.Vector3();camera.getWorldDirection(direction);mesh.position.copy(camera.position).addScaledVector(direction,1);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);scene.add(mesh);const rocket={id:crypto.randomUUID(),mesh,velocity:direction.multiplyScalar(weaponDef.bulletSpeed),life:weaponDef.range/weaponDef.bulletSpeed,drop:weaponDef.drop,fuse:weaponDef.fuse,stats:{...weaponDef}};rockets.push(rocket);if(online&&ws?.readyState===1)sendNetwork({type:"rocket",rocketId:rocket.id,origin:mesh.position.toArray(),direction:rocket.velocity.clone().normalize().toArray(),speed:weaponDef.bulletSpeed,drop:weaponDef.drop,life:rocket.life});if(weaponDef.twoStage)setTimeout(()=>{if(rockets.includes(rocket)){rocket.velocity.multiplyScalar(1.65);rocket.mesh.material.color.set(0x79eaff)}},520)}
function spawnRemoteRocket(data){if(!Array.isArray(data.origin)||!Array.isArray(data.direction)||data.origin.length!==3||data.direction.length!==3)return;const values=[...data.origin,...data.direction].map(Number);if(values.some(value=>!Number.isFinite(value)))return;const origin=new THREE.Vector3(...values.slice(0,3)),direction=new THREE.Vector3(...values.slice(3,6));if(direction.lengthSq()<.01)return;direction.normalize();const speed=THREE.MathUtils.clamp(Number(data.speed)||34,10,100),drop=THREE.MathUtils.clamp(Number(data.drop)||0,0,10),life=THREE.MathUtils.clamp(Number(data.life)||3,.2,6),mesh=new THREE.Mesh(new THREE.CylinderGeometry(.055,.08,.48,7),new THREE.MeshBasicMaterial({color:0xffb04d,transparent:true,opacity:.82}));mesh.position.copy(origin);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);scene.add(mesh);remoteRockets.push({id:data.rocketId,owner:data.id,mesh,velocity:direction.multiplyScalar(speed),drop,life})}
function updateRemoteRockets(dt){for(let i=remoteRockets.length-1;i>=0;i--){const rocket=remoteRockets[i],from=rocket.mesh.position.clone();rocket.velocity.y-=rocket.drop*dt;const step=rocket.velocity.clone().multiplyScalar(dt),direction=step.clone().normalize();sightRay.set(from,direction);sightRay.far=step.length()+.08;const hit=sightRay.intersectObjects(obstacles,false)[0];rocket.life-=dt;if(hit||rocket.life<=0){disposeObject(rocket.mesh);remoteRockets.splice(i,1);continue}rocket.mesh.position.add(step);rocket.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);rocket.trailClock=(rocket.trailClock||0)+dt;if(rocket.trailClock>=.05){tracer(rocket.trailFrom||from,rocket.mesh.position,900,false);rocket.trailFrom=rocket.mesh.position.clone();rocket.trailClock=0}}}
function showExplosionFX(point,radius){const flash=new THREE.Mesh(new THREE.SphereGeometry(radius*.18,12,8),new THREE.MeshBasicMaterial({color:0xff8a35,transparent:true,opacity:.8,depthWrite:false}));flash.position.copy(point);scene.add(flash);setTimeout(()=>disposeObject(flash),180);impactFX(point,"explosion")}
function showSmokeFX(point){const smoke=new THREE.Mesh(new THREE.SphereGeometry(4.5,16,10),new THREE.MeshBasicMaterial({color:0x53606a,transparent:true,opacity:.55,depthWrite:false}));smoke.position.copy(point).setY(2.2);scene.add(smoke);setTimeout(()=>disposeObject(smoke),6500)}
function showClusterFX(point){for(let n=0;n<10;n++){const end=point.clone().add(new THREE.Vector3(THREE.MathUtils.randFloatSpread(12),Math.random()*3,THREE.MathUtils.randFloatSpread(12)));tracer(point,end,500,true)}}
function showRemoteBlast(data){if(!Array.isArray(data.position)||data.position.length!==3||data.position.some(v=>typeof v!=="number"||!Number.isFinite(v)))return;const point=new THREE.Vector3(...data.position),radius=THREE.MathUtils.clamp(Number(data.radius)||7,2,15);for(let i=remoteRockets.length-1;i>=0;i--){const rocket=remoteRockets[i];if(rocket.id===data.rocketId&&rocket.owner===data.id){disposeObject(rocket.mesh);remoteRockets.splice(i,1);break}}showExplosionFX(point,radius);if(data.incendiary)spawnFire(point,true);if(data.smoke)showSmokeFX(point);if(data.cluster)showClusterFX(point)}
function spawnSmokeCloud(point){const puffs=[[-.85,-.42,-.7,1.35,.9,1.25,0x687780],[.65,-.5,-.68,1.45,.92,1.25,0x74818a],[-.7,-.5,.75,1.4,.88,1.3,0x7e8a91],[.78,-.4,.7,1.38,.95,1.3,0x6d7c84],[0,-.25,0,1.55,1.05,1.48,0x77858d],[-1.48,-.66,.1,.92,.7,1.08,0x87939a],[1.45,-.59,-.04,1,.76,1.04,0x77858d],[.12,-.62,-1.46,1.06,.74,.94,0x87939a],[-.18,-.62,1.48,1.08,.73,.96,0x718089],[-.88,.29,-.35,1.04,.82,1.08,0x8b969b],[.68,.22,.44,1.1,.82,1.1,0x79868e],[0,.55,-.5,.96,.73,1.04,0x849098]],geometry=new THREE.SphereGeometry(1,10,7),material=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.91,depthWrite:true,side:THREE.DoubleSide}),mesh=new THREE.InstancedMesh(geometry,material,puffs.length),matrix=new THREE.Matrix4();for(let i=0;i<puffs.length;i++){const [x,y,z,sx,sy,sz,color]=puffs[i];matrix.makeScale(sx*1.25,sy*1.25,sz*1.25).setPosition(x*1.25,y*1.25,z*1.25);mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,new THREE.Color(color))}mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;mesh.position.copy(point).add(new THREE.Vector3(0,1.8125,0));scene.add(mesh);smokeClouds.push({mesh,until:performance.now()+5000})}
function smokeBlocks(from,to){const delta=to.clone().sub(from);for(const cloud of smokeClouds){let enter=0,exit=1;for(const axis of ["x","y","z"]){const radius=axis==="y"?1.875:3.25,low=cloud.mesh.position[axis]-radius,high=cloud.mesh.position[axis]+radius;if(Math.abs(delta[axis])<.0001){if(from[axis]<low||from[axis]>high){enter=2;break}}else{const a=(low-from[axis])/delta[axis],b=(high-from[axis])/delta[axis];enter=Math.max(enter,Math.min(a,b));exit=Math.min(exit,Math.max(a,b))}}if(enter<=exit&&enter<=1&&exit>=0)return true}return false}
const GRENADE_THROW_SPEED=36,GRENADE_THROW_LIFT=10.5;
const grenadeArcGeometry=new THREE.BufferGeometry(),grenadeArcPositions=new Float32Array(3*128);
grenadeArcGeometry.setAttribute('position',new THREE.BufferAttribute(grenadeArcPositions,3).setUsage(THREE.DynamicDrawUsage));
grenadeArc=new THREE.Line(grenadeArcGeometry,new THREE.LineDashedMaterial({color:0xffce82,dashSize:.4,gapSize:.22,transparent:true,opacity:.85,depthWrite:false}));
grenadeArc.frustumCulled=false;grenadeArc.visible=false;scene.add(grenadeArc);
const grenadeRibbonGeometry=new THREE.BufferGeometry(),grenadeRibbonPositions=new Float32Array(128*2*3),grenadeRibbonIndices=[];
for(let i=0;i<127;i++){const n=i*2;grenadeRibbonIndices.push(n,n+1,n+2,n+1,n+3,n+2)}
grenadeRibbonGeometry.setAttribute('position',new THREE.BufferAttribute(grenadeRibbonPositions,3).setUsage(THREE.DynamicDrawUsage));
grenadeRibbonGeometry.setIndex(grenadeRibbonIndices);
grenadeArcRibbon=new THREE.Mesh(grenadeRibbonGeometry,new THREE.MeshBasicMaterial({color:0xffc76f,transparent:true,opacity:.62,depthWrite:false,side:THREE.DoubleSide}));
grenadeArcRibbon.frustumCulled=false;grenadeArcRibbon.visible=false;scene.add(grenadeArcRibbon);
grenadeArcEnd=new THREE.Mesh(new THREE.TorusGeometry(.32,.035,6,24),new THREE.MeshBasicMaterial({color:0xffa84c,transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide}));grenadeArcEnd.rotation.x=Math.PI/2;grenadeArcEnd.visible=false;scene.add(grenadeArcEnd);
const grenadeRibbonPoint=new THREE.Vector3(),grenadeRibbonBefore=new THREE.Vector3(),grenadeRibbonAfter=new THREE.Vector3(),grenadeRibbonTangent=new THREE.Vector3(),grenadeRibbonView=new THREE.Vector3(),grenadeRibbonSide=new THREE.Vector3();
function throwLaunch(forced=false){const direction=new THREE.Vector3();camera.getWorldDirection(direction);const grenade=equipmentLoadout.投掷物==='grenade';return{origin:camera.position.clone().addScaledVector(direction,.65),velocity:direction.multiplyScalar(forced?4:grenade?GRENADE_THROW_SPEED:23).add(new THREE.Vector3(0,forced?1:grenade?GRENADE_THROW_LIFT:8,0))}}
function updateGrenadeArc(now){
  if(!grenadeArc||!grenadeArcEnd)return;
  const show=playing&&!paused&&hp>0&&grenadeCookStarted>0&&equipmentLoadout.投掷物==='grenade';
  grenadeArc.visible=grenadeArcRibbon.visible=grenadeArcEnd.visible=show;if(!show)return;
  const {origin,velocity}=throwLaunch(),position=origin.clone(),from=new THREE.Vector3(),next=new THREE.Vector3();
  const remaining=Math.max(GRENADE_MIN_FUSE_MS,GRENADE_FUSE_MS-(now-grenadeCookStarted))/1000,step=.04,limit=Math.min(127,Math.ceil(remaining/step));
  grenadeArcPositions.set(origin.toArray(),0);
  let count=1;
  for(let i=0;i<limit;i++){
    from.copy(position);velocity.y-=19*step;next.copy(from).addScaledVector(velocity,step);
    const sideHit=obstacles.some(o=>{const b=o.userData.bounds;if(!b||from.y>=b.maxY+.12||next.y>=b.maxY+.13||b.minY!==undefined&&Math.max(from.y,next.y)<b.minY-.13)return false;const insideNext=next.x>b.minX-.13&&next.x<b.maxX+.13&&next.z>b.minZ-.13&&next.z<b.maxZ+.13,insideFrom=from.x>b.minX-.13&&from.x<b.maxX+.13&&from.z>b.minZ-.13&&from.z<b.maxZ+.13;return insideNext&&!insideFrom});
    if(sideHit){next.x=from.x;next.z=from.z;velocity.x*=-.35;velocity.z*=-.35}
    let surfaceY=.13;for(const o of obstacles){const b=o.userData.bounds;if(b&&next.x>b.minX-.13&&next.x<b.maxX+.13&&next.z>b.minZ-.13&&next.z<b.maxZ+.13&&from.y>=b.maxY+.12&&next.y<=b.maxY+.13)surfaceY=Math.max(surfaceY,b.maxY+.13)}
    if(next.y<=surfaceY){next.y=surfaceY;velocity.y=Math.abs(velocity.y)*.3;velocity.x*=.84;velocity.z*=.84}
    position.copy(next);grenadeArcPositions.set(position.toArray(),count*3);count++;
  }
  grenadeArcGeometry.setDrawRange(0,count);grenadeArcGeometry.attributes.position.needsUpdate=true;grenadeArc.computeLineDistances();grenadeArcEnd.position.copy(position);
  for(let i=0;i<count;i++){
    grenadeRibbonPoint.fromArray(grenadeArcPositions,i*3);
    grenadeRibbonBefore.fromArray(grenadeArcPositions,Math.max(0,i-1)*3);
    grenadeRibbonAfter.fromArray(grenadeArcPositions,Math.min(count-1,i+1)*3);
    grenadeRibbonTangent.subVectors(grenadeRibbonAfter,grenadeRibbonBefore).normalize();
    grenadeRibbonView.subVectors(camera.position,grenadeRibbonPoint).normalize();
    grenadeRibbonSide.crossVectors(grenadeRibbonTangent,grenadeRibbonView).normalize().multiplyScalar(.065);
    if(grenadeRibbonSide.lengthSq()<.00001)grenadeRibbonSide.set(.065,0,0);
    const offset=i*6;
    grenadeRibbonPositions[offset]=grenadeRibbonPoint.x+grenadeRibbonSide.x;
    grenadeRibbonPositions[offset+1]=grenadeRibbonPoint.y+grenadeRibbonSide.y;
    grenadeRibbonPositions[offset+2]=grenadeRibbonPoint.z+grenadeRibbonSide.z;
    grenadeRibbonPositions[offset+3]=grenadeRibbonPoint.x-grenadeRibbonSide.x;
    grenadeRibbonPositions[offset+4]=grenadeRibbonPoint.y-grenadeRibbonSide.y;
    grenadeRibbonPositions[offset+5]=grenadeRibbonPoint.z-grenadeRibbonSide.z;
  }
  grenadeRibbonGeometry.setDrawRange(0,(count-1)*6);grenadeRibbonGeometry.attributes.position.needsUpdate=true;
}
function clearGrenadeCook(){clearTimeout(grenadeCookTimer);grenadeCookTimer=null;grenadeReady=false;grenadeCookStarted=0;grenadeHeld=false;grenadeArc.visible=grenadeArcRibbon.visible=grenadeArcEnd.visible=false;$('grenadeCook').hidden=true;updateHeldItemVisuals()}
function makeThrownItem(id,owner,kind,origin,velocity,local,fuse=4){const mesh=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),new THREE.MeshBasicMaterial({color:kind==="smoke"?0xb8d3d1:0xffa25d}));mesh.position.copy(origin);scene.add(mesh);const item={id,owner,kind,mesh,velocity:velocity.clone(),fuse:kind==="grenade"?fuse:0,burstAt:kind==="grenade"?performance.now()+fuse*1000:0,life:6,local};thrownItems.push(item);return item}
function throwCurrent(fuse=4,forced=false){if(!playing||throwCharges<=0||isBombMode()&&bombState?.phase!=='running'||!forced&&(paused||duelBlocked()||hp<=0))return;const kind=equipmentLoadout.投掷物,{origin,velocity}=throwLaunch(forced),id=crypto.randomUUID();makeThrownItem(id,playerId,kind,origin,velocity,true,fuse);if(throwCharges===2)nextThrowRefill=performance.now()+10000;throwCharges--;if(online&&ws?.readyState===1)sendNetwork({type:"throwable",throwId:id,kind,origin:origin.toArray(),velocity:velocity.toArray(),fuseMs:Math.max(0,Math.round(fuse*1000))});clearGrenadeCook();updateThrowableHud()}
function primeOrThrowCurrent(){if(roomMode==="extraction")return;if(roomMode==='survival')return;if(!playing||paused||duelBlocked()||isBombMode()&&bombState?.phase!=='running'||hp<=0||throwCharges<=0)return;if(grenadeCookStarted){releaseCookedGrenade();return}grenadeReady=!grenadeReady;grenadeHeld=grenadeReady;grenadeBody.material.color.setHex(equipmentLoadout.投掷物==="smoke"?0x738d8e:0x38444d);if(grenadeReady){firing=false;adsMouse=adsKey=false}updateHeldItemVisuals();updateThrowableHud()}
const GRENADE_FUSE_MS=4000,GRENADE_MIN_FUSE_MS=200,GRENADE_MAX_COOK_MS=GRENADE_FUSE_MS-GRENADE_MIN_FUSE_MS;
function beginGrenadeCook(){if(roomMode==='survival')return;if(!grenadeReady||grenadeCookStarted||throwCharges<=0)return;if(equipmentLoadout.投掷物==="smoke"){throwCurrent();return}grenadeCookStarted=performance.now();grenadeCookTimer=setTimeout(()=>releaseCookedGrenade(),GRENADE_MAX_COOK_MS);updateThrowableHud()}
function releaseCookedGrenade(forced=false){if(!grenadeCookStarted)return;const fuse=Math.max(GRENADE_MIN_FUSE_MS,GRENADE_FUSE_MS-(performance.now()-grenadeCookStarted))/1000;clearGrenadeCook();throwCurrent(fuse,forced)}
function spawnRemoteThrowable(data){if(!Array.isArray(data.origin)||!Array.isArray(data.velocity)||data.origin.length!==3||data.velocity.length!==3)return;const values=[...data.origin,...data.velocity];if(values.some(value=>typeof value!=="number"||!Number.isFinite(value)))return;const fuse=Number.isFinite(data.fuseMs)?THREE.MathUtils.clamp(data.fuseMs/1000,0,4):4;makeThrownItem(data.throwId,data.id,data.kind,new THREE.Vector3(...data.origin),new THREE.Vector3(...data.velocity),false,fuse)}
const GRENADE_BLAST_RADIUS=12.5;
function grenadeBlastDamage(distance){return Math.round(160-90*THREE.MathUtils.clamp(distance/GRENADE_BLAST_RADIUS,0,1))}
function insideGrenadeBlast(position,point){return position.distanceToSquared(point)<=GRENADE_BLAST_RADIUS*GRENADE_BLAST_RADIUS}
function throwBlastClear(point,target){const origin=point.clone().add(new THREE.Vector3(0,.35,0)),direction=target.clone().sub(origin),distance=direction.length();sightRay.set(origin,direction.normalize());sightRay.far=Math.max(0,distance-.15);return !sightRay.intersectObjects(obstacles,false).length}
function burstThrowable(item){const point=item.mesh.position.clone();if(item.kind==="smoke")spawnSmokeCloud(point);else{showExplosionFX(point,GRENADE_BLAST_RADIUS);for(const bot of bots){if(!bot.visible||bot.userData.team===playerTeam)continue;const center=bot.position.clone().add(new THREE.Vector3(0,1.2,0));if(!insideGrenadeBlast(center,point)||!throwBlastClear(point,center))continue;const dealt=applyBotDamage(bot,grenadeBlastDamage(center.distanceTo(point)),"explosion");showDamageNumber(dealt,center,"explosion");if(bot.userData.hp<=0)botDown(bot)}for(const [id,remote] of remotes){if(!remote.mesh.visible||remote.mesh.userData.team===playerTeam)continue;const center=remote.mesh.position.clone().add(new THREE.Vector3(0,1.2,0));if(!insideGrenadeBlast(center,point)||!throwBlastClear(point,center))continue;const dealt=grenadeBlastDamage(center.distanceTo(point));sendNetwork({type:"shot",target:id,damage:dealt,zone:"explosion"})}const selfCenter=camera.position.clone().add(new THREE.Vector3(0,-.5,0));if(hp>0&&insideGrenadeBlast(selfCenter,point)&&throwBlastClear(point,selfCenter))damage(grenadeBlastDamage(selfCenter.distanceTo(point)),"自己的手雷","explosion")}if(online&&ws?.readyState===1)sendNetwork({type:"throwableBurst",throwId:item.id,kind:item.kind,position:point.toArray()})}
function showRemoteThrowableBurst(data){if(!Array.isArray(data.position)||data.position.length!==3||data.position.some(value=>typeof value!=="number"||!Number.isFinite(value)))return;for(let i=thrownItems.length-1;i>=0;i--){const item=thrownItems[i];if(item.id===data.throwId&&item.owner===data.id){disposeObject(item.mesh);thrownItems.splice(i,1);break}}const point=new THREE.Vector3(...data.position);if(data.kind==="smoke")spawnSmokeCloud(point);else showExplosionFX(point,GRENADE_BLAST_RADIUS)}
function updateThrownItems(dt){
  const now=performance.now();
  for(let i=thrownItems.length-1;i>=0;i--){
    const item=thrownItems[i],from=item.mesh.position.clone();
    if(item.kind==="grenade")item.fuse=Math.max(0,(item.burstAt-now)/1000);item.life-=dt;item.velocity.y-=19*dt;
    const next=from.clone().addScaledVector(item.velocity,dt);
    const sideHit=obstacles.some(o=>{const b=o.userData.bounds;if(!b||from.y>=b.maxY+.12||next.y>=b.maxY+.13||b.minY!==undefined&&Math.max(from.y,next.y)<b.minY-.13)return false;const insideNext=next.x>b.minX-.13&&next.x<b.maxX+.13&&next.z>b.minZ-.13&&next.z<b.maxZ+.13,insideFrom=from.x>b.minX-.13&&from.x<b.maxX+.13&&from.z>b.minZ-.13&&from.z<b.maxZ+.13;return insideNext&&!insideFrom});
    if(sideHit){next.x=from.x;next.z=from.z;item.velocity.x*=-.35;item.velocity.z*=-.35}
    let surfaceY=.13;
    for(const o of obstacles){const b=o.userData.bounds;if(b&&next.x>b.minX-.13&&next.x<b.maxX+.13&&next.z>b.minZ-.13&&next.z<b.maxZ+.13&&from.y>=b.maxY+.12&&next.y<=b.maxY+.13)surfaceY=Math.max(surfaceY,b.maxY+.13)}
    const landed=next.y<=surfaceY;
    if(landed){next.y=surfaceY;if(item.kind==="grenade"){item.velocity.y=Math.abs(item.velocity.y)*.3;item.velocity.x*=.84;item.velocity.z*=.84}}
    item.mesh.position.copy(next);
    const burst=item.kind==="smoke"?(landed||item.life<=0):item.fuse<=0;
    if(item.local&&burst)burstThrowable(item);
    if(item.local&&burst||item.life<=0){disposeObject(item.mesh);thrownItems.splice(i,1)}
  }
  for(let i=smokeClouds.length-1;i>=0;i--)if(now>=smokeClouds[i].until){disposeObject(smokeClouds[i].mesh);smokeClouds.splice(i,1)}
}
function updateThrowableHud(){const now=performance.now();if(grenadeReady&&hp<=0&&!grenadeCookStarted)clearGrenadeCook();if(throwCharges<2&&nextThrowRefill&&now>=nextThrowRefill){throwCharges++;nextThrowRefill=throwCharges<2?now+10000:0}if(grenadeCookStarted&&hp<=0)releaseCookedGrenade(true);if(grenadeCookStarted&&now-grenadeCookStarted>=GRENADE_MAX_COOK_MS)releaseCookedGrenade();updateGrenadeArc(now);const cook=$('grenadeCook');cook.hidden=!grenadeReady;if(grenadeReady)setText('grenadeCook',equipmentLoadout.投掷物==='smoke'?'烟雾弹已准备 · 左键投掷，按 C 收回':grenadeCookStarted?`手雷 ${(Math.max(GRENADE_MIN_FUSE_MS,GRENADE_FUSE_MS-(now-grenadeCookStarted))/1000).toFixed(1)} 秒 · 松开左键投掷`:`手雷已准备 · 按住左键温雷，松开投掷`);setText("throwableName",`${EQUIPMENT.投掷物[equipmentLoadout.投掷物][0]} · ${keyLabel("throwable")}`);setText("throwableCount",`${throwCharges} / 2`);setText("throwableRefill",throwCharges===2?"已装满":`${Math.max(1,Math.ceil((nextThrowRefill-now)/1000))} 秒后补充 1 枚`)}
setInterval(()=>{if(playing)updateThrowableHud()},100);
function explode(point,direct,stats=weaponDef){const radius=stats.blastRadius||7;showExplosionFX(point,radius);const selfDistance=camera.position.distanceTo(point);if(selfDistance<=radius+2){const push=camera.position.clone().sub(point).setY(0);if(push.lengthSq()<.01)push.set(-Math.sin(yaw),0,-Math.cos(yaw));push.normalize();knockbackVelocity.addScaledVector(push,Math.max(0,4-selfDistance*.3))}for(const bot of bots){if(!bot.visible||bot.userData.team===playerTeam)continue;const dist=bot.position.distanceTo(point);if(dist<=radius){const raw=bot===direct?stats.directDamage:Math.round(stats.edgeDamage+(stats.directDamage-stats.edgeDamage)*(1-dist/radius)),dealt=applyBotDamage(bot,raw,"explosion");showDamageNumber(dealt,bot.position.clone().add(new THREE.Vector3(0,1.5,0)),"explosion");const push=bot.position.clone().sub(point).setY(0).normalize().multiplyScalar(8+(radius-dist)*1.5);bot.userData.knockback=push;if(bot.userData.hp<=0)botDown(bot)}}for(const [id,r] of remotes){const dist=r.mesh.position.distanceTo(point);if(r.mesh.visible&&r.mesh.userData.team!==playerTeam&&dist<=radius&&ws?.readyState===1){const dealt=r.mesh===direct?stats.directDamage:Math.round(stats.edgeDamage+(stats.directDamage-stats.edgeDamage)*(1-dist/radius));sendNetwork({type:"shot",target:id,damage:dealt,zone:"explosion"})}}}
const coreExplode=explode;explode=function(point,direct,stats=weaponDef,rocketId=null){if(stats.safety&&camera.position.distanceTo(point)<4){feed("保险引信：距离过近，未引爆");return}coreExplode(point,direct,stats);for(const cover of breakableCovers.values())if(cover.userData.coverId.startsWith(activeMapId+':')&&!cover.userData.destroyed&&cover.position.distanceTo(point)<(stats.blastRadius||7)+2)damageCover(cover,stats.directDamage||90);if(online&&ws?.readyState===1)sendNetwork({type:"blast",rocketId,position:point.toArray(),radius:stats.blastRadius||7,incendiary:!!stats.incendiary,smoke:!!stats.smoke,cluster:!!stats.cluster});if(stats.incendiary)spawnFire(point);if(stats.smoke){showSmokeFX(point)}if(stats.cluster){showClusterFX(point);for(const bot of bots)if(bot.visible&&bot.userData.team!==playerTeam&&bot.position.distanceTo(point)<10){applyBotDamage(bot,18,"explosion");if(bot.userData.hp<=0)botDown(bot)}}if(stats.concussion&&camera.position.distanceTo(point)<10){viewKick=-.13;renderer.domElement.style.filter="blur(2px) saturate(.4)";setTimeout(()=>renderer.domElement.style.filter="",650)}};
function updateRockets(dt){for(let i=rockets.length-1;i>=0;i--){const rocket=rockets[i],targets=[...bots.filter(b=>b.visible&&b.userData.team!==playerTeam),...[...remotes.values()].filter(r=>r.mesh.visible&&r.mesh.userData.team!==playerTeam).map(r=>r.mesh)];if(rocket.detonating){rocket.fuse-=dt;if(rocket.fuse<=0){explode(rocket.point,rocket.direct,rocket.stats,rocket.id);disposeObject(rocket.mesh);rockets.splice(i,1)}continue}if(rocket.jumpTimer!==undefined){rocket.jumpTimer-=dt;if(rocket.jumpTimer<=0){explode(rocket.mesh.position,null,rocket.stats,rocket.id);disposeObject(rocket.mesh);rockets.splice(i,1);continue}}if(rocket.stats.homing&&targets.length){const target=targets.reduce((best,t)=>t.position.distanceToSquared(rocket.mesh.position)<best.position.distanceToSquared(rocket.mesh.position)?t:best,targets[0]);if(target.position.distanceTo(rocket.mesh.position)<22){const speed=rocket.velocity.length(),desired=target.position.clone().add(new THREE.Vector3(0,1,0)).sub(rocket.mesh.position).normalize().multiplyScalar(speed);rocket.velocity.lerp(desired,Math.min(1,dt*.9))}}if(rocket.stats.proximity){const close=targets.find(t=>t.position.distanceTo(rocket.mesh.position)<2.6);if(close){explode(rocket.mesh.position,close,rocket.stats,rocket.id);disposeObject(rocket.mesh);rockets.splice(i,1);continue}}rocket.velocity.y-=rocket.drop*dt;const step=rocket.velocity.clone().multiplyScalar(dt),direction=step.clone().normalize();sightRay.set(rocket.mesh.position,direction);sightRay.far=step.length()+.15;const hit=sightRay.intersectObjects([...targets,...obstacles],true)[0];rocket.life-=dt;if(hit||rocket.life<=0){let direct=null,root=hit?.object;if(hit){while(root.parent&&!targets.includes(root)&&!obstacles.includes(root))root=root.parent;if(targets.includes(root))direct=root}const bounds=root?.userData?.bounds,thin=bounds&&Math.min(bounds.maxX-bounds.minX,bounds.maxZ-bounds.minZ)<=1.25;if(hit&&rocket.stats.rocketPenetration&&thin&&!rocket.pierced){rocket.pierced=true;rocket.mesh.position.copy(hit.point).addScaledVector(direction,1.5);continue}if(hit&&rocket.stats.jumpFuse&&!direct&&!rocket.bounced&&hit.point.y<.7){rocket.bounced=true;rocket.jumpTimer=.38;rocket.mesh.position.copy(hit.point).add(new THREE.Vector3(0,.2,0));rocket.velocity.multiplyScalar(.45);rocket.velocity.y=7;continue}if(rocket.fuse>0&&hit){rocket.detonating=true;rocket.point=hit.point.clone();rocket.direct=direct;rocket.mesh.position.copy(hit.point)}else{explode(hit?.point||rocket.mesh.position,direct,rocket.stats,rocket.id);disposeObject(rocket.mesh);rockets.splice(i,1)}}else{rocket.mesh.position.add(step);rocket.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction)}}}
function tracer(a,b,speed=700,bright=false){effects.trace(a,b,speed,bright)}
function updateTrajectory(){const show=playing&&hp>0&&weaponKey==="meteor"&&weaponDef.trajectory&&(adsMouse||adsKey);trajectoryLine.visible=show;if(!show)return;const points=[],direction=new THREE.Vector3();camera.getWorldDirection(direction);const start=camera.position.clone(),speed=weaponDef.bulletSpeed;for(let t=0;t<=2.4;t+=.12){const p=start.clone().addScaledVector(direction,speed*t);p.y-=.5*weaponDef.drop*t*t;points.push(p);if(p.y<=.1)break}trajectoryGeometry.setFromPoints(points);trajectoryLine.computeLineDistances()}
setInterval(()=>{tacticalLight.intensity=playing&&weaponDef.flashlight?(performance.now()<phaseFlashPulseUntil?(Math.floor(performance.now()/65)%2?90:5):26):0;updateTrajectory();for(let i=fireZones.length-1;i>=0;i--){const zone=fireZones[i];zone.life-=.1;zone.mesh.material.opacity=Math.max(0,zone.life/7);if(zone.life<=0){disposeObject(zone.mesh);fireZones.splice(i,1);continue}zone.tick-=.1;if(zone.tick<=0){zone.tick=.5;if(zone.visualOnly)continue;for(const bot of bots)if(bot.visible&&bot.userData.team!==playerTeam&&bot.position.distanceTo(zone.mesh.position)<2.1){const dealt=applyBotDamage(bot,8,"explosion");showDamageNumber(dealt,bot.position.clone().add(new THREE.Vector3(0,1,0)),"explosion");if(bot.userData.hp<=0)botDown(bot)}for(const [id,r] of remotes)if(r.mesh.visible&&r.mesh.userData.team!==playerTeam&&r.mesh.position.distanceTo(zone.mesh.position)<2.1&&ws?.readyState===1)sendNetwork({type:"shot",target:id,damage:8,zone:"explosion"})}}},100);
setInterval(()=>{if(!playing||paused||document.hidden)return;if(!weaponDef.iff&&!(weaponDef.rangefinder&&(adsMouse||adsKey)))return;const targets=[...bots.filter(b=>b.visible),...[...remotes.values()].filter(r=>r.mesh.visible).map(r=>r.mesh)],ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(),camera);const hit=ray.intersectObjects([...targets,...obstacles],true)[0];if(weaponDef.rangefinder&&(adsMouse||adsKey))document.querySelector(".optic .range").textContent=hit?`${Math.round(hit.distance)} M · LOCK`:"--- M";if(weaponDef.iff){let root=hit?.object;while(root?.parent&&!targets.includes(root))root=root.parent;const color=targets.includes(root)?(root.userData.team===playerTeam?"#53baff":"#ff496c"):"#dffcff";document.querySelectorAll(".cross i").forEach(i=>i.style.background=color)}else document.querySelectorAll(".cross i").forEach(i=>i.style.background="")},80);
let hitmarkTimer=null;function hitmark(headshot=false){const marker=$("hitmarker");clearTimeout(hitmarkTimer);marker.classList.toggle("headshot",headshot);marker.style.opacity=1;marker.style.transform="translate(-50%,-50%) scale(1)";hitmarkTimer=setTimeout(()=>{marker.style.opacity=0;marker.style.transform="translate(-50%,-50%) scale(.4)";marker.classList.remove("headshot")},headshot?300:90)}
function recycleImpact(item){item.group.removeFromParent();if(impactPool.length<24)impactPool.push(item);else disposeObject(item.group)}
function spawnImpact(world,kind,blood=false){
  if(impactEffects.length>=12)recycleImpact(impactEffects.shift());
  const count=blood?Math.min(9,Math.max(5,quality.particles)):quality.particles,type=blood?'blood':'spark';let itemIndex=impactPool.findIndex(item=>item.type===type&&item.group.children.length===count),item=itemIndex>=0?impactPool.splice(itemIndex,1)[0]:null;
  if(!item){const group=new THREE.Group(),geometry=blood?new THREE.SphereGeometry(.03,5,4):new THREE.BoxGeometry(.018,.018,.19),material=new THREE.MeshBasicMaterial({transparent:true,opacity:1,depthWrite:!blood}),velocities=[];for(let i=0;i<count;i++){group.add(new THREE.Mesh(geometry,material));velocities.push(new THREE.Vector3())}item={type,group,material,velocities,age:0}}
  item.group.position.copy(world);item.material.color.setHex(blood?kind==='head'?0xff3157:0xb80d2d:kind==='head'?0xff3157:kind==='explosion'?0xffa33c:0x69eaff);item.material.opacity=blood?.9:1;item.age=0;item.life=blood?.34:.28;
  item.group.children.forEach((particle,i)=>{particle.position.set(0,0,0);particle.scale.set(1,blood?THREE.MathUtils.randFloat(.7,1.5):1,1);particle.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);item.velocities[i].set(THREE.MathUtils.randFloatSpread(blood?2.4:3),Math.random()*(blood?2.2:2.8),THREE.MathUtils.randFloatSpread(blood?2.4:3))});scene.add(item.group);impactEffects.push(item);
}
function impactFX(world,kind="body"){
  spawnImpact(world,kind);
  for(const actor of [...bots,...[...remotes.values()].map(r=>r.mesh)])if(actor.visible&&actor.position.distanceTo(world)<1.8){const pose=actor.userData.pose;if(pose){pose.rotation.z=THREE.MathUtils.randFloatSpread(.16);pose.position.z=.12;setTimeout(()=>{pose.rotation.z=0;pose.position.z=0},110)}}
}
function bloodFX(world,headshot=false){spawnImpact(world,headshot?'head':'body',true)}
function updateImpactEffects(dt){for(let i=impactEffects.length-1;i>=0;i--){const item=impactEffects[i];item.age+=dt;if(item.age>item.life){recycleImpact(item);impactEffects.splice(i,1);continue}item.material.opacity=1-item.age/item.life;item.group.children.forEach((spark,j)=>{spark.position.addScaledVector(item.velocities[j],dt);item.velocities[j].y-=10*dt})}}
function showDamageNumber(amount,world,kind="body"){if(trainingMode){trainingHits++;if(kind==="head")trainingHeadshots++;setText("practiceHits",trainingHits);setText("practiceHeadshots",trainingHeadshots);updatePracticeStats()}if(kind==="explosion")impactFX(world,kind);else bloodFX(world,kind==="head");const p=world.clone().project(camera);if(p.z<-1||p.z>1)return;const el=document.createElement("div");el.className=`damageNumber ${kind}`;el.textContent=`-${amount}`;el.style.left=`${(p.x*.5+.5)*innerWidth}px`;el.style.top=`${(-p.y*.5+.5)*innerHeight}px`;$("hud").appendChild(el);setTimeout(()=>el.remove(),820)}
function feed(t){const d=document.createElement("div");d.textContent=t;$("feed").prepend(d);while($("feed").children.length>4)$("feed").lastElementChild.remove();setTimeout(()=>d.remove(),2800)}
function insideHealPoint(){if(roomMode==="extraction")return false;if(roomMode==='survival')return false;return grounded&&Math.hypot(camera.position.x-healPoint.x,camera.position.z-healPoint.z)<=healPoint.radius}
let killToastTimer=0,killToastToken=0;
let knifeKillPending=false;
function showKillToast(victim,knife=false){const toast=$("killToast");if(!toast)return;recordKill(heldWeaponModels);if(knifeKillPending||knife)recordKnifeKill();actionNod+=.024;actionRoll+=.009;const skin=activeSkin();toast.style.setProperty('--skin-accent',skin?`#${skin.accent.toString(16).padStart(6,'0')}`:'');toast.dataset.rarity=skin?['void','nova','tide'].includes(skin.id)?'legendary':['nebula','aurora','copper'].includes(skin.id)?'rare':'common':'';const token=++killToastToken;$("killToastVictim").textContent=victim||"敌方目标";toast.classList.remove("show");void toast.offsetWidth;toast.classList.add("show");clearTimeout(killToastTimer);killToastTimer=setTimeout(()=>{if(token===killToastToken)toast.classList.remove("show")},1550)}
function syncNow(){if(online&&!(isArenaMode()&&spectator)&&ws?.readyState===1)sendNetwork({type:"state",position:camera.position.toArray(),rotation:yaw,hp,score,name:$("name").value,prone})}
function damage(n,source="AI",zone="body",shotId=null){if(roomMode==='survival')return;if((duelBlocked()&&!(shotId&&online&&(isArenaMode()||isObjectiveMode())))||matchFinished||phaseActive>0||hp<=0)return;const armor=EQUIPMENT.护甲[equipmentLoadout.护甲][2],helmet=EQUIPMENT.头盔[equipmentLoadout.头盔][2],protection=zone==="head"?helmet.head:zone==="explosion"?(armor.body*.55):(armor.body||0),shield=performance.now()<shieldUntil?.35:0;n=Math.round(n*(1-protection)*(1-shield));if(n<=0)return;if(online&&shotId)sendNetwork({type:'damageAck',shotId,damage:n});const absorbed=Math.min(bonusGuard,n);bonusGuard-=absorbed;n-=absorbed;if(n>0){hp=Math.max(0,hp-n);if(hp>0)applyWound(zone,{armor,helmet})}else clearWounds();$("damage").style.opacity=.9;setTimeout(()=>$("damage").style.opacity=0,80);if(hp===0){if(online&&roomMode!=='survival'){if(shotId&&ws?.readyState===1)sendNetwork({type:"death",shotId})}else if(!online)awardKill(1-playerTeam,source,$("name").value);if(roomMode==='survival'){if(online){survivalSpectating=true;$('respawn').hidden=false;setText('countdown','已阵亡 · 可观战存活队友');updateSurvivalSpectatorOptions();feed('已倒下 · 正在切换到存活队友视角')}else finishSurvival()}else if(roomMode==='gunmaster'){$('respawn').hidden=false;setText('countdown','等待下一轮')}else if(!matchFinished)respawn()}syncNow();updateHud()}
function respawn(){if(roomMode==="extraction")return;
  $("adsOverlay").className="";clearWounds();$("respawn").hidden=false;
  if(document.pointerLockElement===canvas)document.exitPointerLock();
  let n=3;$("countdown").textContent=n;clearInterval(respawnTimer);
  respawnTimer=setInterval(()=>{
    n=Math.max(0,n-1);$("countdown").textContent=n;
    if(n>0)return;
    if(!playing){clearInterval(respawnTimer);respawnTimer=null;return}
    if(duelBlocked()){$("countdown").textContent="等待房间恢复";return}
    clearInterval(respawnTimer);respawnTimer=null;
    hp=100;bonusGuard=0;markUntil=adsBoostUntil=hipBoostUntil=0;throwCharges=2;nextThrowRefill=0;phaseActive=0;shieldUntil=0;
    scene.fog.color.set(0x08101a);renderer.domElement.style.filter="";
    weaponActionToken++;reloading=cycling=false;resetWeaponRuntime();selectWeapon(slotWeapon(activeWeaponSlot),{equip:false});
    slideStartedAt=0;slideCooldownUntil=0;prone=false;playerEyeHeight=1.7;camera.position.copy(playerSpawn());if(roomMode==='aiDuel')aiDuelNoAttackUntil=performance.now()+2000;if(!online&&roomMode==='normal')soloNoAttackUntil=performance.now()+5000;$("respawn").hidden=true;
    syncNow();if(!paused)requestGamePointerLock();updateHud();
  },1000);
}
function updateHud(){const equipmentHud=$("equipmentHud");if(equipmentHud)equipmentHud.hidden=roomMode==='survival';const throwableHud=$("throwableHud");if(throwableHud)throwableHud.hidden=roomMode==='survival';const riftHud=$("rift")?.closest(".rift");if(riftHud)riftHud.hidden=roomMode==='survival';setText("hp",hp);setWidth("hpBar",hp);setText("ammo",weaponKey==="knife"?"—":ammo);setText("reserve",weaponKey==="knife"?"":"/ ∞");setText("weaponName",reloading?`${weaponDef.name} · ${reloadPhase}`:cycling?weaponDef.name+" · 拉栓中":weaponDef.name);const signature=roomMode==='gunmaster'?'gunmaster/'+activeWeaponSlot:roomMode==='challenge'?'challenge/'+weaponSlots[0]:weaponSlots.join('/')+'/'+sidearmKey+'/'+activeWeaponSlot+'/'+roomMode;if(signature!==lastSlotMarkup){lastSlotMarkup=signature;$("weaponSlotsHud").innerHTML=roomMode==='gunmaster'?`<span class="active">${keyLabel('weapon1')} ${WEAPONS[gunmasterWeapon].name} · 武器大师</span>`:roomMode==='challenge'?`<span class="active">${keyLabel('weapon1')} ${WEAPONS[weaponSlots[0]].name} · 本局限定</span>`:roomMode==='bomb'?[[0,weaponSlots[0],'weapon1'],[2,'revolver','sidearm'],[3,'knife','knife']].map(([index,key,action])=>`<span class="${index===activeWeaponSlot?'active':''}">${keyLabel(action)} ${WEAPONS[key].name}</span>`).join(''):[...weaponSlots,sidearmKey||"knife",...(sidearmKey?["knife"]:[])].map((key,index)=>'<span class="'+(index===activeWeaponSlot?'active':'')+'">'+keyLabel(index===0?"weapon1":index===1?"weapon2":index===2?"sidearm":"knife")+' '+WEAPONS[key].name+'</span>').join('')}setText("rift",phase>=100?"READY":Math.floor(phase)+"%");setWidth("riftBar",phase)}
setInterval(()=>{if(playing&&hp>0)renderWounds()},200);
setInterval(()=>{if(!playing||paused||hp<=0||duelBlocked())return;const moving=Boolean(keys.KeyW||keys.KeyA||keys.KeyS||keys.KeyD),sprinting=moving&&keys.ShiftLeft,airPenalty=grounded?0:.88,movePenalty=moving?(sprinting?.68:.38):0,stance=prone?-.18:0,baseCone=weaponKey==="frost"?.28:weaponKey==="gale"?.22:weaponKey==="redline"?.34:weaponKey==="shotgun"?.78:weaponKey==="autoShotgun"?.9:weaponKey==="smg"?.48:weaponKey==="lmg"?.5:weaponKey==="revolver"?.26:0;crossBloom=Math.max(crossBloom,Math.max(.04,baseCone+movePenalty+airPenalty+stance));if(!feelGrounded&&grounded){viewKick=Math.min(.12,viewKick+.045);gunKick=Math.min(.3,gunKick+.045)}feelGrounded=grounded;if(weaponKey!=="knife"&&!reloading&&!cycling){weaponBobTime+=moving?.12:.035;const bob=(moving?1:.18)*((adsMouse||adsKey)?0.25:1);weapon.rotation.z=THREE.MathUtils.lerp(weapon.rotation.z,Math.sin(weaponBobTime)*.018*bob,.22);weapon.rotation.y=Math.sin(weaponBobTime*.5)*.012*bob}else if(weaponKey!=="knife")weapon.rotation.y*=.82},16);
setInterval(()=>{if(!playing||roomMode==='survival'||document.hidden||duelBlocked())return;const tactical=EQUIPMENT.战术道具[equipmentLoadout.战术道具],type=tactical[2].type,now=performance.now();if(type==="jetpack"){if(playing&&!paused&&hp>0&&keys.Space&&equipmentEnergy>0&&!prone&&!carryingObjectiveFlag()){verticalVelocity=Math.min(7,verticalVelocity+1.25);grounded=false;equipmentEnergy=Math.max(0,equipmentEnergy-.5)}else equipmentEnergy=Math.min(100,equipmentEnergy+.1)}const remaining=Math.max(0,equipmentReadyAt-now),value=type==="jetpack"?equipmentEnergy:remaining?Math.max(0,100-remaining/((tactical[2].cooldown||10000)/100)):100;setText("equipmentName",`${tactical[0]} · ${keyLabel(type==="jetpack"?"jump":"tactical")}`);setText("equipmentEnergy",type==="jetpack"?`${Math.floor(equipmentEnergy)}%`:remaining?`${Math.ceil(remaining/1000)}s`:"READY");setWidth("equipmentBar",value)},50);
setInterval(()=>{const active=playing&&!paused&&hp>0&&!spectator&&!duelBlocked()&&insideHealPoint();const status=$("healPointStatus");if(status)status.classList.toggle("active",active&&hp<100);if(active&&hp<100){hp=Math.min(100,hp+4);updateHud();syncNow()}},500);

const towerWorld=towerMap(THREE);scene.add(towerWorld.group);mapWorlds.set('survival',towerWorld);
const towerSurvival=createTowerSurvival({id:()=>playerId,name:()=>$('name').value,send:sendNetwork,paused:()=>paused||!$('survivalLeaderboard').hidden,notice:feed,lock:requestGamePointerLock,unlock:()=>{firing=false;adsMouse=adsKey=false;for(const k of Object.keys(keys))keys[k]=false;if(document.pointerLockElement)document.exitPointerLock()},restart:()=>start(false,'survival'),place:index=>{matchFinished=false;hp=100;$('survivalResult').hidden=true;camera.position.set(index===0?-2:2,TOWER_HEIGHT+1.7,0);pitch=-.6;yaw=0},kill:()=>{showKillToast('丧尸',weaponKey==='knife')},finish:text=>{if(matchFinished)return;matchFinished=true;firing=false;$('survivalResult').hidden=false;$('survivalFinal').textContent=text;$('survivalRetry').disabled=false;$('survivalRetry').textContent='再试一次';if(document.pointerLockElement)document.exitPointerLock()},constrain:(limit,height)=>{camera.position.x=THREE.MathUtils.clamp(camera.position.x,-limit,limit);camera.position.z=THREE.MathUtils.clamp(camera.position.z,-limit,limit);camera.position.y=Math.max(height+playerEyeHeight,camera.position.y)},zombie:()=>{const b=actorMesh(0x6ca65d);Object.assign(b.userData,{team:1,name:'丧尸',hp:100,weapon:'knife',deathCounted:false});for(const k of ['rifle','rifleGlow','heldBlade','heldGuard','heldGrip','helmetShell','helmetVisor','armorPlate'])if(b.userData[k])b.userData[k].removeFromParent();scene.add(b);bots.push(b);return b}});
$('duoSurvival').onclick=()=>{$('survivalDuoDialog').hidden=false};$('survivalDuoClose').onclick=()=>{$('survivalDuoDialog').hidden=true};for(const mode of ['create','join'])$(mode+'Survival').addEventListener('click',()=>{$('survivalDuoDialog').hidden=true;$('roomMapField').hidden=true;$('roomDialogHelp').hidden=true;$('roomMessage').textContent='两人准备后开始'});
let survivalWave=0,survivalPending=null,survivalKills=0,survivalPlayers=1,survivalHost='',lastSurvivalSync=0,survivalRosterKnown=false;const survivalAliveIds=new Set();
const isSurvivalHost=()=>roomMode==='survival'&&online&&survivalHost===playerId;
function clearSurvivalBots(){for(const bot of bots)disposeObject(bot);bots.length=0}
function startSurvival(){survivalSpectating=false;$('survivalWatchControl').hidden=true;hp=100;$('survivalPanel').hidden=false;$('survivalResult').hidden=true;towerSurvival.start(online)}
function updateSurvivalPanel(){setText('survivalWave',`第 ${survivalWave} 波 · 击杀 ${survivalKills}`);setText('survivalRemain',`剩余敌人 ${bots.filter(bot=>bot.visible&&!bot.userData.deathCounted).length}`);setText('survivalPlayers',`队员 ${survivalPlayers} 人 · 下一波 ${Math.min(5+survivalWave+2*(survivalPlayers-1),16)} 名 AI`);if(roomMode==='survival')setText('blueScore',survivalKills)}
function updateSurvivalSpectatorOptions(){const control=$('survivalWatchControl'),select=$('survivalWatchSelect'),ids=[...survivalAliveIds].filter(id=>id!==playerId&&remotes.get(id)?.mesh.visible);control.hidden=!(online&&roomMode==='survival'&&survivalSpectating&&ids.length);if(!ids.length){survivalWatchTarget='';return}if(!ids.includes(survivalWatchTarget))survivalWatchTarget=ids[0];const rosterKey=ids.map(id=>`${id}:${remotes.get(id)?.mesh.userData.name||''}`).join('|');if(select.dataset.rosterKey!==rosterKey){select.replaceChildren();for(const id of ids){const option=document.createElement('option');option.value=id;option.textContent=remotes.get(id)?.mesh.userData.name||id.slice(0,8);select.append(option)}select.dataset.rosterKey=rosterKey}select.value=survivalWatchTarget}
$('survivalWatchSelect').onchange=e=>{survivalWatchTarget=e.target.value};
function spectatorViewPosition(target,yawAngle){const eye=target.clone().add(new THREE.Vector3(0,1.2,0)),desired=new THREE.Vector3(target.x+Math.sin(yawAngle)*3,target.y+1.7,target.z+Math.cos(yawAngle)*3),delta=desired.clone().sub(eye),distance=delta.length();sightRay.set(eye,delta.normalize());sightRay.far=distance;const hit=sightRay.intersectObjects(obstacles,false)[0];if(hit)desired.copy(eye).addScaledVector(delta,Math.max(.35,hit.distance-.2));return desired}
function updateSurvivalSpectatorCamera(dt){if(!survivalSpectating)return;updateSurvivalSpectatorOptions();const target=remotes.get(survivalWatchTarget);if(!target?.mesh.visible)return;const targetYaw=target.targetYaw||target.mesh.rotation.y,desired=spectatorViewPosition(target.mesh.position,targetYaw);if(camera.position.distanceToSquared(desired)>400)camera.position.copy(desired);else camera.position.lerp(desired,1-Math.exp(-dt*5));camera.lookAt(target.mesh.position.x,target.mesh.position.y+1.15,target.mesh.position.z);pitch=camera.rotation.x;yaw=camera.rotation.y}
function resetSurvivalFighter(){survivalSpectating=false;$('survivalWatchControl').hidden=true;hp=hp>0?Math.min(100,hp+35):100;clearWounds();$('respawn').hidden=true;throwCharges=0;nextThrowRefill=0;phase=0;equipmentEnergy=0;equipmentReadyAt=Infinity;resetWeaponRuntime();suppressWeaponStash=true;selectWeapon(slotWeapon(activeWeaponSlot),{equip:false});suppressWeaponStash=false;if(hp===100)camera.position.copy(randomSpawn());syncNow();updateHud()}
function nextSurvivalWave(){if(roomMode!=='survival'||!playing||matchFinished||online&&!isSurvivalHost())return;clearSurvivalBots();survivalWave++;resetSurvivalFighter();spawnBots();if(online){sendNetwork({type:'survivalWave',wave:survivalWave});sendSurvivalBots()}updateSurvivalPanel();feed(`第 ${survivalWave} 波开始 · 按 ${survivalPlayers} 名真人调整为 ${bots.length} 名 AI`)}
function sendSurvivalBots(){if(!isSurvivalHost()||ws?.readyState!==1)return;sendNetwork({type:'survivalBots',wave:survivalWave,bots:bots.map(b=>[b.userData.networkId,Math.round(b.position.x*10)/10,Math.round(b.position.z*10)/10,Math.max(0,Math.round(b.userData.hp)),b.userData.weapon,b.userData.name,b.userData.aiGear?.armor.body||0,b.userData.aiGear?.helmet.head||0,b.userData.slide?2:b.userData.prone?1:0])})}
function updateSurvivalRetry(){const waiting=online&&!isSurvivalHost();$('survivalRetry').textContent=waiting?'等待房主重开':'再试一次';$('survivalRetry').disabled=waiting}
function finishSurvival(){if(matchFinished)return;matchFinished=true;survivalSpectating=false;$('survivalWatchControl').hidden=true;clearTimeout(survivalPending);survivalPending=null;firing=false;$('survivalResult').hidden=false;setText('survivalFinal',`抵达第 ${survivalWave} 波 · 累计击杀 ${survivalKills} 名敌人`);updateSurvivalRetry();if(online&&isSurvivalHost())sendNetwork({type:'survivalEnd',wave:survivalWave});if(document.pointerLockElement===canvas)document.exitPointerLock()}
function restartSurvivalCoop(){if(!isSurvivalHost())return;matchFinished=false;$('survivalResult').hidden=true;clearSurvivalBots();survivalWave=0;survivalKills=0;nextSurvivalWave()}
$('soloSurvival').onclick=()=>{survivalSolo=true;if(navigator.onLine&&accountSession()){pendingRoomMode='survival';$('roomDialog').dataset.mode='create';start(true)}else start(false,'survival')};$('createSurvival').onclick=()=>{survivalSolo=false;pendingRoomMode='survival';openRoomDialog('create')};$('joinSurvival').onclick=()=>{survivalSolo=false;pendingRoomMode='survival';openRoomDialog('join')};$('survivalRetry').onclick=()=>{matchFinished=false;$('survivalResult').hidden=true;towerSurvival.restart()};$('survivalExit').onclick=endMatch;
$('soloAiDuel').onclick=()=>openSoloMapDialog('单挑 AI',()=>{rankedAiTicket='';rankedAiActive=false;start(false,'aiDuel')});
$('aiDuelRetry').onclick=()=>{if(weeklyRun){endMatch();$('openTournaments').click()}else if(rankedAiActive){endMatch();$('openRanked').click()}else start(false,'aiDuel')};
$('aiDuelExit').onclick=endMatch;
function finishAiDuel(){if(weeklyRun){weeklyReport('finish');return}if(roomMode!=='aiDuel'||matchFinished)return;matchFinished=true;firing=false;clearInterval(respawnTimer);respawnTimer=null;$('respawn').hidden=true;$('aiDuelWinner').textContent=rankedAiActive?(score>=10?'排位胜利':'排位失败'):score===redScore?'平局':score>redScore?'你赢了':'AI 获胜';$('aiDuelFinal').textContent=`你 ${score} : ${redScore} ${rankedAiActive?rankedAiName:'猎影 AI'}`;$('aiDuelResult').hidden=false;if(rankedAiActive){const account=accountSession(),ticket=rankedAiTicket,finalScore=score,finalDeaths=redScore;const claim=async(attempt=0)=>{if(!account||!ticket)return;try{const result=await accountApi('matchmaking/ranked',{...account,action:'finishAi',ticket,score:finalScore,deaths:finalDeaths});if(roomMode==='aiDuel'&&rankedAiTicket===ticket)$('aiDuelFinal').textContent+=` · ${result.delta>0?'+':''}${result.delta} 排位分`;void refreshAccountProfile()}catch{if(attempt<12)setTimeout(()=>{void claim(attempt+1)},3000)}};void claim()}if(document.pointerLockElement===canvas)document.exitPointerLock()}
setInterval(()=>{if(weeklyRun&&playing&&weeklyRun.status==='running'){const seconds=Math.max(0,Math.ceil((weeklyRun.stageStarted+weeklyConditions.stageMs-Date.now())/1000));$('aiDuelTimer').textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;if(!seconds&&!weeklyPending)weeklyReport('finish');return}if(roomMode!=='aiDuel'||!playing||paused||matchFinished||document.hidden)return;if(rankedAiActive){$('aiDuelTimer').textContent='先到 10 分';return}aiDuelRemaining=Math.max(0,aiDuelRemaining-1);const seconds=Math.ceil(aiDuelRemaining);$('aiDuelTimer').textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;if(!seconds)finishAiDuel()},1000);
function handleSurvivalMessage(d){return roomMode==='survival'&&online?towerSurvival.message(d):false}
function botDown(bot,killer=$("name").value,killerId=playerId,knife=weaponKey==='knife'&&killerId===playerId){if(roomMode==='survival')return;bot.userData.wounds=Object.create(null);bot.userData.dodgeProneUntil=bot.userData.dodgeHopUntil=0;bot.userData.openingProneUntil=bot.userData.openingHopUntil=bot.userData.openingSlideUntil=bot.userData.openingCooldownUntil=0;bot.userData.closeRushPhase='';bot.userData.flankGoal=bot.userData.flankEntry=null;bot.userData.aimedAtSince=0;bot.userData.moveSlideUntil=0;bot.userData.closeRushCooldownUntil=0;setActorProne(bot,false);setActorSlide(bot,false);if(bot.userData.trainingTarget){bot.visible=false;setTimeout(()=>{if(!playing||!trainingMode||!bots.includes(bot))return;bot.userData.hp=bot.userData.trainingMaxHp||100;bot.visible=true},900);return}if(bot.userData.deathCounted)return;const deathRound=objectiveState?.round;bot.userData.deathCounted=true;bot.visible=false;awardKill(1-bot.userData.team,killer,bot.userData.name);if(roomMode==='survival'){survivalKills++;if(online&&isSurvivalHost()){sendNetwork({type:'survivalBotDown',botId:bot.userData.networkId,target:killerId,weapon:knife?'knife':''});if(killerId===playerId)showKillToast(bot.userData.name,knife)}updateSurvivalPanel();if(bots.every(enemy=>enemy.userData.deathCounted)){feed(`第 ${survivalWave} 波完成 · 4 秒后下一波`);survivalPending=setTimeout(nextSurvivalWave,4000)}return}setTimeout(()=>{if(!playing||matchFinished||!bots.includes(bot)||(isObjectiveMode()&&objectiveState?.round!==deathRound))return;bot.userData.deathCounted=false;bot.userData.hp=100;const spawn=roomMode==='aiDuel'?chooseCompetitiveSpawn(bot.userData.team,bot.userData.lastSpawnIndex??-1,true):{position:randomSpawn(bot.position,bot.userData.team)};bot.userData.lastSpawnIndex=spawn.index;bot.position.set(spawn.position.x,0,spawn.position.z);bot.visible=true},2600)}
let duelNavigator=null,duelNavigatorMap='',duelNavigatorColliderCount=-1;
function duelRoute(bot,goal,now,purpose){if(!duelNavigator||duelNavigatorMap!==activeMapId||duelNavigatorColliderCount!==obstacles.length){duelNavigator=createObjectiveNavigator(blocked,activeMapId==='bomb'||activeMapId==='extraction',activeMapId==='extraction'?EXTRACTION_LIMIT:BOMB_MAP_LIMIT);duelNavigatorMap=activeMapId;duelNavigatorColliderCount=obstacles.length}return duelNavigator.direction(`${bot.uuid}:${purpose}`,bot.position.toArray(),goal.toArray(),now)}
function botCanDiscover(bot,target,now){
  const s=bot.userData,p=target.position,dx=p.x-bot.position.x,dz=p.z-bot.position.z,distance=Math.hypot(dx,dz);
  if(now<(s.blindUntil||0)||distance>65)return false;const front=(-Math.sin(bot.rotation.y)*dx-Math.cos(bot.rotation.y)*dz)/Math.max(distance,.001)>.22;
  if(!front)return false;
  const origin=bot.position.clone().setY(bot.position.y+1.3),torso=p.clone().setY(p.y+(target.kind==='player'?-.5:.9));return hasLineOfSight(origin,torso,roomMode==='aiDuel'&&aiDuelLevel!=='normal');
}
function botPatrolLook(bot,goal,now){
  const s=bot.userData;s.patrolScanAt??=now+700+(bot.id%7)*130;
  if(now>=s.patrolScanAt){const offsets=[-1.35,1.35,Math.PI];s.patrolScanStep=(s.patrolScanStep??-1)+1;s.patrolScanOffset=offsets[s.patrolScanStep%offsets.length];s.patrolScanUntil=now+650;s.patrolScanAt=now+1700+(bot.id%5)*170}
  const offset=now<(s.patrolScanUntil||0)?s.patrolScanOffset:0,dx=goal.x-bot.position.x,dz=goal.z-bot.position.z,length=Math.hypot(dx,dz),x=length>.05?dx/length:-Math.sin(bot.rotation.y),z=length>.05?dz/length:-Math.cos(bot.rotation.y),c=Math.cos(offset),v=Math.sin(offset);
  const point=s.patrolLookPoint??=new THREE.Vector3();return point.set(bot.position.x+(x*c+z*v)*6,bot.position.y,bot.position.z+(z*c-x*v)*6);
}
function duelAwareness(bot,target,now){
  const profile=bot.userData.extractionProfile|| (roomMode==='aiDuel'?aiDuelLevel:'advanced');
  const close=bot.position.distanceTo(target.position)<6,reaction=roomMode==='extraction'?(close?80:profile==='normal'?240:profile.startsWith('master')?120:170):close?40:profile==='normal'?140:profile.startsWith('master')?55:90;
  const targetKey=target.kind==='player'?'player':target.kind==='remote'?`remote:${target.id}`:`bot:${target.mesh?.uuid}`;
  if(bot.userData.awarenessTarget!==targetKey){bot.userData.awarenessTarget=targetKey;bot.userData.targetVisible=false;bot.userData.lastSeenPosition=null;bot.userData.searchPoint=null;bot.userData.sightReadyAt=now+reaction;bot.userData.nextSightScan=0;bot.userData.sightCached=false}
  const state=bot.userData,blind=now<(state.blindUntil||0),scanDue=now>=(state.nextSightScan||0),muzzle=state.sightMuzzle||(state.sightMuzzle=new THREE.Vector3()),torso=state.sightTorso||(state.sightTorso=new THREE.Vector3());
  muzzle.copy(bot.position).setY(state.prone?.55:state.slide?.72:1.35);
  torso.copy(target.position).setY(target.position.y+(target.kind==='player'?(target.prone?-.1:-.45):(target.prone?.38:.9)));
  if(scanDue){state.sightCached=!blind&&botCanDiscover(bot,target,now);state.nextSightScan=now+60+(bot.id%4)*10}
  const visible=!blind&&!!state.sightCached;
  if(visible){if(!bot.userData.targetVisible&&now-(bot.userData.lastSeenAt||0)>250)bot.userData.sightReadyAt=now+reaction;bot.userData.targetVisible=true;if(bot.userData.lastSeenPosition)bot.userData.lastSeenPosition.copy(target.position);else bot.userData.lastSeenPosition=target.position.clone();bot.userData.lastSeenAt=now;bot.userData.searchPoint=null;return {visible,chase:target.position}}
  bot.userData.targetVisible=false;
  if(now-(bot.userData.lastSeenAt||0)>12000)bot.userData.lastSeenPosition=null;
  const last=bot.userData.lastSeenPosition;
  if(last&&bot.position.distanceTo(last)>3)return {visible,chase:last};
  if(!bot.userData.searchPoint||now>(bot.userData.searchUntil||0)||bot.position.distanceTo(bot.userData.searchPoint)<2){
    const center=last||new THREE.Vector3(healPoint.x,0,healPoint.z);
    for(let i=0;i<10;i++){const angle=Math.random()*Math.PI*2,radius=last?4+Math.random()*8:6+Math.random()*2,x=center.x+Math.cos(angle)*radius,z=center.z+Math.sin(angle)*radius;if(!blocked(x,z)){bot.userData.searchPoint=new THREE.Vector3(x,0,z);break}}
    bot.userData.searchUntil=now+2200;
  }
  return {visible,chase:bot.userData.searchPoint||last||new THREE.Vector3(healPoint.x+7,0,healPoint.z)};
}
function duelCoverGoal(bot,threat){
  const eye=threat.position.clone().setY(threat.position.y-.3);let best=null,bestDistance=Infinity;
  for(const obstacle of obstacles){const bounds=obstacle.userData.bounds;if(!bounds||bounds.maxY<1.4)continue;
    const cx=(bounds.minX+bounds.maxX)/2,cz=(bounds.minZ+bounds.maxZ)/2;if(Math.hypot(bot.position.x-cx,bot.position.z-cz)>17)continue;
    const dx=eye.x-cx,dz=eye.z-cz,point=Math.abs(dx)>Math.abs(dz)?new THREE.Vector3(dx>0?bounds.minX-1.1:bounds.maxX+1.1,0,cz):new THREE.Vector3(cx,0,dz>0?bounds.minZ-1.1:bounds.maxZ+1.1);
    if(blocked(point.x,point.z)||hasLineOfSight(eye,point.clone().setY(1.2),true))continue;
    const distance=bot.position.distanceTo(point);if(distance<bestDistance){best=point;bestDistance=distance}
  }
  return best;
}
function botFlankRoute(bot,target,now){
  const state=bot.userData;
  const remote=target.kind==='remote'?remotes.get(target.id):null;
  const playerTarget=target.kind==='player'||!!remote;
  const targetId=target.kind==='player'?'player':target.kind==='remote'?target.id:'';
  if(state.flankGoal){
    if(now>=state.flankUntil||!playerTarget||state.flankTargetId!==targetId||target.kind==='player'&&hp<=0||target.position.distanceTo(state.flankAnchor)>14){state.flankGoal=null;state.flankEntry=null;state.flankCooldownUntil=now+5500}
    else if(state.flankEntry&&bot.position.distanceTo(state.flankEntry)<3)state.flankEntry=null;
    else if(!state.flankEntry&&bot.position.distanceTo(state.flankGoal)<4){state.flankGoal=null;state.flankCooldownUntil=now+6500}
  }
  if(!playerTarget||state.flankGoal||now<(state.flankCooldownUntil||0)||now<(state.nextFlankCheck||0)||state.hp<45||state.ammoLeft<=0)return state.flankEntry||state.flankGoal;
  state.nextFlankCheck=now+250;
  const observer=target.kind==='player'?camera.position:remote.mesh.position.clone().setY(1.7),heading=target.kind==='player'?yaw:remote.mesh.rotation.y;
  if(state.aimedTargetId!==targetId){state.aimedTargetId=targetId;state.aimedAtSince=0}
  const dx=bot.position.x-observer.x,dz=bot.position.z-observer.z,distance=Math.hypot(dx,dz);
  if(distance<9||distance>43){state.aimedAtSince=0;return null}
  const forwardX=-Math.sin(heading),forwardZ=-Math.cos(heading),aimDot=(dx*forwardX+dz*forwardZ)/distance;
  if(aimDot<.94||!hasLineOfSight(observer,bot.position.clone().setY(1.25))){state.aimedAtSince=0;return null}
  state.aimedAtSince ||= now;
  if(now-state.aimedAtSince<650)return null;
  state.aimedAtSince=0;state.flankCooldownUntil=now+8500+Math.random()*4500;
  if(bots.filter(other=>other!==bot&&other.visible&&other.userData.flankGoal).length>=2||Math.random()>.38)return null;
  const limit=roomMode==='extraction'?EXTRACTION_LIMIT:isBombMode()?200:47,sideX=-forwardZ,sideZ=forwardX,choices=[];
  for(const sign of [state.strafe||1,-(state.strafe||1)])for(const spread of [17,22]){
    const entry=new THREE.Vector3(observer.x+sideX*spread*sign+forwardX*3,0,observer.z+sideZ*spread*sign+forwardZ*3);
    const goal=new THREE.Vector3(observer.x+sideX*spread*.72*sign-forwardX*12,0,observer.z+sideZ*spread*.72*sign-forwardZ*12);
    if(Math.abs(entry.x)>limit||Math.abs(entry.z)>limit||Math.abs(goal.x)>limit||Math.abs(goal.z)>limit||blocked(entry.x,entry.z)||blocked(goal.x,goal.z))continue;
    const hiddenEntry=!hasLineOfSight(observer,entry.clone().setY(1.25),true),hiddenGoal=!hasLineOfSight(observer,goal.clone().setY(1.25),true);
    choices.push({entry,goal,score:(hiddenEntry?30:0)+(hiddenGoal?18:0)-bot.position.distanceTo(entry)*.25+Math.random()*4});
  }
  if(!choices.length)return null;
  choices.sort((a,b)=>b.score-a.score);
  state.flankEntry=choices[0].entry;state.flankGoal=choices[0].goal;state.flankAnchor=target.position.clone();state.flankTargetId=targetId;state.flankUntil=now+9000;
  return state.flankEntry;
}
function updateBotMoveSlide(bot,target,now,canStart){
  const state=bot.userData;
  if(roomMode==='extraction')return false;
  if(now<(state.moveSlideUntil||0)){
    const direction=state.moveSlideDirection;
    if(!direction||blockedForProneBot(bot.position.x+direction.x*1.2,bot.position.z+direction.z*1.2,Math.atan2(-direction.x,-direction.z))){state.moveSlideUntil=0;return false}
    return true;
  }
  if(!canStart||now<(state.moveSlideCooldownUntil||0)||now<(state.nextMoveSlideCheck||0)||state.prone||state.slide||state.moveVelocity.lengthSq()<12)return false;
  state.nextMoveSlideCheck=now+450;
  const remote=target.kind==='remote'?remotes.get(target.id):null;
  if(target.kind!=='player'&&!remote)return false;
  const observer=target.kind==='player'?camera.position:remote.mesh.position.clone().setY(1.7),heading=target.kind==='player'?yaw:remote.mesh.rotation.y;
  const dx=bot.position.x-observer.x,dz=bot.position.z-observer.z,distance=Math.hypot(dx,dz);
  if(distance<7||distance>38||(-Math.sin(heading)*dx-Math.cos(heading)*dz)/distance<.88||!hasLineOfSight(observer,bot.position.clone().setY(1.1))||Math.random()>.52)return false;
  if(bots.filter(other=>other!==bot&&other.visible&&now<(other.userData.moveSlideUntil||0)).length>=3)return false;
  const direction=state.moveVelocity.clone().setY(0).normalize(),angle=Math.atan2(-direction.x,-direction.z);
  const limit=isBombMode()?200:47;
  for(const step of [1.8,3.6]){const x=bot.position.x+direction.x*step,z=bot.position.z+direction.z*step;if(Math.abs(x)>limit||Math.abs(z)>limit||blockedForProneBot(x,z,angle))return false}
  state.moveSlideDirection=direction;state.moveSlideUntil=now+760;state.moveSlideCooldownUntil=now+3900+Math.random()*1700;
  return true;
}
function animateBotStride(bot,dt,speed,sprinting){
  if(bot.userData.prone||bot.userData.slide||!bot.userData.leftLeg)return;
  const motion=THREE.MathUtils.clamp(speed/5,0,1),cadence=sprinting?17:11;
  bot.userData.walkPhase+=dt*cadence*motion;
  const stride=Math.sin(bot.userData.walkPhase)*(sprinting?.72:.48)*motion;
  bot.userData.leftLeg.rotation.x=stride;bot.userData.rightLeg.rotation.x=-stride;
  bot.userData.leftArm.rotation.x=-.72-stride*.28;bot.userData.rightArm.rotation.x=-.72+stride*.28;
}
function updateBots(dt){
 if(roomMode==='survival')return;
  if(roomMode==='extraction'&&!extractionHost){for(const b of bots)if(b.visible&&b.userData.syncTarget)b.position.lerp(b.userData.syncTarget,1-Math.exp(-dt*12));return}
  if(online&&roomMode==='survival'&&!isSurvivalHost()){for(const bot of bots)if(bot.userData.syncTarget){const oldX=bot.position.x,oldZ=bot.position.z;bot.position.lerp(bot.userData.syncTarget,Math.min(1,dt*11));const speed=Math.hypot(bot.position.x-oldX,bot.position.z-oldZ)/Math.max(dt,.001);animateBotStride(bot,dt,speed,speed>6.5)}return}
  const now=performance.now();
  for(const b of bots){
    if(matchFinished)return;
    if(isBombMode()&&bombState?.phase==='prep'&&b.userData.team===bombState.attackTeam)continue;
      if(!b.visible||b.userData.removed){if(roomMode==='aiDuel'&&!b.visible){b.userData.targetVisible=false;b.userData.lastSeenPosition=null;b.userData.searchPoint=null}continue;}
    if(!Number.isFinite(b.position.x)||!Number.isFinite(b.position.y)||!Number.isFinite(b.position.z)||!Number.isFinite(b.quaternion.x)||!Number.isFinite(b.quaternion.y)||!Number.isFinite(b.quaternion.z)||!Number.isFinite(b.quaternion.w)){
      const spawn=randomSpawn(undefined,b.userData.team);b.position.set(spawn.x,0,spawn.z);b.quaternion.identity();b.userData.moveVelocity.set(0,0,0);b.userData.target=null;b.userData.rethink=0;b.userData.dodgeSide=b.userData.strafe||1;b.userData.closeRushPhase='';b.userData.openingProneUntil=b.userData.openingHopUntil=0;setActorProne(b,false);setActorSlide(b,false);continue;
    }
    if(b.userData.trainingTarget){if(b.userData.motion){b.userData.motionTime+=dt;b.position.x=b.userData.homeX+Math.sin(b.userData.motionTime*1.25)*1.3}continue}
    if(roomMode==='extraction'){if(updateExtractionLoot(b,extractionClient.markers(),now,new THREE.Vector3(EXTRACTION_AI_EXIT[0],0,EXTRACTION_AI_EXIT[1])))extractionClient.syncWorld();if(!b.visible)continue}
    if(b.userData.knockback?.lengthSq()>0.02){const push=b.userData.knockback.clone().multiplyScalar(dt),nextX=b.position.x+push.x,nextZ=b.position.z+push.z;if(!(b.userData.prone?blockedForProneBot(nextX,b.position.z,b.rotation.y):blocked(nextX,b.position.z)))b.position.x=nextX;else b.userData.knockback.x=0;if(!(b.userData.prone?blockedForProneBot(b.position.x,nextZ,b.rotation.y):blocked(b.position.x,nextZ)))b.position.z=nextZ;else b.userData.knockback.z=0;b.userData.knockback.multiplyScalar(Math.max(0,1-dt*3.5))}
    b.userData.rethink-=dt;
    if(roomMode==='aiDuel'&&aiDuelLevel!=='normal'&&b.userData.rethink>.12)b.userData.rethink=.12;
    if(b.userData.rethink<=0){
    const candidates=[];
    if(hp>0&&b.userData.team!==playerTeam&&!(roomMode==='normal'&&!online&&now<soloNoAttackUntil))candidates.push({kind:"player",position:camera.position,name:$("name").value,prone:playerLowProfile()});
    for(const other of bots)if(other!==b&&other.visible&&other.userData.team!==b.userData.team)candidates.push({kind:"bot",position:other.position,mesh:other,name:other.userData.name});
    for(const [id,r] of remotes)if(r.mesh.visible&&r.mesh.userData.team!==b.userData.team)candidates.push({kind:"remote",position:r.mesh.position,id,name:r.mesh.userData.name,prone:r.mesh.userData.prone||r.mesh.userData.slide});
      candidates.sort((a,c)=>objectiveTargetPriority(a,b)-objectiveTargetPriority(c,b)||b.position.distanceTo(a.position)-b.position.distanceTo(c.position));
      const discovered=candidates.filter(c=>botCanDiscover(b,c,now)),nearby=discovered.filter(c=>b.position.distanceTo(c.position)<48),prior=b.userData.target,priorRemote=prior?.kind==='remote'?remotes.get(prior.id):null,holdPlayer=prior?.kind==='player'&&hp>0&&b.userData.team!==playerTeam&&!(roomMode==='normal'&&!online&&now<soloNoAttackUntil)||prior?.kind==='remote'&&priorRemote?.mesh.visible&&priorRemote.mesh.userData.team!==b.userData.team;
      if(holdPlayer&&prior.kind==='player'){prior.position=camera.position;prior.prone=playerLowProfile();prior.name=$("name").value}
      b.userData.target=holdPlayer&&now-(b.userData.lastSeenAt||0)<3000?prior:nearby.length?(Math.random()<b.userData.skill?nearby[0]:nearby[Math.floor(Math.random()*Math.min(nearby.length,3))]):discovered[0];
      b.userData.rethink=roomMode==='aiDuel'&&aiDuelLevel!=='normal'?Math.min(.1,DUEL_AI_PROFILES[aiDuelLevel]?.rethink??.1):b.userData.extractionProfile==='normal'?.14:.1;if(roomMode!=='aiDuel'||!b.userData.targetVisible||Math.random()<.15)b.userData.strafe=Math.random()<.5?-1:1;
    }
    const target=isObjectiveMode()?(objectiveCombatTarget(b,now)||{kind:"objective",position:objectiveBotGoal(b)}):isBombMode()?(bombState?.phase==='prep'?{kind:"objective",position:bombBotGoal(b)}:bombCombatTarget(b,now)||{kind:"objective",position:bombBotGoal(b)}):b.userData.target;
    if(target?.kind==='objective'){b.userData.targetVisible=false;b.userData.flankGoal=null;b.userData.flankEntry=null}
    if(target&&(target.kind==='player'&&(hp<=0||roomMode==='normal'&&!online&&now<soloNoAttackUntil)||target.kind==='bot'&&!target.mesh.visible||target.kind==='remote'&&!remotes.get(target.id)?.mesh.visible)){b.userData.target=null;b.userData.rethink=0;continue}
    if(!target){
      b.userData.targetVisible=false;
      b.userData.openingProneUntil=b.userData.openingHopUntil=b.userData.openingSlideUntil=b.userData.moveSlideUntil=0;b.userData.closeRushPhase='';setActorSlide(b,false);
      if(b.userData.prone)setActorProne(b,false);
      if(b.position.distanceTo(b.userData.wander)<2)b.userData.wander=randomSpawn(b.position);
      const wanderDistance=b.position.distanceTo(b.userData.wander),wanderSprint=wanderDistance>14,wanderDir=b.userData.wander.clone().sub(b.position).setY(0).normalize(),wanderSpeed=(wanderSprint?8.3:3.4)*(b.userData.aiGear?.armor.speed||1)*(b.userData.aiGear?.helmet.speed||1);if(roomMode==='extraction'){const route=duelRoute(b,b.userData.wander,now,'loot');wanderDir.set(route[0],0,route[1])}b.userData.moveVelocity.lerp(wanderDir.multiplyScalar(wanderSpeed),1-Math.exp(-dt*(wanderSprint?5:3.5)));botLookHelper.position.copy(b.position);botLookHelper.lookAt(botPatrolLook(b,b.userData.wander,now));b.quaternion.slerp(botLookHelper.quaternion,1-Math.exp(-dt*5));const wanderStep=b.userData.moveVelocity.clone().multiplyScalar(dt),wanderX=b.position.x,wanderZ=b.position.z;if(!blocked(b.position.x+wanderStep.x,b.position.z))b.position.x+=wanderStep.x;if(!blocked(b.position.x,b.position.z+wanderStep.z))b.position.z+=wanderStep.z;animateBotStride(b,dt,Math.hypot(b.position.x-wanderX,b.position.z-wanderZ)/Math.max(dt,.001),wanderSprint);continue;
    }
    const aiDuel=roomMode==='aiDuel',wasVisible=!!b.userData.targetVisible,priorAwarenessTarget=b.userData.awarenessTarget,awareness=target.kind!=='objective'?duelAwareness(b,target,now):null,chasePosition=awareness?.chase||target.position;
    const flankGoal=target.kind!=='objective'&&(b.userData.flankGoal||awareness?.visible)?botFlankRoute(b,target,now):null;
    const work=b.userData.work||={to:new THREE.Vector3(),side:new THREE.Vector3(),move:new THREE.Vector3(),step:new THREE.Vector3(),away:new THREE.Vector3(),muzzle:new THREE.Vector3(),targetPoint:new THREE.Vector3(),impact:new THREE.Vector3()},to=work.to.copy(chasePosition).sub(b.position),dist=to.length();
    useBotTactical(b,target,dist,now);
    const advancedFighter=!aiDuel||aiDuelLevel!=='normal';
    if(aiDuel&&b.userData.secondaryWeapon&&target.kind!=='objective'&&now>=(b.userData.weaponSwitchUntil||0)){
      const current= b.userData.weapon, secondary=b.userData.secondaryWeapon;
      const shouldUseSecondary=secondary==='frost'?(dist>22):(current==='frost'&&dist<17);
      if(shouldUseSecondary&&current!==secondary)switchBotWeapon(b,secondary,now);
      else if(!shouldUseSecondary&&current==='frost'&&secondary!=='frost')switchBotWeapon(b,secondary,now);
    }
    if(roomMode!=='extraction'&&awareness?.visible&&(!wasVisible||b.userData.awarenessTarget!==priorAwarenessTarget)&&dist>3&&dist<34&&now>=(b.userData.openingCooldownUntil||0)&&now>=(b.userData.moveSlideUntil||0)&&!blockedForProneBot(b.position.x,b.position.z,b.rotation.y)){
      b.userData.openingCooldownUntil=now+5000;
      if(roomMode!=='normal'||online||Math.random()<.3){
        const style=Math.random()<.5?'prone':'slide';
        b.userData.openingStyle=style;
        b.userData.openingProneUntil=style==='prone'?now+1050:0;
        b.userData.openingSlideUntil=style==='slide'?now+800:0;
        if(style==='slide')b.userData.moveSlideCooldownUntil=now+3400;
        b.userData.openingMinUntil=now+330;
        b.userData.openingShotsRemaining=2;
        b.userData.openingHopUntil=0;
      }
    }
    const openingProne=awareness?.visible&&now<(b.userData.openingProneUntil||0)&&((b.userData.openingShotsRemaining||0)>0||now<(b.userData.openingMinUntil||0));
    if(!openingProne&&b.userData.openingProneUntil){b.userData.openingProneUntil=0;b.userData.openingHopUntil=advancedFighter&&awareness?.visible?now+900:0;b.userData.hopNextAt=now}
    const openingHopping=advancedFighter&&awareness?.visible&&now<(b.userData.openingHopUntil||0),openingSliding=awareness?.visible&&now<(b.userData.openingSlideUntil||0),moveSliding=updateBotMoveSlide(b,target,now,!!awareness?.visible&&!openingProne&&!openingSliding&&now>=(b.userData.dodgeProneUntil||0)),closeSliding=openingSliding||moveSliding,dodgeProne=!closeSliding&&(aiDuel&&now<(b.userData.dodgeProneUntil||0)||openingProne),dodgeHopping=aiDuel&&now>=(b.userData.dodgeProneUntil||0)&&now<(b.userData.dodgeHopUntil||0)||openingHopping;
    if(dodgeProne)setActorProne(b,true);
    else if(b.userData.prone)setActorProne(b,false);
    if(closeSliding){setActorProne(b,false);setActorSlide(b,true)}else if(b.userData.slide)setActorSlide(b,false);
    if(aiDuel&&awareness?.visible&&dist<29&&now>b.userData.smokeReadyAt){const toward=target.position.clone().sub(b.position).setY(0).normalize(),origin=b.position.clone().add(new THREE.Vector3(0,1.5,0)),vel=toward.multiplyScalar(10);vel.y=5;makeThrownItem(crypto.randomUUID(),'ai-duel','smoke',origin,vel,true);b.userData.smokeReadyAt=now+15000+Math.random()*5000}
    to.y=0;to.normalize();
    botLookHelper.position.copy(b.position);if(moveSliding)botLookHelper.lookAt(b.position.x+b.userData.moveSlideDirection.x*5,b.position.y,b.position.z+b.userData.moveSlideDirection.z*5);else if(awareness?.visible)botLookHelper.lookAt(chasePosition.x,b.position.y,chasePosition.z);else botLookHelper.lookAt(botPatrolLook(b,chasePosition,now));if(b.userData.prone){work.previousQuaternion??=new THREE.Quaternion();work.previousQuaternion.copy(b.quaternion)}b.quaternion.slerp(botLookHelper.quaternion,1-Math.exp(-dt*(aiDuel?Math.max(12,DUEL_AI_PROFILES[aiDuelLevel]?.turn??12):14)));if(b.userData.prone&&blockedForProneBot(b.position.x,b.position.z,b.rotation.y))b.quaternion.copy(work.previousQuaternion);
    const side=work.side.set(-to.z,0,to.x),move=work.move.set(0,0,0),preferred=b.userData.preferredDistance+(b.userData.hp<40?8:0),hurtForHeal=roomMode!=="extraction"&&b.userData.hp<100,healDelta=new THREE.Vector3(healPoint.x-b.position.x,0,healPoint.z-b.position.z),healDistance=healDelta.length();
    const duelReloading=b.userData.ammoLeft<=0&&now<b.userData.reloadUntil&&awareness?.visible;
    if(duelReloading&&(!b.userData.reloadCoverGoal||now>(b.userData.reloadCoverUntil||0))){b.userData.reloadCoverGoal=duelCoverGoal(b,target);b.userData.reloadCoverUntil=now+1200}
    if(duelReloading&&b.userData.reloadCoverGoal){const dir=duelRoute(b,b.userData.reloadCoverGoal,now,'cover');move.set(dir[0],0,dir[1])}
    else if(hurtForHeal&&healDistance>healPoint.radius-1){const ringPoint=b.position.clone().sub(new THREE.Vector3(healPoint.x,0,healPoint.z)).setY(0).normalize().multiplyScalar(6.8).add(new THREE.Vector3(healPoint.x,0,healPoint.z)),dir=duelRoute(b,ringPoint,now,'heal');move.set(dir[0],0,dir[1])}
    else if(flankGoal){const dir=duelRoute(b,flankGoal,now,'flank');move.set(dir[0],0,dir[1])}
    else if(awareness&&!awareness.visible){const dir=duelRoute(b,chasePosition,now,'search');move.set(dir[0],0,dir[1])}
    else{if(dist>preferred+3)move.addScaledVector(to,.65+b.userData.aggression);else if(dist<preferred-3)move.sub(to);move.addScaledVector(side,b.userData.strafe*(.35+b.userData.aggression*.65))}
    const directDuelAttack=roomMode!=='extraction'&&awareness?.visible&&!flankGoal&&dist>2&&dist<34;
    if(directDuelAttack&&!dodgeProne&&!closeSliding){setActorProne(b,false);if(now>=b.userData.hopNextAt){b.userData.hopUntil=now+420;b.userData.hopNextAt=now+(dodgeHopping?440:530+Math.random()*120);if(dodgeHopping){b.userData.dodgeSide=-(b.userData.dodgeSide||b.userData.strafe||1);b.userData.dodgeSwitchAt=now}}if(now>=b.userData.phaseReadyAt&&dist>9&&dist<27&&b.userData.hp>38&&!dodgeHopping){const dash=b.userData.moveVelocity.lengthSq()>.1?b.userData.moveVelocity.clone().setY(0).normalize():to.clone(),startX=b.position.x,startZ=b.position.z;for(let n=.5;n<=8;n+=.5){const limit=roomMode==='extraction'?EXTRACTION_LIMIT:isBombMode()?206:50,x=THREE.MathUtils.clamp(startX+dash.x*n,-limit,limit),z=THREE.MathUtils.clamp(startZ+dash.z*n,-limit,limit);if(blocked(x,z))break;b.position.x=x;b.position.z=z}if(Math.hypot(b.position.x-startX,b.position.z-startZ)>1){b.userData.phaseReadyAt=now+11000+Math.random()*3000;b.userData.phaseFlashUntil=now+280}else b.userData.phaseReadyAt=now+800}}
    if(dodgeHopping&&directDuelAttack)move.addScaledVector(side,(b.userData.dodgeSide||b.userData.strafe||1)*2.3);
    if(isObjectiveMode()&&!flankGoal){const dir=objectiveBotDirection(b);move.set(dir[0],0,dir[1]);}if(isBombMode()&&target.kind==='objective'){const goal=bombBotGoal(b),dir=duelRoute(b,goal,now,'bomb');move.set(dir[0],0,dir[1]);}for(const other of bots)if(other!==b&&other.visible){const away=work.away.copy(b.position).sub(other.position);if(away.lengthSq()<6&&away.lengthSq()>.001)move.addScaledVector(away.normalize(),1.4)}if(moveSliding)move.copy(b.userData.moveSlideDirection);else if(closeSliding&&!flankGoal){if(dist>1.9)move.copy(to);else move.set(0,0,0)}
    const botGear=b.userData.aiGear,farFromFight=dist>preferred+7,urgentRoute=duelReloading&&!!b.userData.reloadCoverGoal||hurtForHeal&&healDistance>healPoint.radius+4,goalRun=target.kind==='objective'&&dist>7,searchRun=awareness&&!awareness.visible&&dist>10,sprinting=!b.userData.prone&&(urgentRoute||goalRun||searchRun||!!flankGoal||farFromFight&&!!awareness?.visible),speedFactor=(botGear?.armor.speed||1)*(botGear?.helmet.speed||1)*(now<(botGear?.adrenalineUntil||0)?1.28:1)*(botWounded(b,"leg",now)?.72:1)*(botWounded(b,"body",now)?.8:1)*(botWounded(b,"abdomen",now)?.92:1)*(b.userData.prone?.45:1),desiredVelocity=move.lengthSq()?move.normalize().multiplyScalar((closeSliding?15:sprinting?10.2:5.7)*speedFactor):move;b.userData.moveVelocity.lerp(desiredVelocity,1-Math.exp(-dt*(sprinting?5:8)));const step=work.step.copy(b.userData.moveVelocity).multiplyScalar(dt),oldX=b.position.x,oldZ=b.position.z,nextX=oldX+step.x,nextZ=oldZ+step.z;
    const botBlocked=(x,z)=>(b.userData.prone||b.userData.slide)?blockedForProneBot(x,z,b.rotation.y):blocked(x,z);let hitWall=false;if(!botBlocked(nextX,oldZ))b.position.x=nextX;else{hitWall=true;b.userData.moveVelocity.x*=-.2}if(!botBlocked(b.position.x,nextZ))b.position.z=nextZ;else{hitWall=true;b.userData.moveVelocity.z*=-.2}
    if(hitWall){b.userData.strafe*=-1;const escape=side.multiplyScalar(b.userData.strafe*dt*1.8),escapeX=b.position.x+escape.x,escapeZ=b.position.z+escape.z;if(!botBlocked(escapeX,b.position.z))b.position.x=escapeX;if(!botBlocked(b.position.x,escapeZ))b.position.z=escapeZ}
    b.position.x=THREE.MathUtils.clamp(b.position.x,roomMode==='extraction'?-EXTRACTION_LIMIT:isBombMode()?-206:-50,roomMode==='extraction'?EXTRACTION_LIMIT:isBombMode()?206:50);b.position.z=THREE.MathUtils.clamp(b.position.z,roomMode==='extraction'?-EXTRACTION_LIMIT:isBombMode()?-206:-50,roomMode==='extraction'?EXTRACTION_LIMIT:isBombMode()?206:50);
    animateBotStride(b,dt,Math.hypot(b.position.x-oldX,b.position.z-oldZ)/Math.max(dt,.001),sprinting);if(!b.userData.prone&&!b.userData.slide&&b.userData.pose)b.userData.pose.position.y=now<b.userData.hopUntil?Math.sin(Math.PI*(1-(b.userData.hopUntil-now)/420))*.62:0;b.userData.armorPlate.material.emissive.setHex(now<(b.userData.phaseFlashUntil||0)?0x7432aa:0);
    if(hurtForHeal&&healDistance<=healPoint.radius){b.userData.healTickAt??=now;if(now>=b.userData.healTickAt){b.userData.hp=Math.min(100,b.userData.hp+4);b.userData.healTickAt=now+500}}else b.userData.healTickAt=now+500;
    b.userData.cooldown-=dt;if(b.userData.ammoLeft<=0&&now>=b.userData.reloadUntil){const amount=Math.min(b.userData.extractionStats?.mag||WEAPONS[b.userData.weapon].mag,roomMode==='extraction'?b.userData.extractionReserve:Infinity);b.userData.ammoLeft=amount;if(roomMode==='extraction')b.userData.extractionReserve-=amount;}
    const muzzle=work.muzzle.copy(b.position),targetHeight=target.kind==="player"?(target.prone?-.1:-.45):(target.prone?.38:.9),targetPoint=work.targetPoint.copy(target.position);muzzle.y+=b.userData.prone?.55:b.userData.slide?.72:1.35;targetPoint.y+=targetHeight;const shotDistance=muzzle.distanceTo(targetPoint),throughSmoke=aiDuel&&smokeBlocks(muzzle,targetPoint);
    if(awareness?.visible&&now>=(b.userData.blindUntil||0)&&target.kind!=="objective"&&!(aiDuel&&target.kind==='player'&&now<aiDuelNoAttackUntil)&&!(roomMode==='normal'&&!online&&target.kind==='player'&&now<soloNoAttackUntil)&&shotDistance<WEAPONS[b.userData.weapon].range&&b.userData.cooldown<0&&(b.userData.ammoLeft??1)>0&&now>=(b.userData.sightReadyAt||0)&&b.quaternion.angleTo(botLookHelper.quaternion)<(aiDuel&&aiDuelLevel!=='normal'?.55:.35)&&hasLineOfSight(muzzle,targetPoint,aiDuel&&aiDuelLevel!=='normal')){
      const aiGun=b.userData.weapon,isAuto=WEAPONS[aiGun].auto;
      b.userData.cooldown=(b.userData.extractionStats?.interval||WEAPONS[aiGun].interval)/1000;
      if(--b.userData.ammoLeft<=0)b.userData.reloadUntil=now+(b.userData.extractionStats?.reload||WEAPONS[aiGun].reload);
      if(openingProne)b.userData.openingShotsRemaining=Math.max(0,(b.userData.openingShotsRemaining||0)-1);
      if(!isAuto)b.userData.burstPauseUntil=now+(aiGun==="gale"?180+(1-b.userData.skill)*420:aiGun==="frost"?300+(1-b.userData.skill)*380:700);
      const stability=now<(b.userData.aiGear?.stabilizerUntil||0)?1.18:1,distanceRatio=THREE.MathUtils.clamp((shotDistance-4)/50,0,1);
      const weaponNear=aiGun==='frost'?.86:aiGun==='gale'?.89:aiGun==='meteor'?.9:.92,nearAim=weaponNear*(.7+b.userData.skill*.38),farAim=.34+b.userData.skill*(aiGun==='frost'?.2:aiGun==='gale'?.18:.16),movingPenalty=b.userData.moveVelocity.lengthSq()>4?.11*(1-b.userData.skill*.65):0;
      let sustainedPlayerMotion=false;
      if(target.kind==='player'){
        const playerPos=target.position,motionDelta=playerPos.distanceTo(b.userData.lastPlayerPosition||playerPos);
        if(motionDelta>.18){if(!b.userData.playerMoving)b.userData.playerMotionSince=now;b.userData.playerMoving=true}else b.userData.playerMoving=false;
        b.userData.lastPlayerPosition.copy(playerPos);sustainedPlayerMotion=b.userData.playerMoving&&now-(b.userData.playerMotionSince||now)>600;
      }
      const rawHitChance=THREE.MathUtils.lerp(nearAim,farAim,distanceRatio)-movingPenalty;
      const aiProfile=DUEL_AI_PROFILES[b.userData.extractionProfile||aiDuelLevel]||DUEL_AI_PROFILES.advanced,duelAim=aiDuel||roomMode==='extraction'?aiProfile.aim:1;
      const smokeAim=throughSmoke?aiProfile.smoke:1;
      const targetSliding=target.kind==='player'&&!!slideStartedAt||target.kind==='remote'&&!!remotes.get(target.id)?.mesh.userData.slide,slideTracking=targetSliding?AI_SLIDE_TRACKING[aiDuel?aiDuelLevel:'advanced']??.36:1,accuracyScale=(rankedAiActive||roomMode==='extraction'||roomMode==='normal'&&!online)?0.75:1;const hitChance=THREE.MathUtils.clamp(rawHitChance*duelAim*stability*smokeAim*(botWounded(b,'head',now)?.7:1)*(botWounded(b,'arm',now)?.7:1),.025,aiDuel?aiProfile.cap:.92)*slideTracking*(sustainedPlayerMotion?.86:1)*accuracyScale,willHit=Math.random()<hitChance;
      const impact=work.impact.copy(targetPoint);if(!willHit){const spread=(.22+shotDistance*.085)*(1.25-b.userData.skill*.35);impact.x+=THREE.MathUtils.randFloatSpread(spread);impact.y+=THREE.MathUtils.randFloatSpread(spread*.72);impact.z+=THREE.MathUtils.randFloatSpread(spread)}tracer(muzzle,impact);
      if(willHit){const zoneRoll=Math.random(),headChance=throughSmoke?(aiProfile.masterDodge?.03:.015):.075,hitZone=aiGun==='meteor'?'explosion':zoneRoll<headChance?'head':zoneRoll<.68?'body':zoneRoll<.79?'abdomen':zoneRoll<.89?'arm':'leg',dealt=botWeaponDamage(b.userData.extractionStats||WEAPONS[aiGun],hitZone,shotDistance,aiGun);if(target.kind==='player'){damage(dealt,b.userData.name,hitZone);if(aiGun==='meteor'){const push=camera.position.clone().sub(b.position).setY(0).normalize();knockbackVelocity.addScaledVector(push,5)}}else if(target.kind==='bot'){applyBotDamage(target.mesh,dealt,hitZone);if(aiGun==='meteor')target.mesh.userData.knockback=target.mesh.position.clone().sub(b.position).setY(0).normalize().multiplyScalar(8);if(target.mesh.userData.hp<=0)botDown(target.mesh,b.userData.name)}else if(target.kind==='remote'&&ws?.readyState===1)sendNetwork({type:online&&roomMode==='survival'?'survivalBotShot':'shot',target:target.id,damage:dealt,zone:hitZone,name:b.userData.name})}
    }
  }
}
let lastMenuFrame=0,fpsFrames=0,fpsStarted=performance.now(),inspectStart=-99999,inspectSkinId="";const crossElement=document.querySelector(".cross");
function cancelInspect(){inspectStart=-99999;inspectSkinId='';knifeInspectStart=-99999;knifeModel.rotation.set(0,-.12,0);knifeModel.position.set(.34,-.3,-.58);const model=heldWeaponModels[weaponKey];if(!model)return;model.rotation.set(0,0,0);model.position.set(.32,-.28-adsBlend*(weaponKey==='meteor'?.22:.14),-.62);model.scale.setScalar(1-adsBlend*.1);const skin=activeSkin(),accent=model.userData.skinMaterials?.accent;if(accent)accent.emissiveIntensity=skin&&['void','nova','tide'].includes(skin.id)?.7:.42}
document.addEventListener('keydown',e=>{if(e.code!==keyBindings.inspect||e.repeat||!playing||paused||hp<=0||duelBlocked()||reloading||cycling||switchTarget>=0||!$('keybindSettings').hidden)return;if(weaponKey==='knife'){knifeInspectStart=performance.now();firing=false;feed(`检视：相位刃 K0${activeKnifeSkin()?` · ${activeKnifeSkin().name}`:''}`);return}inspectStart=performance.now();inspectSkinId=activeSkin()?.id||"";actionNod+=.01;firing=false;adsMouse=adsKey=false;feed(`检视：${weaponDef.name}${activeSkin()?` · ${activeSkin().name}`:''}`)});
function updateKnifeInspect(now){if(weaponKey!=='knife'||knifeInspectStart<0)return;const skin=activeKnifeSkin(),legendary=skin&&(skin.rarity==='legendary'||['starfall','phasebreak'].includes(skin.id)),duration=legendary?6500:5000,t=THREE.MathUtils.clamp((now-knifeInspectStart)/duration,0,1),ease=(a,b)=>{const u=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return u*u*(3-2*u)},lift=ease(.02,.18)*(1-ease(.82,1)),turn=ease(.19,.48)*(1-ease(.63,.88)),flip=ease(.48,.68)*(1-ease(.72,.94));knifeModel.position.x=.34-.12*lift;knifeModel.position.y=-.3+.13*lift;knifeModel.position.z=-.58-.28*lift;knifeModel.rotation.y=-.12+turn*(skin?.id==='phasebreak'?Math.PI*1.9:Math.PI*1.4);knifeModel.rotation.x=flip*.48;knifeModel.rotation.z=lift*.18+flip*.34;if(t>=1){knifeInspectStart=-99999;knifeModel.rotation.set(0,-.12,0);knifeModel.position.set(.34,-.3,-.58)}}
function updateInspect(now){const model=heldWeaponModels[weaponKey];if(!model)return;const skin=skinById(inspectSkinId),style=skin?['glacier','ember','moss','nebula','aurora','copper','void','nova','tide'].indexOf(skin.id):-1,legendary=style>=6,age=now-inspectStart,duration=legendary?6200:skin?5200:4400,t=THREE.MathUtils.clamp(age/duration,0,1),pulse=(a,b)=>{const u=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return u*u*(3-2*u)},lift=pulse(.02,.17)*(1-pulse(.82,.99)),turn=pulse(.17,.43)*(1-pulse(.57,.83)),roll=pulse(.4,.59)*(1-pulse(.68,.9)),signature=style<0?0:style%3-1;
  const targetY=turn*(skin?.id==='void'?1.65:skin?.id==='nova'?-1.55:skin?.id==='tide'?2.05:signature*.95)+roll*.35;
  model.rotation.y=THREE.MathUtils.lerp(model.rotation.y,targetY,.3);model.rotation.z=THREE.MathUtils.lerp(model.rotation.z,-lift*.32+roll*(legendary?.7:.42),.3);model.rotation.x=THREE.MathUtils.lerp(model.rotation.x,lift*.22+turn*(legendary?.5:.3),.3);
  const skinAds=model.userData.skinDetail?.group.visible&&weaponKey!=='smg'?adsBlend:0,inspectScale=1-lift*.1-turn*.12;
  model.position.x=.32+lift*(skin?.id==='tide'?-.1:.04)+roll*.04;model.position.y=-.28-adsBlend*(weaponKey==='meteor'?.22:.14)+skinAds*.055+lift*.08;model.position.z=-.62-lift*.38-turn*.2;
  model.scale.set((1-adsBlend*.1-skinAds*.38)*inspectScale,(1-adsBlend*.1)*inspectScale,(1-adsBlend*.1)*inspectScale);
  const opticScale=1-adsBlend*.1;opticMount.position.set(0,(.15+adsBlend*(weaponKey==='meteor'?.22:.14))/opticScale,-.1/opticScale);
  const accent=model.userData.skinMaterials?.accent;if(accent)accent.emissiveIntensity=skin&&t<1?(.42+(legendary?.65:.18)*Math.max(0,Math.sin(Math.PI*3*t))*lift):(skin&&legendary?.7:.42);
}
setInterval(()=>{if(roomMode!=='gunmaster'||!playing||!gunmasterHeal||hp>=100)return;hp=Math.min(100,hp+5);if(hp>=100)gunmasterHeal=0;updateHud();syncNow()},100);
function updateShotAnimation(dt){viewKickTarget*=Math.exp(-dt*1.3*Math.min(2,weaponDef.recoilRecovery||1));viewRoll*=Math.exp(-dt*15);gunKickSide*=Math.exp(-dt*13);shotFovPulse*=Math.exp(-dt*19);actionNod*=Math.exp(-dt*9);actionRoll*=Math.exp(-dt*10);flameOuter.material.opacity*=Math.exp(-dt*36);flameCore.material.opacity*=Math.exp(-dt*36);if(!playing||paused||hp<=0||duelBlocked()||weaponKey==="knife"){if(weaponKey==="knife")camera.rotation.z=0;return}camera.rotation.x=THREE.MathUtils.clamp(pitch+viewKick+actionNod,-1.35,1.35);camera.rotation.z=viewRoll+actionRoll;weapon.position.x+=gunKickSide;if(shotFovPulse>.005){camera.fov+=shotFovPulse;camera.updateProjectionMatrix()}}
function animate(now=performance.now()){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);if(document.hidden)return;if(!playing&&now-lastMenuFrame<100)return;lastMenuFrame=now;fpsFrames++;if(now-fpsStarted>=1000){setText("fpsCounter",Math.round(fpsFrames*1000/(now-fpsStarted))+" FPS · "+quality.label);fpsFrames=0;fpsStarted=now;}effects.update(dt);updateImpactEffects(dt);viewKickTarget*=Math.exp(-dt*1.1*Math.min(2,weaponDef.recoilRecovery||1));viewKickVelocity+=((viewKickTarget-viewKick)*90-viewKickVelocity*18)*dt;viewKick+=viewKickVelocity*dt;gunKick*=Math.exp(-dt*9);crossBloom*=Math.exp(-dt*9);muzzleFlash.material.opacity*=Math.exp(-dt*34);muzzleLight.intensity*=Math.exp(-dt*38);if(playing&&!paused&&hp>0&&!duelBlocked()){const aiming=adsMouse||adsKey,targetAds=aiming?1:0,adsRate=dt/(weaponDef.adsTime/1000)*(now<adsBoostUntil?1.5:1);adsBlend=THREE.MathUtils.clamp(THREE.MathUtils.lerp(adsBlend,targetAds,Math.min(1,adsRate*4)),0,1);const overlayClass=aiming?`active ${weaponKey} optic-${currentOpticId()}${weaponDef.thermal?" thermal":""}`:"";if($("adsOverlay").className!==overlayClass)$("adsOverlay").className=overlayClass;const cross=crossElement;cross.style.opacity=aiming?0:1;cross.style.transform=`translate(-50%,-50%) scale(${1+crossBloom*.75})`;const aimedFov=76/(weaponDef.zoom||1);const nextFov=THREE.MathUtils.lerp(76,aimedFov,adsBlend);if(Math.abs(camera.fov-nextFov)>.001){camera.fov=nextFov;camera.updateProjectionMatrix();}weapon.position.x=THREE.MathUtils.lerp(0,-.32,adsBlend);weapon.position.y=THREE.MathUtils.lerp(0,.08,adsBlend);opticMount.visible=weaponKey!=="knife"&&!aiming&&!grenadeHeld;const heldModel=heldWeaponModels[weaponKey];if(heldModel){const skinDetail=heldModel.userData.skinDetail,skinAds=skinDetail?.group.visible&&weaponKey!=="smg"?adsBlend:0;heldModel.position.y=-.28-adsBlend*(weaponKey==="meteor"?.22:.14)+skinAds*.055;heldModel.scale.set(1-adsBlend*.1-skinAds*.38,1-adsBlend*.1,1-adsBlend*.1);if(skinDetail){skinDetail.group.scale.set(1-skinAds*.3,1,1);skinDetail.group.position.y=0}}weapon.position.z=gunKick;weapon.rotation.x=THREE.MathUtils.lerp(weapon.rotation.x,-gunKick*1.8,Math.min(1,dt*24));camera.rotation.order="YXZ";camera.rotation.y=yaw;camera.rotation.x=THREE.MathUtils.clamp(pitch+viewKick+(woundActive("head")?Math.sin(now*.024)*.008:0),roomMode==='survival'?-1.565:-1.35,1.35);const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));velocity.set(0,0,0);if(keys.KeyW)velocity.add(forward);if(keys.KeyS)velocity.sub(forward);if(keys.KeyD)velocity.add(right);if(keys.KeyA)velocity.sub(right);if(MOBILE_ENABLED&&!slideStartedAt&&Math.hypot(mobileMove.x,mobileMove.y)>.12)velocity.copy(forward).multiplyScalar(-mobileMove.y).addScaledVector(right,mobileMove.x);const speed=(keys.ShiftLeft?11:7)*(weaponKey==="knife"&&keys.ShiftLeft?1.15:1)*(woundActive("body")?.8:1)*(phaseActive>0?2.1:1)*(weaponDef.moveSpeed||1)*(aiming?(weaponDef.adsMove||1):1)*(prone?.38:1)*(woundActive("leg")?.7:1)*(woundActive("abdomen")?.92:1)*(woundActive("explosion")?.78:1),oldX=camera.position.x,oldZ=camera.position.z;if(velocity.lengthSq()){const step=velocity.normalize().multiplyScalar(speed*dt*(MOBILE_ENABLED&&Math.hypot(mobileMove.x,mobileMove.y)>.12?Math.min(1,Math.hypot(mobileMove.x,mobileMove.y)):1)),nextX=oldX+step.x,nextZ=oldZ+step.z;if(!blockedForPlayer(nextX,oldZ))camera.position.x=nextX;if(!blockedForPlayer(camera.position.x,nextZ))camera.position.z=nextZ}if(knockbackVelocity.lengthSq()>.02){const push=knockbackVelocity.clone().multiplyScalar(dt);if(!blockedForPlayer(camera.position.x+push.x,camera.position.z))camera.position.x+=push.x;if(!blockedForPlayer(camera.position.x,camera.position.z+push.z))camera.position.z+=push.z;knockbackVelocity.multiplyScalar(Math.max(0,1-dt*2.6))}camera.position.x=THREE.MathUtils.clamp(camera.position.x,roomMode==='extraction'?-EXTRACTION_LIMIT:isBombMode()?-208:-52,roomMode==='extraction'?EXTRACTION_LIMIT:isBombMode()?208:52);camera.position.z=THREE.MathUtils.clamp(camera.position.z,roomMode==='extraction'?-EXTRACTION_LIMIT:isBombMode()?-208:-52,roomMode==='extraction'?EXTRACTION_LIMIT:isBombMode()?208:52);if(trainingMode){camera.position.x=THREE.MathUtils.clamp(camera.position.x,-34,34);camera.position.z=THREE.MathUtils.clamp(camera.position.z,30,40)}verticalVelocity-=19*dt;camera.position.y+=verticalVelocity*dt;const floorHeight=playerFloorHeight(camera.position.x,camera.position.z);if(camera.position.y<=floorHeight){camera.position.y=floorHeight;verticalVelocity=0;grounded=true}else grounded=false;updateBots(dt);updateRockets(dt);phase=roomMode==='survival'?0:Math.min(100,phase+dt*14);if(phaseActive>0){phaseActive-=dt;if(phaseActive<=0){scene.fog.color.set(0x08101a);renderer.domElement.style.filter=""}}if(online&&ws?.readyState===1&&performance.now()-lastSync>60){lastSync=performance.now();sendNetwork({type:"state",position:camera.position.toArray(),rotation:yaw,hp,score,name:$("name").value,prone})}for(const r of remotes.values())r.mesh.position.lerp(r.target,.25);if(firing&&weaponDef.auto)shoot();updateHud()}updateRemoteRockets(dt);if(playing&&(!paused||online))updateThrownItems(dt);
  if(playing&&!paused&&hp>0)updateSlide(dt,now);
  if(playing&&roomMode==='survival')towerSurvival.update(dt);
  if(playing&&isBombMode()&&!paused&&hp<=0&&bombState?.phase==='running'&&(!online||playerId===bombHost))updateBots(dt);
  if(playing&&isBombMode()&&!paused&&bombState?.phase==='prep'&&(!online||playerId===bombHost)&&playerTeam===bombState.attackTeam)updateBots(dt);
  updateArenaRemotes(dt);
  if(roomMode==='survival'&&survivalSpectating)updateSurvivalSpectatorCamera(dt);
  for(let i=tracers.length-1;i>=0;i--){tracers[i].life-=dt;tracers[i].line.material.opacity=Math.max(0,tracers[i].life*10);if(tracers[i].life<=0){scene.remove(tracers[i].line);tracers.splice(i,1)}}
  updateDuelView(dt);updateObjectiveMode(dt);updateBombMode(dt);updateBombSpectatorCamera(dt);updateShotAnimation(dt);updateInspect(now);updateReloadAnimation(now);updateBoltAnimation(now);updateSkinPulse(heldWeaponModels[weaponKey],now);
  if(weaponKey==="knife"){const age=now-knifeSwingAt,skin=activeKnifeSkin(),pose=knifeSwingPose(skin?.id,age,knifeCombo,knifePose),swing=pose.swing,legendary=skin&&(skin.rarity==='legendary'||['starfall','phasebreak'].includes(skin.id));weapon.rotation.set(pose.x,pose.y,pose.z);knifeModel.position.set(.34+pose.dx,-.3+pose.dy,-.58+pose.dz);knifeModel.rotation.set(0,-.12,pose.twist);updateKnifeInspect(now);knifeHalo.material.opacity=legendary?Math.max(.05,swing*.36)+Math.sin(now*.004)*.025:0;knifeAura.material.opacity=legendary?Math.max(.08,swing*.5)+Math.sin(now*.005)*.04:0;knifeAura.rotation.z+=dt*(skin?.id==='phasebreak'?1.2:.45)}
  updateWeaponSwitch(now);updateSupplyVisual(now);updateTrainingStation();mobileControls?.update(now);weapon.visible=!(isArenaMode()&&spectator||isBombMode()&&hp<=0||roomMode==='survival'&&survivalSpectating);renderer.render(scene,camera)
}
function mobileInputBlocked(){return !playing||paused||matchFinished||duelBlocked()||hp<=0||isBombMode()&&!['prep','running'].includes(bombState?.phase)||['bombLoadout','supplyPicker','gunmasterUpgrade','survivalShop','survivalLeaderboard','gameChatForm','keybindSettings'].some(id=>!$(id).hidden)||$('trainingSettings').open}
function mobileLook(dx,dy){if(mobileInputBlocked())return;const sensitivity=.003*lookMultiplier(lookSensitivity,weaponDef.zoom,adsBlend),oldYaw=yaw;yaw-=dx*sensitivity;if(prone&&blockedForPlayer(camera.position.x,camera.position.z,true,yaw))yaw=oldYaw;pitch=THREE.MathUtils.clamp(pitch-dy*sensitivity,roomMode==='survival'?-1.565:-1.35,1.35)}
function mobileKey(action,down){const code=action==='pause'?'Escape':action.startsWith('skill')?'Digit'+action.slice(-1):keyBindings[action];if(code)canvas.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{code,bubbles:true,cancelable:true}))}
let mobileManualAim=false,mobileFireAutoAim=false;
function syncMobileAim(){adsMouse=(mobileManualAim||mobileFireAutoAim)&&!mobileInputBlocked()&&weaponKey!=='knife'&&!grenadeReady}
function mobileAction(action,down,cancel=false,autoAim=false){if(action==='trainingSettings'){if(down)openTrainingSettings();return}if(action==='fire'){if(down){if(mobileInputBlocked())return;mobileFireAutoAim=autoAim&&weaponKey!=='knife'&&!grenadeReady;syncMobileAim();if(grenadeReady)beginGrenadeCook();else{firing=true;shoot()}}else{firing=false;mobileFireAutoAim=false;syncMobileAim();if(grenadeCookStarted)releaseCookedGrenade(cancel||paused||hp<=0)}return}if(action==='aim'){mobileManualAim=down&&!mobileInputBlocked();syncMobileAim();return}mobileKey(action,down)}
function mobileState(){const modal=['bombLoadout','supplyPicker','gunmasterUpgrade','survivalShop','survivalLeaderboard','gameChatForm','keybindSettings'].some(id=>!$(id).hidden)||$('trainingSettings').open,visible=playing&&!paused&&!matchFinished&&!modal,live=visible&&!mobileInputBlocked(),now=performance.now(),normal=roomMode!=='survival',tacticalAvailable=equipmentLoadout.战术道具!=='jetpack'&&now>=equipmentReadyAt&&(equipmentLoadout.战术道具!=='medkit'||hp<100||Object.keys(wounds).some(zone=>woundActive(zone)))&&(equipmentLoadout.战术道具!=='phaseCell'||phase<100),canSwitch=live&&switchTarget<0&&roomMode!=='gunmaster'&&roomMode!=='challenge',tower=towerSurvival.state,me=tower?.players.find(p=>p.id===playerId);
  let interact=roomMode==='gunmaster'&&gunmasterCredits>0||roomMode==='extraction'&&!!extractionClient?.interacting;
  if(isBombMode()&&bombState?.phase==='running'){const m=bombState,sites=bombSitesFor(m.attackTeam);interact=!!m.hold&&m.hold.id===playerId||(!m.plantedSite&&m.carrier===playerId&&Object.values(sites).some(p=>Math.hypot(camera.position.x-p[0],camera.position.z-p[2])<3))||(!!m.plantedSite&&playerTeam!==m.attackTeam&&Math.hypot(camera.position.x-sites[m.plantedSite][0],camera.position.z-sites[m.plantedSite][2])<3)}
  if(roomMode==='ctf'&&objectiveState?.flags)interact=objectiveState.flags.some(flag=>!flag.carrier&&(flag.team!==playerTeam||!flag.home)&&Math.hypot(camera.position.x-flag.position[0],camera.position.z-flag.position[2])<3);
  return {visible,look:live,available:{pause:visible,joystick:live,jump:live&&(!prone&&grounded||!!slideStartedAt||normal&&equipmentLoadout.战术道具==='jetpack'&&equipmentEnergy>0),fire:live&&(!isBombMode()||bombState?.phase==='running')&&switchTarget<0&&(!reloading||ammo>0),aim:live&&weaponKey!=='knife'&&!grenadeReady,prone:live&&grounded&&!slideStartedAt,slide:live&&grounded&&!prone&&!slideStartedAt&&keys.ShiftLeft&&Math.hypot(mobileMove.x,mobileMove.y)>.2&&now>=slideCooldownUntil,detonate:live&&weaponKey==='meteor'&&weaponDef.remoteFuse&&rockets.length>0,phaseFlash:live&&normal&&weaponKey!=='knife'&&weaponDef.phaseFlashlight&&now>=phaseFlashReadyAt,phase:live&&normal&&phase>=100&&phaseActive<=0,throwable:live&&normal&&(throwCharges>0||grenadeReady),reload:live&&!grenadeReady&&weaponKey!=='knife'&&!reloading&&!cycling&&switchTarget<0&&ammo<weaponDef.mag&&reserve>0,tactical:live&&normal&&tacticalAvailable,interact:live&&interact,trainingSettings:live&&!!nearbyTrainingTarget(),supply:live&&!$('supplyHint').hidden,inspect:live&&!reloading&&!grenadeReady,zoom:live&&weaponDef.dualZoom,weapon1:canSwitch&&(activeWeaponSlot!==0||grenadeReady),weapon2:canSwitch&&!isBombMode()&&(activeWeaponSlot!==1||grenadeReady),sidearm:canSwitch&&(activeWeaponSlot!==2||grenadeReady),knife:canSwitch&&!!sidearmKey&&(activeWeaponSlot!==3||grenadeReady),skill5:live&&!normal&&!!me?.rage&&tower.elapsed>=(me.rageReady||0),skill6:live&&!normal&&!!me?.blood&&tower.elapsed>=(me.bloodReady||0),skill7:live&&!normal&&!!me?.protection&&tower.elapsed>=(me.protectionReady||0)}};
}
mobileControls=initMobileControls({canvas,sensitivity:()=>lookSensitivity,setSensitivity:setLookSensitivity,state:mobileState,look:mobileLook,action:mobileAction,move(x,y,sprint){mobileMove.x=x;mobileMove.y=y;for(const [action,value] of Object.entries({forward:y<-.12,back:y>.12,left:x<-.12,right:x>.12,sprint}))rawKeys[keyBindings[action]]=value},release(){mobileManualAim=mobileFireAutoAim=false;mobileMove.x=mobileMove.y=0;for(const code of Object.keys(rawKeys))rawKeys[code]=false;firing=false;adsMouse=adsKey=false},editor(open){if(open){mobileEditorPaused=paused;if(playing)paused=true}else if(playing)paused=mobileEditorPaused}});
if(MOBILE_ENABLED){$('keybindSettings').querySelector('h2').textContent='按钮布局';$('openKeybinds').textContent='按钮布局';$('pauseKeybinds').textContent='按钮布局';$('gameChatHint').onclick=()=>{if(!mobileInputBlocked()){const code=['KeyY','KeyU','KeyI','KeyO',...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter=>'Key'+letter)].find(code=>!Object.values(keyBindings).includes(code))||'KeyY';canvas.dispatchEvent(new KeyboardEvent('keydown',{code,bubbles:true}))}}}
if(!validBindingCode(keyBindings.backpack)||Object.entries(keyBindings).some(([action,code])=>action!=='backpack'&&code===keyBindings.backpack))keyBindings.backpack=['KeyB','KeyN','KeyM','KeyH','KeyL'].find(code=>!Object.entries(keyBindings).some(([action,used])=>action!=='backpack'&&used===code))||'KeyB';
function configureExtractionBot(bot,raid,index,saved=null){
  const s=bot.userData,key=saved?.gear?.weapon?.weapon||extractionGun(raid.kit.weapon,index),sourceMods=saved?.gear?.weapon?.mods||raid.gear?.weapon?.mods||raid.kit.mods,mods={};for(const [slot,id] of Object.entries(sourceMods||{})){if(MODS[key]?.[slot]?.[id])mods[slot]=id;else if(MODS[key]?.[slot])mods[slot]=Object.keys(MODS[key][slot])[0]}const ammoSlots=Object.entries(MODS[key]||{}).filter(([slot])=>/弹药|弹头/.test(slot)),special=saved?.gear?Object.entries(sourceMods).find(([slot])=>/弹药|弹头/.test(slot))?.[1]||'':index%3===2&&ammoSlots.length?Object.keys(ammoSlots[0][1])[index%Object.keys(ammoSlots[0][1]).length]:'';
  for(const [slot] of ammoSlots){delete mods[slot];if(special)mods[slot]=special}
  const old=builds[key];builds[key]=mods;const stats=buildWeapon(key);builds[key]=old;
  s.weapon=key;s.secondaryWeapon=null;s.extractionStats=stats;s.extractionAmmoType=special;s.ammoLeft=saved?.ammo??Math.min(stats.mag,special?180:210);s.extractionReserve=saved?.reserve??(special?180:210)-s.ammoLeft;
  s.extractionBag=saved?.bag||[];s.extractionGear=saved?.gear||{weapon:extractionItem('weapon',{weapon:key,mods}),armor:raid.kit.armor==='none'?null:extractionItem('armor',{type:raid.kit.armor}),helmet:raid.kit.helmet==='none'?null:extractionItem('helmet',{type:raid.kit.helmet})};
  s.extracted=!!saved?.extracted;if(s.extracted)bot.visible=false;
  s.aiGear={armor:EQUIPMENT.护甲[s.extractionGear.armor?.type||'none'][2],helmet:EQUIPMENT.头盔[s.extractionGear.helmet?.type||'none'][2],tactical:'none',nextUse:Infinity,shieldUntil:0,adrenalineUntil:0,stabilizerUntil:0};
  s.extractionIndex=index;s.extractionRole=extractionRole(index);s.extractionProfile=index<4?'normal':extractionRankProfile(1,index*17%100);s.skill=index<4?.62:.78+(index%4)*.035;s.preferredDistance=key==='frost'?32:key==='gale'?26:WEAPONS[key].pellets?8:key==='smg'?12:19;s.aggression=s.extractionRole==='raider'?.8:.45;s.target=null;s.targetVisible=false;s.lastSeenAt=-Infinity;s.facingYaw=Math.PI/2;bot.rotation.y=Math.PI/2;s.raidStarted=performance.now()-Math.max(0,Date.now()-raid.started);s.wander=new THREE.Vector3(EXTRACTION_GUARDS[index][0]-8,0,EXTRACTION_GUARDS[index][1]+8);s.cooldown=.5;s.reloadUntil=0;s.lootGoal=null;s.searchUntil=0;
  s.helmetShell.visible=!!s.extractionGear.helmet;s.helmetVisor.visible=!!s.extractionGear.helmet;s.armorPlate.visible=!!s.extractionGear.armor;
  if(s.rifle){s.rifle.scale.set(key==='smg'?.85:WEAPONS[key].pellets?1.12:1,1,key==='frost'?1.45:key==='smg'?.75:key==='lmg'?1.25:1);s.rifle.material.color.setHex(s.extractionRole==='raider'?0x38494d:0x45515d)}
  const roleNames={scavenger:['拾荒客','Scavenger'],patrol:['巡逻守卫','Patrol'],raider:['突击者','Raider']},en=document.documentElement.lang.startsWith('en');s.name=roleNames[s.extractionRole][en?1:0]+' '+String(index+1).padStart(2,'0');s.armorPlate.material.color.setHex(s.extractionRole==='scavenger'?0x6c6555:s.extractionRole==='patrol'?0x3b5367:0x464c55);s.helmetShell.material.color.setHex(s.extractionRole==='scavenger'?0x645e4d:0x384755);setActorLabel(bot,s.name,1);
}
function extractionSend(data){if(extractionSocket?.readyState===1)extractionSocket.send(JSON.stringify(data))}
function extractionAlarm(position){const point=new THREE.Vector3().fromArray(position);if(camera.position.distanceTo(point)<90)feed(document.documentElement.lang.startsWith('en')?'Extraction signal · East Signal Station':'撤离信号 · 东岸信号站');if(extractionHost){const now=performance.now();for(const bot of bots)if(bot.visible&&bot.position.distanceTo(point)<65&&!bot.userData.targetVisible){bot.userData.signalGoal=point.clone();bot.userData.signalUntil=now+10000;bot.userData.lootGoal=null}}extractionClient?.signalVisual(position)}
function extractionWorldState(drops,details=false){return {bots:bots.map((b,index)=>({index,position:b.position.toArray().map(n=>Math.round(n*100)/100),rotation:b.rotation.y,hp:b.visible?b.userData.hp:0,ammo:b.userData.ammoLeft,reserve:b.userData.extractionReserve,...(details?{bag:b.userData.extractionBag,gear:b.userData.extractionGear}:{}),extracted:!!b.userData.extracted,prone:!!b.userData.prone,slide:!!b.userData.slide})),...(drops?{drops}: {})}}
async function connectExtractionRoom(room){
  clearTimeout(extractionRetry);const session=accountSession(),connectionSeq=sessionSeq;if(!session)return;
  let socketTicket;try{socketTicket=(await accountApi('account/socket-ticket',{...session,path:'/api/extraction/'+room})).ticket}catch(error){feed(error.message);return}if(!accountSession()||connectionSeq!==sessionSeq)return;
  extractionSocket?.close();const socket=new WebSocket((location.protocol==='https:'?'wss':'ws')+'://'+location.host+'/api/extraction/'+room+'?ticket='+encodeURIComponent(socketTicket));extractionSocket=socket;ws=socket;
  socket.onopen=()=>socket.send(JSON.stringify({type:'join',id:playerId,account:session.name,token:session.token,device:session.device}));
  socket.onmessage=event=>{if(extractionSocket!==socket||roomMode!=='extraction')return;let d;try{d=JSON.parse(event.data)}catch{return}
    if(d.type==='extractionWelcome'||d.type==='extractionParty'){
      extractionParty=d.party;extractionHost=!!d.party.members.find(m=>m.name===session.name.toLowerCase())?.host;
      const average=d.party.members.reduce((n,m)=>n+m.level,0)/d.party.members.length;for(let i=0;i<bots.length;i++){const load=d.party.members[i%d.party.members.length].loadout;if(load&&!d.world&&d.type==='extractionWelcome'){const current=extractionClient.raid();configureExtractionBot(bots[i],{...current,gear:{weapon:load.weapon,armor:load.armor,helmet:load.helmet},kit:{weapon:load.weapon.weapon,mods:load.weapon.mods,armor:load.armor?.type||'none',helmet:load.helmet?.type||'none'}},i)}if(i>=4)bots[i].userData.extractionProfile=extractionRankProfile(average,i*17%100)}
      if(d.world)applyExtractionWorld(d.world);$('netText').textContent='搜打撤 · 已连接';if(extractionHost)extractionSend({type:'extractionWorld',world:extractionWorldState(extractionClient.raid()?.drops,true)});return;
    }
    if(d.type==='extractionWorld'){if(!extractionHost)applyExtractionWorld(d.world);else extractionClient.replaceLoot(d.world.drops);return}
    if(d.type==='extractionSignal'){extractionAlarm(d.position);return}
    if(d.type==='state'&&d.id!==playerId){const r=addRemote(d.id,d.name,0);r.target.set(d.position[0],Math.max(0,d.position[1]-((d.prone||d.slide)?.48:1.7)),d.position[2]);r.mesh.rotation.y=d.rotation||0;r.mesh.visible=d.hp>0;setActorProne(r.mesh,!!d.prone);setActorSlide(r.mesh,!!d.slide);return}
    if(d.type==='leave'){const r=remotes.get(d.id);if(r){disposeObject(r.mesh);remotes.delete(d.id)}return}
    if(d.type==='extractionHit'&&extractionHost){const b=bots[d.botIndex],r=remotes.get(d.id);if(b?.visible&&r&&r.mesh.position.distanceTo(b.position)<150&&hasLineOfSight(r.mesh.position.clone().add(new THREE.Vector3(0,1.3,0)),b.position.clone().add(new THREE.Vector3(0,1,0)),false)){extractionBotDamageBase(b,Math.max(0,Math.min(250,Number(d.damage)||0)),d.zone||'body',true);if(b.userData.hp<=0)botDown(b)}return}
    if(d.type==='extractionBotShot'&&d.target===playerId){damage(Math.max(0,Math.min(250,d.damage)),d.name,d.zone);return}
    if(d.type==='extractionTransfer'||d.type==='extractionDrop'||d.type==='extractionDeath'||d.type==='extractionRequest'){extractionClient.message(d);return}
    if(d.type==='muzzle')showRemoteMuzzleFlash(d.id,!!d.hidden);if(d.type==='blast')showRemoteBlast(d);
  };
  socket.onclose=()=>{if(extractionSocket!==socket)return;extractionSocket=null;ws=null;if(roomMode==='extraction'&&extractionClient?.active){$('netText').textContent='搜打撤 · 正在重连';extractionRetry=setTimeout(()=>connectExtractionRoom(room),1500)}};
}
function applyExtractionWorld(world){if(!world)return;for(const record of world.bots||[]){const b=bots[record.index];if(!b)continue;b.userData.syncTarget=new THREE.Vector3().fromArray(record.position);if(extractionHost)b.position.copy(b.userData.syncTarget);b.userData.hp=record.hp;b.visible=record.hp>0&&!record.extracted;b.userData.ammoLeft=record.ammo;b.userData.extractionReserve=record.reserve;if(record.bag)b.userData.extractionBag=record.bag;if(record.gear){b.userData.extractionGear=record.gear;const g=record.gear,key=g.weapon.weapon,old=builds[key];b.userData.weapon=key;builds[key]=g.weapon.mods;b.userData.extractionStats=buildWeapon(key);builds[key]=old;b.userData.extractionAmmoType=Object.entries(g.weapon.mods).find(([slot])=>/弹药|弹头/.test(slot))?.[1]||'';b.userData.aiGear.armor=EQUIPMENT.护甲[g.armor?.type||'none'][2];b.userData.aiGear.helmet=EQUIPMENT.头盔[g.helmet?.type||'none'][2]}b.userData.extracted=record.extracted;b.rotation.y=record.rotation;setActorProne(b,record.prone);setActorSlide(b,record.slide)}extractionClient?.replaceLoot(world.drops)}
function restoreExtractionLoadout(){
  clearTimeout(extractionRetry);const socket=extractionSocket;extractionSocket=null;if(ws===socket)ws=null;socket?.close();
  if(!extractionBackup)return;const backup=extractionBackup;extractionBackup=null;
  builds=backup.builds;weaponSlots=backup.slots;sidearmKey=backup.sidearm;equipmentLoadout=backup.equipment;equipmentMove=backup.move;activeWeaponSlot=0;
  roomMode='normal';$('coach').hidden=false;document.querySelector('.score').hidden=false;resetWeaponRuntime();selectWeapon(weaponSlots[0],{equip:false});refreshEquipment();syncMenuWeaponSelectors();
}
extractionClient=initExtraction({
  scene,weapons:WEAPONS,mods:MODS,
  preview(key,mods){const old=builds[key];try{builds[key]=mods;return buildWeapon(key)}finally{builds[key]=old}},
  start(raid,resume){
    if(playing)endMatch();
    extractionBackup={builds:structuredClone(builds),slots:[...weaponSlots],sidearm:sidearmKey,equipment:structuredClone(equipmentLoadout),move:equipmentMove};
    start(false,'extraction');clearMatchRecovery();
    if(!mapWorlds.has('extraction')){const world=buildExtractionWorld(THREE);batchStaticScene(THREE,world.group);scene.add(world.group);mapWorlds.set('extraction',world);MAP_NAMES.extraction='裂隙封锁区'}
    setMap('extraction');for(const visual of healVisuals)visual.visible=false;
    weaponSlots=[raid.kit.weapon,raid.kit.weapon];sidearmKey='';builds[raid.kit.weapon]=structuredClone(raid.kit.mods);
    Object.defineProperty(EQUIPMENT.护甲,'none',{value:['无护甲','',{body:0,speed:1}],configurable:true});
    Object.defineProperty(EQUIPMENT.头盔,'none',{value:['无头盔','',{head:0,speed:1,vision:0}],configurable:true});
    equipmentLoadout={护甲:raid.kit.armor,头盔:raid.kit.helmet,战术道具:'medkit',投掷物:'smoke'};
    equipmentMove=EQUIPMENT.护甲[raid.kit.armor][2].speed*EQUIPMENT.头盔[raid.kit.helmet][2].speed;
    $('helmetVision').className=`helmetVision helmet-${raid.kit.helmet}`;
    activeWeaponSlot=0;resetWeaponRuntime();const def=buildWeapon(raid.kit.weapon),loaded=resume&&raid.ammo!==null?raid.ammo:Math.min(def.mag,raid.kit.ammo),carried=resume&&raid.reserve!==null?raid.reserve:Math.max(0,raid.kit.ammo-loaded);
    weaponRuntime[0]={key:raid.kit.weapon,ammo:loaded,reserve:carried};suppressWeaponStash=true;selectWeapon(raid.kit.weapon,{equip:false});suppressWeaponStash=false;
    hp=resume?raid.hp:100;bonusGuard=0;throwCharges=0;equipmentReadyAt=Infinity;camera.position.fromArray(resume&&raid.position?raid.position:[EXTRACTION_SPAWN[0],1.7,EXTRACTION_SPAWN[1]]);yaw=-.6;pitch=0;
    // Existing raids survive the revised room furniture without resuming inside it.
    if(resume&&blockedForPlayer(camera.position.x,camera.position.z)){const origin=camera.position.clone();let found=false;for(let radius=.75;radius<=12&&!found;radius+=.75)for(let i=0;i<16;i++){const angle=i*Math.PI/8,x=origin.x+Math.cos(angle)*radius,z=origin.z+Math.sin(angle)*radius;if(Math.abs(x)<EXTRACTION_LIMIT&&Math.abs(z)<EXTRACTION_LIMIT&&!blockedForPlayer(x,z)){camera.position.x=x;camera.position.z=z;found=true;break}}if(!found)camera.position.set(EXTRACTION_SPAWN[0],1.7,EXTRACTION_SPAWN[1])}
    extractionHost=!raid.room;extractionParty=null;
    while(bots.length>EXTRACTION_GUARDS.length)disposeObject(bots.pop());
    bots.forEach((bot,i)=>{const saved=resume?raid.bots?.[i]:null,[x,z]=EXTRACTION_GUARDS[i];bot.position.fromArray(saved?.position||[x,0,z]);bot.userData.team=1;bot.userData.name=`封锁守卫 ${i+1}`;bot.userData.hp=saved?.hp??100;bot.userData.deathCounted=bot.userData.hp<=0;bot.visible=bot.userData.hp>0;configureExtractionBot(bot,raid,i,saved);setActorLabel(bot,bot.userData.name,1)});
    if(raid.room)connectExtractionRoom(raid.room);
    $('roomLabel').textContent='搜打撤 · 裂隙封锁区';$('netText').textContent='搜打撤';$('equipmentHud').hidden=true;$('throwableHud').hidden=true;document.querySelector('.score').hidden=true;$('coach').hidden=true;updateHud();
  },
  lootPosition(index){const [x,z]=EXTRACTION_LOOT_POINTS[index];return new THREE.Vector3(x,0,z)},exitPosition(index){const [x,z]=EXTRACTION_EXITS[index];return new THREE.Vector3(x,0,z)},
  canSee(point){const direction=point.clone().sub(camera.position),distance=direction.length(),ray=new THREE.Raycaster(camera.position,direction.normalize(),0,Math.max(0,distance-.2));return !ray.intersectObjects(obstacles,true).length},
  signal(spec){extractionAlarm([spec.x,0,spec.z]);extractionSend({type:'extractionSignal'})},
  interactKey:()=>keyLabel('interact'),interactCode:()=>keyBindings.interact,bagKey:()=>keyLabel('backpack'),bagCode:()=>keyBindings.backpack,feed,
  get:()=>({hp,paused,finished:matchFinished,position:camera.position,ammo:weaponRuntime[0]?.ammo??ammo,reserve:weaponRuntime[0]?.reserve??reserve,interacting:keys.KeyF}),
  snapshot(){stashWeaponState();return {hp,ammo:weaponRuntime[0].ammo,reserve:weaponRuntime[0].reserve,position:camera.position.toArray(),bots:bots.map(bot=>({hp:bot.visible?bot.userData.hp:0,position:bot.position.toArray(),ammo:bot.userData.ammoLeft,reserve:bot.userData.extractionReserve,bag:bot.userData.extractionBag,gear:bot.userData.extractionGear,extracted:!!bot.userData.extracted}))}},
  rankLevel:()=>Number(document.getElementById('seasonLevel')?.textContent?.match(/\d+/)?.[0])||1,
  setAmmo(a,r){stashWeaponState();weaponRuntime[0].ammo=a;weaponRuntime[0].reserve=r;if(activeWeaponSlot===0){ammo=a;reserve=r}updateHud()},
  ammoType(type){const key=weaponSlots[0];for(const slot of Object.keys(MODS[key]||{}))if(/弹药|弹头/.test(slot)){delete builds[key][slot];if(type&&MODS[key][slot][type])builds[key][slot]=type}if(activeWeaponSlot===0)weaponDef=buildWeapon(key)},
  reload(){if(activeWeaponSlot===0)reload()},
  equipGear(raid){weaponActionToken++;reloading=cycling=false;weaponSlots[0]=raid.kit.weapon;builds[raid.kit.weapon]=structuredClone(raid.kit.mods);for(const [slot,opts] of Object.entries(MODS[raid.kit.weapon]||{}))if(/弹药|弹头/.test(slot)&&raid.loadedType&&opts[raid.loadedType])builds[raid.kit.weapon][slot]=raid.loadedType;equipmentLoadout.护甲=raid.kit.armor;equipmentLoadout.头盔=raid.kit.helmet;equipmentMove=EQUIPMENT.护甲[raid.kit.armor][2].speed*EQUIPMENT.头盔[raid.kit.helmet][2].speed;$('helmetVision').className=`helmetVision helmet-${raid.kit.helmet}`;weaponRuntime[0]={key:raid.kit.weapon,ammo:raid.ammo||0,reserve:raid.reserve||0};activeWeaponSlot=0;suppressWeaponStash=true;selectWeapon(raid.gear.weapon?raid.kit.weapon:'knife',{equip:false});suppressWeaponStash=false;updateHud()},
  unequip(kind){if(kind==='weapon'){weaponActionToken++;reloading=false;switchWeaponSlot(2)}else{equipmentLoadout[kind==='armor'?'护甲':'头盔']='none';$('helmetVision').className=`helmetVision helmet-${equipmentLoadout.头盔}`;equipmentMove=EQUIPMENT.护甲[equipmentLoadout.护甲][2].speed*EQUIPMENT.头盔[equipmentLoadout.头盔][2].speed}},
  clearInteract(){rawKeys[keyBindings.interact]=false},
  syncLoot(drops){if(roomMode==='extraction'&&extractionHost)extractionSend({type:'extractionWorld',world:extractionWorldState(drops,true)})},
  send:extractionSend,host:()=>extractionHost,remotePosition:id=>remotes.get(id)?.mesh.position.clone(),
  deathBox(items,a,r,type){const loot=structuredClone(items);if(a+r>0)extractionAddItems(loot,[extractionItem('ammo',{weapon:weaponSlots[0],type,quantity:a+r,free:!!extractionClient.raid()?.ammoFree})]);if(!extractionClient.raid()?.room)extractionClient.botLoot({position:camera.position,userData:{name:$('name').value}},loot);else extractionSend({type:'extractionDeath',position:camera.position.toArray(),items:loot})},
  heal(n){hp=Math.min(100,hp+n);updateHud()},
  pause(value){paused=value;firing=false;adsMouse=adsKey=false;for(const code of Object.keys(rawKeys))rawKeys[code]=false;if(value){if(document.pointerLockElement)document.exitPointerLock()}else requestGamePointerLock()},
  freeze(){matchFinished=true;firing=false;stashWeaponState();if(document.pointerLockElement)document.exitPointerLock()},
  exit(){endMatch();document.querySelector('.score').hidden=false;setMap('crossroads')}
});
const extractionBotDownBase=botDown;
const extractionBotDamageBase=applyBotDamage;
applyBotDamage=function(bot,n,zone='body',playerShot=false){if(roomMode==='extraction'&&!extractionHost){extractionSend({type:'extractionHit',botIndex:bots.indexOf(bot),damage:n,zone});const protection=zone==='head'?bot.userData.aiGear?.helmet.head:bot.userData.aiGear?.armor.body;return Math.round(n*(1-(protection||0)))}return extractionBotDamageBase(bot,n,zone,playerShot)};
const extractionSendBase=sendNetwork;
sendNetwork=function(data){if(roomMode!=='extraction')return extractionSendBase(data);if(data.type==='shot'&&data.name){extractionSend({...data,type:'extractionBotShot'});return}if(data.type==='shot')return;extractionSend(data)};
botDown=function(bot,...args){if(roomMode!=='extraction')return extractionBotDownBase(bot,...args);if(bot.userData.deathCounted||!extractionHost)return;bot.userData.deathCounted=true;bot.visible=false;bot.userData.hp=0;const loot=[...Object.values(bot.userData.extractionGear).filter(Boolean),...bot.userData.extractionBag],quantity=bot.userData.ammoLeft+bot.userData.extractionReserve;if(quantity>0)extractionAddItems(loot,[extractionItem('ammo',{weapon:bot.userData.weapon,type:bot.userData.extractionAmmoType,quantity})]);extractionClient.botLoot(bot,loot);bot.userData.ammoLeft=bot.userData.extractionReserve=0;bot.userData.extractionBag=[];showKillToast(bot.userData.name,weaponKey==='knife')};
const extractionSlotBase=slotWeapon;slotWeapon=function(slot){if(roomMode==='extraction')return slot===0&&extractionClient?.raid()?.gear.weapon?weaponSlots[0]:slot===2?'knife':null;return extractionSlotBase(slot)};
const extractionHudBase=updateHud;updateHud=function(){extractionHudBase();if(roomMode==='extraction'){setText('reserve',weaponKey==='knife'?'':`/ ${reserve}`);$('equipmentHud').hidden=true;$('throwableHud').hidden=true;$('weaponSlotsHud').textContent=`${keyLabel('weapon1')} ${WEAPONS[weaponSlots[0]].name} · ${keyLabel('sidearm')} 相位刃`}};
const extractionSaveBase=saveBuilds;saveBuilds=function(){if(roomMode!=='extraction')extractionSaveBase()};
const extractionSupplyBase=updateSupplyVisual;updateSupplyVisual=function(now){if(roomMode==='extraction'||roomMode==='tutorial'){supplyCrate.visible=false;$('supplyHint').hidden=true;$('supplyTracker').hidden=true;return}extractionSupplyBase(now)};
const extractionAnimateBase=animate;let extractionLastFrame=performance.now();animate=function(now=performance.now()){const delta=Math.min(.04,Math.max(0,(now-extractionLastFrame)/1000));extractionLastFrame=now;if(roomMode==='extraction'&&playing&&paused&&!matchFinished){updateBots(delta);updateRockets(delta);for(const r of remotes.values())r.mesh.position.lerp(r.target,1-Math.exp(-delta*12))}extractionClient.update(delta);if(roomMode==='extraction'&&playing&&now>extractionNextSync){extractionNextSync=now+125;extractionSend({type:'state',position:camera.position.toArray(),rotation:yaw,hp,prone,slide:!!slideStartedAt});if(extractionHost)extractionSend({type:'extractionWorld',world:extractionWorldState()})}extractionAnimateBase(now)};
animate();
initGameChat({send:sendNetwork,isPlaying:()=>playing&&!paused,isOnline:()=>online,isConnected:()=>ws?.readyState===1,localName:()=>$('name').value||'玩家',chatKey:()=>['KeyY','KeyU','KeyI','KeyO',...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter=>'Key'+letter)].find(code=>!Object.values(keyBindings).includes(code))||'KeyY',suspend:()=>{firing=false;adsMouse=adsKey=false;for(const key of Object.keys(rawKeys))rawKeys[key]=false;if(document.pointerLockElement===canvas)document.exitPointerLock()},resume:()=>{if(playing&&!paused)requestGamePointerLock()}});
initSurvivalLeaderboardUI({unlock:()=>{firing=false;adsMouse=adsKey=false;for(const k of Object.keys(keys))keys[k]=false;if(document.pointerLockElement)document.exitPointerLock();if(playing&&online&&roomMode==='survival'&&survivalSolo)sendNetwork({type:'survivalPause',paused:true})},resume:()=>{if(playing&&roomMode==='survival'&&!paused){if(online&&survivalSolo)sendNetwork({type:'survivalPause',paused:false});if(!towerSurvival.blocked)requestGamePointerLock()}}});
initAccountUI();
initTournamentUI((_eventId,room,map)=>{
  if(invite.mode==='extraction'){if(playing)endMatch();void extractionClient.joinSquad(invite.room);return}
  pendingRoomMode='tournament';
  $('room').value=room;
  $('mapSelect').value=map||'crossroads';
  $('roomDialog').dataset.mode='join';
  start(true);
  document.querySelector('.score>span').textContent='赛事比分';
},weeklySetup);
initForumUI();
initSocialUI((invite,creator)=>{
  if(playing)endMatch();
  if(playing)endMatch();
  pendingRoomMode=invite.mode;
  $('room').value=invite.room;
  $('mapSelect').value=invite.map||'crossroads';
  socialInviteMap=invite.map||'crossroads';
  $('roomDialog').dataset.mode=creator?'create':'join';
  if(invite.mode==='bomb')$('bombPreset').value='duoOpposite';
  clearPracticeMode();
  start(true);
});
showMatchRecovery();
setInterval(()=>{if(playing)saveCurrentMatch();else showMatchRecovery()},1000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveCurrentMatch()});
addEventListener('pagehide',saveCurrentMatch);
setInterval(()=>{if(playing&&roomMode!=='extraction'&&!duelBlocked()&&hp>0&&blockedForPlayer(camera.position.x,camera.position.z)){camera.position.copy(randomSpawn());verticalVelocity=0;knockbackVelocity.set(0,0,0);feed("检测到卡墙，已移动到安全出生点")}},500);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
setNameProvider(()=>[$('name').value,accountSession()?.name,...bots.filter(b=>!b.userData.trainingTarget).map(b=>b.userData.name),...[...remotes.values()].map(r=>r.mesh.userData.name)]);
window.addEventListener('astrift:language-changed',()=>{for(const bot of bots)setActorLabel(bot,bot.userData.name,bot.userData.team);for(const remote of remotes.values())setActorLabel(remote.mesh,remote.mesh.userData.name,remote.mesh.userData.team);lastSlotMarkup='';updateHud()});
initLanguage();

// Onboarding owns only temporary training state; normal loadouts are restored on every exit.
let tutorialBackup=null,tutorialTarget=null;
function closeTutorialPanels(){for(const id of ['normalModePanel','specialModePanel','loadoutModePanel']){if($(id))$(id).open=false};for(const id of ['armory','equipment','seasonDialog','roomDialog','aiDuelDialog','accountDialog','friendsScreen'])if($(id))$(id).hidden=true}
function restoreTutorialLoadout(){if(!tutorialBackup)return;const b=tutorialBackup;tutorialBackup=null;document.body.classList.remove('tutorialPlaying');weaponSlots=b.slots;sidearmKey=b.sidearm;builds=b.builds;equipmentLoadout=b.gear;$('menuWeapon1').value=b.menu[0];$('menuWeapon2').value=b.menu[1];$('mapSelect').value=b.map;activeWeaponSlot=0;resetWeaponRuntime();selectWeapon(weaponSlots[0],{equip:false});refreshEquipment();syncMenuWeaponSelectors();for(const [key,value] of Object.entries(b.local)){if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value)}document.querySelector('.score').hidden=false;setMap(mapWorlds.has(b.map)?b.map:'crossroads');tutorialTarget=null;phase=100;shieldUntil=0;renderer.domElement.style.filter=''}
const tutorialEndMatchBase=endMatch;endMatch=function(...args){tutorialEndMatchBase(...args);restoreTutorialLoadout()};
const tutorialClient=initTutorial({
  mobile:MOBILE_ENABLED,key:action=>t(keyLabel(action)),playing:()=>playing,paused:()=>paused,
  start(){
    tutorialBackup={slots:[...weaponSlots],sidearm:sidearmKey,builds:structuredClone(builds),gear:{...equipmentLoadout},map:$('mapSelect').value,menu:[$('menuWeapon1').value,$('menuWeapon2').value],local:Object.fromEntries([WEAPON_SLOT_KEY,SIDEARM_KEY,EQUIPMENT_KEY,BUILD_KEY,'astrift.weapon','astrift.matchRecovery.v1'].map(key=>[key,localStorage.getItem(key)]))};
    document.body.classList.add('tutorialPlaying');$('menuWeapon1').value='redline';$('menuWeapon2').value='smg';builds={...builds,redline:{},smg:{}};sidearmKey='';equipmentLoadout={护甲:'light',头盔:'scout',战术道具:'shield',投掷物:'smoke'};start(false,'tutorial');clearActors();
    if(!mapWorlds.has('tutorial')){const world=buildTutorialWorld(THREE);batchStaticScene(THREE,world.group);scene.add(world.group);mapWorlds.set('tutorial',world);MAP_NAMES.tutorial='Training courtyard'}
    setMap('tutorial');floor.visible=false;for(const visual of healVisuals)visual.visible=false;camera.position.set(-5,1.7,4);yaw=0;pitch=0;phase=100;equipmentReadyAt=0;equipmentMove=1;selectWeapon(weaponSlots[0],{equip:false});$('helmetVision').className='helmetVision helmet-none';throwCharges=2;hp=100;document.querySelector('.score').hidden=true;$('coach').style.opacity=0;$('roomLabel').textContent=document.documentElement.lang==='en'?'Tutorial':'新手教程';
    tutorialTarget=actorMesh(0xff596f);tutorialTarget.position.set(-5,0,-8);Object.assign(tutorialTarget.userData,{hp:100,trainingMaxHp:100,trainingTarget:true,team:1,name:'Training target'});tutorialTarget.userData.rifle.visible=tutorialTarget.userData.rifleGlow.visible=false;setActorLabel(tutorialTarget,getLanguageForTutorialTarget(),1);scene.add(tutorialTarget);bots.push(tutorialTarget);updateHud();
  },
  stop(){if(playing)endMatch();else restoreTutorialLoadout()},
  prepare(id){if(id==='attack'){camera.position.set(-5,1.7,4);yaw=0;pitch=0}if(id==='phase'){camera.position.set(0,1.7,-2);yaw=0;pitch=0;phase=100;phaseActive=0;verticalVelocity=0;grounded=true}if(id==='slide'){phaseActive=0;stopSlide();camera.position.set(-8,1.7,8);yaw=0;pitch=0;verticalVelocity=0;grounded=true}if(id==='throwable'){throwCharges=2;clearGrenadeCook()}if(id==='tactical'){equipmentReadyAt=0;clearGrenadeCook()}},
  state:()=>({x:camera.position.x,z:camera.position.z,targetHp:tutorialTarget?.userData.hp??100,aim:adsBlend,slot:activeWeaponSlot,weapon:weaponKey,phaseActive,sliding:!!slideStartedAt,throwCharges,tacticalReady:equipmentReadyAt}),
  closePanels:closeTutorialPanels,open(id){closeTutorialPanels();if(id==='openArmory'||id==='openEquipment')$('openLoadoutMode').click();$(id)?.click()},playSolo:()=>start(false,'normal')
});
function getLanguageForTutorialTarget(){return document.documentElement.lang==='en'?'Training target':'训练靶'}
const tutorialAnimateBase=animate;animate=function(now=performance.now()){tutorialClient.update(now);tutorialAnimateBase(now)};

window.addEventListener('astrift:account-banned',()=>{allowReconnect=false;clearTimeout(reconnectTimer);clearTimeout(extractionRetry);ws?.close();extractionSocket?.close();if(playing)endMatch();});
