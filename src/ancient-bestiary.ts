// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {ancientBaseAttack,ancientBaseHealth} from './ancient-gear.js';
import {ancientMobHealth,ancientMobDamageScale} from './ancient-mob-stats.js';
type Def={name:string;en:string;map:string;base:string;size:number;range:number;speed:number;boss:false;health:number;damage:number;xp:number;behavior:string;color:number};
export const BESTIARY:Record<string,Def>={
 bone_shield:{name:'骨盾卫士',en:'Bone-Shield Guard',map:'tribe',base:'hunter',size:1.2,range:3,speed:3.2,boss:false,health:1.25,damage:1,xp:1.15,behavior:'shield',color:0xe2c49b},
 wasteland_runner:{name:'荒原奔兽',en:'Wasteland Charger',map:'tribe',base:'grox',size:1.5,range:3,speed:4,boss:false,health:1.1,damage:1.1,xp:1.1,behavior:'charge',color:0xd09b62},
 totem_priest:{name:'图腾祭司',en:'Totem Priest',map:'tribe',base:'hunter',size:1.1,range:14,speed:3.2,boss:false,health:.9,damage:.8,xp:1.15,behavior:'totem',color:0xe2a95a},
 bone_javelin:{name:'骨矛投手',en:'Bone Javeliner',map:'tribe',base:'hunter',size:1.1,range:20,speed:4,boss:false,health:.95,damage:1,xp:1.1,behavior:'javelin',color:0xd8b584},
 branch_panther:{name:'枝跃猎豹',en:'Branchbound Panther',map:'forest',base:'mossling',size:1.4,range:3,speed:4.5,boss:false,health:1,damage:1.05,xp:1.1,behavior:'pounce',color:0x85ad69},
 parasite_bloom:{name:'寄生花妖',en:'Parasitic Bloom',map:'forest',base:'thorn',size:1.35,range:15,speed:2.3,boss:false,health:1.1,damage:.8,xp:1.15,behavior:'bloom',color:0xdd7bac},
 oath_cavalry:{name:'残誓骑兵',en:'Broken-Oath Cavalry',map:'city',base:'city_guard',size:1.6,range:3.5,speed:4.2,boss:false,health:1.4,damage:1.15,xp:1.2,behavior:'charge',color:0xb7a16c},
 chain_jailer:{name:'锁链狱卒',en:'Chain Jailer',map:'city',base:'city_guard',size:1.5,range:22,speed:3.3,boss:false,health:1.2,damage:.85,xp:1.15,behavior:'hook',color:0xc3aaa1},
 hollow_noble:{name:'空壳贵族',en:'Hollow Noble',map:'city',base:'city_acolyte',size:1.2,range:16,speed:3.1,boss:false,health:1.05,damage:1,xp:1.15,behavior:'illusion',color:0xa8adf4},
 noble_echo:{name:'贵族幻影',en:'Noble Echo',map:'city',base:'city_acolyte',size:1.2,range:12,speed:3.1,boss:false,health:.12,damage:.3,xp:0,behavior:'echo',color:0x647aac},
 brokenwing:{name:'断翼魔禽',en:'Brokenwing Fiend',map:'blight',base:'blight_stalker',size:1.7,range:3,speed:4.2,boss:false,health:1.05,damage:1.05,xp:1.1,behavior:'dive',color:0xbb86e8},
 shade_prowler:{name:'蚀影潜猎者',en:'Blightshade Prowler',map:'blight',base:'rift_maw',size:1.45,range:3,speed:4,boss:false,health:1.1,damage:1.05,xp:1.1,behavior:'shadow',color:0xa463c5},
 refract_twin:{name:'折光双生者',en:'Refracted Twin',map:'sanctum',base:'sanctum_sentinel',size:1.45,range:3.2,speed:3.8,boss:false,health:1,damage:1,xp:1.1,behavior:'twin',color:0x8be6e0},
 light_deacon:{name:'巡光执事',en:'Lightwarden Deacon',map:'sanctum',base:'mirror_wraith',size:1.35,range:22,speed:3,boss:false,health:1,damage:1,xp:1.1,behavior:'ring',color:0xffdf9c}
};
for(const [e,name,color]of [['metal','金',0xffd56b],['wood','木',0x71e391],['water','水',0x62ccff],['fire','火',0xff7058],['earth','土',0xdab078]] as const)BESTIARY['crystal_wisp_'+e]={name:'幼晶灵·'+name,en:e[0].toUpperCase()+e.slice(1)+' Crystal Wisp',map:'forest',base:'sentinel',size:1,range:16,speed:3.4,boss:false,health:.9,damage:.85,xp:1.05,behavior:'wisp',color};
BESTIARY.crystal_wisp_earth.range=6;
export function bestiaryHP(kind:string,l:number){const d=BESTIARY[kind];if(!d)return 0;const progress=Math.min(1,Math.max(0,(l-1)/69)),base=d.map==='blight'||d.map==='sanctum'?ancientBaseAttack(l)*12:ancientBaseAttack(l)*(8+4*progress);return kind==='noble_echo'?Math.round(base*d.health):ancientMobHealth(l,base*d.health)}
export function bestiaryDamage(kind:string,l:number){const d=BESTIARY[kind];return d?Math.max(20,Math.round(ancientBaseHealth(l)*(d.map==='blight'||d.map==='sanctum'?.07:.04+.025*Math.min(1,(l-1)/49))*d.damage*ancientMobDamageScale(l))):0}
// Stable replacement slots leave the majority of old quest monsters intact.
export function bestiarySlot(map:string,region:number,index:number){const i=index%(map==='tribe'?12:map==='forest'?10:map==='sanctum'?8:9);
 if(map==='tribe')return region===0?(i<2?'wasteland_runner':null):(['bone_shield','totem_priest','bone_javelin','wasteland_runner'][i]||null);
 if(map==='forest')return region===0?(i<2?'branch_panther':null):region===1?(['branch_panther','parasite_bloom'][i]||null):(['parasite_bloom','crystal_wisp_metal','crystal_wisp_wood','crystal_wisp_water','crystal_wisp_fire','crystal_wisp_earth'][i]||null);
 if(map==='city')return ['oath_cavalry','chain_jailer','hollow_noble','noble_echo','noble_echo'][i]||null;
 if(map==='blight')return ['brokenwing','shade_prowler'][i]||null;
 if(map==='sanctum')return ['refract_twin','refract_twin','light_deacon'][i]||null;
 return null;
}
export type BestiaryCast={id:string;started:number;hitAt:number;ends:number;ax:number;az:number;tx:number;tz:number;hit:string[];hookCheckedAt?:number};
export type BestiaryActor={id:string;kind:string;x:number;z:number;hp:number;maxHp:number;level:number;action:string;actionAt:number;attackAt:number;facing?:number;special?:BestiaryCast;recoverUntil?:number;buffUntil?:number;buffPower?:number;linked?:string;air?:number;step?:number;patron?:string;target?:string;respawnAt?:number};
type Victim={name:string;x:number;z:number;y:number;hp:number;hinderedUntil?:number};
type Ctx={now:number;dt:number;monsters:BestiaryActor[];victims:Victim[];ground:(x:number,z:number)=>number;clear:(ax:number,az:number,bx:number,bz:number)=>boolean;solid:(x:number,z:number)=>boolean;move:(m:BestiaryActor,x:number,z:number,amount:number)=>void;hit:(m:BestiaryActor,p:Victim,power:number)=>void;pull:(p:Victim,x:number,z:number)=>void;fx:(m:BestiaryActor,id:string,stage:string,areas:Record<string,number>[],started:number,hitAt:number,extra?:Record<string,unknown>)=>void};
export const BESTIARY_HOOK_WIDTH=1.4;
// The hook can only hit inside the visible flat-ended lane, at its current flight segment.
export function bestiaryHookContact(s:BestiaryCast,p:{x:number;z:number},now:number,dt:number){
 if(now<s.hitAt||now>s.ends+200)return false;
 const dx=s.tx-s.ax,dz=s.tz-s.az,len=Math.hypot(dx,dz);if(len<.001)return false;
 const along=((p.x-s.ax)*dx+(p.z-s.az)*dz)/len,side=Math.abs((p.x-s.ax)*dz-(p.z-s.az)*dx)/len;
 if(along<0||along>len||side>BESTIARY_HOOK_WIDTH/2)return false;
 const duration=Math.max(1,s.ends-s.hitAt),previous=Math.max(s.hitAt,s.hookCheckedAt??now-Math.min(.2,Math.max(0,dt))*1000),from=Math.min(1,Math.max(0,(previous-s.hitAt)/duration))*len,to=Math.min(1,Math.max(0,(now-s.hitAt)/duration))*len;
 return along>=from-.2&&along<=to+.2;
}
export function bestiaryIncoming(m:BestiaryActor,ax:number,az:number,now:number){const d=BESTIARY[m.kind];if(!d)return 1;if(d.behavior==='shield'&&!m.special&&(m.recoverUntil||0)<=now&&m.facing!==undefined){const dot=((ax-m.x)*Math.sin(m.facing)+(az-m.z)*Math.cos(m.facing))/(Math.hypot(ax-m.x,az-m.z)||1);if(dot>.45)return .35}return d.behavior==='twin'&&m.linked?.length? .75:1}
export function prepareBestiary(ms:BestiaryActor[],now:number,clear:Ctx['clear']){for(const m of ms){m.linked=undefined;if(m.hp<=0)continue;const behavior=BESTIARY[m.kind]?.behavior;if(behavior==='twin'){const other=ms.find(v=>v.id!==m.id&&v.kind==='refract_twin'&&v.hp>0&&Math.hypot(v.x-m.x,v.z-m.z)<10&&clear(m.x,m.z,v.x,v.z));if(other)m.linked=other.id}if(behavior==='totem')for(const v of ms)if(v!==m&&v.hp>0&&!['chief','lord'].includes(v.kind)&&!v.kind.includes('lord')&&Math.hypot(v.x-m.x,v.z-m.z)<9&&clear(m.x,m.z,v.x,v.z)){v.buffUntil=now+350;v.buffPower=1.2}}}
export function tickBestiary(m:BestiaryActor,target:Victim|undefined,c:Ctx){const d=BESTIARY[m.kind];if(!d)return false;const {now,dt}=c;if(m.hp<=0){delete m.special;delete m.linked;return true}if(now<(m.recoverUntil||0)){m.action='recover';m.air=0;return true}if(!target){delete m.special;m.air=d.behavior==='dive'?.7:0;return false}
 const dist=Math.hypot(target.x-m.x,target.z-m.z);if(!m.special)m.facing=Math.atan2(target.x-m.x,target.z-m.z);const canSee=c.clear(m.x,m.z,target.x,target.z);
 const areaHit=(x:number,z:number,r:number,power:number,low=false)=>{for(const p of c.victims)if(p.hp>0&&Math.hypot(p.x-x,p.z-z)<r&&(!low||p.y-c.ground(p.x,p.z)<2.2)&&c.clear(m.x,m.z,p.x,p.z))c.hit(m,p,power)};
 if(m.special){const s=m.special;m.facing=Math.atan2(s.tx-s.ax,s.tz-s.az);if(now<s.hitAt){m.action=s.id==='shadow'?'shadow':'windup';if(s.id==='shadow')c.move(m,target.x,target.z,dt*d.speed);return true}
  if(s.id==='shadow'){c.fx(m,'shadow','cancel',[],s.started,now);s.id='pounce';s.ax=m.x;s.az=m.z;s.tx=target.x;s.tz=target.z;s.started=now;s.hitAt=now+600;s.ends=now+2100;m.action='windup';m.actionAt=now;c.fx(m,'pounce','warning',[{x:m.x,z:m.z,radius:0,length:Math.hypot(s.tx-m.x,s.tz-m.z),width:2.5,angle:Math.atan2(s.tx-m.x,s.tz-m.z)}],s.started,s.hitAt,{tx:s.tx,tz:s.tz,ends:s.ends});return true}
  if(['charge','pounce','dive'].includes(s.id)){m.action=s.id==='dive'?'dive':'charge';m.air=s.id==='dive'?Math.max(0,.7*(1-(now-s.hitAt)/700)):0;const ox=m.x,oz=m.z,dx=s.tx-m.x,dz=s.tz-m.z,length=Math.hypot(dx,dz),step=Math.min(length,dt*(s.id==='charge'?14:12)),nx=m.x+dx/(length||1)*step,nz=m.z+dz/(length||1)*step;let wall=false;for(let v=.25;v<=step+.25;v+=.25){const f=Math.min(step,v)/(step||1);if(c.solid(m.x+(nx-m.x)*f,m.z+(nz-m.z)*f)){wall=true;break}}if(!wall){m.x=nx;m.z=nz}for(const p of c.victims){const vx=m.x-ox,vz=m.z-oz,t=Math.max(0,Math.min(1,((p.x-ox)*vx+(p.z-oz)*vz)/(vx*vx+vz*vz||1)));if(p.hp>0&&!s.hit.includes(p.name)&&Math.hypot(p.x-ox-vx*t,p.z-oz-vz*t)<2.6&&p.y-c.ground(p.x,p.z)<3&&c.clear(m.x,m.z,p.x,p.z)){s.hit.push(p.name);c.hit(m,p,1.25)}}if(wall||length<.6||now>s.ends){delete m.special;m.action='recover';m.actionAt=now;m.recoverUntil=now+(wall?1700:1000);m.air=0}return true}
  if(s.id==='hook'){
   m.action='attack';
   const hookY=c.ground(s.ax,s.az)+1.5;
   const victim=c.victims.filter(p=>p.hp>0&&bestiaryHookContact(s,p,now,dt)&&hookY>=p.y-1.7&&hookY<=p.y+.3&&c.clear(s.ax,s.az,p.x,p.z)).sort((a,b)=>Math.hypot(a.x-s.ax,a.z-s.az)-Math.hypot(b.x-s.ax,b.z-s.az))[0];
   s.hookCheckedAt=now;
   if(victim){c.hit(m,victim,1);const n=Math.hypot(m.x-victim.x,m.z-victim.z)||1;c.pull(victim,victim.x+(m.x-victim.x)/n*Math.max(0,Math.min(2,n-2)),victim.z+(m.z-victim.z)/n*Math.max(0,Math.min(2,n-2)));}
   if(victim||now>=s.ends){c.fx(m,s.id,'impact',[{x:victim?.x??s.tx,z:victim?.z??s.tz,radius:.2}],s.started,now);delete m.special;m.recoverUntil=now+450;}
   return true;
  }
  if(s.id==='javelin'||s.id==='bolt'){if(now<s.ends){m.action='attack';return true}for(const p of c.victims)if(p.hp>0&&Math.hypot(p.x-s.tx,p.z-s.tz)<1.25&&p.y-c.ground(p.x,p.z)<3&&c.clear(s.ax,s.az,p.x,p.z)){c.hit(m,p,m.kind==='crystal_wisp_metal'?1.15:1);if(m.kind==='crystal_wisp_water')p.hinderedUntil=now+1500;}c.fx(m,s.id,'impact',[{x:s.tx,z:s.tz,radius:1.2}],s.started,now);delete m.special;m.recoverUntil=now+450;
   if(d.behavior==='javelin'){const side=(m.step||0)%2?1:-1;c.move(m,m.x+Math.cos(m.facing||0)*side*4,m.z-Math.sin(m.facing||0)*side*4,3)}return true}
  if(s.id==='ring'){const radius=Math.min(18,2+(now-s.hitAt)/1000*5);for(const p of c.victims){const angle=Math.atan2(p.x-s.ax,p.z-s.az),gap=Math.abs(Math.atan2(Math.sin(angle-(m.facing||0)),Math.cos(angle-(m.facing||0))));if(p.hp>0&&!s.hit.includes(p.name)&&gap>.32&&Math.abs(Math.hypot(p.x-s.ax,p.z-s.az)-radius)<1.1&&p.y-c.ground(p.x,p.z)<2.4&&c.clear(s.ax,s.az,p.x,p.z)){s.hit.push(p.name);c.hit(m,p,1)}}if(now>s.ends){delete m.special;m.recoverUntil=now+700}return true}
  if(s.id==='bloom'||s.id==='totem'){for(const v of c.monsters)if(v.id!==m.id&&v.hp>0&&!['chief','lord','rootwarden','oathknight','emptyking','blight_lord','immaculate_judge','crystal_metal','crystal_wood','crystal_water','crystal_fire','crystal_earth'].includes(v.kind)&&Math.hypot(v.x-m.x,v.z-m.z)<9&&c.clear(m.x,m.z,v.x,v.z)){if(s.id==='bloom')v.hp=Math.min(v.maxHp,v.hp+Math.ceil(v.maxHp*.03))}areaHit(target.x,target.z,1.5,.8);c.fx(m,s.id,'impact',[{x:m.x,z:m.z,radius:9}],s.started,now)}else if(s.id==='flare')areaHit(s.tx,s.tz,3,1);else areaHit(m.x,m.z,d.range+.3,1,true);
  delete m.special;m.action='attack';m.actionAt=now;m.recoverUntil=now+500;return true;
 }
 const startRange=['charge','pounce','dive','shadow'].includes(d.behavior)?14:d.range;
 if(dist>startRange||!canSee){c.move(m,target.x,target.z,dt*d.speed);m.action='walk';m.air=d.behavior==='dive'?.7:0;return true}if(now<m.attackAt){m.action=d.behavior==='shield'?'guard':'idle';return true}
 let id=d.behavior==='shield'||d.behavior==='twin'?'melee':d.behavior==='charge'?'charge':d.behavior==='pounce'?'pounce':d.behavior==='dive'?'dive':d.behavior==='shadow'?'shadow':d.behavior==='hook'?'hook':d.behavior==='javelin'?'javelin':d.behavior==='ring'?'ring':d.behavior==='bloom'?'bloom':d.behavior==='totem'?'totem':'bolt';
 if(m.kind==='crystal_wisp_wood')id='bloom';if(m.kind==='crystal_wisp_fire')id='flare';if(m.kind==='crystal_wisp_earth')id='quake';
 if(d.behavior==='pounce'){const side=(m.step||0)%2?1:-1;c.move(m,m.x+Math.cos(m.facing||0)*side*2,m.z-Math.sin(m.facing||0)*side*2,1.5)}
 // Mobile attacks begin before reaching melee range; fixed destinations cannot track dodges.
 const windup=id==='hook'?850:id==='charge'?800:id==='pounce'||id==='dive'?650:id==='shadow'?1200:id==='ring'?900:600,angle=Math.atan2(target.x-m.x,target.z-m.z),len=Math.min(id==='hook'?22:16,dist),tx=m.x+Math.sin(angle)*len,tz=m.z+Math.cos(angle)*len;const travel=['hook','javelin','bolt'].includes(id)?Math.max(250,len/16*1000):id==='ring'?3300:1500;
 if(d.behavior==='illusion')for(const echo of c.monsters.filter(v=>v.patron===m.id&&v.hp<=0)){for(const [dx,dz]of [[-3,2],[3,-2],[-2,-3],[2,3]]){if(c.solid(m.x+dx,m.z+dz))continue;echo.x=m.x+dx;echo.z=m.z+dz;echo.hp=echo.maxHp;echo.target=target.name;echo.attackAt=now+600;echo.respawnAt=Number.MAX_SAFE_INTEGER;break}}
 m.special={id,started:now,hitAt:now+windup,ends:now+windup+travel,ax:m.x,az:m.z,tx,tz,hit:[]};m.attackAt=now+(id==='ring'?6000:id==='totem'||id==='bloom'?4000:3000);m.step=(m.step||0)+1;m.action=id==='shadow'?'shadow':'windup';m.actionAt=now;
 const areas=['charge','pounce','dive','shadow','hook','javelin','bolt'].includes(id)?[{x:m.x,z:m.z,radius:0,length:Math.max(1,len),width:id==='hook'?BESTIARY_HOOK_WIDTH:2.5,angle}]:[{x:id==='flare'?tx:m.x,z:id==='flare'?tz:m.z,radius:id==='ring'?18:id==='flare'?3:id==='bloom'||id==='totem'?9:d.range}];
 c.fx(m,id,'warning',areas,now,now+windup,{tx,tz,ends:m.special.ends,gap:angle});return true;
}
