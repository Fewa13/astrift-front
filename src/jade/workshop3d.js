// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Ported from Felix’s jade-night-market; market and account systems excluded.
import * as T from 'three';
import {jadeVariety} from './varieties.ts';
import {JADE_PATTERN_GLSL} from './patterns.ts';
import {createRockGeometry,splitRockGeometry,planeFromStroke,phaseOf,volumeAt,fragmentGeometry,fragmentSurfaceGeometry,splitShares,disposeSplit,measureGeometry} from './rock-geometry.js';
import {ORIGINS,GRADES,clamp,ensureCutPieces,applyVolumeAssay} from './stone-core.js';
import {jadeFractures,assessJadePlan,makeJadeBlank,jadeBlankPoint,CRAFT_LIMIT,JADE_BUDDHA_PARTS,JADE_BUDDHA_OUTLINE} from './craft.ts';
import {jadeProductGeometry,jadeCavityGeometry} from './craft-geometry.js';
const WIDTH=900,HEIGHT=600,HALF_W=2.15,HALF_H=HALF_W/1.5;
const vertexShader=`
 attribute float jade;varying float vFace;varying vec3 vLocal; varying vec3 vNormal; varying vec3 vEye;
 void main(){vFace=jade;vLocal=position;vec4 eye=modelViewMatrix*vec4(position,1.);vEye=-eye.xyz;vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*eye;}
`;
const BUDDHA_HOLE_GLSL=`bool buddhaHole(vec3 d,vec3 n,float radius){vec3 u=normalize(cross(n,abs(n.y)<.9?vec3(0.,1.,0.):vec3(1.,0.,0.))),v=cross(n,u);vec2 p=vec2(dot(d,u),dot(d,v))/radius;return ${JADE_BUDDHA_PARTS.map(([x,y,,rx,ry])=>`dot((p-vec2(${x.toFixed(6)},${y.toFixed(6)}))/vec2(${rx.toFixed(6)},${ry.toFixed(6)}),(p-vec2(${x.toFixed(6)},${y.toFixed(6)}))/vec2(${rx.toFixed(6)},${ry.toFixed(6)}))<=1.`).join('||')};}`;
const fragmentShader=`
 uniform vec3 uColorA,uColorB,uColorC,uWindowTint; uniform float uVariety,uQualityLustre;
 uniform vec4 uFractures[4];uniform float uFracturePhase[4],uFractureCount,uHoleCount,uHoleRows,uExpose,uPolish;uniform sampler2D uHoleData;
 uniform sampler2D uProbeMap,uProbeCrackMap; uniform vec3 uProbeU,uProbeV,uProbeSample; uniform float uProbeReady,uProbeCrackReady; uniform vec3 uSkin,uJade,uProbe,uProbeRead; uniform float uExternalProbe,uWindowCoverage; uniform float uPhase,uGrade,uCore,uCoreX,uCoreAngle,uCap,uWindow,uProbeOn,uCracks,uColor;
 varying float vFace;varying vec3 vLocal;varying vec3 vNormal;varying vec3 vEye;
 float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
 float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
 float coverage(vec3 p){vec3 d=p-vec3(uCoreX,sin(uPhase)*.12,cos(uPhase*1.7)*.2);float c=cos(uCoreAngle),s=sin(uCoreAngle);vec3 q=vec3(d.x*c+d.y*s,-d.x*s+d.y*c,d.z)/vec3(.4+uCore*.68,.6+uCore*.65,.48+uCore*.65);float cloud=sin(p.x*5.+sin(p.y*4.)*2.+uPhase)*cos(p.z*5.+p.y*3.-uPhase);return clamp(1.3-dot(q,q)+cloud*.15,0.,1.);}
 ${BUDDHA_HOLE_GLSL}
 ${JADE_PATTERN_GLSL}
 float jadePattern(vec3 p){return naturalJadePattern(uVariety,p,uPhase);}
 vec3 pigment(vec3 p){float t=jadePattern(p);if(uVariety>5.5&&uVariety<6.5)return t<.5?mix(uColorA,uColorB,t*2.):mix(uColorB,uColorC,(t-.5)*2.);return mix(uColorA,uColorB,t);}
 void main(){
  vec3 p=vLocal;
  for(int i=0;i<int(uHoleCount);i++){float row=(float(i)+.5)/uHoleRows;vec4 hole=texture2D(uHoleData,vec2(1./6.,row)),axis=texture2D(uHoleData,vec2(.5,row));vec4 shape=texture2D(uHoleData,vec2(5./6.,row));float inner=shape.x;vec3 d=p-hole.xyz;float t=-dot(d,axis.xyz),r=length(d+axis.xyz*t);if(t>-.001&&t<axis.w-.0002&&r<hole.w-.0002&&(inner<.0001||r>inner+.0002)&&(shape.y<.5||buddhaHole(d,axis.xyz,hole.w)))discard;}
  float n=noise(p*9.+uPhase),fine=hash(floor(p*350.));float vein=noise(p*22.+n*2.);
  vec3 normal=normalize(vNormal+vec3(n-.5,vein-.5,fine-.5)*mix(.08,.015,uQualityLustre));if(!gl_FrontFacing)normal=-normal;
  float diffuse=max(dot(normal,normalize(vec3(-.55,.8,1.))),0.);float rim=pow(1.-max(dot(normal,normalize(vEye)),0.),3.);
  vec3 skin=uSkin*(.62+n*.5)+(fine-.5)*.11+vec3(smoothstep(.64,.72,vein)*.055);
  float window=uWindow*(1.-smoothstep(.14,.20,distance(p,vec3(.32,.12,.92))));
  float cutFace=max(uCap,vFace);float face=max(cutFace,window);float cvFace=coverage(cutFace>.5?p:p*.78);if(uExternalProbe>.5&&cutFace<.5)cvFace=uWindowCoverage;vec3 material=mix(vec3(.43,.46,.38),mix(vec3(.39,.50,.39),uJade,uColor),cvFace*max(step(.5,uGrade),uExternalProbe*step(.02,uWindowCoverage)));
  if(uVariety>.5&&uGrade>.5)material=mix(vec3(.43,.46,.38),pigment(p)*(.75+uColor*.25),cvFace);
  if(uExternalProbe>.5&&cutFace<.5&&uWindow>.5)material=mix(vec3(.43,.46,.38),uWindowTint,cvFace);
  float cloud=noise(p*6.+uPhase);material*=.85+cloud*.3;
  float cracks=(1.-smoothstep(.0,.012+uCracks*.02,abs(noise(p*3.+uPhase)-.5)))*smoothstep(.47,.65,noise(p*8.-uPhase));material*=1.-cracks*(.15+uCracks*.3)*(1.-uExpose);
  float fissure=0.,fissureEdge=0.;
  for(int i=0;i<4;i++){if(float(i)>=uFractureCount)break;float d=abs(dot(p,uFractures[i].xyz)+uFractures[i].w+.025*sin(dot(p,vec3(9.,7.,5.))+uFracturePhase[i]));fissure=max(fissure,1.-smoothstep(.0015,.006,d));fissureEdge=max(fissureEdge,1.-smoothstep(.006,.012,d));}
  material=mix(material,vec3(.018,.027,.022),fissure*.94*uExpose);material+=vec3(.14,.16,.13)*max(0.,fissureEdge-fissure)*uExpose;
  vec3 color=mix(skin,material,face)*(.38+diffuse*.78)+rim*vec3(.025,.04,.025);
  float gloss=pow(max(dot(reflect(-normalize(vec3(-.55,.8,1.)),normal),normalize(vEye)),0.),38.);
  color+=gloss*(.02+face*.19*step(2.5,uGrade));
  vec3 reflected=reflect(-normalize(vEye),normal);float softbox=pow(max(0.,dot(reflected,normalize(vec3(-.45,.8,1.)))),18.);color+=uPolish*(softbox*.36+rim*.075)*vec3(.92,.98,.93);
  // View-dependent polish and softly transmitted jade color, without transparency sorting.
  float q=uQualityLustre;
  vec3 reflection=reflect(-normalize(vEye),normal);
  float ribbon=pow(max(0.,dot(reflection,normalize(vec3(-.7,.6,1.)))),mix(24.,55.,q));
  float fill=pow(max(0.,dot(reflection,normalize(vec3(.65,.35,.9)))),48.);
  float polishBand=exp(-pow((reflection.x+.20)/.105,2.))*smoothstep(-.20,.65,reflection.y);
  color+=q*(ribbon*1.4+fill*.5+polishBand*1.25)*vec3(.87,.96,1.);
  color+=material*q*(rim*.75+pow(max(dot(-normal,normalize(vec3(-.55,.8,1.))),0.),2.)*.28);
  color=mix(color,color+material*.22,q*face);
  if(uProbeOn>.5){
   vec3 delta=p-uProbe;float strength=uExternalProbe>.5?uProbeRead.z:coverage(p*.78)*(.16+uGrade*.15);
   float radius=.24+strength*.26;float irregular=.8+noise(p*16.+uPhase)*.35;
   float glow=exp(-pow(length(delta)/radius,2.)*2.4)*irregular;
   vec3 sampleDelta=p-uProbeSample;vec2 uv=vec2(dot(sampleDelta,uProbeU),dot(sampleDelta,uProbeV))/.92+.5;
   vec4 inside=texture2D(uProbeMap,clamp(uv,0.,1.));
   float valid=uProbeReady*smoothstep(0.,.14,min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y)));
   vec3 transmitted=mix(vec3(.47,.43,.32),inside.rgb,valid);
   // Interior clouding and fissures shape the beam instead of a flat green/yellow disk.
   color=mix(color,transmitted*(1.35+inside.a*.8),clamp(glow*.95,0.,.96));
   color+=exp(-pow(length(delta)/.045,2.))*vec3(.35,.32,.23);
   // Apply real fissure shadows AFTER illumination, so the bright lamp cannot erase them.
   float seam=texture2D(uProbeCrackMap,clamp(uv,0.,1.)).r*valid*uProbeCrackReady;
   color=mix(color,vec3(.012,.021,.016),clamp(seam*exp(-pow(length(delta)/max(radius,.32),2.)*1.2)*1.6,0.,.97));
  }
  gl_FragColor=vec4(color,1.);
  #include <colorspace_fragment>
 }
`;
function baseMaterialFor(a,cap=false){const v=jadeVariety(a.variety);return new T.ShaderMaterial({uniforms:{uQualityLustre:{value:0},uVariety:{value:v?.pattern||0},uColorA:{value:new T.Color(v?.colors[0]||'#8dba76')},uColorB:{value:new T.Color(v?.colors[1]||'#8dba76')},uColorC:{value:new T.Color(v?.colors[2]||'#8dba76')},uWindowTint:{value:a.windowTint?new T.Color().setRGB(...a.windowTint):new T.Color('#8dba76')},uProbeMap:{value:null},uProbeU:{value:new T.Vector3(1,0,0)},uProbeV:{value:new T.Vector3(0,1,0)},uProbeSample:{value:new T.Vector3()},uProbeReady:{value:0},uExternalProbe:{value:a.externalProbe?1:0},uWindowCoverage:{value:a.windowCoverage||0},uProbeRead:{value:new T.Vector3(.025,0,.025)},uSkin:{value:new T.Color(ORIGINS[a.origin].color)},uJade:{value:new T.Color(GRADES[a.externalProbe?1:a.grade].color)},uProbe:{value:new T.Vector3(0,0,.95)},uProbeOn:{value:0},uPhase:{value:phaseOf(a)},uGrade:{value:a.grade},uCore:{value:a.core},uCoreX:{value:(a.coreX-50)*.025},uCoreAngle:{value:a.coreAngle*Math.PI/180},uCap:{value:cap?1:0},uWindow:{value:a.window?1:0},uCracks:{value:a.cracks},uColor:{value:a.color}},vertexShader,fragmentShader,side:T.DoubleSide});}
function materialFor(a,cap=false,holes=[],polish=false){
 const m=baseMaterialFor(a,cap),fractures=jadeFractures(a),rows=Math.max(1,holes.length),data=new Float32Array(rows*12);holes.forEach((h,i)=>data.set([...h.point,h.radius,...h.normal,h.depth,h.inner,h.kind==='buddha'?1:0,0,0],i*12));const holeData=new T.DataTexture(data,3,rows,T.RGBAFormat,T.FloatType);holeData.needsUpdate=true;m.addEventListener('dispose',()=>holeData.dispose());Object.assign(m.uniforms,{
  uProbeCrackMap:{value:null},uProbeCrackReady:{value:0},uExpose:{value:a.stage==='cut'?1:0},uPolish:{value:polish?1:0},uFractureCount:{value:fractures.length},uFractures:{value:Array.from({length:4},(_,i)=>new T.Vector4(...(fractures[i]?[...fractures[i].normal,fractures[i].offset]:[0,0,0,0])))},uFracturePhase:{value:Array.from({length:4},(_,i)=>fractures[i]?.phase||0)},
  uHoleCount:{value:holes.length},uHoleRows:{value:rows},uHoleData:{value:holeData}
 });return m;
}
export function createJadeProductMaterial(model,blank,quality=1){const bore=blank.kind==='bead'?{...blank,radius:blank.radius*.11,inner:0}:null;const material=materialFor({...model,stage:'cut'},true,bore?[bore]:[],true);material.uniforms.uQualityLustre.value=(Math.max(1,Math.min(8,quality))-1)/7;return material;}
export function mountWorkshop3D(canvas,overlay,a,callbacks={}){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});
 renderer.setPixelRatio(1);renderer.setSize(WIDTH,HEIGHT,false);renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;
 overlay.width=WIDTH;overlay.height=HEIGHT;const ink=overlay.getContext('2d');
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-HALF_W,HALF_W,HALF_H,-HALF_H,.1,30);camera.position.set(0,0,7);camera.lookAt(0,0,0);
 const root=new T.Group();scene.add(root);
 const originalGeometry=createRockGeometry(a),selectedPiece=a.stage==='cut'?ensureCutPieces(a).find(p=>p.id===callbacks.selectedPiece):null,canCut=!callbacks.product&&(a.stage==='raw'||!!selectedPiece);
 const product=callbacks.product,geometry=product?jadeProductGeometry(product.blank):selectedPiece?fragmentGeometry(originalGeometry,selectedPiece.path):originalGeometry,focusCenter=new T.Vector3();
 if(selectedPiece||product){geometry.computeBoundingBox();geometry.boundingBox.getCenter(focusCenter);}
 const bore=product?.blank.kind==='bead'?{...product.blank,radius:product.blank.radius*.11,inner:0}:null;
 const skin=materialFor(a,!!product,bore?[bore]:selectedPiece?.holes,!!product),jade=materialFor(a,true),raw=new T.Mesh(geometry,skin);raw.position.copy(focusCenter).negate();root.add(raw);
 const ray=new T.Raycaster(),quaternion=new T.Quaternion();
 let pose={yaw:a.view3d?.yaw??-.28,pitch:a.view3d?.pitch??.14,roll:a.view3d?.roll??0},mode='rotate',probeOn=false,probePoint=new T.Vector3().fromArray(a.probe3d??[0,0,.95]),pointer=null,stroke=null,saw=null,parts=null,disposed=false;
 let separation=0,frame=0,probePresent=false,probeSequence=0,probeTimer=0,lastProbe=-1000,probeBusy=false,probePending=false;
 if(product){const b=product.blank,q=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(...b.u),new T.Vector3(...b.v),new T.Vector3(...b.normal)).invert()),e=new T.Euler().setFromQuaternion(q,'YXZ');pose={yaw:e.y,pitch:e.x,roll:e.z};}
 let craftSettings=null,craftLayout=null,craftAssay=null,craftAnimation=null,craftTool=null;
 let craftLayouts=[],craftAssays=[],activeCraft=-1,animationIndex=-1,craftLighting=false;
 let editingCraft=false,hoverPoint=null,ghostKey='',ghost=null;
 const ghostMaterial=new T.MeshBasicMaterial({color:0xb5bdb9,transparent:true,opacity:.46,depthWrite:false,depthTest:false,side:T.DoubleSide});
 function hideCraftGhost(){if(ghost)ghost.visible=false;canvas.dataset.craftHover='false';}
 function hoverCraft(p){
  hoverPoint=p;if(mode!=='craft'||!selectedPiece||!craftSettings||callbacks.isBusy?.()){hideCraftGhost();schedule();return;}
  const hit=rayHit(p),face=hit?selectedPiece.path.findIndex(f=>Math.abs(new T.Vector3(...f.normal).dot(hit)+f.constant)<.003):-1;
  const b=face<0?null:makeJadeBlank({weight:a.weight},selectedPiece,{kind:craftSettings.kind,size:craftSettings.size,face,point:hit.toArray()});
  if(!b){hideCraftGhost();schedule();return;}
  const key=b.kind+':'+b.size+':'+face;
  if(key!==ghostKey){if(ghost){ghost.geometry.dispose();ghost.removeFromParent();}ghost=new T.Mesh(jadeProductGeometry({...b,point:[0,0,0]},true),ghostMaterial);ghost.name='craft-hover-preview';ghost.renderOrder=8;root.add(ghost);ghostKey=key;}
  ghost.visible=true;ghost.position.fromArray(b.point).sub(focusCenter);canvas.dataset.craftHover='true';canvas.dataset.craftHoverPoint=b.point.join(',');canvas.dataset.craftHoverKind=b.kind;schedule();
 }
 const probeTexture=new T.DataTexture(new Uint8Array(17*17*4),17,17,T.RGBAFormat);probeTexture.minFilter=probeTexture.magFilter=T.LinearFilter;probeTexture.needsUpdate=true;skin.uniforms.uProbeMap.value=probeTexture;
 const probeCrackTexture=new T.DataTexture(new Uint8Array(49*49),49,49,T.RedFormat);probeCrackTexture.minFilter=probeCrackTexture.magFilter=T.LinearFilter;probeCrackTexture.unpackAlignment=1;probeCrackTexture.needsUpdate=true;skin.uniforms.uProbeCrackMap.value=probeCrackTexture;
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=128;const sc=shadowCanvas.getContext('2d'),sg=sc.createRadialGradient(128,64,3,128,64,125);sg.addColorStop(0,'#0008');sg.addColorStop(1,'#0000');sc.fillStyle=sg;sc.fillRect(0,0,256,128);
 const shadowTexture=new T.CanvasTexture(shadowCanvas),shadowMaterial=new T.SpriteMaterial({map:shadowTexture,depthWrite:false,opacity:.85}),shadow=new T.Sprite(shadowMaterial);shadow.position.set(0,-1.14,-.4);shadow.scale.set(3.7,.9,1);scene.add(shadow);
 const allGeometries=[...new Set([originalGeometry,geometry])],allMaterials=[skin,jade,shadowMaterial];
 // The nearest visible face records BOTH ownership and cut/skin identity.
 // Back-crack hints may only pass through a cut face of their own piece.
 const backCracks=[],pieceIds=new WeakMap();let nextPieceId=1;
 const crackFront=new T.WebGLRenderTarget(WIDTH,HEIGHT,{minFilter:T.NearestFilter,magFilter:T.NearestFilter,depthBuffer:true,stencilBuffer:false});
 crackFront.depthTexture=new T.DepthTexture(WIDTH,HEIGHT,T.UnsignedIntType);
 const crackMaskMaterial=new T.ShaderMaterial({vertexShader:`attribute float jade,crackPiece;varying float face,piece;void main(){face=jade;piece=crackPiece;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying float face,piece;void main(){gl_FragColor=vec4(piece/255.,face,0.,1.);}`,side:T.DoubleSide});
 crackMaskMaterial.defaultAttributeValues.crackPiece=[0];
 allMaterials.push(crackMaskMaterial);
 function addBackCracks(parent,geo,offset,base=skin){
  if(a.stage!=='cut'||!jadeFractures(a).length)return;
  let id=pieceIds.get(parent);if(!id){id=nextPieceId++;pieceIds.set(parent,id);}
  geo.setAttribute('crackPiece',new T.Float32BufferAttribute(new Float32Array(geo.getAttribute('position').count).fill(id),1));
  const mat=new T.ShaderMaterial({uniforms:{...base.uniforms,uFrontMask:{value:crackFront.texture},uFrontDepth:{value:crackFront.depthTexture},uPieceId:{value:id},uFrameSize:{value:new T.Vector2(WIDTH,HEIGHT)},uCameraRange:{value:new T.Vector2(camera.near,camera.far)},uStoneScale:{value:1}},vertexShader,fragmentShader:`
   uniform vec4 uFractures[4];
   uniform float uFracturePhase[4],uFractureCount,uHoleCount,uHoleRows;uniform sampler2D uHoleData;
   uniform sampler2D uFrontMask,uFrontDepth;uniform vec2 uFrameSize,uCameraRange;uniform float uPieceId,uStoneScale;
   varying vec3 vLocal,vEye;
   ${BUDDHA_HOLE_GLSL}
   void main(){vec2 uv=gl_FragCoord.xy/uFrameSize;vec4 front=texture2D(uFrontMask,uv);
    if(abs(front.r*255.-uPieceId)>.25||front.g<.5)discard;
    float frontZ=mix(uCameraRange.x,uCameraRange.y,texture2D(uFrontDepth,uv).r);
    float depth=(vEye.z-frontZ)/max(.001,uStoneScale);
    if(depth<.008||depth>=.30)discard;
    float fade=1.-smoothstep(.025,.30,depth);vec3 p=vLocal;
    for(int i=0;i<int(uHoleCount);i++){float row=(float(i)+.5)/uHoleRows;vec4 hole=texture2D(uHoleData,vec2(1./6.,row)),axis=texture2D(uHoleData,vec2(.5,row));vec4 shape=texture2D(uHoleData,vec2(5./6.,row));float inner=shape.x;vec3 d=p-hole.xyz;float t=-dot(d,axis.xyz),r=length(d+axis.xyz*t);if(t>-.001&&t<axis.w-.0002&&r<hole.w-.0002&&(inner<.0001||r>inner+.0002)&&(shape.y<.5||buddhaHole(d,axis.xyz,hole.w)))discard;}
    float line=0.;for(int i=0;i<4;i++){if(float(i)>=uFractureCount)break;float d=abs(dot(p,uFractures[i].xyz)+uFractures[i].w+.025*sin(dot(p,vec3(9.,7.,5.))+uFracturePhase[i]));line=max(line,1.-smoothstep(.002,.009,d));}
    if(line<.03)discard;gl_FragColor=vec4(.76,.78,.77,line*.7*fade);
   }`,side:T.BackSide,transparent:true,depthTest:false,depthWrite:false});
  const mesh=new T.Mesh(geo,mat);mesh.position.copy(offset);mesh.renderOrder=5;parent.add(mesh);backCracks.push(mesh);allMaterials.push(mat);canvas.dataset.backCracks='gray';canvas.dataset.backCrackOcclusion='own-cut-face-depth';
 }
 if(a.stage==='cut'&&(selectedPiece||product))addBackCracks(root,geometry,raw.position);
 function addCavities(parent,piece,offset){for(const hole of piece.holes||[]){const original=jadeCavityGeometry(hole,piece.openBore),geo=piece.path?.length?fragmentSurfaceGeometry(original,piece.path):original,mat=materialFor(a,true),mesh=new T.Mesh(geo,mat);if(geo!==original)original.dispose();mesh.position.copy(offset).negate();parent.add(mesh);allGeometries.push(geo);allMaterials.push(mat);}}
 if(selectedPiece&&!product)addCavities(root,selectedPiece,focusCenter);
 if(bore)addCavities(root,{holes:[bore],openBore:true},focusCenter);
 function applyPose(){root.quaternion.setFromEuler(new T.Euler(pose.pitch,pose.yaw,pose.roll||0,'YXZ'));quaternion.copy(root.quaternion);root.updateMatrixWorld(true);fitView();canvas.dataset.yaw=pose.yaw.toFixed(3);canvas.dataset.pitch=pose.pitch.toFixed(3);callbacks.onPose?.(pose);}
 function fitView(){root.scale.setScalar(1);root.updateMatrixWorld(true);const ghostParent=ghost?.parent;if(ghostParent)ghost.removeFromParent();const box=new T.Box3().setFromObject(root);if(ghostParent)ghostParent.add(ghost);const mx=Math.max(Math.abs(box.min.x),Math.abs(box.max.x)),my=Math.max(Math.abs(box.min.y),Math.abs(box.max.y));root.scale.setScalar(Math.min(product?12:1,1.9/mx,1.19/my));root.updateMatrixWorld(true);}
 function project(p){const v=root.localToWorld(p.clone().sub(focusCenter)).project(camera);return {x:(v.x*.5+.5)*WIDTH,y:(.5-v.y*.5)*HEIGHT};}
 function rayHit(p){ray.setFromCamera(new T.Vector2(p.x*2-1,1-p.y*2),camera);root.updateMatrixWorld(true);const hit=ray.intersectObject(raw,false)[0];return hit?root.worldToLocal(hit.point.clone()).add(focusCenter):null;}
 function placeCraft(p){
  if(!selectedPiece||!craftSettings)return;const reject=()=>{updateCraftPlan('Choose a flat cut face');};const hit=rayHit(p);if(!hit){reject();return;}
  const point=hit.toArray(),face=selectedPiece.path.findIndex(f=>Math.abs(new T.Vector3(...f.normal).dot(hit)+f.constant)<.003);
  if(face<0){reject();return;}
  if(!editingCraft||activeCraft<0){
   if(craftLayouts.length>=CRAFT_LIMIT){updateCraftPlan('Craft batch limit reached');return;}
   const candidate={kind:craftSettings.kind,size:craftSettings.size,face,point},check=assessJadePlan({weight:a.weight,jade:a},selectedPiece,[...craftLayouts,candidate]),item=check.items.at(-1);
   if(!item?.valid){
    let error=item?.error||'Not enough solid material';
    if(error==='Not enough solid material'&&assessJadePlan({weight:a.weight,jade:a},{...selectedPiece,holes:[]},[candidate]).valid)error='Overlaps a previous cut';
    updateCraftPlan(error);return;
   }
   activeCraft=craftLayouts.length;
  }
  craftLayouts[activeCraft]={kind:craftSettings.kind,size:craftSettings.size,face,point};updateCraftPlan();
 }
 function updateCraftPlan(error=''){
  const result=assessJadePlan({weight:a.weight,jade:a},selectedPiece,craftLayouts);craftAssays=result.items;craftLayout=craftLayouts[activeCraft]||null;craftAssay=craftAssays[activeCraft]||null;
  canvas.dataset.craftValid=String(result.valid);canvas.dataset.craftCount=String(craftLayouts.length);canvas.dataset.craftEditing=String(editingCraft);
  callbacks.onCraft?.({...result,...(error?{error}:{}),layout:craftLayout,layouts:craftLayouts.map(p=>({...p,point:[...p.point]})),active:activeCraft,editing:editingCraft});schedule();
 }
 function drawCraft(){for(let i=0;i<craftAssays.length;i++)drawCraftItem(craftAssays[i],i===activeCraft);}
 function drawCraftItem(assay,selected){
  const b=assay?.blank;if(!b)return;
  ink.save();const circle=(r,depth,dashed=false)=>{ink.beginPath();for(let j=0;j<=96;j++){const p=project(new T.Vector3(...jadeBlankPoint(b,r,depth,j/96*Math.PI*2)));j?ink.lineTo(p.x,p.y):ink.moveTo(p.x,p.y);}ink.setLineDash(dashed?[7,7]:[]);ink.strokeStyle='#050807';ink.lineWidth=6;ink.stroke();ink.strokeStyle='#fff';ink.lineWidth=2.5;ink.stroke();};
  if(b.kind==='buddha'){
   // Trace the actual carving silhouette, not the cylindrical machine envelope.
   const at=(x,y)=>project(new T.Vector3(...b.point.map((p,k)=>p+b.u[k]*x*b.radius+b.v[k]*y*b.radius)));
   const outline=new Path2D();
   for(const [x,y,u,v]of JADE_BUDDHA_OUTLINE){const a=at(x,y),c=at(u,v);outline.moveTo(a.x,a.y);outline.lineTo(c.x,c.y);}
   // Face, belly and folded legs make the small placement readable at workshop scale.
   for(const i of [0,1,7,8,9,10,12,13,14,15,16]){const [cx,cy,,rx,ry]=JADE_BUDDHA_PARTS[i];for(let j=0;j<=48;j++){const angle=j/48*Math.PI*2,p=at(cx+rx*Math.cos(angle),cy+ry*Math.sin(angle));if(j)outline.lineTo(p.x,p.y);else outline.moveTo(p.x,p.y);}}
   ink.setLineDash([]);ink.strokeStyle='#050807';ink.lineWidth=5;ink.stroke(outline);ink.strokeStyle=assay.valid?'#fff':'#ff786b';ink.lineWidth=1.7;ink.stroke(outline);canvas.dataset.craftPlacedShape='buddha';
  }else{circle(b.radius,0);if(b.inner)circle(b.inner,0);circle(b.radius,b.depth,true);if(b.inner)circle(b.inner,b.depth,true);}
  const p=project(new T.Vector3(...b.point));ink.setLineDash([]);ink.strokeStyle=assay.valid?'#fff':'#ff786b';ink.lineWidth=selected?2:1;ink.beginPath();ink.moveTo(p.x-8,p.y);ink.lineTo(p.x+8,p.y);ink.moveTo(p.x,p.y-8);ink.lineTo(p.x,p.y+8);ink.stroke();
  if(craftAnimation!==null&&selected){const angle=craftAnimation*Math.PI*6,r=b.radius,pos=project(new T.Vector3(...jadeBlankPoint(b,r,b.depth*Math.min(1,craftAnimation*2),angle)));ink.fillStyle='#fff1a9';ink.shadowColor='#ffc85b';ink.shadowBlur=14;ink.beginPath();ink.arc(pos.x,pos.y,6,0,7);ink.fill();for(let i=0;i<12;i++){const t=angle+i*2.4;ink.fillRect(pos.x+Math.cos(t)*(10+i*2),pos.y+Math.sin(t)*(6+i*2),2,2);}}
  ink.restore();
 }
 function getPoint(e){const r=canvas.getBoundingClientRect();return {x:clamp((e.clientX-r.left)/r.width,-.25,1.25),y:clamp((e.clientY-r.top)/r.height,-.25,1.25)};}
 function reportProbe(){
  if(!callbacks.requestProbe){const local=probePoint.clone().multiplyScalar(.78),info=volumeAt(a,local);callbacks.onProbe?.({...info,point:probePoint.toArray()});return;}
  probePending=true;if(probeBusy||probeTimer)return;
  const run=()=>{
   probeTimer=0;if(disposed||!probeOn||!probePresent){probePending=false;return;}
   probePending=false;probeBusy=true;lastProbe=performance.now();
   const point=probePoint.toArray();
   Promise.resolve(callbacks.requestProbe(point)).then(info=>{
    if(disposed||!probeOn||!info)return;
    skin.uniforms.uProbeRead.value.set(info.strength||.025,info.coverage||0,info.glow||.025);
    const p=info.patch;if(p?.size===17&&p.pixels?.length===17*17*4){
     probeTexture.image.data.set(p.pixels);probeTexture.needsUpdate=true;
     skin.uniforms.uProbeU.value.fromArray(p.u);skin.uniforms.uProbeV.value.fromArray(p.v);
     skin.uniforms.uProbeSample.value.fromArray(p.point);skin.uniforms.uProbeReady.value=1;
     const mask=p.crackMask,validMask=mask?.size===49&&mask.pixels?.length===49*49;
     skin.uniforms.uProbeCrackReady.value=validMask?1:0;
     if(validMask){probeCrackTexture.image.data.set(mask.pixels);probeCrackTexture.needsUpdate=true;}
    }
    callbacks.onProbe?.({...info,point});schedule();
   }).catch(e=>{if(!disposed)callbacks.onProbeError?.(e);}).finally(()=>{
    probeBusy=false;if(probePending&&!disposed&&probeOn&&probePresent)reportProbe();
   });
  };
  const wait=180-(performance.now()-lastProbe);if(wait>0)probeTimer=setTimeout(run,wait);else run();
 }
 function drawInk(){
  ink.clearRect(0,0,WIDTH,HEIGHT);drawCraft();
  if(stroke){ink.save();ink.strokeStyle='#ead094';ink.lineWidth=2;ink.setLineDash([9,6]);ink.beginPath();ink.moveTo(stroke.start.x*WIDTH,stroke.start.y*HEIGHT);ink.lineTo(stroke.end.x*WIDTH,stroke.end.y*HEIGHT);ink.stroke();ink.setLineDash([]);for(const p of [stroke.start,stroke.end]){ink.beginPath();ink.arc(p.x*WIDTH,p.y*HEIGHT,5,0,Math.PI*2);ink.fillStyle='#f2d99d';ink.fill();}ink.restore();}
  if(saw){const {start,end,progress}=saw,x=start.x+(end.x-start.x)*progress,y=start.y+(end.y-start.y)*progress;ink.save();ink.strokeStyle='#1a251c';ink.lineWidth=6;ink.beginPath();ink.moveTo(start.x,start.y);ink.lineTo(x,y);ink.stroke();ink.strokeStyle='#e9c575';ink.lineWidth=2;ink.stroke();ink.translate(x,y);ink.rotate(Math.atan2(end.y-start.y,end.x-start.x));ink.fillStyle='#d1bd86';ink.fillRect(-11,-5,22,10);for(let i=0;i<16;i++){ink.fillStyle=i%2?'#f8dfa4':'#9ead94';ink.fillRect(Math.sin(i*14+progress*74)*24,Math.cos(i*6+progress*98)*30,2,2);}ink.restore();}
  if(probeOn&&probePresent&&a.stage==='raw'){
   const p=project(probePoint);ink.save();ink.translate(p.x,p.y);ink.rotate(.55);ink.fillStyle='#14221c';ink.strokeStyle='#9cae96';ink.lineWidth=2;ink.beginPath();ink.roundRect(7,-10,73,20,4);ink.fill();ink.stroke();ink.fillStyle='#bba56c';ink.fillRect(0,-12,7,24);ink.fillStyle='#fff1bc';ink.fillRect(-1,-7,3,14);for(let i=0;i<4;i++){ink.fillStyle='#405347';ink.fillRect(25+i*7,-8,3,16);}ink.restore();
  }
  // Small axis glyph changes with rotation and makes the depth orientation legible.
  const origin={x:WIDTH-53,y:HEIGHT-43};for(const [axis,color,label] of [[new T.Vector3(1,0,0),'#bc9b72','X'],[new T.Vector3(0,1,0),'#91ae81','Y'],[new T.Vector3(0,0,1),'#86a6ab','Z']]){axis.applyQuaternion(root.quaternion);ink.strokeStyle=color;ink.beginPath();ink.moveTo(origin.x,origin.y);ink.lineTo(origin.x+axis.x*23,origin.y-axis.y*23);ink.stroke();ink.fillStyle=color;ink.font='9px monospace';ink.fillText(label,origin.x+axis.x*30-3,origin.y-axis.y*30+3);}
 }
 function render(){if(disposed)return;canvas.style.cursor=mode==='light'&&probePresent&&a.stage==='raw'?'none':mode==='light'||mode==='cut'||mode==='craft'?'crosshair':'grab';canvas.dataset.probeCursor=mode==='light'&&probePresent&&a.stage==='raw'?'lamp':'normal';skin.uniforms.uProbeOn.value=probeOn&&probePresent&&a.stage==='raw'?1:0;skin.uniforms.uProbe.value.copy(probePoint);
  if(backCracks.length){
   const shadowVisible=shadow.visible,toolVisible=craftTool?.visible,ghostVisible=ghost?.visible;shadow.visible=false;if(craftTool)craftTool.visible=false;if(ghost)ghost.visible=false;
   for(const mesh of backCracks){mesh.visible=false;mesh.material.uniforms.uStoneScale.value=root.scale.x;}
   scene.overrideMaterial=crackMaskMaterial;renderer.setRenderTarget(crackFront);renderer.clear();renderer.render(scene,camera);renderer.setRenderTarget(null);scene.overrideMaterial=null;
   shadow.visible=shadowVisible;if(craftTool)craftTool.visible=toolVisible;if(ghost)ghost.visible=ghostVisible;for(const mesh of backCracks)mesh.visible=true;
  }
  renderer.render(scene,camera);drawInk();}
 function schedule(){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;render();});}
 function buildParts(data){
  if(parts)return;
  const plane=new T.Plane(new T.Vector3().fromArray(data.normal),data.constant),split=splitRockGeometry(geometry,plane);
  const original=data.view??{yaw:-.28,pitch:.14},cutPose=new T.Quaternion().setFromEuler(new T.Euler(original.pitch,original.yaw,original.roll||0,'YXZ'));
  const front=new T.Vector3(0,0,1).applyQuaternion(cutPose.invert());
  parts=[1,-1].map((side,i)=>{
   const group=new T.Group(),surface=i===0?split.positive:split.negative,cap=i===0?split.capPositive:split.capNegative;
   const pivot=split.center.clone();const skinMesh=new T.Mesh(surface,skin),capMesh=new T.Mesh(cap,jade);skinMesh.position.copy(pivot).negate();capMesh.position.copy(skinMesh.position);group.add(skinMesh,capMesh);group.position.copy(pivot).sub(focusCenter);root.add(group);
   addBackCracks(group,surface,skinMesh.position);addBackCracks(group,cap,capMesh.position);
   allGeometries.push(surface,cap);
   const outward=plane.normal.clone().multiplyScalar(-side),target=outward.clone().multiplyScalar(.85).addScaledVector(front,.55).normalize(),rotation=new T.Quaternion().setFromUnitVectors(outward,target);
   return {group,pivot,side,normal:plane.normal,rotation};
  });raw.visible=false;
 }
 function openParts(progress){separation=progress;for(const p of parts??[]){p.group.position.copy(p.pivot).sub(focusCenter).addScaledVector(p.normal,p.side*.85*progress);p.group.quaternion.identity().slerp(p.rotation,progress);}fitView();}
 function beginCut(data){
  stroke=null;const plane=new T.Plane(new T.Vector3().fromArray(data.normal),data.constant),split=splitRockGeometry(geometry,plane);
  const projected=split.ring.map(project),start=data.stroke.start,end=data.stroke.end,dx=end.x-start.x,dy=end.y-start.y;
  projected.sort((a,b)=>(a.x*dx+a.y*dy)-(b.x*dx+b.y*dy));
  saw={start:projected[0],end:projected.at(-1),progress:0};
  for(const g of [split.positive,split.negative,split.capPositive,split.capNegative])g.dispose();render();
 }
 function animateCut(progress,data){
  if(progress<.68){if(saw)saw.progress=progress/.68;}
  else{buildParts(data);saw=null;const t=(progress-.68)/.32;openParts(t*t*(3-2*t));}
  render();
 }
 function cutFromStroke(start,end){
  if(Math.hypot((end.x-start.x)*WIDTH,(end.y-start.y)*HEIGHT)<35)throw Error('切线太短，请划过石头画一条长一点的线。');
  let hits=0;for(let i=0;i<=12;i++){const t=i/12;if(rayHit({x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t}))hits++;}if(hits<2)throw Error('切线没有穿过石头，请在石头上划一刀。');
  const plane=planeFromStroke(start,end,root.quaternion,HALF_W/root.scale.x,HALF_H/root.scale.x);plane.constant-=plane.normal.dot(focusCenter);const split=splitRockGeometry(geometry,plane);
  const measured=splitShares(split,a);const valid=measured.massShares.every(x=>x>.012)&&split.ring.length>=8&&split.positive.getAttribute('position').count>60&&split.negative.getAttribute('position').count>60;
  for(const g of [split.positive,split.negative,split.capPositive,split.capNegative])g.dispose();if(!valid)throw Error('切线太靠边，请划过石头内部。');
  const total=measureGeometry(originalGeometry,a);
  return {normal:plane.normal.toArray(),constant:plane.constant,stroke:{start,end},view:{...pose},assay:{version:2,solidVolume:total.volume,jadeVolume:total.jade},...measured};
 }
 function finishPointer(e,cancelled=false){
  if(!pointer||e.pointerId!==pointer.id)return;
  const drawn=mode==='cut'&&stroke;pointer=null;
  if(cancelled){stroke=null;schedule();return;}
  if(drawn){const line=stroke;stroke=null;try{callbacks.onCut?.(cutFromStroke(line.start,line.end));schedule();}catch(err){callbacks.onError?.(err.message);schedule();}}
  else callbacks.onCommit?.();
 }
 canvas.onpointerdown=e=>{
  if(callbacks.isBusy?.()||pointer||e.button!==0)return;
  canvas.setPointerCapture(e.pointerId);const p=getPoint(e);pointer={id:e.pointerId,last:p};
  if(mode==='craft'){hideCraftGhost();placeCraft(p);}
  else if(mode==='cut'&&canCut){stroke={start:p,end:p};schedule();}
  else if(mode==='light'&&a.stage==='raw'){const hit=rayHit(p);if(hit){probePresent=true;probePoint.copy(hit);a.probe3d=hit.toArray();reportProbe();schedule();}}
 };
 canvas.onpointermove=e=>{
  if(callbacks.isBusy?.())return;const p=getPoint(e);if(mode==='craft')hoverCraft(p);if(!pointer){if(mode==='light'&&a.stage==='raw'){const hit=rayHit(p);probePresent=!!hit;if(hit){probePoint.copy(hit);reportProbe();}else{probeSequence++;clearTimeout(probeTimer);probeTimer=0;}schedule();}return;}if(pointer.id!==e.pointerId)return;
  if(mode==='rotate'||!canCut){
   pose.yaw+=(p.x-pointer.last.x)*5.5;pose.pitch=clamp(pose.pitch+(p.y-pointer.last.y)*4.3,-1.5,1.5);a.view3d={...pose};applyPose();
  }else if(mode==='light'){
   const hit=rayHit(p);if(hit){probePresent=true;probePoint.copy(hit);a.probe3d=hit.toArray();reportProbe();}else{probePresent=false;callbacks.onProbe?.({label:'灯光未贴住石面，请移到石头上观察。',point:null});}
  }else if(stroke)stroke.end=p;
  pointer.last=p;schedule();
 };
 canvas.onpointerenter=e=>{if(mode==='light'||mode==='craft')canvas.onpointermove(e);};canvas.onpointerleave=()=>{hoverPoint=null;hideCraftGhost();if(!pointer){probePresent=false;probeSequence++;clearTimeout(probeTimer);probeTimer=0;schedule();}};
 canvas.onpointerup=e=>finishPointer(e);canvas.onpointercancel=e=>finishPointer(e,true);canvas.onlostpointercapture=e=>finishPointer(e,true);
 canvas.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)||callbacks.isBusy?.())return;e.preventDefault();pose.yaw+=e.key==='ArrowRight'?.15:e.key==='ArrowLeft'?-.15:0;pose.pitch=clamp(pose.pitch+(e.key==='ArrowDown'?.15:e.key==='ArrowUp'?-.15:0),-1.5,1.5);a.view3d={...pose};applyPose();schedule();callbacks.onCommit?.();};
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(!disposed)callbacks.onError?.('立体画面暂时中断，请刷新页面恢复；存档已保留。');});
 applyPose();
 if(a.stage==='cut'&&!selectedPiece&&!product){
  const pieces=ensureCutPieces(a);
  if(pieces.length===2&&pieces.every(p=>p.depth===1&&!p.holes?.length)){const data=a.cut.plane3d??legacyPlane(a);buildParts(data);openParts(1);}
  else{
   raw.visible=false;const cols=Math.min(4,Math.ceil(Math.sqrt(pieces.length))),rows=Math.ceil(pieces.length/cols);
   for(let i=0;i<pieces.length;i++){const geo=fragmentGeometry(originalGeometry,pieces[i].path);geo.computeBoundingBox();const center=geo.boundingBox.getCenter(new T.Vector3()),pieceMat=materialFor(a,false,pieces[i].holes),mesh=new T.Mesh(geo,pieceMat),group=new T.Group();allMaterials.push(pieceMat);mesh.position.copy(center).negate();group.add(mesh);addBackCracks(group,geo,mesh.position,pieceMat);addCavities(group,pieces[i],center);group.position.set((i%cols-(cols-1)/2)*2.1,((rows-1)/2-Math.floor(i/cols))*1.8,0);const last=pieces[i].path.at(-1),outward=new T.Vector3().fromArray(last.normal).multiplyScalar(-last.side),front=new T.Vector3(0,0,1).applyQuaternion(root.quaternion.clone().invert());group.quaternion.setFromUnitVectors(outward,outward.clone().multiplyScalar(.25).addScaledVector(front,.8).normalize());root.add(group);allGeometries.push(geo);}fitView();
  }
 }
 canvas.dataset.renderer='webgl';render();
 return {
  setCraft(settings){
   craftSettings={...settings};
   if(mode!=='craft'&&!craftLayout&&selectedPiece){const f=selectedPiece.path.at(-1),blank=makeJadeBlank({weight:a.weight},selectedPiece,{...settings,face:selectedPiece.path.length-1,point:f.normal.map(x=>-x*f.constant)}),q=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(...blank.u),new T.Vector3(...blank.v),new T.Vector3(...blank.normal)).invert()),e=new T.Euler().setFromQuaternion(q,'YXZ');pose={yaw:e.y,pitch:e.x,roll:e.z};applyPose();}
   mode='craft';canvas.dataset.mode='craft';canvas.style.cursor='crosshair';
   if(settings.startNew){activeCraft=-1;editingCraft=false;}
   else if(editingCraft&&activeCraft>=0)craftLayouts[activeCraft]={...craftLayouts[activeCraft],kind:settings.kind,size:settings.size};
   updateCraftPlan();if(hoverPoint)hoverCraft(hoverPoint);
  },
  selectCraft(index){if(!craftLayouts[index])return;activeCraft=index;editingCraft=true;craftSettings={kind:craftLayouts[index].kind,size:craftLayouts[index].size};mode='craft';canvas.dataset.mode='craft';updateCraftPlan();},
  removeCraft(index){if(index<0||index>=craftLayouts.length)return;craftLayouts.splice(index,1);activeCraft=-1;editingCraft=false;updateCraftPlan();},
  craftCount(){return craftLayouts.length;},
  clearCraft(){craftLayouts=[];activeCraft=-1;editingCraft=false;updateCraftPlan();},
  animateCraft(progress){
   const count=craftAssays.length||1,index=Math.min(count-1,Math.floor(progress*count));
   if(index!==animationIndex){craftTool?.removeFromParent();craftTool=null;animationIndex=index;}
   progress=Math.min(1,progress*count-index);activeCraft=index;craftAssay=craftAssays[index];craftAnimation=progress;const b=craftAssay?.blank;
   if(b&&!craftTool){
    craftTool=new T.Group();root.add(craftTool);const metal=new T.MeshStandardMaterial({color:'#adb9b7',metalness:.78,roughness:.24,side:T.DoubleSide}),grit=new T.MeshStandardMaterial({color:'#4c5754',metalness:.4,roughness:.75});allMaterials.push(metal,grit);
    const tube=new T.CylinderGeometry(b.radius+.003,b.radius+.003,.26,64,1,true),rim=new T.TorusGeometry(b.radius+.003,.008,6,64),shaft=new T.CylinderGeometry(b.radius*.22,b.radius*.22,.28,20);rim.rotateX(Math.PI/2);rim.translate(0,-.13,0);shaft.translate(0,.24,0);
    for(const [geo,mat]of [[tube,metal],[rim,grit],[shaft,metal]]){craftTool.add(new T.Mesh(geo,mat));allGeometries.push(geo);}
    if(!craftLighting){craftLighting=true;scene.add(new T.AmbientLight(0xdfece5,1.7));const key=new T.DirectionalLight(0xffffff,3);key.position.set(-2,4,5);scene.add(key);}
   }
   if(craftTool&&b){const descent=progress<.65?progress/.65:Math.max(0,1-(progress-.65)/.35),n=new T.Vector3(...b.normal);craftTool.position.fromArray(b.point).sub(focusCenter).addScaledVector(n,.14-b.depth*descent);craftTool.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),n);craftTool.rotateY(progress*45);craftTool.visible=progress<.97;}
   render();
  },
  setMode(next,light=false){mode=next;hideCraftGhost();hoverPoint=null;probeOn=light;canvas.dataset.mode=next;canvas.style.cursor=next==='cut'?'crosshair':next==='light'?'crosshair':'grab';stroke=null;probePresent=false;schedule();},
  reset(){pose={yaw:-.28,pitch:.14,roll:0};a.view3d={...pose};applyPose();schedule();callbacks.onCommit?.();},
  beginCut,animateCut,
  reveal(info){if(disposed)return;Object.assign(a,info);for(const [old,cap]of [[skin,false],[jade,true]]){const next=materialFor(a,cap);for(const [key,value]of Object.entries(next.uniforms)){// Never Texture.copy onto a texture already registered with this renderer:
   // replacing its Source leaves WebGLTextures' reference counts inconsistent.
   if(key==='uProbeMap'||key==='uProbeCrackMap'||value.value?.isTexture)continue;
   if(old.uniforms[key]?.value?.copy)old.uniforms[key].value.copy(value.value);else old.uniforms[key]=value;}next.dispose();}render();},
  stats(){return {geometries:renderer.info.memory.geometries,calls:renderer.info.render.calls};},
  dispose(){if(disposed)return;disposed=true;ghost?.geometry.dispose();ghostMaterial.dispose();ghost?.removeFromParent();clearTimeout(probeTimer);probeTimer=0;probeSequence++;if(frame)cancelAnimationFrame(frame);for(const key of ['onpointerenter','onpointerleave','onpointerdown','onpointermove','onpointerup','onpointercancel','onlostpointercapture','onkeydown'])canvas[key]=null;for(const g of allGeometries)g.dispose();for(const m of allMaterials)m.dispose();shadowTexture.dispose();probeTexture.dispose();probeCrackTexture.dispose();crackFront.dispose();renderer.dispose();renderer.forceContextLoss();}
 };
}
function legacyPlane(a){const rad=a.cut.angle*Math.PI/180;return {normal:[Math.cos(rad),-Math.sin(rad),0],constant:-(a.cut.position-50)*.025};}

export function revalueUnsoldStone(a){
 if(a.stage!=='cut'||a.cut.pricingVersion===2)return false;
 const original=createRockGeometry(a),m=measureGeometry(original,a),assay={version:2,solidVolume:m.volume,jadeVolume:m.jade},measurements={};
 try{for(const p of ensureCutPieces(a)){const g=fragmentGeometry(original,p.path);measurements[p.id]=measureGeometry(g,a);g.dispose();}applyVolumeAssay(a,assay,measurements);}finally{original.dispose();}
 return true;
}
