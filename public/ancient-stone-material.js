// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as T from './three.module.js';
import {JADE_GRADES} from './ancient-stonework.js?v=20261021-jade-wear-1';
// Same fixed local-space coverage as the server's probe, not a flat green decal.
export function createJadeFaceMaterial(f){return new T.ShaderMaterial({side:T.DoubleSide,uniforms:{center:{value:new T.Vector3().fromArray(f.center)},radii:{value:new T.Vector3().fromArray(f.radii)},phase:{value:f.phase},grade:{value:f.grade},tint:{value:new T.Color(JADE_GRADES[f.grade].color)},colorDepth:{value:f.color},cracks:{value:f.cracks}},vertexShader:'varying vec3 localPoint;varying vec3 viewNormal;varying vec3 eye;void main(){localPoint=position;viewNormal=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);eye=-p.xyz;gl_Position=projectionMatrix*p;}',fragmentShader:`
 uniform vec3 center,radii,tint;uniform float phase,grade,colorDepth,cracks;varying vec3 localPoint,viewNormal,eye;
 void main(){vec3 p=localPoint,q=(p-center)/radii;float cloud=sin(p.x*5.+sin(p.y*4.)*2.+phase)*cos(p.z*5.+p.y*3.-phase);float coverage=clamp(1.3-dot(q,q)+cloud*.15,0.,1.)*step(.5,grade);vec3 color=mix(vec3(.39,.42,.34),tint*(.72+colorDepth*.28),coverage);float grain=sin(p.x*29.+sin(p.z*23.)+phase)*sin(p.y*31.+p.z*16.);color*=.92+grain*.065;float fracture=(1.-smoothstep(.01,.025+cracks*.02,abs(sin(p.x*8.+p.y*5.+sin(p.z*6.)+phase))))*cracks;color*=1.-fracture*.42;vec3 n=normalize(viewNormal);if(!gl_FrontFacing)n=-n;float light=max(dot(n,normalize(vec3(-.5,.7,1.))),0.);float sheen=pow(max(dot(reflect(-normalize(vec3(-.5,.7,1.)),n),normalize(eye)),0.),35.);color=color*(.6+light*.5)+sheen*coverage*(.06+grade*.025);gl_FragColor=vec4(color,1.);
 #include <colorspace_fragment>
 }`});}
